import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Building2, Search, Filter, Plus, Edit, 
  Users, MapPin, Phone, Mail, Eye, Calendar, CreditCard, Trash2
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { apiRequest } from '@/lib/queryClient';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const createSchoolFormSchema = z.object({
  name: z.string().min(1, 'School name is required'),
  type: z.enum(['private', 'public'], { required_error: 'School type is required' }),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  educafricNumber: z.string().optional()
});

const FunctionalSiteAdminSchools: React.FC = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedSchool, setSelectedSchool] = useState<any>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [schoolForSettings, setSchoolForSettings] = useState<any>(null);
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
  
  const form = useForm<z.infer<typeof createSchoolFormSchema>>({
    resolver: zodResolver(createSchoolFormSchema),
    defaultValues: {
      name: '',
      type: 'private',
      address: '',
      phone: '',
      email: '',
      educafricNumber: ''
    }
  });

  const { data: schools, isLoading } = useQuery({
    queryKey: ['/api/siteadmin/schools', searchTerm, typeFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (typeFilter !== 'all') params.append('type', typeFilter);
      params.append('limit', '1000'); // Fetch all schools
      
      const response = await fetch(`/api/siteadmin/schools?${params.toString()}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch schools');
      return response.json();
    },
    enabled: !!user
  });

  const createSchoolMutation = useMutation({
    mutationFn: async (schoolData: z.infer<typeof createSchoolFormSchema>) => {
      return await apiRequest('/api/siteadmin/schools', {
        method: 'POST',
        body: JSON.stringify(schoolData)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/siteadmin/schools'] });
      toast({
        title: language === 'fr' ? 'Succès' : 'Success',
        description: language === 'fr' ? 'École créée avec succès' : 'School created successfully'
      });
      setIsCreateDialogOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: error.message || (language === 'fr' ? 'Échec de la création de l\'école' : 'Failed to create school'),
        variant: 'destructive'
      });
    }
  });

  const onSubmitCreateSchool = (data: z.infer<typeof createSchoolFormSchema>) => {
    createSchoolMutation.mutate(data);
  };

  const toggleOfflinePremiumMutation = useMutation({
    mutationFn: async ({ schoolId, enabled }: { schoolId: number; enabled: boolean }) => {
      const response = await fetch(`/api/siteadmin/schools/${schoolId}/offline-premium`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ enabled })
      });
      if (!response.ok) throw new Error('Failed to update offline premium');
      return response.json();
    },
    onSuccess: (_, { enabled }) => {
      queryClient.invalidateQueries({ queryKey: ['/api/siteadmin/schools'] });
      toast({
        title: language === 'fr' ? 'Succès' : 'Success',
        description: language === 'fr' 
          ? `Offline Premium ${enabled ? 'activé' : 'désactivé'}` 
          : `Offline Premium ${enabled ? 'enabled' : 'disabled'}`
      });
      if (schoolForSettings) {
        setSchoolForSettings({ ...schoolForSettings, offlinePremiumEnabled: enabled });
      }
    },
    onError: () => {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' ? 'Échec de la mise à jour' : 'Failed to update',
        variant: 'destructive'
      });
    }
  });

  const updateModuleVisibilityMutation = useMutation({
    mutationFn: async ({ schoolId, updates }: { schoolId: number; updates: any }) => {
      const response = await fetch(`/api/siteadmin/schools/${schoolId}/module-visibility`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(updates)
      });
      if (!response.ok) throw new Error('Failed to update module visibility');
      return response.json();
    },
    onSuccess: (_, { updates }) => {
      queryClient.invalidateQueries({ queryKey: ['/api/siteadmin/schools'] });
      toast({
        title: language === 'fr' ? 'Succès' : 'Success',
        description: language === 'fr' ? 'Visibilité des modules mise à jour' : 'Module visibility updated'
      });
      if (schoolForSettings) {
        setSchoolForSettings({ ...schoolForSettings, ...updates });
      }
    },
    onError: () => {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' ? 'Échec de la mise à jour' : 'Failed to update',
        variant: 'destructive'
      });
    }
  });

  const deleteSchoolMutation = useMutation({
    mutationFn: async (schoolId: number) => {
      const response = await fetch(`/api/siteadmin/schools/${schoolId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to delete school');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/siteadmin/schools'] });
      toast({
        title: language === 'fr' ? 'Succès' : 'Success',
        description: language === 'fr' ? 'École supprimée' : 'School deleted'
      });
    },
    onError: () => {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' ? 'Échec de la suppression' : 'Failed to delete',
        variant: 'destructive'
      });
    }
  });

  const handleOpenSettings = (school: any) => {
    setSchoolForSettings(school);
    setIsSettingsDialogOpen(true);
  };

  const handleDeleteSchool = (schoolId: number) => {
    if (confirm(language === 'fr' ? 'Êtes-vous sûr de vouloir supprimer cette école?' : 'Are you sure you want to delete this school?')) {
      deleteSchoolMutation.mutate(schoolId);
    }
  };

  const text = {
    fr: {
      title: 'Gestion des Écoles',
      subtitle: 'Administration des établissements scolaires',
      loading: 'Chargement des écoles...',
      search: 'Rechercher par nom, adresse, directeur ou numéro EDUCAFRIC...',
      filters: {
        type: 'Filtrer par type',
        all: 'Tous',
        private: 'Privé',
        public: 'Public'
      },
      stats: {
        totalSchools: 'Total Écoles',
        totalStudents: 'Total Élèves',
        totalTeachers: 'Total Enseignants'
      },
      actions: {
        view: 'Voir Détails',
        edit: 'Modifier',
        newSchool: 'Nouvelle École'
      },
      schoolCard: {
        students: 'Élèves',
        teachers: 'Enseignants',
        director: 'Directeur',
        educafricNumber: 'N° EDUCAFRIC',
        created: 'Créé le'
      },
      details: {
        title: 'Détails de l\'École',
        generalInfo: 'Informations Générales',
        statistics: 'Statistiques',
        close: 'Fermer',
        name: 'Nom',
        director: 'Directeur',
        address: 'Adresse',
        phone: 'Téléphone',
        email: 'Email',
        type: 'Type',
        educafricNumber: 'Numéro EDUCAFRIC',
        students: 'Élèves',
        teachers: 'Enseignants',
        createdAt: 'Date de création'
      },
      createDialog: {
        title: 'Créer une Nouvelle École',
        description: 'Entrez les informations de la nouvelle école. Les champs marqués (*) sont obligatoires.',
        nameLabel: 'Nom de l\'école *',
        namePlaceholder: 'Ex: École Primaire Excellence',
        typeLabel: 'Type *',
        typePlaceholder: 'Sélectionner le type',
        addressLabel: 'Adresse',
        addressPlaceholder: 'Ex: 123 Avenue de l\'Indépendance, Yaoundé',
        phoneLabel: 'Téléphone',
        emailLabel: 'Email',
        educafricLabel: 'Numéro EDUCAFRIC (optionnel)',
        cancel: 'Annuler',
        create: 'Créer',
        creating: 'Création...'
      }
    },
    en: {
      title: 'School Management',
      subtitle: 'Educational institution administration',
      loading: 'Loading schools...',
      search: 'Search by name, address, director or EDUCAFRIC number...',
      filters: {
        type: 'Filter by type',
        all: 'All',
        private: 'Private',
        public: 'Public'
      },
      stats: {
        totalSchools: 'Total Schools',
        totalStudents: 'Total Students',
        totalTeachers: 'Total Teachers'
      },
      actions: {
        view: 'View Details',
        edit: 'Edit',
        newSchool: 'New School'
      },
      schoolCard: {
        students: 'Students',
        teachers: 'Teachers',
        director: 'Director',
        educafricNumber: 'EDUCAFRIC No.',
        created: 'Created on'
      },
      details: {
        title: 'School Details',
        generalInfo: 'General Information',
        statistics: 'Statistics',
        close: 'Close',
        name: 'Name',
        director: 'Director',
        address: 'Address',
        phone: 'Phone',
        email: 'Email',
        type: 'Type',
        educafricNumber: 'EDUCAFRIC Number',
        students: 'Students',
        teachers: 'Teachers',
        createdAt: 'Created Date'
      },
      createDialog: {
        title: 'Create New School',
        description: 'Enter the new school information. Fields marked with (*) are required.',
        nameLabel: 'School Name *',
        namePlaceholder: 'Ex: Excellence Primary School',
        typeLabel: 'Type *',
        typePlaceholder: 'Select type',
        addressLabel: 'Address',
        addressPlaceholder: 'Ex: 123 Independence Avenue, Yaoundé',
        phoneLabel: 'Phone',
        emailLabel: 'Email',
        educafricLabel: 'EDUCAFRIC Number (optional)',
        cancel: 'Cancel',
        create: 'Create',
        creating: 'Creating...'
      }
    }
  };

  const t = text[language as keyof typeof text];

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">{t.loading}</span>
        </div>
      </div>
    );
  }

  const schoolsList = schools?.schools ?? [];
  
  const stats = {
    totalSchools: schoolsList.length,
    totalStudents: schoolsList.reduce((sum: number, s: any) => sum + (s.studentCount || 0), 0),
    totalTeachers: schoolsList.reduce((sum: number, s: any) => sum + (s.teacherCount || 0), 0)
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'private': return 'bg-blue-100 text-blue-800';
      case 'public': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t.title}</h1>
          <p className="text-gray-600 mt-1">{t.subtitle}</p>
        </div>
        <Button 
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => setIsCreateDialogOpen(true)}
          data-testid="button-create-school"
        >
          <Plus className="w-4 h-4 mr-2" />
          {t.actions.newSchool}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Building2 className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">{t.stats.totalSchools}</p>
                <p className="text-2xl font-bold text-blue-600" data-testid="stat-total-schools">
                  {stats.totalSchools}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Users className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">{t.stats.totalStudents}</p>
                <p className="text-2xl font-bold text-orange-600" data-testid="stat-total-students">
                  {stats.totalStudents.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">{t.stats.totalTeachers}</p>
                <p className="text-2xl font-bold text-green-600" data-testid="stat-total-teachers">
                  {stats.totalTeachers.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder={t.search}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  data-testid="input-search-schools"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="border rounded-md px-3 py-2"
                data-testid="select-type-filter"
              >
                <option value="all">{t.filters.all}</option>
                <option value="private">{t.filters.private}</option>
                <option value="public">{t.filters.public}</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {schoolsList.map((school) => (
          <Card key={school.id} className="hover:shadow-md transition-shadow" data-testid={`card-school-${school.id}`}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900" data-testid={`text-school-name-${school.id}`}>
                    {school.name}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    <span className="font-medium">{t.schoolCard.director}:</span> {school.director}
                  </p>
                  <div className="flex items-center mt-2 text-sm text-gray-500">
                    <MapPin className="w-4 h-4 mr-1" />
                    {school.address || 'N/A'}
                  </div>
                </div>
                <Badge className={getTypeColor(school.type)} data-testid={`badge-type-${school.id}`}>
                  {language === 'fr' 
                    ? (school.type === 'private' ? 'Privé' : 'Public')
                    : (school.type === 'private' ? 'Private' : 'Public')
                  }
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-blue-600" data-testid={`text-students-${school.id}`}>
                      {school.studentCount || 0}
                    </div>
                    <div className="text-xs text-gray-600">{t.schoolCard.students}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-green-600" data-testid={`text-teachers-${school.id}`}>
                      {school.teacherCount || 0}
                    </div>
                    <div className="text-xs text-gray-600">{t.schoolCard.teachers}</div>
                  </div>
                </div>

                <div className="space-y-1 text-sm">
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 text-gray-500 mr-2" />
                    <span>{school.phone || 'N/A'}</span>
                  </div>
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 text-gray-500 mr-2" />
                    <span className="text-blue-600">{school.email || 'N/A'}</span>
                  </div>
                  {school.educafricNumber && (
                    <div className="flex items-center">
                      <Building2 className="w-4 h-4 text-gray-500 mr-2" />
                      <span className="font-medium">{school.educafricNumber}</span>
                    </div>
                  )}
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 text-gray-500 mr-2" />
                    <span className="text-gray-600">{formatDate(school.createdAt)}</span>
                  </div>
                </div>

                <div className="flex justify-between pt-2 border-t gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedSchool(school)}
                    data-testid={`button-view-${school.id}`}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    {t.actions.view}
                  </Button>
                  
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleOpenSettings(school)}
                    title={language === 'fr' ? 'Paramètres Offline Premium' : 'Offline Premium Settings'}
                    data-testid={`button-settings-${school.id}`}
                  >
                    <CreditCard className="w-4 h-4" />
                  </Button>
                  
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleDeleteSchool(school.id)}
                    className="text-red-600 hover:text-red-700"
                    data-testid={`button-delete-${school.id}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedSchool && (
        <Dialog open={!!selectedSchool} onOpenChange={() => setSelectedSchool(null)}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{t.details.title}</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-lg mb-3 flex items-center">
                  <Building2 className="w-5 h-5 mr-2 text-blue-600" />
                  {t.details.generalInfo}
                </h3>
                <div className="grid grid-cols-1 gap-3 text-sm">
                  <div className="flex">
                    <span className="font-medium w-40">{t.details.name}:</span>
                    <span>{selectedSchool.name}</span>
                  </div>
                  <div className="flex">
                    <span className="font-medium w-40">{t.details.type}:</span>
                    <Badge className={getTypeColor(selectedSchool.type)}>
                      {language === 'fr' 
                        ? (selectedSchool.type === 'private' ? 'Privé' : 'Public')
                        : (selectedSchool.type === 'private' ? 'Private' : 'Public')
                      }
                    </Badge>
                  </div>
                  <div className="flex">
                    <span className="font-medium w-40">{t.details.director}:</span>
                    <span>{selectedSchool.director}</span>
                  </div>
                  <div className="flex">
                    <span className="font-medium w-40">{t.details.address}:</span>
                    <span>{selectedSchool.address || 'N/A'}</span>
                  </div>
                  <div className="flex">
                    <span className="font-medium w-40">{t.details.phone}:</span>
                    <span>{selectedSchool.phone || 'N/A'}</span>
                  </div>
                  <div className="flex">
                    <span className="font-medium w-40">{t.details.email}:</span>
                    <span className="text-blue-600">{selectedSchool.email || 'N/A'}</span>
                  </div>
                  {selectedSchool.educafricNumber && (
                    <div className="flex">
                      <span className="font-medium w-40">{t.details.educafricNumber}:</span>
                      <span className="font-mono">{selectedSchool.educafricNumber}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-lg mb-3 flex items-center">
                  <Users className="w-5 h-5 mr-2 text-green-600" />
                  {t.details.statistics}
                </h3>
                <div className="grid grid-cols-1 gap-3 text-sm">
                  <div className="flex">
                    <span className="font-medium w-40">{t.details.students}:</span>
                    <span className="text-blue-600 font-semibold">{selectedSchool.studentCount || 0}</span>
                  </div>
                  <div className="flex">
                    <span className="font-medium w-40">{t.details.teachers}:</span>
                    <span className="text-green-600 font-semibold">{selectedSchool.teacherCount || 0}</span>
                  </div>
                  <div className="flex">
                    <span className="font-medium w-40">{t.details.createdAt}:</span>
                    <span>{formatDate(selectedSchool.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-4">
              <Button
                variant="outline"
                onClick={() => setSelectedSchool(null)}
                data-testid="button-close-details"
              >
                {t.details.close}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{t.createDialog.title}</DialogTitle>
            <DialogDescription>
              {t.createDialog.description}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitCreateSchool)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.createDialog.nameLabel}</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder={t.createDialog.namePlaceholder}
                        data-testid="input-school-name"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.createDialog.typeLabel}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-school-type">
                          <SelectValue placeholder={t.createDialog.typePlaceholder} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="private">{t.filters.private}</SelectItem>
                        <SelectItem value="public">{t.filters.public}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.createDialog.addressLabel}</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder={t.createDialog.addressPlaceholder}
                        data-testid="input-school-address"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.createDialog.phoneLabel}</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="+237 222 123 456"
                        data-testid="input-school-phone"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.createDialog.emailLabel}</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        type="email"
                        placeholder="contact@school.cm"
                        data-testid="input-school-email"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="educafricNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.createDialog.educafricLabel}</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="EDU-CM-SC-001"
                        data-testid="input-educafric-number"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsCreateDialogOpen(false);
                    form.reset();
                  }}
                  disabled={createSchoolMutation.isPending}
                  data-testid="button-cancel-create"
                >
                  {t.createDialog.cancel}
                </Button>
                <Button
                  type="submit"
                  disabled={createSchoolMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700"
                  data-testid="button-submit-create"
                >
                  {createSchoolMutation.isPending 
                    ? t.createDialog.creating
                    : t.createDialog.create}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog - Offline Premium & Module Visibility */}
      <Dialog open={isSettingsDialogOpen} onOpenChange={setIsSettingsDialogOpen}>
        <DialogContent className="sm:max-w-2xl bg-white max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {language === 'fr' ? 'Offline Premium & Visibilité Modules' : 'Offline Premium & Module Visibility'}
            </DialogTitle>
            <DialogDescription>
              {schoolForSettings?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Offline Premium Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-700">
                {language === 'fr' ? 'Offline Premium' : 'Offline Premium'}
              </h3>
              <div className="flex items-center justify-between space-x-4 p-4 border rounded-lg">
                <div className="flex-1">
                  <Label htmlFor="offline-premium-toggle" className="text-base font-medium">
                    {schoolForSettings?.offlinePremiumEnabled 
                      ? (language === 'fr' ? 'Offline Premium Activé' : 'Offline Premium Enabled')
                      : (language === 'fr' ? 'Offline Premium Désactivé' : 'Offline Premium Disabled')
                    }
                  </Label>
                  <p className="text-sm text-gray-500 mt-1">
                    {language === 'fr' 
                      ? 'Accès hors ligne illimité pour tous les 12 modules'
                      : 'Unlimited offline access for all 12 modules'
                    }
                  </p>
                </div>
                <Switch
                  id="offline-premium-toggle"
                  checked={schoolForSettings?.offlinePremiumEnabled || false}
                  onCheckedChange={(checked) => {
                    if (schoolForSettings) {
                      toggleOfflinePremiumMutation.mutate({
                        schoolId: schoolForSettings.id,
                        enabled: checked
                      });
                    }
                  }}
                  disabled={toggleOfflinePremiumMutation.isPending}
                  data-testid="switch-offline-premium"
                />
              </div>
            </div>

            {/* Module Visibility Section */}
            <div className="space-y-4">
              <div className="border-t pt-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">
                  {language === 'fr' ? 'Visibilité des Modules' : 'Module Visibility'}
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  {language === 'fr' 
                    ? 'Contrôler quels modules apparaissent dans le tableau de bord École'
                    : 'Control which modules appear in the School Dashboard'
                  }
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                {/* Communications */}
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <Label htmlFor="module-communications" className="text-sm font-medium cursor-pointer">
                    {language === 'fr' ? 'Communications' : 'Communications'}
                  </Label>
                  <Switch
                    id="module-communications"
                    checked={schoolForSettings?.communicationsEnabled ?? true}
                    onCheckedChange={(checked) => {
                      if (schoolForSettings) {
                        updateModuleVisibilityMutation.mutate({
                          schoolId: schoolForSettings.id,
                          updates: { communicationsEnabled: checked }
                        });
                      }
                    }}
                    disabled={updateModuleVisibilityMutation.isPending}
                    data-testid="switch-module-communications"
                  />
                </div>

                {/* Educational Content */}
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <Label htmlFor="module-content" className="text-sm font-medium cursor-pointer">
                    {language === 'fr' ? 'Contenu Éducatif' : 'Educational Content'}
                  </Label>
                  <Switch
                    id="module-content"
                    checked={schoolForSettings?.educationalContentEnabled ?? true}
                    onCheckedChange={(checked) => {
                      if (schoolForSettings) {
                        updateModuleVisibilityMutation.mutate({
                          schoolId: schoolForSettings.id,
                          updates: { educationalContentEnabled: checked }
                        });
                      }
                    }}
                    disabled={updateModuleVisibilityMutation.isPending}
                    data-testid="switch-module-educational-content"
                  />
                </div>

                {/* Delegate Admins */}
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <Label htmlFor="module-delegates" className="text-sm font-medium cursor-pointer">
                    {language === 'fr' ? 'Administrateurs Délégués' : 'Delegate Administrators'}
                  </Label>
                  <Switch
                    id="module-delegates"
                    checked={schoolForSettings?.delegateAdminsEnabled ?? true}
                    onCheckedChange={(checked) => {
                      if (schoolForSettings) {
                        updateModuleVisibilityMutation.mutate({
                          schoolId: schoolForSettings.id,
                          updates: { delegateAdminsEnabled: checked }
                        });
                      }
                    }}
                    disabled={updateModuleVisibilityMutation.isPending}
                    data-testid="switch-module-delegate-admins"
                  />
                </div>

                {/* Canteen */}
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <Label htmlFor="module-canteen" className="text-sm font-medium cursor-pointer">
                    {language === 'fr' ? 'Cantine' : 'Canteen'}
                  </Label>
                  <Switch
                    id="module-canteen"
                    checked={schoolForSettings?.canteenEnabled ?? true}
                    onCheckedChange={(checked) => {
                      if (schoolForSettings) {
                        updateModuleVisibilityMutation.mutate({
                          schoolId: schoolForSettings.id,
                          updates: { canteenEnabled: checked }
                        });
                      }
                    }}
                    disabled={updateModuleVisibilityMutation.isPending}
                    data-testid="switch-module-canteen"
                  />
                </div>

                {/* School Bus */}
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <Label htmlFor="module-bus" className="text-sm font-medium cursor-pointer">
                    {language === 'fr' ? 'Bus Scolaire' : 'School Bus'}
                  </Label>
                  <Switch
                    id="module-bus"
                    checked={schoolForSettings?.schoolBusEnabled ?? true}
                    onCheckedChange={(checked) => {
                      if (schoolForSettings) {
                        updateModuleVisibilityMutation.mutate({
                          schoolId: schoolForSettings.id,
                          updates: { schoolBusEnabled: checked }
                        });
                      }
                    }}
                    disabled={updateModuleVisibilityMutation.isPending}
                    data-testid="switch-module-school-bus"
                  />
                </div>

                {/* Online Classes */}
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <Label htmlFor="module-online-classes" className="text-sm font-medium cursor-pointer">
                    {language === 'fr' ? 'Classes en Ligne' : 'Online Classes'}
                  </Label>
                  <Switch
                    id="module-online-classes"
                    checked={schoolForSettings?.onlineClassesEnabled ?? true}
                    onCheckedChange={(checked) => {
                      if (schoolForSettings) {
                        updateModuleVisibilityMutation.mutate({
                          schoolId: schoolForSettings.id,
                          updates: { onlineClassesEnabled: checked }
                        });
                      }
                    }}
                    disabled={updateModuleVisibilityMutation.isPending}
                    data-testid="switch-module-online-classes"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <Button 
              variant="outline" 
              onClick={() => setIsSettingsDialogOpen(false)} 
              data-testid="button-close-settings"
            >
              {language === 'fr' ? 'Fermer' : 'Close'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FunctionalSiteAdminSchools;
