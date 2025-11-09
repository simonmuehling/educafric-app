import { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

export function WhatsAppChatLauncher() {
  const [isExpanded, setIsExpanded] = useState(false);
  const { language } = useLanguage();

  const handleWhatsAppClick = () => {
    const phoneNumber = '237656200472';
    const message = language === 'fr' 
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
      description: 'Contactez-nous via WhatsApp pour toute question',
      button: 'Ouvrir WhatsApp',
      tooltip: 'Discuter avec le support'
    },
    en: {
      title: 'Need help?',
      description: 'Contact us via WhatsApp for any questions',
      button: 'Open WhatsApp',
      tooltip: 'Chat with support'
    }
  };

  const t = translations[language];

  return (
    <>
      {isExpanded && (
        <div 
          className="fixed inset-0 bg-black/20 dark:bg-black/40 z-40 animate-in fade-in duration-200"
          onClick={() => setIsExpanded(false)}
          data-testid="whatsapp-overlay"
        />
      )}
      
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        {isExpanded && (
          <div 
            className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-4 w-72 animate-in slide-in-from-bottom-4 duration-300"
            data-testid="whatsapp-chat-card"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {t.title}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Support EDUCAFRIC
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(false)}
                className="h-6 w-6 p-0"
                data-testid="close-whatsapp-card"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              {t.description}
            </p>
            
            <Button
              onClick={handleWhatsAppClick}
              className="w-full bg-green-500 hover:bg-green-600 text-white"
              data-testid="open-whatsapp-button"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              {t.button}
            </Button>
            
            <div className="mt-3 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>+237 656 200 472</span>
            </div>
          </div>
        )}
        
        <Button
          onClick={() => setIsExpanded(!isExpanded)}
          size="lg"
          className={`
            h-14 w-14 rounded-full shadow-lg
            ${isExpanded 
              ? 'bg-red-500 hover:bg-red-600' 
              : 'bg-green-500 hover:bg-green-600'
            }
            text-white transition-all duration-300
            hover:scale-110 active:scale-95
          `}
          title={t.tooltip}
          data-testid="whatsapp-chat-launcher"
        >
          {isExpanded ? (
            <X className="h-6 w-6" />
          ) : (
            <MessageCircle className="h-6 w-6" />
          )}
        </Button>
      </div>
    </>
  );
}
