import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.educafric.app',
  appName: 'EDUCAFRIC',
  webDir: 'dist/public',
  server: {
    // Production: charge depuis le serveur distant
    url: 'https://educafric.com',
    androidScheme: 'https',
    cleartext: false,
    // Pour le développement local, décommenter ci-dessous:
    // url: 'http://localhost:5000',
    // cleartext: true,
  },
  android: {
    allowMixedContent: false,
    useLegacyBridge: false,
    webContentsDebuggingEnabled: false, // Mettre à true pour debug
    backgroundColor: '#7C5CFC', // Thème violet Educafric
    // User-Agent pour détection côté serveur (blocage Commercial/SiteAdmin)
    overrideUserAgent: 'EducafricApp/1.0.0 Capacitor Android',
    buildOptions: {
      keystorePath: undefined,
      keystoreAlias: undefined,
      releaseType: 'APK', // APK pour distribution directe, AAB pour Play Store
      signingType: 'apksigner'
    }
  },
  plugins: {
    Camera: {
      permissions: {
        camera: "Pour prendre des photos de profil et documents éducatifs",
        photos: "Pour accéder à la galerie photo et importer des documents"
      }
    },
    Geolocation: {
      permissions: {
        location: "Pour la sécurité des étudiants, suivi de présence et géolocalisation en temps réel"
      }
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
      permissions: {
        notification: "Pour recevoir les notifications importantes de l'école, messages et alertes"
      }
    },
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: "#7C5CFC", // Thème violet
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: true,
      spinnerColor: "#FFFFFF",
      splashFullScreen: true,
      splashImmersive: true
    },
    Keyboard: {
      resize: "body",
      style: "dark",
      resizeOnFullScreen: true
    },
    StatusBar: {
      style: "light", // Texte blanc sur fond violet
      backgroundColor: "#7C5CFC"
    },
    // Configuration cookies pour sessions
    CapacitorCookies: {
      enabled: true
    },
    CapacitorHttp: {
      enabled: true
    }
  }
};

export default config;
