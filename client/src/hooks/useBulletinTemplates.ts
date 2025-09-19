// ===== BULLETIN TEMPLATE HOOKS =====
// Hooks React Query personnalisés pour la gestion des modèles de bulletins

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useCallback, useRef, useEffect } from 'react';

// Types pour les bulletin templates
export interface BulletinTemplate {
  id: number;
  name: string;
  description?: string;
  schoolId: number;
  createdBy: number;
  templateType: 'default' | 'custom';
  status: 'draft' | 'published';
  config: any; // Configuration JSON du template
  metadata: any; // Métadonnées supplémentaires
  createdAt: string;
  updatedAt: string;
  usageCount: number;
  version: number;
}

export interface TemplateFilters {
  status?: 'draft' | 'published' | 'all';
  createdBy?: number;
  templateType?: string;
  page?: number;
  limit?: number;
  search?: string;
}

export interface TemplateListResponse {
  templates: BulletinTemplate[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateTemplateData {
  name: string;
  description?: string;
  config?: any;
  metadata?: any;
  templateType?: 'custom';
  status?: 'draft' | 'published';
}

export interface UpdateTemplateData {
  name?: string;
  description?: string;
  config?: any;
  metadata?: any;
  status?: 'draft' | 'published';
}

// ===== QUERY KEYS =====
export const templateKeys = {
  all: ['/api/director/bulletin-templates'] as const,
  lists: () => [...templateKeys.all, 'list'] as const,
  list: (filters: TemplateFilters) => [...templateKeys.lists(), filters] as const,
  details: () => [...templateKeys.all, 'detail'] as const,
  detail: (id: number) => [...templateKeys.details(), id] as const,
  elementTypes: ['/api/director/bulletin-templates/element-types'] as const,
  defaultTemplates: ['/api/director/bulletin-templates/defaults'] as const,
  usageStats: ['/api/director/bulletin-templates/usage-stats'] as const,
};

// ===== HOOKS PRINCIPAUX =====

/**
 * Hook pour récupérer la liste des modèles avec filtres et pagination
 */
export const useTemplates = (filters: TemplateFilters = {}) => {
  return useQuery({
    queryKey: templateKeys.list(filters),
    queryFn: async (): Promise<TemplateListResponse> => {
      const params = new URLSearchParams();
      
      if (filters.status && filters.status !== 'all') params.append('status', filters.status);
      if (filters.createdBy) params.append('createdBy', filters.createdBy.toString());
      if (filters.templateType) params.append('templateType', filters.templateType);
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.search) params.append('search', filters.search);

      const queryString = params.toString();
      const url = queryString ? 
        `/api/director/bulletin-templates?${queryString}` : 
        '/api/director/bulletin-templates';

      const response = await fetch(url, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch templates: ${response.status}`);
      }

      const result = await response.json();
      return result.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook pour récupérer un modèle spécifique par ID
 */
export const useTemplate = (id: number | undefined) => {
  return useQuery({
    queryKey: templateKeys.detail(id!),
    queryFn: async (): Promise<BulletinTemplate> => {
      const response = await fetch(`/api/director/bulletin-templates/${id}`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch template: ${response.status}`);
      }

      const result = await response.json();
      return result.data;
    },
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes pour un template spécifique
  });
};

/**
 * Hook pour créer un nouveau modèle
 */
