import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { ModernCard, ModernStatsCard } from '@/components/ui/ModernCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Building2, Users, Phone, Mail, MapPin, Plus, Search, TrendingUp, DollarSign } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const CommercialCRM = () => {
  const { language } = useLanguage();
  const [showAddSchool, setShowAddSchool] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();

  const text = {
    fr: {
      title: 'CRM - Mes Écoles',
      subtitle: 'Gestion commerciale des établissements scolaires',
      totalSchools: 'Écoles Gérées',
      activeContracts: 'Contrats Actifs',
      monthlyRevenue: 'Revenus Mensuels',
      conversionRate: 'Taux Conversion',
      addSchool: 'Ajouter École',
      searchSchools: 'Rechercher écoles...',
      selectStatus: 'Tous les statuts',
      prospect: 'Prospect',
      negotiation: 'Négociation',
      active: 'Actif',
      inactive: 'Inactif',
      schoolName: 'Nom École',
      contactPerson: 'Personne Contact',
      phone: 'Téléphone',
      email: 'Email',
      address: 'Adresse',
      status: 'Statut',
      students: 'Élèves',
      revenue: 'Revenus',
      save: 'Enregistrer',
      cancel: 'Annuler',
      edit: 'Modifier',
      contact: 'Contacter',
      viewDetails: 'Voir Détails',
      schoolAdded: 'École ajoutée avec succès!',
      loading: 'Chargement...',
      error: 'Erreur lors du chargement',
      noSchools: 'Aucune école trouvée'
    },
    en: {
      title: 'CRM - My Schools',
      subtitle: 'Commercial management of educational institutions',
      totalSchools: 'Managed Schools',
      activeContracts: 'Active Contracts',
      monthlyRevenue: 'Monthly Revenue',
      conversionRate: 'Conversion Rate',
      addSchool: 'Add School',
      searchSchools: 'Search schools...',
      selectStatus: 'All statuses',
      prospect: 'Prospect',
      negotiation: 'Negotiation',
      active: 'Active',
      inactive: 'Inactive',
      schoolName: 'School Name',
      contactPerson: 'Contact Person',
      phone: 'Phone',
      email: 'Email',
      address: 'Address',
      status: 'Status',
      students: 'Students',
      revenue: 'Revenue',
      save: 'Save',
      cancel: 'Cancel',
      edit: 'Edit',
      contact: 'Contact',
      viewDetails: 'View Details',
      schoolAdded: 'School added successfully!',
      loading: 'Loading...',
      error: 'Error loading data',
      noSchools: 'No schools found'
    }
  };

  const t = text[language as keyof typeof text];

  // Fetch schools from API
  const { data: schools = [], isLoading, error } = useQuery({
    queryKey: ['/api/schools', selectedStatus, searchTerm],
    queryFn: async () => {
      let url = '/api/schools';
      const params = new URLSearchParams();
      if (selectedStatus) params.append('status', selectedStatus);
      if (searchTerm) params.append('search', searchTerm);
      if (params.toString()) url += `?${params}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch schools');
      }
      return response.json();
    }
  });

  // Add school mutation
  const addSchoolMutation = useMutation({
    mutationFn: async (schoolData: any) => {
      const response = await fetch('/api/schools', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(schoolData),
      });
      if (!response.ok) throw new Error('Failed to add school');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/schools'] });
      alert(t.schoolAdded);
      setShowAddSchool(false);
    },
    onError: (error) => {
      console.error('Error adding school:', error);
      alert('Erreur lors de l\'ajout de l\'école.');
    }
  });

  const handleAddSchool = (formData: FormData) => {
    const schoolData = {
      name: formData.get('name') as string,
      contactPerson: formData.get('contactPerson') as string,
      phone: formData.get('phone') as string,
      email: formData.get('email') as string,
      address: formData.get('address') as string,
      status: formData.get('status') as string,
      studentCount: parseInt(formData.get('studentCount') as string) || 0,
      monthlyRevenue: parseFloat(formData.get('monthlyRevenue') as string) || 0
    };

    addSchoolMutation.mutate(schoolData);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8 text-gray-500">
          {t.loading}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8 text-red-600">
          {t.error}
        </div>
      </div>
    );
  }

  // Calculate statistics
  const totalSchools = (Array.isArray(schools) ? schools.length : 0);
  const activeContracts = (Array.isArray(schools) ? schools : []).filter((s: any) => s.status === 'active').length;
  const monthlyRevenue = (Array.isArray(schools) ? schools : []).reduce((sum: number, s: any) => sum + (s.monthlyRevenue || 0), 0);
  const prospects = (Array.isArray(schools) ? schools : []).filter((s: any) => s.status === 'prospect').length;
  const conversionRate = prospects > 0 ? Math.round((activeContracts / prospects) * 100) : 0;

  const stats = [
    {
      title: t.totalSchools,
      value: totalSchools.toString(),
      icon: <Building2 className="w-5 h-5" />,
      trend: { value: 2, isPositive: true },
      gradient: 'blue' as const
    },
    {
      title: t.activeContracts,
      value: activeContracts.toString(),
      icon: <Users className="w-5 h-5" />,
      trend: { value: 1, isPositive: true },
      gradient: 'green' as const
    },
    {
      title: t.monthlyRevenue,
      value: `${monthlyRevenue.toLocaleString()} CFA`,
      icon: <DollarSign className="w-5 h-5" />,
      trend: { value: 15, isPositive: true },
      gradient: 'purple' as const
    },
    {
      title: t.conversionRate,
      value: `${conversionRate}%`,
      icon: <TrendingUp className="w-5 h-5" />,
      trend: { value: 5, isPositive: true },
      gradient: 'orange' as const
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'prospect':
        return 'bg-blue-100 text-blue-800';
      case 'negotiation':
        return 'bg-yellow-100 text-yellow-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredSchools = (Array.isArray(schools) ? schools : []).filter((school: any) => {
    const matchesStatus = !selectedStatus || school.status === selectedStatus;
    const matchesSearch = !searchTerm || 
      school?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      school.contactPerson?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">{t.title || ''}</h2>
        <p className="text-gray-600 mb-6">{t.subtitle}</p>
        
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {(Array.isArray(stats) ? stats : []).map((stat, index) => (
            <ModernStatsCard key={index} {...stat} />
          ))}
        </div>
      </div>

      {/* Controls */}
      <ModernCard className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Gestion des Écoles</h3>
          <Button 
            onClick={() => setShowAddSchool(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            {t.addSchool}
          </Button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder={t.searchSchools}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e?.target?.value)}
              className="pl-10"
            />
          </div>
          <div>
            <select 
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e?.target?.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="">{t.selectStatus}</option>
              <option value="prospect">{t.prospect}</option>
              <option value="negotiation">{t.negotiation}</option>
              <option value="active">{t.active}</option>
              <option value="inactive">{t.inactive}</option>
            </select>
          </div>
        </div>

        {/* Schools List */}
        <div className="space-y-4">
          {(Array.isArray(filteredSchools) ? filteredSchools.length : 0) === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {t.noSchools}
            </div>
          ) : (
            (Array.isArray(filteredSchools) ? filteredSchools : []).map((school: any) => (
              <div key={school.id} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold text-gray-900">{school.name || ''}</h4>
                        <Badge className={getStatusColor(school.status)}>
                          {t[school.status as keyof typeof t] || school.status}
                        </Badge>
                      </div>
                      
                      <div className="text-sm text-gray-600 space-y-1">
                        <p className="flex items-center">
                          <Users className="w-4 h-4 mr-2" />
                          <strong>Contact:</strong> {school.contactPerson || 'Non spécifié'}
                        </p>
                        <p className="flex items-center">
                          <Phone className="w-4 h-4 mr-2" />
                          <strong>Tél:</strong> {school.phone || 'Non spécifié'}
                        </p>
                        <p className="flex items-center">
                          <Mail className="w-4 h-4 mr-2" />
                          <strong>Email:</strong> {school.email || 'Non spécifié'}
                        </p>
                        <p className="flex items-center">
                          <MapPin className="w-4 h-4 mr-2" />
                          <strong>Adresse:</strong> {school.address || 'Non spécifiée'}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900 mb-1">
                      {school.studentCount || 0} {t.students}
                    </div>
                    <div className="text-sm text-gray-600 mb-3">
                      {school.monthlyRevenue ? `${school?.monthlyRevenue?.toLocaleString()} CFA/mois` : 'Revenus N/A'}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Phone className="w-4 h-4 mr-1" />
                        {t.contact}
                      </Button>
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                        <TrendingUp className="w-4 h-4 mr-1" />
                        {t.viewDetails}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </ModernCard>

      {/* Add School Modal */}
      {showAddSchool && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t.addSchool}</h3>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              handleAddSchool(new FormData(e.target as HTMLFormElement));
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t.schoolName} *
                  </label>
                  <Input name="name" required />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t.contactPerson}
                  </label>
                  <Input name="contactPerson" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t.phone}
                    </label>
                    <Input name="phone" type="tel" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t.email || ''}
                    </label>
                    <Input name="email" type="email" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t.address}
                  </label>
                  <Input name="address" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t.status} *
                    </label>
                    <select name="status" required className="w-full border border-gray-300 rounded-md px-3 py-2">
                      <option value="prospect">{t.prospect}</option>
                      <option value="negotiation">{t.negotiation}</option>
                      <option value="active">{t.active}</option>
                      <option value="inactive">{t.inactive}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t.students}
                    </label>
                    <Input name="studentCount" type="number" min="0" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t.revenue} (CFA/mois)
                  </label>
                  <Input name="monthlyRevenue" type="number" min="0" />
                </div>
              </div>

              <div className="flex gap-2 mt-6">
                <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
                  {t.save}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setShowAddSchool(false)}
                >
                  {t.cancel}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommercialCRM;