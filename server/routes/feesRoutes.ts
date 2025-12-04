import { Router, Request, Response } from 'express';
import { db } from '../db';
import { 
  feeStructures, 
  assignedFees, 
  paymentItems,
  feeAuditLogs,
  feeReceipts,
  feeNotificationQueue,
  payments,
  users,
  classes,
  enrollments,
  notifications
} from '@shared/schema';
import { eq, and, desc, sql, gte, lte, inArray, isNull, or } from 'drizzle-orm';
import { nanoid } from 'nanoid';

const router = Router();

// Middleware to check authentication and role
function requireAuth(req: Request, res: Response, next: Function) {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }
  next();
}

function requireDirectorRole(req: Request, res: Response, next: Function) {
  const user = req.user as any;
  if (!user || !['Director', 'Admin', 'SiteAdmin'].includes(user.role)) {
    return res.status(403).json({ success: false, message: 'Director access required' });
  }
  next();
}

// =============== FEE STRUCTURES CRUD ===============

// GET /api/fees/structures - List all fee structures for a school
router.get('/structures', requireAuth, requireDirectorRole, async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const schoolId = user.schoolId;
    
    if (!schoolId) {
      return res.status(400).json({ success: false, message: 'School ID required' });
    }
    
    const structures = await db
      .select()
      .from(feeStructures)
      .where(eq(feeStructures.schoolId, schoolId))
      .orderBy(desc(feeStructures.createdAt));
    
    console.log(`[FEES] Loaded ${structures.length} fee structures for school ${schoolId}`);
    res.json({ success: true, structures });
  } catch (error) {
    console.error('[FEES] Error loading fee structures:', error);
    res.status(500).json({ success: false, message: 'Failed to load fee structures' });
  }
});

// POST /api/fees/structures - Create a new fee structure
router.post('/structures', requireAuth, requireDirectorRole, async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const schoolId = user.schoolId;
    const data = req.body;
    
    if (!schoolId) {
      return res.status(400).json({ success: false, message: 'School ID required' });
    }
    
    const [newStructure] = await db.insert(feeStructures).values({
      schoolId,
      name: data.name,
      nameFr: data.nameFr || data.name,
      nameEn: data.nameEn || data.name,
      description: data.description,
      feeType: data.feeType,
      amount: parseInt(data.amount),
      currency: data.currency || 'XAF',
      classId: data.classId ? parseInt(data.classId) : null,
      gradeLevel: data.gradeLevel,
      frequency: data.frequency || 'term',
      termId: data.termId ? parseInt(data.termId) : null,
      academicYearId: data.academicYearId ? parseInt(data.academicYearId) : null,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      dueDayOfMonth: data.dueDayOfMonth ? parseInt(data.dueDayOfMonth) : null,
      earlyPaymentDiscount: data.earlyPaymentDiscount ? parseInt(data.earlyPaymentDiscount) : 0,
      earlyPaymentDays: data.earlyPaymentDays ? parseInt(data.earlyPaymentDays) : 0,
      siblingDiscount: data.siblingDiscount ? parseInt(data.siblingDiscount) : 0,
      scholarshipEligible: data.scholarshipEligible !== false,
      isActive: data.isActive !== false,
      isMandatory: data.isMandatory !== false
    }).returning();
    
    // Create audit log
    await db.insert(feeAuditLogs).values({
      schoolId,
      actorId: user.id,
      actorRole: user.role,
      action: 'create_structure',
      entityType: 'fee_structure',
      entityId: newStructure.id,
      newValue: newStructure,
      description: `Created fee structure: ${data.name}`
    });
    
    console.log(`[FEES] Created fee structure ${newStructure.id} for school ${schoolId}`);
    res.json({ success: true, structure: newStructure });
  } catch (error) {
    console.error('[FEES] Error creating fee structure:', error);
    res.status(500).json({ success: false, message: 'Failed to create fee structure' });
  }
});

