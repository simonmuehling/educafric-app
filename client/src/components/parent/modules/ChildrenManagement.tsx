import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { ModernCard, ModernStatsCard } from '@/components/ui/ModernCard';
import { Users, User, GraduationCap, Calendar, Eye, MessageSquare, RefreshCw, AlertCircle, Plus, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Child {
  id: number;
  firstName: string;
  lastName: string;
  fullName?: string;
  className: string;
  school: string;
  schoolId: number;
  averageGrade: number;
  attendanceRate: number;
  status: 'excellent' | 'good' | 'needs_attention' | 'at_risk';
  nextExam?: string;
  recentGrades?: Array<{
    subject: string;
    grade: number;
    date: string;
  }>;
  notifications?: number;
  birthDate: string;
  parentConnection: 'verified' | 'pending' | 'unverified';
}

interface ChildrenStats {
  totalChildren: number;
  averageGrade: number;
  averageAttendance: number;
  uniqueSchools: number;
  activeConnections: number;
}

const ChildrenManagement = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddChildOpen, setIsAddChildOpen] = useState(false);
  const [newChild, setNewChild] = useState({
    firstName: '',
    lastName: '',
    className: '',
    school: '',
    birthDate: ''
  });

  // Fetch children data from API
  const { data: childrenData = [], isLoading, error, refetch } = useQuery<Child[]>({
    queryKey: ['/api/parent/children'],
    queryFn: async () => {
      console.log('[CHILDREN_MANAGEMENT] 🔍 Fetching children...');
      const response = await fetch('/api/parent/children', {
        credentials: 'include'
      });
      if (!response.ok) {
        console.error('[CHILDREN_MANAGEMENT] ❌ Failed to fetch children');
        throw new Error('Failed to fetch children');
      }
      const data = await response.json();
      console.log('[CHILDREN_MANAGEMENT] ✅ Children loaded:', data.length);
      return data;
    },
    enabled: !!user,
    retry: 2
  });

  // Fetch children statistics
  const { data: statsData } = useQuery<ChildrenStats>({
    queryKey: ['/api/parent/children/stats'],
    queryFn: async () => {
      console.log('[CHILDREN_MANAGEMENT] 🔍 Fetching children stats...');
      const response = await fetch('/api/parent/children/stats', {
        credentials: 'include'
      });
      if (!response.ok) {
        console.error('[CHILDREN_MANAGEMENT] ❌ Failed to fetch stats');
        throw new Error('Failed to fetch children stats');
      }
      const data = await response.json();
      console.log('[CHILDREN_MANAGEMENT] ✅ Stats loaded:', data);
      return data;
    },
    enabled: !!user,
    retry: 2
  });

  // Add child connection mutation
  const addChildMutation = useMutation({
    mutationFn: async (childData: any) => {
      const response = await fetch('/api/parent/children/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(childData),
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to connect child');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/parent/children'] });
      queryClient.invalidateQueries({ queryKey: ['/api/parent/children/stats'] });
      setIsAddChildOpen(false);
      setNewChild({ firstName: '', lastName: '', className: '', school: '', birthDate: '' });
      toast({
        title: language === 'fr' ? 'Connexion demandée' : 'Connection requested',
        description: language === 'fr' ? 'Demande de connexion envoyée à l\'administration' : 'Connection request sent to administration'
      });
    },
    onError: () => {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' ? 'Impossible de connecter l\'enfant' : 'Failed to connect child',
        variant: 'destructive'
      });
    }
  });

  const handleAddChild = () => {
    if (newChild.firstName && newChild.lastName && newChild.className) {
      addChildMutation.mutate(newChild);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'bg-green-100 text-green-800';
      case 'good': return 'bg-blue-100 text-blue-800';
      case 'needs_attention': return 'bg-orange-100 text-orange-800';
      case 'at_risk': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    const statusMap = {
      fr: {
        excellent: 'Excellent',
        good: 'Bien',
        needs_attention: 'Attention',
        at_risk: 'Risque'
      },
      en: {
        excellent: 'Excellent',
        good: 'Good',
        needs_attention: 'Needs Attention',
        at_risk: 'At Risk'
      }
    };
    return statusMap[language as keyof typeof statusMap][status as keyof typeof statusMap.fr] || status;
  };

  const getConnectionColor = (connection: string) => {
    switch (connection) {
      case 'verified': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'unverified': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">
            {language === 'fr' ? 'Chargement des enfants...' : 'Loading children...'}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">
            {language === 'fr' ? 'Erreur lors du chargement' : 'Error loading children'}
          </p>
          <Button onClick={() => refetch()} className="mt-4">
            <RefreshCw className="w-4 h-4 mr-2" />
            {language === 'fr' ? 'Réessayer' : 'Retry'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-purple-600 rounded-lg flex items-center justify-center">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              {language === 'fr' ? 'Gestion des Enfants' : 'Children Management'}
            </h2>
            <p className="text-gray-600">
              {language === 'fr' ? 'Suivez et gérez vos enfants' : 'Track and manage your children'}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetch()} data-testid="button-refresh-children">
            <RefreshCw className="w-4 h-4 mr-2" />
            {language === 'fr' ? 'Actualiser' : 'Refresh'}
          </Button>
          <Dialog open={isAddChildOpen} onOpenChange={setIsAddChildOpen}>
            <DialogTrigger asChild>
              <Button className="bg-purple-600 hover:bg-purple-700" data-testid="button-connect-child">
                <Plus className="w-4 h-4 mr-2" />
                {language === 'fr' ? 'Connecter Enfant' : 'Connect Child'}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {language === 'fr' ? 'Connecter un Enfant' : 'Connect a Child'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">
                      {language === 'fr' ? 'Prénom' : 'First Name'}
                    </label>
                    <Input
                      value={newChild.firstName}
                      onChange={(e) => setNewChild(prev => ({ ...prev, firstName: e.target.value }))}
                      placeholder={language === 'fr' ? 'Prénom de l\'enfant' : 'Child\'s first name'}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">
                      {language === 'fr' ? 'Nom' : 'Last Name'}
                    </label>
                    <Input
                      value={newChild.lastName}
                      onChange={(e) => setNewChild(prev => ({ ...prev, lastName: e.target.value }))}
                      placeholder={language === 'fr' ? 'Nom de famille' : 'Last name'}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">
                    {language === 'fr' ? 'Classe' : 'Class'}
                  </label>
                  <Input
                    value={newChild.className}
                    onChange={(e) => setNewChild(prev => ({ ...prev, className: e.target.value }))}
                    placeholder={language === 'fr' ? 'Ex: 6ème A' : 'Ex: 6th Grade A'}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">
                    {language === 'fr' ? 'École' : 'School'}
                  </label>
                  <Input
                    value={newChild.school}
                    onChange={(e) => setNewChild(prev => ({ ...prev, school: e.target.value }))}
                    placeholder={language === 'fr' ? 'Nom de l\'\u00e9cole' : 'School name'}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">
                    {language === 'fr' ? 'Date de naissance' : 'Birth Date'}
                  </label>
                  <Input
                    type="date"
                    value={newChild.birthDate}
                    onChange={(e) => setNewChild(prev => ({ ...prev, birthDate: e.target.value }))}
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button 
                    onClick={handleAddChild}
                    disabled={addChildMutation.isPending || !newChild.firstName || !newChild.lastName || !newChild.className}
                    className="flex-1"
                  >
                    {addChildMutation.isPending 
                      ? (language === 'fr' ? 'Connexion...' : 'Connecting...')
                      : (language === 'fr' ? 'Demander Connexion' : 'Request Connection')
                    }
                  </Button>
                  <Button variant="outline" onClick={() => setIsAddChildOpen(false)}>
                    {language === 'fr' ? 'Annuler' : 'Cancel'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <ModernStatsCard
          title={language === 'fr' ? 'Mes Enfants' : 'My Children'}
          value={(statsData?.totalChildren || childrenData.length).toString()}
          icon={<Users className="w-5 h-5" />}
          gradient="blue"
        />
        <ModernStatsCard
          title={language === 'fr' ? 'Moyenne Globale' : 'Overall Average'}
          value={`${(statsData?.averageGrade || 0).toFixed(1)}/20`}
          icon={<GraduationCap className="w-5 h-5" />}
          gradient="green"
          trend={{ value: 1.2, isPositive: true }}
        />
        <ModernStatsCard
          title={language === 'fr' ? 'Présence' : 'Attendance'}
          value={`${(statsData?.averageAttendance || 0).toFixed(1)}%`}
          icon={<Calendar className="w-5 h-5" />}
          gradient="purple"
        />
        <ModernStatsCard
          title={language === 'fr' ? 'Écoles' : 'Schools'}
          value={(statsData?.uniqueSchools || 0).toString()}
          icon={<User className="w-5 h-5" />}
          gradient="orange"
        />
      </div>

      {/* Children List */}
      <ModernCard gradient="default">
        <h3 className="text-xl font-bold mb-6">
          {language === 'fr' ? 'Mes Enfants' : 'My Children'}
          <span className="text-sm font-normal text-gray-500 ml-2">
            ({childrenData.length} {language === 'fr' ? 'enfants' : 'children'})
          </span>
        </h3>
        {childrenData.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-2">
              {language === 'fr' ? 'Aucun enfant connecté' : 'No children connected'}
            </p>
            <p className="text-gray-400 text-sm mb-4">
              {language === 'fr' 
                ? 'Connectez votre premier enfant pour commencer le suivi' 
                : 'Connect your first child to start tracking'
              }
            </p>
            <Button 
              onClick={() => setIsAddChildOpen(true)}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              {language === 'fr' ? 'Connecter un Enfant' : 'Connect a Child'}
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {childrenData.map((child, index) => (
              <div key={child.id} className={`activity-card-${index % 2 === 0 ? 'blue' : 'green'} p-6 rounded-xl transition-all duration-300 hover:scale-102`}>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h4 className="text-xl font-bold text-gray-800">
                        {child.fullName || `${child.firstName} ${child.lastName}`}
                      </h4>
                      <Badge className={getStatusColor(child.status)}>
                        {getStatusText(child.status)}
                      </Badge>
                      <Badge className={getConnectionColor(child.parentConnection)}>
                        {child.parentConnection === 'verified' ? (
                          language === 'fr' ? 'Vérifié' : 'Verified'
                        ) : child.parentConnection === 'pending' ? (
                          language === 'fr' ? 'En attente' : 'Pending'
                        ) : (
                          language === 'fr' ? 'Non vérifié' : 'Unverified'
                        )}
                      </Badge>
                      {child.notifications && child.notifications > 0 && (
                        <Badge className="bg-red-100 text-red-800">
                          {child.notifications} {language === 'fr' ? 'notifications' : 'notifications'}
                        </Badge>
                      )}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">{language === 'fr' ? 'Classe' : 'Class'}</p>
                        <p className="font-semibold text-gray-800">{child.className}</p>  
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">{language === 'fr' ? 'École' : 'School'}</p>
                        <p className="font-semibold text-gray-800">{child.school}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">{language === 'fr' ? 'Moyenne' : 'Average'}</p>
                        <p className={`font-semibold ${
                          child.averageGrade >= 16 ? 'text-green-600' :
                          child.averageGrade >= 12 ? 'text-blue-600' :
                          child.averageGrade >= 10 ? 'text-orange-600' : 'text-red-600'
                        }`}>
                          {child.averageGrade.toFixed(1)}/20
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">{language === 'fr' ? 'Présence' : 'Attendance'}</p>
                        <p className={`font-semibold ${
                          child.attendanceRate >= 95 ? 'text-green-600' :
                          child.attendanceRate >= 90 ? 'text-blue-600' :
                          child.attendanceRate >= 85 ? 'text-orange-600' : 'text-red-600'
                        }`}>
                          {child.attendanceRate.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-3 flex-wrap">
                  <Button size="sm" variant="outline" data-testid={`button-view-details-${child.id}`}>
                    <Eye className="w-4 h-4 mr-2" />
                    {language === 'fr' ? 'Voir Détails' : 'View Details'}
                  </Button>
                  <Button size="sm" variant="outline" data-testid={`button-contact-school-${child.id}`}>
                    <MessageSquare className="w-4 h-4 mr-2" />
                    {language === 'fr' ? 'Contacter École' : 'Contact School'}
                  </Button>
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white" data-testid={`button-full-tracking-${child.id}`}>
                    {language === 'fr' ? 'Suivi Complet' : 'Full Tracking'}
                  </Button>
                  {child.parentConnection !== 'verified' && (
                    <Button size="sm" variant="outline" className="border-orange-200 text-orange-700">
                      <Edit className="w-4 h-4 mr-2" />
                      {language === 'fr' ? 'Modifier Connexion' : 'Edit Connection'}
                    </Button>
                  )}
                </div>
                
                {child.nextExam && (
                  <div className="mt-4 p-3 bg-white rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-600">
                      {language === 'fr' ? 'Prochain examen:' : 'Next exam:'} 
                      <span className="font-medium ml-1">{new Date(child.nextExam).toLocaleDateString()}</span>
                    </p>
                  </div>
                )}
                
                {child.recentGrades && child.recentGrades.length > 0 && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      {language === 'fr' ? 'Notes récentes:' : 'Recent grades:'}
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      {child.recentGrades.slice(0, 3).map((grade, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {grade.subject}: {grade.grade}/20
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </ModernCard>
    </div>
  );
};

export default ChildrenManagement;