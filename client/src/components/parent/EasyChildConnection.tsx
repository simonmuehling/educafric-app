import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { UserPlus, Phone, Mail, School, Users, CheckCircle, Clock } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface EasyChildConnectionProps {
  parentId: number;
  onConnectionSuccess?: () => void;
}

const EasyChildConnection: React.FC<EasyChildConnectionProps> = ({ 
  parentId, 
  onConnectionSuccess 
}) => {
  const { toast } = useToast();
  const { language } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  
  const [childData, setChildData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    dateOfBirth: '',
    grade: '',
    schoolName: '',
    parentRelation: 'parent'
  });

  const [searchResults, setSearchResults] = useState<any[]>([]);

  const text = {
    fr: {
      title: 'Connecter votre enfant',
      subtitle: 'Méthode simple et rapide',
      step1: 'Informations de l\'enfant',
      step2: 'Vérification et connexion',
      firstName: 'Prénom de l\'enfant',
      lastName: 'Nom de l\'enfant',
      phoneNumber: 'Numéro de téléphone de l\'enfant',
      dateOfBirth: 'Date de naissance',
      grade: 'Classe',
      schoolName: 'Nom de l\'école',
      parentRelation: 'Votre relation',
      searchChild: 'Rechercher l\'enfant',
      connecting: 'Connexion en cours...',
      createRequest: 'Créer une demande',
      foundExisting: 'Enfant trouvé dans le système',
      notFound: 'Aucun enfant trouvé',
      willNotify: 'L\'école sera notifiée pour validation',
      success: 'Connexion réussie',
      grades: {
        'maternelle': 'Maternelle',
        'cp': 'CP',
        'ce1': 'CE1',
        'ce2': 'CE2',
        'cm1': 'CM1',
        'cm2': 'CM2',
        '6eme': '6ème',
        '5eme': '5ème',
        '4eme': '4ème',
        '3eme': '3ème',
        'seconde': 'Seconde',
        'premiere': 'Première',
        'terminale': 'Terminale'
      },
      relations: {
        'parent': 'Parent',
        'guardian': 'Tuteur',
        'relative': 'Membre de famille'
      }
    },
    en: {
      title: 'Connect your child',
      subtitle: 'Simple and fast method',
      step1: 'Child information',
      step2: 'Verification and connection',
      firstName: 'Child\'s first name',
      lastName: 'Child\'s last name',
      phoneNumber: 'Child\'s phone number',
      dateOfBirth: 'Date of birth',
      grade: 'Grade',
      schoolName: 'School name',
      parentRelation: 'Your relationship',
      searchChild: 'Search for child',
      connecting: 'Connecting...',
      createRequest: 'Create request',
      foundExisting: 'Child found in system',
      notFound: 'No child found',
      willNotify: 'School will be notified for validation',
      success: 'Connection successful',
      grades: {
        'maternelle': 'Kindergarten',
        'cp': 'Grade 1',
        'ce1': 'Grade 2',
        'ce2': 'Grade 3',
        'cm1': 'Grade 4',
        'cm2': 'Grade 5',
        '6eme': 'Grade 6',
        '5eme': 'Grade 7',
        '4eme': 'Grade 8',
        '3eme': 'Grade 9',
        'seconde': 'Grade 10',
        'premiere': 'Grade 11',
        'terminale': 'Grade 12'
      },
      relations: {
        'parent': 'Parent',
        'guardian': 'Guardian',
        'relative': 'Family member'
      }
    }
  };

  const t = text[language as keyof typeof text];

  const handleSearchChild = async () => {
    setIsLoading(true);
    try {
      const response = await apiRequest('POST', '/api/parent/search-child', {
        firstName: childData.firstName,
        lastName: childData.lastName,
        phoneNumber: childData.phoneNumber,
        schoolName: childData.schoolName,
        dateOfBirth: childData.dateOfBirth
      });

      const data = await response.json();
      
      if (response.ok) {
        setSearchResults(data.results || []);
        setStep(2);
      } else {
        throw new Error(data.message || 'Search failed');
      }
    } catch (error: any) {
      toast({
        title: "Erreur de recherche",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnectToChild = async (childId?: number) => {
    setIsLoading(true);
    try {
      const response = await apiRequest('POST', '/api/parent/connect-child', {
        parentId,
        childId: childId || null,
        childData: childId ? null : childData,
        parentRelation: childData.parentRelation
      });

      const data = await response.json();
      
      if (response.ok) {
        toast({
          title: t.success,
          description: data.message,
        });
        onConnectionSuccess?.();
        setStep(1);
        setChildData({
          firstName: '',
          lastName: '',
          phoneNumber: '',
          dateOfBirth: '',
          grade: '',
          schoolName: '',
          parentRelation: 'parent'
        });
      } else {
        throw new Error(data.message || 'Connection failed');
      }
    } catch (error: any) {
      toast({
        title: "Erreur de connexion",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center space-x-2 mb-2">
          <UserPlus className="w-6 h-6 text-blue-600" />
          <CardTitle>{t.title}</CardTitle>
        </div>
        <p className="text-sm text-gray-600">{t.subtitle}</p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center">
              <School className="w-5 h-5 mr-2" />
              {t.step1}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">{t.firstName}</Label>
                <Input
                  id="firstName"
                  value={childData.firstName}
                  onChange={(e) => setChildData({ ...childData, firstName: e.target.value })}
                  placeholder="Prénom"
                  data-testid="input-child-firstname"
                />
              </div>
              
              <div>
                <Label htmlFor="lastName">{t.lastName}</Label>
                <Input
                  id="lastName"
                  value={childData.lastName}
                  onChange={(e) => setChildData({ ...childData, lastName: e.target.value })}
                  placeholder="Nom"
                  data-testid="input-child-lastname"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phoneNumber">{t.phoneNumber}</Label>
                <div className="flex">
                  <Select value="+237" onValueChange={() => {}}>
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="+237">🇨🇲 +237</SelectItem>
                      <SelectItem value="+33">🇫🇷 +33</SelectItem>
                      <SelectItem value="+1">🇺🇸 +1</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    id="phoneNumber"
                    value={childData.phoneNumber}
                    onChange={(e) => setChildData({ ...childData, phoneNumber: e.target.value })}
                    placeholder="XXX XXX XXX"
                    className="rounded-l-none"
                    data-testid="input-child-phone"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="dateOfBirth">{t.dateOfBirth}</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={childData.dateOfBirth}
                  onChange={(e) => setChildData({ ...childData, dateOfBirth: e.target.value })}
                  data-testid="input-child-dob"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="grade">{t.grade}</Label>
                <Select 
                  value={childData.grade} 
                  onValueChange={(value) => setChildData({ ...childData, grade: value })}
                >
                  <SelectTrigger data-testid="select-child-grade">
                    <SelectValue placeholder="Sélectionner la classe" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(t.grades).map(([key, value]) => (
                      <SelectItem key={key} value={key}>{value}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="parentRelation">{t.parentRelation}</Label>
                <Select 
                  value={childData.parentRelation} 
                  onValueChange={(value) => setChildData({ ...childData, parentRelation: value })}
                >
                  <SelectTrigger data-testid="select-parent-relation">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(t.relations).map(([key, value]) => (
                      <SelectItem key={key} value={key}>{value}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="schoolName">{t.schoolName}</Label>
              <Input
                id="schoolName"
                value={childData.schoolName}
                onChange={(e) => setChildData({ ...childData, schoolName: e.target.value })}
                placeholder="Nom complet de l'école"
                data-testid="input-school-name"
              />
            </div>

            <Button 
              onClick={handleSearchChild}
              disabled={isLoading || !childData.firstName || !childData.lastName}
              className="w-full"
              data-testid="button-search-child"
            >
              {isLoading ? (
                <>
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                  {t.connecting}
                </>
              ) : (
                <>
                  <Users className="w-4 h-4 mr-2" />
                  {t.searchChild}
                </>
              )}
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center">
              <CheckCircle className="w-5 h-5 mr-2" />
              {t.step2}
            </h3>
            
            {searchResults.length > 0 ? (
              <div className="space-y-3">
                <p className="text-green-600 font-medium">{t.foundExisting}</p>
                {searchResults.map((child, index) => (
                  <Card key={index} className="border-green-200">
                    <CardContent className="pt-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-semibold">{child.firstName} {child.lastName}</h4>
                          <p className="text-sm text-gray-600">{child.schoolName} - {child.grade}</p>
                          <p className="text-sm text-gray-600">{child.phoneNumber}</p>
                        </div>
                        <Button 
                          onClick={() => handleConnectToChild(child.id)}
                          disabled={isLoading}
                          data-testid={`button-connect-existing-${index}`}
                        >
                          Connecter
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-orange-600 font-medium">{t.notFound}</p>
                <p className="text-sm text-gray-600">{t.willNotify}</p>
                <Button 
                  onClick={() => handleConnectToChild()}
                  disabled={isLoading}
                  className="w-full"
                  data-testid="button-create-request"
                >
                  {isLoading ? (
                    <>
                      <Clock className="w-4 h-4 mr-2 animate-spin" />
                      {t.connecting}
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 mr-2" />
                      {t.createRequest}
                    </>
                  )}
                </Button>
              </div>
            )}
            
            <Button 
              variant="outline" 
              onClick={() => setStep(1)}
              className="w-full"
              data-testid="button-back"
            >
              Retour
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EasyChildConnection;