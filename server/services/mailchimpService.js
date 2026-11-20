/**
 * ============================================================================
 * LIFEITUP - MAILCHIMP INTEGRATION SERVICE
 * ============================================================================
 * File: server/services/mailchimpService.js
 * 
 * Purpose:
 * - Upserts assessment leads into Mailchimp Audience (List).
 * - Maps all merge fields: Full Name, First/Last Name, Phone, Score, Zone, Institution (Company).
 * - Automatically syncs all leads into the dedicated segment: "LifeItUp Adult Assessment".
 * 
 * Notes for Editing / Customization:
 * - Agar aapko Mailchimp API Key ya List ID badalna ho to server/db.js ya Admin Settings me change karein.
 * - Merge tags yahan line 45-55 me mapped hain (COMPANY = leadData.organization || leadData.institution).
 * ============================================================================
 */

const crypto = require('crypto');
const { getSetting, logIntegration } = require('./settingsService');

/**
 * Dispatch lead data to Mailchimp Audience with full merge fields and tag/segment sync
 * @param {object} leadData - Lead contact info (full_name, email, mobile, score, organization)
 * @param {object} reportDetails - Assessment score band details (zone, title, etc.)
 * @returns {Promise<{status: string, code?: number, response?: string, message?: string}>}
 */
async function dispatchToMailchimp(leadData, reportDetails = {}) {
  // 1. Fetch credentials from settings
  const apiKey = (await getSetting('mailchimp_api_key')).trim();
  const listId = (await getSetting('mailchimp_list_id')).trim();

  if (!apiKey || !listId) {
    await logIntegration(leadData.id, 'mailchimp', 'not_configured', { email: leadData.email }, 'Mailchimp API key or List ID not configured');
    return { status: 'not_configured', message: 'Mailchimp not configured.' };
  }

  const dc = apiKey.split('-')[1] || 'us3';
  const auth = Buffer.from('anystring:' + apiKey).toString('base64');
  const subscriberHash = crypto.createHash('md5').update(leadData.email.toLowerCase().trim()).digest('hex');

  // Parse First and Last Name
  const nameParts = String(leadData.full_name || '').trim().split(/\s+/);
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';
  const cleanPhone = String(leadData.mobile || '').replace(/[^\d+]/g, '');

  // 2. Build Mailchimp subscriber payload
  const payload = {
    email_address: leadData.email.trim(),
    status_if_new: 'subscribed',
    status: 'subscribed',
    merge_fields: {
      FNAME: firstName,
      LNAME: lastName,
      MMERGE7: leadData.full_name,
      PHONE: cleanPhone,
      SCORE: String(leadData.score || ''),
      ZONE: String(reportDetails.zone || ''),
      COMPANY: String(leadData.organization || leadData.institution || '')
    },
    tags: [
      'LifeItUp Adult Assessment'
    ]
  };

  try {
    // 3. Upsert contact into Audience List via PUT
    const url = `https://${dc}.api.mailchimp.com/3.0/lists/${listId}/members/${subscriberHash}`;
    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const responseText = await res.text();
    const success = res.ok;
    const status = success ? 'success' : 'failure';

    await logIntegration(leadData.id, 'mailchimp', status, payload, responseText);

    // 4. Ensure lead is tagged & added into LifeItUp Adult Assessment static tag
    if (success) {
      const cleanEmail = leadData.email.trim();
      const staticTagId = '3728797'; // LifeItUp Adult Assessment Tag
      try {
        const segMemberUrl = `https://${dc}.api.mailchimp.com/3.0/lists/${listId}/segments/${staticTagId}/members`;
        await fetch(segMemberUrl, {
          method: 'POST',
          headers: {
            Authorization: `Basic ${auth}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email_address: cleanEmail })
        });
      } catch (segErr) {
        console.warn(`Could not add ${cleanEmail} to Mailchimp static tag:`, segErr.message);
      }
    }

    return { status, code: res.status, response: responseText };
  } catch (err) {
    await logIntegration(leadData.id, 'mailchimp', 'failure', payload, err.message);
    return { status: 'failure', error: err.message };
  }
}

module.exports = {
  dispatchToMailchimp
};
