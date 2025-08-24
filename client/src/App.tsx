import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
import { SandboxProvider } from "@/contexts/SandboxContext";
import { SandboxPremiumProvider } from "@/components/sandbox/SandboxPremiumProvider";
// Firebase redirect functionality removed after refactoring
import React, { useEffect, lazy, Suspense, useState } from "react";

// Core pages - Always loaded (light components)
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import PasswordReset from "@/pages/PasswordReset";
import NotFound from "@/pages/not-found";

// CONSOLIDATED MODULE LOADING - Ultra-fast unified system for 3500+ users
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

// CONSOLIDATED MODULE LOADING - Eliminates 5+ second slow loads
import { consolidatedLoader, useConsolidatedModules } from "@/utils/consolidatedModuleLoader";

// Convert heavy imports to lazy loading for faster startup
const LazySubscribe = lazy(() => import("@/pages/Subscribe"));
const LazyDemo = lazy(() => import("@/pages/Demo"));
const LazyGeolocationPricing = lazy(() => import("@/pages/GeolocationPricing"));
const LazySubscriptionSuccess = lazy(() => import("@/pages/SubscriptionSuccess"));
const LazySandboxLogin = lazy(() => import("@/pages/SandboxLogin"));
const LazySandboxDemo = lazy(() => import("@/pages/SandboxDemo"));
const LazyCurrencyDemo = lazy(() => import("@/pages/CurrencyDemo"));
// Schools now imported synchronously above
const LazyTermsOfService = lazy(() => import("@/pages/TermsOfService"));
const LazyPrivacyPolicy = lazy(() => import("@/pages/PrivacyPolicy"));
const LazyBulkManagement = lazy(() => import("@/pages/BulkManagement"));
const LazyProfileFeatures = lazy(() => import("@/pages/ProfileFeatures"));
const LazyModernFormDemo = lazy(() => import("@/pages/ModernFormDemo"));
const LazyUnauthorizedPage = lazy(() => import("@/pages/UnauthorizedPage"));
const LazyDebugInspector = lazy(() => import("@/pages/DebugInspector"));
const LazyPWAAnalyticsDemo = lazy(() => import("@/pages/PWAAnalyticsDemo"));
const LazyEducationalConnections = lazy(() => import("@/pages/EducationalConnections"));
const LazySubscriptionManagement = lazy(() => import("@/pages/SubscriptionManagement"));
const LazySignatureTest = lazy(() => import("@/pages/SignatureTest"));

// CONSOLIDATED MODULE PRELOADER - Ultra-fast loading
const useConsolidatedPreloader = () => {
  const { preloadModule } = useConsolidatedModules();
  
  useEffect(() => {
    const startGlobalPreload = async () => {
      if (import.meta.env.DEV) {
        console.log('[GLOBAL_PRELOADER] Starting optimized module preloading...');
      }
      
      try {
        await consolidatedLoader.batchPreload(['overview', 'teachers', 'children', 'notifications']);
        
        if (import.meta.env.DEV) {
          console.log('[GLOBAL_PRELOADER] Essential modules ready');
        }
      } catch (error) {
        if (import.meta.env.DEV) {
          console.warn('[GLOBAL_PRELOADER] Preload completed with some failures');
        }
      }
    };
    
    // Cleanup on unmount
    const cleanup = () => {
      consolidatedLoader.cleanup();
    };
    
    startGlobalPreload();
    window.addEventListener('beforeunload', cleanup);
    
    return () => {
      window.removeEventListener('beforeunload', cleanup);
    };
  }, []);
};
// Test components - Lazy loaded
const LazyBulletinValidationTest = lazy(() => import("@/pages/BulletinValidationTest"));
const LazyBulletinCreationTest = lazy(() => import("@/pages/BulletinCreationTest"));
const LazyBulletinTestSuite = lazy(() => import("@/pages/BulletinTestSuite"));
const LazyPWANotificationTest = lazy(() => import("@/pages/PWANotificationTest"));

// System components - Essential only, keep critical ones synchronous
import { ConsolidatedNotificationProvider } from "@/components/pwa/ConsolidatedNotificationSystem";
import ConnectionStatusIndicator from "@/components/pwa/ConnectionStatusIndicator";
import { SimpleTutorial } from "@/components/tutorial/SimpleTutorial";
import InactivityMonitor from "@/components/auth/InactivityMonitor";
import EducafricFooter from "@/components/EducafricFooter";
import RoleBasedDashboard from "@/components/RoleBasedDashboard";

// Demo and route components - Import synchronously since they're directly used in routes
import MicroInteractionsDemo from "@/components/demo/MicroInteractionsDemo";
import BilingualSandboxDashboard from "@/components/sandbox/BilingualSandboxDashboard";
import UpdatedSandboxDashboard from "@/components/sandbox/UpdatedSandboxDashboard";
import CurrencyDemo from "@/pages/CurrencyDemo";
import PWAAnalyticsDemo from "@/pages/PWAAnalyticsDemo";
import EducationalConnections from "@/pages/EducationalConnections";
import SubscriptionManagement from "@/pages/SubscriptionManagement";
import ModernFormDemo from "@/pages/ModernFormDemo";
import PWANotificationTest from "@/pages/PWANotificationTest";
import BulletinValidationTest from "@/pages/BulletinValidationTest";
import Schools from "@/pages/Schools";
import UnauthorizedPage from "@/pages/UnauthorizedPage";
// PasswordReset already imported above  
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import TermsOfService from "@/pages/TermsOfService";
import SignatureTest from "@/pages/SignatureTest";
// NotFound already imported above
import BulletinCreationTest from "@/pages/BulletinCreationTest";
import BulletinTestSuite from "@/pages/BulletinTestSuite";

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

  // Expose tutorial function globally - ALL HOOKS MUST BE CALLED BEFORE CONDITIONS
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

  // RENDER CONDITIONS AFTER ALL HOOKS
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
          <Suspense fallback={<div className="h-8 flex justify-center"><div className="w-4 h-4 border border-blue-500 border-t-transparent rounded-full animate-spin" /></div>}>
            <LazyBulkManagement />
          </Suspense>
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
      
      <Route path="/subscribe">
        <Suspense fallback={<div className="h-8 flex justify-center"><div className="w-4 h-4 border border-blue-500 border-t-transparent rounded-full animate-spin" /></div>}>
          <LazySubscribe />
        </Suspense>
      </Route>
      <Route path="/sandbox-login">
        <Suspense fallback={<div className="h-8 flex justify-center"><div className="w-4 h-4 border border-blue-500 border-t-transparent rounded-full animate-spin" /></div>}>
          <LazySandboxLogin />
        </Suspense>
      </Route>
      <Route path="/sandbox-demo">
        <Suspense fallback={<div className="h-8 flex justify-center"><div className="w-4 h-4 border border-blue-500 border-t-transparent rounded-full animate-spin" /></div>}>
          <LazySandboxLogin />
        </Suspense>
      </Route>
      
      <Route path="/profile">
        <ProtectedRoute>
          <LazyProfile />
        </ProtectedRoute>
      </Route>
      
      <Route path="/profile-features">
        <ProtectedRoute>
          <Suspense fallback={<div className="h-8 flex justify-center"><div className="w-4 h-4 border border-blue-500 border-t-transparent rounded-full animate-spin" /></div>}>
            <LazyProfileFeatures />
          </Suspense>
        </ProtectedRoute>
      </Route>
      
      <Route path="/demo">
        <Suspense fallback={<div className="h-8 flex justify-center"><div className="w-4 h-4 border border-blue-500 border-t-transparent rounded-full animate-spin" /></div>}>
          <LazyDemo />
        </Suspense>
      </Route>
      <Route path="/subscription-success">
        <Suspense fallback={<div className="h-8 flex justify-center"><div className="w-4 h-4 border border-blue-500 border-t-transparent rounded-full animate-spin" /></div>}>
          <LazySubscriptionSuccess />
        </Suspense>
      </Route>
      <Route path="/geolocation-pricing">
        <Suspense fallback={<div className="h-8 flex justify-center"><div className="w-4 h-4 border border-blue-500 border-t-transparent rounded-full animate-spin" /></div>}>
          <LazyGeolocationPricing />
        </Suspense>
      </Route>
      
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
      <Route path="/debug-inspector">
        <Suspense fallback={<div className="h-8 flex justify-center"><div className="w-4 h-4 border border-blue-500 border-t-transparent rounded-full animate-spin" /></div>}>
          <LazyDebugInspector />
        </Suspense>
      </Route>
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
    // ALL HOOKS MUST BE CALLED BEFORE ANY EARLY RETURNS
    // Only initialize once to prevent repeated logs
    if (initialized) return;
    
    const checkRedirect = async () => {
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
  // Consolidated module preloader for instant UI response
  useConsolidatedPreloader();
  
  useEffect(() => {
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
  );
}

export default App;
