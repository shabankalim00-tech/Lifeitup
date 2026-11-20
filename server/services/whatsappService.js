/**
 * ============================================================================
 * LIFEITUP - WHATSAPP AUTOMATION SERVICE (AISENSY & FALLBACKS)
 * ============================================================================
 * File: server/services/whatsappService.js
 * 
 * Purpose:
 * - Sends official WhatsApp message with PDF report attachment upon assessment completion.
 * - Primary Provider: AiSensy Official WhatsApp Business API (Campaign API v2).
 * - Fallbacks: Interakt API, Ultramsg Webhook, Baileys local WhatsApp.
 * 
 * Notes for Editing / Customization:
 * - AiSensy Campaign Name: server/db.js me 'aisensy_campaign_name' (Current: 'Lifeitup 2').
 * - AiSensy API Key: server/db.js me 'aisensy_api_key'.
 * - Template params: [userName, score, zone].
 * ============================================================================
 */

const { getSetting, logIntegration } = require('./settingsService');

let sendWhatsApp = async () => ({ success: false });
let isBaileysConnected = () => false;

if (!process.env.VERCEL) {
  try {
    const baileys = require('../baileysService');
    sendWhatsApp = baileys.sendWhatsApp;
    isBaileysConnected = baileys.isBaileysConnected;
  } catch (_) {}
}

/**
 * Dispatch message via WhatsApp Business API (AiSensy, Interakt, Ultramsg)
 * @param {object} leadData - Lead contact info (full_name, email, mobile, score, organization)
 * @param {object} reportDetails - Assessment score band details (zone, title, etc.)
 * @returns {Promise<{status: string, provider?: string, response?: any, error?: string}>}
 */
