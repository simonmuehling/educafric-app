import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  MessageSquare, Send, Inbox, Archive,
  Plus, Search, Filter, Star,
  Reply, Forward, Mail, Phone
} from 'lucide-react';

interface Communication {
  id: number;
  from: string;
  fromRole: string;
  to: string;
  toRole: string;
  subject: string;
  message: string;
  type: string;
  status: string;
  date: string;
  direction: string;
}

const FunctionalTeacherCommunications: React.FC = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const [selectedTab, setSelectedTab] = useState<string>('inbox');
  const [selectedMessage, setSelectedMessage] = useState<Communication | null>(null);

  // Fetch teacher communications data from PostgreSQL API
  const { data: communications = [], isLoading } = useQuery<Communication[]>({
    queryKey: ['/api/teacher/communications'],
    enabled: !!user
  });

  const text = {
    fr: {
      title: 'Communications',
      subtitle: 'Gérez vos communications avec les élèves, parents et collègues',
      loading: 'Chargement des messages...',
      noData: 'Aucun message',
      tabs: {
        inbox: 'Boîte de réception',
        sent: 'Envoyés',
        archived: 'Archivés',
        compose: 'Nouveau'
      },
      stats: {
        unread: 'Non lus',
        today: 'Aujourd\'hui',
        parents: 'Parents',
        students: 'Élèves'
      },
      actions: {
        compose: 'Nouveau Message',
        reply: 'Répondre',
        forward: 'Transférer',
        archive: 'Archiver',
        delete: 'Supprimer'
      },
      compose: {
        to: 'Destinataire',
        subject: 'Objet',
        message: 'Message',
        send: 'Envoyer',
        save: 'Sauvegarder'
      },
      types: {
        message: 'Message',
        notification: 'Notification',
        announcement: 'Annonce',
        urgent: 'Urgent'
      }
    },
    en: {
      title: 'Communications',
      subtitle: 'Manage your communications with students, parents and colleagues',
      loading: 'Loading messages...',
      noData: 'No messages',
      tabs: {
        inbox: 'Inbox',
        sent: 'Sent',
        archived: 'Archived',
        compose: 'Compose'
      },
      stats: {
        unread: 'Unread',
        today: 'Today',
        parents: 'Parents',
        students: 'Students'
      },
      actions: {
        compose: 'New Message',
        reply: 'Reply',
        forward: 'Forward',
        archive: 'Archive',
        delete: 'Delete'
      },
      compose: {
        to: 'To',
        subject: 'Subject',
        message: 'Message',
        send: 'Send',
        save: 'Save'
      },
      types: {
        message: 'Message',
        notification: 'Notification',
        announcement: 'Announcement',
        urgent: 'Urgent'
      }
    }
  };

  const t = text[language as keyof typeof text];

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">{t.loading}</span>
        </div>
      </div>
    );
  }

  // Filter communications based on selected tab
  const filteredCommunications = (Array.isArray(communications) ? communications : []).filter(comm => {
    if (!comm) return false;
    switch (selectedTab) {
      case 'inbox':
        return comm.direction === 'received';
      case 'sent':
        return comm.direction === 'sent';
      case 'archived':
        return comm.status === 'archived';
      default:
        return true;
    }
  });

  // Calculate statistics
  const unreadCount = (Array.isArray(communications) ? communications : []).filter(c => c.status === 'unread').length;
  const todayCount = (Array.isArray(communications) ? communications : []).filter(c => c?.date?.startsWith(new Date().toISOString().split('T')[0])).length;
  const parentsCount = (Array.isArray(communications) ? communications : []).filter(c => c.fromRole === 'Parent' || c.toRole === 'Parent').length;
  const studentsCount = (Array.isArray(communications) ? communications : []).filter(c => c.fromRole === 'Student' || c.toRole === 'Student').length;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'urgent':
        return <Star className="w-4 h-4 text-red-500" />;
      case 'announcement':
        return <Mail className="w-4 h-4 text-blue-500" />;
      default:
        return <MessageSquare className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTypeBadge = (type: string) => {
    const variants: Record<string, string> = {
      urgent: 'bg-red-100 text-red-800',
      announcement: 'bg-blue-100 text-blue-800',
      notification: 'bg-green-100 text-green-800',
      message: 'bg-gray-100 text-gray-800'
    };

    return (
      <Badge className={variants[type] || 'bg-gray-100 text-gray-800'}>
        {t.types[type as keyof typeof t.types]}
      </Badge>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t.title || ''}</h1>
          <p className="text-gray-600 mt-1">{t.subtitle}</p>
        </div>
        <Button 
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => setSelectedTab('compose')}
        >
          <Plus className="w-4 h-4 mr-2" />
          {t?.actions?.compose}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <MessageSquare className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">{t?.stats?.unread}</p>
                <p className="text-2xl font-bold text-red-600">{unreadCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Inbox className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">{t?.stats?.today}</p>
                <p className="text-2xl font-bold text-blue-600">{todayCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Mail className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">{t?.stats?.parents}</p>
                <p className="text-2xl font-bold text-green-600">{parentsCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Phone className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">{t?.stats?.students}</p>
                <p className="text-2xl font-bold text-purple-600">{studentsCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Communication Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Message List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex space-x-1">
                  {Object.entries(t.tabs).map(([key, label]) => (
                    <Button
                      key={key}
                      variant={selectedTab === key ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setSelectedTab(key)}
                      data-testid={`button-tab-${key}`}
                    >
                      {label}
                    </Button>
                  ))}
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" data-testid="button-search-messages">
                    <Search className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" data-testid="button-filter-messages">
                    <Filter className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {(Array.isArray(filteredCommunications) ? filteredCommunications.length : 0) === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">{t.noData}</h3>
                  <p className="text-gray-600">Aucun message dans cette catégorie.</p>
                </div>
              ) : (
                <div className="divide-y">
                  {(Array.isArray(filteredCommunications) ? filteredCommunications : []).map((comm) => (
                    <div
                      key={comm.id}
                      className={`p-4 hover:bg-gray-50 cursor-pointer ${
                        selectedMessage?.id === comm.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                      }`}
                      onClick={() => setSelectedMessage(comm)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            {getTypeIcon(comm.type)}
                            <span className="font-medium text-gray-900">
                              {selectedTab === 'sent' ? comm.to : comm.from}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {selectedTab === 'sent' ? comm.toRole : comm.fromRole}
                            </Badge>
                            {getTypeBadge(comm.type)}
                          </div>
                          <h4 className="font-medium text-gray-900 mb-1">{comm.subject}</h4>
                          <p className="text-sm text-gray-600 line-clamp-2">{comm.message}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">
                            {new Date(comm.date).toLocaleDateString()}
                          </p>
                          {comm.status === 'unread' && (
                            <div className="w-2 h-2 bg-blue-600 rounded-full mt-1 ml-auto"></div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Message Detail / Compose */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">
                {selectedMessage ? 'Détails du Message' : 'Actions Rapides'}
              </h3>
            </CardHeader>
            <CardContent>
              {selectedMessage ? (
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">De:</span>
                      <Badge variant="outline">{selectedMessage.fromRole}</Badge>
                    </div>
                    <p className="font-medium">{selectedMessage.from}</p>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">À:</span>
                      <Badge variant="outline">{selectedMessage.toRole}</Badge>
                    </div>
                    <p className="font-medium">{selectedMessage.to}</p>
                  </div>
                  
                  <div>
                    <span className="text-sm text-gray-600">Objet:</span>
                    <p className="font-medium">{selectedMessage.subject}</p>
                  </div>
                  
                  <div>
                    <span className="text-sm text-gray-600">Date:</span>
                    <p className="font-medium">
                      {new Date(selectedMessage.date).toLocaleString()}
                    </p>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <p className="text-gray-900 whitespace-pre-wrap">{selectedMessage.message}</p>
                  </div>
                  
                  <div className="flex space-x-2 pt-4">
                    <Button size="sm" className="flex-1" data-testid={`button-reply-${selectedMessage.id}`}>
                      <Reply className="w-4 h-4 mr-2" />
                      {t?.actions?.reply}
                    </Button>
                    <Button variant="outline" size="sm" data-testid={`button-forward-${selectedMessage.id}`}>
                      <Forward className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" data-testid={`button-archive-${selectedMessage.id}`}>
                      <Archive className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => {
                      setSelectedTab('compose');
                      // Logic pour nouveau message parent
                    }}
                    data-testid="button-compose-parent-message"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Nouveau message parent
                  </Button>
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => {
                      setSelectedTab('compose');
                      // Logic pour annonce classe
                    }}
                    data-testid="button-compose-class-announcement"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Annonce classe
                  </Button>
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => {
                      setSelectedTab('compose');
                      // Logic pour message collègue
                    }}
                    data-testid="button-compose-colleague-message"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Message collègue
                  </Button>
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => {
                      setSelectedTab('compose');
                      // Logic pour rapport direction
                    }}
                    data-testid="button-compose-director-report"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Rapport direction
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FunctionalTeacherCommunications;