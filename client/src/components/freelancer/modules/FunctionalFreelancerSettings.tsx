// 📱 MOBILE-OPTIMIZED Freelancer Settings Management
import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  User, Mail, Phone, MapPin, Clock, Globe, Bell, Shield, 
  CreditCard, Eye, Save, Camera, Languages, BookOpen, Award
} from 'lucide-react';

const FunctionalFreelancerSettings: React.FC = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('profile');
  
  const t = {
    title: language === 'fr' ? 'Paramètres' : 'Settings',
    profile: language === 'fr' ? 'Profil' : 'Profile',
    account: language === 'fr' ? 'Compte' : 'Account',
    notifications: language === 'fr' ? 'Notifications' : 'Notifications',
    privacy: language === 'fr' ? 'Confidentialité' : 'Privacy',
    billing: language === 'fr' ? 'Facturation' : 'Billing',
    save: language === 'fr' ? 'Enregistrer' : 'Save',
    name: language === 'fr' ? 'Nom complet' : 'Full name',
    email: language === 'fr' ? 'Email' : 'Email',
    phone: language === 'fr' ? 'Téléphone' : 'Phone',
    location: language === 'fr' ? 'Localisation' : 'Location',
    bio: language === 'fr' ? 'Biographie' : 'Biography',
    specialties: language === 'fr' ? 'Spécialités' : 'Specialties',
    experience: language === 'fr' ? 'Expérience' : 'Experience',
    hourlyRate: language === 'fr' ? 'Tarif horaire' : 'Hourly rate',
    availability: language === 'fr' ? 'Disponibilité' : 'Availability',
    timezone: language === 'fr' ? 'Fuseau horaire' : 'Timezone',
    enableEmailNotifications: language === 'fr' ? 'Notifications email' : 'Email notifications',
    enableSMSNotifications: language === 'fr' ? 'Notifications SMS' : 'SMS notifications',
    enablePushNotifications: language === 'fr' ? 'Notifications push' : 'Push notifications',
    profileVisibility: language === 'fr' ? 'Visibilité du profil' : 'Profile visibility',
    public: language === 'fr' ? 'Public' : 'Public',
    private: language === 'fr' ? 'Privé' : 'Private',
    yearsExperience: language === 'fr' ? 'années d\'expérience' : 'years experience'
  };

  const tabs = [
    { id: 'profile', label: t.profile, icon: User },
    { id: 'account', label: t.account, icon: Shield },
    { id: 'notifications', label: t.notifications, icon: Bell },
    { id: 'privacy', label: t.privacy, icon: Eye },
    { id: 'billing', label: t.billing, icon: CreditCard }
  ];

  const [formData, setFormData] = useState({
    name: 'Dr. Marie Ngono',
    email: 'marie.ngono@example.com',
    phone: '+237 677 123 456',
    location: 'Yaoundé, Cameroun',
    bio: language === 'fr' ? 
      'Professeure de mathématiques avec 8 ans d\'expérience dans l\'enseignement supérieur et le tutorat privé.' :
      'Mathematics professor with 8 years of experience in higher education and private tutoring.',
    specialties: ['Mathématiques', 'Physique', 'Statistiques'],
    experience: '8',
    hourlyRate: '15000',
    timezone: 'Africa/Douala',
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    profileVisibility: 'public'
  });

  const handleSave = () => {
    toast({
      title: language === 'fr' ? 'Paramètres sauvegardés' : 'Settings saved',
      description: language === 'fr' ? 'Vos paramètres ont été mis à jour avec succès.' : 'Your settings have been updated successfully.',
    });
  };

  const renderProfileTab = () => (
    <div className="space-y-4 sm:space-y-6">
      {/* Avatar section - Mobile optimized */}
      <div className="text-center space-y-3">
        <div className="relative inline-block">
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl sm:text-2xl font-bold">
            MN
          </div>
          <Button size="sm" className="absolute -bottom-1 -right-1 rounded-full w-8 h-8 p-0">
            <Camera className="w-4 h-4" />
          </Button>
        </div>
        <div>
          <h3 className="font-semibold text-lg">{formData.name}</h3>
          <Badge className="bg-green-100 text-green-800">
            {language === 'fr' ? 'Enseignant Vérifié' : 'Verified Teacher'}
          </Badge>
        </div>
      </div>

      {/* Form fields - Mobile optimized */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">{t.name}</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">{t.email}</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">{t.phone}</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">{t.location}</Label>
          <Input
            id="location"
            value={formData.location}
            onChange={(e) => setFormData({...formData, location: e.target.value})}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="experience">{t.experience}</Label>
          <Input
            id="experience"
            value={formData.experience}
            onChange={(e) => setFormData({...formData, experience: e.target.value})}
            placeholder={t.yearsExperience}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="hourlyRate">{t.hourlyRate} (XAF)</Label>
          <Input
            id="hourlyRate"
            value={formData.hourlyRate}
            onChange={(e) => setFormData({...formData, hourlyRate: e.target.value})}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">{t.bio}</Label>
        <Textarea
          id="bio"
          value={formData.bio}
          onChange={(e) => setFormData({...formData, bio: e.target.value})}
          rows={3}
          className="resize-none"
        />
      </div>

      <div className="space-y-2">
        <Label>{t.specialties}</Label>
        <div className="flex flex-wrap gap-2">
          {formData.specialties.map((specialty, index) => (
            <Badge key={index} variant="secondary">
              {specialty}
            </Badge>
          ))}
          <Button variant="outline" size="sm">
            <BookOpen className="w-4 h-4 mr-1" />
            {language === 'fr' ? 'Ajouter' : 'Add'}
          </Button>
        </div>
      </div>
    </div>
  );

  const renderNotificationsTab = () => (
    <div className="space-y-4 sm:space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-base font-medium">{t.enableEmailNotifications}</Label>
            <p className="text-sm text-gray-600">
              {language === 'fr' ? 'Recevoir des notifications par email' : 'Receive notifications via email'}
            </p>
          </div>
          <Switch
            checked={formData.emailNotifications}
            onCheckedChange={(checked) => setFormData({...formData, emailNotifications: checked})}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label className="text-base font-medium">{t.enableSMSNotifications}</Label>
            <p className="text-sm text-gray-600">
              {language === 'fr' ? 'Recevoir des notifications par SMS' : 'Receive notifications via SMS'}
            </p>
          </div>
          <Switch
            checked={formData.smsNotifications}
            onCheckedChange={(checked) => setFormData({...formData, smsNotifications: checked})}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label className="text-base font-medium">{t.enablePushNotifications}</Label>
            <p className="text-sm text-gray-600">
              {language === 'fr' ? 'Recevoir des notifications push' : 'Receive push notifications'}
            </p>
          </div>
          <Switch
            checked={formData.pushNotifications}
            onCheckedChange={(checked) => setFormData({...formData, pushNotifications: checked})}
          />
        </div>
      </div>
    </div>
  );

  const renderCurrentTab = () => {
    switch (activeTab) {
      case 'profile':
        return renderProfileTab();
      case 'notifications':
        return renderNotificationsTab();
      case 'account':
        return (
          <div className="text-center py-8">
            <Shield className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">{language === 'fr' ? 'Paramètres de compte à venir' : 'Account settings coming soon'}</p>
          </div>
        );
      case 'privacy':
        return (
          <div className="text-center py-8">
            <Eye className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">{language === 'fr' ? 'Paramètres de confidentialité à venir' : 'Privacy settings coming soon'}</p>
          </div>
        );
      case 'billing':
        return (
          <div className="text-center py-8">
            <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">{language === 'fr' ? 'Paramètres de facturation à venir' : 'Billing settings coming soon'}</p>
          </div>
        );
      default:
        return renderProfileTab();
    }
  };

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
      {/* Mobile-optimized header */}
      <div>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          {t.title}
        </h1>
        <p className="text-sm sm:text-base text-gray-600">
          {language === 'fr' ? 'Gérez vos préférences et paramètres de compte' : 'Manage your preferences and account settings'}
        </p>
      </div>

      {/* Mobile-optimized tab navigation */}
      <div className="flex overflow-x-auto space-x-2 pb-2">
        {tabs.map((tab) => {
          const IconComponent = tab.icon;
          return (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab(tab.id)}
              className="whitespace-nowrap min-w-fit"
            >
              <IconComponent className="w-4 h-4 mr-2" />
              {tab.label}
            </Button>
          );
        })}
      </div>

      {/* Tab content */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          {renderCurrentTab()}
        </CardContent>
      </Card>

      {/* Save button - Mobile optimized */}
      <div className="flex justify-end">
        <Button onClick={handleSave} className="w-full sm:w-auto">
          <Save className="w-4 h-4 mr-2" />
          {t.save}
        </Button>
      </div>
    </div>
  );
};

export default FunctionalFreelancerSettings;