import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { Globe, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';


interface ModernDashboardLayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  userStats?: Array<{
    label: string;
    value: string;
    color: string;
  }>;
}

export const ModernDashboardLayout = ({ 
  title, 
  subtitle, 
  children, 
  className,
  userStats = []
}: ModernDashboardLayoutProps) => {
  const { language, setLanguage } = useLanguage();
  const { user, logout } = useAuth();

  return (
    <div className="modern-dashboard-container min-h-screen">
      {/* Modern Header */}
      <div className="modern-header">
        <div className="header-content">
          <div className="title-section">
            <h1 className="dashboard-title">{title}</h1>
            {subtitle && <p className="dashboard-subtitle">{subtitle}</p>}
          </div>
          
          {/* User Info Pills & Controls */}
          <div className="user-info-pills">
            <div className="user-pill primary">
              <span className="pill-label">{language === 'fr' ? 'Rôle' : 'Role'}</span>
              <span className="pill-value">{user?.role || 'User'}</span>
            </div>
            {(Array.isArray(userStats) ? userStats : []).map((stat, index) => (
              <div key={index} className={`user-pill ${stat.color}`}>
                <span className="pill-label">{stat.label}</span>
                <span className="pill-value">{stat.value}</span>
              </div>
            ))}
            
            {/* Simple Language Switch */}
            <div className="flex items-center space-x-1 bg-white rounded-lg shadow-sm border p-1">
              <Globe className="w-4 h-4 text-gray-500 mr-1" />
              <button
                onClick={() => setLanguage('en')}
                className={cn(
                  "px-2 py-1 text-xs rounded font-medium transition-all duration-200",
                  language === 'en' 
                    ? "bg-orange-500 text-white shadow-sm" 
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                )}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('fr')}
                className={cn(
                  "px-2 py-1 text-xs rounded font-medium transition-all duration-200",
                  language === 'fr' 
                    ? "bg-orange-500 text-white shadow-sm" 
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                )}
              >
                FR
              </button>
            </div>

            {/* Logout Button */}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={logout}
              className="logout-button"
            >
              <LogOut className="w-4 h-4 mr-2" />
              {language === 'fr' ? 'Déconnexion' : 'Logout'}
            </Button>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className={cn("modern-content", className)}>
        {children}
      </div>

      <style>{`
        .modern-dashboard-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #f6f7fb 0%, #e9ecef 100%);
          font-family: "Nunito", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }

        .modern-header {
          background: rgb(254, 254, 254);
          box-shadow: 0 0.5px 0 1px rgba(255, 255, 255, 0.23) inset,
                      0 1px 0 0 rgba(255, 255, 255, 0.66) inset, 
                      0 4px 16px rgba(0, 0, 0, 0.12);
          border-radius: 0 0 15px 15px;
          padding: 20px 30px;
          margin-bottom: 20px;
        }
        
        @media (max-width: 640px) {
          .modern-header {
            padding: 15px 20px;
            margin-bottom: 15px;
          }
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 20px;
        }
        
        @media (max-width: 640px) {
          .header-content {
            flex-direction: column;
            gap: 15px;
            align-items: flex-start;
          }
          
          .user-info-pills {
            width: 100%;
            justify-content: space-between;
            flex-wrap: wrap;
          }
          
          .logout-button {
            width: 100%;
            justify-content: center;
            margin-top: 10px;
          }
        }

        .title-section {
          flex: 1;
        }

        .dashboard-title {
          font-size: 2rem;
          font-weight: 700;
          color: #2d3748;
          margin: 0 0 8px 0;
          font-family: "Nunito", sans-serif;
        }

        .dashboard-subtitle {
          font-size: 1rem;
          color: #718096;
          margin: 0;
          font-weight: 500;
        }
        
        @media (max-width: 640px) {
          .dashboard-title {
            font-size: 1.5rem;
          }
          
          .dashboard-subtitle {
            font-size: 0.875rem;
          }
        }

        .user-info-pills {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          align-items: center;
        }

        .user-pill {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 12px 16px;
          border-radius: 12px;
          min-width: 80px;
          box-shadow: rgba(0, 0, 0, 0.16) 0px 1px 3px;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .user-pill:hover {
          transform: translateY(-2px);
          box-shadow: rgba(0, 0, 0, 0.2) 0px 4px 12px;
        }

        .user-pill.primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .user-pill.blue {
          background: linear-gradient(135deg, #7c88e0 0%, #c3f4fc 100%);
          color: #2d3748;
        }

        .user-pill.green {
          background: linear-gradient(135deg, #97e7d1 0%, #ecfcc3 100%);
          color: #2d3748;
        }

        .user-pill.orange {
          background: linear-gradient(135deg, #e5a243 0%, #f7f7aa 100%);
          color: #2d3748;
        }

        .user-pill.purple {
          background: linear-gradient(135deg, #b99fed 0%, #e0c3fc 100%);
          color: #2d3748;
        }

        .user-pill.pink {
          background: linear-gradient(135deg, #fc8ebe 0%, #fce5c3 100%);
          color: #2d3748;
        }

        .pill-label {
          font-size: 0.75rem;
          opacity: 0.8;
          margin-bottom: 2px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .pill-value {
          font-size: 1rem;
          font-weight: 700;
        }

        .language-toggle {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          transition: all 0.3s ease;
        }

        .language-toggle:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }

        .logout-button {
          color: #ef4444;
          transition: all 0.3s ease;
        }

        .logout-button:hover {
          background: #fef2f2;
          color: #dc2626;
        }

        .modern-content {
          padding: 0 30px 30px;
          max-width: 1400px;
          margin: 0 auto;
        }

        @media (max-width: 768px) {
          .header-content {
            flex-direction: column;
            align-items: flex-start;
          }

          .user-info-pills {
            width: 100%;
            justify-content: flex-start;
          }

          .dashboard-title {
            font-size: 1.5rem;
          }

          .modern-content {
            padding: 0 15px 20px;
          }
        }
      `}</style>
    </div>
  );
};

export default ModernDashboardLayout;