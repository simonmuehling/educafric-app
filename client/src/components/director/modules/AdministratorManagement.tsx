import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Shield, UserPlus, Users, CheckCircle, Clock, Award, Edit, Settings, User, Trash2, Mail, Phone, Loader2 } from 'lucide-react';

const AdministratorManagement: React.FC = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showAddAdminModal, setShowAddAdminModal] = useState(false);
  const [showEditPermissionsModal, setShowEditPermissionsModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<any>(null);
  const [newAdmin, setNewAdmin] = useState({
    teacherId: '',
    adminLevel: '',
    permissions: [] as string[]
  });

  const text = {
    fr: {
      title: 'Gestion Administrateurs',
      subtitle: 'Administration des comptes et permissions',
      totalAdmins: 'Total Administrateurs',
      activeAdmins: 'Administrateurs Actifs',
      pendingInvites: 'Invitations En Attente',
      roles: 'Rôles Disponibles',
      adminName: 'Nom',
      email: 'Email',
      role: 'Rôle',
      permissions: 'Permissions',
      status: 'Statut',
      actions: 'Actions',
      addAdmin: 'Ajouter Administrateur',
      editPermissions: 'Modifier Permissions',
      deactivate: 'Désactiver',
      active: 'Actif',
      inactive: 'Inactif',
      pending: 'En attente',
      principalDirector: 'Directeur Principal',
      deputyDirector: 'Directeur Adjoint',
      academicCoordinator: 'Coordinateur Académique',
      adminAssistant: 'Assistant Administratif',
      fullAccess: 'Accès Complet',
      limitedAccess: 'Accès Limité',
      readOnly: 'Lecture Seule',
      adminAdded: 'Administrateur ajouté!',
      permissionsUpdated: 'Permissions mises à jour!'
    },
    en: {
      title: 'Administrator Management',
      subtitle: 'Account and permissions administration',
      totalAdmins: 'Total Administrators',
      activeAdmins: 'Active Administrators',
      pendingInvites: 'Pending Invites',
      roles: 'Available Roles',
      adminName: 'Name',
      email: 'Email',
      role: 'Role',
      permissions: 'Permissions',
      status: 'Status',
      actions: 'Actions',
      addAdmin: 'Add Administrator',
      editPermissions: 'Edit Permissions',
      deactivate: 'Deactivate',
      active: 'Active',
      inactive: 'Inactive',
      pending: 'Pending',
      principalDirector: 'Principal Director',
      deputyDirector: 'Deputy Director',
      academicCoordinator: 'Academic Coordinator',
      adminAssistant: 'Admin Assistant',
      fullAccess: 'Full Access',
      limitedAccess: 'Limited Access',
      readOnly: 'Read Only',
      adminAdded: 'Administrator added!',
      permissionsUpdated: 'Permissions updated!'
    }
  };

  const t = text[language as keyof typeof text];

  // API Queries
  const { data: administrators = [], isLoading: loadingAdmins } = useQuery({
    queryKey: ['/api/school/1/administrators'],
    queryFn: async () => {
      console.log('[ADMIN_MANAGEMENT] 📡 Fetching school administrators...');
      const response = await fetch('/api/school/1/administrators', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch administrators');
      const data = await response.json();
      console.log('[ADMIN_MANAGEMENT] ✅ Administrators loaded:', data);
      return data;
    }
  });

  const { data: availableTeachers = [] } = useQuery({
    queryKey: ['/api/teachers/school'],
    queryFn: async () => {
      console.log('[ADMIN_MANAGEMENT] 📡 Fetching available teachers...');
      const response = await fetch('/api/teachers/school', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch teachers');
      const data = await response.json();
      console.log('[ADMIN_MANAGEMENT] ✅ Teachers loaded:', data);
      return data;
    }
  });

  const { data: modulePermissions = [] } = useQuery({
    queryKey: ['/api/permissions/modules'],
    queryFn: async () => {
      console.log('[ADMIN_MANAGEMENT] 📡 Fetching module permissions...');
      const response = await fetch('/api/permissions/modules', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch permissions');
      const data = await response.json();
      console.log('[ADMIN_MANAGEMENT] ✅ Permissions loaded:', data);
      return data;
    }
  });

  // Mutations
  const addAdminMutation = useMutation({
    mutationFn: async (adminData: { teacherId: string; adminLevel: string }) => {
      console.log('[ADMIN_MANAGEMENT] 💾 Adding new administrator:', adminData);
      const response = await fetch('/api/school/1/administrators', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(adminData)
      });
      if (!response.ok) throw new Error('Failed to add administrator');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/school/1/administrators'] });
      toast({
        title: t.adminAdded,
        description: language === 'fr' ? 'Nouvel administrateur ajouté avec succès.' : 'New administrator added successfully.'
      });
      setShowAddAdminModal(false);
      setNewAdmin({ teacherId: '', adminLevel: '', permissions: [] });
    },
    onError: (error: any) => {
      console.error('[ADMIN_MANAGEMENT] ❌ Error adding administrator:', error);
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' ? 'Erreur lors de l\'ajout de l\'administrateur.' : 'Error adding administrator.',
        variant: 'destructive'
      });
    }
  });

  const updatePermissionsMutation = useMutation({
    mutationFn: async ({ adminId, permissions }: { adminId: number; permissions: string[] }) => {
      console.log('[ADMIN_MANAGEMENT] 💾 Updating administrator permissions:', { adminId, permissions });
      const response = await fetch(`/api/school/1/administrators/${adminId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ permissions })
      });
      if (!response.ok) throw new Error('Failed to update permissions');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/school/1/administrators'] });
      toast({
        title: t.permissionsUpdated,
        description: language === 'fr' ? 'Permissions mises à jour avec succès.' : 'Permissions updated successfully.'
      });
      setShowEditPermissionsModal(false);
      setSelectedAdmin(null);
    },
    onError: (error: any) => {
      console.error('[ADMIN_MANAGEMENT] ❌ Error updating permissions:', error);
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' ? 'Erreur lors de la mise à jour des permissions.' : 'Error updating permissions.',
        variant: 'destructive'
      });
    }
  });

  const removeAdminMutation = useMutation({
    mutationFn: async (adminId: number) => {
      console.log('[ADMIN_MANAGEMENT] 🗑️ Removing administrator:', adminId);
      const response = await fetch(`/api/school/1/administrators/${adminId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to remove administrator');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/school/1/administrators'] });
      toast({
        title: language === 'fr' ? 'Administrateur supprimé' : 'Administrator Removed',
        description: language === 'fr' ? 'Administrateur supprimé avec succès.' : 'Administrator removed successfully.'
      });
    },
    onError: (error: any) => {
      console.error('[ADMIN_MANAGEMENT] ❌ Error removing administrator:', error);
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' ? 'Erreur lors de la suppression.' : 'Error removing administrator.',
        variant: 'destructive'
      });
    }
  });

  // Event Handlers
  const handleAddAdmin = () => {
    if (!newAdmin.teacherId || !newAdmin.adminLevel) {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' ? 'Veuillez sélectionner un enseignant et un niveau d\'accès.' : 'Please select a teacher and access level.',
        variant: 'destructive'
      });
      return;
    }
    addAdminMutation.mutate({
      teacherId: newAdmin.teacherId,
      adminLevel: newAdmin.adminLevel
    });
  };

  const handleEditPermissions = (admin: any) => {
    setSelectedAdmin(admin);
    setShowEditPermissionsModal(true);
  };

  const handleRemoveAdmin = (adminId: number) => {
    if (window.confirm(language === 'fr' ? 'Êtes-vous sûr de vouloir supprimer cet administrateur ?' : 'Are you sure you want to remove this administrator?')) {
      removeAdminMutation.mutate(adminId);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800'
    };
    return statusColors[status as keyof typeof statusColors] || statusColors.active;
  };

  const getRoleBadge = (role: string) => {
    const roleColors = {
      principalDirector: 'bg-purple-100 text-purple-800',
      deputyDirector: 'bg-blue-100 text-blue-800',
      academicCoordinator: 'bg-green-100 text-green-800',
      adminAssistant: 'bg-gray-100 text-gray-800'
    };
    return roleColors[role as keyof typeof roleColors] || roleColors.adminAssistant;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Card className="bg-white/80 backdrop-blur-md shadow-xl border border-white/30 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-3">
                <Shield className="w-6 h-6 text-blue-600" />
                {t.title || ''}
              </h2>
              <p className="text-gray-600 mt-1">{t.subtitle}</p>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={() => setShowAddAdminModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                {t.addAdmin}
              </Button>
            </div>
          </div>
        </Card>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6 bg-white border-gray-200">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">{t.totalAdmins}</p>
                <p className="text-2xl font-bold">{(Array.isArray(administrators) ? administrators.length : 0)}</p>
              </div>
            </div>
          </Card>
          <Card className="p-6 bg-white border-gray-200">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">{t.activeAdmins}</p>
                <p className="text-2xl font-bold">{(Array.isArray(administrators) ? administrators : []).filter(a => a.status === 'active').length}</p>
              </div>
            </div>
          </Card>
          <Card className="p-6 bg-white border-gray-200">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">{t.pendingInvites}</p>
                <p className="text-2xl font-bold">0</p>
              </div>
            </div>
          </Card>
          <Card className="p-6 bg-white border-gray-200">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Award className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">{t.roles}</p>
                <p className="text-2xl font-bold">4</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Administrators Table */}
        <Card className="bg-white border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="text-left p-4 font-semibold">{t.adminName}</th>
                  <th className="text-left p-4 font-semibold">{t.email || ''}</th>
                  <th className="text-left p-4 font-semibold">{t.role}</th>
                  <th className="text-left p-4 font-semibold">{t.permissions}</th>
                  <th className="text-left p-4 font-semibold">{t.status}</th>
                  <th className="text-left p-4 font-semibold">{t.actions}</th>
                </tr>
              </thead>
              <tbody>
                {(Array.isArray(administrators) ? administrators : []).map((admin) => (
                  <tr key={admin.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-blue-600" />
                        </div>
                        <span className="font-medium">{admin.teacherName || admin.name}</span>
                      </div>
                    </td>
                    <td className="p-4">{admin.teacherEmail || admin.email}</td>
                    <td className="p-4">
                      <Badge className={getRoleBadge(admin.adminLevel || admin.role)}>
                        {admin.adminLevel === 'assistant' ? (language === 'fr' ? 'Assistant' : 'Assistant') : 
                         admin.adminLevel === 'limited' ? (language === 'fr' ? 'Limité' : 'Limited') :
                         t[admin.role as keyof typeof t] || admin.adminLevel}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-1 flex-wrap">
                        {(admin.permissions || []).slice(0, 3).map((perm: string, index: number) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {perm.replace(/_/g, ' ')}
                          </Badge>
                        ))}
                        {(admin.permissions || []).length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{(admin.permissions || []).length - 3}
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge className={getStatusBadge(admin.isActive ? 'active' : 'inactive')}>
                        {admin.isActive ? t.active : t.inactive}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleEditPermissions(admin)}
                          data-testid={`button-edit-admin-${admin.id}`}
                          title={language === 'fr' ? 'Modifier permissions' : 'Edit permissions'}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleRemoveAdmin(admin.id)}
                          data-testid={`button-remove-admin-${admin.id}`}
                          title={language === 'fr' ? 'Supprimer administrateur' : 'Remove administrator'}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Add Administrator Modal */}
        <Dialog open={showAddAdminModal} onOpenChange={setShowAddAdminModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {language === 'fr' ? 'Ajouter Administrateur' : 'Add Administrator'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="teacher-select">
                  {language === 'fr' ? 'Sélectionner Enseignant' : 'Select Teacher'}
                </Label>
                <Select 
                  value={newAdmin.teacherId} 
                  onValueChange={(value) => setNewAdmin(prev => ({ ...prev, teacherId: value }))}
                >
                  <SelectTrigger id="teacher-select">
                    <SelectValue placeholder={language === 'fr' ? 'Choisir un enseignant' : 'Choose a teacher'} />
                  </SelectTrigger>
                  <SelectContent>
                    {(Array.isArray(availableTeachers) ? availableTeachers : []).map((teacher: any) => (
                      <SelectItem key={teacher.id} value={teacher?.id?.toString()}>
                        {teacher.firstName || ''} {teacher.lastName || ''} ({teacher.email || ''})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="admin-level">
                  {language === 'fr' ? 'Niveau d\'Accès' : 'Access Level'}
                </Label>
                <Select 
                  value={newAdmin.adminLevel} 
                  onValueChange={(value) => setNewAdmin(prev => ({ ...prev, adminLevel: value }))}
                >
                  <SelectTrigger id="admin-level">
                    <SelectValue placeholder={language === 'fr' ? 'Choisir niveau d\'accès' : 'Choose access level'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="assistant">
                      {language === 'fr' ? 'Assistant - Droits étendus' : 'Assistant - Extended rights'}
                    </SelectItem>
                    <SelectItem value="limited">
                      {language === 'fr' ? 'Limité - Droits restreints' : 'Limited - Restricted rights'}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={handleAddAdmin} 
                  disabled={addAdminMutation.isPending}
                  className="flex-1"
                  data-testid="button-confirm-add-admin"
                >
                  {addAdminMutation.isPending ? (
                    language === 'fr' ? 'Ajout...' : 'Adding...'
                  ) : (
                    language === 'fr' ? 'Ajouter' : 'Add'
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowAddAdminModal(false)}
                  className="flex-1"
                  data-testid="button-cancel-add-admin"
                >
                  {language === 'fr' ? 'Annuler' : 'Cancel'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Permissions Modal */}
        <Dialog open={showEditPermissionsModal} onOpenChange={setShowEditPermissionsModal}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {language === 'fr' ? 'Modifier Permissions' : 'Edit Permissions'}
                {selectedAdmin && ` - ${selectedAdmin.teacherName || selectedAdmin.name}`}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="max-h-64 overflow-y-auto space-y-3">
                {Object.entries(modulePermissions).map(([moduleKey, moduleInfo]: [string, any]) => (
                  <div key={moduleKey} className="border rounded-lg p-3">
                    <div className="font-medium mb-2">{moduleInfo.name || ''}</div>
                    <div className="space-y-2">
                      {moduleInfo.permissions.map((permission: string) => (
                        <div key={permission} className="flex items-center space-x-2">
                          <Checkbox
                            id={`${moduleKey}-${permission}`}
                            checked={selectedAdmin?.permissions?.includes(`${moduleKey}_${permission}`) || false}
                            onCheckedChange={(checked) => {
                              if (selectedAdmin) {
                                const updatedPermissions = checked 
                                  ? [...(selectedAdmin.permissions || []), `${moduleKey}_${permission}`]
                                  : (selectedAdmin.permissions || []).filter((p: string) => p !== `${moduleKey}_${permission}`);
                                setSelectedAdmin({
                                  ...selectedAdmin,
                                  permissions: updatedPermissions
                                });
                              }
                            }}
                          />
                          <Label htmlFor={`${moduleKey}-${permission}`} className="text-sm">
                            {permission.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={() => updatePermissionsMutation.mutate({
                    adminId: selectedAdmin?.id,
                    permissions: selectedAdmin?.permissions || []
                  })}
                  disabled={updatePermissionsMutation.isPending}
                  className="flex-1"
                  data-testid="button-save-permissions"
                >
                  {updatePermissionsMutation.isPending ? (
                    language === 'fr' ? 'Sauvegarde...' : 'Saving...'
                  ) : (
                    language === 'fr' ? 'Sauvegarder' : 'Save'
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowEditPermissionsModal(false)}
                  className="flex-1"
                  data-testid="button-cancel-edit"
                >
                  {language === 'fr' ? 'Annuler' : 'Cancel'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Loading Overlay */}
      {loadingAdmins && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center gap-3">
            <div className="animate-spin w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full"></div>
            <span>{language === 'fr' ? 'Chargement des administrateurs...' : 'Loading administrators...'}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdministratorManagement;