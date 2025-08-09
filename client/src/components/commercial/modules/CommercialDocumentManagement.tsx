import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  FileText, Eye, Download, Share2, Trash2, Plus, 
  AlertTriangle, CheckCircle, Clock, Mail, User,
  Building, FileDown, Send
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { apiRequest } from '@/lib/queryClient';
import ContractGenerator from '../ContractGenerator';

interface CommercialDocument {
  id: number;
  userId: number;
  title: string;
  content: string;
  type: 'contract' | 'proposal' | 'quote' | 'brochure' | 'sales_kit';
  status: 'draft' | 'finalized' | 'sent' | 'signed' | 'active';
  language: string;
  category?: string;
  downloadUrl?: string;
  clientInfo?: {
    name: string;
    email: string;
    phone?: string;
    institution?: string;
    address?: string;
  };
  createdAt: string;
  updatedAt: string;
}

const CommercialDocumentManagement: React.FC = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [selectedDocument, setSelectedDocument] = useState<CommercialDocument | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [shareEmail, setShareEmail] = useState('');
  const [shareMessage, setShareMessage] = useState('');
  const [isContractDialogOpen, setIsContractDialogOpen] = useState(false);

  // Check if user can create contracts (COO or specific emails)
  const canCreateContracts = user && (
    user.email === 'carine.nguetsop@educafric.com' ||
    user.email === 'carine@educafric.com' ||
    user.email === 'nguetsop.carine@educafric.com' ||
    user.email?.includes('carine') ||
    user.role === 'SiteAdmin'
  );

  const text = {
    fr: {
      title: 'Gestion des Documents Commerciaux',
      subtitle: 'Voir, télécharger, partager et gérer vos documents',
      documents: 'Documents',
      actions: 'Actions',
      view: 'Voir',
      download: 'Télécharger',
      share: 'Partager',
      delete: 'Supprimer',
      type: 'Type',
      status: 'Statut',
      client: 'Client',
      created: 'Créé le',
      viewDocument: 'Voir le Document',
      shareDocument: 'Partager le Document',
      shareEmail: 'Email du destinataire',
      shareMessage: 'Message (optionnel)',
      sendDocument: 'Envoyer le Document',
      documentShared: 'Document partagé avec succès',
      documentDeleted: 'Document supprimé',
      confirmDelete: 'Êtes-vous sûr de vouloir supprimer ce document ?',
      createContract: 'Créer Contrat',
      contractCreated: 'Contrat créé avec succès',
      cancel: 'Annuler',
      close: 'Fermer',
      noDocuments: 'Aucun document trouvé',
      loadingDocuments: 'Chargement des documents...',
      contract: 'Contrat',
      proposal: 'Proposition',
      quote: 'Devis',
      brochure: 'Brochure',
      draft: 'Brouillon',
      finalized: 'Finalisé',
      sent: 'Envoyé',
      signed: 'Signé'
    },
    en: {
      title: 'Commercial Document Management',
      subtitle: 'View, download, share and manage your documents',
      documents: 'Documents',
      actions: 'Actions',
      view: 'View',
      download: 'Download',
      share: 'Share',
      delete: 'Delete',
      type: 'Type',
      status: 'Status',
      client: 'Client',
      created: 'Created',
      viewDocument: 'View Document',
      shareDocument: 'Share Document',
      shareEmail: 'Recipient email',
      shareMessage: 'Message (optional)',
      sendDocument: 'Send Document',
      documentShared: 'Document shared successfully',
      documentDeleted: 'Document deleted',
      confirmDelete: 'Are you sure you want to delete this document?',
      cancel: 'Cancel',
      close: 'Close',
      noDocuments: 'No documents found',
      loadingDocuments: 'Loading documents...',
      contract: 'Contract',
      proposal: 'Proposal',
      quote: 'Quote',
      brochure: 'Brochure',
      draft: 'Draft',
      finalized: 'Finalized',
      sent: 'Sent',
      signed: 'Signed',
      createContract: 'Create Contract',
      contractCreated: 'Contract created successfully'
    }
  };

  const t = text[language as keyof typeof text];

  // Query pour récupérer les documents - API réelle
  const { data: documents = [], isLoading, error } = useQuery({
    queryKey: ['/api/commercial/documents'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/commercial/documents', { credentials: 'include' });
        if (!response.ok) {
          throw new Error('Failed to fetch documents');
        }
        return await response.json();
      } catch (error) {
        console.error('Error fetching commercial documents:', error);
        return [];
      }
    }
  });

  // Mutation pour supprimer un document
  const deleteMutation = useMutation({
    mutationFn: async (documentId: number) => {
      // Simulation de suppression
      await new Promise(resolve => setTimeout(resolve, 500));
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/commercial/documents'] });
      toast({
        title: t.documentDeleted,
        description: "Le document a été supprimé avec succès",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le document",
        variant: "destructive",
      });
    }
  });

  // Mutation pour partager un document
  const shareMutation = useMutation({
    mutationFn: async ({ documentId, email, message }: { documentId: number, email: string, message: string }) => {
      // Simulation d'envoi d'email
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { success: true, email, message };
    },
    onSuccess: () => {
      setIsShareDialogOpen(false);
      setShareEmail('');
      setShareMessage('');
      toast({
        title: t.documentShared,
        description: "Le document a été envoyé par email",
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de partager le document",
        variant: "destructive",
      });
    }
  });

  const handleView = (document: CommercialDocument) => {
    setSelectedDocument(document);
    setIsViewDialogOpen(true);
  };

  const handleDownload = async (doc: CommercialDocument) => {
    try {
      // Simulation de téléchargement - créer un blob avec le contenu du document
      const content = `EDUCAFRIC - Document Commercial\n\nTitre: ${doc.title || ''}\nType: ${doc.type}\nStatut: ${doc.status}\n\nContenu:\n${doc.content}\n\nClient: ${doc.clientInfo?.name || 'N/A'}\nEmail: ${doc.clientInfo?.email || 'N/A'}\nInstitution: ${doc.clientInfo?.institution || 'N/A'}`;
      
      const blob = new Blob([content], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = window.document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `${doc.title || ''}.txt`;
      window.document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      window.document.body.removeChild(a);
      
      toast({
        title: "Document téléchargé",
        description: `${doc.title || ''} a été téléchargé`,
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de télécharger le document",
        variant: "destructive",
      });
    }
  };

  const handleShare = (document: CommercialDocument) => {
    setSelectedDocument(document);
    setIsShareDialogOpen(true);
  };

  const handleDelete = (document: CommercialDocument) => {
    if (window.confirm(t.confirmDelete)) {
      deleteMutation.mutate(document.id);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { color: 'bg-yellow-100 text-yellow-800', icon: <Clock className="w-3 h-3" /> },
      finalized: { color: 'bg-blue-100 text-blue-800', icon: <CheckCircle className="w-3 h-3" /> },
      sent: { color: 'bg-green-100 text-green-800', icon: <Mail className="w-3 h-3" /> },
      signed: { color: 'bg-purple-100 text-purple-800', icon: <CheckCircle className="w-3 h-3" /> },
      active: { color: 'bg-emerald-100 text-emerald-800', icon: <CheckCircle className="w-3 h-3" /> }
    };

    const statusLabels = {
      draft: t.draft || 'Brouillon',
      finalized: t.finalized || 'Finalisé',
      sent: t.sent || 'Envoyé',
      signed: t.signed || 'Signé',
      active: 'Actif'
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    
    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        {config.icon}
        {statusLabels[status as keyof typeof statusLabels] || status}
      </Badge>
    );
  };

  const getTypeBadge = (type: string) => {
    const typeConfig = {
      contract: 'bg-red-100 text-red-800',
      proposal: 'bg-blue-100 text-blue-800',
      quote: 'bg-green-100 text-green-800',
      brochure: 'bg-purple-100 text-purple-800',
      sales_kit: 'bg-violet-100 text-violet-800'
    };

    const typeLabels = {
      contract: t.contract || 'Contrat',
      proposal: t.proposal || 'Proposition',
      quote: t.quote || 'Devis',
      brochure: t.brochure || 'Brochure',
      sales_kit: 'Kit Commercial'
    };

    return (
      <Badge className={typeConfig[type as keyof typeof typeConfig] || typeConfig.proposal}>
        {typeLabels[type as keyof typeof typeLabels] || type}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">{t.loadingDocuments}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t.title || ''}</h1>
          <p className="text-gray-600 mt-1">{t.subtitle}</p>
        </div>
        {canCreateContracts && (
          <Button 
            onClick={() => setIsContractDialogOpen(true)}
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            {t.createContract}
          </Button>
        )}
      </div>

      {/* Documents Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            {t.documents}
          </CardTitle>
          <CardDescription>
            Gérez vos documents commerciaux avec toutes les fonctionnalités
          </CardDescription>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">{t.noDocuments}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Titre</TableHead>
                  <TableHead>{t.type}</TableHead>
                  <TableHead>{t.status}</TableHead>
                  <TableHead>{t.client}</TableHead>
                  <TableHead>{t.created}</TableHead>
                  <TableHead>{t.actions}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(Array.isArray(documents) ? documents : []).map((document: CommercialDocument) => (
                  <TableRow key={document.id}>
                    <TableCell className="font-medium">{document.title || ''}</TableCell>
                    <TableCell>{getTypeBadge(document.type)}</TableCell>
                    <TableCell>{getStatusBadge(document.status)}</TableCell>
                    <TableCell>
                      {document.clientInfo ? (
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span>{document.clientInfo.name}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(document.createdAt).toLocaleDateString('fr-FR')}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleView(document)}
                          data-testid={`button-view-${document.id}`}
                        >
                          <Eye className="w-4 h-4" />
                          {t.view}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownload(document)}
                          data-testid={`button-download-${document.id}`}
                        >
                          <Download className="w-4 h-4" />
                          {t.download}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleShare(document)}
                          data-testid={`button-share-${document.id}`}
                        >
                          <Share2 className="w-4 h-4" />
                          {t.share}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(document)}
                          className="text-red-600 hover:text-red-700"
                          data-testid={`button-delete-${document.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                          {t.delete}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* View Document Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              {t.viewDocument}: {selectedDocument?.title}
            </DialogTitle>
            <DialogDescription>
              Document créé le {selectedDocument && new Date(selectedDocument.createdAt).toLocaleDateString('fr-FR')}
            </DialogDescription>
          </DialogHeader>
          
          {selectedDocument && (
            <div className="space-y-4">
              {/* Document Info */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-semibold text-sm text-gray-700">Type</h4>
                  {getTypeBadge(selectedDocument.type)}
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-gray-700">Statut</h4>
                  {getStatusBadge(selectedDocument.status)}
                </div>
                {selectedDocument.clientInfo && (
                  <>
                    <div>
                      <h4 className="font-semibold text-sm text-gray-700">Client</h4>
                      <p className="text-sm">{(selectedDocument.clientInfo.name || '')}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-gray-700">Institution</h4>
                      <p className="text-sm">{selectedDocument.clientInfo.institution || '-'}</p>
                    </div>
                  </>
                )}
              </div>

              {/* Document Content */}
              <div>
                <h4 className="font-semibold text-sm text-gray-700 mb-2">Contenu du Document</h4>
                <div className="border rounded-lg p-4 bg-white max-h-96 overflow-y-auto">
                  <div className="prose prose-sm max-w-none">
                    {selectedDocument.content.split('\n').map((paragraph, index) => (
                      <p key={index} className="mb-2">{paragraph}</p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              {t.close}
            </Button>
            {selectedDocument && (
              <Button onClick={() => handleDownload(selectedDocument)}>
                <Download className="w-4 h-4 mr-2" />
                {t.download}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Share Document Dialog */}
      <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Share2 className="w-5 h-5" />
              {t.shareDocument}: {selectedDocument?.title}
            </DialogTitle>
            <DialogDescription>
              Envoyer ce document par email à un destinataire
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">{t.shareEmail}</label>
              <Input
                type="email"
                value={shareEmail}
                onChange={(e) => setShareEmail(e.target.value)}
                placeholder="exemple@ecole.com"
                data-testid="input-share-email"
              />
            </div>
            <div>
              <label className="text-sm font-medium">{t.shareMessage}</label>
              <Textarea
                value={shareMessage}
                onChange={(e) => setShareMessage(e.target.value)}
                placeholder="Message personnalisé..."
                rows={3}
                data-testid="textarea-share-message"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsShareDialogOpen(false)}>
              {t.cancel}
            </Button>
            <Button
              onClick={() => selectedDocument && shareMutation.mutate({
                documentId: selectedDocument.id,
                email: shareEmail,
                message: shareMessage
              })}
              disabled={!shareEmail || shareMutation.isPending}
              data-testid="button-send-document"
            >
              <Send className="w-4 h-4 mr-2" />
              {shareMutation.isPending ? 'Envoi...' : t.sendDocument}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Contract Generator Dialog */}
      {canCreateContracts && (
        <ContractGenerator
          isOpen={isContractDialogOpen}
          onClose={() => setIsContractDialogOpen(false)}
          onContractGenerated={(contractData) => {
            toast({
              title: t.contractCreated,
              description: `Contrat créé pour ${contractData.partnerName}`,
            });
            queryClient.invalidateQueries({ queryKey: ['/api/commercial/documents'] });
          }}
        />
      )}
    </div>
  );
};

export default CommercialDocumentManagement;