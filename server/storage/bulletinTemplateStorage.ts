// ===== BULLETIN TEMPLATE STORAGE =====
// Handles bulletin template-related database operations

import { db } from '../db';
import { 
  bulletinTemplates, 
  bulletinTemplateVersions, 
  templateElementTypes,
  type BulletinTemplate,
  type InsertBulletinTemplate,
  type BulletinTemplateVersion,
  type TemplateElementType
} from '../../shared/schemas/bulletinTemplateSchema';
import { eq, and, sql, desc, asc } from 'drizzle-orm';

export interface IBulletinTemplateStorage {
  // Template CRUD operations
  createTemplate(template: InsertBulletinTemplate): Promise<BulletinTemplate>;
  getTemplate(id: number): Promise<BulletinTemplate | null>;
  updateTemplate(id: number, updates: Partial<InsertBulletinTemplate>): Promise<BulletinTemplate>;
  deleteTemplate(id: number): Promise<boolean>;
  listTemplates(schoolId: number, filters?: {
    status?: 'draft' | 'published' | 'all';
    createdBy?: number;
    templateType?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ templates: BulletinTemplate[]; total: number }>;

  // Template version management
  createTemplateVersion(templateId: number, version: Omit<BulletinTemplateVersion, 'id' | 'createdAt'>): Promise<BulletinTemplateVersion>;
  getTemplateVersions(templateId: number): Promise<BulletinTemplateVersion[]>;
  getTemplateVersion(templateId: number, version: number): Promise<BulletinTemplateVersion | null>;

  // Template element types
  getElementTypes(): Promise<TemplateElementType[]>;
  getElementTypesByCategory(category: string): Promise<TemplateElementType[]>;

  // Template usage tracking
  incrementUsageCount(templateId: number): Promise<void>;
  getTemplateUsageStats(schoolId: number): Promise<Array<{ templateId: number; templateName: string; usageCount: number; lastUsedAt: Date | null }>>;

  // Default templates
  getDefaultTemplates(): Promise<BulletinTemplate[]>;
  createDefaultTemplate(template: InsertBulletinTemplate): Promise<BulletinTemplate>;

  // Template duplication
  duplicateTemplate(templateId: number, newName: string, schoolId: number, createdBy: number): Promise<BulletinTemplate>;

  // Template export/import
  exportTemplate(templateId: number): Promise<any>;
  importTemplate(templateData: any, schoolId: number, createdBy: number): Promise<BulletinTemplate>;
}

export class BulletinTemplateStorage implements IBulletinTemplateStorage {

