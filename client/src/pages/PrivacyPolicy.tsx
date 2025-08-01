import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';

const PrivacyPolicy = () => {
  const { language } = useLanguage();

  const text = {
    en: {
      title: 'Privacy Policy',
      lastUpdated: 'Last updated: January 23, 2025',
      sections: {
        intro: {
          title: 'Introduction',
          content: 'Educafric ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our educational technology platform, including our mobile application and web services.'
        },
        dataCollection: {
          title: 'Information We Collect',
          content: 'We collect information you provide directly to us, such as when you create an account, make payments, or communicate with us.',
          subsections: [
            {
              title: 'Personal Information',
              items: [
                'Name, email address, phone number, and WhatsApp number',
                'Educational information (school, grade level, subjects)',
                'Payment information processed securely through Stripe',
                'Communication preferences (SMS, WhatsApp, email)'
              ]
            },
            {
              title: 'Educational Data',
              items: [
                'Student grades, attendance records, and academic progress',
                'Homework assignments and submissions',
                'Teacher evaluations and feedback',
                'Parent-teacher communication logs'
              ]
            },
            {
              title: 'Technical Information',
              items: [
                'Device information and operating system',
                'IP address and location data',
                'Usage analytics and app performance data',
                'Session information and authentication tokens'
              ]
            }
          ]
        },
        dataUse: {
          title: 'How We Use Your Information',
          items: [
            'Provide and maintain our educational services',
            'Process payments and manage subscriptions',
            'Send educational notifications via SMS, WhatsApp, and email',
            'Generate academic reports and progress tracking',
            'Improve our platform and develop new features',
            'Comply with legal obligations and protect user safety'
          ]
        },
        dataSharing: {
          title: 'Information Sharing',
          content: 'We do not sell or rent your personal information. We may share information in the following circumstances:',
          items: [
            'With educational institutions (schools, teachers) as part of our service',
            'With payment processors (Stripe) for transaction processing',
            'With communication service providers (Vonage) for SMS/WhatsApp delivery',
            'With parents/guardians regarding their children\'s educational progress',
            'When required by law or to protect our rights and safety'
          ]
        },
        dataStorage: {
          title: 'Data Storage and Security',
          content: 'We implement appropriate security measures to protect your information:',
          items: [
            'Data encrypted in transit and at rest',
            'Secure PostgreSQL database hosting with Neon',
            'Regular security audits and updates',
            'Access controls and authentication systems',
            'GDPR and African data protection compliance'
          ]
        },
        userRights: {
          title: 'Your Rights',
          items: [
            'Access and update your personal information',
            'Request deletion of your data (subject to legal requirements)',
            'Opt-out of non-essential communications',
            'Data portability and export options',
            'Lodge complaints with relevant data protection authorities'
          ]
        },
        cookies: {
          title: 'Cookies and Tracking',
          content: 'We use cookies and similar technologies to enhance your experience and analyze usage patterns. You can control cookie preferences through your browser settings.'
        },
        childrens: {
          title: 'Children\'s Privacy',
          content: 'Our platform is designed for educational use and may be used by minors. We comply with applicable children\'s privacy laws and require parental consent for users under 13.'
        },
        international: {
          title: 'International Transfers',
          content: 'Your information may be transferred to and processed in countries other than your country of residence. We ensure appropriate safeguards are in place for such transfers.'
        },
        updates: {
          title: 'Policy Updates',
          content: 'We may update this Privacy Policy periodically. We will notify you of significant changes through our platform or by email.'
        },
        contact: {
          title: 'Contact Information',
          content: 'For privacy-related questions or concerns, contact us at:',
          details: [
            'Email: privacy@educafric.com',
            'Phone: +237 656 200 472',
            'WhatsApp: +237 656 200 472',
            'Address: Cameroon, Central Africa'
          ]
        }
      }
    },
    fr: {
      title: 'Politique de Confidentialité',
      lastUpdated: 'Dernière mise à jour : 23 janvier 2025',
      sections: {
        intro: {
          title: 'Introduction',
          content: 'Educafric ("nous", "notre" ou "nos") s\'engage à protéger votre vie privée. Cette Politique de Confidentialité explique comment nous collectons, utilisons, divulguons et protégeons vos informations lorsque vous utilisez notre plateforme de technologie éducative, y compris notre application mobile et nos services web.'
        },
        dataCollection: {
          title: 'Informations que Nous Collectons',
          content: 'Nous collectons les informations que vous nous fournissez directement, par exemple lorsque vous créez un compte, effectuez des paiements ou communiquez avec nous.',
          subsections: [
            {
              title: 'Informations Personnelles',
              items: [
                'Nom, adresse e-mail, numéro de téléphone et numéro WhatsApp',
                'Informations éducatives (école, niveau scolaire, matières)',
                'Informations de paiement traitées de manière sécurisée via Stripe',
                'Préférences de communication (SMS, WhatsApp, e-mail)'
              ]
            },
            {
              title: 'Données Éducatives',
              items: [
                'Notes des élèves, dossiers de présence et progrès académiques',
                'Devoirs et soumissions',
                'Évaluations et commentaires des enseignants',
                'Journaux de communication parent-enseignant'
              ]
            },
            {
              title: 'Informations Techniques',
              items: [
                'Informations sur l\'appareil et le système d\'exploitation',
                'Adresse IP et données de localisation',
                'Analyses d\'utilisation et données de performance de l\'application',
                'Informations de session et jetons d\'authentification'
              ]
            }
          ]
        },
        dataUse: {
          title: 'Comment Nous Utilisons Vos Informations',
          items: [
            'Fournir et maintenir nos services éducatifs',
            'Traiter les paiements et gérer les abonnements',
            'Envoyer des notifications éducatives via SMS, WhatsApp et e-mail',
            'Générer des rapports académiques et suivre les progrès',
            'Améliorer notre plateforme et développer de nouvelles fonctionnalités',
            'Respecter les obligations légales et protéger la sécurité des utilisateurs'
          ]
        },
        dataSharing: {
          title: 'Partage d\'Informations',
          content: 'Nous ne vendons ni ne louons vos informations personnelles. Nous pouvons partager des informations dans les circonstances suivantes :',
          items: [
            'Avec les institutions éducatives (écoles, enseignants) dans le cadre de notre service',
            'Avec les processeurs de paiement (Stripe) pour le traitement des transactions',
            'Avec les fournisseurs de services de communication (Vonage) pour la livraison SMS/WhatsApp',
            'Avec les parents/tuteurs concernant les progrès éducatifs de leurs enfants',
            'Lorsque requis par la loi ou pour protéger nos droits et notre sécurité'
          ]
        },
        dataStorage: {
          title: 'Stockage et Sécurité des Données',
          content: 'Nous mettons en œuvre des mesures de sécurité appropriées pour protéger vos informations :',
          items: [
            'Données chiffrées en transit et au repos',
            'Hébergement sécurisé de base de données PostgreSQL avec Neon',
            'Audits de sécurité et mises à jour régulières',
            'Contrôles d\'accès et systèmes d\'authentification',
            'Conformité RGPD et protection des données africaines'
          ]
        },
        userRights: {
          title: 'Vos Droits',
          items: [
            'Accéder et mettre à jour vos informations personnelles',
            'Demander la suppression de vos données (sous réserve d\'exigences légales)',
            'Vous désabonner des communications non essentielles',
            'Options de portabilité et d\'exportation des données',
            'Déposer des plaintes auprès des autorités compétentes de protection des données'
          ]
        },
        cookies: {
          title: 'Cookies et Suivi',
          content: 'Nous utilisons des cookies et des technologies similaires pour améliorer votre expérience et analyser les habitudes d\'utilisation. Vous pouvez contrôler les préférences de cookies via les paramètres de votre navigateur.'
        },
        childrens: {
          title: 'Confidentialité des Enfants',
          content: 'Notre plateforme est conçue pour un usage éducatif et peut être utilisée par des mineurs. Nous respectons les lois applicables sur la confidentialité des enfants et exigeons le consentement parental pour les utilisateurs de moins de 13 ans.'
        },
        international: {
          title: 'Transferts Internationaux',
          content: 'Vos informations peuvent être transférées et traitées dans des pays autres que votre pays de résidence. Nous nous assurons que des garanties appropriées sont en place pour de tels transferts.'
        },
        updates: {
          title: 'Mises à Jour de la Politique',
          content: 'Nous pouvons mettre à jour cette Politique de Confidentialité périodiquement. Nous vous informerons des changements significatifs via notre plateforme ou par e-mail.'
        },
        contact: {
          title: 'Informations de Contact',
          content: 'Pour les questions ou préoccupations liées à la confidentialité, contactez-nous à :',
          details: [
            'E-mail : privacy@educafric.com',
            'Téléphone : +237 656 200 472',
            'WhatsApp : +237 656 200 472',
            'Adresse : Cameroun, Afrique Centrale'
          ]
        }
      }
    }
  };

  const t = text[language];

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-black mb-4">
            {t.title || ''}
          </h1>
          <p className="text-black">
            {t.lastUpdated}
          </p>
        </div>

        {/* Content */}
        <div className="space-y-8">
          {/* Introduction */}
          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-semibold text-black mb-4">
                {t?.sections?.intro.title}
              </h2>
              <p className="text-black leading-relaxed">
                {t?.sections?.intro.content}
              </p>
            </CardContent>
          </Card>

          {/* Data Collection */}
          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-semibold text-black mb-4">
                {t?.sections?.dataCollection.title}
              </h2>
              <p className="text-black leading-relaxed mb-6">
                {t?.sections?.dataCollection.content}
              </p>
              
              {t?.sections?.dataCollection.subsections?.map((subsection, index) => (
                <div key={index} className="mb-6">
                  <h3 className="text-lg font-medium text-black mb-3">
                    {subsection.title || ''}
                  </h3>
                  <ul className="list-disc list-inside space-y-2 text-black">
                    {(Array.isArray(subsection.items) ? subsection.items : []).map((item, itemIndex) => (
                      <li key={itemIndex}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Data Use */}
          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                {t?.sections?.dataUse.title}
              </h2>
              <ul className="list-disc list-inside space-y-2 text-black">
                {(Array.isArray(t?.sections?.dataUse?.items) ? t?.sections?.dataUse?.items : []).map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Data Sharing */}
          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                {t?.sections?.dataSharing.title}
              </h2>
              <p className="text-black leading-relaxed mb-4">
                {t?.sections?.dataSharing.content}
              </p>
              <ul className="list-disc list-inside space-y-2 text-black">
                {(Array.isArray(t?.sections?.dataSharing?.items) ? t?.sections?.dataSharing?.items : []).map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Data Storage */}
          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                {t?.sections?.dataStorage.title}
              </h2>
              <p className="text-black leading-relaxed mb-4">
                {t?.sections?.dataStorage.content}
              </p>
              <ul className="list-disc list-inside space-y-2 text-black">
                {(Array.isArray(t?.sections?.dataStorage?.items) ? t?.sections?.dataStorage?.items : []).map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* User Rights */}
          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                {t?.sections?.userRights.title}
              </h2>
              <ul className="list-disc list-inside space-y-2 text-black">
                {(Array.isArray(t?.sections?.userRights?.items) ? t?.sections?.userRights?.items : []).map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Additional Sections */}
          {[
            t?.sections?.cookies,
            t?.sections?.childrens,
            t?.sections?.international,
            t?.sections?.updates
          ].map((section, index) => (
            <Card key={index}>
              <CardContent className="p-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  {section.title || ''}
                </h2>
                <p className="text-black leading-relaxed">
                  {section.content}
                </p>
              </CardContent>
            </Card>
          ))}

          {/* Contact Information */}
          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                {t?.sections?.contact.title}
              </h2>
              <p className="text-black leading-relaxed mb-4">
                {t?.sections?.contact.content}
              </p>
              <ul className="list-disc list-inside space-y-2 text-black">
                {(Array.isArray(t?.sections?.contact?.details) ? t?.sections?.contact?.details : []).map((detail, index) => (
                  <li key={index}>{detail}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;