import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '@/contexts/LanguageContext';
import { ModernCard } from '../../ui/ModernCard';
import { Users, Mail, Phone, BookOpen, Award, Clock, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TeacherData {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  subjects?: string[];
  experience?: number;
  status: string;
}

export function FunctionalDirectorTeachers() {
  const { language } = useLanguage();
  const { data: teachersData = [], isLoading, error } = useQuery<TeacherData[]>({
    queryKey: ['/api/director/teachers'],
    queryFn: async () => {
      const response = await fetch('/api/director/teachers', {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Failed to fetch director teachers');
      }
      return response.json();
    }
  });

  const t = {
    title: language === 'fr' ? 'Gestion des Enseignants' : 'Teacher Management',
    loadingError: language === 'fr' ? 'Erreur de Chargement' : 'Loading Error',
    loadingErrorDesc: language === 'fr' ? 'Impossible de charger les données des enseignants.' : 'Unable to load teacher data.',
    teacherCount: (count: number) => language === 'fr' 
      ? `${count} enseignant${count > 1 ? 's' : ''}` 
      : `${count} teacher${count > 1 ? 's' : ''}`,
    active: language === 'fr' ? 'Actif' : 'Active',
    inactive: language === 'fr' ? 'Inactif' : 'Inactive',
    pending: language === 'fr' ? 'En attente' : 'Pending',
    unknown: language === 'fr' ? 'Inconnu' : 'Unknown',
    yearsExperience: (years: number) => language === 'fr' 
      ? `${years} ans d'expérience` 
      : `${years} years experience`,
    subjectsTaught: language === 'fr' ? 'Matières enseignées' : 'Subjects Taught',
    teacher: language === 'fr' ? 'Enseignant' : 'Teacher',
    noTeachers: language === 'fr' ? 'Aucun enseignant enregistré' : 'No teachers registered',
    noTeachersDesc: language === 'fr' 
      ? 'Ajoutez des enseignants via le module de gestion des enseignants.' 
      : 'Add teachers via the teacher management module.',
    addTeacher: language === 'fr' ? 'Ajouter un enseignant' : 'Add a teacher'
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return t.active;
      case 'inactive':
        return t.inactive;
      case 'pending':
        return t.pending;
      default:
        return t.unknown;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          {t.title}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 rounded-xl h-56"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-red-800 mb-2">
          {t.loadingError}
        </h3>
        <p className="text-red-600">
          {t.loadingErrorDesc}
        </p>
      </div>
    );
  }

  const displayData = Array.isArray(teachersData) ? teachersData : [];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            {t.title}
          </h2>
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-gray-500" />
            <span className="text-sm text-gray-600">
              {t.teacherCount(displayData.length)}
            </span>
          </div>
        </div>
        
        {displayData.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">{t.noTeachers}</h3>
            <p className="text-gray-500 mb-4">{t.noTeachersDesc}</p>
            <Button variant="outline" className="flex items-center gap-2 mx-auto">
              <UserPlus className="w-4 h-4" />
              {t.addTeacher}
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayData.map((teacher) => (
              <ModernCard key={teacher.id} className="hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(teacher.status)}`}>
                      {getStatusText(teacher.status)}
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    {teacher.lastName?.toUpperCase() || ''} {teacher.firstName || ''}
                  </h3>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="truncate">{teacher.email || ''}</span>
                    </div>
                    {teacher.phone && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
                        {teacher.phone}
                      </div>
                    )}
                    {teacher.experience && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="w-4 h-4 mr-2 flex-shrink-0" />
                        {t.yearsExperience(teacher.experience)}
                      </div>
                    )}
                  </div>

                  {teacher.subjects && Array.isArray(teacher.subjects) && teacher.subjects.length > 0 && (
                    <div className="mb-4">
                      <div className="flex items-center text-sm text-gray-700 mb-2">
                        <BookOpen className="w-4 h-4 mr-2" />
                        {t.subjectsTaught}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {teacher.subjects.map((subject, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded-full"
                          >
                            {subject}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center text-sm text-gray-500">
                      <Award className="w-4 h-4 mr-1" />
                      {t.teacher}
                    </div>
                  </div>
                </div>
              </ModernCard>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
