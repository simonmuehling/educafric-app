import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Shield, Crown, Star } from 'lucide-react';
import { useSandboxPremium } from './SandboxPremiumProvider';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

const SandboxPremiumTest = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { 
    hasFullAccess, 
    isPremiumFeature, 
    getUserPlan, 
    isPremiumUnlocked, 
    isEnhancedUser 
  } = useSandboxPremium();

  const text = {
    fr: {
      title: 'Test Accès Premium Sandbox',
      subtitle: 'Vérification des fonctionnalités premium débloquées',
      userInfo: 'Informations Utilisateur',
      accessStatus: 'Statut d\'Accès',
      featureTests: 'Tests Fonctionnalités',
      allPassed: 'Tous les tests réussis',
      failed: 'Échec',
      passed: 'Réussi'
    },
    en: {
      title: 'Sandbox Premium Access Test',
      subtitle: 'Verification of unlocked premium features',
      userInfo: 'User Information',
      accessStatus: 'Access Status',
      featureTests: 'Feature Tests',
      allPassed: 'All tests passed',
      failed: 'Failed',
      passed: 'Passed'
    }
  };

  const t = text[language as keyof typeof text];

  // Test premium features
  const premiumFeatures = [
    'communications',
    'geolocation',
    'payments',
    'whatsapp',
    'analytics',
    'reports',
    'attendance',
    'grades',
    'homework',
    'timetable',
    'notifications',
    'security'
  ];

  const featureResults = (Array.isArray(premiumFeatures) ? premiumFeatures : []).map(feature => ({
    feature,
    hasAccess: isPremiumFeature(feature)
  }));

  const allTestsPassed = featureResults.every(test => test.hasAccess);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{t.title || ''}</h2>
        <p className="text-gray-600">{t.subtitle}</p>
      </div>

      {/* User Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            {t.userInfo}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-semibold">{user?.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Rôle</p>
              <p className="font-semibold">{user?.role}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Plan</p>
              <Badge variant="outline" className="bg-purple-50 text-purple-700">
                <Crown className="w-3 h-3 mr-1" />
                {getUserPlan()}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-gray-600">ID École</p>
              <p className="font-semibold">{(user as any)?.schoolId || 'N/A'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Access Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5" />
            {t.accessStatus}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6">
            <div className="flex items-center justify-between">
              <span>hasFullAccess</span>
              {hasFullAccess ? (
                <Badge className="bg-green-100 text-green-800">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  {t.passed}
                </Badge>
              ) : (
                <Badge variant="destructive">
                  <XCircle className="w-3 h-3 mr-1" />
                  {t.failed}
                </Badge>
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <span>isPremiumUnlocked</span>
              {isPremiumUnlocked ? (
                <Badge className="bg-green-100 text-green-800">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  {t.passed}
                </Badge>
              ) : (
                <Badge variant="destructive">
                  <XCircle className="w-3 h-3 mr-1" />
                  {t.failed}
                </Badge>
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <span>isEnhancedUser</span>
              {isEnhancedUser ? (
                <Badge className="bg-green-100 text-green-800">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  {t.passed}
                </Badge>
              ) : (
                <Badge variant="destructive">
                  <XCircle className="w-3 h-3 mr-1" />
                  {t.failed}
                </Badge>
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <span>sandboxMode</span>
              {(user as any)?.sandboxMode ? (
                <Badge className="bg-green-100 text-green-800">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  {t.passed}
                </Badge>
              ) : (
                <Badge variant="destructive">
                  <XCircle className="w-3 h-3 mr-1" />
                  {t.failed}
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feature Tests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              {t.featureTests}
            </div>
            {allTestsPassed && (
              <Badge className="bg-green-100 text-green-800">
                <Star className="w-3 h-3 mr-1" />
                {t.allPassed}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {(Array.isArray(featureResults) ? featureResults : []).map(({ feature, hasAccess }) => (
              <div key={feature} className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                <span className="text-sm font-medium capitalize">{feature}</span>
                {hasAccess ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-600" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Global Test Result */}
      <Card className={allTestsPassed ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center gap-3">
            {allTestsPassed ? (
              <>
                <CheckCircle className="w-6 h-6 text-green-600" />
                <span className="text-lg font-semibold text-green-800">
                  🏖️ Sandbox Premium: TOUS les accès débloqués !
                </span>
              </>
            ) : (
              <>
                <XCircle className="w-6 h-6 text-red-600" />
                <span className="text-lg font-semibold text-red-800">
                  ❌ Certains accès premium ne fonctionnent pas
                </span>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SandboxPremiumTest;