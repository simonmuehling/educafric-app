import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { 
  User, GraduationCap, Users, BookOpen, Briefcase, 
  Settings, Shield, Play, TestTube, Zap, Crown
} from 'lucide-react';

const SandboxLogin = () => {
  const { language } = useLanguage();
  const { login } = useAuth();
  const [, setLocation] = useLocation();
  const [isLogging, setIsLogging] = useState<string | null>(null);

  const text = {
    fr: {
      title: 'EDUCAFRIC - Mode Sandbox',
      subtitle: 'Environnement de test éducatif avec toutes les fonctionnalités premium',
      selectProfile: 'Sélectionnez un profil éducatif pour tester',
      allFeatures: 'Toutes les fonctionnalités',
      premiumAccess: 'Accès Premium',
      testing: 'Test en cours...',
      directAccess: 'Accès Direct',
      description: '6 profils éducatifs avec tous les modules premium débloqués pour une démonstration complète',
      features: {
        parent: 'Suivi enfants, géolocalisation, paiements, communications',
        student: 'Cours, devoirs, notes, emploi du temps, ressources',
        teacher: 'Classes, présences, notes, bulletins, communications',
        freelancer: 'Élèves, séances, paiements, analyses, géolocalisation',
        admin: 'Gestion école, utilisateurs, système, sécurité',
        director: 'Supervision, rapports, validations, communications'
      }
    },
    en: {
      title: 'EDUCAFRIC - Sandbox Mode',
      subtitle: 'Educational testing environment with all premium features',
      selectProfile: 'Select an educational profile to test',
      allFeatures: 'All Features',
      premiumAccess: 'Premium Access',
      testing: 'Testing...',
      directAccess: 'Direct Access',
      description: '6 educational profiles with all premium modules unlocked for complete demonstration',
      features: {
        parent: 'Child tracking, geolocation, payments, communications',
        student: 'Classes, homework, grades, timetable, resources',
        teacher: 'Classes, attendance, grades, reports, communications',
        freelancer: 'Students, sessions, payments, analytics, geolocation',
        admin: 'School management, users, system, security',
        director: 'Supervision, reports, validations, communications'
      }
    }
  };

  const t = text[language as keyof typeof text];

  const sandboxProfiles = [
    {
      id: 'parent',
      name: 'Marie Kamga',
      realName: language === 'fr' ? 'Parent (Marie Kamga)' : 'Parent (Marie Kamga)',
      email: 'sandbox.parent@educafric.demo',
      password: 'sandbox123',
      icon: <Users className="w-8 h-8" />,
      color: 'bg-blue-500',
      role: 'Parent',
      description: t?.features?.parent,
      modules: 11,
      details: language === 'fr' ? 'Infirmière, mère de Junior Kamga (3ème A)' : 'Nurse, mother of Junior Kamga (Grade 9A)'
    },
    {
      id: 'student',
      name: 'Junior Kamga',
      realName: language === 'fr' ? 'Élève (Junior Kamga)' : 'Student (Junior Kamga)',
      email: 'sandbox.student@educafric.demo',
      password: 'sandbox123',
      icon: <GraduationCap className="w-8 h-8" />,
      color: 'bg-green-500',
      role: 'Student',
      description: t?.features?.student,
      modules: 13,
      details: language === 'fr' ? '14 ans, 3ème A, fils de Marie Kamga' : '14 years old, Grade 9A, son of Marie Kamga'
    },
    {
      id: 'teacher',
      name: 'Paul Mvondo',
      realName: language === 'fr' ? 'Enseignant (Paul Mvondo)' : 'Teacher (Paul Mvondo)',
      email: 'sandbox.teacher@educafric.demo',
      password: 'sandbox123',
      icon: <BookOpen className="w-8 h-8" />,
      color: 'bg-purple-500',
      role: 'Teacher',
      description: t?.features?.teacher,
      modules: 8,
      details: language === 'fr' ? 'Prof de Maths/Physique, 8 ans d\'expérience' : 'Math/Physics teacher, 8 years experience'
    },
    {
      id: 'freelancer',
      name: 'Sophie Biya',
      realName: language === 'fr' ? 'Répétiteur (Sophie Biya)' : 'Tutor (Sophie Biya)',
      email: 'sandbox.freelancer@educafric.demo',
      password: 'sandbox123',
      icon: <User className="w-8 h-8" />,
      color: 'bg-orange-500',
      role: 'Freelancer',
      description: t?.features?.freelancer,
      modules: 11,
      details: language === 'fr' ? 'Répétiteur de Junior, spécialiste examens' : 'Junior\'s tutor, exam specialist'
    },

    {
      id: 'admin',
      name: 'Joseph Atangana',
      realName: language === 'fr' ? 'Admin École (Joseph Atangana)' : 'School Admin (Joseph Atangana)',
      email: 'sandbox.admin@educafric.demo',
      password: 'sandbox123',
      icon: <Settings className="w-8 h-8" />,
      color: 'bg-red-500',
      role: 'Admin',
      description: t?.features?.admin,
      modules: 13,
      details: language === 'fr' ? 'Directeur des Études, 12 ans d\'expérience' : 'Academic Director, 12 years experience'
    },
    {
      id: 'director',
      name: 'Dr. Christiane Fouda',
      realName: language === 'fr' ? 'Directrice (Dr. Christiane Fouda)' : 'Director (Dr. Christiane Fouda)',
      email: 'sandbox.director@educafric.demo',
      password: 'sandbox123',
      icon: <Crown className="w-8 h-8" />,
      color: 'bg-yellow-500',
      role: 'Director',
      description: t?.features?.director,
      modules: 13,
      details: language === 'fr' ? 'Directrice Générale, Doctorat en Éducation' : 'General Director, PhD in Education'
    },

  ];

  const handleSandboxLogin = async (profile: typeof sandboxProfiles[0]) => {
    setIsLogging(profile.id);
    
    try {
      // Direct login with sandbox credentials
      const response = await fetch('/api/auth/sandbox-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: profile.email,
          password: 'sandbox123'
        }),
      });

      if (response.ok) {
        const userData = await response.json();
        console.log('✅ Sandbox login successful, navigating to dashboard:', userData);
        
        // Navigate to role-specific dashboard immediately
        const roleRoutes = {
          Parent: '/parent',
          Student: '/student',
          Teacher: '/teacher',
          Freelancer: '/freelancer',
          Admin: '/admin',
          Director: '/director',
          SiteAdmin: '/admin'
        };
        
        const targetRoute = roleRoutes[profile.role as keyof typeof roleRoutes];
        console.log('🎯 Redirecting to:', targetRoute);
        
        // Small delay to ensure session is established, then redirect
        setTimeout(() => {
          if (window && window.location) {
            window.location.href = targetRoute;
          }
        }, 500);
      } else {
        const error = await response.json();
        console.error('Sandbox login failed:', error);
      }
    } catch (error) {
      console.error('Sandbox login error:', error);
    } finally {
      setIsLogging(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {t.title || ''}
            </h1>
          </div>
          <p className="text-xl text-gray-600 mb-2">{t.subtitle}</p>
          <p className="text-gray-500">{t.description || ''}</p>
          
          <div className="flex items-center justify-center gap-4 mt-4">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <Zap className="w-4 h-4 mr-1" />
              {t.allFeatures}
            </Badge>
            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
              <Crown className="w-4 h-4 mr-1" />
              {t.premiumAccess}
            </Badge>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              <Play className="w-4 h-4 mr-1" />
              {t.directAccess}
            </Badge>
          </div>
        </div>

        {/* Profile Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(Array.isArray(sandboxProfiles) ? sandboxProfiles : []).map((profile) => (
            <Card 
              key={profile.id} 
              className="hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-2 hover:border-blue-200"
            >
              <CardHeader className="text-center pb-4">
                <div className={`w-16 h-16 ${profile.color} rounded-2xl flex items-center justify-center mx-auto mb-3 text-white shadow-lg`}>
                  {profile.icon}
                </div>
                <CardTitle className="text-lg">{profile.name || ''}</CardTitle>
                <p className="text-sm text-blue-600 font-medium">
                  {profile.realName || profile.name}
                </p>
                {profile.details && (
                  <p className="text-xs text-gray-600 mt-1">
                    {profile.details}
                  </p>
                )}
                <Badge variant="secondary" className="mt-2">
                  {profile.modules} {language === 'fr' ? 'modules' : 'modules'}
                </Badge>
              </CardHeader>

              <CardContent className="pt-0">
                <p className="text-sm text-gray-600 mb-4 min-h-[3rem]">
                  {profile.description || ''}
                </p>
                
                <div className="space-y-2 mb-4">
                  <div className="text-xs text-gray-500">
                    <strong>Email:</strong> {profile.email || ''}
                  </div>
                  <div className="text-xs text-gray-500">
                    <strong>Rôle:</strong> {profile.role}
                  </div>
                </div>

                <Button
                  onClick={() => handleSandboxLogin(profile)}
                  disabled={isLogging === profile.id}
                  className={`w-full ${profile.color} hover:opacity-90 text-white font-medium`}
                >
                  {isLogging === profile.id ? (
                    <>
                      <TestTube className="w-4 h-4 mr-2 animate-spin" />
                      {language === 'fr' ? 'Connexion...' : 'Connecting...'}
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      {language === 'fr' ? 'Accéder au Dashboard' : 'Access Dashboard'}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>



        {/* Footer Info */}
        <div className="mt-12 text-center">
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-none">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Shield className="w-5 h-5 text-blue-600" />
                <span className="font-semibold text-blue-800">
                  {language === 'fr' ? 'Environnement Éducatif Sandbox' : 'Educational Sandbox Environment'}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                {language === 'fr' 
                  ? 'Environnement éducatif isolé avec données fictives réalistes. Famille connectée: Marie Kamga (parent) ↔ Junior Kamga (élève, 3ème A) ↔ Paul Mvondo (enseignant) ↔ Sophie Biya (répétiteur).'
                  : 'Isolated educational environment with realistic fictional data. Connected family: Marie Kamga (parent) ↔ Junior Kamga (student, Grade 9A) ↔ Paul Mvondo (teacher) ↔ Sophie Biya (tutor).'
                }
              </p>
              <div className="flex flex-wrap justify-center gap-2 text-xs">
                <Badge variant="outline" className="bg-blue-50">
                  {language === 'fr' ? '🏫 École Sandbox' : '🏫 Sandbox School'}
                </Badge>
                <Badge variant="outline" className="bg-green-50">
                  {language === 'fr' ? '👨‍👩‍👧‍👦 Relations Familiales' : '👨‍👩‍👧‍👦 Family Relations'}
                </Badge>
                <Badge variant="outline" className="bg-purple-50">
                  {language === 'fr' ? '📊 Données Réalistes' : '📊 Realistic Data'}
                </Badge>
                <Badge variant="outline" className="bg-orange-50">
                  {language === 'fr' ? '🎯 Accès Premium Complet' : '🎯 Full Premium Access'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SandboxLogin;