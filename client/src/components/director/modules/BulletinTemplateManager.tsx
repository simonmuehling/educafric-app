// ===== BULLETIN TEMPLATE MANAGER =====
// Interface complète de gestion des modèles de bulletins

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

// Bulletin Template Hooks
import {
  useTemplates,
  useTemplate,
  useCreateTemplate,
  useUpdateTemplate,
  useDeleteTemplate,
  useDuplicateTemplate,
  useExportTemplate,
  useImportTemplate,
  useDefaultTemplates,
  useAutoSave,
  useOptimisticTemplateUpdate,
  type BulletinTemplate,
  type CreateTemplateData,
  type UpdateTemplateData,
  type TemplateFilters
} from '@/hooks/useBulletinTemplates';

import { 
  bulletinTemplateInsertSchema, 
  type InsertBulletinTemplate
} from '@shared/schemas/bulletinTemplateSchema';

import { 
  Plus,
  Save,
  FileText,
  Download,
  Upload,
  Eye,
  Edit3,
  Copy,
  Trash2,
  Settings,
  RefreshCw,
  Search,
  Filter,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  FileDown,
  FileUp,
  Star,
  Users,
  Calendar,
  MoreVertical,
  PlayCircle,
  PauseCircle,
  Zap,
  Layout,
  Palette,
  Type,
  Image,
  Database
} from 'lucide-react';

// ===== INTERFACES ET SCHÉMAS =====

const createTemplateSchema = z.object({
  name: z.string().min(1, 'Le nom est requis').max(100, 'Le nom ne peut pas dépasser 100 caractères'),
  description: z.string().optional(),
  templateType: z.enum(['custom']).default('custom'),
  status: z.enum(['draft', 'published']).default('draft'),
});

const filterSchema = z.object({
  status: z.enum(['all', 'draft', 'published']).default('all'),
  search: z.string().optional(),
  templateType: z.string().optional(),
});

type CreateTemplateForm = z.infer<typeof createTemplateSchema>;
type FilterForm = z.infer<typeof filterSchema>;

// ===== COMPOSANTS UTILITAIRES =====

const StatusBadge: React.FC<{ status: BulletinTemplate['status'] }> = ({ status }) => {
  const variants = {
    draft: { variant: 'secondary' as const, label: 'Brouillon', icon: Edit3 },
    published: { variant: 'default' as const, label: 'Publié', icon: CheckCircle },
  };

  const { variant, label, icon: Icon } = variants[status];

  return (
    <Badge variant={variant} className="flex items-center gap-1">
      <Icon className="h-3 w-3" />
      {label}
    </Badge>
  );
};

const SaveIndicator: React.FC<{ 
  isSaving: boolean; 
  lastSaved: Date | null; 
  hasUnsavedChanges: boolean; 
}> = ({ isSaving, lastSaved, hasUnsavedChanges }) => {
  if (isSaving) {
    return (
      <div className="flex items-center gap-2 text-blue-600">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm">Sauvegarde...</span>
      </div>
    );
  }

  if (hasUnsavedChanges) {
    return (
      <div className="flex items-center gap-2 text-amber-600">
        <Clock className="h-4 w-4" />
        <span className="text-sm">Modifications non sauvegardées</span>
      </div>
    );
  }

  if (lastSaved) {
    return (
      <div className="flex items-center gap-2 text-green-600">
        <CheckCircle className="h-4 w-4" />
        <span className="text-sm">Sauvegardé à {lastSaved.toLocaleTimeString()}</span>
      </div>
    );
  }

  return null;
};

