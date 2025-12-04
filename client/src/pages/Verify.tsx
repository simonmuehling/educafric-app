import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Search, CheckCircle, XCircle, AlertCircle, FileText, CreditCard, User, School, Calendar, Camera, X, QrCode } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';

interface VerificationResult {
  success: boolean;
  data?: {
    studentName: string;
    studentMatricule: string;
    studentBirthDate?: string;
    studentGender?: string;
    className: string;
    schoolName: string;
    generalAverage?: string;
    term: string;
    academicYear: string;
    issuedAt: string;
    verificationCount: number;
    isActive: boolean;
  };
  message?: string;
  messageFr?: string;
}

interface IDCardResult {
  success: boolean;
  data?: {
    studentName: string;
    studentId: string;
    matricule: string;
    cardId: string;
    className: string;
    schoolName: string;
    schoolLogo?: string;
    birthDate?: string;
    birthPlace?: string;
    validUntil: string;
    issuedAt: string;
    photoUrl?: string;
    isActive: boolean;
  };
  message?: string;
  messageFr?: string;
}

export default function Verify() {
  const [verificationCode, setVerificationCode] = useState('');
  const [cardCode, setCardCode] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [cardResult, setCardResult] = useState<IDCardResult | null>(null);
  const [language, setLanguage] = useState<'fr' | 'en'>('fr');
  const [activeTab, setActiveTab] = useState<'bulletin' | 'idcard'>('bulletin');
  
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scannerTarget, setScannerTarget] = useState<'bulletin' | 'idcard'>('bulletin');
  const [scannerError, setScannerError] = useState<string | null>(null);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerRef = useRef<HTMLDivElement>(null);
  
  const startScanner = async (target: 'bulletin' | 'idcard') => {
    setScannerTarget(target);
    setScannerError(null);
    setIsScannerOpen(true);
    
    setTimeout(async () => {
      try {
        if (!html5QrCodeRef.current) {
          html5QrCodeRef.current = new Html5Qrcode('qr-reader');
        }
        
        await html5QrCodeRef.current.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText) => {
            console.log('[QR_SCAN] Scanned:', decodedText);
            handleQRScanSuccess(decodedText, target);
          },
          (errorMessage) => {
          }
        );
      } catch (err: any) {
        console.error('[QR_SCAN] Error starting scanner:', err);
        setScannerError(err?.message || 'Impossible d\'accéder à la caméra');
      }
    }, 300);
  };
  
  const stopScanner = async () => {
    try {
      if (html5QrCodeRef.current) {
        const isScanning = html5QrCodeRef.current.isScanning;
        if (isScanning) {
          await html5QrCodeRef.current.stop();
        }
      }
    } catch (err) {
      console.error('[QR_SCAN] Error stopping scanner:', err);
    }
    setIsScannerOpen(false);
  };
  
  const handleQRScanSuccess = async (decodedText: string, target: 'bulletin' | 'idcard') => {
    await stopScanner();
    
    if (target === 'bulletin') {
      const params = new URLSearchParams(decodedText.split('?')[1] || '');
      const code = params.get('code') || decodedText;
      setVerificationCode(code);
      setTimeout(() => searchBulletin(code), 300);
    } else {
      let code = decodedText;
      if (decodedText.includes('?')) {
        const params = new URLSearchParams(decodedText.split('?')[1]);
        code = params.get('code') || params.get('id') || decodedText;
      }
      setCardCode(code);
      setTimeout(() => verifyIDCard(code), 300);
    }
  };
  
  // Check URL for type parameter
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const type = params.get('type');
    const code = params.get('code');
    
    if (type === 'student' || type === 'idcard') {
      setActiveTab('idcard');
      if (code) {
        setCardCode(code);
        setTimeout(() => verifyIDCard(code), 500);
      }
    } else if (code) {
      setVerificationCode(code);
      setTimeout(() => searchBulletin(code), 500);
    }
    
    return () => {
      if (html5QrCodeRef.current?.isScanning) {
        html5QrCodeRef.current.stop().catch(() => {});
      }
    };
  }, []);

  const searchBulletin = async (codeToSearch?: string) => {
    const code = codeToSearch || verificationCode;
    if (!code.trim()) {
      setResult({
        success: false,
        message: 'Please enter a verification code',
        messageFr: 'Veuillez saisir un code de vérification'
      });
      return;
    }

    setIsSearching(true);
    setResult(null);

    try {
      const response = await fetch(`/api/bulletins/verify?code=${encodeURIComponent(code.trim())}&language=${language}`);
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        message: 'Network error - please try again',
        messageFr: 'Erreur réseau - veuillez réessayer'
      });
    } finally {
      setIsSearching(false);
    }
  };
  
  const verifyIDCard = async (codeToSearch?: string) => {
    const code = codeToSearch || cardCode;
    if (!code.trim()) {
      setCardResult({
        success: false,
        message: 'Please enter a card ID',
        messageFr: 'Veuillez saisir un numéro de carte'
      });
      return;
    }

    setIsSearching(true);
    setCardResult(null);

    try {
      // Parse the QR code data
      let cardData;
      try {
        cardData = JSON.parse(code);
      } catch {
        // If not JSON, assume it's a card ID directly
        cardData = { cardId: code };
      }
      
      const response = await fetch(`/api/students/verify-card?cardId=${encodeURIComponent(cardData.cardId || code)}&language=${language}`);
      const data = await response.json();
      setCardResult(data);
    } catch (error) {
      setCardResult({
        success: false,
        message: 'Network error - please try again',
        messageFr: 'Erreur réseau - veuillez réessayer'
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (activeTab === 'bulletin') {
        searchBulletin();
      } else {
        verifyIDCard();
      }
    }
  };

  const t = {
    fr: {
      pageTitle: 'Vérification EDUCAFRIC',
      title: 'Vérification de Bulletin',
      idCardTitle: 'Vérification de Carte d\'Identité',
      subtitle: 'Vérifiez l\'authenticité d\'un document scolaire',
      bulletinTab: 'Bulletin Scolaire',
      idCardTab: 'Carte d\'Identité',
      codeLabel: 'Code de vérification',
      cardLabel: 'Numéro de carte / QR Code',
      codePlaceholder: 'Saisissez le code (ex: ABC12345)',
      cardPlaceholder: 'Saisissez le numéro de carte (ex: EDU-2024-000001)',
      searchButton: 'Vérifier',
      searching: 'Vérification...',
      studentInfo: 'Informations de l\'Élève',
      academicInfo: 'Informations Académiques',
      bulletinInfo: 'Informations du Bulletin',
      cardInfo: 'Informations de la Carte',
      name: 'Nom et Prénom',
      studentId: 'Matricule',
      cardId: 'N° Carte',
      birthDate: 'Date de naissance',
      birthPlace: 'Lieu de naissance',
      gender: 'Sexe',
      class: 'Classe',
      school: 'Établissement',
      average: 'Moyenne générale',
      term: 'Trimestre',
      year: 'Année académique',
      issuedAt: 'Émis le',
      validUntil: 'Valide jusqu\'au',
      verificationCount: 'Vérifications',
      status: 'Statut',
      valid: 'Valide',
      invalid: 'Invalide',
      expired: 'Expirée',
      male: 'Masculin',
      female: 'Féminin',
      notProvided: 'Non renseigné',
      cardVerified: 'Carte Authentique',
      cardNotFound: 'Carte non trouvée',
      scanQR: 'Scanner QR',
      scannerTitle: 'Scanner le Code QR',
      scannerHint: 'Placez le code QR dans le cadre',
      closeScanner: 'Fermer',
      cameraError: 'Erreur de caméra'
    },
    en: {
      pageTitle: 'EDUCAFRIC Verification',
      title: 'Bulletin Verification',
      idCardTitle: 'ID Card Verification',
      subtitle: 'Verify the authenticity of a school document',
      bulletinTab: 'School Report',
      idCardTab: 'ID Card',
      codeLabel: 'Verification code',
      cardLabel: 'Card number / QR Code',
      codePlaceholder: 'Enter code (e.g., ABC12345)',
      cardPlaceholder: 'Enter card number (e.g., EDU-2024-000001)',
      searchButton: 'Verify',
      searching: 'Verifying...',
      studentInfo: 'Student Information',
      academicInfo: 'Academic Information', 
      bulletinInfo: 'Bulletin Information',
      cardInfo: 'Card Information',
      name: 'Full Name',
      studentId: 'Student ID',
      cardId: 'Card No.',
      birthDate: 'Birth date',
      birthPlace: 'Place of birth',
      gender: 'Gender',
      class: 'Class',
      school: 'School',
      average: 'General average',
      term: 'Term',
      year: 'Academic year',
      issuedAt: 'Issued on',
      validUntil: 'Valid until',
      verificationCount: 'Verifications',
      status: 'Status',
      valid: 'Valid',
      invalid: 'Invalid',
      expired: 'Expired',
      male: 'Male',
      female: 'Female',
      notProvided: 'Not provided',
      cardVerified: 'Authentic Card',
      cardNotFound: 'Card not found',
      scanQR: 'Scan QR',
      scannerTitle: 'Scan QR Code',
      scannerHint: 'Position the QR code within the frame',
      closeScanner: 'Close',
      cameraError: 'Camera error'
    }
  };

  const labels = t[language];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-100 p-4">
      <div className="container mx-auto max-w-4xl">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center items-center gap-3 mb-4">
            <div className="w-14 h-14 bg-emerald-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-2xl">E</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">{labels.pageTitle}</h1>
          </div>
          <p className="text-gray-600 text-lg">{labels.subtitle}</p>
          
          {/* Language Toggle */}
          <div className="mt-4 flex justify-center gap-2">
            <Button
              variant={language === 'fr' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setLanguage('fr')}
            >
              Français
            </Button>
            <Button
              variant={language === 'en' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setLanguage('en')}
            >
              English
            </Button>
          </div>
        </div>

        {/* Tabbed Verification */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'bulletin' | 'idcard')} className="mb-8">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="bulletin" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              {labels.bulletinTab}
            </TabsTrigger>
            <TabsTrigger value="idcard" className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              {labels.idCardTab}
            </TabsTrigger>
          </TabsList>
          
          {/* Bulletin Verification Tab */}
          <TabsContent value="bulletin">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  {labels.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4">
                  <div className="flex gap-4 items-end">
                    <div className="flex-1">
                      <Label htmlFor="code">{labels.codeLabel}</Label>
                      <Input
                        id="code"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        placeholder={labels.codePlaceholder}
                        onKeyPress={handleKeyPress}
                        className="mt-1"
                        data-testid="input-verification-code"
                      />
                    </div>
                    <Button 
                      onClick={() => searchBulletin()}
                      disabled={isSearching || !verificationCode.trim()}
                      data-testid="button-verify"
                    >
                      {isSearching ? labels.searching : labels.searchButton}
                    </Button>
                  </div>
                  <div className="flex justify-center">
                    <Button 
                      variant="outline"
                      onClick={() => startScanner('bulletin')}
                      className="flex items-center gap-2 border-blue-300 text-blue-600 hover:bg-blue-50"
                      data-testid="button-scan-bulletin"
                    >
                      <Camera className="w-5 h-5" />
                      <QrCode className="w-4 h-4" />
                      {labels.scanQR}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* ID Card Verification Tab */}
          <TabsContent value="idcard">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-emerald-600" />
                  {labels.idCardTitle}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4">
                  <div className="flex gap-4 items-end">
                    <div className="flex-1">
                      <Label htmlFor="cardCode">{labels.cardLabel}</Label>
                      <Input
                        id="cardCode"
                        value={cardCode}
                        onChange={(e) => setCardCode(e.target.value)}
                        placeholder={labels.cardPlaceholder}
                        onKeyPress={handleKeyPress}
                        className="mt-1"
                        data-testid="input-card-code"
                      />
                    </div>
                    <Button 
                      onClick={() => verifyIDCard()}
                      disabled={isSearching || !cardCode.trim()}
                      className="bg-emerald-600 hover:bg-emerald-700"
                      data-testid="button-verify-card"
                    >
                      {isSearching ? labels.searching : labels.searchButton}
                    </Button>
                  </div>
                  <div className="flex justify-center">
                    <Button 
                      variant="outline"
                      onClick={() => startScanner('idcard')}
                      className="flex items-center gap-2 border-emerald-300 text-emerald-600 hover:bg-emerald-50"
                      data-testid="button-scan-idcard"
                    >
                      <Camera className="w-5 h-5" />
                      <QrCode className="w-4 h-4" />
                      {labels.scanQR}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Results */}
        {result && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {result.success ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                {result.success ? labels.valid : labels.invalid}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {result.success && result.data ? (
                <div className="space-y-6">
                  
                  {/* Student Information */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <Badge variant="secondary">{labels.studentInfo}</Badge>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <Label className="text-xs text-gray-500">{labels.name}</Label>
                        <div className="font-medium" data-testid="text-student-name">
                          {result.data.studentName}
                        </div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <Label className="text-xs text-gray-500">{labels.studentId}</Label>
                        <div className="font-medium" data-testid="text-student-id">
                          {result.data.studentMatricule}
                        </div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <Label className="text-xs text-gray-500">{labels.birthDate}</Label>
                        <div className="font-medium" data-testid="text-birth-date">
                          {result.data.studentBirthDate || labels.notProvided}
                        </div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <Label className="text-xs text-gray-500">{labels.gender}</Label>
                        <div className="font-medium" data-testid="text-gender">
                          {result.data.studentGender === 'M' ? labels.male : 
                           result.data.studentGender === 'F' ? labels.female : 
                           labels.notProvided}
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Academic Information */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <Badge variant="secondary">{labels.academicInfo}</Badge>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <Label className="text-xs text-gray-500">{labels.class}</Label>
                        <div className="font-medium" data-testid="text-class">
                          {result.data.className}
                        </div>
                      </div>
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <Label className="text-xs text-gray-500">{labels.school}</Label>
                        <div className="font-medium" data-testid="text-school">
                          {result.data.schoolName}
                        </div>
                      </div>
                      <div className="bg-green-50 p-3 rounded-lg border-2 border-green-200">
                        <Label className="text-xs text-gray-500">{labels.average}</Label>
                        <div className="text-xl font-bold text-green-700" data-testid="text-average">
                          {result.data.generalAverage ? `${result.data.generalAverage}/20` : labels.notProvided}
                        </div>
                      </div>
                      <div className="bg-orange-50 p-3 rounded-lg">
                        <Label className="text-xs text-gray-500">{labels.term} - {labels.year}</Label>
                        <div className="font-medium" data-testid="text-term-year">
                          {result.data.term} {result.data.academicYear}
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Bulletin Information */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <Badge variant="secondary">{labels.bulletinInfo}</Badge>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <Label className="text-xs text-gray-500">{labels.issuedAt}</Label>
                        <div className="font-medium" data-testid="text-issued-date">
                          {new Date(result.data.issuedAt).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US')}
                        </div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <Label className="text-xs text-gray-500">{labels.verificationCount}</Label>
                        <div className="font-medium" data-testid="text-verification-count">
                          {result.data.verificationCount}
                        </div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <Label className="text-xs text-gray-500">{labels.status}</Label>
                        <div className="font-medium" data-testid="text-status">
                          <Badge variant={result.data.isActive ? "default" : "destructive"}>
                            {result.data.isActive ? labels.valid : labels.invalid}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                  <p className="text-lg text-red-600" data-testid="text-error-message">
                    {language === 'fr' ? result.messageFr : result.message}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* ID Card Results */}
        {cardResult && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {cardResult.success ? (
                  <CheckCircle className="h-5 w-5 text-emerald-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                {cardResult.success ? labels.cardVerified : labels.cardNotFound}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {cardResult.success && cardResult.data ? (
                <div className="space-y-6">
                  
                  {/* Student Information */}
                  <div className="flex gap-6">
                    {cardResult.data.photoUrl && (
                      <div className="flex-shrink-0">
                        <img 
                          src={cardResult.data.photoUrl} 
                          alt={cardResult.data.studentName}
                          className="w-24 h-32 rounded-lg object-cover border-2 border-emerald-200"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                        <User className="w-4 h-4 text-emerald-600" />
                        {labels.studentInfo}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-emerald-50 p-3 rounded-lg">
                          <Label className="text-xs text-gray-500">{labels.name}</Label>
                          <div className="font-bold text-lg" data-testid="text-card-student-name">
                            {cardResult.data.studentName}
                          </div>
                        </div>
                        <div className="bg-emerald-50 p-3 rounded-lg">
                          <Label className="text-xs text-gray-500">{labels.studentId}</Label>
                          <div className="font-medium" data-testid="text-card-matricule">
                            {cardResult.data.matricule}
                          </div>
                        </div>
                        {cardResult.data.birthDate && (
                          <div className="bg-amber-50 p-3 rounded-lg">
                            <Label className="text-xs text-gray-500">{labels.birthDate}</Label>
                            <div className="font-medium" data-testid="text-card-birthdate">
                              {cardResult.data.birthDate}
                            </div>
                          </div>
                        )}
                        {cardResult.data.birthPlace && (
                          <div className="bg-amber-50 p-3 rounded-lg">
                            <Label className="text-xs text-gray-500">{labels.birthPlace}</Label>
                            <div className="font-medium" data-testid="text-card-birthplace">
                              {cardResult.data.birthPlace}
                            </div>
                          </div>
                        )}
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <Label className="text-xs text-gray-500">{labels.cardId}</Label>
                          <div className="font-mono font-medium" data-testid="text-card-id">
                            {cardResult.data.cardId}
                          </div>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <Label className="text-xs text-gray-500">{labels.class}</Label>
                          <div className="font-medium" data-testid="text-card-class">
                            {cardResult.data.className}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* School & Card Information */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <School className="w-4 h-4 text-blue-600" />
                      {labels.cardInfo}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <Label className="text-xs text-gray-500">{labels.school}</Label>
                        <div className="font-medium" data-testid="text-card-school">
                          {cardResult.data.schoolName}
                        </div>
                      </div>
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <Label className="text-xs text-gray-500">{labels.issuedAt}</Label>
                        <div className="font-medium" data-testid="text-card-issued">
                          {new Date(cardResult.data.issuedAt).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US')}
                        </div>
                      </div>
                      <div className={`p-3 rounded-lg border-2 ${cardResult.data.isActive ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                        <Label className="text-xs text-gray-500">{labels.validUntil}</Label>
                        <div className="font-bold flex items-center gap-2" data-testid="text-card-valid-until">
                          <Calendar className="w-4 h-4" />
                          {cardResult.data.validUntil}
                        </div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <Label className="text-xs text-gray-500">{labels.status}</Label>
                        <div className="font-medium" data-testid="text-card-status">
                          <Badge variant={cardResult.data.isActive ? "default" : "destructive"} className={cardResult.data.isActive ? "bg-emerald-500" : ""}>
                            {cardResult.data.isActive ? labels.valid : labels.expired}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                  <p className="text-lg text-red-600" data-testid="text-card-error-message">
                    {language === 'fr' ? cardResult.messageFr : cardResult.message}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 mt-8">
          <p>
            {language === 'fr' 
              ? 'Système de vérification sécurisé - EDUCAFRIC'
              : 'Secure verification system - EDUCAFRIC'
            }
          </p>
        </div>

      </div>
      
      {/* QR Scanner Dialog */}
      <Dialog open={isScannerOpen} onOpenChange={(open) => !open && stopScanner()}>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <QrCode className="w-5 h-5 text-emerald-600" />
              {labels.scannerTitle}
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex flex-col items-center gap-4">
            <div 
              id="qr-reader" 
              ref={scannerContainerRef}
              className="w-full max-w-sm rounded-lg overflow-hidden bg-gray-100"
              style={{ minHeight: '300px' }}
            />
            
            {scannerError ? (
              <div className="text-center p-4 bg-red-50 rounded-lg w-full">
                <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                <p className="text-red-600 font-medium">{labels.cameraError}</p>
                <p className="text-sm text-red-500 mt-1">{scannerError}</p>
              </div>
            ) : (
              <p className="text-gray-500 text-sm text-center">
                {labels.scannerHint}
              </p>
            )}
            
            <Button 
              variant="outline" 
              onClick={stopScanner}
              className="w-full flex items-center justify-center gap-2"
              data-testid="button-close-scanner"
            >
              <X className="w-4 h-4" />
              {labels.closeScanner}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}