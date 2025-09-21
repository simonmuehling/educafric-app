import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Minus, FileText, Download, Eye } from 'lucide-react';
import ReportCardPreview from './ReportCardPreview';

interface Subject {
  id: string;
  name: string;
  coefficient: number;
  grade: number;
  remark: string;
}

interface StudentInfo {
  name: string;
  id: string;
  classLabel: string;
  classSize: number;
  birthDate: string;
  birthPlace: string;
  gender: string;
  headTeacher: string;
  guardian: string;
}

interface DisciplineInfo {
  absJ: number;
  absNJ: number;
  late: number;
  sanctions: number;
}

export default function BulletinCreationInterface() {
  const [student, setStudent] = useState<StudentInfo>({
    name: '',
    id: '',
    classLabel: '',
    classSize: 0,
    birthDate: '',
    birthPlace: '',
    gender: '',
    headTeacher: '',
    guardian: ''
  });

  const [subjects, setSubjects] = useState<Subject[]>([
    { id: '1', name: 'FRANÇAIS', coefficient: 6, grade: 0, remark: '' },
    { id: '2', name: 'ANGLAIS', coefficient: 3, grade: 0, remark: '' },
    { id: '3', name: 'MATHÉMATIQUES', coefficient: 4, grade: 0, remark: '' },
  ]);

  const [discipline, setDiscipline] = useState<DisciplineInfo>({
    absJ: 0,
    absNJ: 0,
    late: 0,
    sanctions: 0
  });

  const [trimester, setTrimester] = useState('Premier');
  const [year, setYear] = useState('2025/2026');
  const [showPreview, setShowPreview] = useState(false);
  const [generalRemark, setGeneralRemark] = useState('');

  const addSubject = () => {
    const newSubject: Subject = {
      id: Date.now().toString(),
      name: '',
      coefficient: 1,
      grade: 0,
      remark: ''
    };
    setSubjects([...subjects, newSubject]);
  };

  const removeSubject = (id: string) => {
    setSubjects(subjects.filter(s => s.id !== id));
  };

  const updateSubject = (id: string, field: keyof Subject, value: string | number) => {
    setSubjects(subjects.map(s => 
      s.id === id ? { ...s, [field]: value } : s
    ));
  };

  const calculateAverage = () => {
    if (subjects.length === 0) return 0;
    const totalPoints = subjects.reduce((sum, s) => sum + (s.grade * s.coefficient), 0);
    const totalCoef = subjects.reduce((sum, s) => sum + s.coefficient, 0);
    return totalCoef > 0 ? (totalPoints / totalCoef).toFixed(2) : 0;
  };

  const handleSaveBulletin = async () => {
    try {
      const bulletinData = {
        studentId: student.id,
        studentName: student.name,
        classLabel: student.classLabel,
        trimester,
        academicYear: year,
        subjects,
        discipline,
        generalRemark,
        status: 'draft'
      };

      const response = await fetch('/api/academic-bulletins/bulletins', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bulletinData),
        credentials: 'include'
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Bulletin saved:', result);
        alert('Bulletin sauvegardé avec succès !');
      } else {
        throw new Error('Failed to save bulletin');
      }
    } catch (error) {
      console.error('Error saving bulletin:', error);
      alert('Erreur lors de la sauvegarde du bulletin');
    }
  };

  const bulletinData = {
    student: {
      ...student,
      generalRemark,
      discipline,
      school: {
        name: "LYCÉE DE MENDONG / HIGH SCHOOL OF MENDONG",
        subtitle: "LDM-2025-001 – Yaounde – Tel: +237 222 xxx xxx"
      }
    },
    lines: subjects.map(s => ({
      subject: s.name,
      m20: s.grade,
      coef: s.coefficient,
      remark: s.remark
    })),
    year,
    trimester
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Création de Bulletin Trimestriel
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="trimester">Trimestre</Label>
              <Select value={trimester} onValueChange={setTrimester}>
                <SelectTrigger data-testid="select-trimester">
                  <SelectValue placeholder="Sélectionner le trimestre" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Premier">Premier Trimestre</SelectItem>
                  <SelectItem value="Deuxième">Deuxième Trimestre</SelectItem>
                  <SelectItem value="Troisième">Troisième Trimestre</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="year">Année scolaire</Label>
              <Input
                id="year"
                data-testid="input-year"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="2025/2026"
              />
            </div>

            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-sm text-gray-600">Moyenne générale</div>
              <div className="text-2xl font-bold text-blue-600">{calculateAverage()}/20</div>
            </div>
          </div>

          {/* Student Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informations de l'élève</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="studentName">Nom & Prénoms</Label>
                  <Input
                    id="studentName"
                    data-testid="input-student-name"
                    value={student.name}
                    onChange={(e) => setStudent({...student, name: e.target.value})}
                    placeholder="NDAH John"
                  />
                </div>
                
                <div>
                  <Label htmlFor="studentId">Matricule</Label>
                  <Input
                    id="studentId"
                    data-testid="input-student-id"
                    value={student.id}
                    onChange={(e) => setStudent({...student, id: e.target.value})}
                    placeholder="STU-6E-00045"
                  />
                </div>

                <div>
                  <Label htmlFor="classLabel">Classe</Label>
                  <Input
                    id="classLabel"
                    data-testid="input-class-label"
                    value={student.classLabel}
                    onChange={(e) => setStudent({...student, classLabel: e.target.value})}
                    placeholder="6ème A"
                  />
                </div>

                <div>
                  <Label htmlFor="classSize">Effectif</Label>
                  <Input
                    id="classSize"
                    data-testid="input-class-size"
                    type="number"
                    value={student.classSize}
                    onChange={(e) => setStudent({...student, classSize: parseInt(e.target.value) || 0})}
                    placeholder="58"
                  />
                </div>

                <div>
                  <Label htmlFor="birthDate">Date de naissance</Label>
                  <Input
                    id="birthDate"
                    data-testid="input-birth-date"
                    type="date"
                    value={student.birthDate}
                    onChange={(e) => setStudent({...student, birthDate: e.target.value})}
                  />
                </div>

                <div>
                  <Label htmlFor="birthPlace">Lieu de naissance</Label>
                  <Input
                    id="birthPlace"
                    data-testid="input-birth-place"
                    value={student.birthPlace}
                    onChange={(e) => setStudent({...student, birthPlace: e.target.value})}
                    placeholder="Douala"
                  />
                </div>

                <div>
                  <Label htmlFor="gender">Genre</Label>
                  <Select value={student.gender} onValueChange={(value) => setStudent({...student, gender: value})}>
                    <SelectTrigger data-testid="select-gender">
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="M">Masculin</SelectItem>
                      <SelectItem value="F">Féminin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="headTeacher">Professeur principal</Label>
                  <Input
                    id="headTeacher"
                    data-testid="input-head-teacher"
                    value={student.headTeacher}
                    onChange={(e) => setStudent({...student, headTeacher: e.target.value})}
                    placeholder="Mme NGONO"
                  />
                </div>

                <div>
                  <Label htmlFor="guardian">Parents/Tuteurs</Label>
                  <Input
                    id="guardian"
                    data-testid="input-guardian"
                    value={student.guardian}
                    onChange={(e) => setStudent({...student, guardian: e.target.value})}
                    placeholder="Mr & Mrs NDONGO"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Subjects and Grades */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                Notes par matière
                <Button onClick={addSubject} size="sm" data-testid="button-add-subject">
                  <Plus className="h-4 w-4 mr-1" />
                  Ajouter
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {subjects.map((subject, index) => (
                  <div key={subject.id} className="grid grid-cols-1 md:grid-cols-6 gap-3 p-3 border rounded-lg">
                    <div>
                      <Label className="text-sm">Matière</Label>
                      <Input
                        data-testid={`input-subject-name-${index}`}
                        value={subject.name}
                        onChange={(e) => updateSubject(subject.id, 'name', e.target.value)}
                        placeholder="Nom de la matière"
                      />
                    </div>
                    
                    <div>
                      <Label className="text-sm">Coefficient</Label>
                      <Input
                        data-testid={`input-subject-coefficient-${index}`}
                        type="number"
                        min="1"
                        max="10"
                        value={subject.coefficient}
                        onChange={(e) => updateSubject(subject.id, 'coefficient', parseInt(e.target.value) || 1)}
                      />
                    </div>

                    <div>
                      <Label className="text-sm">Note /20</Label>
                      <Input
                        data-testid={`input-subject-grade-${index}`}
                        type="number"
                        min="0"
                        max="20"
                        step="0.5"
                        value={subject.grade}
                        onChange={(e) => updateSubject(subject.id, 'grade', parseFloat(e.target.value) || 0)}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <Label className="text-sm">Appréciation</Label>
                      <Input
                        data-testid={`input-subject-remark-${index}`}
                        value={subject.remark}
                        onChange={(e) => updateSubject(subject.id, 'remark', e.target.value)}
                        placeholder="Appréciation de l'enseignant"
                      />
                    </div>

                    <div className="flex items-end">
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => removeSubject(subject.id)}
                        data-testid={`button-remove-subject-${index}`}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Discipline and Absences */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Discipline et Absences</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="absJ">Absences justifiées (h)</Label>
                  <Input
                    id="absJ"
                    data-testid="input-abs-justified"
                    type="number"
                    min="0"
                    value={discipline.absJ}
                    onChange={(e) => setDiscipline({...discipline, absJ: parseInt(e.target.value) || 0})}
                  />
                </div>

                <div>
                  <Label htmlFor="absNJ">Absences non justifiées (h)</Label>
                  <Input
                    id="absNJ"
                    data-testid="input-abs-unjustified"
                    type="number"
                    min="0"
                    value={discipline.absNJ}
                    onChange={(e) => setDiscipline({...discipline, absNJ: parseInt(e.target.value) || 0})}
                  />
                </div>

                <div>
                  <Label htmlFor="late">Retards</Label>
                  <Input
                    id="late"
                    data-testid="input-lates"
                    type="number"
                    min="0"
                    value={discipline.late}
                    onChange={(e) => setDiscipline({...discipline, late: parseInt(e.target.value) || 0})}
                  />
                </div>

                <div>
                  <Label htmlFor="sanctions">Avertissements/Blâmes</Label>
                  <Input
                    id="sanctions"
                    data-testid="input-sanctions"
                    type="number"
                    min="0"
                    value={discipline.sanctions}
                    onChange={(e) => setDiscipline({...discipline, sanctions: parseInt(e.target.value) || 0})}
                  />
                </div>
              </div>

              <div className="mt-4">
                <Label htmlFor="generalRemark">Appréciation générale</Label>
                <Textarea
                  id="generalRemark"
                  data-testid="textarea-general-remark"
                  value={generalRemark}
                  onChange={(e) => setGeneralRemark(e.target.value)}
                  placeholder="Appréciation générale du trimestre..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex flex-wrap gap-3 justify-end">
            <Button variant="outline" onClick={() => setShowPreview(!showPreview)} data-testid="button-preview">
              <Eye className="h-4 w-4 mr-2" />
              {showPreview ? 'Masquer' : 'Aperçu'}
            </Button>
            
            <Button onClick={handleSaveBulletin} data-testid="button-save">
              <Download className="h-4 w-4 mr-2" />
              Sauvegarder
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      {showPreview && (
        <Card>
          <CardHeader>
            <CardTitle>Aperçu du bulletin</CardTitle>
          </CardHeader>
          <CardContent>
            <ReportCardPreview {...bulletinData} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}