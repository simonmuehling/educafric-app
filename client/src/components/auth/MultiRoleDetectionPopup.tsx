import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { School, Users, GraduationCap, UserCheck, Building } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { apiRequest } from "@/lib/queryClient";

interface RoleSuggestion {
  role: string;
  reason: string;
  affiliationId: number;
  affiliationName: string;
}

interface MultiRoleSuggestion {
  canJoin: boolean;
  existingRoles: string[];
  suggestedRoles: RoleSuggestion[];
  conflictingRoles: string[];
}

interface MultiRoleDetectionPopupProps {
  isOpen: boolean;
  onClose: () => void;
  phoneNumber: string;
  email: string;
  onRoleSelection: (selectedRoles: RoleSuggestion[]) => void;
}

const roleIcons: { [key: string]: any } = {
  'Director': Building,
  'Admin': UserCheck,
  'Teacher': GraduationCap,
  'Parent': Users,
  'Student': School,
  'Freelancer': GraduationCap
};

const roleTranslations = {
  fr: {
    'Director': 'Directeur',
    'Admin': 'Administrateur',
    'Teacher': 'Enseignant',
    'Parent': 'Parent',
    'Student': 'Étudiant',
    'Freelancer': 'Répétiteur'
  },
  en: {
    'Director': 'Director',
    'Admin': 'Administrator',
    'Teacher': 'Teacher',
    'Parent': 'Parent',
    'Student': 'Student',
    'Freelancer': 'Tutor'
  }
};

export function MultiRoleDetectionPopup({ 
  isOpen, 
  onClose, 
  phoneNumber, 
  email, 
  onRoleSelection 
}: MultiRoleDetectionPopupProps) {
  const { language } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<MultiRoleSuggestion | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<RoleSuggestion[]>([]);

  useEffect(() => {
    if (isOpen && phoneNumber) {
      detectRoles();
    }
  }, [isOpen, phoneNumber]);

  const detectRoles = async () => {
    setLoading(true);
    try {
      const response = await apiRequest('POST', '/api/auth/detect-roles', {
        phoneNumber,
        email
      });
      setSuggestions(response as unknown as MultiRoleSuggestion);
      // Auto-select first suggestion if only one
      if ((response as unknown as MultiRoleSuggestion).suggestedRoles?.length === 1) {
        setSelectedRoles([(response as unknown as MultiRoleSuggestion).suggestedRoles[0]]);
      }
    } catch (error) {
      console.error('Erreur détection rôles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleToggle = (role: RoleSuggestion) => {
    setSelectedRoles(prev => {
      const exists = prev.find(r => r.role === role.role && r.affiliationId === role.affiliationId);
      if (exists) {
        return (Array.isArray(prev) ? prev : []).filter(r => !(r.role === role.role && r.affiliationId === role.affiliationId));
      } else {
        return [...prev, role];
      }
    });
  };

  const handleConfirm = () => {
    onRoleSelection(selectedRoles);
    onClose();
  };

  const getRoleDisplayName = (role: string) => {
    const translations = roleTranslations[language as keyof typeof roleTranslations];
    return translations?.[role as keyof typeof translations] || role;
  };

  const getRoleIcon = (role: string) => {
    const IconComponent = roleIcons[role] || UserCheck;
    return <IconComponent className="w-5 h-5" />;
  };

  if (!isOpen || !suggestions) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getRoleIcon('Users')}
            {language === 'fr' 
              ? 'Affiliations détectées - Rejoindre des établissements' 
              : 'Detected Affiliations - Join Institutions'}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Existing Roles */}
            {suggestions && Array.isArray(suggestions.existingRoles) && suggestions.existingRoles.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">
                    {language === 'fr' ? 'Rôles actuels' : 'Current Roles'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {suggestions.existingRoles.map((role, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {getRoleIcon(role)}
                        {getRoleDisplayName(role)}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Suggested Roles */}
            {suggestions && Array.isArray(suggestions.suggestedRoles) && suggestions.suggestedRoles.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">
                    {language === 'fr' 
                      ? 'Rôles suggérés basés sur votre numéro de téléphone' 
                      : 'Suggested roles based on your phone number'}
                  </CardTitle>
                  <CardDescription>
                    {language === 'fr'
                      ? 'Sélectionnez les rôles que vous souhaitez activer:'
                      : 'Select the roles you want to activate:'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {suggestions.suggestedRoles.map((suggestion, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                      <Checkbox
                        id={`role-${index}`}
                        checked={selectedRoles.some(r => 
                          r.role === suggestion.role && r.affiliationId === suggestion.affiliationId
                        )}
                        onCheckedChange={() => handleRoleToggle(suggestion)}
                      />
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          {getRoleIcon(suggestion.role)}
                          <Badge variant="outline" className="font-medium">
                            {getRoleDisplayName(suggestion.role)}
                          </Badge>
                          <span className="text-sm font-medium text-blue-600">
                            {suggestion.affiliationName}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          {suggestion.reason}
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Conflicting Roles */}
            {suggestions && Array.isArray(suggestions.conflictingRoles) && suggestions.conflictingRoles.length > 0 && (
              <Card className="border-red-200">
                <CardHeader>
                  <CardTitle className="text-sm text-red-600">
                    {language === 'fr' ? 'Rôles en conflit' : 'Conflicting Roles'}
                  </CardTitle>
                  <CardDescription>
                    {language === 'fr'
                      ? 'Ces rôles ne peuvent pas être combinés avec vos rôles actuels:'
                      : 'These roles cannot be combined with your current roles:'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {suggestions.conflictingRoles.map((role, index) => (
                      <Badge key={index} variant="destructive" className="flex items-center gap-1">
                        {getRoleIcon(role)}
                        {getRoleDisplayName(role)}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* No suggestions */}
            {suggestions && suggestions.suggestedRoles.length === 0 && suggestions.conflictingRoles.length === 0 && (
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="text-gray-500">
                    {language === 'fr'
                      ? 'Aucune affiliation détectée pour ce numéro de téléphone.'
                      : 'No affiliations detected for this phone number.'}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={onClose}>
                {language === 'fr' ? 'Passer' : 'Skip'}
              </Button>
              {(Array.isArray(selectedRoles) ? selectedRoles.length : 0) > 0 && (
                <Button onClick={handleConfirm} className="flex items-center gap-2">
                  {getRoleIcon('UserCheck')}
                  {language === 'fr' 
                    ? `Rejoindre (${(Array.isArray(selectedRoles) ? selectedRoles.length : 0)})` 
                    : `Join (${(Array.isArray(selectedRoles) ? selectedRoles.length : 0)})`}
                </Button>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}