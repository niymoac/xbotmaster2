
'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { XBotLogo } from '@/components/xbot-logo';
import { ArrowRight, Zap, Shield, BarChart3, Smartphone, Cpu, Rocket, Chrome } from 'lucide-react';
import { XLoginButton } from '@/components/auth/x-login-button';

export function LandingPage() {
  const features = [
    {
      icon: Zap,
      title: 'Hızlı Bot İşlemleri',
      description: 'Gerçek zamanlı beğeni, takip, yorum ve AI yanıtları',
    },
    {
      icon: Shield,
      title: 'Güvenli Session Yönetimi',
      description: 'Transparent refresh ile kesintisiz işlem',
    },
    {
      icon: BarChart3,
      title: 'Detaylı Monitoring',
      description: '60 gün log retention, hata pattern detection',
    },
    {
      icon: Smartphone,
      title: 'Multi-Device Kontrol',
      description: 'Birden fazla cihazdan eşzamanlı işlem',
    },
    {
      icon: Cpu,
      title: 'Akıllı Retry Mekanizması',
      description: '3x retry, 2 dakika aralık, admin workflow',
    },
    {
      icon: Rocket,
      title: 'Telegram Entegrasyonu',
      description: 'Dual mode: admin channels + user credentials',
    },
  ];

  const pricingPlans = [
    {
      name: 'BASIC',
      price: '$29',
      period: '/ay',
      description: 'Başlayanlar için',
      features: [
        '1 X hesabı',
        '100 günlük kredi',
        'Temel bot işlemleri',
        'Email desteği',
      ],
      cta: 'Başla',
    },
    {
      name: 'PREMIUM',
      price: '$79',
      period: '/ay',
      description: 'Profesyoneller için',
      features: [
        '5 X hesabı',
        '500 günlük kredi',
        'AI yorum ve yanıtlar',
        'Telegram entegrasyonu',
        'Öncelikli destek',
      ],
      cta: 'Başla',
      highlighted: true,
    },
    {
      name: 'ENTERPRISE',
      price: 'Özel',
      period: 'fiyatlandırma',
      description: 'Kurumsal çözümler',
      features: [
        'Sınırsız hesap',
        'Sınırsız kredi',
        'Özel API erişimi',
        'Dedicated support',
        'Custom integrations',
      ],
      cta: 'İletişime Geç',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-hidden">
      {/* Navigation */}
      <nav className="container mx-auto px-4 py-6 flex justify-between items-center sticky top-0 z-40 bg-gradient-to-b from-slate-900/80 to-transparent backdrop-blur-sm">
        <XBotLogo size="md" variant="full" />
        <XLoginButton />
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-4xl mx-auto"
        >
          <h1 className="text-6xl font-bold mb-6 xbot-gradient-text">
            Profesyonel X Bot Otomasyon
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Enterprise-grade bot automation platformu. Transparent session management, akıllı retry workflow, 
            dual crypto payments ve detaylı monitoring ile X'te otomatik işlemler yapın.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <XLoginButton size="lg" />
            <Button
              size="lg"
              variant="outline"
              className="border-purple-500 text-purple-400 hover:bg-purple-500/10"
            >
              Daha Fazla Bilgi
            </Button>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 max-w-3xl mx-auto"
        >
          {[
            { label: '6 İşlem Türü', value: 'Beğeni, Takip, Yorum, Rapor, vb.' },
            { label: '180 Gün Session', value: 'Activity-based refresh' },
            { label: '60 Gün Loglar', value: 'Detaylı monitoring' },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-3xl font-bold xbot-gradient-text mb-2">{stat.label}</div>
              <p className="text-gray-400 text-sm">{stat.value}</p>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="text-4xl font-bold text-center mb-16 xbot-gradient-text"
        >
          Temel Özellikler
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-white/5 backdrop-blur border border-purple-500/20 rounded-lg p-6 hover:border-purple-500/50 transition-all"
              >
                <Icon className="w-12 h-12 text-purple-400 mb-4" />
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Chrome Extension Section */}
      <section className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="bg-gradient-to-r from-purple-600/20 to-cyan-600/20 border border-purple-500/30 rounded-lg p-12"
        >
          <div className="flex items-center gap-6 mb-6">
            <Chrome className="w-16 h-16 text-purple-400" />
            <div>
              <h2 className="text-3xl font-bold mb-2">Chrome Extension ile Güvenli Bağlantı</h2>
              <p className="text-gray-300">
                X.com hesabınızı güvenli bir şekilde bağlayın.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            {[
              { step: '1', title: 'Extension Yükle', desc: 'Chrome Web Store\'dan XBotMaster extension\'ını yükleyin' },
              { step: '2', title: 'X\'te Giriş Yap', desc: 'X.com\'da hesabınıza giriş yapın' },
              { step: '3', title: 'Session Kaydet', desc: 'Extension otomatik session\'ı yakalar ve kaydeder' },
            ].map((item, i) => (
              <div key={i} className="bg-white/5 backdrop-blur border border-purple-500/20 rounded-lg p-4">
                <div className="text-2xl font-bold text-purple-400 mb-2">{item.step}</div>
                <h3 className="font-semibold mb-1">{item.title}</h3>
                <p className="text-sm text-gray-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Pricing Section */}
      <section className="container mx-auto px-4 py-20">
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="text-4xl font-bold text-center mb-16 xbot-gradient-text"
        >
          Fiyatlandırma Planları
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pricingPlans.map((plan, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`rounded-lg p-8 backdrop-blur border transition-all ${
                plan.highlighted
                  ? 'bg-gradient-to-br from-purple-600/30 to-cyan-600/30 border-purple-500/50 scale-105'
                  : 'bg-white/5 border-purple-500/20 hover:border-purple-500/50'
              }`}
            >
              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              <p className="text-gray-400 mb-4">{plan.description}</p>
              <div className="mb-6">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-gray-400 ml-2">{plan.period}</span>
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, j) => (
                  <li key={j} className="flex items-center gap-2 text-gray-300">
                    <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                    {feature}
                  </li>
                ))}
              </ul>
              <Button
                className={`w-full ${
                  plan.highlighted
                    ? 'bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700'
                    : 'bg-purple-600 hover:bg-purple-700'
                }`}
              >
                {plan.cta}
              </Button>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="bg-gradient-to-r from-purple-600/20 to-cyan-600/20 border border-purple-500/30 rounded-lg p-12 text-center"
        >
          <h2 className="text-3xl font-bold mb-4">Hemen Başlamaya Hazır mısınız?</h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            XBotMaster ile X'te otomatik işlemler yapın. Chrome Extension ile güvenli session yönetimi, 
            akıllı retry mekanizması ve detaylı monitoring.
          </p>
          <XLoginButton size="lg" />
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-purple-500/20 mt-20 py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-semibold mb-4">Ürün</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-purple-400">Özellikler</a></li>
                <li><a href="#" className="hover:text-purple-400">Fiyatlandırma</a></li>
                <li><a href="#" className="hover:text-purple-400">Güvenlik</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Şirket</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-purple-400">Hakkında</a></li>
                <li><a href="#" className="hover:text-purple-400">Blog</a></li>
                <li><a href="#" className="hover:text-purple-400">Kariyer</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Yasal</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-purple-400">Gizlilik</a></li>
                <li><a href="#" className="hover:text-purple-400">Şartlar</a></li>
                <li><a href="#" className="hover:text-purple-400">Çerezler</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">İletişim</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="mailto:support@xbotmaster.com" className="hover:text-purple-400">support@xbotmaster.com</a></li>
                <li><a href="#" className="hover:text-purple-400">Twitter</a></li>
                <li><a href="#" className="hover:text-purple-400">Discord</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-purple-500/20 pt-8 text-center text-gray-400">
            <p>&copy; 2024 XBotMaster. Tüm hakları saklıdır.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
