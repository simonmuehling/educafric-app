import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  MapPin, Building2, Users, Phone, Mail, Globe, 
  Plus, Star, TrendingUp, Briefcase, GraduationCap
} from 'lucide-react';

interface BusinessPartner {
  id: number;
  name: string;
  sector: string;
  type: string;
  description?: string;
  city?: string;
  region?: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  website?: string;
  partnershipType: string;
  rating?: number;
  studentsPlaced?: number;
  opportunitiesOffered?: number;
}

const BusinessPartnershipMapSimple: React.FC = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [partners, setPartners] = useState<BusinessPartner[]>([]);
  const [loading, setLoading] = useState(true);

  // Chargement des données depuis l'API
  useEffect(() => {
    const fetchPartners = async () => {
      try {
        const response = await fetch('/api/partnerships/partners');
        if (response.ok) {
          const data = await response.json();
          setPartners(data);
        } else {
          throw new Error('Failed to fetch partners');
        }
      } catch (error) {
        console.error('Error fetching partners:', error);
        toast({
          title: language === 'fr' ? 'Erreur' : 'Error',
          description: language === 'fr' ? 'Impossible de charger les partenaires' : 'Failed to load partners',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPartners();
  }, [language, toast]);

  const text = {
    fr: {
      title: 'Partenariats École-Entreprise',
      subtitle: 'Gestion des partenariats avec les entreprises locales',
      map: 'Carte',
      list: 'Liste',
      internships: 'Stages',
      statistics: 'Statistiques',
      totalPartners: 'Partenaires Total',
      activeInternships: 'Stages Actifs',
      studentsPlaced: 'Étudiants Placés',
      averageRating: 'Note Moyenne',
      contact: 'Contact',
      website: 'Site Web',
      viewDetails: 'Voir Détails',
      type: 'Type',
      sector: 'Secteur',
      loading: 'Chargement...'
    },
    en: {
      title: 'School-Business Partnerships',
      subtitle: 'Managing partnerships with local businesses',
      map: 'Map',
      list: 'List',
      internships: 'Internships',
      statistics: 'Statistics',
      totalPartners: 'Total Partners',
      activeInternships: 'Active Internships',
      studentsPlaced: 'Students Placed',
      averageRating: 'Average Rating',
      contact: 'Contact',
      website: 'Website',
      viewDetails: 'View Details',
      type: 'Type',
      sector: 'Sector',
      loading: 'Loading...'
    }
  };

  const t = text[language as keyof typeof text];

  const getPartnershipTypeColor = (type: string): string => {
    const colors: Record<string, string> = {
      'internship': 'bg-blue-500',
      'training': 'bg-green-500',
      'recruitment': 'bg-purple-500',
      'mentoring': 'bg-orange-500',
      'sponsorship': 'bg-pink-500',
    };
    return colors[type] || 'bg-gray-500';
  };

  const formatPartnershipType = (type: string): string => {
    const translations: Record<string, Record<string, string>> = {
      'internship': { fr: 'Stage', en: 'Internship' },
      'training': { fr: 'Formation', en: 'Training' },
      'recruitment': { fr: 'Recrutement', en: 'Recruitment' },
      'mentoring': { fr: 'Mentorat', en: 'Mentoring' },
      'sponsorship': { fr: 'Parrainage', en: 'Sponsorship' },
    };
    return translations[type]?.[language] || type;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t.loading}</p>
        </div>
      </div>
    );
  }

  const statistics = {
    totalPartners: partners.length,
    activeInternships: 5, // Mock data
    studentsPlaced: partners.reduce((sum, p) => sum + (p.studentsPlaced || 0), 0),
    averageRating: partners.length > 0 ? 
      partners.reduce((sum, p) => sum + (Number(p.rating) || 0), 0) / partners.length : 0
  };

  return (
    <div className="p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t.title}</h1>
        <p className="text-gray-600">{t.subtitle}</p>
      </div>

      <Tabs defaultValue="map" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="map">
            <MapPin className="w-4 h-4 mr-2" />
            {t.map}
          </TabsTrigger>
          <TabsTrigger value="list">
            <Building2 className="w-4 h-4 mr-2" />
            {t.list}
          </TabsTrigger>
          <TabsTrigger value="internships">
            <GraduationCap className="w-4 h-4 mr-2" />
            {t.internships}
          </TabsTrigger>
          <TabsTrigger value="statistics">
            <TrendingUp className="w-4 h-4 mr-2" />
            {t.statistics}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="map" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Carte des Partenaires</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Carte interactive bientôt disponible</p>
                  <p className="text-sm text-gray-500 mt-2">{partners.length} partenaires à afficher</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="list" className="space-y-4">
          <div className="grid gap-4">
            {partners.map((partner) => (
              <Card key={partner.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{partner.name}</h3>
                      <p className="text-gray-600">{partner.description}</p>
                    </div>
                    <Badge className={getPartnershipTypeColor(partner.partnershipType)}>
                      {formatPartnershipType(partner.partnershipType)}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">{t.sector}:</span>
                      <p className="text-gray-600 capitalize">{partner.sector}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Localisation:</span>
                      <p className="text-gray-600">{partner.city}, {partner.region}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">{t.contact}:</span>
                      <p className="text-gray-600">{partner.contactPerson}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Note:</span>
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 mr-1" />
                        <span>{Number.isFinite(Number(partner.rating)) ? Number(partner.rating).toFixed(1) : 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-4">
                    <div className="flex space-x-4 text-sm text-gray-600">
                      <span>{partner.studentsPlaced || 0} étudiants placés</span>
                      <span>{partner.opportunitiesOffered || 0} opportunités</span>
                    </div>
                    <div className="flex space-x-2">
                      {partner.email && (
                        <Button variant="outline" size="sm">
                          <Mail className="w-4 h-4 mr-1" />
                          Email
                        </Button>
                      )}
                      {partner.website && (
                        <Button variant="outline" size="sm">
                          <Globe className="w-4 h-4 mr-1" />
                          {t.website}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="internships" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t.internships}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Module stages en développement</p>
                <p className="text-sm text-gray-500 mt-2">Bientôt disponible</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="statistics" className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-blue-600">{statistics.totalPartners}</div>
                <div className="text-sm text-gray-600">{t.totalPartners}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-green-600">{statistics.activeInternships}</div>
                <div className="text-sm text-gray-600">{t.activeInternships}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-purple-600">{statistics.studentsPlaced}</div>
                <div className="text-sm text-gray-600">{t.studentsPlaced}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-yellow-600">{statistics.averageRating.toFixed(1)}</div>
                <div className="text-sm text-gray-600">{t.averageRating}</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BusinessPartnershipMapSimple;