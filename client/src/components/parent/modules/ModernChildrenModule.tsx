import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Button
} from '@/components/ui/button';
import {
  Input
} from '@/components/ui/input';
import {
  Label
} from '@/components/ui/label';
import {
  Badge
} from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Users,
  Plus,
  School,
  MapPin,
  Clock,
  GraduationCap,
  Star,
  AlertCircle,
  CheckCircle2,
  Send,
  Search,
  User,
  Calendar,
  FileText,
  Heart
} from 'lucide-react';

interface Child {
  id: number;
  firstName: string;
  lastName: string;
  className: string;
  school: string;
  schoolId: number;
  averageGrade: number;
  attendanceRate: number;
  status: 'excellent' | 'good' | 'needs_attention' | 'at_risk';
  parentConnection: 'verified' | 'pending' | 'unverified';
  birthDate: string;
  profileImage?: string;
}

interface School {
  id: number;
  name: string;
  address: string;
  city: string;
  country: string;
  type: 'public' | 'private';
  isEducAfricPartner: boolean;
}

interface AddChildRequest {
  firstName: string;
  lastName: string;
  birthDate: string;
  schoolId: number;
  className: string;
  relationshipType: 'parent' | 'guardian' | 'emergency_contact';
  reason: string;
  identityDocuments: string;
}

