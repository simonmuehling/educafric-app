import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { UserPlus, Phone, Mail, Users, CheckCircle, Clock, Heart, Search } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface ChildParentConnectionProps {
  studentId: number;
  onConnectionSuccess?: () => void;
}

const ChildParentConnection: React.FC<ChildParentConnectionProps> = ({ 
  studentId, 
  onConnectionSuccess 
}) => {
  const { toast } = useToast();
  const { language } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  
  const [parentData, setParentData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    email: '',
    profession: '',
    relationship: 'parent', // parent, guardian, relative
    address: '',
    emergencyContact: '',
    notes: ''
  });

  const [searchResults, setSearchResults] = useState<any[]>([]);

  const text = {
    fr: {
      title: 'Trouver mes parents',
      subtitle: 'Connexion facile pour les élèves',
      step1: 'Informations de mon parent/tuteur',
      step2: 'Vérification et connexion',
      firstName: 'Prénom du parent',
      lastName: 'Nom du parent',
      phoneNumber: 'Numéro de téléphone',
      email: 'Adresse email',
      profession: 'Profession',
      relationship: 'Relation familiale',
      address: 'Adresse',
      emergencyContact: 'Contact d\'urgence',
      notes: 'Notes supplémentaires',
      searchParent: 'Rechercher mon parent',
      connecting: 'Connexion en cours...',
      createRequest: 'Créer une demande',
      foundExisting: 'Parent trouvé dans le système',
      notFound: 'Aucun parent trouvé',
      willNotify: 'Votre école et le parent seront notifiés',
      success: 'Connexion réussie',
      relationships: {
        'parent': 'Parent',
        'guardian': 'Tuteur légal',
        'grandparent': 'Grand-parent',
        'uncle_aunt': 'Oncle/Tante',
        'sibling': 'Frère/Sœur majeur(e)',
        'family_friend': 'Ami de la famille',
        'other': 'Autre'
      },
      helpText: 'Demandez à votre parent de vous donner ces informations',
      privacyNote: 'Ces informations restent confidentielles et sécurisées'
    },
    en: {
      title: 'Find my parents',
      subtitle: 'Easy connection for students',
      step1: 'Information about my parent/guardian',
      step2: 'Verification and connection',
      firstName: 'Parent\'s first name',
      lastName: 'Parent\'s last name',
      phoneNumber: 'Phone number',
      email: 'Email address',
      profession: 'Profession',
      relationship: 'Family relationship',
      address: 'Address',
      emergencyContact: 'Emergency contact',
      notes: 'Additional notes',
      searchParent: 'Search for my parent',
      connecting: 'Connecting...',
      createRequest: 'Create request',
      foundExisting: 'Parent found in system',
      notFound: 'No parent found',
      willNotify: 'Your school and parent will be notified',
      success: 'Connection successful',
      relationships: {
        'parent': 'Parent',
        'guardian': 'Legal guardian',
        'grandparent': 'Grandparent',
        'uncle_aunt': 'Uncle/Aunt',
        'sibling': 'Adult sibling',
        'family_friend': 'Family friend',
        'other': 'Other'
      },
      helpText: 'Ask your parent to give you this information',
      privacyNote: 'This information remains confidential and secure'
    }
  };

  const t = text[language as keyof typeof text];

  const handleSearchParent = async () => {
    setIsLoading(true);
    try {
      const response = await apiRequest('POST', '/api/student/search-parent', {
        firstName: parentData.firstName,
        lastName: parentData.lastName,
        phoneNumber: parentData.phoneNumber,
        email: parentData.email
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

  const handleConnectToParent = async (parentId?: number) => {
    setIsLoading(true);
    try {
      const response = await apiRequest('POST', '/api/student/connect-parent', {
        studentId,
        parentId: parentId || null,
        parentData: parentId ? null : parentData,
        relationship: parentData.relationship
      });

      const data = await response.json();
      
      if (response.ok) {
        toast({
          title: t.success,
          description: data.message,
        });
        onConnectionSuccess?.();
        setStep(1);
        setParentData({
          firstName: '',
          lastName: '',
          phoneNumber: '',
          email: '',
          profession: '',
          relationship: 'parent',
          address: '',
          emergencyContact: '',
          notes: ''
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
          <Heart className="w-6 h-6 text-pink-600" />
          <CardTitle>{t.title}</CardTitle>
        </div>
        <p className="text-sm text-gray-600">{t.subtitle}</p>
        <p className="text-xs text-blue-600 mt-2">{t.helpText}</p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center">
              <Users className="w-5 h-5 mr-2" />
              {t.step1}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">{t.firstName}</Label>
                <Input
                  id="firstName"
                  value={parentData.firstName}
                  onChange={(e) => setParentData({ ...parentData, firstName: e.target.value })}
                  placeholder="Prénom"
                  data-testid="input-parent-firstname"
                />
              </div>
              
              <div>
                <Label htmlFor="lastName">{t.lastName}</Label>
                <Input
                  id="lastName"
                  value={parentData.lastName}
                  onChange={(e) => setParentData({ ...parentData, lastName: e.target.value })}
                  placeholder="Nom"
                  data-testid="input-parent-lastname"
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
                    value={parentData.phoneNumber}
                    onChange={(e) => setParentData({ ...parentData, phoneNumber: e.target.value })}
                    placeholder="XXX XXX XXX"
                    className="rounded-l-none"
                    data-testid="input-parent-phone"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="email">{t.email}</Label>
                <Input
                  id="email"
                  type="email"
                  value={parentData.email}
                  onChange={(e) => setParentData({ ...parentData, email: e.target.value })}
                  placeholder="email@example.com"
                  data-testid="input-parent-email"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="relationship">{t.relationship}</Label>
                <Select 
                  value={parentData.relationship} 
                  onValueChange={(value) => setParentData({ ...parentData, relationship: value })}
                >
                  <SelectTrigger data-testid="select-relationship">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(t.relationships).map(([key, value]) => (
                      <SelectItem key={key} value={key}>{value}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="profession">{t.profession}</Label>
                <Input
                  id="profession"
                  value={parentData.profession}
                  onChange={(e) => setParentData({ ...parentData, profession: e.target.value })}
                  placeholder="Ex: Enseignante, Médecin..."
                  data-testid="input-profession"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="address">{t.address}</Label>
              <Input
                id="address"
                value={parentData.address}
                onChange={(e) => setParentData({ ...parentData, address: e.target.value })}
                placeholder="Adresse complète"
                data-testid="input-address"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="emergencyContact">{t.emergencyContact}</Label>
                <Input
                  id="emergencyContact"
                  value={parentData.emergencyContact}
                  onChange={(e) => setParentData({ ...parentData, emergencyContact: e.target.value })}
                  placeholder="+237 XXX XXX XXX"
                  data-testid="input-emergency-contact"
                />
              </div>
              
              <div>
                <Label htmlFor="notes">{t.notes}</Label>
                <Input
                  id="notes"
                  value={parentData.notes}
                  onChange={(e) => setParentData({ ...parentData, notes: e.target.value })}
                  placeholder="Informations supplémentaires"
                  data-testid="input-notes"
                />
              </div>
            </div>

            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-xs text-blue-700">{t.privacyNote}</p>
            </div>

            <Button 
              onClick={handleSearchParent}
              disabled={isLoading || !parentData.firstName || !parentData.lastName}
              className="w-full"
              data-testid="button-search-parent"
            >
              {isLoading ? (
                <>
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                  {t.connecting}
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  {t.searchParent}
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
                {searchResults.map((parent, index) => (
                  <Card key={index} className="border-green-200">
                    <CardContent className="pt-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-semibold">{parent.firstName} {parent.lastName}</h4>
                          <p className="text-sm text-gray-600">{parent.profession}</p>
                          <div className="flex items-center text-sm text-gray-600 mt-1">
                            <Mail className="w-3 h-3 mr-1" />
                            {parent.email}
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Phone className="w-3 h-3 mr-1" />
                            {parent.phone}
                          </div>
                          {parent.children && (
                            <p className="text-xs text-blue-600 mt-1">
                              Enfants: {parent.children}
                            </p>
                          )}
                        </div>
                        <Button 
                          onClick={() => handleConnectToParent(parent.id)}
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
                  onClick={() => handleConnectToParent()}
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

export default ChildParentConnection;