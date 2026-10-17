const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const pino = require('pino');
const qrcode = require('qrcode');
const path = require('path');
const fs = require('fs');

let sock = null;
let qrDataUrl = null;
let isConnected = false;
let connectedUser = null;
let isInitializing = false;

const authFolder = path.join(__dirname, 'baileys_auth');

async function initBaileys() {
  if (isInitializing) return;
  isInitializing = true;

  try {
    if (!fs.existsSync(authFolder)) {
      fs.mkdirSync(authFolder, { recursive: true });
    }

    const { state, saveCreds } = await useMultiFileAuthState(authFolder);

    sock = makeWASocket({
      auth: state,
      printQRInTerminal: true,
      logger: pino({ level: 'silent' }),
      browser: ['LifeITUp Assessment', 'Chrome', '122.0.0']
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        try {
          qrDataUrl = await qrcode.toDataURL(qr, { margin: 2, scale: 6 });
          console.log('\n=============================================');
          console.log('📱 [WHATSAPP QR READY] Open http://localhost:5001/api/whatsapp/qr-page to scan with your phone!');
          console.log('=============================================\n');
        } catch (e) {
          console.error('[Baileys] Error generating QR DataURL:', e);
        }
      }

      if (connection === 'close') {
        isConnected = false;
        connectedUser = null;
        const statusCode = lastDisconnect?.error?.output?.statusCode;
        const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
        console.log(`[Baileys] Connection closed (status: ${statusCode}). Reconnecting: ${shouldReconnect}`);

        if (shouldReconnect) {
          isInitializing = false;
          setTimeout(initBaileys, 3000);
        } else {
          console.log('[Baileys] Device logged out. Clearing auth cache...');
          try {
            fs.rmSync(authFolder, { recursive: true, force: true });
          } catch (_) {}
          isInitializing = false;
          setTimeout(initBaileys, 3000);
        }
      } else if (connection === 'open') {
        isConnected = true;
        qrDataUrl = null;
        connectedUser = sock.user;
        isInitializing = false;
        const cleanUser = sock.user?.id ? sock.user.id.split(':')[0] : (sock.user?.name || 'Personal Account');
        console.log(`\n✅ [WHATSAPP CONNECTED] Successfully connected as: +${cleanUser}\n`);
      }
    });
  } catch (err) {
    console.error('[Baileys] Initialization error:', err);
    isInitializing = false;
    setTimeout(initBaileys, 5000);
  }
}

async function sendWhatsApp(toPhone, text, pdfBuffer, pdfFileName) {
  if (!isConnected || !sock) {
    return { success: false, error: 'WhatsApp not connected. Please scan the QR code first.' };
  }

  let clean = String(toPhone || '').replace(/[^\d]/g, '');
  if (clean.length === 10) clean = '91' + clean;
  else if (clean.length === 11 && clean.startsWith('0')) clean = '91' + clean.slice(1);

  const jid = `${clean}@s.whatsapp.net`;

  try {
    // 1. Send text message
    const res = await sock.sendMessage(jid, { text });

    // 2. If PDF buffer is provided, send the actual PDF report document!
    if (pdfBuffer && Buffer.isBuffer(pdfBuffer)) {
      await sock.sendMessage(jid, {
        document: pdfBuffer,
        mimetype: 'application/pdf',
        fileName: pdfFileName || 'LifeITUp_Holistic_Report.pdf',
        caption: '📄 Official 2-Page Executive Wellbeing Report — LifeITUp'
      });
    }

    return { success: true, messageId: res?.key?.id };
  } catch (err) {
    console.error(`[Baileys] Error sending message to ${jid}:`, err);
    return { success: false, error: err.message };
  }
}

function getStatus() {
  const cleanPhone = connectedUser?.id ? connectedUser.id.split(':')[0] : null;
  return {
    connected: isConnected,
    phone: cleanPhone,
    user: connectedUser,
    qr: qrDataUrl
  };
}

async function logout() {
  try {
    if (sock) {
      await sock.logout();
    }
  } catch (_) {}
  try {
    fs.rmSync(authFolder, { recursive: true, force: true });
  } catch (_) {}
  isConnected = false;
  connectedUser = null;
  qrDataUrl = null;
  isInitializing = false;
  setTimeout(initBaileys, 1000);
  return { success: true };
}

module.exports = {
  initBaileys,
  sendWhatsApp,
  getStatus,
  logout,
  isBaileysConnected: () => isConnected
};
