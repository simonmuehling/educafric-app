import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Users, UserPlus, Search, Download, Filter, MoreHorizontal, 
  BookOpen, TrendingUp, Calendar, Plus, Edit, Trash2, 
  Eye, X, Mail, Phone, GraduationCap, UserCheck, Upload
} from 'lucide-react';
import ImportModal from '../ImportModal';

interface Teacher {
  id: number;
  name: string;
  email: string;
  phone: string;
  gender?: string;
  matricule?: string;
  teachingSubjects?: string[];
  subjects?: string[]; // Keep for backward compatibility
  classes: string[];
  status: 'active' | 'inactive' | 'on_leave';
  schedule?: string;
  experience?: number; // Keep for display compatibility
  qualification?: string; // Keep for display compatibility
  salary?: number; // Keep for display compatibility
}

const FunctionalDirectorTeacherManagement: React.FC = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [isAddTeacherOpen, setIsAddTeacherOpen] = useState(false);
  const [isEditTeacherOpen, setIsEditTeacherOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    gender: 'all',
    subject: 'all',
    experience: 'all'
  });
  const [teacherForm, setTeacherForm] = useState({
    name: '',
    email: '',
    phone: '',
    gender: '',
    matricule: '',
    teachingSubjects: '',
    classes: '',
    schedule: ''
  });

  // Fetch teachers data from PostgreSQL API
  const { data: teachersData, isLoading } = useQuery({
    queryKey: ['/api/director/teachers'],
    enabled: !!user,
    queryFn: async () => {
      const response = await fetch('/api/director/teachers', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch teachers');
      const data = await response.json();
      console.log('[TEACHERS_DEBUG] API Response:', data);
      return data;
    }
  });

  // Extract teachers array from API response
  const teachers = teachersData?.teachers || teachersData || [];

  // Export function
  const handleExportTeachers = () => {
    if (!teachers || teachers.length === 0) {
      toast({
        title: language === 'fr' ? 'Aucune donnée à exporter' : 'No data to export',
        description: language === 'fr' ? 'Ajoutez des enseignants avant d\'exporter' : 'Add teachers before exporting',
        variant: 'destructive'
      });
      return;
    }

    const csvHeaders = language === 'fr' ? 
      'Nom,Email,Téléphone,Matières,Classes,Genre' :
      'Name,Email,Phone,Subjects,Classes,Gender';
    
    const csvData = teachers.map(teacher => 
      `"${teacher.firstName} ${teacher.lastName}","${teacher.email}","${teacher.phone}","${teacher.teachingSubjects}","${teacher.classes}","${teacher.gender}"`
    ).join('\n');
    
    const csv = `${csvHeaders}\n${csvData}`;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `enseignants_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    
    toast({
      title: language === 'fr' ? '📊 Export réussi !' : '📊 Export Successful!',
      description: language === 'fr' ? 'Liste des enseignants exportée' : 'Teacher list exported'
    });
  };

  // Create teacher mutation
  const createTeacherMutation = useMutation({
    mutationFn: async (teacherData: any) => {
      const response = await fetch('/api/director/teachers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(teacherData),
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to create teacher');
      return response.json();
    },
    onSuccess: (newTeacher) => {
      // ✅ IMMEDIATE VISUAL FEEDBACK - User sees the new teacher
      queryClient.invalidateQueries({ queryKey: ['/api/director/teachers'] });
      queryClient.refetchQueries({ queryKey: ['/api/director/teachers'] });
      
      setIsAddTeacherOpen(false);
      const teacherName = teacherForm.name || 'Le nouvel enseignant';
      setTeacherForm({ name: '', email: '', phone: '', gender: '', matricule: '', teachingSubjects: '', classes: '', schedule: '' });
      
      toast({
        title: '✅ Enseignant ajouté avec succès',
        description: `${teacherName} a été ajouté à votre équipe pédagogique et apparaît maintenant dans la liste.`
      });
      
      // Scroll to show the new teacher
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    },
    onError: () => {
      toast({
        title: 'Erreur',
        description: 'Impossible d\'ajouter l\'enseignant.',
        variant: 'destructive'
      });
    }
  });

  // Update teacher mutation
  const updateTeacherMutation = useMutation({
    mutationFn: async (teacherData: any) => {
      const response = await fetch(`/api/director/teachers/${teacherData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(teacherData),
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to update teacher');
      return response.json();
    },
    onSuccess: () => {
      // ✅ IMMEDIATE VISUAL FEEDBACK - User sees updated teacher
      queryClient.invalidateQueries({ queryKey: ['/api/director/teachers'] });
      queryClient.refetchQueries({ queryKey: ['/api/director/teachers'] });
      
      setIsEditTeacherOpen(false);
      const editedTeacherName = selectedTeacher ? selectedTeacher.name : 'L\'enseignant';
      setSelectedTeacher(null);
      
      toast({
        title: 'Enseignant modifié',
        description: 'L\'enseignant a été modifié avec succès.'
      });
    },
    onError: () => {
      toast({
        title: 'Erreur',
        description: 'Impossible de modifier l\'enseignant.',
        variant: 'destructive'
      });
    }
  });

  // Delete teacher mutation
  const deleteTeacherMutation = useMutation({
    mutationFn: async (teacherId: number) => {
      const response = await fetch(`/api/director/teachers/${teacherId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to delete teacher');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/director/teachers'] });
      toast({
        title: 'Enseignant supprimé',
        description: 'L\'enseignant a été supprimé avec succès.'
      });
    },
    onError: () => {
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer l\'enseignant.',
        variant: 'destructive'
      });
    }
  });

  const handleCreateTeacher = () => {
    const teacherData = {
      name: teacherForm.name, // Send as single name field for backend to split
      email: teacherForm.email,
      phone: teacherForm.phone,
      gender: teacherForm.gender,
      matricule: teacherForm.matricule,
      teachingSubjects: teacherForm.teachingSubjects.split(',').map(s => s.trim()).filter(s => s),
      classes: teacherForm.classes.split(',').map(c => c.trim()).filter(c => c)
    };
    
    console.log('[FRONTEND] Creating teacher with data:', teacherData);
    createTeacherMutation.mutate(teacherData);
  };

  const handleUpdateTeacher = () => {
    if (selectedTeacher) {
      const updateData = {
        id: selectedTeacher.id,
        name: teacherForm.name,
        email: teacherForm.email,
        phone: teacherForm.phone,
        gender: teacherForm.gender,
        matricule: teacherForm.matricule,
        teachingSubjects: teacherForm.teachingSubjects.split(',').map(s => s.trim()).filter(s => s),
        classes: teacherForm.classes.split(',').map(c => c.trim()).filter(c => c),
        schedule: teacherForm.schedule
      };
      
      console.log('[FRONTEND] Updating teacher with data:', updateData);
      updateTeacherMutation.mutate(updateData);
    }
  };

  const handleEditTeacher = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setTeacherForm({
      name: teacher.name,
      email: teacher.email,
      phone: teacher.phone,
      teachingSubjects: teacher.teachingSubjects ? teacher.teachingSubjects.join(', ') : '',
      classes: teacher.classes ? teacher.classes.join(', ') : '',
      gender: teacher.gender || '',
      matricule: teacher.matricule || '',
      schedule: teacher.schedule || ''
    });
    setIsEditTeacherOpen(true);
  };

  const handleDeleteTeacher = (teacherId: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet enseignant ?')) {
      deleteTeacherMutation.mutate(teacherId);
    }
  };

  const filteredTeachers = Array.isArray(teachers) ? teachers.filter(teacher => {
    if (!teacher) return false;
    const name = teacher.name || '';
    const email = teacher.email || '';
    const teachingSubjects = Array.isArray(teacher.teachingSubjects) ? teacher.teachingSubjects : 
                           Array.isArray(teacher.subjects) ? teacher.subjects : [];
    
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = selectedSubject === 'all' || teachingSubjects.includes(selectedSubject);
    
    // Appliquer les filtres avancés
    const matchesGender = filters.gender === 'all' || teacher.gender === filters.gender;
    const matchesFilterSubject = filters.subject === 'all' || teachingSubjects.includes(filters.subject);
    const matchesExperience = filters.experience === 'all' || 
      (filters.experience === 'junior' && (teacher.experience || 0) <= 3) ||
      (filters.experience === 'senior' && (teacher.experience || 0) > 3 && (teacher.experience || 0) <= 10) ||
      (filters.experience === 'expert' && (teacher.experience || 0) > 10);
    
    return matchesSearch && matchesSubject && matchesGender && matchesFilterSubject && matchesExperience;
  }) : [];
  
  // Extract unique subjects from all teachers for dynamic filter
  const allSubjects = Array.from(new Set(
    Array.isArray(teachers) ? teachers.flatMap(teacher => 
      Array.isArray(teacher.teachingSubjects) ? teacher.teachingSubjects : 
      Array.isArray(teacher.subjects) ? teacher.subjects : []
    ).filter(subject => subject && subject.trim()) : []
  )).sort();

  const stats = {
    totalTeachers: Array.isArray(teachers) ? teachers.length : 0,
    activeTeachers: Array.isArray(teachers) ? teachers.filter(t => t && t.status === 'active').length : 0,
    averageExperience: Array.isArray(teachers) && teachers.length > 0 ? Math.round(teachers.reduce((sum, t) => sum + (t.experience || 0), 0) / teachers.length) : 0,
    onLeave: Array.isArray(teachers) ? teachers.filter(t => t && t.status === 'on_leave').length : 0
  };

  const text = language === 'fr' ? {
    title: 'Gestion des Enseignants',
    description: 'Gérez le personnel enseignant de votre établissement',
    addTeacher: 'Ajouter un Enseignant',
    editTeacher: 'Modifier l\'Enseignant',
    search: 'Rechercher...',
    subject: 'Matière',
    allSubjects: 'Toutes les matières',
    stats: {
      total: 'Total Enseignants',
      active: 'Enseignants Actifs',
      experience: 'Expérience Moyenne',
      onLeave: 'En Congé'
    },
    form: {
      name: 'Nom complet',
      email: 'Email',
      phone: 'Téléphone',
      gender: 'Sexe',
      matricule: 'Matricule',
      teachingSubjects: 'Matières enseignées (séparées par virgule)',
      classes: 'Classes assignées (séparées par virgule)',
      schedule: 'Emploi du temps'
    },
    placeholders: {
      name: 'Jean Dupont',
      email: 'jean.dupont@ecole.com',
      phone: '+237 6XX XXX XXX',
      matricule: 'MAT-2024-001',
      teachingSubjects: 'Mathématiques, Physique, Chimie',
      classes: '6ème A, 5ème B, 4ème C'
    },
    genderOptions: {
      male: 'Masculin',
      female: 'Féminin',
      placeholder: 'Sélectionner'
    },
    status: {
      active: 'Actif',
      inactive: 'Inactif',
      on_leave: 'En congé'
    },
    buttons: {
      create: 'Ajouter',
      update: 'Modifier',
      delete: 'Supprimer',
      cancel: 'Annuler',
      edit: 'Modifier',
      view: 'Voir'
    }
  } : {
    title: 'Teacher Management',
    description: 'Manage your school\'s teaching staff',
    addTeacher: 'Add Teacher',
    editTeacher: 'Edit Teacher',
    search: 'Search...',
    subject: 'Subject',
    allSubjects: 'All subjects',
    stats: {
      total: 'Total Teachers',
      active: 'Active Teachers',
      experience: 'Average Experience',
      onLeave: 'On Leave'
    },
    form: {
      name: 'Full name',
      email: 'Email',
      phone: 'Phone',
      gender: 'Gender',
      matricule: 'Registration Number',
      teachingSubjects: 'Teaching subjects (comma separated)',
      classes: 'Assigned classes (comma separated)',
      schedule: 'Schedule'
    },
    placeholders: {
      name: 'John Smith',
      email: 'john.smith@school.com',
      phone: '+237 6XX XXX XXX',
      matricule: 'REG-2024-001',
      teachingSubjects: 'Mathematics, Physics, Chemistry',
      classes: 'Grade 6A, Grade 5B, Grade 4C'
    },
    genderOptions: {
      male: 'Male',
      female: 'Female',
      placeholder: 'Select'
    },
    status: {
      active: 'Active',
      inactive: 'Inactive',
      on_leave: 'On Leave'
    },
    buttons: {
      create: 'Add',
      update: 'Update',
      delete: 'Delete',
      cancel: 'Cancel',
      edit: 'Edit',
      view: 'View'
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{text.title || ''}</h1>
          <p className="text-gray-500">{text.description}</p>
        </div>
        <div className="flex gap-3">
          <Button 
            onClick={() => setIsImportModalOpen(true)}
            className="bg-green-600 hover:bg-green-700"
            data-testid="button-import-teachers"
          >
            <Upload className="w-4 h-4 mr-2" />
            {language === 'fr' ? 'Importer' : 'Import'}
          </Button>
          <Button 
            onClick={() => setIsAddTeacherOpen(true)}
            className="bg-blue-600 hover:bg-blue-700"
            data-testid="button-add-teacher"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            {text.addTeacher}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-full">
                <UserCheck className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">{text.stats.total}</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalTeachers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-full">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">{text.stats.active}</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.activeTeachers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-full">
                <TrendingUp className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">{text.stats.experience}</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.averageExperience} ans</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-full">
                <Calendar className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">{text.stats.onLeave}</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.onLeave}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder={text.search}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full sm:w-48">
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger>
                  <SelectValue placeholder={text.subject} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{text.allSubjects}</SelectItem>
                  {allSubjects.map(subject => (
                    <SelectItem key={subject} value={subject}>
                      {subject}
                    </SelectItem>
                  ))}
                  {allSubjects.length === 0 && (
                    <>
                      <SelectItem value="Mathématiques">Mathématiques</SelectItem>
                      <SelectItem value="Français">Français</SelectItem>
                      <SelectItem value="Sciences">Sciences</SelectItem>
                      <SelectItem value="Histoire">Histoire</SelectItem>
                      <SelectItem value="Anglais">Anglais</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Teacher Modal */}
      {isAddTeacherOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{text.addTeacher}</h3>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setIsAddTeacherOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">{(text.form.name || '')}</Label>
                <Input
                  value={teacherForm.name || ''}
                  onChange={(e) => setTeacherForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder={text.placeholders.name}
                  className="w-full"
                />
              </div>
              <div>
                <Label className="text-sm font-medium">{(text.form.email || '')}</Label>
                <Input
                  type="email"
                  value={teacherForm.email || ''}
                  onChange={(e) => setTeacherForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder={text.placeholders.email}
                  className="w-full"
                />
              </div>
              <div>
                <Label className="text-sm font-medium">{text.form.phone}</Label>
                <Input
                  value={teacherForm.phone}
                  onChange={(e) => setTeacherForm(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder={text.placeholders.phone}
                  className="w-full"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">{text.form.gender}</Label>
                  <Select 
                    value={teacherForm.gender} 
                    onValueChange={(value) => setTeacherForm(prev => ({ ...prev, gender: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={text.genderOptions.placeholder} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="M">{text.genderOptions.male}</SelectItem>
                      <SelectItem value="F">{text.genderOptions.female}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm font-medium">{text.form.matricule}</Label>
                  <Input
                    value={teacherForm.matricule}
                    onChange={(e) => setTeacherForm(prev => ({ ...prev, matricule: e.target.value }))}
                    placeholder={text.placeholders.matricule}
                    className="w-full"
                  />
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">{text.form.teachingSubjects}</Label>
                <Input
                  value={teacherForm.teachingSubjects}
                  onChange={(e) => setTeacherForm(prev => ({ ...prev, teachingSubjects: e.target.value }))}
                  placeholder={text.placeholders.teachingSubjects}
                  className="w-full"
                />
              </div>
              <div>
                <Label className="text-sm font-medium">{text.form.classes}</Label>
                <Input
                  value={teacherForm.classes}
                  onChange={(e) => setTeacherForm(prev => ({ ...prev, classes: e.target.value }))}
                  placeholder={text.placeholders.classes}
                  className="w-full"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={handleCreateTeacher}
                  disabled={createTeacherMutation.isPending || !teacherForm.name || !teacherForm.email}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  data-testid="button-confirm-add-teacher"
                >
                  {createTeacherMutation.isPending ? 'Ajout...' : text.buttons.create}
                </Button>
                <Button 
                  onClick={() => setIsAddTeacherOpen(false)}
                  variant="outline"
                  data-testid="button-cancel-add-teacher"
                >
                  {text.buttons.cancel}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Teacher Modal */}
      {isEditTeacherOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{text.editTeacher}</h3>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setIsEditTeacherOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">{(text.form.name || '')}</Label>
                <Input
                  value={teacherForm.name || ''}
                  onChange={(e) => setTeacherForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full"
                />
              </div>
              <div>
                <Label className="text-sm font-medium">{(text.form.email || '')}</Label>
                <Input
                  type="email"
                  value={teacherForm.email || ''}
                  onChange={(e) => setTeacherForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full"
                />
              </div>
              <div>
                <Label className="text-sm font-medium">{text.form.phone}</Label>
                <Input
                  value={teacherForm.phone}
                  onChange={(e) => setTeacherForm(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder={text.placeholders.phone}
                  className="w-full"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">{text.form.gender}</Label>
                  <Select 
                    value={teacherForm.gender} 
                    onValueChange={(value) => setTeacherForm(prev => ({ ...prev, gender: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={text.genderOptions.placeholder} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="M">{text.genderOptions.male}</SelectItem>
                      <SelectItem value="F">{text.genderOptions.female}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm font-medium">{text.form.matricule}</Label>
                  <Input
                    value={teacherForm.matricule}
                    onChange={(e) => setTeacherForm(prev => ({ ...prev, matricule: e.target.value }))}
                    placeholder={text.placeholders.matricule}
                    className="w-full"
                  />
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">{text.form.teachingSubjects}</Label>
                <Input
                  value={teacherForm.teachingSubjects}
                  onChange={(e) => setTeacherForm(prev => ({ ...prev, teachingSubjects: e.target.value }))}
                  placeholder={text.placeholders.teachingSubjects}
                  className="w-full"
                />
              </div>
              <div>
                <Label className="text-sm font-medium">{text.form.classes}</Label>
                <Input
                  value={teacherForm.classes}
                  onChange={(e) => setTeacherForm(prev => ({ ...prev, classes: e.target.value }))}
                  placeholder={text.placeholders.classes}
                  className="w-full"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={handleUpdateTeacher}
                  disabled={updateTeacherMutation.isPending}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  data-testid="button-confirm-edit-teacher"
                >
                  {updateTeacherMutation.isPending ? 'Modification...' : text.buttons.update}
                </Button>
                <Button 
                  onClick={() => setIsEditTeacherOpen(false)}
                  variant="outline"
                  data-testid="button-cancel-edit-teacher"
                >
                  {text.buttons.cancel}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Teachers List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Personnel Enseignant</h3>
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleExportTeachers}
                data-testid="button-export-teachers"
              >
                <Download className="w-4 h-4 mr-2" />
                {language === 'fr' ? 'Exporter' : 'Export'}
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                data-testid="button-filter-teachers"
              >
                <Filter className="w-4 h-4 mr-2" />
                {language === 'fr' ? 'Filtrer' : 'Filter'}
              </Button>
            </div>
          </div>
        </CardHeader>
        
        {/* Filter Panel */}
        {isFilterOpen && (
          <div className="border-b px-6 py-4 bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="text-sm font-medium">
                  {language === 'fr' ? 'Genre' : 'Gender'}
                </Label>
                <Select 
                  value={filters.gender} 
                  onValueChange={(value) => setFilters(prev => ({ ...prev, gender: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{language === 'fr' ? 'Tous' : 'All'}</SelectItem>
                    <SelectItem value="M">{language === 'fr' ? 'Homme' : 'Male'}</SelectItem>
                    <SelectItem value="F">{language === 'fr' ? 'Femme' : 'Female'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-medium">
                  {language === 'fr' ? 'Matière' : 'Subject'}
                </Label>
                <Select 
                  value={filters.subject} 
                  onValueChange={(value) => setFilters(prev => ({ ...prev, subject: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{language === 'fr' ? 'Toutes' : 'All'}</SelectItem>
                    <SelectItem value="Mathématiques">Mathématiques</SelectItem>
                    <SelectItem value="Français">Français</SelectItem>
                    <SelectItem value="Anglais">Anglais</SelectItem>
                    <SelectItem value="Sciences">Sciences</SelectItem>
                    <SelectItem value="Histoire">Histoire</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-medium">
                  {language === 'fr' ? 'Expérience' : 'Experience'}
                </Label>
                <Select 
                  value={filters.experience} 
                  onValueChange={(value) => setFilters(prev => ({ ...prev, experience: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{language === 'fr' ? 'Toutes' : 'All'}</SelectItem>
                    <SelectItem value="junior">{language === 'fr' ? 'Junior (0-3 ans)' : 'Junior (0-3 years)'}</SelectItem>
                    <SelectItem value="senior">{language === 'fr' ? 'Senior (3-10 ans)' : 'Senior (3-10 years)'}</SelectItem>
                    <SelectItem value="expert">{language === 'fr' ? 'Expert (10+ ans)' : 'Expert (10+ years)'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setFilters({ gender: 'all', subject: 'all', experience: 'all' })}
              >
                {language === 'fr' ? 'Réinitialiser' : 'Reset'}
              </Button>
            </div>
          </div>
        )}

        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-20 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : filteredTeachers.length === 0 ? (
            <div className="text-center py-12">
              <UserCheck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun enseignant trouvé</h3>
              <p className="text-gray-500">Ajoutez votre premier enseignant pour commencer.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {(Array.isArray(filteredTeachers) ? filteredTeachers : []).map((teacher) => (
                <div key={teacher.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <GraduationCap className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <div className="font-medium text-gray-900">{teacher.name || ''}</div>
                        <Badge variant={teacher.status === 'active' ? 'default' : 'secondary'}>
                          {text.status[teacher.status]}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 mb-2 text-sm text-gray-600">
                        <span>📚 {(teacher.teachingSubjects || []).join(', ')}</span>
                        {teacher.gender && <span>👤 {teacher.gender === 'M' ? 'Masculin' : 'Féminin'}</span>}
                        {teacher.matricule && <span>🆔 {teacher.matricule}</span>}
                      </div>
                      <div className="flex flex-wrap items-center gap-4 mb-3 text-xs text-gray-500">
                        <span>📧 {teacher.email || ''}</span>
                        <span>📱 {teacher.phone}</span>
                        <span>🏫 {teacher.classes.join(', ')}</span>
                      </div>
                      
                      {/* Boutons d'action mobile-first sous le nom */}
                      <div className="flex flex-wrap gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          onClick={() => {
                            setSelectedTeacher(teacher);
                            toast({
                              title: 'Profil enseignant',
                              description: `Consultation du profil de ${teacher.name}`
                            });
                          }}
                          data-testid={`button-view-teacher-${teacher.id}`}
                        >
                          <Eye className="w-4 h-4" />
                          <span className="hidden sm:inline">{text.buttons.view}</span>
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEditTeacher(teacher)}
                          className="flex items-center gap-2 text-green-600 hover:text-green-700 hover:bg-green-50"
                          data-testid={`button-edit-teacher-${teacher.id}`}
                        >
                          <Edit className="w-4 h-4" />
                          <span className="hidden sm:inline">{text.buttons.edit}</span>
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeleteTeacher(teacher.id)}
                          className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                          data-testid={`button-delete-teacher-${teacher.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                          <span className="hidden sm:inline">{text.buttons.delete}</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Import Modal */}
      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        importType="teachers"
        onImportComplete={() => {
          queryClient.invalidateQueries({ queryKey: ['/api/director/teachers'] });
          setIsImportModalOpen(false);
        }}
      />
    </div>
  );
};

export default FunctionalDirectorTeacherManagement;