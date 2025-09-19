import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BookOpen, Users, ExternalLink, Tag, Clock,
  Search, MessageSquare, Heart, TrendingUp,
  Eye, Baby, GraduationCap
} from 'lucide-react';

interface LibraryBook {
  id: number;
  title: { fr: string; en: string };
  author: string;
  description?: { fr: string; en: string };
  linkUrl?: string;
  coverUrl?: string;
  subjectIds: number[];
  recommendedLevel?: string;
  departmentIds: number[];
  createdAt: string;
  updatedAt: string;
}

interface LibraryRecommendation {
  id: number;
  bookId: number;
  teacherId: number;
  audienceType: 'student' | 'class' | 'department';
  audienceIds: number[];
  note?: string;
  recommendedAt: string;
  createdAt: string;
  book?: LibraryBook;
  teacherName?: string;
  audienceNames?: string[];
  childName?: string;
  childClass?: string;
}

const LibraryRelatedBooks: React.FC = () => {
  const { language } = useLanguage();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<'children-recommendations' | 'browse'>('children-recommendations');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Centralized translation text following FunctionalTeacherGrades pattern
  const t = {
    title: {
      fr: 'Bibliothèque & Lecture des Enfants',
      en: 'Children\'s Library & Reading'
    },
    tabs: {
      childrenRecommendations: { fr: 'Recommandations pour mes Enfants', en: 'Recommendations for my Children' },
      browse: { fr: 'Parcourir la Bibliothèque', en: 'Browse Library' }
    },
    buttons: {
      view: { fr: 'Voir', en: 'View' },
      readOnline: { fr: 'Lire en ligne', en: 'Read Online' },
      search: { fr: 'Rechercher', en: 'Search' },
      discuss: { fr: 'Discuter avec mon enfant', en: 'Discuss with my child' }
    },
    form: {
      search: { fr: 'Rechercher des livres', en: 'Search books' },
      level: { fr: 'Niveau', en: 'Level' },
      child: { fr: 'Enfant', en: 'Child' }
    },
    levels: {
      all: { fr: 'Tous niveaux', en: 'All Levels' },
      primary: { fr: 'Primaire', en: 'Primary' },
      secondary: { fr: 'Secondaire', en: 'Secondary' }
    },
    labels: {
      recommendedFor: { fr: 'Recommandé pour', en: 'Recommended for' },
      recommendedBy: { fr: 'Recommandé par', en: 'Recommended by' },
      recommendedOn: { fr: 'Recommandé le', en: 'Recommended on' },
      author: { fr: 'Auteur', en: 'Author' },
      description: { fr: 'Description', en: 'Description' },
      level: { fr: 'Niveau', en: 'Level' },
      teacherNote: { fr: 'Note du professeur', en: 'Teacher\'s Note' },
      childClass: { fr: 'Classe', en: 'Class' },
      parentalGuidance: { fr: 'Accompagnement parental', en: 'Parental Guidance' }
    },
    status: {
      loading: { fr: 'Chargement...', en: 'Loading...' },
      noRecommendations: { fr: 'Aucune recommandation pour vos enfants', en: 'No recommendations for your children' },
      noBooks: { fr: 'Aucun livre trouvé', en: 'No books found' },
      searchHint: { fr: 'Utilisez la recherche pour trouver des livres', en: 'Use search to find books' }
    },
    messages: {
      errorLoading: { fr: 'Erreur lors du chargement', en: 'Error loading data' }
    },
    placeholders: {
      searchBooks: { fr: 'Rechercher par titre, auteur...', en: 'Search by title, author...' }
    },
    encouragement: {
      supportLearning: { fr: 'Soutenez l\'apprentissage de vos enfants', en: 'Support your children\'s learning' },
      readTogether: { fr: 'Lire ensemble renforce les liens', en: 'Reading together strengthens bonds' },
      educationalResources: { fr: 'Ressources éducatives', en: 'Educational Resources' }
    },
    insights: {
      totalRecommendations: { fr: 'Total des recommandations', en: 'Total Recommendations' },
      activeReading: { fr: 'Lecture active', en: 'Active Reading' },
      supportTip: { fr: 'Conseil d\'accompagnement', en: 'Support Tip' },
      discussionPoints: { fr: 'Points de discussion', en: 'Discussion Points' }
    },
    tips: {
      readingSupport: {
        fr: 'Créez un moment de lecture calme et encouragez votre enfant à partager ce qu\'il a appris.',
        en: 'Create a quiet reading time and encourage your child to share what they\'ve learned.'
      },
      discussionStarters: {
        fr: 'Demandez à votre enfant : "Qu\'est-ce que tu as préféré dans ce livre ?" et "Qu\'as-tu appris de nouveau ?"',
        en: 'Ask your child: "What did you like most about this book?" and "What did you learn that was new?"'
      }
    }
  };

  // Fetch recommendations for all children
  const { data: recommendationsData, isLoading: recommendationsLoading } = useQuery({
    queryKey: ['/api/parent/library/recommendations'],
    enabled: !!user && activeTab === 'children-recommendations'
  });
  const recommendations = recommendationsData?.recommendations || [];

  // Fetch library books for browsing
  const { data: booksData, isLoading: booksLoading } = useQuery({
    queryKey: ['/api/parent/library/books', selectedLevel, searchTerm],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedLevel !== 'all') {
        params.append('recommendedLevel', selectedLevel);
      }
      
      const response = await fetch(`/api/parent/library/books?${params}`, {
        method: 'GET',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch books');
      }
      
      return response.json();
    },
    enabled: !!user && activeTab === 'browse'
  });
  const allBooks = booksData?.books || [];

  // Filter books based on search term
  const filteredBooks = allBooks.filter((book: LibraryBook) =>
    searchTerm === '' ||
    book.title[language].toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (book.description && book.description[language]?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Group recommendations by child
  const recommendationsByChild = recommendations.reduce((acc: Record<string, LibraryRecommendation[]>, rec: LibraryRecommendation) => {
    const childKey = rec.childName || 'Unknown Child';
    if (!acc[childKey]) {
      acc[childKey] = [];
    }
    acc[childKey].push(rec);
    return acc;
  }, {});

  return (
    <div data-testid="parent-library-books" className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t.title[language]}
        </h2>
        <div className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-red-500" />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {t.encouragement.supportLearning[language]}
          </span>
        </div>
      </div>

      {/* Stats Cards */}
      {activeTab === 'children-recommendations' && recommendations.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <BookOpen className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    {t.insights.totalRecommendations[language]}
                  </p>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100" data-testid="text-total-recommendations">
                    {recommendations.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Users className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-green-800 dark:text-green-200">
                    {t.insights.activeReading[language]}
                  </p>
                  <p className="text-2xl font-bold text-green-900 dark:text-green-100" data-testid="text-active-children">
                    {Object.keys(recommendationsByChild).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-8 h-8 text-purple-600" />
                <div>
                  <p className="text-sm font-medium text-purple-800 dark:text-purple-200">
                    {t.encouragement.educationalResources[language]}
                  </p>
                  <p className="text-lg font-semibold text-purple-900 dark:text-purple-100">
                    {t.encouragement.readTogether[language]}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
        {(['children-recommendations', 'browse'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 px-4 rounded-md transition-colors ${
              activeTab === tab
                ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
            data-testid={`tab-${tab}`}
          >
            {tab === 'children-recommendations' && <Baby className="w-4 h-4 mr-2 inline" />}
            {tab === 'browse' && <BookOpen className="w-4 h-4 mr-2 inline" />}
            {t.tabs[tab === 'children-recommendations' ? 'childrenRecommendations' : 'browse'][language]}
          </button>
        ))}
      </div>

      {/* Children Recommendations Tab */}
      {activeTab === 'children-recommendations' && (
        <div className="space-y-6">
          {recommendationsLoading ? (
            <div className="text-center py-8" data-testid="text-loading-recommendations">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              {t.status.loading[language]}
            </div>
          ) : recommendations.length === 0 ? (
            <div className="text-center py-12" data-testid="text-no-recommendations">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {t.status.noRecommendations[language]}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {language === 'fr' 
                  ? 'Les professeurs n\'ont pas encore fait de recommandations pour vos enfants.' 
                  : 'Teachers haven\'t made any recommendations for your children yet.'}
              </p>
              <Button 
                onClick={() => setActiveTab('browse')}
                className="mt-4"
                data-testid="button-browse-library"
              >
                {t.tabs.browse[language]}
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Parental Guidance Tips */}
              <Card className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 border-amber-200">
                <CardHeader className="pb-3">
                  <h3 className="text-lg font-semibold text-amber-800 dark:text-amber-200 flex items-center gap-2">
                    <GraduationCap className="w-5 h-5" />
                    {t.insights.supportTip[language]}
                  </h3>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-amber-700 dark:text-amber-300 text-sm mb-2">
                    {t.tips.readingSupport[language]}
                  </p>
                  <p className="text-amber-600 dark:text-amber-400 text-sm">
                    <MessageSquare className="w-4 h-4 mr-1 inline" />
                    <strong>{t.insights.discussionPoints[language]}:</strong> {t.tips.discussionStarters[language]}
                  </p>
                </CardContent>
              </Card>

              {/* Recommendations by Child */}
              {Object.entries(recommendationsByChild).map(([childName, childRecommendations]) => (
                <div key={childName} className="space-y-4">
                  <div className="flex items-center gap-3 border-b border-gray-200 dark:border-gray-700 pb-2">
                    <Baby className="w-5 h-5 text-blue-600" />
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white" data-testid={`text-child-name-${childName}`}>
                      {childName}
                    </h3>
                    <Badge variant="secondary" className="text-xs">
                      {childRecommendations.length} {language === 'fr' ? 'livre(s)' : 'book(s)'}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {childRecommendations.map((rec: LibraryRecommendation) => (
                      <Card key={rec.id} className="hover:shadow-md transition-shadow" data-testid={`card-recommendation-${rec.id}`}>
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            {rec.book?.coverUrl && (
                              <img 
                                src={rec.book.coverUrl} 
                                alt={rec.book.title[language]}
                                className="w-16 h-20 object-cover rounded flex-shrink-0"
                                data-testid={`img-book-cover-${rec.id}`}
                              />
                            )}
                            
                            <div className="flex-1 space-y-2">
                              <div>
                                <h4 className="font-semibold text-gray-900 dark:text-white text-sm" data-testid={`text-book-title-${rec.id}`}>
                                  {rec.book?.title[language]}
                                </h4>
                                <p className="text-xs text-gray-600 dark:text-gray-400" data-testid={`text-book-author-${rec.id}`}>
                                  {rec.book?.author}
                                </p>
                              </div>
                              
                              <div className="flex flex-wrap gap-1">
                                {rec.book?.recommendedLevel && (
                                  <Badge variant="outline" className="text-xs" data-testid={`badge-level-${rec.id}`}>
                                    {t.levels[rec.book.recommendedLevel as keyof typeof t.levels]?.[language] || rec.book.recommendedLevel}
                                  </Badge>
                                )}
                                
                                <Badge variant="secondary" className="text-xs" data-testid={`badge-teacher-${rec.id}`}>
                                  {rec.teacherName || 'Professeur'}
                                </Badge>
                                
                                {rec.childClass && (
                                  <Badge variant="outline" className="text-xs" data-testid={`badge-class-${rec.id}`}>
                                    {rec.childClass}
                                  </Badge>
                                )}
                              </div>
                              
                              {rec.note && (
                                <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded text-xs">
                                  <p className="text-blue-800 dark:text-blue-200" data-testid={`text-teacher-note-${rec.id}`}>
                                    <MessageSquare className="w-3 h-3 mr-1 inline" />
                                    {rec.note}
                                  </p>
                                </div>
                              )}
                              
                              <div className="flex gap-2 pt-1">
                                {rec.book?.linkUrl && (
                                  <Button
                                    size="sm"
                                    onClick={() => window.open(rec.book?.linkUrl, '_blank')}
                                    className="text-xs"
                                    data-testid={`button-view-book-${rec.id}`}
                                  >
                                    <Eye className="w-3 h-3 mr-1" />
                                    {t.buttons.view[language]}
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Browse Library Tab */}
      {activeTab === 'browse' && (
        <div className="space-y-4">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 items-center bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <div className="flex-1 w-full">
              <Label htmlFor="search" className="sr-only">{t.form.search[language]}</Label>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  id="search"
                  type="text"
                  placeholder={t.placeholders.searchBooks[language]}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-books"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Label htmlFor="level-filter" className="text-sm font-medium">
                {t.form.level[language]}:
              </Label>
              <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                <SelectTrigger className="w-40" data-testid="select-level-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t.levels.all[language]}</SelectItem>
                  <SelectItem value="primary">{t.levels.primary[language]}</SelectItem>
                  <SelectItem value="secondary">{t.levels.secondary[language]}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Books Grid */}
          {booksLoading ? (
            <div className="text-center py-8" data-testid="text-loading-books">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              {t.status.loading[language]}
            </div>
          ) : filteredBooks.length === 0 ? (
            <div className="text-center py-12" data-testid="text-no-books">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {searchTerm ? t.status.noBooks[language] : t.status.searchHint[language]}
              </h3>
              {searchTerm && (
                <p className="text-gray-500 dark:text-gray-400">
                  {language === 'fr' 
                    ? `Aucun livre trouvé pour "${searchTerm}"` 
                    : `No books found for "${searchTerm}"`}
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {filteredBooks.length} {language === 'fr' ? 'livre(s) trouvé(s)' : 'book(s) found'}
                </p>
                {searchTerm && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setSearchTerm('')}
                    data-testid="button-clear-search"
                  >
                    {language === 'fr' ? 'Effacer' : 'Clear'}
                  </Button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBooks.map((book: LibraryBook) => (
                  <Card key={book.id} className="hover:shadow-lg transition-shadow group" data-testid={`card-book-${book.id}`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start gap-3">
                        {book.coverUrl && (
                          <img 
                            src={book.coverUrl} 
                            alt={book.title[language]}
                            className="w-12 h-16 object-cover rounded flex-shrink-0"
                            data-testid={`img-book-cover-${book.id}`}
                          />
                        )}
                        <div className="flex-1">
                          <h3 className="font-semibold text-base mb-1 line-clamp-2" data-testid={`text-book-title-${book.id}`}>
                            {book.title[language]}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400" data-testid={`text-book-author-${book.id}`}>
                            {book.author}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-1 mt-2">
                        {book.recommendedLevel && (
                          <Badge variant="secondary" className="text-xs" data-testid={`badge-level-${book.id}`}>
                            {t.levels[book.recommendedLevel as keyof typeof t.levels]?.[language] || book.recommendedLevel}
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      {book.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-3" data-testid={`text-book-description-${book.id}`}>
                          {book.description[language]}
                        </p>
                      )}
                      
                      {book.linkUrl && (
                        <Button
                          onClick={() => window.open(book.linkUrl, '_blank')}
                          className="w-full group-hover:bg-blue-700"
                          data-testid={`button-view-book-${book.id}`}
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          {t.buttons.view[language]}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LibraryRelatedBooks;