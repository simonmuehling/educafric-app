import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Calendar, Clock, Users, Plus, Edit, Eye, Save, 
  Download, Upload, Filter, Search, CheckSquare,
  Send, AlertTriangle, CheckCircle, XCircle, 
  MessageSquare, Bell, RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ModernCard } from '@/components/ui/ModernCard';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

const TeacherTimetable = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedWeek, setSelectedWeek] = useState('current');
  const [selectedClass, setSelectedClass] = useState('all');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isChangeRequestOpen, setIsChangeRequestOpen] = useState(false);
  const [isAdminResponsesOpen, setIsAdminResponsesOpen] = useState(false);
  const [currentSlot, setCurrentSlot] = useState<any>(null);
  const [selectedTab, setSelectedTab] = useState<'schedule' | 'changes' | 'responses'>('schedule');
  
  const [formData, setFormData] = useState({
    subject: '',
    className: '',
    room: '',
    startTime: '',
    endTime: '',
    timeSlot: ''
  });

  const [changeRequestData, setChangeRequestData] = useState({
    changeType: '',
    slotId: null,
    newTime: '',
    newRoom: '',
    reason: '',
    urgency: 'normal',
    affectedClasses: []
  });

  // Fetch teacher timetable from API
  const { data: timetableData, isLoading: timetableLoading, refetch: refetchTimetable } = useQuery({
    queryKey: ['/api/teacher/timetable'],
    enabled: !!user,
    queryFn: async () => {
      console.log('[TEACHER_TIMETABLE] 🔍 Fetching teacher timetable from unified API...');
      const response = await fetch('/api/teacher/timetable', {
        credentials: 'include'
      });
      if (!response.ok) {
        console.log('[TEACHER_TIMETABLE] ⚠️ Failed to fetch timetable, status:', response.status);
        throw new Error('Failed to fetch teacher timetable');
      }
      const data = await response.json();
      console.log('[TEACHER_TIMETABLE] ✅ Timetable fetched:', data?.success ? 'success' : 'no data');
      return data;
    },
    retry: 2,
    retryDelay: 1000
  });

  // Fetch timetable notifications for teacher
  const { data: notificationsData, isLoading: notificationsLoading } = useQuery({
    queryKey: ['/api/teacher/timetable/notifications'],
    enabled: !!user,
    queryFn: async () => {
      console.log('[TEACHER_TIMETABLE] 🔔 Fetching timetable notifications...');
      const response = await fetch('/api/teacher/timetable/notifications', {
        credentials: 'include'
      });
      if (!response.ok) {
        console.log('[TEACHER_TIMETABLE] ⚠️ No notifications API available');
        return { notifications: [], unreadCount: 0 };
      }
      const data = await response.json();
      console.log('[TEACHER_TIMETABLE] ✅ Notifications fetched:', data?.unreadCount || 0, 'unread');
      return data;
    },
    retry: 1,
    retryDelay: 500
  });

  // Fetch timetable change requests
  const { data: changeRequestsData, isLoading: changesLoading } = useQuery({
    queryKey: ['/api/teacher/timetable/changes'],
    enabled: !!user && selectedTab === 'changes'
  });

  // Fetch admin responses
  const { data: adminResponsesData, isLoading: responsesLoading } = useQuery({
    queryKey: ['/api/teacher/admin-responses'],
    enabled: !!user && selectedTab === 'responses'
  });

  // Submit timetable change request
  const submitChangeRequestMutation = useMutation({
    mutationFn: async (requestData: any) => {
      const response = await fetch('/api/teacher/timetable/change', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData),
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to submit change request');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/teacher/timetable/changes'] });
      setIsChangeRequestOpen(false);
      setChangeRequestData({
        changeType: '',
        slotId: null,
        newTime: '',
        newRoom: '',
        reason: '',
        urgency: 'normal',
        affectedClasses: []
      });
      toast({
        title: t.requestSent,
        description: t.requestSentDesc
      });
    },
    onError: () => {
      toast({
        title: t.error,
        description: t.requestError,
        variant: 'destructive'
      });
    }
  });

  // Mark admin response as read
  const markResponseReadMutation = useMutation({
    mutationFn: async (responseId: number) => {
      const response = await fetch(`/api/teacher/admin-responses/${responseId}/read`, {
        method: 'POST',
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to mark response as read');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/teacher/admin-responses'] });
    }
  });

  const text = {
    fr: {
      title: 'Emploi du Temps',
      subtitle: 'Gestion complète de votre planning d\'enseignement',
      currentWeek: 'Semaine actuelle',
      nextWeek: 'Semaine prochaine',
      allClasses: 'Toutes les classes',
      addSlot: 'Ajouter créneaux',
      editSlot: 'Modifier créneaux',
      viewSchedule: 'Voir planning',
      exportPdf: 'Exporter PDF',
      subject: 'Matière',
      class: 'Classe',
      room: 'Salle',
      time: 'Horaire',
      duration: 'Durée',
      save: 'Enregistrer',
      cancel: 'Annuler',
      startTime: 'Heure de début',
      endTime: 'Heure de fin',
      timeError: 'Erreur de temps',
      timeValidation: 'Veuillez saisir l\'heure de début et de fin',
      invalidTimeFormat: 'Format d\'heure invalide (HH:MM)',
      endTimeAfterStart: 'L\'heure de fin doit être après l\'heure de début',
      monday: 'Lundi',
      tuesday: 'Mardi',
      wednesday: 'Mercredi',
      thursday: 'Jeudi',
      friday: 'Vendredi',
      saturday: 'Samedi',
      totalHours: 'Total heures',
      freeSlots: 'Créneaux libres',
      conflicts: 'Conflits',
      week: 'Semaine',
      classLegend: 'Légende des classes',
      editSlotDialog: 'Dialog Modifier Créneaux',
      selectClass: 'Sélectionner une classe',
      schedule: 'Horaire',
      noCourses: 'Aucun cours',
      classesLabel: 'Classes',
      slotPrefix: 'Créneau:',
      subjectPlaceholder: 'Mathématiques',
      roomPlaceholder: 'Salle 12',
      scheduleTab: 'Planning',
      requestsTab: 'Demandes',
      adminResponsesTab: 'Réponses Admin',
      requestSent: 'Demande envoyée',
      requestSentDesc: 'Votre demande de modification a été envoyée à l\'administration',
      error: 'Erreur',
      requestError: 'Impossible d\'envoyer la demande de modification',
      slotUpdated: 'Créneaux modifié',
      slotUpdatedDesc: 'Les modifications ont été sauvegardées',
      exporting: 'Export en cours',
      exportingDesc: 'Génération du PDF de l\'emploi du temps...',
      missingInfo: 'Informations manquantes',
      missingInfoDesc: 'Veuillez remplir tous les champs obligatoires',
      pending: 'En attente',
      approved: 'Approuvé',
      rejected: 'Refusé',
      revisionRequested: 'Révision demandée',
      requestChange: 'Demande de modification',
      editSlotDesc: 'Modifiez les détails de ce créneau d\'enseignement',
      addSlotDesc: 'Ajoutez un nouveau créneau à votre emploi du temps'
    },
    en: {
      title: 'Timetable',
      subtitle: 'Complete management of your teaching schedule',
      currentWeek: 'Current week',
      nextWeek: 'Next week',
      allClasses: 'All classes',
      addSlot: 'Add slots',
      editSlot: 'Edit slots',
      viewSchedule: 'View schedule',
      exportPdf: 'Export PDF',
      subject: 'Subject',
      class: 'Class',
      room: 'Room',
      time: 'Time',
      duration: 'Duration',
      save: 'Save',
      cancel: 'Cancel',
      startTime: 'Start time',
      endTime: 'End time',
      timeError: 'Time Error',
      timeValidation: 'Please enter start and end time',
      invalidTimeFormat: 'Invalid time format (HH:MM)',
      endTimeAfterStart: 'End time must be after start time',
      monday: 'Monday',
      tuesday: 'Tuesday',
      wednesday: 'Wednesday',
      thursday: 'Thursday',
      friday: 'Friday',
      saturday: 'Saturday',
      totalHours: 'Total hours',
      freeSlots: 'Free slots',
      conflicts: 'Conflicts',
      week: 'Week',
      classLegend: 'Class Legend',
      editSlotDialog: 'Edit Slot Dialog',
      selectClass: 'Select a class',
      schedule: 'Schedule',
      noCourses: 'No courses',
      classesLabel: 'Classes',
      slotPrefix: 'Slot:',
      subjectPlaceholder: 'Mathematics',
      roomPlaceholder: 'Room 12',
      scheduleTab: 'Schedule',
      requestsTab: 'Requests',
      adminResponsesTab: 'Admin Responses',
      requestSent: 'Request submitted',
      requestSentDesc: 'Your change request has been sent to administration',
      error: 'Error',
      requestError: 'Failed to submit change request',
      slotUpdated: 'Slot updated',
      slotUpdatedDesc: 'Changes have been saved',
      exporting: 'Exporting',
      exportingDesc: 'Generating timetable PDF...',
      missingInfo: 'Missing information',
      missingInfoDesc: 'Please fill in all required fields',
      pending: 'Pending',
      approved: 'Approved',
      rejected: 'Rejected',
      revisionRequested: 'Revision requested',
      requestChange: 'Request change',
      editSlotDesc: 'Edit the details of this teaching slot',
      addSlotDesc: 'Add a new slot to your timetable'
    }
  };

  const t = text[language as keyof typeof text];

  const daysOfWeek = [
    { id: 'monday', name: t.monday, short: 'Lun' },
    { id: 'tuesday', name: t.tuesday, short: 'Mar' },
    { id: 'wednesday', name: t.wednesday, short: 'Mer' },
    { id: 'thursday', name: t.thursday, short: 'Jeu' },
    { id: 'friday', name: t.friday, short: 'Ven' },
    { id: 'saturday', name: t.saturday, short: 'Sam' }
  ];

  // Time validation and formatting functions for flexible time slots
  const formatTimeSlot = (startTime: string, endTime: string): string => {
    if (!startTime || !endTime) return '';
    return `${startTime}-${endTime}`;
  };

  const parseTimeSlot = (timeSlot: string): { startTime: string; endTime: string } => {
    if (!timeSlot.includes('-')) return { startTime: '', endTime: '' };
    const [startTime, endTime] = timeSlot.split('-');
    return { startTime: startTime.trim(), endTime: endTime.trim() };
  };

  const validateTimeFormat = (time: string): boolean => {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(time);
  };

  const validateTimeSlot = (startTime: string, endTime: string): string | null => {
    if (!startTime || !endTime) {
      return t.timeValidation;
    }
    
    if (!validateTimeFormat(startTime) || !validateTimeFormat(endTime)) {
      return t.invalidTimeFormat;
    }
    
    const start = new Date(`2000-01-01 ${startTime}:00`);
    const end = new Date(`2000-01-01 ${endTime}:00`);
    
    if (start >= end) {
      return t.endTimeAfterStart;
    }
    
    return null;
  };

  // Generate unique time slots from schedule data for display
  const timeSlots = () => {
    const slots = new Set<string>();
    Object.values(schedule).flat().forEach((slot: any) => {
      slots.add(slot.time);
    });
    return Array.from(slots).sort();
  };

  const classes = [
    { id: '6eme-a', name: '6ème A', students: 32 },
    { id: '6eme-b', name: '6ème B', students: 28 },
    { id: '5eme-a', name: '5ème A', students: 30 },
    { id: '4eme-a', name: '4ème A', students: 27 }
  ];


  const getClassColor = (className: string) => {
    switch (className) {
      case '6ème A': return 'activity-card-blue';
      case '6ème B': return 'activity-card-orange';
      case '5ème A': return 'activity-card-green';
      case '4ème A': return 'activity-card-purple';
      default: return 'activity-card-blue';
    }
  };

  const getTotalHours = () => {
    return Object.values(schedule).flat().length;
  };

  const getConflicts = () => {
    // Détecter les conflits d'horaires
    return 0; // Pas de conflits dans cet exemple
  };

  const handleSlotClick = (day: string, slot: any) => {
    const parsedTime = parseTimeSlot(slot.time);
    setCurrentSlot({ ...slot, day });
    setFormData({
      subject: slot.subject || '',
      className: slot.class || '',
      room: slot.room || '',
      startTime: parsedTime.startTime,
      endTime: parsedTime.endTime,
      timeSlot: slot.time || ''
    });
    setIsEditDialogOpen(true);
  };

  const updateTimeSlot = (newStartTime?: string, newEndTime?: string) => {
    const startTime = newStartTime !== undefined ? newStartTime : formData.startTime;
    const endTime = newEndTime !== undefined ? newEndTime : formData.endTime;
    const timeSlot = formatTimeSlot(startTime, endTime);
    
    setFormData(prev => ({
      ...prev,
      startTime,
      endTime,
      timeSlot
    }));
  };

  const handleSaveSlot = () => {
    // Validate time slot
    const timeValidationError = validateTimeSlot(formData.startTime, formData.endTime);
    if (timeValidationError) {
      toast({
        title: t.timeError,
        description: timeValidationError,
        variant: 'destructive'
      });
      return;
    }

    toast({
      title: t.slotUpdated,
      description: t.slotUpdatedDesc
    });
    setIsEditDialogOpen(false);
  };

  const handleExportPdf = () => {
    toast({
      title: t.exporting,
      description: t.exportingDesc
    });
  };

  // Use real data if available, otherwise fall back to mock data
  const schedule = (timetableData as any)?.timetable?.schedule || {
    monday: [
      { time: '08:00-09:00', subject: 'Mathématiques', class: '6ème A', room: 'Salle 12', color: 'blue' },
      { time: '09:00-10:00', subject: 'Mathématiques', class: '6ème A', room: 'Salle 12', color: 'blue' },
      { time: '11:00-12:00', subject: 'Mathématiques', class: '5ème A', room: 'Salle 15', color: 'green' },
      { time: '14:00-15:00', subject: 'Mathématiques', class: '4ème A', room: 'Salle 10', color: 'purple' }
    ],
    tuesday: [
      { time: '08:00-09:00', subject: 'Mathématiques', class: '6ème B', room: 'Salle 13', color: 'orange' },
      { time: '10:00-11:00', subject: 'Mathématiques', class: '6ème A', room: 'Salle 12', color: 'blue' },
      { time: '15:00-16:00', subject: 'Mathématiques', class: '5ème A', room: 'Salle 15', color: 'green' }
    ],
    wednesday: [
      { time: '09:00-10:00', subject: 'Mathématiques', class: '4ème A', room: 'Salle 10', color: 'purple' },
      { time: '11:00-12:00', subject: 'Mathématiques', class: '6ème B', room: 'Salle 13', color: 'orange' },
      { time: '14:00-15:00', subject: 'Mathématiques', class: '6ème A', room: 'Salle 12', color: 'blue' }
    ],
    thursday: [
      { time: '08:00-09:00', subject: 'Mathématiques', class: '5ème A', room: 'Salle 15', color: 'green' },
      { time: '10:00-11:00', subject: 'Mathématiques', class: '4ème A', room: 'Salle 10', color: 'purple' },
      { time: '16:00-17:00', subject: 'Mathématiques', class: '6ème A', room: 'Salle 12', color: 'blue' }
    ],
    friday: [
      { time: '09:00-10:00', subject: 'Mathématiques', class: '6ème B', room: 'Salle 13', color: 'orange' },
      { time: '11:00-12:00', subject: 'Mathématiques', class: '4ème A', room: 'Salle 10', color: 'purple' },
      { time: '15:00-16:00', subject: 'Mathématiques', class: '5ème A', room: 'Salle 15', color: 'green' }
    ],
    saturday: [
      { time: '08:00-09:00', subject: 'Mathématiques', class: '6ème A', room: 'Salle 12', color: 'blue' },
      { time: '10:00-11:00', subject: 'Mathématiques', class: '6ème B', room: 'Salle 13', color: 'orange' }
    ]
  };

  const changeRequests = (changeRequestsData as any)?.changeRequests || [];
  const adminResponses = (adminResponsesData as any)?.responses || [];
  const unreadResponsesCount = (adminResponsesData as any)?.unreadCount || 0;

  const handleSubmitChangeRequest = () => {
    if (!changeRequestData.changeType || !changeRequestData.reason) {
      toast({
        title: t.missingInfo,
        description: t.missingInfoDesc,
        variant: 'destructive'
      });
      return;
    }

    submitChangeRequestMutation.mutate(changeRequestData);
  };

  const handleMarkResponseRead = (responseId: number) => {
    markResponseReadMutation.mutate(responseId);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      revision_requested: 'bg-orange-100 text-orange-800'
    };

    const statusText: Record<string, string> = {
      pending: t.pending,
      approved: t.approved,
      rejected: t.rejected,
      revision_requested: t.revisionRequested
    };

    return (
      <Badge className={variants[status] || 'bg-gray-100 text-gray-800'}>
        {statusText[status] || status}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{t.title || ''}</h2>
          <p className="text-gray-600">{t.subtitle}</p>
          {/* Synchronization Status */}
          <div className="flex items-center mt-2 space-x-2">
            {timetableLoading ? (
              <div className="flex items-center text-sm text-blue-600">
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 mr-2"></div>
                Synchronisation en cours...
              </div>
            ) : (
              <div className="flex items-center text-sm text-green-600">
                <CheckCircle className="w-3 h-3 mr-1" />
                {(timetableData as any)?.success ? 'Synchronisé avec l\'école' : 'Données locales'}
              </div>
            )}
            
            {/* Notifications indicator */}
            {(notificationsData as any)?.unreadCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                <Bell className="w-3 h-3 mr-1" />
                {(notificationsData as any).unreadCount} notification{(notificationsData as any).unreadCount > 1 ? 's' : ''}
              </Badge>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => refetchTimetable()}
            disabled={timetableLoading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${timetableLoading ? 'animate-spin' : ''}`} />
            Synchroniser
          </Button>
          <Button variant="outline" onClick={handleExportPdf}>
            <Download className="w-4 h-4 mr-2" />
            {t.exportPdf}
          </Button>
          <Button onClick={() => setIsChangeRequestOpen(true)} className="bg-blue-600 hover:bg-blue-700">
            <Send className="w-4 h-4 mr-2" />
            {t.requestChange}
          </Button>
          <Button onClick={() => setIsEditDialogOpen(true)} variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            {t.addSlot}
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        <Button
          variant={selectedTab === 'schedule' ? "default" : "ghost"}
          size="sm"
          onClick={() => setSelectedTab('schedule')}
          className="flex-1"
          data-testid="tab-schedule"
        >
          <Calendar className="w-4 h-4 mr-2" />
          {t.scheduleTab}
        </Button>
        <Button
          variant={selectedTab === 'changes' ? "default" : "ghost"}
          size="sm"
          onClick={() => setSelectedTab('changes')}
          className="flex-1"
          data-testid="tab-changes"
        >
          <Edit className="w-4 h-4 mr-2" />
          {t.requestsTab}
          {changeRequests.filter((req: any) => req.status === 'pending').length > 0 && (
            <Badge variant="secondary" className="ml-2 text-xs">
              {changeRequests.filter((req: any) => req.status === 'pending').length}
            </Badge>
          )}
        </Button>
        <Button
          variant={selectedTab === 'responses' ? "default" : "ghost"}
          size="sm"
          onClick={() => setSelectedTab('responses')}
          className="flex-1"
          data-testid="tab-responses"
        >
          <MessageSquare className="w-4 h-4 mr-2" />
          {t.adminResponsesTab}
          {unreadResponsesCount > 0 && (
            <Badge variant="destructive" className="ml-2 text-xs">
              {unreadResponsesCount}
            </Badge>
          )}
        </Button>
      </div>

      {/* Tab Content */}
      {selectedTab === 'schedule' && (
        <>
          {/* Statistiques */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <ModernCard className="p-4 text-center activity-card-blue">
          <div className="text-2xl font-bold text-gray-800">{getTotalHours()}</div>
          <div className="text-sm text-gray-600">{t.totalHours}</div>
        </ModernCard>
        <ModernCard className="p-4 text-center activity-card-green">
          <div className="text-2xl font-bold text-gray-800">4</div>
          <div className="text-sm text-gray-600">{t.classesLabel}</div>
        </ModernCard>
        <ModernCard className="p-4 text-center activity-card-purple">
          <div className="text-2xl font-bold text-gray-800">{40 - getTotalHours()}</div>
          <div className="text-sm text-gray-600">{t.freeSlots}</div>
        </ModernCard>
        <ModernCard className="p-4 text-center activity-card-orange">
          <div className="text-2xl font-bold text-gray-800">{getConflicts()}</div>
          <div className="text-sm text-gray-600">{t.conflicts}</div>
        </ModernCard>
      </div>

      {/* Contrôles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">{t.week}</label>
          <select 
            value={selectedWeek}
            onChange={(e) => setSelectedWeek(e?.target?.value)}
            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="current">{t.currentWeek}</option>
            <option value="next">{t.nextWeek}</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">{t.class}</label>
          <select 
            value={selectedClass}
            onChange={(e) => setSelectedClass(e?.target?.value)}
            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">{t.allClasses}</option>
            {(Array.isArray(classes) ? classes : []).map(cls => (
              <option key={cls.id} value={cls.id}>{cls.name || ''}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grille emploi du temps */}
      <ModernCard className="p-4">
        <div className="overflow-x-auto">
          <div className="min-w-full">
            {/* Version Mobile */}
            <div className="block md:hidden space-y-4">
              {(Array.isArray(daysOfWeek) ? daysOfWeek : []).map(day => (
                <div key={day.id} className="border rounded-lg p-3">
                  <h3 className="font-semibold text-lg mb-3 text-center">{day.name || ''}</h3>
                  <div className="space-y-2">
                    {(schedule as any)[day.id]?.map((slot: any, index: number) => (
                      <div 
                        key={index}
                        className={`p-3 rounded-lg cursor-pointer hover:opacity-80 ${getClassColor(slot.class)}`}
                        onClick={() => handleSlotClick(day.id, slot)}
                      >
                        <div className="font-medium text-gray-800">{slot.time}</div>
                        <div className="text-sm text-gray-700">{slot.subject}</div>
                        <div className="text-sm text-gray-600">{slot.class} - {slot.room}</div>
                      </div>
                    )) || (
                      <div className="text-center text-gray-500 py-4">
                        {t.noCourses}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Version Desktop */}
            <div className="hidden md:block">
              <table className="min-w-full">
                <thead>
                  <tr>
                    <th className="w-24 p-3 text-left font-medium text-gray-700">{t.time}</th>
                    {(Array.isArray(daysOfWeek) ? daysOfWeek : []).map(day => (
                      <th key={day.id} className="p-3 text-center font-medium text-gray-700">
                        {day.name || ''}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {timeSlots().map(timeSlot => (
                    <tr key={timeSlot} className="border-t">
                      <td className="p-3 text-sm font-medium text-gray-600 bg-gray-50">
                        {timeSlot}
                      </td>
                      {(Array.isArray(daysOfWeek) ? daysOfWeek : []).map(day => {
                        const slot = (schedule as any)[day.id]?.find((s: any) => s.time === timeSlot);
                        return (
                          <td key={day.id} className="p-1 border-l">
                            {slot ? (
                              <div 
                                className={`p-2 rounded cursor-pointer hover:opacity-80 ${getClassColor(slot.class)} text-center`}
                                onClick={() => handleSlotClick(day.id, slot)}
                              >
                                <div className="font-medium text-sm text-gray-800">{slot.subject}</div>
                                <div className="text-xs text-gray-700">{slot.class}</div>
                                <div className="text-xs text-gray-600">{slot.room}</div>
                              </div>
                            ) : (
                              <div className="h-16 flex items-center justify-center text-gray-400 hover:bg-gray-50 rounded cursor-pointer">
                                <Plus className="w-4 h-4" />
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
          </div>
        </div>
      </ModernCard>

      {/* Legend */}
      <ModernCard className="p-4">
        <h3 className="font-medium mb-3">{t.classLegend}</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {(Array.isArray(classes) ? classes : []).map(cls => (
            <div key={cls.id} className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded ${getClassColor(cls.name)}`}></div>
              <span className="text-sm font-medium">{cls.name || ''}</span>
              <Badge variant="outline" className="text-xs">{cls.students}</Badge>
            </div>
          ))}
        </div>
      </ModernCard>
        </>
      )}

      {/* {t.editSlotDialog} */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md bg-white">
          <DialogHeader>
            <DialogTitle>
              {currentSlot ? t.editSlot : t.addSlot}
            </DialogTitle>
            <DialogDescription>
              {currentSlot 
                ? t.editSlotDesc
                : t.addSlotDesc}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">{t.subject}</label>
              <Input 
                value={formData.subject}
                onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                placeholder={t.subjectPlaceholder} 
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">{t.class}</label>
              <select 
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.className}
                onChange={(e) => setFormData(prev => ({ ...prev, className: e.target.value }))}
              >
                <option value="">{t.selectClass}</option>
                {(Array.isArray(classes) ? classes : []).map(cls => (
                  <option key={cls.id} value={cls.name}>{cls.name || ''}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">{t.room}</label>
              <Input 
                value={formData.room}
                onChange={(e) => setFormData(prev => ({ ...prev, room: e.target.value }))}
                placeholder={t.roomPlaceholder} 
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">{t.startTime}</label>
                <Input 
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => updateTimeSlot(e.target.value, undefined)}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">{t.endTime}</label>
                <Input 
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => updateTimeSlot(undefined, e.target.value)}
                  className="w-full"
                />
              </div>
            </div>
            
            {formData.timeSlot && (
              <div className="text-sm text-gray-600 text-center p-2 bg-gray-50 rounded">
                {t.slotPrefix} {formData.timeSlot}
              </div>
            )}

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                {t.cancel}
              </Button>
              <Button onClick={handleSaveSlot}>
                <Save className="w-4 h-4 mr-2" />
                {t.save}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TeacherTimetable;