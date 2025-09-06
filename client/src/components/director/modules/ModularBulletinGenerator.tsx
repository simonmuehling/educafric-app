import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  FileText, Download, Languages, Eye, Printer, 
  Settings, Book, User, Calendar, GraduationCap 
} from 'lucide-react';

interface ModularBulletinGeneratorProps {
  onGenerate?: (data: any) => void;
}

const ModularBulletinGenerator: React.FC<ModularBulletinGeneratorProps> = ({ onGenerate }) => {
  const { language } = useLanguage();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    // Informations école
    schoolName: '',
    schoolAddress: '',
    schoolCity: '',
    schoolPhone: '',
    schoolEmail: '',
    directorName: '',
    academicYear: '2024-2025',
    
    // Informations élève
    studentFirstName: '',
    studentLastName: '',
    studentBirthDate: '',
    studentBirthPlace: '',
    studentGender: 'M',
    className: '',
    studentNumber: '',
    
    // Période et évaluations
    period: '1er Trimestre',
    generalAverage: 0,
    classRank: 1,
    totalStudents: 30,
    conduct: 'Bien',
    absences: 0,
    teacherComments: '',
    directorComments: '',
    
    // Matières (exemple)
    subjects: [
      { name: 'Français', grade: 0, maxGrade: 20, coefficient: 4, comments: '' },
      { name: 'Mathématiques', grade: 0, maxGrade: 20, coefficient: 4, comments: '' },
      { name: 'Sciences', grade: 0, maxGrade: 20, coefficient: 3, comments: '' },
      { name: 'Anglais', grade: 0, maxGrade: 20, coefficient: 3, comments: '' },
      { name: 'Histoire-Géo', grade: 0, maxGrade: 20, coefficient: 2, comments: '' },
      { name: 'EPS', grade: 0, maxGrade: 20, coefficient: 1, comments: '' }
    ]
  });
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewLanguage, setPreviewLanguage] = useState<'fr' | 'en'>('fr');

  const text = {
    fr: {
      title: 'Générateur de Bulletins Modulables EDUCAFRIC',
      subtitle: 'Créez des bulletins personnalisés avec l\'en-tête de votre école',
      schoolInfo: 'Informations École',
      studentInfo: 'Informations Élève',
      academicInfo: 'Informations Académiques',
      subjects: 'Matières et Notes',
      actions: 'Actions',
      preview: 'Aperçu',
      generate: 'Générer Bulletin',
      download: 'Télécharger',
      schoolName: 'Nom de l\'École',
      address: 'Adresse',
      city: 'Ville',
      phone: 'Téléphone',
      email: 'Email',
      director: 'Nom du Directeur',
      academicYear: 'Année Académique',
      firstName: 'Prénom',
      lastName: 'Nom de famille',
      birthDate: 'Date de naissance',
      birthPlace: 'Lieu de naissance',
      gender: 'Sexe',
      className: 'Classe',
      studentNumber: 'Matricule',
      period: 'Période',
      average: 'Moyenne générale',
      rank: 'Rang de classe',
      totalStudents: 'Total élèves',
      conduct: 'Conduite',
      absences: 'Absences',
      teacherComments: 'Observations professeur',
      directorComments: 'Observations directeur',
      subject: 'Matière',
      grade: 'Note',
      coeff: 'Coeff',
      comments: 'Observations',
      male: 'Masculin',
      female: 'Féminin',
      excellent: 'Excellent',
      veryGood: 'Très Bien',
      good: 'Bien',
      fair: 'Assez Bien',
      poor: 'Passable',
      language: 'Langue du bulletin',
      generating: 'Génération...',
      success: 'Succès',
      error: 'Erreur',
      bulletinGenerated: 'Bulletin généré avec succès',
      generationError: 'Erreur lors de la génération du bulletin'
    },
    en: {
      title: 'EDUCAFRIC Modular Bulletin Generator',
      subtitle: 'Create personalized bulletins with your school header',
      schoolInfo: 'School Information',
      studentInfo: 'Student Information',
      academicInfo: 'Academic Information',
      subjects: 'Subjects and Grades',
      actions: 'Actions',
      preview: 'Preview',
      generate: 'Generate Bulletin',
      download: 'Download',
      schoolName: 'School Name',
      address: 'Address',
      city: 'City',
      phone: 'Phone',
      email: 'Email',
      director: 'Director Name',
      academicYear: 'Academic Year',
      firstName: 'First Name',
      lastName: 'Last Name',
      birthDate: 'Birth Date',
      birthPlace: 'Birth Place',
      gender: 'Gender',
      className: 'Class',
      studentNumber: 'Student Number',
      period: 'Period',
      average: 'General Average',
      rank: 'Class Rank',
      totalStudents: 'Total Students',
      conduct: 'Conduct',
      absences: 'Absences',
      teacherComments: 'Teacher Comments',
      directorComments: 'Director Comments',
      subject: 'Subject',
      grade: 'Grade',
      coeff: 'Coeff',
      comments: 'Comments',
      male: 'Male',
      female: 'Female',
      excellent: 'Excellent',
      veryGood: 'Very Good',
      good: 'Good',
      fair: 'Fair',
      poor: 'Poor',
      language: 'Bulletin Language',
      generating: 'Generating...',
      success: 'Success',
      error: 'Error',
      bulletinGenerated: 'Bulletin generated successfully',
      generationError: 'Error generating bulletin'
    }
  };

  const t = text[language as keyof typeof text];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubjectChange = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      subjects: prev.subjects.map((subject, i) => 
        i === index ? { ...subject, [field]: value } : subject
      )
    }));
  };

  const generateBulletin = async () => {
    setIsGenerating(true);
    
    try {
      const bulletinData = {
        schoolInfo: {
          schoolName: formData.schoolName,
          address: formData.schoolAddress,
          city: formData.schoolCity,
          phoneNumber: formData.schoolPhone,
          email: formData.schoolEmail,
          directorName: formData.directorName,
          academicYear: formData.academicYear
        },
        student: {
          firstName: formData.studentFirstName,
          lastName: formData.studentLastName,
          birthDate: formData.studentBirthDate,
          birthPlace: formData.studentBirthPlace,
          gender: formData.studentGender === 'M' ? 'Masculin' : 'Féminin',
          className: formData.className,
          studentNumber: formData.studentNumber
        },
        period: formData.period,
        subjects: formData.subjects,
        generalAverage: formData.generalAverage,
        classRank: formData.classRank,
        totalStudents: formData.totalStudents,
        conduct: formData.conduct,
        absences: formData.absences,
        teacherComments: formData.teacherComments,
        directorComments: formData.directorComments,
        language: previewLanguage
      };

      const response = await fetch('/api/templates/bulletin/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bulletinData)
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la génération du template');
      }

      const htmlTemplate = await response.text();
      
      // Ouvrir dans un nouvel onglet pour affichage/impression
      const newWindow = window.open('', '_blank');
      if (newWindow) {
        newWindow.document.write(htmlTemplate);
        newWindow.document.close();
      }
      
      toast({
        title: t.success,
        description: t.bulletinGenerated,
      });

      if (onGenerate) {
        onGenerate(bulletinData);
      }
      
    } catch (error) {
      console.error('Erreur génération bulletin modulable:', error);
      toast({
        title: t.error,
        description: t.generationError,
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const previewTemplate = async () => {
    try {
      const url = `/api/templates/bulletin/preview?language=${previewLanguage}`;
      window.open(url, '_blank');
    } catch (error) {
      console.error('Erreur aperçu template:', error);
      toast({
        title: t.error,
        description: t.generationError,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <FileText className="w-8 h-8" />
          <div>
            <h1 className="text-2xl font-bold">{t.title}</h1>
            <p className="text-blue-100">{t.subtitle}</p>
          </div>
        </div>
      </div>

      {/* Actions et langue */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Languages className="w-5 h-5" />
              {t.actions}
            </CardTitle>
            <div className="flex items-center gap-4">
              <Label>{t.language}:</Label>
              <Select value={previewLanguage} onValueChange={(value: 'fr' | 'en') => setPreviewLanguage(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fr">Français</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={previewTemplate} variant="outline" size="sm">
                <Eye className="w-4 h-4 mr-2" />
                {t.preview}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Informations École */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              {t.schoolInfo}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>{t.schoolName}</Label>
              <Input 
                value={formData.schoolName}
                onChange={(e) => handleInputChange('schoolName', e.target.value)}
                placeholder="École Bilingue Excellence"
              />
            </div>
            <div>
              <Label>{t.address}</Label>
              <Input 
                value={formData.schoolAddress}
                onChange={(e) => handleInputChange('schoolAddress', e.target.value)}
                placeholder="BP 1234, Quartier Bastos"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>{t.city}</Label>
                <Input 
                  value={formData.schoolCity}
                  onChange={(e) => handleInputChange('schoolCity', e.target.value)}
                  placeholder="Yaoundé"
                />
              </div>
              <div>
                <Label>{t.phone}</Label>
                <Input 
                  value={formData.schoolPhone}
                  onChange={(e) => handleInputChange('schoolPhone', e.target.value)}
                  placeholder="+237 XXX XXX XXX"
                />
              </div>
            </div>
            <div>
              <Label>{t.email}</Label>
              <Input 
                value={formData.schoolEmail}
                onChange={(e) => handleInputChange('schoolEmail', e.target.value)}
                placeholder="contact@ecole.com"
              />
            </div>
            <div>
              <Label>{t.director}</Label>
              <Input 
                value={formData.directorName}
                onChange={(e) => handleInputChange('directorName', e.target.value)}
                placeholder="M. DUPONT Jean"
              />
            </div>
            <div>
              <Label>{t.academicYear}</Label>
              <Input 
                value={formData.academicYear}
                onChange={(e) => handleInputChange('academicYear', e.target.value)}
                placeholder="2024-2025"
              />
            </div>
          </CardContent>
        </Card>

        {/* Informations Élève */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              {t.studentInfo}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>{t.firstName}</Label>
                <Input 
                  value={formData.studentFirstName}
                  onChange={(e) => handleInputChange('studentFirstName', e.target.value)}
                  placeholder="Marie"
                />
              </div>
              <div>
                <Label>{t.lastName}</Label>
                <Input 
                  value={formData.studentLastName}
                  onChange={(e) => handleInputChange('studentLastName', e.target.value)}
                  placeholder="NGONO"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>{t.birthDate}</Label>
                <Input 
                  type="date"
                  value={formData.studentBirthDate}
                  onChange={(e) => handleInputChange('studentBirthDate', e.target.value)}
                />
              </div>
              <div>
                <Label>{t.birthPlace}</Label>
                <Input 
                  value={formData.studentBirthPlace}
                  onChange={(e) => handleInputChange('studentBirthPlace', e.target.value)}
                  placeholder="Yaoundé"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>{t.gender}</Label>
                <Select value={formData.studentGender} onValueChange={(value) => handleInputChange('studentGender', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M">{t.male}</SelectItem>
                    <SelectItem value="F">{t.female}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{t.studentNumber}</Label>
                <Input 
                  value={formData.studentNumber}
                  onChange={(e) => handleInputChange('studentNumber', e.target.value)}
                  placeholder="ECE2024001"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Informations Académiques */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5" />
            {t.academicInfo}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <Label>{t.className}</Label>
              <Input 
                value={formData.className}
                onChange={(e) => handleInputChange('className', e.target.value)}
                placeholder="6ème A"
              />
            </div>
            <div>
              <Label>{t.period}</Label>
              <Select value={formData.period} onValueChange={(value) => handleInputChange('period', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1er Trimestre">1er Trimestre</SelectItem>
                  <SelectItem value="2ème Trimestre">2ème Trimestre</SelectItem>
                  <SelectItem value="3ème Trimestre">3ème Trimestre</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{t.average}</Label>
              <Input 
                type="number"
                step="0.1"
                max="20"
                value={formData.generalAverage}
                onChange={(e) => handleInputChange('generalAverage', parseFloat(e.target.value) || 0)}
                placeholder="14.5"
              />
            </div>
            <div>
              <Label>{t.rank}</Label>
              <Input 
                type="number"
                min="1"
                value={formData.classRank}
                onChange={(e) => handleInputChange('classRank', parseInt(e.target.value) || 1)}
                placeholder="5"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <Label>{t.totalStudents}</Label>
              <Input 
                type="number"
                min="1"
                value={formData.totalStudents}
                onChange={(e) => handleInputChange('totalStudents', parseInt(e.target.value) || 30)}
                placeholder="32"
              />
            </div>
            <div>
              <Label>{t.conduct}</Label>
              <Select value={formData.conduct} onValueChange={(value) => handleInputChange('conduct', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Excellent">{t.excellent}</SelectItem>
                  <SelectItem value="Très Bien">{t.veryGood}</SelectItem>
                  <SelectItem value="Bien">{t.good}</SelectItem>
                  <SelectItem value="Assez Bien">{t.fair}</SelectItem>
                  <SelectItem value="Passable">{t.poor}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{t.absences}</Label>
              <Input 
                type="number"
                min="0"
                value={formData.absences}
                onChange={(e) => handleInputChange('absences', parseInt(e.target.value) || 0)}
                placeholder="2"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <Label>{t.teacherComments}</Label>
              <Textarea 
                value={formData.teacherComments}
                onChange={(e) => handleInputChange('teacherComments', e.target.value)}
                placeholder="Élève sérieuse et appliquée..."
                rows={3}
              />
            </div>
            <div>
              <Label>{t.directorComments}</Label>
              <Textarea 
                value={formData.directorComments}
                onChange={(e) => handleInputChange('directorComments', e.target.value)}
                placeholder="Résultats encourageants..."
                rows={3}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Matières et Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Book className="w-5 h-5" />
            {t.subjects}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {formData.subjects.map((subject, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-2 p-3 border rounded-lg">
                <div>
                  <Label className="text-xs">{t.subject}</Label>
                  <Input 
                    value={subject.name}
                    onChange={(e) => handleSubjectChange(index, 'name', e.target.value)}
                    className="text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs">{t.grade}</Label>
                  <Input 
                    type="number"
                    step="0.1"
                    max="20"
                    value={subject.grade}
                    onChange={(e) => handleSubjectChange(index, 'grade', parseFloat(e.target.value) || 0)}
                    className="text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs">{t.coeff}</Label>
                  <Input 
                    type="number"
                    min="1"
                    max="10"
                    value={subject.coefficient}
                    onChange={(e) => handleSubjectChange(index, 'coefficient', parseInt(e.target.value) || 1)}
                    className="text-sm"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label className="text-xs">{t.comments}</Label>
                  <Input 
                    value={subject.comments}
                    onChange={(e) => handleSubjectChange(index, 'comments', e.target.value)}
                    className="text-sm"
                    placeholder="Observations..."
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Génération */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-center">
            <Button 
              onClick={generateBulletin}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3"
              disabled={isGenerating}
              size="lg"
            >
              <Printer className="w-5 h-5 mr-2" />
              {isGenerating ? t.generating : t.generate}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ModularBulletinGenerator;