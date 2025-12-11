import React, { useState, useEffect, useMemo } from 'react';
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
  Shield, MapPin, FileText, Flame, UserX, CheckSquare, Download
} from 'lucide-react';
import MobileActionsOverlay from '@/components/mobile/MobileActionsOverlay';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';

// Types for emergency features
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
  
  // Communication stats from API (no mock data)
  const [statsData, setStatsData] = useState({
    totalMessages: 0,
    unreadMessages: 0,
    sentToday: 0,
    totalRecipients: 0
  });
  const [loadingStats, setLoadingStats] = useState(true);
  
  // Emergency & Security states
  const [panicMode, setPanicMode] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [activeChecklist, setActiveChecklist] = useState<string | null>(null);
  const [emergencyIncidents, setEmergencyIncidents] = useState<EmergencyIncident[]>([]);
  const [showIncidentHistory, setShowIncidentHistory] = useState(false);
  const [showPanicConfirmDialog, setShowPanicConfirmDialog] = useState(false);
  
  // Evacuation checklists data - using state to track checked status only
  const [checklistStates, setChecklistStates] = useState<Record<string, boolean>>({});
  
  // Bilingual checklist definitions (reactive to language changes)
  const evacuationChecklistsData = useMemo(() => [
    {
      id: 'fire',
      type: 'fire' as const,
      items: [
        { id: 'f1', labelFr: 'Déclencher l\'alarme incendie', labelEn: 'Trigger fire alarm' },
        { id: 'f2', labelFr: 'Appeler les pompiers (118)', labelEn: 'Call fire department (118)' },
        { id: 'f3', labelFr: 'Évacuer les élèves calmement', labelEn: 'Evacuate students calmly' },
        { id: 'f4', labelFr: 'Vérifier les toilettes et salles vides', labelEn: 'Check toilets and empty rooms' },
        { id: 'f5', labelFr: 'Rassembler au point de rencontre', labelEn: 'Gather at meeting point' },
        { id: 'f6', labelFr: 'Faire l\'appel de chaque classe', labelEn: 'Take attendance for each class' },
        { id: 'f7', labelFr: 'Notifier les parents', labelEn: 'Notify parents' },
      ]
    },
    {
      id: 'intrusion',
      type: 'intrusion' as const,
      items: [
        { id: 'i1', labelFr: 'Verrouiller toutes les portes', labelEn: 'Lock all doors' },
        { id: 'i2', labelFr: 'Appeler la police (117)', labelEn: 'Call police (117)' },
        { id: 'i3', labelFr: 'Mettre les élèves à l\'abri', labelEn: 'Shelter students' },
        { id: 'i4', labelFr: 'Éteindre les lumières', labelEn: 'Turn off lights' },
        { id: 'i5', labelFr: 'Garder le silence', labelEn: 'Keep silent' },
        { id: 'i6', labelFr: 'Attendre le signal de sécurité', labelEn: 'Wait for safety signal' },
      ]
    },
  ], []);
  
  // Get label based on current language
  const getChecklistItemLabel = (item: { labelFr: string; labelEn: string }) => {
    return language === 'fr' ? item.labelFr : item.labelEn;
  };

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
          console.warn('[COMMUNICATIONS_CENTER] ❌ Failed to load history:', response.status);
          setCommunicationsHistory([]);
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

  // Load communication stats from API - NO MOCK DATA
  useEffect(() => {
    const loadCommunicationStats = async () => {
      setLoadingStats(true);
      try {
        console.log('[COMMUNICATIONS_CENTER] 📊 Loading communication stats...');
        
        const response = await fetch('/api/director/communications/stats', {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            console.log('[COMMUNICATIONS_CENTER] ✅ Stats loaded:', result);
            setStatsData({
              totalMessages: result.totalMessages || 0,
              unreadMessages: result.unreadMessages || 0,
              sentToday: result.sentToday || 0,
              totalRecipients: result.totalRecipients || 0
            });
          }
        } else {
          console.warn('[COMMUNICATIONS_CENTER] ⚠️ Stats API returned:', response.status);
        }
      } catch (error) {
        console.error('[COMMUNICATIONS_CENTER] ❌ Stats API error:', error);
      } finally {
        setLoadingStats(false);
      }
    };

    loadCommunicationStats();
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

  // Stats from real database data - NO MOCK VALUES
  const communicationStats = [
    {
      title: t?.stats?.totalMessages,
      value: loadingStats ? '...' : statsData.totalMessages.toLocaleString(),
      icon: <MessageSquare className="w-5 h-5" />,
      gradient: 'blue' as const
    },
    {
      title: t?.stats?.unreadMessages,
      value: loadingStats ? '...' : statsData.unreadMessages.toLocaleString(),
      icon: <Bell className="w-5 h-5" />,
      gradient: 'orange' as const
    },
    {
      title: t?.stats?.sentToday,
      value: loadingStats ? '...' : statsData.sentToday.toLocaleString(),
      icon: <Send className="w-5 h-5" />,
      gradient: 'green' as const
    },
    {
      title: t?.stats?.recipients,
      value: loadingStats ? '...' : statsData.totalRecipients.toLocaleString(),
      icon: <Users className="w-5 h-5" />,
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

  const toggleChecklistItem = (itemId: string) => {
    setChecklistStates(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const getChecklistProgress = (checklistId: string): number => {
    const checklist = evacuationChecklistsData.find(c => c.id === checklistId);
    if (!checklist) return 0;
    const checked = checklist.items.filter(i => checklistStates[i.id]).length;
    return Math.round((checked / checklist.items.length) * 100);
  };

  const resetChecklist = (checklistId: string) => {
    const checklist = evacuationChecklistsData.find(c => c.id === checklistId);
    if (checklist) {
      const newStates = { ...checklistStates };
      checklist.items.forEach(item => {
        newStates[item.id] = false;
      });
      setChecklistStates(newStates);
    }
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
      default: return <Shield className="w-5 h-5 text-blue-500" />;
    }
  };

  const getChecklistTitle = (type: string) => {
    switch (type) {
      case 'fire': return language === 'fr' ? 'Incendie' : 'Fire';
      case 'intrusion': return language === 'fr' ? 'Intrusion' : 'Intrusion';
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

        {/* Emergency & Security Section - EN HAUT pour visibilité maximale */}
        <Card className={`border-2 shadow-sm transition-all ${panicMode ? 'bg-red-50 border-red-500 animate-pulse' : 'bg-white border-gray-200'}`}>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h2 className="text-lg sm:text-xl font-semibold flex items-center gap-2">
                <Shield className="w-5 h-5 text-red-500" />
                {language === 'fr' ? 'Sécurité & Urgence' : 'Security & Emergency'}
              </h2>
              {emergencyIncidents.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowIncidentHistory(!showIncidentHistory)}
                  data-testid="button-incident-history"
                  className="w-full sm:w-auto"
                >
                  <History className="w-4 h-4 mr-2" />
                  {language === 'fr' ? `Historique (${emergencyIncidents.length})` : `History (${emergencyIncidents.length})`}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Panic Button - Compact & Mobile-friendly */}
            <div className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${panicMode ? 'bg-red-100 border-red-500 animate-pulse' : 'bg-gradient-to-r from-red-50 to-orange-50 border-red-200'}`}>
              {!panicMode ? (
                <>
                  <Button
                    onClick={() => setShowPanicConfirmDialog(true)}
                    disabled={gettingLocation}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-red-600 hover:bg-red-700 shadow-lg flex-shrink-0"
                    data-testid="button-panic"
                  >
                    <div className="text-center">
                      <AlertTriangle className="w-6 h-6 sm:w-8 sm:h-8 mx-auto" />
                    </div>
                  </Button>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-red-700 text-sm sm:text-base">
                      {language === 'fr' ? '🚨 Bouton Panique' : '🚨 Panic Button'}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1">
                      {language === 'fr' 
                        ? 'Alerte urgente avec position GPS à tous les contacts'
                        : 'Emergency alert with GPS location to all contacts'}
                    </p>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-3">
                    <div className="animate-bounce">
                      <AlertTriangle className="w-10 h-10 text-red-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-red-600">
                        {language === 'fr' ? '🚨 ALERTE ACTIVE' : '🚨 ALERT ACTIVE'}
                      </h3>
                      {currentLocation && (
                        <p className="text-xs text-gray-600 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {currentLocation.lat.toFixed(4)}, {currentLocation.lng.toFixed(4)}
                        </p>
                      )}
                    </div>
                  </div>
                  <Button
                    onClick={cancelPanicMode}
                    size="sm"
                    variant="outline"
                    className="border-red-500 text-red-600 hover:bg-red-100"
                    data-testid="button-cancel-panic"
                  >
                    {language === 'fr' ? 'Annuler' : 'Cancel'}
                  </Button>
                </div>
              )}
            </div>

            {/* Evacuation Checklists */}
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2 text-sm">
                <CheckSquare className="w-4 h-4 text-blue-500" />
                {language === 'fr' ? 'Procédures d\'Évacuation' : 'Evacuation Procedures'}
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {evacuationChecklistsData.map((checklist) => (
                  <Card 
                    key={checklist.id}
                    className={`p-3 cursor-pointer transition-all hover:shadow-md ${activeChecklist === checklist.id ? 'ring-2 ring-blue-500 bg-blue-50' : 'bg-white'}`}
                    onClick={() => setActiveChecklist(activeChecklist === checklist.id ? null : checklist.id)}
                    data-testid={`card-checklist-${checklist.type}`}
                  >
                    <div className="flex items-center gap-2">
                      {getChecklistIcon(checklist.type)}
                      <span className="font-medium text-xs sm:text-sm">{getChecklistTitle(checklist.type)}</span>
                      <Badge variant="outline" className="ml-auto text-xs">
                        {getChecklistProgress(checklist.id)}%
                      </Badge>
                    </div>
                    <Progress value={getChecklistProgress(checklist.id)} className="mt-2 h-1.5" />
                  </Card>
                ))}
              </div>

              {/* Active Checklist Details */}
              {activeChecklist && (
                <Card className="mt-4 p-4 bg-blue-50 border-blue-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                    <h4 className="font-semibold flex items-center gap-2">
                      {getChecklistIcon(activeChecklist)}
                      {getChecklistTitle(activeChecklist)}
                    </h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => resetChecklist(activeChecklist)}
                      data-testid="button-reset-checklist"
                    >
                      {language === 'fr' ? 'Réinitialiser' : 'Reset'}
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {evacuationChecklistsData
                      .find(c => c.id === activeChecklist)
                      ?.items.map((item) => {
                        const isChecked = checklistStates[item.id] || false;
                        return (
                          <div 
                            key={item.id}
                            className={`flex items-center gap-3 p-2 rounded transition-colors ${isChecked ? 'bg-green-100' : 'bg-white'}`}
                          >
                            <Checkbox
                              checked={isChecked}
                              onCheckedChange={() => toggleChecklistItem(item.id)}
                              data-testid={`checkbox-${item.id}`}
                            />
                            <span className={`text-sm md:text-base ${isChecked ? 'line-through text-gray-500' : ''}`}>
                              {getChecklistItemLabel(item)}
                            </span>
                          </div>
                        );
                      })}
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

      {/* Panic Button Confirmation Dialog */}
      <AlertDialog open={showPanicConfirmDialog} onOpenChange={setShowPanicConfirmDialog}>
        <AlertDialogContent className="bg-white border-2 border-red-500">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600 flex items-center gap-2">
              <AlertTriangle className="w-6 h-6" />
              {language === 'fr' ? '⚠️ Confirmation d\'Alerte d\'Urgence' : '⚠️ Emergency Alert Confirmation'}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              <div className="space-y-3 mt-2">
                <p className="font-semibold text-gray-800">
                  {language === 'fr' 
                    ? 'Êtes-vous sûr de vouloir déclencher une alerte d\'urgence ?' 
                    : 'Are you sure you want to trigger an emergency alert?'}
                </p>
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm">
                  <p className="text-red-800">
                    {language === 'fr' 
                      ? '⚠️ Cette action va :' 
                      : '⚠️ This action will:'}
                  </p>
                  <ul className="list-disc ml-5 mt-2 text-red-700 space-y-1">
                    <li>{language === 'fr' ? 'Capturer votre position GPS' : 'Capture your GPS location'}</li>
                    <li>{language === 'fr' ? 'Envoyer une notification urgente à TOUS les parents' : 'Send an urgent notification to ALL parents'}</li>
                    <li>{language === 'fr' ? 'Envoyer une notification urgente à TOUS les enseignants' : 'Send an urgent notification to ALL teachers'}</li>
                  </ul>
                </div>
                <p className="text-gray-600 text-sm italic">
                  {language === 'fr' 
                    ? 'Utilisez cette fonction uniquement en cas d\'urgence réelle.' 
                    : 'Use this function only in case of a real emergency.'}
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="flex-1">
              {language === 'fr' ? 'Annuler' : 'Cancel'}
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                setShowPanicConfirmDialog(false);
                handlePanicButton();
              }}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              data-testid="button-confirm-panic"
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              {language === 'fr' ? 'OUI, Déclencher l\'Alerte' : 'YES, Trigger Alert'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CommunicationsCenter;