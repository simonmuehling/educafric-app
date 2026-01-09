import { ReactNode } from 'react';
import { Search, Bell, ArrowUp, ArrowDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export const ModernContainer = ({ children, className }: { children: ReactNode; className?: string }) => (
  <div className={cn("min-h-screen bg-[#F3F5F7] font-['Plus_Jakarta_Sans',sans-serif]", className)}>
    {children}
  </div>
);

export const ModernTopBar = ({ 
  searchPlaceholder = 'Rechercher...', 
  userName = 'Admin',
  userInitials = 'AD',
  notificationCount = 0,
  onSearch,
  children
}: { 
  searchPlaceholder?: string;
  userName?: string;
  userInitials?: string;
  notificationCount?: number;
  onSearch?: (value: string) => void;
  children?: ReactNode;
}) => (
  <div className="border-b border-[#F3F5F7] bg-white px-4 md:px-8 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
    <div className="flex items-center gap-6 px-6 py-3 border border-[#C3D4E9] rounded-full bg-white/80 w-full md:max-w-md">
      <Search className="w-5 h-5 text-[#90A3BF]" />
      <input 
        type="text" 
        placeholder={searchPlaceholder}
        onChange={(e) => onSearch?.(e.target.value)}
        className="border-none outline-none w-full bg-transparent text-sm"
      />
    </div>
    {children}
    <div className="flex items-center gap-4">
      <button className="relative w-11 h-11 rounded-full border border-[#C3D4E9] flex items-center justify-center hover:bg-gray-50 transition">
        <Bell className="w-5 h-5 text-[#596780]" />
        {notificationCount > 0 && (
          <span className="absolute -top-0.5 right-1 w-2.5 h-2.5 bg-red-500 rounded-full" />
        )}
      </button>
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#7C5CFC] to-[#5CAFFC] flex items-center justify-center text-white font-bold">
          {userInitials}
        </div>
        <span className="font-semibold text-[#1A202C] hidden md:block">{userName}</span>
      </div>
    </div>
  </div>
);

export const ModernContent = ({ children, className }: { children: ReactNode; className?: string }) => (
  <div className={cn("p-4 md:p-8", className)}>
    {children}
  </div>
);

export const ModernCard = ({ 
  children, 
  className,
  noPadding = false
}: { 
  children: ReactNode; 
  className?: string;
  noPadding?: boolean;
}) => (
  <div className={cn(
    "bg-white rounded-xl shadow-sm",
    !noPadding && "p-6",
    className
  )}>
    {children}
  </div>
);

export const ModernCardHeader = ({ 
  title, 
  action,
  children 
}: { 
  title: string; 
  action?: ReactNode;
  children?: ReactNode;
}) => (
  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
    <h2 className="font-semibold text-[#1A202C] text-lg">{title}</h2>
    {action}
    {children}
  </div>
);

export const ModernStat = ({ 
  value, 
  label, 
  currency = 'XAF',
  trend,
  trendValue,
  icon: Icon
}: { 
  value: string | number;
  label: string;
  currency?: string;
  trend?: 'up' | 'down';
  trendValue?: string;
  icon?: React.ComponentType<{ className?: string }>;
}) => (
  <div className="flex-1">
    <div className="flex items-center gap-3 mb-3">
      {Icon && (
        <div className="w-12 h-12 rounded-xl bg-[#7C5CFC]/10 flex items-center justify-center">
          <Icon className="w-6 h-6 text-[#7C5CFC]" />
        </div>
      )}
      <div>
        <div className="flex items-center gap-2">
          <span className="text-2xl md:text-3xl font-bold text-[#1A202C]">{value}</span>
          {currency && <span className="text-sm font-semibold text-[#90A3BF]">{currency}</span>}
          {trend && trendValue && (
            <span className={cn(
              "flex items-center gap-1 text-sm font-semibold",
              trend === 'up' ? 'text-green-500' : 'text-red-500'
            )}>
              {trend === 'up' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
              {trendValue}
            </span>
          )}
        </div>
        <p className="text-xs font-bold text-[#90A3BF] uppercase tracking-wide">{label}</p>
      </div>
    </div>
  </div>
);

export const ModernStatsRow = ({ children, className }: { children: ReactNode; className?: string }) => (
  <div className={cn("flex flex-col md:flex-row gap-6 mb-8", className)}>
    {children}
  </div>
);

export const ModernStatCard = ({ 
  icon: Icon, 
  label, 
  value, 
  color = '#7C5CFC',
  trend
}: { 
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  label: string;
  value: string | number;
  color?: string;
  trend?: 'up' | 'down' | 'neutral';
}) => (
  <div className="flex items-center gap-4 p-4 rounded-xl bg-[#F3F5F7]/50 hover:bg-[#F3F5F7] transition cursor-pointer">
    <div 
      className="w-12 h-12 rounded-xl flex items-center justify-center"
      style={{ backgroundColor: `${color}20` }}
    >
      <Icon className="w-6 h-6" style={{ color }} />
    </div>
    <div className="flex-1">
      <p className="text-xs text-[#90A3BF] font-medium uppercase">{label}</p>
      <p className="text-xl font-bold text-[#1A202C]">{value}</p>
    </div>
    {trend === 'up' && <ArrowUp className="w-5 h-5 text-green-500" />}
    {trend === 'down' && <ArrowDown className="w-5 h-5 text-red-500" />}
  </div>
);

export const ModernGrid = ({ 
  children, 
  cols = 2,
  className 
}: { 
  children: ReactNode; 
  cols?: 1 | 2 | 3 | 4;
  className?: string;
}) => {
  const colsClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
  };
  return (
    <div className={cn("grid gap-4", colsClass[cols], className)}>
      {children}
    </div>
  );
};

export const ModernTable = ({ 
  headers, 
  children,
  className 
}: { 
  headers: string[];
  children: ReactNode;
  className?: string;
}) => (
  <div className={cn("overflow-x-auto", className)}>
    <table className="w-full text-left">
      <thead>
        <tr className="border-b border-[#F3F5F7]">
          {headers.map((header, i) => (
            <th key={i} className="pb-4 text-xs font-medium text-[#90A3BF] uppercase">
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {children}
      </tbody>
    </table>
  </div>
);

export const ModernTableRow = ({ children, className }: { children: ReactNode; className?: string }) => (
  <tr className={cn("border-b border-[#F3F5F7] last:border-0 hover:bg-[#F3F5F7]/30 transition", className)}>
    {children}
  </tr>
);

export const ModernTableCell = ({ children, className }: { children: ReactNode; className?: string }) => (
  <td className={cn("py-4 text-sm font-semibold text-[#596780]", className)}>
    {children}
  </td>
);

export const ModernAvatar = ({ 
  name, 
  subtitle,
  size = 'md'
}: { 
  name: string;
  subtitle?: string;
  size?: 'sm' | 'md' | 'lg';
}) => {
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base'
  };
  return (
    <div className="flex items-center gap-3">
      <div className={cn(
        "rounded-full bg-gradient-to-br from-[#7C5CFC] to-[#CC6FF8] flex items-center justify-center text-white font-bold",
        sizeClasses[size]
      )}>
        {initials}
      </div>
      {(name || subtitle) && (
        <div>
          <p className="font-semibold text-sm text-[#1A202C]">{name}</p>
          {subtitle && <p className="text-xs text-[#90A3BF]">{subtitle}</p>}
        </div>
      )}
    </div>
  );
};

export const ModernBadge = ({ 
  status, 
  labels 
}: { 
  status: 'success' | 'warning' | 'error' | 'info' | 'pending';
  labels: Record<string, string>;
}) => {
  const colors = {
    success: 'bg-green-100 text-green-700',
    warning: 'bg-yellow-100 text-yellow-700',
    error: 'bg-red-100 text-red-700',
    info: 'bg-blue-100 text-blue-700',
    pending: 'bg-orange-100 text-orange-700'
  };
  return (
    <span className={cn("px-3 py-1 rounded-full text-xs font-semibold", colors[status])}>
      {labels[status] || status}
    </span>
  );
};

export const ModernButton = ({ 
  children, 
  variant = 'primary',
  size = 'md',
  icon: Icon,
  onClick,
  className,
  disabled
}: { 
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ComponentType<{ className?: string }>;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}) => {
  const variants = {
    primary: 'bg-[#7C5CFC] text-white hover:bg-[#6B4CE0]',
    secondary: 'bg-[#5CAFFC] text-white hover:bg-[#4A9FE0]',
    outline: 'bg-white border-2 border-[#7C5CFC] text-[#7C5CFC] hover:bg-[#7C5CFC]/5',
    ghost: 'bg-transparent text-[#596780] hover:bg-[#F3F5F7]'
  };
  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-5 py-3 text-sm',
    lg: 'px-6 py-4 text-base'
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex items-center justify-center gap-2 rounded-xl font-semibold transition",
        variants[variant],
        sizes[size],
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      {Icon && <Icon className="w-5 h-5" />}
      {children}
    </button>
  );
};

export const ModernEmptyState = ({ 
  icon: Icon, 
  title, 
  description,
  action
}: { 
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?: ReactNode;
}) => (
  <div className="flex flex-col items-center justify-center py-12 text-center">
    <div className="w-16 h-16 rounded-full bg-[#F3F5F7] flex items-center justify-center mb-4">
      <Icon className="w-8 h-8 text-[#90A3BF]" />
    </div>
    <h3 className="text-lg font-semibold text-[#1A202C] mb-2">{title}</h3>
    {description && <p className="text-sm text-[#90A3BF] mb-4 max-w-md">{description}</p>}
    {action}
  </div>
);

export const ModernTabs = ({ 
  tabs, 
  activeTab, 
  onChange 
}: { 
  tabs: { id: string; label: string; icon?: React.ComponentType<{ className?: string }> }[];
  activeTab: string;
  onChange: (id: string) => void;
}) => (
  <div className="flex flex-wrap gap-2 p-1 bg-[#F3F5F7] rounded-xl mb-6">
    {tabs.map((tab) => (
      <button
        key={tab.id}
        onClick={() => onChange(tab.id)}
        className={cn(
          "flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition",
          activeTab === tab.id
            ? 'bg-white text-[#7C5CFC] shadow-sm'
            : 'text-[#596780] hover:text-[#1A202C]'
        )}
      >
        {tab.icon && <tab.icon className="w-4 h-4" />}
        <span className="hidden sm:inline">{tab.label}</span>
      </button>
    ))}
  </div>
);

export const ModernSplitLayout = ({ 
  left, 
  right,
  leftWidth = 70
}: { 
  left: ReactNode;
  right: ReactNode;
  leftWidth?: number;
}) => (
  <div className="flex flex-col lg:flex-row gap-6">
    <div style={{ width: '100%' }} className={`lg:w-[${leftWidth}%] space-y-6`}>
      {left}
    </div>
    <div style={{ width: '100%' }} className={`lg:w-[${100 - leftWidth}%] space-y-6`}>
      {right}
    </div>
  </div>
);

export const ModernPageTitle = ({ 
  title, 
  subtitle,
  action
}: { 
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) => (
  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
    <div>
      <h1 className="text-xl md:text-2xl font-bold text-[#1A202C]">{title}</h1>
      {subtitle && <p className="text-sm text-[#90A3BF] mt-1">{subtitle}</p>}
    </div>
    {action}
  </div>
);

export const ModernLoadingSpinner = ({ text }: { text?: string }) => (
  <div className="flex flex-col items-center justify-center py-12">
    <div className="w-12 h-12 border-4 border-[#F3F5F7] border-t-[#7C5CFC] rounded-full animate-spin mb-4" />
    {text && <p className="text-sm text-[#90A3BF]">{text}</p>}
  </div>
);
