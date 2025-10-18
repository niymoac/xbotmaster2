import { requestMiddleware, parseQueryParams } from '@/lib/api-utils';
import { createSuccessResponse, createErrorResponse } from '@/lib/create-response';
import CrudOperations from '@/lib/crud-operations';

// GET - Aktivite loglarını listele
export const GET = requestMiddleware(async (request, context) => {
  try {
    const { limit, offset } = parseQueryParams(request);
    const userId = context.payload?.sub;
    
    if (!userId) {
      return createErrorResponse({
        errorMessage: 'Kullanıcı kimliği bulunamadı',
        status: 401,
      });
    }

    const logsCrud = new CrudOperations('activity_logs', context.token);
    const logs = await logsCrud.findMany(
      { user_id: userId },
      { 
        limit, 
        offset, 
        orderBy: { column: 'created_at', direction: 'desc' } 
      }
    );

    return createSuccessResponse(logs);
  } catch (error) {
    console.error('Aktivite logları GET hatası:', error);
    return createErrorResponse({
      errorMessage: error instanceof Error ? error.message : 'Loglar alınamadı',
      status: 500,
    });
  }
}, true);