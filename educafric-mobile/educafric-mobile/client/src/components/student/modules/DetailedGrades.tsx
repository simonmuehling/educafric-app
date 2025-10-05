import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { ModernCard, ModernStatsCard } from '@/components/ui/ModernCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Lock, BarChart3, TrendingUp, Calendar, Download } from 'lucide-react';
import UnifiedPremiumGate from '@/components/shared/UnifiedPremiumGate';

export const DetailedGrades = () => {
  const { language } = useLanguage();

  const text = {
    fr: {
      title: 'Mes Notes Détaillées',
      subtitle: 'Analyse complète des notes et historique',
      premiumFeature: 'Fonctionnalité Premium',
      upgradeRequired: 'Mise à niveau requise',
      upgradeText: 'Cette fonctionnalité nécessite un abonnement premium pour accéder à l\'analyse détaillée des notes et à l\'historique complet.',
      totalGrades: 'Notes Totales',
      averageGrade: 'Moyenne Générale',
      bestTerm: 'Meilleur Trimestre',
      improvementRate: 'Taux d\'Amélioration',
      gradeHistory: 'Historique des Notes',
      subjectAnalysis: 'Analyse par Matière',
      termComparison: 'Comparaison Trimestrielle',
      downloadReport: 'Télécharger Rapport',
      upgradeNow: 'Mettre à Niveau Maintenant',
      features: 'Fonctionnalités Premium',
      feature1: 'Analyse détaillée par matière',
      feature2: 'Suivi historique des performances',
      feature3: 'Tendances et analytics avancées',
      feature4: 'Comparaisons par trimestre/semestre',
      feature5: 'Moyennes et moyennes pondérées',
      feature6: 'Rapports PDF téléchargeables'
    },
    en: {
      title: 'My Detailed Grades',
      subtitle: 'Comprehensive grade analysis and history',
      premiumFeature: 'Premium Feature',
      upgradeRequired: 'Upgrade Required',
      upgradeText: 'This feature requires a premium subscription to access detailed grade analysis and complete history.',
      totalGrades: 'Total Grades',
      averageGrade: 'Overall Average',
      bestTerm: 'Best Term',
      improvementRate: 'Improvement Rate',
      gradeHistory: 'Grade History',
      subjectAnalysis: 'Subject Analysis',
      termComparison: 'Term Comparison',
      downloadReport: 'Download Report',
      upgradeNow: 'Upgrade Now',
      features: 'Premium Features',
      feature1: 'Detailed subject-wise analysis',
      feature2: 'Historical performance tracking',
      feature3: 'Advanced trends and analytics',
      feature4: 'Term/semester comparisons',
      feature5: 'Weighted and unweighted averages',
      feature6: 'Downloadable PDF reports'
    }
  };

  const t = text[language as keyof typeof text];

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-green-600 rounded-lg flex items-center justify-center relative">
          <BookOpen className="w-5 h-5 text-white" />
          <Lock className="w-3 h-3 text-white absolute -top-1 -right-1 bg-red-500 rounded-full p-0.5" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{t.title || ''}</h2>
          <p className="text-gray-600">{t.subtitle}</p>
        </div>
      </div>

      {/* Premium Lock Overlay - Design blanc unifié */}
      <UnifiedPremiumGate
        title={t.premiumFeature}
        description={t.upgradeText}
        features={[t.feature1, t.feature2, t.feature3, t.feature4, t.feature5, t.feature6]}
      >
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
            <ModernStatsCard
              title={t.totalGrades}
              value="47"
              icon={<BarChart3 className="w-5 h-5" />}
              trend={{ value: 8, isPositive: true }}
              gradient="blue"
            />
            <ModernStatsCard
              title={t.averageGrade}
              value="14.8/20"
              icon={<TrendingUp className="w-5 h-5" />}
              trend={{ value: 0.7, isPositive: true }}
              gradient="green"
            />
            <ModernStatsCard
              title={t.bestTerm}
              value="Trimestre 2"
              icon={<Calendar className="w-5 h-5" />}
              trend={{ value: 15.2, isPositive: true }}
              gradient="purple"
            />
            <ModernStatsCard
              title={t.improvementRate}
              value="+12%"
              icon={<TrendingUp className="w-5 h-5" />}
              trend={{ value: 12, isPositive: true }}
              gradient="orange"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 mb-6">
            <Button className="bg-green-500 hover:bg-green-600 text-white">
              <BarChart3 className="w-4 h-4 mr-2" />
              {t.subjectAnalysis}
            </Button>
            <Button variant="outline">
              <Calendar className="w-4 h-4 mr-2" />
              {t.termComparison}
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              {t.downloadReport}
            </Button>
          </div>

          {/* Mock Grade Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6">
            <div className="bg-white rounded-xl p-6 border">
              <h4 className="font-semibold text-gray-800 mb-4">Évolution par Trimestre</h4>
              <div className="h-32 bg-gradient-to-r from-blue-100 to-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-8 h-8 text-gray-400" />
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 border">
              <h4 className="font-semibold text-gray-800 mb-4">Performance par Matière</h4>
              <div className="h-32 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-8 h-8 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Mock Grade History */}
          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <div key={item} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                      <BookOpen className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Mathématiques</h4>
                      <p className="text-gray-600">Trimestre 2 - 2024</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-800">15.5</div>
                      <div className="text-xs text-gray-500">/20</div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Bien</Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
      </UnifiedPremiumGate>
    </div>
  );
};