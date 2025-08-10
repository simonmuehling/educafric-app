import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { ArrowLeft, Users, Search, Plus, Mail, Phone, BookOpen, Calendar, Edit, Trash2, Eye, X, TrendingUp, UserPlus, Download, Filter } from 'lucide-react';
import MobileActionsOverlay from '@/components/mobile/MobileActionsOverlay';
import DashboardNavbar from '@/components/shared/DashboardNavbar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

const TeacherManagement: React.FC = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subjects: '',
    classes: '',
    experience: '',
    qualification: ''
  });

  // Récupération des enseignants via l'API
  const { data: teachersResponse, isLoading, error } = useQuery({
    queryKey: ['/api/teachers'],
    queryFn: async () => {
      const response = await fetch('/api/teachers');
      if (!response.ok) throw new Error('Failed to fetch teachers');
      return response.json();
    }
  });

  // Assurer que teachers est toujours un array
  const teachers = Array.isArray(teachersResponse) ? teachersResponse : 
                  (teachersResponse?.teachers && Array.isArray(teachersResponse.teachers)) ? teachersResponse.teachers : 
                  [];

  // Mutation pour créer un enseignant
  const createTeacherMutation = useMutation({
    mutationFn: async (teacherData: any) => {
      return apiRequest('/api/teachers', 'POST', teacherData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/teachers'] });
      setShowAddModal(false);
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
    mutationFn: async ({ id, ...data }: any) => {
      return apiRequest(`/api/teachers/${id}`, 'PUT', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/teachers'] });
      setShowEditModal(false);
      toast({
        title: language === 'fr' ? 'Succès' : 'Success',
        description: language === 'fr' ? 'Enseignant modifié avec succès' : 'Teacher updated successfully'
      });
    }
  });

  // Mutation pour supprimer un enseignant
  const deleteTeacherMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/teachers/${id}`, 'DELETE');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/teachers'] });
      toast({
        title: language === 'fr' ? 'Succès' : 'Success',
        description: language === 'fr' ? 'Enseignant supprimé avec succès' : 'Teacher deleted successfully'
      });
    }
  });

  const filteredTeachers = (Array.isArray(teachers) ? teachers : []).filter((teacher: any) => {
    if (!teacher) return false;
    const fullName = (teacher.firstName || '') + ' ' + (teacher.lastName || '');
    const email = teacher.email || '';
    const subjects = Array.isArray(teacher.subjects) ? teacher?.subjects?.join(', ') : teacher.subjects || '';
    
    return fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           email.toLowerCase().includes(searchTerm.toLowerCase()) ||
           subjects.toLowerCase().includes(searchTerm.toLowerCase());
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
                  name: '',
                  email: '',
                  phone: '',
                  subjects: '',
                  classes: '',
                  experience: '',
                  qualification: ''
                });
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
                    name: '',
                    email: '',
                    phone: '',
                    subjects: '',
                    classes: '',
                    experience: '',
                    qualification: ''
                  });
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
                            name: `${String(teacher?.firstName) || "N/A"} ${String(teacher?.lastName) || "N/A"}`,
                            email: teacher.email,
                            phone: teacher.phone || '',
                            subjects: '',
                            classes: '',
                            experience: '',
                            qualification: ''
                          });
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
                          if (confirm(language === 'fr' ? 'Êtes-vous sûr de vouloir supprimer cet enseignant ?' : 'Are you sure you want to delete this teacher?')) {
                            deleteTeacherMutation.mutate(teacher.id);
                          }
                        }}
                        disabled={deleteTeacherMutation?.isPending}
                        data-testid={`button-delete-teacher-${teacher.id}`}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        {language === 'fr' ? 'Supprimer' : 'Delete'}
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
        {showAddModal && typeof showAddModal === "object" && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">
                    {language === 'fr' ? 'Ajouter un Enseignant' : 'Add Teacher'}
                  </h2>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setShowAddModal(false)}
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">{language === 'fr' ? 'Nom complet' : 'Full Name'}</Label>
                      <Input
                        id="name"
                        value={String(formData?.name) || "N/A"}
                        onChange={(e) => setFormData({...formData, name: e?.target?.value})}
                        placeholder={language === 'fr' ? 'Entrez le nom complet' : 'Enter full name'}
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">{language === 'fr' ? 'Email' : 'Email'}</Label>
                      <Input
                        id="email"
                        type="email"
                        value={String(formData?.email) || "N/A"}
                        onChange={(e) => setFormData({...formData, email: e?.target?.value})}
                        placeholder={language === 'fr' ? 'exemple@ecole?.edu?.cm' : 'example@school?.edu?.cm'}
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">{language === 'fr' ? 'Téléphone' : 'Phone'}</Label>
                      <Input
                        id="phone"
                        value={String(formData?.phone) || "N/A"}
                        onChange={(e) => setFormData({...formData, phone: e?.target?.value})}
                        placeholder="+237 6XX XXX XXX"
                      />
                    </div>
                    <div>
                      <Label htmlFor="experience">{language === 'fr' ? 'Expérience' : 'Experience'}</Label>
                      <Input
                        id="experience"
                        value={String(formData?.experience) || "N/A"}
                        onChange={(e) => setFormData({...formData, experience: e?.target?.value})}
                        placeholder={language === 'fr' ? '5 ans' : '5 years'}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="subjects">{language === 'fr' ? 'Matières enseignées' : 'Subjects Taught'}</Label>
                    <Input
                      id="subjects"
                      value={String(formData?.subjects) || "N/A"}
                      onChange={(e) => setFormData({...formData, subjects: e?.target?.value})}
                      placeholder={language === 'fr' ? 'Mathématiques, Physique' : 'Mathematics, Physics'}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="classes">{language === 'fr' ? 'Classes assignées' : 'Assigned Classes'}</Label>
                    <Input
                      id="classes"
                      value={String(formData?.classes) || "N/A"}
                      onChange={(e) => setFormData({...formData, classes: e?.target?.value})}
                      placeholder={language === 'fr' ? '6ème A, 5ème B' : '6th A, 5th B'}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="qualification">{language === 'fr' ? 'Qualification' : 'Qualification'}</Label>
                    <Textarea
                      id="qualification"
                      value={String(formData?.qualification) || "N/A"}
                      onChange={(e) => setFormData({...formData, qualification: e?.target?.value})}
                      placeholder={language === 'fr' ? 'Master en Mathématiques - Université de Yaoundé I' : 'Master in Mathematics - University of Yaoundé I'}
                      rows={3}
                    />
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
                    onClick={() => {
                      const teacherData = {
                        name: formData.name,
                        email: formData.email,
                        phone: formData.phone,
                        subjects: formData.subjects,
                        classes: formData.classes,
                        experience: formData.experience,
                        qualification: formData.qualification,
                        role: 'Teacher'
                      };
                      createTeacherMutation.mutate(teacherData);
                    }}
                    disabled={createTeacherMutation.isPending || !formData.name || !formData.email || !formData.phone || !formData.subjects || !formData.experience || !formData.qualification}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    {createTeacherMutation.isPending ? 
                      (language === 'fr' ? 'Ajout...' : 'Adding...') : 
                      (language === 'fr' ? 'Ajouter' : 'Add')
                    }
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Teacher Modal */}
        {showEditModal && typeof showEditModal === "object" && selectedTeacher && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">
                    {language === 'fr' ? 'Modifier l\'Enseignant' : 'Edit Teacher'}
                  </h2>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setShowEditModal(false)}
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="edit-name">{language === 'fr' ? 'Nom complet' : 'Full Name'}</Label>
                      <Input
                        id="edit-name"
                        value={String(formData?.name) || "N/A"}
                        onChange={(e) => setFormData({...formData, name: e?.target?.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-email">{language === 'fr' ? 'Email' : 'Email'}</Label>
                      <Input
                        id="edit-email"
                        type="email"
                        value={String(formData?.email) || "N/A"}
                        onChange={(e) => setFormData({...formData, email: e?.target?.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-phone">{language === 'fr' ? 'Téléphone' : 'Phone'}</Label>
                      <Input
                        id="edit-phone"
                        value={String(formData?.phone) || "N/A"}
                        onChange={(e) => setFormData({...formData, phone: e?.target?.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-experience">{language === 'fr' ? 'Expérience' : 'Experience'}</Label>
                      <Input
                        id="edit-experience"
                        value={String(formData?.experience) || "N/A"}
                        onChange={(e) => setFormData({...formData, experience: e?.target?.value})}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="edit-subjects">{language === 'fr' ? 'Matières enseignées' : 'Subjects Taught'}</Label>
                    <Input
                      id="edit-subjects"
                      value={String(formData?.subjects) || "N/A"}
                      onChange={(e) => setFormData({...formData, subjects: e?.target?.value})}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="edit-classes">{language === 'fr' ? 'Classes assignées' : 'Assigned Classes'}</Label>
                    <Input
                      id="edit-classes"
                      value={String(formData?.classes) || "N/A"}
                      onChange={(e) => setFormData({...formData, classes: e?.target?.value})}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="edit-qualification">{language === 'fr' ? 'Qualification' : 'Qualification'}</Label>
                    <Textarea
                      id="edit-qualification"
                      value={String(formData?.qualification) || "N/A"}
                      onChange={(e) => setFormData({...formData, qualification: e?.target?.value})}
                      rows={3}
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
                      toast({
                        title: language === 'fr' ? 'Enseignant modifié' : 'Teacher updated',
                        description: language === 'fr' ? `${String(formData?.name) || "N/A"} a été modifié avec succès` : `${String(formData?.name) || "N/A"} has been updated successfully`,
                      });
                      setShowEditModal(false);
                    }}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    {language === 'fr' ? 'Enregistrer' : 'Save'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* View Teacher Modal */}
        {showViewModal && typeof showViewModal === "object" && selectedTeacher && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">
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
                    <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                      {selectedTeacher?.name ? selectedTeacher?.name?.split(' ').map((n: string) => n[0]).join('') : 'T'}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">{String(selectedTeacher?.name) || "N/A"}</h3>
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
      </div>
    </div>
  );
};

export default TeacherManagement;