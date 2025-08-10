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
  Eye, X, Mail, Phone, GraduationCap, UserCheck
} from 'lucide-react';

interface Teacher {
  id: number;
  name: string;
  email: string;
  phone: string;
  subjects: string[];
  classes: string[];
  experience: number;
  qualification: string;
  status: 'active' | 'inactive' | 'on_leave';
  schedule: string;
  salary: number;
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
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [teacherForm, setTeacherForm] = useState({
    name: '',
    email: '',
    phone: '',
    subjects: '',
    classes: '',
    experience: '',
    qualification: '',
    schedule: '',
    salary: ''
  });

  // Fetch teachers data from PostgreSQL API
  const { data: teachers = [], isLoading } = useQuery<Teacher[]>({
    queryKey: ['/api/director/teachers'],
    enabled: !!user
  });

  // Create teacher mutation
  const createTeacherMutation = useMutation({
    mutationFn: async (teacherData: any) => {
      const response = await fetch('/api/director/teacher', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(teacherData),
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to create teacher');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/director/teachers'] });
      setIsAddTeacherOpen(false);
      setTeacherForm({ name: '', email: '', phone: '', subjects: '', classes: '', experience: '', qualification: '', schedule: '', salary: '' });
      toast({
        title: 'Enseignant ajouté',
        description: 'L\'enseignant a été ajouté avec succès.'
      });
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
      const response = await fetch(`/api/director/teacher/${teacherData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(teacherData),
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to update teacher');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/director/teachers'] });
      setIsEditTeacherOpen(false);
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
      const response = await fetch(`/api/director/teacher/${teacherId}`, {
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
    createTeacherMutation.mutate({
      ...teacherForm,
      subjects: teacherForm.subjects.split(',').map(s => s.trim()),
      classes: teacherForm.classes.split(',').map(c => c.trim()),
      experience: parseInt(teacherForm.experience) || 0,
      salary: parseFloat(teacherForm.salary) || 0
    });
  };

  const handleUpdateTeacher = () => {
    if (selectedTeacher) {
      updateTeacherMutation.mutate({
        ...selectedTeacher,
        ...teacherForm,
        subjects: teacherForm.subjects.split(',').map(s => s.trim()),
        classes: teacherForm.classes.split(',').map(c => c.trim())
      });
    }
  };

  const handleEditTeacher = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setTeacherForm({
      name: teacher.name,
      email: teacher.email,
      phone: teacher.phone,
      subjects: teacher.subjects.join(', '),
      classes: teacher.classes.join(', '),
      experience: teacher.experience.toString(),
      qualification: teacher.qualification,
      schedule: teacher.schedule,
      salary: teacher.salary.toString()
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
    const subjects = Array.isArray(teacher.subjects) ? teacher.subjects : [];
    
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = selectedSubject === 'all' || subjects.includes(selectedSubject);
    return matchesSearch && matchesSubject;
  }) : [];

  const stats = {
    totalTeachers: Array.isArray(teachers) ? teachers.length : 0,
    activeTeachers: Array.isArray(teachers) ? teachers.filter(t => t && t.status === 'active').length : 0,
    averageExperience: Array.isArray(teachers) && teachers.length > 0 ? Math.round(teachers.reduce((sum, t) => sum + (t.experience || 0), 0) / teachers.length) : 0,
    onLeave: Array.isArray(teachers) ? teachers.filter(t => t && t.status === 'on_leave').length : 0
  };

  const text = language === 'fr' ? {
    title: 'Gestion des Enseignants',
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
      subjects: 'Matières (séparées par virgule)',
      classes: 'Classes (séparées par virgule)',
      experience: 'Années d\'expérience',
      qualification: 'Qualification',
      schedule: 'Emploi du temps',
      salary: 'Salaire mensuel'
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
      subjects: 'Subjects (comma separated)',
      classes: 'Classes (comma separated)',
      experience: 'Years of experience',
      qualification: 'Qualification',
      schedule: 'Schedule',
      salary: 'Monthly salary'
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
          <p className="text-gray-500">Gérez le personnel enseignant de votre établissement</p>
        </div>
        <Button 
          onClick={() => setIsAddTeacherOpen(true)}
          className="bg-blue-600 hover:bg-blue-700"
          data-testid="button-add-teacher"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          {text.addTeacher}
        </Button>
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
                  <SelectItem value="Mathématiques">Mathématiques</SelectItem>
                  <SelectItem value="Français">Français</SelectItem>
                  <SelectItem value="Sciences">Sciences</SelectItem>
                  <SelectItem value="Histoire">Histoire</SelectItem>
                  <SelectItem value="Anglais">Anglais</SelectItem>
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
                  placeholder="Jean Dupont"
                  className="w-full"
                />
              </div>
              <div>
                <Label className="text-sm font-medium">{(text.form.email || '')}</Label>
                <Input
                  type="email"
                  value={teacherForm.email || ''}
                  onChange={(e) => setTeacherForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="jean.dupont@ecole.com"
                  className="w-full"
                />
              </div>
              <div>
                <Label className="text-sm font-medium">{text.form.phone}</Label>
                <Input
                  value={teacherForm.phone}
                  onChange={(e) => setTeacherForm(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+237 6XX XXX XXX"
                  className="w-full"
                />
              </div>
              <div>
                <Label className="text-sm font-medium">{text.form.subjects}</Label>
                <Input
                  value={teacherForm.subjects}
                  onChange={(e) => setTeacherForm(prev => ({ ...prev, subjects: e.target.value }))}
                  placeholder="Mathématiques, Physique"
                  className="w-full"
                />
              </div>
              <div>
                <Label className="text-sm font-medium">{text.form.classes}</Label>
                <Input
                  value={teacherForm.classes}
                  onChange={(e) => setTeacherForm(prev => ({ ...prev, classes: e.target.value }))}
                  placeholder="6ème A, 5ème B"
                  className="w-full"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">{text.form.experience}</Label>
                  <Input
                    type="number"
                    value={teacherForm.experience}
                    onChange={(e) => setTeacherForm(prev => ({ ...prev, experience: e.target.value }))}
                    placeholder="5"
                    className="w-full"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium">{text.form.salary}</Label>
                  <Input
                    type="number"
                    value={teacherForm.salary}
                    onChange={(e) => setTeacherForm(prev => ({ ...prev, salary: e.target.value }))}
                    placeholder="150000"
                    className="w-full"
                  />
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">{text.form.qualification}</Label>
                <Select 
                  value={teacherForm.qualification} 
                  onValueChange={(value) => setTeacherForm(prev => ({ ...prev, qualification: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une qualification" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Licence">Licence</SelectItem>
                    <SelectItem value="Master">Master</SelectItem>
                    <SelectItem value="Doctorat">Doctorat</SelectItem>
                    <SelectItem value="BEPC">BEPC</SelectItem>
                    <SelectItem value="Baccalauréat">Baccalauréat</SelectItem>
                  </SelectContent>
                </Select>
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
                <Label className="text-sm font-medium">{text.form.subjects}</Label>
                <Input
                  value={teacherForm.subjects}
                  onChange={(e) => setTeacherForm(prev => ({ ...prev, subjects: e.target.value }))}
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
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Exporter
              </Button>
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filtrer
              </Button>
            </div>
          </div>
        </CardHeader>
        
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
                        <span>📚 {teacher.subjects.join(', ')}</span>
                        <span>🎓 {teacher.qualification}</span>
                        <span>⏰ {teacher.experience} ans</span>
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
    </div>
  );
};

export default FunctionalDirectorTeacherManagement;