/**
 * WhatsApp Click-to-Chat Routes
 * Handles token generation and redirect to wa.me links
 */

import express from 'express';
import { requireAuth } from '../middleware/auth';
import { verifyToken, buildWaUrl } from '../utils/waLink';
import { 
  getRecipientById, 
  createWaToken, 
  logWaClick, 
  renderTemplate,
  WA_TOKEN_SECRET 
} from '../services/waClickToChat';

const router = express.Router();

/**
 * GET /wa/:token
 * Redirect endpoint - validates token and redirects to WhatsApp
 */
router.get('/:token', async (req, res) => {
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

    const { recipientId, templateId, templateData, lang = 'fr' } = data;
    const recipient = await getRecipientById(recipientId);

    if (!recipient?.waOptIn || !recipient?.whatsappE164) {
      return res.status(403).send(`
        <!DOCTYPE html>
        <html>
          <head><title>WhatsApp non activé</title></head>
          <body style="font-family: sans-serif; text-align: center; padding: 50px;">
            <h2>🚫 WhatsApp non activé</h2>
            <p>Les notifications WhatsApp ne sont pas activées pour ce compte.</p>
          </body>
        </html>
      `);
    }

    const message = renderTemplate(templateId, lang, templateData);
    const waUrl = buildWaUrl(recipient.whatsappE164, message);

    // Track click (async, non-blocking)
    logWaClick({ 
      recipientId, 
      templateId, 
      ts: Date.now(), 
      ip: req.ip,
      userAgent: req.get('user-agent')
    }).catch(() => {});

    console.log('[WA_REDIRECT] Redirecting to WhatsApp:', { recipientId, templateId });

    // 302 redirect to WhatsApp
    res.redirect(302, waUrl);
  } catch (error) {
    console.error('[WA_REDIRECT] Error:', error);
    res.status(500).send(`
      <!DOCTYPE html>
      <html>
        <head><title>Erreur</title></head>
        <body style="font-family: sans-serif; text-align: center; padding: 50px;">
          <h2>❌ Erreur</h2>
          <p>Une erreur s'est produite. Veuillez réessayer.</p>
        </body>
      </html>
    `);
  }
});

/**
 * POST /api/wa/mint
 * Generate a WhatsApp Click-to-Chat token
 */
router.post('/api/wa/mint', requireAuth, async (req, res) => {
  try {
    const { recipientId, templateId, templateData, lang } = req.body;

    if (!recipientId || !templateId) {
      return res.status(400).json({
        success: false,
        error: 'recipientId and templateId are required'
      });
    }

    // Verify recipient exists and has WhatsApp enabled
    const recipient = await getRecipientById(recipientId);
    
    if (!recipient) {
      return res.status(404).json({
        success: false,
        error: 'Recipient not found'
      });
    }

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

    const token = await createWaToken({
      recipientId,
      templateId,
      templateData: templateData || {},
      lang: lang || recipient.waLanguage || 'fr'
    });

    const link = `/wa/${token}`;

    res.json({
      success: true,
      token,
      link,
      fullUrl: `${req.protocol}://${req.get('host')}${link}`
    });
  } catch (error) {
    console.error('[WA_MINT] Error:', error);
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
    const { WA_TEMPLATES } = await import('../templates/waTemplates');
    
    res.json({
      success: true,
      templates: Object.keys(WA_TEMPLATES).map(id => ({
        id,
        fr: WA_TEMPLATES[id].fr,
        en: WA_TEMPLATES[id].en
      }))
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
