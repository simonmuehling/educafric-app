import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Plus, Save, School, BookOpen, UserCheck, Globe, Calendar, Layers } from 'lucide-react';

// Import ModernCard
const ModernCard = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white/80 backdrop-blur-md shadow-xl border border-white/30 rounded-2xl ${className}`}>
    {children}
  </div>
);

interface TimetableSlot {
  id?: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  subjectId: number;
  teacherId: number;
  classId: number;
  classroom: string;
  validityPeriod: string;
  isAfricanSchedule?: boolean;
  isClimateBreak?: boolean;
}

interface TimetableCreationProps {
  onSlotCreated?: (slot: TimetableSlot) => void;
  onBulkOperation?: (operation: string, slots: TimetableSlot[]) => void;
}

export function TimetableCreation({ onSlotCreated, onBulkOperation }: TimetableCreationProps) {
  const { language } = useLanguage();
  const { toast } = useToast();

  const [currentSlot, setCurrentSlot] = useState<TimetableSlot>({
    dayOfWeek: 1,
    startTime: '08:00',
    endTime: '09:00',
    subjectId: 0,
    teacherId: 0,
    classId: 0,
    classroom: '',
    validityPeriod: 'weekly',
    isClimateBreak: false,
    isAfricanSchedule: true
  });

  const [validityPeriod, setValidityPeriod] = useState('weekly');
  const [selectedSlots, setSelectedSlots] = useState<TimetableSlot[]>([]);
  const [classesData, setClassesData] = useState<any[]>([]);
  const [teachersData, setTeachersData] = useState<any[]>([]);

  // Fetch existing classes and teachers
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [classesResponse, teachersResponse] = await Promise.all([
          fetch('/api/classes'),
          fetch('/api/teachers')
        ]);

        if (classesResponse.ok) {
          const classesResult = await classesResponse.json();
          setClassesData(classesResult.classes || []);
        }

        if (teachersResponse.ok) {
          const teachersResult = await teachersResponse.json();
          setTeachersData(teachersResult.teachers || []);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  // Predefined subjects
  const subjects = [
    { id: 1, name: 'Mathématiques', nameEn: 'Mathematics' },
    { id: 2, name: 'Français', nameEn: 'French' },
    { id: 3, name: 'Anglais', nameEn: 'English' },
    { id: 4, name: 'Sciences', nameEn: 'Science' },
    { id: 5, name: 'Histoire', nameEn: 'History' },
    { id: 6, name: 'Géographie', nameEn: 'Geography' },
    { id: 7, name: 'Éducation Physique', nameEn: 'Physical Education' },
    { id: 8, name: 'Arts', nameEn: 'Arts' },
    { id: 9, name: 'Informatique', nameEn: 'Computer Science' },
    { id: 10, name: 'Philosophie', nameEn: 'Philosophy' }
  ];

  // Generate manual time slots (every 5 minutes from 6:00 to 18:00)
  const timeSlots = (() => {
    const slots = [];
    for (let hour = 6; hour <= 18; hour++) {
      for (let minute = 0; minute < 60; minute += 5) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(time);
      }
    }
    return slots;
  })();

  const text = {
    fr: {
      title: 'Nouveau Créneaux',
      subtitle: 'Importer les classes existantes et saisir les horaires manuellement',
      dayOfWeek: 'Jour de la semaine',
      startTime: 'Heure de début',
      endTime: 'Heure de fin',
      subject: 'Matière',
      teacher: 'Enseignant',
      class: 'Classe',
      classroom: 'Salle de classe',
      validityPeriod: 'Période de validité',
      africanFeatures: 'Fonctionnalités Africaines',
      climateBreak: 'Pause climatique (12h-14h)',
      includeSaturday: 'Inclure samedi',
      schoolYear: 'Année scolaire Oct-Juil',
      bulkOperations: 'Opérations en lot',
      selectMultiple: 'Sélection multiple',
      copyTemplate: 'Copier template',
      applyToClasses: 'Appliquer aux classes',
      conflictDetection: 'Détection conflits',
      saveSlot: 'Enregistrer créneaux',
      createTemplate: 'Créer template',
      notifications: 'Notifications auto',
      weekly: 'Hebdomadaire',
      monthly: 'Mensuel',
      quarterly: 'Trimestriel',
      yearly: 'Annuel',
      monday: 'Lundi',
      tuesday: 'Mardi',
      wednesday: 'Mercredi',
      thursday: 'Jeudi',
      friday: 'Vendredi',
      saturday: 'Samedi',
      sunday: 'Dimanche',
      precision5min: 'Précision 5 minutes',
      automaticValidity: 'Calcul automatique dates',
      conflictResolution: 'Résolution conflits',
      templateReuse: 'Templates réutilisables',
      selectClass: 'Sélectionner une classe',
      selectSubject: 'Sélectionner une matière',
      selectTeacher: 'Sélectionner un enseignant',
      manualTime: 'Saisie manuelle des horaires'
    },
    en: {
      title: 'New Time Slot',
      subtitle: 'Import existing classes and enter times manually',
      dayOfWeek: 'Day of week',
      startTime: 'Start time',
      endTime: 'End time',
      subject: 'Subject',
      teacher: 'Teacher',
      class: 'Class',
      classroom: 'Classroom',
      validityPeriod: 'Validity period',
      africanFeatures: 'African Features',
      climateBreak: 'Climate break (12pm-2pm)',
      includeSaturday: 'Include Saturday',
      schoolYear: 'School year Oct-Jul',
      bulkOperations: 'Bulk operations',
      selectMultiple: 'Multiple selection',
      copyTemplate: 'Copy template',
      applyToClasses: 'Apply to classes',
      conflictDetection: 'Conflict detection',
      saveSlot: 'Save slot',
      createTemplate: 'Create template',
      notifications: 'Auto notifications',
      weekly: 'Weekly',
      monthly: 'Monthly',
      quarterly: 'Quarterly',
      yearly: 'Yearly',
      monday: 'Monday',
      tuesday: 'Tuesday',
      wednesday: 'Wednesday',
      thursday: 'Thursday',
      friday: 'Friday',
      saturday: 'Saturday',
      sunday: 'Sunday',
      precision5min: '5-minute precision',
      automaticValidity: 'Automatic date calculation',
      conflictResolution: 'Conflict resolution',
      templateReuse: 'Reusable templates',
      selectClass: 'Select a class',
      selectSubject: 'Select a subject',
      selectTeacher: 'Select a teacher',
      manualTime: 'Manual time entry'
    }
  };

  const t = text[language as keyof typeof text];

  const days = [
    { value: 1, label: t.monday },
    { value: 2, label: t.tuesday },
    { value: 3, label: t.wednesday },
    { value: 4, label: t.thursday },
    { value: 5, label: t.friday },
    { value: 6, label: t.saturday },
    { value: 7, label: t.sunday }
  ];

  const validityOptions = [
    { value: 'weekly', label: t.weekly, icon: Calendar },
    { value: 'monthly', label: t.monthly, icon: Calendar },
    { value: 'quarterly', label: t.quarterly, icon: Calendar },
    { value: 'yearly', label: t.yearly, icon: Calendar }
  ];

  // Handle saving of time slot
  const handleSaveSlot = async () => {
    if (!currentSlot.classId || !currentSlot.subjectId || !currentSlot.teacherId) {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' ? 'Veuillez sélectionner une classe, matière et enseignant' : 'Please select class, subject and teacher',
        variant: 'destructive'
      });
      return;
    }

    try {
      const response = await fetch('/api/timetables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          className: classesData.find((c: any) => c.id === currentSlot.classId)?.name || '',
          day: days.find(d => d.value === currentSlot.dayOfWeek)?.label || '',
          timeSlot: `${currentSlot.startTime} - ${currentSlot.endTime}`,
          subject: subjects.find(s => s.id === currentSlot.subjectId)?.name || '',
          teacher: teachersData.find((t: any) => t.id === currentSlot.teacherId)?.name || '',
          room: currentSlot.classroom
        })
      });

      if (response.ok) {
        toast({
          title: language === 'fr' ? 'Succès' : 'Success',
          description: language === 'fr' ? 'Créneau créé avec succès' : 'Time slot created successfully'
        });
        
        // Reset form
        setCurrentSlot({
          dayOfWeek: 1,
          startTime: '08:00',
          endTime: '09:00',
          subjectId: 0,
          teacherId: 0,
          classId: 0,
          classroom: '',
          validityPeriod: 'weekly',
          isClimateBreak: false,
          isAfricanSchedule: true
        });

        // Call callback
        if (onSlotCreated) {
          onSlotCreated(currentSlot);
        }
      }
    } catch (error) {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' ? 'Erreur lors de la création' : 'Error creating time slot',
        variant: 'destructive'
      });
    }
  };

  const handleSlotCreate = () => {
    const newSlot: TimetableSlot = {
      ...currentSlot,
      id: Date.now(), // Temporary ID
      validityPeriod,
      isAfricanSchedule: true,
      isClimateBreak: isClimateBreakTime(currentSlot.startTime, currentSlot.endTime)
    };

    setSelectedSlots([...selectedSlots, newSlot]);
    onSlotCreated?.(newSlot);
  };

  const isClimateBreakTime = (start: string, end: string) => {
    const startHour = parseInt(start.split(':')[0]);
    const endHour = parseInt(end.split(':')[0]);
    return (startHour >= 12 && startHour < 14) || (endHour > 12 && endHour <= 14);
  };

  const handleBulkOperation = (operation: string) => {
    onBulkOperation?.(operation, selectedSlots);
  };

  return (
    <div className="space-y-6">
      {/* Header avec fonctionnalités africaines */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-600 rounded-lg flex items-center justify-center">
            <Clock className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{t.title || ''}</h2>
            <p className="text-gray-600">{t.subtitle}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
            <Globe className="w-3 h-3" />
            {t.africanFeatures}
          </div>
          <div className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {t.precision5min}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulaire de création de créneaux */}
        <div className="lg:col-span-2">
          <ModernCard>
            <CardHeader>
              <h3 className="text-xl font-bold text-gray-800 flex items-center">
                <Plus className="w-5 h-5 mr-2 text-green-600" />
                Configuration du créneau
              </h3>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Sélection jour et horaires */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.dayOfWeek}
                  </label>
                  <select 
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={currentSlot.dayOfWeek}
                    onChange={(e) => setCurrentSlot({...currentSlot, dayOfWeek: parseInt(e?.target?.value)})}
                  >
                    {(Array.isArray(days) ? days : []).map(day => (
                      <option key={day.value} value={day.value}>{day.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.startTime}
                  </label>
                  <select 
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={currentSlot.startTime}
                    onChange={(e) => setCurrentSlot({...currentSlot, startTime: e?.target?.value})}
                  >
                    {(Array.isArray(timeSlots) ? timeSlots : []).map(time => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.endTime}
                  </label>
                  <select 
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={currentSlot.endTime}
                    onChange={(e) => setCurrentSlot({...currentSlot, endTime: e?.target?.value})}
                  >
                    {(Array.isArray(timeSlots) ? timeSlots : []).map(time => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Sélection classe, matière, enseignant */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <School className="w-4 h-4 mr-2 text-blue-600" />
                    {t.class}
                  </label>
                  <select 
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={currentSlot.classId}
                    onChange={(e) => setCurrentSlot({...currentSlot, classId: parseInt(e?.target?.value)})}
                  >
                    <option value={0}>{t.selectClass}</option>
                    {(Array.isArray(classesData) ? classesData : []).map((classItem: any) => (
                      <option key={classItem.id} value={classItem.id}>
                        {classItem.name || ''} ({classItem.level})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <BookOpen className="w-4 h-4 mr-2 text-green-600" />
                    {t.subject}
                  </label>
                  <select 
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={currentSlot.subjectId}
                    onChange={(e) => setCurrentSlot({...currentSlot, subjectId: parseInt(e?.target?.value)})}
                  >
                    <option value={0}>{t.selectSubject}</option>
                    {(Array.isArray(subjects) ? subjects : []).map((subject) => (
                      <option key={subject.id} value={subject.id}>
                        {language === 'fr' ? subject.name : subject.nameEn}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <UserCheck className="w-4 h-4 mr-2 text-purple-600" />
                    {t.teacher}
                  </label>
                  <select 
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={currentSlot.teacherId}
                    onChange={(e) => setCurrentSlot({...currentSlot, teacherId: parseInt(e?.target?.value)})}
                  >
                    <option value={0}>{t.selectTeacher}</option>
                    {(Array.isArray(teachersData) ? teachersData : []).map((teacher: any) => (
                      <option key={teacher.id} value={teacher.id}>
                        {teacher.name || ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Salle de classe */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.classroom}
                </label>
                <Input
                  type="text"
                  value={currentSlot.classroom}
                  onChange={(e) => setCurrentSlot({...currentSlot, classroom: e?.target?.value})}
                  placeholder="Salle 101, Laboratoire, etc."
                  className="w-full"
                />
              </div>

              {/* Bouton d'enregistrement */}
              <div className="flex justify-end">
                <Button 
                  onClick={handleSaveSlot}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {t.saveSlot}
                </Button>
              </div>
            </CardContent>
          </ModernCard>
        </div>

        {/* Panneau de résumé */}
        <div className="space-y-4">
          <ModernCard>
            <CardHeader>
              <h3 className="text-lg font-bold text-gray-800">
                {language === 'fr' ? 'Résumé' : 'Summary'}
              </h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    {language === 'fr' ? 'Classes disponibles' : 'Available classes'}
                  </span>
                  <span className="font-semibold text-blue-600">
                    {(Array.isArray(classesData) ? classesData.length : 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    {language === 'fr' ? 'Enseignants' : 'Teachers'}
                  </span>
                  <span className="font-semibold text-green-600">
                    {(Array.isArray(teachersData) ? teachersData.length : 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    {language === 'fr' ? 'Matières' : 'Subjects'}
                  </span>
                  <span className="font-semibold text-purple-600">
                    {(Array.isArray(subjects) ? subjects.length : 0)}
                  </span>
                </div>
              </div>
            </CardContent>
          </ModernCard>

          <ModernCard>
            <CardHeader>
              <h3 className="text-lg font-bold text-gray-800">
                {language === 'fr' ? 'Configuration actuelle' : 'Current configuration'}
              </h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div><strong>Jour:</strong> {days.find(d => d.value === currentSlot.dayOfWeek)?.label}</div>
                <div><strong>Horaire:</strong> {currentSlot.startTime} - {currentSlot.endTime}</div>
                {currentSlot.classId > 0 && (
                  <div><strong>Classe:</strong> {classesData.find((c: any) => c.id === currentSlot.classId)?.name}</div>
                )}
                {currentSlot.subjectId > 0 && (
                  <div><strong>Matière:</strong> {subjects.find(s => s.id === currentSlot.subjectId)?.name}</div>
                )}
                {currentSlot.teacherId > 0 && (
                  <div><strong>Enseignant:</strong> {teachersData.find((t: any) => t.id === currentSlot.teacherId)?.name}</div>
                )}
              </div>
            </CardContent>
          </ModernCard>
        </div>
      </div>
    </div>
  );
}