# LifeITUp — Holistic Wellbeing Assessment & Lead Automation System

A responsive, interactive wellbeing assessment web application and lead-generation automation platform for **LifeITUp** (*Empowering Your Holistic Success*).

Built to match the exact visual design theme, dark forest green luxury aesthetic, and workbook scoring logic.

---

## 🌿 Visual Theme & Branding

- **Theme Palette:** Deep luxury dark forest green (`#071b13`, `#0d261b`), luminous sage/lime accents (`#86efac`, `#a3e635`), soft ivory text (`#f7faf8`), and glassmorphism cards.
- **Hero Aesthetics:** Faithful adaptation of the LifeITUp visual asset with ambient lighting and the 6 life dimension emblems.
- **Logo:** LifeITUp three-leaf emblem with the tagline *"Empowering Your Holistic Success"*.

---

## 📋 The 10-Step User Journey

1. **Introductory Landing Screen:** 
   - Heading: `2-MINUTE FULL WELLBEING CHECK`
   - Copy: *"You take care of work. You take care of family. But how well are YOU really doing?"*
   - Six Pillars: Purpose · Inner Calm · Energy · Growth · Connection · Impact
   - Guidance: 30-day reflection advice
   - Primary CTA: `I'M READY →`
2. **Step-by-Step Assessment:**
   - **Exactly ONE question per screen**.
   - Dynamic progress bar (`8%` to `100%`) and question counter (`Question X of 12`).
   - Pillar badge and full question prompt.
   - 4 clear options: `Never (1)`, `Sometimes (2)`, `Often (3)`, `Always (4)`.
   - Backward navigation (preserves answers) and forward validation (cannot skip).
3. **Completion Screen:**
   - Visual confirmation that all 12 questions are complete.
   - Primary CTA: `Get My Holistic Wellness Score & Report`.
   - Strictly no premature score reveal or forbidden six-pillar snapshot widgets.
4. **Lead Capture Screen:**
   - Fields: Full Name, Email Address, Mobile Number.
   - Explicit consent checkbox (unselected by default).
   - Form button: `Send Me`.
   - Client and server validation with deduplication handling.
5. **Personalized Report Delivery:**
   - Displays holistic wellbeing score (`XX / 48`).
   - Exact workbook score-band interpretation, *"YOUR FIRST MOVE"*, and *"YOUR PERSONALISED PATHWAY"*.
   - Evidence note citing WHO whole-person multidimensional wellbeing framework.
   - Official social links (Instagram & WhatsApp channel) when configured.

---

## 🎯 Verified Scoring Model & Score Bands

Sum of all 12 answers (Min: 12, Max: 48):

| Score Range | Zone | Title | First Move Rule | Pathway |
|---|---|---|---|---|
| **12 – 20** | 🔴 LOW | *A Reset May Be Needed* | "Don't try to change everything at once." | RESET → REBUILD → REPEAT |
| **21 – 32** | 🟠 MODERATE | *You Have a Foundation. Now Find the Gap.* | "Don't improve everything. Find the one pillar with the biggest gap." | IDENTIFY → FOCUS → BUILD |
| **33 – 40** | 🟢 STABLE | *You've Built a Foundation. What's Holding Back Your Next Level?* | "Don't chase more. Identify what's missing." | REFINE → STRENGTHEN → SUSTAIN |
| **41 – 48** | 🔵 BALANCED | *Your Foundation is Strong. Now Protect It.* | "Don't become complacent." | SUSTAIN → DEEPEN → CONTRIBUTE |

---

## 🛠️ Technology Stack

- **Frontend:** React 19 + TypeScript + Vite + Tailwind CSS v4 + Lucide Icons + Canvas Confetti.
- **Backend:** Node.js + Express 5.
- **Database:** SQLite3 (`server/lifeitup.db`) with persistent tables for assessments, leads, application settings, and integration audit logs.
- **Integrations:** CRM webhook dispatcher, Nodemailer SMTP service, WhatsApp API/webhook dispatcher.

---

## 🚀 How to Run Locally

### 1. Start Server & App (Single Command)
```bash
npm start
```
The server will start on port `5000` (serving both the API and the built frontend at `http://localhost:5000`).

### 2. Development Mode
To run with live reloading:
```bash
# Terminal 1: Backend
npm run dev:server

# Terminal 2: Frontend
npm run dev:client
```
The frontend dev server runs on `http://localhost:3000` and automatically proxies `/api` requests to port `5000`.

### 3. Build Frontend
```bash
npm run build
```

---

## 🛡️ Admin & Automation Portal

Click the discreet shield icon in the bottom-right corner of the application:
1. **Captured Leads Table:** View all submissions in real-time with scores, bands, answers, and contact info.
2. **Export to CSV:** One-click download of all lead data (`lifeitup_leads.csv`).
3. **Integration Settings:** Configure your CRM Webhook (Make.com, Zapier, Interakt, MailerLite), SMTP email credentials, and WhatsApp Webhook.
4. **Live Integration Testing:** Dedicated `Test CRM Webhook`, `Test Email SMTP`, and `Test WhatsApp` buttons with live response inspectability.
5. **Delivery Logs:** Audit log showing status and payload responses for all dispatch attempts.
