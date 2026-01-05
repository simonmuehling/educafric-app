import React, { useState, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { 
  BookOpen, Upload, Download, Eye, Plus, Edit, Save, 
  FileText, Image, Video, AudioLines, Target, Clock,
  Users, Star, Calendar, CheckSquare, X, Search, Share2, CheckCircle, Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ModernCard } from '@/components/ui/ModernCard';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const CreateEducationalContent = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('lessons');
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [contentToDelete, setContentToDelete] = useState<any>(null);
  const [selectedContent, setSelectedContent] = useState<any>(null);
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
  const [editContent, setEditContent] = useState({
    id: 0,
    title: '',
    description: '',
    type: 'lesson',
    subject: 'mathematiques',
    level: '6eme',
    duration: 60,
    objectives: '',
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
      level: 'Classe',
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
      level: 'Class',
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

  // Fetch teacher's assigned subjects from API
  const { data: teacherSubjects = [], isLoading: subjectsLoading } = useQuery<any[]>({
    queryKey: ['/api/teacher/subjects'],
    queryFn: async () => {
      const response = await fetch('/api/teacher/subjects', {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error('Failed to fetch subjects');
      const data = await response.json();
      return data.subjects || [];
    },
    enabled: !!user
  });

  // Fetch teacher's assigned classes for level selection (all schools)
  const { data: teacherClasses = [], isLoading: classesLoading } = useQuery<any[]>({
    queryKey: ['/api/teacher/classes'],
    queryFn: async () => {
      const response = await fetch('/api/teacher/classes', {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error('Failed to fetch classes');
      const data = await response.json();
      // Extract classes from ALL schools the teacher is assigned to
      const allClasses = data.schoolsWithClasses?.flatMap((school: any) => 
        (school.classes || []).map((cls: any) => ({
          ...cls,
          schoolName: school.schoolName
        }))
      ) || data.classes || [];
      return allClasses;
    },
    enabled: !!user
  });

  // Build subjects list from teacher's assigned subjects
  const subjects = teacherSubjects.length > 0 
    ? teacherSubjects.map((subj: any) => ({ 
        id: subj.id?.toString() || subj.name, 
        name: subj.nameFr || subj.name 
      }))
    : [
        { id: 'mathematiques', name: 'Mathématiques' },
        { id: 'francais', name: 'Français' },
        { id: 'anglais', name: 'Anglais' },
        { id: 'sciences', name: 'Sciences' },
        { id: 'histoire', name: 'Histoire-Géographie' },
        { id: 'physique', name: 'Physique-Chimie' },
        { id: 'svt', name: 'SVT' },
        { id: 'education', name: 'Éducation Civique' }
      ];

  // Build class list from teacher's assigned classes (full names)
  const levels = teacherClasses.length > 0
    ? teacherClasses.map((cls: any) => ({ 
        id: cls.id?.toString() || cls.name, 
        name: cls.name || cls.level || 'Classe' 
      }))
    : [
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

  // Fetch teacher's own content from database
  const { data: myContent = [], isLoading: contentLoading, refetch: refetchContent } = useQuery<any[]>({
    queryKey: ['/api/educational-content', 'my-content'],
    queryFn: async () => {
      const response = await fetch('/api/educational-content', {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) return [];
      const data = await response.json();
      return data.content || [];
    },
    enabled: !!user
  });

  // Fetch shared content from colleagues
  const { data: sharedContent = [], isLoading: sharedLoading } = useQuery<any[]>({
    queryKey: ['/api/educational-content/shared'],
    queryFn: async () => {
      const response = await fetch('/api/educational-content/shared', {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) return [];
      const data = await response.json();
      return data.content || [];
    },
    enabled: !!user
  });

  // Fetch templates
  const { data: templates = [], isLoading: templatesLoading } = useQuery<any[]>({
    queryKey: ['/api/educational-content/templates'],
    queryFn: async () => {
      const response = await fetch('/api/educational-content/templates', {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) return [];
      const data = await response.json();
      return data.templates || [];
    },
    enabled: !!user
  });

  // Format content for display
  const recentContent = myContent.map((item: any) => ({
    id: item.id,
    title: item.title || 'Sans titre',
    type: item.type || 'lesson',
    subject: item.subjectName || item.subject || 'Général',
    level: item.level || 'Non spécifié',
    duration: item.duration || 60,
    lastModified: item.updatedAt ? new Date(item.updatedAt).toLocaleDateString('fr-FR') : 'N/A',
    status: item.status || 'draft',
    teacherName: item.teacherName || 'Enseignant',
    visibility: item.visibility || 'private'
  }));

  // Format templates for display
  const popularTemplates = templates.length > 0 ? templates.map((item: any) => ({
    id: item.id,
    title: item.title || 'Modèle',
    description: item.description || 'Template éducatif',
    type: item.type || 'lesson',
    downloads: item.downloadCount || 0,
    rating: item.rating || 4.5
  })) : [
    {
      id: 'tpl-1',
      title: language === 'fr' ? 'Modèle de leçon interactive' : 'Interactive Lesson Template',
      description: language === 'fr' ? 'Structure standard pour créer des leçons engageantes' : 'Standard structure for creating engaging lessons',
      type: 'lesson',
      downloads: 0,
      rating: 4.8
    },
    {
      id: 'tpl-2',
      title: language === 'fr' ? 'Fiche d\'exercices pratiques' : 'Practical Exercise Sheet',
      description: language === 'fr' ? 'Template pour créer des exercices structurés' : 'Template for creating structured exercises',
      type: 'exercise',
      downloads: 0,
      rating: 4.6
    },
    {
      id: 'tpl-3',
      title: language === 'fr' ? 'Grille d\'évaluation' : 'Assessment Grid',
      description: language === 'fr' ? 'Modèle pour évaluer les compétences des élèves' : 'Template for assessing student skills',
      type: 'assessment',
      downloads: 0,
      rating: 4.7
    }
  ];

  // Content statistics from real data
  const contentStats = {
    lessons: myContent.filter((c: any) => c.type === 'lesson').length,
    exercises: myContent.filter((c: any) => c.type === 'exercise').length,
    assessments: myContent.filter((c: any) => c.type === 'assessment').length,
    resources: myContent.length
  };

  const tabs = [
    { id: 'lessons', name: t.lessons, icon: BookOpen },
    { id: 'exercises', name: t.exercises, icon: CheckSquare },
    { id: 'templates', name: t.templates, icon: FileText },
    { id: 'shared', name: language === 'fr' ? 'Contenu Partagé' : 'Shared Content', icon: Users }
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

  const shareContent = async (contentId: number) => {
    try {
      const response = await fetch(`/api/educational-content/${contentId}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ shareWithSchool: true })
      });

      if (response.ok) {
        toast({
          title: language === 'fr' ? "✅ Contenu partagé avec succès !" : "✅ Content shared successfully!",
          description: language === 'fr' 
            ? "Votre contenu est maintenant visible par tous les enseignants de votre école dans l'onglet 'Contenu Partagé'. Ils peuvent le prévisualiser et le copier." 
            : "Your content is now visible to all teachers in your school under 'Shared Content' tab. They can preview and copy it.",
          variant: "default"
        });
        refetchContent();
      }
    } catch (error) {
      toast({
        title: language === 'fr' ? "Erreur" : "Error",
        description: language === 'fr' ? "Impossible de partager le contenu" : "Failed to share content",
        variant: "destructive"
      });
    }
  };

  const unshareContent = async (contentId: number) => {
    try {
      const response = await fetch(`/api/educational-content/${contentId}/unshare`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });

      if (response.ok) {
        toast({
          title: language === 'fr' ? "🔒 Partage arrêté" : "🔒 Sharing stopped",
          description: language === 'fr' 
            ? "Ce contenu n'est plus visible par vos collègues. Il reste dans votre bibliothèque personnelle." 
            : "This content is no longer visible to your colleagues. It remains in your personal library.",
          variant: "default"
        });
        refetchContent();
      }
    } catch (error) {
      toast({
        title: language === 'fr' ? "Erreur" : "Error",
        description: language === 'fr' ? "Impossible d'arrêter le partage" : "Failed to stop sharing",
        variant: "destructive"
      });
    }
  };

  const submitForApproval = async (contentId: number) => {
    try {
      const response = await fetch(`/api/educational-content/${contentId}/submit-for-approval`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });

      if (response.ok) {
        toast({
          title: language === 'fr' ? "Soumis pour validation" : "Submitted for approval",
          description: language === 'fr' ? "Le contenu a été soumis au directeur pour validation" : "Content has been submitted to the director for approval",
          variant: "default"
        });
        refetchContent();
      }
    } catch (error) {
      toast({
        title: language === 'fr' ? "Erreur" : "Error",
        description: language === 'fr' ? "Impossible de soumettre le contenu" : "Failed to submit content",
        variant: "destructive"
      });
    }
  };

  const handleDeleteClick = (content: any) => {
    setContentToDelete(content);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteContent = async () => {
    if (!contentToDelete) return;
    
    try {
      const response = await fetch(`/api/educational-content/${contentToDelete.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });

      if (response.ok) {
        toast({
          title: language === 'fr' ? "✅ Contenu supprimé" : "✅ Content deleted",
          description: language === 'fr' 
            ? `"${contentToDelete.title}" a été supprimé définitivement.` 
            : `"${contentToDelete.title}" has been permanently deleted.`,
          variant: "default"
        });
        queryClient.invalidateQueries({ queryKey: ['/api/educational-content', 'my-content'] });
        refetchContent();
      } else {
        const data = await response.json();
        toast({
          title: language === 'fr' ? "Erreur" : "Error",
          description: data.message || (language === 'fr' ? "Impossible de supprimer le contenu" : "Failed to delete content"),
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: language === 'fr' ? "Erreur" : "Error",
        description: language === 'fr' ? "Impossible de supprimer le contenu" : "Failed to delete content",
        variant: "destructive"
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setContentToDelete(null);
    }
  };

  const handlePreview = (content: any) => {
    setSelectedContent(content);
    setIsPreviewDialogOpen(true);
  };

  const handleEdit = (content: any) => {
    setEditContent({
      id: content.id,
      title: content.title || '',
      description: content.description || '',
      type: content.type || 'lesson',
      subject: content.subject || 'mathematiques',
      level: content.level || '6eme',
      duration: content.duration || 60,
      objectives: content.objectives || '',
      prerequisites: content.prerequisites || ''
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateContent = async () => {
    if (!editContent.title || !editContent.description) {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' ? 'Veuillez remplir tous les champs obligatoires' : 'Please fill in all required fields',
        variant: 'destructive'
      });
      return;
    }

    try {
      const response = await fetch(`/api/educational-content/${editContent.id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editContent)
      });

      if (!response.ok) throw new Error('Failed to update content');

      toast({
        title: language === 'fr' ? 'Contenu modifié' : 'Content updated',
        description: language === 'fr' ? 'Le contenu a été mis à jour avec succès' : 'Content has been updated successfully'
      });

      setIsEditDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['/api/educational-content'] });
      refetchContent();
    } catch (error) {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' ? 'Impossible de modifier le contenu' : 'Failed to update content',
        variant: 'destructive'
      });
    }
  };

  const handleDownloadContent = async (content: any) => {
    try {
      const response = await fetch(`/api/educational-content/${content.id}/download`, {
        method: 'GET',
        credentials: 'include'
      });

      if (!response.ok) throw new Error('Failed to download');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${content.title || 'contenu'}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: language === 'fr' ? 'Téléchargement réussi' : 'Download successful',
        description: language === 'fr' ? 'Le contenu a été téléchargé' : 'Content has been downloaded'
      });
    } catch (error) {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' ? 'Impossible de télécharger le contenu' : 'Failed to download content',
        variant: 'destructive'
      });
    }
  };

  const handleUseTemplate = async (template: any) => {
    setCurrentContent({
      title: `${template.title} - ${language === 'fr' ? 'Copie' : 'Copy'}`,
      description: template.description || '',
      type: template.type || 'lesson',
      subject: template.subject || 'mathematiques',
      level: template.level || '6eme',
      duration: template.duration || 60,
      objectives: template.objectives || '',
      materials: [],
      prerequisites: template.prerequisites || ''
    });
    setIsCreateDialogOpen(true);
    toast({
      title: language === 'fr' ? 'Modèle chargé' : 'Template loaded',
      description: language === 'fr' ? 'Vous pouvez maintenant personnaliser ce modèle' : 'You can now customize this template'
    });
  };

  const handleCopySharedContent = async (content: any) => {
    try {
      const response = await fetch(`/api/educational-content/${content.id}/copy`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        toast({
          title: language === 'fr' ? 'Contenu copié' : 'Content copied',
          description: language === 'fr' ? 'Le contenu a été ajouté à votre bibliothèque' : 'Content has been added to your library'
        });
        queryClient.invalidateQueries({ queryKey: ['/api/educational-content'] });
        refetchContent();
      } else {
        throw new Error('Failed to copy');
      }
    } catch (error) {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' ? 'Impossible de copier le contenu' : 'Failed to copy content',
        variant: 'destructive'
      });
    }
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

      const response = await fetch('/api/educational-content', {
        method: 'POST',
        credentials: 'include',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('Failed to save content');
      }
      
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
                    placeholder={language === 'fr' ? 'Rechercher...' : 'Search...'}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e?.target?.value)}
                    className="w-64"
                  />
                  <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2" />
                    {t.createNew}
                  </Button>
                </div>
              </div>
              
              {/* Loading state */}
              {contentLoading && (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-500 mt-2">{language === 'fr' ? 'Chargement de vos contenus...' : 'Loading your content...'}</p>
                </div>
              )}
              
              {/* Empty state */}
              {!contentLoading && filteredContent.length === 0 && (
                <div className="text-center py-8">
                  <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <h4 className="font-medium text-gray-700 mb-2">
                    {language === 'fr' ? 'Aucun contenu créé' : 'No Content Created'}
                  </h4>
                  <p className="text-sm text-gray-500 mb-4">
                    {language === 'fr' 
                      ? 'Vous n\'avez pas encore créé de contenu pédagogique. Commencez maintenant!' 
                      : 'You haven\'t created any educational content yet. Start now!'}
                  </p>
                  <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    {t.createNew}
                  </Button>
                </div>
              )}
              
              {!contentLoading && filteredContent.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {(Array.isArray(filteredContent) ? filteredContent : []).map(content => {
                  const Icon = getContentTypeIcon(content.type);
                  const colorClass = getContentTypeColor(content.type);
                  
                  return (
                    <div key={content.id} className="border rounded-lg p-3 sm:p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-2 mb-2">
                        <Icon className={`w-4 h-4 sm:w-5 sm:h-5 text-${colorClass}-600`} />
                        <Badge className={`text-xs ${getStatusColor(content.status)}`}>
                          {content.status}
                        </Badge>
                      </div>
                      
                      <h4 className="font-semibold mb-2 text-sm sm:text-base line-clamp-2">{content.title || ''}</h4>
                      
                      <div className="text-xs sm:text-sm text-gray-600 space-y-1 mb-3">
                        <p className="truncate">{content.subject} - {content.level}</p>
                        <p className="flex items-center gap-1">
                          <Clock className="w-3 h-3 flex-shrink-0" />
                          <span>{content.duration} min</span>
                        </p>
                        <p className="text-xs">{content.lastModified}</p>
                      </div>
                      
                      {/* Actions responsive */}
                      <div className="space-y-2">
                        {/* Première ligne d'actions */}
                        <div className="flex gap-1 sm:gap-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="flex-1 text-xs sm:text-sm px-2 sm:px-3"
                            onClick={() => handlePreview(content)}
                            data-testid={`button-preview-${content.id}`}
                          >
                            <Eye className="w-3 h-3 sm:mr-1" />
                            <span className="hidden sm:inline">{t.preview}</span>
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="flex-1 text-xs sm:text-sm px-2 sm:px-3"
                            onClick={() => handleEdit(content)}
                            data-testid={`button-edit-${content.id}`}
                          >
                            <Edit className="w-3 h-3 sm:mr-1" />
                            <span className="hidden sm:inline">{t.edit}</span>
                          </Button>
                        </div>
                        
                        {/* Deuxième ligne d'actions */}
                        <div className="flex gap-1 sm:gap-2">
                          {content.visibility === 'school' || content.visibility === 'public' ? (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => unshareContent(content.id)}
                              className="flex-1 text-xs sm:text-sm px-2 sm:px-3 text-orange-600 hover:text-orange-700 border-orange-300"
                            >
                              <X className="w-3 h-3 sm:mr-1" />
                              <span className="hidden sm:inline">{language === 'fr' ? 'Arrêter partage' : 'Stop sharing'}</span>
                            </Button>
                          ) : (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => shareContent(content.id)}
                              className="flex-1 text-xs sm:text-sm px-2 sm:px-3 text-blue-600 hover:text-blue-700"
                            >
                              <Share2 className="w-3 h-3 sm:mr-1" />
                              <span className="hidden sm:inline">{language === 'fr' ? 'Partager' : 'Share'}</span>
                            </Button>
                          )}
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => submitForApproval(content.id)}
                            className="flex-1 text-xs sm:text-sm px-2 sm:px-3 text-green-600 hover:text-green-700"
                          >
                            <CheckCircle className="w-3 h-3 sm:mr-1" />
                            <span className="hidden sm:inline">{language === 'fr' ? 'Soumettre' : 'Submit'}</span>
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleDeleteClick(content)}
                            className="text-xs sm:text-sm px-2 sm:px-3 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-300"
                            data-testid={`button-delete-${content.id}`}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
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
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {(Array.isArray(popularTemplates) ? popularTemplates : []).map(template => (
                  <div key={template.id} className="border rounded-lg p-3 sm:p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="text-xs sm:text-sm font-medium">{template.rating}</span>
                      </div>
                    </div>
                    
                    <h4 className="font-semibold mb-2 text-sm sm:text-base line-clamp-2">{template.title || ''}</h4>
                    <p className="text-xs sm:text-sm text-gray-600 mb-3 line-clamp-3">{template.description || ''}</p>
                    
                    <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500 mb-3">
                      <span className="truncate">{template.downloads} téléchargements</span>
                      <Badge variant="outline" className="text-xs ml-2">{template.type}</Badge>
                    </div>
                    
                    <div className="flex gap-1 sm:gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1 text-xs sm:text-sm px-2 sm:px-3"
                        onClick={() => handlePreview(template)}
                        data-testid={`button-preview-template-${template.id}`}
                      >
                        <Eye className="w-3 h-3 sm:mr-1" />
                        <span className="hidden sm:inline">Aperçu</span>
                      </Button>
                      <Button 
                        size="sm" 
                        className="flex-1 text-xs sm:text-sm px-2 sm:px-3 bg-blue-600 hover:bg-blue-700"
                        onClick={() => handleUseTemplate(template)}
                        data-testid={`button-use-template-${template.id}`}
                      >
                        <Download className="w-3 h-3 sm:mr-1" />
                        <span className="hidden sm:inline">Utiliser</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ModernCard>
          </div>
        );

      case 'shared':
        return (
          <div className="space-y-6">
            <ModernCard className="p-4">
              <h3 className="text-lg font-semibold mb-4">
                {language === 'fr' ? 'Contenu Partagé par les Collègues' : 'Content Shared by Colleagues'}
              </h3>
              
              {/* Loading state */}
              {sharedLoading && (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-500 mt-2">{language === 'fr' ? 'Chargement...' : 'Loading...'}</p>
                </div>
              )}
              
              {/* Contenu partagé par les collègues - données réelles */}
              {!sharedLoading && sharedContent.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sharedContent.map((content: any) => {
                    const Icon = getContentTypeIcon(content.type || 'lesson');
                    const colorClass = getContentTypeColor(content.type || 'lesson');
                    
                    return (
                      <div key={content.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-2 mb-3">
                          <Icon className={`w-5 h-5 text-${colorClass}-600`} />
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            <span className="text-sm font-medium">{content.rating || 4.5}</span>
                          </div>
                          <Badge variant="outline" className="ml-auto text-xs">
                            {content.type === 'lesson' ? 'Leçon' : 
                             content.type === 'exercise' ? 'Exercice' : 'Évaluation'}
                          </Badge>
                        </div>
                        
                        <h4 className="font-semibold mb-2 text-sm sm:text-base line-clamp-2">{content.title || 'Sans titre'}</h4>
                        
                        <div className="text-xs sm:text-sm text-gray-600 space-y-1 mb-3">
                          <p><strong>{language === 'fr' ? 'Auteur' : 'Author'}:</strong> {content.teacherName || 'Enseignant'}</p>
                          <p><strong>{language === 'fr' ? 'Matière' : 'Subject'}:</strong> {content.subjectName || content.subject || 'Général'} - {content.level || 'N/A'}</p>
                          <p><strong>{language === 'fr' ? 'Partagé le' : 'Shared on'}:</strong> {content.createdAt ? new Date(content.createdAt).toLocaleDateString('fr-FR') : 'N/A'}</p>
                          <p className="flex items-center gap-1">
                            <Download className="w-3 h-3" />
                            {content.downloadCount || 0} {language === 'fr' ? 'téléchargements' : 'downloads'}
                          </p>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="flex-1 text-xs sm:text-sm"
                            onClick={() => handlePreview(content)}
                            data-testid={`button-preview-shared-${content.id}`}
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            <span className="hidden sm:inline">{t.preview}</span>
                            <span className="sm:hidden">{language === 'fr' ? 'Voir' : 'View'}</span>
                          </Button>
                          <Button 
                            size="sm" 
                            className="flex-1 text-xs sm:text-sm bg-green-600 hover:bg-green-700"
                            onClick={() => handleCopySharedContent(content)}
                            data-testid={`button-copy-shared-${content.id}`}
                          >
                            <Download className="w-3 h-3 mr-1" />
                            <span className="hidden sm:inline">{language === 'fr' ? 'Copier' : 'Copy'}</span>
                            <span className="sm:hidden">+</span>
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              
              {/* Message si aucun contenu partagé */}
              {!sharedLoading && sharedContent.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <h4 className="font-medium mb-2">
                    {language === 'fr' ? 'Aucun contenu partagé' : 'No Shared Content'}
                  </h4>
                  <p className="text-sm">
                    {language === 'fr' 
                      ? 'Aucun collègue n\'a encore partagé de contenu. Soyez le premier à partager vos ressources pédagogiques!' 
                      : 'No colleagues have shared content yet. Be the first to share your educational resources!'}
                  </p>
                </div>
              )}
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

      {/* Statistiques - Données réelles */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
        <ModernCard className="p-3 sm:p-4 text-center activity-card-blue">
          <div className="text-xl sm:text-2xl font-bold text-gray-800">{contentStats.lessons}</div>
          <div className="text-xs sm:text-sm text-gray-600 leading-tight">{language === 'fr' ? 'Leçons créées' : 'Lessons Created'}</div>
        </ModernCard>
        <ModernCard className="p-3 sm:p-4 text-center activity-card-green">
          <div className="text-xl sm:text-2xl font-bold text-gray-800">{contentStats.exercises}</div>
          <div className="text-xs sm:text-sm text-gray-600 leading-tight">{language === 'fr' ? 'Exercices' : 'Exercises'}</div>
        </ModernCard>
        <ModernCard className="p-3 sm:p-4 text-center activity-card-purple">
          <div className="text-xl sm:text-2xl font-bold text-gray-800">{contentStats.assessments}</div>
          <div className="text-xs sm:text-sm text-gray-600 leading-tight">{language === 'fr' ? 'Évaluations' : 'Assessments'}</div>
        </ModernCard>
        <ModernCard className="p-3 sm:p-4 text-center activity-card-orange">
          <div className="text-xl sm:text-2xl font-bold text-gray-800">{contentStats.resources}</div>
          <div className="text-xs sm:text-sm text-gray-600 leading-tight">{language === 'fr' ? 'Total Ressources' : 'Total Resources'}</div>
        </ModernCard>
      </div>

      {/* Onglets - Version Mobile Améliorée */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-2 sm:space-x-4 md:space-x-8 overflow-x-auto scrollbar-hide">
          {(Array.isArray(tabs) ? tabs : []).map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 sm:py-4 px-2 sm:px-3 md:px-4 border-b-2 font-medium text-xs sm:text-sm md:text-base whitespace-nowrap flex-shrink-0 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
                  <Icon className="w-4 h-4" />
                  <span className="text-xs sm:text-sm leading-tight">
                    {/* Texte adaptatif pour mobile */}
                    <span className="block sm:hidden">
                      {tab.id === 'lessons' ? 'Leçons' :
                       tab.id === 'exercises' ? 'Exercices' :
                       tab.id === 'templates' ? 'Modèles' :
                       tab.id === 'shared' ? 'Partagé' : tab.name}
                    </span>
                    <span className="hidden sm:block">
                      {tab.name || ''}
                    </span>
                  </span>
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

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
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

      {/* Dialog Aperçu */}
      <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-blue-600" />
              {language === 'fr' ? 'Aperçu du contenu' : 'Content Preview'}
            </DialogTitle>
          </DialogHeader>
          {selectedContent && (
            <div className="space-y-4">
              <div className="border-b pb-4">
                <h3 className="text-xl font-bold text-gray-900">{selectedContent.title || 'Sans titre'}</h3>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge variant="outline">{selectedContent.type || 'lesson'}</Badge>
                  <Badge variant="secondary">{selectedContent.subject || 'Général'}</Badge>
                  <Badge>{selectedContent.level || 'N/A'}</Badge>
                  {selectedContent.status && (
                    <Badge className={`${
                      selectedContent.status === 'approved' ? 'bg-green-100 text-green-800' :
                      selectedContent.status === 'pending_approval' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedContent.status}
                    </Badge>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-700 mb-2">
                  {language === 'fr' ? 'Description' : 'Description'}
                </h4>
                <p className="text-gray-600">{selectedContent.description || 'Aucune description'}</p>
              </div>

              {selectedContent.objectives && (
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">
                    {language === 'fr' ? 'Objectifs pédagogiques' : 'Learning Objectives'}
                  </h4>
                  <p className="text-gray-600">{selectedContent.objectives}</p>
                </div>
              )}

              {selectedContent.prerequisites && (
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">
                    {language === 'fr' ? 'Prérequis' : 'Prerequisites'}
                  </h4>
                  <p className="text-gray-600">{selectedContent.prerequisites}</p>
                </div>
              )}

              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{selectedContent.duration || 60} min</span>
                </div>
                {selectedContent.teacherName && (
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{selectedContent.teacherName}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2 justify-end pt-4 border-t">
                <Button variant="outline" onClick={() => setIsPreviewDialogOpen(false)}>
                  {language === 'fr' ? 'Fermer' : 'Close'}
                </Button>
                <Button 
                  onClick={() => {
                    setIsPreviewDialogOpen(false);
                    handleDownloadContent(selectedContent);
                  }}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {language === 'fr' ? 'Télécharger' : 'Download'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog Modifier */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="w-5 h-5 text-orange-600" />
              {language === 'fr' ? 'Modifier le contenu' : 'Edit Content'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">{t.contentTitle}</label>
                <Input
                  value={editContent.title || ''}
                  onChange={(e) => setEditContent(prev => ({ ...prev, title: e?.target?.value }))}
                  placeholder="Titre du contenu..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Type</label>
                <select
                  value={editContent.type}
                  onChange={(e) => setEditContent(prev => ({ ...prev, type: e?.target?.value }))}
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
                value={editContent.description || ''}
                onChange={(e) => setEditContent(prev => ({ ...prev, description: e?.target?.value }))}
                placeholder="Description du contenu..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">{t.subject}</label>
                <select
                  value={editContent.subject}
                  onChange={(e) => setEditContent(prev => ({ ...prev, subject: e?.target?.value }))}
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
                  value={editContent.level}
                  onChange={(e) => setEditContent(prev => ({ ...prev, level: e?.target?.value }))}
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
                  value={editContent.duration}
                  onChange={(e) => setEditContent(prev => ({ ...prev, duration: parseInt(e?.target?.value) || 60 }))}
                  placeholder="60"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">{t.objectives}</label>
              <Textarea
                value={editContent.objectives}
                onChange={(e) => setEditContent(prev => ({ ...prev, objectives: e?.target?.value }))}
                placeholder="Objectifs pédagogiques..."
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">{t.prerequisites}</label>
              <Textarea
                value={editContent.prerequisites}
                onChange={(e) => setEditContent(prev => ({ ...prev, prerequisites: e?.target?.value }))}
                placeholder="Prérequis nécessaires..."
                rows={2}
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                {t.cancel}
              </Button>
              <Button onClick={handleUpdateContent} className="bg-orange-600 hover:bg-orange-700">
                <Save className="w-4 h-4 mr-2" />
                {language === 'fr' ? 'Mettre à jour' : 'Update'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {language === 'fr' ? 'Confirmer la suppression' : 'Confirm Deletion'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {language === 'fr' 
                ? `Êtes-vous sûr de vouloir supprimer "${contentToDelete?.title}" ? Cette action est irréversible.`
                : `Are you sure you want to delete "${contentToDelete?.title}"? This action cannot be undone.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDeleteDialogOpen(false)}>
              {language === 'fr' ? 'Annuler' : 'Cancel'}
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteContent}
              className="bg-red-600 hover:bg-red-700"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {language === 'fr' ? 'Supprimer' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

// SharedContentGrid Component
interface SharedContentGridProps {
  language: string;
  toast: any;
}

const SharedContentGrid: React.FC<SharedContentGridProps> = ({ language, toast }) => {
  const queryClient = useQueryClient();

  // Fetch shared content
  const { data: sharedData, isLoading } = useQuery({
    queryKey: ['/api/educational-content/shared'],
    refetchInterval: 60000
  });

  // Download content mutation
  const downloadMutation = useMutation({
    mutationFn: async (contentId: number) => {
      const response = await fetch(`/api/educational-content/${contentId}`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to download content');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: language === 'fr' ? "Contenu téléchargé" : "Content downloaded",
        description: language === 'fr' ? "Le contenu a été ajouté à votre bibliothèque" : "Content has been added to your library",
        variant: "default"
      });
    },
    onError: () => {
      toast({
        title: language === 'fr' ? "Erreur" : "Error",
        description: language === 'fr' ? "Impossible de télécharger le contenu" : "Failed to download content",
        variant: "destructive"
      });
    }
  });

  const sharedContent = (sharedData as any)?.sharedContent || [];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'lesson': return <BookOpen className="w-4 h-4" />;
      case 'exercise': return <CheckSquare className="w-4 h-4" />;
      case 'assessment': return <Star className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'lesson': return language === 'fr' ? 'Leçon' : 'Lesson';
      case 'exercise': return language === 'fr' ? 'Exercice' : 'Exercise';
      case 'assessment': return language === 'fr' ? 'Évaluation' : 'Assessment';
      case 'project': return language === 'fr' ? 'Projet' : 'Project';
      default: return type;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-24 bg-gray-200 rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  if (sharedContent.length === 0) {
    return (
      <div className="text-center py-8">
        <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">
          {language === 'fr' ? 'Aucun contenu partagé' : 'No shared content'}
        </h3>
        <p className="text-gray-600">
          {language === 'fr' 
            ? 'Vos collègues n\'ont pas encore partagé de contenu avec vous.' 
            : 'Your colleagues haven\'t shared any content with you yet.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sharedContent.map((content: any) => (
        <div key={content.id} className="border rounded-lg p-4 hover:bg-gray-50">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                {getTypeIcon(content.type)}
                <h4 className="text-lg font-semibold">{content.title}</h4>
                <Badge variant="outline">{getTypeLabel(content.type)}</Badge>
                <Badge variant="secondary">{content.subject}</Badge>
                <Badge variant="outline">{content.level}</Badge>
              </div>
              
              <p className="text-gray-600 mb-3">{content.description}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Users className="w-4 h-4" />
                  <span>{language === 'fr' ? 'Partagé par' : 'Shared by'} {content.sharedBy}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(content.sharedAt)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Clock className="w-4 h-4" />
                  <span>{content.duration} min</span>
                </div>
              </div>

              {content.objectives && (
                <div className="mb-3">
                  <strong className="text-sm">
                    {language === 'fr' ? 'Objectifs:' : 'Objectives:'}
                  </strong>
                  <p className="text-sm text-gray-600">{content.objectives}</p>
                </div>
              )}

              {content.files.length > 0 && (
                <div className="mb-3">
                  <strong className="text-sm">
                    {language === 'fr' ? 'Fichiers joints:' : 'Attached files:'}
                  </strong>
                  <div className="flex gap-2 mt-1">
                    {content.files.map((file: any, index: number) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        <FileText className="w-3 h-3 mr-1" />
                        {file.originalName}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-1">
                {content.tags.map((tag: string, index: number) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2 ml-4">
              <Button
                onClick={() => downloadMutation.mutate(content.id)}
                className="bg-blue-600 hover:bg-blue-700"
                disabled={downloadMutation.isPending}
              >
                <Download className="w-4 h-4 mr-2" />
                {language === 'fr' ? 'Télécharger' : 'Download'}
              </Button>
              <Button variant="outline" size="sm">
                <Eye className="w-4 h-4 mr-2" />
                {language === 'fr' ? 'Aperçu' : 'Preview'}
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CreateEducationalContent;