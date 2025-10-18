import { NextRequest } from 'next/server';
import { requestMiddleware, validateRequestBody, sendVerificationEmail } from '@/lib/api-utils';
import { createSuccessResponse, createErrorResponse } from '@/lib/create-response';
import { generateVerificationCode, hashString } from '@/lib/server-utils';
import { authCrudOperations } from '@/lib/auth';
import { z } from 'zod';

const sendVerificationSchema = z.object({
  email: z.string().email('Geçerli bir e-posta adresi girin'),
  type: z.enum(['register', 'reset-password'], {
    errorMap: () => ({ message: 'Tip sadece register veya reset-password olabilir' })
  }),
});

export const POST = requestMiddleware(async (request: NextRequest) => {
  try {
    const body = await validateRequestBody(request);
    const validatedData = sendVerificationSchema.parse(body);

    const { usersCrud, userPasscodeCrud } = await authCrudOperations();

    // Kayıt için: kullanıcı zaten varsa hata
    if (validatedData.type === 'register') {
      const existingUsers = await usersCrud.findMany({ email: validatedData.email });
      if (existingUsers && existingUsers.length > 0) {
        return createErrorResponse({
          errorMessage: 'Bu e-posta adresi zaten kayıtlı',
          status: 409,
        });
      }
    }

    // Şifre sıfırlama için: kullanıcı yoksa hata
    if (validatedData.type === 'reset-password') {
      const existingUsers = await usersCrud.findMany({ email: validatedData.email });
      if (!existingUsers || existingUsers.length === 0) {
        return createErrorResponse({
          errorMessage: 'Bu e-posta adresi kayıtlı değil',
          status: 404,
        });
      }
    }

    // Önceki aktif kodları iptal et
    const previousCodes = await userPasscodeCrud.findMany({
      pass_object: validatedData.email,
      revoked: false,
    });

    for (const prevCode of previousCodes) {
      await userPasscodeCrud.update(prevCode.id, { 
        revoked: true,
        revoked_reason: 'new_code_requested'
      });
    }

    // Yeni doğrulama kodu oluştur
    const code = generateVerificationCode();
    const hashedCode = await hashString(code);
    const validUntil = new Date();
    validUntil.setMinutes(validUntil.getMinutes() + 15); // 15 dakika geçerli

    await userPasscodeCrud.create({
      pass_object: validatedData.email,
      passcode: hashedCode,
      valid_until: validUntil.toISOString(),
      passcode_type: validatedData.type,
    });

    // E-posta gönder
    const emailSent = await sendVerificationEmail(
      validatedData.email, 
      code,
      validatedData.type === 'register' ? 'Kayıt Doğrulama' : 'Şifre Sıfırlama'
    );

    if (!emailSent) {
      return createErrorResponse({
        errorMessage: 'E-posta gönderilemedi. Lütfen daha sonra tekrar deneyin',
        status: 500,
      });
    }

    return createSuccessResponse({
      message: 'Doğrulama kodu e-posta adresinize gönderildi',
      expires_in: 15 * 60, // 15 dakika (saniye)
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return createErrorResponse({
        errorMessage: error.errors[0].message,
        status: 400,
      });
    }
    
    console.error('Doğrulama kodu gönderme hatası:', error);
    return createErrorResponse({
      errorMessage: 'E-posta gönderilemedi. Lütfen daha sonra tekrar deneyin',
      status: 500,
    });
  }
}, false);