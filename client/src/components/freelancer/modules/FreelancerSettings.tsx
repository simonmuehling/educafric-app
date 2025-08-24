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
import { Settings, User, Bell, DollarSign } from 'lucide-react';

const FreelancerSettings = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('profile');

  const text = {
    fr: {
      title: 'Paramètres Freelancer',
      subtitle: 'Gérez vos paramètres de compte freelancer',
      profile: 'Profil',
      business: 'Business',
      notifications: 'Notifications',
      firstName: 'Prénom',
      lastName: 'Nom',
      email: 'Email',
      phone: 'Téléphone',
      specializations: 'Spécialisations',
      hourlyRate: 'Tarif Horaire (CFA)',
      availability: 'Disponibilité',
      maxStudents: 'Max Élèves',
      save: 'Sauvegarder',
      newBookingNotifications: 'Nouvelles Réservations',
      paymentNotifications: 'Notifications Paiement',
      reminderNotifications: 'Rappels'
    },
    en: {
      title: 'Freelancer Settings',
      subtitle: 'Manage your freelancer account settings',
      profile: 'Profile',
      business: 'Business',
      notifications: 'Notifications',
      firstName: 'First Name',
      lastName: 'Last Name',
      email: 'Email',
      phone: 'Phone',
      specializations: 'Specializations',
      hourlyRate: 'Hourly Rate (CFA)',
      availability: 'Availability',
      maxStudents: 'Max Students',
      save: 'Save',
      newBookingNotifications: 'New Bookings',
      paymentNotifications: 'Payment Notifications',
      reminderNotifications: 'Reminders'
    }
  };

  const t = text[language as keyof typeof text];

  // Fetch freelancer settings
  const { data: settings, isLoading } = useQuery({
    queryKey: ['/api/freelancer/settings'],
    queryFn: async () => {
      const response = await fetch('/api/freelancer/settings', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch settings');
      return response.json();
    }
  });

  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (updatedSettings: any) => {
      const response = await fetch('/api/freelancer/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedSettings),
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to update settings');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/freelancer/settings'] });
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
          <TabsTrigger value="business" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            {t.business}
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            {t.notifications}
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
                  placeholder="freelancer@exemple.com" 
                />
              </div>
              <div>
                <Label htmlFor="phone">{t.phone}</Label>
                <Input 
                  id="phone" 
                  defaultValue={settings?.settings?.profile?.phone}
                  placeholder="+237657005678" 
                />
              </div>
              <div>
                <Label htmlFor="specializations">{t.specializations}</Label>
                <Input 
                  id="specializations" 
                  defaultValue={settings?.settings?.profile?.specializations?.join(', ')}
                  placeholder="Mathématiques, Sciences" 
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

        <TabsContent value="business">
          <Card>
            <CardHeader>
              <CardTitle>{t.business}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="hourlyRate">{t.hourlyRate}</Label>
                  <Input 
                    id="hourlyRate" 
                    type="number"
                    defaultValue={settings?.settings?.business?.hourlyRate}
                    placeholder="15000" 
                  />
                </div>
                <div>
                  <Label htmlFor="maxStudents">{t.maxStudents}</Label>
                  <Input 
                    id="maxStudents" 
                    type="number"
                    defaultValue={settings?.settings?.business?.maxStudents}
                    placeholder="10" 
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="availability">{t.availability}</Label>
                <Input 
                  id="availability" 
                  defaultValue={settings?.settings?.business?.availability}
                  placeholder="weekends" 
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

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>{t.notifications}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="bookingNotif">{t.newBookingNotifications}</Label>
                <Switch 
                  id="bookingNotif" 
                  defaultChecked={settings?.settings?.preferences?.notifications?.newBookings}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="paymentNotif">{t.paymentNotifications}</Label>
                <Switch 
                  id="paymentNotif" 
                  defaultChecked={settings?.settings?.preferences?.notifications?.payments}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="reminderNotif">{t.reminderNotifications}</Label>
                <Switch 
                  id="reminderNotif" 
                  defaultChecked={settings?.settings?.preferences?.notifications?.reminders}
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
      </Tabs>
    </div>
  );
};

export default FreelancerSettings;