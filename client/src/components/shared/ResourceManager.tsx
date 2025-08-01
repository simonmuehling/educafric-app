import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { FileText, Upload, Download, Search, Plus, Eye, Edit, Trash2, BookOpen, Video, Image } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const ResourceManager = () => {
  const { language } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const text = {
    fr: {
      title: 'Gestion des Ressources',
      addResource: 'Ajouter une Ressource',
      searchResources: 'Rechercher des ressources...',
      categories: 'Catégories',
      all: 'Toutes',
      documents: 'Documents',
      videos: 'Vidéos',
      images: 'Images',
      exercises: 'Exercices',
      upload: 'Téléverser',
      download: 'Télécharger',
      view: 'Voir',
      edit: 'Modifier',
      delete: 'Supprimer',
      fileName: 'Nom du fichier',
      fileType: 'Type',
      uploadDate: 'Date d\'ajout',
      size: 'Taille',
      description: 'Description',
      subject: 'Matière',
      level: 'Niveau'
    },
    en: {
      title: 'Resource Management',
      addResource: 'Add Resource',
      searchResources: 'Search resources...',
      categories: 'Categories',
      all: 'All',
      documents: 'Documents',
      videos: 'Videos',
      images: 'Images',
      exercises: 'Exercises',
      upload: 'Upload',
      download: 'Download',
      view: 'View',
      edit: 'Edit',
      delete: 'Delete',
      fileName: 'File Name',
      fileType: 'Type',
      uploadDate: 'Upload Date',
      size: 'Size',
      description: 'Description',
      subject: 'Subject',
      level: 'Level'
    }
  };

  const t = text[language as keyof typeof text];

  const categories = [
    { key: 'all', label: t.all, icon: <FileText className="w-4 h-4" /> },
    { key: 'documents', label: t.documents, icon: <FileText className="w-4 h-4" /> },
    { key: 'videos', label: t.videos, icon: <Video className="w-4 h-4" /> },
    { key: 'images', label: t.images, icon: <Image className="w-4 h-4" /> },
    { key: 'exercises', label: t.exercises, icon: <BookOpen className="w-4 h-4" /> }
  ];

  const resources = [
    {
      id: 1,
      name: 'Cours de Géométrie - Chapitre 1',
      type: 'documents',
      subject: 'Mathématiques',
      level: '6ème',
      size: '2.5 MB',
      uploadDate: '2025-01-15',
      description: language === 'fr' ? 'Introduction aux figures géométriques de base' : 'Introduction to basic geometric shapes',
      fileType: 'PDF',
      color: 'bg-red-500'
    },
    {
      id: 2,
      name: 'Vidéo explicative - Les fractions',
      type: 'videos',
      subject: 'Mathématiques',
      level: '5ème',
      size: '45.2 MB',
      uploadDate: '2025-01-10',
      description: language === 'fr' ? 'Explication détaillée des fractions avec exemples' : 'Detailed explanation of fractions with examples',
      fileType: 'MP4',
      color: 'bg-blue-500'
    },
    {
      id: 3,
      name: 'Exercices de Conjugaison',
      type: 'exercises',
      subject: 'Français',
      level: '4ème',
      size: '1.8 MB',
      uploadDate: '2025-01-08',
      description: language === 'fr' ? 'Exercices pratiques sur la conjugaison des verbes' : 'Practical exercises on verb conjugation',
      fileType: 'PDF',
      color: 'bg-green-500'
    },
    {
      id: 4,
      name: 'Carte de l\'Afrique',
      type: 'images',
      subject: 'Géographie',
      level: '6ème',
      size: '3.2 MB',
      uploadDate: '2025-01-05',
      description: language === 'fr' ? 'Carte politique de l\'Afrique avec pays et capitales' : 'Political map of Africa with countries and capitals',
      fileType: 'PNG',
      color: 'bg-purple-500'
    },
    {
      id: 5,
      name: 'Cours d\'Histoire - Indépendances',
      type: 'documents',
      subject: 'Histoire',
      level: '3ème',
      size: '4.1 MB',
      uploadDate: '2025-01-03',
      description: language === 'fr' ? 'Les indépendances africaines (1950-1970)' : 'African independence movements (1950-1970)',
      fileType: 'PDF',
      color: 'bg-orange-500'
    },
    {
      id: 6,
      name: 'Expérience de Chimie - pH',
      type: 'videos',
      subject: 'Sciences',
      level: '2nde',
      size: '67.8 MB',
      uploadDate: '2025-01-01',
      description: language === 'fr' ? 'Démonstration pratique du test de pH' : 'Practical demonstration of pH testing',
      fileType: 'MP4',
      color: 'bg-teal-500'
    }
  ];

  const filteredResources = (Array.isArray(resources) ? resources : []).filter(resource => {
    if (!resource) return false;
    const matchesSearch = resource?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource?.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource?.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || resource.type === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getFileIcon = (fileType: string) => {
    switch (fileType.toLowerCase()) {
      case 'pdf': return <FileText className="w-5 h-5 text-red-600" />;
      case 'mp4': return <Video className="w-5 h-5 text-blue-600" />;
      case 'png': case 'jpg': case 'jpeg': return <Image className="w-5 h-5 text-green-600" />;
      default: return <FileText className="w-5 h-5 text-gray-600" />;
    }
  };

  const handleAddResource = () => {
    alert(language === 'fr' 
      ? 'Interface d\'ajout de ressource en cours de développement'
      : 'Add resource interface under development'
    );
  };

  const handleViewResource = (resourceId: number) => {
    alert(language === 'fr' 
      ? `Affichage de la ressource ID: ${resourceId}`
      : `Viewing resource ID: ${resourceId}`
    );
  };

  const handleDownloadResource = (resourceName: string) => {
    alert(language === 'fr' 
      ? `Téléchargement de "${resourceName}" en cours...`
      : `Downloading "${resourceName}"...`
    );
  };

  const handleEditResource = (resourceId: number) => {
    alert(language === 'fr' 
      ? `Modification de la ressource ID: ${resourceId}`
      : `Editing resource ID: ${resourceId}`
    );
  };

  const handleDeleteResource = (resourceId: number) => {
    if (confirm(language === 'fr' 
      ? 'Êtes-vous sûr de vouloir supprimer cette ressource?'
      : 'Are you sure you want to delete this resource?'
    )) {
      alert(language === 'fr' 
        ? `Ressource supprimée (ID: ${resourceId})`
        : `Resource deleted (ID: ${resourceId})`
      );
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <FileText className="w-6 h-6 text-blue-500" />
              {t.title || ''}
            </h2>
            <Button onClick={handleAddResource} className="bg-green-600 hover:bg-green-700">
              <Plus className="w-4 h-4 mr-2" />
              {t.addResource}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder={t.searchResources}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e?.target?.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              {(Array.isArray(categories) ? categories : []).map((category) => (
                <Button
                  key={category.key}
                  variant={selectedCategory === category.key ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category.key)}
                  className={`flex items-center gap-2 ${selectedCategory === category.key ? "bg-blue-600 hover:bg-blue-700" : ""}`}
                >
                  {category.icon}
                  {category.label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(Array.isArray(filteredResources) ? filteredResources : []).map((resource) => (
          <Card key={resource.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  {getFileIcon(resource.fileType)}
                  <Badge variant="secondary" className="text-xs">
                    {resource.fileType}
                  </Badge>
                </div>
                <div className="flex gap-1">
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => handleViewResource(resource.id)}
                    className="h-8 w-8 p-0"
                  >
                    <Eye className="w-3 h-3" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => handleEditResource(resource.id)}
                    className="h-8 w-8 p-0"
                  >
                    <Edit className="w-3 h-3" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => handleDeleteResource(resource.id)}
                    className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              <h3 className="font-semibold text-lg mb-2 line-clamp-2">{resource.name || ''}</h3>
              
              <div className="space-y-2 text-sm text-gray-600 mb-3">
                <div className="flex justify-between">
                  <span>{t.subject}:</span>
                  <span className="font-medium">{resource.subject}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t.level}:</span>
                  <span className="font-medium">{resource.level}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t.size}:</span>
                  <span className="font-medium">{resource.size}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t.uploadDate}:</span>
                  <span className="font-medium">{resource.uploadDate}</span>
                </div>
              </div>

              <p className="text-sm text-gray-700 mb-4 line-clamp-2">
                {resource.description || ''}
              </p>

              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleViewResource(resource.id)}
                  className="flex-1"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  {t.view}
                </Button>
                <Button 
                  size="sm" 
                  onClick={() => handleDownloadResource(resource.name)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  <Download className="w-4 h-4 mr-1" />
                  {t.download}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {(Array.isArray(filteredResources) ? filteredResources.length : 0) === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              {language === 'fr' ? 'Aucune ressource trouvée' : 'No resources found'}
            </h3>
            <p className="text-gray-500">
              {language === 'fr' 
                ? 'Essayez de modifier vos critères de recherche'
                : 'Try adjusting your search criteria'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Upload Area */}
      <Card className="border-dashed border-2 border-gray-300">
        <CardContent className="p-8 text-center">
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            {language === 'fr' ? 'Glisser-déposer vos fichiers ici' : 'Drag and drop your files here'}
          </h3>
          <p className="text-gray-500 mb-4">
            {language === 'fr' 
              ? 'ou cliquez pour sélectionner des fichiers'
              : 'or click to select files'}
          </p>
          <Button onClick={handleAddResource} variant="outline">
            <Upload className="w-4 h-4 mr-2" />
            {language === 'fr' ? 'Sélectionner des fichiers' : 'Select Files'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResourceManager;