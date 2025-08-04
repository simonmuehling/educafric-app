import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { ModernCard } from '@/components/ui/ModernCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Calendar, MapPin, User, ChevronLeft, ChevronRight, RefreshCw, BookOpen, AlertCircle } from 'lucide-react';

interface TimetableSlot {
  id: number;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  subject: string;
  subjectId: number;
  teacher: string;
  teacherId: number;
  room: string;
  classroom: string;
  status: 'upcoming' | 'current' | 'completed' | 'break';
  color: string;
  duration: number;
}

interface TimetableStats {
  totalClasses: number;
  weeklyHours: number;
  uniqueSubjects: number;
}

export const ScheduleView = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const [selectedDay, setSelectedDay] = useState('monday');
  const [currentWeek, setCurrentWeek] = useState(0);

  // Get current date info
  const today = new Date();
  const currentDayName = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][today.getDay()];

  // Fetch timetable from API
  const { data: timetableData = [], isLoading, error, refetch } = useQuery<TimetableSlot[]>({
    queryKey: ['/api/student/timetable', currentWeek],
    queryFn: async () => {
      console.log('[SCHEDULE_VIEW] 🔍 Fetching timetable...');
      const weekOffset = currentWeek !== 0 ? `?week=${currentWeek}` : '';
      const response = await fetch(`/api/student/timetable${weekOffset}`, {
        credentials: 'include'
      });
      if (!response.ok) {
        console.error('[SCHEDULE_VIEW] ❌ Failed to fetch timetable');
        throw new Error('Failed to fetch timetable');
      }
      const data = await response.json();
      console.log('[SCHEDULE_VIEW] ✅ Timetable loaded:', data.length, 'slots');
      return data;
    },
    enabled: !!user,
    retry: 2
  });

  // Fetch timetable statistics
  const { data: statsData } = useQuery<TimetableStats>({
    queryKey: ['/api/student/timetable/stats'],
    queryFn: async () => {
      console.log('[SCHEDULE_VIEW] 🔍 Fetching timetable stats...');
      const response = await fetch('/api/student/timetable/stats', {
        credentials: 'include'
      });
      if (!response.ok) {
        console.error('[SCHEDULE_VIEW] ❌ Failed to fetch stats');
        throw new Error('Failed to fetch timetable stats');
      }
      const data = await response.json();
      console.log('[SCHEDULE_VIEW] ✅ Stats loaded:', data);
      return data;
    },
    enabled: !!user,
    retry: 2
  });

  const text = {
    fr: {
      title: 'Vue Emploi du Temps',
      subtitle: 'Voir votre emploi du temps personnel',
      loading: 'Chargement de l\'emploi du temps...',
      error: 'Erreur lors du chargement',
      today: 'Aujourd\'hui',
      tomorrow: 'Demain',
      monday: 'Lundi',
      tuesday: 'Mardi',
      wednesday: 'Mercredi',
      thursday: 'Jeudi',
      friday: 'Vendredi',
      saturday: 'Samedi',
      room: 'Salle',
      teacher: 'Enseignant',
      duration: 'Durée',
      minutes: 'min',
      currentClass: 'Cours en cours',
      nextClass: 'Prochain cours',
      noClasses: 'Aucun cours programmé',
      break: 'Pause',
      lunch: 'Déjeuner',
      previousWeek: 'Semaine précédente',
      nextWeek: 'Semaine suivante',
      thisWeek: 'Cette semaine',
      weekOf: 'Semaine du',
      refresh: 'Actualiser',
      totalClasses: 'Cours cette semaine',
      weeklyHours: 'Heures de cours',
      uniqueSubjects: 'Matières différentes'
    },
    en: {
      title: 'Schedule View',
      subtitle: 'View your personal class schedule',
      loading: 'Loading timetable...',
      error: 'Error loading timetable',
      today: 'Today',
      tomorrow: 'Tomorrow',
      monday: 'Monday',
      tuesday: 'Tuesday',
      wednesday: 'Wednesday',
      thursday: 'Thursday',
      friday: 'Friday',
      saturday: 'Saturday',
      room: 'Room',
      teacher: 'Teacher',
      duration: 'Duration',
      minutes: 'min',
      currentClass: 'Current class',
      nextClass: 'Next class',
      noClasses: 'No classes scheduled',
      break: 'Break',
      lunch: 'Lunch',
      previousWeek: 'Previous week',
      nextWeek: 'Next week',
      thisWeek: 'This week',
      weekOf: 'Week of',
      refresh: 'Refresh',
      totalClasses: 'Classes this week',
      weeklyHours: 'Hours of classes',
      uniqueSubjects: 'Different subjects'
    }
  };

  const t = text[language as keyof typeof text];

  const days = [
    { id: 'monday', label: t.monday },
    { id: 'tuesday', label: t.tuesday },
    { id: 'wednesday', label: t.wednesday },
    { id: 'thursday', label: t.thursday },
    { id: 'friday', label: t.friday },
    { id: 'saturday', label: t.saturday }
  ];

  // Process timetable data by day
  const organizeScheduleByDay = () => {
    const schedule: Record<string, TimetableSlot[]> = {
      monday: [],
      tuesday: [],
      wednesday: [],
      thursday: [],
      friday: [],
      saturday: []
    };

    (Array.isArray(timetableData) ? timetableData : []).forEach(slot => {
      const dayKey = slot.dayOfWeek?.toLowerCase();
      if (schedule[dayKey]) {
        schedule[dayKey].push({
          ...slot,
          room: slot.room || slot.classroom || 'N/A',
          color: getSubjectColor(slot.subject)
        });
      }
    });

    // Sort each day's schedule by start time
    Object.keys(schedule).forEach(day => {
      schedule[day].sort((a, b) => a.startTime.localeCompare(b.startTime));
    });

    return schedule;
  };

  const getSubjectColor = (subject: string) => {
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500',
      'bg-red-500', 'bg-indigo-500', 'bg-pink-500', 'bg-teal-500',
      'bg-yellow-500', 'bg-cyan-500'
    ];
    const index = subject?.length ? subject.length % colors.length : 0;
    return colors[index];
  };

  const getCurrentClass = (daySchedule: TimetableSlot[]) => {
    if (selectedDay !== currentDayName) return null;
    
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    return daySchedule.find(slot => {
      const [startHour, startMin] = slot.startTime.split(':').map(Number);
      const [endHour, endMin] = slot.endTime.split(':').map(Number);
      const startTime = startHour * 60 + startMin;
      const endTime = endHour * 60 + endMin;
      return currentTime >= startTime && currentTime <= endTime;
    });
  };

  const getNextClass = (daySchedule: TimetableSlot[]) => {
    if (selectedDay !== currentDayName) return null;
    
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    return daySchedule.find(slot => {
      const [startHour, startMin] = slot.startTime.split(':').map(Number);
      const startTime = startHour * 60 + startMin;
      return currentTime < startTime;
    });
  };

  const schedule = organizeScheduleByDay();
  const daySchedule = schedule[selectedDay] || [];
  const currentClass = getCurrentClass(daySchedule);
  const nextClass = getNextClass(daySchedule);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'current':
        return <Badge className="bg-green-100 text-green-800">{t.currentClass}</Badge>;
      case 'upcoming':
        return <Badge className="bg-blue-100 text-blue-800">{t.nextClass}</Badge>;
      case 'break':
        return <Badge className="bg-gray-100 text-gray-600">{t.break}</Badge>;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <Clock className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">{t.loading}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">{t.error}</p>
          <Button onClick={() => refetch()} className="mt-4">
            {t.refresh}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-indigo-400 to-indigo-600 rounded-lg flex items-center justify-center">
            <Clock className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{t.title || ''}</h2>
            <p className="text-gray-600">{t.subtitle}</p>
          </div>
        </div>
        <Button variant="outline" onClick={() => refetch()} data-testid="button-refresh-schedule">
          <RefreshCw className="w-4 h-4 mr-2" />
          {t.refresh}
        </Button>
      </div>

      {/* Week Navigation */}
      <ModernCard gradient="default">
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            onClick={() => setCurrentWeek(currentWeek - 1)}
            className="flex items-center"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            {t.previousWeek}
          </Button>
          <h3 className="text-lg font-semibold text-gray-800">
            {currentWeek === 0 ? t.thisWeek : `${t.weekOf} ${Math.abs(currentWeek)}`}
          </h3>
          <Button
            variant="ghost"
            onClick={() => setCurrentWeek(currentWeek + 1)}
            className="flex items-center"
          >
            {t.nextWeek}
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </ModernCard>

      {/* Day Navigation */}
      <div className="flex flex-wrap gap-2 mb-6">
        {(Array.isArray(days) ? days : []).map((day) => (
          <Button
            key={day.id}
            variant={selectedDay === day.id ? "default" : "ghost"}
            onClick={() => setSelectedDay(day.id)}
            className={selectedDay === day.id ? "bg-gradient-to-r from-indigo-500 to-indigo-600 text-white" : ""}
          >
            <Calendar className="w-4 h-4 mr-2" />
            {day.label}
          </Button>
        ))}
      </div>

      {/* Current/Next Class Alert */}
      {selectedDay === currentDayName && (currentClass || nextClass) && (
        <ModernCard gradient="blue">
          <div className="p-4">
            {currentClass ? (
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <div>
                  <p className="font-medium text-green-800">{t.currentClass}</p>
                  <p className="text-sm text-green-600">
                    {currentClass.subject} - {currentClass.startTime} à {currentClass.endTime}
                  </p>
                  <p className="text-xs text-green-500">
                    {t.room} {currentClass.room} • {currentClass.teacher}
                  </p>
                </div>
              </div>
            ) : nextClass && (
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-blue-600" />
                <div>
                  <p className="font-medium text-blue-800">{t.nextClass}</p>
                  <p className="text-sm text-blue-600">
                    {nextClass.subject} - {nextClass.startTime}
                  </p>
                  <p className="text-xs text-blue-500">
                    {t.room} {nextClass.room} • {nextClass.teacher}
                  </p>
                </div>
              </div>
            )}
          </div>
        </ModernCard>
      )}

      {/* Daily Schedule */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-800">
          {days.find(d => d.id === selectedDay)?.label}
        </h3>
        
        {/* Schedule List */}
        <div className="space-y-4">
          {(Array.isArray(daySchedule) ? daySchedule.length : 0) === 0 ? (
            <ModernCard gradient="default">
              <div className="p-8 text-center">
                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">{t.noClasses}</h3>
                <p className="text-gray-500">
                  {language === 'fr' ? 'Aucun cours programmé pour cette journée.' : 'No classes scheduled for this day.'}
                </p>
              </div>
            </ModernCard>
          ) : (
            (Array.isArray(daySchedule) ? daySchedule : []).map((classItem: TimetableSlot, index: number) => (
              <ModernCard key={classItem.id || index} gradient={currentClass?.id === classItem.id ? 'green' : 'default'}>
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <div className={`w-12 h-12 ${classItem.color} rounded-full flex items-center justify-center mb-2`}>
                          <Clock className="w-6 h-6 text-white" />
                        </div>
                        <div className="text-sm font-bold text-gray-800">
                          {classItem.startTime}
                        </div>
                        <div className="text-xs text-gray-500">
                          {classItem.endTime}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-gray-900">
                            {classItem.subject}
                          </h3>
                          {currentClass?.id === classItem.id && (
                            <Badge className="bg-green-100 text-green-800">
                              {language === 'fr' ? 'En cours' : 'Current'}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {classItem.teacher}
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {t.room} {classItem.room}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {classItem.duration || 90} {t.minutes}
                          </div>
                        </div>
                      </div>
                    </div>
                    {currentClass?.id === classItem.id && (
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      </div>
                    )}
                  </div>
                </div>
              </ModernCard>
            ))
          )}
        </div>
      </div>

      {/* Weekly Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ModernCard gradient="blue">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-800 mb-2">
              {statsData?.totalClasses || (Array.isArray(timetableData) ? timetableData.length : 0)}
            </div>
            <div className="text-gray-600">{t.totalClasses}</div>
          </div>
        </ModernCard>
        <ModernCard gradient="green">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-800 mb-2">
              {statsData?.weeklyHours || Math.round((Array.isArray(timetableData) ? timetableData : []).reduce((sum, slot) => sum + (slot.duration || 90), 0) / 60)}h
            </div>
            <div className="text-gray-600">{t.weeklyHours}</div>
          </div>
        </ModernCard>
        <ModernCard gradient="purple">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-800 mb-2">
              {statsData?.uniqueSubjects || new Set((Array.isArray(timetableData) ? timetableData : []).map(slot => slot.subject)).size}
            </div>
            <div className="text-gray-600">{t.uniqueSubjects}</div>
          </div>
        </ModernCard>
      </div>
    </div>
  );
};