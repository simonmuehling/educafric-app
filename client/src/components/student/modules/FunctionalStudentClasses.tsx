import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  BookOpen, Users, Calendar, Clock, 
  MapPin, GraduationCap, Eye, Download,
  FileText, CheckCircle, AlertCircle
} from 'lucide-react';

interface StudentClass {
  id: number;
  name: string;
  subject: string;
  teacherName: string;
  room: string;
  schedule: string;
  nextClass: string;
  assignments: number;
  completedAssignments: number;
  averageGrade: number;
  attendance: number;
  status: 'active' | 'completed' | 'upcoming';
}

const FunctionalStudentClasses: React.FC = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedClass, setSelectedClass] = useState<number | null>(null);

  // Fetch student classes data
  const { data: classes = [], isLoading } = useQuery<StudentClass[]>({
    queryKey: ['/api/student/classes'],
    enabled: !!user
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { color: 'bg-green-100 text-green-800', label: language === 'fr' ? 'Actif' : 'Active' },
      completed: { color: 'bg-blue-100 text-blue-800', label: language === 'fr' ? 'Terminé' : 'Completed' },
      upcoming: { color: 'bg-yellow-100 text-yellow-800', label: language === 'fr' ? 'À venir' : 'Upcoming' }
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const getGradeColor = (grade: number) => {
    if (grade >= 16) return 'text-green-600';
    if (grade >= 14) return 'text-blue-600';
    if (grade >= 12) return 'text-orange-600';
    return 'text-red-600';
  };

  const text = {
    fr: {
      title: 'Mes Cours',
      subtitle: 'Consultez vos cours et suivez vos progrès',
      stats: {
        totalClasses: 'Total Cours',
        activeClasses: 'Cours Actifs',
        avgGrade: 'Moyenne Générale',
        attendance: 'Assiduité Moyenne'
      },
      class: {
        teacher: 'Enseignant',
        room: 'Salle',
        schedule: 'Horaire',
        nextClass: 'Prochain Cours',
        assignments: 'Devoirs',
        completed: 'Terminés',
        pending: 'En Attente'
      },
      actions: {
        viewDetails: 'Voir Détails',
        viewAssignments: 'Voir Devoirs',
        downloadMaterials: 'Télécharger Ressources',
        joinClass: 'Rejoindre Cours'
      },
      noData: 'Aucun cours trouvé',
      loading: 'Chargement des cours...'
    },
    en: {
      title: 'My Classes',
      subtitle: 'View your classes and track your progress',
      stats: {
        totalClasses: 'Total Classes',
        activeClasses: 'Active Classes',
        avgGrade: 'Overall Average',
        attendance: 'Average Attendance'
      },
      class: {
        teacher: 'Teacher',
        room: 'Room',
        schedule: 'Schedule',
        nextClass: 'Next Class',
        assignments: 'Assignments',
        completed: 'Completed',
        pending: 'Pending'
      },
      actions: {
        viewDetails: 'View Details',
        viewAssignments: 'View Assignments',
        downloadMaterials: 'Download Materials',
        joinClass: 'Join Class'
      },
      noData: 'No classes found',
      loading: 'Loading classes...'
    }
  };

  const t = text[language as keyof typeof text];

  // Calculate statistics
  const totalClasses = classes.length;
  const activeClasses = classes.filter(cls => cls.status === 'active').length;
  const avgGrade = classes.length > 0 ? Math.round(classes.reduce((sum, cls) => sum + cls.averageGrade, 0) / classes.length * 10) / 10 : 0;
  const avgAttendance = classes.length > 0 ? Math.round(classes.reduce((sum, cls) => sum + cls.attendance, 0) / classes.length) : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t.loading}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t.title}</h1>
          <p className="text-gray-600">{t.subtitle}</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-full">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{t.stats.totalClasses}</p>
                  <p className="text-2xl font-bold text-gray-900">{totalClasses}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-full">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{t.stats.activeClasses}</p>
                  <p className="text-2xl font-bold text-green-600">{activeClasses}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-full">
                  <GraduationCap className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{t.stats.avgGrade}</p>
                  <p className={`text-2xl font-bold ${getGradeColor(avgGrade)}`}>{avgGrade}/20</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="p-3 bg-orange-100 rounded-full">
                  <Users className="w-6 h-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{t.stats.attendance}</p>
                  <p className="text-2xl font-bold text-orange-600">{avgAttendance}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Classes List */}
        <div className="space-y-6">
          {classes.length === 0 ? (
            <Card className="p-12 text-center">
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">{t.noData}</h3>
              <p className="text-gray-600">
                {language === 'fr' ? 'Aucun cours disponible pour le moment.' : 'No classes available at the moment.'}
              </p>
            </Card>
          ) : (
            classes.map((classItem) => (
              <Card key={classItem.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-blue-100 rounded-lg">
                        <BookOpen className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">{classItem.name}</CardTitle>
                        <p className="text-gray-600">{classItem.subject}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(classItem.status)}
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">{t.class.teacher}</p>
                      <p className="font-medium">{classItem.teacherName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">{t.class.room}</p>
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 text-gray-400 mr-1" />
                        <span className="font-medium">{classItem.room}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">{t.class.schedule}</p>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 text-gray-400 mr-1" />
                        <span className="font-medium">{classItem.schedule}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div>
                      <p className="text-sm text-gray-600">{t.class.nextClass}</p>
                      <p className="font-medium text-blue-600">{classItem.nextClass}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">{t.class.assignments}</p>
                      <p className="font-medium">{classItem.assignments} {language === 'fr' ? 'devoirs' : 'assignments'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">{language === 'fr' ? 'Moyenne' : 'Average'}</p>
                      <p className={`font-medium text-lg ${getGradeColor(classItem.averageGrade)}`}>
                        {classItem.averageGrade}/20
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">{language === 'fr' ? 'Présence' : 'Attendance'}</p>
                      <p className="font-medium">{classItem.attendance}%</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-gray-600">
                          {classItem.completedAssignments}/{classItem.assignments} {t.class.completed}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <AlertCircle className="w-4 h-4 text-orange-600" />
                        <span className="text-sm text-gray-600">
                          {classItem.assignments - classItem.completedAssignments} {t.class.pending}
                        </span>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          toast({
                            title: language === 'fr' ? 'Détails du cours' : 'Class Details',
                            description: language === 'fr' ? `Affichage des détails de ${classItem.name}` : `Showing details for ${classItem.name}`
                          });
                        }}
                        data-testid={`button-view-details-${classItem.id}`}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        {t.actions.viewDetails}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          const event = new CustomEvent('switchToHomework', { detail: { classId: classItem.id, className: classItem.name } });
                          window.dispatchEvent(event);
                          toast({
                            title: language === 'fr' ? 'Devoirs' : 'Assignments',
                            description: language === 'fr' ? `Affichage des devoirs de ${classItem.name}` : `Showing assignments for ${classItem.name}`
                          });
                        }}
                        data-testid={`button-view-assignments-${classItem.id}`}
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        {t.actions.viewAssignments}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          toast({
                            title: language === 'fr' ? 'Téléchargement' : 'Download',
                            description: language === 'fr' ? `Téléchargement des ressources de ${classItem.name}` : `Downloading materials for ${classItem.name}`
                          });
                        }}
                        data-testid={`button-download-materials-${classItem.id}`}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        {t.actions.downloadMaterials}
                      </Button>
                      {classItem.status === 'active' && (
                        <Button 
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => {
                            toast({
                              title: language === 'fr' ? 'Rejoindre le cours' : 'Join Class',
                              description: language === 'fr' ? `Connexion au cours ${classItem.name}` : `Joining class ${classItem.name}`
                            });
                          }}
                          data-testid={`button-join-class-${classItem.id}`}
                        >
                          <Users className="w-4 h-4 mr-2" />
                          {t.actions.joinClass}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default FunctionalStudentClasses;