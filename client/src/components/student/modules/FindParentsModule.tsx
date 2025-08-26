import React, { useState, Suspense } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

// Importation dynamique du composant Firebase
const FirebaseParentConnection = React.lazy(() => import('./FirebaseParentConnection'));
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Button
} from '@/components/ui/button';
import {
  Input
} from '@/components/ui/input';
import {
  Label
} from '@/components/ui/label';
import {
  Badge
} from '@/components/ui/badge';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  QrCode,
  Users,
  UserPlus,
  Heart,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  Send,
  Phone,
  Mail
} from 'lucide-react';

interface ParentConnection {
  id: number;
  parentId: number;
  parentName: string;
  parentEmail: string;
  parentPhone?: string;
  relationshipType: 'parent' | 'guardian' | 'emergency_contact';
  status: 'verified' | 'pending' | 'rejected';
  requestDate: string;
  verifiedDate?: string;
}

interface ParentRequest {
  parentEmail: string;
  parentPhone: string;
  searchMethod: 'email' | 'phone';
  relationshipType: 'parent' | 'guardian' | 'emergency_contact';
  message: string;
}

const FindParentsModule: React.FC = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState('connections');
  const [qrCode, setQrCode] = useState('');
  const [parentRequest, setParentRequest] = useState<ParentRequest>({
    parentEmail: '',
    parentPhone: '',
    searchMethod: 'email',
    relationshipType: 'parent',
    message: ''
  });

  // Enhanced search states
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const text = {
    en: {
      title: 'Find my Parents',
      subtitle: 'Connect with your parents on EDUCAFRIC',
      tabs: {
        connections: 'My Parents',
        qrCode: '🔥 Firebase',
        search: 'Search Parent'
      },
      noParents: 'No parents connected',
      noParentsDesc: 'Ask your parents to join you on EDUCAFRIC to follow your education',
      generateQR: '🔥 Firebase Connection',
      shareQR: 'Share smart connection',
      qrInstructions: 'New Firebase technology to connect your parents instantly',
      searchParent: 'Search for a parent',
      searchMethod: 'Search method',
      searchByEmail: 'By email',
      searchByPhone: 'By phone',
      searchByName: 'By name',
      parentEmail: 'Parent email',
      parentPhone: 'Parent phone',
      parentName: 'Parent name',
      relationship: 'Relationship type',
      message: 'Message (optional)',
      sendRequest: 'Send request',
      relationships: {
        parent: 'Primary Parent',
        guardian: 'Guardian/Responsible',
        emergency_contact: 'Emergency Contact'
      },
      connectionStatus: {
        verified: 'Verified',
        pending: 'Pending',
        rejected: 'Rejected'
      },
      requestSent: 'Request sent',
      requestSentDesc: 'Your connection request has been sent to the parent',
      qrGenerated: 'QR Code generated',
      qrGeneratedDesc: 'Share this code with your parents for quick connection',
      messagePlaceholder: 'Hello, I am your child on EDUCAFRIC...',
      emailPlaceholder: 'parent@email.com',
      phonePlaceholder: '+237656200472',
      error: 'Error',
      fillRequired: 'Please fill the parent email or phone',
      validEmail: 'Please enter a valid email',
      validPhone: 'Please enter a valid phone number',
      requestedOn: 'Requested on',
      verifiedOn: 'Verified on',
      searchPlaceholder: 'Search by name, email or phone...',
      connecting: 'Connecting...',
      searchResults: 'Search results',
      noResults: 'No parents found',
      selectParent: 'Select this parent',
      searchHint: 'Type at least 3 characters to search'
    },
    fr: {
      title: 'Trouver mes Parents',
      subtitle: 'Connectez-vous avec vos parents sur EDUCAFRIC',
      tabs: {
        connections: 'Mes Parents',
        qrCode: '🔥 Firebase',
        search: 'Rechercher Parent'
      },
      noParents: 'Aucun parent connecté',
      noParentsDesc: 'Demandez à vos parents de vous rejoindre sur EDUCAFRIC pour suivre votre scolarité',
      generateQR: '🔥 Connexion Firebase',
      shareQR: 'Partager la connexion intelligente',
      qrInstructions: 'Nouvelle technologie Firebase pour connecter vos parents instantanément',
      searchParent: 'Rechercher un parent',
      searchMethod: 'Méthode de recherche',
      searchByEmail: 'Par email',
      searchByPhone: 'Par téléphone',
      searchByName: 'Par nom',
      parentEmail: 'Email du parent',
      parentPhone: 'Téléphone du parent',
      parentName: 'Nom du parent',
      relationship: 'Type de relation',
      message: 'Message (optionnel)',
      sendRequest: 'Envoyer demande',
      relationships: {
        parent: 'Parent Principal',
        guardian: 'Tuteur/Responsable',
        emergency_contact: 'Contact d\'Urgence'
      },
      connectionStatus: {
        verified: 'Vérifié',
        pending: 'En attente',
        rejected: 'Rejeté'
      },
      requestSent: 'Demande envoyée',
      requestSentDesc: 'Votre demande de connexion a été envoyée au parent',
      qrGenerated: 'Code QR généré',
      qrGeneratedDesc: 'Partagez ce code avec vos parents pour une connexion rapide',
      messagePlaceholder: 'Bonjour, je suis votre enfant sur EDUCAFRIC...',
      emailPlaceholder: 'parent@email.com',
      phonePlaceholder: '+237656200472',
      error: 'Erreur',
      fillRequired: 'Veuillez remplir l\'email ou le téléphone du parent',
      validEmail: 'Veuillez entrer un email valide',
      validPhone: 'Veuillez entrer un numéro de téléphone valide',
      requestedOn: 'Demandé le',
      verifiedOn: 'Vérifié le',
      searchPlaceholder: 'Rechercher par nom, email ou téléphone...',
      connecting: 'Connexion...',
      searchResults: 'Résultats de recherche',
      noResults: 'Aucun parent trouvé',
      selectParent: 'Sélectionner ce parent',
      searchHint: 'Tapez au moins 3 caractères pour rechercher'
    }
  };

  const t = text[language];

  // Fetch parent connections
  const { data: parentConnections = [], isLoading: connectionsLoading, refetch: refetchConnections } = useQuery<ParentConnection[]>({
    queryKey: ['/api/student-parent/connections'],
    queryFn: async () => {
      const response = await fetch('/api/student/parent-connections', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch parent connections');
      const data = await response.json();
      return data.connections || [];
    },
    retry: false,
  });

  // Enhanced search mutation for parents
  const searchParentsMutation = useMutation({
    mutationFn: async (query: string) => {
      if (!query || query.length < 3) return [];
      return apiRequest('/api/student-parent/search-parents', 'POST', { 
        searchValue: query,
        searchType: 'universal'
      });
    },
    onSuccess: (data: any) => {
      setSearchResults(data.users || []);
      setIsSearching(false);
    },
    onError: (error: any) => {
      setSearchResults([]);
      setIsSearching(false);
      toast({
        title: t.error,
        description: error.message || 'Failed to search parents',
        variant: 'destructive',
      });
    }
  });

  // Generate QR code mutation
  const generateQRMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/student/generate-qr', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ purpose: 'parent-connection' })
      });
      if (!response.ok) throw new Error('Failed to generate QR code');
      return response.json();
    },
    onSuccess: (data: any) => {
      setQrCode(data.qrCode?.url || data.qrToken);
      toast({
        title: t.qrGenerated,
        description: t.qrGeneratedDesc,
      });
    },
    onError: (error: any) => {
      toast({
        title: t.error,
        description: error.message || 'Failed to generate QR code',
        variant: 'destructive',
      });
    }
  });

  // Send parent request mutation
  const sendRequestMutation = useMutation({
    mutationFn: async (requestData: ParentRequest) => {
      return apiRequest('/api/student-parent/connections', 'POST', {
        parentEmail: requestData.parentEmail,
        parentPhone: requestData.parentPhone,
        relationshipType: requestData.relationshipType,
        connectionType: 'guardian'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/student-parent/connections'] });
      setParentRequest({
        parentEmail: '',
        parentPhone: '',
        searchMethod: 'email',
        relationshipType: 'parent',
        message: ''
      });
      setSearchQuery('');
      setSearchResults([]);
      toast({
        title: t.requestSent,
        description: t.requestSentDesc,
      });
    },
    onError: (error: any) => {
      toast({
        title: t.error,
        description: error.message || 'Failed to send request',
        variant: 'destructive',
      });
    }
  });

  // Enhanced search handling
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (value.length >= 3) {
      setIsSearching(true);
      // Debounce search
      setTimeout(() => {
        searchParentsMutation.mutate(value);
      }, 500);
    } else {
      setSearchResults([]);
      setIsSearching(false);
    }
  };

  const handleSelectParent = (parent: any) => {
    setParentRequest({
      ...parentRequest,
      parentEmail: parent.email || '',
      parentPhone: parent.phone || '',
      searchMethod: parent.email ? 'email' : 'phone'
    });
    setSearchQuery(`${parent.firstName} ${parent.lastName}`);
    setSearchResults([]);
  };

  const handleSendRequest = () => {
    // Validate based on search method
    if (parentRequest.searchMethod === 'email') {
      if (!parentRequest.parentEmail.trim()) {
        toast({
          title: t.error,
          description: t.fillRequired,
          variant: 'destructive',
        });
        return;
      }

      // Simple email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(parentRequest.parentEmail)) {
        toast({
          title: t.error,
          description: t.validEmail,
          variant: 'destructive',
        });
        return;
      }
    } else {
      if (!parentRequest.parentPhone.trim()) {
        toast({
          title: t.error,
          description: t.fillRequired,
          variant: 'destructive',
        });
        return;
      }

      // Phone validation (Cameroon format + international)
      const phoneRegex = /^(\+237|237)?[6-9][0-9]{8}$|^\+[1-9][0-9]{1,14}$/;
      if (!phoneRegex.test(parentRequest.parentPhone.replace(/\s/g, ''))) {
        toast({
          title: t.error,
          description: t.validPhone,
          variant: 'destructive',
        });
        return;
      }
    }

    sendRequestMutation.mutate(parentRequest);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified': return <CheckCircle2 className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white p-6 rounded-xl">
        <h1 className="text-2xl font-bold flex items-center gap-3">
          <Heart className="w-8 h-8" />
          {t.title}
        </h1>
        <p className="text-pink-100 mt-2">{t.subtitle}</p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="connections" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            {t.tabs.connections}
          </TabsTrigger>
          <TabsTrigger value="qrCode" className="flex items-center gap-2">
            <QrCode className="w-4 h-4" />
            {t.tabs.qrCode}
          </TabsTrigger>
          <TabsTrigger value="search" className="flex items-center gap-2">
            <Search className="w-4 h-4" />
            {t.tabs.search}
          </TabsTrigger>
        </TabsList>

        {/* My Parents Tab */}
        <TabsContent value="connections" className="space-y-4">
          {connectionsLoading ? (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">
                  {language === 'fr' ? 'Chargement...' : 'Loading...'}
                </p>
              </CardContent>
            </Card>
          ) : parentConnections.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">{t.noParents}</h3>
                <p className="text-gray-500 mb-6">{t.noParentsDesc}</p>
                <div className="flex gap-3 justify-center">
                  <Button 
                    onClick={() => setActiveTab('qrCode')}
                    className="bg-pink-600 hover:bg-pink-700"
                    data-testid="button-goto-qr"
                  >
                    <QrCode className="w-4 h-4 mr-2" />
                    {t.generateQR}
                  </Button>
                  <Button 
                    onClick={() => setActiveTab('search')}
                    variant="outline"
                    data-testid="button-goto-search"
                  >
                    <Search className="w-4 h-4 mr-2" />
                    {t.searchParent}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {(parentConnections as ParentConnection[]).map((connection: ParentConnection) => (
                <Card key={connection.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                            {connection.parentName.split(' ').map(n => n.charAt(0)).join('')}
                          </div>
                          <div>
                            <h4 className="text-xl font-bold text-gray-800">
                              {connection.parentName}
                            </h4>
                            <div className="flex gap-2 mt-1">
                              <Badge className={getStatusColor(connection.status)}>
                                {getStatusIcon(connection.status)}
                                {t.connectionStatus[connection.status as keyof typeof t.connectionStatus]}
                              </Badge>
                              <Badge variant="outline">
                                {t.relationships[connection.relationshipType as keyof typeof t.relationships]}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <p className="text-sm text-gray-600 flex items-center gap-1">
                              <Mail className="w-4 h-4" />
                              Email
                            </p>
                            <p className="font-semibold text-gray-800">{connection.parentEmail}</p>
                          </div>
                          {connection.parentPhone && (
                            <div>
                              <p className="text-sm text-gray-600 flex items-center gap-1">
                                <Phone className="w-4 h-4" />
                                {language === 'fr' ? 'Téléphone' : 'Phone'}
                              </p>
                              <p className="font-semibold text-gray-800">{connection.parentPhone}</p>
                            </div>
                          )}
                          <div>
                            <p className="text-sm text-gray-600 flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {connection.status === 'verified' ? t.verifiedOn : t.requestedOn}
                            </p>
                            <p className="font-semibold text-gray-800">
                              {new Date(connection.verifiedDate || connection.requestDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Firebase Smart Connection Tab */}
        <TabsContent value="qrCode" className="space-y-4">
          <Suspense fallback={
            <Card>
              <CardContent className="p-8 text-center">
                <div className="animate-pulse">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                  </div>
                  <p className="text-gray-600">
                    {language === 'fr' ? 'Chargement Firebase...' : 'Loading Firebase...'}
                  </p>
                </div>
              </CardContent>
            </Card>
          }>
            <FirebaseParentConnection studentId={user?.id} />
          </Suspense>
        </TabsContent>

        {/* Search Parent Tab */}
        <TabsContent value="search" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                {t.searchParent}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="searchMethod">{t.searchMethod} *</Label>
                  <select
                    id="searchMethod"
                    value={parentRequest.searchMethod}
                    onChange={(e) => setParentRequest(prev => ({ 
                      ...prev, 
                      searchMethod: e.target.value as 'email' | 'phone',
                      parentEmail: '', // Reset fields when switching
                      parentPhone: ''
                    }))}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    data-testid="select-search-method"
                  >
                    <option value="email">{t.searchByEmail}</option>
                    <option value="phone">{t.searchByPhone}</option>
                  </select>
                </div>

                {parentRequest.searchMethod === 'email' ? (
                  <div>
                    <Label htmlFor="parentEmail">{t.parentEmail} *</Label>
                    <Input
                      id="parentEmail"
                      type="email"
                      value={parentRequest.parentEmail}
                      onChange={(e) => setParentRequest(prev => ({ ...prev, parentEmail: e.target.value }))}
                      placeholder={t.emailPlaceholder}
                      data-testid="input-parent-email"
                    />
                  </div>
                ) : (
                  <div>
                    <Label htmlFor="parentPhone">{t.parentPhone} *</Label>
                    <Input
                      id="parentPhone"
                      type="tel"
                      value={parentRequest.parentPhone}
                      onChange={(e) => setParentRequest(prev => ({ ...prev, parentPhone: e.target.value }))}
                      placeholder={t.phonePlaceholder}
                      data-testid="input-parent-phone"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {language === 'fr' ? 
                        'Format: +237656200472 ou 656200472' :
                        'Format: +237656200472 or 656200472'
                      }
                    </p>
                  </div>
                )}

                <div>
                  <Label htmlFor="relationship">{t.relationship} *</Label>
                  <select
                    id="relationship"
                    value={parentRequest.relationshipType}
                    onChange={(e) => setParentRequest(prev => ({ 
                      ...prev, 
                      relationshipType: e.target.value as 'parent' | 'guardian' | 'emergency_contact' 
                    }))}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    data-testid="select-relationship-type"
                  >
                    <option value="parent">{t.relationships.parent}</option>
                    <option value="guardian">{t.relationships.guardian}</option>
                    <option value="emergency_contact">{t.relationships.emergency_contact}</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="message">{t.message}</Label>
                  <Input
                    id="message"
                    value={parentRequest.message}
                    onChange={(e) => setParentRequest(prev => ({ ...prev, message: e.target.value }))}
                    placeholder={t.messagePlaceholder}
                    data-testid="input-message"
                  />
                </div>

                <Button
                  onClick={handleSendRequest}
                  disabled={sendRequestMutation.isPending}
                  className="w-full bg-pink-600 hover:bg-pink-700"
                  data-testid="button-send-request"
                >
                  {sendRequestMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {language === 'fr' ? 'Envoi...' : 'Sending...'}
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      {t.sendRequest}
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FindParentsModule;