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
  Eye, X, Mail, Phone, GraduationCap
} from 'lucide-react';

interface Student {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  className: string;
  level: string;
  age: number;
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  status: 'active' | 'suspended' | 'graduated';
  average: number;
  attendance: number;
}

const FunctionalDirectorStudentManagement: React.FC = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [isEditStudentOpen, setIsEditStudentOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [studentForm, setStudentForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    className: '',
    level: '',
    age: '',
    parentName: '',
    parentEmail: '',
    parentPhone: ''
  });

  // Fetch students data from PostgreSQL API
  const { data: students = [], isLoading } = useQuery<Student[]>({
    queryKey: ['/api/director/students'],
    enabled: !!user
  });

  // Create student mutation
  const createStudentMutation = useMutation({
    mutationFn: async (studentData: any) => {
      const response = await fetch('/api/director/student', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(studentData),
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to create student');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/director/students'] });
      setIsAddStudentOpen(false);
      setStudentForm({ firstName: '', lastName: '', email: '', className: '', level: '', age: '', parentName: '', parentEmail: '', parentPhone: '' });
      toast({
        title: 'Élève ajouté',
        description: 'L\'élève a été ajouté avec succès.'
      });
    },
    onError: () => {
      toast({
        title: 'Erreur',
        description: 'Impossible d\'ajouter l\'élève.',
        variant: 'destructive'
      });
    }
  });

  // Update student mutation
  const updateStudentMutation = useMutation({
    mutationFn: async (studentData: any) => {
      const response = await fetch(`/api/director/student/${studentData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(studentData),
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to update student');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/director/students'] });
      setIsEditStudentOpen(false);
      setSelectedStudent(null);
      toast({
        title: 'Élève modifié',
        description: 'L\'élève a été modifié avec succès.'
      });
    },
    onError: () => {
      toast({
        title: 'Erreur',
        description: 'Impossible de modifier l\'élève.',
        variant: 'destructive'
      });
    }
  });

  // Delete student mutation
  const deleteStudentMutation = useMutation({
    mutationFn: async (studentId: number) => {
      const response = await fetch(`/api/director/student/${studentId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to delete student');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/director/students'] });
      toast({
        title: 'Élève supprimé',
        description: 'L\'élève a été supprimé avec succès.'
      });
    },
    onError: () => {
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer l\'élève.',
        variant: 'destructive'
      });
    }
  });

  const handleCreateStudent = () => {
    createStudentMutation.mutate({
      ...studentForm,
      age: parseInt(studentForm.age) || 16
    });
  };

  const handleUpdateStudent = () => {
    if (selectedStudent) {
      updateStudentMutation.mutate({
        ...selectedStudent,
        ...studentForm
      });
    }
  };

  const handleEditStudent = (student: Student) => {
    setSelectedStudent(student);
    setStudentForm({
      firstName: student.firstName,
      lastName: student.lastName,
      email: student.email,
      className: student.className,
      level: student.level,
      age: student.age.toString(),
      parentName: student.parentName,
      parentEmail: student.parentEmail,
      parentPhone: student.parentPhone
    });
    setIsEditStudentOpen(true);
  };

  const handleDeleteStudent = (studentId: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet élève ?')) {
      deleteStudentMutation.mutate(studentId);
    }
  };

  const filteredStudents = Array.isArray(students) ? (Array.isArray(students) ? students : []).filter(student => {
    if (!student) return false;
    const firstName = student.firstName || '';
    const lastName = student.lastName || '';
    const email = student.email || '';
    const className = student.className || '';
    
    const matchesSearch = firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = selectedClass === 'all' || className === selectedClass;
    return matchesSearch && matchesClass;
  }) : [];

  const stats = {
    totalStudents: Array.isArray(students) ? (Array.isArray(students) ? students.length : 0) : 0,
    activeStudents: Array.isArray(students) ? (Array.isArray(students) ? students : []).filter(s => s && s.status === 'active').length : 0,
    averageGrade: Array.isArray(students) && students.length > 0 ? Math.round((Array.isArray(students) ? students : []).reduce((sum, s) => sum + (s.average || 0), 0) / (Array.isArray(students) ? students.length : 0) * 10) / 10 : 0,
    averageAttendance: Array.isArray(students) && students.length > 0 ? Math.round((Array.isArray(students) ? students : []).reduce((sum, s) => sum + (s.attendance || 0), 0) / (Array.isArray(students) ? students.length : 0)) : 0
  };

  const text = language === 'fr' ? {
    title: 'Gestion des Élèves',
    addStudent: 'Ajouter un Élève',
    editStudent: 'Modifier l\'Élève',
    search: 'Rechercher...',
    class: 'Classe',
    allClasses: 'Toutes les classes',
    stats: {
      total: 'Total Élèves',
      active: 'Élèves Actifs',
      average: 'Moyenne Générale',
      attendance: 'Présence Moyenne'
    },
    form: {
      firstName: 'Prénom',
      lastName: 'Nom',
      email: 'Email',
      className: 'Classe',
      level: 'Niveau',
      age: 'Âge',
      parentName: 'Nom du parent',
      parentEmail: 'Email parent',
      parentPhone: 'Téléphone parent'
    },
    status: {
      active: 'Actif',
      suspended: 'Suspendu',
      graduated: 'Diplômé'
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
    title: 'Student Management',
    addStudent: 'Add Student',
    editStudent: 'Edit Student',
    search: 'Search...',
    class: 'Class',
    allClasses: 'All classes',
    stats: {
      total: 'Total Students',
      active: 'Active Students',
      average: 'Average Grade',
      attendance: 'Average Attendance'
    },
    form: {
      firstName: 'First name',
      lastName: 'Last name',
      email: 'Email',
      className: 'Class',
      level: 'Level',
      age: 'Age',
      parentName: 'Parent name',
      parentEmail: 'Parent email',
      parentPhone: 'Parent phone'
    },
    status: {
      active: 'Active',
      suspended: 'Suspended',
      graduated: 'Graduated'
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
          <p className="text-gray-500">Gérez tous les élèves de votre établissement</p>
        </div>
        <Button 
          onClick={() => setIsAddStudentOpen(true)}
          className="bg-blue-600 hover:bg-blue-700"
          data-testid="button-add-student"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          {text.addStudent}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-full">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">{text.stats.total}</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalStudents}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-full">
                <GraduationCap className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">{text.stats.active}</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.activeStudents}</p>
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
                <p className="text-sm font-medium text-gray-500">{text.stats.average}</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.averageGrade}/20</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-full">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">{text.stats.attendance}</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.averageAttendance}%</p>
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
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue placeholder={text.class} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{text.allClasses}</SelectItem>
                  <SelectItem value="6ème A">6ème A</SelectItem>
                  <SelectItem value="6ème B">6ème B</SelectItem>
                  <SelectItem value="5ème A">5ème A</SelectItem>
                  <SelectItem value="5ème B">5ème B</SelectItem>
                  <SelectItem value="4ème A">4ème A</SelectItem>
                  <SelectItem value="3ème A">3ème A</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Student Modal */}
      {isAddStudentOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{text.addStudent}</h3>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setIsAddStudentOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">{(text.form.firstName || '')}</Label>
                  <Input
                    value={studentForm.firstName || ''}
                    onChange={(e) => setStudentForm(prev => ({ ...prev, firstName: e.target.value }))}
                    placeholder="Prénom"
                    className="w-full"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium">{(text.form.lastName || '')}</Label>
                  <Input
                    value={studentForm.lastName || ''}
                    onChange={(e) => setStudentForm(prev => ({ ...prev, lastName: e.target.value }))}
                    placeholder="Nom"
                    className="w-full"
                  />
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">{(text.form.email || '')}</Label>
                <Input
                  type="email"
                  value={studentForm.email || ''}
                  onChange={(e) => setStudentForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="eleve@exemple.com"
                  className="w-full"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">{text.form.className}</Label>
                  <Select 
                    value={studentForm.className} 
                    onValueChange={(value) => setStudentForm(prev => ({ ...prev, className: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Classe" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="6ème A">6ème A</SelectItem>
                      <SelectItem value="6ème B">6ème B</SelectItem>
                      <SelectItem value="5ème A">5ème A</SelectItem>
                      <SelectItem value="4ème A">4ème A</SelectItem>
                      <SelectItem value="3ème A">3ème A</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm font-medium">{text.form.age}</Label>
                  <Input
                    type="number"
                    value={studentForm.age}
                    onChange={(e) => setStudentForm(prev => ({ ...prev, age: e.target.value }))}
                    placeholder="16"
                    className="w-full"
                  />
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">{text.form.parentName}</Label>
                <Input
                  value={studentForm.parentName}
                  onChange={(e) => setStudentForm(prev => ({ ...prev, parentName: e.target.value }))}
                  placeholder="Nom du parent/tuteur"
                  className="w-full"
                />
              </div>
              <div>
                <Label className="text-sm font-medium">{text.form.parentEmail}</Label>
                <Input
                  type="email"
                  value={studentForm.parentEmail}
                  onChange={(e) => setStudentForm(prev => ({ ...prev, parentEmail: e.target.value }))}
                  placeholder="parent@exemple.com"
                  className="w-full"
                />
              </div>
              <div>
                <Label className="text-sm font-medium">{text.form.parentPhone}</Label>
                <Input
                  value={studentForm.parentPhone}
                  onChange={(e) => setStudentForm(prev => ({ ...prev, parentPhone: e.target.value }))}
                  placeholder="+237 6XX XXX XXX"
                  className="w-full"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={handleCreateStudent}
                  disabled={createStudentMutation.isPending || !studentForm.firstName || !studentForm.lastName}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  data-testid="button-confirm-add-student"
                >
                  {createStudentMutation.isPending ? 'Ajout...' : text.buttons.create}
                </Button>
                <Button 
                  onClick={() => setIsAddStudentOpen(false)}
                  variant="outline"
                  data-testid="button-cancel-add-student"
                >
                  {text.buttons.cancel}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Student Modal */}
      {isEditStudentOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{text.editStudent}</h3>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setIsEditStudentOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">{(text.form.firstName || '')}</Label>
                  <Input
                    value={studentForm.firstName || ''}
                    onChange={(e) => setStudentForm(prev => ({ ...prev, firstName: e.target.value }))}
                    className="w-full"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium">{(text.form.lastName || '')}</Label>
                  <Input
                    value={studentForm.lastName || ''}
                    onChange={(e) => setStudentForm(prev => ({ ...prev, lastName: e.target.value }))}
                    className="w-full"
                  />
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">{(text.form.email || '')}</Label>
                <Input
                  type="email"
                  value={studentForm.email || ''}
                  onChange={(e) => setStudentForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full"
                />
              </div>
              <div>
                <Label className="text-sm font-medium">{text.form.className}</Label>
                <Select 
                  value={studentForm.className} 
                  onValueChange={(value) => setStudentForm(prev => ({ ...prev, className: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="6ème A">6ème A</SelectItem>
                    <SelectItem value="6ème B">6ème B</SelectItem>
                    <SelectItem value="5ème A">5ème A</SelectItem>
                    <SelectItem value="4ème A">4ème A</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={handleUpdateStudent}
                  disabled={updateStudentMutation.isPending}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  data-testid="button-confirm-edit-student"
                >
                  {updateStudentMutation.isPending ? 'Modification...' : text.buttons.update}
                </Button>
                <Button 
                  onClick={() => setIsEditStudentOpen(false)}
                  variant="outline"
                  data-testid="button-cancel-edit-student"
                >
                  {text.buttons.cancel}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Students List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Liste des Élèves</h3>
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
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun élève trouvé</h3>
              <p className="text-gray-500">Ajoutez votre premier élève pour commencer.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {(Array.isArray(filteredStudents) ? filteredStudents : []).map((student) => (
                <div key={student.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className="font-medium">{student.firstName || ''} {student.lastName || ''}</div>
                        <Badge variant={student.status === 'active' ? 'default' : 'secondary'}>
                          {text.status[student.status]}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                        <span>🎓 {student.className}</span>
                        <span>📊 {student.average}/20</span>
                        <span>📅 {student.attendance}%</span>
                        <span>👨‍👩‍👧 {student.parentName}</span>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                        <span>📧 {student.email || ''}</span>
                        <span>📱 {student.parentPhone}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditStudent(student)}
                        data-testid={`button-edit-student-${student.id}`}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleDeleteStudent(student.id)}
                        className="text-red-600 hover:text-red-700"
                        data-testid={`button-delete-student-${student.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
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

export default FunctionalDirectorStudentManagement;