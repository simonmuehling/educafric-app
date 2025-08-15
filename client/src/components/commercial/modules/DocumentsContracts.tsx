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
  // 🚨 CRITICAL: ALL documents MUST be placed in /public/documents/ directory
  // 🚨 CRITICAL: ALL URLs must start with /documents/ (not /public/documents/)
  // 🚨 CRITICAL: ALL filenames must use lowercase kebab-case naming
  // 🚨 CRITICAL: Follow exact pattern of "Kit de Prospection Educafric Complet" (working reference)
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
      format: 'PDF',
      url: '/documents/guide-commercial-modules-premium.html',
      description: 'Kit complet de prospection pour commerciaux : scripts téléphone, argumentaires, messages WhatsApp, stratégies ciblage Douala/Yaoundé'
    },
    {
      id: 2,
      name: 'Guide Commercial Modules Premium/Freemium (FR/EN)',
      type: 'guide',
      category: 'marketing', 
      school: 'Équipe Commerciale',
      date: '2025-08-15',
      status: 'finalized',
      size: '15.3 KB',
      format: 'PDF',
      url: '/documents/guide-commercial-modules-premium.html',
      description: 'Guide bilingue détaillé modules freemium vs premium : Écoles (6 modules bloqués), Parents (5 modules), Freelancers (8 modules) avec tarification réelle - Bilingual detailed guide for freemium vs premium modules: Schools (6 blocked modules), Parents (5 modules), Freelancers (8 modules) with real pricing'
    },
    {
      id: 26,
      name: 'EDUCAFRIC Prospection Kit - English Version',
      type: 'guide',
      category: 'marketing',
      school: 'Sales Team',
      date: '2025-08-12',
      status: 'finalized',
      size: '12.4 KB',
      format: 'PDF',
      url: '/documents/educafric-sales-pitch-en.html',
      description: 'Complete English sales kit for Douala & Yaoundé: phone scripts, face-to-face pitch, WhatsApp templates, targeting strategy with cultural considerations'
    },
    
    // Proposal Request Documents - NEW
    {
      id: 50,
      name: 'Proposal Request - Parent/School Partnership',
      type: 'proposal',
      category: 'templates',
      school: 'Client Communication',
      date: '2025-08-14',
      status: 'finalized',
      size: '5.2 KB',
      format: 'PDF',
      url: '/documents/parents_1755170063211.pdf',
      description: 'Official proposal request document for schools and parents: Educafric services, geolocation, SMS notifications, 2025 pricing'
    },
    
    // Partnership Contracts - UPDATED WITH REAL PRICING 2025
    {
      id: 27,
      name: 'EDUCAFRIC Contrat Officiel 2025 Actualisé',
      type: 'contract',
      category: 'contracts',
      school: 'Tous Partenaires',
      date: '2025-01-15',
      status: 'finalized',
      size: '52.3 KB',
      format: 'HTML',
      url: '/documents/educafric-contrat-officiel-2025-actualise.html',
      description: 'Contrat officiel actualisé avec prix réels - École Publique: 25.000 CFA/an, École Privée: 75.000 CFA/an, Freelancers: 12.500-25.000 CFA'
    },
    {
      id: 28,
      name: 'Contrat Commercial EDUCAFRIC 2025 Actualisé',
      type: 'contract',
      category: 'contracts',
      school: 'Commercial Sales',
      date: '2025-01-15',
      status: 'finalized',
      size: '48.7 KB',
      format: 'HTML',
      url: '/documents/contrat-commercial-educafric-2025-actualise.html',
      description: 'Contrat commercial actualisé pour ventes - Toutes les offres avec tarification réelle et remises familiales'
    },
    {
      id: 51,
      name: 'Contrat Partenariat Établissements-Freelancers-Parents 2025 Actualisé',
      type: 'contract',
      category: 'contracts',
      school: 'Tous Partenaires',
      date: '2025-01-15',
      status: 'finalized',
      size: '56.2 KB',
      format: 'HTML',
      url: '/documents/contrat-partenariat-etablissements-freelancers-parents-2025-actualise.html',
      description: 'Contrat de partenariat complet actualisé avec tarification réelle pour écoles, freelancers et parents'
    },
    {
      id: 52,
      name: 'Partnership Contract Schools-Freelancers-Parents 2025 (English Updated)',
      type: 'contract',
      category: 'contracts',
      school: 'All Partners',
      date: '2025-01-15',
      status: 'finalized',
      size: '54.1 KB',
      format: 'HTML',
      url: '/documents/partnership-contract-schools-freelancers-parents-2025-en.html',
      description: 'Updated English partnership contract with real pricing for schools, freelancers and parents - No Enterprise plans'
    },
    
    // Bulk Import Templates - NEW
    {
      id: 29,
      name: 'Modèle Excel - Import Enseignants en Masse',
      type: 'template',
      category: 'templates',
      school: 'Administrations',
      date: '2025-08-14',
      status: 'finalized',
      size: '15.3 KB',
      format: 'XLSX',
      url: '/api/bulk/template/teachers',
      description: 'Modèle Excel pré-configuré pour import massif d\'enseignants avec colonnes validation et données échantillons'
    },
    {
      id: 30,
      name: 'Modèle Excel - Import Élèves en Masse',
      type: 'template',
      category: 'templates',
      school: 'Administrations',
      date: '2025-08-14',
      status: 'finalized',
      size: '16.7 KB',
      format: 'XLSX',
      url: '/api/bulk/template/students',
      description: 'Modèle Excel pré-configuré pour import massif d\'élèves avec validation données et gestion contacts parents'
    },
    {
      id: 31,
      name: 'Teacher Bulk Import Template (Excel)',
      type: 'template',
      category: 'templates',
      school: 'Administrations',
      date: '2025-08-14',
      status: 'finalized',
      size: '15.3 KB',
      format: 'XLSX',
      url: '/api/bulk/template/teachers',
      description: 'Pre-configured Excel template for bulk teacher import with validation columns and sample data'
    },
    {
      id: 32,
      name: 'Student Bulk Import Template (Excel)',
      type: 'template',
      category: 'templates',
      school: 'Administrations',
      date: '2025-08-14',
      status: 'finalized',
      size: '16.7 KB',
      format: 'XLSX',
      url: '/api/bulk/template/students',
      description: 'Pre-configured Excel template for bulk student import with data validation and parent contact management'
    },
    {
      id: 3,
      name: 'Tarifs et Plans Complets Français - Mise à Jour /subscribe',
      type: 'pricing',
      category: 'contracts',
      school: 'Documentation Officielle',
      date: '2025-08-15',
      status: 'finalized',
      size: '12.7 KB',
      format: 'PDF',
      url: '/documents/tarifs-complets-educafric-2025.html',
      description: 'Tarification complète EDUCAFRIC mise à jour depuis /subscribe : École Publique (250,000 CFA/an), École Privée (750,000 CFA/an), École Entreprise (150,000 CFA/an), Freelancers Professional (120,000 CFA/an), avec toutes les fonctionnalités détaillées'
    },
    {
      id: 4,
      name: 'Complete Pricing Plans English - Updated from /subscribe',
      type: 'pricing',
      category: 'contracts',
      school: 'Official Documentation',
      date: '2025-08-15',
      status: 'finalized',
      size: '11.9 KB',
      format: 'PDF',
      url: '/documents/customized-pricing-proposal-en.html',
      description: 'Complete EDUCAFRIC pricing updated from /subscribe: Public School (250,000 CFA/year), Private School (750,000 CFA/year), Enterprise School (150,000 CFA/year), Freelancers Professional (120,000 CFA/year), with all detailed features'
    },
    {
      id: 5,
      name: 'SYSTÈME DE NOTIFICATIONS EDUCAFRIC COMPLET (FR/EN)',
      type: 'guide',
      category: 'technical',
      school: 'Support Technique',
      date: '2025-08-15',
      status: 'finalized',
      size: '11.2 KB',
      format: 'PDF',
      url: '/documents/notifications-system-educafric-fr.html',
      description: 'SYSTÈME DE NOTIFICATIONS EDUCAFRIC COMPLET BILINGUE : SMS (Vonage), WhatsApp Business API, Email (Hostinger SMTP), Notifications Push PWA, alertes géolocalisation, notifications académiques, communications parents-écoles, templates bilingues contextuels - COMPLETE BILINGUAL EDUCAFRIC NOTIFICATION SYSTEM: SMS (Vonage), WhatsApp Business API, Email (Hostinger SMTP), PWA Push notifications, geolocation alerts, academic notifications, parent-school communications, contextual bilingual templates'
    },
    {
      id: 6,
      name: 'Géolocalisation Complète EDUCAFRIC - Tous Modules (FR)',
      type: 'guide',
      category: 'technical',
      school: 'Documentation Technique',
      date: '2025-08-15',
      status: 'finalized',
      size: '8.7 KB',
      format: 'PDF',
      url: '/documents/geolocalisation-resume-educafric-fr.html',
      description: 'Système de géolocalisation EDUCAFRIC COMPLET : GPS temps réel, zones de sécurité, géofencing, alertes automatiques SMS/WhatsApp/Email, historique complet, tracking tablettes/smartwatches/téléphones, optimisation itinéraires, automatisation présence, alertes urgence parents/écoles'
    },
    {
      id: 7,
      name: 'Complete EDUCAFRIC Geolocation - All Modules (EN)',
      type: 'guide',
      category: 'technical',
      school: 'Technical Documentation',
      date: '2025-08-15',
      status: 'finalized',
      size: '8.2 KB',
      format: 'PDF',
      url: '/documents/educafric-geolocation-complete-en.html',
      description: 'COMPLETE EDUCAFRIC geolocation system: Real-time GPS, security zones, geofencing, automatic SMS/WhatsApp/Email alerts, full history, tablet/smartwatch/phone tracking, route optimization, attendance automation, emergency alerts for parents/schools'
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
      format: 'PDF',
      url: '/documents/tarifs-complets-educafric-2025.html',
      description: 'Tarifs complets EDUCAFRIC 2025 actualisés avec prix réels : École Publique (25,000 CFA/an), École Privée (75,000 CFA/an), sans plan Entreprise'
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
    },

    // Nouveaux documents bilingues requis
    {
      id: 17,
      name: 'Contrat de Partenariat Commercial (FR)',
      type: 'contract',
      category: 'legal',
      school: 'Documents Légaux',
      date: '2025-08-11',
      status: 'finalized',
      size: '2.8 MB',
      format: 'HTML',
      url: '/documents/contrat-partenariat-commercial-fr.html',
      description: 'Contrat de partenariat commercial pour établissements scolaires - Version française'
    },
    {
      id: 18,
      name: 'Commercial Partnership Contract (EN)',
      type: 'contract',
      category: 'legal',
      school: 'Legal Documents',
      date: '2025-08-11',
      status: 'finalized',
      size: '2.7 MB',
      format: 'HTML',
      url: '/documents/commercial-partnership-contract-en.html',
      description: 'Commercial partnership contract for educational institutions - English version'
    },
    {
      id: 19,
      name: 'Brochure Commerciale Educafric (FR)',
      type: 'brochure',
      category: 'marketing',
      school: 'Marketing',
      date: '2025-08-11',
      status: 'finalized',
      size: '1.5 MB',
      format: 'HTML',
      url: '/documents/brochure-commerciale-educafric-fr.html',
      description: 'Brochure commerciale complète avec tarifs et fonctionnalités - Version française'
    },
    {
      id: 21,
      name: 'Guide Commercial Modules Premium/Freemium',
      type: 'guide',
      category: 'technical',
      school: 'Documentation Technique',
      date: '2025-08-11',
      status: 'finalized',
      size: '245 KB',
      format: 'PDF',
      url: '/documents/guide-commercial-modules-premium.html',
      description: 'Guide complet des modules premium et freemium pour prospects'
    },
    {
      id: 22,
      name: 'Kit de Prospection Educafric Complet',
      type: 'guide',
      category: 'technical',
      school: 'Commercial Team',
      date: '2025-08-11',
      status: 'finalized',
      size: '567 KB',
      format: 'PDF',
      url: '/documents/guide-commercial-modules-premium.html',
      description: 'Kit complet de prospection avec argumentaires et objections'
    },
    {
      id: 23,
      name: 'Proposition Tarifaire Personnalisée (FR)',
      type: 'quote',
      category: 'contracts',
      school: 'Propositions Commerciales',
      date: '2025-08-11',
      status: 'draft',
      size: '892 KB',
      format: 'HTML',
      url: '/documents/proposition-tarifaire-personnalisee-fr.html',
      description: 'Template de proposition tarifaire personnalisée pour prospects - Version française'
    },
    {
      id: 24,
      name: 'Customized Pricing Proposal (EN)',
      type: 'quote',
      category: 'contracts',
      school: 'Commercial Proposals',
      date: '2025-08-11',
      status: 'draft',
      size: '867 KB',
      format: 'HTML',
      url: '/documents/customized-pricing-proposal-en.html',
      description: 'Customized pricing proposal template for prospects - English version'
    },
    {
      id: 25,
      name: 'ARGUMENTAIRE DE VENTE EDUCAFRIC COMPLET (FR/EN) - LARGE VERSION',
      type: 'presentation',
      category: 'marketing',
      school: 'Équipe Commerciale',
      date: '2025-08-15',
      status: 'finalized',
      size: '4.8 MB',
      format: 'HTML',
      url: '/documents/argumentaire-vente-educafric-fr.html',
      description: 'ARGUMENTAIRE DE VENTE COMPLET BILINGUE avec objections et réponses, scripts téléphone, présentation face-à-face, templates WhatsApp - Version française et anglaise élargie - COMPLETE BILINGUAL SALES PITCH with objections, phone scripts, face-to-face presentation, WhatsApp templates - Extended French and English version'
    },
    {
      id: 26,
      name: 'Educafric Sales Pitch (EN)',
      type: 'presentation',
      category: 'marketing',
      school: 'Sales Team',
      date: '2025-08-11',
      status: 'finalized',
      size: '2.0 MB',
      format: 'HTML',
      url: '/documents/educafric-sales-pitch-en.html',
      description: 'Complete sales pitch with objections and responses - English version'
    },
    {
      id: 27,
      name: 'TARIFS COMPLETS EDUCAFRIC - CAMEROUN 2025',
      type: 'guide',
      category: 'technical',
      school: 'Tarification',
      date: '2025-08-11',
      status: 'finalized',
      size: '234 KB',
      format: 'PDF',
      url: '/documents/tarifs-complets-educafric-2025.html',
      description: 'Tarifs détaillés pour géolocalisation, abonnements et services - Cameroun 2025'
    },
    {
      id: 28,
      name: 'Notifications System (EN)',
      type: 'guide',
      category: 'technical',
      school: 'Technical Documentation',
      date: '2025-08-11',
      status: 'finalized',
      size: '345 KB',
      format: 'PDF',
      url: '/documents/educafric-sales-pitch-en.html',
      description: 'Complete notification system documentation - English version'
    },
    {
      id: 29,
      name: 'Géolocalisation Résumé (FR)',
      type: 'guide',
      category: 'training',
      school: 'Formation',
      date: '2025-08-11',
      status: 'finalized',
      size: '267 KB',
      format: 'PDF',
      url: '/documents/brochure-commerciale-educafric-fr.html',
      description: 'Résumé complet du système de géolocalisation - Version française'
    },
    {
      id: 30,
      name: 'Geolocation Summary (EN)',
      type: 'guide',
      category: 'training',
      school: 'Training',
      date: '2025-08-11',
      status: 'finalized',
      size: '245 KB',
      format: 'PDF',
      url: '/documents/educafric-commercial-brochure-en.html',
      description: 'Complete geolocation system summary - English version'
    }
  ];

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleViewDocument = (doc: any) => {
    // For XLSX templates, open directly via API
    if (doc.format === 'XLSX' && doc.url.includes('/api/bulk/template/')) {
      window.open(doc.url, '_blank');
      toast({
        title: language === 'fr' ? 'Modèle Excel téléchargé' : 'Excel Template Downloaded',
        description: language === 'fr' ? `${doc.name} a été téléchargé` : `${doc.name} has been downloaded`,
      });
    } else if (doc.format === 'MD') {
      // For MD files, open PDF conversion directly
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
    // For XLSX templates, download directly via API
    if (doc.format === 'XLSX' && doc.url.includes('/api/bulk/template/')) {
      window.open(doc.url, '_blank');
      toast({
        title: language === 'fr' ? 'Modèle Excel téléchargé' : 'Excel Template Downloaded',
        description: language === 'fr' ? `${doc.name} est prêt à utiliser` : `${doc.name} is ready to use`,
      });
    } else if (doc.format === 'MD') {
      // For MD files, offer PDF conversion option
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
              {['all', 'marketing', 'contracts', 'templates', 'technical', 'legal'].map((category) => (
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
                   category === 'templates' ? t.templates :
                   category === 'technical' ? 'Technique' :
                   category === 'legal' ? t.legal : category}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Documents Grid - Mobile Optimized */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {filteredDocuments.map((doc) => (
          <Card key={`doc-${doc.id}-${doc.name}`} className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="pb-3 px-3 sm:px-6">
              <div className="flex flex-col space-y-3">
                {/* Mobile: Title and Icon on top, badges below */}
                <div className="flex items-start gap-2">
                  {getTypeIcon(doc.type)}
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-sm font-semibold text-gray-900 leading-tight break-words">
                      <span className="block sm:hidden">{/* Mobile: Allow 2-line wrap */}
                        {doc.name}
                      </span>
                      <span className="hidden sm:block truncate">{/* Desktop: Single line */}
                        {doc.name}
                      </span>
                    </CardTitle>
                    <CardDescription className="text-xs text-gray-500 mt-1 truncate">
                      {doc.school}
                    </CardDescription>
                  </div>
                </div>
                {/* Badges row */}
                <div className="flex gap-2 justify-start">
                  <Badge className={`text-xs ${getStatusColor(doc.status)}`}>
                    {doc.status === 'finalized' ? 'Finalisé' : doc.status}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {doc.format}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0 px-3 sm:px-6">
              <p className="text-xs text-gray-600 mb-3 line-clamp-2 sm:line-clamp-3">
                {doc.description}
              </p>
              <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                <span className="truncate">{doc.date}</span>
                <span className="ml-2">{doc.size}</span>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleViewDocument(doc)}
                  className="flex-1 text-xs py-2"
                  data-testid={`button-view-document-${doc.id}`}
                >
                  <Eye className="w-3 h-3 mr-1" />
                  {doc.format === 'XLSX' ? 
                    (language === 'fr' ? 'Ouvrir' : 'Open') : 
                    (language === 'fr' ? 'Voir PDF' : 'View PDF')
                  }
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleDownloadDocument(doc)}
                  className="flex-1 text-xs py-2"
                  data-testid={`button-download-document-${doc.id}`}
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