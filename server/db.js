const path = require('path');
const fs = require('fs');

let sqlite3 = null;
let db = null;
let isUsingSqlite = false;

// In-Memory store for Vercel / serverless environment
const memoryStore = {
  settings: new Map([
    ['email_provider', 'smtp'],
    ['smtp_host', 'smtp.gmail.com'],
    ['smtp_port', '465'],
    ['smtp_user', 'ho@lifeitupworldwide.com'],
    ['smtp_pass', 'mjsbaymzausfnlgv'],
    ['smtp_from', 'LifeITUp WorldWide <ho@lifeitupworldwide.com>'],
    ['whatsapp_provider', 'webhook'],
    ['whatsapp_webhook_url', ''],
    ['whatsapp_api_token', ''],
    ['ultramsg_instance_id', 'instance194619'],
    ['ultramsg_token', '8bi0f2seyeslpgn4'],
    ['google_sheet_url', 'https://script.google.com/macros/s/AKfycbzkgPYVKxGx_lHR3VIJ03qIXOIwth5_tbvQNLKqtAyFzsJ7ZP7TTpvvV74O7FT6iBAFRw/exec'],
    ['interakt_api_key', 'c0hUYUNJeVpKY0pxYXVPb0tyWHhtclRTQWF1TWZlRHI0bzN1ZjBMQWNxYzo='],
    ['interakt_template_name', 'lifeitup_assessment_report'],
    ['social_instagram_url', ''],
    ['social_whatsapp_url', '']
  ]),
  leads: [],
  assessments: new Map(),
  logs: []
};

// Only initialize SQLite when NOT on Vercel
if (!process.env.VERCEL) {
  try {
    sqlite3 = require('sqlite3').verbose();
    const DB_PATH = path.join(__dirname, 'lifeitup.db');
    db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.warn('Error connecting to SQLite, using in-memory store:', err.message);
      } else {
        isUsingSqlite = true;
        console.log('Connected to local SQLite database at', DB_PATH);
      }
    });

    if (db) {
      db.serialize(() => {
        db.run(`
          CREATE TABLE IF NOT EXISTS assessments (
            session_id TEXT PRIMARY KEY,
            answers_json TEXT NOT NULL,
            score INTEGER NOT NULL,
            score_band_id TEXT NOT NULL,
            score_band_name TEXT NOT NULL,
            completed INTEGER DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `);

        db.run(`
          CREATE TABLE IF NOT EXISTS leads (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT UNIQUE NOT NULL,
            full_name TEXT NOT NULL,
            organization TEXT DEFAULT '',
            email TEXT NOT NULL,
            mobile TEXT NOT NULL,
            score INTEGER NOT NULL,
            score_band_id TEXT NOT NULL,
            score_band_name TEXT NOT NULL,
            answers_json TEXT NOT NULL,
            consent INTEGER NOT NULL DEFAULT 1,
            source TEXT DEFAULT 'web',
            crm_status TEXT DEFAULT 'pending',
            email_status TEXT DEFAULT 'pending',
            whatsapp_status TEXT DEFAULT 'pending',
            sheet_status TEXT DEFAULT 'pending',
            state TEXT DEFAULT '',
            ip_address TEXT DEFAULT '',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `);

        // Safely attempt migration if organization column doesn't exist in existing SQLite DB
        db.run(`ALTER TABLE leads ADD COLUMN organization TEXT DEFAULT ''`, () => {});

        db.run(`
          CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `);

        db.run(`
          CREATE TABLE IF NOT EXISTS integration_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            lead_id INTEGER,
            service TEXT NOT NULL,
            status TEXT NOT NULL,
            request_payload TEXT,
            response_payload TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `);

        // Seed defaults if empty
        for (const [key, value] of memoryStore.settings.entries()) {
          db.run(`INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)`, [key, value]);
        }
      });
    }
  } catch (err) {
    console.warn('SQLite native module failed, fallback to memory store:', err.message);
  }
}

