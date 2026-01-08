import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Users, Clock, Euro } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useLanguage } from '@/contexts/LanguageContext';

const EventsModule: React.FC = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [registering, setRegistering] = useState<number | null>(null);

  const texts = {
    fr: {
      title: 'Événements École',
      subtitle: 'Inscrivez-vous aux événements de votre école',
      loadEvents: 'Charger les événements',
      register: 'S\'inscrire',
      registered: 'Inscrit',
      date: 'Date',
      time: 'Heure',
      location: 'Lieu',
      participants: 'Participants',
      cost: 'Coût',
      deadline: 'Date limite',
      free: 'Gratuit',
      parentConsent: 'Autorisation parentale requise',
      loading: 'Chargement...',
      error: 'Erreur',
      errorLoadEvents: 'Impossible de charger les événements',
      registrationSuccess: 'Inscription réussie',
      confirmationCode: 'Code de confirmation',
      errorRegister: 'Impossible de s\'inscrire à l\'événement'
    },
    en: {
      title: 'School Events',
      subtitle: 'Register for school events',
      loadEvents: 'Load Events',
      register: 'Register',
      registered: 'Registered',
      date: 'Date',
      time: 'Time',
      location: 'Location',
      participants: 'Participants',
      cost: 'Cost',
      deadline: 'Deadline',
      free: 'Free',
      parentConsent: 'Parent consent required',
      loading: 'Loading...',
      error: 'Error',
      errorLoadEvents: 'Unable to load events',
      registrationSuccess: 'Registration successful',
      confirmationCode: 'Confirmation code',
      errorRegister: 'Unable to register for event'
    }
  };

  const t = texts[language];

  const loadEvents = async () => {
    setLoading(true);
    try {
      const response = await apiRequest('GET', '/api/student/events', {});
      
      if (response.ok) {
        const result = await response.json();
        setEvents(result.events || []);
      }
    } catch (error) {
      console.error('Error loading events:', error);
      toast({
        title: t.error,
        description: t.errorLoadEvents,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const registerForEvent = async (eventId: number) => {
    setRegistering(eventId);
    try {
      const response = await apiRequest('POST', '/api/student/events/register', {
        eventId: eventId.toString(),
        parentConsent: true
      });
      
      if (response.ok) {
        const result = await response.json();
        toast({
          title: t.registrationSuccess,
          description: `${t.confirmationCode}: ${result.registration.confirmationCode}`,
          variant: 'default'
        });
      }
    } catch (error) {
      console.error('Error registering for event:', error);
      toast({
        title: t.error,
        description: t.errorRegister,
        variant: 'destructive'
      });
    } finally {
      setRegistering(null);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-green-800">
            <Calendar className="h-6 w-6" />
            <span>{t.title}</span>
          </CardTitle>
          <p className="text-green-600">{t.subtitle}</p>
        </CardHeader>
        <CardContent>
          <Button onClick={loadEvents} disabled={loading}>
            <Calendar className="h-4 w-4 mr-2" />
            {loading ? t.loading : t.loadEvents}
          </Button>
        </CardContent>
      </Card>

      {events.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {events.map((event) => (
            <Card key={event.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">{event.title}</CardTitle>
                <p className="text-sm text-gray-600">{event.description}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-blue-500" />
                    <span>{event.date}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-orange-500" />
                    <span>{event.time}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-red-500" />
                    <span className="text-xs">{event.location}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-purple-500" />
                    <span>{event.currentParticipants}/{event.maxParticipants}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Euro className="h-4 w-4 text-green-500" />
                    <span>{event.cost === 0 ? t.free : `${event.cost} FCFA`}</span>
                  </div>
                </div>

                {event.requiresParentConsent && (
                  <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded">
                    ⚠️ {t.parentConsent}
                  </p>
                )}

                <Button 
                  onClick={() => registerForEvent(event.id)}
                  disabled={registering === event.id}
                  className="w-full"
                  variant={event.status === 'registered' ? 'secondary' : 'default'}
                >
                  {registering === event.id ? t.loading : t.register}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default EventsModule;