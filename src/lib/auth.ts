import { SignJWT, jwtVerify } from "jose";
import { AUTH_CODE, ACCESS_TOKEN_EXPIRE_TIME, CACHE_DURATION, DURATION_EXPIRE_TIME } from "@/constants/auth";
import { User } from "@/types/auth";
import CrudOperations from './crud-operations';
import { JWTPayload } from "./api-utils";

interface CachedAuthCrud {
  usersCrud: CrudOperations;
  sessionsCrud: CrudOperations;
  refreshTokensCrud: CrudOperations;
  userPasscodeCrud: CrudOperations;
  createdAt: number;
}

// JWT konfigürasyonu
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production'
);

let cachedAuthCrud: CachedAuthCrud | null = null;

/**
 * Sistem auth operasyonları için CRUD instance'ları
 * Auth olmayan operasyonlar için bu metod kullanılmamalı
 */
export async function authCrudOperations(): Promise<{
  usersCrud: CrudOperations;
  sessionsCrud: CrudOperations;
  refreshTokensCrud: CrudOperations;
  userPasscodeCrud: CrudOperations;
}> {
  const now = Date.now();
  
  if (!cachedAuthCrud || now - cachedAuthCrud.createdAt > CACHE_DURATION * 1000) {
    const adminUserToken = await generateAdminUserToken();

    cachedAuthCrud = {
      usersCrud: new CrudOperations("users", adminUserToken),
      sessionsCrud: new CrudOperations("sessions", adminUserToken),
      refreshTokensCrud: new CrudOperations("refresh_tokens", adminUserToken),
      userPasscodeCrud: new CrudOperations("user_passcode", adminUserToken),
      createdAt: now,
    };
  }
  
  return cachedAuthCrud;
}

/**
 * Admin token oluşturur
 */
export async function generateAdminUserToken(): Promise<string> {
  const adminRole = process.env.ADMIN_ROLE || 'admin';
  
  const adminUserToken = await generateToken({
    sub: "system",
    email: "system@xbotmaster.com",
    role: adminRole,
    isAdmin: true,
  }, DURATION_EXPIRE_TIME);

  return adminUserToken;
}

/**
 * Access token oluşturur
 */
export async function generateToken(
  user: User, 
  expiresIn: number = ACCESS_TOKEN_EXPIRE_TIME
): Promise<string> {
  try {
    const payload: Omit<JWTPayload, "iat" | "exp"> = {
      sub: user.sub.toString(),
      email: user.email,
      role: user.role,
      isAdmin: user.isAdmin || user.role === (process.env.ADMIN_ROLE || 'admin'),
    };

    const token = await new SignJWT(payload)
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime(`${expiresIn}s`)
      .sign(JWT_SECRET);

    return token;
  } catch (error) {
    console.error('Token oluşturma hatası:', error);
    throw new Error('Token oluşturulamadı');
  }
}

/**
 * JWT token doğrular
 */
export async function verifyToken(
  token?: string | null
): Promise<{ 
  valid: boolean; 
  code: string; 
  payload: JWTPayload | null 
}> {
  if (!token) {
    return {
      valid: false,
      code: AUTH_CODE.TOKEN_MISSING,
      payload: null,
    };
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET, {
      algorithms: ['HS256']
    });

    // Payload'ı JWTPayload tipine cast et
    const jwtPayload = payload as unknown as JWTPayload;

    // Ek doğrulamalar
    if (!jwtPayload.sub || !jwtPayload.email) {
      throw new Error('Token payload eksik');
    }

    return {
      valid: true,
      code: AUTH_CODE.SUCCESS,
      payload: jwtPayload,
    };
  } catch (error: any) {
    // Token süresi dolmuş
    if (error.code === "ERR_JWT_EXPIRED" || error.name === 'TokenExpiredError') {
      return { 
        valid: false, 
        code: AUTH_CODE.TOKEN_EXPIRED, 
        payload: null 
      };
    }
    
    // Diğer tüm durumlar geçersiz token olarak değerlendirilir
    console.warn('Token doğrulama hatası:', error.message);
    return { 
      valid: false, 
      code: AUTH_CODE.TOKEN_MISSING, 
      payload: null 
    };
  }
}

/**
 * Token'dan user bilgisini çıkarır (doğrulama yapmadan)
 */
export function decodeTokenPayload(token: string): JWTPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payload = JSON.parse(atob(parts[1]));
    return payload as JWTPayload;
  } catch {
    return null;
  }
}

/**
 * Token'ın süresinin dolup dolmadığını kontrol eder
 */
export function isTokenExpired(token: string): boolean {
  const payload = decodeTokenPayload(token);
  if (!payload || !payload.exp) return true;
  
  return Date.now() >= payload.exp * 1000;
}