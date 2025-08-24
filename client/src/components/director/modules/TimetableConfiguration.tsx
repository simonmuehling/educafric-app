import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useStableCallback } from '@/hooks/useStableCallback';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, Calendar, Users, School, Plus, Upload, Edit3, Trash2, Save, TrendingUp, FileText, RefreshCw } from 'lucide-react';
import MobileActionsOverlay from '@/components/mobile/MobileActionsOverlay';
import { useToast } from '@/hooks/use-toast';
import { TimetableCreation } from '@/components/timetable/TimetableCreation';

interface TimetableEntry {
  id: number;
  className: string;
  day: string;
  timeSlot: string;
  subject: string;
  teacher: string;
  room: string;
}

const TimetableConfiguration: React.FC = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [timetables, setTimetables] = useState<TimetableEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TimetableEntry | null>(null);
  const [formData, setFormData] = useState({
    className: '',
    day: '',
    timeSlot: '',
    subject: '',
    teacher: '',
    room: ''
  });

  const days = [
    { value: 'Lundi', label: language === 'fr' ? 'Lundi' : 'Monday' },
    { value: 'Mardi', label: language === 'fr' ? 'Mardi' : 'Tuesday' },
    { value: 'Mercredi', label: language === 'fr' ? 'Mercredi' : 'Wednesday' },
    { value: 'Jeudi', label: language === 'fr' ? 'Jeudi' : 'Thursday' },
    { value: 'Vendredi', label: language === 'fr' ? 'Vendredi' : 'Friday' },
    { value: 'Samedi', label: language === 'fr' ? 'Samedi' : 'Saturday' }
  ];

  const timeSlots = [
    '07:30 - 08:20', '08:20 - 09:10', '09:10 - 10:00', '10:20 - 11:10',
    '11:10 - 12:00', '12:00 - 12:50', '14:00 - 14:50', '14:50 - 15:40', '15:40 - 16:30'
  ];

  // Load timetables
  useEffect(() => {
    fetchTimetables();
  }, []);

  const fetchTimetables = async () => {
    try {
      const response = await fetch('/api/sandbox/timetable/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ class: '6ème A' })
      });
      if (response.ok) {
        const data = await response.json();
        // Convert sandbox format to table format
        const tableData: any[] = [];
        if (data.schedule) {
          Object.entries(data.schedule).forEach(([day, slots]: [string, any]) => {
            if (slots && Array.isArray(slots)) {
              slots.forEach((slot: any, index: number) => {
                tableData.push({
                  id: `${day}-${index}`,
                  className: data.class,
                  day: day,
                  timeSlot: slot.time,
                  subject: slot.subject,
                  teacher: slot.teacher,
                  room: slot.room
                });
              });
            }
          });
        }
        setTimetables(tableData);
      }
    } catch (error) {
      console.error('Error fetching timetables:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = useStableCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.className || !formData.day || !formData.timeSlot || !formData.subject || !formData.teacher || !formData.room) {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' ? 'Tous les champs sont requis' : 'All fields are required',
        variant: 'destructive'
      });
      return;
    }

    try {
      const method = editingEntry ? 'PATCH' : 'POST';
      const url = editingEntry ? `/api/timetables/${editingEntry.id}` : '/api/timetables';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast({
          title: language === 'fr' ? 'Succès' : 'Success',
          description: editingEntry 
            ? (language === 'fr' ? 'Créneaux modifié avec succès' : 'Slot updated successfully')
            : (language === 'fr' ? 'Créneaux créé avec succès' : 'Slot created successfully')
        });
        
        fetchTimetables();
        resetForm();
      } else {
        throw new Error('Failed to save timetable entry');
      }
    } catch (error) {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' ? 'Erreur lors de la sauvegarde' : 'Error saving timetable entry',
        variant: 'destructive'
      });
    }
  });

  const handleEdit = (entry: TimetableEntry) => {
    setEditingEntry(entry);
    setFormData({
      className: entry.className,
      day: entry.day,
      timeSlot: entry.timeSlot,
      subject: entry.subject,
      teacher: entry.teacher,
      room: entry.room
    });
    setShowCreateForm(true);
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/timetables/${id}`, { method: 'DELETE' });
      if (response.ok) {
        toast({
          title: language === 'fr' ? 'Succès' : 'Success',
          description: language === 'fr' ? 'Créneaux supprimé' : 'Slot deleted successfully'
        });
        fetchTimetables();
      }
    } catch (error) {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' ? 'Erreur lors de la suppression' : 'Error deleting slot',
        variant: 'destructive'
      });
    }
  };

  const resetForm = () => {
    setFormData({ className: '', day: '', timeSlot: '', subject: '', teacher: '', room: '' });
    setEditingEntry(null);
    setShowCreateForm(false);
  };

  // Export PDF Function
  const handleExportPDF = () => {
    try {
      // Create PDF content
      let pdfContent = `EMPLOI DU TEMPS - ÉCOLE\n\n`;
      pdfContent += `Généré le: ${new Date().toLocaleDateString('fr-FR')}\n`;
      pdfContent += `Total créneaux: ${Array.isArray(timetables) ? timetables.length : 0}\n\n`;
      
      // Group by class and day
      const groupedTimetables = (Array.isArray(timetables) ? timetables : []).reduce((acc: any, item: any) => {
        if (!acc[item.className]) acc[item.className] = {};
        if (!acc[item.className][item.day]) acc[item.className][item.day] = [];
        acc[item.className][item.day].push(item);
        return acc;
      }, {});
      
      Object.entries(groupedTimetables).forEach(([className, days]: [string, any]) => {
        pdfContent += `=== ${className} ===\n`;
        Object.entries(days).forEach(([day, slots]: [string, any]) => {
          pdfContent += `${day.charAt(0).toUpperCase() + day.slice(1)}:\n`;
          slots.forEach((slot: any) => {
            pdfContent += `  ${slot.timeSlot} - ${slot.subject} (${slot.teacher}) - ${slot.room}\n`;
          });
        });
        pdfContent += `\n`;
      });
      
      // Create downloadable file
      const blob = new Blob([pdfContent], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `emploi-du-temps-${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: language === 'fr' ? 'Export réussi' : 'Export successful',
        description: language === 'fr' ? 'Emploi du temps exporté avec succès' : 'Timetable exported successfully'
      });
    } catch (error) {
      toast({
        title: language === 'fr' ? 'Erreur d\'export' : 'Export error',
        description: language === 'fr' ? 'Erreur lors de l\'export PDF' : 'Error during PDF export',
        variant: 'destructive'
      });
    }
  };

  // Import CSV Function
  const handleImportCSV = () => {
    try {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.csv,.txt';
      input.onchange = (e: any) => {
        const file = e.target?.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            try {
              const content = event.target?.result as string;
              const lines = content.split('\n').filter(line => line.trim());
              let importedCount = 0;
              
              lines.forEach((line, index) => {
                if (index === 0) return; // Skip header
                const [className, day, timeSlot, subject, teacher, room] = line.split(',');
                if (className && day && timeSlot && subject && teacher && room) {
                  // Add to timetables array (in real app, would save to API)
                  const newEntry = {
                    id: `import-${Date.now()}-${importedCount}`,
                    className: className.trim(),
                    day: day.trim().toLowerCase(),
                    timeSlot: timeSlot.trim(),
                    subject: subject.trim(),
                    teacher: teacher.trim(),
                    room: room.trim()
                  };
                  setTimetables(prev => [...(Array.isArray(prev) ? prev : []), newEntry]);
                  importedCount++;
                }
              });
              
              toast({
                title: language === 'fr' ? 'Import réussi' : 'Import successful',
                description: language === 'fr' ? 
                  `${importedCount} créneaux importés avec succès` : 
                  `${importedCount} slots imported successfully`
              });
            } catch (error) {
              toast({
                title: language === 'fr' ? 'Erreur d\'import' : 'Import error',
                description: language === 'fr' ? 'Format CSV invalide' : 'Invalid CSV format',
                variant: 'destructive'
              });
            }
          };
          reader.readAsText(file);
        }
      };
      input.click();
    } catch (error) {
      toast({
        title: language === 'fr' ? 'Erreur d\'import' : 'Import error',
        description: language === 'fr' ? 'Erreur lors de l\'import CSV' : 'Error during CSV import',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full">
                <Clock className="w-12 h-12 text-white" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {language === 'fr' ? 'Configuration Emploi du Temps' : 'Timetable Configuration'}
            </CardTitle>
            <p className="text-gray-600 mt-2">
              {language === 'fr' ? 
                'Gérez les emplois du temps de votre établissement' : 
                'Manage your institution timetables'}
            </p>
          </CardHeader>
        </Card>

        {/* Quick Actions - Mobile Optimized */}
        <Card className="bg-white/80 backdrop-blur-md shadow-xl border border-white/30 p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            {language === 'fr' ? 'Actions Rapides' : 'Quick Actions'}
          </h3>
          <MobileActionsOverlay
            title={language === 'fr' ? 'Actions Emploi du Temps' : 'Timetable Actions'}
            maxVisibleButtons={3}
            actions={[
              {
                id: 'add-timeslot',
                label: language === 'fr' ? 'Ajouter Créneaux' : 'Add Time Slot',
                icon: <Plus className="w-5 h-5" />,
                onClick: () => setShowCreateForm(true),
                color: 'bg-blue-600 hover:bg-blue-700'
              },
              {
                id: 'view-all',
                label: language === 'fr' ? 'Voir Tout' : 'View All',
                icon: <Calendar className="w-5 h-5" />,
                onClick: () => setShowCreateForm(false),
                color: 'bg-green-600 hover:bg-green-700'
              },
              {
                id: 'export-timetable',
                label: language === 'fr' ? 'Exporter PDF' : 'Export PDF',
                icon: <FileText className="w-5 h-5" />,
                onClick: handleExportPDF,
                color: 'bg-purple-600 hover:bg-purple-700'
              },
              {
                id: 'bulk-import',
                label: language === 'fr' ? 'Import CSV' : 'Bulk Import',
                icon: <Upload className="w-5 h-5" />,
                onClick: handleImportCSV,
                color: 'bg-orange-600 hover:bg-orange-700'
              },
              {
                id: 'refresh-data',
                label: language === 'fr' ? 'Actualiser' : 'Refresh',
                icon: <RefreshCw className="w-5 h-5" />,
                onClick: () => fetchTimetables(),
                color: 'bg-teal-600 hover:bg-teal-700'
              }
            ]}
          />
        </Card>

        {/* Advanced Timetable Creation Form */}
        {showCreateForm && (
          <TimetableCreation 
            onSlotCreated={(slot) => {
              console.log('[TIMETABLE_CONFIG] Nouveau créneau créé:', slot);
              fetchTimetables(); // Refresh the list
              setShowCreateForm(false); // Close the form
            }}
            onBulkOperation={(operation, slots) => {
              console.log('[TIMETABLE_CONFIG] Opération en lot:', operation, slots);
            }}
          />
        )}

        {/* Vue Grille de l'Emploi du Temps - Style École Moderne */}
        <Card className="overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
            <CardTitle className="flex items-center text-xl">
              <Calendar className="w-6 h-6 mr-2" />
              {language === 'fr' ? 'Emploi du Temps École - Vue Hebdomadaire' : 'School Timetable - Weekly View'}
            </CardTitle>
            <p className="text-blue-100">
              {language === 'fr' ? 'Gestion complète avec professeurs africains et matières modernes' : 'Complete management with African teachers and modern subjects'}
            </p>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">{language === 'fr' ? 'Chargement des données africaines...' : 'Loading African data...'}</p>
              </div>
            ) : (
              <div className="grid grid-cols-7 divide-x divide-gray-200">
                {/* Header avec jours */}
                <div className="bg-gray-50 p-3 font-semibold text-center text-gray-700">
                  {language === 'fr' ? 'Horaires' : 'Time'}
                </div>
                {['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'].map((day, index) => (
                  <div key={day} className="bg-gradient-to-br from-blue-50 to-purple-50 p-3 font-semibold text-center text-blue-800">
                    {language === 'fr' ? day : ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][index]}
                  </div>
                ))}
                
                {/* Créneaux horaires avec cours */}
                {timeSlots.map((timeSlot, timeIndex) => (
                  <React.Fragment key={timeSlot}>
                    {/* Colonne horaire */}
                    <div className="bg-gray-50 p-2 text-sm font-medium text-center border-r text-gray-600">
                      {timeSlot}
                    </div>
                    
                    {/* Colonnes des jours */}
                    {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'].map((dayKey, dayIndex) => {
                      // Trouver les cours pour ce jour et cette heure
                      const coursesForSlot = (Array.isArray(timetables) ? timetables : []).filter((entry: any) => 
                        entry.day === dayKey && entry.timeSlot === timeSlot
                      );
                      
                      return (
                        <div key={`${dayKey}-${timeSlot}`} className="min-h-[80px] p-1 border-b">
                          {coursesForSlot.length > 0 ? (
                            <div className="space-y-1">
                              {coursesForSlot.map((course: any) => (
                                <div 
                                  key={course.id}
                                  className={`p-2 rounded-lg text-xs shadow-sm border-l-4 cursor-pointer hover:shadow-md transition-shadow ${
                                    course.subject === 'Mathématiques' ? 'bg-blue-100 border-blue-500 text-blue-800' :
                                    course.subject === 'Français' ? 'bg-green-100 border-green-500 text-green-800' :
                                    course.subject === 'IA & Numérique' ? 'bg-purple-100 border-purple-500 text-purple-800' :
                                    course.subject === 'Robotique' ? 'bg-orange-100 border-orange-500 text-orange-800' :
                                    course.subject === 'Sciences' ? 'bg-teal-100 border-teal-500 text-teal-800' :
                                    'bg-gray-100 border-gray-500 text-gray-800'
                                  }`}
                                  onClick={() => handleEdit(course)}
                                >
                                  <div className="font-semibold truncate">{course.subject}</div>
                                  <div className="text-xs opacity-75">{course.className}</div>
                                  <div className="text-xs opacity-75 truncate">{course.teacher}</div>
                                  <div className="text-xs opacity-60">{course.room}</div>
                                  <div className="flex gap-1 mt-1">
                                    <Button 
                                      size="sm" 
                                      variant="ghost" 
                                      className="h-4 w-4 p-0"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleEdit(course);
                                      }}
                                    >
                                      <Edit3 className="w-3 h-3" />
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      variant="ghost" 
                                      className="h-4 w-4 p-0 text-red-500"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDelete(course.id);
                                      }}
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div 
                              className="h-full min-h-[70px] border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
                              onClick={() => {
                                setFormData({
                                  ...formData,
                                  day: dayKey,
                                  timeSlot: timeSlot
                                });
                                setShowCreateForm(true);
                              }}
                            >
                              <Plus className="w-4 h-4 text-gray-400" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </React.Fragment>
                ))}
              </div>
            )}
            
            {/* Statistiques de l'école */}
            <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-t">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{Array.isArray(timetables) ? timetables.length : 0}</div>
                  <div className="text-sm text-gray-600">{language === 'fr' ? 'Créneaux Total' : 'Total Slots'}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {Array.isArray(timetables) ? new Set(timetables.map((t: any) => t.teacher)).size : 0}
                  </div>
                  <div className="text-sm text-gray-600">{language === 'fr' ? 'Professeurs' : 'Teachers'}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {Array.isArray(timetables) ? new Set(timetables.map((t: any) => t.subject)).size : 0}
                  </div>
                  <div className="text-sm text-gray-600">{language === 'fr' ? 'Matières' : 'Subjects'}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {Array.isArray(timetables) ? new Set(timetables.map((t: any) => t.className)).size : 0}
                  </div>
                  <div className="text-sm text-gray-600">{language === 'fr' ? 'Classes' : 'Classes'}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TimetableConfiguration;