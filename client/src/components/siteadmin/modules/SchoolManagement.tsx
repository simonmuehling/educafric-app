import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { ModernCard } from '@/components/ui/ModernCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  School, 
  Building2, 
  MapPin, 
  Users, 
  GraduationCap,
  Phone,
  Mail,
  Globe,
  Calendar,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  Eye,
  Download,
  Search,
  Filter,
  UserCheck,
  UserX,
  Clock,
  CreditCard,
  Ban,
  Unlock,
  Save,
  X
} from 'lucide-react';

interface School {
  id: number;
  name: string;
  address: string;
  city: string;
  country: string;
  phone: string | null;
  email: string | null;
  website: string | null;
  type: 'public' | 'private';
  level: string;
  studentCount: number;
  teacherCount: number;
  subscriptionStatus: string;
  subscriptionPlan?: string;
  subscriptionEndDate?: string;
  createdAt: string;
  lastActiveAt: string | null;
  isBlocked?: boolean;
}

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  billing: string;
  features: string[];
}

const SchoolManagement = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSchools, setSelectedSchools] = useState<number[]>([]);
  
  // New state for school management functionality
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showSubscriptionDialog, setShowSubscriptionDialog] = useState(false);
  const [selectedSchoolForSubscription, setSelectedSchoolForSubscription] = useState<School | null>(null);
  const [newSchoolData, setNewSchoolData] = useState({
    name: '',
    address: '',
    city: '',
    country: 'Cameroun',
    phone: '',
    email: '',
    website: '',
    type: 'public' as 'public' | 'private',
    level: 'mixed',
    educafricNumber: ''
  });
  const [subscriptionData, setSubscriptionData] = useState({
    planId: '',
    action: 'extend' as 'extend' | 'activate' | 'cancel',
    duration: '1',
    notes: ''
  });

  const text = {
    fr: {
      title: 'Gestion des Écoles',
      subtitle: 'Administration complète des établissements scolaires',
      searchSchools: 'Rechercher écoles...',
      addSchool: 'Ajouter École',
      exportSchools: 'Exporter Écoles',
      totalSchools: 'Total Écoles',
      activeSchools: 'Écoles Actives',
      newThisMonth: 'Nouvelles ce Mois',
      filterByType: 'Filtrer par Type',
      filterByStatus: 'Filtrer par Statut',
      allTypes: 'Tous les Types',
      allStatuses: 'Tous les Statuts',
      public: 'Public',
      private: 'Privé',
      active: 'Actif',
      inactive: 'Inactif',
      suspended: 'Suspendu',
      schoolName: 'Nom École',
      location: 'Localisation',
      type: 'Type',
      students: 'Élèves',
      teachers: 'Enseignants',
      status: 'Statut',
      lastActive: 'Dernière Activité',
      actions: 'Actions',
      edit: 'Modifier',
      delete: 'Supprimer',
      view: 'Voir',
      details: 'Détails',
      statistics: 'Statistiques',
      schoolDetails: 'Détails École',
      contactInfo: 'Informations Contact',
      schoolStats: 'Statistiques École',
      subscriptionInfo: 'Informations Abonnement',
      never: 'Jamais',
      loading: 'Chargement...',
      noSchools: 'Aucune école trouvée',
      confirmDelete: 'Confirmer la suppression',
      deleteSchoolConfirm: 'Êtes-vous sûr de vouloir supprimer cette école ?',
      schoolDeleted: 'École supprimée',
      schoolUpdated: 'École mise à jour',
      error: 'Erreur',
      success: 'Succès',
      primary: 'Primaire',
      secondary: 'Secondaire',
      university: 'Universitaire',
      mixed: 'Mixte',
      // New strings for subscription management
      manageSubscription: 'Gérer Abonnement',
      blockSchool: 'Bloquer École',
      unblockSchool: 'Débloquer École',
      createNewSchool: 'Créer Nouvelle École',
      subscriptionManagement: 'Gestion Abonnement',
      extendSubscription: 'Prolonger Abonnement',
      activateSubscription: 'Activer Abonnement',
      cancelSubscription: 'Annuler Abonnement',
      selectPlan: 'Sélectionner Plan',
      duration: 'Durée (mois)',
      notes: 'Notes',
      save: 'Enregistrer',
      cancel: 'Annuler',
      address: 'Adresse',
      city: 'Ville',
      country: 'Pays',
      phone: 'Téléphone',
      email: 'Email',
      website: 'Site Web',
      level: 'Niveau',
      schoolCreated: 'École créée avec succès',
      subscriptionUpdated: 'Abonnement mis à jour',
      schoolBlocked: 'École bloquée',
      schoolUnblocked: 'École débloquée',
      confirmBlock: 'Confirmer blocage',
      confirmUnblock: 'Confirmer déblocage',
      blockSchoolConfirm: 'Êtes-vous sûr de vouloir bloquer cette école ?',
      unblockSchoolConfirm: 'Êtes-vous sûr de vouloir débloquer cette école ?',
      blocked: 'Bloquée',
      unblocked: 'Active'
    },
    en: {
      title: 'School Management',
      subtitle: 'Complete educational institution administration',
      searchSchools: 'Search schools...',
      addSchool: 'Add School',
      exportSchools: 'Export Schools',
      totalSchools: 'Total Schools',
      activeSchools: 'Active Schools',
      newThisMonth: 'New This Month',
      filterByType: 'Filter by Type',
      filterByStatus: 'Filter by Status',
      allTypes: 'All Types',
      allStatuses: 'All Statuses',
      public: 'Public',
      private: 'Private',
      active: 'Active',
      inactive: 'Inactive',
      suspended: 'Suspended',
      schoolName: 'School Name',
      location: 'Location',
      type: 'Type',
      students: 'Students',
      teachers: 'Teachers',
      status: 'Status',
      lastActive: 'Last Active',
      actions: 'Actions',
      edit: 'Edit',
      delete: 'Delete',
      view: 'View',
      details: 'Details',
      statistics: 'Statistics',
      schoolDetails: 'School Details',
      contactInfo: 'Contact Information',
      schoolStats: 'School Statistics',
      subscriptionInfo: 'Subscription Information',
      never: 'Never',
      loading: 'Loading...',
      noSchools: 'No schools found',
      confirmDelete: 'Confirm Deletion',
      deleteSchoolConfirm: 'Are you sure you want to delete this school?',
      schoolDeleted: 'School deleted',
      schoolUpdated: 'School updated',
      error: 'Error',
      success: 'Success',
      primary: 'Primary',
      secondary: 'Secondary',
      university: 'University',
      mixed: 'Mixed'
    }
  };

  const t = text[language];

  // Fetch schools with filtering and pagination
  const { data: schoolsData, isLoading, error } = useQuery({
    queryKey: ['/api/siteadmin/schools', { 
      search: searchTerm, 
      type: typeFilter, 
      status: statusFilter, 
      page: currentPage 
    }],
    queryFn: () => apiRequest('GET', `/api/siteadmin/schools?search=${encodeURIComponent(searchTerm)}&type=${typeFilter}&status=${statusFilter}&page=${currentPage}&limit=20`)
  });

  // School statistics
  const { data: schoolStats } = useQuery({
    queryKey: ['/api/siteadmin/school-stats'],
    queryFn: () => apiRequest('GET', '/api/siteadmin/school-stats')
  });

  // Fetch subscription plans
  const { data: subscriptionPlans } = useQuery({
    queryKey: ['/api/siteadmin/subscription-plans'],
    queryFn: () => apiRequest('GET', '/api/siteadmin/subscription-plans')
  });

  // Fetch available EDUCAFRIC numbers for school registration
  const { data: availableNumbersData } = useQuery({
    queryKey: ['/api/siteadmin/educafric/available'],
    queryFn: () => apiRequest('GET', '/api/siteadmin/educafric/available'),
    enabled: showCreateDialog
  });

  // Delete school mutation
  const deleteSchoolMutation = useMutation({
    mutationFn: (schoolId: number) => apiRequest('DELETE', `/api/siteadmin/schools/${schoolId}`),
    onSuccess: () => {
      toast({
        title: 'Succès',
        description: 'École supprimée'
      });
      queryClient.invalidateQueries({ queryKey: ['/api/siteadmin/schools'] });
      queryClient.invalidateQueries({ queryKey: ['/api/siteadmin/school-stats'] });
    },
    onError: () => {
      toast({
        title: 'Erreur',
        description: 'Échec de la suppression de l\'école',
        variant: "destructive"
      });
    }
  });

  // Create school mutation
  const createSchoolMutation = useMutation({
    mutationFn: (schoolData: typeof newSchoolData) => apiRequest('POST', '/api/siteadmin/schools', schoolData),
    onSuccess: () => {
      toast({
        title: 'Succès',
        description: 'École créée avec succès'
      });
      setShowCreateDialog(false);
      setNewSchoolData({
        name: '',
        address: '',
        city: '',
        country: 'Cameroun',
        phone: '',
        email: '',
        website: '',
        type: 'public',
        level: 'mixed',
        educafricNumber: ''
      });
      queryClient.invalidateQueries({ queryKey: ['/api/siteadmin/schools'] });
      queryClient.invalidateQueries({ queryKey: ['/api/siteadmin/school-stats'] });
    },
    onError: () => {
      toast({
        title: 'Erreur',
        description: 'Échec de la création de l\'école',
        variant: "destructive"
      });
    }
  });

  // Manage subscription mutation
  const manageSubscriptionMutation = useMutation({
    mutationFn: ({ schoolId, action, planId, duration, notes }: {
      schoolId: number;
      action: string;
      planId?: string;
      duration?: string;
      notes?: string;
    }) => apiRequest('POST', `/api/siteadmin/schools/${schoolId}/subscription`, { action, planId, duration, notes }),
    onSuccess: () => {
      toast({
        title: 'Succès',
        description: 'Abonnement mis à jour'
      });
      setShowSubscriptionDialog(false);
      setSelectedSchoolForSubscription(null);
      queryClient.invalidateQueries({ queryKey: ['/api/siteadmin/schools'] });
    },
    onError: () => {
      toast({
        title: 'Erreur',
        description: 'Échec de la mise à jour de l\'abonnement',
        variant: "destructive"
      });
    }
  });

  // Block/Unblock school mutation
  const blockSchoolMutation = useMutation({
    mutationFn: ({ schoolId, block }: { schoolId: number; block: boolean }) => 
      apiRequest('PATCH', `/api/siteadmin/schools/${schoolId}/block`, { isBlocked: block }),
    onSuccess: (_, { block }) => {
      toast({
        title: 'Succès',
        description: block ? 'École bloquée' : 'École débloquée'
      });
      queryClient.invalidateQueries({ queryKey: ['/api/siteadmin/schools'] });
    },
    onError: () => {
      toast({
        title: 'Erreur',
        description: 'Échec de la mise à jour du statut de l\'école',
        variant: "destructive"
      });
    }
  });

  const formatDate = (dateString: string | null) => {
    if (!dateString) return t.never;
    return new Date(dateString).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US');
  };

  const getTypeColor = (type: string) => {
    return type === 'public' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLevelTranslation = (level: string) => {
    const translations = {
      'primary': t.primary,
      'secondary': t.secondary,
      'university': t.university,
      'mixed': t.mixed
    };
    return translations[level as keyof typeof translations] || level;
  };

  const handleDeleteSchool = (schoolId: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette école ?')) {
      deleteSchoolMutation.mutate(schoolId);
    }
  };

  // Handler functions for new functionality
  const handleCreateSchool = () => {
    const dataToSend = {
      ...newSchoolData,
      educafricNumber: newSchoolData.educafricNumber === 'auto' ? '' : newSchoolData.educafricNumber
    };
    createSchoolMutation.mutate(dataToSend);
  };

  const handleManageSubscription = (school: School) => {
    setSelectedSchoolForSubscription(school);
    setShowSubscriptionDialog(true);
  };

  const handleSubscriptionAction = () => {
    if (!selectedSchoolForSubscription) return;
    
    manageSubscriptionMutation.mutate({
      schoolId: selectedSchoolForSubscription.id,
      action: subscriptionData.action,
      planId: subscriptionData.planId,
      duration: subscriptionData.duration,
      notes: subscriptionData.notes
    });
  };

  const handleBlockSchool = (school: School) => {
    const isBlocked = school.isBlocked || false;
    const confirmMsg = isBlocked ? 'Êtes-vous sûr de vouloir débloquer cette école ?' : 'Êtes-vous sûr de vouloir bloquer cette école ?';
    
    if (confirm(confirmMsg)) {
      blockSchoolMutation.mutate({
        schoolId: school.id,
        block: !isBlocked
      });
    }
  };

  const renderSchoolStats = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <ModernCard className="p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-100 rounded-lg">
            <School className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <div className="text-2xl font-bold">{(schoolStats as any)?.totalSchools || 0}</div>
            <div className="text-sm text-gray-600">{t.totalSchools}</div>
          </div>
        </div>
      </ModernCard>

      <ModernCard className="p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-green-100 rounded-lg">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <div className="text-2xl font-bold">{(schoolStats as any)?.activeSchools || 0}</div>
            <div className="text-sm text-gray-600">{t.activeSchools}</div>
          </div>
        </div>
      </ModernCard>

      <ModernCard className="p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-purple-100 rounded-lg">
            <Plus className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <div className="text-2xl font-bold">{(schoolStats as any)?.newThisMonth || 0}</div>
            <div className="text-sm text-gray-600">{t.newThisMonth}</div>
          </div>
        </div>
      </ModernCard>
    </div>
  );

  const renderFilters = () => (
    <ModernCard className="p-6 mb-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder={t.searchSchools}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e?.target?.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex gap-4">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e?.target?.value)}
            className="px-3 py-2 border rounded-md"
          >
            <option value="all">{t.allTypes}</option>
            <option value="public">{t.public}</option>
            <option value="private">{t.private}</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e?.target?.value)}
            className="px-3 py-2 border rounded-md"
          >
            <option value="all">{t.allStatuses}</option>
            <option value="active">{t.active}</option>
            <option value="inactive">{t.inactive}</option>
            <option value="suspended">{t.suspended}</option>
          </select>

          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            {t.exportSchools}
          </Button>

          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                {t.addSchool}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Créer une nouvelle école</DialogTitle>
                <DialogDescription>
                  Créer une nouvelle école dans le système Educafric
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="educafricNumber" className="text-blue-600 font-semibold">
                    Numéro EDUCAFRIC (Optionnel)
                  </Label>
                  <Select 
                    value={newSchoolData.educafricNumber} 
                    onValueChange={(value) => setNewSchoolData({...newSchoolData, educafricNumber: value})}
                  >
                    <SelectTrigger id="educafricNumber" data-testid="select-educafric-number">
                      <SelectValue placeholder="Générer automatiquement si vide" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">
                        ⚡ Générer automatiquement
                      </SelectItem>
                      {(availableNumbersData as any)?.numbers?.length > 0 && (
                        (availableNumbersData as any).numbers.map((num: any) => (
                          <SelectItem key={num.id} value={num.educafricNumber}>
                            {num.educafricNumber}
                            {num.notes && ` - ${num.notes}`}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                    <span>✅</span>
                    <span>Un numéro sera généré automatiquement si vous laissez ce champ vide</span>
                  </p>
                </div>
                <div>
                  <Label htmlFor="name">Nom de l'école</Label>
                  <Input
                    id="name"
                    value={newSchoolData.name}
                    onChange={(e) => setNewSchoolData({...newSchoolData, name: e.target.value})}
                    placeholder="Nom de l'école"
                    data-testid="input-school-name"
                  />
                </div>
                <div>
                  <Label htmlFor="address">Adresse</Label>
                  <Input
                    id="address"
                    value={newSchoolData.address}
                    onChange={(e) => setNewSchoolData({...newSchoolData, address: e.target.value})}
                    placeholder="Adresse complète"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">Ville</Label>
                    <Input
                      id="city"
                      value={newSchoolData.city}
                      onChange={(e) => setNewSchoolData({...newSchoolData, city: e.target.value})}
                      placeholder="Ville"
                    />
                  </div>
                  <div>
                    <Label htmlFor="country">Pays</Label>
                    <Select value={newSchoolData.country} onValueChange={(value) => setNewSchoolData({...newSchoolData, country: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Cameroun">Cameroun</SelectItem>
                        <SelectItem value="Gabon">Gabon</SelectItem>
                        <SelectItem value="République Centrafricaine">République Centrafricaine</SelectItem>
                        <SelectItem value="Tchad">Tchad</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newSchoolData.email}
                    onChange={(e) => setNewSchoolData({...newSchoolData, email: e.target.value})}
                    placeholder="contact@ecole.com"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="type">Type</Label>
                    <Select value={newSchoolData.type} onValueChange={(value: 'public' | 'private') => setNewSchoolData({...newSchoolData, type: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="private">Privé</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="level">Niveau</Label>
                    <Select value={newSchoolData.level} onValueChange={(value) => setNewSchoolData({...newSchoolData, level: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="primary">Primaire</SelectItem>
                        <SelectItem value="secondary">Secondaire</SelectItem>
                        <SelectItem value="university">Université</SelectItem>
                        <SelectItem value="mixed">Mixte</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCreateDialog(false)} data-testid="button-cancel-school">
                  Annuler
                </Button>
                <Button 
                  onClick={handleCreateSchool} 
                  disabled={createSchoolMutation.isPending || !newSchoolData.educafricNumber}
                  data-testid="button-save-school"
                >
                  {createSchoolMutation.isPending ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                  Enregistrer
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </ModernCard>
  );

  const renderSchoolTable = () => (
    <ModernCard className="p-6">
      <div className="overflow-x-auto">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <RefreshCw className="w-6 h-6 animate-spin" />
            <span className="ml-2">{t.loading}</span>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-gray-600">Error loading schools</p>
          </div>
        ) : (schoolsData as any)?.schools?.length === 0 ? (
          <div className="text-center py-8">
            <School className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">{t.noSchools}</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      if (e?.target?.checked) {
                        setSelectedSchools((schoolsData as any)?.schools?.map((s: School) => s.id) || []);
                      } else {
                        setSelectedSchools([]);
                      }
                    }}
                  />
                </th>
                <th className="text-left py-3 px-4">{t.schoolName}</th>
                <th className="text-left py-3 px-4">{t.location}</th>
                <th className="text-left py-3 px-4">{t.type}</th>
                <th className="text-left py-3 px-4">{t.students}</th>
                <th className="text-left py-3 px-4">{t.teachers}</th>
                <th className="text-left py-3 px-4">{t.status}</th>
                <th className="text-left py-3 px-4">{t.actions}</th>
              </tr>
            </thead>
            <tbody>
              {(schoolsData as any)?.schools?.map((school: School) => (
                <tr key={school.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <input
                      type="checkbox"
                      checked={selectedSchools.includes(school.id)}
                      onChange={(e) => {
                        if (e?.target?.checked) {
                          setSelectedSchools([...selectedSchools, school.id]);
                        } else {
                          setSelectedSchools((Array.isArray(selectedSchools) ? selectedSchools : []).filter(id => id !== school.id));
                        }
                      }}
                    />
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Building2 className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium">{school.name || ''}</div>
                        <div className="text-sm text-gray-600">
                          {getLevelTranslation(school.level)}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <div>
                        <div>{school.city}</div>
                        <div className="text-sm text-gray-600">{school.country}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <Badge className={getTypeColor(school.type)}>
                      {school.type === 'public' ? t.public : t.private}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-blue-500" />
                      {school.studentCount}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-green-500" />
                      {school.teacherCount}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <Badge className={getStatusColor(school.subscriptionStatus)}>
                      {school.subscriptionStatus}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleManageSubscription(school)}
                        disabled={manageSubscriptionMutation.isPending}
                      >
                        <CreditCard className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleBlockSchool(school)}
                        disabled={blockSchoolMutation.isPending}
                        className={school.isBlocked ? 'text-green-600' : 'text-red-600'}
                      >
                        {school.isBlocked ? <Unlock className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleDeleteSchool(school.id)}
                        disabled={deleteSchoolMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {(schoolsData as any)?.totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <div className="flex gap-2">
            {Array.from({ length: (schoolsData as any).totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                size="sm"
                variant={currentPage === page ? "default" : "outline"}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </Button>
            ))}
          </div>
        </div>
      )}
    </ModernCard>
  );

  if (!user || !['Admin', 'SiteAdmin'].includes(user.role)) {
    return (
      <ModernCard className="p-6">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Accès Restreint</h3>
          <p className="text-gray-600">Seuls les administrateurs peuvent accéder à la gestion des écoles.</p>
        </div>
      </ModernCard>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <ModernCard className="p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-purple-100 rounded-lg">
            <School className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">{t.title || ''}</h2>
            <p className="text-gray-600">{t.subtitle}</p>
          </div>
        </div>
      </ModernCard>

      {/* Statistics */}
      {renderSchoolStats()}

      {/* Filters */}
      {renderFilters()}

      {/* School Table */}
      {renderSchoolTable()}

      {/* Subscription Management Dialog */}
      <Dialog open={showSubscriptionDialog} onOpenChange={setShowSubscriptionDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Gestion des abonnements</DialogTitle>
            <DialogDescription>
              Gérer l'abonnement de {selectedSchoolForSubscription?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="action">Action</Label>
              <Select value={subscriptionData.action} onValueChange={(value: 'extend' | 'activate' | 'cancel') => setSubscriptionData({...subscriptionData, action: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="extend">Prolonger Abonnement</SelectItem>
                  <SelectItem value="activate">Activer Abonnement</SelectItem>
                  <SelectItem value="cancel">Annuler Abonnement</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(subscriptionData.action === 'extend' || subscriptionData.action === 'activate') && (
              <>
                <div>
                  <Label htmlFor="plan">Sélectionner Plan</Label>
                  <Select value={subscriptionData.planId} onValueChange={(value) => setSubscriptionData({...subscriptionData, planId: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un plan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ecole_500_plus">École 500+ élèves (EDUCAFRIC paie 150.000 CFA/an)</SelectItem>
                      <SelectItem value="ecole_500_moins">École moins de 500 élèves (EDUCAFRIC paie 200.000 CFA/an)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="duration">Durée (mois)</Label>
                  <Select value={subscriptionData.duration} onValueChange={(value) => setSubscriptionData({...subscriptionData, duration: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3 mois</SelectItem>
                      <SelectItem value="6">6 mois</SelectItem>
                      <SelectItem value="12">12 mois</SelectItem>
                      <SelectItem value="24">24 mois</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={subscriptionData.notes}
                onChange={(e) => setSubscriptionData({...subscriptionData, notes: e.target.value})}
                placeholder="Notes additionnelles sur cette action..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSubscriptionDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleSubscriptionAction} disabled={manageSubscriptionMutation.isPending}>
              {manageSubscriptionMutation.isPending ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SchoolManagement;