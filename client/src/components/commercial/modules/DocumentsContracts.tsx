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

  // Documents commerciaux réels EDUCAFRIC - Combinaison MD + PDF
  const documents = [
    // Documents Markdown (MD) - Guides détaillés
    {
      id: 1,
      name: 'Kit de Prospection Educafric Complet',
      type: 'guide',
      category: 'marketing',
      school: 'Usage Commercial',
      date: '2025-08-09',
      status: 'finalized',
      size: '7.7 KB',
      format: 'MD',
      url: '/documents/kit-prospection-educafric-complet.md',
      description: 'Kit complet de prospection pour commerciaux : scripts téléphone, argumentaires, messages WhatsApp, stratégies ciblage Douala/Yaoundé'
    },
    {
      id: 2,
      name: 'Guide Commercial Modules Premium/Freemium',
      type: 'guide',
      category: 'marketing', 
      school: 'Équipe Commerciale',
      date: '2025-08-09',
      status: 'finalized',
      size: '11.8 KB',
      format: 'MD',
      url: '/documents/guide-commercial-modules-premium-freemium.md',
      description: 'Guide détaillé modules freemium vs premium : Écoles (6 modules bloqués), Parents (5 modules), Freelancers (8 modules) avec tarification réelle'
    },
    {
      id: 3,
      name: 'Tarifs et Plans Français',
      type: 'pricing',
      category: 'contracts',
      school: 'Documentation Officielle',
      date: '2025-01-15',
      status: 'finalized',
      size: '8.2 KB',
      format: 'MD',
      url: '/documents/tarifs-plans-francais.md',
      description: 'Tarification officielle EDUCAFRIC en français : Parents (1000-1500 CFA/mois), Écoles (50000 CFA/an), Freelancers (12500-25000 CFA/an)'
    },
    {
      id: 4,
      name: 'Pricing Plans English',
      type: 'pricing',
      category: 'contracts',
      school: 'Official Documentation',
      date: '2025-01-15',
      status: 'finalized',
      size: '7.9 KB',
      format: 'MD',
      url: '/documents/pricing-plans-english.md',
      description: 'Official EDUCAFRIC pricing in English: Parents, Schools, Freelancers with complete feature breakdown'
    },
    {
      id: 5,
      name: 'Guide Notifications Educafric',
      type: 'guide',
      category: 'technical',
      school: 'Support Technique',
      date: '2025-01-10',
      status: 'finalized',
      size: '4.9 KB',
      format: 'MD',
      url: '/documents/guide-notifications-educafric.md',
      description: 'Guide complet système notifications : SMS, WhatsApp, Email, Push avec templates personnalisés'
    },
    {
      id: 6,
      name: 'Géolocalisation Résumé Français',
      type: 'guide',
      category: 'technical',
      school: 'Documentation Technique',
      date: '2025-01-08',
      status: 'finalized',
      size: '3.1 KB',
      format: 'MD',
      url: '/documents/geolocalisation-resume-francais.md',
      description: 'Guide géolocalisation en français : GPS temps réel, zones sécurité, alertes, suivi élèves/personnel'
    },
    {
      id: 7,
      name: 'Geolocation Summary English',
      type: 'guide',
      category: 'technical',
      school: 'Technical Documentation',
      date: '2025-01-08',
      status: 'finalized',
      size: '2.8 KB',
      format: 'MD',
      url: '/documents/geolocation-summary-english.md',
      description: 'Geolocation guide in English: Real-time GPS, security zones, alerts, student/staff tracking'
    },
    {
      id: 8,
      name: 'Tarifs Complets Educafric',
      type: 'pricing',
      category: 'contracts',
      school: 'Documentation Officielle',
      date: '2025-01-15',
      status: 'finalized',
      size: '9.1 KB',
      format: 'MD',
      url: '/documents/tarifs-complets-educafric.md',
      description: 'Documentation complète des tarifs et plans EDUCAFRIC'
    },

    // Documents PDF - Originaux partagés
    {
      id: 11,
      name: 'Demande Établissement (PDF)',
      type: 'form',
      category: 'legal',
      school: 'Administration',
      date: '2025-01-20',
      status: 'finalized',
      size: '2.1 MB',
      format: 'PDF',
      url: '/documents/Demande_Etablissement_1753390157502.pdf',
      description: 'Formulaire officiel de demande d\'adhésion pour établissements scolaires'
    },
    {
      id: 12,
      name: 'Demande Ministre (PDF)',
      type: 'form',
      category: 'legal',
      school: 'Ministère',
      date: '2025-01-20',
      status: 'finalized',
      size: '1.8 MB',
      format: 'PDF',
      url: '/documents/Demande_ministre-8_1753390184314.pdf',
      description: 'Document officiel de demande ministérielle pour validation institutionnelle'
    },
    {
      id: 13,
      name: 'Documentation Parents (PDF)',
      type: 'guide',
      category: 'marketing',
      school: 'Familles',
      date: '2025-01-22',
      status: 'finalized',
      size: '1.2 MB',
      format: 'PDF',
      url: '/documents/parents_1753390442002.pdf',
      description: 'Guide pour parents : fonctionnalités, tarifs, avantages géolocalisation et suivi scolaire'
    },
    {
      id: 14,
      name: 'Contrat Partenariat Établissements-Freelancers 2025',
      type: 'contract',
      category: 'legal',
      school: 'Partenariats',
      date: '2025-01-25',
      status: 'finalized',
      size: '2.5 MB',
      format: 'PDF',
      url: '/documents/CONTRAT_PARTENARIAT_ETABLISSEMENTS_FREELANCERS_2025_1753866001857.pdf',
      description: 'Contrat officiel de partenariat entre établissements scolaires et freelancers/répétiteurs'
    },
    {
      id: 15,
      name: 'Educafric - Document Commercial (PDF)',
      type: 'brochure',
      category: 'marketing',
      school: 'Présentation Commerciale',
      date: '2025-01-28',
      status: 'finalized',
      size: '270 KB',
      format: 'PDF',
      url: '/documents/Educafric_Document_Commercial.pdf',
      description: 'Brochure commerciale améliorée Educafric avec argumentaires de vente complets'
    },
    {
      id: 16,
      name: 'Educafric - Présentation Officielle (PDF)',
      type: 'presentation',
      category: 'marketing',
      school: 'Présentation Officielle',
      date: '2025-01-28',
      status: 'finalized',
      size: '16.9 MB',
      format: 'PDF',
      url: '/documents/Educafric_Presentation.pdf',
      description: 'Présentation officielle de la plateforme Educafric pour partenaires et investisseurs'
    }
  ];

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleViewDocument = (doc: any) => {
    // For MD files, open PDF conversion directly
    if (doc.format === 'MD') {
      const pdfUrl = doc.url.replace('.md', '/pdf');
      window.open(pdfUrl, '_blank');
      toast({
        title: language === 'fr' ? 'Document PDF ouvert' : 'PDF Document Opened',
        description: language === 'fr' ? `${doc.name} a été converti en PDF et ouvert` : `${doc.name} has been converted to PDF and opened`,
      });
    } else {
      // For PDF files, open directly
      window.open(doc.url, '_blank');
      toast({
        title: language === 'fr' ? 'Document PDF ouvert' : 'PDF Document Opened',
        description: language === 'fr' ? `${doc.name} a été ouvert dans un nouvel onglet` : `${doc.name} has been opened in a new tab`,
      });
    }
  };

  const handleDownloadDocument = (doc: any) => {
    // For MD files, offer PDF conversion option
    if (doc.format === 'MD') {
      const pdfUrl = doc.url.replace('.md', '/pdf');
      window.open(pdfUrl, '_blank');
      toast({
        title: language === 'fr' ? 'Document PDF généré' : 'PDF Document Generated',
        description: language === 'fr' ? `${doc.name} a été converti en PDF et ouvert` : `${doc.name} has been converted to PDF and opened`,
      });
    } else {
      // For PDF and other files, open directly
      window.open(doc.url, '_blank');
      toast({
        title: language === 'fr' ? 'Document ouvert' : 'Document opened',
        description: language === 'fr' ? `${doc.name} a été ouvert dans un nouvel onglet` : `${doc.name} has been opened in a new tab`,
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'signed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'finalized': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'contract': return <FileText className="w-5 h-5 text-blue-600" />;
      case 'brochure': return <FileText className="w-5 h-5 text-green-600" />;
      case 'template': return <FileText className="w-5 h-5 text-purple-600" />;
      case 'guide': return <FileText className="w-5 h-5 text-orange-600" />;
      case 'pricing': return <FileText className="w-5 h-5 text-red-600" />;
      case 'form': return <FileText className="w-5 h-5 text-indigo-600" />;
      case 'presentation': return <FileText className="w-5 h-5 text-pink-600" />;
      default: return <FileText className="w-5 h-5 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900">{t.title}</h2>
        <p className="text-gray-600 mt-2">{t.subtitle}</p>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex-1 w-full lg:max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder={t.searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {['all', 'marketing', 'contracts', 'technical', 'legal'].map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="text-xs"
                >
                  {category === 'all' ? t.all : 
                   category === 'marketing' ? t.marketing :
                   category === 'contracts' ? t.contracts :
                   category === 'technical' ? 'Technique' :
                   category === 'legal' ? t.legal : category}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDocuments.map((doc) => (
          <Card key={doc.id} className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {getTypeIcon(doc.type)}
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-sm font-semibold text-gray-900 truncate">
                      {doc.name}
                    </CardTitle>
                    <CardDescription className="text-xs text-gray-500 mt-1">
                      {doc.school}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <Badge className={`text-xs ${getStatusColor(doc.status)}`}>
                    {doc.status === 'finalized' ? 'Finalisé' : doc.status}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {doc.format}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-xs text-gray-600 mb-4 line-clamp-3">
                {doc.description}
              </p>
              <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                <span>{doc.date}</span>
                <span>{doc.size}</span>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleViewDocument(doc)}
                  className="flex-1 text-xs"
                >
                  <Eye className="w-3 h-3 mr-1" />
                  {language === 'fr' ? 'Voir PDF' : 'View PDF'}
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleDownloadDocument(doc)}
                  className="flex-1 text-xs"
                >
                  <Download className="w-3 h-3 mr-1" />
                  {doc.format === 'MD' ? (language === 'fr' ? 'PDF' : 'PDF') : t.download}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>



      {/* Empty State */}
      {filteredDocuments.length === 0 && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {language === 'fr' ? 'Aucun document trouvé' : 'No documents found'}
              </h3>
              <p className="text-gray-600">
                {language === 'fr' 
                  ? 'Essayez de modifier vos critères de recherche.' 
                  : 'Try adjusting your search criteria.'
                }
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DocumentsContracts;