import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { ModernCard } from '@/components/ui/ModernCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Calendar, MapPin, User, ChevronLeft, ChevronRight } from 'lucide-react';

export const ScheduleView = () => {
  const { language } = useLanguage();
  const [selectedDay, setSelectedDay] = useState('monday');
  const [currentWeek, setCurrentWeek] = useState(0);

  const text = {
    fr: {
      title: 'Vue Emploi du Temps',
      subtitle: 'Voir votre emploi du temps personnel',
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
      weekOf: 'Semaine du'
    },
    en: {
      title: 'Schedule View',
      subtitle: 'View your personal class schedule',
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
      weekOf: 'Week of'
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

  // Mock schedule data for CM2 A student
  const mockSchedule = {
    monday: [
      {
        id: 1,
        time: '08:00 - 09:30',
        subject: 'Mathématiques',
        teacher: 'Prof. Marie Kamga',
        room: 'Salle 15',
        status: 'upcoming',
        color: 'bg-blue-500'
      },
      {
        id: 2,
        time: '10:00 - 11:30',
        subject: 'Français',
        teacher: 'Prof. Jean Mballa',
        room: 'Salle 8',
        status: 'current',
        color: 'bg-green-500'
      },
      {
        id: 3,
        time: '11:30 - 12:00',
        subject: t.break,
        teacher: '',
        room: '',
        status: 'break',
        color: 'bg-gray-400'
      },
      {
        id: 4,
        time: '14:00 - 15:30',
        subject: 'Sciences',
        teacher: 'Prof. Alice Ngo',
        room: 'Labo 2',
        status: 'upcoming',
        color: 'bg-purple-500'
      }
    ],
    tuesday: [
      {
        id: 5,
        time: '08:30 - 10:00',
        subject: 'Histoire-Géographie',
        teacher: 'Prof. Paul Ekotto',
        room: 'Salle 12',
        status: 'upcoming',
        color: 'bg-orange-500'
      },
      {
        id: 6,
        time: '10:30 - 12:00',
        subject: 'Anglais',
        teacher: 'Prof. Mary Johnson',
        room: 'Salle 20',
        status: 'upcoming',
        color: 'bg-pink-500'
      },
      {
        id: 7,
        time: '14:30 - 16:00',
        subject: 'Education Physique',
        teacher: 'Prof. Simon Biya',
        room: 'Gymnase',
        status: 'upcoming',
        color: 'bg-teal-500'
      }
    ],
    wednesday: [],
    thursday: [
      {
        id: 8,
        time: '09:00 - 10:30',
        subject: 'Arts Plastiques',
        teacher: 'Prof. Claire Mbarga',
        room: 'Atelier',
        status: 'upcoming',
        color: 'bg-indigo-500'
      }
    ],
    friday: [
      {
        id: 9,
        time: '08:00 - 09:30',
        subject: 'Mathématiques',
        teacher: 'Prof. Marie Kamga',
        room: 'Salle 15',
        status: 'upcoming',
        color: 'bg-blue-500'
      },
      {
        id: 10,
        time: '10:00 - 11:30',
        subject: 'Évaluation',
        teacher: 'Prof. Jean Mballa',
        room: 'Salle 8',
        status: 'upcoming',
        color: 'bg-red-500'
      }
    ],
    saturday: []
  };

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

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-r from-indigo-400 to-indigo-600 rounded-lg flex items-center justify-center">
          <Clock className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{t.title || ''}</h2>
          <p className="text-gray-600">{t.subtitle}</p>
        </div>
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

      {/* Daily Schedule */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-800">
          {days.find(d => d.id === selectedDay)?.label}
        </h3>
        
        {mockSchedule[selectedDay as keyof typeof mockSchedule].length > 0 ? (
          mockSchedule[selectedDay as keyof typeof mockSchedule].map((classItem) => (
            <ModernCard key={classItem.id} gradient="default">
              <div className="flex items-center space-x-4">
                <div className="flex flex-col items-center">
                  <div className={`w-12 h-12 ${classItem.color} rounded-full flex items-center justify-center`}>
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-sm font-semibold text-gray-700 mt-2">
                    {classItem.time}
                  </div>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="text-lg font-bold text-gray-800">{classItem.subject}</h4>
                    {getStatusBadge(classItem.status)}
                  </div>
                  
                  {classItem.teacher && (
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-1" />
                        {classItem.teacher}
                      </div>
                      {classItem.room && (
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          {classItem.room}
                        </div>
                      )}
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        90 {t.minutes}
                      </div>
                    </div>
                  )}
                </div>

                {classItem.status === 'current' && (
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="ml-2 text-sm text-green-600 font-medium">En cours</span>
                  </div>
                )}
              </div>
            </ModernCard>
          ))
        ) : (
          <ModernCard gradient="default">
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">{t.noClasses}</h3>
              <p className="text-gray-500">
                {language === 'fr' ? 'Aucun cours programmé pour cette journée.' : 'No classes scheduled for this day.'}
              </p>
            </div>
          </ModernCard>
        )}
      </div>

      {/* Weekly Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ModernCard gradient="blue">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-800 mb-2">18</div>
            <div className="text-gray-600">Cours cette semaine</div>
          </div>
        </ModernCard>
        <ModernCard gradient="green">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-800 mb-2">25h</div>
            <div className="text-gray-600">Heures de cours</div>
          </div>
        </ModernCard>
        <ModernCard gradient="purple">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-800 mb-2">8</div>
            <div className="text-gray-600">Matières différentes</div>
          </div>
        </ModernCard>
      </div>
    </div>
  );
};