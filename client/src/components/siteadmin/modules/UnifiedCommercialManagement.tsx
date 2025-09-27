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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import ContractGenerator from '@/components/commercial/ContractGenerator';
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
  role: string;
}

interface CommercialActivity {
  id: number;
  commercialId: number;
  commercialName: string;
  type: 'school_visit' | 'demo_presentation' | 'follow_up_call' | 'contract_negotiation';
  schoolName: string;
  region: string;
  date: string;
  status: 'completed' | 'in_progress' | 'scheduled' | 'cancelled';
  result?: string;
  revenue: number;
  notes: string;
}

interface CommercialAppointment {
  id: number;
  commercialId: number;
  commercialName: string;
  schoolName: string;
  region: string;
  date: string;
  time: string;
  type: 'demo_presentation' | 'contract_negotiation' | 'school_visit' | 'follow_up';
  status: 'confirmed' | 'pending' | 'rescheduled' | 'cancelled';
  priority: 'high' | 'medium' | 'low';
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

interface EducafricDocument {
  id: number;
  filename: string;
  title: string;
  type: 'pdf' | 'html';
  category: 'commercial' | 'administrative';
  size: number;
  lastModified: string;
  isVisible: boolean;
  visibilityLevel: 'public' | 'commercial_only' | 'admin_only';
  downloadCount: number;
  path: string;
}

const UnifiedCommercialManagement: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedCommercial, setSelectedCommercial] = useState<Commercial | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isContractDialogOpen, setIsContractDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingCommercial, setEditingCommercial] = useState<Commercial | null>(null);
  const [newRole, setNewRole] = useState('');

  // Queries
  const { data: commercials = [], isLoading: loadingCommercials } = useQuery({
    queryKey: ['/api/site-admin/commercials'],
    queryFn: async () => {
      const response = await fetch('/api/site-admin/commercials', { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch commercials');
      return response.json();
    }
  });

  // Global activities for all commercials
  const { data: activities = [], isLoading: loadingActivities } = useQuery({
    queryKey: ['/api/siteadmin/commercial-activities'],
    queryFn: async () => {
      const response = await fetch('/api/siteadmin/commercial-activities', { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch activities');
      return response.json();
    }
  });

  // Global appointments for all commercials  
  const { data: appointments = [], isLoading: loadingAppointments } = useQuery({
    queryKey: ['/api/siteadmin/commercial-appointments'],
    queryFn: async () => {
      const response = await fetch('/api/siteadmin/commercial-appointments', { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch appointments');
      return response.json();
    }
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

  // All Educafric documents
  const { data: allDocuments = [], isLoading: loadingAllDocuments } = useQuery({
    queryKey: ['/api/site-admin/all-documents'],
    queryFn: async () => {
      const response = await fetch('/api/site-admin/all-documents', { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch all documents');
      return response.json();
    }
  });

  // Mutations for commercial management
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const response = await fetch(`/api/site-admin/commercials/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status })
      });
      if (!response.ok) throw new Error('Failed to update status');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/site-admin/commercials'] });
      toast({ title: "Succès", description: "Statut du commercial mis à jour" });
    },
    onError: () => {
      toast({ title: "Erreur", description: "Impossible de mettre à jour le statut", variant: "destructive" });
    }
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ id, role }: { id: number; role: string }) => {
      const response = await fetch(`/api/site-admin/commercials/${id}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ role })
      });
      if (!response.ok) throw new Error('Failed to update role');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/site-admin/commercials'] });
      setIsEditDialogOpen(false);
      setEditingCommercial(null);
      setNewRole('');
      toast({ title: "Succès", description: "Rôle du commercial mis à jour" });
    },
    onError: () => {
      toast({ title: "Erreur", description: "Impossible de mettre à jour le rôle", variant: "destructive" });
    }
  });

  const deleteCommercialMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/site-admin/commercials/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to delete commercial');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/site-admin/commercials'] });
      setIsDeleteDialogOpen(false);
      setEditingCommercial(null);
      toast({ title: "Succès", description: "Commercial supprimé avec succès" });
    },
    onError: () => {
      toast({ title: "Erreur", description: "Impossible de supprimer le commercial", variant: "destructive" });
    }
  });

  // Document visibility mutation
  const updateDocumentVisibilityMutation = useMutation({
    mutationFn: async ({ id, visibilityLevel, isVisible }: { id: number; visibilityLevel: string; isVisible: boolean }) => {
      const response = await fetch(`/api/site-admin/documents/${id}/visibility`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ visibilityLevel, isVisible })
      });
      if (!response.ok) throw new Error('Failed to update document visibility');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/site-admin/all-documents'] });
      toast({ title: "Succès", description: "Visibilité du document mise à jour" });
    },
    onError: () => {
      toast({ title: "Erreur", description: "Impossible de mettre à jour la visibilité", variant: "destructive" });
    }
  });

  // Delete document mutation
  const deleteDocumentMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/site-admin/documents/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to delete document');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/site-admin/all-documents'] });
      toast({ title: "Succès", description: "Document supprimé avec succès" });
    },
    onError: () => {
      toast({ title: "Erreur", description: "Impossible de supprimer le document", variant: "destructive" });
    }
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
        <div className="flex space-x-3">
          <Button 
            className="bg-green-600 hover:bg-green-700"
            onClick={() => setIsContractDialogOpen(true)}
          >
            <FileText className="w-4 h-4 mr-2" />
            Créer Contrat
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Ajouter Commercial
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="team">Équipe</TabsTrigger>
          <TabsTrigger value="activities">Activités</TabsTrigger>
          <TabsTrigger value="appointments">Rendez-vous</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="contracts">Contrats</TabsTrigger>
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

                  <div className="space-y-2">
                    <Button 
                      className="w-full" 
                      variant="outline"
                      onClick={() => setSelectedCommercial(commercial)}
                      data-testid={`button-view-commercial-${commercial.id}`}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Voir Détails
                    </Button>
                    
                    <div className="grid grid-cols-2 gap-2">
                      {/* Status Toggle Button */}
                      <Button
                        size="sm"
                        variant={commercial.status === 'active' ? "destructive" : "default"}
                        onClick={() => updateStatusMutation.mutate({
                          id: commercial.id,
                          status: commercial.status === 'active' ? 'inactive' : 'active'
                        })}
                        disabled={updateStatusMutation.isPending}
                        data-testid={`button-toggle-status-${commercial.id}`}
                      >
                        {commercial.status === 'active' ? 'Bloquer' : 'Activer'}
                      </Button>

                      {/* Edit Role Button */}
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          setEditingCommercial(commercial);
                          setNewRole(commercial.role);
                          setIsEditDialogOpen(true);
                        }}
                        data-testid={`button-edit-role-${commercial.id}`}
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        Rôle
                      </Button>
                    </div>

                    {/* Delete Button */}
                    <Button
                      size="sm"
                      variant="destructive"
                      className="w-full"
                      onClick={() => {
                        setEditingCommercial(commercial);
                        setIsDeleteDialogOpen(true);
                      }}
                      disabled={deleteCommercialMutation.isPending}
                      data-testid={`button-delete-commercial-${commercial.id}`}
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Supprimer
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Activities Tab */}
        <TabsContent value="activities" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="w-5 h-5" />
                <span>Résumé des Activités Commerciales</span>
              </CardTitle>
              <p className="text-sm text-gray-600">
                Vue d'ensemble des activités de tous les commerciaux de la plateforme Educafric
              </p>
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
                    <div key={activity.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-semibold text-sm">
                              {activity.commercialName.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{activity.commercialName}</h4>
                            <p className="text-sm text-gray-600">{activity.region}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getTypeBadge(activity.type)}>
                            {activity.type.replace('_', ' ')}
                          </Badge>
                          <Badge className={getStatusBadge(activity.status)}>
                            {activity.status}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                        <div>
                          <p className="text-sm"><strong>École:</strong> {activity.schoolName}</p>
                          <p className="text-sm"><strong>Date:</strong> {formatDate(activity.date)}</p>
                        </div>
                        <div>
                          {activity.result && (
                            <p className="text-sm"><strong>Résultat:</strong> {activity.result}</p>
                          )}
                          {activity.revenue > 0 && (
                            <p className="text-sm"><strong>Revenue:</strong> {formatCurrency(activity.revenue)}</p>
                          )}
                        </div>
                      </div>
                      
                      {activity.notes && (
                        <div className="mt-3 p-3 bg-gray-100 rounded text-sm">
                          <strong>Notes:</strong> {activity.notes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appointments Tab */}
        <TabsContent value="appointments" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="w-5 h-5" />
                <span>Calendrier des Rendez-vous Commerciaux</span>
              </CardTitle>
              <p className="text-sm text-gray-600">
                Planning global des rendez-vous de tous les commerciaux Educafric
              </p>
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
                    <div key={appointment.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                            <span className="text-green-600 font-semibold text-sm">
                              {appointment.commercialName.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{appointment.commercialName}</h4>
                            <p className="text-sm text-gray-600">{appointment.region}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getStatusBadge(appointment.status)}>
                            {appointment.status}
                          </Badge>
                          <Badge className={`${appointment.priority === 'high' ? 'bg-red-100 text-red-800' : 
                            appointment.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-green-100 text-green-800'}`}>
                            {appointment.priority}
                          </Badge>
                        </div>
                      </div>

                      <div className="mb-3">
                        <h5 className="font-medium text-gray-900">{appointment.schoolName}</h5>
                        <p className="text-sm text-gray-600">{appointment.type.replace('_', ' ')}</p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                        <div>
                          <p><strong>Date:</strong> {formatDate(appointment.date)}</p>
                          <p><strong>Heure:</strong> {appointment.time}</p>
                        </div>
                        <div>
                          <p><strong>Type:</strong> {appointment.type.replace('_', ' ')}</p>
                          <p><strong>Priorité:</strong> <span className={`font-medium ${
                            appointment.priority === 'high' ? 'text-red-600' : 
                            appointment.priority === 'medium' ? 'text-yellow-600' : 
                            'text-green-600'
                          }`}>{appointment.priority}</span></p>
                        </div>
                      </div>
                      
                      {appointment.notes && (
                        <div className="mt-3 p-3 bg-gray-100 rounded text-sm">
                          <strong>Notes:</strong> {appointment.notes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5" />
                <span>Gestion des Documents Educafric</span>
              </CardTitle>
              <p className="text-sm text-gray-600">
                Gérez tous les documents de la plateforme et contrôlez leur visibilité pour les commerciaux
              </p>
            </CardHeader>
            <CardContent>
              {loadingAllDocuments ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <span className="ml-2">Chargement des documents...</span>
                </div>
              ) : allDocuments.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Aucun document trouvé</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Documents Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b bg-gray-50">
                          <th className="text-left p-3 font-medium">Document</th>
                          <th className="text-left p-3 font-medium">Type</th>
                          <th className="text-left p-3 font-medium">Catégorie</th>
                          <th className="text-left p-3 font-medium">Taille</th>
                          <th className="text-left p-3 font-medium">Visibilité</th>
                          <th className="text-left p-3 font-medium">Téléchargements</th>
                          <th className="text-left p-3 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {allDocuments.map((document: EducafricDocument) => (
                          <tr key={document.id} className="border-b hover:bg-gray-50 transition-colors">
                            <td className="p-3">
                              <div className="flex items-center space-x-3">
                                <FileText className="w-5 h-5 text-blue-600" />
                                <div>
                                  <h4 className="font-medium text-gray-900">{document.title}</h4>
                                  <p className="text-sm text-gray-600">{document.filename}</p>
                                </div>
                              </div>
                            </td>
                            <td className="p-3">
                              <Badge className={`${document.type === 'pdf' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                                {document.type.toUpperCase()}
                              </Badge>
                            </td>
                            <td className="p-3">
                              <Badge className={`${document.category === 'commercial' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                {document.category === 'commercial' ? 'Commercial' : 'Administratif'}
                              </Badge>
                            </td>
                            <td className="p-3">
                              <span className="text-sm text-gray-600">{document.size} KB</span>
                            </td>
                            <td className="p-3">
                              <Select 
                                value={document.visibilityLevel} 
                                onValueChange={(value) => updateDocumentVisibilityMutation.mutate({
                                  id: document.id,
                                  visibilityLevel: value,
                                  isVisible: value !== 'admin_only'
                                })}
                              >
                                <SelectTrigger className="w-40">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="public">Public</SelectItem>
                                  <SelectItem value="commercial_only">Commerciaux uniquement</SelectItem>
                                  <SelectItem value="admin_only">Admin uniquement</SelectItem>
                                </SelectContent>
                              </Select>
                            </td>
                            <td className="p-3">
                              <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-600">{document.downloadCount}</span>
                                <div className={`w-2 h-2 rounded-full ${
                                  document.downloadCount > 50 ? 'bg-green-500' : 
                                  document.downloadCount > 20 ? 'bg-yellow-500' : 'bg-gray-400'
                                }`}></div>
                              </div>
                            </td>
                            <td className="p-3">
                              <div className="flex items-center space-x-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => window.open(document.path, '_blank')}
                                  data-testid={`button-view-document-${document.id}`}
                                >
                                  <Eye className="w-3 h-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    navigator.clipboard.writeText(window.location.origin + document.path);
                                    toast({
                                      title: 'Lien copié',
                                      description: 'Le lien du document a été copié',
                                    });
                                  }}
                                  data-testid={`button-copy-document-${document.id}`}
                                >
                                  <Calendar className="w-3 h-3" />
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      data-testid={`button-delete-document-${document.id}`}
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Confirmer la Suppression</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Êtes-vous sûr de vouloir supprimer le document "{document.title}" ?
                                        <br />
                                        <span className="text-red-600 font-medium">Cette action est irréversible.</span>
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Annuler</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => deleteDocumentMutation.mutate(document.id)}
                                        disabled={deleteDocumentMutation.isPending}
                                        className="bg-red-600 hover:bg-red-700"
                                      >
                                        {deleteDocumentMutation.isPending ? 'Suppression...' : 'Supprimer'}
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Statistics */}
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <FileText className="w-5 h-5 text-blue-600" />
                        <span className="font-medium text-blue-900">Total Documents</span>
                      </div>
                      <p className="text-2xl font-bold text-blue-600 mt-1">{allDocuments.length}</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Users className="w-5 h-5 text-green-600" />
                        <span className="font-medium text-green-900">Publics</span>
                      </div>
                      <p className="text-2xl font-bold text-green-600 mt-1">
                        {allDocuments.filter((d: EducafricDocument) => d.visibilityLevel === 'public').length}
                      </p>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Briefcase className="w-5 h-5 text-yellow-600" />
                        <span className="font-medium text-yellow-900">Commerciaux</span>
                      </div>
                      <p className="text-2xl font-bold text-yellow-600 mt-1">
                        {allDocuments.filter((d: EducafricDocument) => d.category === 'commercial').length}
                      </p>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Lock className="w-5 h-5 text-red-600" />
                        <span className="font-medium text-red-900">Privés</span>
                      </div>
                      <p className="text-2xl font-bold text-red-600 mt-1">
                        {allDocuments.filter((d: EducafricDocument) => d.visibilityLevel === 'admin_only').length}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contracts Tab */}
        <TabsContent value="contracts" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Contrats Commerciaux
                </div>
                <Button 
                  onClick={() => setIsContractDialogOpen(true)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Nouveau Contrat
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Gestion des Contrats</h3>
                <p className="text-gray-600 mb-4">
                  Créez et gérez les contrats commerciaux pour vos partenaires
                </p>
                <Button 
                  onClick={() => setIsContractDialogOpen(true)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Créer le premier contrat
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Contract Generator Dialog */}
      <ContractGenerator
        isOpen={isContractDialogOpen}
        onClose={() => setIsContractDialogOpen(false)}
        commercialId={selectedCommercial?.id}
        onContractGenerated={(contractData) => {
          toast({
            title: 'Contrat créé',
            description: `Contrat commercial généré pour ${contractData.partnerName}`,
          });
          // Ici vous pouvez ajouter la logique pour sauvegarder en base
        }}
      />

      {/* Edit Role Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier le Rôle</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {editingCommercial && (
              <div>
                <p className="text-sm text-gray-600 mb-4">
                  Modifier le rôle de <strong>{editingCommercial.firstName} {editingCommercial.lastName}</strong>
                </p>
                <Label htmlFor="role-select">Nouveau Rôle</Label>
                <Select value={newRole} onValueChange={setNewRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un rôle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Commercial">Commercial</SelectItem>
                    <SelectItem value="Director">Directeur</SelectItem>
                    <SelectItem value="Teacher">Enseignant</SelectItem>
                    <SelectItem value="SuperAdmin">Super Admin</SelectItem>
                    <SelectItem value="SiteAdmin">Site Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Annuler
            </Button>
            <Button 
              onClick={() => {
                if (editingCommercial && newRole) {
                  updateRoleMutation.mutate({ id: editingCommercial.id, role: newRole });
                }
              }}
              disabled={updateRoleMutation.isPending || !newRole}
            >
              {updateRoleMutation.isPending ? 'Mise à jour...' : 'Confirmer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la Suppression</AlertDialogTitle>
            <AlertDialogDescription>
              {editingCommercial && (
                <>
                  Êtes-vous sûr de vouloir supprimer <strong>{editingCommercial.firstName} {editingCommercial.lastName}</strong> ?
                  <br />
                  <span className="text-red-600 font-medium">Cette action est irréversible.</span>
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (editingCommercial) {
                  deleteCommercialMutation.mutate(editingCommercial.id);
                }
              }}
              disabled={deleteCommercialMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteCommercialMutation.isPending ? 'Suppression...' : 'Supprimer'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default UnifiedCommercialManagement;