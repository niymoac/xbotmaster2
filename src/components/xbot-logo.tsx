
'use client';

export function XBotLogo({ size = 'md', variant = 'full' }: { size?: 'sm' | 'md' | 'lg'; variant?: 'icon' | 'full' }) {
  const sizeMap = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  const textSizeMap = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl',
  };

  if (variant === 'icon') {
    return (
      <div className={`${sizeMap[size]} flex items-center justify-center`}>
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {/* Güçlü Kuş Maskotu */}
          <defs>
            <linearGradient id="birdGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#7C3AED" />
              <stop offset="50%" stopColor="#3B82F6" />
              <stop offset="100%" stopColor="#06B6D4" />
            </linearGradient>
          </defs>
          
          {/* Kuş Gövdesi */}
          <ellipse cx="50" cy="55" rx="25" ry="30" fill="url(#birdGradient)" />
          
          {/* Kuş Başı */}
          <circle cx="50" cy="30" r="18" fill="url(#birdGradient)" />
          
          {/* Kuş Gagası */}
          <polygon points="65,28 80,25 70,32" fill="#1F2937" />
          
          {/* Kuş Gözü */}
          <circle cx="58" cy="26" r="3" fill="#FFFFFF" />
          
          {/* Kanat */}
          <path d="M 35 50 Q 20 45 25 65 Q 30 60 35 65" fill="#3B82F6" opacity="0.8" />
          
          {/* Kas Göstergesi */}
          <rect x="40" y="50" width="20" height="25" fill="#06B6D4" opacity="0.6" rx="3" />
        </svg>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <div className={`${sizeMap[size]} flex items-center justify-center`}>
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <defs>
            <linearGradient id="birdGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#7C3AED" />
              <stop offset="50%" stopColor="#3B82F6" />
              <stop offset="100%" stopColor="#06B6D4" />
            </linearGradient>
          </defs>
          <ellipse cx="50" cy="55" rx="25" ry="30" fill="url(#birdGradient)" />
          <circle cx="50" cy="30" r="18" fill="url(#birdGradient)" />
          <polygon points="65,28 80,25 70,32" fill="#1F2937" />
          <circle cx="58" cy="26" r="3" fill="#FFFFFF" />
          <path d="M 35 50 Q 20 45 25 65 Q 30 60 35 65" fill="#3B82F6" opacity="0.8" />
          <rect x="40" y="50" width="20" height="25" fill="#06B6D4" opacity="0.6" rx="3" />
        </svg>
      </div>
      <span className={`${textSizeMap[size]} font-bold xbot-gradient-text`}>
        XBotMaster
      </span>
    </div>
  );
}
