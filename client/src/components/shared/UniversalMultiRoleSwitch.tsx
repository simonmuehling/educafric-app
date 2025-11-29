import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { 
  User, Users, UserCheck, Building2, 
  ChevronRight, Settings, Shield,
  Home, School, Briefcase, GraduationCap, Loader2
} from 'lucide-react';

interface UniversalMultiRoleProps {
  onRoleSwitch?: (role: string) => void;
  currentUserRole?: string;
}

interface UserRoleData {
  primaryRole: string;
  activeRole: string;
  secondaryRoles: string[];
  affiliations: Array<{
    id: number;
    role: string;
    schoolId?: number;
    description?: string;
    status: string;
  }>;
}

const UniversalMultiRoleSwitch: React.FC<UniversalMultiRoleProps> = ({ 
  onRoleSwitch, 
  currentUserRole 
}) => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [selectedRole, setSelectedRole] = useState<string>(currentUserRole || (user as any)?.activeRole || user?.role || 'Parent');
  const [isSwitching, setIsSwitching] = useState(false);

  // Fetch actual user roles from API
  const { data: userRoleData, isLoading: isLoadingRoles } = useQuery<UserRoleData>({
    queryKey: ['/api/multi-role/user-roles'],
    enabled: !!user?.id
  });

  // Build available roles list from actual user data
  const userRoles = useMemo(() => {
    const roles: Array<{
      role: string;
      icon: React.ReactNode;
      color: string;
      schools: string[];
      description: string;
      active: boolean;
    }> = [];

    const getRoleIcon = (role: string) => {
      switch (role) {
        case 'Teacher': return <GraduationCap className="w-5 h-5" />;
        case 'Parent': return <Home className="w-5 h-5" />;
        case 'Student': return <User className="w-5 h-5" />;
        case 'Freelancer': return <Briefcase className="w-5 h-5" />;
        case 'Commercial': return <Building2 className="w-5 h-5" />;
        case 'Director': return <School className="w-5 h-5" />;
        default: return <User className="w-5 h-5" />;
      }
    };

    const getRoleColor = (role: string) => {
      switch (role) {
        case 'Teacher': return 'bg-blue-500';
        case 'Parent': return 'bg-green-500';
        case 'Student': return 'bg-orange-500';
        case 'Freelancer': return 'bg-purple-500';
        case 'Commercial': return 'bg-red-500';
        case 'Director': return 'bg-indigo-500';
        default: return 'bg-gray-500';
      }
    };

    const getRoleDescription = (role: string) => {
      const descriptions: Record<string, { fr: string; en: string }> = {
        Teacher: { fr: 'Enseignant', en: 'Teacher' },
        Parent: { fr: 'Parent d\'élève', en: 'Student Parent' },
        Student: { fr: 'Élève', en: 'Student' },
        Freelancer: { fr: 'Formateur indépendant', en: 'Freelance Trainer' },
        Commercial: { fr: 'Représentant commercial', en: 'Commercial Representative' },
        Director: { fr: 'Directeur d\'école', en: 'School Director' }
      };
      return descriptions[role]?.[language as 'fr' | 'en'] || role;
    };

    // Add primary role
    if (userRoleData?.primaryRole) {
      roles.push({
        role: userRoleData.primaryRole,
        icon: getRoleIcon(userRoleData.primaryRole),
        color: getRoleColor(userRoleData.primaryRole),
        schools: [],
        description: getRoleDescription(userRoleData.primaryRole),
        active: true
      });
    } else if (user?.role) {
      // Fallback to user.role if API data not available
      roles.push({
        role: user.role,
        icon: getRoleIcon(user.role),
        color: getRoleColor(user.role),
        schools: [],
        description: getRoleDescription(user.role),
        active: true
      });
    }

    // Add secondary roles
    if (userRoleData?.secondaryRoles) {
      for (const role of userRoleData.secondaryRoles) {
        if (!roles.some(r => r.role === role)) {
          roles.push({
            role,
            icon: getRoleIcon(role),
            color: getRoleColor(role),
            schools: [],
            description: getRoleDescription(role),
            active: true
          });
        }
      }
    }

    return roles;
  }, [userRoleData, user, language]);

  // Update selected role when data loads
  useEffect(() => {
    if (userRoleData?.activeRole) {
      setSelectedRole(userRoleData.activeRole);
    } else if ((user as any)?.activeRole) {
      setSelectedRole((user as any).activeRole);
    } else if (user?.role) {
      setSelectedRole(user.role);
    }
  }, [userRoleData, user]);

  const text = {
    fr: {
      title: 'Profils Multi-Rôles',
      subtitle: 'Gérez vos différents rôles dans l\'écosystème éducatif',
      currentRole: 'Rôle Actuel',
      switchTo: 'Changer vers',
      availableRoles: 'Rôles Disponibles',
      schools: 'Établissements',
      description: 'Description',
      switch: 'Changer',
      settings: 'Paramètres',
      manage: 'Gérer les Rôles',
      benefits: 'Avantages Multi-Rôles',
      completeView: 'Vue Complète',
      completeViewDesc: 'Accès complet à tous vos rôles',
      secure: 'Sécurisé',
      secureDesc: 'Authentification unique sécurisée',
      flexible: 'Flexible',
      flexibleDesc: 'Changement de rôle instantané'
    },
    en: {
      title: 'Multi-Role Profiles',
      subtitle: 'Manage your different roles in the educational ecosystem',
      currentRole: 'Current Role',
      switchTo: 'Switch to',
      availableRoles: 'Available Roles',
      schools: 'Schools',
      description: 'Description',
      switch: 'Switch',
      settings: 'Settings',
      manage: 'Manage Roles',
      benefits: 'Multi-Role Benefits',
      completeView: 'Complete View',
      completeViewDesc: 'Full access to all your roles',
      secure: 'Secure',
      secureDesc: 'Secure single authentication',
      flexible: 'Flexible',
      flexibleDesc: 'Instant role switching'
    }
  };

  const t = text[language as keyof typeof text];

  const handleRoleSwitch = async (newRole: string) => {
    if (isSwitching) return;
    
    try {
      setIsSwitching(true);
      
      // Call API to switch role
      const response = await apiRequest('POST', '/api/multi-role/switch-role', { newRole });
      const data = await response.json();
      
      if (data.success) {
        setSelectedRole(newRole);
        
        // Show success message
        toast({
          title: language === 'fr' ? 'Rôle changé avec succès' : 'Role switched successfully',
          description: language === 'fr' 
            ? `Vous êtes maintenant connecté en tant que ${newRole}`
            : `You are now logged in as ${newRole}`,
        });
        
        // Call optional callback
        if (onRoleSwitch) {
          onRoleSwitch(newRole);
        }
        
        // Redirect to appropriate dashboard
        const roleRoutes: Record<string, string> = {
          'Teacher': '/teacher',
          'Parent': '/parent',
          'Student': '/student',
          'Freelancer': '/freelancer',
          'Commercial': '/commercial',
          'Director': '/director',
          'Admin': '/admin'
        };
        
        const targetRoute = roleRoutes[newRole] || '/';
        setTimeout(() => setLocation(targetRoute), 500);
      } else {
        throw new Error(data.error || data.message || 'Failed to switch role');
      }
    } catch (error: any) {
      console.error('[ROLE_SWITCH] Error:', error);
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: error.message || (language === 'fr' 
          ? 'Impossible de changer de rôle' 
          : 'Failed to switch role'),
        variant: 'destructive'
      });
    } finally {
      setIsSwitching(false);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'Teacher':
        return <GraduationCap className="w-5 h-5" />;
      case 'Parent':
        return <Home className="w-5 h-5" />;
      case 'Student':
        return <User className="w-5 h-5" />;
      case 'Freelancer':
        return <Briefcase className="w-5 h-5" />;
      case 'Commercial':
        return <Building2 className="w-5 h-5" />;
      default:
        return <User className="w-5 h-5" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Teacher':
        return 'bg-blue-500';
      case 'Parent':
        return 'bg-green-500';
      case 'Student':
        return 'bg-orange-500';
      case 'Freelancer':
        return 'bg-purple-500';
      case 'Commercial':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t.title || ''}</h1>
          <p className="text-gray-600 mt-1">{t.subtitle}</p>
        </div>
        <Button 
          variant="outline" 
          className="border-gray-300"
          onClick={() => {
            // Add settings logic here
          }}
        >
          <Settings className="w-4 h-4 mr-2" />
          {t.manage}
        </Button>
      </div>

      {/* Current Role Card */}
      <Card className="border-2 border-blue-200 bg-blue-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className={`p-3 ${getRoleColor(selectedRole)} rounded-lg text-white`}>
                {getRoleIcon(selectedRole)}
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">{t.currentRole}</h3>
                <Badge className="bg-blue-100 text-blue-800 mt-1">
                  {selectedRole}
                </Badge>
              </div>
            </div>
            <Shield className="w-6 h-6 text-blue-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center">
              <Building2 className="w-4 h-4 text-gray-500 mr-2" />
              <span className="text-sm text-gray-600">
                {userRoles.find(r => r.role === selectedRole)?.schools.join(', ')}
              </span>
            </div>
            <div className="flex items-center">
              <User className="w-4 h-4 text-gray-500 mr-2" />
              <span className="text-sm text-gray-600">
                {userRoles.find(r => r.role === selectedRole)?.description}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Available Roles */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">{t.availableRoles}</h2>
        {isLoadingRoles ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-blue-500 mr-2" />
            <span className="text-gray-600">
              {language === 'fr' ? 'Chargement des rôles...' : 'Loading roles...'}
            </span>
          </div>
        ) : userRoles.length <= 1 ? (
          <Card className="border-dashed border-2 border-gray-200 bg-gray-50">
            <CardContent className="py-8 text-center">
              <User className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">
                {language === 'fr' 
                  ? 'Vous n\'avez qu\'un seul rôle actuellement. Contactez un administrateur pour ajouter des rôles supplémentaires.'
                  : 'You currently have only one role. Contact an administrator to add additional roles.'}
              </p>
            </CardContent>
          </Card>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(Array.isArray(userRoles) ? userRoles : []).filter(role => role.role !== selectedRole).map((role) => (
            <Card key={role.role} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`p-2 ${role.color} rounded-lg text-white`}>
                      {role.icon}
                    </div>
                    <div className="ml-3">
                      <h3 className="font-semibold text-gray-900">{role.role}</h3>
                      <Badge variant="outline" className="text-xs mt-1">
                        {role.schools.length} établissement{role.schools.length > 1 ? 's' : ''}
                      </Badge>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Building2 className="w-4 h-4 text-gray-500 mr-2" />
                    <span className="text-sm text-gray-600 truncate">
                      {role.schools.join(', ')}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <User className="w-4 h-4 text-gray-500 mr-2" />
                    <span className="text-sm text-gray-600">
                      {role.description || ''}
                    </span>
                  </div>
                  <Button
                    onClick={() => handleRoleSwitch(role.role)}
                    className={`w-full mt-3 ${role.color} hover:opacity-90`}
                    size="sm"
                    disabled={isSwitching}
                    data-testid={`button-switch-${(role.role || '').toLowerCase()}`}
                  >
                    {isSwitching ? (language === 'fr' ? 'Changement...' : 'Switching...') : `${t.switchTo} ${role.role}`}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        )}
      </div>

      {/* Multi-Role Benefits */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardContent className="p-6">
          <div className="flex items-center mb-4">
            <Users className="w-6 h-6 text-purple-600 mr-3" />
            <h3 className="text-lg font-semibold text-gray-900">
              {t.benefits}
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <UserCheck className="w-6 h-6 text-purple-600" />
              </div>
              <p className="text-sm font-medium text-gray-900">{t.completeView}</p>
              <p className="text-xs text-gray-600 mt-1">
                {t.completeViewDesc}
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <p className="text-sm font-medium text-gray-900">{t.secure}</p>
              <p className="text-xs text-gray-600 mt-1">
                {t.secureDesc}
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Settings className="w-6 h-6 text-green-600" />
              </div>
              <p className="text-sm font-medium text-gray-900">{t.flexible}</p>
              <p className="text-xs text-gray-600 mt-1">
                {t.flexibleDesc}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UniversalMultiRoleSwitch;