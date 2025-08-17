import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  Download, 
  FileText, 
  Users, 
  GraduationCap, 
  ClipboardList,
  UserCheck,
  BookOpen,
  Info,
  Upload
} from 'lucide-react';

interface CsvTemplate {
  id: string;
  name: string;
  filename: string;
  description: string;
  icon: React.ReactNode;
  category: 'users' | 'academic' | 'administrative';
  fields: string[];
  sampleCount: number;
}

const CsvTemplateManager: React.FC = () => {
  const { language } = useLanguage();

  const templates: CsvTemplate[] = [
    {
      id: 'students',
      name: 'Élèves / Students',
      filename: 'eleves-template.csv',
      description: 'Template pour importer les données des élèves avec informations parents',
      icon: <GraduationCap className="w-6 h-6" />,
      category: 'users',
      fields: ['prenom', 'nom', 'date_naissance', 'classe', 'telephone_parent', 'email_parent', 'adresse', 'sexe', 'numero_etudiant'],
      sampleCount: 5
    },
    {
      id: 'teachers',
      name: 'Enseignants / Teachers',
      filename: 'enseignants-template.csv',
      description: 'Template pour importer les données des enseignants avec matières et classes',
      icon: <Users className="w-6 h-6" />,
      category: 'users',
      fields: ['prenom', 'nom', 'email', 'telephone', 'matiere', 'classes_assignees', 'specialisation', 'diplome', 'experience_annees'],
      sampleCount: 5
    },
    {
      id: 'parents',
      name: 'Parents',
      filename: 'parents-template.csv',
      description: 'Template pour importer les données des parents avec liens aux enfants',
      icon: <UserCheck className="w-6 h-6" />,
      category: 'users',
      fields: ['prenom', 'nom', 'email', 'telephone', 'telephone_whatsapp', 'profession', 'enfants_numeros_etudiant', 'adresse_domicile', 'contact_urgence'],
      sampleCount: 5
    },
    {
      id: 'grades',
      name: 'Notes / Grades',
      filename: 'notes-template.csv',
      description: 'Template pour importer les notes et évaluations des élèves',
      icon: <BookOpen className="w-6 h-6" />,
      category: 'academic',
      fields: ['numero_etudiant', 'matiere', 'type_evaluation', 'note', 'note_max', 'date_evaluation', 'trimestre', 'commentaire', 'enseignant_email'],
      sampleCount: 5
    },
    {
      id: 'attendance',
      name: 'Présences / Attendance',
      filename: 'presences-template.csv',
      description: 'Template pour importer les données de présence et retards',
      icon: <ClipboardList className="w-6 h-6" />,
      category: 'administrative',
      fields: ['numero_etudiant', 'date', 'heure_arrivee', 'statut', 'motif_absence', 'classe', 'matiere', 'enseignant_email'],
      sampleCount: 5
    }
  ];

  const text = {
    fr: {
      title: 'Templates CSV',
      subtitle: 'Téléchargez les modèles CSV pour importer vos données',
      categories: {
        users: 'Utilisateurs',
        academic: 'Académique',
        administrative: 'Administratif'
      },
      download: 'Télécharger',
      fields: 'Champs',
      samples: 'Exemples',
      instructions: 'Instructions d\'utilisation',
      instructionsList: [
        'Téléchargez le template CSV correspondant à vos données',
        'Ouvrez le fichier dans Excel, Google Sheets ou LibreOffice',
        'Remplacez les données d\'exemple par vos vraies données',
        'Respectez le format et l\'ordre des colonnes',
        'Sauvegardez en format CSV (UTF-8)',
        'Utilisez la fonction d\'import dans le dashboard EducAfric'
      ],
      tips: 'Conseils importants',
      tipsList: [
        'Utilisez le point-virgule (;) pour séparer plusieurs valeurs dans une cellule',
        'Respectez le format des dates : YYYY-MM-DD (ex: 2025-08-14)',
        'Les numéros de téléphone doivent inclure l\'indicatif pays (+237)',
        'Les emails doivent être valides et uniques',
        'Ne modifiez pas les noms des colonnes (en-têtes)'
      ]
    },
    en: {
      title: 'CSV Templates',
      subtitle: 'Download CSV templates to import your data',
      categories: {
        users: 'Users',
        academic: 'Academic',
        administrative: 'Administrative'
      },
      download: 'Download',
      fields: 'Fields',
      samples: 'Samples',
      instructions: 'Usage Instructions',
      instructionsList: [
        'Download the CSV template matching your data type',
        'Open the file in Excel, Google Sheets or LibreOffice',
        'Replace sample data with your actual data',
        'Maintain column format and order',
        'Save as CSV (UTF-8) format',
        'Use the import function in EducAfric dashboard'
      ],
      tips: 'Important Tips',
      tipsList: [
        'Use semicolon (;) to separate multiple values in one cell',
        'Respect date format: YYYY-MM-DD (ex: 2025-08-14)',
        'Phone numbers must include country code (+237)',
        'Emails must be valid and unique',
        'Do not modify column names (headers)'
      ]
    }
  };

  const t = text[language as keyof typeof text];

  const handleDownloadTemplate = (template: CsvTemplate) => {
    const url = `/templates/csv/${template.filename}`;
    const link = document.createElement('a');
    link.href = url;
    link.download = template.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'users': return 'bg-blue-100 text-blue-800';
      case 'academic': return 'bg-green-100 text-green-800';
      case 'administrative': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const groupedTemplates = templates.reduce((acc, template) => {
    if (!acc[template.category]) {
      acc[template.category] = [];
    }
    acc[template.category].push(template);
    return acc;
  }, {} as Record<string, CsvTemplate[]>);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t.title}</h1>
          <p className="text-gray-600 mt-2">{t.subtitle}</p>
        </div>
        <Badge variant="outline" className="text-sm">
          {templates.length} Templates
        </Badge>
      </div>

      {/* Instructions Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center text-blue-900">
            <Info className="w-5 h-5 mr-2" />
            {t.instructions}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-blue-800">
          <ol className="list-decimal list-inside space-y-2">
            {t.instructionsList.map((instruction, index) => (
              <li key={index} className="text-sm">{instruction}</li>
            ))}
          </ol>
        </CardContent>
      </Card>

      {/* Templates by Category */}
      {Object.entries(groupedTemplates).map(([category, categoryTemplates]) => (
        <div key={category}>
          <div className="flex items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900 mr-3">
              {t.categories[category as keyof typeof t.categories]}
            </h2>
            <Badge className={getCategoryColor(category)}>
              {categoryTemplates.length} templates
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categoryTemplates.map((template) => (
              <Card key={template.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="p-2 bg-blue-100 rounded-lg mr-3">
                        {template.icon}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        <p className="text-sm text-gray-600">{template.filename}</p>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <p className="text-sm text-gray-700 mb-4">{template.description}</p>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">{t.fields}:</span>
                      <Badge variant="outline">{template.fields.length}</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">{t.samples}:</span>
                      <Badge variant="outline">{template.sampleCount}</Badge>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t">
                    <Button 
                      onClick={() => handleDownloadTemplate(template)}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      {t.download}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}

      {/* Tips Card */}
      <Card className="bg-yellow-50 border-yellow-200">
        <CardHeader>
          <CardTitle className="flex items-center text-yellow-900">
            <FileText className="w-5 h-5 mr-2" />
            {t.tips}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-yellow-800">
          <ul className="list-disc list-inside space-y-2">
            {t.tipsList.map((tip, index) => (
              <li key={index} className="text-sm">{tip}</li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Upload Info */}
      <Card className="bg-green-50 border-green-200">
        <CardContent className="p-4">
          <div className="flex items-start">
            <Upload className="w-6 h-6 text-green-600 mr-3 mt-1" />
            <div>
              <h3 className="font-semibold text-green-900 mb-2">Après téléchargement</h3>
              <p className="text-green-800 text-sm">
                Une fois vos templates remplis, utilisez la fonction "Import CSV" dans les modules correspondants 
                de votre dashboard EducAfric pour importer vos données automatiquement.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CsvTemplateManager;