import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Plus, MessageCircle, CheckCircle, Clock, X, Search, Users, BookOpen, GraduationCap, User, Heart, Settings } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface Connection {
  id: number;
  connectionStatus: string;
  connectionType: string;
  lastContact?: string;
  unreadMessages: number;
  isOnline: boolean;
  // Teacher-Student specific
  teacherId?: number;
  studentId?: number;
  teacherName?: string;
  studentName?: string;
  subjectArea?: string;
  classContext?: string;
  // Student-Parent specific
  parentId?: number;
  parentName?: string;
  relationshipType?: string;
  emergencyContactPriority?: number;
}

interface Message {
  id: number;
  connectionId: number;
  senderId: number;
  senderName: string;
  senderType: string;
  message: string;
  messageType: string;
  isRead: boolean;
  createdAt: string;
  gradeDetails?: any;
  homeworkDetails?: any;
  academicContext?: any;
  permissionDetails?: any;
}

export default function EducationalConnections() {
  const [activeTab, setActiveTab] = useState('teacher-student');
  const [newConnectionDialogOpen, setNewConnectionDialogOpen] = useState(false);
  const [messagesDialogOpen, setMessagesDialogOpen] = useState(false);
  const [selectedConnection, setSelectedConnection] = useState<Connection | null>(null);
  const [searchValue, setSearchValue] = useState('');
  const [searchType, setSearchType] = useState('email');
  const [connectionFormData, setConnectionFormData] = useState<any>({});
  const [messageText, setMessageText] = useState('');
  const [messageType, setMessageType] = useState('text');
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Déterminer l'endpoint basé sur l'onglet actif
  const getConnectionsEndpoint = () => {
    return activeTab === 'teacher-student' ? '/api/teacher-student/connections' : '/api/student-parent/connections';
  };

  // Récupérer les connexions
  const { data: connectionsResponse, isLoading: connectionsLoading, error: connectionsError } = useQuery({
    queryKey: ['connections', activeTab],
    queryFn: async () => {
      const response = await fetch(getConnectionsEndpoint());
      if (!response.ok) {
        throw new Error('Authentification requise');
      }
      return response.json();
    },
    retry: false
  });

  const connections = connectionsResponse?.data || [];

  // Récupérer les messages d'une connexion
  const { data: messagesResponse, isLoading: messagesLoading } = useQuery({
    queryKey: ['messages', activeTab, selectedConnection?.id],
    queryFn: () => {
      if (!selectedConnection) return { data: [] };
      const endpoint = activeTab === 'teacher-student' 
        ? `/api/teacher-student/messages/${selectedConnection.id}`
        : `/api/student-parent/messages/${selectedConnection.id}`;
      return fetch(endpoint).then(res => res.json());
    },
    enabled: !!selectedConnection
  });

  const messages = messagesResponse?.data || [];

  // Rechercher des utilisateurs
  const searchUsersMutation = useMutation({
    mutationFn: async (data: { searchValue: string; searchType: string }) => {
      const endpoint = activeTab === 'teacher-student' 
        ? '/api/teacher-student/search-students'
        : '/api/student-parent/search-parents';
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la recherche');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      console.log('Utilisateurs trouvés:', data.users);
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur de recherche',
        description: error.message || 'Impossible de rechercher les utilisateurs',
        variant: 'destructive'
      });
    }
  });

  // Créer une nouvelle connexion
  const createConnectionMutation = useMutation({
    mutationFn: async (data: any) => {
      const endpoint = activeTab === 'teacher-student' 
        ? '/api/teacher-student/connections'
        : '/api/student-parent/connections';
        
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Impossible de créer la connexion');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Connexion créée',
        description: 'Demande de connexion envoyée avec succès'
      });
      setNewConnectionDialogOpen(false);
      setConnectionFormData({});
      setSearchValue('');
      queryClient.invalidateQueries({ queryKey: ['connections', activeTab] });
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur de connexion',
        description: error.message || 'Impossible de créer la connexion',
        variant: 'destructive'
      });
    }
  });

  // Approuver une connexion
  const approveConnectionMutation = useMutation({
    mutationFn: async (connectionId: number) => {
      const endpoint = activeTab === 'teacher-student' 
        ? `/api/teacher-student/connections/${connectionId}/approve`
        : `/api/student-parent/connections/${connectionId}/approve`;
        
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Impossible d\'approuver la connexion');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Connexion approuvée',
        description: 'La connexion a été approuvée avec succès'
      });
      queryClient.invalidateQueries({ queryKey: ['connections', activeTab] });
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur d\'approbation',
        description: error.message || 'Impossible d\'approuver la connexion',
        variant: 'destructive'
      });
    }
  });

  // Envoyer un message
  const sendMessageMutation = useMutation({
    mutationFn: async (data: any) => {
      const endpoint = activeTab === 'teacher-student' 
        ? '/api/teacher-student/messages'
        : '/api/student-parent/messages';
        
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Impossible d\'envoyer le message');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Message envoyé',
        description: 'Votre message a été envoyé avec succès'
      });
      setMessageText('');
      queryClient.invalidateQueries({ queryKey: ['messages', activeTab, selectedConnection?.id] });
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur d\'envoi',
        description: error.message || 'Impossible d\'envoyer le message',
        variant: 'destructive'
      });
    }
  });

  const handleSearch = () => {
    if (!searchValue.trim()) {
      toast({
        title: 'Recherche vide',
        description: 'Veuillez saisir un email ou numéro de téléphone',
        variant: 'destructive'
      });
      return;
    }
    
    // Validation du format email
    if (searchType === 'email' && !searchValue.includes('@')) {
      toast({
        title: 'Format email invalide',
        description: 'Veuillez saisir une adresse email valide',
        variant: 'destructive'
      });
      return;
    }
    
    // Validation du format téléphone
    if (searchType === 'phone' && searchValue.length < 10) {
      toast({
        title: 'Format téléphone invalide',
        description: 'Veuillez saisir un numéro de téléphone valide',
        variant: 'destructive'
      });
      return;
    }
    
    searchUsersMutation.mutate({ searchValue, searchType });
  };

  const handleCreateConnection = () => {
    // Validation des champs requis
    if (activeTab === 'teacher-student' && !connectionFormData.subjectArea) {
      toast({
        title: 'Matière requise',
        description: 'Veuillez indiquer la matière pour cette connexion éducative',
        variant: 'destructive'
      });
      return;
    }
    
    if (activeTab === 'student-parent' && !connectionFormData.relationshipType) {
      toast({
        title: 'Relation requise',
        description: 'Veuillez indiquer votre relation avec ce parent',
        variant: 'destructive'
      });
      return;
    }
    
    const data = {
      ...connectionFormData,
      [`${activeTab === 'teacher-student' ? 'student' : 'parent'}${searchType === 'email' ? 'Email' : 'Phone'}`]: searchValue
    };
    createConnectionMutation.mutate(data);
  };

  const handleSendMessage = () => {
    if (!messageText.trim() || !selectedConnection) return;
    
    const data = {
      connectionId: selectedConnection.id,
      message: messageText,
      messageType
    };
    sendMessageMutation.mutate(data);
  };

  const getConnectionStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'inactive': return 'bg-gray-500';
      case 'blocked': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getConnectionIcon = (type: string) => {
    switch (type) {
      case 'educational': return <BookOpen className="h-4 w-4" />;
      case 'tutoring': return <GraduationCap className="h-4 w-4" />;
      case 'guardian': return <Heart className="h-4 w-4" />;
      case 'tutor': return <User className="h-4 w-4" />;
      default: return <Users className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Connexions Éducatives</h1>
            <p className="text-gray-600 mt-2">
              Gérez vos connexions directes avec les enseignants, élèves et parents
            </p>
          </div>
          <Dialog open={newConnectionDialogOpen} onOpenChange={setNewConnectionDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700" data-testid="button-new-connection">
                <Plus className="h-4 w-4 mr-2" />
                Nouvelle Connexion
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Créer une Nouvelle Connexion</DialogTitle>
                <DialogDescription>
                  {activeTab === 'teacher-student' 
                    ? 'Recherchez un élève pour créer une connexion éducative'
                    : 'Recherchez un parent pour créer une connexion familiale'
                  }
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Select value={searchType} onValueChange={setSearchType}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="phone">Téléphone</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder={searchType === 'email' ? 'email@exemple.com' : '+237 6XX XXX XXX'}
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    className="flex-1"
                    data-testid="input-search-user"
                  />
                  <Button
                    onClick={handleSearch}
                    disabled={searchUsersMutation.isPending}
                    data-testid="button-search-user"
                  >
                    {searchUsersMutation.isPending ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                {activeTab === 'teacher-student' && (
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="subjectArea">Matière *</Label>
                      <Input
                        id="subjectArea"
                        placeholder="Mathématiques, Français, Sciences..."
                        value={connectionFormData.subjectArea || ''}
                        onChange={(e) => setConnectionFormData({...connectionFormData, subjectArea: e.target.value})}
                        data-testid="input-subject-area"
                      />
                    </div>
                    <div>
                      <Label htmlFor="classContext">Classe (optionnel)</Label>
                      <Input
                        id="classContext"
                        placeholder="6ème A, CM2, etc."
                        value={connectionFormData.classContext || ''}
                        onChange={(e) => setConnectionFormData({...connectionFormData, classContext: e.target.value})}
                        data-testid="input-class-context"
                      />
                    </div>
                    <div>
                      <Label htmlFor="connectionType">Type de Connexion</Label>
                      <Select 
                        value={connectionFormData.connectionType || 'educational'} 
                        onValueChange={(value) => setConnectionFormData({...connectionFormData, connectionType: value})}
                      >
                        <SelectTrigger data-testid="select-connection-type">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="educational">Éducative</SelectItem>
                          <SelectItem value="tutoring">Soutien Scolaire</SelectItem>
                          <SelectItem value="mentoring">Mentorat</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {activeTab === 'student-parent' && (
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="relationshipType">Relation *</Label>
                      <Select 
                        value={connectionFormData.relationshipType || ''} 
                        onValueChange={(value) => setConnectionFormData({...connectionFormData, relationshipType: value})}
                      >
                        <SelectTrigger data-testid="select-relationship-type">
                          <SelectValue placeholder="Choisir la relation" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mother">Mère</SelectItem>
                          <SelectItem value="father">Père</SelectItem>
                          <SelectItem value="guardian">Tuteur légal</SelectItem>
                          <SelectItem value="grandparent">Grand-parent</SelectItem>
                          <SelectItem value="uncle">Oncle</SelectItem>
                          <SelectItem value="aunt">Tante</SelectItem>
                          <SelectItem value="tutor">Répétiteur</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="connectionType">Type de Connexion</Label>
                      <Select 
                        value={connectionFormData.connectionType || 'guardian'} 
                        onValueChange={(value) => setConnectionFormData({...connectionFormData, connectionType: value})}
                      >
                        <SelectTrigger data-testid="select-parent-connection-type">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="guardian">Tuteur</SelectItem>
                          <SelectItem value="tutor">Répétiteur</SelectItem>
                          <SelectItem value="relative">Famille</SelectItem>
                          <SelectItem value="emergency_contact">Contact d'urgence</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="emergencyPriority">Priorité d'urgence</Label>
                      <Select 
                        value={connectionFormData.emergencyContactPriority?.toString() || '1'} 
                        onValueChange={(value) => setConnectionFormData({...connectionFormData, emergencyContactPriority: parseInt(value)})}
                      >
                        <SelectTrigger data-testid="select-emergency-priority">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 - Principal</SelectItem>
                          <SelectItem value="2">2 - Secondaire</SelectItem>
                          <SelectItem value="3">3 - Tertiaire</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setNewConnectionDialogOpen(false)}>
                  Annuler
                </Button>
                <Button 
                  onClick={handleCreateConnection} 
                  disabled={createConnectionMutation.isPending || !searchValue.trim()}
                  data-testid="button-create-connection"
                >
                  Créer la Connexion
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="teacher-student" className="flex items-center gap-2" data-testid="tab-teacher-student">
              <BookOpen className="h-4 w-4" />
              Enseignant-Élève
            </TabsTrigger>
            <TabsTrigger value="student-parent" className="flex items-center gap-2" data-testid="tab-student-parent">
              <Heart className="h-4 w-4" />
              Élève-Parent
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab} className="mt-6">
            {connectionsError ? (
              <Card className="text-center py-12">
                <CardContent>
                  <X className="h-12 w-12 text-red-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Authentification requise
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Vous devez être connecté pour accéder aux connexions éducatives
                  </p>
                  <Button onClick={() => window.location.href = '/login'} data-testid="button-login-redirect">
                    Se connecter
                  </Button>
                </CardContent>
              </Card>
            ) : connectionsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-4">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {connections.map((connection: Connection) => (
                  <Card key={connection.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src="/api/placeholder/avatar" />
                            <AvatarFallback>
                              {(connection.teacherName || connection.studentName || connection.parentName || 'U').charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-sm font-medium">
                              {connection.teacherName || connection.studentName || connection.parentName}
                            </CardTitle>
                            <CardDescription className="text-xs">
                              {connection.subjectArea || connection.relationshipType}
                              {connection.classContext && ` • ${connection.classContext}`}
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getConnectionIcon(connection.connectionType)}
                          <div className={`w-2 h-2 rounded-full ${getConnectionStatusColor(connection.connectionStatus)}`}></div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center justify-between mb-3">
                        <Badge variant={connection.connectionStatus === 'active' ? 'default' : 'secondary'}>
                          {connection.connectionStatus === 'active' ? 'Actif' : 
                           connection.connectionStatus === 'pending' ? 'En attente' : 
                           connection.connectionStatus}
                        </Badge>
                        {connection.isOnline && (
                          <Badge variant="outline" className="text-green-600 border-green-600">
                            En ligne
                          </Badge>
                        )}
                      </div>
                      
                      {connection.lastContact && (
                        <p className="text-xs text-gray-500 mb-3">
                          Dernier contact: {connection.lastContact}
                        </p>
                      )}

                      <div className="flex gap-2">
                        {connection.connectionStatus === 'pending' && (
                          <Button
                            size="sm"
                            onClick={() => approveConnectionMutation.mutate(connection.id)}
                            disabled={approveConnectionMutation.isPending}
                            className="flex-1"
                            data-testid={`button-approve-${connection.id}`}
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Approuver
                          </Button>
                        )}
                        
                        {connection.connectionStatus === 'active' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedConnection(connection);
                              setMessagesDialogOpen(true);
                            }}
                            className="flex-1"
                            data-testid={`button-messages-${connection.id}`}
                          >
                            <MessageCircle className="h-3 w-3 mr-1" />
                            Messages
                            {connection.unreadMessages > 0 && (
                              <Badge variant="destructive" className="ml-2 px-1 py-0 text-xs">
                                {connection.unreadMessages}
                              </Badge>
                            )}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {!connectionsLoading && connections.length === 0 && (
              <Card className="text-center py-12">
                <CardContent>
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Aucune connexion trouvée
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Commencez par créer votre première connexion éducative
                  </p>
                  <Button onClick={() => setNewConnectionDialogOpen(true)} data-testid="button-first-connection">
                    <Plus className="h-4 w-4 mr-2" />
                    Créer une Connexion
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Dialog des messages */}
        <Dialog open={messagesDialogOpen} onOpenChange={setMessagesDialogOpen}>
          <DialogContent className="sm:max-w-2xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Messages avec {selectedConnection?.teacherName || selectedConnection?.studentName || selectedConnection?.parentName}
              </DialogTitle>
              <DialogDescription>
                {selectedConnection?.subjectArea && `Matière: ${selectedConnection.subjectArea}`}
                {selectedConnection?.relationshipType && `Relation: ${selectedConnection.relationshipType}`}
              </DialogDescription>
            </DialogHeader>
            
            <div className="flex flex-col h-96">
              <div className="flex-1 overflow-y-auto space-y-3 p-4 border rounded-lg bg-gray-50">
                {messagesLoading ? (
                  <div className="text-center text-gray-500">Chargement des messages...</div>
                ) : messages.length === 0 ? (
                  <div className="text-center text-gray-500">Aucun message</div>
                ) : (
                  messages.map((message: Message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.senderType === 'teacher' || message.senderType === 'student' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-xs px-3 py-2 rounded-lg ${
                        message.senderType === 'teacher' || message.senderType === 'student' 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-white border'
                      }`}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium">{message.senderName}</span>
                          {message.messageType !== 'text' && (
                            <Badge variant="outline" className="text-xs">
                              {message.messageType}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm">{message.message}</p>
                        {message.gradeDetails && (
                          <div className="mt-2 p-2 bg-green-100 rounded text-xs">
                            <p><strong>Note:</strong> {message.gradeDetails.grade}/{message.gradeDetails.maxGrade}</p>
                            <p><strong>Commentaire:</strong> {message.gradeDetails.feedback}</p>
                          </div>
                        )}
                        <span className="text-xs opacity-75">
                          {new Date(message.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              <div className="mt-4 space-y-3">
                <div className="flex gap-2">
                  <Select value={messageType} onValueChange={setMessageType}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Texte</SelectItem>
                      {activeTab === 'teacher-student' && (
                        <>
                          <SelectItem value="homework">Devoir</SelectItem>
                          <SelectItem value="grade_feedback">Note</SelectItem>
                        </>
                      )}
                      {activeTab === 'student-parent' && (
                        <>
                          <SelectItem value="academic_update">Résultats</SelectItem>
                          <SelectItem value="permission_request">Permission</SelectItem>
                          <SelectItem value="emergency">Urgence</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Tapez votre message..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    className="flex-1"
                    rows={2}
                    data-testid="textarea-message"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!messageText.trim() || sendMessageMutation.isPending}
                    data-testid="button-send-message"
                  >
                    Envoyer
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}