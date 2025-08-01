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
const logoImage = '/educafric-logo-128.png';


export default function FrontpageNavbar() {
  const { language, setLanguage } = useLanguage();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [, navigate] = useLocation();

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

  const handlePricingClick = (e: React.MouseEvent) => {
    e.preventDefault();
    
    // Check if we're already on the demo page
    if (window?.location?.pathname === '/demo') {
      // Just scroll to pricing section
      const pricingElement = document.getElementById('pricing');
      if (pricingElement) {
        pricingElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }
    } else {
      // Navigate to demo page with hash
      navigate('/demo#pricing');
      
      // Scroll after navigation
      setTimeout(() => {
        const pricingElement = document.getElementById('pricing');
        if (pricingElement) {
          pricingElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
          });
        }
      }, 100);
    }
  };

  const navigationItems = [
    { href: '/demo', label: t.demo },
    { 
      href: '/demo#pricing', 
      label: t.pricing,
      onClick: handlePricingClick,
      skipDefaultClick: true
    },
    { href: '/geolocation-pricing', label: language === 'fr' ? 'GPS' : 'GPS' }
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
          {/* Logo - Home Button */}
          <Link href="/" className="flex items-center">
            <img 
              src={logoImage} 
              alt="Educafric Logo" 
              className="w-10 h-10 rounded-full object-cover"
            />
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