import React from 'react';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CalendarDays, 
  Clock, 
  Users, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  UserCheck,
  MessageSquare,
  TrendingUp,
  FileText,
  Plus,
  Search,
  Filter,
  MoreVertical
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface TeacherAbsence {
  id: number;
  teacherId: number;
  teacherName: string;
  schoolId: number;
  classId: number;
  className: string;
  subjectId: number;
  subjectName: string;
  absenceDate: string;
  startTime: string;
  endTime: string;
  reason: string;
  reasonCategory: string;
  isPlanned: boolean;
  status: string;
  priority: string;
  totalAffectedStudents: number;
  affectedClasses: Array<{
    classId: number;
    className: string;
    subjectId: number;
    subjectName: string;
    period: string;
  }>;
  parentsNotified: boolean;
  studentsNotified: boolean;
  adminNotified: boolean;
  replacementTeacherId?: number;
  substituteName?: string;
  substituteConfirmed: boolean;
  substituteInstructions?: string;
  isResolved: boolean;
  impactAssessment: string;
  createdAt: string;
  updatedAt: string;
}

interface AbsenceStats {
  totalAbsences: number;
  thisMonth: number;
  lastMonth: number;
  trend: string;
  averagePerWeek: number;
  byCategory: Array<{
    category: string;
    count: number;
    percentage: number;
  }>;
  byStatus: Array<{
    status: string;
    count: number;
    percentage: number;
  }>;
  impactMetrics: {
    totalStudentsAffected: number;
    averageStudentsPerAbsence: number;
    totalNotificationsSent: number;
    substituteSuccessRate: number;
  };
  performance: {
    averageResolutionTime: number;
    notificationSpeed: number;
    substituteAssignmentSpeed: number;
  };
}

