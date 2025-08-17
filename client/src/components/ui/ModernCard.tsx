// React import removed
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ModernCardProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  headerContent?: React.ReactNode;
  footer?: React.ReactNode;
  variant?: 'default' | 'gradient' | 'glass' | 'minimal';
}

export const ModernCard: React.FC<ModernCardProps> = ({
  title,
  subtitle,
  children,
  className,
  headerContent,
  footer,
  variant = 'default'
}) => {
  const variantClasses = {
    default: 'bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow',
    gradient: 'bg-gradient-to-br from-white to-gray-50 border border-gray-200 shadow-lg hover:shadow-xl transition-all',
    glass: 'bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg hover:shadow-xl transition-all',
    minimal: 'bg-transparent border-none shadow-none'
  };

  return (
    <Card className={cn(
      variantClasses[variant],
      'rounded-xl overflow-hidden',
      className
    )}>
      {(title || subtitle || headerContent) && (
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              {title && (
                <CardTitle className="text-lg font-semibold text-gray-800">
                  {title}
                </CardTitle>
              )}
              {subtitle && (
                <p className="text-sm text-gray-600 mt-1">
                  {subtitle}
                </p>
              )}
            </div>
            {headerContent}
          </div>
        </CardHeader>
      )}
      <CardContent className="pt-0">
        {children}
      </CardContent>
      {footer && (
        <div className="px-6 pb-6 pt-0">
          {footer}
        </div>
      )}
    </Card>
  );
};

// Alias pour compatibilité
export const ModernStatsCard = ModernCard;

export default ModernCard;