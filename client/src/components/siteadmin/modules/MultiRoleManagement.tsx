import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserCog, Users, Building2, GraduationCap, Briefcase, UserCheck, Shield, Eye, Plus } from 'lucide-react';
import { ModernCard } from '@/components/ui/ModernCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

export default function MultiRoleManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('users');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: multiRoleUsers, isLoading: loadingUsers } = useQuery({
    queryKey: ['/api/admin/multi-role-users'],
    queryFn: () => fetch('/api/admin/multi-role-users', { credentials: 'include' }).then(res => res.json())
  });

  const { data: rolePermissions } = useQuery({
    queryKey: ['/api/admin/role-permissions'],
    queryFn: () => fetch('/api/admin/role-permissions', { credentials: 'include' }).then(res => res.json())
  });

  const { data: delegatedAdmins } = useQuery({
    queryKey: ['/api/admin/delegated-admins'],
    queryFn: () => fetch('/api/admin/delegated-admins', { credentials: 'include' }).then(res => res.json())
  });

  const updateRolesMutation = useMutation({
    mutationFn: async (userData: any) => {
      return apiRequest('PATCH', `/api/admin/users/${userData.id}/roles`, userData);
    },
    onSuccess: () => {
      toast({
        title: "Rôles mis à jour",
        description: "Les rôles de l'utilisateur ont été modifiés avec succès",
      });
      setIsDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['/api/admin/multi-role-users'] });
    },
    onError: () => {
      toast({
        title: "Erreur de mise à jour",
        description: "Impossible de modifier les rôles de l'utilisateur",
        variant: "destructive",
      });
    }
  });

  const availableRoles = [
    { value: 'Teacher', label: 'Enseignant', icon: <GraduationCap className="w-4 h-4" />, color: 'blue' },
    { value: 'Director', label: 'Directeur', icon: <Building2 className="w-4 h-4" />, color: 'green' },
    { value: 'Parent', label: 'Parent', icon: <Users className="w-4 h-4" />, color: 'purple' },
    { value: 'Student', label: 'Étudiant', icon: <UserCheck className="w-4 h-4" />, color: 'orange' },
    { value: 'Commercial', label: 'Commercial', icon: <Briefcase className="w-4 h-4" />, color: 'pink' },
    { value: 'Freelancer', label: 'Répétiteur', icon: <UserCog className="w-4 h-4" />, color: 'indigo' },
    { value: 'Admin', label: 'Administrateur', icon: <Shield className="w-4 h-4" />, color: 'red' }
  ];

  const tabs = [
    { id: 'users', label: 'Utilisateurs Multi-Rôles', icon: <UserCog className="w-4 h-4" /> },
    { id: 'permissions', label: 'Permissions', icon: <Shield className="w-4 h-4" /> },
    { id: 'admins', label: 'Admins Délégués', icon: <Eye className="w-4 h-4" /> }
  ];

  const handleEditRoles = (user: any) => {
    setSelectedUser(user);
    setIsDialogOpen(true);
  };

  const mockMultiRoleUsers = [
    {
      id: 1,
      name: "Dr. Marie Nkomo",
      email: "marie.nkomo@excellence.cm",
      primaryRole: "Director",
      secondaryRoles: ["Teacher", "Parent"],
      school: "École Primaire Bilingue Excellence",
      lastLogin: "2025-01-26 14:30",
      status: "active"
    },
    {
      id: 2,
      name: "Prof. Jean Mbarga",
      email: "jean.mbarga@saintmichel.cm",
      primaryRole: "Teacher",
      secondaryRoles: ["Parent"],
      school: "Collège Saint-Michel",
      lastLogin: "2025-01-26 13:15",
      status: "active"
    },
    {
      id: 3,
      name: "Sophie Kamga",
      email: "sophie.kamga@parent.cm",
      primaryRole: "Parent",
      secondaryRoles: ["Commercial"],
      school: "École Primaire Bilingue Excellence",
      lastLogin: "2025-01-26 12:45",
      status: "active"
    }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Gestion Multi-Rôles</h2>
        <p className="text-gray-600">Administration des utilisateurs avec plusieurs rôles sur la plateforme EDUCAFRIC</p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {(Array.isArray(tabs) ? tabs : []).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Utilisateurs Multi-Rôles</h3>
              <p className="text-sm text-gray-600">Gérez les utilisateurs ayant plusieurs rôles</p>
            </div>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Assigner Rôles
            </Button>
          </div>

          <ModernCard className="p-6">
            {loadingUsers ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse bg-gray-200 h-20 rounded"></div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {(Array.isArray(mockMultiRoleUsers) ? mockMultiRoleUsers : []).map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <UserCog className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">{user.name || ''}</h4>
                        <p className="text-sm text-gray-600">{user.email || ''}</p>
                        <p className="text-xs text-gray-500">{user.school}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <div className="flex items-center space-x-2">
                          <Badge className="bg-blue-100 text-blue-800">
                            {availableRoles.find(r => r.value === user.primaryRole)?.label}
                          </Badge>
                          {user.secondaryRoles.map((role, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {availableRoles.find(r => r.value === role)?.label}
                            </Badge>
                          ))}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Dernière connexion: {user.lastLogin}</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditRoles(user)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Modifier
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ModernCard>
        </div>
      )}

      {/* Permissions Tab */}
      {activeTab === 'permissions' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ModernCard className="p-6">
            <h3 className="text-lg font-semibold mb-4">Permissions par Rôle</h3>
            <div className="space-y-4">
              {(Array.isArray(availableRoles) ? availableRoles : []).map((role) => (
                <div key={role.value} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {role.icon}
                    <span className="font-medium">{role.label}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={`bg-${role.color}-100 text-${role.color}-800`}>
                      {role.value === 'Admin' ? 'Toutes' : 
                       role.value === 'Director' ? 'École' :
                       role.value === 'Teacher' ? 'Classes' :
                       role.value === 'Commercial' ? 'Ventes' :
                       'Limitées'}
                    </Badge>
                    <Button variant="outline" size="sm">
                      Configurer
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ModernCard>

          <ModernCard className="p-6">
            <h3 className="text-lg font-semibold mb-4">Statistiques Rôles</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Utilisateurs Multi-Rôles</span>
                <span className="font-semibold">47</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Directeurs-Enseignants</span>
                <span className="font-semibold">23</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Parents-Commerciaux</span>
                <span className="font-semibold">12</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Enseignants-Parents</span>
                <span className="font-semibold">18</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Admins Délégués</span>
                <span className="font-semibold">8</span>
              </div>
            </div>
          </ModernCard>
        </div>
      )}

      {/* Delegated Admins Tab */}
      {activeTab === 'admins' && (
        <ModernCard className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Administrateurs Délégués</h3>
            <Button>
              <Shield className="w-4 h-4 mr-2" />
              Nommer Admin
            </Button>
          </div>
          
          <div className="space-y-3">
            {[
              {
                id: 1,
                name: "Carine Nguetsop",
                email: "carine.nguetsop@educafric.com",
                role: "COO",
                permissions: ["Gestion Commerciale", "Documentation", "Rapports"],
                region: "Centre",
                lastActivity: "2025-01-26 15:20"
              },
              {
                id: 2,
                name: "Paul Essomba",
                email: "paul.essomba@educafric.com",
                role: "Directeur Régional",
                permissions: ["Gestion Écoles", "Support Technique"],
                region: "Littoral",
                lastActivity: "2025-01-26 14:45"
              }
            ].map((admin) => (
              <div key={admin.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <Shield className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">{admin.name || ''}</h4>
                    <p className="text-sm text-gray-600">{admin.email || ''}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge className="bg-red-100 text-red-800 text-xs">{admin.role}</Badge>
                      <span className="text-xs text-gray-500">Région {admin.region}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex flex-wrap gap-1 mb-2">
                    {admin.permissions.map((perm, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {perm}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500">Dernière activité: {admin.lastActivity}</p>
                </div>
              </div>
            ))}
          </div>
        </ModernCard>
      )}

      {/* Edit Roles Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md bg-white">
          <DialogHeader>
            <DialogTitle>Modifier les Rôles</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div>
                <h4 className="font-medium">{selectedUser.name || ''}</h4>
                <p className="text-sm text-gray-600">{selectedUser.email || ''}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rôle Principal
                </label>
                <Select defaultValue={selectedUser.primaryRole}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Array.isArray(availableRoles) ? availableRoles : []).map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        <div className="flex items-center space-x-2">
                          {role.icon}
                          <span>{role.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rôles Secondaires
                </label>
                <div className="space-y-2">
                  {(Array.isArray(availableRoles) ? availableRoles : []).filter(r => r.value !== selectedUser.primaryRole).map((role) => (
                    <div key={role.value} className="flex items-center space-x-2">
                      <Checkbox 
                        id={role.value} 
                        defaultChecked={selectedUser.secondaryRoles?.includes(role.value)}
                      />
                      <label htmlFor={role.value} className="text-sm">
                        {role.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Annuler
                </Button>
                <Button onClick={() => updateRolesMutation.mutate(selectedUser)}>
                  Sauvegarder
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}