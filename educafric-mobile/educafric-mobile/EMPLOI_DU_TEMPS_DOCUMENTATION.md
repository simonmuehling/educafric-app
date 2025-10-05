# Documentation Gestion des Emplois du Temps - Educafric

## Architecture Hiérarchique de Gestion

### 1️⃣ **NIVEAU ÉCOLE** (Administration Centrale)
**Qui gère :** Directeur, Admin École
**Responsabilités :**
- Configuration des horaires généraux (6h00 - 18h00)
- Gestion des créneaux ultra-flexibles (intervalles de 5 minutes)
- Attribution des salles de classe
- Paramètres académiques (années scolaires, trimestres)
- Supervision générale de tous les emplois du temps

### 2️⃣ **NIVEAU CLASSE** (Organisation Pédagogique)
**Qui gère :** Directeur, Admin École, Enseignants principaux
**Responsabilités :**
- Création des emplois du temps par classe (6ème, 5ème, 4ème, etc.)
- Répartition des matières par niveau
- Gestion des effectifs (maximum 30 élèves par classe)
- Coordination entre les différentes matières

### 3️⃣ **NIVEAU MATIÈRE/ENSEIGNANT** (Planification Détaillée)
**Qui gère :** Enseignants, Directeur pédagogique
**Responsabilités :**
- Attribution enseignant ↔ matière ↔ classe
- Planification des cours par créneaux spécifiques
- Gestion des coefficients par matière
- Création et modification des horaires de cours

### 4️⃣ **NIVEAU ÉLÈVE/PARENT** (Consultation et Suivi)
**Qui consulte :** Élèves, Parents, Répétiteurs
**Accès :**
- Consultation des emplois du temps individuels
- Notifications automatiques des changements
- Accès en lecture seule
- Suivi des cours et absences

## Structure Technique

### Base de Données
```sql
Table: timetable_slots
- id: Identifiant unique
- classId: Référence à la classe
- subjectId: Référence à la matière
- teacherId: Référence à l'enseignant
- dayOfWeek: Jour de la semaine (1=Lundi, 7=Dimanche)
- startTime: Heure de début (format HH:MM)
- endTime: Heure de fin (format HH:MM)
- room: Salle de classe
- academicYearId: Année académique
- isActive: Statut actif/inactif
```

### Créneaux Horaires Ultra-Flexibles
- **Plage horaire :** 6h00 à 18h00
- **Intervalles :** 5 minutes
- **Total créneaux disponibles :** 144 créneaux par jour
- **Exemple :** 08:00, 08:05, 08:10, 08:15, etc.

## Accès par Profil Utilisateur

### 👩‍💼 **Directeur/Admin École**
- **Accès complet :** Création, modification, suppression
- **Vue globale :** Tous les emplois du temps de l'école
- **Gestion avancée :** Salles, ressources, conflits
- **Reporting :** Statistiques d'utilisation

### 👨‍🏫 **Enseignants**
- **Accès restreint :** Leurs matières et classes uniquement
- **Modification :** Leurs créneaux assignés
- **Consultation :** Emplois du temps des classes qu'ils enseignent
- **Communication :** Notifications aux élèves/parents

### 👨‍👩‍👧‍👦 **Parents**
- **Accès lecture seule :** Emploi du temps de leurs enfants
- **Notifications :** Changements, absences, retards
- **Historique :** Consultation des emplois du temps passés
- **Communication :** Contact avec les enseignants

### 🎓 **Élèves**
- **Consultation :** Leur emploi du temps personnel
- **Notifications :** Changements de dernière minute
- **Planning :** Vue hebdomadaire et mensuelle
- **Devoirs :** Liens avec les créneaux de cours

### 🎯 **Répétiteurs/Freelancers**
- **Vue élève :** Emploi du temps des élèves qu'ils encadrent
- **Planification :** Créneaux de répétition complémentaires
- **Coordination :** Éviter les conflits avec les cours officiels
- **Suivi :** Progression par matière

## Fonctionnalités Avancées

### Communication Inter-Profils
- **École → Parents/Élèves :** Notifications de changements d'horaires
- **Enseignant → Élèves/Parents :** Modifications de cours, rattrapages
- **Répétiteur → Élèves :** Planning des séances privées
- **Commercial → Prospects :** Présentation des plannings types

### Gestion des Conflits
- **Détection automatique :** Conflits de salles, enseignants, élèves
- **Résolution guidée :** Suggestions d'alternatives
- **Validation :** Approbation des changements par le directeur

### Notifications Intelligentes
- **SMS/WhatsApp :** Changements urgents d'emploi du temps
- **Email :** Notifications hebdomadaires
- **Push App :** Alertes en temps réel
- **Multilingue :** Français/Anglais

### Intégration Contextuelle Africaine
- **Horaires adaptés :** Prise en compte du climat et des coutumes
- **Connectivité optimisée :** Synchronisation même avec réseau faible
- **Communication locale :** SMS privilégié pour toucher tous les parents
- **Flexibilité :** Adaptation aux réalités éducatives africaines

## Exemples Concrets

### École Démonstration Educafric
```
Lundi 8h00-9h00 : Mathématiques (6ème A, Salle 101, Prof. Demo Teacher)
Lundi 9h05-10h05 : Français (6ème A, Salle 102, Prof. Dupont)
Lundi 10h15-11h15 : Anglais (6ème A, Salle 103, Prof. Smith)
```

### Accès Parent (parent.demo@test.educafric.com)
- Peut voir l'emploi du temps de student.demo@test.educafric.com
- Reçoit des SMS en cas de changement
- Peut contacter les enseignants via l'app

### Accès Répétiteur (freelancer.demo@test.educafric.com)
- Voit l'emploi du temps de l'élève qu'il encadre
- Planifie ses séances en dehors des heures de cours
- Coordonne avec les parents pour les horaires

## Sécurité et Contrôle d'Accès

### Permissions Hiérarchiques
1. **Site Admin :** Accès à toutes les écoles
2. **Directeur :** Accès complet à son école
3. **Enseignant :** Accès à ses classes uniquement
4. **Parent :** Accès aux données de ses enfants
5. **Élève :** Accès à ses propres données
6. **Répétiteur :** Accès aux élèves qu'il encadre

### Audit et Traçabilité
- Historique des modifications
- Logs des accès
- Notifications de sécurité
- Sauvegarde automatique

---

**Cette architecture permet une gestion décentralisée et sécurisée des emplois du temps, adaptée aux besoins spécifiques de l'éducation africaine.**