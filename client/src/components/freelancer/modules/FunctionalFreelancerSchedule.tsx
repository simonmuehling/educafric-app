import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Calendar, Clock, MapPin, RefreshCw,
  Plus, Filter, Eye, Edit,
  Users, BookOpen, AlertCircle, CheckCircle
} from 'lucide-react';

interface FreelancerScheduleSlot {
  id: number;
  title: string;
  subject: string;
  studentClass: string;
  level: string;
  dayOfWeek: number;
  dayName: string;
  startTime: string;
  endTime: string;
  duration: string;
  location: string;
  recurring: boolean;
  type: string;
  status: string;
}

const FunctionalFreelancerSchedule: React.FC = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const [selectedDay, setSelectedDay] = useState<number>(new Date().getDay());
  const [viewMode, setViewMode] = useState<string>('week');

  // Fetch freelancer schedule data from PostgreSQL API
  const { data: schedule = [], isLoading } = useQuery<FreelancerScheduleSlot[]>({
    queryKey: ['/api/freelancer/schedule'],
    enabled: !!user
  });

  const text = {
    fr: {
      title: 'Mon Planning',
      subtitle: 'Gérez votre emploi du temps de cours particuliers',
      loading: 'Chargement du planning...',
      noData: 'Aucun créneau programmé',
      stats: {
        totalSlots: 'Créneaux Totaux',
        thisWeek: 'Cette Semaine',
        recurring: 'Récurrents',
        available: 'Disponibles'
      },
      days: {
        0: 'Dimanche',
        1: 'Lundi', 
        2: 'Mardi',
        3: 'Mercredi',
        4: 'Jeudi',
        5: 'Vendredi',
        6: 'Samedi'
      },
      status: {
        active: 'Actif',
        cancelled: 'Annulé',
        completed: 'Terminé'
      },
      actions: {
        newSlot: 'Nouveau Créneau',
        editSlot: 'Modifier',
        viewDetails: 'Détails',
        duplicate: 'Dupliquer'
      },
      views: {
        week: 'Semaine',
        day: 'Jour',
        month: 'Mois'
      },
      slot: {
        subject: 'Matière',
        student: 'Élève/Groupe',
        time: 'Horaire',
        duration: 'Durée',
        location: 'Lieu',
        level: 'Niveau',
        recurring: 'Récurrent',
        type: 'Type'
      }
    },
    en: {
      title: 'My Schedule',
      subtitle: 'Manage your tutoring schedule',
      loading: 'Loading schedule...',
      noData: 'No time slots scheduled',
      stats: {
        totalSlots: 'Total Slots',
        thisWeek: 'This Week',
        recurring: 'Recurring',
        available: 'Available'
      },
      days: {
        0: 'Sunday',
        1: 'Monday',
        2: 'Tuesday', 
        3: 'Wednesday',
        4: 'Thursday',
        5: 'Friday',
        6: 'Saturday'
      },
      status: {
        active: 'Active',
        cancelled: 'Cancelled',
        completed: 'Completed'
      },
      actions: {
        newSlot: 'New Slot',
        editSlot: 'Edit',
        viewDetails: 'Details',
        duplicate: 'Duplicate'
      },
      views: {
        week: 'Week',
        day: 'Day',
        month: 'Month'
      },
      slot: {
        subject: 'Subject',
        student: 'Student/Group',
        time: 'Time',
        duration: 'Duration',
        location: 'Location',
        level: 'Level',
        recurring: 'Recurring',
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

  // Filter schedule by selected day
  const filteredSchedule = viewMode === 'day' 
    ? (Array.isArray(schedule) ? schedule : []).filter(slot => slot.dayOfWeek === selectedDay)
    : schedule;

  // Group by day for week view
  const scheduleByDay = (Array.isArray(schedule) ? schedule : []).reduce((acc, slot) => {
    if (!acc[slot.dayOfWeek]) acc[slot.dayOfWeek] = [];
    acc[slot.dayOfWeek].push(slot);
    return acc;
  }, {} as Record<number, FreelancerScheduleSlot[]>);

  // Calculate statistics
  const totalSlots = (Array.isArray(schedule) ? schedule.length : 0);
  const recurringSlots = (Array.isArray(schedule) ? schedule : []).filter(s => s.recurring).length;
  const activeSlots = (Array.isArray(schedule) ? schedule : []).filter(s => s.status === 'active').length;
  
  // Get this week slots (assuming each slot occurs once per week)
  const thisWeekSlots = (Array.isArray(schedule) ? schedule.length : 0);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      active: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      completed: 'bg-blue-100 text-blue-800'
    };

    return (
      <Badge className={variants[status] || 'bg-gray-100 text-gray-800'}>
        {t.status[status as keyof typeof t.status]}
      </Badge>
    );
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'tutoring':
        return 'bg-blue-500';
      case 'group':
        return 'bg-green-500';
      case 'exam_prep':
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
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
          {t?.actions?.newSlot}
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
                <p className="text-sm text-gray-600">{t?.stats?.totalSlots}</p>
                <p className="text-2xl font-bold">{totalSlots}</p>
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
                <p className="text-sm text-gray-600">{t?.stats?.thisWeek}</p>
                <p className="text-2xl font-bold text-green-600">{thisWeekSlots}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <RefreshCw className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">{t?.stats?.recurring}</p>
                <p className="text-2xl font-bold text-purple-600">{recurringSlots}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Users className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">{t?.stats?.available}</p>
                <p className="text-2xl font-bold text-orange-600">{activeSlots}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* View Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Planning Hebdomadaire</h3>
            <div className="flex items-center space-x-3">
              <div className="flex space-x-1">
                {Object.entries(t.views).map(([key, label]) => (
                  <Button
                    key={key}
                    variant={viewMode === key ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode(key)}
                  >
                    {label}
                  </Button>
                ))}
              </div>
              {viewMode === 'day' && (
                <select
                  value={selectedDay}
                  onChange={(e) => setSelectedDay(Number(e?.target?.value))}
                  className="border rounded-md px-3 py-1 text-sm"
                >
                  {Object.entries(t.days).map(([day, name]) => (
                    <option key={day} value={day}>{name}</option>
                  ))}
                </select>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {viewMode === 'week' ? (
            // Week View
            <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
              {[1, 2, 3, 4, 5, 6, 0].map(day => (
                <div key={day} className="space-y-2">
                  <h4 className="font-semibold text-center p-2 bg-gray-100 rounded">
                    {t.days[day as keyof typeof t.days]}
                  </h4>
                  <div className="space-y-2 min-h-[200px]">
                    {(scheduleByDay[day] || []).map(slot => (
                      <Card key={slot.id} className="p-2 border-l-4" style={{borderLeftColor: getTypeColor(slot.type).replace('bg-', '#')}}>
                        <div className="text-xs">
                          <div className="font-medium text-gray-900">{slot.subject}</div>
                          <div className="text-gray-600">{slot.startTime} - {slot.endTime}</div>
                          <div className="text-gray-500">{slot.studentClass}</div>
                          {slot.recurring && (
                            <Badge variant="outline" className="text-xs mt-1">
                              <RefreshCw className="w-3 h-3 mr-1" />
                              Récurrent
                            </Badge>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Day/List View
            <div className="space-y-4">
              {(Array.isArray(filteredSchedule) ? filteredSchedule.length : 0) === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">{t.noData}</h3>
                  <p className="text-gray-600">Aucun créneau pour cette période.</p>
                </div>
              ) : (
                (Array.isArray(filteredSchedule) ? filteredSchedule : []).map((slot) => (
                  <Card key={slot.id} className="border hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            <div className={`p-2 ${getTypeColor(slot.type)} rounded-lg`}>
                              <BookOpen className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h4 className="text-lg font-semibold text-gray-900">{slot.title || ''}</h4>
                              <p className="text-sm text-gray-600">{slot.dayName}</p>
                            </div>
                            {getStatusBadge(slot.status)}
                            {slot.recurring && (
                              <Badge variant="outline">
                                <RefreshCw className="w-3 h-3 mr-1" />
                                Récurrent
                              </Badge>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                            <div>
                              <p className="text-sm text-gray-500">{t?.slot?.subject}</p>
                              <p className="font-medium">{slot.subject}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">{t?.slot?.student}</p>
                              <p className="font-medium">{slot.studentClass}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">{t?.slot?.time}</p>
                              <div className="flex items-center">
                                <Clock className="w-4 h-4 mr-1 text-gray-400" />
                                <p className="font-medium">{slot.startTime} - {slot.endTime}</p>
                              </div>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">{t?.slot?.location}</p>
                              <div className="flex items-center">
                                <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                                <p className="font-medium">{slot.location}</p>
                              </div>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">{t?.slot?.level}</p>
                              <p className="font-medium">{slot.level}</p>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4 mr-2" />
                              {t?.actions?.viewDetails}
                            </Button>
                            <Button variant="outline" size="sm">
                              <Edit className="w-4 h-4 mr-2" />
                              {t?.actions?.editSlot}
                            </Button>
                            <Button variant="outline" size="sm">
                              <RefreshCw className="w-4 h-4 mr-2" />
                              {t?.actions?.duplicate}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FunctionalFreelancerSchedule;