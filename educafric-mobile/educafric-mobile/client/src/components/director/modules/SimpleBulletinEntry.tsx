import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  BookOpen, 
  Save, 
  Download, 
  Calendar,
  AlertTriangle,
  CheckCircle,
  FileSignature,
  Loader2
} from 'lucide-react';

interface BulletinData {
  studentName: string;
  className: string;
  term: string;
  academicYear: string;
  absences: {
    unjustified: number;
    justified: number;
    lateness: number;
    detention: number;
  };
  sanctions: {
    warning: boolean;
    blame: boolean;
    exclusionDays: number;
  };
  grades: {
    totalGeneral: number;
    average: number;
    successRate: number;
  };
  appreciation: string;
  comments: string;
  signatures: {
    parent: string;
    teacher: string;
    headmaster: string;
  };
}

const SimpleBulletinEntry: React.FC = () => {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [bulletinData, setBulletinData] = useState<BulletinData>({
    studentName: '',
    className: '',
    term: 'T1',
    academicYear: '2024-2025',
    absences: {
      unjustified: 0,
      justified: 0,
      lateness: 0,
      detention: 0
    },
    sanctions: {
      warning: false,
      blame: false,
      exclusionDays: 0
    },
    grades: {
      totalGeneral: 0,
      average: 0,
      successRate: 0
    },
    appreciation: '',
    comments: '',
    signatures: {
      parent: '',
      teacher: '',
      headmaster: ''
    }
  });

  const updateField = (section: keyof BulletinData, field: string, value: any) => {
    setBulletinData(prev => ({
      ...prev,
      [section]: typeof prev[section] === 'object' && prev[section] !== null
        ? { ...prev[section], [field]: value }
        : value
    }));
  };

  const handleSaveDraft = () => {
    try {
      localStorage.setItem('bulletinDraft', JSON.stringify(bulletinData));
      toast({
        title: "Brouillon sauvegardé",
        description: "Vos données ont été sauvegardées localement",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder le brouillon",
        variant: "destructive"
      });
    }
  };

  const handleLoadDraft = () => {
    try {
      const saved = localStorage.getItem('bulletinDraft');
      if (saved) {
        setBulletinData(JSON.parse(saved));
        toast({
          title: "Brouillon chargé",
          description: "Vos données sauvegardées ont été restaurées",
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger le brouillon",
        variant: "destructive"
      });
    }
  };

  const handleGeneratePDF = async () => {
    setIsGenerating(true);
    try {
      // Validation des données requises
      if (!bulletinData.studentName.trim()) {
        throw new Error('Le nom de l\'élève est requis');
      }
      
      if (!bulletinData.className.trim()) {
        throw new Error('Le nom de la classe est requis');
      }

      // Préparer les données dans le format exact attendu par l'API
      const pdfData = {
        // L'API attend un array de studentIds, pour une saisie manuelle on crée un ID temporaire
        studentIds: [999999], // ID temporaire pour saisie manuelle
        
        // L'API attend un classId numérique, on utilise un hash du nom de classe
        classId: Math.abs(bulletinData.className.split('').reduce((a, b) => {
          a = ((a << 5) - a) + b.charCodeAt(0);
          return a & a;
        }, 0)) || 1,
        
        // Ces paramètres sont envoyés directement au niveau racine
        term: bulletinData.term,
        academicYear: bulletinData.academicYear,
        
        // Options de génération
        includeComments: true,
        includeRankings: true,
        includeStatistics: true,
        includeAbsences: true,
        includeSanctions: true,
        includeAppreciations: true,
        format: 'pdf',
        
        // Données manuelles pour l'étudiant temporaire
        manualData: {
          studentName: bulletinData.studentName,
          className: bulletinData.className,
          absences: bulletinData.absences,
          sanctions: bulletinData.sanctions,
          grades: bulletinData.grades,
          appreciation: bulletinData.appreciation,
          comments: bulletinData.comments,
          signatures: bulletinData.signatures
        }
      };

      console.log('[SIMPLE_BULLETIN] 📤 Envoi des données corrigées:', pdfData);

      // Appel vers l'API de génération de bulletins complets
      const response = await fetch('/api/comprehensive-bulletins/generate-comprehensive', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(pdfData)
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      // Télécharger le PDF généré
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bulletin-${bulletinData.studentName}-${bulletinData.term}-${bulletinData.academicYear}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "PDF Généré avec succès",
        description: `Le bulletin de ${bulletinData.studentName} a été téléchargé`,
      });
    } catch (error: any) {
      console.error('[SIMPLE_BULLETIN] ❌ Erreur génération PDF:', error);
      toast({
        title: "Erreur de génération",
        description: error.message || "Impossible de générer le PDF",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="w-full" data-testid="simple-bulletin-entry">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Saisie Manuelle de Bulletin
        </CardTitle>
        <div className="flex gap-2">
          <Badge variant="secondary">Données Réelles</Badge>
          <Badge variant="outline">Interface Simplifiée</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="basic">Infos de Base</TabsTrigger>
            <TabsTrigger value="absences">Absences</TabsTrigger>
            <TabsTrigger value="sanctions">Sanctions</TabsTrigger>
            <TabsTrigger value="grades">Notes</TabsTrigger>
            <TabsTrigger value="comments">Commentaires</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="studentName">Nom de l'élève</Label>
                <Input
                  id="studentName"
                  value={bulletinData.studentName}
                  onChange={(e) => setBulletinData(prev => ({ ...prev, studentName: e.target.value }))}
                  placeholder="Nom complet de l'élève"
                  data-testid="input-student-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="className">Classe</Label>
                <Input
                  id="className"
                  value={bulletinData.className}
                  onChange={(e) => setBulletinData(prev => ({ ...prev, className: e.target.value }))}
                  placeholder="Ex: 6ème A, CM2, etc."
                  data-testid="input-class-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="term">Trimestre</Label>
                <Select value={bulletinData.term} onValueChange={(value) => setBulletinData(prev => ({ ...prev, term: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="T1">1er Trimestre (T1)</SelectItem>
                    <SelectItem value="T2">2ème Trimestre (T2)</SelectItem>
                    <SelectItem value="T3">3ème Trimestre (T3)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="academicYear">Année Scolaire</Label>
                <Input
                  id="academicYear"
                  value={bulletinData.academicYear}
                  onChange={(e) => setBulletinData(prev => ({ ...prev, academicYear: e.target.value }))}
                  placeholder="2024-2025"
                  data-testid="input-academic-year"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="absences" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="unjustifiedAbsences">Absences Injustifiées (heures)</Label>
                <Input
                  id="unjustifiedAbsences"
                  type="number"
                  min="0"
                  step="0.5"
                  value={bulletinData.absences.unjustified}
                  onChange={(e) => updateField('absences', 'unjustified', parseFloat(e.target.value) || 0)}
                  data-testid="input-unjustified-absences"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="justifiedAbsences">Absences Justifiées (heures)</Label>
                <Input
                  id="justifiedAbsences"
                  type="number"
                  min="0"
                  step="0.5"
                  value={bulletinData.absences.justified}
                  onChange={(e) => updateField('absences', 'justified', parseFloat(e.target.value) || 0)}
                  data-testid="input-justified-absences"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lateness">Retards (nombre)</Label>
                <Input
                  id="lateness"
                  type="number"
                  min="0"
                  value={bulletinData.absences.lateness}
                  onChange={(e) => updateField('absences', 'lateness', parseInt(e.target.value) || 0)}
                  data-testid="input-lateness"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="detention">Consignes (heures)</Label>
                <Input
                  id="detention"
                  type="number"
                  min="0"
                  step="0.5"
                  value={bulletinData.absences.detention}
                  onChange={(e) => updateField('absences', 'detention', parseFloat(e.target.value) || 0)}
                  data-testid="input-detention"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="sanctions" className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="warning"
                  checked={bulletinData.sanctions.warning}
                  onChange={(e) => updateField('sanctions', 'warning', e.target.checked)}
                  data-testid="checkbox-warning"
                />
                <Label htmlFor="warning">Avertissement de conduite</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="blame"
                  checked={bulletinData.sanctions.blame}
                  onChange={(e) => updateField('sanctions', 'blame', e.target.checked)}
                  data-testid="checkbox-blame"
                />
                <Label htmlFor="blame">Blâme de conduite</Label>
              </div>
              <div className="space-y-2">
                <Label htmlFor="exclusionDays">Jours d'exclusion</Label>
                <Input
                  id="exclusionDays"
                  type="number"
                  min="0"
                  value={bulletinData.sanctions.exclusionDays}
                  onChange={(e) => updateField('sanctions', 'exclusionDays', parseInt(e.target.value) || 0)}
                  data-testid="input-exclusion-days"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="grades" className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="totalGeneral">Total Général</Label>
                <Input
                  id="totalGeneral"
                  type="number"
                  step="0.01"
                  value={bulletinData.grades.totalGeneral}
                  onChange={(e) => updateField('grades', 'totalGeneral', parseFloat(e.target.value) || 0)}
                  data-testid="input-total-general"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="average">Moyenne (/20)</Label>
                <Input
                  id="average"
                  type="number"
                  step="0.01"
                  min="0"
                  max="20"
                  value={bulletinData.grades.average}
                  onChange={(e) => updateField('grades', 'average', parseFloat(e.target.value) || 0)}
                  data-testid="input-average"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="successRate">Taux de réussite (%)</Label>
                <Input
                  id="successRate"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={bulletinData.grades.successRate}
                  onChange={(e) => updateField('grades', 'successRate', parseFloat(e.target.value) || 0)}
                  data-testid="input-success-rate"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="comments" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="appreciation">Appréciation du travail (500 caractères max)</Label>
                <Textarea
                  id="appreciation"
                  value={bulletinData.appreciation}
                  onChange={(e) => setBulletinData(prev => ({ ...prev, appreciation: e.target.value }))}
                  placeholder="Appréciation détaillée du travail de l'élève..."
                  maxLength={500}
                  rows={4}
                  data-testid="textarea-appreciation"
                />
                <div className="text-sm text-muted-foreground">
                  {bulletinData.appreciation.length}/500 caractères
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="comments">Observations générales (300 caractères max)</Label>
                <Textarea
                  id="comments"
                  value={bulletinData.comments}
                  onChange={(e) => setBulletinData(prev => ({ ...prev, comments: e.target.value }))}
                  placeholder="Commentaires généraux sur l'élève..."
                  maxLength={300}
                  rows={3}
                  data-testid="textarea-comments"
                />
                <div className="text-sm text-muted-foreground">
                  {bulletinData.comments.length}/300 caractères
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="parentSignature">Visa Parent</Label>
                  <Input
                    id="parentSignature"
                    value={bulletinData.signatures.parent}
                    onChange={(e) => updateField('signatures', 'parent', e.target.value)}
                    placeholder="Nom du parent"
                    data-testid="input-parent-signature"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="teacherSignature">Visa Professeur Principal</Label>
                  <Input
                    id="teacherSignature"
                    value={bulletinData.signatures.teacher}
                    onChange={(e) => updateField('signatures', 'teacher', e.target.value)}
                    placeholder="Nom du professeur"
                    data-testid="input-teacher-signature"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="headmasterSignature">Visa Directeur</Label>
                  <Input
                    id="headmasterSignature"
                    value={bulletinData.signatures.headmaster}
                    onChange={(e) => updateField('signatures', 'headmaster', e.target.value)}
                    placeholder="Nom du directeur"
                    data-testid="input-headmaster-signature"
                  />
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t">
          <Button
            onClick={handleSaveDraft}
            variant="outline"
            className="flex items-center gap-2"
            data-testid="button-save-draft"
          >
            <Save className="h-4 w-4" />
            Sauvegarder Brouillon
          </Button>
          
          <Button
            onClick={handleLoadDraft}
            variant="outline"
            className="flex items-center gap-2"
            data-testid="button-load-draft"
          >
            <Calendar className="h-4 w-4" />
            Charger Brouillon
          </Button>

          <Button
            onClick={handleGeneratePDF}
            disabled={isGenerating || !bulletinData.studentName || !bulletinData.className}
            className="flex items-center gap-2"
            data-testid="button-generate-bulletin-pdf"
          >
            {isGenerating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            {isGenerating ? 'Génération...' : 'Générer Bulletin PDF'}
          </Button>
        </div>

        {/* Status Messages */}
        <div className="mt-4 p-3 bg-muted rounded-lg">
          <div className="flex items-center gap-2 text-sm">
            {bulletinData.studentName && bulletinData.className ? (
              <>
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-green-600">Prêt pour la génération</span>
              </>
            ) : (
              <>
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <span className="text-orange-600">Veuillez remplir au minimum le nom de l'élève et la classe</span>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SimpleBulletinEntry;