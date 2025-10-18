import { Resend } from "resend";
import { NextRequest, NextResponse } from "next/server";
import { createErrorResponse } from "./create-response";
import { AUTH_CODE } from "@/constants/auth";
import { verifyToken } from "./auth";
import { User } from "@/types/auth";

export interface JWTPayload extends User {
  iat: number;
  exp: number;
}

export interface ApiParams {
  token: string;
  payload: JWTPayload | null;
}

/**
 * Cookie'leri request'ten çıkarır
 */
export function getCookies(request: NextRequest, names: string[]): string[] {
  const cookies = request.cookies.getAll();
  return names.map(name => {
    const cookie = cookies.find(c => c.name === name);
    return cookie?.value || '';
  }).filter(Boolean);
}

/**
 * PostgREST environment variable'larını doğrular
 */
export function validateEnv(): void {
  const requiredVars = [
    "DATABASE_URL",
    "POSTGREST_URL",
    "JWT_SECRET",
  ];
  
  const missing = requiredVars.filter((varName) => !process.env[varName]);

  if (missing.length > 0) {
    throw new Error(
      `Eksik environment variables: ${missing.join(", ")}`
    );
  }
}

/**
 * Query parametrelerini parse eder
 */
export function parseQueryParams(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  
  return {
    limit: Math.min(parseInt(searchParams.get("limit") || "10"), 100), // Max 100
    offset: Math.max(parseInt(searchParams.get("offset") || "0"), 0),
    id: searchParams.get("id"),
    search: searchParams.get("search"),
    status: searchParams.get("status"),
    type: searchParams.get("type"),
    sort: searchParams.get("sort"),
    order: searchParams.get("order") === 'asc' ? 'asc' : 'desc',
  };
}

/**
 * Request body'yi doğrular ve parse eder
 */
export async function validateRequestBody(request: NextRequest): Promise<any> {
  try {
    const contentType = request.headers.get('content-type');
    
    if (!contentType?.includes('application/json')) {
      throw new Error("Content-Type application/json olmalıdır");
    }

    const body = await request.json();

    if (!body || typeof body !== "object") {
      throw new Error("Geçersiz request body");
    }

    return body;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(`Geçersiz JSON formatı: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Token doğrulama middleware'i
 */
export function requestMiddleware(
  handler: (request: NextRequest, params: ApiParams) => Promise<Response>, 
  checkToken: boolean = true
) {
  return async (request: NextRequest): Promise<Response> => {
    try {
      // CORS preflight için OPTIONS request'leri handle et
      if (request.method === 'OPTIONS') {
        return new Response(null, {
          status: 200,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
        });
      }

      const params: any = {};
      
      if (checkToken) {
        const [token] = getCookies(request, ["auth-token"]);
        const { valid, code, payload } = await verifyToken(token);
        
        if (code === AUTH_CODE.TOKEN_EXPIRED) {
          return createErrorResponse({
            errorCode: AUTH_CODE.TOKEN_EXPIRED,
            errorMessage: "Token süresi dolmuş",
            status: 401,
          });
        } else if (code === AUTH_CODE.TOKEN_MISSING) {
          return createErrorResponse({
            errorCode: AUTH_CODE.TOKEN_MISSING,
            errorMessage: "Giriş gerekli",
            status: 401,
          });
        }
        
        if (!valid) {
          return createErrorResponse({
            errorCode: AUTH_CODE.TOKEN_MISSING,
            errorMessage: "Geçersiz token",
            status: 401,
          });
        }
        
        params.token = token;
        params.payload = payload;
      }

      return await handler(request, params);
      
    } catch (error) {
      console.error("Request middleware hatası:", error);
      return createErrorResponse({
        errorMessage: error instanceof Error ? error.message : "Sunucu hatası",
        status: 500,
      });
    }
  };
}

/**
 * Redirect response oluşturur
 */
export function responseRedirect(url: string, callbackUrl?: string) {
  const redirectUrl = new URL(url);
  if (callbackUrl) {
    redirectUrl.searchParams.set("redirect", callbackUrl);
  }
  return NextResponse.redirect(redirectUrl);
}

/**
 * Client IP adresini çıkarır
 */
export function getRequestIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    request.headers.get("cf-connecting-ip") || // Cloudflare
    request.headers.get("x-client-ip") ||
    request.ip ||
    "unknown"
  );
}

/**
 * Doğrulama e-postası gönderir
 */
export async function sendVerificationEmail(
  email: string,
  code: string,
  subject: string = "E-posta Doğrulama"
): Promise<boolean> {
  const appName = process.env.NEXT_PUBLIC_APP_NAME || 'XBotMaster';
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://xbotmaster.com';

  const htmlTemplate = `
  <!DOCTYPE html>
  <html lang="tr">
  <head>
    <meta charset="utf-8">
    <title>${subject}</title>
    <meta name="viewport" content="width=device-width,initial-scale=1">
  </head>
  <body style="margin:0;padding:0;background-color:#0f172a;">
    <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#0f172a;">
      <tr>
        <td align="center" style="padding:40px 20px;">
          <table width="600" border="0" cellpadding="0" cellspacing="0" role="presentation" style="max-width:600px;background: linear-gradient(135deg, #1e293b 0%, #7c3aed 50%, #06b6d4 100%);border-radius:16px;overflow:hidden;">
            <!-- Header -->
            <tr>
              <td align="center" style="padding:40px 24px;background-color:rgba(0,0,0,0.3);">
                <h1 style="margin:0;color:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:28px;font-weight:700;">
                  🚀 ${appName}
                </h1>
                <p style="margin:8px 0 0 0;color:#cbd5e1;font-size:16px;">${subject}</p>
              </td>
            </tr>
            
            <!-- Content -->
            <tr>
              <td align="center" style="padding:40px 24px;background-color:rgba(255,255,255,0.05);">
                <p style="margin:0 0 24px 0;color:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:16px;line-height:24px;">
                  ${appName} hesabınız için doğrulama kodunuz:
                </p>
                
                <!-- Verification Code -->
                <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="margin:0 auto 32px auto;">
                  <tr>
                    <td style="background: linear-gradient(135deg, #7c3aed, #06b6d4);border-radius:12px;padding:20px 40px;">
                      <span style="color:#ffffff;font-family:'Courier New',Courier,monospace;font-size:32px;font-weight:700;letter-spacing:8px;">${code}</span>
                    </td>
                  </tr>
                </table>
                
                <p style="margin:0 0 16px 0;color:#cbd5e1;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:14px;line-height:20px;">
                  Bu kod <strong>15 dakika</strong> geçerlidir.
                </p>
                
                <!-- Security Notice -->
                <div style="background-color:rgba(251,191,36,0.1);border-left:4px solid #f59e0b;border-radius:0 8px 8px 0;padding:16px;margin:24px 0;">
                  <p style="margin:0;color:#fbbf24;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:13px;line-height:18px;">
                    <strong>🔒 Güvenlik Uyarısı:</strong><br>
                    Bu kodu kimseyle paylaşmayın. ${appName} ekibi asla kodunuzu sormaz.
                  </p>
                </div>
              </td>
            </tr>
            
            <!-- Footer -->
            <tr>
              <td align="center" style="padding:24px;background-color:rgba(0,0,0,0.2);">
                <p style="margin:0;color:#64748b;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:12px;">
                  Bu e-postayı <strong>${appName}</strong> ekibi gönderdi.<br>
                  Yardıma mı ihtiyacınız var? <a href="mailto:support@xbotmaster.com" style="color:#06b6d4;">Destek ekibimize ulaşın</a>
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;

  try {
    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: `${appName} <noreply@xbotmaster.com>`,
        to: email,
        subject: `${subject} - ${appName}`,
        html: htmlTemplate,
      });
      return true;
    }

    // Fallback email service
    console.log(`E-posta gönderimi simüle edildi: ${email} - Kod: ${code}`);
    return true;
    
  } catch (error) {
    console.error('E-posta gönderim hatası:', error);
    return false;
  }
}

/**
 * Cookie ayarlar
 */
export function setCookie(
  response: Response,
  name: string,
  value: string,
  options: {
    path?: string;
    maxAge?: number;
    httpOnly?: boolean;
    secure?: boolean;
    sameSite?: 'Strict' | 'Lax' | 'None';
  } = {}
): void {
  const {
    path = "/",
    maxAge,
    httpOnly = true,
    secure = process.env.NODE_ENV === 'production',
    sameSite = 'Lax',
  } = options;

  let cookieValue = `${name}=${value}; Path=${path}`;
  
  if (httpOnly) cookieValue += '; HttpOnly';
  if (secure) cookieValue += '; Secure';
  if (maxAge !== undefined) cookieValue += `; Max-Age=${maxAge}`;
  
  cookieValue += `; SameSite=${sameSite}`;

  response.headers.append("Set-Cookie", cookieValue);
}

/**
 * Cookie temizler
 */
export function clearCookie(
  response: Response,
  name: string,
  path: string = "/"
): void {
  setCookie(response, name, "", { path, maxAge: 0 });
}