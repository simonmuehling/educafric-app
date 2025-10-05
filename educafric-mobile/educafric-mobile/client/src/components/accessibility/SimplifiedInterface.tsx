import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Eye, 
  Ear, 
  Accessibility, 
  Type, 
  Mouse, 
  Volume2,
  Contrast,
  Zap,
  Heart,
  Settings,
  HelpCircle,
  Phone,
  MessageSquare,
  ArrowRight,
  CheckCircle,
  Sparkles
} from 'lucide-react';

interface AccessibilitySettings {
  fontSize: 'small' | 'medium' | 'large' | 'xl';
  contrast: 'normal' | 'high' | 'inverted';
  audioSupport: boolean;
  simplifiedLayout: boolean;
  largeButtons: boolean;
  tooltipMode: boolean;
  slowAnimations: boolean;
}

interface SimplifiedInterfaceProps {
  className?: string;
  enabledFeatures?: string[];
}

const SimplifiedInterface: React.FC<SimplifiedInterfaceProps> = ({ 
  className = '',
  enabledFeatures = ['all']
}) => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const [settings, setSettings] = useState<AccessibilitySettings>({
    fontSize: 'medium',
    contrast: 'normal',
    audioSupport: false,
    simplifiedLayout: false,
    largeButtons: false,
    tooltipMode: true,
    slowAnimations: false
  });
  const [isSimpleMode, setIsSimpleMode] = useState(false);
  const [showSetup, setShowSetup] = useState(false);

  const text = {
    fr: {
      title: 'Interface Simplifiée - Accessible à Tous',
      subtitle: 'Une expérience Educafric adaptée à tous les niveaux techniques et besoins d\'accessibilité',
      
      simpleMode: {
        title: 'Mode Simple Activé',
        description: 'Interface épurée avec les fonctions essentielles',
        enable: 'Activer le Mode Simple',
        disable: 'Désactiver le Mode Simple'
      },
      
      accessibility: {
        title: 'Paramètres d\'Accessibilité',
        fontSize: 'Taille du Texte',
        contrast: 'Contraste',
        audioSupport: 'Support Audio',
        simplifiedLayout: 'Mise en Page Simplifiée',
        largeButtons: 'Gros Boutons',
        tooltipMode: 'Aide Contextuelle',
        slowAnimations: 'Animations Lentes'
      },
      
      features: {
        largeText: {
          title: 'Texte Agrandie',
          description: 'Texte plus lisible pour tous les âges'
        },
        voiceGuide: {
          title: 'Guide Vocal',
          description: 'Instructions parlées pour navigation'
        },
        simpleNavigation: {
          title: 'Navigation Simple',
          description: 'Menus clairs avec moins d\'options'
        },
        helpSupport: {
          title: 'Support Intégré',
          description: 'Aide WhatsApp et téléphone directe'
        }
      },
      
      quickActions: {
        title: 'Actions Rapides',
        viewGrades: 'Voir Notes',
        sendMessage: 'Envoyer Message',
        checkAttendance: 'Voir Présence',
        callHelp: 'Appeler Aide',
        whatsappHelp: 'Aide WhatsApp'
      },
      
      setup: {
        title: 'Configuration Rapide',
        question: 'Préférez-vous une interface simplifiée ?',
        yes: 'Oui, Simplifier',
        no: 'Non, Interface Complète',
        description: 'Nous pouvons adapter Educafric à vos préférences'
      }
    },
    
    en: {
      title: 'Simplified Interface - Accessible to All',
      subtitle: 'An Educafric experience adapted to all technical levels and accessibility needs',
      
      simpleMode: {
        title: 'Simple Mode Enabled',
        description: 'Clean interface with essential functions',
        enable: 'Enable Simple Mode',
        disable: 'Disable Simple Mode'
      },
      
      accessibility: {
        title: 'Accessibility Settings',
        fontSize: 'Text Size',
        contrast: 'Contrast',
        audioSupport: 'Audio Support',
        simplifiedLayout: 'Simplified Layout',
        largeButtons: 'Large Buttons',
        tooltipMode: 'Contextual Help',
        slowAnimations: 'Slow Animations'
      },
      
      features: {
        largeText: {
          title: 'Large Text',
          description: 'More readable text for all ages'
        },
        voiceGuide: {
          title: 'Voice Guide',
          description: 'Spoken instructions for navigation'
        },
        simpleNavigation: {
          title: 'Simple Navigation',
          description: 'Clear menus with fewer options'
        },
        helpSupport: {
          title: 'Integrated Support',
          description: 'Direct WhatsApp and phone help'
        }
      },
      
      quickActions: {
        title: 'Quick Actions',
        viewGrades: 'View Grades',
        sendMessage: 'Send Message',
        checkAttendance: 'Check Attendance',
        callHelp: 'Call Help',
        whatsappHelp: 'WhatsApp Help'
      },
      
      setup: {
        title: 'Quick Setup',
        question: 'Would you prefer a simplified interface?',
        yes: 'Yes, Simplify',
        no: 'No, Full Interface',
        description: 'We can adapt Educafric to your preferences'
      }
    }
  };

  const t = text[language as keyof typeof text];

  // Apply accessibility settings to the interface
  useEffect(() => {
    const root = document.documentElement;
    
    // Font size
    const fontSizeMap = {
      small: '14px',
      medium: '16px',
      large: '20px',
      xl: '24px'
    };
    root.style.setProperty('--base-font-size', fontSizeMap[settings.fontSize]);
    
    // Contrast
    if (settings.contrast === 'high') {
      root.classList.add('high-contrast');
    } else if (settings.contrast === 'inverted') {
      root.classList.add('inverted-colors');
    } else {
      root.classList.remove('high-contrast', 'inverted-colors');
    }
    
    // Animations
    if (settings.slowAnimations) {
      root.style.setProperty('--animation-speed', '0.5s');
    } else {
      root.style.setProperty('--animation-speed', '0.2s');
    }
  }, [settings]);

  const updateSetting = <K extends keyof AccessibilitySettings>(
    key: K,
    value: AccessibilitySettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const speakText = (text: string) => {
    if (settings.audioSupport && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'fr' ? 'fr-FR' : 'en-US';
      speechSynthesis.speak(utterance);
    }
  };

  const handleQuickAction = (action: string, label: string) => {
    speakText(label);
    // Handle the specific action
    console.log(`Quick action: ${action}`);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <Card className="bg-gradient-to-r from-purple-500 to-blue-500 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-3 mb-2">
                <Accessibility className="w-8 h-8" />
                {t.title}
              </h2>
              <p className="text-purple-100 text-lg">{t.subtitle}</p>
            </div>
            <Button 
              onClick={() => setShowSetup(true)}
              className="bg-white text-purple-600 hover:bg-purple-50"
              size="lg"
            >
              <Settings className="w-5 h-5 mr-2" />
              {language === 'fr' ? 'Configurer' : 'Configure'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Simple Mode Toggle */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-full ${
                isSimpleMode ? 'bg-green-100' : 'bg-gray-100'
              }`}>
                <Zap className={`w-6 h-6 ${
                  isSimpleMode ? 'text-green-600' : 'text-gray-600'
                }`} />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {t.simpleMode.title}
                </h3>
                <p className="text-gray-600">
                  {t.simpleMode.description}
                </p>
              </div>
            </div>
            <Button
              onClick={() => {
                setIsSimpleMode(!isSimpleMode);
                speakText(isSimpleMode ? t.simpleMode.disable : t.simpleMode.enable);
              }}
              variant={isSimpleMode ? "destructive" : "default"}
              size="lg"
              className="px-8"
            >
              {isSimpleMode ? t.simpleMode.disable : t.simpleMode.enable}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Accessibility Features */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6 text-center">
            <div className="p-4 bg-blue-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Type className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">
              {t.features.largeText.title}
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              {t.features.largeText.description}
            </p>
            <div className="flex items-center justify-center gap-2">
              {(['small', 'medium', 'large', 'xl'] as const).map(size => (
                <Button
                  key={size}
                  variant={settings.fontSize === size ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    updateSetting('fontSize', size);
                    speakText(`${t.accessibility.fontSize} ${size}`);
                  }}
                  className="w-8 h-8 p-0"
                >
                  A
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6 text-center">
            <div className="p-4 bg-green-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Volume2 className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">
              {t.features.voiceGuide.title}
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              {t.features.voiceGuide.description}
            </p>
            <Button
              onClick={() => {
                updateSetting('audioSupport', !settings.audioSupport);
                speakText(settings.audioSupport ? 'Audio désactivé' : 'Audio activé');
              }}
              variant={settings.audioSupport ? "default" : "outline"}
              size="sm"
            >
              {settings.audioSupport ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6 text-center">
            <div className="p-4 bg-purple-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Mouse className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">
              {t.features.simpleNavigation.title}
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              {t.features.simpleNavigation.description}
            </p>
            <Button
              onClick={() => {
                updateSetting('simplifiedLayout', !settings.simplifiedLayout);
                speakText(t.features.simpleNavigation.title);
              }}
              variant={settings.simplifiedLayout ? "default" : "outline"}
              size="sm"
            >
              {settings.simplifiedLayout ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6 text-center">
            <div className="p-4 bg-orange-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <HelpCircle className="w-8 h-8 text-orange-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">
              {t.features.helpSupport.title}
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              {t.features.helpSupport.description}
            </p>
            <div className="flex gap-2 justify-center">
              <Button
                onClick={() => handleQuickAction('phone', t.quickActions.callHelp)}
                variant="outline"
                size="sm"
              >
                <Phone className="w-4 h-4" />
              </Button>
              <Button
                onClick={() => handleQuickAction('whatsapp', t.quickActions.whatsappHelp)}
                variant="outline"
                size="sm"
              >
                <MessageSquare className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions for Simple Mode */}
      {isSimpleMode && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-6 h-6 text-red-500" />
              {t.quickActions.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {[
                { key: 'grades', label: t.quickActions.viewGrades, icon: Eye },
                { key: 'message', label: t.quickActions.sendMessage, icon: MessageSquare },
                { key: 'attendance', label: t.quickActions.checkAttendance, icon: CheckCircle },
                { key: 'help', label: t.quickActions.callHelp, icon: Phone },
                { key: 'whatsapp', label: t.quickActions.whatsappHelp, icon: MessageSquare }
              ].map(action => {
                const IconComponent = action.icon;
                return (
                  <Button
                    key={action.key}
                    onClick={() => handleQuickAction(action.key, action.label)}
                    variant="outline"
                    className={`h-20 flex flex-col gap-2 text-center ${
                      settings.largeButtons ? 'text-lg p-6' : ''
                    }`}
                    onMouseEnter={() => settings.tooltipMode && speakText(action.label)}
                  >
                    <IconComponent className={`${settings.largeButtons ? 'w-8 h-8' : 'w-6 h-6'}`} />
                    <span className="text-xs">{action.label}</span>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Setup Modal */}
      {showSetup && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg bg-white">
            <CardHeader>
              <CardTitle className="text-center">{t.setup.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <p className="text-lg mb-4">{t.setup.question}</p>
                <p className="text-gray-600 text-sm mb-6">{t.setup.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button
                  onClick={() => {
                    setIsSimpleMode(true);
                    updateSetting('largeButtons', true);
                    updateSetting('simplifiedLayout', true);
                    updateSetting('fontSize', 'large');
                    setShowSetup(false);
                    speakText('Interface simplifiée activée');
                  }}
                  className="h-20 flex flex-col gap-2 bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="w-8 h-8" />
                  {t.setup.yes}
                </Button>

                <Button
                  onClick={() => {
                    setIsSimpleMode(false);
                    setShowSetup(false);
                    speakText('Interface complète maintenue');
                  }}
                  variant="outline"
                  className="h-20 flex flex-col gap-2"
                >
                  <Settings className="w-8 h-8" />
                  {t.setup.no}
                </Button>
              </div>

              <div className="text-center">
                <Button
                  variant="ghost"
                  onClick={() => setShowSetup(false)}
                  className="text-gray-500"
                >
                  {language === 'fr' ? 'Fermer' : 'Close'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default SimplifiedInterface;