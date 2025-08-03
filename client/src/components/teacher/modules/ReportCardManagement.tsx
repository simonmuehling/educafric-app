import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ModernCard } from '@/components/ui/ModernCard';
import { useLanguage } from '@/contexts/LanguageContext';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { 
  FileText, 
  Plus, 
  Edit, 
  Save, 
  Send, 
  Eye, 
  Download, 
  X, 
  Users, 
  Calendar,
  BookOpen,
  Target,
  Award,
  Trash2
} from 'lucide-react';

interface BulletinGrade {
  subjectId: number;
  subjectName: string;
  grade: number | string;
  maxGrade: number;
  coefficient: number;
  comment: string;
}

interface BulletinData {
  studentId?: number;
  studentName?: string;
  className?: string;
  classId?: number;
  period: string;
  academicYear: string;
  grades: BulletinGrade[];
  generalComment: string;
  recommendations: string;
  conduct: string;
  attendanceRate: number;
  absences: number;
  lateArrivals: number;
}

const ReportCardManagement: React.FC = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // State management
  const [selectedClass, setSelectedClass] = useState<string>('1');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('trimestre1');
  const [academicYear] = useState<string>('2024-2025');
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [editingCard, setEditingCard] = useState<any>(null);

  // Form data for new bulletin
  const [bulletinData, setBulletinData] = useState<BulletinData>({
    period: 'trimestre1',
    academicYear: '2024-2025',
    grades: [],
    generalComment: '',
    recommendations: '',
    conduct: 'good',
    attendanceRate: 95,
    absences: 0,
    lateArrivals: 0
  });

  // Available subjects
  const subjects = [
    'Mathématiques',
    'Français',
    'Anglais',
    'Sciences',
    'Histoire-Géographie',
    'EPS',
    'Arts Plastiques',
    'Musique'
  ];

  // Translations
  const t = {
    reportCardManagement: language === 'fr' ? 'Gestion des Bulletins' : 'Report Card Management',
    createBulletin: language === 'fr' ? 'Créer un Bulletin' : 'Create Report Card',
    selectClass: language === 'fr' ? 'Sélectionner la classe' : 'Select Class',
    selectPeriod: language === 'fr' ? 'Sélectionner la période' : 'Select Period',
    studentName: language === 'fr' ? 'Nom de l\'élève' : 'Student Name',
    subjects: language === 'fr' ? 'Matières' : 'Subjects',
    grade: language === 'fr' ? 'Note' : 'Grade',
    comment: language === 'fr' ? 'Commentaire' : 'Comment',
    generalComment: language === 'fr' ? 'Commentaire général' : 'General Comment',
    recommendations: language === 'fr' ? 'Recommandations' : 'Recommendations',
    conduct: language === 'fr' ? 'Conduite' : 'Conduct',
    attendance: language === 'fr' ? 'Présence' : 'Attendance',
    save: language === 'fr' ? 'Sauvegarder' : 'Save',
    submit: language === 'fr' ? 'Soumettre' : 'Submit',
    publish: language === 'fr' ? 'Publier' : 'Publish',
    preview: language === 'fr' ? 'Aperçu' : 'Preview',
    cancel: language === 'fr' ? 'Annuler' : 'Cancel',
    draft: language === 'fr' ? 'Brouillon' : 'Draft',
    submitted: language === 'fr' ? 'Soumis' : 'Submitted',
    approved: language === 'fr' ? 'Approuvé' : 'Approved',
    published: language === 'fr' ? 'Publié' : 'Published',
    excellent: language === 'fr' ? 'Excellent' : 'Excellent',
    good: language === 'fr' ? 'Bien' : 'Good',
    average: language === 'fr' ? 'Moyen' : 'Average',
    needsImprovement: language === 'fr' ? 'À améliorer' : 'Needs Improvement',
    addGrade: language === 'fr' ? 'Ajouter une note' : 'Add Grade',
    coefficient: language === 'fr' ? 'Coefficient' : 'Coefficient',
    editBulletin: language === 'fr' ? 'Modifier le bulletin' : 'Edit Report Card'
  };

  // Fetch existing bulletins
  const { data: bulletins, isLoading } = useQuery({
    queryKey: ['/api/bulletins', selectedClass, selectedPeriod],
    queryFn: () => apiRequest('GET', `/api/bulletins?classId=${selectedClass}&term=${selectedPeriod}`)
  });

  // Add new grade row
  const addGradeRow = () => {
    setBulletinData(prev => ({
      ...prev,
      grades: [...prev.grades, {
        subjectId: Date.now(),
        subjectName: '',
        grade: '',
        maxGrade: 20,
        coefficient: 1,
        comment: ''
      }]
    }));
  };

  // Update grade data
  const updateGradeRow = (index: number, field: keyof BulletinGrade, value: any) => {
    setBulletinData(prev => ({
      ...prev,
      grades: (Array.isArray(prev.grades) ? prev.grades : []).map((grade, i) => 
        i === index ? { ...grade, [field]: value } : grade
      )
    }));
  };

  // Remove grade row
  const removeGradeRow = (index: number) => {
    setBulletinData(prev => ({
      ...prev,
      grades: (Array.isArray(prev.grades) ? prev.grades : []).filter((_, i) => i !== index)
    }));
  };

  // Calculate general average
  const calculateGeneralAverage = () => {
    if ((Array.isArray(bulletinData.grades) ? bulletinData.grades.length : 0) === 0) return 0;
    
    let totalPoints = 0;
    let totalCoefficients = 0;
    
    bulletinData?.grades?.forEach(grade => {
      const gradeValue = typeof grade.grade === 'string' ? parseFloat(grade.grade) : grade.grade;
      if (!isNaN(gradeValue)) {
        totalPoints += gradeValue * grade.coefficient;
        totalCoefficients += grade.coefficient;
      }
    });
    
    return totalCoefficients > 0 ? (totalPoints / totalCoefficients).toFixed(2) : '0.00';
  };

  // Calculate class rank (mock calculation)
  const calculateClassRank = (average: number) => {
    const mockRank = Math.floor(Math.random() * 30) + 1;
    return { rank: mockRank, total: 32 };
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    const statusColors = {
      draft: 'bg-gray-100 text-gray-800',
      submitted: 'bg-blue-100 text-blue-800',
      approved: 'bg-green-100 text-green-800',
      published: 'bg-purple-100 text-purple-800'
    };
    
    return (
      <Badge className={statusColors[status as keyof typeof statusColors] || statusColors.draft}>
        {t[status as keyof typeof t] || status}
      </Badge>
    );
  };

  // Reset form
  const resetForm = () => {
    setBulletinData({
      period: selectedPeriod,
      academicYear: '2024-2025',
      grades: [],
      generalComment: '',
      recommendations: '',
      conduct: 'good',
      attendanceRate: 95,
      absences: 0,
      lateArrivals: 0
    });
  };

  // Mutations for bulletin operations
  const saveBulletinMutation = useMutation({
    mutationFn: (data: { bulletinData: BulletinData; action: 'save' | 'submit' | 'publish' }) =>
      apiRequest('POST', '/api/bulletins/create', data),
    onSuccess: (_, variables) => {
      toast({
        title: variables.action === 'save' ? 'Brouillon sauvegardé' : 
               variables.action === 'submit' ? 'Bulletin soumis pour approbation' : 
               'Bulletin publié',
        description: 'Le bulletin a été traité avec succès'
      });
      queryClient.invalidateQueries({ queryKey: ['/api/bulletins'] });
      resetForm();
    },
    onError: () => {
      toast({
        title: 'Erreur',
        description: 'Impossible de sauvegarder le bulletin',
        variant: 'destructive'
      });
    }
  });

  // Handle form submission
  const handleSaveBulletin = (action: 'save' | 'submit' | 'publish') => {
    if ((Array.isArray(bulletinData.grades) ? bulletinData.grades.length : 0) === 0) {
      toast({
        title: 'Erreur',
        description: 'Veuillez ajouter au moins une note',
        variant: 'destructive'
      });
      return;
    }

    saveBulletinMutation.mutate({ bulletinData, action });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <FileText className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{t.reportCardManagement}</h2>
            <p className="text-gray-600">Créer et gérer les bulletins scolaires</p>
          </div>
        </div>
        <Button onClick={() => setShowPreview(true)} className="bg-blue-600 hover:bg-blue-700">
          <Eye className="w-4 h-4 mr-2" />
          {t.preview}
        </Button>
      </div>

      {/* Class and Period Selection */}
      <ModernCard>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <Label>{t.selectClass}</Label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">6ème A</SelectItem>
                  <SelectItem value="2">6ème B</SelectItem>
                  <SelectItem value="3">5ème A</SelectItem>
                  <SelectItem value="4">5ème B</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{t.selectPeriod}</Label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="trimestre1">Trimestre 1</SelectItem>
                  <SelectItem value="trimestre2">Trimestre 2</SelectItem>
                  <SelectItem value="trimestre3">Trimestre 3</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Année Scolaire</Label>
              <Input value={academicYear} disabled />
            </div>
          </div>
        </div>
      </ModernCard>

      {/* Bulletin Creation Form */}
      <ModernCard>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t.createBulletin}</h3>
          
          {/* Student Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <Label>{t.studentName} *</Label>
              <Input
                value={bulletinData.studentName || ''}
                onChange={(e) => setBulletinData(prev => ({ ...prev, studentName: e?.target?.value }))}
                placeholder="Nom complet de l'élève"
              />
            </div>
            <div>
              <Label>Classe</Label>
              <Input
                value={bulletinData.className || '6ème A'}
                onChange={(e) => setBulletinData(prev => ({ ...prev, className: e?.target?.value }))}
                placeholder="Classe de l'élève"
              />
            </div>
          </div>

          {/* Grades Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium">{t.subjects}</h4>
              <Button onClick={addGradeRow} size="sm" variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                {t.addGrade}
              </Button>
            </div>

            <div className="space-y-3">
              {(Array.isArray(bulletinData.grades) ? bulletinData.grades : []).map((grade, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-6 gap-3 p-3 border rounded-lg">
                  <div>
                    <Label className="text-xs">Matière</Label>
                    <Select 
                      value={grade.subjectName} 
                      onValueChange={(value) => updateGradeRow(index, 'subjectName', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choisir..." />
                      </SelectTrigger>
                      <SelectContent>
                        {(Array.isArray(subjects) ? subjects : []).map(subject => (
                          <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">{t.grade}</Label>
                    <Input
                      type="number"
                      min="0"
                      max="20"
                      value={grade.grade}
                      onChange={(e) => updateGradeRow(index, 'grade', e?.target?.value)}
                      placeholder="0-20"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">{t.coefficient}</Label>
                    <Input
                      type="number"
                      min="1"
                      max="10"
                      value={grade.coefficient}
                      onChange={(e) => updateGradeRow(index, 'coefficient', parseInt(e?.target?.value))}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label className="text-xs">{t.comment}</Label>
                    <Input
                      value={grade.comment}
                      onChange={(e) => updateGradeRow(index, 'comment', e?.target?.value)}
                      placeholder="Appréciation..."
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      onClick={() => removeGradeRow(index)}
                      size="sm"
                      variant="destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {(Array.isArray(bulletinData.grades) ? bulletinData.grades.length : 0) > 0 && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Moyenne générale calculée: {calculateGeneralAverage()}/20</strong>
                </p>
              </div>
            )}
          </div>

          {/* Comments and Assessment */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <Label>{t.generalComment}</Label>
              <Textarea
                value={bulletinData.generalComment}
                onChange={(e) => setBulletinData(prev => ({ ...prev, generalComment: e?.target?.value }))}
                rows={4}
                placeholder="Appréciation générale sur l'élève..."
              />
            </div>
            <div>
              <Label>{t.recommendations}</Label>
              <Textarea
                value={bulletinData.recommendations}
                onChange={(e) => setBulletinData(prev => ({ ...prev, recommendations: e?.target?.value }))}
                rows={4}
                placeholder="Conseils et recommandations..."
              />
            </div>
          </div>

          {/* Conduct and Attendance */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <Label>{t.conduct}</Label>
              <Select
                value={bulletinData.conduct}
                onValueChange={(value) => setBulletinData(prev => ({ ...prev, conduct: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="excellent">{t.excellent}</SelectItem>
                  <SelectItem value="good">{t.good}</SelectItem>
                  <SelectItem value="average">{t.average}</SelectItem>
                  <SelectItem value="needsImprovement">{t.needsImprovement}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Taux de présence (%)</Label>
              <Input
                type="number"
                min="0"
                max="100"
                value={bulletinData.attendanceRate}
                onChange={(e) => setBulletinData(prev => ({ ...prev, attendanceRate: parseFloat(e?.target?.value) }))}
              />
            </div>
            <div>
              <Label>Nombre d'absences</Label>
              <Input
                type="number"
                min="0"
                value={bulletinData.absences}
                onChange={(e) => setBulletinData(prev => ({ ...prev, absences: parseInt(e?.target?.value) }))}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <Button onClick={resetForm} variant="outline">
              {t.cancel}
            </Button>
            <Button 
              onClick={() => handleSaveBulletin('save')} 
              variant="outline"
              disabled={saveBulletinMutation.isPending}
            >
              <Save className="w-4 h-4 mr-2" />
              {t.save}
            </Button>
            <Button 
              onClick={() => handleSaveBulletin('submit')} 
              className="bg-blue-600 hover:bg-blue-700"
              disabled={saveBulletinMutation.isPending}
            >
              <Send className="w-4 h-4 mr-2" />
              {t.submit}
            </Button>
          </div>
        </div>
      </ModernCard>

      {/* Existing Bulletins List */}
      {Array.isArray(bulletins) && (Array.isArray(bulletins) ? bulletins.length : 0) > 0 && (
        <ModernCard>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Bulletins Existants - {selectedPeriod}
            </h3>
            
            <div className="space-y-3">
              {(Array.isArray(bulletins) ? bulletins : []).map((bulletin: any) => (
                <div key={bulletin.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="font-medium text-gray-900">{bulletin.studentName}</p>
                      <p className="text-sm text-gray-600">
                        Moyenne: {bulletin.generalAverage}/20 | Rang: {bulletin.classRank}
                      </p>
                    </div>
                    {getStatusBadge(bulletin.status)}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setEditingCard(bulletin)}>
                      <Edit className="w-4 h-4 mr-1" />
                      Modifier
                    </Button>
                    <Button size="sm" variant="outline">
                      <Download className="w-4 h-4 mr-1" />
                      PDF
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ModernCard>
      )}

      {/* Bulletin Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Aperçu du Bulletin</h3>
              <Button variant="ghost" onClick={() => setShowPreview(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="space-y-6 bg-white border rounded-lg p-8">
              {/* Header */}
              <div className="text-center border-b pb-4">
                <h2 className="text-2xl font-bold">BULLETIN SCOLAIRE</h2>
                <p className="text-gray-600 mt-1">Année Scolaire {academicYear}</p>
              </div>

              {/* Student Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p><span className="font-semibold">Élève:</span> {bulletinData.studentName || 'Nom de l\'élève'}</p>
                  <p><span className="font-semibold">Classe:</span> {bulletinData.className || 'Classe'}</p>
                </div>
                <div>
                  <p><span className="font-semibold">Période:</span> {bulletinData.period}</p>
                  <p><span className="font-semibold">Rang:</span> {calculateClassRank(parseFloat(calculateGeneralAverage().toString())).rank}/{calculateClassRank(parseFloat(calculateGeneralAverage().toString())).total}</p>
                </div>
                <div>
                  <p><span className="font-semibold">Moyenne générale:</span> {calculateGeneralAverage()}/20</p>
                  <p><span className="font-semibold">Conduite:</span> {t[bulletinData.conduct as keyof typeof t] || bulletinData.conduct}</p>
                </div>
              </div>

              {/* Grades Table */}
              {(Array.isArray(bulletinData.grades) ? bulletinData.grades.length : 0) > 0 && (
                <div>
                  <h4 className="font-semibold mb-3">Notes par matière</h4>
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-300 p-2 text-left">Matière</th>
                        <th className="border border-gray-300 p-2 text-center">Note</th>
                        <th className="border border-gray-300 p-2 text-center">Coeff.</th>
                        <th className="border border-gray-300 p-2 text-left">Appréciation</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(Array.isArray(bulletinData.grades) ? bulletinData.grades : []).map((grade: BulletinGrade, index: number) => (
                        <tr key={index}>
                          <td className="border border-gray-300 p-2">{grade.subjectName}</td>
                          <td className="border border-gray-300 p-2 text-center font-medium">{grade.grade}/{grade.maxGrade}</td>
                          <td className="border border-gray-300 p-2 text-center">{grade.coefficient}</td>
                          <td className="border border-gray-300 p-2 text-sm">{grade.comment}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Comments */}
              {(bulletinData.generalComment || bulletinData.recommendations) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {bulletinData.generalComment && (
                    <div>
                      <h4 className="font-semibold mb-2">Appréciation générale:</h4>
                      <p className="text-sm bg-gray-50 p-3 rounded">{bulletinData.generalComment}</p>
                    </div>
                  )}
                  {bulletinData.recommendations && (
                    <div>
                      <h4 className="font-semibold mb-2">Recommandations:</h4>
                      <p className="text-sm bg-gray-50 p-3 rounded">{bulletinData.recommendations}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Attendance Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t pt-4">
                <div>
                  <p><span className="font-semibold">Taux de présence:</span> {bulletinData.attendanceRate}%</p>
                </div>
                <div>
                  <p><span className="font-semibold">Absences:</span> {bulletinData.absences}</p>
                </div>
                <div>
                  <p><span className="font-semibold">Retards:</span> {bulletinData.lateArrivals}</p>
                </div>
              </div>

              {/* Signatures */}
              <div className="flex justify-between mt-8 pt-6 border-t">
                <div className="text-center">
                  <p className="font-medium mb-8">Enseignant</p>
                  <div className="border-t border-gray-400 w-24"></div>
                </div>
                <div className="text-center">
                  <p className="font-medium mb-8">Directeur</p>
                  <div className="border-t border-gray-400 w-24"></div>
                </div>
                <div className="text-center">
                  <p className="font-medium mb-8">Parent</p>
                  <div className="border-t border-gray-400 w-24"></div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <Button onClick={() => setShowPreview(false)} variant="outline">
                Fermer
              </Button>
              <Button className="bg-green-600 hover:bg-green-700">
                <Download className="w-4 h-4 mr-2" />
                Télécharger PDF
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportCardManagement;