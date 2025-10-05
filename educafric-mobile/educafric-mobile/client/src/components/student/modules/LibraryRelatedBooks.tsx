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
  BookOpen, Star, ExternalLink, Tag, Clock,
  Search, Users, MessageSquare, TrendingUp
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
}

const LibraryRelatedBooks: React.FC = () => {
  const { language } = useLanguage();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<'recommendations' | 'browse'>('recommendations');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Centralized translation text following FunctionalTeacherGrades pattern
  const t = {
    title: {
      fr: 'Bibliothèque & Lectures',
      en: 'Library & Reading'
    },
    tabs: {
      recommendations: { fr: 'Mes Recommandations', en: 'My Recommendations' },
      browse: { fr: 'Parcourir la Bibliothèque', en: 'Browse Library' }
    },
    buttons: {
      view: { fr: 'Voir', en: 'View' },
      readOnline: { fr: 'Lire en ligne', en: 'Read Online' },
      search: { fr: 'Rechercher', en: 'Search' }
    },
    form: {
      search: { fr: 'Rechercher des livres', en: 'Search books' },
      level: { fr: 'Niveau', en: 'Level' },
      subject: { fr: 'Matière', en: 'Subject' }
    },
    levels: {
      all: { fr: 'Tous niveaux', en: 'All Levels' },
      primary: { fr: 'Primaire', en: 'Primary' },
      secondary: { fr: 'Secondaire', en: 'Secondary' }
    },
    labels: {
      recommendedBy: { fr: 'Recommandé par', en: 'Recommended by' },
      recommendedOn: { fr: 'Recommandé le', en: 'Recommended on' },
      author: { fr: 'Auteur', en: 'Author' },
      description: { fr: 'Description', en: 'Description' },
      level: { fr: 'Niveau', en: 'Level' },
      teacherNote: { fr: 'Note du professeur', en: 'Teacher\'s Note' }
    },
    status: {
      loading: { fr: 'Chargement...', en: 'Loading...' },
      noRecommendations: { fr: 'Aucune recommandation pour le moment', en: 'No recommendations yet' },
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
      readMore: { fr: 'Continue ta découverte !', en: 'Keep exploring!' },
      newBooks: { fr: 'Nouveaux livres ajoutés', en: 'New books added' },
      personalizedRecommendations: { fr: 'Recommandations personnalisées', en: 'Personalized recommendations' }
    }
  };

  // Fetch student's personalized recommendations
  const { data: recommendationsData, isLoading: recommendationsLoading } = useQuery({
    queryKey: ['/api/student/library/recommendations'],
    enabled: !!user && activeTab === 'recommendations'
  });
  const recommendations = recommendationsData?.recommendations || [];

  // Fetch library books for browsing
  const { data: booksData, isLoading: booksLoading } = useQuery({
    queryKey: ['/api/student/library/books', selectedLevel, searchTerm],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedLevel !== 'all') {
        params.append('recommendedLevel', selectedLevel);
      }
      
      const response = await fetch(`/api/student/library/books?${params}`, {
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

  return (
    <div data-testid="student-library-books" className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t.title[language]}
        </h2>
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {t.encouragement.personalizedRecommendations[language]}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
        {(['recommendations', 'browse'] as const).map((tab) => (
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
            {tab === 'recommendations' && <Star className="w-4 h-4 mr-2 inline" />}
            {tab === 'browse' && <BookOpen className="w-4 h-4 mr-2 inline" />}
            {t.tabs[tab][language]}
          </button>
        ))}
      </div>

      {/* Recommendations Tab */}
      {activeTab === 'recommendations' && (
        <div className="space-y-4">
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
              <p className="text-gray-500 dark:text-gray-400">
                {language === 'fr' 
                  ? 'Tes professeurs n\'ont pas encore fait de recommandations.' 
                  : 'Your teachers haven\'t made any recommendations yet.'}
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
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
                  {recommendations.length} {language === 'fr' ? 'recommandation(s)' : 'recommendation(s)'}
                </Badge>
                <span className="text-sm text-gray-500">
                  {t.encouragement.readMore[language]}
                </span>
              </div>
              
              {recommendations.map((rec: LibraryRecommendation) => (
                <Card key={rec.id} className="hover:shadow-md transition-shadow" data-testid={`card-recommendation-${rec.id}`}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      {rec.book?.coverUrl && (
                        <img 
                          src={rec.book.coverUrl} 
                          alt={rec.book.title[language]}
                          className="w-20 h-28 object-cover rounded-lg flex-shrink-0"
                          data-testid={`img-book-cover-${rec.id}`}
                        />
                      )}
                      
                      <div className="flex-1 space-y-3">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1" data-testid={`text-book-title-${rec.id}`}>
                            {rec.book?.title[language]}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400" data-testid={`text-book-author-${rec.id}`}>
                            <span className="font-medium">{t.labels.author[language]}:</span> {rec.book?.author}
                          </p>
                        </div>
                        
                        {rec.book?.description && (
                          <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed" data-testid={`text-book-description-${rec.id}`}>
                            {rec.book.description[language]}
                          </p>
                        )}
                        
                        <div className="flex flex-wrap gap-2">
                          {rec.book?.recommendedLevel && (
                            <Badge variant="outline" className="text-xs" data-testid={`badge-level-${rec.id}`}>
                              <Tag className="w-3 h-3 mr-1" />
                              {t.levels[rec.book.recommendedLevel as keyof typeof t.levels]?.[language] || rec.book.recommendedLevel}
                            </Badge>
                          )}
                          
                          <Badge variant="secondary" className="text-xs" data-testid={`badge-teacher-${rec.id}`}>
                            <Users className="w-3 h-3 mr-1" />
                            {t.labels.recommendedBy[language]}: {rec.teacherName || 'Professeur'}
                          </Badge>
                          
                          <Badge variant="outline" className="text-xs" data-testid={`badge-date-${rec.id}`}>
                            <Clock className="w-3 h-3 mr-1" />
                            {new Date(rec.recommendedAt).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US')}
                          </Badge>
                        </div>
                        
                        {rec.note && (
                          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border-l-4 border-blue-500">
                            <p className="text-sm text-blue-800 dark:text-blue-200" data-testid={`text-teacher-note-${rec.id}`}>
                              <MessageSquare className="w-4 h-4 mr-1 inline" />
                              <span className="font-medium">{t.labels.teacherNote[language]}:</span> {rec.note}
                            </p>
                          </div>
                        )}
                        
                        {rec.book?.linkUrl && (
                          <div className="pt-2">
                            <Button
                              onClick={() => window.open(rec.book?.linkUrl, '_blank')}
                              className="bg-blue-600 hover:bg-blue-700"
                              data-testid={`button-read-online-${rec.id}`}
                            >
                              <ExternalLink className="w-4 h-4 mr-2" />
                              {t.buttons.readOnline[language]}
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
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
                          data-testid={`button-read-book-${book.id}`}
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          {t.buttons.readOnline[language]}
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