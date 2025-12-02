import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { School, Users, BookOpen, MapPin, Phone, Mail, Calendar, GraduationCap, Clock, Award } from 'lucide-react';

interface SchoolInfo {
  id: number;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  city?: string;
  logoUrl?: string;
  educafricNumber?: string;
}

interface ClassInfo {
  id: number;
  name: string;
  level?: string;
  section?: string;
  academicYear?: string;
  classTeacher?: string;
  studentCount?: number;
}

interface EnrollmentInfo {
  enrollmentDate?: string;
  status?: string;
  academicYear?: string;
}

const StudentMySchool = () => {
  const { language } = useLanguage();
  const { user } = useAuth();

  const { data: schoolData, isLoading: schoolLoading } = useQuery<{ success: boolean; school: SchoolInfo; class: ClassInfo; enrollment: EnrollmentInfo }>({
    queryKey: ['/api/student/my-school'],
    enabled: !!user
  });

  const text = {
    fr: {
      title: 'Mon École',
      subtitle: 'Informations sur votre établissement et classe',
      schoolInfo: 'Établissement',
      classInfo: 'Ma Classe',
      enrollmentInfo: 'Inscription',
      address: 'Adresse',
      phone: 'Téléphone',
      email: 'Email',
      city: 'Ville',
      className: 'Classe',
      level: 'Niveau',
      section: 'Section',
      academicYear: 'Année Scolaire',
      classTeacher: 'Professeur Principal',
      studentsInClass: 'Élèves dans la classe',
      enrollmentDate: 'Date d\'inscription',
      status: 'Statut',
      active: 'Actif',
      pending: 'En attente',
      noSchool: 'Aucune école assignée',
      noClass: 'Aucune classe assignée',
      educafricId: 'ID Educafric',
      loading: 'Chargement...'
    },
    en: {
      title: 'My School',
      subtitle: 'Information about your school and class',
      schoolInfo: 'School',
      classInfo: 'My Class',
      enrollmentInfo: 'Enrollment',
      address: 'Address',
      phone: 'Phone',
      email: 'Email',
      city: 'City',
      className: 'Class',
      level: 'Level',
      section: 'Section',
      academicYear: 'Academic Year',
      classTeacher: 'Class Teacher',
      studentsInClass: 'Students in class',
      enrollmentDate: 'Enrollment Date',
      status: 'Status',
      active: 'Active',
      pending: 'Pending',
      noSchool: 'No school assigned',
      noClass: 'No class assigned',
      educafricId: 'Educafric ID',
      loading: 'Loading...'
    }
  };

  const t = text[language as keyof typeof text];

  if (schoolLoading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-3 text-gray-600">{t.loading}</p>
        </div>
      </div>
    );
  }

  const school = schoolData?.school;
  const classInfo = schoolData?.class;
  const enrollment = schoolData?.enrollment;

  return (
    <div className="p-6 space-y-6" data-testid="student-my-school">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t.title}</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">{t.subtitle}</p>
        </div>
        <School className="w-8 h-8 text-red-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white dark:bg-gray-800" data-testid="card-school-info">
          <CardHeader className="bg-gradient-to-r from-red-600 to-orange-500 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <School className="w-5 h-5" />
              {t.schoolInfo}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {school ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  {school.logoUrl ? (
                    <img 
                      src={school.logoUrl} 
                      alt={school.name} 
                      className="w-16 h-16 rounded-full object-cover border-2 border-red-200"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
                      <School className="w-8 h-8 text-white" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white" data-testid="text-school-name">
                      {school.name}
                    </h3>
                    {school.educafricNumber && (
                      <Badge variant="outline" className="mt-1 text-xs">
                        {t.educafricId}: {school.educafricNumber}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t">
                  {school.address && (
                    <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                      <MapPin className="w-4 h-4 text-red-500 flex-shrink-0" />
                      <span className="text-sm">{school.address}</span>
                    </div>
                  )}
                  {school.city && (
                    <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                      <MapPin className="w-4 h-4 text-orange-500 flex-shrink-0" />
                      <span className="text-sm">{school.city}</span>
                    </div>
                  )}
                  {school.phone && (
                    <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                      <Phone className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm">{school.phone}</span>
                    </div>
                  )}
                  {school.email && (
                    <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                      <Mail className="w-4 h-4 text-blue-500 flex-shrink-0" />
                      <span className="text-sm">{school.email}</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <School className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">{t.noSchool}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800" data-testid="card-class-info">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-500 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5" />
              {t.classInfo}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {classInfo ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                    <BookOpen className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white" data-testid="text-class-name">
                      {classInfo.name}
                    </h3>
                    {classInfo.level && (
                      <Badge className="mt-1 bg-blue-100 text-blue-700">
                        {classInfo.level}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t">
                  {classInfo.section && (
                    <div className="flex items-center justify-between text-gray-700 dark:text-gray-300">
                      <span className="text-sm font-medium">{t.section}</span>
                      <span className="text-sm">{classInfo.section}</span>
                    </div>
                  )}
                  {classInfo.academicYear && (
                    <div className="flex items-center justify-between text-gray-700 dark:text-gray-300">
                      <span className="text-sm font-medium">{t.academicYear}</span>
                      <span className="text-sm">{classInfo.academicYear}</span>
                    </div>
                  )}
                  {classInfo.classTeacher && (
                    <div className="flex items-center justify-between text-gray-700 dark:text-gray-300">
                      <span className="text-sm font-medium">{t.classTeacher}</span>
                      <span className="text-sm">{classInfo.classTeacher}</span>
                    </div>
                  )}
                  {classInfo.studentCount && (
                    <div className="flex items-center justify-between text-gray-700 dark:text-gray-300">
                      <span className="text-sm font-medium">{t.studentsInClass}</span>
                      <Badge variant="secondary">{classInfo.studentCount}</Badge>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">{t.noClass}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {enrollment && (
        <Card className="bg-white dark:bg-gray-800" data-testid="card-enrollment-info">
          <CardHeader className="bg-gradient-to-r from-green-600 to-teal-500 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              {t.enrollmentInfo}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {enrollment.enrollmentDate && (
                <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <Calendar className="w-8 h-8 text-green-500" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t.enrollmentDate}</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {new Date(enrollment.enrollmentDate).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US')}
                    </p>
                  </div>
                </div>
              )}
              {enrollment.status && (
                <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <Clock className="w-8 h-8 text-blue-500" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t.status}</p>
                    <Badge className={enrollment.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'}>
                      {enrollment.status === 'active' ? t.active : t.pending}
                    </Badge>
                  </div>
                </div>
              )}
              {enrollment.academicYear && (
                <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <Users className="w-8 h-8 text-purple-500" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t.academicYear}</p>
                    <p className="font-medium text-gray-900 dark:text-white">{enrollment.academicYear}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StudentMySchool;
