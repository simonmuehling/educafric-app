export const mockUser = {
  id: 999,
  email: 'test@test.educafric.com',
  firstName: 'Test',
  lastName: 'User',
  role: 'Student',
  schoolId: 5,
  phone: '+237600000000',
  isActive: true
};

export const mockParent = {
  id: 998,
  email: 'parent@test.educafric.com',
  firstName: 'Parent',
  lastName: 'Test',
  role: 'Parent',
  phone: '+237600000001',
  isActive: true
};

export const mockBulletin = {
  id: 1,
  studentId: 999,
  classId: 1,
  schoolId: 5,
  term: 'T1',
  academicYear: '2024-2025',
  status: 'published',
  overallAverage: '14.5',
  studentRank: 5
};

export const mockAuthRequest = (user: any) => ({
  user,
  isAuthenticated: () => true,
  session: { passport: { user: user.id } }
});

export const mockUnauthRequest = () => ({
  user: null,
  isAuthenticated: () => false,
  session: {}
});
