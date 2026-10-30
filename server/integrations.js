const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
const { dbHelpers } = require('./db');
const { generateReportPdf } = require('./reportPdf');
let sendWhatsApp = async () => ({ success: false });
let isBaileysConnected = () => false;

if (!process.env.VERCEL) {
  try {
    const baileys = require('./baileysService');
    sendWhatsApp = baileys.sendWhatsApp;
    isBaileysConnected = baileys.isBaileysConnected;
  } catch (_) {}
}

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
 * Dispatch personalized report via Email (Short Thank You message + Attached luxury PDF report)
 */
async function dispatchToEmail(leadData, reportDetails) {
  const host = await getSetting('smtp_host');
  const port = await getSetting('smtp_port');
  const user = await getSetting('smtp_user');
  const pass = await getSetting('smtp_pass');
  const from = (await getSetting('smtp_from')) || 'ho@lifeitupworldwide.com';

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

    // Generate high-resolution luxury PDF report buffer
    const pdfBuffer = await generateReportPdf(leadData, reportDetails);

    const emailSubject = `Thank You for Participating — Your LifeITUp Holistic Wellness Report (${leadData.full_name})`;
    const senderAddress = from.includes('<') ? from : `LifeITUp WorldWide <${from}>`;

    const sanitizedName = (leadData.full_name || 'Participant').replace(/[^a-zA-Z0-9]/g, '_');
    const attachmentFilename = `LifeITUp_Assessment_Report_${sanitizedName}.pdf`;

    let templateHtml = await getSetting('email_html_template');
    if (!templateHtml) {
      try {
        const templatePath = path.join(__dirname, 'emailTemplate.html');
        if (fs.existsSync(templatePath)) {
          templateHtml = fs.readFileSync(templatePath, 'utf8');
        }
      } catch (tErr) {
        console.error('Error loading emailTemplate.html:', tErr);
      }
    }

    let emailHtml = templateHtml || `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; max-width: 560px; margin: 0 auto; padding: 24px; font-size: 15px; line-height: 1.6;">
        <div style="margin-bottom: 20px; border-bottom: 2px solid #059669; padding-bottom: 12px;">
          <h2 style="color: #064e3b; margin: 0 0 4px 0; letter-spacing: 1.5px; font-size: 20px;">LIFEITUP WORLDWIDE</h2>
          <p style="color: #64748b; font-size: 12px; margin: 0; text-transform: uppercase; letter-spacing: 0.5px;">Empowering Your Holistic Success</p>
        </div>
        <p style="margin-top: 0;">Hello <strong>{{fullName}}</strong>,</p>
        <p>Thank you for participating in the <strong>LifeITUp 2-Minute Holistic Wellbeing Check</strong>.</p>
        <p>Your official personalised assessment report has been generated and is attached to this email as a PDF document (<strong>{{attachmentFilename}}</strong>).</p>
        <p>Please review the attached PDF to explore your 6-Pillar Wellbeing Snapshot, your score analysis, and your key focus areas.</p>
        <div style="background-color: #fffbeb; border: 2px solid #d97706; border-radius: 8px; padding: 14px 18px; margin: 20px 0;">
          <p style="margin: 0 0 6px 0; color: #b45309; font-size: 13px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase;">⚠️ CALL TO ACTION</p>
          <p style="margin: 0; color: #78350f; font-size: 15px; font-weight: bold; line-height: 1.5;">Please DO REPLY, &quot;RECEIVED&quot; once you get your report, to AVOID getting duplicate mails.</p>
        </div>
        <p style="color: #64748b; font-size: 13px; margin: 24px 0 20px 0;">If you have any questions or would like guidance on your pathway, please feel free to reply directly to this email.</p>
        <div style="border-top: 1px solid #e2e8f0; padding-top: 16px; margin-top: 24px;">
          <p style="margin: 0; font-size: 14px; color: #334155;">
            Wishing you holistic health and success,<br>
            <strong>LifeITUp WorldWide Team</strong><br>
            <a href="mailto:ho@lifeitupworldwide.com" style="color: #059669; text-decoration: none; font-size: 13px;">ho@lifeitupworldwide.com</a>
          </p>
        </div>
      </div>
    `;

    emailHtml = emailHtml
      .replace(/\{\{fullName\}\}/g, leadData.full_name || 'Participant')
      .replace(/\{\{score\}\}/g, String(leadData.score || 0))
      .replace(/\{\{zone\}\}/g, (reportDetails && reportDetails.zone) || 'STABLE')
      .replace(/\{\{title\}\}/g, (reportDetails && reportDetails.title) || '')
      .replace(/\{\{attachmentFilename\}\}/g, attachmentFilename)
      .replace(/\{\{firstMoveRule\}\}/g, (reportDetails && reportDetails.firstMoveRule) || '')
      .replace(/\{\{firstMoveAdvice\}\}/g, (reportDetails && reportDetails.firstMoveAdvice) || '');

    const info = await transporter.sendMail({
      from: senderAddress,
      to: leadData.email,
      subject: emailSubject,
      html: emailHtml,
      attachments: [
        {
          filename: attachmentFilename,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ]
    });

    await logIntegration(
      leadData.id,
      'email',
      'success',
      { to: leadData.email, subject: emailSubject, attachment: attachmentFilename },
      info.response
    );
    return { status: 'success', messageId: info.messageId };
  } catch (err) {
    await logIntegration(leadData.id, 'email', 'failure', { to: leadData.email }, err.message);
    return { status: 'failure', error: err.message };
  }
}