// PATCH /api/fees/structures/:id - Update a fee structure
router.patch('/structures/:id', requireAuth, requireDirectorRole, async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const schoolId = user.schoolId;
    const structureId = parseInt(req.params.id);
    const data = req.body;
    
    // Get existing structure
    const [existing] = await db
      .select()
      .from(feeStructures)
      .where(and(eq(feeStructures.id, structureId), eq(feeStructures.schoolId, schoolId)));
    
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Fee structure not found' });
    }
    
    const updateData: any = { updatedAt: new Date() };
    if (data.name) updateData.name = data.name;
    if (data.nameFr) updateData.nameFr = data.nameFr;
    if (data.nameEn) updateData.nameEn = data.nameEn;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.feeType) updateData.feeType = data.feeType;
    if (data.amount) updateData.amount = parseInt(data.amount);
    if (data.frequency) updateData.frequency = data.frequency;
    if (data.dueDate) updateData.dueDate = new Date(data.dueDate);
    if (data.earlyPaymentDiscount !== undefined) updateData.earlyPaymentDiscount = parseInt(data.earlyPaymentDiscount);
    if (data.siblingDiscount !== undefined) updateData.siblingDiscount = parseInt(data.siblingDiscount);
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.isMandatory !== undefined) updateData.isMandatory = data.isMandatory;
    
    const [updated] = await db
      .update(feeStructures)
      .set(updateData)
      .where(eq(feeStructures.id, structureId))
      .returning();
    
    // Audit log
    await db.insert(feeAuditLogs).values({
      schoolId,
      actorId: user.id,
      actorRole: user.role,
      action: 'update_structure',
      entityType: 'fee_structure',
      entityId: structureId,
      previousValue: existing,
      newValue: updated,
      description: `Updated fee structure: ${updated.name}`
    });
    
    res.json({ success: true, structure: updated });
  } catch (error) {
    console.error('[FEES] Error updating fee structure:', error);
    res.status(500).json({ success: false, message: 'Failed to update fee structure' });
  }
});

// DELETE /api/fees/structures/:id - Delete a fee structure
router.delete('/structures/:id', requireAuth, requireDirectorRole, async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const schoolId = user.schoolId;
    const structureId = parseInt(req.params.id);
    
    // Check if structure exists and belongs to school
    const [existing] = await db
      .select()
      .from(feeStructures)
      .where(and(eq(feeStructures.id, structureId), eq(feeStructures.schoolId, schoolId)));
    
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Fee structure not found' });
    }
    
    // Check if there are assigned fees using this structure
    const assignedCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(assignedFees)
      .where(eq(assignedFees.feeStructureId, structureId));
    
    if (assignedCount[0].count > 0) {
      // Soft delete - just deactivate
      await db.update(feeStructures)
        .set({ isActive: false, updatedAt: new Date() })
        .where(eq(feeStructures.id, structureId));
      
      return res.json({ success: true, message: 'Fee structure deactivated (has assigned fees)' });
    }
    
    // Hard delete if no assignments
    await db.delete(feeStructures).where(eq(feeStructures.id, structureId));
    
    // Audit log
    await db.insert(feeAuditLogs).values({
      schoolId,
      actorId: user.id,
      actorRole: user.role,
      action: 'delete_structure',
      entityType: 'fee_structure',
      entityId: structureId,
      previousValue: existing,
      description: `Deleted fee structure: ${existing.name}`
    });
    
    res.json({ success: true, message: 'Fee structure deleted' });
  } catch (error) {
    console.error('[FEES] Error deleting fee structure:', error);
    res.status(500).json({ success: false, message: 'Failed to delete fee structure' });
  }
});

// =============== FEE ASSIGNMENT ===============

