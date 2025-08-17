import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Delegation records for tracking administrative delegation
export const delegations = pgTable("delegations", {
  id: serial("id").primaryKey(),
  delegatorId: integer("delegator_id").notNull(), // User who delegates
  delegateeId: integer("delegatee_id").notNull(), // User receiving delegation
  permissions: text("permissions").array().notNull(), // List of delegated permissions
  level: text("level").notNull(), // full, limited, specific
  scope: text("scope"), // school, class, module specific
  scopeId: integer("scope_id"), // ID of scope (schoolId, classId, etc.)
  isActive: boolean("is_active").default(true),
  expiresAt: timestamp("expires_at"),
  constraints: jsonb("constraints"), // Additional constraints on delegation
  reason: text("reason"), // Reason for delegation
  approvedBy: integer("approved_by"), // SiteAdmin who approved (if required)
  approvedAt: timestamp("approved_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Delegation history for audit trail
export const delegationHistory = pgTable("delegation_history", {
  id: serial("id").primaryKey(),
  delegationId: integer("delegation_id").notNull(),
  action: text("action").notNull(), // created, modified, revoked, expired
  performedBy: integer("performed_by").notNull(),
  oldData: jsonb("old_data"),
  newData: jsonb("new_data"),
  reason: text("reason"),
  timestamp: timestamp("timestamp").defaultNow(),
});

// Permission templates for common delegation patterns
export const permissionTemplates = pgTable("permission_templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  permissions: text("permissions").array().notNull(),
  requiredRole: text("required_role"), // Minimum role required to use template
  isSystemTemplate: boolean("is_system_template").default(false),
  createdBy: integer("created_by"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations will be defined in the main schema after all tables are imported

// Zod schemas
export const insertDelegationSchema = createInsertSchema(delegations);
export const insertDelegationHistorySchema = createInsertSchema(delegationHistory);
export const insertPermissionTemplateSchema = createInsertSchema(permissionTemplates);

export type Delegation = typeof delegations.$inferSelect;
export type InsertDelegation = z.infer<typeof insertDelegationSchema>;
export type DelegationHistory = typeof delegationHistory.$inferSelect;
export type InsertDelegationHistory = z.infer<typeof insertDelegationHistorySchema>;
export type PermissionTemplate = typeof permissionTemplates.$inferSelect;
export type InsertPermissionTemplate = z.infer<typeof insertPermissionTemplateSchema>;

// Permission definitions
export const SYSTEM_PERMISSIONS = {
  // User management
  'users.view': 'View user profiles and data',
  'users.create': 'Create new user accounts',
  'users.edit': 'Edit user profiles and settings',
  'users.delete': 'Delete user accounts',
  'users.manage_roles': 'Assign and modify user roles',
  
  // School management
  'schools.view': 'View school information',
  'schools.edit': 'Edit school settings and data',
  'schools.manage_users': 'Manage school users',
  'schools.manage_classes': 'Manage school classes',
  
  // Academic management
  'academics.view_grades': 'View student grades',
  'academics.edit_grades': 'Edit student grades',
  'academics.manage_bulletins': 'Generate and sign bulletins',
  'academics.view_attendance': 'View attendance records',
  'academics.edit_attendance': 'Edit attendance records',
  
  // Financial management
  'finance.view': 'View financial data',
  'finance.manage': 'Manage school finances',
  'finance.reports': 'Generate financial reports',
  
  // System administration
  'system.view_logs': 'View system logs',
  'system.manage_config': 'Manage system configuration',
  'system.manage_backups': 'Manage system backups',
  'system.delegate': 'Delegate permissions to others',
} as const;

export type SystemPermission = keyof typeof SYSTEM_PERMISSIONS;

// Note: Relations will be defined in main schema.ts after all table imports