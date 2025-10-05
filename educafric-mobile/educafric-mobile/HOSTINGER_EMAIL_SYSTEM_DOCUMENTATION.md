# 📧 DOCUMENTATION SYSTÈME EMAIL HOSTINGER - EDUCAFRIC

## ⚠️ CONFIGURATION CRITIQUE - NE PAS MODIFIER

### Configuration SMTP Hostinger (PERMANENTE)

```typescript
// server/services/hostingerMailService.ts
const config = {
  host: 'smtp.hostinger.com',
  port: 465,
  secure: true, // SSL/TLS pour port 465
  auth: {
    user: 'no-reply@educafric.com',
    pass: 'Douala12-educonnect12'
  }
}
```

**🚨 IMPORTANT :** Les emails fonctionnent via **HOSTINGER SMTP**, PAS SendGrid !

## 🎯 Services Email Automatiques

### 1. Email de Bienvenue Écoles

**Service :** `welcomeEmailService.sendSchoolWelcomeEmail()`

**Déclencheur :** Automatique lors de l'inscription/abonnement d'une école

**Contenu :**
- Message de félicitations personnalisé
- Détails de l'abonnement (nom école, plan, date)
- Guide des premiers pas (5 étapes)
- Informations de support complet
- Formation gratuite disponible

**Email type envoyé à :**
```
À: admin@nouvelle-ecole.cm
Sujet: 🎉 Bienvenue dans EDUCAFRIC - École Nom
```

### 2. Email de Bienvenue Utilisateurs

**Service :** `welcomeEmailService.sendUserWelcomeEmail()`

**Déclencheur :** Création de compte enseignant/parent/etc.

**Contenu :**
- Bienvenue personnalisé avec nom et rôle
- Lien vers tableau de bord
- Informations de support

### 3. Notification Admin Interne

**Service :** Automatique après chaque inscription école

**Envoyé à :** `admin@educafric.com`

**Contenu :**
- Nouvelle école inscrite
- Détails administrateur
- Plan d'abonnement
- Confirmation envoi email bienvenue

## 🔧 Intégration dans le Code

### Dans server/routes.ts

```typescript
import { welcomeEmailService } from "./services/welcomeEmailService";

// Lors de l'inscription d'une école
app.post("/api/auth/register", async (req, res) => {
  // ... création du compte ...
  
  // ENVOI EMAIL DE BIENVENUE AUTOMATIQUE
  if (newUser.role === 'Director' || newUser.role === 'Admin') {
    await welcomeEmailService.sendSchoolWelcomeEmail({
      schoolName: req.body.schoolName || 'École',
      adminName: `${newUser.firstName} ${newUser.lastName}`,
      adminEmail: newUser.email,
      subscriptionPlan: newUser.subscriptionPlan || 'Plan Gratuit',
      registrationDate: new Date().toLocaleDateString('fr-FR')
    });
  }
});
```

### Dans les routes de paiement

```typescript
// Après paiement réussi
app.post("/api/stripe/webhook", async (req, res) => {
  // ... traitement paiement ...
  
  // EMAIL DE BIENVENUE APRÈS PAIEMENT
  await welcomeEmailService.sendSchoolWelcomeEmail({
    schoolName: subscription.schoolName,
    adminName: user.name,
    adminEmail: user.email,
    subscriptionPlan: subscription.planName,
    registrationDate: new Date().toLocaleDateString('fr-FR')
  });
});
```

## 📞 Informations de Support (Dans tous les emails)

- **Email :** info@educafric.com
- **Téléphone :** +237 656 200 472
- **WhatsApp :** +237 656 200 472
- **Support technique :** Disponible 24h/7j

## 🔍 Débogage et Logs

### Logs à surveiller :
```
[WELCOME_EMAIL] 🏫 Sending welcome email to new school: École Nom
[WELCOME_EMAIL] ✅ Welcome email sent successfully to admin@ecole.cm
[HOSTINGER_MAIL] ✅ Email sent successfully!
[HOSTINGER_MAIL] Message ID: <message-id>
```

### En cas d'erreur :
```
[WELCOME_EMAIL] ❌ Failed to send welcome email to admin@ecole.cm
[HOSTINGER_MAIL] ❌ SMTP connection failed
```

## 🚀 Test Manuel

### Tester le service :
```javascript
// Dans la console Node.js ou script de test
const { welcomeEmailService } = require('./server/services/welcomeEmailService');

await welcomeEmailService.sendSchoolWelcomeEmail({
  schoolName: "École Test Bilingue",
  adminName: "Marie Nkomo",  
  adminEmail: "test@exemple.cm",
  subscriptionPlan: "Plan École Premium",
  registrationDate: "30/01/2025"
});
```

## ⚡ Actions Automatiques Configurées

1. **Inscription école** → Email bienvenue automatique
2. **Paiement réussi** → Email bienvenue avec détails abonnement  
3. **Création utilisateur** → Email bienvenue personnalisé
4. **Chaque email** → Notification admin interne

## 🔄 Maintenance

### À vérifier régulièrement :
- [ ] Logs SMTP Hostinger fonctionnels
- [ ] Taux de livraison des emails
- [ ] Responses des nouveaux utilisateurs
- [ ] Notifications admin reçues

### Ne jamais modifier :
- Configuration SMTP Hostinger
- Mots de passe email
- Templates HTML (sans test)
- Service d'envoi automatique

---

**📝 Note :** Cette documentation doit être mise à jour à chaque modification du système email. Le système Hostinger est opérationnel et testé avec succès.

**Dernière mise à jour :** 30 janvier 2025 - 03:30 AM
**Statut :** ✅ OPÉRATIONNEL via Hostinger SMTP