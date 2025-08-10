import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building, MapPin } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTeacherMultiSchool } from '@/contexts/TeacherMultiSchoolContext';

const SchoolSelector: React.FC = () => {
  const { language } = useLanguage();
  const { schools, selectedSchoolId, setSelectedSchoolId, isMultiSchool, schoolsLoading } = useTeacherMultiSchool();

  const text = {
    fr: {
      selectSchool: 'Sélectionner l\'établissement',
      allSchools: 'Tous les établissements',
      currentSchool: 'École actuelle'
    },
    en: {
      selectSchool: 'Select school',
      allSchools: 'All schools',
      currentSchool: 'Current school'
    }
  };

  const t = text[language as keyof typeof text];

  // Don't show selector if teacher only works at one school
  if (!isMultiSchool || schoolsLoading) {
    return null;
  }

  return (
    <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
      <div className="flex items-center gap-3">
        <Building className="w-5 h-5 text-blue-600" />
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t.currentSchool}
          </label>
          <Select value={selectedSchoolId} onValueChange={setSelectedSchoolId}>
            <SelectTrigger className="w-full" data-testid="school-selector">
              <SelectValue placeholder={t.selectSchool} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4" />
                  {t.allSchools}
                </div>
              </SelectItem>
              {schools.map((school) => (
                <SelectItem key={school.id} value={school.id.toString()}>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <div>
                      <div className="font-medium">{school.name}</div>
                      <div className="text-sm text-gray-500">{school.location} • {school.role}</div>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default SchoolSelector;