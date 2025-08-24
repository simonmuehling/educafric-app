/**
 * UNIFIED CONNECTIONS ROUTES
 * Handles connection management separately from messages
 */

import { Router } from 'express';
import { unifiedMessagingController } from '../controllers/unified-messaging';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Get all connections for a user
// GET /api/connections/:connectionType
router.get('/:connectionType', requireAuth, unifiedMessagingController.getConnections.bind(unifiedMessagingController));

export default router;