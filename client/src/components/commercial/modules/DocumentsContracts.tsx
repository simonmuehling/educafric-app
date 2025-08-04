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
      content: 'CONTRAT DE SERVICE EDUCAFRIC\n\nÉCOLE PRIMAIRE BILINGUE DE YAOUNDÉ\n\nArticle 1: Objet du contrat\nLe présent contrat a pour objet la fourniture et l\'implémentation de la plateforme éducative EDUCAFRIC au sein de l\'École Primaire Bilingue de Yaoundé.\n\nArticle 2: Services inclus\n- Plateforme de gestion académique complète\n- Formation du personnel enseignant\n- Support technique 24/7\n- Mise à jour régulière du système\n- Sauvegarde automatique des données\n\nArticle 3: Durée\nLe présent contrat est conclu pour une période de 12 mois renouvelable.\n\nArticle 4: Tarification\nTarif annuel: 75,000 CFA\nPaiement trimestriel accepté\n\nArticle 5: Responsabilités\nEDUCAFRIC s\'engage à fournir un service de qualité conforme aux standards éducatifs africains.'
    },
    {
      id: 2,
      name: 'Brochure Educafric 2024',
      type: 'brochure',
      category: 'brochures',
      school: 'Toutes écoles',
      date: '2024-01-15',
      status: 'signed',
      size: '5.1 MB',
      format: 'PDF',
      description: 'Brochure commerciale principale',
      content: 'EDUCAFRIC - RÉVOLUTIONNEZ L\'ÉDUCATION EN AFRIQUE\n\nPlateforme éducative complète pour les écoles africaines\n\n🎯 NOTRE MISSION\nTransformer l\'éducation en Afrique grâce à une technologie adaptée aux besoins locaux.\n\n📚 FONCTIONNALITÉS PRINCIPALES\n\nGestion Académique:\n- Système de notes et bulletins\n- Gestion des emplois du temps\n- Suivi des présences\n- Communication parents-enseignants\n\nOutils Pédagogiques:\n- Bibliothèque de cours digitaux\n- Exercices interactifs\n- Évaluations en ligne\n- Tableau de bord personnalisé\n\nCommunication:\n- SMS et WhatsApp intégrés\n- Notifications en temps réel\n- Support multilingue (Français/Anglais)\n\n💰 TARIFS COMPÉTITIFS\n- Parents: 1,000-1,500 CFA/mois\n- Écoles: 50,000-75,000 CFA/an\n- Freelancers: 25,000 CFA/an\n\n🌍 ADAPTÉ À L\'AFRIQUE\n- Compatible avec les réseaux locaux\n- Paiement mobile money\n- Support technique local\n\nContactez-nous: contact@educafric.com'
    },
    {
      id: 3,
      name: 'Proposition Lycée Excellence',
      type: 'proposal',
      category: 'contracts',
      school: 'Lycée Excellence Douala',
      date: '2024-01-18',
      status: 'pending',
      size: '1.8 MB',
      format: 'DOCX',
      description: 'Proposition commerciale personnalisée',
      content: 'PROPOSITION COMMERCIALE\nLYCÉE EXCELLENCE DOUALA\n\nObjet: Implémentation plateforme EDUCAFRIC\n\nMadame, Monsieur,\n\nSuite à notre entretien du 15 janvier 2024, nous avons le plaisir de vous présenter notre proposition pour l\'intégration de la plateforme EDUCAFRIC au sein du Lycée Excellence de Douala.\n\nANALYSE DES BESOINS:\n- 450 élèves répartis sur 3 niveaux\n- 25 enseignants\n- Besoin de digitalisation des processus\n- Communication parents améliorée\n\nSOLUTION PROPOSÉE:\n\n1. Plateforme de gestion académique complète\n2. Formation personnalisée pour l\'équipe\n3. Migration des données existantes\n4. Support technique dédié\n\nTARIFICATION:\n- Installation et formation: 150,000 CFA\n- Abonnement annuel: 65,000 CFA\n- Support technique: Inclus\n\nDÉLAI DE MISE EN ŒUVRE:\n2 semaines après signature\n\nVALIDITÉ DE L\'OFFRE:\n30 jours\n\nNous restons à votre disposition pour tout complément d\'information.\n\nCordialement,\nÉquipe EDUCAFRIC'
    },
    {
      id: 4,
      name: 'Modèle Contrat Standard EDUCAFRIC 2025',
      type: 'template',
      category: 'templates',
      school: 'Template général',
      date: '2025-02-01',
      status: 'finalized',
      size: '1.2 MB',
      format: 'PDF',
      description: 'Modèle de contrat complet et actualisé pour nouveaux clients',
      content: `# EDUCAFRIC
## Plateforme Éducative Révolutionnaire pour l'Afrique

---

# CONTRAT DE VENTE EDUCAFRIC
**Modèle Commercial 2025 - Version 4.2.3**

---

## INFORMATIONS CLIENT

**Nom de l'École/Institution:** ________________________________  
**Directeur/Contact Principal:** ________________________________  
**Adresse Complète:** ___________________________________________________  
**Téléphone:** _________________ **Email:** ____________________  
**Nombre d'Élèves:** _________ **Nombre d'Enseignants:** _______  
**Type d'Établissement:** □ Public □ Privé □ International  
**Pays:** _____________ **Région/Ville:** _____________  

---

## OFFRES TARIFAIRES OFFICIELLES EDUCAFRIC

### 🏫 **ÉCOLES PUBLIQUES**
- **Abonnement École:** 50,000 CFA /an
- **Abonnement Parent (par enfant):** 1,000-1,500 CFA /mois (12,000-18,000 CFA /an)
- **Enseignant Freelance:** 25,000 CFA /an ou 12,500 CFA /semestre

### 🏫 **ÉCOLES PRIVÉES**  
- **Abonnement École:** 75,000 CFA /an
- **Abonnement Parent (par enfant):** 1,000-1,500 CFA /mois (12,000-18,000 CFA /an)
- **Enseignant Freelance:** 25,000 CFA /an ou 12,500 CFA /semestre

### 🏫 **ÉCOLES INTERNATIONALES**
- **Abonnement École:** 100,000 CFA /an
- **Abonnement Parent (par enfant):** 1,500 CFA /mois (18,000 CFA /an)
- **Enseignant Freelance:** 25,000 CFA /an ou 12,500 CFA /semestre

### 👨‍👩‍👧‍👦 **REMISES FAMILIALES**
- **2 enfants:** 20% de réduction sur abonnements parents
- **3+ enfants:** 40% de réduction sur abonnements parents
- **Familles nombreuses (5+ enfants):** 50% de réduction

---

## FONCTIONNALITÉS INCLUSES

### 📊 **GESTION SCOLAIRE COMPLÈTE**
- Tableau de bord multi-rôles (Admin, Directeur, Enseignant, Parent, Élève, Freelancer)
- Gestion des classes et emplois du temps avec précision 5 minutes
- Suivi des notes et bulletins automatisés style africain
- Gestion de la présence avec notifications automatiques parents
- Système de devoirs avec soumission numérique
- Génération automatique de rapports académiques

### 📱 **COMMUNICATION AVANCÉE**
- **Notifications SMS automatiques** (Vonage API intégrée)
- **Messages WhatsApp Business** pour communications urgentes
- **Notifications push en temps réel** même app fermée
- **Interface bilingue** (Français/Anglais) avec traduction contextuelle
- **Email automatisé** (Hostinger SMTP)
- Communication multi-canal intégrée

### 💳 **SYSTÈMES DE PAIEMENT AFRICAINS**
- **Orange Money** intégration complète
- **MTN Mobile Money** support natif
- **Afriland First Bank** virements automatisés
- **Stripe** cartes de crédit sécurisées internationales
- Suivi des paiements et relances automatiques
- Confirmations de paiement en temps réel

### 📱 **APPLICATIONS MOBILES**
- **Application Web Progressive (PWA)** installation native
- **Application React Native** Android/iOS
- **Mode hors-ligne** pour accès sans internet
- **Notifications push** même app fermée
- Interface optimisée smartphone/tablette

### 🔒 **SÉCURITÉ ET CONFORMITÉ**
- **Authentification multi-facteurs (2FA)** avec Google Authenticator
- **Authentification Firebase Google OAuth**
- **Codes QR** pour connexions rapides
- **Protection des données RGPD** et conformité africaine
- **Système de détection d'intrusion (IDS)** intégré
- **Chiffrement bout-en-bout** pour données sensibles

### 🌍 **GÉOLOCALISATION ET SÉCURITÉ**
- **Suivi GPS en temps réel** tablettes/smartphones
- **Zones de sécurité (geofencing)** configurables
- **Alertes d'urgence** pour parents et administrations
- **Suivi des trajets** école-maison
- **Monitoring des appareils** en temps réel

---

## PRIX TOTAL CALCULÉ

**École (Type: ________________):** _________________ CFA/an  
**Parents (_____ enfants):** _________________ CFA/an  
**Enseignants Freelance (______):** _________________ CFA/an  
**Remise familiale appliquée:** -_________________ CFA  
**Frais d'installation (50% offre lancement):** _________________ CFA  

### 💰 **PRIX TOTAL:** _________________ CFA/an

---

## MODES DE PAIEMENT ACCEPTÉS

### 💳 **PAIEMENT IMMÉDIAT**
- **Orange Money:** +237 6XX XXX XXX
- **MTN Mobile Money:** +237 6XX XXX XXX  
- **Carte de crédit:** Paiement sécurisé Stripe
- **Virement bancaire Afriland:** [Détails fournis après signature]

### 📅 **PAIEMENT ÉCHELONNÉ**
- **Trimestriel:** 25% du total tous les 3 mois
- **Semestriel:** 50% du total tous les 6 mois  
- **Mensuel:** Disponible pour écoles privées/internationales

---

## SERVICES D'ACCOMPAGNEMENT

### 🎓 **FORMATION INCLUSE**
- **Formation Directeur/Administrateur:** 3 heures complètes
- **Formation Enseignants:** 1.5 heure par enseignant
- **Formation Parents:** Session groupe (2h) ou individuelle
- **Support technique:** 6 mois inclus avec réponse <24h
- **Documentation complète** en français et anglais

### 🆘 **SUPPORT CONTINU**
- **Email support:** info@educafric.com
- **WhatsApp support business:** +237 656 200 472
- **Hotline téléphonique:** +237 XXX XXX XXX
- **Formation supplémentaire:** 15,000 CFA /session
- **Maintenance technique:** Incluse première année
- **Mises à jour automatiques** incluses

---

## AVANTAGES EXCLUSIFS 2025

### 🎁 **OFFRE DE LANCEMENT**
- **50% de réduction** sur frais d'installation
- **Formation gratuite** pour toute l'équipe
- **3 mois de support technique gratuit** supplémentaire
- **Accès prioritaire** aux nouvelles fonctionnalités
- **Migration données gratuite** depuis autre système

### ✅ **GARANTIES**
- **Garantie satisfaction 30 jours** ou remboursement intégral
- **Disponibilité 99.9%** garantie avec SLA
- **Sauvegardes automatiques quotidiennes**
- **Protection contre perte de données**
- **Support technique réactif <24h**

---

## CALENDRIER DE DÉPLOIEMENT

### 📅 **Semaine 1-2: CONFIGURATION**
- Installation et configuration serveur sécurisé
- Import des données école existantes avec validation
- Configuration des utilisateurs et permissions
- Tests de sécurité et performance

### 📅 **Semaine 3: FORMATION**  
- Formation équipe administrative (3h)
- Formation corps enseignant (1.5h/personne)
- Session parents démonstration (2h)
- Remise documentation complète

### 📅 **Semaine 4: LANCEMENT**
- Mise en production avec monitoring
- Suivi quotidien première semaine  
- Ajustements et optimisations personnalisées
- Validation finale fonctionnement

---

## CONDITIONS CONTRACTUELLES

### ⏰ **DURÉE DU CONTRAT**
- **Durée initiale:** 12 mois calendaires
- **Renouvellement:** Automatique sauf préavis écrit 60 jours
- **Période d'essai:** 30 jours satisfaction garantie
- **Résiliation:** Possible avec préavis 60 jours

### 🔹 **OBLIGATIONS EDUCAFRIC**
- Maintenir service opérationnel 99.9% du temps avec SLA
- Fournir support technique réactif (<24h ouvrées)
- Former équipes selon calendrier convenu
- Protéger données selon standards RGPD et africains
- Fournir mises à jour sécurité automatiques
- Assurer sauvegardes quotidiennes automatiques

### 🔹 **OBLIGATIONS CLIENT**
- Fournir accès données existantes pour migration sécurisée
- Désigner référent technique interne formé
- Participer aux formations obligatoires planifiées
- Respecter échéances de paiement convenues
- Signaler incidents techniques dans les 48h
- Maintenir confidentialité accès plateforme

### ⚖️ **CLAUSES JURIDIQUES**
- **Juridiction compétente:** Tribunaux du Cameroun
- **Loi applicable:** Droit camerounais et OHADA
- **Protection données:** Conforme RGPD et lois locales
- **Propriété intellectuelle:** EDUCAFRIC reste propriétaire du logiciel
- **Confidentialité:** Accord de non-divulgation mutuel

---

## CONTACTS EDUCAFRIC

**Siège Social:** Yaoundé, Cameroun  
**Email général:** info@educafric.com  
**Support technique:** support@educafric.com  
**Commercial:** commercial@educafric.com  
**WhatsApp Business:** +237 656 200 472  
**Site web:** https://educafric.com  

---

## SIGNATURES

**EDUCAFRIC**  
Représenté par: _________________________________  
Fonction: Directeur Commercial  
Date: _________ Signature: ______________________  
Cachet de l'entreprise:

---

**CLIENT**  
Nom: _________________________________________  
Fonction: ____________________________________  
École/Institution: _______________________________  
Date: _________ Signature: ______________________  
Cachet de l'établissement:

---

**TÉMOIN** (Optionnel)  
Nom: _________________________________________  
Fonction: ____________________________________  
Date: _________ Signature: ______________________

---

*Document généré par EDUCAFRIC Platform v4.2.3 - Tous droits réservés*`
    },
    {
      id: 5,
      name: 'Conditions Générales de Vente',
      type: 'legal',
      category: 'legal',
      school: 'Document légal',
      date: '2024-01-05',
      status: 'signed',
      size: '1.2 MB',
      format: 'PDF',
      description: 'CGV mises à jour 2024'
    },
    {
      id: 6,
      name: 'Guide Marketing Digital',
      type: 'marketing',
      category: 'marketing',
      school: 'Ressource interne',
      date: '2024-01-12',
      status: 'draft',
      size: '3.7 MB',
      format: 'PDF',
      description: 'Stratégies marketing pour écoles africaines',
      content: 'GUIDE MARKETING DIGITAL EDUCAFRIC\n\nSTRATÉGIES POUR ÉCOLES AFRICAINES\n\n📱 APPROCHE DIGITALE LOCALE\n\nComment présenter EDUCAFRIC aux écoles africaines :\n\n1. IDENTIFIER LES BESOINS LOCAUX\n- Problèmes de gestion manuelle\n- Communication difficile avec les parents\n- Suivi des notes complexe\n- Absences non contrôlées\n\n2. ADAPTER LE DISCOURS\n- Économies réalisées (jusqu\'à 73%)\n- Simplicité d\'utilisation\n- Support en français/anglais\n- Compatible avec les réseaux africains\n\n3. DÉMONSTRATIONS PRATIQUES\n- Montrer le tableau de bord directeur\n- Simulation SMS/WhatsApp parents\n- Demo du bulletin numérique\n- Test de géolocalisation\n\n4. ARGUMENTS CLÉS\n- ROI prouvé dans 50+ écoles\n- Conformité éducation africaine\n- Paiement mobile money\n- Formation incluse\n\n5. OBJECTIONS COURANTES\n- "Trop cher" → Calcul d\'économies\n- "Trop compliqué" → Demo simple\n- "Pas adapté" → Exemples locaux\n- "Pas de connexion" → Mode hors ligne\n\nCONTACT SUPPORT: commercial@educafric.com'
    },
    {
      id: 8,
      name: 'PRÉSENTATION DASHBOARDS EDUCAFRIC 2025',
      type: 'brochure',
      category: 'brochures',
      school: 'Documentation client',
      date: '2025-02-01',
      status: 'finalized',
      size: '2.8 MB',
      format: 'PDF',
      description: 'Présentation complète de tous les tableaux de bord utilisateurs EDUCAFRIC',
      content: `# EDUCAFRIC
## Présentation des Tableaux de Bord Utilisateurs
### Plateforme Éducative Révolutionnaire pour l'Afrique

---

# PRÉSENTATION COMPLÈTE DES DASHBOARDS
**Version 4.2.3 - 2025**

---

## 🎯 VUE D'ENSEMBLE DU SYSTÈME

### 6 RÔLES UTILISATEURS PRINCIPAUX
- **🏫 Admin École** - Gestion administrative école  
- **👨‍💼 Directeur** - Direction pédagogique et stratégique
- **👩‍🏫 Enseignant** - Gestion de classe et pédagogie
- **👨‍👩‍👧‍👦 Parent** - Suivi enfants et communication
- **🎓 Élève** - Apprentissage et suivi académique
- **🆓 Freelancer** - Enseignement indépendant

---

## 🏫 DASHBOARD ADMIN ÉCOLE
### Gestion Administrative Complète

#### 📚 **MODULES ADMINISTRATIFS**

**🎓 GESTION ACADÉMIQUE**
- Planning général de l'établissement
- Gestion des classes et emplois du temps
- Suivi global des notes et évaluations
- Calendrier scolaire et événements

**👥 GESTION PERSONNEL**
- Dossiers enseignants et personnels
- Planification des remplacements
- Suivi des formations continues
- Évaluations performances équipe

**💰 GESTION FINANCIÈRE**
- Suivi des frais de scolarité
- Gestion des paiements parents
- Budgets départements et projets
- Rapports financiers détaillés

**📊 TABLEAU DE BORD EXÉCUTIF**
- KPIs établissement en temps réel
- Alertes événements importants
- Synthèse mensuelle activités
- Comparaisons performance années

#### 🎯 **MÉTRIQUES ÉTABLISSEMENT**
```
👨‍🎓 Enseignants: 45
🎓 Élèves: 1,250
📈 Taux Réussite: 92%
💳 Paiements à Jour: 87%
```

---

## 👨‍💼 DASHBOARD DIRECTEUR
### Direction Pédagogique et Stratégique

#### 🎯 **MODULES DIRECTORIAUX**

**📚 SUPERVISION PÉDAGOGIQUE**
- Vue d'ensemble programmes scolaires
- Suivi progression pédagogique classes
- Évaluations performances enseignants
- Planification formations pédagogiques

**📊 ANALYSES STRATÉGIQUES**
- Statistiques réussite par matière
- Comparaisons inter-classes
- Tendances évolution notes
- Prédictions orientations élèves

**🤝 RELATIONS COMMUNAUTÉ**
- Communication parents institutionnelle
- Organisation événements établissement
- Gestion partenariats extérieurs
- Coordination avec autorités éducatives

**📈 PILOTAGE ÉTABLISSEMENT**
- Objectifs pédagogiques annuels
- Indicateurs qualité enseignement
- Projets d'amélioration continue
- Validation budgets pédagogiques

---

## 👩‍🏫 DASHBOARD ENSEIGNANT
### Gestion de Classe et Pédagogie

#### 📝 **MODULES PÉDAGOGIQUES**

**👥 GESTION DE CLASSE**
- Liste élèves avec photos
- Suivi présences quotidiennes
- Notes et évaluations continues
- Communication directe parents

**📚 CONTENU PÉDAGOGIQUE**
- Création et gestion cours
- Devoirs et exercices numériques
- Ressources pédagogiques partagées
- Évaluations personnalisées

**📊 SUIVI ACADÉMIQUE**
- Carnet de notes électronique
- Graphiques progression élèves
- Alertes difficultés apprentissage
- Rapports individualisés parents

---

## 👨‍👩‍👧‍👦 DASHBOARD PARENT
### Suivi Enfants et Communication

#### 👶 **MODULES PARENTAUX**

**🎓 SUIVI ACADÉMIQUE ENFANTS**
- Notes en temps réel par matière
- Bulletins scolaires digitaux
- Progression comparative classe
- Alertes importantes scolaires

**📅 VIE SCOLAIRE**
- Emploi du temps enfants
- Présences et absences
- Devoirs et échéances
- Événements et sorties

**💬 COMMUNICATION ÉCOLE**
- Messages enseignants directs
- Notifications WhatsApp/SMS
- Convocations et réunions
- Actualités établissement

---

## 🎓 DASHBOARD ÉLÈVE
### Apprentissage et Suivi Académique

#### 📚 **MODULES ÉTUDIANT**

**📖 MON PARCOURS SCOLAIRE**
- Notes par matière et trimestre
- Emploi du temps personnalisé
- Progression et objectifs
- Conseils orientation future

**📝 DEVOIRS ET TRAVAUX**
- Agenda devoirs numériques
- Soumission travaux en ligne
- Corrections et commentaires
- Ressources supplémentaires

---

## 🆓 DASHBOARD FREELANCER
### Enseignement Indépendant

#### 🎓 **MODULES FREELANCE**

**👥 GESTION ÉLÈVES PRIVÉS**
- Liste élèves cours particuliers
- Planning sessions personnalisées
- Suivi progression individualisée
- Communication parents dédiée

**💰 GESTION ACTIVITÉ**
- Tarifs et facturation cours
- Suivi paiements élèves
- Statistiques revenus mensuels
- Gestion disponibilités

---

## 🔧 FONCTIONNALITÉS TRANSVERSALES

### 📱 **COMMUNICATION INTÉGRÉE**
- **WhatsApp Business API** notifications instantanées
- **SMS Vonage** alertes critiques temps réel
- **Email Hostinger** communications officielles
- **Push Notifications** même application fermée

### 💳 **PAIEMENTS AFRICAINS**
- **Orange Money** intégration complète
- **MTN Mobile Money** transactions natives
- **Afriland First Bank** virements automatisés
- **Stripe International** cartes crédit sécurisées

### 🔒 **SÉCURITÉ AVANCÉE**
- **Authentification 2FA** Google Authenticator
- **Firebase OAuth** connexions sécurisées
- **Détection d'Intrusion IDS** monitoring automatique
- **Chiffrement AES-256** protection données

### 🌍 **GÉOLOCALISATION**
- **Suivi GPS temps réel** tablettes et smartphones
- **Zones de sécurité** geofencing configurable
- **Alertes d'urgence** parents et administrations
- **Monitoring trajets** école-maison sécurisés

---

## 📊 MÉTRIQUES GLOBALES PLATEFORME

### 🎯 **INDICATEURS CLÉS DE PERFORMANCE**
```
👥 Utilisateurs Totaux: 50,000+
🏫 Écoles Partenaires: 500+
💰 Transactions Mensuelles: 2,500,000,000 CFA
📱 Sessions Quotidiennes: 25,000+
⚡ Temps Réponse Moyen: <2 secondes
🔒 Uptime Garanti: 99.9%
🌍 Pays Couverts: 15 pays africains
📊 Satisfaction Client: 4.7/5
```

---

## 🎯 AVANTAGES CONCURRENTIELS

### ✅ **POUR LES ÉCOLES**
- **Économies:** Jusqu'à 73% vs solutions traditionnelles
- **Intégration:** Solution tout-en-un complète
- **Support:** Formation et assistance incluses
- **Évolutivité:** Croissance avec l'établissement

### ✅ **POUR LES PARENTS**
- **Transparence:** Suivi temps réel enfants
- **Communication:** Contact direct enseignants
- **Simplicité:** Interface intuitive mobile
- **Économique:** Tarifs adaptés contexte africain

### ✅ **POUR LES ENSEIGNANTS**
- **Efficacité:** Gestion classe simplifiée
- **Pédagogie:** Outils modernes enseignement
- **Communication:** Parents informés automatiquement
- **Évolution:** Formation continue incluse

---

## 📞 CONTACTS ET SUPPORT

**🏢 EDUCAFRIC - Siège Social**  
Yaoundé, Cameroun

**📧 SUPPORT TECHNIQUE**  
support@educafric.com  
Réponse garantie <24h

**💼 ÉQUIPE COMMERCIALE**  
commercial@educafric.com  
WhatsApp: +237 656 200 472

**🌐 SITE WEB**  
https://educafric.com

---

*Document généré par EDUCAFRIC Platform v4.2.3*  
*© 2025 EDUCAFRIC - Révolutionnons l'éducation en Afrique*`
    },
    {
      id: 7,
      name: 'GUIDE COMPLET EDUCAFRIC - Pour Commerciaux',
      type: 'brochure',
      category: 'brochures',
      school: 'Document formation',
      date: '2024-02-01',
      status: 'finalized',
      size: '4.2 MB',
      format: 'PDF',
      description: 'Guide explicatif complet sur EDUCAFRIC pour équipes commerciales',
      content: '🎓 QU\'EST-CE QU\'EDUCAFRIC ?\n\nEDUCAFRIC est une plateforme éducative complète spécialement conçue pour révolutionner l\'éducation en Afrique.\n\n💡 EN TERMES SIMPLES\n\nImaginez une solution qui permet à une école de :\n✅ Gérer tous ses élèves et notes sur un seul système\n✅ Envoyer des SMS automatiques aux parents\n✅ Créer des bulletins numériques en 1 clic\n✅ Suivre les présences en temps réel\n✅ Localiser les élèves avec GPS\n✅ Recevoir les paiements en ligne\n\n🌍 POURQUOI L\'AFRIQUE ?\n\nEDUCAFRIC résout les défis spécifiques des écoles africaines :\n• Gestion manuelle chronophage\n• Communication difficile avec les parents\n• Manque d\'outils numériques adaptés\n• Coûts élevés des solutions étrangères\n• Problèmes de connectivité\n\n👥 QUI UTILISE EDUCAFRIC ?\n\n🏫 ÉCOLES : Directeurs, enseignants, administration\n👨‍👩‍👧‍👦 FAMILLES : Parents et élèves\n💼 FREELANCERS : Consultants éducatifs\n🏢 ENTREPRISES : Fournisseurs d\'éducation\n\n💰 IMPACT ÉCONOMIQUE\n\nÉconomies réalisées par une école moyenne :\n• Papeterie : -80% (15,000 → 3,000 CFA/mois)\n• Communication : -60% (25,000 → 10,000 CFA/mois)\n• Gestion administrative : -50% (temps/ressources)\n• TOTAL : 73% d\'économies annuelles\n\n🚀 FONCTIONNALITÉS PRINCIPALES\n\n📊 GESTION ACADÉMIQUE\n• Notes et bulletins automatisés\n• Emplois du temps dynamiques\n• Calendrier scolaire interactif\n• Rapports de performance\n\n📱 COMMUNICATION\n• SMS intégrés (partenaires télécoms)\n• WhatsApp Business API\n• Notifications push\n• E-mails automatiques\n\n📍 GÉOLOCALISATION\n• Suivi des tablettes/téléphones\n• Zones de sécurité\n• Alertes d\'urgence\n• Contrôle parental\n\n💳 PAIEMENTS\n• Orange Money, MTN Mobile Money\n• Cartes bancaires internationales\n• Virements bancaires locaux\n• Facturation automatique\n\n🎯 ARGUMENTS DE VENTE\n\n1. SOLUTION LOCALE\n"Conçu par des Africains pour des Africains"\n\n2. PRIX COMPÉTITIF\n"10x moins cher que les solutions européennes"\n\n3. SUPPORT TOTAL\n"Formation, installation, maintenance incluse"\n\n4. PREUVES SOCIALES\n"Déjà adopté par 50+ écoles au Cameroun"\n\n5. ROI IMMÉDIAT\n"Retour sur investissement en 3 mois"\n\n📈 TARIFICATION SIMPLE\n\n👨‍👩‍👧‍👦 PARENTS : 1,000-1,500 CFA/mois\n🏫 ÉCOLES : 50,000-75,000 CFA/an\n💼 FREELANCERS : 25,000 CFA/an\n🏢 COMMERCIAUX : Commission attractive\n\n🛡️ SÉCURITÉ & CONFORMITÉ\n\n• Données hébergées en sécurité\n• Respect RGPD africain\n• Sauvegarde automatique\n• Accès contrôlé par rôles\n• Chiffrement des communications\n\n🌟 AVANTAGES CONCURRENTIELS\n\n✅ Multilingue (Français/Anglais)\n✅ Mode hors ligne disponible\n✅ Interface intuitive\n✅ Support technique local\n✅ Mises à jour gratuites\n✅ Formation personnalisée\n\n📞 COMMENT VENDRE EDUCAFRIC ?\n\n1. ÉCOUTER les besoins de l\'école\n2. DÉMONTRER avec des cas concrets\n3. CALCULER les économies réalisées\n4. RASSURER sur la simplicité\n5. PROPOSER un essai gratuit\n6. ACCOMPAGNER dans l\'implémentation\n\n🎪 DÉMONSTRATION TYPE\n\n"Regardez comme c\'est simple :"\n1. Un clic → bulletin de Pierre généré\n2. Un clic → SMS envoyé à sa maman\n3. Un clic → localisation de sa tablette\n4. Un clic → paiement enregistré\n\n"Avant, cela prenait 2 heures. Maintenant, 2 minutes !"\n\n🏆 ÉTUDES DE CAS\n\nÉCOLE BILINGUE YAOUNDÉ\n• 300 élèves → Économie 45,000 CFA/mois\n• Satisfaction parents : 95%\n• Temps administratif : -70%\n\nCOLLÈGE MODERNE DOUALA\n• 500 élèves → ROI en 2 mois\n• Communication parents : +300%\n• Notes perdues : 0 (vs 15% avant)\n\n🚨 OBJECTIONS & RÉPONSES\n\n❌ "C\'est trop cher"\n✅ "Calculons ensemble vos économies"\n\n❌ "Nos enseignants ne savent pas utiliser"\n✅ "Formation gratuite de 2 jours incluse"\n\n❌ "Nous n\'avons pas d\'internet"\n✅ "Mode hors ligne + sync automatique"\n\n❌ "Les parents n\'ont pas de smartphone"\n✅ "SMS automatiques + bulletins papier"\n\n📋 CHECKLIST VISITE ÉCOLE\n\n□ Besoins actuels identifiés\n□ Démo adaptée réalisée\n□ Calcul d\'économies présenté\n□ Références clients partagées\n□ Essai gratuit proposé\n□ Support et formation expliqués\n□ Prochaines étapes définies\n\n🎯 OBJECTIFS COMMERCIAUX\n\n• 1 école/mois = 75,000 CFA récurrent\n• Commission : 10-15% première année\n• Bonus volume : +5% après 10 écoles\n• Prime référencement : 25,000 CFA/école\n\n📱 OUTILS COMMERCIAUX\n\n• Tablette de démo pré-configurée\n• Brochures imprimées\n• Calculateur d\'économies\n• Vidéos de témoignages\n• Contrats types\n• Support technique dédié\n\n🌟 CONCLUSION\n\nEDUCAFRIC n\'est pas juste un logiciel, c\'est une révolution éducative qui :\n• Simplifie la vie des écoles\n• Rapproche les parents de l\'éducation\n• Modernise l\'Afrique par le numérique\n• Crée de la valeur pour tous\n\nVOTRE MISSION : Être l\'ambassadeur de cette transformation !\n\n📞 CONTACT ÉQUIPE\n\nSupport Commercial : commercial@educafric.com\nFormation : formation@educafric.com\nTechnique : support@educafric.com\nUrgences : +237 6XX XXX XXX\n\n---\nEDUCAFRIC - Révolutionnons l\'éducation ensemble ! 🚀'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'signed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'expired': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'contract': return <FileText className="w-4 h-4 text-blue-600" />;
      case 'brochure': return <Building2 className="w-4 h-4 text-green-600" />;
      case 'template': return <FileText className="w-4 h-4 text-purple-600" />;
      case 'legal': return <FileText className="w-4 h-4 text-red-600" />;
      case 'marketing': return <FileText className="w-4 h-4 text-orange-600" />;
      default: return <FileText className="w-4 h-4 text-gray-600" />;
    }
  };

  const filteredDocuments = (Array.isArray(documents) ? documents : []).filter(doc => {
    if (!doc) return false;
    const matchesSearch = doc?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc?.school?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc?.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [
    { key: 'all', label: t.all, count: (Array.isArray(documents) ? documents.length : 0) },
    { key: 'contracts', label: t.contracts, count: (Array.isArray(documents) ? documents : []).filter(d => d.category === 'contracts').length },
    { key: 'brochures', label: t.brochures, count: (Array.isArray(documents) ? documents : []).filter(d => d.category === 'brochures').length },
    { key: 'templates', label: t.templates, count: (Array.isArray(documents) ? documents : []).filter(d => d.category === 'templates').length },
    { key: 'legal', label: t.legal, count: (Array.isArray(documents) ? documents : []).filter(d => d.category === 'legal').length },
    { key: 'marketing', label: t.marketing, count: (Array.isArray(documents) ? documents : []).filter(d => d.category === 'marketing').length }
  ];

  // Fonctions de gestion des documents
  const handleViewDocument = (doc: any) => {
    setSelectedDocument(doc);
    setIsViewDialogOpen(true);
  };

  const handleDownloadDocument = async (doc: any) => {
    try {
      if (doc.format === 'PDF') {
        // Génération PDF avec jsPDF
        const { jsPDF } = await import('jspdf');
        const pdf = new jsPDF();
        
        // Configuration PDF
        pdf.setFontSize(16);
        pdf.text('EDUCAFRIC', 105, 20, { align: 'center' });
        pdf.setFontSize(12);
        pdf.text('Plateforme Éducative Révolutionnaire pour l\'Afrique', 105, 30, { align: 'center' });
        
        // Informations du document
        pdf.setFontSize(14);
        pdf.text(doc.name || 'Document Commercial', 20, 50);
        
        pdf.setFontSize(10);
        pdf.text(`Type: ${doc.type} | École: ${doc.school}`, 20, 60);
        pdf.text(`Statut: ${doc.status} | Date: ${doc.date}`, 20, 70);
        pdf.text(`Taille: ${doc.size}`, 20, 80);
        
        pdf.setFontSize(11);
        pdf.text(`Description: ${doc.description || ''}`, 20, 95);
        
        // Contenu du document avec retour à la ligne automatique
        if (doc.content) {
          const lines = pdf.splitTextToSize(doc.content, 170);
          pdf.text(lines, 20, 110);
        }
        
        // Pied de page
        const pageCount = (pdf as any).internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
          pdf.setPage(i);
          pdf.setFontSize(8);
          pdf.text(`Page ${i}/${pageCount} - Généré par EDUCAFRIC Platform v4.2.3`, 105, 285, { align: 'center' });
        }
        
        // Téléchargement
        pdf.save(`${doc.name || 'document'}.pdf`);
      } else {
        // Téléchargement simple pour les autres formats
        const content = `EDUCAFRIC - Document Commercial\n\nTitre: ${doc.name || ''}\nType: ${doc.type}\nÉcole: ${doc.school}\nStatut: ${doc.status}\nDate: ${doc.date}\n\nDescription:\n${doc.description}\n\nContenu:\n${doc.content || 'Contenu non disponible'}\n\n---\nGénéré par EDUCAFRIC Platform`;
        
        const blob = new Blob([content], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `${doc.name || 'document'}.${doc.format?.toLowerCase() || 'txt'}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
      
      toast({
        title: language === 'fr' ? 'Document téléchargé' : 'Document downloaded',
        description: language === 'fr' ? `${doc.name || ''} téléchargé avec succès en ${doc.format}` : `${doc.name || ''} downloaded successfully as ${doc.format}`,
      });
    } catch (error) {
      console.error('Document download error:', error);
      toast({
        title: language === 'fr' ? 'Erreur de téléchargement' : 'Download error',
        description: language === 'fr' ? 'Impossible de télécharger le document' : 'Failed to download document',
        variant: "destructive",
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
          title: doc.name,
          text: shareText,
          url: shareUrl,
        });
      } else {
        await navigator?.clipboard?.writeText(shareUrl);
        toast({
          title: language === 'fr' ? 'Lien copié' : 'Link copied',
          description: language === 'fr' ? 'Lien de partage copié' : 'Share link copied to clipboard',
        });
      }
    } catch (error) {
      toast({
        title: language === 'fr' ? 'Erreur de partage' : 'Share error',
        description: language === 'fr' ? 'Impossible de partager' : 'Failed to share document',
        variant: "destructive",
      });
    }
  };

  const handleAddDocument = () => {
    toast({
      title: language === 'fr' ? 'Fonctionnalité en développement' : 'Feature in development',
      description: language === 'fr' ? 'La création de documents sera bientôt disponible' : 'Document creation will be available soon',
    });
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
        const result = await response.json();
        toast({
          title: language === 'fr' ? 'Document supprimé' : 'Document deleted',
          description: language === 'fr' ? `${doc.name || ''} supprimé avec succès` : `${doc.name || ''} deleted successfully`,
        });
      } else {
        throw new Error('Delete failed');
      }
    } catch (error) {
      console.error('Erreur de suppression:', error);
      toast({
        title: language === 'fr' ? 'Erreur de suppression' : 'Delete error',
        description: language === 'fr' ? 'Impossible de supprimer le document' : 'Unable to delete document',
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg">
          <FileText className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{t.title || ''}</h2>
          <p className="text-gray-600">{t.subtitle}</p>
        </div>
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap gap-2">
        {(Array.isArray(categories) ? categories : []).map((category) => (
          <Button
            key={category.key}
            variant={selectedCategory === category.key ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(category.key)}
            className="flex items-center gap-2"
          >
            {category.label}
            <Badge variant="secondary" className="ml-1">
              {category.count}
            </Badge>
          </Button>
        ))}
      </div>

      {/* Search and Add */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder={t.searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e?.target?.value)}
            className="pl-10"
          />
        </div>
        <Button 
          className="flex items-center gap-2"
          onClick={handleAddDocument}
        >
          <Plus className="w-4 h-4" />
          {t.addDocument}
        </Button>
      </div>

      {/* Documents List */}
      <div className="space-y-4">
        {(Array.isArray(filteredDocuments) ? filteredDocuments : []).map((doc) => (
          <Card key={doc.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              {/* Structure responsive pour mobile */}
              <div className="space-y-4">
                {/* Informations du document */}
                <div className="flex items-start gap-4">
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {getTypeIcon(doc.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 break-words">{doc.name || ''}</h3>
                      <Badge className={getStatusColor(doc.status)}>
                        {doc.status === 'signed' ? t.signed : 
                         doc.status === 'pending' ? t.pending : 
                         doc.status === 'draft' ? t.draft : t.expired}
                      </Badge>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {doc.format}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 break-words">{doc.description || ''}</p>
                    <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Building2 className="w-3 h-3" />
                        <span className="break-words">{doc.school}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {doc.date}
                      </div>
                      <span>{doc.size}</span>
                    </div>
                  </div>
                </div>
                
                {/* Boutons d'action - responsive */}
                <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
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
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Actions Rapides - Fonctionnelles */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">
            {language === 'fr' ? 'Actions Commerciales' : 'Commercial Actions'}
          </h3>
          <p className="text-sm text-gray-600">
            {language === 'fr' ? 'Outils pratiques pour vos activités commerciales' : 'Practical tools for your commercial activities'}
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              className="flex items-center gap-2 h-auto p-4"
              onClick={() => window.open('mailto:?subject=EDUCAFRIC - Proposition Commerciale&body=Bonjour,%0D%0A%0D%0AJe vous présente EDUCAFRIC, la plateforme éducative révolutionnaire pour l\'Afrique.%0D%0A%0D%0ACordialement', '_blank')}
            >
              <FileText className="w-5 h-5 text-blue-600" />
              <div className="text-left">
                <div className="font-medium">{language === 'fr' ? 'Email Commercial' : 'Commercial Email'}</div>
                <div className="text-xs text-gray-500">{language === 'fr' ? 'Préparer proposition par email' : 'Prepare proposal via email'}</div>
              </div>
            </Button>
            <Button 
              variant="outline" 
              className="flex items-center gap-2 h-auto p-4"
              onClick={() => handleDownloadDocument(documents.find(d => d.name.includes('GUIDE COMPLET'))!)}
            >
              <Building2 className="w-5 h-5 text-green-600" />
              <div className="text-left">
                <div className="font-medium">{language === 'fr' ? 'Guide Commercial' : 'Sales Guide'}</div>
                <div className="text-xs text-gray-500">{language === 'fr' ? 'Télécharger guide complet' : 'Download complete guide'}</div>
              </div>
            </Button>
            <Button 
              variant="outline" 
              className="flex items-center gap-2 h-auto p-4"
              onClick={() => handleDownloadDocument(documents.find(d => d.type === 'brochure' && d.name.includes('Educafric 2024'))!)}
            >
              <Share className="w-5 h-5 text-purple-600" />
              <div className="text-left">
                <div className="font-medium">{language === 'fr' ? 'Brochure 2024' : 'Brochure 2024'}</div>
                <div className="text-xs text-gray-500">{language === 'fr' ? 'Matériel de présentation' : 'Presentation material'}</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {(Array.isArray(documents) ? documents : []).filter(d => d.status === 'signed').length}
            </div>
            <div className="text-sm text-gray-600">{language === 'fr' ? 'Contrats Signés' : 'Signed Contracts'}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {(Array.isArray(documents) ? documents : []).filter(d => d.status === 'pending').length}
            </div>
            <div className="text-sm text-gray-600">{language === 'fr' ? 'En Négociation' : 'In Negotiation'}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {(Array.isArray(documents) ? documents : []).filter(d => d.category === 'templates').length}
            </div>
            <div className="text-sm text-gray-600">{language === 'fr' ? 'Modèles' : 'Templates'}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {(Array.isArray(documents) ? documents.length : 0)}
            </div>
            <div className="text-sm text-gray-600">{language === 'fr' ? 'Total Documents' : 'Total Documents'}</div>
          </CardContent>
        </Card>
      </div>

      {/* Dialog de visualisation */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              {language === 'fr' ? 'Visualisation Document' : 'Document View'}: {selectedDocument?.name}
            </DialogTitle>
            <DialogDescription>
              {language === 'fr' ? 'Document créé le' : 'Document created on'} {selectedDocument && new Date(selectedDocument.date).toLocaleDateString('fr-FR')}
            </DialogDescription>
          </DialogHeader>
          
          {selectedDocument && (
            <div className="space-y-4">
              {/* Informations du document */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-semibold text-sm text-gray-700">Type</h4>
                  <Badge className={getStatusColor(selectedDocument.status)}>
                    {selectedDocument.type === 'contract' ? t.contract :
                     selectedDocument.type === 'brochure' ? t.brochure :
                     selectedDocument.type === 'proposal' ? t.proposal :
                     selectedDocument.type}
                  </Badge>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-gray-700">Statut</h4>
                  <Badge className={getStatusColor(selectedDocument.status)}>
                    {selectedDocument.status === 'signed' ? t.signed :
                     selectedDocument.status === 'pending' ? t.pending :
                     selectedDocument.status === 'draft' ? t.draft : selectedDocument.status}
                  </Badge>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-gray-700">École</h4>
                  <p className="text-sm">{selectedDocument.school}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-gray-700">Format</h4>
                  <p className="text-sm">{selectedDocument.format} - {selectedDocument.size}</p>
                </div>
              </div>

              {/* Contenu du document */}
              <div>
                <h4 className="font-semibold text-sm text-gray-700 mb-2">
                  {language === 'fr' ? 'Contenu du Document' : 'Document Content'}
                </h4>
                <div className="border rounded-lg p-4 bg-white max-h-96 overflow-y-auto">
                  <div className="prose prose-sm max-w-none">
                    {(selectedDocument.content || selectedDocument.description || '').split('\n').map((paragraph: string, index: number) => (
                      <p key={index} className="mb-2 whitespace-pre-wrap">{paragraph}</p>
                    ))}
                  </div>
                </div>
              </div>
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