const TeacherAbsenceManager: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState('current');
  const [selectedAbsence, setSelectedAbsence] = useState<TeacherAbsence | null>(null);
  const [showQuickActions, setShowQuickActions] = useState<number | null>(null);
  const queryClient = useQueryClient();

  // Fetch teacher absences
  const { data: absences = [], isLoading: absencesLoading } = useQuery<TeacherAbsence[]>({
    queryKey: ['/api/school/teacher-absences'],
    refetchInterval: 30000, // Refresh every 30 seconds for real-time updates
  });

  // Fetch absence statistics
  const { data: stats } = useQuery<AbsenceStats>({
    queryKey: ['/api/school/teacher-absences-stats'],
    refetchInterval: 60000, // Refresh every minute
  });

  // Quick action mutation
  const performActionMutation = useMutation({
    mutationFn: async ({ absenceId, actionType, actionData }: {
      absenceId: number;
      actionType: string;
      actionData: any;
    }) => {
      const response = await fetch(`/api/school/teacher-absences/${absenceId}/actions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ actionType, actionData })
      });
      
      if (!response.ok) {
        throw new Error('Action failed');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/school/teacher-absences'] });
      queryClient.invalidateQueries({ queryKey: ['/api/school/teacher-absences-stats'] });
      setShowQuickActions(null);
      toast({
        title: "Action effectuée",
        description: "L'action a été réalisée avec succès.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Échec de l'action",
        variant: "destructive",
      });
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'reported': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'notified': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'substitute_assigned': return 'bg-green-100 text-green-800 border-green-200';
      case 'resolved': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleQuickAction = async (absenceId: number, actionType: string, actionData: any = {}) => {
    performActionMutation.mutate({ absenceId, actionType, actionData });
  };

  const formatDateTime = (dateStr: string, timeStr?: string) => {
    const date = new Date(dateStr);
    let formatted = date.toLocaleDateString('fr-FR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    });
    
    if (timeStr) {
      formatted += ` à ${timeStr}`;
    }
    
    return formatted;
  };

  if (absencesLoading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse"></div>
            <span>Chargement des absences...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentAbsences = absences.filter((a) => !a.isResolved);
  const resolvedAbsences = absences.filter((a) => a.isResolved);
  const urgentAbsences = absences.filter((a) => 
    a.priority === 'urgent' || a.priority === 'high'
  );

  return (
    <div className="w-full space-y-6">
      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CalendarDays className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-600">Total ce mois</p>
                  <p className="text-2xl font-bold">{stats.thisMonth}</p>
                  <p className={`text-xs ${stats.trend === 'increasing' ? 'text-red-500' : 'text-green-500'}`}>
                    {stats.trend === 'increasing' ? '↗' : '↘'} {Math.abs(stats.thisMonth - stats.lastMonth)} vs mois dernier
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-orange-500" />
                <div>
                  <p className="text-sm text-gray-600">Élèves impactés</p>
                  <p className="text-2xl font-bold">{stats.impactMetrics.totalStudentsAffected}</p>
                  <p className="text-xs text-gray-500">
                    Moy. {stats.impactMetrics.averageStudentsPerAbsence} par absence
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <UserCheck className="w-5 h-5 text-green-500" />
                <div>
                  <p className="text-sm text-gray-600">Taux remplaçants</p>
                  <p className="text-2xl font-bold">{stats.impactMetrics.substituteSuccessRate}%</p>
                  <p className="text-xs text-gray-500">
                    Temps moyen: {stats.performance.substituteAssignmentSpeed}h
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-purple-500" />
                <div>
                  <p className="text-sm text-gray-600">Résolution moy.</p>
                  <p className="text-2xl font-bold">{stats.performance.averageResolutionTime}h</p>
                  <p className="text-xs text-gray-500">
                    Notification: {stats.performance.notificationSpeed}h
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Urgent Alerts */}
      {urgentAbsences.length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>{urgentAbsences.length} absence(s) urgente(s)</strong> nécessitent une attention immédiate.
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="current" className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4" />
            <span>En cours ({currentAbsences.length})</span>
          </TabsTrigger>
          <TabsTrigger value="resolved" className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4" />
            <span>Résolues ({resolvedAbsences.length})</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4" />
            <span>Analyses</span>
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center space-x-2">
            <FileText className="w-4 h-4" />
            <span>Rapports</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Absences en cours de traitement</h3>
            <Button size="sm" className="flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>Déclarer absence</span>
            </Button>
          </div>

          <div className="grid gap-4">
            {currentAbsences.map((absence: TeacherAbsence) => (
              <Card key={absence.id} className="relative">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 space-y-3">
                      {/* Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <h4 className="font-semibold text-lg">{absence.teacherName}</h4>
                          <Badge className={getPriorityColor(absence.priority)}>
                            {absence.priority.toUpperCase()}
                          </Badge>
                          <Badge className={getStatusColor(absence.status)}>
                            {absence.status === 'reported' && 'Signalée'}
                            {absence.status === 'notified' && 'Notifiée'}
                            {absence.status === 'substitute_assigned' && 'Remplaçant assigné'}
                            {absence.status === 'resolved' && 'Résolue'}
                          </Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowQuickActions(
                            showQuickActions === absence.id ? null : absence.id
                          )}
                          data-testid={`button-actions-${absence.id}`}
                        >
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </div>

                      {/* Details */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <CalendarDays className="w-4 h-4 text-gray-500" />
                          <span>{formatDateTime(absence.absenceDate)}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-gray-500" />
                          <span>{absence.startTime} - {absence.endTime}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Users className="w-4 h-4 text-gray-500" />
                          <span>{absence.totalAffectedStudents} élèves impactés</span>
                        </div>
                      </div>

                      {/* Affected Classes */}
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">Classes concernées:</p>
                        <div className="flex flex-wrap gap-2">
                          {absence.affectedClasses.map((cls, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {cls.className} - {cls.subjectName} ({cls.period})
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Reason */}
                      <div>
                        <p className="text-sm text-gray-600">
                          <strong>Motif:</strong> {absence.reason}
                        </p>
                      </div>

                      {/* Notifications Status */}
                      <div className="flex items-center space-x-4 text-sm">
                        <span className={`flex items-center space-x-1 ${absence.parentsNotified ? 'text-green-600' : 'text-gray-500'}`}>
                          {absence.parentsNotified ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                          <span>Parents notifiés</span>
                        </span>
                        <span className={`flex items-center space-x-1 ${absence.studentsNotified ? 'text-green-600' : 'text-gray-500'}`}>
                          {absence.studentsNotified ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                          <span>Élèves notifiés</span>
                        </span>
                        {absence.substituteName && (
                          <span className="flex items-center space-x-1 text-blue-600">
                            <UserCheck className="w-4 h-4" />
                            <span>Remplaçant: {absence.substituteName}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Quick Actions Panel */}
                    {showQuickActions === absence.id && (
                      <div className="absolute top-4 right-12 bg-white border rounded-lg shadow-lg p-4 z-10 min-w-64">
                        <h5 className="font-semibold mb-3">Actions rapides</h5>
                        <div className="space-y-2">
                          {!absence.parentsNotified && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full justify-start"
                              onClick={() => handleQuickAction(absence.id, 'notify_parents', {
                                targetAudience: 'parents',
                                notificationMethod: 'sms',
                                recipientCount: absence.totalAffectedStudents
                              })}
                              disabled={performActionMutation.isPending}
                              data-testid={`button-notify-parents-${absence.id}`}
                            >
                              <MessageSquare className="w-4 h-4 mr-2" />
                              Notifier les parents
                            </Button>
                          )}
                          
                          {!absence.studentsNotified && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full justify-start"
                              onClick={() => handleQuickAction(absence.id, 'notify_students', {
                                targetAudience: 'students',
                                notificationMethod: 'app',
                                recipientCount: absence.totalAffectedStudents
                              })}
                              disabled={performActionMutation.isPending}
                              data-testid={`button-notify-students-${absence.id}`}
                            >
                              <MessageSquare className="w-4 h-4 mr-2" />
                              Notifier les élèves
                            </Button>
                          )}
                          
                          {!absence.replacementTeacherId && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full justify-start"
                              onClick={() => {
                                // In a real implementation, this would open a substitute selection dialog
                                handleQuickAction(absence.id, 'assign_substitute', {
                                  substituteId: 20, // Sample substitute
                                  substituteName: 'Prof. Alice Nkomo',
                                  instructions: 'Poursuivre le programme selon le planning'
                                });
                              }}
                              disabled={performActionMutation.isPending}
                              data-testid={`button-assign-substitute-${absence.id}`}
                            >
                              <UserCheck className="w-4 h-4 mr-2" />
                              Assigner remplaçant
                            </Button>
                          )}
                          
                          {absence.status !== 'resolved' && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full justify-start"
                              onClick={() => handleQuickAction(absence.id, 'mark_resolved', {
                                notes: 'Absence traitée avec succès'
                              })}
                              disabled={performActionMutation.isPending}
                              data-testid={`button-mark-resolved-${absence.id}`}
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Marquer comme résolue
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}

            {currentAbsences.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <h4 className="font-semibold text-lg mb-2">Aucune absence en cours</h4>
                  <p className="text-gray-600">Toutes les absences ont été traitées avec succès.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="resolved" className="space-y-4">
          <h3 className="text-lg font-semibold">Absences résolues</h3>
          
          <div className="grid gap-4">
            {resolvedAbsences.map((absence: TeacherAbsence) => (
              <Card key={absence.id} className="opacity-75">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-3">
                        <h4 className="font-semibold">{absence.teacherName}</h4>
                        <Badge className="bg-green-100 text-green-800 border-green-200">
                          Résolue
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>{formatDateTime(absence.absenceDate)}</span>
                        <span>{absence.startTime} - {absence.endTime}</span>
                        <span>{absence.subjectName} - {absence.className}</span>
                      </div>
                      {absence.substituteName && (
                        <p className="text-sm text-blue-600">
                          Remplaçant: {absence.substituteName}
                        </p>
                      )}
                    </div>
                    <div className="text-right text-sm text-gray-500">
                      Résolu le {formatDateTime(absence.updatedAt)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {resolvedAbsences.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h4 className="font-semibold text-lg mb-2">Aucune absence résolue</h4>
                  <p className="text-gray-600">L'historique des absences résolues apparaîtra ici.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <h3 className="text-lg font-semibold">Analyses et statistiques</h3>
          
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* By Category Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Répartition par catégorie</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stats.byCategory.map((cat, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-sm capitalize">{cat.category}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 h-2 bg-gray-200 rounded">
                            <div 
                              className="h-full bg-blue-500 rounded"
                              style={{ width: `${cat.percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium">{cat.count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* By Status Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Répartition par statut</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stats.byStatus.map((status, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-sm capitalize">
                          {status.status === 'resolved' && 'Résolues'}
                          {status.status === 'substitute_assigned' && 'Remplaçant assigné'}
                          {status.status === 'reported' && 'Signalées'}
                        </span>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 h-2 bg-gray-200 rounded">
                            <div 
                              className="h-full bg-green-500 rounded"
                              style={{ width: `${status.percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium">{status.count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Rapports mensuels</h3>
            <Button size="sm" className="flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>Générer rapport</span>
            </Button>
          </div>
          
          <Card>
            <CardContent className="p-8 text-center">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h4 className="font-semibold text-lg mb-2">Rapports en développement</h4>
              <p className="text-gray-600">
                La génération automatique de rapports mensuels sera bientôt disponible.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TeacherAbsenceManager;