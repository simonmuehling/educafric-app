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
  School, 
  Building2, 
  MapPin, 
  Users, 
  GraduationCap,
  Phone,
  Mail,
  Globe,
  Calendar,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  Eye,
  Download,
  Search,
  Filter
} from 'lucide-react';

interface School {
  id: number;
  name: string;
  address: string;
  city: string;
  country: string;
  phone: string | null;
  email: string | null;
  website: string | null;
  type: 'public' | 'private';
  level: string;
  studentCount: number;
  teacherCount: number;
  subscriptionStatus: string;
  createdAt: string;
  lastActiveAt: string | null;
}

const SchoolManagement = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSchools, setSelectedSchools] = useState<number[]>([]);

  const text = {
    fr: {
      title: 'Gestion des Écoles',
      subtitle: 'Administration complète des établissements scolaires',
      searchSchools: 'Rechercher écoles...',
      addSchool: 'Ajouter École',
      exportSchools: 'Exporter Écoles',
      totalSchools: 'Total Écoles',
      activeSchools: 'Écoles Actives',
      newThisMonth: 'Nouvelles ce Mois',
      filterByType: 'Filtrer par Type',
      filterByStatus: 'Filtrer par Statut',
      allTypes: 'Tous les Types',
      allStatuses: 'Tous les Statuts',
      public: 'Public',
      private: 'Privé',
      active: 'Actif',
      inactive: 'Inactif',
      suspended: 'Suspendu',
      schoolName: 'Nom École',
      location: 'Localisation',
      type: 'Type',
      students: 'Élèves',
      teachers: 'Enseignants',
      status: 'Statut',
      lastActive: 'Dernière Activité',
      actions: 'Actions',
      edit: 'Modifier',
      delete: 'Supprimer',
      view: 'Voir',
      details: 'Détails',
      statistics: 'Statistiques',
      schoolDetails: 'Détails École',
      contactInfo: 'Informations Contact',
      schoolStats: 'Statistiques École',
      subscriptionInfo: 'Informations Abonnement',
      never: 'Jamais',
      loading: 'Chargement...',
      noSchools: 'Aucune école trouvée',
      confirmDelete: 'Confirmer la suppression',
      deleteSchoolConfirm: 'Êtes-vous sûr de vouloir supprimer cette école ?',
      schoolDeleted: 'École supprimée',
      schoolUpdated: 'École mise à jour',
      error: 'Erreur',
      success: 'Succès',
      primary: 'Primaire',
      secondary: 'Secondaire',
      university: 'Universitaire',
      mixed: 'Mixte'
    },
    en: {
      title: 'School Management',
      subtitle: 'Complete educational institution administration',
      searchSchools: 'Search schools...',
      addSchool: 'Add School',
      exportSchools: 'Export Schools',
      totalSchools: 'Total Schools',
      activeSchools: 'Active Schools',
      newThisMonth: 'New This Month',
      filterByType: 'Filter by Type',
      filterByStatus: 'Filter by Status',
      allTypes: 'All Types',
      allStatuses: 'All Statuses',
      public: 'Public',
      private: 'Private',
      active: 'Active',
      inactive: 'Inactive',
      suspended: 'Suspended',
      schoolName: 'School Name',
      location: 'Location',
      type: 'Type',
      students: 'Students',
      teachers: 'Teachers',
      status: 'Status',
      lastActive: 'Last Active',
      actions: 'Actions',
      edit: 'Edit',
      delete: 'Delete',
      view: 'View',
      details: 'Details',
      statistics: 'Statistics',
      schoolDetails: 'School Details',
      contactInfo: 'Contact Information',
      schoolStats: 'School Statistics',
      subscriptionInfo: 'Subscription Information',
      never: 'Never',
      loading: 'Loading...',
      noSchools: 'No schools found',
      confirmDelete: 'Confirm Deletion',
      deleteSchoolConfirm: 'Are you sure you want to delete this school?',
      schoolDeleted: 'School deleted',
      schoolUpdated: 'School updated',
      error: 'Error',
      success: 'Success',
      primary: 'Primary',
      secondary: 'Secondary',
      university: 'University',
      mixed: 'Mixed'
    }
  };

  const t = text[language];

  // Fetch schools with filtering and pagination
  const { data: schoolsData, isLoading, error } = useQuery({
    queryKey: ['/api/admin/schools', { 
      search: searchTerm, 
      type: typeFilter, 
      status: statusFilter, 
      page: currentPage 
    }],
    queryFn: () => apiRequest('GET', `/api/admin/schools?search=${encodeURIComponent(searchTerm)}&type=${typeFilter}&status=${statusFilter}&page=${currentPage}&limit=20`)
  });

  // School statistics
  const { data: schoolStats } = useQuery({
    queryKey: ['/api/admin/school-stats'],
    queryFn: () => apiRequest('GET', '/api/admin/school-stats')
  });

  // Delete school mutation
  const deleteSchoolMutation = useMutation({
    mutationFn: (schoolId: number) => apiRequest('DELETE', `/api/admin/schools/${schoolId}`),
    onSuccess: () => {
      toast({
        title: t.success,
        description: t.schoolDeleted
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/schools'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/school-stats'] });
    },
    onError: () => {
      toast({
        title: t.error,
        description: 'Failed to delete school',
        variant: "destructive"
      });
    }
  });

  const formatDate = (dateString: string | null) => {
    if (!dateString) return t.never;
    return new Date(dateString).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US');
  };

  const getTypeColor = (type: string) => {
    return type === 'public' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLevelTranslation = (level: string) => {
    const translations = {
      'primary': t.primary,
      'secondary': t.secondary,
      'university': t.university,
      'mixed': t.mixed
    };
    return translations[level as keyof typeof translations] || level;
  };

  const handleDeleteSchool = (schoolId: number) => {
    if (confirm(t.deleteSchoolConfirm)) {
      deleteSchoolMutation.mutate(schoolId);
    }
  };

  const renderSchoolStats = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <ModernCard className="p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-100 rounded-lg">
            <School className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <div className="text-2xl font-bold">{(schoolStats as any)?.totalSchools || 0}</div>
            <div className="text-sm text-gray-600">{t.totalSchools}</div>
          </div>
        </div>
      </ModernCard>

      <ModernCard className="p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-green-100 rounded-lg">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <div className="text-2xl font-bold">{(schoolStats as any)?.activeSchools || 0}</div>
            <div className="text-sm text-gray-600">{t.activeSchools}</div>
          </div>
        </div>
      </ModernCard>

      <ModernCard className="p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-purple-100 rounded-lg">
            <Plus className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <div className="text-2xl font-bold">{(schoolStats as any)?.newThisMonth || 0}</div>
            <div className="text-sm text-gray-600">{t.newThisMonth}</div>
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
              placeholder={t.searchSchools}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e?.target?.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex gap-4">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e?.target?.value)}
            className="px-3 py-2 border rounded-md"
          >
            <option value="all">{t.allTypes}</option>
            <option value="public">{t.public}</option>
            <option value="private">{t.private}</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e?.target?.value)}
            className="px-3 py-2 border rounded-md"
          >
            <option value="all">{t.allStatuses}</option>
            <option value="active">{t.active}</option>
            <option value="inactive">{t.inactive}</option>
            <option value="suspended">{t.suspended}</option>
          </select>

          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            {t.exportSchools}
          </Button>

          <Button>
            <Plus className="w-4 h-4 mr-2" />
            {t.addSchool}
          </Button>
        </div>
      </div>
    </ModernCard>
  );

  const renderSchoolTable = () => (
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
            <p className="text-gray-600">Error loading schools</p>
          </div>
        ) : (schoolsData as any)?.schools?.length === 0 ? (
          <div className="text-center py-8">
            <School className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">{t.noSchools}</p>
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
                        setSelectedSchools((schoolsData as any)?.schools?.map((s: School) => s.id) || []);
                      } else {
                        setSelectedSchools([]);
                      }
                    }}
                  />
                </th>
                <th className="text-left py-3 px-4">{t.schoolName}</th>
                <th className="text-left py-3 px-4">{t.location}</th>
                <th className="text-left py-3 px-4">{t.type}</th>
                <th className="text-left py-3 px-4">{t.students}</th>
                <th className="text-left py-3 px-4">{t.teachers}</th>
                <th className="text-left py-3 px-4">{t.status}</th>
                <th className="text-left py-3 px-4">{t.actions}</th>
              </tr>
            </thead>
            <tbody>
              {(schoolsData as any)?.schools?.map((school: School) => (
                <tr key={school.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <input
                      type="checkbox"
                      checked={selectedSchools.includes(school.id)}
                      onChange={(e) => {
                        if (e?.target?.checked) {
                          setSelectedSchools([...selectedSchools, school.id]);
                        } else {
                          setSelectedSchools((Array.isArray(selectedSchools) ? selectedSchools : []).filter(id => id !== school.id));
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
                        <div className="font-medium">{school.name || ''}</div>
                        <div className="text-sm text-gray-600">
                          {getLevelTranslation(school.level)}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <div>
                        <div>{school.city}</div>
                        <div className="text-sm text-gray-600">{school.country}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <Badge className={getTypeColor(school.type)}>
                      {school.type === 'public' ? t.public : t.private}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-blue-500" />
                      {school.studentCount}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-green-500" />
                      {school.teacherCount}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <Badge className={getStatusColor(school.subscriptionStatus)}>
                      {school.subscriptionStatus}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleDeleteSchool(school.id)}
                        disabled={deleteSchoolMutation.isPending}
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
      {(schoolsData as any)?.totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <div className="flex gap-2">
            {Array.from({ length: (schoolsData as any).totalPages }, (_, i) => i + 1).map((page) => (
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

  if (!user || !['Admin', 'SiteAdmin'].includes(user.role)) {
    return (
      <ModernCard className="p-6">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Accès Restreint</h3>
          <p className="text-gray-600">Seuls les administrateurs peuvent accéder à la gestion des écoles.</p>
        </div>
      </ModernCard>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <ModernCard className="p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-purple-100 rounded-lg">
            <School className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">{t.title || ''}</h2>
            <p className="text-gray-600">{t.subtitle}</p>
          </div>
        </div>
      </ModernCard>

      {/* Statistics */}
      {renderSchoolStats()}

      {/* Filters */}
      {renderFilters()}

      {/* School Table */}
      {renderSchoolTable()}
    </div>
  );
};

export default SchoolManagement;