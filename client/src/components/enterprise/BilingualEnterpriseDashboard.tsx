import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Building2, 
  GraduationCap, 
  Users, 
  TrendingUp, 
  Calendar, 
  FileText, 
  Award, 
  Target,
  BarChart3,
  Settings,
  BookOpen,
  DollarSign,
  UserCheck,
  Clock,
  Star,
  Briefcase
} from 'lucide-react';

const BilingualEnterpriseDashboard: React.FC = () => {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState('overview');

  const text = {
    fr: {
      title: 'Tableau de Bord Entreprise',
      subtitle: 'Centre de Formation Professionnel',
      overview: 'Vue d\'ensemble',
      trainees: 'Stagiaires',
      courses: 'Formations',
      certifications: 'Certifications',
      billing: 'Facturation',
      reports: 'Rapports',
      settings: 'Paramètres',
      activeTrainees: 'Stagiaires Actifs',
      completedCourses: 'Formations Terminées',
      pendingCertifications: 'Certifications en Attente',
      monthlyRevenue: 'Revenus Mensuels',
      courseCompletion: 'Taux de Réussite',
      averageRating: 'Note Moyenne',
      upcomingDeadlines: 'Échéances Prochaines',
      corporateClients: 'Clients Entreprises',
      quickActions: 'Actions Rapides',
      addTrainee: 'Ajouter Stagiaire',
      createCourse: 'Créer Formation',
      generateReport: 'Générer Rapport',
      manageCertifications: 'Gérer Certifications',
      recentActivity: 'Activité Récente',
      viewAll: 'Voir Tout',
      newEnrollment: 'Nouvelle Inscription',
      courseCompleted: 'Formation Terminée',
      certificationIssued: 'Certification Émise',
      traineeProgress: 'Progression des Stagiaires',
      enterpriseBilling: 'Facturation Entreprise',
      roiAnalytics: 'Analytiques ROI'
    },
    en: {
      title: 'Enterprise Dashboard',
      subtitle: 'Professional Training Centre',
      overview: 'Overview',
      trainees: 'Trainees',
      courses: 'Courses',
      certifications: 'Certifications',
      billing: 'Billing',
      reports: 'Reports',
      settings: 'Settings',
      activeTrainees: 'Active Trainees',
      completedCourses: 'Completed Courses',
      pendingCertifications: 'Pending Certifications',
      monthlyRevenue: 'Monthly Revenue',
      courseCompletion: 'Success Rate',
      averageRating: 'Average Rating',
      upcomingDeadlines: 'Upcoming Deadlines',
      corporateClients: 'Corporate Clients',
      quickActions: 'Quick Actions',
      addTrainee: 'Add Trainee',
      createCourse: 'Create Course',
      generateReport: 'Generate Report',
      manageCertifications: 'Manage Certifications',
      recentActivity: 'Recent Activity',
      viewAll: 'View All',
      newEnrollment: 'New Enrollment',
      courseCompleted: 'Course Completed',
      certificationIssued: 'Certification Issued',
      traineeProgress: 'Trainee Progress',
      enterpriseBilling: 'Enterprise Billing',
      roiAnalytics: 'ROI Analytics'
    }
  };

  const t = text[language];

  const stats = [
    {
      title: t.activeTrainees,
      value: '247',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      change: '+12.5%'
    },
    {
      title: t.completedCourses,
      value: '156',
      icon: BookOpen,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      change: '+8.3%'
    },
    {
      title: t.pendingCertifications,
      value: '23',
      icon: Award,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      change: '+5.7%'
    },
    {
      title: t.monthlyRevenue,
      value: '2.5M CFA',
      icon: DollarSign,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      change: '+15.2%'
    }
  ];

  const quickActions = [
    {
      title: t.addTrainee,
      icon: UserCheck,
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      title: t.createCourse,
      icon: BookOpen,
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      title: t.generateReport,
      icon: FileText,
      color: 'bg-purple-500 hover:bg-purple-600'
    },
    {
      title: t.manageCertifications,
      icon: Award,
      color: 'bg-orange-500 hover:bg-orange-600'
    }
  ];

  const recentActivities = [
    {
      type: t.newEnrollment,
      name: 'Marie Dubois',
      course: 'Formation Marketing Digital',
      time: '2 min ago',
      icon: Users
    },
    {
      type: t.courseCompleted,
      name: 'Jean Pierre',
      course: 'Gestion de Projet',
      time: '15 min ago',
      icon: BookOpen
    },
    {
      type: t.certificationIssued,
      name: 'Sarah Johnson',
      course: 'Leadership Avancé',
      time: '1 hour ago',
      icon: Award
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-900 p-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {t.title}
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                {t.subtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stat.value}
                    </p>
                    <p className="text-sm text-green-600 dark:text-green-400">
                      {stat.change}
                    </p>
                  </div>
                  <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-6 lg:grid-cols-6">
            <TabsTrigger value="overview">{t.overview}</TabsTrigger>
            <TabsTrigger value="trainees">{t.trainees}</TabsTrigger>
            <TabsTrigger value="courses">{t.courses}</TabsTrigger>
            <TabsTrigger value="certifications">{t.certifications}</TabsTrigger>
            <TabsTrigger value="billing">{t.billing}</TabsTrigger>
            <TabsTrigger value="reports">{t.reports}</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Quick Actions */}
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="w-5 h-5" />
                    <span>{t.quickActions}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {quickActions.map((action, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className={`w-full justify-start space-x-2 ${action.color} text-white border-none`}
                      data-testid={`button-${action.title.toLowerCase().replace(' ', '-')}`}
                    >
                      <action.icon className="w-4 h-4" />
                      <span>{action.title}</span>
                    </Button>
                  ))}
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2">
                      <Clock className="w-5 h-5" />
                      <span>{t.recentActivity}</span>
                    </CardTitle>
                    <Button variant="ghost" size="sm">
                      {t.viewAll}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {recentActivities.map((activity, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                        <activity.icon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {activity.type}: {activity.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {activity.course} • {activity.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Progress Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-sm">{t.courseCompletion}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Marketing Digital</span>
                      <span>85%</span>
                    </div>
                    <Progress value={85} className="h-2" />
                  </div>
                  <div className="space-y-2 mt-4">
                    <div className="flex justify-between text-sm">
                      <span>Gestion Projet</span>
                      <span>92%</span>
                    </div>
                    <Progress value={92} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-sm">{t.averageRating}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    <Star className="w-8 h-8 text-yellow-500 fill-current" />
                    <span className="text-2xl font-bold">4.8</span>
                    <span className="text-sm text-gray-500">/5.0</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    Basé sur 247 évaluations
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-sm">{t.corporateClients}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Orange Cameroun</span>
                      <Badge variant="secondary">Actif</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">MTN</span>
                      <Badge variant="secondary">Actif</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Afriland First Bank</span>
                      <Badge variant="outline">En cours</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="trainees">
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>{t.traineeProgress}</CardTitle>
                <CardDescription>
                  Suivi des performances et progression des stagiaires
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">Interface de gestion des stagiaires en développement...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="courses">
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>{t.courses}</CardTitle>
                <CardDescription>
                  Gestion du catalogue de formations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">Interface de gestion des formations en développement...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="certifications">
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>{t.manageCertifications}</CardTitle>
                <CardDescription>
                  Émission et suivi des certifications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">Interface de gestion des certifications en développement...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="billing">
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>{t.enterpriseBilling}</CardTitle>
                <CardDescription>
                  Facturation et paiements entreprises
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">Interface de facturation entreprise en développement...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports">
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>{t.roiAnalytics}</CardTitle>
                <CardDescription>
                  Rapports ROI et analytiques avancés
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">Interface de rapports ROI en développement...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default BilingualEnterpriseDashboard;