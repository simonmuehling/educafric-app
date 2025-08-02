import React, { useState, useEffect } from 'react';
import { Users, Plus, Edit, Trash2, Search, Filter, UserCheck, UserX, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface PlatformUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  schoolName?: string;
  status: string;
  lastLogin: string;
  createdAt: string;
}

const FunctionalSiteAdminUsers: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const queryClient = useQueryClient();

  const { data: users, isLoading, error } = useQuery({
    queryKey: ['/api/admin/platform-users'],
    queryFn: () => apiRequest('/api/admin/platform-users')
  });

  const deleteUserMutation = useMutation({
    mutationFn: (userId: number) => apiRequest(`/api/admin/platform-users/${userId}`, {
      method: 'DELETE'
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/platform-users'] });
    }
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ userId, updates }: { userId: number; updates: any }) => 
      apiRequest(`/api/admin/platform-users/${userId}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/platform-users'] });
    }
  });

  const filteredUsers = users?.filter((user: PlatformUser) => {
    const matchesSearch = user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesRole;
  }) || [];

  const handleDeleteUser = (userId: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      deleteUserMutation.mutate(userId);
    }
  };

  const handleToggleStatus = (user: PlatformUser) => {
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    updateUserMutation.mutate({
      userId: user.id,
      updates: { status: newStatus }
    });
  };

  const getRoleBadgeColor = (role: string) => {
    const colors: { [key: string]: string } = {
      'SiteAdmin': 'bg-red-100 text-red-800',
      'Admin': 'bg-purple-100 text-purple-800',
      'Director': 'bg-blue-100 text-blue-800',
      'Teacher': 'bg-green-100 text-green-800',
      'Parent': 'bg-orange-100 text-orange-800',
      'Student': 'bg-gray-100 text-gray-800',
      'Commercial': 'bg-yellow-100 text-yellow-800',
      'Freelancer': 'bg-pink-100 text-pink-800'
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span>Chargement des utilisateurs...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <p>Erreur lors du chargement des utilisateurs</p>
            <p className="text-sm mt-2">Veuillez réessayer plus tard</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            Gestion des Utilisateurs
            <Badge variant="secondary" className="ml-2">
              {filteredUsers.length} utilisateurs
            </Badge>
          </CardTitle>
          <Button 
            onClick={() => setShowAddModal(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Ajouter Utilisateur
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {/* Search and Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Rechercher par nom ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              data-testid="input-search-users"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              data-testid="select-filter-role"
            >
              <option value="all">Tous les rôles</option>
              <option value="SiteAdmin">Site Admin</option>
              <option value="Admin">Admin</option>
              <option value="Director">Directeur</option>
              <option value="Teacher">Enseignant</option>
              <option value="Parent">Parent</option>
              <option value="Student">Étudiant</option>
              <option value="Commercial">Commercial</option>
              <option value="Freelancer">Freelancer</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-700">Utilisateur</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Rôle</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">École</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Statut</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Dernière Connexion</th>
                <th className="text-right py-3 px-4 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user: PlatformUser) => (
                <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50" data-testid={`row-user-${user.id}`}>
                  <td className="py-3 px-4">
                    <div>
                      <div className="font-medium text-gray-900">
                        {user.firstName} {user.lastName}
                      </div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <Badge className={getRoleBadgeColor(user.role)}>
                      {user.role}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {user.schoolName || '-'}
                  </td>
                  <td className="py-3 px-4">
                    <Badge 
                      className={user.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                      }
                    >
                      {user.status === 'active' ? 'Actif' : 'Inactif'}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {user.lastLogin}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleToggleStatus(user)}
                        className="h-8 w-8 p-0"
                        data-testid={`button-toggle-status-${user.id}`}
                      >
                        {user.status === 'active' ? (
                          <UserX className="h-4 w-4 text-red-600" />
                        ) : (
                          <UserCheck className="h-4 w-4 text-green-600" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 w-8 p-0"
                        data-testid={`button-edit-${user.id}`}
                      >
                        <Edit className="h-4 w-4 text-blue-600" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteUser(user.id)}
                        className="h-8 w-8 p-0"
                        data-testid={`button-delete-${user.id}`}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Aucun utilisateur trouvé</p>
            <p className="text-sm">Essayez de modifier vos critères de recherche</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FunctionalSiteAdminUsers;