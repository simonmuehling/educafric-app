import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  GraduationCap, 
  Globe, 
  Menu, 
  X, 
  Phone,
  MessageCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

const baseUrl = import.meta.env.BASE_URL || '/';
const LOGO_SOURCES = [
  `${baseUrl}educafric-logo-128.png`,
  `${baseUrl}educafric-logo-512.png`,
  `${baseUrl}favicon.ico`
];


interface NavigationItem {
  href: string;
  label: string;
  onClick?: (e: React.MouseEvent) => void;
  skipDefaultClick?: boolean;
}

export default function FrontpageNavbar() {
  const { language, setLanguage } = useLanguage();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [, navigate] = useLocation();
  const [logoError, setLogoError] = useState(false);
  const [logoSourceIndex, setLogoSourceIndex] = useState(0);

  const handleLogoError = () => {
    if (logoSourceIndex < LOGO_SOURCES.length - 1) {
      setLogoSourceIndex(logoSourceIndex + 1);
    } else {
      setLogoError(true);
    }
  };

  const text = {
    fr: {
      home: 'Accueil',
      demo: 'Démo',
      about: 'À Propos',
      pricing: 'Tarifs',
      contactUs: 'Nous Contacter',
      login: 'Connexion',
      toggleLanguage: 'Changer la langue',

      closeMenu: 'Fermer le menu',
      openMenu: 'Ouvrir le menu'
    },
    en: {
      home: 'Home',
      demo: 'Demo',
      about: 'About',
      pricing: 'Pricing',
      contactUs: 'Contact Us',
      login: 'Login',
      toggleLanguage: 'Switch language',

      closeMenu: 'Close menu',
      openMenu: 'Open menu'
    }
  };

  const t = text[language];


  const navigationItems: NavigationItem[] = [
    { href: '/demo', label: t.demo }
  ];

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'fr' : 'en');
  };



  const handleContactUs = () => {
    window.open('https://wa.me/+237656200472', '_blank');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo - Home Button with robust fallback */}
          <Link href="/" className="flex items-center gap-2" data-testid="navbar-logo">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center overflow-hidden">
              {!logoError ? (
                <img 
                  src={LOGO_SOURCES[logoSourceIndex]} 
                  alt="Educafric Logo" 
                  className="w-full h-full object-cover rounded-full"
                  onError={handleLogoError}
                  loading="eager"
                />
              ) : (
                <GraduationCap className="w-6 h-6 text-white" />
              )}
            </div>
            <span className="text-xl font-bold text-primary">Educafric</span>
          </Link>

          {/* Mobile Language Switch - Always Visible */}
          <div className="md:hidden flex items-center space-x-2">
            <button
              onClick={toggleLanguage}
              className="flex items-center space-x-1 px-2 py-1 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
              title={t.toggleLanguage}
            >
              <Globe className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs font-medium text-foreground uppercase">
                {language}
              </span>
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {(Array.isArray(navigationItems) ? navigationItems : []).map((item) => (
              item.onClick ? (
                <button
                  key={item.href}
                  onClick={item.onClick}
                  className="text-foreground/70 hover:text-primary font-medium transition-colors duration-200 cursor-pointer"
                >
                  {item.label}
                </button>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-foreground/70 hover:text-primary font-medium transition-colors duration-200"
                >
                  {item.label}
                </Link>
              )
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
              title={t.toggleLanguage}
            >
              <Globe className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground uppercase">
                {language}
              </span>
            </button>



            {/* Contact Us Button */}
            <button
              onClick={handleContactUs}
              className="btn btn-primary flex items-center space-x-2"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{t.contactUs}</span>
            </button>

            {/* Login Button */}
            <Link
              href="/login"
              className="btn btn-secondary"
            >
              {t.login}
            </Link>
          </div>

          {/* Mobile Actions */}
          <div className="md:hidden flex items-center space-x-2">
            {/* Mobile Login Button */}
            <Link
              href="/login"
              className="btn btn-sm btn-primary px-3 py-1 text-sm"
            >
              {t.login}
            </Link>
            
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
              title={isMobileMenuOpen ? t.closeMenu : t.openMenu}
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6 text-muted-foreground" />
              ) : (
                <Menu className="w-6 h-6 text-muted-foreground" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-background border-t border-border">
              {(Array.isArray(navigationItems) ? navigationItems : []).map((item) => (
                item.onClick ? (
                  <button
                    key={item.href}
                    onClick={(e) => {
                      setIsMobileMenuOpen(false);
                      item.onClick(e);
                    }}
                    className="block w-full text-left px-3 py-2 text-foreground/70 hover:text-primary hover:bg-muted/50 rounded-md font-medium transition-colors"
                  >
                    {item.label}
                  </button>
                ) : (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="block px-3 py-2 text-foreground/70 hover:text-primary hover:bg-muted/50 rounded-md font-medium transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                )
              ))}
              
              {/* Mobile Actions */}
              <div className="pt-4 mt-4 border-t border-border">
                {/* Mobile Auth Buttons */}
                <div className="px-3 py-2 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <Link
                      href="/login"
                      className="w-full btn btn-secondary text-center text-sm"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {t.login}
                    </Link>
                    <Link
                      href="/register"
                      className="w-full btn btn-primary text-center text-sm"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Sign Up
                    </Link>
                  </div>
                  
                  <button
                    onClick={() => {
                      handleContactUs();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full btn btn-outline flex items-center justify-center space-x-2"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>{t.contactUs}</span>
                  </button>
                </div>


              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}