import React from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  School, 
  GraduationCap, 
  Users, 
  User, 
  BookOpen,
  TestTube,
  Eye,
  Play,
  ArrowRight
} from 'lucide-react';

export default function SandboxDemo() {
  const [, navigate] = useLocation();
  const { language } = useLanguage();

  const text = {
    en: {
      title: 'EDUCAFRIC Demo Center',
      subtitle: 'Experience all premium features without limitations',
      description: 'Test our complete educational platform with real functionality and data',
      testNow: 'Test Platform',
      fullDemo: 'Full Demo Access',
      viewFeatures: 'View All Features',
      roles: {
        director: 'School Director Demo',
        teacher: 'Teacher Demo', 
        student: 'Student Demo',
        parent: 'Parent Demo',
        freelancer: 'Freelancer Demo'
      },
      features: {
        director: ['Complete School Management', 'Teacher Oversight', 'Financial Dashboard', 'Student Analytics'],
        teacher: ['Class Management', 'Grade Book', 'Attendance Tracking', 'Parent Communication'],
        student: ['Grade Viewing', 'Homework Tracker', 'Schedule Access', 'Progress Reports'],
        parent: ['Child Monitoring', 'GPS Tracking', 'Grade Alerts', 'Teacher Messages'],
        freelancer: ['Private Classes', 'Student Billing', 'Schedule Management', 'Progress Analytics']
      }
    },
    fr: {
      title: 'Centre Démo EDUCAFRIC',
      subtitle: 'Découvrez toutes les fonctionnalités premium sans limitations',
      description: 'Testez notre plateforme éducative complète avec fonctionnalités et données réelles',
      testNow: 'Tester la Plateforme',
      fullDemo: 'Accès Démo Complet',
      viewFeatures: 'Voir Toutes Fonctionnalités',
      roles: {
        director: 'Démo Directeur d\'École',
        teacher: 'Démo Enseignant',
        student: 'Démo Élève', 
        parent: 'Démo Parent',
        freelancer: 'Démo Freelancer'
      },
      features: {
        director: ['Gestion Complète École', 'Supervision Enseignants', 'Tableau de Bord Financier', 'Analyses Étudiants'],
        teacher: ['Gestion Classes', 'Carnet de Notes', 'Suivi Présences', 'Communication Parents'],
        student: ['Consultation Notes', 'Suivi Devoirs', 'Accès Emploi du Temps', 'Bulletins'],
        parent: ['Surveillance Enfant', 'Suivi GPS', 'Alertes Notes', 'Messages Enseignants'],
        freelancer: ['Cours Privés', 'Facturation Étudiants', 'Gestion Horaires', 'Analyses Progrès']
      }
    }
  };

  const t = text[language];

  const demoRoles = [
    {
      id: 'director',
      icon: <School className="w-6 h-6" />,
      color: 'from-blue-500 to-indigo-600',
      title: t?.roles?.director,
      features: t?.features?.director
    },
    {
      id: 'teacher', 
      icon: <GraduationCap className="w-6 h-6" />,
      color: 'from-green-500 to-emerald-600',
      title: t?.roles?.teacher,
      features: t?.features?.teacher
    },
    {
      id: 'student',
      icon: <BookOpen className="w-6 h-6" />,
      color: 'from-purple-500 to-violet-600', 
      title: t?.roles?.student,
      features: t?.features?.student
    },
    {
      id: 'parent',
      icon: <Users className="w-6 h-6" />,
      color: 'from-orange-500 to-red-600',
      title: t?.roles?.parent,
      features: t?.features?.parent
    },
    {
      id: 'freelancer',
      icon: <User className="w-6 h-6" />,
      color: 'from-teal-500 to-cyan-600',
      title: t?.roles?.freelancer,
      features: t?.features?.freelancer
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-12">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center text-white mr-4">
              <TestTube className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-800">{t.title || ''}</h1>
              <p className="text-xl text-blue-600 mt-2">{t.subtitle}</p>
            </div>
          </div>
          
          <p className="text-gray-600 text-lg max-w-2xl mx-auto mb-8">
            {t.description || ''}
          </p>

          {/* Demo Access Button */}
          <Button
            onClick={() => navigate('/sandbox-login')}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 px-8 rounded-lg transition-all duration-200 transform hover:scale-105 flex items-center space-x-3 mx-auto"
          >
            <Play className="w-5 h-5" />
            <span>{t.testNow}</span>
            <ArrowRight className="w-5 h-5" />
          </Button>

          {/* Demo Environment Badge */}
          <div className="mt-6 inline-flex items-center bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-semibold">
            <Eye className="w-4 h-4 mr-2" />
            {t.fullDemo}
          </div>
        </div>

        {/* Demo Roles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {(Array.isArray(demoRoles) ? demoRoles : []).map((role) => (
            <Card key={role.id} className="p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="text-center">
                {/* Icon */}
                <div className={`w-12 h-12 mx-auto mb-4 bg-gradient-to-r ${role.color} rounded-xl flex items-center justify-center text-white`}>
                  {role.icon}
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-gray-800 mb-4">
                  {role.title || ''}
                </h3>

                {/* Features */}
                <div className="space-y-2">
                  {(Array.isArray(role.features) ? role.features : []).map((feature, idx) => (
                    <div key={idx} className="flex items-center text-sm text-gray-700">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2 flex-shrink-0"></div>
                      {feature}
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              Prêt à tester EDUCAFRIC ?
            </h3>
            <p className="text-gray-600 mb-6">
              Accédez à tous les comptes de démonstration et explorez chaque fonctionnalité de notre plateforme éducative.
            </p>
            <Button
              onClick={() => navigate('/sandbox-login')}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105"
            >
              {t.viewFeatures}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}