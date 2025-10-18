"use client";

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global hata:', error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
          <div className="text-center space-y-6 p-8">
            <div className="text-6xl">⚠️</div>
            <h1 className="text-4xl font-bold">Bir şeyler ters gitti</h1>
            <p className="text-gray-400 max-w-md">
              Beklenmeyen bir hata oluştu. Lütfen sayfayı yenilemeyi deneyin.
            </p>
            <div className="space-x-4">
              <button
                onClick={reset}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 rounded-lg font-semibold transition-all"
              >
                Tekrar Dene
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="px-6 py-3 border border-purple-500/20 hover:bg-purple-500/10 rounded-lg font-semibold transition-all"
              >
                Ana Sayfa
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}