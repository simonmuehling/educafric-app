import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { csrfFetch } from '@/lib/csrf';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { 
  BookOpen, Users, Plus, Eye, Share2, Filter,
  ExternalLink, Tag, Star, Clock,
  Search, Edit, Trash2, MessageSquare, User, Building
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
  audienceType: 'student' | 'class';
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
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<'browse' | 'recommendations' | 'add-book'>('browse');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [isRecommendDialogOpen, setIsRecommendDialogOpen] = useState(false);
  const [isAddBookDialogOpen, setIsAddBookDialogOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<LibraryBook | null>(null);
  
  const [recommendForm, setRecommendForm] = useState({
    bookId: '',
    audienceType: 'class' as 'student' | 'class',
    audienceIds: [] as number[],
    note: ''
  });

  const [bookForm, setBookForm] = useState({
    titleFr: '',
    titleEn: '',
    author: '',
    descriptionFr: '',
    descriptionEn: '',
    linkUrl: '',
    coverUrl: '',
    recommendedLevel: '',
    subjectIds: [] as number[],
    departmentIds: [] as number[]
  });

  const [selectedBookLanguage, setSelectedBookLanguage] = useState<'fr' | 'en'>('fr');
  const [selectedClassForStudents, setSelectedClassForStudents] = useState<string>('all');

  // Centralized translation text following FunctionalTeacherGrades pattern
  const t = {
    title: {
      fr: 'Ressources Bibliothèque',
      en: 'Library Resources'
    },
    tabs: {
      browse: { fr: 'Parcourir', en: 'Browse' },
      recommendations: { fr: 'Mes Recommandations', en: 'My Recommendations' },
      addBook: { fr: 'Ajouter Livre', en: 'Add Book' }
    },
    buttons: {
      recommend: { fr: 'Recommander', en: 'Recommend' },
      addBook: { fr: 'Ajouter un Livre', en: 'Add Book' },
      create: { fr: 'Créer', en: 'Create' },
      cancel: { fr: 'Annuler', en: 'Cancel' },
      close: { fr: 'Fermer', en: 'Close' },
      view: { fr: 'Voir', en: 'View' },
      edit: { fr: 'Modifier', en: 'Edit' },
      delete: { fr: 'Supprimer', en: 'Delete' }
    },
    form: {
      title: { fr: 'Titre', en: 'Title' },
      titleFr: { fr: 'Titre (Français)', en: 'Title (French)' },
      titleEn: { fr: 'Titre (Anglais)', en: 'Title (English)' },
      author: { fr: 'Auteur', en: 'Author' },
      description: { fr: 'Description', en: 'Description' },
      descriptionFr: { fr: 'Description (Français)', en: 'Description (French)' },
      descriptionEn: { fr: 'Description (Anglais)', en: 'Description (English)' },
      linkUrl: { fr: 'Lien vers le livre', en: 'Book Link' },
      coverUrl: { fr: 'Lien image de couverture', en: 'Cover Image URL' },
      recommendedLevel: { fr: 'Niveau recommandé', en: 'Recommended Level' },
      audienceType: { fr: 'Type d\'audience', en: 'Audience Type' },
      note: { fr: 'Note (optionnelle)', en: 'Note (optional)' },
      selectAudience: { fr: 'Sélectionner l\'audience', en: 'Select Audience' },
      bookLanguage: { fr: 'Langue du livre', en: 'Book Language' },
      filterByClass: { fr: 'Filtrer par classe', en: 'Filter by Class' },
      allClasses: { fr: 'Toutes les classes', en: 'All Classes' },
      selectStudents: { fr: 'Sélectionner les élèves', en: 'Select Students' }
    },
    levels: {
      all: { fr: 'Tous niveaux', en: 'All Levels' },
      primary: { fr: 'Primaire', en: 'Primary' },
      secondary: { fr: 'Secondaire', en: 'Secondary' }
    },
    audience: {
      student: { fr: 'Élève(s) + Parents', en: 'Student(s) + Parents' },
      class: { fr: 'Classe(s) + Parents', en: 'Class(es) + Parents' }
    },
    status: {
      loading: { fr: 'Chargement...', en: 'Loading...' },
      noBooks: { fr: 'Aucun livre trouvé', en: 'No books found' },
      noRecommendations: { fr: 'Aucune recommandation', en: 'No recommendations' }
    },
    messages: {
      bookAdded: { fr: 'Livre ajouté avec succès', en: 'Book added successfully' },
      recommendationCreated: { fr: 'Recommandation créée avec succès', en: 'Recommendation created successfully' },
      errorLoading: { fr: 'Erreur lors du chargement', en: 'Error loading data' },
      errorAdding: { fr: 'Erreur lors de l\'ajout', en: 'Error adding item' }
    },
    placeholders: {
      searchBooks: { fr: 'Rechercher des livres...', en: 'Search books...' },
      enterTitle: { fr: 'Entrez le titre du livre', en: 'Enter book title' },
      enterAuthor: { fr: 'Entrez le nom de l\'auteur', en: 'Enter author name' },
      enterNote: { fr: 'Ajoutez une note pour cette recommandation...', en: 'Add a note for this recommendation...' }
    }
  };

  // Fetch library books
  const { data: booksData, isLoading: booksLoading } = useQuery({
    queryKey: ['/api/teacher/library/books', selectedLevel],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedLevel !== 'all') {
        params.append('recommendedLevel', selectedLevel);
      }
      
      const response = await fetch(`/api/teacher/library/books?${params}`, {
        method: 'GET',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch books');
      }
      
      return response.json();
    },
    enabled: !!user
  });
  const books = booksData?.books || [];

  // Fetch teacher's recommendations
  const { data: recommendationsData, isLoading: recommendationsLoading } = useQuery({
    queryKey: ['/api/teacher/library/recommendations'],
    enabled: !!user && activeTab === 'recommendations'
  });
  const recommendations = (recommendationsData as any)?.recommendations || [];

  // Fetch teacher classes for recommendations
  const { data: classesData } = useQuery({
    queryKey: ['/api/teacher/classes'],
    enabled: !!user
  });
  const classes = (classesData as any)?.classes || [];

  // Fetch teacher students for recommendations
  const { data: studentsData } = useQuery({
    queryKey: ['/api/teacher/students'],
    enabled: !!user
  });
  const students = (studentsData as any)?.students || [];

  // Create book mutation
  const createBookMutation = useMutation({
    mutationFn: async (bookData: any) => {
      const response = await csrfFetch('/api/teacher/library/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add book');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/teacher/library/books'] });
      setIsAddBookDialogOpen(false);
      setBookForm({
        titleFr: '', titleEn: '', author: '', descriptionFr: '', descriptionEn: '',
        linkUrl: '', coverUrl: '', recommendedLevel: '', subjectIds: [], departmentIds: []
      });
      setSelectedBookLanguage('fr');
      toast({
        title: t.messages.bookAdded[language],
        description: language === 'fr' 
          ? 'Le livre a été ajouté à la bibliothèque' 
          : 'The book has been added to the library'
      });
    },
    onError: (error: any) => {
      toast({
        title: t.messages.errorAdding[language],
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  // Create recommendation mutation
  const createRecommendationMutation = useMutation({
    mutationFn: async (recommendationData: any) => {
      const response = await csrfFetch('/api/teacher/library/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(recommendationData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create recommendation');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/teacher/library/recommendations'] });
      setIsRecommendDialogOpen(false);
      setRecommendForm({
        bookId: '', audienceType: 'class', audienceIds: [], note: ''
      });
      toast({
        title: t.messages.recommendationCreated[language],
        description: language === 'fr' 
          ? 'La recommandation a été créée avec succès' 
          : 'The recommendation has been created successfully'
      });
    },
    onError: (error: any) => {
      toast({
        title: t.messages.errorAdding[language],
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const handleBookSubmit = () => {
    const titleField = selectedBookLanguage === 'fr' ? bookForm.titleFr : bookForm.titleEn;
    
    if (!titleField || !bookForm.author) {
      toast({
        title: language === 'fr' ? 'Champs requis' : 'Required Fields',
        description: language === 'fr' 
          ? 'Veuillez remplir le titre et l\'auteur' 
          : 'Please fill in the title and author',
        variant: 'destructive'
      });
      return;
    }

    const descriptionField = selectedBookLanguage === 'fr' ? bookForm.descriptionFr : bookForm.descriptionEn;

    const bookData = {
      title: selectedBookLanguage === 'fr' 
        ? { fr: bookForm.titleFr, en: bookForm.titleFr } // Use same title for both if only one language
        : { fr: bookForm.titleEn, en: bookForm.titleEn },
      author: bookForm.author,
      description: descriptionField 
        ? (selectedBookLanguage === 'fr' 
            ? { fr: bookForm.descriptionFr, en: bookForm.descriptionFr }
            : { fr: bookForm.descriptionEn, en: bookForm.descriptionEn })
        : undefined,
      linkUrl: bookForm.linkUrl || undefined,
      coverUrl: bookForm.coverUrl || undefined,
      recommendedLevel: bookForm.recommendedLevel || undefined,
      subjectIds: bookForm.subjectIds,
      departmentIds: bookForm.departmentIds
    };

    createBookMutation.mutate(bookData);
  };

  const handleRecommendSubmit = () => {
    if (!recommendForm.bookId || recommendForm.audienceIds.length === 0) {
      toast({
        title: language === 'fr' ? 'Champs requis' : 'Required Fields',
        description: language === 'fr' 
          ? 'Veuillez sélectionner un livre et une audience' 
          : 'Please select a book and audience',
        variant: 'destructive'
      });
      return;
    }

    createRecommendationMutation.mutate(recommendForm);
  };

  const openRecommendDialog = (book: LibraryBook) => {
    setSelectedBook(book);
    setRecommendForm({ ...recommendForm, bookId: book.id.toString() });
    setSelectedClassForStudents('all');
    setIsRecommendDialogOpen(true);
  };

  return (
    <div data-testid="library-related-books" className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t.title[language]}
        </h2>
        <Button 
          onClick={() => setIsAddBookDialogOpen(true)}
          className="bg-blue-600 hover:bg-blue-700"
          data-testid="button-add-book"
        >
          <Plus className="w-4 h-4 mr-2" />
          {t.buttons.addBook[language]}
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
        {(['browse', 'recommendations'] as const).map((tab) => (
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
            {tab === 'browse' && <BookOpen className="w-4 h-4 mr-2 inline" />}
            {tab === 'recommendations' && <Star className="w-4 h-4 mr-2 inline" />}
            {t.tabs[tab][language]}
          </button>
        ))}
      </div>

      {/* Browse Books Tab */}
      {activeTab === 'browse' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center space-x-2">
              <Label htmlFor="level-filter">{t.form.recommendedLevel[language]}:</Label>
              <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                <SelectTrigger className="w-48" data-testid="select-level-filter">
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
            <div className="text-center py-8" data-testid="text-loading">
              {t.status.loading[language]}
            </div>
          ) : books.length === 0 ? (
            <div className="text-center py-8 text-gray-500" data-testid="text-no-books">
              {t.status.noBooks[language]}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {books.map((book: LibraryBook) => (
                <Card key={book.id} className="hover:shadow-lg transition-shadow" data-testid={`card-book-${book.id}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1" data-testid={`text-book-title-${book.id}`}>
                          {book.title[language]}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400" data-testid={`text-book-author-${book.id}`}>
                          {book.author}
                        </p>
                      </div>
                      {book.coverUrl && (
                        <img 
                          src={book.coverUrl} 
                          alt={book.title[language]}
                          className="w-12 h-16 object-cover rounded"
                          data-testid={`img-book-cover-${book.id}`}
                        />
                      )}
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
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2" data-testid={`text-book-description-${book.id}`}>
                        {book.description[language]}
                      </p>
                    )}
                    
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => openRecommendDialog(book)}
                        className="flex-1"
                        data-testid={`button-recommend-${book.id}`}
                      >
                        <Share2 className="w-4 h-4 mr-1" />
                        {t.buttons.recommend[language]}
                      </Button>
                      
                      {book.linkUrl && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(book.linkUrl, '_blank')}
                          data-testid={`button-view-book-${book.id}`}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Recommendations Tab */}
      {activeTab === 'recommendations' && (
        <div className="space-y-4">
          {recommendationsLoading ? (
            <div className="text-center py-8" data-testid="text-loading-recommendations">
              {t.status.loading[language]}
            </div>
          ) : recommendations.length === 0 ? (
            <div className="text-center py-8 text-gray-500" data-testid="text-no-recommendations">
              {t.status.noRecommendations[language]}
            </div>
          ) : (
            <div className="space-y-4">
              {recommendations.map((rec: LibraryRecommendation) => (
                <Card key={rec.id} data-testid={`card-recommendation-${rec.id}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1" data-testid={`text-recommendation-title-${rec.id}`}>
                          {rec.book?.title[language]}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2" data-testid={`text-recommendation-author-${rec.id}`}>
                          {rec.book?.author}
                        </p>
                        
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" data-testid={`badge-audience-type-${rec.id}`}>
                            <Users className="w-3 h-3 mr-1" />
                            {t.audience[rec.audienceType][language]}
                          </Badge>
                          <span className="text-xs text-gray-500" data-testid={`text-recommendation-date-${rec.id}`}>
                            <Clock className="w-3 h-3 mr-1 inline" />
                            {new Date(rec.recommendedAt).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US')}
                          </span>
                        </div>
                        
                        {rec.note && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 italic" data-testid={`text-recommendation-note-${rec.id}`}>
                            <MessageSquare className="w-3 h-3 mr-1 inline" />
                            {rec.note}
                          </p>
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

      {/* Add Book Dialog */}
      <Dialog open={isAddBookDialogOpen} onOpenChange={setIsAddBookDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="dialog-add-book">
          <DialogHeader>
            <DialogTitle>{t.buttons.addBook[language]}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Language Selection */}
            <div>
              <Label htmlFor="bookLanguage">{t.form.bookLanguage[language]} *</Label>
              <Select 
                value={selectedBookLanguage} 
                onValueChange={(value: 'fr' | 'en') => setSelectedBookLanguage(value)}
              >
                <SelectTrigger data-testid="select-book-language">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fr">Français</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Title Field - Show only selected language */}
            <div>
              <Label htmlFor="title">
                {selectedBookLanguage === 'fr' ? t.form.titleFr[language] : t.form.titleEn[language]} *
              </Label>
              <Input
                id="title"
                value={selectedBookLanguage === 'fr' ? bookForm.titleFr : bookForm.titleEn}
                onChange={(e) => setBookForm({ 
                  ...bookForm, 
                  [selectedBookLanguage === 'fr' ? 'titleFr' : 'titleEn']: e.target.value 
                })}
                placeholder={t.placeholders.enterTitle[language]}
                data-testid="input-title"
              />
            </div>
            
            <div>
              <Label htmlFor="author">{t.form.author[language]} *</Label>
              <Input
                id="author"
                value={bookForm.author}
                onChange={(e) => setBookForm({ ...bookForm, author: e.target.value })}
                placeholder={t.placeholders.enterAuthor[language]}
                data-testid="input-author"
              />
            </div>
            
            {/* Description Field - Show only selected language */}
            <div>
              <Label htmlFor="description">
                {selectedBookLanguage === 'fr' ? t.form.descriptionFr[language] : t.form.descriptionEn[language]}
              </Label>
              <Textarea
                id="description"
                value={selectedBookLanguage === 'fr' ? bookForm.descriptionFr : bookForm.descriptionEn}
                onChange={(e) => setBookForm({ 
                  ...bookForm, 
                  [selectedBookLanguage === 'fr' ? 'descriptionFr' : 'descriptionEn']: e.target.value 
                })}
                data-testid="textarea-description"
                rows={3}
              />
            </div>
            
            <div>
              <Label htmlFor="linkUrl">{t.form.linkUrl[language]}</Label>
              <Input
                id="linkUrl"
                type="url"
                value={bookForm.linkUrl}
                onChange={(e) => setBookForm({ ...bookForm, linkUrl: e.target.value })}
                data-testid="input-link-url"
              />
            </div>
            
            <div>
              <Label htmlFor="coverUrl">{t.form.coverUrl[language]}</Label>
              <Input
                id="coverUrl"
                type="url"
                value={bookForm.coverUrl}
                onChange={(e) => setBookForm({ ...bookForm, coverUrl: e.target.value })}
                data-testid="input-cover-url"
              />
            </div>
            
            <div>
              <Label htmlFor="recommendedLevel">{t.form.recommendedLevel[language]}</Label>
              <Select value={bookForm.recommendedLevel} onValueChange={(value) => setBookForm({ ...bookForm, recommendedLevel: value })}>
                <SelectTrigger data-testid="select-recommended-level">
                  <SelectValue placeholder={language === 'fr' ? 'Sélectionner un niveau' : 'Select a level'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="primary">{t.levels.primary[language]}</SelectItem>
                  <SelectItem value="secondary">{t.levels.secondary[language]}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsAddBookDialogOpen(false)}
              data-testid="button-cancel-add-book"
            >
              {t.buttons.cancel[language]}
            </Button>
            <Button 
              onClick={handleBookSubmit}
              disabled={createBookMutation.isPending}
              data-testid="button-submit-add-book"
            >
              {createBookMutation.isPending ? t.status.loading[language] : t.buttons.create[language]}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Recommend Book Dialog */}
      <Dialog open={isRecommendDialogOpen} onOpenChange={setIsRecommendDialogOpen}>
        <DialogContent data-testid="dialog-recommend-book">
          <DialogHeader>
            <DialogTitle>{t.buttons.recommend[language]}: {selectedBook?.title[language]}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="audienceType">{t.form.audienceType[language]} *</Label>
              <Select 
                value={recommendForm.audienceType} 
                onValueChange={(value: 'student' | 'class') => {
                  setRecommendForm({ ...recommendForm, audienceType: value, audienceIds: [] });
                  setSelectedClassForStudents('all');
                }}
              >
                <SelectTrigger data-testid="select-audience-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="class">{t.audience.class[language]}</SelectItem>
                  <SelectItem value="student">{t.audience.student[language]}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>{t.form.selectAudience[language]} *</Label>
              
              {/* Class Selection */}
              {recommendForm.audienceType === 'class' && (
                <div className="max-h-40 overflow-y-auto border rounded-md p-2 space-y-2 mt-2">
                  {classes.map((cls: any) => (
                    <div key={cls.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`class-${cls.id}`}
                        checked={recommendForm.audienceIds.includes(cls.id)}
                        onChange={(e) => {
                          const newIds = e.target.checked
                            ? [...recommendForm.audienceIds, cls.id]
                            : recommendForm.audienceIds.filter(id => id !== cls.id);
                          setRecommendForm({ ...recommendForm, audienceIds: newIds });
                        }}
                        data-testid={`checkbox-class-${cls.id}`}
                      />
                      <Label htmlFor={`class-${cls.id}`} className="text-sm cursor-pointer">
                        {cls.name}
                      </Label>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Student Selection - Organized by Class */}
              {recommendForm.audienceType === 'student' && (
                <div className="space-y-3 mt-2">
                  {/* Class Filter */}
                  <div>
                    <Label htmlFor="class-filter" className="text-sm">{t.form.filterByClass[language]}</Label>
                    <Select 
                      value={selectedClassForStudents} 
                      onValueChange={setSelectedClassForStudents}
                    >
                      <SelectTrigger className="mt-1 bg-white border-gray-300" data-testid="select-class-filter">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectItem value="all">{t.form.allClasses[language]}</SelectItem>
                        {classes.map((cls: any) => (
                          <SelectItem key={cls.id} value={cls.id.toString()}>
                            {cls.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Students List */}
                  <div>
                    <Label className="text-sm">{t.form.selectStudents[language]}</Label>
                    <div className="max-h-60 overflow-y-auto border rounded-md p-2 space-y-3 mt-1">
                      {selectedClassForStudents === 'all' ? (
                        // Group students by class when showing all
                        classes.map((cls: any) => {
                          const classStudents = students.filter((s: any) => s.classId === cls.id);
                          if (classStudents.length === 0) return null;
                          
                          return (
                            <div key={cls.id} className="border-b pb-2 last:border-b-0">
                              <div className="text-xs font-semibold text-gray-600 mb-2 flex items-center">
                                <Building className="w-3 h-3 mr-1" />
                                {cls.name}
                              </div>
                              <div className="space-y-1 ml-4">
                                {classStudents.map((student: any) => (
                                  <div key={student.id} className="flex items-center space-x-2">
                                    <input
                                      type="checkbox"
                                      id={`student-${student.id}`}
                                      checked={recommendForm.audienceIds.includes(student.id)}
                                      onChange={(e) => {
                                        const newIds = e.target.checked
                                          ? [...recommendForm.audienceIds, student.id]
                                          : recommendForm.audienceIds.filter(id => id !== student.id);
                                        setRecommendForm({ ...recommendForm, audienceIds: newIds });
                                      }}
                                      data-testid={`checkbox-student-${student.id}`}
                                    />
                                    <Label htmlFor={`student-${student.id}`} className="text-sm cursor-pointer">
                                      {student.name}
                                    </Label>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        // Show only students from selected class
                        students
                          .filter((s: any) => s.classId === parseInt(selectedClassForStudents))
                          .map((student: any) => (
                            <div key={student.id} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id={`student-${student.id}`}
                                checked={recommendForm.audienceIds.includes(student.id)}
                                onChange={(e) => {
                                  const newIds = e.target.checked
                                    ? [...recommendForm.audienceIds, student.id]
                                    : recommendForm.audienceIds.filter(id => id !== student.id);
                                  setRecommendForm({ ...recommendForm, audienceIds: newIds });
                                }}
                                data-testid={`checkbox-student-${student.id}`}
                              />
                              <Label htmlFor={`student-${student.id}`} className="text-sm cursor-pointer">
                                {student.name}
                              </Label>
                            </div>
                          ))
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div>
              <Label htmlFor="note">{t.form.note[language]}</Label>
              <Textarea
                id="note"
                value={recommendForm.note}
                onChange={(e) => setRecommendForm({ ...recommendForm, note: e.target.value })}
                placeholder={t.placeholders.enterNote[language]}
                data-testid="textarea-recommendation-note"
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsRecommendDialogOpen(false)}
              data-testid="button-cancel-recommend"
            >
              {t.buttons.cancel[language]}
            </Button>
            <Button 
              onClick={handleRecommendSubmit}
              disabled={createRecommendationMutation.isPending}
              data-testid="button-submit-recommend"
            >
              {createRecommendationMutation.isPending ? t.status.loading[language] : t.buttons.recommend[language]}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LibraryRelatedBooks;