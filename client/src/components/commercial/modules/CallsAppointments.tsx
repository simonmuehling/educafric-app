import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { Calendar, Phone, MessageSquare, Search, Plus, Clock, CheckCircle, User, Building2, PhoneOff, CalendarX } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface CallData {
  id: number;
  contact: string;
  school: string;
  phone: string;
  date: string;
  time: string;
  duration: string;
  outcome: string;
  status: string;
  notes: string;
}

interface AppointmentData {
  id: number;
  contact: string;
  school: string;
  date: string;
  time: string;
  duration: string;
  location: string;
  subject: string;
  status: string;
  type: string;
}

interface MessageData {
  id: number;
  sender: string;
  role: string;
  time: string;
  message: string;
  type: string;
}

const CallsAppointments = () => {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState('calls');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch data from API instead of using mock data
  const { data: contactsResponse, isLoading: loadingContacts } = useQuery<{ success: boolean; data: CallData[] }>({
    queryKey: ['/api/commercial/contacts']
  });
  
  const { data: appointmentsResponse, isLoading: loadingAppointments } = useQuery<{ success: boolean; data: AppointmentData[] }>({
    queryKey: ['/api/commercial/appointments']
  });

  const calls: CallData[] = contactsResponse?.data || [];
  const appointments: AppointmentData[] = appointmentsResponse?.data || [];
  const messages: MessageData[] = []; // No API yet - return empty

  const text = {
    fr: {
      title: 'Appels & Rendez-vous',
      subtitle: 'Historique des appels et gestion des rendez-vous clients',
      calls: 'Appels',
      appointments: 'Rendez-vous',
      messages: 'Messages',
      searchPlaceholder: 'Rechercher...',
      addCall: 'Nouvel Appel',
      addAppointment: 'Nouveau RDV',
      sendMessage: 'Nouveau Message',
      contact: 'Contact',
      school: 'École',
      date: 'Date',
      duration: 'Durée',
      outcome: 'Résultat',
      nextAction: 'Prochaine Action',
      status: 'Statut',
      completed: 'Terminé',
      scheduled: 'Planifié',
      pending: 'En Attente',
      cancelled: 'Annulé',
      followUp: 'Relance',
      meeting: 'RDV',
      proposal: 'Proposition',
      contract: 'Contrat',
      time: 'Heure',
      location: 'Lieu',
      subject: 'Sujet',
      callHistory: 'Historique Appels',
      upcomingMeetings: 'Prochains RDV',
      teamMessages: 'Messages Équipe',
      loading: 'Chargement...',
      noCalls: 'Aucun appel enregistré',
      noCallsDesc: 'Les appels que vous effectuez apparaîtront ici',
      noAppointments: 'Aucun rendez-vous programmé',
      noAppointmentsDesc: 'Les rendez-vous programmés apparaîtront ici',
      noMessages: 'Aucun message',
      noMessagesDesc: 'Les messages d\'équipe apparaîtront ici'
    },
    en: {
      title: 'Calls & Appointments',
      subtitle: 'Call history and client appointment management',
      calls: 'Calls',
      appointments: 'Appointments',
      messages: 'Messages',
      searchPlaceholder: 'Search...',
      addCall: 'New Call',
      addAppointment: 'New Appointment',
      sendMessage: 'New Message',
      contact: 'Contact',
      school: 'School',
      date: 'Date',
      duration: 'Duration',
      outcome: 'Outcome',
      nextAction: 'Next Action',
      status: 'Status',
      completed: 'Completed',
      scheduled: 'Scheduled',
      pending: 'Pending',
      cancelled: 'Cancelled',
      followUp: 'Follow Up',
      meeting: 'Meeting',
      proposal: 'Proposal',
      contract: 'Contract',
      time: 'Time',
      location: 'Location',
      subject: 'Subject',
      callHistory: 'Call History',
      upcomingMeetings: 'Upcoming Meetings',
      teamMessages: 'Team Messages',
      loading: 'Loading...',
      noCalls: 'No calls recorded',
      noCallsDesc: 'Calls you make will appear here',
      noAppointments: 'No scheduled appointments',
      noAppointmentsDesc: 'Scheduled appointments will appear here',
      noMessages: 'No messages',
      noMessagesDesc: 'Team messages will appear here'
    }
  };

  const t = text[language as keyof typeof text];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getOutcomeIcon = (outcome: string) => {
    switch (outcome) {
      case 'followUp': return <Phone className="w-3 h-3 text-blue-600" />;
      case 'meeting': return <Calendar className="w-3 h-3 text-green-600" />;
      case 'proposal': return <MessageSquare className="w-3 h-3 text-purple-600" />;
      case 'contract': return <CheckCircle className="w-3 h-3 text-yellow-600" />;
      default: return <Phone className="w-3 h-3 text-gray-600" />;
    }
  };

  const tabs = [
    { id: 'calls', label: t.calls, icon: <Phone className="w-4 h-4" /> },
    { id: 'appointments', label: t.appointments, icon: <Calendar className="w-4 h-4" /> },
    { id: 'messages', label: t.messages, icon: <MessageSquare className="w-4 h-4" /> }
  ];

  const renderCalls = () => {
    if (loadingContacts) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">{t.loading}</span>
        </div>
      );
    }
    
    if (calls.length === 0) {
      return (
        <Card>
          <CardContent className="text-center py-12">
            <PhoneOff className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">{t.noCalls}</p>
            <p className="text-gray-500 text-sm">{t.noCallsDesc}</p>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-4">
        {calls.map((call) => (
          <Card key={call.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Phone className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">{call.contact}</h3>
                      <Badge className={getStatusColor(call.status)}>
                        {call.status === 'completed' ? t.completed : t.pending}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{call.school}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span>{call.date} - {call.time}</span>
                      <span>{call.duration}</span>
                      <div className="flex items-center gap-1">
                        {getOutcomeIcon(call.outcome)}
                        <span className="capitalize">{call.outcome}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Phone className="w-3 h-3 mr-1" />
                    {language === 'fr' ? 'Rappeler' : 'Call back'}
                  </Button>
                </div>
              </div>
              {call.notes && (
                <div className="mt-3 p-2 bg-gray-50 rounded text-sm">
                  <strong>Notes:</strong> {call.notes}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const renderAppointments = () => {
    if (loadingAppointments) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <span className="ml-3 text-gray-600">{t.loading}</span>
        </div>
      );
    }
    
    if (appointments.length === 0) {
      return (
        <Card>
          <CardContent className="text-center py-12">
            <CalendarX className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">{t.noAppointments}</p>
            <p className="text-gray-500 text-sm">{t.noAppointmentsDesc}</p>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-4">
        {appointments.map((appointment) => (
          <Card key={appointment.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Calendar className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">{appointment.subject}</h3>
                      <Badge className={getStatusColor(appointment.status)}>
                        {appointment.status === 'completed' ? t.completed : 
                         appointment.status === 'scheduled' ? t.scheduled : t.pending}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{appointment.contact} - {appointment.school}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {appointment.date} - {appointment.time}
                      </div>
                      <span>{appointment.duration}</span>
                      <span>{appointment.location}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Calendar className="w-3 h-3 mr-1" />
                    {language === 'fr' ? 'Modifier' : 'Edit'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const renderMessages = () => {
    if (messages.length === 0) {
      return (
        <Card>
          <CardContent className="text-center py-12">
            <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">{t.noMessages}</p>
            <p className="text-gray-500 text-sm">{t.noMessagesDesc}</p>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-4">
        {messages.map((message) => (
          <Card key={message.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {message?.sender?.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900">{message.sender}</h3>
                    <span className="text-sm text-gray-500">{message.role}</span>
                    <span className="text-sm text-gray-400">{message.time}</span>
                  </div>
                  <p className="text-gray-700">{message.message}</p>
                </div>
                <Button variant="outline" size="sm">
                  <MessageSquare className="w-3 h-3 mr-1" />
                  {language === 'fr' ? 'Répondre' : 'Reply'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gradient-to-r from-pink-500 to-pink-600 rounded-lg">
          <Phone className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{t.title || ''}</h2>
          <p className="text-gray-600">{t.subtitle}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
        {(Array.isArray(tabs) ? tabs : []).map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab(tab.id)}
            className="flex items-center gap-2 flex-1"
          >
            {tab.icon}
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Search and Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder={t.searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e?.target?.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          {activeTab === 'calls' && (
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              {t.addCall}
            </Button>
          )}
          {activeTab === 'appointments' && (
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              {t.addAppointment}
            </Button>
          )}
          {activeTab === 'messages' && (
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              {t.sendMessage}
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      {activeTab === 'calls' && renderCalls()}
      {activeTab === 'appointments' && renderAppointments()}
      {activeTab === 'messages' && renderMessages()}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{(Array.isArray(calls) ? calls.length : 0)}</div>
            <div className="text-sm text-gray-600">{language === 'fr' ? 'Appels Aujourd\'hui' : 'Calls Today'}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {(Array.isArray(appointments) ? appointments : []).filter(a => a.status === 'scheduled').length}
            </div>
            <div className="text-sm text-gray-600">{language === 'fr' ? 'RDV Planifiés' : 'Scheduled Meetings'}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{(Array.isArray(messages) ? messages.length : 0)}</div>
            <div className="text-sm text-gray-600">{language === 'fr' ? 'Messages Non Lus' : 'Unread Messages'}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {(Array.isArray(calls) ? calls : []).reduce((sum, call) => sum + parseInt(call.duration), 0)}
            </div>
            <div className="text-sm text-gray-600">{language === 'fr' ? 'Minutes Totales' : 'Total Minutes'}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CallsAppointments;