export const useCreateTemplate = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CreateTemplateData): Promise<BulletinTemplate> => {
      const response = await apiRequest('POST', '/api/director/bulletin-templates', data);
      const result = await response.json();
      return result.data;
    },
    onSuccess: (newTemplate) => {
      // Invalider et refetch les listes
      queryClient.invalidateQueries({ queryKey: templateKeys.lists() });
      
      // Ajouter le nouveau template au cache
      queryClient.setQueryData(templateKeys.detail(newTemplate.id), newTemplate);

      toast({
        title: "✅ Modèle créé",
        description: `Le modèle "${newTemplate.name}" a été créé avec succès.`,
        variant: "default",
      });
    },
    onError: (error: Error) => {
      console.error('Error creating template:', error);
      toast({
        title: "❌ Erreur de création",
        description: `Impossible de créer le modèle: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};

/**
 * Hook pour mettre à jour un modèle existant
 */
export const useUpdateTemplate = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateTemplateData }): Promise<BulletinTemplate> => {
      const response = await apiRequest('PUT', `/api/director/bulletin-templates/${id}`, data);
      const result = await response.json();
      return result.data;
    },
    onSuccess: (updatedTemplate) => {
      // Mettre à jour le cache du template spécifique
      queryClient.setQueryData(templateKeys.detail(updatedTemplate.id), updatedTemplate);
      
      // Invalider les listes pour refléter les changements
      queryClient.invalidateQueries({ queryKey: templateKeys.lists() });

      toast({
        title: "✅ Modèle mis à jour",
        description: `Le modèle "${updatedTemplate.name}" a été mis à jour avec succès.`,
        variant: "default",
      });
    },
    onError: (error: Error) => {
      console.error('Error updating template:', error);
      toast({
        title: "❌ Erreur de mise à jour",
        description: `Impossible de mettre à jour le modèle: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};

/**
 * Hook pour supprimer un modèle
 */
export const useDeleteTemplate = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number): Promise<void> => {
      await apiRequest('DELETE', `/api/director/bulletin-templates/${id}`);
    },
    onSuccess: (_, deletedId) => {
      // Supprimer du cache
      queryClient.removeQueries({ queryKey: templateKeys.detail(deletedId) });
      
      // Invalider les listes
      queryClient.invalidateQueries({ queryKey: templateKeys.lists() });

      toast({
        title: "✅ Modèle supprimé",
        description: "Le modèle a été supprimé avec succès.",
        variant: "default",
      });
    },
    onError: (error: Error) => {
      console.error('Error deleting template:', error);
      toast({
        title: "❌ Erreur de suppression",
        description: `Impossible de supprimer le modèle: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};

// ===== HOOKS FONCTIONNALITÉS AVANCÉES =====

/**
 * Hook pour dupliquer un modèle
 */
export const useDuplicateTemplate = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, name }: { id: number; name: string }): Promise<BulletinTemplate> => {
      const response = await apiRequest('POST', `/api/director/bulletin-templates/${id}/duplicate`, { name });
      const result = await response.json();
      return result.data;
    },
    onSuccess: (duplicatedTemplate) => {
      // Invalider les listes pour inclure le nouveau template
      queryClient.invalidateQueries({ queryKey: templateKeys.lists() });
      
      // Ajouter au cache
      queryClient.setQueryData(templateKeys.detail(duplicatedTemplate.id), duplicatedTemplate);

      toast({
        title: "✅ Modèle dupliqué",
        description: `Le modèle "${duplicatedTemplate.name}" a été créé par duplication.`,
        variant: "default",
      });
    },
    onError: (error: Error) => {
      console.error('Error duplicating template:', error);
      toast({
        title: "❌ Erreur de duplication",
        description: `Impossible de dupliquer le modèle: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};

/**
 * Hook pour exporter un modèle
 */
export const useExportTemplate = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number): Promise<any> => {
      const response = await fetch(`/api/director/bulletin-templates/${id}/export`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`Failed to export template: ${response.status}`);
      }

      const result = await response.json();
      return result.data;
    },
    onSuccess: (exportData, templateId) => {
      // Créer un blob et télécharger le fichier
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bulletin-template-${templateId}-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "✅ Modèle exporté",
        description: "Le modèle a été exporté avec succès.",
        variant: "default",
      });
    },
    onError: (error: Error) => {
      console.error('Error exporting template:', error);
      toast({
        title: "❌ Erreur d'export",
        description: `Impossible d'exporter le modèle: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};

/**
 * Hook pour importer un modèle
 */
export const useImportTemplate = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (templateData: any): Promise<BulletinTemplate> => {
      const response = await apiRequest('POST', '/api/director/bulletin-templates/import', { templateData });
      const result = await response.json();
      return result.data;
    },
    onSuccess: (importedTemplate) => {
      // Invalider les listes
      queryClient.invalidateQueries({ queryKey: templateKeys.lists() });
      
      // Ajouter au cache
      queryClient.setQueryData(templateKeys.detail(importedTemplate.id), importedTemplate);

      toast({
        title: "✅ Modèle importé",
        description: `Le modèle "${importedTemplate.name}" a été importé avec succès.`,
        variant: "default",
      });
    },
    onError: (error: Error) => {
      console.error('Error importing template:', error);
      toast({
        title: "❌ Erreur d'import",
        description: `Impossible d'importer le modèle: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};

/**
 * Hook pour incrémenter le compteur d'utilisation
 */
export const useIncrementUsage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number): Promise<void> => {
      await apiRequest('POST', `/api/director/bulletin-templates/${id}/use`);
    },
    onSuccess: (_, id) => {
      // Invalider le template spécifique pour refléter le nouveau compteur
      queryClient.invalidateQueries({ queryKey: templateKeys.detail(id) });
    },
    onError: (error: Error) => {
      console.error('Error incrementing usage count:', error);
      // Pas de toast d'erreur car c'est une action silencieuse
    },
  });
};