const ModernChildrenModule: React.FC = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState('children');
  const [isAddChildOpen, setIsAddChildOpen] = useState(false);
  const [schoolSearchQuery, setSchoolSearchQuery] = useState('');
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);

  const [newChildRequest, setNewChildRequest] = useState<AddChildRequest>({
    firstName: '',
    lastName: '',
    birthDate: '',
    schoolId: 0,
    className: '',
    relationshipType: 'parent',
    reason: '',
    identityDocuments: ''
  });

  const text = {
    fr: {
      title: 'Mes Enfants',
      subtitle: 'Gérez vos enfants et connectez-vous aux établissements EDUCAFRIC',
      tabs: {
        children: 'Mes Enfants',
        addChild: 'Ajouter Enfant',
        schools: 'Établissements'
      },
      noChildren: 'Aucun enfant connecté',
      noChildrenDesc: 'Commencez par ajouter votre premier enfant pour accéder à toutes les fonctionnalités EDUCAFRIC',
      addFirstChild: 'Ajouter mon premier enfant',
      addChild: 'Ajouter un enfant',
      childInfo: 'Informations de l\'enfant',
      firstName: 'Prénom',
      lastName: 'Nom de famille',
      birthDate: 'Date de naissance',
      school: 'École',
      className: 'Classe',
      searchSchools: 'Rechercher une école...',
      relationship: 'Type de relation',
      reason: 'Motif de la demande',
      identityDocs: 'Documents d\'identité (URL)',
      submitRequest: 'Envoyer la demande',
      cancel: 'Annuler',
      connectionStatus: {
        verified: 'Vérifié',
        pending: 'En attente',
        unverified: 'Non vérifié'
      },
      relationships: {
        parent: 'Parent Principal',
        guardian: 'Tuteur/Responsable',
        emergency_contact: 'Contact d\'Urgence'
      },
      schoolPartner: 'Partenaire EDUCAFRIC',
      publicSchool: 'École Publique',
      privateSchool: 'École Privée',
      average: 'Moyenne',
      attendance: 'Présence',
      class: 'Classe',
      requestSent: 'Demande envoyée avec succès',
      requestSentDesc: 'Votre demande de connexion a été envoyée à l\'administration de l\'école',
      errorOccurred: 'Erreur',
      fillRequired: 'Veuillez remplir tous les champs obligatoires',
      selectSchool: 'Veuillez sélectionner une école',
      reasonPlaceholder: 'Ex: Je suis le parent de cet enfant et souhaite suivre sa scolarité...',
      docsPlaceholder: 'Ex: https://drive.google.com/...'
    },
    en: {
      title: 'My Children',
      subtitle: 'Manage your children and connect to EDUCAFRIC schools',
      tabs: {
        children: 'My Children',
        addChild: 'Add Child',
        schools: 'Schools'
      },
      noChildren: 'No children connected',
      noChildrenDesc: 'Start by adding your first child to access all EDUCAFRIC features',
      addFirstChild: 'Add my first child',
      addChild: 'Add a child',
      childInfo: 'Child information',
      firstName: 'First Name',
      lastName: 'Last Name',
      birthDate: 'Birth Date',
      school: 'School',
      className: 'Class',
      searchSchools: 'Search schools...',
      relationship: 'Relationship Type',
      reason: 'Request Reason',
      identityDocs: 'Identity Documents (URL)',
      submitRequest: 'Submit Request',
      cancel: 'Cancel',
      connectionStatus: {
        verified: 'Verified',
        pending: 'Pending',
        unverified: 'Unverified'
      },
      relationships: {
        parent: 'Primary Parent',
        guardian: 'Guardian/Responsible',
        emergency_contact: 'Emergency Contact'
      },
      schoolPartner: 'EDUCAFRIC Partner',
      publicSchool: 'Public School',
      privateSchool: 'Private School',
      average: 'Average',
      attendance: 'Attendance',
      class: 'Class',
      requestSent: 'Request sent successfully',
      requestSentDesc: 'Your connection request has been sent to the school administration',
      errorOccurred: 'Error',
      fillRequired: 'Please fill all required fields',
      selectSchool: 'Please select a school',
      reasonPlaceholder: 'Ex: I am the parent of this child and wish to follow their education...',
      docsPlaceholder: 'Ex: https://drive.google.com/...'
    }
  };

  const t = text[language];

  // Fetch children data
  const { data: children = [], isLoading: childrenLoading, refetch: refetchChildren } = useQuery({
    queryKey: ['/api/parent/children'],
    retry: false,
  });

  // Fetch EDUCAFRIC schools
  const { data: schools = [], isLoading: schoolsLoading } = useQuery({
    queryKey: ['/api/schools/educafric'],
    retry: false,
  });

  // Filter schools based on search
  const filteredSchools = (schools as School[]).filter((school: School) =>
    school.name.toLowerCase().includes(schoolSearchQuery.toLowerCase()) ||
    school.city.toLowerCase().includes(schoolSearchQuery.toLowerCase())
  );

  // Add child mutation
  const addChildMutation = useMutation({
    mutationFn: async (childData: AddChildRequest) => {
      return apiRequest('/api/parent/children/request', 'POST', childData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/parent/children'] });
      setIsAddChildOpen(false);
      setNewChildRequest({
        firstName: '',
        lastName: '',
        birthDate: '',
        schoolId: 0,
        className: '',
        relationshipType: 'parent',
        reason: '',
        identityDocuments: ''
      });
      setSchoolSearchQuery('');
      toast({
        title: t.requestSent,
        description: t.requestSentDesc,
      });
    },
    onError: (error: any) => {
      toast({
        title: t.errorOccurred,
        description: error.message || 'Failed to submit request',
        variant: 'destructive',
      });
    }
  });

  const handleSubmitRequest = () => {
    if (!newChildRequest.firstName.trim() || 
        !newChildRequest.lastName.trim() || 
        !newChildRequest.birthDate ||
        !newChildRequest.className.trim() ||
        !newChildRequest.reason.trim()) {
      toast({
        title: t.errorOccurred,
        description: t.fillRequired,
        variant: 'destructive',
      });
      return;
    }

    if (newChildRequest.schoolId === 0) {
      toast({
        title: t.errorOccurred,
        description: t.selectSchool,
        variant: 'destructive',
      });
      return;
    }

    addChildMutation.mutate(newChildRequest);
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

  const getConnectionColor = (status: string) => {
    switch (status) {
      case 'verified': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'unverified': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-xl">
        <h1 className="text-2xl font-bold flex items-center gap-3">
          <Users className="w-8 h-8" />
          {t.title}
        </h1>
        <p className="text-blue-100 mt-2">{t.subtitle}</p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="children" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            {t.tabs.children}
          </TabsTrigger>
          <TabsTrigger value="addChild" className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            {t.tabs.addChild}
          </TabsTrigger>
          <TabsTrigger value="schools" className="flex items-center gap-2">
            <School className="w-4 h-4" />
            {t.tabs.schools}
          </TabsTrigger>
        </TabsList>

        {/* Children Tab */}
        <TabsContent value="children" className="space-y-4">
          {childrenLoading ? (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">
                  {language === 'fr' ? 'Chargement...' : 'Loading...'}
                </p>
              </CardContent>
            </Card>
          ) : children.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">{t.noChildren}</h3>
                <p className="text-gray-500 mb-6">{t.noChildrenDesc}</p>
                <Button 
                  onClick={() => setActiveTab('addChild')}
                  className="bg-blue-600 hover:bg-blue-700"
                  data-testid="button-add-first-child"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {t.addFirstChild}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {Array.isArray(children) && children.map((child: Child, index: number) => (
                <Card key={child.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                            {child.firstName.charAt(0)}{child.lastName.charAt(0)}
                          </div>
                          <div>
                            <h4 className="text-xl font-bold text-gray-800">
                              {child.firstName} {child.lastName}
                            </h4>
                            <div className="flex gap-2 mt-1">
                              <Badge className={getConnectionColor(child.parentConnection)}>
                                {t.connectionStatus[child.parentConnection as keyof typeof t.connectionStatus]}
                              </Badge>
                              {child.status && (
                                <Badge className={getStatusColor(child.status)}>
                                  {child.status}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <p className="text-sm text-gray-600">{t.class}</p>
                            <p className="font-semibold text-gray-800">{child.className}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">{t.school}</p>
                            <p className="font-semibold text-gray-800">{child.school}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">{t.average}</p>
                            <p className={`font-semibold ${
                              child.averageGrade >= 16 ? 'text-green-600' :
                              child.averageGrade >= 12 ? 'text-blue-600' :
                              child.averageGrade >= 10 ? 'text-orange-600' : 'text-red-600'
                            }`}>
                              {child.averageGrade}/20
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">{t.attendance}</p>
                            <p className={`font-semibold ${
                              child.attendanceRate >= 90 ? 'text-green-600' :
                              child.attendanceRate >= 80 ? 'text-blue-600' :
                              child.attendanceRate >= 70 ? 'text-orange-600' : 'text-red-600'
                            }`}>
                              {child.attendanceRate}%
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Add Child Tab */}
        <TabsContent value="addChild" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                {t.addChild}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Child Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <User className="w-5 h-5" />
                  {t.childInfo}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">{t.firstName} *</Label>
                    <Input
                      id="firstName"
                      value={newChildRequest.firstName}
                      onChange={(e) => setNewChildRequest(prev => ({ ...prev, firstName: e.target.value }))}
                      placeholder={t.firstName}
                      data-testid="input-child-firstname"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">{t.lastName} *</Label>
                    <Input
                      id="lastName"
                      value={newChildRequest.lastName}
                      onChange={(e) => setNewChildRequest(prev => ({ ...prev, lastName: e.target.value }))}
                      placeholder={t.lastName}
                      data-testid="input-child-lastname"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="birthDate">{t.birthDate} *</Label>
                    <Input
                      id="birthDate"
                      type="date"
                      value={newChildRequest.birthDate}
                      onChange={(e) => setNewChildRequest(prev => ({ ...prev, birthDate: e.target.value }))}
                      data-testid="input-child-birthdate"
                    />
                  </div>
                  <div>
                    <Label htmlFor="className">{t.className} *</Label>
                    <Input
                      id="className"
                      value={newChildRequest.className}
                      onChange={(e) => setNewChildRequest(prev => ({ ...prev, className: e.target.value }))}
                      placeholder="CM2, 6ème, Terminale..."
                      data-testid="input-child-class"
                    />
                  </div>
                </div>
              </div>

              {/* School Selection */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <School className="w-5 h-5" />
                  {t.school} *
                </h3>
                
                <div className="space-y-2">
                  <Input
                    value={schoolSearchQuery}
                    onChange={(e) => setSchoolSearchQuery(e.target.value)}
                    placeholder={t.searchSchools}
                    data-testid="input-search-schools"
                  />
                  
                  {schoolsLoading ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                    </div>
                  ) : (
                    <div className="max-h-40 overflow-y-auto border rounded-lg">
                      {(filteredSchools as School[]).map((school: School) => (
                        <div
                          key={school.id}
                          className={`p-3 cursor-pointer hover:bg-gray-50 border-b last:border-b-0 ${
                            newChildRequest.schoolId === school.id ? 'bg-blue-50 border-blue-200' : ''
                          }`}
                          onClick={() => setNewChildRequest(prev => ({ ...prev, schoolId: school.id }))}
                          data-testid={`school-option-${school.id}`}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium">{school.name}</h4>
                              <p className="text-sm text-gray-600">{school.city}, {school.country}</p>
                            </div>
                            <div className="flex flex-col gap-1">
                              {school.isEducAfricPartner && (
                                <Badge className="bg-green-100 text-green-800 text-xs">
                                  {t.schoolPartner}
                                </Badge>
                              )}
                              <Badge variant="outline" className="text-xs">
                                {school.type === 'public' ? t.publicSchool : t.privateSchool}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Relationship and Documentation */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="relationship">{t.relationship} *</Label>
                  <Select
                    value={newChildRequest.relationshipType}
                    onValueChange={(value: 'parent' | 'guardian' | 'emergency_contact') => 
                      setNewChildRequest(prev => ({ ...prev, relationshipType: value }))
                    }
                  >
                    <SelectTrigger data-testid="select-relationship">
                      <SelectValue placeholder={t.relationship} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="parent">{t.relationships.parent}</SelectItem>
                      <SelectItem value="guardian">{t.relationships.guardian}</SelectItem>
                      <SelectItem value="emergency_contact">{t.relationships.emergency_contact}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="reason">{t.reason} *</Label>
                  <Input
                    id="reason"
                    value={newChildRequest.reason}
                    onChange={(e) => setNewChildRequest(prev => ({ ...prev, reason: e.target.value }))}
                    placeholder={t.reasonPlaceholder}
                    data-testid="input-reason"
                  />
                </div>

                <div>
                  <Label htmlFor="identityDocs">{t.identityDocs}</Label>
                  <Input
                    id="identityDocs"
                    value={newChildRequest.identityDocuments}
                    onChange={(e) => setNewChildRequest(prev => ({ ...prev, identityDocuments: e.target.value }))}
                    placeholder={t.docsPlaceholder}
                    data-testid="input-identity-docs"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex gap-3">
                <Button
                  onClick={handleSubmitRequest}
                  disabled={addChildMutation.isPending}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  data-testid="button-submit-request"
                >
                  {addChildMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {language === 'fr' ? 'Envoi...' : 'Sending...'}
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      {t.submitRequest}
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Schools Tab */}
        <TabsContent value="schools" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <School className="w-5 h-5" />
                {t.tabs.schools}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {schoolsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">
                    {language === 'fr' ? 'Chargement des écoles...' : 'Loading schools...'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <Input
                    value={schoolSearchQuery}
                    onChange={(e) => setSchoolSearchQuery(e.target.value)}
                    placeholder={t.searchSchools}
                    data-testid="input-search-schools-tab"
                  />
                  
                  <div className="grid gap-4">
                    {(filteredSchools as School[]).map((school: School) => (
                      <Card key={school.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="text-lg font-semibold">{school.name}</h4>
                              <p className="text-gray-600 flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                {school.address}, {school.city}, {school.country}
                              </p>
                            </div>
                            <div className="flex flex-col gap-2">
                              {school.isEducAfricPartner && (
                                <Badge className="bg-green-100 text-green-800">
                                  {t.schoolPartner}
                                </Badge>
                              )}
                              <Badge variant="outline">
                                {school.type === 'public' ? t.publicSchool : t.privateSchool}
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ModernChildrenModule;