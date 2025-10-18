import { requestMiddleware, validateRequestBody, parseQueryParams } from '@/lib/api-utils';
import { createSuccessResponse, createErrorResponse } from '@/lib/create-response';
import CrudOperations from '@/lib/crud-operations';
import { z } from 'zod';

const createJobSchema = z.object({
  account_id: z.string().min(1, 'Hesap ID gerekli'),
  job_type: z.enum(['follow', 'like', 'retweet', 'comment', 'dm'], {
    errorMap: () => ({ message: 'Geçersiz iş türü' })
  }),
  config: z.object({}).passthrough(), // JSON config
  device_id: z.string().optional(),
  retry_enabled: z.boolean().default(true),
});

// GET - Kullanıcının bot işlemlerini listele
export const GET = requestMiddleware(async (request, context) => {
  try {
    const { limit, offset, status } = parseQueryParams(request);
    const userId = context.payload?.sub;

    if (!userId) {
      return createErrorResponse({
        errorMessage: 'Kullanıcı kimliği bulunamadı',
        status: 401,
      });
    }

    const jobsCrud = new CrudOperations('bot_jobs', context.token);
    
    // Filtre koşulları
    const filters: Record<string, any> = { user_id: userId };
    if (status) {
      filters.status = status;
    }

    const jobs = await jobsCrud.findMany(
      filters,
      { 
        limit, 
        offset, 
        orderBy: { column: 'created_at', direction: 'desc' } 
      }
    );

    return createSuccessResponse(jobs);
    
  } catch (error) {
    console.error('Bot işlemleri GET hatası:', error);
    return createErrorResponse({
      errorMessage: error instanceof Error ? error.message : 'Bot işlemleri alınamadı',
      status: 500,
    });
  }
}, true);

// POST - Yeni bot işlemi oluştur
export const POST = requestMiddleware(async (request, context) => {
  try {
    const body = await validateRequestBody(request);
    const validatedData = createJobSchema.parse(body);
    const userId = context.payload?.sub;

    if (!userId) {
      return createErrorResponse({
        errorMessage: 'Kullanıcı kimliği bulunamadı',
        status: 401,
      });
    }

    // Aynı kullanıcının çalışan işi var mı kontrol et
    const jobsCrud = new CrudOperations('bot_jobs', context.token);
    const runningJobs = await jobsCrud.findMany({
      user_id: userId,
      status: 'running'
    }, { limit: 1 });

    if (runningJobs && runningJobs.length > 0) {
      return createErrorResponse({
        errorMessage: 'Zaten çalışan bir bot işleminiz var. Lütfen bekleyin.',
        status: 429,
      });
    }

    const newJob = await jobsCrud.create({
      user_id: userId,
      account_id: validatedData.account_id,
      job_type: validatedData.job_type,
      config: validatedData.config,
      status: 'pending',
      retry_enabled: validatedData.retry_enabled,
      device_id: validatedData.device_id,
      created_at: new Date().toISOString(),
    });

    return createSuccessResponse(newJob, 201);
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return createErrorResponse({
        errorMessage: error.errors[0].message,
        status: 400,
      });
    }
    
    console.error('Bot işlemi oluşturma hatası:', error);
    return createErrorResponse({
      errorMessage: error instanceof Error ? error.message : 'Bot işlemi oluşturulamadı',
      status: 500,
    });
  }
}, true);