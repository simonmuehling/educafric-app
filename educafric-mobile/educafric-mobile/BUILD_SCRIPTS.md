# Scripts de Build Android - EDUCAFRIC

## 🔧 Installation Capacitor

```bash
# Installer globalement
npm install -g @capacitor/cli

# Dans le projet
npm install @capacitor/core @capacitor/android @capacitor/camera @capacitor/geolocation @capacitor/push-notifications
```

## 📱 Commandes de Build

### 1. Initialisation
```bash
# Initialiser Capacitor
npx cap init EDUCAFRIC com.muehlingsolutions.educafric

# Ajouter Android
npx cap add android
```

### 2. Builds de Développement
```bash
# Build web + sync Android
npm run build
npx cap sync android

# Ouvrir dans Android Studio
npx cap open android
```

### 3. Build de Production
```bash
# Build web optimisé
npm run build
npx cap sync android

# Android App Bundle (recommandé pour Google Play)
cd android && ./gradlew bundleRelease

# APK de production
cd android && ./gradlew assembleRelease
```

### 4. Tests et Debug
```bash
# Lancer sur émulateur
npx cap run android

# Voir les logs en direct
npx cap run android --live-reload --external

# Debug web dans l'app
chrome://inspect/#devices

# Logs Android
adb logcat | grep -i capacitor
```

## 🎯 Tests et Validation

### Émulateur Android Studio
```bash
# Lancer émulateur
~/Android/Sdk/emulator/emulator -avd Pixel_4_API_30

# Installer APK
adb install ~/Downloads/educafric-build.apk
```

### Appareil physique
```bash
# Activer débogage USB et installer
adb install educafric-build.apk

# Voir les logs
adb logcat | grep -i educafric
```

## 📊 Métriques de Build

### Taille d'application cible:
- APK: < 50MB
- AAB: < 100MB après compression

### Compatibilité:
- Android 5.0+ (API 21+)
- Architecture: ARM64, ARM32, x86_64

### Performance:
- Temps de démarrage: < 3s
- Consommation mémoire: < 200MB
- Consommation batterie: Optimisée

## 🌍 Optimisations Africaines

### Réseau:
- Cache agressif
- Compression images
- Mode hors ligne

### Stockage:
- SQLite local
- Synchronisation différée
- Nettoyage automatique

### Localisation:
- Français par défaut
- Anglais secondaire
- RTL future (Arabe)

---

**Prochaines étapes**: Générer les builds et tester sur appareils réels