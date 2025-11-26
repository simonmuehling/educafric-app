import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Users, UserPlus, Search, Download, Filter, MoreHorizontal, 
  BookOpen, TrendingUp, Calendar, Plus, Edit, Trash2, 
  Eye, X, Mail, Phone, GraduationCap, UserCheck, Upload, Camera
} from 'lucide-react';
import ImportModal from '../ImportModal';
import { ExcelImportButton } from '@/components/common/ExcelImportButton';
import DeleteConfirmationDialog from '@/components/ui/DeleteConfirmationDialog';
import { OfflineSyncStatus } from '@/components/offline/OfflineSyncStatus';
import { OfflineDataNotReadyModal, useOfflineDataCheck } from '@/components/offline/OfflineDataNotReadyModal';
import { useOfflinePremium } from '@/contexts/offline/OfflinePremiumContext';
import { sortBy, sortStrings } from '@/utils/sort';

interface Teacher {
  id: number;
  name: string;
  email: string;
  phone: string;
  gender?: string;
  matricule?: string;
  teachingSubjects?: string[];
  subjects?: string[]; // Keep for backward compatibility
  classes: string[];
  status: 'active' | 'inactive' | 'on_leave';
  schedule?: string;
  experience?: number; // Keep for display compatibility
  qualification?: string; // Keep for display compatibility
  salary?: number; // Keep for display compatibility
}

