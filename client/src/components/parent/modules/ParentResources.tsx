import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { ModernCard } from '@/components/ui/ModernCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  GraduationCap, BookOpen, FileText, Download, ExternalLink, HelpCircle, 
  Users, Calendar, Phone, RefreshCw, AlertCircle, Search, Filter 
} from 'lucide-react';

interface Resource {
  id: number;
  title: string;
  description: string;
  type: 'downloadable' | 'online' | 'video' | 'article';
  category: string;
  format: string;
  url?: string;
  downloadUrl?: string;
  lastUpdated: string;
  language: string;
  views?: number;
  rating?: number;
  tags?: string[];
}

interface ResourceCategory {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  resourceCount: number;
}

interface EmergencyContact {
  id: number;
  title: string;
  phone: string;
  email?: string;
  type: 'school' | 'medical' | 'technical' | 'other';
}

export const ParentResources = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [resourceType, setResourceType] = useState<string>('all');

  const text = {
    fr: {
      title: 'Ressources',
      subtitle: 'Accès aux ressources éducatives et matériel de soutien',
      parentingGuides: 'Guides Parentaux',
      schoolPolicies: 'Politiques Scolaires',
      helpResources: 'Ressources d\'Aide',
      communityResources: 'Ressources Communautaires',
      downloadable: 'Téléchargeable',
      online: 'En ligne',
      support: 'Support',
      emergency: 'Urgence',
      viewMore: 'Voir Plus',
      download: 'Télécharger',
      category: 'Catégorie',
      lastUpdated: 'Mis à jour',
      loading: 'Chargement des ressources...',
      error: 'Erreur lors du chargement',
      retry: 'Réessayer',
      refresh: 'Actualiser',
      searchPlaceholder: 'Rechercher des ressources...',
      noResourcesFound: 'Aucune ressource trouvée',
      searchHelp: 'Essayez de modifier vos critères de recherche',
      popularCategories: 'Catégories Populaires',
      emergencyContacts: 'Contacts d\'Urgence',
      quickLinks: 'Liens Rapides',
      needHelp: 'Besoin d\'aide ?',
      supportTeam: 'Notre équipe de support est disponible pour vous aider.',
      contactSupport: 'Contacter le Support',
      resourcesFound: 'ressources trouvées',
      views: 'vues'
    },
    en: {
      title: 'Resources',
      subtitle: 'Access educational resources and support materials',
      parentingGuides: 'Parenting Guides',
      schoolPolicies: 'School Policies',
      helpResources: 'Help Resources',
      communityResources: 'Community Resources',
      downloadable: 'Downloadable',
      online: 'Online',
      support: 'Support',
      emergency: 'Emergency',
      viewMore: 'View More',
      download: 'Download',
      category: 'Category',
      lastUpdated: 'Last Updated',
      loading: 'Loading resources...',
      error: 'Error loading resources',
      retry: 'Retry',
      refresh: 'Refresh',
      searchPlaceholder: 'Search resources...',
      noResourcesFound: 'No resources found',
      searchHelp: 'Try adjusting your search criteria',
      popularCategories: 'Popular Categories',
      emergencyContacts: 'Emergency Contacts',
      quickLinks: 'Quick Links',
      needHelp: 'Need Help?',
      supportTeam: 'Our support team is available to help you.',
      contactSupport: 'Contact Support',
      resourcesFound: 'resources found',
      views: 'views'
    }
  };

  const t = text[language as keyof typeof text];

  // Fetch resources from API
  const { data: resourcesData = [], isLoading, error, refetch } = useQuery<Resource[]>({
    queryKey: ['/api/parent/resources', selectedCategory, searchQuery, resourceType, language],
    queryFn: async () => {
      console.log('[PARENT_RESOURCES] 🔍 Fetching resources...');
      let url = '/api/parent/resources';
      const params = new URLSearchParams();
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      if (searchQuery) params.append('search', searchQuery);
      if (resourceType !== 'all') params.append('type', resourceType);
      params.append('language', language);
      if (params.toString()) url += `?${params.toString()}`;
      
      const response = await fetch(url, {
        credentials: 'include'
      });
      if (!response.ok) {
        console.error('[PARENT_RESOURCES] ❌ Failed to fetch resources');
        throw new Error('Failed to fetch resources');
      }
      const data = await response.json();
      console.log('[PARENT_RESOURCES] ✅ Resources loaded:', data.length);
      return data;
    },
    enabled: !!user,
    retry: 2
  });

  // Fetch resource categories
  const { data: categoriesData = [] } = useQuery<ResourceCategory[]>({
    queryKey: ['/api/parent/resources/categories', language],
    queryFn: async () => {
      console.log('[PARENT_RESOURCES] 🔍 Fetching categories...');
      const response = await fetch(`/api/parent/resources/categories?language=${language}`, {
        credentials: 'include'
      });
      if (!response.ok) {
        console.error('[PARENT_RESOURCES] ❌ Failed to fetch categories');
        throw new Error('Failed to fetch resource categories');
      }
      const data = await response.json();
      console.log('[PARENT_RESOURCES] ✅ Categories loaded:', data.length);
      return data;
    },
    enabled: !!user,
    retry: 2
  });

  // Fetch emergency contacts
  const { data: emergencyContacts = [] } = useQuery<EmergencyContact[]>({
    queryKey: ['/api/parent/emergency-contacts', language],  
    queryFn: async () => {
      console.log('[PARENT_RESOURCES] 🔍 Fetching emergency contacts...');
      const response = await fetch(`/api/parent/emergency-contacts?language=${language}`, {
        credentials: 'include'
      });
      if (!response.ok) {
        console.error('[PARENT_RESOURCES] ❌ Failed to fetch emergency contacts');
        throw new Error('Failed to fetch emergency contacts');
      }
      const data = await response.json();
      console.log('[PARENT_RESOURCES] ✅ Emergency contacts loaded:', data.length);
      return data;
    },
    enabled: !!user,
    retry: 2
  });

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'downloadable':
        return <Download className="w-5 h-5" />;
      case 'online':
        return <ExternalLink className="w-5 h-5" />;
      case 'video':
        return <GraduationCap className="w-5 h-5" />;
      case 'article':
        return <BookOpen className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'downloadable':
        return 'bg-green-100 text-green-800';
      case 'online':
        return 'bg-blue-100 text-blue-800';
      case 'video':
        return 'bg-purple-100 text-purple-800';
      case 'article':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (categoryId: string) => {
    switch (categoryId) {
      case 'parenting':
        return <Users className="w-6 h-6" />;
      case 'policies':
        return <FileText className="w-6 h-6" />;
      case 'help':
        return <HelpCircle className="w-6 h-6" />;
      case 'community':
        return <Calendar className="w-6 h-6" />;
      default:
        return <BookOpen className="w-6 h-6" />;
    }
  };

  const handleResourceClick = (resource: Resource) => {
    if (resource.type === 'downloadable' && resource.downloadUrl) {
      window.open(resource.downloadUrl, '_blank');
    } else if (resource.url) {
      window.open(resource.url, '_blank');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">{t.loading}</p>
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
          <Button onClick={() => refetch()} className="mt-4">
            <RefreshCw className="w-4 h-4 mr-2" />
            {t.retry}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-violet-400 to-violet-600 rounded-lg flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{t.title || ''}</h2>
            <p className="text-gray-600">{t.subtitle}</p>
          </div>
        </div>
        <Button variant="outline" onClick={() => refetch()} data-testid="button-refresh-resources">
          <RefreshCw className="w-4 h-4 mr-2" />
          {t.refresh}
        </Button>
      </div>

      {/* Emergency Contacts */}
      {emergencyContacts.length > 0 && (
        <ModernCard gradient="orange">
          <div className="flex items-center space-x-2 mb-4">
            <Phone className="w-5 h-5 text-orange-600" />
            <h3 className="text-lg font-semibold text-gray-700">{t.emergencyContacts}</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {emergencyContacts.slice(0, 3).map((contact) => (
              <div key={contact.id} className="bg-white rounded-lg p-4 border">
                <h4 className="font-semibold text-gray-800 mb-2">{contact.title}</h4>
                <p className="text-gray-600">{contact.phone}</p>
                {contact.email && <p className="text-gray-600">{contact.email}</p>}
              </div>
            ))}
          </div>
        </ModernCard>
      )}

      {/* Search and Filters */}
      <ModernCard gradient="default">
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t.searchPlaceholder}
                  className="pl-10"
                  data-testid="input-search-resources"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder={t.category} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{language === 'fr' ? 'Toutes' : 'All'}</SelectItem>
                  {categoriesData.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={resourceType} onValueChange={setResourceType}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{language === 'fr' ? 'Tous' : 'All'}</SelectItem>
                  <SelectItem value="downloadable">{t.downloadable}</SelectItem>
                  <SelectItem value="online">{t.online}</SelectItem>
                  <SelectItem value="video">Vidéo</SelectItem>
                  <SelectItem value="article">Article</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="text-sm text-gray-600">
            {resourcesData.length} {t.resourcesFound}
          </div>
        </div>
      </ModernCard>

      {/* Quick Access Categories */}
      {categoriesData.length > 0 && (
        <ModernCard gradient="default">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t.popularCategories}</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {categoriesData.slice(0, 4).map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedCategory === category.id
                      ? 'border-violet-500 bg-violet-50'
                      : 'border-gray-200 hover:border-violet-300 hover:bg-violet-50'
                  }`}
                  data-testid={`button-category-${category.id}`}
                >
                  <div className="flex flex-col items-center space-y-2">
                    <div className={`w-10 h-10 ${category.color} rounded-full flex items-center justify-center text-white`}>
                      {getCategoryIcon(category.id)}
                    </div>
                    <div className="text-center">
                      <p className="font-medium text-gray-900 text-sm">{category.title}</p>
                      <p className="text-xs text-gray-500">
                        {category.resourceCount} {language === 'fr' ? 'ressources' : 'resources'}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </ModernCard>
      )}

      {/* Resources Grid */}
      {resourcesData.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg mb-2">{t.noResourcesFound}</p>
          <p className="text-gray-400 text-sm">{t.searchHelp}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resourcesData.map((resource) => (
            <ModernCard 
              key={resource.id} 
              gradient="default" 
              className="hover:shadow-lg transition-shadow cursor-pointer" 
              onClick={() => handleResourceClick(resource)}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center text-violet-600">
                      {getResourceIcon(resource.type)}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{resource.title}</h3>
                    </div>
                  </div>
                  <Badge className={getTypeColor(resource.type)}>
                    {resource.type === 'downloadable' ? t.downloadable :
                     resource.type === 'online' ? t.online :
                     resource.type === 'video' ? 'Vidéo' :
                     resource.type === 'article' ? 'Article' : resource.type}
                  </Badge>
                </div>
                
                <p className="text-sm text-gray-600 mb-4 line-clamp-3">{resource.description}</p>
                
                <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                  <span>{resource.format}</span>
                  <span>{t.lastUpdated}: {new Date(resource.lastUpdated).toLocaleDateString()}</span>
                </div>
                
                {resource.tags && resource.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {resource.tags.slice(0, 3).map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    {resource.views && (
                      <span>{resource.views} {t.views}</span>
                    )}
                    {resource.rating && (
                      <span>⭐ {resource.rating.toFixed(1)}/5</span>
                    )}
                  </div>
                  <Button size="sm" variant="ghost" data-testid={`button-resource-${resource.id}`}>
                    {resource.type === 'downloadable' ? (
                      <>
                        <Download className="w-4 h-4 mr-1" />
                        {t.download}
                      </>
                    ) : (
                      <>
                        <ExternalLink className="w-4 h-4 mr-1" />
                        {t.viewMore}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </ModernCard>
          ))}
        </div>
      )}

      {/* Quick Links */}
      <ModernCard gradient="default">
        <h3 className="text-xl font-bold mb-6 text-gray-800">{t.quickLinks}</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              title: language === 'fr' ? 'Calendrier' : 'Calendar',
              icon: <Calendar className="w-5 h-5" />,
              color: 'bg-blue-500'
            },
            {
              title: 'FAQ',
              icon: <HelpCircle className="w-5 h-5" />,
              color: 'bg-green-500'
            },
            {
              title: language === 'fr' ? 'Guides' : 'Guides',
              icon: <BookOpen className="w-5 h-5" />,
              color: 'bg-purple-500'
            },
            {
              title: 'Contact',
              icon: <Phone className="w-5 h-5" />,
              color: 'bg-orange-500'
            }
          ].map((link, index) => (
            <button
              key={index}
              className={`${link.color} text-white p-6 rounded-xl hover:opacity-90 transition-all duration-300 transform hover:scale-105 text-center group`}
              data-testid={`button-quick-link-${index}`}
            >
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-opacity-30 transition-all">
                {link.icon}
              </div>
              <span className="text-sm font-semibold">{link.title || ''}</span>
            </button>
          ))}
        </div>
      </ModernCard>

      {/* Help Section */}
      <ModernCard gradient="default">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <HelpCircle className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">{t.needHelp}</h3>
          <p className="text-gray-600 mb-4">{t.supportTeam}</p>
          <Button 
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
            data-testid="button-contact-support"
          >
            {t.contactSupport}
          </Button>
        </div>
      </ModernCard>
    </div>
  );
};