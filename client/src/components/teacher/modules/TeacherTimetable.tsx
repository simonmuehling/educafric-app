import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  Calendar, Clock, Users, Plus, Edit, Eye, Save, 
  Download, Upload, Filter, Search, CheckSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ModernCard } from '@/components/ui/ModernCard';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

const TeacherTimetable = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [selectedWeek, setSelectedWeek] = useState('current');
  const [selectedClass, setSelectedClass] = useState('all');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentSlot, setCurrentSlot] = useState<any>(null);

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
      monday: 'Lundi',
      tuesday: 'Mardi',
      wednesday: 'Mercredi',
      thursday: 'Jeudi',
      friday: 'Vendredi',
      saturday: 'Samedi',
      totalHours: 'Total heures',
      freeSlots: 'Créneaux libres',
      conflicts: 'Conflits'
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
      monday: 'Monday',
      tuesday: 'Tuesday',
      wednesday: 'Wednesday',
      thursday: 'Thursday',
      friday: 'Friday',
      saturday: 'Saturday',
      totalHours: 'Total hours',
      freeSlots: 'Free slots',
      conflicts: 'Conflicts'
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

  const timeSlots = [
    '08:00-09:00', '09:00-10:00', '10:00-11:00', '11:00-12:00',
    '12:00-13:00', '13:00-14:00', '14:00-15:00', '15:00-16:00',
    '16:00-17:00', '17:00-18:00'
  ];

  const classes = [
    { id: '6eme-a', name: '6ème A', students: 32 },
    { id: '6eme-b', name: '6ème B', students: 28 },
    { id: '5eme-a', name: '5ème A', students: 30 },
    { id: '4eme-a', name: '4ème A', students: 27 }
  ];

  const schedule = {
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
    setCurrentSlot({ ...slot, day });
    setIsEditDialogOpen(true);
  };

  const handleExportPdf = () => {
    toast({
      title: language === 'fr' ? 'Export en cours' : 'Exporting',
      description: language === 'fr' ? 'Génération du PDF de l\'emploi du temps...' : 'Generating timetable PDF...'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{t.title || ''}</h2>
          <p className="text-gray-600">{t.subtitle}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportPdf}>
            <Download className="w-4 h-4 mr-2" />
            {t.exportPdf}
          </Button>
          <Button onClick={() => setIsEditDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            {t.addSlot}
          </Button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <ModernCard className="p-4 text-center activity-card-blue">
          <div className="text-2xl font-bold text-gray-800">{getTotalHours()}</div>
          <div className="text-sm text-gray-600">{t.totalHours}</div>
        </ModernCard>
        <ModernCard className="p-4 text-center activity-card-green">
          <div className="text-2xl font-bold text-gray-800">4</div>
          <div className="text-sm text-gray-600">Classes</div>
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
          <label className="block text-sm font-medium mb-2">Semaine</label>
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
          <label className="block text-sm font-medium mb-2">Classe</label>
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
                        Aucun cours
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
                    <th className="w-24 p-3 text-left font-medium text-gray-700">Horaire</th>
                    {(Array.isArray(daysOfWeek) ? daysOfWeek : []).map(day => (
                      <th key={day.id} className="p-3 text-center font-medium text-gray-700">
                        {day.name || ''}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(Array.isArray(timeSlots) ? timeSlots : []).map(timeSlot => (
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
        <h3 className="font-medium mb-3">Légende des classes</h3>
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

      {/* Dialog Modifier Créneaux */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md bg-white">
          <DialogHeader>
            <DialogTitle>
              {currentSlot ? t.editSlot : t.addSlot}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">{t.subject}</label>
              <Input defaultValue={currentSlot?.subject || ''} placeholder="Mathématiques" />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">{t.class}</label>
              <select className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                {(Array.isArray(classes) ? classes : []).map(cls => (
                  <option key={cls.id} value={cls.id}>{cls.name || ''}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">{t.room}</label>
              <Input defaultValue={currentSlot?.room || ''} placeholder="Salle 12" />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">{t.time}</label>
              <select className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                {(Array.isArray(timeSlots) ? timeSlots : []).map(slot => (
                  <option key={slot} value={slot}>{slot}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                {t.cancel}
              </Button>
              <Button onClick={() => {
                toast({
                  title: language === 'fr' ? 'Créneaux modifié' : 'Slot updated',
                  description: language === 'fr' ? 'Les modifications ont été sauvegardées' : 'Changes have been saved'
                });
                setIsEditDialogOpen(false);
              }}>
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