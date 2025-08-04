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
Simon ABANDA                       Directeur Académique
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
      name: 'Modele Contrat Partenariat Établissement EDUCAFRIC 2025',
      type: 'template',
      category: 'templates',
      school: 'Template general',
      date: '2025-02-01',
      status: 'finalized',
      size: '1.5 MB',
      format: 'PDF',
      description: 'Modèle de contrat de partenariat éducatif pour établissements scolaires avec approche collaborative',
      content: `EDUCAFRIC - CONTRAT DE PARTENARIAT ÉDUCATIF 2025
ACCORD DE COLLABORATION PÉDAGOGIQUE ET TECHNOLOGIQUE
Version Partenariat Établissements - Février 2025

=== PRÉAMBULE ===

NATURE DU PARTENARIAT
Le présent accord établit un partenariat stratégique entre EDUCAFRIC et l'établissement scolaire partenaire dans le cadre de la transformation numérique de l'éducation en Afrique.

PARTENAIRES

EDUCAFRIC - PARTENAIRE TECHNOLOGIQUE:
Entité juridique: AFRO METAVERSE MARKETING SARL
Siège social: Yaoundé, Cameroun
Secteur: Innovation éducative et technologies numériques
Email: partenariats@educafric.com
Téléphone: +237 XXX XXX XXX
Représentant: [DIRECTEUR PARTENARIATS], Directeur des Partenariats Éducatifs

ÉTABLISSEMENT PARTENAIRE:
Nom de l'établissement: [NOM DE L'ÉCOLE PARTENAIRE]
Statut: [Public/Privé/Conventionné]
Adresse: [ADRESSE COMPLÈTE]
Directeur/Directrice: [NOM DU DIRECTEUR]
Contact: [EMAIL ET TÉLÉPHONE]
Effectifs: [NOMBRE D'ÉLÈVES] élèves, [NOMBRE] enseignants

VISION PARTENARIALE
Ensemble, nous nous engageons à révolutionner l'expérience éducative africaine en combinant l'excellence pédagogique traditionnelle avec les innovations technologiques modernes.

OBJECTIFS STRATÉGIQUES COMMUNS
✓ Amélioration de la qualité éducative par le numérique
✓ Renforcement de la communication école-famille-communauté
✓ Développement des compétences numériques du personnel
✓ Optimisation de la gestion administrative et pédagogique
✓ Promotion de l'innovation éducative en Afrique
✓ Création d'un modèle de référence pour d'autres établissements

=== ARTICLE 1 - CADRE DU PARTENARIAT ===

1.1 MISSION ÉDUCATIVE COMMUNE
Le partenariat vise à créer un écosystème éducatif numérique exemplaire qui servira de modèle pour la transformation digitale des établissements africains.

1.2 DURÉE DU PARTENARIAT
• Partenariat initial: 3 ans renouvelables
• Phase pilote: 6 mois d'accompagnement renforcé
• Évaluation semestrielle des résultats
• Possibilité d'extension selon bilan de performance

1.3 TERRITOIRE DE COLLABORATION
• Implémentation exclusive dans l'établissement partenaire
• Possibilité d'extension aux établissements associés
• Participation aux réseaux d'écoles EDUCAFRIC
• Rayonnement régional comme école de référence

=== ARTICLE 2 - ENGAGEMENTS MUTUELS ===

2.1 ENGAGEMENTS D'EDUCAFRIC

INNOVATION TECHNOLOGIQUE:
• Mise à disposition de la plateforme EDUCAFRIC complète
• Accès prioritaire aux nouvelles fonctionnalités
• Personnalisation selon les besoins spécifiques
• Interface bilingue français/anglais adaptée

ACCOMPAGNEMENT PÉDAGOGIQUE:
• Formation approfondie de l'équipe dirigeante
• Coaching personnalisé des enseignants
• Ateliers mensuels d'innovation pédagogique
• Certification EDUCAFRIC pour le personnel

SUPPORT TECHNIQUE PRIVILÉGIÉ:
• Ligne directe support partenaires prioritaires
• Intervention sur site si nécessaire
• Maintenance préventive trimestrielle
• Garantie uptime 99,7% avec compensation

2.2 ENGAGEMENTS DE L'ÉTABLISSEMENT PARTENAIRE

LEADERSHIP PÉDAGOGIQUE:
• Nomination d'un coordinateur digital dédié
• Participation active aux formations proposées
• Feedback constructif pour amélioration continue
• Partage d'expériences avec réseau partenaires

COMMUNICATION ET PROMOTION:
• Autorisation d'utilisation comme référence client
• Participation aux événements EDUCAFRIC
• Témoignages et études de cas
• Accueil de délégations d'autres établissements

=== ARTICLE 3 - CONDITIONS FINANCIÈRES PARTENARIALES ===

3.1 MODÈLE ÉCONOMIQUE COLLABORATIF
Le partenariat fonctionne sur un modèle gagnant-gagnant avec des conditions préférentielles reflétant l'engagement mutuel dans l'innovation éducative africaine.

3.2 TARIFICATION PARTENAIRE PRIVILÉGIÉ
• Écoles publiques/conventionnées: 35.000 CFA/mois (350.000 CFA/an)
• Écoles privées: 65.000 CFA/mois (650.000 CFA/an)
• Établissements d'excellence: 95.000 CFA/mois (950.000 CFA/an)
• Réduction partenaire stratégique: -25% sur tarifs standards

3.3 MODALITÉS DE PAIEMENT FLEXIBLES
• Paiement semestriel avec 10% de réduction
• Paiement annual avec 20% de réduction
• Possibilité d'échelonnement personnalisé
• Orange Money, MTN Mobile Money, virements bancaires
• Période d'évaluation: 60 jours sans engagement

3.4 INVESTISSEMENTS PARTAGÉS
EDUCAFRIC investit dans:
• Formation approfondie équipe (valeur 500.000 CFA)
• Personnalisation interface aux couleurs de l'école
• Développement fonctionnalités spécifiques demandées
• Support marketing et communication

L'ÉTABLISSEMENT investit dans:
• Infrastructure réseau minimum requis
• Équipement basique (tablettes/ordinateurs selon besoins)
• Temps formation personnel
• Promotion du partenariat dans son réseau

=== ARTICLE 4 - PROPRIÉTÉ INTELLECTUELLE ET INNOVATION ===

4.1 DROITS ET PROPRIÉTÉS
• EDUCAFRIC: Plateforme, code source, algorithmes, marque
• ÉTABLISSEMENT: Données scolaires exclusives + méthodes pédagogiques
• COMMUN: Innovations développées ensemble, retours d'expérience

4.2 CONFIDENTIALITÉ RENFORCÉE
• Protection données élèves/parents selon standards internationaux
• Clause de non-concurrence mutuelle sur le territoire
• Partage sécurisé des bonnes pratiques dans le réseau EDUCAFRIC

=== ARTICLE 5 - GOUVERNANCE ET SUIVI DU PARTENARIAT ===

5.1 COMITÉ DE PILOTAGE
Composition: 2 représentants EDUCAFRIC + 2 représentants établissement
Réunions: Trimestrielles + réunions extraordinaires si besoin
Missions: Suivi performance, ajustements, planification évolutions

5.2 INDICATEURS DE PERFORMANCE PARTAGÉS
• Taux d'adoption par les enseignants: objectif 90%
• Satisfaction parents (enquêtes): objectif 85%
• Amélioration résultats scolaires: suivi sur 2 ans
• Réduction temps administratif: objectif -40%

=== ARTICLE 6 - ÉVOLUTION ET RENOUVELLEMENT DU PARTENARIAT ===

6.1 MÉCANISMES D'ÉVOLUTION
• Révision annuelle des termes selon performances
• Possibilité d'upgrade vers statut "École Ambassadrice EDUCAFRIC"
• Extension automatique si objectifs atteints à 80%
• Négociation de nouvelles modalités selon besoins émergents

6.2 CONDITIONS DE SORTIE AMIABLE
• Préavis de 90 jours minimum pour fin de partenariat
• Accompagnement migration données garantie 6 mois
• Possibilité de reprendre le partenariat dans les 24 mois
• Engagement de confidentialité permanent sur les innovations communes

=== ARTICLE 7 - FEUILLE DE ROUTE D'IMPLÉMENTATION ===

PHASE 1 - PRÉPARATION (Mois 1-2):
• Audit infrastructure existante
• Formation équipe dirigeante (40h)
• Paramétrage personnalisé plateforme
• Migration données existantes

PHASE 2 - DÉPLOIEMENT (Mois 3-4):
• Formation enseignants par vagues (80h total)
• Mise en service progressive par niveaux
• Accompagnement quotidien sur site
• Tests et ajustements continus

PHASE 3 - STABILISATION (Mois 5-6):
• Formation parents et communication
• Optimisation processus
• Première évaluation partenariale
• Planification développements futurs

=== DISPOSITIONS FINALES ===

DROIT APPLICABLE:
Législation camerounaise - Tribunaux de Yaoundé compétents
Langue officielle du contrat: Français
Médiation préalable obligatoire en cas de différend

ANNEXES TECHNIQUES:
• Annexe A: Spécifications techniques détaillées
• Annexe B: Plan de formation personnalisé
• Annexe C: Indicateurs de performance et reporting
• Annexe D: Charte qualité du partenariat

=== SIGNATURES ===

POUR EDUCAFRIC                           POUR L'ÉTABLISSEMENT PARTENAIRE
AFRO METAVERSE MARKETING SARL

_________________________              _________________________
[NOM DU REPRÉSENTANT]                   [NOM DU DIRECTEUR]
Directeur des Partenariats              Directeur de l'établissement
Date: _______________                   Date: _______________
Signature et cachet                     Signature et cachet


Fait en deux exemplaires à ____________, le _______________

---
Document généré par EDUCAFRIC Platform v4.2.3
Contrat de Partenariat Éducatif - www.educafric.com
"Ensemble, révolutionnons l'éducation africaine"`
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
      type: 'guide',
      category: 'guides',
      school: 'Document formation',
      date: '2025-02-01',
      status: 'finalized',
      size: '2.8 MB',
      format: 'PDF',
      description: 'Guide complet non-technique EDUCAFRIC avec informations generales sur la plateforme',
      content: `GUIDE COMPLET EDUCAFRIC
Plateforme Educative Numerique Africaine - Version 2025

PAGE 1 - PRESENTATION GENERALE

QU'EST-CE QU'EDUCAFRIC ?

EDUCAFRIC est la solution educative complete pensee pour l'Afrique. Notre plateforme transforme la gestion scolaire traditionnelle en experience numerique moderne, accessible et securisee.

POUR QUI ?
- Ecoles publiques et privees
- Parents d'eleves 
- Enseignants et repetiteurs
- Eleves de tous niveaux

FONCTIONNALITES PRINCIPALES

GESTION SCOLAIRE COMPLETE
- Inscription et profils eleves
- Emplois du temps interactifs
- Presence electronique quotidienne
- Notes et bulletins automatises
- Communication directe parents-enseignants

COMMUNICATION MODERNE
- Messages instantanes ecole-famille
- Notifications SMS internationales
- Alertes automatiques (absences, notes, evenements)
- Calendrier partage des activites
- Support francais et anglais

ACCES MOBILE OPTIMISE
- Applications iPhone et Android
- Consultation hors ligne
- Notifications temps reel
- Interface simple et intuitive
- Securite renforcee

SUIVI SECURISE
- Geolocalisation optionnelle des eleves
- Zones de securite personnalisables
- Alertes d'entree et sortie
- Suivi trajets domicile-ecole
- Notifications parents immediates

TARIFS ACCESSIBLES AFRIQUE

ECOLES PUBLIQUES
25.000 CFA par mois
- Jusqu'a 200 eleves inclus
- Toutes fonctionnalites de base
- Support technique inclus
- Formation equipe 8 heures

ECOLES PRIVEES  
75.000 CFA par mois
- Jusqu'a 500 eleves inclus
- Fonctionnalites avancees
- Geolocalisation complete
- Support prioritaire 24/7
- Formation etendue 40 heures

PARENTS
1.000 a 1.500 CFA par mois
- Suivi complet enfant
- Communications illimitees
- Acces mobile total
- Historique notes et absences

REPETITEURS/ENSEIGNANTS PRIVES
12.500 CFA par semestre
- Gestion jusqu'a 50 eleves
- Outils de suivi personnalise
- Communication parents directe
- Facturation automatisee

METHODES DE PAIEMENT

SOLUTIONS LOCALES AFRICAINES
- Orange Money (Cameroun, Cote d'Ivoire, Mali, Senegal)
- MTN Mobile Money (Cameroun, Ghana, Ouganda, Rwanda)
- Moov Money (Benin, Burkina Faso, Togo)
- Wave (Senegal, Cote d'Ivoire)

PAIEMENTS INTERNATIONAUX
- Cartes de credit Visa/Mastercard
- Virements bancaires internationaux
- PayPal pour clients diaspora
- Western Union pour transferts

COMMUNICATION INTERNATIONALE
- SMS vers plus de 190 pays
- Tarifs optimises Afrique
- Notifications multilingues
- Support WhatsApp Business

PAGE 2 - AVANTAGES ET MISE EN PLACE

POURQUOI CHOISIR EDUCAFRIC ?

ECONOMIES REELLES
- Reduction couts administratifs 70%
- Economie papier et impression 80%
- Gain temps gestion 60%
- ROI positif des 6 premiers mois

AVANTAGES TECHNOLOGIQUES
- Pas d'installation logiciel
- Acces internet simple
- Sauvegardes automatiques
- Mises a jour gratuites
- Securite maximale

SPECIFICITES AFRICAINES
- Adapte aux programmes camerounais
- Systeme SIL a Terminale
- Calendrier scolaire local
- Fetes et conges africains
- Support clientele francophone

FORMATION ET ACCOMPAGNEMENT

MISE EN PLACE RAPIDE
Semaine 1: Configuration plateforme
Semaine 2: Formation utilisateurs  
Semaine 3: Tests et ajustements
Semaine 4: Lancement officiel

FORMATION COMPLETE INCLUSE
- Formation directeurs/administrateurs
- Formation corps enseignant
- Formation personnel secretariat
- Formation utilisation parents
- Documentation complete francais

SUPPORT PERMANENT
- Assistance technique 24h/7j
- Hotline telephone francais
- Support email prioritaire
- Interventions a distance
- Maintenance preventive

RESULTATS CLIENTS

TEMOIGNAGES ECOLES
"Nos bulletins sont maintenant prets en 2 clics au lieu de 2 semaines"
- Lycee Bilingue de Yaounde

"Les parents sont enfin informes en temps reel"  
- College Prive Saint-Joseph Douala

"Fini les registres papier, tout est numerique et securise"
- Ecole Publique de Bafoussam

STATISTIQUES SATISFACTION
- 95% ecoles satisfaites premiere annee
- 87% renouvellement contrats
- 92% parents recommandent solution
- 78% reduction appels telephoniques

DEMONSTRATION ET CONTACT

ESSAI GRATUIT 30 JOURS
- Acces complet toutes fonctionnalites
- Donnees test realistiques
- Formation initiale gratuite
- Support complet inclus

ENVIRONMENT DE DEMONSTRATION
- Interface complete disponible
- Donnees ecoles africaines reelles
- Scenarios d'usage typiques
- Tests toutes fonctionnalites

CONTACTS SUPPORT

Support Technique
Email: support@educafric.com
Telephone: +237 XXX XXX XXX
Horaires: Lundi-Samedi 7h-20h

Formation Utilisateurs  
Email: formation@educafric.com
Telephone: +237 XXX XXX XXX
Disponible: Sur rendez-vous

NEXT STEPS - DEMARRER AVEC EDUCAFRIC

1. EVALUATION BESOINS
- Analyse situation actuelle ecole
- Definition objectifs numeriques
- Evaluation nombre utilisateurs
- Choix plan adapte

2. DEMONSTRATION PERSONNALISEE
- Presentation fonctionnalites cles
- Tests scenarios reel ecole
- Questions/reponses detaillees
- Devis personnalise gratuit

3. SIGNATURE ET LANCEMENT
- Contrat adaptation besoins
- Planning implementation 4 semaines
- Formation equipes incluse
- Go-live accompagne

EDUCAFRIC - REVOLUTIONNER L'EDUCATION EN AFRIQUE
www.educafric.com - Version Guide 2025`
    },
    {
      id: 8,
      name: 'CONTRAT PARTENARIAT ETABLISSEMENTS FREELANCERS 2025',
      type: 'contract',
      category: 'contracts',
      school: 'Document officiel',
      date: '2025-01-30',
      status: 'finalized',
      size: '4.5 MB',
      format: 'PDF',
      description: 'Contrat officiel EDUCAFRIC pour etablissements scolaires et freelancers educatifs',
      content: `EDUCAFRIC - CONTRAT DE PARTENARIAT ETABLISSEMENTS SCOLAIRES ET FREELANCERS 2025

Document Information
- Date de creation: 30 janvier 2025
- Version: 3.0 (Mise a jour Educafric)
- Validite: Du 1er janvier 2025 au 31 decembre 2025  
- Destinataires: Directeurs d'Ecole, Freelancers Educatifs, Equipe Juridique
- Objectif: Contrat officiel de partenariat Educafric pour etablissements et repetiteurs

PREAMBULE

Le present contrat definit les modalites de partenariat entre EDUCAFRIC (exploite par AFRO METAVERSE MARKETING SARL) et les etablissements scolaires ainsi que les freelancers educatifs (repetiteurs) pour l'utilisation de la plateforme numerique educative africaine.

Parties Contractantes:
- EDUCAFRIC : Plateforme educative technologique
- ETABLISSEMENTS SCOLAIRES : Ecoles publiques, privees, confessionnelles
- FREELANCERS EDUCATIFS : Repetiteurs independants, centres de formation

Mission Educafric:
Democratiser l'acces aux technologies educatives en Afrique et moderniser l'ecosysteme educatif par l'innovation numerique.

ARTICLE 1 - OBJET DU CONTRAT

1.1 Services Fournis par Educafric

Plateforme de Gestion Scolaire Complete
- Gestion des eleves: Inscription, profils, historique academique
- Gestion des enseignants: Profils, matieres, planning, absences
- Classes et niveaux: Organisation SIL a Terminale (systeme camerounais)
- Emploi du temps numerique: Creation et consultation interactive
- Presences electroniques: Appel numerique quotidien
- Notes et evaluations: Saisie, calcul moyennes automatique

Systeme de Bulletins Numeriques
- Bulletins digitaux professionnels: Templates officiels camerounais
- Calculs automatiques: Moyennes, rangs, appreciations
- Export PDF: Bulletins formates pour impression
- Distribution automatique: Envoi parents par email/SMS
- Historique complet: Conservation multi-annees securisee

Communication Ecole-Famille Integree
- Messages directs: Communication enseignants vers parents
- Notifications automatisees: Absences, notes, evenements
- Annonces ecole: Diffusion informations importantes
- Calendrier evenements: Reunions, examens, activites
- Support multilingue: Francais et anglais natif

Acces Mobile et Technologies Avancees
- Applications natives: iOS et Android optimisees
- Mode hors ligne: Consultation sans internet
- Notifications push: Alertes temps reel
- Geolocalisation: Suivi securise eleves (optionnel)
- WhatsApp Business: Communication automatisee

Rapports et Analytics
- Tableaux de bord: Vue d'ensemble performance
- Statistiques presences: Suivi assiduite detaille
- Analyses academiques: Performance par matiere/niveau
- Intelligence artificielle: Predictions et recommandations
- Rapports automatises: Syntheses mensuelles directeur

ARTICLE 2 - TARIFICATION ET ABONNEMENTS

2.1 Plans Etablissements Scolaires

Plan Ecole Publique
Prix: 25.000 CFA/mois (250.000 CFA/an)
Eleves inclus: Jusqu'a 200 eleves
Economie annuelle: 50.000 CFA (2 mois gratuits)

Fonctionnalites Incluses:
- Gestion complete eleves/enseignants
- Bulletins digitaux illimites
- Communication parents automatisee
- Emploi du temps interactif
- Presences electroniques
- Support technique dedie
- Notifications SMS (1000/mois)
- Formation equipe (8h incluses)

Tarification Progressive:
- 0-200 eleves: 25.000 CFA/mois
- 201-500 eleves: +100 CFA/eleve/mois
- 501-1000 eleves: +75 CFA/eleve/mois
- +1000 eleves: Tarif negocie

Plan Ecole Privee
Prix: 75.000 CFA/mois (750.000 CFA/an)
Eleves inclus: Jusqu'a 500 eleves
Economie annuelle: 150.000 CFA (2 mois gratuits)

Tout du Plan Public +:
- Geolocalisation securite eleves
- Systeme paiement integre
- Module comptabilite avance
- Branding ecole personnalise
- Application mobile ecole
- Analytics IA predictive
- Support prioritaire 24/7
- Formation equipe (40h incluses)

Plan Ecole Enterprise
Prix: 150.000 CFA/mois (1.500.000 CFA/an)
Eleves: Illimites
Solution complete sur mesure

Solution Premium:
- Toutes fonctionnalites incluses
- Multi-campus sans limite
- Personnalisation complete
- Integrations sur mesure
- Infrastructure dediee
- Equipe support dediee

2.2 Plans Freelancers/Repetiteurs

Plan Freelancer Standard
Prix: 12.500 CFA/semestre (25.000 CFA/an)
Eleves: Jusqu'a 50 eleves maximum

Fonctionnalites incluses:
- Gestion eleves personnelle
- Planning cours particuliers
- Suivi progression individuelle
- Communication parents directe
- Facturation automatisee
- Rapports de performance
- Support technique email

Plan Freelancer Pro
Prix: 20.000 CFA/semestre (40.000 CFA/an)
Eleves: Jusqu'a 150 eleves maximum

Tout du Standard +:
- Geolocalisation cours (optionnel)
- Multi-matieres illimitees
- Templates cours avances
- Analytics performance detaillees
- Branding personnel
- Support telephonique prioritaire

2.3 Modalites de Paiement

Methodes de Paiement Acceptees:
- Orange Money (Cameroun)
- MTN Mobile Money (Cameroun)
- Stripe (cartes internationales)
- Virement bancaire (grandes ecoles)
- Especes (agents locaux)

Conditions de Paiement:
- Paiement mensuel: Debite automatiquement le 1er du mois
- Paiement annuel: 15% de reduction appliquee
- Periode d'essai: 30 jours gratuits pour toutes les formules
- Resiliation: Preavis de 30 jours requis

ARTICLE 3 - OBLIGATIONS ET RESPONSABILITES

3.1 Obligations d'Educafric

Support Technique:
- Support technique 24/7 en francais
- Temps de reponse: < 4 heures ouvrables
- Formation initiale gratuite incluse
- Mises a jour automatiques gratuites
- Sauvegarde quotidienne des donnees
- Garantie uptime 99.5%

Securite et Confidentialite:
- Chiffrement SSL/TLS obligatoire
- Conformite GDPR et lois camerounaises
- Protection donnees personnelles eleves
- Acces securise par roles
- Audit securite annuel
- Plan de reprise d'activite

3.2 Obligations du Partenaire

Etablissements Scolaires:
- Designer 2 administrateurs maximum
- Former le personnel a l'utilisation
- Respecter les conditions d'utilisation
- Paiement des frais dans les delais
- Communication changements importants
- Participation aux mises a jour critiques

Freelancers:
- Utilisation ethique de la plateforme
- Respect de la propriete intellectuelle
- Non-revente des acces
- Mise a jour informations personnelles
- Respect des horaires de maintenance

ARTICLE 4 - FORMATION ET ACCOMPAGNEMENT

4.1 Formation Initiale

Pour les Etablissements:
- Formation directeur/administrateurs: 8 heures
- Formation enseignants: 16 heures
- Formation secretariat: 4 heures
- Support documentation complete
- Webinaires de perfectionnement mensuels

Pour les Freelancers:
- Session individuelle: 2 heures
- Documentation pas-a-pas
- Tutoriels video francais
- Groupe WhatsApp support

4.2 Support Continu

Canaux de Communication:
- Email: support@educafric.com
- WhatsApp: +237 XXX XXX XXX
- Telephone: +237 XXX XXX XXX
- Chat en ligne: www.educafric.com

Horaires de Support:
- Lundi-Vendredi: 7h00-19h00 (GMT+1)
- Samedi: 8h00-16h00 (GMT+1)
- Urgences 24/7: numero dedie

ARTICLE 5 - DONNEES ET PROPRIETE INTELLECTUELLE

5.1 Propriete des Donnees

Donnees Scolaires:
- Propriete exclusive de l'etablissement
- Droit d'exportation complete
- Suppression garantie a la resiliation
- Acces lecture seule pour maintenance

Donnees Educafric:
- Code source: propriete Educafric
- Base de donnees plateforme: propriete Educafric
- Algorithmes IA: propriete Educafric
- Templates: licence d'utilisation accordee

5.2 Confidentialite

Engagements Mutuels:
- Non-divulgation informations sensibles
- Protection donnees personnelles eleves/parents
- Acces restreint personnel autorise uniquement
- Signalement incidents securite obligatoire

ARTICLE 6 - DUREE ET RESILIATION

6.1 Duree du Contrat

Periode Contractuelle:
- Duree initiale: 12 mois renouvelables
- Renouvellement: Automatique sauf denonciation
- Preavis resiliation: 30 jours minimum
- Periode d'essai: 30 jours gratuits

6.2 Conditions de Resiliation

Resiliation par Educafric:
- Non-paiement: apres 30 jours de retard
- Violation conditions d'utilisation
- Utilisation frauduleuse
- Preavis: 15 jours minimum

Resiliation par le Partenaire:
- Preavis ecrit: 30 jours minimum
- Motif non requis
- Remboursement: au prorata temporis
- Export donnees: garanti 90 jours

ARTICLE 7 - RESPONSABILITES ET LIMITES

7.1 Limitation de Responsabilite

Exclusions:
- Dommages indirects ou consecutifs
- Perte de benefices
- Interruption d'activite
- Force majeure (pannes electriques, etc.)

Plafond de Responsabilite:
- Maximum: montant des frais annuels payes
- Assurance responsabilite civile professionnelle
- Couverture: 500.000.000 CFA

7.2 Garanties de Service

Engagements Qualite:
- Disponibilite plateforme: 99.5% minimum
- Temps de reponse support: < 4h ouvrables
- Resolution incidents: < 24h ouvrables
- Maintenance preventive: annoncee 48h avant

ARTICLE 8 - DISPOSITIONS FINALES

8.1 Droit Applicable

Juridiction:
- Droit camerounais applicable
- Tribunaux de Yaounde competents
- Langue du contrat: francais
- Arbitrage possible si accord mutuel

8.2 Modifications

Evolutions Contractuelles:
- Modifications par avenant ecrit uniquement
- Notification changements: 30 jours minimum
- Droit de resiliation si refus modifications majeures

8.3 Integralite

Clause de Totalite:
- Le present contrat annule tous accords anterieurs
- Conditions generales consultables sur www.educafric.com
- Versions francaise et anglaise: version francaise prevaut

CONTACTS ET SIGNATURES

EDUCAFRIC
AFRO METAVERSE MARKETING SARL
Adresse: Yaounde, Cameroun
Email: contact@educafric.com
Tel: +237 XXX XXX XXX

Directeur General: Simon ABANDA
Date: ________________
Signature: ________________

PARTENAIRE
Ecole/Freelancer: ________________
Directeur/Responsable: ________________
Date: ________________
Signature: ________________

---
Document genere par EDUCAFRIC Platform v4.2.3
www.educafric.com - Revolutionner l'education en Afrique`
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
      content: `PRÉSENTATION DASHBOARDS EDUCAFRIC 2025
Guide Complet des Interfaces Utilisateurs

=== ARCHITECTURE UTILISATEURS ===

EDUCAFRIC propose 5 profils principaux d'utilisateurs, chacun avec son dashboard personnalisé et ses modules spécifiques adaptés à ses besoins éducatifs.

=== 1. DASHBOARD ENSEIGNANT ===

MODULES DISPONIBLES:

✓ MES CLASSES
Fonction: Permet de gérer toutes les classes assignées à l'enseignant
Usage: Visualisation des élèves, effectifs, répartition par matière
Avantage: Suivi personnalisé de chaque classe

✓ SAISIE DES NOTES
Fonction: Interface pour enregistrer les évaluations et examens
Usage: Saisie rapide des notes par matière et par période
Avantage: Calculs automatiques des moyennes et statistiques

✓ EMPLOI DU TEMPS
Fonction: Consultation et gestion du planning personnel
Usage: Visualisation des créneaux d'enseignement, salles assignées
Avantage: Organisation optimale du temps de travail

✓ GESTION DEVOIRS
Fonction: Création et suivi des devoirs donnés aux élèves
Usage: Attribution de devoirs, fixation des échéances, corrections
Avantage: Suivi pédagogique complet des travaux élèves

✓ COMMUNICATION PARENTS
Fonction: Interface directe pour échanger avec les familles
Usage: Messages individuels, notifications de notes, alertes
Avantage: Renforcement du lien école-famille

✓ RAPPORTS DE CLASSE
Fonction: Génération de statistiques et analyses de performance
Usage: Rapports de notes, évolution des élèves, comparatifs
Avantage: Outils d'aide à la décision pédagogique

✓ RESSOURCES PÉDAGOGIQUES
Fonction: Bibliothèque de contenus éducatifs partagés
Usage: Accès aux supports de cours, exercices, évaluations
Avantage: Mutualisation des ressources entre enseignants

=== 2. DASHBOARD DIRECTEUR D'ÉCOLE ===

MODULES DISPONIBLES:

✓ GESTION ÉTABLISSEMENT
Fonction: Administration complète de l'établissement scolaire
Usage: Supervision générale, paramètres école, organisation pédagogique
Avantage: Contrôle centralisé de toutes les activités scolaires

✓ GESTION DU PERSONNEL
Fonction: Administration des enseignants et personnel administratif
Usage: Affectations, emplois du temps, évaluations de performance
Avantage: Optimisation des ressources humaines de l'établissement

✓ SUIVI ACADÉMIQUE GLOBAL
Fonction: Vue d'ensemble des résultats scolaires par classe et matière
Usage: Analyses statistiques, comparatifs de performance, tendances
Avantage: Pilotage stratégique de la qualité éducative

✓ GESTION FINANCIÈRE
Fonction: Administration budgétaire et suivi des paiements
Usage: Frais de scolarité, salaires, dépenses, rapports financiers
Avantage: Maîtrise complète de la santé financière de l'école

✓ COMMUNICATION INSTITUTIONNELLE
Fonction: Interface avec parents, autorités éducatives et partenaires
Usage: Messages officiels, rapports périodiques, communication de crise
Avantage: Représentation efficace de l'établissement

✓ TABLEAUX DE BORD DIRECTEUR
Fonction: Indicateurs clés de performance (KPI) en temps réel
Usage: Effectifs, taux de réussite, assiduité, satisfaction parents
Avantage: Prise de décision basée sur des données précises

✓ PLANIFICATION STRATÉGIQUE
Fonction: Outils de développement et projets d'établissement
Usage: Plans annuels, objectifs pédagogiques, projets d'amélioration
Avantage: Vision à long terme et développement durable de l'école

✓ GESTION DES INSCRIPTIONS
Fonction: Administration des admissions et réinscriptions
Usage: Processus d'inscription, validation dossiers, listes d'attente
Avantage: Optimisation du processus administratif d'admission

✓ SUPERVISION PÉDAGOGIQUE
Fonction: Suivi de la qualité de l'enseignement et des programmes
Usage: Évaluations enseignants, respect des programmes, innovations
Avantage: Garantie de l'excellence pédagogique de l'établissement

=== 3. DASHBOARD ÉLÈVE ===

MODULES DISPONIBLES:

✓ MES NOTES
Fonction: Consultation de toutes les évaluations personnelles
Usage: Visualisation des notes par matière, moyennes, évolution
Avantage: Suivi autonome de la progression scolaire

✓ EMPLOI DU TEMPS
Fonction: Planning personnel des cours et activités
Usage: Consultation des créneaux, salles, changements éventuels
Avantage: Organisation personnelle et anticipation

✓ DEVOIRS À RENDRE
Fonction: Liste des travaux à effectuer avec échéances
Usage: Suivi des devoirs assignés, statuts de rendu
Avantage: Gestion efficace des obligations scolaires

✓ BULLETINS NUMÉRIQUES
Fonction: Accès aux bulletins officiels dématérialisés
Usage: Consultation et téléchargement des bulletins trimestriels
Avantage: Accès immédiat aux résultats officiels

✓ COMMUNICATION
Fonction: Messages avec enseignants et administration
Usage: Reception d'informations, alertes, rappels importants
Avantage: Connexion directe avec l'équipe éducative

✓ RESSOURCES D'APPRENTISSAGE
Fonction: Accès aux supports de cours et exercices
Usage: Consultation de documents pédagogiques partagés
Avantage: Révisions et approfondissements autonomes

✓ CALENDRIER SCOLAIRE
Fonction: Vue d'ensemble des événements et dates importantes
Usage: Consultation des examens, vacances, événements école
Avantage: Planification et anticipation des périodes clés

=== 4. DASHBOARD PARENT ===

MODULES DISPONIBLES:

✓ SUIVI ENFANTS
Fonction: Tableau de bord centralisé pour tous les enfants scolarisés
Usage: Vue d'ensemble des résultats, comportement, assiduité
Avantage: Monitoring complet de la scolarité familiale

✓ CONSULTATION NOTES
Fonction: Accès en temps réel aux évaluations des enfants
Usage: Visualisation détaillée des notes par matière et période
Avantage: Réactivité immédiate sur les résultats scolaires

✓ COMMUNICATION ÉCOLE
Fonction: Canal direct avec enseignants et administration
Usage: Échanges sur la progression, comportement, besoins spéciaux
Avantage: Partenariat éducatif renforcé

✓ PAIEMENTS EN LIGNE
Fonction: Gestion dématérialisée des frais de scolarité
Usage: Paiements sécurisés MTN/Orange Money, suivi des échéances
Avantage: Simplicité et traçabilité des transactions

✓ GÉOLOCALISATION ENFANTS
Fonction: Suivi de position en temps réel des enfants (optionnel)
Usage: Monitoring sécurisé des trajets domicile-école
Avantage: Sérénité et sécurité familiale

✓ NOTIFICATIONS IMPORTANTES
Fonction: Réception d'alertes personnalisées par SMS/WhatsApp
Usage: Alertes absence, retard, urgences, événements
Avantage: Réactivité immédiate aux situations importantes

✓ CALENDRIER FAMILIAL
Fonction: Planning intégré des événements scolaires familiaux
Usage: Réunions parents, conseils de classe, événements
Avantage: Organisation familiale optimisée

=== 5. DASHBOARD FREELANCER ===

MODULES DISPONIBLES:

✓ PROJETS ÉDUCATIFS
Fonction: Gestion de portefeuille de missions dans les écoles
Usage: Suivi des contrats, échéances, livrables pédagogiques
Avantage: Organisation professionnelle des interventions

✓ CRÉATION DE CONTENU
Fonction: Outils de développement de ressources éducatives
Usage: Conception de cours, exercices, supports multimédia
Avantage: Professionnalisation de l'offre pédagogique

✓ COLLABORATION ÉCOLES
Fonction: Interface de partenariat avec les établissements
Usage: Négociation de missions, planning d'interventions
Avantage: Extension du réseau professionnel éducatif

✓ FACTURATION SERVICES
Fonction: Gestion commerciale et comptable des prestations
Usage: Émission de factures, suivi des paiements
Avantage: Simplicité administrative et financière

✓ PORTFOLIO PROFESSIONNEL
Fonction: Vitrine des compétences et réalisations
Usage: Présentation d'expertise, témoignages, références
Avantage: Développement de la réputation professionnelle

✓ FORMATION CONTINUE
Fonction: Accès aux ressources de développement professionnel
Usage: Webinaires, formations, mise à jour pédagogique
Avantage: Maintien de l'excellence et de la compétitivité

✓ RÉSEAU ÉDUCATIF
Fonction: Communauté de freelancers et échanges professionnels
Usage: Partage d'expériences, collaborations, recommandations
Avantage: Enrichissement mutuel et opportunités business

=== AVANTAGES TRANSVERSAUX ===

TOUS LES DASHBOARDS BÉNÉFICIENT DE:
• Interface bilingue français/anglais
• Optimisation mobile complète
• Notifications temps réel
• Sécurisation des données
• Synchronisation automatique
• Support technique 24/7
• Formation utilisateur incluse
• Mises à jour gratuites

=== TECHNOLOGIE MODERNE ===

• Applications natives iOS/Android
• Interface web responsive
• Mode hors ligne disponible
• Chiffrement bout-en-bout
• Sauvegarde automatique cloud
• Performance optimisée Afrique

EDUCAFRIC 2025 - Révolutionnons l'éducation africaine ensemble`
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