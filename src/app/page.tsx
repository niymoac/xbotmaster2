'use client';

import { useAuth } from '@/components/auth/AuthProvider';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { LandingPage } from '@/components/landing/landing-page';
import { motion } from 'framer-motion';

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center"
      >
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="rounded-full h-16 w-16 border-b-2 border-purple-500 mx-auto mb-4"
        />
        <motion.p 
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-gray-300 text-lg font-medium"
        >
          Yükleniyor...
        </motion.p>
      </motion.div>
    </div>
  );
}

export default function Home() {
  const { user, isLoading } = useAuth();

  // Loading durumu
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Giriş yapmış kullanıcı dashboard'ı görsün
  if (user) {
    return <DashboardLayout />;
  }

  // Giriş yapmamış ziyaretçi landing page'i görsün
  return <LandingPage />;
}