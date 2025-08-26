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
import { 
  User, Mail, Phone, Calendar, MapPin, Building, 
  Award, Users, GraduationCap, Edit, Save, X, School,
  BarChart3, Clock, TrendingUp, Star, Shield
} from 'lucide-react';

interface DirectorProfile {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: string;
  schoolName: string;
  position: string;
  qualifications: string[];
  experience: number;
  bio: string;
  languages: string[];
  totalTeachers: number;
  totalStudents: number;
  totalClasses: number;
  yearsInPosition: number;
  achievements: Array<{
    id: number;
    title: string;
    description: string;
    date: string;
    type: string;
  }>;
}

const FunctionalDirectorProfile: React.FC = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<DirectorProfile>>({});
  
  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Fetch director profile data from settings endpoint
  const { data: profileData, isLoading } = useQuery({
    queryKey: ['/api/director/settings'],
    queryFn: async () => {
      const response = await fetch('/api/director/settings', {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Failed to fetch director settings');
      }
      return response.json();
    },
    enabled: !!user
  });

  // Extract profile from settings data
  const profile = profileData?.settings?.profile || {};

  // Update profile mutation using settings endpoint
  const updateProfileMutation = useMutation({
    mutationFn: async (updates: Partial<DirectorProfile>) => {
      const response = await fetch('/api/director/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile: updates }),
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to update profile');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/director/settings'] });
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

  // Password change handler
  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: language === 'fr' ? "Erreur" : "Error",
        description: language === 'fr' ? "Les mots de passe ne correspondent pas." : "Passwords do not match.",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast({
        title: language === 'fr' ? "Erreur" : "Error",
        description: language === 'fr' ? "Le mot de passe doit contenir au moins 8 caractères." : "Password must be at least 8 characters long.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        }),
      });

      if (response.ok) {
        toast({
          title: language === 'fr' ? "Mot de passe modifié" : "Password Changed",
          description: language === 'fr' ? "Votre mot de passe a été mis à jour avec succès." : "Your password has been updated successfully.",
        });

        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Password change failed');
      }
    } catch (error) {
      toast({
        title: language === 'fr' ? "Erreur" : "Error",
        description: language === 'fr' ? "Impossible de changer le mot de passe." : "Failed to change password.",
        variant: "destructive",
      });
    }
  };

  const text = {
    fr: {
      title: 'Mon Profil Directeur',
      subtitle: 'Gérez vos informations professionnelles et administratives',
      personalInfo: 'Informations Personnelles',
      professionalInfo: 'Informations Professionnelles',
      security: 'Sécurité',
      achievements: 'Réalisations',
      stats: 'Statistiques',
      edit: 'Modifier',
      save: 'Enregistrer',
      cancel: 'Annuler',
      firstName: 'Prénom',
      lastName: 'Nom de famille',
      email: 'Email',
      phone: 'Téléphone',
      dateOfBirth: 'Date de naissance',
      address: 'Adresse',
      schoolName: 'École',
      position: 'Poste',
      qualifications: 'Qualifications',
      experience: 'Années d\'expérience',
      bio: 'Biographie professionnelle',
      languages: 'Langues parlées',
      totalTeachers: 'Enseignants Totaux',
      totalStudents: 'Élèves Totaux',
      totalClasses: 'Classes Totales',
      yearsInPosition: 'Années au Poste',
      recentAchievements: 'Réalisations récentes',
      loading: 'Chargement du profil...',
      currentPassword: 'Mot de passe actuel',
      newPassword: 'Nouveau mot de passe',
      confirmPassword: 'Confirmer le mot de passe',
      changePassword: 'Changer le mot de passe',
      passwordSecurity: 'Sécurité du mot de passe',
      deleteAccount: 'Supprimer mon compte',
      deleteAccountWarning: 'Cette action est irréversible. Toutes vos données seront définitivement supprimées.',
      confirmDelete: 'Confirmer la suppression'
    },
    en: {
      title: 'My Director Profile',
      subtitle: 'Manage your professional and administrative information',
      personalInfo: 'Personal Information',
      professionalInfo: 'Professional Information',
      security: 'Security',
      achievements: 'Achievements',
      stats: 'Statistics',
      edit: 'Edit',
      save: 'Save',
      cancel: 'Cancel',
      firstName: 'First Name',
      lastName: 'Last Name',
      email: 'Email',
      phone: 'Phone',
      dateOfBirth: 'Date of Birth',
      address: 'Address',
      schoolName: 'School',
      position: 'Position',
      qualifications: 'Qualifications',
      experience: 'Years of Experience',
      bio: 'Professional Biography',
      languages: 'Languages Spoken',
      totalTeachers: 'Total Teachers',
      totalStudents: 'Total Students',
      totalClasses: 'Total Classes',
      yearsInPosition: 'Years in Position',
      recentAchievements: 'Recent Achievements',
      loading: 'Loading profile...',
      currentPassword: 'Current Password',
      newPassword: 'New Password',
      confirmPassword: 'Confirm Password',
      changePassword: 'Change Password',
      passwordSecurity: 'Password Security',
      deleteAccount: 'Delete my account',
      deleteAccountWarning: 'This action is irreversible. All your data will be permanently deleted.',
      confirmDelete: 'Confirm deletion'
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
            <h1 className="text-4xl font-bold text-gray-900 mb-2">{t.title || ''}</h1>
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
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="personal" className="flex flex-col items-center gap-1 py-3" title={t.personalInfo}>
              <User className="w-5 h-5" />
              <span className="text-xs hidden sm:block">{t.personalInfo}</span>
            </TabsTrigger>
            <TabsTrigger value="professional" className="flex flex-col items-center gap-1 py-3" title={t.professionalInfo}>
              <Building className="w-5 h-5" />
              <span className="text-xs hidden sm:block">{t.professionalInfo}</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex flex-col items-center gap-1 py-3" title={t.security}>
              <Shield className="w-5 h-5" />
              <span className="text-xs hidden sm:block">{t.security}</span>
            </TabsTrigger>
            <TabsTrigger value="achievements" className="flex flex-col items-center gap-1 py-3" title={t.achievements}>
              <Award className="w-5 h-5" />
              <span className="text-xs hidden sm:block">{t.achievements}</span>
            </TabsTrigger>
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
                    <label className="text-sm font-medium">{t.firstName || ''}</label>
                    <Input
                      value={formData.firstName || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                      disabled={!isEditing}
                      data-testid="input-firstName"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">{t.lastName || ''}</label>
                    <Input
                      value={formData.lastName || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                      disabled={!isEditing}
                      data-testid="input-lastName"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">{t.email || ''}</label>
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
                    <label className="text-sm font-medium">{t.dateOfBirth}</label>
                    <Input
                      value={formData.dateOfBirth || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                      disabled={!isEditing}
                      type="date"
                      data-testid="input-dateOfBirth"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">{t.schoolName}</label>
                    <Input
                      value={formData.schoolName || ''}
                      disabled={true}
                      data-testid="input-schoolName"
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
              </CardContent>
            </Card>
          </TabsContent>

          {/* Professional Information Tab */}
          <TabsContent value="professional" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="text-center">
                <CardContent className="pt-6">
                  <Users className="w-12 h-12 text-blue-600 mx-auto mb-2" />
                  <h3 className="text-2xl font-bold text-gray-900">{profile?.totalTeachers || 0}</h3>
                  <p className="text-gray-600">{t.totalTeachers}</p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="pt-6">
                  <GraduationCap className="w-12 h-12 text-green-600 mx-auto mb-2" />
                  <h3 className="text-2xl font-bold text-gray-900">{profile?.totalStudents || 0}</h3>
                  <p className="text-gray-600">{t.totalStudents}</p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="pt-6">
                  <School className="w-12 h-12 text-orange-600 mx-auto mb-2" />
                  <h3 className="text-2xl font-bold text-gray-900">{profile?.totalClasses || 0}</h3>
                  <p className="text-gray-600">{t.totalClasses}</p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="pt-6">
                  <Clock className="w-12 h-12 text-purple-600 mx-auto mb-2" />
                  <h3 className="text-2xl font-bold text-gray-900">{profile?.yearsInPosition || 0}</h3>
                  <p className="text-gray-600">{t.yearsInPosition}</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building className="w-5 h-5 mr-2" />
                  {t.professionalInfo}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">{t.position}</label>
                  <Input
                    value={formData.position || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
                    disabled={!isEditing}
                    data-testid="input-position"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">{t.qualifications}</label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {(formData.qualifications || []).map((qualification, index) => (
                      <Badge key={index} variant="outline">{qualification}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">{t.bio}</label>
                  <Textarea
                    value={formData.bio || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                    disabled={!isEditing}
                    rows={4}
                    placeholder={language === 'fr' ? 'Décrivez votre expérience administrative...' : 'Describe your administrative experience...'}
                    data-testid="input-bio"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">{t.experience}</label>
                  <Input
                    value={formData.experience || 0}
                    onChange={(e) => setFormData(prev => ({ ...prev, experience: Number(e.target.value) }))}
                    disabled={!isEditing}
                    type="number"
                    data-testid="input-experience"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="w-5 h-5 mr-2" />
                  {t.passwordSecurity}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">{t.currentPassword}</label>
                    <Input
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                      placeholder={language === 'fr' ? 'Entrez votre mot de passe actuel' : 'Enter your current password'}
                      data-testid="input-current-password"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">{t.newPassword}</label>
                    <Input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                      placeholder={language === 'fr' ? 'Nouveau mot de passe (min. 8 caractères)' : 'New password (min. 8 characters)'}
                      data-testid="input-new-password"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">{t.confirmPassword}</label>
                    <Input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      placeholder={language === 'fr' ? 'Confirmez le nouveau mot de passe' : 'Confirm new password'}
                      data-testid="input-confirm-password"
                    />
                  </div>
                  <Button 
                    onClick={handlePasswordChange}
                    className="bg-red-600 hover:bg-red-700"
                    disabled={!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                    data-testid="button-change-password"
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    {t.changePassword}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="w-5 h-5 mr-2" />
                  {t.recentAchievements}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {(profile?.achievements || []).map((achievement: any, index: number) => (
                    <div key={achievement.id || index} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className="bg-yellow-100 rounded-full p-2">
                        <Star className="w-5 h-5 text-yellow-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{achievement.title || ''}</h4>
                        <p className="text-gray-600 text-sm">{achievement.description || ''}</p>
                        <p className="text-gray-500 text-xs mt-1">{achievement.date}</p>
                      </div>
                      <Badge variant="outline">{achievement.type}</Badge>
                    </div>
                  ))}
                  {(!profile?.achievements || profile.achievements.length === 0) && (
                    <div className="text-center py-8">
                      <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">
                        {language === 'fr' ? 'Aucune réalisation pour le moment' : 'No achievements yet'}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default FunctionalDirectorProfile;