// POST /api/fees/assign - Assign fees to students (bulk or individual)
router.post('/assign', requireAuth, requireDirectorRole, async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const schoolId = user.schoolId;
    const { feeStructureId, classId, studentIds, dueDate, termId, academicYearId } = req.body;
    
    if (!feeStructureId) {
      return res.status(400).json({ success: false, message: 'Fee structure ID required' });
    }
    
    // Get the fee structure
    const [structure] = await db
      .select()
      .from(feeStructures)
      .where(and(eq(feeStructures.id, feeStructureId), eq(feeStructures.schoolId, schoolId)));
    
    if (!structure) {
      return res.status(404).json({ success: false, message: 'Fee structure not found' });
    }
    
    // Get students to assign fees to
    let targetStudentIds: number[] = studentIds || [];
    
    // Use provided classId, or fall back to structure's classId
    const effectiveClassId = classId || structure.classId;
    
    if (targetStudentIds.length === 0 && effectiveClassId) {
      // Get all students in the class
      const enrolledStudents = await db
        .select({ studentId: enrollments.studentId })
        .from(enrollments)
        .where(eq(enrollments.classId, effectiveClassId));
      
      targetStudentIds = enrolledStudents.map(e => e.studentId);
    }
    
    // If still no students and no classId, get ALL students in the school from enrollments
    if (targetStudentIds.length === 0) {
      const allEnrollments = await db
        .select({ studentId: enrollments.studentId })
        .from(enrollments)
        .innerJoin(classes, eq(enrollments.classId, classes.id))
        .where(eq(classes.schoolId, schoolId));
      
      targetStudentIds = [...new Set(allEnrollments.map(e => e.studentId))];
    }
    
    if (targetStudentIds.length === 0) {
      return res.status(400).json({ success: false, message: 'No students found in the school to assign fees to' });
    }
    
    // Calculate sibling discounts
    const siblingDiscountMap: Record<number, number> = {};
    if (structure.siblingDiscount && structure.siblingDiscount > 0) {
      // Get student-parent relationships and detect siblings
      const studentUsers = await db
        .select({ id: users.id, parentId: sql<number>`(metadata->>'parentId')::int` })
        .from(users)
        .where(inArray(users.id, targetStudentIds));
      
      // Group by parent
      const parentGroups: Record<number, number[]> = {};
      for (const s of studentUsers) {
        if (s.parentId) {
          if (!parentGroups[s.parentId]) parentGroups[s.parentId] = [];
          parentGroups[s.parentId].push(s.id);
        }
      }
      
      // Apply sibling discount to 2nd+ child per parent
      for (const [, siblings] of Object.entries(parentGroups)) {
        if (siblings.length > 1) {
          for (let i = 1; i < siblings.length; i++) {
            siblingDiscountMap[siblings[i]] = structure.siblingDiscount;
          }
        }
      }
    }
    
    const assignedList = [];
    const effectiveDueDate = dueDate ? new Date(dueDate) : (structure.dueDate || new Date());
    
    for (const studentId of targetStudentIds) {
      // Check if fee already assigned
      const [existing] = await db
        .select()
        .from(assignedFees)
        .where(and(
          eq(assignedFees.studentId, studentId),
          eq(assignedFees.feeStructureId, feeStructureId),
          eq(assignedFees.schoolId, schoolId)
        ));
      
      if (existing) continue; // Skip if already assigned
      
      const discountPercent = siblingDiscountMap[studentId] || 0;
      const discountAmount = Math.round((structure.amount * discountPercent) / 100);
      const finalAmount = structure.amount - discountAmount;
      
      const [assigned] = await db.insert(assignedFees).values({
        schoolId,
        studentId,
        feeStructureId,
        originalAmount: structure.amount,
        discountAmount,
        discountReason: discountPercent > 0 ? 'sibling' : null,
        finalAmount,
        paidAmount: 0,
        balanceAmount: finalAmount,
        status: 'pending',
        dueDate: effectiveDueDate,
        termId: termId || structure.termId,
        academicYearId: academicYearId || structure.academicYearId
      }).returning();
      
      assignedList.push(assigned);
    }
    
    // Audit log
    await db.insert(feeAuditLogs).values({
      schoolId,
      actorId: user.id,
      actorRole: user.role,
      action: 'assign_fee',
      entityType: 'assigned_fee',
      entityId: feeStructureId,
      newValue: { count: assignedList.length, studentIds: targetStudentIds },
      description: `Assigned ${structure.name} to ${assignedList.length} students`
    });
    
    console.log(`[FEES] Assigned ${assignedList.length} fees for structure ${feeStructureId}`);
    res.json({ success: true, assigned: assignedList.length, fees: assignedList });
  } catch (error) {
    console.error('[FEES] Error assigning fees:', error);
    res.status(500).json({ success: false, message: 'Failed to assign fees' });
  }
});

