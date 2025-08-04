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
      content: `CONTRAT DE SERVICE EDUCAFRIC
École Primaire Bilingue de Yaoundé

OBJET DU CONTRAT
Le présent contrat définit les termes et conditions de fourniture des services de la plateforme éducative EDUCAFRIC à l'École Primaire Bilingue de Yaoundé pour l'année scolaire 2024-2025.

SERVICES INCLUS

1. PLATEFORME ÉDUCATIVE COMPLÈTE
   • Accès illimité à tous les modules EDUCAFRIC
   • Gestion académique intégrée (notes, bulletins, emplois du temps)
   • Système de communication multi-canal (SMS, WhatsApp, Email)
   • Outils de gestion financière et paiements

2. FORMATION ET ACCOMPAGNEMENT
   • Formation initiale du personnel (20 heures)
   • Support technique 24/7 en français
   • Mise à jour gratuite de la plateforme
   • Assistance à la migration des données existantes

3. MODULES PREMIUM ACTIVÉS
   • Géolocalisation des élèves et personnel
   • Rapports avancés et tableaux de bord
   • Intégration Orange Money / MTN Mobile Money
   • Système de notifications push avancé

TARIFICATION
Abonnement annuel: 65,000 CFA
Paiement: Trimestriel (16,250 CFA par trimestre)
Frais d'installation: 15,000 CFA (unique)

ENGAGEMENTS EDUCAFRIC
• Disponibilité service: 99.5%
• Temps de réponse support: < 2 heures
• Sauvegarde quotidienne des données
• Conformité RGPD et sécurité des données

ENGAGEMENTS ÉCOLE
• Formation du personnel désigné
• Respect des conditions d'utilisation
• Paiement selon échéancier convenu
• Communication des modifications organisationnelles

DURÉE ET RÉSILIATION
Durée: 12 mois renouvelable
Préavis résiliation: 30 jours
Transfert données: Gratuit en fin de contrat

CONDITIONS PARTICULIÈRES
• Nombre maximum d'utilisateurs: 150
• Espace de stockage: 10 GB
• Nombre de SMS inclus: 2,000/mois
• Support prioritaire inclus

Fait à Yaoundé, le 20 janvier 2024

Pour EDUCAFRIC:                    Pour l'École:
Simon MUENHE                       Directeur Académique
Directeur Commercial               École Primaire Bilingue Yaoundé

Signature: _________________      Signature: _________________

EDUCAFRIC Platform v4.2.3
Contact: support@educafric.com | Tél: +237 XXX XXX XXX`
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
      content: `GUIDE COMPLET EDUCAFRIC - FORMATION COMMERCIALE 2024

PRÉSENTATION GÉNÉRALE
EDUCAFRIC est la plateforme éducative révolutionnaire conçue spécifiquement pour l'Afrique. Notre solution complète répond aux défis uniques de l'éducation africaine en proposant des outils numériques adaptés aux réalités locales.

FONCTIONNALITÉS PRINCIPALES

1. GESTION ACADÉMIQUE COMPLÈTE
   • Système de notes et bulletins personnalisables
   • Gestion des emplois du temps avec adaptation climatique
   • Suivi des présences en temps réel
   • Gestion des devoirs et évaluations

2. COMMUNICATION INTÉGRÉE
   • Notifications SMS via réseau local
   • WhatsApp Business API
   • Emails automatisés
   • Notifications push PWA

3. GESTION FINANCIÈRE
   • Intégration Orange Money / MTN Mobile Money
   • Paiements Stripe internationaux
   • Suivi des frais scolaires
   • Rapports financiers détaillés

STRATÉGIES DE VENTE

Prix Compétitifs:
• Parents: 1,000-1,500 CFA/mois
• Écoles: 50,000-75,000 CFA/an
• Freelancers: 25,000 CFA/an

Arguments Clés:
• Économies jusqu'à 73% comparé aux solutions traditionnelles
• ROI démontré en moins de 6 mois
• Support technique 24/7 en français
• Adaptation aux réalités africaines

DÉMONSTRATION
Utilisez notre environnement sandbox pour les démonstrations complètes avec données réalistes africaines.

Contact: commercial@educafric.com
Version: 4.2.3 - 2024`
    },
    {
      id: 8,
      name: 'CONTRAT PARTENARIAT ÉTABLISSEMENTS FREELANCERS 2025',
      type: 'contract',
      category: 'contracts',
      school: 'Document officiel',
      date: '2025-01-30',
      status: 'finalized',
      size: '4.5 MB',
      format: 'PDF',
      description: 'Contrat officiel EDUCAFRIC pour établissements scolaires et freelancers éducatifs',
      content: `EDUCAFRIC - CONTRAT DE PARTENARIAT ÉTABLISSEMENTS SCOLAIRES ET FREELANCERS 2025

Document Information
- Date de création: 30 janvier 2025
- Version: 3.0 (Mise à jour Educafric)
- Validité: Du 1er janvier 2025 au 31 décembre 2025
- Destinataires: Directeurs d'École, Freelancers Éducatifs, Équipe Juridique
- Objectif: Contrat officiel de partenariat Educafric pour établissements et répétiteurs

🏛️ PRÉAMBULE

Le présent contrat définit les modalités de partenariat entre EDUCAFRIC (exploité par AFRO METAVERSE MARKETING SARL) et les établissements scolaires ainsi que les freelancers éducatifs (répétiteurs) pour l'utilisation de la plateforme numérique éducative africaine.

Parties Contractantes:
- EDUCAFRIC : Plateforme éducative technologique
- ÉTABLISSEMENTS SCOLAIRES : Écoles publiques, privées, confessionnelles
- FREELANCERS ÉDUCATIFS : Répétiteurs indépendants, centres de formation

Mission Educafric:
Démocratiser l'accès aux technologies éducatives en Afrique et moderniser l'écosystème éducatif par l'innovation numérique.

📋 ARTICLE 1 - OBJET DU CONTRAT

1.1 Services Fournis par Educafric

🎓 Plateforme de Gestion Scolaire Complète
- Gestion des élèves: Inscription, profils, historique académique
- Gestion des enseignants: Profils, matières, planning, absences
- Classes et niveaux: Organisation SIL à Terminale (système camerounais)
- Emploi du temps numérique: Création et consultation interactive
- Présences électroniques: Appel numérique quotidien
- Notes et évaluations: Saisie, calcul moyennes automatique

📊 Système de Bulletins Numériques
- Bulletins digitaux professionnels: Templates officiels camerounais
- Calculs automatiques: Moyennes, rangs, appréciations
- Export PDF: Bulletins formatés pour impression
- Distribution automatique: Envoi parents par email/SMS
- Historique complet: Conservation multi-années sécurisée

💬 Communication École-Famille Intégrée
- Messages directs: Communication enseignants ↔ parents
- Notifications automatisées: Absences, notes, événements
- Annonces école: Diffusion informations importantes
- Calendrier événements: Réunions, examens, activités
- Support multilingue: Français et anglais natif

📱 Accès Mobile et Technologies Avancées
- Applications natives: iOS et Android optimisées
- Mode hors ligne: Consultation sans internet
- Notifications push: Alertes temps réel
- Géolocalisation: Suivi sécurisé élèves (optionnel)
- WhatsApp Business: Communication automatisée

📈 Rapports et Analytics
- Tableaux de bord: Vue d'ensemble performance
- Statistiques présences: Suivi assiduité détaillé
- Analyses académiques: Performance par matière/niveau
- Intelligence artificielle: Prédictions et recommandations
- Rapports automatisés: Synthèses mensuelles directeur

💰 ARTICLE 2 - TARIFICATION ET ABONNEMENTS

2.1 Plans Établissements Scolaires

🏫 Plan École Publique
Prix: 25.000 CFA/mois (250.000 CFA/an)
Élèves inclus: Jusqu'à 200 élèves
Économie annuelle: 50.000 CFA (2 mois gratuits)

✅ Fonctionnalités Incluses:
- Gestion complète élèves/enseignants
- Bulletins digitaux illimités
- Communication parents automatisée
- Emploi du temps interactif
- Présences électroniques
- Support technique dédié
- Notifications SMS (1000/mois)
- Formation équipe (8h incluses)

📊 Tarification Progressive:
- 0-200 élèves: 25.000 CFA/mois
- 201-500 élèves: +100 CFA/élève/mois
- 501-1000 élèves: +75 CFA/élève/mois
- +1000 élèves: Tarif négocié

🌟 Plan École Privée
Prix: 75.000 CFA/mois (750.000 CFA/an)
Élèves inclus: Jusqu'à 500 élèves
Économie annuelle: 150.000 CFA (2 mois gratuits)

✅ Tout du Plan Public +:
- Géolocalisation sécurité élèves
- Système paiement intégré
- Module comptabilité avancé
- Branding école personnalisé
- Application mobile école
- Analytics IA prédictive
- Support prioritaire 24/7
- Formation équipe (40h incluses)

💼 Plan École Enterprise
Prix: 150.000 CFA/mois (1.500.000 CFA/an)
Élèves: Illimités
Solution complète sur mesure

✅ Solution Premium:
- Toutes fonctionnalités incluses
- Multi-campus sans limite
- Personnalisation complète
- Intégrations sur mesure
- Infrastructure dédiée
- Équipe support dédiée

2.2 Plans Freelancers/Répétiteurs

👨‍🏫 Plan Freelancer Standard
Prix: 12.500 CFA/semestre (25.000 CFA/an)
Élèves: Jusqu'à 50 élèves maximum

✅ Fonctionnalités incluses:
- Gestion élèves personnelle
- Planning cours particuliers
- Suivi progression individuelle
- Communication parents directe
- Facturation automatisée
- Rapports de performance
- Support technique email

🎯 Plan Freelancer Pro
Prix: 20.000 CFA/semestre (40.000 CFA/an)
Élèves: Jusqu'à 150 élèves maximum

✅ Tout du Standard +:
- Géolocalisation cours (optionnel)
- Multi-matières illimitées
- Templates cours avancés
- Analytics performance détaillées
- Branding personnel
- Support téléphonique prioritaire

2.3 Modalités de Paiement

💳 Méthodes de Paiement Acceptées:
- Orange Money (Cameroun)
- MTN Mobile Money (Cameroun)
- Stripe (cartes internationales)
- Virement bancaire (grandes écoles)
- Espèces (agents locaux)

📋 Conditions de Paiement:
- Paiement mensuel: Débité automatiquement le 1er du mois
- Paiement annuel: 15% de réduction appliquée
- Période d'essai: 30 jours gratuits pour toutes les formules
- Résiliation: Préavis de 30 jours requis

⚖️ ARTICLE 3 - OBLIGATIONS ET RESPONSABILITÉS

3.1 Obligations d'Educafric

📞 Support Technique:
- Support technique 24/7 en français
- Temps de réponse: < 4 heures ouvrables
- Formation initiale gratuite incluse
- Mises à jour automatiques gratuites
- Sauvegarde quotidienne des données
- Garantie uptime 99.5%

🔒 Sécurité et Confidentialité:
- Chiffrement SSL/TLS obligatoire
- Conformité GDPR et lois camerounaises
- Protection données personnelles élèves
- Accès sécurisé par rôles
- Audit sécurité annuel
- Plan de reprise d'activité

3.2 Obligations du Partenaire

📚 Établissements Scolaires:
- Désigner 2 administrateurs maximum
- Former le personnel à l'utilisation
- Respecter les conditions d'utilisation
- Paiement des frais dans les délais
- Communication changements importants
- Participation aux mises à jour critiques

👨‍🏫 Freelancers:
- Utilisation éthique de la plateforme
- Respect de la propriété intellectuelle
- Non-revente des accès
- Mise à jour informations personnelles
- Respect des horaires de maintenance

📝 ARTICLE 4 - FORMATION ET ACCOMPAGNEMENT

4.1 Formation Initiale

🎓 Pour les Établissements:
- Formation directeur/administrateurs: 8 heures
- Formation enseignants: 16 heures
- Formation secrétariat: 4 heures
- Support documentation complète
- Webinaires de perfectionnement mensuels

👨‍🏫 Pour les Freelancers:
- Session individuelle: 2 heures
- Documentation pas-à-pas
- Tutoriels vidéo français
- Groupe WhatsApp support

4.2 Support Continu

📞 Canaux de Communication:
- Email: support@educafric.com
- WhatsApp: +237 XXX XXX XXX
- Téléphone: +237 XXX XXX XXX
- Chat en ligne: www.educafric.com

⏰ Horaires de Support:
- Lundi-Vendredi: 7h00-19h00 (GMT+1)
- Samedi: 8h00-16h00 (GMT+1)
- Urgences 24/7: numéro dédié

💾 ARTICLE 5 - DONNÉES ET PROPRIÉTÉ INTELLECTUELLE

5.1 Propriété des Données

📊 Données Scolaires:
- Propriété exclusive de l'établissement
- Droit d'exportation complète
- Suppression garantie à la résiliation
- Accès lecture seule pour maintenance

🔐 Données Educafric:
- Code source: propriété Educafric
- Base de données plateforme: propriété Educafric
- Algorithmes IA: propriété Educafric
- Templates: licence d'utilisation accordée

5.2 Confidentialité

🤐 Engagements Mutuels:
- Non-divulgation informations sensibles
- Protection données personnelles élèves/parents
- Accès restreint personnel autorisé uniquement
- Signalement incidents sécurité obligatoire

⏱️ ARTICLE 6 - DURÉE ET RÉSILIATION

6.1 Durée du Contrat

📅 Période Contractuelle:
- Durée initiale: 12 mois renouvelables
- Renouvellement: Automatique sauf dénonciation
- Préavis résiliation: 30 jours minimum
- Période d'essai: 30 jours gratuits

6.2 Conditions de Résiliation

❌ Résiliation par Educafric:
- Non-paiement: après 30 jours de retard
- Violation conditions d'utilisation
- Utilisation frauduleuse
- Préavis: 15 jours minimum

❌ Résiliation par le Partenaire:
- Préavis écrit: 30 jours minimum
- Motif non requis
- Remboursement: au prorata temporis
- Export données: garanti 90 jours

🚨 ARTICLE 7 - RESPONSABILITÉS ET LIMITES

7.1 Limitation de Responsabilité

⚠️ Exclusions:
- Dommages indirects ou consécutifs
- Perte de bénéfices
- Interruption d'activité
- Force majeure (pannes électriques, etc.)

💰 Plafond de Responsabilité:
- Maximum: montant des frais annuels payés
- Assurance responsabilité civile professionnelle
- Couverture: 500.000.000 CFA

7.2 Garanties de Service

✅ Engagements Qualité:
- Disponibilité plateforme: 99.5% minimum
- Temps de réponse support: < 4h ouvrables
- Résolution incidents: < 24h ouvrables
- Maintenance préventive: annoncée 48h avant

📋 ARTICLE 8 - DISPOSITIONS FINALES

8.1 Droit Applicable

⚖️ Juridiction:
- Droit camerounais applicable
- Tribunaux de Yaoundé compétents
- Langue du contrat: français
- Arbitrage possible si accord mutuel

8.2 Modifications

✏️ Évolutions Contractuelles:
- Modifications par avenant écrit uniquement
- Notification changements: 30 jours minimum
- Droit de résiliation si refus modifications majeures

8.3 Intégralité

📑 Clause de Totalité:
- Le présent contrat annule tous accords antérieurs
- Conditions générales consultables sur www.educafric.com
- Versions française et anglaise: version française prévaut

📞 CONTACTS ET SIGNATURES

EDUCAFRIC
AFRO METAVERSE MARKETING SARL
Adresse: Yaoundé, Cameroun
Email: contact@educafric.com
Tél: +237 XXX XXX XXX

Directeur Général: Simon MUENHE
Date: ________________
Signature: ________________

PARTENAIRE
École/Freelancer: ________________
Directeur/Responsable: ________________
Date: ________________
Signature: ________________

---
Document généré par EDUCAFRIC Platform v4.2.3
www.educafric.com - Révolutionner l'éducation en Afrique`
    },
    {
      id: 9,
      name: 'Présentation Dashboards EDUCAFRIC 2025',
      type: 'brochure',
      category: 'brochures',
      school: 'Documentation client',
      date: '2025-02-01',
      status: 'finalized',
      size: '2.8 MB',
      format: 'PDF',
      description: 'Présentation complète de tous les tableaux de bord utilisateurs EDUCAFRIC',
      content: `PRÉSENTATION COMPLÈTE DES DASHBOARDS EDUCAFRIC 2025

ARCHITECTURE UTILISATEURS
EDUCAFRIC propose 6 rôles utilisateurs distincts, chacun avec son dashboard personnalisé et ses modules spécifiques.

1. SITE ADMIN (Administrateur Plateforme)
   • Gestion globale de tous les utilisateurs
   • Surveillance système et performance
   • Configuration plateforme
   • Statistiques globales
   • Gestion des écoles partenaires

2. ADMIN ÉCOLE
   • Gestion complète de l'établissement
   • Configuration des classes et matières
   • Gestion du personnel enseignant
   • Rapports financiers école
   • Paramètres institutionnels

3. DIRECTEUR
   • Vue d'ensemble établissement
   • Statistiques académiques
   • Gestion pédagogique
   • Rapports direction
   • Communication institutionnelle

4. ENSEIGNANT
   • Gestion des classes assignées
   • Saisie notes et évaluations
   • Gestion des devoirs
   • Communication parents
   • Emploi du temps personnel

5. PARENT
   • Suivi enfants scolarisés
   • Consultation notes et bulletins
   • Communication enseignants
   • Paiements frais scolaires
   • Notifications importantes

6. ÉLÈVE
   • Consultation notes personnelles
   • Emploi du temps
   • Devoirs à rendre
   • Ressources pédagogiques
   • Communication école

7. FREELANCER
   • Gestion projets éducatifs
   • Outils création contenu
   • Collaboration établissements
   • Facturation services
   • Portfolio professionnel

8. COMMERCIAL
   • Gestion prospects écoles
   • Documents commerciaux
   • Suivi ventes
   • Rapports activité
   • Outils démonstration

CARACTÉRISTIQUES TECHNIQUES
• Interface responsive mobile-first
• Thème africain coloré et moderne
• Navigation intuitive
• Performance optimisée
• Sécurité renforcée

Chaque dashboard est conçu pour maximiser l'efficacité et l'expérience utilisateur selon le rôle spécifique.

EDUCAFRIC Platform v4.2.3 - 2025
www.educafric.com`
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

  const handleViewDocument = async (doc: any) => {
    try {
      // For mobile devices, generate and open PDF directly
      const isMobile = window.innerWidth <= 768 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      if (isMobile) {
        // Generate PDF and open in new tab for mobile
        const { jsPDF } = await import('jspdf');
        const pdf = new jsPDF();
        
        // Header with EDUCAFRIC branding
        pdf.setFontSize(18);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(59, 130, 246); // Blue color
        pdf.text('EDUCAFRIC', 20, 25);
        
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(0, 0, 0); // Black
        pdf.text(doc.name || '', 20, 40);
        
        // Document metadata
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`Type: ${doc.type} | École: ${doc.school}`, 20, 55);
        pdf.text(`Statut: ${doc.status} | Date: ${doc.date} | Taille: ${doc.size}`, 20, 62);
        
        // Description
        if (doc.description) {
          pdf.setFontSize(11);
          pdf.setFont('helvetica', 'bold');
          pdf.text('Description:', 20, 75);
          pdf.setFont('helvetica', 'normal');
          const descLines = pdf.splitTextToSize(doc.description, 170);
          pdf.text(descLines, 20, 82);
        }
        
        // Main content with proper formatting
        if (doc.content) {
          pdf.setFontSize(12);
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(59, 130, 246); // Blue color for header
          pdf.text('Contenu du document:', 20, 100);
          
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'normal');
          pdf.setTextColor(0, 0, 0); // Black for content
          
          // Split content into lines and handle page breaks
          const contentLines = pdf.splitTextToSize(doc.content, 170);
          let yPosition = 110;
          
          contentLines.forEach((line: string) => {
            if (yPosition > 270) { // Near bottom of page
              pdf.addPage();
              yPosition = 20;
            }
            pdf.text(line, 20, yPosition);
            yPosition += 5;
          });
        }
        
        // Footer on each page
        const pageCount = pdf.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
          pdf.setPage(i);
          pdf.setFontSize(8);
          pdf.setTextColor(128, 128, 128); // Gray
          pdf.text(`Page ${i}/${pageCount} - EDUCAFRIC Platform v4.2.3`, 105, 285, { align: 'center' });
          pdf.text('www.educafric.com - Plateforme éducative pour l\'Afrique', 105, 292, { align: 'center' });
        }
        
        // Create blob and open in new window/tab
        const pdfBlob = pdf.output('blob');
        const pdfUrl = URL.createObjectURL(pdfBlob);
        
        // Open PDF in new window/tab
        const newWindow = window.open(pdfUrl, '_blank');
        if (newWindow) {
          newWindow.document.title = doc.name || 'Document EDUCAFRIC';
          
          // Clean up URL after some time
          setTimeout(() => {
            URL.revokeObjectURL(pdfUrl);
          }, 120000); // 2 minutes
        } else {
          // Fallback: download the PDF if popup is blocked
          const a = document.createElement('a');
          a.style.display = 'none';
          a.href = pdfUrl;
          a.download = `${doc.name || 'document'}.pdf`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(pdfUrl);
        }
        
        toast({
          title: language === 'fr' ? 'Document ouvert' : 'Document opened',
          description: language === 'fr' ? `${doc.name || ''} ouvert dans un nouvel onglet` : `${doc.name || ''} opened in new tab`,
        });
        
      } else {
        // Desktop: Use dialog view
        setSelectedDocument(doc);
        setIsViewDialogOpen(true);
      }
      
    } catch (error) {
      console.error('Error opening document:', error);
      // Fallback to dialog view
      setSelectedDocument(doc);
      setIsViewDialogOpen(true);
      
      toast({
        title: language === 'fr' ? 'Ouverture alternative' : 'Alternative view',
        description: language === 'fr' ? 'Document affiché dans une fenêtre modale' : 'Document displayed in modal window',
      });
    }
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
        <DialogContent className="max-w-6xl max-h-[95vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0 pb-4 border-b">
            <DialogTitle className="flex items-center gap-2 text-xl">
              {selectedDocument && getTypeIcon(selectedDocument.type)}
              {selectedDocument?.name}
            </DialogTitle>
            <DialogDescription className="text-base mt-2">
              {selectedDocument?.description}
            </DialogDescription>
          </DialogHeader>
          
          {selectedDocument && (
            <div className="flex-1 overflow-hidden flex flex-col space-y-4 py-4">
              {/* Document metadata */}
              <div className="flex-shrink-0 grid grid-cols-3 gap-4 text-sm bg-gray-50 p-4 rounded-lg">
                <div><strong>{t.type}:</strong> {t[selectedDocument.type as keyof typeof t] || selectedDocument.type}</div>
                <div><strong>{t.school}:</strong> {selectedDocument.school}</div>
                <div><strong>{t.date}:</strong> {selectedDocument.date}</div>
                <div><strong>{t.size}:</strong> {selectedDocument.size}</div>
                <div><strong>Format:</strong> {selectedDocument.format}</div>
                <div><strong>{t.status}:</strong> 
                  <Badge className={`ml-2 ${getStatusBadge(selectedDocument.status)} text-xs`}>
                    {t[selectedDocument.status as keyof typeof t] || selectedDocument.status}
                  </Badge>
                </div>
              </div>
              
              {/* Document content - main scrollable area */}
              {selectedDocument.content && (
                <div className="flex-1 border-2 border-blue-200 rounded-lg bg-blue-50 overflow-hidden flex flex-col">
                  <div className="flex-shrink-0 bg-blue-100 px-6 py-3 border-b border-blue-200">
                    <h4 className="font-semibold text-lg text-blue-800">
                      {language === 'fr' ? 'Contenu du Document:' : 'Document Content:'}
                    </h4>
                  </div>
                  <div className="flex-1 p-6 overflow-y-auto">
                    <div className="whitespace-pre-wrap text-base leading-relaxed text-gray-800 min-h-0">
                      {selectedDocument.content}
                    </div>
                  </div>
                </div>
              )}
              
              {!selectedDocument.content && (
                <div className="flex-1 border-2 border-orange-200 rounded-lg p-6 bg-orange-50 flex items-center justify-center">
                  <div className="text-center">
                    <h4 className="font-medium text-orange-800 mb-2">
                      {language === 'fr' ? 'Contenu non disponible' : 'Content not available'}
                    </h4>
                    <p className="text-orange-600">
                      {language === 'fr' ? 'Ce document ne contient pas de contenu prévisualisable.' : 'This document does not contain previewable content.'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter className="flex-shrink-0 pt-4 border-t">
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