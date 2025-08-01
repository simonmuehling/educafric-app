import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  FileText, Clock, CheckCircle, AlertCircle,
  Plus, Calendar, Users, Eye, Edit,
  Download, Filter, TrendingUp
} from 'lucide-react';

interface Assignment {
  id: number;
  title: string;
  description: string;
  className: string;
  subjectName: string;
  dueDate: string;
  assignedDate: string;
  status: string;
  totalStudents: number;
  submittedCount: number;
  pendingCount: number;
  completionRate: number;
}

const FunctionalTeacherAssignments: React.FC = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isCreateHomeworkOpen, setIsCreateHomeworkOpen] = useState(false);
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
    queryKey: ['/api/teacher/assignments'],
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
      setHomeworkForm({ title: '', description: '', classId: '', subjectId: '', dueDate: '', priority: 'medium', instructions: '' });
      toast({
        title: 'Devoir créé',
        description: 'Le devoir a été créé avec succès.'
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

  const text = {
    fr: {
      title: 'Gestion des Devoirs',
      subtitle: 'Créez et suivez les devoirs de toutes vos classes',
      loading: 'Chargement des devoirs...',
      noData: 'Aucun devoir créé',
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
        draft: 'Brouillon'
      },
      actions: {
        createAssignment: 'Créer Devoir',
        viewSubmissions: 'Voir Rendus',
        export: 'Exporter',
        grade: 'Noter'
      },
      filters: {
        all: 'Tous',
        active: 'Actifs',
        completed: 'Terminés',
        overdue: 'En Retard'
      },
      table: {
        title: 'Titre',
        class: 'Classe',
        subject: 'Matière',
        dueDate: 'Échéance',
        progress: 'Progression',
        status: 'Statut',
        actions: 'Actions'
      }
    },
    en: {
      title: 'Assignment Management',
      subtitle: 'Create and track assignments for all your classes',
      loading: 'Loading assignments...',
      noData: 'No assignments created',
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
        draft: 'Draft'
      },
      actions: {
        createAssignment: 'Create Assignment',
        viewSubmissions: 'View Submissions',
        export: 'Export',
        grade: 'Grade'
      },
      filters: {
        all: 'All',
        active: 'Active',
        completed: 'Completed',
        overdue: 'Overdue'
      },
      table: {
        title: 'Title',
        class: 'Class',
        subject: 'Subject',
        dueDate: 'Due Date',
        progress: 'Progress',
        status: 'Status',
        actions: 'Actions'
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

  // Calculate statistics
  const totalAssignments = (Array.isArray(assignments) ? assignments.length : 0);
  const avgCompletion = (Array.isArray(assignments) ? assignments.length : 0) > 0 
    ? Math.round((Array.isArray(assignments) ? assignments : []).reduce((sum, a) => sum + a.completionRate, 0) / (Array.isArray(assignments) ? assignments.length : 0))
    : 0;
  const pendingCount = (Array.isArray(assignments) ? assignments : []).filter(a => a.status === 'active').length;
  const overdueCount = (Array.isArray(assignments) ? assignments : []).filter(a => a.status === 'overdue').length;

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      active: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      overdue: 'bg-red-100 text-red-800',
      draft: 'bg-gray-100 text-gray-800'
    };

    return (
      <Badge className={variants[status] || 'bg-gray-100 text-gray-800'}>
        {t.status[status as keyof typeof t.status]}
      </Badge>
    );
  };

  const getProgressColor = (rate: number) => {
    if (rate >= 80) return 'bg-green-500';
    if (rate >= 60) return 'bg-blue-500';
    if (rate >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t.title || ''}</h1>
          <p className="text-gray-600 mt-1">{t.subtitle}</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            {t?.actions?.export}
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            {t?.actions?.createAssignment}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
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

      {/* Créer Devoir Section */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              <Plus className="w-5 h-5 mr-2 inline" />
              Créer un Devoir
            </h3>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <Button 
              className="bg-green-600 hover:bg-green-700 flex-1 mr-4" 
              data-testid="button-create-homework"
              onClick={() => setIsCreateHomeworkOpen(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Créer un Devoir
            </Button>
            <div className="text-sm text-gray-500">
              Total: {assignments.length} devoirs
            </div>
          </div>

          {/* Create Homework Modal */}
          {isCreateHomeworkOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg w-full max-w-md">
                <h3 className="text-lg font-semibold mb-4">Créer un Devoir</h3>
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
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-sm font-medium">Classe ID</label>
                      <input
                        type="text"
                        value={homeworkForm.classId}
                        onChange={(e) => setHomeworkForm(prev => ({ ...prev, classId: e.target.value }))}
                        placeholder="ID de la classe"
                        className="w-full border rounded-md px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Matière ID</label>
                      <input
                        type="text"
                        value={homeworkForm.subjectId}
                        onChange={(e) => setHomeworkForm(prev => ({ ...prev, subjectId: e.target.value }))}
                        placeholder="ID matière"
                        className="w-full border rounded-md px-3 py-2"
                      />
                    </div>
                  </div>
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
                    <label className="text-sm font-medium">Instructions</label>
                    <textarea
                      value={homeworkForm.instructions}
                      onChange={(e) => setHomeworkForm(prev => ({ ...prev, instructions: e.target.value }))}
                      placeholder="Instructions spécifiques..."
                      rows={2}
                      className="w-full border rounded-md px-3 py-2"
                    />
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button 
                      onClick={handleCreateHomework}
                      disabled={createHomeworkMutation.isPending || !homeworkForm.title || !homeworkForm.description || !homeworkForm.classId || !homeworkForm.dueDate}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      {createHomeworkMutation.isPending ? 'Création...' : 'Créer le Devoir'}
                    </Button>
                    <Button 
                      onClick={() => setIsCreateHomeworkOpen(false)}
                      variant="outline"
                    >
                      Annuler
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Assignments List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Devoirs Récents</h3>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e?.target?.value)}
                  className="border rounded-md px-3 py-1 text-sm"
                >
                  <option value="all">{t?.filters?.all}</option>
                  <option value="active">{t?.filters?.active}</option>
                  <option value="completed">{t?.filters?.completed}</option>
                  <option value="overdue">{t?.filters?.overdue}</option>
                </select>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {(Array.isArray(assignments) ? assignments.length : 0) === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">{t.noData}</h3>
              <p className="text-gray-600">Commencez par créer un devoir pour vos élèves.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {(Array.isArray(assignments) ? assignments : []).map((assignment) => (
                <Card key={assignment.id} className="border hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <FileText className="w-5 h-5 text-blue-600" />
                          <h4 className="text-lg font-semibold text-gray-900">{assignment.title || ''}</h4>
                          {getStatusBadge(assignment.status)}
                        </div>
                        
                        <p className="text-gray-600 mb-3 line-clamp-2">{assignment.description || ''}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-gray-500">{t?.table?.class}</p>
                            <p className="font-medium">{assignment.className}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">{t?.table?.subject}</p>
                            <p className="font-medium">{assignment.subjectName}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">{t?.table?.dueDate}</p>
                            <p className="font-medium">{assignment.dueDate}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">{t?.table?.progress}</p>
                            <div className="flex items-center space-x-2">
                              <div className="w-16 bg-gray-200 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full ${getProgressColor(assignment.completionRate)}`}
                                  style={{ width: `${assignment.completionRate}%` }}
                                ></div>
                              </div>
                              <span className="text-sm font-medium">{assignment.completionRate}%</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <div className="flex items-center">
                              <Users className="w-4 h-4 mr-1" />
                              {assignment.totalStudents} élèves
                            </div>
                            <div className="flex items-center">
                              <CheckCircle className="w-4 h-4 mr-1 text-green-600" />
                              {assignment.submittedCount} rendus
                            </div>
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 mr-1 text-orange-600" />
                              {assignment.pendingCount} en attente
                            </div>
                          </div>
                          
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4 mr-2" />
                              {t?.actions?.viewSubmissions}
                            </Button>
                            <Button variant="outline" size="sm">
                              <Edit className="w-4 h-4 mr-2" />
                              Modifier
                            </Button>
                            <Button variant="outline" size="sm">
                              <CheckCircle className="w-4 h-4 mr-2" />
                              {t?.actions?.grade}
                            </Button>
                          </div>
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

export default FunctionalTeacherAssignments;