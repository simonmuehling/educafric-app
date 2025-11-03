# 🔄 Guide de Mise à Jour PWA - Educafric

## Vue d'ensemble

Ce guide explique comment le système de mise à jour automatique de la PWA fonctionne et comment l'utiliser lors du déploiement de nouvelles versions.

---

## 🎯 Problème Résolu

**Problème initial:** Lorsqu'une nouvelle version de l'application était déployée, les utilisateurs qui avaient installé la PWA sur leur écran d'accueil continuaient de voir l'ancienne version en cache.

**Solution:** Système de versioning automatique avec détection de mise à jour côté client.

---

## 📦 Composants du Système

### 1. **Fichier de Version** (`public/version.json`)

Contient les informations de version actuelle:

```json
{
  "version": "1.0.0",
  "buildTime": "2025-11-03T20:55:00.000Z",
  "buildHash": "a3f9c7e",
  "cacheVersion": "educafric-v1.0.0-mhjmchnh"
}
```

- **version**: Version sémantique (depuis package.json)
- **buildTime**: Timestamp ISO du build
- **buildHash**: Hash court du commit Git ou timestamp
- **cacheVersion**: Version unique du cache Service Worker

### 2. **Script de Génération** (`scripts/generate-version.cjs`)

Génère automatiquement le fichier de version avec un identifiant unique.

**Utilisation:**
```bash
node scripts/generate-version.cjs
```

### 3. **Service Worker Modifié** (`public/service-worker.js`)

Le service worker charge maintenant dynamiquement la version au lieu d'utiliser une version codée en dur:

```javascript
// Avant (problématique)
const CACHE_VERSION = 'educafric-v1.3.0';

// Après (dynamique)
async function loadVersion() {
  const response = await fetch('/version.json?nocache=' + Date.now());
  const versionInfo = await response.json();
  CACHE_VERSION = versionInfo.cacheVersion;
}
```

### 4. **Hook de Détection** (`client/src/hooks/usePWAUpdate.ts`)

Hook React personnalisé qui:
- Vérifie régulièrement les nouvelles versions (toutes les 5 minutes)
- Compare la version actuelle avec la version serveur
- Notifie l'application quand une mise à jour est disponible

### 5. **Composant de Notification** (`client/src/components/pwa/PWAUpdateNotification.tsx`)

Affiche une notification élégante à l'utilisateur avec:
- Message clair sur la disponibilité d'une mise à jour
- Bouton "Mettre à jour" pour recharger l'application
- Bouton "Plus tard" pour reporter
- Animation fluide (Framer Motion)

---

## 🚀 Workflow de Déploiement

### Option 1: Déploiement Manuel (Recommandé)

**Avant chaque déploiement:**

```bash
# 1. Générer une nouvelle version
node scripts/generate-version.cjs

# 2. Vérifier le fichier généré
cat public/version.json

# 3. Build l'application
npm run build

# 4. Déployer (Replit Deployments)
# Utiliser le bouton "Deploy" dans Replit
```

### Option 2: Automatisation avec Hooks Git (Avancé)

Créer un fichier `.git/hooks/pre-commit`:

```bash
#!/bin/sh
# Générer automatiquement la version avant chaque commit
node scripts/generate-version.cjs
git add public/version.json
```

Rendre le hook exécutable:
```bash
chmod +x .git/hooks/pre-commit
```

### Option 3: CI/CD Integration

Si vous utilisez un pipeline CI/CD, ajoutez cette étape avant le build:

```yaml
# Exemple GitHub Actions
- name: Generate Version
  run: node scripts/generate-version.cjs

- name: Build Application
  run: npm run build
```

---

## 🧪 Test du Système

### Test Local

1. **Démarrer le serveur de développement:**
   ```bash
   npm run dev
   ```

2. **Générer une première version:**
   ```bash
   node scripts/generate-version.cjs
   ```

3. **Ouvrir l'application dans le navigateur**
   - La version devrait être sauvegardée localement

4. **Générer une nouvelle version:**
   ```bash
   node scripts/generate-version.cjs
   ```

5. **Actualiser la page**
   - Une notification devrait apparaître après ~5-10 secondes
   - Tester les boutons "Mettre à jour" et "Plus tard"

### Test en Production

1. **Installer la PWA sur votre écran d'accueil**
   - iOS: Safari > Partager > Ajouter à l'écran d'accueil
   - Android: Chrome > Menu > Installer l'application

2. **Déployer une nouvelle version:**
   ```bash
   node scripts/generate-version.cjs
   # Push et déployer
   ```

3. **Ouvrir la PWA depuis l'écran d'accueil**
   - Attendre 5-10 minutes maximum
   - Une notification de mise à jour devrait apparaître

4. **Cliquer sur "Mettre à jour"**
   - L'application devrait se recharger avec la nouvelle version

---

