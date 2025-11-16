import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Shield, UserPlus, Users, CheckCircle, Clock, Award, Edit, Settings, User, Trash2, Mail, Phone, Loader2, AlertCircle } from 'lucide-react';
import DeleteConfirmationDialog from '@/components/ui/DeleteConfirmationDialog';

const AdministratorManagementFunctional: React.FC = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<any>(null);
  const [newAdminData, setNewAdminData] = useState({
    teacherId: '',
    adminLevel: 'assistant'
  });
  const [editPermissions, setEditPermissions] = useState<string[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState<{id: number, name: string} | null>(null);

  const text = {
    fr: {
      title: 'Administrateurs Délégués',
      subtitle: 'Déléguer des responsabilités administratives à des enseignants (Maximum 2)',
      description: 'Répartissez les tâches administratives pour vous concentrer sur la stratégie tout en maintenant un contrôle approprié.',
      addAdmin: 'Déléguer à un Enseignant',
      selectTeacher: 'Sélectionner Enseignant',
      selectLevel: 'Niveau de Délégation',
      assistant: 'Assistant - Gestion étendue (8 permissions)',
      limited: 'Limité - Gestion restreinte (3 permissions)',
      adminName: 'Enseignant Délégué',
      email: 'Email',
      level: 'Niveau de Délégation',
      permissions: 'Permissions Déléguées',
      actions: 'Actions',
      editPerms: 'Modifier Permissions',
      remove: 'Révoquer Délégation',
      active: 'Actif',
      save: 'Déléguer',
      cancel: 'Annuler',
      loading: 'Chargement...',
      noAdmins: 'Aucune délégation administrative configurée',
      maxReached: 'Maximum 2 délégations administratives autorisées',
      confirm: 'Êtes-vous sûr de vouloir révoquer cette délégation administrative ?',
      benefits: {
        director: 'Pour vous : Concentrez-vous sur la stratégie plutôt que les tâches opérationnelles',
        school: 'Pour l\'école : Continuité administrative même en votre absence',
        teachers: 'Pour les enseignants : Développement de compétences managériales',
        security: 'Sécurité : Permissions granulaires et traçabilité complète'
      }
    },
    en: {
      title: 'Delegate Administrators',
      subtitle: 'Delegate administrative responsibilities to teachers (Maximum 2)',
      description: 'Distribute administrative tasks to focus on strategy while maintaining appropriate control.',
      addAdmin: 'Delegate to Teacher',
      selectTeacher: 'Select Teacher',
      selectLevel: 'Delegation Level',
      assistant: 'Assistant - Extended management (8 permissions)',
      limited: 'Limited - Restricted management (3 permissions)',
      adminName: 'Delegated Teacher',
      email: 'Email',
      level: 'Delegation Level',
      permissions: 'Delegated Permissions',
      actions: 'Actions',
      editPerms: 'Edit Permissions',
      remove: 'Revoke Delegation',
      active: 'Active',
      save: 'Delegate',
      cancel: 'Cancel',
      loading: 'Loading...',
      noAdmins: 'No administrative delegation configured',
      maxReached: 'Maximum 2 administrative delegations allowed',
      confirm: 'Are you sure you want to revoke this administrative delegation?',
      benefits: {
        director: 'For you: Focus on strategy rather than operational tasks',
        school: 'For the school: Administrative continuity even in your absence',
        teachers: 'For teachers: Development of managerial skills',
        security: 'Security: Granular permissions and complete traceability'
      }
    }
  };

  const t = text[language as keyof typeof text];

  // Fetch administrators
  const { 
    data: administrators = [], 
    isLoading: loadingAdmins, 
    error: adminsError 
  } = useQuery({
    queryKey: ['/api/admin/delegates'],
    queryFn: async () => {
      console.log('[ADMIN_MANAGEMENT] 📡 Fetching administrators...');
      const response = await apiRequest('GET', '/api/admin/delegates');
      const data = await response.json();
      console.log('[ADMIN_MANAGEMENT] ✅ Administrators loaded:', data);
      return data.delegates || [];
    }
  });

  // Fetch available teachers
  const { 
    data: availableTeachers = [], 
    isLoading: loadingTeachers 
  } = useQuery({
    queryKey: ['/api/admin/available-teachers'],
    queryFn: async () => {
      console.log('[ADMIN_MANAGEMENT] 👨‍🏫 Fetching available teachers...');
      const response = await apiRequest('GET', '/api/admin/available-teachers');
      const data = await response.json();
      console.log('[ADMIN_MANAGEMENT] ✅ Teachers loaded:', data);
      return data.teachers || [];
    }
  });

  // Fetch permissions
  const { 
    data: allPermissions = [] 
  } = useQuery({
    queryKey: ['/api/permissions/modules'],
    queryFn: async () => {
      console.log('[ADMIN_MANAGEMENT] 🔐 Fetching permissions...');
      const response = await apiRequest('GET', '/api/permissions/modules');
      const data = await response.json();
      console.log('[ADMIN_MANAGEMENT] ✅ Permissions loaded:', data);
      return data;
    }
  });

  // Add administrator mutation
  const addAdminMutation = useMutation({
    mutationFn: async (adminData: { teacherId: string; adminLevel: string }) => {
      console.log('[ADMIN_MANAGEMENT] ➕ Adding administrator:', adminData);
      const response = await apiRequest('POST', '/api/admin/delegates', adminData);
      const result = await response.json();
      console.log('[ADMIN_MANAGEMENT] ✅ Administrator added:', result);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/school/1/administrators'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/available-teachers'] });
      toast({
        title: language === 'fr' ? 'Succès' : 'Success',
        description: language === 'fr' ? 'Administrateur ajouté avec succès' : 'Administrator added successfully'
      });
      setShowAddModal(false);
      setNewAdminData({ teacherId: '', adminLevel: 'assistant' });
    },
    onError: (error: any) => {
      console.error('[ADMIN_MANAGEMENT] ❌ Error adding administrator:', error);
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: error.message || (language === 'fr' ? 'Erreur lors de l\'ajout' : 'Error adding administrator'),
        variant: 'destructive'
      });
    }
  });

  // Update permissions mutation
  const updatePermissionsMutation = useMutation({
    mutationFn: async ({ adminId, permissions }: { adminId: number; permissions: string[] }) => {
      console.log('[ADMIN_MANAGEMENT] 🔄 Updating permissions:', { adminId, permissions });
      const response = await apiRequest('PATCH', `/api/admin/delegates/${adminId}`, { permissions });
      const result = await response.json();
      console.log('[ADMIN_MANAGEMENT] ✅ Permissions updated:', result);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/school/1/administrators'] });
      toast({
        title: language === 'fr' ? 'Succès' : 'Success',
        description: language === 'fr' ? 'Permissions mises à jour' : 'Permissions updated'
      });
      setShowEditModal(false);
      setSelectedAdmin(null);
    },
    onError: (error: any) => {
      console.error('[ADMIN_MANAGEMENT] ❌ Error updating permissions:', error);
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: error.message || (language === 'fr' ? 'Erreur lors de la modification' : 'Error updating permissions'),
        variant: 'destructive'
      });
    }
  });

  // Remove administrator mutation
  const removeAdminMutation = useMutation({
    mutationFn: async (adminId: number) => {
      console.log('[ADMIN_MANAGEMENT] 🗑️ Removing administrator:', adminId);
      const response = await apiRequest('DELETE', `/api/admin/delegates/${adminId}`);
      const result = await response.json();
      console.log('[ADMIN_MANAGEMENT] ✅ Administrator removed:', result);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/school/1/administrators'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/available-teachers'] });
      toast({
        title: language === 'fr' ? 'Succès' : 'Success',
        description: language === 'fr' ? 'Administrateur supprimé' : 'Administrator removed'
      });
    },
    onError: (error: any) => {
      console.error('[ADMIN_MANAGEMENT] ❌ Error removing administrator:', error);
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: error.message || (language === 'fr' ? 'Erreur lors de la suppression' : 'Error removing administrator'),
        variant: 'destructive'
      });
    }
  });

  // Event handlers
  const handleAddAdmin = () => {
    if (!newAdminData.teacherId || !newAdminData.adminLevel) {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' ? 'Veuillez sélectionner un enseignant et un niveau' : 'Please select a teacher and level',
        variant: 'destructive'
      });
      return;
    }

    addAdminMutation.mutate({
      teacherId: newAdminData.teacherId,
      adminLevel: newAdminData.adminLevel
    });
  };

  const handleEditPermissions = (admin: any) => {
    setSelectedAdmin(admin);
    setEditPermissions(admin.permissions || []);
    setShowEditModal(true);
  };

  const handleSavePermissions = () => {
    if (!selectedAdmin) return;
    
    updatePermissionsMutation.mutate({
      adminId: selectedAdmin.id,
      permissions: editPermissions
    });
  };

  const handleRemoveAdmin = (adminId: number, adminName: string) => {
    setAdminToDelete({ id: adminId, name: adminName });
    setDeleteDialogOpen(true);
  };

  const confirmRemoveAdmin = () => {
    if (adminToDelete) {
      removeAdminMutation.mutate(adminToDelete.id);
      setAdminToDelete(null);
    }
  };

  const togglePermission = (permission: string) => {
    setEditPermissions(prev => 
      prev.includes(permission) 
        ? (Array.isArray(prev) ? prev : []).filter(p => p !== permission)
        : [...prev, permission]
    );
  };

  // Show loading state
  if (loadingAdmins) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-white/80 backdrop-blur-md shadow-xl border border-white/30">
            <CardContent className="flex items-center justify-center p-12">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
                <p className="text-gray-600">{t.loading}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Show error state
  if (adminsError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-white/80 backdrop-blur-md shadow-xl border border-white/30">
            <CardContent className="flex items-center justify-center p-12">
              <div className="text-center">
                <AlertCircle className="h-8 w-8 mx-auto mb-4 text-red-600" />
                <p className="text-red-600">
                  {language === 'fr' ? 'Erreur de chargement des administrateurs' : 'Error loading administrators'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const canAddAdmin = (Array.isArray(administrators) ? administrators.length : 0) < 2;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header avec explication de la délégation */}
        <Card className="bg-white/80 backdrop-blur-md shadow-xl border border-white/30">
          <CardHeader>
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-white">
                  <Shield className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {t.title || ''}
                  </CardTitle>
                  <p className="text-gray-600 mt-1">{t.subtitle}</p>
                  <p className="text-sm text-gray-500 mt-1">{t.description}</p>
                </div>
              </div>
              
              <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
                <DialogTrigger asChild>
                  <Button 
                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                    disabled={!canAddAdmin || addAdminMutation.isPending}
                  >
                    {addAdminMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <UserPlus className="h-4 w-4 mr-2" />
                    )}
                    {t.addAdmin}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>{t.addAdmin}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>{t.selectTeacher}</Label>
                      <Select 
                        value={newAdminData.teacherId} 
                        onValueChange={(value) => setNewAdminData(prev => ({ ...prev, teacherId: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={t.selectTeacher} />
                        </SelectTrigger>
                        <SelectContent>
                          {(Array.isArray(availableTeachers) ? availableTeachers : []).map((teacher: any) => (
                            <SelectItem key={teacher.id} value={teacher?.id?.toString()}>
                              {teacher.firstName || ''} {teacher.lastName || ''}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label>{t.selectLevel}</Label>
                      <Select 
                        value={newAdminData.adminLevel} 
                        onValueChange={(value) => setNewAdminData(prev => ({ ...prev, adminLevel: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="assistant">{t.assistant}</SelectItem>
                          <SelectItem value="limited">{t.limited}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex gap-2 pt-4">
                      <Button 
                        onClick={handleAddAdmin}
                        className="flex-1"
                        disabled={addAdminMutation.isPending}
                      >
                        {addAdminMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : null}
                        {t.save}
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setShowAddModal(false)}
                        className="flex-1"
                      >
                        {t.cancel}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
        </Card>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-white/80 backdrop-blur-md shadow-xl border border-white/30">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Administrateurs</p>
                  <p className="text-2xl font-bold text-gray-900">{(Array.isArray(administrators) ? administrators.length : 0)}/2</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-md shadow-xl border border-white/30">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-100 rounded-xl">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Actifs</p>
                  <p className="text-2xl font-bold text-gray-900">{(Array.isArray(administrators) ? administrators : []).filter(a => a.isActive).length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-md shadow-xl border border-white/30">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-100 rounded-xl">
                  <Award className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Enseignants Disponibles</p>
                  <p className="text-2xl font-bold text-gray-900">{(Array.isArray(availableTeachers) ? availableTeachers.length : 0)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Administrators List */}
        <Card className="bg-white/80 backdrop-blur-md shadow-xl border border-white/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Administrateurs Configurés
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(Array.isArray(administrators) ? administrators.length : 0) === 0 ? (
              <div className="text-center py-12">
                <User className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">{t.noAdmins}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {(Array.isArray(administrators) ? administrators : []).map((admin: any) => (
                  <div key={admin.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{admin.teacherName}</h3>
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {admin.teacherEmail}
                        </p>
                        <div className="flex gap-2 mt-1">
                          <Badge variant={admin.adminLevel === 'assistant' ? 'default' : 'secondary'}>
                            {admin.adminLevel === 'assistant' ? t.assistant : t.limited}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {admin.permissions?.length || 0} permissions
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditPermissions(admin)}
                        disabled={updatePermissionsMutation.isPending}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleRemoveAdmin(admin.id, admin.teacherName)}
                        disabled={removeAdminMutation.isPending}
                      >
                        {removeAdminMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Permissions Modal */}
        <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {t.editPerms} - {selectedAdmin?.teacherName}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {(Array.isArray(allPermissions) ? allPermissions : []).map((permission: any) => (
                  <div key={permission.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={permission.id}
                      checked={editPermissions.includes(permission.id)}
                      onCheckedChange={() => togglePermission(permission.id)}
                    />
                    <Label htmlFor={permission.id} className="text-sm">
                      {permission.name || ''}
                    </Label>
                  </div>
                ))}
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={handleSavePermissions}
                  className="flex-1"
                  disabled={updatePermissionsMutation.isPending}
                >
                  {updatePermissionsMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  {t.save}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowEditModal(false)}
                  className="flex-1"
                >
                  {t.cancel}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Max Administrators Warning */}
        {!canAddAdmin && (
          <Card className="bg-amber-50/80 backdrop-blur-md shadow-xl border border-amber-200/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600" />
                <p className="text-amber-800">{t.maxReached}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Delete Confirmation Dialog */}
        <DeleteConfirmationDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={confirmRemoveAdmin}
          title={language === 'fr' ? 'Révoquer la délégation' : 'Revoke Delegation'}
          description={language === 'fr' 
            ? `Êtes-vous sûr de vouloir révoquer la délégation administrative de "${adminToDelete?.name}" ? Cet enseignant perdra tous les accès administratifs.`
            : `Are you sure you want to revoke the administrative delegation of "${adminToDelete?.name}"? This teacher will lose all administrative access.`}
          confirmText={language === 'fr' ? 'Révoquer' : 'Revoke'}
          cancelText={language === 'fr' ? 'Annuler' : 'Cancel'}
        />
      </div>
    </div>
  );
};

export default AdministratorManagementFunctional;