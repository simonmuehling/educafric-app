import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  BookOpen, 
  Users, 
  ClipboardCheck, 
  MessageSquare, 
  Calendar, 
  FileText, 
  CheckCircle,
  AlertCircle,
  Send,
  Shield,
  Eye,
  Bell
} from 'lucide-react';

export default function TeacherHelp() {
  const { language } = useLanguage();

  const bulletinWorkflowSteps = [
    {
      title: language === 'fr' ? 'Confirmation de l\'enseignant' : 'Teacher Confirmation',
      description: language === 'fr' 
        ? 'Une boîte de dialogue de confirmation apparaît pour confirmer l\'envoi des notes vers l\'école pour validation'
        : 'A confirmation dialog appears to confirm sending grades to school for validation',
      icon: <AlertCircle className="h-5 w-5 text-orange-500" />,
      details: language === 'fr'
        ? 'Le système avertit que l\'administration scolaire sera notifiée et que les notes ne pourront plus être modifiées sans autorisation.'
        : 'The system warns that school administration will be notified and grades cannot be modified without authorization.'
    },
    {
      title: language === 'fr' ? 'Vérifications de sécurité' : 'Security Checks',
      description: language === 'fr'
        ? 'Le système effectue des vérifications strictes de sécurité et d\'autorisations'
        : 'The system performs strict security and permission checks',
      icon: <Shield className="h-5 w-5 text-blue-500" />,
      details: language === 'fr'
        ? 'Vérification de l\'inscription de l\'élève, autorisation de l\'enseignant pour l\'école et la classe, et permissions pour chaque matière.'
        : 'Student enrollment verification, teacher authorization for school and class, and permissions for each subject.'
    },
    {
      title: language === 'fr' ? 'Traitement et stockage' : 'Data Processing & Storage',
      description: language === 'fr'
        ? 'Les données sont traitées et stockées dans le système'
        : 'Data is processed and stored in the system',
      icon: <FileText className="h-5 w-5 text-green-500" />,
      details: language === 'fr'
        ? 'Stockage des notes individuelles, préférences de génération, suivi du statut, et métadonnées (année scolaire, trimestre, horodatage).'
        : 'Storage of individual grades, generation preferences, status tracking, and metadata (academic year, term, timestamps).'
    },
    {
      title: language === 'fr' ? 'Notification du directeur' : 'Director Notification',
      description: language === 'fr'
        ? 'Le directeur de l\'école reçoit une notification prioritaire'
        : 'The school director receives a priority notification',
      icon: <Bell className="h-5 w-5 text-purple-500" />,
      details: language === 'fr'
        ? 'Le statut du bulletin passe à "en attente de révision" et apparaît dans la section des soumissions d\'enseignants du directeur.'
        : 'The bulletin status changes to "pending review" and appears in the director\'s teacher submissions section.'
    },
    {
      title: language === 'fr' ? 'Révision du directeur' : 'Director Review',
      description: language === 'fr'
        ? 'Le directeur peut examiner, approuver ou demander des modifications'
        : 'The director can review, approve, or request modifications',
      icon: <Eye className="h-5 w-5 text-indigo-500" />,
      details: language === 'fr'
        ? 'Une fois approuvé, le bulletin passe à l\'étape suivante pour le traitement final et la distribution.'
        : 'Once approved, the bulletin moves to the next stage for final processing and distribution.'
    },
    {
      title: language === 'fr' ? 'Distribution finale' : 'Final Distribution',
      description: language === 'fr'
        ? 'Distribution multi-canal après approbation du directeur'
        : 'Multi-channel distribution after director approval',
      icon: <Send className="h-5 w-5 text-rose-500" />,
      details: language === 'fr'
        ? 'Notifications par SMS, email et WhatsApp aux parents, signatures numériques avec codes QR et cachets officiels, et suivi complet de livraison.'
        : 'SMS, email, and WhatsApp notifications to parents, digital signatures with QR codes and official stamps, and complete delivery tracking.'
    }
  ];

  const generalTopics = [
    {
      id: 'classes',
      title: language === 'fr' ? 'Gestion des classes' : 'Class Management',
      icon: <Users className="h-5 w-5" />,
      content: language === 'fr'
        ? 'Gérez vos classes, consultez les listes d\'élèves, et organisez votre enseignement par classe et matière.'
        : 'Manage your classes, view student lists, and organize your teaching by class and subject.'
    },
    {
      id: 'attendance',
      title: language === 'fr' ? 'Suivi des présences' : 'Attendance Tracking',
      icon: <CheckCircle className="h-5 w-5" />,
      content: language === 'fr'
        ? 'Enregistrez les présences quotidiennes, gérez les absences justifiées et non justifiées, et suivez la ponctualité des élèves.'
        : 'Record daily attendance, manage justified and unjustified absences, and track student punctuality.'
    },
    {
      id: 'assignments',
      title: language === 'fr' ? 'Devoirs et évaluations' : 'Assignments & Evaluations',
      icon: <BookOpen className="h-5 w-5" />,
      content: language === 'fr'
        ? 'Créez et distribuez des devoirs, programmez des évaluations, et suivez les progrès des élèves.'
        : 'Create and distribute assignments, schedule evaluations, and track student progress.'
    },
    {
      id: 'communications',
      title: language === 'fr' ? 'Communications' : 'Communications',
      icon: <MessageSquare className="h-5 w-5" />,
      content: language === 'fr'
        ? 'Communiquez avec les élèves, les parents et l\'administration via SMS, email et notifications intégrées.'
        : 'Communicate with students, parents, and administration via SMS, email, and integrated notifications.'
    },
    {
      id: 'timetable',
      title: language === 'fr' ? 'Emploi du temps' : 'Timetable',
      icon: <Calendar className="h-5 w-5" />,
      content: language === 'fr'
        ? 'Consultez votre emploi du temps, gérez vos créneaux de cours, et planifiez vos activités pédagogiques.'
        : 'View your timetable, manage your class schedules, and plan your educational activities.'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6" data-testid="teacher-help">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <BookOpen className="h-6 w-6 text-blue-600" />
            {language === 'fr' ? 'Centre d\'aide pour enseignants' : 'Teacher Help Centre'}
          </CardTitle>
          <CardDescription>
            {language === 'fr' 
              ? 'Guide complet pour utiliser efficacement la plateforme Educafric'
              : 'Complete guide to effectively use the Educafric platform'
            }
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Bulletin Submission Workflow */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-green-600" />
            {language === 'fr' ? 'Processus de soumission des bulletins' : 'Bulletin Submission Process'}
            <Badge variant="secondary">
              {language === 'fr' ? 'Nouveau' : 'New'}
            </Badge>
          </CardTitle>
          <CardDescription>
            {language === 'fr'
              ? 'Que se passe-t-il quand vous cliquez sur "Soumettre à l\'École" ?'
              : 'What happens when you click "Submit to School"?'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {bulletinWorkflowSteps.map((step, index) => (
              <div key={index} className="flex gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center w-8 h-8 bg-white dark:bg-gray-700 rounded-full border-2 border-gray-200 dark:border-gray-600">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                      {index + 1}
                    </span>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {step.icon}
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">
                      {step.title}
                    </h4>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {step.description}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    {step.details}
                  </p>
                </div>
              </div>
            ))}
          </div>
          
          <Separator className="my-6" />
          
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              {language === 'fr' ? 'Confirmation pour l\'enseignant' : 'Teacher Confirmation'}
            </h4>
            <p className="text-sm text-blue-800 dark:text-blue-200">
              {language === 'fr'
                ? 'Vous verrez un message de succès : "✅ Bulletin sauvegardé - Les données ont été transmises pour traitement par le directeur" avec gestion des états de chargement et des erreurs.'
                : 'You will see a success message: "✅ Bulletin saved - Data has been transmitted for processing by the director" with loading states and error handling.'
              }
            </p>
          </div>
        </CardContent>
      </Card>

      {/* General Help Topics */}
      <Card>
        <CardHeader>
          <CardTitle>
            {language === 'fr' ? 'Sujets d\'aide généraux' : 'General Help Topics'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {generalTopics.map((topic) => (
              <AccordionItem key={topic.id} value={topic.id}>
                <AccordionTrigger className="text-left">
                  <div className="flex items-center gap-2">
                    {topic.icon}
                    {topic.title}
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-gray-600 dark:text-gray-400">
                    {topic.content}
                  </p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      {/* Support Contact */}
      <Card>
        <CardHeader>
          <CardTitle>
            {language === 'fr' ? 'Besoin d\'aide supplémentaire ?' : 'Need Additional Help?'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {language === 'fr'
              ? 'Si vous ne trouvez pas la réponse à votre question, contactez notre équipe de support.'
              : 'If you cannot find the answer to your question, contact our support team.'
            }
          </p>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">support@educafric.com</Badge>
            <Badge variant="outline">+237 657 004 011</Badge>
            <Badge variant="outline">www.educafric.com</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}