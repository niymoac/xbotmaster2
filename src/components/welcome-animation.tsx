
'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export function WelcomeAnimation() {
  const [isVisible, setIsVisible] = useState(true);
  const [hasShown, setHasShown] = useState(false);

  useEffect(() => {
    const hasSeenAnimation = localStorage.getItem('xbot-welcome-shown');
    if (hasSeenAnimation) {
      setIsVisible(false);
      return;
    }
    setHasShown(true);
  }, []);

  useEffect(() => {
    if (!isVisible || !hasShown) return;

    const timer = setTimeout(() => {
      setIsVisible(false);
      localStorage.setItem('xbot-welcome-shown', 'true');
    }, 4000);

    return () => clearTimeout(timer);
  }, [isVisible, hasShown]);

  if (!isVisible || !hasShown) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 z-50 flex items-center justify-center"
    >
      <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
        {/* Twitter Eski Kuş Logosu - Sağdan Giriş */}
        <motion.div
          initial={{ x: 300, opacity: 0 }}
          animate={{ x: 150, opacity: 1 }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="absolute"
        >
          <div className="text-8xl">🐦</div>
        </motion.div>

        {/* XBotMaster Güçlü Kuş Maskotu - Soldan Giriş */}
        <motion.div
          initial={{ x: -300, opacity: 0 }}
          animate={{ x: -150, opacity: 1 }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
          className="absolute"
        >
          <div className="text-8xl">💪</div>
        </motion.div>

        {/* Elon Maskı - Ortada, Kaçıyor */}
        <motion.div
          initial={{ scale: 1, opacity: 1, x: 0 }}
          animate={{ scale: 0.5, opacity: 0, x: 400 }}
          transition={{ duration: 1.5, ease: 'easeIn', delay: 0.8 }}
          className="absolute text-7xl"
        >
          🎭
        </motion.div>

        {/* Welcome Text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 2 }}
          className="absolute bottom-20 text-center"
        >
          <h1 className="text-5xl font-bold xbot-gradient-text mb-4">
            XBotMaster'a Hoş Geldiniz
          </h1>
          <p className="text-xl text-gray-300">
            Profesyonel X Bot Otomasyon Platformu
          </p>
        </motion.div>

        {/* Loading Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5 }}
          className="absolute bottom-10"
        >
          <div className="flex gap-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500"
              />
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
