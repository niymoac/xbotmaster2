'use client';

import { useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { XBotLogo } from '@/components/xbot-logo';
import { LogOut, Settings, BarChart3, Zap, MessageSquare, Smartphone } from 'lucide-react';
import { BotPanel } from './bot-panel';
import { DashboardMetrics } from './dashboard-metrics';
import { DeviceManager } from './device-manager';
import { ActivityLogs } from './activity-logs';
import { TelegramSettings } from './telegram-settings';

export function DashboardLayout() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Header */}
      <header className="border-b border-purple-500/20 bg-black/20 backdrop-blur">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <XBotLogo size="md" variant="full" />
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-gray-400">Hoş geldiniz</p>
              <p className="font-semibold">{user?.email}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={logout}
              className="text-gray-400 hover:text-white"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-black/20 border border-purple-500/20">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="bot" className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              <span className="hidden sm:inline">Bot Panel</span>
            </TabsTrigger>
            <TabsTrigger value="telegram" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">Telegram</span>
            </TabsTrigger>
            <TabsTrigger value="devices" className="flex items-center gap-2">
              <Smartphone className="w-4 h-4" />
              <span className="hidden sm:inline">Cihazlar</span>
            </TabsTrigger>
            <TabsTrigger value="logs" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Loglar</span>
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6 mt-6">
            <DashboardMetrics />
          </TabsContent>

          {/* Bot Panel Tab */}
          <TabsContent value="bot" className="space-y-6 mt-6">
            <BotPanel />
          </TabsContent>

          {/* Telegram Settings Tab */}
          <TabsContent value="telegram" className="space-y-6 mt-6">
            <TelegramSettings />
          </TabsContent>

          {/* Device Manager Tab */}
          <TabsContent value="devices" className="space-y-6 mt-6">
            <DeviceManager />
          </TabsContent>

          {/* Activity Logs Tab */}
          <TabsContent value="logs" className="space-y-6 mt-6">
            <ActivityLogs />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}