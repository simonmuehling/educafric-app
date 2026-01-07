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
  autoHideDelay = 60000 // 60 seconds instead of 10
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
          } left-4 right-4 sm:left-1/2 sm:-translate-x-1/2 z-[9999] sm:w-full sm:max-w-md`}
          data-testid="pwa-update-notification"
        >
          <Card className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white p-4 shadow-2xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                  <RefreshCw className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-base sm:text-sm mb-1" data-testid="text-update-title">
                  Nouvelle version disponible
                </h3>
                <p className="text-sm sm:text-xs text-gray-600 dark:text-gray-300 mb-3" data-testid="text-update-message">
                  Une mise à jour d'Educafric est disponible. Rafraîchissez pour profiter des dernières améliorations.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    size="sm"
                    onClick={handleUpdate}
                    className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto"
                    data-testid="button-apply-update"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Mettre à jour
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleDismiss}
                    className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 w-full sm:w-auto"
                    data-testid="button-dismiss-update"
                  >
                    Plus tard
                  </Button>
                </div>
              </div>
              
              <button
                onClick={handleDismiss}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full p-1 transition-colors"
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
