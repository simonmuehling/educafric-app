import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';

const TermsOfService = () => {
  const { language } = useLanguage();

  const text = {
    en: {
      title: 'Terms of Service',
      lastUpdated: 'Last updated: January 23, 2025',
      sections: {
        intro: {
          title: 'Agreement to Terms',
          content: 'By accessing and using Educafric ("Service"), you accept and agree to be bound by the terms and provision of this agreement. This Service is provided by Educafric, located in Cameroon, Central Africa.'
        },
        description: {
          title: 'Description of Service',
          content: 'Educafric is a comprehensive African educational technology platform that provides:',
          items: [
            'Multi-role dashboard systems for schools, teachers, parents, students, freelancers, and administrators',
            'Bilingual interface supporting French and English languages',
            'Grade management, attendance tracking, and homework assignment systems',
            'Payment processing through Stripe for subscription services',
            'Communication services via SMS, WhatsApp, and email through Vonage and other providers',
            'Timetable management and academic reporting tools',
            'Progressive Web App (PWA) capabilities for mobile access'
          ]
        },
        userAccounts: {
          title: 'User Accounts and Roles',
          content: 'Our platform supports eight distinct user roles, each with specific terms:',
          roles: [
            {
              title: 'Site Administrator',
              description: 'Platform-wide administration and oversight responsibilities'
            },
            {
              title: 'School Admin/Director',
              description: 'School-level management with full institutional access'
            },
            {
              title: 'Teachers',
              description: 'Educational content delivery and student management within assigned classes'
            },
            {
              title: 'Parents',
              description: 'Monitoring and communication regarding their children\'s educational progress'
            },
            {
              title: 'Students',
              description: 'Access to learning materials, assignments, and academic progress'
            },
            {
              title: 'Freelancers (Répétiteurs)',
              description: 'Independent tutoring services and student management'
            },
            {
              title: 'Commercial Users',
              description: 'Sales and customer relationship management for educational services'
            }
          ]
        },
        subscriptions: {
          title: 'Subscription Plans and Payments',
          content: 'We offer various subscription tiers with no trial periods:',
          plans: [
            {
              title: 'Parent Plans',
              description: 'Monthly and annual plans for monitoring children in public or private schools'
            },
            {
              title: 'School Plans',
              description: 'Annual comprehensive school management subscriptions'
            },
            {
              title: 'Freelancer Plans',
              description: 'Semester and annual plans for independent tutoring services'
            }
          ],
          payment: 'All payments are processed securely through Stripe. Subscriptions automatically renew unless cancelled.'
        },
        userObligations: {
          title: 'User Obligations',
          items: [
            'Provide accurate and current information during registration',
            'Maintain the confidentiality of your account credentials',
            'Use the Service only for lawful educational purposes',
            'Respect intellectual property rights and privacy of other users',
            'Comply with all applicable local and international laws',
            'Report any security vulnerabilities or inappropriate behavior'
          ]
        },
        prohibitedUses: {
          title: 'Prohibited Uses',
          items: [
            'Using the Service for any illegal or unauthorized purpose',
            'Transmitting viruses, malware, or other harmful code',
            'Attempting to gain unauthorized access to other user accounts',
            'Harassing, abusing, or discriminating against other users',
            'Sharing inappropriate content or violating community standards',
            'Commercial use outside of designated commercial user roles',
            'Reverse engineering or attempting to extract our source code'
          ]
        },
        dataAndPrivacy: {
          title: 'Data and Privacy',
          content: 'Our comprehensive data handling practices include:',
          items: [
            'Educational data protection in compliance with African and international standards',
            'Secure storage using PostgreSQL with Neon serverless hosting',
            'GDPR compliance for EU users and children\'s privacy protection',
            'Encrypted data transmission and storage',
            'Regular security audits and access controls',
            'Transparent data sharing only with authorized educational stakeholders'
          ]
        },
        intellectualProperty: {
          title: 'Intellectual Property',
          content: 'The Service and its original content, features, and functionality are owned by Educafric and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.'
        },
        termination: {
          title: 'Termination',
          content: 'We may terminate or suspend your account and access to the Service immediately, without prior notice, for conduct that we believe violates these Terms or is harmful to other users, us, or third parties.'
        },
        disclaimers: {
          title: 'Disclaimers',
          content: '',
          items: [
            'The Service is provided "as is" without warranties of any kind',
            'We do not guarantee uninterrupted or error-free operation',
            'Educational outcomes depend on various factors beyond our platform',
            'Third-party services (Stripe, Vonage) are subject to their own terms',
            'We are not responsible for content created by users'
          ]
        },
        limitation: {
          title: 'Limitation of Liability',
          content: 'In no event shall Educafric be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.'
        },
        governing: {
          title: 'Governing Law',
          content: 'These Terms shall be interpreted and governed by the laws of Cameroon. For EU users, we comply with Regulation (EU) 2018/302 on geo-blocking and ensure non-discriminatory access to our educational services.'
        },
        changes: {
          title: 'Changes to Terms',
          content: 'We reserve the right to update these Terms at any time. We will notify users of significant changes through our platform or via email. Continued use of the Service constitutes acceptance of the updated Terms.'
        },
        contact: {
          title: 'Contact Information',
          content: 'For questions about these Terms of Service, please contact us at:',
          details: [
            'Email: legal@educafric.com',
            'Phone: +237 656 200 472',
            'WhatsApp: +237 656 200 472',
            'Address: Cameroon, Central Africa'
          ]
        }
      }
    },
    fr: {
      title: 'Conditions d\'Utilisation',
      lastUpdated: 'Dernière mise à jour : 23 janvier 2025',
      sections: {
        intro: {
          title: 'Accord aux Conditions',
          content: 'En accédant et en utilisant Educafric ("Service"), vous acceptez et vous engagez à être lié par les termes et dispositions de cet accord. Ce Service est fourni par Educafric, situé au Cameroun, Afrique Centrale.'
        },
        description: {
          title: 'Description du Service',
          content: 'Educafric est une plateforme complète de technologie éducative africaine qui fournit :',
          items: [
            'Systèmes de tableaux de bord multi-rôles pour écoles, enseignants, parents, élèves, répétiteurs et administrateurs',
            'Interface bilingue supportant le français et l\'anglais',
            'Gestion des notes, suivi de présence et systèmes d\'assignation de devoirs',
            'Traitement des paiements via Stripe pour les services d\'abonnement',
            'Services de communication via SMS, WhatsApp et email via Vonage et autres fournisseurs',
            'Gestion d\'emploi du temps et outils de rapports académiques',
            'Capacités d\'Application Web Progressive (PWA) pour l\'accès mobile'
          ]
        },
        userAccounts: {
          title: 'Comptes Utilisateur et Rôles',
          content: 'Notre plateforme supporte huit rôles d\'utilisateur distincts, chacun avec des termes spécifiques :',
          roles: [
            {
              title: 'Administrateur du Site',
              description: 'Administration et supervision à l\'échelle de la plateforme'
            },
            {
              title: 'Admin École/Directeur',
              description: 'Gestion au niveau de l\'école avec accès institutionnel complet'
            },
            {
              title: 'Enseignants',
              description: 'Livraison de contenu éducatif et gestion d\'élèves dans les classes assignées'
            },
            {
              title: 'Parents',
              description: 'Surveillance et communication concernant les progrès éducatifs de leurs enfants'
            },
            {
              title: 'Élèves',
              description: 'Accès aux matériels d\'apprentissage, devoirs et progrès académiques'
            },
            {
              title: 'Répétiteurs',
              description: 'Services de tutorat indépendant et gestion d\'élèves'
            },
            {
              title: 'Utilisateurs Commerciaux',
              description: 'Vente et gestion de relation client pour services éducatifs'
            }
          ]
        },
        subscriptions: {
          title: 'Plans d\'Abonnement et Paiements',
          content: 'Nous offrons divers niveaux d\'abonnement sans périodes d\'essai :',
          plans: [
            {
              title: 'Plans Parents',
              description: 'Plans mensuels et annuels pour surveiller les enfants dans les écoles publiques ou privées'
            },
            {
              title: 'Plans École',
              description: 'Abonnements annuels de gestion complète d\'école'
            },
            {
              title: 'Plans Répétiteur',
              description: 'Plans semestriels et annuels pour services de tutorat indépendant'
            }
          ],
          payment: 'Tous les paiements sont traités de manière sécurisée via Stripe. Les abonnements se renouvellent automatiquement sauf annulation.'
        },
        userObligations: {
          title: 'Obligations de l\'Utilisateur',
          items: [
            'Fournir des informations exactes et actuelles lors de l\'inscription',
            'Maintenir la confidentialité de vos identifiants de compte',
            'Utiliser le Service uniquement à des fins éducatives légales',
            'Respecter les droits de propriété intellectuelle et la vie privée des autres utilisateurs',
            'Se conformer à toutes les lois locales et internationales applicables',
            'Signaler toute vulnérabilité de sécurité ou comportement inapproprié'
          ]
        },
        prohibitedUses: {
          title: 'Utilisations Interdites',
          items: [
            'Utiliser le Service à des fins illégales ou non autorisées',
            'Transmettre des virus, malwares ou autres codes nuisibles',
            'Tenter d\'obtenir un accès non autorisé à d\'autres comptes utilisateur',
            'Harceler, abuser ou discriminer d\'autres utilisateurs',
            'Partager du contenu inapproprié ou violer les standards communautaires',
            'Usage commercial en dehors des rôles d\'utilisateur commercial désignés',
            'Ingénierie inverse ou tentative d\'extraire notre code source'
          ]
        },
        dataAndPrivacy: {
          title: 'Données et Confidentialité',
          content: 'Nos pratiques complètes de traitement des données incluent :',
          items: [
            'Protection des données éducatives en conformité avec les standards africains et internationaux',
            'Stockage sécurisé utilisant PostgreSQL avec hébergement serverless Neon',
            'Conformité RGPD pour les utilisateurs UE et protection de la vie privée des enfants',
            'Transmission et stockage de données chiffrées',
            'Audits de sécurité réguliers et contrôles d\'accès',
            'Partage de données transparent uniquement avec les parties prenantes éducatives autorisées'
          ]
        },
        intellectualProperty: {
          title: 'Propriété Intellectuelle',
          content: 'Le Service et son contenu original, ses fonctionnalités sont la propriété d\'Educafric et sont protégés par les lois internationales de droit d\'auteur, marque déposée, brevet, secret commercial et autres lois de propriété intellectuelle.'
        },
        termination: {
          title: 'Résiliation',
          content: 'Nous pouvons résilier ou suspendre votre compte et l\'accès au Service immédiatement, sans préavis, pour une conduite que nous croyons violer ces Conditions ou nuire à d\'autres utilisateurs, à nous ou à des tiers.'
        },
        disclaimers: {
          title: 'Avertissements',
          items: [
            'Le Service est fourni "en l\'état" sans garanties d\'aucune sorte',
            'Nous ne garantissons pas un fonctionnement ininterrompu ou sans erreur',
            'Les résultats éducatifs dépendent de divers facteurs au-delà de notre plateforme',
            'Les services tiers (Stripe, Vonage) sont soumis à leurs propres conditions',
            'Nous ne sommes pas responsables du contenu créé par les utilisateurs'
          ]
        },
        limitation: {
          title: 'Limitation de Responsabilité',
          content: 'En aucun cas Educafric ne sera responsable de dommages indirects, accessoires, spéciaux, consécutifs ou punitifs, incluant sans limitation, la perte de profits, données, usage, goodwill ou autres pertes intangibles.'
        },
        governing: {
          title: 'Loi Applicable',
          content: 'Ces Conditions seront interprétées et régies par les lois du Cameroun. Pour les utilisateurs UE, nous nous conformons au Règlement (UE) 2018/302 sur le blocage géographique et assurons un accès non discriminatoire à nos services éducatifs.'
        },
        changes: {
          title: 'Modifications des Conditions',
          content: 'Nous nous réservons le droit de mettre à jour ces Conditions à tout moment. Nous notifierons les utilisateurs des changements significatifs via notre plateforme ou par email. L\'utilisation continue du Service constitue une acceptation des Conditions mises à jour.'
        },
        contact: {
          title: 'Informations de Contact',
          content: 'Pour des questions sur ces Conditions d\'Utilisation, veuillez nous contacter à :',
          details: [
            'Email : legal@educafric.com',
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

          {/* Service Description */}
          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                {t?.sections?.description.title}
              </h2>
              <p className="text-black leading-relaxed mb-4">
                {t?.sections?.description.content}
              </p>
              <ul className="list-disc list-inside space-y-2 text-black">
                {(Array.isArray(t?.sections?.description?.items) ? t?.sections?.description?.items : []).map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* User Accounts and Roles */}
          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                {t?.sections?.userAccounts.title}
              </h2>
              <p className="text-black leading-relaxed mb-6">
                {t?.sections?.userAccounts.content}
              </p>
              
              <div className="space-y-4">
                {(Array.isArray(t?.sections?.userAccounts?.roles) ? t?.sections?.userAccounts?.roles : []).map((role, index) => (
                  <div key={index} className="border-l-4 border-primary pl-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {role.title || ''}
                    </h3>
                    <p className="text-black">
                      {role.description || ''}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Subscriptions */}
          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                {t?.sections?.subscriptions.title}
              </h2>
              <p className="text-black leading-relaxed mb-6">
                {t?.sections?.subscriptions.content}
              </p>
              
              <div className="space-y-4 mb-6">
                {(Array.isArray(t?.sections?.subscriptions?.plans) ? t?.sections?.subscriptions?.plans : []).map((plan, index) => (
                  <div key={index} className="border-l-4 border-green-500 pl-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {plan.title || ''}
                    </h3>
                    <p className="text-black">
                      {plan.description || ''}
                    </p>
                  </div>
                ))}
              </div>
              
              <p className="text-black leading-relaxed font-medium">
                {t?.sections?.subscriptions.payment}
              </p>
            </CardContent>
          </Card>

          {/* User Obligations */}
          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                {t?.sections?.userObligations.title}
              </h2>
              <ul className="list-disc list-inside space-y-2 text-black">
                {(Array.isArray(t?.sections?.userObligations?.items) ? t?.sections?.userObligations?.items : []).map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Prohibited Uses */}
          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                {t?.sections?.prohibitedUses.title}
              </h2>
              <ul className="list-disc list-inside space-y-2 text-black">
                {(Array.isArray(t?.sections?.prohibitedUses?.items) ? t?.sections?.prohibitedUses?.items : []).map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Data and Privacy */}
          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                {t?.sections?.dataAndPrivacy.title}
              </h2>
              <p className="text-black leading-relaxed mb-4">
                {t?.sections?.dataAndPrivacy.content}
              </p>
              <ul className="list-disc list-inside space-y-2 text-black">
                {(Array.isArray(t?.sections?.dataAndPrivacy?.items) ? t?.sections?.dataAndPrivacy?.items : []).map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Additional Sections */}
          {[
            t?.sections?.intellectualProperty,
            t?.sections?.termination,
            t?.sections?.limitation,
            t?.sections?.governing,
            t?.sections?.changes
          ].map((section, index) => (
            <Card key={index}>
              <CardContent className="p-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  {section.title || ''}
                </h2>
                {(section as any)?.items ? (
                  <ul className="list-disc list-inside space-y-2 text-black">
                    {(Array.isArray((section as any)?.items) ? (section as any)?.items : []).map((item: string, itemIndex: number) => (
                      <li key={itemIndex}>{item}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-black leading-relaxed">
                    {section.content}
                  </p>
                )}
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

export default TermsOfService;