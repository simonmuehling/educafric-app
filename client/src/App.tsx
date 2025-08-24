import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { usePWANotifications } from "@/hooks/usePWANotifications";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
import { SandboxProvider } from "@/contexts/SandboxContext";
import { SandboxPremiumProvider } from "@/components/sandbox/SandboxPremiumProvider";
import { handleRedirect } from "@/lib/firebase";
import React, { useEffect, lazy, Suspense, useState } from "react";

// Core pages - Always loaded (light components)
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import PasswordReset from "@/pages/PasswordReset";
import NotFound from "@/pages/not-found";

// UNIFIED MODULE LOADING - Eliminates Fast/Lazy confusion for 3500+ users
import { 
  LazyStudents, 
  LazyTeachers, 
  LazyGrades, 
  LazyAttendance, 
  LazyClasses,
  LazyHomework,
  LazyTimetable,
  LazyPayments,
  LazyReports,
  LazyProfile,
  LazyDirectorPage,
  LazyCommercialPage,
  LazyFreelancerPage,
  LazyParentsPage,
  LazySchoolGeolocation,
  LazyRoleBasedGeolocation,
  LazySecurityDashboard,
  LazyAdminPage,
  LazySandboxPage,
  LazyEnhancedSandbox,
  LazyUIShowcase
} from "@/components/LazyLoader";

// Initialize network optimizer for connection quality improvements
import "@/utils/networkOptimizer";

// Initialize global module preloader for instant loading
import { fastModuleLoader } from "@/utils/fastModuleLoader";

// HOOK ERROR PREVENTION - Prevents "Rendered fewer hooks than expected" forever
import { setupGlobalHookErrorPrevention, HookErrorBoundary } from "@/utils/hooksErrorPrevention";

// Light components - Regular imports OK
import Subscribe from "@/pages/Subscribe";
import Demo from "@/pages/Demo";
import GeolocationPricing from "@/pages/GeolocationPricing";
import SubscriptionSuccess from "@/pages/SubscriptionSuccess";
import SandboxLogin from "@/pages/SandboxLogin";
import SandboxDemo from "@/pages/SandboxDemo";
import CurrencyDemo from "@/pages/CurrencyDemo";
import Schools from "@/pages/Schools";
import TermsOfService from "@/pages/TermsOfService";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import BulkManagement from "@/pages/BulkManagement";
import ProfileFeatures from "@/pages/ProfileFeatures";
import ModernFormDemo from "@/pages/ModernFormDemo";
import UnauthorizedPage from "@/pages/UnauthorizedPage";
// PWA Install Prompt déjà importé dans les composants PWA
import DebugInspector from "@/pages/DebugInspector";
import PWAAnalyticsDemo from "@/pages/PWAAnalyticsDemo";
import EducationalConnections from "@/pages/EducationalConnections";
import SubscriptionManagement from "@/pages/SubscriptionManagement";
import SignatureTest from "@/pages/SignatureTest";

// Global module preloader for instant UI response
const useGlobalModulePreloader = () => {
  useEffect(() => {
    const startGlobalPreload = async () => {
      if (import.meta.env.DEV) {
        console.log('[GLOBAL_PRELOADER] 🚀 Starting global module preloading...');
      }
      await fastModuleLoader.preloadCriticalModules();
      if (import.meta.env.DEV) {
        console.log('[GLOBAL_PRELOADER] ✅ Critical modules ready for instant access');
      }
    };
    
    // Start preloading immediately when app loads
    startGlobalPreload();
  }, []);
};
const BulletinValidationTest = lazy(() => import("@/pages/BulletinValidationTest"));
const BulletinCreationTest = lazy(() => import("@/pages/BulletinCreationTest"));
const BulletinTestSuite = lazy(() => import("@/pages/BulletinTestSuite"));
const PWANotificationTest = lazy(() => import("@/pages/PWANotificationTest"));

