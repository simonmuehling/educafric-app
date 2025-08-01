import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  BookOpen, Plus, Edit, Save, Download, Eye, BarChart3, 
  Users, Calculator, Award, TrendingUp, Filter, Search,
  Phone, Mail, UserCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ModernCard } from '@/components/ui/ModernCard';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

const FunctionalGrades = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [selectedClass, setSelectedClass] = useState('6eme-a');
  const [selectedSubject, setSelectedSubject] = useState('mathematiques');
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [isGradeHistoryOpen, setIsGradeHistoryOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [grades, setGrades] = useState<Record<string, any>>({});
  const [newGrade, setNewGrade] = useState<Record<string, string>>({});

  const text = {
    fr: {
      title: 'Gestion des Notes',
      subtitle: 'Saisie et suivi des évaluations par classe et matière',
      selectClass: 'Sélectionner une classe',
      selectSubject: 'Sélectionner une matière',
      addGrade: 'Ajouter une note',
      saveGrades: 'Enregistrer les notes',
      exportReport: 'Exporter le rapport',
      gradeHistory: 'Historique des notes',
      quickStats: 'Statistiques rapides',
      average: 'Moyenne',
      coefficient: 'Coefficient',
      evaluation: 'Évaluation',
      student: 'Élève',
      grade: 'Note',
      generalAverage: 'Moyenne générale',
      classAverage: 'Moyenne de classe',
      bestStudent: 'Meilleur élève',
      improvementNeeded: 'À améliorer',
      enterGrade: 'Saisir note',
      contactParent: 'Contacter parent',
      viewDetails: 'Voir détails'
    },
    en: {
      title: 'Grade Management',
      subtitle: 'Input and track evaluations by class and subject',
      selectClass: 'Select a class',
      selectSubject: 'Select a subject',
      addGrade: 'Add grade',
      saveGrades: 'Save grades',
      exportReport: 'Export report',
      gradeHistory: 'Grade history',
      quickStats: 'Quick stats',
      average: 'Average',
      coefficient: 'Coefficient',
      evaluation: 'Evaluation',
      student: 'Student',
      grade: 'Grade',
      generalAverage: 'General average',
      classAverage: 'Class average',
      bestStudent: 'Best student',
      improvementNeeded: 'Needs improvement',
      enterGrade: 'Enter grade',
      contactParent: 'Contact parent',
      viewDetails: 'View details'
    }
  };

  const t = text[language as keyof typeof text];

  const classes = [
    { id: '6eme-a', name: '6ème A', students: 32 },
    { id: '5eme-b', name: '5ème B', students: 28 },
    { id: '4eme-c', name: '4ème C', students: 30 }
  ];

  const subjects = [
    { id: 'mathematiques', name: 'Mathématiques', coefficient: 4 },
    { id: 'francais', name: 'Français', coefficient: 4 },
    { id: 'anglais', name: 'Anglais', coefficient: 3 },
    { id: 'sciences', name: 'Sciences', coefficient: 3 },
    { id: 'histoire', name: 'Histoire-Géographie', coefficient: 2 }
  ];

  const students = [
    { 
      id: 1, 
      name: 'ABANDA Marie', 
      number: '001',
      parentName: 'Mme Rose Abanda',
      parentPhone: '+237 677 123 456',
      parentEmail: 'rose.abanda@gmail.com',
      currentGrades: [18, 16, 19, 17],
      average: 17.5
    },
    { 
      id: 2, 
      name: 'BELLO Jean', 
      number: '002',
      parentName: 'M. Paul Bello',
      parentPhone: '+237 655 987 654',
      parentEmail: 'paul.bello@yahoo.fr',
      currentGrades: [14, 15, 13, 16],
      average: 14.5
    },
    { 
      id: 3, 
      name: 'DJOMO Sarah', 
      number: '003',
      parentName: 'Dr. Marie Djomo',
      parentPhone: '+237 698 456 789',
      parentEmail: 'marie.djomo@health.cm',
      currentGrades: [12, 11, 13, 14],
      average: 12.5
    },
    { 
      id: 4, 
      name: 'FOKO Paul', 
      number: '004',
      parentName: 'Mme Christine Foko',
      parentPhone: '+237 677 321 987',
      parentEmail: 'christine.foko@gmail.com',
      currentGrades: [8, 10, 9, 11],
      average: 9.5
    },
    { 
      id: 5, 
      name: 'KAMGA Alice', 
      number: '005',
      parentName: 'M. Jean Kamga',
      parentPhone: '+237 655 654 321',
      parentEmail: 'jean.kamga@business.cm',
      currentGrades: [16, 17, 15, 18],
      average: 16.5
    }
  ];

  const evaluationTypes = [
    { id: 'interrogation', name: 'Interrogation', coefficient: 1 },
    { id: 'devoir', name: 'Devoir surveillé', coefficient: 2 },
    { id: 'composition', name: 'Composition', coefficient: 3 }
  ];

  const addGrade = (studentId: number, value: string) => {
    const gradeValue = parseFloat(value);
    if (gradeValue >= 0 && gradeValue <= 20) {
      setNewGrade(prev => ({
        ...prev,
        [studentId]: value
      }));
    }
  };

  const saveGrades = async () => {
    try {
      const gradeData = {
        classId: selectedClass,
        subjectId: selectedSubject,
        grades: newGrade,
        evaluationType: 'interrogation',
        date: new Date().toISOString().split('T')[0]
      };
      
      await apiRequest('POST', '/api/grades', gradeData);
      
      toast({
        title: language === 'fr' ? 'Notes enregistrées' : 'Grades saved',
        description: `${Object.keys(newGrade).length} ${language === 'fr' ? 'notes ajoutées avec succès' : 'grades added successfully'}`
      });
      
      setNewGrade({});
    } catch (error) {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' ? 'Impossible d\'enregistrer les notes' : 'Failed to save grades',
        variant: 'destructive'
      });
    }
  };

  const exportReport = async () => {
    try {
      await apiRequest('GET', `/api/grades/export?class=${selectedClass}&subject=${selectedSubject}`);
      toast({
        title: language === 'fr' ? 'Rapport exporté' : 'Report exported',
        description: language === 'fr' ? 'Le rapport de notes a été téléchargé' : 'Grade report has been downloaded'
      });
    } catch (error) {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' ? 'Impossible d\'exporter le rapport' : 'Failed to export report',
        variant: 'destructive'
      });
    }
  };

  const showGradeHistory = () => {
    setIsGradeHistoryOpen(true);
  };

  const showQuickStats = () => {
    setIsStatsOpen(true);
  };

  const contactParent = (student: any) => {
    setSelectedStudent(student);
  };

  const getGradeColor = (grade: number) => {
    if (grade >= 16) return 'text-green-600 bg-green-100';
    if (grade >= 12) return 'text-blue-600 bg-blue-100';
    if (grade >= 10) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const classAverage = (Array.isArray(students) ? students : []).reduce((sum, student) => sum + student.average, 0) / (Array.isArray(students) ? (Array.isArray(students) ? students.length : 0) : 0);
  const bestStudent = (Array.isArray(students) ? students : []).reduce((best, student) => student.average > best.average ? student : best);
  const studentsNeedingHelp = (Array.isArray(students) ? students : []).filter(student => student.average < 10);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{t.title || ''}</h2>
          <p className="text-gray-600">{t.subtitle}</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportReport} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            {t.exportReport}
          </Button>
          <Button onClick={saveGrades} className="bg-blue-600 hover:bg-blue-700">
            <Save className="w-4 h-4 mr-2" />
            {t.saveGrades}
          </Button>
        </div>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">{t.selectClass}</label>
          <select 
            value={selectedClass}
            onChange={(e) => setSelectedClass(e?.target?.value)}
            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {(Array.isArray(classes) ? classes : []).map(cls => (
              <option key={cls.id} value={cls.id}>{cls.name || ''}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">{t.selectSubject}</label>
          <select 
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e?.target?.value)}
            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {(Array.isArray(subjects) ? subjects : []).map(subject => (
              <option key={subject.id} value={subject.id}>
                {subject.name || ''} (Coef. {subject.coefficient})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Type d'évaluation</label>
          <select className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            {(Array.isArray(evaluationTypes) ? evaluationTypes : []).map(type => (
              <option key={type.id} value={type.id}>
                {type.name || ''} (Coef. {type.coefficient})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <ModernCard className="p-4 text-center activity-card-blue">
          <div className="text-2xl font-bold text-gray-800">{(Array.isArray(students) ? (Array.isArray(students) ? students.length : 0) : 0)}</div>
          <div className="text-sm text-gray-600">Élèves</div>
        </ModernCard>
        <ModernCard className="p-4 text-center activity-card-green">
          <div className="text-2xl font-bold text-gray-800">{classAverage.toFixed(1)}/20</div>
          <div className="text-sm text-gray-600">{t.classAverage}</div>
        </ModernCard>
        <ModernCard className="p-4 text-center activity-card-purple">
          <div className="text-2xl font-bold text-gray-800">{bestStudent.average}/20</div>
          <div className="text-sm text-gray-600">{t.bestStudent}</div>
        </ModernCard>
        <ModernCard className="p-4 text-center activity-card-red">
          <div className="text-2xl font-bold text-gray-800">{(Array.isArray(studentsNeedingHelp) ? studentsNeedingHelp.length : 0)}</div>
          <div className="text-sm text-gray-600">{t.improvementNeeded}</div>
        </ModernCard>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-2">
        <Button onClick={showGradeHistory} variant="outline">
          <Eye className="w-4 h-4 mr-2" />
          {t.gradeHistory}
        </Button>
        <Button onClick={showQuickStats} variant="outline">
          <BarChart3 className="w-4 h-4 mr-2" />
          {t.quickStats}
        </Button>
      </div>

      {/* Student List with Grades */}
      <ModernCard className="p-4">
        <div className="space-y-4">
          {(Array.isArray(students) ? students : []).map(student => (
            <div key={student.id} className="border rounded-lg p-4 hover:bg-gray-50">
              {/* Version Mobile */}
              <div className="block md:hidden">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                      {student.number}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{student.name || ''}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={getGradeColor(student.average)}>
                          Moy: {student.average}/20
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => contactParent(student)}
                    className="text-blue-600"
                  >
                    <Phone className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="0"
                      max="20"
                      step="0.5"
                      placeholder="Note /20"
                      value={newGrade[student.id] || ''}
                      onChange={(e) => addGrade(student.id, e?.target?.value)}
                      className="flex-1"
                    />
                    <Button 
                      size="sm"
                      onClick={() => addGrade(student.id, newGrade[student.id] || '')}
                      disabled={!newGrade[student.id]}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="flex flex-wrap gap-1">
                    {student.currentGrades.map((grade, index) => (
                      <Badge key={index} className={getGradeColor(grade)}>
                        {grade}/20
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Version Desktop */}
              <div className="hidden md:flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
                    {student.number}
                  </div>
                  <div>
                    <p className="font-medium">{student.name || ''}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={getGradeColor(student.average)}>
                        Moyenne: {student.average}/20
                      </Badge>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {student.currentGrades.map((grade, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {grade}/20
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min="0"
                    max="20"
                    step="0.5"
                    placeholder="Note /20"
                    value={newGrade[student.id] || ''}
                    onChange={(e) => addGrade(student.id, e?.target?.value)}
                    className="w-24"
                  />
                  <Button 
                    size="sm"
                    onClick={() => addGrade(student.id, newGrade[student.id] || '')}
                    disabled={!newGrade[student.id]}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => contactParent(student)}
                    className="text-blue-600"
                  >
                    <Phone className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ModernCard>

      {/* Dialog Historique des Notes */}
      <Dialog open={isGradeHistoryOpen} onOpenChange={setIsGradeHistoryOpen}>
        <DialogContent className="max-w-4xl bg-white">
          <DialogHeader>
            <DialogTitle>Historique des Notes - {selectedClass.toUpperCase()}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-100 rounded-lg">
                <div className="text-2xl font-bold text-blue-800">{classAverage.toFixed(1)}/20</div>
                <div className="text-sm text-blue-600">Moyenne de classe</div>
              </div>
              <div className="text-center p-4 bg-green-100 rounded-lg">
                <div className="text-2xl font-bold text-green-800">{bestStudent.average}/20</div>
                <div className="text-sm text-green-600">Meilleure note</div>
              </div>
              <div className="text-center p-4 bg-yellow-100 rounded-lg">
                <div className="text-2xl font-bold text-yellow-800">15</div>
                <div className="text-sm text-yellow-600">Notes ajoutées ce mois</div>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Évolution récente :</h4>
              <div className="space-y-2">
                {students.slice(0, 3).map((student, index) => (
                  <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                    <span>{student.name || ''} - Moyenne: {student.average}/20</span>
                    <Badge className={getGradeColor(student.average)}>
                      {student.average >= classAverage ? 'Au-dessus' : 'En-dessous'} de la moyenne
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Statistiques Rapides */}
      <Dialog open={isStatsOpen} onOpenChange={setIsStatsOpen}>
        <DialogContent className="max-w-2xl bg-white">
          <DialogHeader>
            <DialogTitle>Statistiques Rapides - {selectedClass.toUpperCase()}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-medium">Répartition des notes :</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Excellent (≥16):</span>
                  <Badge className="bg-green-100 text-green-800">2 élèves</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Bien (12-16):</span>
                  <Badge className="bg-blue-100 text-blue-800">2 élèves</Badge>
                </div>
                <div className="flex justify-between">
                  <span>À améliorer (&lt;10):</span>
                  <Badge className="bg-red-100 text-red-800">1 élève</Badge>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium">Tendances :</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Progression:</span>
                  <span className="text-green-600 font-medium">+0.8 pts</span>
                </div>
                <div className="flex justify-between">
                  <span>Matière forte:</span>
                  <span className="font-medium">Mathématiques</span>
                </div>
                <div className="flex justify-between">
                  <span>À surveiller:</span>
                  <span className="text-red-600 font-medium">1 élève</span>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Contact Parent */}
      {selectedStudent && (
        <Dialog open={!!selectedStudent} onOpenChange={() => setSelectedStudent(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Contacter le Parent - {selectedStudent.name || ''}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Parent/Tuteur :</label>
                  <p className="text-lg font-medium">{selectedStudent.parentName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Moyenne actuelle :</label>
                  <Badge className={getGradeColor(selectedStudent.average)}>
                    {selectedStudent.average}/20
                  </Badge>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  className="flex-1"
                  onClick={() => window.open(`tel:${selectedStudent.parentPhone}`)}
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Appeler
                </Button>
                <Button 
                  className="flex-1" 
                  variant="outline"
                  onClick={() => window.open(`mailto:${selectedStudent.parentEmail}?subject=Notes de ${selectedStudent.name || ''}`)}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Email
                </Button>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Message rapide :</label>
                <div className="grid grid-cols-1 gap-2">
                  <Button size="sm" variant="outline" className="justify-start">
                    📊 Bons résultats de {selectedStudent.name || ''}
                  </Button>
                  <Button size="sm" variant="outline" className="justify-start">
                    📉 Difficultés en {subjects.find(s => s.id === selectedSubject)?.name}
                  </Button>
                  <Button size="sm" variant="outline" className="justify-start">
                    📚 RDV pour discuter des notes
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default FunctionalGrades;