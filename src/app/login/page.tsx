'use client';

import React, { Suspense, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { XLoginButton } from '@/components/auth/x-login-button';
import { motion } from 'framer-motion';
import { XBotLogo } from '@/components/xbot-logo';
import { Shield, Zap, CheckCircle } from 'lucide-react';

function LoginPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    // Kullanıcı zaten giriş yapmışsa redirect et
    if (user && !isLoading) {
      const redirectTo = searchParams.get('redirect') || '/dashboard';
      router.replace(redirectTo);
    }
  }, [user, isLoading, router, searchParams]);

  const handleSuccess = () => {
    const redirectTo = searchParams.get('redirect') || '/dashboard';
    router.replace(redirectTo);
  };

  // Loading durumu
  if (isLoading) {
    return (
      <div className="min-h-screen xbot-gradient-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  // Kullanıcı zaten giriş yapmışsa loading göster
  if (user) {
    return (
      <div className="min-h-screen xbot-gradient-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Yönlendiriliyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex justify-center items-center min-h-screen overflow-hidden xbot-gradient-bg">
      {/* Background Effects */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.9) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />
      
      {/* Gradient Orbs */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -left-24 h-[42rem] w-[42rem] rounded-full blur-3xl"
        style={{
          background: 'radial-gradient(closest-side, rgba(124,58,237,0.35), rgba(124,58,237,0))',
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 -right-24 h-[36rem] w-[36rem] rounded-full blur-3xl"
        style={{
          background: 'radial-gradient(closest-side, rgba(6,182,212,0.32), rgba(6,182,212,0))',
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[28rem] w-[28rem] rounded-full blur-3xl"
        style={{
          background: 'radial-gradient(closest-side, rgba(168,85,247,0.22), rgba(168,85,247,0))',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 text-center max-w-md w-full mx-4"
      >
        {/* Logo */}
        <motion.div 
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="mb-8 flex justify-center"
        >
          <XBotLogo size="lg" variant="full" />
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-6"
        >
          <h1 className="text-4xl font-bold mb-3 xbot-gradient-text">
            X ile Giriş Yap
          </h1>
          <p className="text-gray-300 text-lg">
            XBotMaster'a X.com hesabınız ile güvenli giriş yapın
          </p>
        </motion.div>

        {/* Login Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="card-glass p-8 mb-6"
        >
          <XLoginButton size="lg" />
          
          {/* Features */}
          <div className="mt-6 space-y-3 text-sm">
            <div className="flex items-center gap-3 text-gray-300">
              <Shield className="w-4 h-4 text-green-400" />
              <span>Güvenli OAuth 2.0 bağlantısı</span>
            </div>
            <div className="flex items-center gap-3 text-gray-300">
              <Zap className="w-4 h-4 text-blue-400" />
              <span>Anında bot operasyonları</span>
            </div>
            <div className="flex items-center gap-3 text-gray-300">
              <CheckCircle className="w-4 h-4 text-purple-400" />
              <span>Şifre saklama gerektirmez</span>
            </div>
          </div>
        </motion.div>

        {/* Security Notice */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg mb-6"
        >
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
            <div className="text-left">
              <h3 className="font-semibold text-purple-300 mb-1">
                Gizlilik Koruması
              </h3>
              <p className="text-sm text-gray-300">
                X hesap bilgileriniz hiçbir zaman kaydedilmez. 
                Sadece gerekli bot operasyonları için erişim izni alınır.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Terms */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-gray-400 text-sm leading-relaxed"
        >
          Giriş yaparak{' '}
          <a 
            href="/terms" 
            className="text-purple-400 hover:text-purple-300 underline"
          >
            Kullanım Şartları
          </a>{' '}
          ve{' '}
          <a 
            href="/privacy" 
            className="text-purple-400 hover:text-purple-300 underline"
          >
            Gizlilik Politikası
          </a>
          'nı kabul etmiş olursunuz.
        </motion.p>

        {/* Back to Home */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-8"
        >
          <button
            onClick={() => router.push('/')}
            className="text-gray-400 hover:text-gray-300 text-sm underline transition-colors"
          >
            Ana sayfaya dön
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen xbot-gradient-bg flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <LoginPageContent />
    </Suspense>
  );
}