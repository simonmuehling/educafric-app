import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ModernStatsCard } from '@/components/ui/ModernCard';
import { 
  MessageSquare, Send, Users, Bell, Phone, Mail, 
  AlertTriangle, Calendar, CheckCircle, Plus, Eye, Clock, History,
  Shield, MapPin, FileText, Flame, UserX, CloudLightning, CheckSquare, Download
} from 'lucide-react';
import MobileActionsOverlay from '@/components/mobile/MobileActionsOverlay';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';

// Types for emergency features
interface EvacuationChecklist {
  id: string;
  type: 'fire' | 'intrusion' | 'natural_disaster';
  items: { id: string; label: string; checked: boolean }[];
}

interface EmergencyIncident {
  id: number;
  type: string;
  description: string;
  location?: { lat: number; lng: number };
  timestamp: string;
  status: 'active' | 'resolved';
  reportedBy: string;
}

const CommunicationsCenter: React.FC = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [messageText, setMessageText] = useState('');
  const [selectedRecipient, setSelectedRecipient] = useState('all-parents');
  const [messageType, setMessageType] = useState('general');
  const [sending, setSending] = useState(false);
  const [communicationsHistory, setCommunicationsHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  
  // Dynamic recipient data
  const [teachers, setTeachers] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [parents, setParents] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [loadingRecipients, setLoadingRecipients] = useState(true);
  
  // Emergency & Security states
  const [panicMode, setPanicMode] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [activeChecklist, setActiveChecklist] = useState<string | null>(null);
  const [emergencyIncidents, setEmergencyIncidents] = useState<EmergencyIncident[]>([]);
  const [showIncidentHistory, setShowIncidentHistory] = useState(false);
  
  // Evacuation checklists data
  const [evacuationChecklists, setEvacuationChecklists] = useState<EvacuationChecklist[]>([
    {
      id: 'fire',
      type: 'fire',
      items: [
        { id: 'f1', label: language === 'fr' ? 'Déclencher l\'alarme incendie' : 'Trigger fire alarm', checked: false },
        { id: 'f2', label: language === 'fr' ? 'Appeler les pompiers (118)' : 'Call fire department (118)', checked: false },
        { id: 'f3', label: language === 'fr' ? 'Évacuer les élèves calmement' : 'Evacuate students calmly', checked: false },
        { id: 'f4', label: language === 'fr' ? 'Vérifier les toilettes et salles vides' : 'Check toilets and empty rooms', checked: false },
        { id: 'f5', label: language === 'fr' ? 'Rassembler au point de rencontre' : 'Gather at meeting point', checked: false },
        { id: 'f6', label: language === 'fr' ? 'Faire l\'appel de chaque classe' : 'Take attendance for each class', checked: false },
        { id: 'f7', label: language === 'fr' ? 'Notifier les parents' : 'Notify parents', checked: false },
      ]
    },
    {
      id: 'intrusion',
      type: 'intrusion',
      items: [
        { id: 'i1', label: language === 'fr' ? 'Verrouiller toutes les portes' : 'Lock all doors', checked: false },
        { id: 'i2', label: language === 'fr' ? 'Appeler la police (117)' : 'Call police (117)', checked: false },
        { id: 'i3', label: language === 'fr' ? 'Mettre les élèves à l\'abri' : 'Shelter students', checked: false },
        { id: 'i4', label: language === 'fr' ? 'Éteindre les lumières' : 'Turn off lights', checked: false },
        { id: 'i5', label: language === 'fr' ? 'Garder le silence' : 'Keep silent', checked: false },
        { id: 'i6', label: language === 'fr' ? 'Attendre le signal de sécurité' : 'Wait for safety signal', checked: false },
      ]
    },
    {
      id: 'natural_disaster',
      type: 'natural_disaster',
      items: [
        { id: 'n1', label: language === 'fr' ? 'Alerter tout le personnel' : 'Alert all staff', checked: false },
        { id: 'n2', label: language === 'fr' ? 'Se mettre sous les tables/bureaux' : 'Get under tables/desks', checked: false },
        { id: 'n3', label: language === 'fr' ? 'S\'éloigner des fenêtres' : 'Move away from windows', checked: false },
        { id: 'n4', label: language === 'fr' ? 'Couper l\'électricité et le gaz' : 'Cut electricity and gas', checked: false },
        { id: 'n5', label: language === 'fr' ? 'Évacuer vers zone sûre' : 'Evacuate to safe zone', checked: false },
        { id: 'n6', label: language === 'fr' ? 'Vérifier les blessés' : 'Check for injuries', checked: false },
        { id: 'n7', label: language === 'fr' ? 'Contacter les secours (119)' : 'Contact emergency services (119)', checked: false },
      ]
    }
  ]);

  // Load recipients data from API
  useEffect(() => {
    const loadRecipientsData = async () => {
      setLoadingRecipients(true);
      try {
        console.log('[COMMUNICATIONS_CENTER] 👥 Loading recipients data...');
        
        // Load teachers
        const teachersResponse = await fetch('/api/director/teachers', {
          credentials: 'include'
        });
        if (teachersResponse.ok) {
          const teachersData = await teachersResponse.json();
          setTeachers(teachersData.teachers || []);
        }
        
        // Load students
        const studentsResponse = await fetch('/api/director/students', {
          credentials: 'include'
        });
        if (studentsResponse.ok) {
          const studentsData = await studentsResponse.json();
          setStudents(studentsData.students || []);
        }
        
        // Load classes
        const classesResponse = await fetch('/api/director/classes', {
          credentials: 'include'
        });
        if (classesResponse.ok) {
          const classesData = await classesResponse.json();
          setClasses(classesData.classes || []);
        }
        
        // Load parents (from school API)
        const parentsResponse = await fetch('/api/school/parent-child-connections', {
          credentials: 'include'
        });
        if (parentsResponse.ok) {
          const parentsData = await parentsResponse.json();
          setParents(parentsData.parents || []);
        }
        
        console.log('[COMMUNICATIONS_CENTER] ✅ Recipients loaded:', {
          teachers: teachers.length,
          students: students.length, 
          parents: parents.length,
          classes: classes.length
        });
        
      } catch (error) {
        console.error('[COMMUNICATIONS_CENTER] ❌ Failed to load recipients:', error);
      } finally {
        setLoadingRecipients(false);
      }
    };

    loadRecipientsData();
  }, []);

  // Load communications history from API - CORRIGÉ
  useEffect(() => {
    const loadCommunicationsHistory = async () => {
      setLoadingHistory(true);
      try {
        console.log('[COMMUNICATIONS_CENTER] 📋 Loading communications history...');
        
        const response = await fetch('/api/director/communications?limit=10', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success && result.communications) {
            console.log('[COMMUNICATIONS_CENTER] ✅ History loaded:', (Array.isArray(result.communications) ? result.communications.length : 0), 'items');
            setCommunicationsHistory(result.communications);
          } else {
            console.warn('[COMMUNICATIONS_CENTER] ⚠️ No communications data in API response');
            setCommunicationsHistory([]);
          }
        } else {
          console.warn('[COMMUNICATIONS_CENTER] ❌ Failed to load history, using mock data:', response.status);
          // Données mock pour que le module s'affiche
          setCommunicationsHistory([
            {
              id: 1,
              type: 'announcement',
              subject: 'Réunion parents-professeurs',
              content: 'Réunion programmée le 30 août à 15h.',
              recipients: 'Tous les parents',
              sentAt: '2025-08-25T14:00:00Z',
              status: 'sent'
            },
            {
              id: 2,
              type: 'emergency',
              subject: 'Fermeture exceptionnelle',
              content: 'École fermée demain pour raisons techniques.',
              recipients: 'Communauté scolaire',
              sentAt: '2025-08-24T16:30:00Z',
              status: 'sent'
            }
          ]);
        }
      } catch (error: any) {
        console.error('[COMMUNICATIONS_CENTER] ❌ History API error:', error);
        setCommunicationsHistory([]);
      } finally {
        setLoadingHistory(false);
      }
    };

    loadCommunicationsHistory();
  }, []);

  const text = {
    fr: {
      title: 'Centre de Communications',
      subtitle: 'Gestion complète des communications avec parents, élèves et enseignants',
      stats: {
        totalMessages: 'Messages Totaux',
        unreadMessages: 'Non Lus',
        sentToday: 'Envoyés Aujourd\'hui',
        recipients: 'Destinataires'
      },
      actions: {
        composeMessage: 'Composer Message',
        sendMessage: 'Envoyer Message',
        newAnnouncement: 'Nouvelle Annonce',
        urgentAlert: 'Alerte Urgente'
      },
      recipients: {
        everyone: 'Tout le Monde',
        allParents: 'Tous les Parents',
        allTeachers: 'Tous les Enseignants',
        specificClass: 'Classe Spécifique',
        allStudents: 'Tous les Élèves'
      },
      messageTypes: {
        general: 'Information Générale',
        urgent: 'Annonce Urgente',
        academic: 'Information Académique',
        event: 'Événement École'
      },
      recent: 'Messages Récents',
      placeholder: 'Tapez votre message ici...',
      selectRecipient: 'Sélectionner les destinataires',
      selectType: 'Type de message'
    },
    en: {
      title: 'Communications Centre',
      subtitle: 'Complete management of communications with parents, students and teachers',
      stats: {
        totalMessages: 'Total Messages',
        unreadMessages: 'Unread',
        sentToday: 'Sent Today',
        recipients: 'Recipients'
      },
      actions: {
        composeMessage: 'Compose Message',
        sendMessage: 'Send Message',
        newAnnouncement: 'New Announcement',
        urgentAlert: 'Urgent Alert'
      },
      recipients: {
        everyone: 'Everyone',
        allParents: 'All Parents',
        allTeachers: 'All Teachers',
        specificClass: 'Specific Class',
        allStudents: 'All Students'
      },
      messageTypes: {
        general: 'General Information',
        urgent: 'Urgent Announcement',
        academic: 'Academic Information',
        event: 'School Event'
      },
      recent: 'Recent Messages', 
      placeholder: 'Type your message here...',
      selectRecipient: 'Select recipients',
      selectType: 'Message type'
    }
  };

  const t = text[language as keyof typeof text];

  const communicationStats = [
    {
      title: t?.stats?.totalMessages,
      value: '1,247',
      icon: <MessageSquare className="w-5 h-5" />,
      trend: { value: 15, isPositive: true },
      gradient: 'blue' as const
    },
    {
      title: t?.stats?.unreadMessages,
      value: '34',
      icon: <Bell className="w-5 h-5" />,
      trend: { value: 8, isPositive: false },
      gradient: 'orange' as const
    },
    {
      title: t?.stats?.sentToday,
      value: '89',
      icon: <Send className="w-5 h-5" />,
      trend: { value: 12, isPositive: true },
      gradient: 'green' as const
    },
    {
      title: t?.stats?.recipients,
      value: '456',
      icon: <Users className="w-5 h-5" />,
      trend: { value: 3, isPositive: true },
      gradient: 'purple' as const
    }
  ];

  // Load recent messages from API
  const [recentMessages, setRecentMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch communications history
  useEffect(() => {
    const fetchCommunications = async () => {
      try {
        console.log('[COMMUNICATIONS_CENTER] 📋 Fetching communications history');
        const response = await fetch('/api/communications/history?limit=10', {
          method: 'GET',
          credentials: 'include'
        });

        if (response.ok) {
          const data = await response.json();
          console.log('[COMMUNICATIONS_CENTER] ✅ Communications loaded:', data.communications?.length || 0);
          setRecentMessages(data.communications || []);
        } else {
          console.error('[COMMUNICATIONS_CENTER] ❌ Failed to load communications:', response.status);
        }
      } catch (error) {
        console.error('[COMMUNICATIONS_CENTER] ❌ API Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCommunications();
  }, []);

  // Function to show confirmation dialog
  const handleSendMessage = () => {
    if (!messageText.trim()) {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' ? 'Veuillez saisir un message' : 'Please enter a message',
        variant: 'destructive'
      });
      return;
    }

    // Show confirmation dialog instead of sending immediately
    setShowConfirmDialog(true);
  };

  // Actual send function after confirmation
  const confirmSendMessage = async () => {
    setSending(true);
    
    try {
      console.log('[COMMUNICATIONS_CENTER] 📨 Sending message via API:', {
        messageText: messageText.substring(0, 50) + '...',
        selectedRecipient,
        messageType
      });

      const response = await fetch('/api/communications/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          messageText,
          selectedRecipient,
          messageType,
          priority: messageType === 'urgent' ? 'high' : 'normal'
        })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        console.log('[COMMUNICATIONS_CENTER] ✅ Message sent successfully:', result);
        
        toast({
          title: language === 'fr' ? 'Message Envoyé' : 'Message Sent',
          description: result.message || (language === 'fr' ? 
            `Message envoyé à ${result.communication?.recipients || 0} destinataires` :
            `Message sent to ${result.communication?.recipients || 0} recipients`)
        });
        
        setMessageText('');
        setShowConfirmDialog(false);
        
        // Reload communications history after sending message
        try {
          const historyResponse = await fetch('/api/communications/history?limit=10', {
            method: 'GET',
            credentials: 'include'
          });
          
          if (historyResponse.ok) {
            const historyResult = await historyResponse.json();
            if (historyResult.success && historyResult.communications) {
              setRecentMessages(historyResult.communications);
              console.log('[COMMUNICATIONS_CENTER] 🔄 History reloaded after sending message');
            }
          }
        } catch (error) {
          console.warn('[COMMUNICATIONS_CENTER] ⚠️ Failed to reload history after sending');
        }
      } else {
        console.error('[COMMUNICATIONS_CENTER] ❌ Send message failed:', result);
        toast({
          title: language === 'fr' ? 'Erreur d\'envoi' : 'Send Error',
          description: result.message || (language === 'fr' ? 
            'Impossible d\'envoyer le message' : 'Failed to send message'),
          variant: 'destructive'
        });
      }
    } catch (error: any) {
      console.error('[COMMUNICATIONS_CENTER] ❌ Send message API error:', error);
      toast({
        title: language === 'fr' ? 'Erreur Réseau' : 'Network Error',
        description: language === 'fr' ? 
          'Erreur de connexion. Veuillez réessayer.' : 
          'Connection error. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setSending(false);
    }
  };

  const handleQuickAction = (actionType: string) => {
    switch (actionType) {
      case 'urgent':
        setMessageType('urgent');
        setMessageText(language === 'fr' ? 
          'URGENT: Information importante de la direction...' :
          'URGENT: Important information from administration...'
        );
        break;
      case 'event':
        setMessageType('event');
        setMessageText(language === 'fr' ?
          'Événement école: Nous avons le plaisir de vous annoncer...' :
          'School event: We are pleased to announce...'
        );
        break;
      case 'academic':
        setMessageType('academic');
        setMessageText(language === 'fr' ?
          'Information académique: Veuillez prendre note que...' :
          'Academic information: Please note that...'
        );
        break;
    }
  };

  const getMessageTypeColor = (type: string) => {
    const colors = {
      general: 'bg-blue-100 text-blue-800',
      urgent: 'bg-red-100 text-red-800',
      academic: 'bg-green-100 text-green-800',
      event: 'bg-purple-100 text-purple-800'
    };
    return colors[type as keyof typeof colors] || colors.general;
  };

  const getStatusIcon = (status: string) => {
    if (status === 'sent') return <CheckCircle className="w-4 h-4 text-green-500" />;
    if (status === 'delivered') return <CheckCircle className="w-4 h-4 text-blue-500" />;
    return <Clock className="w-4 h-4 text-yellow-500" />;
  };

  // Emergency & Security Handlers
  const handlePanicButton = async () => {
    setPanicMode(true);
    setGettingLocation(true);
    
    try {
      // Get current location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const location = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };
            setCurrentLocation(location);
            setGettingLocation(false);
            
            // Create emergency incident
            const incident: EmergencyIncident = {
              id: Date.now(),
              type: 'panic',
              description: language === 'fr' ? 'Alerte panique déclenchée' : 'Panic alert triggered',
              location,
              timestamp: new Date().toISOString(),
              status: 'active',
              reportedBy: 'Director'
            };
            
            setEmergencyIncidents(prev => [incident, ...prev]);
            
            // Send emergency notification to all parents and teachers
            try {
              await fetch('/api/director/communications', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  recipient: 'everyone',
                  type: 'urgent',
                  message: language === 'fr' 
                    ? `🚨 ALERTE URGENCE - L'école a déclenché une alerte de sécurité. Position GPS: ${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}. Veuillez rester en contact.`
                    : `🚨 EMERGENCY ALERT - The school has triggered a security alert. GPS Position: ${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}. Please stay in contact.`
                })
              });
              
              toast({
                title: language === 'fr' ? '🚨 Alerte Envoyée' : '🚨 Alert Sent',
                description: language === 'fr' 
                  ? 'Tous les parents et enseignants ont été notifiés avec votre position GPS'
                  : 'All parents and teachers have been notified with your GPS position',
              });
            } catch (error) {
              console.error('Failed to send emergency notification:', error);
            }
          },
          (error) => {
            setGettingLocation(false);
            console.error('Geolocation error:', error);
            toast({
              title: language === 'fr' ? '⚠️ Position non disponible' : '⚠️ Location unavailable',
              description: language === 'fr' 
                ? 'Impossible d\'obtenir votre position. L\'alerte sera envoyée sans coordonnées GPS.'
                : 'Unable to get your location. Alert will be sent without GPS coordinates.',
              variant: 'destructive'
            });
          },
          { enableHighAccuracy: true, timeout: 10000 }
        );
      }
    } catch (error) {
      setGettingLocation(false);
      console.error('Panic button error:', error);
    }
  };

  const cancelPanicMode = () => {
    setPanicMode(false);
    setCurrentLocation(null);
    
    // Mark last incident as resolved
    setEmergencyIncidents(prev => 
      prev.map((inc, idx) => idx === 0 ? { ...inc, status: 'resolved' as const } : inc)
    );
    
    toast({
      title: language === 'fr' ? '✅ Alerte Annulée' : '✅ Alert Cancelled',
      description: language === 'fr' 
        ? 'Le mode urgence a été désactivé'
        : 'Emergency mode has been deactivated',
    });
  };

  const toggleChecklistItem = (checklistId: string, itemId: string) => {
    setEvacuationChecklists(prev => 
      prev.map(checklist => 
        checklist.id === checklistId
          ? {
              ...checklist,
              items: checklist.items.map(item =>
                item.id === itemId ? { ...item, checked: !item.checked } : item
              )
            }
          : checklist
      )
    );
  };

  const getChecklistProgress = (checklistId: string): number => {
    const checklist = evacuationChecklists.find(c => c.id === checklistId);
    if (!checklist) return 0;
    const checked = checklist.items.filter(i => i.checked).length;
    return Math.round((checked / checklist.items.length) * 100);
  };

  const resetChecklist = (checklistId: string) => {
    setEvacuationChecklists(prev =>
      prev.map(checklist =>
        checklist.id === checklistId
          ? { ...checklist, items: checklist.items.map(item => ({ ...item, checked: false })) }
          : checklist
      )
    );
    setActiveChecklist(null);
  };

  const generateIncidentReport = async () => {
    try {
      const XLSX = await import('xlsx');
      
      const reportData = emergencyIncidents.map(incident => ({
        [language === 'fr' ? 'Date/Heure' : 'Date/Time']: new Date(incident.timestamp).toLocaleString(),
        [language === 'fr' ? 'Type' : 'Type']: incident.type,
        [language === 'fr' ? 'Description' : 'Description']: incident.description,
        [language === 'fr' ? 'Position GPS' : 'GPS Position']: incident.location 
          ? `${incident.location.lat.toFixed(6)}, ${incident.location.lng.toFixed(6)}` 
          : 'N/A',
        [language === 'fr' ? 'Statut' : 'Status']: incident.status === 'active' 
          ? (language === 'fr' ? 'Actif' : 'Active') 
          : (language === 'fr' ? 'Résolu' : 'Resolved'),
        [language === 'fr' ? 'Signalé par' : 'Reported by']: incident.reportedBy
      }));

      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(reportData);
      worksheet['!cols'] = [
        { wch: 20 }, { wch: 15 }, { wch: 40 }, { wch: 25 }, { wch: 12 }, { wch: 15 }
      ];
      XLSX.utils.book_append_sheet(workbook, worksheet, language === 'fr' ? 'Incidents' : 'Incidents');
      
      const fileName = `rapport_incidents_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);
      
      toast({
        title: language === 'fr' ? '✅ Rapport généré' : '✅ Report generated',
        description: language === 'fr' 
          ? `${reportData.length} incidents exportés`
          : `${reportData.length} incidents exported`,
      });
    } catch (error) {
      console.error('Report generation error:', error);
      toast({
        title: language === 'fr' ? '❌ Erreur' : '❌ Error',
        description: language === 'fr' ? 'Impossible de générer le rapport' : 'Unable to generate report',
        variant: 'destructive'
      });
    }
  };

  const getChecklistIcon = (type: string) => {
    switch (type) {
      case 'fire': return <Flame className="w-5 h-5 text-orange-500" />;
      case 'intrusion': return <UserX className="w-5 h-5 text-red-500" />;
      case 'natural_disaster': return <CloudLightning className="w-5 h-5 text-purple-500" />;
      default: return <Shield className="w-5 h-5 text-blue-500" />;
    }
  };

  const getChecklistTitle = (type: string) => {
    switch (type) {
      case 'fire': return language === 'fr' ? 'Incendie' : 'Fire';
      case 'intrusion': return language === 'fr' ? 'Intrusion' : 'Intrusion';
      case 'natural_disaster': return language === 'fr' ? 'Catastrophe Naturelle' : 'Natural Disaster';
      default: return type;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <MessageSquare className="w-8 h-8 text-blue-600" />
              {t.title || ''}
            </h1>
            <p className="text-gray-600 mt-2">{t.subtitle}</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {(Array.isArray(communicationStats) ? communicationStats : []).map((stat, index) => (
            <ModernStatsCard key={index} {...stat} />
          ))}
        </div>

        {/* Quick Actions - Mobile Optimized */}
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader>
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              {language === 'fr' ? 'Actions Rapides' : 'Quick Actions'}
            </h2>
          </CardHeader>
          <CardContent>
            <MobileActionsOverlay
              title={language === 'fr' ? 'Actions Communications' : 'Communication Actions'}
              maxVisibleButtons={3}
              actions={[
                {
                  id: 'urgent-broadcast',
                  label: language === 'fr' ? 'Diffusion Urgente' : 'Urgent Broadcast',
                  icon: <AlertTriangle className="w-5 h-5" />,
                  onClick: () => {
                    setMessageType('urgent');
                    setSelectedRecipient('all-parents');
                    setMessageText(language === 'fr' ? 
                      'URGENT: Information importante de la direction...' :
                      'URGENT: Important information from administration...'
                    );
                  },
                  color: 'bg-red-600 hover:bg-red-700'
                },
                {
                  id: 'parent-notification',
                  label: language === 'fr' ? 'Notifier Parents' : 'Notify Parents',
                  icon: <Users className="w-5 h-5" />,
                  onClick: () => {
                    setSelectedRecipient('all-parents');
                    setMessageType('general');
                    setMessageText(language === 'fr' ?
                      'Chers parents, nous souhaitons vous informer que...' :
                      'Dear parents, we would like to inform you that...'
                    );
                  },
                  color: 'bg-blue-600 hover:bg-blue-700'
                },
                {
                  id: 'teacher-memo',
                  label: language === 'fr' ? 'Mémo Enseignants' : 'Teacher Memo',
                  icon: <Mail className="w-5 h-5" />,
                  onClick: () => {
                    setSelectedRecipient('all-teachers');
                    setMessageType('academic');
                    setMessageText(language === 'fr' ?
                      'Chers collègues enseignants, veuillez prendre note...' :
                      'Dear teaching colleagues, please note...'
                    );
                  },
                  color: 'bg-green-600 hover:bg-green-700'
                },
                {
                  id: 'event-announcement',
                  label: language === 'fr' ? 'Annonce Événement' : 'Event Announcement',
                  icon: <Calendar className="w-5 h-5" />,
                  onClick: () => {
                    setMessageType('event');
                    setSelectedRecipient('all-parents');
                    setMessageText(language === 'fr' ?
                      'Événement école: Nous avons le plaisir de vous annoncer...' :
                      'School event: We are pleased to announce...'
                    );
                  },
                  color: 'bg-purple-600 hover:bg-purple-700'
                },
                {
                  id: 'sms-alert',
                  label: language === 'fr' ? 'Alerte SMS' : 'SMS Alert',
                  icon: <Phone className="w-5 h-5" />,
                  onClick: () => {
                    // Afficher l'annonce de contact support Educafric pour activation SMS
                    toast({
                      title: language === 'fr' ? '📞 Activation Requise' : '📞 Activation Required',
                      description: language === 'fr' ? 
                        'La fonctionnalité SMS Alert nécessite une activation. Veuillez contacter le support Educafric pour activer cette fonctionnalité premium liée à des charges supplémentaires.' :
                        'SMS Alert functionality requires activation. Please contact Educafric support to activate this premium feature with additional charges.',
                      variant: 'default',
                      duration: 8000
                    });
                  },
                  color: 'bg-orange-600 hover:bg-orange-700'
                }
              ]}
            />
          </CardContent>
        </Card>

        {/* Emergency & Security Section */}
        <Card className={`border-2 shadow-sm transition-all ${panicMode ? 'bg-red-50 border-red-500 animate-pulse' : 'bg-white border-gray-200'}`}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Shield className="w-5 h-5 text-red-500" />
                {language === 'fr' ? 'Sécurité & Urgence' : 'Security & Emergency'}
              </h2>
              {emergencyIncidents.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowIncidentHistory(!showIncidentHistory)}
                  data-testid="button-incident-history"
                >
                  <History className="w-4 h-4 mr-2" />
                  {language === 'fr' ? `Historique (${emergencyIncidents.length})` : `History (${emergencyIncidents.length})`}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Panic Button */}
            <div className="flex flex-col items-center p-6 bg-gradient-to-br from-red-50 to-orange-50 rounded-xl border border-red-200">
              {!panicMode ? (
                <>
                  <Button
                    onClick={handlePanicButton}
                    disabled={gettingLocation}
                    className="w-32 h-32 rounded-full bg-red-600 hover:bg-red-700 shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                    data-testid="button-panic"
                  >
                    <div className="text-center">
                      <AlertTriangle className="w-12 h-12 mx-auto mb-2" />
                      <span className="text-sm font-bold">
                        {gettingLocation 
                          ? (language === 'fr' ? 'GPS...' : 'GPS...') 
                          : (language === 'fr' ? 'PANIQUE' : 'PANIC')}
                      </span>
                    </div>
                  </Button>
                  <p className="mt-4 text-sm text-gray-600 text-center max-w-md">
                    {language === 'fr' 
                      ? 'Appuyez pour déclencher une alerte d\'urgence. Votre position GPS sera envoyée à tous les parents et enseignants.'
                      : 'Press to trigger an emergency alert. Your GPS position will be sent to all parents and teachers.'}
                  </p>
                </>
              ) : (
                <div className="text-center space-y-4">
                  <div className="animate-bounce">
                    <AlertTriangle className="w-16 h-16 text-red-600 mx-auto" />
                  </div>
                  <h3 className="text-2xl font-bold text-red-600">
                    {language === 'fr' ? '🚨 ALERTE ACTIVE' : '🚨 ALERT ACTIVE'}
                  </h3>
                  {currentLocation && (
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-700">
                      <MapPin className="w-4 h-4" />
                      <span>GPS: {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}</span>
                    </div>
                  )}
                  <Button
                    onClick={cancelPanicMode}
                    variant="outline"
                    className="border-red-500 text-red-600 hover:bg-red-100"
                    data-testid="button-cancel-panic"
                  >
                    {language === 'fr' ? 'Annuler l\'alerte' : 'Cancel Alert'}
                  </Button>
                </div>
              )}
            </div>

            {/* Evacuation Checklists */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-blue-500" />
                {language === 'fr' ? 'Procédures d\'Évacuation' : 'Evacuation Procedures'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {evacuationChecklists.map((checklist) => (
                  <Card 
                    key={checklist.id}
                    className={`p-4 cursor-pointer transition-all hover:shadow-md ${activeChecklist === checklist.id ? 'ring-2 ring-blue-500' : ''}`}
                    onClick={() => setActiveChecklist(activeChecklist === checklist.id ? null : checklist.id)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      {getChecklistIcon(checklist.type)}
                      <Badge variant="outline">
                        {getChecklistProgress(checklist.id)}%
                      </Badge>
                    </div>
                    <h4 className="font-medium">{getChecklistTitle(checklist.type)}</h4>
                    <Progress value={getChecklistProgress(checklist.id)} className="mt-2 h-2" />
                  </Card>
                ))}
              </div>

              {/* Active Checklist Details */}
              {activeChecklist && (
                <Card className="mt-4 p-4 bg-blue-50 border-blue-200">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold flex items-center gap-2">
                      {getChecklistIcon(activeChecklist)}
                      {getChecklistTitle(activeChecklist)}
                    </h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => resetChecklist(activeChecklist)}
                    >
                      {language === 'fr' ? 'Réinitialiser' : 'Reset'}
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {evacuationChecklists
                      .find(c => c.id === activeChecklist)
                      ?.items.map((item) => (
                        <div 
                          key={item.id}
                          className={`flex items-center gap-3 p-2 rounded transition-colors ${item.checked ? 'bg-green-100' : 'bg-white'}`}
                        >
                          <Checkbox
                            checked={item.checked}
                            onCheckedChange={() => toggleChecklistItem(activeChecklist, item.id)}
                          />
                          <span className={item.checked ? 'line-through text-gray-500' : ''}>
                            {item.label}
                          </span>
                        </div>
                      ))}
                  </div>
                </Card>
              )}
            </div>

            {/* Incident History */}
            {showIncidentHistory && emergencyIncidents.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <FileText className="w-5 h-5 text-gray-500" />
                    {language === 'fr' ? 'Historique des Incidents' : 'Incident History'}
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={generateIncidentReport}
                    data-testid="button-generate-report"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    {language === 'fr' ? 'Exporter' : 'Export'}
                  </Button>
                </div>
                <div className="space-y-2">
                  {emergencyIncidents.map((incident) => (
                    <div 
                      key={incident.id}
                      className={`p-3 rounded-lg border ${incident.status === 'active' ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className={`w-4 h-4 ${incident.status === 'active' ? 'text-red-500' : 'text-gray-400'}`} />
                          <span className="font-medium">{incident.description}</span>
                        </div>
                        <Badge variant={incident.status === 'active' ? 'destructive' : 'secondary'}>
                          {incident.status === 'active' 
                            ? (language === 'fr' ? 'Actif' : 'Active') 
                            : (language === 'fr' ? 'Résolu' : 'Resolved')}
                        </Badge>
                      </div>
                      <div className="mt-1 text-sm text-gray-500 flex items-center gap-4">
                        <span>{new Date(incident.timestamp).toLocaleString()}</span>
                        {incident.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {incident.location.lat.toFixed(4)}, {incident.location.lng.toFixed(4)}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader>
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Plus className="w-5 h-5 text-green-500" />
              {t?.actions?.composeMessage}
            </h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium mb-2 block">{t.selectRecipient}</label>
                <Select value={selectedRecipient} onValueChange={setSelectedRecipient}>
                  <SelectTrigger className="bg-white border-gray-300 focus:border-blue-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 shadow-lg rounded-lg">
                    <SelectItem value="everyone" className="hover:bg-gray-50 focus:bg-gray-50 font-semibold text-blue-700">
                      {language === 'fr' ? '📢 Envoyer à Tout le Monde' : '📢 Send to Everyone'}
                    </SelectItem>
                    <SelectItem value="all-parents" className="hover:bg-gray-50 focus:bg-gray-50">
                      {t?.recipients?.allParents} ({parents.length})
                    </SelectItem>
                    <SelectItem value="all-teachers" className="hover:bg-gray-50 focus:bg-gray-50">
                      {t?.recipients?.allTeachers} ({teachers.length})
                    </SelectItem>
                    <SelectItem value="all-students" className="hover:bg-gray-50 focus:bg-gray-50">
                      {t?.recipients?.allStudents} ({students.length})
                    </SelectItem>
                    
                    {/* Enseignants individuels */}
                    {teachers.length > 0 && (
                      <>
                        <SelectItem value="separator-teachers" disabled className="text-xs text-gray-400 font-semibold">
                          ──── {language === 'fr' ? 'ENSEIGNANTS INDIVIDUELS' : 'INDIVIDUAL TEACHERS'} ────
                        </SelectItem>
                        {teachers.slice(0, 5).map((teacher: any) => (
                          <SelectItem key={`teacher-${teacher.id}`} value={`teacher-${teacher.id}`} className="hover:bg-gray-50 focus:bg-gray-50">
                            {language === 'fr' ? '👨‍🏫' : '👨‍🏫'} {teacher.firstName} {teacher.lastName} {teacher.subject ? `(${teacher.subject})` : ''}
                          </SelectItem>
                        ))}
                      </>
                    )}
                    
                    {/* Parents individuels */}
                    {parents.length > 0 && (
                      <>
                        <SelectItem value="separator-parents" disabled className="text-xs text-gray-400 font-semibold">
                          ──── {language === 'fr' ? 'PARENTS INDIVIDUELS' : 'INDIVIDUAL PARENTS'} ────
                        </SelectItem>
                        {parents.slice(0, 5).map((parent: any) => (
                          <SelectItem key={`parent-${parent.id}`} value={`parent-${parent.id}`} className="hover:bg-gray-50 focus:bg-gray-50">
                            👥 {parent.firstName} {parent.lastName} {parent.childName ? `(Parent - ${parent.childName})` : ''}
                          </SelectItem>
                        ))}
                      </>
                    )}
                    
                    {/* Classes spécifiques */}
                    {classes.length > 0 && (
                      <>
                        <SelectItem value="separator-classes" disabled className="text-xs text-gray-400 font-semibold">
                          ──── {language === 'fr' ? 'CLASSES SPÉCIFIQUES' : 'SPECIFIC CLASSES'} ────
                        </SelectItem>
                        {classes.map((classItem: any) => (
                          <SelectItem key={`class-${classItem.id}`} value={`class-${classItem.id}`} className="hover:bg-gray-50 focus:bg-gray-50">
                            🎓 {classItem.name} ({classItem.studentCount || 0} élèves)
                          </SelectItem>
                        ))}
                      </>
                    )}
                    
                    {loadingRecipients && (
                      <SelectItem value="loading" disabled className="text-xs text-gray-400">
                        {language === 'fr' ? '⏳ Chargement des destinataires...' : '⏳ Loading recipients...'}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">{t.selectType}</label>
                <Select value={messageType} onValueChange={setMessageType}>
                  <SelectTrigger className="bg-white border-gray-300 focus:border-blue-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 shadow-lg rounded-lg">
                    <SelectItem value="general" className="hover:bg-gray-50 focus:bg-gray-50">{t?.messageTypes?.general}</SelectItem>
                    <SelectItem value="urgent" className="hover:bg-gray-50 focus:bg-gray-50">{t?.messageTypes?.urgent}</SelectItem>
                    <SelectItem value="academic" className="hover:bg-gray-50 focus:bg-gray-50">{t?.messageTypes?.academic}</SelectItem>
                    <SelectItem value="event" className="hover:bg-gray-50 focus:bg-gray-50">{t?.messageTypes?.event}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Textarea
                value={messageText}
                onChange={(e) => setMessageText(e?.target?.value)}
                placeholder={t.placeholder}
                rows={4}
                className="resize-none"
              />
            </div>

            <div className="flex gap-2 flex-wrap">
              <Button 
                onClick={handleSendMessage}
                disabled={sending}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Send className="w-4 h-4 mr-2" />
                {sending ? (language === 'fr' ? 'Envoi...' : 'Sending...') : t?.actions?.sendMessage}
              </Button>
              
              <Button 
                onClick={() => handleQuickAction('urgent')}
                variant="outline"
                className="border-red-200 text-red-700 hover:bg-red-50"
              >
                <AlertTriangle className="w-4 h-4 mr-2" />
                {t?.actions?.urgentAlert}
              </Button>
              
              <Button 
                onClick={() => handleQuickAction('event')}
                variant="outline"
                className="border-purple-200 text-purple-700 hover:bg-purple-50"
              >
                <Calendar className="w-4 h-4 mr-2" />
                {t?.actions?.newAnnouncement}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader>
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <History className="w-5 h-5 text-blue-500" />
              {language === 'fr' ? 'Historique des Communications' : 'Communications History'}
            </h2>
          </CardHeader>
          <CardContent>
            {loadingHistory ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">
                  {language === 'fr' ? 'Chargement...' : 'Loading...'}
                </span>
              </div>
            ) : (
              <div className="space-y-4">
                {(Array.isArray(communicationsHistory) ? communicationsHistory.length : 0) > 0 ? (
                  (Array.isArray(communicationsHistory) ? communicationsHistory : []).map((message) => (
                <div key={message.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <MessageSquare className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">{message.subject}</h3>
                        <p className="text-sm text-gray-600">{message.from} → {message.to}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getMessageTypeColor(message.type)}>
                        {t.messageTypes[message.type as keyof typeof t.messageTypes]}
                      </Badge>
                      {getStatusIcon(message.status)}
                    </div>
                  </div>
                  <p className="text-gray-700 mb-3">{message.content}</p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>{message.date} à {message.time}</span>
                    <span>{message.recipients} destinataires</span>
                  </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>
                      {language === 'fr' ? 
                        'Aucune communication récente trouvée' : 
                        'No recent communications found'}
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {language === 'fr' ? 'Confirmer l\'envoi du message' : 'Confirm Message Send'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {language === 'fr' ? 
                'Êtes-vous sûr de vouloir envoyer ce message ?' : 
                'Are you sure you want to send this message?'}
              <br />
              <br />
              <strong>{language === 'fr' ? 'Destinataires' : 'Recipients'}:</strong> {selectedRecipient}
              <br />
              <strong>{language === 'fr' ? 'Type' : 'Type'}:</strong> {t.messageTypes[messageType as keyof typeof t.messageTypes]}
              <br />
              <strong>{language === 'fr' ? 'Message' : 'Message'}:</strong> {messageText.substring(0, 100)}{messageText.length > 100 ? '...' : ''}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{language === 'fr' ? 'Annuler' : 'Cancel'}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmSendMessage} disabled={sending}>
              {sending ? (
                <>
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                  {language === 'fr' ? 'Envoi...' : 'Sending...'}
                </>
              ) : (
                language === 'fr' ? 'Confirmer l\'envoi' : 'Confirm Send'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CommunicationsCenter;