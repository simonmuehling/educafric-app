// ===== BULLETIN TEMPLATE ROUTES =====
// Routes API sécurisées pour la gestion des modèles de bulletins

import { Router } from 'express';
import { storage } from '../storage';
import { requireAuth, requireAnyRole } from '../middleware/auth';
import { bulletinTemplateInsertSchema } from '../../shared/schemas/bulletinTemplateSchema';
import { z } from 'zod';

const router = Router();

// Middleware d'authentification requis pour toutes les routes
router.use(requireAuth);

// Middleware de vérification du rôle directeur
const requireDirector = (req: any, res: any, next: any) => {
  const user = req.user;
  if (!user || (user.role !== 'director' && user.role !== 'admin')) {
    return res.status(403).json({ 
      success: false, 
      message: 'Access denied. Director role required.' 
    });
  }
  next();
};

// Middleware de vérification de l'école
const verifySchoolAccess = (req: any, res: any, next: any) => {
  const user = req.user;
  const schoolId = parseInt(req.params.schoolId || req.body.schoolId || req.query.schoolId);
  
  if (!schoolId) {
    return res.status(400).json({ 
      success: false, 
      message: 'School ID is required' 
    });
  }
  
  if (user.schoolId && user.schoolId !== schoolId) {
    return res.status(403).json({ 
      success: false, 
      message: 'Access denied. You can only access templates from your school.' 
    });
  }
  
  req.schoolId = schoolId;
  next();
};

// Schémas de validation pour les paramètres de requête
const listTemplatesQuerySchema = z.object({
  status: z.enum(['draft', 'published', 'all']).optional().default('all'),
  createdBy: z.string().transform(Number).optional(),
  templateType: z.string().optional(),
  page: z.string().transform(Number).optional().default(1),
  limit: z.string().transform(Number).optional().default(20),
  search: z.string().optional()
});

const templateIdParamSchema = z.object({
  id: z.string().transform(Number)
});

// ===== ROUTES CRUD PRINCIPALES =====

// POST /api/director/bulletin-templates - Créer un nouveau modèle
router.post('/', requireDirector, async (req, res) => {
  try {
    console.log('[TEMPLATE_ROUTES] Creating new template:', req.body.name);

    const user = req.user as any;
    const schoolId = user.schoolId || 1;

    // Validation des données d'entrée
    const validatedData = bulletinTemplateInsertSchema.parse({
      ...req.body,
      schoolId,
      createdBy: user.id
    });

    // Créer le modèle
    const template = await storage.createTemplate(validatedData);

    console.log('[TEMPLATE_ROUTES] ✅ Template created successfully:', template.id);

    res.status(201).json({
      success: true,
      data: template,
      message: 'Template created successfully'
    });

  } catch (error: any) {
    console.error('[TEMPLATE_ROUTES] ❌ Error creating template:', error);
    
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create template',
      error: error.message
    });
  }
});

// GET /api/director/bulletin-templates - Lister les modèles avec pagination et filtres
router.get('/', requireDirector, async (req, res) => {
  try {
    const user = req.user as any;
    const schoolId = user.schoolId || 1;

    // Validation des paramètres de requête
    const {
      status,
      createdBy,
      templateType,
      page,
      limit,
      search
    } = listTemplatesQuerySchema.parse(req.query);

    console.log('[TEMPLATE_ROUTES] Listing templates for school:', schoolId, 'with filters:', {
      status, createdBy, templateType, page, limit, search
    });

    // Construire les filtres
    const filters: any = {
      status,
      limit,
      offset: (page - 1) * limit
    };

    if (createdBy) {
      filters.createdBy = createdBy;
    }

    if (templateType) {
      filters.templateType = templateType;
    }

    if (search) {
      filters.search = search;
    }

    // Récupérer les modèles
    const result = await storage.listTemplates(schoolId, filters);

    console.log('[TEMPLATE_ROUTES] ✅ Found', result.templates.length, 'templates (total:', result.total, ')');

    res.json({
      success: true,
      data: {
        templates: result.templates,
        pagination: {
          page,
          limit,
          total: result.total,
          totalPages: Math.ceil(result.total / limit)
        }
      }
    });

  } catch (error: any) {
    console.error('[TEMPLATE_ROUTES] ❌ Error listing templates:', error);
    
    res.status(500).json({
      success: false,
      message: 'Failed to list templates',
      error: error.message
    });
  }
});

// GET /api/director/bulletin-templates/:id - Récupérer un modèle spécifique
router.get('/:id', requireDirector, async (req, res) => {
  try {
    const { id } = templateIdParamSchema.parse(req.params);
    const user = req.user as any;

    console.log('[TEMPLATE_ROUTES] Getting template:', id, 'for user:', user.id);

    const template = await storage.getTemplate(id);

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }

    // Vérifier l'accès à l'école
    if (user.schoolId && template.schoolId !== user.schoolId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Template belongs to different school.'
      });
    }

    console.log('[TEMPLATE_ROUTES] ✅ Template found:', template.name);

    res.json({
      success: true,
      data: template
    });

  } catch (error: any) {
    console.error('[TEMPLATE_ROUTES] ❌ Error getting template:', error);
    
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid template ID',
        errors: error.errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to get template',
      error: error.message
    });
  }
});

