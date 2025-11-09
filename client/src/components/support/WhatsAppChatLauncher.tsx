import { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

export function WhatsAppChatLauncher() {
  const [isExpanded, setIsExpanded] = useState(false);
  const { language } = useLanguage();

  const handleWhatsAppClick = () => {
    const phoneNumber = '237656200472';
    const isFrench = language.startsWith('fr');
    const message = isFrench
      ? encodeURIComponent('Bonjour! J\'ai une question concernant EDUCAFRIC.')
      : encodeURIComponent('Hello! I have a question about EDUCAFRIC.');
    
    const whatsappUrl = `https://api.whatsapp.com/send/?phone=${phoneNumber}&text=${message}&type=phone_number&app_absent=0`;
    
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    
    setIsExpanded(false);
    
    console.log('[WHATSAPP_SUPPORT] Chat launcher clicked');
  };

  const translations = {
    fr: {
      title: 'Besoin d\'aide ?',
      subtitle: 'Support EDUCAFRIC',
      description: 'Contactez-nous via WhatsApp pour toute question',
      button: 'Ouvrir WhatsApp',
      tooltip: 'Discuter avec le support',
      phoneLabel: 'Numéro WhatsApp',
      online: 'En ligne'
    },
    en: {
      title: 'Need help?',
      subtitle: 'EDUCAFRIC Support',
      description: 'Contact us via WhatsApp for any questions',
      button: 'Open WhatsApp',
      tooltip: 'Chat with support',
      phoneLabel: 'WhatsApp Number',
      online: 'Online'
    }
  };

  // Normalize language code (fr-FR -> fr, en-US -> en)
  const lang = language.startsWith('fr') ? 'fr' : 'en';
  const t = translations[lang];

  return (
    <>
      {isExpanded && (
        <div 
          className="fixed inset-0 bg-black/20 dark:bg-black/40 z-[60] animate-in fade-in duration-200"
          onClick={() => setIsExpanded(false)}
          data-testid="whatsapp-overlay"
          aria-hidden="true"
        />
      )}
      
      <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-[70] flex flex-col items-end gap-2 md:gap-3">
        {isExpanded && (
          <div 
            className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-3 md:p-4 w-[calc(100vw-2rem)] max-w-xs sm:w-72 animate-in slide-in-from-bottom-4 duration-300"
            data-testid="whatsapp-chat-card"
            role="dialog"
            aria-label={t.title}
          >
            <div className="flex items-start justify-between mb-2 md:mb-3">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-sm md:text-base text-gray-900 dark:text-white truncate">
                    {t.title}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {t.subtitle}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(false)}
                className="h-6 w-6 p-0 flex-shrink-0"
                data-testid="close-whatsapp-card"
                aria-label={lang === 'fr' ? 'Fermer' : 'Close'}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300 mb-3 md:mb-4">
              {t.description}
            </p>
            
            <Button
              onClick={handleWhatsAppClick}
              className="w-full bg-green-500 hover:bg-green-600 text-white text-sm md:text-base py-2"
              data-testid="open-whatsapp-button"
              aria-label={t.button}
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              {t.button}
            </Button>
            
            <div className="mt-2 md:mt-3 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" aria-label={t.online}></div>
              <span className="font-mono">+237 656 200 472</span>
            </div>
          </div>
        )}
        
        <Button
          onClick={() => setIsExpanded(!isExpanded)}
          size="lg"
          className={`
            h-12 w-12 md:h-14 md:w-14 rounded-full shadow-lg
            ${isExpanded 
              ? 'bg-red-500 hover:bg-red-600' 
              : 'bg-green-500 hover:bg-green-600'
            }
            text-white transition-all duration-300
            hover:scale-110 active:scale-95
          `}
          title={t.tooltip}
          data-testid="whatsapp-chat-launcher"
          aria-label={t.tooltip}
          aria-expanded={isExpanded}
        >
          {isExpanded ? (
            <X className="h-5 w-5 md:h-6 md:w-6" />
          ) : (
            <MessageCircle className="h-5 w-5 md:h-6 md:w-6" />
          )}
        </Button>
      </div>
    </>
  );
}
