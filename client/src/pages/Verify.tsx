import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, CheckCircle, XCircle, AlertCircle, FileText, CreditCard, User, School, Calendar } from 'lucide-react';

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
      cardNotFound: 'Carte non trouvée'
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
      cardNotFound: 'Card not found'
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
    </div>
  );
}