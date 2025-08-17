import React, { createContext, useContext, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';

interface School {
  id: number;
  name: string;
  location: string;
  role: string;
}

interface TeacherMultiSchoolContextType {
  schools: School[];
  selectedSchoolId: string;
  setSelectedSchoolId: (schoolId: string) => void;
  currentSchool: School | null;
  isMultiSchool: boolean;
  schoolsLoading: boolean;
}

const TeacherMultiSchoolContext = createContext<TeacherMultiSchoolContextType | undefined>(undefined);

export const useTeacherMultiSchool = () => {
  const context = useContext(TeacherMultiSchoolContext);
  if (!context) {
    throw new Error('useTeacherMultiSchool must be used within a TeacherMultiSchoolProvider');
  }
  return context;
};

interface TeacherMultiSchoolProviderProps {
  children: React.ReactNode;
}

export const TeacherMultiSchoolProvider: React.FC<TeacherMultiSchoolProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>('all');

  // Fetch teacher's schools
  const { data: schools = [], isLoading: schoolsLoading } = useQuery({
    queryKey: ['/api/teacher/schools'],
    queryFn: async () => {
      const response = await fetch('/api/teacher/schools', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch schools');
      return response.json();
    },
    enabled: !!user && user.role === 'Teacher'
  });

  // Auto-select first school if only one exists
  useEffect(() => {
    if (schools.length === 1 && selectedSchoolId === 'all') {
      setSelectedSchoolId(schools[0].id.toString());
    }
  }, [schools, selectedSchoolId]);

  const currentSchool = selectedSchoolId === 'all' 
    ? null 
    : schools.find((school: School) => school.id.toString() === selectedSchoolId) || null;

  const isMultiSchool = schools.length > 1;

  const value: TeacherMultiSchoolContextType = {
    schools,
    selectedSchoolId,
    setSelectedSchoolId,
    currentSchool,
    isMultiSchool,
    schoolsLoading
  };

  return (
    <TeacherMultiSchoolContext.Provider value={value}>
      {children}
    </TeacherMultiSchoolContext.Provider>
  );
};