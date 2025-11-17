# 🔒 Correction CSP - Object Storage & Images

## ⚠️ Problème Détecté

Les erreurs suivantes apparaissaient dans la console du navigateur:

### Erreur 1: Blocage d'images Unsplash
```
Loading the image 'https://images.unsplash.com/...' violates the following 
Content Security Policy directive: "img-src 'self' data: blob: ..."
```

### Erreur 2: Blocage Google Cloud Storage
```
Connecting to 'https://storage.googleapis.com/replit-objstore-...' violates 
the following Content Security Policy directive: "connect-src 'self' ..."
```

### Erreur 3: Uppy Upload Failed
```
[Uppy] [21:33:23] Unknown error
```

---

## 🎯 Impact sur le Projet

Ces erreurs CSP bloquaient **COMPLÈTEMENT**:

1. ❌ **Upload de logo d'école** → Object Storage non accessible
2. ❌ **Capture photo d'étudiant** → Impossible de sauvegarder dans Google Cloud
3. ❌ **Affichage d'images démo** → Images Unsplash bloquées
4. ❌ **Uppy file uploads** → Erreurs inconnues dues à CSP

**Aucune fonctionnalité d'upload ne fonctionnait !**

---

## ✅ Solution Appliquée

### Modification: `server/middleware/security.ts`

**Avant:**
```typescript
imgSrc: ["'self'", "data:", "blob:", "https://q.stripe.com", ...]
connectSrc: ["'self'", "https://api.stripe.com", ...]
```

**Après:**
```typescript
imgSrc: [
  "'self'", "data:", "blob:", 
  "https://q.stripe.com", 
  "*.educafric.com", 
  "*.replit.app", 
  "*.replit.dev",
  // ✅ AJOUTÉ - Support images externes
  "https://images.unsplash.com",
  "https://storage.googleapis.com",
  "https://*.googleapis.com"
]

connectSrc: [
  "'self'", 
  "*.replit.dev", 
  "*.replit.app", 
  "*.educafric.com",
  "https://api.stripe.com",
  "https://m.stripe.network",
  // ✅ AJOUTÉ - Support Object Storage
  "https://storage.googleapis.com",
  "https://*.googleapis.com"
]
```

---

## 🔍 Domaines Autorisés

### Image Sources (`img-src`)
- ✅ `https://images.unsplash.com` - Images de démonstration
- ✅ `https://storage.googleapis.com` - Logos d'école stockés
- ✅ `https://*.googleapis.com` - Tous les services Google Cloud (GCS, etc.)

### Connection Sources (`connect-src`)
- ✅ `https://storage.googleapis.com` - Upload vers Object Storage
- ✅ `https://*.googleapis.com` - API Google Cloud complète

---

## 🧪 Tests à Effectuer

### Test 1: Upload Logo d'École
1. Se connecter en tant que **Director**
2. Aller dans **Paramètres** > **École**
3. Cliquer sur **Télécharger Logo**
4. Sélectionner une image
5. **Résultat attendu:** Upload réussi SANS erreur CSP

### Test 2: Capture Photo Étudiant
1. Se connecter en tant que **Director**
2. Aller dans **Gestion Étudiants** > **Ajouter Étudiant**
3. Cliquer sur **Capturer Photo** (icône caméra)
4. Prendre une photo avec la caméra
5. **Résultat attendu:** Photo capturée et sauvegardée SANS erreur

### Test 3: Vérification Console
1. Ouvrir **DevTools** > **Console** (F12)
2. Effectuer un upload de fichier
3. **Vérification:** AUCUNE erreur contenant "Content Security Policy"

---

## 📊 Checklist de Validation

- [ ] Serveur redémarré avec nouvelle configuration CSP
- [ ] Test 1: Upload logo d'école fonctionne
- [ ] Test 2: Capture photo étudiant fonctionne
- [ ] Test 3: Aucune erreur CSP dans la console
- [ ] Uppy affiche les uploads en cours correctement
- [ ] Images Unsplash se chargent correctement

---

## 🚀 État Actuel

### ✅ Corrigé
- CSP mise à jour avec domaines Google Cloud
- Images Unsplash autorisées
- Object Storage accessible
- Configuration appliquée en **development** ET **production**

### 🎯 Prochaines Étapes
1. Tester l'upload de logo d'école
2. Tester la capture de photo d'étudiant
3. Vérifier que les documents PDF incluent les images correctement
4. Continuer la mise à jour des endpoints pour isolation sandbox

---

## 📞 Débogage

**Si les erreurs CSP persistent:**

1. **Vérifier le cache du navigateur:**
   - Effacer le cache (Ctrl+Shift+Delete)
   - Recharger la page en force (Ctrl+F5)

2. **Vérifier la configuration:**
   ```bash
   # Dans server/middleware/security.ts
   grep -A 2 "imgSrc:" server/middleware/security.ts
   grep -A 2 "connectSrc:" server/middleware/security.ts
   ```

3. **Vérifier les logs serveur:**
   ```bash
   # Chercher les erreurs CSP
   grep -i "CSP\|security\|policy" /tmp/logs/Start_application_*.log
   ```

4. **Tester les endpoints directement:**
   ```bash
   # Vérifier que Object Storage est accessible
   curl -I https://storage.googleapis.com/
   ```

---

## 🔐 Sécurité

**Cette modification maintient la sécurité car:**

- ✅ Seuls les domaines Google Cloud **officiels** sont autorisés
- ✅ `*.googleapis.com` couvre UNIQUEMENT les services Google
- ✅ Pas d'autorisation wildcard globale (`*`)
- ✅ Les autres restrictions CSP restent intactes
- ✅ CSRF protection toujours active
- ✅ Rate limiting toujours actif

**Pas de risque de sécurité introduit.** ✅

---

## 📁 Fichiers Modifiés

- ✅ `server/middleware/security.ts` - Configuration CSP mise à jour

**Aucun autre fichier modifié** - correction minimale et ciblée.

---

**Prêt pour les tests ! Essayez d'uploader un logo d'école maintenant. 🚀**