// System components - Optimisés pour 3500+ utilisateurs
import InactivityMonitor from "@/components/auth/InactivityMonitor";
import EducafricFooter from "@/components/EducafricFooter";
import { ConsolidatedNotificationProvider } from "@/components/pwa/ConsolidatedNotificationSystem";
import { usePWAAnalytics } from "@/hooks/usePWAAnalytics";
import ConnectionStatusIndicator from "@/components/pwa/ConnectionStatusIndicator";
// WebInspector disabled to prevent fetch override interference with PWA analytics
// import WebInspector from "@/components/developer/WebInspector";
import { SimpleTutorial } from "@/components/tutorial/SimpleTutorial";
import RoleBasedDashboard from "@/components/RoleBasedDashboard";

// Demo components - Non critiques, lazy si nécessaire
import MicroInteractionsDemo from "@/components/demo/MicroInteractionsDemo";
import BilingualSandboxDashboard from "@/components/sandbox/BilingualSandboxDashboard";
import UpdatedSandboxDashboard from "@/components/sandbox/UpdatedSandboxDashboard";

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }

  return <>{children}</>;
}

// Main App Layout Component
function AppLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [tutorialVisible, setTutorialVisible] = useState(false);
  const { autoTrackPWAUsage } = usePWAAnalytics();

  // Initialize PWA analytics tracking - Fixed to prevent render loops
  React.useEffect(() => {
    // Only track once per session to prevent crashes
    const sessionKey = 'app_pwa_tracking_initialized';
    if (typeof window !== 'undefined' && !window.sessionStorage?.getItem(sessionKey)) {
      if (import.meta.env.DEV) {
        console.log('[APP] Initializing PWA analytics (one-time)');
      }
      autoTrackPWAUsage(user?.id);
      window.sessionStorage?.setItem(sessionKey, 'true');
    }
  }, []); // Remove dependencies to prevent loops

  // Expose tutorial function globally
  React.useEffect(() => {
    (window as any).showTutorial = () => {
      if (import.meta.env.DEV) {
        console.log('[TUTORIAL] 🚀 Global tutorial trigger activated!');
      }
      setTutorialVisible(true);
    };
    
    return () => {
      delete (window as any).showTutorial;
    };
  }, []);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="flex-grow">
          {children}
        </div>
        <EducafricFooter />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Main Content - Full Width (No Sidebar) */}
      <div className="flex flex-col flex-1 h-screen overflow-y-auto">
        {children}
        <InactivityMonitor warningTime={25} logoutTime={30} />
      </div>
      {/* WebInspector removed to prevent fetch override interference with PWA analytics */}
      
      {/* Tutorial Overlay */}
      {user && (
        <SimpleTutorial
          isVisible={tutorialVisible}
          userRole={user.role || 'Student'}
          onClose={() => setTutorialVisible(false)}
        />
      )}
    </div>
  );
}

