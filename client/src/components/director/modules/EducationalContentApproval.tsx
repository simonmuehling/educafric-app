import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  FileText, 
  User, 
  Calendar,
  MessageSquare,
  Eye,
  Download,
  TrendingUp,
  BarChart3,
  Award,
  Filter
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Textarea } from '../../ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { Input } from '../../ui/input';
import { useToast } from '../../../hooks/use-toast';

interface PendingContent {
  id: number;
  title: string;
  description: string;
  type: string;
  subject: string;
  level: string;
  duration: number;
  objectives: string;
  teacherId: number;
  teacherName: string;
  schoolId: number;
  files: Array<{filename: string; originalName: string}>;
  status: string;
  submittedAt: string;
  visibility: string;
  tags: string[];
}

interface ContentStats {
  totalContent: number;
  pendingApproval: number;
  approved: number;
  rejected: number;
  shared: number;
  bySubject: Record<string, number>;
  byType: Record<string, number>;
  topContributors: Array<{teacherId: number; teacherName: string; contentCount: number}>;
}

const EducationalContentApproval: React.FC = () => {
  const [selectedContent, setSelectedContent] = useState<PendingContent | null>(null);
  const [approvalComment, setApprovalComment] = useState('');
  const [isApprovalDialogOpen, setIsApprovalDialogOpen] = useState(false);
  const [approvalAction, setApprovalAction] = useState<'approve' | 'reject'>('approve');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSubject, setFilterSubject] = useState('all');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch pending content
  const { data: pendingData, isLoading: pendingLoading } = useQuery({
    queryKey: ['/api/educational-content/pending-approval'],
    refetchInterval: 30000
  });

  // Fetch content statistics
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/educational-content/stats'],
    refetchInterval: 60000
  });

  // Approval mutation
  const approvalMutation = useMutation({
    mutationFn: async ({ contentId, approved, comment }: { contentId: number; approved: boolean; comment: string }) => {
      const response = await fetch(`/api/educational-content/${contentId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved, comment })
      });
      
      if (!response.ok) {
        throw new Error('Failed to process approval');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Action terminée",
        description: data.message,
        variant: "default"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/educational-content/pending-approval'] });
      queryClient.invalidateQueries({ queryKey: ['/api/educational-content/stats'] });
      setIsApprovalDialogOpen(false);
      setApprovalComment('');
      setSelectedContent(null);
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de traiter l'approbation",
        variant: "destructive"
      });
    }
  });

  const handleApprovalAction = (content: PendingContent, action: 'approve' | 'reject') => {
    setSelectedContent(content);
    setApprovalAction(action);
    setIsApprovalDialogOpen(true);
  };

  const submitApproval = () => {
    if (selectedContent) {
      approvalMutation.mutate({
        contentId: selectedContent.id,
        approved: approvalAction === 'approve',
        comment: approvalComment
      });
    }
  };

  const pendingContent: PendingContent[] = (pendingData as any)?.pendingContent || [];
  const stats: ContentStats = (statsData as any)?.stats || {
    totalContent: 0,
    pendingApproval: 0,
    approved: 0,
    rejected: 0,
    shared: 0,
    bySubject: {},
    byType: {},
    topContributors: []
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'lesson': return <FileText className="w-4 h-4" />;
      case 'exercise': return <BarChart3 className="w-4 h-4" />;
      case 'assessment': return <Award className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'lesson': return 'Leçon';
      case 'exercise': return 'Exercice';
      case 'assessment': return 'Évaluation';
      case 'project': return 'Projet';
      default: return type;
    }
  };

  const getSubjectLabel = (subject: string) => {
    switch (subject) {
      case 'mathematiques': return 'Mathématiques';
      case 'francais': return 'Français';
      case 'anglais': return 'Anglais';
      case 'physique': return 'Physique-Chimie';
      case 'histoire': return 'Histoire-Géo';
      default: return subject;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (pendingLoading || statsLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Validation Contenu Pédagogique</h2>
          <p className="text-gray-600">Approuvez ou rejetez le contenu soumis par les enseignants</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="p-4 text-center bg-gradient-to-br from-blue-50 to-blue-100">
          <div className="text-2xl font-bold text-blue-700">{stats.totalContent}</div>
          <div className="text-sm text-blue-600">Total Contenu</div>
        </Card>
        <Card className="p-4 text-center bg-gradient-to-br from-orange-50 to-orange-100">
          <div className="text-2xl font-bold text-orange-700">{stats.pendingApproval}</div>
          <div className="text-sm text-orange-600">En Attente</div>
        </Card>
        <Card className="p-4 text-center bg-gradient-to-br from-green-50 to-green-100">
          <div className="text-2xl font-bold text-green-700">{stats.approved}</div>
          <div className="text-sm text-green-600">Approuvé</div>
        </Card>
        <Card className="p-4 text-center bg-gradient-to-br from-red-50 to-red-100">
          <div className="text-2xl font-bold text-red-700">{stats.rejected}</div>
          <div className="text-sm text-red-600">Rejeté</div>
        </Card>
        <Card className="p-4 text-center bg-gradient-to-br from-purple-50 to-purple-100">
          <div className="text-2xl font-bold text-purple-700">{stats.shared}</div>
          <div className="text-sm text-purple-600">Partagé</div>
        </Card>
      </div>

      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Contenu en Attente ({stats.pendingApproval})
          </TabsTrigger>
          <TabsTrigger value="statistics" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Statistiques
          </TabsTrigger>
          <TabsTrigger value="contributors" className="flex items-center gap-2">
            <Award className="w-4 h-4" />
            Contributeurs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {/* Filters */}
          <div className="flex gap-4 items-center">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
              className="px-3 py-2 border rounded-lg"
            >
              <option value="all">Toutes les matières</option>
              <option value="mathematiques">Mathématiques</option>
              <option value="francais">Français</option>
              <option value="anglais">Anglais</option>
              <option value="physique">Physique-Chimie</option>
              <option value="histoire">Histoire-Géo</option>
            </select>
          </div>

          {/* Pending Content List */}
          <div className="space-y-4">
            {pendingContent.length === 0 ? (
              <Card className="p-8 text-center">
                <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Aucun contenu en attente</h3>
                <p className="text-gray-600">Tous les contenus soumis ont été traités.</p>
              </Card>
            ) : (
              pendingContent.map((content) => (
                <Card key={content.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        {getTypeIcon(content.type)}
                        <h3 className="text-lg font-semibold">{content.title}</h3>
                        <Badge variant="outline">{getTypeLabel(content.type)}</Badge>
                        <Badge variant="secondary">{getSubjectLabel(content.subject)}</Badge>
                        <Badge variant="outline">{content.level}</Badge>
                      </div>
                      
                      <p className="text-gray-600 mb-3">{content.description}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <User className="w-4 h-4" />
                          <span>{content.teacherName}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(content.submittedAt)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Clock className="w-4 h-4" />
                          <span>{content.duration} min</span>
                        </div>
                      </div>

                      {content.objectives && (
                        <div className="mb-3">
                          <strong className="text-sm">Objectifs:</strong>
                          <p className="text-sm text-gray-600">{content.objectives}</p>
                        </div>
                      )}

                      {content.files.length > 0 && (
                        <div className="mb-4">
                          <strong className="text-sm">Fichiers joints:</strong>
                          <div className="flex gap-2 mt-1">
                            {content.files.map((file, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                <FileText className="w-3 h-3 mr-1" />
                                {file.originalName}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-1">
                        {content.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 ml-4">
                      <Button
                        onClick={() => handleApprovalAction(content, 'approve')}
                        className="bg-green-600 hover:bg-green-700"
                        disabled={approvalMutation.isPending}
                      >
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Approuver
                      </Button>
                      <Button
                        onClick={() => handleApprovalAction(content, 'reject')}
                        variant="destructive"
                        disabled={approvalMutation.isPending}
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Rejeter
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="statistics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* By Subject */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Contenu par Matière
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(stats.bySubject).map(([subject, count]) => (
                    <div key={subject} className="flex items-center justify-between">
                      <span className="text-sm">{getSubjectLabel(subject)}</span>
                      <Badge variant="secondary">{count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* By Type */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Contenu par Type
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(stats.byType).map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between">
                      <span className="text-sm">{getTypeLabel(type)}</span>
                      <Badge variant="secondary">{count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="contributors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                Top Contributeurs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.topContributors.map((contributor, index) => (
                  <div key={contributor.teacherId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium">{contributor.teacherName}</div>
                        <div className="text-sm text-gray-500">Enseignant</div>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-sm">
                      {contributor.contentCount} contenus
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Approval Dialog */}
      <Dialog open={isApprovalDialogOpen} onOpenChange={setIsApprovalDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {approvalAction === 'approve' ? 'Approuver le contenu' : 'Rejeter le contenu'}
            </DialogTitle>
          </DialogHeader>
          
          {selectedContent && (
            <div className="space-y-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <h4 className="font-medium">{selectedContent.title}</h4>
                <p className="text-sm text-gray-600">par {selectedContent.teacherName}</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Commentaire {approvalAction === 'reject' ? '(requis)' : '(optionnel)'}
                </label>
                <Textarea
                  value={approvalComment}
                  onChange={(e) => setApprovalComment(e.target.value)}
                  placeholder={
                    approvalAction === 'approve' 
                      ? "Félicitations pour ce contenu de qualité..."
                      : "Raison du rejet et suggestions d'amélioration..."
                  }
                  rows={4}
                />
              </div>

              <div className="flex gap-2 justify-end">
                <Button 
                  variant="outline" 
                  onClick={() => setIsApprovalDialogOpen(false)}
                  disabled={approvalMutation.isPending}
                >
                  Annuler
                </Button>
                <Button
                  onClick={submitApproval}
                  className={approvalAction === 'approve' ? 'bg-green-600 hover:bg-green-700' : ''}
                  variant={approvalAction === 'reject' ? 'destructive' : 'default'}
                  disabled={approvalMutation.isPending || (approvalAction === 'reject' && !approvalComment.trim())}
                >
                  {approvalMutation.isPending ? 'Traitement...' : (
                    approvalAction === 'approve' ? 'Approuver' : 'Rejeter'
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EducationalContentApproval;