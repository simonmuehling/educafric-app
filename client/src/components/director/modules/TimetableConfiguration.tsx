import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useStableCallback } from '@/hooks/useStableCallback';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Clock, Calendar, Users, School, Plus, Upload, Edit3, Trash2, Save, TrendingUp, FileText, RefreshCw, BookOpen } from 'lucide-react';
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
  const { user } = useAuth();
  const { toast } = useToast();
  const [timetables, setTimetables] = useState<TimetableEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TimetableEntry | null>(null);
  const [formData, setFormData] = useState({
    className: '',
    day: '',
    timeSlot: '',
    startTime: '',
    endTime: '',
    subject: '',
    teacher: '',
    room: ''
  });

  // Fetch classes data for dropdown
  const { data: classesResponse = {}, isLoading: isLoadingClasses } = useQuery({
    queryKey: ['/api/director/classes'],
    enabled: !!user,
    queryFn: async () => {
      console.log('[TIMETABLE_CONFIG] 🔍 Fetching classes for timetable configuration...');
      const response = await fetch('/api/director/classes', {
        credentials: 'include'
      });
      if (!response.ok) {
        console.error('[TIMETABLE_CONFIG] ❌ Failed to fetch classes:', response.status);
        throw new Error('Failed to fetch classes');
      }
      const data = await response.json();
      console.log('[TIMETABLE_CONFIG] ✅ Classes fetched:', data?.classes?.length || 0, 'classes');
      return data;
    },
    retry: 2,
    retryDelay: 1000
  });

  // Fetch teachers data for dropdown
  const { data: teachersResponse = {}, isLoading: isLoadingTeachers } = useQuery({
    queryKey: ['/api/director/teachers'],
    enabled: !!user,
    queryFn: async () => {
      console.log('[TIMETABLE_CONFIG] 🔍 Fetching teachers for timetable configuration...');
      const response = await fetch('/api/director/teachers', {
        credentials: 'include'
      });
      if (!response.ok) {
        console.error('[TIMETABLE_CONFIG] ❌ Failed to fetch teachers:', response.status);
        throw new Error('Failed to fetch teachers');
      }
      const data = await response.json();
      console.log('[TIMETABLE_CONFIG] ✅ Teachers fetched:', data?.teachers?.length || 0, 'teachers');
      return data;
    },
    retry: 2,
    retryDelay: 1000
  });

  // Fetch rooms data for dropdown
  const { data: roomsResponse = {}, isLoading: isLoadingRooms } = useQuery({
    queryKey: ['/api/director/rooms'],
    enabled: !!user,
    queryFn: async () => {
      console.log('[TIMETABLE_CONFIG] 🔍 Fetching rooms for timetable configuration...');
      const response = await fetch('/api/director/rooms', {
        credentials: 'include'
      });
      if (!response.ok) {
        console.error('[TIMETABLE_CONFIG] ❌ Failed to fetch rooms:', response.status);
        throw new Error('Failed to fetch rooms');
      }
      const data = await response.json();
      console.log('[TIMETABLE_CONFIG] ✅ Rooms fetched:', data?.rooms?.length || 0, 'rooms');
      return data;
    },
    retry: 2,
    retryDelay: 1000
  });

  // Fetch existing timetables - UNIFIED API SOURCE
  const { data: timetablesResponse = {}, isLoading: isLoadingTimetables, refetch: refetchTimetables } = useQuery({
    queryKey: ['/api/director/timetables'],
    enabled: !!user,
    queryFn: async () => {
      console.log('[TIMETABLE_CONFIG] 🔍 Fetching existing timetables from unified API...');
      const response = await fetch('/api/director/timetables', {
        credentials: 'include'
      });
      if (!response.ok) {
        console.log('[TIMETABLE_CONFIG] ⚠️ No timetables API, using sandbox fallback');
        return { timetables: [] };
      }
      const data = await response.json();
      console.log('[TIMETABLE_CONFIG] ✅ Timetables fetched:', data?.timetables?.length || 0, 'timetables');
      return data;
    },
    retry: 1,
    retryDelay: 500
  });

  const availableClasses = classesResponse?.classes || [];
  const availableTeachers = teachersResponse?.teachers || [];
  const availableRooms = roomsResponse?.rooms || [];
  const existingTimetables = timetablesResponse?.timetables || [];

  // UNIFIED DATA SOURCE: Use API data as primary source
  const displayTimetables = existingTimetables.length > 0 ? existingTimetables : timetables;
  
  // Reactive room occupancy based on selected time/day
  const getAvailableRoomsWithOccupancy = () => {
    if (!formData.day || !formData.startTime || !formData.endTime) {
      return availableRooms;
    }
    
    const timeSlotKey = `${formData.startTime}-${formData.endTime}`;
    return availableRooms.map((room: any) => {
      const isOccupiedNow = displayTimetables.some((timetable: any) => 
        timetable.day === formData.day && 
        timetable.room === room.name &&
        (timetable.timeSlot === timeSlotKey || 
         (timetable.startTime === formData.startTime && timetable.endTime === formData.endTime))
      );
      return { ...room, isOccupied: isOccupiedNow };
    });
  };

  // Function to get subjects from selected class
  const getAvailableSubjects = () => {
    if (!formData.className) {
      return []; // No subjects if no class selected
    }
    
    const selectedClass = availableClasses.find((c: any) => c.name === formData.className);
    if (selectedClass?.subjects) {
      return selectedClass.subjects.map((subject: any) => subject.name);
    }
    
    // Fallback subjects if no subjects found in class
    return ['Mathématiques', 'Français', 'Sciences', 'Histoire', 'Anglais'];
  };

  // Function to get teachers for selected class
  const getAvailableTeachersForClass = () => {
    if (!formData.className) {
      return availableTeachers; // All teachers if no class selected
    }
    
    // Filter teachers who teach the selected class
    return availableTeachers.filter((teacher: any) => 
      teacher.classes && teacher.classes.includes(formData.className)
    );
  };

  const days = [
    { value: 'Lundi', label: language === 'fr' ? 'Lundi' : 'Monday' },
    { value: 'Mardi', label: language === 'fr' ? 'Mardi' : 'Tuesday' },
    { value: 'Mercredi', label: language === 'fr' ? 'Mercredi' : 'Wednesday' },
    { value: 'Jeudi', label: language === 'fr' ? 'Jeudi' : 'Thursday' },
    { value: 'Vendredi', label: language === 'fr' ? 'Vendredi' : 'Friday' },
    { value: 'Samedi', label: language === 'fr' ? 'Samedi' : 'Saturday' }
  ];

  // Time validation and formatting functions
  const formatTimeSlot = (startTime: string, endTime: string): string => {
    if (!startTime || !endTime) return '';
    return `${startTime} - ${endTime}`;
  };

  const parseTimeSlot = (timeSlot: string): { startTime: string; endTime: string } => {
    if (!timeSlot.includes(' - ')) return { startTime: '', endTime: '' };
    const [startTime, endTime] = timeSlot.split(' - ');
    return { startTime: startTime.trim(), endTime: endTime.trim() };
  };

  const validateTimeFormat = (time: string): boolean => {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(time);
  };

  const validateTimeSlot = (startTime: string, endTime: string): string | null => {
    if (!startTime || !endTime) {
      return language === 'fr' ? 'Veuillez saisir l\'heure de début et de fin' : 'Please enter start and end time';
    }
    
    if (!validateTimeFormat(startTime) || !validateTimeFormat(endTime)) {
      return language === 'fr' ? 'Format d\'heure invalide (HH:MM)' : 'Invalid time format (HH:MM)';
    }
    
    const start = new Date(`2000-01-01 ${startTime}:00`);
    const end = new Date(`2000-01-01 ${endTime}:00`);
    
    if (start >= end) {
      return language === 'fr' ? 'L\'heure de fin doit être après l\'heure de début' : 'End time must be after start time';
    }
    
    return null;
  };

  // Update timeSlot when start or end time changes
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
    
    // Validate required fields
    if (!formData.className || !formData.day || !formData.subject || !formData.teacher || !formData.room) {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' ? 'Tous les champs sont requis' : 'All fields are required',
        variant: 'destructive'
      });
      return;
    }

    // Validate time slot
    const timeValidationError = validateTimeSlot(formData.startTime, formData.endTime);
    if (timeValidationError) {
      toast({
        title: language === 'fr' ? 'Erreur de temps' : 'Time Error',
        description: timeValidationError,
        variant: 'destructive'
      });
      return;
    }

    // Ensure timeSlot is formatted correctly
    const finalFormData = {
      ...formData,
      timeSlot: formatTimeSlot(formData.startTime, formData.endTime)
    };

    try {
      const method = editingEntry ? 'PATCH' : 'POST';
      const url = editingEntry ? `/api/timetables/${editingEntry.id}` : '/api/timetables';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalFormData)
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
    const { startTime, endTime } = parseTimeSlot(entry.timeSlot);
    setFormData({
      className: entry.className,
      day: entry.day,
      timeSlot: entry.timeSlot,
      startTime,
      endTime,
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
    setFormData({ className: '', day: '', timeSlot: '', startTime: '', endTime: '', subject: '', teacher: '', room: '' });
    setEditingEntry(null);
    setShowCreateForm(false);
  };

  // Enhanced Export PDF Function with Filters
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFilters, setExportFilters] = useState({
    selectedClasses: [] as string[],
    selectedTeachers: [] as string[],
    exportAll: true
  });

  const handleExportPDF = () => {
    // Direct export with current data - simplified approach
    performExport(displayTimetables, false);
  };

  const handleExportWithFilters = () => {
    // Show filter modal for advanced export
    setShowExportModal(true);
  };

  const performExport = (dataToExport: any[], withFilters = false) => {
    try {
      // Use unified data source
      const sourceData = displayTimetables.length > 0 ? displayTimetables : dataToExport;
      
      // Filter data based on selected filters
      let filteredData = sourceData;
      if (withFilters && !exportFilters.exportAll) {
        filteredData = sourceData.filter((item: any) => {
          const matchesClass = exportFilters.selectedClasses.length === 0 || exportFilters.selectedClasses.includes(item.className);
          const matchesTeacher = exportFilters.selectedTeachers.length === 0 || exportFilters.selectedTeachers.includes(item.teacher);
          return matchesClass && matchesTeacher;
        });
      }
      
      // Create enhanced TXT content (labeled as PDF but generates TXT for simplicity)
      let pdfContent = `EMPLOI DU TEMPS - ÉCOLE AFRICAINE MODERNE\n`;
      pdfContent += `=============================================\n\n`;
      pdfContent += `Généré le: ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}\n`;
      pdfContent += `Total créneaux: ${filteredData.length}\n`;
      pdfContent += `Source: ${displayTimetables.length > 0 ? 'API Unifiée' : 'Données Locales'}\n`;
      
      if (withFilters && !exportFilters.exportAll) {
        pdfContent += `\nFILTRES APPLIQUÉS:\n`;
        if (exportFilters.selectedClasses.length > 0) {
          pdfContent += `Classes: ${exportFilters.selectedClasses.join(', ')}\n`;
        }
        if (exportFilters.selectedTeachers.length > 0) {
          pdfContent += `Enseignants: ${exportFilters.selectedTeachers.join(', ')}\n`;
        }
      }
      pdfContent += `\n=============================================\n\n`;
      
      // Group by class and day
      const groupedTimetables = filteredData.reduce((acc: any, item: any) => {
        if (!acc[item.className]) acc[item.className] = {};
        if (!acc[item.className][item.day]) acc[item.className][item.day] = [];
        acc[item.className][item.day].push(item);
        return acc;
      }, {});
      
      Object.entries(groupedTimetables).forEach(([className, days]: [string, any]) => {
        pdfContent += `🏫 CLASSE: ${className}\n`;
        pdfContent += `${'='.repeat(className.length + 10)}\n`;
        Object.entries(days).forEach(([day, slots]: [string, any]) => {
          pdfContent += `\n📅 ${day.charAt(0).toUpperCase() + day.slice(1)}:\n`;
          slots.sort((a: any, b: any) => (a.timeSlot || `${a.startTime}-${a.endTime}`)?.localeCompare(b.timeSlot || `${b.startTime}-${b.endTime}`) || 0);
          slots.forEach((slot: any) => {
            const timeDisplay = slot.timeSlot || `${slot.startTime}-${slot.endTime}`;
            pdfContent += `  • ${timeDisplay} | ${slot.subject} | 👨‍🏫 ${slot.teacher} | 🏢 ${slot.room}\n`;
          });
        });
        pdfContent += `\n`;
      });
      
      pdfContent += `\n=============================================\n`;
      pdfContent += `Export généré par EDUCAFRIC - Plateforme éducative africaine\n`;
      pdfContent += `Contact: https://www.educafric.com\n`;
      
      // Create downloadable file
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
      const filterSuffix = (withFilters && !exportFilters.exportAll) ? '-filtered' : '';
      const blob = new Blob([pdfContent], { type: 'text/plain;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `emploi-du-temps-educafric-${timestamp}${filterSuffix}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: language === 'fr' ? '🎉 Export réussi!' : '🎉 Export successful!',
        description: language === 'fr' ? 
          `${filteredData.length} créneaux exportés avec succès (Format TXT)` : 
          `${filteredData.length} slots exported successfully (TXT format)`
      });
    } catch (error) {
      toast({
        title: language === 'fr' ? 'Erreur d\'export' : 'Export error',
        description: language === 'fr' ? 'Erreur lors de l\'export' : 'Error during export',
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
                    id: Date.now() + importedCount,
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
                onClick: () => {
                  setShowCreateForm(false);
                  // UNIFIED: Use API data as primary display source
                  refetchTimetables();
                  toast({
                    title: language === 'fr' ? 'Données actualisées' : 'Data refreshed',
                    description: language === 'fr' ? 
                      `${displayTimetables.length} emplois du temps chargés` : 
                      `${displayTimetables.length} timetables loaded`
                  });
                },
                color: 'bg-green-600 hover:bg-green-700'
              },
              {
                id: 'export-timetable',
                label: language === 'fr' ? 'Export Simple' : 'Simple Export',
                icon: <FileText className="w-5 h-5" />,
                onClick: handleExportPDF,
                color: 'bg-purple-600 hover:bg-purple-700'
              },
              {
                id: 'export-filtered',
                label: language === 'fr' ? 'Export Avancé' : 'Advanced Export',
                icon: <FileText className="w-5 h-5" />,
                onClick: handleExportWithFilters,
                color: 'bg-indigo-600 hover:bg-indigo-700'
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

        {/* Advanced Timetable Creation Form - Enhanced with Real Data */}
        {showCreateForm && (
          <Card className="bg-white/90 backdrop-blur-md shadow-xl border border-white/30">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center">
                <Plus className="w-6 h-6 mr-2" />
                {language === 'fr' ? 'Configuration du Créneau' : 'Timeslot Configuration'}
              </CardTitle>
              <p className="text-blue-100">
                {language === 'fr' ? 'Créer un nouveau créneau avec les données réelles de votre école' : 'Create a new timeslot with real school data'}
              </p>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Class Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <School className="w-4 h-4" />
                    {language === 'fr' ? 'Classe' : 'Class'}
                    {isLoadingClasses && <div className="w-3 h-3 border border-gray-300 border-t-blue-600 rounded-full animate-spin" />}
                  </label>
                  {isLoadingClasses ? (
                    <div className="w-full p-3 border rounded text-center text-sm text-gray-500">
                      {language === 'fr' ? 'Chargement des classes...' : 'Loading classes...'}
                    </div>
                  ) : availableClasses.length === 0 ? (
                    <div className="w-full p-3 border rounded text-center text-sm text-yellow-600 bg-yellow-50">
                      {language === 'fr' ? 
                        '⚠️ Aucune classe disponible - Créez d\'abord des classes dans "Gestion des Classes"' : 
                        '⚠️ No classes available - Create classes first in "Class Management"'}
                    </div>
                  ) : (
                    <Select 
                      value={formData.className} 
                      onValueChange={(value) => setFormData(prev => ({ 
                        ...prev, 
                        className: value,
                        subject: '', // Clear subject when class changes
                        teacher: '' // Clear teacher when class changes
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={language === 'fr' ? 'Choisir une classe' : 'Choose a class'} />
                      </SelectTrigger>
                      <SelectContent>
                        {availableClasses.map((classItem: any) => (
                          <SelectItem key={classItem.id} value={classItem.name}>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{classItem.name}</span>
                              <Badge variant="outline" className="text-xs">
                                {classItem.level}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                {/* Day Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {language === 'fr' ? 'Jour' : 'Day'}
                  </label>
                  <Select value={formData.day} onValueChange={(value) => setFormData(prev => ({ ...prev, day: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder={language === 'fr' ? 'Choisir un jour' : 'Choose a day'} />
                    </SelectTrigger>
                    <SelectContent>
                      {days.map((day) => (
                        <SelectItem key={day.value} value={day.value}>
                          {day.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Custom Time Slot - Start and End Time */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {language === 'fr' ? 'Horaire personnalisé' : 'Custom Time Slot'}
                    <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                      {language === 'fr' ? 'Flexible' : 'Flexible'}
                    </Badge>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Start Time */}
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        {language === 'fr' ? 'Heure de début' : 'Start Time'}
                      </label>
                      <Input
                        type="time"
                        value={formData.startTime}
                        onChange={(e) => updateTimeSlot(e.target.value, undefined)}
                        placeholder="08:00"
                        className="w-full"
                        data-testid="input-start-time"
                      />
                    </div>
                    {/* End Time */}
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        {language === 'fr' ? 'Heure de fin' : 'End Time'}
                      </label>
                      <Input
                        type="time"
                        value={formData.endTime}
                        onChange={(e) => updateTimeSlot(undefined, e.target.value)}
                        placeholder="09:00"
                        className="w-full"
                        data-testid="input-end-time"
                      />
                    </div>
                  </div>
                  {/* Time Preview */}
                  {formData.startTime && formData.endTime && (
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-800">
                          {language === 'fr' ? 'Aperçu:' : 'Preview:'}
                        </span>
                        <span className="text-sm text-blue-600 font-mono bg-white px-2 py-1 rounded border">
                          {formatTimeSlot(formData.startTime, formData.endTime)}
                        </span>
                      </div>
                      {validateTimeSlot(formData.startTime, formData.endTime) && (
                        <div className="mt-2 text-xs text-red-600 flex items-center gap-1">
                          <span>⚠️</span>
                          <span>{validateTimeSlot(formData.startTime, formData.endTime)}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Subject Selection - Based on Class */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    {language === 'fr' ? 'Matière' : 'Subject'}
                    <Badge variant="outline" className="text-xs">
                      {language === 'fr' ? 'Basé sur la classe' : 'Based on class'}
                    </Badge>
                  </label>
                  {!formData.className ? (
                    <div className="w-full p-3 border rounded text-center text-sm text-gray-500">
                      {language === 'fr' ? 
                        '⬆️ Sélectionnez d\'abord une classe pour voir les matières' : 
                        '⬆️ Select a class first to see subjects'}
                    </div>
                  ) : getAvailableSubjects().length === 0 ? (
                    <div className="w-full p-3 border rounded text-center text-sm text-yellow-600 bg-yellow-50">
                      {language === 'fr' ? 
                        '⚠️ Aucune matière configurée pour cette classe' : 
                        '⚠️ No subjects configured for this class'}
                    </div>
                  ) : (
                    <Select value={formData.subject} onValueChange={(value) => setFormData(prev => ({ ...prev, subject: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder={language === 'fr' ? 'Choisir une matière' : 'Choose a subject'} />
                      </SelectTrigger>
                      <SelectContent>
                        {getAvailableSubjects().map((subject) => (
                          <SelectItem key={subject} value={subject}>
                            📚 {subject}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                {/* Teacher Selection - Based on Class */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    {language === 'fr' ? 'Enseignant' : 'Teacher'}
                    {isLoadingTeachers && <div className="w-3 h-3 border border-gray-300 border-t-blue-600 rounded-full animate-spin" />}
                    <Badge variant="outline" className="text-xs">
                      {language === 'fr' ? 'Filtré par classe' : 'Filtered by class'}
                    </Badge>
                  </label>
                  {isLoadingTeachers ? (
                    <div className="w-full p-3 border rounded text-center text-sm text-gray-500">
                      {language === 'fr' ? 'Chargement des enseignants...' : 'Loading teachers...'}
                    </div>
                  ) : getAvailableTeachersForClass().length === 0 ? (
                    <div className="w-full p-3 border rounded text-center text-sm text-yellow-600 bg-yellow-50">
                      {language === 'fr' ? 
                        formData.className 
                          ? `⚠️ Aucun enseignant assigné à la classe "${formData.className}"` 
                          : '⚠️ Aucun enseignant disponible'
                        : 
                        formData.className
                          ? `⚠️ No teachers assigned to class "${formData.className}"`
                          : '⚠️ No teachers available'}
                    </div>
                  ) : (
                    <Select value={formData.teacher} onValueChange={(value) => setFormData(prev => ({ ...prev, teacher: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder={language === 'fr' ? 'Choisir un enseignant' : 'Choose a teacher'} />
                      </SelectTrigger>
                      <SelectContent>
                        {getAvailableTeachersForClass().map((teacher: any) => (
                          <SelectItem key={teacher.id} value={teacher.name}>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">👨‍🏫 {teacher.name}</span>
                              {teacher.teachingSubjects && (
                                <span className="text-xs text-gray-500">
                                  ({teacher.teachingSubjects.slice(0, 2).join(', ')})
                                </span>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                {/* Room Selection - From API */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <School className="w-4 h-4" />
                    {language === 'fr' ? 'Salle' : 'Room'}
                    {isLoadingRooms && <div className="w-3 h-3 border border-gray-300 border-t-blue-600 rounded-full animate-spin" />}
                    <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700">
                      {language === 'fr' ? 'API Intégrée' : 'API Integrated'}
                    </Badge>
                  </label>
                  {isLoadingRooms ? (
                    <div className="w-full p-3 border rounded text-center text-sm text-gray-500">
                      {language === 'fr' ? 'Chargement des salles...' : 'Loading rooms...'}
                    </div>
                  ) : availableRooms.length === 0 ? (
                    <div className="w-full p-3 border rounded text-center text-sm text-yellow-600 bg-yellow-50">
                      {language === 'fr' ? 
                        '⚠️ Aucune salle disponible - Créez des salles dans "Gestion des Classes"' : 
                        '⚠️ No rooms available - Create rooms in "Class Management"'}
                    </div>
                  ) : (
                    <Select value={formData.room} onValueChange={(value) => setFormData(prev => ({ ...prev, room: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder={language === 'fr' ? 'Choisir une salle' : 'Choose a room'} />
                      </SelectTrigger>
                      <SelectContent>
                        {getAvailableRoomsWithOccupancy().filter((room: any) => !room.isOccupied).map((room: any) => (
                          <SelectItem key={room.id} value={room.name}>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">🏢 {room.name}</span>
                              {room.capacity && (
                                <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                                  {language === 'fr' ? 'Cap.' : 'Cap.'} {room.capacity}
                                </Badge>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                        {getAvailableRoomsWithOccupancy().some((room: any) => room.isOccupied) && (
                          <div className="px-2 py-1 text-xs text-gray-500 border-t">
                            {language === 'fr' ? 'Salles occupées pour ce créneau :' : 'Occupied rooms for this slot:'}
                          </div>
                        )}
                        {getAvailableRoomsWithOccupancy().filter((room: any) => room.isOccupied).map((room: any) => (
                          <SelectItem key={`occupied-${room.id}`} value={room.name} disabled>
                            <div className="flex items-center gap-2 opacity-50">
                              <span className="font-medium">🚫 {room.name}</span>
                              <Badge variant="outline" className="text-xs bg-red-50 text-red-700">
                                {language === 'fr' ? 'Occupée' : 'Occupied'}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                <Button 
                  onClick={handleSubmit}
                  disabled={
                    !formData.className || 
                    !formData.day || 
                    !formData.startTime || 
                    !formData.endTime || 
                    !formData.subject || 
                    !formData.teacher || 
                    !formData.room ||
                    !!validateTimeSlot(formData.startTime, formData.endTime)
                  }
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  data-testid="button-create-timeslot"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {editingEntry 
                    ? (language === 'fr' ? 'Modifier le Créneau' : 'Update Timeslot')
                    : (language === 'fr' ? 'Créer le Créneau' : 'Create Timeslot')
                  }
                </Button>
                <Button 
                  onClick={() => {
                    setShowCreateForm(false);
                    setFormData({
                      className: '',
                      day: '',
                      timeSlot: '',
                      startTime: '',
                      endTime: '',
                      subject: '',
                      teacher: '',
                      room: ''
                    });
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  {language === 'fr' ? 'Annuler' : 'Cancel'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Vue Grille de l'Emploi du Temps - Style École Moderne */}
        <Card className="overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
            <CardTitle className="flex items-center text-xl">
              <Calendar className="w-6 h-6 mr-2" />
              {language === 'fr' ? 'Emploi du Temps École - Vue Hebdomadaire' : 'School Timetable - Weekly View'}
            </CardTitle>
            <p className="text-blue-100">
              {language === 'fr' ? 
                `Source de données: ${displayTimetables.length > 0 ? 'API Unifiée' : 'Local'} - ${displayTimetables.length} créneaux` : 
                `Data source: ${displayTimetables.length > 0 ? 'Unified API' : 'Local'} - ${displayTimetables.length} slots`}
            </p>
          </CardHeader>
          <CardContent className="p-0">
            {isLoadingTimetables || loading ? (
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
                {['08:00 - 09:00', '09:00 - 10:00', '10:30 - 11:30', '11:30 - 12:30', '14:00 - 15:00', '15:00 - 16:00', '16:00 - 17:00'].map((timeSlot, timeIndex) => (
                  <React.Fragment key={timeSlot}>
                    {/* Colonne horaire */}
                    <div className="bg-gray-50 p-2 text-sm font-medium text-center border-r text-gray-600">
                      {timeSlot}
                    </div>
                    
                    {/* Colonnes des jours */}
                    {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'].map((dayKey, dayIndex) => {
                      // UNIFIED SOURCE: Use displayTimetables for rendering
                      const coursesForSlot = displayTimetables.filter((entry: any) => 
                        entry.day === dayKey && (entry.timeSlot === timeSlot || 
                        `${entry.startTime}-${entry.endTime}` === timeSlot)
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