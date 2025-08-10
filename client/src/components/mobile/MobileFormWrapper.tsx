import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface MobileFormWrapperProps {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  onCancel?: () => void;
  submitLabel?: string;
  cancelLabel?: string;
  isSubmitting?: boolean;
  isValid?: boolean;
  children: React.ReactNode;
  className?: string;
  language?: 'fr' | 'en';
}

const MobileFormWrapper: React.FC<MobileFormWrapperProps> = ({
  title,
  isOpen,
  onClose,
  onSubmit,
  onCancel,
  submitLabel,
  cancelLabel,
  isSubmitting = false,
  isValid = true,
  children,
  className = '',
  language = 'fr'
}) => {
  const isMobile = useIsMobile();

  const text = {
    fr: {
      cancel: 'Annuler',
      submit: 'Valider',
      saving: 'Enregistrement...'
    },
    en: {
      cancel: 'Cancel',
      submit: 'Submit',
      saving: 'Saving...'
    }
  };

  const t = text[language];

  if (!isOpen) return null;

  if (isMobile) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex">
        <div className="w-full bg-white flex flex-col">
          {/* Mobile Header */}
          <div className="flex items-center justify-between p-4 border-b bg-white sticky top-0 z-10">
            <h2 className="text-lg font-semibold text-gray-900 truncate flex-1 mr-4">
              {title}
            </h2>
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 shrink-0"
              data-testid="button-mobile-close-form"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
          
          {/* Mobile Content */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className={`space-y-4 ${className}`}>
              {children}
            </div>
          </div>
          
          {/* Mobile Footer */}
          <div className="p-4 border-t bg-white sticky bottom-0">
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={onCancel || onClose}
                disabled={isSubmitting}
                data-testid="button-mobile-cancel-form"
                className="h-12"
              >
                {cancelLabel || t.cancel}
              </Button>
              <Button
                onClick={onSubmit}
                disabled={isSubmitting || !isValid}
                data-testid="button-mobile-submit-form"
                className="h-12 bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting 
                  ? t.saving 
                  : (submitLabel || t.submit)}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Desktop modal
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">{title}</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              data-testid="button-desktop-close-form"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className={`space-y-4 ${className}`}>
            {children}
          </div>

          <div className="flex gap-3 mt-6">
            <Button
              variant="outline"
              onClick={onCancel || onClose}
              className="flex-1"
              disabled={isSubmitting}
              data-testid="button-desktop-cancel-form"
            >
              {cancelLabel || t.cancel}
            </Button>
            <Button
              onClick={onSubmit}
              disabled={isSubmitting || !isValid}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              data-testid="button-desktop-submit-form"
            >
              {isSubmitting 
                ? t.saving 
                : (submitLabel || t.submit)}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileFormWrapper;