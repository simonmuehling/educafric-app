# 🏢 Modules Enterprise - EducAfric v2.0

## Modules Stockés pour Version Future

### 📋 Composants Supprimés du Dashboard École
Ces modules ont été temporairement supprimés du dashboard école principal et seront réintégrés dans une version future dédiée aux établissements avec besoins entreprise.

#### 1. **BusinessPartnershipMap.tsx**
- **Fonctionnalité**: Carte interactive des partenariats école-entreprise
- **Features**:
  - Géolocalisation des entreprises partenaires
  - Gestion des stages et formations
  - Statistiques de placement étudiants
  - Communication directe avec entreprises
  - Suivi des opportunités d'emploi

#### 2. **BusinessPartnershipMapSimple.tsx** 
- **Fonctionnalité**: Version simplifiée des partenariats
- **Features**:
  - Liste des partenaires locaux
  - Formulaire de contact entreprises
  - Gestion des demandes de stage
  - Suivi des collaborations

### 🎯 Raison de la Suppression
- **Simplification**: Focus sur gestion académique pure pour écoles traditionnelles
- **Performance**: Réduction de la complexité du dashboard principal
- **Spécialisation**: Modules entreprise réservés aux établissements techniques/professionnels

### 🔄 Plan de Réintégration (v2.0)
- **Module "EducAfric Enterprise"**: Version spécialisée pour écoles techniques
- **Dashboard bifurqué**: Écoles classiques vs écoles professionnelles
- **Fonctionnalités avancées**: CRM entreprise, placement automatique, analytics RH

### 📁 Structure Conservée
```
future-modules/enterprise/
├── BusinessPartnershipMap.tsx (Module complet)
├── BusinessPartnershipMapSimple.tsx (Module simplifié) 
├── README.md (Cette documentation)
└── api-partnerships.ts (API endpoints - à créer)
```

### 🛠️ Actions pour Réactivation
1. **Restaurer les imports** dans DirectorDashboard.tsx
2. **Ajouter paramètre de configuration** école (type: traditional/professional)
3. **Créer routes API** pour partenariats (/api/partnerships/*)
4. **Tests d'intégration** avec données réelles entreprises
5. **Documentation utilisateur** module entreprise

---

*Modules conservés pour EducAfric v2.0 - 14 août 2025*

## 💡 Utilisation Future
Ces modules seront réactivés dans le cadre d'une version "EducAfric Professional" destinée aux :
- Écoles techniques et professionnelles
- Centres de formation entreprise
- Établissements avec programmes d'alternance
- Institutions avec partenariats industriels