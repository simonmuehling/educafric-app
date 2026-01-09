import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Calendar, Clock, Users, MapPin, User, ChevronLeft, ChevronRight, Search, Bell, BookOpen } from 'lucide-react';

const ParentChildrenTimetable: React.FC = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const [selectedChildIndex, setSelectedChildIndex] = useState(0);
  const [selectedDay, setSelectedDay] = useState(1);

  const t = {
    fr: {
      title: 'Emploi du Temps des Enfants',
      subtitle: 'Consultez les horaires de cours de vos enfants',
      search: 'Rechercher...',
      noChildren: 'Aucun enfant connecté',
      connectChild: 'Connecter un enfant',
      today: "Aujourd'hui",
      days: ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'],
      fullDays: { 1: 'Lundi', 2: 'Mardi', 3: 'Mercredi', 4: 'Jeudi', 5: 'Vendredi', 6: 'Samedi' },
      teacher: 'Professeur',
      room: 'Salle',
      time: 'Horaire',
      nextClass: 'Prochain cours',
      currentClass: 'Cours actuel',
      noClasses: 'Aucun cours programmé ce jour',
      myChildren: 'Mes Enfants',
      totalClasses: 'Cours aujourd\'hui',
      loading: 'Chargement...'
    },
    en: {
      title: "Children's Timetable",
      subtitle: 'View your children class schedules',
      search: 'Search...',
      noChildren: 'No children connected',
      connectChild: 'Connect a child',
      today: 'Today',
      days: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      fullDays: { 1: 'Monday', 2: 'Tuesday', 3: 'Wednesday', 4: 'Thursday', 5: 'Friday', 6: 'Saturday' },
      teacher: 'Teacher',
      room: 'Room',
      time: 'Schedule',
      nextClass: 'Next class',
      currentClass: 'Current class',
      noClasses: 'No classes scheduled this day',
      myChildren: 'My Children',
      totalClasses: 'Classes today',
      loading: 'Loading...'
    }
  };

  const text = t[language as keyof typeof t] || t.fr;

  const userInitials = ((user as any)?.name || (user as any)?.firstName || user?.email || 'P')
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const { data: childrenResponse, isLoading: childrenLoading } = useQuery({
    queryKey: ['/api/parent/children'],
    queryFn: async () => {
      const response = await fetch('/api/parent/children', { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch children');
      return response.json();
    }
  });

  const children = childrenResponse?.children || [];
  const childId = children?.[selectedChildIndex]?.id ?? null;
  const isQueryEnabled = Boolean(children.length > 0 && childId);

  const { data: timetableData, isLoading } = useQuery({
    queryKey: ['/api/parent/children', childId, 'timetable'],
    queryFn: async () => {
      if (!childId) return [];
      const response = await fetch(`/api/parent/children/${childId}/timetable`, { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch timetable');
      const data = await response.json();
      return data.timetable || [];
    },
    enabled: isQueryEnabled
  });

  const daySchedule = timetableData?.filter((item: any) => item.dayOfWeek === selectedDay) || [];
  const today = new Date();
  const isToday = selectedDay === today.getDay();
  const weekDays = [1, 2, 3, 4, 5, 6];

  if (childrenLoading) {
    return (
      <div className="min-h-screen bg-[#F3F5F7] flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-[#F3F5F7] border-t-[#7C5CFC] rounded-full animate-spin mb-4" />
          <p className="text-sm text-[#90A3BF]">{text.loading}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F3F5F7] font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="border-b border-[#F3F5F7] bg-white px-4 md:px-8 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-6 px-6 py-3 border border-[#C3D4E9] rounded-full bg-white/80 w-full md:max-w-md">
          <Search className="w-5 h-5 text-[#90A3BF]" />
          <input type="text" placeholder={text.search} className="border-none outline-none w-full bg-transparent text-sm" />
        </div>
        <div className="flex items-center gap-4">
          <button className="relative w-11 h-11 rounded-full border border-[#C3D4E9] flex items-center justify-center hover:bg-gray-50 transition">
            <Bell className="w-5 h-5 text-[#596780]" />
          </button>
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#7C5CFC] to-[#5CAFFC] flex items-center justify-center text-white font-bold text-sm">
            {userInitials}
          </div>
        </div>
      </div>

      <div className="p-4 md:p-8">
        <div className="mb-6">
          <h1 className="text-xl md:text-2xl font-bold text-[#1A202C] flex items-center gap-3">
            <Calendar className="w-7 h-7 text-[#7C5CFC]" />
            {text.title}
          </h1>
          <p className="text-sm text-[#90A3BF] mt-1">{text.subtitle}</p>
        </div>

        {children.length === 0 ? (
          <div className="bg-white rounded-xl p-12 shadow-sm text-center">
            <div className="w-20 h-20 rounded-full bg-[#F3F5F7] flex items-center justify-center mx-auto mb-6">
              <Users className="w-10 h-10 text-[#90A3BF]" />
            </div>
            <h3 className="text-xl font-semibold text-[#1A202C] mb-2">{text.noChildren}</h3>
            <button className="mt-4 px-6 py-3 bg-[#7C5CFC] text-white rounded-xl font-semibold hover:bg-[#6B4CE0] transition flex items-center gap-2 mx-auto">
              <User className="w-5 h-5" />
              {text.connectChild}
            </button>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="lg:w-[70%] space-y-6">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="font-semibold text-[#1A202C] mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#7C5CFC]" />
                  {text.myChildren}
                </h2>
                <div className="flex gap-3 flex-wrap">
                  {children.map((child: any, index: number) => (
                    <button
                      key={child.id}
                      onClick={() => setSelectedChildIndex(index)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition ${
                        index === selectedChildIndex
                          ? 'bg-[#7C5CFC] text-white'
                          : 'bg-[#F3F5F7] text-[#596780] hover:bg-[#E8EBEF]'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        index === selectedChildIndex ? 'bg-white/20 text-white' : 'bg-[#7C5CFC]/10 text-[#7C5CFC]'
                      }`}>
                        {child.firstName?.charAt(0)}{child.lastName?.charAt(0)}
                      </div>
                      {child.firstName} {child.lastName}
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        index === selectedChildIndex ? 'bg-white/20' : 'bg-[#7C5CFC]/10 text-[#7C5CFC]'
                      }`}>
                        {child.class}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <button 
                    onClick={() => setSelectedDay(Math.max(1, selectedDay - 1))}
                    disabled={selectedDay === 1}
                    className="w-10 h-10 rounded-full border border-[#C3D4E9] flex items-center justify-center hover:bg-[#F3F5F7] transition disabled:opacity-50"
                  >
                    <ChevronLeft className="w-5 h-5 text-[#596780]" />
                  </button>
                  <div className="text-center">
                    <h3 className="text-lg font-bold text-[#1A202C]">
                      {text.fullDays[selectedDay as keyof typeof text.fullDays]}
                    </h3>
                    {isToday && <span className="text-xs text-[#7C5CFC] font-semibold">{text.today}</span>}
                  </div>
                  <button 
                    onClick={() => setSelectedDay(Math.min(6, selectedDay + 1))}
                    disabled={selectedDay === 6}
                    className="w-10 h-10 rounded-full border border-[#C3D4E9] flex items-center justify-center hover:bg-[#F3F5F7] transition disabled:opacity-50"
                  >
                    <ChevronRight className="w-5 h-5 text-[#596780]" />
                  </button>
                </div>

                <div className="flex gap-2 p-1 bg-[#F3F5F7] rounded-xl mb-6">
                  {weekDays.map(day => (
                    <button
                      key={day}
                      onClick={() => setSelectedDay(day)}
                      className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition ${
                        selectedDay === day
                          ? 'bg-white text-[#7C5CFC] shadow-sm'
                          : 'text-[#596780] hover:text-[#1A202C]'
                      }`}
                    >
                      {text.days[day]}
                      {day === today.getDay() && <span className="ml-1 w-1.5 h-1.5 bg-[#7C5CFC] rounded-full inline-block" />}
                    </button>
                  ))}
                </div>

                {isLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="animate-pulse h-20 bg-[#F3F5F7] rounded-xl" />
                    ))}
                  </div>
                ) : daySchedule.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-16 h-16 rounded-full bg-[#F3F5F7] flex items-center justify-center mb-4">
                      <BookOpen className="w-8 h-8 text-[#90A3BF]" />
                    </div>
                    <h3 className="text-lg font-semibold text-[#1A202C] mb-2">{text.noClasses}</h3>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {daySchedule.map((item: any) => (
                      <div key={item.id} className="flex items-center gap-4 p-4 rounded-xl bg-[#F3F5F7]/50 hover:bg-[#F3F5F7] transition">
                        <div className="text-center min-w-[60px]">
                          <div className="text-lg font-bold text-[#7C5CFC]">{item.startTime}</div>
                          <div className="text-xs text-[#90A3BF]">{item.endTime}</div>
                        </div>
                        <div className="w-px h-12 bg-[#C3D4E9]" />
                        <div className="flex-1">
                          <h4 className="font-semibold text-[#1A202C] mb-1">{item.subjectName}</h4>
                          <div className="flex items-center gap-4 text-sm text-[#596780]">
                            <span className="flex items-center gap-1">
                              <User className="w-4 h-4" />
                              {item.teacherName}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {text.room} {item.room}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="lg:w-[30%] space-y-6">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="font-semibold text-[#1A202C] mb-4">{text.totalClasses}</h2>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-[#7C5CFC]/10 flex items-center justify-center">
                    <BookOpen className="w-8 h-8 text-[#7C5CFC]" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-[#1A202C]">{daySchedule.length}</p>
                    <p className="text-sm text-[#90A3BF]">
                      {children[selectedChildIndex]?.firstName}
                    </p>
                  </div>
                </div>
              </div>

              {children[selectedChildIndex] && (
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#7C5CFC] to-[#5CAFFC] flex items-center justify-center text-white font-bold text-lg">
                      {children[selectedChildIndex]?.firstName?.charAt(0)}
                      {children[selectedChildIndex]?.lastName?.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-[#1A202C]">
                        {children[selectedChildIndex]?.firstName} {children[selectedChildIndex]?.lastName}
                      </p>
                      <p className="text-sm text-[#90A3BF]">{children[selectedChildIndex]?.class}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ParentChildrenTimetable;
