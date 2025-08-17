import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Menu, X, ChevronDown } from 'lucide-react';

interface MenuItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  href?: string;
  disabled?: boolean;
  children?: MenuItem[];
}

interface MobileMenuProps {
  items: MenuItem[];
  trigger?: React.ReactNode;
  className?: string;
  position?: 'left' | 'right';
}

export function MobileMenu({
  items,
  trigger,
  className,
  position = 'right'
}: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleExpanded = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const handleItemClick = (item: MenuItem) => {
    if (item.children && (Array.isArray(item.children) ? item.children.length : 0) > 0) {
      toggleExpanded(item.id);
    } else {
      if (item.onClick) {
        item.onClick();
      }
      setIsOpen(false);
    }
  };

  const renderMenuItem = (item: MenuItem, level = 0) => {
    const hasChildren = item.children && (Array.isArray(item.children) ? item.children.length : 0) > 0;
    const isExpanded = expandedItems.has(item.id);

    return (
      <div key={item.id}>
        <button
          onClick={() => handleItemClick(item)}
          disabled={item.disabled}
          className={cn(
            "w-full flex items-center justify-between px-4 py-3 text-left text-gray-700 hover:bg-gray-50 transition-colors",
            level > 0 && "pl-8 border-l-2 border-gray-200",
            item.disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          <div className="flex items-center space-x-3">
            {item.icon && (
              <span className="w-5 h-5 text-gray-500">
                {item.icon}
              </span>
            )}
            <span className="font-medium">
              {item.label}
            </span>
          </div>
          {hasChildren && (
            <ChevronDown 
              className={cn(
                "w-4 h-4 text-gray-400 transition-transform",
                isExpanded && "transform rotate-180"
              )}
            />
          )}
        </button>
        
        {hasChildren && isExpanded && (
          <div className="bg-gray-50">
            {item.children!.map(child => renderMenuItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={cn("relative", className)}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-10 h-10 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
        aria-label="Open mobile menu"
      >
        {trigger || (
          isOpen ? (
            <X className="w-6 h-6 text-gray-600" />
          ) : (
            <Menu className="w-6 h-6 text-gray-600" />
          )
        )}
      </button>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <>
          {/* Background Overlay */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu Content */}
          <div className={cn(
            "fixed top-0 bottom-0 w-80 max-w-[85vw] bg-white shadow-xl z-50 overflow-y-auto",
            position === 'right' ? 'right-0' : 'left-0'
          )}>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Menu
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-gray-100"
                aria-label="Close menu"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Menu Items */}
            <div className="py-2">
              {(Array.isArray(items) ? items : []).map(item => renderMenuItem(item))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Simplified dropdown menu for quick access
interface DropdownMenuProps {
  trigger: React.ReactNode;
  items: MenuItem[];
  className?: string;
}

export function DropdownMenu({
  trigger,
  items,
  className
}: DropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleItemClick = (item: MenuItem) => {
    if (item.onClick) {
      item.onClick();
    }
    setIsOpen(false);
  };

  return (
    <div className={cn("relative", className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center"
      >
        {trigger}
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-30"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full right-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-40">
            {(Array.isArray(items) ? items : []).map((item) => (
              <button
                key={item.id}
                onClick={() => handleItemClick(item)}
                disabled={item.disabled}
                className={cn(
                  "w-full flex items-center space-x-3 px-4 py-2 text-left text-gray-700 hover:bg-gray-50 first:rounded-t-md last:rounded-b-md",
                  item.disabled && "opacity-50 cursor-not-allowed"
                )}
              >
                {item.icon && (
                  <span className="w-4 h-4 text-gray-500">
                    {item.icon}
                  </span>
                )}
                <span className="text-sm">
                  {item.label}
                </span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// Add default export for compatibility
export default MobileMenu;
