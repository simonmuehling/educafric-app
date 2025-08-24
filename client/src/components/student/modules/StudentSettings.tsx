import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Settings, User, Bell, Shield } from 'lucide-react';

const StudentSettings = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('profile');

  const text = {
    fr: {
      title: 'Paramètres Élève',
      subtitle: 'Gérez vos paramètres de compte',
      profile: 'Profil',
      notifications: 'Notifications',
      privacy: 'Confidentialité',
      firstName: 'Prénom',
      lastName: 'Nom',
      email: 'Email',
      className: 'Classe',
      studentId: 'ID Élève',
      save: 'Sauvegarder',
      gradeNotifications: 'Notifications Notes',
      assignmentNotifications: 'Notifications Devoirs',
      attendanceNotifications: 'Notifications Présence'
    },
    en: {
      title: 'Student Settings',
      subtitle: 'Manage your account settings',
      profile: 'Profile',
      notifications: 'Notifications',
      privacy: 'Privacy',
      firstName: 'First Name',
      lastName: 'Last Name',
      email: 'Email',
      className: 'Class',
      studentId: 'Student ID',
      save: 'Save',
      gradeNotifications: 'Grade Notifications',
      assignmentNotifications: 'Assignment Notifications',
      attendanceNotifications: 'Attendance Notifications'
    }
  };

  const t = text[language as keyof typeof text];

  // Fetch student settings
  const { data: settings, isLoading } = useQuery({
    queryKey: ['/api/student/settings'],
    queryFn: async () => {
      const response = await fetch('/api/student/settings', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch settings');
      return response.json();
    }
  });

  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (updatedSettings: any) => {
      const response = await fetch('/api/student/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedSettings),
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to update settings');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/student/settings'] });
      toast({
        title: 'Paramètres mis à jour',
        description: 'Vos paramètres ont été sauvegardés avec succès.'
      });
    },
    onError: () => {
      toast({
        title: 'Erreur',
        description: 'Impossible de sauvegarder les paramètres.',
        variant: 'destructive'
      });
    }
  });

  if (isLoading) {
    return <div className="p-6 text-center">Chargement des paramètres...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Settings className="w-6 h-6 text-blue-600" />
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{t.title}</h2>
          <p className="text-gray-600">{t.subtitle}</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            {t.profile}
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            {t.notifications}
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            {t.privacy}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>{t.profile}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">{t.firstName}</Label>
                  <Input 
                    id="firstName" 
                    defaultValue={settings?.settings?.profile?.firstName} 
                    placeholder="Prénom"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">{t.lastName}</Label>
                  <Input 
                    id="lastName" 
                    defaultValue={settings?.settings?.profile?.lastName}
                    placeholder="Nom" 
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="email">{t.email}</Label>
                <Input 
                  id="email" 
                  type="email" 
                  defaultValue={settings?.settings?.profile?.email}
                  placeholder="eleve@exemple.com" 
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="className">{t.className}</Label>
                  <Input 
                    id="className" 
                    defaultValue={settings?.settings?.profile?.className}
                    placeholder="6ème A" 
                    readOnly
                  />
                </div>
                <div>
                  <Label htmlFor="studentId">{t.studentId}</Label>
                  <Input 
                    id="studentId" 
                    defaultValue={settings?.settings?.profile?.studentId}
                    placeholder="SJ2024001" 
                    readOnly
                  />
                </div>
              </div>
              <Button 
                onClick={() => updateSettingsMutation.mutate({})}
                disabled={updateSettingsMutation.isPending}
              >
                {updateSettingsMutation.isPending ? 'Sauvegarde...' : t.save}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>{t.notifications}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="gradeNotif">{t.gradeNotifications}</Label>
                <Switch 
                  id="gradeNotif" 
                  defaultChecked={settings?.settings?.preferences?.notifications?.grades}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="assignmentNotif">{t.assignmentNotifications}</Label>
                <Switch 
                  id="assignmentNotif" 
                  defaultChecked={settings?.settings?.preferences?.notifications?.assignments}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="attendanceNotif">{t.attendanceNotifications}</Label>
                <Switch 
                  id="attendanceNotif" 
                  defaultChecked={settings?.settings?.preferences?.notifications?.attendance}
                />
              </div>
              <Button 
                onClick={() => updateSettingsMutation.mutate({})}
                disabled={updateSettingsMutation.isPending}
              >
                {updateSettingsMutation.isPending ? 'Sauvegarde...' : t.save}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy">
          <Card>
            <CardHeader>
              <CardTitle>{t.privacy}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Paramètres de confidentialité disponibles bientôt.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StudentSettings;