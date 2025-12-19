import { describe, it, expect, vi } from 'vitest';
import { mockUser, mockAuthRequest, mockUnauthRequest } from '../utils/mocks';

describe('Authentication Utils', () => {
  it('should identify authenticated user', () => {
    const req = mockAuthRequest(mockUser);
    expect(req.isAuthenticated()).toBe(true);
    expect(req.user).toBeDefined();
    expect(req.user.email).toBe('test@test.educafric.com');
  });

  it('should identify unauthenticated request', () => {
    const req = mockUnauthRequest();
    expect(req.isAuthenticated()).toBe(false);
    expect(req.user).toBeNull();
  });

  it('should have correct user role', () => {
    const req = mockAuthRequest(mockUser);
    expect(req.user.role).toBe('Student');
  });

  it('should have schoolId for multi-tenant isolation', () => {
    const req = mockAuthRequest(mockUser);
    expect(req.user.schoolId).toBe(5);
  });
});

describe('Sandbox User Detection', () => {
  const sandboxPatterns = [
    '@test.educafric.com',
    'sandbox@',
    'demo@',
    '.sandbox@',
    '.demo@',
    '.test@'
  ];

  it('should detect sandbox users by email pattern', () => {
    const testEmails = [
      'user@test.educafric.com',
      'sandbox@example.com',
      'demo@school.com',
      'user.sandbox@company.com'
    ];

    testEmails.forEach(email => {
      const isSandbox = sandboxPatterns.some(pattern => email.includes(pattern));
      expect(isSandbox).toBe(true);
    });
  });

  it('should NOT detect real users as sandbox', () => {
    const realEmails = [
      'user@gmail.com',
      'director@school.edu.cm',
      'parent@yahoo.fr'
    ];

    realEmails.forEach(email => {
      const isSandbox = sandboxPatterns.some(pattern => email.includes(pattern));
      expect(isSandbox).toBe(false);
    });
  });
});
