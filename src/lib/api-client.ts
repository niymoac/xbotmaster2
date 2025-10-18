import { AUTH_CODE } from '@/constants/auth';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errorMessage?: string;
  errorCode?: string;
}

export class ApiError extends Error {
  constructor(
    public status: number, 
    public errorMessage: string, 
    public errorCode?: string
  ) {
    super(errorMessage);
    this.name = 'ApiError';
  }
}

let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

async function refreshToken(): Promise<boolean> {
  try {
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      console.warn('Token refresh başarısız:', response.status);
      return false;
    }

    const result: ApiResponse = await response.json();
    
    if (result.success) {
      console.log('Token başarıyla yenilendi');
      return true;
    }
    
    console.warn('Token refresh yanıtı başarısız:', result.errorMessage);
    return false;
  } catch (error) {
    console.error('Token refresh hatası:', error);
    return false;
  }
}

function redirectToLogin() {
  if (typeof window !== 'undefined') {
    const currentPath = window.location.pathname;
    
    // Zaten login sayfasındaysak redirect yapma
    if (currentPath === '/login' || currentPath === '/login/') {
      return;
    }
    
    const loginUrl = `/login?redirect=${encodeURIComponent(currentPath)}`;
    window.location.href = loginUrl;
  }
}

async function apiRequest<T = any>(
  endpoint: string,
  options?: RequestInit,
  isRetry = false
): Promise<T> {
  try {
    const response = await fetch(`/api${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      credentials: 'include',
      ...options,
    });

    const result: ApiResponse<T> = await response.json();

    // Başarılı yanıt
    if (response.ok && result.success) {
      return result.data as T;
    }

    // Session olmayan ziyaretçi durumu
    if (response.status === 401 && result.errorCode === AUTH_CODE.TOKEN_MISSING) {
      return null as T;
    }

    // Token süresi dolmuş - refresh dene
    if (response.status === 401 && 
        result.errorCode === AUTH_CODE.TOKEN_EXPIRED && 
        !isRetry) {
      
      // Eğer zaten refresh işlemi devam ediyorsa bekle
      if (isRefreshing && refreshPromise) {
        const refreshSuccess = await refreshPromise;
        if (refreshSuccess) {
          return apiRequest<T>(endpoint, options, true);
        } else {
          redirectToLogin();
          throw new ApiError(401, 'Oturum süresi doldu', AUTH_CODE.TOKEN_EXPIRED);
        }
      }

      // Yeni refresh işlemi başlat
      if (!isRefreshing) {
        isRefreshing = true;
        refreshPromise = refreshToken();
        
        try {
          const refreshSuccess = await refreshPromise;
          
          if (refreshSuccess) {
            return apiRequest<T>(endpoint, options, true);
          } else {
            redirectToLogin();
            throw new ApiError(401, 'Oturum süresi doldu', AUTH_CODE.TOKEN_EXPIRED);
          }
        } finally {
          isRefreshing = false;
          refreshPromise = null;
        }
      }
    }

    // Diğer API hataları
    throw new ApiError(
      response.status, 
      result.errorMessage || 'Bilinmeyen hata oluştu', 
      result.errorCode
    );

  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    console.error('API request hatası:', error);
    throw new ApiError(500, 'Ağ hatası veya geçersiz yanıt');
  }
}

export const api = {
  get: <T = any>(endpoint: string, params?: Record<string, string>) => {
    const url = params 
      ? `${endpoint}?${new URLSearchParams(params).toString()}`
      : endpoint;
    return apiRequest<T>(url, { method: 'GET' });
  },

  post: <T = any>(endpoint: string, data?: any) =>
    apiRequest<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }),

  put: <T = any>(endpoint: string, data?: any) =>
    apiRequest<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }),

  patch: <T = any>(endpoint: string, data?: any) =>
    apiRequest<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    }),

  delete: <T = any>(endpoint: string) =>
    apiRequest<T>(endpoint, { method: 'DELETE' }),
};

export type { ApiResponse };