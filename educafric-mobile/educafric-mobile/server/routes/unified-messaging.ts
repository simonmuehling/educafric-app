/**
 * UNIFIED MESSAGING ROUTES
 * Replaces all duplicated messaging routes with one clean system
 */

import { Router } from 'express';
import { unifiedMessagingController } from '../controllers/unified-messaging';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Get messages for any connection type
// GET /api/messages/:connectionType/:connectionId
router.get('/:connectionType/:connectionId', requireAuth, unifiedMessagingController.getMessages.bind(unifiedMessagingController));

// Send message for any connection type  
// POST /api/messages/:connectionType
router.post('/:connectionType', requireAuth, unifiedMessagingController.sendMessage.bind(unifiedMessagingController));

// Mark message as read
// PUT /api/messages/:connectionType/:messageId/read  
router.put('/:connectionType/:messageId/read', requireAuth, unifiedMessagingController.markMessageRead.bind(unifiedMessagingController));


export default router;