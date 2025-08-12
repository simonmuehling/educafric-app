import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { EMAIL_CATEGORIES, EMAIL_FREQUENCY_OPTIONS, type EmailPreferences, type UpdateEmailPreferences } from '@shared/emailPreferencesSchema';
import { 
  Mail, 
  Shield, 
  GraduationCap, 
  MapPin, 
  MessageSquare, 
  CreditCard, 
  Settings, 
  User, 
  Gift,
  Clock,
  Globe,
  Save,
  Volume2,
  VolumeX
} from 'lucide-react';

interface EmailPreferencesProps {
  language: 'fr' | 'en';
}

const CATEGORY_ICONS = {
  ESSENTIAL: Shield,
  ACADEMIC: GraduationCap,
  SAFETY: MapPin,
  COMMUNICATION: MessageSquare,
  FINANCIAL: CreditCard,
  PLATFORM: Settings,
  ACCOUNT: User,
  WELCOME: Gift,
  MARKETING: Mail
};

export default function EmailPreferences({ language }: EmailPreferencesProps) {
  const { toast } = useToast();
  const [preferences, setPreferences] = useState<Partial<EmailPreferences>>({});
  const [hasChanges, setHasChanges] = useState(false);

  const { data: emailPrefs, isLoading } = useQuery({
    queryKey: ['/api/email-preferences'],
    retry: false,
  });

  const updatePreferencesMutation = useMutation({
    mutationFn: async (updates: UpdateEmailPreferences) => {
      return apiRequest('/api/email-preferences', 'PATCH', updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/email-preferences'] });
      setHasChanges(false);
      toast({
        title: language === 'fr' ? 'Préférences sauvegardées' : 'Preferences saved',
        description: language === 'fr' ? 'Vos préférences email ont été mises à jour.' : 'Your email preferences have been updated.',
      });
    },
    onError: (error) => {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' ? 'Impossible de sauvegarder les préférences.' : 'Failed to save preferences.',
        variant: 'destructive',
      });
    },
  });

  useEffect(() => {
    if (emailPrefs) {
      setPreferences(emailPrefs);
    }
  }, [emailPrefs]);

  const updatePreference = (field: keyof EmailPreferences, value: any) => {
    setPreferences(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    updatePreferencesMutation.mutate(preferences);
  };

  const toggleCategory = (categoryFields: readonly string[], enabled: boolean) => {
    const updates: Partial<EmailPreferences> = {};
    categoryFields.forEach(field => {
      updates[field as keyof EmailPreferences] = enabled;
    });
    setPreferences(prev => ({ ...prev, ...updates }));
    setHasChanges(true);
  };

  const getTexts = (key: string) => {
    const texts = {
      title: { fr: 'Préférences Email', en: 'Email Preferences' },
      description: { fr: 'Gérez les emails que vous souhaitez recevoir d\'EDUCAFRIC', en: 'Manage which emails you want to receive from EDUCAFRIC' },
      masterToggle: { fr: 'Recevoir tous les emails', en: 'Receive all emails' },
      masterToggleDesc: { fr: 'Désactiver complètement les emails (sauf sécurité)', en: 'Completely disable emails (except security)' },
      frequency: { fr: 'Fréquence des emails', en: 'Email frequency' },
      language: { fr: 'Langue des emails', en: 'Email language' },
      format: { fr: 'Format des emails', en: 'Email format' },
      htmlFormat: { fr: 'Emails HTML (avec images)', en: 'HTML emails (with images)' },
      textFormat: { fr: 'Emails texte simple', en: 'Plain text emails' },
      digestTime: { fr: 'Heure des résumés', en: 'Digest time' },
      enableAll: { fr: 'Tout activer', en: 'Enable all' },
      disableAll: { fr: 'Tout désactiver', en: 'Disable all' },
      save: { fr: 'Sauvegarder', en: 'Save' },
      saving: { fr: 'Sauvegarde...', en: 'Saving...' },
      unsavedChanges: { fr: 'Modifications non sauvegardées', en: 'Unsaved changes' },
      essential: { fr: 'Essentiel', en: 'Essential' },
      cannotDisable: { fr: 'Ne peut pas être désactivé', en: 'Cannot be disabled' }
    };
    return texts[key as keyof typeof texts]?.[language] || texts[key as keyof typeof texts]?.en || key;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            {getTexts('title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            {getTexts('title')}
          </CardTitle>
          <CardDescription>
            {getTexts('description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Master Toggle */}
          <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                {preferences.allEmailsEnabled ? (
                  <Volume2 className="h-4 w-4 text-green-600" />
                ) : (
                  <VolumeX className="h-4 w-4 text-red-600" />
                )}
                <span className="font-medium">{getTexts('masterToggle')}</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {getTexts('masterToggleDesc')}
              </p>
            </div>
            <Switch
              checked={preferences.allEmailsEnabled || false}
              onCheckedChange={(checked) => updatePreference('allEmailsEnabled', checked)}
              data-testid="switch-all-emails"
            />
          </div>

          {/* Global Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4" />
                {getTexts('frequency')}
              </label>
              <Select
                value={preferences.emailFrequency || 'immediate'}
                onValueChange={(value) => updatePreference('emailFrequency', value)}
                data-testid="select-email-frequency"
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EMAIL_FREQUENCY_OPTIONS.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label[language]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Globe className="h-4 w-4" />
                {getTexts('language')}
              </label>
              <Select
                value={preferences.emailLanguage || 'fr'}
                onValueChange={(value) => updatePreference('emailLanguage', value)}
                data-testid="select-email-language"
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fr">Français</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          {/* Email Categories */}
          <div className="space-y-6">
            {Object.entries(EMAIL_CATEGORIES).map(([categoryKey, category]) => {
              const IconComponent = CATEGORY_ICONS[categoryKey as keyof typeof CATEGORY_ICONS];
              const isEssential = categoryKey === 'ESSENTIAL';
              const categoryFields = [...category.fields];
              const allEnabled = categoryFields.every(field => preferences[field as keyof EmailPreferences] === true);
              const someEnabled = categoryFields.some(field => preferences[field as keyof EmailPreferences] === true);

              return (
                <Card key={categoryKey} className="border-l-4 border-l-blue-500">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <IconComponent className="h-5 w-5 text-blue-600" />
                        <div>
                          <CardTitle className="text-lg">{category.name[language]}</CardTitle>
                          <CardDescription className="text-sm">
                            {category.description[language]}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {isEssential && (
                          <Badge variant="destructive" className="text-xs">
                            <Shield className="h-3 w-3 mr-1" />
                            {getTexts('essential')}
                          </Badge>
                        )}
                        {!isEssential && (
                          <div className="flex gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleCategory(categoryFields, true)}
                              disabled={allEnabled}
                              data-testid={`button-enable-${categoryKey.toLowerCase()}`}
                            >
                              {getTexts('enableAll')}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleCategory(categoryFields, false)}
                              disabled={!someEnabled}
                              data-testid={`button-disable-${categoryKey.toLowerCase()}`}
                            >
                              {getTexts('disableAll')}
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {categoryFields.map(field => {
                        const fieldKey = field.replace(/([A-Z])/g, '_$1').toLowerCase();
                        const fieldName: Record<string, { fr: string; en: string }> = {
                          welcome_emails: { fr: 'Emails de bienvenue', en: 'Welcome emails' },
                          onboarding_tips: { fr: 'Conseils d\'utilisation', en: 'Usage tips' },
                          weekly_progress_reports: { fr: 'Rapports hebdomadaires', en: 'Weekly reports' },
                          assignment_notifications: { fr: 'Notifications de devoirs', en: 'Assignment notifications' },
                          grade_notifications: { fr: 'Notifications de notes', en: 'Grade notifications' },
                          attendance_alerts: { fr: 'Alertes d\'absence', en: 'Attendance alerts' },
                          exam_schedules: { fr: 'Calendriers d\'examens', en: 'Exam schedules' },
                          geolocation_alerts: { fr: 'Alertes géolocalisation', en: 'Geolocation alerts' },
                          emergency_notifications: { fr: 'Notifications d\'urgence', en: 'Emergency notifications' },
                          security_updates: { fr: 'Mises à jour sécurité', en: 'Security updates' },
                          parent_teacher_messages: { fr: 'Messages parents-professeurs', en: 'Parent-teacher messages' },
                          school_announcements: { fr: 'Annonces de l\'école', en: 'School announcements' },
                          event_invitations: { fr: 'Invitations aux événements', en: 'Event invitations' },
                          newsletters: { fr: 'Newsletters', en: 'Newsletters' },
                          payment_confirmations: { fr: 'Confirmations de paiement', en: 'Payment confirmations' },
                          subscription_reminders: { fr: 'Rappels d\'abonnement', en: 'Subscription reminders' },
                          invoice_delivery: { fr: 'Livraison de factures', en: 'Invoice delivery' },
                          payment_failures: { fr: 'Échecs de paiement', en: 'Payment failures' },
                          system_maintenance: { fr: 'Maintenance système', en: 'System maintenance' },
                          feature_updates: { fr: 'Nouvelles fonctionnalités', en: 'Feature updates' },
                          platform_news: { fr: 'Actualités plateforme', en: 'Platform news' },
                          password_reset_emails: { fr: 'Réinitialisation mot de passe', en: 'Password reset emails' },
                          login_attempts: { fr: 'Tentatives de connexion', en: 'Login attempts' },
                          profile_changes: { fr: 'Modifications du profil', en: 'Profile changes' },
                          account_deletion_emails: { fr: 'Suppression de compte', en: 'Account deletion emails' },
                          promotional_emails: { fr: 'Emails promotionnels', en: 'Promotional emails' },
                          partner_offers: { fr: 'Offres partenaires', en: 'Partner offers' },
                          survey_requests: { fr: 'Demandes d\'enquête', en: 'Survey requests' }
                        }[fieldKey as keyof typeof fieldName] || { fr: field, en: field };

                        const isFieldEssential = ['passwordResetEmails', 'accountDeletionEmails', 'emergencyNotifications'].includes(field);

                        return (
                          <div key={field} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-sm">{fieldName[language]}</span>
                              {isFieldEssential && (
                                <Badge variant="outline" className="text-xs">
                                  {getTexts('cannotDisable')}
                                </Badge>
                              )}
                            </div>
                            <Switch
                              checked={Boolean(preferences[field as keyof EmailPreferences])}
                              onCheckedChange={(checked) => updatePreference(field as keyof EmailPreferences, checked)}
                              disabled={isFieldEssential}
                              data-testid={`switch-${fieldKey}`}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Separator />

          {/* Save Button */}
          <div className="flex items-center justify-between">
            {hasChanges && (
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                <Clock className="h-4 w-4" />
                <span className="text-sm">{getTexts('unsavedChanges')}</span>
              </div>
            )}
            <div className="ml-auto">
              <Button
                onClick={handleSave}
                disabled={!hasChanges || updatePreferencesMutation.isPending}
                className="flex items-center gap-2"
                data-testid="button-save-preferences"
              >
                <Save className="h-4 w-4" />
                {updatePreferencesMutation.isPending ? getTexts('saving') : getTexts('save')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}