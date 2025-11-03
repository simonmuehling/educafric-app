# 🧪 Comment Tester la Mise à Jour PWA

## Test Rapide (5 minutes)

### Étape 1: Générer la Version Initiale
```bash
node scripts/generate-version.cjs
```

Vous verrez:
```
✅ Version file generated:
   Version: 1.0.0
   Build Time: 2025-11-03T21:05:00.000Z
   Build Hash: 40df61be
   Cache Version: educafric-v1.0.0-mhjmchnh
```

### Étape 2: Ouvrir l'Application
1. Ouvrez votre navigateur (Chrome ou Safari)
2. Allez sur votre URL Replit
3. **Important**: Ouvrez les outils développeur (F12)
4. Allez dans l'onglet "Console"

### Étape 3: Vérifier la Version Initiale
Dans la console, vous devriez voir:
```
[PWA_UPDATE] Version check: { current: null, new: "educafric-v1.0.0-...", hasUpdate: false }
```

La version est maintenant sauvegardée dans localStorage.

### Étape 4: Simuler une Nouvelle Version
```bash
# Attendre 2 secondes puis générer une nouvelle version
sleep 2
node scripts/generate-version.cjs
```

### Étape 5: Observer la Notification
**Attendez 5-10 secondes** (le système vérifie toutes les 5 minutes, mais au premier chargement il vérifie plus rapidement).

Vous devriez voir:
1. Dans la console:
   ```
   [PWA_UPDATE] Version check: { current: "educafric-v1.0.0-old", new: "educafric-v1.0.0-new", hasUpdate: true }
   ```

2. **Une notification bleue apparaît en bas de l'écran** avec:
   - Titre: "Nouvelle version disponible"
   - Message explicatif
   - Bouton "Mettre à jour"
   - Bouton "Plus tard"

### Étape 6: Tester la Mise à Jour
1. **Cliquez sur "Mettre à jour"**
2. La page devrait se recharger
3. Vérifiez dans la console:
   ```
   [PWA_UPDATE] Saved new version to localStorage: educafric-v1.0.0-new
   ```

### Étape 7: Vérifier que la Notification Ne Réapparaît Pas
Après le rechargement:
- ✅ La notification NE doit PAS réapparaître
- ✅ Dans localStorage, la version doit être à jour
- ✅ Le système est prêt pour la prochaine mise à jour

---

## Test Complet en Production (avec PWA installée)

### Prérequis
- Application déployée sur Replit
- PWA installée sur l'écran d'accueil (iOS/Android)

### Procédure

1. **Installer la PWA** (si pas déjà fait)
   - iOS: Safari > Partager > Ajouter à l'écran d'accueil
   - Android: Chrome > Menu > Installer l'application

2. **Ouvrir la PWA depuis l'écran d'accueil**
   - L'application se lance en mode standalone

3. **Générer une nouvelle version**
   ```bash
   node scripts/generate-version.cjs
   git add public/version.json
   git commit -m "Update version"
   git push
   ```

4. **Déployer sur Replit**
   - Cliquez sur "Deploy" dans Replit
   - Attendez la fin du déploiement

5. **Attendre la détection (max 5 minutes)**
   - La PWA vérifie toutes les 5 minutes
   - Ou fermez et rouvrez la PWA pour forcer la vérification

6. **La notification apparaît**
   - Cliquez sur "Mettre à jour"
   - L'application se recharge avec la nouvelle version

7. **Vérification finale**
   - Fermez complètement la PWA
   - Rouvrez-la
   - ✅ Aucune notification ne doit apparaître
   - ✅ La version est à jour

---

## Dépannage

### "La notification n'apparaît pas"

**Solution 1: Forcer la vérification**
Dans la console du navigateur:
```javascript
// Générer une nouvelle version côté serveur d'abord
// puis dans la console:
location.reload()
```

**Solution 2: Vider le cache**
1. Ouvrir DevTools > Application > Storage
2. Cliquer sur "Clear site data"
3. Recharger la page

### "La notification apparaît en boucle"

Ce bug a été corrigé. Si vous le voyez encore:
1. Vérifier que vous avez la dernière version de `usePWAUpdate.ts`
2. Vider localStorage:
   ```javascript
   localStorage.removeItem('pwa_current_version')
   ```
3. Recharger la page

### "La version ne change pas"

Vérifier:
```bash
# Voir le contenu actuel
cat public/version.json

# Générer une nouvelle version
node scripts/generate-version.cjs

# Vérifier le changement
cat public/version.json
```

---

## Commandes Utiles

### Voir la version actuelle
```bash
cat public/version.json | grep cacheVersion
```

### Générer et voir
```bash
node scripts/generate-version.cjs && cat public/version.json
```

### Vérifier en production
```bash
curl https://votre-app.repl.co/version.json
```

### Debug dans la console
```javascript
// Voir la version stockée
localStorage.getItem('pwa_current_version')

// Voir toutes les clés
Object.keys(localStorage)

// Forcer une nouvelle vérification
location.reload()
```

---

## Logs à Surveiller

Dans la console développeur, cherchez:

✅ **Succès:**
```
[PWA_UPDATE] Version check: {...}
[PWA_UPDATE] Saved new version to localStorage: ...
[SW] Version loaded: educafric-v1.0.0-xxxxx
[SW] Deleted 2 old caches
```

❌ **Erreurs potentielles:**
```
[PWA_UPDATE] Check failed: ...
[SW] Failed to load version, using fallback: ...
Failed to fetch: /version.json
```

---

## Workflow de Déploiement Recommandé

```bash
# 1. Faire vos modifications de code
git add .
git commit -m "Nouvelles fonctionnalités"

# 2. Générer la nouvelle version
node scripts/generate-version.cjs

# 3. Commit la version
git add public/version.json
git commit -m "Update version for deployment"

# 4. Push et déployer
git push

# 5. Dans Replit, cliquer sur "Deploy"

# 6. Attendre 1-2 minutes
# Les utilisateurs avec la PWA installée recevront
# automatiquement la notification de mise à jour
```

---

## Validation Finale

Checklist avant de considérer le système fonctionnel:

- [ ] `node scripts/generate-version.cjs` génère une nouvelle version unique
- [ ] Le fichier `public/version.json` existe et contient les bonnes données
- [ ] L'application démarre sans erreurs
- [ ] La notification apparaît quand une nouvelle version est générée
- [ ] Cliquer sur "Mettre à jour" recharge l'application
- [ ] La notification ne réapparaît pas après la mise à jour
- [ ] La version est sauvegardée dans localStorage
- [ ] Le système fonctionne aussi avec la PWA installée

---

**🎉 Succès!** Votre système de mise à jour PWA est maintenant opérationnel.
