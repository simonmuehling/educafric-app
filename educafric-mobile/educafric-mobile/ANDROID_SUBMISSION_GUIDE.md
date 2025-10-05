# Guide de Soumission Android - EDUCAFRIC

## 📱 Configuration Capacitor (Web-to-Mobile)

### 1. Installation des dépendances

```bash
# Installer Capacitor CLI
npm install -g @capacitor/cli

# Installer les dépendances Capacitor
npm install @capacitor/core @capacitor/android @capacitor/camera @capacitor/geolocation @capacitor/push-notifications
```

### 2. Configuration du projet

```bash
# Initialiser Capacitor dans le projet existant
npx cap init EDUCAFRIC com.muehlingsolutions.educafric

# Ajouter la plateforme Android
npx cap add android

# Construire le projet web
npm run build

# Synchroniser avec Android
npx cap sync android
```

## 🔧 Étapes de Build Android

### Étape 1: Assets et Icônes

```bash
# ✅ ICÔNES EDUCAFRIC DÉJÀ CONFIGURÉES
# Tous les variants Android automatiquement générés:
# - mipmap-mdpi/ic_launcher.png (48x48)
# - mipmap-hdpi/ic_launcher.png (72x72)
# - mipmap-xhdpi/ic_launcher.png (96x96)
# - mipmap-xxhdpi/ic_launcher.png (144x144)
# - mipmap-xxxhdpi/ic_launcher.png (192x192)
# Logo Educafric appliqué à tous les variants
```

### Étape 2: Configuration du Build

```bash
# Build avec Capacitor
npm run build
npx cap sync android

# Ouvrir dans Android Studio
npx cap open android

# Ou build via CLI
cd android && ./gradlew assembleDebug
cd android && ./gradlew bundleRelease
```

### Étape 3: Signature et Keystore

```bash
# Générer le keystore de signature
keytool -genkey -v -keystore educafric-release-key.keystore -alias educafric -keyalg RSA -keysize 2048 -validity 10000

# Configurer gradle.properties
echo "MYAPP_UPLOAD_STORE_FILE=educafric-release-key.keystore" >> android/gradle.properties
echo "MYAPP_UPLOAD_KEY_ALIAS=educafric" >> android/gradle.properties
echo "MYAPP_UPLOAD_STORE_PASSWORD=YOUR_STORE_PASSWORD" >> android/gradle.properties
echo "MYAPP_UPLOAD_KEY_PASSWORD=YOUR_KEY_PASSWORD" >> android/gradle.properties
```

## 🏪 Google Play Console

### 1. Compte Développeur
- Créer compte Google Play Developer (25$ une fois)
- Vérifier l'identité et les informations de paiement

### 2. Informations Requises

#### Description de l'App
**Français:**
```
EDUCAFRIC - Plateforme Éducative Africaine

Révolutionnez l'éducation en Afrique avec EDUCAFRIC, la plateforme complète pour écoles, enseignants, parents et étudiants.

🎓 FONCTIONNALITÉS PRINCIPALES:
• Gestion complète des établissements scolaires
• Emplois du temps intelligents et flexibles  
• Système de notes et bulletins numériques
• Communication école-parents en temps réel
• Géolocalisation de sécurité pour étudiants
• Paiements CFA et mobile money intégrés
• Support multilingue (Français/Anglais)

🌍 OPTIMISÉ POUR L'AFRIQUE:
• Compatible avec les réseaux mobiles africains
• Support Orange Money et MTN Mobile Money
• Interface adaptée aux contextes éducatifs locaux
• Fonctionnement hors ligne partiel

👥 POUR QUI:
• Directeurs d'écoles et administrateurs
• Enseignants et professeurs
• Parents d'élèves
• Étudiants de tous niveaux
• Répétiteurs et tuteurs privés

🔒 SÉCURITÉ ET CONFIDENTIALITÉ:
• Données chiffrées et sécurisées
• Authentification à deux facteurs
• Respect RGPD et réglementations africaines
• Contrôle parental avancé

Transformez votre expérience éducative avec EDUCAFRIC!
```

