import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage } from '@/contexts/LanguageContext';
import { useQuery } from '@tanstack/react-query';
import {
  FileText,
  Download,
  Eye,
  Printer,
  Calendar,
  User,
  GraduationCap,
  Award,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import ReportCardPreview from '@/components/academic/ReportCardPreview';

interface BulletinPreviewGalleryProps {
  selectedClass?: string;
  selectedTerm?: string;
}

const BulletinPreviewGallery: React.FC<BulletinPreviewGalleryProps> = ({
  selectedClass,
  selectedTerm
}) => {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<string>('all');

  const text = {
    fr: {
      title: 'Aperçus des Bulletins',
      subtitle: 'Consultez et gérez les bulletins créés',
      all: 'Tous',
      completed: 'Complétés',
      pending: 'En cours',
      archived: 'Archivés',
      student: 'Élève',
      class: 'Classe',
      term: 'Trimestre',
      average: 'Moyenne',
      rank: 'Rang',
      createdOn: 'Créé le',
      status: 'Statut',
      actions: 'Actions',
      view: 'Voir',
      download: 'Télécharger',
      print: 'Imprimer',
      noBulletins: 'Aucun bulletin trouvé',
      noBulletinsDesc: 'Les bulletins créés apparaîtront ici',
      loading: 'Chargement...',
      statusCompleted: 'Complété',
      statusPending: 'En cours',
      statusArchived: 'Archivé',
      classAverage: 'Moyenne de classe',
      subjects: 'matières'
    },
    en: {
      title: 'Report Card Previews',
      subtitle: 'View and manage created report cards',
      all: 'All',
      completed: 'Completed',
      pending: 'Pending',
      archived: 'Archived',
      student: 'Student',
      class: 'Class',
      term: 'Term',
      average: 'Average',
      rank: 'Rank',
      createdOn: 'Created on',
      status: 'Status',
      actions: 'Actions',
      view: 'View',
      download: 'Download',
      print: 'Print',
      noBulletins: 'No report cards found',
      noBulletinsDesc: 'Created report cards will appear here',
      loading: 'Loading...',
      statusCompleted: 'Completed',
      statusPending: 'Pending',
      statusArchived: 'Archived',
      classAverage: 'Class average',
      subjects: 'subjects'
    }
  };

  const t = text[language as keyof typeof text];

  // Fetch bulletins from API
  const { data: bulletinsData, isLoading } = useQuery({
    queryKey: ['/api/academic-bulletins/bulletins', selectedClass, selectedTerm],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedClass) params.append('classId', selectedClass);
      if (selectedTerm) params.append('term', selectedTerm);
      
      const response = await fetch(`/api/academic-bulletins/bulletins?${params}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch bulletins');
      return response.json();
    },
  });

  const rawBulletins = bulletinsData?.data || [];
  
  // Normalize API statuses to match UI expectations
  // API returns: 'draft', 'finalized', 'archived'
  // UI expects: 'pending', 'completed', 'archived'
  const normalizeStatus = (apiStatus: string): string => {
    const statusMap: Record<string, string> = {
      'draft': 'pending',
      'finalized': 'completed',
      'archived': 'archived'
    };
    return statusMap[apiStatus] || 'pending';
  };

  const bulletins = rawBulletins.map((b: any) => ({
    ...b,
    normalizedStatus: normalizeStatus(b.status || 'draft')
  }));

  const getStatusBadge = (normalizedStatus: string) => {
    switch (normalizedStatus) {
      case 'completed':
        return (
          <Badge className="bg-green-500 text-white" data-testid="badge-completed">
            <CheckCircle className="w-3 h-3 mr-1" />
            {t.statusCompleted}
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-yellow-500 text-white" data-testid="badge-pending">
            <Clock className="w-3 h-3 mr-1" />
            {t.statusPending}
          </Badge>
        );
      case 'archived':
        return (
          <Badge className="bg-gray-500 text-white" data-testid="badge-archived">
            <AlertCircle className="w-3 h-3 mr-1" />
            {t.statusArchived}
          </Badge>
        );
      default:
        return null;
    }
  };

  const filteredBulletins = bulletins.filter((b: any) => {
    if (activeTab === 'all') return true;
    return b.normalizedStatus === activeTab;
  });

  const handleViewBulletin = (bulletinId: number) => {
    window.open(`/bulletin/${bulletinId}`, '_blank');
  };

  const handleDownloadBulletin = async (bulletinId: number, studentName: string) => {
    try {
      const response = await fetch(`/api/academic-bulletins/bulletins/${bulletinId}/download`, {
        credentials: 'include'
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `Bulletin_${studentName.replace(/\s+/g, '_')}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const handlePrintBulletin = (bulletinId: number) => {
    window.open(`/bulletin/${bulletinId}/print`, '_blank');
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">{t.loading}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-bold flex items-center gap-2" data-testid="title-bulletin-previews">
          <FileText className="w-6 h-6 text-blue-600" />
          {t.title}
        </CardTitle>
        <p className="text-sm text-gray-600 dark:text-gray-400" data-testid="subtitle-bulletin-previews">
          {t.subtitle}
        </p>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all" data-testid="tab-all">
              <FileText className="w-4 h-4 mr-2" />
              {t.all} ({bulletins.length})
            </TabsTrigger>
            <TabsTrigger value="completed" data-testid="tab-completed">
              <CheckCircle className="w-4 h-4 mr-2" />
              {t.completed} ({bulletins.filter((b: any) => b.normalizedStatus === 'completed').length})
            </TabsTrigger>
            <TabsTrigger value="pending" data-testid="tab-pending">
              <Clock className="w-4 h-4 mr-2" />
              {t.pending} ({bulletins.filter((b: any) => b.normalizedStatus === 'pending').length})
            </TabsTrigger>
            <TabsTrigger value="archived" data-testid="tab-archived">
              <AlertCircle className="w-4 h-4 mr-2" />
              {t.archived} ({bulletins.filter((b: any) => b.normalizedStatus === 'archived').length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            {filteredBulletins.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                <p className="text-gray-600 dark:text-gray-400 font-semibold" data-testid="text-no-bulletins">
                  {t.noBulletins}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                  {t.noBulletinsDesc}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBulletins.map((bulletin: any) => {
                  // Calculate average from subjects if not provided
                  const calculateAverage = (subjects: any[]) => {
                    if (!Array.isArray(subjects) || subjects.length === 0) return 0;
                    const totalWeighted = subjects.reduce((sum, s) => sum + (s.grade || 0) * (s.coefficient || 1), 0);
                    const totalCoeff = subjects.reduce((sum, s) => sum + (s.coefficient || 1), 0);
                    return totalCoeff > 0 ? (totalWeighted / totalCoeff).toFixed(2) : 0;
                  };
                  
                  const average = bulletin.average || calculateAverage(bulletin.subjects || []);
                  const subjects = Array.isArray(bulletin.subjects) ? bulletin.subjects : [];
                  
                  // Prepare bulletin data for ReportCardPreview
                  const bulletinData = {
                    student: {
                      name: bulletin.studentName,
                      id: bulletin.studentId?.toString() || '',
                      classLabel: bulletin.classLabel,
                      classSize: 30,
                      birthDate: '',
                      birthPlace: '',
                      gender: '',
                      headTeacher: '',
                      guardian: '',
                      isRepeater: false,
                      numberOfSubjects: subjects.length,
                      numberOfPassed: subjects.filter((s: any) => (s.grade || 0) >= 10).length
                    },
                    // Map subjects to 'lines' prop that ReportCardPreview expects
                    lines: subjects.map((s: any) => ({
                      subject: s.name || s.subject || '',  // Subject name
                      teacher: s.teacher || '',
                      m20: s.grade || s.m20 || s.moyenneFinale || 0,  // Note sur 20
                      coef: s.coefficient || s.coef || 1,
                      avXcoef: (s.grade || s.m20 || 0) * (s.coefficient || s.coef || 1),
                      remarksAndSignature: s.remark || s.remarksAndSignature || '',
                      grade: s.cote || s.grade || '',
                      competenciesEvaluated: s.competenciesEvaluated || '',
                      subjectType: s.subjectType || 'general'
                    })),
                    year: bulletin.academicYear || '2024-2025',  // Use 'year' prop
                    trimester: bulletin.trimester || 'Premier',
                    language: language as 'fr' | 'en',  // Pass current language
                    bulletinType: (bulletin.bulletinType || 'general-fr') as any,
                    registrationNumber: bulletin.registrationNumber || ''
                  };
                  
                  return (
                  <Card
                    key={bulletin.id}
                    className="hover:shadow-xl transition-all border-2 border-gray-200 dark:border-gray-700 overflow-hidden cursor-pointer group"
                    data-testid={`bulletin-card-${bulletin.id}`}
                    onClick={() => handleViewBulletin(bulletin.id)}
                  >
                    {/* Visual Preview Thumbnail with Status Badge */}
                    <div className="relative bg-white dark:bg-gray-900">
                      {/* Scaled down ReportCardPreview */}
                      <div className="overflow-hidden" style={{ height: '400px' }}>
                        <div style={{ 
                          transform: 'scale(0.25)', 
                          transformOrigin: 'top left',
                          width: '400%',
                          pointerEvents: 'none'
                        }}>
                          <ReportCardPreview 
                            student={bulletinData.student}
                            lines={bulletinData.lines}
                            year={bulletinData.year}
                            trimester={bulletinData.trimester}
                            language={bulletinData.language}
                            bulletinType={bulletinData.bulletinType}
                            registrationNumber={bulletinData.registrationNumber}
                          />
                        </div>
                      </div>
                      
                      {/* Overlay with gradient for better readability */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      
                      {/* Status Badge */}
                      <div className="absolute top-2 right-2">
                        {getStatusBadge(bulletin.normalizedStatus)}
                      </div>
                      
                      {/* Hover Actions Overlay */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                          <Button
                            size="sm"
                            variant="default"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewBulletin(bulletin.id);
                            }}
                            className="bg-blue-600 hover:bg-blue-700"
                            data-testid={`button-view-${bulletin.id}`}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            {t.view}
                          </Button>
                          <Button
                            size="sm"
                            variant="default"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownloadBulletin(bulletin.id, bulletin.studentName);
                            }}
                            className="bg-green-600 hover:bg-green-700"
                            data-testid={`button-download-${bulletin.id}`}
                          >
                            <Download className="w-4 h-4 mr-1" />
                            PDF
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Info Footer */}
                    <CardContent className="p-3 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm truncate" data-testid={`student-name-${bulletin.id}`}>
                            {bulletin.studentName}
                          </h4>
                          <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                            {bulletin.classLabel} • {bulletin.trimester}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                            {average}
                          </p>
                          <p className="text-xs text-gray-500">/ 20</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default BulletinPreviewGallery;