// Router Component
function Router() {
  return (
    <Switch>
      {/* Public Routes */}
      <Route path="/" component={Home} />
      <Route path="/home" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/ui-showcase" component={LazyUIShowcase} />
      <Route path="/micro-interactions" component={MicroInteractionsDemo} />
      <Route path="/bilingual-sandbox" component={BilingualSandboxDashboard} />
      <Route path="/updated-sandbox" component={UpdatedSandboxDashboard} />
      <Route path="/currency-demo" component={CurrencyDemo} />
      <Route path="/pwa-analytics" component={PWAAnalyticsDemo} />
      <Route path="/educational-connections" component={EducationalConnections} />
      <Route path="/subscription" component={SubscriptionManagement} />
      
      {/* Protected Routes */}
      
      <Route path="/dashboard">
        <ProtectedRoute>
          <RoleBasedDashboard />
        </ProtectedRoute>
      </Route>
      
      <Route path="/student">
        <ProtectedRoute>
          <LazyStudents />
        </ProtectedRoute>
      </Route>
      
      <Route path="/students">
        <ProtectedRoute>
          <LazyStudents />
        </ProtectedRoute>
      </Route>
      
      <Route path="/teacher">
        <ProtectedRoute>
          <LazyTeachers />
        </ProtectedRoute>
      </Route>

      <Route path="/teachers">
        <ProtectedRoute>
          <LazyTeachers />
        </ProtectedRoute>
      </Route>
      
      <Route path="/schools">
        <ProtectedRoute>
          <Schools />
        </ProtectedRoute>
      </Route>
      
      <Route path="/classes">
        <ProtectedRoute>
          <LazyClasses />
        </ProtectedRoute>
      </Route>
      
      <Route path="/grades">
        <ProtectedRoute>
          <LazyGrades />
        </ProtectedRoute>
      </Route>
      
      <Route path="/attendance">
        <ProtectedRoute>
          <LazyAttendance />
        </ProtectedRoute>
      </Route>
      
      <Route path="/homework">
        <ProtectedRoute>
          <LazyHomework />
        </ProtectedRoute>
      </Route>
      
      <Route path="/timetable">
        <ProtectedRoute>
          <LazyTimetable />
        </ProtectedRoute>
      </Route>
      
      <Route path="/parent">
        <ProtectedRoute>
          <LazyParentsPage />
        </ProtectedRoute>
      </Route>

      <Route path="/parents">
        <ProtectedRoute>
          <LazyParentsPage />
        </ProtectedRoute>
      </Route>
      
      <Route path="/freelancer">
        <ProtectedRoute>
          <LazyFreelancerPage />
        </ProtectedRoute>
      </Route>
      
      <Route path="/commercial">
        <ProtectedRoute>
          <LazyCommercialPage />
        </ProtectedRoute>
      </Route>
      
      <Route path="/admin">
        <ProtectedRoute>
          <LazyAdminPage />
        </ProtectedRoute>
      </Route>
      
      <Route path="/director">
        <ProtectedRoute>
          <LazyDirectorPage />
        </ProtectedRoute>
      </Route>
      
      <Route path="/bulk-management">
        <ProtectedRoute>
          <BulkManagement />
        </ProtectedRoute>
      </Route>
      
      <Route path="/payments">
        <ProtectedRoute>
          <LazyPayments />
        </ProtectedRoute>
      </Route>
      
      <Route path="/reports">
        <ProtectedRoute>
          <LazyReports />
        </ProtectedRoute>
      </Route>
      
      <Route path="/settings">
        <ProtectedRoute>
          <LazyProfile />
        </ProtectedRoute>
      </Route>
      
      <Route path="/profile-settings">
        <ProtectedRoute>
          <LazyProfile />
        </ProtectedRoute>
      </Route>
      
      <Route path="/subscribe" component={Subscribe} />
      <Route path="/sandbox-login" component={SandboxLogin} />
      <Route path="/sandbox-demo" component={SandboxDemo} />
      
      <Route path="/profile">
        <ProtectedRoute>
          <LazyProfile />
        </ProtectedRoute>
      </Route>
      
      <Route path="/profile-features">
        <ProtectedRoute>
          <ProfileFeatures />
        </ProtectedRoute>
      </Route>
      
      <Route path="/demo" component={Demo} />
      <Route path="/subscription-success" component={SubscriptionSuccess} />
      <Route path="/geolocation-pricing" component={GeolocationPricing} />
      
      <Route path="/geolocation">
        <ProtectedRoute>
          <LazyRoleBasedGeolocation />
        </ProtectedRoute>
      </Route>
      
      <Route path="/school-geolocation">
        <ProtectedRoute>
          <LazySchoolGeolocation />
        </ProtectedRoute>
      </Route>
      
      <Route path="/forgot-password" component={PasswordReset} />
      <Route path="/reset-password/:token" component={PasswordReset} />
      
      {/* Developer Tools */}
      <Route path="/debug-inspector" component={DebugInspector} />
      <Route path="/sandbox" component={LazySandboxPage} />
      <Route path="/enhanced-sandbox" component={LazyEnhancedSandbox} />
      <Route path="/sandbox/pwa-connection">
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div></div>}>
          {(() => {
            const PWAConnectionTester = lazy(() => import('./components/sandbox/PWAConnectionTester'));
            return <PWAConnectionTester />;
          })()}
        </Suspense>
      </Route>
      <Route path="/sandbox-direct" component={() => (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full space-y-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold">Sandbox Direct Access</h2>
              <p className="mt-2 text-gray-600">Testing environment for EDUCAFRIC</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="space-y-4">
                <div className="text-sm text-gray-500">
                  <p className="font-medium mb-2">Working Test Accounts:</p>
                  <ul className="space-y-1 text-xs">
                    <li>• simon.admin@www.educafric.com (Site Admin) ✓</li>
                    <li>• parent.kamdem@gmail.com (Parent)</li>
                    <li>• teacher.demo@test.www.educafric.com (Teacher)</li>
                    <li>• student.demo@test.www.educafric.com (Student)</li>
                  </ul>
                  <p className="mt-3 text-xs">All passwords: "password"</p>
                </div>
                <button 
                  onClick={() => window.location.href = '/login'}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
                >
                  Go to Login
                </button>
              </div>
            </div>
          </div>
        </div>
      )} />
      
      <Route path="/security">
        <ProtectedRoute>
          <LazySecurityDashboard />
        </ProtectedRoute>
      </Route>
      
      <Route path="/unauthorized" component={UnauthorizedPage} />
      
      {/* Legal Pages */}
      <Route path="/privacy-policy" component={PrivacyPolicy} />
      <Route path="/terms-of-service" component={TermsOfService} />
      <Route path="/modern-forms" component={ModernFormDemo} />
      <Route path="/signature-test" component={SignatureTest} />
      <Route path="/bulletin-validation-test" component={BulletinValidationTest} />
      <Route path="/bulletin-creation-test" component={BulletinCreationTest} />
      <Route path="/bulletin-tests" component={BulletinTestSuite} />
      <Route path="/pwa-notifications-test" component={PWANotificationTest} />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

// Firebase Redirect Handler Component (simplified without reCAPTCHA)
function FirebaseRedirectHandler() {
  const [initialized, setInitialized] = useState(false);
  
  useEffect(() => {
    // FIXED: Avoid early return in useEffect to prevent hooks violation
    const checkRedirect = async () => {
      // Only initialize once to prevent repeated logs  
      if (initialized) {
        return; // Return from async function, not useEffect
      }
      
      try {
        if (import.meta.env.DEV) {
          console.log('Firebase redirect handler initialized (simplified)');
        }
        setInitialized(true);
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error('Firebase redirect handling error:', error);
        }
      }
    };
    
    checkRedirect();
  }, [initialized]);

  return null;
}

function App() {
  // Global module preloader for instant UI response
  useGlobalModulePreloader();
  
  useEffect(() => {
    // SETUP HOOK ERROR PREVENTION SYSTEM - PREVENTS CRASHES FOREVER
    setupGlobalHookErrorPrevention();
    
    // Configuration du filtre de console pour réduire le spam
    import("@/utils/consoleFilter").then(({ setupConsoleFilter }) => {
      setupConsoleFilter();
    }).catch(() => {});

    // Lightweight memory optimization for faster startup
    if (!import.meta.env.VITE_DISABLE_OPTIMIZER) {
      import("@/utils/memoryOptimizer").then(({ memoryOptimizer }) => {
        memoryOptimizer.start();
      }).catch(() => {
        // Silent fail for performance
      });
    }
    
    return () => {
      // Arrêter l'optimiseur à la fermeture
      import("@/utils/memoryOptimizer").then(({ memoryOptimizer }) => {
        memoryOptimizer.stop();
      }).catch(() => {});
    };
  }, []);

  return (
    <HookErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <LanguageProvider>
            <CurrencyProvider>
              <SandboxProvider>
                <SandboxPremiumProvider>
                  <ConsolidatedNotificationProvider>
                  <TooltipProvider>
                    <FirebaseRedirectHandler />
                    <AppLayout>
                      <ConnectionStatusIndicator />
                      <Router />
                    </AppLayout>
                    <Toaster />
                  </TooltipProvider>
                  </ConsolidatedNotificationProvider>
                </SandboxPremiumProvider>
              </SandboxProvider>
            </CurrencyProvider>
          </LanguageProvider>
        </AuthProvider>
      </QueryClientProvider>
    </HookErrorBoundary>
  );
}

export default App;
