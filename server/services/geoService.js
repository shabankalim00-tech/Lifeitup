/**
 * ============================================================================
 * LIFEITUP - GEO LOCATION & STATE RESOLUTION SERVICE
 * ============================================================================
 * File: server/services/geoService.js
 * 
 * Purpose:
 * - Resolves Indian state / region from client IP address.
 * ============================================================================
 */

/**
 * Resolve Indian / Global State name from client IP address
 * @param {string} ip - Client IP
 * @returns {Promise<string>}
 */
async function resolveStateFromIp(ip) {
  try {
    let cleanIp = String(ip || '').replace(/^.*:/, '').trim();
    const isLocal = !cleanIp || cleanIp === '1' || cleanIp === '127.0.0.1' || cleanIp.startsWith('192.168.') || cleanIp.startsWith('10.');

    const url = isLocal
      ? 'http://ip-api.com/json/?fields=status,message,regionName,region'
      : `http://ip-api.com/json/${cleanIp}?fields=status,message,regionName,region`;

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

module.exports = {
  resolveStateFromIp
};
