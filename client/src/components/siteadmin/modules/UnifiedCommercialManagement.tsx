import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Briefcase, 
  Users, 
  DollarSign, 
  TrendingUp,
  Phone,
  Mail,
  Calendar,
  MapPin,
  Building2,
  UserPlus,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  Download,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Target,
  PieChart,
  BarChart3,
  FileText,
  Clock,
  Activity
} from 'lucide-react';

interface Commercial {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  region: string;
  status: 'active' | 'inactive' | 'suspended';
  joinDate: string;
  totalSchools: number;
  activeDeals: number;
  revenue: number;
  lastActivity: string;
}

interface CommercialActivity {
  id: number;
  commercialId: number;
  type: 'call' | 'visit' | 'proposal' | 'demo' | 'negotiation';
  description: string;
  schoolName: string;
  date: string;
  status: 'completed' | 'pending' | 'cancelled';
}

interface CommercialAppointment {
  id: number;
  commercialId: number;
  schoolName: string;
  contactPerson: string;
  date: string;
  time: string;
  type: 'demo' | 'negotiation' | 'meeting' | 'presentation';
  status: 'scheduled' | 'completed' | 'cancelled';
  notes: string;
}

interface CommercialDocument {
  id: number;
  commercialId: number;
  title: string;
  type: 'proposal' | 'contract' | 'sales_kit' | 'brochure';
  status: 'draft' | 'sent' | 'signed' | 'active';
  createdAt: string;
}

