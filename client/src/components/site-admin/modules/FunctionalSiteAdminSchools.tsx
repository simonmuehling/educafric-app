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
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Building2, Search, Filter, Plus, Edit, 
  Users, DollarSign, MapPin, Phone, Mail,
  CheckCircle, AlertTriangle, Clock, Eye,
  BarChart3, TrendingUp, Calendar
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Form validation schema
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
  const [planFilter, setPlanFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedSchool, setSelectedSchool] = useState<any>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  
  // Form setup with react-hook-form + zod
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

  // Fetch schools
  const { data: schools, isLoading } = useQuery({
    queryKey: ['/api/siteadmin/schools', { search: searchTerm, plan: planFilter, status: statusFilter }],
    queryFn: async () => {
      const response = await fetch(`/api/siteadmin/schools?search=${searchTerm}&plan=${planFilter}&status=${statusFilter}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch schools');
      return response.json();
    },
    enabled: !!user
  });

  // Create school mutation
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

  const text = {
    fr: {
      title: 'Gestion des Écoles',
      subtitle: 'Administration des établissements scolaires',
      loading: 'Chargement des écoles...',
      search: 'Rechercher des écoles...',
      filters: {
        plan: 'Filtrer par plan',
        status: 'Filtrer par statut',
        all: 'Tous'
      },
      plans: {
        basic: 'Basic',
        premium: 'Premium',
        enterprise: 'Enterprise',
        trial: 'Essai'
      },
      status: {
        active: 'Actif',
        inactive: 'Inactif',
        suspended: 'Suspendu',
        pending: 'En attente'
      },
      actions: {
        view: 'Voir',
        edit: 'Modifier',
        activate: 'Activer',
        suspend: 'Suspendre',
        upgrade: 'Mettre à niveau',
        contact: 'Contacter'
      },
      stats: {
        totalSchools: 'Total Écoles',
        activeSchools: 'Écoles Actives',
        totalStudents: 'Total Élèves',
        totalRevenue: 'Revenus Totaux'
      },
      details: {
        overview: 'Aperçu',
        subscription: 'Abonnement',
        activity: 'Activité',
        billing: 'Facturation'
      }
    },
    en: {
      title: 'School Management',
      subtitle: 'Educational institution administration',
      loading: 'Loading schools...',
      search: 'Search schools...',
      filters: {
        plan: 'Filter by plan',
        status: 'Filter by status',
        all: 'All'
      },
      plans: {
        basic: 'Basic',
        premium: 'Premium',
        enterprise: 'Enterprise',
        trial: 'Trial'
      },
      status: {
        active: 'Active',
        inactive: 'Inactive',
        suspended: 'Suspended',
        pending: 'Pending'
      },
      actions: {
        view: 'View',
        edit: 'Edit',
        activate: 'Activate',
        suspend: 'Suspend',
        upgrade: 'Upgrade',
        contact: 'Contact'
      },
      stats: {
        totalSchools: 'Total Schools',
        activeSchools: 'Active Schools',
        totalStudents: 'Total Students',
        totalRevenue: 'Total Revenue'
      },
      details: {
        overview: 'Overview',
        subscription: 'Subscription',
        activity: 'Activity',
        billing: 'Billing'
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

  // Get schools data from API
  const schoolsList = schools?.schools ?? [];
  
  // Calculate stats from real data
  const stats = {
    totalSchools: schoolsList.length,
    activeSchools: schoolsList.filter((s: any) => s.subscriptionStatus === 'active').length,
    totalStudents: schoolsList.reduce((sum: number, s: any) => sum + (s.studentCount || 0), 0),
    totalRevenue: 0 // Not available in current data
  };

  const filteredSchools = (Array.isArray(schoolsList) ? schoolsList : []).filter((school: any) => {
    if (!school) return false;
    const matchesSearch = (school.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (school.address || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (school.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlan = planFilter === 'all' || school.subscriptionStatus === planFilter;
    const matchesStatus = statusFilter === 'all' || school.subscriptionStatus === statusFilter;
    
    return matchesSearch && matchesPlan && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      case 'trial': return 'bg-blue-100 text-blue-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'enterprise': return 'bg-purple-100 text-purple-800';
      case 'premium': return 'bg-blue-100 text-blue-800';
      case 'basic': return 'bg-green-100 text-green-800';
      case 'trial': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t.title || ''}</h1>
          <p className="text-gray-600 mt-1">{t.subtitle}</p>
        </div>
        <Button 
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => setIsCreateDialogOpen(true)}
          data-testid="button-create-school"
        >
          <Plus className="w-4 h-4 mr-2" />
          {language === 'fr' ? 'Nouvelle École' : 'New School'}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Building2 className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">{t?.stats?.totalSchools}</p>
                <p className="text-2xl font-bold text-blue-600">
                  {stats.totalSchools}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">{t?.stats?.activeSchools}</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.activeSchools}
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
                <p className="text-sm text-gray-600">{t?.stats?.totalStudents}</p>
                <p className="text-2xl font-bold text-orange-600">
                  {stats.totalStudents.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">{t?.stats?.totalRevenue}</p>
                <p className="text-2xl font-bold text-purple-600">
                  {stats.totalRevenue > 0 ? `${(stats.totalRevenue / 1000000).toFixed(1)}M CFA` : 'N/A'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
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
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={planFilter}
                onChange={(e) => setPlanFilter(e.target.value)}
                className="border rounded-md px-3 py-2"
              >
                <option value="all">{t?.filters?.all}</option>
                <option value="enterprise">Enterprise</option>
                <option value="premium">Premium</option>
                <option value="basic">Basic</option>
                <option value="trial">Essai</option>
              </select>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border rounded-md px-3 py-2"
              >
                <option value="all">{t?.filters?.all}</option>
                <option value="active">Actif</option>
                <option value="pending">En attente</option>
                <option value="trial">Essai</option>
                <option value="suspended">Suspendu</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Schools Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {(Array.isArray(filteredSchools) ? filteredSchools : []).map((school) => (
          <Card key={school.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {school.name || ''}
                  </h3>
                  <p className="text-sm text-gray-600">{school.director}</p>
                  <div className="flex items-center mt-2 text-sm text-gray-500">
                    <MapPin className="w-4 h-4 mr-1" />
                    {school.location}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Badge className={getStatusColor(school.status)}>
                    {t?.status?.[school.status as keyof typeof t.status]}
                  </Badge>
                  <Badge className={getPlanColor(school.plan)}>
                    {t?.plans?.[school.plan as keyof typeof t.plans]}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4">
                {/* Key Metrics */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-blue-600">
                      {school.studentCount}
                    </div>
                    <div className="text-xs text-gray-600">Élèves</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-green-600">
                      {school.teacherCount}
                    </div>
                    <div className="text-xs text-gray-600">Enseignants</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-lg font-semibold ${getPerformanceColor(school.performanceScore)}`}>
                      {school.performanceScore}%
                    </div>
                    <div className="text-xs text-gray-600">Performance</div>
                  </div>
                </div>

                {/* Revenue and Activity */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <DollarSign className="w-4 h-4 text-purple-600 mr-1" />
                    <span>{school.monthlyRevenue.toLocaleString()} CFA/mois</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 text-gray-500 mr-1" />
                    <span className="text-gray-600">
                      {new Date(school.lastActivity).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-1 text-sm">
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 text-gray-500 mr-2" />
                    <span>{school.phone}</span>
                  </div>
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 text-gray-500 mr-2" />
                    <span className="text-blue-600">{school.email || ''}</span>
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-2">
                  <div className="text-sm font-medium">Fonctionnalités:</div>
                  <div className="flex flex-wrap gap-1">
                    {school.features.slice(0, 2).map((feature, index) => (
                      <span
                        key={index}
                        className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                      >
                        {feature}
                      </span>
                    ))}
                    {school.features.length > 2 && (
                      <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                        +{school.features.length - 2} autres
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-between pt-2 border-t">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedSchool(school)}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Voir Détails
                  </Button>
                  
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <BarChart3 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* School Detail Modal would go here */}
      {selectedSchool && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">{selectedSchool.name || ''}</h2>
              <Button
                variant="outline"
                onClick={() => setSelectedSchool(null)}
              >
                Fermer
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Informations Générales</h3>
                <div className="space-y-2 text-sm">
                  <div><strong>Directeur:</strong> {selectedSchool.director}</div>
                  <div><strong>Adresse:</strong> {selectedSchool.address}</div>
                  <div><strong>Téléphone:</strong> {selectedSchool.phone}</div>
                  <div><strong>Email:</strong> {selectedSchool.email || ''}</div>
                  {selectedSchool.website && (
                    <div><strong>Site web:</strong> {selectedSchool.website}</div>
                  )}
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Statistiques</h3>
                <div className="space-y-2 text-sm">
                  <div><strong>Élèves:</strong> {selectedSchool.studentCount}</div>
                  <div><strong>Enseignants:</strong> {selectedSchool.teacherCount}</div>
                  <div><strong>Plan:</strong> {selectedSchool.plan}</div>
                  <div><strong>Revenus mensuels:</strong> {selectedSchool.monthlyRevenue.toLocaleString()} CFA</div>
                  <div><strong>Score performance:</strong> {selectedSchool.performanceScore}%</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create School Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{language === 'fr' ? 'Créer une Nouvelle École' : 'Create New School'}</DialogTitle>
            <DialogDescription>
              {language === 'fr' 
                ? 'Entrez les informations de la nouvelle école. Les champs marqués (*) sont obligatoires.' 
                : 'Enter the new school information. Fields marked with (*) are required.'}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitCreateSchool)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{language === 'fr' ? 'Nom de l\'école *' : 'School Name *'}</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder={language === 'fr' ? 'Ex: École Primaire Excellence' : 'Ex: Excellence Primary School'}
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
                    <FormLabel>{language === 'fr' ? 'Type *' : 'Type *'}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-school-type">
                          <SelectValue placeholder={language === 'fr' ? 'Sélectionner le type' : 'Select type'} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="private">{language === 'fr' ? 'Privé' : 'Private'}</SelectItem>
                        <SelectItem value="public">{language === 'fr' ? 'Public' : 'Public'}</SelectItem>
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
                    <FormLabel>{language === 'fr' ? 'Adresse' : 'Address'}</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder={language === 'fr' ? 'Ex: 123 Avenue de l\'Indépendance, Yaoundé' : 'Ex: 123 Independence Avenue, Yaoundé'}
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
                    <FormLabel>{language === 'fr' ? 'Téléphone' : 'Phone'}</FormLabel>
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
                    <FormLabel>{language === 'fr' ? 'Email' : 'Email'}</FormLabel>
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
                    <FormLabel>{language === 'fr' ? 'Numéro EDUCAFRIC (optionnel)' : 'EDUCAFRIC Number (optional)'}</FormLabel>
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
                  {language === 'fr' ? 'Annuler' : 'Cancel'}
                </Button>
                <Button
                  type="submit"
                  disabled={createSchoolMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700"
                  data-testid="button-submit-create"
                >
                  {createSchoolMutation.isPending 
                    ? (language === 'fr' ? 'Création...' : 'Creating...') 
                    : (language === 'fr' ? 'Créer' : 'Create')}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FunctionalSiteAdminSchools;