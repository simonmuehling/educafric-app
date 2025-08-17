import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Edit, Trash2, Eye, MoreHorizontal } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface MobileButtonProps {
  id: string | number;
  type: 'teacher' | 'student' | 'parent' | 'generic';
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  extraActions?: Array<{
    id: string;
    label: string;
    icon: React.ReactNode;
    onClick: () => void;
    color?: string;
  }>;
  isLoading?: boolean;
  language?: 'fr' | 'en';
}

const MobileButtonLayout: React.FC<MobileButtonProps> = ({
  id,
  type,
  onView,
  onEdit,
  onDelete,
  extraActions = [],
  isLoading = false,
  language = 'fr'
}) => {
  const isMobile = useIsMobile();

  const text = {
    fr: {
      view: 'Voir',
      edit: 'Modifier', 
      delete: 'Supprimer',
      more: 'Plus'
    },
    en: {
      view: 'View',
      edit: 'Edit',
      delete: 'Delete', 
      more: 'More'
    }
  };

  const t = text[language];

  if (!isMobile) {
    // Desktop layout - horizontal buttons
    return (
      <div className="flex space-x-2">
        {onView && (
          <Button
            variant="outline"
            size="sm"
            onClick={onView}
            disabled={isLoading}
            data-testid={`button-view-${type}-${id}`}
          >
            <Eye className="w-4 h-4 mr-1" />
            {t.view}
          </Button>
        )}
        {onEdit && (
          <Button
            variant="outline"
            size="sm"
            onClick={onEdit}
            disabled={isLoading}
            data-testid={`button-edit-${type}-${id}`}
            className="text-blue-600 hover:text-blue-700 border-blue-300 hover:border-blue-400"
          >
            <Edit className="w-4 h-4 mr-1" />
            {t.edit}
          </Button>
        )}
        {onDelete && (
          <Button
            variant="outline"
            size="sm"
            onClick={onDelete}
            disabled={isLoading}
            data-testid={`button-delete-${type}-${id}`}
            className="text-red-600 hover:text-red-700 border-red-300 hover:border-red-400"
          >
            <Trash2 className="w-4 h-4 mr-1" />
            {t.delete}
          </Button>
        )}
        {extraActions.map((action) => (
          <Button
            key={action.id}
            variant="outline"
            size="sm"
            onClick={action.onClick}
            disabled={isLoading}
            data-testid={`button-${action.id}-${type}-${id}`}
            className={action.color}
          >
            {action.icon}
            <span className="ml-1">{action.label}</span>
          </Button>
        ))}
      </div>
    );
  }

  // Mobile layout - stacked buttons under user names
  return (
    <div className="mt-3 space-y-2">
      <div className="grid grid-cols-2 gap-2">
        {onEdit && (
          <Button
            variant="outline"
            size="sm"
            onClick={onEdit}
            disabled={isLoading}
            data-testid={`button-mobile-edit-${type}-${id}`}
            className="bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100 hover:border-blue-300 h-10 text-xs"
          >
            <Edit className="w-3 h-3 mr-1" />
            {t.edit}
          </Button>
        )}
        {onDelete && (
          <Button
            variant="outline" 
            size="sm"
            onClick={onDelete}
            disabled={isLoading}
            data-testid={`button-mobile-delete-${type}-${id}`}
            className="bg-red-50 text-red-600 border-red-200 hover:bg-red-100 hover:border-red-300 h-10 text-xs"
          >
            <Trash2 className="w-3 h-3 mr-1" />
            {t.delete}
          </Button>
        )}
      </div>
      
      {(onView || extraActions.length > 0) && (
        <div className="flex space-x-2">
          {onView && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onView}
              disabled={isLoading}
              data-testid={`button-mobile-view-${type}-${id}`}
              className="flex-1 h-8 text-xs text-gray-600 hover:text-gray-800"
            >
              <Eye className="w-3 h-3 mr-1" />
              {t.view}
            </Button>
          )}
          {extraActions.slice(0, 2).map((action) => (
            <Button
              key={action.id}
              variant="ghost"
              size="sm"
              onClick={action.onClick}
              disabled={isLoading}
              data-testid={`button-mobile-${action.id}-${type}-${id}`}
              className="flex-1 h-8 text-xs"
            >
              {action.icon}
              <span className="ml-1">{action.label}</span>
            </Button>
          ))}
          {extraActions.length > 2 && (
            <Button
              variant="ghost"
              size="sm"
              disabled={isLoading}
              data-testid={`button-mobile-more-${type}-${id}`}
              className="h-8 px-2"
            >
              <MoreHorizontal className="w-3 h-3" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default MobileButtonLayout;