// PUT /api/director/bulletin-templates/:id - Mettre à jour un modèle
router.put('/:id', requireDirector, async (req, res) => {
  try {
    const { id } = templateIdParamSchema.parse(req.params);
    const user = req.user as any;

    console.log('[TEMPLATE_ROUTES] Updating template:', id, 'by user:', user.id);

    // Vérifier que le modèle existe et appartient à la bonne école
    const existingTemplate = await storage.getTemplate(id);

    if (!existingTemplate) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }

    if (user.schoolId && existingTemplate.schoolId !== user.schoolId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Template belongs to different school.'
      });
    }

    // Validation des données de mise à jour (partielle)
    const updateSchema = bulletinTemplateInsertSchema.partial().omit({
      schoolId: true,
      createdBy: true
    });

    const validatedUpdates = updateSchema.parse(req.body);

    // Mettre à jour le modèle
    const updatedTemplate = await storage.updateTemplate(id, validatedUpdates);

    console.log('[TEMPLATE_ROUTES] ✅ Template updated successfully');

    res.json({
      success: true,
      data: updatedTemplate,
      message: 'Template updated successfully'
    });

  } catch (error: any) {
    console.error('[TEMPLATE_ROUTES] ❌ Error updating template:', error);
    
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update template',
      error: error.message
    });
  }
});

// DELETE /api/director/bulletin-templates/:id - Supprimer un modèle
router.delete('/:id', requireDirector, async (req, res) => {
  try {
    const { id } = templateIdParamSchema.parse(req.params);
    const user = req.user as any;

    console.log('[TEMPLATE_ROUTES] Deleting template:', id, 'by user:', user.id);

    // Vérifier que le modèle existe et appartient à la bonne école
    const existingTemplate = await storage.getTemplate(id);

    if (!existingTemplate) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }

    if (user.schoolId && existingTemplate.schoolId !== user.schoolId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Template belongs to different school.'
      });
    }

    // Empêcher la suppression des modèles par défaut
    if (existingTemplate.templateType === 'default') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete default templates'
      });
    }

    // Supprimer le modèle
    const deleted = await storage.deleteTemplate(id);

    if (!deleted) {
      return res.status(500).json({
        success: false,
        message: 'Failed to delete template'
      });
    }

    console.log('[TEMPLATE_ROUTES] ✅ Template deleted successfully');

    res.json({
      success: true,
      message: 'Template deleted successfully'
    });

  } catch (error: any) {
    console.error('[TEMPLATE_ROUTES] ❌ Error deleting template:', error);
    
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid template ID',
        errors: error.errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to delete template',
      error: error.message
    });
  }
});

// ===== ROUTES FONCTIONNALITÉS AVANCÉES =====

// POST /api/director/bulletin-templates/:id/duplicate - Dupliquer un modèle
router.post('/:id/duplicate', requireDirector, async (req, res) => {
  try {
    const { id } = templateIdParamSchema.parse(req.params);
    const { name } = z.object({ name: z.string().min(1) }).parse(req.body);
    const user = req.user as any;
    const schoolId = user.schoolId || 1;

    console.log('[TEMPLATE_ROUTES] Duplicating template:', id, 'as:', name);

    const duplicatedTemplate = await storage.duplicateTemplate(id, name, schoolId, user.id);

    console.log('[TEMPLATE_ROUTES] ✅ Template duplicated successfully');

    res.status(201).json({
      success: true,
      data: duplicatedTemplate,
      message: 'Template duplicated successfully'
    });

  } catch (error: any) {
    console.error('[TEMPLATE_ROUTES] ❌ Error duplicating template:', error);
    
    res.status(500).json({
      success: false,
      message: 'Failed to duplicate template',
      error: error.message
    });
  }
});

// GET /api/director/bulletin-templates/:id/export - Exporter un modèle
router.get('/:id/export', requireDirector, async (req, res) => {
  try {
    const { id } = templateIdParamSchema.parse(req.params);
    const user = req.user as any;

    console.log('[TEMPLATE_ROUTES] Exporting template:', id);

    // Vérifier l'accès
    const template = await storage.getTemplate(id);
    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }

    if (user.schoolId && template.schoolId !== user.schoolId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const exportData = await storage.exportTemplate(id);

    console.log('[TEMPLATE_ROUTES] ✅ Template exported successfully');

    res.json({
      success: true,
      data: exportData
    });

  } catch (error: any) {
    console.error('[TEMPLATE_ROUTES] ❌ Error exporting template:', error);
    
    res.status(500).json({
      success: false,
      message: 'Failed to export template',
      error: error.message
    });
  }
});

