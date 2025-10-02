import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import { Calendar, Download, Link2, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface CalendarExportProps {
  userType: 'school' | 'teacher';
  userId?: number;
  schoolId?: number;
}

export default function CalendarExport({ userType, userId, schoolId }: CalendarExportProps) {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const [academicYear, setAcademicYear] = useState('2024-2025');
  const [term, setTerm] = useState('Term 1');
  const [subscriptionUrl, setSubscriptionUrl] = useState<string>('');
  const [showInstructions, setShowInstructions] = useState(false);

  const text = {
    fr: {
      title: userType === 'school' ? 'Calendrier Scolaire' : 'Mon Calendrier',
      description: userType === 'school' 
        ? 'Exportez ou abonnez-vous au calendrier complet de votre établissement'
        : 'Exportez ou abonnez-vous à votre calendrier de cours',
      academicYear: 'Année Académique',
      term: 'Trimestre',
      export: 'Télécharger (.ics)',
      subscribe: 'URL d\'Abonnement',
      subscriptionTitle: 'URL d\'Abonnement Calendrier',
      subscriptionDescription: 'Utilisez cette URL pour vous abonner au calendrier dans votre application favorite',
      copyUrl: 'Copier l\'URL',
      googleCalendar: 'Google Calendar',
      googleInstructions: '1. Ouvrez Google Calendar\n2. Cliquez sur "+" à côté de "Autres agendas"\n3. Sélectionnez "À partir de l\'URL"\n4. Collez l\'URL et validez',
      outlookCalendar: 'Outlook Calendar',
      outlookInstructions: '1. Ouvrez Outlook Calendar\n2. Cliquez sur "Ajouter un calendrier"\n3. Sélectionnez "S\'abonner depuis le web"\n4. Collez l\'URL et validez',
      appleCalendar: 'Apple Calendar',
      appleInstructions: '1. Ouvrez Apple Calendar\n2. Fichier → Nouvel abonnement au calendrier\n3. Collez l\'URL et validez',
      copied: 'URL copiée !',
      exportSuccess: 'Calendrier téléchargé avec succès',
      exportError: 'Erreur lors du téléchargement du calendrier',
      subscriptionError: 'Erreur lors de la récupération de l\'URL d\'abonnement'
    },
    en: {
      title: userType === 'school' ? 'School Calendar' : 'My Calendar',
      description: userType === 'school'
        ? 'Export or subscribe to your school\'s complete calendar'
        : 'Export or subscribe to your teaching schedule calendar',
      academicYear: 'Academic Year',
      term: 'Term',
      export: 'Download (.ics)',
      subscribe: 'Subscription URL',
      subscriptionTitle: 'Calendar Subscription URL',
      subscriptionDescription: 'Use this URL to subscribe to the calendar in your favorite app',
      copyUrl: 'Copy URL',
      googleCalendar: 'Google Calendar',
      googleInstructions: '1. Open Google Calendar\n2. Click "+" next to "Other calendars"\n3. Select "From URL"\n4. Paste the URL and confirm',
      outlookCalendar: 'Outlook Calendar',
      outlookInstructions: '1. Open Outlook Calendar\n2. Click "Add calendar"\n3. Select "Subscribe from web"\n4. Paste the URL and confirm',
      appleCalendar: 'Apple Calendar',
      appleInstructions: '1. Open Apple Calendar\n2. File → New Calendar Subscription\n3. Paste the URL and confirm',
      copied: 'URL copied!',
      exportSuccess: 'Calendar downloaded successfully',
      exportError: 'Error downloading calendar',
      subscriptionError: 'Error retrieving subscription URL'
    }
  };

  const t = text[language];

  const handleExport = async () => {
    try {
      const endpoint = userType === 'school'
        ? `/api/calendar/export/school/${schoolId}?academicYear=${academicYear}&term=${term}`
        : `/api/calendar/export/teacher/${userId || user?.id}?academicYear=${academicYear}&term=${term}`;

      const response = await fetch(endpoint, {
        credentials: 'include'
      });

      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `educafric-${userType}-calendar-${academicYear}-${term}.ics`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast({
        title: t.exportSuccess,
        variant: 'default'
      });
    } catch (error) {
      console.error('[CALENDAR_EXPORT] Error:', error);
      toast({
        title: t.exportError,
        variant: 'destructive'
      });
    }
  };

  const handleGetSubscriptionUrl = async () => {
    try {
      const endpoint = userType === 'school'
        ? `/api/calendar/subscription-url/school`
        : `/api/calendar/subscription-url/teacher`;

      const response = await fetch(endpoint, {
        credentials: 'include'
      });

      if (!response.ok) throw new Error('Failed to get subscription URL');

      const data = await response.json();
      setSubscriptionUrl(data.subscriptionUrl);
      setShowInstructions(true);
    } catch (error) {
      console.error('[CALENDAR_SUBSCRIPTION] Error:', error);
      toast({
        title: t.subscriptionError,
        variant: 'destructive'
      });
    }
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(subscriptionUrl);
    toast({
      title: t.copied,
      variant: 'default'
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          {t.title}
        </CardTitle>
        <CardDescription>{t.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">{t.academicYear}</label>
            <Select value={academicYear} onValueChange={setAcademicYear}>
              <SelectTrigger data-testid="select-academic-year">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2024-2025">2024-2025</SelectItem>
                <SelectItem value="2025-2026">2025-2026</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">{t.term}</label>
            <Select value={term} onValueChange={setTerm}>
              <SelectTrigger data-testid="select-term">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Term 1">Term 1</SelectItem>
                <SelectItem value="Term 2">Term 2</SelectItem>
                <SelectItem value="Term 3">Term 3</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            onClick={handleExport} 
            className="flex-1"
            data-testid="button-export-calendar"
          >
            <Download className="w-4 h-4 mr-2" />
            {t.export}
          </Button>
          <Button 
            onClick={handleGetSubscriptionUrl} 
            variant="outline" 
            className="flex-1"
            data-testid="button-get-subscription"
          >
            <Link2 className="w-4 h-4 mr-2" />
            {t.subscribe}
          </Button>
        </div>

        {showInstructions && subscriptionUrl && (
          <div className="space-y-3 pt-4 border-t">
            <div className="flex items-start gap-2 text-sm">
              <Info className="w-4 h-4 mt-0.5 text-blue-500" />
              <p className="text-muted-foreground">{t.subscriptionDescription}</p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={subscriptionUrl}
                readOnly
                className="flex-1 px-3 py-2 text-sm border rounded-md bg-muted"
                data-testid="input-subscription-url"
              />
              <Button onClick={handleCopyUrl} size="sm" data-testid="button-copy-url">
                {t.copyUrl}
              </Button>
            </div>

            <Alert>
              <AlertDescription className="space-y-3">
                <div>
                  <p className="font-semibold mb-1">{t.googleCalendar}:</p>
                  <p className="text-xs whitespace-pre-line">{t.googleInstructions}</p>
                </div>
                <div>
                  <p className="font-semibold mb-1">{t.outlookCalendar}:</p>
                  <p className="text-xs whitespace-pre-line">{t.outlookInstructions}</p>
                </div>
                <div>
                  <p className="font-semibold mb-1">{t.appleCalendar}:</p>
                  <p className="text-xs whitespace-pre-line">{t.appleInstructions}</p>
                </div>
              </AlertDescription>
            </Alert>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
