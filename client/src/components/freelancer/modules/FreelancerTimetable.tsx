import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Calendar, Clock, Plus, Edit3, Save, X, Users, 
  BookOpen, MapPin, DollarSign, User, CheckCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/CardLayout';
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

  // Sample freelancer tutoring sessions
  const [tutoringSchedule, setTutoringSchedule] = useState<TutoringSession[]>([
    {
      id: '1',
      day: 'monday',
      startTime: '14:00',
      endTime: '15:00',
      subject: language === 'fr' ? 'Mathématiques' : 'Mathematics',
      student: 'Jean Dupont',
      location: language === 'fr' ? 'Domicile élève' : 'Student\'s home',
      rate: 5000,
      status: 'confirmed'
    },
    {
      id: '2',
      day: 'monday',
      startTime: '16:00',
      endTime: '17:00',
      subject: language === 'fr' ? 'Physique' : 'Physics',
      student: 'Marie Kone',
      location: language === 'fr' ? 'Bibliothèque' : 'Library',
      rate: 4500,
      status: 'confirmed'
    },
    {
      id: '3',
      day: 'tuesday',
      startTime: '15:00',
      endTime: '16:00',
      subject: language === 'fr' ? 'Français' : 'French',
      student: 'Paul Mbeki',
      location: language === 'fr' ? 'Centre éducatif' : 'Education center',
      rate: 4000,
      status: 'pending'
    },
    {
      id: '4',
      day: 'wednesday',
      startTime: '17:00',
      endTime: '18:00',
      subject: language === 'fr' ? 'Chimie' : 'Chemistry',
      student: 'Sophie Lambert',
      location: language === 'fr' ? 'Domicile répétiteur' : 'Tutor\'s home',
      rate: 5500,
      status: 'confirmed'
    },
    {
      id: '5',
      day: 'thursday',
      startTime: '14:30',
      endTime: '15:30',
      subject: language === 'fr' ? 'Anglais' : 'English',
      student: 'David Fofana',
      location: language === 'fr' ? 'En ligne' : 'Online',
      rate: 3500,
      status: 'completed'
    }
  ]);

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
      id: Date.now().toString(),
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
    
    const updatedSchedule = (Array.isArray(tutoringSchedule) ? tutoringSchedule : []).filter(session => session.id !== selectedSession.id);
    updatedSchedule.push(selectedSession);
    
    setTutoringSchedule(updatedSchedule);
    setIsEditing(false);
    setSelectedSession(null);
  };

  const handleDeleteSession = (sessionId: string) => {
    setTutoringSchedule((Array.isArray(tutoringSchedule) ? tutoringSchedule : []).filter(session => session.id !== sessionId));
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
                {selectedSession?.id?.includes(Date.now().toString()) ? text.addSession : text.editSession}
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
                <Button onClick={handleSaveSession} className="flex-1">
                  <Save className="w-4 h-4 mr-2" />
                  {text.saveChanges}
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