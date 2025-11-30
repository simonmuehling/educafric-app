import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuthContext } from '@/contexts/AuthContext';
import { 
  User, Mail, Phone, MapPin, Calendar, 
  Save, Edit, Eye, EyeOff, Lock, Shield, BookOpen, GraduationCap, Users, Plus, X, Check, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ModernCard } from '@/components/ui/ModernCard';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useQuery, useMutation } from '@tanstack/react-query';

const TeacherProfileSettings = () => {
  const { language } = useLanguage();
  const { user } = useAuthContext();
  const { toast } = useToast();
  const [activeSection, setActiveSection] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isEditingClasses, setIsEditingClasses] = useState(false);
  const [isEditingSubjects, setIsEditingSubjects] = useState(false);
  const [selectedClassIds, setSelectedClassIds] = useState<number[]>([]);
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<number[]>([]);
  
  const [profile, setProfile] = useState({
    firstName: user?.name?.split(' ')[0] || '',
    lastName: user?.name?.split(' ')[1] || '',
    email: user?.email || '',
    phone: '',
    address: '',
    specialization: 'Mathématiques',
    experience: '5',
    bio: '',
    teachingLevel: 'Collège',
    certifications: 'Licence de Mathématiques'
  });

  const [passwordChange, setPasswordChange] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Fetch actual subjects assigned to teacher from database
  const { data: subjectsData, isLoading: subjectsLoading, refetch: refetchSubjects } = useQuery({
    queryKey: ['/api/teacher/subjects'],
    queryFn: async () => {
      const response = await fetch('/api/teacher/subjects', { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch subjects');
      return response.json();
    }
  });

  // Fetch actual classes assigned to teacher from database
  const { data: classesData, isLoading: classesLoading, refetch: refetchClasses } = useQuery({
    queryKey: ['/api/teacher/classes'],
    queryFn: async () => {
      const response = await fetch('/api/teacher/classes', { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch classes');
      return response.json();
    }
  });

  // Fetch all available classes in the school
  const { data: availableClassesData, isLoading: availableClassesLoading } = useQuery({
    queryKey: ['/api/teacher/available-classes'],
    queryFn: async () => {
      const response = await fetch('/api/teacher/available-classes', { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch available classes');
      return response.json();
    },
    enabled: isEditingClasses || isEditingSubjects
  });

  // Fetch all available subjects in the school
  const { data: availableSubjectsData, isLoading: availableSubjectsLoading } = useQuery({
    queryKey: ['/api/teacher/available-subjects'],
    queryFn: async () => {
      const response = await fetch('/api/teacher/available-subjects', { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch available subjects');
      return response.json();
    },
    enabled: isEditingClasses || isEditingSubjects
  });

  // Mutation to update assignments
  const updateAssignmentsMutation = useMutation({
    mutationFn: async (data: { classIds: number[]; subjectIds: number[] }) => {
      const response = await apiRequest('PUT', '/api/teacher/assignments', data);
      return response;
    },
    onSuccess: () => {
      toast({
        title: language === 'fr' ? 'Succès' : 'Success',
        description: language === 'fr' 
          ? 'Vos assignations ont été mises à jour' 
          : 'Your assignments have been updated'
      });
      refetchClasses();
      refetchSubjects();
      queryClient.invalidateQueries({ queryKey: ['/api/teacher/classes'] });
      queryClient.invalidateQueries({ queryKey: ['/api/teacher/subjects'] });
      setIsEditingClasses(false);
      setIsEditingSubjects(false);
    },
    onError: () => {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' 
          ? 'Impossible de mettre à jour vos assignations' 
          : 'Failed to update your assignments',
        variant: 'destructive'
      });
    }
  });

  // Extract subjects and classes from API response
  const teacherSubjects = subjectsData?.subjects || [];
  const teacherClasses = classesData?.classes || [];
  const schoolsWithClasses = classesData?.schoolsWithClasses || [];
  const availableClasses = availableClassesData?.classes || [];
  const availableSubjects = availableSubjectsData?.subjects || [];
  
  // Calculate total students from assigned classes
  const totalStudents = teacherClasses.reduce((acc: number, cls: any) => acc + (cls.studentCount || 0), 0);

  // Initialize selected IDs when starting to edit - use id or classId (API returns both)
  useEffect(() => {
    if (isEditingClasses || isEditingSubjects) {
      // Get class IDs - API may return as 'id' or 'classId' depending on endpoint
      const classIds = teacherClasses.map((cls: any) => cls.id || cls.classId).filter(Boolean);
      // Get subject IDs - API may return as 'id' or 'subjectId' depending on endpoint  
      const subjectIds = teacherSubjects.map((subj: any) => subj.id || subj.subjectId).filter(Boolean);
      
      console.log('[TEACHER_PROFILE] Initializing edit with classes:', classIds, 'subjects:', subjectIds);
      setSelectedClassIds(classIds);
      setSelectedSubjectIds(subjectIds);
    }
  }, [isEditingClasses, isEditingSubjects, teacherClasses, teacherSubjects]);

  const handleSaveAssignments = () => {
    updateAssignmentsMutation.mutate({
      classIds: selectedClassIds,
      subjectIds: selectedSubjectIds
    });
  };

  const toggleClassSelection = (classId: number) => {
    setSelectedClassIds(prev => 
      prev.includes(classId) 
        ? prev.filter(id => id !== classId)
        : [...prev, classId]
    );
  };

  const toggleSubjectSelection = (subjectId: number) => {
    setSelectedSubjectIds(prev => 
      prev.includes(subjectId) 
        ? prev.filter(id => id !== subjectId)
        : [...prev, subjectId]
    );
  };

  const text = {
    fr: {
      title: 'Paramètres du Profil',
      subtitle: 'Gérer vos informations personnelles et professionnelles',
      profile: 'Profil',
      security: 'Sécurité',
      preferences: 'Préférences',
      personalInfo: 'Informations personnelles',
      professionalInfo: 'Informations professionnelles',
      firstName: 'Prénom',
      lastName: 'Nom',
      email: 'Email',
      phone: 'Téléphone',
      address: 'Adresse',
      specialization: 'Spécialisation',
      experience: 'Années d\'expérience',
      bio: 'Biographie',
      teachingLevel: 'Niveau d\'enseignement',
      certifications: 'Certifications',
      changePassword: 'Changer le mot de passe',
      currentPassword: 'Mot de passe actuel',
      newPassword: 'Nouveau mot de passe',
      confirmPassword: 'Confirmer le mot de passe',
      save: 'Enregistrer',
      cancel: 'Annuler',
      edit: 'Modifier',
      showPassword: 'Afficher le mot de passe',
      hidePassword: 'Masquer le mot de passe',
      profileUpdated: 'Profil mis à jour',
      passwordChanged: 'Mot de passe modifié',
      error: 'Erreur',
      required: 'Ce champ est obligatoire',
      passwordMismatch: 'Les mots de passe ne correspondent pas'
    },
    en: {
      title: 'Profile Settings',
      subtitle: 'Manage your personal and professional information',
      profile: 'Profile',
      security: 'Security',
      preferences: 'Preferences',
      personalInfo: 'Personal information',
      professionalInfo: 'Professional information',
      firstName: 'First name',
      lastName: 'Last name',
      email: 'Email',
      phone: 'Phone',
      address: 'Address',
      specialization: 'Specialisation',
      experience: 'Years of experience',
      bio: 'Biography',
      teachingLevel: 'Teaching level',
      certifications: 'Certifications',
      changePassword: 'Change password',
      currentPassword: 'Current password',
      newPassword: 'New password',
      confirmPassword: 'Confirm password',
      save: 'Save',
      cancel: 'Cancel',
      edit: 'Edit',
      showPassword: 'Show password',
      hidePassword: 'Hide password',
      profileUpdated: 'Profile updated',
      passwordChanged: 'Password changed',
      error: 'Error',
      required: 'This field is required',
      passwordMismatch: 'Passwords do not match'
    }
  };

  const t = text[language as keyof typeof text];

  const specializations = [
    'Mathématiques',
    'Français',
    'Anglais',
    'Sciences Physiques',
    'Sciences de la Vie et de la Terre',
    'Histoire-Géographie',
    'Éducation Physique',
    'Arts Plastiques',
    'Musique',
    'Informatique'
  ];

  const teachingLevels = [
    'Maternelle',
    'Primaire',
    'Collège',
    'Lycée',
    'Université',
    'Formation Professionnelle'
  ];

  const sections = [
    { id: 'profile', name: t.profile, icon: User },
    { id: 'security', name: t.security, icon: Shield },
    { id: 'preferences', name: t.preferences, icon: Edit }
  ];

  const handleProfileSave = async () => {
    if (!profile.firstName || !profile.lastName || !profile.email) {
      toast({
        title: t.error,
        description: t.required,
        variant: 'destructive'
      });
      return;
    }

    try {
      await apiRequest('PUT', '/api/auth/profile', {
        username: `${profile.firstName || ''} ${profile.lastName || ''}`,
        email: profile.email,
        phone: profile.phone,
        address: profile.address,
        specialization: profile.specialization,
        experience: profile.experience,
        bio: profile.bio,
        teachingLevel: profile.teachingLevel,
        certifications: profile.certifications
      });

      toast({
        title: t.profileUpdated,
        description: language === 'fr' ? 'Vos informations ont été mises à jour' : 'Your information has been updated'
      });

      setIsEditing(false);
      
    } catch (error) {
      toast({
        title: t.error,
        description: language === 'fr' ? 'Impossible de mettre à jour le profil' : 'Failed to update profile',
        variant: 'destructive'
      });
    }
  };

  const handlePasswordChange = async () => {
    if (!passwordChange.currentPassword || !passwordChange.newPassword || !passwordChange.confirmPassword) {
      toast({
        title: t.error,
        description: t.required,
        variant: 'destructive'
      });
      return;
    }

    if (passwordChange.newPassword !== passwordChange.confirmPassword) {
      toast({
        title: t.error,
        description: t.passwordMismatch,
        variant: 'destructive'
      });
      return;
    }

    try {
      await apiRequest('POST', '/api/auth/change-password', {
        currentPassword: passwordChange.currentPassword,
        newPassword: passwordChange.newPassword
      });

      toast({
        title: t.passwordChanged,
        description: language === 'fr' ? 'Votre mot de passe a été modifié avec succès' : 'Your password has been changed successfully'
      });

      setPasswordChange({ currentPassword: '', newPassword: '', confirmPassword: '' });
      
    } catch (error) {
      toast({
        title: t.error,
        description: language === 'fr' ? 'Impossible de changer le mot de passe' : 'Failed to change password',
        variant: 'destructive'
      });
    }
  };

  const renderProfileSection = () => (
    <div className="space-y-6">
      {/* Informations personnelles */}
      <ModernCard className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">{t.personalInfo}</h3>
          <Button
            onClick={() => setIsEditing(!isEditing)}
            variant="outline"
            size="sm"
          >
            <Edit className="w-4 h-4 mr-2" />
            {isEditing ? t.cancel : t.edit}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">{t.firstName || ''}</label>
            <Input
              value={profile.firstName || ''}
              onChange={(e) => setProfile(prev => ({ ...prev, firstName: e?.target?.value }))}
              disabled={!isEditing}
              placeholder="Jean"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">{t.lastName || ''}</label>
            <Input
              value={profile.lastName || ''}
              onChange={(e) => setProfile(prev => ({ ...prev, lastName: e?.target?.value }))}
              disabled={!isEditing}
              placeholder="Dupont"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">{t.email || ''}</label>
            <Input
              type="email"
              value={profile.email || ''}
              onChange={(e) => setProfile(prev => ({ ...prev, email: e?.target?.value }))}
              disabled={!isEditing}
              placeholder="jean.dupont@educafric.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">{t.phone}</label>
            <Input
              value={profile.phone}
              onChange={(e) => setProfile(prev => ({ ...prev, phone: e?.target?.value }))}
              disabled={!isEditing}
              placeholder="+237 677 123 456"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2">{t.address}</label>
            <Input
              value={profile.address}
              onChange={(e) => setProfile(prev => ({ ...prev, address: e?.target?.value }))}
              disabled={!isEditing}
              placeholder="Yaoundé, Cameroun"
            />
          </div>
        </div>
      </ModernCard>

      {/* Informations professionnelles */}
      <ModernCard className="p-6">
        <h3 className="text-lg font-semibold mb-4">{t.professionalInfo}</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">{t.specialization}</label>
            <select
              value={profile.specialization}
              onChange={(e) => setProfile(prev => ({ ...prev, specialization: e?.target?.value }))}
              disabled={!isEditing}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
            >
              {(Array.isArray(specializations) ? specializations : []).map(spec => (
                <option key={spec} value={spec}>{spec}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">{t.experience}</label>
            <Input
              type="number"
              value={profile.experience}
              onChange={(e) => setProfile(prev => ({ ...prev, experience: e?.target?.value }))}
              disabled={!isEditing}
              placeholder="5"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">{t.teachingLevel}</label>
            <select
              value={profile.teachingLevel}
              onChange={(e) => setProfile(prev => ({ ...prev, teachingLevel: e?.target?.value }))}
              disabled={!isEditing}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
            >
              {(Array.isArray(teachingLevels) ? teachingLevels : []).map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">{t.certifications}</label>
            <Input
              value={profile.certifications}
              onChange={(e) => setProfile(prev => ({ ...prev, certifications: e?.target?.value }))}
              disabled={!isEditing}
              placeholder="Licence de Mathématiques"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2">{t.bio}</label>
            <Textarea
              value={profile.bio}
              onChange={(e) => setProfile(prev => ({ ...prev, bio: e?.target?.value }))}
              disabled={!isEditing}
              placeholder="Brève description de votre parcours et expérience..."
              rows={4}
            />
          </div>
        </div>

        {isEditing && (
          <div className="flex gap-2 justify-end mt-4">
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              {t.cancel}
            </Button>
            <Button onClick={handleProfileSave}>
              <Save className="w-4 h-4 mr-2" />
              {t.save}
            </Button>
          </div>
        )}
      </ModernCard>
    </div>
  );

  const renderSecuritySection = () => (
    <div className="space-y-6">
      <ModernCard className="p-6">
        <h3 className="text-lg font-semibold mb-4">{t.changePassword}</h3>

        <div className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium mb-2">{t.currentPassword}</label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                value={passwordChange.currentPassword}
                onChange={(e) => setPasswordChange(prev => ({ ...prev, currentPassword: e?.target?.value }))}
                placeholder="••••••••"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">{t.newPassword}</label>
            <div className="relative">
              <Input
                type={showNewPassword ? 'text' : 'password'}
                value={passwordChange.newPassword}
                onChange={(e) => setPasswordChange(prev => ({ ...prev, newPassword: e?.target?.value }))}
                placeholder="••••••••"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">{t.confirmPassword}</label>
            <Input
              type="password"
              value={passwordChange.confirmPassword}
              onChange={(e) => setPasswordChange(prev => ({ ...prev, confirmPassword: e?.target?.value }))}
              placeholder="••••••••"
            />
          </div>

          <Button onClick={handlePasswordChange} className="w-full">
            <Lock className="w-4 h-4 mr-2" />
            {t.changePassword}
          </Button>
        </div>
      </ModernCard>
    </div>
  );

  const renderPreferencesSection = () => (
    <div className="space-y-6">
      <ModernCard className="p-6">
        <h3 className="text-lg font-semibold mb-4">Préférences de notification</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Notifications par email</p>
              <p className="text-sm text-gray-600">Recevoir des notifications par email</p>
            </div>
            <Button variant="outline" size="sm">Activé</Button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Notifications SMS</p>
              <p className="text-sm text-gray-600">Recevoir des alertes par SMS</p>
            </div>
            <Button variant="outline" size="sm">Activé</Button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Notifications push</p>
              <p className="text-sm text-gray-600">Notifications sur l'application</p>
            </div>
            <Button variant="outline" size="sm">Activé</Button>
          </div>
        </div>
      </ModernCard>

      <ModernCard className="p-6">
        <h3 className="text-lg font-semibold mb-4">Préférences d'affichage</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Langue</label>
            <select className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="fr">Français</option>
              <option value="en">English</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Fuseau horaire</label>
            <select className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="africa/douala">Afrique/Douala (WAT)</option>
              <option value="africa/lagos">Afrique/Lagos (WAT)</option>
            </select>
          </div>
        </div>
      </ModernCard>
    </div>
  );

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'profile':
        return renderProfileSection();
      case 'security':
        return renderSecuritySection();
      case 'preferences':
        return renderPreferencesSection();
      default:
        return renderProfileSection();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">{t.title || ''}</h2>
        <p className="text-gray-600">{t.subtitle}</p>
      </div>

      {/* Statistiques - Données réelles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <ModernCard className="p-4 text-center activity-card-blue">
          <BookOpen className="w-6 h-6 mx-auto mb-2 text-blue-600" />
          <div className="text-2xl font-bold text-gray-800">
            {subjectsLoading ? '...' : teacherSubjects.length}
          </div>
          <div className="text-sm text-gray-600">
            {language === 'fr' ? 'Matières enseignées' : 'Teaching Subjects'}
          </div>
        </ModernCard>
        <ModernCard className="p-4 text-center activity-card-green">
          <GraduationCap className="w-6 h-6 mx-auto mb-2 text-green-600" />
          <div className="text-2xl font-bold text-gray-800">
            {classesLoading ? '...' : teacherClasses.length}
          </div>
          <div className="text-sm text-gray-600">
            {language === 'fr' ? 'Classes assignées' : 'Assigned Classes'}
          </div>
        </ModernCard>
        <ModernCard className="p-4 text-center activity-card-purple">
          <Users className="w-6 h-6 mx-auto mb-2 text-purple-600" />
          <div className="text-2xl font-bold text-gray-800">
            {classesLoading ? '...' : totalStudents}
          </div>
          <div className="text-sm text-gray-600">
            {language === 'fr' ? 'Élèves' : 'Students'}
          </div>
        </ModernCard>
        <ModernCard className="p-4 text-center activity-card-orange">
          <div className="text-2xl font-bold text-gray-800">{profile.experience}</div>
          <div className="text-sm text-gray-600">
            {language === 'fr' ? "Années d'expérience" : 'Years of Experience'}
          </div>
        </ModernCard>
      </div>

      {/* Teaching Subjects & Assigned Classes - Real Data from Database */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Teaching Subjects */}
        <ModernCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold">
                {language === 'fr' ? 'Matières Enseignées' : 'Teaching Subjects'}
              </h3>
            </div>
            {!isEditingSubjects ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditingSubjects(true)}
                data-testid="button-edit-subjects"
              >
                <Edit className="w-4 h-4 mr-2" />
                {language === 'fr' ? 'Modifier' : 'Edit'}
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditingSubjects(false)}
                  data-testid="button-cancel-subjects"
                >
                  <X className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  onClick={handleSaveAssignments}
                  disabled={updateAssignmentsMutation.isPending}
                  data-testid="button-save-subjects"
                >
                  {updateAssignmentsMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                </Button>
              </div>
            )}
          </div>
          
          {isEditingSubjects ? (
            <div className="space-y-3">
              {availableSubjectsLoading ? (
                <div className="text-gray-500 text-center py-4">
                  <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
                  {language === 'fr' ? 'Chargement des matières...' : 'Loading subjects...'}
                </div>
              ) : availableSubjects.length === 0 ? (
                <div className="text-gray-500 text-center py-4">
                  {language === 'fr' 
                    ? 'Aucune matière disponible dans votre école. Le directeur doit d\'abord créer des matières.' 
                    : 'No subjects available in your school. The director must first create subjects.'}
                </div>
              ) : (
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {availableSubjects.map((subject: any) => (
                    <div
                      key={subject.id}
                      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedSubjectIds.includes(subject.id)
                          ? 'bg-blue-50 border border-blue-200'
                          : 'bg-gray-50 hover:bg-gray-100 border border-transparent'
                      }`}
                      onClick={() => toggleSubjectSelection(subject.id)}
                      data-testid={`checkbox-subject-${subject.id}`}
                    >
                      <Checkbox
                        checked={selectedSubjectIds.includes(subject.id)}
                        onCheckedChange={() => toggleSubjectSelection(subject.id)}
                      />
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">
                          {subject.name || subject.nameFr}
                        </p>
                        {subject.code && (
                          <p className="text-xs text-gray-500">{subject.code}</p>
                        )}
                      </div>
                      {subject.coefficient && (
                        <Badge variant="outline" className="text-xs">
                          Coef: {subject.coefficient}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}
              <p className="text-xs text-gray-500 mt-2">
                {language === 'fr' 
                  ? `${selectedSubjectIds.length} matière(s) sélectionnée(s)` 
                  : `${selectedSubjectIds.length} subject(s) selected`}
              </p>
            </div>
          ) : subjectsLoading ? (
            <div className="text-gray-500 text-center py-4">
              {language === 'fr' ? 'Chargement...' : 'Loading...'}
            </div>
          ) : teacherSubjects.length === 0 ? (
            <div className="text-gray-500 text-center py-4">
              {language === 'fr' 
                ? 'Aucune matière assignée. Cliquez sur Modifier pour ajouter des matières.' 
                : 'No subjects assigned. Click Edit to add subjects.'}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {teacherSubjects.map((subject: any, index: number) => (
                <Badge 
                  key={subject.id || index} 
                  variant="secondary"
                  className="bg-blue-100 text-blue-800 px-3 py-1"
                  data-testid={`badge-subject-${subject.id || index}`}
                >
                  {subject.name || subject.nameFr || subject.subjectName}
                  {subject.coefficient && ` (Coef: ${subject.coefficient})`}
                </Badge>
              ))}
            </div>
          )}
        </ModernCard>

        {/* Assigned Classes */}
        <ModernCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-green-600" />
              <h3 className="text-lg font-semibold">
                {language === 'fr' ? 'Classes Assignées' : 'Assigned Classes'}
              </h3>
            </div>
            {!isEditingClasses ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditingClasses(true)}
                data-testid="button-edit-classes"
              >
                <Edit className="w-4 h-4 mr-2" />
                {language === 'fr' ? 'Modifier' : 'Edit'}
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditingClasses(false)}
                  data-testid="button-cancel-classes"
                >
                  <X className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  onClick={handleSaveAssignments}
                  disabled={updateAssignmentsMutation.isPending}
                  data-testid="button-save-classes"
                >
                  {updateAssignmentsMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                </Button>
              </div>
            )}
          </div>
          
          {isEditingClasses ? (
            <div className="space-y-3">
              {availableClassesLoading ? (
                <div className="text-gray-500 text-center py-4">
                  <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
                  {language === 'fr' ? 'Chargement des classes...' : 'Loading classes...'}
                </div>
              ) : availableClasses.length === 0 ? (
                <div className="text-gray-500 text-center py-4">
                  {language === 'fr' 
                    ? 'Aucune classe disponible dans votre école. Le directeur doit d\'abord créer des classes.' 
                    : 'No classes available in your school. The director must first create classes.'}
                </div>
              ) : (
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {availableClasses.map((cls: any) => (
                    <div
                      key={cls.id}
                      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedClassIds.includes(cls.id)
                          ? 'bg-green-50 border border-green-200'
                          : 'bg-gray-50 hover:bg-gray-100 border border-transparent'
                      }`}
                      onClick={() => toggleClassSelection(cls.id)}
                      data-testid={`checkbox-class-${cls.id}`}
                    >
                      <Checkbox
                        checked={selectedClassIds.includes(cls.id)}
                        onCheckedChange={() => toggleClassSelection(cls.id)}
                      />
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">{cls.name}</p>
                        {cls.level && (
                          <p className="text-xs text-gray-500">{cls.level}</p>
                        )}
                      </div>
                      {cls.room && (
                        <Badge variant="outline" className="text-xs">
                          {cls.room}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}
              <p className="text-xs text-gray-500 mt-2">
                {language === 'fr' 
                  ? `${selectedClassIds.length} classe(s) sélectionnée(s)` 
                  : `${selectedClassIds.length} class(es) selected`}
              </p>
            </div>
          ) : classesLoading ? (
            <div className="text-gray-500 text-center py-4">
              {language === 'fr' ? 'Chargement...' : 'Loading...'}
            </div>
          ) : teacherClasses.length === 0 ? (
            <div className="text-gray-500 text-center py-4">
              {language === 'fr' 
                ? 'Aucune classe assignée. Cliquez sur Modifier pour ajouter des classes.' 
                : 'No classes assigned. Click Edit to add classes.'}
            </div>
          ) : (
            <div className="space-y-2">
              {teacherClasses.map((cls: any, index: number) => (
                <div 
                  key={cls.id || index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  data-testid={`card-class-${cls.id || index}`}
                >
                  <div>
                    <p className="font-medium text-gray-800">{cls.name || cls.className}</p>
                    <p className="text-sm text-gray-500">
                      {cls.level && `${cls.level} • `}
                      {cls.subject && `${cls.subject} • `}
                      {cls.studentCount !== undefined && (
                        <span>{cls.studentCount} {language === 'fr' ? 'élèves' : 'students'}</span>
                      )}
                    </p>
                  </div>
                  {cls.room && (
                    <Badge variant="outline" className="text-xs">
                      {cls.room}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          )}
        </ModernCard>
      </div>

      {/* Onglets */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {(Array.isArray(sections) ? sections : []).map(section => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeSection === section.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4" />
                  {section.name || ''}
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Contenu des sections */}
      {renderSectionContent()}
    </div>
  );
};

export default TeacherProfileSettings;