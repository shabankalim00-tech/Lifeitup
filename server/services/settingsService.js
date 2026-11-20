const { dbHelpers } = require('../db');

/**
 * Fetch a configuration setting from the database or memory store
 * @param {string} key - Setting key name
 * @returns {Promise<string>}
 */
async function getSetting(key) {
  const row = await dbHelpers.get('SELECT value FROM settings WHERE key = ?', [key]);
  return row ? row.value : '';
}

/**
 * Audit log integration dispatch events
 * @param {number|null} leadId - Lead ID
 * @param {string} service - Service name (e.g. mailchimp, google_sheet, whatsapp, email, crm)
 * @param {string} status - success | failure | not_configured
 * @param {object|string} requestPayload
 * @param {object|string} responsePayload
 */
async function logIntegration(leadId, service, status, requestPayload, responsePayload) {
  try {
    await dbHelpers.run(
      `INSERT INTO integration_logs (lead_id, service, status, request_payload, response_payload)
       VALUES (?, ?, ?, ?, ?)`,
      [
        leadId || null,
        service,
        status,
        typeof requestPayload === 'object' ? JSON.stringify(requestPayload) : String(requestPayload),
        typeof responsePayload === 'object' ? JSON.stringify(responsePayload) : String(responsePayload)
      ]
    );
  } catch (err) {
    console.error(`Failed to log integration for ${service}:`, err.message);
  }
}

module.exports = {
  getSetting,
  logIntegration
};
