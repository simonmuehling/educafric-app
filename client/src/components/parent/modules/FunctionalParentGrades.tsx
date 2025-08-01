import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  TrendingUp, TrendingDown, Award, AlertTriangle,
  BarChart3, Filter, Search, Eye, 
  Calendar, BookOpen, Star, Target, Users
} from 'lucide-react';

interface ParentGrade {
  id: number;
  studentName: string;
  subject: string;
  subjectCode: string;
  grade: number;
  maxGrade: number;
  coefficient: number;
  examType: string;
  examDate: string;
  teacherName: string;
  className: string;
  term: string;
  schoolYear: string;
  comments: string;
  trend: string;
  classAverage: number;
  rank: number;
  totalStudents: number;
}

const FunctionalParentGrades: React.FC = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedStudent, setSelectedStudent] = useState<string>('all');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedTerm, setSelectedTerm] = useState<string>('current');
  const [isRequestOpen, setIsRequestOpen] = useState(false);
  const [gradeRequest, setGradeRequest] = useState({
    studentName: 'Junior Kamga',
    subject: '',
    requestType: 'clarification',
    message: ''
  });

  // Fetch parent grades data from PostgreSQL API
  const { data: grades = [], isLoading } = useQuery<ParentGrade[]>({
    queryKey: ['/api/parent/grades'],
    enabled: !!user
  });

  // Create grade request mutation
  const createGradeRequestMutation = useMutation({
    mutationFn: async (requestData: any) => {
      const response = await fetch('/api/parent/grades/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(requestData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit grade request');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/parent/grades'] });
      setIsRequestOpen(false);
      setGradeRequest({ studentName: 'Junior Kamga', subject: '', requestType: 'clarification', message: '' });
      toast({
        title: "Demande envoyée",
        description: "Votre demande concernant les notes a été soumise avec succès.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de soumettre la demande. Veuillez réessayer.",
        variant: "destructive",
      });
    },
  });

  const handleSubmitGradeRequest = () => {
    if (gradeRequest.subject && gradeRequest.message) {
      createGradeRequestMutation.mutate(gradeRequest);
    }
  };

  const text = {
    fr: {
      title: 'Notes et Résultats',
      subtitle: 'Suivi des performances académiques de vos enfants',
      loading: 'Chargement des notes...',
      noData: 'Aucune note disponible',
      stats: {
        totalGrades: 'Notes Totales',
        avgGrade: 'Moyenne Générale',
        aboveAverage: 'Au-dessus Moyenne',
        improvements: 'En Progrès'
      },
      examType: {
        homework: 'Devoir',
        quiz: 'Interrogation',
        test: 'Contrôle',
        exam: 'Examen',
        project: 'Projet',
        oral: 'Oral'
      },
      trend: {
        improving: 'En progression',
        stable: 'Stable',
        declining: 'En baisse'
      },
      terms: {
        current: 'Trimestre Actuel',
        term1: '1er Trimestre',
        term2: '2ème Trimestre',
        term3: '3ème Trimestre',
        year: 'Année Complète'
      },
      actions: {
        viewDetails: 'Voir Détails',
        contactTeacher: 'Contacter Prof',
        downloadReport: 'Télécharger Bulletin',
        viewAnalysis: 'Voir Analyse'
      },
      filters: {
        allStudents: 'Tous les enfants',
        allSubjects: 'Toutes matières',
        allTerms: 'Tous trimestres'
      },
      grade: {
        student: 'Élève',
        subject: 'Matière',
        grade: 'Note',
        coefficient: 'Coefficient',
        examType: 'Type d\'évaluation',
        date: 'Date',
        teacher: 'Enseignant',
        classAvg: 'Moyenne Classe',
        rank: 'Rang',
        comments: 'Commentaires',
        term: 'Trimestre'
      }
    },
    en: {
      title: 'Grades & Results',
      subtitle: 'Track your children\'s academic performance',
      loading: 'Loading grades...',
      noData: 'No grades available',
      stats: {
        totalGrades: 'Total Grades',
        avgGrade: 'Average Grade',
        aboveAverage: 'Above Average',
        improvements: 'Improving'
      },
      examType: {
        homework: 'Homework',
        quiz: 'Quiz',
        test: 'Test',
        exam: 'Exam',
        project: 'Project',
        oral: 'Oral'
      },
      trend: {
        improving: 'Improving',
        stable: 'Stable',
        declining: 'Declining'
      },
      terms: {
        current: 'Current Term',
        term1: '1st Term',
        term2: '2nd Term',
        term3: '3rd Term',
        year: 'Full Year'
      },
      actions: {
        viewDetails: 'View Details',
        contactTeacher: 'Contact Teacher',
        downloadReport: 'Download Report',
        viewAnalysis: 'View Analysis'
      },
      filters: {
        allStudents: 'All children',
        allSubjects: 'All subjects',
        allTerms: 'All terms'
      },
      grade: {
        student: 'Student',
        subject: 'Subject',
        grade: 'Grade',
        coefficient: 'Coefficient',
        examType: 'Assessment Type',
        date: 'Date',
        teacher: 'Teacher',
        classAvg: 'Class Average',
        rank: 'Rank',
        comments: 'Comments',
        term: 'Term'
      }
    }
  };

  const t = text[language as keyof typeof text];

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">{t.loading}</span>
        </div>
      </div>
    );
  }

  // Filter grades
  const filteredGrades = (Array.isArray(grades) ? grades : []).filter(grade => {
    if (!grade) return false;
    const matchesStudent = selectedStudent === 'all' || grade.studentName === selectedStudent;
    const matchesSubject = selectedSubject === 'all' || grade.subject === selectedSubject;
    const matchesTerm = selectedTerm === 'current' || grade.term === selectedTerm || selectedTerm === 'year';
    return matchesStudent && matchesSubject && matchesTerm;
  });

  // Get unique values for filters
  const uniqueStudents = [...new Set((Array.isArray(grades) ? grades : []).map(g => g.studentName))];
  const uniqueSubjects = [...new Set((Array.isArray(grades) ? grades : []).map(g => g.subject))];

  // Calculate statistics
  const totalGrades = (Array.isArray(filteredGrades) ? filteredGrades.length : 0);
  const avgGrade = (Array.isArray(filteredGrades) ? filteredGrades.length : 0) > 0 
    ? Math.round(((Array.isArray(filteredGrades) ? filteredGrades : []).reduce((sum, g) => sum + g.grade, 0) / (Array.isArray(filteredGrades) ? filteredGrades.length : 0)) * 10) / 10
    : 0;
  const aboveAverage = (Array.isArray(filteredGrades) ? filteredGrades : []).filter(g => g.grade >= g.classAverage).length;
  const improvements = (Array.isArray(filteredGrades) ? filteredGrades : []).filter(g => g.trend === 'improving').length;

  const getGradeColor = (grade: number, maxGrade: number = 20) => {
    const percentage = (grade / maxGrade) * 100;
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-blue-600';
    if (percentage >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'declining':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      default:
        return <Target className="w-4 h-4 text-blue-600" />;
    }
  };

  const getExamTypeBadge = (type: string) => {
    const variants: Record<string, string> = {
      homework: 'bg-blue-100 text-blue-800',
      quiz: 'bg-green-100 text-green-800',
      test: 'bg-orange-100 text-orange-800',
      exam: 'bg-red-100 text-red-800',
      project: 'bg-purple-100 text-purple-800',
      oral: 'bg-yellow-100 text-yellow-800'
    };

    return (
      <Badge className={variants[type] || 'bg-gray-100 text-gray-800'}>
        {t.examType[type as keyof typeof t.examType]}
      </Badge>
    );
  };

  const getRankBadge = (rank: number, total: number) => {
    const percentage = (rank / total) * 100;
    let color = 'bg-gray-100 text-gray-800';
    
    if (percentage <= 10) color = 'bg-green-100 text-green-800';
    else if (percentage <= 25) color = 'bg-blue-100 text-blue-800';
    else if (percentage <= 50) color = 'bg-yellow-100 text-yellow-800';
    else color = 'bg-orange-100 text-orange-800';

    return (
      <Badge className={color}>
        {rank}/{total}
      </Badge>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t.title || ''}</h1>
          <p className="text-gray-600 mt-1">{t.subtitle}</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">{t?.stats?.totalGrades}</p>
                <p className="text-2xl font-bold">{totalGrades}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Award className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">{t?.stats?.avgGrade}</p>
                <p className={`text-2xl font-bold ${getGradeColor(avgGrade)}`}>{avgGrade}/20</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">{t?.stats?.aboveAverage}</p>
                <p className="text-2xl font-bold text-purple-600">{aboveAverage}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Star className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">{t?.stats?.improvements}</p>
                <p className="text-2xl font-bold text-orange-600">{improvements}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Demande de Révision Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              <AlertTriangle className="w-5 h-5 mr-2 inline" />
              Demande de Révision
            </h3>
          </div>
        </CardHeader>
        <CardContent>
          <Dialog open={isRequestOpen} onOpenChange={setIsRequestOpen}>
            <DialogTrigger asChild>
              <Button className="bg-purple-600 hover:bg-purple-700 w-full" data-testid="button-request-review">
                <AlertTriangle className="w-4 h-4 mr-2" />
                Demander une Révision
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Demande de Révision de Note</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Élève</label>
                  <Select value={gradeRequest.studentName} onValueChange={(value) => setGradeRequest(prev => ({ ...prev, studentName: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Junior Kamga">Junior Kamga</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Matière</label>
                  <Select value={gradeRequest.subject} onValueChange={(value) => setGradeRequest(prev => ({ ...prev, subject: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une matière" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Mathématiques">Mathématiques</SelectItem>
                      <SelectItem value="Français">Français</SelectItem>
                      <SelectItem value="Anglais">Anglais</SelectItem>
                      <SelectItem value="Sciences Physiques">Sciences Physiques</SelectItem>
                      <SelectItem value="Histoire-Géographie">Histoire-Géographie</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Type de demande</label>
                  <Select value={gradeRequest.requestType} onValueChange={(value) => setGradeRequest(prev => ({ ...prev, requestType: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="clarification">Demande de clarification</SelectItem>
                      <SelectItem value="revision">Demande de révision</SelectItem>
                      <SelectItem value="error">Signaler une erreur</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Message</label>
                  <Textarea
                    value={gradeRequest.message}
                    onChange={(e) => setGradeRequest(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Expliquez votre demande concernant la note..."
                    rows={3}
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button 
                    onClick={handleSubmitGradeRequest}
                    disabled={createGradeRequestMutation.isPending || !gradeRequest.subject || !gradeRequest.message}
                    className="flex-1 bg-purple-600 hover:bg-purple-700"
                  >
                    {createGradeRequestMutation.isPending ? 'Envoi...' : 'Soumettre la Demande'}
                  </Button>
                  <Button variant="outline" onClick={() => setIsRequestOpen(false)}>
                    Annuler
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {/* Relevé de Notes - Reorganized Layout */}
      <Card>
        <CardHeader>
          <div>
            <h3 className="text-lg font-semibold mb-4">Relevé de Notes</h3>
            {/* Filter Fields - Moved Under Title */}
            <div className="flex items-center space-x-3 flex-wrap gap-2">
              <select
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e?.target?.value)}
                className="border rounded-md px-3 py-1 text-sm"
              >
                <option value="all">{t?.filters?.allStudents}</option>
                {(Array.isArray(uniqueStudents) ? uniqueStudents : []).map(student => (
                  <option key={student} value={student}>{student}</option>
                ))}
              </select>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e?.target?.value)}
                className="border rounded-md px-3 py-1 text-sm"
              >
                <option value="all">{t?.filters?.allSubjects}</option>
                {(Array.isArray(uniqueSubjects) ? uniqueSubjects : []).map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
              <select
                value={selectedTerm}
                onChange={(e) => setSelectedTerm(e?.target?.value)}
                className="border rounded-md px-3 py-1 text-sm"
              >
                <option value="current">{t?.terms?.current}</option>
                <option value="term1">{t?.terms?.term1}</option>
                <option value="term2">{t?.terms?.term2}</option>
                <option value="term3">{t?.terms?.term3}</option>
                <option value="year">{t?.terms?.year}</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {(Array.isArray(filteredGrades) ? filteredGrades.length : 0) === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">{t.noData}</h3>
              <p className="text-gray-600">Aucune note ne correspond à vos critères de filtre.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {(Array.isArray(filteredGrades) ? filteredGrades : []).map((grade) => (
                <Card key={grade.id} className="border hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="p-2 bg-blue-500 rounded-lg">
                            <BookOpen className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-lg font-semibold text-gray-900">
                              {grade.subject} - {grade.studentName}
                            </h4>
                            <p className="text-sm text-gray-600">{grade.className}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className={`text-3xl font-bold ${getGradeColor(grade.grade, grade.maxGrade)}`}>
                              {grade.grade}/{grade.maxGrade}
                            </div>
                            {getTrendIcon(grade.trend)}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-gray-500">{t?.grade?.examType}</p>
                            {getExamTypeBadge(grade.examType)}
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">{t?.grade?.date}</p>
                            <p className="font-medium">{new Date(grade.examDate).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">{t?.grade?.teacher}</p>
                            <p className="font-medium">{grade.teacherName}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">{t?.grade?.classAvg}</p>
                            <p className="font-medium">{grade.classAverage}/20</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">{t?.grade?.rank}</p>
                            {getRankBadge(grade.rank, grade.totalStudents)}
                          </div>
                        </div>

                        {grade.comments && (
                          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-700">{grade.comments}</p>
                          </div>
                        )}

                        <div className="flex flex-wrap gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-2" />
                            {t?.actions?.viewDetails}
                          </Button>
                          <Button variant="outline" size="sm">
                            <Users className="w-4 h-4 mr-2" />
                            {t?.actions?.contactTeacher}
                          </Button>
                          <Button variant="outline" size="sm">
                            <BarChart3 className="w-4 h-4 mr-2" />
                            {t?.actions?.viewAnalysis}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FunctionalParentGrades;