async function dispatchToWhatsapp(leadData, reportDetails = {}) {
  const ultramsgInstance = ((await getSetting('ultramsg_instance_id')) || '').trim();
  const ultramsgToken = ((await getSetting('ultramsg_token')) || '').trim();
  let webhookUrl = (await getSetting('whatsapp_webhook_url')) || '';
  const apiToken = (await getSetting('whatsapp_api_token')) || '';

  // Clean phone number (e.g. +91 98765 43210 -> 919876543210)
  const cleanPhone = String(leadData.mobile || '').replace(/[^\d]/g, '');

  const messageText = `Hello *${leadData.full_name || 'Participant'}*,

Thank you for completing your 2-Minute LifeITUp Holistic Wellbeing Check.

Your Score: ${leadData.score || 0} / 48 (Status: ${reportDetails.zone || 'STABLE'}).

Your official assessment report has been generated and is attached above as a PDF.

Reply "RECEIVED" to avoid receiving repeat messages.

Your Holistic Wellbeing Partner,

Team LifeITUp 
www.lifeitupworldwide.com`;

  // ==========================================================================
  // 1. PRIMARY: AiSensy WhatsApp Business API (Official Meta Cloud API v2)
  // ==========================================================================
  const aisensyApiKey = ((await getSetting('aisensy_api_key')) || process.env.AISENSY_API_KEY || '').trim();
  const aisensyCampaignName = ((await getSetting('aisensy_campaign_name')) || process.env.AISENSY_CAMPAIGN_NAME || 'Lifeitup 2').trim();

  if (aisensyApiKey) {
    let destDigits = cleanPhone;
    if (destDigits.length === 10) {
      destDigits = '91' + destDigits;
    } else if (destDigits.startsWith('0') && destDigits.length === 11) {
      destDigits = '91' + destDigits.substring(1);
    }

    const payloadData = {
      name: leadData.full_name || 'Participant',
      score: leadData.score || 24,
      band: (reportDetails && reportDetails.zone ? reportDetails.zone.toLowerCase() : 'moderate'),
      answers: leadData.answers_json || {}
    };
    const encodedPayload = Buffer.from(JSON.stringify(payloadData)).toString('base64url');
    const pdfPublicUrl = `https://lifeitup.vercel.app/api/report/${encodedPayload}/LifeITUp_Report.pdf`;
    const sanitizedName = (leadData.full_name || 'Participant').replace(/[^a-zA-Z0-9]/g, '_');
    const fileName = `LifeITUp_Report_${sanitizedName}.pdf`;

    const aisensyPayload = {
      apiKey: aisensyApiKey,
      campaignName: aisensyCampaignName,
      destination: destDigits,
      userName: leadData.full_name || 'Participant',
      source: 'LifeITUp Web App',
      media: {
        url: pdfPublicUrl,
        filename: fileName
      },
      templateParams: [
        leadData.full_name || 'Participant',
        String(leadData.score || 0),
        reportDetails.zone || 'STABLE'
      ],
      tags: ['LifeItUp Adult Assessment'],
      attributes: {
        email: leadData.email || '',
        score: String(leadData.score || 0),
        status: reportDetails.zone || 'STABLE'
      }
    };

    try {
      const res = await fetch('https://backend.aisensy.com/campaign/t1/api/v2', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(aisensyPayload)
      });
      const responseData = await res.json().catch(() => ({}));
      const success = res.ok && (responseData.success === true || responseData.success === 'true' || responseData.status === 'success' || (responseData.message && responseData.message.toLowerCase().includes('success')));

      await logIntegration(
        leadData.id,
        'whatsapp',
        success ? 'success' : 'failure',
        { to: destDigits, provider: 'aisensy', campaign: aisensyCampaignName, attachment: fileName },
        JSON.stringify(responseData)
      );

      if (success) {
        console.log(`[AiSensy WhatsApp API Success] Sent to ${destDigits}:`, responseData);
        return { status: 'success', provider: 'aisensy', response: responseData };
      } else {
        console.warn('[AiSensy WhatsApp API Warning]', responseData);
      }
    } catch (aisensyErr) {
      console.error('[AiSensy WhatsApp API Error]', aisensyErr);
      await logIntegration(leadData.id, 'whatsapp', 'failure', { to: destDigits, provider: 'aisensy' }, aisensyErr.message);
    }
  }

  // ==========================================================================
  // 2. FALLBACK: Interakt WhatsApp API
  // ==========================================================================
  const interaktApiKey = ((await getSetting('interakt_api_key')) || '').trim();
  const interaktTemplateName = ((await getSetting('interakt_template_name')) || 'lifeitup_report').trim();

  if (interaktApiKey) {
    let countryCode = '+91';
    let phoneDigits = cleanPhone;
    if (phoneDigits.length === 12 && phoneDigits.startsWith('91')) {
      countryCode = '+91';
      phoneDigits = phoneDigits.substring(2);
    } else if (phoneDigits.length === 11 && phoneDigits.startsWith('0')) {
      countryCode = '+91';
      phoneDigits = phoneDigits.substring(1);
    } else if (phoneDigits.length > 10) {
      countryCode = '+' + phoneDigits.substring(0, phoneDigits.length - 10);
      phoneDigits = phoneDigits.slice(-10);
    }

    const payloadData = {
      name: leadData.full_name || 'Participant',
      score: leadData.score || 24,
      band: (reportDetails && reportDetails.zone ? reportDetails.zone.toLowerCase() : 'moderate'),
      answers: leadData.answers_json || {}
    };
    const encodedPayload = Buffer.from(JSON.stringify(payloadData)).toString('base64url');
    const pdfPublicUrl = `https://lifeitup.vercel.app/api/report/${encodedPayload}/LifeITUp_Report.pdf`;
    const sanitizedName = (leadData.full_name || 'Participant').replace(/[^a-zA-Z0-9]/g, '_');
    const fileName = `LifeITUp_Report_${sanitizedName}.pdf`;

    try {
      await fetch('https://api.interakt.ai/v1/public/track/users/', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${interaktApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          phoneNumber: phoneDigits,
          countryCode: countryCode,
          traits: {
            name: leadData.full_name || 'Participant',
            email: leadData.email || '',
            organization: leadData.organization || '',
            score: String(leadData.score || 0),
            status: reportDetails.zone || 'STABLE'
          },
          tags: ['LifeItUp Adult Assessment']
        })
      });

      const interaktPayload = {
        countryCode: countryCode,
        phoneNumber: phoneDigits,
        type: 'Template',
        template: {
          name: interaktTemplateName,
          languageCode: 'en',
          headerValues: [pdfPublicUrl],
          bodyValues: [
            leadData.full_name || 'Participant',
            String(leadData.score || 0),
            reportDetails.zone || 'STABLE'
          ],
          fileName: fileName
        }
      };

      const res = await fetch('https://api.interakt.ai/v1/public/message/', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${interaktApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(interaktPayload)
      });
      const responseText = await res.text();
      if (res.ok) {
        await logIntegration(leadData.id, 'whatsapp', 'success', { to: phoneDigits, provider: 'interakt' }, responseText);
        return { status: 'success', provider: 'interakt', response: responseText };
      }
    } catch (interaktErr) {
      console.warn('[Interakt API Warning]', interaktErr.message);
    }
  }

  // ==========================================================================
  // 3. FALLBACK: UltraMsg Webhook / Baileys
  // ==========================================================================
  if (ultramsgInstance && ultramsgToken) {
    try {
      const ultraUrl = `https://api.ultramsg.com/${ultramsgInstance}/messages/chat`;
      const res = await fetch(ultraUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: ultramsgToken,
          to: cleanPhone,
          body: messageText
        })
      });
      const text = await res.text();
      if (res.ok) {
        await logIntegration(leadData.id, 'whatsapp', 'success', { to: cleanPhone, provider: 'ultramsg' }, text);
        return { status: 'success', provider: 'ultramsg', response: text };
      }
    } catch (ultraErr) {
      console.warn('[UltraMsg Warning]', ultraErr.message);
    }
  }

  // Baileys local instance fallback
  if (!process.env.VERCEL && isBaileysConnected && isBaileysConnected()) {
    try {
      const bRes = await sendWhatsApp(cleanPhone, messageText);
      if (bRes.success) {
        await logIntegration(leadData.id, 'whatsapp', 'success', { to: cleanPhone, provider: 'baileys' }, bRes);
        return { status: 'success', provider: 'baileys' };
      }
    } catch (_) {}
  }

  return { status: 'not_configured', message: 'No WhatsApp provider succeeded or configured.' };
}

module.exports = {
  dispatchToWhatsapp
};
