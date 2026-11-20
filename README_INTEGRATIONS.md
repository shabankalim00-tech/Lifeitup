# LifeITUp — Integrations & Automations Architecture Guide

Is document me LifeITUp ke sabhi automated integrations (Mailchimp, Google Sheets, WhatsApp AiSensy, Gmail SMTP, aur PDF Report) ki alag-alag files aur unhe modify karne ka complete tareeqa diya gaya hai.

---

## 📁 Repository Structure (Alag-Alag Coding Files)

Saare backend integrations ko professionally alag-alag modular files me divide kiya gaya hai taaki aap baad me kisi bhi service ko easily change ya customize kar sakein:

```
Lifeitup/
│
├── server/
│   ├── services/                                 <-- 🎯 MAIN MODULAR INTEGRATION FILES
│   │   ├── mailchimpService.js                   <-- Mailchimp Sync & "LifeItUp Adult Assessment" Segment
│   │   ├── googleSheetService.js                 <-- Google Sheets Webhook Dispatcher
│   │   ├── whatsappService.js                    <-- WhatsApp AiSensy & Interakt API
│   │   ├── emailService.js                       <-- Gmail SMTP & Attached PDF Email
│   │   ├── crmService.js                         <-- External CRM Webhook (HubSpot, Make, etc.)
│   │   ├── geoService.js                         <-- State detection via Client IP
│   │   └── settingsService.js                    <-- Settings & Audit Logging
│   │
│   ├── integrations.js                           <-- Unified Aggregator (Calls all above services)
│   ├── reportPdf.js                              <-- High-Resolution Luxury PDF Generator
│   ├── scoring.js                                <-- 2-Minute Assessment Logic & Score Bands
│   ├── server.js                                 <-- Express API Routes & Controller
│   └── db.js                                     <-- Database configuration & memory store
│
├── automations/                                  <-- 🛠️ STANDALONE UTILITIES & SCRIPTS
│   ├── google-apps-script/
│   │   └── Code.gs                               <-- Google Sheets Apps Script Code (Copy-paste into Sheet)
│   ├── mailchimp/
│   │   └── mailchimp-segment-manager.js          <-- Test script to inspect & verify Mailchimp segment
│   ├── whatsapp-aisensy/
│   │   └── test-aisensy.js                       <-- Test script to send WhatsApp template via AiSensy
│   └── email-smtp/
│       └── test-smtp.js                          <-- Test script for Gmail SMTP & PDF attachment
│
└── vercel.json                                   <-- Vercel deployment configuration
```

---

## 🔧 Har File Ko Kaise Edit Karein (Customization Guide)

### 1. Mailchimp Integration (`server/services/mailchimpService.js`)
* **Role:** Assessment lead ka email, name, phone, score, zone, aur institution capture karta hai aur unhe dedicated segment **`LifeItUp Adult Assessment`** me sync karta hai.
* **Kahan change karein:**
  - **Segment Name:** `server/services/mailchimpService.js` me line 55 par tag name aur `server/db.js` me `mailchimp_assessment_segment_id`.
  - **Merge Fields:** Agar koi extra field add karni ho to line 45 (`merge_fields`) me edit karein:
    - `FNAME`, `LNAME`, `PHONE`, `SCORE`, `ZONE`, `COMPANY` (Institution Name).
* **Testing:**
  ```bash
  node automations/mailchimp/mailchimp-segment-manager.js
  ```

---

### 2. Google Sheets Integration (`server/services/googleSheetService.js` + `automations/google-apps-script/Code.gs`)
* **Role:** Lead submit hote hi turant Google Sheet me new row add karta hai:
  - `Timestamp | Full Name | Institution | Mobile | Email | Score | Status | State | Consent`
* **Google Apps Script Code:**
  - File: `automations/google-apps-script/Code.gs`
  - Apni Google Sheet open karein &rarr; **Extensions** &rarr; **Apps Script** &rarr; pura code wahan paste karein aur **Deploy as Web App** (Access: Anyone) karein.
* **Webhook URL Change Karna:**
  - Mila hua URL `server/db.js` me `google_sheet_url` par update karein.

---

### 3. WhatsApp AiSensy Integration (`server/services/whatsappService.js`)
* **Role:** User ko official WhatsApp template message bhejta hai jisme unka Score, Status, aur generated PDF Report ka direct download link hota hai.
* **Kahan change karein:**
  - **Campaign Name:** `server/services/whatsappService.js` me `aisensyCampaignName` (Default: `'Lifeitup 2'`).
  - **Template Params:** Line 60-75 me jo variables WhatsApp message me jate hain: `[Name, Score, Zone]`.
  - **Attached PDF:** Encoded public PDF link: `https://lifeitup.vercel.app/api/report/.../LifeITUp_Report.pdf`.
* **Testing:**
  ```bash
  node automations/whatsapp-aisensy/test-aisensy.js 918505855649
  ```

---

### 4. Email & PDF Report Delivery (`server/services/emailService.js`)
* **Role:** User ke email par thank you message aur high-resolution luxury PDF report attach karke bhejta hai.
* **Kahan change karein:**
  - **Sender Email & Password:** `server/db.js` me `smtp_user`, `smtp_pass`, aur `smtp_from`.
  - **Email Subject & Text:** `server/services/emailService.js` me `emailSubject` aur `emailHtml`.
  - **PDF Design & Branding:** `server/reportPdf.js` me colors, logos, layout, aur text edit kar sakte hain.
* **Testing:**
  ```bash
  node automations/email-smtp/test-smtp.js recipient@example.com
  ```

---

### 5. Assessment Questions & Scoring Bands (`server/scoring.js`)
* **Role:** 2-minute assessment ke 12 questions, unke 4 options (0, 1, 2, 3 points), aur 4 score bands (`LOW`, `MODERATE`, `STABLE`, `BALANCED`) define karta hai.
* **Kahan change karein:**
  - Agar questions ke text ya options badalne hon to `server/scoring.js` me `QUESTIONS` array ko edit karein.
  - Agar score range ya zone names badalne hon to `SCORE_BANDS` ko edit karein.

---

## 🚀 Live Deployment
Sabhi files Vercel par live production build ke sath fully integrated hain. GitHub ke `main` branch par push hote hi Vercel automatically new code deploy kar deta hai.
