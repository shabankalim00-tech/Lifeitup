/**
 * ============================================================================
 * LIFEITUP - CRM WEBHOOK INTEGRATION SERVICE
 * ============================================================================
 * File: server/services/crmService.js
 * 
 * Purpose:
 * - Dispatches lead data to an external CRM endpoint or Webhook (e.g. HubSpot, Make, Zapier, Webhook).
 * 
 * Notes for Editing / Customization:
 * - Agar aapko webhook URL badalna ho to settings table me 'crm_webhook_url' update karein.
 * ============================================================================
 */

const { getSetting, logIntegration } = require('./settingsService');

/**
 * Dispatch lead data to configured CRM Webhook
 * @param {object} leadData - Lead contact info and answers
 * @returns {Promise<{status: string, code?: number, response?: string, message?: string}>}
 */
async function dispatchToCrm(leadData) {
  const webhookUrl = await getSetting('crm_webhook_url');
  const apiKey = await getSetting('crm_api_key');

  if (!webhookUrl) {
    await logIntegration(leadData.id, 'crm', 'not_configured', leadData, 'No CRM webhook URL configured');
    return { status: 'not_configured', message: 'CRM webhook not configured in settings.' };
  }

  const payload = {
    event: 'assessment_completed',
    timestamp: new Date().toISOString(),
    source: leadData.source || 'lifeitup_assessment_web',
    lead: {
      fullName: leadData.full_name,
      email: leadData.email,
      mobile: leadData.mobile,
      organization: leadData.organization || '',
      consent: Boolean(leadData.consent)
    },
    assessment: {
      sessionId: leadData.session_id,
      score: leadData.score,
      maxScore: 48,
      scoreBandId: leadData.score_band_id,
      scoreBandName: leadData.score_band_name,
      answers: typeof leadData.answers_json === 'string' ? JSON.parse(leadData.answers_json) : leadData.answers_json
    }
  };

  try {
    const headers = { 'Content-Type': 'application/json' };
    if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`;

    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });

    const responseText = await res.text();
    const success = res.ok;
    const status = success ? 'success' : 'failure';

    await logIntegration(leadData.id, 'crm', status, payload, responseText);
    return { status, code: res.status, response: responseText };
  } catch (err) {
    await logIntegration(leadData.id, 'crm', 'failure', payload, err.message);
    return { status: 'failure', error: err.message };
  }
}

module.exports = {
  dispatchToCrm
};
