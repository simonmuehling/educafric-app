import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { 
  User, Mail, Phone, Calendar, MapPin, Users, 
  Bell, Shield, CreditCard, Edit, Save, X, Heart,
  Smartphone, MessageSquare, DollarSign, Lock
} from 'lucide-react';

interface ParentProfile {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: string;
  emergencyContact: string;
  occupation: string;
  bio: string;
  totalChildren: number;
  subscriptionPlan: string;
  subscriptionValidUntil: string;
  preferences: {
    smsAlerts: boolean;
    emailReports: boolean;
    gradeAlerts: boolean;
    attendanceAlerts: boolean;
    disciplineAlerts: boolean;
    paymentReminders: boolean;
  };
  children: Array<{
    id: number;
    name: string;
    className: string;
    averageGrade: number;
    status: string;
  }>;
}

const FunctionalParentProfile: React.FC = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<ParentProfile>>({});

  // Fetch parent profile data
  const { data: profile, isLoading } = useQuery<ParentProfile>({
    queryKey: ['/api/parent/profile'],
    enabled: !!user
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (updates: Partial<ParentProfile>) => {
      const response = await fetch('/api/parent/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to update profile');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/parent/profile'] });
      setIsEditing(false);
      toast({
        title: language === 'fr' ? 'Profil mis à jour' : 'Profile updated',
        description: language === 'fr' ? 'Vos informations ont été sauvegardées' : 'Your information has been saved'
      });
    },
    onError: () => {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' ? 'Impossible de mettre à jour le profil' : 'Failed to update profile',
        variant: 'destructive'
      });
    }
  });

  useEffect(() => {
    if (profile) {
      setFormData(profile);
    }
  }, [profile]);

  const handleSave = () => {
    if (formData) {
      updateProfileMutation.mutate(formData);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData(profile);
    }
    setIsEditing(false);
  };

  const handlePreferenceChange = (key: string, value: boolean) => {
    setFormData(prev => ({
      ...prev,
      preferences: {
        smsAlerts: false,
        emailReports: false,
        gradeAlerts: false,
        attendanceAlerts: false,
        disciplineAlerts: false,
        paymentReminders: false,
        ...prev.preferences,
        [key]: value
      }
    }));
  };

  const text = {
    fr: {
      title: 'Mon Profil Parent',
      subtitle: 'Gérez vos informations personnelles et préférences',
      personalInfo: 'Informations Personnelles',
      preferences: 'Préférences',
      subscription: 'Abonnement',
      edit: 'Modifier',
      save: 'Enregistrer',
      cancel: 'Annuler',
      firstName: 'Prénom',
      lastName: 'Nom de famille',
      email: 'Email',
      phone: 'Téléphone',
      dateOfBirth: 'Date de naissance',
      address: 'Adresse',
      emergencyContact: 'Contact d\'urgence',
      occupation: 'Profession',
      bio: 'Biographie',
      totalChildren: 'Enfants Totaux',
      subscriptionPlan: 'Plan d\'Abonnement',
      subscriptionValidUntil: 'Valide jusqu\'au',
      notifications: 'Notifications',
      smsAlerts: 'Alertes SMS',
      emailReports: 'Rapports Email',
      gradeAlerts: 'Alertes Notes',
      attendanceAlerts: 'Alertes Présence',
      disciplineAlerts: 'Alertes Discipline',
      paymentReminders: 'Rappels Paiement',
      myChildren: 'Mes Enfants',
      changePassword: 'Changer le mot de passe',
      manageSubscription: 'Gérer l\'abonnement',
      loading: 'Chargement du profil...'
    },
    en: {
      title: 'My Parent Profile',
      subtitle: 'Manage your personal information and preferences',
      personalInfo: 'Personal Information',
      preferences: 'Preferences',
      subscription: 'Subscription',
      edit: 'Edit',
      save: 'Save',
      cancel: 'Cancel',
      firstName: 'First Name',
      lastName: 'Last Name',
      email: 'Email',
      phone: 'Phone',
      dateOfBirth: 'Date of Birth',
      address: 'Address',
      emergencyContact: 'Emergency Contact',
      occupation: 'Occupation',
      bio: 'Biography',
      totalChildren: 'Total Children',
      subscriptionPlan: 'Subscription Plan',
      subscriptionValidUntil: 'Valid Until',
      notifications: 'Notifications',
      smsAlerts: 'SMS Alerts',
      emailReports: 'Email Reports',
      gradeAlerts: 'Grade Alerts',
      attendanceAlerts: 'Attendance Alerts',
      disciplineAlerts: 'Discipline Alerts',
      paymentReminders: 'Payment Reminders',
      myChildren: 'My Children',
      changePassword: 'Change Password',
      manageSubscription: 'Manage Subscription',
      loading: 'Loading profile...'
    }
  };

  const t = text[language as keyof typeof text];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t.loading}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">{t.title}</h1>
            <p className="text-gray-600">{t.subtitle}</p>
          </div>
          <div className="flex gap-2">
            {!isEditing ? (
              <Button 
                onClick={() => setIsEditing(true)}
                className="bg-blue-600 hover:bg-blue-700"
                data-testid="button-edit-profile"
              >
                <Edit className="w-4 h-4 mr-2" />
                {t.edit}
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button 
                  onClick={handleSave}
                  disabled={updateProfileMutation.isPending}
                  className="bg-green-600 hover:bg-green-700"
                  data-testid="button-save-profile"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {updateProfileMutation.isPending ? 'Saving...' : t.save}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleCancel}
                  data-testid="button-cancel-profile"
                >
                  <X className="w-4 h-4 mr-2" />
                  {t.cancel}
                </Button>
              </div>
            )}
          </div>
        </div>

        <Tabs defaultValue="personal" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="personal">{t.personalInfo}</TabsTrigger>
            <TabsTrigger value="preferences">{t.preferences}</TabsTrigger>
            <TabsTrigger value="subscription">{t.subscription}</TabsTrigger>
          </TabsList>

          {/* Personal Information Tab */}
          <TabsContent value="personal" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  {t.personalInfo}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">{t.firstName}</label>
                    <Input
                      value={formData.firstName || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                      disabled={!isEditing}
                      data-testid="input-firstName"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">{t.lastName}</label>
                    <Input
                      value={formData.lastName || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                      disabled={!isEditing}
                      data-testid="input-lastName"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">{t.email}</label>
                    <Input
                      value={formData.email || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      disabled={!isEditing}
                      type="email"
                      data-testid="input-email"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">{t.phone}</label>
                    <Input
                      value={formData.phone || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      disabled={!isEditing}
                      data-testid="input-phone"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">{t.emergencyContact}</label>
                    <Input
                      value={formData.emergencyContact || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, emergencyContact: e.target.value }))}
                      disabled={!isEditing}
                      data-testid="input-emergencyContact"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">{t.occupation}</label>
                    <Input
                      value={formData.occupation || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, occupation: e.target.value }))}
                      disabled={!isEditing}
                      data-testid="input-occupation"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">{t.address}</label>
                  <Textarea
                    value={formData.address || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    disabled={!isEditing}
                    rows={3}
                    data-testid="input-address"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">{t.bio}</label>
                  <Textarea
                    value={formData.bio || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                    disabled={!isEditing}
                    rows={4}
                    placeholder={language === 'fr' ? 'Parlez-nous de vous...' : 'Tell us about yourself...'}
                    data-testid="input-bio"
                  />
                </div>
              </CardContent>
            </Card>

            {/* My Children Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Heart className="w-5 h-5 mr-2" />
                  {t.myChildren}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {(profile?.children || []).map((child, index) => (
                    <div key={child.id || index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="bg-blue-100 rounded-full p-2">
                          <Users className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{child.name}</h4>
                          <p className="text-sm text-gray-600">{child.className}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">{child.averageGrade}/20</p>
                        <Badge variant={child.status === 'excellent' ? 'default' : 'outline'}>
                          {child.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="w-5 h-5 mr-2" />
                  {t.notifications}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-gray-600" />
                    <span>{t.smsAlerts}</span>
                  </div>
                  <Switch
                    checked={formData.preferences?.smsAlerts || false}
                    onCheckedChange={(value) => handlePreferenceChange('smsAlerts', value)}
                    disabled={!isEditing}
                    data-testid="switch-smsAlerts"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-600" />
                    <span>{t.emailReports}</span>
                  </div>
                  <Switch
                    checked={formData.preferences?.emailReports || false}
                    onCheckedChange={(value) => handlePreferenceChange('emailReports', value)}
                    disabled={!isEditing}
                    data-testid="switch-emailReports"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-gray-600" />
                    <span>{t.gradeAlerts}</span>
                  </div>
                  <Switch
                    checked={formData.preferences?.gradeAlerts || false}
                    onCheckedChange={(value) => handlePreferenceChange('gradeAlerts', value)}
                    disabled={!isEditing}
                    data-testid="switch-gradeAlerts"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-600" />
                    <span>{t.attendanceAlerts}</span>
                  </div>
                  <Switch
                    checked={formData.preferences?.attendanceAlerts || false}
                    onCheckedChange={(value) => handlePreferenceChange('attendanceAlerts', value)}
                    disabled={!isEditing}
                    data-testid="switch-attendanceAlerts"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-gray-600" />
                    <span>{t.paymentReminders}</span>
                  </div>
                  <Switch
                    checked={formData.preferences?.paymentReminders || false}
                    onCheckedChange={(value) => handlePreferenceChange('paymentReminders', value)}
                    disabled={!isEditing}
                    data-testid="switch-paymentReminders"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="w-5 h-5 mr-2" />
                  Sécurité
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  variant="outline" 
                  className="w-full"
                  data-testid="button-change-password"
                >
                  <Lock className="w-4 h-4 mr-2" />
                  {t.changePassword}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Subscription Tab */}
          <TabsContent value="subscription" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="w-5 h-5 mr-2" />
                  {t.subscription}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">{profile?.subscriptionPlan || 'Plan Standard'}</h4>
                  <p className="text-gray-600 text-sm mb-4">
                    {t.subscriptionValidUntil}: {profile?.subscriptionValidUntil || '31/12/2025'}
                  </p>
                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    data-testid="button-manage-subscription"
                  >
                    {t.manageSubscription}
                  </Button>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    {profile?.totalChildren || 0} {language === 'fr' ? 'enfants suivis' : 'children monitored'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default FunctionalParentProfile;