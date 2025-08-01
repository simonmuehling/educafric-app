import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  FileText, Download, TrendingUp, Award, 
  Clock, CheckCircle, GraduationCap, BookOpen,
  Calendar, User, BarChart3, Trophy
} from 'lucide-react';

interface BulletinGrade {
  subject: string;
  grade: number;
  coefficient: number;
  average: number;
  rank: number;
  maxGrade: number;
  comments: string;
}

interface Bulletin {
  id: number;
  period: string;
  year: string;
  overallGrade: number;
  rank: number;
  totalStudents: number;
  status: string;
  publishedAt: string;
  grades: BulletinGrade[];
  teacherComments: string;
  conduct: string;
  absences: number;
  delays: number;
}

const FunctionalStudentBulletins: React.FC = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const [selectedBulletinId, setSelectedBulletinId] = useState<number | null>(null);

  // Fetch bulletins data from PostgreSQL API
  const { data: bulletins = [], isLoading } = useQuery<Bulletin[]>({
    queryKey: ['/api/student/bulletins'],
    enabled: !!user
  });

  const text = {
    fr: {
      title: 'Mes Bulletins',
      subtitle: 'Consultez vos bulletins de notes et résultats scolaires',
      loading: 'Chargement des bulletins...',
      stats: {
        average: 'Moyenne Générale',
        rank: 'Classement',
        conduct: 'Conduite',
        absences: 'Absences'
      },
      bulletin: {
        download: 'Télécharger PDF',
        period: 'Période',
        year: 'Année Scolaire',
        publishedOn: 'Publié le',
        overallAverage: 'Moyenne Générale',
        classRank: 'Rang de Classe',
        totalStudents: 'Total Élèves',
        teacherComments: 'Commentaires Professeur',
        conduct: 'Conduite',
        absences: 'Absences',
        delays: 'Retards',
        grades: 'Notes par Matière',
        subject: 'Matière',
        grade: 'Note',
        coeff: 'Coeff.',
        classAvg: 'Moy. Classe',
        rank: 'Rang',
        comments: 'Commentaires'
      },
      status: {
        draft: 'Brouillon',
        published: 'Publié',
        validated: 'Validé'
      },
      noData: 'Aucun bulletin disponible',
      noDataDesc: 'Vos bulletins apparaîtront ici une fois publiés par vos enseignants.',
      viewDetails: 'Voir Détails',
      backToList: 'Retour à la liste'
    },
    en: {
      title: 'My Report Cards',
      subtitle: 'View your report cards and academic results',
      loading: 'Loading report cards...',
      stats: {
        average: 'Overall Average',
        rank: 'Ranking',
        conduct: 'Conduct',
        absences: 'Absences'
      },
      bulletin: {
        download: 'Download PDF',
        period: 'Period',
        year: 'Academic Year',
        publishedOn: 'Published on',
        overallAverage: 'Overall Average',
        classRank: 'Class Rank',
        totalStudents: 'Total Students',
        teacherComments: 'Teacher Comments',
        conduct: 'Conduct',
        absences: 'Absences',
        delays: 'Delays',
        grades: 'Grades by Subject',
        subject: 'Subject',
        grade: 'Grade',
        coeff: 'Coeff.',
        classAvg: 'Class Avg.',
        rank: 'Rank',
        comments: 'Comments'
      },
      status: {
        draft: 'Draft',
        published: 'Published',
        validated: 'Validated'
      },
      noData: 'No report cards available',
      noDataDesc: 'Your report cards will appear here once published by your teachers.',
      viewDetails: 'View Details',
      backToList: 'Back to list'
    }
  };

  const t = text[language as keyof typeof text];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800 border-green-200';
      case 'validated': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'draft': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getGradeColor = (grade: number) => {
    if (grade >= 16) return 'text-green-600 font-bold';
    if (grade >= 14) return 'text-blue-600 font-semibold';
    if (grade >= 12) return 'text-orange-600';
    if (grade >= 10) return 'text-red-600';
    return 'text-red-800 font-bold';
  };

  const selectedBulletin = bulletins.find(b => b.id === selectedBulletinId);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t.loading}</p>
        </div>
      </div>
    );
  }

  if (selectedBulletin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {selectedBulletin.period} - {selectedBulletin.year}
              </h1>
              <p className="text-gray-600">{t?.bulletin?.publishedOn} {selectedBulletin.publishedAt}</p>
            </div>
            
            <div className="flex gap-2">
              <Button onClick={() => setSelectedBulletinId(null)} variant="outline">
                {t.backToList}
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Download className="w-4 h-4 mr-2" />
                {t?.bulletin?.download}
              </Button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-white border-gray-200">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                </div>
                <div className={`text-2xl font-bold ${getGradeColor(selectedBulletin.overallGrade)}`}>
                  {selectedBulletin.overallGrade}/20
                </div>
                <div className="text-sm text-gray-600">{t?.bulletin?.overallAverage}</div>
              </CardContent>
            </Card>
            
            <Card className="bg-white border-gray-200">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Trophy className="w-5 h-5 text-yellow-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {selectedBulletin.rank}/{selectedBulletin.totalStudents}
                </div>
                <div className="text-sm text-gray-600">{t?.bulletin?.classRank}</div>
              </CardContent>
            </Card>
            
            <Card className="bg-white border-gray-200">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Award className="w-5 h-5 text-purple-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{selectedBulletin.conduct}</div>
                <div className="text-sm text-gray-600">{t?.bulletin?.conduct}</div>
              </CardContent>
            </Card>
            
            <Card className="bg-white border-gray-200">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Clock className="w-5 h-5 text-red-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{selectedBulletin.absences}</div>
                <div className="text-sm text-gray-600">{t?.bulletin?.absences}</div>
              </CardContent>
            </Card>
          </div>

          {/* Grades Table */}
          <Card className="bg-white border-gray-200 mb-6">
            <CardHeader className="bg-white">
              <h3 className="text-xl font-semibold text-gray-900">{t?.bulletin?.grades}</h3>
            </CardHeader>
            <CardContent className="bg-white">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">{t?.bulletin?.subject}</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-900">{t?.bulletin?.grade}</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-900">{t?.bulletin?.coeff}</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-900">{t?.bulletin?.classAvg}</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-900">{t?.bulletin?.rank}</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">{t?.bulletin?.comments}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedBulletin.grades?.map((grade, index) => (
                      <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-gray-500" />
                            {grade.subject}
                          </div>
                        </td>
                        <td className={`py-3 px-4 text-center text-lg font-semibold ${getGradeColor(grade.grade)}`}>
                          {grade.grade}/20
                        </td>
                        <td className="py-3 px-4 text-center">{grade.coefficient}</td>
                        <td className="py-3 px-4 text-center text-gray-600">{grade.average}/20</td>
                        <td className="py-3 px-4 text-center">
                          <Badge variant="outline">{grade.rank}</Badge>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">{grade.comments}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Comments */}
          {selectedBulletin.teacherComments && (
            <Card className="bg-white border-gray-200">
              <CardHeader className="bg-white">
                <h3 className="text-lg font-semibold text-gray-900">{t?.bulletin?.teacherComments}</h3>
              </CardHeader>
              <CardContent className="bg-white">
                <p className="text-gray-700">{selectedBulletin.teacherComments}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{t.title || ''}</h1>
          <p className="text-gray-600">{t.subtitle}</p>
        </div>

        {/* Bulletins List */}
        {(Array.isArray(bulletins) ? bulletins.length : 0) > 0 ? (
          <div className="grid gap-6">
            {(Array.isArray(bulletins) ? bulletins : []).map((bulletin) => (
              <Card key={bulletin.id} className="bg-white border-gray-200 hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-blue-100 rounded-lg">
                        <FileText className="w-6 h-6 text-blue-600" />
                      </div>
                      
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">
                          {bulletin.period} - {bulletin.year}
                        </h3>
                        <div className="flex items-center gap-4 mt-1">
                          <span className="text-sm text-gray-600">
                            {t?.bulletin?.publishedOn} {bulletin.publishedAt}
                          </span>
                          <Badge className={getStatusColor(bulletin.status)}>
                            {t.status[bulletin.status as keyof typeof t.status]}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className={`text-2xl font-bold ${getGradeColor(bulletin.overallGrade)}`}>
                          {bulletin.overallGrade}/20
                        </div>
                        <div className="text-sm text-gray-600">
                          Rang {bulletin.rank}/{bulletin.totalStudents}
                        </div>
                      </div>
                      
                      <Button 
                        onClick={() => setSelectedBulletinId(bulletin.id)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {t.viewDetails}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <GraduationCap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{t.noData}</h3>
            <p className="text-gray-600">{t.noDataDesc}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FunctionalStudentBulletins;