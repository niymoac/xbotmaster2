import { NextRequest } from "next/server";
import { requestMiddleware } from "@/lib/api-utils";
import { authCrudOperations } from "@/lib/auth";
import { pbkdf2Hash } from "@/lib/server-utils";
import { createLogoutResponse, createSuccessResponse } from '@/lib/create-response';

export const POST = requestMiddleware(async (request: NextRequest, params: {
  token: string, 
  user_id?: string | null, 
  payload?: any
}) => {
  try {
    const { refreshTokensCrud, sessionsCrud } = await authCrudOperations();
    
    if (params.payload?.sub) {
      const refreshToken = request.cookies.get("refresh-token")?.value;
      
      if (refreshToken) {
        const hashedRefreshToken = await pbkdf2Hash(refreshToken);
        const refreshTokenRecords = await refreshTokensCrud.findMany({
          token: hashedRefreshToken,
          revoked: false,
        });

        if (refreshTokenRecords && refreshTokenRecords.length > 0) {
          // Tüm refresh token'ları iptal et
          for (const record of refreshTokenRecords) {
            await refreshTokensCrud.update(record.id, { 
              revoked: true,
              revoked_at: new Date().toISOString()
            });
          }

          // İlgili session'ı güncelle
          if (refreshTokenRecords[0].session_id) {
            await sessionsCrud.update(refreshTokenRecords[0].session_id, {
              ended_at: new Date().toISOString(),
              status: 'ended'
            });
          }
        }
      }
    }

    return createLogoutResponse();
    
  } catch (error) {
    console.error('Çıkış hatası:', error);
    // Hata olsa bile çıkış yanıtı döndür
    return createLogoutResponse();
  }
}, false);