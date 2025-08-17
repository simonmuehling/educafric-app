import * as React from 'react';

interface TeacherMultiSchoolContextType {
  selectedSchoolId: string | null;
  setSelectedSchoolId: (schoolId: string | null) => void;
  schools: any[];
}

// Static context without hooks for testing
const defaultValue: TeacherMultiSchoolContextType = {
  selectedSchoolId: null,
  setSelectedSchoolId: (schoolId) => console.log('setSelectedSchoolId called:', schoolId),
  schools: []
};

const TeacherMultiSchoolContext = React.createContext<TeacherMultiSchoolContextType>(defaultValue);

export function TeacherMultiSchoolProvider({ children }: { children: React.ReactNode }) {
  // NO HOOKS - just static value to test if React works
  return (
    <TeacherMultiSchoolContext.Provider value={defaultValue}>
      {children}
    </TeacherMultiSchoolContext.Provider>
  );
}

export function useTeacherMultiSchool() {
  return React.useContext(TeacherMultiSchoolContext);
}