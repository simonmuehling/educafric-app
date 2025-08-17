import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { UserPlus, Users, AlertTriangle, Heart } from 'lucide-react';
import EasyChildConnection from '@/components/parent/EasyChildConnection';
import FreelancerChildConnection from '@/components/freelancer/FreelancerChildConnection';
import ChildParentConnection from '@/components/student/ChildParentConnection';
import SmartDuplicateDetection from '@/components/admin/SmartDuplicateDetection';

const UnifiedConnectionManager: React.FC = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [refreshKey, setRefreshKey] = useState(0);

  const text = {
    fr: {
      title: 'Gestion des connexions',
      subtitle: 'Connecter facilement parents, élèves et freelancers',
      parentTab: 'Connexion Parent-Enfant',
      studentTab: 'Connexion Élève-Parent',
      freelancerTab: 'Connexion Freelancer-Élève',
      duplicatesTab: 'Détection de doublons',
      noAccess: 'Accès non autorisé pour votre rôle',
      success: 'Connexion réussie'
    },
    en: {
      title: 'Connection management',
      subtitle: 'Easily connect parents, students, and freelancers',
      parentTab: 'Parent-Child Connection',
      studentTab: 'Student-Parent Connection',
      freelancerTab: 'Freelancer-Student Connection',
      duplicatesTab: 'Duplicate Detection',
      noAccess: 'Access not authorized for your role',
      success: 'Connection successful'
    }
  };

  const t = text[language as keyof typeof text];

  const handleConnectionSuccess = () => {
    setRefreshKey(prev => prev + 1);
  };

  if (!user) return null;

  const canAccessParentConnection = ['Parent', 'Admin', 'Director', 'SiteAdmin'].includes(user.role);
  const canAccessStudentConnection = ['Student', 'Admin', 'Director', 'SiteAdmin'].includes(user.role);
  const canAccessFreelancerConnection = ['Freelancer', 'Admin', 'Director', 'SiteAdmin'].includes(user.role);
  const canAccessDuplicateDetection = ['Admin', 'Director', 'SiteAdmin'].includes(user.role);

  const availableTabs = [];
  
  if (canAccessParentConnection) {
    availableTabs.push({
      value: 'parent',
      label: t.parentTab,
      icon: UserPlus,
      component: (
        <EasyChildConnection 
          parentId={user.id} 
          onConnectionSuccess={handleConnectionSuccess}
        />
      )
    });
  }

  if (canAccessStudentConnection) {
    availableTabs.push({
      value: 'student',
      label: t.studentTab,
      icon: Heart,
      component: (
        <ChildParentConnection 
          studentId={user.id} 
          onConnectionSuccess={handleConnectionSuccess}
        />
      )
    });
  }

  if (canAccessFreelancerConnection) {
    availableTabs.push({
      value: 'freelancer',
      label: t.freelancerTab,
      icon: Users,
      component: (
        <FreelancerChildConnection 
          freelancerId={user.id} 
          onConnectionSuccess={handleConnectionSuccess}
        />
      )
    });
  }

  if (canAccessDuplicateDetection) {
    availableTabs.push({
      value: 'duplicates',
      label: t.duplicatesTab,
      icon: AlertTriangle,
      component: (
        <SmartDuplicateDetection 
          key={refreshKey}
          schoolId={user.schoolId || 1} 
          onDuplicateResolved={handleConnectionSuccess}
        />
      )
    });
  }

  if (availableTabs.length === 0) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="pt-6 text-center">
          <p className="text-gray-600">{t.noAccess}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center space-x-2">
          <Users className="w-6 h-6 text-blue-600" />
          <span>{t.title}</span>
        </CardTitle>
        <p className="text-sm text-gray-600">{t.subtitle}</p>
      </CardHeader>
      
      <CardContent>
        {availableTabs.length === 1 ? (
          // Single tab - show component directly
          <div data-testid="single-connection-component">
            {availableTabs[0].component}
          </div>
        ) : (
          // Multiple tabs - show tab interface
          <Tabs defaultValue={availableTabs[0].value} className="w-full">
            <TabsList className="grid w-full grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {availableTabs.map((tab) => (
                <TabsTrigger 
                  key={tab.value} 
                  value={tab.value}
                  className="flex items-center space-x-2"
                  data-testid={`tab-${tab.value}`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
            
            {availableTabs.map((tab) => (
              <TabsContent 
                key={tab.value} 
                value={tab.value}
                data-testid={`content-${tab.value}`}
              >
                {tab.component}
              </TabsContent>
            ))}
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
};

export default UnifiedConnectionManager;