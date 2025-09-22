import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Search, CheckCircle, XCircle, AlertCircle, FileText } from 'lucide-react';

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

export default function Verify() {
  const [verificationCode, setVerificationCode] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [language, setLanguage] = useState<'fr' | 'en'>('fr');

  const searchBulletin = async () => {
    if (!verificationCode.trim()) {
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
      const response = await fetch(`/api/bulletins/verify?code=${encodeURIComponent(verificationCode.trim())}&language=${language}`);
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      searchBulletin();
    }
  };

  const t = {
    fr: {
      title: 'Vérification de Bulletin',
      subtitle: 'Vérifiez l\'authenticité d\'un bulletin scolaire',
      codeLabel: 'Code de vérification',
      codePlaceholder: 'Saisissez le code (ex: ABC12345)',
      searchButton: 'Vérifier',
      searching: 'Vérification...',
      studentInfo: 'Informations de l\'Élève',
      academicInfo: 'Informations Académiques',
      bulletinInfo: 'Informations du Bulletin',
      name: 'Nom et Prénom',
      studentId: 'Matricule',
      birthDate: 'Date de naissance',
      gender: 'Sexe',
      class: 'Classe',
      school: 'Établissement',
      average: 'Moyenne générale',
      term: 'Trimestre',
      year: 'Année académique',
      issuedAt: 'Émis le',
      verificationCount: 'Vérifications',
      status: 'Statut',
      valid: 'Valide',
      invalid: 'Invalide',
      male: 'Masculin',
      female: 'Féminin',
      notProvided: 'Non renseigné'
    },
    en: {
      title: 'Bulletin Verification',
      subtitle: 'Verify the authenticity of a school report card',
      codeLabel: 'Verification code',
      codePlaceholder: 'Enter code (e.g., ABC12345)',
      searchButton: 'Verify',
      searching: 'Verifying...',
      studentInfo: 'Student Information',
      academicInfo: 'Academic Information', 
      bulletinInfo: 'Bulletin Information',
      name: 'Full Name',
      studentId: 'Student ID',
      birthDate: 'Birth date',
      gender: 'Gender',
      class: 'Class',
      school: 'School',
      average: 'General average',
      term: 'Term',
      year: 'Academic year',
      issuedAt: 'Issued on',
      verificationCount: 'Verifications',
      status: 'Status',
      valid: 'Valid',
      invalid: 'Invalid',
      male: 'Male',
      female: 'Female',
      notProvided: 'Not provided'
    }
  };

  const labels = t[language];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="container mx-auto max-w-4xl">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center items-center gap-3 mb-4">
            <FileText className="h-10 w-10 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">{labels.title}</h1>
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

        {/* Search Form */}
        <Card className="mb-8">
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
                onClick={searchBulletin}
                disabled={isSearching || !verificationCode.trim()}
                data-testid="button-verify"
              >
                {isSearching ? labels.searching : labels.searchButton}
              </Button>
            </div>
          </CardContent>
        </Card>

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