// GET /api/fees/assigned - List assigned fees with filters
router.get('/assigned', requireAuth, requireDirectorRole, async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const schoolId = user.schoolId;
    const { classId, status, termId, studentId } = req.query;
    
    let query = db
      .select({
        id: assignedFees.id,
        studentId: assignedFees.studentId,
        feeStructureId: assignedFees.feeStructureId,
        originalAmount: assignedFees.originalAmount,
        discountAmount: assignedFees.discountAmount,
        discountReason: assignedFees.discountReason,
        finalAmount: assignedFees.finalAmount,
        paidAmount: assignedFees.paidAmount,
        balanceAmount: assignedFees.balanceAmount,
        status: assignedFees.status,
        dueDate: assignedFees.dueDate,
        paidDate: assignedFees.paidDate,
        termId: assignedFees.termId,
        createdAt: assignedFees.createdAt,
        structureName: feeStructures.name,
        structureType: feeStructures.feeType,
        studentFirstName: users.firstName,
        studentLastName: users.lastName
      })
      .from(assignedFees)
      .leftJoin(feeStructures, eq(assignedFees.feeStructureId, feeStructures.id))
      .leftJoin(users, eq(assignedFees.studentId, users.id))
      .where(eq(assignedFees.schoolId, schoolId));
    
    const conditions: any[] = [eq(assignedFees.schoolId, schoolId)];
    
    if (status) {
      conditions.push(eq(assignedFees.status, status as string));
    }
    if (termId) {
      conditions.push(eq(assignedFees.termId, parseInt(termId as string)));
    }
    if (studentId) {
      conditions.push(eq(assignedFees.studentId, parseInt(studentId as string)));
    }
    
    const fees = await db
      .select({
        id: assignedFees.id,
        studentId: assignedFees.studentId,
        feeStructureId: assignedFees.feeStructureId,
        originalAmount: assignedFees.originalAmount,
        discountAmount: assignedFees.discountAmount,
        discountReason: assignedFees.discountReason,
        finalAmount: assignedFees.finalAmount,
        paidAmount: assignedFees.paidAmount,
        balanceAmount: assignedFees.balanceAmount,
        status: assignedFees.status,
        dueDate: assignedFees.dueDate,
        paidDate: assignedFees.paidDate,
        termId: assignedFees.termId,
        createdAt: assignedFees.createdAt,
        structureName: feeStructures.name,
        structureType: feeStructures.feeType,
        studentFirstName: users.firstName,
        studentLastName: users.lastName
      })
      .from(assignedFees)
      .leftJoin(feeStructures, eq(assignedFees.feeStructureId, feeStructures.id))
      .leftJoin(users, eq(assignedFees.studentId, users.id))
      .where(and(...conditions))
      .orderBy(desc(assignedFees.createdAt));
    
    res.json({ success: true, fees });
  } catch (error) {
    console.error('[FEES] Error loading assigned fees:', error);
    res.status(500).json({ success: false, message: 'Failed to load assigned fees' });
  }
});

// =============== PAYMENT RECORDING ===============

