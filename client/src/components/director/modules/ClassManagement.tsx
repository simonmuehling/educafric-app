import React, { useState, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatName } from '@/utils/formatName';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { School, UserPlus, Search, Download, Filter, MoreHorizontal, Users, BookOpen, TrendingUp, Calendar, Plus, Edit, Trash2, Eye, Upload, ChevronDown, ChevronUp, Building, GraduationCap, Star, WifiOff, AlertTriangle } from 'lucide-react';
import MobileActionsOverlay from '@/components/mobile/MobileActionsOverlay';
import ImportModal from '../ImportModal';
import { ExcelImportButton } from '@/components/common/ExcelImportButton';
import DeleteConfirmationDialog from '@/components/ui/DeleteConfirmationDialog';
import { OfflineSyncStatus } from '@/components/offline/OfflineSyncStatus';
import { OfflineDataNotReadyModal, useOfflineDataCheck } from '@/components/offline/OfflineDataNotReadyModal';
import { useOfflineClasses } from '@/hooks/offline/useOfflineClasses';
import { useOfflinePremium } from '@/contexts/offline/OfflinePremiumContext';
import { sortBy } from '@/utils/sort';

const ClassManagement: React.FC = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { isOnline, pendingSyncCount } = useOfflinePremium();
  const { shouldShowModal: showOfflineDataModal } = useOfflineDataCheck();
  const { 
    classes: offlineClasses, 
    loading: offlineLoading,
    createClass: createOfflineClass,
    updateClass: updateOfflineClass,
    deleteClass: deleteOfflineClass
  } = useOfflineClasses();
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
  const [forceDeleteDialogOpen, setForceDeleteDialogOpen] = useState(false);
  const [forceDeleteInfo, setForceDeleteInfo] = useState<{id: number, name: string, studentCount: number, studentNames: string} | null>(null);
  
  // Bulk selection states
  const [selectedClasses, setSelectedClasses] = useState<Set<number>>(new Set());
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  
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
  const [editSubject, setEditSubject] = useState({
    name: '',
    coefficient: 1,
    category: 'general' as 'general' | 'scientific' | 'literary' | 'professional' | 'other',
    hoursPerWeek: 2,
    isRequired: true,
    bulletinSection: undefined as 'general' | 'scientific' | 'professional' | undefined
  });
  const [editingSubjectIndex, setEditingSubjectIndex] = useState<number | null>(null);
  
  // Ref for triggering dialogs from quick actions
  const createClassTriggerRef = useRef<HTMLButtonElement>(null);

  const addSubject = () => {
    if (!newSubject.name.trim()) {
      toast({
        title: language === 'fr' ? "Nom requis" : "Name required",
        description: language === 'fr' ? "Veuillez saisir le nom de la matière" : "Please enter the subject name",
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
      title: language === 'fr' ? "✅ Matière ajoutée" : "✅ Subject added",
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

  const addEditSubject = () => {
    if (!editSubject.name.trim()) {
      toast({
        title: language === 'fr' ? "Nom requis" : "Name required",
        description: language === 'fr' ? "Veuillez saisir le nom de la matière" : "Please enter the subject name",
        variant: "destructive"
      });
      return;
    }

    const newSubjectForBackend = {
      nameFr: editSubject.name,
      nameEn: editSubject.name,
      coefficient: editSubject.coefficient.toString(),
      hoursPerWeek: editSubject.hoursPerWeek,
      category: editSubject.category,
      subjectType: editSubject.category,
      bulletinSection: editSubject.bulletinSection || null,
      isRequired: editSubject.isRequired,
      name: editSubject.name
    };

    console.log('[CLASS_MANAGEMENT] ✅ Adding new subject:', newSubjectForBackend);

    setSelectedClass(prev => {
      const updatedSubjects = [...(prev?.subjects || []), newSubjectForBackend];
      console.log('[CLASS_MANAGEMENT] 📋 Updated subjects array:', updatedSubjects);
      return {
        ...prev,
        subjects: updatedSubjects
      };
    });

    const subjectName = editSubject.name;
    const coefficient = editSubject.coefficient;

    setEditSubject({
      name: '',
      coefficient: 1,
      category: 'general',
      hoursPerWeek: 2,
      isRequired: true,
      bulletinSection: undefined
    });

    toast({
      title: language === 'fr' ? "✅ Matière ajoutée" : "✅ Subject added",
      description: `${subjectName} (coeff. ${coefficient})`,
    });
  };

  const removeEditSubject = (index: number) => {
    setSelectedClass(prev => ({
      ...prev,
      subjects: prev?.subjects?.filter((_, i) => i !== index) || []
    }));
  };

  const startEditingSubject = (index: number) => {
    const subject = selectedClass?.subjects?.[index];
    if (subject) {
      setEditSubject({
        name: subject.name || subject.nameFr || subject.nameEn || '',
        coefficient: Number(subject.coefficient) || 1,
        category: subject.category || 'general',
        hoursPerWeek: Number(subject.hoursPerWeek) || 2,
        isRequired: subject.isRequired !== false,
        bulletinSection: subject.bulletinSection || undefined
      });
      setEditingSubjectIndex(index);
    }
  };

  const cancelEditingSubject = () => {
    setEditingSubjectIndex(null);
    setEditSubject({
      name: '',
      coefficient: 1,
      category: 'general',
      hoursPerWeek: 2,
      isRequired: true,
      bulletinSection: undefined
    });
  };

  const saveEditingSubject = () => {
    if (!editSubject.name.trim()) {
      toast({
        title: language === 'fr' ? "Nom requis" : "Name required",
        description: language === 'fr' ? "Veuillez saisir le nom de la matière" : "Please enter the subject name",
        variant: "destructive"
      });
      return;
    }

    const updatedSubject = {
      nameFr: editSubject.name,
      nameEn: editSubject.name,
      coefficient: editSubject.coefficient.toString(),
      hoursPerWeek: editSubject.hoursPerWeek,
      category: editSubject.category,
      subjectType: editSubject.category,
      bulletinSection: editSubject.bulletinSection || null,
      isRequired: editSubject.isRequired,
      name: editSubject.name
    };

    console.log('[CLASS_MANAGEMENT] ✏️ Updating subject at index:', editingSubjectIndex, updatedSubject);

    setSelectedClass(prev => {
      const updatedSubjects = [...(prev?.subjects || [])];
      if (editingSubjectIndex !== null && editingSubjectIndex < updatedSubjects.length) {
        updatedSubjects[editingSubjectIndex] = { ...updatedSubjects[editingSubjectIndex], ...updatedSubject };
      }
      return { ...prev, subjects: updatedSubjects };
    });

    toast({
      title: language === 'fr' ? "✅ Matière modifiée" : "✅ Subject updated",
      description: `${editSubject.name} (coeff. ${editSubject.coefficient}, ${editSubject.hoursPerWeek}h/sem)`,
    });

    cancelEditingSubject();
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
        teachers: 'Enseignants',
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
        teacher: 'Class Master',
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
        teachers: 'Teachers',
        teacher: 'Class Master',
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

  // Use offline data when not connected, otherwise use server data
  const classesData = !isOnline ? offlineClasses : (classesResponse?.classes || offlineClasses);

  // Fetch total students count
  const { data: studentsResponse = {} } = useQuery({
    queryKey: ['/api/director/students'],
    queryFn: async () => {
      const response = await fetch('/api/director/students', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch students');
      return response.json();
    },
    retry: 2,
    retryDelay: 1000
  });

  const totalStudentsCount = Array.isArray(studentsResponse?.students) ? studentsResponse.students.length : 0;

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

  // Filter classes based on search and sort alphabetically
  const filteredClasses = sortBy(
    (Array.isArray(classesData) ? classesData : []).filter((classItem: any) => {
      const matchesSearch = classItem.name?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    }),
    (c: any) => c.name,
    'text'
  );

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

  const roomsData = sortBy(
    roomsResponse?.rooms || [],
    (r: any) => r.name,
    'text'
  );

  // Add default values for display
  const finalClasses = (Array.isArray(filteredClasses) ? filteredClasses : []).map((classItem: any) => {
    // Normalize subjects for consistency
    const normalizedSubjects = (classItem.subjects || []).map((s: any) => ({
      id: s.id,
      nameFr: s.nameFr || s.name,
      nameEn: s.nameEn || s.name,
      name: s.name || s.nameFr || s.nameEn,
      coefficient: s.coefficient,
      hoursPerWeek: s.hoursPerWeek,
      category: s.category || s.subjectType,
      subjectType: s.subjectType || s.category,
      bulletinSection: s.bulletinSection,
      isRequired: s.isRequired
    }));
    
    // Map teacher ID to teacher name from teachersData
    let teacherName = 'Non assigné';
    if (classItem.teacherId && teachersData.length > 0) {
      const foundTeacher = teachersData.find((t: any) => t.id === classItem.teacherId);
      if (foundTeacher) {
        teacherName = formatName(foundTeacher.firstName, foundTeacher.lastName, language as 'fr' | 'en');
      }
    } else if (classItem.teacherName) {
      teacherName = classItem.teacherName;
    }
    
    return {
      ...classItem,
      subjects: normalizedSubjects,
      currentStudents: classItem.currentStudents || 0,
      capacity: classItem.maxStudents || classItem.capacity || 30,
      teacher: teacherName,
      status: 'active',
      room: classItem.room || 'Non définie'
    };
  });

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

  // Delete class mutation (supports force delete)
  const deleteClassMutation = useMutation({
    mutationFn: async ({ classId, force = false }: { classId: number, force?: boolean }) => {
      const url = force ? `/api/classes/${classId}?force=true` : `/api/classes/${classId}`;
      const response = await fetch(url, {
        method: 'DELETE',
        credentials: 'include'
      });
      const data = await response.json();
      if (!response.ok) {
        throw { ...data, status: response.status };
      }
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/classes'] });
      queryClient.invalidateQueries({ queryKey: ['/api/director/classes'] });
      setDeleteDialogOpen(false);
      setForceDeleteDialogOpen(false);
      setForceDeleteInfo(null);
      toast({
        title: language === 'fr' ? 'Classe supprimée' : 'Class deleted',
        description: data.unenrolledStudents > 0 
          ? (language === 'fr' 
              ? `La classe a été supprimée. ${data.unenrolledStudents} élève(s) ont été désinscrits.` 
              : `Class has been deleted. ${data.unenrolledStudents} student(s) have been unenrolled.`)
          : (language === 'fr' ? 'La classe a été supprimée avec succès.' : 'Class has been deleted successfully.')
      });
    },
    onError: (error: any) => {
      if (error.hasStudents) {
        setDeleteDialogOpen(false);
        setForceDeleteInfo({
          id: classToDelete?.id || 0,
          name: classToDelete?.name || '',
          studentCount: error.studentCount,
          studentNames: error.studentNames
        });
        setForceDeleteDialogOpen(true);
      } else {
        toast({
          title: language === 'fr' ? 'Erreur' : 'Error',
          description: error.message || (language === 'fr' ? 'Impossible de supprimer la classe' : 'Failed to delete class'),
          variant: 'destructive'
        });
      }
    }
  });

  // Bulk delete mutation (supports force delete)
  const bulkDeleteClassesMutation = useMutation({
    mutationFn: async ({ classIds, force = false }: { classIds: number[], force?: boolean }) => {
      const results = await Promise.all(
        classIds.map(async (id) => {
          const url = force ? `/api/classes/${id}?force=true` : `/api/classes/${id}`;
          const res = await fetch(url, {
            method: 'DELETE',
            credentials: 'include'
          });
          const data = await res.json();
          return { id, success: res.ok, data };
        })
      );
      
      const failed = results.filter(r => !r.success);
      const succeeded = results.filter(r => r.success);
      
      if (failed.length > 0 && !force) {
        const hasStudents = failed.some(f => f.data?.hasStudents);
        if (hasStudents) {
          throw { 
            hasStudents: true, 
            failedCount: failed.length,
            succeededCount: succeeded.length,
            failedClasses: failed.map(f => ({ id: f.id, ...f.data }))
          };
        }
      }
      
      return { succeeded: succeeded.length, failed: failed.length };
    },
    onSuccess: (data, { classIds }) => {
      queryClient.invalidateQueries({ queryKey: ['/api/classes'] });
      queryClient.invalidateQueries({ queryKey: ['/api/director/classes'] });
      
      setSelectedClasses(new Set());
      setBulkDeleteDialogOpen(false);
      
      toast({
        title: language === 'fr' ? '✅ Suppression réussie' : '✅ Deletion Successful',
        description: language === 'fr' 
          ? `${data.succeeded} classe(s) supprimée(s) avec succès${data.failed > 0 ? `, ${data.failed} échec(s)` : ''}` 
          : `${data.succeeded} class(es) deleted successfully${data.failed > 0 ? `, ${data.failed} failed` : ''}`
      });
    },
    onError: (error: any) => {
      if (error.hasStudents) {
        toast({
          title: language === 'fr' ? '⚠️ Classes avec élèves' : '⚠️ Classes with students',
          description: language === 'fr' 
            ? `${error.failedCount} classe(s) ont des élèves inscrits. Utilisez la suppression forcée pour les supprimer.`
            : `${error.failedCount} class(es) have enrolled students. Use force delete to remove them.`,
          variant: 'destructive',
          action: (
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={() => {
                const classIds = Array.from(selectedClasses);
                bulkDeleteClassesMutation.mutate({ classIds, force: true });
              }}
            >
              {language === 'fr' ? 'Forcer' : 'Force'}
            </Button>
          )
        });
      } else {
        toast({
          title: language === 'fr' ? '❌ Erreur' : '❌ Error',
          description: language === 'fr' 
            ? 'Impossible de supprimer les classes sélectionnées' 
            : 'Failed to delete selected classes',
          variant: 'destructive'
        });
      }
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
    onSuccess: async (data) => {
      // ✅ IMMEDIATE VISUAL FEEDBACK - Invalidate ALL related queries
      queryClient.invalidateQueries({ 
        predicate: (query) => {
          const key = query.queryKey[0];
          return typeof key === 'string' && (
            key.startsWith('/api/director/classes') ||
            key.startsWith('/api/director/students') ||
            key.startsWith('/api/classes') ||
            key.startsWith('/api/school')
          );
        }
      });
      await queryClient.refetchQueries({ queryKey: ['/api/director/classes'] });
      
      // ✅ UPDATE VIEWING STATE if this class is being viewed
      if (selectedClass && data?.class) {
        setSelectedClass({
          ...selectedClass,
          ...data.class
        });
      }
      
      toast({
        title: language === 'fr' ? 'Classe modifiée' : 'Class updated',
        description: language === 'fr' ? 'La classe a été modifiée avec succès. Tous les modules affectés sont mis à jour.' : 'Class has been updated successfully. All affected modules are updated.'
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

  // Export rooms to Excel
  const [isExportingRooms, setIsExportingRooms] = useState(false);
  
  const exportRoomsToExcel = async () => {
    setIsExportingRooms(true);
    try {
      const XLSX = await import('xlsx');
      
      const roomsExportData = (roomsData || []).map((room: any) => ({
        [language === 'fr' ? 'Nom' : 'Name']: room.name || '',
        [language === 'fr' ? 'Type' : 'Type']: room.type || '',
        [language === 'fr' ? 'Capacité' : 'Capacity']: room.capacity || '',
        [language === 'fr' ? 'Bâtiment' : 'Building']: room.building || '',
        [language === 'fr' ? 'Étage' : 'Floor']: room.floor || '',
        [language === 'fr' ? 'Équipement' : 'Equipment']: room.equipment || '',
        [language === 'fr' ? 'Statut' : 'Status']: room.isOccupied 
          ? (language === 'fr' ? 'Occupée' : 'Occupied')
          : (language === 'fr' ? 'Libre' : 'Free')
      }));

      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(roomsExportData);
      worksheet['!cols'] = [
        { wch: 20 }, { wch: 15 }, { wch: 10 }, { wch: 15 }, { wch: 10 }, { wch: 30 }, { wch: 12 }
      ];
      XLSX.utils.book_append_sheet(workbook, worksheet, language === 'fr' ? 'Salles' : 'Rooms');
      
      const fileName = `salles_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);
      
      toast({
        title: language === 'fr' ? '✅ Export réussi' : '✅ Export successful',
        description: language === 'fr' 
          ? `${roomsExportData.length} salles exportées`
          : `${roomsExportData.length} rooms exported`,
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: language === 'fr' ? '❌ Erreur d\'export' : '❌ Export error',
        description: language === 'fr' ? 'Impossible d\'exporter les données' : 'Unable to export data',
        variant: 'destructive'
      });
    } finally {
      setIsExportingRooms(false);
    }
  };

  const handleCreateClass = async () => {
    if (!newClass.name) {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' ? 'Le nom de la classe est requis.' : 'Class name is required.',
        variant: 'destructive'
      });
      return;
    }
    
    console.log('[CLASS_MANAGEMENT] 🚀 Preparing class creation with data:', newClass);
    
    // Transform data to match backend API contract
    const classDataForAPI = {
      name: newClass.name,
      capacity: newClass.capacity ? parseInt(newClass.capacity) : null,
      level: newClass.name.split(/\s+/)[0] || 'General',
      teacherId: newClass.teacherId ? parseInt(newClass.teacherId) : null,
      room: newClass.room || null,
      subjects: newClass.subjects
    };
    
    // Use offline-first approach: save locally and sync when online
    if (!isOnline) {
      console.log('[CLASS_MANAGEMENT] 📴 Offline mode - creating locally');
      try {
        await createOfflineClass({
          name: classDataForAPI.name,
          level: classDataForAPI.level,
          maxStudents: classDataForAPI.capacity || 30,
          teacherId: classDataForAPI.teacherId || undefined,
          room: classDataForAPI.room || undefined,
          subjects: classDataForAPI.subjects || []
        });
        toast({
          title: language === 'fr' ? '📴 Classe créée localement' : '📴 Class created locally',
          description: language === 'fr' ? 'Sera synchronisée à la reconnexion' : 'Will sync when reconnected'
        });
        setNewClass({ name: '', capacity: '', teacherId: '', teacherName: '', room: '', subjects: [] });
        setShowCreateModal(false);
      } catch (error) {
        console.error('[CLASS_MANAGEMENT] ❌ Offline create error:', error);
        toast({
          title: language === 'fr' ? 'Erreur' : 'Error',
          description: language === 'fr' ? 'Impossible de créer la classe' : 'Failed to create class',
          variant: 'destructive'
        });
      }
    } else {
      console.log('[CLASS_MANAGEMENT] 📤 Online - sending to API:', classDataForAPI);
      createClassMutation.mutate(classDataForAPI);
    }
  };

  const handleDeleteClass = (classId: number, className: string) => {
    setClassToDelete({ id: classId, name: className });
    setDeleteDialogOpen(true);
  };

  const confirmDeleteClass = () => {
    if (classToDelete) {
      deleteClassMutation.mutate({ classId: classToDelete.id, force: false });
    }
  };
  
  const confirmForceDeleteClass = () => {
    if (forceDeleteInfo) {
      deleteClassMutation.mutate({ classId: forceDeleteInfo.id, force: true });
    }
  };

  const handleEditClass = (classItem: any) => {
    console.log('[CLASS_MANAGEMENT] ✏️ Opening edit modal for class:', classItem.name);
    console.log('[CLASS_MANAGEMENT] 📋 Full class data:', classItem);
    
    // Preserve ALL fields from original class to prevent data loss
    setSelectedClass({
      ...classItem, // Start with ALL original fields
      capacity: classItem?.capacity?.toString() || classItem?.maxStudents?.toString() || '',
      teacherId: classItem.teacherId?.toString() || '',
      teacherName: classItem.teacher || '',
      subjects: classItem.subjects || []
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
    
    // Normalize subjects to ensure they have all required fields for backend
    const normalizedSubjects = (selectedClass.subjects || []).map((subject: any) => {
      const name = subject.nameFr || subject.name || subject.nameEn || '';
      return {
        nameFr: subject.nameFr || name,
        nameEn: subject.nameEn || name,
        name: name,
        coefficient: subject.coefficient?.toString ? subject.coefficient.toString() : String(subject.coefficient || 1),
        hoursPerWeek: subject.hoursPerWeek || 2,
        category: subject.category || subject.subjectType || 'general',
        subjectType: subject.category || subject.subjectType || 'general',
        bulletinSection: subject.bulletinSection || null,
        isRequired: subject.isRequired !== undefined ? subject.isRequired : true,
        code: subject.code || null
      };
    });
    
    // Transform data to match backend API contract - preserve ALL fields
    const classDataForAPI = {
      name: selectedClass.name,
      room: selectedClass.room || null,
      maxStudents: selectedClass.capacity ? parseInt(selectedClass.capacity) : (selectedClass.maxStudents || null),
      teacherId: selectedClass.teacherId ? parseInt(selectedClass.teacherId) : null,
      subjects: normalizedSubjects,
      level: selectedClass.level || null,
      section: selectedClass.section || null,
      academicYearId: selectedClass.academicYearId || 1,
      isActive: selectedClass.isActive !== undefined ? selectedClass.isActive : true,
      schedule: selectedClass.schedule || '',
      description: selectedClass.description || `Classe ${selectedClass.name}`
    };
    
    console.log('[CLASS_MANAGEMENT] 📤 Sending edit to API with subjects:', classDataForAPI.subjects);
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

  // Bulk selection handlers
  const toggleSelectClass = (classId: number) => {
    const newSelected = new Set(selectedClasses);
    if (newSelected.has(classId)) {
      newSelected.delete(classId);
    } else {
      newSelected.add(classId);
    }
    setSelectedClasses(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedClasses.size === filteredClasses.length && filteredClasses.length > 0) {
      setSelectedClasses(new Set());
    } else {
      setSelectedClasses(new Set(filteredClasses.map((c: any) => c.id)));
    }
  };

  const handleBulkDelete = () => {
    if (selectedClasses.size > 0) {
      setBulkDeleteDialogOpen(true);
    }
  };

  const confirmBulkDelete = () => {
    bulkDeleteClassesMutation.mutate({ classIds: Array.from(selectedClasses), force: false });
  };
  
  const confirmBulkForceDelete = () => {
    bulkDeleteClassesMutation.mutate({ classIds: Array.from(selectedClasses), force: true });
  };

  // Export classes to Excel
  const [isExporting, setIsExporting] = useState(false);
  
  const exportClassesToExcel = async () => {
    setIsExporting(true);
    try {
      const XLSX = await import('xlsx');
      
      // Prepare classes data
      const classesData = (Array.isArray(finalClasses) ? finalClasses : []).map((classItem: any) => ({
        [language === 'fr' ? 'Nom Classe' : 'Class Name']: classItem.name || '',
        [language === 'fr' ? 'Niveau' : 'Level']: classItem.level || '',
        [language === 'fr' ? 'Élèves Inscrits' : 'Enrolled Students']: classItem.currentStudents || 0,
        [language === 'fr' ? 'Capacité' : 'Capacity']: classItem.capacity || 0,
        [language === 'fr' ? 'Enseignant Principal' : 'Main Teacher']: classItem.teacher || '',
        [language === 'fr' ? 'Salle' : 'Room']: classItem.room || '',
        [language === 'fr' ? 'Statut' : 'Status']: classItem.status === 'active' 
          ? (language === 'fr' ? 'Active' : 'Active')
          : classItem.status === 'full' 
            ? (language === 'fr' ? 'Complet' : 'Full')
            : (language === 'fr' ? 'Inactive' : 'Inactive'),
        [language === 'fr' ? 'Nombre Matières' : 'Subjects Count']: classItem.subjects?.length || 0
      }));

      // Prepare subjects data (all subjects from all classes)
      const subjectsData: any[] = [];
      (Array.isArray(finalClasses) ? finalClasses : []).forEach((classItem: any) => {
        (classItem.subjects || []).forEach((subject: any) => {
          subjectsData.push({
            [language === 'fr' ? 'Classe' : 'Class']: classItem.name || '',
            [language === 'fr' ? 'Matière' : 'Subject']: subject.name || subject.nameFr || subject.nameEn || '',
            [language === 'fr' ? 'Coefficient' : 'Coefficient']: subject.coefficient || 1,
            [language === 'fr' ? 'Heures/Semaine' : 'Hours/Week']: subject.hoursPerWeek || 2,
            [language === 'fr' ? 'Catégorie' : 'Category']: subject.category || 'general',
            [language === 'fr' ? 'Obligatoire' : 'Required']: subject.isRequired !== false 
              ? (language === 'fr' ? 'Oui' : 'Yes') 
              : (language === 'fr' ? 'Non' : 'No')
          });
        });
      });

      // Create workbook
      const workbook = XLSX.utils.book_new();
      
      // Add classes sheet
      const classesSheet = XLSX.utils.json_to_sheet(classesData);
      classesSheet['!cols'] = [
        { wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 12 }, 
        { wch: 25 }, { wch: 15 }, { wch: 12 }, { wch: 15 }
      ];
      XLSX.utils.book_append_sheet(workbook, classesSheet, language === 'fr' ? 'Classes' : 'Classes');
      
      // Add subjects sheet
      if (subjectsData.length > 0) {
        const subjectsSheet = XLSX.utils.json_to_sheet(subjectsData);
        subjectsSheet['!cols'] = [
          { wch: 20 }, { wch: 25 }, { wch: 12 }, { wch: 15 }, { wch: 15 }, { wch: 12 }
        ];
        XLSX.utils.book_append_sheet(workbook, subjectsSheet, language === 'fr' ? 'Matières' : 'Subjects');
      }

      // Download file
      const fileName = `classes_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);
      
      toast({
        title: language === 'fr' ? '✅ Export réussi' : '✅ Export successful',
        description: language === 'fr' 
          ? `${classesData.length} classes et ${subjectsData.length} matières exportées`
          : `${classesData.length} classes and ${subjectsData.length} subjects exported`,
      });
      
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: language === 'fr' ? '❌ Erreur d\'export' : '❌ Export error',
        description: language === 'fr' ? 'Impossible d\'exporter les données' : 'Unable to export data',
        variant: 'destructive'
      });
    } finally {
      setIsExporting(false);
    }
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
      {/* Offline Data Not Ready Modal */}
      <OfflineDataNotReadyModal 
        isOpen={showOfflineDataModal} 
        moduleName={t?.title || 'Gestion des Classes'}
      />
      
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Offline Status Banner */}
        {(!isOnline || pendingSyncCount > 0) && (
          <OfflineSyncStatus showDetails={true} className="mb-4" />
        )}
        
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
                      placeholder={language === 'fr' ? "Ex: 6ème A, Terminale C, CP..." : "Ex: Grade 6A, Senior 3C, CP..."}
                      className="bg-white border-gray-300"
                    />
                  </div>

                  <div>
                    <Label>{String(t?.form?.capacity) || "N/A"}</Label>
                    <Input
                      type="number"
                      value={newClass.capacity}
                      onChange={(e) => setNewClass({...newClass, capacity: e.target.value})}
                      placeholder={language === 'fr' ? "Nombre d'élèves (ex: 30)" : "Number of students (e.g., 30)"}
                      className="bg-white border-gray-300"
                      min="1"
                      max="200"
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
                          {language === 'fr' 
                            ? `${newClass.subjects.length} matière${newClass.subjects.length > 1 ? 's' : ''} configurée${newClass.subjects.length > 1 ? 's' : ''}`
                            : `${newClass.subjects.length} subject${newClass.subjects.length > 1 ? 's' : ''} configured`
                          }
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
                        {String(t?.form?.addSubject) || (language === 'fr' ? "Ajouter Matière" : "Add Subject")}
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
                            placeholder={String(t?.form?.subjectName) || (language === 'fr' ? "Nom matière" : "Subject name")}
                            value={newSubject.name}
                            onChange={(e) => setNewSubject(prev => ({ ...prev, name: e.target.value }))}
                            className="bg-white text-sm"
                          />
                        </div>
                        <div className="flex gap-1">
                          <Input
                            type="number"
                            placeholder={language === 'fr' ? "Coeff" : "Coef"}
                            value={newSubject.coefficient}
                            onChange={(e) => setNewSubject(prev => ({ ...prev, coefficient: parseInt(e.target.value) || 1 }))}
                            className="bg-white text-sm"
                            min="1"
                            max="10"
                          />
                          <Input
                            type="number"
                            placeholder={language === 'fr' ? "H/sem" : "H/wk"}
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
                    <Label>{String(t?.form?.capacity) || (language === 'fr' ? "Capacité" : "Capacity")}</Label>
                    <Input
                      type="number"
                      value={newClass?.capacity || ""}
                      onChange={(e) => setNewClass({...newClass, capacity: e?.target?.value})}
                      placeholder={language === 'fr' ? "Nombre d'élèves (ex: 30)" : "Number of students (e.g., 30)"}
                      min="1"
                      max="999"
                      className="bg-white border-gray-300"
                    />
                  </div>
                  <div>
                    <Label className="flex items-center">
                      {String(t?.form?.teacher) || "N/A"}
                      <span className="ml-1 text-xs text-gray-500">({language === 'fr' ? 'optionnel' : 'optional'})</span>
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
                            ? (language === 'fr' ? "Chargement des enseignants..." : "Loading teachers...")
                            : teachersError 
                              ? (language === 'fr' ? "Erreur de chargement" : "Loading error")
                              : (language === 'fr' ? "Aucun responsable de classe (optionnel)" : "No class master (optional)")
                        } />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectItem value="no-teacher">
                          <div className="flex items-center text-gray-600">
                            <span>❌ {language === 'fr' ? 'Aucun responsable de classe' : 'No class master'}</span>
                          </div>
                        </SelectItem>
                        {isLoadingTeachers ? (
                          <SelectItem value="disabled-option" disabled>
                            {language === 'fr' ? 'Chargement des enseignants...' : 'Loading teachers...'}
                          </SelectItem>
                        ) : teachersError ? (
                          <SelectItem value="disabled-option" disabled>
                            {language === 'fr' ? 'Erreur: Impossible de charger les enseignants' : 'Error: Unable to load teachers'}
                          </SelectItem>
                        ) : teachersData.length === 0 ? (
                          <SelectItem value="disabled-option" disabled>
                            {language === 'fr' ? 'Aucun enseignant trouvé dans cette école' : 'No teachers found in this school'}
                          </SelectItem>
                        ) : (
                          teachersData.map((teacher: any) => (
                            <SelectItem key={String(teacher?.id) || "N/A"} value={teacher?.id?.toString()}>
                              <div className="flex items-center">
                                <span>👨‍🏫 {String(teacher?.firstName) || (language === 'fr' ? "Prénom" : "First")} {String(teacher?.lastName) || (language === 'fr' ? "Nom" : "Last")}</span>
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
                        {language === 'fr' ? 'Erreur: ' : 'Error: '}{teachersError.message}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      💡 {language === 'fr' ? 'Vous pouvez assigner un responsable de classe plus tard' : 'You can assign a class master later'}
                    </p>
                  </div>
                  <div>
                    <Label>{String(t?.form?.room) || (language === 'fr' ? "Salle" : "Room")}</Label>
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
                            ? (language === 'fr' ? "Chargement des salles..." : "Loading rooms...")
                            : roomsData.length === 0 
                              ? (language === 'fr' ? "Aucune salle disponible" : "No rooms available")
                              : (language === 'fr' ? "Sélectionner une salle (optionnel)" : "Select a room (optional)")
                        } />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectItem value="no-room">{language === 'fr' ? 'Aucune salle assignée' : 'No room assigned'}</SelectItem>
                        {isLoadingRooms ? (
                          <SelectItem value="disabled-option" disabled>
                            {language === 'fr' ? 'Chargement des salles...' : 'Loading rooms...'}
                          </SelectItem>
                        ) : roomsData.length === 0 ? (
                          <SelectItem value="disabled-option" disabled>
                            {language === 'fr' ? 'Aucune salle trouvée - Utilisez "Gérer Salles" pour en ajouter' : 'No rooms found - Use "Manage Rooms" to add one'}
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
                      {createClassMutation.isPending ? (language === 'fr' ? 'Création...' : 'Creating...') : t?.actions?.save}
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
              <DialogContent className="bg-white max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
                <DialogHeader className="bg-white sticky top-0 z-10 border-b border-gray-200 pb-4">
                  <DialogTitle className="text-lg sm:text-xl">{String(t?.actions?.edit) || "N/A"} {selectedClass?.name}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 bg-white p-1">
                  <div>
                    <Label>{String(t?.form?.className) || "N/A"}</Label>
                    <Input
                      value={selectedClass?.name || ''}
                      onChange={(e) => setSelectedClass({...selectedClass, name: e?.target?.value})}
                      placeholder={language === 'fr' ? "Ex: 6ème A" : "Ex: Grade 6A"}
                      className="bg-white border-gray-300"
                    />
                  </div>
                  <div>
                    <Label>{String(t?.form?.capacity) || (language === 'fr' ? "Capacité" : "Capacity")}</Label>
                    <Input
                      type="number"
                      value={selectedClass?.capacity || ''}
                      onChange={(e) => setSelectedClass({...selectedClass, capacity: e?.target?.value})}
                      placeholder={language === 'fr' ? "Nombre d'élèves (ex: 30)" : "Number of students (e.g., 30)"}
                      min="1"
                      max="999"
                      className="bg-white border-gray-300"
                    />
                  </div>

                  {/* Subjects Section in Edit Modal */}
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <Label className="text-lg font-medium flex items-center">
                        <GraduationCap className="w-5 h-5 mr-2 text-blue-600" />
                        {String(t?.form?.subjects) || "Matières et Coefficients"}
                      </Label>
                    </div>
                    
                    {/* Liste des matières existantes */}
                    {selectedClass?.subjects && selectedClass.subjects.length > 0 && (
                      <div className="space-y-2 mb-4">
                        <div className="text-sm text-gray-600">
                          {language === 'fr' 
                            ? `${selectedClass.subjects.length} matière${selectedClass.subjects.length > 1 ? 's' : ''} configurée${selectedClass.subjects.length > 1 ? 's' : ''}`
                            : `${selectedClass.subjects.length} subject${selectedClass.subjects.length > 1 ? 's' : ''} configured`
                          }
                        </div>
                        <div className="max-h-40 overflow-y-auto space-y-1">
                          {selectedClass.subjects.map((subject, index) => (
                            <div key={index} className={`flex items-center justify-between p-2 rounded-md ${editingSubjectIndex === index ? 'bg-amber-100 border-2 border-amber-400' : 'bg-gray-50'}`}>
                              <div className="flex-1">
                                <span className="font-medium text-sm">{subject.name || subject.nameFr || subject.nameEn || 'N/A'}</span>
                                <div className="text-xs text-gray-500">
                                  Coeff. {subject.coefficient || 1} • {subject.hoursPerWeek || 2}h/sem • {subject.category || 'general'}
                                  {isTechnicalSchool && subject.bulletinSection && (
                                    <span className="ml-2 text-blue-600 font-medium">
                                      → {language === 'fr' ? 'Bulletin' : 'Report'}: {subject.bulletinSection}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex gap-1">
                                <Button
                                  type="button"
                                  onClick={() => startEditingSubject(index)}
                                  variant="ghost"
                                  size="sm"
                                  className="text-amber-600 hover:bg-amber-50"
                                  data-testid={`button-edit-subject-${index}`}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  type="button"
                                  onClick={() => removeEditSubject(index)}
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-600 hover:bg-red-50"
                                  data-testid={`button-delete-subject-${index}`}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Formulaire ajout/modification de matière */}
                    <div className={`border rounded-md p-3 ${editingSubjectIndex !== null ? 'bg-amber-50 border-amber-300' : 'bg-blue-50'}`}>
                      <div className={`text-sm font-medium mb-2 ${editingSubjectIndex !== null ? 'text-amber-800' : 'text-blue-800'}`}>
                        {editingSubjectIndex !== null 
                          ? (language === 'fr' ? "✏️ Modifier Matière" : "✏️ Edit Subject")
                          : (String(t?.form?.addSubject) || (language === 'fr' ? "Ajouter Matière" : "Add Subject"))
                        }
                      </div>
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        <div>
                          <Input
                            placeholder={String(t?.form?.subjectName) || (language === 'fr' ? "Nom matière" : "Subject name")}
                            value={editSubject.name}
                            onChange={(e) => setEditSubject(prev => ({ ...prev, name: e.target.value }))}
                            className="bg-white text-sm"
                            data-testid="input-subject-name"
                          />
                        </div>
                        <div className="flex gap-1">
                          <Input
                            type="number"
                            placeholder={language === 'fr' ? "Coeff" : "Coef"}
                            value={editSubject.coefficient}
                            onChange={(e) => setEditSubject(prev => ({ ...prev, coefficient: parseInt(e.target.value) || 1 }))}
                            className="bg-white text-sm"
                            min="1"
                            max="10"
                            data-testid="input-subject-coefficient"
                          />
                          <Input
                            type="number"
                            placeholder={language === 'fr' ? "H/sem" : "H/wk"}
                            value={editSubject.hoursPerWeek}
                            onChange={(e) => setEditSubject(prev => ({ ...prev, hoursPerWeek: parseInt(e.target.value) || 1 }))}
                            className="bg-white text-sm"
                            min="1"
                            max="15"
                            data-testid="input-subject-hours"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2 mb-2">
                        <Select 
                          value={editSubject.category} 
                          onValueChange={(value: 'general' | 'scientific' | 'literary' | 'professional' | 'other') => 
                            setEditSubject(prev => ({ ...prev, category: value }))
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
                      <div className="flex gap-2">
                        {editingSubjectIndex !== null ? (
                          <>
                            <Button
                              type="button"
                              onClick={saveEditingSubject}
                              size="sm"
                              className="bg-amber-600 hover:bg-amber-700 text-white flex-1"
                              data-testid="button-save-subject"
                            >
                              <Edit className="w-4 h-4 mr-1" />
                              {language === 'fr' ? 'Sauvegarder' : 'Save'}
                            </Button>
                            <Button
                              type="button"
                              onClick={cancelEditingSubject}
                              size="sm"
                              variant="outline"
                              className="flex-1"
                              data-testid="button-cancel-edit-subject"
                            >
                              {language === 'fr' ? 'Annuler' : 'Cancel'}
                            </Button>
                          </>
                        ) : (
                          <Button
                            type="button"
                            onClick={addEditSubject}
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700 text-white flex-1"
                            data-testid="button-add-subject"
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            {language === 'fr' ? 'Ajouter' : 'Add'}
                          </Button>
                        )}
                      </div>
                    </div>
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
                            ? (language === 'fr' ? "Chargement des enseignants..." : "Loading teachers...")
                            : teachersError 
                              ? (language === 'fr' ? "Erreur de chargement" : "Loading error")
                              : teachersData.length === 0 
                                ? (language === 'fr' ? "Aucun enseignant disponible" : "No teachers available")
                                : String(t?.form?.selectTeacher) || "Sélectionner un enseignant"
                        } />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        {isLoadingTeachers ? (
                          <SelectItem value="disabled-option" disabled>
                            {language === 'fr' ? 'Chargement des enseignants...' : 'Loading teachers...'}
                          </SelectItem>
                        ) : teachersError ? (
                          <SelectItem value="disabled-option" disabled>
                            {language === 'fr' ? 'Erreur: Impossible de charger les enseignants' : 'Error: Unable to load teachers'}
                          </SelectItem>
                        ) : teachersData.length === 0 ? (
                          <SelectItem value="disabled-option" disabled>
                            {language === 'fr' ? 'Aucun enseignant trouvé dans cette école' : 'No teachers found in this school'}
                          </SelectItem>
                        ) : (
                          teachersData.map((teacher: any) => (
                            <SelectItem key={String(teacher?.id) || "N/A"} value={teacher?.id?.toString()}>
                              {String(teacher?.firstName) || (language === 'fr' ? "Prénom" : "First")} {String(teacher?.lastName) || (language === 'fr' ? "Nom" : "Last")}
                              {teacher.subjects && teacher.subjects.length > 0 && ` (${teacher?.subjects?.join(', ')})`}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    {teachersError && (
                      <p className="text-sm text-red-600 mt-1">
                        {language === 'fr' ? 'Erreur: ' : 'Error: '}{teachersError.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label>{String(t?.form?.room) || (language === 'fr' ? "Salle" : "Room")}</Label>
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
                      {editClassMutation.isPending ? (language === 'fr' ? 'Modification...' : 'Updating...') : t?.actions?.save}
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
            <Button 
              variant="outline" 
              onClick={exportClassesToExcel}
              disabled={isExporting}
              data-testid="button-export-classes"
            >
              <Download className={`w-4 h-4 mr-2 ${isExporting ? 'animate-spin' : ''}`} />
              {isExporting 
                ? (language === 'fr' ? 'Export...' : 'Exporting...') 
                : (String(t?.actions?.export) || "Exporter")}
            </Button>
          </div>
          </div>
        </Card>

        {/* Offline Status Banner */}
        {(!isOnline || pendingSyncCount > 0) && (
          <OfflineSyncStatus showDetails={true} className="mb-4" />
        )}

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
          {/* Bulk actions */}
          {selectedClasses.size > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                {selectedClasses.size} {language === 'fr' ? 'sélectionnée(s)' : 'selected'}
              </span>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDelete}
                className="bg-red-600 hover:bg-red-700"
                data-testid="button-bulk-delete-classes"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {language === 'fr' ? 'Supprimer' : 'Delete'}
              </Button>
            </div>
          )}
        </div>
      </Card>

        {/* Classes Table */}
        <Card className="bg-white border-gray-200">
          <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b bg-gray-50">
              <tr>
                <th className="text-left p-4 w-12">
                  <Checkbox
                    checked={selectedClasses.size === filteredClasses.length && filteredClasses.length > 0}
                    onCheckedChange={toggleSelectAll}
                    data-testid="checkbox-select-all-classes"
                  />
                </th>
                <th className="text-left p-4 font-semibold">{String(t?.table?.name) || "N/A"}</th>
                <th className="text-left p-4 font-semibold">{String(t?.table?.students) || "N/A"}</th>
                <th className="text-left p-4 font-semibold">{String(t?.table?.capacity) || "N/A"}</th>
                <th className="text-left p-4 font-semibold">{String(t?.table?.teachers) || "N/A"}</th>
                <th className="text-left p-4 font-semibold">{String(t?.table?.teacher) || "N/A"}</th>
                <th className="text-left p-4 font-semibold">{String(t?.table?.status) || "N/A"}</th>
                <th className="text-left p-4 font-semibold hidden md:table-cell">{String(t?.table?.actions) || "N/A"}</th>
              </tr>
            </thead>
            <tbody>
              {(Array.isArray(finalClasses) ? finalClasses : []).map((classItem: any) => (
                <tr key={String(classItem?.id) || "N/A"} className="border-b hover:bg-gray-50">
                  <td className="p-4">
                    <Checkbox
                      checked={selectedClasses.has(classItem.id)}
                      onCheckedChange={() => toggleSelectClass(classItem.id)}
                      data-testid={`checkbox-class-${classItem.id}`}
                    />
                  </td>
                  <td className="p-4">
                    <div>
                      <div className="font-medium">{String(classItem?.name) || "N/A"}</div>
                      <div className="text-sm text-gray-500">{String(classItem?.room) || "N/A"}</div>
                      {/* Mobile action buttons - shown on small screens directly under name */}
                      <div className="flex gap-1 mt-2 md:hidden">
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
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`font-semibold ${getCapacityColor(classItem.currentStudents, classItem.capacity)}`}>
                      {String(classItem?.currentStudents) || "0"}
                    </span>
                  </td>
                  <td className="p-4">{String(classItem?.capacity) || "N/A"}</td>
                  <td className="p-4">
                    {(() => {
                      // Use teacherCount from API if available, otherwise calculate from teachersData
                      if (classItem.teacherCount !== undefined) {
                        return String(classItem.teacherCount);
                      }
                      const classTeachers = (teachersData || []).filter((t: any) => t.classes?.includes(classItem.name) || (t.className === classItem.name));
                      return String(classTeachers.length || 0);
                    })()}
                  </td>
                  <td className="p-4">{String(classItem?.teacher) || "Non assigné"}</td>
                  <td className="p-4">
                    <Badge className={getStatusBadge(classItem.status)}>
                      {t.status[classItem.status as keyof typeof t.status]}
                    </Badge>
                  </td>
                  {/* Desktop action buttons - hidden on small screens */}
                  <td className="p-4 hidden md:table-cell">
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
                <div className="flex gap-2">
                  <Button 
                    variant="outline"
                    onClick={exportRoomsToExcel}
                    disabled={isExportingRooms || roomsData.length === 0}
                    data-testid="button-export-rooms"
                  >
                    <Download className={`w-4 h-4 mr-2 ${isExportingRooms ? 'animate-spin' : ''}`} />
                    {isExportingRooms 
                      ? (language === 'fr' ? 'Export...' : 'Exporting...') 
                      : (language === 'fr' ? 'Exporter' : 'Export')}
                  </Button>
                  <Button variant="outline" onClick={() => setIsRoomManagementOpen(false)}>
                    {language === 'fr' ? 'Fermer' : 'Close'}
                  </Button>
                </div>
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

        {/* Bulk Delete Confirmation Dialog */}
        <DeleteConfirmationDialog
          open={bulkDeleteDialogOpen}
          onOpenChange={setBulkDeleteDialogOpen}
          onConfirm={confirmBulkDelete}
          title={language === 'fr' ? 'Supprimer les classes sélectionnées' : 'Delete Selected Classes'}
          description={language === 'fr' 
            ? `Êtes-vous sûr de vouloir supprimer ${selectedClasses.size} classe(s) sélectionnée(s) ? Cette action est irréversible et supprimera tous les élèves inscrits dans ces classes.`
            : `Are you sure you want to delete ${selectedClasses.size} selected class(es)? This action cannot be undone and will remove all enrolled students from these classes.`}
          confirmText={language === 'fr' ? 'Supprimer' : 'Delete'}
          cancelText={language === 'fr' ? 'Annuler' : 'Cancel'}
        />

        {/* Force Delete Confirmation Dialog - for classes with enrolled students */}
        <Dialog open={forceDeleteDialogOpen} onOpenChange={setForceDeleteDialogOpen}>
          <DialogContent className="bg-white max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="w-5 h-5" />
                {language === 'fr' ? 'Classe avec élèves inscrits' : 'Class with enrolled students'}
              </DialogTitle>
              <DialogDescription className="text-left">
                {language === 'fr' 
                  ? `La classe "${forceDeleteInfo?.name}" contient ${forceDeleteInfo?.studentCount} élève(s) inscrit(s):`
                  : `The class "${forceDeleteInfo?.name}" has ${forceDeleteInfo?.studentCount} enrolled student(s):`}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm text-gray-600 mb-4 font-medium">
                {forceDeleteInfo?.studentNames}
              </p>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-sm text-amber-800">
                  {language === 'fr' 
                    ? '⚠️ La suppression forcée va désinscrire tous ces élèves de la classe. Ils devront être réassignés à une autre classe.'
                    : '⚠️ Force delete will unenroll all these students from the class. They will need to be reassigned to another class.'}
                </p>
              </div>
            </div>
            <DialogFooter className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setForceDeleteDialogOpen(false);
                  setForceDeleteInfo(null);
                }}
              >
                {language === 'fr' ? 'Annuler' : 'Cancel'}
              </Button>
              <Button 
                variant="destructive" 
                onClick={confirmForceDeleteClass}
                disabled={deleteClassMutation.isPending}
              >
                {deleteClassMutation.isPending 
                  ? (language === 'fr' ? 'Suppression...' : 'Deleting...') 
                  : (language === 'fr' ? 'Supprimer quand même' : 'Delete anyway')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default ClassManagement;