import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, Globe, Save, Eye, EyeOff, Shield, Bell } from 'lucide-react';
import { BilingualTwoFactorSetup } from './BilingualTwoFactorSetup';
import { ModernCard } from '@/components/ui/ModernCard';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';

const ProfileSettings = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    whatsappNumber: '',
    preferredLanguage: 'fr',
    notifications: {
      email: true,
      sms: true,
      push: true
    },
    security: {
      twoFactor: false
    }
  });
  
  const [show2FASetup, setShow2FASetup] = useState(false);

  const text = {
    fr: {
      title: 'Paramètres du Profil',
      subtitle: 'Gérez vos informations personnelles et préférences',
      personalInfo: 'Informations Personnelles',
      firstName: 'Prénom',
      lastName: 'Nom',
      email: 'Email',
      phone: 'Téléphone',
      whatsapp: 'WhatsApp',
      language: 'Langue Préférée',
      notifications: 'Notifications',
      emailNotifications: 'Notifications Email',
      smsNotifications: 'Notifications SMS',
      pushNotifications: 'Notifications Push',
      security: 'Sécurité',
      twoFactor: 'Authentification à deux facteurs',
      changePassword: 'Changer le mot de passe',
      currentPassword: 'Mot de passe actuel',
      newPassword: 'Nouveau mot de passe',
      confirmPassword: 'Confirmer le mot de passe',
      save: 'Sauvegarder',
      edit: 'Modifier',
      cancel: 'Annuler',
      updated: 'Profil mis à jour avec succès',
      role: 'Rôle',
      accountType: 'Type de Compte'
    },
    en: {
      title: 'Profile Settings',
      subtitle: 'Manage your personal information and preferences',
      personalInfo: 'Personal Information',
      firstName: 'First Name',
      lastName: 'Last Name',
      email: 'Email',
      phone: 'Phone',
      whatsapp: 'WhatsApp',
      language: 'Preferred Language',
      notifications: 'Notifications',
      emailNotifications: 'Email Notifications',
      smsNotifications: 'SMS Notifications',
      pushNotifications: 'Push Notifications',
      security: 'Security',
      twoFactor: 'Two-factor Authentication',
      changePassword: 'Change Password',
      currentPassword: 'Current Password',
      newPassword: 'New Password',
      confirmPassword: 'Confirm Password',
      save: 'Save',
      edit: 'Edit',
      cancel: 'Cancel',
      updated: 'Profile updated successfully',
      role: 'Role',
      accountType: 'Account Type'
    }
  };

  const t = text[language];

  const handleSave = () => {
    // API call to update profile
    console.log('Updating profile:', formData);
    setIsEditing(false);
    // Show success message
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedInputChange = (section: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...(prev[section as keyof typeof prev] as object),
        [field]: value
      }
    }));
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t.title || ''}</h1>
        <p className="text-gray-600 mt-1">{t.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <User className="w-5 h-5" />
              {t.personalInfo}
            </h3>
          </CardHeader>
          <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="role">{t.role}</Label>
              <Input
                id="role"
                value={user?.role || ''}
                disabled
                className="bg-gray-50"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">{t.firstName || ''}</Label>
                <Input
                  id="firstName"
                  value={formData.firstName || ''}
                  onChange={(e) => handleInputChange('firstName', e?.target?.value)}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <Label htmlFor="lastName">{t.lastName || ''}</Label>
                <Input
                  id="lastName"
                  value={formData.lastName || ''}
                  onChange={(e) => handleInputChange('lastName', e?.target?.value)}
                  disabled={!isEditing}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email">{t.email || ''}</Label>
              <Input
                id="email"
                type="email"
                value={formData.email || ''}
                onChange={(e) => handleInputChange('email', e?.target?.value)}
                disabled={!isEditing}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">{t.phone}</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e?.target?.value)}
                  disabled={!isEditing}
                  placeholder="+237 6XX XXX XXX"
                />
              </div>
              <div>
                <Label htmlFor="whatsapp">{t.whatsapp}</Label>
                <Input
                  id="whatsapp"
                  value={formData.whatsappNumber}
                  onChange={(e) => handleInputChange('whatsappNumber', e?.target?.value)}
                  disabled={!isEditing}
                  placeholder="+237 6XX XXX XXX"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              {!isEditing ? (
                <Button onClick={() => setIsEditing(true)} variant="outline">
                  {t.edit}
                </Button>
              ) : (
                <>
                  <Button onClick={() => setIsEditing(false)} variant="outline">
                    {t.cancel}
                  </Button>
                  <Button onClick={handleSave}>
                    <Save className="w-4 h-4 mr-2" />
                    {t.save}
                  </Button>
                </>
              )}
            </div>
          </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Shield className="w-5 h-5" />
              {t.security}
            </h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">{t.twoFactor}</h4>
                  <p className="text-sm text-gray-600">
                    {language === 'fr' ? 'Protégez votre compte avec l\'authentification à deux facteurs' : 'Protect your account with two-factor authentication'}
                  </p>
                </div>
                <Button 
                  onClick={() => setShow2FASetup(true)}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {language === 'fr' ? 'Activer 2FA' : 'Enable 2FA'}
                </Button>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">{t.changePassword}</h4>
                <div className="space-y-3">
                  <Input 
                    type="password" 
                    placeholder={t.currentPassword}
                  />
                  <Input 
                    type="password" 
                    placeholder={t.newPassword}
                  />
                  <Input 
                    type="password" 
                    placeholder={t.confirmPassword}
                  />
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    {t.changePassword}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Bell className="w-5 h-5" />
              {t.notifications}
            </h3>
          </CardHeader>
          <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="emailNotif">{t.emailNotifications}</Label>
              <input
                type="checkbox"
                id="emailNotif"
                checked={formData?.notifications?.email}
                onChange={(e) => handleNestedInputChange('notifications', 'email', e?.target?.checked)}
                className="rounded border-gray-300"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="smsNotif">{t.smsNotifications}</Label>
              <input
                type="checkbox"
                id="smsNotif"
                checked={formData?.notifications?.sms}
                onChange={(e) => handleNestedInputChange('notifications', 'sms', e?.target?.checked)}
                className="rounded border-gray-300"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="pushNotif">{t.pushNotifications}</Label>
              <input
                type="checkbox"
                id="pushNotif"
                checked={formData?.notifications?.push}
                onChange={(e) => handleNestedInputChange('notifications', 'push', e?.target?.checked)}
                className="rounded border-gray-300"
              />
            </div>

            <div>
              <Label htmlFor="language">{t.language}</Label>
              <select
                id="language"
                value={formData.preferredLanguage}
                onChange={(e) => handleInputChange('preferredLanguage', e?.target?.value)}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="fr">Français</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Shield className="w-5 h-5" />
              {t.security}
            </h3>
          </CardHeader>
          <CardContent>
          <div className="space-y-4">
            <div className="space-y-4">
              <BilingualTwoFactorSetup 
                isEnabled={formData?.security?.twoFactor}
                onToggle={(enabled) => handleNestedInputChange('security', 'twoFactor', enabled)}
              />
            </div>
            
            <div className="pt-4 border-t">
              <h4 className="font-medium mb-3">{t.changePassword}</h4>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="currentPassword">{t.currentPassword}</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="newPassword">{t.newPassword}</Label>
                  <Input
                    id="newPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                  />
                </div>
                
                <div>
                  <Label htmlFor="confirmPassword">{t.confirmPassword}</Label>
                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                  />
                </div>
                
                <Button className="w-full" variant="outline">
                  {t.changePassword}
                </Button>
              </div>
            </div>
          </div>
          </CardContent>
        </Card>
      </div>
      
      {/* 2FA Setup Modal */}
      {show2FASetup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {language === 'fr' ? 'Configuration 2FA' : '2FA Setup'}
              </h3>
              <Button 
                variant="ghost" 
                onClick={() => setShow2FASetup(false)}
                className="p-2"
              >
                ×
              </Button>
            </div>
            <TwoFactorSetup onComplete={() => setShow2FASetup(false)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileSettings;