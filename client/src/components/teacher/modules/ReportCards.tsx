import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { ModernCard, ModernStatsCard } from '@/components/ui/ModernCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Lock, FileText, Download, Send, Users, Calendar, BarChart3 } from 'lucide-react';

export const ReportCards = () => {
  const { language } = useLanguage();

  const text = {
    fr: {
      title: 'Bulletins de Notes',
      subtitle: 'Générer des bulletins complets pour les élèves',
      premiumFeature: 'Fonctionnalité Premium',
      upgradeRequired: 'Mise à niveau requise',
      upgradeText: 'Cette fonctionnalité nécessite un abonnement premium pour créer et distribuer des bulletins de notes complets.',
      totalReports: 'Total Bulletins',
      publishedReports: 'Bulletins Publiés',
      pendingReports: 'En Attente',
      parentNotifications: 'Notifications Parents',
      generateReport: 'Générer Bulletin',
      publishBulk: 'Publication Groupée',
      downloadPdf: 'Télécharger PDF',
      sendToParents: 'Envoyer aux Parents',
      termReport: 'Bulletin Trimestriel',
      finalReport: 'Bulletin Final',
      draft: 'Brouillon',
      published: 'Publié',
      sent: 'Envoyé',
      upgradeNow: 'Mettre à Niveau Maintenant',
      features: 'Fonctionnalités Premium',
      feature1: 'Bulletins détaillés avec notes et commentaires',
      feature2: 'Évaluations comportementales intégrées',
      feature3: 'Envoi automatique aux parents',
      feature4: 'Format PDF professionnel',
      feature5: 'Publication groupée pour toute la classe',
      feature6: 'Historique complet des bulletins'
    },
    en: {
      title: 'Report Cards',
      subtitle: 'Generate comprehensive student report cards',
      premiumFeature: 'Premium Feature',
      upgradeRequired: 'Upgrade Required',
      upgradeText: 'This feature requires a premium subscription to create and distribute comprehensive report cards.',
      totalReports: 'Total Reports',
      publishedReports: 'Published Reports',
      pendingReports: 'Pending',
      parentNotifications: 'Parent Notifications',
      generateReport: 'Generate Report',
      publishBulk: 'Bulk Publish',
      downloadPdf: 'Download PDF',
      sendToParents: 'Send to Parents',
      termReport: 'Term Report',
      finalReport: 'Final Report',
      draft: 'Draft',
      published: 'Published',
      sent: 'Sent',
      upgradeNow: 'Upgrade Now',
      features: 'Premium Features',
      feature1: 'Detailed report cards with grades and comments',
      feature2: 'Integrated behavioral assessments',
      feature3: 'Automatic parent communication',
      feature4: 'Professional PDF format',
      feature5: 'Bulk publishing for entire class',
      feature6: 'Complete report card history'
    }
  };

  const t = text[language as keyof typeof text];

  // Mock report data for preview
  const mockReports = [
    {
      id: 1,
      student: 'Marie Dupont',
      class: 'CM2 A',
      term: 'Trimestre 2',
      status: 'published',
      grade: 15.2,
      createdAt: '2024-01-15'
    },
    {
      id: 2,
      student: 'Jean Kamga',
      class: 'CM2 A',
      term: 'Trimestre 2',
      status: 'draft',
      grade: 13.8,
      createdAt: '2024-01-14'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-purple-600 rounded-lg flex items-center justify-center relative">
          <BookOpen className="w-5 h-5 text-white" />
          <Lock className="w-3 h-3 text-white absolute -top-1 -right-1 bg-red-500 rounded-full p-0.5" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{t.title || ''}</h2>
          <p className="text-gray-600">{t.subtitle}</p>
        </div>
      </div>

      {/* Premium Lock Overlay */}
      <ModernCard gradient="default" className="relative">
        <div className="absolute inset-0 bg-white/90 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center z-10">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mb-4">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">{t.premiumFeature}</h3>
          <p className="text-gray-600 text-center max-w-md mb-6">{t.upgradeText}</p>
          
          {/* Premium Features List */}
          <div className="bg-white rounded-lg p-6 mb-6 shadow-sm border max-w-lg">
            <h4 className="font-semibold text-gray-800 mb-4">{t.features}:</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center">
                <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                {t.feature1}
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                {t.feature2}
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                {t.feature3}
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                {t.feature4}
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                {t.feature5}
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                {t.feature6}
              </li>
            </ul>
          </div>
          
          <Button className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white px-8 py-2">
            {t.upgradeNow}
          </Button>
        </div>

        {/* Background Content (blurred) */}
        <div className="filter blur-sm pointer-events-none">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <ModernStatsCard
              title={t.totalReports}
              value="28"
              icon={<FileText className="w-5 h-5" />}
              trend={{ value: 5, isPositive: true }}
              gradient="blue"
            />
            <ModernStatsCard
              title={t.publishedReports}
              value="24"
              icon={<Send className="w-5 h-5" />}
              trend={{ value: 3, isPositive: true }}
              gradient="green"
            />
            <ModernStatsCard
              title={t.pendingReports}
              value="4"
              icon={<Calendar className="w-5 h-5" />}
              trend={{ value: 1, isPositive: false }}
              gradient="orange"
            />
            <ModernStatsCard
              title={t.parentNotifications}
              value="20"
              icon={<Send className="w-5 h-5" />}
              trend={{ value: 8, isPositive: true }}
              gradient="purple"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 mb-6">
            <Button className="bg-purple-500 hover:bg-purple-600 text-white">
              <FileText className="w-4 h-4 mr-2" />
              {t.generateReport}
            </Button>
            <Button variant="outline">
              <Send className="w-4 h-4 mr-2" />
              {t.publishBulk}
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              {t.downloadPdf}
            </Button>
          </div>

          {/* Reports List */}
          <div className="space-y-4">
            {(Array.isArray(mockReports) ? mockReports : []).map((report) => (
              <div key={report.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{report.student}</h4>
                      <p className="text-gray-600">{report.class} - {report.term}</p>
                      <p className="text-sm text-gray-500">Moyenne: {report.grade}/20</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge className={report.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}>
                      {report.status === 'published' ? t.published : t.draft}
                    </Badge>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </ModernCard>
    </div>
  );
};