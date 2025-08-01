import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin, User, Calendar, BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';

const StudentTimetable: React.FC = () => {
  const { language } = useLanguage();
  const [selectedDay, setSelectedDay] = useState(new Date().getDay() || 1);

  const text = {
    fr: {
      title: 'Mon Emploi du Temps',
      subtitle: 'Votre planning hebdomadaire de cours',
      loading: 'Chargement...',
      error: 'Erreur de chargement',
      noData: 'Aucun cours aujourd\'hui',
      days: ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'],
      today: 'Aujourd\'hui',
      nextClass: 'Prochain cours',
      currentClass: 'Cours actuel',
      room: 'Salle',
      teacher: 'Professeur',
      duration: 'Durée'
    },
    en: {
      title: 'My Timetable',
      subtitle: 'Your weekly class schedule',
      loading: 'Loading...',
      error: 'Loading error',
      noData: 'No classes today',
      days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      today: 'Today',
      nextClass: 'Next class',
      currentClass: 'Current class',
      room: 'Room',
      teacher: 'Teacher',
      duration: 'Duration'
    }
  };

  const t = text[language as keyof typeof text];

  const { data: timetableData, isLoading, error } = useQuery({
    queryKey: ['/api/student/timetable'],
    queryFn: async () => {
      const response = await fetch('/api/student/timetable', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch timetable');
      return response.json();
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{t.title || ''}</h1>
          <p className="text-red-600">{t.error}</p>
        </div>
      </div>
    );
  }

  const today = new Date();
  const weekDays = [1, 2, 3, 4, 5, 6]; // Monday to Saturday
  const currentTime = today.getHours() * 60 + today.getMinutes();

  const getTimeInMinutes = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const getCurrentClass = () => {
    if (selectedDay !== today.getDay()) return null;
    
    const daySchedule = timetableData?.filter((item: any) => item.dayOfWeek === selectedDay) || [];
    return daySchedule.find((item: any) => {
      const startTime = getTimeInMinutes(item.startTime);
      const endTime = getTimeInMinutes(item.endTime);
      return currentTime >= startTime && currentTime <= endTime;
    });
  };

  const getNextClass = () => {
    if (selectedDay !== today.getDay()) return null;
    
    const daySchedule = timetableData?.filter((item: any) => item.dayOfWeek === selectedDay) || [];
    return daySchedule.find((item: any) => {
      const startTime = getTimeInMinutes(item.startTime);
      return currentTime < startTime;
    });
  };

  const daySchedule = timetableData?.filter((item: any) => item.dayOfWeek === selectedDay) || [];
  const currentClass = getCurrentClass();
  const nextClass = getNextClass();

  return (
    <div className="min-h-screen bg-white">
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Calendar className="w-8 h-8 text-blue-600" />
            {t.title || ''}
          </h1>
          <p className="text-gray-600 mt-2">{t.subtitle}</p>
        </div>

        {/* Day Navigation */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedDay(Math.max(1, selectedDay - 1))}
                disabled={selectedDay === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <h2 className="text-lg font-semibold">
                {t.days[selectedDay]}
                {selectedDay === today.getDay() && (
                  <Badge className="ml-2 bg-blue-100 text-blue-800">{t.today}</Badge>
                )}
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedDay(Math.min(6, selectedDay + 1))}
                disabled={selectedDay === 6}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            <div className="grid grid-cols-6 gap-2">
              {(Array.isArray(weekDays) ? weekDays : []).map(day => (
                <Button
                  key={day}
                  variant={selectedDay === day ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedDay(day)}
                  className="text-xs"
                >
                  {t.days[day].slice(0, 3)}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Current/Next Class Alert */}
        {selectedDay === today.getDay() && (currentClass || nextClass) && (
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              {currentClass ? (
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <div>
                    <p className="font-medium text-green-800">{t.currentClass}</p>
                    <p className="text-sm text-green-600">
                      {currentClass.subject} - {currentClass.startTime} à {currentClass.endTime}
                    </p>
                  </div>
                </div>
              ) : nextClass && (
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <div>
                    <p className="font-medium text-blue-800">{t.nextClass}</p>
                    <p className="text-sm text-blue-600">
                      {nextClass.subject} - {nextClass.startTime} (Salle {nextClass.room})
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Schedule List */}
        <div className="space-y-4">
          {(Array.isArray(daySchedule) ? daySchedule.length : 0) === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">{t.noData}</p>
              </CardContent>
            </Card>
          ) : (
            (Array.isArray(daySchedule) ? daySchedule : []).map((classItem: any, index: number) => (
              <Card key={index} className={`transition-all duration-200 hover:shadow-lg ${
                currentClass?.id === classItem.id ? 'border-green-400 bg-green-50' : ''
              }`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-600">
                          {classItem.startTime}
                        </div>
                        <div className="text-sm text-gray-500">
                          {classItem.endTime}
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">
                          {classItem.subject}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {classItem.teacher}
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {t.room} {classItem.room}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="mb-2">
                        {Math.round((getTimeInMinutes(classItem.endTime) - getTimeInMinutes(classItem.startTime)) / 60 * 10) / 10}h
                      </Badge>
                      {currentClass?.id === classItem.id && (
                        <div className="text-xs text-green-600 font-medium">
                          En cours
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentTimetable;