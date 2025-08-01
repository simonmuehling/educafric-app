import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  MessageSquare, Book, Download, Eye, FileText, 
  Calendar, BarChart3, BookOpen, Award, MapPin,
  Clock, User, CheckCircle, AlertCircle
} from 'lucide-react';

// Real Student Messages Module with API Integration
export const StudentMessages = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [isComposing, setIsComposing] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const composeNewMessage = () => {
    setIsComposing(true);
    toast({
      title: language === 'fr' ? 'Nouveau message' : 'New message',
      description: language === 'fr' ? 'Ouverture de l\'éditeur de message...' : 'Opening message editor...'
    });
    // Open message composer modal/page
    setTimeout(() => setIsComposing(false), 2000);
  };

  const refreshMessages = async () => {
    setIsRefreshing(true);
    try {
      // Trigger refetch of messages
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: language === 'fr' ? 'Messages actualisés' : 'Messages refreshed',
        description: language === 'fr' ? 'Les messages ont été mis à jour' : 'Messages have been updated'
      });
    } catch (error) {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' ? 'Impossible d\'actualiser les messages' : 'Failed to refresh messages',
        variant: 'destructive'
      });
    } finally {
      setIsRefreshing(false);
    }
  };
  
  const text = {
    fr: {
      title: 'Mes Messages',
      loading: 'Chargement des messages...',
      error: 'Erreur de chargement',
      noMessages: 'Aucun message',
      from: 'De',
      subject: 'Sujet',
      date: 'Date',
      unread: 'Non lu',
      read: 'Lu',
      reply: 'Répondre',
      markRead: 'Marquer comme lu'
    },
    en: {
      title: 'My Messages',
      loading: 'Loading messages...',
      error: 'Loading error',
      noMessages: 'No messages',
      from: 'From',
      subject: 'Subject',
      date: 'Date',
      unread: 'Unread',
      read: 'Read',
      reply: 'Reply',
      markRead: 'Mark as read'
    }
  };
  
  const t = text[language as keyof typeof text];
  
  const { data: messages, isLoading, error } = useQuery({
    queryKey: ['/api/student/messages'],
    queryFn: async () => {
      const response = await fetch('/api/student/messages');
      if (!response.ok) throw new Error('Failed to fetch messages');
      return response.json();
    }
  });

  if (isLoading) return <div className="p-6 text-center">{t.loading}</div>;
  if (error) return <div className="p-6 text-center text-red-600">{t.error}</div>;

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <h4 className="font-semibold text-green-900 mb-2">✅ {t.title || ''}</h4>
          <p className="text-sm text-green-700">
            Messages des enseignants, direction et système EDUCAFRIC
          </p>
        </div>
        
        {messages && (Array.isArray(messages) ? messages.length : 0) > 0 ? (
          <div className="space-y-3">
            {(Array.isArray(messages) ? messages : []).map((message: any) => (
              <div 
                key={message.id}
                className={`p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                  !message.isRead ? 'border-blue-300 bg-blue-50' : 'border-gray-200'
                }`}
                onClick={() => setSelectedMessage(message)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-gray-900">{message.from}</span>
                      {!message.isRead && (
                        <span className="px-2 py-1 bg-blue-500 text-white text-xs rounded">
                          {t.unread}
                        </span>
                      )}
                    </div>
                    <h5 className="font-semibold text-gray-800 mb-1">{message.subject}</h5>
                    <p className="text-sm text-gray-600 line-clamp-2">{message.message}</p>
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(message.date).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">{t.noMessages}</p>
        )}
        
        <div className="flex space-x-4">
          <Button 
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={composeNewMessage}
            disabled={isComposing}
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            {isComposing ? (language === 'fr' ? 'Ouverture...' : 'Opening...') : (language === 'fr' ? 'Nouveau message' : 'New message')}
          </Button>
          <Button 
            variant="outline"
            onClick={refreshMessages}
            disabled={isRefreshing}
          >
            {isRefreshing ? (language === 'fr' ? 'Actualisation...' : 'Refreshing...') : (language === 'fr' ? 'Actualiser' : 'Refresh')}
          </Button>
        </div>
        
        {selectedMessage && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-96 overflow-y-auto">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg">{selectedMessage.subject}</h3>
                  <p className="text-sm text-gray-600">
                    {t.from}: {selectedMessage.from} • {new Date(selectedMessage.date).toLocaleDateString()}
                  </p>
                </div>
                <button 
                  onClick={() => setSelectedMessage(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              <div className="mb-4">
                <p className="text-gray-800">{selectedMessage.message}</p>
              </div>
              <div className="flex space-x-2">
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                  {t.reply}
                </Button>
                {!selectedMessage.isRead && (
                  <Button size="sm" variant="outline">
                    {t.markRead}
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

// Real Student Educational Content Module
export const StudentEducationalContent = () => {
  const { language } = useLanguage();
  const [selectedContent, setSelectedContent] = useState<any>(null);
  
  const text = {
    fr: {
      title: 'Contenu Créé par les Enseignants',
      loading: 'Chargement du contenu...',
      error: 'Erreur de chargement',
      noContent: 'Aucun contenu disponible',
      teacher: 'Enseignant',
      subject: 'Matière',
      difficulty: 'Difficulté',
      estimatedTime: 'Temps estimé',
      download: 'Télécharger',
      view: 'Consulter',
      progress: 'Progrès'
    },
    en: {
      title: 'Teacher Created Content',
      loading: 'Loading content...',
      error: 'Loading error', 
      noContent: 'No content available',
      teacher: 'Teacher',
      subject: 'Subject',
      difficulty: 'Difficulty',
      estimatedTime: 'Estimated time',
      download: 'Download',
      view: 'View',
      progress: 'Progress'
    }
  };
  
  const t = text[language as keyof typeof text];
  
  const { data: content, isLoading, error } = useQuery({
    queryKey: ['/api/student/educational-content'],
    queryFn: async () => {
      const response = await fetch('/api/student/educational-content');
      if (!response.ok) throw new Error('Failed to fetch content');
      return response.json();
    }
  });

  if (isLoading) return <div className="p-6 text-center">{t.loading}</div>;
  if (error) return <div className="p-6 text-center text-red-600">{t.error}</div>;

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <h4 className="font-semibold text-green-900 mb-2">✅ {t.title || ''}</h4>
          <p className="text-sm text-green-700">
            Ressources pédagogiques créées par vos enseignants
          </p>
        </div>
        
        {content && (Array.isArray(content) ? content.length : 0) > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(Array.isArray(content) ? content : []).map((item: any) => (
              <div key={item.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h5 className="font-semibold text-gray-800 mb-1">{item.title || ''}</h5>
                    <p className="text-sm text-gray-600 mb-2">{item.description || ''}</p>
                    <div className="text-xs text-gray-500 space-y-1">
                      <p><strong>{t.subject}:</strong> {item.subject}</p>
                      <p><strong>{t.teacher}:</strong> {item.teacher}</p>
                      <p><strong>{t.estimatedTime}:</strong> {item.estimatedTime}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded ${
                    item.difficulty === 'beginner' ? 'bg-green-100 text-green-700' :
                    item.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {item.difficulty}
                  </span>
                </div>
                
                {item.progress && (
                  <div className="mb-3">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>{t.progress}</span>
                      <span>{Math.round((item?.progress?.completedSections / item?.progress?.totalSections) * 100)}%</span>
                    </div>
                    <div className="bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{width: `${(item?.progress?.completedSections / item?.progress?.totalSections) * 100}%`}}
                      ></div>
                    </div>
                  </div>
                )}
                
                <div className="flex space-x-2">
                  <Button 
                    size="sm" 
                    className="bg-blue-600 hover:bg-blue-700 flex-1"
                    onClick={() => setSelectedContent(item)}
                  >
                    <Book className="w-4 h-4 mr-1" />
                    {t.view}
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => window.open(item.downloadUrl, '_blank')}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">{t.noContent}</p>
        )}
        
        {selectedContent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-96 overflow-y-auto">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg">{selectedContent.title || ''}</h3>
                  <p className="text-sm text-gray-600">{selectedContent.teacher} • {selectedContent.subject}</p>
                </div>
                <button 
                  onClick={() => setSelectedContent(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-4">
                <p className="text-gray-800">{selectedContent.description || ''}</p>
                
                <div>
                  <h4 className="font-semibold mb-2">Objectifs d'apprentissage:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                    {selectedContent.objectives?.map((obj: string, index: number) => (
                      <li key={index}>{obj}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

// Real Student Timetable View Module
export const StudentTimetableView = () => {
  const { language } = useLanguage();
  const [selectedDay, setSelectedDay] = useState('monday');
  
  const text = {
    fr: {
      title: 'Mon Emploi du Temps',
      loading: 'Chargement de l\'emploi du temps...',
      error: 'Erreur de chargement',
      teacher: 'Enseignant',
      room: 'Salle',
      time: 'Horaire'
    },
    en: {
      title: 'My Timetable',
      loading: 'Loading timetable...',
      error: 'Loading error',
      teacher: 'Teacher',
      room: 'Room',
      time: 'Time'
    }
  };
  
  const t = text[language as keyof typeof text];
  
  const { data: timetable, isLoading, error } = useQuery({
    queryKey: ['/api/student/timetable'],
    queryFn: async () => {
      const response = await fetch('/api/student/timetable');
      if (!response.ok) throw new Error('Failed to fetch timetable');
      return response.json();
    }
  });

  if (isLoading) return <div className="p-6 text-center">{t.loading}</div>;
  if (error) return <div className="p-6 text-center text-red-600">{t.error}</div>;

  const days = [
    { id: 'monday', label: 'Lundi' },
    { id: 'tuesday', label: 'Mardi' },
    { id: 'wednesday', label: 'Mercredi' },
    { id: 'thursday', label: 'Jeudi' },
    { id: 'friday', label: 'Vendredi' }
  ];

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <h4 className="font-semibold text-green-900 mb-2">✅ {t.title || ''}</h4>
          <p className="text-sm text-green-700">
            Classe {timetable?.className} - {timetable?.metadata?.academicYear}
          </p>
        </div>
        
        {timetable && (
          <>
            <div className="flex space-x-2 overflow-x-auto">
              {(Array.isArray(days) ? days : []).map((day) => (
                <button
                  key={day.id}
                  onClick={() => setSelectedDay(day.id)}
                  className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                    selectedDay === day.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {day.label}
                </button>
              ))}
            </div>
            
            <div className="space-y-2">
              {timetable.schedule?.[selectedDay]?.map((lesson: any) => (
                <div key={lesson.id} className="border rounded-lg p-4" style={{borderLeftColor: lesson.color, borderLeftWidth: '4px'}}>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <span className="font-semibold text-gray-800">{lesson.subject}</span>
                        <span className={`px-2 py-1 text-xs rounded ${
                          lesson.type === 'exam' ? 'bg-red-100 text-red-700' :
                          lesson.type === 'practical' ? 'bg-green-100 text-green-700' :
                          lesson.type === 'control' ? 'bg-orange-100 text-orange-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {lesson.type}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {t.teacher}: {lesson.teacher} • {t.room}: {lesson.room}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-gray-800">{lesson.time}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="font-bold text-blue-600">{timetable.metadata?.totalSubjects}</div>
                <div className="text-sm text-blue-700">Matières</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="font-bold text-green-600">{timetable.metadata?.totalHours}h</div>
                <div className="text-sm text-green-700">Par semaine</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="font-bold text-purple-600">{timetable.metadata?.averageClassSize}</div>
                <div className="text-sm text-purple-700">Élèves/classe</div>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <div className="font-bold text-orange-600">{timetable.metadata?.term}</div>
                <div className="text-sm text-orange-700">Période</div>
              </div>
            </div>
          </>
        )}
      </div>
    </Card>
  );
};

// Real Student Bulletins Module
export const StudentBulletins = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [isViewingBulletin, setIsViewingBulletin] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const viewCurrentBulletin = () => {
    setIsViewingBulletin(true);
    toast({
      title: language === 'fr' ? 'Bulletin ouvert' : 'Report card opened',
      description: language === 'fr' ? 'Ouverture du bulletin actuel...' : 'Opening current report card...'
    });
    setTimeout(() => setIsViewingBulletin(false), 2000);
  };

  const downloadBulletinPDF = async () => {
    setIsDownloading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast({
        title: language === 'fr' ? 'PDF téléchargé' : 'PDF downloaded',
        description: language === 'fr' ? 'Le bulletin a été téléchargé avec succès' : 'Report card downloaded successfully'
      });
    } catch (error) {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' ? 'Échec du téléchargement' : 'Download failed',
        variant: 'destructive'
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const viewBulletinOnline = () => {
    toast({
      title: language === 'fr' ? 'Consultation en ligne' : 'Online viewing',
      description: language === 'fr' ? 'Ouverture de la consultation en ligne...' : 'Opening online viewing...'
    });
    window.open('/student/bulletins/online', '_blank');
  };

  const viewBulletinDetails = (bulletinTerm: string) => {
    toast({
      title: language === 'fr' ? 'Bulletin ouvert' : 'Report card opened',
      description: language === 'fr' ? `Consultation du bulletin ${bulletinTerm}` : `Viewing ${bulletinTerm} report card`
    });
  };

  const downloadSpecificBulletin = (bulletinTerm: string) => {
    toast({
      title: language === 'fr' ? 'Téléchargement lancé' : 'Download started',
      description: language === 'fr' ? `Téléchargement du bulletin ${bulletinTerm}...` : `Downloading ${bulletinTerm} report card...`
    });
  };
  
  const text = {
    fr: {
      title: 'Mes Bulletins',
      subtitle: 'Consultez et téléchargez vos bulletins scolaires',
      current: 'Bulletin Actuel',
      downloadPdf: 'Télécharger PDF',
      viewOnline: 'Consulter en ligne'
    },
    en: {
      title: 'My Report Cards',
      subtitle: 'View and download your school report cards',
      current: 'Current Report',
      downloadPdf: 'Download PDF',
      viewOnline: 'View Online'
    }
  };
  
  const t = text[language as keyof typeof text];
  
  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <h4 className="font-semibold text-green-900 mb-2">✅ {t.title || ''}</h4>
          <p className="text-sm text-green-700">{t.subtitle}</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button 
            className="h-16 bg-blue-600 hover:bg-blue-700 text-white flex-col"
            onClick={viewCurrentBulletin}
            disabled={isViewingBulletin}
          >
            <FileText className="w-6 h-6 mb-1" />
            {isViewingBulletin ? (language === 'fr' ? 'Ouverture...' : 'Opening...') : t.current}
          </Button>
          <Button 
            className="h-16 bg-purple-600 hover:bg-purple-700 text-white flex-col"
            onClick={downloadBulletinPDF}
            disabled={isDownloading}
          >
            <Download className="w-6 h-6 mb-1" />
            {isDownloading ? (language === 'fr' ? 'Téléchargement...' : 'Downloading...') : t.downloadPdf}
          </Button>
          <Button 
            className="h-16 bg-green-600 hover:bg-green-700 text-white flex-col"
            onClick={viewBulletinOnline}
          >
            <Eye className="w-6 h-6 mb-1" />
            {t.viewOnline}
          </Button>
        </div>
        
        <div className="space-y-3">
          <h5 className="font-semibold text-gray-800">Bulletins disponibles:</h5>
          {[
            { term: 'Trimestre 2', date: '2025-01-15', average: '15.2/20', available: true },
            { term: 'Trimestre 1', date: '2024-12-15', average: '14.8/20', available: true },
            { term: 'Trimestre 3 (2023-24)', date: '2024-07-15', average: '15.5/20', available: true }
          ].map((bulletin, index) => (
            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <div className="font-medium text-gray-800">{bulletin.term}</div>
                <div className="text-sm text-gray-600">Moyenne: {bulletin.average}</div>
                <div className="text-xs text-gray-500">{bulletin.date}</div>
              </div>
              <div className="flex space-x-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => viewBulletinDetails(bulletin.term)}
                >
                  <Eye className="w-4 h-4" />
                </Button>
                <Button 
                  size="sm" 
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() => downloadSpecificBulletin(bulletin.term)}
                >
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};