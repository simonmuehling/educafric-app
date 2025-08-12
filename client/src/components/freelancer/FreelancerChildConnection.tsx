import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { UserPlus, Phone, Mail, School, Users, CheckCircle, Clock, BookOpen, GraduationCap } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface FreelancerChildConnectionProps {
  freelancerId: number;
  onConnectionSuccess?: () => void;
}

const FreelancerChildConnection: React.FC<FreelancerChildConnectionProps> = ({ 
  freelancerId, 
  onConnectionSuccess 
}) => {
  const { toast } = useToast();
  const { language } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  
  const [studentData, setStudentData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    dateOfBirth: '',
    grade: '',
    schoolName: '',
    serviceType: 'tutoring', // tutoring, homework_help, exam_prep
    subjects: [] as string[],
    hourlyRate: '',
    notes: ''
  });

  const [searchResults, setSearchResults] = useState<any[]>([]);

  const text = {
    fr: {
      title: 'Ajouter un élève',
      subtitle: 'Connexion rapide pour freelancers',
      step1: 'Informations de l\'élève',
      step2: 'Vérification et connexion',
      firstName: 'Prénom de l\'élève',
      lastName: 'Nom de l\'élève',
      phoneNumber: 'Numéro de téléphone',
      dateOfBirth: 'Date de naissance',
      grade: 'Classe',
      schoolName: 'Nom de l\'école',
      serviceType: 'Type de service',
      subjects: 'Matières enseignées',
      hourlyRate: 'Tarif horaire (FCFA)',
      notes: 'Notes spéciales',
      searchStudent: 'Rechercher l\'élève',
      connecting: 'Connexion en cours...',
      createRequest: 'Créer une demande',
      foundExisting: 'Élève trouvé dans le système',
      notFound: 'Aucun élève trouvé',
      willNotify: 'L\'école et les parents seront notifiés',
      success: 'Connexion réussie',
      grades: {
        'maternelle': 'Maternelle',
        'cp': 'CP',
        'ce1': 'CE1',
        'ce2': 'CE2',
        'cm1': 'CM1',
        'cm2': 'CM2',
        '6eme': '6ème',
        '5eme': '5ème',
        '4eme': '4ème',
        '3eme': '3ème',
        'seconde': 'Seconde',
        'premiere': 'Première',
        'terminale': 'Terminale'
      },
      serviceTypes: {
        'tutoring': 'Cours particuliers',
        'homework_help': 'Aide aux devoirs',
        'exam_prep': 'Préparation examens',
        'language_learning': 'Apprentissage langues',
        'music_lessons': 'Cours de musique',
        'sports_coaching': 'Coaching sportif'
      },
      subjectOptions: [
        'Mathématiques', 'Français', 'Anglais', 'Sciences', 'Histoire-Géo',
        'Physique-Chimie', 'SVT', 'Philosophie', 'Économie', 'Informatique',
        'Espagnol', 'Allemand', 'Arts plastiques', 'Musique', 'Sport'
      ]
    },
    en: {
      title: 'Add a student',
      subtitle: 'Quick connection for freelancers',
      step1: 'Student information',
      step2: 'Verification and connection',
      firstName: 'Student\'s first name',
      lastName: 'Student\'s last name',
      phoneNumber: 'Phone number',
      dateOfBirth: 'Date of birth',
      grade: 'Grade',
      schoolName: 'School name',
      serviceType: 'Service type',
      subjects: 'Subjects taught',
      hourlyRate: 'Hourly rate (FCFA)',
      notes: 'Special notes',
      searchStudent: 'Search for student',
      connecting: 'Connecting...',
      createRequest: 'Create request',
      foundExisting: 'Student found in system',
      notFound: 'No student found',
      willNotify: 'School and parents will be notified',
      success: 'Connection successful',
      grades: {
        'maternelle': 'Kindergarten',
        'cp': 'Grade 1',
        'ce1': 'Grade 2',
        'ce2': 'Grade 3',
        'cm1': 'Grade 4',
        'cm2': 'Grade 5',
        '6eme': 'Grade 6',
        '5eme': 'Grade 7',
        '4eme': 'Grade 8',
        '3eme': 'Grade 9',
        'seconde': 'Grade 10',
        'premiere': 'Grade 11',
        'terminale': 'Grade 12'
      },
      serviceTypes: {
        'tutoring': 'Private tutoring',
        'homework_help': 'Homework assistance',
        'exam_prep': 'Exam preparation',
        'language_learning': 'Language learning',
        'music_lessons': 'Music lessons',
        'sports_coaching': 'Sports coaching'
      },
      subjectOptions: [
        'Mathematics', 'French', 'English', 'Science', 'History-Geography',
        'Physics-Chemistry', 'Biology', 'Philosophy', 'Economics', 'Computer Science',
        'Spanish', 'German', 'Arts', 'Music', 'Sports'
      ]
    }
  };

  const t = text[language as keyof typeof text];

  const handleSearchStudent = async () => {
    setIsLoading(true);
    try {
      const response = await apiRequest('POST', '/api/freelancer/search-student', {
        firstName: studentData.firstName,
        lastName: studentData.lastName,
        phoneNumber: studentData.phoneNumber,
        schoolName: studentData.schoolName,
        dateOfBirth: studentData.dateOfBirth
      });

      const data = await response.json();
      
      if (response.ok) {
        setSearchResults(data.results || []);
        setStep(2);
      } else {
        throw new Error(data.message || 'Search failed');
      }
    } catch (error: any) {
      toast({
        title: "Erreur de recherche",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnectToStudent = async (studentId?: number) => {
    setIsLoading(true);
    try {
      const response = await apiRequest('POST', '/api/freelancer/connect-student', {
        freelancerId,
        studentId: studentId || null,
        studentData: studentId ? null : studentData,
        serviceType: studentData.serviceType,
        subjects: studentData.subjects,
        hourlyRate: studentData.hourlyRate,
        notes: studentData.notes
      });

      const data = await response.json();
      
      if (response.ok) {
        toast({
          title: t.success,
          description: data.message,
        });
        onConnectionSuccess?.();
        setStep(1);
        setStudentData({
          firstName: '',
          lastName: '',
          phoneNumber: '',
          dateOfBirth: '',
          grade: '',
          schoolName: '',
          serviceType: 'tutoring',
          subjects: [],
          hourlyRate: '',
          notes: ''
        });
      } else {
        throw new Error(data.message || 'Connection failed');
      }
    } catch (error: any) {
      toast({
        title: "Erreur de connexion",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSubject = (subject: string) => {
    setStudentData(prev => ({
      ...prev,
      subjects: prev.subjects.includes(subject)
        ? prev.subjects.filter(s => s !== subject)
        : [...prev.subjects, subject]
    }));
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center space-x-2 mb-2">
          <GraduationCap className="w-6 h-6 text-purple-600" />
          <CardTitle>{t.title}</CardTitle>
        </div>
        <p className="text-sm text-gray-600">{t.subtitle}</p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center">
              <BookOpen className="w-5 h-5 mr-2" />
              {t.step1}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">{t.firstName}</Label>
                <Input
                  id="firstName"
                  value={studentData.firstName}
                  onChange={(e) => setStudentData({ ...studentData, firstName: e.target.value })}
                  placeholder="Prénom"
                  data-testid="input-student-firstname"
                />
              </div>
              
              <div>
                <Label htmlFor="lastName">{t.lastName}</Label>
                <Input
                  id="lastName"
                  value={studentData.lastName}
                  onChange={(e) => setStudentData({ ...studentData, lastName: e.target.value })}
                  placeholder="Nom"
                  data-testid="input-student-lastname"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phoneNumber">{t.phoneNumber}</Label>
                <div className="flex">
                  <Select value="+237" onValueChange={() => {}}>
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="+237">🇨🇲 +237</SelectItem>
                      <SelectItem value="+33">🇫🇷 +33</SelectItem>
                      <SelectItem value="+1">🇺🇸 +1</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    id="phoneNumber"
                    value={studentData.phoneNumber}
                    onChange={(e) => setStudentData({ ...studentData, phoneNumber: e.target.value })}
                    placeholder="XXX XXX XXX"
                    className="rounded-l-none"
                    data-testid="input-student-phone"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="dateOfBirth">{t.dateOfBirth}</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={studentData.dateOfBirth}
                  onChange={(e) => setStudentData({ ...studentData, dateOfBirth: e.target.value })}
                  data-testid="input-student-dob"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="grade">{t.grade}</Label>
                <Select 
                  value={studentData.grade} 
                  onValueChange={(value) => setStudentData({ ...studentData, grade: value })}
                >
                  <SelectTrigger data-testid="select-student-grade">
                    <SelectValue placeholder="Sélectionner la classe" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(t.grades).map(([key, value]) => (
                      <SelectItem key={key} value={key}>{value}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="serviceType">{t.serviceType}</Label>
                <Select 
                  value={studentData.serviceType} 
                  onValueChange={(value) => setStudentData({ ...studentData, serviceType: value })}
                >
                  <SelectTrigger data-testid="select-service-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(t.serviceTypes).map(([key, value]) => (
                      <SelectItem key={key} value={key}>{value}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="schoolName">{t.schoolName}</Label>
              <Input
                id="schoolName"
                value={studentData.schoolName}
                onChange={(e) => setStudentData({ ...studentData, schoolName: e.target.value })}
                placeholder="Nom complet de l'école"
                data-testid="input-school-name"
              />
            </div>

            <div>
              <Label>{t.subjects}</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                {t.subjectOptions.map((subject) => (
                  <Button
                    key={subject}
                    variant={studentData.subjects.includes(subject) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleSubject(subject)}
                    className="text-xs"
                    data-testid={`subject-${subject.toLowerCase().replace(/[^a-z]/g, '-')}`}
                  >
                    {subject}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="hourlyRate">{t.hourlyRate}</Label>
                <Input
                  id="hourlyRate"
                  type="number"
                  value={studentData.hourlyRate}
                  onChange={(e) => setStudentData({ ...studentData, hourlyRate: e.target.value })}
                  placeholder="Ex: 5000"
                  data-testid="input-hourly-rate"
                />
              </div>
              
              <div>
                <Label htmlFor="notes">{t.notes}</Label>
                <Input
                  id="notes"
                  value={studentData.notes}
                  onChange={(e) => setStudentData({ ...studentData, notes: e.target.value })}
                  placeholder="Informations supplémentaires"
                  data-testid="input-notes"
                />
              </div>
            </div>

            <Button 
              onClick={handleSearchStudent}
              disabled={isLoading || !studentData.firstName || !studentData.lastName}
              className="w-full"
              data-testid="button-search-student"
            >
              {isLoading ? (
                <>
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                  {t.connecting}
                </>
              ) : (
                <>
                  <Users className="w-4 h-4 mr-2" />
                  {t.searchStudent}
                </>
              )}
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center">
              <CheckCircle className="w-5 h-5 mr-2" />
              {t.step2}
            </h3>
            
            {searchResults.length > 0 ? (
              <div className="space-y-3">
                <p className="text-green-600 font-medium">{t.foundExisting}</p>
                {searchResults.map((student, index) => (
                  <Card key={index} className="border-green-200">
                    <CardContent className="pt-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-semibold">{student.firstName} {student.lastName}</h4>
                          <p className="text-sm text-gray-600">{student.schoolName} - {student.grade}</p>
                          <p className="text-sm text-gray-600">{student.phoneNumber}</p>
                          {student.parents && (
                            <p className="text-xs text-blue-600">Parents: {student.parents}</p>
                          )}
                        </div>
                        <Button 
                          onClick={() => handleConnectToStudent(student.id)}
                          disabled={isLoading}
                          data-testid={`button-connect-existing-${index}`}
                        >
                          Connecter
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-orange-600 font-medium">{t.notFound}</p>
                <p className="text-sm text-gray-600">{t.willNotify}</p>
                <Button 
                  onClick={() => handleConnectToStudent()}
                  disabled={isLoading}
                  className="w-full"
                  data-testid="button-create-request"
                >
                  {isLoading ? (
                    <>
                      <Clock className="w-4 h-4 mr-2 animate-spin" />
                      {t.connecting}
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 mr-2" />
                      {t.createRequest}
                    </>
                  )}
                </Button>
              </div>
            )}
            
            <Button 
              variant="outline" 
              onClick={() => setStep(1)}
              className="w-full"
              data-testid="button-back"
            >
              Retour
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FreelancerChildConnection;