import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  FileText, Download, Share2, Eye, Lock, Unlock, Search, Filter,
  Users, UserCheck, Building, Crown, Shield, Globe
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';

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
  description: string;
}

interface SharePermission {
  userId: string;
  userName: string;
  userRole: string;
  email: string;
  hasAccess: boolean;
}

const DocumentManagement = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('documents');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [showAddDocumentModal, setShowAddDocumentModal] = useState(false);
  const [newDocumentData, setNewDocumentData] = useState({
    title: '',
    type: 'commercial' as const,
    description: '',
    accessLevel: 'commercial' as const
  });

  const text = {
    fr: {
      title: 'Gestion des Documents',
      subtitle: 'Contrôle d\'Accès et Partage de Documents',
      tabs: {
        documents: 'Documents',
        sharing: 'Partage',
        permissions: 'Permissions',
        users: 'Utilisateurs'
      },
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
        download: 'Télécharger',
        share: 'Partager',
        edit: 'Modifier',
        delete: 'Supprimer',
        search: 'Rechercher'
      },
      sharing: {
        shareWith: 'Partager avec',
        selectUsers: 'Sélectionner Utilisateurs',
        grantAccess: 'Accorder l\'Accès',
        revokeAccess: 'Révoquer l\'Accès',
        managePermissions: 'Gérer les Permissions'
      },
      addDocument: 'Ajouter Document',
      addDocumentTitle: 'Titre du document',
      addDocumentDescription: 'Description',
      addDocumentType: 'Type de document',
      addDocumentAccess: 'Niveau d\'accès',
      save: 'Sauvegarder',
      cancel: 'Annuler',
      documentAdded: 'Document ajouté avec succès',
      specialUsers: {
        coo: 'Nguetsop Carine (COO)',
        commercialTeam: 'Équipe Commerciale',
        siteAdmin: 'Administrateur Site'
      }
    },
    en: {
      title: 'Document Management',
      subtitle: 'Access Control and Document Sharing',
      tabs: {
        documents: 'Documents',
        sharing: 'Sharing',
        permissions: 'Permissions',
        users: 'Users'
      },
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
        download: 'Download',
        share: 'Share',
        edit: 'Edit',
        delete: 'Delete',
        search: 'Search'
      },
      sharing: {
        shareWith: 'Share with',
        selectUsers: 'Select Users',
        grantAccess: 'Grant Access',
        revokeAccess: 'Revoke Access',
        managePermissions: 'Manage Permissions'
      },
      addDocument: 'Add Document',
      addDocumentTitle: 'Document title',
      addDocumentDescription: 'Description',
      addDocumentType: 'Document type',
      addDocumentAccess: 'Access level',
      save: 'Save',
      cancel: 'Cancel',
      documentAdded: 'Document added successfully',
      specialUsers: {
        coo: 'Nguetsop Carine (COO)',
        commercialTeam: 'Commercial Team',
        siteAdmin: 'Site Administrator'
      }
    }
  };

  const t = text[language as keyof typeof text];

  // Documents disponibles
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
      downloadCount: 0,
      url: '/documents/guide-notifications-educafric.md',
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
      sharedWith: ['commercial@educafric.com', 'nguetsop.carine@educafric.com'],
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
      sharedWith: ['commercial@educafric.com', 'nguetsop.carine@educafric.com'],
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
      id: 7,
      title: 'Demande d\'Établissement',
      type: 'administrative',
      language: 'fr',
      size: '1.2 MB',
      lastModified: '2025-01-24 21:02',
      accessLevel: 'commercial',
      sharedWith: ['commercial@educafric.com', 'nguetsop.carine@educafric.com', 'simon.admin@educafric.com'],
      downloadCount: 0,
      description: 'Demande d\'établissement pour les nouvelles écoles - Accessible aux commerciaux et site admin'
    },
    {
      id: 8,
      title: 'Demande au Ministre de l\'Éducation',
      type: 'ministerial',
      language: 'fr',
      size: '245 KB',
      lastModified: '2025-01-24 21:03',
      accessLevel: 'restricted',
      sharedWith: ['nguetsop.carine@educafric.com', 'simon.admin@educafric.com'],
      downloadCount: 0,
      description: 'Demande officielle au Ministre - Accès restreint à Carine COO et Site Admin uniquement'
    },
    {
      id: 9,
      title: 'Plans d\'Abonnement Éducafric - Document Commercial',
      type: 'pricing',
      language: 'fr',
      size: '89 KB',
      lastModified: '2025-01-24 21:04',
      accessLevel: 'commercial',
      sharedWith: ['commercial@educafric.com', 'nguetsop.carine@educafric.com', 'simon.admin@educafric.com'],
      downloadCount: 0,
      description: 'Document HTML des plans d\'abonnement pour équipe commerciale'
    },
    {
      id: 10,
      title: 'Guide Parents - Information',
      type: 'training',
      language: 'fr',
      size: '756 KB',
      lastModified: '2025-01-24 21:05',
      accessLevel: 'commercial',
      sharedWith: ['commercial@educafric.com', 'nguetsop.carine@educafric.com', 'simon.admin@educafric.com'],
      downloadCount: 0,
      description: 'Guide d\'information pour les parents - Accessible aux commerciaux et administration'
    },
    {
      id: 11,
      title: 'EDUCAFRIC - Inventaire Complet des Pages / Comprehensive Page Inventory',
      type: 'technical',
      language: 'fr',
      size: '125 KB',
      lastModified: '2025-01-30 08:57',
      accessLevel: 'commercial',
      sharedWith: ['commercial@educafric.com', 'nguetsop.carine@educafric.com', 'simon.admin@educafric.com'],
      downloadCount: 0,
      description: 'Inventaire exhaustif de toutes les 85+ pages de la plateforme Educafric organisées par rôle utilisateur - Document stratégique pour Site Admin et équipe Commerciale'
    },
    {
      id: 12,
      title: 'EDUCAFRIC - Référence du Contenu des Notifications / Notification Content Reference',
      type: 'technical',
      language: 'fr',
      size: '89 KB',
      lastModified: '2025-01-30 09:02',
      accessLevel: 'admin',
      sharedWith: ['nguetsop.carine@educafric.com', 'simon.admin@educafric.com'],
      downloadCount: 0,
      description: 'Référence complète de tous les types de notifications (SMS, Email, WhatsApp, In-App) avec templates, configurations et bonnes pratiques pour équipe technique et commerciale'
    },
    {
      id: 13,
      title: 'EDUCAFRIC - Plans d\'Abonnement Complets / Complete Subscription Plans',
      type: 'pricing',
      language: 'fr',
      size: '156 KB',
      lastModified: '2025-01-30 09:08',
      accessLevel: 'commercial',
      sharedWith: ['commercial@educafric.com', 'nguetsop.carine@educafric.com', 'simon.admin@educafric.com'],
      downloadCount: 0,
      description: 'Documentation complète des 12 plans d\'abonnement Educafric avec tarifs officiels CFA, fonctionnalités détaillées, ROI, et processus d\'achat pour équipe commerciale'
    },
    {
      id: 14,
      title: 'EDUCAFRIC - Information Freemium pour Écoles Africaines / African Schools Freemium Information',
      type: 'marketing',
      language: 'fr',
      size: '98 KB',
      lastModified: '2025-01-30 09:15',
      accessLevel: 'commercial',
      sharedWith: ['commercial@educafric.com', 'nguetsop.carine@educafric.com', 'simon.admin@educafric.com'],
      downloadCount: 0,
      description: 'Guide complet de l\'offre freemium Educafric pour écoles africaines avec fonctionnalités gratuites, limites, stratégie d\'adoption progressive et impact social pour démocratiser l\'éducation numérique'
    },
    {
      id: 15,
      title: 'EDUCAFRIC - Services de Géolocalisation (Comparaison) / Geolocation Services Comparison',
      type: 'technical',
      language: 'fr',
      size: '87 KB',
      lastModified: '2025-01-30 09:25',
      accessLevel: 'commercial',
      sharedWith: ['commercial@educafric.com', 'nguetsop.carine@educafric.com', 'simon.admin@educafric.com', 'support@educafric.com'],
      downloadCount: 0,
      description: 'Comparaison détaillée des solutions de géolocalisation Educafric : smartphones, smartwatches, trackers GPS, badges RFID, transport scolaire avec coûts, fonctionnalités et recommandations par âge'
    },
    {
      id: 16,
      title: 'EDUCAFRIC - Contrat de Partenariat Établissements Scolaires et Freelancers 2025',
      type: 'legal',
      language: 'fr',
      size: '124 KB',
      lastModified: '2025-01-30 09:30',
      accessLevel: 'admin',
      sharedWith: ['legal@educafric.com', 'commercial@educafric.com', 'simon.admin@educafric.com', 'nguetsop.carine@educafric.com'],
      downloadCount: 0,
      description: 'Contrat officiel de partenariat Educafric pour établissements scolaires et freelancers éducatifs avec tarification complète, obligations parties, protection données, et clauses juridiques OHADA'
    },
    {
      id: 17,
      title: 'EDUCAFRIC - Économies Financières pour Écoles Africaines / Financial Savings for African Schools',
      type: 'business',
      language: 'fr',
      size: '142 KB',
      lastModified: '2025-01-30 09:35',
      accessLevel: 'commercial',
      sharedWith: ['commercial@educafric.com', 'nguetsop.carine@educafric.com', 'simon.admin@educafric.com', 'audit@educafric.com'],
      downloadCount: 0,
      description: 'Analyse détaillée des économies réalisables avec Educafric vs méthodes traditionnelles : 73% d\'économies, ROI 493%, comparaifs coûts détaillés, exemples concrets écoles partenaires, guide évaluation personnalisée'
    },
    {
      id: 18,
      title: 'EDUCAFRIC - Brochure Commerciale Persuasive / Persuasive Commercial Brochure',
      type: 'marketing',
      language: 'fr',
      size: '78 KB',
      lastModified: '2025-01-30 09:40',
      accessLevel: 'commercial',
      sharedWith: ['commercial@educafric.com', 'nguetsop.carine@educafric.com', 'simon.admin@educafric.com', 'equipe-vente@educafric.com'],
      downloadCount: 0,
      description: 'Brochure commerciale persuasive pour équipes de vente ciblant établissements, parents et freelancers avec arguments percutants, témoignages, offres spéciales et appels à l\'action sans aspects techniques'
    }
  ];

  // Utilisateurs pour le partage de documents
  const availableUsers: SharePermission[] = [
    {
      userId: 'nguetsop.carine',
      userName: 'Nguetsop Carine',
      userRole: 'COO',
      email: 'nguetsop.carine@educafric.com',
      hasAccess: true
    },
    {
      userId: 'commercial.djomo',
      userName: 'M. Djomo (Commercial)',
      userRole: 'Commercial Lead',
      email: 'commercial@educafric.com',
      hasAccess: true
    },
    {
      userId: 'teacher.martin',
      userName: 'Mme Martin (Enseignant)',
      userRole: 'Teacher',
      email: 'teacher.demo@test?.educafric?.com',
      hasAccess: false
    },
    {
      userId: 'parent.kouam',
      userName: 'Mme Kouam (Parent)',
      userRole: 'Parent',
      email: 'parent.demo@test?.educafric?.com',
      hasAccess: false
    },
    {
      userId: 'student.paul',
      userName: 'Paul Kouam (Étudiant)',
      userRole: 'Student',
      email: 'student.demo@test?.educafric?.com',
      hasAccess: false
    }
  ];

  const isSiteAdmin = () => {
    return user?.role === 'siteadmin' || user?.role === 'admin';
  };

  const handleViewDocument = async (document: Document) => {
    try {
      // Utiliser l'API backend pour visualiser le document avec authentification
      const response = await fetch(`/api/documents/${document.id}/view`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Accept': 'application/pdf',
        },
      });

      if (response.ok) {
        // Créer blob URL pour afficher le PDF
        const blob = await response.blob();
        const blobUrl = window?.URL?.createObjectURL(blob);
        window.open(blobUrl, '_blank');
        
        console.log(`📄 Document ouvert: ${document.title || ''} (ID: ${document.id})`);
        
        // Nettoyer l'URL après 1 minute
        setTimeout(() => window?.URL?.revokeObjectURL(blobUrl), 60000);
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.error('Document view error:', error);
      // Fallback pour les documents markdown et autres
      const directLinks: { [key: number]: string } = {
        11: '/EDUCAFRIC_COMPREHENSIVE_PAGE_INVENTORY.md',
        12: '/EDUCAFRIC_NOTIFICATION_CONTENT_REFERENCE.md',
        13: '/EDUCAFRIC_PLANS_ABONNEMENT_COMPLETS.md',
        14: '/EDUCAFRIC_INFORMATION_FREEMIUM_ECOLES_AFRICAINES.md',
        15: '/EDUCAFRIC_SERVICES_GEOLOCALISATION_COMPARISON.md',
        16: '/EDUCAFRIC_CONTRAT_PARTENARIAT_ETABLISSEMENTS_FREELANCERS_2025.md',
        17: '/EDUCAFRIC_ECONOMIES_FINANCIERES_ECOLES_AFRICAINES.md',
        18: '/EDUCAFRIC_BROCHURE_COMMERCIALE_PERSUASIVE.md'
      };
      
      const directUrl = directLinks[document.id];
      if (directUrl) {
        window.open(directUrl, '_blank');
        console.log(`📄 Document ouvert via lien direct: ${document.title || ''}`);
      } else {
        alert(`Impossible d'ouvrir le document: ${document.title || ''}\nDescription: ${document.description || ''}`);
      }
    }
  };

  const handleDownload = (document: Document) => {
    // Gestion des téléchargements avec les vrais fichiers
    const downloadLinks: { [key: number]: string } = {
      7: '/documents/Demande_Etablissement_1753390157502.pdf',
      8: '/documents/Demande_ministre-8_1753390184314.pdf', 
      9: '/documents/Educafric_Plans_Abonnement_Complets_FR (1)_1753390205509.html',
      10: '/documents/parents_1753390442002.pdf',
      11: '/EDUCAFRIC_COMPREHENSIVE_PAGE_INVENTORY.md',
      12: '/EDUCAFRIC_NOTIFICATION_CONTENT_REFERENCE.md',
      13: '/EDUCAFRIC_PLANS_ABONNEMENT_COMPLETS.md',
      14: '/EDUCAFRIC_INFORMATION_FREEMIUM_ECOLES_AFRICAINES.md',
      15: '/EDUCAFRIC_SERVICES_GEOLOCALISATION_COMPARISON.md',
      16: '/EDUCAFRIC_CONTRAT_PARTENARIAT_ETABLISSEMENTS_FREELANCERS_2025.md',
      17: '/EDUCAFRIC_ECONOMIES_FINANCIERES_ECOLES_AFRICAINES.md',
      18: '/EDUCAFRIC_BROCHURE_COMMERCIALE_PERSUASIVE.md'
    };

    const downloadUrl = downloadLinks[document.id];
    if (downloadUrl) {
      const link = window?.document?.createElement('a');
      link.href = downloadUrl;
      link.download = document.title;
      link.click();
    } else {
      // Simulation pour les anciens documents
      alert(`Téléchargement de: ${document.title || ''}`);
    }
  };

  const handleShareDocument = (document: Document) => {
    setSelectedDocument(document);
    setShowShareModal(true);
  };

  const handleToggleUserAccess = (userId: string, hasAccess: boolean) => {
    // Simulation - dans la vraie implémentation, API call
    console.log(`Toggle access for ${userId}: ${hasAccess}`);
  };

  const handleAddDocument = () => {
    // Create a new document with the form data
    const newDocument: Document = {
      id: (Array.isArray(documents) ? documents.length : 0) + 11, // Get next available ID
      title: newDocumentData.title,
      type: newDocumentData.type,
      language: 'fr',
      size: '0 KB',
      lastModified: new Date().toISOString().slice(0, 16).replace('T', ' '),
      accessLevel: newDocumentData.accessLevel,
      sharedWith: newDocumentData.accessLevel === 'commercial' ? ['commercial@educafric.com', 'nguetsop.carine@educafric.com', 'simon.admin@educafric.com'] : [],
      downloadCount: 0,
      description: newDocumentData.description
    };
    
    // In a real implementation, this would be an API call
    documents.push(newDocument);
    
    // Reset form and close modal
    setNewDocumentData({
      title: '',
      type: 'commercial',
      description: '',
      accessLevel: 'commercial'
    });
    setShowAddDocumentModal(false);
    
    // Show success message
    alert(t.documentAdded);
  };

  const getAccessLevelIcon = (level: string) => {
    switch (level) {
      case 'public': return <Globe className="w-4 h-4 text-green-500" />;
      case 'commercial': return <Users className="w-4 h-4 text-blue-500" />;
      case 'admin': return <Shield className="w-4 h-4 text-red-500" />;
      case 'restricted': return <Lock className="w-4 h-4 text-gray-500" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'pricing': return <Crown className="w-4 h-4 text-yellow-500" />;
      case 'commercial': return <Building className="w-4 h-4 text-blue-500" />;
      default: return <FileText className="w-4 h-4 text-gray-500" />;
    }
  };



  const hasAccessToDocument = (doc: Document) => {
    // Vérification d'accès basée sur les permissions et rôles
    if (doc.accessLevel === 'public') return true;
    if (doc.accessLevel === 'restricted') {
      // Accès restreint pour documents ministériels - Carine COO et Site Admin uniquement
      return user?.email === 'nguetsop.carine@educafric.com' || 
             user?.email === 'simon.admin@educafric.com' ||
             user?.role === 'siteadmin';
    }
    if (doc.accessLevel === 'commercial') {
      // Accès commercial pour équipe commerciale et administration
      return user?.role === 'commercial' || 
             user?.email === 'nguetsop.carine@educafric.com' || 
             user?.email === 'simon.admin@educafric.com' ||
             user?.role === 'siteadmin';
    }
    if (doc.accessLevel === 'admin') {
      return user?.role === 'siteadmin' || user?.role === 'admin';
    }
    return false;
  };

  const filteredDocuments = (Array.isArray(documents) ? documents : []).filter(doc => {
    if (!doc) return false;
    const matchesSearch = doc?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc?.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || doc.type === filterType;
    const hasAccess = hasAccessToDocument(doc);
    return matchesSearch && matchesType && hasAccess;
  });

  const renderDocumentsTab = () => (
    <div className="space-y-6">
      {/* Filters and Search */}
      <div className="flex gap-4 items-center">
        <div className="flex-1">
          <Input
            placeholder={t?.actions?.search + '...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e?.target?.value)}
            className="max-w-md"
          />
        </div>
        {isSiteAdmin() && (
          <Button 
            onClick={() => setShowAddDocumentModal(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Upload className="w-4 h-4 mr-2" />
            {t.addDocument}
          </Button>
        )}
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les Types</SelectItem>
            <SelectItem value="pricing">{t?.documentTypes?.pricing}</SelectItem>
            <SelectItem value="commercial">{t?.documentTypes?.commercial}</SelectItem>
            <SelectItem value="policy">{t?.documentTypes?.policy}</SelectItem>
            <SelectItem value="technical">{t?.documentTypes?.technical}</SelectItem>
            <SelectItem value="administrative">{t?.documentTypes?.administrative}</SelectItem>
            <SelectItem value="ministerial">{t?.documentTypes?.ministerial}</SelectItem>
            <SelectItem value="training">{t?.documentTypes?.training}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Documents Grid */}
      <div className="grid gap-4">
        {(Array.isArray(filteredDocuments) ? filteredDocuments : []).map((doc) => (
          <Card key={doc.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {getTypeIcon(doc.type)}
                    <h3 className="font-semibold">{doc.title || ''}</h3>
                    <Badge variant="outline" className="text-xs">
                      {doc?.language?.toUpperCase()}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3">{doc.description || ''}</p>
                  
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      {getAccessLevelIcon(doc.accessLevel)}
                      {t.accessLevels[doc.accessLevel as keyof typeof t.accessLevels]}
                    </span>
                    <span>{doc.size}</span>
                    <span>{doc.downloadCount} téléchargements</span>
                    <span>Modifié: {doc.lastModified}</span>
                  </div>
                  
                  {doc.(Array.isArray(sharedWith) ? sharedWith.length : 0) > 0 && (
                    <div className="mt-2">
                      <p className="text-xs text-gray-500 mb-1">Partagé avec:</p>
                      <div className="flex flex-wrap gap-1">
                        {doc.sharedWith.map((email, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {email}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2 ml-4">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleViewDocument(doc)}
                  >
                    <Eye className="w-3 h-3" />
                    {t?.actions?.view}
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleDownload(doc)}
                  >
                    <Download className="w-3 h-3" />
                    {t?.actions?.download}
                  </Button>
                  {isSiteAdmin() && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleShareDocument(doc)}
                    >
                      <Share2 className="w-3 h-3" />
                      {t?.actions?.share}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderSharingTab = () => (
    <div className="space-y-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Contrôle d'Accès aux Documents</h3>
        <p className="text-sm text-gray-600">
          En tant qu'administrateur site, vous contrôlez qui peut accéder à quels documents.
        </p>
      </div>

      {/* Special Users Section */}
      <Card>
        <CardHeader>
          <h4 className="font-semibold">Utilisateurs Spéciaux</h4>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Crown className="w-5 h-5 text-yellow-500" />
              <div>
                <p className="font-medium">{t?.specialUsers?.coo}</p>
                <p className="text-sm text-gray-600">COO et backup administrateur</p>
              </div>
            </div>
            <Badge variant="default">Accès Complet</Badge>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-blue-500" />
              <div>
                <p className="font-medium">{t?.specialUsers?.commercialTeam}</p>
                <p className="text-sm text-gray-600">Accès documents commerciaux</p>
              </div>
            </div>
            <Badge variant="secondary">Accès Sélectif</Badge>
          </div>
        </CardContent>
      </Card>

      {/* User Permissions */}
      <Card>
        <CardHeader>
          <h4 className="font-semibold">Gérer les Permissions d'Accès</h4>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {(Array.isArray(availableUsers) ? availableUsers : []).map((userPerm) => (
              <div key={userPerm.userId} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <UserCheck className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="font-medium">{userPerm.userName}</p>
                    <p className="text-sm text-gray-600">{userPerm.email || ''} • {userPerm.userRole}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={userPerm.hasAccess}
                    onCheckedChange={(checked) => 
                      handleToggleUserAccess(userPerm.userId, checked as boolean)
                    }
                  />
                  <span className="text-sm">
                    {userPerm.hasAccess ? 'Accès Accordé' : 'Accès Refusé'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Share Modal Component
  const ShareModal = () => {
    if (!showShareModal || !selectedDocument) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold">Partager Document</h3>
                <p className="text-sm text-gray-600">{selectedDocument.title || ''}</p>
              </div>
              <Button variant="ghost" onClick={() => setShowShareModal(false)}>×</Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {(Array.isArray(availableUsers) ? availableUsers : []).map((userPerm) => (
                <div key={userPerm.userId} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <UserCheck className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="font-medium">{userPerm.userName}</p>
                      <p className="text-sm text-gray-600">{userPerm.email || ''}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={selectedDocument?.sharedWith?.includes(userPerm.email)}
                      onCheckedChange={(checked) => 
                        console.log(`Toggle access for ${userPerm.email || ''}: ${checked}`)
                      }
                    />
                    <span className="text-sm">
                      {selectedDocument?.sharedWith?.includes(userPerm.email) ? 'Partagé' : 'Non Partagé'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button onClick={() => setShowShareModal(false)}>Sauvegarder</Button>
              <Button variant="outline" onClick={() => setShowShareModal(false)}>Annuler</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">{t.title || ''}</h2>
        <p className="text-gray-600">{t.subtitle}</p>
        {isSiteAdmin() && (
          <div className="mt-2 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <Shield className="w-4 h-4 inline mr-1" />
              Vous avez les privilèges d'administrateur pour gérer l'accès aux documents
            </p>
          </div>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="documents" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            {t?.tabs?.documents}
          </TabsTrigger>
          <TabsTrigger value="sharing" className="flex items-center gap-2">
            <Share2 className="w-4 h-4" />
            {t?.tabs?.sharing}
          </TabsTrigger>
          <TabsTrigger value="permissions" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            {t?.tabs?.permissions}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="documents">
          {renderDocumentsTab()}
        </TabsContent>

        <TabsContent value="sharing">
          {renderSharingTab()}
        </TabsContent>

        <TabsContent value="permissions">
          <div className="text-center py-12">
            <p className="text-gray-600">Gestion avancée des permissions (en développement)</p>
          </div>
        </TabsContent>
      </Tabs>

      <ShareModal />
      
      {/* Add Document Modal */}
      {showAddDocumentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">{t.addDocument}</h3>
                <Button variant="ghost" onClick={() => setShowAddDocumentModal(false)}>×</Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">{t.addDocumentTitle}</label>
                <Input
                  value={newDocumentData.title || ''}
                  onChange={(e) => setNewDocumentData({...newDocumentData, title: e?.target?.value})}
                  placeholder="Nom du document..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">{t.addDocumentDescription}</label>
                <Input
                  value={newDocumentData.description || ''}
                  onChange={(e) => setNewDocumentData({...newDocumentData, description: e?.target?.value})}
                  placeholder="Description du document..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">{t.addDocumentType}</label>
                <Select 
                  value={newDocumentData.type} 
                  onValueChange={(value) => setNewDocumentData({...newDocumentData, type: value as any})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="commercial">{t?.documentTypes?.commercial}</SelectItem>
                    <SelectItem value="administrative">{t?.documentTypes?.administrative}</SelectItem>
                    <SelectItem value="ministerial">{t?.documentTypes?.ministerial}</SelectItem>
                    <SelectItem value="pricing">{t?.documentTypes?.pricing}</SelectItem>
                    <SelectItem value="technical">{t?.documentTypes?.technical}</SelectItem>
                    <SelectItem value="training">{t?.documentTypes?.training}</SelectItem>
                    <SelectItem value="policy">{t?.documentTypes?.policy}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">{t.addDocumentAccess}</label>
                <Select 
                  value={newDocumentData.accessLevel} 
                  onValueChange={(value) => setNewDocumentData({...newDocumentData, accessLevel: value as any})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">{t?.accessLevels?.public}</SelectItem>
                    <SelectItem value="commercial">{t?.accessLevels?.commercial}</SelectItem>
                    <SelectItem value="admin">{t?.accessLevels?.admin}</SelectItem>
                    <SelectItem value="restricted">{t?.accessLevels?.restricted}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button onClick={handleAddDocument} className="flex-1">
                  {t.save}
                </Button>
                <Button variant="outline" onClick={() => setShowAddDocumentModal(false)} className="flex-1">
                  {t.cancel}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default DocumentManagement;