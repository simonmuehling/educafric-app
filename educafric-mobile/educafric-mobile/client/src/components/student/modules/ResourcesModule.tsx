import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BookOpen, Video, FileText, ExternalLink, Eye, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface ResourcesModuleProps {
  language?: 'fr' | 'en';
}

const ResourcesModule: React.FC<ResourcesModuleProps> = ({ language = 'fr' }) => {
  const { toast } = useToast();
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [subject, setSubject] = useState<string>('');
  const [level, setLevel] = useState<string>('');

  const texts = {
    fr: {
      title: 'Ressources Éducatives',
      subtitle: 'Accédez aux ressources pédagogiques de votre école',
      loadResources: 'Charger les ressources',
      filterBySubject: 'Filtrer par matière',
      filterByLevel: 'Filtrer par niveau',
      allSubjects: 'Toutes les matières',
      allLevels: 'Tous les niveaux',
      access: 'Accéder',
      download: 'Télécharger',
      author: 'Auteur',
      duration: 'Durée',
      pages: 'Pages',
      views: 'Vues',
      downloads: 'Téléchargements',
      completions: 'Complétions',
      type: 'Type',
      loading: 'Chargement...',
      subjects: {
        'Mathématiques': 'Mathématiques',
        'Français': 'Français',
        'Physique': 'Physique'
      },
      levels: {
        'Seconde': 'Seconde',
        'Première': 'Première',
        'Terminale': 'Terminale'
      }
    },
    en: {
      title: 'Educational Resources',
      subtitle: 'Access your school\'s educational resources',
      loadResources: 'Load Resources',
      filterBySubject: 'Filter by subject',
      filterByLevel: 'Filter by level',
      allSubjects: 'All subjects',
      allLevels: 'All levels',
      access: 'Access',
      download: 'Download',
      author: 'Author',
      duration: 'Duration',
      pages: 'Pages',
      views: 'Views',
      downloads: 'Downloads',
      completions: 'Completions',
      type: 'Type',
      loading: 'Loading...',
      subjects: {
        'Mathématiques': 'Mathematics',
        'Français': 'French',
        'Physique': 'Physics'
      },
      levels: {
        'Seconde': 'Grade 10',
        'Première': 'Grade 11',
        'Terminale': 'Grade 12'
      }
    }
  };

  const t = texts[language];

  const loadResources = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (subject) params.append('subject', subject);
      if (level) params.append('level', level);
      
      const response = await apiRequest('GET', `/api/student/resources?${params.toString()}`, {});
      
      if (response.ok) {
        const result = await response.json();
        setResources(result.resources || []);
      }
    } catch (error) {
      console.error('Error loading resources:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les ressources',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const accessResource = async (resourceId: number, accessType: string = 'view') => {
    try {
      const response = await apiRequest('POST', '/api/student/resources/access', {
        resourceId: resourceId.toString(),
        accessType
      });
      
      if (response.ok) {
        toast({
          title: 'Accès enregistré',
          description: 'Votre accès à la ressource a été enregistré',
          variant: 'default'
        });
      }
    } catch (error) {
      console.error('Error accessing resource:', error);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="h-4 w-4" />;
      case 'pdf': return <FileText className="h-4 w-4" />;
      case 'interactive': return <ExternalLink className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'video': return 'text-red-600 bg-red-50';
      case 'pdf': return 'text-blue-600 bg-blue-50';
      case 'interactive': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-purple-800">
            <BookOpen className="h-6 w-6" />
            <span>{t.title}</span>
          </CardTitle>
          <p className="text-purple-600">{t.subtitle}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select value={subject} onValueChange={setSubject}>
              <SelectTrigger>
                <SelectValue placeholder={t.filterBySubject} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-subjects">{t.allSubjects}</SelectItem>
                <SelectItem value="Mathématiques">📐 Mathématiques</SelectItem>
                <SelectItem value="Français">📝 Français</SelectItem>
                <SelectItem value="Physique">⚡ Physique</SelectItem>
              </SelectContent>
            </Select>

            <Select value={level} onValueChange={setLevel}>
              <SelectTrigger>
                <SelectValue placeholder={t.filterByLevel} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-levels">{t.allLevels}</SelectItem>
                <SelectItem value="Seconde">🎓 Seconde</SelectItem>
                <SelectItem value="Première">🎓 Première</SelectItem>
                <SelectItem value="Terminale">🎓 Terminale</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={loadResources} disabled={loading}>
              <BookOpen className="h-4 w-4 mr-2" />
              {loading ? t.loading : t.loadResources}
            </Button>
          </div>
        </CardContent>
      </Card>

      {resources.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((resource) => (
            <Card key={resource.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg leading-tight">{resource.title}</CardTitle>
                  <div className={`px-2 py-1 rounded-full text-xs flex items-center space-x-1 ${getTypeColor(resource.type)}`}>
                    {getTypeIcon(resource.type)}
                    <span>{resource.type}</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600">{resource.description}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                  <div><strong>{t.author}:</strong> {resource.author}</div>
                  <div><strong>Matière:</strong> {resource.subject}</div>
                  <div><strong>Niveau:</strong> {resource.level}</div>
                  <div><strong>Catégorie:</strong> {resource.category}</div>
                </div>

                {resource.duration && (
                  <div className="text-sm text-blue-600">
                    ⏱️ {resource.duration}
                  </div>
                )}

                {resource.pages && (
                  <div className="text-sm text-green-600">
                    📄 {resource.pages} pages
                  </div>
                )}

                <div className="flex justify-between text-xs text-gray-500">
                  {resource.views && <span><Eye className="h-3 w-3 inline mr-1" />{resource.views}</span>}
                  {resource.downloads && <span><Download className="h-3 w-3 inline mr-1" />{resource.downloads}</span>}
                  {resource.completions && <span>✅ {resource.completions}</span>}
                </div>

                <div className="flex space-x-2">
                  <Button 
                    onClick={() => accessResource(resource.id, 'view')}
                    size="sm"
                    className="flex-1"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    {t.access}
                  </Button>
                  
                  {resource.downloadUrl && (
                    <Button 
                      onClick={() => accessResource(resource.id, 'download')}
                      size="sm"
                      variant="outline"
                      className="flex-1"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      {t.download}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ResourcesModule;