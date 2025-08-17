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

  // Fetch director profile data
  const { data: profile, isLoading } = useQuery<DirectorProfile>({
    queryKey: ['/api/director/profile'],
    enabled: !!user
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (updates: Partial<DirectorProfile>) => {
      const response = await fetch('/api/director/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to update profile');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/director/profile'] });
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

  const text = {
    fr: {
      title: 'Mon Profil Directeur',
      subtitle: 'Gérez vos informations professionnelles et administratives',
      personalInfo: 'Informations Personnelles',
      professionalInfo: 'Informations Professionnelles',
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
      loading: 'Chargement du profil...'
    },
    en: {
      title: 'My Director Profile',
      subtitle: 'Manage your professional and administrative information',
      personalInfo: 'Personal Information',
      professionalInfo: 'Professional Information',
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
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="personal" className="flex flex-col items-center gap-1 py-3" title={t.personalInfo}>
              <User className="w-5 h-5" />
              <span className="text-xs hidden sm:block">{t.personalInfo}</span>
            </TabsTrigger>
            <TabsTrigger value="professional" className="flex flex-col items-center gap-1 py-3" title={t.professionalInfo}>
              <Building className="w-5 h-5" />
              <span className="text-xs hidden sm:block">{t.professionalInfo}</span>
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
                  {(profile?.achievements || []).map((achievement, index) => (
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