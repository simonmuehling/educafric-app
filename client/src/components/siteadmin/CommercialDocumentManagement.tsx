import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { FileText, Edit, Send, Eye, Download, Plus, CheckCircle, Clock, Mail, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface CommercialDocument {
  id: number;
  userId: number;
  originalTemplateId?: string;
  title: string;
  content: string;
  type: 'contract' | 'proposal' | 'quote' | 'brochure';
  status: 'draft' | 'finalized' | 'sent' | 'signed';
  language: string;
  clientInfo?: {
    name: string;
    email: string;
    phone?: string;
    institution?: string;
    address?: string;
  };
  metadata?: {
    signatures?: Array<{
      signerId: number;
      signerName: string;
      timestamp: string;
      hash?: string;
    }>;
    timestamps?: {
      draft?: string;
      finalized?: string;
      sent?: string;
      signed?: string;
    };
    sendDetails?: {
      recipientEmail: string;
      subject: string;
      message: string;
      sentBy: number;
    };
  };
  createdAt: string;
  updatedAt: string;
}

interface CreateDocumentData {
  title: string;
  content: string;
  type: string;
  language: string;
  clientInfo?: {
    name: string;
    email: string;
    phone?: string;
    institution?: string;
    address?: string;
  };
}

const CommercialDocumentManagement: React.FC = () => {
  const [selectedDocument, setSelectedDocument] = useState<CommercialDocument | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isSendDialogOpen, setIsSendDialogOpen] = useState(false);
  const [documentToSend, setDocumentToSend] = useState<CommercialDocument | null>(null);
  const [createForm, setCreateForm] = useState<CreateDocumentData>({
    title: '',
    content: '',
    type: 'proposal',
    language: 'fr',
    clientInfo: {
      name: '',
      email: '',
      phone: '',
      institution: '',
      address: ''
    }
  });
  const [sendForm, setSendForm] = useState({
    recipientEmail: '',
    subject: '',
    message: ''
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query pour récupérer tous les documents commerciaux
  const { data: documents = [], isLoading } = useQuery({
    queryKey: ['/api/commercial/documents'],
    queryFn: () => apiRequest('/api/commercial/documents'),
  });

  // Mutation pour créer un nouveau document
  const createDocumentMutation = useMutation({
    mutationFn: async (data: CreateDocumentData) => {
      // Simulation de création de document
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { 
        id: Date.now(), 
        ...data, 
        userId: 1, 
        status: 'draft', 
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/commercial/documents'] });
      setIsCreateDialogOpen(false);
      setCreateForm({
        title: '',
        content: '',
        type: 'proposal',
        language: 'fr',
        clientInfo: { name: '', email: '', phone: '', institution: '', address: '' }
      });
      toast({
        title: "Document créé",
        description: "Le document commercial a été créé avec succès.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de créer le document.",
        variant: "destructive",
      });
    },
  });

  // Mutation pour envoyer un document
  const sendDocumentMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => 
      apiRequest(`/api/commercial-documents/${id}/send`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/commercial/documents'] });
      setIsSendDialogOpen(false);
      setSendForm({ recipientEmail: '', subject: '', message: '' });
      toast({
        title: "Document envoyé",
        description: "Le document a été envoyé par email avec succès.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur d'envoi",
        description: "Impossible d'envoyer le document.",
        variant: "destructive",
      });
    },
  });

  // Mutation pour signer un document
  const signDocumentMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => 
      apiRequest(`/api/commercial-documents/${id}/sign`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/commercial/documents'] });
      toast({
        title: "Document signé",
        description: "Le document a été signé avec succès.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur de signature",
        description: "Impossible de signer le document.",
        variant: "destructive",
      });
    },
  });

  const handleCreateDocument = () => {
    if (!createForm.title || !createForm.content || !createForm.type) {
      toast({
        title: "Champs requis",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive",
      });
      return;
    }

    createDocumentMutation.mutate(createForm);
  };

  const handleSendDocument = () => {
    if (!sendForm.recipientEmail || !documentToSend) {
      toast({
        title: "Email requis",
        description: "Veuillez saisir l'email du destinataire.",
        variant: "destructive",
      });
      return;
    }

    sendDocumentMutation.mutate({
      id: documentToSend.id,
      data: sendForm
    });
  };

  const handleSignDocument = (document: CommercialDocument) => {
    signDocumentMutation.mutate({
      id: document.id,
      data: {
        signerName: "Site Admin",
        hash: `sign_${Date.now()}`
      }
    });
  };

  const openSendDialog = (document: CommercialDocument) => {
    setDocumentToSend(document);
    setSendForm({
      recipientEmail: document.clientInfo?.email || '',
      subject: `Document Commercial: ${document.title}`,
      message: `Veuillez trouver ci-joint le document commercial "${document.title}".`
    });
    setIsSendDialogOpen(true);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'draft': return 'secondary';
      case 'finalized': return 'default';
      case 'sent': return 'outline';
      case 'signed': return 'default';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return <Edit className="w-4 h-4" />;
      case 'finalized': return <CheckCircle className="w-4 h-4" />;
      case 'sent': return <Mail className="w-4 h-4" />;
      case 'signed': return <CheckCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'contract': return 'Contrat';
      case 'proposal': return 'Proposition';
      case 'quote': return 'Devis';
      case 'brochure': return 'Brochure';
      default: return type;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des documents commerciaux...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestion Documents Commerciaux</h2>
          <p className="text-gray-600">
            Gérez les contrats, propositions, devis et brochures commerciales
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Nouveau Document
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-white">
            <DialogHeader>
              <DialogTitle>Créer un Nouveau Document Commercial</DialogTitle>
              <DialogDescription>
                Créez un nouveau document commercial pour vos clients.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Titre du Document *</Label>
                  <Input
                    id="title"
                    value={createForm.title}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, title: e?.target?.value }))}
                    placeholder="Ex: Proposition commerciale École Excellence"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Type de Document *</Label>
                  <Select
                    value={createForm.type}
                    onValueChange={(value) => setCreateForm(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="proposal">Proposition Commerciale</SelectItem>
                      <SelectItem value="contract">Contrat</SelectItem>
                      <SelectItem value="quote">Devis</SelectItem>
                      <SelectItem value="brochure">Brochure</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="language">Langue</Label>
                  <Select
                    value={createForm.language}
                    onValueChange={(value) => setCreateForm(prev => ({ ...prev, language: value }))}
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

              {/* Informations Client */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Informations Client</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="clientName">Nom du Client</Label>
                    <Input
                      id="clientName"
                      value={createForm.clientInfo?.name || ''}
                      onChange={(e) => setCreateForm(prev => ({
                        ...prev,
                        clientInfo: { ...prev.clientInfo!, name: e?.target?.value }
                      }))}
                      placeholder="Nom de l'institution ou contact"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="clientEmail">Email Client</Label>
                    <Input
                      id="clientEmail"
                      type="email"
                      value={createForm.clientInfo?.email || ''}
                      onChange={(e) => setCreateForm(prev => ({
                        ...prev,
                        clientInfo: { ...prev.clientInfo!, email: e?.target?.value }
                      }))}
                      placeholder="email@institution.com"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="clientPhone">Téléphone</Label>
                    <Input
                      id="clientPhone"
                      value={createForm.clientInfo?.phone || ''}
                      onChange={(e) => setCreateForm(prev => ({
                        ...prev,
                        clientInfo: { ...prev.clientInfo!, phone: e?.target?.value }
                      }))}
                      placeholder="+237 6XX XXX XXX"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="clientInstitution">Institution</Label>
                    <Input
                      id="clientInstitution"
                      value={createForm.clientInfo?.institution || ''}
                      onChange={(e) => setCreateForm(prev => ({
                        ...prev,
                        clientInfo: { ...prev.clientInfo!, institution: e?.target?.value }
                      }))}
                      placeholder="École, Ministère, etc."
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Contenu du Document *</Label>
                <Textarea
                  id="content"
                  value={createForm.content}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, content: e?.target?.value }))}
                  placeholder="Rédigez le contenu du document commercial..."
                  rows={10}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Annuler
              </Button>
              <Button 
                onClick={handleCreateDocument}
                disabled={createDocumentMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {createDocumentMutation.isPending ? 'Création...' : 'Créer Document'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(Array.isArray(documents) ? documents.length : 0)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Brouillons</CardTitle>
            <Edit className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(Array.isArray(documents) ? documents : []).filter(doc => doc.status === 'draft').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Envoyés</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(Array.isArray(documents) ? documents : []).filter(doc => doc.status === 'sent').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Signés</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(Array.isArray(documents) ? documents : []).filter(doc => doc.status === 'signed').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table des documents */}
      <Card>
        <CardHeader>
          <CardTitle>Documents Commerciaux</CardTitle>
          <CardDescription>
            Liste de tous les documents commerciaux créés dans la plateforme
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Titre</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Créé le</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(Array.isArray(documents) ? documents : []).map((document) => (
                <TableRow key={document.id}>
                  <TableCell className="font-medium">{document.title}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {getTypeLabel(document.type)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{document.clientInfo?.name || 'N/A'}</div>
                      <div className="text-sm text-gray-500">{document.clientInfo?.email || ''}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(document.status)} className="flex items-center gap-1 w-fit">
                      {getStatusIcon(document.status)}
                      {document.status === 'draft' && 'Brouillon'}
                      {document.status === 'finalized' && 'Finalisé'}
                      {document.status === 'sent' && 'Envoyé'}
                      {document.status === 'signed' && 'Signé'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(document.createdAt).toLocaleDateString('fr-FR')}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedDocument(document)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      {document.status !== 'sent' && document.status !== 'signed' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openSendDialog(document)}
                        >
                          <Send className="w-4 h-4" />
                        </Button>
                      )}
                      {document.status === 'sent' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleSignDocument(document)}
                          disabled={signDocumentMutation.isPending}
                        >
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {(Array.isArray(documents) ? documents.length : 0) === 0 && (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun document</h3>
              <p className="text-gray-500">Créez votre premier document commercial.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog d'envoi de document */}
      <Dialog open={isSendDialogOpen} onOpenChange={setIsSendDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Envoyer le Document</DialogTitle>
            <DialogDescription>
              Envoyez le document "{documentToSend?.title}" par email.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="recipientEmail">Email du destinataire *</Label>
              <Input
                id="recipientEmail"
                type="email"
                value={sendForm.recipientEmail}
                onChange={(e) => setSendForm(prev => ({ ...prev, recipientEmail: e?.target?.value }))}
                placeholder="destinataire@email.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject">Sujet de l'email</Label>
              <Input
                id="subject"
                value={sendForm.subject}
                onChange={(e) => setSendForm(prev => ({ ...prev, subject: e?.target?.value }))}
                placeholder="Sujet de l'email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message personnalisé</Label>
              <Textarea
                id="message"
                value={sendForm.message}
                onChange={(e) => setSendForm(prev => ({ ...prev, message: e?.target?.value }))}
                placeholder="Message d'accompagnement..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSendDialogOpen(false)}>
              Annuler
            </Button>
            <Button 
              onClick={handleSendDocument}
              disabled={sendDocumentMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {sendDocumentMutation.isPending ? 'Envoi...' : 'Envoyer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de visualisation de document */}
      <Dialog open={!!selectedDocument} onOpenChange={() => setSelectedDocument(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedDocument?.title}</DialogTitle>
            <DialogDescription>
              Document {getTypeLabel(selectedDocument?.type || '')} - {selectedDocument?.language === 'fr' ? 'Français' : 'English'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedDocument?.clientInfo && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Informations Client</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Nom:</span> {selectedDocument?.clientInfo?.name}
                  </div>
                  <div>
                    <span className="font-medium">Email:</span> {selectedDocument?.clientInfo?.email}
                  </div>
                  {selectedDocument?.clientInfo?.phone && (
                    <div>
                      <span className="font-medium">Téléphone:</span> {selectedDocument?.clientInfo?.phone}
                    </div>
                  )}
                  {selectedDocument?.clientInfo?.institution && (
                    <div>
                      <span className="font-medium">Institution:</span> {selectedDocument?.clientInfo?.institution}
                    </div>
                  )}
                </div>
              </div>
            )}
            <div>
              <h4 className="font-medium mb-2">Contenu</h4>
              <div className="bg-white border rounded-lg p-4 whitespace-pre-wrap">
                {selectedDocument?.content}
              </div>
            </div>
            {selectedDocument?.metadata?.signatures && (Array.isArray(selectedDocument.metadata.signatures) ? selectedDocument.metadata.signatures.length : 0) > 0 && (
              <div>
                <h4 className="font-medium mb-2">Signatures</h4>
                <div className="space-y-2">
                  {(Array.isArray(selectedDocument.metadata.signatures) ? signatures : []).map((signature, index) => (
                    <div key={index} className="bg-green-50 p-3 rounded-lg border border-green-200">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="font-medium">{signature.signerName}</span>
                        <span className="text-sm text-gray-500">
                          le {new Date(signature.timestamp).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedDocument(null)}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CommercialDocumentManagement;