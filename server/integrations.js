/**
 * ============================================================================
 * LIFEITUP - MODULAR INTEGRATIONS HUB
 * ============================================================================
 * File: server/integrations.js
 * 
 * Purpose:
 * - Aggregates and re-exports all integration services for server.js.
 * - Each integration has its own independent, clean file inside server/services/:
 * 
 *   1. Mailchimp Service:       server/services/mailchimpService.js
 *   2. Google Sheets Service:   server/services/googleSheetService.js
 *   3. WhatsApp Service:        server/services/whatsappService.js
 *   4. Email & PDF Service:     server/services/emailService.js
 *   5. CRM Webhook Service:     server/services/crmService.js
 *   6. Geo Resolution Service:  server/services/geoService.js
 *   7. Settings & Audit Logger: server/services/settingsService.js
 * 
 * Individual services can be edited directly anytime without affecting others.
 * ============================================================================
 */

const { getSetting, logIntegration } = require('./services/settingsService');
const { dispatchToCrm } = require('./services/crmService');
const { dispatchToEmail } = require('./services/emailService');
const { dispatchToWhatsapp } = require('./services/whatsappService');
const { dispatchToMailchimp } = require('./services/mailchimpService');
const { dispatchToGoogleSheet } = require('./services/googleSheetService');
const { resolveStateFromIp } = require('./services/geoService');

module.exports = {
  dispatchToCrm,
  dispatchToEmail,
  dispatchToWhatsapp,
  dispatchToMailchimp,
  dispatchToGoogleSheet,
  resolveStateFromIp,
  getSetting,
  logIntegration
};
