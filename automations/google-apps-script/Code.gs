/**
 * ============================================================================
 * LIFEITUP - GOOGLE APPS SCRIPT FOR GOOGLE SHEETS
 * ============================================================================
 * File: automations/google-apps-script/Code.gs
 * 
 * SETUP INSTRUCTIONS (Kaise Use Karein):
 * 1. Apni Google Sheet open karein jisme leads save karni hain.
 * 2. Menu me 'Extensions' par click karein -> 'Apps Script' select karein.
 * 3. Wahan 'Code.gs' me sara purana code hata kar ye pura code paste karein.
 * 4. Upar 'Save' icon par click karein.
 * 5. Top-right me 'Deploy' -> 'New deployment' par click karein.
 * 6. Select type: 'Web app'.
 * 7. Description: 'LifeITUp Lead Sync'.
 * 8. Execute as: 'Me' (Aapka Google account).
 * 9. Who has access: 'Anyone' (IMPORTANT: Anyone select karna zaroori hai).
 * 10. 'Deploy' par click karein aur mila hua Web App URL copy karein.
 * ============================================================================
 */

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    // 1. Agar sheet blank hai, to Header Row automatically banayein
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Timestamp",
        "Full Name",
        "Institution",
        "Mobile Number",
        "Email Address",
        "Score",
        "Status",
        "State",
        "Consent"
      ]);
      // Header row ko bold karein
      sheet.getRange(1, 1, 1, 9).setFontWeight("bold");
    }

    // 2. Data values nikalna (Supporting both organization & institution)
    var timestamp = data.timestamp || new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
    var fullName = data.fullName || data.full_name || "";
    var institution = data.institution || data.organization || "";
    var mobile = data.mobile || data.phone || "";
    var email = data.email || "";
    var score = data.score || "";
    var status = data.status || data.zone || "";
    var state = data.state || "Delhi";
    var consent = data.consent || data.consent_remark || "YES";

    // 3. New Lead Row Sheet me append karein
    sheet.appendRow([
      timestamp,
      fullName,
      institution,
      mobile,
      email,
      score,
      status,
      state,
      consent
    ]);

    // Success response return karein
    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Lead added successfully to Google Sheet"
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput("LifeITUp Google Sheet Webhook is active and running!");
}
