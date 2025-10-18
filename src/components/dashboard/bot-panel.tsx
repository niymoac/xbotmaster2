
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { motion } from 'framer-motion';
import { Zap, Heart, Users, MessageCircle, TrendingUp, Reply } from 'lucide-react';
import { toast } from 'sonner';

export function BotPanel() {
  const [urls, setUrls] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedOperation, setSelectedOperation] = useState<string | null>(null);

  const operations = [
    {
      id: 'like_posts',
      title: 'Postları Beğen',
      description: 'Seçilen postları otomatik olarak beğen',
      icon: Heart,
      color: 'from-red-600 to-pink-600',
    },
    {
      id: 'follow_users',
      title: 'Kullanıcıları Takip Et',
      description: 'Post sahiplerini otomatik olarak takip et',
      icon: Users,
      color: 'from-blue-600 to-cyan-600',
    },
    {
      id: 'ai_comment',
      title: 'AI Yorum Yap',
      description: 'Yapay zeka ile akıllı yorumlar yap',
      icon: MessageCircle,
      color: 'from-purple-600 to-pink-600',
    },
    {
      id: 'mutual_follow_report',
      title: 'Karşılıklı Takip Raporu',
      description: 'Karşılıklı takip eden kullanıcıları listele',
      icon: TrendingUp,
      color: 'from-green-600 to-emerald-600',
    },
    {
      id: 'like_comments',
      title: 'Yorumları Beğen',
      description: 'Postlardaki yorumları otomatik beğen',
      icon: Heart,
      color: 'from-orange-600 to-red-600',
    },
    {
      id: 'ai_reply_comments',
      title: 'Yorumlara AI Cevap Ver',
      description: 'Yorumlara yapay zeka ile cevap ver',
      icon: Reply,
      color: 'from-indigo-600 to-purple-600',
    },
  ];

  const handleStartOperation = async () => {
    if (!selectedOperation) {
      toast.error('Lütfen bir işlem türü seçin');
      return;
    }

    if (!urls.trim()) {
      toast.error('Lütfen en az bir URL girin');
      return;
    }

    setIsProcessing(true);
    try {
      // Simulated API call
      await new Promise((resolve) => setTimeout(resolve, 2000));
      toast.success(`${selectedOperation} işlemi başlatıldı`);
      setUrls('');
      setSelectedOperation(null);
    } catch (error) {
      toast.error('İşlem başlatılamadı');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Operation Selection */}
      <Card className="bg-white/5 backdrop-blur border-purple-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-purple-400" />
            Bot İşlem Seçimi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {operations.map((op) => {
              const Icon = op.icon;
              return (
                <motion.button
                  key={op.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedOperation(op.id)}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    selectedOperation === op.id
                      ? 'border-purple-500 bg-purple-500/20'
                      : 'border-purple-500/20 bg-white/5 hover:border-purple-500/50'
                  }`}
                >
                  <Icon className={`w-6 h-6 mb-2 text-transparent bg-gradient-to-r ${op.color} bg-clip-text`} />
                  <h3 className="font-semibold text-sm">{op.title}</h3>
                  <p className="text-xs text-gray-400 mt-1">{op.description}</p>
                </motion.button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* URL Input */}
      <Card className="bg-white/5 backdrop-blur border-purple-500/20">
        <CardHeader>
          <CardTitle>URL / Link Girişi</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Post URL'lerini veya Telegram linklerini girin (her satırda bir tane)..."
            value={urls}
            onChange={(e) => setUrls(e.target.value)}
            className="bg-white/5 border-purple-500/20 text-white placeholder:text-gray-500 min-h-32"
          />
          <div className="flex gap-4">
            <Button
              onClick={handleStartOperation}
              disabled={isProcessing || !selectedOperation || !urls.trim()}
              className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 flex-1"
            >
              {isProcessing ? 'İşlem Başlatılıyor...' : 'İşlemi Başlat'}
            </Button>
            <Button
              variant="outline"
              onClick={() => setUrls('')}
              className="border-purple-500/20 text-purple-400 hover:bg-purple-500/10"
            >
              Temizle
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Operations */}
      <Card className="bg-white/5 backdrop-blur border-purple-500/20">
        <CardHeader>
          <CardTitle>Son İşlemler</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { op: 'Postları Beğen', status: 'Tamamlandı', count: '45/50', time: '2 saat önce' },
              { op: 'Kullanıcıları Takip Et', status: 'Devam Ediyor', count: '23/100', time: 'Şu anda' },
              { op: 'AI Yorum Yap', status: 'Başarısız', count: '8/30', time: '1 saat önce' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-purple-500/10">
                <div>
                  <p className="font-semibold text-sm">{item.op}</p>
                  <p className="text-xs text-gray-400">{item.time}</p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-semibold ${
                    item.status === 'Tamamlandı' ? 'text-green-400' :
                    item.status === 'Devam Ediyor' ? 'text-blue-400' :
                    'text-red-400'
                  }`}>
                    {item.status}
                  </p>
                  <p className="text-xs text-gray-400">{item.count}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
