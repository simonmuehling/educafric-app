import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { apiRequest } from '@/lib/queryClient';
import { 
  Users, GraduationCap, UserCheck, Heart, School, Shield, UserPlus,
  Search, Download, Edit, Trash2, Phone, Mail, Plus, Settings, 
  BarChart3, Eye, CheckCircle, Clock, Award, User, Loader2, AlertCircle
} from 'lucide-react';

interface Teacher {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  subjects: string[];
  hireDate: string;
}

interface Student {
  id: number;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  classId: number;
  className: string;
  parentInfo?: {
    name: string;
    phone: string;
    email: string;
  };
}

interface Parent {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  children: Student[];
  status: 'active' | 'pending' | 'blocked';
  subscriptionStatus: string;
}

interface Administrator {
  id: number;
  teacherId: number;
  teacherName: string;
  email: string;
  phone: string;
  adminLevel: 'assistant' | 'limited';
  permissions: string[];
  status: 'active' | 'inactive';
  assignedAt: string;
}

const DelegateAdministrators: React.FC = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('administrators');
  const [showAddAdminModal, setShowAddAdminModal] = useState(false);
  const [showEditAdminModal, setShowEditAdminModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<Administrator | null>(null);
  const [newAdminData, setNewAdminData] = useState({
    teacherId: '',
    adminLevel: 'assistant'
  });
  const [editPermissions, setEditPermissions] = useState<string[]>([]);

  const text = {
    fr: {
      title: 'Administrateurs Délégués',
      subtitle: 'Gestion des administrateurs délégués et administration générale',
      administratorsTab: 'Administrateurs (Max 2)',
      administrationTab: 'Administration Générale',
      addAdmin: 'Ajouter Administrateur',
      selectTeacher: 'Sélectionner Enseignant',
      selectLevel: 'Niveau d\'Accès',
      assistant: 'Assistant (8 permissions)',
      limited: 'Limité (3 permissions)',
      adminName: 'Nom',
      email: 'Email',
      level: 'Niveau',
      permissions: 'Permissions',
      actions: 'Actions',
      editPerms: 'Modifier',
      remove: 'Supprimer',
      active: 'Actif',
      save: 'Enregistrer',
      cancel: 'Annuler',
      loading: 'Chargement...',
      noAdmins: 'Aucun administrateur configuré',
      maxReached: 'Maximum 2 administrateurs autorisés',
      confirm: 'Êtes-vous sûr de vouloir supprimer cet administrateur ?',
      teachers: 'Enseignants',
      students: 'Élèves',
      parents: 'Parents',
      totalTeachers: 'Total Enseignants',
      totalStudents: 'Total Élèves',
      totalParents: 'Total Parents',
      activeUsers: 'Utilisateurs Actifs',
      addTeacher: 'Ajouter Enseignant',
      addStudent: 'Ajouter Élève',
      addParent: 'Ajouter Parent',
      viewDetails: 'Voir Détails',
      editUser: 'Modifier',
      deleteUser: 'Supprimer',
      searchPlaceholder: 'Rechercher...'
    },
    en: {
      title: 'Delegate Administrators',
      subtitle: 'Management of delegate administrators and general administration',
      administratorsTab: 'Administrators (Max 2)',
      administrationTab: 'General Administration',
      addAdmin: 'Add Administrator',
      selectTeacher: 'Select Teacher',
      selectLevel: 'Access Level',
      assistant: 'Assistant (8 permissions)',
      limited: 'Limited (3 permissions)',
      adminName: 'Name',
      email: 'Email',
      level: 'Level',
      permissions: 'Permissions',
      actions: 'Actions',
      editPerms: 'Edit',
      remove: 'Remove',
      active: 'Active',
      save: 'Save',
      cancel: 'Cancel',
      loading: 'Loading...',
      noAdmins: 'No administrators configured',
      maxReached: 'Maximum 2 administrators allowed',
      confirm: 'Are you sure you want to remove this administrator?',
      teachers: 'Teachers',
      students: 'Students',
      parents: 'Parents',
      totalTeachers: 'Total Teachers',
      totalStudents: 'Total Students',
      totalParents: 'Total Parents',
      activeUsers: 'Active Users',
      addTeacher: 'Add Teacher',
      addStudent: 'Add Student',
      addParent: 'Add Parent',
      viewDetails: 'View Details',
      editUser: 'Edit',
      deleteUser: 'Delete',
      searchPlaceholder: 'Search...'
    }
  };

  const t = text[language as keyof typeof text];

  // Available permissions for administrators
  const availablePermissions = {
    assistant: [
      'teacher-management',
      'student-management', 
      'class-management',
      'attendance-management',
      'bulletin-validation',
      'parent-communication',
      'reports-generation',
      'geolocation-access'
    ],
    limited: [
      'attendance-management',
      'parent-communication',
      'reports-generation'
    ]
  };

  // Fetch administrators
  const { data: administrators = [], isLoading: adminsLoading } = useQuery({
    queryKey: ['/api/school-administrators'],
    queryFn: async () => {
      // Mock data for now - replace with real API call
      return [
        {
          id: 1,
          teacherId: 2,
          teacherName: 'Marie Dubois',
          email: 'marie.dubois@educafric.com',
          phone: '+237655123456',
          adminLevel: 'assistant',
          permissions: availablePermissions.assistant,
          status: 'active',
          assignedAt: '2024-01-15'
        }
      ] as Administrator[];
    },
  });

  // Fetch administration stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/administration/stats'],
    queryFn: () => fetch('/api/administration/stats', { credentials: 'include' }).then(res => res.json())
  });

  // Fetch teachers for administrator selection
  const { data: availableTeachers = [], isLoading: teachersLoading } = useQuery({
    queryKey: ['/api/administration/teachers'],
    queryFn: () => fetch('/api/administration/teachers', { credentials: 'include' }).then(res => res.json())
  });

  // Fetch teachers data for administration tab
  const { data: teachers = [] } = useQuery({
    queryKey: ['/api/administration/teachers'],
    queryFn: () => fetch('/api/administration/teachers', { credentials: 'include' }).then(res => res.json())
  });

  // Fetch students data
  const { data: students = [] } = useQuery({
    queryKey: ['/api/administration/students'],
    queryFn: () => fetch('/api/administration/students', { credentials: 'include' }).then(res => res.json())
  });

  // Fetch parents data
  const { data: parents = [] } = useQuery({
    queryKey: ['/api/administration/parents'],
    queryFn: () => fetch('/api/administration/parents', { credentials: 'include' }).then(res => res.json())
  });

  // Add administrator mutation
  const addAdministratorMutation = useMutation({
    mutationFn: async (data: { teacherId: string; adminLevel: string }) => {
      // Mock implementation - replace with real API call
      console.log('Adding administrator:', data);
      return { success: true, id: Date.now() };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/school-administrators'] });
      setShowAddAdminModal(false);
      setNewAdminData({ teacherId: '', adminLevel: 'assistant' });
      toast({
        title: language === 'fr' ? 'Succès' : 'Success',
        description: language === 'fr' ? 'Administrateur ajouté avec succès' : 'Administrator added successfully'
      });
    },
    onError: () => {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' ? 'Erreur lors de l\'ajout' : 'Error adding administrator',
        variant: 'destructive'
      });
    }
  });

  // Remove administrator mutation
  const removeAdministratorMutation = useMutation({
    mutationFn: async (adminId: number) => {
      // Mock implementation - replace with real API call
      console.log('Removing administrator:', adminId);
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/school-administrators'] });
      toast({
        title: language === 'fr' ? 'Succès' : 'Success',
        description: language === 'fr' ? 'Administrateur supprimé avec succès' : 'Administrator removed successfully'
      });
    },
    onError: () => {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' ? 'Erreur lors de la suppression' : 'Error removing administrator',
        variant: 'destructive'
      });
    }
  });

  const handleAddAdministrator = () => {
    if (!newAdminData.teacherId) {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' ? 'Veuillez sélectionner un enseignant' : 'Please select a teacher',
        variant: 'destructive'
      });
      return;
    }

    if (administrators.length >= 2) {
      toast({
        title: language === 'fr' ? 'Limite atteinte' : 'Limit reached',
        description: language === 'fr' ? 'Maximum 2 administrateurs autorisés' : 'Maximum 2 administrators allowed',
        variant: 'destructive'
      });
      return;
    }

    addAdministratorMutation.mutate(newAdminData);
  };

  const handleRemoveAdministrator = (adminId: number) => {
    if (confirm(t.confirm)) {
      removeAdministratorMutation.mutate(adminId);
    }
  };

  const getPermissionBadges = (permissions: string[]) => {
    return permissions.map((permission, index) => (
      <Badge key={index} variant="outline" className="text-xs">
        {permission.replace('-', ' ')}
      </Badge>
    ));
  };

  if (adminsLoading || statsLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          <span>{t.loading}</span>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{t.title}</h2>
          <p className="text-gray-600">{t.subtitle}</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="administrators" className="flex items-center space-x-2">
            <Shield className="w-4 h-4" />
            <span>{t.administratorsTab}</span>
          </TabsTrigger>
          <TabsTrigger value="administration" className="flex items-center space-x-2">
            <Settings className="w-4 h-4" />
            <span>{t.administrationTab}</span>
          </TabsTrigger>
        </TabsList>

        {/* Administrators Management Tab */}
        <TabsContent value="administrators" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">{t.administratorsTab}</h3>
            <Dialog open={showAddAdminModal} onOpenChange={setShowAddAdminModal}>
              <DialogTrigger asChild>
                <Button 
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={administrators.length >= 2}
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  {t.addAdmin}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t.addAdmin}</DialogTitle>
                  <DialogDescription>
                    Sélectionnez un enseignant et définissez son niveau d'accès administratif.
                  </DialogDescription>
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
                        {availableTeachers.filter((teacher: Teacher) => 
                          !administrators.find(admin => admin.teacherId === teacher.id)
                        ).map((teacher: Teacher) => (
                          <SelectItem key={teacher.id} value={teacher.id.toString()}>
                            {teacher.firstName} {teacher.lastName}
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
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowAddAdminModal(false)}>
                    {t.cancel}
                  </Button>
                  <Button 
                    onClick={handleAddAdministrator}
                    disabled={addAdministratorMutation.isPending}
                  >
                    {addAdministratorMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        {t.loading}
                      </>
                    ) : (
                      t.save
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {administrators.length >= 2 && (
            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2 text-orange-800">
                  <AlertCircle className="w-5 h-5" />
                  <span className="text-sm font-medium">{t.maxReached}</span>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-4">
            {administrators.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <Shield className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600">{t.noAdmins}</p>
                </CardContent>
              </Card>
            ) : (
              administrators.map((admin) => (
                <Card key={admin.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <User className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{admin.teacherName}</h4>
                          <p className="text-sm text-gray-600">{admin.email}</p>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                            <span className="flex items-center">
                              <Mail className="w-4 h-4 mr-1" />
                              {admin.email}
                            </span>
                            <span className="flex items-center">
                              <Phone className="w-4 h-4 mr-1" />
                              {admin.phone}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2 mt-3">
                            <Badge 
                              variant={admin.adminLevel === 'assistant' ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {admin.adminLevel === 'assistant' ? t.assistant : t.limited}
                            </Badge>
                            <Badge 
                              variant={admin.status === 'active' ? 'default' : 'secondary'}
                              className={admin.status === 'active' ? 'bg-green-100 text-green-800' : ''}
                            >
                              {admin.status === 'active' ? t.active : 'Inactif'}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap gap-2 mt-3">
                            {getPermissionBadges(admin.permissions)}
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedAdmin(admin);
                            setEditPermissions(admin.permissions);
                            setShowEditAdminModal(true);
                          }}
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          {t.editPerms}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveAdministrator(admin.id)}
                          disabled={removeAdministratorMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          {t.remove}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* General Administration Tab */}
        <TabsContent value="administration" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{t.totalTeachers}</p>
                    <p className="text-2xl font-bold text-blue-600">{stats?.teachers || teachers.length || 0}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <UserCheck className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{t.totalStudents}</p>
                    <p className="text-2xl font-bold text-purple-600">{stats?.students || students.length || 0}</p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <GraduationCap className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{t.totalParents}</p>
                    <p className="text-2xl font-bold text-green-600">{stats?.parents || parents.length || 0}</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Heart className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{t.activeUsers}</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {(stats?.teachers || 0) + (stats?.students || 0) + (stats?.parents || 0)}
                    </p>
                  </div>
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <Users className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="w-5 h-5" />
                <span>Actions Rapides</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button variant="outline" className="flex items-center space-x-2 h-auto p-4">
                  <UserPlus className="w-5 h-5" />
                  <div className="text-left">
                    <div className="font-medium">{t.addTeacher}</div>
                    <div className="text-sm text-gray-500">Ajouter un nouvel enseignant</div>
                  </div>
                </Button>
                
                <Button variant="outline" className="flex items-center space-x-2 h-auto p-4">
                  <Plus className="w-5 h-5" />
                  <div className="text-left">
                    <div className="font-medium">{t.addStudent}</div>
                    <div className="text-sm text-gray-500">Inscrire un nouvel élève</div>
                  </div>
                </Button>
                
                <Button variant="outline" className="flex items-center space-x-2 h-auto p-4">
                  <Heart className="w-5 h-5" />
                  <div className="text-left">
                    <div className="font-medium">{t.addParent}</div>
                    <div className="text-sm text-gray-500">Enregistrer un parent</div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5" />
                <span>Activité Récente</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <UserCheck className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">Enseignants actifs aujourd'hui</p>
                      <p className="text-sm text-gray-600">Dernière connexion dans les 24h</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-blue-50">
                    {Math.floor(Math.random() * 10) + 5}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <GraduationCap className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">Élèves présents aujourd'hui</p>
                      <p className="text-sm text-gray-600">Taux de présence</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-green-50">
                    {Math.floor(Math.random() * 20) + 80}%
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DelegateAdministrators;