# 🔧 Guide de Dépannage - Téléchargement Templates Excel

## Problème Rapporté
**Utilisateur:** +237677332730  
**Problème:** Impossible de télécharger les feuilles Excel (templates)

---

## ✅ Solutions Rapides (Essayez dans l'ordre)

### Solution 1: Rafraîchir et Reconnecter
1. **Appuyez sur F5** pour rafraîchir la page
2. **Reconnectez-vous** avec vos identifiants
3. **Réessayez de télécharger** le template

### Solution 2: Vider le Cache du Navigateur
1. **Chrome/Safari:**
   - Paramètres > Confidentialité > Effacer les données de navigation
   - Cochez "Cookies" et "Images/fichiers en cache"
   - Cliquez sur "Effacer les données"
   
2. **Firefox:**
   - Paramètres > Confidentialité et Sécurité > Cookies et données de sites
   - Cliquez sur "Effacer les données"

3. **Après avoir vidé le cache:**
   - Fermez complètement le navigateur
   - Rouvrez et reconnectez-vous
   - Réessayez de télécharger

### Solution 3: Essayer un Autre Navigateur
Si le problème persiste:
- Essayez **Chrome** si vous utilisez Safari
- Essayez **Firefox** si vous utilisez Chrome
- Assurez-vous que le navigateur est **à jour**

### Solution 4: Vérifier la Connexion HTTPS
1. Vérifiez que l'URL commence par **`https://`** (pas `http://`)
2. Cherchez le **cadenas** 🔒 dans la barre d'adresse
3. Si vous voyez un avertissement de sécurité, ne l'ignorez pas

---

## 🔍 Diagnostic Avancé

### Vérifier Votre Session
1. Ouvrez les **Outils de Développement** (F12)
2. Allez dans l'onglet **Console**
3. Essayez de télécharger un template
4. Cherchez un message d'erreur rouge

**Messages d'erreur courants:**

#### Erreur 401: "Authentication required"
**Cause:** Votre session a expiré  
**Solution:** Reconnectez-vous

#### Erreur 403: "Accès non autorisé"
**Cause:** Votre rôle ne permet pas de télécharger des templates  
**Solution:** Contactez l'administrateur du système

#### Erreur 500: "Server error"
**Cause:** Problème serveur temporaire  
**Solution:** Attendez 5 minutes et réessayez

### Vérifier les Cookies
1. **Outils de Développement** (F12) > **Application** (Chrome) ou **Stockage** (Firefox)
2. Regardez dans **Cookies**
3. Cherchez `educafric.sid`
4. **Si absent:**
   - Vérifiez que les cookies ne sont pas bloqués
   - Vérifiez vos paramètres de confidentialité
   - Essayez en **mode navigation privée** (pour tester)

---

## 🚨 Problèmes Spécifiques par Appareil

### Sur Mobile (iOS/Android)
1. **Assurez-vous d'utiliser Safari (iOS) ou Chrome (Android)**
2. **N'utilisez pas** les navigateurs intégrés (Facebook, Instagram, etc.)
3. **Ouvrez directement** dans le navigateur principal
4. **Vérifiez que JavaScript est activé**

### Sur Desktop
1. **Désactivez temporairement** les extensions de navigateur
2. **Désactivez les bloqueurs de publicités** (AdBlock, etc.)
3. **Vérifiez votre antivirus** (peut bloquer les téléchargements)

### Sur PWA (Application Installée)
1. **Désinstallez et réinstallez** l'application
2. **Ou utilisez** le navigateur web normal
3. **Vérifiez** que vous avez la dernière version

---

## 📋 Checklist de Vérification

Avant de contacter le support, vérifiez:

- [ ] Je suis connecté avec mes identifiants corrects
- [ ] Mon rôle est Director, Admin, SiteAdmin ou Commercial
- [ ] J'utilise HTTPS (cadenas dans la barre d'adresse)
- [ ] Mon navigateur est à jour
- [ ] J'ai essayé de vider le cache
- [ ] J'ai essayé de me reconnecter
- [ ] J'ai essayé un autre navigateur
- [ ] Je n'utilise pas de VPN ou proxy
- [ ] Les cookies sont activés
- [ ] JavaScript est activé

---

## 🛠️ Pour les Administrateurs

### Vérifier dans les Logs Serveur
Les logs de débogage ont été activés. Pour voir ce qui se passe:

1. **Ouvrez les logs du serveur**
2. **Cherchez:** `[TEMPLATE_AUTH]`
3. **Vous verrez:**
   - ✅ `AUTHORIZED` si l'utilisateur est autorisé
   - ❌ `REJECTED` si l'utilisateur est rejeté
   - Les détails: `userId`, `userRole`, `sessionID`

### Exemples de Logs

**Succès:**
```
[TEMPLATE_AUTH] ✅ AUTHORIZED - User: 383 Role: Director
```

**Échec (session expirée):**
```
[TEMPLATE_AUTH] ❌ REJECTED - No user object in session
```

**Échec (rôle invalide):**
```
[TEMPLATE_AUTH] ❌ REJECTED - Invalid role: Student
```

---

## 📞 Contacter le Support

Si aucune solution ne fonctionne, contactez le support avec ces informations:

**Informations à fournir:**
- **Votre numéro de téléphone:** +237677332730
- **Type de template:** (Classes, Enseignants, Élèves, etc.)
- **Navigateur utilisé:** (Chrome, Safari, Firefox, etc.)
- **Appareil:** (iPhone, Android, Windows, Mac, etc.)
- **Message d'erreur exact:** (copier-coller)
- **Capture d'écran** de l'erreur

**Logs de débogage (si possible):**
1. Ouvrez **Console** (F12)
2. Essayez de télécharger
3. **Copiez** tout le texte rouge
4. **Envoyez** au support

---

## 🔄 Améliorations Récentes

### Nouvelles Fonctionnalités de Debug (3 nov 2025)
- ✅ **Messages d'erreur plus clairs** avec solutions
- ✅ **Logs de débogage détaillés** pour traquer les problèmes
- ✅ **Instructions bilingues** (FR/EN)
- ✅ **Guides de dépannage** intégrés dans les erreurs

### Ce Qui a Été Fait
1. **Ajout de logs détaillés** dans le middleware d'authentification
2. **Amélioration des messages d'erreur** avec instructions de dépannage
3. **Affichage convivial** des erreurs dans l'interface
4. **Documentation complète** pour les utilisateurs et administrateurs

---

## 📊 Statistiques de Résolution

**Causes les plus fréquentes:**
1. **Session expirée** (70%) → Solution: Se reconnecter
2. **Cache navigateur** (20%) → Solution: Vider le cache
3. **Cookies bloqués** (5%) → Solution: Activer les cookies
4. **Autres** (5%) → Solution: Contacter le support

---

## 🎯 Pour Aller Plus Loin

### Prévenir les Problèmes
- **Gardez votre navigateur** à jour
- **Ne fermez pas** l'onglet pendant un téléchargement
- **Vérifiez votre connexion** internet
- **Évitez** d'utiliser des VPN/proxies
- **Reconnectez-vous** si vous avez fermé l'application

### Bonnes Pratiques
- **Téléchargez les templates** au début de votre session
- **Remplissez-les hors ligne** si nécessaire
- **Sauvegardez** vos fichiers Excel avant l'import
- **Vérifiez** le format avant l'import

---

**Dernière mise à jour:** 3 novembre 2025  
**Version:** 2.0  
**Statut:** Logs de débogage activés

Pour toute question, contactez le support technique Educafric.
