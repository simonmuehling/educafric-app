import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { ModernCard } from '@/components/ui/ModernCard';
import { 
  HelpCircle, Book, MessageSquare, Phone, Mail, 
  FileText, Video, Users, Clock, Search, ExternalLink
} from 'lucide-react';

interface HelpTopic {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: React.ReactNode;
}

interface FAQ {
  id: number;
  question: string;
  answer: string;
  category: string;
}

const StudentHelp = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  const openHelpGuide = (topic: HelpTopic) => {
    // Open help guide in new window or modal
    const helpUrl = `/help/${topic.id}`;
    window.open(helpUrl, '_blank');
    
    toast({
      title: language === 'fr' ? 'Guide ouvert' : 'Guide opened',
      description: language === 'fr' ? `Ouverture du guide: ${topic.title || ''}` : `Opening guide: ${topic.title || ''}`
    });
  };

  const openLiveChat = () => {
    toast({
      title: language === 'fr' ? 'Chat en ligne' : 'Online chat',
      description: language === 'fr' ? 'Le chat en ligne sera bientôt disponible. Utilisez l\'email de support en attendant.' : 'Online chat coming soon. Please use support email in the meantime.',
      variant: 'default'
    });
  };

  const text = {
    fr: {
      title: 'Centre d\'Aide',
      subtitle: 'Trouvez des réponses et obtenez de l\'aide',
      quickHelp: 'Aide Rapide',
      userGuide: 'Guide Utilisateur',
      videoTutorials: 'Tutoriels Vidéo',
      contactSupport: 'Contacter le Support',
      faq: 'Questions Fréquentes',
      searchPlaceholder: 'Rechercher dans l\'aide...',
      allCategories: 'Toutes les catégories',
      account: 'Compte',
      grades: 'Notes',
      homework: 'Devoirs',
      timetable: 'Emploi du Temps',
      technical: 'Technique',
      gettingStarted: 'Premiers Pas',
      startHere: 'Commencez ici',
      startHereDesc: 'Guide de démarrage pour nouveaux utilisateurs',
      viewGrades: 'Consulter mes Notes',
      viewGradesDesc: 'Comment accéder et comprendre vos notes',
      submitHomework: 'Rendre mes Devoirs',
      submitHomeworkDesc: 'Guide pour soumettre vos devoirs en ligne',
      useMessaging: 'Utiliser la Messagerie',
      useMessagingDesc: 'Communiquer avec vos enseignants et l\'administration',
      manageProfile: 'Gérer mon Profil',
      manageProfileDesc: 'Modifier vos informations personnelles',
      troubleshooting: 'Dépannage',
      troubleshootingDesc: 'Résoudre les problèmes courants',
      supportEmail: 'Support par Email',
      supportEmailDesc: 'Envoyez-nous un email pour une aide personnalisée',
      supportPhone: 'Support Téléphonique',
      supportPhoneDesc: 'Appelez-nous pour une assistance immédiate',
      onlineChat: 'Chat en Ligne',
      onlineChatDesc: 'Discutez avec notre équipe de support',
      noResults: 'Aucun résultat trouvé',
      contactInfo: 'Informations de Contact',
      email: 'Email',
      phone: 'Téléphone',
      hours: 'Heures d\'ouverture',
      businessHours: 'Lun-Ven: 8h-17h, Sam: 9h-13h'
    },
    en: {
      title: 'Help Center',
      subtitle: 'Find answers and get help',
      quickHelp: 'Quick Help',
      userGuide: 'User Guide',
      videoTutorials: 'Video Tutorials',
      contactSupport: 'Contact Support',
      faq: 'Frequently Asked Questions',
      searchPlaceholder: 'Search help...',
      allCategories: 'All categories',
      account: 'Account',
      grades: 'Grades',
      homework: 'Homework',
      timetable: 'Timetable',
      technical: 'Technical',
      gettingStarted: 'Getting Started',
      startHere: 'Start Here',
      startHereDesc: 'Getting started guide for new users',
      viewGrades: 'View my Grades',
      viewGradesDesc: 'How to access and understand your grades',
      submitHomework: 'Submit Homework',
      submitHomeworkDesc: 'Guide to submitting homework online',
      useMessaging: 'Use Messaging',
      useMessagingDesc: 'Communicate with teachers and administration',
      manageProfile: 'Manage Profile',
      manageProfileDesc: 'Edit your personal information',
      troubleshooting: 'Troubleshooting',
      troubleshootingDesc: 'Solve common problems',
      supportEmail: 'Email Support',
      supportEmailDesc: 'Send us an email for personalized help',
      supportPhone: 'Phone Support',
      supportPhoneDesc: 'Call us for immediate assistance',
      onlineChat: 'Online Chat',
      onlineChatDesc: 'Chat with our support team',
      noResults: 'No results found',
      contactInfo: 'Contact Information',
      email: 'Email',
      phone: 'Phone',
      hours: 'Hours',
      businessHours: 'Mon-Fri: 8AM-5PM, Sat: 9AM-1PM'
    }
  };

  const t = text[language as keyof typeof text];

  const helpTopics: HelpTopic[] = [
    {
      id: 'getting-started',
      title: t.startHere,
      description: t.startHereDesc,
      category: 'account',
      icon: <Book className="w-6 h-6 text-blue-500" />
    },
    {
      id: 'view-grades',
      title: t.viewGrades,
      description: t.viewGradesDesc,
      category: 'grades',
      icon: <FileText className="w-6 h-6 text-green-500" />
    },
    {
      id: 'submit-homework',
      title: t.submitHomework,
      description: t.submitHomeworkDesc,
      category: 'homework',
      icon: <Book className="w-6 h-6 text-purple-500" />
    },
    {
      id: 'messaging',
      title: t.useMessaging,
      description: t.useMessagingDesc,
      category: 'account',
      icon: <MessageSquare className="w-6 h-6 text-orange-500" />
    },
    {
      id: 'profile',
      title: t.manageProfile,
      description: t.manageProfileDesc,
      category: 'account',
      icon: <Users className="w-6 h-6 text-pink-500" />
    },
    {
      id: 'troubleshooting',
      title: t.troubleshooting,
      description: t.troubleshootingDesc,
      category: 'technical',
      icon: <HelpCircle className="w-6 h-6 text-red-500" />
    }
  ];

  const faqs: FAQ[] = [
    {
      id: 1,
      question: language === 'fr' ? 'Comment puis-je voir mes notes ?' : 'How can I view my grades?',
      answer: language === 'fr' 
        ? 'Accédez à l\'onglet "Notes" dans votre tableau de bord. Vous y trouverez toutes vos notes organisées par matière et par période.'
        : 'Go to the "Grades" tab in your dashboard. You will find all your grades organized by subject and period.',
      category: 'grades'
    },
    {
      id: 2,
      question: language === 'fr' ? 'Comment rendre mes devoirs ?' : 'How do I submit my homework?',
      answer: language === 'fr'
        ? 'Dans l\'onglet "Devoirs", cliquez sur le devoir que vous souhaitez rendre, puis utilisez le bouton "Rendre Devoir" pour télécharger votre fichier.'
        : 'In the "Homework" tab, click on the assignment you want to submit, then use the "Submit Work" button to upload your file.',
      category: 'homework'
    },
    {
      id: 3,
      question: language === 'fr' ? 'Puis-je modifier mes informations personnelles ?' : 'Can I edit my personal information?',
      answer: language === 'fr'
        ? 'Oui, allez dans l\'onglet "Paramètres" où vous pouvez modifier vos informations personnelles, photo de profil et préférences de notification.'
        : 'Yes, go to the "Settings" tab where you can edit your personal information, profile picture, and notification preferences.',
      category: 'account'
    },
    {
      id: 4,
      question: language === 'fr' ? 'Comment contacter mes enseignants ?' : 'How do I contact my teachers?',
      answer: language === 'fr'
        ? 'Utilisez l\'onglet "Messages" pour envoyer des messages à vos enseignants. Vous pouvez également voir l\'historique de vos conversations.'
        : 'Use the "Messages" tab to send messages to your teachers. You can also see the history of your conversations.',
      category: 'account'
    },
    {
      id: 5,
      question: language === 'fr' ? 'Que faire si je ne peux pas me connecter ?' : 'What should I do if I cannot log in?',
      answer: language === 'fr'
        ? 'Vérifiez votre email et mot de passe. Si le problème persiste, utilisez la fonction "Mot de passe oublié" ou contactez le support technique.'
        : 'Check your email and password. If the problem persists, use the "Forgot password" function or contact technical support.',
      category: 'technical'
    }
  ];

  const categories = [
    { key: 'all', label: t.allCategories },
    { key: 'account', label: t.account },
    { key: 'grades', label: t.grades },
    { key: 'homework', label: t.homework },
    { key: 'timetable', label: t.timetable },
    { key: 'technical', label: t.technical }
  ];

  const filteredTopics = (Array.isArray(helpTopics) ? helpTopics : []).filter(topic => {
    if (!topic) return false;
    const matchesCategory = selectedCategory === 'all' || topic.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      topic?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      topic?.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const filteredFAQs = (Array.isArray(faqs) ? faqs : []).filter(faq => {
    if (!faq) return false;
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    const matchesSearch = searchQuery === '' ||
      faq?.question?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq?.answer?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">{t.title || ''}</h2>
        <p className="text-gray-600 mb-6">{t.subtitle}</p>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e?.target?.value)}
          className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          placeholder={t.searchPlaceholder}
        />
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {(Array.isArray(categories) ? categories : []).map((category) => (
          <button
            key={category.key}
            onClick={() => setSelectedCategory(category.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedCategory === category.key
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {category.label}
          </button>
        ))}
      </div>

      {/* Quick Help Topics */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">{t.quickHelp}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(Array.isArray(filteredTopics) ? filteredTopics : []).map((topic) => (
            <ModernCard key={topic.id} gradient="default">
              <div 
                className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => openHelpGuide(topic)}
              >
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    {topic.icon}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">{topic.title || ''}</h4>
                    <p className="text-sm text-gray-600">{topic.description || ''}</p>
                  </div>
                </div>
              </div>
            </ModernCard>
          ))}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">{t.faq}</h3>
        <div className="space-y-3">
          {(Array.isArray(filteredFAQs) ? filteredFAQs : []).map((faq) => (
            <ModernCard key={faq.id} gradient="blue">
              <div
                className="cursor-pointer"
                onClick={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
              >
                <div className="flex items-center justify-between p-4">
                  <h4 className="font-medium text-gray-900">{faq.question}</h4>
                  <HelpCircle className={`w-5 h-5 text-gray-400 transition-transform ${
                    expandedFAQ === faq.id ? 'rotate-180' : ''
                  }`} />
                </div>
                {expandedFAQ === faq.id && (
                  <div className="px-4 pb-4 border-t border-gray-100">
                    <p className="text-gray-600 mt-3">{faq.answer}</p>
                  </div>
                )}
              </div>
            </ModernCard>
          ))}
        </div>
      </div>

      {/* Contact Support */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">{t.contactSupport}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ModernCard gradient="green">
            <div className="p-4 text-center">
              <div className="p-3 bg-green-100 rounded-lg mx-auto w-fit mb-3">
                <Mail className="w-6 h-6 text-green-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">{t.supportEmail}</h4>
              <p className="text-sm text-gray-600 mb-3">{t.supportEmailDesc}</p>
              <button
                onClick={() => window?.location?.href = 'mailto:info@educafric.com'}
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors w-full"
              >
                info@educafric.com
              </button>
            </div>
          </ModernCard>

          <ModernCard gradient="blue">
            <div className="p-4 text-center">
              <div className="p-3 bg-blue-100 rounded-lg mx-auto w-fit mb-3">
                <Phone className="w-6 h-6 text-blue-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">{t.supportPhone}</h4>
              <p className="text-sm text-gray-600 mb-3">{t.supportPhoneDesc}</p>
              <button
                onClick={() => window?.location?.href = 'tel:+237656200472'}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors w-full"
              >
                +237 656 200 472
              </button>
            </div>
          </ModernCard>

          <ModernCard gradient="purple">
            <div className="p-4 text-center">
              <div className="p-3 bg-purple-100 rounded-lg mx-auto w-fit mb-3">
                <MessageSquare className="w-6 h-6 text-purple-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">{t.onlineChat}</h4>
              <p className="text-sm text-gray-600 mb-3">{t.onlineChatDesc}</p>
              <button
                onClick={openLiveChat}
                className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors w-full"
              >
                {language === 'fr' ? 'Démarrer le Chat' : 'Start Chat'}
              </button>
            </div>
          </ModernCard>
        </div>
      </div>

      {/* Contact Info */}
      <ModernCard gradient="gray">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t.contactInfo}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">{t.email || ''}</p>
                  <p className="font-medium text-gray-900">info@educafric.com</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">{t.phone}</p>
                  <p className="font-medium text-gray-900">+237 656 200 472</p>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">{t.hours}</p>
                  <p className="font-medium text-gray-900">{t.businessHours}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ModernCard>

      {/* No Results Message */}
      {(Array.isArray(filteredTopics) ? filteredTopics.length : 0) === 0 && (Array.isArray(filteredFAQs) ? filteredFAQs.length : 0) === 0 && (
        <div className="text-center py-8">
          <HelpCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">{t.noResults}</p>
        </div>
      )}
    </div>
  );
};

export default StudentHelp;