import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  PlayCircle,
  BookOpen,
  Download,
  Star,
  Clock,
  Users,
  CheckCircle,
  ArrowRight,
  Lightbulb,
  AlertTriangle,
  ExternalLink
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';

interface GuideStep {
  id: string;
  title: string;
  description: string;
  image?: string;
  video?: string;
  tips: string[];
  warning?: string;
}

interface UserGuideProps {
  userType: 'student' | 'school' | 'teacher' | 'parent' | 'freelancer';
}

export default function UserGuide({ userType }: UserGuideProps) {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [activeGuide, setActiveGuide] = useState('quick-start');

  const getGuideContent = () => {
    const guides = {
      student: {
        'quick-start': {
          title: language === 'fr' ? 'Démarrage rapide' : 'Quick Start',
          description: language === 'fr' 
            ? 'Commencez à utiliser EDUCAFRIC en quelques minutes'
            : 'Start using EDUCAFRIC in just a few minutes',
          steps: [
            {
              id: 'login',
              title: language === 'fr' ? 'Se connecter' : 'Log in',
              description: language === 'fr' 
                ? 'Utilisez vos identifiants fournis par votre école'
                : 'Use your credentials provided by your school',
              tips: [
                language === 'fr' ? 'Conservez vos identifiants en sécurité' : 'Keep your credentials secure',
                language === 'fr' ? 'Contactez votre école si vous oubliez votre mot de passe' : 'Contact your school if you forget your password'
              ]
            },
            {
              id: 'dashboard',
              title: language === 'fr' ? 'Explorer le tableau de bord' : 'Explore the dashboard',
              description: language === 'fr'
                ? 'Découvrez vos notes, devoirs et emploi du temps'
                : 'Discover your grades, homework and schedule',
              tips: [
                language === 'fr' ? 'Vérifiez quotidiennement vos nouveaux devoirs' : 'Check daily for new homework',
                language === 'fr' ? 'Utilisez le calendrier pour planifier vos études' : 'Use the calendar to plan your studies'
              ]
            }
          ]
        },
        'academic': {
          title: language === 'fr' ? 'Suivi académique' : 'Academic Tracking',
          description: language === 'fr'
            ? 'Suivez vos progrès et gérez vos études'
            : 'Track your progress and manage your studies',
          steps: [
            {
              id: 'grades',
              title: language === 'fr' ? 'Consulter vos notes' : 'View your grades',
              description: language === 'fr'
                ? 'Accédez à toutes vos notes et bulletins'
                : 'Access all your grades and report cards',
              tips: [
                language === 'fr' ? 'Les notes sont mises à jour en temps réel' : 'Grades are updated in real-time',
                language === 'fr' ? 'Partagez vos succès avec vos parents' : 'Share your achievements with parents'
              ]
            }
          ]
        }
      },
      school: {
        'quick-start': {
          title: language === 'fr' ? 'Configuration école' : 'School Setup',
          description: language === 'fr'
            ? 'Configurez votre établissement scolaire sur EDUCAFRIC'
            : 'Set up your educational institution on EDUCAFRIC',
          steps: [
            {
              id: 'profile',
              title: language === 'fr' ? 'Profil de l\'école' : 'School profile',
              description: language === 'fr'
                ? 'Complétez les informations de votre établissement'
                : 'Complete your institution information',
              tips: [
                language === 'fr' ? 'Ajoutez logo et photos de l\'école' : 'Add logo and school photos',
                language === 'fr' ? 'Renseignez tous les contacts administratifs' : 'Provide all administrative contacts'
              ]
            },
            {
              id: 'users',
              title: language === 'fr' ? 'Gestion des utilisateurs' : 'User management',
              description: language === 'fr'
                ? 'Ajoutez enseignants, élèves et personnels'
                : 'Add teachers, students and staff',
              tips: [
                language === 'fr' ? 'Importez en masse avec des fichiers Excel' : 'Bulk import with Excel files',
                language === 'fr' ? 'Définissez les rôles et permissions' : 'Define roles and permissions'
              ],
              warning: language === 'fr'
                ? 'Vérifiez les données avant l\'importation en masse'
                : 'Verify data before bulk import'
            }
          ]
        },
        'administration': {
          title: language === 'fr' ? 'Administration' : 'Administration',
          description: language === 'fr'
            ? 'Gérez efficacement votre établissement'
            : 'Efficiently manage your institution',
          steps: [
            {
              id: 'classes',
              title: language === 'fr' ? 'Organisation des classes' : 'Class organization',
              description: language === 'fr'
                ? 'Créez et organisez les classes et matières'
                : 'Create and organize classes and subjects',
              tips: [
                language === 'fr' ? 'Organisez par niveaux et filières' : 'Organize by levels and streams',
                language === 'fr' ? 'Assignez les enseignants titulaires' : 'Assign class teachers'
              ]
            }
          ]
        }
      },
      teacher: {
        'quick-start': {
          title: language === 'fr' ? 'Guide enseignant' : 'Teacher Guide',
          description: language === 'fr'
            ? 'Maîtrisez les outils pédagogiques d\'EDUCAFRIC'
            : 'Master EDUCAFRIC pedagogical tools',
          steps: [
            {
              id: 'classes',
              title: language === 'fr' ? 'Mes classes' : 'My classes',
              description: language === 'fr'
                ? 'Accédez et gérez vos classes assignées'
                : 'Access and manage your assigned classes',
              tips: [
                language === 'fr' ? 'Personnalisez l\'organisation de chaque classe' : 'Customize each class organization',
                language === 'fr' ? 'Utilisez les groupes pour différencier' : 'Use groups for differentiation'
              ]
            },
            {
              id: 'grading',
              title: language === 'fr' ? 'Saisie des notes' : 'Grade entry',
              description: language === 'fr'
                ? 'Saisissez et gérez les évaluations'
                : 'Enter and manage assessments',
              tips: [
                language === 'fr' ? 'Sauvegardez régulièrement vos saisies' : 'Save your entries regularly',
                language === 'fr' ? 'Utilisez les commentaires personnalisés' : 'Use personalized comments'
              ]
            }
          ]
        },
        'pedagogy': {
          title: language === 'fr' ? 'Pédagogie' : 'Pedagogy',
          description: language === 'fr'
            ? 'Optimisez votre enseignement avec les outils numériques'
            : 'Optimize your teaching with digital tools',
          steps: [
            {
              id: 'assignments',
              title: language === 'fr' ? 'Devoirs et exercices' : 'Homework and exercises',
              description: language === 'fr'
                ? 'Créez et distribuez des devoirs interactifs'
                : 'Create and distribute interactive homework',
              tips: [
                language === 'fr' ? 'Variez les types d\'exercices' : 'Vary exercise types',
                language === 'fr' ? 'Fixez des échéances réalistes' : 'Set realistic deadlines'
              ]
            }
          ]
        }
      },
      parent: {
        'quick-start': {
          title: language === 'fr' ? 'Guide parent' : 'Parent Guide',
          description: language === 'fr'
            ? 'Suivez la scolarité de vos enfants efficacement'
            : 'Effectively track your children\'s education',
          steps: [
            {
              id: 'children',
              title: language === 'fr' ? 'Profils des enfants' : 'Children profiles',
              description: language === 'fr'
                ? 'Configurez et gérez les profils de vos enfants'
                : 'Set up and manage your children\'s profiles',
              tips: [
                language === 'fr' ? 'Vérifiez les informations de contact' : 'Verify contact information',
                language === 'fr' ? 'Activez les notifications importantes' : 'Enable important notifications'
              ]
            },
            {
              id: 'tracking',
              title: language === 'fr' ? 'Suivi scolaire' : 'School tracking',
              description: language === 'fr'
                ? 'Consultez notes, absences et communications'
                : 'View grades, absences and communications',
              tips: [
                language === 'fr' ? 'Consultez quotidiennement le tableau de bord' : 'Check dashboard daily',
                language === 'fr' ? 'Communiquez régulièrement avec les enseignants' : 'Communicate regularly with teachers'
              ]
            }
          ]
        },
        'safety': {
          title: language === 'fr' ? 'Sécurité & Géolocalisation' : 'Safety & Geolocation',
          description: language === 'fr'
            ? 'Assurez la sécurité de vos enfants'
            : 'Ensure your children\'s safety',
          steps: [
            {
              id: 'geolocation',
              title: language === 'fr' ? 'Configuration GPS' : 'GPS setup',
              description: language === 'fr'
                ? 'Activez le suivi de localisation sécurisé'
                : 'Enable secure location tracking',
              tips: [
                language === 'fr' ? 'Définissez les zones autorisées' : 'Define authorized zones',
                language === 'fr' ? 'Testez les alertes d\'urgence' : 'Test emergency alerts'
              ],
              warning: language === 'fr'
                ? 'Respectez la vie privée de vos adolescents'
                : 'Respect your teenagers\' privacy'
            }
          ]
        }
      },
      freelancer: {
        'quick-start': {
          title: language === 'fr' ? 'Guide répétiteur' : 'Freelancer Guide',
          description: language === 'fr'
            ? 'Gérez efficacement vos cours particuliers'
            : 'Efficiently manage your private lessons',
          steps: [
            {
              id: 'profile',
              title: language === 'fr' ? 'Profil professionnel' : 'Professional profile',
              description: language === 'fr'
                ? 'Créez un profil attractif et complet'
                : 'Create an attractive and complete profile',
              tips: [
                language === 'fr' ? 'Ajoutez vos qualifications et expériences' : 'Add your qualifications and experience',
                language === 'fr' ? 'Présentez votre méthode pédagogique' : 'Present your teaching method'
              ]
            },
            {
              id: 'students',
              title: language === 'fr' ? 'Gestion des élèves' : 'Student management',
              description: language === 'fr'
                ? 'Organisez vos cours et suivez les progrès'
                : 'Organize your lessons and track progress',
              tips: [
                language === 'fr' ? 'Planifiez les séances à l\'avance' : 'Plan sessions in advance',
                language === 'fr' ? 'Documentez les progrès de chaque élève' : 'Document each student\'s progress'
              ]
            }
          ]
        },
        'business': {
          title: language === 'fr' ? 'Gestion d\'activité' : 'Business Management',
          description: language === 'fr'
            ? 'Développez votre activité de répétition'
            : 'Develop your tutoring business',
          steps: [
            {
              id: 'scheduling',
              title: language === 'fr' ? 'Planification' : 'Scheduling',
              description: language === 'fr'
                ? 'Optimisez votre emploi du temps'
                : 'Optimize your schedule',
              tips: [
                language === 'fr' ? 'Bloquez des créneaux pour la préparation' : 'Block slots for preparation',
                language === 'fr' ? 'Gérez les annulations et reports' : 'Manage cancellations and postponements'
              ]
            }
          ]
        }
      }
    };

    return guides[userType] || {};
  };

  const guideContent = getGuideContent();
  const currentGuide = guideContent[activeGuide as keyof typeof guideContent] || { title: '', description: '', steps: [] };

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          {language === 'fr' ? 'Guide d\'utilisation' : 'User Guide'}
        </h1>
        <p className="text-gray-600">
          {language === 'fr'
            ? 'Apprenez à maîtriser toutes les fonctionnalités d\'EDUCAFRIC'
            : 'Learn to master all EDUCAFRIC features'}
        </p>
      </div>

      <Tabs value={activeGuide} onValueChange={setActiveGuide}>
        <TabsList className="grid w-full grid-cols-2 mb-6">
          {Object.entries(guideContent).map(([key, guide]) => (
            <TabsTrigger key={key} value={key}>
              {guide.title || ''}
            </TabsTrigger>
          ))}
        </TabsList>

        {Object.entries(guideContent).map(([key, guide]) => (
          <TabsContent key={key} value={key}>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                  {guide.title || ''}
                </CardTitle>
                <CardDescription className="text-base">
                  {guide.description || ''}
                </CardDescription>
              </CardHeader>
            </Card>

            <div className="space-y-6">
              {guide.steps.map((step, index) => (
                <Card key={step.id} className="overflow-hidden">
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2">{step.title || ''}</CardTitle>
                        <CardDescription className="text-base">
                          {step.description || ''}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {(step as any).warning && (
                      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertTriangle className="w-5 h-5 text-yellow-600" />
                          <span className="font-semibold text-yellow-800">
                            {language === 'fr' ? 'Attention' : 'Warning'}
                          </span>
                        </div>
                        <p className="text-yellow-800">{(step as any).warning}</p>
                      </div>
                    )}

                    {Array.isArray((step as any).tips) && (step as any).tips.length > 0 && (
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center gap-2 mb-3">
                          <Lightbulb className="w-5 h-5 text-blue-600" />
                          <span className="font-semibold text-blue-800">
                            {language === 'fr' ? 'Conseils pratiques' : 'Practical tips'}
                          </span>
                        </div>
                        <ul className="space-y-2">
                          {((step as any).tips || []).map((tip: string, tipIndex: number) => (
                            <li key={tipIndex} className="flex items-start gap-2 text-blue-800">
                              <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                              <span className="text-sm">{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {(step as any).video && (
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <PlayCircle className="w-8 h-8 text-red-600" />
                            <div>
                              <p className="font-semibold">
                                {language === 'fr' ? 'Tutoriel vidéo' : 'Video tutorial'}
                              </p>
                              <p className="text-sm text-gray-600">
                                {language === 'fr' ? 'Regardez comment faire' : 'Watch how to do it'}
                              </p>
                            </div>
                          </div>
                          <Button 
                            variant="outline"
                            onClick={() => {
                              toast({
                                title: language === 'fr' ? 'Tutoriel vidéo' : 'Video tutorial',
                                description: language === 'fr' ? 'Ouverture du tutoriel vidéo...' : 'Opening video tutorial...',
                              });
                            }}
                            data-testid="button-watch-tutorial"
                          >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            {language === 'fr' ? 'Regarder' : 'Watch'}
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Quick Actions */}
            <Card className="mt-8 bg-gradient-to-r from-green-50 to-blue-50">
              <CardHeader>
                <CardTitle className="text-center">
                  {language === 'fr' ? 'Actions rapides' : 'Quick actions'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <Button 
                    variant="outline" 
                    className="h-auto p-4 flex flex-col items-center gap-2"
                    onClick={() => {
                      toast({
                        title: language === 'fr' ? 'Guide PDF' : 'PDF Guide',
                        description: language === 'fr' ? 'Téléchargement du guide PDF...' : 'Downloading PDF guide...',
                      });
                    }}
                    data-testid="button-download-pdf-guide"
                  >
                    <Download className="w-6 h-6" />
                    <span className="text-sm">
                      {language === 'fr' ? 'Guide PDF' : 'PDF Guide'}
                    </span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-auto p-4 flex flex-col items-center gap-2"
                    onClick={() => {
                      toast({
                        title: language === 'fr' ? 'Vidéos' : 'Videos',
                        description: language === 'fr' ? 'Accès aux tutoriels vidéo...' : 'Accessing video tutorials...',
                      });
                    }}
                    data-testid="button-access-videos"
                  >
                    <PlayCircle className="w-6 h-6" />
                    <span className="text-sm">
                      {language === 'fr' ? 'Vidéos' : 'Videos'}
                    </span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-auto p-4 flex flex-col items-center gap-2"
                    onClick={() => {
                      toast({
                        title: language === 'fr' ? 'Support' : 'Support',
                        description: language === 'fr' ? 'Ouverture du centre de support...' : 'Opening support center...',
                      });
                    }}
                    data-testid="button-open-support"
                  >
                    <Users className="w-6 h-6" />
                    <span className="text-sm">
                      {language === 'fr' ? 'Support' : 'Support'}
                    </span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}