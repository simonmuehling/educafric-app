import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuthContext } from '@/contexts/AuthContext';
import { 
  User, Mail, Phone, MapPin, Calendar, 
  Save, Edit, Eye, EyeOff, Lock, Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ModernCard } from '@/components/ui/ModernCard';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

const TeacherProfileSettings = () => {
  const { language } = useLanguage();
  const { user } = useAuthContext();
  const { toast } = useToast();
  const [activeSection, setActiveSection] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  
  const [profile, setProfile] = useState({
    firstName: user?.username?.split(' ')[0] || '',
    lastName: user?.username?.split(' ')[1] || '',
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
      specialization: 'Specialization',
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

      {/* Statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <ModernCard className="p-4 text-center activity-card-blue">
          <div className="text-2xl font-bold text-gray-800">{profile.experience}</div>
          <div className="text-sm text-gray-600">Années d'expérience</div>
        </ModernCard>
        <ModernCard className="p-4 text-center activity-card-green">
          <div className="text-2xl font-bold text-gray-800">4</div>
          <div className="text-sm text-gray-600">Classes enseignées</div>
        </ModernCard>
        <ModernCard className="p-4 text-center activity-card-purple">
          <div className="text-2xl font-bold text-gray-800">127</div>
          <div className="text-sm text-gray-600">Élèves</div>
        </ModernCard>
        <ModernCard className="p-4 text-center activity-card-orange">
          <div className="text-2xl font-bold text-gray-800">95%</div>
          <div className="text-sm text-gray-600">Taux de satisfaction</div>
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