// POST /api/director/bulletin-templates/import - Importer un modèle
router.post('/import', requireDirector, async (req, res) => {
  try {
    const { templateData } = req.body;
    const user = req.user as any;
    const schoolId = user.schoolId || 1;

    console.log('[TEMPLATE_ROUTES] Importing template:', templateData?.name);

    if (!templateData) {
      return res.status(400).json({
        success: false,
        message: 'Template data is required'
      });
    }

    const importedTemplate = await storage.importTemplate(templateData, schoolId, user.id);

    console.log('[TEMPLATE_ROUTES] ✅ Template imported successfully');

    res.status(201).json({
      success: true,
      data: importedTemplate,
      message: 'Template imported successfully'
    });

  } catch (error: any) {
    console.error('[TEMPLATE_ROUTES] ❌ Error importing template:', error);
    
    res.status(500).json({
      success: false,
      message: 'Failed to import template',
      error: error.message
    });
  }
});

// ===== ROUTES ÉLÉMENTS ET TYPES =====

// GET /api/director/bulletin-templates/element-types - Récupérer les types d'éléments disponibles
router.get('/element-types', requireDirector, async (req, res) => {
  try {
    const { category } = req.query;

    console.log('[TEMPLATE_ROUTES] Getting element types, category:', category);

    let elementTypes;
    if (category && typeof category === 'string') {
      elementTypes = await storage.getElementTypesByCategory(category);
    } else {
      elementTypes = await storage.getElementTypes();
    }

    console.log('[TEMPLATE_ROUTES] ✅ Found', elementTypes.length, 'element types');

    res.json({
      success: true,
      data: elementTypes
    });

  } catch (error: any) {
    console.error('[TEMPLATE_ROUTES] ❌ Error getting element types:', error);
    
    res.status(500).json({
      success: false,
      message: 'Failed to get element types',
      error: error.message
    });
  }
});

// ===== ROUTES STATISTIQUES ET VERSIONS =====

// GET /api/director/bulletin-templates/:id/versions - Récupérer les versions d'un modèle
router.get('/:id/versions', requireDirector, async (req, res) => {
  try {
    const { id } = templateIdParamSchema.parse(req.params);

    console.log('[TEMPLATE_ROUTES] Getting versions for template:', id);

    const versions = await storage.getTemplateVersions(id);

    console.log('[TEMPLATE_ROUTES] ✅ Found', versions.length, 'versions');

    res.json({
      success: true,
      data: versions
    });

  } catch (error: any) {
    console.error('[TEMPLATE_ROUTES] ❌ Error getting template versions:', error);
    
    res.status(500).json({
      success: false,
      message: 'Failed to get template versions',
      error: error.message
    });
  }
});

// GET /api/director/bulletin-templates/usage-stats - Statistiques d'utilisation
router.get('/usage-stats', requireDirector, async (req, res) => {
  try {
    const user = req.user as any;
    const schoolId = user.schoolId || 1;

    console.log('[TEMPLATE_ROUTES] Getting usage stats for school:', schoolId);

    const stats = await storage.getTemplateUsageStats(schoolId);

    console.log('[TEMPLATE_ROUTES] ✅ Got usage stats for', stats.length, 'templates');

    res.json({
      success: true,
      data: stats
    });

  } catch (error: any) {
    console.error('[TEMPLATE_ROUTES] ❌ Error getting usage stats:', error);
    
    res.status(500).json({
      success: false,
      message: 'Failed to get usage stats',
      error: error.message
    });
  }
});

// POST /api/director/bulletin-templates/:id/use - Incrémenter le compteur d'utilisation
router.post('/:id/use', requireDirector, async (req, res) => {
  try {
    const { id } = templateIdParamSchema.parse(req.params);

    console.log('[TEMPLATE_ROUTES] Incrementing usage count for template:', id);

    await storage.incrementUsageCount(id);

    console.log('[TEMPLATE_ROUTES] ✅ Usage count incremented');

    res.json({
      success: true,
      message: 'Usage count incremented'
    });

  } catch (error: any) {
    console.error('[TEMPLATE_ROUTES] ❌ Error incrementing usage count:', error);
    
    res.status(500).json({
      success: false,
      message: 'Failed to increment usage count',
      error: error.message
    });
  }
});

// ===== ROUTES MODÈLES PAR DÉFAUT =====

// GET /api/director/bulletin-templates/defaults - Récupérer les modèles par défaut
router.get('/defaults', requireDirector, async (req, res) => {
  try {
    console.log('[TEMPLATE_ROUTES] Getting default templates');

    const defaultTemplates = await storage.getDefaultTemplates();

    console.log('[TEMPLATE_ROUTES] ✅ Found', defaultTemplates.length, 'default templates');

    res.json({
      success: true,
      data: defaultTemplates
    });

  } catch (error: any) {
    console.error('[TEMPLATE_ROUTES] ❌ Error getting default templates:', error);
    
    res.status(500).json({
      success: false,
      message: 'Failed to get default templates',
      error: error.message
    });
  }
});

export default router;