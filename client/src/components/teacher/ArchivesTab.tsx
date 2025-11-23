import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import { apiRequest } from '@/lib/queryClient';
import {
  CheckCircle,
  AlertCircle,
  Clock,
  Filter,
  Archive,
  Download
} from 'lucide-react';

interface ArchivedSubmission {
  id: number;
  studentFirstName: string;
  studentLastName: string;
  subjectName: string;
  className: string;
  term: string;
  academicYear: string;
  termAverage: number | null;
  coefficient: number;
  subjectComments: string | null;
  status: 'pending' | 'approved' | 'returned';
  reviewFeedback: string | null;
  returnReason: string | null;
  submittedAt: string;
  reviewedAt: string | null;
}

export default function ArchivesTab() {
  const { language } = useLanguage();
  
  const [filters, setFilters] = useState({
    academicYear: '',
    term: '',
    className: '',
    status: ''
  });

  const text = {
    fr: {
      title: 'Archives',
      subtitle: 'Consultez l\'historique complet de vos soumissions de notes',
      filters: 'Filtres',
      academicYear: 'Année Académique',
      allYears: 'Toutes les années',
      term: 'Trimestre',
      allTerms: 'Tous les trimestres',
      class: 'Classe',
      allClasses: 'Toutes les classes',
      status: 'Statut',
      all: 'Tous',
      pending: 'En attente',
      approved: 'Approuvées',
      returned: 'Retournées',
      student: 'Élève',
      subject: 'Matière',
      average: 'Moyenne',
      comments: 'Commentaires',
      directorFeedback: 'Retour du Directeur',
      returnReason: 'Raison du retour',
      submittedOn: 'Soumis le',
      reviewedOn: 'Révisé le',
      noArchives: 'Aucune archive',
      noArchivesDesc: 'Aucune soumission correspondant aux filtres',
      totalArchives: 'Total archives',
      export: 'Exporter',
      reset: 'Réinitialiser'
    },
    en: {
      title: 'Archives',
      subtitle: 'Browse the complete history of your grade submissions',
      filters: 'Filters',
      academicYear: 'Academic Year',
      allYears: 'All years',
      term: 'Term',
      allTerms: 'All terms',
      class: 'Class',
      allClasses: 'All classes',
      status: 'Status',
      all: 'All',
      pending: 'Pending',
      approved: 'Approved',
      returned: 'Returned',
      student: 'Student',
      subject: 'Subject',
      average: 'Average',
      comments: 'Comments',
      directorFeedback: 'Director Feedback',
      returnReason: 'Return Reason',
      submittedOn: 'Submitted on',
      reviewedOn: 'Reviewed on',
      noArchives: 'No archives',
      noArchivesDesc: 'No submissions matching the filters',
      totalArchives: 'Total archives',
      export: 'Export',
      reset: 'Reset'
    }
  };

  const t = text[language as keyof typeof text];

  // Fetch archived submissions
  const { data, isLoading } = useQuery({
    queryKey: ['/api/teacher/grade-submissions/archives', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.academicYear) params.append('academicYear', filters.academicYear);
      if (filters.term) params.append('term', filters.term);
      if (filters.className) params.append('className', filters.className);
      if (filters.status) params.append('status', filters.status);
      
      const response = await apiRequest('GET', `/api/teacher/grade-submissions/archives?${params.toString()}`);
      return await response.json();
    }
  });

  const archives: ArchivedSubmission[] = data?.archives || [];
  const stats = data?.stats || { total: 0, byYear: {}, byTerm: {}, byStatus: {} };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: { variant: 'secondary' as const, icon: Clock, color: 'text-yellow-600' },
      approved: { variant: 'default' as const, icon: CheckCircle, color: 'text-green-600' },
      returned: { variant: 'destructive' as const, icon: AlertCircle, color: 'text-red-600' }
    };

    const config = variants[status as keyof typeof variants];
    if (!config) return null;

    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {t[status as keyof typeof t]}
      </Badge>
    );
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString(language === 'fr' ? 'fr-FR' : 'en-US', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  };

  const handleReset = () => {
    setFilters({
      academicYear: '',
      term: '',
      className: '',
      status: ''
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Archive className="h-6 w-6 text-gray-600" />
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{t.title}</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">{t.subtitle}</p>
        </div>
      </div>

      {/* Stats Summary */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600">{t.totalArchives}</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">{t.approved}</p>
              <p className="text-2xl font-bold text-green-600">{stats.byStatus?.approved || 0}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">{t.pending}</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.byStatus?.pending || 0}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">{t.returned}</p>
              <p className="text-2xl font-bold text-red-600">{stats.byStatus?.returned || 0}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            {t.filters}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>{t.academicYear}</Label>
              <Input
                placeholder={t.allYears}
                value={filters.academicYear}
                onChange={(e) => setFilters({ ...filters, academicYear: e.target.value })}
              />
            </div>
            <div>
              <Label>{t.term}</Label>
              <Select value={filters.term} onValueChange={(value) => setFilters({ ...filters, term: value })}>
                <SelectTrigger>
                  <SelectValue placeholder={t.allTerms} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="T1">Trimestre 1</SelectItem>
                  <SelectItem value="T2">Trimestre 2</SelectItem>
                  <SelectItem value="T3">Trimestre 3</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{t.class}</Label>
              <Input
                placeholder={t.allClasses}
                value={filters.className}
                onChange={(e) => setFilters({ ...filters, className: e.target.value })}
              />
            </div>
            <div>
              <Label>{t.status}</Label>
              <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
                <SelectTrigger>
                  <SelectValue placeholder={t.all} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">{t.pending}</SelectItem>
                  <SelectItem value="approved">{t.approved}</SelectItem>
                  <SelectItem value="returned">{t.returned}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <Button variant="outline" onClick={handleReset}>
              {t.reset}
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              {t.export}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Archives Table */}
      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Chargement...</p>
            </div>
          ) : archives.length === 0 ? (
            <div className="text-center py-12">
              <Archive className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-900">{t.noArchives}</p>
              <p className="text-sm text-gray-600">{t.noArchivesDesc}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">{t.academicYear}</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">{t.term}</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">{t.class}</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">{t.student}</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">{t.subject}</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">{t.average}</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">{t.status}</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">{t.submittedOn}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {archives.map((archive) => (
                    <tr key={archive.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {archive.academicYear}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {archive.term}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {archive.className}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {archive.studentFirstName} {archive.studentLastName}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {archive.subjectName}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                        {archive.termAverage?.toFixed(2) || '-'}/20
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {getStatusBadge(archive.status)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {formatDate(archive.submittedAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
