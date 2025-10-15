// ===== TEACHER INDEPENDENT MODE SCHEMA =====
// Gestion des activations répétiteur indépendant (fusion Freelancer → Teacher)
// Tarif: 25,000 CFA/an

import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Table d'activation pour le mode répétiteur indépendant
export const teacherIndependentActivations = pgTable("teacher_independent_activations", {
  id: serial("id").primaryKey(),
  teacherId: integer("teacher_id").notNull(), // References users.id
  
  // Période d'activation
  durationType: text("duration_type").notNull().default("yearly"), // "yearly" uniquement pour l'instant
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  
  // Statut
  status: text("status").notNull().default("active"), // "active", "expired", "cancelled", "pending"
  
  // Type d'activation
  activatedBy: text("activated_by").notNull(), // "admin_manual" ou "self_purchase"
  adminUserId: integer("admin_user_id"), // Admin qui a activé (si manuel)
  
  // Informations de paiement
  paymentId: text("payment_id"), // Stripe/MTN payment reference
  paymentMethod: text("payment_method"), // "stripe", "mtn", "manual"
  amountPaid: integer("amount_paid").default(25000), // Montant en CFA (25,000 CFA/an)
  currency: text("currency").default("XAF"), // XAF = Franc CFA
  
  // Notes et métadonnées
  notes: text("notes"), // Notes de l'admin pour activations manuelles
  autoRenew: boolean("auto_renew").default(false), // Renouvellement automatique
  canceledAt: timestamp("canceled_at"),
  cancelReason: text("cancel_reason"),
  
  // Audit
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Table pour les étudiants du mode répétiteur indépendant
export const teacherIndependentStudents = pgTable("teacher_independent_students", {
  id: serial("id").primaryKey(),
  teacherId: integer("teacher_id").notNull(), // References users.id
  studentId: integer("student_id").notNull(), // References users.id
  
  // Informations de connexion
  connectionDate: timestamp("connection_date").defaultNow(),
  connectionMethod: text("connection_method").default("teacher_invite"), // "teacher_invite", "student_request", "parent_request"
  
  // Informations académiques
  subjects: text("subjects").array(), // Matières enseignées
  level: text("level"), // Niveau de l'élève (6ème, 5ème, etc.)
  objectives: text("objectives"), // Objectifs pédagogiques
  
  // Statut
  status: text("status").notNull().default("active"), // "active", "paused", "ended"
  endedAt: timestamp("ended_at"),
  endReason: text("end_reason"),
  
  // Audit
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Sessions de cours privés (répétiteur indépendant)
export const teacherIndependentSessions = pgTable("teacher_independent_sessions", {
  id: serial("id").primaryKey(),
  teacherId: integer("teacher_id").notNull(),
  studentId: integer("student_id").notNull(),
  
  // Détails de la session
  title: text("title").notNull(),
  description: text("description"),
  subject: text("subject").notNull(),
  
  // Planification
  scheduledStart: timestamp("scheduled_start").notNull(),
  scheduledEnd: timestamp("scheduled_end").notNull(),
  actualStart: timestamp("actual_start"),
  actualEnd: timestamp("actual_end"),
  
  // Type de session
  sessionType: text("session_type").default("online"), // "online" (Jitsi), "in_person", "hybrid"
  location: text("location"), // Pour sessions en présentiel
  
  // Session en ligne (Jitsi)
  roomName: text("room_name"), // Nom de la salle Jitsi
  roomPassword: text("room_password"),
  meetingUrl: text("meeting_url"),
  
  // Statut
  status: text("status").notNull().default("scheduled"), // "scheduled", "ongoing", "completed", "cancelled"
  cancelReason: text("cancel_reason"),
  
  // Notes et feedback
  teacherNotes: text("teacher_notes"),
  studentFeedback: text("student_feedback"),
  rating: integer("rating"), // 1-5 étoiles
  
  // Audit
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Table d'invitations pour cours privés (Teacher → Student/Parent)
export const teacherStudentInvitations = pgTable("teacher_student_invitations", {
  id: serial("id").primaryKey(),
  teacherId: integer("teacher_id").notNull(),
  
  // Cible de l'invitation
  targetType: text("target_type").notNull(), // "student" ou "parent"
  targetId: integer("target_id").notNull(), // ID du student ou parent
  studentId: integer("student_id"), // Si targetType = "parent", préciser quel enfant
  
  // Détails de l'invitation
  subjects: text("subjects").array(), // Matières proposées
  level: text("level"), // Niveau
  message: text("message"), // Message personnalisé du prof
  
  // Tarification proposée
  pricePerHour: integer("price_per_hour"), // Prix/heure en CFA
  pricePerSession: integer("price_per_session"), // Prix/session fixe en CFA
  currency: text("currency").default("XAF"),
  
  // Statut
  status: text("status").notNull().default("pending"), // "pending", "accepted", "rejected", "expired"
  responseMessage: text("response_message"), // Message de réponse du parent/élève
  respondedAt: timestamp("responded_at"),
  expiresAt: timestamp("expires_at"), // Expiration de l'invitation (30 jours)
  
  // Audit
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Table pour les paiements de cours privés
export const teacherIndependentPayments = pgTable("teacher_independent_payments", {
  id: serial("id").primaryKey(),
  teacherId: integer("teacher_id").notNull(),
  studentId: integer("student_id").notNull(),
  parentId: integer("parent_id"), // Qui a payé (si différent de student)
  sessionId: integer("session_id"), // Référence à la session payée
  
  // Montant
  amount: integer("amount").notNull(), // Montant en CFA
  currency: text("currency").default("XAF"),
  
  // Paiement
  paymentMethod: text("payment_method").notNull(), // "stripe", "mtn", "cash"
  paymentIntentId: text("payment_intent_id"), // Stripe/MTN reference
  paymentStatus: text("payment_status").notNull().default("pending"), // "pending", "completed", "failed", "refunded"
  
  // Période couverte
  periodStart: timestamp("period_start"),
  periodEnd: timestamp("period_end"),
  
  // Métadonnées
  notes: text("notes"),
  receiptUrl: text("receipt_url"),
  
  // Audit
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Zod schemas pour validation
export const insertTeacherIndependentActivationSchema = createInsertSchema(teacherIndependentActivations);
export const insertTeacherIndependentStudentSchema = createInsertSchema(teacherIndependentStudents);
export const insertTeacherIndependentSessionSchema = createInsertSchema(teacherIndependentSessions);
export const insertTeacherStudentInvitationSchema = createInsertSchema(teacherStudentInvitations);
export const insertTeacherIndependentPaymentSchema = createInsertSchema(teacherIndependentPayments);

// Types TypeScript
export type TeacherIndependentActivation = typeof teacherIndependentActivations.$inferSelect;
export type InsertTeacherIndependentActivation = z.infer<typeof insertTeacherIndependentActivationSchema>;

export type TeacherIndependentStudent = typeof teacherIndependentStudents.$inferSelect;
export type InsertTeacherIndependentStudent = z.infer<typeof insertTeacherIndependentStudentSchema>;

export type TeacherIndependentSession = typeof teacherIndependentSessions.$inferSelect;
export type InsertTeacherIndependentSession = z.infer<typeof insertTeacherIndependentSessionSchema>;

export type TeacherStudentInvitation = typeof teacherStudentInvitations.$inferSelect;
export type InsertTeacherStudentInvitation = z.infer<typeof insertTeacherStudentInvitationSchema>;

export type TeacherIndependentPayment = typeof teacherIndependentPayments.$inferSelect;
export type InsertTeacherIndependentPayment = z.infer<typeof insertTeacherIndependentPaymentSchema>;
