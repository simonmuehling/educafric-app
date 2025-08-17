import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  FileText, 
  Download, 
  Eye, 
  Search, 
  Filter,
  ExternalLink,
  Calendar,
  FileType,
  Languages
} from 'lucide-react';

interface Document {
  name: string;
  type: 'html' | 'pdf';
  category: 'commercial' | 'contract' | 'technical' | 'pricing';
  language: 'fr' | 'en';
  size: string;
  lastModified: string;
  description: string;
}

const DocumentManager: React.FC = () => {
  const { language } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [languageFilter, setLanguageFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const documents: Document[] = [
    {
      name: '00-index-documents-alphabetique',
      type: 'html' as const,
      category: 'technical' as const,
      language: 'fr' as const,
      size: '45 KB',
      lastModified: '2025-08-14',
      description: 'Index alphabétique complet de tous les documents EducAfric'
    },
    {
      name: 'guide-commercial-modules-premium',
      type: 'html' as const,
      category: 'commercial' as const,
      language: 'fr' as const,
      size: '67 KB',
      lastModified: '2025-08-14',
      description: 'Guide commercial détaillé des modules premium et fonctionnalités avancées'
    },
    {
      name: 'tarifs-complets-educafric-2025',
      type: 'html' as const,
      category: 'pricing' as const,
      language: 'fr' as const,
      size: '78 KB',
      lastModified: '2025-08-14',
      description: 'Tarification complète 2025 pour tous les plans d\'abonnement'
    },
    {
      name: 'contrat-partenariat-educafric-2025',
      type: 'html' as const,
      category: 'contract' as const,
      language: 'fr' as const,
      size: '92 KB',
      lastModified: '2025-08-14',
      description: 'Contrat de partenariat officiel établissements-freelancers-parents'
    },
    {
      name: 'CONTRAT_PARTENARIAT_ETABLISSEMENTS_FREELANCERS_2025',
      type: 'pdf' as const,
      category: 'contract' as const,
      language: 'fr' as const,
      size: '234 KB',
      lastModified: '2025-01-15',
      description: 'Version PDF du contrat de partenariat principal'
    },
    {
      name: 'Educafric_Document_Commercial',
      type: 'pdf' as const,
      category: 'commercial' as const,
      language: 'fr' as const,
      size: '156 KB',
      lastModified: '2025-01-15',
      description: 'Document commercial principal EducAfric'
    }
  ].sort((a, b) => a.name.localeCompare(b.name, language === 'fr' ? 'fr' : 'en', {
    sensitivity: 'base',
    numeric: true,
    ignorePunctuation: true
  }));

  const text = {
    fr: {
      title: 'Gestionnaire de Documents',
      subtitle: 'Gestion centralisée des documents EducAfric',
      search: 'Rechercher documents...',
      filters: {
        category: 'Catégorie',
        language: 'Langue',
        type: 'Type',
        all: 'Tous'
      },
      categories: {
        commercial: 'Commercial',
        contract: 'Contrat',
        technical: 'Technique',
        pricing: 'Tarification'
      },
      languages: {
        fr: 'Français',
        en: 'Anglais'
      },
      types: {
        html: 'HTML (Web)',
        pdf: 'PDF'
      },
      actions: {
        view: 'Voir',
        download: 'Télécharger',
        convertToPdf: 'Convertir en PDF'
      },
      stats: {
        total: 'Total Documents',
        html: 'Documents HTML',
        pdf: 'Documents PDF',
        size: 'Taille Totale'
      },
      lastModified: 'Modifié le',
      description: 'Description',
      noResults: 'Aucun document trouvé',
      convertInfo: 'Les documents HTML peuvent être convertis en PDF en utilisant la fonction d\'impression du navigateur'
    },
    en: {
      title: 'Document Manager',
      subtitle: 'Centralized EducAfric document management',
      search: 'Search documents...',
      filters: {
        category: 'Category',
        language: 'Language',
        type: 'Type',
        all: 'All'
      },
      categories: {
        commercial: 'Commercial',
        contract: 'Contract',
        technical: 'Technical',
        pricing: 'Pricing'
      },
      languages: {
        fr: 'French',
        en: 'English'
      },
      types: {
        html: 'HTML (Web)',
        pdf: 'PDF'
      },
      actions: {
        view: 'View',
        download: 'Download',
        convertToPdf: 'Convert to PDF'
      },
      stats: {
        total: 'Total Documents',
        html: 'HTML Documents',
        pdf: 'PDF Documents',
        size: 'Total Size'
      },
      lastModified: 'Modified',
      description: 'Description',
      noResults: 'No documents found',
      convertInfo: 'HTML documents can be converted to PDF using the browser print function'
    }
  };

  const t = text[language as keyof typeof text];

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || doc.category === categoryFilter;
    const matchesLanguage = languageFilter === 'all' || doc.language === languageFilter;
    const matchesType = typeFilter === 'all' || doc.type === typeFilter;
    
    return matchesSearch && matchesCategory && matchesLanguage && matchesType;
  });

  const stats = {
    total: documents.length,
    html: documents.filter(d => d.type === 'html').length,
    pdf: documents.filter(d => d.type === 'pdf').length,
    totalSize: documents.reduce((sum, doc) => {
      const size = parseFloat(doc.size.split(' ')[0]);
      return sum + size;
    }, 0).toFixed(1)
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'commercial': return 'bg-blue-100 text-blue-800';
      case 'contract': return 'bg-purple-100 text-purple-800';
      case 'technical': return 'bg-green-100 text-green-800';
      case 'pricing': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    return type === 'pdf' ? '📄' : '🌐';
  };

  const handleViewDocument = (doc: Document) => {
    const url = `/documents/${doc.name}.${doc.type}`;
    window.open(url, '_blank');
  };

  const handleDownloadDocument = (doc: Document) => {
    const url = `/documents/${doc.name}.${doc.type}`;
    const link = document.createElement('a');
    link.href = url;
    link.download = `${doc.name}.${doc.type}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleConvertToPdf = (doc: Document) => {
    if (doc.type === 'html') {
      const url = `/documents/${doc.name}.${doc.type}`;
      const printWindow = window.open(url, '_blank');
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print();
        };
      }
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t.title}</h1>
          <p className="text-gray-600 mt-2">{t.subtitle}</p>
        </div>
        <Badge variant="outline" className="text-sm">
          {new Date().toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US')}
        </Badge>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t.stats.total}</p>
                <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t.stats.html}</p>
                <p className="text-2xl font-bold text-green-600">{stats.html}</p>
              </div>
              <div className="text-2xl">🌐</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t.stats.pdf}</p>
                <p className="text-2xl font-bold text-red-600">{stats.pdf}</p>
              </div>
              <div className="text-2xl">📄</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t.stats.size}</p>
                <p className="text-2xl font-bold text-purple-600">{stats.totalSize} MB</p>
              </div>
              <FileType className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Filtres et Recherche
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-500" />
              <input
                type="text"
                placeholder={t.search}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">{t.filters.all} - {t.filters.category}</option>
              <option value="commercial">{t.categories.commercial}</option>
              <option value="contract">{t.categories.contract}</option>
              <option value="technical">{t.categories.technical}</option>
              <option value="pricing">{t.categories.pricing}</option>
            </select>

            {/* Language Filter */}
            <select
              value={languageFilter}
              onChange={(e) => setLanguageFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">{t.filters.all} - {t.filters.language}</option>
              <option value="fr">{t.languages.fr}</option>
              <option value="en">{t.languages.en}</option>
            </select>

            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">{t.filters.all} - {t.filters.type}</option>
              <option value="html">{t.types.html}</option>
              <option value="pdf">{t.types.pdf}</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Documents List */}
      <Card>
        <CardHeader>
          <CardTitle>
            Documents ({filteredDocuments.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredDocuments.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">{t.noResults}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredDocuments.map((doc, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{getTypeIcon(doc.type)}</span>
                      <h3 className="font-semibold text-gray-900">
                        {doc.name.replace(/-/g, ' ').replace(/_/g, ' ')}
                      </h3>
                      <Badge className={getCategoryColor(doc.category)}>
                        {t.categories[doc.category as keyof typeof t.categories]}
                      </Badge>
                      <Badge variant="outline">
                        <Languages className="w-3 h-3 mr-1" />
                        {t.languages[doc.language as keyof typeof t.languages]}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">{doc.description}</p>
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {t.lastModified}: {new Date(doc.lastModified).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US')}
                      </span>
                      <span>{doc.size}</span>
                      <span>{doc.type.toUpperCase()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewDocument(doc)}
                      className="flex items-center"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      {t.actions.view}
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDownloadDocument(doc)}
                      className="flex items-center"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      {t.actions.download}
                    </Button>

                    {doc.type === 'html' && (
                      <Button
                        size="sm"
                        onClick={() => handleConvertToPdf(doc)}
                        className="bg-blue-600 hover:bg-blue-700 text-white flex items-center"
                      >
                        <FileText className="w-4 h-4 mr-1" />
                        PDF
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Box */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start">
            <div className="text-2xl mr-3">💡</div>
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">Information</h3>
              <p className="text-blue-800 text-sm">{t.convertInfo}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DocumentManager;