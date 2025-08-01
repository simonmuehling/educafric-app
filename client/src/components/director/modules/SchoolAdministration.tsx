import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

import { useToast } from '@/hooks/use-toast';
import { 
  Users, GraduationCap, UserCheck, Heart, School,
  Search, Download, Edit, Trash2, Phone, Mail, Plus,
  UserPlus, Settings, BarChart3, Eye
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

const SchoolAdministration: React.FC = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch administration stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/administration/stats'],
    queryFn: () => fetch('/api/administration/stats', { credentials: 'include' }).then(res => res.json())
  });

  // Fetch teachers data
  const { data: teachers = [], isLoading: teachersLoading } = useQuery({
    queryKey: ['/api/administration/teachers'],
    queryFn: () => fetch('/api/administration/teachers', { credentials: 'include' }).then(res => res.json())
  });

  // Fetch students data
  const { data: students = [], isLoading: studentsLoading } = useQuery({
    queryKey: ['/api/administration/students'],
    queryFn: () => fetch('/api/administration/students', { credentials: 'include' }).then(res => res.json())
  });

  // Fetch parents data
  const { data: parents = [], isLoading: parentsLoading } = useQuery({
    queryKey: ['/api/administration/parents'],
    queryFn: () => fetch('/api/administration/parents', { credentials: 'include' }).then(res => res.json())
  });

  // Create teacher mutation
  const createTeacherMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/administration/teachers', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to create teacher');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/administration/teachers'] });
      queryClient.invalidateQueries({ queryKey: ['/api/administration/stats'] });
      toast({
        title: language === 'fr' ? 'Succès' : 'Success',
        description: language === 'fr' ? 'Enseignant créé avec succès' : 'Teacher created successfully'
      });
    },
    onError: () => {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' ? 'Erreur lors de la création' : 'Error creating teacher',
        variant: 'destructive'
      });
    }
  });

  // Update teacher mutation
  const updateTeacherMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: any }) => {
      const response = await fetch(`/api/administration/teachers/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to update teacher');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/administration/teachers'] });
      toast({
        title: language === 'fr' ? 'Succès' : 'Success',
        description: language === 'fr' ? 'Enseignant mis à jour' : 'Teacher updated successfully'
      });
    }
  });

  // Delete teacher mutation
  const deleteTeacherMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/administration/teachers/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to delete teacher');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/administration/teachers'] });
      queryClient.invalidateQueries({ queryKey: ['/api/administration/stats'] });
      toast({
        title: language === 'fr' ? 'Succès' : 'Success',
        description: language === 'fr' ? 'Enseignant supprimé' : 'Teacher deleted successfully'
      });
    }
  });

  // Similar mutations for students and parents
  const createStudentMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/administration/students', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to create student');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/administration/students'] });
      queryClient.invalidateQueries({ queryKey: ['/api/administration/stats'] });
      toast({
        title: language === 'fr' ? 'Succès' : 'Success',
        description: language === 'fr' ? 'Élève créé avec succès' : 'Student created successfully'
      });
    }
  });

  const deleteStudentMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/administration/students/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to delete student');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/administration/students'] });
      queryClient.invalidateQueries({ queryKey: ['/api/administration/stats'] });
    }
  });

  const createParentMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/administration/parents', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to create parent');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/administration/parents'] });
      queryClient.invalidateQueries({ queryKey: ['/api/administration/stats'] });
      toast({
        title: language === 'fr' ? 'Succès' : 'Success',
        description: language === 'fr' ? 'Parent créé avec succès' : 'Parent created successfully'
      });
    }
  });

  const deleteParentMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/administration/parents/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to delete parent');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/administration/parents'] });
      queryClient.invalidateQueries({ queryKey: ['/api/administration/stats'] });
      toast({
        title: language === 'fr' ? 'Succès' : 'Success',
        description: language === 'fr' ? 'Parent supprimé' : 'Parent deleted successfully'
      });
    }
  });
  
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);

  // Filtrage des données avec sécurité
  const filteredTeachers = (Array.isArray(teachers) ? teachers : []).filter((teacher: any) => {
    if (!teacher) return false;
    const fullName = (teacher.firstName || '') + ' ' + (teacher.lastName || '');
    const email = teacher.email || '';
    const subjects = Array.isArray(teacher.subjects) ? teacher?.subjects?.join(', ') : teacher.subjects || '';
    
    return fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           email.toLowerCase().includes(searchTerm.toLowerCase()) ||
           subjects.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const filteredStudents = Array.isArray(students) ? students.filter((student: any) => {
    if (!student) return false;
    const fullName = (student.firstName || '') + ' ' + (student.lastName || '');
    const email = student.email || '';
    const className = student.className || '';
    
    return fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           email.toLowerCase().includes(searchTerm.toLowerCase()) ||
           className.toLowerCase().includes(searchTerm.toLowerCase());
  }) : [];

  const filteredParents = Array.isArray(parents) ? parents.filter((parent: any) => {
    if (!parent) return false;
    const fullName = (parent.firstName || '') + ' ' + (parent.lastName || '');
    const email = parent.email || '';
    
    return fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           email.toLowerCase().includes(searchTerm.toLowerCase());
  }) : [];

  const t = {
    fr: {
      title: "Administration École",
      description: "Gestion complète des utilisateurs : élèves, enseignants, parents et administrateurs",
      
      // Onglets
      overview: "Vue d'ensemble",
      teachers: "Enseignants",
      students: "Élèves", 
      parents: "Parents",
      administrators: "Administrateurs",
      
      // Actions communes
      search: "Rechercher...",
      add: "Ajouter",
      edit: "Modifier",
      delete: "Supprimer",
      view: "Voir",
      export: "Exporter",
      
      // Statistiques
      totalTeachers: "Total Enseignants",
      totalStudents: "Total Élèves",
      totalParents: "Total Parents",
      activeUsers: "Utilisateurs Actifs",
      
      // Autres
      active: "Actif",
      inactive: "Inactif",
      pending: "En attente",
      blocked: "Bloqué",
      name: "Nom",
      email: "Email",
      phone: "Téléphone",
      actions: "Actions",
      subjects: "Matières",
      class: "Classe",
      children: "Enfants",
      status: "Statut"
    },
    en: {
      title: "School Administration",
      description: "Complete user management: students, teachers, parents and administrators",
      
      overview: "Overview",
      teachers: "Teachers",
      students: "Students", 
      parents: "Parents",
      administrators: "Administrators",
      
      search: "Search...",
      add: "Add",
      edit: "Edit",
      delete: "Delete",
      view: "View",
      export: "Export",
      
      totalTeachers: "Total Teachers",
      totalStudents: "Total Students",
      totalParents: "Total Parents",
      activeUsers: "Active Users",
      
      active: "Active",
      inactive: "Inactive",
      pending: "Pending",
      blocked: "Blocked",
      name: "Name",
      email: "Email",
      phone: "Phone",
      actions: "Actions",
      subjects: "Subjects",
      class: "Class",
      children: "Children",
      status: "Status"
    }
  };

  const currentLang = t[language as keyof typeof t] || t.fr;

  const handleExportCSV = (type: string) => {
    const timestamp = new Date().toISOString().split('T')[0];
    let data: any[] = [];
    let filename = '';

    switch(type) {
      case 'teachers':
        data = teachers;
        filename = `enseignants_${timestamp}.csv`;
        break;
      case 'students':
        data = students;
        filename = `eleves_${timestamp}.csv`;
        break;
      case 'parents':
        data = parents;
        filename = `parents_${timestamp}.csv`;
        break;
    }

    // Créer CSV
    const headers = Object.keys(data[0] || {}).join(',');
    const csvContent = [headers, ...(Array.isArray(data) ? data : []).map(row => Object.values(row).join(','))].join('\n');
    
    // Télécharger
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window?.URL?.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document?.body?.appendChild(a);
    a.click();
    document?.body?.removeChild(a);
    window?.URL?.revokeObjectURL(url);

    toast({
      title: "Export réussi",
      description: `${filename} téléchargé avec succès`,
    });
  };



  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <School className="w-8 h-8" />
          <div>
            <h1 className="text-2xl font-bold">{String(currentLang?.title) || "N/A"}</h1>
            <p className="text-blue-100">{String(currentLang?.description) || "N/A"}</p>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            {String(currentLang?.overview) || "N/A"}
          </TabsTrigger>
          <TabsTrigger value="teachers" className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4" />
            {String(currentLang?.teachers) || "N/A"}
          </TabsTrigger>
          <TabsTrigger value="students" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            {String(currentLang?.students) || "N/A"}
          </TabsTrigger>
          <TabsTrigger value="parents" className="flex items-center gap-2">
            <Heart className="w-4 h-4" />
            {String(currentLang?.parents) || "N/A"}
          </TabsTrigger>
          <TabsTrigger value="administrators" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            {String(currentLang?.administrators) || "N/A"}
          </TabsTrigger>
        </TabsList>

        {/* Vue d'ensemble */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <GraduationCap className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">{String(currentLang?.totalTeachers) || "N/A"}</p>
                    <p className="text-2xl font-bold">{stats?.totalTeachers || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Users className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">{String(currentLang?.totalStudents) || "N/A"}</p>
                    <p className="text-2xl font-bold">{stats?.totalStudents || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Heart className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">{String(currentLang?.totalParents) || "N/A"}</p>
                    <p className="text-2xl font-bold">{stats?.totalParents || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <UserCheck className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">{String(currentLang?.activeUsers) || "N/A"}</p>
                    <p className="text-2xl font-bold">{stats?.activeUsers || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Enseignants */}
        <TabsContent value="teachers" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="w-5 h-5" />
                    {String(currentLang?.teachers) || "N/A"} ({String(filteredTeachers?.length) || "N/A"})
                  </CardTitle>
                  <CardDescription>Gestion des enseignants de l'école</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => handleExportCSV('teachers')} variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    {String(currentLang?.export) || "N/A"}
                  </Button>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        {String(currentLang?.add) || "N/A"}
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Ajouter un Enseignant</DialogTitle>
                        <DialogDescription>
                          Créer un nouveau compte enseignant pour cette école
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="firstName">Prénom</Label>
                            <Input id="firstName" placeholder="Prénom" />
                          </div>
                          <div>
                            <Label htmlFor="lastName">Nom</Label>
                            <Input id="lastName" placeholder="Nom de famille" />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="email">Email</Label>
                          <Input id="email" type="email" placeholder="email@exemple.com" />
                        </div>
                        <div>
                          <Label htmlFor="phone">Téléphone</Label>
                          <Input id="phone" placeholder="+237..." />
                        </div>
                        <div>
                          <Label htmlFor="subjects">Matières enseignées</Label>
                          <Input id="subjects" placeholder="Mathématiques, Sciences..." />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button onClick={() => {
                          toast({
                            title: "Enseignant ajouté",
                            description: "Le nouveau compte enseignant a été créé avec succès"
                          });
                        }}>
                          Créer le compte
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder={String(currentLang?.search) || "N/A"}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e?.target?.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-3">
                {(Array.isArray(filteredTeachers) ? filteredTeachers.length : 0) > 0 ? (Array.isArray(filteredTeachers) ? filteredTeachers : []).map((teacher: any) => (
                  <div key={String(teacher?.id) || "N/A"} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <GraduationCap className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">{String(teacher?.firstName) || "N/A"} {String(teacher?.lastName) || "N/A"}</h4>
                        <p className="text-sm text-gray-600">{String(teacher?.email) || "N/A"}</p>
                        <div className="flex gap-2 mt-1">
                          {Array.isArray(teacher.subjects) ? (Array.isArray(teacher.subjects) ? teacher.subjects : []).map((subject: string) => (
                            <Badge key={subject} variant="secondary" className="text-xs">
                              {subject}
                            </Badge>
                          )) : (
                            <Badge variant="secondary" className="text-xs">
                              {teacher.subjects || 'Aucune matière'}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-8 text-gray-500">
                    Aucun enseignant trouvé
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Élèves */}
        <TabsContent value="students" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    {String(currentLang?.students) || "N/A"} ({String(filteredStudents?.length) || "N/A"})
                  </CardTitle>
                  <CardDescription>Gestion des élèves de l'école</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => handleExportCSV('students')} variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    {String(currentLang?.export) || "N/A"}
                  </Button>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        {String(currentLang?.add) || "N/A"}
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Ajouter un Élève</DialogTitle>
                        <DialogDescription>
                          Inscrire un nouveau élève dans cette école
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="studentFirstName">Prénom</Label>
                            <Input id="studentFirstName" placeholder="Prénom" />
                          </div>
                          <div>
                            <Label htmlFor="studentLastName">Nom</Label>
                            <Input id="studentLastName" placeholder="Nom de famille" />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="studentClass">Classe</Label>
                          <Input id="studentClass" placeholder="6ème A, CE1 B..." />
                        </div>
                        <div>
                          <Label htmlFor="studentEmail">Email (optionnel)</Label>
                          <Input id="studentEmail" type="email" placeholder="email@exemple.com" />
                        </div>
                        <div>
                          <Label htmlFor="parentPhone">Téléphone Parent</Label>
                          <Input id="parentPhone" placeholder="+237..." />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button onClick={() => {
                          toast({
                            title: "Élève inscrit",
                            description: "Le nouvel élève a été inscrit avec succès"
                          });
                        }}>
                          Inscrire l'élève
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder={String(currentLang?.search) || "N/A"}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e?.target?.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-3">
                {(Array.isArray(filteredStudents) ? filteredStudents.length : 0) > 0 ? (Array.isArray(filteredStudents) ? filteredStudents : []).map((student: any) => (
                  <div key={String(student?.id) || "N/A"} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">{String(student?.firstName) || "N/A"} {String(student?.lastName) || "N/A"}</h4>
                        <p className="text-sm text-gray-600">{String(currentLang?.class) || "N/A"}: {String(student?.className) || "N/A"}</p>
                        {student.parentInfo && (
                          <p className="text-xs text-gray-500">Parent: {String(student?.parentInfo?.name) || "N/A"}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-8 text-gray-500">
                    Aucun élève trouvé
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Parents */}
        <TabsContent value="parents" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="w-5 h-5" />
                    {String(currentLang?.parents) || "N/A"} ({String(filteredParents?.length) || "N/A"})
                  </CardTitle>
                  <CardDescription>Gestion des parents d'élèves</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => handleExportCSV('parents')} variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    {String(currentLang?.export) || "N/A"}
                  </Button>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        {String(currentLang?.add) || "N/A"}
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Ajouter un Parent</DialogTitle>
                        <DialogDescription>
                          Créer un nouveau compte parent et le connecter à un élève
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="parentFirstName">Prénom</Label>
                            <Input id="parentFirstName" placeholder="Prénom" />
                          </div>
                          <div>
                            <Label htmlFor="parentLastName">Nom</Label>
                            <Input id="parentLastName" placeholder="Nom de famille" />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="parentEmail">Email</Label>
                          <Input id="parentEmail" type="email" placeholder="email@exemple.com" />
                        </div>
                        <div>
                          <Label htmlFor="parentPhoneNumber">Téléphone</Label>
                          <Input id="parentPhoneNumber" placeholder="+237..." />
                        </div>
                        <div>
                          <Label htmlFor="childrenNames">Enfants (noms)</Label>
                          <Input id="childrenNames" placeholder="Paul Kamga, Marie Kamga..." />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button onClick={() => {
                          toast({
                            title: "Parent ajouté",
                            description: "Le nouveau compte parent a été créé avec succès"
                          });
                        }}>
                          Créer le compte
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder={String(currentLang?.search) || "N/A"}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e?.target?.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-3">
                {(Array.isArray(filteredParents) ? filteredParents.length : 0) > 0 ? (Array.isArray(filteredParents) ? filteredParents : []).map((parent: any) => (
                  <div key={String(parent?.id) || "N/A"} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <Heart className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">{String(parent?.firstName) || "N/A"} {String(parent?.lastName) || "N/A"}</h4>
                        <p className="text-sm text-gray-600">{String(parent?.email) || "N/A"}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant={parent.status === 'active' ? 'default' : 'secondary'}>
                            {parent.status === 'active' ? currentLang.active : currentLang.inactive}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {Array.isArray(parent.children) ? (Array.isArray(parent.children) ? parent.children.length : 0) : 0} {Array.isArray(parent.children) && (Array.isArray(parent.children) ? parent.children.length : 0) === 1 ? 'enfant' : 'enfants'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-8 text-gray-500">
                    Aucun parent trouvé
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Administrateurs */}
        <TabsContent value="administrators" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Administrateurs Délégués
              </CardTitle>
              <CardDescription>
                Maximum 2 administrateurs peuvent être désignés pour aider à la gestion de l'école
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">Aucun administrateur délégué pour le moment</p>
                <Button>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Désigner un Administrateur
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SchoolAdministration;