
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import { MessageSquare, Settings, Plus } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export function TelegramSettings() {
  const [mode, setMode] = useState<'admin' | 'user'>('admin');
  const [apiId, setApiId] = useState('');
  const [apiHash, setApiHash] = useState('');
  const [phone, setPhone] = useState('');

  const adminChannels = [
    { id: 1, name: 'InfoCT 1', active: true, timeStart: '09:00', timeEnd: '12:00' },
    { id: 2, name: 'InfoCT 2', active: true, timeStart: '15:00', timeEnd: '16:00' },
    { id: 3, name: 'InfoCT 3', active: false, timeStart: '18:00', timeEnd: '19:00' },
    { id: 4, name: 'InfoCT 4', active: true, timeStart: '21:00', timeEnd: '22:00' },
  ];

  const handleSaveCredentials = () => {
    if (!apiId || !apiHash || !phone) {
      toast.error('Lütfen tüm alanları doldurun');
      return;
    }
    toast.success('Telegram credentials kaydedildi');
  };

  return (
    <div className="space-y-6">
      <Tabs value={mode} onValueChange={(v) => setMode(v as 'admin' | 'user')} className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-black/20 border border-purple-500/20">
          <TabsTrigger value="admin">Admin Kanalları</TabsTrigger>
          <TabsTrigger value="user">Kendi Kanallarım</TabsTrigger>
        </TabsList>

        {/* Admin Channels Mode */}
        <TabsContent value="admin" className="space-y-6">
          <Card className="bg-white/5 backdrop-blur border-purple-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-purple-400" />
                Admin Kanalları
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-400">
                Admin tarafından önceden belirlenmiş kanallardan linkler otomatik olarak toplanır.
              </p>
              <div className="space-y-3">
                {adminChannels.map((channel, i) => (
                  <motion.div
                    key={channel.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.1 }}
                    className="p-4 bg-white/5 border border-purple-500/20 rounded-lg flex items-center justify-between"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold">{channel.name}</h3>
                      <p className="text-sm text-gray-400">
                        {channel.timeStart} - {channel.timeEnd}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${channel.active ? 'bg-green-500' : 'bg-gray-500'}`} />
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-purple-500/20 text-purple-400 hover:bg-purple-500/10"
                      >
                        <Settings className="w-4 h-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* User Channels Mode */}
        <TabsContent value="user" className="space-y-6">
          <Card className="bg-white/5 backdrop-blur border-purple-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-purple-400" />
                Telegram Credentials
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-400">
                Kendi Telegram hesabınızı bağlayarak özel kanallardan linkler toplayın.
              </p>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">
                    API ID
                  </label>
                  <Input
                    placeholder="Telegram API ID"
                    value={apiId}
                    onChange={(e) => setApiId(e.target.value)}
                    className="bg-white/5 border-purple-500/20 text-white placeholder:text-gray-500"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">
                    API Hash
                  </label>
                  <Input
                    placeholder="Telegram API Hash"
                    value={apiHash}
                    onChange={(e) => setApiHash(e.target.value)}
                    className="bg-white/5 border-purple-500/20 text-white placeholder:text-gray-500"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">
                    Telefon Numarası
                  </label>
                  <Input
                    placeholder="+90 5XX XXX XXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="bg-white/5 border-purple-500/20 text-white placeholder:text-gray-500"
                  />
                </div>
                <Button
                  onClick={handleSaveCredentials}
                  className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700"
                >
                  Kaydet ve Bağla
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* User Channels List */}
          <Card className="bg-white/5 backdrop-blur border-purple-500/20">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Bağlı Kanallar</span>
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Kanal Ekle
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-400">
                Henüz kanal bağlanmamış. Yukarıdaki credentials'ı kaydedin ve kanal ekleyin.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
