import { requestMiddleware } from '@/lib/api-utils';
import { createSuccessResponse, createErrorResponse } from '@/lib/create-response';
import { authCrudOperations } from '@/lib/auth';

export const GET = requestMiddleware(async (request, params) => {
  try {
    if (!params.payload?.sub) {
      return createErrorResponse({
        errorMessage: 'Kullanıcı kimlik doğrulaması gerekli',
        status: 401,
      });
    }

    const { usersCrud } = await authCrudOperations();
    const user = await usersCrud.findById(params.payload.sub);

    if (!user) {
      return createErrorResponse({
        errorMessage: 'Kullanıcı bulunamadı',
        status: 404,
      });
    }

    const userResponse = {
      id: user.id,
      email: user.email,
      role: user.role,
      username: user.username || null,
      display_name: user.display_name || null,
      provider: user.provider || 'local',
      email_verified: !!user.email_verified_at,
      created_at: user.created_at,
      isAdmin: user.role === process.env.ADMIN_ROLE || user.role === 'admin',
    };

    return createSuccessResponse(userResponse);
    
  } catch (error) {
    console.error('Kullanıcı bilgileri alma hatası:', error);
    return createErrorResponse({
      errorMessage: 'Kullanıcı bilgileri alınamadı',
      status: 500,
    });
  }
}, true);