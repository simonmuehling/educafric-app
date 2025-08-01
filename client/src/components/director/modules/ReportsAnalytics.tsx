import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ModernStatsCard } from '@/components/ui/ModernCard';
import { 
  BarChart3, Download, Calendar, Users, BookOpen, 
  TrendingUp, FileText, PieChart, Activity, Award,
  Target, Clock, CheckCircle
} from 'lucide-react';

const ReportsAnalytics: React.FC = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [generatingReport, setGeneratingReport] = useState<string | null>(null);

  const text = {
    fr: {
      title: 'Rapports et Analyses',
      subtitle: 'Analyses détaillées et rapports de performance de votre établissement',
      stats: {
        totalReports: 'Rapports Générés',
        studentsAnalyzed: 'Élèves Analysés',
        performanceGrowth: 'Croissance Performance',
        dataAccuracy: 'Précision Données'
      },
      reports: {
        academic: 'Rapport Académique',
        financial: 'Rapport Financier',
        attendance: 'Rapport Présence',
        performance: 'Analyse Performance',
        teachers: 'Évaluation Enseignants',
        students: 'Progression Élèves',
        parent: 'Engagement Parents',
        comparative: 'Analyse Comparative'
      },
      actions: {
        generate: 'Générer',
        download: 'Télécharger',
        schedule: 'Programmer',
        export: 'Exporter'
      },
      quickStats: 'Statistiques Rapides',
      recentReports: 'Rapports Récents'
    },
    en: {
      title: 'Reports & Analytics',
      subtitle: 'Detailed analytics and performance reports for your institution',
      stats: {
        totalReports: 'Reports Generated',
        studentsAnalyzed: 'Students Analyzed',
        performanceGrowth: 'Performance Growth',
        dataAccuracy: 'Data Accuracy'
      },
      reports: {
        academic: 'Academic Report',
        financial: 'Financial Report',
        attendance: 'Attendance Report',
        performance: 'Performance Analysis',
        teachers: 'Teacher Evaluation',
        students: 'Student Progress',
        parent: 'Parent Engagement',
        comparative: 'Comparative Analysis'
      },
      actions: {
        generate: 'Generate',
        download: 'Download',
        schedule: 'Schedule',
        export: 'Export'
      },
      quickStats: 'Quick Stats',
      recentReports: 'Recent Reports'
    }
  };

  const t = text[language as keyof typeof text];

  const analyticsStats = [
    {
      title: t?.stats?.totalReports,
      value: '127',
      icon: <FileText className="w-5 h-5" />,
      trend: { value: 23, isPositive: true },
      gradient: 'blue' as const
    },
    {
      title: t?.stats?.studentsAnalyzed,
      value: '456',
      icon: <Users className="w-5 h-5" />,
      trend: { value: 8, isPositive: true },
      gradient: 'green' as const
    },
    {
      title: t?.stats?.performanceGrowth,
      value: '15.2%',
      icon: <TrendingUp className="w-5 h-5" />,
      trend: { value: 12, isPositive: true },
      gradient: 'purple' as const
    },
    {
      title: t?.stats?.dataAccuracy,
      value: '98.7%',
      icon: <Target className="w-5 h-5" />,
      trend: { value: 2, isPositive: true },
      gradient: 'orange' as const
    }
  ];

  const reportTypes = [
    { id: 'academic', name: t?.reports?.academic, icon: BookOpen, color: 'bg-blue-500', description: language === 'fr' ? 'Performance académique générale' : 'General academic performance' },
    { id: 'financial', name: t?.reports?.financial, icon: BarChart3, color: 'bg-green-500', description: language === 'fr' ? 'Analyse financière complète' : 'Complete financial analysis' },
    { id: 'attendance', name: t?.reports?.attendance, icon: Calendar, color: 'bg-orange-500', description: language === 'fr' ? 'Statistiques de présence' : 'Attendance statistics' },
    { id: 'performance', name: t?.reports?.performance, icon: TrendingUp, color: 'bg-purple-500', description: language === 'fr' ? 'Analyse de performance détaillée' : 'Detailed performance analysis' },
    { id: 'teachers', name: t?.reports?.teachers, icon: Award, color: 'bg-indigo-500', description: language === 'fr' ? 'Évaluation des enseignants' : 'Teacher evaluation' },
    { id: 'students', name: t?.reports?.students, icon: Users, color: 'bg-pink-500', description: language === 'fr' ? 'Progression des élèves' : 'Student progress' },
    { id: 'parent', name: t?.reports?.parent, icon: Activity, color: 'bg-teal-500', description: language === 'fr' ? 'Engagement parental' : 'Parent engagement' },
    { id: 'comparative', name: t?.reports?.comparative, icon: PieChart, color: 'bg-cyan-500', description: language === 'fr' ? 'Comparaison avec autres établissements' : 'Comparison with other institutions' }
  ];

  const recentReports = [
    { name: 'Rapport Académique T1-2025', date: '2025-01-24', size: '2.3 MB', type: 'academic', status: 'ready' },
    { name: 'Analyse Présence Janvier', date: '2025-01-23', size: '1.8 MB', type: 'attendance', status: 'ready' },
    { name: 'Performance Élèves 6ème', date: '2025-01-22', size: '3.1 MB', type: 'students', status: 'generating' },
    { name: 'Rapport Financier Mensuel', date: '2025-01-21', size: '4.2 MB', type: 'financial', status: 'ready' }
  ];

  const handleGenerateReport = async (reportType: string) => {
    setGeneratingReport(reportType);
    
    // Simulation de génération de rapport
    setTimeout(() => {
      const reportData = `${t.reports[reportType as keyof typeof t.reports]} - ${new Date().toLocaleDateString()}\n\nRapport généré automatiquement par Educafric\n\nDonnées analysées: 456 élèves\nPériode: Janvier 2025\nPrécision: 98.7%`;
      
      const blob = new Blob([reportData], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${reportType}-report-${new Date().toISOString().split('T')[0]}.txt`;
      document?.body?.appendChild(a);
      a.click();
      document?.body?.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: language === 'fr' ? 'Rapport Généré' : 'Report Generated',
        description: language === 'fr' ? `${t.reports[reportType as keyof typeof t.reports]} téléchargé avec succès` : `${t.reports[reportType as keyof typeof t.reports]} downloaded successfully`
      });
      setGeneratingReport(null);
    }, 3000);
  };

  const handleDownloadExistingReport = (reportName: string) => {
    toast({
      title: language === 'fr' ? 'Téléchargement Démarré' : 'Download Started',
      description: language === 'fr' ? `Téléchargement de ${reportName}` : `Downloading ${reportName}`
    });
  };

  const getStatusBadge = (status: string) => {
    if (status === 'ready') {
      return <Badge className="bg-green-100 text-green-800">{language === 'fr' ? 'Prêt' : 'Ready'}</Badge>;
    } else {
      return <Badge className="bg-yellow-100 text-yellow-800">{language === 'fr' ? 'Génération...' : 'Generating...'}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-blue-600" />
              {t.title || ''}
            </h1>
            <p className="text-gray-600 mt-2">{t.subtitle}</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {(Array.isArray(analyticsStats) ? analyticsStats : []).map((stat, index) => (
            <ModernStatsCard key={index} {...stat} />
          ))}
        </div>

        {/* Report Generation Grid */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-500" />
              {language === 'fr' ? 'Générateurs de Rapports' : 'Report Generators'}
            </h2>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {(Array.isArray(reportTypes) ? reportTypes : []).map((report) => (
                <div key={report.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-10 h-10 ${report.color} rounded-lg flex items-center justify-center`}>
                      <report.icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-medium">{report.name || ''}</h3>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">{report.description || ''}</p>
                  <Button 
                    onClick={() => handleGenerateReport(report.id)}
                    disabled={generatingReport === report.id}
                    className="w-full"
                    size="sm"
                  >
                    {generatingReport === report.id ? (
                      <Clock className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4 mr-2" />
                    )}
                    {generatingReport === report.id ? 
                      (language === 'fr' ? 'Génération...' : 'Generating...') : 
                      t?.actions?.generate
                    }
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Reports */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Clock className="w-5 h-5 text-green-500" />
              {t.recentReports}
            </h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(Array.isArray(recentReports) ? recentReports : []).map((report, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">{report.name || ''}</p>
                      <p className="text-sm text-gray-600">{report.date} • {report.size}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getStatusBadge(report.status)}
                    {report.status === 'ready' && (
                      <Button 
                        onClick={() => handleDownloadExistingReport(report.name)}
                        size="sm"
                        variant="outline"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        {t?.actions?.download}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReportsAnalytics;