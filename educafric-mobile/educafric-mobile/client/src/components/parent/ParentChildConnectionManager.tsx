import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { QrCode, User, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface ParentChildConnectionManagerProps {
  language: 'fr' | 'en';
}

const ParentChildConnectionManager: React.FC<ParentChildConnectionManagerProps> = ({ language }) => {
  const { toast } = useToast();
  const [activeMethod, setActiveMethod] = useState<string>('qr');
  const [qrToken, setQrToken] = useState('');
  const [manualRequest, setManualRequest] = useState({
    studentFirstName: '',
    studentLastName: '',
    relationshipType: 'parent',
    reason: '',
    identityDocuments: ''
  });
  const [loading, setLoading] = useState(false);

  const texts = {
    fr: {
      title: 'Connexion Parent-Enfant',
      subtitle: 'Connectez-vous à votre enfant avec EDUCAFRIC',
      methods: {
        qr: 'Scanner Code QR',
        manual: 'Demande Manuelle'
      },
      qrSection: {
        title: 'Méthode QR - Connexion Rapide',
        description: 'Demandez à votre enfant de générer un code QR depuis son profil étudiant',
        tokenLabel: 'Token du Code QR',
        tokenPlaceholder: 'qr_1753941234_abc123...',
        scanButton: 'Scanner et Connecter',
        helpText: '1. Votre enfant génère le QR\n2. Vous scannez le code\n3. L\'école valide la connexion'
      },
      manualSection: {
        title: 'Demande Manuelle - Sécurisée',
        description: 'Recherchez votre enfant et soumettez une demande de connexion',
        studentFirstName: 'Prénom de l\'enfant',
        studentLastName: 'Nom de l\'enfant',
        relationshipType: 'Type de relation',
        reason: 'Motif de la demande',
        identityDocuments: 'Documents d\'identité (URL)',
        submitButton: 'Soumettre la Demande',
        helpText: '1. Remplissez les informations\n2. L\'école vérifie votre identité\n3. Connexion approuvée par le directeur'
      },
      relationships: {
        parent: 'Parent Principal',
        secondary_parent: 'Parent Secondaire',
        guardian: 'Tuteur/Responsable',
        emergency_contact: 'Contact d\'Urgence'
      },
      success: 'Succès',
      error: 'Erreur',
      processing: 'Traitement en cours...'
    },
    en: {
      title: 'Parent-Child Connection',
      subtitle: 'Connect to your child with EDUCAFRIC',
      methods: {
        qr: 'Scan QR Code',
        manual: 'Manual Request'
      },
      qrSection: {
        title: 'QR Method - Quick Connection',
        description: 'Ask your child to generate a QR code from their student profile',
        tokenLabel: 'QR Code Token',
        tokenPlaceholder: 'qr_1753941234_abc123...',
        scanButton: 'Scan and Connect',
        helpText: '1. Your child generates the QR\n2. You scan the code\n3. School validates the connection'
      },
      manualSection: {
        title: 'Manual Request - Secure',
        description: 'Search for your child and submit a connection request',
        studentFirstName: 'Child\'s First Name',
        studentLastName: 'Child\'s Last Name',
        relationshipType: 'Relationship Type',
        reason: 'Request Reason',
        identityDocuments: 'Identity Documents (URL)',
        submitButton: 'Submit Request',
        helpText: '1. Fill in the information\n2. School verifies your identity\n3. Connection approved by director'
      },
      relationships: {
        parent: 'Primary Parent',
        secondary_parent: 'Secondary Parent',
        guardian: 'Guardian/Responsible',
        emergency_contact: 'Emergency Contact'
      },
      success: 'Success',
      error: 'Error',
      processing: 'Processing...'
    }
  };

  const t = texts[language];

  const handleQRScan = async () => {
    if (!qrToken.trim()) {
      toast({
        title: t.error,
        description: language === 'fr' ? 'Veuillez entrer un token QR valide' : 'Please enter a valid QR token',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      console.log('[QR_SCAN] Starting QR scan process with token:', qrToken);
      
      const response = await apiRequest('POST', '/api/parent/scan-qr', {
        qrToken: qrToken.trim()
      });

      if (response.ok) {
        const result = await response.json();
        console.log('[QR_SCAN] ✅ QR scan successful:', result);
        
        toast({
          title: t.success,
          description: result.message || (language === 'fr' ? 'Demande de connexion envoyée' : 'Connection request sent'),
          variant: 'default'
        });

        setQrToken('');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'QR scan failed');
      }
    } catch (error: any) {
      console.error('[QR_SCAN] ❌ Error:', error);
      toast({
        title: t.error,
        description: error.message || (language === 'fr' ? 'Erreur lors du scan QR' : 'QR scan error'),
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleManualRequest = async () => {
    if (!manualRequest?.studentFirstName?.trim() || !manualRequest?.studentLastName?.trim()) {
      toast({
        title: t.error,
        description: language === 'fr' ? 'Prénom et nom de l\'enfant requis' : 'Child first and last name required',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      console.log('[MANUAL_REQUEST] Starting manual request process:', manualRequest);
      
      const response = await apiRequest('POST', '/api/parent/request-connection', manualRequest);

      if (response.ok) {
        const result = await response.json();
        console.log('[MANUAL_REQUEST] ✅ Manual request successful:', result);
        
        toast({
          title: t.success,
          description: result.message || (language === 'fr' ? 'Demande soumise pour validation' : 'Request submitted for validation'),
          variant: 'default'
        });

        setManualRequest({
          studentFirstName: '',
          studentLastName: '',
          relationshipType: 'parent',
          reason: '',
          identityDocuments: ''
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Manual request failed');
      }
    } catch (error: any) {
      console.error('[MANUAL_REQUEST] ❌ Error:', error);
      toast({
        title: t.error,
        description: error.message || (language === 'fr' ? 'Erreur lors de la demande' : 'Request error'),
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-3 text-blue-800">
            <User className="h-6 w-6" />
            <span>{t.title || ''}</span>
          </CardTitle>
          <p className="text-blue-600">{t.subtitle}</p>
        </CardHeader>
      </Card>

      {/* ÉQUITÉ PRINCIPE */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <CardContent className="pt-6">
          <div className="flex items-center space-x-3 mb-4">
            <CheckCircle className="h-6 w-6 text-green-600" />
            <h3 className="text-lg font-semibold text-green-800">
              {language === 'fr' ? 'PRINCIPE D\'ÉQUITÉ ABONNEMENT' : 'SUBSCRIPTION EQUITY PRINCIPLE'}
            </h3>
          </div>
          <div className="bg-white p-4 rounded-lg border border-green-200">
            <p className="text-green-700 font-medium text-center">
              {language === 'fr' 
                ? '⚡ TOUS LES PARENTS PAYANTS = MÊMES DROITS COMPLETS' 
                : '⚡ ALL PAYING PARENTS = SAME FULL ACCESS RIGHTS'
              }
            </p>
            <p className="text-green-600 text-sm text-center mt-2">
              {language === 'fr'
                ? 'Parent Principal, Secondaire, Tuteur : Accès identique si abonnement payé'
                : 'Primary, Secondary, Guardian Parents: Identical access if subscription paid'
              }
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Method Selection */}
      <div className="flex space-x-4">
        <Button
          variant={activeMethod === 'qr' ? 'default' : 'outline'}
          onClick={() => setActiveMethod('qr')}
          className="flex items-center space-x-2"
        >
          <QrCode className="h-4 w-4" />
          <span>{t?.methods?.qr}</span>
        </Button>
        <Button
          variant={activeMethod === 'manual' ? 'default' : 'outline'}
          onClick={() => setActiveMethod('manual')}
          className="flex items-center space-x-2"
        >
          <FileText className="h-4 w-4" />
          <span>{t?.methods?.manual}</span>
        </Button>
      </div>

      {/* QR Code Method */}
      {activeMethod === 'qr' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <QrCode className="h-5 w-5 text-blue-600" />
              <span>{t?.qrSection?.title}</span>
            </CardTitle>
            <p className="text-gray-600">{t?.qrSection?.description}</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">{t?.qrSection?.tokenLabel}</label>
              <Input
                value={qrToken}
                onChange={(e) => setQrToken(e?.target?.value)}
                placeholder={t?.qrSection?.tokenPlaceholder}
                className="font-mono"
              />
            </div>
            
            <Button 
              onClick={handleQRScan}
              disabled={loading || !qrToken.trim()}
              className="w-full"
            >
              {loading ? t.processing : t?.qrSection?.scanButton}
            </Button>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">
                {language === 'fr' ? 'Comment ça marche :' : 'How it works:'}
              </h4>
              <pre className="text-sm text-blue-600 whitespace-pre-line">
                {t?.qrSection?.helpText}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Manual Request Method */}
      {activeMethod === 'manual' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-green-600" />
              <span>{t?.manualSection?.title}</span>
            </CardTitle>
            <p className="text-gray-600">{t?.manualSection?.description}</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">{t?.manualSection?.studentFirstName}</label>
                <Input
                  value={manualRequest.studentFirstName}
                  onChange={(e) => setManualRequest(prev => ({ ...prev, studentFirstName: e?.target?.value }))}
                  placeholder="Junior"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">{t?.manualSection?.studentLastName}</label>
                <Input
                  value={manualRequest.studentLastName}
                  onChange={(e) => setManualRequest(prev => ({ ...prev, studentLastName: e?.target?.value }))}
                  placeholder="Kamga"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">{t?.manualSection?.relationshipType}</label>
              <Select
                value={manualRequest.relationshipType}
                onValueChange={(value) => setManualRequest(prev => ({ ...prev, relationshipType: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="parent">{t?.relationships?.parent}</SelectItem>
                  <SelectItem value="secondary_parent">{t?.relationships?.secondary_parent}</SelectItem>
                  <SelectItem value="guardian">{t?.relationships?.guardian}</SelectItem>
                  <SelectItem value="emergency_contact">{t?.relationships?.emergency_contact}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">{t?.manualSection?.reason}</label>
              <Textarea
                value={manualRequest.reason}
                onChange={(e) => setManualRequest(prev => ({ ...prev, reason: e?.target?.value }))}
                placeholder={language === 'fr' ? 'Expliquez pourquoi vous demandez cette connexion...' : 'Explain why you are requesting this connection...'}
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">{t?.manualSection?.identityDocuments}</label>
              <Input
                value={manualRequest.identityDocuments}
                onChange={(e) => setManualRequest(prev => ({ ...prev, identityDocuments: e?.target?.value }))}
                placeholder="https://drive?.google?.com/..."
              />
            </div>
            
            <Button 
              onClick={handleManualRequest}
              disabled={loading || !manualRequest?.studentFirstName?.trim() || !manualRequest?.studentLastName?.trim()}
              className="w-full"
            >
              {loading ? t.processing : t?.manualSection?.submitButton}
            </Button>

            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-medium text-green-800 mb-2">
                {language === 'fr' ? 'Processus de validation :' : 'Validation process:'}
              </h4>
              <pre className="text-sm text-green-600 whitespace-pre-line">
                {t?.manualSection?.helpText}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-blue-200">
          <CardContent className="pt-6 text-center">
            <QrCode className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <h3 className="font-medium text-blue-800">
              {language === 'fr' ? 'Connexion QR' : 'QR Connection'}
            </h3>
            <p className="text-sm text-blue-600">
              {language === 'fr' ? 'Rapide et sécurisé' : 'Fast and secure'}
            </p>
          </CardContent>
        </Card>

        <Card className="border-green-200">
          <CardContent className="pt-6 text-center">
            <FileText className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <h3 className="font-medium text-green-800">
              {language === 'fr' ? 'Demande Manuelle' : 'Manual Request'}
            </h3>
            <p className="text-sm text-green-600">
              {language === 'fr' ? 'Validation école' : 'School validation'}
            </p>
          </CardContent>
        </Card>

        <Card className="border-purple-200">
          <CardContent className="pt-6 text-center">
            <CheckCircle className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <h3 className="font-medium text-purple-800">
              {language === 'fr' ? 'Accès Complet' : 'Full Access'}
            </h3>
            <p className="text-sm text-purple-600">
              {language === 'fr' ? 'Tous droits égaux' : 'All equal rights'}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ParentChildConnectionManager;