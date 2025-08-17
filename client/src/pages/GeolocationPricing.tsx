import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import FrontpageNavbar from '@/components/FrontpageNavbar';
import { 
  MapPin, 
  School, 
  Smartphone, 
  Shield, 
  AlertTriangle,
  Check,
  X,
  Phone,
  Mail,
  Globe
} from 'lucide-react';

export default function GeolocationPricing() {
  const { language } = useLanguage();

  const text = {
    fr: {
      title: 'Services de Géolocalisation',
      subtitle: 'Comparaison des Options',
      important: 'IMPORTANT : Il existe DEUX façons d\'accéder aux services de géolocalisation',
      
      tableHeaders: {
        aspect: 'Aspect',
        schoolRoute: '🏫 Via École Partenaire',
        directRoute: '📱 Abonnement Direct'
      },
      
      comparison: {
        schoolConnection: {
          label: 'Connexion scolaire',
          school: 'Obligatoire',
          direct: 'Optionnelle'
        },
        process: {
          label: 'Processus d\'inscription',
          school: '1. Connexion à l\'école\n2. Invitation enfant\n3. Abonnement géolocalisation',
          direct: '1. Abonnement géolocalisation\n2. Invitation enfant directe'
        },
        autonomy: {
          label: 'Autonomie',
          school: 'Dépendant de l\'école',
          direct: 'Totalement indépendant'
        },
        pricing: {
          label: 'Tarification',
          school: 'École + Géolocalisation',
          direct: 'Géolocalisation uniquement'
        },
        invitation: {
          label: 'Système d\'invitation',
          school: 'Même système',
          direct: 'Même système'
        }
      },
      
      option1: {
        title: 'OPTION 1 : VIA ÉCOLE PARTENAIRE',
        steps: [
          'Le parent se connecte d\'abord à une école partenaire',
          'Il invite ses enfants via cette connexion scolaire',
          'La géolocalisation devient un service premium additionnel'
        ]
      },
      
      option2: {
        title: 'OPTION 2 : ABONNEMENT DIRECT',
        steps: [
          'Le parent s\'abonne directement au service de géolocalisation',
          'Il invite ses enfants immédiatement',
          'Aucune connexion scolaire requise'
        ]
      },
      
      pricing: {
        title: 'TARIF PARENT',
        monthly: '1 000 CFA/mois',
        yearly: '12 000 CFA/an',
        description: 'Suivi temps réel + Alertes SMS + Zones sécurisées'
      },
      
      features: {
        title: 'Fonctionnalités complètes disponibles dans les deux cas :',
        list: [
          'Suivi en temps réel des enfants avec cartes interactives',
          'Configuration des zones de sécurité (École, Maison, Bibliothèque)',
          'Gestion multi-appareils (smartphone, smartwatch, tablette scolaire)',
          '14 types de notifications GPS automatiques (arrivée école, départ maison, batterie faible, bouton panique)',
          'Optimisation pour réseaux africains avec économie de batterie',
          'Mode hors ligne avec synchronisation différée',
          'Contrôle présence scolaire automatique',
          'Système d\'urgence avec bouton SOS',
          'Historique de localisation (30 jours)',
          'Notifications WhatsApp Business avec cartes intégrées',
          'Respect UNICEF des droits des enfants',
          'Chiffrement de bout en bout pour la protection des données'
        ]
      },
      
      contact: {
        title: 'Informations de Contact',
        email: 'Email',
        phone: 'Téléphone',
        website: 'Site Web',
        footer: 'Document généré le : juillet 2025 • Educafric - Plateforme Éducative Africaine'
      }
    },
    
    en: {
      title: 'Geolocation Services',
      subtitle: 'Options Comparison',
      important: 'IMPORTANT: There are TWO ways to access geolocation services',
      
      tableHeaders: {
        aspect: 'Aspect',
        schoolRoute: '🏫 Via Partner School',
        directRoute: '📱 Direct Subscription'
      },
      
      comparison: {
        schoolConnection: {
          label: 'School connection',
          school: 'Required',
          direct: 'Optional'
        },
        process: {
          label: 'Registration process',
          school: '1. School connection\n2. Child invitation\n3. Geolocation subscription',
          direct: '1. Geolocation subscription\n2. Direct child invitation'
        },
        autonomy: {
          label: 'Independence',
          school: 'School dependent',
          direct: 'Completely independent'
        },
        pricing: {
          label: 'Pricing',
          school: 'School + Geolocation',
          direct: 'Geolocation only'
        },
        invitation: {
          label: 'Invitation system',
          school: 'Same system',
          direct: 'Same system'
        }
      },
      
      option1: {
        title: 'OPTION 1: VIA PARTNER SCHOOL',
        steps: [
          'Parent connects first to a partner school',
          'Invites children via this school connection',
          'Geolocation becomes an additional premium service'
        ]
      },
      
      option2: {
        title: 'OPTION 2: DIRECT SUBSCRIPTION',
        steps: [
          'Parent subscribes directly to geolocation service',
          'Invites children immediately',
          'No school connection required'
        ]
      },
      
      pricing: {
        title: 'PARENT PRICING',
        monthly: '1,000 CFA/month',
        yearly: '12,000 CFA/year',
        description: 'Real-time tracking + SMS alerts + Safe zones'
      },
      
      features: {
        title: 'Complete features available in both cases:',
        list: [
          'Real-time child tracking with interactive maps',
          'Safe zone configuration (School, Home, Library)',
          'Multi-device management (smartphone, smartwatch, school tablet)',
          '14 types of automatic GPS notifications (school arrival, home departure, low battery, panic button)',
          'African network optimization with battery saving',
          'Offline mode with delayed synchronization',
          'Automatic school attendance control',
          'Emergency system with SOS button',
          'Location history (30 days)',
          'WhatsApp Business notifications with integrated maps',
          'UNICEF children\'s rights compliance',
          'End-to-end encryption for data protection'
        ]
      },
      
      contact: {
        title: 'Contact Information',
        email: 'Email',
        phone: 'Phone',
        website: 'Website',
        footer: 'Document generated: July 2025 • Educafric - African Educational Platform'
      }
    }
  };

  const t = text[language];

  return (
    <div className="min-h-screen bg-gray-50">
      <FrontpageNavbar />
      
      <div className="pt-20 pb-16">
        <div className="max-w-4xl mx-auto px-6">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-8 rounded-xl text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <MapPin className="w-8 h-8 mr-3" />
              <h1 className="text-3xl font-bold">Educafric</h1>
            </div>
            <h2 className="text-xl">{t.title || ''} - {t.subtitle}</h2>
          </div>

          {/* Important Notice */}
          <div className="bg-red-500 text-white p-4 rounded-lg mb-8 text-center font-bold flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 mr-3" />
            {t.important}
          </div>

          {/* Comparison Table */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white">
                <tr>
                  <th className="p-4 text-left font-bold">{t?.tableHeaders?.aspect}</th>
                  <th className="p-4 text-left font-bold">{t?.tableHeaders?.schoolRoute}</th>
                  <th className="p-4 text-left font-bold">{t?.tableHeaders?.directRoute}</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b hover:bg-gray-50">
                  <td className="p-4 font-semibold">{t?.comparison?.schoolConnection.label}</td>
                  <td className="p-4">
                    <div className="flex items-center">
                      <Check className="w-5 h-5 text-green-500 mr-2" />
                      {t?.comparison?.schoolConnection.school}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center">
                      <X className="w-5 h-5 text-red-500 mr-2" />
                      {t?.comparison?.schoolConnection.direct}
                    </div>
                  </td>
                </tr>
                <tr className="border-b hover:bg-gray-50">
                  <td className="p-4 font-semibold">{t?.comparison?.process.label}</td>
                  <td className="p-4 whitespace-pre-line">{t?.comparison?.process.school}</td>
                  <td className="p-4 whitespace-pre-line">{t?.comparison?.process.direct}</td>
                </tr>
                <tr className="border-b hover:bg-gray-50">
                  <td className="p-4 font-semibold">{t?.comparison?.autonomy.label}</td>
                  <td className="p-4">
                    <div className="flex items-center">
                      <AlertTriangle className="w-5 h-5 text-yellow-500 mr-2" />
                      {t?.comparison?.autonomy.school}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center">
                      <Check className="w-5 h-5 text-green-500 mr-2" />
                      {t?.comparison?.autonomy.direct}
                    </div>
                  </td>
                </tr>
                <tr className="border-b hover:bg-gray-50">
                  <td className="p-4 font-semibold">{t?.comparison?.pricing.label}</td>
                  <td className="p-4">{t?.comparison?.pricing.school}</td>
                  <td className="p-4">{t?.comparison?.pricing.direct}</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="p-4 font-semibold">{t?.comparison?.invitation.label}</td>
                  <td className="p-4">
                    <div className="flex items-center">
                      <Check className="w-5 h-5 text-green-500 mr-2" />
                      {t?.comparison?.invitation.school}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center">
                      <Check className="w-5 h-5 text-green-500 mr-2" />
                      {t?.comparison?.invitation.direct}
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Option 1 */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 rounded-lg mb-4 flex items-center">
              <School className="w-6 h-6 mr-3" />
              <h3 className="font-bold">{t?.option1?.title}</h3>
            </div>
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
              <h4 className="text-blue-800 font-bold mb-3">{language === 'fr' ? 'Processus étape par étape :' : 'Step-by-step process:'}</h4>
              {(Array.isArray(t?.option1?.steps) ? t.option1.steps : []).map((step, index) => (
                <div key={index} className="bg-white p-3 mb-2 rounded border-l-4 border-blue-500">
                  <span className="font-bold text-blue-600">{index + 1}️⃣</span> {step}
                </div>
              ))}
            </div>
          </div>

          {/* Option 2 */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 rounded-lg mb-4 flex items-center">
              <Smartphone className="w-6 h-6 mr-3" />
              <h3 className="font-bold">{t?.option2?.title}</h3>
            </div>
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
              <h4 className="text-blue-800 font-bold mb-3">{language === 'fr' ? 'Processus étape par étape :' : 'Step-by-step process:'}</h4>
              {(Array.isArray(t?.option2?.steps) ? t.option2.steps : []).map((step, index) => (
                <div key={index} className="bg-white p-3 mb-2 rounded border-l-4 border-blue-500">
                  <span className="font-bold text-blue-600">{index + 1}️⃣</span> {step}
                </div>
              ))}
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl text-center mb-6">
            <h3 className="text-2xl font-bold mb-2">💰 {t?.pricing?.title}</h3>
            <div className="text-xl mb-2">{t?.pricing?.monthly} • {t?.pricing?.yearly}</div>
            <div className="text-sm opacity-90 mb-4">{t?.pricing?.description}</div>
            <div className="bg-white bg-opacity-20 rounded-lg p-3 text-sm">
              <strong>{language === 'fr' ? 'PROMOTION LANCEMENT' : 'LAUNCH PROMOTION'}</strong><br/>
              {language === 'fr' ? 'Valable jusqu\'au 31 décembre 2025 • Cameroun' : 'Valid until December 31, 2025 • Cameroon'}
            </div>
          </div>

          {/* Features */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h4 className="text-lg font-bold mb-4 flex items-center">
              <Shield className="w-6 h-6 mr-2 text-blue-600" />
              {t?.features?.title}
            </h4>
            <div className="bg-gray-50 rounded-lg p-4">
              <ul className="space-y-2">
                {(Array.isArray(t?.features?.list) ? t.features.list : []).map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Technical Specifications */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h4 className="text-lg font-bold mb-4 flex items-center">
              <Smartphone className="w-6 h-6 mr-2 text-purple-600" />
              {language === 'fr' ? 'Appareils Supportés' : 'Supported Devices'}
            </h4>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h5 className="font-semibold text-blue-800 mb-2">
                  {language === 'fr' ? 'Smartphones' : 'Smartphones'}
                </h5>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Android 8.0+</li>
                  <li>• iOS 12.0+</li>
                  <li>• GPS intégré</li>
                  <li>• {language === 'fr' ? 'Mode économie batterie' : 'Battery saving mode'}</li>
                </ul>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h5 className="font-semibold text-green-800 mb-2">
                  {language === 'fr' ? 'Montres Connectées' : 'Smart Watches'}
                </h5>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• GPS + 4G/LTE</li>
                  <li>• {language === 'fr' ? 'Bouton SOS' : 'SOS Button'}</li>
                  <li>• {language === 'fr' ? 'Résistant à l\'eau' : 'Water resistant'}</li>
                  <li>• {language === 'fr' ? 'Autonomie 48h' : '48h battery life'}</li>
                </ul>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h5 className="font-semibold text-purple-800 mb-2">
                  {language === 'fr' ? 'Tablettes Scolaires' : 'School Tablets'}
                </h5>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Android/iPad</li>
                  <li>• {language === 'fr' ? 'Mode classe' : 'Classroom mode'}</li>
                  <li>• {language === 'fr' ? 'Géolocalisation passive' : 'Passive geolocation'}</li>
                  <li>• {language === 'fr' ? 'Contrôle présence' : 'Attendance control'}</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Notification Types */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h4 className="text-lg font-bold mb-4 flex items-center">
              <AlertTriangle className="w-6 h-6 mr-2 text-orange-600" />
              {language === 'fr' ? '14 Types de Notifications GPS' : '14 Types of GPS Notifications'}
            </h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2 text-sm">
                <div className="flex items-center p-2 bg-green-50 rounded">
                  <Check className="w-4 h-4 text-green-500 mr-2" />
                  {language === 'fr' ? 'Arrivée à l\'école' : 'School arrival'}
                </div>
                <div className="flex items-center p-2 bg-green-50 rounded">
                  <Check className="w-4 h-4 text-green-500 mr-2" />
                  {language === 'fr' ? 'Départ de l\'école' : 'School departure'}
                </div>
                <div className="flex items-center p-2 bg-green-50 rounded">
                  <Check className="w-4 h-4 text-green-500 mr-2" />
                  {language === 'fr' ? 'Arrivée à la maison' : 'Home arrival'}
                </div>
                <div className="flex items-center p-2 bg-yellow-50 rounded">
                  <AlertTriangle className="w-4 h-4 text-yellow-500 mr-2" />
                  {language === 'fr' ? 'Sortie de zone autorisée' : 'Exit from authorized zone'}
                </div>
                <div className="flex items-center p-2 bg-red-50 rounded">
                  <X className="w-4 h-4 text-red-500 mr-2" />
                  {language === 'fr' ? 'Bouton panique SOS' : 'Emergency SOS button'}
                </div>
                <div className="flex items-center p-2 bg-orange-50 rounded">
                  <AlertTriangle className="w-4 h-4 text-orange-500 mr-2" />
                  {language === 'fr' ? 'Batterie faible' : 'Low battery'}
                </div>
                <div className="flex items-center p-2 bg-blue-50 rounded">
                  <Check className="w-4 h-4 text-blue-500 mr-2" />
                  {language === 'fr' ? 'Retard scolaire' : 'School delay'}
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center p-2 bg-purple-50 rounded">
                  <AlertTriangle className="w-4 h-4 text-purple-500 mr-2" />
                  {language === 'fr' ? 'Mouvement nocturne' : 'Night movement'}
                </div>
                <div className="flex items-center p-2 bg-gray-50 rounded">
                  <X className="w-4 h-4 text-gray-500 mr-2" />
                  {language === 'fr' ? 'Perte de signal GPS' : 'GPS signal loss'}
                </div>
                <div className="flex items-center p-2 bg-red-50 rounded">
                  <AlertTriangle className="w-4 h-4 text-red-500 mr-2" />
                  {language === 'fr' ? 'Vitesse anormale' : 'Abnormal speed'}
                </div>
                <div className="flex items-center p-2 bg-red-50 rounded">
                  <X className="w-4 h-4 text-red-500 mr-2" />
                  {language === 'fr' ? 'Détection de chute' : 'Fall detection'}
                </div>
                <div className="flex items-center p-2 bg-green-50 rounded">
                  <Check className="w-4 h-4 text-green-500 mr-2" />
                  {language === 'fr' ? 'Zone sécurisée grand-mère' : 'Grandmother safe zone'}
                </div>
                <div className="flex items-center p-2 bg-yellow-50 rounded">
                  <AlertTriangle className="w-4 h-4 text-yellow-500 mr-2" />
                  {language === 'fr' ? 'Trajet inhabituel' : 'Unusual route'}
                </div>
                <div className="flex items-center p-2 bg-red-50 rounded">
                  <X className="w-4 h-4 text-red-500 mr-2" />
                  {language === 'fr' ? 'Entrée zone interdite' : 'Restricted zone entry'}
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-gray-100 rounded-xl p-6 text-center">
            <h3 className="text-xl font-bold mb-4 flex items-center justify-center">
              <Phone className="w-6 h-6 mr-2" />
              {t?.contact?.title}
            </h3>
            <div className="space-y-2 text-gray-700">
              <p className="flex items-center justify-center">
                <Mail className="w-5 h-5 mr-2" />
                <strong>{t?.contact?.email}:</strong> info@educafric.com
              </p>
              <p className="flex items-center justify-center">
                <Phone className="w-5 h-5 mr-2" />
                <strong>{t?.contact?.phone}:</strong> +237 656 200 472
              </p>
              <p className="flex items-center justify-center">
                <Globe className="w-5 h-5 mr-2" />
                <strong>{t?.contact?.website}:</strong> www?.educafric?.com
              </p>
            </div>
            <p className="text-xs text-gray-500 mt-4">{t?.contact?.footer}</p>
          </div>
        </div>
      </div>
    </div>
  );
}