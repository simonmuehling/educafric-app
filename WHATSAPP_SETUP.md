# 📱 Configuration WhatsApp Business API - Educafric

## Vue d'ensemble

Les notifications d'absence sont maintenant envoyées **directement sur WhatsApp** des parents, sans besoin de lire un email. Ceci augmente considérablement le taux de lecture des alertes.

## 🎯 Avantages

✅ **Notifications instantanées** - Les parents reçoivent l'alerte directement sur WhatsApp  
✅ **Taux de lecture élevé** - 98% des messages WhatsApp sont lus dans les 3 minutes  
✅ **Pas besoin d'email** - Fonctionne même si les parents ne consultent pas leurs emails  
✅ **Automatique** - Envoi déclenché automatiquement lors du marquage d'absence  
✅ **Bilingue** - Supporte français et anglais automatiquement  

## 📋 Prérequis

1. **Compte Meta Business** (gratuit)
2. **Application Meta** (gratuite)
3. **WhatsApp Business API** (configuration)
4. **Numéro de téléphone** dédié pour WhatsApp Business

## 🔧 Étapes de Configuration

### 1. Créer un Compte Meta Business

1. Aller sur [business.facebook.com](https://business.facebook.com)
2. Cliquer sur "Créer un compte"
3. Remplir les informations de votre école
4. Vérifier votre compte avec un email ou numéro de téléphone

### 2. Créer une Application Meta

1. Aller sur [developers.facebook.com/apps](https://developers.facebook.com/apps)
2. Cliquer sur "Créer une app"
3. Sélectionner "Business" comme type d'app
4. Donner un nom à votre app (ex: "Educafric Notifications")
5. Associer à votre compte Business

### 3. Ajouter WhatsApp Business API

1. Dans le tableau de bord de votre app, cliquer sur "Ajouter un produit"
2. Chercher "WhatsApp" et cliquer sur "Configurer"
3. Suivre les instructions pour:
   - Ajouter un numéro de téléphone
   - Vérifier le numéro
   - Configurer le profil Business

### 4. Obtenir les Identifiants

Vous aurez besoin de 3 informations :

#### A. Access Token (Jeton d'accès)
- Dans "WhatsApp > Prise en main"
- Section "Jeton d'accès temporaire" ou "Jeton d'accès système"
- **Important**: Créer un jeton permanent pour la production

#### B. Phone Number ID
- Dans "WhatsApp > Prise en main"
- Section "De" ou "Phone Number ID"
- C'est l'ID du numéro WhatsApp Business

#### C. Business Account ID
- Dans les paramètres de l'app
- Section "WhatsApp Business Account ID"

### 5. Configurer les Variables d'Environnement

Dans Replit, ajouter ces secrets (Secrets tab) :

```bash
WHATSAPP_ACCESS_TOKEN=votre_token_ici
WHATSAPP_PHONE_NUMBER_ID=votre_phone_id_ici
WHATSAPP_BUSINESS_ACCOUNT_ID=votre_account_id_ici
```

### 6. Tester la Configuration

1. Aller sur `/test-whatsapp` dans votre app Educafric
2. Vérifier que le statut est "Connecté"
3. Envoyer un message de test
4. Vérifier la réception sur votre téléphone

## 📱 Configuration Parents

Pour recevoir les notifications WhatsApp, chaque parent doit :

1. **Activer WhatsApp** dans son profil Educafric
2. **Entrer son numéro** au format international : `+237XXXXXXXXX`
3. **Accepter les notifications** (opt-in obligatoire)

## 🔄 Flux de Notification

```
Enseignant marque absence
         ↓
Système détecte automatiquement
         ↓
Cherche les parents de l'élève
         ↓
Envoie message WhatsApp direct
         ↓
Parent reçoit notification instantanée
```

## 📨 Message Type

Les parents reçoivent :

```
⚠️ Absence Signalée - [Nom Élève]

Date: [Date]
Période: Journée
Motif: [Raison]

Total absences ce mois: [Nombre]

Merci de justifier cette absence via:
📱 App Educafric
📞 [Téléphone École]

École [Nom École]
```

## 💰 Coûts WhatsApp Business API

- **Gratuit**: 1 000 premières conversations/mois
- **Payant**: ~0,005 EUR par conversation au-delà
- **Conversation**: Fenêtre de 24h avec un contact
- **Estimation**: Pour 200 élèves avec 5 absences/mois = ~100 conversations/mois = **GRATUIT**

## 🛠️ Support Technique

Si vous rencontrez des problèmes :

1. **Vérifier les logs** : `/api/health` montre le statut WhatsApp
2. **Tester l'API** : `/test-whatsapp` pour diagnostiquer
3. **Support Meta** : [developers.facebook.com/support](https://developers.facebook.com/support)
4. **Support Educafric** : support@educafric.com

## ✅ Checklist Complète

- [ ] Compte Meta Business créé
- [ ] Application Meta configurée
- [ ] WhatsApp Business API activé
- [ ] Numéro de téléphone vérifié
- [ ] Access Token obtenu
- [ ] Phone Number ID obtenu
- [ ] Business Account ID obtenu
- [ ] Variables d'environnement configurées dans Replit
- [ ] Test de connexion réussi
- [ ] Parents configurés avec numéros WhatsApp
- [ ] Test d'envoi notification réussi

---

**Note**: La configuration initiale prend ~30 minutes. Une fois configuré, le système fonctionne automatiquement et indéfiniment.