**English:**
```
EDUCAFRIC - African Educational Platform

Revolutionize education in Africa with EDUCAFRIC, the comprehensive platform for schools, teachers, parents and students.

🎓 KEY FEATURES:
• Complete school management system
• Smart and flexible timetables
• Digital grades and report cards
• Real-time school-parent communication
• Student safety geolocation
• CFA and mobile money payments
• Multilingual support (French/English)

🌍 OPTIMIZED FOR AFRICA:
• Compatible with African mobile networks
• Orange Money and MTN Mobile Money support
• Interface adapted to local educational contexts
• Partial offline functionality

👥 FOR WHOM:
• School directors and administrators
• Teachers and professors
• Parents
• Students of all levels
• Private tutors and freelancers

🔒 SECURITY AND PRIVACY:
• Encrypted and secure data
• Two-factor authentication
• GDPR and African regulations compliance
• Advanced parental controls

Transform your educational experience with EDUCAFRIC!
```

#### Captures d'écran requises:
- 2-8 captures d'écran pour téléphones (16:9, 1080x1920)
- 1-8 captures d'écran pour tablettes (optionnel)
- Icône d'application haute résolution (512x512)

#### Classification du contenu:
- **Catégorie**: Éducation
- **Public cible**: Tout public (avec supervision parentale)
- **Classification**: E pour Tous

### 3. Politique de Confidentialité

URL requise: `https://www.educafric.com/privacy-policy`

### 4. Coordonnées du Développeur

```
Nom: AFRO METAVERSE MARKETING SARL
Email: info@educafric.com
Téléphone: +237 656 200 472
Adresse: Cameroun
Site web: https://www.educafric.com
```

## 🚀 Processus de Soumission

### 1. Upload de l'AAB/APK
```bash
# Via EAS (recommandé)
eas submit --platform android

# Ou manuellement via Google Play Console
```

### 2. Test interne
- Ajouter des testeurs internes
- Déployer sur le track "internal testing"
- Valider toutes les fonctionnalités

### 3. Révision et Publication
- Soumettre pour révision Google Play
- Attendre l'approbation (1-3 jours)
- Publier sur le track "production"

## 📋 Checklist Pré-soumission

- [ ] App.json configuré avec toutes les métadonnées
- [ ] Icônes et splash screen créés
- [ ] Politique de confidentialité publiée
- [ ] AAB signé généré
- [ ] Tests sur appareils Android réels
- [ ] Descriptions traduites (FR/EN)
- [ ] Captures d'écran préparées
- [ ] Classification de contenu complétée
- [ ] Compte Google Play Developer créé

## 🔧 Commandes Utiles

```bash
# Prévisualiser l'app
npx cap run android --livereload

# Build pour test
npm run build && npx cap sync android
cd android && ./gradlew assembleDebug

# Build pour production
npm run build && npx cap sync android
cd android && ./gradlew bundleRelease

# Ouvrir dans Android Studio
npx cap open android

# Debug en direct
npx cap run android --live-reload --external
```

## 📱 Test sur Appareils

1. **Émulateur Android Studio**:
```bash
# Lancer l'émulateur
~/Android/Sdk/emulator/emulator -avd [AVD_NAME]

# Installer l'APK
adb install app-release.apk
```

2. **Appareil physique**:
- Activer le mode développeur
- Activer le débogage USB
- Installer via ADB ou transfert de fichier

## 🌍 Spécificités Africaines

### Optimisations réseau:
- Compression des images
- Cache intelligent
- Mode hors ligne

### Paiements mobiles:
- Orange Money (Cameroun, Sénégal, Mali...)
- MTN Mobile Money (Cameroun, Ghana, Uganda...)
- Airtel Money (Kenya, Tanzania, Rwanda...)

### Langues supportées:
- Français (principal)
- Anglais (secondaire)
- Extensions futures: Wolof, Swahili, etc.

---

**Contact Support**: simon@educafric.com
**Documentation**: https://docs.educafric.com