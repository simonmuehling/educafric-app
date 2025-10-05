import { useState, useEffect } from 'react';
import { useLocation, useRoute } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, Search, QrCode, School, User, Calendar, TrendingUp, Shield } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface VerificationData {
  student: {
    name: string;
    matricule: string;
    class: string;
  };
  school: {
    name: string;
    id: number;
  };
  academic: {
    term: string;
    academicYear: string;
    generalAverage: string;
    classRank: number;
    totalStudents: number;
  };
  verification: {
    issuedAt: string;
    approvedAt: string;
    verificationCount: number;
    shortCode: string;
  };
  settings: {
    showStudentPhoto: boolean;
    showSchoolLogo: boolean;
    showDetailedGrades: boolean;
  };
}

interface VerificationResult {
  success: boolean;
  message: string;
  messageFr?: string;
  data?: VerificationData;
  errorCode?: string;
}

const BulletinVerification = () => {
  const [location, setLocation] = useLocation();
  const [match] = useRoute('/verify');
  const { toast } = useToast();
  
  const [verificationCode, setVerificationCode] = useState('');
  const [language, setLanguage] = useState<'fr' | 'en'>('fr');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [isAutoVerifying, setIsAutoVerifying] = useState(false);
  
  // Language content
  const content = {
    fr: {
      title: 'Vérification de Bulletin',
      subtitle: 'Authentifiez votre bulletin scolaire avec le code QR ou le code de vérification',
      codeLabel: 'Code de vérification',
      codePlaceholder: 'Entrez le code de vérification',
      verifyButton: 'Vérifier le bulletin',
      scanQRTitle: 'Scanner le code QR',
      scanQRDesc: 'Utilisez l\'appareil photo de votre téléphone pour scanner le code QR sur le bulletin',
      manualTitle: 'Vérification manuelle',
      manualDesc: 'Entrez le code de vérification affiché sur le bulletin',
      studentInfo: 'Informations de l\'élève',
      schoolInfo: 'Informations de l\'établissement',
      academicInfo: 'Informations académiques',
      verificationInfo: 'Informations de vérification',
      student: 'Élève',
      matricule: 'Matricule',
      class: 'Classe',
      school: 'École',
      term: 'Trimestre',
      academicYear: 'Année scolaire',
      average: 'Moyenne générale',
      rank: 'Rang',
      issuedOn: 'Émis le',
      approvedOn: 'Approuvé le',
      verificationCount: 'Nombre de vérifications',
      authentic: 'Bulletin authentique',
      invalid: 'Code de vérification invalide',
      expired: 'Bulletin expiré',
      error: 'Erreur de vérification',
      tryAgain: 'Réessayer',
      newVerification: 'Nouvelle vérification',
      poweredBy: 'Propulsé par EDUCAFRIC',
      secureVerification: 'Vérification sécurisée'
    },
    en: {
      title: 'Bulletin Verification',
      subtitle: 'Authenticate your school report card with QR code or verification code',
      codeLabel: 'Verification code',
      codePlaceholder: 'Enter verification code',
      verifyButton: 'Verify bulletin',
      scanQRTitle: 'Scan QR Code',
      scanQRDesc: 'Use your phone camera to scan the QR code on the bulletin',
      manualTitle: 'Manual verification',
      manualDesc: 'Enter the verification code displayed on the bulletin',
      studentInfo: 'Student Information',
      schoolInfo: 'School Information',
      academicInfo: 'Academic Information',
      verificationInfo: 'Verification Information',
      student: 'Student',
      matricule: 'ID Number',
      class: 'Class',
      school: 'School',
      term: 'Term',
      academicYear: 'Academic Year',
      average: 'Overall Average',
      rank: 'Rank',
      issuedOn: 'Issued on',
      approvedOn: 'Approved on',
      verificationCount: 'Verification count',
      authentic: 'Authentic bulletin',
      invalid: 'Invalid verification code',
      expired: 'Expired bulletin',
      error: 'Verification error',
      tryAgain: 'Try again',
      newVerification: 'New verification',
      poweredBy: 'Powered by EDUCAFRIC',
      secureVerification: 'Secure verification'
    }
  };
  
  const t = content[language];
  
  // Get verification code from URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const codeParam = urlParams.get('code');
    const langParam = urlParams.get('lang') || urlParams.get('language');
    
    if (langParam && (langParam === 'fr' || langParam === 'en')) {
      setLanguage(langParam as 'fr' | 'en');
    }
    
    if (codeParam) {
      setVerificationCode(codeParam);
      setIsAutoVerifying(true);
      handleVerification(codeParam, langParam as 'fr' | 'en' || language);
    }
  }, []);
  
  const handleVerification = async (code?: string, lang?: 'fr' | 'en') => {
    const verifyCode = code || verificationCode;
    const verifyLang = lang || language;
    
    if (!verifyCode.trim()) {
      toast({
        title: verifyLang === 'fr' ? 'Code requis' : 'Code required',
        description: verifyLang === 'fr' ? 'Veuillez entrer un code de vérification' : 'Please enter a verification code',
        variant: 'destructive'
      });
      return;
    }
    
    setIsVerifying(true);
    setVerificationResult(null);
    
    try {
      console.log('[BULLETIN_VERIFY] 🔍 Starting verification for code:', verifyCode.substring(0, 8) + '...');
      
      const response = await apiRequest(`/api/bulletins/verify?code=${encodeURIComponent(verifyCode)}&language=${verifyLang}`, {
        method: 'GET'
      });
      
      console.log('[BULLETIN_VERIFY] ✅ Verification response:', response.success);
      
      setVerificationResult(response);
      
      if (response.success) {
        toast({
          title: t.authentic,
          description: response.message,
          variant: 'default'
        });
      } else {
        toast({
          title: response.errorCode === 'INVALID_CODE' ? t.invalid : 
                response.errorCode === 'EXPIRED' ? t.expired : t.error,
          description: verifyLang === 'fr' ? response.messageFr : response.message,
          variant: 'destructive'
        });
      }
    } catch (error: any) {
      console.error('[BULLETIN_VERIFY] ❌ Verification error:', error);
      
      const errorResult: VerificationResult = {
        success: false,
        message: 'Network error during verification',
        messageFr: 'Erreur réseau lors de la vérification',
        errorCode: 'NETWORK_ERROR'
      };
      
      setVerificationResult(errorResult);
      
      toast({
        title: t.error,
        description: verifyLang === 'fr' ? errorResult.messageFr : errorResult.message,
        variant: 'destructive'
      });
    } finally {
      setIsVerifying(false);
      setIsAutoVerifying(false);
    }
  };
  
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const getTermText = (term: string): string => {
    const terms = {
      'T1': language === 'fr' ? 'Premier Trimestre' : 'First Term',
      'T2': language === 'fr' ? 'Deuxième Trimestre' : 'Second Term',
      'T3': language === 'fr' ? 'Troisième Trimestre' : 'Third Term'
    };
    return terms[term as keyof typeof terms] || term;
  };
  
  const resetVerification = () => {
    setVerificationCode('');
    setVerificationResult(null);
    setIsVerifying(false);
    
    // Clear URL parameters
    const url = new URL(window.location.href);
    url.searchParams.delete('code');
    window.history.replaceState({}, document.title, url.toString());
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {t.title}
            </h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            {t.subtitle}
          </p>
          
          {/* Language Toggle */}
          <div className="flex justify-center gap-2 mt-4">
            <Button
              variant={language === 'fr' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setLanguage('fr')}
              data-testid="button-language-fr"
            >
              Français
            </Button>
            <Button
              variant={language === 'en' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setLanguage('en')}
              data-testid="button-language-en"
            >
              English
            </Button>
          </div>
        </div>
        
        {/* Verification Form */}
        {!verificationResult && (
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* QR Code Scanning */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <QrCode className="w-5 h-5" />
                  {t.scanQRTitle}
                </CardTitle>
                <CardDescription>
                  {t.scanQRDesc}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg text-center">
                  <QrCode className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {language === 'fr' 
                      ? 'Pointez votre caméra vers le code QR' 
                      : 'Point your camera at the QR code'}
                  </p>
                </div>
              </CardContent>
            </Card>
            
            {/* Manual Verification */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  {t.manualTitle}
                </CardTitle>
                <CardDescription>
                  {t.manualDesc}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="verification-code">{t.codeLabel}</Label>
                  <Input
                    id="verification-code"
                    type="text"
                    placeholder={t.codePlaceholder}
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.toUpperCase())}
                    className="font-mono"
                    disabled={isVerifying || isAutoVerifying}
                    data-testid="input-verification-code"
                  />
                </div>
                
                <Button
                  onClick={() => handleVerification()}
                  disabled={isVerifying || isAutoVerifying || !verificationCode.trim()}
                  className="w-full"
                  data-testid="button-verify"
                >
                  {isVerifying || isAutoVerifying ? (
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-white animate-pulse" />
                      {language === 'fr' ? 'Vérification...' : 'Verifying...'}
                    </div>
                  ) : (
                    t.verifyButton
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
        
        {/* Verification Result */}
        {verificationResult && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {verificationResult.success ? (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                ) : (
                  <XCircle className="w-6 h-6 text-red-600" />
                )}
                {verificationResult.success ? t.authentic : 
                 verificationResult.errorCode === 'INVALID_CODE' ? t.invalid :
                 verificationResult.errorCode === 'EXPIRED' ? t.expired : t.error}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {verificationResult.success && verificationResult.data ? (
                <div className="space-y-6">
                  <div className="text-center">
                    <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      {t.secureVerification}
                    </Badge>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Student Information */}
                    <div>
                      <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                        <User className="w-5 h-5" />
                        {t.studentInfo}
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="font-medium">{t.student}:</span>
                          <span data-testid="text-student-name">{verificationResult.data.student.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">{t.matricule}:</span>
                          <span data-testid="text-student-matricule">{verificationResult.data.student.matricule}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">{t.class}:</span>
                          <span data-testid="text-student-class">{verificationResult.data.student.class}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* School Information */}
                    <div>
                      <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                        <School className="w-5 h-5" />
                        {t.schoolInfo}
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="font-medium">{t.school}:</span>
                          <span data-testid="text-school-name">{verificationResult.data.school.name}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Academic Information */}
                    <div>
                      <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                        <Calendar className="w-5 h-5" />
                        {t.academicInfo}
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="font-medium">{t.term}:</span>
                          <span data-testid="text-academic-term">{getTermText(verificationResult.data.academic.term)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">{t.academicYear}:</span>
                          <span data-testid="text-academic-year">{verificationResult.data.academic.academicYear}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">{t.average}:</span>
                          <span className="font-bold text-blue-600" data-testid="text-academic-average">
                            {verificationResult.data.academic.generalAverage}/20
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">{t.rank}:</span>
                          <span data-testid="text-academic-rank">
                            {verificationResult.data.academic.classRank}/{verificationResult.data.academic.totalStudents}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Verification Information */}
                    <div>
                      <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5" />
                        {t.verificationInfo}
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="font-medium">{t.issuedOn}:</span>
                          <span data-testid="text-verification-issued">{formatDate(verificationResult.data.verification.issuedAt)}</span>
                        </div>
                        {verificationResult.data.verification.approvedAt && (
                          <div className="flex justify-between">
                            <span className="font-medium">{t.approvedOn}:</span>
                            <span data-testid="text-verification-approved">{formatDate(verificationResult.data.verification.approvedAt)}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="font-medium">{t.verificationCount}:</span>
                          <span data-testid="text-verification-count">{verificationResult.data.verification.verificationCount}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {language === 'fr' ? verificationResult.messageFr : verificationResult.message}
                  </p>
                  <Button 
                    onClick={resetVerification}
                    variant="outline"
                    data-testid="button-try-again"
                  >
                    {t.tryAgain}
                  </Button>
                </div>
              )}
              
              {verificationResult.success && (
                <div className="mt-6 text-center">
                  <Button 
                    onClick={resetVerification}
                    variant="outline"
                    data-testid="button-new-verification"
                  >
                    {t.newVerification}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}
        
        {/* Footer */}
        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
          <Separator className="mb-4" />
          <p>{t.poweredBy}</p>
        </div>
      </div>
    </div>
  );
};

export default BulletinVerification;