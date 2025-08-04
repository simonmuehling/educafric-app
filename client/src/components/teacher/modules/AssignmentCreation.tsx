import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  FileText, Clock, CheckCircle, AlertCircle, Plus, Calendar, 
  Users, Eye, Edit, Download, Filter, TrendingUp, Send
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
  priority: string;
}

interface Class {
  id: number;
  name: string;
  studentCount: number;
}

interface Subject {
  id: number;
  name: string;
}

const AssignmentCreation: React.FC = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [assignmentForm, setAssignmentForm] = useState({
    title: '',
    description: '',
    classId: '',
    subjectId: '',
    dueDate: '',
    priority: 'medium',
    instructions: '',
    attachments: ''
  });

  // Fetch assignments from API
  const { data: assignmentsData = [], isLoading: assignmentsLoading } = useQuery<Assignment[]>({
    queryKey: ['/api/teacher/assignments'],
    queryFn: async () => {
      console.log('[ASSIGNMENT_CREATION] 🔍 Fetching assignments...');
      const response = await fetch('/api/teacher/assignments', {
        credentials: 'include'
      });
      if (!response.ok) {
        console.error('[ASSIGNMENT_CREATION] ❌ Failed to fetch assignments');
        throw new Error('Failed to fetch assignments');
      }
      const data = await response.json();
      console.log('[ASSIGNMENT_CREATION] ✅ Assignments loaded:', data.length);
      return data;
    },
    enabled: !!user,
    retry: 2
  });

  // Fetch classes from API
  const { data: classesData = [], isLoading: classesLoading } = useQuery<Class[]>({
    queryKey: ['/api/teacher/classes'],
    queryFn: async () => {
      console.log('[ASSIGNMENT_CREATION] 🔍 Fetching classes...');
      const response = await fetch('/api/teacher/classes', {
        credentials: 'include'
      });
      if (!response.ok) {
        console.error('[ASSIGNMENT_CREATION] ❌ Failed to fetch classes');
        throw new Error('Failed to fetch classes');
      }
      const data = await response.json();
      console.log('[ASSIGNMENT_CREATION] ✅ Classes loaded:', data.length);
      return data;
    },
    enabled: !!user,
    retry: 2
  });

  // Fetch subjects from API
  const { data: subjectsData = [], isLoading: subjectsLoading } = useQuery<Subject[]>({
    queryKey: ['/api/teacher/subjects'],
    queryFn: async () => {
      console.log('[ASSIGNMENT_CREATION] 🔍 Fetching subjects...');
      const response = await fetch('/api/teacher/subjects', {
        credentials: 'include'
      });
      if (!response.ok) {
        console.error('[ASSIGNMENT_CREATION] ❌ Failed to fetch subjects');
        throw new Error('Failed to fetch subjects');
      }
      const data = await response.json();
      console.log('[ASSIGNMENT_CREATION] ✅ Subjects loaded:', data.length);
      return data;
    },
    enabled: !!user,
    retry: 2
  });

  // Create assignment mutation
  const createAssignmentMutation = useMutation({
    mutationFn: async (assignmentData: any) => {
      const response = await fetch('/api/teacher/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assignmentData),
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to create assignment');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/teacher/assignments'] });
      setIsCreateOpen(false);
      setAssignmentForm({ 
        title: '', description: '', classId: '', subjectId: '', 
        dueDate: '', priority: 'medium', instructions: '', attachments: '' 
      });
      toast({
        title: language === 'fr' ? 'Devoir créé' : 'Assignment Created',
        description: language === 'fr' ? 'Le devoir a été créé avec succès.' : 'Assignment has been created successfully.'
      });
    },
    onError: () => {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' ? 'Impossible de créer le devoir.' : 'Failed to create assignment.',
        variant: 'destructive'
      });
    }
  });

  const text = {
    fr: {
      title: 'Création de Devoirs',
      subtitle: 'Créez et assignez des devoirs à vos élèves',
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
        send: 'Envoyer'
      },
      filters: {
        all: 'Tous',
        active: 'Actifs',
        completed: 'Terminés',
        overdue: 'En Retard'
      },
      form: {
        title: 'Titre du devoir',
        description: 'Description',
        class: 'Classe',
        subject: 'Matière',
        dueDate: 'Date d\'échéance',
        priority: 'Priorité',
        instructions: 'Instructions',
        attachments: 'Pièces jointes',
        save: 'Créer le Devoir',
        cancel: 'Annuler'
      },
      priorities: {
        low: 'Faible',
        medium: 'Moyenne',
        high: 'Élevée'
      }
    },
    en: {
      title: 'Assignment Creation',
      subtitle: 'Create and assign homework to your students',
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
        send: 'Send'
      },
      filters: {
        all: 'All',
        active: 'Active',
        completed: 'Completed',
        overdue: 'Overdue'
      },
      form: {
        title: 'Assignment title',
        description: 'Description',
        class: 'Class',
        subject: 'Subject',
        dueDate: 'Due date',
        priority: 'Priority',
        instructions: 'Instructions',
        attachments: 'Attachments',
        save: 'Create Assignment',
        cancel: 'Cancel'
      },
      priorities: {
        low: 'Low',
        medium: 'Medium',
        high: 'High'
      }
    }
  };

  const t = text[language as keyof typeof text];

  const handleCreateAssignment = () => {
    if (assignmentForm.title && assignmentForm.description && assignmentForm.classId && assignmentForm.dueDate) {
      createAssignmentMutation.mutate({
        title: assignmentForm.title,
        description: assignmentForm.description,
        classId: parseInt(assignmentForm.classId),
        subjectId: parseInt(assignmentForm.subjectId) || 1,
        dueDate: assignmentForm.dueDate,
        priority: assignmentForm.priority,
        instructions: assignmentForm.instructions,
        attachments: assignmentForm.attachments
      });
    }
  };

  // Filter assignments
  const filteredAssignments = (Array.isArray(assignmentsData) ? assignmentsData : []).filter(assignment => {
    return filterStatus === 'all' || assignment.status === filterStatus;
  });

  // Calculate statistics
  const totalAssignments = (Array.isArray(assignmentsData) ? assignmentsData.length : 0);
  const avgCompletion = (Array.isArray(assignmentsData) ? assignmentsData.length : 0) > 0 
    ? Math.round((Array.isArray(assignmentsData) ? assignmentsData : []).reduce((sum, a) => sum + a.completionRate, 0) / (Array.isArray(assignmentsData) ? assignmentsData.length : 0))
    : 0;
  const pendingCount = (Array.isArray(assignmentsData) ? assignmentsData : []).filter(a => a.status === 'active').length;
  const overdueCount = (Array.isArray(assignmentsData) ? assignmentsData : []).filter(a => a.status === 'overdue').length;

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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-orange-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  if (assignmentsLoading || classesLoading || subjectsLoading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">{t.loading}</span>
      </div>
    );
  }

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
          <Button 
            onClick={() => setIsCreateOpen(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
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

      {/* Create Assignment Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">{t?.actions?.createAssignment}</h3>
            <div className="space-y-4">
              <div>
                <Label>{t?.form?.title}</Label>
                <Input
                  value={assignmentForm.title}
                  onChange={(e) => setAssignmentForm(prev => ({ ...prev, title: e?.target?.value }))}
                  placeholder="Ex: Exercices de mathématiques"
                />
              </div>
              <div>
                <Label>{t?.form?.description}</Label>
                <Textarea
                  value={assignmentForm.description}
                  onChange={(e) => setAssignmentForm(prev => ({ ...prev, description: e?.target?.value }))}
                  placeholder="Description détaillée du devoir..."
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{t?.form?.class}</Label>
                  <Select value={assignmentForm.classId} onValueChange={(value) => setAssignmentForm(prev => ({ ...prev, classId: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder={t?.form?.class} />
                    </SelectTrigger>
                    <SelectContent>
                      {(Array.isArray(classesData) ? classesData : []).map(cls => (
                        <SelectItem key={cls.id} value={cls.id.toString()}>
                          {cls.name} ({cls.studentCount} élèves)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{t?.form?.subject}</Label>
                  <Select value={assignmentForm.subjectId} onValueChange={(value) => setAssignmentForm(prev => ({ ...prev, subjectId: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder={t?.form?.subject} />
                    </SelectTrigger>
                    <SelectContent>
                      {(Array.isArray(subjectsData) ? subjectsData : []).map(subject => (
                        <SelectItem key={subject.id} value={subject.id.toString()}>
                          {subject.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{t?.form?.dueDate}</Label>
                  <Input
                    type="date"
                    value={assignmentForm.dueDate}
                    onChange={(e) => setAssignmentForm(prev => ({ ...prev, dueDate: e?.target?.value }))}
                  />
                </div>
                <div>
                  <Label>{t?.form?.priority}</Label>
                  <Select value={assignmentForm.priority} onValueChange={(value) => setAssignmentForm(prev => ({ ...prev, priority: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">{t?.priorities?.low}</SelectItem>
                      <SelectItem value="medium">{t?.priorities?.medium}</SelectItem>
                      <SelectItem value="high">{t?.priorities?.high}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>{t?.form?.instructions}</Label>
                <Textarea
                  value={assignmentForm.instructions}
                  onChange={(e) => setAssignmentForm(prev => ({ ...prev, instructions: e?.target?.value }))}
                  placeholder="Instructions spécifiques pour les élèves..."
                  rows={3}
                />
              </div>
              <div>
                <Label>{t?.form?.attachments}</Label>
                <Input
                  value={assignmentForm.attachments}
                  onChange={(e) => setAssignmentForm(prev => ({ ...prev, attachments: e?.target?.value }))}
                  placeholder="Liens vers des documents ou ressources"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={handleCreateAssignment}
                  disabled={createAssignmentMutation.isPending || !assignmentForm.title || !assignmentForm.description || !assignmentForm.classId || !assignmentForm.dueDate}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {createAssignmentMutation.isPending ? 'Création...' : t?.form?.save}
                </Button>
                <Button 
                  onClick={() => setIsCreateOpen(false)}
                  variant="outline"
                >
                  {t?.form?.cancel}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-3">
            <Filter className="w-4 h-4 text-gray-500" />
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder={t?.filters?.all} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t?.filters?.all}</SelectItem>
                <SelectItem value="active">{t?.filters?.active}</SelectItem>
                <SelectItem value="completed">{t?.filters?.completed}</SelectItem>
                <SelectItem value="overdue">{t?.filters?.overdue}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Assignments List */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Devoirs Récents</h3>
        </CardHeader>
        <CardContent>
          {(Array.isArray(filteredAssignments) ? filteredAssignments.length : 0) === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">{t.noData}</h3>
              <p className="text-gray-600">Commencez par créer un devoir pour vos élèves.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {(Array.isArray(filteredAssignments) ? filteredAssignments : []).map((assignment) => (
                <Card key={assignment.id} className="border hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <FileText className="w-5 h-5 text-blue-600" />
                          <h4 className="text-lg font-semibold text-gray-900">{assignment.title || ''}</h4>
                          {getStatusBadge(assignment.status)}
                          <span className={`text-sm font-medium ${getPriorityColor(assignment.priority)}`}>
                            {t.priorities[assignment.priority as keyof typeof t.priorities]}
                          </span>
                        </div>
                        
                        <p className="text-gray-600 mb-3 line-clamp-2">{assignment.description || ''}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-gray-500">Classe</p>
                            <p className="font-medium">{assignment.className}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Matière</p>
                            <p className="font-medium">{assignment.subjectName}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Échéance</p>
                            <p className="font-medium">{assignment.dueDate}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Progression</p>
                            <div className="flex items-center space-x-2">
                              <div className="w-16 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="h-2 bg-blue-500 rounded-full"
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
                              <Send className="w-4 h-4 mr-2" />
                              {t?.actions?.send}
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

export default AssignmentCreation;