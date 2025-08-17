import React, { useState } from 'react';
import { FileText, Plus, Save, Eye, QrCode, Shield, CheckCircle, Upload } from 'lucide-react';
import { ModernCard } from '@/components/ui/ModernCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import BulletinValidationViewer from '@/components/BulletinValidationViewer';

interface Subject {
  id: string;
  name: string;
  coefficient: number;
}

interface Grade {
  subjectId: string;
  note: number;
  coefficient: number;
  appreciation: string;
}

interface BulletinData {
  studentId: number;
  schoolId: number;
  term: string;
  academicYear: string;
  grades: Grade[];
  generalAppreciation: string;
  conductGrade: number;
  absences: number;
  teacherSignature?: string;
  directorSignature?: string;
  schoolStamp?: string;
}

export default function BulletinCreationTest() {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [bulletinData, setBulletinData] = useState<BulletinData>({
    studentId: 1,
    schoolId: 1,
    term: 'Premier Trimestre',
    academicYear: '2024-2025',
    grades: [],
    generalAppreciation: '',
    conductGrade: 18,
    absences: 0
  });

  const [selectedStudent, setSelectedStudent] = useState<number>(1);
  const [createdBulletinId, setCreatedBulletinId] = useState<number | null>(null);
  const [showValidation, setShowValidation] = useState(false);

  // Matières par défaut pour test
  const defaultSubjects: Subject[] = [
    { id: 'math', name: 'Mathématiques', coefficient: 4 },
    { id: 'french', name: 'Français', coefficient: 4 },
    { id: 'english', name: 'Anglais', coefficient: 3 },
    { id: 'science', name: 'Sciences Physiques', coefficient: 3 },
    { id: 'history', name: 'Histoire-Géographie', coefficient: 2 },
    { id: 'sport', name: 'Éducation Physique', coefficient: 1 }
  ];

  // Données de test des étudiants
  const testStudents = [
    { id: 1, name: 'Emma Talla', class: '6ème A', school: 'École Primaire Central' },
    { id: 2, name: 'Paul Ngono', class: '5ème B', school: 'Collège Bilingue Excellence' },
    { id: 3, name: 'Marie Fokam', class: '4ème C', school: 'Lycée Technique Douala' }
  ];

  const createBulletinMutation = useMutation({
    mutationFn: async (data: BulletinData) => {
      const response = await fetch('/api/bulletins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la création du bulletin');
      }
      
      return response.json();
    },
    onSuccess: (result) => {
      setCreatedBulletinId(result.id);
      toast({
        title: "Bulletin créé",
        description: `Bulletin #${result.id} créé avec succès`
      });
      queryClient.invalidateQueries({ queryKey: ['/api/bulletins'] });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de créer le bulletin",
        variant: "destructive"
      });
    }
  });

  const validateBulletinMutation = useMutation({
    mutationFn: async (bulletinId: number) => {
      const response = await fetch(`/api/bulletins/${bulletinId}/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          validationType: 'combined',
          validationLevel: 'enhanced',
          teacherSignatureUrl: '/school-assets/teacher-signature.png',
          directorSignatureUrl: '/school-assets/director-signature.png',
          schoolStampUrl: '/school-assets/school-stamp.png'
        })
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la validation');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Validation créée",
        description: "Le bulletin a été validé avec QR code et tampons"
      });
      setShowValidation(true);
    }
  });

  const addGrade = () => {
    if (bulletinData.grades.length >= defaultSubjects.length) {
      toast({
        title: "Limite atteinte",
        description: "Toutes les matières ont déjà une note",
        variant: "destructive"
      });
      return;
    }

    const availableSubjects = defaultSubjects.filter(
      subject => !bulletinData.grades.find(grade => grade.subjectId === subject.id)
    );

    if (availableSubjects.length > 0) {
      const subject = availableSubjects[0];
      setBulletinData(prev => ({
        ...prev,
        grades: [...prev.grades, {
          subjectId: subject.id,
          note: 15,
          coefficient: subject.coefficient,
          appreciation: 'Bon travail'
        }]
      }));
    }
  };

  const updateGrade = (index: number, field: keyof Grade, value: any) => {
    setBulletinData(prev => ({
      ...prev,
      grades: prev.grades.map((grade, i) => 
        i === index ? { ...grade, [field]: value } : grade
      )
    }));
  };

  const removeGrade = (index: number) => {
    setBulletinData(prev => ({
      ...prev,
      grades: prev.grades.filter((_, i) => i !== index)
    }));
  };

  const calculateAverage = () => {
    if (bulletinData.grades.length === 0) return 0;
    
    const totalPoints = bulletinData.grades.reduce((sum, grade) => 
      sum + (grade.note * grade.coefficient), 0
    );
    const totalCoeff = bulletinData.grades.reduce((sum, grade) => 
      sum + grade.coefficient, 0
    );
    
    return totalCoeff > 0 ? (totalPoints / totalCoeff).toFixed(2) : 0;
  };

  const getSubjectName = (subjectId: string) => {
    return defaultSubjects.find(s => s.id === subjectId)?.name || subjectId;
  };

  const generateRandomBulletin = () => {
    const randomStudent = testStudents[Math.floor(Math.random() * testStudents.length)];
    const randomGrades: Grade[] = defaultSubjects.map(subject => ({
      subjectId: subject.id,
      note: Math.floor(Math.random() * 10) + 10, // Notes entre 10 et 20
      coefficient: subject.coefficient,
      appreciation: ['Excellent', 'Très bien', 'Bien', 'Assez bien', 'Passable'][
        Math.floor(Math.random() * 5)
      ]
    }));

    setBulletinData(prev => ({
      ...prev,
      studentId: randomStudent.id,
      grades: randomGrades,
      generalAppreciation: 'Élève sérieux et appliqué. Continue tes efforts.',
      conductGrade: Math.floor(Math.random() * 5) + 16, // Entre 16 et 20
      absences: Math.floor(Math.random() * 5) // Entre 0 et 4
    }));

    setSelectedStudent(randomStudent.id);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Test Complet - Création de Bulletins
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Système complet de création, validation et sécurisation des bulletins scolaires EDUCAFRIC
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Panneau de création */}
          <div className="lg:col-span-2 space-y-6">
            {/* Sélection de l'étudiant */}
            <ModernCard className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Informations du Bulletin
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Étudiant
                  </label>
                  <Select 
                    value={selectedStudent.toString()} 
                    onValueChange={(value) => {
                      setSelectedStudent(parseInt(value));
                      setBulletinData(prev => ({ ...prev, studentId: parseInt(value) }));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez un étudiant" />
                    </SelectTrigger>
                    <SelectContent>
                      {testStudents.map(student => (
                        <SelectItem key={student.id} value={student.id.toString()}>
                          {student.name} - {student.class}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Période
                  </label>
                  <Select 
                    value={bulletinData.term} 
                    onValueChange={(value) => setBulletinData(prev => ({ ...prev, term: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Premier Trimestre">Premier Trimestre</SelectItem>
                      <SelectItem value="Deuxième Trimestre">Deuxième Trimestre</SelectItem>
                      <SelectItem value="Troisième Trimestre">Troisième Trimestre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Année Scolaire
                  </label>
                  <Input
                    value={bulletinData.academicYear}
                    onChange={(e) => setBulletinData(prev => ({ ...prev, academicYear: e.target.value }))}
                    placeholder="2024-2025"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Moyenne Générale
                  </label>
                  <div className="flex items-center gap-2">
                    <Badge className={`text-lg px-3 py-1 ${
                      parseFloat(calculateAverage().toString()) >= 15 ? 'bg-green-100 text-green-800' :
                      parseFloat(calculateAverage().toString()) >= 12 ? 'bg-blue-100 text-blue-800' :
                      parseFloat(calculateAverage().toString()) >= 10 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {calculateAverage()}/20
                    </Badge>
                    <span className="text-sm text-gray-500">
                      ({bulletinData.grades.length} matières)
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mb-4">
                <Button onClick={generateRandomBulletin} variant="outline" size="sm">
                  Générer Bulletin Aléatoire
                </Button>
                <Button onClick={addGrade} variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter Note
                </Button>
              </div>
            </ModernCard>

            {/* Grilles des notes */}
            <ModernCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Notes par Matière</h3>
              
              {bulletinData.grades.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Aucune note ajoutée. Cliquez sur "Ajouter Note" pour commencer.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {bulletinData.grades.map((grade, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 items-center p-3 bg-gray-50 rounded-lg">
                      <div className="col-span-3">
                        <Select
                          value={grade.subjectId}
                          onValueChange={(value) => updateGrade(index, 'subjectId', value)}
                        >
                          <SelectTrigger className="text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {defaultSubjects.map(subject => (
                              <SelectItem key={subject.id} value={subject.id}>
                                {subject.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="col-span-2">
                        <Input
                          type="number"
                          min="0"
                          max="20"
                          step="0.5"
                          value={grade.note}
                          onChange={(e) => updateGrade(index, 'note', parseFloat(e.target.value))}
                          className="text-center"
                        />
                      </div>
                      
                      <div className="col-span-1 text-center text-sm text-gray-600">
                        Coef. {grade.coefficient}
                      </div>
                      
                      <div className="col-span-4">
                        <Input
                          value={grade.appreciation}
                          onChange={(e) => updateGrade(index, 'appreciation', e.target.value)}
                          placeholder="Appréciation..."
                          className="text-sm"
                        />
                      </div>
                      
                      <div className="col-span-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => removeGrade(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          Supprimer
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ModernCard>

            {/* Appréciations générales */}
            <ModernCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Appréciations et Conduite</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Note de Conduite
                  </label>
                  <Input
                    type="number"
                    min="0"
                    max="20"
                    value={bulletinData.conductGrade}
                    onChange={(e) => setBulletinData(prev => ({ 
                      ...prev, 
                      conductGrade: parseInt(e.target.value) 
                    }))}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre d'Absences
                  </label>
                  <Input
                    type="number"
                    min="0"
                    value={bulletinData.absences}
                    onChange={(e) => setBulletinData(prev => ({ 
                      ...prev, 
                      absences: parseInt(e.target.value) 
                    }))}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Appréciation Générale
                </label>
                <Textarea
                  value={bulletinData.generalAppreciation}
                  onChange={(e) => setBulletinData(prev => ({ 
                    ...prev, 
                    generalAppreciation: e.target.value 
                  }))}
                  placeholder="Entrez l'appréciation générale du conseil de classe..."
                  rows={3}
                />
              </div>
            </ModernCard>
          </div>

          {/* Panneau d'actions et prévisualisation */}
          <div className="space-y-6">
            {/* Actions */}
            <ModernCard className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Save className="w-5 h-5 text-green-600" />
                Actions
              </h3>
              
              <div className="space-y-3">
                <Button 
                  onClick={() => createBulletinMutation.mutate(bulletinData)}
                  disabled={createBulletinMutation.isPending || bulletinData.grades.length === 0}
                  className="w-full"
                  size="lg"
                >
                  {createBulletinMutation.isPending ? 'Création...' : 'Créer Bulletin'}
                </Button>
                
                {createdBulletinId && (
                  <Button 
                    onClick={() => validateBulletinMutation.mutate(createdBulletinId)}
                    disabled={validateBulletinMutation.isPending}
                    variant="outline"
                    className="w-full"
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    {validateBulletinMutation.isPending ? 'Validation...' : 'Valider avec QR Code'}
                  </Button>
                )}
                
                {showValidation && createdBulletinId && (
                  <Button 
                    onClick={() => setShowValidation(!showValidation)}
                    variant="outline"
                    className="w-full"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    {showValidation ? 'Masquer' : 'Voir'} Validation
                  </Button>
                )}
              </div>
            </ModernCard>

            {/* Résumé */}
            <ModernCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Résumé</h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span>Étudiant:</span>
                  <span className="font-medium">
                    {testStudents.find(s => s.id === selectedStudent)?.name}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span>Période:</span>
                  <span className="font-medium">{bulletinData.term}</span>
                </div>
                
                <div className="flex justify-between">
                  <span>Matières:</span>
                  <span className="font-medium">{bulletinData.grades.length}</span>
                </div>
                
                <div className="flex justify-between">
                  <span>Moyenne:</span>
                  <Badge className={`${
                    parseFloat(calculateAverage().toString()) >= 12 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {calculateAverage()}/20
                  </Badge>
                </div>
                
                {createdBulletinId && (
                  <div className="flex justify-between pt-2 border-t">
                    <span>Bulletin ID:</span>
                    <Badge className="bg-blue-100 text-blue-800">#{createdBulletinId}</Badge>
                  </div>
                )}
              </div>
            </ModernCard>

            {/* Statut de validation */}
            {showValidation && createdBulletinId && (
              <ModernCard className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <QrCode className="w-5 h-5 text-blue-600" />
                  Validation Sécurisée
                </h3>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">QR Code généré</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Tampons appliqués</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Hash SHA-256 créé</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Signatures numériques</span>
                  </div>
                </div>
              </ModernCard>
            )}
          </div>
        </div>

        {/* Visualiseur de validation */}
        {showValidation && createdBulletinId && (
          <div className="mt-8">
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
              <Shield className="w-6 h-6 text-blue-600" />
              Validation du Bulletin #{createdBulletinId}
            </h2>
            <BulletinValidationViewer 
              bulletinId={createdBulletinId}
              showVerifyByHash={true}
            />
          </div>
        )}

        {/* Guide d'utilisation */}
        <ModernCard className="p-6 mt-8">
          <h2 className="text-2xl font-semibold mb-6">Guide de Test Complet</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Étapes de Création</h3>
              <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
                <li>Sélectionner un étudiant de test</li>
                <li>Configurer la période et l'année scolaire</li>
                <li>Ajouter les notes par matière</li>
                <li>Saisir les appréciations et conduite</li>
                <li>Créer le bulletin</li>
                <li>Valider avec QR code et tampons</li>
                <li>Vérifier la validation sécurisée</li>
              </ol>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Fonctionnalités Testées</h3>
              <ul className="list-disc list-inside space-y-2 text-sm text-gray-600">
                <li>Création complète de bulletins</li>
                <li>Calcul automatique des moyennes</li>
                <li>Validation avec QR codes sécurisés</li>
                <li>Application des tampons numériques</li>
                <li>Signatures cryptographiques SHA-256</li>
                <li>Vérification d'intégrité</li>
                <li>Interface utilisateur responsive</li>
              </ul>
            </div>
          </div>
        </ModernCard>
      </div>
    </div>
  );
}