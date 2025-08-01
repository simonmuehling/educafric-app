import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, Clock, MapPin, Users, Plus, Edit, Trash2, Save, School, BookOpen,
  MessageSquare, Phone, Mail, Bell, Eye, User, Settings
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';

interface TimeSlot {
  id: number;
  classId: number;
  subjectId: number;
  teacherId: number;
  day: string;
  startTime: string;
  endTime: string;
  classroom: string;
  subject: string;
  teacher: string;
}

interface Communication {
  id: number;
  sender: { role: string; name: string };
  recipient: { role: string; name: string };
  category: 'academic' | 'general' | 'urgent' | 'administrative';
  subject: string;
  content: string;
  channel: 'sms' | 'email' | 'app' | 'sms+email';
  isRead: boolean;
  sentAt: string;
}

const AdvancedTimetableSystem = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('timetable');
  const [selectedDay, setSelectedDay] = useState('monday');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showMessageForm, setShowMessageForm] = useState(false);
  
  const [newSlot, setNewSlot] = useState<Partial<TimeSlot>>({
    day: 'monday',
    startTime: '08:00',
    endTime: '09:00',
    classroom: '',
    subject: '',
    teacher: ''
  });

  const [newMessage, setNewMessage] = useState({
    recipientType: 'students',
    recipients: [],
    category: 'general',
    subject: '',
    content: '',
    channel: 'app'
  });

  // Générer créneaux horaires ultra-flexibles (intervalles de 5 minutes)
  const generateFlexibleTimeSlots = () => {
    const slots = [];
    for (let hour = 6; hour <= 18; hour++) {
      for (let minute = 0; minute < 60; minute += 5) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(time);
      }
    }
    return slots;
  };

  const timeSlots = generateFlexibleTimeSlots();

  const text = {
    fr: {
      title: 'Système Éducatif Intégré',
      subtitle: 'Configuration Emplois du Temps & Communications Inter-Profils',
      timetableTab: 'Emplois du Temps',
      communicationsTab: 'Communications',
      createNew: 'Nouveau Créneau',
      sendMessage: 'Envoyer Message',
      schedule: 'Emploi du Temps',
      flexibleTiming: 'Créneaux Ultra-Flexibles (Précision 5min)',
      selectClass: 'Sélectionner la Classe',
      selectSubject: 'Sélectionner la Matière',
      selectTeacher: 'Sélectionner l\'Enseignant',
      startTime: 'Heure de Début',
      endTime: 'Heure de Fin',
      classroom: 'Salle de Classe',
      save: 'Enregistrer',
      cancel: 'Annuler',
      edit: 'Modifier',
      delete: 'Supprimer',
      
      // Communications
      communicationTypes: {
        institutional: 'Communications Institutionnelles',
        individual: 'Messages Individuels',
        urgent: 'Notifications Urgentes',
        reports: 'Rapports & Suivis'
      },
      channels: {
        sms: 'SMS',
        email: 'Email',
        app: 'Application',
        'sms+email': 'SMS + Email'
      },
      categories: {
        academic: 'Académique',
        general: 'Général',
        urgent: 'Urgent',
        administrative: 'Administratif'
      },
      recipients: {
        students: 'Étudiants',
        parents: 'Parents',
        teachers: 'Enseignants',
        all: 'Tous'
      },
      
      days: {
        monday: 'Lundi',
        tuesday: 'Mardi',
        wednesday: 'Mercredi',
        thursday: 'Jeudi',
        friday: 'Vendredi',
        saturday: 'Samedi'
      }
    },
    en: {
      title: 'Integrated Educational System',
      subtitle: 'Timetable Configuration & Inter-Profile Communications',
      timetableTab: 'Timetable',
      communicationsTab: 'Communications',
      createNew: 'New Time Slot',
      sendMessage: 'Send Message',
      schedule: 'Schedule',
      flexibleTiming: 'Ultra-Flexible Slots (5min Precision)',
      selectClass: 'Select Class',
      selectSubject: 'Select Subject',
      selectTeacher: 'Select Teacher',
      startTime: 'Start Time',
      endTime: 'End Time',
      classroom: 'Classroom',
      save: 'Save',
      cancel: 'Cancel',
      edit: 'Edit',
      delete: 'Delete',
      
      // Communications
      communicationTypes: {
        institutional: 'Institutional Communications',
        individual: 'Individual Messages',
        urgent: 'Urgent Notifications',
        reports: 'Reports & Follow-ups'
      },
      channels: {
        sms: 'SMS',
        email: 'Email',
        app: 'Application',
        'sms+email': 'SMS + Email'
      },
      categories: {
        academic: 'Academic',
        general: 'General',
        urgent: 'Urgent',
        administrative: 'Administrative'
      },
      recipients: {
        students: 'Students',
        parents: 'Parents',
        teachers: 'Teachers',
        all: 'All'
      },
      
      days: {
        monday: 'Monday',
        tuesday: 'Tuesday',
        wednesday: 'Wednesday',
        thursday: 'Thursday',
        friday: 'Friday',
        saturday: 'Saturday'
      }
    }
  };

  const t = text[language as keyof typeof text];

  // Système de contrôle d'accès par rôle
  const hasWriteAccess = () => {
    return ['teacher', 'director', 'admin', 'siteadmin', 'freelancer'].includes(user?.role || '');
  };

  const hasReadOnlyAccess = () => {
    return ['student', 'parent'].includes(user?.role || '');
  };

  // Données d'exemple pour les emplois du temps
  const sampleTimetable = {
    monday: [
      { id: 1, time: '08:00-09:00', subject: 'Mathématiques', class: '6ème A', room: 'A101', teacher: 'M. Dupont', color: 'bg-blue-500' },
      { id: 2, time: '09:05-10:05', subject: 'Français', class: '5ème B', room: 'B203', teacher: 'Mme Martin', color: 'bg-green-500' },
      { id: 3, time: '10:10-11:10', subject: 'Sciences', class: '4ème A', room: 'Lab1', teacher: 'Dr. Kamdem', color: 'bg-purple-500' },
      { id: 4, time: '14:00-15:00', subject: 'Histoire', class: '3ème C', room: 'C205', teacher: 'M. Ngoma', color: 'bg-orange-500' }
    ],
    tuesday: [
      { id: 5, time: '08:15-09:15', subject: 'Anglais', class: '6ème A', room: 'A102', teacher: 'Ms Johnson', color: 'bg-red-500' },
      { id: 6, time: '09:25-10:25', subject: 'Géographie', class: '5ème B', room: 'B201', teacher: 'M. Tchamba', color: 'bg-yellow-500' }
    ]
  };

  // Communications d'exemple
  const sampleCommunications = [
    {
      id: 1,
      sender: { role: 'director', name: 'M. Directeur' },
      category: 'urgent',
      subject: 'Réunion Parents-Enseignants',
      content: 'Réunion prévue le vendredi 25 janvier à 15h.',
      channel: 'sms+email',
      sentAt: '2025-01-24 14:30',
      isRead: false
    },
    {
      id: 2,
      sender: { role: 'teacher', name: 'Mme Martin' },
      category: 'academic',
      subject: 'Résultats Contrôle Français',
      content: 'Les résultats du contrôle de français sont disponibles.',
      channel: 'app',
      sentAt: '2025-01-24 16:15',
      isRead: true
    }
  ];

  const handleCreateSlot = () => {
    // API call to create new time slot
    console.log('Creating time slot:', newSlot);
    setShowCreateForm(false);
    // Reset form
    setNewSlot({
      day: 'monday',
      startTime: '08:00',
      endTime: '09:00',
      classroom: '',
      subject: '',
      teacher: ''
    });
  };

  const handleSendMessage = () => {
    // API call to send message
    console.log('Sending message:', newMessage);
    setShowMessageForm(false);
    // Reset form
    setNewMessage({
      recipientType: 'students',
      recipients: [],
      category: 'general',
      subject: '',
      content: '',
      channel: 'app'
    });
  };

  const renderTimetableTab = () => (
    <div className="space-y-6">
      {/* Header with Role-based Access */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-semibold">{t.schedule}</h3>
          <p className="text-sm text-gray-600">{t.flexibleTiming}</p>
        </div>
        {hasWriteAccess() && (
          <Button onClick={() => setShowCreateForm(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            {t.createNew}
          </Button>
        )}
      </div>

      {/* Day Navigation */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {Object.entries(t.days).map(([key, label]) => (
          <Button
            key={key}
            variant={selectedDay === key ? 'default' : 'outline'}
            onClick={() => setSelectedDay(key)}
            className="whitespace-nowrap"
          >
            {label}
          </Button>
        ))}
      </div>

      {/* Timetable Display */}
      <div className="grid gap-4">
        {(sampleTimetable[selectedDay as keyof typeof sampleTimetable] || []).map((slot) => (
          <Card key={slot.id} className="border-l-4" style={{ borderLeftColor: slot?.color?.replace('bg-', '') }}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-2">
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {slot.time}
                    </Badge>
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <BookOpen className="w-3 h-3" />
                      {slot.subject}
                    </Badge>
                  </div>
                  <p className="font-medium">{slot.class}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {slot.room}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {slot.teacher}
                    </span>
                  </div>
                </div>
                {hasWriteAccess() && (
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Slot Form */}
      {showCreateForm && hasWriteAccess() && (
        <Card>
          <CardHeader>
            <h4 className="text-lg font-medium">{t.createNew}</h4>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">{t.selectClass}</label>
                <Select value={newSlot.classId?.toString()} onValueChange={(value) => setNewSlot(prev => ({ ...prev, classId: parseInt(value) }))}>
                  <SelectTrigger>
                    <SelectValue placeholder={t.selectClass} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">6ème A</SelectItem>
                    <SelectItem value="2">5ème B</SelectItem>
                    <SelectItem value="3">4ème A</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t.selectSubject}</label>
                <Input 
                  value={newSlot.subject} 
                  onChange={(e) => setNewSlot(prev => ({ ...prev, subject: e?.target?.value }))}
                  placeholder={t.selectSubject}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">{t.startTime}</label>
                <Select value={newSlot.startTime} onValueChange={(value) => setNewSlot(prev => ({ ...prev, startTime: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {(Array.isArray(timeSlots) ? timeSlots : []).map(time => (
                      <SelectItem key={time} value={time}>{time}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t.endTime}</label>
                <Select value={newSlot.endTime} onValueChange={(value) => setNewSlot(prev => ({ ...prev, endTime: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {(Array.isArray(timeSlots) ? timeSlots : []).map(time => (
                      <SelectItem key={time} value={time}>{time}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t.classroom}</label>
                <Input 
                  value={newSlot.classroom} 
                  onChange={(e) => setNewSlot(prev => ({ ...prev, classroom: e?.target?.value }))}
                  placeholder="A101"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleCreateSlot}>{t.save}</Button>
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>{t.cancel}</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderCommunicationsTab = () => (
    <div className="space-y-6">
      {/* Communications Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-semibold">{t.communicationsTab}</h3>
          <p className="text-sm text-gray-600">Système de Communication Inter-Profils</p>
        </div>
        {hasWriteAccess() && (
          <Button onClick={() => setShowMessageForm(true)} className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            {t.sendMessage}
          </Button>
        )}
      </div>

      {/* Communication Types */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(t.communicationTypes).map(([key, label]) => (
          <Card key={key} className="p-4 text-center cursor-pointer hover:bg-gray-50">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <MessageSquare className="w-6 h-6 text-blue-500" />
            </div>
            <p className="text-sm font-medium">{label}</p>
          </Card>
        ))}
      </div>

      {/* Recent Communications */}
      <div className="space-y-4">
        <h4 className="text-lg font-medium">Communications Récentes</h4>
        {(Array.isArray(sampleCommunications) ? sampleCommunications : []).map((comm) => (
          <Card key={comm.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant={comm.category === 'urgent' ? 'destructive' : 'secondary'}>
                      {t.categories[comm.category as keyof typeof t.categories]}
                    </Badge>
                    <Badge variant="outline">{t.channels[comm.channel as keyof typeof t.channels]}</Badge>
                    {!comm.isRead && <Badge variant="default">Nouveau</Badge>}
                  </div>
                  <h5 className="font-medium">{comm.subject}</h5>
                  <p className="text-sm text-gray-600 mt-1">{comm.content}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    De: {comm?.sender?.name} • {comm.sentAt}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <Eye className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Send Message Form */}
      {showMessageForm && hasWriteAccess() && (
        <Card>
          <CardHeader>
            <h4 className="text-lg font-medium">{t.sendMessage}</h4>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Destinataires</label>
                <Select value={newMessage.recipientType} onValueChange={(value) => setNewMessage(prev => ({ ...prev, recipientType: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(t.recipients).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Canal</label>
                <Select value={newMessage.channel} onValueChange={(value) => setNewMessage(prev => ({ ...prev, channel: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(t.channels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Sujet</label>
              <Input 
                value={newMessage.subject} 
                onChange={(e) => setNewMessage(prev => ({ ...prev, subject: e?.target?.value }))}
                placeholder="Sujet du message"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Message</label>
              <Textarea 
                value={newMessage.content} 
                onChange={(e) => setNewMessage(prev => ({ ...prev, content: e?.target?.value }))}
                placeholder="Contenu du message..."
                rows={4}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleSendMessage}>Envoyer</Button>
              <Button variant="outline" onClick={() => setShowMessageForm(false)}>{t.cancel}</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  // Redirection automatique selon le rôle
  useEffect(() => {
    if (hasReadOnlyAccess()) {
      // Affichage lecture seule pour students et parents
      setActiveTab('timetable');
    }
  }, [user?.role]);

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">{t.title || ''}</h2>
        <p className="text-gray-600">{t.subtitle}</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="timetable" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            {t.timetableTab}
          </TabsTrigger>
          <TabsTrigger value="communications" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            {t.communicationsTab}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="timetable">
          {renderTimetableTab()}
        </TabsContent>

        <TabsContent value="communications">
          {renderCommunicationsTab()}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedTimetableSystem;