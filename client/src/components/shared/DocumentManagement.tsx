import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, Download, Search, Filter, FileText, File, Globe } from 'lucide-react';

interface Document {
  id: number;
  title: string;
  type: 'pricing' | 'policy' | 'technical' | 'training' | 'commercial' | 'administrative' | 'ministerial';
  language: 'fr' | 'en';
  size: string;
  lastModified: string;
  accessLevel: 'public' | 'commercial' | 'admin' | 'restricted';
  sharedWith: string[];
  downloadCount: number;
  url?: string;
  description?: string;
}

const DocumentManagement: React.FC = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterAccess, setFilterAccess] = useState<string>('all');

  // Textes bilingues
  const text = {
    fr: {
      title: 'Gestion des Documents',
      subtitle: 'Accédez et gérez tous vos documents commerciaux et administratifs',
      search: 'Rechercher des documents...',
      filterByType: 'Filtrer par type',
      filterByAccess: 'Filtrer par accès',
      all: 'Tous',
      documentTypes: {
        pricing: 'Tarifs & Plans',
        policy: 'Politiques',
        technical: 'Technique',
        training: 'Formation',
        commercial: 'Commercial',
        administrative: 'Administratif',
        ministerial: 'Ministériel'
      },
      accessLevels: {
        public: 'Public',
        commercial: 'Commercial',
        admin: 'Administration',
        restricted: 'Restreint'
      },
      actions: {
        view: 'Voir',
        download: 'Télécharger'
      },
      size: 'Taille',
      lastModified: 'Dernière modification',
      downloads: 'Téléchargements',
      noDocuments: 'Aucun document trouvé',
      language: 'Langue',
      description: 'Description',
      accessDenied: 'Accès restreint'
    },
    en: {
      title: 'Document Management',
      subtitle: 'Access and manage all your commercial and administrative documents',
      search: 'Search documents...',
      filterByType: 'Filter by type',
      filterByAccess: 'Filter by access',
      all: 'All',
      documentTypes: {
        pricing: 'Pricing & Plans',
        policy: 'Policies',
        technical: 'Technical',
        training: 'Training',
        commercial: 'Commercial',
        administrative: 'Administrative',
        ministerial: 'Ministerial'
      },
      accessLevels: {
        public: 'Public',
        commercial: 'Commercial',
        admin: 'Administration',
        restricted: 'Restricted'
      },
      actions: {
        view: 'View',
        download: 'Download'
      },
      size: 'Size',
      lastModified: 'Last modified',
      downloads: 'Downloads',
      noDocuments: 'No documents found',
      language: 'Language',
      description: 'Description',
      accessDenied: 'Access restricted'
    }
  };

  const t = text[language as keyof typeof text];

  // Documents avec mappings corrects vers les fichiers existants
  const documents: Document[] = [
    {
      id: 1,
      title: 'Guide des Notifications EDUCAFRIC',
      type: 'technical',
      language: 'fr',
      size: '89 KB',
      lastModified: '2025-01-26 18:10',
      accessLevel: 'public',
      sharedWith: [],
      downloadCount: 45,
      description: 'Guide non-technique bilingue expliquant le système de notifications SMS et application'
    },
    {
      id: 2,
      title: 'Tarifs et Plans d\'Abonnement - Français',
      type: 'pricing',
      language: 'fr',
      size: '156 KB',
      lastModified: '2025-01-24 18:30',
      accessLevel: 'commercial',
      sharedWith: ['commercial@educafric.com'],
      downloadCount: 12,
      description: 'Document non-technique des tarifs et plans pour l\'équipe commerciale - Version française'
    },
    {
      id: 3,
      title: 'Pricing Plans & Subscription Summary - English',
      type: 'pricing',
      language: 'en',
      size: '148 KB',
      lastModified: '2025-01-24 18:30',
      accessLevel: 'commercial',
      sharedWith: ['commercial@educafric.com'],
      downloadCount: 8,
      description: 'Non-technical pricing and plans document for commercial team - English version'
    },
    {
      id: 4,
      title: 'Politique de Confidentialité',
      type: 'policy',
      language: 'fr',
      size: '89 KB',
      lastModified: '2025-01-20 14:15',
      accessLevel: 'public',
      sharedWith: [],
      downloadCount: 45,
      description: 'Politique de confidentialité complète de la plateforme'
    },
    {
      id: 5,
      title: 'Technical Architecture Documentation',
      type: 'technical',
      language: 'en',
      size: '234 KB',
      lastModified: '2025-01-22 10:45',
      accessLevel: 'admin',
      sharedWith: ['admin@educafric.com'],
      downloadCount: 3,
      description: 'Documentation technique complète de l\'architecture système'
    },
    {
      id: 6,
      title: 'Formation des Directeurs d\'École',
      type: 'training',
      language: 'fr',
      size: '345 KB',
      lastModified: '2025-01-25 16:20',
      accessLevel: 'admin',
      sharedWith: ['admin@educafric.com'],
      downloadCount: 7,
      description: 'Guide de formation pour les directeurs d\'établissements scolaires'
    },
    {
      id: 7,
      title: 'Demande d\'Établissement Scolaire',
      type: 'administrative',
      language: 'fr',
      size: '430 KB',
      lastModified: '2025-07-24 21:05',
      accessLevel: 'admin',
      sharedWith: ['admin@educafric.com'],
      downloadCount: 15,
      description: 'Formulaire officiel de demande pour les établissements scolaires'
    },
    {
      id: 8,
      title: 'Demande Ministérielle',
      type: 'ministerial',
      language: 'fr',
      size: '2.3 MB',
      lastModified: '2025-07-24 21:05',
      accessLevel: 'restricted',
      sharedWith: ['admin@educafric.com'],
      downloadCount: 3,
      description: 'Document officiel pour les demandes ministérielles'
    },
    {
      id: 9,
      title: 'Plans d\'Abonnement Complets',
      type: 'pricing',
      language: 'fr',
      size: '245 KB',
      lastModified: '2025-07-24 21:06',
      accessLevel: 'commercial',
      sharedWith: ['commercial@educafric.com'],
      downloadCount: 28,
      description: 'Document détaillé des plans d\'abonnement et tarifications'
    },
    {
      id: 10,
      title: 'Guide Parents',
      type: 'training',
      language: 'fr',
      size: '430 KB',
      lastModified: '2025-07-24 21:10',
      accessLevel: 'public',
      sharedWith: [],
      downloadCount: 67,
      description: 'Guide d\'utilisation de la plateforme pour les parents'
    },
    {
      id: 11,
      title: 'Inventaire Complet des Pages',
      type: 'technical',
      language: 'fr',
      size: '156 KB',
      lastModified: '2025-01-26 19:15',
      accessLevel: 'admin',
      sharedWith: ['admin@educafric.com'],
      downloadCount: 5,
      description: 'Inventaire technique de toutes les pages de la plateforme'
    },
    {
      id: 12,
      title: 'Référence du Contenu des Notifications',
      type: 'technical',
      language: 'fr',
      size: '89 KB',
      lastModified: '2025-01-26 18:10',
      accessLevel: 'admin',
      sharedWith: ['admin@educafric.com'],
      downloadCount: 12,
      description: 'Référence complète du système de notifications'
    },
    {
      id: 13,
      title: 'Plans d\'Abonnement Détaillés',
      type: 'pricing',
      language: 'fr',
      size: '245 KB',
      lastModified: '2025-01-24 18:30',
      accessLevel: 'commercial',
      sharedWith: ['commercial@educafric.com'],
      downloadCount: 18,
      description: 'Version détaillée des plans d\'abonnement'
    },
    {
      id: 14,
      title: 'Information Freemium pour Écoles Africaines',
      type: 'commercial',
      language: 'fr',
      size: '198 KB',
      lastModified: '2025-01-25 14:30',
      accessLevel: 'commercial',
      sharedWith: ['commercial@educafric.com'],
      downloadCount: 34,
      description: 'Document informatif sur l\'offre freemium pour les écoles africaines'
    },
    {
      id: 15,
      title: 'Comparaison Services de Géolocalisation',
      type: 'technical',
      language: 'fr',
      size: '267 KB',
      lastModified: '2025-01-22 16:45',
      accessLevel: 'admin',
      sharedWith: ['admin@educafric.com'],
      downloadCount: 8,
      description: 'Analyse comparative des services de géolocalisation'
    },
    {
      id: 16,
      title: 'Contrat de Partenariat Établissements-Freelancers 2025',
      type: 'administrative',
      language: 'fr',
      size: '189 KB',
      lastModified: '2025-01-26 20:15',
      accessLevel: 'admin',
      sharedWith: ['admin@educafric.com'],
      downloadCount: 6,
      description: 'Contrat type pour les partenariats avec les établissements et freelancers'
    },
    {
      id: 17,
      title: 'Économies Financières pour Écoles Africaines',
      type: 'commercial',
      language: 'fr',
      size: '234 KB',
      lastModified: '2025-01-25 15:20',
      accessLevel: 'commercial',
      sharedWith: ['commercial@educafric.com'],
      downloadCount: 22,
      description: 'Analyse des économies réalisables par les écoles africaines'
    },
    {
      id: 18,
      title: 'Brochure Commerciale Persuasive',
      type: 'commercial',
      language: 'fr',
      size: '412 KB',
      lastModified: '2025-01-26 11:30',
      accessLevel: 'commercial',
      sharedWith: ['commercial@educafric.com'],
      downloadCount: 45,
      description: 'Brochure commerciale pour la présentation aux prospects'
    },
    {
      id: 19,
      title: 'Document Commercial Master',
      type: 'commercial',
      language: 'fr',
      size: '270 KB',
      lastModified: '2025-08-09 22:02',
      accessLevel: 'commercial',
      sharedWith: ['commercial@educafric.com'],
      downloadCount: 8,
      description: 'Document commercial principal pour les équipes de vente'
    },
    {
      id: 20,
      title: 'Présentation Master EDUCAFRIC',
      type: 'commercial',
      language: 'fr',
      size: '17.7 MB',
      lastModified: '2025-08-09 22:00',
      accessLevel: 'commercial',
      sharedWith: ['commercial@educafric.com'],
      downloadCount: 15,
      description: 'Présentation master complète de la plateforme EDUCAFRIC'
    },
    {
      id: 21,
      title: 'Contrat de Partenariat 2025',
      type: 'administrative',
      language: 'fr',
      size: '147 KB',
      lastModified: '2025-08-09 21:59',
      accessLevel: 'admin',
      sharedWith: ['admin@educafric.com'],
      downloadCount: 4,
      description: 'Contrat officiel de partenariat pour l\'année 2025'
    }
  ];

  // Mappings des documents vers les fichiers réellement disponibles
  const getDocumentUrl = (docId: number): string => {
    const mappings: { [key: number]: string } = {
      1: '/documents/argumentaire-vente-educafric-fr.html',
      2: '/documents/tarifs-complets-educafric-2025.html',
      3: '/documents/customized-pricing-proposal-en.html',
      4: '/documents/brochure-commerciale-educafric-fr.html',
      5: '/documents/educafric-commercial-brochure-en.html',
      6: '/documents/contrat-partenariat-commercial-fr.html',
      7: '/documents/Demande_Etablissement_1753390157502.pdf',
      8: '/documents/Demande_ministre-8_1753390184314.pdf',
      9: '/documents/brochure-commerciale-educafric-fr.html',
      10: '/documents/parents_1753390442002.pdf',
      11: '/documents/educafric-commercial-brochure-en.html',
      12: '/documents/argumentaire-vente-educafric-fr.html',
      13: '/documents/educafric-sales-pitch-en.html',
      14: '/documents/proposition-tarifaire-personnalisee-fr.html',
      15: '/documents/customized-pricing-proposal-en.html',
      16: '/documents/brochure-commerciale-educafric-fr.html',
      17: '/documents/educafric-commercial-brochure-en.html',
      18: '/documents/guide-commercial-modules-premium.html',
      19: '/documents/Educafric_Document_Commercial.pdf',
      20: '/documents/Educafric_Presentation.pdf',
      21: '/documents/CONTRAT_PARTENARIAT_ETABLISSEMENTS_FREELANCERS_2025_1753866001857.pdf'
    };
    
    return mappings[docId] || '';
  };

  // Fonction pour ouvrir un document
  const handleViewDocument = (doc: Document) => {
    const url = getDocumentUrl(doc.id);
    if (url) {
      console.log(`🔍 Opening document ID ${doc.id}: ${doc.title}`);
      console.log(`🔗 URL: ${url}`);
      window.open(url, '_blank');
    } else {
      console.error(`❌ No URL found for document ID ${doc.id}`);
      alert(`Document non disponible: ${doc.title}\nID: ${doc.id}\nVeuillez contacter l'administration.`);
    }
  };

  // Fonction pour télécharger un document
  const handleDownloadDocument = (doc: Document) => {
    const url = getDocumentUrl(doc.id);
    if (url) {
      console.log(`💾 Downloading document ID ${doc.id}: ${doc.title}`);
      console.log(`🔗 URL: ${url}`);
      
      const link = window.document.createElement('a');
      link.href = url;
      link.download = doc.title;
      link.target = '_blank';
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
    } else {
      console.error(`❌ No URL found for document ID ${doc.id}`);
      alert(`Document non disponible pour téléchargement: ${doc.title}\nID: ${doc.id}`);
    }
  };

  // Filtrage des documents
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || doc.type === filterType;
    const matchesAccess = filterAccess === 'all' || doc.accessLevel === filterAccess;
    
    return matchesSearch && matchesType && matchesAccess;
  });

  // Vérification des accès
  const hasAccess = (document: Document): boolean => {
    if (!user) return document.accessLevel === 'public';
    
    if (user.role === 'siteadmin' || user.role === 'admin') return true;
    if (document.accessLevel === 'public') return true;
    if (document.accessLevel === 'commercial' && user.role === 'commercial') return true;
    
    return false;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{t.title}</h1>
          <p className="text-lg text-gray-600">{t.subtitle}</p>
        </div>

        {/* Filtres et recherche */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder={t.search}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-documents"
                />
              </div>
              
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger data-testid="select-filter-type">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder={t.filterByType} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t.all}</SelectItem>
                  {Object.entries(t.documentTypes).map(([key, value]) => (
                    <SelectItem key={key} value={key}>{value}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterAccess} onValueChange={setFilterAccess}>
                <SelectTrigger data-testid="select-filter-access">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder={t.filterByAccess} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t.all}</SelectItem>
                  {Object.entries(t.accessLevels).map(([key, value]) => (
                    <SelectItem key={key} value={key}>{value}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Liste des documents */}
        <div className="grid gap-4">
          {filteredDocuments.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">{t.noDocuments}</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            filteredDocuments.map((doc) => (
              <Card key={doc.id} className="hover:shadow-lg transition-shadow" data-testid={`card-document-${doc.id}`}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <File className="h-5 w-5 text-blue-600" />
                        <h3 className="text-lg font-semibold text-gray-900" data-testid={`text-document-title-${doc.id}`}>{doc.title}</h3>
                        <Badge variant="outline" className="ml-2">
                          {t.documentTypes[doc.type]}
                        </Badge>
                        <Badge variant="secondary">
                          {t.accessLevels[doc.accessLevel]}
                        </Badge>
                        <div className="flex items-center gap-1">
                          <Globe className="h-3 w-3" />
                          <span className="text-xs text-gray-500 uppercase">{doc.language}</span>
                        </div>
                      </div>
                      
                      {doc.description && (
                        <p className="text-gray-600 mb-3" data-testid={`text-document-description-${doc.id}`}>{doc.description}</p>
                      )}
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span data-testid={`text-document-size-${doc.id}`}>{t.size}: {doc.size}</span>
                        <span data-testid={`text-document-modified-${doc.id}`}>{t.lastModified}: {doc.lastModified}</span>
                        <span data-testid={`text-document-downloads-${doc.id}`}>{t.downloads}: {doc.downloadCount}</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      {hasAccess(doc) ? (
                        <>
                          <Button 
                            onClick={() => handleViewDocument(doc)} 
                            size="sm" 
                            variant="outline"
                            data-testid={`button-view-${doc.id}`}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            {t.actions.view}
                          </Button>
                          <Button 
                            onClick={() => handleDownloadDocument(doc)} 
                            size="sm"
                            data-testid={`button-download-${doc.id}`}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            {t.actions.download}
                          </Button>
                        </>
                      ) : (
                        <Badge variant="secondary" data-testid={`badge-access-denied-${doc.id}`}>{t.accessDenied}</Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Statistiques */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Statistiques</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600" data-testid="stat-total-documents">{documents.length}</div>
                <div className="text-sm text-gray-600">Total documents</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600" data-testid="stat-accessible-documents">
                  {documents.filter(d => hasAccess(d)).length}
                </div>
                <div className="text-sm text-gray-600">Accessibles</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600" data-testid="stat-total-downloads">
                  {documents.reduce((sum, doc) => sum + doc.downloadCount, 0)}
                </div>
                <div className="text-sm text-gray-600">Téléchargements</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600" data-testid="stat-filtered-documents">
                  {filteredDocuments.length}
                </div>
                <div className="text-sm text-gray-600">Filtrés</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DocumentManagement;