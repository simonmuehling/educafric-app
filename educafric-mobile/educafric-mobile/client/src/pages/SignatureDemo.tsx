import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import BulletinSignature from '@/components/director/modules/BulletinSignature';
import { Badge } from '@/components/ui/badge';
import { GraduationCap, FileText, CheckCircle } from 'lucide-react';

const SignatureDemo: React.FC = () => {
  const { language } = useLanguage();

  const handleSignAndSend = async (signatureData: string, signerInfo: any) => {
    // Simuler l'envoi avec la signature
    console.log('📧 Signature appliquée:', { signatureData: signatureData.substring(0, 50) + '...', signerInfo });
    
    // Appel à l'API pour signer et envoyer
    const response = await fetch('/api/signatures/apply-and-send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        bulletinId: 123,
        signatureData,
        signerInfo,
        studentName: 'Marie Nguema'
      }),
    });

    if (!response.ok) {
      throw new Error('Échec de l\'envoi');
    }

    return await response.json();
  };

  const translations = {
    fr: {
      title: 'Démo Signature Numérique',
      subtitle: 'Test du système de signature pour bulletins scolaires',
      student: 'Élève',
      class: 'Classe',
      period: 'Période',
      status: 'Statut',
      ready: 'Prêt à signer',
      instructions: 'Cliquez sur "Signer & Envoyer" pour tester le système de signature numérique.'
    },
    en: {
      title: 'Digital Signature Demo',
      subtitle: 'Test the digital signature system for school bulletins',
      student: 'Student',
      class: 'Class',
      period: 'Period',
      status: 'Status',
      ready: 'Ready to sign',
      instructions: 'Click "Sign & Send" to test the digital signature system.'
    }
  };

  const t = translations[language as keyof typeof translations];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {t.title}
        </h1>
        <p className="text-gray-600">
          {t.subtitle}
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Bulletin de Marie Nguema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">{t.student}</p>
                <p className="font-semibold">Marie Nguema</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600">{t.class}</p>
              <p className="font-semibold">CM2 A</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">{t.period}</p>
              <p className="font-semibold">1er Trimestre 2024-2025</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">{t.status}</p>
              <Badge variant="secondary" className="bg-green-100 text-green-700">
                <CheckCircle className="w-3 h-3 mr-1" />
                {t.ready}
              </Badge>
            </div>
          </div>

          <div className="border-t pt-4">
            <p className="text-sm text-gray-600 mb-4">
              {t.instructions}
            </p>
            
            <BulletinSignature
              bulletinId={123}
              studentName="Marie Nguema"
              onSignAndSend={handleSignAndSend}
            />
          </div>
        </CardContent>
      </Card>

      <div className="text-center text-sm text-gray-500">
        <p>💡 Système de signature prêt pour la démonstration école demain</p>
        <p>✅ Interface intuitive • ✅ Signature sur écran • ✅ Upload fichier • ✅ Intégration envoi</p>
      </div>
    </div>
  );
};

export default SignatureDemo;