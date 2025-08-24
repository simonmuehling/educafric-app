import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  MessageCircle, Users, Send, 
  Plus, Heart, Shield, Lock, MapPin, Camera,
  UserPlus, Clock, CheckCheck, Mail, Phone
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface FamilyConnection {
  id: number;
  parentId: number;
  childId: number;
  childName: string;
  childPhoto: string;
  connectionStatus: 'active' | 'pending' | 'inactive';
  lastContact: string;
  unreadMessages: number;
  isOnline: boolean;
}

interface FamilyMessage {
  id: number;
  connectionId: number;
  senderId: number;
  senderName: string;
  senderType: 'parent' | 'child';
  message: string;
  messageType: 'text' | 'image' | 'location' | 'audio';
  timestamp: string;
  isRead: boolean;
  isEncrypted: boolean;
}

const FamilyConnections: React.FC = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedConnection, setSelectedConnection] = useState<number | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [showAddConnection, setShowAddConnection] = useState(false);
  const [childEmailOrPhone, setChildEmailOrPhone] = useState('');
  const [searchType, setSearchType] = useState<'email' | 'phone'>('email');
  const [searchSuggestions, setSearchSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Fetch family connections
  const { data: connectionsResponse, isLoading: connectionsLoading } = useQuery({
    queryKey: ['/api/family/connections'],
    queryFn: async () => {
      const response = await fetch('/api/family/connections', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch family connections');
      return response.json();
    },
    enabled: !!user
  });

  const connections = connectionsResponse?.connections || [];

  // Fetch messages for selected connection
  const { data: messages = [], isLoading: messagesLoading } = useQuery<FamilyMessage[]>({
    queryKey: ['/api/family/messages', selectedConnection],
    queryFn: async () => {
      const response = await fetch(`/api/family/messages/${selectedConnection}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch messages');
      return response.json();
    },
    enabled: !!selectedConnection
  });

  // Search for users by phone/email
  const searchUsersMutation = useMutation({
    mutationFn: async (data: { searchValue: string; searchType: 'email' | 'phone' }) => {
      const response = await apiRequest('POST', '/api/family/search-users', data);
      return response.json();
    },
    onSuccess: (data: any) => {
      setSearchSuggestions(data.users || []);
      setShowSuggestions(true);
    },
    onError: () => {
      setSearchSuggestions([]);
      setShowSuggestions(false);
    }
  });

  // Create new connection mutation
  const createConnectionMutation = useMutation({
    mutationFn: async (data: { childEmail?: string; childPhone?: string }) => {
      const response = await apiRequest('POST', '/api/family/connections', data);
      return response.json();
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['/api/family/connections'] });
      setChildEmailOrPhone('');
      setSearchSuggestions([]);
      setShowSuggestions(false);
      setShowAddConnection(false);
      toast({
        title: 'Connexion créée',
        description: data.message
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de créer la connexion',
        variant: 'destructive'
      });
    }
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (data: { connectionId: number; message: string; messageType: string }) => {
      const response = await apiRequest('POST', '/api/family/messages', data);
      return response.json();
    },
    onSuccess: () => {
      setNewMessage('');
      queryClient.invalidateQueries({ queryKey: ['/api/family/messages', selectedConnection] });
      toast({
        title: 'Message envoyé',
        description: 'Votre message a été envoyé avec succès'
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible d\'envoyer le message',
        variant: 'destructive'
      });
    }
  });

  // Handle input change and trigger search
  const handleInputChange = (value: string) => {
    setChildEmailOrPhone(value);
    setShowSuggestions(false);
    
    // Auto-search when complete phone number or email is entered
    if (searchType === 'phone' && value.length >= 10) {
      // Search when phone number is complete (10+ digits)
      searchUsersMutation.mutate({
        searchValue: value,
        searchType: 'phone'
      });
    } else if (searchType === 'email' && value.includes('@') && value.includes('.') && value.length > 5) {
      // Search when email looks complete (has @ and . and reasonable length)
      searchUsersMutation.mutate({
        searchValue: value,
        searchType: 'email'
      });
    }
  };

  const handleSelectSuggestion = (user: any) => {
    const data = searchType === 'email' 
      ? { childEmail: user.email }
      : { childPhone: user.phone };
    
    createConnectionMutation.mutate(data);
  };

  const handleCreateConnection = () => {
    if (!childEmailOrPhone.trim()) {
      toast({
        title: searchType === 'email' ? 'Email requis' : 'Téléphone requis',
        description: searchType === 'email' 
          ? 'Veuillez saisir l\'email de votre enfant'
          : 'Veuillez saisir le numéro de téléphone de votre enfant',
        variant: 'destructive'
      });
      return;
    }

    const data = searchType === 'email' 
      ? { childEmail: childEmailOrPhone }
      : { childPhone: childEmailOrPhone };
    
    createConnectionMutation.mutate(data);
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConnection) return;
    
    sendMessageMutation.mutate({
      connectionId: selectedConnection,
      message: newMessage,
      messageType: 'text'
    });
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const text = {
    fr: {
      title: 'Connexions Familiales',
      subtitle: 'Communication directe avec vos enfants',
      addConnection: 'Nouvelle connexion',
      childEmail: 'Email de votre enfant',
      childPhone: 'Téléphone de votre enfant',
      searchBy: 'Rechercher par',
      email: 'Email',
      phone: 'Téléphone',
      create: 'Créer',
      cancel: 'Annuler',
      noConnections: 'Aucune connexion',
      noConnectionsDesc: 'Ajoutez vos enfants pour communiquer directement',
      selectChild: 'Sélectionnez un enfant',
      typeMessage: 'Tapez votre message...',
      send: 'Envoyer',
      online: 'En ligne',
      offline: 'Hors ligne',
      lastSeen: 'Vu',
      pending: 'En attente',
      active: 'Actif',
      unreadMessages: 'messages non lus'
    },
    en: {
      title: 'Family Connections',
      subtitle: 'Direct communication with your children',
      addConnection: 'New connection',
      childEmail: 'Your child\'s email',
      childPhone: 'Your child\'s phone',
      searchBy: 'Search by',
      email: 'Email',
      phone: 'Phone',
      create: 'Create',
      cancel: 'Cancel',
      noConnections: 'No connections',
      noConnectionsDesc: 'Add your children to communicate directly',
      selectChild: 'Select a child',
      typeMessage: 'Type your message...',
      send: 'Send',
      online: 'Online',
      offline: 'Offline',
      lastSeen: 'Last seen',
      pending: 'Pending',
      active: 'Active',
      unreadMessages: 'unread messages'
    }
  };

  const t = text[language as keyof typeof text] || text.fr;

  if (connectionsLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse bg-gray-200 h-32 rounded-lg"></div>
        <div className="animate-pulse bg-gray-200 h-64 rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white p-6 rounded-xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-3">
              <Heart className="w-8 h-8" />
              {t.title}
            </h1>
            <p className="text-pink-100 mt-2">{t.subtitle}</p>
          </div>
          <Button 
            onClick={() => setShowAddConnection(true)}
            className="bg-white/20 hover:bg-white/30 text-white border-white/30"
            size="sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            {t.addConnection}
          </Button>
        </div>
      </div>

      {/* Add Connection Modal */}
      {showAddConnection && (
        <Card className="border-2 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-purple-600" />
              {t.addConnection}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                {t.searchBy}
              </label>
              <div className="flex gap-2 mb-3">
                <Button
                  variant={searchType === 'email' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSearchType('email')}
                  className="flex items-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  {t.email}
                </Button>
                <Button
                  variant={searchType === 'phone' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSearchType('phone')}
                  className="flex items-center gap-2"
                >
                  <Phone className="w-4 h-4" />
                  {t.phone}
                </Button>
              </div>
            </div>
            <div className="relative">
              <label className="block text-sm font-medium mb-2">
                {searchType === 'email' ? t.childEmail : t.childPhone}
              </label>
              <Input
                type={searchType === 'email' ? 'email' : 'tel'}
                value={childEmailOrPhone}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder={searchType === 'email' ? 'enfant@example.com' : '+237 XXX XXX XXX'}
                className="w-full"
              />
              
              {/* Search suggestions dropdown */}
              {showSuggestions && searchSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
                  <div className="px-3 py-2 bg-gray-50 text-sm text-gray-600 border-b">
                    {searchSuggestions.length} étudiant{searchSuggestions.length > 1 ? 's' : ''} trouvé{searchSuggestions.length > 1 ? 's' : ''}
                  </div>
                  {searchSuggestions.map((user, index) => (
                    <div
                      key={index}
                      onClick={() => handleSelectSuggestion(user)}
                      className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                          {user.firstName?.charAt(0) || '?'}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="text-sm text-gray-600">
                            {searchType === 'email' ? user.email : user.phone}
                          </p>
                          {user.schoolName && (
                            <p className="text-xs text-gray-500">
                              École: {user.schoolName}
                            </p>
                          )}
                        </div>
                        <div className="text-xs text-purple-600 font-medium">
                          Cliquer pour ajouter
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* No results message */}
              {showSuggestions && searchSuggestions.length === 0 && !searchUsersMutation.isPending && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg p-3 z-50">
                  <div className="text-sm text-gray-600">
                    Aucun étudiant trouvé avec {searchType === 'email' ? 'cet email' : 'ce numéro'}
                  </div>
                </div>
              )}
              
              {searchUsersMutation.isPending && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg p-3 z-50">
                  <div className="flex items-center gap-2 text-gray-600">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-purple-600 border-t-transparent"></div>
                    Recherche en cours...
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <Button 
                onClick={handleCreateConnection}
                disabled={createConnectionMutation.isPending}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {createConnectionMutation.isPending ? 'En cours...' : t.create}
              </Button>
              <Button 
                variant="outline"
                onClick={() => {
                  setShowAddConnection(false);
                  setChildEmailOrPhone('');
                }}
              >
                {t.cancel}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Connections List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Mes enfants ({connections.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {connections.length === 0 ? (
                <div className="text-center py-8">
                  <Heart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">{t.noConnections}</p>
                  <p className="text-gray-400 text-sm mt-1">{t.noConnectionsDesc}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {connections.map((connection: FamilyConnection) => (
                    <div
                      key={connection.id}
                      onClick={() => setSelectedConnection(connection.id)}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedConnection === connection.id
                          ? 'border-purple-300 bg-purple-50'
                          : 'border-gray-100 hover:border-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold">
                            {connection.childName.charAt(0)}
                          </div>
                          {connection.isOnline && (
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{connection.childName}</p>
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant={connection.connectionStatus === 'active' ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {connection.connectionStatus === 'active' ? t.active : t.pending}
                            </Badge>
                            {connection.unreadMessages > 0 && (
                              <Badge variant="destructive" className="text-xs">
                                {connection.unreadMessages} {t.unreadMessages}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        {t.lastSeen}: {formatTime(connection.lastContact)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Messages Area */}
        <div className="lg:col-span-2">
          <Card className="h-[600px] flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                {selectedConnection 
                  ? connections.find((c: FamilyConnection) => c.id === selectedConnection)?.childName
                  : t.selectChild
                }
              </CardTitle>
            </CardHeader>
            
            {selectedConnection ? (
              <>
                {/* Messages List */}
                <CardContent className="flex-1 overflow-y-auto">
                  {messagesLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="animate-pulse flex gap-3">
                          <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                          <div className="flex-1 bg-gray-200 h-12 rounded-lg"></div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex gap-3 ${
                            message.senderType === 'parent' ? 'justify-end' : 'justify-start'
                          }`}
                        >
                          <div
                            className={`max-w-xs px-4 py-2 rounded-lg ${
                              message.senderType === 'parent'
                                ? 'bg-purple-600 text-white'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            <p>{message.message}</p>
                            <div className="flex items-center justify-between gap-2 mt-1">
                              <span className="text-xs opacity-75">
                                {formatTime(message.timestamp)}
                              </span>
                              {message.senderType === 'parent' && (
                                <CheckCheck 
                                  className={`w-3 h-3 ${
                                    message.isRead ? 'text-blue-300' : 'text-gray-300'
                                  }`} 
                                />
                              )}
                            </div>
                            {message.isEncrypted && (
                              <Lock className="w-3 h-3 opacity-50 mt-1" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>

                {/* Message Input */}
                <div className="border-t p-4">
                  <div className="flex gap-3">
                    <Textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder={t.typeMessage}
                      className="flex-1 min-h-0 resize-none"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                    />
                    <div className="flex flex-col gap-2">
                      <Button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim() || sendMessageMutation.isPending}
                        size="sm"
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Camera className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <MapPin className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <CardContent className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">{t.selectChild}</p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </div>

      {/* Security Info */}
      <Card className="border-purple-200 bg-purple-50">
        <CardContent className="flex items-center gap-3 p-4">
          <Shield className="w-5 h-5 text-purple-600" />
          <div>
            <p className="text-sm font-medium text-purple-800">
              Communication sécurisée end-to-end
            </p>
            <p className="text-xs text-purple-600">
              Vos messages sont chiffrés et protégés
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FamilyConnections;