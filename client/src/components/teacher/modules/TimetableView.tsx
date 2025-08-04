import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Calendar, Clock, MapPin, Users, BookOpen, 
  Plus, Edit, Trash2, Download, Filter, TrendingUp, Eye
} from 'lucide-react';

interface TimetableSlot {
  id: number;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  subject: string;
  subjectId: number;
  classroom: string;
  classId: number;
  className: string;
  studentCount: number;
  color: string;
  duration: number;
}

interface Class {
  id: number;
  name: string;
  studentCount: number;
}

interface Subject {
  id: number;
  name: string;
  color: string;
}

const TimetableView: React.FC = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedWeek, setSelectedWeek] = useState(new Date().toISOString().split('T')[0]);
  const [isAddSlotOpen, setIsAddSlotOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<TimetableSlot | null>(null);
  const [slotForm, setSlotForm] = useState({
    dayOfWeek: '',
    startTime: '',
    endTime: '',
    subjectId: '',
    classId: '',
    classroom: ''
  });

  // Fetch timetable from API
  const { data: timetableData = [], isLoading: timetableLoading } = useQuery<TimetableSlot[]>({
    queryKey: ['/api/teacher/timetable', selectedWeek],
    queryFn: async () => {
      console.log('[TIMETABLE_VIEW] 🔍 Fetching timetable...');
      const response = await fetch(`/api/teacher/timetable?week=${selectedWeek}`, {
        credentials: 'include'
      });
      if (!response.ok) {
        console.error('[TIMETABLE_VIEW] ❌ Failed to fetch timetable');
        throw new Error('Failed to fetch timetable');
      }
      const data = await response.json();
      console.log('[TIMETABLE_VIEW] ✅ Timetable loaded:', data.length, 'slots');
      return data;
    },
    enabled: !!user,
    retry: 2
  });

  // Fetch classes from API
  const { data: classesData = [], isLoading: classesLoading } = useQuery<Class[]>({
    queryKey: ['/api/teacher/classes'],
    queryFn: async () => {
      console.log('[TIMETABLE_VIEW] 🔍 Fetching classes...');
      const response = await fetch('/api/teacher/classes', {
        credentials: 'include'
      });
      if (!response.ok) {
        console.error('[TIMETABLE_VIEW] ❌ Failed to fetch classes');
        throw new Error('Failed to fetch classes');
      }
      const data = await response.json();
      console.log('[TIMETABLE_VIEW] ✅ Classes loaded:', data.length);
      return data;
    },
    enabled: !!user,
    retry: 2
  });

  // Fetch subjects from API
  const { data: subjectsData = [], isLoading: subjectsLoading } = useQuery<Subject[]>({
    queryKey: ['/api/teacher/subjects'],
    queryFn: async () => {
      console.log('[TIMETABLE_VIEW] 🔍 Fetching subjects...');
      const response = await fetch('/api/teacher/subjects', {
        credentials: 'include'
      });
      if (!response.ok) {
        console.error('[TIMETABLE_VIEW] ❌ Failed to fetch subjects');
        throw new Error('Failed to fetch subjects');
      }
      const data = await response.json();
      console.log('[TIMETABLE_VIEW] ✅ Subjects loaded:', data.length);
      return data;
    },
    enabled: !!user,
    retry: 2
  });

  // Create/Update timetable slot mutation
  const saveSlotMutation = useMutation({
    mutationFn: async (slotData: any) => {
      const url = editingSlot ? `/api/teacher/timetable/${editingSlot.id}` : '/api/teacher/timetable';
      const method = editingSlot ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(slotData),
        credentials: 'include'
      });
      if (!response.ok) throw new Error(`Failed to ${editingSlot ? 'update' : 'create'} slot`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/teacher/timetable'] });
      setIsAddSlotOpen(false);
      setEditingSlot(null);
      setSlotForm({ dayOfWeek: '', startTime: '', endTime: '', subjectId: '', classId: '', classroom: '' });
      toast({
        title: language === 'fr' ? 'Créneaux mis à jour' : 'Slot Updated',
        description: language === 'fr' ? 'Le créneau a été mis à jour avec succès.' : 'Slot has been updated successfully.'
      });
    },
    onError: () => {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' ? 'Impossible de sauvegarder le créneau.' : 'Failed to save slot.',
        variant: 'destructive'
      });
    }
  });

  // Delete slot mutation
  const deleteSlotMutation = useMutation({
    mutationFn: async (slotId: number) => {
      const response = await fetch(`/api/teacher/timetable/${slotId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to delete slot');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/teacher/timetable'] });
      toast({
        title: language === 'fr' ? 'Créneau supprimé' : 'Slot Deleted',
        description: language === 'fr' ? 'Le créneau a été supprimé avec succès.' : 'Slot has been deleted successfully.'
      });
    }
  });

  const text = {
    fr: {
      title: 'Emploi du Temps',
      subtitle: 'Consultez et gérez votre emploi du temps',
      loading: 'Chargement de l\'emploi du temps...',
      noData: 'Aucun cours programmé',
      weekSelector: 'Semaine du',
      stats: {
        totalClasses: 'Cours Totaux',
        hoursPerWeek: 'Heures/Semaine',
        subjects: 'Matières',
        classrooms: 'Salles'
      },
      actions: {
        addSlot: 'Ajouter Cours',
        editSlot: 'Modifier',
        deleteSlot: 'Supprimer',
        export: 'Exporter',
        viewDetails: 'Détails'
      },
      form: {
        day: 'Jour',
        startTime: 'Heure début',
        endTime: 'Heure fin',
        subject: 'Matière',
        class: 'Classe',
        classroom: 'Salle',
        save: 'Enregistrer',
        cancel: 'Annuler'
      },
      days: {
        monday: 'Lundi',
        tuesday: 'Mardi',
        wednesday: 'Mercredi',
        thursday: 'Jeudi',
        friday: 'Vendredi',
        saturday: 'Samedi',
        sunday: 'Dimanche'
      }
    },
    en: {
      title: 'Timetable',
      subtitle: 'View and manage your timetable',
      loading: 'Loading timetable...',
      noData: 'No classes scheduled',
      weekSelector: 'Week of',
      stats: {
        totalClasses: 'Total Classes',
        hoursPerWeek: 'Hours/Week',
        subjects: 'Subjects',
        classrooms: 'Classrooms'
      },
      actions: {
        addSlot: 'Add Class',
        editSlot: 'Edit',
        deleteSlot: 'Delete',
        export: 'Export',
        viewDetails: 'Details'
      },
      form: {
        day: 'Day',
        startTime: 'Start Time',
        endTime: 'End Time',
        subject: 'Subject',
        class: 'Class',
        classroom: 'Classroom',
        save: 'Save',
        cancel: 'Cancel'
      },
      days: {
        monday: 'Monday',
        tuesday: 'Tuesday',
        wednesday: 'Wednesday',
        thursday: 'Thursday',
        friday: 'Friday',
        saturday: 'Saturday',
        sunday: 'Sunday'
      }
    }
  };

  const t = text[language as keyof typeof text];

  // Days of the week
  const weekDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00', 
    '13:00', '14:00', '15:00', '16:00', '17:00'
  ];

  // Organize timetable data by day and time
  const organizedTimetable = useMemo(() => {
    const organized: Record<string, Record<string, TimetableSlot | null>> = {};
    
    weekDays.forEach(day => {
      organized[day] = {};
      timeSlots.forEach(time => {
        organized[day][time] = null;
      });
    });

    (Array.isArray(timetableData) ? timetableData : []).forEach(slot => {
      if (organized[slot.dayOfWeek] && !organized[slot.dayOfWeek][slot.startTime]) {
        organized[slot.dayOfWeek][slot.startTime] = slot;
      }
    });

    return organized;
  }, [timetableData]);

  // Calculate statistics
  const totalClasses = (Array.isArray(timetableData) ? timetableData.length : 0);
  const hoursPerWeek = (Array.isArray(timetableData) ? timetableData : []).reduce((sum, slot) => sum + (slot.duration || 1), 0);
  const uniqueSubjects = new Set((Array.isArray(timetableData) ? timetableData : []).map(slot => slot.subject)).size;
  const uniqueClassrooms = new Set((Array.isArray(timetableData) ? timetableData : []).map(slot => slot.classroom)).size;

  const handleSaveSlot = () => {
    if (slotForm.dayOfWeek && slotForm.startTime && slotForm.endTime && slotForm.subjectId && slotForm.classId) {
      saveSlotMutation.mutate({
        dayOfWeek: slotForm.dayOfWeek,
        startTime: slotForm.startTime,
        endTime: slotForm.endTime,
        subjectId: parseInt(slotForm.subjectId),
        classId: parseInt(slotForm.classId),
        classroom: slotForm.classroom
      });
    }
  };

  const handleEditSlot = (slot: TimetableSlot) => {
    setEditingSlot(slot);
    setSlotForm({
      dayOfWeek: slot.dayOfWeek,
      startTime: slot.startTime,
      endTime: slot.endTime,
      subjectId: slot.subjectId.toString(),
      classId: slot.classId.toString(),
      classroom: slot.classroom
    });
    setIsAddSlotOpen(true);
  };

  const getSubjectColor = (subjectName: string) => {
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500',
      'bg-pink-500', 'bg-indigo-500', 'bg-teal-500', 'bg-red-500'
    ];
    const index = Math.abs(subjectName.split('').reduce((a, b) => a + b.charCodeAt(0), 0)) % colors.length;
    return colors[index];
  };

  if (timetableLoading || classesLoading || subjectsLoading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">{t.loading}</span>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t.title || ''}</h1>
          <p className="text-gray-600 mt-1">{t.subtitle}</p>
        </div>
        <div className="flex space-x-2">
          <Input
            type="week"
            value={selectedWeek.substring(0, 10)}
            onChange={(e) => setSelectedWeek(e?.target?.value)}
            className="w-auto"
          />
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            {t?.actions?.export}
          </Button>
          <Button 
            onClick={() => setIsAddSlotOpen(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            {t?.actions?.addSlot}
          </Button>
        </div>
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
                <p className="text-sm text-gray-600">{t?.stats?.totalClasses}</p>
                <p className="text-2xl font-bold">{totalClasses}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">{t?.stats?.hoursPerWeek}</p>
                <p className="text-2xl font-bold text-green-600">{hoursPerWeek}h</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <BookOpen className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">{t?.stats?.subjects}</p>
                <p className="text-2xl font-bold text-purple-600">{uniqueSubjects}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <MapPin className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">{t?.stats?.classrooms}</p>
                <p className="text-2xl font-bold text-orange-600">{uniqueClassrooms}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add/Edit Slot Modal */}
      {isAddSlotOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              {editingSlot ? t?.actions?.editSlot : t?.actions?.addSlot}
            </h3>
            <div className="space-y-4">
              <div>
                <Label>{t?.form?.day}</Label>
                <Select value={slotForm.dayOfWeek} onValueChange={(value) => setSlotForm(prev => ({ ...prev, dayOfWeek: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder={t?.form?.day} />
                  </SelectTrigger>
                  <SelectContent>
                    {weekDays.map(day => (
                      <SelectItem key={day} value={day}>
                        {t.days[day as keyof typeof t.days]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{t?.form?.startTime}</Label>
                  <Input
                    type="time"
                    value={slotForm.startTime}
                    onChange={(e) => setSlotForm(prev => ({ ...prev, startTime: e?.target?.value }))}
                  />
                </div>
                <div>
                  <Label>{t?.form?.endTime}</Label>
                  <Input
                    type="time"
                    value={slotForm.endTime}
                    onChange={(e) => setSlotForm(prev => ({ ...prev, endTime: e?.target?.value }))}
                  />
                </div>
              </div>
              <div>
                <Label>{t?.form?.subject}</Label>
                <Select value={slotForm.subjectId} onValueChange={(value) => setSlotForm(prev => ({ ...prev, subjectId: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder={t?.form?.subject} />
                  </SelectTrigger>
                  <SelectContent>
                    {(Array.isArray(subjectsData) ? subjectsData : []).map(subject => (
                      <SelectItem key={subject.id} value={subject.id.toString()}>
                        {subject.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{t?.form?.class}</Label>
                <Select value={slotForm.classId} onValueChange={(value) => setSlotForm(prev => ({ ...prev, classId: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder={t?.form?.class} />
                  </SelectTrigger>
                  <SelectContent>
                    {(Array.isArray(classesData) ? classesData : []).map(cls => (
                      <SelectItem key={cls.id} value={cls.id.toString()}>
                        {cls.name} ({cls.studentCount} élèves)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{t?.form?.classroom}</Label>
                <Input
                  value={slotForm.classroom}
                  onChange={(e) => setSlotForm(prev => ({ ...prev, classroom: e?.target?.value }))}
                  placeholder="Salle 101"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={handleSaveSlot}
                  disabled={saveSlotMutation.isPending || !slotForm.dayOfWeek || !slotForm.startTime || !slotForm.endTime || !slotForm.subjectId || !slotForm.classId}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {saveSlotMutation.isPending ? 'Enregistrement...' : t?.form?.save}
                </Button>
                <Button 
                  onClick={() => {
                    setIsAddSlotOpen(false);
                    setEditingSlot(null);
                    setSlotForm({ dayOfWeek: '', startTime: '', endTime: '', subjectId: '', classId: '', classroom: '' });
                  }}
                  variant="outline"
                >
                  {t?.form?.cancel}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Timetable Grid */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Emploi du Temps</h3>
        </CardHeader>
        <CardContent>
          {totalClasses === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">{t.noData}</h3>
              <p className="text-gray-600">Commencez par ajouter des cours à votre emploi du temps.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="border p-2 bg-gray-50 text-left">Heure</th>
                    {weekDays.map(day => (
                      <th key={day} className="border p-2 bg-gray-50 text-center min-w-32">
                        {t.days[day as keyof typeof t.days]}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {timeSlots.map(time => (
                    <tr key={time}>
                      <td className="border p-2 bg-gray-50 font-medium text-center">{time}</td>
                      {weekDays.map(day => {
                        const slot = organizedTimetable[day]?.[time];
                        return (
                          <td key={`${day}-${time}`} className="border p-1 h-20 relative">
                            {slot ? (
                              <div className={`${getSubjectColor(slot.subject)} text-white p-2 rounded-md text-xs h-full flex flex-col justify-between hover:opacity-90 transition-opacity cursor-pointer`}>
                                <div>
                                  <div className="font-medium">{slot.subject}</div>
                                  <div className="text-xs opacity-90">{slot.className}</div>
                                  <div className="text-xs opacity-75">{slot.classroom}</div>
                                </div>
                                <div className="flex items-center justify-between mt-1">
                                  <div className="flex items-center">
                                    <Users className="w-3 h-3 mr-1" />
                                    <span className="text-xs">{slot.studentCount}</span>
                                  </div>
                                  <div className="flex space-x-1">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-6 w-6 p-0 text-white hover:bg-white/20"
                                      onClick={() => handleEditSlot(slot)}
                                    >
                                      <Edit className="w-3 h-3" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-6 w-6 p-0 text-white hover:bg-white/20"
                                      onClick={() => deleteSlotMutation.mutate(slot.id)}
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="text-gray-300 text-center text-xs h-full flex items-center justify-center">
                                Libre
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TimetableView;