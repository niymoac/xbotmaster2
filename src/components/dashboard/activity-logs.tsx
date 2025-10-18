
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Search, Download, Filter } from 'lucide-react';
import { useState } from 'react';

export function ActivityLogs() {
  const [searchTerm, setSearchTerm] = useState('');

  const logs = [
    {
      id: 1,
      timestamp: '2024-12-15 14:30:45',
      action: 'Bot İşlemi Başlatıldı',
      type: 'like_posts',
      status: 'success',
      details: '45 post başarıyla beğenildi',
    },
    {
      id: 2,
      timestamp: '2024-12-15 13:15:20',
      action: 'Session Refresh',
      type: 'session',
      status: 'success',
      details: 'Transparent refresh tamamlandı',
    },
    {
      id: 3,
      timestamp: '2024-12-15 12:00:10',
      action: 'Bot İşlemi Başarısız',
      type: 'follow_users',
      status: 'error',
      details: 'Rate limit aşıldı, 3 retry yapılacak',
    },
    {
      id: 4,
      timestamp: '2024-12-15 11:45:30',
      action: 'Admin Retry Başlatıldı',
      type: 'admin_retry',
      status: 'processing',
      details: '8 başarısız link retry queue\'ya eklendi',
    },
  ];

  const filteredLogs = logs.filter(log =>
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.details.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Search and Filter */}
      <Card className="bg-white/5 backdrop-blur border-purple-500/20">
        <CardHeader>
          <CardTitle>Logları Filtrele</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
              <Input
                placeholder="Log ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/5 border-purple-500/20 text-white placeholder:text-gray-500"
              />
            </div>
            <Button
              variant="outline"
              className="border-purple-500/20 text-purple-400 hover:bg-purple-500/10"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filtrele
            </Button>
            <Button
              variant="outline"
              className="border-purple-500/20 text-purple-400 hover:bg-purple-500/10"
            >
              <Download className="w-4 h-4 mr-2" />
              İndir
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Logs List */}
      <Card className="bg-white/5 backdrop-blur border-purple-500/20">
        <CardHeader>
          <CardTitle>Son 60 Gün Logları</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredLogs.map((log, i) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className="p-4 bg-white/5 border border-purple-500/10 rounded-lg hover:border-purple-500/30 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-sm">{log.action}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        log.status === 'success' ? 'bg-green-500/20 text-green-400' :
                        log.status === 'error' ? 'bg-red-500/20 text-red-400' :
                        'bg-blue-500/20 text-blue-400'
                      }`}>
                        {log.status === 'success' ? 'Başarılı' :
                         log.status === 'error' ? 'Hata' :
                         'İşleniyor'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 mb-1">{log.details}</p>
                    <p className="text-xs text-gray-500">{log.timestamp}</p>
                  </div>
                  <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded">
                    {log.type}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
