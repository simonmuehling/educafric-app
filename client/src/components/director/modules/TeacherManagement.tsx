import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { ArrowLeft, Users, Search, Plus, Mail, Phone, BookOpen, Calendar, Edit, Trash2, Eye, X, TrendingUp, UserPlus, Download, Filter, Check, WifiOff, Camera, Upload } from 'lucide-react';
import MobileActionsOverlay from '@/components/mobile/MobileActionsOverlay';
import DashboardNavbar from '@/components/shared/DashboardNavbar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { OfflineSyncStatus } from '@/components/offline/OfflineSyncStatus';
import { useOfflineTeachers } from '@/hooks/offline/useOfflineTeachers';
import { useOfflinePremium } from '@/contexts/offline/OfflinePremiumContext';

const TeacherManagement: React.FC = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  // Offline-first hooks - pass schoolId from authenticated user
  const { isOnline, pendingSyncCount } = useOfflinePremium();
  const { 
    teachers: offlineTeachers, 
    isLoading: offlineLoading,
    createTeacher: createOfflineTeacher,
    updateTeacher: updateOfflineTeacher,
    deleteTeacher: deleteOfflineTeacher
  } = useOfflineTeachers(user?.schoolId || 0);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<any>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    subjects: [] as string[],
    classes: '',
    experience: '',
    qualification: '',
    photo: null as File | null
  });

  // Camera state for photo capture
  const [showCamera, setShowCamera] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState<number | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Store stream in ref for reliable cleanup
  const streamRef = useRef<MediaStream | null>(null);

  // Initialize camera when showCamera becomes true
  useEffect(() => {
    if (showCamera) {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false })
        .then(stream => {
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            setCameraStream(stream);
            setIsCameraReady(true);
          }
        })
        .catch(err => {
          console.error('Camera access error:', err);
          toast({
            title: language === 'fr' ? '❌ Erreur caméra' : '❌ Camera Error',
            description: language === 'fr' ? 
              'Impossible d\'accéder à la caméra. Vérifiez les permissions.' : 
              'Cannot access camera. Check permissions.',
            variant: 'destructive'
          });
          setShowCamera(false);
        });
    } else {
      // Stop camera when showCamera becomes false
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      setCameraStream(null);
      setIsCameraReady(false);
    }
    
    // Cleanup on unmount
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      setCameraStream(null);
      setIsCameraReady(false);
    };
  }, [showCamera]);

  // Récupération des enseignants via l'API
  const { data: teachersResponse, isLoading, error } = useQuery({
    queryKey: ['/api/teachers'],
    queryFn: async () => {
      const response = await fetch('/api/teachers');
      if (!response.ok) throw new Error('Failed to fetch teachers');
      return response.json();
    }
  });

  // Récupération des matières de l'école
  const { data: subjectsResponse } = useQuery({
    queryKey: ['/api/subjects/school'],
    queryFn: async () => {
      const response = await fetch('/api/subjects/school');
      if (!response.ok) throw new Error('Failed to fetch subjects');
      return response.json();
    }
  });

  const subjects = Array.isArray(subjectsResponse) ? subjectsResponse : [];

  // Fetch classes for dropdown
  const { data: classesResponse } = useQuery({
    queryKey: ['/api/director/classes'],
    queryFn: async () => {
      const response = await fetch('/api/director/classes', { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch classes');
      return response.json();
    }
  });
  const classesList = classesResponse?.classes || [];

  // Assurer que teachers est toujours un array
  const serverTeachers = Array.isArray(teachersResponse) ? teachersResponse : 
                  (teachersResponse?.teachers && Array.isArray(teachersResponse.teachers)) ? teachersResponse.teachers : 
                  [];
  
  // Use offline data when not connected, otherwise use server data
  const teachers = !isOnline ? offlineTeachers : (serverTeachers.length > 0 ? serverTeachers : offlineTeachers);

  // Helper function to convert data URL to Blob
  const dataURLtoBlob = (dataURL: string): Blob => {
    const arr = dataURL.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  };

  // Mutation pour créer un enseignant
  const createTeacherMutation = useMutation({
    mutationFn: async (teacherData: any) => {
      const response = await fetch('/api/teachers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(teacherData),
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to create teacher');
      return response.json();
    },
    onSuccess: async (data) => {
      // Handle both response formats: data.id or data.teacher.id
      const newTeacherId = data.id || data.teacher?.id;
      
      // Upload photo if captured or file selected
      if (newTeacherId && (capturedPhoto || formData.photo)) {
        try {
          const photoFormData = new FormData();
          if (capturedPhoto) {
            const blob = dataURLtoBlob(capturedPhoto);
            photoFormData.append('photo', blob, 'photo.jpg');
          } else if (formData.photo) {
            photoFormData.append('photo', formData.photo);
          }
          
          const photoResponse = await fetch(`/api/teachers/${newTeacherId}/photo`, {
            method: 'POST',
            body: photoFormData,
            credentials: 'include'
          });
          if (!photoResponse.ok) {
            console.error('Photo upload failed:', await photoResponse.text());
          }
        } catch (error) {
          console.error('Photo upload failed:', error);
        }
      }
      
      queryClient.invalidateQueries({ queryKey: ['/api/teachers'] });
      queryClient.invalidateQueries({ queryKey: ['/api/director/classes'] });
      setShowAddModal(false);
      setCapturedPhoto(null);
      setFormData({...formData, photo: null});
      toast({
        title: language === 'fr' ? 'Succès' : 'Success',
        description: language === 'fr' ? 'Enseignant créé avec succès' : 'Teacher created successfully'
      });
    },
    onError: (error: any) => {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  // Mutation pour modifier un enseignant
  const updateTeacherMutation = useMutation({
    mutationFn: async ({ id, capturedPhotoData, photoFile, ...data }: any) => {
      const response = await fetch(`/api/teachers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to update teacher');
      return { teacherId: id, capturedPhotoData, photoFile };
    },
    onSuccess: async ({ teacherId, capturedPhotoData, photoFile }) => {
      // Upload photo if captured or file selected
      const hasNewPhoto = (capturedPhotoData && capturedPhotoData.startsWith('data:')) || photoFile;
      
      if (hasNewPhoto) {
        try {
          const photoFormData = new FormData();
          if (capturedPhotoData && capturedPhotoData.startsWith('data:')) {
            const blob = dataURLtoBlob(capturedPhotoData);
            photoFormData.append('photo', blob, 'photo.jpg');
          } else if (photoFile) {
            photoFormData.append('photo', photoFile);
          }
          
          const photoResponse = await fetch(`/api/teachers/${teacherId}/photo`, {
            method: 'POST',
            body: photoFormData,
            credentials: 'include'
          });
          if (!photoResponse.ok) {
            console.error('Photo upload failed:', await photoResponse.text());
          }
        } catch (error) {
          console.error('Photo upload failed:', error);
        }
      }
      
      queryClient.invalidateQueries({ queryKey: ['/api/teachers'] });
      queryClient.invalidateQueries({ queryKey: ['/api/director/classes'] });
      setShowEditModal(false);
      setCapturedPhoto(null);
      setFormData({...formData, photo: null});
      toast({
        title: language === 'fr' ? 'Succès' : 'Success',
        description: language === 'fr' ? 'Enseignant modifié avec succès' : 'Teacher updated successfully'
      });
    }
  });

  // Mutation pour retirer un enseignant de l'école (ne supprime pas le compte)
  const deleteTeacherMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/teachers/${id}`, 'DELETE');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/teachers'] });
      queryClient.invalidateQueries({ queryKey: ['/api/director/classes'] });
      toast({
        title: language === 'fr' ? 'Succès' : 'Success',
        description: language === 'fr' ? 'Enseignant retiré de l\'école avec succès' : 'Teacher removed from school successfully'
      });
    }
  });

  // Mutation for uploading teacher photo
  const uploadPhotoMutation = useMutation({
    mutationFn: async ({ teacherId, formData }: { teacherId: number, formData: FormData }) => {
      const response = await fetch(`/api/teachers/${teacherId}/photo`, {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Upload failed');
      return response.json();
    },
    onSuccess: () => {
      setUploadingPhoto(null);
      toast({
        title: language === 'fr' ? '📷 Photo uploadée !' : '📷 Photo Uploaded!',
        description: language === 'fr' ? 'Photo de profil mise à jour avec succès' : 'Profile photo updated successfully'
      });
      queryClient.invalidateQueries({ queryKey: ['/api/teachers'] });
    },
    onError: () => {
      setUploadingPhoto(null);
      toast({
        title: language === 'fr' ? '❌ Erreur d\'upload' : '❌ Upload Error',
        description: language === 'fr' ? 'Impossible d\'uploader la photo' : 'Failed to upload photo',
        variant: 'destructive'
      });
    }
  });

  // Handle photo upload for existing teacher
  const handlePhotoUpload = (teacher: any) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        if (file.size > 5 * 1024 * 1024) {
          toast({
            title: language === 'fr' ? '❌ Fichier trop lourd' : '❌ File Too Large',
            description: language === 'fr' ? 'La photo doit faire moins de 5MB' : 'Photo must be less than 5MB',
            variant: 'destructive'
          });
          return;
        }
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

  const filteredTeachers = (Array.isArray(teachers) ? teachers : []).filter((teacher: any) => {
    if (!teacher) return false;
    const fullName = (teacher.firstName || '') + ' ' + (teacher.lastName || '');
    const email = teacher.email || '';
    const teacherSubjects = Array.isArray(teacher.subjects) ? teacher.subjects.join(', ') : (teacher.subjects || '');
    
    return fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           email.toLowerCase().includes(searchTerm.toLowerCase()) ||
           teacherSubjects.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Actif': return 'bg-green-100 text-green-800';
      case 'Congé': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Offline Status Banner */}
        {(!isOnline || pendingSyncCount > 0) && (
          <OfflineSyncStatus showDetails={true} className="mb-4" />
        )}

        {/* Search and Actions */}
        <Card className="bg-white/80 backdrop-blur-md shadow-xl border border-white/30 p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder={language === 'fr' ? 'Rechercher un enseignant...' : 'Search teacher...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e?.target?.value)}
                className="pl-10"
              />
            </div>
            <Button 
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => {
                setFormData({
                  firstName: '',
                  lastName: '',
                  email: '',
                  phone: '',
                  subjects: [],
                  classes: '',
                  experience: '',
                  qualification: '',
                  photo: null
                });
                setCapturedPhoto(null);
                setShowAddModal(true);
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              {language === 'fr' ? 'Ajouter Enseignant' : 'Add Teacher'}
            </Button>
          </div>
        </Card>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">
                  {language === 'fr' ? 'Total Enseignants' : 'Total Teachers'}
                </p>
                <p className="text-3xl font-bold">{String(teachers?.length) || "N/A"}</p>
              </div>
              <Users className="w-10 h-10 text-blue-200" />
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">
                  {language === 'fr' ? 'Enseignants Actifs' : 'Active Teachers'}
                </p>
                <p className="text-3xl font-bold">{(Array.isArray(teachers) ? teachers : []).filter((t: any) => t.role === 'Teacher').length}</p>
              </div>
              <Users className="w-10 h-10 text-green-200" />
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">
                  {language === 'fr' ? 'Matières Enseignées' : 'Subjects Taught'}
                </p>
                <p className="text-3xl font-bold">12</p>
              </div>
              <BookOpen className="w-10 h-10 text-purple-200" />
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">
                  {language === 'fr' ? 'Exp. Moyenne' : 'Avg. Experience'}
                </p>
                <p className="text-3xl font-bold">9 ans</p>
              </div>
              <Calendar className="w-10 h-10 text-orange-200" />
            </div>
          </Card>
        </div>

        {/* Quick Actions - Mobile Optimized */}
        <Card className="bg-white/80 backdrop-blur-md shadow-xl border border-white/30 p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            {language === 'fr' ? 'Actions Rapides' : 'Quick Actions'}
          </h3>
          <MobileActionsOverlay
            title={language === 'fr' ? 'Actions Enseignants' : 'Teacher Actions'}
            maxVisibleButtons={3}
            actions={[
              {
                id: 'add-teacher',
                label: language === 'fr' ? 'Ajouter Enseignant' : 'Add Teacher',
                icon: <UserPlus className="w-5 h-5" />,
                onClick: () => {
                  setFormData({
                    firstName: '',
                    lastName: '',
                    email: '',
                    phone: '',
                    subjects: [],
                    classes: '',
                    experience: '',
                    qualification: '',
                    photo: null
                  });
                  setCapturedPhoto(null);
                  setShowAddModal(true);
                },
                color: 'bg-blue-600 hover:bg-blue-700'
              },
              {
                id: 'assign-classes',
                label: language === 'fr' ? 'Assigner Classes' : 'Assign Classes',
                icon: <BookOpen className="w-5 h-5" />,
                onClick: () => {
                  const event = new CustomEvent('switchToClasses');
                  window.dispatchEvent(event);
                },
                color: 'bg-green-600 hover:bg-green-700'
              },
              {
                id: 'schedule-teachers',
                label: language === 'fr' ? 'Planifier Horaires' : 'Schedule Teachers',
                icon: <Calendar className="w-5 h-5" />,
                onClick: () => {
                  const event = new CustomEvent('switchToTimetable');
                  window.dispatchEvent(event);
                },
                color: 'bg-purple-600 hover:bg-purple-700'
              },
              {
                id: 'export-teachers',
                label: language === 'fr' ? 'Exporter Liste' : 'Export List',
                icon: <Download className="w-5 h-5" />,
                onClick: async () => {
                  try {
                    console.log('[TEACHER_EXPORT] 📊 Starting teacher export...');
                    
                    // Create CSV content
                    const csvContent = [
                      ['Nom', 'Email', 'Téléphone', 'Rôle', 'École ID'].join(','),
                      ...(Array.isArray(filteredTeachers) ? filteredTeachers : []).map((teacher: any) => [
                        `"${String(teacher?.firstName) || "N/A"} ${String(teacher?.lastName) || "N/A"}"`,
                        `"${String(teacher?.email) || "N/A"}"`,
                        `"${teacher.phone || 'N/A'}"`,
                        `"${String(teacher?.role) || "N/A"}"`,
                        `"${String(teacher?.schoolId) || "N/A"}"`
                      ].join(','))
                    ].join('\n');
                    
                    // Download CSV file
                    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                    const link = document.createElement('a');
                    const url = URL.createObjectURL(blob);
                    link.setAttribute('href', url);
                    link.setAttribute('download', `enseignants_${new Date().toISOString().split('T')[0]}.csv`);
                    if (link.style) link.style.visibility = 'hidden';
                    if (document.body) document.body.appendChild(link);
                    link.click();
                    if (document.body) document.body.removeChild(link);
                    
                    toast({
                      title: language === 'fr' ? 'Export réussi' : 'Export successful',
                      description: language === 'fr' ? 'Liste des enseignants exportée en CSV' : 'Teacher list exported as CSV'
                    });
                    
                    console.log('[TEACHER_EXPORT] ✅ Export completed successfully');
                  } catch (error) {
                    console.error('[TEACHER_EXPORT] ❌ Export failed:', error);
                    toast({
                      title: language === 'fr' ? 'Erreur d\'export' : 'Export error',
                      description: language === 'fr' ? 'Impossible d\'exporter la liste' : 'Failed to export list',
                      variant: 'destructive'
                    });
                  }
                },
                color: 'bg-orange-600 hover:bg-orange-700'
              },
              {
                id: 'communicate',
                label: language === 'fr' ? 'Communications' : 'Communications',
                icon: <Mail className="w-5 h-5" />,
                onClick: () => {
                  const event = new CustomEvent('switchToCommunications');
                  window.dispatchEvent(event);
                },
                color: 'bg-teal-600 hover:bg-teal-700'
              }
            ]}
          />
        </Card>

        {/* Teachers List */}
        <Card className="bg-white/80 backdrop-blur-md shadow-xl border border-white/30 p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-6">
            {language === 'fr' ? 'Liste des Enseignants' : 'Teachers List'}
          </h3>
          
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="p-6">
                  <div className="animate-pulse">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="h-4 bg-gray-300 rounded w-32"></div>
                      <div className="h-6 bg-gray-300 rounded-full w-16"></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="h-3 bg-gray-300 rounded w-48"></div>
                      <div className="h-3 bg-gray-300 rounded w-32"></div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : error ? (
            <Card className="bg-red-50 border-red-200 p-6 text-center">
              <p className="text-red-600">
                {language === 'fr' ? 'Erreur lors du chargement des enseignants' : 'Error loading teachers'}
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {(Array.isArray(filteredTeachers) ? filteredTeachers : []).map((teacher: any) => (
                <Card key={String(teacher?.id) || "N/A"} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="text-lg font-semibold text-gray-900">
                          {String(teacher?.firstName) || "N/A"} {String(teacher?.lastName) || "N/A"}
                        </h4>
                        <Badge className={teacher.role === 'Teacher' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}>
                          {String(teacher?.role) || "N/A"}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                          <Mail className="w-4 h-4" />
                          <span>{String(teacher?.email) || "N/A"}</span>
                        </div>
                        {teacher.phone && (
                          <div className="flex items-center space-x-2">
                            <Phone className="w-4 h-4" />
                            <span>{String(teacher?.phone) || "N/A"}</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-2">
                          <BookOpen className="w-4 h-4" />
                          <span>{String(teacher?.role) || "N/A"}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Users className="w-4 h-4" />
                          <span>{language === 'fr' ? 'École ID:' : 'School ID:'} {String(teacher?.schoolId) || "N/A"}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setSelectedTeacher(teacher);
                          setShowViewModal(true);
                        }}
                        data-testid={`button-view-teacher-${teacher.id}`}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        {language === 'fr' ? 'Voir' : 'View'}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setSelectedTeacher(teacher);
                          setFormData({
                            firstName: String(teacher?.firstName) || "",
                            lastName: String(teacher?.lastName) || "",
                            email: teacher.email,
                            phone: teacher.phone || '',
                            subjects: Array.isArray(teacher.subjects) ? teacher.subjects : [],
                            classes: teacher.classes || '',
                            experience: teacher.experience || '',
                            qualification: teacher.qualification || '',
                            photo: null
                          });
                          setCapturedPhoto(teacher.profilePictureUrl || teacher.profileImage || null);
                          setShowEditModal(true);
                        }}
                        data-testid={`button-edit-teacher-${teacher.id}`}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        {language === 'fr' ? 'Modifier' : 'Edit'}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-red-600 hover:text-red-700"
                        onClick={() => {
                          if (confirm(language === 'fr' ? 'Êtes-vous sûr de vouloir retirer cet enseignant de l\'école ? Son compte restera actif.' : 'Are you sure you want to remove this teacher from school? Their account will remain active.')) {
                            deleteTeacherMutation.mutate(teacher.id);
                          }
                        }}
                        disabled={deleteTeacherMutation?.isPending}
                        data-testid={`button-remove-teacher-${teacher.id}`}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        {language === 'fr' ? 'Retirer' : 'Remove'}
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {(Array.isArray(filteredTeachers) ? filteredTeachers.length : 0) === 0 && (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">
                {language === 'fr' ? 'Aucun enseignant trouvé' : 'No teachers found'}
              </p>
            </div>
          )}
        </Card>

        {/* Add Teacher Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
            <div className="bg-white rounded-lg max-w-[95vw] sm:max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
              <div className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <h2 className="text-xl sm:text-2xl font-bold">
                    {language === 'fr' ? 'Ajouter un Enseignant' : 'Add Teacher'}
                  </h2>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      setShowAddModal(false);
                      setCapturedPhoto(null);
                      setFormData({...formData, photo: null});
                    }}
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                <div className="space-y-4">
                  {/* Photo Upload Section */}
                  <div>
                    <Label className="text-sm font-medium">
                      {language === 'fr' ? 'Photo de l\'enseignant (optionnelle)' : 'Teacher Photo (optional)'}
                    </Label>
                    <div className="mt-2 space-y-3">
                      <div className="flex items-center gap-4">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0] || null;
                            setFormData({...formData, photo: file});
                            setCapturedPhoto(null);
                          }}
                          className="hidden"
                          id="teacher-photo-upload"
                        />
                        <label
                          htmlFor="teacher-photo-upload"
                          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer border"
                        >
                          <Upload className="w-4 h-4" />
                          {language === 'fr' ? 'Choisir une photo' : 'Choose Photo'}
                        </label>
                        {formData.photo && (
                          <span className="text-sm text-green-600">
                            ✓ {formData.photo.name}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <Button
                          type="button"
                          onClick={() => {
                            setShowCamera(true);
                            setFormData({...formData, photo: null});
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
                      
                      {capturedPhoto && (
                        <div className="mt-3">
                          <img
                            src={capturedPhoto}
                            alt="Preview"
                            className="w-24 h-24 object-cover rounded-full border-4 border-blue-200 shadow-lg"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">{language === 'fr' ? 'Prénom' : 'First Name'}</Label>
                      <Input
                        id="firstName"
                        value={String(formData?.firstName) || ""}
                        onChange={(e) => setFormData({...formData, firstName: e?.target?.value})}
                        placeholder={language === 'fr' ? 'Entrez le prénom' : 'Enter first name'}
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">{language === 'fr' ? 'Nom' : 'Last Name'}</Label>
                      <Input
                        id="lastName"
                        value={String(formData?.lastName) || ""}
                        onChange={(e) => setFormData({...formData, lastName: e?.target?.value})}
                        placeholder={language === 'fr' ? 'Entrez le nom' : 'Enter last name'}
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">{language === 'fr' ? 'Email' : 'Email'}</Label>
                      <Input
                        id="email"
                        type="email"
                        value={String(formData?.email) || ""}
                        onChange={(e) => setFormData({...formData, email: e?.target?.value})}
                        placeholder={language === 'fr' ? 'exemple@ecole?.edu?.cm' : 'example@school?.edu?.cm'}
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">{language === 'fr' ? 'Téléphone' : 'Phone'}</Label>
                      <Input
                        id="phone"
                        value={String(formData?.phone) || ""}
                        onChange={(e) => setFormData({...formData, phone: e?.target?.value})}
                        placeholder="+237 6XX XXX XXX"
                      />
                    </div>
                    <div>
                      <Label htmlFor="experience">{language === 'fr' ? 'Expérience' : 'Experience'}</Label>
                      <Input
                        id="experience"
                        value={String(formData?.experience) || ""}
                        onChange={(e) => setFormData({...formData, experience: e?.target?.value})}
                        placeholder={language === 'fr' ? '5 ans' : '5 years'}
                      />
                    </div>
                    <div>
                      <Label htmlFor="qualification">{language === 'fr' ? 'Qualification' : 'Qualification'}</Label>
                      <Input
                        id="qualification"
                        value={String(formData?.qualification) || ""}
                        onChange={(e) => setFormData({...formData, qualification: e?.target?.value})}
                        placeholder={language === 'fr' ? 'Licence/Master' : 'Degree/Master'}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label>{language === 'fr' ? 'Matières enseignées' : 'Subjects Taught'}</Label>
                    <div className="grid grid-cols-2 gap-3 mt-2 p-4 border rounded-lg bg-gray-50">
                      {subjects.map((subject: any) => (
                        <div key={subject.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`subject-${subject.id}`}
                            checked={formData.subjects.includes(subject.nameFr || subject.nameEn)}
                            onCheckedChange={(checked) => {
                              const subjectName = language === 'fr' ? subject.nameFr : subject.nameEn;
                              if (checked) {
                                setFormData({
                                  ...formData,
                                  subjects: [...formData.subjects, subjectName]
                                });
                              } else {
                                setFormData({
                                  ...formData,
                                  subjects: formData.subjects.filter(s => s !== subjectName)
                                });
                              }
                            }}
                          />
                          <Label htmlFor={`subject-${subject.id}`} className="text-sm">
                            {language === 'fr' ? subject.nameFr : subject.nameEn}
                          </Label>
                        </div>
                      ))}
                    </div>
                    {formData.subjects.length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-600">
                          {language === 'fr' ? 'Matières sélectionnées:' : 'Selected subjects:'} {formData.subjects.join(', ')}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <Label>{language === 'fr' ? 'Classe (optionnelle)' : 'Class (optional)'}</Label>
                    <Select 
                      value={formData?.classes || ''} 
                      onValueChange={(value) => {
                        setFormData({...formData, classes: value});
                      }}
                    >
                      <SelectTrigger className="bg-white border-gray-300">
                        <SelectValue placeholder={language === 'fr' ? 'Choisir une classe' : 'Choose a class'} />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectItem value="">
                          {language === 'fr' ? 'Aucune classe (assigner plus tard)' : 'No class (assign later)'}
                        </SelectItem>
                        {classesList.map((classItem: any) => {
                          const subjectCount = classItem.subjects?.length || 0;
                          const subjectText = language === 'fr' 
                            ? `${subjectCount} matière${subjectCount !== 1 ? 's' : ''}`
                            : `${subjectCount} subject${subjectCount !== 1 ? 's' : ''}`;
                          return (
                            <SelectItem key={classItem.id} value={classItem.name}>
                              <span className="flex items-center gap-2">
                                {classItem.name}
                                <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">
                                  ({subjectText})
                                </span>
                              </span>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowAddModal(false)}
                    className="flex-1"
                  >
                    {language === 'fr' ? 'Annuler' : 'Cancel'}
                  </Button>
                  <Button 
                    onClick={async () => {
                      const teacherData = {
                        firstName: formData.firstName,
                        lastName: formData.lastName,
                        email: formData.email,
                        phone: formData.phone,
                        subjects: formData.subjects,
                        experience: formData.experience,
                        qualification: formData.qualification,
                        role: 'Teacher'
                      };
                      
                      // Use offline-first approach
                      if (!isOnline) {
                        console.log('[TEACHER_MANAGEMENT] 📴 Offline mode - creating locally');
                        try {
                          await createOfflineTeacher({
                            firstName: formData.firstName,
                            lastName: formData.lastName,
                            email: formData.email || undefined,
                            phone: formData.phone,
                            subject: formData.subjects?.join(', ') || undefined,
                            schoolId: user?.schoolId || 0
                          });
                          toast({
                            title: language === 'fr' ? '📴 Enseignant créé localement' : '📴 Teacher created locally',
                            description: language === 'fr' ? 'Sera synchronisé à la reconnexion' : 'Will sync when reconnected'
                          });
                          setShowAddModal(false);
                          setCapturedPhoto(null);
                          setFormData({
                            firstName: '', lastName: '', email: '', phone: '',
                            subjects: [], classes: '', experience: '', qualification: '',
                            photo: null
                          });
                        } catch (error) {
                          console.error('[TEACHER_MANAGEMENT] ❌ Offline create error:', error);
                          toast({
                            title: language === 'fr' ? 'Erreur' : 'Error',
                            description: language === 'fr' ? 'Impossible de créer l\'enseignant' : 'Failed to create teacher',
                            variant: 'destructive'
                          });
                        }
                      } else {
                        createTeacherMutation.mutate(teacherData);
                      }
                    }}
                    disabled={createTeacherMutation.isPending || !formData.firstName || !formData.lastName || !formData.email || !formData.phone}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    {createTeacherMutation.isPending ? 
                      (language === 'fr' ? 'Ajout...' : 'Adding...') : 
                      (!isOnline ? (language === 'fr' ? 'Ajouter (hors ligne)' : 'Add (offline)') : (language === 'fr' ? 'Ajouter' : 'Add'))
                    }
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Teacher Modal */}
        {showEditModal && selectedTeacher && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
            <div className="bg-white rounded-lg max-w-[95vw] sm:max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
              <div className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <h2 className="text-xl sm:text-2xl font-bold">
                    {language === 'fr' ? 'Modifier l\'Enseignant' : 'Edit Teacher'}
                  </h2>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      setShowEditModal(false);
                      setCapturedPhoto(null);
                    }}
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                <div className="space-y-4">
                  {/* Photo Upload/Update Section */}
                  <div>
                    <Label className="text-sm font-medium">
                      {language === 'fr' ? 'Photo de profil' : 'Profile Photo'}
                    </Label>
                    <div className="mt-2 flex items-center gap-4">
                      {(() => {
                        const photoUrl = capturedPhoto || selectedTeacher.profilePictureUrl || selectedTeacher.profileImage;
                        if (photoUrl) {
                          return (
                            <img
                              src={photoUrl}
                              alt="Profile"
                              className="w-20 h-20 object-cover rounded-full border-4 border-blue-200 shadow-lg"
                            />
                          );
                        }
                        return (
                          <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl border-4 border-blue-200">
                            {(selectedTeacher.firstName?.[0] || '') + (selectedTeacher.lastName?.[0] || 'T')}
                          </div>
                        );
                      })()}
                      <div className="flex flex-col gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handlePhotoUpload(selectedTeacher)}
                          disabled={uploadingPhoto === selectedTeacher.id}
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          {uploadingPhoto === selectedTeacher.id ? 
                            (language === 'fr' ? 'Upload...' : 'Uploading...') : 
                            (language === 'fr' ? 'Choisir une photo' : 'Choose Photo')}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setShowCamera(true)}
                          className="text-blue-600"
                        >
                          <Camera className="w-4 h-4 mr-2" />
                          {language === 'fr' ? 'Prendre une photo' : 'Take Photo'}
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="edit-firstName">{language === 'fr' ? 'Prénom' : 'First Name'}</Label>
                      <Input
                        id="edit-firstName"
                        value={String(formData?.firstName) || ""}
                        onChange={(e) => setFormData({...formData, firstName: e?.target?.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-lastName">{language === 'fr' ? 'Nom' : 'Last Name'}</Label>
                      <Input
                        id="edit-lastName"
                        value={String(formData?.lastName) || ""}
                        onChange={(e) => setFormData({...formData, lastName: e?.target?.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-email">{language === 'fr' ? 'Email' : 'Email'}</Label>
                      <Input
                        id="edit-email"
                        type="email"
                        value={String(formData?.email) || ""}
                        onChange={(e) => setFormData({...formData, email: e?.target?.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-phone">{language === 'fr' ? 'Téléphone' : 'Phone'}</Label>
                      <Input
                        id="edit-phone"
                        value={String(formData?.phone) || ""}
                        onChange={(e) => setFormData({...formData, phone: e?.target?.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-experience">{language === 'fr' ? 'Expérience' : 'Experience'}</Label>
                      <Input
                        id="edit-experience"
                        value={String(formData?.experience) || ""}
                        onChange={(e) => setFormData({...formData, experience: e?.target?.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-qualification">{language === 'fr' ? 'Qualification' : 'Qualification'}</Label>
                      <Input
                        id="edit-qualification"
                        value={String(formData?.qualification) || ""}
                        onChange={(e) => setFormData({...formData, qualification: e?.target?.value})}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label>{language === 'fr' ? 'Matières enseignées' : 'Subjects Taught'}</Label>
                    <div className="grid grid-cols-2 gap-3 mt-2 p-4 border rounded-lg bg-gray-50">
                      {subjects.map((subject: any) => (
                        <div key={subject.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`edit-subject-${subject.id}`}
                            checked={formData.subjects.includes(subject.nameFr || subject.nameEn)}
                            onCheckedChange={(checked) => {
                              const subjectName = language === 'fr' ? subject.nameFr : subject.nameEn;
                              if (checked) {
                                setFormData({
                                  ...formData,
                                  subjects: [...formData.subjects, subjectName]
                                });
                              } else {
                                setFormData({
                                  ...formData,
                                  subjects: formData.subjects.filter(s => s !== subjectName)
                                });
                              }
                            }}
                          />
                          <Label htmlFor={`edit-subject-${subject.id}`} className="text-sm">
                            {language === 'fr' ? subject.nameFr : subject.nameEn}
                          </Label>
                        </div>
                      ))}
                    </div>
                    {formData.subjects.length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-600">
                          {language === 'fr' ? 'Matières sélectionnées:' : 'Selected subjects:'} {formData.subjects.join(', ')}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="edit-classes">{language === 'fr' ? 'Classes assignées' : 'Assigned Classes'}</Label>
                    <Input
                      id="edit-classes"
                      value={String(formData?.classes) || "N/A"}
                      onChange={(e) => setFormData({...formData, classes: e?.target?.value})}
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowEditModal(false)}
                    className="flex-1"
                  >
                    {language === 'fr' ? 'Annuler' : 'Cancel'}
                  </Button>
                  <Button 
                    onClick={() => {
                      const updateData = {
                        firstName: formData.firstName,
                        lastName: formData.lastName,
                        email: formData.email,
                        phone: formData.phone,
                        subjects: formData.subjects,
                        experience: formData.experience,
                        qualification: formData.qualification
                      };
                      updateTeacherMutation.mutate({ 
                        id: selectedTeacher.id, 
                        capturedPhotoData: capturedPhoto,
                        photoFile: formData.photo,
                        ...updateData 
                      });
                    }}
                    disabled={updateTeacherMutation.isPending}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    {updateTeacherMutation.isPending ? (language === 'fr' ? 'Enregistrement...' : 'Saving...') : (language === 'fr' ? 'Enregistrer' : 'Save')}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* View Teacher Modal */}
        {showViewModal && selectedTeacher && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
            <div className="bg-white rounded-lg max-w-[95vw] sm:max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
              <div className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <h2 className="text-xl sm:text-2xl font-bold">
                    {language === 'fr' ? 'Détails de l\'Enseignant' : 'Teacher Details'}
                  </h2>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setShowViewModal(false)}
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    {(() => {
                      const photoUrl = selectedTeacher.profilePictureUrl || selectedTeacher.profileImage || selectedTeacher.photoUrl || selectedTeacher.photo;
                      
                      let photoSrc: string | null = null;
                      if (photoUrl) {
                        if (photoUrl.startsWith('http') || photoUrl.startsWith('data:') || photoUrl.startsWith('/')) {
                          photoSrc = photoUrl;
                        } else {
                          photoSrc = `/uploads/teachers/${photoUrl}`;
                        }
                      }
                      
                      if (photoSrc) {
                        return (
                          <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-blue-200 shadow-lg">
                            <img 
                              src={photoSrc}
                              alt={`${selectedTeacher.firstName || ''} ${selectedTeacher.lastName || ''}`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.currentTarget;
                                target.style.display = 'none';
                                const parent = target.parentElement;
                                if (parent) {
                                  parent.innerHTML = `<div class="w-full h-full bg-blue-600 flex items-center justify-center text-white font-bold text-xl">${(selectedTeacher.firstName?.[0] || '') + (selectedTeacher.lastName?.[0] || 'T')}</div>`;
                                }
                              }}
                            />
                          </div>
                        );
                      }
                      
                      const initials = (selectedTeacher.firstName?.[0] || '') + (selectedTeacher.lastName?.[0] || '');
                      return (
                        <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-2xl border-4 border-blue-200 shadow-lg">
                          {initials || 'T'}
                        </div>
                      );
                    })()}
                    <div>
                      <h3 className="text-xl font-semibold">{selectedTeacher.firstName} {selectedTeacher.lastName}</h3>
                      <Badge className={getStatusColor(selectedTeacher.status)}>
                        {String(selectedTeacher?.status) || "N/A"}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <Mail className="w-5 h-5 text-gray-600" />
                        <span className="font-medium">{language === 'fr' ? 'Email' : 'Email'}</span>
                      </div>
                      <p>{String(selectedTeacher?.email) || "N/A"}</p>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <Phone className="w-5 h-5 text-gray-600" />
                        <span className="font-medium">{language === 'fr' ? 'Téléphone' : 'Phone'}</span>
                      </div>
                      <p>{String(selectedTeacher?.phone) || "N/A"}</p>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <BookOpen className="w-5 h-5 text-gray-600" />
                        <span className="font-medium">{language === 'fr' ? 'Matières' : 'Subjects'}</span>
                      </div>
                      <p>{selectedTeacher?.subjects?.join(', ')}</p>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <Users className="w-5 h-5 text-gray-600" />
                        <span className="font-medium">{language === 'fr' ? 'Classes' : 'Classes'}</span>
                      </div>
                      <p>{selectedTeacher?.classes?.join(', ')}</p>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <Calendar className="w-5 h-5 text-gray-600" />
                        <span className="font-medium">{language === 'fr' ? 'Expérience' : 'Experience'}</span>
                      </div>
                      <p>{String(selectedTeacher?.experience) || "N/A"}</p>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <BookOpen className="w-5 h-5 text-gray-600" />
                        <span className="font-medium">{language === 'fr' ? 'Qualification' : 'Qualification'}</span>
                      </div>
                      <p>{String(selectedTeacher?.qualification) || "N/A"}</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end mt-6">
                  <Button 
                    onClick={() => setShowViewModal(false)}
                  >
                    {language === 'fr' ? 'Fermer' : 'Close'}
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
                  {language === 'fr' ? 'Prendre une photo de l\'enseignant' : 'Take Teacher Photo'}
                </h3>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    if (cameraStream) {
                      cameraStream.getTracks().forEach(track => track.stop());
                    }
                    setCameraStream(null);
                    setIsCameraReady(false);
                    setShowCamera(false);
                  }}
                  data-testid="button-close-camera"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-4">
                {/* Camera Preview Area */}
                <div className="bg-gray-100 rounded-lg overflow-hidden relative" style={{ height: '400px' }}>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  {!isCameraReady && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                      <div className="text-center">
                        <Camera className="w-16 h-16 mx-auto text-gray-400 mb-4 animate-pulse" />
                        <p className="text-gray-600">
                          {language === 'fr' ? 'Initialisation de la caméra...' : 'Initializing camera...'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Camera Controls */}
                <div className="flex gap-3">
                  <Button
                    onClick={() => {
                      if (videoRef.current && isCameraReady) {
                        const canvas = document.createElement('canvas');
                        canvas.width = videoRef.current.videoWidth;
                        canvas.height = videoRef.current.videoHeight;
                        const ctx = canvas.getContext('2d');
                        if (ctx) {
                          ctx.drawImage(videoRef.current, 0, 0);
                          const photoDataUrl = canvas.toDataURL('image/jpeg', 0.8);
                          setCapturedPhoto(photoDataUrl);
                          
                          if (cameraStream) {
                            cameraStream.getTracks().forEach(track => track.stop());
                          }
                          setCameraStream(null);
                          setIsCameraReady(false);
                          setShowCamera(false);
                          
                          toast({
                            title: language === 'fr' ? '📸 Photo capturée!' : '📸 Photo captured!',
                            description: language === 'fr' ? 'Photo enregistrée avec succès' : 'Photo saved successfully'
                          });
                        }
                      }
                    }}
                    disabled={!isCameraReady}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                    data-testid="button-capture-photo"
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    {language === 'fr' ? 'Capturer la photo' : 'Capture Photo'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (cameraStream) {
                        cameraStream.getTracks().forEach(track => track.stop());
                      }
                      setCameraStream(null);
                      setIsCameraReady(false);
                      setShowCamera(false);
                    }}
                    data-testid="button-cancel-camera"
                  >
                    {language === 'fr' ? 'Annuler' : 'Cancel'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherManagement;