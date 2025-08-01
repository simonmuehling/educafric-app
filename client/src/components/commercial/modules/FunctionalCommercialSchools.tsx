import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Building2, MapPin, Users, TrendingUp, 
  Plus, Search, Filter, Download,
  Eye, Edit, Phone, Mail,
  Star, AlertTriangle, CheckCircle
} from 'lucide-react';

interface School {
  id: number;
  name: string;
  location: string;
  address: string;
  phone: string;
  email: string;
  director: string;
  studentCount: number;
  teacherCount: number;
  status: 'active' | 'inactive' | 'pending';
  subscriptionPlan: 'basic' | 'premium' | 'enterprise';
  monthlyRevenue: number;
  contractDate: string;
  lastContact: string;
  notes: string;
}

const FunctionalCommercialSchools: React.FC = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [planFilter, setPlanFilter] = useState<string>('all');
  const [isAddSchoolOpen, setIsAddSchoolOpen] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);

  const [schoolForm, setSchoolForm] = useState({
    name: '',
    location: '',
    address: '',
    phone: '',
    email: '',
    director: '',
    subscriptionPlan: 'basic',
    notes: ''
  });

  // Fetch schools data
  const { data: schools = [], isLoading } = useQuery<School[]>({
    queryKey: ['/api/commercial/schools'],
    enabled: !!user
  });

  // Add school mutation
  const addSchoolMutation = useMutation({
    mutationFn: async (schoolData: any) => {
      const response = await fetch('/api/commercial/school', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(schoolData),
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to add school');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/commercial/schools'] });
      setIsAddSchoolOpen(false);
      resetForm();
      toast({
        title: 'École ajoutée',
        description: 'L\'école a été ajoutée avec succès.'
      });
    },
    onError: () => {
      toast({
        title: 'Erreur',
        description: 'Impossible d\'ajouter l\'école.',
        variant: 'destructive'
      });
    }
  });

  const resetForm = () => {
    setSchoolForm({
      name: '',
      location: '',
      address: '',
      phone: '',
      email: '',
      director: '',
      subscriptionPlan: 'basic',
      notes: ''
    });
  };

  const handleAddSchool = () => {
    if (schoolForm.name && schoolForm.email && schoolForm.director) {
      addSchoolMutation.mutate(schoolForm);
    }
  };

  const text = {
    fr: {
      title: 'Mes Écoles',
      subtitle: 'Gérez votre portefeuille d\'établissements scolaires',
      loading: 'Chargement des écoles...',
      noData: 'Aucune école enregistrée',
      stats: {
        totalSchools: 'Écoles Totales',
        activeSchools: 'Écoles Actives',
        monthlyRevenue: 'Revenus Mensuels',
        averageStudents: 'Moyenne Élèves/École'
      },
      actions: {
        addSchool: 'Ajouter École',
        viewDetails: 'Voir Détails',
        editSchool: 'Modifier',
        contact: 'Contacter',
        generateReport: 'Rapport'
      },
      filters: {
        all: 'Toutes',
        active: 'Actives',
        inactive: 'Inactives',
        pending: 'En Attente'
      },
      plans: {
        basic: 'Basic',
        premium: 'Premium',
        enterprise: 'Enterprise'
      },
      status: {
        active: 'Active',
        inactive: 'Inactive',
        pending: 'En Attente'
      }
    },
    en: {
      title: 'My Schools',
      subtitle: 'Manage your school portfolio',
      loading: 'Loading schools...',
      noData: 'No schools registered',
      stats: {
        totalSchools: 'Total Schools',
        activeSchools: 'Active Schools',
        monthlyRevenue: 'Monthly Revenue',
        averageStudents: 'Avg Students/School'
      },
      actions: {
        addSchool: 'Add School',
        viewDetails: 'View Details',
        editSchool: 'Edit',
        contact: 'Contact',
        generateReport: 'Report'
      },
      filters: {
        all: 'All',
        active: 'Active',
        inactive: 'Inactive',
        pending: 'Pending'
      },
      plans: {
        basic: 'Basic',
        premium: 'Premium',
        enterprise: 'Enterprise'
      },
      status: {
        active: 'Active',
        inactive: 'Inactive',
        pending: 'Pending'
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

  // Calculate statistics
  const totalSchools = schools.length;
  const activeSchools = (Array.isArray(schools) ? schools : []).filter(s => s.status === 'active').length;
  const monthlyRevenue = (Array.isArray(schools) ? schools : []).reduce((sum, s) => sum + s.monthlyRevenue, 0);
  const averageStudents = totalSchools > 0 ? Math.round((Array.isArray(schools) ? schools : []).reduce((sum, s) => sum + s.studentCount, 0) / totalSchools) : 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'basic': return 'bg-blue-100 text-blue-800';
      case 'premium': return 'bg-purple-100 text-purple-800';
      case 'enterprise': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredSchools = (Array.isArray(schools) ? schools : []).filter(school => {
    if (!school) return false;
    const matchesSearch = (school.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (school.location || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (school.director || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || school.status === statusFilter;
    const matchesPlan = planFilter === 'all' || school.subscriptionPlan === planFilter;
    
    return matchesSearch && matchesStatus && matchesPlan;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t.title || ''}</h1>
          <p className="text-gray-600 mt-1">{t.subtitle}</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            {t?.actions?.generateReport}
          </Button>
          <Button 
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => setIsAddSchoolOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            {t?.actions?.addSchool}
          </Button>
        </div>
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
                <p className="text-2xl font-bold">{totalSchools}</p>
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
                <p className="text-2xl font-bold text-green-600">{activeSchools}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">{t?.stats?.monthlyRevenue}</p>
                <p className="text-2xl font-bold text-purple-600">{monthlyRevenue.toLocaleString()} CFA</p>
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
                <p className="text-sm text-gray-600">{t?.stats?.averageStudents}</p>
                <p className="text-2xl font-bold text-orange-600">{averageStudents}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center space-x-2">
              <Search className="w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Rechercher une école..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border rounded-md px-3 py-2 w-64"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border rounded-md px-3 py-2"
              >
                <option value="all">{t?.filters?.all}</option>
                <option value="active">{t?.filters?.active}</option>
                <option value="inactive">{t?.filters?.inactive}</option>
                <option value="pending">{t?.filters?.pending}</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <select
                value={planFilter}
                onChange={(e) => setPlanFilter(e.target.value)}
                className="border rounded-md px-3 py-2"
              >
                <option value="all">Tous les plans</option>
                <option value="basic">{t?.plans?.basic}</option>
                <option value="premium">{t?.plans?.premium}</option>
                <option value="enterprise">{t?.plans?.enterprise}</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Schools List */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Portefeuille d'Écoles ({filteredSchools.length})</h3>
        </CardHeader>
        <CardContent>
          {filteredSchools.length === 0 ? (
            <div className="text-center py-8">
              <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">{t.noData}</h3>
              <p className="text-gray-600">Commencez par ajouter des écoles à votre portefeuille.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {(Array.isArray(filteredSchools) ? filteredSchools : []).map((school) => (
                <div key={school.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold text-lg">{school.name || ''}</h4>
                        <Badge className={getStatusColor(school.status)}>
                          {t?.status?.[school.status as keyof typeof t.status]}
                        </Badge>
                        <Badge className={getPlanColor(school.subscriptionPlan)}>
                          {t?.plans?.[school.subscriptionPlan as keyof typeof t.plans]}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-500" />
                          <span>{school.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-gray-500" />
                          <span>{school.studentCount} élèves, {school.teacherCount} enseignants</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-gray-500" />
                          <span>{school.monthlyRevenue.toLocaleString()} CFA/mois</span>
                        </div>
                      </div>
                      
                      <div className="mt-2 text-sm text-gray-600">
                        <strong>Directeur:</strong> {school.director}
                      </div>
                      
                      {school.notes && (
                        <div className="mt-2 text-sm text-gray-500">
                          <strong>Notes:</strong> {school.notes}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col gap-2 ml-4">
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4 mr-1" />
                        {t?.actions?.viewDetails}
                      </Button>
                      <Button size="sm" variant="outline">
                        <Phone className="w-4 h-4 mr-1" />
                        {t?.actions?.contact}
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="w-4 h-4 mr-1" />
                        {t?.actions?.editSchool}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add School Modal */}
      {isAddSchoolOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Ajouter une École</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Nom de l'École *</label>
                <input
                  type="text"
                  value={schoolForm.name || ''}
                  onChange={(e) => setSchoolForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: École Primaire Excellence"
                  className="w-full border rounded-md px-3 py-2"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Localisation *</label>
                <input
                  type="text"
                  value={schoolForm.location}
                  onChange={(e) => setSchoolForm(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Ex: Yaoundé, Cameroun"
                  className="w-full border rounded-md px-3 py-2"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Adresse</label>
                <textarea
                  value={schoolForm.address}
                  onChange={(e) => setSchoolForm(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Adresse complète..."
                  rows={2}
                  className="w-full border rounded-md px-3 py-2"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-sm font-medium">Téléphone</label>
                  <input
                    type="tel"
                    value={schoolForm.phone}
                    onChange={(e) => setSchoolForm(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+237 XXX XXX XXX"
                    className="w-full border rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Email *</label>
                  <input
                    type="email"
                    value={schoolForm.email || ''}
                    onChange={(e) => setSchoolForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="contact@ecole.cm"
                    className="w-full border rounded-md px-3 py-2"
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Directeur *</label>
                <input
                  type="text"
                  value={schoolForm.director}
                  onChange={(e) => setSchoolForm(prev => ({ ...prev, director: e.target.value }))}
                  placeholder="Nom du directeur"
                  className="w-full border rounded-md px-3 py-2"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Plan d'Abonnement</label>
                <select
                  value={schoolForm.subscriptionPlan}
                  onChange={(e) => setSchoolForm(prev => ({ ...prev, subscriptionPlan: e.target.value }))}
                  className="w-full border rounded-md px-3 py-2"
                >
                  <option value="basic">{t?.plans?.basic}</option>
                  <option value="premium">{t?.plans?.premium}</option>
                  <option value="enterprise">{t?.plans?.enterprise}</option>
                </select>
              </div>
              
              <div>
                <label className="text-sm font-medium">Notes</label>
                <textarea
                  value={schoolForm.notes}
                  onChange={(e) => setSchoolForm(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Notes commerciales..."
                  rows={3}
                  className="w-full border rounded-md px-3 py-2"
                />
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={handleAddSchool}
                  disabled={addSchoolMutation.isPending || !schoolForm.name || !schoolForm.email || !schoolForm.director}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  {addSchoolMutation.isPending ? 'Ajout...' : 'Ajouter l\'École'}
                </Button>
                <Button 
                  onClick={() => setIsAddSchoolOpen(false)}
                  variant="outline"
                >
                  Annuler
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FunctionalCommercialSchools;