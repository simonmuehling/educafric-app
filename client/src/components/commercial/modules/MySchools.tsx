import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { Building2, Search, Phone, Mail, MapPin, Users, TrendingUp, Calendar, Plus, School } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface SchoolData {
  id: number;
  name: string;
  type: string;
  location?: string;
  city?: string;
  director?: string;
  phone?: string;
  email?: string;
  status: string;
  students: number;
  revenue?: string;
  lastContact?: string;
  partnership?: string;
}

const MySchools = () => {
  const { language } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: schoolsResponse, isLoading } = useQuery<{ success: boolean; data: SchoolData[] }>({
    queryKey: ['/api/commercial/schools']
  });

  const schools = schoolsResponse?.data || [];

  const text = {
    fr: {
      title: 'Mes Écoles',
      subtitle: 'Gestion des écoles partenaires et relations clients',
      searchPlaceholder: 'Rechercher une école...',
      addSchool: 'Ajouter École',
      schoolDetails: 'Détails École',
      contactInfo: 'Informations Contact',
      partnership: 'Partenariat',
      students: 'Élèves',
      revenue: 'Revenus',
      lastContact: 'Dernier Contact',
      status: 'Statut',
      actions: 'Actions',
      active: 'Actif',
      pending: 'En Attente',
      prospect: 'Prospect',
      inactive: 'Inactif',
      viewDetails: 'Voir Détails',
      contact: 'Contacter',
      scheduleVisit: 'Planifier Visite',
      loading: 'Chargement des écoles...',
      noSchools: 'Aucune école partenaire',
      noSchoolsDesc: 'Les écoles que vous gérez apparaîtront ici'
    },
    en: {
      title: 'My Schools',
      subtitle: 'Partner school management and client relationships',
      searchPlaceholder: 'Search schools...',
      addSchool: 'Add School',
      schoolDetails: 'School Details',
      contactInfo: 'Contact Information',
      partnership: 'Partnership',
      students: 'Students',
      revenue: 'Revenue',
      lastContact: 'Last Contact',
      status: 'Status',
      actions: 'Actions',
      active: 'Active',
      pending: 'Pending',
      prospect: 'Prospect',
      inactive: 'Inactive',
      viewDetails: 'View Details',
      contact: 'Contact',
      scheduleVisit: 'Schedule Visit',
      loading: 'Loading schools...',
      noSchools: 'No partner schools',
      noSchoolsDesc: 'Schools you manage will appear here'
    }
  };

  const t = text[language as keyof typeof text];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'prospect': return 'bg-blue-100 text-blue-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return t.active;
      case 'pending': return t.pending;
      case 'prospect': return t.prospect;
      case 'inactive': return t.inactive;
      default: return status;
    }
  };

  const filteredSchools = (Array.isArray(schools) ? schools : []).filter(school =>
    school?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    school?.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    school?.director?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg">
          <Building2 className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{t.title || ''}</h2>
          <p className="text-gray-600">{t.subtitle}</p>
        </div>
      </div>

      {/* Search and Add */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder={t.searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e?.target?.value)}
            className="pl-10"
          />
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          {t.addSchool}
        </Button>
      </div>

      {/* Schools Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">{t.loading}</span>
        </div>
      ) : filteredSchools.length === 0 ? (
        <Card className="col-span-full">
          <CardContent className="text-center py-12">
            <School className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">{t.noSchools}</p>
            <p className="text-gray-500 text-sm">{t.noSchoolsDesc}</p>
          </CardContent>
        </Card>
      ) : (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredSchools.map((school) => (
          <Card key={school.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{school.name || ''}</h3>
                  <p className="text-sm text-gray-600 mt-1">{school.type}</p>
                  <div className="flex items-center gap-1 mt-2 text-sm text-gray-500">
                    <MapPin className="w-3 h-3" />
                    {school.location}
                  </div>
                </div>
                <Badge className={getStatusColor(school.status)}>
                  {getStatusText(school.status)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Contact Info */}
                <div className="bg-gray-50 p-3 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">{t.contactInfo}</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2">
                      <Users className="w-3 h-3 text-gray-400" />
                      <span className="text-gray-600">{school.director}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-3 h-3 text-gray-400" />
                      <span className="text-gray-600">{school.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-3 h-3 text-gray-400" />
                      <span className="text-gray-600">{school.email || ''}</span>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-blue-50 p-2 rounded-lg">
                    <div className="text-lg font-semibold text-blue-700">{school.students}</div>
                    <div className="text-xs text-blue-600">{t.students}</div>
                  </div>
                  <div className="bg-green-50 p-2 rounded-lg">
                    <div className="text-sm font-semibold text-green-700">{school.revenue}</div>
                    <div className="text-xs text-green-600">{t.revenue}</div>
                  </div>
                  <div className="bg-purple-50 p-2 rounded-lg">
                    <div className="text-xs font-semibold text-purple-700">{school.partnership}</div>
                    <div className="text-xs text-purple-600">{t.partnership}</div>
                  </div>
                </div>

                {/* Last Contact */}
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Calendar className="w-3 h-3" />
                  <span>{t.lastContact}: {school.lastContact}</span>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    {t.viewDetails}
                  </Button>
                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    {t.contact}
                  </Button>
                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {t.scheduleVisit}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{(Array.isArray(schools) ? schools : []).filter(s => s.status === 'active').length}</div>
            <div className="text-sm text-gray-600">{language === 'fr' ? 'Écoles Actives' : 'Active Schools'}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{(Array.isArray(schools) ? schools : []).filter(s => s.status === 'pending').length}</div>
            <div className="text-sm text-gray-600">{language === 'fr' ? 'En Négociation' : 'In Negotiation'}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{(Array.isArray(schools) ? schools : []).reduce((sum, s) => sum + s.students, 0)}</div>
            <div className="text-sm text-gray-600">{language === 'fr' ? 'Total Élèves' : 'Total Students'}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">7.8M</div>
            <div className="text-sm text-gray-600">{language === 'fr' ? 'Revenus Totaux' : 'Total Revenue'}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MySchools;