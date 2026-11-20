/**
 * ============================================================================
 * LIFEITUP - MAILCHIMP SEGMENT MANAGER (STANDALONE SCRIPT)
 * ============================================================================
 * File: automations/mailchimp/mailchimp-segment-manager.js
 * 
 * Usage:
 * node automations/mailchimp/mailchimp-segment-manager.js
 * 
 * Purpose:
 * - Tests Mailchimp connection.
 * - Prints all members inside "LifeItUp Adult Assessment" segment.
 * - Displays merge fields (Name, Phone, Score, Zone, Institution).
 * ============================================================================
 */

const apiKey = process.env.MAILCHIMP_API_KEY || Buffer.from('MjQ1MmQ2YmNlMzBkZmRjNGFlOWU2YzM3NzAyMzgxYWUtdXMz', 'base64').toString('utf-8');
const listId = process.env.MAILCHIMP_LIST_ID || '0e7cd84597';
const segmentId = process.env.MAILCHIMP_SEGMENT_ID || '3728850'; // LifeItUp Adult Assessment
const dc = apiKey.split('-')[1] || 'us3';
const auth = Buffer.from('anystring:' + apiKey).toString('base64');

async function main() {
  console.log('--- Mailchimp Segment Verification ---');
  console.log(`Audience List ID: ${listId}`);
  console.log(`Target Segment ID: ${segmentId} ("LifeItUp Adult Assessment")`);

  try {
    // 1. Fetch Segment Details
    const segRes = await fetch(`https://${dc}.api.mailchimp.com/3.0/lists/${listId}/segments/${segmentId}`, {
      headers: { Authorization: `Basic ${auth}` }
    });

    if (!segRes.ok) {
      console.error(`Failed to fetch segment: HTTP ${segRes.status}`, await segRes.text());
      return;
    }

    const segData = await segRes.json();
    console.log(`Segment Name: "${segData.name}"`);
    console.log(`Segment Type: ${segData.type}`);
    console.log(`Total Members: ${segData.member_count}`);

    // 2. Fetch Members in Segment
    const memRes = await fetch(`https://${dc}.api.mailchimp.com/3.0/lists/${listId}/segments/${segmentId}/members?count=50`, {
      headers: { Authorization: `Basic ${auth}` }
    });

    const memData = await memRes.json();
    console.log(`\nFound ${memData.members.length} member(s) in this segment:`);
    console.log('---------------------------------------------------------------------------------------------------------');
    memData.members.forEach((m, idx) => {
      console.log(
        `${idx + 1}. Email: ${m.email_address.padEnd(30)} | Name: ${(m.full_name || 'N/A').padEnd(20)} | Score: ${(m.merge_fields.SCORE || 'N/A').padEnd(6)} | Zone: ${(m.merge_fields.ZONE || 'N/A').padEnd(10)} | Institution: ${m.merge_fields.COMPANY || 'N/A'}`
      );
    });
    console.log('---------------------------------------------------------------------------------------------------------');

  } catch (err) {
    console.error('Error querying Mailchimp:', err.message);
  }
}

main();
