const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const DB_PATH = process.env.VERCEL
  ? path.join('/tmp', 'lifeitup.db')
  : path.join(__dirname, 'lifeitup.db');

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Error connecting to SQLite database:', err);
  } else {
    console.log('Connected to SQLite database at', DB_PATH);
  }
});

// Initialize database schema
db.serialize(() => {
  // Table for completed assessments
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

  // Table for leads
  db.run(`
    CREATE TABLE IF NOT EXISTS leads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT UNIQUE NOT NULL,
      full_name TEXT NOT NULL,
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
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Table for app settings & integration configs
  db.run(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Table for integration delivery logs
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

  // Seed default settings if empty
  const defaultSettings = [
    { key: 'crm_webhook_url', value: '' },
    { key: 'crm_api_key', value: '' },
    { key: 'email_provider', value: 'smtp' }, // 'smtp', 'webhook', 'none'
    { key: 'smtp_host', value: 'smtp.gmail.com' },
    { key: 'smtp_port', value: '465' },
    { key: 'smtp_user', value: 'ho@lifeitupworldwide.com' },
    { key: 'smtp_pass', value: 'mjsbaymzausfnlgv' },
    { key: 'smtp_from', value: 'LifeITUp WorldWide <ho@lifeitupworldwide.com>' },
    { key: 'whatsapp_provider', value: 'webhook' },
    { key: 'whatsapp_webhook_url', value: '' },
    { key: 'whatsapp_api_token', value: '' },
    { key: 'ultramsg_instance_id', value: 'instance194619' },
    { key: 'ultramsg_token', value: '8bi0f2seyeslpgn4' },
    { key: 'google_sheet_url', value: 'https://script.google.com/macros/s/AKfycbzkgPYVKxGx_lHR3VIJ03qIXOIwth5_tbvQNLKqtAyFzsJ7ZP7TTpvvV74O7FT6iBAFRw/exec' },
    { key: 'social_instagram_url', value: '' },
    { key: 'social_whatsapp_url', value: '' },
  ];

  defaultSettings.forEach(({ key, value }) => {
    db.run(
      `INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)`,
      [key, value]
    );
  });
});

// Helper database promise wrappers
const dbHelpers = {
  get: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },
  all: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },
  run: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      db.run(sql, params, function (err) {
        if (err) reject(err);
        else resolve({ lastID: this.lastID, changes: this.changes });
      });
    });
  }
};

module.exports = { db, dbHelpers };
