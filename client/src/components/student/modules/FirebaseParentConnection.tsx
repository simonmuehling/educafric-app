import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  QrCode, 
  Share2, 
  Copy, 
  Smartphone, 
  Heart, 
  Users, 
  Send,
  Link2,
  CheckCircle2,
  Clock,
  MessageCircle,
  Download,
  Zap,
  Bell,
  Sparkles
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { 
  getAnalytics, 
  logEvent 
} from 'firebase/analytics';
import { 
  getRemoteConfig, 
  fetchAndActivate, 
  getValue 
} from 'firebase/remote-config';

interface FirebaseParentConnectionProps {
  studentId?: number;
}

const FirebaseParentConnection: React.FC<FirebaseParentConnectionProps> = ({ studentId }) => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [connectionData, setConnectionData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [method, setMethod] = useState<'dynamic_link' | 'smart_qr' | 'notification'>('dynamic_link');
  const [firebaseConfig, setFirebaseConfig] = useState<any>(null);

  const texts = {
    fr: {
      title: '🔥 Connexion Firebase Intelligente',
      subtitle: 'Technologie moderne pour connecter vos parents instantanément',
      methods: {
        dynamic_link: {
          title: '🚀 Lien Dynamique',
          description: 'Lien magique qui ouvre directement l\'app EDUCAFRIC',
          features: ['Auto-installation', 'Données pré-remplies', 'Ultra sécurisé'],
          action: 'Créer Lien Magique'
        },
        smart_qr: {
          title: '✨ QR Code Intelligent',
          description: 'QR code avec logo EDUCAFRIC et détection automatique',
          features: ['Scan ultra-rapide', 'Design moderne', 'Multi-plateforme'],
          action: 'Générer QR Smart'
        },
        notification: {
          title: '🔔 Notification Push',
          description: 'Invitation directe via notification push',
          features: ['Temps réel', 'Action directe', 'Zéro friction'],
          action: 'Envoyer Invitation'
        }
      },
      generate: 'Générer',
      share: 'Partager',
      whatsapp: 'WhatsApp',
      download: 'Télécharger',
      copied: 'Copié !',
      sent: 'Envoyé !',
      analytics: 'Analytics',
      success_rate: 'Taux de succès',
      installs: 'Installations',
      powered_by: 'Propulsé par Firebase',
      smart_features: 'Fonctionnalités intelligentes',
      auto_install: 'Installation automatique si app manquante',
      deep_link: 'Ouverture directe dans l\'app',
      encrypted: 'Chiffrement bout en bout',
      real_time: 'Synchronisation temps réel'
    },
    en: {
      title: '🔥 Firebase Smart Connection',
      subtitle: 'Modern technology to connect your parents instantly',
      methods: {
        dynamic_link: {
          title: '🚀 Dynamic Link',
          description: 'Magic link that opens EDUCAFRIC app directly',
          features: ['Auto-install', 'Pre-filled data', 'Ultra secure'],
          action: 'Create Magic Link'
        },
        smart_qr: {
          title: '✨ Smart QR Code',
          description: 'QR code with EDUCAFRIC logo and auto-detection',
          features: ['Ultra-fast scan', 'Modern design', 'Multi-platform'],
          action: 'Generate Smart QR'
        },
        notification: {
          title: '🔔 Push Notification',
          description: 'Direct invitation via push notification',
          features: ['Real-time', 'Direct action', 'Zero friction'],
          action: 'Send Invitation'
        }
      },
      generate: 'Generate',
      share: 'Share',
      whatsapp: 'WhatsApp',
      download: 'Download',
      copied: 'Copied!',
      sent: 'Sent!',
      analytics: 'Analytics',
      success_rate: 'Success rate',
      installs: 'Installs',
      powered_by: 'Powered by Firebase',
      smart_features: 'Smart features',
      auto_install: 'Auto-install if app missing',
      deep_link: 'Direct app opening',
      encrypted: 'End-to-end encryption',
      real_time: 'Real-time sync'
    }
  };

  const t = texts[language as keyof typeof texts];

  useEffect(() => {
    // Initialize Firebase Remote Config for dynamic QR styling
    const loadFirebaseConfig = async () => {
      try {
        // Load remote config for QR code customization
        const response = await fetch('/api/firebase/remote-config', {
          credentials: 'include'
        });
        const config = await response.json();
        setFirebaseConfig(config);
      } catch (error) {
        console.log('[FIREBASE] Using default config');
      }
    };

    loadFirebaseConfig();
  }, []);

  const generateConnection = async (selectedMethod: 'dynamic_link' | 'smart_qr' | 'notification') => {
    setLoading(true);
    try {
      // Log analytics event
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'parent_connection_request', {
          method: selectedMethod,
          student_id: studentId
        });
      }

      const response = await fetch('/api/student/generate-firebase-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          method: selectedMethod,
          language,
          config: firebaseConfig 
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setConnectionData(result.data);
        setMethod(selectedMethod);
        
        toast({
          title: language === 'fr' ? '🔥 Connexion Firebase créée !' : '🔥 Firebase connection created!',
          description: result.message
        });

        // Track success
        if (typeof window !== 'undefined' && window.gtag) {
          window.gtag('event', 'connection_generated', {
            method: selectedMethod,
            success: true
          });
        }
      }
    } catch (error) {
      toast({
        title: language === 'fr' ? 'Erreur Firebase' : 'Firebase Error',
        description: language === 'fr' ? 'Impossible de générer la connexion' : 'Failed to generate connection',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const shareViaFirebase = async (data: any) => {
    const shareText = language === 'fr' 
      ? `🎓 Rejoignez EDUCAFRIC pour suivre ma scolarité !\n\n✨ Connexion facile avec ce lien :\n${data.dynamicLink}\n\n📱 Ou utilisez le code : ${data.shortCode}\n\n🔐 Sécurisé et validé par l'école`
      : `🎓 Join EDUCAFRIC to follow my school progress!\n\n✨ Easy connection with this link:\n${data.dynamicLink}\n\n📱 Or use code: ${data.shortCode}\n\n🔐 Secure and school-validated`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'EDUCAFRIC - Invitation Parent',
          text: shareText
        });
        
        toast({
          title: t.sent,
          description: language === 'fr' ? 'Invitation partagée' : 'Invitation shared'
        });
      } catch (error) {
        copyToClipboard(shareText);
      }
    } else {
      copyToClipboard(shareText);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: t.copied,
      description: language === 'fr' ? 'Lien copié' : 'Link copied'
    });
  };

  const downloadSmartQR = () => {
    if (!connectionData?.qrCode) return;
    
    const link = document.createElement('a');
    link.href = connectionData.qrCode;
    link.download = `educafric-firebase-qr-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Firebase Powered Header */}
      <Card className="bg-gradient-to-r from-orange-50 via-red-50 to-yellow-50 border-orange-200">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center space-x-3">
            <Zap className="h-6 w-6 text-orange-500" />
            <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              {t.title}
            </span>
            <Sparkles className="h-6 w-6 text-yellow-500" />
          </CardTitle>
          <p className="text-orange-700">{t.subtitle}</p>
          <Badge variant="outline" className="mx-auto border-orange-300 text-orange-700">
            {t.powered_by}
          </Badge>
        </CardHeader>
      </Card>

      {/* Firebase Smart Features */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-800 flex items-center space-x-2">
            <Sparkles className="h-5 w-5" />
            <span>{t.smart_features}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3">
              <Smartphone className="h-5 w-5 text-blue-600" />
              <span className="text-sm text-blue-700">{t.auto_install}</span>
            </div>
            <div className="flex items-center space-x-3">
              <Link2 className="h-5 w-5 text-blue-600" />
              <span className="text-sm text-blue-700">{t.deep_link}</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle2 className="h-5 w-5 text-blue-600" />
              <span className="text-sm text-blue-700">{t.encrypted}</span>
            </div>
            <div className="flex items-center space-x-3">
              <Clock className="h-5 w-5 text-blue-600" />
              <span className="text-sm text-blue-700">{t.real_time}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Method Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(['dynamic_link', 'smart_qr', 'notification'] as const).map((methodType) => (
          <Card 
            key={methodType}
            className={`cursor-pointer transition-all hover:shadow-lg ${
              method === methodType ? 'ring-2 ring-orange-500 bg-orange-50' : 'hover:bg-gray-50'
            }`}
            onClick={() => setMethod(methodType)}
          >
            <CardContent className="pt-6">
              <h3 className="font-medium text-gray-800 mb-2">
                {t.methods[methodType].title}
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                {t.methods[methodType].description}
              </p>
              
              {/* Features */}
              <div className="space-y-1 mb-4">
                {t.methods[methodType].features.map((feature, idx) => (
                  <div key={idx} className="flex items-center space-x-2">
                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                    <span className="text-xs text-gray-600">{feature}</span>
                  </div>
                ))}
              </div>

              <Button 
                onClick={(e) => {
                  e.stopPropagation();
                  generateConnection(methodType);
                }}
                disabled={loading}
                variant={method === methodType ? 'default' : 'outline'}
                className="w-full"
              >
                {t.methods[methodType].action}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Firebase Connection Display */}
      {connectionData && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-green-800">
              <Zap className="h-5 w-5 text-orange-500" />
              <span>Firebase {t.methods[method].title} - Généré</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {method === 'dynamic_link' && (
              <div className="space-y-4">
                <div className="bg-white p-6 rounded-xl border-2 border-orange-300 shadow-lg">
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 mx-auto bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center">
                      <Link2 className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-gray-800">Lien Dynamique Firebase</h3>
                      <p className="text-sm text-gray-600 mt-2 p-3 bg-gray-50 rounded-lg font-mono break-all">
                        {connectionData.dynamicLink}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-2 justify-center">
                  <Button onClick={() => shareViaFirebase(connectionData)} className="bg-orange-600 hover:bg-orange-700">
                    <Share2 className="h-4 w-4 mr-2" />
                    {t.share}
                  </Button>
                  <Button onClick={() => copyToClipboard(connectionData.dynamicLink)} variant="outline">
                    <Copy className="h-4 w-4 mr-2" />
                    {t.copied}
                  </Button>
                </div>
              </div>
            )}

            {method === 'smart_qr' && (
              <div className="text-center space-y-4">
                <div className="bg-white p-6 rounded-xl border-2 border-purple-300 shadow-lg">
                  <div className="relative mx-auto max-w-sm">
                    {/* Firebase-powered Smart QR Container */}
                    <div className="bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-3xl p-4 shadow-xl">
                      <div className="bg-white rounded-2xl p-4">
                        
                        {/* EDUCAFRIC Header */}
                        <div className="text-center mb-3">
                          <div className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                            🔥 EDUCAFRIC
                          </div>
                          <div className="text-xs text-gray-600">Firebase Smart QR</div>
                        </div>
                        
                        {/* QR Code réel */}
                        <div className="flex justify-center mb-3">
                          {connectionData.qrCode ? (
                            <img 
                              src={connectionData.qrCode} 
                              alt="QR Code EDUCAFRIC" 
                              className="w-56 h-56 rounded-lg border border-gray-200"
                              style={{ imageRendering: 'pixelated' }}
                            />
                          ) : (
                            <div className="w-56 h-56 bg-gray-100 rounded-lg flex items-center justify-center">
                              <QrCode className="h-32 w-32 text-gray-400" />
                            </div>
                          )}
                        </div>
                        
                        {/* Code et info */}
                        <div className="text-center">
                          <div className="text-sm font-mono text-purple-600 bg-purple-50 px-3 py-1 rounded-full inline-block">
                            {connectionData.shortCode}
                          </div>
                          <p className="text-xs text-gray-500 mt-2">
                            {language === 'fr' ? 'Scannez avec votre appareil photo' : 'Scan with your camera'}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Animated dots */}
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full animate-pulse"></div>
                    <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-green-400 rounded-full animate-bounce"></div>
                  </div>
                </div>
                
                {/* QR Info */}
                <div className="bg-blue-50 p-3 rounded-lg text-sm">
                  <p className="text-blue-800 font-medium">
                    {language === 'fr' ? '📱 Instructions :' : '📱 Instructions:'}
                  </p>
                  <p className="text-blue-700">
                    {language === 'fr' 
                      ? '1. Ouvrez l\'appareil photo sur votre téléphone\n2. Pointez vers le QR code\n3. Touchez le lien qui apparaît'
                      : '1. Open camera on your phone\n2. Point at QR code\n3. Tap the link that appears'
                    }
                  </p>
                </div>
                
                <div className="flex space-x-2 justify-center">
                  <Button onClick={downloadSmartQR} variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    {t.download}
                  </Button>
                  <Button onClick={() => shareViaFirebase(connectionData)} className="bg-purple-600 hover:bg-purple-700">
                    <Share2 className="h-4 w-4 mr-2" />
                    {t.share}
                  </Button>
                  <Button onClick={() => copyToClipboard(connectionData.qrData || connectionData.shortCode)} variant="outline">
                    <Copy className="h-4 w-4 mr-2" />
                    {t.copy}
                  </Button>
                </div>
              </div>
            )}

            {method === 'notification' && (
              <div className="text-center space-y-4">
                <div className="bg-white p-8 rounded-xl border-2 border-blue-300 shadow-lg">
                  <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center mb-4">
                    <Bell className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">Notification Push Envoyée</h3>
                  <p className="text-sm text-gray-600">
                    Vos parents recevront une notification push directe avec un bouton pour rejoindre EDUCAFRIC
                  </p>
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-xs text-blue-700">
                      📱 Notification: "Votre enfant vous invite à rejoindre EDUCAFRIC" + bouton d'action
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Firebase Analytics */}
            {connectionData.analytics && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-800 mb-2 flex items-center space-x-2">
                  <Zap className="h-4 w-4 text-orange-500" />
                  <span>Firebase {t.analytics}</span>
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">{t.success_rate}: </span>
                    <span className="font-medium text-green-600">
                      {connectionData.analytics.successRate}%
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">{t.installs}: </span>
                    <span className="font-medium text-blue-600">
                      {connectionData.analytics.installs}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FirebaseParentConnection;