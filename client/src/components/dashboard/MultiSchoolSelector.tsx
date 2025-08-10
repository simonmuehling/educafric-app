import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Building, Users, ChevronDown, CheckCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface School {
  id: number;
  name: string;
  position?: string;
  isCurrent?: boolean;
}

interface TeacherSchools {
  currentSchool: { id: number; name: string } | null;
  affiliatedSchools: School[];
  canManageMultiple: boolean;
}

interface MultiSchoolSelectorProps {
  userId: number;
  onSchoolChange?: (school: { id: number; name: string }) => void;
}

export function MultiSchoolSelector({ userId, onSchoolChange }: MultiSchoolSelectorProps) {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [switching, setSwitching] = useState(false);
  const [schools, setSchools] = useState<TeacherSchools | null>(null);

  useEffect(() => {
    loadTeacherSchools();
  }, [userId]);

  const loadTeacherSchools = async () => {
    setLoading(true);
    try {
      const response = await apiRequest('GET', `/api/auth/teacher-schools/${userId}`);
      const data = await response.json();
      setSchools(data);
    } catch (error) {
      console.error('Erreur chargement écoles enseignant:', error);
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' 
          ? 'Impossible de charger les écoles affiliées' 
          : 'Failed to load affiliated schools',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const switchSchool = async (schoolId: number) => {
    setSwitching(true);
    try {
      const response = await apiRequest('POST', `/api/auth/switch-school/${userId}`, {
        schoolId: parseInt(schoolId.toString())
      });
      
      const data = await response.json();
      
      setSchools(prev => prev ? {
        ...prev,
        currentSchool: data.currentSchool
      } : null);
      
      if (onSchoolChange) {
        onSchoolChange(data.currentSchool);
      }
      
      toast({
        title: language === 'fr' ? 'École changée' : 'School Changed',
        description: language === 'fr' 
          ? `Maintenant connecté à ${data?.currentSchool?.name}` 
          : `Now connected to ${data?.currentSchool?.name}`,
      });
      
    } catch (error) {
      console.error('Erreur changement école:', error);
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' 
          ? 'Impossible de changer d\'école' 
          : 'Failed to switch school',
        variant: 'destructive'
      });
    } finally {
      setSwitching(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-center">
            <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!schools || !schools.canManageMultiple) {
    return null; // Don't show if teacher only has one school
  }

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Building className="w-5 h-5 text-blue-600" />
          {language === 'fr' ? 'Gestion Multi-Établissements' : 'Multi-School Management'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium">
              {language === 'fr' ? 'École active:' : 'Active school:'}
            </span>
            <Badge variant="default" className="ml-2">
              {schools.currentSchool?.name || (language === 'fr' ? 'Aucune' : 'None')}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">
              {Array.isArray(schools?.affiliatedSchools) ? schools.affiliatedSchools.length : 0} {language === 'fr' ? 'écoles' : 'schools'}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">
            {language === 'fr' ? 'Changer d\'établissement:' : 'Switch institution:'}
          </label>
          <Select 
            value={schools.currentSchool?.id.toString() || ""} 
            onValueChange={(value) => switchSchool(parseInt(value))}
            disabled={switching}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={
                language === 'fr' ? 'Sélectionner une école' : 'Select a school'
              } />
              <ChevronDown className="w-4 h-4 ml-2" />
            </SelectTrigger>
            <SelectContent>
              {schools.affiliatedSchools.map((school) => (
                <SelectItem key={school.id} value={school?.id?.toString()}>
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4" />
                      <span>{school.name || ''}</span>
                    </div>
                    {school.position && (
                      <Badge variant="outline" className="ml-2 text-xs">
                        {school.position}
                      </Badge>
                    )}
                    {school.isCurrent && (
                      <CheckCircle className="w-4 h-4 text-green-600 ml-2" />
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {switching && (
          <div className="flex items-center gap-2 text-sm text-blue-600">
            <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full" />
            {language === 'fr' ? 'Changement en cours...' : 'Switching...'}
          </div>
        )}

        <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
          {language === 'fr' 
            ? 'En tant qu\'enseignant multi-établissements, vous pouvez changer votre école active pour gérer différentes classes et élèves.'
            : 'As a multi-school teacher, you can switch your active school to manage different classes and students.'}
        </div>
      </CardContent>
    </Card>
  );
}