const TemplateCard: React.FC<{
  template: BulletinTemplate;
  onEdit: (template: BulletinTemplate) => void;
  onDuplicate: (template: BulletinTemplate) => void;
  onDelete: (template: BulletinTemplate) => void;
  onExport: (template: BulletinTemplate) => void;
  onPreview: (template: BulletinTemplate) => void;
}> = ({ template, onEdit, onDuplicate, onDelete, onExport, onPreview }) => {
  const { toast } = useToast();

  return (
    <Card className="group hover:shadow-lg transition-shadow duration-200" data-testid={`template-card-${template.id}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold" data-testid={`template-name-${template.id}`}>
              {template.name}
            </CardTitle>
            {template.description && (
              <p className="text-sm text-gray-600 mt-1" data-testid={`template-description-${template.id}`}>
                {template.description}
              </p>
            )}
          </div>
          <StatusBadge status={template.status} />
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{template.usageCount} utilisations</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>v{template.version}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{new Date(template.updatedAt).toLocaleDateString()}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Preview miniature */}
        <div className="bg-gray-50 rounded-lg p-4 mb-4 min-h-[120px] border-2 border-dashed border-gray-200">
          <div className="text-center text-gray-500">
            <Layout className="h-8 w-8 mx-auto mb-2" />
            <p className="text-sm">Aperçu du modèle</p>
            <p className="text-xs">Éléments configurés: {Object.keys(template.config || {}).length}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => onPreview(template)}
              data-testid={`button-preview-${template.id}`}
            >
              <Eye className="h-4 w-4 mr-1" />
              Aperçu
            </Button>
            <Button 
              size="sm" 
              onClick={() => onEdit(template)}
              data-testid={`button-edit-${template.id}`}
            >
              <Edit3 className="h-4 w-4 mr-1" />
              Éditer
            </Button>
          </div>

          <div className="flex items-center">
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={() => onDuplicate(template)}
              data-testid={`button-duplicate-${template.id}`}
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={() => onExport(template)}
              data-testid={`button-export-${template.id}`}
            >
              <Download className="h-4 w-4" />
            </Button>
            {template.templateType !== 'default' && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="text-red-600 hover:text-red-700"
                    data-testid={`button-delete-${template.id}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Supprimer le modèle</AlertDialogTitle>
                    <AlertDialogDescription>
                      Êtes-vous sûr de vouloir supprimer le modèle "{template.name}" ? 
                      Cette action est irréversible.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel data-testid="button-cancel-delete">Annuler</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={() => onDelete(template)}
                      className="bg-red-600 hover:bg-red-700"
                      data-testid="button-confirm-delete"
                    >
                      Supprimer
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// ===== COMPOSANT PRINCIPAL =====

const BulletinTemplateManager: React.FC = () => {
  const { toast } = useToast();
  const { language } = useLanguage();

  // States
  const [selectedTemplate, setSelectedTemplate] = useState<BulletinTemplate | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [filters, setFilters] = useState<TemplateFilters>({
    status: 'all',
    page: 1,
    limit: 12
  });

  // Hooks
  const { data: templatesData, isLoading: isLoadingTemplates, error: templatesError } = useTemplates(filters);
  const { data: defaultTemplates, isLoading: isLoadingDefaults } = useDefaultTemplates();
  const createTemplate = useCreateTemplate();
  const updateTemplate = useUpdateTemplate();
  const deleteTemplate = useDeleteTemplate();
  const duplicateTemplate = useDuplicateTemplate();
  const exportTemplate = useExportTemplate();
  const importTemplate = useImportTemplate();

  // Auto-save pour le template sélectionné
  const { isSaving, lastSaved } = useAutoSave(
    selectedTemplate?.id,
    selectedTemplate ? {
      name: selectedTemplate.name,
      description: selectedTemplate.description,
      config: selectedTemplate.config,
      metadata: selectedTemplate.metadata,
      status: selectedTemplate.status
    } : {},
    isEditMode && hasUnsavedChanges,
    30000 // 30 secondes
  );

  // Forms
  const createForm = useForm<CreateTemplateForm>({
    resolver: zodResolver(createTemplateSchema),
    defaultValues: {
      name: '',
      description: '',
      templateType: 'custom',
      status: 'draft'
    }
  });

  const filterForm = useForm<FilterForm>({
    resolver: zodResolver(filterSchema),
    defaultValues: filters
  });

  // ===== HANDLERS =====

  const handleCreateTemplate = useCallback(async (data: CreateTemplateForm) => {
    try {
      const newTemplate = await createTemplate.mutateAsync(data as CreateTemplateData);
      setSelectedTemplate(newTemplate);
      setIsEditMode(true);
      setIsCreateModalOpen(false);
      createForm.reset();
      
      toast({
        title: "✅ Modèle créé",
        description: `Le modèle "${data.name}" a été créé avec succès.`,
      });
    } catch (error) {
      console.error('Error creating template:', error);
    }
  }, [createTemplate, createForm, toast]);

  const handleEditTemplate = useCallback((template: BulletinTemplate) => {
    setSelectedTemplate(template);
    setIsEditMode(true);
    setHasUnsavedChanges(false);
  }, []);

  const handleSaveTemplate = useCallback(async () => {
    if (!selectedTemplate) return;

    try {
      const updatedTemplate = await updateTemplate.mutateAsync({
        id: selectedTemplate.id,
        data: {
          name: selectedTemplate.name,
          description: selectedTemplate.description,
          config: selectedTemplate.config,
          metadata: selectedTemplate.metadata,
          status: selectedTemplate.status
        }
      });
      
      setSelectedTemplate(updatedTemplate);
      setHasUnsavedChanges(false);
      
      toast({
        title: "✅ Modèle sauvegardé",
        description: "Vos modifications ont été sauvegardées avec succès.",
      });
    } catch (error) {
      console.error('Error saving template:', error);
    }
  }, [selectedTemplate, updateTemplate, toast]);

  const handleDuplicateTemplate = useCallback(async (template: BulletinTemplate) => {
    const newName = `${template.name} (Copie)`;
    
    try {
      await duplicateTemplate.mutateAsync({
        id: template.id,
        name: newName
      });
      
      toast({
        title: "✅ Modèle dupliqué",
        description: `Le modèle "${newName}" a été créé par duplication.`,
      });
    } catch (error) {
      console.error('Error duplicating template:', error);
    }
  }, [duplicateTemplate, toast]);

  const handleDeleteTemplate = useCallback(async (template: BulletinTemplate) => {
    try {
      await deleteTemplate.mutateAsync(template.id);
      
      // Si le template supprimé était sélectionné, le désélectionner
      if (selectedTemplate?.id === template.id) {
        setSelectedTemplate(null);
        setIsEditMode(false);
      }
      
      toast({
        title: "✅ Modèle supprimé",
        description: `Le modèle "${template.name}" a été supprimé avec succès.`,
      });
    } catch (error) {
      console.error('Error deleting template:', error);
    }
  }, [deleteTemplate, selectedTemplate, toast]);

  const handleExportTemplate = useCallback(async (template: BulletinTemplate) => {
    try {
      await exportTemplate.mutateAsync(template.id);
    } catch (error) {
      console.error('Error exporting template:', error);
    }
  }, [exportTemplate]);

  const handleImportTemplate = useCallback(async (file: File) => {
    try {
      const content = await file.text();
      const templateData = JSON.parse(content);
      
      await importTemplate.mutateAsync(templateData);
      setIsImportModalOpen(false);
      
      toast({
        title: "✅ Modèle importé",
        description: "Le modèle a été importé avec succès.",
      });
    } catch (error) {
      console.error('Error importing template:', error);
      toast({
        title: "❌ Erreur d'import",
        description: "Impossible d'importer le fichier. Vérifiez le format.",
        variant: "destructive",
      });
    }
  }, [importTemplate, toast]);

  const handlePreviewTemplate = useCallback((template: BulletinTemplate) => {
    // TODO: Implémenter la prévisualisation
    toast({
      title: "🔍 Aperçu",
      description: "Fonctionnalité de prévisualisation en cours de développement.",
    });
  }, [toast]);

  const handleFilterChange = useCallback((newFilters: Partial<TemplateFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  }, []);

  // ===== EFFETS =====

  // Détecter les changements non sauvegardés
  useEffect(() => {
    if (isEditMode && selectedTemplate) {
      // Logique pour détecter les changements
      setHasUnsavedChanges(true);
    }
  }, [isEditMode, selectedTemplate]);

  // ===== COMPOSANTS RENDER =====

  const renderCreateModal = () => (
    <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700" data-testid="button-create-template">
          <Plus className="h-4 w-4 mr-2" />
          Nouveau modèle
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Créer un nouveau modèle</DialogTitle>
          <DialogDescription>
            Créez un modèle de bulletin personnalisé pour votre école.
          </DialogDescription>
        </DialogHeader>

        <Form {...createForm}>
          <form onSubmit={createForm.handleSubmit(handleCreateTemplate)} className="space-y-4">
            <FormField
              control={createForm.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom du modèle</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ex: Bulletin Trimestriel 2025" data-testid="input-template-name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={createForm.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (optionnel)</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Description du modèle..." rows={3} data-testid="input-template-description" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={createForm.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Statut</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-template-status">
                        <SelectValue placeholder="Sélectionner un statut" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="draft">Brouillon</SelectItem>
                      <SelectItem value="published">Publié</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)} data-testid="button-cancel-create">
                Annuler
              </Button>
              <Button type="submit" disabled={createTemplate.isPending} data-testid="button-submit-create">
                {createTemplate.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Créer
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );

  const renderImportModal = () => (
    <Dialog open={isImportModalOpen} onOpenChange={setIsImportModalOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" data-testid="button-import-template">
          <Upload className="h-4 w-4 mr-2" />
          Importer
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Importer un modèle</DialogTitle>
          <DialogDescription>
            Importez un modèle de bulletin depuis un fichier JSON.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <FileUp className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-sm text-gray-600 mb-2">
              Glissez-déposez votre fichier ici ou cliquez pour sélectionner
            </p>
            <Input
              type="file"
              accept=".json"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImportTemplate(file);
              }}
              className="hidden"
              id="import-file"
              data-testid="input-import-file"
            />
            <Label htmlFor="import-file" className="cursor-pointer">
              <Button variant="outline" asChild>
                <span>Sélectionner un fichier</span>
              </Button>
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsImportModalOpen(false)} data-testid="button-cancel-import">
            Annuler
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  const renderFilters = () => (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <Input
              placeholder="Rechercher un modèle..."
              value={filters.search || ''}
              onChange={(e) => handleFilterChange({ search: e.target.value })}
              className="max-w-xs"
              data-testid="input-search-templates"
            />
          </div>

          <Select 
            value={filters.status} 
            onValueChange={(value) => handleFilterChange({ status: value as any })}
          >
            <SelectTrigger className="w-32" data-testid="select-filter-status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              <SelectItem value="draft">Brouillons</SelectItem>
              <SelectItem value="published">Publiés</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={() => setFilters({ status: 'all', page: 1, limit: 12 })} data-testid="button-reset-filters">
            <RefreshCw className="h-4 w-4 mr-2" />
            Réinitialiser
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderTemplatesList = () => {
    if (isLoadingTemplates) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-32 bg-gray-200 rounded mb-4"></div>
                <div className="flex justify-between">
                  <div className="h-8 bg-gray-200 rounded w-20"></div>
                  <div className="h-8 bg-gray-200 rounded w-20"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    if (templatesError) {
      return (
        <Card className="p-6 text-center">
          <AlertCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Erreur de chargement</h3>
          <p className="text-gray-600 mb-4">Impossible de charger les modèles de bulletins.</p>
          <Button onClick={() => window.location.reload()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Réessayer
          </Button>
        </Card>
      );
    }

    const templates = templatesData?.templates || [];

    if (templates.length === 0) {
      return (
        <Card className="p-6 text-center">
          <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Aucun modèle trouvé</h3>
          <p className="text-gray-600 mb-4">
            Commencez par créer votre premier modèle de bulletin.
          </p>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Créer un modèle
          </Button>
        </Card>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            onEdit={handleEditTemplate}
            onDuplicate={handleDuplicateTemplate}
            onDelete={handleDeleteTemplate}
            onExport={handleExportTemplate}
            onPreview={handlePreviewTemplate}
          />
        ))}
      </div>
    );
  };

  const renderPagination = () => {
    if (!templatesData?.pagination || templatesData.pagination.totalPages <= 1) return null;

    const { page, totalPages } = templatesData.pagination;

    return (
      <div className="flex items-center justify-center gap-2 mt-8">
        <Button
          variant="outline"
          disabled={page <= 1}
          onClick={() => handleFilterChange({ page: page - 1 })}
          data-testid="button-prev-page"
        >
          Précédent
        </Button>
        
        <span className="text-sm text-gray-600">
          Page {page} sur {totalPages}
        </span>

        <Button
          variant="outline"
          disabled={page >= totalPages}
          onClick={() => handleFilterChange({ page: page + 1 })}
          data-testid="button-next-page"
        >
          Suivant
        </Button>
      </div>
    );
  };

  // ===== RENDER PRINCIPAL =====

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Modèles de Bulletins</h1>
          <p className="text-gray-600 mt-1">
            Gérez vos modèles de bulletins personnalisés
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isEditMode && selectedTemplate && (
            <SaveIndicator 
              isSaving={isSaving} 
              lastSaved={lastSaved} 
              hasUnsavedChanges={hasUnsavedChanges} 
            />
          )}
          
          {isEditMode && hasUnsavedChanges && (
            <Button onClick={handleSaveTemplate} disabled={updateTemplate.isPending} data-testid="button-save-changes">
              {updateTemplate.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Sauvegarder
            </Button>
          )}

          {renderImportModal()}
          {renderCreateModal()}
        </div>
      </div>

      {/* Filtres */}
      {renderFilters()}

      {/* Onglets */}
      <Tabs defaultValue="my-templates" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="my-templates" data-testid="tab-my-templates">
            Mes modèles ({templatesData?.pagination.total || 0})
          </TabsTrigger>
          <TabsTrigger value="default-templates" data-testid="tab-default-templates">
            Modèles par défaut ({defaultTemplates?.length || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="my-templates" className="mt-6">
          {renderTemplatesList()}
          {renderPagination()}
        </TabsContent>

        <TabsContent value="default-templates" className="mt-6">
          {isLoadingDefaults ? (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Chargement des modèles par défaut...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {defaultTemplates?.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onEdit={handleEditTemplate}
                  onDuplicate={handleDuplicateTemplate}
                  onDelete={() => {}} // Pas de suppression pour les modèles par défaut
                  onExport={handleExportTemplate}
                  onPreview={handlePreviewTemplate}
                />
              )) || (
                <Card className="p-6 text-center col-span-full">
                  <Star className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Aucun modèle par défaut</h3>
                  <p className="text-gray-600">Les modèles par défaut seront bientôt disponibles.</p>
                </Card>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BulletinTemplateManager;