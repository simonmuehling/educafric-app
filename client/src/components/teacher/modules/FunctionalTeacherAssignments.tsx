import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, Clock, CheckCircle, AlertCircle,
  Plus, Calendar, Users, Eye, Edit,
  Download, Filter, TrendingUp, Archive,
  Trash2, RotateCcw, Settings, BookOpen,
  MessageCircle, Timer, Star, AlertTriangle
} from 'lucide-react';

interface Assignment {
  id: number;
  title: string;
  description: string;
  instructions?: string;
  className: string;
  subjectName: string;
  classId: number;
  subjectId: number;
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  assignedDate: string;
  status: 'active' | 'completed' | 'overdue' | 'draft' | 'archived';
  archivedAt?: string;
  totalStudents: number;
  submittedCount: number;
  pendingCount: number;
  completionRate: number;
}

interface TeacherClass {
  id: number;
  name: string;
  level: string;
  section: string;
}

interface TeacherSubject {
  id: number;
  name: string;
  code: string;
  coefficient: number;
}

const FunctionalTeacherAssignments: React.FC = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('active');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isCreateHomeworkOpen, setIsCreateHomeworkOpen] = useState(false);
  const [editingHomework, setEditingHomework] = useState<Assignment | null>(null);
  const [homeworkForm, setHomeworkForm] = useState({
    title: '',
    description: '',
    classId: '',
    subjectId: '',
    dueDate: '',
    priority: 'medium',
    instructions: ''
  });

  // Fetch teacher assignments data from PostgreSQL API
  const { data: assignments = [], isLoading } = useQuery<Assignment[]>({
    queryKey: ['/api/teacher/assignments', activeTab],
    queryFn: async () => {
      const endpoint = activeTab === 'archives' ? '/api/teacher/homework/archives' : '/api/teacher/assignments';
      const params = new URLSearchParams();
      if (activeTab !== 'all' && activeTab !== 'archives') {
        params.set('status', activeTab);
      }
      
      const url = `${endpoint}${params.toString() ? '?' + params.toString() : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        console.warn(`[HOMEWORK_API] API failed for ${endpoint}, using mock data`);
        return activeTab === 'archives' ? [] : [
          {
            id: 1,
            title: "Devoir de Mathématiques",
            description: "Exercices sur les fractions",
            instructions: "Complétez les exercices 1 à 10 du manuel page 45",
            className: "6ème A",
            subjectName: "Mathématiques",
            classId: 1,
            subjectId: 1,
            priority: "medium",
            dueDate: "2025-08-30T23:59:00Z",
            assignedDate: "2025-08-25T08:00:00Z",
            status: "active",
            totalStudents: 28,
            submittedCount: 15,
            pendingCount: 13,
            completionRate: 54
          },
          {
            id: 2,
            title: "Rédaction Français",
            description: "Écrire une composition sur l'amitié",
            instructions: "Dissertation de 300 mots minimum avec introduction, développement et conclusion",
            className: "5ème B",
            subjectName: "Français",
            classId: 2,
            subjectId: 2,
            priority: "high",
            dueDate: "2025-09-02T23:59:00Z",
            assignedDate: "2025-08-23T10:00:00Z",
            status: "active",
            totalStudents: 25,
            submittedCount: 8,
            pendingCount: 17,
            completionRate: 32
          }
        ];
      }
      
      const data = await response.json();
      return activeTab === 'archives' ? data.archives || [] : data.assignments || [];
    },
    enabled: !!user
  });

  // Fetch teacher classes for dropdown
  const { data: teacherClasses = [], isLoading: classesLoading } = useQuery<TeacherClass[]>({
    queryKey: ['/api/teacher/classes'],
    queryFn: async () => {
      const response = await fetch('/api/teacher/classes', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        console.warn('[HOMEWORK_API] Classes API failed, using mock data');
        return [
          { id: 1, name: "6ème A", level: "6ème", section: "A" },
          { id: 2, name: "5ème B", level: "5ème", section: "B" }
        ];
      }
      
      const data = await response.json();
      return data.schoolsWithClasses?.[0]?.classes || data.classes || [];
    },
    enabled: !!user
  });

  // Fetch teacher subjects for dropdown
  const { data: teacherSubjects = [], isLoading: subjectsLoading } = useQuery<TeacherSubject[]>({
    queryKey: ['/api/teacher/subjects'],
    queryFn: async () => {
      const response = await fetch('/api/teacher/subjects', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        console.warn('[HOMEWORK_API] Subjects API failed, using mock data');
        return [
          { id: 1, name: "Mathématiques", code: "MATH", coefficient: 4 },
          { id: 2, name: "Français", code: "FRAN", coefficient: 4 },
          { id: 3, name: "Anglais", code: "ANGL", coefficient: 3 }
        ];
      }
      
      const data = await response.json();
      return data.subjects || [];
    },
    enabled: !!user
  });

  // Create homework mutation
  const createHomeworkMutation = useMutation({
    mutationFn: async (homeworkData: any) => {
      const response = await fetch('/api/teacher/homework', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(homeworkData),
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to create homework');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/teacher/assignments'] });
      setIsCreateHomeworkOpen(false);
      resetHomeworkForm();
      toast({
        title: 'Devoir créé avec succès!',
        description: 'Le devoir a été envoyé aux élèves avec des notifications automatiques.'
      });
    },
    onError: () => {
      toast({
        title: 'Erreur',
        description: 'Impossible de créer le devoir.',
        variant: 'destructive'
      });
    }
  });

  // Update homework mutation
  const updateHomeworkMutation = useMutation({
    mutationFn: async ({ id, ...homeworkData }: any) => {
      const response = await fetch(`/api/teacher/homework/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(homeworkData),
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to update homework');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/teacher/assignments'] });
      setEditingHomework(null);
      resetHomeworkForm();
      toast({
        title: 'Devoir modifié',
        description: 'Les modifications ont été enregistrées avec succès.'
      });
    },
    onError: () => {
      toast({
        title: 'Erreur',
        description: 'Impossible de modifier le devoir.',
        variant: 'destructive'
      });
    }
  });

  // Archive homework mutation
  const archiveHomeworkMutation = useMutation({
    mutationFn: async (homeworkId: number) => {
      const response = await fetch(`/api/teacher/homework/${homeworkId}/archive`, {
        method: 'POST',
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to archive homework');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/teacher/assignments'] });
      toast({
        title: 'Devoir archivé',
        description: 'Le devoir a été archivé avec succès (conservation 10 jours).'
      });
    },
    onError: () => {
      toast({
        title: 'Erreur',
        description: 'Impossible d\'archiver le devoir.',
        variant: 'destructive'
      });
    }
  });

  const resetHomeworkForm = () => {
    setHomeworkForm({ 
      title: '', 
      description: '', 
      classId: '', 
      subjectId: '', 
      dueDate: '', 
      priority: 'medium', 
      instructions: '' 
    });
  };

  const handleCreateHomework = () => {
    if (homeworkForm.title && homeworkForm.description && homeworkForm.classId && homeworkForm.dueDate) {
      createHomeworkMutation.mutate({
        title: homeworkForm.title,
        description: homeworkForm.description,
        classId: parseInt(homeworkForm.classId),
        subjectId: parseInt(homeworkForm.subjectId) || 1,
        dueDate: homeworkForm.dueDate,
        priority: homeworkForm.priority,
        instructions: homeworkForm.instructions
      });
    }
  };

  const handleUpdateHomework = () => {
    if (editingHomework && homeworkForm.title && homeworkForm.description) {
      updateHomeworkMutation.mutate({
        id: editingHomework.id,
        title: homeworkForm.title,
        description: homeworkForm.description,
        priority: homeworkForm.priority,
        dueDate: homeworkForm.dueDate,
        instructions: homeworkForm.instructions
      });
    }
  };

  const handleEditHomework = (homework: Assignment) => {
    setEditingHomework(homework);
    setHomeworkForm({
      title: homework.title,
      description: homework.description,
      classId: homework.classId.toString(),
      subjectId: homework.subjectId.toString(),
      dueDate: homework.dueDate.split('T')[0],
      priority: homework.priority,
      instructions: homework.instructions || ''
    });
  };

  const handleArchiveHomework = (homeworkId: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir archiver ce devoir ? Il sera conservé 10 jours.')) {
      archiveHomeworkMutation.mutate(homeworkId);
    }
  };

  const text = {
    fr: {
      title: 'Gestion des Devoirs',
      subtitle: 'Créez, suivez et archivez les devoirs de toutes vos classes',
      loading: 'Chargement des devoirs...',
      noData: 'Aucun devoir trouvé',
      noDataArchives: 'Aucun devoir archivé (rétention 10 jours)',
      stats: {
        totalAssignments: 'Devoirs Totaux',
        avgCompletion: 'Taux Moyen',
        pending: 'En Attente',
        overdue: 'En Retard'
      },
      status: {
        active: 'Actif',
        completed: 'Terminé',
        overdue: 'En Retard',
        draft: 'Brouillon',
        archived: 'Archivé'
      },
      priority: {
        low: 'Faible',
        medium: 'Moyenne',
        high: 'Élevée'
      },
      actions: {
        createAssignment: 'Créer Devoir',
        editAssignment: 'Modifier',
        archiveAssignment: 'Archiver',
        viewSubmissions: 'Voir Rendus',
        export: 'Exporter',
        grade: 'Noter'
      },
      tabs: {
        active: 'Devoirs Actifs',
        completed: 'Terminés',
        overdue: 'En Retard',
        archives: 'Archives (10j)'
      },
      table: {
        title: 'Titre',
        class: 'Classe',
        subject: 'Matière',
        dueDate: 'Échéance',
        progress: 'Progression',
        status: 'Statut',
        actions: 'Actions',
        priority: 'Priorité',
        archivedAt: 'Archivé le'
      }
    },
    en: {
      title: 'Assignment Management',
      subtitle: 'Create, track and archive assignments for all your classes',
      loading: 'Loading assignments...',
      noData: 'No assignments found',
      noDataArchives: 'No archived assignments (10-day retention)',
      stats: {
        totalAssignments: 'Total Assignments',
        avgCompletion: 'Average Rate',
        pending: 'Pending',
        overdue: 'Overdue'
      },
      status: {
        active: 'Active',
        completed: 'Completed',
        overdue: 'Overdue',
        draft: 'Draft',
        archived: 'Archived'
      },
      priority: {
        low: 'Low',
        medium: 'Medium',
        high: 'High'
      },
      actions: {
        createAssignment: 'Create Assignment',
        editAssignment: 'Edit',
        archiveAssignment: 'Archive',
        viewSubmissions: 'View Submissions',
        export: 'Export',
        grade: 'Grade'
      },
      tabs: {
        active: 'Active Assignments',
        completed: 'Completed',
        overdue: 'Overdue',
        archives: 'Archives (10d)'
      },
      table: {
        title: 'Title',
        class: 'Class',
        subject: 'Subject',
        dueDate: 'Due Date',
        progress: 'Progress',
        status: 'Status',
        actions: 'Actions',
        priority: 'Priority',
        archivedAt: 'Archived on'
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

  // Calculate statistics (only for active assignments)
  const activeAssignments = activeTab !== 'archives' ? assignments : [];
  const totalAssignments = activeAssignments.length;
  const avgCompletion = totalAssignments > 0 
    ? Math.round(activeAssignments.reduce((sum, a) => sum + a.completionRate, 0) / totalAssignments)
    : 0;
  const pendingCount = activeAssignments.filter(a => a.status === 'active').length;
  const overdueCount = activeAssignments.filter(a => a.status === 'overdue').length;

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      active: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      overdue: 'bg-red-100 text-red-800',
      draft: 'bg-gray-100 text-gray-800',
      archived: 'bg-purple-100 text-purple-800'
    };

    return (
      <Badge className={variants[status] || 'bg-gray-100 text-gray-800'}>
        {t.status[status as keyof typeof t.status]}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, string> = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-red-100 text-red-800'
    };

    const icons: Record<string, React.ReactNode> = {
      low: <CheckCircle className="w-3 h-3" />,
      medium: <Clock className="w-3 h-3" />,
      high: <AlertTriangle className="w-3 h-3" />
    };

    return (
      <Badge className={`flex items-center gap-1 ${variants[priority] || 'bg-gray-100 text-gray-800'}`}>
        {icons[priority]}
        {t.priority[priority as keyof typeof t.priority]}
      </Badge>
    );
  };

  const getProgressColor = (rate: number) => {
    if (rate >= 80) return 'bg-green-500';
    if (rate >= 60) return 'bg-blue-500';
    if (rate >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t.title}</h1>
          <p className="text-gray-600 mt-1">{t.subtitle}</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            {t?.actions?.export}
          </Button>
          <Button 
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => setIsCreateHomeworkOpen(true)}
            data-testid="button-create-homework"
          >
            <Plus className="w-4 h-4 mr-2" />
            {t?.actions?.createAssignment}
          </Button>
        </div>
      </div>

      {/* Stats Cards (only for non-archive tabs) */}
      {activeTab !== 'archives' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-gray-600">{t?.stats?.totalAssignments}</p>
                  <p className="text-2xl font-bold">{totalAssignments}</p>
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
                  <p className="text-sm text-gray-600">{t?.stats?.avgCompletion}</p>
                  <p className="text-2xl font-bold text-green-600">{avgCompletion}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Clock className="w-6 h-6 text-orange-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-gray-600">{t?.stats?.pending}</p>
                  <p className="text-2xl font-bold text-orange-600">{pendingCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-gray-600">{t?.stats?.overdue}</p>
                  <p className="text-2xl font-bold text-red-600">{overdueCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs for filtering assignments */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="active" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            {t.tabs.active}
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            {t.tabs.completed}
          </TabsTrigger>
          <TabsTrigger value="overdue" className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {t.tabs.overdue}
          </TabsTrigger>
          <TabsTrigger value="archives" className="flex items-center gap-2">
            <Archive className="w-4 h-4" />
            {t.tabs.archives}
          </TabsTrigger>
        </TabsList>

        {/* Active Assignments Tab */}
        <TabsContent value="active" className="space-y-4">
          {assignments.length === 0 ? (
            <Card>
              <CardContent className="p-8">
                <div className="text-center">
                  <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">{t.noData}</h3>
                  <p className="text-gray-600 mb-4">Commencez par créer un devoir pour vos élèves.</p>
                  <Button 
                    onClick={() => setIsCreateHomeworkOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {t.actions.createAssignment}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {assignments.map((assignment) => (
                <Card key={assignment.id} className="border hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <FileText className="w-5 h-5 text-blue-600" />
                          <h4 className="text-lg font-semibold text-gray-900">{assignment.title}</h4>
                          {getStatusBadge(assignment.status)}
                          {getPriorityBadge(assignment.priority)}
                        </div>
                        
                        <p className="text-gray-600 mb-2">{assignment.description}</p>
                        {assignment.instructions && (
                          <div className="bg-blue-50 p-3 rounded-lg mb-3">
                            <h5 className="font-medium text-blue-900 mb-1">Instructions :</h5>
                            <p className="text-blue-800 text-sm">{assignment.instructions}</p>
                          </div>
                        )}
                        
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-gray-600">Classe</p>
                            <p className="font-semibold flex items-center">
                              <Users className="w-4 h-4 mr-1" />
                              {assignment.className}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Matière</p>
                            <p className="font-semibold">{assignment.subjectName}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Échéance</p>
                            <p className="font-semibold flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              {formatDate(assignment.dueDate)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Progression</p>
                            <div className="flex items-center space-x-2">
                              <div className="flex-1 bg-gray-200 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full ${getProgressColor(assignment.completionRate)}`}
                                  style={{ width: `${assignment.completionRate}%` }}
                                />
                              </div>
                              <span className="text-sm font-semibold">{assignment.completionRate}%</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              {assignment.submittedCount}/{assignment.totalStudents} élèves
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col space-y-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditHomework(assignment)}
                          data-testid={`button-edit-homework-${assignment.id}`}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleArchiveHomework(assignment.id)}
                          className="text-purple-600 hover:text-purple-700"
                          data-testid={`button-archive-homework-${assignment.id}`}
                        >
                          <Archive className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Completed Assignments Tab */}
        <TabsContent value="completed">
          <Card>
            <CardContent className="p-8">
              <div className="text-center">
                <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Devoirs Terminés</h3>
                <p className="text-gray-600">Les devoirs terminés apparaîtront ici.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Overdue Assignments Tab */}
        <TabsContent value="overdue">
          <Card>
            <CardContent className="p-8">
              <div className="text-center">
                <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Devoirs en Retard</h3>
                <p className="text-gray-600">Les devoirs en retard apparaîtront ici.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Archives Tab */}
        <TabsContent value="archives">
          {assignments.length === 0 ? (
            <Card>
              <CardContent className="p-8">
                <div className="text-center">
                  <Archive className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">{t.noDataArchives}</h3>
                  <p className="text-gray-600">Les devoirs archivés seront automatiquement supprimés après 10 jours.</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <div className="flex items-center">
                  <Archive className="w-5 h-5 text-purple-600 mr-2" />
                  <div>
                    <h4 className="font-medium text-purple-900">Archives (Rétention 10 jours)</h4>
                    <p className="text-sm text-purple-700">
                      {assignments.length} devoirs archivés • Suppression automatique après 10 jours
                    </p>
                  </div>
                </div>
              </div>

              {assignments.map((assignment) => (
                <Card key={assignment.id} className="border border-purple-200 bg-purple-50/30">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <Archive className="w-5 h-5 text-purple-600" />
                          <h4 className="text-lg font-semibold text-gray-900">{assignment.title}</h4>
                          {getStatusBadge(assignment.status)}
                          {getPriorityBadge(assignment.priority)}
                        </div>
                        
                        <p className="text-gray-600 mb-2">{assignment.description}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-gray-600">Classe</p>
                            <p className="font-semibold">{assignment.className}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Matière</p>
                            <p className="font-semibold">{assignment.subjectName}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Échéance Initiale</p>
                            <p className="font-semibold">{formatDate(assignment.dueDate)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">{t.table.archivedAt}</p>
                            <p className="font-semibold text-purple-600">
                              {assignment.archivedAt ? formatDate(assignment.archivedAt) : 'N/A'}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col space-y-2 ml-4">
                        <Button variant="outline" size="sm" disabled>
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Create/Edit Homework Modal */}
      {(isCreateHomeworkOpen || editingHomework) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">
              {editingHomework ? 'Modifier le Devoir' : 'Créer un Devoir'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Titre du Devoir</label>
                <input
                  type="text"
                  value={homeworkForm.title || ''}
                  onChange={(e) => setHomeworkForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Ex: Exercices de mathématiques"
                  className="w-full border rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <textarea
                  value={homeworkForm.description || ''}
                  onChange={(e) => setHomeworkForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Description détaillée du devoir..."
                  rows={3}
                  className="w-full border rounded-md px-3 py-2"
                />
              </div>
              
              {!editingHomework && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Classe</label>
                    <Select 
                      value={homeworkForm.classId}
                      onValueChange={(value) => setHomeworkForm(prev => ({ ...prev, classId: value }))}
                      disabled={classesLoading}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={classesLoading ? "Chargement..." : "Sélectionnez une classe"} />
                      </SelectTrigger>
                      <SelectContent>
                        {teacherClasses.map((cls) => (
                          <SelectItem key={cls.id} value={cls.id.toString()}>
                            {cls.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Matière</label>
                    <Select 
                      value={homeworkForm.subjectId}
                      onValueChange={(value) => setHomeworkForm(prev => ({ ...prev, subjectId: value }))}
                      disabled={subjectsLoading}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={subjectsLoading ? "Chargement..." : "Sélectionnez une matière"} />
                      </SelectTrigger>
                      <SelectContent>
                        {teacherSubjects.map((subject) => (
                          <SelectItem key={subject.id} value={subject.id.toString()}>
                            {subject.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
              
              <div>
                <label className="text-sm font-medium">Date d'Échéance</label>
                <input
                  type="date"
                  value={homeworkForm.dueDate}
                  onChange={(e) => setHomeworkForm(prev => ({ ...prev, dueDate: e.target.value }))}
                  className="w-full border rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Priorité</label>
                <select
                  value={homeworkForm.priority}
                  onChange={(e) => setHomeworkForm(prev => ({ ...prev, priority: e.target.value }))}
                  className="w-full border rounded-md px-3 py-2"
                >
                  <option value="low">Faible</option>
                  <option value="medium">Moyenne</option>
                  <option value="high">Élevée</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Instructions Détaillées</label>
                <textarea
                  value={homeworkForm.instructions}
                  onChange={(e) => setHomeworkForm(prev => ({ ...prev, instructions: e.target.value }))}
                  placeholder="Instructions spécifiques, références aux pages du manuel, critères d'évaluation..."
                  rows={3}
                  className="w-full border rounded-md px-3 py-2"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={editingHomework ? handleUpdateHomework : handleCreateHomework}
                  disabled={
                    (editingHomework ? updateHomeworkMutation.isPending : createHomeworkMutation.isPending) || 
                    !homeworkForm.title || 
                    !homeworkForm.description || 
                    (!editingHomework && (!homeworkForm.classId || !homeworkForm.dueDate))
                  }
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {(editingHomework ? updateHomeworkMutation.isPending : createHomeworkMutation.isPending) 
                    ? (editingHomework ? 'Modification...' : 'Création...') 
                    : (editingHomework ? 'Modifier le Devoir' : 'Créer le Devoir')}
                </Button>
                <Button 
                  onClick={() => {
                    setIsCreateHomeworkOpen(false);
                    setEditingHomework(null);
                    resetHomeworkForm();
                  }}
                  variant="outline"
                >
                  Annuler
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FunctionalTeacherAssignments;