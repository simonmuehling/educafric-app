import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  FileText, Users, Download, Eye, Plus, Edit, Save, 
  Calculator, Award, TrendingUp, CheckSquare, Calendar,
  Mail, Phone, BookOpen, User, Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ModernCard } from '@/components/ui/ModernCard';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

const ReportCardManagement = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [selectedClass, setSelectedClass] = useState('6eme-a');
  const [selectedPeriod, setSelectedPeriod] = useState('trimestre1');
  const [students, setStudents] = useState<any[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [currentBulletin, setCurrentBulletin] = useState<any>(null);
  const [grades, setGrades] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(false);

  const text = {
    fr: {
      title: 'Gestion des Bulletins',
      subtitle: 'Création et suivi des bulletins scolaires par classe',
      selectClass: 'Sélectionner une classe',
      selectPeriod: 'Sélectionner une période',
      createBulletin: 'Créer un bulletin',
      viewBulletin: 'Voir le bulletin',
      downloadPdf: 'Télécharger PDF',
      student: 'Élève',
      studentAverage: 'Moyenne',
      rank: 'Rang',
      status: 'Statut',
      complete: 'Terminé',
      inProgress: 'En cours',
      pending: 'En attente',
      autoImport: 'Import automatique activé',
      studentsImported: 'Élèves importés automatiquement',
      generateAll: 'Générer tous les bulletins',
      exportClass: 'Exporter la classe',
      classStats: 'Statistiques de classe',
      generalAverage: 'Moyenne générale',
      successRate: 'Taux de réussite',
      excellent: 'Excellent',
      good: 'Bien',
      passable: 'Passable',
      needsImprovement: 'À améliorer'
    },
    en: {
      title: 'Report Card Management',
      subtitle: 'Creation and tracking of report cards by class',
      selectClass: 'Select a class',
      selectPeriod: 'Select a period',
      createBulletin: 'Create report card',
      viewBulletin: 'View report card',
      downloadPdf: 'Download PDF',
      student: 'Student',
      studentAverage: 'Average',
      rank: 'Rank',
      status: 'Status',
      complete: 'Complete',
      inProgress: 'In Progress',
      pending: 'Pending',
      autoImport: 'Auto import enabled',
      studentsImported: 'Students imported automatically',
      generateAll: 'Generate all report cards',
      exportClass: 'Export class',
      classStats: 'Class statistics',
      generalAverage: 'General average',
      successRate: 'Success rate',
      excellent: 'Excellent',
      good: 'Good',
      passable: 'Average',
      needsImprovement: 'Needs improvement'
    }
  };

  const t = text[language as keyof typeof text];

  const classes = [
    { id: '6eme-a', name: '6ème A', students: 32 },
    { id: '6eme-b', name: '6ème B', students: 28 },
    { id: '5eme-a', name: '5ème A', students: 30 },
    { id: '5eme-b', name: '5ème B', students: 25 },
    { id: '4eme-a', name: '4ème A', students: 27 },
    { id: '3eme-a', name: '3ème A', students: 24 }
  ];

  const periods = [
    { id: 'trimestre1', name: '1er Trimestre', dates: 'Oct - Déc 2024' },
    { id: 'trimestre2', name: '2ème Trimestre', dates: 'Jan - Mar 2025' },
    { id: 'trimestre3', name: '3ème Trimestre', dates: 'Avr - Juil 2025' }
  ];

  // Données d'étudiants organisées par classe (automatiquement importées)
  const studentsData = {
    '6eme-a': [
      { 
        id: 1, 
        name: 'ABANDA Marie Louise', 
        number: '001',
        dateOfBirth: '2011-03-15',
        parentName: 'Mme Rose Abanda',
        parentPhone: '+237 677 123 456',
        grades: { mathematiques: 18, francais: 16, anglais: 17, sciences: 19, histoire: 15 },
        average: 17.0,
        rank: 1,
        status: 'complete'
      },
      { 
        id: 2, 
        name: 'BELLO Jean Claude', 
        number: '002',
        dateOfBirth: '2011-07-22',
        parentName: 'M. Paul Bello',
        parentPhone: '+237 655 987 654',
        grades: { mathematiques: 14, francais: 15, anglais: 13, sciences: 16, histoire: 14 },
        average: 14.4,
        rank: 3,
        status: 'inProgress'
      },
      { 
        id: 3, 
        name: 'DJOMO Sarah Patricia', 
        number: '003',
        dateOfBirth: '2011-11-08',
        parentName: 'Dr. Marie Djomo',
        parentPhone: '+237 698 456 789',
        grades: { mathematiques: 12, francais: 13, anglais: 11, sciences: 14, histoire: 12 },
        average: 12.4,
        rank: 5,
        status: 'pending'
      },
      { 
        id: 4, 
        name: 'FOKO Paul Andre', 
        number: '004',
        dateOfBirth: '2011-05-14',
        parentName: 'Mme Christine Foko',
        parentPhone: '+237 677 321 987',
        grades: { mathematiques: 9, francais: 10, anglais: 8, sciences: 11, histoire: 9 },
        average: 9.4,
        rank: 8,
        status: 'pending'
      },
      { 
        id: 5, 
        name: 'KAMGA Alice Josephine', 
        number: '005',
        dateOfBirth: '2011-01-30',
        parentName: 'M. Jean Kamga',
        parentPhone: '+237 655 654 321',
        grades: { mathematiques: 16, francais: 17, anglais: 15, sciences: 18, histoire: 16 },
        average: 16.4,
        rank: 2,
        status: 'complete'
      },
      { 
        id: 6, 
        name: 'MVONDO Eric Junior', 
        number: '006',
        dateOfBirth: '2011-09-12',
        parentName: 'Mme Gladys Mvondo',
        parentPhone: '+237 699 111 222',
        grades: { mathematiques: 13, francais: 14, anglais: 12, sciences: 15, histoire: 13 },
        average: 13.4,
        rank: 4,
        status: 'inProgress'
      },
      { 
        id: 7, 
        name: 'NKOMO Grace Merveille', 
        number: '007',
        dateOfBirth: '2011-04-25',
        parentName: 'M. Pierre Nkomo',
        parentPhone: '+237 677 888 999',
        grades: { mathematiques: 11, francais: 12, anglais: 10, sciences: 13, histoire: 11 },
        average: 11.4,
        rank: 6,
        status: 'pending'
      },
      { 
        id: 8, 
        name: 'OWONA David Michael', 
        number: '008',
        dateOfBirth: '2011-12-03',
        parentName: 'Dr. Robert Owona',
        parentPhone: '+237 655 777 444',
        grades: { mathematiques: 10, francais: 11, anglais: 9, sciences: 12, histoire: 10 },
        average: 10.4,
        rank: 7,
        status: 'inProgress'
      }
    ],
    '6eme-b': [
      { 
        id: 9, 
        name: 'ATEBA Solange Carole', 
        number: '009',
        dateOfBirth: '2011-06-18',
        parentName: 'Mme Catherine Ateba',
        parentPhone: '+237 677 555 333',
        grades: { mathematiques: 15, francais: 16, anglais: 14, sciences: 17, histoire: 15 },
        average: 15.4,
        rank: 1,
        status: 'complete'
      },
      { 
        id: 10, 
        name: 'BIKORO Samuel', 
        number: '010',
        dateOfBirth: '2011-08-11',
        parentName: 'M. Joseph Bikoro',
        parentPhone: '+237 699 444 666',
        grades: { mathematiques: 13, francais: 12, anglais: 13, sciences: 14, histoire: 12 },
        average: 12.8,
        rank: 3,
        status: 'inProgress'
      }
    ]
  };

  // Import automatique des étudiants basé sur la classe sélectionnée
  useEffect(() => {
    const importStudentsForClass = async () => {
      setIsLoading(true);
      try {
        // Simulation de l'import automatique depuis la base de données
        const classStudents = studentsData[selectedClass as keyof typeof studentsData] || [];
        
        // Tri par numéro pour ordre cohérent
        const sortedStudents = classStudents.sort((a, b) => a?.number?.localeCompare(b.number));
        
        setStudents(sortedStudents);
        
        toast({
          title: language === 'fr' ? 'Import automatique réussi' : 'Auto import successful',
          description: `${(Array.isArray(sortedStudents) ? sortedStudents.length : 0)} ${language === 'fr' ? 'élèves importés automatiquement' : 'students imported automatically'}`
        });
        
      } catch (error) {
        toast({
          title: language === 'fr' ? 'Erreur d\'import' : 'Import error',
          description: language === 'fr' ? 'Impossible d\'importer les élèves' : 'Failed to import students',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };

    importStudentsForClass();
  }, [selectedClass, language, toast]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'complete':
        return 'bg-green-100 text-green-800';
      case 'inProgress':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'complete':
        return t.complete;
      case 'inProgress':
        return t.inProgress;
      case 'pending':
        return t.pending;
      default:
        return status;
    }
  };

  const getGradeLevel = (average: number) => {
    if (average >= 16) return { level: t.excellent, color: 'text-green-600' };
    if (average >= 12) return { level: t.good, color: 'text-blue-600' };
    if (average >= 10) return { level: t.passable, color: 'text-yellow-600' };
    return { level: t.needsImprovement, color: 'text-red-600' };
  };

  const createBulletin = (student: any) => {
    setCurrentBulletin(student);
    setIsCreateDialogOpen(true);
  };

  const generateAllBulletins = async () => {
    try {
      setIsLoading(true);
      
      // Simulation API call
      await apiRequest('POST', '/api/bulletins/generate-class', {
        classId: selectedClass,
        period: selectedPeriod,
        students: (Array.isArray(students) ? students : []).map(s => s.id)
      });
      
      toast({
        title: language === 'fr' ? 'Bulletins générés' : 'Report cards generated',
        description: `${(Array.isArray(students) ? (Array.isArray(students) ? students.length : 0) : 0)} ${language === 'fr' ? 'bulletins créés avec succès' : 'report cards created successfully'}`
      });
      
      // Mettre à jour le statut des étudiants
      setStudents(prev => (Array.isArray(prev) ? prev : []).map(s => ({ ...s, status: 'complete' })));
      
    } catch (error) {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' ? 'Impossible de générer les bulletins' : 'Failed to generate report cards',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const exportClassReport = async () => {
    try {
      const classInfo = classes.find(c => c.id === selectedClass);
      const periodInfo = periods.find(p => p.id === selectedPeriod);
      
      await apiRequest('GET', `/api/bulletins/export-class?class=${selectedClass}&period=${selectedPeriod}`);
      
      toast({
        title: language === 'fr' ? 'Export réussi' : 'Export successful',
        description: `${language === 'fr' ? 'Rapport de classe exporté:' : 'Class report exported:'} ${classInfo?.name} - ${periodInfo?.name}`
      });
      
    } catch (error) {
      toast({
        title: language === 'fr' ? 'Erreur d\'export' : 'Export error',
        description: language === 'fr' ? 'Impossible d\'exporter le rapport' : 'Failed to export report',
        variant: 'destructive'
      });
    }
  };

  const downloadBulletinPdf = async (student: any) => {
    try {
      await apiRequest('GET', `/api/bulletins/${student.id}/pdf?period=${selectedPeriod}`);
      
      toast({
        title: language === 'fr' ? 'PDF téléchargé' : 'PDF downloaded',
        description: `${language === 'fr' ? 'Bulletin de' : 'Report card for'} ${student.name || ''}`
      });
      
    } catch (error) {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' ? 'Impossible de télécharger le PDF' : 'Failed to download PDF',
        variant: 'destructive'
      });
    }
  };

  // Statistiques de classe
  const classAverage = (Array.isArray(students) ? (Array.isArray(students) ? students.length : 0) : 0) > 0 ? (Array.isArray(students) ? students : []).reduce((sum, s) => sum + s.average, 0) / (Array.isArray(students) ? (Array.isArray(students) ? students.length : 0) : 0) : 0;
  const successRate = (Array.isArray(students) ? students : []).filter(s => s.average >= 10).length / (Array.isArray(students) ? (Array.isArray(students) ? students.length : 0) : 0) * 100;
  const completedBulletins = (Array.isArray(students) ? students : []).filter(s => s.status === 'complete').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{t.title || ''}</h2>
          <p className="text-gray-600">{t.subtitle}</p>
          <div className="flex items-center gap-2 mt-2">
            <Badge className="bg-blue-100 text-blue-800">
              <CheckSquare className="w-3 h-3 mr-1" />
              {t.autoImport}
            </Badge>
            <Badge className="bg-green-100 text-green-800">
              {(Array.isArray(students) ? (Array.isArray(students) ? students.length : 0) : 0)} {t.studentsImported}
            </Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportClassReport} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            {t.exportClass}
          </Button>
          <Button 
            onClick={generateAllBulletins} 
            className="bg-blue-600 hover:bg-blue-700"
            disabled={isLoading}
          >
            <Plus className="w-4 h-4 mr-2" />
            {t.generateAll}
          </Button>
        </div>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">{t.selectClass}</label>
          <select 
            value={selectedClass}
            onChange={(e) => setSelectedClass(e?.target?.value)}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {(Array.isArray(classes) ? classes : []).map(cls => (
              <option key={cls.id} value={cls.id}>
                {cls.name || ''} ({cls.students} élèves)
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">{t.selectPeriod}</label>
          <select 
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e?.target?.value)}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {(Array.isArray(periods) ? periods : []).map(period => (
              <option key={period.id} value={period.id}>
                {period.name || ''} ({period.dates})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Statistiques de classe */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <ModernCard className="p-4 text-center activity-card-blue">
          <div className="text-2xl font-bold text-gray-800">{(Array.isArray(students) ? (Array.isArray(students) ? students.length : 0) : 0)}</div>
          <div className="text-sm text-gray-600">Élèves</div>
        </ModernCard>
        <ModernCard className="p-4 text-center activity-card-green">
          <div className="text-2xl font-bold text-gray-800">{classAverage.toFixed(1)}/20</div>
          <div className="text-sm text-gray-600">{t.generalAverage}</div>
        </ModernCard>
        <ModernCard className="p-4 text-center activity-card-purple">
          <div className="text-2xl font-bold text-gray-800">{successRate.toFixed(0)}%</div>
          <div className="text-sm text-gray-600">{t.successRate}</div>
        </ModernCard>
        <ModernCard className="p-4 text-center activity-card-orange">
          <div className="text-2xl font-bold text-gray-800">{completedBulletins}/{(Array.isArray(students) ? (Array.isArray(students) ? students.length : 0) : 0)}</div>
          <div className="text-sm text-gray-600">Bulletins terminés</div>
        </ModernCard>
      </div>

      {/* Liste des étudiants avec bulletins */}
      <ModernCard className="p-4">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Import des élèves en cours...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {(Array.isArray(students) ? students : []).map(student => {
              const gradeLevel = getGradeLevel(student.average);
              return (
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
                            <Badge className={getStatusColor(student.status)}>
                              {getStatusText(student.status)}
                            </Badge>
                            <Badge className={`${gradeLevel.color} bg-white border`}>
                              {student?.average?.toFixed(1)}/20
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        onClick={() => createBulletin(student)}
                        className="flex-1"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        {t.createBulletin}
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => downloadBulletinPdf(student)}
                        className="flex-1"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        PDF
                      </Button>
                    </div>
                  </div>

                  {/* Version Desktop */}
                  <div className="hidden md:flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
                        {student.number}
                      </div>
                      <div>
                        <p className="font-medium text-lg">{student.name || ''}</p>
                        <p className="text-sm text-gray-600">Parent: {student.parentName}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(student.status)}>
                          {getStatusText(student.status)}
                        </Badge>
                        <Badge className={`${gradeLevel.color} bg-white border`}>
                          Moyenne: {student?.average?.toFixed(1)}/20
                        </Badge>
                        <Badge variant="outline">
                          Rang: {student.rank}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button 
                        size="sm" 
                        onClick={() => createBulletin(student)}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        {t.createBulletin}
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => downloadBulletinPdf(student)}
                      >
                        <Download className="w-4 h-4 mr-1" />
                        {t.downloadPdf}
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => window.open(`tel:${student.parentPhone}`)}
                        className="text-blue-600"
                      >
                        <Phone className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ModernCard>

      {/* Dialog Création Bulletin */}
      {currentBulletin && (
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="max-w-4xl bg-white">
            <DialogHeader>
              <DialogTitle>Bulletin de {currentBulletin.name || ''}</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              {/* Informations élève */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Nom complet</p>
                  <p className="font-semibold">{currentBulletin.name || ''}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Numéro</p>
                  <p className="font-semibold">{currentBulletin.number}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Date de naissance</p>
                  <p className="font-semibold">{currentBulletin.dateOfBirth}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Parent/Tuteur</p>
                  <p className="font-semibold">{currentBulletin.parentName}</p>
                </div>
              </div>

              {/* Notes par matière */}
              <div>
                <h4 className="font-medium mb-3">Notes par matière</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(currentBulletin.grades || {}).map(([subject, grade]) => (
                    <div key={subject} className="flex justify-between items-center p-3 border rounded-lg">
                      <span className="capitalize font-medium">{subject}</span>
                      <Badge className={getGradeLevel(Number(grade)).color + ' bg-white border'}>
                        {grade}/20
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              {/* Résumé */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-800">{currentBulletin?.average?.toFixed(1)}/20</div>
                  <div className="text-sm text-blue-600">Moyenne générale</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-800">{currentBulletin.rank}</div>
                  <div className="text-sm text-green-600">Rang de classe</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-lg font-bold text-purple-800">{getGradeLevel(currentBulletin.average).level}</div>
                  <div className="text-sm text-purple-600">Appréciation</div>
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Fermer
                </Button>
                <Button onClick={() => downloadBulletinPdf(currentBulletin)}>
                  <Download className="w-4 h-4 mr-2" />
                  Télécharger PDF
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ReportCardManagement;