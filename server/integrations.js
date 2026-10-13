const nodemailer = require('nodemailer');
const { dbHelpers } = require('./db');

async function getSetting(key) {
  const row = await dbHelpers.get('SELECT value FROM settings WHERE key = ?', [key]);
  return row ? row.value : '';
}

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
    console.error(`Failed to log integration for ${service}:`, err);
  }
}

/**
 * Dispatch lead data to configured CRM (Webhook, Interakt, MailerLite, HubSpot, Make.com, etc.)
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

/**
 * Dispatch personalized report via Email (SMTP or email webhook)
 */
async function dispatchToEmail(leadData, reportDetails) {
  const host = await getSetting('smtp_host');
  const port = await getSetting('smtp_port');
  const user = await getSetting('smtp_user');
  const pass = await getSetting('smtp_pass');
  const from = (await getSetting('smtp_from')) || 'wellness@lifeitup.com';

  if (!host || !user || !pass) {
    await logIntegration(leadData.id, 'email', 'not_configured', { email: leadData.email }, 'SMTP credentials not provided');
    return { status: 'not_configured', message: 'Email SMTP credentials not configured.' };
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port: Number(port) || 587,
      secure: Number(port) === 465,
      auth: { user, pass }
    });

    const emailSubject = `Your LifeITUp Wellbeing Assessment Report — Score: ${leadData.score}/48 (${reportDetails.zone})`;
    const emailHtml = `
      <div style="font-family: sans-serif; background-color: #081a13; color: #ecfdf5; padding: 32px; border-radius: 12px; max-width: 600px; margin: auto;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h2 style="color: #86efac; letter-spacing: 2px; text-transform: uppercase; margin: 0;">LIFEITUP</h2>
          <p style="color: #9ca3af; font-size: 13px; margin: 4px 0 0 0;">Empowering Your Holistic Success</p>
        </div>
        <div style="background-color: #0f2e21; padding: 24px; border-radius: 8px; border: 1px solid #1f4e38;">
          <h3 style="margin-top: 0; color: #ffffff;">Hello ${leadData.full_name},</h3>
          <p style="color: #d1fae5; line-height: 1.6;">Thank you for completing your 2-Minute Holistic Wellbeing Check.</p>
          <div style="background-color: #164330; padding: 16px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <div style="font-size: 14px; text-transform: uppercase; color: #a7f3d0; font-weight: bold;">Holistic Wellbeing Score</div>
            <div style="font-size: 36px; font-weight: bold; color: #ffffff; margin: 8px 0;">${leadData.score} <span style="font-size: 20px; color: #6ee7b7;">/ 48</span></div>
            <div style="display: inline-block; padding: 6px 14px; border-radius: 20px; font-weight: bold; background: #064e3b; color: #a7f3d0;">${reportDetails.emoji} ${reportDetails.zone} — ${reportDetails.title}</div>
          </div>
          <p style="color: #e2e8f0; line-height: 1.6;">${reportDetails.headline}</p>
          <p style="color: #94a3b8; font-size: 14px; font-style: italic;">${reportDetails.reassurance}</p>
          
          <div style="margin-top: 24px; border-top: 1px solid #1f4e38; padding-top: 16px;">
            <h4 style="color: #86efac; margin: 0 0 8px 0;">YOUR FIRST MOVE</h4>
            <p style="color: #cbd5e1; font-weight: bold; margin: 0 0 4px 0;">${reportDetails.firstMoveRule}</p>
            <p style="color: #94a3b8; margin: 0;">${reportDetails.firstMoveAdvice}</p>
          </div>

          <div style="margin-top: 20px; border-top: 1px solid #1f4e38; padding-top: 16px;">
            <h4 style="color: #86efac; margin: 0 0 8px 0;">YOUR PERSONALISED PATHWAY</h4>
            <div style="color: #34d399; font-weight: bold;">${reportDetails.pathwaySteps.join(' → ')}</div>
            <p style="color: #94a3b8; font-size: 13px; margin-top: 6px;">${reportDetails.pathwayDescription}</p>
          </div>
        </div>
        <p style="font-size: 11px; color: #64748b; text-align: center; margin-top: 24px;">
          This assessment is a self-reflection tool aligned with WHO multidimensional wellbeing guidelines.
        </p>
      </div>
    `;

    const info = await transporter.sendMail({
      from,
      to: leadData.email,
      subject: emailSubject,
      html: emailHtml
    });

    await logIntegration(leadData.id, 'email', 'success', { to: leadData.email, subject: emailSubject }, info.response);
    return { status: 'success', messageId: info.messageId };
  } catch (err) {
    await logIntegration(leadData.id, 'email', 'failure', { to: leadData.email }, err.message);
    return { status: 'failure', error: err.message };
  }
}

/**
 * Dispatch message via WhatsApp Business API / Webhook (Interakt, Gupshup, Meta Cloud API)
 */
async function dispatchToWhatsapp(leadData, reportDetails) {
  const webhookUrl = await getSetting('whatsapp_webhook_url');
  const apiToken = await getSetting('whatsapp_api_token');

  if (!webhookUrl) {
    await logIntegration(leadData.id, 'whatsapp', 'not_configured', { mobile: leadData.mobile }, 'WhatsApp webhook URL not configured');
    return { status: 'not_configured', message: 'WhatsApp webhook not configured.' };
  }

  const payload = {
    recipient: leadData.mobile,
    name: leadData.full_name,
    score: leadData.score,
    zone: reportDetails.zone,
    title: reportDetails.title,
    firstMove: reportDetails.firstMoveAdvice,
    timestamp: new Date().toISOString()
  };

  try {
    const headers = { 'Content-Type': 'application/json' };
    if (apiToken) headers['Authorization'] = `Bearer ${apiToken}`;

    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });

    const responseText = await res.text();
    const success = res.ok;
    const status = success ? 'success' : 'failure';

    await logIntegration(leadData.id, 'whatsapp', status, payload, responseText);
    return { status, response: responseText };
  } catch (err) {
    await logIntegration(leadData.id, 'whatsapp', 'failure', payload, err.message);
    return { status: 'failure', error: err.message };
  }
}

module.exports = {
  dispatchToCrm,
  dispatchToEmail,
  dispatchToWhatsapp,
  getSetting,
  logIntegration
};
