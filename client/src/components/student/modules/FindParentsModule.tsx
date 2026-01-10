import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { formatName } from '@/utils/formatName';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import QRCode from 'qrcode';
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
  Mail,
  Download,
  Copy,
  Share,
  Loader2
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
  relationshipType: 'parent' | 'guardian';
}

const FindParentsModule: React.FC = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState('connections');
  const [qrCode, setQrCode] = useState('');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [magicLink, setMagicLink] = useState<string>('');
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);
  const [parentRequest, setParentRequest] = useState<ParentRequest>({
    parentEmail: '',
    parentPhone: '',
    searchMethod: 'email',
    relationshipType: 'parent'
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
        qrCode: '📱 Quick Connect',
        search: 'Search Parent'
      },
      noParents: 'No parents connected',
      noParentsDesc: 'Ask your parents to join you on EDUCAFRIC to follow your education',
      generateQR: '📱 Generate Magic Link',
      shareQR: 'Share quick connection',
      qrInstructions: 'Generate a magic link or QR code to connect your parents instantly',
      searchParent: 'Search for a parent',
      searchMethod: 'Search method',
      searchByEmail: 'By email',
      searchByPhone: 'By phone',
      searchByName: 'By name',
      parentEmail: 'Parent email',
      parentPhone: 'Parent phone',
      parentName: 'Parent name',
      relationship: 'Relationship type',
      sendRequest: 'Send request',
      relationships: {
        parent: 'Parent/Guardian',
        guardian: 'Guardian',
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
        qrCode: '📱 Connexion Rapide',
        search: 'Rechercher Parent'
      },
      noParents: 'Aucun parent connecté',
      noParentsDesc: 'Demandez à vos parents de vous rejoindre sur EDUCAFRIC pour suivre votre scolarité',
      generateQR: '📱 Générer Lien Magique',
      shareQR: 'Partager la connexion rapide',
      qrInstructions: 'Générez un lien magique ou code QR pour connecter vos parents instantanément',
      searchParent: 'Rechercher un parent',
      searchMethod: 'Méthode de recherche',
      searchByEmail: 'Par email',
      searchByPhone: 'Par téléphone',
      searchByName: 'Par nom',
      parentEmail: 'Email du parent',
      parentPhone: 'Téléphone du parent',
      parentName: 'Nom du parent',
      relationship: 'Type de relation',
      sendRequest: 'Envoyer demande',
      relationships: {
        parent: 'Parent/Tuteur',
        guardian: 'Tuteur',
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

  // 🔧 FONCTION GÉNÉRATION QR CODE VIA API
  const generateQRCode = async () => {
    if (!user) return;
    
    setIsGeneratingQR(true);
    try {
      console.log('[QR_GENERATOR] 📱 Generating QR code via API for student:', user.id);
      
      // Appeler l'API pour générer le QR code avec les vraies données
      const response = await fetch('/api/student/generate-qr', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ purpose: 'parent-connection' })
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate QR code');
      }
      
      const data = await response.json();
      console.log('[QR_GENERATOR] 📱 API response:', data);
      
      // Récupérer le lien magique depuis l'API
      const apiMagicLink = data.dynamicLink || data.qrData || 
        `${window.location.origin}/parent-connect?student=${user.id}&token=${data.qrToken || data.token}`;
      setMagicLink(apiMagicLink);
      
      // Générer le QR code avec le lien magique
      const qrDataURL = await QRCode.toDataURL(apiMagicLink, {
        width: 300,
        margin: 2,
        color: {
          dark: '#1f2937',
          light: '#ffffff'
        },
        errorCorrectionLevel: 'M'
      });
      
      setQrDataUrl(qrDataURL);
      console.log('[QR_GENERATOR] ✅ QR code generated successfully');
      
      toast({
        title: language === 'fr' ? '✅ Code QR généré !' : '✅ QR Code generated!',
        description: language === 'fr' ? 
          'Montrez ce code à vos parents pour qu\'ils se connectent' : 
          'Show this code to your parents to connect'
      });
    } catch (error) {
      console.error('[QR_GENERATOR] ❌ Error generating QR code:', error);
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' ? 
          'Impossible de générer le code QR' : 
          'Failed to generate QR code',
        variant: 'destructive'
      });
    } finally {
      setIsGeneratingQR(false);
    }
  };

  // 💾 FONCTION TÉLÉCHARGEMENT QR CODE
  const downloadQRCode = () => {
    if (!qrDataUrl) return;
    
    const link = document.createElement('a');
    link.download = `EDUCAFRIC_QR_${formatName(user?.firstName, user?.lastName, language as 'fr' | 'en').replace(/\s+/g, '_')}.png`;
    link.href = qrDataUrl;
    link.click();
    
    toast({
      title: language === 'fr' ? '📱 QR Code téléchargé' : '📱 QR Code downloaded',
      description: language === 'fr' ? 
        'Le code QR a été sauvegardé' : 
        'QR code has been saved'
    });
  };

  // 📋 FONCTION COPIER LIEN
  const copyMagicLink = async () => {
    if (!magicLink) return;
    
    try {
      await navigator.clipboard.writeText(magicLink);
      toast({
        title: language === 'fr' ? '📋 Lien copié' : '📋 Link copied',
        description: language === 'fr' ? 
          'Le lien magique a été copié dans le presse-papier' : 
          'Magic link copied to clipboard'
      });
    } catch (error) {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' ? 
          'Impossible de copier le lien' : 
          'Failed to copy link',
        variant: 'destructive'
      });
    }
  };

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
        relationshipType: 'parent'
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
    setSearchQuery(formatName(parent.firstName, parent.lastName, language as 'fr' | 'en'));
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
      case 'verified': return <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5" />;
      case 'pending': return <Clock className="h-4 w-4 sm:h-5 sm:w-5" />;
      case 'rejected': return <XCircle className="h-4 w-4 sm:h-5 sm:w-5" />;
      default: return <Clock className="h-4 w-4 sm:h-5 sm:w-5" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white p-6 rounded-xl">
        <h1 className="text-2xl font-bold flex items-center gap-3">
          <Heart className="w-8 h-8 sm:w-10 sm:h-10" />
          {t.title}
        </h1>
        <p className="text-pink-100 mt-2">{t.subtitle}</p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="connections" className="flex items-center gap-2">
            <Users className="w-5 h-5 sm:w-6 sm:h-6" />
            {t.tabs.connections}
          </TabsTrigger>
          <TabsTrigger value="qrCode" className="flex items-center gap-2">
            <QrCode className="w-5 h-5 sm:w-6 sm:h-6" />
            {t.tabs.qrCode}
          </TabsTrigger>
          <TabsTrigger value="search" className="flex items-center gap-2">
            <Search className="w-5 h-5 sm:w-6 sm:h-6" />
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
                <Heart className="w-16 h-16 sm:w-20 sm:h-20 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">{t.noParents}</h3>
                <p className="text-gray-500 mb-6">{t.noParentsDesc}</p>
                <div className="flex gap-3 justify-center">
                  <Button 
                    onClick={() => setActiveTab('qrCode')}
                    className="bg-pink-600 hover:bg-pink-700"
                    data-testid="button-goto-qr"
                  >
                    <QrCode className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                    {t.generateQR}
                  </Button>
                  <Button 
                    onClick={() => setActiveTab('search')}
                    variant="outline"
                    data-testid="button-goto-search"
                  >
                    <Search className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
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
                              <Mail className="h-4 w-4 sm:h-5 sm:w-5" />
                              Email
                            </p>
                            <p className="font-semibold text-gray-800">{connection.parentEmail}</p>
                          </div>
                          {connection.parentPhone && (
                            <div>
                              <p className="text-sm text-gray-600 flex items-center gap-1">
                                <Phone className="h-4 w-4 sm:h-5 sm:w-5" />
                                {language === 'fr' ? 'Téléphone' : 'Phone'}
                              </p>
                              <p className="font-semibold text-gray-800">{connection.parentPhone}</p>
                            </div>
                          )}
                          <div>
                            <p className="text-sm text-gray-600 flex items-center gap-1">
                              <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
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

        {/* Quick Connect Tab - QR Code & Magic Link */}
        <TabsContent value="qrCode" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="w-5 h-5 sm:w-6 sm:h-6" />
                {t.generateQR}
              </CardTitle>
              <p className="text-sm text-gray-600">
                {t.qrInstructions}
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {!qrDataUrl ? (
                // Bouton pour générer le QR code
                <div className="text-center py-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <QrCode className="h-10 w-10 sm:h-12 sm:w-12 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    {language === 'fr' ? 'Générer votre code de connexion' : 'Generate your connection code'}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {language === 'fr' ? 
                      'Créez un code QR ou un lien magique pour que vos parents se connectent facilement' :
                      'Create a QR code or magic link for your parents to connect easily'
                    }
                  </p>
                  <Button 
                    onClick={generateQRCode}
                    disabled={isGeneratingQR}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                  >
                    {isGeneratingQR ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                        {language === 'fr' ? 'Génération...' : 'Generating...'}
                      </>
                    ) : (
                      <>
                        <QrCode className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                        {t.generateQR}
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                // Affichage du QR code généré
                <div className="space-y-6">
                  {/* QR Code Display */}
                  <div className="text-center">
                    <div className="bg-white p-6 rounded-lg border-2 border-gray-200 inline-block shadow-lg">
                      <img 
                        src={qrDataUrl} 
                        alt="QR Code de connexion"
                        className="w-64 h-64 mx-auto"
                      />
                    </div>
                    <p className="text-sm text-gray-600 mt-4">
                      {language === 'fr' ? 
                        'Montrez ce code QR à vos parents ou envoyez-leur le lien' :
                        'Show this QR code to your parents or send them the link'
                      }
                    </p>
                  </div>

                  {/* Magic Link */}
                  {magicLink && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                        🔗 {language === 'fr' ? 'Lien Magique' : 'Magic Link'}
                      </h4>
                      <div className="bg-white border rounded p-3 text-xs font-mono break-all text-gray-700">
                        {magicLink}
                      </div>
                      <Button 
                        onClick={copyMagicLink}
                        variant="outline" 
                        size="sm" 
                        className="mt-3 w-full"
                      >
                        <Copy className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                        {language === 'fr' ? 'Copier le lien' : 'Copy link'}
                      </Button>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3">
                    <Button 
                      onClick={downloadQRCode}
                      variant="outline" 
                      className="flex-1"
                    >
                      <Download className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                      {language === 'fr' ? 'Télécharger QR' : 'Download QR'}
                    </Button>
                    <Button 
                      onClick={() => {
                        setQrDataUrl('');
                        setMagicLink('');
                      }}
                      variant="outline" 
                      className="flex-1"
                    >
                      <QrCode className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                      {language === 'fr' ? 'Nouveau code' : 'New code'}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Search Parent Tab */}
        <TabsContent value="search" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5 sm:w-6 sm:h-6" />
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
                      relationshipType: e.target.value as 'parent' | 'guardian' 
                    }))}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    data-testid="select-relationship-type"
                  >
                    <option value="parent">{t.relationships.parent}</option>
                  </select>
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