import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Calendar, Clock, Users, MapPin, 
  Plus, Filter, CheckCircle, AlertCircle,
  Play, Pause, Edit, Eye, FileText
} from 'lucide-react';

interface FreelancerSession {
  id: number;
  title: string;
  subject: string;
  studentName: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: string;
  location: string;
  status: string;
  studentCount: number;
  type: string;
  notes: string;
  materials: string[];
}

const FunctionalFreelancerSessions: React.FC = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Fetch freelancer sessions data from PostgreSQL API
  const { data: sessions = [], isLoading } = useQuery<FreelancerSession[]>({
    queryKey: ['/api/freelancer/sessions'],
    enabled: !!user
  });

  const text = {
    fr: {
      title: 'Mes Séances',
      subtitle: 'Gérez vos séances de cours particuliers et votre planning',
      loading: 'Chargement des séances...',
      noData: 'Aucune séance programmée',
      stats: {
        totalSessions: 'Séances Totales',
        completed: 'Terminées',
        scheduled: 'Programmées',
        thisWeek: 'Cette Semaine'
      },
      status: {
        completed: 'Terminée',
        scheduled: 'Programmée',
        ongoing: 'En cours',
        cancelled: 'Annulée'
      },
      actions: {
        newSession: 'Nouvelle Séance',
        startSession: 'Commencer',
        editSession: 'Modifier',
        viewNotes: 'Voir Notes',
        addNotes: 'Ajouter Notes'
      },
      filters: {
        all: 'Toutes',
        today: 'Aujourd\'hui',
        scheduled: 'Programmées',
        completed: 'Terminées'
      },
      session: {
        subject: 'Matière',
        student: 'Élève',
        time: 'Horaire',
        duration: 'Durée',
        location: 'Lieu',
        materials: 'Matériel',
        notes: 'Notes',
        type: 'Type'
      }
    },
    en: {
      title: 'My Sessions',
      subtitle: 'Manage your tutoring sessions and schedule',
      loading: 'Loading sessions...',
      noData: 'No sessions scheduled',
      stats: {
        totalSessions: 'Total Sessions',
        completed: 'Completed',
        scheduled: 'Scheduled',
        thisWeek: 'This Week'
      },
      status: {
        completed: 'Completed',
        scheduled: 'Scheduled',
        ongoing: 'Ongoing',
        cancelled: 'Cancelled'
      },
      actions: {
        newSession: 'New Session',
        startSession: 'Start',
        editSession: 'Edit',
        viewNotes: 'View Notes',
        addNotes: 'Add Notes'
      },
      filters: {
        all: 'All',
        today: 'Today',
        scheduled: 'Scheduled',
        completed: 'Completed'
      },
      session: {
        subject: 'Subject',
        student: 'Student',
        time: 'Time',
        duration: 'Duration',
        location: 'Location',
        materials: 'Materials',
        notes: 'Notes',
        type: 'Type'
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

  // Filter sessions
  const filteredSessions = (Array.isArray(sessions) ? sessions : []).filter(session => {
    if (!session) return false;
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'today') return session.date === selectedDate;
    return session.status === selectedFilter;
  });

  // Calculate statistics
  const totalSessions = (Array.isArray(sessions) ? sessions.length : 0);
  const completedSessions = (Array.isArray(sessions) ? sessions : []).filter(s => s.status === 'completed').length;
  const scheduledSessions = (Array.isArray(sessions) ? sessions : []).filter(s => s.status === 'scheduled').length;
  
  // Get this week's sessions
  const today = new Date();
  const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
  const endOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 6));
  const thisWeekSessions = (Array.isArray(sessions) ? sessions : []).filter(s => {
    if (!s) return false;
    const sessionDate = new Date(s.date);
    return sessionDate >= startOfWeek && sessionDate <= endOfWeek;
  }).length;

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      completed: 'bg-green-100 text-green-800',
      scheduled: 'bg-blue-100 text-blue-800',
      ongoing: 'bg-yellow-100 text-yellow-800',
      cancelled: 'bg-red-100 text-red-800'
    };

    return (
      <Badge className={variants[status] || 'bg-gray-100 text-gray-800'}>
        {t.status[status as keyof typeof t.status]}
      </Badge>
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'scheduled':
        return <Clock className="w-5 h-5 text-blue-600" />;
      case 'ongoing':
        return <Play className="w-5 h-5 text-yellow-600" />;
      case 'cancelled':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t.title || ''}</h1>
          <p className="text-gray-600 mt-1">{t.subtitle}</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          {t?.actions?.newSession}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">{t?.stats?.totalSessions}</p>
                <p className="text-2xl font-bold">{totalSessions}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">{t?.stats?.completed}</p>
                <p className="text-2xl font-bold text-green-600">{completedSessions}</p>
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
                <p className="text-sm text-gray-600">{t?.stats?.scheduled}</p>
                <p className="text-2xl font-bold text-orange-600">{scheduledSessions}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">{t?.stats?.thisWeek}</p>
                <p className="text-2xl font-bold text-purple-600">{thisWeekSessions}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sessions List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Planning des Séances</h3>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e?.target?.value)}
                  className="border rounded-md px-3 py-1 text-sm"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <select
                  value={selectedFilter}
                  onChange={(e) => setSelectedFilter(e?.target?.value)}
                  className="border rounded-md px-3 py-1 text-sm"
                >
                  <option value="all">{t?.filters?.all}</option>
                  <option value="today">{t?.filters?.today}</option>
                  <option value="scheduled">{t?.filters?.scheduled}</option>
                  <option value="completed">{t?.filters?.completed}</option>
                </select>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {(Array.isArray(filteredSessions) ? filteredSessions.length : 0) === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">{t.noData}</h3>
              <p className="text-gray-600">Aucune séance ne correspond à vos critères.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {(Array.isArray(filteredSessions) ? filteredSessions : []).map((session) => (
                <Card key={session.id} className="border hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          {getStatusIcon(session.status)}
                          <div>
                            <h4 className="text-lg font-semibold text-gray-900">{session.title || ''}</h4>
                            <p className="text-sm text-gray-600">{session.studentName}</p>
                          </div>
                          {getStatusBadge(session.status)}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-gray-500">{t?.session?.subject}</p>
                            <p className="font-medium">{session.subject}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">{t?.session?.time}</p>
                            <p className="font-medium">{session.startTime} - {session.endTime}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">{t?.session?.duration}</p>
                            <p className="font-medium">{session.duration}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">{t?.session?.location}</p>
                            <div className="flex items-center">
                              <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                              <p className="font-medium">{session.location}</p>
                            </div>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Date</p>
                            <p className="font-medium">{new Date(session.date).toLocaleDateString()}</p>
                          </div>
                        </div>

                        {/* Materials */}
                        <div className="mb-4">
                          <p className="text-sm text-gray-500 mb-2">{t?.session?.materials}</p>
                          <div className="flex flex-wrap gap-1">
                            {(Array.isArray(session.materials) ? session.materials : []).map((material, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {material}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {/* Notes */}
                        {session.notes && (
                          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-500 mb-1">{t?.session?.notes}</p>
                            <p className="text-sm text-gray-700">{session.notes}</p>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-2">
                          {session.status === 'scheduled' && (
                            <Button size="sm" className="bg-green-600 hover:bg-green-700">
                              <Play className="w-4 h-4 mr-2" />
                              {t?.actions?.startSession}
                            </Button>
                          )}
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4 mr-2" />
                            {t?.actions?.editSession}
                          </Button>
                          <Button variant="outline" size="sm">
                            <FileText className="w-4 h-4 mr-2" />
                            {session.notes ? t?.actions?.viewNotes : t?.actions?.addNotes}
                          </Button>
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-2" />
                            Détails
                          </Button>
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

export default FunctionalFreelancerSessions;