## 🔍 Dépannage

### La notification ne s'affiche pas

**Vérifications:**

1. **Service Worker actif?**
   ```javascript
   // Dans la console du navigateur
   navigator.serviceWorker.getRegistration().then(reg => {
     console.log('SW:', reg);
   });
   ```

2. **Version chargée?**
   ```bash
   curl https://votre-app.repl.co/version.json
   ```

3. **Logs du hook:**
   - Ouvrir la console développeur
   - Chercher `[PWA_UPDATE]` dans les logs

### L'application ne se met pas à jour

**Solutions:**

1. **Vider le cache manuellement:**
   - Chrome: DevTools > Application > Clear storage
   - Safari: Préférences > Avancé > Vider les caches

2. **Désinstaller et réinstaller la PWA**

3. **Forcer la mise à jour du Service Worker:**
   ```javascript
   // Console du navigateur
   navigator.serviceWorker.getRegistration().then(reg => {
     reg.update();
   });
   ```

### Version incorrecte affichée

**Vérifier:**

1. **Le fichier version.json est à jour?**
   ```bash
   cat public/version.json
   ```

2. **Le build inclut le nouveau fichier?**
   - Vérifier que `public/version.json` est dans le dossier de build

3. **Le cache CDN est vidé?**
   - Replit purge automatiquement, mais attendre 1-2 minutes

---

## 📊 Monitoring

### Logs à surveiller

Dans la console du navigateur:

```
[PWA_UPDATE] Version check: { current: "...", new: "...", hasUpdate: true }
[SW] Version loaded: educafric-v1.0.0-xxxxx
[SW] Active cache version: educafric-v1.0.0-xxxxx
[SW] Deleted 2 old caches
```

### Métriques importantes

- **Taux d'adoption des mises à jour**: Combien d'utilisateurs cliquent sur "Mettre à jour"
- **Temps de détection**: Temps entre le déploiement et la notification
- **Taux d'erreur**: Échecs de chargement de version

---

## 🎨 Personnalisation

### Modifier la fréquence de vérification

Dans `client/src/hooks/usePWAUpdate.ts`:

```typescript
// Actuellement: 5 minutes
const CHECK_INTERVAL = 5 * 60 * 1000;

// Changer à 10 minutes:
const CHECK_INTERVAL = 10 * 60 * 1000;
```

### Modifier l'apparence de la notification

Dans `client/src/components/pwa/PWAUpdateNotification.tsx`:

```typescript
// Position
<PWAUpdateNotification position="top" /> // ou "bottom"

// Auto-hide
<PWAUpdateNotification autoHide={true} autoHideDelay={15000} />
```

### Personnaliser les messages

Modifier les textes dans `PWAUpdateNotification.tsx`:

```typescript
<h3>Nouvelle version disponible</h3>
<p>Une mise à jour d'Educafric est disponible...</p>
```

---

## ✅ Checklist de Déploiement

Avant chaque déploiement en production:

- [ ] Générer une nouvelle version: `node scripts/generate-version.cjs`
- [ ] Vérifier que `public/version.json` est mis à jour
- [ ] Tester localement la détection de mise à jour
- [ ] Vérifier les logs du Service Worker
- [ ] Tester sur mobile (iOS et Android)
- [ ] Documenter les changements de version
- [ ] Surveiller les logs après déploiement

---

## 🔐 Sécurité

### Cache Busting

Le fichier version.json utilise un paramètre de cache-busting:
```javascript
fetch('/version.json?nocache=' + Date.now())
```

Cela garantit que la version est toujours à jour.

### Validation de Version

Le hook valide que:
- Le fichier version.json existe
- Le format JSON est correct
- La version contient tous les champs requis

---

## 📚 Ressources

### Documentation

- [Service Workers - MDN](https://developer.mozilla.org/fr/docs/Web/API/Service_Worker_API)
- [PWA Update Patterns](https://web.dev/offline-cookbook/)
- [Cache Strategies](https://developers.google.com/web/tools/workbox/modules/workbox-strategies)

### Outils

- [Lighthouse PWA Audit](https://developers.google.com/web/tools/lighthouse)
- [PWA Builder](https://www.pwabuilder.com/)
- [Workbox](https://developers.google.com/web/tools/workbox)

---

## 🎯 Meilleures Pratiques

1. **Toujours générer une nouvelle version avant déploiement**
2. **Tester en local avant de déployer en production**
3. **Surveiller les logs après déploiement**
4. **Documenter les changements majeurs**
5. **Informer les utilisateurs des nouvelles fonctionnalités**

---

## 🆘 Support

En cas de problème:

1. Vérifier les logs du Service Worker
2. Vider le cache et réessayer
3. Consulter la section Dépannage
4. Contacter l'équipe technique

---

**Dernière mise à jour:** 3 novembre 2025  
**Version du guide:** 1.0.0
