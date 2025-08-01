import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  BookOpen, Calendar, Clock, CheckCircle, AlertCircle, 
  Upload, Send, Eye, Filter, Search, User
} from 'lucide-react';

const StudentHomework: React.FC = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedHomework, setSelectedHomework] = useState<any>(null);
  const [submissionText, setSubmissionText] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [submissionForm, setSubmissionForm] = useState({
    homeworkId: '',
    content: '',
    attachments: ''
  });

  // Fetch homework data from API
  const { data: homework = [], isLoading } = useQuery<any[]>({
    queryKey: ['/api/student/homework'],
    enabled: !!user
  });

  // Submit homework mutation
  const submitHomeworkMutation = useMutation({
    mutationFn: async (homeworkData: any) => {
      const response = await fetch('/api/student/homework', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(homeworkData),
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to submit homework');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/student/homework'] });
      setIsSubmitOpen(false);
      setSubmissionForm({ homeworkId: '', content: '', attachments: '' });
      toast({
        title: 'Devoir soumis',
        description: 'Votre devoir a été soumis avec succès.'
      });
    },
    onError: () => {
      toast({
        title: 'Erreur',
        description: 'Impossible de soumettre le devoir.',
        variant: 'destructive'
      });
    }
  });

  const handleSubmitHomework = () => {
    if (submissionForm.homeworkId && submissionForm.content) {
      submitHomeworkMutation.mutate(submissionForm);
    }
  };

  const text = {
    fr: {
      title: 'Mes Devoirs',
      subtitle: 'Gérez vos devoirs et soumissions',
      filterAll: 'Tous',
      filterTodo: 'À faire',
      filterInProgress: 'En cours',
      filterCompleted: 'Terminé',
      dueDate: 'Échéance',
      priority: 'Priorité',
      subject: 'Matière',
      teacher: 'Professeur',
      description: 'Description',
      submit: 'Soumettre',
      submitting: 'Soumission...',
      viewDetails: 'Voir détails',
      submissionText: 'Votre soumission',
      writeSubmission: 'Écrivez votre réponse ici...',
      high: 'Haute',
      medium: 'Moyenne',
      low: 'Basse',
      status: {
        'pending': 'À faire',
        'in_progress': 'En cours', 
        'completed': 'Terminé'
      }
    },
    en: {
      title: 'My Homework',
      subtitle: 'Manage your assignments and submissions',
      filterAll: 'All',
      filterTodo: 'To Do',
      filterInProgress: 'In Progress',
      filterCompleted: 'Completed',
      dueDate: 'Due Date',
      priority: 'Priority',
      subject: 'Subject',
      teacher: 'Teacher',
      description: 'Description',
      submit: 'Submit',
      submitting: 'Submitting...',
      viewDetails: 'View Details',
      submissionText: 'Your Submission',
      writeSubmission: 'Write your response here...',
      high: 'High',
      medium: 'Medium',
      low: 'Low',
      status: {
        'pending': 'To Do',
        'in_progress': 'In Progress',
        'completed': 'Completed'
      }
    }
  };

  const t = text[language as keyof typeof text];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-orange-100 text-orange-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredHomework = (homework || []).filter((hw: any) => {
    if (filterStatus === 'all') return true;
    return hw.status === filterStatus;
  });

  const handleSubmit = () => {
    if (!selectedHomework || !submissionText.trim()) return;
    submitHomeworkMutation.mutate({
      id: selectedHomework.id,
      submission: submissionText
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{language === 'fr' ? 'Chargement des devoirs...' : 'Loading homework...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{t.title}</h1>
          <p className="text-gray-600">{t.subtitle}</p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex gap-2 flex-wrap">
          <Button
            variant={filterStatus === 'all' ? 'default' : 'outline'}
            onClick={() => setFilterStatus('all')}
            size="sm"
          >
            {t.filterAll}
          </Button>
          <Button
            variant={filterStatus === 'pending' ? 'default' : 'outline'}
            onClick={() => setFilterStatus('pending')}
            size="sm"
          >
            {t.filterTodo}
          </Button>
          <Button
            variant={filterStatus === 'in_progress' ? 'default' : 'outline'}
            onClick={() => setFilterStatus('in_progress')}
            size="sm"
          >
            {t.filterInProgress}
          </Button>
          <Button
            variant={filterStatus === 'completed' ? 'default' : 'outline'}
            onClick={() => setFilterStatus('completed')}
            size="sm"
          >
            {t.filterCompleted}
          </Button>
        </div>

        {/* Soumettre un Devoir Section */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                <Send className="w-5 h-5 mr-2 inline" />
                Soumettre un Devoir
              </h3>
            </div>
          </CardHeader>
          <CardContent>
            <Dialog open={isSubmitOpen} onOpenChange={setIsSubmitOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700 w-full" data-testid="button-submit-homework">
                  <Send className="w-4 h-4 mr-2" />
                  Soumettre un Devoir
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Soumettre un Devoir</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Devoir à soumettre</label>
                    <select
                      value={submissionForm.homeworkId}
                      onChange={(e) => setSubmissionForm(prev => ({ ...prev, homeworkId: e.target.value }))}
                      className="w-full border rounded-md px-3 py-2"
                    >
                      <option value="">Sélectionner un devoir</option>
                      {(homework || []).filter(hw => hw.status === 'pending').map(hw => (
                        <option key={hw.id} value={hw.id}>
                          {hw.subject} - {hw.title}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Votre réponse</label>
                    <Textarea
                      value={submissionForm.content}
                      onChange={(e) => setSubmissionForm(prev => ({ ...prev, content: e.target.value }))}
                      placeholder="Rédigez votre réponse ici..."
                      rows={6}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Pièces jointes (optionnel)</label>
                    <Input
                      value={submissionForm.attachments}
                      onChange={(e) => setSubmissionForm(prev => ({ ...prev, attachments: e.target.value }))}
                      placeholder="Liens vers vos fichiers ou documents"
                    />
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button 
                      onClick={handleSubmitHomework}
                      disabled={submitHomeworkMutation.isPending || !submissionForm.homeworkId || !submissionForm.content}
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                    >
                      {submitHomeworkMutation.isPending ? 'Envoi...' : 'Soumettre le Devoir'}
                    </Button>
                    <Button variant="outline" onClick={() => setIsSubmitOpen(false)}>
                      Annuler
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        {/* Homework Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {(Array.isArray(filteredHomework) ? filteredHomework : []).map((hw: any) => (
            <Card key={hw.id} className="bg-white hover:shadow-lg transition-shadow border-gray-200">
              <CardHeader className="pb-3 bg-white">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-gray-900 mb-2">{hw.title}</h3>
                    <div className="flex gap-2 mb-2">
                      <Badge className={getStatusColor(hw.status)}>
                        {t.status[hw.status as keyof typeof t.status] || hw.status}
                      </Badge>
                      <Badge className={getPriorityColor(hw.priority)}>
                        {hw.priority === 'high' ? t.high : 
                         hw.priority === 'medium' ? t.medium : 
                         hw.priority === 'low' ? t.low : hw.priority}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="bg-white">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <BookOpen className="w-4 h-4" />
                    <span>{hw.subject}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>{t.dueDate}: {new Date(hw.dueDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <User className="w-4 h-4" />
                    <span>{hw.teacher}</span>
                  </div>
                  <p className="text-sm text-gray-700 line-clamp-2">{hw.description}</p>
                  
                  <div className="flex gap-2 pt-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedHomework(hw)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          {t.viewDetails}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl bg-white">
                        <DialogHeader className="bg-white">
                          <DialogTitle>{hw.title}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 bg-white">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label className="text-sm font-medium">{t.subject}</Label>
                              <p className="text-sm text-gray-600">{hw.subject}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium">{t.teacher}</Label>
                              <p className="text-sm text-gray-600">{hw.teacher}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium">{t.dueDate}</Label>
                              <p className="text-sm text-gray-600">{new Date(hw.dueDate).toLocaleDateString()}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium">{t.priority}</Label>
                              <Badge className={getPriorityColor(hw.priority)}>
                                {hw.priority === 'high' ? t.high : 
                                 hw.priority === 'medium' ? t.medium : 
                                 hw.priority === 'low' ? t.low : hw.priority}
                              </Badge>
                            </div>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">{t.description}</Label>
                            <p className="text-sm text-gray-700 mt-1">{hw.description}</p>
                          </div>
                          
                          {hw.status !== 'completed' && (
                            <div className="space-y-4 pt-4 border-t bg-white">
                              <Label className="text-sm font-medium">{t.submissionText}</Label>
                              <Textarea
                                value={submissionText}
                                onChange={(e) => setSubmissionText(e?.target?.value)}
                                placeholder={t.writeSubmission}
                                rows={4}
                                className="bg-white border-gray-300 focus:border-blue-500"
                              />
                              <Button
                                onClick={handleSubmit}
                                disabled={!submissionText.trim() || submitHomeworkMutation.isPending}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                              >
                                <Send className="w-4 h-4 mr-2" />
                                {submitHomeworkMutation.isPending ? t.submitting : t.submit}
                              </Button>
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {(Array.isArray(filteredHomework) ? filteredHomework.length : 0) === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {language === 'fr' ? 'Aucun devoir trouvé' : 'No homework found'}
            </h3>
            <p className="text-gray-600">
              {language === 'fr' 
                ? 'Aucun devoir ne correspond aux filtres sélectionnés.' 
                : 'No homework matches the selected filters.'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentHomework;