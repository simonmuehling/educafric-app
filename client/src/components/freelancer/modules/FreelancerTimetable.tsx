import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { 
  Calendar, Clock, Plus, Edit3, Save, X, Users, 
  BookOpen, MapPin, DollarSign, User, CheckCircle,
  RefreshCw, AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ModernCard } from '@/components/ui/ModernCard';

interface TutoringSession {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  subject: string;
  student: string;
  location: string;
  rate: number;
  status: 'confirmed' | 'pending' | 'completed';
}

const FreelancerTimetable = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedDay, setSelectedDay] = useState('monday');
  const [isEditing, setIsEditing] = useState(false);
  const [selectedSession, setSelectedSession] = useState<TutoringSession | null>(null);

  const t = {
    fr: {
      title: 'Planning des Répétitions',
      subtitle: 'Gestion de vos séances de tutorat privé',
      days: {
        monday: 'Lundi',
        tuesday: 'Mardi',
        wednesday: 'Mercredi',
        thursday: 'Jeudi',
        friday: 'Vendredi',
        saturday: 'Samedi',
        sunday: 'Dimanche'
      },
      addSession: 'Nouvelle Séance',
      editSession: 'Modifier Séance',
      saveChanges: 'Sauvegarder',
      cancel: 'Annuler',
      subject: 'Matière',
      student: 'Élève',
      location: 'Lieu',
      rate: 'Tarif',
      status: 'Statut',
      noSessions: 'Aucune séance programmée',
      createFirst: 'Créer votre première séance',
      confirmed: 'Confirmé',
      pending: 'En attente',
      completed: 'Terminé',
      totalSessions: 'Total séances',
      weeklyEarnings: 'Revenus semaine',
      nextSession: 'Prochaine séance'
    },
    en: {
      title: 'Tutoring Schedule',
      subtitle: 'Manage your private tutoring sessions',
      days: {
        monday: 'Monday',
        tuesday: 'Tuesday',
        wednesday: 'Wednesday',
        thursday: 'Thursday',
        friday: 'Friday',
        saturday: 'Saturday',
        sunday: 'Sunday'
      },
      addSession: 'New Session',
      editSession: 'Edit Session',
      saveChanges: 'Save Changes',
      cancel: 'Cancel',
      subject: 'Subject',
      student: 'Student',
      location: 'Location',
      rate: 'Rate',
      status: 'Status',
      noSessions: 'No sessions scheduled',
      createFirst: 'Create your first session',
      confirmed: 'Confirmed',
      pending: 'Pending',
      completed: 'Completed',
      totalSessions: 'Total sessions',
      weeklyEarnings: 'Weekly earnings',
      nextSession: 'Next session'
    }
  };

  const text = t[language as keyof typeof t];

  // Fetch tutoring schedule from API
  const { data: tutoringSchedule = [], isLoading, error, refetch } = useQuery<TutoringSession[]>({
    queryKey: ['/api/freelancer/schedule'],
    queryFn: async () => {
      console.log('[FREELANCER_TIMETABLE] 🔍 Fetching schedule...');
      const response = await fetch('/api/freelancer/schedule', {
        credentials: 'include'
      });
      if (!response.ok) {
        console.error('[FREELANCER_TIMETABLE] ❌ Failed to fetch schedule');
        throw new Error('Failed to fetch schedule');
      }
      const data = await response.json();
      console.log('[FREELANCER_TIMETABLE] ✅ Schedule loaded:', data.length);
      return data;
    },
    enabled: !!user,
    retry: 2
  });

  // Add session mutation
  const addSessionMutation = useMutation({
    mutationFn: async (sessionData: Partial<TutoringSession>) => {
      const response = await fetch('/api/freelancer/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sessionData),
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to add session');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/freelancer/schedule'] });
      setIsEditing(false);
      setSelectedSession(null);
      toast({
        title: language === 'fr' ? 'Séance ajoutée' : 'Session added',
        description: language === 'fr' ? 'La séance a été ajoutée avec succès' : 'Session has been added successfully'
      });
    },
    onError: () => {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' ? 'Impossible d\'ajouter la séance' : 'Failed to add session',
        variant: 'destructive'
      });
    }
  });

  // Update session mutation
  const updateSessionMutation = useMutation({
    mutationFn: async (sessionData: TutoringSession) => {
      const response = await fetch(`/api/freelancer/schedule/${sessionData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sessionData),
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to update session');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/freelancer/schedule'] });
      setIsEditing(false);
      setSelectedSession(null);
      toast({
        title: language === 'fr' ? 'Séance modifiée' : 'Session updated',
        description: language === 'fr' ? 'La séance a été modifiée avec succès' : 'Session has been updated successfully'
      });
    },
    onError: () => {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' ? 'Impossible de modifier la séance' : 'Failed to update session',
        variant: 'destructive'
      });
    }
  });

  // Delete session mutation
  const deleteSessionMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      const response = await fetch(`/api/freelancer/schedule/${sessionId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to delete session');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/freelancer/schedule'] });
      toast({
        title: language === 'fr' ? 'Séance supprimée' : 'Session deleted',
        description: language === 'fr' ? 'La séance a été supprimée avec succès' : 'Session has been deleted successfully'
      });
    },
    onError: () => {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' ? 'Impossible de supprimer la séance' : 'Failed to delete session',
        variant: 'destructive'
      });
    }
  });

  const getDaySessions = (day: string) => {
    return tutoringSchedule
      .filter(session => session.day === day)
      .sort((a, b) => a?.startTime?.localeCompare(b.startTime));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleAddSession = () => {
    const newSession: TutoringSession = {
      id: 'new',
      day: selectedDay,
      startTime: '14:00',
      endTime: '15:00',
      subject: language === 'fr' ? 'Nouvelle Matière' : 'New Subject',
      student: language === 'fr' ? 'Nouvel Élève' : 'New Student',
      location: language === 'fr' ? 'À définir' : 'To be defined',
      rate: 4000,
      status: 'pending'
    };
    
    setSelectedSession(newSession);
    setIsEditing(true);
  };

  const handleEditSession = (session: TutoringSession) => {
    setSelectedSession(session);
    setIsEditing(true);
  };

  const handleSaveSession = () => {
    if (!selectedSession) return;
    
    if (selectedSession.id && selectedSession.id !== 'new') {
      updateSessionMutation.mutate(selectedSession);
    } else {
      const newSession = { ...selectedSession, id: undefined };
      addSessionMutation.mutate(newSession);
    }
  };

  const handleDeleteSession = (sessionId: string) => {
    deleteSessionMutation.mutate(sessionId);
  };

  const TutoringSessionCard = ({ session }: { session: TutoringSession }) => (
    <ModernCard className="mb-3 hover:shadow-lg transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-bold">
                {session.startTime} - {session.endTime}
              </div>
              <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                {session.subject}
              </div>
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(session.status)}`}>
                {text[session.status as keyof typeof text]}
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <User className="w-4 h-4" />
                {session.student}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {session.location}
              </span>
              <span className="flex items-center gap-1">
                <DollarSign className="w-4 h-4" />
                {session.rate} CFA
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleEditSession(session)}
            >
              <Edit3 className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleDeleteSession(session.id)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </ModernCard>
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">
            {language === 'fr' ? 'Chargement du planning...' : 'Loading schedule...'}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">
            {language === 'fr' ? 'Erreur lors du chargement' : 'Error loading schedule'}
          </p>
          <Button onClick={() => refetch()} className="mt-4">
            <RefreshCw className="w-4 h-4 mr-2" />
            {language === 'fr' ? 'Réessayer' : 'Retry'}
          </Button>
        </div>
      </div>
    );
  }

  const weeklyEarnings = (Array.isArray(tutoringSchedule) ? tutoringSchedule : []).reduce((total, session) => total + session.rate, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{text.title || ''}</h2>
          <p className="text-gray-600">{text.subtitle}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
            {language === 'fr' ? 'Répétiteur' : 'Freelancer'}
          </div>
          <Button onClick={handleAddSession} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            {text.addSession}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{(Array.isArray(tutoringSchedule) ? tutoringSchedule.length : 0)}</div>
            <div className="text-sm text-gray-600">{text.totalSessions}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{weeklyEarnings.toLocaleString()} CFA</div>
            <div className="text-sm text-gray-600">{text.weeklyEarnings}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {(Array.isArray(tutoringSchedule) ? tutoringSchedule : []).filter(s => s.status === 'confirmed').length}
            </div>
            <div className="text-sm text-gray-600">{text.confirmed}</div>
          </CardContent>
        </Card>
      </div>

      {/* Days Navigation */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-2">
            {Object.entries(text.days).map(([key, day]) => (
              <Button
                key={key}
                variant={selectedDay === key ? "default" : "outline"}
                onClick={() => setSelectedDay(key)}
                className="flex-1 min-w-[100px]"
              >
                {day}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Schedule Display */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                {text.days[selectedDay as keyof typeof text.days]}
              </h3>
            </CardHeader>
            <CardContent>
              {getDaySessions(selectedDay).length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-600 mb-2">
                    {text.noSessions}
                  </h4>
                  <Button onClick={handleAddSession} variant="outline">
                    {text.createFirst}
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {getDaySessions(selectedDay).map(session => (
                    <TutoringSessionCard key={session.id} session={session} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Weekly Overview */}
        <div>
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">
                {language === 'fr' ? 'Aperçu Semaine' : 'Weekly Overview'}
              </h3>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(text.days).map(([key, day]) => {
                const daySessionCount = getDaySessions(key).length;
                const dayEarnings = getDaySessions(key).reduce((sum, session) => sum + session.rate, 0);
                return (
                  <div key={key} className="flex justify-between items-center">
                    <span className="text-sm font-medium">{day}</span>
                    <div className="text-right">
                      <div className="text-sm font-medium">{daySessionCount} séances</div>
                      <div className="text-xs text-gray-500">{dayEarnings.toLocaleString()} CFA</div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditing && selectedSession && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <h3 className="text-lg font-semibold">
                {selectedSession?.id === 'new' ? text.addSession : text.editSession}
              </h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">{text.subject}</label>
                <input
                  type="text"
                  value={selectedSession.subject}
                  onChange={(e) => setSelectedSession({...selectedSession, subject: e?.target?.value})}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{text.student}</label>
                <input
                  type="text"
                  value={selectedSession.student}
                  onChange={(e) => setSelectedSession({...selectedSession, student: e?.target?.value})}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    {language === 'fr' ? 'Début' : 'Start'}
                  </label>
                  <input
                    type="time"
                    value={selectedSession.startTime}
                    onChange={(e) => setSelectedSession({...selectedSession, startTime: e?.target?.value})}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    {language === 'fr' ? 'Fin' : 'End'}
                  </label>
                  <input
                    type="time"
                    value={selectedSession.endTime}
                    onChange={(e) => setSelectedSession({...selectedSession, endTime: e?.target?.value})}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{text.location}</label>
                <input
                  type="text"
                  value={selectedSession.location}
                  onChange={(e) => setSelectedSession({...selectedSession, location: e?.target?.value})}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{text.rate} (CFA)</label>
                <input
                  type="number"
                  value={selectedSession.rate}
                  onChange={(e) => setSelectedSession({...selectedSession, rate: parseInt(e?.target?.value)})}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button 
                  onClick={handleSaveSession} 
                  disabled={addSessionMutation.isPending || updateSessionMutation.isPending}
                  className="flex-1"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {(addSessionMutation.isPending || updateSessionMutation.isPending) 
                    ? (language === 'fr' ? 'Sauvegarde...' : 'Saving...')
                    : text.saveChanges
                  }
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {setIsEditing(false); setSelectedSession(null);}}
                  className="flex-1"
                >
                  {text.cancel}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default FreelancerTimetable;