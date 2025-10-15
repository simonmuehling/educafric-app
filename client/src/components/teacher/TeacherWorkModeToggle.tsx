import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { School, User, Users } from 'lucide-react';

interface TeacherWorkModeToggleProps {
  currentMode: 'school' | 'independent' | 'hybrid';
  onModeChange: (mode: 'school' | 'independent') => void;
}

const TeacherWorkModeToggle: React.FC<TeacherWorkModeToggleProps> = ({ currentMode, onModeChange }) => {
  const { language } = useLanguage();

  const text = {
    fr: {
      schoolMode: 'Mode École',
      independentMode: 'Mode Répétiteur',
      currentMode: 'Mode Actuel',
      switchTo: 'Basculer vers'
    },
    en: {
      schoolMode: 'School Mode',
      independentMode: 'Tutor Mode',
      currentMode: 'Current Mode',
      switchTo: 'Switch to'
    }
  };

  const t = text[language];

  // For hybrid teachers, show toggle
  if (currentMode === 'hybrid') {
    return (
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              <span className="font-medium">{t.currentMode}:</span>
              <Badge variant="outline">Hybrid</Badge>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onModeChange('school')}
                data-testid="button-switch-school"
              >
                <School className="w-4 h-4 mr-2" />
                {t.schoolMode}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onModeChange('independent')}
                data-testid="button-switch-independent"
              >
                <User className="w-4 h-4 mr-2" />
                {t.independentMode}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // For school-only or independent-only, show current mode
  return (
    <div className="mb-4 flex items-center gap-2">
      {currentMode === 'school' && <School className="w-5 h-5 text-primary" />}
      {currentMode === 'independent' && <User className="w-5 h-5 text-primary" />}
      <span className="font-medium">{t.currentMode}:</span>
      <Badge>{currentMode === 'school' ? t.schoolMode : t.independentMode}</Badge>
    </div>
  );
};

export default TeacherWorkModeToggle;
