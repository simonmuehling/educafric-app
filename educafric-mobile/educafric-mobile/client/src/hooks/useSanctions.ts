// ===== SANCTIONS HOOK =====
// Custom hook for managing student disciplinary sanctions

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import type { 
  InsertSanction, 
  SelectSanction, 
  SanctionForm 
} from '@shared/schemas/sanctionsSchema';
import { useToast } from '@/hooks/use-toast';

interface SanctionsFilters {
  sanctionType?: string;
  status?: string;
  severity?: string;
  academicYear?: string;
  term?: string;
  dateFrom?: string;
  dateTo?: string;
}

export function useStudentSanctions(studentId: number | null, filters: SanctionsFilters = {}) {
  return useQuery<SelectSanction[]>({
    queryKey: ['sanctions', 'student', studentId, filters],
    queryFn: async () => {
      if (!studentId) return [];
      
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      
      const response = await fetch(`/api/sanctions/student/${studentId}?${params}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch student sanctions: ${response.status}`);
      }
      return response.json();
    },
    enabled: !!studentId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useClassSanctions(classId: number | null, filters: SanctionsFilters = {}) {
  return useQuery<SelectSanction[]>({
    queryKey: ['sanctions', 'class', classId, filters],
    queryFn: async () => {
      if (!classId) return [];
      
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      
      const response = await fetch(`/api/sanctions/class/${classId}?${params}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch class sanctions: ${response.status}`);
      }
      return response.json();
    },
    enabled: !!classId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useSchoolSanctions(schoolId: number | null, filters: SanctionsFilters = {}) {
  return useQuery<SelectSanction[]>({
    queryKey: ['sanctions', 'school', schoolId, filters],
    queryFn: async () => {
      if (!schoolId) return [];
      
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      
      const response = await fetch(`/api/sanctions/school/${schoolId}?${params}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch school sanctions: ${response.status}`);
      }
      return response.json();
    },
    enabled: !!schoolId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateSanction() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<SelectSanction, Error, SanctionForm>({
    mutationFn: async (sanctionData: SanctionForm) => {
      const response = await apiRequest('/api/sanctions', {
        method: 'POST',
        body: JSON.stringify(sanctionData),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `Failed to create sanction: ${response.status}`);
      }

      return response.json();
    },
    onSuccess: (newSanction) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['sanctions', 'student', newSanction.studentId] });
      queryClient.invalidateQueries({ queryKey: ['sanctions', 'class', newSanction.classId] });
      queryClient.invalidateQueries({ queryKey: ['sanctions', 'school', newSanction.schoolId] });
      
      toast({
        title: "Sanction enregistrée",
        description: `La sanction ${newSanction.sanctionType} a été créée avec succès.`,
        variant: "default"
      });
    },
    onError: (error) => {
      console.error('Failed to create sanction:', error);
      toast({
        title: "Erreur",
        description: `Impossible de créer la sanction: ${error.message}`,
        variant: "destructive"
      });
    }
  });
}

export function useUpdateSanction() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<SelectSanction, Error, { id: number; updates: Partial<InsertSanction> }>({
    mutationFn: async ({ id, updates }) => {
      const response = await apiRequest(`/api/sanctions/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `Failed to update sanction: ${response.status}`);
      }

      return response.json();
    },
    onSuccess: (updatedSanction) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['sanctions', 'student', updatedSanction.studentId] });
      queryClient.invalidateQueries({ queryKey: ['sanctions', 'class', updatedSanction.classId] });
      queryClient.invalidateQueries({ queryKey: ['sanctions', 'school', updatedSanction.schoolId] });
      
      toast({
        title: "Sanction mise à jour",
        description: "La sanction a été modifiée avec succès.",
        variant: "default"
      });
    },
    onError: (error) => {
      console.error('Failed to update sanction:', error);
      toast({
        title: "Erreur",
        description: `Impossible de modifier la sanction: ${error.message}`,
        variant: "destructive"
      });
    }
  });
}

export function useDeleteSanction() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<void, Error, { id: number; studentId: number; classId: number; schoolId: number }>({
    mutationFn: async ({ id }) => {
      const response = await apiRequest(`/api/sanctions/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `Failed to delete sanction: ${response.status}`);
      }
    },
    onSuccess: (_, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['sanctions', 'student', variables.studentId] });
      queryClient.invalidateQueries({ queryKey: ['sanctions', 'class', variables.classId] });
      queryClient.invalidateQueries({ queryKey: ['sanctions', 'school', variables.schoolId] });
      
      toast({
        title: "Sanction supprimée",
        description: "La sanction a été supprimée avec succès.",
        variant: "default"
      });
    },
    onError: (error) => {
      console.error('Failed to delete sanction:', error);
      toast({
        title: "Erreur", 
        description: `Impossible de supprimer la sanction: ${error.message}`,
        variant: "destructive"
      });
    }
  });
}

export function useRevokeSanction() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<SelectSanction, Error, { id: number; reason: string }>({
    mutationFn: async ({ id, reason }) => {
      const response = await apiRequest(`/api/sanctions/${id}/revoke`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `Failed to revoke sanction: ${response.status}`);
      }

      return response.json();
    },
    onSuccess: (revokedSanction) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['sanctions', 'student', revokedSanction.studentId] });
      queryClient.invalidateQueries({ queryKey: ['sanctions', 'class', revokedSanction.classId] });
      queryClient.invalidateQueries({ queryKey: ['sanctions', 'school', revokedSanction.schoolId] });
      
      toast({
        title: "Sanction révoquée",
        description: "La sanction a été révoquée avec succès.",
        variant: "default"
      });
    },
    onError: (error) => {
      console.error('Failed to revoke sanction:', error);
      toast({
        title: "Erreur",
        description: `Impossible de révoquer la sanction: ${error.message}`,
        variant: "destructive"
      });
    }
  });
}

export function useAppealSanction() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<SelectSanction, Error, { id: number; appealReason: string }>({
    mutationFn: async ({ id, appealReason }) => {
      const response = await apiRequest(`/api/sanctions/${id}/appeal`, {
        method: 'POST',
        body: JSON.stringify({ appealReason }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `Failed to appeal sanction: ${response.status}`);
      }

      return response.json();
    },
    onSuccess: (appealedSanction) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['sanctions', 'student', appealedSanction.studentId] });
      queryClient.invalidateQueries({ queryKey: ['sanctions', 'class', appealedSanction.classId] });
      queryClient.invalidateQueries({ queryKey: ['sanctions', 'school', appealedSanction.schoolId] });
      
      toast({
        title: "Appel enregistré",
        description: "L'appel de la sanction a été enregistré.",
        variant: "default"
      });
    },
    onError: (error) => {
      console.error('Failed to appeal sanction:', error);
      toast({
        title: "Erreur",
        description: `Impossible d'enregistrer l'appel: ${error.message}`,
        variant: "destructive"
      });
    }
  });
}