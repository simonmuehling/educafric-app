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
  Plus, Search, Filter, Eye, MessageCircle,
  Calendar, BookOpen, GraduationCap, Star, MapPin,
  Mail, Download, UserCheck, FileText
} from 'lucide-react';

interface ParentChild {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  grade: string;
  className: string;
  schoolName: string;
  averageGrade: number;
  attendanceRate: number;
  status: string;
  lastActivity: string;
  nextExam: string;
  behavior: string;
  profilePhoto: string;
  teacherName: string;
}

const FunctionalParentChildren: React.FC = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Fetch parent children data from PostgreSQL API
  const { data: children = [], isLoading } = useQuery<ParentChild[]>({
    queryKey: ['/api/parent/children'],
    enabled: !!user
  });

  const text = {
    fr: {
      title: 'Mes Enfants',
      subtitle: 'Suivez les progrès scolaires de vos enfants',
      loading: 'Chargement des enfants...',
      noData: 'Aucun enfant assigné',
      stats: {
        totalChildren: 'Enfants Totaux',
        excellentGrades: 'Excellents',
        avgGrade: 'Moyenne Générale',
        needsAttention: 'Aide Requise'
      },
      status: {
        excellent: 'Excellent',
        good: 'Bon niveau',
        needs_attention: 'Aide requise',
        absent: 'Absent'
      },
      behavior: {
        excellent: 'Excellent',
        good: 'Bon',
        satisfactory: 'Satisfaisant',
        needs_improvement: 'À améliorer'
      },
      actions: {
        viewProgress: 'Voir Progrès',
        contactTeacher: 'Contacter Enseignant',
        viewGrades: 'Voir Notes',
        viewAttendance: 'Voir Présences',
        sendMessage: 'Message École'
      },
      filters: {
        all: 'Tous',
        excellent: 'Excellents',
        good: 'Bon niveau',
        needs_attention: 'Aide requise'
      },
      child: {
        grade: 'Classe',
        school: 'École',
        teacher: 'Enseignant',
        avgGrade: 'Moyenne',
        attendance: 'Assiduité',
        lastActivity: 'Dernière activité',
        nextExam: 'Prochain examen',
        behavior: 'Comportement'
      }
    },
    en: {
      title: 'My Children',
      subtitle: 'Track your children\'s academic progress',
      loading: 'Loading children...',
      noData: 'No children assigned',
      stats: {
        totalChildren: 'Total Children',
        excellentGrades: 'Excellent',
        avgGrade: 'Average Grade',
        needsAttention: 'Need Help'
      },
      status: {
        excellent: 'Excellent',
        good: 'Good level',
        needs_attention: 'Needs help',
        absent: 'Absent'
      },
      behavior: {
        excellent: 'Excellent',
        good: 'Good',
        satisfactory: 'Satisfactory',
        needs_improvement: 'Needs improvement'
      },
      actions: {
        viewProgress: 'View Progress',
        contactTeacher: 'Contact Teacher',
        viewGrades: 'View Grades',
        viewAttendance: 'View Attendance',
        sendMessage: 'Message School'
      },
      filters: {
        all: 'All',
        excellent: 'Excellent',
        good: 'Good level',
        needs_attention: 'Needs help'
      },
      child: {
        grade: 'Grade',
        school: 'School',
        teacher: 'Teacher',
        avgGrade: 'Average',
        attendance: 'Attendance',
        lastActivity: 'Last activity',
        nextExam: 'Next exam',
        behavior: 'Behavior'
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

  // Filter and search children
  const filteredChildren = (Array.isArray(children) ? children : []).filter(child => {
    if (!child) return false;
    const matchesFilter = selectedFilter === 'all' || child.status === selectedFilter;
    const matchesSearch = child?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         child?.className?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Calculate statistics
  const totalChildren = (Array.isArray(children) ? children.length : 0);
  const excellentChildren = (Array.isArray(children) ? children : []).filter(c => c.status === 'excellent').length;
  const avgGrade = (Array.isArray(children) ? children.length : 0) > 0 
    ? Math.round((Array.isArray(children) ? children : []).reduce((sum, c) => sum + c.averageGrade, 0) / (Array.isArray(children) ? children.length : 0))
    : 0;
  const needsAttention = (Array.isArray(children) ? children : []).filter(c => c.status === 'needs_attention').length;

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      excellent: 'bg-green-100 text-green-800',
      good: 'bg-blue-100 text-blue-800',
      needs_attention: 'bg-orange-100 text-orange-800',
      absent: 'bg-red-100 text-red-800'
    };

    return (
      <Badge className={variants[status] || 'bg-gray-100 text-gray-800'}>
        {t.status[status as keyof typeof t.status]}
      </Badge>
    );
  };

  const getBehaviorBadge = (behavior: string) => {
    const variants: Record<string, string> = {
      excellent: 'bg-green-100 text-green-800',
      good: 'bg-blue-100 text-blue-800',
      satisfactory: 'bg-yellow-100 text-yellow-800',
      needs_improvement: 'bg-red-100 text-red-800'
    };

    return (
      <Badge variant="outline" className={variants[behavior] || 'bg-gray-100 text-gray-800'}>
        {t.behavior[behavior as keyof typeof t.behavior]}
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
                <p className="text-sm text-gray-600">{t?.stats?.totalChildren}</p>
                <p className="text-2xl font-bold">{totalChildren}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Star className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">{t?.stats?.excellentGrades}</p>
                <p className="text-2xl font-bold text-green-600">{excellentChildren}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">{t?.stats?.avgGrade}</p>
                <p className="text-2xl font-bold text-purple-600">{avgGrade}/20</p>
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
            title={language === 'fr' ? 'Actions Enfants' : 'Children Actions'}
            maxVisibleButtons={3}
            actions={[
              {
                id: 'view-all-grades',
                label: language === 'fr' ? 'Toutes les Notes' : 'All Grades',
                icon: <FileText className="w-5 h-5" />,
                onClick: () => {
                  console.log('[PARENT_QUICK_ACTION] Fetching all grades...');
                  // Call API to get all grades then navigate
                  fetch('/api/parent/grades', {
                    method: 'GET',
                    credentials: 'include'
                  }).then(async response => {
                    const gradesData = await response.json();
                    console.log('[PARENT_QUICK_ACTION] Grades data received:', (Array.isArray(gradesData) ? gradesData.length : 0), 'items');
                    window.dispatchEvent(new CustomEvent('switchToGrades'));
                    toast({
                      title: language === 'fr' ? 'Notes chargées' : 'Grades loaded',
                      description: language === 'fr' ? `${(Array.isArray(gradesData) ? gradesData.length : 0)} notes trouvées` : `${(Array.isArray(gradesData) ? gradesData.length : 0)} grades found`,
                    });
                  }).catch(error => {
                    console.error('[PARENT_QUICK_ACTION] Grades fetch error:', error);
                    toast({
                      title: language === 'fr' ? 'Erreur' : 'Error',
                      description: language === 'fr' ? 'Impossible de charger les notes' : 'Unable to load grades',
                      variant: 'destructive'
                    });
                  });
                },
                color: 'bg-blue-600 hover:bg-blue-700'
              },
              {
                id: 'check-attendance',
                label: language === 'fr' ? 'Vérifier Présences' : 'Check Attendance',
                icon: <UserCheck className="w-5 h-5" />,
                onClick: () => {
                  console.log('[PARENT_QUICK_ACTION] Fetching attendance data...');
                  // Call API to get attendance data then navigate
                  fetch('/api/parent/attendance', {
                    method: 'GET',
                    credentials: 'include'
                  }).then(async response => {
                    const attendanceData = await response.json();
                    console.log('[PARENT_QUICK_ACTION] Attendance data received:', (Array.isArray(attendanceData) ? attendanceData.length : 0), 'records');
                    window.dispatchEvent(new CustomEvent('switchToAttendance'));
                    toast({
                      title: language === 'fr' ? 'Présences chargées' : 'Attendance loaded',
                      description: language === 'fr' ? `${(Array.isArray(attendanceData) ? attendanceData.length : 0)} enregistrements trouvés` : `${(Array.isArray(attendanceData) ? attendanceData.length : 0)} records found`,
                    });
                  }).catch(error => {
                    console.error('[PARENT_QUICK_ACTION] Attendance fetch error:', error);
                    toast({
                      title: language === 'fr' ? 'Erreur' : 'Error',
                      description: language === 'fr' ? 'Impossible de charger les présences' : 'Unable to load attendance',
                      variant: 'destructive'
                    });
                  });
                },
                color: 'bg-green-600 hover:bg-green-700'
              },
              {
                id: 'send-message',
                label: language === 'fr' ? 'Message École' : 'Message School',
                icon: <Mail className="w-5 h-5" />,
                onClick: () => {
                  console.log('[PARENT_QUICK_ACTION] Fetching messages data...');
                  // Call API to get messages data then navigate
                  fetch('/api/parent/messages', {
                    method: 'GET',
                    credentials: 'include'
                  }).then(async response => {
                    const messagesData = await response.json();
                    console.log('[PARENT_QUICK_ACTION] Messages data received:', (Array.isArray(messagesData) ? messagesData.length : 0), 'messages');
                    window.dispatchEvent(new CustomEvent('switchToMessages'));
                    toast({
                      title: language === 'fr' ? 'Messages chargés' : 'Messages loaded',
                      description: language === 'fr' ? `${(Array.isArray(messagesData) ? messagesData.length : 0)} messages trouvés` : `${(Array.isArray(messagesData) ? messagesData.length : 0)} messages found`,
                    });
                  }).catch(error => {
                    console.error('[PARENT_QUICK_ACTION] Messages fetch error:', error);
                    toast({
                      title: language === 'fr' ? 'Erreur' : 'Error',
                      description: language === 'fr' ? 'Impossible de charger les messages' : 'Unable to load messages',
                      variant: 'destructive'
                    });
                  });
                },
                color: 'bg-purple-600 hover:bg-purple-700'
              },
              {
                id: 'export-children',
                label: language === 'fr' ? 'Exporter Données' : 'Export Data',
                icon: <Download className="w-5 h-5" />,
                onClick: () => {
                  const csvContent = [
                    ['Nom,Prenom,Classe,Ecole,Moyenne,Assiduite,Statut'],
                    ...(Array.isArray(children) ? children : []).map(child => [
                      child.lastName,
                      child.firstName,
                      child.className,
                      child.schoolName,
                      child.averageGrade,
                      child.attendanceRate,
                      child.status
                    ].join(','))
                  ].join('\n');
                  
                  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                  const link = document.createElement('a');
                  const url = URL.createObjectURL(blob);
                  link.setAttribute('href', url);
                  link.setAttribute('download', `enfants_${new Date().toISOString().split('T')[0]}.csv`);
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
                    description: language === 'fr' ? 'Données enfants exportées' : 'Children data exported',
                  });
                },
                color: 'bg-orange-600 hover:bg-orange-700'
              }
            ]}
          />
        </CardContent>
      </Card>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Liste des Enfants</h3>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <Search className="w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Rechercher un enfant..."
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
                  <option value="excellent">{t?.filters?.excellent}</option>
                  <option value="good">{t?.filters?.good}</option>
                  <option value="needs_attention">{t?.filters?.needs_attention}</option>
                </select>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {(Array.isArray(filteredChildren) ? filteredChildren.length : 0) === 0 ? (
            <div className="text-center py-8">
              <GraduationCap className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">{t.noData}</h3>
              <p className="text-gray-600">Aucun enfant ne correspond à vos critères de recherche.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {(Array.isArray(filteredChildren) ? filteredChildren : []).map((child) => (
                <Card key={child.id} className="border hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                          {child.firstName[0]}{child.lastName[0]}
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="text-lg font-semibold text-gray-900">{child.fullName}</h4>
                            <p className="text-sm text-gray-600">{child.className} - {child.schoolName}</p>
                          </div>
                          <div className="flex flex-col space-y-1">
                            {getStatusBadge(child.status)}
                            {getBehaviorBadge(child.behavior)}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-gray-500">{t?.child?.teacher}</p>
                            <p className="font-medium">{child.teacherName}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">{t?.child?.avgGrade}</p>
                            <p className={`font-medium text-lg ${getGradeColor(child.averageGrade)}`}>
                              {child.averageGrade}/20
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">{t?.child?.attendance}</p>
                            <p className="font-medium">{child.attendanceRate}%</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">{t?.child?.nextExam}</p>
                            <p className="font-medium">{new Date(child.nextExam).toLocaleDateString()}</p>
                          </div>
                        </div>

                        <div className="mb-4 text-sm text-gray-600">
                          <div className="flex items-center mb-1">
                            <Calendar className="w-4 h-4 mr-2" />
                            <span>Dernière activité: {new Date(child.lastActivity).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-2" />
                            <span>{child.schoolName}</span>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              console.log(`[PARENT_CHILD_ACTION] View progress for child ${child.id}`);
                              // Call API to get detailed progress
                              fetch(`/api/parent/children/${child.id}/progress`, {
                                method: 'GET',
                                credentials: 'include'
                              }).then(response => {
                                if (response.ok) {
                                  window.dispatchEvent(new CustomEvent('switchToGrades'));
                                  toast({
                                    title: language === 'fr' ? 'Progrès de ' + child.firstName : child.firstName + ' Progress',
                                    description: language === 'fr' ? 'Affichage des détails de progression' : 'Showing progress details',
                                  });
                                }
                              }).catch(error => {
                                console.error('[PARENT_CHILD_ACTION] Progress fetch error:', error);
                                toast({
                                  title: language === 'fr' ? 'Erreur' : 'Error',
                                  description: language === 'fr' ? 'Impossible de charger les progrès' : 'Unable to load progress',
                                  variant: 'destructive'
                                });
                              });
                            }}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            {t?.actions?.viewProgress}
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              console.log(`[PARENT_CHILD_ACTION] View grades for child ${child.id}`);
                              // Call API to get child's grades
                              fetch(`/api/parent/children/${child.id}/grades`, {
                                method: 'GET',
                                credentials: 'include'
                              }).then(response => {
                                if (response.ok) {
                                  window.dispatchEvent(new CustomEvent('switchToGrades'));
                                  toast({
                                    title: language === 'fr' ? 'Notes de ' + child.firstName : child.firstName + ' Grades',
                                    description: language === 'fr' ? 'Affichage des notes détaillées' : 'Showing detailed grades',
                                  });
                                }
                              }).catch(error => {
                                console.error('[PARENT_CHILD_ACTION] Grades fetch error:', error);
                                toast({
                                  title: language === 'fr' ? 'Erreur' : 'Error',
                                  description: language === 'fr' ? 'Impossible de charger les notes' : 'Unable to load grades',
                                  variant: 'destructive'
                                });
                              });
                            }}
                          >
                            <BookOpen className="w-4 h-4 mr-2" />
                            {t?.actions?.viewGrades}
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              console.log(`[PARENT_CHILD_ACTION] Contact teacher for child ${child.id}`);
                              // Call API to send message to teacher
                              fetch(`/api/parent/children/${child.id}/contact-teacher`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                  subject: language === 'fr' ? `Demande de contact - ${child.firstName || ''}` : `Contact request - ${child.firstName || ''}`,
                                  message: language === 'fr' ? 'Demande de contact avec l\'enseignant' : 'Request to contact teacher'
                                }),
                                credentials: 'include'
                              }).then(response => {
                                if (response.ok) {
                                  window.dispatchEvent(new CustomEvent('switchToMessages'));
                                  toast({
                                    title: language === 'fr' ? 'Message envoyé' : 'Message sent',
                                    description: language === 'fr' ? 'Demande envoyée à l\'enseignant' : 'Request sent to teacher',
                                  });
                                }
                              }).catch(error => {
                                console.error('[PARENT_CHILD_ACTION] Contact teacher error:', error);
                                toast({
                                  title: language === 'fr' ? 'Erreur' : 'Error',
                                  description: language === 'fr' ? 'Impossible d\'envoyer le message' : 'Unable to send message',
                                  variant: 'destructive'
                                });
                              });
                            }}
                          >
                            <MessageCircle className="w-4 h-4 mr-2" />
                            {t?.actions?.contactTeacher}
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              console.log(`[PARENT_CHILD_ACTION] View attendance for child ${child.id}`);
                              // Call API to get child's attendance
                              fetch(`/api/parent/children/${child.id}/attendance`, {
                                method: 'GET',
                                credentials: 'include'
                              }).then(response => {
                                if (response.ok) {
                                  window.dispatchEvent(new CustomEvent('switchToAttendance'));
                                  toast({
                                    title: language === 'fr' ? 'Présences de ' + child.firstName : child.firstName + ' Attendance',
                                    description: language === 'fr' ? 'Affichage des présences détaillées' : 'Showing detailed attendance',
                                  });
                                }
                              }).catch(error => {
                                console.error('[PARENT_CHILD_ACTION] Attendance fetch error:', error);
                                toast({
                                  title: language === 'fr' ? 'Erreur' : 'Error',
                                  description: language === 'fr' ? 'Impossible de charger les présences' : 'Unable to load attendance',
                                  variant: 'destructive'
                                });
                              });
                            }}
                          >
                            <Calendar className="w-4 h-4 mr-2" />
                            {t?.actions?.viewAttendance}
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

export default FunctionalParentChildren;