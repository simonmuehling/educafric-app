import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getBusinessPartners, 
  getInternships, 
  getPartnershipStatistics,
  sendPartnershipCommunication,
  type BusinessPartner as APIBusinessPartner,
  type Internship,
  type PartnershipStatistics,
  getPartnershipTypeColor,
  getInternshipStatusColor,
  formatPartnershipType,
  formatInternshipStatus
} from '@/lib/api/partnerships';
import { 
  MapPin, Building2, Users, Phone, Mail, Globe, 
  Plus, Search, Filter, Star, Clock, TrendingUp,
  Briefcase, GraduationCap, Award, Calendar,
  ExternalLink, MessageSquare, FileText, Target
} from 'lucide-react';

interface BusinessPartner {
  id: number;
  name: string;
  sector: string;
  type: 'multinational' | 'local' | 'startup' | 'ngo';
  location: {
    address: string;
    city: string;
    region: string;
    coordinates: { lat: number; lng: number };
  };
  contact: {
    phone: string;
    email: string;
    website?: string;
    contactPerson: string;
    position: string;
  };
  partnership: {
    type: 'internship' | 'training' | 'recruitment' | 'mentoring' | 'sponsorship';
    since: string;
    status: 'active' | 'pending' | 'suspended';
    studentsPlaced: number;
    opportunities: number;
    rating: number;
  };
  programs: string[];
  description: string;
}

