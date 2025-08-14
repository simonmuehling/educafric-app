import { apiRequest } from '@/lib/queryClient';

// Types
export interface BusinessPartner {
  id: number;
  name: string;
  sector: string;
  type: string;
  description?: string;
  address?: string;
  city?: string;
  region?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  contactPerson?: string;
  contactPosition?: string;
  phone?: string;
  email?: string;
  website?: string;
  partnershipType: string;
  partnershipSince?: string;
  status: string;
  rating?: number;
  studentsPlaced?: number;
  opportunitiesOffered?: number;
  programs?: any;
  metadata?: any;
  createdAt?: string;
  updatedAt?: string;
}

export interface Internship {
  id: number;
  studentId: number;
  partnerId: number;
  schoolId: number;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  duration?: number;
  status: string;
  supervisorName?: string;
  supervisorEmail?: string;
  supervisorPhone?: string;
  studentRating?: number;
  companyRating?: number;
  studentFeedback?: string;
  companyFeedback?: string;
  completionStatus?: string;
  jobOfferReceived?: boolean;
  skillsAcquired?: any;
  metadata?: any;
  createdAt?: string;
  updatedAt?: string;
}

export interface PartnershipStatistics {
  totalPartners: number;
  activeInternships: number;
  totalStudentsPlaced: number;
  averageRating: number;
  partnersByType: Record<string, number>;
  partnersBySector: Record<string, number>;
  monthlyPlacements: Record<string, number>;
}

export interface CommunicationData {
  agreementId: number;
  senderId: number;
  recipientEmail: string;
  subject: string;
  message: string;
  messageType?: string;
}

// API Functions
export const getBusinessPartners = async (schoolId?: number): Promise<BusinessPartner[]> => {
  const url = schoolId ? `/api/partnerships/partners?schoolId=${schoolId}` : '/api/partnerships/partners';
  return apiRequest(url);
};

export const getInternships = async (schoolId?: number): Promise<Internship[]> => {
  const url = schoolId ? `/api/partnerships/internships?schoolId=${schoolId}` : '/api/partnerships/internships';
  return apiRequest(url);
};

export const getPartnershipStatistics = async (schoolId?: number): Promise<PartnershipStatistics> => {
  const url = schoolId ? `/api/partnerships/statistics?schoolId=${schoolId}` : '/api/partnerships/statistics';
  return apiRequest(url);
};

export const sendPartnershipCommunication = async (data: CommunicationData): Promise<any> => {
  return apiRequest('/api/partnerships/communications', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
};

// Helper Functions
export const getPartnershipTypeColor = (type: string): string => {
  const colors: Record<string, string> = {
    'internship': 'bg-blue-500',
    'training': 'bg-green-500',
    'recruitment': 'bg-purple-500',
    'mentoring': 'bg-orange-500',
    'sponsorship': 'bg-pink-500',
  };
  return colors[type] || 'bg-gray-500';
};

export const getInternshipStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    'planned': 'bg-yellow-500',
    'active': 'bg-green-500',
    'completed': 'bg-blue-500',
    'cancelled': 'bg-red-500',
  };
  return colors[status] || 'bg-gray-500';
};

export const formatPartnershipType = (type: string, language: 'fr' | 'en' = 'fr'): string => {
  const translations: Record<string, Record<string, string>> = {
    'internship': { fr: 'Stage', en: 'Internship' },
    'training': { fr: 'Formation', en: 'Training' },
    'recruitment': { fr: 'Recrutement', en: 'Recruitment' },
    'mentoring': { fr: 'Mentorat', en: 'Mentoring' },
    'sponsorship': { fr: 'Parrainage', en: 'Sponsorship' },
  };
  return translations[type]?.[language] || type;
};

export const formatInternshipStatus = (status: string, language: 'fr' | 'en' = 'fr'): string => {
  const translations: Record<string, Record<string, string>> = {
    'planned': { fr: 'Planifié', en: 'Planned' },
    'active': { fr: 'En cours', en: 'Active' },
    'completed': { fr: 'Terminé', en: 'Completed' },
    'cancelled': { fr: 'Annulé', en: 'Cancelled' },
  };
  return translations[status]?.[language] || status;
};