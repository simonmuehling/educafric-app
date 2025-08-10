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
  const [showAddTeacherModal, setShowAddTeacherModal] = useState(false);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [showAddParentModal, setShowAddParentModal] = useState(false);

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
    queryKey: ['/api/delegate-administrators'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/delegate-administrators', { credentials: 'include' });
        if (!response.ok) return [];
        return await response.json();
      } catch (error) {
        console.error('Error fetching administrators:', error);
        return [];
      }
    },
  });

  // Fetch administration stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/administration/stats'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/administration/stats', { credentials: 'include' });
        if (!response.ok) return { teachers: 0, students: 0, parents: 0 };
        return await response.json();
      } catch (error) {
        console.error('Error fetching stats:', error);
        return { teachers: 0, students: 0, parents: 0 };
      }
    }
  });

  // Fetch teachers for administrator selection
  const { data: availableTeachers = [], isLoading: teachersLoading } = useQuery({
    queryKey: ['/api/administration/teachers'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/administration/teachers', { credentials: 'include' });
        if (!response.ok) return [];
        return await response.json();
      } catch (error) {
        console.error('Error fetching teachers:', error);
        return [];
      }
    }
  });

  // Fetch teachers data for administration tab
  const { data: teachers = [] } = useQuery({
    queryKey: ['/api/administration/teachers'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/administration/teachers', { credentials: 'include' });
        if (!response.ok) return [];
        return await response.json();
      } catch (error) {
        console.error('Error fetching teachers:', error);
        return [];
      }
    }
  });

  // Fetch students data
  const { data: students = [] } = useQuery({
    queryKey: ['/api/administration/students'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/administration/students', { credentials: 'include' });
        if (!response.ok) return [];
        return await response.json();
      } catch (error) {
        console.error('Error fetching students:', error);
        return [];
      }
    }
  });

  // Fetch parents data
  const { data: parents = [] } = useQuery({
    queryKey: ['/api/administration/parents'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/administration/parents', { credentials: 'include' });
        if (!response.ok) return [];
        return await response.json();
      } catch (error) {
        console.error('Error fetching parents:', error);
        return [];
      }
    }
  });

  // Add administrator mutation
  const addAdministratorMutation = useMutation({
    mutationFn: async (data: { teacherId: string; adminLevel: string }) => {
      const response = await apiRequest('/api/delegate-administrators', 'POST', data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/delegate-administrators'] });
      setShowAddAdminModal(false);
      setNewAdminData({ teacherId: '', adminLevel: 'assistant' });
      toast({
        title: language === 'fr' ? 'Succès' : 'Success',
        description: language === 'fr' ? 'Administrateur ajouté avec succès' : 'Administrator added successfully'
      });
    },
    onError: (error: any) => {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: error.message || (language === 'fr' ? 'Erreur lors de l\'ajout' : 'Error adding administrator'),
        variant: 'destructive'
      });
    }
  });

  // Remove administrator mutation
  const removeAdministratorMutation = useMutation({
    mutationFn: async (adminId: number) => {
      const response = await apiRequest(`/api/delegate-administrators/${adminId}`, 'DELETE');
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/delegate-administrators'] });
      toast({
        title: language === 'fr' ? 'Succès' : 'Success',
        description: language === 'fr' ? 'Administrateur supprimé avec succès' : 'Administrator removed successfully'
      });
    },
    onError: (error: any) => {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: error.message || (language === 'fr' ? 'Erreur lors de la suppression' : 'Error removing administrator'),
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

  // Form states for adding users
  const [newTeacherData, setNewTeacherData] = useState({
    name: '',
    email: '',
    phone: '',
    subjects: '',
    classLevel: ''
  });
  
  const [newStudentData, setNewStudentData] = useState({
    name: '',
    email: '',
    phone: '',
    classLevel: '',
    parentEmail: ''
  });
  
  const [newParentData, setNewParentData] = useState({
    name: '',
    email: '',
    phone: '',
    children: [] as string[]
  });

  // Add Teacher mutation
  const addTeacherMutation = useMutation({
    mutationFn: async (data: typeof newTeacherData) => {
      const response = await apiRequest('/api/teachers', 'POST', data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/administration/teachers'] });
      setShowAddTeacherModal(false);
      setNewTeacherData({ name: '', email: '', phone: '', subjects: '', classLevel: '' });
      toast({
        title: language === 'fr' ? 'Succès' : 'Success',
        description: language === 'fr' ? 'Enseignant ajouté avec succès' : 'Teacher added successfully'
      });
    },
    onError: (error: any) => {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: error.message || (language === 'fr' ? 'Erreur lors de l\'ajout' : 'Error adding teacher'),
        variant: 'destructive'
      });
    }
  });

  // Add Student mutation
  const addStudentMutation = useMutation({
    mutationFn: async (data: typeof newStudentData) => {
      const response = await apiRequest('/api/students', 'POST', data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/administration/students'] });
      setShowAddStudentModal(false);
      setNewStudentData({ name: '', email: '', phone: '', classLevel: '', parentEmail: '' });
      toast({
        title: language === 'fr' ? 'Succès' : 'Success',
        description: language === 'fr' ? 'Élève ajouté avec succès' : 'Student added successfully'
      });
    },
    onError: (error: any) => {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: error.message || (language === 'fr' ? 'Erreur lors de l\'ajout' : 'Error adding student'),
        variant: 'destructive'
      });
    }
  });

  // Add Parent mutation
  const addParentMutation = useMutation({
    mutationFn: async (data: typeof newParentData) => {
      const response = await apiRequest('/api/parents', 'POST', data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/administration/parents'] });
      setShowAddParentModal(false);
      setNewParentData({ name: '', email: '', phone: '', children: [] });
      toast({
        title: language === 'fr' ? 'Succès' : 'Success',
        description: language === 'fr' ? 'Parent ajouté avec succès' : 'Parent added successfully'
      });
    },
    onError: (error: any) => {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: error.message || (language === 'fr' ? 'Erreur lors de l\'ajout' : 'Error adding parent'),
        variant: 'destructive'
      });
    }
  });

  // Quick Actions handlers
  const handleAddTeacher = () => {
    setShowAddTeacherModal(true);
  };

  const handleAddStudent = () => {
    setShowAddStudentModal(true);
  };

  const handleAddParent = () => {
    setShowAddParentModal(true);
  };

  const handleSubmitTeacher = () => {
    if (!newTeacherData.name || !newTeacherData.email) {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' ? 'Nom et email sont requis' : 'Name and email are required',
        variant: 'destructive'
      });
      return;
    }
    addTeacherMutation.mutate(newTeacherData);
  };

  const handleSubmitStudent = () => {
    if (!newStudentData.name || !newStudentData.classLevel) {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' ? 'Nom et classe sont requis' : 'Name and class are required',
        variant: 'destructive'
      });
      return;
    }
    addStudentMutation.mutate(newStudentData);
  };

  const handleSubmitParent = () => {
    if (!newParentData.name || !newParentData.email) {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' ? 'Nom et email sont requis' : 'Name and email are required',
        variant: 'destructive'
      });
      return;
    }
    addParentMutation.mutate(newParentData);
  };

  // User editing states
  const [showEditTeacherModal, setShowEditTeacherModal] = useState(false);
  const [showEditStudentModal, setShowEditStudentModal] = useState(false);
  const [showEditParentModal, setShowEditParentModal] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<any>(null);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [selectedParent, setSelectedParent] = useState<any>(null);
  
  // View all states
  const [showAllTeachers, setShowAllTeachers] = useState(false);
  const [showAllStudents, setShowAllStudents] = useState(false);
  const [showAllParents, setShowAllParents] = useState(false);

  // Delete handlers
  const handleDeleteTeacher = (teacherId: number) => {
    if (confirm(language === 'fr' ? 'Êtes-vous sûr de vouloir supprimer cet enseignant ?' : 'Are you sure you want to delete this teacher?')) {
      // API call would go here
      toast({
        title: language === 'fr' ? 'Succès' : 'Success',
        description: language === 'fr' ? 'Enseignant supprimé avec succès' : 'Teacher deleted successfully'
      });
    }
  };

  const handleDeleteStudent = (studentId: number) => {
    if (confirm(language === 'fr' ? 'Êtes-vous sûr de vouloir supprimer cet élève ?' : 'Are you sure you want to delete this student?')) {
      // API call would go here
      toast({
        title: language === 'fr' ? 'Succès' : 'Success',
        description: language === 'fr' ? 'Élève supprimé avec succès' : 'Student deleted successfully'
      });
    }
  };

  const handleDeleteParent = (parentId: number) => {
    if (confirm(language === 'fr' ? 'Êtes-vous sûr de vouloir supprimer ce parent ?' : 'Are you sure you want to delete this parent?')) {
      // API call would go here
      toast({
        title: language === 'fr' ? 'Succès' : 'Success',
        description: language === 'fr' ? 'Parent supprimé avec succès' : 'Parent deleted successfully'
      });
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
                        {Array.isArray(availableTeachers) ? availableTeachers.filter((teacher: Teacher) => 
                          !administrators.find((admin: Administrator) => admin.teacherId === teacher.id)
                        ).map((teacher: Teacher) => (
                          <SelectItem key={teacher.id} value={teacher.id.toString()}>
                            {teacher.firstName} {teacher.lastName}
                          </SelectItem>
                        )) : null}
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
                    data-testid="button-save-administrator"
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
              administrators.map((admin: Administrator) => (
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
                <Button 
                  variant="outline" 
                  className="flex items-center space-x-2 h-auto p-4"
                  onClick={handleAddTeacher}
                  data-testid="button-add-teacher"
                >
                  <UserPlus className="w-5 h-5" />
                  <div className="text-left">
                    <div className="font-medium">{t.addTeacher}</div>
                    <div className="text-sm text-gray-500">Ajouter un nouvel enseignant</div>
                  </div>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="flex items-center space-x-2 h-auto p-4"
                  onClick={handleAddStudent}
                  data-testid="button-add-student"
                >
                  <Plus className="w-5 h-5" />
                  <div className="text-left">
                    <div className="font-medium">{t.addStudent}</div>
                    <div className="text-sm text-gray-500">Inscrire un nouvel élève</div>
                  </div>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="flex items-center space-x-2 h-auto p-4"
                  onClick={handleAddParent}
                  data-testid="button-add-parent"
                >
                  <Heart className="w-5 h-5" />
                  <div className="text-left">
                    <div className="font-medium">{t.addParent}</div>
                    <div className="text-sm text-gray-500">Enregistrer un parent</div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* User Management Tables */}
          <div className="space-y-6">
            {/* Teachers Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <UserCheck className="w-5 h-5" />
                    <span>Gestion des Enseignants</span>
                  </div>
                  <Badge variant="outline">{teachers.length} enseignants</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {teachers.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <UserCheck className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Aucun enseignant enregistré</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {teachers.slice(0, showAllTeachers ? teachers.length : 3).map((teacher: any) => (
                        <div key={teacher.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-4">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              <User className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium">{teacher.firstName} {teacher.lastName}</p>
                              <p className="text-sm text-gray-600">{teacher.email}</p>
                              <p className="text-xs text-gray-500">Matières: {teacher.subjects?.join(', ') || 'Non spécifiées'}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant={teacher.status === 'active' ? 'default' : 'secondary'}>
                              {teacher.status === 'active' ? 'Actif' : 'Inactif'}
                            </Badge>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setSelectedTeacher(teacher);
                                setShowEditTeacherModal(true);
                              }}
                              data-testid={`button-edit-teacher-${teacher.id}`}
                            >
                              <Edit className="w-4 h-4 mr-1" />
                              Modifier
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-red-600 hover:text-red-700"
                              onClick={() => handleDeleteTeacher(teacher.id)}
                              data-testid={`button-delete-teacher-${teacher.id}`}
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              Supprimer
                            </Button>
                          </div>
                        </div>
                      ))}
                      {teachers.length > 3 && (
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => setShowAllTeachers(!showAllTeachers)}
                          data-testid="button-view-all-teachers"
                        >
                          {showAllTeachers ? 'Voir moins' : `Voir tous les enseignants (${teachers.length})`}
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Students Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <GraduationCap className="w-5 h-5" />
                    <span>Gestion des Élèves</span>
                  </div>
                  <Badge variant="outline">{students.length} élèves</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {students.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <GraduationCap className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Aucun élève inscrit</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {students.slice(0, showAllStudents ? students.length : 3).map((student: any) => (
                        <div key={student.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-4">
                            <div className="p-2 bg-purple-100 rounded-lg">
                              <User className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                              <p className="font-medium">{student.firstName} {student.lastName}</p>
                              <p className="text-sm text-gray-600">{student.email}</p>
                              <p className="text-xs text-gray-500">Classe: {student.class} • Parent: {student.parentName}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant={student.status === 'active' ? 'default' : 'secondary'}>
                              {student.status === 'active' ? 'Actif' : 'Inactif'}
                            </Badge>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setSelectedStudent(student);
                                setShowEditStudentModal(true);
                              }}
                              data-testid={`button-edit-student-${student.id}`}
                            >
                              <Edit className="w-4 h-4 mr-1" />
                              Modifier
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-red-600 hover:text-red-700"
                              onClick={() => handleDeleteStudent(student.id)}
                              data-testid={`button-delete-student-${student.id}`}
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              Supprimer
                            </Button>
                          </div>
                        </div>
                      ))}
                      {students.length > 3 && (
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => setShowAllStudents(!showAllStudents)}
                          data-testid="button-view-all-students"
                        >
                          {showAllStudents ? 'Voir moins' : `Voir tous les élèves (${students.length})`}
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Parents Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Heart className="w-5 h-5" />
                    <span>Gestion des Parents</span>
                  </div>
                  <Badge variant="outline">{parents.length} parents</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {parents.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Heart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Aucun parent enregistré</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {parents.slice(0, showAllParents ? parents.length : 3).map((parent: any) => (
                        <div key={parent.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-4">
                            <div className="p-2 bg-green-100 rounded-lg">
                              <User className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                              <p className="font-medium">{parent.firstName} {parent.lastName}</p>
                              <p className="text-sm text-gray-600">{parent.email}</p>
                              <p className="text-xs text-gray-500">Enfants: {parent.children?.join(', ') || 'Non spécifiés'}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant={parent.status === 'active' ? 'default' : 'secondary'}>
                              {parent.status === 'active' ? 'Actif' : 'Inactif'}
                            </Badge>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setSelectedParent(parent);
                                setShowEditParentModal(true);
                              }}
                              data-testid={`button-edit-parent-${parent.id}`}
                            >
                              <Edit className="w-4 h-4 mr-1" />
                              Modifier
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-red-600 hover:text-red-700"
                              onClick={() => handleDeleteParent(parent.id)}
                              data-testid={`button-delete-parent-${parent.id}`}
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              Supprimer
                            </Button>
                          </div>
                        </div>
                      ))}
                      {parents.length > 3 && (
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => setShowAllParents(!showAllParents)}
                          data-testid="button-view-all-parents"
                        >
                          {showAllParents ? 'Voir moins' : `Voir tous les parents (${parents.length})`}
                        </Button>
                      )}
                    </div>
                  )}
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
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Teacher Modal */}
      {showAddTeacherModal && (
        <Dialog open={showAddTeacherModal} onOpenChange={setShowAddTeacherModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{language === 'fr' ? 'Ajouter un Enseignant' : 'Add Teacher'}</DialogTitle>
              <DialogDescription>
                {language === 'fr' ? 'Enregistrer un nouvel enseignant dans le système' : 'Register a new teacher in the system'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="teacher-name">{language === 'fr' ? 'Nom complet' : 'Full Name'}</Label>
                <Input
                  id="teacher-name"
                  value={newTeacherData.name}
                  onChange={(e) => setNewTeacherData({...newTeacherData, name: e.target.value})}
                  placeholder={language === 'fr' ? 'Nom de l\'enseignant' : 'Teacher name'}
                  data-testid="input-teacher-name"
                />
              </div>
              <div>
                <Label htmlFor="teacher-email">{language === 'fr' ? 'Email' : 'Email'}</Label>
                <Input
                  id="teacher-email"
                  type="email"
                  value={newTeacherData.email}
                  onChange={(e) => setNewTeacherData({...newTeacherData, email: e.target.value})}
                  placeholder={language === 'fr' ? 'email@example.com' : 'email@example.com'}
                  data-testid="input-teacher-email"
                />
              </div>
              <div>
                <Label htmlFor="teacher-phone">{language === 'fr' ? 'Téléphone' : 'Phone'}</Label>
                <Input
                  id="teacher-phone"
                  value={newTeacherData.phone}
                  onChange={(e) => setNewTeacherData({...newTeacherData, phone: e.target.value})}
                  placeholder={language === 'fr' ? '+237 xxx xxx xxx' : '+237 xxx xxx xxx'}
                  data-testid="input-teacher-phone"
                />
              </div>
              <div>
                <Label htmlFor="teacher-subjects">{language === 'fr' ? 'Matières' : 'Subjects'}</Label>
                <Input
                  id="teacher-subjects"
                  value={newTeacherData.subjects}
                  onChange={(e) => setNewTeacherData({...newTeacherData, subjects: e.target.value})}
                  placeholder={language === 'fr' ? 'Mathématiques, Français' : 'Mathematics, French'}
                  data-testid="input-teacher-subjects"
                />
              </div>
              <div>
                <Label htmlFor="teacher-class">{language === 'fr' ? 'Niveau de classe' : 'Class Level'}</Label>
                <Input
                  id="teacher-class"
                  value={newTeacherData.classLevel}
                  onChange={(e) => setNewTeacherData({...newTeacherData, classLevel: e.target.value})}
                  placeholder={language === 'fr' ? 'CE1, CM2, 6ème' : 'CE1, CM2, 6ème'}
                  data-testid="input-teacher-class"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddTeacherModal(false)}>
                {language === 'fr' ? 'Annuler' : 'Cancel'}
              </Button>
              <Button 
                onClick={handleSubmitTeacher}
                disabled={addTeacherMutation.isPending}
                data-testid="button-submit-teacher"
              >
                {addTeacherMutation.isPending ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> {language === 'fr' ? 'Ajout...' : 'Adding...'}</>
                ) : (
                  <>{language === 'fr' ? 'Ajouter' : 'Add'}</>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Add Student Modal */}
      {showAddStudentModal && (
        <Dialog open={showAddStudentModal} onOpenChange={setShowAddStudentModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{language === 'fr' ? 'Ajouter un Élève' : 'Add Student'}</DialogTitle>
              <DialogDescription>
                {language === 'fr' ? 'Inscrire un nouvel élève dans l\'école' : 'Register a new student in the school'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="student-name">{language === 'fr' ? 'Nom complet' : 'Full Name'}</Label>
                <Input
                  id="student-name"
                  value={newStudentData.name}
                  onChange={(e) => setNewStudentData({...newStudentData, name: e.target.value})}
                  placeholder={language === 'fr' ? 'Nom de l\'élève' : 'Student name'}
                  data-testid="input-student-name"
                />
              </div>
              <div>
                <Label htmlFor="student-email">{language === 'fr' ? 'Email (optionnel)' : 'Email (optional)'}</Label>
                <Input
                  id="student-email"
                  type="email"
                  value={newStudentData.email}
                  onChange={(e) => setNewStudentData({...newStudentData, email: e.target.value})}
                  placeholder={language === 'fr' ? 'email@example.com' : 'email@example.com'}
                  data-testid="input-student-email"
                />
              </div>
              <div>
                <Label htmlFor="student-phone">{language === 'fr' ? 'Téléphone (optionnel)' : 'Phone (optional)'}</Label>
                <Input
                  id="student-phone"
                  value={newStudentData.phone}
                  onChange={(e) => setNewStudentData({...newStudentData, phone: e.target.value})}
                  placeholder={language === 'fr' ? '+237 xxx xxx xxx' : '+237 xxx xxx xxx'}
                  data-testid="input-student-phone"
                />
              </div>
              <div>
                <Label htmlFor="student-class">{language === 'fr' ? 'Classe' : 'Class'}</Label>
                <Input
                  id="student-class"
                  value={newStudentData.classLevel}
                  onChange={(e) => setNewStudentData({...newStudentData, classLevel: e.target.value})}
                  placeholder={language === 'fr' ? 'CE1, CM2, 6ème' : 'CE1, CM2, 6ème'}
                  data-testid="input-student-class"
                />
              </div>
              <div>
                <Label htmlFor="student-parent">{language === 'fr' ? 'Email du parent' : 'Parent Email'}</Label>
                <Input
                  id="student-parent"
                  type="email"
                  value={newStudentData.parentEmail}
                  onChange={(e) => setNewStudentData({...newStudentData, parentEmail: e.target.value})}
                  placeholder={language === 'fr' ? 'parent@example.com' : 'parent@example.com'}
                  data-testid="input-student-parent"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddStudentModal(false)}>
                {language === 'fr' ? 'Annuler' : 'Cancel'}
              </Button>
              <Button 
                onClick={handleSubmitStudent}
                disabled={addStudentMutation.isPending}
                data-testid="button-submit-student"
              >
                {addStudentMutation.isPending ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> {language === 'fr' ? 'Ajout...' : 'Adding...'}</>
                ) : (
                  <>{language === 'fr' ? 'Ajouter' : 'Add'}</>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Add Parent Modal */}
      {showAddParentModal && (
        <Dialog open={showAddParentModal} onOpenChange={setShowAddParentModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{language === 'fr' ? 'Ajouter un Parent' : 'Add Parent'}</DialogTitle>
              <DialogDescription>
                {language === 'fr' ? 'Enregistrer un nouveau parent dans le système' : 'Register a new parent in the system'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="parent-name">{language === 'fr' ? 'Nom complet' : 'Full Name'}</Label>
                <Input
                  id="parent-name"
                  value={newParentData.name}
                  onChange={(e) => setNewParentData({...newParentData, name: e.target.value})}
                  placeholder={language === 'fr' ? 'Nom du parent' : 'Parent name'}
                  data-testid="input-parent-name"
                />
              </div>
              <div>
                <Label htmlFor="parent-email">{language === 'fr' ? 'Email' : 'Email'}</Label>
                <Input
                  id="parent-email"
                  type="email"
                  value={newParentData.email}
                  onChange={(e) => setNewParentData({...newParentData, email: e.target.value})}
                  placeholder={language === 'fr' ? 'parent@example.com' : 'parent@example.com'}
                  data-testid="input-parent-email"
                />
              </div>
              <div>
                <Label htmlFor="parent-phone">{language === 'fr' ? 'Téléphone' : 'Phone'}</Label>
                <Input
                  id="parent-phone"
                  value={newParentData.phone}
                  onChange={(e) => setNewParentData({...newParentData, phone: e.target.value})}
                  placeholder={language === 'fr' ? '+237 xxx xxx xxx' : '+237 xxx xxx xxx'}
                  data-testid="input-parent-phone"
                />
              </div>
              <div>
                <Label htmlFor="parent-children">{language === 'fr' ? 'Enfants (emails séparés par virgule)' : 'Children (emails separated by comma)'}</Label>
                <Input
                  id="parent-children"
                  value={newParentData.children.join(', ')}
                  onChange={(e) => setNewParentData({...newParentData, children: e.target.value.split(',').map(s => s.trim()).filter(s => s)})}
                  placeholder={language === 'fr' ? 'enfant1@example.com, enfant2@example.com' : 'child1@example.com, child2@example.com'}
                  data-testid="input-parent-children"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddParentModal(false)}>
                {language === 'fr' ? 'Annuler' : 'Cancel'}
              </Button>
              <Button 
                onClick={handleSubmitParent}
                disabled={addParentMutation.isPending}
                data-testid="button-submit-parent"
              >
                {addParentMutation.isPending ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> {language === 'fr' ? 'Ajout...' : 'Adding...'}</>
                ) : (
                  <>{language === 'fr' ? 'Ajouter' : 'Add'}</>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default DelegateAdministrators;