import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  User, Mail, Phone, MapPin, Bell, Shield, 
  Edit3, Save, X, Settings, Heart, Star
} from 'lucide-react';

const ParentProfile = () => {
  const { language } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: 'Marie',
    lastName: 'Kamga',
    email: 'parent.demo@test?.educafric?.com',
    phone: '+237 678 123 456',
    address: 'Bastos, Yaoundé, Cameroun',
    emergencyContact: '+237 691 234 567'
  });

  const text = {
    fr: {
      title: 'Mon Profil Parent',
      personalInfo: 'Informations Personnelles',
      preferences: 'Préférences',
      security: 'Sécurité',
      firstName: 'Prénom',
      lastName: 'Nom',
      email: 'Email',
      phone: 'Téléphone',
      address: 'Adresse',
      emergencyContact: 'Contact d\'urgence',
      edit: 'Modifier',
      save: 'Enregistrer',
      cancel: 'Annuler',
      notifications: 'Notifications',
      smsAlerts: 'Alertes SMS',
      emailReports: 'Rapports Email',
      gradeAlerts: 'Alertes Notes',
      attendanceAlerts: 'Alertes Présence',
      changePassword: 'Changer mot de passe',
      twoFactor: 'Authentification 2FA',
      subscription: 'Abonnement',
      currentPlan: 'Plan Actuel',
      parentPlan: 'Parent École Publique',
      validUntil: 'Valide jusqu\'au',
      children: 'Mes Enfants',
      childrenCount: 'enfants suivis'
    },
    en: {
      title: 'My Parent Profile',
      personalInfo: 'Personal Information',
      preferences: 'Preferences',
      security: 'Security',
      firstName: 'First Name',
      lastName: 'Last Name',
      email: 'Email',
      phone: 'Phone',
      address: 'Address',
      emergencyContact: 'Emergency Contact',
      edit: 'Edit',
      save: 'Save',
      cancel: 'Cancel',
      notifications: 'Notifications',  
      smsAlerts: 'SMS Alerts',
      emailReports: 'Email Reports',
      gradeAlerts: 'Grade Alerts',
      attendanceAlerts: 'Attendance Alerts',
      changePassword: 'Change Password',
      twoFactor: '2FA Authentication',
      subscription: 'Subscription',
      currentPlan: 'Current Plan',
      parentPlan: 'Public School Parent',
      validUntil: 'Valid until',
      children: 'My Children',
      childrenCount: 'children monitored'
    }
  };

  const t = text[language as keyof typeof text];

  const handleSave = () => {
    // Sauvegarder les modifications
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t.title || ''}</h1>
          <p className="text-gray-600">
            Gérez vos informations personnelles et préférences
          </p>
        </div>

        <Tabs defaultValue="personal" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="personal" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              {t.personalInfo}
            </TabsTrigger>
            <TabsTrigger value="preferences" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              {t.preferences}
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              {t.security}
            </TabsTrigger>
          </TabsList>

          {/* Informations Personnelles */}
          <TabsContent value="personal" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  {t.personalInfo}
                </CardTitle>
                <Button
                  variant={isEditing ? "ghost" : "outline"}
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  {isEditing ? (
                    <>
                      <X className="w-4 h-4 mr-2" />
                      {t.cancel}
                    </>
                  ) : (
                    <>
                      <Edit3 className="w-4 h-4 mr-2" />
                      {t.edit}
                    </>
                  )}
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">{t.firstName || ''}</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName || ''}
                      disabled={!isEditing}
                      onChange={(e) => setFormData({...formData, firstName: e?.target?.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">{t.lastName || ''}</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName || ''}
                      disabled={!isEditing}
                      onChange={(e) => setFormData({...formData, lastName: e?.target?.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">{t.email || ''}</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email || ''}
                      disabled={!isEditing}
                      onChange={(e) => setFormData({...formData, email: e?.target?.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">{t.phone}</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      disabled={!isEditing}
                      onChange={(e) => setFormData({...formData, phone: e?.target?.value})}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="address">{t.address}</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      disabled={!isEditing}
                      onChange={(e) => setFormData({...formData, address: e?.target?.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="emergency">{t.emergencyContact}</Label>
                    <Input
                      id="emergency"
                      value={formData.emergencyContact}
                      disabled={!isEditing}
                      onChange={(e) => setFormData({...formData, emergencyContact: e?.target?.value})}
                    />
                  </div>
                </div>
                
                {isEditing && (
                  <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      {t.cancel}
                    </Button>
                    <Button onClick={handleSave}>
                      <Save className="w-4 h-4 mr-2" />
                      {t.save}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Mes Enfants */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="w-5 h-5" />
                  {t.children}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <Badge variant="secondary" className="text-lg px-4 py-2">
                    2 {t.childrenCount}
                  </Badge>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span>Junior Kamga - 3ème A</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span>Marie Kamga - CE2 B</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Préférences */}
          <TabsContent value="preferences" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  {t.notifications}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{t.smsAlerts}</p>
                    <p className="text-sm text-gray-600">Recevoir des SMS pour les urgences</p>
                  </div>
                  <Badge variant="default">Activé</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{t.gradeAlerts}</p>
                    <p className="text-sm text-gray-600">Notifications des nouvelles notes</p>
                  </div>
                  <Badge variant="default">Activé</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{t.attendanceAlerts}</p>
                    <p className="text-sm text-gray-600">Alertes d'absence de votre enfant</p>
                  </div>
                  <Badge variant="default">Activé</Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sécurité */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  {t.security}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{t.changePassword}</p>
                    <p className="text-sm text-gray-600">Dernière modification il y a 30 jours</p>
                  </div>
                  <Button variant="outline">Modifier</Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{t.twoFactor}</p>
                    <p className="text-sm text-gray-600">Sécurité renforcée par SMS</p>
                  </div>
                  <Badge variant="secondary">Non configuré</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Abonnement */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  {t.subscription}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{t.currentPlan}</p>
                    <p className="text-sm text-gray-600">{t.parentPlan} - 1,000 CFA/mois</p>
                    <p className="text-sm text-green-600">{t.validUntil}: 28 Février 2025</p>
                  </div>
                  <Badge variant="default" className="bg-green-500">Actif</Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ParentProfile;