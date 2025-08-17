// React import removed
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
  badge?: string;
  badgeVariant?: "default" | "secondary" | "destructive" | "outline";
}

export function DashboardHeader({ title, subtitle, badge, badgeVariant = "default" }: DashboardHeaderProps) {
  return (
    <Card className="mb-6 border-0 shadow-sm bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
      <CardContent className="pt-6 pb-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                {title}
              </h1>
              {badge && (
                <Badge variant={badgeVariant} className="text-xs">
                  {badge}
                </Badge>
              )}
            </div>
            {subtitle && (
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                {subtitle}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default DashboardHeader;