// Database helper functions supporting both SQLite & Serverless memory
const dbHelpers = {
  get: (sql, params = []) => {
    if (isUsingSqlite && db) {
      return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });
    }

    // Memory Store Implementation
    const sqlLower = sql.toLowerCase();
    if (sqlLower.includes('from settings') && sqlLower.includes('where key =')) {
      const key = params[0];
      const val = memoryStore.settings.get(key);
      return Promise.resolve(val !== undefined ? { value: val } : undefined);
    }
    if (sqlLower.includes('from leads') && sqlLower.includes('session_id =')) {
      const lead = memoryStore.leads.find(l => l.session_id === params[0]);
      return Promise.resolve(lead ? { id: lead.id, ...lead } : undefined);
    }
    if (sqlLower.includes('from leads') && sqlLower.includes('id =')) {
      const lead = memoryStore.leads.find(l => l.id == params[0]);
      return Promise.resolve(lead);
    }
    return Promise.resolve(undefined);
  },

  all: (sql, params = []) => {
    if (isUsingSqlite && db) {
      return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      });
    }

    // Memory Store Implementation
    const sqlLower = sql.toLowerCase();
    if (sqlLower.includes('from settings')) {
      const rows = [];
      for (const [key, value] of memoryStore.settings.entries()) {
        rows.push({ key, value });
      }
      return Promise.resolve(rows);
    }
    if (sqlLower.includes('from leads')) {
      return Promise.resolve([...memoryStore.leads].reverse());
    }
    if (sqlLower.includes('from integration_logs')) {
      return Promise.resolve([...memoryStore.logs].reverse().slice(0, 50));
    }
    return Promise.resolve([]);
  },

  run: (sql, params = []) => {
    if (isUsingSqlite && db) {
      return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
          if (err) reject(err);
          else resolve({ lastID: this.lastID, changes: this.changes });
        });
      });
    }

    // Memory Store Implementation
    const sqlLower = sql.toLowerCase();
    if (sqlLower.includes('insert into leads') || sqlLower.includes('insert or replace into leads')) {
      const newId = memoryStore.leads.length + 1;
      const leadObj = {
        id: newId,
        session_id: params[0],
        full_name: params[1],
        email: params[2],
        mobile: params[3],
        score: params[4],
        score_band_id: params[5],
        score_band_name: params[6],
        answers_json: params[7],
        consent: params[8] || 1,
        source: params[9] || 'web',
        state: params[10] || '',
        ip_address: params[11] || '',
        crm_status: 'pending',
        email_status: 'pending',
        whatsapp_status: 'pending',
        sheet_status: 'pending',
        created_at: new Date().toISOString()
      };
      memoryStore.leads.push(leadObj);
      return Promise.resolve({ lastID: newId, changes: 1 });
    }

    if (sqlLower.includes('update leads set email_status =')) {
      const status = params[0];
      const id = params[1];
      const lead = memoryStore.leads.find(l => l.id == id);
      if (lead) lead.email_status = status;
      return Promise.resolve({ changes: 1 });
    }

    if (sqlLower.includes('update leads set sheet_status =')) {
      const status = params[0];
      const id = params[1];
      const lead = memoryStore.leads.find(l => l.id == id);
      if (lead) lead.sheet_status = status;
      return Promise.resolve({ changes: 1 });
    }

    if (sqlLower.includes('update leads set whatsapp_status =')) {
      const status = params[0];
      const id = params[1];
      const lead = memoryStore.leads.find(l => l.id == id);
      if (lead) lead.whatsapp_status = status;
      return Promise.resolve({ changes: 1 });
    }

    if (sqlLower.includes('update leads set crm_status =')) {
      const status = params[0];
      const id = params[1];
      const lead = memoryStore.leads.find(l => l.id == id);
      if (lead) lead.crm_status = status;
      return Promise.resolve({ changes: 1 });
    }

    if (sqlLower.includes('insert into settings') || sqlLower.includes('insert or replace into settings')) {
      memoryStore.settings.set(params[0], params[1]);
      return Promise.resolve({ changes: 1 });
    }

    if (sqlLower.includes('insert into integration_logs')) {
      memoryStore.logs.push({
        id: memoryStore.logs.length + 1,
        lead_id: params[0],
        service: params[1],
        status: params[2],
        request_payload: params[3],
        response_payload: params[4],
        created_at: new Date().toISOString()
      });
      return Promise.resolve({ changes: 1 });
    }

    if (sqlLower.includes('insert or replace into assessments')) {
      memoryStore.assessments.set(params[0], {
        session_id: params[0],
        answers_json: params[1],
        score: params[2],
        score_band_id: params[3],
        score_band_name: params[4],
        completed: 1,
        created_at: new Date().toISOString()
      });
      return Promise.resolve({ changes: 1 });
    }

    return Promise.resolve({ changes: 0 });
  }
};

module.exports = { db, dbHelpers };
