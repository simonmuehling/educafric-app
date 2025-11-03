import { useEffect, useState } from 'react';
import { usePWAUpdate } from '@/hooks/usePWAUpdate';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { RefreshCw, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PWAUpdateNotificationProps {
  position?: 'top' | 'bottom';
  autoHide?: boolean;
  autoHideDelay?: number;
}

export function PWAUpdateNotification({
  position = 'bottom',
  autoHide = false,
  autoHideDelay = 10000
}: PWAUpdateNotificationProps) {
  const { hasUpdate, newVersion, applyUpdate, dismissUpdate } = usePWAUpdate();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (hasUpdate && newVersion) {
      setVisible(true);

      if (autoHide) {
        const timeout = setTimeout(() => {
          setVisible(false);
          dismissUpdate();
        }, autoHideDelay);

        return () => clearTimeout(timeout);
      }
    }
  }, [hasUpdate, newVersion, autoHide, autoHideDelay]);

  const handleUpdate = () => {
    setVisible(false);
    applyUpdate();
  };

  const handleDismiss = () => {
    setVisible(false);
    dismissUpdate();
  };

  return (
    <AnimatePresence>
      {visible && hasUpdate && (
        <motion.div
          initial={{ opacity: 0, y: position === 'bottom' ? 100 : -100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: position === 'bottom' ? 100 : -100 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className={`fixed ${
            position === 'bottom' ? 'bottom-4' : 'top-4'
          } left-1/2 -translate-x-1/2 z-[9999] w-full max-w-md px-4`}
          data-testid="pwa-update-notification"
        >
          <Card className="bg-primary dark:bg-primary text-primary-foreground p-4 shadow-lg border-0">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                <RefreshCw className="w-5 h-5" />
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm mb-1" data-testid="text-update-title">
                  Nouvelle version disponible
                </h3>
                <p className="text-sm opacity-90 mb-3" data-testid="text-update-message">
                  Une mise à jour d'Educafric est disponible. Rafraîchissez pour profiter des dernières améliorations.
                </p>
                
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={handleUpdate}
                    className="flex items-center gap-2 bg-white hover:bg-gray-100 text-primary"
                    data-testid="button-apply-update"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Mettre à jour
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleDismiss}
                    className="text-primary-foreground hover:bg-primary-foreground/10"
                    data-testid="button-dismiss-update"
                  >
                    Plus tard
                  </Button>
                </div>
              </div>
              
              <button
                onClick={handleDismiss}
                className="flex-shrink-0 text-primary-foreground hover:bg-primary-foreground/10 rounded-full p-1 transition-colors"
                aria-label="Fermer"
                data-testid="button-close-update"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