const UnifiedCommercialManagement: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedCommercial, setSelectedCommercial] = useState<Commercial | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Queries
  const { data: commercials = [], isLoading: loadingCommercials } = useQuery({
    queryKey: ['/api/site-admin/commercials'],
    queryFn: async () => {
      const response = await fetch('/api/site-admin/commercials', { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch commercials');
      return response.json();
    }
  });

  const { data: activities = [], isLoading: loadingActivities } = useQuery({
    queryKey: ['/api/site-admin/commercial-activities', selectedCommercial?.id],
    queryFn: async () => {
      if (!selectedCommercial?.id) return [];
      const response = await fetch(`/api/site-admin/commercial-activities/${selectedCommercial.id}`, { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch activities');
      return response.json();
    },
    enabled: !!selectedCommercial
  });

  const { data: appointments = [], isLoading: loadingAppointments } = useQuery({
    queryKey: ['/api/site-admin/commercial-appointments', selectedCommercial?.id],
    queryFn: async () => {
      if (!selectedCommercial?.id) return [];
      const response = await fetch(`/api/site-admin/commercial-appointments/${selectedCommercial.id}`, { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch appointments');
      return response.json();
    },
    enabled: !!selectedCommercial
  });

  const { data: documents = [], isLoading: loadingDocuments } = useQuery({
    queryKey: ['/api/site-admin/commercial-documents', selectedCommercial?.id],
    queryFn: async () => {
      if (!selectedCommercial?.id) return [];
      const response = await fetch(`/api/site-admin/commercial-documents/${selectedCommercial.id}`, { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch documents');
      return response.json();
    },
    enabled: !!selectedCommercial
  });

  // Filtered commercials
  const filteredCommercials = commercials.filter((commercial: Commercial) => {
    const matchesSearch = 
      commercial.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      commercial.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      commercial.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      commercial.region.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || commercial.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const configs = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      suspended: 'bg-red-100 text-red-800',
      completed: 'bg-blue-100 text-blue-800',
      pending: 'bg-yellow-100 text-yellow-800',
      cancelled: 'bg-red-100 text-red-800',
      scheduled: 'bg-purple-100 text-purple-800',
      draft: 'bg-gray-100 text-gray-800',
      sent: 'bg-blue-100 text-blue-800',
      signed: 'bg-green-100 text-green-800'
    };
    return configs[status as keyof typeof configs] || 'bg-gray-100 text-gray-800';
  };

  const getTypeBadge = (type: string) => {
    const configs = {
      call: 'bg-blue-100 text-blue-800',
      visit: 'bg-green-100 text-green-800',
      proposal: 'bg-purple-100 text-purple-800',
      demo: 'bg-orange-100 text-orange-800',
      negotiation: 'bg-red-100 text-red-800',
      meeting: 'bg-indigo-100 text-indigo-800',
      presentation: 'bg-pink-100 text-pink-800',
      contract: 'bg-red-100 text-red-800',
      sales_kit: 'bg-violet-100 text-violet-800',
      brochure: 'bg-cyan-100 text-cyan-800'
    };
    return configs[type as keyof typeof configs] || 'bg-gray-100 text-gray-800';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-CM', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Overview stats calculation
  const totalRevenue = commercials.reduce((sum: number, c: Commercial) => sum + c.revenue, 0);
  const totalSchools = commercials.reduce((sum: number, c: Commercial) => sum + c.totalSchools, 0);
  const totalDeals = commercials.reduce((sum: number, c: Commercial) => sum + c.activeDeals, 0);
  const activeCommercials = commercials.filter((c: Commercial) => c.status === 'active').length;

  if (loadingCommercials) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Chargement...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion Commerciale Unifiée</h1>
          <p className="text-gray-600 mt-1">Administration complète de l'équipe commerciale EDUCAFRIC</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Ajouter Commercial
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="team">Équipe</TabsTrigger>
          <TabsTrigger value="activities">Activités</TabsTrigger>
          <TabsTrigger value="appointments">Rendez-vous</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 rounded-full">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Commerciaux Actifs</p>
                    <p className="text-2xl font-bold text-gray-900">{activeCommercials}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-green-100 rounded-full">
                    <Building2 className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Écoles Clients</p>
                    <p className="text-2xl font-bold text-gray-900">{totalSchools}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-orange-100 rounded-full">
                    <Target className="h-6 w-6 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Deals Actifs</p>
                    <p className="text-2xl font-bold text-gray-900">{totalDeals}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-purple-100 rounded-full">
                    <DollarSign className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Chiffre d'Affaires</p>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalRevenue)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Performers */}
          <Card>
            <CardHeader>
              <CardTitle>Top Performers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {commercials
                  .sort((a: Commercial, b: Commercial) => b.revenue - a.revenue)
                  .slice(0, 5)
                  .map((commercial: Commercial) => (
                    <div key={commercial.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-semibold">
                            {commercial.firstName[0]}{commercial.lastName[0]}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{commercial.firstName} {commercial.lastName}</p>
                          <p className="text-sm text-gray-600">{commercial.region}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(commercial.revenue)}</p>
                        <p className="text-sm text-gray-600">{commercial.totalSchools} écoles</p>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Team Tab */}
        <TabsContent value="team" className="mt-6">
          {/* Filters */}
          <div className="flex items-center space-x-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Rechercher commerciaux..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
                data-testid="input-search-commercials"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="active">Actif</SelectItem>
                <SelectItem value="inactive">Inactif</SelectItem>
                <SelectItem value="suspended">Suspendu</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Team Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCommercials.map((commercial: Commercial) => (
              <Card key={commercial.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-semibold text-lg">
                          {commercial.firstName[0]}{commercial.lastName[0]}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {commercial.firstName} {commercial.lastName}
                        </h3>
                        <p className="text-sm text-gray-600">{commercial.region}</p>
                      </div>
                    </div>
                    <Badge className={getStatusBadge(commercial.status)}>
                      {commercial.status}
                    </Badge>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="w-4 h-4 mr-2" />
                      {commercial.email}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="w-4 h-4 mr-2" />
                      {commercial.phone}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      Rejoint le {formatDate(commercial.joinDate)}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="text-center">
                      <p className="text-lg font-bold text-blue-600">{commercial.totalSchools}</p>
                      <p className="text-xs text-gray-600">Écoles</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-orange-600">{commercial.activeDeals}</p>
                      <p className="text-xs text-gray-600">Deals</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-green-600">{formatCurrency(commercial.revenue).replace(/\s.*/, '')}</p>
                      <p className="text-xs text-gray-600">Revenue</p>
                    </div>
                  </div>

                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={() => setSelectedCommercial(commercial)}
                    data-testid={`button-view-commercial-${commercial.id}`}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Voir Détails
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Activities Tab */}
        <TabsContent value="activities" className="mt-6">
          {selectedCommercial ? (
            <Card>
              <CardHeader>
                <CardTitle>
                  Activités de {selectedCommercial.firstName} {selectedCommercial.lastName}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingActivities ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <span className="ml-2">Chargement des activités...</span>
                  </div>
                ) : activities.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">Aucune activité trouvée</p>
                ) : (
                  <div className="space-y-4">
                    {activities.map((activity: CommercialActivity) => (
                      <div key={activity.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                        <div className="flex-shrink-0">
                          <Badge className={getTypeBadge(activity.type)}>
                            {activity.type}
                          </Badge>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{activity.description}</h4>
                          <p className="text-sm text-gray-600">{activity.schoolName}</p>
                          <p className="text-xs text-gray-500">{formatDate(activity.date)}</p>
                        </div>
                        <Badge className={getStatusBadge(activity.status)}>
                          {activity.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Sélectionner un Commercial</h3>
                <p className="text-gray-600">Choisissez un commercial dans l'onglet Équipe pour voir ses activités</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Appointments Tab */}
        <TabsContent value="appointments" className="mt-6">
          {selectedCommercial ? (
            <Card>
              <CardHeader>
                <CardTitle>
                  Rendez-vous de {selectedCommercial.firstName} {selectedCommercial.lastName}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingAppointments ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <span className="ml-2">Chargement des rendez-vous...</span>
                  </div>
                ) : appointments.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">Aucun rendez-vous trouvé</p>
                ) : (
                  <div className="space-y-4">
                    {appointments.map((appointment: CommercialAppointment) => (
                      <div key={appointment.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{appointment.schoolName}</h4>
                          <Badge className={getStatusBadge(appointment.status)}>
                            {appointment.status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                          <div>
                            <p><strong>Contact:</strong> {appointment.contactPerson}</p>
                            <p><strong>Type:</strong> {appointment.type}</p>
                          </div>
                          <div>
                            <p><strong>Date:</strong> {formatDate(appointment.date)}</p>
                            <p><strong>Heure:</strong> {appointment.time}</p>
                          </div>
                        </div>
                        {appointment.notes && (
                          <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                            <strong>Notes:</strong> {appointment.notes}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Sélectionner un Commercial</h3>
                <p className="text-gray-600">Choisissez un commercial dans l'onglet Équipe pour voir ses rendez-vous</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="mt-6">
          {selectedCommercial ? (
            <Card>
              <CardHeader>
                <CardTitle>
                  Documents de {selectedCommercial.firstName} {selectedCommercial.lastName}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingDocuments ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <span className="ml-2">Chargement des documents...</span>
                  </div>
                ) : documents.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">Aucun document trouvé</p>
                ) : (
                  <div className="space-y-4">
                    {documents.map((document: CommercialDocument) => (
                      <div key={document.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <FileText className="w-8 h-8 text-blue-600" />
                          <div>
                            <h4 className="font-medium">{document.title}</h4>
                            <p className="text-sm text-gray-600">Créé le {formatDate(document.createdAt)}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getTypeBadge(document.type)}>
                            {document.type}
                          </Badge>
                          <Badge className={getStatusBadge(document.status)}>
                            {document.status}
                          </Badge>
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Sélectionner un Commercial</h3>
                <p className="text-gray-600">Choisissez un commercial dans l'onglet Équipe pour voir ses documents</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UnifiedCommercialManagement;