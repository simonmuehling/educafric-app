# 📴 OFFLINE PREMIUM TESTING GUIDE
**Système de fonctionnement hors ligne avec limite de 14 jours pour Directors/Parents**

## 📋 Vue d'ensemble

Le système Offline Premium permet aux utilisateurs de travailler hors ligne pendant jusqu'à 14 jours avec un système d'avertissement progressif à 3 niveaux.

### 🎯 Rôles et limitations
- **Teachers/Students**: Accès offline ILLIMITÉ et GRATUIT
- **Directors/Parents**: Accès offline limité à 14 jours (sauf école avec mode unlimited activé)
- **Sandbox accounts**: Accès offline ILLIMITÉ

### ⚠️ Système d'avertissement à 3 niveaux
1. **0-3 jours**: ✅ Aucun avertissement - Accès complet
2. **3-7 jours**: 🟡 Bannière jaune - "Connexion recommandée"
3. **7-14 jours**: 🔴 Bannière rouge - "Reconnexion urgente requise" avec compte à rebours
4. **14+ jours**: 🚫 Accès bloqué - "Accès Premium suspendu"

## 🏗️ Architecture technique

### Frontend
```
client/src/
├── lib/offline/
│   ├── db.ts                          # Schema IndexedDB avec Dexie.js
│   └── syncQueue.ts                   # Gestionnaire de file de synchronisation
├── contexts/offline/
│   └── OfflinePremiumContext.tsx      # Contexte global offline premium
├── hooks/offline/
│   ├── useOfflineClasses.ts           # Hook offline pour classes
│   ├── useOfflineStudents.ts          # Hook offline pour étudiants
│   └── useOfflineAttendance.ts        # Hook offline pour présences
└── components/offline/
    └── OfflineWarningBanner.tsx       # Composant d'avertissement visuel
```

### Backend
```
server/routes.ts
├── POST /api/classes               # Retourne { class: { id, ... } }
├── POST /api/director/students     # Retourne { student: { id, ... } }
└── POST /api/director/attendance   # Retourne { attendance: { id, ... } }
```

## 🔄 Flux de synchronisation

### Création offline → Synchronisation
1. **Offline**: Créer entité avec `tempId` (timestamp)
2. **Stockage**: Enregistrer dans IndexedDB avec `syncStatus: 'pending'`
3. **Queue**: Ajouter à `syncQueue` avec `tempId`
4. **Online**: Synchroniser avec serveur
5. **Réponse**: Extraire `realId` de la réponse
6. **Mise à jour**: 
   - Remplacer `tempId` par `realId` dans IndexedDB
   - Mettre à jour toutes les entrées pending dans la queue
   - Marquer comme `syncStatus: 'synced'`

### Modification offline → Synchronisation
1. **Offline**: Modifier entité existante
2. **Stockage**: Mettre à jour dans IndexedDB avec `syncStatus: 'pending'`
3. **Queue**: Ajouter à `syncQueue` avec `entityId`
4. **Online**: Synchroniser avec serveur via PATCH
5. **Confirmation**: Marquer comme `syncStatus: 'synced'`

## 🧪 Tests manuels

### Test 1: Vérifier le contexte offline
1. Ouvrir DevTools > Console
2. Vérifier les logs: `[OFFLINE_PREMIUM] 📊 Metadata loaded`
3. Vérifier: `daysOffline`, `offlineMode`, `lastSync`

### Test 2: Simuler offline
1. DevTools > Network > Throttling > Offline
2. Créer une classe/étudiant/présence
3. Vérifier création dans IndexedDB: DevTools > Application > IndexedDB > EducafricOfflineDB
4. Vérifier entrée dans `syncQueue` avec `tempId`

### Test 3: Synchronisation au retour online
1. DevTools > Network > Throttling > No throttling (online)
2. Attendre synchronisation automatique (1 minute) ou déclencher manuellement
3. Vérifier logs: `[SYNC_QUEUE] ✅ Synced create on classes`
4. Vérifier mapping: `[SYNC_QUEUE] 🔄 Mapped temp ID xxx to real ID yyy`
5. Vérifier IndexedDB: `tempId` remplacé par `realId`

