'use client';

import { useAuth } from '@/components/auth/AuthProvider';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login?redirect=/dashboard');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen xbot-gradient-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Dashboard yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Redirect işlemi devam ediyor
  }

  return <DashboardLayout />;
}