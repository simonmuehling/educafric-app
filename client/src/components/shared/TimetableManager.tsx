import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Calendar, Clock, Plus, Edit3, Save, X, Users, 
  BookOpen, MapPin, AlertCircle, Check, Settings
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/CardLayout';
import { Button } from '@/components/ui/button';
import { ModernCard } from '@/components/ui/ModernCard';

interface TimeSlot {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  subject: string;
  teacher: string;
  room: string;
  class: string;
  students?: number;
}

const TimetableManager = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const [selectedDay, setSelectedDay] = useState('monday');
  const [isEditing, setIsEditing] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);

  const t = {
    fr: {
      title: 'Gestion des Emplois du Temps',
      subtitle: 'Planification et organisation des cours',
      days: {
        monday: 'Lundi',
        tuesday: 'Mardi', 
        wednesday: 'Mercredi',
        thursday: 'Jeudi',
        friday: 'Vendredi',
        saturday: 'Samedi',
        sunday: 'Dimanche'
      },
      addSlot: 'Ajouter Créneau',
      editSlot: 'Modifier Créneau',
      saveChanges: 'Sauvegarder',
      cancel: 'Annuler',
      subject: 'Matière',
      teacher: 'Enseignant',
      room: 'Salle',
      class: 'Classe',
      time: 'Horaire',
      students: 'Élèves',
      noSlots: 'Aucun cours programmé',
      createFirst: 'Créer le premier créneau',
      permissions: 'Permissions selon votre rôle',
      viewOnly: 'Consultation uniquement',
      fullAccess: 'Accès complet',
      settings: 'Paramètres',
      timeFormat: 'Format 24h',
      notifications: 'Notifications automatiques',
      conflicts: 'Détection de conflits'
    },
    en: {
      title: 'Timetable Management',
      subtitle: 'Class scheduling and organization',
      days: {
        monday: 'Monday',
        tuesday: 'Tuesday',
        wednesday: 'Wednesday', 
        thursday: 'Thursday',
        friday: 'Friday',
        saturday: 'Saturday',
        sunday: 'Sunday'
      },
      addSlot: 'Add Time Slot',
      editSlot: 'Edit Time Slot',
      saveChanges: 'Save Changes',
      cancel: 'Cancel',
      subject: 'Subject',
      teacher: 'Teacher',
      room: 'Room',
      class: 'Class',
      time: 'Time',
      students: 'Students',
      noSlots: 'No classes scheduled',
      createFirst: 'Create first time slot',
      permissions: 'Permissions based on your role',
      viewOnly: 'View only',
      fullAccess: 'Full access',
      settings: 'Settings',
      timeFormat: '24h format',
      notifications: 'Automatic notifications',
      conflicts: 'Conflict detection'
    }
  };

  const text = t[language as keyof typeof t];

  // Sample timetable data based on user role
  const getSampleTimetable = (): TimeSlot[] => {
    const baseSchedule = [
      {
        id: '1',
        day: 'monday',
        startTime: '08:00',
        endTime: '09:00',
        subject: language === 'fr' ? 'Mathématiques' : 'Mathematics',
        teacher: 'Demo Teacher',
        room: '101',
        class: '6ème A',
        students: 28
      },
      {
        id: '2', 
        day: 'monday',
        startTime: '09:05',
        endTime: '10:05',
        subject: language === 'fr' ? 'Français' : 'French',
        teacher: 'Marie Dupont',
        room: '102',
        class: '6ème A',
        students: 28
      },
      {
        id: '3',
        day: 'tuesday',
        startTime: '08:00',
        endTime: '09:00',
        subject: language === 'fr' ? 'Sciences' : 'Science',
        teacher: 'Paul Martin',
        room: '103',
        class: '6ème A',
        students: 28
      },
      {
        id: '4',
        day: 'wednesday',
        startTime: '10:15',
        endTime: '11:15',
        subject: language === 'fr' ? 'Histoire' : 'History',
        teacher: 'Sophie Lambert',
        room: '104',
        class: '6ème A',
        students: 28
      },
      {
        id: '5',
        day: 'thursday',
        startTime: '14:00',
        endTime: '15:00',
        subject: language === 'fr' ? 'Géographie' : 'Geography',
        teacher: 'Jean Mbeki',
        room: '105',
        class: '6ème A',
        students: 28
      },
      {
        id: '6',
        day: 'friday',
        startTime: '08:00',
        endTime: '09:00',
        subject: language === 'fr' ? 'Anglais' : 'English',
        teacher: 'David Smith',
        room: '106',
        class: '6ème A',
        students: 28
      }
    ];

    // Filter based on user role
    if (user?.role === 'Teacher') {
      return (Array.isArray(baseSchedule) ? baseSchedule : []).filter(slot => slot.teacher === user.name);
    }
    
    return baseSchedule;
  };

  const [timetableData, setTimetableData] = useState<TimeSlot[]>(getSampleTimetable());

  const getPermissionLevel = () => {
    if (['SiteAdmin', 'Admin', 'Director'].includes(user?.role || '')) {
      return 'full';
    } else if (user?.role === 'Teacher') {
      return 'limited';
    } else {
      return 'view';
    }
  };

  const canEdit = () => {
    const permission = getPermissionLevel();
    return permission === 'full' || permission === 'limited';
  };

  const getDaySlots = (day: string) => {
    return timetableData
      .filter(slot => slot.day === day)
      .sort((a, b) => a?.startTime?.localeCompare(b.startTime));
  };

  const handleAddSlot = () => {
    if (!canEdit()) return;
    
    const newSlot: TimeSlot = {
      id: Date.now().toString(),
      day: selectedDay,
      startTime: '08:00',
      endTime: '09:00',
      subject: language === 'fr' ? 'Nouvelle Matière' : 'New Subject',
      teacher: user?.name || 'Teacher',
      room: '101',
      class: '6ème A',
      students: 30
    };
    
    setSelectedSlot(newSlot);
    setIsEditing(true);
  };

  const handleEditSlot = (slot: TimeSlot) => {
    if (!canEdit()) return;
    setSelectedSlot(slot);
    setIsEditing(true);
  };

  const handleSaveSlot = () => {
    if (!selectedSlot) return;
    
    const updatedTimetable = (Array.isArray(timetableData) ? timetableData : []).filter(slot => slot.id !== selectedSlot.id);
    updatedTimetable.push(selectedSlot);
    
    setTimetableData(updatedTimetable);
    setIsEditing(false);
    setSelectedSlot(null);
  };

  const handleDeleteSlot = (slotId: string) => {
    if (!canEdit()) return;
    setTimetableData((Array.isArray(timetableData) ? timetableData : []).filter(slot => slot.id !== slotId));
  };

  const TimeSlotCard = ({ slot }: { slot: TimeSlot }) => (
    <ModernCard className="mb-3 hover:shadow-lg transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">
                {slot.startTime} - {slot.endTime}
              </div>
              <div className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                {slot.subject}
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {slot.class}
              </span>
              <span className="flex items-center gap-1">
                <BookOpen className="w-4 h-4" />
                {slot.teacher}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {text.room} {slot.room}
              </span>
              {slot.students && (
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {slot.students} {text?.students?.toLowerCase()}
                </span>
              )}
            </div>
          </div>
          {canEdit() && (
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleEditSlot(slot)}
              >
                <Edit3 className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleDeleteSlot(slot.id)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </ModernCard>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{text.title || ''}</h2>
          <p className="text-gray-600">{text.subtitle}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-gray-100 px-3 py-1 rounded-full text-sm">
            {getPermissionLevel() === 'full' ? text.fullAccess : 
             getPermissionLevel() === 'limited' ? `${text.teacher} ${text.permissions}` : 
             text.viewOnly}
          </div>
          {canEdit() && (
            <Button onClick={handleAddSlot} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              {text.addSlot}
            </Button>
          )}
        </div>
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

      {/* Timetable Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Schedule View */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                {text.days[selectedDay as keyof typeof text.days]}
              </h3>
            </CardHeader>
            <CardContent>
              {getDaySlots(selectedDay).length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-600 mb-2">
                    {text.noSlots}
                  </h4>
                  {canEdit() && (
                    <Button onClick={handleAddSlot} variant="outline">
                      {text.createFirst}
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {getDaySlots(selectedDay).map(slot => (
                    <TimeSlotCard key={slot.id} slot={slot} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Settings Panel */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Settings className="w-5 h-5" />
                {text.settings}
              </h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">{text.timeFormat}</span>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">{text.notifications}</span>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">{text.conflicts}</span>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">
                {language === 'fr' ? 'Statistiques' : 'Statistics'}
              </h3>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">
                  {language === 'fr' ? 'Total cours' : 'Total classes'}
                </span>
                <span className="font-medium">{(Array.isArray(timetableData) ? timetableData.length : 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">
                  {language === 'fr' ? 'Cette semaine' : 'This week'}
                </span>
                <span className="font-medium">{(Array.isArray(timetableData) ? timetableData.length : 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">
                  {language === 'fr' ? 'Salles utilisées' : 'Rooms used'}
                </span>
                <span className="font-medium">
                  {new Set((Array.isArray(timetableData) ? timetableData : []).map(slot => slot.room)).size}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditing && selectedSlot && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <h3 className="text-lg font-semibold">
                {selectedSlot?.id?.includes(Date.now().toString()) ? text.addSlot : text.editSlot}
              </h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">{text.subject}</label>
                <input
                  type="text"
                  value={selectedSlot.subject}
                  onChange={(e) => setSelectedSlot({...selectedSlot, subject: e?.target?.value})}
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
                    value={selectedSlot.startTime}
                    onChange={(e) => setSelectedSlot({...selectedSlot, startTime: e?.target?.value})}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    {language === 'fr' ? 'Fin' : 'End'}
                  </label>
                  <input
                    type="time"
                    value={selectedSlot.endTime}
                    onChange={(e) => setSelectedSlot({...selectedSlot, endTime: e?.target?.value})}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{text.room}</label>
                <input
                  type="text"
                  value={selectedSlot.room}
                  onChange={(e) => setSelectedSlot({...selectedSlot, room: e?.target?.value})}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{text.class}</label>
                <input
                  type="text"
                  value={selectedSlot.class}
                  onChange={(e) => setSelectedSlot({...selectedSlot, class: e?.target?.value})}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button onClick={handleSaveSlot} className="flex-1">
                  <Save className="w-4 h-4 mr-2" />
                  {text.saveChanges}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {setIsEditing(false); setSelectedSlot(null);}}
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

export default TimetableManager;