### Test 4: Avertissements progressifs
1. Ouvrir DevTools > Application > IndexedDB > EducafricOfflineDB > metadata
2. Modifier `lastServerSync`:
   - 4 jours: `Date.now() - (4 * 24 * 60 * 60 * 1000)`
   - 8 jours: `Date.now() - (8 * 24 * 60 * 60 * 1000)`
   - 15 jours: `Date.now() - (15 * 24 * 60 * 60 * 1000)`
3. Rafraîchir page
4. Vérifier bannière d'avertissement correspondante

### Test 5: Accès bloqué à 14 jours
1. Se connecter en tant que Director
2. Modifier `lastServerSync` à 15+ jours
3. Rafraîchir page
4. Vérifier: Bannière rouge "Accès Premium suspendu"
5. Vérifier: Accès bloqué si `canAccessPremium = false`

## 🐛 Debugging

### Vérifier metadata offline
```javascript
// Console DevTools
import { offlineDb } from './client/src/lib/offline/db.ts';
await offlineDb.metadata.toArray();
```

### Vérifier sync queue
```javascript
import { SyncQueueManager } from './client/src/lib/offline/syncQueue.ts';
await SyncQueueManager.getPending();
await SyncQueueManager.getPendingCount();
```

### Forcer synchronisation
```javascript
await SyncQueueManager.processQueue();
```

### Réinitialiser offline mode
```javascript
import { setLastServerSync, setOfflineMode } from './client/src/lib/offline/db.ts';
await setLastServerSync(Date.now());
await setOfflineMode('limited');
```

## ✅ Checklist de validation

- [ ] IndexedDB créée avec schema Dexie (tables: classes, students, attendance, syncQueue, metadata)
- [ ] OfflinePremiumProvider intégré dans App.tsx
- [ ] OfflineWarningBanner visible dans DirectorPage
- [ ] Création offline avec tempId → realId mapping fonctionne
- [ ] Modification offline → synchronisation fonctionne
- [ ] Suppression offline → synchronisation fonctionne
- [ ] Bannière jaune (3-7 jours) s'affiche correctement
- [ ] Bannière rouge (7-14 jours) s'affiche avec countdown
- [ ] Accès bloqué (14+ jours) pour Directors/Parents
- [ ] Teachers/Students ont accès unlimited
- [ ] Sandbox accounts ont accès unlimited
- [ ] Synchronisation automatique toutes les 60 secondes
- [ ] Recalcul daysOffline toutes les 5 minutes
- [ ] Entrées pending préservées lors du fetch server

## 🔮 Fonctionnalités futures

### Phase 2 (non implémentée)
- [ ] Site Admin toggle pour unlimited mode par école
- [ ] Encryption AES-256 pour données sensibles offline
- [ ] Résolution de conflits avancée (last-write-wins vs merge)
- [ ] Support offline pour modules additionnels (Notes, Emploi du temps, etc.)
- [ ] Dashboard analytics offline/sync stats
- [ ] Progressive Web App installation prompt

## 📊 Métriques de performance

### Objectifs
- IndexedDB write: < 50ms
- Sync queue process: < 2s pour 100 items
- Metadata load: < 100ms
- Context provider render: < 50ms

### Monitoring
```javascript
// Mesurer performance sync
console.time('sync_process');
await SyncQueueManager.processQueue();
console.timeEnd('sync_process');
```

## 🚨 Erreurs communes

### "Cannot read property 'id' of undefined"
**Cause**: Response backend ne contient pas `class.id`, `student.id`, ou `attendance.id`
**Solution**: Vérifier format de réponse backend dans SyncQueueManager

### "syncStatus is not defined"
**Cause**: Anciens records IndexedDB sans champ `syncStatus`
**Solution**: Vider IndexedDB ou migrer données

### "Pending items not syncing"
**Cause**: Offline ou erreur réseau
**Solution**: Vérifier `navigator.onLine` et logs console

### "Warning banner not showing"
**Cause**: `daysOffline` non recalculé
**Solution**: Attendre 5 minutes ou rafraîchir page avec focus

---

**Créé le**: 2025-01-XX  
**Dernière mise à jour**: 2025-01-XX  
**Version**: 1.0.0
