import { NextRequest } from 'next/server';
import { requestMiddleware, validateRequestBody } from '@/lib/api-utils';
import { createErrorResponse, createSuccessResponse } from '@/lib/create-response';
import { hashString, verifyHashString } from '@/lib/server-utils';
import { z } from 'zod';
import { authCrudOperations } from '@/lib/auth';
import { userRegisterCallback } from '@/lib/user-register';

const registerSchema = z.object({
  email: z.string().email('Geçerli bir e-posta adresi girin'),
  password: z.string().min(6, 'Şifre en az 6 karakter olmalıdır'),
  passcode: z.string().length(6, 'Doğrulama kodu 6 haneli olmalıdır'),
});

/**
 * Kullanıcı Kayıt API'si
 * 
 * Bu endpoint sadece users tablosundaki temel kullanıcı verilerini (email, password vb.) kaydetmektedir.
 * Projenizde kullanıcı uzantı tablolarınız varsa (kullanıcı detayları tablosu, kullanıcı ayarları tablosu vb.)
 * lütfen userRegisterCallback methodunda ilgili uzantı tablo verilerini kaydetme mantığını implement ediniz.
 * 
 * @see /src/lib/user-register.ts - userRegisterCallback method implementation yeri
 */
export const POST = requestMiddleware(async (request: NextRequest) => {
  try {
    const body = await validateRequestBody(request);
    const validatedData = registerSchema.parse(body);

    const { usersCrud, userPasscodeCrud } = await authCrudOperations();

    // Kullanıcı zaten kayıtlı mı kontrol et
    const existingUser = await usersCrud.findMany({
      email: validatedData.email
    });

    if (existingUser && existingUser.length > 0) {
      return createErrorResponse({
        errorMessage: 'Bu e-posta adresi zaten kayıtlı',
        status: 409,
      });
    }

    // Doğrulama kodunu kontrol et
    const passObjectResult = await userPasscodeCrud.findMany({
      pass_object: validatedData.email
    }, {
      orderBy: {
        column: 'created_at',
        direction: 'desc'
      },
      limit: 1
    });

    const passcodeData = passObjectResult?.[0];

    if (!passcodeData || !passcodeData.passcode || passcodeData.revoked || 
        new Date(passcodeData.valid_until).getTime() <= new Date().getTime()) {
      return createErrorResponse({
        errorMessage: 'Geçersiz veya süresi dolmuş doğrulama kodu',
        status: 401,
      });
    }

    const isCodeValid = await verifyHashString(validatedData.passcode, passcodeData.passcode);
    if (!isCodeValid) {
      return createErrorResponse({
        errorMessage: 'Doğrulama kodu hatalı',
        status: 401,
      });
    }

    // Şifreyi hash'le ve kullanıcıyı oluştur
    const hashedPassword = await hashString(validatedData.password);
    const userData = {
      email: validatedData.email,
      password: hashedPassword,
      email_verified_at: new Date().toISOString(),
    };

    const user = await usersCrud.create(userData);

    // Kullanıcı kaydı sonrası özel işlemler
    await userRegisterCallback(user);

    // Kullanılan doğrulama kodunu iptal et
    await userPasscodeCrud.update(passcodeData.id, {
      revoked: true,
      used_at: new Date().toISOString(),
    });

    return createSuccessResponse({
      message: 'Kayıt başarıyla tamamlandı',
      user_id: user.id,
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return createErrorResponse({
        errorMessage: error.errors[0].message,
        status: 400,
      });
    }
    
    console.error('Kayıt hatası:', error);
    return createErrorResponse({
      errorMessage: 'Kayıt başarısız, lütfen daha sonra tekrar deneyin',
      status: 500,
    });
  }
}, false);