import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { ModernCard } from '@/components/ui/ModernCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { 
  Smartphone, Plus, CheckCircle, AlertTriangle, Battery, 
  MapPin, Settings, Zap, Clock
} from 'lucide-react';
import FirebaseDeviceModal from '@/components/firebase/FirebaseDeviceModal';

const FirebaseDeviceTest = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showAddModal, setShowAddModal] = useState(false);

  // Fetch Firebase devices
  const { data: devicesData, isLoading } = useQuery({
    queryKey: ['/api/firebase/devices'],
    queryFn: () => apiRequest('GET', '/api/firebase/devices')
  });

  // Test Firebase connection mutation
  const testConnectionMutation = useMutation({
    mutationFn: async (deviceId: string) => {
      return await apiRequest('PATCH', `/api/firebase/devices/${deviceId}`, {
        status: 'testing',
        location: { 
          latitude: 3.8480 + (Math.random() - 0.5) * 0.01, 
          longitude: 11.5021 + (Math.random() - 0.5) * 0.01 
        },
        batteryLevel: Math.floor(Math.random() * 100)
      });
    },
    onSuccess: (data, deviceId) => {
      toast({
        title: language === 'fr' ? 'Test Firebase Réussi' : 'Firebase Test Successful',
        description: language === 'fr' ? 
          `Appareil ${deviceId} répond correctement` : 
          `Device ${deviceId} responding correctly`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/firebase/devices'] });
    },
    onError: (error: any) => {
      toast({
        title: language === 'fr' ? 'Test Firebase Échoué' : 'Firebase Test Failed',
        description: error.message || 'Connection test failed',
        variant: 'destructive'
      });
    }
  });

  const text = {
    fr: {
      title: 'Test Firebase Tracking Devices',
      subtitle: 'Interface de test pour l\'ajout et la gestion des appareils Firebase',
      addDevice: 'Ajouter Appareil',
      testConnection: 'Tester Connexion',
      deviceId: 'ID Appareil',
      student: 'Élève',
      deviceType: 'Type',
      status: 'Statut',
      battery: 'Batterie',
      lastPing: 'Dernière Connexion',
      location: 'Position',
      noDevices: 'Aucun appareil Firebase configuré',
      testing: 'Test en cours...'
    },
    en: {
      title: 'Firebase Tracking Devices Test',
      subtitle: 'Test interface for adding and managing Firebase devices',
      addDevice: 'Add Device',
      testConnection: 'Test Connection',
      deviceId: 'Device ID',
      student: 'Student',
      deviceType: 'Type',
      status: 'Status',
      battery: 'Battery',
      lastPing: 'Last Ping',
      location: 'Location',
      noDevices: 'No Firebase devices configured',
      testing: 'Testing...'
    }
  };

  const t = text[language];

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'smartwatch': return <Zap className="w-5 h-5 text-blue-500" />;
      case 'smartphone': return <Smartphone className="w-5 h-5 text-green-500" />;
      case 'tablet': return <Settings className="w-5 h-5 text-purple-500" />;
      case 'gps-tracker': return <MapPin className="w-5 h-5 text-orange-500" />;
      default: return <Smartphone className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3 mr-1" />
          Actif
        </Badge>;
      case 'testing':
        return <Badge className="bg-yellow-100 text-yellow-800">
          <Clock className="w-3 h-3 mr-1" />
          Test
        </Badge>;
      case 'offline':
        return <Badge className="bg-red-100 text-red-800">
          <AlertTriangle className="w-3 h-3 mr-1" />
          Hors ligne
        </Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Inconnu</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
        <p className="text-center mt-4 text-gray-600">Chargement des appareils Firebase...</p>
      </div>
    );
  }

  const devices = (devicesData as any)?.devices || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-orange-400 to-red-600 rounded-lg flex items-center justify-center">
            <Smartphone className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{t.title || ''}</h2>
            <p className="text-gray-600">{t.subtitle}</p>
          </div>
        </div>
        
        <Button onClick={() => setShowAddModal(true)} className="flex items-center gap-2" data-testid="button-add-device">
          <Plus className="w-4 h-4" />
          {t.addDevice}
        </Button>
      </div>

      {/* Firebase Devices */}
      <ModernCard gradient="default">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-blue-500" />
            Appareils Firebase Configurés ({(Array.isArray(devices) ? devices.length : 0)})
          </h3>
          
          {(Array.isArray(devices) ? devices.length : 0) === 0 ? (
            <div className="text-center py-8">
              <Smartphone className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">{t.noDevices}</p>
              <Button 
                variant="outline" 
                className="mt-3" 
                onClick={() => setShowAddModal(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                {t.addDevice}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {(Array.isArray(devices) ? devices : []).map((device: any) => (
                <div 
                  key={device.id} 
                  className="flex items-center justify-between p-4 border rounded-lg bg-white hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                      {getDeviceIcon(device.deviceType)}
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900">{device.firebaseDeviceId}</h4>
                        {getStatusBadge(device.status)}
                      </div>
                      <p className="text-sm text-gray-600">{device.studentName}</p>
                      <div className="flex items-center gap-4 mt-1">
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Battery className="w-3 h-3" />
                          {device.batteryLevel}%
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <MapPin className="w-3 h-3" />
                          {device.location?.address || 'Position inconnue'}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => testConnectionMutation.mutate(device.firebaseDeviceId)}
                      disabled={testConnectionMutation.isPending}
                    >
                      {testConnectionMutation.isPending ? (
                        <>
                          <Settings className="w-4 h-4 mr-2 animate-spin" />
                          {t.testing}
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          {t.testConnection}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </ModernCard>

      {/* Add Device Modal */}
      <FirebaseDeviceModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        language={language}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['/api/firebase/devices'] });
        }}
      />
    </div>
  );
};

export default FirebaseDeviceTest;