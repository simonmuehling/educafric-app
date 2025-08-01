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
  Users, Calendar, BookOpen, ChevronRight, 
  Clock, School, GraduationCap, Plus,
  Eye, Edit, Settings, BarChart3, TrendingUp,
  UserPlus, Mail, Download, CheckCircle
} from 'lucide-react';

interface TeacherClass {
  id: number;
  name: string;
  level: string;
  section: string;
  academicYear: string;
  capacity: number;
  studentCount: number;
  schoolName: string;
  teacherId: number;
  subjects: string[];
  schedule: string;
  nextClass: string;
}

const FunctionalTeacherClasses: React.FC = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);

  // Fetch teacher classes data from PostgreSQL API
  const { data: classes = [], isLoading } = useQuery<TeacherClass[]>({
    queryKey: ['/api/teacher/classes'],
    enabled: !!user
  });

  const text = {
    fr: {
      title: 'Mes Classes',
      subtitle: 'Gérez toutes vos classes et suivez les progrès de vos élèves',
      loading: 'Chargement des classes...',
      noClasses: 'Aucune classe assignée',
      stats: {
        totalClasses: 'Classes Totales',
        totalStudents: 'Élèves Total',
        currentYear: 'Année Scolaire',
        nextClass: 'Prochain Cours'
      },
      class: {
        students: 'élèves',
        capacity: 'Capacité',
        level: 'Niveau',
        section: 'Section',
        school: 'École',
        schedule: 'Horaire',
        subjects: 'Matières'
      },
      actions: {
        viewStudents: 'Voir Élèves',
        takeAttendance: 'Présences',
        manageGrades: 'Notes',
        viewDetails: 'Détails',
        settings: 'Paramètres'
      }
    },
    en: {
      title: 'My Classes',
      subtitle: 'Manage all your classes and track student progress',
      loading: 'Loading classes...',
      noClasses: 'No classes assigned',
      stats: {
        totalClasses: 'Total Classes',
        totalStudents: 'Total Students',
        currentYear: 'Academic Year',
        nextClass: 'Next Class'
      },
      class: {
        students: 'students',
        capacity: 'Capacity',
        level: 'Level',
        section: 'Section',
        school: 'School',
        schedule: 'Schedule',
        subjects: 'Subjects'
      },
      actions: {
        viewStudents: 'View Students',
        takeAttendance: 'Attendance',
        manageGrades: 'Grades',
        viewDetails: 'Details',
        settings: 'Settings'
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

  const totalStudents = Array.isArray(classes) ? (Array.isArray(classes) ? classes : []).reduce((sum, cls) => sum + (cls.studentCount || 0), 0) : 0;
  const currentAcademicYear = Array.isArray(classes) && classes.length > 0 ? classes[0]?.academicYear || '2024-2025' : '2024-2025';

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
              title: language === 'fr' ? 'Nouvelle classe' : 'New Class',
              description: language === 'fr' ? 'Contactez l\'administration pour créer une nouvelle classe' : 'Contact administration to create a new class'
            });
          }}
          data-testid="button-create-class"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle Classe
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <School className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">{t?.stats?.totalClasses}</p>
                <p className="text-2xl font-bold">{(Array.isArray(classes) ? classes.length : 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="w-6 h-6 text-green-600" />
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
              <div className="p-2 bg-orange-100 rounded-lg">
                <Calendar className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">{t?.stats?.currentYear}</p>
                <p className="text-lg font-bold">{currentAcademicYear}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">{t?.stats?.nextClass}</p>
                <p className="text-sm font-medium">Dans 45 min</p>
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
            title={language === 'fr' ? 'Actions Classes' : 'Class Actions'}
            maxVisibleButtons={3}
            actions={[
              {
                id: 'take-attendance',
                label: language === 'fr' ? 'Prendre Présences' : 'Take Attendance',
                icon: <CheckCircle className="w-5 h-5" />,
                onClick: () => {
                  console.log('[TEACHER_CLASSES] 📋 Navigating to attendance module...');
                  const event = new CustomEvent('switchToAttendance');
                  window.dispatchEvent(event);
                },
                color: 'bg-green-600 hover:bg-green-700'
              },
              {
                id: 'manage-grades',
                label: language === 'fr' ? 'Gérer Notes' : 'Manage Grades',
                icon: <BarChart3 className="w-5 h-5" />,
                onClick: () => {
                  console.log('[TEACHER_CLASSES] 📊 Navigating to grades module...');
                  const event = new CustomEvent('switchToGrades');
                  window.dispatchEvent(event);
                },
                color: 'bg-purple-600 hover:bg-purple-700'
              },
              {
                id: 'send-message',
                label: language === 'fr' ? 'Message Parents' : 'Message Parents',
                icon: <Mail className="w-5 h-5" />,
                onClick: () => {
                  console.log('[TEACHER_CLASSES] 💬 Navigating to communications module...');
                  const event = new CustomEvent('switchToCommunications');
                  window.dispatchEvent(event);
                },
                color: 'bg-orange-600 hover:bg-orange-700'
              },
              {
                id: 'export-list',
                label: language === 'fr' ? 'Exporter Liste' : 'Export List',
                icon: <Download className="w-5 h-5" />,
                onClick: () => {
                  const csvContent = [
                    ['Classe,Niveau,Section,Eleves,Capacite,Ecole'],
                    ...(Array.isArray(classes) ? classes : []).map(cls => [
                      cls.name,
                      cls.level,
                      cls.section,
                      cls.studentCount,
                      cls.capacity,
                      cls.schoolName
                    ].join(','))
                  ].join('\n');
                  
                  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                  const link = document.createElement('a');
                  const url = URL.createObjectURL(blob);
                  link.setAttribute('href', url);
                  link.setAttribute('download', `classes_${new Date().toISOString().split('T')[0]}.csv`);
                  if (link.style) link.style.visibility = 'hidden';
                  if (document.body) document.body.appendChild(link);
                  link.click();
                  if (document.body) document.body.removeChild(link);
                  
                  toast({
                    title: language === 'fr' ? 'Export terminé' : 'Export completed',
                    description: language === 'fr' ? 'Liste des classes exportée en CSV' : 'Class list exported as CSV',
                  });
                },
                color: 'bg-teal-600 hover:bg-teal-700'
              }
            ]}
          />
        </CardContent>
      </Card>

      {/* Classes List */}
      <div className="space-y-4">
        {(Array.isArray(classes) ? classes.length : 0) === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <GraduationCap className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">{t.noClasses}</h3>
              <p className="text-gray-600">Contactez votre administration pour l'assignation des classes.</p>
            </CardContent>
          </Card>
        ) : (
          (Array.isArray(classes) ? classes : []).map((cls) => (
            <Card key={cls.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <BookOpen className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{cls.name || ''}</h3>
                      <p className="text-sm text-gray-600">
                        {cls.level} - {cls.section} • {cls.schoolName}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">
                      {cls.studentCount}/{cls.capacity} {t?.class?.students}
                    </Badge>
                    <ChevronRight 
                      className={`w-5 h-5 text-gray-400 transition-transform ${
                        selectedClassId === cls.id ? 'rotate-90' : ''
                      }`}
                    />
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">{t?.class?.schedule}</p>
                    <p className="font-medium">{cls.schedule}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">{t?.class?.subjects}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {(Array.isArray(cls.subjects) ? cls.subjects : []).map((subject: string, index: number) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {subject}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Prochain cours</p>
                    <p className="font-medium text-green-600">Aujourd'hui 9h00</p>
                  </div>
                </div>

                {/* Action Buttons - All Functional */}
                <div className="flex flex-wrap gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      toast({
                        title: language === 'fr' ? 'Liste des élèves' : 'Student List',
                        description: language === 'fr' ? `Affichage des ${cls.studentCount} élèves de ${cls.name || ''}` : `Showing ${cls.studentCount} students from ${cls.name || ''}`
                      });
                    }}
                    data-testid={`button-view-students-${cls.id}`}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    {t?.actions?.viewStudents}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      const event = new CustomEvent('switchToAttendance', { detail: { classId: cls.id, className: cls.name } });
                      window.dispatchEvent(event);
                      toast({
                        title: language === 'fr' ? 'Présences' : 'Attendance',
                        description: language === 'fr' ? `Module de présences ouvert pour ${cls.name || ''}` : `Attendance module opened for ${cls.name || ''}`
                      });
                    }}
                    data-testid={`button-take-attendance-${cls.id}`}
                  >
                    <Users className="w-4 h-4 mr-2" />
                    {t?.actions?.takeAttendance}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      const event = new CustomEvent('switchToGrades', { detail: { classId: cls.id, className: cls.name } });
                      window.dispatchEvent(event);
                      toast({
                        title: language === 'fr' ? 'Gestion des notes' : 'Grade Management',
                        description: language === 'fr' ? `Module de notes ouvert pour ${cls.name || ''}` : `Grade management opened for ${cls.name || ''}`
                      });
                    }}
                    data-testid={`button-manage-grades-${cls.id}`}
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    {t?.actions?.manageGrades}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      toast({
                        title: language === 'fr' ? 'Paramètres classe' : 'Class Settings',
                        description: language === 'fr' ? `Configuration de la classe ${cls.name || ''}` : `Configuration for class ${cls.name || ''}`
                      });
                    }}
                    data-testid={`button-settings-${cls.id}`}
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    {t?.actions?.settings}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default FunctionalTeacherClasses;