/**
 * Dispatch message via WhatsApp Business API / Webhook (WATI, Interakt, Gupshup, Meta Cloud API)
 */
async function dispatchToWhatsapp(leadData, reportDetails) {
  const ultramsgInstance = ((await getSetting('ultramsg_instance_id')) || '').trim();
  const ultramsgToken = ((await getSetting('ultramsg_token')) || '').trim();
  let webhookUrl = (await getSetting('whatsapp_webhook_url')) || '';
  const apiToken = (await getSetting('whatsapp_api_token')) || '';

  // Clean phone number (e.g. +91 98765 43210 -> 919876543210)
  const cleanPhone = String(leadData.mobile || '').replace(/[^\d]/g, '');

  const messageText = `🌿 *LifeITUp Wellbeing Assessment Report*

Hello *${leadData.full_name}*,

Thank you for completing your 2-Minute Holistic Wellbeing Check.

📊 *Your Holistic Wellbeing Score:* *${leadData.score} / 48*
✨ *Status:* *${reportDetails.zone}* — *${reportDetails.title}*

${reportDetails.headline}

🎯 *YOUR FIRST STRATEGIC MOVE:*
*${reportDetails.firstMoveRule || ''}*
${reportDetails.firstMoveAdvice || ''}

📋 *YOUR PERSONALISED PATHWAY:*
${reportDetails.pathwaySteps ? reportDetails.pathwaySteps.join(' → ') : ''}

_Empowering Your Holistic Success — LifeITUp_`;

  // 0. Interakt WhatsApp Business API (Official Meta Cloud API)
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

    const pdfPublicUrl = `https://lifeitup.vercel.app/api/leads/${leadData.id || leadData.session_id}/pdf`;
    const sanitizedName = (leadData.full_name || 'Participant').replace(/[^a-zA-Z0-9]/g, '_');
    const fileName = `LifeITUp_Report_${sanitizedName}.pdf`;

    // Try sending with PDF document attachment first (if template was created with Document Header)
    let interaktPayload = {
      countryCode: countryCode,
      phoneNumber: phoneDigits,
      type: 'Template',
      template: {
        name: interaktTemplateName,
        languageCode: 'en',
        headerValues: [pdfPublicUrl],
        fileName: fileName,
        bodyValues: [
          leadData.full_name || 'Participant',
          String(leadData.score || 0),
          reportDetails.zone || 'STABLE'
        ]
      }
    };

    try {
      let res = await fetch('https://api.interakt.ai/v1/public/message/', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${interaktApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(interaktPayload)
      });

      let responseData = await res.json().catch(() => ({}));
      
      // If template was created without a Document header, retry cleanly as text-only body
      if (responseData && responseData.message && responseData.message.toLowerCase().includes('header')) {
        delete interaktPayload.template.headerValues;
        delete interaktPayload.template.fileName;
        res = await fetch('https://api.interakt.ai/v1/public/message/', {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${interaktApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(interaktPayload)
        });
        responseData = await res.json().catch(() => ({}));
      }

      const success = res.ok && responseData.result !== false;
      await logIntegration(
        leadData.id,
        'whatsapp',
        success ? 'success' : 'failure',
        { to: `${countryCode}${phoneDigits}`, provider: 'interakt', template: interaktTemplateName, attachment: fileName },
        JSON.stringify(responseData)
      );

      if (success) {
        return { status: 'success', provider: 'interakt', response: responseData };
      } else {
        console.warn('[Interakt WhatsApp API Warning]', responseData);
      }
    } catch (interaktErr) {
      console.error('[Interakt WhatsApp API Error]', interaktErr);
      await logIntegration(leadData.id, 'whatsapp', 'failure', { to: cleanPhone, provider: 'interakt' }, interaktErr.message);
    }
  }

  // 1. Direct Local WhatsApp Dispatch (Sends from user's personal WhatsApp number via Baileys)
  if (isBaileysConnected()) {
    try {
      let pdfBuffer = null;
      try {
        pdfBuffer = await generateReportPdf(leadData, reportDetails);
      } catch (pdfErr) {
        console.error('Error generating PDF for WhatsApp attachment:', pdfErr);
      }

      const sanitizedName = (leadData.full_name || 'Candidate').replace(/[^a-zA-Z0-9]/g, '_');
      const fileName = `LifeITUp_Report_${sanitizedName}.pdf`;

      const result = await sendWhatsApp(leadData.mobile, messageText, pdfBuffer, fileName);
      if (result.success) {
        await logIntegration(leadData.id, 'whatsapp', 'success', { to: leadData.mobile, provider: 'baileys_personal' }, `Delivered from personal WhatsApp (ID: ${result.messageId || 'ok'})`);
        return { status: 'success', provider: 'baileys_personal', messageId: result.messageId };
      } else {
        await logIntegration(leadData.id, 'whatsapp', 'failure', { to: leadData.mobile, provider: 'baileys_personal' }, result.error);
        console.warn('[Baileys Failed, checking fallbacks]', result.error);
      }
    } catch (bErr) {
      console.error('[Baileys Dispatch Error]', bErr);
    }
  }

  // 2. Direct UltraMsg Dispatch (Cloud QR provider)
  if (ultramsgInstance && ultramsgToken) {
    let cleanPhoneWithCountry = cleanPhone;
    if (cleanPhone.length === 10) {
      cleanPhoneWithCountry = '91' + cleanPhone;
    } else if (cleanPhone.length === 11 && cleanPhone.startsWith('0')) {
      cleanPhoneWithCountry = '91' + cleanPhone.substring(1);
    } else if (cleanPhone.length === 12 && cleanPhone.startsWith('91')) {
      cleanPhoneWithCountry = cleanPhone;
    } else if (!cleanPhone.startsWith('91')) {
      cleanPhoneWithCountry = '91' + cleanPhone;
    }
    const ultraUrl = `https://api.ultramsg.com/${ultramsgInstance}/messages/chat`;
    const params = new URLSearchParams();
    params.append('token', ultramsgToken);
    params.append('to', cleanPhoneWithCountry);
    params.append('body', messageText);

    try {
      const res = await fetch(ultraUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params
      });
      const responseText = await res.text();
      const success = res.ok;
      await logIntegration(leadData.id, 'whatsapp', success ? 'success' : 'failure', { to: cleanPhoneWithCountry, provider: 'ultramsg' }, responseText);
      return { status: success ? 'success' : 'failure', response: responseText };
    } catch (err) {
      await logIntegration(leadData.id, 'whatsapp', 'failure', { to: cleanPhoneWithCountry, provider: 'ultramsg' }, err.message);
      return { status: 'failure', error: err.message };
    }
  }

  // 2. Fallback to Webhook / WATI / Interakt
  if (!webhookUrl) {
    await logIntegration(leadData.id, 'whatsapp', 'not_configured', { mobile: leadData.mobile }, 'WhatsApp webhook / UltraMsg not configured');
    return { status: 'not_configured', message: 'WhatsApp webhook URL not configured.' };
  }

  const payload = {
    recipient: cleanPhone,
    mobile: cleanPhone,
    name: leadData.full_name,
    score: leadData.score,
    zone: reportDetails.zone,
    title: reportDetails.title,
    firstMove: reportDetails.firstMoveAdvice,
    message: messageText,
    timestamp: new Date().toISOString()
  };

  try {
    const headers = { 'Content-Type': 'application/json' };
    if (apiToken) {
      headers['Authorization'] = apiToken.startsWith('Bearer ') ? apiToken : `Bearer ${apiToken}`;
    }

    let targetUrl = webhookUrl.trim();
    let bodyData = JSON.stringify(payload);

    // WATI native endpoint handling
    if (targetUrl.includes('wati.io')) {
      // If user provided base WATI URL like https://live-mt-server.wati.io/10272846
      if (!targetUrl.includes('/api/v1/')) {
        targetUrl = targetUrl.replace(/\/+$/, '') + `/api/v1/sendSessionMessage/${cleanPhone}?messageText=${encodeURIComponent(messageText)}`;
        bodyData = null;
      }
    }

    const res = await fetch(targetUrl, {
      method: 'POST',
      headers,
      body: bodyData
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

const crypto = require('crypto');


/**
 * Dispatch lead data to Mailchimp Audience with full merge fields and tags
 */
async function dispatchToMailchimp(leadData, reportDetails) {
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
      ZONE: String(reportDetails.zone || '')
    },
    tags: [
      'LifeITUp Assessment',
      String(reportDetails.zone || 'Assessment')
    ]
  };

  try {
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

    // If contact is subscribed, send the official personalised report email via Mailchimp campaign from ho@lifeitupworldwide.com
    let campaignSent = false;
    if (success) {
      try {
        const emailSubject = `Your LifeITUp Wellbeing Assessment Report — Score: ${leadData.score}/48 (${reportDetails.zone})`;
        const emailHtml = `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #06150f; color: #ecfdf5; padding: 32px 16px; margin: 0;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 620px; margin: 0 auto; background-color: #0c2319; border-radius: 16px; border: 1px solid rgba(52, 211, 153, 0.2); overflow: hidden;">
              <tr>
                <td style="padding: 32px 28px 20px 28px; text-align: center; border-bottom: 1px solid rgba(52, 211, 153, 0.15); background: linear-gradient(180deg, #0f2e21 0%, #0c2319 100%);">
                  <h1 style="color: #6ee7b7; letter-spacing: 3px; text-transform: uppercase; margin: 0; font-size: 24px; font-weight: 800;">LIFEITUP</h1>
                  <p style="color: #94a3b8; font-size: 13px; margin: 6px 0 0 0; letter-spacing: 0.5px;">Empowering Your Holistic Success</p>
                </td>
              </tr>
              <tr>
                <td style="padding: 28px;">
                  <p style="color: #a7f3d0; font-size: 15px; margin: 0 0 16px 0;">Hello <strong>${leadData.full_name}</strong>,</p>
                  <p style="color: #e2e8f0; font-size: 14px; line-height: 1.6; margin: 0 0 24px 0;">
                    Thank you for completing your 2-Minute Holistic Wellbeing Check. Here is your official assessment report and recommended first move.
                  </p>

                  <div style="background-color: #061912; border: 1px solid rgba(52, 211, 153, 0.3); border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
                    <div style="font-size: 12px; text-transform: uppercase; color: #a7f3d0; font-weight: 700; letter-spacing: 1.5px; margin-bottom: 8px;">Holistic Wellbeing Score</div>
                    <div style="font-size: 42px; font-weight: 800; color: #ffffff; line-height: 1;">
                      ${leadData.score} <span style="font-size: 20px; color: #34d399; font-weight: 600;">/ 48</span>
                    </div>
                    <div style="margin-top: 12px;">
                      <span style="display: inline-block; padding: 6px 16px; border-radius: 9999px; font-weight: 700; font-size: 13px; background-color: #064e3b; color: #6ee7b7; border: 1px solid rgba(52, 211, 153, 0.4);">
                        ${reportDetails.emoji || '✨'} STATUS: ${reportDetails.zone} — ${reportDetails.title}
                      </span>
                    </div>
                  </div>

                  <div style="background-color: rgba(22, 101, 52, 0.2); border-left: 4px solid #34d399; padding: 14px 16px; border-radius: 6px; margin-bottom: 24px;">
                    <p style="color: #f1f5f9; font-size: 14px; line-height: 1.6; margin: 0 0 8px 0; font-weight: 600;">
                      ${reportDetails.headline}
                    </p>
                    <p style="color: #94a3b8; font-size: 13px; line-height: 1.5; margin: 0; font-style: italic;">
                      ${reportDetails.reassurance}
                    </p>
                  </div>

                  <div style="background-color: #081d14; border: 1px solid rgba(52, 211, 153, 0.2); border-radius: 10px; padding: 18px; margin-bottom: 24px;">
                    <h3 style="color: #34d399; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 8px 0;">
                      🎯 YOUR FIRST STRATEGIC MOVE
                    </h3>
                    <p style="color: #f8fafc; font-weight: 700; font-size: 14px; margin: 0 0 6px 0;">
                      ${reportDetails.firstMoveRule || ''}
                    </p>
                    <p style="color: #cbd5e1; font-size: 13px; line-height: 1.5; margin: 0;">
                      ${reportDetails.firstMoveAdvice || ''}
                    </p>
                  </div>

                  <div style="background-color: #081d14; border: 1px solid rgba(52, 211, 153, 0.2); border-radius: 10px; padding: 18px; margin-bottom: 24px;">
                    <h3 style="color: #34d399; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 8px 0;">
                      📋 YOUR PERSONALISED PATHWAY
                    </h3>
                    <div style="color: #6ee7b7; font-weight: 700; font-size: 15px; letter-spacing: 1px; margin-bottom: 6px;">
                      ${(reportDetails.pathwaySteps || []).join(' &rarr; ')}
                    </div>
                    <p style="color: #94a3b8; font-size: 13px; line-height: 1.5; margin: 0;">
                      ${reportDetails.pathwayDescription || ''}
                    </p>
                  </div>

                  <p style="color: #64748b; font-size: 12px; line-height: 1.5; text-align: center; margin: 24px 0 0 0;">
                    This assessment is an evidence-based self-reflection tool aligned with WHO multidimensional wellbeing guidelines.
                  </p>
                </td>
              </tr>
              <tr>
                <td style="padding: 20px 28px; background-color: #081711; border-top: 1px solid rgba(52, 211, 153, 0.1); text-align: center; font-size: 11px; color: #64748b; line-height: 1.6;">
                  <p style="margin: 0 0 4px 0;">Sent with care from <strong>ho@lifeitupworldwide.com</strong></p>
                  <p style="margin: 0 0 4px 0;">LifeITUp WorldWide &bull; Vasant Kunj South, New Delhi, Delhi 110070, India</p>
                  <p style="margin: 0;"><a href="*|UNSUB|*" style="color: #34d399; text-decoration: underline;">Unsubscribe</a> from future wellness updates</p>
                </td>
              </tr>
            </table>
          </div>
        `;

        const cleanEmail = leadData.email.trim();

        // 1. Create instant static segment containing this exact subscriber
        let savedSegmentId = null;
        try {
          const segRes = await fetch(`https://${dc}.api.mailchimp.com/3.0/lists/${listId}/segments`, {
            method: 'POST',
            headers: {
              Authorization: `Basic ${auth}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              name: `Lead-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
              static_segment: [cleanEmail]
            })
          });
          if (segRes.ok) {
            const segData = await segRes.json();
            savedSegmentId = segData.id;
          }
        } catch (segErr) {
          console.error('Static segment creation warning:', segErr);
        }

        // 2. Create campaign targeted to this static segment
        const recipientsConfig = savedSegmentId 
          ? { list_id: listId, segment_opts: { saved_segment_id: savedSegmentId } }
          : { list_id: listId };

        const campRes = await fetch(`https://${dc}.api.mailchimp.com/3.0/campaigns`, {
          method: 'POST',
          headers: {
            Authorization: `Basic ${auth}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            type: 'regular',
            recipients: recipientsConfig,
            settings: {
              subject_line: emailSubject,
              title: `Assessment - ${cleanEmail} - ${Date.now()}`,
              from_name: 'LifeITUp WorldWide',
              reply_to: 'ho@lifeitupworldwide.com'
            }
          })
        });

        if (campRes.ok) {
          const campData = await campRes.json();
          const campaignId = campData.id;

          // 3. Set campaign HTML content
          const contentRes = await fetch(`https://${dc}.api.mailchimp.com/3.0/campaigns/${campaignId}/content`, {
            method: 'PUT',
            headers: {
              Authorization: `Basic ${auth}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ html: emailHtml })
          });

          if (contentRes.ok) {
            // 4. Send campaign immediately via Mailchimp
            const sendRes = await fetch(`https://${dc}.api.mailchimp.com/3.0/campaigns/${campaignId}/actions/send`, {
              method: 'POST',
              headers: {
                Authorization: `Basic ${auth}`,
                'Content-Type': 'application/json'
              }
            });

            campaignSent = sendRes.ok || sendRes.status === 204;

            // If regular send failed (e.g. Segment not yet ready), use direct actions/test fallback
            if (!campaignSent) {
              const testRes = await fetch(`https://${dc}.api.mailchimp.com/3.0/campaigns/${campaignId}/actions/test`, {
                method: 'POST',
                headers: {
                  Authorization: `Basic ${auth}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  test_emails: [cleanEmail],
                  send_type: 'html'
                })
              });
              campaignSent = testRes.ok || testRes.status === 204;
            }

            await logIntegration(
              leadData.id,
              'mailchimp_email',
              campaignSent ? 'success' : 'failure',
              { to: cleanEmail, from: 'ho@lifeitupworldwide.com', subject: emailSubject },
              { campaignId, sent: campaignSent }
            );
          }
        }
      } catch (sendErr) {
        console.error('Mailchimp email dispatch error:', sendErr);
        await logIntegration(leadData.id, 'mailchimp_email', 'failure', { to: leadData.email }, sendErr.message);
      }
    }

    return { status, code: res.status, response: responseText, emailSent: campaignSent };
  } catch (err) {
    await logIntegration(leadData.id, 'mailchimp', 'failure', payload, err.message);
    return { status: 'failure', error: err.message };
  }
}

/**
 * Resolve Indian / Global State name from client IP address
 */
async function resolveStateFromIp(ip) {
  try {
    let cleanIp = String(ip || '').replace(/^.*:/, '').trim();
    // If running on localhost / private IP, query current outbound public IP
    const isLocal = !cleanIp || cleanIp === '1' || cleanIp === '127.0.0.1' || cleanIp.startsWith('192.168.') || cleanIp.startsWith('10.');
    const url = isLocal ? 'http://ip-api.com/json/' : `http://ip-api.com/json/${cleanIp}`;

    const res = await fetch(url, { signal: AbortSignal.timeout(3000) });
    if (res.ok) {
      const data = await res.json();
      if (data && data.status === 'success') {
        let state = data.regionName || data.region || '';
        state = state.replace('National Capital Territory of ', '').trim();
        return state || 'Delhi';
      }
    }
  } catch (err) {
    console.error('IP state resolution error:', err.message);
  }
  return 'Delhi';
}

/**
 * Dispatch lead data directly to Google Sheet via Webhook / Apps Script
 */
async function dispatchToGoogleSheet(leadData) {
  const sheetUrl = (await getSetting('google_sheet_url')).trim();

  if (!sheetUrl) {
    await logIntegration(leadData.id, 'google_sheet', 'not_configured', { email: leadData.email }, 'Google Sheet webhook URL not configured');
    return { status: 'not_configured', message: 'Google Sheet webhook not configured.' };
  }

  const payload = {
    timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
    fullName: leadData.full_name,
    organization: leadData.organization || '',
    institution: leadData.organization || '',
    mobile: leadData.mobile,
    email: leadData.email,
    score: `${leadData.score} / 48`,
    status: leadData.score_band_name,
    state: leadData.state || 'Delhi'
  };

  try {
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
  dispatchToCrm,
  dispatchToEmail,
  dispatchToWhatsapp,
  dispatchToMailchimp,
  dispatchToGoogleSheet,
  resolveStateFromIp,
  getSetting,
  logIntegration
};

