import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { 
  Users, BookOpen, Award, Download, Printer, Eye,
  GraduationCap, TrendingUp, BarChart3, Star,
  Building2, Calendar, FileText, Filter
} from 'lucide-react';

interface ClassReport {
  id: number;
  name: string;
  level: string;
  section: string;
  teacherName: string;
  studentCount: number;
  averageGrade: number;
  highestGrade: number;
  lowestGrade: number;
  subjects: Array<{
    id: number;
    name: string;
    averageScore: number;
    studentGrades: Array<{
      studentId: number;
      studentName: string;
      score: number;
      maxScore: number;
      percentage: number;
    }>;
  }>;
}

interface ClassReportsData {
  school: {
    id: number;
    name: string;
    logoUrl: string;
    academicYear: string;
    currentTerm: string;
  };
  classes: ClassReport[];
  summary: {
    totalClasses: number;
    totalStudents: number;
    overallAverage: number;
    topPerformingClass: string;
  };
}

const ClassReports: React.FC = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [selectedClass, setSelectedClass] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'summary' | 'detailed'>('summary');
  const [filterLevel, setFilterLevel] = useState<string>('all');

  const text = {
    fr: {
      title: 'Rapports par Classe',
      subtitle: 'Notes et performances détaillées de chaque classe',
      loading: 'Chargement des rapports...',
      summary: 'Résumé Général',
      detailed: 'Vue Détaillée',
      viewModes: {
        summary: 'Résumé',
        detailed: 'Détaillé'
      },
      filters: {
        allLevels: 'Tous les niveaux',
        level: 'Niveau'
      },
      metrics: {
        totalClasses: 'Classes Totales',
        totalStudents: 'Élèves Totaux',
        overallAverage: 'Moyenne Générale',
        topClass: 'Meilleure Classe'
      },
      classInfo: {
        teacher: 'Enseignant',
        students: 'Élèves',
        average: 'Moyenne',
        highest: 'Note la plus haute',
        lowest: 'Note la plus basse',
        subjects: 'Matières'
      },
      actions: {
        viewDetails: 'Voir Détails',
        downloadPDF: 'PDF',
        print: 'Imprimer',
        export: 'Exporter'
      }
    },
    en: {
      title: 'Class Reports',
      subtitle: 'Detailed grades and performance for each class',
      loading: 'Loading reports...',
      summary: 'General Summary',
      detailed: 'Detailed View',
      viewModes: {
        summary: 'Summary',
        detailed: 'Detailed'
      },
      filters: {
        allLevels: 'All levels',
        level: 'Level'
      },
      metrics: {
        totalClasses: 'Total Classes',
        totalStudents: 'Total Students',
        overallAverage: 'Overall Average',
        topClass: 'Top Class'
      },
      classInfo: {
        teacher: 'Teacher',
        students: 'Students',
        average: 'Average',
        highest: 'Highest Grade',
        lowest: 'Lowest Grade',
        subjects: 'Subjects'
      },
      actions: {
        viewDetails: 'View Details',
        downloadPDF: 'PDF',
        print: 'Print',
        export: 'Export'
      }
    }
  };

  const t = text[language as keyof typeof text];

  // Fetch class reports data
  const { data: classReportsData, isLoading, error } = useQuery<ClassReportsData>({
    queryKey: ['/api/director/class-reports'],
    queryFn: async () => {
      const response = await fetch('/api/director/class-reports', { 
        credentials: 'include' 
      });
      if (!response.ok) {
        throw new Error('Failed to fetch class reports');
      }
      return response.json();
    }
  });

  // Filter classes by level
  const filteredClasses = classReportsData?.classes.filter(cls => 
    filterLevel === 'all' || cls.level === filterLevel
  ) || [];

  // Get unique levels for filter
  const availableLevels = Array.from(new Set(classReportsData?.classes.map(cls => cls.level) || []));

  const handleDownloadClassReport = async (classId: number, className: string) => {
    try {
      const response = await fetch(`/api/director/class-reports/${classId}/pdf`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `rapport-classe-${className.replace(/\s+/g, '-')}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
        
        toast({
          title: language === 'fr' ? 'Rapport téléchargé' : 'Report downloaded',
          description: `${className} - ${language === 'fr' ? 'PDF généré avec succès' : 'PDF generated successfully'}`
        });
      }
    } catch (error) {
      toast({
        title: language === 'fr' ? 'Erreur de téléchargement' : 'Download error',
        description: language === 'fr' ? 'Impossible de générer le PDF' : 'Failed to generate PDF',
        variant: 'destructive'
      });
    }
  };

  const getGradeColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-blue-500';
    if (percentage >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getPerformanceBadge = (average: number) => {
    if (average >= 16) return <Badge className="bg-green-100 text-green-800">Excellent</Badge>;
    if (average >= 14) return <Badge className="bg-blue-100 text-blue-800">{language === 'fr' ? 'Très Bien' : 'Very Good'}</Badge>;
    if (average >= 12) return <Badge className="bg-yellow-100 text-yellow-800">{language === 'fr' ? 'Bien' : 'Good'}</Badge>;
    if (average >= 10) return <Badge className="bg-orange-100 text-orange-800">{language === 'fr' ? 'Passable' : 'Average'}</Badge>;
    return <Badge className="bg-red-100 text-red-800">{language === 'fr' ? 'Insuffisant' : 'Poor'}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <BarChart3 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">{t.loading}</p>
        </div>
      </div>
    );
  }

  if (error || !classReportsData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <FileText className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">
            {language === 'fr' ? 'Erreur lors du chargement des rapports' : 'Error loading reports'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6 space-y-6">
        {/* Header with School Logo */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {classReportsData.school.logoUrl && (
                <img 
                  src={classReportsData.school.logoUrl} 
                  alt={classReportsData.school.name}
                  className="w-16 h-16 object-contain rounded-lg border"
                />
              )}
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                  <Users className="w-8 h-8 text-blue-600" />
                  {t.title}
                </h1>
                <p className="text-gray-600 mt-1">{classReportsData.school.name}</p>
                <p className="text-sm text-gray-500">
                  {classReportsData.school.academicYear} - {classReportsData.school.currentTerm}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                variant={viewMode === 'summary' ? 'default' : 'outline'}
                onClick={() => setViewMode('summary')}
                size="sm"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                {t.viewModes.summary}
              </Button>
              <Button 
                variant={viewMode === 'detailed' ? 'default' : 'outline'}
                onClick={() => setViewMode('detailed')}
                size="sm"
              >
                <FileText className="w-4 h-4 mr-2" />
                {t.viewModes.detailed}
              </Button>
            </div>
          </div>
        </div>

        {/* Summary Statistics */}
        <div className="grid gap-6 md:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Building2 className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">{t.metrics.totalClasses}</p>
                  <p className="text-2xl font-bold text-blue-600">{classReportsData.summary.totalClasses}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">{t.metrics.totalStudents}</p>
                  <p className="text-2xl font-bold text-green-600">{classReportsData.summary.totalStudents}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">{t.metrics.overallAverage}</p>
                  <p className="text-2xl font-bold text-purple-600">{classReportsData.summary.overallAverage.toFixed(1)}/20</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <Award className="w-6 h-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">{t.metrics.topClass}</p>
                  <p className="text-lg font-bold text-orange-600">{classReportsData.summary.topPerformingClass}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <Filter className="w-5 h-5 text-gray-500" />
              <select
                value={filterLevel}
                onChange={(e) => setFilterLevel(e.target.value)}
                className="border rounded-md px-3 py-2"
              >
                <option value="all">{t.filters.allLevels}</option>
                {availableLevels.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Class Reports Grid */}
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
          {filteredClasses.map((classReport) => (
            <Card key={classReport.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold flex items-center gap-2">
                      <GraduationCap className="w-5 h-5 text-blue-600" />
                      {classReport.name}
                    </h3>
                    <p className="text-gray-600">{classReport.level} - {classReport.section}</p>
                  </div>
                  {getPerformanceBadge(classReport.averageGrade)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Class Info */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">{t.classInfo.teacher}:</p>
                      <p className="font-medium">{classReport.teacherName}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">{t.classInfo.students}:</p>
                      <p className="font-medium">{classReport.studentCount}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">{t.classInfo.average}:</p>
                      <p className="font-medium text-blue-600">{classReport.averageGrade.toFixed(1)}/20</p>
                    </div>
                    <div>
                      <p className="text-gray-600">{t.classInfo.subjects}:</p>
                      <p className="font-medium">{classReport.subjects.length}</p>
                    </div>
                  </div>

                  {/* Grade Range */}
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">{t.classInfo.highest}:</span>
                      <span className="font-semibold text-green-600">{classReport.highestGrade.toFixed(1)}/20</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{t.classInfo.lowest}:</span>
                      <span className="font-semibold text-red-600">{classReport.lowestGrade.toFixed(1)}/20</span>
                    </div>
                  </div>

                  {/* Subject Performance Preview */}
                  {viewMode === 'detailed' && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-700">{t.classInfo.subjects}:</p>
                      <div className="space-y-2">
                        {classReport.subjects.slice(0, 3).map((subject) => (
                          <div key={subject.id} className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">{subject.name}</span>
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${getGradeColor((subject.averageScore / 20) * 100)}`}></div>
                              <span className="text-sm font-medium">{subject.averageScore.toFixed(1)}/20</span>
                            </div>
                          </div>
                        ))}
                        {classReport.subjects.length > 3 && (
                          <p className="text-xs text-gray-500">+{classReport.subjects.length - 3} {language === 'fr' ? 'autres matières' : 'more subjects'}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex justify-between items-center pt-3 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedClass(classReport.id)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      {t.actions.viewDetails}
                    </Button>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadClassReport(classReport.id, classReport.name)}
                      >
                        <Download className="w-4 h-4 mr-1" />
                        {t.actions.downloadPDF}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.print()}
                      >
                        <Printer className="w-4 h-4 mr-1" />
                        {t.actions.print}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredClasses.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                {language === 'fr' ? 'Aucune classe trouvée pour ce niveau' : 'No classes found for this level'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ClassReports;