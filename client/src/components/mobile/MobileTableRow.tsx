import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useIsMobile } from '@/hooks/use-mobile';
import MobileButtonLayout from './MobileButtonLayout';

interface MobileTableRowProps {
  id: string | number;
  type: 'teacher' | 'student' | 'parent';
  name: string;
  email?: string;
  subtitle?: string;
  badge?: {
    text: string;
    variant?: 'default' | 'secondary' | 'destructive' | 'outline';
    className?: string;
  };
  details?: Array<{
    label: string;
    value: string;
    icon?: React.ReactNode;
  }>;
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
  className?: string;
}

const MobileTableRow: React.FC<MobileTableRowProps> = ({
  id,
  type,
  name,
  email,
  subtitle,
  badge,
  details = [],
  onView,
  onEdit,
  onDelete,
  extraActions = [],
  isLoading = false,
  language = 'fr',
  className = ''
}) => {
  const isMobile = useIsMobile();

  if (!isMobile) {
    // Desktop version - return null to use original table layout
    return null;
  }

  return (
    <Card className={`p-4 hover:shadow-md transition-shadow ${className}`}>
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h4 
                className="text-base font-semibold text-gray-900 truncate"
                data-testid={`text-name-${type}-${id}`}
              >
                {name}
              </h4>
              {badge && (
                <Badge 
                  variant={badge.variant || 'default'}
                  className={badge.className}
                  data-testid={`badge-${type}-${id}`}
                >
                  {badge.text}
                </Badge>
              )}
            </div>
            {email && (
              <p 
                className="text-sm text-gray-600 truncate"
                data-testid={`text-email-${type}-${id}`}
              >
                {email}
              </p>
            )}
            {subtitle && (
              <p 
                className="text-sm text-gray-500 truncate"
                data-testid={`text-subtitle-${type}-${id}`}
              >
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Details Grid */}
        {details.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            {details.map((detail, index) => (
              <div 
                key={index} 
                className="flex items-center space-x-2 text-xs text-gray-600"
                data-testid={`detail-${detail.label.toLowerCase().replace(' ', '-')}-${type}-${id}`}
              >
                {detail.icon && <span className="shrink-0">{detail.icon}</span>}
                <div className="min-w-0">
                  <span className="text-gray-500">{detail.label}:</span>
                  <span className="ml-1 font-medium text-gray-700 truncate">
                    {detail.value}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Mobile Button Layout */}
        <MobileButtonLayout
          id={id}
          type={type}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
          extraActions={extraActions}
          isLoading={isLoading}
          language={language}
        />
      </div>
    </Card>
  );
};

export default MobileTableRow;