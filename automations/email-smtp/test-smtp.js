/**
 * ============================================================================
 * LIFEITUP - GMAIL SMTP & PDF REPORT TEST RUNNER
 * ============================================================================
 * File: automations/email-smtp/test-smtp.js
 * 
 * Usage:
 * node automations/email-smtp/test-smtp.js <recipient_email>
 * Example:
 * node automations/email-smtp/test-smtp.js test@example.com
 * 
 * Purpose:
 * - Generates luxury PDF report using server/reportPdf.js.
 * - Sends test email via Gmail SMTP with the PDF report attached.
 * ============================================================================
 */

const nodemailer = require('nodemailer');
const { generateReportPdf } = require('../../server/reportPdf');

const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
const smtpPort = process.env.SMTP_PORT || 465;
const smtpUser = process.env.SMTP_USER || 'ho@lifeitupworldwide.com';
const smtpPass = process.env.SMTP_PASS || Buffer.from('bWpzYmF5bXphdXNmbmxndg==', 'base64').toString('utf-8');
const smtpFrom = process.env.SMTP_FROM || 'LifeITUp WorldWide <ho@lifeitupworldwide.com>';

async function testSmtp(toEmail) {
  console.log(`Connecting to SMTP: ${smtpHost}:${smtpPort} as ${smtpUser}...`);
  console.log(`Sending test email to: ${toEmail}`);

  try {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: Number(smtpPort),
      secure: Number(smtpPort) === 465,
      auth: { user: smtpUser, pass: smtpPass }
    });

    const dummyLead = {
      full_name: 'Test Participant',
      email: toEmail,
      mobile: '+919999999999',
      score: 36,
      organization: 'Test University'
    };
    const reportDetails = {
      zone: 'STABLE',
      title: 'Stable Wellbeing'
    };

    console.log('Generating PDF buffer...');
    const pdfBuffer = await generateReportPdf(dummyLead, reportDetails);

    console.log('Sending message...');
    const info = await transporter.sendMail({
      from: smtpFrom,
      to: toEmail,
      subject: 'Test Email — LifeITUp Wellbeing Report',
      text: 'Hello, this is a test email verifying Gmail SMTP and attached PDF report delivery.',
      attachments: [
        {
          filename: 'LifeITUp_Report_Test.pdf',
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ]
    });

    console.log('Email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('Response:', info.response);
  } catch (err) {
    console.error('SMTP Error:', err.message);
  }
}

const recipient = process.argv[2] || 'ho@lifeitupworldwide.com';
testSmtp(recipient);
