import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, Search, Filter, Plus, Edit, 
  Trash2, Ban, CheckCircle, Mail, Phone,
  School, UserCheck, AlertTriangle, Eye
} from 'lucide-react';

const FunctionalSiteAdminUsers: React.FC = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch users
  const { data: users, isLoading } = useQuery({
    queryKey: ['/api/site-admin/users', { search: searchTerm, role: roleFilter, status: statusFilter }],
    enabled: !!user
  });

  // Update user status mutation
  const updateUserMutation = useMutation({
    mutationFn: async ({ userId, action }: { userId: number; action: string }) => {
      const response = await fetch(`/api/site-admin/users/${userId}/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to update user');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/site-admin/users'] });
      toast({
        title: 'Utilisateur mis à jour',
        description: 'L\'action a été effectuée avec succès.'
      });
    },
    onError: () => {
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour l\'utilisateur.',
        variant: 'destructive'
      });
    }
  });

  const text = {
    fr: {
      title: 'Gestion des Utilisateurs',
      subtitle: 'Administration des comptes utilisateurs de la plateforme',
      loading: 'Chargement des utilisateurs...',
      search: 'Rechercher des utilisateurs...',
      filters: {
        role: 'Filtrer par rôle',
        status: 'Filtrer par statut',
        all: 'Tous'
      },
      roles: {
        SiteAdmin: 'Admin Site',
        Admin: 'Administrateur',
        Director: 'Directeur',
        Teacher: 'Enseignant',
        Parent: 'Parent',
        Student: 'Élève',
        Commercial: 'Commercial',
        Freelancer: 'Freelancer'
      },
      status: {
        active: 'Actif',
        inactive: 'Inactif',
        suspended: 'Suspendu',
        pending: 'En attente'
      },
      actions: {
        view: 'Voir',
        edit: 'Modifier',
        activate: 'Activer',
        suspend: 'Suspendre',
        delete: 'Supprimer',
        sendEmail: 'Envoyer Email'
      },
      userDetails: 'Détails de l\'utilisateur',
      stats: {
        total: 'Total Utilisateurs',
        active: 'Utilisateurs Actifs',
        newToday: 'Nouveaux Aujourd\'hui',
        suspended: 'Suspendus'
      }
    },
    en: {
      title: 'User Management',
      subtitle: 'Platform user account administration',
      loading: 'Loading users...',
      search: 'Search users...',
      filters: {
        role: 'Filter by role',
        status: 'Filter by status',
        all: 'All'
      },
      roles: {
        SiteAdmin: 'Site Admin',
        Admin: 'Administrator',
        Director: 'Director',
        Teacher: 'Teacher',
        Parent: 'Parent',
        Student: 'Student',
        Commercial: 'Commercial',
        Freelancer: 'Freelancer'
      },
      status: {
        active: 'Active',
        inactive: 'Inactive',
        suspended: 'Suspended',
        pending: 'Pending'
      },
      actions: {
        view: 'View',
        edit: 'Edit',
        activate: 'Activate',
        suspend: 'Suspend',
        delete: 'Delete',
        sendEmail: 'Send Email'
      },
      userDetails: 'User Details',
      stats: {
        total: 'Total Users',
        active: 'Active Users',
        newToday: 'New Today',
        suspended: 'Suspended'
      }
    }
  };

  const t = text[language as keyof typeof text];

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">{t.loading}</span>
        </div>
      </div>
    );
  }

  // Mock data
  const mockUsers = [
    {
      id: 1,
      firstName: 'Marie',
      lastName: 'Nkomo',
      email: 'marie.nkomo@excellence-school.cm',
      role: 'Director',
      status: 'active',
      phone: '+237 222 123 456',
      schoolName: 'École Excellence Yaoundé',
      lastLogin: '2025-08-01 06:30',
      createdAt: '2024-01-15',
      subscription: 'Premium'
    },
    {
      id: 2,
      firstName: 'Jean',
      lastName: 'Fotso',
      email: 'j.fotso@educafric.com',
      role: 'Commercial',
      status: 'active',
      phone: '+237 600 123 456',
      schoolName: null,
      lastLogin: '2025-08-01 07:15',
      createdAt: '2024-02-10',
      subscription: 'Enterprise'
    },
    {
      id: 3,
      firstName: 'Sophie',
      lastName: 'Ngono',
      email: 'sophie.ngono@parent.cm',
      role: 'Parent',
      status: 'active',
      phone: '+237 677 789 012',
      schoolName: 'École Primaire Bertoua',
      lastLogin: '2025-07-31 19:45',
      createdAt: '2024-09-05',
      subscription: 'Basic'
    },
    {
      id: 4,
      firstName: 'Ahmed',
      lastName: 'Bello',
      email: 'bello@institut-garoua.cm',
      role: 'Teacher',
      status: 'pending',
      phone: '+237 222 345 678',
      schoolName: 'Institut Technique Garoua',
      lastLogin: null,
      createdAt: '2025-07-30',
      subscription: 'Basic'
    },
    {
      id: 5,
      firstName: 'Clarisse',
      lastName: 'Tchinda',
      email: 'clarisse@suspended-user.cm',
      role: 'Teacher',
      status: 'suspended',
      phone: '+237 233 789 012',
      schoolName: 'École Maternelle Bafoussam',
      lastLogin: '2025-07-20 14:30',
      createdAt: '2024-06-15',
      subscription: 'Basic'
    }
  ];

  const mockStats = {
    total: 15420,
    active: 14387,
    newToday: 23,
    suspended: 45
  };

  const filteredUsers = (Array.isArray(mockUsers) ? mockUsers : []).filter(user => {
    if (!user) return false;
    const matchesSearch = (user.firstName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.lastName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'SiteAdmin': return 'bg-purple-100 text-purple-800';
      case 'Admin': return 'bg-blue-100 text-blue-800';
      case 'Director': return 'bg-indigo-100 text-indigo-800';
      case 'Teacher': return 'bg-green-100 text-green-800';
      case 'Commercial': return 'bg-orange-100 text-orange-800';
      case 'Parent': return 'bg-pink-100 text-pink-800';
      case 'Student': return 'bg-cyan-100 text-cyan-800';
      case 'Freelancer': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t.title || ''}</h1>
          <p className="text-gray-600 mt-1">{t.subtitle}</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Nouvel Utilisateur
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">{t?.stats?.total}</p>
                <p className="text-2xl font-bold text-blue-600">
                  {mockStats.total.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <UserCheck className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">{t?.stats?.active}</p>
                <p className="text-2xl font-bold text-green-600">
                  {mockStats.active.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Plus className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">{t?.stats?.newToday}</p>
                <p className="text-2xl font-bold text-orange-600">
                  {mockStats.newToday}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <Ban className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">{t?.stats?.suspended}</p>
                <p className="text-2xl font-bold text-red-600">
                  {mockStats.suspended}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder={t.search}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="border rounded-md px-3 py-2"
              >
                <option value="all">{t?.filters?.all}</option>
                <option value="Director">Directeur</option>
                <option value="Teacher">Enseignant</option>
                <option value="Parent">Parent</option>
                <option value="Commercial">Commercial</option>
                <option value="Admin">Admin</option>
              </select>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border rounded-md px-3 py-2"
              >
                <option value="all">{t?.filters?.all}</option>
                <option value="active">Actif</option>
                <option value="pending">En attente</option>
                <option value="suspended">Suspendu</option>
                <option value="inactive">Inactif</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">
            Utilisateurs ({filteredUsers.length})
          </h3>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-2">Utilisateur</th>
                  <th className="text-left py-3 px-2">Rôle</th>
                  <th className="text-left py-3 px-2">École</th>
                  <th className="text-left py-3 px-2">Statut</th>
                  <th className="text-left py-3 px-2">Dernière Connexion</th>
                  <th className="text-left py-3 px-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {(Array.isArray(filteredUsers) ? filteredUsers : []).map((user) => (
                  <tr key={user.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-2">
                      <div>
                        <div className="font-medium">
                          {user.firstName || ''} {user.lastName || ''}
                        </div>
                        <div className="text-sm text-gray-600">{user.email || ''}</div>
                        <div className="text-xs text-gray-500">{user.phone}</div>
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <Badge className={getRoleColor(user.role)}>
                        {t?.roles?.[user.role as keyof typeof t.roles]}
                      </Badge>
                    </td>
                    <td className="py-3 px-2">
                      <div className="text-sm">
                        {user.schoolName || '-'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {user.subscription}
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <Badge className={getStatusColor(user.status)}>
                        {t?.status?.[user.status as keyof typeof t.status]}
                      </Badge>
                    </td>
                    <td className="py-3 px-2">
                      <div className="text-sm">
                        {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Jamais'}
                      </div>
                      {user.lastLogin && (
                        <div className="text-xs text-gray-500">
                          {new Date(user.lastLogin).toLocaleTimeString()}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedUser(user)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        
                        {user.status === 'active' ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateUserMutation.mutate({ userId: user.id, action: 'suspend' })}
                            className="text-red-600 hover:bg-red-50"
                          >
                            <Ban className="w-4 h-4" />
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateUserMutation.mutate({ userId: user.id, action: 'activate' })}
                            className="text-green-600 hover:bg-green-50"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                        )}
                        
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-blue-600 hover:bg-blue-50"
                        >
                          <Mail className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FunctionalSiteAdminUsers;