  async createTemplate(template: InsertBulletinTemplate): Promise<BulletinTemplate> {
    console.log('[TEMPLATE_STORAGE] Creating new template:', template.name);

    try {
      const [result] = await db.insert(bulletinTemplates).values({
        ...template,
        createdAt: new Date(),
        updatedAt: new Date()
      }).returning();

      console.log('[TEMPLATE_STORAGE] ✅ Template created with ID:', result.id);
      return result;
    } catch (error) {
      console.error('[TEMPLATE_STORAGE] ❌ Error creating template:', error);
      throw new Error(`Failed to create template: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getTemplate(id: number): Promise<BulletinTemplate | null> {
    console.log('[TEMPLATE_STORAGE] Getting template with ID:', id);

    try {
      const [result] = await db.select()
        .from(bulletinTemplates)
        .where(eq(bulletinTemplates.id, id));

      if (!result) {
        console.log('[TEMPLATE_STORAGE] Template not found');
        return null;
      }

      console.log('[TEMPLATE_STORAGE] ✅ Template found:', result.name);
      return result;
    } catch (error) {
      console.error('[TEMPLATE_STORAGE] ❌ Error getting template:', error);
      throw new Error(`Failed to get template: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async updateTemplate(id: number, updates: Partial<InsertBulletinTemplate>): Promise<BulletinTemplate> {
    console.log('[TEMPLATE_STORAGE] Updating template:', id);

    try {
      // Get current template for version management
      const currentTemplate = await this.getTemplate(id);
      if (!currentTemplate) {
        throw new Error('Template not found');
      }

      // Create version if this is a significant update (elements changed)
      if (updates.elements && JSON.stringify(updates.elements) !== JSON.stringify(currentTemplate.elements)) {
        await this.createTemplateVersion(id, {
          templateId: id,
          version: currentTemplate.version,
          name: currentTemplate.name,
          elements: currentTemplate.elements,
          globalStyles: currentTemplate.globalStyles,
          changeDescription: 'Previous version before update',
          createdBy: currentTemplate.createdBy
        });
      }

      const [result] = await db.update(bulletinTemplates)
        .set({
          ...updates,
          version: currentTemplate.version + 1,
          updatedAt: new Date()
        })
        .where(eq(bulletinTemplates.id, id))
        .returning();

      console.log('[TEMPLATE_STORAGE] ✅ Template updated');
      return result;
    } catch (error) {
      console.error('[TEMPLATE_STORAGE] ❌ Error updating template:', error);
      throw new Error(`Failed to update template: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async deleteTemplate(id: number): Promise<boolean> {
    console.log('[TEMPLATE_STORAGE] Deleting template:', id);

    try {
      // Check if template exists
      const template = await this.getTemplate(id);
      if (!template) {
        return false;
      }

      // Delete template versions first (cascade)
      await db.delete(bulletinTemplateVersions)
        .where(eq(bulletinTemplateVersions.templateId, id));

      // Delete template
      await db.delete(bulletinTemplates)
        .where(eq(bulletinTemplates.id, id));

      console.log('[TEMPLATE_STORAGE] ✅ Template deleted successfully');
      return true;
    } catch (error) {
      console.error('[TEMPLATE_STORAGE] ❌ Error deleting template:', error);
      throw new Error(`Failed to delete template: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async listTemplates(schoolId: number, filters: {
    status?: 'draft' | 'published' | 'all';
    createdBy?: number;
    templateType?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<{ templates: BulletinTemplate[]; total: number }> {
    console.log('[TEMPLATE_STORAGE] Listing templates for school:', schoolId, 'with filters:', filters);

    try {
      const {
        status = 'all',
        createdBy,
        templateType,
        limit = 50,
        offset = 0
      } = filters;

      // Build where conditions
      const conditions = [eq(bulletinTemplates.schoolId, schoolId)];

      if (status !== 'all') {
        if (status === 'published') {
          conditions.push(eq(bulletinTemplates.isActive, true));
        } else if (status === 'draft') {
          conditions.push(eq(bulletinTemplates.isActive, false));
        }
      }

      if (createdBy) {
        conditions.push(eq(bulletinTemplates.createdBy, createdBy));
      }

      if (templateType) {
        conditions.push(eq(bulletinTemplates.templateType, templateType));
      }

      // Get total count
      const [countResult] = await db.select({ count: sql<number>`count(*)` })
        .from(bulletinTemplates)
        .where(and(...conditions));

      const total = countResult?.count || 0;

      // Get templates with pagination
      const templates = await db.select()
        .from(bulletinTemplates)
        .where(and(...conditions))
        .orderBy(desc(bulletinTemplates.updatedAt))
        .limit(limit)
        .offset(offset);

      console.log('[TEMPLATE_STORAGE] ✅ Found', templates.length, 'templates (total:', total, ')');
      return { templates, total };
    } catch (error) {
      console.error('[TEMPLATE_STORAGE] ❌ Error listing templates:', error);
      throw new Error(`Failed to list templates: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async createTemplateVersion(templateId: number, version: Omit<BulletinTemplateVersion, 'id' | 'createdAt'>): Promise<BulletinTemplateVersion> {
    console.log('[TEMPLATE_STORAGE] Creating template version for template:', templateId);

    try {
      const [result] = await db.insert(bulletinTemplateVersions).values({
        ...version,
        createdAt: new Date()
      }).returning();

      console.log('[TEMPLATE_STORAGE] ✅ Template version created');
      return result;
    } catch (error) {
      console.error('[TEMPLATE_STORAGE] ❌ Error creating template version:', error);
      throw new Error(`Failed to create template version: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getTemplateVersions(templateId: number): Promise<BulletinTemplateVersion[]> {
    console.log('[TEMPLATE_STORAGE] Getting versions for template:', templateId);

    try {
      const versions = await db.select()
        .from(bulletinTemplateVersions)
        .where(eq(bulletinTemplateVersions.templateId, templateId))
        .orderBy(desc(bulletinTemplateVersions.version));

      console.log('[TEMPLATE_STORAGE] ✅ Found', versions.length, 'versions');
      return versions;
    } catch (error) {
      console.error('[TEMPLATE_STORAGE] ❌ Error getting template versions:', error);
      throw new Error(`Failed to get template versions: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getTemplateVersion(templateId: number, version: number): Promise<BulletinTemplateVersion | null> {
    console.log('[TEMPLATE_STORAGE] Getting specific template version:', templateId, 'v', version);

    try {
      const [result] = await db.select()
        .from(bulletinTemplateVersions)
        .where(and(
          eq(bulletinTemplateVersions.templateId, templateId),
          eq(bulletinTemplateVersions.version, version)
        ));

      return result || null;
    } catch (error) {
      console.error('[TEMPLATE_STORAGE] ❌ Error getting template version:', error);
      throw new Error(`Failed to get template version: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getElementTypes(): Promise<TemplateElementType[]> {
    console.log('[TEMPLATE_STORAGE] Getting all element types');

    try {
      const elementTypes = await db.select()
        .from(templateElementTypes)
        .where(eq(templateElementTypes.isActive, true))
        .orderBy(asc(templateElementTypes.sortOrder), asc(templateElementTypes.name));

      console.log('[TEMPLATE_STORAGE] ✅ Found', elementTypes.length, 'element types');
      return elementTypes;
    } catch (error) {
      console.error('[TEMPLATE_STORAGE] ❌ Error getting element types:', error);
      throw new Error(`Failed to get element types: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getElementTypesByCategory(category: string): Promise<TemplateElementType[]> {
    console.log('[TEMPLATE_STORAGE] Getting element types for category:', category);

    try {
      const elementTypes = await db.select()
        .from(templateElementTypes)
        .where(and(
          eq(templateElementTypes.category, category),
          eq(templateElementTypes.isActive, true)
        ))
        .orderBy(asc(templateElementTypes.sortOrder), asc(templateElementTypes.name));

      console.log('[TEMPLATE_STORAGE] ✅ Found', elementTypes.length, 'element types for category');
      return elementTypes;
    } catch (error) {
      console.error('[TEMPLATE_STORAGE] ❌ Error getting element types by category:', error);
      throw new Error(`Failed to get element types by category: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async incrementUsageCount(templateId: number): Promise<void> {
    console.log('[TEMPLATE_STORAGE] Incrementing usage count for template:', templateId);

    try {
      await db.update(bulletinTemplates)
        .set({
          usageCount: sql`${bulletinTemplates.usageCount} + 1`,
          lastUsedAt: new Date()
        })
        .where(eq(bulletinTemplates.id, templateId));

      console.log('[TEMPLATE_STORAGE] ✅ Usage count incremented');
    } catch (error) {
      console.error('[TEMPLATE_STORAGE] ❌ Error incrementing usage count:', error);
      throw new Error(`Failed to increment usage count: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getTemplateUsageStats(schoolId: number): Promise<Array<{ templateId: number; templateName: string; usageCount: number; lastUsedAt: Date | null }>> {
    console.log('[TEMPLATE_STORAGE] Getting usage stats for school:', schoolId);

    try {
      const stats = await db.select({
        templateId: bulletinTemplates.id,
        templateName: bulletinTemplates.name,
        usageCount: bulletinTemplates.usageCount,
        lastUsedAt: bulletinTemplates.lastUsedAt
      })
        .from(bulletinTemplates)
        .where(eq(bulletinTemplates.schoolId, schoolId))
        .orderBy(desc(bulletinTemplates.usageCount));

      console.log('[TEMPLATE_STORAGE] ✅ Got usage stats for', stats.length, 'templates');
      return stats;
    } catch (error) {
      console.error('[TEMPLATE_STORAGE] ❌ Error getting usage stats:', error);
      throw new Error(`Failed to get usage stats: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getDefaultTemplates(): Promise<BulletinTemplate[]> {
    console.log('[TEMPLATE_STORAGE] Getting default templates');

    try {
      const templates = await db.select()
        .from(bulletinTemplates)
        .where(and(
          eq(bulletinTemplates.templateType, 'default'),
          eq(bulletinTemplates.isActive, true)
        ))
        .orderBy(asc(bulletinTemplates.name));

      console.log('[TEMPLATE_STORAGE] ✅ Found', templates.length, 'default templates');
      return templates;
    } catch (error) {
      console.error('[TEMPLATE_STORAGE] ❌ Error getting default templates:', error);
      throw new Error(`Failed to get default templates: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async createDefaultTemplate(template: InsertBulletinTemplate): Promise<BulletinTemplate> {
    console.log('[TEMPLATE_STORAGE] Creating default template:', template.name);

    try {
      const defaultTemplate = {
        ...template,
        templateType: 'default' as const,
        isActive: true,
        isDefault: true
      };

      return await this.createTemplate(defaultTemplate);
    } catch (error) {
      console.error('[TEMPLATE_STORAGE] ❌ Error creating default template:', error);
      throw new Error(`Failed to create default template: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async duplicateTemplate(templateId: number, newName: string, schoolId: number, createdBy: number): Promise<BulletinTemplate> {
    console.log('[TEMPLATE_STORAGE] Duplicating template:', templateId, 'as', newName);

    try {
      const originalTemplate = await this.getTemplate(templateId);
      if (!originalTemplate) {
        throw new Error('Template not found');
      }

      const duplicatedTemplate: InsertBulletinTemplate = {
        name: newName,
        description: `Copie de ${originalTemplate.name}`,
        schoolId,
        createdBy,
        templateType: 'custom',
        isActive: false, // Start as draft
        isDefault: false,
        version: 1,
        pageFormat: originalTemplate.pageFormat,
        orientation: originalTemplate.orientation,
        margins: originalTemplate.margins,
        elements: originalTemplate.elements,
        globalStyles: originalTemplate.globalStyles,
        usageCount: 0
      };

      const result = await this.createTemplate(duplicatedTemplate);
      console.log('[TEMPLATE_STORAGE] ✅ Template duplicated successfully');
      return result;
    } catch (error) {
      console.error('[TEMPLATE_STORAGE] ❌ Error duplicating template:', error);
      throw new Error(`Failed to duplicate template: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async exportTemplate(templateId: number): Promise<any> {
    console.log('[TEMPLATE_STORAGE] Exporting template:', templateId);

    try {
      const template = await this.getTemplate(templateId);
      if (!template) {
        throw new Error('Template not found');
      }

      // Create export data with all necessary information
      const exportData = {
        name: template.name,
        description: template.description,
        templateType: template.templateType,
        pageFormat: template.pageFormat,
        orientation: template.orientation,
        margins: template.margins,
        elements: template.elements,
        globalStyles: template.globalStyles,
        exportedAt: new Date().toISOString(),
        exportedFrom: 'Educafric',
        version: template.version
      };

      console.log('[TEMPLATE_STORAGE] ✅ Template exported');
      return exportData;
    } catch (error) {
      console.error('[TEMPLATE_STORAGE] ❌ Error exporting template:', error);
      throw new Error(`Failed to export template: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async importTemplate(templateData: any, schoolId: number, createdBy: number): Promise<BulletinTemplate> {
    console.log('[TEMPLATE_STORAGE] Importing template:', templateData.name);

    try {
      // Validate import data structure
      if (!templateData.name || !templateData.elements) {
        throw new Error('Invalid template data: name and elements are required');
      }

      const importedTemplate: InsertBulletinTemplate = {
        name: `${templateData.name} (Importé)`,
        description: templateData.description || 'Template importé',
        schoolId,
        createdBy,
        templateType: 'custom',
        isActive: false, // Start as draft for review
        isDefault: false,
        version: 1,
        pageFormat: templateData.pageFormat || 'A4',
        orientation: templateData.orientation || 'portrait',
        margins: templateData.margins || { top: 20, right: 20, bottom: 20, left: 20 },
        elements: templateData.elements,
        globalStyles: templateData.globalStyles || {
          fontFamily: 'Arial',
          fontSize: 12,
          lineHeight: 1.4,
          colors: {
            primary: '#1f2937',
            secondary: '#6b7280',
            text: '#374151',
            background: '#ffffff'
          }
        },
        usageCount: 0
      };

      const result = await this.createTemplate(importedTemplate);
      console.log('[TEMPLATE_STORAGE] ✅ Template imported successfully');
      return result;
    } catch (error) {
      console.error('[TEMPLATE_STORAGE] ❌ Error importing template:', error);
      throw new Error(`Failed to import template: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}