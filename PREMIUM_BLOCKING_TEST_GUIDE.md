# 🔒 Guide de Test - Blocage des Modules Premium

## 📋 **Nouvelle Logique de Contrôle d'Accès**

### **Accès GRATUIT (Toujours autorisé)**
- ✅ **Teacher** : Accès complet géré par l'école
- ✅ **Student** : Accès complet géré par l'école
- ✅ **Comptes Sandbox** : `@test.educafric.com` pour les démonstrations

### **Accès PREMIUM (Nécessite abonnement actif)**
- 🔒 **Parent** : Doit avoir `subscriptionStatus = 'active'`
- 🔒 **Admin** : Doit avoir `subscriptionStatus = 'active'`
- 🔒 **Director** : Doit avoir `subscriptionStatus = 'active'`
- 🔒 **Commercial** : Doit avoir `subscriptionStatus = 'active'`
- 🔒 **Freelancer** : Doit avoir `subscriptionStatus = 'active'`

---

## 🧪 **Tests à Effectuer**

### **Test 1: Comptes Sandbox (Accès Gratuit)**
```bash
Email: parent.mvondo@test.educafric.com
Résultat Attendu: ✅ Accès complet aux modules premium
Raison: Compte de test pour démonstration
```

### **Test 2: Vrai Parent SANS Abonnement**
```bash
Email: parent.reel@gmail.com (créer un nouveau compte)
subscriptionStatus: null ou 'inactive'
Résultat Attendu: 🔒 Modules bloqués avec overlay "Premium Required"
```

### **Test 3: Vrai Parent AVEC Abonnement**
```bash
Email: parent.premium@gmail.com (créer un nouveau compte)
subscriptionStatus: 'active'
subscriptionPlan: 'basic' ou 'geolocation'
Résultat Attendu: ✅ Accès complet aux modules premium
```

### **Test 4: Teacher (Toujours Gratuit)**
```bash
Email: teacher.kamto@test.educafric.com
Résultat Attendu: ✅ Accès complet (pas de PremiumFeatureGate)
```

---

## 🔍 **Modules Premium à Tester**

### **Parent Dashboard**
- 🔒 **Messages Enseignants** (`featureName: "Messages Enseignants"`)
- 🔒 **Bulletins & Notes Détaillés** (`featureName: "Bulletins & Notes Détaillés"`)
- 🔒 **Suivi Présence Avancé** (`featureName: "Suivi Présence Avancé"`)
- 🔒 **Gestion Paiements** (`featureName: "Gestion Paiements"`)
- 🔒 **Géolocalisation Premium** (`featureName: "Géolocalisation Premium"`)

### **Freelancer Dashboard**
- 🔒 **Gestion Étudiants Premium** (`featureName: "Gestion Étudiants Premium"`)
- 🔒 **Sessions d'Enseignement** (`featureName: "Sessions d'Enseignement"`)
- 🔒 **Gestion Financière** (`featureName: "Gestion Financière"`)
- 🔒 **Planning Professionnel** (`featureName: "Planning Professionnel"`)
- 🔒 **Ressources Pédagogiques** (`featureName: "Ressources Pédagogiques"`)
- 🔒 **Communication Professionnelle** (`featureName: "Communication Professionnelle"`)
- 🔒 **Géolocalisation Pro** (`featureName: "Géolocalisation Pro"`)

---

## 🎯 **Vérification Visuelle**

### **Module Bloqué (Utilisateur SANS abonnement)**
```
┌─────────────────────────────────────┐
│ [🔒 PREMIUM REQUIS]                │
│                                     │
│ Messages Enseignants                │
│ ----------------------------------- │
│ ✓ Communication directe enseignants │
│ ✓ Notifications push instantanées   │
│ ✓ Historique complet conversations  │
│ ✓ Pièces jointes et photos         │
│                                     │
│ [🚀 METTRE À NIVEAU]               │
└─────────────────────────────────────┘
```

### **Module Accessible (Utilisateur AVEC abonnement)**
```
┌─────────────────────────────────────┐
│ Messages Enseignants                │
│ ----------------------------------- │
│ [Interface fonctionnelle normale]   │
│ • Liste des conversations           │
│ • Boutons d'action                  │
│ • Contenu interactif                │
└─────────────────────────────────────┘
```

---

## 🛠 **Commandes de Test Développeur**

### **1. Vérifier l'État Utilisateur**
```javascript
// Ouvrir F12 > Console
console.log('User:', window.localStorage.getItem('user'));
console.log('Subscription Status:', JSON.parse(window.localStorage.getItem('user') || '{}').subscriptionStatus);
```

### **2. Simuler Différents États**
```javascript
// Simuler utilisateur sans abonnement
localStorage.setItem('testSubscriptionStatus', 'inactive');

// Simuler utilisateur avec abonnement
localStorage.setItem('testSubscriptionStatus', 'active');
```

### **3. Compter les Modules Bloqués**
```javascript
// Compter les overlays premium
console.log('Modules bloqués:', document.querySelectorAll('[data-testid*="premium-overlay"]').length);

// Compter les boutons upgrade
console.log('Boutons upgrade:', document.querySelectorAll('[data-testid*="upgrade-button"]').length);
```

---

## 📊 **Matrice de Test**

| Utilisateur | Email | Subscription Status | Modules Parent | Modules Freelancer |
|------------|-------|-------------------|----------------|-------------------|
| **Sandbox Parent** | `parent.mvondo@test.educafric.com` | `N/A` | ✅ Tous accessibles | `N/A` |
| **Vrai Parent** | `parent.reel@gmail.com` | `inactive` | 🔒 Tous bloqués | `N/A` |
| **Parent Premium** | `parent.premium@gmail.com` | `active` | ✅ Tous accessibles | `N/A` |
| **Sandbox Freelancer** | `freelancer@test.educafric.com` | `N/A` | `N/A` | ✅ Tous accessibles |
| **Vrai Freelancer** | `freelancer.reel@gmail.com` | `inactive` | `N/A` | 🔒 Tous bloqués |
| **Teacher** | `teacher.kamto@test.educafric.com` | `N/A` | `N/A` | `N/A` |
| **Student** | `emma.talla@test.educafric.com` | `N/A` | `N/A` | `N/A` |

---

## 🚀 **Test Rapide**

### **Méthode Simple**
1. **Créer un compte Parent** avec email `parent.test.reel@gmail.com`
2. **Ne PAS activer d'abonnement**
3. **Aller au dashboard Parent**
4. **Cliquer sur "Messages Enseignants"**
5. **Vérifier** : Module bloqué avec overlay premium
6. **Cliquer sur "Mettre à Niveau"**
7. **Vérifier** : Redirection vers `/subscribe`

### **Test de Confirmation**
```bash
✅ Si modules bloqués = SUCCESS
❌ Si modules accessibles = PROBLÈME (vérifier subscriptionStatus)
```

---

## 💡 **Dépannage**

### **Si les modules ne sont PAS bloqués pour vrais utilisateurs**
1. Vérifier `user.subscriptionStatus` dans la console
2. Vérifier que l'email ne contient pas `test.educafric.com`
3. Vérifier que le rôle n'est pas `Teacher` ou `Student`
4. Contrôler les logs de `PremiumFeatureGate.hasAccess()`

### **Si les comptes sandbox SONT bloqués**
1. Vérifier que l'email contient `test.educafric.com`
2. Contrôler la logique `email?.includes('test.educafric.com')`
3. Vérifier les logs de connexion

---

*Dernière mise à jour: 12 août 2025 - Système de blocage premium activé*