const express = require('express');
const cors = require('cors');
const path = require('path');
const { dbHelpers } = require('./db');
const { PILLARS, QUESTIONS, ANSWER_OPTIONS, SCORE_BANDS, calculateAssessment } = require('./scoring');
const { 
  dispatchToCrm, 
  dispatchToEmail, 
  dispatchToWhatsapp, 
  dispatchToMailchimp, 
  dispatchToGoogleSheet,
  resolveStateFromIp, 
  logIntegration 
} = require('./integrations');
const { generateReportPdf } = require('./reportPdf');
const { initBaileys, getStatus: getBaileysStatus, logout: logoutBaileys } = require('./baileysService');


const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// 1. Assessment metadata (questions, pillars, options)
app.get('/api/assessment-meta', (req, res) => {
  res.json({
    brand: 'LifeITUp',
    tagline: 'Empowering Your Holistic Success',
    pillars: PILLARS,
    questions: QUESTIONS,
    options: ANSWER_OPTIONS,
    totalQuestions: QUESTIONS.length
  });
});

// 2. Calculate score and prepare report (when Quiz reaches Question 12)
app.post('/api/assessments', async (req, res) => {
  try {
    const { sessionId, answers } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: 'Missing sessionId.' });
    }
    if (!answers || typeof answers !== 'object') {
      return res.status(400).json({ error: 'Missing or invalid answers object.' });
    }

    const assessmentResult = calculateAssessment(answers);

    // Persist assessment into SQLite
    await dbHelpers.run(
      `INSERT INTO assessments (session_id, answers_json, score, score_band_id, score_band_name, completed)
       VALUES (?, ?, ?, ?, ?, 1)
       ON CONFLICT(session_id) DO UPDATE SET
         answers_json = excluded.answers_json,
         score = excluded.score,
         score_band_id = excluded.score_band_id,
         score_band_name = excluded.score_band_name`,
      [
        sessionId,
        JSON.stringify(assessmentResult.answers),
        assessmentResult.score,
        assessmentResult.scoreBand.id,
        assessmentResult.scoreBand.zone
      ]
    );

    // In accordance with Section 7:
    // Expose preliminary score & scoreBand status teaser, while keeping detailed report locked until lead capture
    res.json({
      success: true,
      sessionId,
      score: assessmentResult.score,
      scoreBand: {
        id: assessmentResult.scoreBand.id,
        zone: assessmentResult.scoreBand.zone,
        title: assessmentResult.scoreBand.title,
        headline: assessmentResult.scoreBand.headline,
        reassurance: assessmentResult.scoreBand.reassurance,
        emoji: assessmentResult.scoreBand.emoji,
        badgeTheme: assessmentResult.scoreBand.badgeTheme,
        min: assessmentResult.scoreBand.min,
        max: assessmentResult.scoreBand.max
      },
      readyForLeadCapture: true
    });

  } catch (err) {
    console.error('Error calculating assessment:', err);
    res.status(400).json({ error: err.message });
  }
});

