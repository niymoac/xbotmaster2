
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { TrendingUp, Zap, AlertCircle, CheckCircle } from 'lucide-react';

export function DashboardMetrics() {
  const metrics = [
    {
      title: 'Günlük Kredi',
      value: '450 / 500',
      icon: Zap,
      color: 'from-purple-600 to-blue-600',
      percentage: 90,
    },
    {
      title: 'Başarı Oranı',
      value: '98.5%',
      icon: CheckCircle,
      color: 'from-green-600 to-emerald-600',
      percentage: 98.5,
    },
    {
      title: 'Aktif İşlemler',
      value: '3',
      icon: TrendingUp,
      color: 'from-blue-600 to-cyan-600',
      percentage: 30,
    },
    {
      title: 'Hata Oranı',
      value: '1.5%',
      icon: AlertCircle,
      color: 'from-orange-600 to-red-600',
      percentage: 1.5,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((metric, i) => {
        const Icon = metric.icon;
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
          >
            <Card className="bg-white/5 backdrop-blur border-purple-500/20 hover:border-purple-500/50 transition-all">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">
                  {metric.title}
                </CardTitle>
                <Icon className={`w-5 h-5 text-transparent bg-gradient-to-r ${metric.color} bg-clip-text`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-2">{metric.value}</div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full bg-gradient-to-r ${metric.color}`}
                    style={{ width: `${metric.percentage}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
