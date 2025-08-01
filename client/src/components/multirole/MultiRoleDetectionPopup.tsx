import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Users, School, User, Phone } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface RoleSuggestion {
  role: string;
  schoolName?: string;
  description: string;
  confidence: number;
}

interface MultiRoleDetectionPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRoles: (selectedRoles: string[]) => void;
  suggestions: RoleSuggestion[];
  phone: string;
}

const roleIcons = {
  Teacher: <School className="w-4 h-4" />,
  Parent: <Users className="w-4 h-4" />,
  Commercial: <User className="w-4 h-4" />,
  Director: <School className="w-4 h-4" />,
  Freelancer: <User className="w-4 h-4" />
};

const roleColors = {
  Teacher: 'bg-blue-100 text-blue-800',
  Parent: 'bg-green-100 text-green-800', 
  Commercial: 'bg-purple-100 text-purple-800',
  Director: 'bg-orange-100 text-orange-800',
  Freelancer: 'bg-cyan-100 text-cyan-800'
};

export default function MultiRoleDetectionPopup({
  isOpen,
  onClose,
  onSelectRoles,
  suggestions,
  phone
}: MultiRoleDetectionPopupProps) {
  const { t, language } = useLanguage();
  
  // Role translations mapping
  const roleTranslations = {
    fr: {
      'Teacher': 'Enseignant',
      'Parent': 'Parent', 
      'Commercial': 'Commercial',
      'Director': 'Directeur',
      'Freelancer': 'Répétiteur',
      'Student': 'Étudiant',
      'Admin': 'Administrateur'
    },
    en: {
      'Teacher': 'Teacher',
      'Parent': 'Parent',
      'Commercial': 'Commercial', 
      'Director': 'Director',
      'Freelancer': 'Tutor',
      'Student': 'Student',
      'Admin': 'Administrator'
    }
  };
  
  const getRoleDisplayName = (role: string) => {
    const translations = roleTranslations[language as keyof typeof roleTranslations];
    return translations?.[role as keyof typeof translations] || role;
  };
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

  const handleRoleToggle = (role: string) => {
    setSelectedRoles(prev => 
      prev.includes(role) 
        ? (Array.isArray(prev) ? prev : []).filter(r => r !== role)
        : [...prev, role]
    );
  };

  const handleConfirm = () => {
    onSelectRoles(selectedRoles);
    setSelectedRoles([]);
    onClose();
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.9) return t('multiRole.highConfidence');
    if (confidence >= 0.7) return t('multiRole.mediumConfidence');
    return t('multiRole.lowConfidence');
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-green-600';
    if (confidence >= 0.7) return 'text-yellow-600';
    return 'text-gray-600';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Phone className="w-5 h-5 text-blue-600" />
            {t('multiRole.detectedRoles')}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="text-sm text-gray-700 mb-2">
              {t('multiRole.phoneDetected')}: <span className="font-mono font-semibold">{phone}</span>
            </p>
            <p className="text-sm text-gray-600">
              {t('multiRole.detectionExplanation')}
            </p>
          </div>

          {(Array.isArray(suggestions) ? suggestions.length : 0) > 0 ? (
            <>
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">
                  {t('multiRole.suggestedRoles')}
                </h3>
                <div className="space-y-3">
                  {(Array.isArray(suggestions) ? suggestions : []).map((suggestion, index) => (
                    <div
                      key={index}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        selectedRoles.includes(suggestion.role)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleRoleToggle(suggestion.role)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            {roleIcons[suggestion.role as keyof typeof roleIcons]}
                            <Badge className={roleColors[suggestion.role as keyof typeof roleColors]}>
                              {getRoleDisplayName(suggestion.role)}
                            </Badge>
                          </div>
                          {selectedRoles.includes(suggestion.role) && (
                            <CheckCircle className="w-5 h-5 text-blue-600" />
                          )}
                        </div>
                        <div className="text-sm">
                          <span className={`font-medium ${getConfidenceColor(suggestion.confidence)}`}>
                            {getConfidenceLabel(suggestion.confidence)}
                          </span>
                          <span className="text-gray-500 ml-2">
                            ({Math.round(suggestion.confidence * 100)}%)
                          </span>
                        </div>
                      </div>
                      
                      <div className="mt-2">
                        <p className="text-sm text-gray-700">{suggestion.description || ''}</p>
                        {suggestion.schoolName && (
                          <p className="text-xs text-gray-500 mt-1">
                            {t('multiRole.school')}: {suggestion.schoolName}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <p className="text-sm text-yellow-800">
                  <strong>{t('multiRole.note')}:</strong> {t('multiRole.multiRoleExplanation')}
                </p>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">{t('multiRole.noRolesDetected')}</p>
            </div>
          )}

          <div className="flex justify-between pt-6 border-t">
            <Button variant="outline" onClick={onClose}>
              {t('common.cancel')}
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => onSelectRoles([])}
              >
                {t('multiRole.skipDetection')}
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={(Array.isArray(selectedRoles) ? selectedRoles.length : 0) === 0}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {t('multiRole.confirmRoles')} ({(Array.isArray(selectedRoles) ? selectedRoles.length : 0)})
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}