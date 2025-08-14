import { apiRequest } from "@/lib/queryClient";

// Types for API responses
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
  latitude?: string;
  longitude?: string;
  contactPerson?: string;
  contactPosition?: string;
  phone?: string;
  email?: string;
  website?: string;
  partnershipType: string;
  partnershipSince?: string;
  status: string;
  rating?: string;
  studentsPlaced?: number;
  opportunitiesOffered?: number;
  programs?: any[];
  metadata?: any;
  createdAt?: string;
  updatedAt?: string;
}

export interface SchoolPartnershipAgreement {
  id: number;
  schoolId: number;
  partnerId: number;
  agreementType: string;
  startDate?: string;
  endDate?: string;
  status: string;
  terms?: string;
  contactFrequency?: string;
  lastContactDate?: string;
  createdAt?: string;
  updatedAt?: string;
  partner?: BusinessPartner;
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
  studentRating?: string;
  companyRating?: string;
  studentFeedback?: string;
  companyFeedback?: string;
  completionStatus?: string;
  jobOfferReceived?: boolean;
  skillsAcquired?: string[];
  metadata?: any;
  createdAt?: string;
  updatedAt?: string;
  student?: any;
  partner?: BusinessPartner;
}

export interface PartnershipCommunication {
  id: number;
  agreementId: number;
  senderId: number;
  recipientEmail: string;
  subject: string;
  message: string;
  messageType: string;
  status: string;
  createdAt?: string;
  sender?: any;
}

export interface PartnershipStatistics {
  totalPartners: number;
  totalInternships: number;
  activeInternships: number;
  completedInternships: number;
  successRate: string;
}

// ===== BUSINESS PARTNERS API =====

export const getBusinessPartners = async (schoolId?: number): Promise<BusinessPartner[]> => {
  const params = new URLSearchParams();
  if (schoolId) params.append('schoolId', schoolId.toString());
  
  const response = await apiRequest(`/api/partnerships/partners?${params}`);
  return response;
};

export const getBusinessPartner = async (partnerId: number): Promise<BusinessPartner> => {
  const response = await apiRequest(`/api/partnerships/partners/${partnerId}`);
  return response;
};

export const createBusinessPartner = async (partner: Partial<BusinessPartner>): Promise<BusinessPartner> => {
  const response = await apiRequest('/api/partnerships/partners', {
    method: 'POST',
    body: JSON.stringify(partner),
  });
  return response;
};

export const updateBusinessPartner = async (partnerId: number, updates: Partial<BusinessPartner>): Promise<BusinessPartner> => {
  const response = await apiRequest(`/api/partnerships/partners/${partnerId}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
  return response;
};

export const deleteBusinessPartner = async (partnerId: number): Promise<void> => {
  await apiRequest(`/api/partnerships/partners/${partnerId}`, {
    method: 'DELETE',
  });
};

// ===== PARTNERSHIP AGREEMENTS API =====

export const getSchoolPartnershipAgreements = async (schoolId: number): Promise<SchoolPartnershipAgreement[]> => {
  const response = await apiRequest(`/api/partnerships/agreements?schoolId=${schoolId}`);
  return response;
};

export const createSchoolPartnershipAgreement = async (agreement: Partial<SchoolPartnershipAgreement>): Promise<SchoolPartnershipAgreement> => {
  const response = await apiRequest('/api/partnerships/agreements', {
    method: 'POST',
    body: JSON.stringify(agreement),
  });
  return response;
};

export const updateSchoolPartnershipAgreement = async (agreementId: number, updates: Partial<SchoolPartnershipAgreement>): Promise<SchoolPartnershipAgreement> => {
  const response = await apiRequest(`/api/partnerships/agreements/${agreementId}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
  return response;
};

// ===== INTERNSHIPS API =====

export const getInternships = async (schoolId: number, filters?: { status?: string }): Promise<Internship[]> => {
  const params = new URLSearchParams({ schoolId: schoolId.toString() });
  if (filters?.status) params.append('status', filters.status);
  
  const response = await apiRequest(`/api/partnerships/internships?${params}`);
  return response;
};

export const getInternship = async (internshipId: number): Promise<Internship> => {
  const response = await apiRequest(`/api/partnerships/internships/${internshipId}`);
  return response;
};

export const createInternship = async (internship: Partial<Internship>): Promise<Internship> => {
  const response = await apiRequest('/api/partnerships/internships', {
    method: 'POST',
    body: JSON.stringify(internship),
  });
  return response;
};

export const updateInternship = async (internshipId: number, updates: Partial<Internship>): Promise<Internship> => {
  const response = await apiRequest(`/api/partnerships/internships/${internshipId}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
  return response;
};

export const getStudentInternships = async (studentId: number): Promise<Internship[]> => {
  const response = await apiRequest(`/api/partnerships/students/${studentId}/internships`);
  return response;
};

// ===== COMMUNICATIONS API =====

export const sendPartnershipCommunication = async (communication: Partial<PartnershipCommunication>): Promise<PartnershipCommunication> => {
  const response = await apiRequest('/api/partnerships/communications', {
    method: 'POST',
    body: JSON.stringify(communication),
  });
  return response;
};

export const getPartnershipCommunications = async (agreementId: number): Promise<PartnershipCommunication[]> => {
  const response = await apiRequest(`/api/partnerships/communications?agreementId=${agreementId}`);
  return response;
};

// ===== STATISTICS API =====

export const getPartnershipStatistics = async (schoolId: number): Promise<PartnershipStatistics> => {
  const response = await apiRequest(`/api/partnerships/statistics?schoolId=${schoolId}`);
  return response;
};

// ===== UTILITY FUNCTIONS =====

export const getPartnershipTypeColor = (type: string): string => {
  const colors: Record<string, string> = {
    'internship': 'bg-blue-100 text-blue-800 border-blue-200',
    'training': 'bg-green-100 text-green-800 border-green-200',
    'recruitment': 'bg-purple-100 text-purple-800 border-purple-200',
    'mentoring': 'bg-orange-100 text-orange-800 border-orange-200',
    'sponsorship': 'bg-pink-100 text-pink-800 border-pink-200',
  };
  return colors[type] || 'bg-gray-100 text-gray-800 border-gray-200';
};

export const getInternshipStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    'planned': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'active': 'bg-green-100 text-green-800 border-green-200',
    'completed': 'bg-blue-100 text-blue-800 border-blue-200',
    'cancelled': 'bg-red-100 text-red-800 border-red-200',
  };
  return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
};

export const formatPartnershipType = (type: string, language: 'fr' | 'en' = 'fr'): string => {
  const translations: Record<string, Record<string, string>> = {
    'internship': { fr: 'Stages', en: 'Internships' },
    'training': { fr: 'Formation', en: 'Training' },
    'recruitment': { fr: 'Recrutement', en: 'Recruitment' },
    'mentoring': { fr: 'Mentorat', en: 'Mentoring' },
    'sponsorship': { fr: 'Parrainage', en: 'Sponsorship' },
  };
  return translations[type]?.[language] || type;
};

export const formatInternshipStatus = (status: string, language: 'fr' | 'en' = 'fr'): string => {
  const translations: Record<string, Record<string, string>> = {
    'planned': { fr: 'Prévu', en: 'Planned' },
    'active': { fr: 'Actif', en: 'Active' },
    'completed': { fr: 'Terminé', en: 'Completed' },
    'cancelled': { fr: 'Annulé', en: 'Cancelled' },
  };
  return translations[status]?.[language] || status;
};