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
import { School, UserPlus, Search, Download, Filter, MoreHorizontal, Users, BookOpen, TrendingUp, Calendar, Plus, Edit, Trash2, Eye, Upload, ChevronDown, ChevronUp, Building, GraduationCap, Star } from 'lucide-react';
import { CAMEROON_CURRICULUM_TEMPLATES, getSubjectTemplateByLevel } from '@/data/subjectTemplates';
import MobileActionsOverlay from '@/components/mobile/MobileActionsOverlay';
import ImportModal from '../ImportModal';

const ClassManagement: React.FC = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [newClass, setNewClass] = useState({
    name: '',
    level: '',
    capacity: '',
    teacherId: '',
    teacherName: '',
    room: '',
    subjects: [] as Array<{
      name: string;
      coefficient: number;
      category: 'general' | 'professional' | 'arts' | 'sports';
      hoursPerWeek: number;
      isRequired: boolean;
    }>
  });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isRoomManagementOpen, setIsRoomManagementOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [newRoomName, setNewRoomName] = useState('');
  
  // État pour la gestion des matières
  const [showSubjectSection, setShowSubjectSection] = useState(false);
  const [newSubject, setNewSubject] = useState({
    name: '',
    coefficient: 1,
    category: 'general' as 'general' | 'professional' | 'arts' | 'sports',
    hoursPerWeek: 2,
    isRequired: true
  });
  
  // Ref for triggering dialogs from quick actions
  const createClassTriggerRef = useRef<HTMLButtonElement>(null);

  // Charger template de matières selon le niveau
  const loadSubjectTemplate = () => {
    if (!newClass.level) {
      toast({
        title: "Niveau requis",
        description: "Veuillez d'abord sélectionner un niveau",
        variant: "destructive"
      });
      return;
    }

    let levelKey = newClass.level.toLowerCase();
    if (levelKey === '6ème') levelKey = '6eme';
    if (levelKey === '3ème') levelKey = '3eme';
    if (levelKey.includes('terminale')) {
      levelKey = 'terminale-c'; // Par défaut, peut être étendu
    }

    const template = getSubjectTemplateByLevel(levelKey);
    if (template) {
      setNewClass(prev => ({
        ...prev,
        subjects: template.subjects.map(subject => ({
          name: subject.name,
          coefficient: subject.coefficient,
          category: subject.category,
          hoursPerWeek: subject.hoursPerWeek,
          isRequired: subject.isRequired
        }))
      }));
      
      toast({
        title: "✅ Template chargé",
        description: `${template.subjects.length} matières ajoutées pour ${template.levelName}`,
      });
    } else {
      toast({
        title: "Template non trouvé",
        description: "Pas de template disponible pour ce niveau",
        variant: "destructive"
      });
    }
  };

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
      isRequired: true
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
        level: 'Niveau',
        capacity: 'Capacité',
        teacher: 'Enseignant principal',
        room: 'Salle',
        selectTeacher: 'Sélectionner un enseignant (optionnel)',
        selectLevel: 'Sélectionner un niveau',
        subjects: 'Matières et Coefficients',
        addSubject: 'Ajouter Matière',
        subjectName: 'Nom de la matière',
        coefficient: 'Coefficient',
        category: 'Catégorie',
        hoursPerWeek: 'Heures/semaine',
        required: 'Obligatoire',
        loadTemplate: 'Charger Template Niveau'
      },
      table: {
        name: 'Nom Classe',
        level: 'Niveau',
        students: 'Élèves',
        capacity: 'Capacité',
        teacher: 'Prof Principal',
        status: 'Statut',
        actions: 'Actions'
      },
      status: {
        active: 'Active',
        full: 'Complète',
        closed: 'Fermée'
      },
      levels: {
        all: 'Tous niveaux',
        sil: 'SIL',
        cp: 'CP',
        ce1: 'CE1',
        ce2: 'CE2',
        cm1: 'CM1',
        cm2: 'CM2',
        sixth: '6ème',
        fifth: '5ème',
        fourth: '4ème',
        third: '3ème',
        second: '2nde',
        first: '1ère',
        terminal: 'Terminale'
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
        level: 'Level',
        capacity: 'Capacity',
        teacher: 'Main teacher',
        room: 'Room',
        selectTeacher: 'Select a teacher (optional)',
        selectLevel: 'Select a level',
        subjects: 'Subjects and Coefficients',
        addSubject: 'Add Subject',
        subjectName: 'Subject name',
        coefficient: 'Coefficient',
        category: 'Category',
        hoursPerWeek: 'Hours/week',
        required: 'Required',
        loadTemplate: 'Load Level Template'
      },
      table: {
        name: 'Class Name',
        level: 'Level',
        students: 'Students',
        capacity: 'Capacity',
        teacher: 'Main Teacher',
        status: 'Status',
        actions: 'Actions'
      },
      status: {
        active: 'Active',
        full: 'Full',
        closed: 'Closed'
      },
      levels: {
        all: 'All levels',
        sil: 'SIL',
        cp: 'CP',
        ce1: 'CE1',
        ce2: 'CE2',
        cm1: 'CM1',
        cm2: 'CM2',
        sixth: '6th Grade',
        fifth: '5th Grade',
        fourth: '4th Grade',
        third: '3rd Grade',
        second: '2nd Grade',
        first: '1st Grade',
        terminal: 'Final Year'
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

  // Filter classes based on search and level selection
  const filteredClasses = (Array.isArray(classesData) ? classesData : []).filter((classItem: any) => {
    const matchesSearch = classItem.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         classItem.level?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = selectedLevel === 'all' || classItem.level === selectedLevel;
    return matchesSearch && matchesLevel;
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
      if (!response.ok) throw new Error('Failed to create class');
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
      setNewClass({ name: '', level: '', capacity: '', teacherId: '', teacherName: '', room: '', subjects: [] });
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
      setNewRoomName('');
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
    if (!newRoomName.trim()) {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' ? 'Veuillez saisir un nom de salle.' : 'Please enter a room name.',
        variant: 'destructive'
      });
      return;
    }
    
    console.log('[CLASS_MANAGEMENT] 🏢 Adding new room:', newRoomName);
    addRoomMutation.mutate({ name: newRoomName, capacity: 30 });
  };

  const handleCreateClass = () => {
    if (!newClass.name || !newClass.level || !newClass.capacity) {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' ? 'Veuillez remplir tous les champs obligatoires.' : 'Please fill in all required fields.',
        variant: 'destructive'
      });
      return;
    }
    createClassMutation.mutate(newClass);
  };

  const handleDeleteClass = (classId: number) => {
    if (window.confirm(language === 'fr' ? 'Êtes-vous sûr de vouloir supprimer cette classe ?' : 'Are you sure you want to delete this class?')) {
      deleteClassMutation.mutate(classId);
    }
  };

  const handleEditClass = (classItem: any) => {
    console.log('[CLASS_MANAGEMENT] ✏️ Opening edit modal for class:', classItem.name);
    setSelectedClass({
      id: classItem.id,
      name: classItem.name,
      level: classItem.level,
      capacity: classItem?.capacity?.toString(),
      teacherId: classItem.teacherId || '',
      teacherName: classItem.teacher,
      room: classItem.room
    });
    setShowEditModal(true);
  };

  const handleSaveEditClass = () => {
    if (!selectedClass?.name || !selectedClass?.level || !selectedClass?.capacity) {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' ? 'Veuillez remplir tous les champs obligatoires.' : 'Please fill in all required fields.',
        variant: 'destructive'
      });
      return;
    }
    
    console.log('[CLASS_MANAGEMENT] 💾 Saving class changes:', selectedClass);
    
    // Transform data to match backend API contract
    const classDataForAPI = {
      name: selectedClass.name,
      subject: selectedClass.level, // Backend expects 'subject' field
      room: selectedClass.room,
      maxStudents: parseInt(selectedClass.capacity), // Backend expects 'maxStudents' as number
      schedule: '', // Optional field
      description: `Classe ${String(selectedClass?.name) || "N/A"} - Niveau ${String(selectedClass?.level) || "N/A"}` // Auto-generated description
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
              <DialogContent className="bg-white max-w-md">
                <DialogHeader className="bg-white">
                  <DialogTitle>{String(t?.actions?.addClass) || "N/A"}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 bg-white">
                  <div>
                    <Label>{String(t?.form?.className) || "N/A"}</Label>
                    <Input
                      value={newClass.name}
                      onChange={(e) => setNewClass({...newClass, name: e.target.value})}
                      placeholder="Ex: 6ème A, Terminale C, CP..."
                      className="bg-white border-gray-300"
                    />
                  </div>
                  <div>
                    <Label>{String(t?.form?.level) || "N/A"}</Label>
                    <Select value={String(newClass?.level) || "N/A"} onValueChange={(value) => setNewClass({...newClass, level: value})}>
                      <SelectTrigger className="bg-white border-gray-300">
                        <SelectValue placeholder={String(t?.form?.selectLevel) || "N/A"} />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        {/* Maternelle/Primaire */}
                        <SelectItem value="SIL">SIL (Section d'Initiation au Langage)</SelectItem>
                        <SelectItem value="CP">CP (Cours Préparatoire)</SelectItem>
                        <SelectItem value="CE1">CE1 (Cours Élémentaire 1)</SelectItem>
                        <SelectItem value="CE2">CE2 (Cours Élémentaire 2)</SelectItem>
                        <SelectItem value="CM1">CM1 (Cours Moyen 1)</SelectItem>
                        <SelectItem value="CM2">CM2 (Cours Moyen 2)</SelectItem>
                        {/* Secondaire 1er cycle */}
                        <SelectItem value="6ème">6ème</SelectItem>
                        <SelectItem value="5ème">5ème</SelectItem>
                        <SelectItem value="4ème">4ème</SelectItem>
                        <SelectItem value="3ème">3ème</SelectItem>
                        {/* Secondaire 2nd cycle */}
                        <SelectItem value="2nde">2nde (Seconde)</SelectItem>
                        <SelectItem value="1ère">1ère (Première)</SelectItem>
                        <SelectItem value="Terminale">Terminale</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Section Matières et Coefficients */}
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <Label className="text-lg font-medium flex items-center">
                        <GraduationCap className="w-5 h-5 mr-2 text-blue-600" />
                        {String(t?.form?.subjects) || "Matières et Coefficients"}
                      </Label>
                      <Button
                        type="button"
                        onClick={loadSubjectTemplate}
                        variant="outline"
                        size="sm"
                        className="text-blue-600 border-blue-600 hover:bg-blue-50"
                        disabled={!newClass.level}
                      >
                        <Star className="w-4 h-4 mr-1" />
                        {String(t?.form?.loadTemplate) || "Charger Template"}
                      </Button>
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
                      <div className="flex gap-2">
                        <Select 
                          value={newSubject.category} 
                          onValueChange={(value: 'general' | 'professional' | 'arts' | 'sports') => 
                            setNewSubject(prev => ({ ...prev, category: value }))
                          }
                        >
                          <SelectTrigger className="bg-white text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="general">📚 Général</SelectItem>
                            <SelectItem value="professional">🔧 Professionnel</SelectItem>
                            <SelectItem value="arts">🎨 Arts</SelectItem>
                            <SelectItem value="sports">⚽ Sports</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          type="button"
                          onClick={addSubject}
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <Label>{String(t?.form?.capacity) || "N/A"}</Label>
                    <Input
                      type="number"
                      value={String(newClass?.capacity) || "N/A"}
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
              <DialogContent className="bg-white max-w-md">
                <DialogHeader className="bg-white">
                  <DialogTitle>{String(t?.actions?.edit) || "N/A"} {selectedClass?.name}</DialogTitle>
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
                    <Label>{String(t?.form?.level) || "N/A"}</Label>
                    <Select value={selectedClass?.level || ''} onValueChange={(value) => setSelectedClass({...selectedClass, level: value})}>
                      <SelectTrigger className="bg-white border-gray-300">
                        <SelectValue placeholder={String(t?.form?.selectLevel) || "N/A"} />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectItem value="SIL">{String(t?.levels?.sil) || "N/A"}</SelectItem>
                        <SelectItem value="CP">{String(t?.levels?.cp) || "N/A"}</SelectItem>
                        <SelectItem value="CE1">{String(t?.levels?.ce1) || "N/A"}</SelectItem>
                        <SelectItem value="CE2">{String(t?.levels?.ce2) || "N/A"}</SelectItem>
                        <SelectItem value="CM1">{String(t?.levels?.cm1) || "N/A"}</SelectItem>
                        <SelectItem value="CM2">{String(t?.levels?.cm2) || "N/A"}</SelectItem>
                        <SelectItem value="6ème">{String(t?.levels?.sixth) || "N/A"}</SelectItem>
                        <SelectItem value="5ème">{String(t?.levels?.fifth) || "N/A"}</SelectItem>
                        <SelectItem value="4ème">{String(t?.levels?.fourth) || "N/A"}</SelectItem>
                        <SelectItem value="3ème">{String(t?.levels?.third) || "N/A"}</SelectItem>
                        <SelectItem value="2nde">{String(t?.levels?.second) || "N/A"}</SelectItem>
                        <SelectItem value="1ère">{String(t?.levels?.first) || "N/A"}</SelectItem>
                        <SelectItem value="Terminale">{String(t?.levels?.terminal) || "N/A"}</SelectItem>
                      </SelectContent>
                    </Select>
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
                      ['Nom Classe,Niveau,Élèves,Capacité,Enseignant,Salle,Statut'],
                      ...(Array.isArray(finalClasses) ? finalClasses : []).map((classItem: any) => [
                        classItem.name,
                        classItem.level,
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
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e?.target?.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">{String(t?.levels?.all) || "N/A"}</option>
            <option value="SIL">{String(t?.levels?.sil) || "N/A"}</option>
            <option value="CP">{String(t?.levels?.cp) || "N/A"}</option>
            <option value="CE1">{String(t?.levels?.ce1) || "N/A"}</option>
            <option value="CE2">{String(t?.levels?.ce2) || "N/A"}</option>
            <option value="CM1">{String(t?.levels?.cm1) || "N/A"}</option>
            <option value="CM2">{String(t?.levels?.cm2) || "N/A"}</option>
            <option value="6ème">{String(t?.levels?.sixth) || "N/A"}</option>
            <option value="5ème">{String(t?.levels?.fifth) || "N/A"}</option>
            <option value="4ème">{String(t?.levels?.fourth) || "N/A"}</option>
            <option value="3ème">{String(t?.levels?.third) || "N/A"}</option>
            <option value="2nde">{String(t?.levels?.second) || "N/A"}</option>
            <option value="1ère">{String(t?.levels?.first) || "N/A"}</option>
            <option value="Terminale">{String(t?.levels?.terminal) || "N/A"}</option>
          </select>
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            {String(t?.actions?.filter) || "N/A"}
          </Button>
        </div>
      </Card>

        {/* Classes Table */}
        <Card className="bg-white border-gray-200">
          <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b bg-gray-50">
              <tr>
                <th className="text-left p-4 font-semibold">{String(t?.table?.name) || "N/A"}</th>
                <th className="text-left p-4 font-semibold">{String(t?.table?.level) || "N/A"}</th>
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
                  <td className="p-4">{String(classItem?.level) || "N/A"}</td>
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
                        onClick={() => handleDeleteClass(classItem.id)}
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
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
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

              <Card className="p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  {language === 'fr' ? 'Ajouter une Salle' : 'Add Room'}
                </h3>
                <div className="flex gap-3">
                  <Input 
                    placeholder={language === 'fr' ? 'Nom de la salle (ex: Salle 301)' : 'Room name (ex: Room 301)'}
                    className="flex-1"
                    value={newRoomName}
                    onChange={(e) => setNewRoomName(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleAddRoom();
                      }
                    }}
                  />
                  <Button 
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={handleAddRoom}
                    disabled={addRoomMutation.isPending || !newRoomName.trim()}
                  >
                    {addRoomMutation.isPending ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    ) : (
                      <Plus className="w-4 h-4 mr-2" />
                    )}
                    {language === 'fr' ? 'Ajouter' : 'Add'}
                  </Button>
                </div>
              </Card>

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
      </div>
    </div>
  );
};

export default ClassManagement;