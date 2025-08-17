import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X, ChevronDown, ChevronUp } from 'lucide-react';

interface MobileAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary';
  color?: string;
}

interface MobileActionsOverlayProps {
  title: string;
  actions: MobileAction[];
  maxVisibleButtons?: number;
  className?: string;
}

const MobileActionsOverlay: React.FC<MobileActionsOverlayProps> = ({
  title,
  actions,
  maxVisibleButtons = 3,
  className = ''
}) => {
  const [showAll, setShowAll] = useState(false);
  const [overlayOpen, setOverlayOpen] = useState(false);

  // Détection mobile
  const isMobile = window.innerWidth <= 768;

  if (!isMobile) {
    // Version desktop - afficher tous les boutons normalement
    return (
      <div className={`flex flex-wrap gap-2 ${className}`}>
        {(Array.isArray(actions) ? actions : []).map((action) => (
          <Button
            key={action.id}
            onClick={action.onClick}
            variant={action.variant || 'default'}
            className={`${action.color || 'bg-blue-600 hover:bg-blue-700'} text-white`}
            data-testid={`button-${action.id}`}
          >
            {action.icon}
            <span className="ml-2">{action.label}</span>
          </Button>
        ))}
      </div>
    );
  }

  // Version mobile avec superposition
  const visibleActions = showAll ? actions : actions.slice(0, maxVisibleButtons);
  const hasMoreActions = (Array.isArray(actions) ? actions.length : 0) > maxVisibleButtons;

  return (
    <>
      {/* Boutons visibles mobile */}
      <div className={`space-y-2 ${className}`}>
        <div className="grid grid-cols-1 gap-2">
          {(Array.isArray(visibleActions) ? visibleActions : []).map((action) => (
            <Button
              key={action.id}
              onClick={action.onClick}
              variant={action.variant || 'default'}
              className={`${action.color || 'bg-blue-600 hover:bg-blue-700'} text-white h-12 text-sm flex items-center justify-center`}
              data-testid={`button-mobile-${action.id}`}
            >
              {action.icon}
              <span className="ml-2 text-xs">{action.label}</span>
            </Button>
          ))}
          
          {hasMoreActions && !showAll && (
            <Button
              onClick={() => setOverlayOpen(true)}
              variant="outline"
              className="h-12 border-2 border-dashed border-gray-300 text-gray-600 flex items-center justify-center"
              data-testid="button-more-actions"
            >
              <ChevronDown className="w-4 h-4 mr-2" />
              <span className="text-xs">Plus d'actions (+{(Array.isArray(actions) ? actions.length : 0) - maxVisibleButtons})</span>
            </Button>
          )}
        </div>
      </div>

      {/* Overlay mobile pour actions supplémentaires */}
      {overlayOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
          <Card className="w-full max-h-[70vh] overflow-y-auto bg-white rounded-t-3xl shadow-2xl">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                <Button
                  onClick={() => setOverlayOpen(false)}
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  data-testid="button-close-overlay"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <div className="p-4 space-y-3">
              {(Array.isArray(actions) ? actions : []).map((action) => (
                <Button
                  key={action.id}
                  onClick={() => {
                    action.onClick();
                    setOverlayOpen(false);
                  }}
                  variant={action.variant || 'default'}
                  className={`${action.color || 'bg-blue-600 hover:bg-blue-700'} text-white w-full h-14 text-base flex items-center justify-start px-4`}
                  data-testid={`button-overlay-${action.id}`}
                >
                  {action.icon}
                  <span className="ml-3">{action.label}</span>
                </Button>
              ))}
            </div>
          </Card>
        </div>
      )}
    </>
  );
};

export default MobileActionsOverlay;