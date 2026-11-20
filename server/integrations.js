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
          <h2 style="color: #064e3b; margin: 0 0 4px 0; letter-spacing: 1.5px; font-size: 20px;">LifeITup WorldWide</h2>
          <p style="color: #64748b; font-size: 12px; margin: 0; text-transform: uppercase; letter-spacing: 0.5px;">Empowering Your Holistic Success</p>
        </div>
        <p style="margin-top: 0;">Hello <strong>{{fullName}}</strong>,</p>
        <p>Thank you for completing your <strong>2-Minute LifeITUp Holistic Wellbeing Check</strong>.</p>
        <p>Your official assessment report has been generated and is attached to this email as a PDF document (<strong>{{attachmentFilename}}</strong>).</p>
        <div style="background-color: #fffbeb; border: 2px solid #d97706; border-radius: 8px; padding: 14px 18px; margin: 20px 0;">
          <p style="margin: 0; color: #78350f; font-size: 15px; font-weight: bold; line-height: 1.5;">Reply &quot;RECEIVED&quot; to this message to avoid receiving repeat messages.</p>
        </div>
        <div style="border-top: 1px solid #e2e8f0; padding-top: 16px; margin-top: 24px;">
          <p style="margin: 0; font-size: 14px; color: #334155; line-height: 1.6;">
            Your Holistic Wellbeing Partner,<br><br>
            <strong>Team LifeITUp</strong><br>
            <a href="https://lifeitupworldwide.com" target="_blank" style="color: #059669; text-decoration: underline; font-size: 13px; font-weight: bold;">www.lifeitupworldwide.com</a>
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

  const messageText = `Hello *${leadData.full_name || 'Participant'}*,

Thank you for completing your 2-Minute LifeITUp Holistic Wellbeing Check.

Your Score: ${leadData.score || 0} / 48 (Status: ${reportDetails.zone || 'STABLE'}).

Your official assessment report has been generated and is attached above as a PDF.

Reply "RECEIVED" to avoid receiving repeat messages.

Your Holistic Wellbeing Partner,

Team LifeITUp 
www.lifeitupworldwide.com`;

  // 0. AiSensy WhatsApp Business API (Official Meta Cloud API via Campaign API v2)
  const aisensyApiKey = ((await getSetting('aisensy_api_key')) || process.env.AISENSY_API_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZhZTk3MjkzNWNmMTRiZTNmMTlhYWQ1YiIsIm5hbWUiOiJMaWZlSVRVcCIsImFwcE5hbWUiOiJBaVNlbnN5IiwiY2xpZW50SWQiOiI2YWU4YTdjOWFiYThkNTU5NmYxMTI2ZDQiLCJhY3RpdmVQbGFuIjoiQkFTSUNfTU9OVEhMWSIsImlhdCI6MTc5NDMzNjkwNX0.wWYydVXc-NbxthcHYBmFZzPgsDQOghiYSCEKfrPilXQ').trim();
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
      tags: ['LifeITUp Assessment'],
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

  // 1. Interakt WhatsApp Business API (Official Meta Cloud API)
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

    // Step 1: Pre-register & track contact in Interakt CRM before dispatching message
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
          tags: ['LifeITup Assessment']
        })
      });
    } catch (trackErr) {
      console.warn('[Interakt User Track Warning]', trackErr.message);
    }

    // Step 2: Try sending with PDF document attachment first (if template was created with Document Header)
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
      ZONE: String(reportDetails.zone || ''),
      COMPANY: String(leadData.organization || leadData.institution || '')
    },
    tags: [
      'LifeItUp Adult Assessment'
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

    // If contact is subscribed, ensure added to LifeItUp Adult Assessment static tag
    if (success) {
      const cleanEmail = leadData.email.trim();
      const staticTagId = '3728797';
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
        console.warn(`Could not add ${cleanEmail} to Mailchimp segment:`, segErr.message);
      }
    }

    return { status, code: res.status, response: responseText };
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

  const consentValue = leadData.consent_remark || (leadData.consent ? 'YES' : 'NO');
  const payload = {
    timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
    fullName: leadData.full_name,
    organization: leadData.organization || '',
    institution: leadData.organization || '',
    mobile: leadData.mobile,
    email: leadData.email,
    score: `${leadData.score} / 48`,
    status: leadData.score_band_name,
    state: leadData.state || 'Delhi',
    consent: consentValue,
    consent_remark: consentValue
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

