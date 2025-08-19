import { Mail, Phone, MessageCircle, Facebook, Shield, FileText } from 'lucide-react';
import { FaTiktok } from 'react-icons/fa';
import { Link } from 'wouter';
import { useLanguage } from '@/contexts/LanguageContext';
import Logo from './Logo';

const EducafricFooter = () => {
  const { language } = useLanguage();
  
  const text = {
    en: {
      legal: 'Legal',
      contact: 'Contact',
      followUs: 'Follow Us',
      privacyPolicy: 'Privacy Policy',
      termsOfService: 'Terms of Service',
      aboutDescription: 'Africa\'s leading educational technology platform, empowering schools, teachers, parents, and students across the continent with comprehensive digital learning solutions.',
      allRightsReserved: 'All rights reserved.',
      euCompliance: 'EU Geo-blocking Regulation (EU) 2018/302 compliant',
      builtForAfrica: 'Built for African Education'
    },
    fr: {
      legal: 'Légal',
      contact: 'Contact', 
      followUs: 'Suivez-nous',
      privacyPolicy: 'Politique de Confidentialité',
      termsOfService: 'Conditions d\'Utilisation',
      aboutDescription: 'Plateforme de technologie éducative leader en Afrique, autonomisant les écoles, enseignants, parents et élèves à travers le continent avec des solutions d\'apprentissage numérique complètes.',
      allRightsReserved: 'Tous droits réservés.',
      euCompliance: 'Conforme au Règlement UE 2018/302 sur le blocage géographique',
      builtForAfrica: 'Conçu pour l\'Éducation Africaine'
    }
  };
  
  const t = text[language];
  
  const footerLinks = {
    legal: [
      { label: t.privacyPolicy, href: "/privacy-policy", icon: Shield },
      { label: t.termsOfService, href: "/terms-of-service", icon: FileText }
    ],
    contact: [
      { label: "info@educafric.com", href: "mailto:info@educafric.com", icon: Mail },
      { label: "+237 656 200 472", href: "tel:+237656200472", icon: Phone }
    ],
    social: [
      { label: "WhatsApp", href: "https://wa.me/237656200472", icon: MessageCircle },
      { label: "Facebook", href: "https://facebook.com/educafric", icon: Facebook },
      { label: "TikTok", href: "https://tiktok.com/@educafric", icon: FaTiktok }
    ]
  };

  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand Section */}
          <div>
            <Logo size="lg" className="mb-6" />
            <p className="text-muted-foreground leading-relaxed mb-6">
              {t.aboutDescription}
            </p>
            <div className="text-sm text-primary font-medium">
              {t.builtForAfrica}
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="h4 mb-6">{t.contact}</h3>
            <ul className="space-y-4">
              {(Array.isArray(footerLinks.contact) ? footerLinks.contact : []).map((link, index) => {
                const IconComponent = link.icon;
                return (
                  <li key={index}>
                    <a
                      href={link.href}
                      className="flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors"
                    >
                      <IconComponent className="w-4 h-4" />
                      <span>{link.label}</span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Social Media Links */}
          <div>
            <h3 className="h4 mb-6">{t.followUs}</h3>
            <ul className="space-y-4">
              {(Array.isArray(footerLinks.social) ? footerLinks.social : []).map((link, index) => {
                const IconComponent = link.icon;
                return (
                  <li key={index}>
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors"
                    >
                      <IconComponent className="w-4 h-4" />
                      <span>{link.label}</span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="h4 mb-6">{t.legal}</h3>
            <ul className="space-y-4">
              {(Array.isArray(footerLinks.legal) ? footerLinks.legal : []).map((link, index) => {
                const IconComponent = link.icon;
                return (
                  <li key={index}>
                    <Link
                      href={link.href}
                      className="flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors"
                    >
                      <IconComponent className="w-4 h-4" />
                      <span>{link.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-border pt-8">
          <div className="text-sm text-muted-foreground text-center">
            © {new Date().getFullYear()} Afro Metaverse marketing Sarl (RC/YAE/2023/B1361) - Educafric. {t.allRightsReserved}<br />
            {t.euCompliance}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default EducafricFooter;