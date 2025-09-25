import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Video, Play, Users, Calendar, Settings, Plus, Clock, CheckCircle, BookOpen, UserCheck, GraduationCap, User, Book } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface OnlineClassesManagerProps {
  className?: string;
}

const OnlineClassesManager: React.FC<OnlineClassesManagerProps> = ({ className }) => {
  const { language } = useLanguage();
  const [step, setStep] = useState('selection'); // 'selection' | 'course-creation' | 'session-management'
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [showCreateCourse, setShowCreateCourse] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const text = {
    fr: {
      title: 'Classes en ligne',
      subtitle: 'Créez des sessions de cours en visioconférence',
      selectClass: 'Sélectionner une classe',
      selectTeacher: 'Sélectionner un enseignant',
      selectSubject: 'Sélectionner une matière',
      selectionTitle: 'Configuration du cours en ligne',
      selectionDesc: 'Choisissez la classe, l\'enseignant et la matière pour créer votre session de cours en ligne',
      continue: 'Continuer',
      back: 'Retour',
      createCourse: 'Créer le cours',
      courseTitle: 'Titre du cours',
      courseDescription: 'Description du cours',
      scheduleCourse: 'Programmer le cours',
      startNow: 'Démarrer maintenant',
      loading: 'Chargement...',
      noData: 'Aucune donnée disponible'
    },
    en: {
      title: 'Online Classes',
      subtitle: 'Create video conference course sessions',
      selectClass: 'Select a class',
      selectTeacher: 'Select a teacher',
      selectSubject: 'Select a subject',
      selectionTitle: 'Online Course Setup',
      selectionDesc: 'Choose class, teacher and subject to create your online course session',
      continue: 'Continue',
      back: 'Back',
      createCourse: 'Create Course',
      courseTitle: 'Course Title',
      courseDescription: 'Course Description',
      scheduleCourse: 'Schedule Course',
      startNow: 'Start Now',
      loading: 'Loading...',
      noData: 'No data available'
    }
  };

  const t = text[language as keyof typeof text];

  // Fetch classes data
  const { data: classesData, isLoading: classesLoading } = useQuery({
    queryKey: ['/api/director/classes'],
    queryFn: async () => {
      const response = await fetch('/api/director/classes', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch classes');
      return response.json();
    }
  });

  // Fetch teachers data
  const { data: teachersData, isLoading: teachersLoading } = useQuery({
    queryKey: ['/api/director/teachers'],
    queryFn: async () => {
      const response = await fetch('/api/director/teachers', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch teachers');
      return response.json();
    }
  });

  // Subjects/Matières data (predefined list)
  const subjects = [
    { id: 'maths', name: language === 'fr' ? 'Mathématiques' : 'Mathematics' },
    { id: 'french', name: language === 'fr' ? 'Français' : 'French' },
    { id: 'english', name: language === 'fr' ? 'Anglais' : 'English' },
    { id: 'science', name: language === 'fr' ? 'Sciences' : 'Science' },
    { id: 'history', name: language === 'fr' ? 'Histoire' : 'History' },
    { id: 'geography', name: language === 'fr' ? 'Géographie' : 'Geography' },
    { id: 'physics', name: language === 'fr' ? 'Physique' : 'Physics' },
    { id: 'chemistry', name: language === 'fr' ? 'Chimie' : 'Chemistry' },
    { id: 'biology', name: language === 'fr' ? 'Biologie' : 'Biology' },
    { id: 'philosophy', name: language === 'fr' ? 'Philosophie' : 'Philosophy' }
  ];

  // Fetch courses data only after selection is complete
  const { data: coursesData, isLoading: coursesLoading } = useQuery({
    queryKey: ['/api/online-classes/courses'],
    queryFn: async () => {
      const response = await fetch('/api/online-classes/courses', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch courses');
      return response.json();
    },
    enabled: step !== 'selection' // Only fetch when we're past the selection step
  });

  // Create course mutation with selected data
  const createCourseMutation = useMutation({
    mutationFn: async (courseData: any) => {
      const enrichedCourseData = {
        ...courseData,
        classId: selectedClass,
        teacherId: selectedTeacher,
        subjectId: selectedSubject
      };
      return apiRequest('POST', '/api/online-classes/courses', enrichedCourseData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/online-classes/courses'] });
      setStep('session-management');
      toast({
        title: language === 'fr' ? 'Cours créé' : 'Course created',
        description: language === 'fr' ? 'Le cours a été créé avec succès' : 'Course created successfully'
      });
    },
    onError: (error) => {
      toast({
        title: 'Erreur',
        description: language === 'fr' ? 'Erreur lors de la création du cours' : 'Error creating course',
        variant: 'destructive'
      });
    }
  });

  // Handle selection completion
  const handleContinueSelection = () => {
    if (selectedClass && selectedTeacher && selectedSubject) {
      setStep('course-creation');
    } else {
      toast({
        title: language === 'fr' ? 'Sélection incomplète' : 'Incomplete selection',
        description: language === 'fr' ? 'Veuillez sélectionner une classe, un enseignant et une matière' : 'Please select a class, teacher and subject',
        variant: 'destructive'
      });
    }
  };

  // Handle course creation form submission
  const handleCreateCourse = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const courseData = {
      title: formData.get('title'),
      description: formData.get('description'),
      language: language
    };
    createCourseMutation.mutate(courseData);
  };



  // Render selection interface
  const renderSelection = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Video className="w-6 h-6 text-purple-600" />
            <span>{t.selectionTitle}</span>
          </CardTitle>
          <CardDescription>{t.selectionDesc}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Class Selection */}
          <div className="space-y-2">
            <Label className="flex items-center space-x-2">
              <GraduationCap className="w-4 h-4" />
              <span>{t.selectClass}</span>
            </Label>
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger data-testid="select-class">
                <SelectValue placeholder={t.selectClass} />
              </SelectTrigger>
              <SelectContent>
                {classesLoading ? (
                  <SelectItem value="loading" disabled>{t.loading}</SelectItem>
                ) : classesData?.classes?.length > 0 ? (
                  classesData.classes.map((cls: any) => (
                    <SelectItem key={cls.id} value={cls.id.toString()}>
                      {cls.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-data" disabled>{t.noData}</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Teacher Selection */}
          <div className="space-y-2">
            <Label className="flex items-center space-x-2">
              <User className="w-4 h-4" />
              <span>{t.selectTeacher}</span>
            </Label>
            <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
              <SelectTrigger data-testid="select-teacher">
                <SelectValue placeholder={t.selectTeacher} />
              </SelectTrigger>
              <SelectContent>
                {teachersLoading ? (
                  <SelectItem value="loading" disabled>{t.loading}</SelectItem>
                ) : teachersData?.teachers?.length > 0 ? (
                  teachersData.teachers.map((teacher: any) => (
                    <SelectItem key={teacher.id} value={teacher.id.toString()}>
                      {teacher.firstName} {teacher.lastName}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-data" disabled>{t.noData}</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Subject Selection */}
          <div className="space-y-2">
            <Label className="flex items-center space-x-2">
              <Book className="w-4 h-4" />
              <span>{t.selectSubject}</span>
            </Label>
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger data-testid="select-subject">
                <SelectValue placeholder={t.selectSubject} />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((subject) => (
                  <SelectItem key={subject.id} value={subject.id}>
                    {subject.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Continue Button */}
          <Button 
            onClick={handleContinueSelection}
            disabled={!selectedClass || !selectedTeacher || !selectedSubject}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            data-testid="button-continue-selection"
          >
            <Play className="w-4 h-4 mr-2" />
            {t.continue}
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  // Render course creation form
  const renderCourseCreation = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center space-x-2">
              <Video className="w-6 h-6 text-purple-600" />
              <span>{t.createCourse}</span>
            </span>
            <Button variant="outline" onClick={() => setStep('selection')}>
              {t.back}
            </Button>
          </CardTitle>
          <CardDescription>
            {language === 'fr' ? 
              `Classe: ${classesData?.classes?.find((c: any) => c.id.toString() === selectedClass)?.name || ''} | Enseignant: ${teachersData?.teachers?.find((t: any) => t.id.toString() === selectedTeacher)?.firstName || ''} | Matière: ${subjects.find(s => s.id === selectedSubject)?.name || ''}` :
              `Class: ${classesData?.classes?.find((c: any) => c.id.toString() === selectedClass)?.name || ''} | Teacher: ${teachersData?.teachers?.find((t: any) => t.id.toString() === selectedTeacher)?.firstName || ''} | Subject: ${subjects.find(s => s.id === selectedSubject)?.name || ''}`
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateCourse} className="space-y-4">
            <div>
              <Label htmlFor="title">{t.courseTitle}</Label>
              <Input name="title" id="title" required data-testid="input-course-title" />
            </div>
            <div>
              <Label htmlFor="description">{t.courseDescription}</Label>
              <Textarea name="description" id="description" data-testid="input-course-description" />
            </div>
            <Button 
              type="submit" 
              disabled={createCourseMutation.isPending}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              data-testid="button-create-course"
            >
              {createCourseMutation.isPending ? (
                <>
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                  {language === 'fr' ? 'Création...' : 'Creating...'}
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  {t.createCourse}
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );

  // Render session management (after course creation)
  const renderSessionManagement = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center space-x-2">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <span>{language === 'fr' ? 'Cours créé avec succès !' : 'Course created successfully!'}</span>
            </span>
            <Button variant="outline" onClick={() => setStep('selection')}>
              {language === 'fr' ? 'Nouveau cours' : 'New Course'}
            </Button>
          </CardTitle>
          <CardDescription>
            {language === 'fr' ? 
              'Votre cours est maintenant prêt. Vous pouvez démarrer une session immédiatement ou la programmer plus tard.' :
              'Your course is now ready. You can start a session immediately or schedule it for later.'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            className="w-full bg-green-500 hover:bg-green-600"
            data-testid="button-start-now"
          >
            <Play className="w-4 h-4 mr-2" />
            {t.startNow}
          </Button>
          <Button 
            variant="outline" 
            className="w-full"
            data-testid="button-schedule-course"
          >
            <Calendar className="w-4 h-4 mr-2" />
            {t.scheduleCourse}
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className={`space-y-6 ${className}`} data-testid="online-classes-manager">
      <div className="flex flex-col space-y-2">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
          <Video className="w-8 h-8 text-purple-600" />
          <span>{t.title}</span>
        </h1>
        <p className="text-gray-600">{t.subtitle}</p>
      </div>

      <div className="min-h-[400px]">
        {step === 'selection' && renderSelection()}
        {step === 'course-creation' && renderCourseCreation()}
        {step === 'session-management' && renderSessionManagement()}
      </div>
    </div>
  );
};

export default OnlineClassesManager;