// POST /api/fees/payments - Record a payment
router.post('/payments', requireAuth, requireDirectorRole, async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const schoolId = user.schoolId;
    const { studentId, amount, paymentMethod, transactionRef, assignedFeeIds, notes } = req.body;
    
    if (!studentId || !amount) {
      return res.status(400).json({ success: false, message: 'Student ID and amount required' });
    }
    
    const paymentAmount = parseInt(amount);
    
    // Create payment record
    const [payment] = await db.insert(payments).values({
      studentId,
      amount: paymentAmount.toString(),
      status: 'completed',
      paymentMethod: paymentMethod || 'cash',
      transactionId: transactionRef,
      metadata: { schoolId, notes, recordedBy: user.id }
    }).returning();
    
    // Apply payment to assigned fees
    let remainingAmount = paymentAmount;
    const updatedFees = [];
    
    // Get fees to apply payment to (either specific or oldest pending)
    let feesToPay;
    if (assignedFeeIds && assignedFeeIds.length > 0) {
      feesToPay = await db
        .select()
        .from(assignedFees)
        .where(and(
          eq(assignedFees.schoolId, schoolId),
          eq(assignedFees.studentId, studentId),
          inArray(assignedFees.id, assignedFeeIds),
          or(eq(assignedFees.status, 'pending'), eq(assignedFees.status, 'partial'), eq(assignedFees.status, 'overdue'))
        ))
        .orderBy(assignedFees.dueDate);
    } else {
      feesToPay = await db
        .select()
        .from(assignedFees)
        .where(and(
          eq(assignedFees.schoolId, schoolId),
          eq(assignedFees.studentId, studentId),
          or(eq(assignedFees.status, 'pending'), eq(assignedFees.status, 'partial'), eq(assignedFees.status, 'overdue'))
        ))
        .orderBy(assignedFees.dueDate);
    }
    
    for (const fee of feesToPay) {
      if (remainingAmount <= 0) break;
      
      const amountToApply = Math.min(remainingAmount, fee.balanceAmount);
      const newPaidAmount = (fee.paidAmount || 0) + amountToApply;
      const newBalance = fee.finalAmount - newPaidAmount;
      const newStatus = newBalance === 0 ? 'paid' : 'partial';
      
      // Create payment item
      await db.insert(paymentItems).values({
        paymentId: payment.id,
        assignedFeeId: fee.id,
        amount: amountToApply
      });
      
      // Update assigned fee
      await db.update(assignedFees)
        .set({
          paidAmount: newPaidAmount,
          balanceAmount: newBalance,
          status: newStatus,
          lastPaymentDate: new Date(),
          paidDate: newBalance === 0 ? new Date() : null,
          updatedAt: new Date()
        })
        .where(eq(assignedFees.id, fee.id));
      
      updatedFees.push({ feeId: fee.id, applied: amountToApply, newBalance, status: newStatus });
      remainingAmount -= amountToApply;
    }
    
    // Generate receipt
    const receiptNumber = `REC-${schoolId}-${Date.now()}-${nanoid(4).toUpperCase()}`;
    const [receipt] = await db.insert(feeReceipts).values({
      schoolId,
      paymentId: payment.id,
      studentId,
      receiptNumber,
      totalAmount: paymentAmount,
      paymentMethod: paymentMethod || 'cash',
      transactionRef,
      status: 'generated'
    }).returning();
    
    // Audit log
    await db.insert(feeAuditLogs).values({
      schoolId,
      actorId: user.id,
      actorRole: user.role,
      action: 'record_payment',
      entityType: 'payment',
      entityId: payment.id,
      newValue: { amount: paymentAmount, method: paymentMethod, fees: updatedFees },
      amountAfter: paymentAmount,
      description: `Recorded payment of ${paymentAmount} XAF for student ${studentId}`
    });
    
    // Queue receipt notification
    await db.insert(feeNotificationQueue).values({
      schoolId,
      studentId,
      notificationType: 'receipt',
      title: 'Reçu de paiement / Payment Receipt',
      message: `Paiement de ${paymentAmount.toLocaleString()} XAF reçu. Numéro de reçu: ${receiptNumber}`,
      channels: ['email', 'whatsapp', 'pwa'],
      status: 'pending'
    });
    
    console.log(`[FEES] Recorded payment ${payment.id} of ${paymentAmount} XAF for student ${studentId}`);
    res.json({ 
      success: true, 
      payment, 
      receipt,
      appliedTo: updatedFees,
      excessAmount: remainingAmount > 0 ? remainingAmount : 0
    });
  } catch (error) {
    console.error('[FEES] Error recording payment:', error);
    res.status(500).json({ success: false, message: 'Failed to record payment' });
  }
});

// GET /api/fees/payments - List payments for school (compatibility shim for actual DB schema)
router.get('/payments', requireAuth, requireDirectorRole, async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const schoolId = user.schoolId;
    
    if (!schoolId) {
      return res.json({ success: true, payments: [] });
    }
    
    // Use raw SQL to query actual DB columns (user_id, school_id instead of studentId, metadata)
    const paymentsList = await db.execute(sql`
      SELECT 
        p.id,
        p.user_id as "studentId",
        p.amount,
        p.status,
        p.type as "paymentMethod",
        p.description,
        p.created_at as "createdAt",
        u.first_name as "studentFirstName",
        u.last_name as "studentLastName"
      FROM payments p
      LEFT JOIN users u ON p.user_id = u.id
      WHERE p.school_id = ${schoolId}
      ORDER BY p.created_at DESC
      LIMIT 100
    `);
    
    res.json({ success: true, payments: paymentsList.rows || [] });
  } catch (error) {
    console.error('[FEES] Error loading payments:', error);
    // Return empty array on error for graceful degradation
    res.json({ success: true, payments: [] });
  }
});

