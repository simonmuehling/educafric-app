# 🧪 TEST D'ISOLATION SANDBOX - Guide de Vérification

## ✅ Ce qui a été implémenté

### 1. Infrastructure Database
- ✅ Colonne `is_sandbox` ajoutée à la table `schools`
- ✅ 7 écoles sandbox marquées (IDs 1-6, 15) avec `is_sandbox = true`
- ✅ Utilitaires d'isolation créés dans `server/utils/sandboxUtils.ts`

### 2. Endpoint Principal Mis à Jour
- ✅ `/api/director/students` - **PREMIER ENDPOINT AVEC ISOLATION COMPLÈTE**
  - Filtre maintenant par `schoolId` ET `is_sandbox`
  - Les utilisateurs sandbox voient UNIQUEMENT les étudiants sandbox
  - Les utilisateurs production voient UNIQUEMENT les étudiants production

### 3. Endpoints de Démonstration
- ✅ `/api/sandbox-demo/verify-isolation` - Vérifier l'isolation utilisateur/école
- ✅ `/api/sandbox-demo/students-good` - Exemple correct avec isolation
- ✅ `/api/sandbox-demo/students-bad` - Exemple incorrect (montre le risque)
- ✅ `/api/sandbox-demo/teachers-isolated` - Pattern pour enseignants
- ✅ `/api/sandbox-demo/classes-isolated` - Pattern pour classes

---

## 🎯 TESTS À EFFECTUER MAINTENANT

### Test 1: Vérification de l'Isolation Sandbox ✅

**Objectif:** Confirmer que l'utilisateur sandbox et son école ont le même statut

**Étapes:**
1. Se connecter sur `/sandbox-login`
2. Choisir **Director (Dr. Christiane Fouda)**
   - Email: `sandbox.director@educafric.demo`
   - Password: `sandbox123`
3. Ouvrir un nouvel onglet et visiter: 
   ```
   https://www.educafric.com/api/sandbox-demo/verify-isolation
   ```

**Résultat Attendu:**
```json
{
  "user": {
    "email": "sandbox.director@educafric.demo",
    "role": "Director",
    "schoolId": 1,
    "detectedAsSandbox": true
  },
  "school": {
    "id": 1,
    "name": "...",
    "isSandbox": true
  },
  "isolation": {
    "isValid": true,
    "status": "✅ ISOLATED - User and school sandbox status match",
    "userIsSandbox": true,
    "schoolIsSandbox": true
  }
}
```

**✅ Succès si:** `isValid: true` et status contient "✅ ISOLATED"
**❌ Échec si:** `isValid: false` ou status contient "❌ LEAKAGE DETECTED"

---

### Test 2: Liste des Étudiants avec Isolation ✅

**Objectif:** Vérifier que les étudiants affichés sont UNIQUEMENT sandbox

**Étapes:**
1. Toujours connecté en tant que Director sandbox
2. Aller sur le **Director Dashboard** > **Gestion des Étudiants**
3. Observer la liste des étudiants

**OU** Visiter directement:
```
https://www.educafric.com/api/director/students
```

**Résultat Attendu:**
```json
{
  "success": true,
  "students": [
    {
      "id": ...,
      "firstName": "...",
      "lastName": "...",
      "email": "...@test.educafric.com",  // ✅ Email sandbox
      "schoolName": "...",
      "schoolIsSandbox": true  // ✅ CRITIQUE: doit être true
    }
  ]
}
```

**Vérifications:**
- ✅ TOUS les emails se terminent par `@test.educafric.com`
- ✅ TOUS les étudiants ont `schoolIsSandbox: true`
- ✅ AUCUN étudiant d'école production (emails normaux) n'apparaît

**Logs à Vérifier:**
Dans les logs du serveur, chercher:
```
[DIRECTOR_STUDENTS_API] User sandbox.director@educafric.demo - Sandbox: true, SchoolID: 1
[DIRECTOR_STUDENTS_API] ✅ Returning X isolated students (Sandbox: true)
```

---

### Test 3: Comparaison Bon vs Mauvais Pattern 📚

**Objectif:** Comprendre la différence entre isolé et non-isolé

