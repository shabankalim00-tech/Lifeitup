/**
 * ============================================================================
 * LIFEITUP - GOOGLE SHEETS INTEGRATION SERVICE
 * ============================================================================
 * File: server/services/googleSheetService.js
 * 
 * Purpose:
 * - Automatically dispatches every completed assessment to Google Sheets via Webhook (Apps Script).
 * - Records: Timestamp, Full Name, Institution/Organization, Mobile Number, Email, Score, Status, State, Consent.
 * 
 * Notes for Editing / Customization:
 * - Agar aapko Google Sheet ka URL badalna ho to settings table me 'google_sheet_url' update karein.
 * - Google Apps Script ka backend code automations/google-apps-script/Code.gs me rakha hua hai.
 * ============================================================================
 */

const { getSetting, logIntegration } = require('./settingsService');

/**
 * Dispatch lead data directly to Google Sheet via Webhook / Apps Script
 * @param {object} leadData - Lead contact info (full_name, email, mobile, score, organization, state, consent)
 * @returns {Promise<{status: string, code?: number, response?: string, message?: string}>}
 */
async function dispatchToGoogleSheet(leadData) {
  // 1. Fetch configured Google Sheet Webhook URL
  const sheetUrl = (await getSetting('google_sheet_url')).trim();

  if (!sheetUrl) {
    await logIntegration(leadData.id, 'google_sheet', 'not_configured', { email: leadData.email }, 'Google Sheet webhook URL not configured');
    return { status: 'not_configured', message: 'Google Sheet webhook not configured.' };
  }

  // 2. Format consent value
  const consentValue = leadData.consent_remark || (leadData.consent ? 'YES' : 'NO');

  // 3. Construct payload matching Google Sheet Apps Script columns
  const payload = {
    timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
    fullName: leadData.full_name || '',
    organization: leadData.organization || '',
    institution: leadData.organization || '',
    mobile: leadData.mobile || '',
    email: leadData.email || '',
    score: `${leadData.score || 0} / 48`,
    status: leadData.score_band_name || '',
    state: leadData.state || 'Delhi',
    consent: consentValue,
    consent_remark: consentValue
  };

  try {
    // 4. Send POST request (with redirect: 'follow' as required by Google Apps Script)
    const res = await fetch(sheetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      redirect: 'follow'
    });

    const responseText = await res.text();
    const success = res.ok;
    const status = success ? 'success' : 'failure';

    await logIntegration(leadData.id, 'google_sheet', status, payload, responseText);
    return { status, code: res.status, response: responseText };
  } catch (err) {
    await logIntegration(leadData.id, 'google_sheet', 'failure', payload, err.message);
    return { status: 'failure', error: err.message };
  }
}

module.exports = {
  dispatchToGoogleSheet
};
