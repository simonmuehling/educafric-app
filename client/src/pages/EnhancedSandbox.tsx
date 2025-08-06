import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage } from '@/contexts/LanguageContext';
import ConsolidatedSandboxDashboard from '@/components/sandbox/ConsolidatedSandboxDashboard';
import SandboxMonitor from '@/components/sandbox/SandboxMonitor';
import APITester from '@/components/sandbox/APITester';
import ComponentPlayground from '@/components/sandbox/ComponentPlayground';
import FirebaseDeviceTest from '@/components/sandbox/FirebaseDeviceTest';
import { Code, Monitor, TestTube, Layers, Globe } from 'lucide-react';

const EnhancedSandbox = () => {
  const { language } = useLanguage();

  const t = {
    dashboard: language === 'fr' ? 'Tableau de Bord' : 'Dashboard',
    monitor: language === 'fr' ? 'Surveillance' : 'Monitor',
    apiTester: language === 'fr' ? 'Test API' : 'API Tester',
    components: language === 'fr' ? 'Composants' : 'Components',
    devices: language === 'fr' ? 'Appareils' : 'Devices'
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Tabs defaultValue="dashboard" className="h-full">
        <div className="bg-white border-b border-gray-200 px-6 py-3">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <Monitor className="w-4 h-4" />
              {t.dashboard}
            </TabsTrigger>
            <TabsTrigger value="monitor" className="flex items-center gap-2">
              <TestTube className="w-4 h-4" />
              {t.monitor}
            </TabsTrigger>
            <TabsTrigger value="api-tester" className="flex items-center gap-2">
              <Code className="w-4 h-4" />
              {t.apiTester}
            </TabsTrigger>
            <TabsTrigger value="components" className="flex items-center gap-2">
              <Layers className="w-4 h-4" />
              {t.components}
            </TabsTrigger>
            <TabsTrigger value="devices" className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              {t.devices}
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="dashboard" className="mt-0 h-full">
          <ConsolidatedSandboxDashboard />
        </TabsContent>

        <TabsContent value="monitor" className="mt-0 h-full">
          <SandboxMonitor />
        </TabsContent>

        <TabsContent value="api-tester" className="mt-0 h-full">
          <div className="p-6">
            <APITester />
          </div>
        </TabsContent>

        <TabsContent value="components" className="mt-0 h-full">
          <div className="p-6">
            <ComponentPlayground />
          </div>
        </TabsContent>

        <TabsContent value="devices" className="mt-0 h-full">
          <div className="p-6">
            <FirebaseDeviceTest />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedSandbox;