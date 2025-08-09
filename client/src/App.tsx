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
// import { handleRedirect } from "@/lib/firebase"; // Function not available
import { useEffect } from "react";


// Pages - Core (always loaded)
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import PasswordReset from "@/pages/PasswordReset";
import NotFound from "@/pages/not-found";

// Lazy loaded pages for better performance
import { 
  LazyStudents, 
  LazyTeachers, 
  LazyGrades, 
  LazyAttendance, 
  LazyProfile 
} from "@/components/LazyLoader";

// Regular imports for Subscribe and Demo (small components)
import Subscribe from "@/pages/Subscribe";
import Demo from "@/pages/Demo";
import GeolocationPricing from "@/pages/GeolocationPricing";
import SubscriptionSuccess from "@/pages/SubscriptionSuccess";
import SandboxLogin from "@/pages/SandboxLogin";
import SandboxDemo from "@/pages/SandboxDemo";
import UIShowcase from "@/pages/UIShowcase";
import CurrencyDemo from "@/pages/CurrencyDemo";
import Schools from "@/pages/Schools";
import TeachersPage from "@/pages/Teachers";
import StudentsPage from "@/pages/Students";
import ParentsPage from "@/pages/ParentsPage";
import InactivityMonitor from "@/components/auth/InactivityMonitor";
import FreelancerPage from "@/pages/FreelancerPage";
import CommercialPage from "@/pages/CommercialPage";
import AdminPage from "@/pages/AdminPage";
import DirectorPage from "@/pages/DirectorPage";
import TermsOfService from "@/pages/TermsOfService";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import ProfileFeatures from "@/pages/ProfileFeatures";
import EducafricFooter from "@/components/EducafricFooter";
import ModernFormDemo from "@/pages/ModernFormDemo";
import RoleBasedDashboard from "@/components/RoleBasedDashboard";
import SandboxPage from "@/pages/SandboxPage";
import EnhancedSandbox from "@/pages/EnhancedSandbox";
import UnauthorizedPage from "@/pages/UnauthorizedPage";
import SecurityDashboard from "@/pages/SecurityDashboard";
import DebugInspector from "@/pages/DebugInspector";
import PWAInstallPrompt from "@/components/pwa/PWAInstallPrompt";
import SmallPWAInstallNotification from "@/components/pwa/SmallPWAInstallNotification";
import { ConsolidatedNotificationProvider } from "@/components/pwa/ConsolidatedNotificationSystem";
import WebInspector from "@/components/developer/WebInspector";
import { SimpleTutorial } from "@/components/tutorial/SimpleTutorial";
import MicroInteractionsDemo from "@/components/demo/MicroInteractionsDemo";
import BilingualSandboxDashboard from "@/components/sandbox/BilingualSandboxDashboard";