// ===== HOOKS UTILITAIRES =====

/**
 * Hook pour récupérer les types d'éléments disponibles
 */
export const useElementTypes = (category?: string) => {
  return useQuery({
    queryKey: category ? [...templateKeys.elementTypes, category] : templateKeys.elementTypes,
    queryFn: async () => {
      const url = category ? 
        `/api/director/bulletin-templates/element-types?category=${category}` : 
        '/api/director/bulletin-templates/element-types';

      const response = await fetch(url, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch element types: ${response.status}`);
      }

      const result = await response.json();
      return result.data;
    },
    staleTime: 30 * 60 * 1000, // 30 minutes - les types d'éléments changent rarement
  });
};

/**
 * Hook pour récupérer les modèles par défaut
 */
export const useDefaultTemplates = () => {
  return useQuery({
    queryKey: templateKeys.defaultTemplates,
    queryFn: async () => {
      const response = await fetch('/api/director/bulletin-templates/defaults', {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch default templates: ${response.status}`);
      }

      const result = await response.json();
      return result.data;
    },
    staleTime: 60 * 60 * 1000, // 1 heure - les modèles par défaut changent très rarement
  });
};

/**
 * Hook pour récupérer les statistiques d'utilisation
 */
export const useTemplateUsageStats = () => {
  return useQuery({
    queryKey: templateKeys.usageStats,
    queryFn: async () => {
      const response = await fetch('/api/director/bulletin-templates/usage-stats', {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch usage stats: ${response.status}`);
      }

      const result = await response.json();
      return result.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// ===== HOOK SAUVEGARDE AUTOMATIQUE =====

/**
 * Hook pour la sauvegarde automatique (auto-save)
 * @param templateId - ID du template à sauvegarder
 * @param data - Données à sauvegarder
 * @param enabled - Si l'auto-save est activé
 * @param interval - Intervalle en millisecondes (défaut: 30 secondes)
 */
export const useAutoSave = (
  templateId: number | undefined,
  data: UpdateTemplateData,
  enabled: boolean = true,
  interval: number = 30 * 1000 // 30 secondes
) => {
  const updateTemplate = useUpdateTemplate();
  const { toast } = useToast();
  const dataRef = useRef(data);
  const lastSavedRef = useRef<string>('');

  // Mettre à jour la référence des données
  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  // Fonction de sauvegarde silencieuse
  const autoSave = useCallback(async () => {
    if (!templateId || !enabled) return;

    const currentDataStr = JSON.stringify(dataRef.current);
    
    // Ne sauvegarder que si les données ont changé
    if (currentDataStr === lastSavedRef.current) return;

    try {
      await updateTemplate.mutateAsync({ id: templateId, data: dataRef.current });
      lastSavedRef.current = currentDataStr;
      
      console.log(`[AUTO_SAVE] Template ${templateId} saved automatically`);
      
      // Toast discret pour indiquer la sauvegarde
      toast({
        title: "💾 Sauvegardé automatiquement",
        description: "Vos modifications ont été sauvegardées.",
        variant: "default",
        duration: 2000,
      });
    } catch (error) {
      console.error('[AUTO_SAVE] Error during auto-save:', error);
      
      toast({
        title: "⚠️ Sauvegarde automatique échouée",
        description: "Vos modifications n'ont pas pu être sauvegardées automatiquement.",
        variant: "destructive",
        duration: 3000,
      });
    }
  }, [templateId, enabled, updateTemplate, toast]);

  // Démarrer l'auto-save
  useEffect(() => {
    if (!enabled || !templateId) return;

    const intervalId = setInterval(autoSave, interval);

    return () => {
      clearInterval(intervalId);
    };
  }, [autoSave, enabled, templateId, interval]);

  return {
    autoSave,
    isSaving: updateTemplate.isPending,
    lastSaved: lastSavedRef.current ? new Date() : null,
  };
};

// ===== HOOK OPTIMISTIC UPDATES =====

/**
 * Hook pour les mises à jour optimistes
 */
export const useOptimisticTemplateUpdate = (templateId: number) => {
  const queryClient = useQueryClient();

  const optimisticUpdate = useCallback((updates: Partial<BulletinTemplate>) => {
    queryClient.setQueryData(
      templateKeys.detail(templateId),
      (old: BulletinTemplate | undefined) => {
        if (!old) return old;
        return { ...old, ...updates };
      }
    );
  }, [queryClient, templateId]);

  const revertOptimisticUpdate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: templateKeys.detail(templateId) });
  }, [queryClient, templateId]);

  return {
    optimisticUpdate,
    revertOptimisticUpdate,
  };
};