// 3. Lead Capture & Personalized Report Delivery
app.post('/api/leads', async (req, res) => {
  try {
    const { sessionId, fullName, email, mobile, consent, answers } = req.body;

    // Field validation
    if (!fullName || typeof fullName !== 'string' || fullName.trim().length < 2) {
      return res.status(400).json({ error: 'Please enter your full name (at least 2 characters).' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email.trim())) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }

    const phoneClean = mobile ? String(mobile).replace(/[^\d+]/g, '') : '';
    if (!phoneClean || phoneClean.length < 8) {
      return res.status(400).json({ error: 'Please enter a valid mobile number.' });
    }

    if (!consent) {
      return res.status(400).json({ error: 'Consent is required to proceed.' });
    }

    if (!sessionId) {
      return res.status(400).json({ error: 'Assessment session ID is required.' });
    }

    // Verify answers and score
    if (!answers || Object.keys(answers).length < 12) {
      return res.status(400).json({ error: 'All 12 assessment questions must be answered.' });
    }

    const assessmentResult = calculateAssessment(answers);

    // Insert or update lead in SQLite
    const existingLead = await dbHelpers.get(
      'SELECT id FROM leads WHERE session_id = ?',
      [sessionId]
    );

    let leadId;
    let clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip || '';
    if (clientIp.includes(',')) {
      clientIp = clientIp.split(',')[0].trim();
    }
    clientIp = clientIp.replace(/^.*:/, '').trim();
    const clientState = await resolveStateFromIp(clientIp);

    if (existingLead) {
      await dbHelpers.run(
        `UPDATE leads SET
          full_name = ?,
          email = ?,
          mobile = ?,
          score = ?,
          score_band_id = ?,
          score_band_name = ?,
          answers_json = ?,
          consent = ?,
          ip_address = ?,
          state = ?,
          updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [
          fullName.trim(),
          email.trim(),
          phoneClean,
          assessmentResult.score,
          assessmentResult.scoreBand.id,
          assessmentResult.scoreBand.zone,
          JSON.stringify(assessmentResult.answers),
          consent ? 1 : 0,
          clientIp,
          clientState,
          existingLead.id
        ]
      );
      leadId = existingLead.id;
    } else {
      const insertResult = await dbHelpers.run(
        `INSERT INTO leads (session_id, full_name, email, mobile, score, score_band_id, score_band_name, answers_json, consent, ip_address, state)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          sessionId,
          fullName.trim(),
          email.trim(),
          phoneClean,
          assessmentResult.score,
          assessmentResult.scoreBand.id,
          assessmentResult.scoreBand.zone,
          JSON.stringify(assessmentResult.answers),
          consent ? 1 : 0,
          clientIp,
          clientState
        ]
      );
      leadId = insertResult.lastID;
    }

    const leadRecord = {
      id: leadId,
      session_id: sessionId,
      full_name: fullName.trim(),
      email: email.trim(),
      mobile: phoneClean,
      score: assessmentResult.score,
      score_band_id: assessmentResult.scoreBand.id,
      score_band_name: assessmentResult.scoreBand.zone,
      answers_json: assessmentResult.answers,
      consent: consent ? 1 : 0,
      ip_address: clientIp,
      state: clientState
    };

    // Return the complete personalised score-based report immediately (instant UI response)
    res.json({
      success: true,
      lead: {
        id: leadId,
        fullName: fullName.trim(),
        email: email.trim(),
        mobile: phoneClean,
        state: clientState
      },
      report: {
        heading: 'LIFEITUP HOLISTIC WELLNESS SNAPSHOT',
        subheading: 'Your Personalised Wellness Report & Pathway',
        score: assessmentResult.score,
        maxScore: 48,
        scoreBand: assessmentResult.scoreBand
      },
      integrations: {
        crm: 'processing',
        email: 'processing',
        whatsapp: 'processing',
        googleSheet: 'processing'
      }
    });

    // Run integrations concurrently in background without blocking user UI
    setImmediate(async () => {
      try {
        const crmPromise = dispatchToCrm(leadRecord).then(r => 
          dbHelpers.run('UPDATE leads SET crm_status = ? WHERE id = ?', [r.status, leadId])
        ).catch(err => console.error('CRM error:', err));

        const emailPromise = dispatchToEmail(leadRecord, assessmentResult.scoreBand).then(r => 
          dbHelpers.run('UPDATE leads SET email_status = ? WHERE id = ?', [r.status, leadId])
        ).catch(err => console.error('Email error:', err));

        const waPromise = dispatchToWhatsapp(leadRecord, assessmentResult.scoreBand).then(r => 
          dbHelpers.run('UPDATE leads SET whatsapp_status = ? WHERE id = ?', [r.status, leadId])
        ).catch(err => console.error('WA error:', err));

        const mcPromise = dispatchToMailchimp(leadRecord, assessmentResult.scoreBand).then(async r => {
          if (r.status === 'success') {
            await dbHelpers.run('UPDATE leads SET crm_status = ? WHERE id = ?', ['mailchimp_synced', leadId]);
            if (r.emailSent) {
              await dbHelpers.run('UPDATE leads SET email_status = ? WHERE id = ?', ['mailchimp_sent', leadId]);
            }
          }
        }).catch(err => console.error('Mailchimp error:', err));

        const sheetPromise = dispatchToGoogleSheet(leadRecord).then(r => 
          dbHelpers.run('UPDATE leads SET sheet_status = ? WHERE id = ?', [r.status, leadId])
        ).catch(err => console.error('Google Sheet error:', err));

        await Promise.allSettled([crmPromise, emailPromise, waPromise, mcPromise, sheetPromise]);
      } catch (bgErr) {
        console.error('Background dispatch execution error:', bgErr);
      }
    });
  } catch (err) {
    console.error('Error submitting lead:', err);
    res.status(500).json({ error: 'Server error processing assessment: ' + err.message });
  }
});

