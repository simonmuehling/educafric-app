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
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  MoreHorizontal,
  Edit,
  Trash2,
  Shield,
  Mail,
  Phone,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Eye,
  UserCheck,
  UserX,
  Download,
  Upload
} from 'lucide-react';

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  subscriptionStatus: string;
  lastLoginAt: string | null;
  createdAt: string;
  isTestAccount: boolean;
  phone: string | null;
  schoolId: number | null;
}

const UserManagement = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);

  const text = {
    fr: {
      title: 'Gestion des Utilisateurs',
      subtitle: 'Administration complète des comptes utilisateur',
      searchUsers: 'Rechercher utilisateurs...',
      addUser: 'Ajouter Utilisateur',
      exportUsers: 'Exporter Utilisateurs',
      importUsers: 'Importer Utilisateurs',
      totalUsers: 'Total Utilisateurs',
      activeUsers: 'Utilisateurs Actifs',
      newThisMonth: 'Nouveaux ce Mois',
      filterByRole: 'Filtrer par Rôle',
      filterByStatus: 'Filtrer par Statut',
      allRoles: 'Tous les Rôles',
      allStatuses: 'Tous les Statuts',
      active: 'Actif',
      inactive: 'Inactif',
      suspended: 'Suspendu',
      name: 'Nom',
      email: 'Email',
      role: 'Rôle',
      status: 'Statut',
      lastLogin: 'Dernière Connexion',
      actions: 'Actions',
      edit: 'Modifier',
      delete: 'Supprimer',
      view: 'Voir',
      activate: 'Activer',
      suspend: 'Suspendre',
      resetPassword: 'Réinitialiser MdP',
      sendEmail: 'Envoyer Email',
      bulkActions: 'Actions Groupées',
      deleteSelected: 'Supprimer Sélectionnés',
      exportSelected: 'Exporter Sélectionnés',
      userDetails: 'Détails Utilisateur',
      accountInfo: 'Informations Compte',
      subscriptionInfo: 'Informations Abonnement',
      loginHistory: 'Historique Connexions',
      testAccount: 'Compte Test',
      regularAccount: 'Compte Normal',
      never: 'Jamais',
      loading: 'Chargement...',
      noUsers: 'Aucun utilisateur trouvé',
      confirmDelete: 'Confirmer la suppression',
      deleteUserConfirm: 'Êtes-vous sûr de vouloir supprimer cet utilisateur ?',
      userDeleted: 'Utilisateur supprimé',
      userUpdated: 'Utilisateur mis à jour',
      error: 'Erreur',
      success: 'Succès'
    },
    en: {
      title: 'User Management',
      subtitle: 'Complete user account administration',
      searchUsers: 'Search users...',
      addUser: 'Add User',
      exportUsers: 'Export Users',
      importUsers: 'Import Users',
      totalUsers: 'Total Users',
      activeUsers: 'Active Users',
      newThisMonth: 'New This Month',
      filterByRole: 'Filter by Role',
      filterByStatus: 'Filter by Status',
      allRoles: 'All Roles',
      allStatuses: 'All Statuses',
      active: 'Active',
      inactive: 'Inactive',
      suspended: 'Suspended',
      name: 'Name',
      email: 'Email',
      role: 'Role',
      status: 'Status',
      lastLogin: 'Last Login',
      actions: 'Actions',
      edit: 'Edit',
      delete: 'Delete',
      view: 'View',
      activate: 'Activate',
      suspend: 'Suspend',
      resetPassword: 'Reset Password',
      sendEmail: 'Send Email',
      bulkActions: 'Bulk Actions',
      deleteSelected: 'Delete Selected',
      exportSelected: 'Export Selected',
      userDetails: 'User Details',
      accountInfo: 'Account Information',
      subscriptionInfo: 'Subscription Information',
      loginHistory: 'Login History',
      testAccount: 'Test Account',
      regularAccount: 'Regular Account',
      never: 'Never',
      loading: 'Loading...',
      noUsers: 'No users found',
      confirmDelete: 'Confirm Deletion',
      deleteUserConfirm: 'Are you sure you want to delete this user?',
      userDeleted: 'User deleted',
      userUpdated: 'User updated',
      error: 'Error',
      success: 'Success'
    }
  };

  const t = text[language];

  // Fetch users with filtering and pagination
  const { data: usersData, isLoading, error } = useQuery({
    queryKey: ['/api/admin/users', { 
      search: searchTerm, 
      role: roleFilter, 
      status: statusFilter, 
      page: currentPage 
    }],
    queryFn: () => apiRequest('GET', `/api/admin/users?search=${encodeURIComponent(searchTerm)}&role=${roleFilter}&status=${statusFilter}&page=${currentPage}&limit=20`)
  });

  // User statistics
  const { data: userStats } = useQuery({
    queryKey: ['/api/admin/user-stats'],
    queryFn: () => apiRequest('GET', '/api/admin/user-stats')
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: (userId: number) => apiRequest('DELETE', `/api/admin/users/${userId}`),
    onSuccess: () => {
      toast({
        title: t.success,
        description: t.userDeleted
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/user-stats'] });
    },
    onError: () => {
      toast({
        title: t.error,
        description: 'Failed to delete user',
        variant: "destructive"
      });
    }
  });

  // Update user status mutation
  const updateUserStatusMutation = useMutation({
    mutationFn: ({ userId, status }: { userId: number; status: string }) => 
      apiRequest('PATCH', `/api/admin/users/${userId}/status`, { status }),
    onSuccess: () => {
      toast({
        title: t.success,
        description: t.userUpdated
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
    }
  });

  const formatDate = (dateString: string | null) => {
    if (!dateString) return t.never;
    return new Date(dateString).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US');
  };

  const getRoleColor = (role: string) => {
    const colors = {
      'SiteAdmin': 'bg-red-100 text-red-800',
      'Admin': 'bg-orange-100 text-orange-800',
      'Director': 'bg-purple-100 text-purple-800',
      'Teacher': 'bg-blue-100 text-blue-800',
      'Parent': 'bg-green-100 text-green-800',
      'Student': 'bg-cyan-100 text-cyan-800',
      'Freelancer': 'bg-indigo-100 text-indigo-800',
      'Commercial': 'bg-pink-100 text-pink-800'
    };
    return colors[role as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDeleteUser = (userId: number) => {
    if (confirm(t.deleteUserConfirm)) {
      deleteUserMutation.mutate(userId);
    }
  };

  const handleStatusChange = (userId: number, newStatus: string) => {
    updateUserStatusMutation.mutate({ userId, status: newStatus });
  };

  const renderUserStats = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <ModernCard className="p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-100 rounded-lg">
            <Users className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <div className="text-2xl font-bold">{userStats?.totalUsers || 0}</div>
            <div className="text-sm text-gray-600">{t.totalUsers}</div>
          </div>
        </div>
      </ModernCard>

      <ModernCard className="p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-green-100 rounded-lg">
            <UserCheck className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <div className="text-2xl font-bold">{userStats?.activeUsers || 0}</div>
            <div className="text-sm text-gray-600">{t.activeUsers}</div>
          </div>
        </div>
      </ModernCard>

      <ModernCard className="p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-purple-100 rounded-lg">
            <UserPlus className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <div className="text-2xl font-bold">{userStats?.newThisMonth || 0}</div>
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
              placeholder={t.searchUsers}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e?.target?.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex gap-4">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e?.target?.value)}
            className="px-3 py-2 border rounded-md"
          >
            <option value="all">{t.allRoles}</option>
            <option value="SiteAdmin">SiteAdmin</option>
            <option value="Admin">Admin</option>
            <option value="Director">Director</option>
            <option value="Teacher">Teacher</option>
            <option value="Parent">Parent</option>
            <option value="Student">Student</option>
            <option value="Freelancer">Freelancer</option>
            <option value="Commercial">Commercial</option>
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
            {t.exportUsers}
          </Button>

          <Button>
            <UserPlus className="w-4 h-4 mr-2" />
            {t.addUser}
          </Button>
        </div>
      </div>
    </ModernCard>
  );

  const renderUserTable = () => (
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
            <p className="text-gray-600">Error loading users</p>
          </div>
        ) : usersData?.users?.length === 0 ? (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">{t.noUsers}</p>
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
                        setSelectedUsers(usersData?.users?.map((u: User) => u.id) || []);
                      } else {
                        setSelectedUsers([]);
                      }
                    }}
                  />
                </th>
                <th className="text-left py-3 px-4">{t.name || ''}</th>
                <th className="text-left py-3 px-4">{t.email || ''}</th>
                <th className="text-left py-3 px-4">{t.role}</th>
                <th className="text-left py-3 px-4">{t.status}</th>
                <th className="text-left py-3 px-4">{t.lastLogin}</th>
                <th className="text-left py-3 px-4">{t.actions}</th>
              </tr>
            </thead>
            <tbody>
              {usersData?.users?.map((userData: User) => (
                <tr key={userData.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(userData.id)}
                      onChange={(e) => {
                        if (e?.target?.checked) {
                          setSelectedUsers([...selectedUsers, userData.id]);
                        } else {
                          setSelectedUsers((Array.isArray(selectedUsers) ? selectedUsers : []).filter(id => id !== userData.id));
                        }
                      }}
                    />
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600">
                          {userData.firstName?.[0]}{userData.lastName?.[0]}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium">
                          {userData.firstName || ''} {userData.lastName || ''}
                        </div>
                        {userData.isTestAccount && (
                          <Badge variant="outline" className="text-xs">
                            {t.testAccount}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      {userData.email || ''}
                    </div>
                    {userData.phone && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="w-3 h-3" />
                        {userData.phone}
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <Badge className={getRoleColor(userData.role)}>
                      {userData.role}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    <Badge className={getStatusColor(userData.subscriptionStatus)}>
                      {userData.subscriptionStatus}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    {formatDate(userData.lastLoginAt)}
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
                        onClick={() => handleDeleteUser(userData.id)}
                        disabled={deleteUserMutation.isPending}
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
      {usersData?.totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <div className="flex gap-2">
            {Array.from({ length: usersData.totalPages }, (_, i) => i + 1).map((page) => (
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
          <p className="text-gray-600">Seuls les administrateurs peuvent accéder à la gestion des utilisateurs.</p>
        </div>
      </ModernCard>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <ModernCard className="p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-green-100 rounded-lg">
            <Users className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">{t.title || ''}</h2>
            <p className="text-gray-600">{t.subtitle}</p>
          </div>
        </div>
      </ModernCard>

      {/* Statistics */}
      {renderUserStats()}

      {/* Filters */}
      {renderFilters()}

      {/* User Table */}
      {renderUserTable()}
    </div>
  );
};

export default UserManagement;