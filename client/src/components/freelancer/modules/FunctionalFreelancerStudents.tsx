import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import MobileActionsOverlay from '@/components/mobile/MobileActionsOverlay';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, TrendingUp, AlertTriangle, Phone,
  Plus, Search, Filter, Eye, Edit,
  Calendar, BookOpen, GraduationCap, Star,
  Mail, Download, UserCheck, FileText, Clock
} from 'lucide-react';

interface FreelancerStudent {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  grade: string;
  schoolName: string;
  averageGrade: number;
  attendanceRate: number;
  status: string;
  lastSession: string;
  totalSessions: number;
  nextSession: string;
}

const FunctionalFreelancerStudents: React.FC = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Fetch freelancer students data from PostgreSQL API
  const { data: students = [], isLoading } = useQuery<FreelancerStudent[]>({
    queryKey: ['/api/freelancer/students'],
    enabled: !!user
  });

  const text = {
    fr: {
      title: 'Mes Élèves',
      subtitle: 'Gérez vos élèves en cours particuliers et suivez leurs progrès',
      loading: 'Chargement des élèves...',
      noData: 'Aucun élève assigné',
      stats: {
        totalStudents: 'Élèves Totaux',
        activeStudents: 'Actifs',
        avgGrade: 'Moyenne Générale',
        needsAttention: 'Aide Requise'
      },
      status: {
        good: 'Bon niveau',
        needs_attention: 'Aide requise',
        excellent: 'Excellent'
      },
      actions: {
        addStudent: 'Ajouter Élève',
        viewProgress: 'Voir Progrès',
        scheduleSession: 'Programmer Séance',
        contact: 'Contacter',
        viewDetails: 'Détails'
      },
      filters: {
        all: 'Tous',
        good: 'Bon niveau',
        needs_attention: 'Aide requise',
        recent: 'Récents'
      },
      student: {
        grade: 'Classe',
        school: 'École',
        phone: 'Téléphone',
        avgGrade: 'Moyenne',
        attendance: 'Assiduité',
        lastSession: 'Dernière séance',
        nextSession: 'Prochaine séance',
        totalSessions: 'Total séances'
      }
    },
    en: {
      title: 'My Students',
      subtitle: 'Manage your tutoring students and track their progress',
      loading: 'Loading students...',
      noData: 'No students assigned',
      stats: {
        totalStudents: 'Total Students',
        activeStudents: 'Active',
        avgGrade: 'Average Grade',
        needsAttention: 'Need Help'
      },
      status: {
        good: 'Good level',
        needs_attention: 'Needs help',
        excellent: 'Excellent'
      },
      actions: {
        addStudent: 'Add Student',
        viewProgress: 'View Progress',
        scheduleSession: 'Schedule Session',
        contact: 'Contact',
        viewDetails: 'Details'
      },
      filters: {
        all: 'All',
        good: 'Good level',
        needs_attention: 'Needs help',
        recent: 'Recent'
      },
      student: {
        grade: 'Grade',
        school: 'School',
        phone: 'Phone',
        avgGrade: 'Average',
        attendance: 'Attendance',
        lastSession: 'Last session',
        nextSession: 'Next session',
        totalSessions: 'Total sessions'
      }
    }
  };

  const t = text[language as keyof typeof text];

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">{t.loading}</span>
        </div>
      </div>
    );
  }

  // Filter and search students
  const filteredStudents = (Array.isArray(students) ? students : []).filter(student => {
    if (!student) return false;
    const matchesFilter = selectedFilter === 'all' || student.status === selectedFilter;
    const matchesSearch = student?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Calculate statistics
  const totalStudents = (Array.isArray(students) ? (Array.isArray(students) ? students.length : 0) : 0);
  const activeStudents = (Array.isArray(students) ? students : []).filter(s => s.status === 'good').length;
  const avgGrade = (Array.isArray(students) ? (Array.isArray(students) ? students.length : 0) : 0) > 0 
    ? Math.round((Array.isArray(students) ? students : []).reduce((sum, s) => sum + s.averageGrade, 0) / (Array.isArray(students) ? (Array.isArray(students) ? students.length : 0) : 0))
    : 0;
  const needsAttention = (Array.isArray(students) ? students : []).filter(s => s.status === 'needs_attention').length;

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      good: 'bg-green-100 text-green-800',
      needs_attention: 'bg-orange-100 text-orange-800',
      excellent: 'bg-blue-100 text-blue-800'
    };

    return (
      <Badge className={variants[status] || 'bg-gray-100 text-gray-800'}>
        {t.status[status as keyof typeof t.status]}
      </Badge>
    );
  };

  const getGradeColor = (grade: number) => {
    if (grade >= 16) return 'text-green-600';
    if (grade >= 12) return 'text-blue-600';
    if (grade >= 10) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t.title || ''}</h1>
          <p className="text-gray-600 mt-1">{t.subtitle}</p>
        </div>
        <Button 
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => {
            toast({
              title: language === 'fr' ? 'Ajouter un élève' : 'Add Student',
              description: language === 'fr' ? 'Formulaire d\'ajout d\'élève ouvert' : 'Add student form opened'
            });
          }}
          data-testid="button-add-student"
        >
          <Plus className="w-4 h-4 mr-2" />
          {t?.actions?.addStudent}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">{t?.stats?.totalStudents}</p>
                <p className="text-2xl font-bold">{totalStudents}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">{t?.stats?.activeStudents}</p>
                <p className="text-2xl font-bold text-green-600">{activeStudents}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Star className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">{t?.stats?.avgGrade}</p>
                <p className="text-2xl font-bold text-yellow-600">{avgGrade}/20</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">{t?.stats?.needsAttention}</p>
                <p className="text-2xl font-bold text-red-600">{needsAttention}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions - Mobile Optimized */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            {language === 'fr' ? 'Actions Rapides' : 'Quick Actions'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <MobileActionsOverlay
            title={language === 'fr' ? 'Actions Élèves' : 'Student Actions'}
            maxVisibleButtons={3}
            actions={[
              {
                id: 'add-student',
                label: language === 'fr' ? 'Ajouter Élève' : 'Add Student',
                icon: <UserCheck className="w-5 h-5" />,
                onClick: async () => {
                  console.log('[FREELANCER_STUDENTS] 👤 Adding new student...');
                  try {
                    // Mock student data for demo
                    const studentData = {
                      firstName: 'Nouveau',
                      lastName: 'Élève',
                      level: 'Seconde',
                      subject: 'Mathématiques',
                      parentContact: '+237 6 90 000 000'
                    };
                    
                    const response = await fetch('/api/freelancer/students', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      credentials: 'include',
                      body: JSON.stringify({ studentData })
                    });
                    
                    const result = await response.json();
                    
                    if (response.ok) {
                      toast({
                        title: language === 'fr' ? 'Élève ajouté' : 'Student Added',
                        description: language === 'fr' ? `${studentData.firstName} ${studentData.lastName} ajouté avec succès` : `${studentData.firstName} ${studentData.lastName} added successfully`
                      });
                    } else {
                      throw new Error(result.message);
                    }
                  } catch (error) {
                    console.error('[FREELANCER_STUDENTS] Error adding student:', error);
                    toast({
                      title: language === 'fr' ? 'Erreur' : 'Error',
                      description: language === 'fr' ? 'Impossible d\'ajouter l\'élève' : 'Unable to add student',
                      variant: 'destructive'
                    });
                  }
                },
                color: 'bg-blue-600 hover:bg-blue-700'
              },
              {
                id: 'schedule-session',
                label: language === 'fr' ? 'Programmer Cours' : 'Schedule Session',
                icon: <Clock className="w-5 h-5" />,
                onClick: async () => {
                  console.log('[FREELANCER_STUDENTS] 📅 Scheduling session...');
                  try {
                    // Mock session data for demo
                    const sessionData = {
                      studentId: 1,
                      date: '2025-08-15',
                      time: '14:00',
                      duration: 60,
                      subject: 'Mathématiques'
                    };
                    
                    const response = await fetch('/api/freelancer/sessions', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      credentials: 'include',
                      body: JSON.stringify(sessionData)
                    });
                    
                    const result = await response.json();
                    
                    if (response.ok) {
                      toast({
                        title: language === 'fr' ? 'Séance programmée' : 'Session Scheduled',
                        description: language === 'fr' ? `Séance du ${sessionData.date} à ${sessionData.time}` : `Session for ${sessionData.date} at ${sessionData.time}`
                      });
                    } else {
                      throw new Error(result.message);
                    }
                  } catch (error) {
                    console.error('[FREELANCER_STUDENTS] Error scheduling session:', error);
                    toast({
                      title: language === 'fr' ? 'Erreur' : 'Error',
                      description: language === 'fr' ? 'Impossible de programmer la séance' : 'Unable to schedule session',
                      variant: 'destructive'
                    });
                  }
                },
                color: 'bg-green-600 hover:bg-green-700'
              },
              {
                id: 'send-progress-report',
                label: language === 'fr' ? 'Rapport Progrès' : 'Progress Report',
                icon: <FileText className="w-5 h-5" />,
                onClick: () => {
                  toast({
                    title: language === 'fr' ? 'Rapport de Progrès' : 'Progress Report',
                    description: language === 'fr' ? 'Génération rapport en cours' : 'Generating progress report',
                  });
                },
                color: 'bg-purple-600 hover:bg-purple-700'
              },
              {
                id: 'contact-parents',
                label: language === 'fr' ? 'Contacter Parents' : 'Contact Parents',
                icon: <Mail className="w-5 h-5" />,
                onClick: () => {
                  toast({
                    title: language === 'fr' ? 'Communications' : 'Communications',
                    description: language === 'fr' ? 'Module de communication parents ouvert' : 'Parent communication module opened',
                  });
                },
                color: 'bg-orange-600 hover:bg-orange-700'
              },
              {
                id: 'export-students',
                label: language === 'fr' ? 'Exporter Liste' : 'Export List',
                icon: <Download className="w-5 h-5" />,
                onClick: () => {
                  const csvContent = [
                    ['Nom,Email,Niveau,Moyenne,Statut,Prochaine_Session'],
                    ...(Array.isArray(students) ? students : []).map(student => [
                      student.fullName,
                      student.email,
                      student.grade,
                      student.averageGrade,
                      student.status,
                      student.nextSession
                    ].join(','))
                  ].join('\n');
                  
                  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                  const link = document.createElement('a');
                  const url = URL.createObjectURL(blob);
                  link.setAttribute('href', url);
                  link.setAttribute('download', `eleves_freelancer_${new Date().toISOString().split('T')[0]}.csv`);
                  if (link.style) {
                    link.style.visibility = 'hidden';
                  }
                  if (document.body) {
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }
                  
                  toast({
                    title: language === 'fr' ? 'Export terminé' : 'Export completed',
                    description: language === 'fr' ? 'Liste des élèves exportée' : 'Student list exported',
                  });
                },
                color: 'bg-teal-600 hover:bg-teal-700'
              }
            ]}
          />
        </CardContent>
      </Card>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Liste des Élèves</h3>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <Search className="w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Rechercher un élève..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e?.target?.value)}
                  className="border rounded-md px-3 py-1 text-sm w-64"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <select
                  value={selectedFilter}
                  onChange={(e) => setSelectedFilter(e?.target?.value)}
                  className="border rounded-md px-3 py-1 text-sm"
                >
                  <option value="all">{t?.filters?.all}</option>
                  <option value="good">{t?.filters?.good}</option>
                  <option value="needs_attention">{t?.filters?.needs_attention}</option>
                </select>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {(Array.isArray(filteredStudents) ? filteredStudents.length : 0) === 0 ? (
            <div className="text-center py-8">
              <GraduationCap className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">{t.noData}</h3>
              <p className="text-gray-600">Aucun élève ne correspond à vos critères de recherche.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {(Array.isArray(filteredStudents) ? filteredStudents : []).map((student) => (
                <Card key={student.id} className="border hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="p-2 bg-blue-100 rounded-full">
                            <Users className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="text-lg font-semibold text-gray-900">{student.fullName}</h4>
                            <p className="text-sm text-gray-600">{student.email || ''}</p>
                          </div>
                          {getStatusBadge(student.status)}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-gray-500">{t?.student?.grade}</p>
                            <p className="font-medium">{student.grade}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">{t?.student?.school}</p>
                            <p className="font-medium">{student.schoolName}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">{t?.student?.avgGrade}</p>
                            <p className={`font-medium ${getGradeColor(student.averageGrade)}`}>
                              {student.averageGrade}/20
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">{t?.student?.attendance}</p>
                            <p className="font-medium">{student.attendanceRate}%</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2" />
                            <span>Dernière séance: {new Date(student.lastSession).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center">
                            <BookOpen className="w-4 h-4 mr-2" />
                            <span>Total: {student.totalSessions} séances</span>
                          </div>
                          <div className="flex items-center">
                            <Phone className="w-4 h-4 mr-2" />
                            <span>{student.phone || 'Non renseigné'}</span>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              toast({
                                title: language === 'fr' ? 'Progrès de l\'élève' : 'Student Progress',
                                description: language === 'fr' ? `Affichage des progrès de ${student.fullName}` : `Showing progress for ${student.fullName}`
                              });
                            }}
                            data-testid={`button-view-progress-${student.id}`}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            {t?.actions?.viewProgress}
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              toast({
                                title: language === 'fr' ? 'Programmer une séance' : 'Schedule Session',
                                description: language === 'fr' ? `Planification d'une séance avec ${student.fullName}` : `Scheduling session with ${student.fullName}`
                              });
                            }}
                            data-testid={`button-schedule-session-${student.id}`}
                          >
                            <Calendar className="w-4 h-4 mr-2" />
                            {t?.actions?.scheduleSession}
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              toast({
                                title: language === 'fr' ? 'Contacter l\'élève' : 'Contact Student',
                                description: language === 'fr' ? `Message envoyé à ${student.fullName}` : `Message sent to ${student.fullName}`
                              });
                            }}
                            data-testid={`button-contact-${student.id}`}
                          >
                            <Phone className="w-4 h-4 mr-2" />
                            {t?.actions?.contact}
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              toast({
                                title: language === 'fr' ? 'Modifier l\'élève' : 'Edit Student',
                                description: language === 'fr' ? `Modification des informations de ${student.fullName}` : `Editing information for ${student.fullName}`
                              });
                            }}
                            data-testid={`button-edit-${student.id}`}
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Modifier
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FunctionalFreelancerStudents;