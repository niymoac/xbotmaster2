
import { requestMiddleware, validateRequestBody, parseQueryParams } from '@/lib/api-utils';
import { createSuccessResponse, createErrorResponse } from '@/lib/create-response';
import CrudOperations from '@/lib/crud-operations';

// GET - Başarısız linkler listesi
export const GET = requestMiddleware(async (request, context) => {
  try {
    const { limit, offset } = parseQueryParams(request);
    const userId = context.payload?.sub;

    if (!userId) {
      return createErrorResponse({
        errorMessage: 'Kullanıcı ID bulunamadı',
        status: 400,
      });
    }

    const failedLinksCrud = new CrudOperations('failed_links', context.token);
    const failedLinks = await failedLinksCrud.findMany(
      { user_id: userId, admin_retry_requested: false },
      { limit, offset, orderBy: { column: 'created_at', direction: 'desc' } }
    );

    return createSuccessResponse(failedLinks);
  } catch (error) {
    console.error('Failed links GET error:', error);
    return createErrorResponse({
      errorMessage: error instanceof Error ? error.message : 'Başarısız linkler alınamadı',
      status: 500,
    });
  }
}, true);
