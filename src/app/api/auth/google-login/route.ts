import { NextRequest } from "next/server";
import { requestMiddleware, responseRedirect, getRequestIp } from "@/lib/api-utils";
import { createErrorResponse, createAuthResponse } from "@/lib/create-response";
import { generateToken, authCrudOperations } from "@/lib/auth";
import { generateRandomString, pbkdf2Hash } from "@/lib/server-utils";
import { REFRESH_TOKEN_EXPIRE_TIME } from "@/constants/auth";
import { userRegisterCallback } from "@/lib/user-register";

export const GET = requestMiddleware(async (request: NextRequest) => {
  try {
    const ip = getRequestIp(request);
    const userAgent = request.headers.get("user-agent") || "bilinmeyen";
    const searchParams = request.nextUrl.searchParams;
    const googleAccessToken = searchParams.get('access_token');
    const callbackUrl = searchParams.get('callback_url') || request.url;
    
    const loginUrl = new URL('/login', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').href;
    const homeUrl = new URL('/', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').href;

    if (!googleAccessToken) {
      console.error('Google access token bulunamadı');
      return responseRedirect(loginUrl);
    }

    // Google API'den kullanıcı bilgilerini al
    const googleUserResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${googleAccessToken}`
      }
    });

    if (!googleUserResponse.ok) {
      console.error('Google kullanıcı bilgileri alınamadı:', await googleUserResponse.text());
      return responseRedirect(loginUrl);
    }

    const googleUserData = await googleUserResponse.json();
    const userEmail = googleUserData.email;

    if (!userEmail) {
      console.error('Google kullanıcı e-postası bulunamadı');
      return responseRedirect(loginUrl);
    }

    const { usersCrud, sessionsCrud, refreshTokensCrud } = await authCrudOperations();
    
    // E-posta ile kullanıcıyı bul veya oluştur
    const users = await usersCrud.findMany({ email: userEmail });
    let user = users?.[0];

    if (!user) {
      const userData = {
        email: userEmail,
        password: 'GOOGLE-AUTH',
        provider: 'google',
        provider_id: googleUserData.id,
      };
      user = await usersCrud.create(userData);
      
      // Kullanıcı kaydı sonrası özel işlemler
      await userRegisterCallback(user);
    }

    // JWT token oluştur
    const accessToken = await generateToken({
      sub: user.id,
      role: user.role,
      email: user.email,
    });

    const refreshToken = await generateRandomString();
    const hashedRefreshToken = await pbkdf2Hash(refreshToken);

    // Session oluştur
    const sessionData = {
      user_id: user.id,
      ip: ip,
      user_agent: userAgent,
    };
    const session = await sessionsCrud.create(sessionData);

    // Refresh token kaydet
    const refreshTokenData = {
      user_id: user.id,
      session_id: session.id,
      token: hashedRefreshToken,
      expires_at: new Date(
        Date.now() + REFRESH_TOKEN_EXPIRE_TIME * 1000
      ).toISOString(),
    };
    await refreshTokensCrud.create(refreshTokenData);

    return createAuthResponse({ accessToken, refreshToken }, homeUrl);
    
  } catch (error) {
    console.error('Google giriş hatası:', error);
    return createErrorResponse({
      errorMessage: "Google ile giriş başarısız. Lütfen daha sonra tekrar deneyin",
      status: 500,
    });
  }
}, false);