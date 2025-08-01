import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  School, 
  Users, 
  GraduationCap, 
  Baby, 
  BookOpen,
  Building2,
  DollarSign,
  MapPin,
  Bell,
  Calendar,
  TrendingUp,
  Phone,
  CreditCard,
  MessageSquare,
  Target,
  BarChart3,
  Settings,
  Shield
} from 'lucide-react';

interface RoleFeature {
  title: string;
  description: string;
  icon: any;
  capabilities: string[];
  color: string;
}

export default function RoleSummary() {
  const { language } = useLanguage();

  const roleFeatures: Record<string, RoleFeature> = {
    director: {
      title: language === 'fr' ? 'Directeur d\'École' : 'School Director',
      description: language === 'fr' ? 'Supervision complète de l\'établissement' : 'Complete institution supervision',
      icon: School,
      color: 'bg-gradient-to-br from-blue-600 to-purple-600',
      capabilities: language === 'fr' ? [
        'Gestion globale de l\'école',
        'Supervision du personnel enseignant',
        'Administration financière',
        'Rapports et analytics avancés',
        'Gestion des inscriptions',
        'Paramètres institutionnels'
      ] : [
        'Overall school management',
        'Teaching staff supervision',
        'Financial administration',
        'Advanced reports and analytics',
        'Enrollment management',
        'Institutional settings'
      ]
    },
    teacher: {
      title: language === 'fr' ? 'Enseignant' : 'Teacher',
      description: language === 'fr' ? 'Gestion pédagogique et suivi des élèves' : 'Educational management and student monitoring',
      icon: GraduationCap,
      color: 'bg-gradient-to-br from-green-500 to-emerald-600',
      capabilities: language === 'fr' ? [
        'Gestion des classes',
        'Évaluation et notation',
        'Suivi de présence',
        'Communication avec parents',
        'Planification des cours',
        'Gestion des devoirs'
      ] : [
        'Class management',
        'Assessment and grading',
        'Attendance tracking',
        'Parent communication',
        'Lesson planning',
        'Homework management'
      ]
    },
    parent: {
      title: language === 'fr' ? 'Parent' : 'Parent',
      description: language === 'fr' ? 'Suivi éducatif et sécurité des enfants' : 'Educational monitoring and child safety',
      icon: Baby,
      color: 'bg-gradient-to-br from-pink-500 to-rose-600',
      capabilities: language === 'fr' ? [
        'Suivi académique des enfants',
        'Géolocalisation en temps réel',
        'Communication avec l\'école',
        'Gestion des paiements',
        'Notifications SMS/WhatsApp',
        'Suivi des devoirs'
      ] : [
        'Child academic monitoring',
        'Real-time GPS tracking',
        'School communication',
        'Payment management',
        'SMS/WhatsApp notifications',
        'Homework tracking'
      ]
    },
    student: {
      title: language === 'fr' ? 'Élève' : 'Student',
      description: language === 'fr' ? 'Apprentissage interactif et suivi personnel' : 'Interactive learning and personal tracking',
      icon: BookOpen,
      color: 'bg-gradient-to-br from-indigo-500 to-blue-600',
      capabilities: language === 'fr' ? [
        'Consultation des notes',
        'Emploi du temps personnel',
        'Devoirs et exercices',
        'Communication avec enseignants',
        'Suivi de progression',
        'Ressources pédagogiques'
      ] : [
        'Grade consultation',
        'Personal timetable',
        'Homework and exercises',
        'Teacher communication',
        'Progress tracking',
        'Educational resources'
      ]
    },
    commercial: {
      title: language === 'fr' ? 'Commercial' : 'Commercial',
      description: language === 'fr' ? 'Développement commercial et gestion clientèle' : 'Business development and client management',
      icon: DollarSign,
      color: 'bg-gradient-to-br from-yellow-500 to-orange-600',
      capabilities: language === 'fr' ? [
        'Gestion CRM',
        'Suivi des prospects',
        'Négociation contrats',
        'Analytics commerciales',
        'Gestion pipeline ventes',
        'Rapports de performance'
      ] : [
        'CRM management',
        'Prospect tracking',
        'Contract negotiation',
        'Commercial analytics',
        'Sales pipeline management',
        'Performance reports'
      ]
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-900 p-6">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
          {language === 'fr' ? 'Système de Rôles EDUCAFRIC' : 'EDUCAFRIC Role System'}
        </h1>
        <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
          {language === 'fr' 
            ? 'Plateforme éducative complète avec 5 rôles spécialisés pour l\'écosystème scolaire africain'
            : 'Complete educational platform with 5 specialized roles for the African school ecosystem'
          }
        </p>
      </div>

      {/* Role Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {Object.entries(roleFeatures).map(([key, role]) => (
          <Card key={key} className="hover:shadow-xl transition-all duration-300 border-0 overflow-hidden group">
            <div className={`h-2 ${role.color}`} />
            
            <CardHeader className="pb-4">
              <div className="flex items-center gap-4 mb-4">
                <div className={`p-4 rounded-2xl ${role.color} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <role.icon className="h-8 w-8" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold">{role.title || ''}</CardTitle>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                    {role.description || ''}
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Capabilities */}
              <div>
                <h4 className="font-semibold text-sm text-slate-700 dark:text-slate-300 mb-3">
                  {language === 'fr' ? 'Fonctionnalités Principales' : 'Key Capabilities'}
                </h4>
                <div className="space-y-2">
                  {(Array.isArray(role.capabilities) ? role.capabilities : []).map((capability, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <span className="text-sm text-slate-600 dark:text-slate-300">{capability}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status Badge */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                <Badge className="w-full justify-center bg-green-100 text-green-700 hover:bg-green-200">
                  {language === 'fr' ? '✓ Disponible' : '✓ Available'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Feature Highlights */}
      <div className="mt-16 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">
          {language === 'fr' ? 'Fonctionnalités Transversales' : 'Cross-Role Features'}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="text-center p-6 border-0 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
            <MapPin className="h-12 w-12 mx-auto mb-4 text-blue-600" />
            <h3 className="font-bold mb-2">{language === 'fr' ? 'Géolocalisation GPS' : 'GPS Tracking'}</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              {language === 'fr' ? 'Suivi temps réel des élèves' : 'Real-time student tracking'}
            </p>
          </Card>

          <Card className="text-center p-6 border-0 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
            <Bell className="h-12 w-12 mx-auto mb-4 text-green-600" />
            <h3 className="font-bold mb-2">{language === 'fr' ? 'Notifications SMS' : 'SMS Notifications'}</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              {language === 'fr' ? 'Alertes automatiques' : 'Automated alerts'}
            </p>
          </Card>

          <Card className="text-center p-6 border-0 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
            <CreditCard className="h-12 w-12 mx-auto mb-4 text-purple-600" />
            <h3 className="font-bold mb-2">{language === 'fr' ? 'Paiements CFA' : 'CFA Payments'}</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              {language === 'fr' ? 'Gestion financière' : 'Financial management'}
            </p>
          </Card>

          <Card className="text-center p-6 border-0 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 text-yellow-600" />
            <h3 className="font-bold mb-2">{language === 'fr' ? 'Communication' : 'Communication'}</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              {language === 'fr' ? 'WhatsApp & SMS intégrés' : 'Integrated WhatsApp & SMS'}
            </p>
          </Card>
        </div>
      </div>

      {/* Call to Action */}
      <div className="mt-16 text-center">
        <Card className="max-w-2xl mx-auto p-8 border-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <h3 className="text-2xl font-bold mb-4">
            {language === 'fr' ? 'Prêt pour l\'Afrique' : 'Ready for Africa'}
          </h3>
          <p className="mb-6">
            {language === 'fr' 
              ? 'Solution complète adaptée aux besoins éducatifs africains avec support bilingue'
              : 'Complete solution adapted to African educational needs with bilingual support'
            }
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Badge className="bg-white/20 text-white border-white/30 px-4 py-2">
              🇨🇲 Cameroun Launch
            </Badge>
            <Badge className="bg-white/20 text-white border-white/30 px-4 py-2">
              💰 CFA Pricing
            </Badge>
            <Badge className="bg-white/20 text-white border-white/30 px-4 py-2">
              🌍 Bilingual FR/EN
            </Badge>
            <Badge className="bg-white/20 text-white border-white/30 px-4 py-2">
              📱 Mobile First
            </Badge>
          </div>
        </Card>
      </div>
    </div>
  );
}