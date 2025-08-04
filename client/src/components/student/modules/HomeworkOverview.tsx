import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { ModernCard, ModernStatsCard } from '@/components/ui/ModernCard';
import { BookOpen, Clock, CheckCircle, AlertCircle, RefreshCw, Plus, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface Homework {
  id: number;
  subject: string;
  subjectId: number;
  title: string;
  description?: string;
  dueDate: string;
  status: 'pending' | 'in-progress' | 'completed' | 'overdue';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedDate: string;
  teacher?: string;
  teacherId?: number;
  estimatedDuration?: number;
  submissionUrl?: string;
  attachments?: string[];
  grade?: number;
  feedback?: string;
}

interface HomeworkStats {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  overdue: number;
}

const HomeworkOverview = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newHomework, setNewHomework] = useState({
    title: '',
    description: '',
    subject: '',
    dueDate: '',
    priority: 'medium'
  });

  // Fetch homework from API
  const { data: homeworkData = [], isLoading, error, refetch } = useQuery<Homework[]>({
    queryKey: ['/api/student/homework', statusFilter, priorityFilter, subjectFilter],
    queryFn: async () => {
      console.log('[HOMEWORK_OVERVIEW] 🔍 Fetching homework...');
      let url = '/api/student/homework';
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (priorityFilter !== 'all') params.append('priority', priorityFilter);
      if (subjectFilter !== 'all') params.append('subject', subjectFilter);
      if (params.toString()) url += `?${params.toString()}`;
      
      const response = await fetch(url, {
        credentials: 'include'
      });
      if (!response.ok) {
        console.error('[HOMEWORK_OVERVIEW] ❌ Failed to fetch homework');
        throw new Error('Failed to fetch homework');
      }
      const data = await response.json();
      console.log('[HOMEWORK_OVERVIEW] ✅ Homework loaded:', data.length);
      return data;
    },
    enabled: !!user,
    retry: 2
  });

  // Fetch homework statistics
  const { data: statsData } = useQuery<HomeworkStats>({
    queryKey: ['/api/student/homework/stats'],
    queryFn: async () => {
      console.log('[HOMEWORK_OVERVIEW] 🔍 Fetching homework stats...');
      const response = await fetch('/api/student/homework/stats', {
        credentials: 'include'
      });
      if (!response.ok) {
        console.error('[HOMEWORK_OVERVIEW] ❌ Failed to fetch stats');
        throw new Error('Failed to fetch homework stats');
      }
      const data = await response.json();
      console.log('[HOMEWORK_OVERVIEW] ✅ Stats loaded:', data);
      return data;
    },
    enabled: !!user,
    retry: 2
  });

  // Update homework status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ homeworkId, status }: { homeworkId: number; status: string }) => {
      const response = await fetch(`/api/student/homework/${homeworkId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to update homework status');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/student/homework'] });
      queryClient.invalidateQueries({ queryKey: ['/api/student/homework/stats'] });
      toast({
        title: language === 'fr' ? 'Statut mis à jour' : 'Status updated',
        description: language === 'fr' ? 'Le statut du devoir a été modifié' : 'Homework status has been updated'
      });
    },
    onError: () => {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' ? 'Impossible de mettre à jour le statut' : 'Failed to update status',
        variant: 'destructive'
      });
    }
  });

  // Create homework mutation (for self-assigned tasks)
  const createHomeworkMutation = useMutation({
    mutationFn: async (homeworkData: any) => {
      const response = await fetch('/api/student/homework', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(homeworkData),
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to create homework');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/student/homework'] });
      queryClient.invalidateQueries({ queryKey: ['/api/student/homework/stats'] });
      setIsCreateDialogOpen(false);
      setNewHomework({ title: '', description: '', subject: '', dueDate: '', priority: 'medium' });
      toast({
        title: language === 'fr' ? 'Tâche créée' : 'Task created',
        description: language === 'fr' ? 'Nouvelle tâche ajoutée avec succès' : 'New task added successfully'
      });
    },
    onError: () => {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' ? 'Impossible de créer la tâche' : 'Failed to create task',
        variant: 'destructive'
      });
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'in-progress': return 'text-blue-600 bg-blue-100';
      case 'pending': return 'text-orange-600 bg-orange-100';
      case 'overdue': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-blue-600 bg-blue-100';
      case 'low': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return language === 'fr' ? 'Terminé' : 'Completed';
      case 'in-progress': return language === 'fr' ? 'En cours' : 'In Progress';
      case 'pending': return language === 'fr' ? 'À faire' : 'Pending';
      case 'overdue': return language === 'fr' ? 'En retard' : 'Overdue';
      default: return status;
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'urgent': return language === 'fr' ? 'Urgent' : 'Urgent';
      case 'high': return language === 'fr' ? 'Important' : 'High';
      case 'medium': return language === 'fr' ? 'Normal' : 'Medium';
      case 'low': return language === 'fr' ? 'Faible' : 'Low';
      default: return priority;
    }
  };

  const handleStatusUpdate = (homeworkId: number, newStatus: string) => {
    updateStatusMutation.mutate({ homeworkId, status: newStatus });
  };

  const handleCreateHomework = () => {
    if (newHomework.title && newHomework.dueDate) {
      createHomeworkMutation.mutate({
        ...newHomework,
        assignedDate: new Date().toISOString().split('T')[0],
        status: 'pending'
      });
    }
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date() && dueDate !== new Date().toISOString().split('T')[0];
  };

  const sortedHomework = (Array.isArray(homeworkData) ? homeworkData : [])
    .sort((a, b) => {
      // Sort by due date, then by priority
      const dateComparison = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      if (dateComparison !== 0) return dateComparison;
      
      const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
      return (priorityOrder[b.priority as keyof typeof priorityOrder] || 0) - 
             (priorityOrder[a.priority as keyof typeof priorityOrder] || 0);
    });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">{language === 'fr' ? 'Chargement des devoirs...' : 'Loading homework...'}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">{language === 'fr' ? 'Erreur lors du chargement' : 'Error loading homework'}</p>
          <Button onClick={() => refetch()} className="mt-4">
            <RefreshCw className="w-4 h-4 mr-2" />
            {language === 'fr' ? 'Réessayer' : 'Retry'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              {language === 'fr' ? 'Aperçu des Devoirs' : 'Homework Overview'}
            </h2>
            <p className="text-gray-600">
              {language === 'fr' ? 'Gérez et suivez vos devoirs' : 'Manage and track your homework'}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetch()} data-testid="button-refresh-homework">
            <RefreshCw className="w-4 h-4 mr-2" />
            {language === 'fr' ? 'Actualiser' : 'Refresh'}
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700" data-testid="button-create-homework">
                <Plus className="w-4 h-4 mr-2" />
                {language === 'fr' ? 'Ajouter Tâche' : 'Add Task'}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{language === 'fr' ? 'Nouvelle Tâche' : 'New Task'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">{language === 'fr' ? 'Titre' : 'Title'}</label>
                  <Input
                    value={newHomework.title}
                    onChange={(e) => setNewHomework(prev => ({ ...prev, title: e.target.value }))}
                    placeholder={language === 'fr' ? 'Titre de la tâche' : 'Task title'}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">{language === 'fr' ? 'Description' : 'Description'}</label>
                  <Textarea
                    value={newHomework.description}
                    onChange={(e) => setNewHomework(prev => ({ ...prev, description: e.target.value }))}
                    placeholder={language === 'fr' ? 'Description de la tâche' : 'Task description'}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">{language === 'fr' ? 'Matière' : 'Subject'}</label>
                  <Input
                    value={newHomework.subject}
                    onChange={(e) => setNewHomework(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder={language === 'fr' ? 'Matière' : 'Subject'}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">{language === 'fr' ? 'Date d\'échéance' : 'Due Date'}</label>
                  <Input
                    type="date"
                    value={newHomework.dueDate}
                    onChange={(e) => setNewHomework(prev => ({ ...prev, dueDate: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">{language === 'fr' ? 'Priorité' : 'Priority'}</label>
                  <Select value={newHomework.priority} onValueChange={(value) => setNewHomework(prev => ({ ...prev, priority: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">{language === 'fr' ? 'Faible' : 'Low'}</SelectItem>
                      <SelectItem value="medium">{language === 'fr' ? 'Normal' : 'Medium'}</SelectItem>
                      <SelectItem value="high">{language === 'fr' ? 'Important' : 'High'}</SelectItem>
                      <SelectItem value="urgent">{language === 'fr' ? 'Urgent' : 'Urgent'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button 
                    onClick={handleCreateHomework}
                    disabled={createHomeworkMutation.isPending || !newHomework.title || !newHomework.dueDate}
                    className="flex-1"
                  >
                    {createHomeworkMutation.isPending 
                      ? (language === 'fr' ? 'Création...' : 'Creating...')
                      : (language === 'fr' ? 'Créer' : 'Create')
                    }
                  </Button>
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    {language === 'fr' ? 'Annuler' : 'Cancel'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <ModernStatsCard
          title={language === 'fr' ? 'Total Devoirs' : 'Total Homework'}
          value={(statsData?.total || sortedHomework.length).toString()}
          icon={<BookOpen className="w-5 h-5" />}
          gradient="blue"
        />
        <ModernStatsCard
          title={language === 'fr' ? 'À faire' : 'Pending'}
          value={(statsData?.pending || sortedHomework.filter(h => h.status === 'pending').length).toString()}
          icon={<Clock className="w-5 h-5" />}
          gradient="orange"
        />
        <ModernStatsCard
          title={language === 'fr' ? 'En cours' : 'In Progress'}
          value={(statsData?.inProgress || sortedHomework.filter(h => h.status === 'in-progress').length).toString()}
          icon={<AlertCircle className="w-5 h-5" />}
          gradient="purple"
        />
        <ModernStatsCard
          title={language === 'fr' ? 'Terminés' : 'Completed'}
          value={(statsData?.completed || sortedHomework.filter(h => h.status === 'completed').length).toString()}
          icon={<CheckCircle className="w-5 h-5" />}
          gradient="green"
        />
      </div>

      {/* Filters */}
      <ModernCard gradient="default">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            <span className="font-medium">{language === 'fr' ? 'Filtres:' : 'Filters:'}</span>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder={language === 'fr' ? 'Statut' : 'Status'} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{language === 'fr' ? 'Tous' : 'All'}</SelectItem>
              <SelectItem value="pending">{language === 'fr' ? 'À faire' : 'Pending'}</SelectItem>
              <SelectItem value="in-progress">{language === 'fr' ? 'En cours' : 'In Progress'}</SelectItem>
              <SelectItem value="completed">{language === 'fr' ? 'Terminés' : 'Completed'}</SelectItem>
              <SelectItem value="overdue">{language === 'fr' ? 'En retard' : 'Overdue'}</SelectItem>
            </SelectContent>
          </Select>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder={language === 'fr' ? 'Priorité' : 'Priority'} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{language === 'fr' ? 'Toutes' : 'All'}</SelectItem>
              <SelectItem value="urgent">{language === 'fr' ? 'Urgent' : 'Urgent'}</SelectItem>
              <SelectItem value="high">{language === 'fr' ? 'Important' : 'High'}</SelectItem>
              <SelectItem value="medium">{language === 'fr' ? 'Normal' : 'Medium'}</SelectItem>
              <SelectItem value="low">{language === 'fr' ? 'Faible' : 'Low'}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </ModernCard>

      {/* Homework List */}
      <ModernCard gradient="default">
        <h3 className="text-xl font-bold mb-6">
          {language === 'fr' ? 'Mes Devoirs' : 'My Homework'}
          <span className="text-sm font-normal text-gray-500 ml-2">
            ({sortedHomework.length} {language === 'fr' ? 'devoirs' : 'assignments'})
          </span>
        </h3>
        {sortedHomework.length === 0 ? (
          <div className="text-center py-8">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">
              {language === 'fr' ? 'Aucun devoir trouvé' : 'No homework found'}
            </p>
            <p className="text-gray-400 text-sm">
              {language === 'fr' ? 'Essayez de changer les filtres ou d\'ajouter une nouvelle tâche' : 'Try changing filters or adding a new task'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedHomework.map((item) => {
              const overdueFlag = isOverdue(item.dueDate) && item.status !== 'completed';
              return (
                <div key={item.id} className={`bg-white p-6 rounded-xl border transition-all hover:shadow-md ${
                  overdueFlag ? 'border-red-200 bg-red-50' : 'border-gray-200'
                }`}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <h4 className="font-semibold text-gray-900">{item.subject}</h4>
                        <Badge className={getStatusColor(overdueFlag ? 'overdue' : item.status)}>
                          {getStatusText(overdueFlag ? 'overdue' : item.status)}
                        </Badge>
                        <Badge variant="outline" className={getPriorityColor(item.priority)}>
                          {getPriorityText(item.priority)}
                        </Badge>
                        {overdueFlag && (
                          <Badge className="bg-red-100 text-red-800">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            {language === 'fr' ? 'En retard' : 'Overdue'}
                          </Badge>
                        )}
                      </div>
                      <h5 className="font-medium text-gray-800 mb-2">{item.title || ''}</h5>
                      {item.description && (
                        <p className="text-gray-600 text-sm mb-2">{item.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>
                          {language === 'fr' ? 'À rendre le:' : 'Due:'} 
                          <span className={overdueFlag ? 'text-red-600 font-medium' : ''}>
                            {new Date(item.dueDate).toLocaleDateString()}
                          </span>
                        </span>
                        {item.teacher && (
                          <span>{language === 'fr' ? 'Prof:' : 'Teacher:'} {item.teacher}</span>
                        )}
                        {item.estimatedDuration && (
                          <span>{item.estimatedDuration} {language === 'fr' ? 'min' : 'min'}</span>
                        )}
                      </div>
                      {item.grade && (
                        <div className="mt-2">
                          <span className="text-sm font-medium text-green-600">
                            {language === 'fr' ? 'Note:' : 'Grade:'} {item.grade}/20
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-2 ml-4">
                      {item.status !== 'completed' && (
                        <Select onValueChange={(value) => handleStatusUpdate(item.id, value)}>
                          <SelectTrigger className="w-32" disabled={updateStatusMutation.isPending}>
                            <SelectValue placeholder={language === 'fr' ? 'Statut' : 'Status'} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">{language === 'fr' ? 'À faire' : 'Pending'}</SelectItem>
                            <SelectItem value="in-progress">{language === 'fr' ? 'En cours' : 'In Progress'}</SelectItem>
                            <SelectItem value="completed">{language === 'fr' ? 'Terminé' : 'Completed'}</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                      <div className="flex gap-1">
                        {item.submissionUrl && (
                          <Button size="sm" variant="outline" asChild>
                            <a href={item.submissionUrl} target="_blank" rel="noopener noreferrer">
                              {language === 'fr' ? 'Voir' : 'View'}
                            </a>
                          </Button>
                        )}
                        <Button size="sm" variant="outline" data-testid={`button-details-${item.id}`}>
                          {language === 'fr' ? 'Détails' : 'Details'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ModernCard>
    </div>
  );
};

export default HomeworkOverview;