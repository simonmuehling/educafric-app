import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { School, RefreshCw, CheckCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface School {
  id: number;
  name: string;
  isActive: boolean;
}

interface MultiSchoolSelectorProps {
  className?: string;
}

export default function MultiSchoolSelector({ className }: MultiSchoolSelectorProps) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>('');

  // Get teacher's schools
  const { data: schoolsData, isLoading } = useQuery({
    queryKey: ['/api/multirole/teacher-schools'],
    queryFn: () => apiRequest('GET', '/api/multirole/teacher-schools')
  });

  const schools: School[] = schoolsData ? (schoolsData as any).schools || [] : [];
  const activeSchool = schools.find(school => school.isActive);

  // Switch school mutation
  const switchSchoolMutation = useMutation({
    mutationFn: (schoolId: number) => 
      apiRequest('POST', '/api/multirole/switch-school', { schoolId }),
    onSuccess: (data, schoolId) => {
      const school = schools.find(s => s.id === schoolId);
      toast({
        title: t('multiRole.schoolSwitched'),
        description: `${t('multiRole.nowActiveAt')} ${school?.name}`,
      });
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['/api/multirole/teacher-schools'] });
      queryClient.invalidateQueries({ queryKey: ['/api/teachers/school'] });
      queryClient.invalidateQueries({ queryKey: ['/api/classes/teacher'] });
      
      // Refresh page to update dashboard context
      setTimeout(() => window?.location?.reload(), 1000);
    },
    onError: (error: any) => {
      toast({
        title: t('common.error'),
        description: error.message || t('multiRole.switchSchoolError'),
        variant: 'destructive'
      });
    }
  });

  useEffect(() => {
    if (activeSchool) {
      setSelectedSchoolId(activeSchool?.id?.toString());
    }
  }, [activeSchool]);

  const handleSchoolSwitch = () => {
    if (selectedSchoolId && selectedSchoolId !== activeSchool?.id.toString()) {
      switchSchoolMutation.mutate(parseInt(selectedSchoolId));
    }
  };

  if ((Array.isArray(schools) ? schools.length : 0) <= 1) {
    return null; // Don't show selector if teacher only has one school
  }

  return (
    <div className={`flex items-center gap-3 p-3 bg-white border rounded-lg shadow-sm ${className}`}>
      <div className="flex items-center gap-2">
        <School className="w-4 h-4 text-blue-600" />
        <span className="text-sm font-medium text-gray-700">
          {t('multiRole.activeSchool')}:
        </span>
      </div>
      
      <div className="flex items-center gap-2 flex-1">
        <Select
          value={selectedSchoolId}
          onValueChange={setSelectedSchoolId}
          disabled={isLoading || switchSchoolMutation.isPending}
        >
          <SelectTrigger className="w-full max-w-xs">
            <SelectValue placeholder={t('multiRole.selectSchool')} />
          </SelectTrigger>
          <SelectContent>
            {(Array.isArray(schools) ? schools : []).map((school) => (
              <SelectItem key={school.id} value={school?.id?.toString()}>
                <div className="flex items-center gap-2">
                  <span>{school.name || ''}</span>
                  {school.isActive && (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {selectedSchoolId !== activeSchool?.id.toString() && (
          <Button
            size="sm"
            onClick={handleSchoolSwitch}
            disabled={switchSchoolMutation.isPending}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {switchSchoolMutation.isPending ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              t('multiRole.switchSchool')
            )}
          </Button>
        )}
      </div>

      {activeSchool && (
        <div className="text-xs text-gray-500">
          {(Array.isArray(schools) ? schools.length : 0)} {t('multiRole.schoolsAvailable')}
        </div>
      )}
    </div>
  );
}