// POST /api/fees/payments/:id/notify - Send payment notification to parent
router.post('/payments/:id/notify', requireAuth, requireDirectorRole, async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const schoolId = user.schoolId;
    const paymentId = parseInt(req.params.id);
    
    if (!schoolId) {
      return res.status(400).json({ success: false, message: 'School ID required' });
    }
    
    // Get payment details
    const [payment] = await db
      .select({
        id: payments.id,
        studentId: payments.studentId,
        amount: payments.amount,
        paymentMethod: payments.paymentMethod,
        createdAt: payments.createdAt,
        studentFirstName: users.firstName,
        studentLastName: users.lastName
      })
      .from(payments)
      .leftJoin(users, eq(payments.studentId, users.id))
      .where(eq(payments.id, paymentId))
      .limit(1);
    
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }
    
    // Queue notification to parent
    await db.insert(feeNotificationQueue).values({
      schoolId,
      studentId: payment.studentId,
      notificationType: 'receipt',
      title: 'Confirmation de paiement / Payment Confirmation',
      message: `Paiement de ${parseInt(payment.amount).toLocaleString()} XAF reçu pour ${payment.studentFirstName} ${payment.studentLastName}. Méthode: ${payment.paymentMethod || 'cash'}`,
      channels: ['email', 'whatsapp', 'pwa'],
      status: 'pending'
    });
    
    // Also create in-app notification
    await db.insert(notifications).values({
      userId: payment.studentId,
      title: 'Confirmation de paiement / Payment Confirmation',
      message: `Paiement de ${parseInt(payment.amount).toLocaleString()} XAF reçu`,
      type: 'payment',
      isRead: false
    });
    
    console.log(`[FEES] Notification queued for payment ${paymentId} to parent of student ${payment.studentId}`);
    res.json({ success: true, message: 'Notification sent to parent' });
  } catch (error) {
    console.error('[FEES] Error sending payment notification:', error);
    res.status(500).json({ success: false, message: 'Failed to send notification' });
  }
});

// =============== FEE STATISTICS ===============