const FunctionalDirectorTeacherManagement: React.FC = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Offline-first hooks
  const { isOnline, pendingSyncCount } = useOfflinePremium();
  const { shouldShowModal: showOfflineDataModal } = useOfflineDataCheck();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [isAddTeacherOpen, setIsAddTeacherOpen] = useState(false);
  const [isEditTeacherOpen, setIsEditTeacherOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    gender: 'all',
    subject: 'all',
    experience: 'all'
  });
  const [isViewTeacherOpen, setIsViewTeacherOpen] = useState(false);
  const [viewingTeacher, setViewingTeacher] = useState<Teacher | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState<number | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [teacherToDelete, setTeacherToDelete] = useState<{id: number, name: string} | null>(null);
  
  // Bulk selection states
  const [selectedTeachers, setSelectedTeachers] = useState<Set<number>>(new Set());
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  
  const [teacherForm, setTeacherForm] = useState({
    name: '',
    email: '',
    phone: '',
    gender: '',
    matricule: '',
    teachingSubjects: '',
    classes: '',
    schedule: '',
    selectedClasses: [] as string[]
  });

  // Fetch classes data for dropdown
  const { data: classesResponse = {}, isLoading: isLoadingClasses } = useQuery({
    queryKey: ['/api/director/classes'],
    enabled: !!user,
    queryFn: async () => {
      console.log('[TEACHER_MANAGEMENT] 🔍 Fetching classes for teacher assignment...');
      const response = await fetch('/api/director/classes', {
        credentials: 'include'
      });
      if (!response.ok) {
        console.error('[TEACHER_MANAGEMENT] ❌ Failed to fetch classes:', response.status);
        throw new Error('Failed to fetch classes');
      }
      const data = await response.json();
      console.log('[TEACHER_MANAGEMENT] ✅ Classes fetched:', data?.classes?.length || 0, 'classes');
      console.log('[TEACHER_MANAGEMENT] 📊 Classes with subjects details:', data?.classes?.map((c: any) => ({
        name: c.name,
        subjectsCount: c.subjects?.length || 0,
        subjects: c.subjects?.map((s: any) => s.name)
      })));
      return data;
    },
    retry: 2,
    retryDelay: 1000
  });

  const availableClasses = classesResponse?.classes || [];

  // Function to get subjects from selected classes
  const getAvailableSubjects = () => {
    if (!teacherForm.selectedClasses.length) {
      return []; // No subjects if no classes selected
    }
    
    const subjects = new Set<string>();
    teacherForm.selectedClasses.forEach(className => {
      const classData = availableClasses.find((c: any) => c.name === className);
      console.log('[TEACHER_MANAGEMENT] 🔍 Class data for', className, ':', classData);
      if (classData?.subjects) {
        console.log('[TEACHER_MANAGEMENT] 📚 Subjects found:', classData.subjects);
        classData.subjects.forEach((subject: any) => {
          subjects.add(subject.name);
        });
      } else {
        console.log('[TEACHER_MANAGEMENT] ⚠️ No subjects found for class:', className);
      }
    });
    
    console.log('[TEACHER_MANAGEMENT] 📋 Final subjects list:', Array.from(subjects));
    return Array.from(subjects);
  };

  // Fetch teachers data from PostgreSQL API
  const { data: teachersData, isLoading } = useQuery({
    queryKey: ['/api/director/teachers'],
    enabled: !!user,
    queryFn: async () => {
      const response = await fetch('/api/director/teachers', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch teachers');
      const data = await response.json();
      console.log('[TEACHERS_DEBUG] API Response:', data);
      return data;
    }
  });

  // Extract teachers array from API response
  const teachers = teachersData?.teachers || teachersData || [];

  // Export function
  const handleExportTeachers = () => {
    if (!teachers || teachers.length === 0) {
      toast({
        title: language === 'fr' ? 'Aucune donnée à exporter' : 'No data to export',
        description: language === 'fr' ? 'Ajoutez des enseignants avant d\'exporter' : 'Add teachers before exporting',
        variant: 'destructive'
      });
      return;
    }

    const csvHeaders = language === 'fr' ? 
      'Nom,Email,Téléphone,Matières,Classes,Genre' :
      'Name,Email,Phone,Subjects,Classes,Gender';
    
    const csvData = teachers.map(teacher => 
      `"${teacher.firstName} ${teacher.lastName}","${teacher.email}","${teacher.phone}","${teacher.teachingSubjects}","${teacher.classes}","${teacher.gender}"`
    ).join('\n');
    
    const csv = `${csvHeaders}\n${csvData}`;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `enseignants_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    
    toast({
      title: language === 'fr' ? '📊 Export réussi !' : '📊 Export Successful!',
      description: language === 'fr' ? 'Liste des enseignants exportée' : 'Teacher list exported'
    });
  };

  // Create teacher mutation
  const createTeacherMutation = useMutation({
    mutationFn: async (teacherData: any) => {
      const response = await fetch('/api/director/teachers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(teacherData),
        credentials: 'include'
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        // Return specific error for better handling
        throw { status: response.status, data };
      }
      
      return data;
    },
    onSuccess: (newTeacher) => {
      // ✅ IMMEDIATE VISUAL FEEDBACK - User sees the new teacher
      queryClient.invalidateQueries({ queryKey: ['/api/director/teachers'] });
      queryClient.refetchQueries({ queryKey: ['/api/director/teachers'] });
      
      setIsAddTeacherOpen(false);
      const teacherName = teacherForm.name || 'Le nouvel enseignant';
      setTeacherForm({ name: '', email: '', phone: '', gender: '', matricule: '', teachingSubjects: '', classes: '', schedule: '', selectedClasses: [] });
      
      toast({
        title: language === 'fr' ? '✅ Enseignant ajouté avec succès' : '✅ Teacher Added Successfully',
        description: language === 'fr' ? `${teacherName} a été ajouté à votre équipe pédagogique et apparaît maintenant dans la liste.` : `${teacherName} has been added to your teaching staff and now appears in the list.`
      });
      
      // Scroll to show the new teacher
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    },
    onError: (error: any) => {
      console.error('[FRONTEND] Teacher creation error:', error);
      
      // Handle specific error types
      const errorType = error?.data?.errorType;
      const errorMessage = error?.data?.message;
      
      if (errorType === 'DUPLICATE_EMAIL') {
        toast({
          title: language === 'fr' ? '❌ Email déjà utilisé' : '❌ Email Already Used',
          description: language === 'fr' ? 'Cet email est déjà associé à un autre utilisateur. Veuillez utiliser un email différent ou créer l\'enseignant avec uniquement le numéro de téléphone.' : 'This email is already associated with another user. Please use a different email or create the teacher with only the phone number.',
          variant: 'destructive'
        });
      } else if (errorType === 'DUPLICATE_PHONE') {
        toast({
          title: language === 'fr' ? '❌ Téléphone déjà utilisé' : '❌ Phone Already Used',
          description: language === 'fr' ? 'Ce numéro de téléphone est déjà associé à un autre utilisateur. Veuillez utiliser un numéro différent.' : 'This phone number is already associated with another user. Please use a different number.',
          variant: 'destructive'
        });
      } else if (errorType === 'MISSING_CONTACT') {
        toast({
          title: language === 'fr' ? '❌ Informations de contact manquantes' : '❌ Missing Contact Information',
          description: language === 'fr' ? 'Au moins un email ou un numéro de téléphone est requis.' : 'At least one email or phone number is required.',
          variant: 'destructive'
        });
      } else if (errorType === 'MISSING_NAME') {
        toast({
          title: language === 'fr' ? '❌ Nom manquant' : '❌ Missing Name',
          description: language === 'fr' ? 'Le nom complet est requis.' : 'Full name is required.',
          variant: 'destructive'
        });
      } else {
        toast({
          title: language === 'fr' ? '❌ Erreur' : '❌ Error',
          description: errorMessage || (language === 'fr' ? 'Impossible d\'ajouter l\'enseignant. Veuillez vérifier les informations et réessayer.' : 'Unable to add teacher. Please check the information and try again.'),
          variant: 'destructive'
        });
      }
    }
  });

  // Update teacher mutation
  const updateTeacherMutation = useMutation({
    mutationFn: async (teacherData: any) => {
      const response = await fetch(`/api/director/teachers/${teacherData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(teacherData),
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to update teacher');
      return response.json();
    },
    onSuccess: () => {
      // ✅ IMMEDIATE VISUAL FEEDBACK - User sees updated teacher
      queryClient.invalidateQueries({ queryKey: ['/api/director/teachers'] });
      queryClient.refetchQueries({ queryKey: ['/api/director/teachers'] });
      
      setIsEditTeacherOpen(false);
      const editedTeacherName = selectedTeacher ? selectedTeacher.name : 'L\'enseignant';
      setSelectedTeacher(null);
      
      toast({
        title: language === 'fr' ? 'Enseignant modifié' : 'Teacher Updated',
        description: language === 'fr' ? 'L\'enseignant a été modifié avec succès.' : 'Teacher updated successfully.'
      });
    },
    onError: () => {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' ? 'Impossible de modifier l\'enseignant.' : 'Unable to update teacher.',
        variant: 'destructive'
      });
    }
  });

  // Delete teacher mutation
  const deleteTeacherMutation = useMutation({
    mutationFn: async (teacherId: number) => {
      const response = await fetch(`/api/director/teachers/${teacherId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to delete teacher');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/director/teachers'] });
      toast({
        title: language === 'fr' ? 'Enseignant supprimé' : 'Teacher Deleted',
        description: language === 'fr' ? 'L\'enseignant a été supprimé avec succès.' : 'Teacher deleted successfully.'
      });
    },
    onError: () => {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' ? 'Impossible de supprimer l\'enseignant.' : 'Unable to delete teacher.',
        variant: 'destructive'
      });
    }
  });

  // Bulk delete mutation
  const bulkDeleteTeachersMutation = useMutation({
    mutationFn: async (teacherIds: number[]) => {
      const responses = await Promise.all(
        teacherIds.map(id => 
          fetch(`/api/director/teachers/${id}`, {
            method: 'DELETE',
            credentials: 'include'
          }).then(res => {
            if (!res.ok) throw new Error(`Failed to delete teacher ${id}`);
            return res.json();
          })
        )
      );
      return responses;
    },
    onSuccess: (_, teacherIds) => {
      queryClient.invalidateQueries({ queryKey: ['/api/director/teachers'] });
      queryClient.refetchQueries({ queryKey: ['/api/director/teachers'] });
      
      setSelectedTeachers(new Set());
      setBulkDeleteDialogOpen(false);
      
      toast({
        title: language === 'fr' ? '✅ Suppression réussie' : '✅ Deletion Successful',
        description: language === 'fr' 
          ? `${teacherIds.length} enseignant(s) supprimé(s) avec succès` 
          : `${teacherIds.length} teacher(s) deleted successfully`
      });
    },
    onError: () => {
      toast({
        title: language === 'fr' ? '❌ Erreur' : '❌ Error',
        description: language === 'fr' 
          ? 'Impossible de supprimer les enseignants sélectionnés' 
          : 'Failed to delete selected teachers',
        variant: 'destructive'
      });
    }
  });

  const handleCreateTeacher = () => {
    // Validate: At least name is required
    if (!teacherForm.name || !teacherForm.name.trim()) {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' ? 'Le nom est requis' : 'Name is required',
        variant: 'destructive'
      });
      return;
    }
    
    // Validate: At least email OR phone must be provided
    if (!teacherForm.email && !teacherForm.phone) {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' ? 'Au moins un email ou un numéro de téléphone est requis' : 'At least email or phone number is required',
        variant: 'destructive'
      });
      return;
    }
    
    const teacherData = {
      name: teacherForm.name, // Send as single name field for backend to split
      email: teacherForm.email || null,
      phone: teacherForm.phone || null,
      gender: teacherForm.gender,
      matricule: teacherForm.matricule,
      teachingSubjects: teacherForm.teachingSubjects.split(',').map(s => s.trim()).filter(s => s),
      classes: teacherForm.selectedClasses
    };
    
    console.log('[FRONTEND] Creating teacher with data:', teacherData);
    createTeacherMutation.mutate(teacherData);
  };

  const handleUpdateTeacher = () => {
    if (selectedTeacher) {
      const updateData = {
        id: selectedTeacher.id,
        name: teacherForm.name,
        email: teacherForm.email,
        phone: teacherForm.phone,
        gender: teacherForm.gender,
        matricule: teacherForm.matricule,
        teachingSubjects: teacherForm.teachingSubjects.split(',').map(s => s.trim()).filter(s => s),
        classes: teacherForm.selectedClasses,
        schedule: teacherForm.schedule
      };
      
      console.log('[FRONTEND] Updating teacher with data:', updateData);
      updateTeacherMutation.mutate(updateData);
    }
  };

  const handleEditTeacher = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setTeacherForm({
      name: teacher.name,
      email: teacher.email,
      phone: teacher.phone,
      teachingSubjects: teacher.teachingSubjects ? teacher.teachingSubjects.join(', ') : '',
      classes: teacher.classes ? teacher.classes.join(', ') : '',
      gender: teacher.gender || '',
      matricule: teacher.matricule || '',
      schedule: teacher.schedule || '',
      selectedClasses: teacher.classes || []
    });
    setIsEditTeacherOpen(true);
  };

  const handleDeleteTeacher = (teacherId: number, teacherName: string) => {
    setTeacherToDelete({ id: teacherId, name: teacherName });
    setDeleteDialogOpen(true);
  };

  const confirmDeleteTeacher = () => {
    if (teacherToDelete) {
      deleteTeacherMutation.mutate(teacherToDelete.id);
      setTeacherToDelete(null);
    }
  };

  // Bulk selection handlers
  const toggleSelectTeacher = (teacherId: number) => {
    const newSelected = new Set(selectedTeachers);
    if (newSelected.has(teacherId)) {
      newSelected.delete(teacherId);
    } else {
      newSelected.add(teacherId);
    }
    setSelectedTeachers(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedTeachers.size === filteredTeachers.length && filteredTeachers.length > 0) {
      setSelectedTeachers(new Set());
    } else {
      setSelectedTeachers(new Set(filteredTeachers.map(t => t.id)));
    }
  };

  const handleBulkDelete = () => {
    if (selectedTeachers.size > 0) {
      setBulkDeleteDialogOpen(true);
    }
  };

  const confirmBulkDelete = () => {
    bulkDeleteTeachersMutation.mutate(Array.from(selectedTeachers));
  };

  // Upload photo mutation
  const uploadPhotoMutation = useMutation({
    mutationFn: async ({ teacherId, formData }: { teacherId: number, formData: FormData }) => {
      const response = await fetch(`/api/teachers/${teacherId}/photo`, {
        method: 'POST',
        body: formData
      });
      if (!response.ok) throw new Error('Upload failed');
      return response.json();
    },
    onSuccess: (data, variables) => {
      const { teacherId } = variables;
      setUploadingPhoto(null);
      toast({
        title: language === 'fr' ? '📷 Photo uploadée !' : '📷 Photo Uploaded!',
        description: language === 'fr' ? 'Photo de profil mise à jour avec succès' : 'Profile photo updated successfully'
      });
      queryClient.invalidateQueries({ queryKey: ['/api/director/teachers'] });
    },
    onError: (error) => {
      setUploadingPhoto(null);
      toast({
        title: language === 'fr' ? '❌ Erreur d\'upload' : '❌ Upload Error',
        description: language === 'fr' ? 'Impossible d\'uploader la photo' : 'Failed to upload photo',
        variant: 'destructive'
      });
    }
  });

  const handlePhotoUpload = (teacher: Teacher) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        // Validation de taille (5MB max)
        if (file.size > 5 * 1024 * 1024) {
          toast({
            title: language === 'fr' ? '❌ Fichier trop lourd' : '❌ File Too Large',
            description: language === 'fr' ? 'La photo doit faire moins de 5MB' : 'Photo must be less than 5MB',
            variant: 'destructive'
          });
          return;
        }

        // Validation du type
        if (!file.type.startsWith('image/')) {
          toast({
            title: language === 'fr' ? '❌ Format invalide' : '❌ Invalid Format',
            description: language === 'fr' ? 'Seules les images sont acceptées' : 'Only images are accepted',
            variant: 'destructive'
          });
          return;
        }

        const formData = new FormData();
        formData.append('photo', file);
        
        setUploadingPhoto(teacher.id);
        uploadPhotoMutation.mutate({ teacherId: teacher.id, formData });
      }
    };
    input.click();
  };

  const filteredTeachers = sortBy(
    (Array.isArray(teachers) ? teachers : []).filter(teacher => {
      if (!teacher) return false;
      const name = teacher.name || '';
      const email = teacher.email || '';
      const teachingSubjects = Array.isArray(teacher.teachingSubjects) ? teacher.teachingSubjects : 
                             Array.isArray(teacher.subjects) ? teacher.subjects : [];
      
      const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSubject = selectedSubject === 'all' || teachingSubjects.includes(selectedSubject);
      
      // Appliquer les filtres avancés
      const matchesGender = filters.gender === 'all' || teacher.gender === filters.gender;
      const matchesFilterSubject = filters.subject === 'all' || teachingSubjects.includes(filters.subject);
      const matchesExperience = filters.experience === 'all' || 
        (filters.experience === 'junior' && (teacher.experience || 0) <= 3) ||
        (filters.experience === 'senior' && (teacher.experience || 0) > 3 && (teacher.experience || 0) <= 10) ||
        (filters.experience === 'expert' && (teacher.experience || 0) > 10);
      
      return matchesSearch && matchesSubject && matchesGender && matchesFilterSubject && matchesExperience;
    }),
    (t: Teacher) => t.name,
    'text'
  );
  
  // Extract unique subjects from all teachers for dynamic filter (sorted alphabetically)
  const allSubjects = sortStrings(
    Array.from(new Set(
      Array.isArray(teachers) ? teachers.flatMap(teacher => 
        Array.isArray(teacher.teachingSubjects) ? teacher.teachingSubjects : 
        Array.isArray(teacher.subjects) ? teacher.subjects : []
      ).filter(subject => subject && subject.trim()) : []
    ))
  );

  const stats = {
    totalTeachers: Array.isArray(teachers) ? teachers.length : 0,
    activeTeachers: Array.isArray(teachers) ? teachers.filter(t => t && t.status === 'active').length : 0,
    averageExperience: Array.isArray(teachers) && teachers.length > 0 ? Math.round(teachers.reduce((sum, t) => sum + (t.experience || 0), 0) / teachers.length) : 0,
    onLeave: Array.isArray(teachers) ? teachers.filter(t => t && t.status === 'on_leave').length : 0
  };

  const text = language === 'fr' ? {
    title: 'Gestion des Enseignants',
    description: 'Gérez le personnel enseignant de votre établissement',
    addTeacher: 'Ajouter un Enseignant',
    editTeacher: 'Modifier l\'Enseignant',
    search: 'Rechercher...',
    subject: 'Matière',
    allSubjects: 'Toutes les matières',
    stats: {
      total: 'Total Enseignants',
      active: 'Enseignants Actifs',
      experience: 'Expérience Moyenne',
      onLeave: 'En Congé'
    },
    form: {
      name: 'Nom complet',
      email: 'Email',
      phone: 'Téléphone',
      gender: 'Sexe',
      matricule: 'Matricule',
      teachingSubjects: 'Matières enseignées (séparées par virgule)',
      classes: 'Classes assignées (séparées par virgule)',
      schedule: 'Emploi du temps'
    },
    placeholders: {
      name: 'Jean Dupont',
      email: 'jean.dupont@ecole.com',
      phone: '+237 6XX XXX XXX',
      matricule: 'MAT-2024-001',
      teachingSubjects: 'Mathématiques, Physique, Chimie',
      classes: '6ème A, 5ème B, 4ème C'
    },
    genderOptions: {
      male: 'Masculin',
      female: 'Féminin',
      placeholder: 'Sélectionner'
    },
    status: {
      active: 'Actif',
      inactive: 'Inactif',
      on_leave: 'En congé'
    },
    buttons: {
      create: 'Ajouter',
      update: 'Modifier',
      delete: 'Supprimer',
      cancel: 'Annuler',
      edit: 'Modifier',
      view: 'Voir'
    }
  } : {
    title: 'Teacher Management',
    description: 'Manage your school\'s teaching staff',
    addTeacher: 'Add Teacher',
    editTeacher: 'Edit Teacher',
    search: 'Search...',
    subject: 'Subject',
    allSubjects: 'All subjects',
    stats: {
      total: 'Total Teachers',
      active: 'Active Teachers',
      experience: 'Average Experience',
      onLeave: 'On Leave'
    },
    form: {
      name: 'Full name',
      email: 'Email',
      phone: 'Phone',
      gender: 'Gender',
      matricule: 'Registration Number',
      teachingSubjects: 'Teaching subjects (comma separated)',
      classes: 'Assigned classes (comma separated)',
      schedule: 'Schedule'
    },
    placeholders: {
      name: 'John Smith',
      email: 'john.smith@school.com',
      phone: '+237 6XX XXX XXX',
      matricule: 'REG-2024-001',
      teachingSubjects: 'Mathematics, Physics, Chemistry',
      classes: 'Grade 6A, Grade 5B, Grade 4C'
    },
    genderOptions: {
      male: 'Male',
      female: 'Female',
      placeholder: 'Select'
    },
    status: {
      active: 'Active',
      inactive: 'Inactive',
      on_leave: 'On Leave'
    },
    buttons: {
      create: 'Add',
      update: 'Update',
      delete: 'Delete',
      cancel: 'Cancel',
      edit: 'Edit',
      view: 'View'
    }
  };

  return (
    <div className="space-y-6">
      {/* Offline Data Not Ready Modal */}
      <OfflineDataNotReadyModal 
        isOpen={showOfflineDataModal} 
        moduleName={text.title || 'Gestion des Enseignants'}
      />
      
      {/* Offline Status Banner */}
      {(!isOnline || pendingSyncCount > 0) && (
        <OfflineSyncStatus showDetails={true} className="mb-4" />
      )}
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{text.title || ''}</h1>
          <p className="text-gray-500">{text.description}</p>
        </div>
        <div className="flex gap-3">
          {selectedTeachers.size > 0 && (
            <Button 
              onClick={handleBulkDelete}
              className="bg-red-600 hover:bg-red-700"
              data-testid="button-bulk-delete-teachers"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {language === 'fr' ? `Supprimer (${selectedTeachers.size})` : `Delete (${selectedTeachers.size})`}
            </Button>
          )}
          <Button 
            onClick={() => setIsImportModalOpen(true)}
            className="bg-green-600 hover:bg-green-700"
            data-testid="button-import-teachers"
          >
            <Upload className="w-4 h-4 mr-2" />
            {language === 'fr' ? 'Importer' : 'Import'}
          </Button>
          <Button 
            onClick={() => setIsAddTeacherOpen(true)}
            className="bg-blue-600 hover:bg-blue-700"
            data-testid="button-add-teacher"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            {text.addTeacher}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-full">
                <UserCheck className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">{text.stats.total}</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalTeachers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-full">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">{text.stats.active}</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.activeTeachers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-full">
                <TrendingUp className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">{text.stats.experience}</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.averageExperience} ans</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-full">
                <Calendar className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">{text.stats.onLeave}</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.onLeave}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Excel Import Section */}
      <Card className="p-6 bg-white border-gray-200">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-2">
              <Upload className="w-5 h-5 text-blue-600" />
              {language === 'fr' ? 'Import Excel Enseignants' : 'Teachers Excel Import'}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              {language === 'fr' 
                ? 'Téléchargez le modèle Excel, remplissez-le avec vos enseignants, puis importez-le pour créer plusieurs enseignants en une seule opération.'
                : 'Download the Excel template, fill it with your teachers, then import it to create multiple teachers in one operation.'}
            </p>
          </div>
          <ExcelImportButton
            importType="teachers"
            schoolId={user?.schoolId}
            invalidateQueries={['/api/director/teachers', '/api/teachers']}
            onImportSuccess={() => {
              queryClient.invalidateQueries({ queryKey: ['/api/director/teachers'] });
              queryClient.invalidateQueries({ queryKey: ['/api/teachers'] });
              toast({
                title: language === 'fr' ? '✅ Import réussi' : '✅ Import successful',
                description: language === 'fr' ? 'Les enseignants ont été créés avec succès' : 'Teachers created successfully'
              });
            }}
          />
        </div>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center gap-3">
              <Checkbox
                checked={selectedTeachers.size === filteredTeachers.length && filteredTeachers.length > 0}
                onCheckedChange={toggleSelectAll}
                id="select-all-teachers"
                data-testid="checkbox-select-all-teachers"
              />
              <Label htmlFor="select-all-teachers" className="text-sm cursor-pointer">
                {language === 'fr' ? 'Tout sélectionner' : 'Select All'}
              </Label>
            </div>
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder={text.search}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full sm:w-48">
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger>
                  <SelectValue placeholder={text.subject} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{text.allSubjects}</SelectItem>
                  {allSubjects.map(subject => (
                    <SelectItem key={subject} value={subject}>
                      {subject}
                    </SelectItem>
                  ))}
                  {allSubjects.length === 0 && (
                    <>
                      <SelectItem value="Mathématiques">Mathématiques</SelectItem>
                      <SelectItem value="Français">Français</SelectItem>
                      <SelectItem value="Sciences">Sciences</SelectItem>
                      <SelectItem value="Histoire">Histoire</SelectItem>
                      <SelectItem value="Anglais">Anglais</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Teacher Modal */}
      {isAddTeacherOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{text.addTeacher}</h3>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setIsAddTeacherOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">{(text.form.name || '')}</Label>
                <Input
                  value={teacherForm.name || ''}
                  onChange={(e) => setTeacherForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder={text.placeholders.name}
                  className="w-full"
                />
              </div>
              <div>
                <Label className="text-sm font-medium">{(text.form.email || '')}</Label>
                <Input
                  type="email"
                  value={teacherForm.email || ''}
                  onChange={(e) => setTeacherForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder={text.placeholders.email}
                  className="w-full"
                />
              </div>
              <div>
                <Label className="text-sm font-medium">{text.form.phone}</Label>
                <Input
                  value={teacherForm.phone}
                  onChange={(e) => setTeacherForm(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder={text.placeholders.phone}
                  className="w-full"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">{text.form.gender}</Label>
                  <Select 
                    value={teacherForm.gender} 
                    onValueChange={(value) => setTeacherForm(prev => ({ ...prev, gender: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={text.genderOptions.placeholder} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="M">{text.genderOptions.male}</SelectItem>
                      <SelectItem value="F">{text.genderOptions.female}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm font-medium">{text.form.matricule}</Label>
                  <Input
                    value={teacherForm.matricule}
                    onChange={(e) => setTeacherForm(prev => ({ ...prev, matricule: e.target.value }))}
                    placeholder={text.placeholders.matricule}
                    className="w-full"
                  />
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium flex items-center gap-2">
                  <span>🏫 {language === 'fr' ? 'Classes Assignées' : 'Assigned Classes'}</span>
                  {isLoadingClasses && <div className="w-3 h-3 border border-gray-300 border-t-blue-600 rounded-full animate-spin" />}
                </Label>
                {isLoadingClasses ? (
                  <div className="w-full p-3 border rounded text-center text-sm text-gray-500">
                    {language === 'fr' ? 'Chargement des classes...' : 'Loading classes...'}
                  </div>
                ) : availableClasses.length === 0 ? (
                  <div className="w-full p-3 border rounded text-center text-sm text-gray-500">
                    {language === 'fr' ? 'Aucune classe disponible - Créez d\'abord des classes' : 'No classes available - Create classes first'}
                  </div>
                ) : (
                  <div className="border rounded-lg p-3 bg-gray-50 max-h-40 overflow-y-auto">
                    <div className="space-y-2">
                      {availableClasses.map((classItem: any) => (
                        <label key={classItem.id} className="flex items-center gap-2 cursor-pointer hover:bg-white p-2 rounded">
                          <input
                            type="checkbox"
                            checked={teacherForm.selectedClasses.includes(classItem.name)}
                            onChange={(e) => {
                              const newSelectedClasses = e.target.checked
                                ? [...teacherForm.selectedClasses, classItem.name]
                                : teacherForm.selectedClasses.filter(c => c !== classItem.name);
                              setTeacherForm(prev => ({ 
                                ...prev, 
                                selectedClasses: newSelectedClasses,
                                // Clear subjects when classes change
                                teachingSubjects: ''
                              }));
                            }}
                            className="rounded border-gray-300"
                          />
                          <span className="text-sm font-medium">{classItem.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {classItem.level}
                          </Badge>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  {language === 'fr' 
                    ? 'Sélectionnez les classes que cet enseignant supervise' 
                    : 'Select the classes this teacher will supervise'}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium flex items-center gap-2">
                  <span>📚 {language === 'fr' ? 'Matières Enseignées' : 'Teaching Subjects'}</span>
                  <Badge variant="outline" className="text-xs">
                    {language === 'fr' ? 'Basé sur les classes' : 'Based on classes'}
                  </Badge>
                </Label>
                {teacherForm.selectedClasses.length === 0 ? (
                  <div className="w-full p-3 border rounded text-center text-sm text-gray-500">
                    {language === 'fr' ? 
                      '⬆️ Sélectionnez d\'abord les classes pour voir les matières disponibles' : 
                      '⬆️ Select classes first to see available subjects'}
                  </div>
                ) : getAvailableSubjects().length === 0 ? (
                  <div className="w-full p-4 border-2 border-dashed border-orange-300 rounded bg-orange-50 text-center">
                    <p className="text-sm font-medium text-orange-800 mb-2">
                      {language === 'fr' ? 
                        '⚠️ Aucune matière trouvée pour les classes sélectionnées' : 
                        '⚠️ No subjects found for selected classes'}
                    </p>
                    <p className="text-xs text-orange-700">
                      {language === 'fr' ? 
                        'Allez dans "Gestion des Classes" pour ajouter des matières aux classes sélectionnées, puis revenez ici.' : 
                        'Go to "Class Management" to add subjects to the selected classes, then come back here.'}
                    </p>
                  </div>
                ) : (
                  <div className="border rounded-lg p-3 bg-gray-50 max-h-32 overflow-y-auto">
                    <div className="space-y-2">
                      {getAvailableSubjects().map((subject: string) => {
                        const isSelected = teacherForm.teachingSubjects.includes(subject);
                        return (
                          <label key={subject} className="flex items-center gap-2 cursor-pointer hover:bg-white p-2 rounded">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => {
                                const currentSubjects = teacherForm.teachingSubjects.split(',').map(s => s.trim()).filter(s => s);
                                const newSubjects = e.target.checked
                                  ? [...currentSubjects, subject]
                                  : currentSubjects.filter(s => s !== subject);
                                setTeacherForm(prev => ({ 
                                  ...prev, 
                                  teachingSubjects: newSubjects.join(', ')
                                }));
                              }}
                              className="rounded border-gray-300"
                            />
                            <span className="text-sm">{subject}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  {language === 'fr' ? 
                    'Matières disponibles selon les classes sélectionnées' : 
                    'Available subjects based on selected classes'}
                </p>
              </div>
              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={handleCreateTeacher}
                  disabled={createTeacherMutation.isPending || !teacherForm.name || !teacherForm.email}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  data-testid="button-confirm-add-teacher"
                >
                  {createTeacherMutation.isPending ? 'Ajout...' : text.buttons.create}
                </Button>
                <Button 
                  onClick={() => setIsAddTeacherOpen(false)}
                  variant="outline"
                  data-testid="button-cancel-add-teacher"
                >
                  {text.buttons.cancel}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Teacher Modal */}
      {isEditTeacherOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{text.editTeacher}</h3>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setIsEditTeacherOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">{(text.form.name || '')}</Label>
                <Input
                  value={teacherForm.name || ''}
                  onChange={(e) => setTeacherForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full"
                />
              </div>
              <div>
                <Label className="text-sm font-medium">{(text.form.email || '')}</Label>
                <Input
                  type="email"
                  value={teacherForm.email || ''}
                  onChange={(e) => setTeacherForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full"
                />
              </div>
              <div>
                <Label className="text-sm font-medium">{text.form.phone}</Label>
                <Input
                  value={teacherForm.phone}
                  onChange={(e) => setTeacherForm(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder={text.placeholders.phone}
                  className="w-full"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">{text.form.gender}</Label>
                  <Select 
                    value={teacherForm.gender} 
                    onValueChange={(value) => setTeacherForm(prev => ({ ...prev, gender: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={text.genderOptions.placeholder} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="M">{text.genderOptions.male}</SelectItem>
                      <SelectItem value="F">{text.genderOptions.female}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm font-medium">{text.form.matricule}</Label>
                  <Input
                    value={teacherForm.matricule}
                    onChange={(e) => setTeacherForm(prev => ({ ...prev, matricule: e.target.value }))}
                    placeholder={text.placeholders.matricule}
                    className="w-full"
                  />
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium flex items-center gap-2">
                  <span>🏫 {language === 'fr' ? 'Classes Assignées' : 'Assigned Classes'}</span>
                  {isLoadingClasses && <div className="w-3 h-3 border border-gray-300 border-t-blue-600 rounded-full animate-spin" />}
                </Label>
                {isLoadingClasses ? (
                  <div className="w-full p-3 border rounded text-center text-sm text-gray-500">
                    {language === 'fr' ? 'Chargement des classes...' : 'Loading classes...'}
                  </div>
                ) : availableClasses.length === 0 ? (
                  <div className="w-full p-3 border rounded text-center text-sm text-gray-500">
                    {language === 'fr' ? 'Aucune classe disponible - Créez d\'abord des classes' : 'No classes available - Create classes first'}
                  </div>
                ) : (
                  <div className="border rounded-lg p-3 bg-gray-50 max-h-40 overflow-y-auto">
                    <div className="space-y-2">
                      {availableClasses.map((classItem: any) => (
                        <label key={classItem.id} className="flex items-center gap-2 cursor-pointer hover:bg-white p-2 rounded">
                          <input
                            type="checkbox"
                            checked={teacherForm.selectedClasses.includes(classItem.name)}
                            onChange={(e) => {
                              const newSelectedClasses = e.target.checked
                                ? [...teacherForm.selectedClasses, classItem.name]
                                : teacherForm.selectedClasses.filter(c => c !== classItem.name);
                              setTeacherForm(prev => ({ 
                                ...prev, 
                                selectedClasses: newSelectedClasses,
                                // Clear subjects when classes change
                                teachingSubjects: ''
                              }));
                            }}
                            className="rounded border-gray-300"
                          />
                          <span className="text-sm font-medium">{classItem.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {classItem.level}
                          </Badge>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  {language === 'fr' 
                    ? 'Sélectionnez les classes que cet enseignant supervise' 
                    : 'Select the classes this teacher will supervise'}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium flex items-center gap-2">
                  <span>📚 {language === 'fr' ? 'Matières Enseignées' : 'Teaching Subjects'}</span>
                  <Badge variant="outline" className="text-xs">
                    {language === 'fr' ? 'Basé sur les classes' : 'Based on classes'}
                  </Badge>
                </Label>
                {teacherForm.selectedClasses.length === 0 ? (
                  <div className="w-full p-3 border rounded text-center text-sm text-gray-500">
                    {language === 'fr' ? 
                      '⬆️ Sélectionnez d\'abord les classes pour voir les matières disponibles' : 
                      '⬆️ Select classes first to see available subjects'}
                  </div>
                ) : getAvailableSubjects().length === 0 ? (
                  <div className="w-full p-4 border-2 border-dashed border-orange-300 rounded bg-orange-50 text-center">
                    <p className="text-sm font-medium text-orange-800 mb-2">
                      {language === 'fr' ? 
                        '⚠️ Aucune matière trouvée pour les classes sélectionnées' : 
                        '⚠️ No subjects found for selected classes'}
                    </p>
                    <p className="text-xs text-orange-700">
                      {language === 'fr' ? 
                        'Allez dans "Gestion des Classes" pour ajouter des matières aux classes sélectionnées, puis revenez ici.' : 
                        'Go to "Class Management" to add subjects to the selected classes, then come back here.'}
                    </p>
                  </div>
                ) : (
                  <div className="border rounded-lg p-3 bg-gray-50 max-h-32 overflow-y-auto">
                    <div className="space-y-2">
                      {getAvailableSubjects().map((subject: string) => {
                        const isSelected = teacherForm.teachingSubjects.includes(subject);
                        return (
                          <label key={subject} className="flex items-center gap-2 cursor-pointer hover:bg-white p-2 rounded">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => {
                                const currentSubjects = teacherForm.teachingSubjects.split(',').map(s => s.trim()).filter(s => s);
                                const newSubjects = e.target.checked
                                  ? [...currentSubjects, subject]
                                  : currentSubjects.filter(s => s !== subject);
                                setTeacherForm(prev => ({ 
                                  ...prev, 
                                  teachingSubjects: newSubjects.join(', ')
                                }));
                              }}
                              className="rounded border-gray-300"
                            />
                            <span className="text-sm">{subject}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  {language === 'fr' ? 
                    'Matières disponibles selon les classes sélectionnées' : 
                    'Available subjects based on selected classes'}
                </p>
              </div>
              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={handleUpdateTeacher}
                  disabled={updateTeacherMutation.isPending}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  data-testid="button-confirm-edit-teacher"
                >
                  {updateTeacherMutation.isPending ? 'Modification...' : text.buttons.update}
                </Button>
                <Button 
                  onClick={() => setIsEditTeacherOpen(false)}
                  variant="outline"
                  data-testid="button-cancel-edit-teacher"
                >
                  {text.buttons.cancel}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Teachers List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Personnel Enseignant</h3>
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleExportTeachers}
                data-testid="button-export-teachers"
              >
                <Download className="w-4 h-4 mr-2" />
                {language === 'fr' ? 'Exporter' : 'Export'}
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                data-testid="button-filter-teachers"
              >
                <Filter className="w-4 h-4 mr-2" />
                {language === 'fr' ? 'Filtrer' : 'Filter'}
              </Button>
            </div>
          </div>
        </CardHeader>
        
        {/* Filter Panel */}
        {isFilterOpen && (
          <div className="border-b px-6 py-4 bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">
                  {language === 'fr' ? 'Genre' : 'Gender'}
                </Label>
                <Select 
                  value={filters.gender} 
                  onValueChange={(value) => setFilters(prev => ({ ...prev, gender: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{language === 'fr' ? 'Tous' : 'All'}</SelectItem>
                    <SelectItem value="M">{language === 'fr' ? 'Homme' : 'Male'}</SelectItem>
                    <SelectItem value="F">{language === 'fr' ? 'Femme' : 'Female'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-medium">
                  {language === 'fr' ? 'Matière' : 'Subject'}
                </Label>
                <Select 
                  value={filters.subject} 
                  onValueChange={(value) => setFilters(prev => ({ ...prev, subject: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{language === 'fr' ? 'Toutes' : 'All'}</SelectItem>
                    <SelectItem value="Mathématiques">Mathématiques</SelectItem>
                    <SelectItem value="Français">Français</SelectItem>
                    <SelectItem value="Anglais">Anglais</SelectItem>
                    <SelectItem value="Sciences">Sciences</SelectItem>
                    <SelectItem value="Histoire">Histoire</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setFilters({ gender: 'all', subject: 'all', experience: 'all' })}
              >
                {language === 'fr' ? 'Réinitialiser' : 'Reset'}
              </Button>
            </div>
          </div>
        )}

        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-20 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : filteredTeachers.length === 0 ? (
            <div className="text-center py-12">
              <UserCheck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun enseignant trouvé</h3>
              <p className="text-gray-500">Ajoutez votre premier enseignant pour commencer.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {(Array.isArray(filteredTeachers) ? filteredTeachers : []).map((teacher) => (
                <div key={teacher.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-start gap-4">
                    <Checkbox
                      checked={selectedTeachers.has(teacher.id)}
                      onCheckedChange={() => toggleSelectTeacher(teacher.id)}
                      data-testid={`checkbox-teacher-${teacher.id}`}
                      className="mt-1"
                    />
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <GraduationCap className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <div className="font-medium text-gray-900">{teacher.name || ''}</div>
                        <Badge variant={teacher.status === 'active' ? 'default' : 'secondary'}>
                          {text.status[teacher.status]}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 mb-2 text-sm text-gray-600">
                        <span>📚 {(teacher.teachingSubjects || []).join(', ')}</span>
                        {teacher.gender && <span>👤 {teacher.gender === 'M' ? 'Masculin' : 'Féminin'}</span>}
                        {teacher.matricule && <span>🆔 {teacher.matricule}</span>}
                      </div>
                      <div className="flex flex-wrap items-center gap-4 mb-3 text-xs text-gray-500">
                        <span>📧 {teacher.email || ''}</span>
                        <span>📱 {teacher.phone}</span>
                        <span>🏫 {(teacher.classes || []).join(', ')}</span>
                      </div>
                      
                      {/* Boutons d'action mobile-first sous le nom */}
                      <div className="flex flex-wrap gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          onClick={() => {
                            setViewingTeacher(teacher);
                            setIsViewTeacherOpen(true);
                          }}
                          data-testid={`button-view-teacher-${teacher.id}`}
                        >
                          <Eye className="w-4 h-4" />
                          <span className="hidden sm:inline">{text.buttons.view}</span>
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEditTeacher(teacher)}
                          className="flex items-center gap-2 text-green-600 hover:text-green-700 hover:bg-green-50"
                          data-testid={`button-edit-teacher-${teacher.id}`}
                        >
                          <Edit className="w-4 h-4" />
                          <span className="hidden sm:inline">{text.buttons.edit}</span>
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handlePhotoUpload(teacher)}
                          disabled={uploadingPhoto === teacher.id}
                          className="flex items-center gap-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                          data-testid={`button-photo-teacher-${teacher.id}`}
                        >
                          <Camera className="w-4 h-4" />
                          <span className="hidden sm:inline">
                            {uploadingPhoto === teacher.id ? 
                              (language === 'fr' ? 'Upload...' : 'Uploading...') : 
                              (language === 'fr' ? 'Photo' : 'Photo')
                            }
                          </span>
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeleteTeacher(teacher.id, teacher.name)}
                          className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                          data-testid={`button-delete-teacher-${teacher.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                          <span className="hidden sm:inline">{text.buttons.delete}</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Import Modal */}
      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        importType="teachers"
        onImportComplete={() => {
          queryClient.invalidateQueries({ queryKey: ['/api/director/teachers'] });
          setIsImportModalOpen(false);
        }}
      />

      {/* Teacher Details View Modal */}
      {isViewTeacherOpen && viewingTeacher && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                {language === 'fr' ? 'Profil de l\'Enseignant' : 'Teacher Profile'}
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsViewTeacherOpen(false)}
                data-testid="button-close-teacher-view"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            
            <div className="p-6">
              <div className="flex items-start gap-6 mb-6">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <GraduationCap className="w-10 h-10 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {viewingTeacher.name}
                  </h3>
                  <div className="flex flex-wrap gap-3 mb-4">
                    <Badge variant={viewingTeacher.status === 'active' ? 'default' : 'secondary'}>
                      {text.status[viewingTeacher.status]}
                    </Badge>
                    <Badge variant="outline">
                      👤 {viewingTeacher.gender === 'M' ? (language === 'fr' ? 'Homme' : 'Male') : (language === 'fr' ? 'Femme' : 'Female')}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 border-b pb-2">
                    {language === 'fr' ? 'Informations de Contact' : 'Contact Information'}
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Email</label>
                      <p className="text-gray-900">{viewingTeacher.email || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        {language === 'fr' ? 'Téléphone' : 'Phone'}
                      </label>
                      <p className="text-gray-900">{viewingTeacher.phone || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        {language === 'fr' ? 'Matricule' : 'Teacher ID'}
                      </label>
                      <p className="text-gray-900">{viewingTeacher.matricule || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 border-b pb-2">
                    {language === 'fr' ? 'Informations Professionnelles' : 'Professional Information'}
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        {language === 'fr' ? 'Matières Enseignées' : 'Teaching Subjects'}
                      </label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {(viewingTeacher.teachingSubjects || []).map((subject, index) => (
                          <Badge key={index} variant="outline" className="bg-blue-50">
                            📚 {subject}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        {language === 'fr' ? 'Classes Assignées' : 'Assigned Classes'}
                      </label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {(viewingTeacher.classes || []).map((classe, index) => (
                          <Badge key={index} variant="outline" className="bg-green-50">
                            🎓 {classe}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 md:col-span-2">
                  <h4 className="font-semibold text-gray-900 border-b pb-2">
                    {language === 'fr' ? 'Emploi du Temps' : 'Schedule'}
                  </h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {viewingTeacher.schedule || (language === 'fr' ? 'Aucun emploi du temps défini' : 'No schedule defined')}
                    </p>
                  </div>
                </div>

                <div className="space-y-4 md:col-span-2">
                  <h4 className="font-semibold text-gray-900 border-b pb-2">
                    {language === 'fr' ? 'Statistiques' : 'Statistics'}
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">
                        {(viewingTeacher.teachingSubjects || []).length}
                      </p>
                      <p className="text-sm text-gray-500">
                        {language === 'fr' ? 'Matières' : 'Subjects'}
                      </p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">
                        {(viewingTeacher.classes || []).length}
                      </p>
                      <p className="text-sm text-gray-500">
                        {language === 'fr' ? 'Classes' : 'Classes'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <Button 
                  onClick={() => {
                    setIsViewTeacherOpen(false);
                    handleEditTeacher(viewingTeacher);
                  }}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  {language === 'fr' ? 'Modifier' : 'Edit'}
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setIsViewTeacherOpen(false)}
                >
                  {language === 'fr' ? 'Fermer' : 'Close'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDeleteTeacher}
        title={language === 'fr' ? 'Supprimer l\'enseignant' : 'Delete Teacher'}
        description={language === 'fr' 
          ? `Êtes-vous sûr de vouloir supprimer l'enseignant "${teacherToDelete?.name}" ? Cette action est irréversible et supprimera toutes les données associées.`
          : `Are you sure you want to delete the teacher "${teacherToDelete?.name}"? This action cannot be undone and will remove all associated data.`}
        confirmText={language === 'fr' ? 'Supprimer' : 'Delete'}
        cancelText={language === 'fr' ? 'Annuler' : 'Cancel'}
      />

      {/* Bulk Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={bulkDeleteDialogOpen}
        onOpenChange={setBulkDeleteDialogOpen}
        onConfirm={confirmBulkDelete}
        title={language === 'fr' ? 'Suppression groupée' : 'Bulk Delete'}
        description={language === 'fr' 
          ? `Êtes-vous sûr de vouloir supprimer ${selectedTeachers.size} enseignant(s) sélectionné(s) ? Cette action est irréversible et supprimera toutes les données associées.`
          : `Are you sure you want to delete ${selectedTeachers.size} selected teacher(s)? This action cannot be undone and will remove all associated data.`}
        confirmText={language === 'fr' ? 'Supprimer tout' : 'Delete All'}
        cancelText={language === 'fr' ? 'Annuler' : 'Cancel'}
      />
    </div>
  );
};

export default FunctionalDirectorTeacherManagement;