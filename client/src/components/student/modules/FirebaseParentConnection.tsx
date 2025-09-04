import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Share2, 
  Copy, 
  Smartphone, 
  Heart, 
  Link2,
  CheckCircle2,
  Clock,
  Zap,
  Sparkles
} from 'lucide-react';

interface FirebaseParentConnectionProps {
  studentId?: number;
}

const FirebaseParentConnection: React.FC<FirebaseParentConnectionProps> = ({ studentId }) => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [connectionData, setConnectionData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const texts = {
    fr: {
      title: '🔥 Connexion Intelligente',
      subtitle: 'Technologie moderne pour connecter vos parents instantanément',
      dynamicLinkTitle: '🚀 Lien Dynamique',
      dynamicLinkDescription: 'Lien magique qui ouvre directement l\'app EDUCAFRIC',
      features: ['Auto-installation', 'Données pré-remplies', 'Ultra sécurisé'],
      action: 'Créer Lien Magique',
      share: 'Partager',
      copied: 'Copié !',
      powered_by: 'Technologie Avancée',
      smart_features: 'Fonctionnalités intelligentes',
      auto_install: 'Installation automatique si app manquante',
      deep_link: 'Ouverture directe dans l\'app',
      encrypted: 'Chiffrement bout en bout',
      real_time: 'Synchronisation temps réel',
      generating: 'Génération...',
      linkGenerated: 'Lien Dynamique Sécurisé'
    },
    en: {
      title: '🔥 Smart Connection',
      subtitle: 'Modern technology to connect your parents instantly',
      dynamicLinkTitle: '🚀 Dynamic Link',
      dynamicLinkDescription: 'Magic link that opens EDUCAFRIC app directly',
      features: ['Auto-install', 'Pre-filled data', 'Ultra secure'],
      action: 'Create Magic Link',
      share: 'Share',
      copied: 'Copied!',
      powered_by: 'Advanced Technology',
      smart_features: 'Smart features',
      auto_install: 'Auto-install if app missing',
      deep_link: 'Direct app opening',
      encrypted: 'End-to-end encryption',
      real_time: 'Real-time sync',
      generating: 'Generating...',
      linkGenerated: 'Secure Dynamic Link'
    }
  };

  const t = texts[language as keyof typeof texts];

  const generateConnection = async () => {
    setLoading(true);
    try {
      // Log analytics event
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'parent_connection_request', {
          method: 'dynamic_link',
          student_id: studentId
        });
      }

      const response = await fetch('/api/student/generate-firebase-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          method: 'dynamic_link',
          language
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setConnectionData(result.data);
        
        toast({
          title: language === 'fr' ? '🔥 Lien Dynamique créé !' : '🔥 Dynamic Link created!',
          description: result.message
        });

        // Track success
        if (typeof window !== 'undefined' && (window as any).gtag) {
          (window as any).gtag('event', 'connection_generated', {
            method: 'dynamic_link',
            success: true
          });
        }
      }
    } catch (error) {
      toast({
        title: language === 'fr' ? 'Erreur de connexion' : 'Connection Error',
        description: language === 'fr' ? 'Impossible de générer le lien' : 'Failed to generate link',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const shareLink = async (data: any) => {
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
          title: language === 'fr' ? 'Envoyé !' : 'Sent!',
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

  return (
    <div className="space-y-6">
      {/* En-tête Connexion Intelligente */}
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

      {/* Fonctionnalités Intelligentes */}
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

      {/* Lien Dynamique uniquement */}
      <div className="max-w-md mx-auto">
        <Card className="ring-2 ring-orange-500 bg-orange-50">
          <CardContent className="pt-6">
            <h3 className="font-medium text-gray-800 mb-2">
              {t.dynamicLinkTitle}
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              {t.dynamicLinkDescription}
            </p>
            
            {/* Features */}
            <div className="space-y-1 mb-4">
              {t.features.map((feature, idx) => (
                <div key={idx} className="flex items-center space-x-2">
                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                  <span className="text-xs text-gray-600">{feature}</span>
                </div>
              ))}
            </div>

            <Button 
              onClick={() => generateConnection()}
              disabled={loading}
              className="w-full bg-orange-600 hover:bg-orange-700"
              data-testid="button-generate-dynamic-link"
            >
              {loading ? (
                <>
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                  {t.generating}
                </>
              ) : (
                <>
                  <Link2 className="w-4 h-4 mr-2" />
                  {t.action}
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Affichage du Lien Généré */}
      {connectionData && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-green-800">
              <Zap className="h-5 w-5 text-orange-500" />
              <span>{t.linkGenerated}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-white p-6 rounded-xl border-2 border-orange-300 shadow-lg">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 mx-auto bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center">
                    <Link2 className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-800">{t.linkGenerated}</h3>
                    <p className="text-sm text-gray-600 mt-2 p-3 bg-gray-50 rounded-lg font-mono break-all">
                      {connectionData.dynamicLink}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-2 justify-center">
                <Button onClick={() => shareLink(connectionData)} className="bg-orange-600 hover:bg-orange-700">
                  <Share2 className="h-4 w-4 mr-2" />
                  {t.share}
                </Button>
                <Button onClick={() => copyToClipboard(connectionData.dynamicLink)} variant="outline">
                  <Copy className="h-4 w-4 mr-2" />
                  {t.copied}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FirebaseParentConnection;