**Étapes:**
1. Connecté en tant que Director sandbox
2. Visiter les deux endpoints:

**Endpoint BON (avec isolation):**
```
https://www.educafric.com/api/sandbox-demo/students-good
```

**Endpoint MAUVAIS (sans isolation - DÉMO UNIQUEMENT):**
```
https://www.educafric.com/api/sandbox-demo/students-bad
```

**Analyse:**
- Le BON endpoint filtre par `is_sandbox = true`
- Le MAUVAIS endpoint filtre SEULEMENT par `schoolId`
- Comparer les résultats pour voir la différence

---

### Test 4: Vérification Console Logs 📋

**Objectif:** Confirmer que les logs montrent l'isolation active

**Étapes:**
1. Ouvrir les **logs du serveur**
2. Chercher les lignes contenant `[DIRECTOR_STUDENTS_API]`

**Logs Attendus:**
```
[DIRECTOR_STUDENTS_API] User sandbox.director@educafric.demo - Sandbox: true, SchoolID: 1
[DIRECTOR_STUDENTS_API] ✅ Returning 38 isolated students (Sandbox: true)
```

**✅ Succès si:**
- Le log montre `Sandbox: true`
- Le log montre `✅ Returning X isolated students`
- Aucun message d'erreur

---

## 🚨 Scénarios de Test d'Échec (À Vérifier)

### Scénario 1: Utilisateur Production (quand disponible)
**Si vous avez un compte école réelle:**
1. Se connecter avec un compte production
2. Visiter `/api/sandbox-demo/verify-isolation`
3. **Résultat attendu:** `userIsSandbox: false`, `schoolIsSandbox: false`
4. Aller sur `/api/director/students`
5. **Vérification:** AUCUN étudiant avec email `@test.educafric.com` ne doit apparaître

### Scénario 2: Détection de Fuite de Données
**Si vous voyez:**
- Des étudiants avec emails `@test.educafric.com` dans un compte production
- Des étudiants avec emails normaux dans un compte sandbox
- `schoolIsSandbox` ne correspond pas à `userIsSandbox`

**→ ALERTE: Fuite de données détectée! Signaler immédiatement.**

---

## 📊 Checklist de Validation

- [ ] Test 1: Isolation vérifiée (`/api/sandbox-demo/verify-isolation` → `isValid: true`)
- [ ] Test 2: Liste étudiants filtrée correctement (tous avec `@test.educafric.com`)
- [ ] Test 3: Comparaison bon vs mauvais pattern comprise
- [ ] Test 4: Logs serveur montrent isolation active
- [ ] (Optionnel) Test avec compte production confirme séparation

---

## 🎯 État Actuel

### ✅ Terminé
1. Infrastructure database (`is_sandbox` column)
2. Utilitaires d'isolation (`sandboxUtils.ts`)
3. Endpoint principal mis à jour (`/api/director/students`)
4. Endpoints de démonstration créés
5. Documentation complète

### 🚧 En Cours
- Mise à jour des autres endpoints (teachers, classes, bulletins, etc.)
- ~50+ endpoints restants à mettre à jour

### ⏳ À Venir
- Validation complète avec utilisateurs réels
- Tests automatisés d'isolation
- Migration complète de tous les endpoints

---

## 📞 Support

**Si vous rencontrez un problème:**
1. Vérifier les logs serveur pour `[DIRECTOR_STUDENTS_API]`
2. Tester `/api/sandbox-demo/verify-isolation` d'abord
3. Vérifier que la DB a bien la colonne `is_sandbox`:
   ```sql
   SELECT column_name FROM information_schema.columns 
   WHERE table_name = 'schools' AND column_name = 'is_sandbox';
   ```

**Fichiers de référence:**
- Guide complet: `server/utils/SANDBOX_ISOLATION_GUIDE.md`
- Utilitaires: `server/utils/sandboxUtils.ts`
- Endpoint démo: `server/routes/api/sandbox-demo.ts`
- Pattern implémenté: Ligne 1919+ dans `server/routes.ts`

---

**Prêt pour les tests ? Commencez par le Test 1 pour vérifier l'isolation de base ! 🚀**
