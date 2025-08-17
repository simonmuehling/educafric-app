import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  FileText, Download, Upload, Eye, 
  Plus, Filter, Search, Share,
  BookOpen, Users, Lock, Globe, Trash2
} from 'lucide-react';

interface FreelancerResource {
  id: number;
  title: string;
  type: string;
  subject: string;
  level: string;
  format: string;
  size: string;
  uploadedAt: string;
  category: string;
  downloads: number;
  isPublic: boolean;
}

const FunctionalFreelancerResources: React.FC = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Fetch freelancer resources data from PostgreSQL API
  const { data: resources = [], isLoading } = useQuery<FreelancerResource[]>({
    queryKey: ['/api/freelancer/resources'],
    enabled: !!user
  });

  const text = {
    fr: {
      title: 'Mes Ressources',
      subtitle: 'Gérez vos ressources pédagogiques et matériel d\'enseignement',
      loading: 'Chargement des ressources...',
      noData: 'Aucune ressource disponible',
      stats: {
        totalResources: 'Ressources Totales',
        publicResources: 'Publiques',
        totalDownloads: 'Téléchargements',
        thisMonth: 'Ce Mois'
      },
      types: {
        textbook: 'Manuel',
        exercises: 'Exercices',
        lesson: 'Cours',
        presentation: 'Présentation',
        video: 'Vidéo',
        audio: 'Audio'
      },
      categories: {
        manual: 'Manuel',
        exercises: 'Exercices',
        presentation: 'Présentation',
        video: 'Vidéo',
        document: 'Document'
      },
      actions: {
        uploadResource: 'Ajouter Ressource',
        download: 'Télécharger',
        preview: 'Aperçu',
        share: 'Partager',
        edit: 'Modifier',
        delete: 'Supprimer'
      },
      filters: {
        all: 'Toutes',
        textbook: 'Manuels',
        exercises: 'Exercices',
        presentation: 'Présentations',
        public: 'Publiques',
        private: 'Privées'
      },
      resource: {
        title: 'Titre',
        type: 'Type',
        subject: 'Matière',
        level: 'Niveau',
        format: 'Format',
        size: 'Taille',
        uploaded: 'Ajouté le',
        downloads: 'Téléchargements',
        visibility: 'Visibilité'
      },
      visibility: {
        public: 'Public',
        private: 'Privé'
      }
    },
    en: {
      title: 'My Resources',
      subtitle: 'Manage your educational resources and teaching materials',
      loading: 'Loading resources...',
      noData: 'No resources available',
      stats: {
        totalResources: 'Total Resources',
        publicResources: 'Public',
        totalDownloads: 'Downloads',
        thisMonth: 'This Month'
      },
      types: {
        textbook: 'Textbook',
        exercises: 'Exercises',
        lesson: 'Lesson',
        presentation: 'Presentation',
        video: 'Video',
        audio: 'Audio'
      },
      categories: {
        manual: 'Manual',
        exercises: 'Exercises',
        presentation: 'Presentation',
        video: 'Video',
        document: 'Document'
      },
      actions: {
        uploadResource: 'Upload Resource',
        download: 'Download',
        preview: 'Preview',
        share: 'Share',
        edit: 'Edit',
        delete: 'Delete'
      },
      filters: {
        all: 'All',
        textbook: 'Textbooks',
        exercises: 'Exercises',
        presentation: 'Presentations',
        public: 'Public',
        private: 'Private'
      },
      resource: {
        title: 'Title',
        type: 'Type',
        subject: 'Subject',
        level: 'Level',
        format: 'Format',
        size: 'Size',
        uploaded: 'Uploaded on',
        downloads: 'Downloads',
        visibility: 'Visibility'
      },
      visibility: {
        public: 'Public',
        private: 'Private'
      }
    }
  };

  const t = text[language as keyof typeof text];

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">{t.loading}</span>
        </div>
      </div>
    );
  }

  // Filter and search resources
  const filteredResources = (Array.isArray(resources) ? resources : []).filter(resource => {
    if (!resource) return false;
    const matchesFilter = selectedFilter === 'all' || 
                         selectedFilter === resource.type ||
                         (selectedFilter === 'public' && resource.isPublic) ||
                         (selectedFilter === 'private' && !resource.isPublic);
    const matchesSearch = resource?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource?.subject?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Calculate statistics
  const totalResources = (Array.isArray(resources) ? resources.length : 0);
  const publicResources = (Array.isArray(resources) ? resources : []).filter(r => r.isPublic).length;
  const totalDownloads = (Array.isArray(resources) ? resources : []).reduce((sum, r) => sum + r.downloads, 0);
  const thisMonth = (Array.isArray(resources) ? resources : []).filter(r => {
    if (!r) return false;
    const uploadDate = new Date(r.uploadedAt);
    const now = new Date();
    return uploadDate.getMonth() === now.getMonth() && uploadDate.getFullYear() === now.getFullYear();
  }).length;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'textbook':
        return <BookOpen className="w-5 h-5 text-blue-600" />;
      case 'exercises':
        return <FileText className="w-5 h-5 text-green-600" />;
      case 'lesson':
        return <Users className="w-5 h-5 text-purple-600" />;
      case 'presentation':
        return <Eye className="w-5 h-5 text-orange-600" />;
      default:
        return <FileText className="w-5 h-5 text-gray-600" />;
    }
  };

  const getFormatColor = (format: string) => {
    switch (format.toLowerCase()) {
      case 'pdf':
        return 'bg-red-100 text-red-800';
      case 'powerpoint':
      case 'ppt':
      case 'pptx':
        return 'bg-orange-100 text-orange-800';
      case 'word':
      case 'doc':
      case 'docx':
        return 'bg-blue-100 text-blue-800';
      case 'video':
      case 'mp4':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t.title || ''}</h1>
          <p className="text-gray-600 mt-1">{t.subtitle}</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Upload className="w-4 h-4 mr-2" />
          {t?.actions?.uploadResource}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">{t?.stats?.totalResources}</p>
                <p className="text-2xl font-bold">{totalResources}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Globe className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">{t?.stats?.publicResources}</p>
                <p className="text-2xl font-bold text-green-600">{publicResources}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Download className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">{t?.stats?.totalDownloads}</p>
                <p className="text-2xl font-bold text-purple-600">{totalDownloads}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Upload className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">{t?.stats?.thisMonth}</p>
                <p className="text-2xl font-bold text-orange-600">{thisMonth}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resources List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Bibliothèque de Ressources</h3>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <Search className="w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Rechercher une ressource..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e?.target?.value)}
                  className="border rounded-md px-3 py-1 text-sm w-64"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <select
                  value={selectedFilter}
                  onChange={(e) => setSelectedFilter(e?.target?.value)}
                  className="border rounded-md px-3 py-1 text-sm"
                >
                  <option value="all">{t?.filters?.all}</option>
                  <option value="textbook">{t?.filters?.textbook}</option>
                  <option value="exercises">{t?.filters?.exercises}</option>
                  <option value="presentation">{t?.filters?.presentation}</option>
                  <option value="public">{t?.filters?.public}</option>
                  <option value="private">{t?.filters?.private}</option>
                </select>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {(Array.isArray(filteredResources) ? filteredResources.length : 0) === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">{t.noData}</h3>
              <p className="text-gray-600">Aucune ressource ne correspond à vos critères.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(Array.isArray(filteredResources) ? filteredResources : []).map((resource) => (
                <Card key={resource.id} className="border hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        {getTypeIcon(resource.type)}
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 line-clamp-2">
                            {resource.title || ''}
                          </h4>
                          <p className="text-sm text-gray-600">{resource.subject} - {resource.level}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        {resource.isPublic ? (
                          <Globe className="w-4 h-4 text-green-600" />
                        ) : (
                          <Lock className="w-4 h-4 text-gray-600" />
                        )}
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">{t?.resource?.format}:</span>
                        <Badge className={getFormatColor(resource.format)}>
                          {resource.format}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">{t?.resource?.size}:</span>
                        <span className="font-medium">{resource.size}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">{t?.resource?.downloads}:</span>
                        <span className="font-medium">{resource.downloads}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">{t?.resource?.uploaded}:</span>
                        <span className="font-medium">
                          {new Date(resource.uploadedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700 flex-1">
                        <Download className="w-4 h-4 mr-2" />
                        {t?.actions?.download}
                      </Button>
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Share className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FunctionalFreelancerResources;