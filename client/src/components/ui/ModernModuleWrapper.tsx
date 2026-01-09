import { ReactNode } from 'react';
import { Search, Bell } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';

interface ModernModuleWrapperProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  showTopBar?: boolean;
  searchPlaceholder?: string;
  onSearch?: (value: string) => void;
  actions?: ReactNode;
}

export const ModernModuleWrapper = ({ 
  children, 
  title,
  subtitle,
  showTopBar = true,
  searchPlaceholder,
  onSearch,
  actions
}: ModernModuleWrapperProps) => {
  const { language } = useLanguage();
  const { user } = useAuth();

  const defaultSearchPlaceholder = language === 'fr' ? 'Rechercher...' : 'Search...';
  const userInitials = ((user as any)?.name || (user as any)?.firstName || user?.email || 'U')
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen bg-[#F3F5F7] font-['Plus_Jakarta_Sans',sans-serif]">
      {showTopBar && (
        <div className="border-b border-[#F3F5F7] bg-white px-4 md:px-8 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-6 px-6 py-3 border border-[#C3D4E9] rounded-full bg-white/80 w-full md:max-w-md">
            <Search className="w-5 h-5 text-[#90A3BF]" />
            <input 
              type="text" 
              placeholder={searchPlaceholder || defaultSearchPlaceholder}
              onChange={(e) => onSearch?.(e.target.value)}
              className="border-none outline-none w-full bg-transparent text-sm"
            />
          </div>
          
          <div className="flex items-center gap-4">
            {actions}
            <button className="relative w-11 h-11 rounded-full border border-[#C3D4E9] flex items-center justify-center hover:bg-gray-50 transition">
              <Bell className="w-5 h-5 text-[#596780]" />
              <span className="absolute -top-0.5 right-1 w-2.5 h-2.5 bg-red-500 rounded-full" />
            </button>
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#7C5CFC] to-[#5CAFFC] flex items-center justify-center text-white font-bold text-sm">
              {userInitials}
            </div>
          </div>
        </div>
      )}

      <div className="p-4 md:p-8">
        {(title || subtitle) && (
          <div className="mb-6">
            {title && <h1 className="text-xl md:text-2xl font-bold text-[#1A202C]">{title}</h1>}
            {subtitle && <p className="text-sm text-[#90A3BF] mt-1">{subtitle}</p>}
          </div>
        )}
        
        <div className="modern-animate-in">
          {children}
        </div>
      </div>
    </div>
  );
};

export const ModernCard = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <div className={`bg-white rounded-xl p-6 shadow-sm ${className}`}>
    {children}
  </div>
);

export const ModernCardHeader = ({ 
  title, 
  icon: Icon,
  action 
}: { 
  title: string; 
  icon?: React.ComponentType<{ className?: string }>;
  action?: ReactNode;
}) => (
  <div className="flex justify-between items-center mb-6">
    <h2 className="font-semibold text-[#1A202C] text-lg flex items-center gap-2">
      {Icon && <Icon className="w-5 h-5 text-[#7C5CFC]" />}
      {title}
    </h2>
    {action}
  </div>
);

export const ModernStatsGrid = ({ children }: { children: ReactNode }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
    {children}
  </div>
);

export const ModernStatBox = ({ 
  icon: Icon, 
  label, 
  value, 
  trend,
  color = '#7C5CFC'
}: { 
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  label: string;
  value: string | number;
  trend?: 'up' | 'down' | 'neutral';
  color?: string;
}) => (
  <div className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition">
    <div className="flex items-center gap-4">
      <div 
        className="w-12 h-12 rounded-xl flex items-center justify-center"
        style={{ backgroundColor: `${color}15` }}
      >
        <Icon className="w-6 h-6" style={{ color }} />
      </div>
      <div className="flex-1">
        <p className="text-xs text-[#90A3BF] font-medium uppercase">{label}</p>
        <p className="text-xl font-bold text-[#1A202C]">{value}</p>
      </div>
      {trend === 'up' && (
        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
          <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </div>
      )}
      {trend === 'down' && (
        <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
          <svg className="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      )}
    </div>
  </div>
);

export const ModernButton = ({ 
  children, 
  variant = 'primary',
  icon: Icon,
  onClick,
  className = '',
  disabled = false
}: { 
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  icon?: React.ComponentType<{ className?: string }>;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}) => {
  const variants = {
    primary: 'bg-[#7C5CFC] text-white hover:bg-[#6B4CE0]',
    secondary: 'bg-[#5CAFFC] text-white hover:bg-[#4A9FE0]',
    outline: 'bg-white border-2 border-[#7C5CFC] text-[#7C5CFC] hover:bg-[#7C5CFC]/5'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold transition ${variants[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      {Icon && <Icon className="w-5 h-5" />}
      {children}
    </button>
  );
};

export const ModernEmptyState = ({ 
  icon: Icon, 
  title, 
  description 
}: { 
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
}) => (
  <div className="flex flex-col items-center justify-center py-12 text-center">
    <div className="w-16 h-16 rounded-full bg-[#F3F5F7] flex items-center justify-center mb-4">
      <Icon className="w-8 h-8 text-[#90A3BF]" />
    </div>
    <h3 className="text-lg font-semibold text-[#1A202C] mb-2">{title}</h3>
    {description && <p className="text-sm text-[#90A3BF] max-w-md">{description}</p>}
  </div>
);

export const ModernLoadingState = ({ text }: { text?: string }) => (
  <div className="flex flex-col items-center justify-center py-12">
    <div className="w-12 h-12 border-4 border-[#F3F5F7] border-t-[#7C5CFC] rounded-full animate-spin mb-4" />
    {text && <p className="text-sm text-[#90A3BF]">{text}</p>}
  </div>
);

export default ModernModuleWrapper;