// 4. Admin: List all leads
app.get('/api/leads', async (req, res) => {
  try {
    const leads = await dbHelpers.all(
      `SELECT id, session_id, full_name, email, mobile, score, score_band_id, score_band_name, answers_json, crm_status, email_status, whatsapp_status, sheet_status, ip_address, state, created_at
       FROM leads ORDER BY created_at DESC`
    );
    res.json({ success: true, count: leads.length, leads });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4b. Download or view Lead PDF Report
app.get('/api/leads/:id/pdf', async (req, res) => {
  try {
    const lead = await dbHelpers.get('SELECT * FROM leads WHERE id = ?', [req.params.id]);
    if (!lead) return res.status(404).send('Report not found');

    const band = SCORE_BANDS.find(b => b.id === lead.score_band_id) || SCORE_BANDS[1];
    const pdfBuffer = await generateReportPdf(lead, band);
    const sanitizedName = (lead.full_name || 'Participant').replace(/[^a-zA-Z0-9]/g, '_');

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="LifeITUp_Assessment_Report_${sanitizedName}.pdf"`);
    res.send(pdfBuffer);
  } catch (err) {
    res.status(500).send('Error generating PDF: ' + err.message);
  }
});

// 5. Admin: Export leads to CSV
app.get('/api/leads/export', async (req, res) => {
  try {
    const leads = await dbHelpers.all(
      `SELECT id, full_name, email, mobile, score, score_band_name, state, crm_status, email_status, sheet_status, created_at
       FROM leads ORDER BY created_at DESC`
    );

    const headers = ['ID', 'Full Name', 'Email', 'Mobile', 'Score', 'Zone', 'State', 'CRM Status', 'Email Status', 'Google Sheet', 'Date'];
    const rows = leads.map(l => [
      l.id,
      `"${(l.full_name || '').replace(/"/g, '""')}"`,
      `"${(l.email || '').replace(/"/g, '""')}"`,
      `"${(l.mobile || '').replace(/"/g, '""')}"`,
      l.score,
      `"${(l.score_band_name || '').replace(/"/g, '""')}"`,
      `"${(l.state || 'Unknown').replace(/"/g, '""')}"`,
      l.crm_status,
      l.email_status,
      l.sheet_status,
      l.created_at
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="lifeitup_leads.csv"');
    res.send(csvContent);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Admin: Get settings
app.get('/api/settings', async (req, res) => {
  try {
    const rows = await dbHelpers.all('SELECT key, value FROM settings');
    const settings = {};
    rows.forEach(r => {
      // Mask password for display
      if (r.key === 'smtp_pass' && r.value) {
        settings[r.key] = '••••••••';
      } else {
        settings[r.key] = r.value;
      }
    });

    // Also include public social URLs
    res.json({
      success: true,
      settings,
      social: {
        instagram: settings.social_instagram_url || '',
        whatsapp: settings.social_whatsapp_url || ''
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 7. Admin: Update settings
app.put('/api/settings', async (req, res) => {
  try {
    const updates = req.body;
    for (const [key, val] of Object.entries(updates)) {
      if (key === 'smtp_pass' && val === '••••••••') {
        // Do not overwrite existing password with mask
        continue;
      }
      await dbHelpers.run(
        `INSERT INTO settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)
         ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP`,
        [key, String(val)]
      );
    }
    res.json({ success: true, message: 'Settings saved successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 8. Admin: Test an integration (CRM, Email, or WhatsApp)
app.post('/api/test-integration', async (req, res) => {
  try {
    const { service } = req.body;
    const dummyLead = {
      id: 0,
      session_id: 'test_session_' + Date.now(),
      full_name: 'Test LifeITUp User',
      email: 'test@lifeitup.example.com',
      mobile: '+919999999999',
      score: 36,
      score_band_id: 'stable',
      score_band_name: 'STABLE',
      answers_json: { 1: 3, 2: 3, 3: 3, 4: 3, 5: 3, 6: 3, 7: 3, 8: 3, 9: 3, 10: 3, 11: 3, 12: 3 }
    };
    const sampleBand = SCORE_BANDS[2];

    let result;
    if (service === 'crm') {
      result = await dispatchToCrm(dummyLead);
    } else if (service === 'email') {
      result = await dispatchToEmail(dummyLead, sampleBand);
    } else if (service === 'whatsapp') {
      result = await dispatchToWhatsapp(dummyLead, sampleBand);
    } else if (service === 'mailchimp') {
      result = await dispatchToMailchimp(dummyLead, sampleBand);
    } else if (service === 'google_sheet') {
      result = await dispatchToGoogleSheet({
        ...dummyLead,
        state: 'Delhi'
      });
    } else {
      return res.status(400).json({ error: 'Unknown service name.' });
    }


    res.json({ success: true, service, result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 9. Integration Logs
app.get('/api/integration-logs', async (req, res) => {
  try {
    const logs = await dbHelpers.all(
      `SELECT id, lead_id, service, status, request_payload, response_payload, created_at
       FROM integration_logs ORDER BY created_at DESC LIMIT 50`
    );
    res.json({ success: true, logs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 10. WhatsApp Local Status & QR Endpoints
app.get('/api/whatsapp/status', (req, res) => {
  res.json({ success: true, ...getBaileysStatus() });
});

app.post('/api/whatsapp/logout', async (req, res) => {
  try {
    const result = await logoutBaileys();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Dedicated interactive QR scanning page for user's personal WhatsApp
app.get('/api/whatsapp/qr-page', (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Connect Personal WhatsApp — LifeITUp</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
    body { background: #04140c; color: #fbf6e2; display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 20px; }
    .card { background: #082216; border: 1px solid rgba(212,175,55,0.4); border-radius: 24px; padding: 32px; max-width: 480px; width: 100%; text-align: center; box-shadow: 0 20px 50px rgba(0,0,0,0.5); }
    h1 { font-size: 20px; color: #f5de9c; margin-bottom: 8px; }
    p.sub { font-size: 13px; color: #a7f3d0; margin-bottom: 24px; line-height: 1.5; }
    .qr-box { background: #fff; padding: 16px; border-radius: 16px; display: inline-block; margin: 0 auto 20px auto; min-width: 260px; min-height: 260px; }
    .qr-box img { width: 240px; height: 240px; display: block; }
    .status-badge { display: inline-flex; align-items: center; gap: 8px; padding: 6px 16px; border-radius: 9999px; font-size: 12px; font-weight: bold; margin-bottom: 20px; }
    .status-connected { background: rgba(37,211,102,0.15); border: 1px solid #25d366; color: #4ade80; }
    .status-waiting { background: rgba(234,179,8,0.15); border: 1px solid #eab308; color: #facc15; }
    ol { text-align: left; font-size: 13px; color: #d1fae5; line-height: 1.8; margin-bottom: 24px; padding-left: 20px; }
    .btn { background: #d4af37; color: #04140c; font-weight: bold; padding: 12px 24px; border-radius: 12px; border: none; cursor: pointer; text-decoration: none; display: inline-block; font-size: 13px; }
    .btn-outline { background: transparent; border: 1px solid #d4af37; color: #f5de9c; margin-top: 10px; }
  </style>
</head>
<body>
  <div class="card">
    <h1>📱 Connect Personal WhatsApp</h1>
    <p class="sub">Scan this QR code once using your normal WhatsApp app. All assessment reports will be dispatched directly from your number!</p>
    
    <div id="status-container"></div>
    <div id="qr-container">
      <div class="qr-box" id="qr-box">
        <p style="color:#333; font-size:13px; padding-top:110px;">Generating QR Code...</p>
      </div>
    </div>

    <ol id="instructions">
      <li>Open normal <strong>WhatsApp</strong> on your mobile</li>
      <li>Tap <strong>3 dots (Settings)</strong> ➔ <strong>Linked Devices</strong></li>
      <li>Tap <strong>"Link a Device"</strong> and scan this screen</li>
    </ol>

    <div id="actions"></div>
  </div>

  <script>
    async function checkStatus() {
      try {
        const res = await fetch('/api/whatsapp/status');
        const data = await res.json();
        const statusDiv = document.getElementById('status-container');
        const qrContainer = document.getElementById('qr-container');
        const instructions = document.getElementById('instructions');
        const actions = document.getElementById('actions');

        if (data.connected) {
          statusDiv.innerHTML = '<span class="status-badge status-connected">✅ Connected as +' + (data.phone || 'Your Number') + '</span>';
          qrContainer.innerHTML = '<div style="padding: 20px 0; font-size: 15px; color: #4ade80; font-weight: bold;">🎉 Personal WhatsApp Connected Successfully!</div><p style="font-size: 12px; color: #a7f3d0; margin-bottom: 16px;">Whenever a candidate clicks "Send Me", report + PDF are sent directly from your WhatsApp number.</p>';
          instructions.style.display = 'none';
          actions.innerHTML = '<button onclick="logout()" class="btn btn-outline">Unlink / Change Number</button> <a href="/" class="btn" style="margin-left: 8px;">Back to Website</a>';
        } else {
          statusDiv.innerHTML = '<span class="status-badge status-waiting">⏳ Waiting for WhatsApp scan...</span>';
          instructions.style.display = 'block';
          if (data.qr) {
            qrContainer.innerHTML = '<div class="qr-box"><img src="' + data.qr + '" alt="Scan with WhatsApp" /></div>';
          }
          actions.innerHTML = '<a href="/" class="btn btn-outline">Back to Website</a>';
        }
      } catch (e) {
        console.error(e);
      }
    }

    async function logout() {
      if (confirm('Do you want to unlink this WhatsApp number?')) {
        await fetch('/api/whatsapp/logout', { method: 'POST' });
        checkStatus();
      }
    }

    checkStatus();
    setInterval(checkStatus, 2500);
  </script>
</body>
</html>`);
});

// 11. Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    brand: 'LifeITUp', 
    uptime: process.uptime(),
    whatsapp: getBaileysStatus()
  });
});

// Start local WhatsApp service
initBaileys();

// Serve static frontend build if available
const clientDistPath = path.join(__dirname, '../client/dist');
app.use(express.static(clientDistPath));

app.get('{*path}', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(clientDistPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`LifeITUp Server running on port ${PORT}`);
});

