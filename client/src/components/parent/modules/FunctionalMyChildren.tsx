import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, BookOpen, Clock, Calendar, Award, 
  TrendingUp, Eye, Settings, Bell, MapPin,
  Phone, Mail, GraduationCap, Star, AlertCircle,
  RefreshCw, Download
} from 'lucide-react';

interface ChildData {
  id: number;
  firstName: string;
  lastName: string;
  class: string;
  level: string;
  averageGrade: number;
  attendanceRate: number;
  totalAbsences: number;
  homeworkCompleted: number;
  totalHomework: number;
  nextExam?: string;
  teacher: string;
  status: 'excellent' | 'good' | 'average' | 'needs_attention';
  profilePicture?: string;
}

const FunctionalMyChildren: React.FC = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedChild, setSelectedChild] = useState<string>('all');

  // Fetch children data from API
  const { data: childrenData, isLoading, refetch } = useQuery<ChildData[]>({
    queryKey: ['/api/parent/children'],
    enabled: !!user
  });

  const text = {
    fr: {
      title: 'Mes Enfants',
      subtitle: 'Vue d\'ensemble et gestion des profils de vos enfants',
      allChildren: 'Tous les enfants',
      averageGrade: 'Moyenne',
      attendance: 'Présence',
      homework: 'Devoirs',
      nextExam: 'Prochain examen',
      teacher: 'Enseignant principal',
      viewDetails: 'Voir détails',
      settings: 'Paramètres',
      notifications: 'Notifications',
      contactTeacher: 'Contacter',
      excellent: 'Excellent',
      good: 'Bien',
      average: 'Moyen',
      needsAttention: 'Attention requise',
      completed: 'terminés',
      absences: 'absences',
      loading: 'Chargement...',
      noChildren: 'Aucun enfant enregistré',
      refresh: 'Actualiser',
      download: 'Télécharger rapport',
      academicProgress: 'Progrès académique',
      recentActivity: 'Activité récente'
    },
    en: {
      title: 'My Children',
      subtitle: 'Overview and management of your children\'s profiles',
      allChildren: 'All children',
      averageGrade: 'Average',
      attendance: 'Attendance',
      homework: 'Homework',
      nextExam: 'Next exam',
      teacher: 'Main teacher',
      viewDetails: 'View details',
      settings: 'Settings',
      notifications: 'Notifications',
      contactTeacher: 'Contact',
      excellent: 'Excellent',
      good: 'Good',
      average: 'Average',
      needsAttention: 'Needs attention',
      completed: 'completed',
      absences: 'absences',
      loading: 'Loading...',
      noChildren: 'No children registered',
      refresh: 'Refresh',
      download: 'Download report',
      academicProgress: 'Academic progress',
      recentActivity: 'Recent activity'
    }
  };

  const t = text[language as keyof typeof text];

  const children = childrenData || [];
  const filteredChildren = selectedChild === 'all' ? children : (Array.isArray(children) ? children : []).filter(child => child?.id?.toString() === selectedChild);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'bg-green-500 text-white';
      case 'good': return 'bg-blue-500 text-white';
      case 'average': return 'bg-yellow-500 text-white';
      case 'needs_attention': return 'bg-red-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'excellent': return t.excellent;
      case 'good': return t.good;
      case 'average': return t.average;
      case 'needs_attention': return t.needsAttention;
      default: return t.average;
    }
  };

  const getGradeColor = (grade: number) => {
    if (grade >= 16) return 'text-green-600';
    if (grade >= 12) return 'text-blue-600';
    if (grade >= 10) return 'text-yellow-600';
    return 'text-red-600';
  };

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

      {/* Filter */}
      {(Array.isArray(children) ? children.length : 0) > 1 && (
        <Card>
          <CardContent className="pt-6">
            <Select value={selectedChild} onValueChange={setSelectedChild}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder={t.allChildren} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.allChildren}</SelectItem>
                {(Array.isArray(children) ? children : []).map(child => (
                  <SelectItem key={child.id} value={child?.id?.toString()}>
                    {child.firstName || ''} {child.lastName || ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      )}

      {/* Children Overview */}
      {(Array.isArray(filteredChildren) ? filteredChildren.length : 0) === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">{t.noChildren}</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {(Array.isArray(filteredChildren) ? filteredChildren : []).map(child => (
            <Card key={child.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                      {child.firstName[0]}{child.lastName[0]}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">
                        {child.firstName || ''} {child.lastName || ''}
                      </h3>
                      <p className="text-sm text-gray-600">{child.class} - {child.level}</p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(child.status)}>
                    {getStatusText(child.status)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Academic Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${getGradeColor(child.averageGrade)}`}>
                      {child?.averageGrade?.toFixed(1)}
                    </div>
                    <p className="text-xs text-gray-600">{t.averageGrade}</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {child.attendanceRate}%
                    </div>
                    <p className="text-xs text-gray-600">{t.attendance}</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {child.homeworkCompleted}/{child.totalHomework}
                    </div>
                    <p className="text-xs text-gray-600">{t.homework}</p>
                  </div>
                </div>

                {/* Progress Bars */}
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{t.academicProgress}</span>
                      <span>{child?.averageGrade?.toFixed(1)}/20</span>
                    </div>
                    <Progress value={(child.averageGrade / 20) * 100} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{t.attendance}</span>
                      <span>{child.attendanceRate}%</span>
                    </div>
                    <Progress value={child.attendanceRate} className="h-2" />
                  </div>
                </div>

                {/* Additional Info */}
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <GraduationCap className="w-4 h-4 mr-2" />
                    {t.teacher}: {child.teacher}
                  </div>
                  {child.totalAbsences > 0 && (
                    <div className="flex items-center">
                      <AlertCircle className="w-4 h-4 mr-2 text-orange-500" />
                      {child.totalAbsences} {t.absences}
                    </div>
                  )}
                  {child.nextExam && (
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      {t.nextExam}: {child.nextExam}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-3">
                  <Button size="sm" className="flex-1">
                    <Eye className="w-4 h-4 mr-1" />
                    {t.viewDetails}
                  </Button>
                  <Button variant="outline" size="sm">
                    <Phone className="w-4 h-4 mr-1" />
                    {t.contactTeacher}
                  </Button>
                  <Button variant="outline" size="sm">
                    <Settings className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Recent Activity Summary */}
      {(Array.isArray(children) ? children.length : 0) > 0 && (
        <Card>
          <CardHeader>
            <h3 className="text-xl font-semibold">{t.recentActivity}</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {children.slice(0, 3).map(child => (
                <div key={child.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <BookOpen className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">{child.firstName || ''} {child.lastName || ''}</p>
                      <p className="text-sm text-gray-600">
                        Dernière note: {child.averageGrade}/20 en {child.class}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline">{child.status === 'excellent' ? '🏆' : child.status === 'good' ? '⭐' : '📚'}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FunctionalMyChildren;