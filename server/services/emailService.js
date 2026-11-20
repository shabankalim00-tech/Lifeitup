/**
 * ============================================================================
 * LIFEITUP - EMAIL & PDF REPORT SERVICE (GMAIL SMTP)
 * ============================================================================
 * File: server/services/emailService.js
 * 
 * Purpose:
 * - Generates high-resolution luxury PDF Assessment Report buffer.
 * - Sends official thank you email with the PDF report attached via Gmail SMTP.
 * 
 * Notes for Editing / Customization:
 * - Agar aapko email text ya subject badalna ho to line 45-90 me edit karein.
 * - SMTP App password ya sender email server/db.js me update karein.
 * - PDF design change karne ke liye server/reportPdf.js me edit karein.
 * ============================================================================
 */

const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
const { getSetting, logIntegration } = require('./settingsService');
const { generateReportPdf } = require('../reportPdf');

/**
 * Dispatch personalized report via Email (Short Thank You message + Attached luxury PDF report)
 * @param {object} leadData - Lead contact info (full_name, email, mobile, score, organization)
 * @param {object} reportDetails - Assessment score band details (zone, title, pathway, etc.)
 * @returns {Promise<{status: string, messageId?: string, message?: string, error?: string}>}
 */
async function dispatchToEmail(leadData, reportDetails = {}) {
  // 1. Fetch SMTP configuration
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

    // 2. Generate high-resolution luxury PDF report buffer
    const pdfBuffer = await generateReportPdf(leadData, reportDetails);

    const emailSubject = `Thank You for Participating — Your LifeITUp Holistic Wellness Report (${leadData.full_name})`;
    const senderAddress = from.includes('<') ? from : `LifeITUp WorldWide <${from}>`;

    const sanitizedName = (leadData.full_name || 'Participant').replace(/[^a-zA-Z0-9]/g, '_');
    const attachmentFilename = `LifeITUp_Assessment_Report_${sanitizedName}.pdf`;

    // 3. Load or build HTML email template
    let templateHtml = await getSetting('email_html_template');
    if (!templateHtml) {
      try {
        const templatePath = path.join(__dirname, '..', 'emailTemplate.html');
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

    // 4. Interpolate variables into template
    emailHtml = emailHtml
      .replace(/\{\{fullName\}\}/g, leadData.full_name || 'Participant')
      .replace(/\{\{score\}\}/g, String(leadData.score || 0))
      .replace(/\{\{zone\}\}/g, (reportDetails && reportDetails.zone) || 'STABLE')
      .replace(/\{\{title\}\}/g, (reportDetails && reportDetails.title) || '')
      .replace(/\{\{attachmentFilename\}\}/g, attachmentFilename)
      .replace(/\{\{firstMoveRule\}\}/g, (reportDetails && reportDetails.firstMoveRule) || '')
      .replace(/\{\{firstMoveAdvice\}\}/g, (reportDetails && reportDetails.firstMoveAdvice) || '');

    // 5. Send message with PDF attachment
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

module.exports = {
  dispatchToEmail
};
