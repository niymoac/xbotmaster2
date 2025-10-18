
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Smartphone, LogOut, CheckCircle, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export function DeviceManager() {
  const devices = [
    {
      id: 1,
      name: 'MacBook Pro',
      type: 'Desktop',
      browser: 'Chrome',
      os: 'macOS',
      ip: '192.168.1.100',
      lastActivity: '2 dakika önce',
      status: 'active',
    },
    {
      id: 2,
      name: 'iPhone 14',
      type: 'Mobile',
      browser: 'Safari',
      os: 'iOS',
      ip: '192.168.1.101',
      lastActivity: '1 saat önce',
      status: 'active',
    },
    {
      id: 3,
      name: 'Windows PC',
      type: 'Desktop',
      browser: 'Firefox',
      os: 'Windows',
      ip: '192.168.1.102',
      lastActivity: '3 gün önce',
      status: 'inactive',
    },
  ];

  return (
    <div className="space-y-6">
      <Card className="bg-white/5 backdrop-blur border-purple-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-purple-400" />
            Aktif Cihazlar ({devices.filter(d => d.status === 'active').length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {devices.map((device, i) => (
              <motion.div
                key={device.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: i * 0.1 }}
                className="p-4 bg-white/5 border border-purple-500/20 rounded-lg hover:border-purple-500/50 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">{device.name}</h3>
                      {device.status === 'active' ? (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-gray-500" />
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-400">
                      <p>{device.type} • {device.browser}</p>
                      <p>{device.os}</p>
                      <p>IP: {device.ip}</p>
                      <p>Son aktivite: {device.lastActivity}</p>
                    </div>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="ml-4"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Çıkış Yap
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Session Info */}
      <Card className="bg-white/5 backdrop-blur border-purple-500/20">
        <CardHeader>
          <CardTitle>Session Bilgileri</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-400">Session ID</p>
              <p className="font-mono text-sm">sess_abc123def456</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Oluşturulma Tarihi</p>
              <p className="text-sm">15 Aralık 2024</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Son Refresh</p>
              <p className="text-sm">2 dakika önce</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Sona Erme Tarihi</p>
              <p className="text-sm">14 Haziran 2025</p>
            </div>
          </div>
          <Button
            variant="outline"
            className="w-full border-purple-500/20 text-purple-400 hover:bg-purple-500/10"
          >
            Tüm Cihazlardan Çıkış Yap
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