import { useState } from "react";
import React from "react";

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

  // Expose tutorial function globally
  React.useEffect(() => {
    (window as any).showTutorial = () => {
      console.log('[TUTORIAL] 🚀 Global tutorial trigger activated!');
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
        <InactivityMonitor warningTime={25} logoutTime={30} />
      </div>
      {/* Web Inspector for debugging */}
      <WebInspector />
      
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
      <Route path="/ui-showcase" component={UIShowcase} />
      <Route path="/micro-interactions" component={MicroInteractionsDemo} />
      <Route path="/bilingual-sandbox" component={BilingualSandboxDashboard} />
      <Route path="/currency-demo" component={CurrencyDemo} />
      
      {/* Protected Routes */}
      
      <Route path="/dashboard">
        <ProtectedRoute>
          <RoleBasedDashboard />
        </ProtectedRoute>
      </Route>
      
      <Route path="/student">
        <ProtectedRoute>
          <StudentsPage />
        </ProtectedRoute>
      </Route>
      
      <Route path="/students">
        <ProtectedRoute>
          <StudentsPage />
        </ProtectedRoute>
      </Route>
      
      <Route path="/teacher">
        <ProtectedRoute>
          <TeachersPage />
        </ProtectedRoute>
      </Route>
      
      <Route path="/teachers">
        <ProtectedRoute>
          <TeachersPage />
        </ProtectedRoute>
      </Route>
      
      <Route path="/schools">
        <ProtectedRoute>
          <Schools />
        </ProtectedRoute>
      </Route>
      
      <Route path="/classes">
        <ProtectedRoute>
          <div className="flex flex-col flex-1">
            <div className="p-8 text-center">
              <h2 className="text-2xl font-bold text-gray-900">Classes</h2>
              <p className="text-gray-600 mt-2">Class management coming soon</p>
            </div>
          </div>
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
          <div className="flex flex-col flex-1">
            <div className="p-8 text-center">
              <h2 className="text-2xl font-bold text-gray-900">Homework</h2>
              <p className="text-gray-600 mt-2">Homework management coming soon</p>
            </div>
          </div>
        </ProtectedRoute>
      </Route>
      
      <Route path="/timetable">
        <ProtectedRoute>
          <div className="flex flex-col flex-1">
            <div className="p-8 text-center">
              <h2 className="text-2xl font-bold text-gray-900">Timetable</h2>
              <p className="text-gray-600 mt-2">Timetable management coming soon</p>
            </div>
          </div>
        </ProtectedRoute>
      </Route>
      
      <Route path="/parent">
        <ProtectedRoute>
          <ParentsPage />
        </ProtectedRoute>
      </Route>
      
      <Route path="/parents">
        <ProtectedRoute>
          <ParentsPage />
        </ProtectedRoute>
      </Route>
      
      <Route path="/freelancer">
        <ProtectedRoute>
          <FreelancerPage />
        </ProtectedRoute>
      </Route>
      
      <Route path="/commercial">
        <ProtectedRoute>
          <CommercialPage />
        </ProtectedRoute>
      </Route>
      
      <Route path="/admin">
        <ProtectedRoute>
          <AdminPage />
        </ProtectedRoute>
      </Route>
      
      <Route path="/director">
        <ProtectedRoute>
          <DirectorPage />
        </ProtectedRoute>
      </Route>
      
      <Route path="/payments">
        <ProtectedRoute>
          <div className="flex flex-col flex-1">
            <div className="p-8 text-center">
              <h2 className="text-2xl font-bold text-gray-900">Payments</h2>
              <p className="text-gray-600 mt-2">Payment management coming soon</p>
            </div>
          </div>
        </ProtectedRoute>
      </Route>
      
      <Route path="/reports">
        <ProtectedRoute>
          <div className="flex flex-col flex-1">
            <div className="p-8 text-center">
              <h2 className="text-2xl font-bold text-gray-900">Reports</h2>
              <p className="text-gray-600 mt-2">Reporting system coming soon</p>
            </div>
          </div>
        </ProtectedRoute>
      </Route>
      
      <Route path="/settings">
        <ProtectedRoute>
          <div className="flex flex-col flex-1">
            <div className="p-8 text-center">
              <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
              <p className="text-gray-600 mt-2">Settings management coming soon</p>
            </div>
          </div>
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
      <Route path="/forgot-password" component={PasswordReset} />
      <Route path="/reset-password/:token" component={PasswordReset} />
      
      {/* Developer Tools */}
      <Route path="/debug-inspector" component={DebugInspector} />
      <Route path="/sandbox" component={SandboxPage} />
      <Route path="/enhanced-sandbox" component={EnhancedSandbox} />
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
                    <li>• simon.admin@educafric.com (Site Admin) ✓</li>
                    <li>• parent.kamdem@gmail.com (Parent)</li>
                    <li>• teacher.demo@test.educafric.com (Teacher)</li>
                    <li>• student.demo@test.educafric.com (Student)</li>
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
          <SecurityDashboard />
        </ProtectedRoute>
      </Route>
      
      <Route path="/unauthorized" component={UnauthorizedPage} />
      
      {/* Legal Pages */}
      <Route path="/privacy-policy" component={PrivacyPolicy} />
      <Route path="/terms-of-service" component={TermsOfService} />
      <Route path="/modern-forms" component={ModernFormDemo} />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

// Firebase Redirect Handler Component (simplified without reCAPTCHA)
function FirebaseRedirectHandler() {
  useEffect(() => {
    // Handle Firebase redirect result on app initialization (simplified)
    const checkRedirect = async () => {
      try {
        console.log('Firebase redirect handler initialized (simplified)');
      } catch (error) {
        console.error('Firebase redirect handling error:', error);
      }
    };
    
    checkRedirect();
  }, []);

  return null;
}

function App() {
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
                    <SmallPWAInstallNotification />
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
