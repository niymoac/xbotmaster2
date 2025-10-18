import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { Toaster } from '@/components/ui/sonner';
import { WelcomeAnimation } from '@/components/welcome-animation';
import GlobalClientEffects from '@/components/GlobalClientEffects';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'XBotMaster - Profesyonel X Bot Otomasyon Platformu',
    template: '%s | XBotMaster',
  },
  description: 'Enterprise-grade X (Twitter) bot automation platformu. Transparent session management, akıllı retry workflow, detaylı monitoring ile X\'te otomatik işlemler yapın.',
  keywords: [
    'X bot',
    'Twitter bot', 
    'social media automation',
    'X automation',
    'bot platform',
    'XBotMaster',
    'sosyal medya otomasyonu',
    'X otomasyonu'
  ],
  authors: [{ name: 'XBotMaster Team', url: 'https://xbotmaster.com' }],
  creator: 'XBotMaster Team',
  publisher: 'XBotMaster',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://xbotmaster.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'XBotMaster - Profesyonel X Bot Otomasyon Platformu',
    description: 'Enterprise-grade X bot automation platformu. Güvenli session yönetimi, akıllı retry mekanizması ve detaylı monitoring.',
    url: 'https://xbotmaster.com',
    siteName: 'XBotMaster',
    locale: 'tr_TR',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'XBotMaster - X Bot Otomasyon Platformu',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'XBotMaster - Profesyonel X Bot Otomasyon Platformu',
    description: 'Enterprise-grade X bot automation platformu.',
    creator: '@xbotmaster',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/icon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/icon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180' },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
  colorScheme: 'dark light',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <head>
        <Script
          id="structured-data"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "XBotMaster",
              "description": "Profesyonel X (Twitter) Bot Otomasyon Platformu",
              "url": "https://xbotmaster.com",
              "applicationCategory": "BusinessApplication",
              "operatingSystem": "Web",
              "offers": {
                "@type": "Offer",
                "category": "Software"
              }
            })
          }}
        />
      </head>
      <body 
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}
        suppressHydrationWarning
      >
        <ThemeProvider 
          attribute="class" 
          defaultTheme="dark" 
          enableSystem={false}
          disableTransitionOnChange
        >
          <AuthProvider>
            <WelcomeAnimation />
            <GlobalClientEffects />
            <main className="relative">
              {children}
            </main>
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 5000,
                style: {
                  background: 'hsl(var(--card))',
                  color: 'hsl(var(--card-foreground))',
                  border: '1px solid hsl(var(--border))',
                },
              }}
            />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}