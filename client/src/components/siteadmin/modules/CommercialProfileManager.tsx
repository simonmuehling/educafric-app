import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, Phone, Mail, Calendar, FileText, 
  Activity, MessageSquare, Building, 
  Eye, Edit, Search, Filter, MoreHorizontal,
  Clock, MapPin, DollarSign, TrendingUp
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { apiRequest } from '@/lib/queryClient';

interface Commercial {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  region: string;
  status: 'active' | 'inactive';
  joinDate: string;
  totalSchools: number;
  activeDeals: number;
  revenue: number;
  lastActivity: string;
}

interface CommercialActivity {
  id: number;
  commercialId: number;
  type: 'call' | 'visit' | 'meeting' | 'proposal' | 'contract';
  description: string;
  schoolName: string;
  date: string;
  status: string;
}

interface CommercialAppointment {
  id: number;
  commercialId: number;
  schoolName: string;
  contactPerson: string;
  date: string;
  time: string;
  type: 'demo' | 'negotiation' | 'follow-up';
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
}

const CommercialProfileManager: React.FC = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [selectedCommercial, setSelectedCommercial] = useState<Commercial | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('overview');

  const text = {
    fr: {
      title: 'Gestion des Profils Commerciaux',
      subtitle: 'Superviser et gérer les activités commerciales',
      commercials: 'Équipe Commerciale',
      activities: 'Activités',
      appointments: 'Rendez-vous',
      documents: 'Documents',
      overview: 'Vue d\'ensemble',
      details: 'Détails',
      search: 'Rechercher...',
      filter: 'Filtrer',
      all: 'Tous',
      active: 'Actif',
      inactive: 'Inactif',
      name: 'Nom',
      email: 'Email',
      phone: 'Téléphone',
      region: 'Région',
      status: 'Statut',
      schools: 'Écoles',
      deals: 'Affaires',
      revenue: 'Chiffre d\'affaires',
      lastActivity: 'Dernière activité',
      viewProfile: 'Voir le profil',
      manageTasks: 'Gérer les tâches',
      viewDocuments: 'Voir documents',
      recentActivities: 'Activités récentes',
      upcomingAppointments: 'Rendez-vous à venir',
      performanceMetrics: 'Métriques de performance',
      loading: 'Chargement...',
      noData: 'Aucune donnée disponible'
    },
    en: {
      title: 'Commercial Profile Management',
      subtitle: 'Supervise and manage commercial activities',
      commercials: 'Sales Team',
      activities: 'Activities',
      appointments: 'Appointments',
      documents: 'Documents',
      overview: 'Overview',
      details: 'Details',
      search: 'Search...',
      filter: 'Filter',
      all: 'All',
      active: 'Active',
      inactive: 'Inactive',
      name: 'Name',
      email: 'Email',
      phone: 'Phone',
      region: 'Region',
      status: 'Status',
      schools: 'Schools',
      deals: 'Deals',
      revenue: 'Revenue',
      lastActivity: 'Last activity',
      viewProfile: 'View profile',
      manageTasks: 'Manage tasks',
      viewDocuments: 'View documents',
      recentActivities: 'Recent activities',
      upcomingAppointments: 'Upcoming appointments',
      performanceMetrics: 'Performance metrics',
      loading: 'Loading...',
      noData: 'No data available'
    }
  };

  const t = text[language as keyof typeof text];

  // Fetch commercials list
  const { data: commercials = [], isLoading: commercialsLoading } = useQuery({
    queryKey: ['/api/site-admin/commercials'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/site-admin/commercials', { credentials: 'include' });
        if (!response.ok) return [];
        return await response.json();
      } catch (error) {
        console.error('Error fetching commercials:', error);
        return [];
      }
    },
  });

  // Fetch commercial activities
  const { data: activities = [] } = useQuery({
    queryKey: ['/api/site-admin/commercial-activities', selectedCommercial?.id],
    queryFn: async () => {
      if (!selectedCommercial) return [];
      try {
        const response = await fetch(`/api/site-admin/commercial-activities/${selectedCommercial.id}`, { credentials: 'include' });
        if (!response.ok) return [];
        return await response.json();
      } catch (error) {
        console.error('Error fetching activities:', error);
        return [];
      }
    },
    enabled: !!selectedCommercial
  });

  // Fetch commercial appointments
  const { data: appointments = [] } = useQuery({
    queryKey: ['/api/site-admin/commercial-appointments', selectedCommercial?.id],
    queryFn: async () => {
      if (!selectedCommercial) return [];
      try {
        const response = await fetch(`/api/site-admin/commercial-appointments/${selectedCommercial.id}`, { credentials: 'include' });
        if (!response.ok) return [];
        return await response.json();
      } catch (error) {
        console.error('Error fetching appointments:', error);
        return [];
      }
    },
    enabled: !!selectedCommercial
  });

  // Fetch commercial documents
  const { data: documents = [] } = useQuery({
    queryKey: ['/api/site-admin/commercial-documents', selectedCommercial?.id],
    queryFn: async () => {
      if (!selectedCommercial) return [];
      try {
        const response = await fetch(`/api/site-admin/commercial-documents/${selectedCommercial.id}`, { credentials: 'include' });
        if (!response.ok) return [];
        return await response.json();
      } catch (error) {
        console.error('Error fetching documents:', error);
        return [];
      }
    },
    enabled: !!selectedCommercial
  });

  const filteredCommercials = commercials.filter((commercial: Commercial) => {
    const matchesSearch = `${commercial.firstName} ${commercial.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         commercial.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || commercial.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    return status === 'active' ? (
      <Badge className="bg-green-100 text-green-800">{t.active}</Badge>
    ) : (
      <Badge variant="secondary">{t.inactive}</Badge>
    );
  };

  const getActivityIcon = (type: string) => {
    const icons = {
      call: Phone,
      visit: MapPin,
      meeting: Calendar,
      proposal: FileText,
      contract: Building
    };
    const Icon = icons[type as keyof typeof icons] || Activity;
    return <Icon className="w-4 h-4" />;
  };

  if (commercialsLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2">{t.loading}</span>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">{t.title}</h2>
        <p className="text-gray-600">{t.subtitle}</p>
      </div>

      {!selectedCommercial ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="w-5 h-5 mr-2" />
              {t.commercials}
            </CardTitle>
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder={t.search}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select 
                value={filterStatus} 
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border rounded-md"
              >
                <option value="all">{t.all}</option>
                <option value="active">{t.active}</option>
                <option value="inactive">{t.inactive}</option>
              </select>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t.name}</TableHead>
                  <TableHead>{t.email}</TableHead>
                  <TableHead>{t.region}</TableHead>
                  <TableHead>{t.status}</TableHead>
                  <TableHead>{t.schools}</TableHead>
                  <TableHead>{t.revenue}</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCommercials.map((commercial: Commercial) => (
                  <TableRow key={commercial.id}>
                    <TableCell className="font-medium">
                      {commercial.firstName} {commercial.lastName}
                    </TableCell>
                    <TableCell>{commercial.email}</TableCell>
                    <TableCell>{commercial.region}</TableCell>
                    <TableCell>{getStatusBadge(commercial.status)}</TableCell>
                    <TableCell>{commercial.totalSchools}</TableCell>
                    <TableCell>{commercial.revenue.toLocaleString()} CFA</TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedCommercial(commercial)}
                        data-testid={`button-view-commercial-${commercial.id}`}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        {t.viewProfile}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold">
                {selectedCommercial.firstName} {selectedCommercial.lastName}
              </h3>
              <p className="text-gray-600">{selectedCommercial.email}</p>
            </div>
            <Button
              variant="outline"
              onClick={() => setSelectedCommercial(null)}
              data-testid="button-back-to-list"
            >
              ← Retour à la liste
            </Button>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="overview">{t.overview}</TabsTrigger>
              <TabsTrigger value="activities">{t.activities}</TabsTrigger>
              <TabsTrigger value="appointments">{t.appointments}</TabsTrigger>
              <TabsTrigger value="documents">{t.documents}</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center">
                      <Building className="h-8 w-8 text-blue-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">{t.schools}</p>
                        <p className="text-2xl font-bold">{selectedCommercial.totalSchools}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center">
                      <TrendingUp className="h-8 w-8 text-green-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">{t.deals}</p>
                        <p className="text-2xl font-bold">{selectedCommercial.activeDeals}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center">
                      <DollarSign className="h-8 w-8 text-yellow-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">{t.revenue}</p>
                        <p className="text-2xl font-bold">{selectedCommercial.revenue.toLocaleString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center">
                      <Clock className="h-8 w-8 text-purple-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">{t.lastActivity}</p>
                        <p className="text-sm">{selectedCommercial.lastActivity}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="activities" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>{t.recentActivities}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {activities.map((activity: CommercialActivity) => (
                      <div key={activity.id} className="flex items-center p-3 border rounded-lg">
                        {getActivityIcon(activity.type)}
                        <div className="ml-3 flex-1">
                          <p className="font-medium">{activity.description}</p>
                          <p className="text-sm text-gray-600">{activity.schoolName}</p>
                          <p className="text-xs text-gray-500">{activity.date}</p>
                        </div>
                        <Badge variant="outline">{activity.status}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="appointments" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>{t.upcomingAppointments}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>École</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Statut</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {appointments.map((appointment: CommercialAppointment) => (
                        <TableRow key={appointment.id}>
                          <TableCell>{appointment.schoolName}</TableCell>
                          <TableCell>{appointment.contactPerson}</TableCell>
                          <TableCell>{appointment.date} {appointment.time}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{appointment.type}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              className={appointment.status === 'scheduled' ? 'bg-blue-100 text-blue-800' : 
                                        appointment.status === 'completed' ? 'bg-green-100 text-green-800' : 
                                        'bg-red-100 text-red-800'}
                            >
                              {appointment.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="documents" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Documents Commerciaux</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Titre</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Créé le</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {documents.map((document: any) => (
                        <TableRow key={document.id}>
                          <TableCell className="font-medium">{document.title}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{document.type}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={document.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                              {document.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{new Date(document.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4 mr-1" />
                              Voir
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
};

export default CommercialProfileManager;