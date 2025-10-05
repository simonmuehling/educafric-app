import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.muehlingsolutions.educafric',
  appName: 'EDUCAFRIC',
  webDir: 'dist/public',
  server: {
    androidScheme: 'https',
    cleartext: true,
    hostname: 'educafric.app'
  },
  android: {
    allowMixedContent: true,
    useLegacyBridge: false,
    webContentsDebuggingEnabled: true,
    backgroundColor: '#0079F2',
    overrideUserAgent: 'EDUCAFRIC-Android-v4.2.1',
    buildOptions: {
      keystorePath: undefined,
      keystoreAlias: undefined,
      releaseType: 'AAB',
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
      backgroundColor: "#0079F2",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true
    },
    Keyboard: {
      resize: "body",
      style: "dark",
      resizeOnFullScreen: true
    },
    StatusBar: {
      style: "dark",
      backgroundColor: "#0079F2"
    }
  }
};

export default config;