const BusinessPartnershipMap: React.FC = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedPartner, setSelectedPartner] = useState<BusinessPartner | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSector, setFilterSector] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [showAddPartnerModal, setShowAddPartnerModal] = useState(false);
  const [activeView, setActiveView] = useState<'map' | 'list' | 'stats' | 'internships'>('map');

  // API Queries
  const schoolId = 1; // TODO: Get from user context
  
  const { data: partners = [], isLoading: partnersLoading } = useQuery({
    queryKey: ['/api/partnerships/partners', schoolId],
    queryFn: () => getBusinessPartners(schoolId),
  });

  const { data: internships = [], isLoading: internshipsLoading } = useQuery({
    queryKey: ['/api/partnerships/internships', schoolId],
    queryFn: () => getInternships(schoolId),
  });

  const { data: statistics, isLoading: statisticsLoading } = useQuery({
    queryKey: ['/api/partnerships/statistics', schoolId],
    queryFn: () => getPartnershipStatistics(schoolId),
  });

  // Communication mutation
  const sendCommunicationMutation = useMutation({
    mutationFn: sendPartnershipCommunication,
    onSuccess: () => {
      toast({
        title: language === 'fr' ? 'Message envoyé' : 'Message sent',
        description: language === 'fr' ? 'Votre message a été envoyé avec succès' : 'Your message has been sent successfully',
      });
    },
    onError: () => {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' ? 'Impossible d\'envoyer le message' : 'Failed to send message',
        variant: 'destructive',
      });
    },
  });

  const text = {
    fr: {
      title: 'Carte des Partenaires Entreprise',
      subtitle: 'Réseau de partenariats école-entreprise et opportunités',
      mapView: 'Vue Carte',
      listView: 'Vue Liste',
      statsView: 'Statistiques',
      internshipsView: 'Stages & Formations',
      totalPartners: 'Partenaires Totaux',
      activePartnerships: 'Partenariats Actifs',
      studentsPlaced: 'Élèves Placés',
      opportunities: 'Opportunités',
      addPartner: 'Ajouter Partenaire',
      searchPlaceholder: 'Rechercher entreprises...',
      allSectors: 'Tous les secteurs',
      allTypes: 'Tous les types',
      contactPerson: 'Contact',
      since: 'Depuis',
      studentsCount: 'élèves placés',
      viewDetails: 'Voir Détails',
      sendMessage: 'Envoyer Message',
      scheduleVisit: 'Planifier Visite',
      sectors: {
        technology: 'Technologie',
        finance: 'Finance',
        healthcare: 'Santé',
        education: 'Éducation',
        manufacturing: 'Industrie',
        agriculture: 'Agriculture',
        tourism: 'Tourisme',
        telecom: 'Télécommunications'
      },
      types: {
        multinational: 'Multinationale',
        local: 'Entreprise Locale',
        startup: 'Startup',
        ngo: 'ONG'
      },
      partnershipTypes: {
        internship: 'Stages',
        training: 'Formation',
        recruitment: 'Recrutement',
        mentoring: 'Mentorat',
        sponsorship: 'Parrainage'
      }
    },
    en: {
      title: 'Business Partner Map',
      subtitle: 'School-business partnership network and opportunities',
      mapView: 'Map View',
      listView: 'List View',
      statsView: 'Statistics',
      internshipsView: 'Internships & Training',
      totalPartners: 'Total Partners',
      activePartnerships: 'Active Partnerships',
      studentsPlaced: 'Students Placed',
      opportunities: 'Opportunities',
      addPartner: 'Add Partner',
      searchPlaceholder: 'Search companies...',
      allSectors: 'All sectors',
      allTypes: 'All types',
      contactPerson: 'Contact',
      since: 'Since',
      studentsCount: 'students placed',
      viewDetails: 'View Details',
      sendMessage: 'Send Message',
      scheduleVisit: 'Schedule Visit',
      sectors: {
        technology: 'Technology',
        finance: 'Finance',
        healthcare: 'Healthcare',
        education: 'Education',
        manufacturing: 'Manufacturing',
        agriculture: 'Agriculture',
        tourism: 'Tourism',
        telecom: 'Telecommunications'
      },
      types: {
        multinational: 'Multinational',
        local: 'Local Company',
        startup: 'Startup',
        ngo: 'NGO'
      },
      partnershipTypes: {
        internship: 'Internships',
        training: 'Training',
        recruitment: 'Recruitment',
        mentoring: 'Mentoring',
        sponsorship: 'Sponsorship'
      }
    }
  };

  const t = text[language as keyof typeof text];

  // Mock data for demonstration - African business partners
  const businessPartners: BusinessPartner[] = [
    {
      id: 1,
      name: 'MTN Cameroun',
      sector: 'telecom',
      type: 'multinational',
      location: {
        address: 'Avenue Charles de Gaulle',
        city: 'Douala',
        region: 'Littoral',
        coordinates: { lat: 4.0511, lng: 9.7679 }
      },
      contact: {
        phone: '+237 677 000 000',
        email: 'rh@mtn.cm',
        website: 'www.mtn.cm',
        contactPerson: 'Madame Nguema Sophie',
        position: 'Directrice RH'
      },
      partnership: {
        type: 'internship',
        since: '2022',
        status: 'active',
        studentsPlaced: 45,
        opportunities: 12,
        rating: 4.8
      },
      programs: ['Informatique', 'Télécommunications', 'Marketing'],
      description: 'Leader télécoms offrant stages et formations en technologie mobile'
    },
    {
      id: 2,
      name: 'Société Générale Cameroun',
      sector: 'finance',
      type: 'multinational',
      location: {
        address: 'Place de l\'Indépendance',
        city: 'Yaoundé',
        region: 'Centre',
        coordinates: { lat: 3.8667, lng: 11.5167 }
      },
      contact: {
        phone: '+237 222 000 000',
        email: 'recrutement@socgen.cm',
        website: 'www.societegenerale.cm',
        contactPerson: 'Monsieur Atangana Paul',
        position: 'Chef du Personnel'
      },
      partnership: {
        type: 'training',
        since: '2021',
        status: 'active',
        studentsPlaced: 38,
        opportunities: 8,
        rating: 4.6
      },
      programs: ['Finance', 'Comptabilité', 'Économie'],
      description: 'Banque internationale proposant formations en finance et comptabilité'
    },
    {
      id: 3,
      name: 'Hôpital Central de Yaoundé',
      sector: 'healthcare',
      type: 'local',
      location: {
        address: 'Avenue Henri Dunant',
        city: 'Yaoundé',
        region: 'Centre',
        coordinates: { lat: 3.8480, lng: 11.5021 }
      },
      contact: {
        phone: '+237 222 123 456',
        email: 'formation@hcy.cm',
        contactPerson: 'Dr. Mbarga Christine',
        position: 'Directrice Formation'
      },
      partnership: {
        type: 'internship',
        since: '2020',
        status: 'active',
        studentsPlaced: 62,
        opportunities: 15,
        rating: 4.9
      },
      programs: ['Sciences Médicales', 'Soins Infirmiers', 'Pharmacie'],
      description: 'Hôpital de référence offrant stages pratiques en sciences médicales'
    },
    {
      id: 4,
      name: 'Startup Tech Douala',
      sector: 'technology',
      type: 'startup',
      location: {
        address: 'Quartier Bonanjo',
        city: 'Douala',
        region: 'Littoral',
        coordinates: { lat: 4.0469, lng: 9.7072 }
      },
      contact: {
        phone: '+237 655 123 789',
        email: 'jobs@startuptech.cm',
        website: 'www.startuptech.cm',
        contactPerson: 'Monsieur Kouma Steve',
        position: 'Fondateur'
      },
      partnership: {
        type: 'mentoring',
        since: '2023',
        status: 'active',
        studentsPlaced: 18,
        opportunities: 6,
        rating: 4.7
      },
      programs: ['Développement Web', 'Intelligence Artificielle', 'Cybersécurité'],
      description: 'Startup innovante en technologie offrant mentorat et stages tech'
    },
    {
      id: 5,
      name: 'SOCAPALM',
      sector: 'agriculture',
      type: 'local',
      location: {
        address: 'Route de Kribi',
        city: 'Edéa',
        region: 'Littoral',
        coordinates: { lat: 3.7963, lng: 10.1288 }
      },
      contact: {
        phone: '+237 233 000 000',
        email: 'rh@socapalm.cm',
        website: 'www.socapalm.cm',
        contactPerson: 'Madame Essono Marie',
        position: 'DRH'
      },
      partnership: {
        type: 'training',
        since: '2019',
        status: 'active',
        studentsPlaced: 78,
        opportunities: 20,
        rating: 4.5
      },
      programs: ['Agronomie', 'Gestion Rurale', 'Transformation Agricole'],
      description: 'Leader agro-industriel offrant formations en agriculture moderne'
    }
  ];

  const getPartnerTypeColor = (type: string) => {
    switch (type) {
      case 'multinational': return 'bg-blue-500';
      case 'local': return 'bg-green-500';
      case 'startup': return 'bg-purple-500';
      case 'ngo': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const getPartnershipTypeColor = (type: string) => {
    switch (type) {
      case 'internship': return 'bg-blue-100 text-blue-800';
      case 'training': return 'bg-green-100 text-green-800';
      case 'recruitment': return 'bg-purple-100 text-purple-800';
      case 'mentoring': return 'bg-orange-100 text-orange-800';
      case 'sponsorship': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredPartners = businessPartners.filter(partner => {
    const matchesSearch = partner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         partner.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSector = filterSector === 'all' || partner.sector === filterSector;
    const matchesType = filterType === 'all' || partner.type === filterType;
    
    return matchesSearch && matchesSector && matchesType;
  });

  const totalStudentsPlaced = businessPartners.reduce((sum, partner) => sum + partner.partnership.studentsPlaced, 0);
  const totalOpportunities = businessPartners.reduce((sum, partner) => sum + partner.partnership.opportunities, 0);
  const activePartnerships = businessPartners.filter(partner => partner.partnership.status === 'active').length;

  const handleContactPartner = (partner: BusinessPartner) => {
    toast({
      title: language === 'fr' ? 'Contact initié' : 'Contact initiated',
      description: `${language === 'fr' ? 'Message envoyé à' : 'Message sent to'} ${partner.contact.contactPerson}`
    });
  };

  const handleScheduleVisit = (partner: BusinessPartner) => {
    toast({
      title: language === 'fr' ? 'Visite planifiée' : 'Visit scheduled',
      description: `${language === 'fr' ? 'Rendez-vous programmé avec' : 'Appointment scheduled with'} ${partner.name}`
    });
  };

  const handleAddPartner = () => {
    toast({
      title: language === 'fr' ? 'Nouveau partenaire' : 'New partner',
      description: language === 'fr' ? 'Formulaire d\'ajout de partenaire ouvert' : 'Partner addition form opened'
    });
    setShowAddPartnerModal(true);
  };

  const handleAddInternship = () => {
    toast({
      title: language === 'fr' ? 'Nouveau stage' : 'New internship',
      description: language === 'fr' ? 'Formulaire de création de stage ouvert' : 'Internship creation form opened'
    });
  };

  const handleScheduleInternship = () => {
    toast({
      title: language === 'fr' ? 'Planifier stage' : 'Schedule internship',
      description: language === 'fr' ? 'Calendrier de planification ouvert' : 'Scheduling calendar opened'
    });
  };

  const handleEvaluateStudent = () => {
    toast({
      title: language === 'fr' ? 'Évaluer étudiant' : 'Evaluate student',
      description: language === 'fr' ? 'Formulaire d\'évaluation ouvert' : 'Evaluation form opened'
    });
  };

  const handleContactCompany = () => {
    toast({
      title: language === 'fr' ? 'Contacter entreprise' : 'Contact company',
      description: language === 'fr' ? 'Centre de communication ouvert' : 'Communication center opened'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{t.title}</h2>
          <p className="text-gray-600">{t.subtitle}</p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            onClick={handleAddPartner}
            className="bg-blue-600 hover:bg-blue-700"
            data-testid="button-add-partner"
          >
            <Plus className="w-4 h-4 mr-2" />
            {t.addPartner}
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <Tabs value={activeView} onValueChange={(value: any) => setActiveView(value)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="map" data-testid="tab-map">{t.mapView}</TabsTrigger>
          <TabsTrigger value="list" data-testid="tab-list">{t.listView}</TabsTrigger>
          <TabsTrigger value="internships" data-testid="tab-internships">{t.internshipsView}</TabsTrigger>
          <TabsTrigger value="stats" data-testid="tab-stats">{t.statsView}</TabsTrigger>
        </TabsList>

        <TabsContent value="map" className="space-y-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Building2 className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">{t.totalPartners}</p>
                    <p className="text-2xl font-bold text-gray-900">{businessPartners.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Target className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">{t.activePartnerships}</p>
                    <p className="text-2xl font-bold text-gray-900">{activePartnerships}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <GraduationCap className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">{t.studentsPlaced}</p>
                    <p className="text-2xl font-bold text-gray-900">{totalStudentsPlaced}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Briefcase className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">{t.opportunities}</p>
                    <p className="text-2xl font-bold text-gray-900">{totalOpportunities}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    placeholder={t.searchPlaceholder}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                    data-testid="input-search-partners"
                  />
                </div>
            
            <Select value={filterSector} onValueChange={setFilterSector}>
              <SelectTrigger className="w-full lg:w-48" data-testid="select-filter-sector">
                <SelectValue placeholder={t.allSectors} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.allSectors}</SelectItem>
                <SelectItem value="technology">{t.sectors.technology}</SelectItem>
                <SelectItem value="finance">{t.sectors.finance}</SelectItem>
                <SelectItem value="healthcare">{t.sectors.healthcare}</SelectItem>
                <SelectItem value="education">{t.sectors.education}</SelectItem>
                <SelectItem value="manufacturing">{t.sectors.manufacturing}</SelectItem>
                <SelectItem value="agriculture">{t.sectors.agriculture}</SelectItem>
                <SelectItem value="tourism">{t.sectors.tourism}</SelectItem>
                <SelectItem value="telecom">{t.sectors.telecom}</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full lg:w-48" data-testid="select-filter-type">
                <SelectValue placeholder={t.allTypes} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.allTypes}</SelectItem>
                <SelectItem value="multinational">{t.types.multinational}</SelectItem>
                <SelectItem value="local">{t.types.local}</SelectItem>
                <SelectItem value="startup">{t.types.startup}</SelectItem>
                <SelectItem value="ngo">{t.types.ngo}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Partners List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredPartners.map((partner) => (
          <Card key={partner.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{partner.name}</CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={getPartnerTypeColor(partner.type)}>
                      {t.types[partner.type as keyof typeof t.types]}
                    </Badge>
                    <Badge variant="outline">
                      {t.sectors[partner.sector as keyof typeof t.sectors]}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span className="text-sm font-medium">{partner.partnership.rating}</span>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <p className="text-gray-600 text-sm">{partner.description}</p>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span>{partner.location.city}, {partner.location.region}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-gray-500" />
                  <span>{partner.contact.contactPerson} - {partner.contact.position}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span>{t.since} {partner.partnership.since}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <Badge className={getPartnershipTypeColor(partner.partnership.type)}>
                  {t.partnershipTypes[partner.partnership.type as keyof typeof t.partnershipTypes]}
                </Badge>
                <span className="text-sm text-gray-600">
                  {partner.partnership.studentsPlaced} {t.studentsCount}
                </span>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleContactPartner(partner)}
                  className="flex-1"
                  data-testid={`button-contact-${partner.id}`}
                >
                  <MessageSquare className="w-4 h-4 mr-1" />
                  {t.sendMessage}
                </Button>
                
                <Button 
                  size="sm"
                  onClick={() => handleScheduleVisit(partner)}
                  className="flex-1"
                  data-testid={`button-visit-${partner.id}`}
                >
                  <Calendar className="w-4 h-4 mr-1" />
                  {t.scheduleVisit}
                </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredPartners.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {language === 'fr' ? 'Aucun partenaire trouvé' : 'No partners found'}
              </h3>
              <p className="text-gray-600">
                {language === 'fr' 
                  ? 'Essayez d\'ajuster vos filtres de recherche.'
                  : 'Try adjusting your search filters.'
                }
              </p>
            </CardContent>
          </Card>
        )}
      </TabsContent>

      <TabsContent value="list" className="space-y-6">
        {/* Same content as map but in list format */}
        <div className="text-center py-8">
          <h3 className="text-lg font-medium text-gray-900">
            {language === 'fr' ? 'Vue liste en développement' : 'List view in development'}
          </h3>
        </div>
      </TabsContent>

      <TabsContent value="internships" className="space-y-6">
        {/* Internships and Training Management */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5" />
                {language === 'fr' ? 'Stages Actifs' : 'Active Internships'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Sample internship data */}
              <div className="space-y-3">
                <div className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium">Stage en Télécommunications</h4>
                      <p className="text-sm text-gray-600">MTN Cameroun - 3 mois</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800">En cours</Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>Étudiant: Ngono Paul</span>
                    <span>Début: Jan 2025</span>
                    <span>Fin: Mar 2025</span>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium">Formation Finance Bancaire</h4>
                      <p className="text-sm text-gray-600">Société Générale - 2 mois</p>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800">Planifié</Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>Étudiant: Mballa Marie</span>
                    <span>Début: Mar 2025</span>
                    <span>Fin: Mai 2025</span>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium">Stage Médical</h4>
                      <p className="text-sm text-gray-600">Hôpital Central - 6 mois</p>
                    </div>
                    <Badge className="bg-yellow-100 text-yellow-800">En attente</Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>Étudiant: Atangana Sophie</span>
                    <span>Début: Fév 2025</span>
                    <span>Fin: Août 2025</span>
                  </div>
                </div>
              </div>

              <Button 
                className="w-full" 
                onClick={handleAddInternship}
                data-testid="button-add-internship"
              >
                <Plus className="w-4 h-4 mr-2" />
                {language === 'fr' ? 'Nouveau Stage' : 'New Internship'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                {language === 'fr' ? 'Statistiques Stages' : 'Internship Stats'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">12</div>
                <div className="text-sm text-gray-600">Stages actifs</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">45</div>
                <div className="text-sm text-gray-600">Stages terminés</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">89%</div>
                <div className="text-sm text-gray-600">Taux de réussite</div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">78%</div>
                <div className="text-sm text-gray-600">Embauche post-stage</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions for Internships */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button 
            variant="outline" 
            className="p-6 h-auto flex-col space-y-2"
            onClick={handleScheduleInternship}
            data-testid="button-schedule-internship"
          >
            <Calendar className="w-8 h-8 text-blue-600" />
            <span>{language === 'fr' ? 'Planifier Stage' : 'Schedule Internship'}</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="p-6 h-auto flex-col space-y-2"
            onClick={handleEvaluateStudent}
            data-testid="button-evaluate-student"
          >
            <FileText className="w-8 h-8 text-green-600" />
            <span>{language === 'fr' ? 'Évaluer Étudiant' : 'Evaluate Student'}</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="p-6 h-auto flex-col space-y-2"
            onClick={handleContactCompany}
            data-testid="button-contact-company"
          >
            <MessageSquare className="w-8 h-8 text-purple-600" />
            <span>{language === 'fr' ? 'Contacter Entreprise' : 'Contact Company'}</span>
          </Button>
        </div>
      </TabsContent>

      <TabsContent value="stats" className="space-y-6">
        {/* Statistics View */}
        <div className="text-center py-8">
          <h3 className="text-lg font-medium text-gray-900">
            {language === 'fr' ? 'Statistiques détaillées en développement' : 'Detailed statistics in development'}
          </h3>
        </div>
      </TabsContent>

    </Tabs>
  </div>
  );
};

export default BusinessPartnershipMap;