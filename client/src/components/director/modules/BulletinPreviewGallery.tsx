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

  const bulletins = bulletinsData?.data || [];

  const getStatusBadge = (status: string) => {
    switch (status) {
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
    return b.status === activeTab;
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
              {t.completed} ({bulletins.filter((b: any) => b.status === 'completed').length})
            </TabsTrigger>
            <TabsTrigger value="pending" data-testid="tab-pending">
              <Clock className="w-4 h-4 mr-2" />
              {t.pending} ({bulletins.filter((b: any) => b.status === 'pending').length})
            </TabsTrigger>
            <TabsTrigger value="archived" data-testid="tab-archived">
              <AlertCircle className="w-4 h-4 mr-2" />
              {t.archived} ({bulletins.filter((b: any) => b.status === 'archived').length})
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
                  
                  return (
                  <Card
                    key={bulletin.id}
                    className="hover:shadow-lg transition-shadow border-2 border-gray-200 dark:border-gray-700"
                    data-testid={`bulletin-card-${bulletin.id}`}
                  >
                    {/* Preview Thumbnail */}
                    <div className="relative h-48 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 flex items-center justify-center border-b border-gray-200 dark:border-gray-700">
                      <div className="text-center">
                        <GraduationCap className="w-16 h-16 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                        <p className="text-4xl font-bold text-blue-700 dark:text-blue-300">
                          {average}<span className="text-2xl">/20</span>
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {subjects.length} {t.subjects}
                        </p>
                      </div>
                      {getStatusBadge(bulletin.status || 'completed')}
                    </div>

                    <CardContent className="p-4">
                      <div className="space-y-3">
                        {/* Student Info */}
                        <div>
                          <div className="flex items-start gap-2">
                            <User className="w-4 h-4 text-gray-500 dark:text-gray-400 mt-0.5" />
                            <div className="flex-1">
                              <h4 className="font-semibold text-lg truncate" data-testid={`student-name-${bulletin.id}`}>
                                {bulletin.studentName || 'Student Name'}
                              </h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400" data-testid={`class-name-${bulletin.id}`}>
                                {bulletin.classLabel || 'Class'}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Term and Year */}
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {bulletin.trimester || 'T1'} • {bulletin.academicYear || '2024-2025'}
                          </span>
                        </div>

                        {/* Statistics */}
                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded text-center">
                            <Award className="w-4 h-4 text-blue-600 dark:text-blue-400 mx-auto mb-1" />
                            <p className="text-xs text-gray-600 dark:text-gray-400">{t.average}</p>
                            <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                              {average}
                            </p>
                          </div>
                          <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded text-center">
                            <FileText className="w-4 h-4 text-green-600 dark:text-green-400 mx-auto mb-1" />
                            <p className="text-xs text-gray-600 dark:text-gray-400">{t.subjects}</p>
                            <p className="text-lg font-bold text-green-600 dark:text-green-400">
                              {subjects.length}
                            </p>
                          </div>
                        </div>

                        {/* Created Date */}
                        {bulletin.createdAt && (
                          <p className="text-xs text-gray-500 dark:text-gray-500">
                            {t.createdOn}: {format(new Date(bulletin.createdAt), 'PP', { locale: language === 'fr' ? fr : enUS })}
                          </p>
                        )}

                        {/* Actions */}
                        <div className="flex gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewBulletin(bulletin.id)}
                            className="flex-1"
                            data-testid={`button-view-${bulletin.id}`}
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            {t.view}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDownloadBulletin(bulletin.id, bulletin.studentName)}
                            data-testid={`button-download-${bulletin.id}`}
                          >
                            <Download className="w-3 h-3 mr-1" />
                            PDF
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handlePrintBulletin(bulletin.id)}
                            data-testid={`button-print-${bulletin.id}`}
                          >
                            <Printer className="w-3 h-3" />
                          </Button>
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
