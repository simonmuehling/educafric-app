import React, { useState } from 'react';
import { School, Plus, Edit, Trash2, Search, MapPin, Users, DollarSign, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface PlatformSchool {
  id: number;
  name: string;
  location: string;
  studentCount: number;
  teacherCount: number;
  subscriptionStatus: string;
  monthlyRevenue: number;
  createdAt: string;
  contactEmail?: string;
  phone?: string;
}

const FunctionalSiteAdminSchools: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const queryClient = useQueryClient();

  const { data: schools, isLoading, error } = useQuery({
    queryKey: ['/api/admin/platform-schools'],
    queryFn: () => apiRequest('/api/admin/platform-schools')
  });

  const deleteSchoolMutation = useMutation({
    mutationFn: (schoolId: number) => apiRequest(`/api/admin/platform-schools/${schoolId}`, {
      method: 'DELETE'
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/platform-schools'] });
    }
  });

  const updateSchoolMutation = useMutation({
    mutationFn: ({ schoolId, updates }: { schoolId: number; updates: any }) => 
      apiRequest(`/api/admin/platform-schools/${schoolId}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/platform-schools'] });
    }
  });

  const filteredSchools = schools?.filter((school: PlatformSchool) => {
    return school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           school.location.toLowerCase().includes(searchTerm.toLowerCase());
  }) || [];

  const handleDeleteSchool = (schoolId: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette école ?')) {
      deleteSchoolMutation.mutate(schoolId);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getSubscriptionBadgeColor = (status: string) => {
    return status === 'active' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span>Chargement des écoles...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <p>Erreur lors du chargement des écoles</p>
            <p className="text-sm mt-2">Veuillez réessayer plus tard</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <School className="h-5 w-5 text-blue-600" />
            Gestion des Écoles
            <Badge variant="secondary" className="ml-2">
              {filteredSchools.length} écoles
            </Badge>
          </CardTitle>
          <Button 
            onClick={() => setShowAddModal(true)}
            className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Ajouter École
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {/* Search Control */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Rechercher par nom ou localisation..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            data-testid="input-search-schools"
          />
        </div>

        {/* Schools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSchools.map((school: PlatformSchool) => (
            <Card key={school.id} className="hover:shadow-lg transition-shadow" data-testid={`card-school-${school.id}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold text-gray-800 mb-1">
                      {school.name}
                    </CardTitle>
                    <div className="flex items-center text-sm text-gray-600 mb-2">
                      <MapPin className="h-4 w-4 mr-1" />
                      {school.location}
                    </div>
                    <Badge className={getSubscriptionBadgeColor(school.subscriptionStatus)}>
                      {school.subscriptionStatus === 'active' ? 'Actif' : 'Expiré'}
                    </Badge>
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 w-8 p-0"
                      data-testid={`button-edit-school-${school.id}`}
                    >
                      <Edit className="h-4 w-4 text-blue-600" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteSchool(school.id)}
                      className="h-8 w-8 p-0"
                      data-testid={`button-delete-school-${school.id}`}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="space-y-3">
                  {/* Statistics */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 rounded-lg p-3">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 text-blue-600 mr-2" />
                        <div>
                          <div className="text-xs text-gray-600">Étudiants</div>
                          <div className="font-semibold text-blue-800">{school.studentCount}</div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-3">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 text-green-600 mr-2" />
                        <div>
                          <div className="text-xs text-gray-600">Enseignants</div>
                          <div className="font-semibold text-green-800">{school.teacherCount}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Revenue */}
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 text-purple-600 mr-2" />
                        <div>
                          <div className="text-xs text-gray-600">Revenus Mensuels</div>
                          <div className="font-semibold text-purple-800">
                            {formatCurrency(school.monthlyRevenue)}
                          </div>
                        </div>
                      </div>
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    </div>
                  </div>

                  {/* Contact Info */}
                  {(school.contactEmail || school.phone) && (
                    <div className="text-xs text-gray-600 space-y-1">
                      {school.contactEmail && (
                        <div>Email: {school.contactEmail}</div>
                      )}
                      {school.phone && (
                        <div>Tél: {school.phone}</div>
                      )}
                    </div>
                  )}

                  {/* Creation Date */}
                  <div className="text-xs text-gray-500 pt-2 border-t border-gray-100">
                    Créé le: {new Date(school.createdAt).toLocaleDateString('fr-FR')}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredSchools.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <School className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium mb-2">Aucune école trouvée</p>
            <p className="text-sm">Essayez de modifier vos critères de recherche</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FunctionalSiteAdminSchools;