import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useUnifiedNotifications } from './ConsolidatedNotificationSystem';
import { unifiedNotificationService } from '@/services/unifiedNotificationService';
import { runNotificationTests } from '@/utils/notificationTest';
import { Bell, BookOpen, Users, AlertTriangle, CheckCircle, Zap, Play, Shield, Settings, TestTube } from 'lucide-react';

const ConsolidatedNotificationDemo = () => {
  const { language } = useLanguage();
  const { showSuccess, showError, showWarning, showInfo, sendGrade, sendAttendance, sendHomework, sendEmergency, sendTest } = useUnifiedNotifications();
  const [isTestingSequence, setIsTestingSequence] = useState(false);

  // System notification tests
  const systemTests = [
    {
      id: 'success',
      icon: <CheckCircle className="w-5 h-5" />,
      color: 'bg-green-500',
      title: language === 'fr' ? 'Succès' : 'Success',
      action: () => showSuccess(
        language === 'fr' ? 'Opération Réussie' : 'Operation Successful',
        language === 'fr' ? 'Action complétée avec succès!' : 'Action completed successfully!'
      )
    },
    {
      id: 'error',
      icon: <AlertTriangle className="w-5 h-5" />,
      color: 'bg-red-500',
      title: language === 'fr' ? 'Erreur' : 'Error',
      action: () => showError(
        language === 'fr' ? 'Erreur Système' : 'System Error',
        language === 'fr' ? 'Une erreur critique est survenue' : 'A critical error occurred'
      )
    },
    {
      id: 'warning',
      icon: <AlertTriangle className="w-5 h-5" />,
      color: 'bg-yellow-500',
      title: language === 'fr' ? 'Attention' : 'Warning',
      action: () => showWarning(
        language === 'fr' ? 'Action Requise' : 'Action Required',
        language === 'fr' ? 'Veuillez vérifier vos paramètres' : 'Please check your settings'
      )
    },
    {
      id: 'info',
      icon: <Bell className="w-5 h-5" />,
      color: 'bg-blue-500',
      title: language === 'fr' ? 'Information' : 'Information',
      action: () => showInfo(
        language === 'fr' ? 'Mise à Jour' : 'Update Available',
        language === 'fr' ? 'Nouvelle version disponible' : 'New version available'
      )
    }
  ];

  // Educational notification tests
  const educationalTests = [
    {
      id: 'grade',
      icon: <BookOpen className="w-5 h-5" />,
      color: 'bg-purple-500',
      title: language === 'fr' ? 'Nouvelle Note' : 'New Grade',
      action: () => sendGrade('Marie Dupont', 'Mathématiques', '18/20')
    },
    {
      id: 'attendance',
      icon: <Users className="w-5 h-5" />,
      color: 'bg-indigo-500',
      title: language === 'fr' ? 'Présence' : 'Attendance',
      action: () => sendAttendance('Paul Martin', 'present')
    },
    {
      id: 'homework',
      icon: <CheckCircle className="w-5 h-5" />,
      color: 'bg-orange-500',
      title: language === 'fr' ? 'Devoir' : 'Homework',
      action: () => sendHomework('Sciences', language === 'fr' ? 'demain' : 'tomorrow')
    },
    {
      id: 'emergency',
      icon: <AlertTriangle className="w-5 h-5" />,
      color: 'bg-red-600',
      title: language === 'fr' ? 'Urgence' : 'Emergency',
      action: () => sendEmergency(
        language === 'fr' ? 
          'Test alerte - Tous les systèmes fonctionnels' :
          'Test alert - All systems operational'
      )
    }
  ];

  const runFullNotificationSequence = async () => {
    setIsTestingSequence(true);
    
    try {
      // Request permissions first
      const hasPermission = await unifiedNotificationService.requestPermission();
      
      if (!hasPermission) {
        showWarning(
          language === 'fr' ? 'Permissions Requises' : 'Permissions Required',
          language === 'fr' ? 'Autorisez les notifications pour le test complet' : 'Allow notifications for full test'
        );
        setIsTestingSequence(false);
        return;
      }

      // Run sequence of all notification types
      const sequence = [
        () => sendTest(),
        () => systemTests[0].action(), // Success
        () => educationalTests[0].action(), // Grade
        () => educationalTests[1].action(), // Attendance
        () => systemTests[2].action(), // Warning
        () => educationalTests[2].action(), // Homework
        () => educationalTests[3].action(), // Emergency
        () => showSuccess(
          language === 'fr' ? 'Séquence Terminée' : 'Sequence Complete',
          language === 'fr' ? 'Tous les types de notifications testés!' : 'All notification types tested!'
        )
      ];

      for (let i = 0; i < (Array.isArray(sequence) ? sequence.length : 0); i++) {
        setTimeout(sequence[i], i * 1500);
      }

    } catch (error) {
      showError(
        language === 'fr' ? 'Erreur Test' : 'Test Error',
        language === 'fr' ? 'Erreur pendant la séquence de test' : 'Error during test sequence'
      );
    } finally {
      setTimeout(() => setIsTestingSequence(false), 8 * 1500 + 1000); // 8 steps * 1500ms + 1000ms
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              {language === 'fr' ? '🚀 Système de Notifications Consolidé' : '🚀 Consolidated Notification System'}
            </h2>
            <p className="text-gray-700 mb-4">
              {language === 'fr' ? 
                'Architecture unifiée pour notifications in-app et PWA push avec optimisation africaine' :
                'Unified architecture for in-app and PWA push notifications with African optimization'
              }
            </p>
            
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-gray-600">
                  {language === 'fr' ? 'Service unifié actif' : 'Unified service active'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-600" />
                <span className="text-gray-600">
                  {language === 'fr' ? 'PWA + In-App' : 'PWA + In-App'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-purple-600" />
                <span className="text-gray-600">
                  {language === 'fr' ? 'Auto-permission' : 'Auto-permission'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={async () => {
                const success = await runNotificationTests(language);
                if (success) {
                  showSuccess(
                    language === 'fr' ? 'Tests Réussis' : 'Tests Passed',
                    language === 'fr' ? 'Tous les tests de notification ont réussi!' : 'All notification tests passed!'
                  );
                } else {
                  showError(
                    language === 'fr' ? 'Tests Échoués' : 'Tests Failed',
                    language === 'fr' ? 'Certains tests ont échoué. Voir console.' : 'Some tests failed. Check console.'
                  );
                }
              }}
              className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-lg hover:from-green-600 hover:to-teal-700 transition-all transform hover:scale-105 font-medium"
            >
              <TestTube className="w-4 h-4" />
              {language === 'fr' ? 'Tests Auto' : 'Auto Tests'}
            </button>
            
            <button
              onClick={runFullNotificationSequence}
              disabled={isTestingSequence}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:from-purple-600 hover:to-pink-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:transform-none font-medium"
            >
              {isTestingSequence ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {language === 'fr' ? 'Test en cours...' : 'Testing...'}
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  {language === 'fr' ? 'Test Complet' : 'Full Test'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* System Notifications */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center">
            <Bell className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {language === 'fr' ? 'Notifications Système' : 'System Notifications'}
            </h3>
            <p className="text-sm text-gray-600">
              {language === 'fr' ? 
                'Notifications d\'interface utilisateur avec design moderne' :
                'User interface notifications with modern design'
              }
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {(Array.isArray(systemTests) ? systemTests : []).map((test) => (
            <button
              key={test.id}
              onClick={test.action}
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 hover:shadow-md transition-all text-left group"
            >
              <div className={`w-8 h-8 ${test.color} rounded-full flex items-center justify-center text-white flex-shrink-0 group-hover:scale-110 transition-transform`}>
                {test.icon}
              </div>
              <div>
                <div className="font-medium text-gray-900">{test.title || ''}</div>
                <div className="text-sm text-gray-500">
                  {language === 'fr' ? 'In-app notification' : 'In-app notification'}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Educational Notifications */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {language === 'fr' ? 'Notifications Éducatives PWA' : 'Educational PWA Notifications'}
            </h3>
            <p className="text-sm text-gray-600">
              {language === 'fr' ? 
                'Notifications système persistantes même app fermée' :
                'System notifications persistent even when app is closed'
              }
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {(Array.isArray(educationalTests) ? educationalTests : []).map((test) => (
            <button
              key={test.id}
              onClick={test.action}
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 hover:shadow-md transition-all text-left group"
            >
              <div className={`w-8 h-8 ${test.color} rounded-full flex items-center justify-center text-white flex-shrink-0 group-hover:scale-110 transition-transform`}>
                {test.icon}
              </div>
              <div>
                <div className="font-medium text-gray-900">{test.title || ''}</div>
                <div className="text-sm text-gray-500">
                  {language === 'fr' ? 'PWA + In-app' : 'PWA + In-app'}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Technical Info */}
      <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg p-6 border border-gray-200">
        <div className="flex items-start gap-3">
          <Shield className="w-6 h-6 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">
              {language === 'fr' ? 'Architecture Consolidée' : 'Consolidated Architecture'}
            </h4>
            <div className="space-y-2 text-sm text-gray-700">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>
                  {language === 'fr' ? 
                    'Service unifié - UnifiedNotificationService singleton pattern' :
                    'Unified service - UnifiedNotificationService singleton pattern'
                  }
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>
                  {language === 'fr' ? 
                    'Dual delivery - In-app toasts + PWA push avec vibration' :
                    'Dual delivery - In-app toasts + PWA push with vibration'
                  }
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>
                  {language === 'fr' ? 
                    'Optimisation africaine - Persistance offline + priorités urgentes' :
                    'African optimization - Offline persistence + urgent priorities'
                  }
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span>
                  {language === 'fr' ? 
                    'Support complet - TypeScript, React Context, Service Worker' :
                    'Full support - TypeScript, React Context, Service Worker'
                  }
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsolidatedNotificationDemo;