// 📱 MOBILE-OPTIMIZED Director Timetable Management
import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Users, BookOpen, Plus, Edit, Trash2 } from 'lucide-react';

interface TimetableSlot {
  id: string;
  time: string;
  subject: string;
  teacher: string;
  class: string;
  room: string;
  day: string;
}

const FunctionalDirectorTimetable: React.FC = () => {
  const { language } = useLanguage();
  const [selectedDay, setSelectedDay] = useState('monday');
  
  const t = {
    title: language === 'fr' ? 'Gestion des Emplois du Temps' : 'Timetable Management',
    today: language === 'fr' ? "Aujourd'hui" : 'Today',
    addSlot: language === 'fr' ? 'Ajouter un Créneau' : 'Add Time Slot',
    noSlots: language === 'fr' ? 'Aucun créneau programmé' : 'No time slots scheduled',
    monday: language === 'fr' ? 'Lundi' : 'Monday',
    tuesday: language === 'fr' ? 'Mardi' : 'Tuesday',
    wednesday: language === 'fr' ? 'Mercredi' : 'Wednesday',
    thursday: language === 'fr' ? 'Jeudi' : 'Thursday',
    friday: language === 'fr' ? 'Vendredi' : 'Friday',
    saturday: language === 'fr' ? 'Samedi' : 'Saturday'
  };

  const days = [
    { id: 'monday', label: t.monday },
    { id: 'tuesday', label: t.tuesday },
    { id: 'wednesday', label: t.wednesday },
    { id: 'thursday', label: t.thursday },
    { id: 'friday', label: t.friday },
    { id: 'saturday', label: t.saturday }
  ];

  // Sample timetable data
  const sampleSlots: TimetableSlot[] = [
    {
      id: '1',
      time: '08:00 - 09:00',
      subject: 'Mathématiques',
      teacher: 'Prof. Dupont',
      class: '6ème A',
      room: 'Salle 101',
      day: 'monday'
    },
    {
      id: '2', 
      time: '09:00 - 10:00',
      subject: 'Français',
      teacher: 'Prof. Martin',
      class: '6ème A',
      room: 'Salle 102',
      day: 'monday'
    },
    {
      id: '3',
      time: '10:30 - 11:30',
      subject: 'Histoire',
      teacher: 'Prof. Durand',
      class: '6ème A',
      room: 'Salle 103',
      day: 'monday'
    }
  ];

  const currentDaySlots = sampleSlots.filter(slot => slot.day === selectedDay);

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
      {/* Mobile-optimized header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
            {t.title}
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            {language === 'fr' ? 'Organisez les emplois du temps de votre établissement' : 'Organize your institution\'s timetables'}
          </p>
        </div>
        
        <Button className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          {t.addSlot}
        </Button>
      </div>

      {/* Mobile-optimized day selector */}
      <div className="flex overflow-x-auto space-x-2 pb-2">
        {days.map((day) => (
          <Button
            key={day.id}
            variant={selectedDay === day.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedDay(day.id)}
            className="whitespace-nowrap min-w-fit"
          >
            {day.label}
          </Button>
        ))}
      </div>

      {/* Mobile-optimized timetable view */}
      <div className="space-y-3 sm:space-y-4">
        {currentDaySlots.length > 0 ? (
          currentDaySlots.map((slot) => (
            <Card key={slot.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                  <div className="space-y-2 sm:space-y-1">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-blue-600" />
                      <span className="font-semibold text-blue-700">{slot.time}</span>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <BookOpen className="w-4 h-4 text-green-600" />
                        <span className="font-medium">{slot.subject}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-purple-600" />
                        <span>{slot.class}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-orange-600" />
                        <span>{slot.room}</span>
                      </div>
                    </div>
                    
                    <Badge variant="secondary" className="w-fit">
                      {slot.teacher}
                    </Badge>
                  </div>
                  
                  {/* Mobile-optimized action buttons */}
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-6 sm:p-8 text-center">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">{t.noSlots}</p>
              <Button className="mt-4" variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                {t.addSlot}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default FunctionalDirectorTimetable;