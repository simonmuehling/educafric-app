import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, BookOpen, GraduationCap } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface AnalyticsData {
  total: number;
  byStatus: {
    pending: number;
    approved: number;
    returned: number;
  };
  approvalRate: number;
  byTeacher: Record<number, { teacherId: number; total: number; pending: number; approved: number; returned: number }>;
  bySubject: Record<number, { subjectId: number; total: number; pending: number; approved: number; returned: number }>;
  byClass: Record<number, { classId: number; total: number; pending: number; approved: number; returned: number }>;
}

interface GradeAnalyticsTabProps {
  analytics: AnalyticsData | null;
}

const COLORS = {
  pending: '#EAB308',
  approved: '#22C55E',
  returned: '#EF4444'
};

export default function GradeAnalyticsTab({ analytics }: GradeAnalyticsTabProps) {
  const { language } = useLanguage();

  const text = {
    fr: {
      title: 'Statistiques Avancées',
      subtitle: 'Analyse détaillée des soumissions de notes',
      overviewTitle: 'Vue d\'ensemble',
      total: 'Total',
      approvalRate: 'Taux d\'approbation',
      pending: 'En attente',
      approved: 'Approuvé',
      returned: 'Retourné',
      distributionTitle: 'Distribution des Statuts',
      byTeacherTitle: 'Par Enseignant',
      bySubjectTitle: 'Par Matière',
      byClassTitle: 'Par Classe',
      noData: 'Aucune donnée disponible',
      teacher: 'Enseignant',
      subject: 'Matière',
      class: 'Classe',
      submissions: 'Soumissions'
    },
    en: {
      title: 'Advanced Statistics',
      subtitle: 'Detailed analysis of grade submissions',
      overviewTitle: 'Overview',
      total: 'Total',
      approvalRate: 'Approval Rate',
      pending: 'Pending',
      approved: 'Approved',
      returned: 'Returned',
      distributionTitle: 'Status Distribution',
      byTeacherTitle: 'By Teacher',
      bySubjectTitle: 'By Subject',
      byClassTitle: 'By Class',
      noData: 'No data available',
      teacher: 'Teacher',
      subject: 'Subject',
      class: 'Class',
      submissions: 'Submissions'
    }
  };

  const t = text[language];

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <TrendingUp className="h-16 w-16 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-500">{t.noData}</p>
      </div>
    );
  }

  // Prepare data for status distribution pie chart
  const statusData = [
    { name: t.pending, value: analytics.byStatus.pending || 0, color: COLORS.pending },
    { name: t.approved, value: analytics.byStatus.approved || 0, color: COLORS.approved },
    { name: t.returned, value: analytics.byStatus.returned || 0, color: COLORS.returned }
  ];

  // Prepare data for teachers bar chart
  const teachersData = Object.values(analytics.byTeacher || {}).map((teacher, index) => ({
    name: `${t.teacher} ${teacher.teacherId}`,
    pending: teacher.pending,
    approved: teacher.approved,
    returned: teacher.returned,
    total: teacher.total
  })).slice(0, 10); // Show top 10 teachers

  // Prepare data for subjects bar chart
  const subjectsData = Object.values(analytics.bySubject || {}).map((subject, index) => ({
    name: `${t.subject} ${subject.subjectId}`,
    pending: subject.pending,
    approved: subject.approved,
    returned: subject.returned,
    total: subject.total
  })).slice(0, 10); // Show top 10 subjects

  // Prepare data for classes bar chart
  const classesData = Object.values(analytics.byClass || {}).map((cls, index) => ({
    name: `${t.class} ${cls.classId}`,
    pending: cls.pending,
    approved: cls.approved,
    returned: cls.returned,
    total: cls.total
  })).slice(0, 10); // Show top 10 classes

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t.total}</p>
                <p className="text-3xl font-bold text-gray-900">{analytics.total}</p>
              </div>
              <TrendingUp className="h-10 w-10 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t.approvalRate}</p>
                <p className="text-3xl font-bold text-green-600">{analytics.approvalRate}%</p>
              </div>
              <TrendingUp className="h-10 w-10 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t.pending}</p>
                <p className="text-3xl font-bold text-yellow-600">{analytics.byStatus.pending || 0}</p>
              </div>
              <Users className="h-10 w-10 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t.approved}</p>
                <p className="text-3xl font-bold text-green-600">{analytics.byStatus.approved || 0}</p>
              </div>
              <GraduationCap className="h-10 w-10 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Distribution Pie Chart */}
      <Card>
        <CardHeader>
          <CardTitle>{t.distributionTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsPieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry.name}: ${entry.value}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </RechartsPieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Teachers Distribution */}
      {teachersData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t.byTeacherTitle}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={teachersData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="pending" name={t.pending} fill={COLORS.pending} />
                <Bar dataKey="approved" name={t.approved} fill={COLORS.approved} />
                <Bar dataKey="returned" name={t.returned} fill={COLORS.returned} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Subjects Distribution */}
      {subjectsData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t.bySubjectTitle}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={subjectsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="pending" name={t.pending} fill={COLORS.pending} />
                <Bar dataKey="approved" name={t.approved} fill={COLORS.approved} />
                <Bar dataKey="returned" name={t.returned} fill={COLORS.returned} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Classes Distribution */}
      {classesData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t.byClassTitle}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={classesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="pending" name={t.pending} fill={COLORS.pending} />
                <Bar dataKey="approved" name={t.approved} fill={COLORS.approved} />
                <Bar dataKey="returned" name={t.returned} fill={COLORS.returned} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
