import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { AlertTriangle, Users, Phone, Mail, CheckCircle, X, UserPlus, Download } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface DuplicateMatch {
  id: string;
  type: 'parent' | 'student';
  existingUser: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    role: string;
    schoolName?: string;
    grade?: string;
  };
  newUser: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    role: string;
    schoolName?: string;
    grade?: string;
  };
  matchReason: string[];
  confidence: number;
  createdAt: string;
  schoolId: number;
}

interface SmartDuplicateDetectionProps {
  schoolId: number;
  onDuplicateResolved?: () => void;
}

const SmartDuplicateDetection: React.FC<SmartDuplicateDetectionProps> = ({ 
  schoolId, 
  onDuplicateResolved 
}) => {
  const { toast } = useToast();
  const { language } = useLanguage();
  const [duplicates, setDuplicates] = useState<DuplicateMatch[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const text = {
    fr: {
      title: 'Détection de doublons intelligente',
      subtitle: 'Utilisateurs similaires détectés',
      noDetected: 'Aucun doublon détecté',
      confidence: 'Confiance',
      existingUser: 'Utilisateur existant',
      newUser: 'Nouvel utilisateur',
      matchReasons: 'Correspondances détectées',
      actions: 'Actions',
      importUser: 'Importer et fusionner',
      ignoreMatch: 'Ignorer cette correspondance',
      createSeparate: 'Créer séparément',
      processing: 'Traitement...',
      success: 'Fusion réussie',
      ignored: 'Correspondance ignorée',
      created: 'Utilisateur créé séparément',
      phone: 'Téléphone',
      email: 'Email',
      school: 'École',
      grade: 'Classe',
      parent: 'Parent',
      student: 'Élève',
      reasons: {
        'phone_match': 'Même numéro de téléphone',
        'email_match': 'Même adresse email',
        'name_similarity': 'Noms similaires',
        'school_match': 'Même école',
        'family_connection': 'Connexion familiale détectée'
      }
    },
    en: {
      title: 'Smart duplicate detection',
      subtitle: 'Similar users detected',
      noDetected: 'No duplicates detected',
      confidence: 'Confidence',
      existingUser: 'Existing user',
      newUser: 'New user',
      matchReasons: 'Matches detected',
      actions: 'Actions',
      importUser: 'Import and merge',
      ignoreMatch: 'Ignore this match',
      createSeparate: 'Create separately',
      processing: 'Processing...',
      success: 'Merge successful',
      ignored: 'Match ignored',
      created: 'User created separately',
      phone: 'Phone',
      email: 'Email',
      school: 'School',
      grade: 'Grade',
      parent: 'Parent',
      student: 'Student',
      reasons: {
        'phone_match': 'Same phone number',
        'email_match': 'Same email address',
        'name_similarity': 'Similar names',
        'school_match': 'Same school',
        'family_connection': 'Family connection detected'
      }
    }
  };

  const t = text[language as keyof typeof text];

  useEffect(() => {
    fetchDuplicates();
  }, [schoolId]);

  const fetchDuplicates = async () => {
    try {
      const response = await apiRequest('GET', `/api/admin/duplicates/${schoolId}`);
      const data = await response.json();
      
      if (response.ok) {
        setDuplicates(data.duplicates || []);
      }
    } catch (error) {
      console.error('Error fetching duplicates:', error);
    }
  };

  const handleImportAndMerge = async (duplicate: DuplicateMatch) => {
    setProcessingId(duplicate.id);
    setIsLoading(true);
    
    try {
      const response = await apiRequest('POST', '/api/admin/merge-duplicate', {
        duplicateId: duplicate.id,
        existingUserId: duplicate.existingUser.id,
        newUserData: duplicate.newUser,
        schoolId
      });

      const data = await response.json();
      
      if (response.ok) {
        toast({
          title: t.success,
          description: data.message,
        });
        
        // Remove processed duplicate from list
        setDuplicates(prev => prev.filter(d => d.id !== duplicate.id));
        onDuplicateResolved?.();
      } else {
        throw new Error(data.message || 'Merge failed');
      }
    } catch (error: any) {
      toast({
        title: "Erreur de fusion",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setProcessingId(null);
    }
  };

  const handleIgnoreMatch = async (duplicate: DuplicateMatch) => {
    setProcessingId(duplicate.id);
    setIsLoading(true);
    
    try {
      const response = await apiRequest('POST', '/api/admin/ignore-duplicate', {
        duplicateId: duplicate.id,
        schoolId
      });

      const data = await response.json();
      
      if (response.ok) {
        toast({
          title: t.ignored,
          description: data.message,
        });
        
        setDuplicates(prev => prev.filter(d => d.id !== duplicate.id));
      } else {
        throw new Error(data.message || 'Ignore failed');
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setProcessingId(null);
    }
  };

  const handleCreateSeparate = async (duplicate: DuplicateMatch) => {
    setProcessingId(duplicate.id);
    setIsLoading(true);
    
    try {
      const response = await apiRequest('POST', '/api/admin/create-separate', {
        duplicateId: duplicate.id,
        newUserData: duplicate.newUser,
        schoolId
      });

      const data = await response.json();
      
      if (response.ok) {
        toast({
          title: t.created,
          description: data.message,
        });
        
        setDuplicates(prev => prev.filter(d => d.id !== duplicate.id));
        onDuplicateResolved?.();
      } else {
        throw new Error(data.message || 'Creation failed');
      }
    } catch (error: any) {
      toast({
        title: "Erreur de création",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setProcessingId(null);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'bg-red-100 text-red-800';
    if (confidence >= 70) return 'bg-orange-100 text-orange-800';
    return 'bg-yellow-100 text-yellow-800';
  };

  if (duplicates.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader className="text-center">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
          <CardTitle>{t.noDetected}</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <AlertTriangle className="w-6 h-6 text-orange-500" />
          <CardTitle>{t.title}</CardTitle>
        </div>
        <p className="text-sm text-gray-600">{t.subtitle}</p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {duplicates.map((duplicate) => (
          <Card key={duplicate.id} className="border-orange-200">
            <CardContent className="pt-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-orange-500" />
                  <Badge className={getConfidenceColor(duplicate.confidence)}>
                    {t.confidence}: {duplicate.confidence}%
                  </Badge>
                  <Badge variant="outline">
                    {duplicate.type === 'parent' ? t.parent : t.student}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                {/* Existing User */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-green-700">{t.existingUser}</h4>
                  <div className="bg-green-50 p-3 rounded-lg space-y-1">
                    <p className="font-medium">
                      {duplicate.existingUser.firstName} {duplicate.existingUser.lastName}
                    </p>
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="w-3 h-3 mr-1" />
                      {duplicate.existingUser.email}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="w-3 h-3 mr-1" />
                      {duplicate.existingUser.phone}
                    </div>
                    {duplicate.existingUser.schoolName && (
                      <p className="text-sm text-gray-600">
                        {t.school}: {duplicate.existingUser.schoolName}
                      </p>
                    )}
                    {duplicate.existingUser.grade && (
                      <p className="text-sm text-gray-600">
                        {t.grade}: {duplicate.existingUser.grade}
                      </p>
                    )}
                  </div>
                </div>

                {/* New User */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-blue-700">{t.newUser}</h4>
                  <div className="bg-blue-50 p-3 rounded-lg space-y-1">
                    <p className="font-medium">
                      {duplicate.newUser.firstName} {duplicate.newUser.lastName}
                    </p>
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="w-3 h-3 mr-1" />
                      {duplicate.newUser.email}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="w-3 h-3 mr-1" />
                      {duplicate.newUser.phone}
                    </div>
                    {duplicate.newUser.schoolName && (
                      <p className="text-sm text-gray-600">
                        {t.school}: {duplicate.newUser.schoolName}
                      </p>
                    )}
                    {duplicate.newUser.grade && (
                      <p className="text-sm text-gray-600">
                        {t.grade}: {duplicate.newUser.grade}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Match Reasons */}
              <div className="mb-4">
                <h5 className="font-medium mb-2">{t.matchReasons}:</h5>
                <div className="flex flex-wrap gap-2">
                  {duplicate.matchReason.map((reason, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {t.reasons[reason as keyof typeof t.reasons] || reason}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={() => handleImportAndMerge(duplicate)}
                  disabled={isLoading && processingId === duplicate.id}
                  className="bg-green-600 hover:bg-green-700"
                  data-testid={`button-merge-${duplicate.id}`}
                >
                  {isLoading && processingId === duplicate.id ? (
                    <>
                      <Download className="w-4 h-4 mr-2 animate-spin" />
                      {t.processing}
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      {t.importUser}
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  onClick={() => handleCreateSeparate(duplicate)}
                  disabled={isLoading && processingId === duplicate.id}
                  data-testid={`button-separate-${duplicate.id}`}
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  {t.createSeparate}
                </Button>

                <Button
                  variant="ghost"
                  onClick={() => handleIgnoreMatch(duplicate)}
                  disabled={isLoading && processingId === duplicate.id}
                  data-testid={`button-ignore-${duplicate.id}`}
                >
                  <X className="w-4 h-4 mr-2" />
                  {t.ignoreMatch}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </CardContent>
    </Card>
  );
};

export default SmartDuplicateDetection;