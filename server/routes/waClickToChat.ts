/**
 * WhatsApp Click-to-Chat Routes
 * Handles token generation and redirect to wa.me links
 */

import express from 'express';
import rateLimit from 'express-rate-limit';
import { requireAuth } from '../middleware/auth';
import { verifyToken } from '../utils/waLink';
import { WaMintRequestSchema } from '../../shared/schemas/waValidation';
import { 
  getRecipientById,
  createWaToken, 
  logWaClick,
  computeWaRedirect,
  WA_TOKEN_SECRET 
} from '../services/waClickToChat';
import { WA_TEMPLATES } from '../templates/waTemplates';

const router = express.Router();

// Rate limiter for token generation (60 requests per minute per IP)
const mintLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60,
  message: 'Too many WhatsApp token requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * GET /wa/:token
 * Redirect endpoint - validates token and redirects to WhatsApp
 */
router.get('/wa/:token', async (req, res) => {
  try {
    const data = verifyToken(req.params.token, WA_TOKEN_SECRET);
    
    if (!data) {
      return res.status(400).send(`
        <!DOCTYPE html>
        <html>
          <head><title>Lien invalide</title></head>
          <body style="font-family: sans-serif; text-align: center; padding: 50px;">
            <h2>❌ Lien WhatsApp invalide ou expiré</h2>
            <p>Ce lien n'est plus valide. Veuillez demander un nouveau lien.</p>
          </body>
        </html>
      `);
    }

    // Check expiration
    if (data.exp && Date.now() > data.exp) {
      return res.status(400).send(`
        <!DOCTYPE html>
        <html>
          <head><title>Lien expiré</title></head>
          <body style="font-family: sans-serif; text-align: center; padding: 50px;">
            <h2>⏰ Lien WhatsApp expiré</h2>
            <p>Ce lien a expiré. Veuillez demander un nouveau lien.</p>
          </body>
        </html>
      `);
    }

    const { recipientId, templateId, templateData, lang = 'fr', campaign } = data;
    const waUrl = await computeWaRedirect(recipientId, templateId, lang, templateData);

    // Track click (async, non-blocking)
    const recipient = await getRecipientById(recipientId);
    logWaClick({ 
      recipientId, 
      templateId,
      campaign,
      ip: req.ip,
      userAgent: req.get('user-agent'),
      metadata: {
        role: recipient?.role,
        schoolId: recipient?.schoolId
      }
    }).catch(() => {});

    console.log('[WA_REDIRECT] Redirecting to WhatsApp:', { recipientId, templateId, campaign });

    // 302 redirect to WhatsApp
    res.redirect(302, waUrl);
  } catch (error) {
    console.error('[WA_REDIRECT] Error:', error);
    const errorMsg = error instanceof Error ? error.message : 'Une erreur s\'est produite';
    res.status(500).send(`
      <!DOCTYPE html>
      <html>
        <head><title>Erreur</title></head>
        <body style="font-family: sans-serif; text-align: center; padding: 50px;">
          <h2>❌ Erreur</h2>
          <p>${errorMsg}</p>
        </body>
      </html>
    `);
  }
});

/**
 * POST /api/wa/mint
 * Generate a WhatsApp Click-to-Chat token
 */
router.post('/api/wa/mint', requireAuth, mintLimiter, async (req, res) => {
  try {
    // Validate request body with Zod
    const parsed = WaMintRequestSchema.parse(req.body);
    
    // Verify recipient exists and has WhatsApp enabled
    const recipient = await getRecipientById(parsed.recipientId);
    
    if (!recipient) {
      return res.status(404).json({
        success: false,
        error: 'Recipient not found'
      });
    }

    console.log('[WA_MINT] Recipient check:', { 
      recipientId: parsed.recipientId, 
      waOptIn: recipient.waOptIn,
      whatsappE164: recipient.whatsappE164 
    });

    if (!recipient.waOptIn) {
      return res.status(403).json({
        success: false,
        error: 'Recipient has not opted in to WhatsApp notifications'
      });
    }

    if (!recipient.whatsappE164) {
      return res.status(400).json({
        success: false,
        error: 'Recipient does not have a WhatsApp number'
      });
    }

    // Generate token with all parameters
    const token = await createWaToken({
      recipientId: parsed.recipientId,
      templateId: parsed.templateId,
      templateData: parsed.templateData,
      lang: parsed.lang || recipient.waLanguage as 'fr' | 'en' || 'fr',
      campaign: parsed.campaign,
      ttlSeconds: parsed.ttlSeconds
    });

    const link = `/wa/${token}`;

    // Also compute the direct wa.me link for debugging
    const directWaLink = await computeWaRedirect(
      parsed.recipientId,
      parsed.templateId,
      parsed.lang || recipient.waLanguage as 'fr' | 'en' || 'fr',
      parsed.templateData || {}
    );

    console.log('[WA_MINT] Direct wa.me link:', directWaLink);

    res.json({
      success: true,
      token,
      link,
      fullUrl: `${req.protocol}://${req.get('host')}${link}`,
      directWaLink // Include the direct wa.me link for testing
    });
  } catch (error) {
    console.error('[WA_MINT] Error:', error);
    
    // Return Zod validation errors
    if (error && typeof error === 'object' && 'issues' in error) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request data',
        details: error
      });
    }
    
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate token'
    });
  }
});

/**
 * GET /api/wa/templates
 * Get available WhatsApp message templates
 */
router.get('/api/wa/templates', requireAuth, async (req, res) => {
  try {
    res.json({
      success: true,
      templates: Object.keys(WA_TEMPLATES).map(id => ({
        id,
        fr: WA_TEMPLATES[id].fr,
        en: WA_TEMPLATES[id].en
      })),
      languages: ['fr', 'en']
    });
  } catch (error) {
    console.error('[WA_TEMPLATES] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load templates'
    });
  }
});

export default router;
