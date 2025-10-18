
import { requestMiddleware, validateRequestBody } from '@/lib/api-utils';
import { createSuccessResponse, createErrorResponse } from '@/lib/create-response';
import CrudOperations from '@/lib/crud-operations';

// POST - Admin retry başlat
export const POST = requestMiddleware(async (request, context) => {
  try {
    const body = await validateRequestBody(request);
    const adminId = context.payload?.sub;

    if (!adminId) {
      return createErrorResponse({
        errorMessage: 'Admin ID bulunamadı',
        status: 400,
      });
    }

    if (!body.user_id || !body.job_id || !body.failed_links) {
      return createErrorResponse({
        errorMessage: 'Gerekli alanlar eksik: user_id, job_id, failed_links',
        status: 400,
      });
    }

    // BOT_JOBS tablosunda running job kontrol et
    const jobsCrud = new CrudOperations('bot_jobs', context.token);
    const runningJob = await jobsCrud.findMany(
      { user_id: body.user_id, status: 'running' },
      { limit: 1 }
    );

    const retryQueueCrud = new CrudOperations('admin_retry_queue', context.token);

    if (runningJob && runningJob.length > 0) {
      // Running job varsa, retry queue'ya ekle (pending status)
      const retryQueueItem = await retryQueueCrud.create({
        admin_id: adminId,
        user_id: body.user_id,
        job_id: body.job_id,
        failed_links: body.failed_links,
        status: 'pending',
      });

      return createSuccessResponse({
        message: 'Başarısız linkler retry queue\'ya eklendi. İşlem bitiminde otomatik retry yapılacak.',
        retry_queue_id: retryQueueItem.id,
      }, 201);
    } else {
      // Running job yoksa, job status'u güncelle ve retry başlat
      await jobsCrud.update(body.job_id, {
        status: 'retrying',
        admin_retry_initiated_by: adminId,
        admin_retry_initiated_at: new Date().toISOString(),
      });

      const retryQueueItem = await retryQueueCrud.create({
        admin_id: adminId,
        user_id: body.user_id,
        job_id: body.job_id,
        failed_links: body.failed_links,
        status: 'processing',
        started_at: new Date().toISOString(),
      });

      return createSuccessResponse({
        message: 'Admin retry başlatıldı. Başarısız linkler işleniyor.',
        retry_queue_id: retryQueueItem.id,
      }, 201);
    }
  } catch (error) {
    console.error('Admin retry POST error:', error);
    return createErrorResponse({
      errorMessage: error instanceof Error ? error.message : 'Admin retry başlatılamadı',
      status: 500,
    });
  }
}, true);
