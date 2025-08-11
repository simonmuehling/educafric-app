import React, { useState } from 'react';
import { Search, X, Filter } from 'lucide-react';
import { useStableCallback } from '@/hooks/useStableCallback';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

interface MobileCompactSearchProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  onFilter?: () => void;
  className?: string;
}

export function MobileCompactSearch({
  placeholder,
  onSearch,
  onFilter,
  className
}: MobileCompactSearchProps) {
  const { language } = useLanguage();
  const [isExpanded, setIsExpanded] = useState(false);
  const [query, setQuery] = useState('');

  const text = {
    fr: {
      search: 'Rechercher...',
      clear: 'Effacer',
      filter: 'Filtrer'
    },
    en: {
      search: 'Search...',
      clear: 'Clear',
      filter: 'Filter'
    }
  };

  const t = text[language as keyof typeof text];

  const handleSearchClick = () => {
    if (!isExpanded) {
      setIsExpanded(true);
    }
  };

  const handleClose = () => {
    setIsExpanded(false);
    setQuery('');
    onSearch?.('');
  };

  const handleSubmit = useStableCallback((e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(query);
    setIsExpanded(false);
  });

  if (!isExpanded) {
    return (
      <div className={cn("flex items-center space-x-2", className)}>
        <button
          onClick={handleSearchClick}
          className="flex items-center justify-center w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full shadow-sm border border-gray-200/50 text-gray-600 hover:text-gray-900 transition-colors"
          data-testid="button-search-expand"
        >
          <Search className="w-4 h-4" />
        </button>
        {onFilter && (
          <button
            onClick={onFilter}
            className="flex items-center justify-center w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full shadow-sm border border-gray-200/50 text-gray-600 hover:text-gray-900 transition-colors"
            data-testid="button-filter"
          >
            <Filter className="w-4 h-4" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={cn(
      "fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 p-3",
      className
    )}>
      <form onSubmit={handleSubmit} className="flex items-center space-x-2">
        <div className="flex-1 relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e?.target?.value)}
            placeholder={placeholder || t.search}
            className="w-full px-3 py-2 pr-8 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            autoFocus
            data-testid="input-search"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              data-testid="button-clear-search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <button
          type="submit"
          className="px-3 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
          data-testid="button-search-submit"
        >
          <Search className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={handleClose}
          className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
          data-testid="button-search-close"
        >
          <X className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}

interface MobileInfoBubbleProps {
  children: React.ReactNode;
  trigger: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

export function MobileInfoBubble({
  children,
  trigger,
  position = 'top',
  className
}: MobileInfoBubbleProps) {
  const [isVisible, setIsVisible] = useState(false);

  const positionClasses = {
    top: '-top-2 left-1/2 transform -translate-x-1/2 -translate-y-full',
    bottom: '-bottom-2 left-1/2 transform -translate-x-1/2 translate-y-full',
    left: 'top-1/2 -left-2 transform -translate-y-1/2 -translate-x-full',
    right: 'top-1/2 -right-2 transform -translate-y-1/2 translate-x-full'
  };

  return (
    <div className="relative inline-block">
      <div
        onClick={() => setIsVisible(!isVisible)}
        className="cursor-pointer"
        data-testid="bubble-trigger"
      >
        {trigger}
      </div>
      
      {isVisible && (
        <>
          {/* Backdrop to close bubble */}
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            onClick={() => setIsVisible(false)}
            data-testid="bubble-backdrop"
          />
          
          {/* Compact bubble */}
          <div className={cn(
            "absolute z-50 max-w-xs p-3 bg-white rounded-lg shadow-lg border border-gray-200",
            positionClasses[position],
            className
          )}>
            <div className="text-sm text-gray-700">
              {children}
            </div>
            
            {/* Close button */}
            <button
              onClick={() => setIsVisible(false)}
              className="absolute top-1 right-1 p-1 text-gray-400 hover:text-gray-600"
              data-testid="button-bubble-close"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}

interface MobileOverlayInfoProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export function MobileOverlayInfo({
  isOpen,
  onClose,
  title,
  children
}: MobileOverlayInfoProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        data-testid="overlay-backdrop"
      />
      
      {/* Content */}
      <div className="relative w-full max-w-md mx-4 mb-4 sm:mb-0 bg-white rounded-t-2xl sm:rounded-2xl shadow-xl border border-gray-200 max-h-[80vh] overflow-y-auto">
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
              data-testid="button-overlay-close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
        
        {/* Content */}
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  );
}