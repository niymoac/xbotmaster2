import { NextRequest } from "next/server";
import { requestMiddleware, validateRequestBody, getRequestIp } from "@/lib/api-utils";
import { createErrorResponse, createAuthResponse } from "@/lib/create-response";
import { generateToken, authCrudOperations } from "@/lib/auth";
import { generateRandomString, pbkdf2Hash, verifyHashString } from "@/lib/server-utils";
import { REFRESH_TOKEN_EXPIRE_TIME } from "@/constants/auth";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Geçerli bir e-posta adresi girin"),
  password: z.string().min(1, "Şifre boş olamaz"),
});

export const POST = requestMiddleware(async (request: NextRequest) => {
  try {
    const ip = getRequestIp(request);
    const userAgent = request.headers.get("user-agent") || "bilinmeyen";
    const body = await validateRequestBody(request);
    const validatedData = loginSchema.parse(body);

    const { usersCrud, sessionsCrud, refreshTokensCrud } = await authCrudOperations();
    
    // Kullanıcıyı e-posta ile bul
    const users = await usersCrud.findMany({ email: validatedData.email });
    const user = users?.[0];

    if (!user) {
      return createErrorResponse({
        errorMessage: "E-posta veya şifre hatalı",
        status: 401,
      });
    }

    // Şifre kontrolü
    const isValidPassword = await verifyHashString(
      validatedData.password,
      user.password
    );

    if (!isValidPassword) {
      return createErrorResponse({
        errorMessage: "E-posta veya şifre hatalı",
        status: 401,
      });
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

    return createAuthResponse({ accessToken, refreshToken });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return createErrorResponse({
        errorMessage: error.errors[0].message,
        status: 400,
      });
    }
    
    console.error('Giriş hatası:', error);
    return createErrorResponse({
      errorMessage: "Giriş başarısız. Lütfen daha sonra tekrar deneyin",
      status: 500,
    });
  }
}, false);