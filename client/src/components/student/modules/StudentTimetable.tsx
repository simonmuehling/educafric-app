import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Clock, MapPin, User, Calendar, BookOpen, ChevronLeft, ChevronRight, School, Bell, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const StudentTimetable = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedDay, setSelectedDay] = useState(new Date().getDay() || 1);
  const [previousClassId, setPreviousClassId] = useState<number | null>(null);

  const t = {
    fr: {
      title: 'Mon Emploi du Temps',
      subtitle: 'Votre planning hebdomadaire de cours',
      search: 'Rechercher un cours...',
      loading: 'Chargement...',
      error: 'Erreur de chargement',
      noData: 'Aucun cours programmé pour ce jour',
      days: ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'],
      fullDays: ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'],
      today: 'Aujourd\'hui',
      nextClass: 'Prochain cours',
      currentClass: 'En cours maintenant',
      room: 'Salle',
      teacher: 'Professeur',
      duration: 'Durée',
      yourClass: 'Votre classe',
      classChanged: 'Changement de classe',
      classChangedDesc: 'Votre classe a été modifiée.',
      noClassAssigned: 'Aucune classe assignée',
      totalClasses: 'Cours aujourd\'hui'
    },
    en: {
      title: 'My Timetable',
      subtitle: 'Your weekly class schedule',
      search: 'Search a class...',
      loading: 'Loading...',
      error: 'Loading error',
      noData: 'No classes scheduled for this day',
      days: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      fullDays: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      today: 'Today',
      nextClass: 'Next class',
      currentClass: 'In progress',
      room: 'Room',
      teacher: 'Teacher',
      duration: 'Duration',
      yourClass: 'Your class',
      classChanged: 'Class Changed',
      classChangedDesc: 'Your class has been modified.',
      noClassAssigned: 'No class assigned',
      totalClasses: 'Classes today'
    }
  };

  const text = t[language as keyof typeof t] || t.fr;

  const userInitials = ((user as any)?.name || (user as any)?.firstName || user?.email || 'S')
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const { data: schoolData } = useQuery<{ success: boolean; school: any; class: any; enrollment: any }>({
    queryKey: ['/api/student/my-school']
  });

  useEffect(() => {
    if (schoolData?.class?.id) {
      if (previousClassId !== null && previousClassId !== schoolData.class.id) {
        toast({
          title: text.classChanged,
          description: text.classChangedDesc,
          duration: 5000,
        });
      }
      setPreviousClassId(schoolData.class.id);
    }
  }, [schoolData?.class?.id, previousClassId, toast, text.classChanged, text.classChangedDesc]);

  const { data: timetableData, isLoading } = useQuery({
    queryKey: ['/api/student/timetable'],
    queryFn: async () => {
      const response = await fetch('/api/student/timetable', { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch timetable');
      const data = await response.json();
      
      if (Array.isArray(data)) {
        return data.map((slot: any) => ({
          id: slot.id,
          dayOfWeek: typeof slot.dayOfWeek === 'string' 
            ? { monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6 }[slot.dayOfWeek] || 1
            : slot.dayOfWeek,
          startTime: slot.startTime,
          endTime: slot.endTime,
          subject: slot.subjectName || slot.subject,
          teacher: slot.teacherName || slot.teacher,
          room: slot.room,
          status: slot.status
        }));
      }
      return [];
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F3F5F7] flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-[#F3F5F7] border-t-[#7C5CFC] rounded-full animate-spin mb-4" />
          <p className="text-sm text-[#90A3BF]">{text.loading}</p>
        </div>
      </div>
    );
  }

  const today = new Date();
  const weekDays = [1, 2, 3, 4, 5, 6];
  const currentTime = today.getHours() * 60 + today.getMinutes();

  const getTimeInMinutes = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const displayData = timetableData || [];

  const getCurrentClass = () => {
    if (selectedDay !== today.getDay()) return null;
    const daySchedule = displayData.filter((item: any) => item.dayOfWeek === selectedDay);
    return daySchedule.find((item: any) => {
      const startTime = getTimeInMinutes(item.startTime);
      const endTime = getTimeInMinutes(item.endTime);
      return currentTime >= startTime && currentTime <= endTime;
    });
  };

  const getNextClass = () => {
    if (selectedDay !== today.getDay()) return null;
    const daySchedule = displayData.filter((item: any) => item.dayOfWeek === selectedDay);
    return daySchedule.find((item: any) => {
      const startTime = getTimeInMinutes(item.startTime);
      return currentTime < startTime;
    });
  };

  const daySchedule = displayData.filter((item: any) => item.dayOfWeek === selectedDay);
  const currentClass = getCurrentClass();
  const nextClass = getNextClass();

  return (
    <div className="min-h-screen bg-[#F3F5F7] font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="border-b border-[#F3F5F7] bg-white px-4 md:px-8 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-6 px-6 py-3 border border-[#C3D4E9] rounded-full bg-white/80 w-full md:max-w-md">
          <Search className="w-5 h-5 text-[#90A3BF]" />
          <input 
            type="text" 
            placeholder={text.search}
            className="border-none outline-none w-full bg-transparent text-sm"
          />
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

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-[70%] space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-semibold text-[#1A202C] text-lg flex items-center gap-2">
                  <School className="w-5 h-5 text-[#7C5CFC]" />
                  {text.yourClass}
                </h2>
                {schoolData?.class && (
                  <span className="px-3 py-1 bg-[#7C5CFC]/10 text-[#7C5CFC] rounded-full text-sm font-semibold">
                    {schoolData.class.name}
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between mb-4">
                <button 
                  onClick={() => setSelectedDay(Math.max(1, selectedDay - 1))}
                  disabled={selectedDay === 1}
                  className="w-10 h-10 rounded-full border border-[#C3D4E9] flex items-center justify-center hover:bg-[#F3F5F7] transition disabled:opacity-50"
                >
                  <ChevronLeft className="w-5 h-5 text-[#596780]" />
                </button>
                <div className="text-center">
                  <h3 className="text-lg font-bold text-[#1A202C]">{text.fullDays[selectedDay]}</h3>
                  {selectedDay === today.getDay() && (
                    <span className="text-xs text-[#7C5CFC] font-semibold">{text.today}</span>
                  )}
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
                    {day === today.getDay() && (
                      <span className="ml-1 w-1.5 h-1.5 bg-[#7C5CFC] rounded-full inline-block" />
                    )}
                  </button>
                ))}
              </div>

              {daySchedule.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-[#F3F5F7] flex items-center justify-center mb-4">
                    <BookOpen className="w-8 h-8 text-[#90A3BF]" />
                  </div>
                  <h3 className="text-lg font-semibold text-[#1A202C] mb-2">{text.noData}</h3>
                </div>
              ) : (
                <div className="space-y-4">
                  {daySchedule.map((classItem: any, index: number) => {
                    const isCurrent = currentClass?.id === classItem.id;
                    const duration = Math.round((getTimeInMinutes(classItem.endTime) - getTimeInMinutes(classItem.startTime)) / 60 * 10) / 10;
                    
                    return (
                      <div 
                        key={index} 
                        className={`flex items-center gap-4 p-4 rounded-xl transition hover:shadow-md ${
                          isCurrent 
                            ? 'bg-gradient-to-r from-[#7C5CFC]/10 to-[#5CAFFC]/10 border-2 border-[#7C5CFC]/30' 
                            : 'bg-[#F3F5F7]/50 hover:bg-[#F3F5F7]'
                        }`}
                      >
                        <div className="text-center min-w-[60px]">
                          <div className="text-lg font-bold text-[#7C5CFC]">{classItem.startTime}</div>
                          <div className="text-xs text-[#90A3BF]">{classItem.endTime}</div>
                        </div>
                        
                        <div className="w-px h-12 bg-[#C3D4E9]" />
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-[#1A202C]">{classItem.subject}</h4>
                            {isCurrent && (
                              <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-semibold flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                                {text.currentClass}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-[#596780]">
                            <span className="flex items-center gap-1">
                              <User className="w-4 h-4" />
                              {classItem.teacher}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {text.room} {classItem.room}
                            </span>
                          </div>
                        </div>
                        
                        <div className="px-3 py-1 bg-[#7C5CFC]/10 text-[#7C5CFC] rounded-lg text-sm font-semibold">
                          {duration}h
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="lg:w-[30%] space-y-6">
            {selectedDay === today.getDay() && (currentClass || nextClass) && (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="font-semibold text-[#1A202C] mb-4">
                  {currentClass ? text.currentClass : text.nextClass}
                </h2>
                <div className={`p-4 rounded-xl ${currentClass ? 'bg-green-50 border border-green-200' : 'bg-[#7C5CFC]/5 border border-[#7C5CFC]/20'}`}>
                  <div className="flex items-center gap-3 mb-3">
                    {currentClass ? (
                      <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                    ) : (
                      <Clock className="w-5 h-5 text-[#7C5CFC]" />
                    )}
                    <span className={`font-bold text-lg ${currentClass ? 'text-green-700' : 'text-[#7C5CFC]'}`}>
                      {(currentClass || nextClass)?.subject}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-[#596780]">
                      <Clock className="w-4 h-4" />
                      {(currentClass || nextClass)?.startTime} - {(currentClass || nextClass)?.endTime}
                    </div>
                    <div className="flex items-center gap-2 text-[#596780]">
                      <User className="w-4 h-4" />
                      {(currentClass || nextClass)?.teacher}
                    </div>
                    <div className="flex items-center gap-2 text-[#596780]">
                      <MapPin className="w-4 h-4" />
                      {text.room} {(currentClass || nextClass)?.room}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="font-semibold text-[#1A202C] mb-4">{text.totalClasses}</h2>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-[#7C5CFC]/10 flex items-center justify-center">
                  <BookOpen className="w-8 h-8 text-[#7C5CFC]" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-[#1A202C]">{daySchedule.length}</p>
                  <p className="text-sm text-[#90A3BF]">{text.fullDays[selectedDay]}</p>
                </div>
              </div>
            </div>

            {schoolData?.school && (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#7C5CFC] to-[#5CAFFC] flex items-center justify-center text-white font-bold">
                    {schoolData.school.name?.charAt(0) || 'E'}
                  </div>
                  <div>
                    <p className="font-semibold text-[#1A202C]">{schoolData.school.name}</p>
                    <p className="text-xs text-[#90A3BF]">{schoolData.class?.academicYear || '2025-2026'}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentTimetable;
