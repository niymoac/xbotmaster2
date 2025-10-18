
import { requestMiddleware, parseQueryParams } from '@/lib/api-utils';
import { createSuccessResponse, createErrorResponse } from '@/lib/create-response';
import CrudOperations from '@/lib/crud-operations';

// GET - Kullanıcının cihazlarını listele
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

    const devicesCrud = new CrudOperations('device_tracking', context.token);
    const devices = await devicesCrud.findMany(
      { user_id: userId },
      { limit, offset, orderBy: { column: 'last_activity', direction: 'desc' } }
    );

    return createSuccessResponse(devices);
  } catch (error) {
    console.error('Devices GET error:', error);
    return createErrorResponse({
      errorMessage: error instanceof Error ? error.message : 'Cihazlar alınamadı',
      status: 500,
    });
  }
}, true);
