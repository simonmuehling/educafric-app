import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Save } from 'lucide-react';

interface MobileOptimizedFormProps {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  submitLabel?: string;
  submitIcon?: React.ReactNode;
  children: React.ReactNode;
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
  maxHeight?: string;
}

/**
 * Composant de formulaire optimisé pour mobile avec défilement fluide
 * Standards EDUCAFRIC pour l'expérience utilisateur mobile
 */
const MobileOptimizedForm: React.FC<MobileOptimizedFormProps> = ({
  title,
  isOpen,
  onClose,
  onSubmit,
  submitLabel = 'Enregistrer',
  submitIcon = <Save className="w-4 h-4" />,
  children,
  isLoading = false,
  disabled = false,
  className = '',
  maxHeight = 'max-h-[80vh]'
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/50 backdrop-blur-sm">
      <Card className={`w-full max-w-2xl mx-auto mt-8 mb-8 ${className}`}>
        <CardHeader className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <Button 
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-gray-100"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className={`p-0 ${maxHeight} overflow-y-auto`}>
          <div className="p-6 space-y-6">
            {children}
          </div>
          
          {/* Actions collantes en bas */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 flex gap-3 shadow-lg">
            <Button 
              onClick={onSubmit}
              disabled={disabled || isLoading}
              className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Enregistrement...
                </>
              ) : (
                <>
                  {submitIcon}
                  <span className="ml-2">{submitLabel}</span>
                </>
              )}
            </Button>
            <Button 
              onClick={onClose}
              variant="outline"
              className="px-6 border-gray-300 hover:bg-gray-50"
              disabled={isLoading}
            >
              Annuler
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MobileOptimizedForm;