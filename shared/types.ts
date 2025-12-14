// Comprehensive type definitions for Educafric platform

export class ValidationError extends Error {
  public errors: Record<string, string[]>;
  
  constructor(errors: Record<string, string[]>) {
    super('Validation failed');
    this.name = 'ValidationError';
    this.errors = errors;
  }
}

export class NotFoundError extends Error {
  constructor(message = 'Resource not found') {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends Error {
  constructor(message = 'Unauthorized access') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

export class ConflictError extends Error {
  constructor(message = 'Resource conflict') {
    super(message);
    this.name = 'ConflictError';
  }
}

export class ForbiddenError extends Error {
  constructor(message = 'Access forbidden') {
    super(message);
    this.name = 'ForbiddenError';
  }
}

// User-related types
export interface CreateUser {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole;
  gender?: string;
  phone?: string;
  schoolId?: number;
  whatsappNumber?: string;
  preferredLanguage?: 'en' | 'fr';
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface ChangePassword {
  currentPassword: string;
  newPassword: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordReset {
  token: string;
  password: string;
}

export interface UpdateProfile {
  firstName?: string;
  lastName?: string;
  phone?: string;
  whatsappNumber?: string;
  preferredLanguage?: 'en' | 'fr';
  gender?: string;
}

export type UserRole = 
  | 'SiteAdmin' 
  | 'Admin' 
  | 'Director' 
  | 'Teacher' 
  | 'Parent' 
  | 'Student' 
  | 'Commercial';

export interface AuthenticatedUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  secondaryRoles?: UserRole[];
  schoolId?: number;
  phone?: string;
  gender?: string;
  photoURL?: string;
  preferredLanguage: 'en' | 'fr';
  whatsappNumber?: string;
  twoFactorEnabled: boolean;
  workMode?: 'school' | 'independent' | 'hybrid';
  // Sandbox mode - prevents writing to production data
  isSandboxUser?: boolean;
  // Subscription fields
  subscriptionPlan?: string;
  subscriptionStatus?: string;
  subscriptionStart?: string;
  subscriptionEnd?: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  stripePaymentIntentId?: string;
  createdAt: Date;
  lastLoginAt?: Date;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Academic system types
export interface ClassInfo {
  id: number;
  name: string;
  level: string;
  section?: string;
  schoolId: number;
  teacherId?: number;
  studentCount: number;
}

export interface SubjectInfo {
  id: number;
  name: string;
  code: string;
  credits: number;
  schoolId: number;
}

export interface GradeEntry {
  id: number;
  studentId: number;
  subjectId: number;
  classId: number;
  termId: number;
  value: number;
  type: 'assignment' | 'exam' | 'quiz' | 'project';
  maxValue: number;
  date: Date;
  description?: string;
}

export interface AttendanceRecord {
  id: number;
  studentId: number;
  classId: number;
  date: Date;
  status: 'present' | 'absent' | 'late' | 'excused';
  notes?: string;
}

// Notification types
export interface NotificationData {
  type: 'academic' | 'administrative' | 'emergency' | 'gps' | 'commercial';
  subType: string;
  title: string;
  message: string;
  content?: string; // Additional content field for detailed notifications
  recipientIds: number[];
  sendSMS?: boolean;
  sendWhatsApp?: boolean;
  sendEmail?: boolean;
  sendPush?: boolean;
  userType?: string; // For notification creation
  userId?: number; // For single user notifications
  priority: 'low' | 'medium' | 'high' | 'critical';
  metadata?: Record<string, any>;
}

// GPS Tracking types
export interface DeviceLocation {
  id: number;
  userId: number;
  deviceId: string;
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: Date;
  batteryLevel?: number;
  speed?: number;
  altitude?: number;
}

export interface SafeZone {
  id: number;
  name: string;
  schoolId: number;
  centerLatitude: number;
  centerLongitude: number;
  radius: number; // in meters
  isActive: boolean;
  description?: string;
}

// Payment types
export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: 'CFA' | 'EUR' | 'USD';
  interval: 'month' | 'year';
  features: string[];
  maxUsers?: number;
  maxSchools?: number;
}

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: string;
  clientSecret: string;
  metadata: Record<string, any>;
}

// Security types
export interface SecurityLog {
  id: number;
  userId?: number;
  action: string;
  resource: string;
  ipAddress: string;
  userAgent: string;
  success: boolean;
  details?: Record<string, any>;
  timestamp: Date;
}

export interface TwoFactorSetup {
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
}

// Communication types
export interface MessageThread {
  id: number;
  subject: string;
  participants: number[];
  lastMessageAt: Date;
  isActive: boolean;
  type: 'teacher_parent' | 'admin_teacher' | 'commercial_prospect' | 'support';
}

export interface Message {
  id: number;
  threadId: number;
  senderId: number;
  content: string;
  attachments?: string[];
  sentAt: Date;
  readAt?: Date;
  messageType: 'text' | 'image' | 'document' | 'audio';
}

// Dashboard statistics types
export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalSchools: number;
  activeSubscriptions: number;
  monthlyRevenue: number;
  systemHealth: 'excellent' | 'good' | 'warning' | 'critical';
  recentActivity: Array<{
    action: string;
    user: string;
    timestamp: Date;
  }>;
}

// Request extensions for Express
declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export interface RequestWithUser extends Express.Request {
  user: AuthenticatedUser;
}