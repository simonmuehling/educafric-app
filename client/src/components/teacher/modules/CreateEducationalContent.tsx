import React, { useState, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  BookOpen, Upload, Download, Eye, Plus, Edit, Save, 
  FileText, Image, Video, AudioLines, Target, Clock,
  Users, Star, Calendar, CheckSquare, X, Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ModernCard } from '@/components/ui/ModernCard';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

const CreateEducationalContent = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('lessons');
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [currentContent, setCurrentContent] = useState({
    title: '',
    description: '',
    type: 'lesson',
    subject: 'mathematiques',
    level: '6eme',
    duration: 60,
    objectives: '',
    materials: [],
    prerequisites: ''
  });
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const text = {
    fr: {
      title: 'Créer Contenu Pédagogique',
      subtitle: 'Développement de ressources éducatives et matériel pédagogique',
      lessons: 'Leçons',
      exercises: 'Exercices',
      resources: 'Ressources',
      templates: 'Modèles',
      createNew: 'Créer nouveau',
      contentTitle: 'Titre du contenu',
      description: 'Description',
      subject: 'Matière',
      level: 'Niveau',
      duration: 'Durée (minutes)',
      objectives: 'Objectifs pédagogiques',
      materials: 'Matériel nécessaire',
      prerequisites: 'Prérequis',
      addFiles: 'Ajouter des fichiers',
      save: 'Enregistrer',
      cancel: 'Annuler',
      preview: 'Aperçu',
      download: 'Télécharger',
      edit: 'Modifier',
      delete: 'Supprimer',
      lesson: 'Leçon',
      exercise: 'Exercice',
      assessment: 'Évaluation',
      project: 'Projet',
      presentation: 'Présentation',
      recentContent: 'Contenu récent',
      popularTemplates: 'Modèles populaires',
      myLibrary: 'Ma bibliothèque',
      sharedContent: 'Contenu partagé'
    },
    en: {
      title: 'Create Educational Content',
      subtitle: 'Development of educational resources and teaching materials',
      lessons: 'Lessons',
      exercises: 'Exercises',
      resources: 'Resources',
      templates: 'Templates',
      createNew: 'Create new',
      contentTitle: 'Content title',
      description: 'Description',
      subject: 'Subject',
      level: 'Level',
      duration: 'Duration (minutes)',
      objectives: 'Learning objectives',
      materials: 'Required materials',
      prerequisites: 'Prerequisites',
      addFiles: 'Add files',
      save: 'Save',
      cancel: 'Cancel',
      preview: 'Preview',
      download: 'Download',
      edit: 'Edit',
      delete: 'Delete',
      lesson: 'Lesson',
      exercise: 'Exercise',
      assessment: 'Assessment',
      project: 'Project',
      presentation: 'Presentation',
      recentContent: 'Recent content',
      popularTemplates: 'Popular templates',
      myLibrary: 'My library',
      sharedContent: 'Shared content'
    }
  };

  const t = text[language as keyof typeof text];

  const subjects = [
    { id: 'mathematiques', name: 'Mathématiques' },
    { id: 'francais', name: 'Français' },
    { id: 'anglais', name: 'Anglais' },
    { id: 'sciences', name: 'Sciences' },
    { id: 'histoire', name: 'Histoire-Géographie' },
    { id: 'physique', name: 'Physique-Chimie' },
    { id: 'svt', name: 'SVT' },
    { id: 'education', name: 'Éducation Civique' }
  ];

  const levels = [
    { id: '6eme', name: '6ème' },
    { id: '5eme', name: '5ème' },
    { id: '4eme', name: '4ème' },
    { id: '3eme', name: '3ème' },
    { id: '2nde', name: '2nde' },
    { id: '1ere', name: '1ère' },
    { id: 'tle', name: 'Terminale' }
  ];

  const contentTypes = [
    { id: 'lesson', name: t.lesson, icon: BookOpen, color: 'blue' },
    { id: 'exercise', name: t.exercise, icon: CheckSquare, color: 'green' },
    { id: 'assessment', name: t.assessment, icon: Star, color: 'yellow' },
    { id: 'project', name: t.project, icon: Target, color: 'purple' },
    { id: 'presentation', name: t.presentation, icon: FileText, color: 'red' }
  ];

  const recentContent = [
    {
      id: 1,
      title: 'Équations du premier degré',
      type: 'lesson',
      subject: 'Mathématiques',
      level: '4ème',
      duration: 60,
      lastModified: '2025-01-26',
      status: 'published'
    },
    {
      id: 2,
      title: 'Exercices sur les fractions',
      type: 'exercise',
      subject: 'Mathématiques',
      level: '5ème',
      duration: 45,
      lastModified: '2025-01-25',
      status: 'draft'
    },
    {
      id: 3,
      title: 'La Révolution française',
      type: 'presentation',
      subject: 'Histoire',
      level: '4ème',
      duration: 90,
      lastModified: '2025-01-24',
      status: 'published'
    },
    {
      id: 4,
      title: 'Contrôle de grammaire',
      type: 'assessment',
      subject: 'Français',
      level: '6ème',
      duration: 30,
      lastModified: '2025-01-23',
      status: 'published'
    }
  ];

  const popularTemplates = [
    {
      id: 1,
      title: 'Modèle de leçon interactive',
      description: 'Structure standard pour créer des leçons engageantes',
      type: 'lesson',
      downloads: 245,
      rating: 4.8
    },
    {
      id: 2,
      title: 'Fiche d\'exercices pratiques',
      description: 'Template pour créer des exercices structurés',
      type: 'exercise',
      downloads: 189,
      rating: 4.6
    },
    {
      id: 3,
      title: 'Grille d\'évaluation',
      description: 'Modèle pour évaluer les compétences des élèves',
      type: 'assessment',
      downloads: 167,
      rating: 4.7
    }
  ];

  const tabs = [
    { id: 'lessons', name: t.lessons, icon: BookOpen },
    { id: 'exercises', name: t.exercises, icon: CheckSquare },
    { id: 'resources', name: t.resources, icon: Upload },
    { id: 'templates', name: t.templates, icon: FileText }
  ];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event?.target?.files || []);
    setUploadedFiles(prev => [...prev, ...files]);
    
    toast({
      title: language === 'fr' ? 'Fichiers ajoutés' : 'Files added',
      description: `${(Array.isArray(files) ? files.length : 0)} ${language === 'fr' ? 'fichier(s) ajouté(s)' : 'file(s) added'}`
    });
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => (Array.isArray(prev) ? prev : []).filter((_, i) => i !== index));
  };

  const handleSaveContent = async () => {
    if (!currentContent.title || !currentContent.description) {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' ? 'Veuillez remplir tous les champs obligatoires' : 'Please fill in all required fields',
        variant: 'destructive'
      });
      return;
    }

    try {
      const formData = new FormData();
      formData.append('content', JSON.stringify(currentContent));
      
      uploadedFiles.forEach((file, index) => {
        formData.append(`file_${index}`, file);
      });

      await apiRequest('POST', '/api/educational-content', formData);
      
      toast({
        title: language === 'fr' ? 'Contenu créé' : 'Content created',
        description: language === 'fr' ? 'Le contenu pédagogique a été sauvegardé' : 'Educational content has been saved'
      });
      
      setIsCreateDialogOpen(false);
      setCurrentContent({
        title: '',
        description: '',
        type: 'lesson',
        subject: 'mathematiques',
        level: '6eme',
        duration: 60,
        objectives: '',
        materials: [],
        prerequisites: ''
      });
      setUploadedFiles([]);
      
    } catch (error) {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' ? 'Impossible de sauvegarder le contenu' : 'Failed to save content',
        variant: 'destructive'
      });
    }
  };

  const getContentTypeIcon = (type: string) => {
    const contentType = contentTypes.find(t => t.id === type);
    return contentType ? contentType.icon : BookOpen;
  };

  const getContentTypeColor = (type: string) => {
    const contentType = contentTypes.find(t => t.id === type);
    return contentType ? contentType.color : 'blue';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const filteredContent = (Array.isArray(recentContent) ? recentContent : []).filter(content =>
    content?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    content?.subject?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'lessons':
      case 'exercises':
        return (
          <div className="space-y-6">
            {/* Contenu récent */}
            <ModernCard className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">{t.recentContent}</h3>
                <div className="flex gap-2">
                  <Input
                    placeholder="Rechercher..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e?.target?.value)}
                    className="w-64"
                  />
                  <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    {t.createNew}
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(Array.isArray(filteredContent) ? filteredContent : []).map(content => {
                  const Icon = getContentTypeIcon(content.type);
                  const colorClass = getContentTypeColor(content.type);
                  
                  return (
                    <div key={content.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-center gap-2 mb-2">
                        <Icon className={`w-5 h-5 text-${colorClass}-600`} />
                        <Badge className={getStatusColor(content.status)}>
                          {content.status}
                        </Badge>
                      </div>
                      
                      <h4 className="font-semibold mb-2 line-clamp-2">{content.title || ''}</h4>
                      
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>{content.subject} - {content.level}</p>
                        <p className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {content.duration} min
                        </p>
                        <p>{content.lastModified}</p>
                      </div>
                      
                      <div className="flex gap-2 mt-3">
                        <Button size="sm" variant="outline" className="flex-1">
                          <Eye className="w-3 h-3 mr-1" />
                          {t.preview}
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1">
                          <Edit className="w-3 h-3 mr-1" />
                          {t.edit}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ModernCard>
          </div>
        );

      case 'resources':
        return (
          <div className="space-y-6">
            <ModernCard className="p-4">
              <h3 className="text-lg font-semibold mb-4">{t.myLibrary}</h3>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-700 mb-2">
                  Téléchargez vos ressources pédagogiques
                </h4>
                <p className="text-gray-500 mb-4">
                  Documents, images, vidéos, présentations...
                </p>
                <Button onClick={() => fileInputRef.current?.click()}>
                  <Upload className="w-4 h-4 mr-2" />
                  {t.addFiles}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png,.mp4,.mp3"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
              
              {(Array.isArray(uploadedFiles) ? uploadedFiles.length : 0) > 0 && (
                <div className="mt-6">
                  <h4 className="font-medium mb-3">Fichiers téléchargés</h4>
                  <div className="space-y-2">
                    {(Array.isArray(uploadedFiles) ? uploadedFiles : []).map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-blue-600" />
                          <span className="text-sm font-medium">{file.name || ''}</span>
                          <Badge variant="outline" className="text-xs">
                            {(file.size / 1024 / 1024).toFixed(1)} MB
                          </Badge>
                        </div>
                        <Button
                          onClick={() => removeFile(index)}
                          size="sm"
                          variant="outline"
                          className="text-red-600"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </ModernCard>
          </div>
        );

      case 'templates':
        return (
          <div className="space-y-6">
            <ModernCard className="p-4">
              <h3 className="text-lg font-semibold mb-4">{t.popularTemplates}</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(Array.isArray(popularTemplates) ? popularTemplates : []).map(template => (
                  <div key={template.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-5 h-5 text-blue-600" />
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="text-sm font-medium">{template.rating}</span>
                      </div>
                    </div>
                    
                    <h4 className="font-semibold mb-2">{template.title || ''}</h4>
                    <p className="text-sm text-gray-600 mb-3">{template.description || ''}</p>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                      <span>{template.downloads} téléchargements</span>
                      <Badge variant="outline">{template.type}</Badge>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Eye className="w-3 h-3 mr-1" />
                        Aperçu
                      </Button>
                      <Button size="sm" className="flex-1">
                        <Download className="w-3 h-3 mr-1" />
                        Utiliser
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ModernCard>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{t.title || ''}</h2>
          <p className="text-gray-600">{t.subtitle}</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          {t.createNew}
        </Button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <ModernCard className="p-4 text-center activity-card-blue">
          <div className="text-2xl font-bold text-gray-800">24</div>
          <div className="text-sm text-gray-600">Leçons créées</div>
        </ModernCard>
        <ModernCard className="p-4 text-center activity-card-green">
          <div className="text-2xl font-bold text-gray-800">18</div>
          <div className="text-sm text-gray-600">Exercices</div>
        </ModernCard>
        <ModernCard className="p-4 text-center activity-card-purple">
          <div className="text-2xl font-bold text-gray-800">12</div>
          <div className="text-sm text-gray-600">Évaluations</div>
        </ModernCard>
        <ModernCard className="p-4 text-center activity-card-orange">
          <div className="text-2xl font-bold text-gray-800">156</div>
          <div className="text-sm text-gray-600">Ressources</div>
        </ModernCard>
      </div>

      {/* Onglets */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {(Array.isArray(tabs) ? tabs : []).map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4" />
                  {tab.name || ''}
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Contenu des onglets */}
      {renderTabContent()}

      {/* Dialog Créer Contenu */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle>{t.createNew}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">{t.contentTitle}</label>
                <Input
                  value={currentContent.title || ''}
                  onChange={(e) => setCurrentContent(prev => ({ ...prev, title: e?.target?.value }))}
                  placeholder="Titre du contenu..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Type</label>
                <select
                  value={currentContent.type}
                  onChange={(e) => setCurrentContent(prev => ({ ...prev, type: e?.target?.value }))}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {(Array.isArray(contentTypes) ? contentTypes : []).map(type => (
                    <option key={type.id} value={type.id}>{type.name || ''}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">{t.description || ''}</label>
              <Textarea
                value={currentContent.description || ''}
                onChange={(e) => setCurrentContent(prev => ({ ...prev, description: e?.target?.value }))}
                placeholder="Description du contenu..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">{t.subject}</label>
                <select
                  value={currentContent.subject}
                  onChange={(e) => setCurrentContent(prev => ({ ...prev, subject: e?.target?.value }))}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {(Array.isArray(subjects) ? subjects : []).map(subject => (
                    <option key={subject.id} value={subject.id}>{subject.name || ''}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">{t.level}</label>
                <select
                  value={currentContent.level}
                  onChange={(e) => setCurrentContent(prev => ({ ...prev, level: e?.target?.value }))}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {(Array.isArray(levels) ? levels : []).map(level => (
                    <option key={level.id} value={level.id}>{level.name || ''}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">{t.duration}</label>
                <Input
                  type="number"
                  value={currentContent.duration}
                  onChange={(e) => setCurrentContent(prev => ({ ...prev, duration: parseInt(e?.target?.value) || 60 }))}
                  placeholder="60"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">{t.objectives}</label>
              <Textarea
                value={currentContent.objectives}
                onChange={(e) => setCurrentContent(prev => ({ ...prev, objectives: e?.target?.value }))}
                placeholder="Objectifs pédagogiques..."
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">{t.prerequisites}</label>
              <Textarea
                value={currentContent.prerequisites}
                onChange={(e) => setCurrentContent(prev => ({ ...prev, prerequisites: e?.target?.value }))}
                placeholder="Prérequis nécessaires..."
                rows={2}
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                {t.cancel}
              </Button>
              <Button onClick={handleSaveContent} className="bg-blue-600 hover:bg-blue-700">
                <Save className="w-4 h-4 mr-2" />
                {t.save}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CreateEducationalContent;