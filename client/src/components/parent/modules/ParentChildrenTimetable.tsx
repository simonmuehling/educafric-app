import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Users, MapPin, User, ChevronLeft, ChevronRight } from 'lucide-react';

const ParentChildrenTimetable: React.FC = () => {
  const { language } = useLanguage();
  const [selectedChildIndex, setSelectedChildIndex] = useState(0);
  const [selectedDay, setSelectedDay] = useState(1); // Monday = 1

  const text = {
    fr: {
      title: 'Emploi du Temps des Enfants',
      subtitle: 'Consultez les horaires de cours de vos enfants',
      noChildren: 'Aucun enfant connecté',
      connectChild: 'Connecter un enfant',
      today: "Aujourd'hui",
      days: {
        1: 'Lundi',
        2: 'Mardi', 
        3: 'Mercredi',
        4: 'Jeudi',
        5: 'Vendredi',
        6: 'Samedi'
      },
      teacher: 'Professeur',
      room: 'Salle',
      time: 'Horaire',
      nextClass: 'Prochain cours',
      currentClass: 'Cours actuel',
      noClasses: 'Aucun cours programmé'
    },
    en: {
      title: "Children's Timetable",
      subtitle: 'View your children class schedules',
      noChildren: 'No children connected',
      connectChild: 'Connect a child',
      today: 'Today',
      days: {
        1: 'Monday',
        2: 'Tuesday',
        3: 'Wednesday', 
        4: 'Thursday',
        5: 'Friday',
        6: 'Saturday'
      },
      teacher: 'Teacher',
      room: 'Room',
      time: 'Schedule',
      nextClass: 'Next class',
      currentClass: 'Current class',
      noClasses: 'No classes scheduled'
    }
  };

  const t = text[language as keyof typeof text];

  // Mock children data - in real app, this would come from API
  const mockChildren = [
    { id: 1, name: 'Marie Kouame', class: '6ème A', school: 'École Saint-Joseph' },
    { id: 2, name: 'Paul Kouame', class: '3ème B', school: 'École Saint-Joseph' }
  ];

  // Get timetable for selected child
  const { data: timetableData, isLoading } = useQuery({
    queryKey: ['/api/sandbox/timetable/create', mockChildren[selectedChildIndex]?.class],
    queryFn: async () => {
      const response = await fetch('/api/sandbox/timetable/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ class: mockChildren[selectedChildIndex]?.class || '6ème A' })
      });
      if (!response.ok) throw new Error('Failed to fetch timetable');
      const data = await response.json();
      
      // Convert sandbox format to display format
      const timetableItems: any[] = [];
      const dayMapping: Record<string, number> = {
        monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5
      };
      
      Object.entries(data.schedule || {}).forEach(([dayName, slots]: [string, any]) => {
        if (Array.isArray(slots)) {
          slots.forEach((slot: any) => {
            const [startTime, endTime] = slot.time.split('-');
            timetableItems.push({
              id: `${dayName}-${slot.subject}`,
              dayOfWeek: dayMapping[dayName] || 1,
              startTime: startTime,
              endTime: endTime,
              subjectName: slot.subject,
              teacherName: slot.teacher,
              room: slot.room
            });
          });
        }
      });
      
      return timetableItems;
    },
    enabled: mockChildren.length > 0
  });

  // Get current day schedule
  const daySchedule = timetableData?.filter((item: any) => item.dayOfWeek === selectedDay) || [];
  const today = new Date();
  const isToday = selectedDay === today.getDay();

  if (mockChildren.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100 p-6">
        <div className="max-w-4xl mx-auto">
          <Card className="text-center py-12">
            <CardContent>
              <Users className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">{t.noChildren}</h3>
              <p className="text-gray-500 mb-6">Connectez-vous avec vos enfants pour voir leurs emplois du temps</p>
              <Button className="bg-purple-600 hover:bg-purple-700">
                <User className="w-4 h-4 mr-2" />
                {t.connectChild}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full">
                <Calendar className="w-12 h-12 text-white" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {t.title}
            </CardTitle>
            <p className="text-gray-600 mt-2">{t.subtitle}</p>
          </CardHeader>
        </Card>

        {/* Children Selection */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Users className="w-5 h-5 mr-2 text-purple-600" />
              Mes Enfants
            </h3>
            <div className="flex gap-3 flex-wrap">
              {mockChildren.map((child, index) => (
                <Button
                  key={child.id}
                  variant={index === selectedChildIndex ? "default" : "outline"}
                  onClick={() => setSelectedChildIndex(index)}
                  className={index === selectedChildIndex ? 
                    "bg-purple-600 hover:bg-purple-700" : 
                    "border-purple-200 hover:border-purple-400"
                  }
                >
                  <User className="w-4 h-4 mr-2" />
                  {child.name}
                  <Badge variant="secondary" className="ml-2">
                    {child.class}
                  </Badge>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

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
              <h2 className="text-lg font-semibold flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                {t.days[selectedDay as keyof typeof t.days]}
                {isToday && (
                  <Badge className="ml-2 bg-purple-100 text-purple-800">{t.today}</Badge>
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

            {/* Quick Day Selection */}
            <div className="grid grid-cols-6 gap-2">
              {[1, 2, 3, 4, 5, 6].map(day => (
                <Button
                  key={day}
                  variant={day === selectedDay ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedDay(day)}
                  className={day === selectedDay ? 
                    "bg-purple-600 hover:bg-purple-700 text-xs" : 
                    "text-xs border-purple-200 hover:border-purple-400"
                  }
                >
                  {t.days[day as keyof typeof t.days].substring(0, 3)}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Schedule Display */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="w-5 h-5 mr-2 text-purple-600" />
              Emploi du Temps - {mockChildren[selectedChildIndex]?.name}
              <Badge variant="outline" className="ml-2">
                {mockChildren[selectedChildIndex]?.class}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="animate-pulse">
                    <div className="h-20 bg-purple-100 rounded-lg"></div>
                  </div>
                ))}
              </div>
            ) : daySchedule.length > 0 ? (
              <div className="space-y-4">
                {daySchedule.map((item: any) => (
                  <Card key={item.id} className="border-purple-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg text-purple-800">
                            {item.subjectName}
                          </h4>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                            <span className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              {item.startTime} - {item.endTime}
                            </span>
                            <span className="flex items-center">
                              <User className="w-4 h-4 mr-1" />
                              {item.teacherName}
                            </span>
                            <span className="flex items-center">
                              <MapPin className="w-4 h-4 mr-1" />
                              {item.room}
                            </span>
                          </div>
                        </div>
                        <Badge 
                          variant="secondary" 
                          className="bg-purple-100 text-purple-800"
                        >
                          {item.startTime}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>{t.noClasses}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ParentChildrenTimetable;