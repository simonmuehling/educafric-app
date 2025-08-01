import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  User, Mail, Calendar, MapPin, Phone, BookOpen, Trophy,
  Edit3, Save, X, Star, Target, Clock, Award, BarChart3
} from 'lucide-react';

const StudentProfile: React.FC = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    address: '',
    class: '',
    parentName: '',
    parentPhone: '',
    bio: '',
    interests: [],
    languages: []
  });

  // Fetch student profile data from API
  const { data: profileData, isLoading } = useQuery({
    queryKey: ['/api/student/profile'],
    enabled: !!user
  });

  // Update profile mutation using our new POST route
  const updateProfileMutation = useMutation({
    mutationFn: async (updates: any) => {
      const response = await fetch('/api/student/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to update profile');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/student/profile'] });
      toast({
        title: 'Profil mis à jour',
        description: 'Vos informations ont été sauvegardées avec succès.'
      });
      setIsEditing(false);
    },
    onError: () => {
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour le profil.',
        variant: 'destructive'
      });
    }
  });

  // Update form data when profile data loads
  useEffect(() => {
    if (profileData) {
      setFormData(profileData);
    }
  }, [profileData]);

  // Get achievements and stats from profile data
  const achievements = profileData?.achievements || [];
  const academicStats = profileData?.academicStats || {
    currentAverage: 0,
    classRank: 0,
    totalStudents: 0,
    attendanceRate: 0,
    completedAssignments: 0,
    totalAssignments: 0
  };

  const text = {
    fr: {
      title: 'Mon Profil Étudiant',
      subtitle: 'Gérez vos informations personnelles et académiques',
      personalInfo: 'Informations Personnelles',
      academicInfo: 'Informations Académiques',
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
      class: 'Classe',
      parentName: 'Nom du parent/tuteur',
      parentPhone: 'Téléphone parent',
      bio: 'Biographie',
      interests: 'Centres d\'intérêt',
      languages: 'Langues parlées',
      currentAverage: 'Moyenne actuelle',
      classRank: 'Rang de classe',
      attendanceRate: 'Taux de présence',
      assignmentsCompleted: 'Devoirs terminés',
      recentAchievements: 'Réalisations récentes'
    },
    en: {
      title: 'My Student Profile',
      subtitle: 'Manage your personal and academic information',
      personalInfo: 'Personal Information',
      academicInfo: 'Academic Information',
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
      class: 'Class',
      parentName: 'Parent/Guardian Name',
      parentPhone: 'Parent Phone',
      bio: 'Biography',
      interests: 'Interests',
      languages: 'Languages Spoken',
      currentAverage: 'Current Average',
      classRank: 'Class Rank',
      attendanceRate: 'Attendance Rate',
      assignmentsCompleted: 'Assignments Completed',
      recentAchievements: 'Recent Achievements'
    }
  };

  const t = text[language as keyof typeof text];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    const updates = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      phone: formData.phone,
      bio: formData.bio,
      interests: formData.interests,
      languages: formData.languages
    };
    updateProfileMutation.mutate(updates);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{language === 'fr' ? 'Chargement du profil...' : 'Loading profile...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{t.title || ''}</h1>
              <p className="text-gray-600">{t.subtitle}</p>
            </div>
            <div className="flex gap-3">
              {!isEditing ? (
                <Button 
                  onClick={() => setIsEditing(true)} 
                  className="bg-blue-600 hover:bg-blue-700"
                  data-testid="button-edit-profile"
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  {t.edit}
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button 
                    onClick={handleSave} 
                    className="bg-green-600 hover:bg-green-700"
                    disabled={updateProfileMutation.isPending}
                    data-testid="button-save-profile"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {updateProfileMutation.isPending ? 'Sauvegarde...' : t.save}
                  </Button>
                  <Button 
                    onClick={() => setIsEditing(false)} 
                    variant="outline"
                    data-testid="button-cancel-profile"
                  >
                    <X className="w-4 h-4 mr-2" />
                    {t.cancel}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Overview */}
          <div className="lg:col-span-1">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardContent className="p-6 text-center">
                <div className="mb-6">
                  <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                    JK
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">
                  {formData.firstName || ''} {formData.lastName || ''}
                </h3>
                <p className="text-gray-600 mb-2">{formData.class}</p>
                <Badge className="bg-blue-100 text-blue-800 mb-4">Élève Actif</Badge>
                
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-center gap-2">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <span>{formData.email || ''}</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <span>{formData.phone}</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span>{formData.address}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Academic Stats */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl mt-6">
              <CardHeader>
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-purple-600" />
                  {t.stats}
                </h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">{t.currentAverage}</span>
                  <span className="font-bold text-green-600">{academicStats.currentAverage}/20</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">{t.classRank}</span>
                  <span className="font-bold text-blue-600">{academicStats.classRank}/{academicStats.totalStudents}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">{t.attendanceRate}</span>
                  <span className="font-bold text-emerald-600">{academicStats.attendanceRate}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">{t.assignmentsCompleted}</span>
                  <span className="font-bold text-orange-600">{academicStats.completedAssignments}/{academicStats.totalAssignments}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-600" />
                  {t.personalInfo}
                </h3>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">{t.firstName || ''}</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName || ''}
                      onChange={(e) => handleInputChange('firstName', e?.target?.value)}
                      disabled={!isEditing}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">{t.lastName || ''}</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName || ''}
                      onChange={(e) => handleInputChange('lastName', e?.target?.value)}
                      disabled={!isEditing}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">{t.email || ''}</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email || ''}
                      onChange={(e) => handleInputChange('email', e?.target?.value)}
                      disabled={!isEditing}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">{t.phone}</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e?.target?.value)}
                      disabled={!isEditing}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="dateOfBirth">{t.dateOfBirth}</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => handleInputChange('dateOfBirth', e?.target?.value)}
                      disabled={!isEditing}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="class">{t.class}</Label>
                    <Input
                      id="class"
                      value={formData.class}
                      onChange={(e) => handleInputChange('class', e?.target?.value)}
                      disabled={!isEditing}
                      className="mt-1"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="address">{t.address}</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e?.target?.value)}
                      disabled={!isEditing}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="parentName">{t.parentName}</Label>
                    <Input
                      id="parentName"
                      value={formData.parentName}
                      onChange={(e) => handleInputChange('parentName', e?.target?.value)}
                      disabled={!isEditing}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="parentPhone">{t.parentPhone}</Label>
                    <Input
                      id="parentPhone"
                      value={formData.parentPhone}
                      onChange={(e) => handleInputChange('parentPhone', e?.target?.value)}
                      disabled={!isEditing}
                      className="mt-1"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="bio">{t.bio}</Label>
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => handleInputChange('bio', e?.target?.value)}
                      disabled={!isEditing}
                      className="mt-1"
                      rows={3}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Interests and Languages */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Target className="w-5 h-5 text-orange-600" />
                    {t.interests}
                  </h3>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {(Array.isArray(formData.interests) ? formData.interests : []).map((interest, index) => (
                      <Badge key={index} variant="secondary" className="bg-orange-100 text-orange-800">
                        {interest}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-green-600" />
                    {t.languages}
                  </h3>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {(Array.isArray(formData.languages) ? formData.languages : []).map((language, index) => (
                      <Badge key={index} variant="secondary" className="bg-green-100 text-green-800">
                        {language}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Achievements */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-600" />
                  {t.recentAchievements}
                </h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(Array.isArray(achievements) ? achievements : []).map((achievement, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg">
                      <div className="text-2xl">{achievement.icon}</div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{achievement.title || ''}</h4>
                        <p className="text-sm text-gray-600">{achievement.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;