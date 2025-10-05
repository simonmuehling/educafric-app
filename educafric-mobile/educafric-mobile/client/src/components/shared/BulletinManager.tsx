import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, Eye, Plus, Calendar, Award, BarChart3, User } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

const BulletinManager = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTerm, setSelectedTerm] = useState('T1-2025');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [bulletinAction, setBulletinAction] = useState<{type: string, student?: any, bulletin?: any}>({type: ''});

  const text = {
    fr: {
      title: 'Gestion des Bulletins',
      createBulletin: 'Créer un Bulletin',
      viewBulletin: 'Voir le Bulletin',
      downloadBulletin: 'Télécharger PDF',
      termSelection: 'Sélection du Trimestre',
      student: 'Élève',
      grade: 'Note',
      average: 'Moyenne',
      rank: 'Rang',
      comments: 'Commentaires',
      subjects: 'Matières',
      behavior: 'Comportement',
      attendance: 'Présence',
      excellent: 'Excellent',
      good: 'Bien',
      satisfactory: 'Satisfaisant',
      needsImprovement: 'À améliorer',
      published: 'Publié',
      draft: 'Brouillon',
      semester: 'Semestre',
      academicYear: 'Année Scolaire'
    },
    en: {
      title: 'Report Card Management',
      createBulletin: 'Create Report Card',
      viewBulletin: 'View Report Card',
      downloadBulletin: 'Download PDF',
      termSelection: 'Term Selection',
      student: 'Student',
      grade: 'Grade',
      average: 'Average',
      rank: 'Rank',
      comments: 'Comments',
      subjects: 'Subjects',
      behavior: 'Behavior',
      attendance: 'Attendance',
      excellent: 'Excellent',
      good: 'Good',
      satisfactory: 'Satisfactory',
      needsImprovement: 'Needs Improvement',
      published: 'Published',
      draft: 'Draft',
      semester: 'Semester',
      academicYear: 'Academic Year'
    }
  };

  const t = text[language as keyof typeof text];

  const terms = [
    { value: 'T1-2025', label: language === 'fr' ? 'Trimestre 1 - 2025' : 'Term 1 - 2025' },
    { value: 'T2-2025', label: language === 'fr' ? 'Trimestre 2 - 2025' : 'Term 2 - 2025' },
    { value: 'T3-2025', label: language === 'fr' ? 'Trimestre 3 - 2025' : 'Term 3 - 2025' }
  ];

  const bulletins = [
    {
      id: 1,
      student: 'Marie Kouam',
      class: '6ème A',
      average: 16.5,
      rank: 2,
      status: 'published',
      subjects: [
        { name: 'Mathématiques', grade: 18, coefficient: 4 },
        { name: 'Français', grade: 16, coefficient: 4 },
        { name: 'Anglais', grade: 15, coefficient: 3 },
        { name: 'Sciences', grade: 17, coefficient: 3 },
        { name: 'Histoire', grade: 14, coefficient: 2 },
        { name: 'Géographie', grade: 16, coefficient: 2 }
      ],
      behavior: 'excellent',
      attendance: 95,
      comments: language === 'fr' ? 'Excellente élève, travail remarquable en mathématiques.' : 'Excellent student, remarkable work in mathematics.'
    },
    {
      id: 2,
      student: 'Paul Ngono',
      class: '6ème A',
      average: 14.2,
      rank: 8,
      status: 'published',
      subjects: [
        { name: 'Mathématiques', grade: 13, coefficient: 4 },
        { name: 'Français', grade: 15, coefficient: 4 },
        { name: 'Anglais', grade: 16, coefficient: 3 },
        { name: 'Sciences', grade: 14, coefficient: 3 },
        { name: 'Histoire', grade: 13, coefficient: 2 },
        { name: 'Géographie', grade: 14, coefficient: 2 }
      ],
      behavior: 'good',
      attendance: 88,
      comments: language === 'fr' ? 'Bon travail général, peut mieux faire en mathématiques.' : 'Good overall work, can improve in mathematics.'
    },
    {
      id: 3,
      student: 'Sophie Mbia',
      class: '6ème B',
      average: 17.8,
      rank: 1,
      status: 'draft',
      subjects: [
        { name: 'Mathématiques', grade: 19, coefficient: 4 },
        { name: 'Français', grade: 18, coefficient: 4 },
        { name: 'Anglais', grade: 17, coefficient: 3 },
        { name: 'Sciences', grade: 18, coefficient: 3 },
        { name: 'Histoire', grade: 17, coefficient: 2 },
        { name: 'Géographie', grade: 18, coefficient: 2 }
      ],
      behavior: 'excellent',
      attendance: 98,
      comments: language === 'fr' ? 'Élève exceptionnelle, première de sa classe.' : 'Exceptional student, top of her class.'
    }
  ];

  const getBehaviorColor = (behavior: string) => {
    switch (behavior) {
      case 'excellent': return 'bg-green-500';
      case 'good': return 'bg-blue-500';
      case 'satisfactory': return 'bg-yellow-500';
      default: return 'bg-orange-500';
    }
  };

  const getBehaviorText = (behavior: string) => {
    switch (behavior) {
      case 'excellent': return t.excellent;
      case 'good': return t.good;
      case 'satisfactory': return t.satisfactory;
      default: return t.needsImprovement;
    }
  };

  const handleCreateBulletin = () => {
    setBulletinAction({type: 'create'});
    setShowConfirmDialog(true);
  };

  // Mutation pour créer un bulletin
  const createBulletinMutation = useMutation({
    mutationFn: async (bulletinData: any) => {
      return await apiRequest('/api/bulletins/create', 'POST', bulletinData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bulletins'] });
      queryClient.invalidateQueries({ queryKey: ['/api/teacher/bulletins'] });
      toast({
        title: language === 'fr' ? 'Bulletin créé' : 'Report card created',
        description: language === 'fr' ? 'Le bulletin a été créé et publié avec succès' : 'Report card has been created and published successfully'
      });
    },
    onError: () => {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' ? 'Impossible de créer le bulletin' : 'Failed to create report card',
        variant: 'destructive'
      });
    }
  });

  // Mutation pour télécharger un bulletin
  const downloadBulletinMutation = useMutation({
    mutationFn: async (downloadData: any) => {
      return await apiRequest('/api/bulletins/download', 'POST', downloadData);
    },
    onSuccess: async (response) => {
      // Créer et télécharger le PDF
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bulletin_${bulletinAction.student}_${selectedTerm}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: language === 'fr' ? 'Bulletin téléchargé' : 'Report card downloaded',
        description: language === 'fr' ? 'Le fichier PDF a été téléchargé' : 'PDF file has been downloaded'
      });
    },
    onError: () => {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' ? 'Impossible de télécharger le bulletin' : 'Failed to download report card',
        variant: 'destructive'
      });
    }
  });

  const confirmBulletinAction = () => {
    if (bulletinAction.type === 'create') {
      createBulletinMutation.mutate({
        term: selectedTerm,
        action: 'create_bulletin'
      });
    } else if (bulletinAction.type === 'download' && bulletinAction.student) {
      downloadBulletinMutation.mutate({
        student: bulletinAction.student,
        term: selectedTerm,
        action: 'download_pdf'
      });
    }
    setShowConfirmDialog(false);
    setBulletinAction({type: ''});
  };

  const handleViewBulletin = (bulletinId: number) => {
    const bulletin = bulletins.find(b => b.id === bulletinId);
    if (bulletin) {
      console.log('📄 Consultation bulletin:', bulletin.student);
      // Navigation vers détail bulletin
      setSelectedTerm('T1-2025');
    }
  };

  const handleDownloadBulletin = (studentName: string) => {
    setBulletinAction({type: 'download', student: studentName});
    setShowConfirmDialog(true);
  };

  const handleDownloadBulletinConfirmed = (studentName: string) => {
    console.log('⬇️ Téléchargement bulletin PDF:', studentName);
    setTimeout(() => {
      const blob = new Blob([`Bulletin de ${studentName} - ${selectedTerm}`], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bulletin-${studentName.replace(' ', '-')}-${selectedTerm}.pdf`;
      document?.body?.appendChild(a);
      a.click();
      document?.body?.removeChild(a);
      URL.revokeObjectURL(url);
    }, 1000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <FileText className="w-6 h-6 text-blue-500" />
              {t.title || ''}
            </h2>
            <Button onClick={handleCreateBulletin} className="bg-green-600 hover:bg-green-700">
              <Plus className="w-4 h-4 mr-2" />
              {t.createBulletin}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Term Selector */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <h3 className="font-semibold">{t.termSelection}:</h3>
            <div className="flex gap-2">
              {(Array.isArray(terms) ? terms : []).map((term) => (
                <Button
                  key={term.value}
                  variant={selectedTerm === term.value ? "default" : "outline"}
                  onClick={() => setSelectedTerm(term.value)}
                  className={selectedTerm === term.value ? "bg-blue-600 hover:bg-blue-700" : ""}
                >
                  {term.label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulletins List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {(Array.isArray(bulletins) ? bulletins : []).map((bulletin) => (
          <Card key={bulletin.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-500" />
                    {bulletin.student}
                  </h3>
                  <p className="text-gray-600">{bulletin.class}</p>
                </div>
                <Badge variant={bulletin.status === 'published' ? "default" : "secondary"}>
                  {bulletin.status === 'published' ? t.published : t.draft}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Academic Summary */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <Award className="w-6 h-6 text-blue-600 mx-auto mb-1" />
                    <p className="text-sm text-gray-600">{t.average}</p>
                    <p className="text-xl font-bold text-blue-600">{bulletin.average}/20</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <BarChart3 className="w-6 h-6 text-green-600 mx-auto mb-1" />
                    <p className="text-sm text-gray-600">{t.rank}</p>
                    <p className="text-xl font-bold text-green-600">#{bulletin.rank}</p>
                  </div>
                </div>

                {/* Subjects Grid */}
                <div>
                  <h4 className="font-semibold mb-2">{t.subjects}:</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {bulletin?.subjects?.slice(0, 4).map((subject, index) => (
                      <div key={index} className="flex justify-between">
                        <span className="truncate">{subject.name || ''}:</span>
                        <span className="font-semibold">{subject.grade}/20</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Behavior and Attendance */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">{t.behavior}:</p>
                    <Badge className={`${getBehaviorColor(bulletin.behavior)} text-white`}>
                      {getBehaviorText(bulletin.behavior)}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">{t.attendance}:</p>
                    <p className="font-semibold">{bulletin.attendance}%</p>
                  </div>
                </div>

                {/* Comments */}
                <div>
                  <p className="text-sm text-gray-600 mb-1">{t.comments}:</p>
                  <p className="text-sm bg-gray-50 p-2 rounded italic">
                    {bulletin.comments}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleViewBulletin(bulletin.id)}
                    className="flex-1"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    {t.viewBulletin}
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={() => handleDownloadBulletin(bulletin.student)}
                    className="flex-1 bg-orange-600 hover:bg-orange-700"
                  >
                    <Download className="w-4 h-4 mr-1" />
                    PDF
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Statistics Summary */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-500" />
            {language === 'fr' ? 'Statistiques de Classe' : 'Class Statistics'}
          </h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600">
                {language === 'fr' ? 'Moyenne de Classe' : 'Class Average'}
              </p>
              <p className="text-2xl font-bold text-blue-600">15.5/20</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600">
                {language === 'fr' ? 'Taux de Réussite' : 'Success Rate'}
              </p>
              <p className="text-2xl font-bold text-green-600">85%</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-gray-600">
                {language === 'fr' ? 'Total Élèves' : 'Total Students'}
              </p>
              <p className="text-2xl font-bold text-purple-600">28</p>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <p className="text-sm text-gray-600">
                {language === 'fr' ? 'Présence Moyenne' : 'Average Attendance'}
              </p>
              <p className="text-2xl font-bold text-orange-600">92%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {language === 'fr' ? 'Confirmer l\'action' : 'Confirm Action'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {bulletinAction.type === 'create' && (
                language === 'fr' ? 
                'Êtes-vous sûr de vouloir créer un nouveau bulletin ? Cette action notifiera les parents et élèves concernés.' : 
                'Are you sure you want to create a new report card? This action will notify parents and students.'
              )}
              {bulletinAction.type === 'download' && (
                <>
                  {language === 'fr' ? 
                    'Êtes-vous sûr de vouloir télécharger ce bulletin en PDF ? Cette action sera enregistrée dans les logs.' : 
                    'Are you sure you want to download this report card as PDF? This action will be logged.'
                  }
                  <br /><br />
                  <strong>{language === 'fr' ? 'Élève:' : 'Student:'}</strong> {bulletinAction.student}
                  <br />
                  <strong>{language === 'fr' ? 'Période:' : 'Period:'}</strong> {selectedTerm}
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{language === 'fr' ? 'Annuler' : 'Cancel'}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmBulletinAction}>
              {bulletinAction.type === 'create' ? 
                (language === 'fr' ? 'Créer le bulletin' : 'Create Report Card') : 
                (language === 'fr' ? 'Télécharger' : 'Download')
              }
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default BulletinManager;