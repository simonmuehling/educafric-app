# 🧪 Guide de Test - Système d'Abonnement EDUCAFRIC

## 📋 **Comptes de Test Disponibles**

### **Rôles AVEC Abonnement (voient les cartes d'abonnement)**

#### 🏫 **Admin Scolaire**
- **Email**: `school.admin@test.educafric.com`
- **Mot de passe**: `password123`
- **Rôle**: `Admin`
- **Test**: Doit voir carte d'abonnement dans le dashboard

#### 👨‍👩‍👧‍👦 **Parent**
- **Email**: `parent.mvondo@test.educafric.com`
- **Mot de passe**: `password123`
- **Rôle**: `Parent`
- **Test**: Doit voir carte d'abonnement avec plans géolocalisation

#### 💼 **Commercial**
- **Email**: `commercial@test.educafric.com`
- **Mot de passe**: `password123`
- **Rôle**: `Commercial`
- **Test**: Doit voir carte d'abonnement dans le dashboard

#### 🎓 **Freelancer**
- **Email**: `freelancer@test.educafric.com`
- **Mot de passe**: `password123`
- **Rôle**: `Freelancer`
- **Test**: Doit voir carte d'abonnement avec plans tutorat

### **Rôles SANS Abonnement (voient "Accès Gratuit")**

#### 👨‍🏫 **Enseignant**
- **Email**: `teacher.kamto@test.educafric.com`
- **Mot de passe**: `password123`
- **Rôle**: `Teacher`
- **Test**: Doit voir "Accès Gratuit - géré par votre école"

#### 🎒 **Étudiant**
- **Email**: `emma.talla@test.educafric.com`
- **Mot de passe**: `password123`
- **Rôle**: `Student`
- **Test**: Doit voir "Accès Gratuit - géré par votre école"

---

## 🔬 **Procédure de Test**

### **Étape 1: Connexion**
1. Aller sur `/login`
2. Se connecter avec un des comptes ci-dessus
3. Accéder au dashboard principal

### **Étape 2: Vérification Dashboard**
Pour les rôles AVEC abonnement :
- ✅ Carte "Mon Abonnement" visible dans le dashboard
- ✅ Informations plan (Plan Basique, Plan Géolocalisation)
- ✅ Statut abonnement (Actif/Inactif)
- ✅ Bouton d'accès aux plans

Pour les rôles SANS abonnement :
- ✅ Message "Accès Gratuit"
- ✅ Explication "géré par votre école"
- ✅ Pas de carte d'abonnement

### **Étape 3: Test Page Subscribe**
1. Aller sur `/subscribe`
2. Vérifier les 3 catégories :
   - 👨‍👩‍👧‍👦 Parents
   - 🏫 Écoles
   - 🎓 Freelancers
3. Tester chaque catégorie pour voir les plans adaptés

### **Étape 4: Test Multi-Rôles**
1. Créer un compte avec un numéro de téléphone existant
2. Vérifier la détection multi-rôles
3. Sélectionner plusieurs rôles
4. Vérifier l'affichage d'abonnement selon le rôle actif

---

## 🎯 **Résultats Attendus**

### **Tableau de Synthèse**

| Rôle | Carte Abonnement | Message Affiché | Accès Subscribe |
|------|------------------|-----------------|-----------------|
| **Parent** | ✅ Oui | Plan + Statut | ✅ Catégorie Parents |
| **SiteAdmin** | ✅ Oui | Plan + Statut | ✅ Catégorie Écoles |
| **Admin** | ✅ Oui | Plan + Statut | ✅ Catégorie Écoles |
| **Director** | ✅ Oui | Plan + Statut | ✅ Catégorie Écoles |
| **Commercial** | ✅ Oui | Plan + Statut | ✅ Catégorie Écoles |
| **Freelancer** | ✅ Oui | Plan + Statut | ✅ Catégorie Freelancers |
| **Teacher** | ❌ Non | "Accès Gratuit" | ❌ Accès géré école |
| **Student** | ❌ Non | "Accès Gratuit" | ❌ Accès géré école |

---

## 🛠 **Méthodes de Test Rapides**

### **1. Test Console Browser**
```javascript
// Vérifier le rôle utilisateur actuel
console.log('User role:', window.localStorage.getItem('userRole'));

// Vérifier les éléments d'abonnement
console.log('Subscription cards:', document.querySelectorAll('[data-testid*="subscription"]'));
```

### **2. Test via URL directe**
- `/dashboard` - Voir le dashboard principal
- `/subscribe` - Voir les plans d'abonnement
- `/profile` - Voir les informations utilisateur

### **3. Test Responsive Mobile**
- Ouvrir les outils développeur (F12)
- Mode responsive pour tester sur mobile
- Vérifier l'affichage des cartes d'abonnement

---

## 🚀 **Test Sandbox**

### **Mode Démonstration**
- Les utilisateurs sandbox ont accès gratuit à toutes les fonctionnalités
- Message affiché : "Mode Démonstration - accès gratuit"
- Peut tester les fonctionnalités premium sans payer

### **Activation Sandbox**
1. Se connecter avec un email `@test.educafric.com`
2. Le système détecte automatiquement le mode sandbox
3. Accès premium automatique

---

## 📊 **Métriques de Test**

### **Tests Réussis ✅**
- [ ] Parent voit carte d'abonnement
- [ ] Teacher voit "Accès Gratuit"
- [ ] Student voit "Accès Gratuit"
- [ ] Admin voit carte d'abonnement
- [ ] Freelancer voit carte d'abonnement
- [ ] Page Subscribe fonctionne
- [ ] 3 catégories visibles sur Subscribe
- [ ] Multi-rôle fonctionne

### **Bugs à Reporter 🐛**
- [ ] Carte d'abonnement manquante pour rôle concerné
- [ ] Message "Accès Gratuit" manquant pour Teacher/Student
- [ ] Erreur page Subscribe
- [ ] Problème changement de catégorie

---

## 💡 **Conseils de Test**

1. **Nettoyer le cache** entre chaque test de rôle
2. **Tester en mode incognito** pour éviter les conflits de session
3. **Vérifier sur mobile ET desktop**
4. **Tester avec et sans connexion internet**
5. **Tester les transitions entre rôles** pour les comptes multi-rôles

---

*Dernière mise à jour: 12 août 2025*