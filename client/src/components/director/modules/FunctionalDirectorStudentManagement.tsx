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
  Eye, X, Mail, Phone, GraduationCap, Upload, Camera
} from 'lucide-react';
import ImportModal from '../ImportModal';
import { ExcelImportButton } from '@/components/common/ExcelImportButton';
import DeleteConfirmationDialog from '@/components/ui/DeleteConfirmationDialog';

interface Student {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  className: string;
  level: string;
  age: number;
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  status: 'active' | 'suspended' | 'graduated';
  average: number;
  attendance: number;
  redoublant: boolean; // Nouveau champ pour indiquer si l'élève redouble
  photo?: string; // URL de la photo de l'élève
}

const FunctionalDirectorStudentManagement: React.FC = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [isEditStudentOpen, setIsEditStudentOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState<number | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    gender: 'all',
    class: 'all'
  });
  const [isViewStudentOpen, setIsViewStudentOpen] = useState(false);
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<{id: number, name: string} | null>(null);
  
  // Bulk selection states
  const [selectedStudents, setSelectedStudents] = useState<Set<number>>(new Set());
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [studentForm, setStudentForm] = useState({
    name: '', // Single name field for simplicity 
    email: '',
    phone: '',
    className: '',
    level: '',
    age: '',
    gender: '',
    dateOfBirth: '', // Date de naissance
    placeOfBirth: '', // Lieu de naissance
    matricule: '',
    parentName: '',
    parentEmail: '',
    parentPhone: '',
    photo: null as File | null,
    redoublant: false // Nouveau champ redoublant
  });

  // État pour la gestion de la caméra
  const [showCamera, setShowCamera] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);

  // Fetch classes data for dropdown
  const { data: classesResponse = {}, isLoading: isLoadingClasses } = useQuery({
    queryKey: ['/api/director/classes'],
    enabled: !!user,
    queryFn: async () => {
      console.log('[STUDENT_MANAGEMENT] 🔍 Fetching classes for student assignment...');
      const response = await fetch('/api/director/classes', {
        credentials: 'include'
      });
      if (!response.ok) {
        console.error('[STUDENT_MANAGEMENT] ❌ Failed to fetch classes:', response.status);
        throw new Error('Failed to fetch classes');
      }
      const data = await response.json();
      console.log('[STUDENT_MANAGEMENT] ✅ Classes fetched:', data?.classes?.length || 0, 'classes');
      return data;
    },
    retry: 2,
    retryDelay: 1000
  });

  const availableClasses = classesResponse?.classes || [];

  // Fetch students data from PostgreSQL API
  const { data: studentsData, isLoading } = useQuery({
    queryKey: ['/api/director/students'],
    queryFn: async () => {
      const response = await fetch('/api/director/students', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch students data');
      const data = await response.json();
      console.log('[STUDENTS_DEBUG] API Response:', data);
      return data;
    },
    enabled: !!user
  });

  // Extract students array from API response
  const students = studentsData?.students || studentsData || [];

  // Export function
  const handleExportStudents = () => {
    if (!students || students.length === 0) {
      toast({
        title: language === 'fr' ? 'Aucune donnée à exporter' : 'No data to export',
        description: language === 'fr' ? 'Ajoutez des élèves avant d\'exporter' : 'Add students before exporting',
        variant: 'destructive'
      });
      return;
    }

    const csvHeaders = language === 'fr' ? 
      'Nom,Email,Classe,Statut,Parent,Téléphone Parent' :
      'Name,Email,Class,Status,Parent,Parent Phone';
    
    const csvData = students.map(student => 
      `"${student.firstName} ${student.lastName}","${student.email}","${student.className}","${student.status}","${student.parentName}","${student.parentPhone}"`
    ).join('\n');
    
    const csv = `${csvHeaders}\n${csvData}`;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `eleves_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    
    toast({
      title: language === 'fr' ? '📊 Export réussi !' : '📊 Export Successful!',
      description: language === 'fr' ? 'Liste des élèves exportée' : 'Student list exported'
    });
  };

  // Create student mutation
  const createStudentMutation = useMutation({
    mutationFn: async (studentData: any) => {
      const response = await fetch('/api/director/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(studentData),
        credentials: 'include'
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        // Return specific error for better handling
        throw { status: response.status, data };
      }
      
      return data;
    },
    onSuccess: (newStudent) => {
      // ✅ IMMEDIATE VISUAL FEEDBACK - User sees what they created
      queryClient.invalidateQueries({ queryKey: ['/api/director/students'] });
      
      // Force immediate refresh to show the new student
      queryClient.refetchQueries({ queryKey: ['/api/director/students'] });
      
      setIsAddStudentOpen(false);
      setStudentForm({ 
        name: '', email: '', phone: '', className: '', level: '', age: '', gender: '', 
        dateOfBirth: '', placeOfBirth: '', matricule: '', parentName: '', parentEmail: '', 
        parentPhone: '', photo: null, redoublant: false 
      });
      // Réinitialiser les états de la caméra
      setShowCamera(false);
      setCapturedPhoto(null);
      setIsCameraReady(false);
      
      toast({
        title: '✅ Élève ajouté avec succès',
        description: `L'élève a été créé sans mot de passe requis et apparaît maintenant dans la liste.`
      });
      
      // Scroll to top to show the new student (usually added at beginning of list)
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    },
    onError: (error: any) => {
      console.error('[FRONTEND] Student creation error:', error);
      
      // Handle specific error types
      const errorType = error?.data?.errorType;
      const errorMessage = error?.data?.message;
      
      if (errorType === 'DUPLICATE_EMAIL') {
        toast({
          title: '❌ Email déjà utilisé',
          description: 'Cet email est déjà associé à un autre utilisateur. Veuillez utiliser un email différent ou laisser le champ vide pour générer un email temporaire.',
          variant: 'destructive'
        });
      } else if (errorType === 'DUPLICATE_PHONE') {
        toast({
          title: '❌ Téléphone déjà utilisé',
          description: 'Ce numéro de téléphone est déjà associé à un autre utilisateur. Veuillez utiliser un numéro différent.',
          variant: 'destructive'
        });
      } else if (errorType === 'MISSING_NAME') {
        toast({
          title: '❌ Nom manquant',
          description: 'Le nom complet de l\'élève est requis.',
          variant: 'destructive'
        });
      } else {
        toast({
          title: '❌ Erreur',
          description: errorMessage || 'Impossible d\'ajouter l\'élève. Veuillez vérifier les informations et réessayer.',
          variant: 'destructive'
        });
      }
    }
  });

  // Update student mutation
  const updateStudentMutation = useMutation({
    mutationFn: async (studentData: any) => {
      const response = await fetch(`/api/director/students/${studentData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(studentData),
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to update student');
      return response.json();
    },
    onSuccess: () => {
      // ✅ IMMEDIATE VISUAL FEEDBACK - User sees updated student
      queryClient.invalidateQueries({ queryKey: ['/api/director/students'] });
      queryClient.refetchQueries({ queryKey: ['/api/director/students'] });
      
      setIsEditStudentOpen(false);
      const editedStudentName = selectedStudent ? `${selectedStudent.firstName} ${selectedStudent.lastName}` : 'L\'élève';
      setSelectedStudent(null);
      
      toast({
        title: '✅ Modification réussie',
        description: `${editedStudentName} a été modifié avec succès. Les changements sont visibles immédiatement.`
      });
    },
    onError: () => {
      toast({
        title: 'Erreur',
        description: 'Impossible de modifier l\'élève.',
        variant: 'destructive'
      });
    }
  });

  // Delete student mutation
  const deleteStudentMutation = useMutation({
    mutationFn: async (studentId: number) => {
      const response = await fetch(`/api/director/students/${studentId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to delete student');
      return response.json();
    },
    onSuccess: () => {
      // ✅ IMMEDIATE VISUAL FEEDBACK - Student disappears from list
      queryClient.invalidateQueries({ queryKey: ['/api/director/students'] });
      queryClient.refetchQueries({ queryKey: ['/api/director/students'] });
      
      toast({
        title: '✅ Élève supprimé',
        description: 'L\'élève a été supprimé définitivement de votre école et disparaît de la liste.'
      });
    },
    onError: () => {
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer l\'élève.',
        variant: 'destructive'
      });
    }
  });

  // Bulk delete mutation
  const bulkDeleteStudentsMutation = useMutation({
    mutationFn: async (studentIds: number[]) => {
      const responses = await Promise.all(
        studentIds.map(id => 
          fetch(`/api/director/students/${id}`, {
            method: 'DELETE',
            credentials: 'include'
          }).then(res => {
            if (!res.ok) throw new Error(`Failed to delete student ${id}`);
            return res.json();
          })
        )
      );
      return responses;
    },
    onSuccess: (_, studentIds) => {
      queryClient.invalidateQueries({ queryKey: ['/api/director/students'] });
      queryClient.refetchQueries({ queryKey: ['/api/director/students'] });
      
      setSelectedStudents(new Set());
      setBulkDeleteDialogOpen(false);
      
      toast({
        title: language === 'fr' ? '✅ Suppression réussie' : '✅ Deletion Successful',
        description: language === 'fr' 
          ? `${studentIds.length} élève(s) supprimé(s) avec succès` 
          : `${studentIds.length} student(s) deleted successfully`
      });
    },
    onError: () => {
      toast({
        title: language === 'fr' ? '❌ Erreur' : '❌ Error',
        description: language === 'fr' 
          ? 'Impossible de supprimer les élèves sélectionnés' 
          : 'Failed to delete selected students',
        variant: 'destructive'
      });
    }
  });

  const handleCreateStudent = () => {
    // Validate: At least name is required
    if (!studentForm.name || !studentForm.name.trim()) {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' ? 'Le nom de l\'élève est requis' : 'Student name is required',
        variant: 'destructive'
      });
      return;
    }
    
    createStudentMutation.mutate({
      ...studentForm,
      age: parseInt(studentForm.age) || 16
    });
  };

  const handleUpdateStudent = () => {
    if (selectedStudent) {
      updateStudentMutation.mutate({
        ...selectedStudent,
        ...studentForm
      });
    }
  };

  const handleEditStudent = (student: Student) => {
    setSelectedStudent(student);
    setStudentForm({
      name: `${student.firstName} ${student.lastName}`,
      email: student.email,
      phone: '',
      className: student.className,
      level: student.level,
      age: student.age ? student.age.toString() : '',
      gender: '',
      dateOfBirth: '', // Sera rempli avec les données existantes si disponible
      placeOfBirth: '', // Sera rempli avec les données existantes si disponible
      matricule: '',
      parentName: student.parentName,
      parentEmail: student.parentEmail,
      parentPhone: student.parentPhone,
      photo: null,
      redoublant: student.redoublant || false // Ajouter le champ redoublant
    });
    // Réinitialiser les états de la caméra lors de l'édition
    setShowCamera(false);
    setCapturedPhoto(null);
    setIsCameraReady(false);
    setIsEditStudentOpen(true);
  };

  const handleDeleteStudent = (studentId: number, studentName: string) => {
    setStudentToDelete({ id: studentId, name: studentName });
    setDeleteDialogOpen(true);
  };

  const confirmDeleteStudent = () => {
    if (studentToDelete) {
      deleteStudentMutation.mutate(studentToDelete.id);
      setStudentToDelete(null);
    }
  };

  // Bulk selection handlers
  const toggleSelectStudent = (studentId: number) => {
    const newSelected = new Set(selectedStudents);
    if (newSelected.has(studentId)) {
      newSelected.delete(studentId);
    } else {
      newSelected.add(studentId);
    }
    setSelectedStudents(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedStudents.size === filteredStudents.length && filteredStudents.length > 0) {
      setSelectedStudents(new Set());
    } else {
      setSelectedStudents(new Set(filteredStudents.map(s => s.id)));
    }
  };

  const handleBulkDelete = () => {
    if (selectedStudents.size > 0) {
      setBulkDeleteDialogOpen(true);
    }
  };

  const confirmBulkDelete = () => {
    bulkDeleteStudentsMutation.mutate(Array.from(selectedStudents));
  };

  // Upload photo mutation
  const uploadPhotoMutation = useMutation({
    mutationFn: async ({ studentId, formData }: { studentId: number, formData: FormData }) => {
      const response = await fetch(`/api/students/${studentId}/photo`, {
        method: 'POST',
        body: formData
      });
      if (!response.ok) throw new Error('Upload failed');
      return response.json();
    },
    onSuccess: (data, variables) => {
      const { studentId } = variables;
      setUploadingPhoto(null);
      toast({
        title: language === 'fr' ? '📷 Photo uploadée !' : '📷 Photo Uploaded!',
        description: language === 'fr' ? 'Photo de profil mise à jour avec succès' : 'Profile photo updated successfully'
      });
      queryClient.invalidateQueries({ queryKey: ['/api/director/students'] });
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

  const handlePhotoUpload = (student: Student) => {
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
        
        setUploadingPhoto(student.id);
        uploadPhotoMutation.mutate({ studentId: student.id, formData });
      }
    };
    input.click();
  };

  const filteredStudents = (Array.isArray(students) ? students : [])
    .filter(student => {
      if (!student) return false;
      const firstName = student.firstName || '';
      const lastName = student.lastName || '';
      const email = student.email || '';
      const className = student.className || '';
      
      const matchesSearch = firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesClass = selectedClass === 'all' || className === selectedClass;
      
      // Appliquer les filtres avancés
      const matchesStatus = filters.status === 'all' || student.status === filters.status;
      const matchesGender = filters.gender === 'all' || student.gender === filters.gender;
      const matchesFilterClass = filters.class === 'all' || className === filters.class;
      
      return matchesSearch && matchesClass && matchesStatus && matchesGender && matchesFilterClass;
    })
    .sort((a, b) => {
      // Sort alphabetically by last name, then first name
      const lastNameA = (a.lastName || '').toLowerCase();
      const lastNameB = (b.lastName || '').toLowerCase();
      if (lastNameA < lastNameB) return -1;
      if (lastNameA > lastNameB) return 1;
      
      const firstNameA = (a.firstName || '').toLowerCase();
      const firstNameB = (b.firstName || '').toLowerCase();
      if (firstNameA < firstNameB) return -1;
      if (firstNameA > firstNameB) return 1;
      return 0;
    });

  const stats = {
    totalStudents: Array.isArray(students) ? (Array.isArray(students) ? students.length : 0) : 0,
    activeStudents: Array.isArray(students) ? (Array.isArray(students) ? students : []).filter(s => s && s.status === 'active').length : 0,
    averageGrade: Array.isArray(students) && students.length > 0 ? Math.round((Array.isArray(students) ? students : []).reduce((sum, s) => sum + (s.average || 0), 0) / (Array.isArray(students) ? students.length : 0) * 10) / 10 : 0,
    averageAttendance: Array.isArray(students) && students.length > 0 ? Math.round((Array.isArray(students) ? students : []).reduce((sum, s) => sum + (s.attendance || 0), 0) / (Array.isArray(students) ? students.length : 0)) : 0
  };

  const text = language === 'fr' ? {
    title: 'Gestion des Élèves',
    addStudent: 'Ajouter un Élève',
    editStudent: 'Modifier l\'Élève',
    search: 'Rechercher...',
    class: 'Classe',
    allClasses: 'Toutes les classes',
    stats: {
      total: 'Total Élèves',
      active: 'Élèves Actifs',
      average: 'Moyenne Générale',
      attendance: 'Présence Moyenne'
    },
    form: {
      firstName: 'Prénom',
      lastName: 'Nom',
      email: 'Email',
      className: 'Classe',
      level: 'Niveau',
      age: 'Âge',
      parentName: 'Nom du parent',
      parentEmail: 'Email parent',
      parentPhone: 'Téléphone parent'
    },
    status: {
      active: 'Actif',
      suspended: 'Suspendu',
      graduated: 'Diplômé'
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
    title: 'Student Management',
    addStudent: 'Add Student',
    editStudent: 'Edit Student',
    search: 'Search...',
    class: 'Class',
    allClasses: 'All classes',
    stats: {
      total: 'Total Students',
      active: 'Active Students',
      average: 'Average Grade',
      attendance: 'Average Attendance'
    },
    form: {
      firstName: 'First name',
      lastName: 'Last name',
      email: 'Email',
      className: 'Class',
      level: 'Level',
      age: 'Age',
      parentName: 'Parent name',
      parentEmail: 'Parent email',
      parentPhone: 'Parent phone'
    },
    status: {
      active: 'Active',
      suspended: 'Suspended',
      graduated: 'Graduated'
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{text.title || ''}</h1>
          <p className="text-gray-500">Gérez tous les élèves de votre établissement</p>
        </div>
        <div className="flex gap-2">
          {selectedStudents.size > 0 && (
            <Button 
              onClick={handleBulkDelete}
              className="bg-red-600 hover:bg-red-700"
              data-testid="button-bulk-delete-students"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {language === 'fr' ? `Supprimer (${selectedStudents.size})` : `Delete (${selectedStudents.size})`}
            </Button>
          )}
          <Button 
            onClick={() => setIsImportModalOpen(true)}
            className="bg-green-600 hover:bg-green-700"
            data-testid="button-import-students"
          >
            <Upload className="w-4 h-4 mr-2" />
            {language === 'fr' ? 'Importer' : 'Import'}
          </Button>
          <Button 
            onClick={() => setIsAddStudentOpen(true)}
            className="bg-blue-600 hover:bg-blue-700"
            data-testid="button-add-student"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            {text.addStudent}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-full">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">{text.stats.total}</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalStudents}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-full">
                <GraduationCap className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">{text.stats.active}</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.activeStudents}</p>
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
                <p className="text-sm font-medium text-gray-500">{text.stats.average}</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.averageGrade}/20</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-full">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">{text.stats.attendance}</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.averageAttendance}%</p>
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
              {language === 'fr' ? 'Import Excel Élèves' : 'Students Excel Import'}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              {language === 'fr' 
                ? 'Téléchargez le modèle Excel, remplissez-le avec vos élèves, puis importez-le pour créer plusieurs élèves en une seule opération.'
                : 'Download the Excel template, fill it with your students, then import it to create multiple students in one operation.'}
            </p>
          </div>
          <ExcelImportButton
            importType="students"
            schoolId={user?.schoolId}
            invalidateQueries={['/api/director/students', '/api/students']}
            onImportSuccess={() => {
              queryClient.invalidateQueries({ queryKey: ['/api/director/students'] });
              queryClient.invalidateQueries({ queryKey: ['/api/students'] });
              toast({
                title: language === 'fr' ? '✅ Import réussi' : '✅ Import successful',
                description: language === 'fr' ? 'Les élèves ont été créés avec succès' : 'Students created successfully'
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
                checked={selectedStudents.size === filteredStudents.length && filteredStudents.length > 0}
                onCheckedChange={toggleSelectAll}
                id="select-all-students"
                data-testid="checkbox-select-all-students"
              />
              <Label htmlFor="select-all-students" className="text-sm cursor-pointer">
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
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue placeholder={text.class} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{text.allClasses}</SelectItem>
                  <SelectItem value="6ème A">6ème A</SelectItem>
                  <SelectItem value="6ème B">6ème B</SelectItem>
                  <SelectItem value="5ème A">5ème A</SelectItem>
                  <SelectItem value="5ème B">5ème B</SelectItem>
                  <SelectItem value="4ème A">4ème A</SelectItem>
                  <SelectItem value="3ème A">3ème A</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Student Modal */}
      {isAddStudentOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white p-4 sm:p-6 rounded-lg w-full max-w-[95vw] sm:max-w-md max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base sm:text-lg font-semibold">{text.addStudent}</h3>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setIsAddStudentOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Nom complet de l'élève</Label>
                <Input
                  value={studentForm.name || ''}
                  onChange={(e) => setStudentForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Marie Nguemto"
                  className="w-full"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Genre</Label>
                  <Select 
                    value={studentForm.gender} 
                    onValueChange={(value) => setStudentForm(prev => ({ ...prev, gender: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Genre" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Masculin</SelectItem>
                      <SelectItem value="female">Féminin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm font-medium">Matricule (optionnel)</Label>
                  <Input
                    value={studentForm.matricule || ''}
                    onChange={(e) => setStudentForm(prev => ({ ...prev, matricule: e.target.value }))}
                    placeholder="Ex: STU-001"
                    className="w-full"
                  />
                </div>
              </div>
              
              {/* Date et lieu de naissance - NOUVEAUX CHAMPS */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Date de naissance</Label>
                  <Input
                    type="date"
                    value={studentForm.dateOfBirth || ''}
                    onChange={(e) => setStudentForm(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                    className="w-full"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium">Lieu de naissance</Label>
                  <Input
                    value={studentForm.placeOfBirth || ''}
                    onChange={(e) => setStudentForm(prev => ({ ...prev, placeOfBirth: e.target.value }))}
                    placeholder="Ex: Yaoundé, Cameroun"
                    className="w-full"
                  />
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium flex items-center gap-2">
                  <span>🏫 {language === 'fr' ? 'Classe (optionnelle)' : 'Class (optional)'}</span>
                  {isLoadingClasses && <div className="w-3 h-3 border border-gray-300 border-t-blue-600 rounded-full animate-spin" />}
                </Label>
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
                    value={studentForm.className} 
                    onValueChange={(value) => setStudentForm(prev => ({ ...prev, className: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={language === 'fr' ? 'Choisir une classe' : 'Choose a class'} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">
                        {language === 'fr' ? 'Aucune classe (à assigner plus tard)' : 'No class (assign later)'}
                      </SelectItem>
                      {availableClasses.map((classItem: any) => (
                        <SelectItem key={classItem.id} value={classItem.name}>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{classItem.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {classItem.level}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              ({classItem.subjects?.length || 0} {language === 'fr' ? 'matières' : 'subjects'})
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  {language === 'fr' ? 
                    'Sélectionnez la classe de cet élève parmi celles créées dans votre école' : 
                    'Select this student\'s class from those created in your school'}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium">{text.form.parentName}</Label>
                <Input
                  value={studentForm.parentName}
                  onChange={(e) => setStudentForm(prev => ({ ...prev, parentName: e.target.value }))}
                  placeholder="Nom du parent/tuteur"
                  className="w-full"
                />
              </div>
              <div>
                <Label className="text-sm font-medium">{text.form.parentEmail}</Label>
                <Input
                  type="email"
                  value={studentForm.parentEmail}
                  onChange={(e) => setStudentForm(prev => ({ ...prev, parentEmail: e.target.value }))}
                  placeholder="parent@exemple.com"
                  className="w-full"
                />
              </div>
              <div>
                <Label className="text-sm font-medium">{text.form.parentPhone}</Label>
                <Input
                  value={studentForm.parentPhone}
                  onChange={(e) => setStudentForm(prev => ({ ...prev, parentPhone: e.target.value }))}
                  placeholder="+237 6XX XXX XXX"
                  className="w-full"
                />
              </div>
              
              {/* Nouveau champ Redoublant */}
              <div>
                <Label className="text-sm font-medium flex items-center gap-2">
                  <GraduationCap className="w-4 h-4" />
                  {language === 'fr' ? 'Redoublant' : 'Repeating Year'}
                </Label>
                <Select 
                  value={studentForm.redoublant ? 'oui' : 'non'} 
                  onValueChange={(value) => setStudentForm(prev => ({ ...prev, redoublant: value === 'oui' }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={language === 'fr' ? 'Sélectionner...' : 'Select...'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="non">
                      {language === 'fr' ? '👍 Non - Promotion normale' : '👍 No - Normal promotion'}
                    </SelectItem>
                    <SelectItem value="oui">
                      {language === 'fr' ? '♾ Oui - Redoublant' : '♾ Yes - Repeating year'}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <div className="text-xs text-gray-500 mt-1">
                  {language === 'fr' ? 
                    'Cette information apparaîtra sur les bulletins trimestriels' : 
                    'This information will appear on quarterly report cards'}
                </div>
              </div>
              
              {/* Photo Upload Section */}
              <div>
                <Label className="text-sm font-medium">
                  {language === 'fr' ? 'Photo de l\'élève (optionnelle)' : 'Student Photo (optional)'}
                </Label>
                <div className="mt-2 space-y-3">
                  {/* Option 1: Télécharger une photo */}
                  <div className="flex items-center gap-4">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        setStudentForm(prev => ({ ...prev, photo: file }));
                        setCapturedPhoto(null); // Clear captured photo if file is uploaded
                      }}
                      className="hidden"
                      id="student-photo-upload"
                    />
                    <label
                      htmlFor="student-photo-upload"
                      className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer border"
                    >
                      <Upload className="w-4 h-4" />
                      {language === 'fr' ? 'Choisir une photo' : 'Choose Photo'}
                    </label>
                    {studentForm.photo && (
                      <span className="text-sm text-green-600">
                        ✓ {studentForm.photo.name}
                      </span>
                    )}
                  </div>
                  
                  {/* Option 2: Prendre une photo avec caméra */}
                  <div className="flex items-center gap-4">
                    <Button
                      type="button"
                      onClick={() => {
                        setShowCamera(true);
                        setStudentForm(prev => ({ ...prev, photo: null })); // Clear file upload if camera is used
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 border"
                      variant="outline"
                    >
                      <Camera className="w-4 h-4" />
                      {language === 'fr' ? 'Prendre une photo' : 'Take Photo'}
                    </Button>
                    {capturedPhoto && (
                      <span className="text-sm text-green-600">
                        ✓ {language === 'fr' ? 'Photo capturée' : 'Photo captured'}
                      </span>
                    )}
                  </div>
                  
                  {/* Aperçu de la photo capturée */}
                  {capturedPhoto && (
                    <div className="mt-2">
                      <div className="text-sm font-medium mb-2">
                        {language === 'fr' ? 'Aperçu de la photo :' : 'Photo preview:'}
                      </div>
                      <img 
                        src={capturedPhoto} 
                        alt="Photo capturée" 
                        className="w-24 h-24 object-cover rounded border"
                      />
                    </div>
                  )}
                </div>
                <div className="text-xs text-gray-500 mt-2 space-y-1">
                  <p>{language === 'fr' ? 'Formats supportés: JPG, PNG, WebP (max 5MB)' : 'Supported formats: JPG, PNG, WebP (max 5MB)'}</p>
                  <p className="text-blue-600 font-medium">
                    {language === 'fr' ? 
                      '📸 Nouveau: Prenez une photo directement à l\'école avec la caméra!' : 
                      '📸 New: Take a photo directly at school with the camera!'}
                  </p>
                  <p className="text-purple-600">
                    {language === 'fr' ? 
                      '🎓 Cette photo apparaîtra automatiquement sur tous les bulletins trimestriels' : 
                      '🎓 This photo will automatically appear on all quarterly report cards'}
                  </p>
                </div>
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={handleCreateStudent}
                  disabled={createStudentMutation.isPending || !studentForm.name}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  data-testid="button-confirm-add-student"
                >
                  {createStudentMutation.isPending ? 'Ajout...' : 'Créer l\'élève (sans mot de passe)'}
                </Button>
                <Button 
                  onClick={() => setIsAddStudentOpen(false)}
                  variant="outline"
                  data-testid="button-cancel-add-student"
                >
                  {text.buttons.cancel}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Camera Modal for Photo Capture */}
      {showCamera && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white p-4 sm:p-6 rounded-lg w-full max-w-[95vw] sm:max-w-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Camera className="w-5 h-5" />
                {language === 'fr' ? 'Prendre une photo de l\'élève' : 'Take Student Photo'}
              </h3>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  setShowCamera(false);
                  setIsCameraReady(false);
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-4">
              {/* Camera Preview Area */}
              <div className="bg-gray-100 rounded-lg p-8 text-center min-h-[300px] flex items-center justify-center">
                <div className="text-center">
                  <Camera className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600 mb-4">
                    {language === 'fr' ? 
                      'Simulation caméra - Cliquez "Capturer" pour simuler la prise de photo' : 
                      'Camera simulation - Click "Capture" to simulate photo taking'}
                  </p>
                  <div className="text-sm text-blue-600 bg-blue-50 p-3 rounded">
                    {language === 'fr' ? 
                      '💡 Astuce: En production, cette interface se connecterait à la vraie caméra du dispositif' : 
                      '💡 Tip: In production, this interface would connect to the device\'s actual camera'}
                  </div>
                </div>
              </div>
              
              {/* Camera Controls */}
              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    // Simulation: générer une image de démonstration
                    const canvas = document.createElement('canvas');
                    canvas.width = 300;
                    canvas.height = 400;
                    const ctx = canvas.getContext('2d')!;
                    
                    // Créer une image de démonstration simple
                    const gradient = ctx.createLinearGradient(0, 0, 300, 400);
                    gradient.addColorStop(0, '#e3f2fd');
                    gradient.addColorStop(1, '#bbdefb');
                    ctx.fillStyle = gradient;
                    ctx.fillRect(0, 0, 300, 400);
                    
                    // Ajouter du texte de démonstration
                    ctx.fillStyle = '#1976d2';
                    ctx.font = '20px Arial';
                    ctx.textAlign = 'center';
                    ctx.fillText('Photo Élève', 150, 200);
                    ctx.font = '14px Arial';
                    ctx.fillText(new Date().toLocaleString(), 150, 230);
                    ctx.fillText('EDUCAFRIC', 150, 250);
                    
                    const dataUrl = canvas.toDataURL('image/png');
                    setCapturedPhoto(dataUrl);
                    setShowCamera(false);
                    
                    toast({
                      title: language === 'fr' ? '📸 Photo capturée!' : '📸 Photo captured!',
                      description: language === 'fr' ? 
                        'Photo simulée créée avec succès' : 
                        'Simulated photo created successfully'
                    });
                  }}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  {language === 'fr' ? 'Capturer la Photo' : 'Capture Photo'}
                </Button>
                <Button
                  onClick={() => {
                    setShowCamera(false);
                    setIsCameraReady(false);
                  }}
                  variant="outline"
                >
                  {language === 'fr' ? 'Annuler' : 'Cancel'}
                </Button>
              </div>
              
              <div className="text-xs text-gray-500 text-center">
                {language === 'fr' ? 
                  'Mode simulation - En production, utilisera la caméra réelle du dispositif' : 
                  'Simulation mode - In production, will use device\'s actual camera'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Student Modal */}
      {isEditStudentOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white p-4 sm:p-6 rounded-lg w-full max-w-[95vw] sm:max-w-md max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base sm:text-lg font-semibold">{text.editStudent}</h3>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setIsEditStudentOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">{(text.form.firstName || '')}</Label>
                  <Input
                    value={studentForm.name.split(' ')[0] || ''}
                    onChange={(e) => {
                      const lastName = studentForm.name.split(' ').slice(1).join(' ') || '';
                      setStudentForm(prev => ({ ...prev, name: e.target.value + (lastName ? ' ' + lastName : '') }));
                    }}
                    className="w-full"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium">{(text.form.lastName || '')}</Label>
                  <Input
                    value={studentForm.name.split(' ').slice(1).join(' ') || ''}
                    onChange={(e) => {
                      const firstName = studentForm.name.split(' ')[0] || '';
                      setStudentForm(prev => ({ ...prev, name: firstName + (e.target.value ? ' ' + e.target.value : '') }));
                    }}
                    className="w-full"
                  />
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">{(text.form.email || '')}</Label>
                <Input
                  type="email"
                  value={studentForm.email || ''}
                  onChange={(e) => setStudentForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full"
                />
              </div>
              <div>
                <Label className="text-sm font-medium flex items-center gap-2">
                  <span>🏫 {text.form.className}</span>
                  {isLoadingClasses && <div className="w-3 h-3 border border-gray-300 border-t-blue-600 rounded-full animate-spin" />}
                </Label>
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
                    value={studentForm.className} 
                    onValueChange={(value) => setStudentForm(prev => ({ ...prev, className: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">
                        {language === 'fr' ? 'Aucune classe (à assigner plus tard)' : 'No class (assign later)'}
                      </SelectItem>
                      {availableClasses.map((classItem: any) => (
                        <SelectItem key={classItem.id} value={classItem.name}>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{classItem.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {classItem.level}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              ({classItem.subjects?.length || 0} {language === 'fr' ? 'matières' : 'subjects'})
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  {language === 'fr' ? 
                    'Modifiez la classe de cet élève parmi celles créées dans votre école' : 
                    'Modify this student\'s class from those created in your school'}
                </p>
              </div>
              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={handleUpdateStudent}
                  disabled={updateStudentMutation.isPending}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  data-testid="button-confirm-edit-student"
                >
                  {updateStudentMutation.isPending ? 'Modification...' : text.buttons.update}
                </Button>
                <Button 
                  onClick={() => setIsEditStudentOpen(false)}
                  variant="outline"
                  data-testid="button-cancel-edit-student"
                >
                  {text.buttons.cancel}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Students List */}
      <Card>
        <CardHeader className="px-4 md:px-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <h3 className="text-lg font-semibold">Liste des Élèves</h3>
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleExportStudents}
                data-testid="button-export-students"
                className="flex-1 sm:flex-none"
              >
                <Download className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">{language === 'fr' ? 'Exporter' : 'Export'}</span>
                <span className="sm:hidden">{language === 'fr' ? 'Export' : 'Export'}</span>
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                data-testid="button-filter-students"
                className="flex-1 sm:flex-none"
              >
                <Filter className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">{language === 'fr' ? 'Filtrer' : 'Filter'}</span>
                <span className="sm:hidden">{language === 'fr' ? 'Filtre' : 'Filter'}</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        
        {/* Filter Panel - Mobile Optimized */}
        {isFilterOpen && (
          <div className="border-b px-4 md:px-6 py-4 bg-gray-50">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
              <div>
                <Label className="text-sm font-medium">
                  {language === 'fr' ? 'Statut' : 'Status'}
                </Label>
                <Select 
                  value={filters.status} 
                  onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{language === 'fr' ? 'Tous' : 'All'}</SelectItem>
                    <SelectItem value="active">{language === 'fr' ? 'Actif' : 'Active'}</SelectItem>
                    <SelectItem value="suspended">{language === 'fr' ? 'Suspendu' : 'Suspended'}</SelectItem>
                    <SelectItem value="graduated">{language === 'fr' ? 'Diplômé' : 'Graduated'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
                    <SelectItem value="male">{language === 'fr' ? 'Garçon' : 'Male'}</SelectItem>
                    <SelectItem value="female">{language === 'fr' ? 'Fille' : 'Female'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-medium">
                  {language === 'fr' ? 'Classe' : 'Class'}
                </Label>
                <Select 
                  value={filters.class} 
                  onValueChange={(value) => setFilters(prev => ({ ...prev, class: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{language === 'fr' ? 'Toutes' : 'All'}</SelectItem>
                    <SelectItem value="6ème A">6ème A</SelectItem>
                    <SelectItem value="6ème B">6ème B</SelectItem>
                    <SelectItem value="5ème A">5ème A</SelectItem>
                    <SelectItem value="4ème A">4ème A</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setFilters({ status: 'all', gender: 'all', class: 'all' })}
              >
                {language === 'fr' ? 'Réinitialiser' : 'Reset'}
              </Button>
            </div>
          </div>
        )}

        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun élève trouvé</h3>
              <p className="text-gray-500">Ajoutez votre premier élève pour commencer.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {(Array.isArray(filteredStudents) ? filteredStudents : []).map((student) => (
                <div key={student.id} className="border rounded-lg p-3 md:p-4 hover:bg-gray-50">
                  <div className="flex items-start gap-3 md:gap-4">
                    <Checkbox
                      checked={selectedStudents.has(student.id)}
                      onCheckedChange={() => toggleSelectStudent(student.id)}
                      data-testid={`checkbox-student-${student.id}`}
                      className="mt-1"
                    />
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <GraduationCap className="w-4 h-4 md:w-5 md:h-5 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <div className="font-medium text-gray-900">{student.firstName || ''} {student.lastName || ''}</div>
                        <Badge variant={student.status === 'active' ? 'default' : 'secondary'}>
                          {text.status[student.status]}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 mb-2 text-sm text-gray-600">
                        <span>🎓 {student.className}</span>
                        <span>📊 {student.average}/20</span>
                        <span>📅 {student.attendance}%</span>
                        <span>👨‍👩‍👧 {student.parentName}</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 mb-3 text-xs text-gray-500">
                        <span>📧 {student.email || ''}</span>
                        <span>📱 {student.parentPhone}</span>
                      </div>
                      
                      {/* Boutons d'action mobile-first sous le nom */}
                      <div className="flex flex-wrap gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          onClick={() => {
                            setViewingStudent(student);
                            setIsViewStudentOpen(true);
                          }}
                          data-testid={`button-view-student-${student.id}`}
                        >
                          <Eye className="w-4 h-4" />
                          <span className="hidden sm:inline">Voir</span>
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEditStudent(student)}
                          className="flex items-center gap-2 text-green-600 hover:text-green-700 hover:bg-green-50"
                          data-testid={`button-edit-student-${student.id}`}
                        >
                          <Edit className="w-4 h-4" />
                          <span className="hidden sm:inline">Modifier</span>
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handlePhotoUpload(student)}
                          disabled={uploadingPhoto === student.id}
                          className="flex items-center gap-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                          data-testid={`button-photo-student-${student.id}`}
                        >
                          <Camera className="w-4 h-4" />
                          <span className="hidden sm:inline">Photo</span>
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleDeleteStudent(student.id, `${student.firstName} ${student.lastName}`)}
                          className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                          data-testid={`button-delete-student-${student.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                          <span className="hidden sm:inline">Supprimer</span>
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
        importType="students"
        onImportComplete={() => {
          queryClient.invalidateQueries({ queryKey: ['/api/director/students'] });
          setIsImportModalOpen(false);
          toast({
            title: language === 'fr' ? '✅ Import réussi !' : '✅ Import Successful!',
            description: language === 'fr' ? 'Les élèves ont été importés avec succès' : 'Students have been imported successfully'
          });
        }}
      />

      {/* Student Details View Modal */}
      {isViewStudentOpen && viewingStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-[95vw] sm:max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                {language === 'fr' ? 'Profil de l\'Élève' : 'Student Profile'}
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsViewStudentOpen(false)}
                data-testid="button-close-student-view"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            
            <div className="p-6">
              <div className="flex items-start gap-6 mb-6">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <GraduationCap className="w-10 h-10 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {viewingStudent.firstName} {viewingStudent.lastName}
                  </h3>
                  <div className="flex flex-wrap gap-3 mb-4">
                    <Badge variant={viewingStudent.status === 'active' ? 'default' : 'secondary'}>
                      {text.status[viewingStudent.status]}
                    </Badge>
                    <Badge variant="outline">🎓 {viewingStudent.className}</Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 border-b pb-2">
                    {language === 'fr' ? 'Informations Personnelles' : 'Personal Information'}
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Email</label>
                      <p className="text-gray-900">{viewingStudent.email || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        {language === 'fr' ? 'Âge' : 'Age'}
                      </label>
                      <p className="text-gray-900">{viewingStudent.age || 'N/A'} ans</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        {language === 'fr' ? 'Genre' : 'Gender'}
                      </label>
                      <p className="text-gray-900">N/A</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        {language === 'fr' ? 'Matricule' : 'Student ID'}
                      </label>
                      <p className="text-gray-900">N/A</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 border-b pb-2">
                    {language === 'fr' ? 'Informations Parent' : 'Parent Information'}
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        {language === 'fr' ? 'Nom du Parent' : 'Parent Name'}
                      </label>
                      <p className="text-gray-900">{viewingStudent.parentName || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        {language === 'fr' ? 'Email Parent' : 'Parent Email'}
                      </label>
                      <p className="text-gray-900">{viewingStudent.parentEmail || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        {language === 'fr' ? 'Téléphone Parent' : 'Parent Phone'}
                      </label>
                      <p className="text-gray-900">{viewingStudent.parentPhone || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 border-b pb-2">
                    {language === 'fr' ? 'Performance Scolaire' : 'Academic Performance'}
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        {language === 'fr' ? 'Moyenne Générale' : 'Average Grade'}
                      </label>
                      <p className="text-gray-900 text-2xl font-bold text-green-600">
                        {viewingStudent.average || 0}/20
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        {language === 'fr' ? 'Taux de Présence' : 'Attendance Rate'}
                      </label>
                      <p className="text-gray-900 text-2xl font-bold text-blue-600">
                        {viewingStudent.attendance || 0}%
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 border-b pb-2">
                    {language === 'fr' ? 'Informations Scolaires' : 'School Information'}
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        {language === 'fr' ? 'Classe' : 'Class'}
                      </label>
                      <p className="text-gray-900">{viewingStudent.className || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        {language === 'fr' ? 'Niveau' : 'Level'}
                      </label>
                      <p className="text-gray-900">{viewingStudent.level || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <Button 
                  onClick={() => {
                    setIsViewStudentOpen(false);
                    handleEditStudent(viewingStudent);
                  }}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  {language === 'fr' ? 'Modifier' : 'Edit'}
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setIsViewStudentOpen(false)}
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
        onConfirm={confirmDeleteStudent}
        title={language === 'fr' ? 'Supprimer l\'élève' : 'Delete Student'}
        description={language === 'fr' 
          ? `Êtes-vous sûr de vouloir supprimer l'élève "${studentToDelete?.name}" ? Cette action est irréversible et supprimera toutes les données associées.`
          : `Are you sure you want to delete the student "${studentToDelete?.name}"? This action cannot be undone and will remove all associated data.`}
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
          ? `Êtes-vous sûr de vouloir supprimer ${selectedStudents.size} élève(s) sélectionné(s) ? Cette action est irréversible et supprimera toutes les données associées.`
          : `Are you sure you want to delete ${selectedStudents.size} selected student(s)? This action cannot be undone and will remove all associated data.`}
        confirmText={language === 'fr' ? 'Supprimer tout' : 'Delete All'}
        cancelText={language === 'fr' ? 'Annuler' : 'Cancel'}
      />
    </div>
  );
};

export default FunctionalDirectorStudentManagement;