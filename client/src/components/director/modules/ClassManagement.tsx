import React, { useState, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { School, UserPlus, Search, Download, Filter, MoreHorizontal, Users, BookOpen, TrendingUp, Calendar, Plus, Edit, Trash2, Eye, Upload, ChevronDown, ChevronUp, Building, GraduationCap, Star } from 'lucide-react';
import MobileActionsOverlay from '@/components/mobile/MobileActionsOverlay';
import ImportModal from '../ImportModal';
import { ExcelImportButton } from '@/components/common/ExcelImportButton';
import DeleteConfirmationDialog from '@/components/ui/DeleteConfirmationDialog';

const ClassManagement: React.FC = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [newClass, setNewClass] = useState({
    name: '',
    capacity: '',
    teacherId: '',
    teacherName: '',
    room: '',
    subjects: [] as Array<{
      name: string;
      coefficient: number;
      category: 'general' | 'scientific' | 'literary' | 'professional' | 'other';
      hoursPerWeek: number;
      isRequired: boolean;
      bulletinSection?: 'general' | 'scientific' | 'professional';
    }>
  });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isRoomManagementOpen, setIsRoomManagementOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [newRoom, setNewRoom] = useState({
    name: '',
    type: 'classroom',
    capacity: 30,
    building: '',
    floor: '',
    equipment: ''
  });
  const [isImportingRooms, setIsImportingRooms] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [classToDelete, setClassToDelete] = useState<{id: number, name: string} | null>(null);
  
  // État pour la gestion des matières
  const [showSubjectSection, setShowSubjectSection] = useState(false);
  const [newSubject, setNewSubject] = useState({
    name: '',
    coefficient: 1,
    category: 'general' as 'general' | 'scientific' | 'literary' | 'professional' | 'other',
    hoursPerWeek: 2,
    isRequired: true,
    bulletinSection: undefined as 'general' | 'scientific' | 'professional' | undefined
  });
  
  // Ref for triggering dialogs from quick actions
  const createClassTriggerRef = useRef<HTMLButtonElement>(null);

  // Ajouter une matière
  const addSubject = () => {
    if (!newSubject.name.trim()) {
      toast({
        title: "Nom requis",
        description: "Veuillez saisir le nom de la matière",
        variant: "destructive"
      });
      return;
    }

    setNewClass(prev => ({
      ...prev,
      subjects: [...prev.subjects, { ...newSubject }]
    }));

    setNewSubject({
      name: '',
      coefficient: 1,
      category: 'general',
      hoursPerWeek: 2,
      isRequired: true,
      bulletinSection: undefined
    });

    toast({
      title: "✅ Matière ajoutée",
      description: `${newSubject.name} (coeff. ${newSubject.coefficient})`,
    });
  };

  // Supprimer une matière
  const removeSubject = (index: number) => {
    setNewClass(prev => ({
      ...prev,
      subjects: prev.subjects.filter((_, i) => i !== index)
    }));
  };

  const text = {
    fr: {
      title: 'Gestion des Classes',
      subtitle: 'Administration complète des classes de votre établissement',
      stats: {
        total: 'Total Classes',
        students: 'Total Élèves',
        capacity: 'Capacité Moyenne',
        teachers: 'Enseignants Assignés'
      },
      actions: {
        addClass: 'Créer Classe',
        import: 'Importer',
        export: 'Exporter',
        filter: 'Filtrer',
        edit: 'Modifier',
        delete: 'Supprimer',
        save: 'Enregistrer',
        cancel: 'Annuler'
      },
      form: {
        className: 'Nom de la classe',
        capacity: "Nombres d'élèves",
        teacher: 'Enseignant principal',
        room: 'Salle',
        selectTeacher: 'Sélectionner un enseignant (optionnel)',
        subjects: 'Matières et Coefficients',
        addSubject: 'Ajouter Matière',
        subjectName: 'Nom de la matière',
        coefficient: 'Coefficient',
        category: 'Catégorie',
        hoursPerWeek: 'Heures/semaine',
        required: 'Obligatoire'
      },
      table: {
        name: 'Nom Classe',
        students: 'Élèves',
        capacity: "Nombres d'élèves",
        teacher: 'Prof Principal',
        status: 'Statut',
        actions: 'Actions'
      },
      status: {
        active: 'Active',
        full: 'Complète',
        closed: 'Fermée'
      }
    },
    en: {
      title: 'Class Management',
      subtitle: 'Complete administration of your institution classes',
      stats: {
        total: 'Total Classes',
        students: 'Total Students',
        capacity: 'Average Capacity',
        teachers: 'Assigned Teachers'
      },
      actions: {
        addClass: 'Create Class',
        import: 'Import',
        export: 'Export',
        filter: 'Filter',
        edit: 'Edit',
        delete: 'Delete',
        save: 'Save',
        cancel: 'Cancel'
      },
      form: {
        className: 'Class name',
        capacity: 'Number of students',
        teacher: 'Main teacher',
        room: 'Room',
        selectTeacher: 'Select a teacher (optional)',
        subjects: 'Subjects and Coefficients',
        addSubject: 'Add Subject',
        subjectName: 'Subject name',
        coefficient: 'Coefficient',
        category: 'Category',
        hoursPerWeek: 'Hours/week',
        required: 'Required'
      },
      table: {
        name: 'Class Name',
        students: 'Students',
        capacity: 'Number of students',
        teacher: 'Main Teacher',
        status: 'Status',
        actions: 'Actions'
      },
      status: {
        active: 'Active',
        full: 'Full',
        closed: 'Closed'
      }
    }
  };

  const t = text[language as keyof typeof text];

  // Fetch classes data avec filtrage

  const getStatusBadge = (status: string) => {
    const statusColors = {
      active: 'bg-green-100 text-green-800',
      full: 'bg-yellow-100 text-yellow-800',
      closed: 'bg-red-100 text-red-800'
    };
    return statusColors[status as keyof typeof statusColors] || statusColors.active;
  };

  const getCapacityColor = (current: number, capacity: number) => {
    const percentage = (current / capacity) * 100;
    if (percentage >= 100) return 'text-red-600';
    if (percentage >= 90) return 'text-yellow-600';
    return 'text-green-600';
  };

  // Fetch classes data
  const { data: classesResponse = {}, isLoading } = useQuery({
    queryKey: ['/api/director/classes'],
    queryFn: async () => {
      console.log('[CLASS_MANAGEMENT] 🔍 Fetching classes for director...');
      const response = await fetch('/api/director/classes', {
        credentials: 'include'
      });
      if (!response.ok) {
        console.error('[CLASS_MANAGEMENT] ❌ Failed to fetch classes:', response.status);
        throw new Error('Failed to fetch classes');
      }
      const data = await response.json();
      console.log('[CLASS_MANAGEMENT] ✅ Classes fetched:', data?.classes?.length || 0, 'classes');
      return data;
    },
    retry: 2,
    retryDelay: 1000
  });

  const classesData = classesResponse?.classes || [];

  // Fetch school data to determine if it's a technical school
  const { data: schoolData } = useQuery({
    queryKey: ['/api/director/school'],
    queryFn: async () => {
      const response = await fetch('/api/director/school', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch school');
      return response.json();
    }
  });

  const isTechnicalSchool = schoolData?.educationalType === 'technical';

  // Filter classes based on search
  const filteredClasses = (Array.isArray(classesData) ? classesData : []).filter((classItem: any) => {
    const matchesSearch = classItem.name?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Fetch teachers data for dropdown
  const { data: teachersResponse = {}, isLoading: isLoadingTeachers, error: teachersError } = useQuery({
    queryKey: ['/api/director/teachers'],
    queryFn: async () => {
      console.log('[CLASS_MANAGEMENT] 🔍 Fetching teachers for school...');
      const response = await fetch('/api/director/teachers', {
        credentials: 'include'
      });
      if (!response.ok) {
        console.error('[CLASS_MANAGEMENT] ❌ Failed to fetch teachers:', response.status);
        throw new Error('Failed to fetch teachers');
      }
      const data = await response.json();
      console.log('[CLASS_MANAGEMENT] ✅ Teachers fetched:', data?.teachers?.length || 0, 'teachers');
      return data;
    },
    retry: 2,
    retryDelay: 1000
  });

  const teachersData = teachersResponse?.teachers || [];

  // Fetch rooms data
  const { data: roomsResponse = {}, isLoading: isLoadingRooms, refetch: refetchRooms } = useQuery({
    queryKey: ['/api/director/rooms'],
    queryFn: async () => {
      console.log('[CLASS_MANAGEMENT] 🏢 Fetching rooms for school...');
      const response = await fetch('/api/director/rooms', {
        credentials: 'include'
      });
      if (!response.ok) {
        console.error('[CLASS_MANAGEMENT] ❌ Failed to fetch rooms:', response.status);
        throw new Error('Failed to fetch rooms');
      }
      const data = await response.json();
      console.log('[CLASS_MANAGEMENT] ✅ Rooms fetched:', data?.rooms?.length || 0, 'rooms');
      return data;
    },
    retry: 2,
    retryDelay: 1000
  });

  const roomsData = roomsResponse?.rooms || [];

  // Add default values for display
  const finalClasses = (Array.isArray(filteredClasses) ? filteredClasses : []).map((classItem: any) => ({
    ...classItem,
    currentStudents: classItem.currentStudents || 0,
    capacity: classItem.maxStudents || classItem.capacity || 30,
    teacher: classItem.teacherName || 'Non assigné',
    status: 'active',
    room: classItem.room || 'Non définie'
  }));

  // Create class mutation
  const createClassMutation = useMutation({
    mutationFn: async (classData: any) => {
      console.log('[CLASS_MANAGEMENT] 🚀 Creating class:', classData.name);
      const response = await fetch('/api/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(classData),
        credentials: 'include'
      });
      if (!response.ok) {
        const error = await response.json();
        console.error('[CLASS_MANAGEMENT] ❌ Failed to create class:', error);
        throw new Error(error.message || 'Failed to create class');
      }
      const result = await response.json();
      console.log('[CLASS_MANAGEMENT] ✅ Class created successfully:', result);
      return result;
    },
    onSuccess: () => {
      // Invalider les deux caches pour être sûr
      queryClient.invalidateQueries({ queryKey: ['/api/classes'] });
      queryClient.invalidateQueries({ queryKey: ['/api/director/classes'] });
      toast({
        title: language === 'fr' ? 'Classe créée' : 'Class created',
        description: language === 'fr' ? 'La classe a été créée avec succès.' : 'Class has been created successfully.'
      });
      setNewClass({ name: '', capacity: '', teacherId: '', teacherName: '', room: '', subjects: [] });
      setShowCreateModal(false); // Close the modal after successful creation
    },
    onError: (error: any) => {
      console.error('[CLASS_MANAGEMENT] ❌ Create mutation error:', error);
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: error.message || (language === 'fr' ? 'Impossible de créer la classe' : 'Failed to create class'),
        variant: 'destructive'
      });
    }
  });

  // Delete class mutation
  const deleteClassMutation = useMutation({
    mutationFn: async (classId: number) => {
      const response = await fetch(`/api/classes/${classId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to delete class');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/classes'] });
      queryClient.invalidateQueries({ queryKey: ['/api/director/classes'] });
      toast({
        title: language === 'fr' ? 'Classe supprimée' : 'Class deleted',
        description: language === 'fr' ? 'La classe a été supprimée avec succès.' : 'Class has been deleted successfully.'
      });
    }
  });

  // Edit class mutation
  const editClassMutation = useMutation({
    mutationFn: async ({ classId, classData }: { classId: number, classData: any }) => {
      const response = await fetch(`/api/classes/${classId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(classData)
      });
      if (!response.ok) throw new Error('Failed to edit class');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/classes'] });
      queryClient.invalidateQueries({ queryKey: ['/api/director/classes'] });
      toast({
        title: language === 'fr' ? 'Classe modifiée' : 'Class updated',
        description: language === 'fr' ? 'La classe a été modifiée avec succès.' : 'Class has been updated successfully.'
      });
      setShowEditModal(false);
      setSelectedClass(null);
    }
  });

  // Add room mutation
  const addRoomMutation = useMutation({
    mutationFn: async ({ name, capacity }: { name: string, capacity: number }) => {
      const response = await fetch('/api/director/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name, capacity })
      });
      if (!response.ok) {
        throw new Error('Failed to add room');
      }
      return response.json();
    },
    onSuccess: () => {
      refetchRooms(); // Refresh rooms list
      toast({
        title: language === 'fr' ? 'Salle ajoutée' : 'Room added',
        description: language === 'fr' ? 'La salle a été ajoutée avec succès.' : 'Room has been added successfully.'
      });
      setNewRoom({ name: '', type: 'classroom', capacity: 30, building: '', floor: '', equipment: '' });
    },
    onError: (error) => {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' ? 'Impossible d\'ajouter la salle.' : 'Failed to add room.',
        variant: 'destructive'
      });
    }
  });

  const handleAddRoom = () => {
    if (!newRoom.name.trim()) {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' ? 'Veuillez saisir un nom de salle.' : 'Please enter a room name.',
        variant: 'destructive'
      });
      return;
    }
    
    console.log('[CLASS_MANAGEMENT] 🏢 Adding new room:', newRoom);
    addRoomMutation.mutate(newRoom);
  };

  // Import rooms from CSV
  const importRoomsMutation = useMutation({
    mutationFn: async (roomsData: Array<{name: string, capacity: number}>) => {
      console.log('[CLASS_MANAGEMENT] 📥 Importing rooms:', roomsData.length, 'rooms');
      const response = await fetch('/api/director/rooms/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ rooms: roomsData })
      });
      if (!response.ok) {
        throw new Error('Failed to import rooms');
      }
      return response.json();
    },
    onSuccess: (data) => {
      refetchRooms(); // Refresh rooms list
      toast({
        title: language === 'fr' ? 'Import réussi' : 'Import successful',
        description: language === 'fr' ? 
          `${data.imported || 0} salles importées avec succès.` : 
          `${data.imported || 0} rooms imported successfully.`
      });
      setIsImportingRooms(false);
    },
    onError: (error) => {
      console.error('[CLASS_MANAGEMENT] ❌ Import error:', error);
      toast({
        title: language === 'fr' ? 'Erreur d\'import' : 'Import error',
        description: language === 'fr' ? 'Impossible d\'importer les salles.' : 'Failed to import rooms.',
        variant: 'destructive'
      });
      setIsImportingRooms(false);
    }
  });

  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast({
        title: language === 'fr' ? 'Format invalide' : 'Invalid format',
        description: language === 'fr' ? 'Veuillez sélectionner un fichier CSV.' : 'Please select a CSV file.',
        variant: 'destructive'
      });
      return;
    }

    setIsImportingRooms(true);
    
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());
        
        if (lines.length < 2) {
          throw new Error('CSV file must contain at least a header and one data row');
        }
        
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        
        // Validate headers
        if (!headers.includes('nom') && !headers.includes('name')) {
          throw new Error('CSV must contain a "nom" or "name" column');
        }
        
        const nameIndex = headers.findIndex(h => h.includes('nom') || h.includes('name'));
        const capacityIndex = headers.findIndex(h => h.includes('capacité') || h.includes('capacity') || h.includes('capacite'));
        
        const roomsData = [];
        
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim());
          
          if (values.length < nameIndex + 1) continue;
          
          const name = values[nameIndex];
          const capacity = capacityIndex >= 0 && values[capacityIndex] 
            ? parseInt(values[capacityIndex]) || 30 
            : 30;
            
          if (name) {
            roomsData.push({ name, capacity });
          }
        }
        
        if (roomsData.length === 0) {
          throw new Error('No valid room data found in CSV');
        }
        
        console.log('[CLASS_MANAGEMENT] 📋 Parsed CSV data:', roomsData);
        importRoomsMutation.mutate(roomsData);
        
      } catch (error) {
        console.error('[CLASS_MANAGEMENT] ❌ CSV parsing error:', error);
        toast({
          title: language === 'fr' ? 'Erreur de fichier' : 'File error',
          description: language === 'fr' ? 'Impossible de lire le fichier CSV.' : 'Unable to read CSV file.',
          variant: 'destructive'
        });
        setIsImportingRooms(false);
      }
    };
    
    reader.readAsText(file);
    // Clear the input
    event.target.value = '';
  };

  const downloadRoomsTemplate = () => {
    const csvContent = [
      'nom,capacité',
      'Salle 101,30',
      'Salle 102,25', 
      'Laboratoire,20',
      'Salle Informatique,24'
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `modele_salles_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast({
      title: language === 'fr' ? 'Modèle téléchargé' : 'Template downloaded',
      description: language === 'fr' ? 'Fichier modèle CSV des salles téléchargé' : 'Room CSV template file downloaded',
    });
  };

  const handleCreateClass = () => {
    if (!newClass.name) {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' ? 'Le nom de la classe est requis.' : 'Class name is required.',
        variant: 'destructive'
      });
      return;
    }
    
    console.log('[CLASS_MANAGEMENT] 🚀 Preparing class creation with data:', newClass);
    
    // Transform data to match backend API contract and database schema
    const classDataForAPI = {
      name: newClass.name,
      maxStudents: newClass.capacity ? parseInt(newClass.capacity) : null, // Optional field
      level: newClass.subjects.length > 0 ? newClass.subjects[0].name : null, // Optional
      section: null, // Optional
      room: newClass.room || null,
      teacherId: newClass.teacherId ? parseInt(newClass.teacherId) : null, // Optional field
      academicYearId: 1, // Required field - use current academic year ID (TODO: fetch dynamically)
      subjects: newClass.subjects, // Include subjects for later processing
      isActive: true
    };
    
    console.log('[CLASS_MANAGEMENT] 📤 Sending to API:', classDataForAPI);
    createClassMutation.mutate(classDataForAPI);
  };

  const handleDeleteClass = (classId: number, className: string) => {
    setClassToDelete({ id: classId, name: className });
    setDeleteDialogOpen(true);
  };

  const confirmDeleteClass = () => {
    if (classToDelete) {
      deleteClassMutation.mutate(classToDelete.id);
      setClassToDelete(null);
    }
  };

  const handleEditClass = (classItem: any) => {
    console.log('[CLASS_MANAGEMENT] ✏️ Opening edit modal for class:', classItem.name);
    setSelectedClass({
      id: classItem.id,
      name: classItem.name,
      capacity: classItem?.capacity?.toString(),
      teacherId: classItem.teacherId || '',
      teacherName: classItem.teacher,
      room: classItem.room
    });
    setShowEditModal(true);
  };

  const handleSaveEditClass = () => {
    if (!selectedClass?.name) {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' ? 'Le nom de la classe est requis.' : 'Class name is required.',
        variant: 'destructive'
      });
      return;
    }
    
    console.log('[CLASS_MANAGEMENT] 💾 Saving class changes:', selectedClass);
    
    // Transform data to match backend API contract
    const classDataForAPI = {
      name: selectedClass.name,
      room: selectedClass.room || null,
      maxStudents: selectedClass.capacity ? parseInt(selectedClass.capacity) : null, // Optional field
      schedule: '', // Optional field
      description: `Classe ${selectedClass.name}` // Auto-generated description
    };
    
    editClassMutation.mutate({
      classId: selectedClass.id,
      classData: classDataForAPI
    });
  };

  const handleViewClass = (classItem: any) => {
    console.log('[CLASS_MANAGEMENT] 👁️ Opening view modal for class:', classItem.name);
    setSelectedClass(classItem);
    setIsViewModalOpen(true);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{language === 'fr' ? 'Chargement des classes...' : 'Loading classes...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Card className="bg-white/80 backdrop-blur-md shadow-xl border border-white/30 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-3">
                <BookOpen className="w-6 h-6 text-blue-600" />
                {String(t?.title) || "N/A"}
              </h2>
              <p className="text-gray-600 mt-1">{String(t?.subtitle) || "N/A"}</p>
            </div>
            <div className="flex gap-2">
              {/* Create Class Dialog */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button 
                    ref={createClassTriggerRef}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {String(t?.actions?.addClass) || "N/A"}
                  </Button>
                </DialogTrigger>
              <DialogContent className="bg-white max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
                <DialogHeader className="bg-white sticky top-0 z-10 border-b border-gray-200 pb-4">
                  <DialogTitle className="text-lg sm:text-xl">{String(t?.actions?.addClass) || "N/A"}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 bg-white p-1">
                  <div>
                    <Label>{String(t?.form?.className) || "N/A"}</Label>
                    <Input
                      value={newClass.name}
                      onChange={(e) => setNewClass({...newClass, name: e.target.value})}
                      placeholder="Ex: 6ème A, Terminale C, CP..."
                      className="bg-white border-gray-300"
                    />
                  </div>
                  
                  {/* Section Matières et Coefficients */}
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <Label className="text-lg font-medium flex items-center">
                        <GraduationCap className="w-5 h-5 mr-2 text-blue-600" />
                        {String(t?.form?.subjects) || "Matières et Coefficients"}
                      </Label>
                    </div>
                    
                    {/* Liste des matières existantes */}
                    {newClass.subjects.length > 0 && (
                      <div className="space-y-2 mb-4">
                        <div className="text-sm text-gray-600">
                          {newClass.subjects.length} matière{newClass.subjects.length > 1 ? 's' : ''} configurée{newClass.subjects.length > 1 ? 's' : ''}
                        </div>
                        <div className="max-h-40 overflow-y-auto space-y-1">
                          {newClass.subjects.map((subject, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                              <div className="flex-1">
                                <span className="font-medium text-sm">{subject.name}</span>
                                <div className="text-xs text-gray-500">
                                  Coeff. {subject.coefficient} • {subject.hoursPerWeek}h/sem • {subject.category}
                                  {isTechnicalSchool && subject.bulletinSection && (
                                    <span className="ml-2 text-blue-600 font-medium">
                                      → {language === 'fr' ? 'Bulletin' : 'Report'}: {subject.bulletinSection}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <Button
                                type="button"
                                onClick={() => removeSubject(index)}
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Formulaire ajout de matière */}
                    <div className="border rounded-md p-3 bg-blue-50">
                      <div className="text-sm font-medium mb-2 text-blue-800">
                        {String(t?.form?.addSubject) || "Ajouter Matière"}
                      </div>
                      {/* Important reminder for technical schools */}
                      <div className="bg-amber-50 border border-amber-200 rounded-md p-2 mb-3 text-xs text-amber-800">
                        <div className="flex items-start gap-2">
                          <span className="text-base">⚠️</span>
                          <div>
                            <strong>{language === 'fr' ? 'Important pour établissements techniques' : 'Important for technical schools'}:</strong>
                            <p className="mt-1">
                              {language === 'fr' 
                                ? 'Le type de matière (Général/Professionnel/Autre) est essentiel pour la création correcte des bulletins. Les bulletins techniques afficheront 3 sections distinctes selon ce classement.'
                                : 'Subject type (General/Professional/Other) is essential for correct bulletin creation. Technical bulletins will display 3 distinct sections based on this classification.'}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        <div>
                          <Input
                            placeholder={String(t?.form?.subjectName) || "Nom matière"}
                            value={newSubject.name}
                            onChange={(e) => setNewSubject(prev => ({ ...prev, name: e.target.value }))}
                            className="bg-white text-sm"
                          />
                        </div>
                        <div className="flex gap-1">
                          <Input
                            type="number"
                            placeholder="Coeff"
                            value={newSubject.coefficient}
                            onChange={(e) => setNewSubject(prev => ({ ...prev, coefficient: parseInt(e.target.value) || 1 }))}
                            className="bg-white text-sm"
                            min="1"
                            max="10"
                          />
                          <Input
                            type="number"
                            placeholder="H/sem"
                            value={newSubject.hoursPerWeek}
                            onChange={(e) => setNewSubject(prev => ({ ...prev, hoursPerWeek: parseInt(e.target.value) || 1 }))}
                            className="bg-white text-sm"
                            min="1"
                            max="15"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2 mb-2">
                        <Select 
                          value={newSubject.category} 
                          onValueChange={(value: 'general' | 'scientific' | 'literary' | 'professional' | 'other') => 
                            setNewSubject(prev => ({ ...prev, category: value }))
                          }
                        >
                          <SelectTrigger className="bg-white text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="general">📚 {language === 'fr' ? 'Général' : 'General'}</SelectItem>
                            <SelectItem value="scientific">🔬 {language === 'fr' ? 'Scientifique' : 'Scientific'}</SelectItem>
                            <SelectItem value="literary">📖 {language === 'fr' ? 'Littéraire' : 'Literary'}</SelectItem>
                            <SelectItem value="professional">🔧 {language === 'fr' ? 'Professionnel' : 'Professional'}</SelectItem>
                            <SelectItem value="other">🎨 {language === 'fr' ? 'Autre' : 'Other'}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {isTechnicalSchool && (
                        <div className="mb-2">
                          <Label className="text-xs mb-1 block">
                            {language === 'fr' ? '📋 Section Bulletin (3 sections)' : '📋 Bulletin Section (3 sections)'}
                          </Label>
                          <Select 
                            value={newSubject.bulletinSection || ''} 
                            onValueChange={(value: 'general' | 'scientific' | 'professional') => 
                              setNewSubject(prev => ({ ...prev, bulletinSection: value }))
                            }
                          >
                            <SelectTrigger className="bg-white text-sm">
                              <SelectValue placeholder={language === 'fr' ? 'Sélectionner section' : 'Select section'} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="general">📚 {language === 'fr' ? 'Général' : 'General'}</SelectItem>
                              <SelectItem value="scientific">🔬 {language === 'fr' ? 'Scientifique' : 'Scientific'}</SelectItem>
                              <SelectItem value="professional">🔧 {language === 'fr' ? 'Professionnel' : 'Professional'}</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          onClick={addSubject}
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700 text-white flex-1"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          {language === 'fr' ? 'Ajouter' : 'Add'}
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <Label>{String(t?.form?.capacity) || "Capacité"}</Label>
                    <Input
                      type="number"
                      value={newClass?.capacity || ""}
                      onChange={(e) => setNewClass({...newClass, capacity: e?.target?.value})}
                      placeholder="30"
                      className="bg-white border-gray-300"
                    />
                  </div>
                  <div>
                    <Label className="flex items-center">
                      {String(t?.form?.teacher) || "N/A"}
                      <span className="ml-1 text-xs text-gray-500">(optionnel)</span>
                    </Label>
                    <Select 
                      value={String(newClass?.teacherId) || ""} 
                      onValueChange={(value) => {
                        console.log('[CLASS_MANAGEMENT] 👨‍🏫 Teacher selected:', value);
                        if (value === "no-teacher") {
                          setNewClass({
                            ...newClass, 
                            teacherId: '',
                            teacherName: ''
                          });
                        } else {
                          const selectedTeacher = teachersData.find((t: any) => t?.id?.toString() === value);
                          setNewClass({
                            ...newClass, 
                            teacherId: value,
                            teacherName: selectedTeacher ? `${String(selectedTeacher?.firstName) || ""} ${String(selectedTeacher?.lastName) || ""}` : ''
                          });
                        }
                      }}
                      disabled={isLoadingTeachers}
                    >
                      <SelectTrigger className="bg-white border-gray-300">
                        <SelectValue placeholder={
                          isLoadingTeachers 
                            ? "Chargement des enseignants..." 
                            : teachersError 
                              ? "Erreur de chargement" 
                              : "Aucun enseignant principal (optionnel)"
                        } />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectItem value="no-teacher">
                          <div className="flex items-center text-gray-600">
                            <span>❌ Aucun enseignant principal</span>
                          </div>
                        </SelectItem>
                        {isLoadingTeachers ? (
                          <SelectItem value="disabled-option" disabled>
                            Chargement des enseignants...
                          </SelectItem>
                        ) : teachersError ? (
                          <SelectItem value="disabled-option" disabled>
                            Erreur: Impossible de charger les enseignants
                          </SelectItem>
                        ) : teachersData.length === 0 ? (
                          <SelectItem value="disabled-option" disabled>
                            Aucun enseignant trouvé dans cette école
                          </SelectItem>
                        ) : (
                          teachersData.map((teacher: any) => (
                            <SelectItem key={String(teacher?.id) || "N/A"} value={teacher?.id?.toString()}>
                              <div className="flex items-center">
                                <span>👨‍🏫 {String(teacher?.firstName) || "Prénom"} {String(teacher?.lastName) || "Nom"}</span>
                                {teacher.subjects && teacher.subjects.length > 0 && (
                                  <span className="ml-2 text-xs text-gray-500">({teacher?.subjects?.join(', ')})</span>
                                )}
                              </div>
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    {teachersError && (
                      <p className="text-sm text-red-600 mt-1">
                        Erreur: {teachersError.message}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      💡 Vous pouvez assigner un enseignant principal plus tard
                    </p>
                  </div>
                  <div>
                    <Label>{String(t?.form?.room) || "Salle"}</Label>
                    <Select 
                      value={newClass.room || ''} 
                      onValueChange={(value) => {
                        console.log('[CLASS_MANAGEMENT] 🏢 Room selected:', value);
                        setNewClass({...newClass, room: value});
                      }}
                      disabled={isLoadingRooms}
                    >
                      <SelectTrigger className="bg-white border-gray-300">
                        <SelectValue placeholder={
                          isLoadingRooms 
                            ? "Chargement des salles..." 
                            : roomsData.length === 0 
                              ? "Aucune salle disponible"
                              : "Sélectionner une salle (optionnel)"
                        } />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectItem value="no-room">Aucune salle assignée</SelectItem>
                        {isLoadingRooms ? (
                          <SelectItem value="disabled-option" disabled>
                            Chargement des salles...
                          </SelectItem>
                        ) : roomsData.length === 0 ? (
                          <SelectItem value="disabled-option" disabled>
                            Aucune salle trouvée - Utilisez "Gérer Salles" pour en ajouter
                          </SelectItem>
                        ) : (
                          roomsData.filter((room: any) => !room.isOccupied).map((room: any) => (
                            <SelectItem key={String(room?.id) || "N/A"} value={room?.name}>
                              {room?.name} 
                              {room.capacity && ` (${language === 'fr' ? 'Capacité' : 'Capacity'}: ${room.capacity})`}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button 
                      onClick={handleCreateClass}
                      disabled={createClassMutation?.isPending || false}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {createClassMutation.isPending ? 'Création...' : t?.actions?.save}
                    </Button>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="flex-1">
                        {String(t?.actions?.cancel) || "N/A"}
                      </Button>
                    </DialogTrigger>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Edit Class Dialog */}
            <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
              <DialogContent className="bg-white max-w-[95vw] sm:max-w-md p-4 sm:p-6">
                <DialogHeader className="bg-white">
                  <DialogTitle className="text-lg sm:text-xl">{String(t?.actions?.edit) || "N/A"} {selectedClass?.name}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 bg-white">
                  <div>
                    <Label>{String(t?.form?.className) || "N/A"}</Label>
                    <Input
                      value={selectedClass?.name || ''}
                      onChange={(e) => setSelectedClass({...selectedClass, name: e?.target?.value})}
                      placeholder="6ème A"
                      className="bg-white border-gray-300"
                    />
                  </div>
                  <div>
                    <Label>{String(t?.form?.capacity) || "N/A"}</Label>
                    <Input
                      type="number"
                      value={selectedClass?.capacity || ''}
                      onChange={(e) => setSelectedClass({...selectedClass, capacity: e?.target?.value})}
                      placeholder="30"
                      className="bg-white border-gray-300"
                    />
                  </div>
                  <div>
                    <Label>{String(t?.form?.teacher) || "N/A"}</Label>
                    <Select 
                      value={selectedClass?.teacherId || ''} 
                      onValueChange={(value) => {
                        console.log('[CLASS_MANAGEMENT] 👨‍🏫 Teacher updated:', value);
                        const selectedTeacher = teachersData.find((t: any) => t?.id?.toString() === value);
                        setSelectedClass({
                          ...selectedClass, 
                          teacherId: value,
                          teacherName: selectedTeacher ? `${String(selectedTeacher?.firstName) || ""} ${String(selectedTeacher?.lastName) || ""}` : ''
                        });
                      }}
                      disabled={isLoadingTeachers}
                    >
                      <SelectTrigger className="bg-white border-gray-300">
                        <SelectValue placeholder={
                          isLoadingTeachers 
                            ? "Chargement des enseignants..." 
                            : teachersError 
                              ? "Erreur de chargement" 
                              : teachersData.length === 0 
                                ? "Aucun enseignant disponible"
                                : String(t?.form?.selectTeacher) || "Sélectionner un enseignant"
                        } />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        {isLoadingTeachers ? (
                          <SelectItem value="disabled-option" disabled>
                            Chargement des enseignants...
                          </SelectItem>
                        ) : teachersError ? (
                          <SelectItem value="disabled-option" disabled>
                            Erreur: Impossible de charger les enseignants
                          </SelectItem>
                        ) : teachersData.length === 0 ? (
                          <SelectItem value="disabled-option" disabled>
                            Aucun enseignant trouvé dans cette école
                          </SelectItem>
                        ) : (
                          teachersData.map((teacher: any) => (
                            <SelectItem key={String(teacher?.id) || "N/A"} value={teacher?.id?.toString()}>
                              {String(teacher?.firstName) || "Prénom"} {String(teacher?.lastName) || "Nom"}
                              {teacher.subjects && teacher.subjects.length > 0 && ` (${teacher?.subjects?.join(', ')})`}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    {teachersError && (
                      <p className="text-sm text-red-600 mt-1">
                        Erreur: {teachersError.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label>{String(t?.form?.room) || "Salle"}</Label>
                    <Select 
                      value={selectedClass?.room || ''} 
                      onValueChange={(value) => {
                        console.log('[CLASS_MANAGEMENT] 🏢 Room updated:', value);
                        setSelectedClass({...selectedClass, room: value});
                      }}
                      disabled={isLoadingRooms}
                    >
                      <SelectTrigger className="bg-white border-gray-300">
                        <SelectValue placeholder={
                          isLoadingRooms 
                            ? "Chargement des salles..." 
                            : roomsData.length === 0 
                              ? "Aucune salle disponible"
                              : "Sélectionner une salle (optionnel)"
                        } />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectItem value="no-room">Aucune salle assignée</SelectItem>
                        {isLoadingRooms ? (
                          <SelectItem value="disabled-option" disabled>
                            Chargement des salles...
                          </SelectItem>
                        ) : roomsData.length === 0 ? (
                          <SelectItem value="disabled-option" disabled>
                            Aucune salle trouvée
                          </SelectItem>
                        ) : (
                          roomsData.map((room: any) => (
                            <SelectItem key={String(room?.id) || "N/A"} value={room?.name}>
                              {room?.name} 
                              {room.capacity && ` (${language === 'fr' ? 'Capacité' : 'Capacity'}: ${room.capacity})`}
                              {room.isOccupied && room.name !== selectedClass?.room && ' - Occupée'}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button 
                      onClick={handleSaveEditClass}
                      disabled={editClassMutation?.isPending || false}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {editClassMutation.isPending ? 'Modification...' : t?.actions?.save}
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => setShowEditModal(false)}
                    >
                      {String(t?.actions?.cancel) || "N/A"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Button variant="outline" onClick={() => toast({ title: language === 'fr' ? 'Import à venir' : 'Import coming soon' })}>
              <Download className="w-4 h-4 mr-2" />
              {String(t?.actions?.import) || "N/A"}
            </Button>
            <Button variant="outline" onClick={() => toast({ title: language === 'fr' ? 'Export à venir' : 'Export coming soon' })}>
              <Download className="w-4 h-4 mr-2" />
              {String(t?.actions?.export) || "N/A"}
            </Button>
          </div>
          </div>
        </Card>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6 bg-white border-gray-200">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <School className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">{String(t?.stats?.total) || "N/A"}</p>
                <p className="text-2xl font-bold">{String(finalClasses?.length) || "N/A"}</p>
              </div>
            </div>
          </Card>
          <Card className="p-6 bg-white border-gray-200">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">{String(t?.stats?.students) || "N/A"}</p>
                <p className="text-2xl font-bold">{(Array.isArray(finalClasses) ? finalClasses : []).reduce((sum: number, c: any) => sum + c.currentStudents, 0)}</p>
              </div>
            </div>
          </Card>
          <Card className="p-6 bg-white border-gray-200">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">{String(t?.stats?.capacity) || "N/A"}</p>
                <p className="text-2xl font-bold">{Math.round((Array.isArray(finalClasses) ? finalClasses : []).reduce((sum: number, c: any) => sum + c.capacity, 0) / (Array.isArray(finalClasses) ? finalClasses.length : 0))}</p>
              </div>
            </div>
          </Card>
          <Card className="p-6 bg-white border-gray-200">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <BookOpen className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">{String(t?.stats?.teachers) || "N/A"}</p>
              <p className="text-2xl font-bold">{(Array.isArray(finalClasses) ? finalClasses : []).filter((c: any) => c.teacher !== 'Non assigné').length}</p>
            </div>
          </div>
        </Card>
      </div>

        {/* Quick Actions - Mobile Optimized */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              {language === 'fr' ? 'Actions Rapides' : 'Quick Actions'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <MobileActionsOverlay
              title={language === 'fr' ? 'Actions Classes' : 'Class Actions'}
              maxVisibleButtons={3}
              actions={[
                {
                  id: 'create-class',
                  label: language === 'fr' ? 'Créer Classe' : 'Create Class',
                  icon: <Plus className="w-5 h-5" />,
                  onClick: () => {
                    console.log('[CLASS_MANAGEMENT] ➕ Quick action: Creating class...');
                    createClassTriggerRef.current?.click();
                  },
                  color: 'bg-blue-600 hover:bg-blue-700'
                },
                {
                  id: 'assign-teachers',
                  label: language === 'fr' ? 'Assigner Enseignants' : 'Assign Teachers',
                  icon: <UserPlus className="w-5 h-5" />,
                  onClick: () => {
                    console.log('[CLASS_MANAGEMENT] 👨‍🏫 Navigating to teacher management...');
                    const event = new CustomEvent('switchToTeacherManagement');
                    window.dispatchEvent(event);
                  },
                  color: 'bg-green-600 hover:bg-green-700'
                },
                {
                  id: 'schedule-classes',
                  label: language === 'fr' ? 'Planifier Cours' : 'Schedule Classes',
                  icon: <Calendar className="w-5 h-5" />,
                  onClick: () => {
                    const event = new CustomEvent('switchToTimetable');
                    window.dispatchEvent(event);
                  },
                  color: 'bg-purple-600 hover:bg-purple-700'
                },
                {
                  id: 'export-data',
                  label: language === 'fr' ? 'Exporter Données' : 'Export Data',
                  icon: <Download className="w-5 h-5" />,
                  onClick: () => {
                    console.log('[CLASS_MANAGEMENT] 📊 Exporting class data...');
                    // Generate CSV content for classes
                    const csvContent = [
                      ['Nom Classe,Élèves,Capacité,Enseignant,Salle,Statut'],
                      ...(Array.isArray(finalClasses) ? finalClasses : []).map((classItem: any) => [
                        classItem.name,
                        classItem.currentStudents,
                        classItem.capacity,
                        classItem.teacher,
                        classItem.room,
                        t.status[classItem.status as keyof typeof t.status]
                      ].join(','))
                    ].join('\n');
                    
                    // Create and download file
                    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                    const link = document.createElement('a');
                    const url = URL.createObjectURL(blob);
                    link.setAttribute('href', url);
                    link.setAttribute('download', `classes_${new Date().toISOString().split('T')[0]}.csv`);
                    link.style.visibility = 'hidden';
                    document?.body?.appendChild(link);
                    link.click();
                    document?.body?.removeChild(link);
                    
                    toast({
                      title: language === 'fr' ? 'Export réussi' : 'Export successful',
                      description: language === 'fr' ? 'Fichier CSV des classes téléchargé' : 'Class CSV file downloaded',
                    });
                  },
                  color: 'bg-orange-600 hover:bg-orange-700'
                },
                {
                  id: 'manage-rooms',
                  label: language === 'fr' ? 'Gérer Salles' : 'Manage Rooms',
                  icon: <School className="w-5 h-5" />,
                  onClick: () => {
                    console.log('[CLASS_MANAGEMENT] 🏫 Opening room management modal...');
                    setIsRoomManagementOpen(true);
                  },
                  color: 'bg-teal-600 hover:bg-teal-700'
                }
              ]}
            />
          </CardContent>
        </Card>

        {/* Excel Import Section */}
        <Card className="p-6 bg-white border-gray-200">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-2">
                <Upload className="w-5 h-5 text-blue-600" />
                {language === 'fr' ? 'Import Excel en Masse' : 'Bulk Excel Import'}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                {language === 'fr' 
                  ? 'Téléchargez le modèle Excel, remplissez-le avec vos classes, puis importez-le pour créer plusieurs classes en une seule opération.'
                  : 'Download the Excel template, fill it with your classes, then import it to create multiple classes in one operation.'}
              </p>
            </div>
            <ExcelImportButton
              importType="classes"
              schoolId={user?.schoolId}
              invalidateQueries={['/api/classes', '/api/director/classes']}
              onImportSuccess={() => {
                queryClient.invalidateQueries({ queryKey: ['/api/classes'] });
                queryClient.invalidateQueries({ queryKey: ['/api/director/classes'] });
                toast({
                  title: language === 'fr' ? '✅ Import réussi' : '✅ Import successful',
                  description: language === 'fr' ? 'Les classes ont été créées avec succès' : 'Classes created successfully'
                });
              }}
            />
          </div>
        </Card>

        {/* Filters and Search */}
        <Card className="p-6 bg-white border-gray-200">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder={language === 'fr' ? 'Rechercher une classe...' : 'Search class...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e?.target?.value)}
                className="pl-10 bg-white border-gray-300"
              />
            </div>
          </div>
        </div>
      </Card>

        {/* Classes Table */}
        <Card className="bg-white border-gray-200">
          <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b bg-gray-50">
              <tr>
                <th className="text-left p-4 font-semibold">{String(t?.table?.name) || "N/A"}</th>
                <th className="text-left p-4 font-semibold">{String(t?.table?.students) || "N/A"}</th>
                <th className="text-left p-4 font-semibold">{String(t?.table?.capacity) || "N/A"}</th>
                <th className="text-left p-4 font-semibold">{String(t?.table?.teacher) || "N/A"}</th>
                <th className="text-left p-4 font-semibold">{String(t?.table?.status) || "N/A"}</th>
                <th className="text-left p-4 font-semibold">{String(t?.table?.actions) || "N/A"}</th>
              </tr>
            </thead>
            <tbody>
              {(Array.isArray(finalClasses) ? finalClasses : []).map((classItem: any) => (
                <tr key={String(classItem?.id) || "N/A"} className="border-b hover:bg-gray-50">
                  <td className="p-4">
                    <div>
                      <div className="font-medium">{String(classItem?.name) || "N/A"}</div>
                      <div className="text-sm text-gray-500">{String(classItem?.room) || "N/A"}</div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`font-semibold ${getCapacityColor(classItem.currentStudents, classItem.capacity)}`}>
                      {String(classItem?.currentStudents) || "N/A"}
                    </span>
                  </td>
                  <td className="p-4">{String(classItem?.capacity) || "N/A"}</td>
                  <td className="p-4">{String(classItem?.teacher) || "N/A"}</td>
                  <td className="p-4">
                    <Badge className={getStatusBadge(classItem.status)}>
                      {t.status[classItem.status as keyof typeof t.status]}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-1">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleViewClass(classItem)}
                        data-testid={`button-view-class-${String(classItem?.id) || "N/A"}`}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleEditClass(classItem)}
                        data-testid={`button-edit-class-${String(classItem?.id) || "N/A"}`}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleDeleteClass(classItem.id, classItem.name)}
                        data-testid={`button-delete-class-${String(classItem?.id) || "N/A"}`}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </Card>

        {/* Modal de gestion des salles */}
        <Dialog open={isRoomManagementOpen} onOpenChange={setIsRoomManagementOpen}>
          <DialogContent className="max-w-[95vw] sm:max-w-4xl p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Building className="w-5 h-5" />
                {language === 'fr' ? 'Gestion des Salles' : 'Room Management'}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-4">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <School className="w-4 h-4" />
                    {language === 'fr' ? 'Salles Disponibles' : 'Available Rooms'}
                  </h3>
                  <div className="space-y-2">
                    {roomsData.filter((room: any) => !room.isOccupied).map((room: any, index: number) => (
                      <div key={room.id || index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div>
                          <span className="font-medium">{room.name}</span>
                          <div className="text-xs text-gray-500">
                            {language === 'fr' ? 'Capacité' : 'Capacity'}: {room.capacity}
                          </div>
                        </div>
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          {language === 'fr' ? 'Libre' : 'Free'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="p-4">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    {language === 'fr' ? 'Salles Occupées' : 'Occupied Rooms'}
                  </h3>
                  <div className="space-y-2">
                    {roomsData.filter((room: any) => room.isOccupied).map((room: any, index: number) => (
                      <div key={room.id || index} className="flex items-center justify-between p-2 bg-blue-50 rounded">
                        <div>
                          <span className="font-medium">{room.name}</span>
                          <div className="text-xs text-gray-500">
                            {language === 'fr' ? 'Capacité' : 'Capacity'}: {room.capacity}
                          </div>
                        </div>
                        <Badge variant="outline" className="text-blue-600 border-blue-600">
                          {language === 'fr' ? 'Occupée' : 'Occupied'}
                        </Badge>
                      </div>
                    ))}
                    {roomsData.filter((room: any) => room.isOccupied).length === 0 && (
                      <div className="text-center text-gray-500 py-4">
                        {language === 'fr' ? 'Aucune salle occupée' : 'No occupied rooms'}
                      </div>
                    )}
                  </div>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-4">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    {language === 'fr' ? 'Ajouter une Salle' : 'Add Room'}
                  </h3>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">{language === 'fr' ? 'Nom' : 'Name'}</Label>
                        <Input 
                          placeholder={language === 'fr' ? 'Salle 301' : 'Room 301'}
                          value={newRoom.name}
                          onChange={(e) => setNewRoom({...newRoom, name: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">{language === 'fr' ? 'Type' : 'Type'}</Label>
                        <Select value={newRoom.type} onValueChange={(value) => setNewRoom({...newRoom, type: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="classroom">{language === 'fr' ? 'Salle de classe' : 'Classroom'}</SelectItem>
                            <SelectItem value="laboratory">{language === 'fr' ? 'Laboratoire' : 'Laboratory'}</SelectItem>
                            <SelectItem value="computer_lab">{language === 'fr' ? 'Salle informatique' : 'Computer Lab'}</SelectItem>
                            <SelectItem value="library">{language === 'fr' ? 'Bibliothèque' : 'Library'}</SelectItem>
                            <SelectItem value="sports_hall">{language === 'fr' ? 'Salle de sport' : 'Sports Hall'}</SelectItem>
                            <SelectItem value="workshop">{language === 'fr' ? 'Atelier' : 'Workshop'}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <Label className="text-xs">{language === 'fr' ? 'Capacité' : 'Capacity'}</Label>
                        <Input 
                          type="number"
                          placeholder="30"
                          value={newRoom.capacity}
                          onChange={(e) => setNewRoom({...newRoom, capacity: parseInt(e.target.value) || 30})}
                          min="1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">{language === 'fr' ? 'Bâtiment' : 'Building'}</Label>
                        <Input 
                          placeholder={language === 'fr' ? 'Bât. A' : 'Building A'}
                          value={newRoom.building}
                          onChange={(e) => setNewRoom({...newRoom, building: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">{language === 'fr' ? 'Étage' : 'Floor'}</Label>
                        <Input 
                          placeholder={language === 'fr' ? 'RDC' : 'Ground'}
                          value={newRoom.floor}
                          onChange={(e) => setNewRoom({...newRoom, floor: e.target.value})}
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs">{language === 'fr' ? 'Équipement' : 'Equipment'}</Label>
                      <Input 
                        placeholder={language === 'fr' ? 'Projecteur, Tableau blanc...' : 'Projector, Whiteboard...'}
                        value={newRoom.equipment}
                        onChange={(e) => setNewRoom({...newRoom, equipment: e.target.value})}
                      />
                    </div>
                    <Button 
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      onClick={handleAddRoom}
                      disabled={addRoomMutation.isPending || !newRoom.name.trim()}
                    >
                      {addRoomMutation.isPending ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      ) : (
                        <Plus className="w-4 h-4 mr-2" />
                      )}
                      {language === 'fr' ? 'Ajouter la salle' : 'Add Room'}
                    </Button>
                  </div>
                </Card>

                <Card className="p-4">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    {language === 'fr' ? 'Import Excel' : 'Excel Import'}
                  </h3>
                  <div className="space-y-3">
                    <p className="text-xs text-gray-500 mb-2">
                      {language === 'fr' 
                        ? 'Téléchargez le modèle Excel, remplissez-le avec vos salles (nom, type, capacité, bâtiment, étage, équipement), puis importez-le.'
                        : 'Download the Excel template, fill it with your rooms (name, type, capacity, building, floor, equipment), then import it.'}
                    </p>
                    <ExcelImportButton
                      importType="rooms"
                      schoolId={user?.schoolId}
                      invalidateQueries={['/api/director/rooms']}
                      onImportSuccess={() => {
                        queryClient.invalidateQueries({ queryKey: ['/api/director/rooms'] });
                        toast({
                          title: language === 'fr' ? 'Import réussi' : 'Import successful',
                          description: language === 'fr' ? 'Les salles ont été importées avec succès' : 'Rooms have been imported successfully'
                        });
                      }}
                    />
                  </div>
                </Card>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  <Badge className="bg-green-100 text-green-800">
                    {language === 'fr' 
                      ? `${roomsData.filter((r: any) => !r.isOccupied).length} Salles Libres` 
                      : `${roomsData.filter((r: any) => !r.isOccupied).length} Free Rooms`}
                  </Badge>
                  <Badge className="bg-blue-100 text-blue-800">
                    {language === 'fr' 
                      ? `${roomsData.filter((r: any) => r.isOccupied).length} Salles Occupées` 
                      : `${roomsData.filter((r: any) => r.isOccupied).length} Occupied Rooms`}
                  </Badge>
                  <Badge className="bg-gray-100 text-gray-800">
                    {language === 'fr' 
                      ? `${roomsData.length} Total` 
                      : `${roomsData.length} Total`}
                  </Badge>
                </div>
                <Button variant="outline" onClick={() => setIsRoomManagementOpen(false)}>
                  {language === 'fr' ? 'Fermer' : 'Close'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal de vue de classe détaillée */}
        <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
          <DialogContent className="max-w-[95vw] sm:max-w-4xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Eye className="w-5 h-5" />
                {language === 'fr' ? 'Détails de la Classe' : 'Class Details'}: {selectedClass?.name}
              </DialogTitle>
            </DialogHeader>
            
            {selectedClass && (
              <div className="space-y-6">
                {/* Informations générales */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="p-4">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <School className="w-4 h-4" />
                      {language === 'fr' ? 'Informations Générales' : 'General Information'}
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">{language === 'fr' ? 'Nom' : 'Name'}:</span>
                        <span className="font-medium">{selectedClass.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">{language === 'fr' ? 'Salle' : 'Room'}:</span>
                        <span className="font-medium">{selectedClass.room || language === 'fr' ? 'Non assignée' : 'Not assigned'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">{language === 'fr' ? 'Statut' : 'Status'}:</span>
                        <Badge className={getStatusBadge(selectedClass.status)}>
                          {t.status[selectedClass.status as keyof typeof t.status]}
                        </Badge>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      {language === 'fr' ? 'Effectifs' : 'Enrollment'}
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">{language === 'fr' ? 'Élèves inscrits' : 'Enrolled Students'}:</span>
                        <span className={`font-bold ${getCapacityColor(selectedClass.currentStudents, selectedClass.capacity)}`}>
                          {selectedClass.currentStudents}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">{language === 'fr' ? 'Capacité max' : 'Max Capacity'}:</span>
                        <span className="font-medium">{selectedClass.capacity}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">{language === 'fr' ? 'Places libres' : 'Available Spots'}:</span>
                        <span className="font-medium text-green-600">
                          {Math.max(0, selectedClass.capacity - selectedClass.currentStudents)}
                        </span>
                      </div>
                      <div className="mt-4">
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div 
                            className={`h-3 rounded-full ${
                              (selectedClass.currentStudents / selectedClass.capacity) > 0.9 
                                ? 'bg-red-500' 
                                : (selectedClass.currentStudents / selectedClass.capacity) > 0.7 
                                ? 'bg-yellow-500' 
                                : 'bg-green-500'
                            }`}
                            style={{ 
                              width: `${Math.min(100, (selectedClass.currentStudents / selectedClass.capacity) * 100)}%` 
                            }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {language === 'fr' ? 'Taux d\'occupation' : 'Occupancy Rate'}: {Math.round((selectedClass.currentStudents / selectedClass.capacity) * 100)}%
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Enseignant responsable */}
                <Card className="p-4">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <GraduationCap className="w-4 h-4" />
                    {language === 'fr' ? 'Enseignant Responsable' : 'Class Teacher'}
                  </h3>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <GraduationCap className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium">{selectedClass.teacher || language === 'fr' ? 'Non assigné' : 'Not assigned'}</div>
                      <div className="text-sm text-gray-500">
                        {language === 'fr' ? 'Enseignant principal' : 'Main Teacher'}
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Matières enseignées */}
                {selectedClass.subjects && selectedClass.subjects.length > 0 && (
                  <Card className="p-4">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      {language === 'fr' ? 'Matières Enseignées' : 'Subjects Taught'}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {selectedClass.subjects.map((subject: any, index: number) => (
                        <div key={index} className="p-3 bg-gray-50 rounded-lg border">
                          <div className="font-medium text-sm">{subject.name}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            {language === 'fr' ? 'Coef' : 'Coeff'}: {subject.coefficient || 1} • 
                            {subject.hoursPerWeek || 2}h/{language === 'fr' ? 'sem' : 'week'}
                          </div>
                          <Badge variant="outline" className="mt-2 text-xs">
                            {subject.category === 'general' ? (language === 'fr' ? 'Générale' : 'General') :
                             subject.category === 'scientific' ? (language === 'fr' ? 'Scientifique' : 'Scientific') :
                             subject.category === 'literary' ? (language === 'fr' ? 'Littéraire' : 'Literary') :
                             subject.category === 'professional' ? (language === 'fr' ? 'Professionnel' : 'Professional') :
                             (language === 'fr' ? 'Autre' : 'Other')}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Statistiques rapides */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">{selectedClass.currentStudents || 0}</div>
                    <div className="text-sm text-gray-600">{language === 'fr' ? 'Élèves' : 'Students'}</div>
                  </Card>
                  <Card className="p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">{selectedClass.subjects?.length || 0}</div>
                    <div className="text-sm text-gray-600">{language === 'fr' ? 'Matières' : 'Subjects'}</div>
                  </Card>
                  <Card className="p-4 text-center">
                    <div className="text-2xl font-bold text-purple-600">{selectedClass.capacity || 0}</div>
                    <div className="text-sm text-gray-600">{language === 'fr' ? 'Capacité' : 'Capacity'}</div>
                  </Card>
                </div>

                {/* Actions */}
                <div className="flex justify-between items-center pt-4 border-t">
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => handleEditClass(selectedClass)}
                      className="flex items-center gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      {language === 'fr' ? 'Modifier' : 'Edit'}
                    </Button>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsViewModalOpen(false)}
                  >
                    {language === 'fr' ? 'Fermer' : 'Close'}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <DeleteConfirmationDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={confirmDeleteClass}
          title={language === 'fr' ? 'Supprimer la classe' : 'Delete Class'}
          description={language === 'fr' 
            ? `Êtes-vous sûr de vouloir supprimer la classe "${classToDelete?.name}" ? Cette action est irréversible et supprimera tous les élèves inscrits.`
            : `Are you sure you want to delete the class "${classToDelete?.name}"? This action cannot be undone and will remove all enrolled students.`}
          confirmText={language === 'fr' ? 'Supprimer' : 'Delete'}
          cancelText={language === 'fr' ? 'Annuler' : 'Cancel'}
        />
      </div>
    </div>
  );
};

export default ClassManagement;