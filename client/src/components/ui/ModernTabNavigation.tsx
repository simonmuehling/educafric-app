import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TabItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

interface ModernTabNavigationProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

export const ModernTabNavigation = ({ 
  tabs, 
  activeTab, 
  onTabChange, 
  className 
}: ModernTabNavigationProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const activeTabData = tabs.find(tab => tab.id === activeTab);

  return (
    <div className={cn("modern-tab-navigation", className)}>
      {/* Desktop Navigation */}
      <div className="desktop-tabs"
           style={{
             display: 'flex',
             alignItems: 'center',
             gap: '8px',
             overflowX: 'auto',
             padding: '10px 0'
           }}>
        {(Array.isArray(tabs) ? tabs : []).map((tab, index) => (
          <button
            key={`desktop-${tab.id}-${index}`}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "tab-button",
              activeTab === tab.id && "active"
            )}
          >
            <div className="tab-icon">{tab.icon}</div>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Mobile Navigation */}
      <div className="mobile-tabs">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="mobile-tab-trigger"
        >
          <div className="tab-icon">{activeTabData?.icon}</div>
          <span className="tab-label">{activeTabData?.label}</span>
          <ChevronDown className={cn(
            "chevron",
            isMobileMenuOpen && "rotated"
          )} />
        </button>

        {isMobileMenuOpen && (
          <div className="mobile-dropdown">
            {(Array.isArray(tabs) ? tabs : []).map((tab, index) => (
              <button
                key={`mobile-${tab.id}-${index}`}
                onClick={() => {
                  onTabChange(tab.id);
                  setIsMobileMenuOpen(false);
                }}
                className={cn(
                  "dropdown-item",
                  activeTab === tab.id && "active"
                )}
              >
                <div className="tab-icon">{tab.icon}</div>
                <span className="tab-label">{tab.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .modern-tab-navigation {
          background: rgb(254, 254, 254);
          border-radius: 15px;
          box-shadow: 0 0.5px 0 1px rgba(255, 255, 255, 0.23) inset,
                      0 1px 0 0 rgba(255, 255, 255, 0.66) inset, 
                      0 4px 16px rgba(0, 0, 0, 0.12);
          padding: 8px;
          margin-bottom: 24px;
          font-family: "Nunito", sans-serif;
        }

        .desktop-tabs {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
        }

        .mobile-tabs {
          display: none;
          position: relative;
        }

        .tab-button {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 16px;
          border: none;
          background: transparent;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-weight: 600;
          color: #718096;
          min-width: 120px;
          justify-content: flex-start;
        }

        .tab-button:hover {
          background: rgba(124, 136, 224, 0.1);
          color: #4a5568;
          transform: translateY(-1px);
        }

        .tab-button.active {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          box-shadow: rgba(0, 0, 0, 0.2) 0px 2px 8px;
        }

        .tab-button.active:hover {
          background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%);
          color: white;
        }

        .tab-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 20px;
          height: 20px;
        }

        .tab-label {
          font-size: 0.875rem;
          font-weight: 600;
          white-space: nowrap;
        }

        .mobile-tab-trigger {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          padding: 12px 16px;
          border: none;
          background: transparent;
          border-radius: 10px;
          cursor: pointer;
          font-weight: 600;
          color: #4a5568;
        }

        .mobile-dropdown {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: rgb(254, 254, 254);
          border-radius: 10px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.16);
          z-index: 50;
          margin-top: 4px;
          overflow: hidden;
        }

        .dropdown-item {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          padding: 12px 16px;
          border: none;
          background: transparent;
          cursor: pointer;
          transition: all 0.2s ease;
          font-weight: 600;
          color: #718096;
          border-bottom: 1px solid #e2e8f0;
        }

        .dropdown-item:last-child {
          border-bottom: none;
        }

        .dropdown-item:hover {
          background: rgba(124, 136, 224, 0.1);
          color: #4a5568;
        }

        .dropdown-item.active {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .chevron {
          width: 16px;
          height: 16px;
          transition: transform 0.3s ease;
        }

        .chevron.rotated {
          transform: rotate(180deg);
        }

        @media (max-width: 768px) {
          .desktop-tabs {
            display: none;
          }

          .mobile-tabs {
            display: block;
          }
        }

        @media (max-width: 640px) {
          .tab-button {
            min-width: auto;
            flex: 1;
            justify-content: center;
          }

          .tab-label {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};

export default ModernTabNavigation;