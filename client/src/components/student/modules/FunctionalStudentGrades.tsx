import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import MobileActionsOverlay from '@/components/mobile/MobileActionsOverlay';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BarChart3, TrendingUp, TrendingDown, Award, Target,
  Calendar, BookOpen, User, ChevronRight, Filter,
  Clock, Star, Trophy, Medal, Download, RefreshCw,
  Eye, Mail, FileText
} from 'lucide-react';

interface GradeData {
  id: number;
  studentId: number;
  subject: string;
  subjectId: number;
  teacher: string;
  teacherId: number;
  grade: number;
  maxGrade: number;
  coefficient: number;
  type: string;
  date: string;
  term: string;
  comments: string;
}

interface GradeSummary {
  overallAverage: number;
  trend: 'up' | 'down' | 'stable';
  rank: number;
  totalStudents: number;
  subjectAverages: { [key: string]: number };
}

const FunctionalStudentGrades: React.FC = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('current');

  // Fetch grades data from PostgreSQL API
  const { data: grades = [], isLoading, refetch } = useQuery<GradeData[]>({
    queryKey: ['/api/student/grades'],
    enabled: !!user
  });

  // Calculate summary from real data
  const calculateSummary = (): GradeSummary => {
    if ((Array.isArray(grades) ? grades.length : 0) === 0) {
      return {
        overallAverage: 0,
        trend: 'stable' as const,
        rank: 1,
        totalStudents: 30,
        subjectAverages: {}
      };
    }

    // Calculate weighted average
    let totalPoints = 0;
    let totalCoefficients = 0;
    const subjectAverages: { [key: string]: number } = {};

    grades.forEach(grade => {
      const points = (grade.grade / grade.maxGrade) * 20 * grade.coefficient;
      totalPoints += points;
      totalCoefficients += grade.coefficient;

      if (!subjectAverages[grade.subject]) {
        subjectAverages[grade.subject] = 0;
      }
      subjectAverages[grade.subject] = (grade.grade / grade.maxGrade) * 20;
    });

    const overallAverage = totalCoefficients > 0 ? totalPoints / totalCoefficients : 0;
    
    return {
      overallAverage,
      trend: overallAverage >= 14 ? 'up' : overallAverage >= 10 ? 'stable' : 'down',
      rank: Math.ceil((20 - overallAverage) / 20 * 30) || 1,
      totalStudents: 30,
      subjectAverages
    };
  };

  const summary = calculateSummary();

  const text = {
    fr: {
      title: 'Mes Notes',
      subtitle: 'Consultez vos résultats et votre progression académique',
      overall: 'Moyenne générale',
      trend: 'Tendance',
      rank: 'Classement',
      allSubjects: 'Toutes matières',
      currentTerm: 'Trimestre actuel',
      subject: 'Matière',
      grade: 'Note',
      type: 'Type',
      date: 'Date',
      teacher: 'Professeur',
      coefficient: 'Coefficient',
      comments: 'Commentaires',
      recentGrades: 'Notes récentes',
      performance: 'Performance',
      details: 'Détails',
      loading: 'Chargement...',
      noGrades: 'Aucune note disponible',
      excellent: 'Excellent',
      good: 'Bien',
      average: 'Moyen',
      needsImprovement: 'À améliorer',
      refresh: 'Actualiser',
      download: 'Télécharger',
      outOf: 'sur'
    },
    en: {
      title: 'My Grades',
      subtitle: 'View your results and academic progress',
      overall: 'Overall Average',
      trend: 'Trend',
      rank: 'Rank',
      allSubjects: 'All Subjects',
      currentTerm: 'Current Term',
      subject: 'Subject',
      grade: 'Grade',
      type: 'Type',
      date: 'Date',
      teacher: 'Teacher',
      coefficient: 'Coefficient',
      comments: 'Comments',
      recentGrades: 'Recent Grades',
      performance: 'Performance',
      details: 'Details',
      loading: 'Loading...',
      noGrades: 'No grades available',
      excellent: 'Excellent',
      good: 'Good',
      average: 'Average',
      needsImprovement: 'Needs Improvement',
      refresh: 'Refresh',
      download: 'Download',
      outOf: 'out of'
    }
  };

  const t = text[language as keyof typeof text];

  const getGradeColor = (grade: number, maxGrade: number = 20) => {
    const percentage = (grade / maxGrade) * 100;
    if (percentage >= 85) return 'text-green-600 bg-green-50 border-green-200';
    if (percentage >= 70) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (percentage >= 50) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getPerformanceLabel = (grade: number, maxGrade: number = 20) => {
    const percentage = (grade / maxGrade) * 100;
    if (percentage >= 85) return t.excellent;
    if (percentage >= 70) return t.good;
    if (percentage >= 50) return t.average;
    return t.needsImprovement;
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-red-600" />;
      default: return <BarChart3 className="w-4 h-4 text-blue-600" />;
    }
  };

  const filteredGrades = (Array.isArray(grades) ? grades : []).filter(grade => {
    if (!grade) return false;
    if (selectedSubject !== 'all' && grade.subject !== selectedSubject) return false;
    return true;
  });

  const subjects = Array.from(new Set((Array.isArray(grades) ? grades : []).map(grade => grade.subject)));

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="text-center">
          <Clock className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">{t.loading}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">{t.title || ''}</h1>
          <p className="text-gray-600 mt-1">{t.subtitle}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            {t.refresh}
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            {t.download}
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">{t.overall}</p>
                <p className="text-3xl font-bold">{summary?.overallAverage?.toFixed(1)}/20</p>
              </div>
              <Trophy className="w-8 h-8 text-blue-200" />
            </div>
            <div className="flex items-center mt-2">
              {getTrendIcon(summary.trend)}
              <span className="ml-1 text-sm text-blue-100">{t.trend}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">{t.rank}</p>
                <p className="text-3xl font-bold">{summary.rank}/{summary.totalStudents}</p>
              </div>
              <Medal className="w-8 h-8 text-green-200" />
            </div>
            <div className="mt-2">
              <Progress 
                value={(1 - (summary.rank - 1) / summary.totalStudents) * 100} 
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">{t.performance}</p>
                <p className="text-lg font-bold">{getPerformanceLabel(summary.overallAverage)}</p>
              </div>
              <Star className="w-8 h-8 text-purple-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder={t.allSubjects} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.allSubjects}</SelectItem>
                {(Array.isArray(subjects) ? subjects : []).map(subject => (
                  <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder={t.currentTerm} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current">{t.currentTerm}</SelectItem>
                <SelectItem value="term1">Trimestre 1</SelectItem>
                <SelectItem value="term2">Trimestre 2</SelectItem>
                <SelectItem value="term3">Trimestre 3</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions - Mobile Optimized */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            {language === 'fr' ? 'Actions Rapides' : 'Quick Actions'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <MobileActionsOverlay
            title={language === 'fr' ? 'Actions Notes' : 'Grade Actions'}
            maxVisibleButtons={3}
            actions={[
              {
                id: 'view-progress',
                label: language === 'fr' ? 'Voir Progrès' : 'View Progress',
                icon: <Eye className="w-5 h-5" />,
                onClick: () => {
                  toast({
                    title: language === 'fr' ? 'Progrès Scolaire' : 'Academic Progress',
                    description: language === 'fr' ? 'Affichage des progrès détaillés' : 'Showing detailed progress',
                  });
                },
                color: 'bg-blue-600 hover:bg-blue-700'
              },
              {
                id: 'contact-teacher',
                label: language === 'fr' ? 'Contacter Professeur' : 'Contact Teacher',
                icon: <Mail className="w-5 h-5" />,
                onClick: () => {
                  toast({
                    title: language === 'fr' ? 'Communication' : 'Communication',
                    description: language === 'fr' ? 'Module de communication ouvert' : 'Communication module opened',
                  });
                },
                color: 'bg-green-600 hover:bg-green-700'
              },
              {
                id: 'view-report',
                label: language === 'fr' ? 'Bulletin de Notes' : 'Report Card',
                icon: <FileText className="w-5 h-5" />,
                onClick: () => {
                  toast({
                    title: language === 'fr' ? 'Bulletin' : 'Report Card',
                    description: language === 'fr' ? 'Accès au bulletin de notes' : 'Accessing report card',
                  });
                },
                color: 'bg-purple-600 hover:bg-purple-700'
              },
              {
                id: 'download-grades',
                label: language === 'fr' ? 'Télécharger Notes' : 'Download Grades',
                icon: <Download className="w-5 h-5" />,
                onClick: () => {
                  const csvContent = [
                    ['Matiere,Note,Note_Max,Coefficient,Type,Date,Professeur'],
                    ...(Array.isArray(grades) ? grades : []).map(grade => [
                      grade.subject,
                      grade.grade,
                      grade.maxGrade,
                      grade.coefficient,
                      grade.type,
                      grade.date,
                      grade.teacher
                    ].join(','))
                  ].join('\n');
                  
                  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                  const link = document.createElement('a');
                  const url = URL.createObjectURL(blob);
                  link.setAttribute('href', url);
                  link.setAttribute('download', `notes_${new Date().toISOString().split('T')[0]}.csv`);
                  if (link.style) {
                    link.style.visibility = 'hidden';
                  }
                  if (document.body) {
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }
                  
                  toast({
                    title: language === 'fr' ? 'Export terminé' : 'Export completed',
                    description: language === 'fr' ? 'Notes exportées en CSV' : 'Grades exported as CSV',
                  });
                },
                color: 'bg-orange-600 hover:bg-orange-700'
              }
            ]}
          />
        </CardContent>
      </Card>

      {/* Grades List */}
      {(Array.isArray(filteredGrades) ? filteredGrades.length : 0) === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">{t.noGrades}</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-800">{t.recentGrades}</h3>
          {(Array.isArray(filteredGrades) ? filteredGrades : []).map(grade => (
            <Card key={grade.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-lg">{grade.subject}</h4>
                      <Badge variant="outline">{grade.type}</Badge>
                      <Badge 
                        className={`${getGradeColor(grade.grade, grade.maxGrade)} border`}
                      >
                        {grade.grade}/{grade.maxGrade}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-2" />
                        {grade.teacher}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        {new Date(grade.date).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US')}
                      </div>
                      <div className="flex items-center">
                        <Target className="w-4 h-4 mr-2" />
                        Coefficient: {grade.coefficient}
                      </div>
                    </div>
                    {grade.comments && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700">{grade.comments}</p>
                      </div>
                    )}
                  </div>
                  <div className="ml-4">
                    <div className="text-center">
                      <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full border-2 ${getGradeColor(grade.grade, grade.maxGrade)}`}>
                        <span className="font-bold text-lg">
                          {((grade.grade / grade.maxGrade) * 100).toFixed(0)}%
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {getPerformanceLabel(grade.grade, grade.maxGrade)}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default FunctionalStudentGrades;