import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { ModernCard } from '@/components/ui/ModernCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
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
  HandMetal,
  PieChart,
  BarChart3
} from 'lucide-react';

interface CommercialLead {
  id: number;
  companyName: string;
  contactName: string;
  email: string;
  phone: string | null;
  position: string;
  location: string;
  status: 'prospect' | 'contacted' | 'negotiating' | 'converted' | 'lost';
  estimatedValue: number;
  schoolType: 'public' | 'private';
  studentCount: number;
  assignedTo: string;
  lastContactAt: string | null;
  createdAt: string;
  notes: string | null;
}

const CommercialManagement = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLeads, setSelectedLeads] = useState<number[]>([]);

  const text = {
    fr: {
      title: 'Gestion Commerciale',
      subtitle: 'Administration de l\'équipe commerciale et des prospects',
      searchLeads: 'Rechercher prospects...',
      addLead: 'Ajouter Prospect',
      exportLeads: 'Exporter Prospects',
      totalLeads: 'Total Prospects',
      activeDeals: 'Négociations Actives',
      monthlyRevenue: 'Revenus Mensuels',
      conversionRate: 'Taux Conversion',
      filterByStatus: 'Filtrer par Statut',
      filterByType: 'Filtrer par Type',
      allStatuses: 'Tous les Statuts',
      allTypes: 'Tous Types',
      prospect: 'Prospect',
      contacted: 'Contacté',
      negotiating: 'Négociation',
      converted: 'Converti',
      lost: 'Perdu',
      public: 'Public',
      private: 'Privé',
      companyName: 'Nom Entreprise',
      contactName: 'Contact',
      position: 'Poste',
      location: 'Localisation',
      status: 'Statut',
      estimatedValue: 'Valeur Estimée',
      students: 'Élèves',
      assignedTo: 'Assigné à',
      lastContact: 'Dernier Contact',
      actions: 'Actions',
      edit: 'Modifier',
      delete: 'Supprimer',
      view: 'Voir',
      contact: 'Contacter',
      schedule: 'Planifier',
      convert: 'Convertir',
      bulkActions: 'Actions Groupées',
      assignSelected: 'Assigner Sélectionnés',
      exportSelected: 'Exporter Sélectionnés',
      leadDetails: 'Détails Prospect',
      leadInfo: 'Informations Prospect',
      dealValue: 'Valeur Affaire',
      salesPipeline: 'Pipeline Ventes',
      teamPerformance: 'Performance Équipe',
      never: 'Jamais',
      loading: 'Chargement...',
      noLeads: 'Aucun prospect trouvé',
      confirmDelete: 'Confirmer la suppression',
      deleteLeadConfirm: 'Êtes-vous sûr de vouloir supprimer ce prospect ?',
      leadDeleted: 'Prospect supprimé',
      leadUpdated: 'Prospect mis à jour',
      leadCreated: 'Prospect créé',
      error: 'Erreur',
      success: 'Succès',
      cfa: 'CFA',
      salesStats: 'Statistiques Ventes',
      recentActivity: 'Activité Récente',
      topPerformers: 'Meilleurs Vendeurs',
      pipelineOverview: 'Aperçu Pipeline'
    },
    en: {
      title: 'Commercial Management',
      subtitle: 'Sales team and prospect administration',
      searchLeads: 'Search prospects...',
      addLead: 'Add Lead',
      exportLeads: 'Export Leads',
      totalLeads: 'Total Leads',
      activeDeals: 'Active Deals',
      monthlyRevenue: 'Monthly Revenue',
      conversionRate: 'Conversion Rate',
      filterByStatus: 'Filter by Status',
      filterByType: 'Filter by Type',
      allStatuses: 'All Statuses',
      allTypes: 'All Types',
      prospect: 'Prospect',
      contacted: 'Contacted',
      negotiating: 'Negotiating',
      converted: 'Converted',
      lost: 'Lost',
      public: 'Public',
      private: 'Private',
      companyName: 'Company Name',
      contactName: 'Contact',
      position: 'Position',
      location: 'Location',
      status: 'Status',
      estimatedValue: 'Estimated Value',
      students: 'Students',
      assignedTo: 'Assigned To',
      lastContact: 'Last Contact',
      actions: 'Actions',
      edit: 'Edit',
      delete: 'Delete',
      view: 'View',
      contact: 'Contact',
      schedule: 'Schedule',
      convert: 'Convert',
      bulkActions: 'Bulk Actions',
      assignSelected: 'Assign Selected',
      exportSelected: 'Export Selected',
      leadDetails: 'Lead Details',
      leadInfo: 'Lead Information',
      dealValue: 'Deal Value',
      salesPipeline: 'Sales Pipeline',
      teamPerformance: 'Team Performance',
      never: 'Never',
      loading: 'Loading...',
      noLeads: 'No leads found',
      confirmDelete: 'Confirm Deletion',
      deleteLeadConfirm: 'Are you sure you want to delete this lead?',
      leadDeleted: 'Lead deleted',
      leadUpdated: 'Lead updated',
      leadCreated: 'Lead created',
      error: 'Error',
      success: 'Success',
      cfa: 'CFA',
      salesStats: 'Sales Statistics',
      recentActivity: 'Recent Activity',
      topPerformers: 'Top Performers',
      pipelineOverview: 'Pipeline Overview'
    }
  };

  const t = text[language];

  // Fetch leads with filtering and pagination
  const { data: leadsData, isLoading, error } = useQuery({
    queryKey: ['/api/admin/commercial/leads', { 
      search: searchTerm, 
      status: statusFilter, 
      type: typeFilter, 
      page: currentPage 
    }],
    queryFn: () => apiRequest('GET', `/api/admin/commercial/leads?search=${encodeURIComponent(searchTerm)}&status=${statusFilter}&type=${typeFilter}&page=${currentPage}&limit=20`)
  });

  // Commercial statistics
  const { data: commercialStats } = useQuery({
    queryKey: ['/api/admin/commercial/stats'],
    queryFn: () => apiRequest('GET', '/api/admin/commercial/stats')
  });

  // Delete lead mutation
  const deleteLeadMutation = useMutation({
    mutationFn: (leadId: number) => apiRequest('DELETE', `/api/admin/commercial/leads/${leadId}`),
    onSuccess: () => {
      toast({
        title: t.success,
        description: t.leadDeleted
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/commercial/leads'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/commercial/stats'] });
    },
    onError: () => {
      toast({
        title: t.error,
        description: 'Failed to delete lead',
        variant: "destructive"
      });
    }
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' ' + t.cfa;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return t.never;
    return new Date(dateString).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'prospect': return 'bg-gray-100 text-gray-800';
      case 'contacted': return 'bg-blue-100 text-blue-800';
      case 'negotiating': return 'bg-yellow-100 text-yellow-800';
      case 'converted': return 'bg-green-100 text-green-800';
      case 'lost': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusTranslation = (status: string) => {
    const translations = {
      'prospect': t.prospect,
      'contacted': t.contacted,
      'negotiating': t.negotiating,
      'converted': t.converted,
      'lost': t.lost
    };
    return translations[status as keyof typeof translations] || status;
  };

  const getTypeColor = (type: string) => {
    return type === 'public' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800';
  };

  const handleDeleteLead = (leadId: number) => {
    if (confirm(t.deleteLeadConfirm)) {
      deleteLeadMutation.mutate(leadId);
    }
  };

  const renderCommercialStats = () => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
      <ModernCard className="p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-100 rounded-lg">
            <Users className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <div className="text-2xl font-bold">{(commercialStats as any)?.totalLeads || 0}</div>
            <div className="text-sm text-gray-600">{t.totalLeads}</div>
          </div>
        </div>
      </ModernCard>

      <ModernCard className="p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-yellow-100 rounded-lg">
            <HandMetal className="w-6 h-6 text-yellow-600" />
          </div>
          <div>
            <div className="text-2xl font-bold">{(commercialStats as any)?.activeDeals || 0}</div>
            <div className="text-sm text-gray-600">{t.activeDeals}</div>
          </div>
        </div>
      </ModernCard>

      <ModernCard className="p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-green-100 rounded-lg">
            <DollarSign className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <div className="text-2xl font-bold">
              {formatCurrency((commercialStats as any)?.monthlyRevenue || 0)}
            </div>
            <div className="text-sm text-gray-600">{t.monthlyRevenue}</div>
          </div>
        </div>
      </ModernCard>

      <ModernCard className="p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-purple-100 rounded-lg">
            <TrendingUp className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <div className="text-2xl font-bold">
              {((commercialStats as any)?.conversionRate || 0).toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">{t.conversionRate}</div>
          </div>
        </div>
      </ModernCard>
    </div>
  );

  const renderFilters = () => (
    <ModernCard className="p-6 mb-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder={t.searchLeads}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e?.target?.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex gap-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e?.target?.value)}
            className="px-3 py-2 border rounded-md"
          >
            <option value="all">{t.allStatuses}</option>
            <option value="prospect">{t.prospect}</option>
            <option value="contacted">{t.contacted}</option>
            <option value="negotiating">{t.negotiating}</option>
            <option value="converted">{t.converted}</option>
            <option value="lost">{t.lost}</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e?.target?.value)}
            className="px-3 py-2 border rounded-md"
          >
            <option value="all">{t.allTypes}</option>
            <option value="public">{t.public}</option>
            <option value="private">{t.private}</option>
          </select>

          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            {t.exportLeads}
          </Button>

          <Button>
            <Plus className="w-4 h-4 mr-2" />
            {t.addLead}
          </Button>
        </div>
      </div>
    </ModernCard>
  );

  const renderLeadsTable = () => (
    <ModernCard className="p-6">
      <div className="overflow-x-auto">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <RefreshCw className="w-6 h-6 animate-spin" />
            <span className="ml-2">{t.loading}</span>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-gray-600">Error loading leads</p>
          </div>
        ) : (leadsData as any)?.leads?.length === 0 ? (
          <div className="text-center py-8">
            <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">{t.noLeads}</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      if (e?.target?.checked) {
                        setSelectedLeads((leadsData as any)?.leads?.map((l: CommercialLead) => l.id) || []);
                      } else {
                        setSelectedLeads([]);
                      }
                    }}
                  />
                </th>
                <th className="text-left py-3 px-4">{t.companyName}</th>
                <th className="text-left py-3 px-4">{t.contactName}</th>
                <th className="text-left py-3 px-4">{t.location}</th>
                <th className="text-left py-3 px-4">{t.status}</th>
                <th className="text-left py-3 px-4">{t.estimatedValue}</th>
                <th className="text-left py-3 px-4">{t.students}</th>
                <th className="text-left py-3 px-4">{t.assignedTo}</th>
                <th className="text-left py-3 px-4">{t.lastContact}</th>
                <th className="text-left py-3 px-4">{t.actions}</th>
              </tr>
            </thead>
            <tbody>
              {(leadsData as any)?.leads?.map((lead: CommercialLead) => (
                <tr key={lead.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <input
                      type="checkbox"
                      checked={selectedLeads.includes(lead.id)}
                      onChange={(e) => {
                        if (e?.target?.checked) {
                          setSelectedLeads([...selectedLeads, lead.id]);
                        } else {
                          setSelectedLeads((Array.isArray(selectedLeads) ? selectedLeads : []).filter(id => id !== lead.id));
                        }
                      }}
                    />
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Building2 className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium">{lead.companyName}</div>
                        <Badge className={getTypeColor(lead.schoolType)} variant="outline">
                          {lead.schoolType === 'public' ? t.public : t.private}
                        </Badge>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div>
                      <div className="font-medium">{lead.contactName}</div>
                      <div className="text-sm text-gray-600">{lead.position}</div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="w-3 h-3" />
                        {lead.email || ''}
                      </div>
                      {lead.phone && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone className="w-3 h-3" />
                          {lead.phone}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      {lead.location}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <Badge className={getStatusColor(lead.status)}>
                      {getStatusTranslation(lead.status)}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-green-500" />
                      {formatCurrency(lead.estimatedValue)}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-blue-500" />
                      {lead.studentCount}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    {lead.assignedTo}
                  </td>
                  <td className="py-3 px-4">
                    {formatDate(lead.lastContactAt)}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Phone className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleDeleteLead(lead.id)}
                        disabled={deleteLeadMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {(leadsData as any)?.totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <div className="flex gap-2">
            {Array.from({ length: (leadsData as any).totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                size="sm"
                variant={currentPage === page ? "default" : "outline"}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </Button>
            ))}
          </div>
        </div>
      )}
    </ModernCard>
  );

  const renderSalesPipeline = () => (
    <ModernCard className="p-6 mb-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <PieChart className="w-5 h-5" />
        {t.pipelineOverview}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {[
          { status: 'prospect', count: (commercialStats as any)?.pipeline?.prospect || 0, color: 'bg-gray-100' },
          { status: 'contacted', count: (commercialStats as any)?.pipeline?.contacted || 0, color: 'bg-blue-100' },
          { status: 'negotiating', count: (commercialStats as any)?.pipeline?.negotiating || 0, color: 'bg-yellow-100' },
          { status: 'converted', count: (commercialStats as any)?.pipeline?.converted || 0, color: 'bg-green-100' },
          { status: 'lost', count: (commercialStats as any)?.pipeline?.lost || 0, color: 'bg-red-100' }
        ].map((stage) => (
          <div key={stage.status} className={`p-4 rounded-lg ${stage.color}`}>
            <div className="text-center">
              <div className="text-2xl font-bold">{stage.count}</div>
              <div className="text-sm font-medium">
                {getStatusTranslation(stage.status)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </ModernCard>
  );

  if (!user || !['Admin', 'SiteAdmin'].includes(user.role)) {
    return (
      <ModernCard className="p-6">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Accès Restreint</h3>
          <p className="text-gray-600">Seuls les administrateurs peuvent accéder à la gestion commerciale.</p>
        </div>
      </ModernCard>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <ModernCard className="p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-pink-100 rounded-lg">
            <Briefcase className="w-6 h-6 text-pink-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">{t.title || ''}</h2>
            <p className="text-gray-600">{t.subtitle}</p>
          </div>
        </div>
      </ModernCard>

      {/* Statistics */}
      {renderCommercialStats()}

      {/* Sales Pipeline */}
      {renderSalesPipeline()}

      {/* Filters */}
      {renderFilters()}

      {/* Leads Table */}
      {renderLeadsTable()}
    </div>
  );
};

export default CommercialManagement;