import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface BilingualPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: {
    fr: string;
    en: string;
  };
  description?: {
    fr: string;
    en: string;
  };
  children?: React.ReactNode;
  showFooter?: boolean;
  confirmText?: {
    fr: string;
    en: string;
  };
  cancelText?: {
    fr: string;
    en: string;
  };
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmVariant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
}

export function BilingualPopup({
  open,
  onOpenChange,
  title,
  description,
  children,
  showFooter = true,
  confirmText = { fr: 'Confirmer', en: 'Confirm' },
  cancelText = { fr: 'Annuler', en: 'Cancel' },
  onConfirm,
  onCancel,
  confirmVariant = 'default'
}: BilingualPopupProps) {
  const { language } = useLanguage();
  const lang = language as 'fr' | 'en';

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onOpenChange(false);
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]" data-testid="popup-bilingual">
        <DialogHeader>
          <DialogTitle data-testid="popup-title">{title[lang]}</DialogTitle>
          {description && (
            <DialogDescription data-testid="popup-description">
              {description[lang]}
            </DialogDescription>
          )}
        </DialogHeader>

        {children && (
          <div className="py-4" data-testid="popup-content">
            {children}
          </div>
        )}

        {showFooter && (
          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCancel}
              data-testid="button-cancel"
            >
              {cancelText[lang]}
            </Button>
            {onConfirm && (
              <Button
                variant={confirmVariant}
                onClick={handleConfirm}
                data-testid="button-confirm"
              >
                {confirmText[lang]}
              </Button>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Hook pour utiliser facilement le popup
export function useBilingualPopup() {
  const [open, setOpen] = useState(false);

  const show = () => setOpen(true);
  const hide = () => setOpen(false);
  const toggle = () => setOpen(!open);

  return {
    open,
    show,
    hide,
    toggle,
    setOpen
  };
}
