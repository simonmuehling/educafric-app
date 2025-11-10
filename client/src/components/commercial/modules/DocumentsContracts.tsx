import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { FileText, Search, Download, Eye, Share, Plus, Filter, Calendar, Building2, Trash2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface ApiDocument {
  id: number;
  title: string;
  description: string;
  type: string;
  url: string;
}

interface UiDocument {
  id: number;
  name: string;
  type: string;
  category: string;
  school: string;
  date: string;
  status: string;
  size: string;
  format: string;
  url: string;
  description: string;
}

const DocumentsContracts = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [creationDateFilter, setCreationDateFilter] = useState('');
  const [downloadedDocs, setDownloadedDocs] = useState<{[key: number]: string}>({});
  
  // Load downloaded docs from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('educafric-doc-downloads');
    if (stored) {
      try {
        const downloads = JSON.parse(stored);
        setDownloadedDocs(downloads);
      } catch (error) {
        console.error('Error loading download history:', error);
      }
    }
  }, []);


  const text = {
    fr: {
      title: 'Documents & Contrats',
      subtitle: 'Hub documentaire commercial et gestion des contrats',
      searchPlaceholder: 'Rechercher document...',
      addDocument: 'Ajouter Document',
      creationDateFilter: 'Filtrer par date de création',
      allDates: 'Toutes les dates',
      today: 'Aujourd\'hui',
      yesterday: 'Hier',
      thisWeek: 'Cette semaine',
      thisMonth: 'Ce mois',
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
      creationDateFilter: 'Filter by creation date',
      allDates: 'All dates',
      today: 'Today',
      yesterday: 'Yesterday',
      thisWeek: 'This week',
      thisMonth: 'This month',
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

  // Mapper to normalize API documents to UI format
  // Handles both API payload {title, description, type, url} and fallback {name, category, type, ...}
  const mapApiDocumentToUi = (apiDoc: any): UiDocument => {
    const today = new Date().toISOString().split('T')[0];
    
    // Check if already in UI format (from fallback)
    if (apiDoc.name && apiDoc.category) {
      return apiDoc as UiDocument;
    }
    
    // Map from API format to UI format
    return {
      id: apiDoc.id,
      name: apiDoc.title || apiDoc.name || 'Untitled Document',
      type: apiDoc.type || 'guide',
      category: apiDoc.category || apiDoc.type || 'technical',
      school: apiDoc.school || 'Documentation EDUCAFRIC',
      date: apiDoc.date || today,
      status: apiDoc.status || 'finalized',
      size: apiDoc.size || '0 KB',
      format: apiDoc.format || (apiDoc.url?.endsWith('.pdf') ? 'PDF' : 'HTML'),
      url: apiDoc.url,
      description: apiDoc.description || ''
    };
  };

  // Fetch documents from API
  const { data: apiDocuments, isLoading: isLoadingApi, error: apiError } = useQuery<ApiDocument[]>({
    queryKey: ['/api/commercial/documents'],
    retry: 1,
  });

  // Documents commerciaux réels EDUCAFRIC - Fallback static list
  // 🚨 CRITICAL: ALL documents MUST be placed in /public/documents/ directory
  // 🚨 CRITICAL: ALL URLs must start with /documents/ (not /public/documents/)
  // 🚨 CRITICAL: ALL filenames must use lowercase kebab-case naming
  // 🚨 CRITICAL: This is now a FALLBACK - API is the primary source
  const fallbackDocuments: UiDocument[] = [
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
      name: 'Guide Commercial Freemium/Premium EDUCAFRIC Complet (FR/EN) - Interactive',
      type: 'guide',
      category: 'marketing', 
      school: 'Équipe Commerciale',
      date: '2025-08-15',
      status: 'finalized',
      size: '28.7 KB',
      format: 'HTML',
      url: '/documents/guide-freemium-premium-commercial-fr-en.html',
      description: 'Guide commercial complet interactif bilingue avec boutons changement de langue - ÉCOLES: Publique 50,000 XAF/an, Privée 75,000 XAF/an, Entreprise 150,000 XAF/an, GPS 50,000 XAF/an, Publique Complet 90,000 XAF/an, Privée Complet 115,000 XAF/an - PARENTS: Publique 1,000 XAF/mois, Privée 1,500 XAF/mois, GPS 1,000 XAF/mois avec réductions familiales - FREELANCERS: Professionnel 12,500 XAF/semestre, 25,000 XAF/an - Complete interactive bilingual commercial guide with language toggle buttons - SCHOOLS: Public 50,000 XAF/year, Private 75,000 XAF/year, Enterprise 150,000 XAF/year, GPS 50,000 XAF/year, Public Complete 90,000 XAF/year, Private Complete 115,000 XAF/year - PARENTS: Public 1,000 XAF/month, Private 1,500 XAF/month, GPS 1,000 XAF/month with family discounts - FREELANCERS: Professional 12,500 XAF/semester, 25,000 XAF/year'
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
    {
      id: 7,
      name: 'Guide Commercial Bulletins EDUCAFRIC 2025 (Français)',
      type: 'guide',
      category: 'marketing',
      school: 'Équipe Commerciale',
      date: '2025-08-17',
      status: 'finalized',
      size: '18.5 KB',
      format: 'PDF',
      url: '/documents/guide-commercial-bulletins-educafric-2025.html',
      description: 'Guide commercial complet pour vendre les bulletins numériques EDUCAFRIC - Tarification: École Publique 50,000 XAF/an, École Privée 75,000 XAF/an, École Entreprise 150,000 XAF/an - Scripts de vente, argumentaires techniques, avantages ROI pour directeurs et parents - Système de bulletins africains avec moyennes, rangs, appréciations personnalisées et signatures numériques'
    },
    {
      id: 8,
      name: 'Commercial Bulletin Guide EDUCAFRIC 2025 (English)',
      type: 'guide',
      category: 'marketing',
      school: 'Sales Team',
      date: '2025-08-17',
      status: 'finalized',
      size: '17.8 KB',
      format: 'PDF',
      url: '/documents/commercial-bulletin-guide-educafric-2025-en.html',
      description: 'Complete commercial guide for selling EDUCAFRIC digital report cards - Pricing: Public School 50,000 XAF/year, Private School 75,000 XAF/year, Enterprise School 150,000 XAF/year - Sales scripts, technical arguments, ROI benefits for principals and parents - African-style bulletin system with averages, rankings, personalised comments and digital signatures'
    },
    {
      id: 9,
      name: 'Système Multi-Rôle EDUCAFRIC - Guide Commercial (FR/EN)',
      type: 'guide',
      category: 'marketing',
      school: 'Équipe Commerciale',
      date: '2025-08-17',
      status: 'finalized',
      size: '24.3 KB',
      format: 'HTML',
      url: '/documents/guide-systeme-multi-role-commercial-fr-en.html',
      description: 'Guide commercial complet bilingue sur le système multi-rôle EDUCAFRIC - Comment les commerciaux peuvent créer des profils Parent/Enseignant additionnels pour renforcer leur crédibilité et efficacité commerciale - Processus de détection automatique des rôles, basculement en temps réel, isolation sécurisée des données, scripts de vente authentiques - Complete bilingual commercial guide on EDUCAFRIC multi-role system - How sales representatives can create additional Parent/Teacher profiles to enhance credibility and commercial effectiveness - Automatic role detection process, real-time switching, secure data isolation, authentic sales scripts'
    },
    {
      id: 10,
      name: 'Guide Complet de Validation des Bulletins - Système EDUCAFRIC',
      type: 'guide',
      category: 'technical',
      school: 'Administration & Commercial',
      date: '2025-08-17',
      status: 'finalized',
      size: '45.2 KB',
      format: 'HTML',
      url: '/documents/systeme-validation-bulletins-admin-commercial.html',
      description: 'Guide complet du système de validation des bulletins EDUCAFRIC - Processus complet: Draft → Submitted → Approved → Published → Verified avec traçabilité hiérarchique. Includes database architecture, APIs de validation, surveillance système, workflows enseignants et directeurs, contrôle qualité intégré et génération PDF sécurisée. Documentation technique et commerciale pour Site Admin et équipes commerciales.'
    },
    {
      id: 36,
      name: 'Fonctionnalité Hors-Ligne - FR',
      type: 'guide',
      category: 'technical',
      school: 'Administration & Commercial',
      date: '2025-10-19',
      status: 'finalized',
      size: '34.2 KB',
      format: 'HTML',
      url: '/documents/fonctionnalite-hors-ligne.html',
      description: 'Solution complète pour la connectivité limitée en Afrique - Consultation et édition hors-ligne avec synchronisation automatique - Système complet: consultation de tous les profils, notes, devoirs, présences, images hors-ligne + édition présence/devoirs pour enseignants + synchronisation automatique toutes les 5 minutes + optimisé pour 2G/3G + cache intelligent avec TTLs - Production Ready, certifié le 19 octobre 2025'
    },
    {
      id: 37,
      name: 'Offline Functionality - EN',
      type: 'guide',
      category: 'technical',
      school: 'Administration & Commercial',
      date: '2025-10-19',
      status: 'finalized',
      size: '33.8 KB',
      format: 'HTML',
      url: '/documents/offline-functionality.html',
      description: 'Complete solution for limited connectivity in Africa - Offline viewing and editing with automatic synchronization - Complete system: view all profiles, grades, homework, attendance, images offline + edit attendance/homework for teachers + automatic sync every 5 minutes + optimized for 2G/3G + intelligent cache with TTLs - Production Ready, certified October 19, 2025'
    },
    
    // Proposal Request Documents - FIXED URL
    {
      id: 50,
      name: 'Proposal Request - Parent/School Partnership',
      type: 'proposal',
      category: 'templates',
      school: 'Client Communication',
      date: '2025-08-15',
      status: 'finalized',
      size: '64 KB',
      format: 'PDF',
      url: '/documents/parent-school-partnership-proposal.pdf',
      description: 'Official proposal request by Simon Abanda (CEO Educafric) for implementation of EDUCAFRIC digital learning platform - Features: instant notifications & international SMS, child geolocation, interactive timetables, digital absence register, unified communication, attendance reports & academic tracking - Comprehensive educational technology solution for schools, parents, teachers and students'
    },
    
    // Partnership Contracts - UPDATED WITH REAL PRICING 2025
    {
      id: 27,
      name: 'EDUCAFRIC Contrat Officiel 2025 Actualisé - Version 6.0 (FR)',
      type: 'contract',
      category: 'contracts',
      school: 'Tous Partenaires',
      date: '2025-09-20',
      status: 'finalized',
      size: '54.1 KB',
      format: 'HTML',
      url: '/documents/educafric-contrat-officiel-2025-actualise.html',
      description: 'Version 6.0 - Contrat officiel actualisé du 20 septembre 2025 avec nouveau modèle de paiement : EDUCAFRIC paie maintenant les établissements. École Publique: 50,000 XAF/an, École Privée: 75,000 XAF/an, École Entreprise: 150,000 XAF/an, École GPS: 50,000 XAF/an, École Publique Complet: 90,000 XAF/an, École Privée Complet: 115,000 XAF/an - Parents: Publique 12,000 XAF/an, Privée 18,000 XAF/an, GPS 12,000 XAF/an - Freelancers Professionnel: 25,000 XAF/an'
    },
    {
      id: 53,
      name: 'EDUCATIONAL PARTNERSHIP CONTRACT - SCHOOL - EDUCAFRIC 2025',
      type: 'contract',
      category: 'contracts',
      school: 'All Partners',
      date: '2025-09-20',
      status: 'finalized',
      size: '48.7 KB',
      format: 'HTML',
      url: '/documents/educafric-official-contract-2025-updated-version-6-en.html',
      description: 'Version 6.0 - English version of official contract updated August 17, 2025 with new payment model: EDUCAFRIC pays schools directly. Schools 500+ students: 150,000 CFA/year, Schools under 500: 200,000 CFA/year - Parents: Public 12,000 CFA/year, Private 18,000 CFA/year with family discounts up to 20% - Freelancers Professional: 25,000 CFA/year'
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
      description: 'Contrat commercial actualisé pour ventes avec tarification réelle 2025 - Écoles: 50,000-150,000 XAF/an selon type (Publique 50,000, Privée 75,000, GPS 50,000, Complets 90,000-115,000) - Parents: 12,000-18,000 XAF/an selon école - Freelancers: 25,000 XAF/an - Remises familiales et packages multiples disponibles'
    },
    {
      id: 34,
      name: 'CONTRAT DE PARTENARIAT OFFICIEL 2025 - ÉCOLES (Écoles paient Educafric)',
      type: 'contract',
      category: 'contracts',
      school: 'Établissements Scolaires',
      date: '2025-01-17',
      status: 'finalized',
      size: '19.9 KB',
      format: 'PDF',
      url: '/documents/contrat-partenariat-ecoles-2025.html',
      description: 'Contrat officiel 2025 où les écoles paient Educafric pour les services éducatifs - Modèle bilingue (FR/EN) avec espaces pour montant annuel, nombre d\'étudiants, nom et contact de l\'école - Official 2025 contract where schools pay Educafric for educational services - Bilingual template (FR/EN) with spaces for annual amount, student count, school name and contact'
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
      name: 'Tarifs et Plans Complets Français - Depuis /subscribe',
      type: 'pricing',
      category: 'contracts',
      school: 'Documentation Officielle',
      date: '2025-08-15',
      status: 'finalized',
      size: '12.7 KB',
      format: 'PDF',
      url: '/documents/tarifs-complets-educafric-2025.html',
      description: 'Tarification complète EDUCAFRIC depuis /subscribe réelle 2025 - ÉCOLES: Publique 50,000 XAF/an (illimité étudiants), Privée 75,000 XAF/an (analytics+WhatsApp), Entreprise 150,000 XAF/an (bilingue+ROI), GPS 50,000 XAF/an, Publique Complet 90,000 XAF/an, Privée Complet 115,000 XAF/an - PARENTS: Publique 12,000 XAF/an (1,000 XAF/mois), Privée 18,000 XAF/an (1,500 XAF/mois), GPS 12,000 XAF/an (1,000 XAF/mois) - FREELANCERS: Professionnel 25,000 XAF/an (12,500 XAF/semestre) avec géolocalisation, facturation, analytics, marketing digital'
    },
    {
      id: 4,
      name: 'Complete Pricing Plans English - From /subscribe',
      type: 'pricing',
      category: 'contracts',
      school: 'Official Documentation',
      date: '2025-08-15',
      status: 'finalized',
      size: '11.9 KB',
      format: 'PDF',
      url: '/documents/customized-pricing-proposal-en.html',
      description: 'Complete EDUCAFRIC pricing from /subscribe real 2025 - SCHOOLS: Public 50,000 XAF/year (unlimited students), Private 75,000 XAF/year (analytics+WhatsApp), Enterprise 150,000 XAF/year (bilingual+ROI), GPS 50,000 XAF/year, Public Complete 90,000 XAF/year, Private Complete 115,000 XAF/year - PARENTS: Public 12,000 XAF/year (1,000 XAF/month), Private 18,000 XAF/year (1,500 XAF/month), GPS 12,000 XAF/year (1,000 XAF/month) - FREELANCERS: Professional 25,000 XAF/year (12,500 XAF/semester) with geolocation, billing, analytics, digital marketing'
    },
    {
      id: 5,
      name: 'Système de Notifications EDUCAFRIC Complet (FR/EN)',
      type: 'guide',
      category: 'technical',
      school: 'Support Technique',
      date: '2025-08-15',
      status: 'finalized',
      size: '11.2 KB',
      format: 'PDF',
      url: '/documents/notifications-system-educafric-fr.html',
      description: 'Système complet bilingue : SMS automatiques (Vonage API), WhatsApp Business intégré, Email (Hostinger SMTP), Notifications Push PWA, Alertes géolocalisation temps réel, Notifications notes/présence, Communications parents-écoles bidirectionnelles, Templates contextuels français/anglais - Complete bilingual system: Automatic SMS (Vonage API), Integrated WhatsApp Business, Email (Hostinger SMTP), PWA Push notifications, Real-time geolocation alerts, Grade/attendance notifications, Bidirectional parent-school communications, Contextual French/English templates'
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
      description: 'Système géolocalisation EDUCAFRIC : Suivi GPS temps réel élèves/personnel, Zones de sécurité configurables, Géofencing intelligent, Alertes automatiques SMS/WhatsApp/Email, Historique déplacements complet, Compatible tablettes/smartwatches/téléphones, Optimisation itinéraires bus scolaires, Automatisation présence classes, Boutons urgence, Rapports parents/écoles, Interface cartographie interactive'
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
      url: '/documents/geolocalisation-resume-educafric-fr.html',
      description: 'EDUCAFRIC GEOLOCATION SYSTEM: Real-time GPS tracking students/staff, Configurable safety zones, Smart geofencing, Automatic SMS/WhatsApp/Email alerts, Complete movement history, Compatible tablets/smartwatches/phones, School bus route optimization, Class attendance automation, Emergency buttons, Parent/school reports, Interactive mapping interface'
    },

    // Documents PDF - Publics pour commerciaux
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
      description: 'Guide EDUCAFRIC pour parents : fonctionnalités géolocalisation, notifications temps réel, suivi scolaire, tarifs réels 2025 - Parent École Publique: 12,000 XAF/an, Parent École Privée: 18,000 XAF/an, Parent GPS: 12,000 XAF/an'
    },

    // NOUVEAUX DOCUMENTS - MÊME CONFIGURATION QUE "Documentation Parent (PDF)"
    {
      id: 101,
      name: 'Contrat Partenariat Commercial (FR)',
      type: 'guide',
      category: 'marketing',
      school: 'Familles',
      date: '2025-08-11',
      status: 'finalized',
      size: '15.4 KB',
      format: 'PDF',
      url: '/documents/contrat-partenariat-commercial-fr.html',
      description: 'Contrat de partenariat commercial pour équipe commerciale EDUCAFRIC avec commissions, territoires, objectifs'
    },
    {
      id: 102,
      name: 'Contrat Partenariat Établissements-Freelancers-Parents 2025 Actualisé',
      type: 'guide',
      category: 'marketing',
      school: 'Familles',
      date: '2025-08-15',
      status: 'finalized',
      size: '32.8 KB',
      format: 'PDF',
      url: '/documents/contrat-partenariat-etablissements-freelancers-parents-2025-actualise.html',
      description: 'Contrat actualisé multi-parties pour établissements, freelancers et parents avec tarification 2025'
    },
    {
      id: 103,
      name: 'Customised Pricing Proposal (EN)',
      type: 'guide',
      category: 'marketing',
      school: 'Familles',
      date: '2025-08-11',
      status: 'finalized',
      size: '18.2 KB',
      format: 'PDF',
      url: '/documents/customized-pricing-proposal-en.html',
      description: 'English customised pricing proposal with flexible rates for international schools'
    },
    {
      id: 104,
      name: 'Educafric Commercial Brochure (EN)',
      type: 'guide',
      category: 'marketing',
      school: 'Familles',
      date: '2025-08-11',
      status: 'finalized',
      size: '24.1 KB',
      format: 'PDF',
      url: '/documents/educafric-commercial-brochure-en.html',
      description: 'English commercial brochure for international market expansion'
    },
    {
      id: 105,
      name: 'Educafric Plans Abonnement Complets FR',
      type: 'guide',
      category: 'marketing',
      school: 'Familles',
      date: '2025-01-22',
      status: 'finalized',
      size: '45.3 KB',
      format: 'PDF',
      url: '/documents/Educafric_Plans_Abonnement_Complets_FR (1)_1753390205509.html',
      description: 'Plans d\'abonnement complets EDUCAFRIC avec tarification détaillée tous secteurs'
    },
    {
      id: 106,
      name: 'Partnership Contract Schools-Freelancers-Parents 2025 (EN)',
      type: 'guide',
      category: 'marketing',
      school: 'Familles',
      date: '2025-08-15',
      status: 'finalized',
      size: '38.5 KB',
      format: 'PDF',
      url: '/documents/partnership-contract-schools-freelancers-parents-2025-en.html',
      description: 'English version of multi-stakeholder partnership contract updated 2025 pricing'
    },
    {
      id: 107,
      name: 'Proposition Tarifaire Personnalisée (FR)',
      type: 'guide',
      category: 'marketing',
      school: 'Familles',
      date: '2025-08-11',
      status: 'finalized',
      size: '19.7 KB',
      format: 'PDF',
      url: '/documents/proposition-tarifaire-personnalisee-fr.html',
      description: 'Proposition tarifaire personnalisée flexible pour écoles françaises et francophones'
    },

    // GUIDES DE CONFIGURATION EXISTANTS - MÊME CONFIG QUE "Documentation Parent (PDF)"
    {
      id: 201,
      name: 'Guide Écoles Configuration Profil (FR)',
      type: 'guide',
      category: 'marketing',
      school: 'Familles',
      date: '2025-08-17',
      status: 'finalized',
      size: '13.5 KB',
      format: 'PDF',
      url: '/documents/guide-ecoles-configuration-profil-fr.html',
      description: 'Guide complet de configuration profil école - Paramètres, utilisateurs, permissions, modules'
    },
    {
      id: 202,
      name: 'Guide Schools Profile Configuration (EN)',
      type: 'guide',
      category: 'marketing',
      school: 'Familles',
      date: '2025-08-17',
      status: 'finalized',
      size: '12.8 KB',
      format: 'PDF',
      url: '/documents/guide-schools-profile-configuration-en.html',
      description: 'Complete school profile configuration guide - Settings, users, permissions, modules'
    },
    {
      id: 203,
      name: 'Guide Enseignants Configuration (FR)',
      type: 'guide',
      category: 'marketing',
      school: 'Familles',
      date: '2025-08-17',
      status: 'finalized',
      size: '14.1 KB',
      format: 'PDF',
      url: '/documents/guide-enseignants-configuration-fr.html',
      description: 'Guide configuration enseignants - Profil, classes, matières, bulletins'
    },
    {
      id: 211,
      name: 'Guide Teachers Configuration (EN)',
      type: 'guide',
      category: 'marketing',
      school: 'Familles',
      date: '2025-08-17',
      status: 'finalized',
      size: '13.3 KB',
      format: 'PDF',
      url: '/documents/guide-teachers-configuration-en.html',
      description: 'Teacher profile configuration guide - Profile, classes, subjects, bulletins'
    },
    {
      id: 204,
      name: 'Guide Parents Configuration Profil (FR)',
      type: 'guide',
      category: 'marketing',
      school: 'Familles',
      date: '2025-08-17',
      status: 'finalized',
      size: '11.3 KB',
      format: 'PDF',
      url: '/documents/guide-parents-configuration-profil-fr.html',
      description: 'Guide configuration parents - Profil, enfants, notifications, géolocalisation'
    },
    {
      id: 205,
      name: 'Guide Parents Profile Configuration (EN)',
      type: 'guide',
      category: 'marketing',
      school: 'Familles',
      date: '2025-08-17',
      status: 'finalized',
      size: '10.8 KB',
      format: 'PDF',
      url: '/documents/guide-parents-profile-configuration-en.html',
      description: 'Parent profile configuration guide - Profile, children, notifications, geolocation'
    },
    {
      id: 206,
      name: 'Guide Élèves Configuration Profil (FR)',
      type: 'guide',
      category: 'marketing',
      school: 'Familles',
      date: '2025-08-17',
      status: 'finalized',
      size: '9.9 KB',
      format: 'PDF',
      url: '/documents/guide-eleves-configuration-profil-fr.html',
      description: 'Guide configuration élèves - Profil, matières, devoirs, bulletins'
    },
    {
      id: 207,
      name: 'Guide Students Profile Configuration (EN)',
      type: 'guide',
      category: 'marketing',
      school: 'Familles',
      date: '2025-08-17',
      status: 'finalized',
      size: '9.4 KB',
      format: 'PDF',
      url: '/documents/guide-students-profile-configuration-en.html',
      description: 'Student profile configuration guide - Profile, subjects, homework, bulletins'
    },
    {
      id: 208,
      name: 'Guide Répétiteurs Configuration Profil (FR)',
      type: 'guide',
      category: 'marketing',
      school: 'Familles',
      date: '2025-08-17',
      status: 'finalized',
      size: '11.8 KB',
      format: 'PDF',
      url: '/documents/guide-repetiteurs-configuration-profil-fr.html',
      description: 'Guide configuration répétiteurs - Profil, élèves, tarifs, planning'
    },
    {
      id: 209,
      name: 'Guide Freelancers Configuration Profil (EN)',
      type: 'guide',
      category: 'marketing',
      school: 'Familles',
      date: '2025-08-17',
      status: 'finalized',
      size: '11.5 KB',
      format: 'PDF',
      url: '/documents/guide-tutors-profile-configuration-en.html',
      description: 'Freelancer/Tutor profile configuration guide - Profile, students, rates, scheduling'
    },
    {
      id: 210,
      name: 'Guide Tuteurs Configuration Profil (FR)',
      type: 'guide',
      category: 'marketing',
      school: 'Familles',
      date: '2025-08-17',
      status: 'finalized',
      size: '12.1 KB',
      format: 'PDF',
      url: '/documents/guide-tuteurs-configuration-profil-fr.html',
      description: 'Guide configuration tuteurs/freelancers - Profil, étudiants, tarifs, planification'
    },

    // Documents supplémentaires requis (pas de doublons)
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
      description: 'Argumentaire de vente complet bilingue avec objections et réponses, scripts téléphone, présentation face-à-face, templates WhatsApp - Version française et anglaise élargie - Complete bilingual sales pitch with objections, phone scripts, face-to-face presentation, WhatsApp templates - Extended French and English version'
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
      description: 'Tarifs détaillés réels depuis /subscribe - Cameroun 2025 - Écoles: Publique 50,000 XAF, Privée 75,000 XAF, Entreprise 150,000 XAF, GPS 50,000 XAF, Publique Complet 90,000 XAF, Privée Complet 115,000 XAF - Parents: Publique 12,000 XAF, Privée 18,000 XAF, GPS 12,000 XAF - Freelancers: 25,000 XAF/an - Géolocalisation, abonnements et services complets'
    },
    {
      id: 54,
      name: 'Système Multi-Rôle EDUCAFRIC - Guide Commercial (FR/EN)',
      type: 'guide',
      category: 'technical',
      school: 'Documentation Technique',
      date: '2025-08-17',
      status: 'finalized',
      size: '87.4 KB',
      format: 'PDF',
      url: '/api/commercial/documents/9/view',
      description: 'Guide complet du système multi-rôle EDUCAFRIC pour commerciaux - Comment ajouter un rôle parent à un compte commercial avec isolation complète des données, validation scolaire, et commutation instantanée entre rôles. Documentation bilingue français/anglais avec spécifications techniques et procédures de sécurité. Complete EDUCAFRIC multi-role system guide for commercial team - How to add parent role to commercial account with complete data isolation, school validation, and instant role switching. Bilingual French/English documentation with technical specifications and security procedures.'
    },
    {
      id: 55,
      name: 'Guide Schools Configuration (FR)',
      type: 'guide',
      category: 'technical',
      school: 'Documentation Établissements',
      date: '2025-08-18',
      status: 'finalized',
      size: '42.3 KB',
      format: 'HTML',
      url: '/documents/guide-schools-configuration-fr.html',
      description: 'Guide complet de configuration pour les établissements scolaires - Paramétrage initial, gestion des utilisateurs, modules disponibles, et optimisation pour les écoles africaines.'
    },
    {
      id: 56,
      name: 'Guide Teachers Configuration (FR)',
      type: 'guide',
      category: 'technical',
      school: 'Documentation Enseignants',
      date: '2025-08-18',
      status: 'finalized',
      size: '38.7 KB',
      format: 'HTML',
      url: '/documents/guide-teachers-configuration-fr.html',
      description: 'Guide de configuration pour enseignants - Paramétrage du tableau de bord, gestion des classes, bulletins, et outils pédagogiques EDUCAFRIC.'
    },
    {
      id: 57,
      name: 'Guide Parents Configuration (FR)',
      type: 'guide',
      category: 'technical',
      school: 'Documentation Parents',
      date: '2025-08-18',
      status: 'finalized',
      size: '35.9 KB',
      format: 'HTML',
      url: '/documents/guide-parents-configuration-fr.html',
      description: 'Guide de configuration pour parents - Paramétrage du profil, connexion aux enfants, notifications, géolocalisation, et suivi académique.'
    },
    {
      id: 58,
      name: 'Educ Presentation - Version Principale',
      type: 'presentation',
      category: 'marketing',
      school: 'Commercial Team',
      date: '2025-08-04',
      status: 'finalized',
      size: '17.3 MB',
      format: 'PDF',
      url: '/documents/educ-presentation-principal.pdf',
      description: 'Présentation principale EDUCAFRIC - Document commercial complet avec fonctionnalités, tarifs, et démonstrations pour prospects.'
    },
    {
      id: 59,
      name: 'Educ Presentation - Établissements',
      type: 'presentation',
      category: 'marketing',
      school: 'Commercial Team',
      date: '2025-08-18',
      status: 'finalized',
      size: '2.3 MB',
      format: 'PDF',
      url: '/documents/educ-presentation-1.pdf',
      description: 'Présentation EDUCAFRIC pour établissements scolaires - Solutions complètes pour directeurs et administrateurs.'
    },
    {
      id: 60,
      name: 'Educ Presentation - Parents',
      type: 'presentation',
      category: 'marketing',
      school: 'Commercial Team',
      date: '2025-08-18',
      status: 'finalized',
      size: '571 KB',
      format: 'PDF',
      url: '/documents/educ-presentation-3.pdf',
      description: 'Présentation EDUCAFRIC pour parents - Géolocalisation, suivi académique, communication avec établissement.'
    },
    {
      id: 61,
      name: 'Educ Presentation - Enseignants',
      type: 'presentation',
      category: 'marketing',
      school: 'Commercial Team',
      date: '2025-08-18',
      status: 'finalized',
      size: '552 KB',
      format: 'PDF',
      url: '/documents/educ-presentation-4.pdf',
      description: 'Présentation EDUCAFRIC pour enseignants - Gestion de classe, bulletins, communication parents.'
    },
    {
      id: 62,
      name: 'Demande d\'Offres EDUCAFRIC - FR',
      type: 'proposal',
      category: 'contracts',
      school: 'Document Officiel',
      date: '2025-09-06',
      status: 'finalized',
      size: '150 KB',
      format: 'PDF',
      url: '/documents/demande-offres-educafric-fr.pdf',
      description: 'Document officiel de demande d\'offre pour établissements - Notifications instantanées, géolocalisation, emplois du temps, communication unifiée'
    },
    {
      id: 63,
      name: 'Proposal Request EDUCAFRIC - EN',
      type: 'proposal',
      category: 'contracts',
      school: 'Official Document',
      date: '2025-09-06',
      status: 'finalized',
      size: '152 KB',
      format: 'PDF',
      url: '/documents/proposal-request-educafric-en.pdf',
      description: 'Official proposal request document for institutions - Instant notifications, child geolocation, interactive timetables, unified communication'
    },

    // === DOCUMENTS FROM API COMMERCIAL SYSTEM ===
    // GUIDES COMMERCIAUX PRINCIPAUX (Bilingue)
    {
      id: 64,
      name: 'Guide Explicatif Commerciaux EDUCAFRIC - FR',
      type: 'guide',
      category: 'marketing',
      school: 'Équipe Commerciale',
      date: '2025-09-06',
      status: 'finalized',
      size: '45 KB',
      format: 'HTML',
      url: '/documents/guide-explicatif-commerciaux-educafric-2025.html',
      description: 'Document commercial complet en français'
    },
    {
      id: 65,
      name: 'Guide Commercial Bulletins EDUCAFRIC - FR',
      type: 'guide',
      category: 'marketing',
      school: 'Équipe Commerciale',
      date: '2025-09-06',
      status: 'finalized',
      size: '42 KB',
      format: 'HTML',
      url: '/documents/guide-commercial-bulletins-educafric-2025.html',
      description: 'Guide pour la vente du système de bulletins'
    },
    {
      id: 66,
      name: 'Commercial Bulletin Guide - EN',
      type: 'guide',
      category: 'marketing',
      school: 'Sales Team',
      date: '2025-09-06',
      status: 'finalized',
      size: '40 KB',
      format: 'HTML',
      url: '/documents/commercial-bulletin-guide-educafric-2025-en.html',
      description: 'Commercial guide for bulletin system (English)'
    },

    // BROCHURES COMMERCIALES (Bilingue)
    {
      id: 67,
      name: 'Brochure Commerciale EDUCAFRIC - FR',
      type: 'brochure',
      category: 'marketing',
      school: 'Équipe Commerciale',
      date: '2025-09-06',
      status: 'finalized',
      size: '38 KB',
      format: 'HTML',
      url: '/documents/brochure-commerciale-educafric-fr.html',
      description: 'Brochure commerciale complète en français'
    },
    {
      id: 68,
      name: 'EDUCAFRIC Commercial Brochure - EN',
      type: 'brochure',
      category: 'marketing',
      school: 'Sales Team',
      date: '2025-09-06',
      status: 'finalized',
      size: '36 KB',
      format: 'HTML',
      url: '/documents/educafric-commercial-brochure-en.html',
      description: 'Complete commercial brochure in English'
    },

    // ARGUMENTAIRES DE VENTE (Bilingue)
    {
      id: 69,
      name: 'Argumentaire de Vente EDUCAFRIC - FR',
      type: 'guide',
      category: 'marketing',
      school: 'Équipe Commerciale',
      date: '2025-09-06',
      status: 'finalized',
      size: '35 KB',
      format: 'HTML',
      url: '/documents/argumentaire-vente-educafric-fr.html',
      description: 'Document de vente complet en français'
    },
    {
      id: 70,
      name: 'EDUCAFRIC Sales Pitch Complete - EN',
      type: 'guide',
      category: 'marketing',
      school: 'Sales Team',
      date: '2025-09-06',
      status: 'finalized',
      size: '38 KB',
      format: 'HTML',
      url: '/documents/educafric-sales-pitch-complete-en.html',
      description: 'Complete sales pitch document in English'
    },
    {
      id: 71,
      name: 'EDUCAFRIC Sales Pitch Original - EN',
      type: 'guide',
      category: 'marketing',
      school: 'Sales Team',
      date: '2025-09-06',
      status: 'finalized',
      size: '32 KB',
      format: 'HTML',
      url: '/documents/educafric-sales-pitch-en.html',
      description: 'Original sales pitch document'
    },

    // TARIFS ET PROPOSITIONS (Bilingue)
    {
      id: 72,
      name: 'Tarifs Complets EDUCAFRIC 2025 - FR',
      type: 'pricing',
      category: 'contracts',
      school: 'Documentation Officielle',
      date: '2025-09-20',
      status: 'finalized',
      size: '28 KB',
      format: 'HTML',
      url: '/documents/tarifs-complets-educafric-2025.html',
      description: 'Grille tarifaire complète pour 2025'
    },
    {
      id: 73,
      name: 'Proposition Tarifaire Personnalisée - FR',
      type: 'pricing',
      category: 'contracts',
      school: 'Documentation Officielle',
      date: '2025-09-06',
      status: 'finalized',
      size: '26 KB',
      format: 'HTML',
      url: '/documents/proposition-tarifaire-personnalisee-fr.html',
      description: 'Document de proposition tarifaire personnalisée'
    },
    {
      id: 74,
      name: 'Proposition Tarifaire Sur Mesure - FR',
      type: 'pricing',
      category: 'contracts',
      school: 'Documentation Officielle',
      date: '2025-09-06',
      status: 'finalized',
      size: '29 KB',
      format: 'HTML',
      url: '/documents/proposition-tarifaire-sur-mesure-fr.html',
      description: 'Nouvelle proposition tarifaire personnalisée'
    },
    {
      id: 75,
      name: 'Customized Pricing Proposal - EN',
      type: 'pricing',
      category: 'contracts',
      school: 'Official Documentation',
      date: '2025-09-06',
      status: 'finalized',
      size: '27 KB',
      format: 'HTML',
      url: '/documents/customized-pricing-proposal-en.html',
      description: 'Personalized pricing proposal document'
    },

    // CONTRATS COMMERCIAUX (Bilingue)
    {
      id: 76,
      name: 'Contrat Commercial EDUCAFRIC 2025 - FR',
      type: 'contract',
      category: 'contracts',
      school: 'Tous Partenaires',
      date: '2025-09-20',
      status: 'finalized',
      size: '52 KB',
      format: 'HTML',
      url: '/documents/contrat-commercial-educafric-2025-actualise.html',
      description: 'Contrat commercial actualisé 2025'
    },
    {
      id: 77,
      name: 'Contrat Partenariat Commercial EDUCAFRIC - FR',
      type: 'contract',
      category: 'contracts',
      school: 'Tous Partenaires',
      date: '2025-09-06',
      status: 'finalized',
      size: '48 KB',
      format: 'HTML',
      url: '/documents/contrat-partenariat-commercial-educafric-fr.html',
      description: 'Contrat de partenariat commercial français'
    },
    {
      id: 78,
      name: 'Commercial Partnership Contract - EN',
      type: 'contract',
      category: 'contracts',
      school: 'All Partners',
      date: '2025-09-06',
      status: 'finalized',
      size: '46 KB',
      format: 'HTML',
      url: '/documents/commercial-partnership-contract-en.html',
      description: 'Commercial partnership contract in English'
    },

    // GUIDES TECHNIQUES COMMERCIAUX (Bilingue)
    {
      id: 79,
      name: 'Guide Signatures Numériques - FR',
      type: 'guide',
      category: 'technical',
      school: 'Support Technique',
      date: '2025-09-06',
      status: 'finalized',
      size: '33 KB',
      format: 'HTML',
      url: '/documents/guide-signatures-numeriques-professeurs-principaux.html',
      description: 'Système de signatures numériques pour bulletins'
    },
    {
      id: 80,
      name: 'Digital Signatures Guide - EN',
      type: 'guide',
      category: 'technical',
      school: 'Technical Support',
      date: '2025-09-06',
      status: 'finalized',
      size: '31 KB',
      format: 'HTML',
      url: '/documents/digital-signatures-guide-principal-teachers-en.html',
      description: 'Digital signature system for report cards'
    },
    {
      id: 81,
      name: 'Guide Commercial Modules Premium - FR',
      type: 'guide',
      category: 'marketing',
      school: 'Équipe Commerciale',
      date: '2025-09-06',
      status: 'finalized',
      size: '39 KB',
      format: 'HTML',
      url: '/documents/guide-commercial-modules-premium.html',
      description: 'Guide de vente des modules premium'
    },
    {
      id: 82,
      name: 'Guide Commercial Bulletins Sécurisés 2025 - FR',
      type: 'guide',
      category: 'marketing',
      school: 'Équipe Commerciale',
      date: '2025-09-06',
      status: 'finalized',
      size: '44 KB',
      format: 'HTML',
      url: '/documents/guide-commercial-bulletins-securises-2025-actualise.html',
      description: 'Guide commercial pour bulletins sécurisés'
    },
    {
      id: 83,
      name: 'Secure Bulletins Commercial Guide 2025 - EN',
      type: 'guide',
      category: 'marketing',
      school: 'Sales Team',
      date: '2025-09-06',
      status: 'finalized',
      size: '42 KB',
      format: 'HTML',
      url: '/documents/secure-bulletins-commercial-guide-2025-updated-en.html',
      description: 'Commercial guide for secure bulletins'
    },

    // SYSTÈMES ET MODULES (Bilingue)
    {
      id: 84,
      name: 'Module Contenu Pédagogique Collaboratif - FR',
      type: 'guide',
      category: 'technical',
      school: 'Support Technique',
      date: '2025-09-06',
      status: 'finalized',
      size: '37 KB',
      format: 'HTML',
      url: '/documents/module-contenu-pedagogique-collaboratif.html',
      description: 'Système de création et partage de ressources éducatives'
    },
    {
      id: 85,
      name: 'Guide Complet de Validation des Bulletins - Système EDUCAFRIC',
      type: 'guide',
      category: 'technical',
      school: 'Administration & Commercial',
      date: '2025-09-06',
      status: 'finalized',
      size: '58 KB',
      format: 'HTML',
      url: '/documents/systeme-validation-bulletins-admin-commercial.html',
      description: 'Guide complet du système de validation des bulletins EDUCAFRIC - Processus complet: Draft → Submitted → Approved → Published → Verified avec traçabilité hiérarchique'
    },

    // === MODÈLES DE BULLETINS STANDARDISÉS (Bilingue) ===
    {
      id: 86,
      name: 'Modèle de Bulletin Standardisé EDUCAFRIC - FR',
      type: 'template',
      category: 'templates',
      school: 'Système EDUCAFRIC',
      date: '2025-09-06',
      status: 'finalized',
      size: '85 KB',
      format: 'HTML',
      url: '/documents/modele-bulletin-standardise-educafric-fr.html',
      description: 'Modèle unifié de bulletin pour tous les établissements africains - Version française avec tous les champs standardisés analysés à partir de bulletins réels'
    },
    {
      id: 87,
      name: 'Standardized Report Card Template EDUCAFRIC - EN',
      type: 'template',
      category: 'templates',
      school: 'EDUCAFRIC System',
      date: '2025-09-06',
      status: 'finalized',
      size: '83 KB',
      format: 'HTML',
      url: '/documents/standardized-report-card-template-educafric-en.html',
      description: 'Unified report card template for all African institutions - English version with all standardized fields analyzed from real report cards'
    },

    // === MODÈLES OPTIMISÉS A4 (Format Pratique pour Écoles) ===
    {
      id: 88,
      name: 'Bulletin A4 Optimisé EDUCAFRIC - FR',
      type: 'template',
      category: 'templates',
      school: 'Format École Pratique',
      date: '2025-09-06',
      status: 'finalized',
      size: '35 KB',
      format: 'HTML',
      url: '/documents/bulletin-a4-optimise-educafric-fr.html',
      description: 'Modèle de bulletin compact optimisé pour impression A4 - Toutes les informations sur une seule page, format pratique pour les écoles africaines'
    },
    {
      id: 89,
      name: 'Report Card A4 Optimized EDUCAFRIC - EN',
      type: 'template',
      category: 'templates',
      school: 'Practical School Format',
      date: '2025-09-06',
      status: 'finalized',
      size: '34 KB',
      format: 'HTML',
      url: '/documents/report-card-a4-optimized-educafric-en.html',
      description: 'Compact report card template optimized for A4 printing - All information on single page, practical format for African schools'
    },

    // === NOUVEAUX CONTRATS ÉCOLE-EDUCAFRIC 2025 ===
    {
      id: 36,
      name: 'CONTRAT ÉCOLE-EDUCAFRIC 2025 - ÉCOLE PAYANTE',
      type: 'contract',
      category: 'contracts',
      school: 'Établissements Scolaires',
      date: '2025-09-20',
      status: 'finalized',
      size: '19.9 KB',
      format: 'HTML',
      url: '/documents/contrat-ecoles-payent-educafric-2025.html',
      description: 'Contrat spécialisé pour les écoles qui paient Educafric avec montant et durée négociables'
    },
    {
      id: 37,
      name: 'SCHOOL-EDUCAFRIC CONTRACT 2025 - SCHOOL PAYMENT',
      type: 'contract',
      category: 'contracts',
      school: 'Educational Institutions',
      date: '2025-09-20',
      status: 'finalized',
      size: '18.7 KB',
      format: 'HTML',
      url: '/documents/school-pays-educafric-contract-2025-en.html',
      description: 'Specialized contract for schools paying Educafric with negotiable amount and duration'
    },
  ];

  // Combine API documents with fallback
  const documents: UiDocument[] = React.useMemo(() => {
    if (apiError) {
      console.warn('[DOCUMENTS] API error, using fallback:', apiError);
      return fallbackDocuments;
    }
    
    if (isLoadingApi) {
      return fallbackDocuments;
    }

    if (apiDocuments && apiDocuments.length > 0) {
      const mappedApiDocs = apiDocuments.map(mapApiDocumentToUi);
      console.log('[DOCUMENTS] Loaded from API:', mappedApiDocs.length);
      
      // Deduplicate by ID - API documents take precedence
      const apiIds = new Set(mappedApiDocs.map(d => d.id));
      const fallbackOnly = fallbackDocuments.filter(d => !apiIds.has(d.id));
      
      return [...mappedApiDocs, ...fallbackOnly];
    }

    return fallbackDocuments;
  }, [apiDocuments, isLoadingApi, apiError]);

  const isWithinDateRange = (downloadDate: string, filter: string): boolean => {
    if (!downloadDate || filter === 'all') return true;
    
    const now = new Date();
    const docDate = new Date(downloadDate);
    
    switch (filter) {
      case 'today':
        return docDate.toDateString() === now.toDateString();
      case 'yesterday':
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        return docDate.toDateString() === yesterday.toDateString();
      case 'thisWeek':
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        return docDate >= weekStart;
      case 'thisMonth':
        return docDate.getMonth() === now.getMonth() && docDate.getFullYear() === now.getFullYear();
      default:
        return true;
    }
  };

  const filteredDocuments = documents
    .filter(doc => {
      const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           doc.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
      const matchesCreationDate = creationDateFilter === 'all' || creationDateFilter === '' || 
                                 isWithinDateRange(doc.date, creationDateFilter);
      
      return matchesSearch && matchesCategory && matchesCreationDate;
    })
    .sort((a, b) => a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' }));

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
      // For HTML/PDF files, open directly with cache-busting
      const urlWithCacheBuster = doc.url.includes('?') ? 
        `${doc.url}&v=${Date.now()}` : 
        `${doc.url}?v=${Date.now()}`;
      window.open(urlWithCacheBuster, '_blank');
      toast({
        title: language === 'fr' ? 'Document PDF ouvert' : 'PDF Document Opened',
        description: language === 'fr' ? `${doc.name} a été ouvert dans un nouvel onglet` : `${doc.name} has been opened in a new tab`,
      });
    }
  };

  const handleDownloadDocument = (doc: any) => {
    // Record download date
    const now = new Date().toISOString();
    setDownloadedDocs(prev => ({ ...prev, [doc.id]: now }));
    
    // Store in localStorage for persistence
    const stored = localStorage.getItem('educafric-doc-downloads') || '{}';
    const downloads = JSON.parse(stored);
    downloads[doc.id] = now;
    localStorage.setItem('educafric-doc-downloads', JSON.stringify(downloads));
    
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
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Category Filter */}
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
              
              {/* Creation Date Filter */}
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <select 
                  value={creationDateFilter} 
                  onChange={(e) => setCreationDateFilter(e.target.value)}
                  className="text-xs px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  title={t.creationDateFilter}
                >
                  <option value="all">{t.allDates}</option>
                  <option value="today">{t.today}</option>
                  <option value="yesterday">{t.yesterday}</option>
                  <option value="thisWeek">{t.thisWeek}</option>
                  <option value="thisMonth">{t.thisMonth}</option>
                </select>
              </div>
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