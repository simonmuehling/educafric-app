import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { FileText, Search, Download, Eye, Share, Plus, Filter, Calendar, Building2, Trash2 } from 'lucide-react';

const DocumentsContracts = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  const text = {
    fr: {
      title: 'Documents & Contrats',
      subtitle: 'Hub documentaire commercial et gestion des contrats',
      searchPlaceholder: 'Rechercher document...',
      addDocument: 'Ajouter Document',
      all: 'Tous',
      contracts: 'Contrats',
      brochures: 'Brochures',
      templates: 'Modèles',
      legal: 'Juridiques',
      marketing: 'Marketing',
      name: 'Nom',
      type: 'Type',
      school: 'École',
      date: 'Date',
      status: 'Statut',
      size: 'Taille',
      actions: 'Actions',
      view: 'Voir',
      download: 'Télécharger',
      share: 'Partager',
      edit: 'Modifier',
      draft: 'Brouillon',
      signed: 'Signé',
      pending: 'En Attente',
      expired: 'Expiré',
      contract: 'Contrat',
      brochure: 'Brochure',
      template: 'Modèle',
      proposal: 'Proposition'
    },
    en: {
      title: 'Documents & Contracts',
      subtitle: 'Commercial document hub and contract management',
      searchPlaceholder: 'Search documents...',
      addDocument: 'Add Document',
      all: 'All',
      contracts: 'Contracts',
      brochures: 'Brochures',
      templates: 'Templates',
      legal: 'Legal',
      marketing: 'Marketing',
      name: 'Name',
      type: 'Type',
      school: 'School',
      date: 'Date',
      status: 'Status',
      size: 'Size',
      actions: 'Actions',
      view: 'View',
      download: 'Download',
      share: 'Share',
      edit: 'Edit',
      draft: 'Draft',
      signed: 'Signed',
      pending: 'Pending',
      expired: 'Expired',
      contract: 'Contract',
      brochure: 'Brochure',
      template: 'Template',
      proposal: 'Proposal'
    }
  };

  const t = text[language as keyof typeof text];

  // Mock documents data
  const documents = [
    {
      id: 1,
      name: 'Contrat Premium - École Bilingue Yaoundé',
      type: 'contract',
      category: 'contracts',
      school: 'École Primaire Bilingue Yaoundé',
      date: '2024-01-20',
      status: 'signed',
      size: '2.4 MB',
      format: 'PDF',
      description: 'Contrat annuel premium avec services étendus',
      content: 'CONTRAT DE SERVICE EDUCAFRIC - École Primaire Bilingue de Yaoundé - Services de plateforme éducative complète avec formation et support technique.'
    },
    {
      id: 2,
      name: 'Brochure Marketing 2024',
      type: 'brochure',
      category: 'brochures',
      school: 'Usage général',
      date: '2024-01-15',
      status: 'finalized',
      size: '3.2 MB',
      format: 'PDF',
      description: 'Matériel de présentation commercial EDUCAFRIC',
      content: 'EDUCAFRIC - Révolutionnez l\'éducation en Afrique. Plateforme éducative complète pour les écoles africaines avec gestion académique, outils pédagogiques et communication intégrée.'
    },
    {
      id: 3,
      name: 'Proposition Lycée Excellence',
      type: 'proposal',
      category: 'contracts',
      school: 'Lycée Excellence Douala',
      date: '2024-01-10',
      status: 'pending',
      size: '1.8 MB',
      format: 'PDF',
      description: 'Proposition commerciale pour implémentation complète',
      content: 'PROPOSITION COMMERCIALE - Lycée Excellence Douala - Implémentation plateforme EDUCAFRIC avec formation personnalisée et migration des données existantes.'
    },
    {
      id: 4,
      name: 'Modèle Contrat Standard',
      type: 'template',
      category: 'templates',
      school: 'Template général',
      date: '2025-02-01',
      status: 'finalized',
      size: '1.2 MB',
      format: 'PDF',
      description: 'Modèle de contrat complet et actualisé pour nouveaux clients',
      content: 'EDUCAFRIC - Modèle de contrat commercial 2025. Template standard pour nouveaux clients avec conditions générales actualisées et services inclus.'
    },
    {
      id: 5,
      name: 'CGV Educafric 2024',
      type: 'legal',
      category: 'legal',
      school: 'Document légal',
      date: '2024-01-01',
      status: 'finalized',
      size: '890 KB',
      format: 'PDF',
      description: 'CGV mises à jour 2024',
      content: 'CONDITIONS GÉNÉRALES DE VENTE EDUCAFRIC 2024 - Document légal officiel avec conditions commerciales, tarification, modalités de paiement et cadre juridique pour les services EDUCAFRIC en Afrique. Version mise à jour janvier 2024.'
    },
    {
      id: 6,
      name: 'Guide Marketing Digital',
      type: 'brochure',
      category: 'marketing',
      school: 'Formation commerciale',
      date: '2024-01-25',
      status: 'finalized',
      size: '4.1 MB',
      format: 'PDF',
      description: 'Stratégies marketing pour écoles africaines',
      content: 'GUIDE MARKETING DIGITAL EDUCAFRIC - Stratégies pour écoles africaines avec approche digitale locale et démonstrations pratiques.'
    },
    {
      id: 7,
      name: 'Guide Complet EDUCAFRIC - Pour Commerciaux',
      type: 'brochure',
      category: 'brochures',
      school: 'Document formation',
      date: '2024-02-01',
      status: 'finalized',
      size: '5.2 MB',
      format: 'PDF',
      description: 'Guide complet pour équipe commerciale',
      content: 'GUIDE COMPLET EDUCAFRIC - Formation commerciale complète avec présentation des fonctionnalités, tarifs et stratégies de vente pour l\'équipe commerciale.'
    },
    {
      id: 8,
      name: 'Présentation Dashboards EDUCAFRIC 2025',
      type: 'brochure',
      category: 'brochures',
      school: 'Documentation client',
      date: '2025-02-01',
      status: 'finalized',
      size: '2.8 MB',
      format: 'PDF',
      description: 'Présentation complète de tous les tableaux de bord utilisateurs EDUCAFRIC',
      content: 'Documentation complète pour tous les tableaux de bord utilisateurs EDUCAFRIC. Présentation des 6 rôles utilisateurs principaux: Admin École, Directeur, Enseignant, Parent, Élève, et Freelancer. Chaque rôle dispose de modules spécifiques adaptés à ses besoins. Version 4.2.3 - 2025'
    }
  ];

  const categories = [
    { key: 'all', label: t.all, count: (Array.isArray(documents) ? documents.length : 0) },
    { key: 'contracts', label: t.contracts, count: (Array.isArray(documents) ? documents : []).filter(d => d.category === 'contracts').length },
    { key: 'brochures', label: t.brochures, count: (Array.isArray(documents) ? documents : []).filter(d => d.category === 'brochures').length },
    { key: 'templates', label: t.templates, count: (Array.isArray(documents) ? documents : []).filter(d => d.category === 'templates').length },
    { key: 'legal', label: t.legal, count: (Array.isArray(documents) ? documents : []).filter(d => d.category === 'legal').length },
    { key: 'marketing', label: t.marketing, count: (Array.isArray(documents) ? documents : []).filter(d => d.category === 'marketing').length }
  ];

  const filteredDocuments = (Array.isArray(documents) ? documents : []).filter(doc => {
    const matchesSearch = searchTerm === '' || 
      doc.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.school?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleViewDocument = (doc: any) => {
    setSelectedDocument(doc);
    setIsViewDialogOpen(true);
  };

  const handleDownloadDocument = async (doc: any) => {
    try {
      if (doc.format === 'PDF') {
        // Create PDF content
        const { jsPDF } = await import('jspdf');
        const pdf = new jsPDF();
        
        pdf.setFontSize(18);
        pdf.text(doc.name || '', 20, 30);
        
        pdf.setFontSize(12);
        pdf.text(`${t.type}: ${doc.type} | ${t.school}: ${doc.school}`, 20, 50);
        pdf.text(`${t.status}: ${doc.status} | ${t.date}: ${doc.date}`, 20, 60);
        pdf.text(`${t.size}: ${doc.size}`, 20, 70);
        
        pdf.setFontSize(11);
        pdf.text(`Description: ${doc.description || ''}`, 20, 85);
        
        // Content with line wrapping
        if (doc.content) {
          const lines = pdf.splitTextToSize(doc.content, 170);
          pdf.text(lines, 20, 100);
        }
        
        // Footer on each page
        const pageCount = pdf.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
          pdf.setPage(i);
          pdf.setFontSize(8);
          pdf.text(`Page ${i}/${pageCount} - Généré par EDUCAFRIC Platform v4.2.3`, 105, 285, { align: 'center' });
        }
        
        // Download
        pdf.save(`${doc.name || 'document'}.pdf`);
      } else {
        // Simple download for other formats
        const content = `EDUCAFRIC - Document Commercial\n\nTitre: ${doc.name || ''}\nType: ${doc.type}\nÉcole: ${doc.school}\nStatut: ${doc.status}\nDate: ${doc.date}\n\nDescription:\n${doc.description}\n\nContenu:\n${doc.content || 'Contenu non disponible'}\n\n---\nGénéré par EDUCAFRIC Platform`;
        
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `${doc.name || 'document'}.${doc.format?.toLowerCase() || 'txt'}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }

      toast({
        title: language === 'fr' ? 'Document téléchargé' : 'Document downloaded',
        description: language === 'fr' ? `${doc.name || ''} téléchargé avec succès en ${doc.format}` : `${doc.name || ''} downloaded successfully as ${doc.format}`,
      });
    } catch (error) {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' ? 'Erreur lors du téléchargement' : 'Error during download',
      });
    }
  };

  const handleShareDocument = async (doc: any) => {
    try {
      const shareUrl = `${window?.location?.origin}/commercial/documents/shared/${doc.id}`;
      const shareText = language === 'fr' 
        ? `Document commercial: ${doc.name || ''} - ${doc.description || ''}`
        : `Commercial document: ${doc.name || ''} - ${doc.description || ''}`;
      
      if (navigator.share) {
        await navigator.share({
          title: doc.name || '',
          text: shareText,
          url: shareUrl
        });
      } else {
        await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
        toast({
          title: language === 'fr' ? 'Lien copié' : 'Link copied',
          description: language === 'fr' ? 'Lien de partage copié dans le presse-papiers' : 'Share link copied to clipboard',
        });
      }
    } catch (error) {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' ? 'Erreur lors du partage' : 'Error during sharing',
      });
    }
  };

  const handleDeleteDocument = async (doc: any) => {
    try {
      const response = await fetch(`/api/commercial/documents/${doc.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        toast({
          title: language === 'fr' ? 'Document supprimé' : 'Document deleted',
          description: language === 'fr' ? `${doc.name || ''} supprimé avec succès` : `${doc.name || ''} deleted successfully`,
        });
      } else {
        throw new Error('Failed to delete');
      }
    } catch (error) {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' ? 'Erreur lors de la suppression' : 'Error during deletion',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      signed: 'bg-green-100 text-green-800 border-green-200',
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      draft: 'bg-gray-100 text-gray-800 border-gray-200',
      expired: 'bg-red-100 text-red-800 border-red-200',
      finalized: 'bg-blue-100 text-blue-800 border-blue-200'
    };
    
    return statusColors[status as keyof typeof statusColors] || statusColors.draft;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'contract': return <FileText className="w-4 h-4" />;
      case 'brochure': return <FileText className="w-4 h-4" />;
      case 'template': return <FileText className="w-4 h-4" />;
      case 'legal': return <Building2 className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            {t.title}
          </CardTitle>
          <CardDescription>{t.subtitle}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder={t.searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-documents"
                />
              </div>
            </div>
            <Button className="flex items-center gap-2" data-testid="button-add-document">
              <Plus className="w-4 h-4" />
              {t.addDocument}
            </Button>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            {categories.map((category) => (
              <Button
                key={category.key}
                variant={selectedCategory === category.key ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.key)}
                className="flex items-center gap-2"
                data-testid={`button-filter-${category.key}`}
              >
                <Filter className="w-3 h-3" />
                {category.label} ({category.count})
              </Button>
            ))}
          </div>

          <div className="space-y-4">
            {filteredDocuments.map((doc) => (
              <div key={doc.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getTypeIcon(doc.type)}
                      <h3 className="font-medium text-lg">{doc.name}</h3>
                      <Badge className={`${getStatusBadge(doc.status)} text-xs`}>
                        {t[doc.status as keyof typeof t] || doc.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{t.type}:</span>
                        <span>{t[doc.type as keyof typeof t] || doc.type}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4" />
                        <span>{doc.school}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{doc.date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{t.size}:</span>
                        <span>{doc.size}</span>
                      </div>
                    </div>
                    {doc.description && (
                      <p className="text-sm text-gray-600 mt-2">{doc.description}</p>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 sm:flex-col lg:flex-row">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1 flex-1 sm:flex-none min-w-[100px]"
                      onClick={() => handleViewDocument(doc)}
                      data-testid={`button-view-${doc.id}`}
                    >
                      <Eye className="w-3 h-3" />
                      {t.view}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1 flex-1 sm:flex-none min-w-[100px]"
                      onClick={() => handleDownloadDocument(doc)}
                      data-testid={`button-download-${doc.id}`}
                    >
                      <Download className="w-3 h-3" />
                      {t.download}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1 flex-1 sm:flex-none min-w-[100px]"
                      onClick={() => handleShareDocument(doc)}
                      data-testid={`button-share-${doc.id}`}
                    >
                      <Share className="w-3 h-3" />
                      {t.share}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1 flex-1 sm:flex-none min-w-[100px] text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDeleteDocument(doc)}
                      data-testid={`button-delete-${doc.id}`}
                    >
                      <Trash2 className="w-3 h-3" />
                      {language === 'fr' ? 'Supprimer' : 'Delete'}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredDocuments.length === 0 && (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {language === 'fr' ? 'Aucun document trouvé' : 'No documents found'}
              </h3>
              <p className="text-gray-600">
                {language === 'fr' 
                  ? 'Essayez de modifier vos critères de recherche ou ajoutez un nouveau document.'
                  : 'Try adjusting your search criteria or add a new document.'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedDocument && getTypeIcon(selectedDocument.type)}
              {selectedDocument?.name}
            </DialogTitle>
            <DialogDescription>
              {selectedDocument?.description}
            </DialogDescription>
          </DialogHeader>
          
          {selectedDocument && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><strong>{t.type}:</strong> {t[selectedDocument.type as keyof typeof t] || selectedDocument.type}</div>
                <div><strong>{t.school}:</strong> {selectedDocument.school}</div>
                <div><strong>{t.date}:</strong> {selectedDocument.date}</div>
                <div><strong>{t.size}:</strong> {selectedDocument.size}</div>
                <div><strong>{t.status}:</strong> 
                  <Badge className={`ml-2 ${getStatusBadge(selectedDocument.status)} text-xs`}>
                    {t[selectedDocument.status as keyof typeof t] || selectedDocument.status}
                  </Badge>
                </div>
              </div>
              
              {selectedDocument.content && (
                <div className="border-2 border-blue-200 rounded-lg p-6 bg-blue-50 min-h-[400px] max-h-[500px] overflow-auto">
                  <h4 className="font-semibold text-lg mb-4 text-blue-800">{language === 'fr' ? 'Contenu du Document:' : 'Document Content:'}</h4>
                  <div className="whitespace-pre-wrap text-base leading-relaxed text-gray-800">{selectedDocument.content}</div>
                </div>
              )}
              
              {!selectedDocument.content && (
                <div className="border-2 border-orange-200 rounded-lg p-6 bg-orange-50 text-center">
                  <h4 className="font-medium text-orange-800 mb-2">{language === 'fr' ? 'Contenu non disponible' : 'Content not available'}</h4>
                  <p className="text-orange-600">{language === 'fr' ? 'Ce document ne contient pas de contenu prévisualisable.' : 'This document does not contain previewable content.'}</p>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              {language === 'fr' ? 'Fermer' : 'Close'}
            </Button>
            {selectedDocument && (
              <Button onClick={() => handleDownloadDocument(selectedDocument)}>
                <Download className="w-4 h-4 mr-2" />
                {t.download}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DocumentsContracts;