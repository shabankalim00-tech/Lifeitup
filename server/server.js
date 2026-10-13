const express = require('express');
const cors = require('cors');
const path = require('path');
const { dbHelpers } = require('./db');
const { PILLARS, QUESTIONS, ANSWER_OPTIONS, SCORE_BANDS, calculateAssessment } = require('./scoring');
const { dispatchToCrm, dispatchToEmail, dispatchToWhatsapp, logIntegration } = require('./integrations');

const app = express();
const PORT = process.env.PORT || 5000;

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
    // "After the user answers Question 12, calculate the final score and prepare the relevant personalised report.
    // Do not immediately expose the complete report if the established workflow requires lead capture first."
    res.json({
      success: true,
      sessionId,
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
          existingLead.id
        ]
      );
      leadId = existingLead.id;
    } else {
      const insertResult = await dbHelpers.run(
        `INSERT INTO leads (session_id, full_name, email, mobile, score, score_band_id, score_band_name, answers_json, consent)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          sessionId,
          fullName.trim(),
          email.trim(),
          phoneClean,
          assessmentResult.score,
          assessmentResult.scoreBand.id,
          assessmentResult.scoreBand.zone,
          JSON.stringify(assessmentResult.answers),
          consent ? 1 : 0
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
      consent: consent ? 1 : 0
    };

    // Trigger integrations asynchronously without blocking report generation
    let crmResult = { status: 'pending' };
    let emailResult = { status: 'pending' };
    let whatsappResult = { status: 'pending' };

    try {
      crmResult = await dispatchToCrm(leadRecord);
      await dbHelpers.run('UPDATE leads SET crm_status = ? WHERE id = ?', [crmResult.status, leadId]);
    } catch (crmErr) {
      console.error('CRM dispatch error:', crmErr);
    }

    try {
      emailResult = await dispatchToEmail(leadRecord, assessmentResult.scoreBand);
      await dbHelpers.run('UPDATE leads SET email_status = ? WHERE id = ?', [emailResult.status, leadId]);
    } catch (emailErr) {
      console.error('Email dispatch error:', emailErr);
    }

    try {
      whatsappResult = await dispatchToWhatsapp(leadRecord, assessmentResult.scoreBand);
      await dbHelpers.run('UPDATE leads SET whatsapp_status = ? WHERE id = ?', [whatsappResult.status, leadId]);
    } catch (waErr) {
      console.error('WhatsApp dispatch error:', waErr);
    }

    // Return the complete personalised score-based report
    res.json({
      success: true,
      lead: {
        id: leadId,
        fullName: fullName.trim(),
        email: email.trim()
      },
      report: {
        heading: 'LIFEITUP HOLISTIC WELLNESS SNAPSHOT',
        subheading: 'Your Personalised Wellness Report & Pathway',
        score: assessmentResult.score,
        maxScore: 48,
        scoreBand: assessmentResult.scoreBand
      },
      integrations: {
        crm: crmResult.status,
        email: emailResult.status,
        whatsapp: whatsappResult.status
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
      `SELECT id, session_id, full_name, email, mobile, score, score_band_id, score_band_name, answers_json, crm_status, email_status, whatsapp_status, created_at
       FROM leads ORDER BY created_at DESC`
    );
    res.json({ success: true, count: leads.length, leads });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Admin: Export leads to CSV
app.get('/api/leads/export', async (req, res) => {
  try {
    const leads = await dbHelpers.all(
      `SELECT id, full_name, email, mobile, score, score_band_name, crm_status, email_status, whatsapp_status, created_at
       FROM leads ORDER BY created_at DESC`
    );

    const headers = ['ID', 'Full Name', 'Email', 'Mobile', 'Score', 'Zone', 'CRM Status', 'Email Status', 'WhatsApp Status', 'Date'];
    const rows = leads.map(l => [
      l.id,
      `"${(l.full_name || '').replace(/"/g, '""')}"`,
      `"${(l.email || '').replace(/"/g, '""')}"`,
      `"${(l.mobile || '').replace(/"/g, '""')}"`,
      l.score,
      `"${(l.score_band_name || '').replace(/"/g, '""')}"`,
      l.crm_status,
      l.email_status,
      l.whatsapp_status,
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

// 10. Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', brand: 'LifeITUp', uptime: process.uptime() });
});

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

