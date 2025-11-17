# 🎓 SANDBOX ISOLATION - ENDPOINTS DE DÉMONSTRATION

## État actuel de l'isolation sandbox

✅ **Terminé:**
1. Colonne `is_sandbox` ajoutée à la table `schools`
2. 7 écoles sandbox marquées (IDs 1-6, 15) avec `is_sandbox = true`
3. Utilitaires centralisés créés dans `server/utils/sandboxUtils.ts`
4. Endpoints de démonstration créés montrant le pattern correct

📋 **À faire:** Mettre à jour ~50+ endpoints existants pour utiliser le nouveau pattern d'isolation

---

## 🧪 Endpoints de test disponibles

Base URL: `https://www.educafric.com/api/sandbox-demo`

### 1. Vérification de l'isolation
**GET** `/api/sandbox-demo/verify-isolation`

Vérifie que l'utilisateur et son école ont le même statut sandbox.

**Réponse attendue:**
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
    "name": "École Demo",
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

---

### 2. ❌ Exemple MAUVAIS (avec fuite de données)
**GET** `/api/sandbox-demo/students-bad`

Montre comment NE PAS faire - filtre seulement par `schoolId` sans isolation sandbox.

**⚠️ Problème:** Les données sandbox peuvent apparaître pour les utilisateurs production et vice versa.

---

### 3. ✅ Exemple BON (isolation complète)
**GET** `/api/sandbox-demo/students-good`

Montre le pattern CORRECT - filtre par `schoolId` ET `is_sandbox`.

**Réponse attendue:**
```json
{
  "success": true,
  "message": "This endpoint has COMPLETE sandbox isolation ✅",
  "isolation": {
    "userEmail": "sandbox.director@educafric.demo",
    "userIsSandbox": true,
    "schoolId": 1,
    "filter": "schoolId=1 AND is_sandbox=true"
  },
  "students": [
    {
      "id": 123,
      "firstName": "Jean",
      "lastName": "Kamga",
      "email": "jean.kamga.s1@test.educafric.com",
      "role": "Student",
      "schoolId": 1,
      "schoolName": "École Demo",
      "schoolIsSandbox": true
    }
  ],
  "count": 5
}
```

**✅ Garantie:** Utilisateurs sandbox voient UNIQUEMENT des étudiants sandbox. Utilisateurs production voient UNIQUEMENT des étudiants production.

---

### 4. ✅ Enseignants isolés
**GET** `/api/sandbox-demo/teachers-isolated`

Montre le pattern correct pour les requêtes d'enseignants.

---

### 5. ✅ Classes isolées
**GET** `/api/sandbox-demo/classes-isolated`

Montre le pattern correct pour les requêtes de classes.

---

## 🧪 Comment tester

### Test 1: Connexion utilisateur sandbox

1. **Se connecter** sur `/sandbox-login` avec:
   - Email: `sandbox.director@educafric.demo`
   - Password: `sandbox123`

2. **Appeler** `/api/sandbox-demo/verify-isolation`
   - ✅ Devrait montrer `userIsSandbox: true` et `schoolIsSandbox: true`
   - ✅ Status: "ISOLATED"

3. **Appeler** `/api/sandbox-demo/students-good`
   - ✅ Devrait afficher UNIQUEMENT les étudiants sandbox (emails avec @test.educafric.com)
   - ✅ AUCUN étudiant production ne devrait apparaître

---

### Test 2: Connexion utilisateur production (quand disponible)

1. **Se connecter** avec un compte école réelle (production)

2. **Appeler** `/api/sandbox-demo/verify-isolation`
   - ✅ Devrait montrer `userIsSandbox: false` et `schoolIsSandbox: false`
   - ✅ Status: "ISOLATED"

3. **Appeler** `/api/sandbox-demo/students-good`
   - ✅ Devrait afficher UNIQUEMENT les étudiants production
   - ✅ AUCUN étudiant sandbox ne devrait apparaître

---

### Test 3: Comparaison mauvais vs bon endpoint

1. **Connecté en sandbox**, appeler:
   - `/api/sandbox-demo/students-bad` (mauvais)
   - `/api/sandbox-demo/students-good` (bon)

2. **Comparer** les résultats:
   - ⚠️ Le mauvais endpoint pourrait afficher des données incorrectes
   - ✅ Le bon endpoint affiche UNIQUEMENT des données sandbox correctes

---

## 📖 Code Pattern à utiliser partout

```typescript
import { isSandboxUserByEmail } from '../utils/sandboxUtils';
import { and, eq } from 'drizzle-orm';

// 1. Déterminer si l'utilisateur est sandbox
const userIsSandbox = isSandboxUserByEmail(user.email);

// 2. Requête avec isolation complète
const data = await db
  .select()
  .from(yourTable)
  .leftJoin(schools, eq(yourTable.schoolId, schools.id))
  .where(
    and(
      eq(yourTable.schoolId, user.schoolId),
      eq(schools.isSandbox, userIsSandbox) // ← LIGNE CRITIQUE
    )
  );
```

---

## 📚 Fichiers de référence

1. **Pattern de démonstration:** `server/routes/api/sandbox-demo.ts`
2. **Utilitaires:** `server/utils/sandboxUtils.ts`
3. **Guide complet:** `server/utils/SANDBOX_ISOLATION_GUIDE.md`
4. **Schema:** `shared/schemas/schoolSchema.ts` (ligne 52: `isSandbox`)

---

## 🎯 Prochaines étapes

Pour compléter l'isolation sandbox, tous les endpoints suivants doivent être mis à jour avec le nouveau pattern:

### Priorité HAUTE (données sensibles):
- [ ] `/api/director/students` - Liste étudiants
- [ ] `/api/director/teachers` - Liste enseignants
- [ ] `/api/director/classes` - Liste classes
- [ ] `/api/director/bulletins/list` - Liste bulletins
- [ ] `/api/parent/children` - Enfants du parent
- [ ] `/api/student/grades` - Notes étudiant
- [ ] `/api/teacher/classes` - Classes enseignant

### Priorité MOYENNE:
- [ ] `/api/director/timetables` - Emplois du temps
- [ ] `/api/director/rooms` - Salles
- [ ] `/api/teacher/homework` - Devoirs
- [ ] Tous les endpoints dans `server/storage/*.ts`

### Priorité BASSE:
- [ ] Endpoints analytics
- [ ] Endpoints reporting
- [ ] Endpoints notifications

---

## ✅ Checklist par endpoint

Pour chaque endpoint à mettre à jour:

1. [ ] Importer `isSandboxUserByEmail` de sandboxUtils
2. [ ] Calculer `userIsSandbox` au début de l'endpoint
3. [ ] Ajouter `leftJoin` avec table `schools` (si pas déjà présent)
4. [ ] Ajouter `eq(schools.isSandbox, userIsSandbox)` dans la clause WHERE
5. [ ] Tester avec utilisateur sandbox
6. [ ] Tester avec utilisateur production (quand disponible)
7. [ ] Vérifier qu'il n'y a PAS de fuite de données

---

## 🔧 Support

En cas de problème:
1. Vérifier que `is_sandbox` existe dans la DB: `SELECT column_name FROM information_schema.columns WHERE table_name = 'schools' AND column_name = 'is_sandbox';`
2. Vérifier les écoles sandbox: `SELECT id, name, is_sandbox FROM schools WHERE id IN (1,2,3,4,5,6,15);`
3. Consulter le guide complet: `server/utils/SANDBOX_ISOLATION_GUIDE.md`