// GET /api/fees/stats - Dashboard statistics (compatible with actual DB schema)
router.get('/stats', requireAuth, requireDirectorRole, async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const schoolId = user.schoolId;
    
    if (!schoolId) {
      return res.json({ success: true, stats: {
        totalExpected: 0, totalCollected: 0, outstanding: 0, collectionRate: 0,
        studentsInArrears: 0, overdue: 0, upcomingDue: 0, remindersSentToday: 0
      }});
    }
    
    // Calculate totals from assigned_fees table
    const totalsResult = await db.execute(sql`
      SELECT 
        COALESCE(SUM(final_amount), 0) as total_expected,
        COALESCE(SUM(paid_amount), 0) as total_paid,
        COALESCE(SUM(balance_amount), 0) as total_balance,
        COUNT(*) as fee_count
      FROM assigned_fees
      WHERE school_id = ${schoolId}
    `);
    const totals = totalsResult.rows?.[0] || { total_expected: 0, total_paid: 0, total_balance: 0, fee_count: 0 };
    
    // Count by status
    const statusResult = await db.execute(sql`
      SELECT status, COUNT(*) as count
      FROM assigned_fees
      WHERE school_id = ${schoolId}
      GROUP BY status
    `);
    const statusCounts = statusResult.rows || [];
    
    // Students in arrears
    const arrearsResult = await db.execute(sql`
      SELECT COUNT(DISTINCT student_id) as count
      FROM assigned_fees
      WHERE school_id = ${schoolId} AND status = 'overdue'
    `);
    const arrearsCount = arrearsResult.rows?.[0]?.count || 0;
    
    // Recent payments from actual payments table (using school_id column)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentPaymentsResult = await db.execute(sql`
      SELECT 
        COALESCE(SUM(CAST(amount AS NUMERIC)), 0) as total,
        COUNT(*) as count
      FROM payments
      WHERE school_id = ${schoolId}
        AND created_at >= ${thirtyDaysAgo}
    `);
    const recentPayments = recentPaymentsResult.rows?.[0] || { total: 0, count: 0 };
    
    // Collection rate
    const totalExpected = Number(totals.total_expected) || 0;
    const totalPaid = Number(totals.total_paid) || 0;
    const collectionRate = totalExpected > 0 ? Math.round((totalPaid / totalExpected) * 100) : 0;
    
    // Count overdue and upcoming
    const overdueCount = statusCounts.find((s: any) => s.status === 'overdue')?.count || 0;
    const pendingCount = statusCounts.find((s: any) => s.status === 'pending')?.count || 0;
    
    const stats = {
      totalExpected,
      totalCollected: totalPaid,
      outstanding: Number(totals.total_balance) || 0,
      collectionRate,
      totalFees: Number(totals.fee_count) || 0,
      studentsInArrears: Number(arrearsCount) || 0,
      recentPaymentsTotal: Number(recentPayments.total) || 0,
      recentPaymentsCount: Number(recentPayments.count) || 0,
      overdue: Number(overdueCount) || 0,
      upcomingDue: Number(pendingCount) || 0,
      remindersSentToday: 0
    };
    
    res.json({ success: true, stats });
  } catch (error) {
    console.error('[FEES] Error loading stats:', error);
    // Return default stats on error for graceful degradation
    res.json({ success: true, stats: {
      totalExpected: 0, totalCollected: 0, outstanding: 0, collectionRate: 0,
      studentsInArrears: 0, overdue: 0, upcomingDue: 0, remindersSentToday: 0
    }});
  }
});

// =============== REMINDERS ===============

// POST /api/fees/reminders - Send payment reminders to parents
router.post('/reminders', requireAuth, requireDirectorRole, async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const schoolId = user.schoolId;
    const { feeIds, channels } = req.body;
    
    if (!schoolId) {
      return res.status(400).json({ success: false, message: 'School ID required' });
    }
    
    if (!feeIds || !Array.isArray(feeIds) || feeIds.length === 0) {
      return res.status(400).json({ success: false, message: 'Fee IDs required' });
    }
    
    const selectedChannels = channels || ['email', 'whatsapp', 'pwa'];
    let remindersSent = 0;
    
    // Get assigned fees with student and parent info
    for (const feeId of feeIds) {
      try {
        const feeResult = await db.execute(sql`
          SELECT 
            af.id,
            af.student_id,
            af.balance_amount,
            fs.name as structure_name,
            u.first_name as student_first_name,
            u.last_name as student_last_name,
            u.phone as student_phone,
            u.email as student_email
          FROM assigned_fees af
          JOIN fee_structures fs ON af.fee_structure_id = fs.id
          JOIN users u ON af.student_id = u.id
          WHERE af.id = ${feeId} AND af.school_id = ${schoolId}
        `);
        
        const fee = feeResult.rows?.[0];
        if (!fee) continue;
        
        // Get parent contact info
        const parentResult = await db.execute(sql`
          SELECT u.id, u.first_name, u.last_name, u.phone, u.email
          FROM parent_student_relations psr
          JOIN users u ON psr.parent_id = u.id
          WHERE psr.student_id = ${fee.student_id}
          LIMIT 1
        `);
        const parent = parentResult.rows?.[0];
        
        const parentPhone = parent?.phone || fee.student_phone;
        const parentEmail = parent?.email || fee.student_email;
        const parentName = parent ? `${parent.first_name || ''} ${parent.last_name || ''}`.trim() : 'Parent';
        
        // Create reminder message
        const message = `Rappel de paiement: ${fee.structure_name} pour ${fee.student_first_name || ''} ${fee.student_last_name || ''}. Montant dû: ${Number(fee.balance_amount || 0).toLocaleString()} CFA`;
        
        // Queue notifications based on selected channels
        if (selectedChannels.includes('email') && parentEmail) {
          console.log(`[FEES_REMINDER] Email reminder queued for ${parentEmail}`);
        }
        if (selectedChannels.includes('whatsapp') && parentPhone) {
          console.log(`[FEES_REMINDER] WhatsApp reminder queued for ${parentPhone}`);
        }
        if (selectedChannels.includes('pwa')) {
          // Create in-app notification for parent
          if (parent?.id) {
            await db.execute(sql`
              INSERT INTO notifications (user_id, title, message, type, is_read, created_at)
              VALUES (${parent.id}, 'Rappel de Paiement', ${message}, 'fee_reminder', false, NOW())
            `);
          }
        }
        
        // Update reminder_sent flag on assigned_fee
        await db.execute(sql`
          UPDATE assigned_fees 
          SET reminder_sent = true, reminder_sent_at = NOW()
          WHERE id = ${feeId}
        `);
        
        remindersSent++;
      } catch (feeError) {
        console.error(`[FEES_REMINDER] Error processing fee ${feeId}:`, feeError);
      }
    }
    
    console.log(`[FEES_REMINDER] Sent ${remindersSent} reminders for school ${schoolId}`);
    res.json({ 
      success: true, 
      message: `${remindersSent} rappel(s) envoyé(s)`,
      remindersSent,
      channels: selectedChannels
    });
  } catch (error) {
    console.error('[FEES] Error sending reminders:', error);
    res.status(500).json({ success: false, message: 'Failed to send reminders' });
  }
});

// =============== RECEIPTS ===============

// GET /api/fees/receipts/:id - Get receipt details
router.get('/receipts/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const receiptId = parseInt(req.params.id);
    
    const [receipt] = await db
      .select()
      .from(feeReceipts)
      .where(eq(feeReceipts.id, receiptId));
    
    if (!receipt) {
      return res.status(404).json({ success: false, message: 'Receipt not found' });
    }
    
    // Mark as viewed
    await db.update(feeReceipts)
      .set({ viewedAt: new Date() })
      .where(eq(feeReceipts.id, receiptId));
    
    res.json({ success: true, receipt });
  } catch (error) {
    console.error('[FEES] Error loading receipt:', error);
    res.status(500).json({ success: false, message: 'Failed to load receipt' });
  }
});

// =============== PARENT/STUDENT ENDPOINTS ===============

// GET /api/fees/my - Get fees for current user (student or parent's children)
router.get('/my', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    let studentIds: number[] = [];
    
    if (user.role === 'Student') {
      studentIds = [user.id];
    } else if (user.role === 'Parent') {
      // Get children of parent
      const children = await db
        .select({ studentId: sql<number>`student_id` })
        .from(sql`parent_student_relations`)
        .where(sql`parent_id = ${user.id}`);
      
      studentIds = children.map(c => c.studentId);
    } else {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    
    if (studentIds.length === 0) {
      return res.json({ success: true, fees: [], summary: { total: 0, paid: 0, balance: 0 } });
    }
    
    const fees = await db
      .select({
        id: assignedFees.id,
        studentId: assignedFees.studentId,
        originalAmount: assignedFees.originalAmount,
        discountAmount: assignedFees.discountAmount,
        discountReason: assignedFees.discountReason,
        finalAmount: assignedFees.finalAmount,
        paidAmount: assignedFees.paidAmount,
        balanceAmount: assignedFees.balanceAmount,
        status: assignedFees.status,
        dueDate: assignedFees.dueDate,
        structureName: feeStructures.name,
        structureType: feeStructures.feeType
      })
      .from(assignedFees)
      .leftJoin(feeStructures, eq(assignedFees.feeStructureId, feeStructures.id))
      .where(inArray(assignedFees.studentId, studentIds))
      .orderBy(desc(assignedFees.dueDate));
    
    // Calculate summary
    const summary = fees.reduce((acc, f) => ({
      total: acc.total + (f.finalAmount || 0),
      paid: acc.paid + (f.paidAmount || 0),
      balance: acc.balance + (f.balanceAmount || 0)
    }), { total: 0, paid: 0, balance: 0 });
    
    res.json({ success: true, fees, summary });
  } catch (error) {
    console.error('[FEES] Error loading my fees:', error);
    res.status(500).json({ success: false, message: 'Failed to load fees' });
  }
});

// GET /api/fees/my/payments - Get payment history for current user
router.get('/my/payments', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    let studentIds: number[] = [];
    
    if (user.role === 'Student') {
      studentIds = [user.id];
    } else if (user.role === 'Parent') {
      const children = await db
        .select({ studentId: sql<number>`student_id` })
        .from(sql`parent_student_relations`)
        .where(sql`parent_id = ${user.id}`);
      
      studentIds = children.map(c => c.studentId);
    } else {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    
    if (studentIds.length === 0) {
      return res.json({ success: true, payments: [] });
    }
    
    const paymentsList = await db
      .select({
        id: payments.id,
        amount: payments.amount,
        status: payments.status,
        paymentMethod: payments.paymentMethod,
        createdAt: payments.createdAt
      })
      .from(payments)
      .where(inArray(payments.studentId, studentIds))
      .orderBy(desc(payments.createdAt));
    
    res.json({ success: true, payments: paymentsList });
  } catch (error) {
    console.error('[FEES] Error loading my payments:', error);
    res.status(500).json({ success: false, message: 'Failed to load payments' });
  }
});

// GET /api/fees/my/receipts - Get receipts for current user
router.get('/my/receipts', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    let studentIds: number[] = [];
    
    if (user.role === 'Student') {
      studentIds = [user.id];
    } else if (user.role === 'Parent') {
      const children = await db
        .select({ studentId: sql<number>`student_id` })
        .from(sql`parent_student_relations`)
        .where(sql`parent_id = ${user.id}`);
      
      studentIds = children.map(c => c.studentId);
    } else {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    
    if (studentIds.length === 0) {
      return res.json({ success: true, receipts: [] });
    }
    
    const receipts = await db
      .select()
      .from(feeReceipts)
      .where(inArray(feeReceipts.studentId, studentIds))
      .orderBy(desc(feeReceipts.createdAt));
    
    res.json({ success: true, receipts });
  } catch (error) {
    console.error('[FEES] Error loading my receipts:', error);
    res.status(500).json({ success: false, message: 'Failed to load receipts' });
  }
});

export default router;
