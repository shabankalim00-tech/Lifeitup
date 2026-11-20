/**
 * ============================================================================
 * LIFEITUP - AISENSY WHATSAPP TEST RUNNER
 * ============================================================================
 * File: automations/whatsapp-aisensy/test-aisensy.js
 * 
 * Usage:
 * node automations/whatsapp-aisensy/test-aisensy.js <phone_number>
 * Example:
 * node automations/whatsapp-aisensy/test-aisensy.js 8505855649
 * 
 * Purpose:
 * - Tests AiSensy WhatsApp Business API Campaign dispatch.
 * ============================================================================
 */

const apiKey = process.env.AISENSY_API_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZhZTk3MjkzNWNmMTRiZTNmMTlhYWQ1YiIsIm5hbWUiOiJMaWZlSVRVcCIsImFwcE5hbWUiOiJBaVNlbnN5IiwiY2xpZW50SWQiOiI2YWU4YTdjOWFiYThkNTU5NmYxMTI2ZDQiLCJhY3RpdmVQbGFuIjoiQkFTSUNfTU9OVEhMWSIsImlhdCI6MTc5NDMzNjkwNX0.wWYydVXc-NbxthcHYBmFZzPgsDQOghiYSCEKfrPilXQ';
const campaignName = process.env.AISENSY_CAMPAIGN_NAME || 'Lifeitup 2';

async function testAiSensy(targetPhone) {
  let clean = String(targetPhone || '8505855649').replace(/[^\d]/g, '');
  if (clean.length === 10) clean = '91' + clean;

  console.log(`Sending AiSensy test message to: +${clean}`);
  console.log(`Campaign Name: ${campaignName}`);

  const payloadData = {
    name: 'Test Participant',
    score: 36,
    band: 'stable',
    answers: {}
  };
  const encodedPayload = Buffer.from(JSON.stringify(payloadData)).toString('base64url');
  const pdfPublicUrl = `https://lifeitup.vercel.app/api/report/${encodedPayload}/LifeITUp_Report.pdf`;

  const body = {
    apiKey,
    campaignName,
    destination: clean,
    userName: 'Test Participant',
    source: 'LifeITUp Web App Test',
    media: {
      url: pdfPublicUrl,
      filename: 'LifeITUp_Report_Test.pdf'
    },
    templateParams: [
      'Test Participant',
      '36',
      'STABLE'
    ],
    tags: ['LifeItUp Adult Assessment'],
    attributes: {
      email: 'test@lifeitupworldwide.com',
      score: '36',
      status: 'STABLE'
    }
  };

  try {
    const res = await fetch('https://backend.aisensy.com/campaign/t1/api/v2', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    console.log('AiSensy API Response Status:', res.status);
    console.log('Response Body:', data);
  } catch (err) {
    console.error('AiSensy Error:', err.message);
  }
}

const phone = process.argv[2] || '8505855649';
testAiSensy(phone);
