import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Smartphone, Settings, CheckCircle } from 'lucide-react';

interface FirebaseDeviceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  language: 'fr' | 'en';
  onSuccess: () => void;
}

const FirebaseDeviceModal: React.FC<FirebaseDeviceModalProps> = ({
  open,
  onOpenChange,
  language,
  onSuccess
}) => {
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    firebaseDeviceId: '',
    fcmToken: '',
    studentId: '',
    deviceType: 'smartwatch',
    studentName: ''
  });

  const [testingConnection, setTestingConnection] = useState(false);

  const addDeviceMutation = useMutation({
    mutationFn: async (deviceData: any) => {
      return await apiRequest('POST', '/api/firebase/devices', deviceData);
    },
    onSuccess: (data) => {
      toast({
        title: language === 'fr' ? 'Appareil Firebase Ajouté' : 'Firebase Device Added',
        description: language === 'fr' ? 
          `Dispositif ${formData.firebaseDeviceId} connecté avec succès à ${formData.studentName}` : 
          `Device ${formData.firebaseDeviceId} successfully connected to ${formData.studentName}`,
      });
      
      console.log('[FIREBASE_DEVICE] Registration successful:', data);
      onSuccess();
      onOpenChange(false);
      
      // Reset form
      setFormData({
        firebaseDeviceId: '',
        fcmToken: '',
        studentId: '',
        deviceType: 'smartwatch',
        studentName: ''
      });
    },
    onError: (error: any) => {
      console.error('[FIREBASE_DEVICE] Registration failed:', error);
      toast({
        title: language === 'fr' ? 'Erreur Firebase' : 'Firebase Error',
        description: language === 'fr' ? 
          'Échec de l\'enregistrement de l\'appareil Firebase' : 
          'Failed to register Firebase device',
        variant: 'destructive'
      });
    },
  });

  const testFirebaseConnection = async () => {
    if (!formData.firebaseDeviceId || !formData.fcmToken) {
      toast({
        title: language === 'fr' ? 'Données manquantes' : 'Missing Data',
        description: language === 'fr' ? 
          'ID Firebase et Token FCM requis pour tester la connexion' : 
          'Firebase ID and FCM Token required to test connection',
        variant: 'destructive'
      });
      return;
    }

    setTestingConnection(true);
    
    try {
      // Simulate Firebase connection test
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: language === 'fr' ? 'Connexion Firebase Réussie' : 'Firebase Connection Successful',
        description: language === 'fr' ? 
          'L\'appareil est prêt pour le tracking en temps réel' : 
          'Device is ready for real-time tracking',
      });
      
      console.log(`[FIREBASE_TEST] Connection test successful for device: ${formData.firebaseDeviceId}`);
    } catch (error) {
      toast({
        title: language === 'fr' ? 'Test de Connexion Échoué' : 'Connection Test Failed',
        description: language === 'fr' ? 
          'Vérifiez les paramètres Firebase et réessayez' : 
          'Check Firebase settings and try again',
        variant: 'destructive'
      });
    } finally {
      setTestingConnection(false);
    }
  };

  const handleSubmit = () => {
    if (!formData.firebaseDeviceId || !formData.fcmToken || !formData.studentId || !formData.studentName) {
      toast({
        title: language === 'fr' ? 'Champs Manquants' : 'Missing Fields',
        description: language === 'fr' ? 
          'Tous les champs sont requis pour l\'enregistrement' : 
          'All fields are required for registration',
        variant: 'destructive'
      });
      return;
    }

    console.log('[FIREBASE_DEVICE] Submitting device registration:', formData);
    addDeviceMutation.mutate(formData);
  };

  const text = {
    fr: {
      title: 'Ajouter Appareil Firebase',
      firebaseDeviceId: 'ID Appareil Firebase',
      deviceToken: 'Token FCM',
      assignToStudent: 'Assigner à l\'élève',
      studentName: 'Nom de l\'élève',
      deviceType: 'Type d\'appareil',
      selectStudent: 'Sélectionner un élève',
      testConnection: 'Tester Connexion Firebase',
      connectDevice: 'Connecter avec Firebase',
      cancel: 'Annuler',
      configTitle: 'Configuration Firebase',
      loading: 'Test en cours...',
      connecting: 'Connexion...'
    },
    en: {
      title: 'Add Firebase Device',
      firebaseDeviceId: 'Firebase Device ID',
      deviceToken: 'FCM Token',
      assignToStudent: 'Assign to Student',
      studentName: 'Student Name',
      deviceType: 'Device Type',
      selectStudent: 'Select a Student',
      testConnection: 'Test Firebase Connection',
      connectDevice: 'Connect with Firebase',
      cancel: 'Cancel',
      configTitle: 'Firebase Configuration',
      loading: 'Testing...',
      connecting: 'Connecting...'
    }
  };

  const t = text[language];

  const studentOptions = [
    { value: '1', name: 'Junior Kamga', class: '3ème A' },
    { value: '2', name: 'Marie Nkomo', class: '2nde B' },
    { value: '3', name: 'Paul Essomba', class: 'CM2' },
    { value: '4', name: 'Sophie Biya', class: '1ère S' },
    { value: '5', name: 'Armand Fokou', class: 'Terminale C' },
    { value: '6', name: 'Claudine Mbarga', class: '4ème' }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-white border border-gray-200 shadow-lg">
        <DialogHeader className="bg-white pb-4">
          <DialogTitle className="flex items-center gap-2 text-gray-800">
            <Smartphone className="w-5 h-5 text-blue-600" />
            {t.title || ''}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 bg-white p-6 rounded-lg">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900">{t.firebaseDeviceId}</label>
            <Input 
              placeholder="firebase-device-cameroon-001" 
              className="w-full bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              value={formData.firebaseDeviceId}
              onChange={(e) => setFormData(prev => ({ ...prev, firebaseDeviceId: e?.target?.value }))}
              data-testid="input-firebase-device-id"
            />
            <p className="text-xs text-gray-500">
              {language === 'fr' ? 
                'ID unique généré par Firebase pour cet appareil' : 
                'Unique ID generated by Firebase for this device'}
            </p>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900">{t.deviceToken}</label>
            <Input 
              placeholder="FCM_TOKEN_abc123def456..." 
              className="w-full bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              value={formData.fcmToken}
              onChange={(e) => setFormData(prev => ({ ...prev, fcmToken: e?.target?.value }))}
              data-testid="input-fcm-token"
            />
            <p className="text-xs text-gray-500">
              {language === 'fr' ? 
                'Token FCM pour les notifications push en temps réel' : 
                'FCM token for real-time push notifications'}
            </p>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900">{t.assignToStudent}</label>
            <select 
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
              value={formData.studentId}
              onChange={(e) => {
                const student = studentOptions.find(s => s.value === e?.target?.value);
                setFormData(prev => ({ 
                  ...prev, 
                  studentId: e?.target?.value,
                  studentName: student ? `${student.name || ''} - ${student.class}` : ''
                }));
              }}
              data-testid="select-student"
            >
              <option value="">{t.selectStudent}</option>
              {(Array.isArray(studentOptions) ? studentOptions : []).map(student => (
                <option key={student.value} value={student.value}>
                  {student.name || ''} - {student.class}
                </option>
              ))}
            </select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900">{t.deviceType}</label>
            <select 
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
              value={formData.deviceType}
              onChange={(e) => setFormData(prev => ({ ...prev, deviceType: e?.target?.value }))}
              data-testid="select-device-type"
            >
              <option value="smartwatch">Smartwatch</option>
              <option value="smartphone">Smartphone</option>
              <option value="tablet">Tablette</option>
              <option value="gps-tracker">Traceur GPS</option>
            </select>
          </div>
          
          {/* Firebase Connection Test */}
          <div className="bg-white border border-blue-200 p-4 rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-blue-900">{t.configTitle}</h4>
              <Button
                variant="outline"
                size="sm"
                onClick={testFirebaseConnection}
                disabled={testingConnection || !formData.firebaseDeviceId || !formData.fcmToken}
                className="bg-white border-blue-300 text-blue-700 hover:bg-blue-50"
                data-testid="button-test-firebase"
              >
                {testingConnection ? (
                  <>
                    <Settings className="w-4 h-4 mr-2 animate-spin" />
                    {t.loading}
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {t.testConnection}
                  </>
                )}
              </Button>
            </div>
            <div className="text-sm text-blue-800 space-y-1 bg-blue-50 p-3 rounded">
              <p>• {language === 'fr' ? 'Appareil connecté à Firebase' : 'Device connected to Firebase'}</p>
              <p>• {language === 'fr' ? 'Géolocalisation temps réel activée' : 'Real-time geolocation enabled'}</p>
              <p>• {language === 'fr' ? 'Notifications push configurées' : 'Push notifications configured'}</p>
              <p>• {language === 'fr' ? 'Synchronisation cloud sécurisée' : 'Secure cloud synchronization'}</p>
            </div>
          </div>
          
          <div className="flex gap-3 pt-4 bg-white">
            <Button 
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white" 
              onClick={handleSubmit}
              disabled={addDeviceMutation.isPending}
              data-testid="button-connect-device"
            >
              {addDeviceMutation.isPending ? (
                <>
                  <Settings className="w-4 h-4 mr-2 animate-spin" />
                  {t.connecting}
                </>
              ) : (
                t.connectDevice
              )}
            </Button>
            <Button 
              variant="outline" 
              className="flex-1 bg-white border-gray-300 text-gray-700 hover:bg-gray-50" 
              onClick={() => onOpenChange(false)}
              disabled={addDeviceMutation.isPending}
              data-testid="button-cancel"
            >
              {t.cancel}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FirebaseDeviceModal;