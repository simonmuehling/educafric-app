import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpen, Calendar, Clock, User, FileText, 
  Download, Eye, CheckCircle, AlertCircle, Loader2,
  Paperclip, Image, File
} from 'lucide-react';

interface Attachment {
  url: string;
  filename: string;
  mimetype: string;
  size: number;
}

interface Submission {
  studentId: number;
  studentName: string;
  status: string;
  submittedAt: string | null;
}

interface Homework {
  id: number;
  title: string;
  description: string;
  instructions: string;
  subject: string;
  className: string;
  teacher: string;
  priority: string;
  dueDate: string;
  assignedDate: string;
  attachments: Attachment[];
  children: string[];
  submissions: Submission[];
}

export default function ParentChildrenHomework() {
  const { language } = useLanguage();
  const [selectedTab, setSelectedTab] = useState('all');

  const t = {
    fr: {
      title: 'Devoirs des Enfants',
      subtitle: 'Suivez les devoirs assignés à vos enfants',
      all: 'Tous',
      pending: 'En attente',
      submitted: 'Rendus',
      loading: 'Chargement des devoirs...',
      noHomework: 'Aucun devoir trouvé',
      noHomeworkDesc: 'Vos enfants n\'ont pas encore de devoirs assignés',
      dueDate: 'Date limite',
      assignedDate: 'Assigné le',
      teacher: 'Enseignant',
      subject: 'Matière',
      class: 'Classe',
      children: 'Enfants concernés',
      attachments: 'Pièces jointes',
      status: 'Statut',
      submitted: 'Rendu',
      notSubmitted: 'Non rendu',
      priority: 'Priorité',
      high: 'Haute',
      medium: 'Moyenne',
      low: 'Basse',
      viewFile: 'Voir',
      downloadFile: 'Télécharger',
      instructions: 'Consignes'
    },
    en: {
      title: 'Children Homework',
      subtitle: 'Track homework assigned to your children',
      all: 'All',
      pending: 'Pending',
      submitted: 'Submitted',
      loading: 'Loading homework...',
      noHomework: 'No homework found',
      noHomeworkDesc: 'Your children don\'t have any homework assigned yet',
      dueDate: 'Due date',
      assignedDate: 'Assigned on',
      teacher: 'Teacher',
      subject: 'Subject',
      class: 'Class',
      children: 'Children concerned',
      attachments: 'Attachments',
      status: 'Status',
      submitted: 'Submitted',
      notSubmitted: 'Not submitted',
      priority: 'Priority',
      high: 'High',
      medium: 'Medium',
      low: 'Low',
      viewFile: 'View',
      downloadFile: 'Download',
      instructions: 'Instructions'
    }
  };

  const text = t[language as keyof typeof t] || t.fr;

  const { data, isLoading, error } = useQuery<{ success: boolean; homework: Homework[] }>({
    queryKey: ['/api/parent/children/homework']
  });

  const homework = data?.homework || [];

  const filteredHomework = homework.filter(hw => {
    if (selectedTab === 'all') return true;
    if (selectedTab === 'pending') {
      return hw.submissions.length === 0 || hw.submissions.some(s => s.status !== 'submitted');
    }
    if (selectedTab === 'submitted') {
      return hw.submissions.length > 0 && hw.submissions.every(s => s.status === 'submitted');
    }
    return true;
  });

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge className="bg-red-100 text-red-700">{text.high}</Badge>;
      case 'medium':
        return <Badge className="bg-orange-100 text-orange-700">{text.medium}</Badge>;
      case 'low':
        return <Badge className="bg-green-100 text-green-700">{text.low}</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-700">{priority}</Badge>;
    }
  };

  const getFileIcon = (mimetype: string) => {
    if (mimetype.startsWith('image/')) return <Image className="w-4 h-4" />;
    if (mimetype === 'application/pdf') return <FileText className="w-4 h-4" />;
    return <File className="w-4 h-4" />;
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-[#7C5CFC]" />
        <span className="ml-3 text-gray-600">{text.loading}</span>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center gap-3 mb-4">
        <BookOpen className="w-6 h-6 text-[#7C5CFC]" />
        <div>
          <h2 className="text-xl font-bold text-gray-900">{text.title}</h2>
          <p className="text-sm text-gray-500">{text.subtitle}</p>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-3 h-auto p-1.5 bg-[#F3F5F7] rounded-xl gap-1">
          <TabsTrigger 
            value="all"
            className="flex items-center justify-center gap-2 min-h-[44px] px-2 py-2 text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:text-[#7C5CFC] data-[state=active]:shadow-sm"
          >
            <BookOpen className="w-4 h-4 flex-shrink-0" />
            <span className="hidden sm:inline truncate">{text.all}</span>
          </TabsTrigger>
          <TabsTrigger 
            value="pending"
            className="flex items-center justify-center gap-2 min-h-[44px] px-2 py-2 text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:text-[#7C5CFC] data-[state=active]:shadow-sm"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span className="hidden sm:inline truncate">{text.pending}</span>
          </TabsTrigger>
          <TabsTrigger 
            value="submitted"
            className="flex items-center justify-center gap-2 min-h-[44px] px-2 py-2 text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:text-[#7C5CFC] data-[state=active]:shadow-sm"
          >
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            <span className="hidden sm:inline truncate">{text.submitted}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTab} className="mt-4">
          {filteredHomework.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <BookOpen className="w-16 h-16 text-gray-300 mb-4" />
                <p className="text-gray-500 font-medium">{text.noHomework}</p>
                <p className="text-gray-400 text-sm">{text.noHomeworkDesc}</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredHomework.map((hw) => (
                <Card key={hw.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg font-semibold text-gray-900">
                          {hw.title}
                        </CardTitle>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <Badge className="bg-[#7C5CFC]/10 text-[#7C5CFC]">{hw.subject}</Badge>
                          <Badge variant="outline">{hw.className}</Badge>
                          {getPriorityBadge(hw.priority)}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {hw.description && (
                      <p className="text-gray-600 text-sm">{hw.description}</p>
                    )}

                    {hw.instructions && (
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-xs font-medium text-blue-700 mb-1">{text.instructions}</p>
                        <p className="text-sm text-blue-800">{hw.instructions}</p>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <User className="w-4 h-4" />
                        <span>{text.teacher}: <strong>{hw.teacher}</strong></span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>{text.dueDate}: <strong>{formatDate(hw.dueDate)}</strong></span>
                      </div>
                    </div>

                    {hw.children && hw.children.length > 0 && (
                      <div className="bg-purple-50 p-3 rounded-lg">
                        <p className="text-xs font-medium text-purple-700 mb-1">{text.children}</p>
                        <div className="flex flex-wrap gap-2">
                          {hw.children.map((child, idx) => (
                            <Badge key={idx} className="bg-purple-100 text-purple-700">
                              {child}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {hw.submissions && hw.submissions.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-gray-700">{text.status}</p>
                        {hw.submissions.map((sub, idx) => (
                          <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                            <span className="text-sm font-medium">{sub.studentName}</span>
                            {sub.status === 'submitted' ? (
                              <Badge className="bg-green-100 text-green-700">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                {text.submitted}
                              </Badge>
                            ) : (
                              <Badge className="bg-yellow-100 text-yellow-700">
                                <Clock className="w-3 h-3 mr-1" />
                                {text.notSubmitted}
                              </Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {hw.attachments && hw.attachments.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-gray-700 flex items-center gap-1">
                          <Paperclip className="w-3 h-3" />
                          {text.attachments} ({hw.attachments.length})
                        </p>
                        <div className="space-y-2">
                          {hw.attachments.map((att, idx) => (
                            <div key={idx} className="flex items-center justify-between p-2 bg-[#7C5CFC]/5 rounded-lg border border-[#7C5CFC]/20">
                              <div className="flex items-center gap-2">
                                {getFileIcon(att.mimetype)}
                                <div>
                                  <p className="text-sm font-medium text-gray-700 truncate max-w-[150px] sm:max-w-none">
                                    {att.filename}
                                  </p>
                                  <p className="text-xs text-gray-500">{formatFileSize(att.size)}</p>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8"
                                  onClick={() => window.open(att.url, '_blank')}
                                >
                                  <Eye className="w-3 h-3 mr-1" />
                                  <span className="hidden sm:inline">{text.viewFile}</span>
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8"
                                  asChild
                                >
                                  <a href={att.url} download={att.filename}>
                                    <Download className="w-3 h-3 mr-1" />
                                    <span className="hidden sm:inline">{text.downloadFile}</span>
                                  </a>
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
