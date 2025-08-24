// 📱 MOBILE-OPTIMIZED Director Reports & Analytics
import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BarChart3, FileText, Download, TrendingUp, Users, BookOpen, Calendar, Eye } from 'lucide-react';

const FunctionalDirectorReports: React.FC = () => {
  const { language } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState('academic');
  
  const t = {
    title: language === 'fr' ? 'Rapports et Analyses' : 'Reports & Analytics',
    academic: language === 'fr' ? 'Académique' : 'Academic',
    financial: language === 'fr' ? 'Financier' : 'Financial',
    attendance: language === 'fr' ? 'Présence' : 'Attendance',
    behavioral: language === 'fr' ? 'Comportement' : 'Behavioral',
    generateReport: language === 'fr' ? 'Générer Rapport' : 'Generate Report',
    viewReport: language === 'fr' ? 'Voir Rapport' : 'View Report',
    downloadReport: language === 'fr' ? 'Télécharger' : 'Download',
    lastGenerated: language === 'fr' ? 'Dernière génération' : 'Last generated',
    status: language === 'fr' ? 'Statut' : 'Status',
    ready: language === 'fr' ? 'Prêt' : 'Ready',
    generating: language === 'fr' ? 'En cours' : 'Generating'
  };

  const categories = [
    { id: 'academic', label: t.academic, icon: BookOpen },
    { id: 'financial', label: t.financial, icon: BarChart3 },
    { id: 'attendance', label: t.attendance, icon: Users },
    { id: 'behavioral', label: t.behavioral, icon: Calendar }
  ];

  const reports = {
    academic: [
      {
        id: 1,
        title: language === 'fr' ? 'Bulletin de Notes Trimestriel' : 'Quarterly Grade Report',
        description: language === 'fr' ? 'Synthèse des performances académiques par classe' : 'Academic performance summary by class',
        lastGenerated: '2025-01-20',
        status: 'ready',
        size: '2.4 MB'
      },
      {
        id: 2,
        title: language === 'fr' ? 'Analyse des Matières' : 'Subject Analysis',
        description: language === 'fr' ? 'Performance détaillée par matière enseignée' : 'Detailed performance by taught subject',
        lastGenerated: '2025-01-18',
        status: 'ready',
        size: '1.8 MB'
      }
    ],
    financial: [
      {
        id: 3,
        title: language === 'fr' ? 'Rapport Financier Mensuel' : 'Monthly Financial Report',
        description: language === 'fr' ? 'Revenus, dépenses et bénéfices du mois' : 'Monthly revenue, expenses and profits',
        lastGenerated: '2025-01-31',
        status: 'ready',
        size: '1.2 MB'
      },
      {
        id: 4,
        title: language === 'fr' ? 'Analyse des Frais de Scolarité' : 'Tuition Fee Analysis',
        description: language === 'fr' ? 'Suivi des paiements et impayés' : 'Payment tracking and outstanding fees',
        lastGenerated: '2025-01-25',
        status: 'generating',
        size: '850 KB'
      }
    ],
    attendance: [
      {
        id: 5,
        title: language === 'fr' ? 'Rapport de Présence Hebdomadaire' : 'Weekly Attendance Report',
        description: language === 'fr' ? 'Taux de présence par classe et élève' : 'Attendance rate by class and student',
        lastGenerated: '2025-01-22',
        status: 'ready',
        size: '956 KB'
      }
    ],
    behavioral: [
      {
        id: 6,
        title: language === 'fr' ? 'Rapport de Discipline' : 'Discipline Report',
        description: language === 'fr' ? 'Incidents et mesures disciplinaires' : 'Incidents and disciplinary measures',
        lastGenerated: '2025-01-15',
        status: 'ready',
        size: '720 KB'
      }
    ]
  };

  const currentReports = reports[selectedCategory as keyof typeof reports] || [];

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
      {/* Mobile-optimized header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
            {t.title}
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            {language === 'fr' ? 'Générez et consultez vos rapports institutionnels' : 'Generate and view your institutional reports'}
          </p>
        </div>
        
        <Button className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto">
          <FileText className="w-4 h-4 mr-2" />
          {t.generateReport}
        </Button>
      </div>

      {/* Mobile-optimized category selector */}
      <div className="flex overflow-x-auto space-x-2 pb-2">
        {categories.map((category) => {
          const IconComponent = category.icon;
          return (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
              className="whitespace-nowrap min-w-fit"
            >
              <IconComponent className="w-4 h-4 mr-2" />
              {category.label}
            </Button>
          );
        })}
      </div>

      {/* Mobile-optimized reports grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {currentReports.map((report) => (
          <Card key={report.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <h3 className="font-semibold text-lg text-gray-900 pr-2">
                      {report.title}
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {report.description}
                    </p>
                  </div>
                  
                  <Badge 
                    variant={report.status === 'ready' ? 'default' : 'secondary'}
                    className={`${report.status === 'ready' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'} whitespace-nowrap`}
                  >
                    {report.status === 'ready' ? t.ready : t.generating}
                  </Badge>
                </div>
                
                <div className="space-y-2 text-sm text-gray-500">
                  <div className="flex justify-between">
                    <span>{t.lastGenerated}:</span>
                    <span>{report.lastGenerated}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{language === 'fr' ? 'Taille' : 'Size'}:</span>
                    <span>{report.size}</span>
                  </div>
                </div>
                
                {/* Mobile-optimized action buttons */}
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 pt-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="w-full sm:flex-1"
                    disabled={report.status !== 'ready'}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    {t.viewReport}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="w-full sm:flex-1"
                    disabled={report.status !== 'ready'}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    {t.downloadReport}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty state */}
      {currentReports.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">
              {language === 'fr' ? 
                'Aucun rapport disponible dans cette catégorie' : 
                'No reports available in this category'
              }
            </p>
            <Button>
              <FileText className="w-4 h-4 mr-2" />
              {t.generateReport}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FunctionalDirectorReports;