"use client";

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { XBotLogo } from '@/components/xbot-logo';
import { motion } from 'framer-motion';
import { RefreshCw, Home, AlertCircle } from 'lucide-react';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error('Sayfa hatası:', error);
  }, [error]);

  const handleGoHome = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen xbot-gradient-bg flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <XBotLogo size="lg" variant="full" />
          </div>

          {/* Error Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="flex justify-center"
          >
            <div className="p-4 rounded-full bg-red-500/20 border border-red-500/30">
              <AlertCircle className="w-12 h-12 text-red-400" />
            </div>
          </motion.div>

          {/* Error Message */}
          <div className="space-y-3">
            <h1 className="text-3xl font-bold text-white">
              Bir şeyler ters gitti
            </h1>
            <p className="text-gray-300 leading-relaxed">
              Beklenmeyen bir hata oluştu. Bu sorunu çözmek için sayfayı yenilemeyi 
              veya ana sayfaya dönmeyi deneyebilirsiniz.
            </p>
          </div>

          {/* Error Details (Development) */}
          {process.env.NODE_ENV === 'development' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-left"
            >
              <h3 className="text-red-400 font-semibold mb-2">Hata Detayları:</h3>
              <code className="text-sm text-red-300 font-mono break-all">
                {error.message}
              </code>
              {error.digest && (
                <p className="text-xs text-red-400 mt-2">
                  Hata ID: {error.digest}
                </p>
              )}
            </motion.div>
          )}

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-3 pt-4"
          >
            <Button
              onClick={reset}
              className="flex-1 btn-gradient"
              size="lg"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Tekrar Dene
            </Button>
            
            <Button
              onClick={handleGoHome}
              variant="outline"
              className="flex-1 border-purple-500/30 text-purple-300 hover:bg-purple-500/10"
              size="lg"
            >
              <Home className="w-4 h-4 mr-2" />
              Ana Sayfa
            </Button>
          </motion.div>

          {/* Support Link */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-sm text-gray-400"
          >
            Sorun devam ediyorsa{' '}
            <a 
              href="mailto:support@xbotmaster.com"
              className="text-purple-400 hover:text-purple-300 underline"
            >
              destek ekibiyle iletişime geçin
            </a>
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}