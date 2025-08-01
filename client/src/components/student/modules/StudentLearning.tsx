import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { ModernCard } from '@/components/ui/ModernCard';
import { 
  Book, Play, FileText, Video, BookOpen, 
  Award, Clock, Download, ExternalLink, AlertCircle
} from 'lucide-react';

interface LearningResource {
  id: number;
  title: string;
  description: string;
  type: 'video' | 'document' | 'quiz' | 'exercise';
  subject: string;
  level: string;
  duration: string;
  url?: string;
  completed: boolean;
  progress: number;
}

interface Subject {
  id: number;
  name: string;
  icon: string;
  resourceCount: number;
  completedCount: number;
}

const StudentLearning = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);

  const openResource = async (resource: LearningResource) => {
    try {
      if (resource.url) {
        window.open(resource.url, '_blank');
      } else {
        // Fetch resource URL from API if not available
        const response = await fetch(`/api/student/learning/${resource.id}/access`);
        if (!response.ok) throw new Error('Failed to access resource');
        
        const data = await response.json();
        if (data.url) {
          window.open(data.url, '_blank');
        }
      }
      
      toast({
        title: language === 'fr' ? 'Ressource ouverte' : 'Resource opened',
        description: language === 'fr' ? `Ouverture de "${resource.title || ''}"` : `Opening "${resource.title || ''}"`
      });
    } catch (error) {
      toast({
        title: language === 'fr' ? 'Erreur d\'accès' : 'Access error',
        description: language === 'fr' ? 'Impossible d\'ouvrir la ressource' : 'Failed to open resource',
        variant: 'destructive'
      });
    }
  };

  const downloadResource = async (resource: LearningResource) => {
    setIsDownloading(true);
    try {
      const response = await fetch(`/api/student/learning/${resource.id}/download`);
      if (!response.ok) throw new Error('Download failed');
      
      const blob = await response.blob();
      const url = window?.URL?.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${resource.title || ''}.${resource.type === 'video' ? 'mp4' : 'pdf'}`;
      document?.body?.appendChild(a);
      a.click();
      window?.URL?.revokeObjectURL(url);
      document?.body?.removeChild(a);
      
      toast({
        title: language === 'fr' ? 'Téléchargement réussi' : 'Download successful',
        description: language === 'fr' ? `"${resource.title || ''}" téléchargé` : `"${resource.title || ''}" downloaded`
      });
    } catch (error) {
      toast({
        title: language === 'fr' ? 'Erreur de téléchargement' : 'Download error',
        description: language === 'fr' ? 'Impossible de télécharger la ressource' : 'Failed to download resource',
        variant: 'destructive'
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const text = {
    fr: {
      title: 'Apprentissage',
      subtitle: 'Ressources pédagogiques et matériel d\'étude',
      subjects: 'Matières',
      allSubjects: 'Toutes les matières',
      resources: 'Ressources',
      allTypes: 'Tous les types',
      video: 'Vidéo',
      document: 'Document',
      quiz: 'Quiz',
      exercise: 'Exercice',
      duration: 'Durée',
      level: 'Niveau',
      progress: 'Progrès',
      completed: 'Terminé',
      notStarted: 'Non commencé',
      inProgress: 'En cours',
      startLearning: 'Commencer l\'apprentissage',
      continueLearning: 'Continuer l\'apprentissage',
      openResource: 'Ouvrir la ressource',
      downloadResource: 'Télécharger',
      loading: 'Chargement des ressources...',
      error: 'Erreur lors du chargement des ressources',
      noResources: 'Aucune ressource disponible',
      totalResources: 'Ressources totales',
      completedResources: 'Ressources terminées',
      studyTime: 'Temps d\'étude',
      certificates: 'Certificats'
    },
    en: {
      title: 'Learning',
      subtitle: 'Educational resources and study materials',
      subjects: 'Subjects',
      allSubjects: 'All subjects',
      resources: 'Resources',
      allTypes: 'All types',
      video: 'Video',
      document: 'Document',
      quiz: 'Quiz',
      exercise: 'Exercise',
      duration: 'Duration',
      level: 'Level',
      progress: 'Progress',
      completed: 'Completed',
      notStarted: 'Not started',
      inProgress: 'In progress',
      startLearning: 'Start learning',
      continueLearning: 'Continue learning',
      openResource: 'Open resource',
      downloadResource: 'Download',
      loading: 'Loading resources...',
      error: 'Error loading resources',
      noResources: 'No resources available',
      totalResources: 'Total resources',
      completedResources: 'Completed resources',
      studyTime: 'Study time',
      certificates: 'Certificates'
    }
  };

  const t = text[language as keyof typeof text];

  // Fetch learning resources from API
  const { data: resources = [], isLoading, error } = useQuery({
    queryKey: ['/api/student/learning', user?.id, selectedSubject, selectedType],
    queryFn: async () => {
      let url = `/api/student/learning?studentId=${user?.id}`;
      if (selectedSubject) url += `&subjectId=${selectedSubject}`;
      if (selectedType) url += `&type=${selectedType}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch learning resources');
      }
      return response.json();
    },
    enabled: !!user?.id
  });

  // Fetch subjects for filter
  const { data: subjects = [] } = useQuery({
    queryKey: ['/api/student/subjects'],
    queryFn: async () => {
      const response = await fetch(`/api/student/subjects?studentId=${user?.id}`);
      if (!response.ok) throw new Error('Failed to fetch subjects');
      return response.json();
    },
    enabled: !!user?.id
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="w-5 h-5 text-red-500" />;
      case 'document': return <FileText className="w-5 h-5 text-blue-500" />;
      case 'quiz': return <Award className="w-5 h-5 text-purple-500" />;
      case 'exercise': return <BookOpen className="w-5 h-5 text-green-500" />;
      default: return <Book className="w-5 h-5 text-gray-500" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'video': return 'bg-red-100 text-red-700';
      case 'document': return 'bg-blue-100 text-blue-700';
      case 'quiz': return 'bg-purple-100 text-purple-700';
      case 'exercise': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress === 0) return 'bg-gray-200';
    if (progress < 50) return 'bg-orange-400';
    if (progress < 100) return 'bg-blue-400';
    return 'bg-green-400';
  };

  const getProgressText = (progress: number) => {
    if (progress === 0) return t.notStarted;
    if (progress < 100) return t.inProgress;
    return t.completed;
  };

  // Calculate statistics
  const totalResources = (Array.isArray(resources) ? resources.length : 0);
  const completedResources = (Array.isArray(resources) ? resources : []).filter((r: LearningResource) => r.completed).length;
  const totalStudyTime = (Array.isArray(resources) ? resources : []).reduce((sum: number, r: LearningResource) => {
    const minutes = parseInt(r?.duration?.replace('min', '')) || 0;
    return sum + minutes;
  }, 0);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8 text-gray-500">
          {t.loading}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">{t.error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">{t.title || ''}</h2>
        <p className="text-gray-600 mb-6">{t.subtitle}</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <ModernCard gradient="blue">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Book className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">{t.totalResources}</p>
              <p className="text-2xl font-bold text-gray-900">{totalResources}</p>
            </div>
          </div>
        </ModernCard>

        <ModernCard gradient="green">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <Award className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">{t.completedResources}</p>
              <p className="text-2xl font-bold text-gray-900">{completedResources}</p>
            </div>
          </div>
        </ModernCard>

        <ModernCard gradient="purple">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">{t.studyTime}</p>
              <p className="text-2xl font-bold text-gray-900">{totalStudyTime}min</p>
            </div>
          </div>
        </ModernCard>

        <ModernCard gradient="orange">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-orange-100 rounded-lg">
              <Award className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">{t.certificates}</p>
              <p className="text-2xl font-bold text-gray-900">
                {(Array.isArray(resources) ? resources : []).filter((r: LearningResource) => r.completed && r.type === 'quiz').length}
              </p>
            </div>
          </div>
        </ModernCard>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{t.subjects}</label>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e?.target?.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">{t.allSubjects}</option>
            {(Array.isArray(subjects) ? subjects : []).map((subject: Subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name || ''} ({subject.resourceCount})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{t.resources}</label>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e?.target?.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">{t.allTypes}</option>
            <option value="video">{t.video}</option>
            <option value="document">{t.document}</option>
            <option value="quiz">{t.quiz}</option>
            <option value="exercise">{t.exercise}</option>
          </select>
        </div>
      </div>

      {/* Resources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(Array.isArray(resources) ? resources.length : 0) > 0 ? (
          (Array.isArray(resources) ? resources : []).map((resource: LearningResource) => (
            <ModernCard key={resource.id} gradient="default">
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      {getTypeIcon(resource.type)}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                        {resource.title || ''}
                      </h3>
                      <p className="text-sm text-gray-600">{resource.subject}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(resource.type)}`}>
                    {t[resource.type as keyof typeof t] || resource.type}
                  </span>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-600 line-clamp-3">{resource.description || ''}</p>

                {/* Metadata */}
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{resource.duration}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Book className="w-4 h-4" />
                    <span>{resource.level}</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{t.progress}</span>
                    <span className="font-medium text-gray-900">{resource.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${getProgressColor(resource.progress)}`}
                      style={{ width: `${resource.progress}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500">{getProgressText(resource.progress)}</p>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2 pt-2">
                  <button
                    onClick={() => openResource(resource)}
                    className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Play className="w-4 h-4" />
                    <span className="text-sm">
                      {resource.progress === 0 ? t.startLearning : 
                       resource.progress < 100 ? t.continueLearning : t.openResource}
                    </span>
                  </button>
                  
                  {resource.type === 'document' && (
                    <button
                      onClick={() => downloadResource(resource)}
                      disabled={isDownloading}
                      className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  )}
                  
                  {resource.url && (
                    <button
                      onClick={() => window.open(resource.url, '_blank')}
                      className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </ModernCard>
          ))
        ) : (
          <div className="col-span-3 text-center py-8">
            <Book className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">{t.noResources}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentLearning;