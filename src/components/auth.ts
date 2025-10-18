// Token süreleri (saniye)
export const ACCESS_TOKEN_EXPIRE_TIME = 30 * 60; // 30 dakika
export const REFRESH_TOKEN_EXPIRE_TIME = 30 * 24 * 60 * 60; // 30 gün
export const CACHE_DURATION = 25 * 60; // 25 dakika
export const DURATION_EXPIRE_TIME = 30 * 60; // 30 dakika

// Auth kodları
export const AUTH_CODE = {
  SUCCESS: 'SUCCESS',
  TOKEN_MISSING: 'TOKEN_MISSING',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  REFRESH_TOKEN_MISSING: 'REFRESH_TOKEN_MISSING',
  REFRESH_TOKEN_EXPIRED: 'REFRESH_TOKEN_EXPIRED',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  EMAIL_NOT_VERIFIED: 'EMAIL_NOT_VERIFIED',
} as const;

// Bot işlem türleri
export const BOT_JOB_TYPES = {
  LIKE_POSTS: 'like_posts',
  FOLLOW_USERS: 'follow_users',
  AI_COMMENT: 'ai_comment',
  MUTUAL_FOLLOW_REPORT: 'mutual_follow_report',
  LIKE_COMMENTS: 'like_comments',
  AI_REPLY_COMMENTS: 'ai_reply_comments',
} as const;

// Bot işlem durumları
export const BOT_JOB_STATUS = {
  PENDING: 'pending',
  RUNNING: 'running',
  COMPLETED: 'completed',
  FAILED: 'failed',
  RETRYING: 'retrying',
  CANCELLED: 'cancelled',
} as const;

// Uygulama sabitleri
export const APP_CONFIG = {
  MAX_RETRY_ATTEMPTS: 3,
  RETRY_DELAY_MINUTES: 2,
  LOG_RETENTION_DAYS: 60,
  SESSION_DURATION_DAYS: 180,
  MAX_DAILY_CREDITS: 500,
  PAGINATION_LIMIT: 10,
} as const;

export type AuthCode = typeof AUTH_CODE[keyof typeof AUTH_CODE];
export type BotJobType = typeof BOT_JOB_TYPES[keyof typeof BOT_JOB_TYPES];
export type BotJobStatus = typeof BOT_JOB_STATUS[keyof typeof BOT_JOB_STATUS];