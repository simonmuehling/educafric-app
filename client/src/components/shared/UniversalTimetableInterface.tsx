import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Calendar, Clock, MapPin, Users, Plus, Edit, Trash2, Save, School, BookOpen,
  MessageSquare, Phone, Mail, Bell, Eye, User, Settings, Copy
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

interface TimeSlot {
  id: number;
  classId: number;
  subjectId: number;
  teacherId: number;
  day: string;
  startTime: string;
  endTime: string;
  classroom: string;
  subject: string;
  teacher: string;
  color?: string;
}

interface UniversalTimetableProps {
  userRole: 'Teacher' | 'Student' | 'Parent' | 'Director' | 'Admin';
  readOnly?: boolean;
  classId?: number;
  teacherId?: number;
  studentId?: number;
  showCommunications?: boolean;
}

const UniversalTimetableInterface: React.FC<UniversalTimetableProps> = ({
  userRole,
  readOnly = false,
  classId,
  teacherId,
  studentId,
  showCommunications = true
}) => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedDay, setSelectedDay] = useState('monday');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showMessageForm, setShowMessageForm] = useState(false);
  const [editingSlot, setEditingSlot] = useState<TimeSlot | null>(null);
  
  const [newSlot, setNewSlot] = useState<Partial<TimeSlot>>({
    day: 'monday',
    startTime: '08:00',
    endTime: '09:00',
    classroom: '',
    subject: '',
    teacher: ''
  });

  // Générer créneaux horaires ultra-flexibles (intervalles de 5 minutes)
  const generateFlexibleTimeSlots = () => {
    const slots = [];
    for (let hour = 6; hour <= 18; hour++) {
      for (let minute = 0; minute < 60; minute += 5) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(time);
      }
    }
    return slots;
  };

  const timeSlots = generateFlexibleTimeSlots();

  const text = {
    fr: {
      title: 'Emploi du Temps',
      subtitle: 'Système de gestion ultra-flexible avec précision 5 minutes',
      createNew: 'Nouveau Créneau',
      edit: 'Modifier',
      delete: 'Supprimer',
      save: 'Enregistrer',
      cancel: 'Annuler',
      copy: 'Dupliquer',
      startTime: 'Heure de Début',
      endTime: 'Heure de Fin',
      classroom: 'Salle',
      subject: 'Matière',
      teacher: 'Enseignant',
      selectClass: 'Sélectionner la Classe',
      selectSubject: 'Sélectionner la Matière',
      selectTeacher: 'Sélectionner l\'Enseignant',
      days: {
        monday: 'Lundi',
        tuesday: 'Mardi',
        wednesday: 'Mercredi',
        thursday: 'Jeudi',
        friday: 'Vendredi',
        saturday: 'Samedi',
        sunday: 'Dimanche'
      },
      roleViews: {
        Teacher: 'Vue Enseignant - Mes Classes & Matières',
        Student: 'Mon Emploi du Temps Personnel',
        Parent: 'Emploi du Temps de mes Enfants',
        Director: 'Vue Globale École - Tous les Emplois du Temps',
        Admin: 'Administration Complète'
      },
      features: {
        flexibleTiming: 'Créneaux de 5 minutes (6h-18h)',
        roleBasedAccess: 'Accès selon le rôle',
        multiClassView: 'Vue multi-classes',
        conflictDetection: 'Détection de conflits',
        autoScheduling: 'Planification automatique'
      }
    },
    en: {
      title: 'Timetable',
      subtitle: 'Ultra-flexible management system with 5-minute precision',
      createNew: 'New Slot',
      edit: 'Edit',
      delete: 'Delete',
      save: 'Save',
      cancel: 'Cancel',
      copy: 'Duplicate',
      startTime: 'Start Time',
      endTime: 'End Time',
      classroom: 'Room',
      subject: 'Subject',
      teacher: 'Teacher',
      selectClass: 'Select Class',
      selectSubject: 'Select Subject',
      selectTeacher: 'Select Teacher',
      days: {
        monday: 'Monday',
        tuesday: 'Tuesday',
        wednesday: 'Wednesday',
        thursday: 'Thursday',
        friday: 'Friday',
        saturday: 'Saturday',
        sunday: 'Sunday'
      },
      roleViews: {
        Teacher: 'Teacher View - My Classes & Subjects',
        Student: 'My Personal Timetable',
        Parent: 'My Children\'s Timetable',
        Director: 'School Overview - All Timetables',
        Admin: 'Full Administration'
      },
      features: {
        flexibleTiming: '5-minute slots (6AM-6PM)',
        roleBasedAccess: 'Role-based access',
        multiClassView: 'Multi-class view',
        conflictDetection: 'Conflict detection',
        autoScheduling: 'Auto scheduling'
      }
    }
  };

  const t = text[language as keyof typeof text];

  // Fetch timetable data based on user role
  const { data: timetableData = [], isLoading } = useQuery({
    queryKey: ['/api/timetable', userRole, classId, teacherId, studentId],
    queryFn: async () => {
      let endpoint = '/api/timetable';
      const params = new URLSearchParams();
      
      if (classId) params.append('classId', classId.toString());
      if (teacherId) params.append('teacherId', teacherId.toString());
      if (studentId) params.append('studentId', studentId.toString());
      params.append('role', userRole);
      
      const response = await fetch(`${endpoint}?${params}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch timetable');
      return response.json();
    }
  });

  // Fetch classes, subjects, and teachers for dropdown options
  const { data: classes = [] } = useQuery({
    queryKey: ['/api/classes'],
    queryFn: async () => {
      const response = await fetch('/api/classes', { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch classes');
      return response.json();
    }
  });

  const { data: subjects = [] } = useQuery({
    queryKey: ['/api/subjects'],
    queryFn: async () => {
      const response = await fetch('/api/subjects', { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch subjects');
      return response.json();
    }
  });

  const { data: teachers = [] } = useQuery({
    queryKey: ['/api/teachers'],
    queryFn: async () => {
      const response = await fetch('/api/teachers', { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch teachers');
      return response.json();
    }
  });

  // Create/Update timetable slot
  const saveSlotMutation = useMutation({
    mutationFn: async (slotData: Partial<TimeSlot>) => {
      const method = editingSlot ? 'PUT' : 'POST';
      const endpoint = editingSlot 
        ? `/api/timetable/${editingSlot.id}` 
        : '/api/timetable';
      
      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(slotData)
      });
      
      if (!response.ok) throw new Error('Failed to save slot');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/timetable'] });
      setShowCreateForm(false);
      setEditingSlot(null);
      setNewSlot({
        day: 'monday',
        startTime: '08:00',
        endTime: '09:00',
        classroom: '',
        subject: '',
        teacher: ''
      });
      toast({
        title: language === 'fr' ? 'Succès' : 'Success',
        description: language === 'fr' ? 'Créneau enregistré avec succès' : 'Slot saved successfully'
      });
    }
  });

  // Delete timetable slot
  const deleteSlotMutation = useMutation({
    mutationFn: async (slotId: number) => {
      const response = await fetch(`/api/timetable/${slotId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to delete slot');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/timetable'] });
      toast({
        title: language === 'fr' ? 'Supprimé' : 'Deleted',
        description: language === 'fr' ? 'Créneau supprimé avec succès' : 'Slot deleted successfully'
      });
    }
  });

  const handleSaveSlot = () => {
    const slotData = editingSlot ? { ...editingSlot, ...newSlot } : newSlot;
    saveSlotMutation.mutate(slotData);
  };

  const handleEditSlot = (slot: TimeSlot) => {
    setEditingSlot(slot);
    setNewSlot(slot);
    setShowCreateForm(true);
  };

  const handleCopySlot = (slot: TimeSlot) => {
    setEditingSlot(null);
    setNewSlot({
      ...slot,
      id: undefined,
      startTime: slot.endTime, // Start after the copied slot
      endTime: addMinutes(slot.endTime, 60) // Default 1 hour duration
    });
    setShowCreateForm(true);
  };

  const addMinutes = (time: string, minutes: number): string => {
    const [hours, mins] = time.split(':').map(Number);
    const totalMinutes = hours * 60 + mins + minutes;
    const newHours = Math.floor(totalMinutes / 60);
    const newMins = totalMinutes % 60;
    return `${newHours.toString().padStart(2, '0')}:${newMins.toString().padStart(2, '0')}`;
  };

  const getFilteredSlots = () => {
    return (Array.isArray(timetableData) ? timetableData : []).filter((slot: TimeSlot) => slot.day === selectedDay);
  };

  const getSlotColor = (subject: string) => {
    const colors = [
      'bg-blue-100 border-blue-300 text-blue-800',
      'bg-green-100 border-green-300 text-green-800',
      'bg-purple-100 border-purple-300 text-purple-800',
      'bg-orange-100 border-orange-300 text-orange-800',
      'bg-pink-100 border-pink-300 text-pink-800',
      'bg-yellow-100 border-yellow-300 text-yellow-800',
      'bg-indigo-100 border-indigo-300 text-indigo-800',
      'bg-red-100 border-red-300 text-red-800'
    ];
    
    const hash = subject.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    return colors[Math.abs(hash) % (Array.isArray(colors) ? colors.length : 0)];
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 rounded-xl h-20"></div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">{t.title || ''}</h2>
              <p className="text-blue-100 mt-1">{t.roleViews[userRole]}</p>
              <div className="flex flex-wrap gap-2 mt-3">
                <Badge variant="secondary" className="bg-white/20 text-white">
                  {t?.features?.flexibleTiming}
                </Badge>
                <Badge variant="secondary" className="bg-white/20 text-white">
                  {t?.features?.roleBasedAccess}
                </Badge>
                {userRole === 'Director' && (
                  <Badge variant="secondary" className="bg-white/20 text-white">
                    {t?.features?.multiClassView}
                  </Badge>
                )}
              </div>
            </div>
            {!readOnly && (userRole === 'Teacher' || userRole === 'Director' || userRole === 'Admin') && (
              <Button 
                onClick={() => setShowCreateForm(true)}
                className="bg-white text-blue-600 hover:bg-blue-50"
              >
                <Plus className="w-4 h-4 mr-2" />
                {t.createNew}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Day Navigation */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-2">
            {Object.entries(t.days).map(([day, label]) => (
              <Button
                key={day}
                variant={selectedDay === day ? "default" : "outline"}
                onClick={() => setSelectedDay(day)}
                className="flex-1 min-w-[100px]"
              >
                {label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Timetable Display */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            {t.days[selectedDay as keyof typeof t.days]}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {getFilteredSlots().length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {language === 'fr' 
                  ? 'Aucun cours programmé pour ce jour'
                  : 'No classes scheduled for this day'
                }
              </div>
            ) : (
              getFilteredSlots()
                .sort((a: TimeSlot, b: TimeSlot) => a?.startTime?.localeCompare(b.startTime))
                .map((slot: TimeSlot) => (
                  <div
                    key={slot.id}
                    className={`p-4 rounded-lg border-l-4 ${getSlotColor(slot.subject)} transition-all hover:shadow-md`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="w-4 h-4" />
                          <span className="font-semibold">
                            {slot.startTime} - {slot.endTime}
                          </span>
                          <Badge variant="outline">{slot.subject}</Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {slot.teacher}
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {slot.classroom}
                          </div>
                          {userRole === 'Director' && (
                            <div className="flex items-center gap-1">
                              <School className="w-3 h-3" />
                              Classe {slot.classId}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {!readOnly && (userRole === 'Teacher' || userRole === 'Director' || userRole === 'Admin') && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCopySlot(slot)}
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditSlot(slot)}
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              if (confirm(language === 'fr' 
                                ? 'Êtes-vous sûr de vouloir supprimer ce créneau ?' 
                                : 'Are you sure you want to delete this slot?'
                              )) {
                                deleteSlotMutation.mutate(slot.id);
                              }
                            }}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Create/Edit Slot Dialog */}
      <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
        <DialogContent className="max-w-2xl bg-white">
          <DialogHeader>
            <DialogTitle>
              {editingSlot 
                ? (language === 'fr' ? 'Modifier le Créneau' : 'Edit Slot')
                : (language === 'fr' ? 'Nouveau Créneau' : 'New Slot')
              }
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  {t.startTime}
                </label>
                <Select 
                  value={newSlot.startTime} 
                  onValueChange={(value) => setNewSlot({...newSlot, startTime: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t.startTime} />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {(Array.isArray(timeSlots) ? timeSlots : []).map((time) => (
                      <SelectItem key={time} value={time}>{time}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">
                  {t.endTime}
                </label>
                <Select 
                  value={newSlot.endTime} 
                  onValueChange={(value) => setNewSlot({...newSlot, endTime: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t.endTime} />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {(Array.isArray(timeSlots) ? timeSlots : []).map((time) => (
                      <SelectItem key={time} value={time}>{time}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  {t.subject}
                </label>
                <Select 
                  value={newSlot.subject} 
                  onValueChange={(value) => setNewSlot({...newSlot, subject: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t.selectSubject} />
                  </SelectTrigger>
                  <SelectContent>
                    {(Array.isArray(subjects) ? subjects : []).map((subject: any) => (
                      <SelectItem key={subject.id} value={subject.name || ''}>{subject.name || ''}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">
                  {t.teacher}
                </label>
                <Select 
                  value={newSlot.teacher} 
                  onValueChange={(value) => setNewSlot({...newSlot, teacher: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t.selectTeacher} />
                  </SelectTrigger>
                  <SelectContent>
                    {(Array.isArray(teachers) ? teachers : []).map((teacher: any) => (
                      <SelectItem key={teacher.id} value={`${teacher.firstName || ''} ${teacher.lastName || ''}`}>
                        {teacher.firstName || ''} {teacher.lastName || ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                {t.classroom}
              </label>
              <Input
                value={newSlot.classroom || ''}
                onChange={(e) => setNewSlot({...newSlot, classroom: e?.target?.value})}
                placeholder="Salle 101"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button 
                onClick={handleSaveSlot}
                disabled={saveSlotMutation.isPending}
                className="flex-1"
              >
                {saveSlotMutation.isPending ? (language === 'fr' ? 'Enregistrement...' : 'Saving...') : t.save}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowCreateForm(false);
                  setEditingSlot(null);
                  setNewSlot({
                    day: 'monday',
                    startTime: '08:00',
                    endTime: '09:00',
                    classroom: '',
                    subject: '',
                    teacher: ''
                  });
                }}
                className="flex-1"
              >
                {t.cancel}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UniversalTimetableInterface;