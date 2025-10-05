import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  MessageCircle
} from 'lucide-react';

interface ModernParentConnectionProps {
  studentId?: number;
}

const ModernParentConnection: React.FC<ModernParentConnectionProps> = ({ studentId }) => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [connectionData, setConnectionData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [method, setMethod] = useState<'qr' | 'code' | 'link'>('code');

  const texts = {
    fr: {
      title: 'Connecter mes Parents',
      subtitle: 'Plusieurs moyens simples pour que vos parents rejoignent EDUCAFRIC',
      methods: {
        code: {
          title: '🔢 Code de Connexion',
          description: 'Partagez un code simple à 6 chiffres',
          action: 'Générer Code',
          instruction: 'Donnez ce code à vos parents'
        },
        link: {
          title: '🔗 Lien de Connexion',
          description: 'Envoyez un lien magique par SMS/WhatsApp',
          action: 'Créer Lien',
          instruction: 'Partagez ce lien directement'
        },
        qr: {
          title: '📱 QR Code Moderne',
          description: 'Un QR code coloré et attractif',
          action: 'Générer QR',
          instruction: 'Scannez avec l\'appareil photo'
        }
      },
      generate: 'Générer',
      copy: 'Copier',
      share: 'Partager',
      whatsapp: 'WhatsApp',
      sms: 'SMS',
      copied: 'Copié !',
      expires: 'Expire dans',
      valid: 'Valide pour',
      hours: 'heures',
      newCode: 'Nouveau code',
      howItWorks: 'Comment ça marche ?',
      steps: [
        '1. Choisissez votre méthode préférée',
        '2. Partagez le code/lien/QR avec vos parents',
        '3. Vos parents utilisent votre partage pour créer leur compte',
        '4. L\'école valide automatiquement la connexion',
        '5. Vos parents accèdent à vos informations scolaires'
      ]
    },
    en: {
      title: 'Connect My Parents',
      subtitle: 'Multiple simple ways for your parents to join EDUCAFRIC',
      methods: {
        code: {
          title: '🔢 Connection Code',
          description: 'Share a simple 6-digit code',
          action: 'Generate Code',
          instruction: 'Give this code to your parents'
        },
        link: {
          title: '🔗 Connection Link',
          description: 'Send a magic link via SMS/WhatsApp',
          action: 'Create Link',
          instruction: 'Share this link directly'
        },
        qr: {
          title: '📱 Modern QR Code',
          description: 'A colorful and attractive QR code',
          action: 'Generate QR',
          instruction: 'Scan with camera'
        }
      },
      generate: 'Generate',
      copy: 'Copy',
      share: 'Share',
      whatsapp: 'WhatsApp',
      sms: 'SMS',
      copied: 'Copied!',
      expires: 'Expires in',
      valid: 'Valid for',
      hours: 'hours',
      newCode: 'New code',
      howItWorks: 'How it works?',
      steps: [
        '1. Choose your preferred method',
        '2. Share the code/link/QR with your parents',
        '3. Your parents use your sharing to create their account',
        '4. School automatically validates the connection',
        '5. Your parents access your school information'
      ]
    }
  };

  const t = texts[language as keyof typeof texts];

  const generateConnection = async (selectedMethod: 'qr' | 'code' | 'link') => {
    setLoading(true);
    try {
      const response = await fetch('/api/student/generate-parent-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ method: selectedMethod })
      });

      const result = await response.json();
      
      if (result.success) {
        setConnectionData(result.data);
        setMethod(selectedMethod);
        toast({
          title: language === 'fr' ? 'Connexion générée !' : 'Connection generated!',
          description: result.message
        });
      }
    } catch (error) {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' ? 'Impossible de générer la connexion' : 'Failed to generate connection',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: t.copied,
      description: language === 'fr' ? 'Collé dans le presse-papier' : 'Copied to clipboard'
    });
  };

  const shareViaWhatsApp = (text: string) => {
    const message = encodeURIComponent(
      language === 'fr' 
        ? `Salut ! Rejoins EDUCAFRIC pour suivre ma scolarité : ${text}`
        : `Hi! Join EDUCAFRIC to follow my school progress: ${text}`
    );
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  const shareViaSMS = (text: string) => {
    const message = encodeURIComponent(
      language === 'fr' 
        ? `Rejoins EDUCAFRIC avec ce code : ${text}`
        : `Join EDUCAFRIC with this code: ${text}`
    );
    window.open(`sms:?body=${message}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-pink-50 via-purple-50 to-indigo-50 border-purple-200">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center space-x-3 text-purple-800">
            <Heart className="h-6 w-6 text-pink-500" />
            <span>{t.title}</span>
            <Users className="h-6 w-6 text-blue-500" />
          </CardTitle>
          <p className="text-purple-600">{t.subtitle}</p>
        </CardHeader>
      </Card>

      {/* Method Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(['code', 'link', 'qr'] as const).map((methodType) => (
          <Card 
            key={methodType}
            className={`cursor-pointer transition-all hover:shadow-lg ${
              method === methodType ? 'ring-2 ring-purple-500 bg-purple-50' : 'hover:bg-gray-50'
            }`}
            onClick={() => setMethod(methodType)}
          >
            <CardContent className="pt-6 text-center">
              <h3 className="font-medium text-gray-800 mb-2">
                {t.methods[methodType].title}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                {t.methods[methodType].description}
              </p>
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

      {/* Generated Connection Display */}
      {connectionData && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-green-800">
              <CheckCircle2 className="h-5 w-5" />
              <span>{t.methods[method].title} - {language === 'fr' ? 'Généré' : 'Generated'}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {method === 'code' && (
              <div className="text-center space-y-4">
                <div className="bg-white p-8 rounded-xl border-2 border-dashed border-green-300">
                  <div className="text-6xl font-bold text-green-600 tracking-wider">
                    {connectionData.code}
                  </div>
                  <p className="text-green-700 mt-2">{t.methods.code.instruction}</p>
                </div>
                <div className="flex space-x-2 justify-center">
                  <Button onClick={() => copyToClipboard(connectionData.code)} variant="outline">
                    <Copy className="h-4 w-4 mr-2" />
                    {t.copy}
                  </Button>
                  <Button onClick={() => shareViaWhatsApp(connectionData.code)} className="bg-green-600 hover:bg-green-700">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    {t.whatsapp}
                  </Button>
                  <Button onClick={() => shareViaSMS(connectionData.code)} variant="outline">
                    <Smartphone className="h-4 w-4 mr-2" />
                    {t.sms}
                  </Button>
                </div>
              </div>
            )}

            {method === 'link' && (
              <div className="space-y-4">
                <div className="bg-white p-6 rounded-xl border-2 border-blue-300">
                  <div className="flex items-center space-x-3">
                    <Link2 className="h-6 w-6 text-blue-500" />
                    <div className="flex-1">
                      <Input 
                        value={connectionData.link} 
                        readOnly 
                        className="text-sm"
                      />
                    </div>
                  </div>
                  <p className="text-blue-700 mt-2 text-sm">{t.methods.link.instruction}</p>
                </div>
                <div className="flex space-x-2 justify-center">
                  <Button onClick={() => copyToClipboard(connectionData.link)} variant="outline">
                    <Copy className="h-4 w-4 mr-2" />
                    {t.copy}
                  </Button>
                  <Button onClick={() => shareViaWhatsApp(connectionData.link)} className="bg-green-600 hover:bg-green-700">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    {t.whatsapp}
                  </Button>
                  <Button onClick={() => shareViaSMS(connectionData.link)} variant="outline">
                    <Smartphone className="h-4 w-4 mr-2" />
                    {t.sms}
                  </Button>
                </div>
              </div>
            )}

            {method === 'qr' && (
              <div className="text-center space-y-4">
                <div className="bg-white p-6 rounded-xl border-2 border-purple-300">
                  {/* Modern QR Code with EDUCAFRIC branding */}
                  <div className="relative">
                    <div className="w-64 h-64 mx-auto bg-gradient-to-br from-purple-400 via-pink-400 to-blue-400 rounded-3xl p-4 shadow-lg">
                      <div className="w-full h-full bg-white rounded-2xl p-3 flex flex-col items-center justify-center">
                        <QrCode className="h-32 w-32 text-purple-600" />
                        <div className="mt-3 text-center">
                          <div className="text-lg font-bold text-purple-800">EDUCAFRIC</div>
                          <div className="text-sm text-purple-600">{connectionData.code}</div>
                        </div>
                      </div>
                    </div>
                    {/* Decorative elements */}
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full"></div>
                    <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-green-400 rounded-full"></div>
                  </div>
                  <p className="text-purple-700 mt-4">{t.methods.qr.instruction}</p>
                </div>
                <div className="flex space-x-2 justify-center">
                  <Button onClick={() => copyToClipboard(connectionData.qrData)} variant="outline">
                    <Copy className="h-4 w-4 mr-2" />
                    {t.copy}
                  </Button>
                  <Button onClick={() => shareViaWhatsApp(`Code EDUCAFRIC: ${connectionData.code}`)} className="bg-green-600 hover:bg-green-700">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    {t.whatsapp}
                  </Button>
                </div>
              </div>
            )}

            {/* Expiry Info */}
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center justify-center space-x-2">
                <Clock className="h-4 w-4 text-yellow-600" />
                <span className="text-sm text-yellow-800">
                  {t.valid} 24 {t.hours}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card className="border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-800">{t.howItWorks}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {t.steps.map((step, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                  {index + 1}
                </div>
                <p className="text-blue-700 text-sm">{step}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ModernParentConnection;