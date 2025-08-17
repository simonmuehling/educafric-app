import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Users, UserPlus, Calendar, BookOpen, BarChart3, 
  MessageSquare, Phone, Mail, MapPin, Edit, Eye
} from 'lucide-react';

const FreelancerStudentManagement: React.FC = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const [newStudentData, setNewStudentData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    grade: '',
    subjects: '',
    parentEmail: '',
    notes: ''
  });

  // Fetch students data from API
  const { data: students = [], isLoading } = useQuery<any[]>({
    queryKey: ['/api/freelancer/students'],
    enabled: !!user
  });

  // Add student mutation
  const addStudentMutation = useMutation({
    mutationFn: async (studentData: typeof newStudentData) => {
      const response = await fetch('/api/freelancer/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(studentData),
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to add student');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/freelancer/students'] });
      toast({
        title: language === 'fr' ? 'Étudiant ajouté' : 'Student Added',
        description: language === 'fr' ? 'L\'étudiant a été ajouté avec succès.' : 'Student has been added successfully.'
      });
      setIsAddingStudent(false);
      setNewStudentData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        grade: '',
        subjects: '',
        parentEmail: '',
        notes: ''
      });
    },
    onError: () => {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' ? 'Impossible d\'ajouter l\'étudiant.' : 'Failed to add student.',
        variant: 'destructive'
      });
    }
  });

  const text = {
    fr: {
      title: 'Gestion des Étudiants',
      subtitle: 'Gérez vos étudiants et leur progression',
      addStudent: 'Ajouter Étudiant',
      firstName: 'Prénom',
      lastName: 'Nom',
      email: 'Email',
      phone: 'Téléphone',
      grade: 'Classe',
      subjects: 'Matières',
      parentEmail: 'Email Parent',
      notes: 'Notes',
      viewProfile: 'Voir Profil',
      contactStudent: 'Contacter',
      scheduleLesson: 'Programmer Cours',
      viewProgress: 'Voir Progression',
      totalStudents: 'Total Étudiants',
      activeStudents: 'Étudiants Actifs',
      sessionsThisWeek: 'Sessions cette semaine',
      save: 'Sauvegarder',
      cancel: 'Annuler',
      adding: 'Ajout...',
      studentDetails: 'Détails de l\'étudiant'
    },
    en: {
      title: 'Student Management',
      subtitle: 'Manage your students and their progress',
      addStudent: 'Add Student',
      firstName: 'First Name',
      lastName: 'Last Name',
      email: 'Email',
      phone: 'Phone',
      grade: 'Grade',
      subjects: 'Subjects',
      parentEmail: 'Parent Email',
      notes: 'Notes',
      viewProfile: 'View Profile',
      contactStudent: 'Contact',
      scheduleLesson: 'Schedule Lesson',
      viewProgress: 'View Progress',
      totalStudents: 'Total Students',
      activeStudents: 'Active Students',
      sessionsThisWeek: 'Sessions this week',
      save: 'Save',
      cancel: 'Cancel',
      adding: 'Adding...',
      studentDetails: 'Student Details'
    }
  };

  const t = text[language as keyof typeof text];

  const handleAddStudent = () => {
    if (!newStudentData.firstName || !newStudentData.lastName || !newStudentData.email) {
      toast({
        title: language === 'fr' ? 'Champs requis' : 'Required Fields',
        description: language === 'fr' ? 'Veuillez remplir tous les champs obligatoires.' : 'Please fill in all required fields.',
        variant: 'destructive'
      });
      return;
    }
    addStudentMutation.mutate(newStudentData);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{language === 'fr' ? 'Chargement des étudiants...' : 'Loading students...'}</p>
        </div>
      </div>
    );
  }

  const totalStudents = (Array.isArray(students) ? (Array.isArray(students) ? students.length : 0) : 0);
  const activeStudents = (Array.isArray(students) ? students : []).filter((s: any) => s.status === 'active').length;
  const sessionsThisWeek = (Array.isArray(students) ? students : []).reduce((acc: number, s: any) => acc + (s.sessionsThisWeek || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">{t.title || ''}</h1>
            <p className="text-gray-600">{t.subtitle}</p>
          </div>
          <Dialog open={isAddingStudent} onOpenChange={setIsAddingStudent}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <UserPlus className="w-4 h-4 mr-2" />
                {t.addStudent}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl bg-white">
              <DialogHeader>
                <DialogTitle>{t.addStudent}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>{t.firstName || ''} *</Label>
                    <Input
                      value={newStudentData.firstName || ''}
                      onChange={(e) => setNewStudentData({...newStudentData, firstName: e?.target?.value})}
                    />
                  </div>
                  <div>
                    <Label>{t.lastName || ''} *</Label>
                    <Input
                      value={newStudentData.lastName || ''}
                      onChange={(e) => setNewStudentData({...newStudentData, lastName: e?.target?.value})}
                    />
                  </div>
                </div>
                <div>
                  <Label>{t.email || ''} *</Label>
                  <Input
                    type="email"
                    value={newStudentData.email || ''}
                    onChange={(e) => setNewStudentData({...newStudentData, email: e?.target?.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>{t.phone}</Label>
                    <Input
                      value={newStudentData.phone}
                      onChange={(e) => setNewStudentData({...newStudentData, phone: e?.target?.value})}
                    />
                  </div>
                  <div>
                    <Label>{t.grade}</Label>
                    <Input
                      value={newStudentData.grade}
                      onChange={(e) => setNewStudentData({...newStudentData, grade: e?.target?.value})}
                    />
                  </div>
                </div>
                <div>
                  <Label>{t.subjects}</Label>
                  <Input
                    value={newStudentData.subjects}
                    onChange={(e) => setNewStudentData({...newStudentData, subjects: e?.target?.value})}
                  />
                </div>
                <div>
                  <Label>{t.parentEmail}</Label>
                  <Input
                    type="email"
                    value={newStudentData.parentEmail}
                    onChange={(e) => setNewStudentData({...newStudentData, parentEmail: e?.target?.value})}
                  />
                </div>
                <div>
                  <Label>{t.notes}</Label>
                  <Textarea
                    value={newStudentData.notes}
                    onChange={(e) => setNewStudentData({...newStudentData, notes: e?.target?.value})}
                    rows={3}
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={handleAddStudent}
                    disabled={addStudentMutation.isPending}
                    className="flex-1"
                  >
                    {addStudentMutation.isPending ? t.adding : t.save}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsAddingStudent(false)}
                    className="flex-1"
                  >
                    {t.cancel}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t.totalStudents}</p>
                <p className="text-3xl font-bold text-gray-900">{totalStudents}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t.activeStudents}</p>
                <p className="text-3xl font-bold text-green-600">{activeStudents}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <BarChart3 className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t.sessionsThisWeek}</p>
                <p className="text-3xl font-bold text-purple-600">{sessionsThisWeek}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Students List */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {(Array.isArray(students) ? students : []).map((student: any) => (
            <Card key={student.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-gray-900 mb-2">
                      {student.firstName || ''} {student.lastName || ''}
                    </h3>
                    <div className="flex gap-2 mb-2">
                      <Badge className={student.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                        {student.status}
                      </Badge>
                      {student.grade && (
                        <Badge variant="outline">{student.grade}</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="w-4 h-4" />
                    <span className="truncate">{student.email || ''}</span>
                  </div>
                  {student.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4" />
                      <span>{student.phone}</span>
                    </div>
                  )}
                  {student.subjects && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <BookOpen className="w-4 h-4" />
                      <span className="truncate">{student.subjects}</span>
                    </div>
                  )}
                  
                  <div className="flex gap-2 pt-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedStudent(student)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          {t.viewProfile}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl bg-white">
                        <DialogHeader>
                          <DialogTitle>{t.studentDetails}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label className="text-sm font-medium">{t.firstName || ''}</Label>
                              <p className="text-sm text-gray-600">{student.firstName || ''}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium">{t.lastName || ''}</Label>
                              <p className="text-sm text-gray-600">{student.lastName || ''}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium">{t.email || ''}</Label>
                              <p className="text-sm text-gray-600">{student.email || ''}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium">{t.phone}</Label>
                              <p className="text-sm text-gray-600">{student.phone || 'N/A'}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium">{t.grade}</Label>
                              <p className="text-sm text-gray-600">{student.grade || 'N/A'}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium">{t.subjects}</Label>
                              <p className="text-sm text-gray-600">{student.subjects || 'N/A'}</p>
                            </div>
                          </div>
                          {student.notes && (
                            <div>
                              <Label className="text-sm font-medium">{t.notes}</Label>
                              <p className="text-sm text-gray-700 mt-1">{student.notes}</p>
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Button size="sm" variant="outline">
                      <MessageSquare className="w-4 h-4 mr-1" />
                      {t.contactStudent}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {(Array.isArray(students) ? (Array.isArray(students) ? students.length : 0) : 0) === 0 && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {language === 'fr' ? 'Aucun étudiant trouvé' : 'No students found'}
            </h3>
            <p className="text-gray-600 mb-4">
              {language === 'fr' 
                ? 'Commencez par ajouter vos premiers étudiants.' 
                : 'Start by adding your first students.'
              }
            </p>
            <Button onClick={() => setIsAddingStudent(true)}>
              <UserPlus className="w-4 h-4 mr-2" />
              {t.addStudent}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FreelancerStudentManagement;