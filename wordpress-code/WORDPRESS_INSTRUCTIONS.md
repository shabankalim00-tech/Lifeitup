# LifeITUp Assessment — Pure WordPress Code (No Plugins)

Ye file un users ke liye hai jo **bina kisi plugin ya iframe ke**, direct raw code apne WordPress me daalna chahte hain.

---

## 📄 Main Code File
📂 **`wordpress-code/LifeITUp-Standalone-Code.html`**

Is file me **poora HTML, CSS aur JavaScript** ek hi file me pack kiya gaya hai:
- Sabhi 12 WHO-aligned wellness questions
- 4 Options (Never, Sometimes, Often, Always)
- Live Progress bar aur Pillar badges
- Luxury Emerald Green Dark Theme
- Form: Full Name, Institution/College, WhatsApp Phone, Email, Consent
- Automatic backend API dispatch (Mailchimp, Google Sheet, WhatsApp AiSensy, Gmail SMTP)
- Final Instant Score & Report Screen with PDF confirmation

---

## 🛠️ WordPress me Kaise Paste Karein (Sirf 2 Minute)

### Tareeqa 1: Gutenberg Default Editor me (Direct Page)
1. **WordPress Admin** me jayein &rarr; **Pages** &rarr; **Add New Page**.
2. Page ka title dein (jaise: `2-Minute Holistic Wellbeing Check`).
3. Plus `(+)` icon par click karke search karein **"Custom HTML"** block.
4. `wordpress-code/LifeITUp-Standalone-Code.html` ka **poora code copy karein aur wahan paste kar dein**.
5. Top-right me **Publish** button daba dein!

---

### Tareeqa 2: Elementor Page Builder me
1. WordPress me new page banayein aur **Edit with Elementor** par click karein.
2. Left sidebar se **"HTML"** widget ko page me drag karein.
3. `wordpress-code/LifeITUp-Standalone-Code.html` ka code HTML box me paste karein.
4. Page Layout ko **Elementor Full Width** ya default set karke **Publish** kar dein.

---

### Tareeqa 3: Theme Template File (`page-wellbeing-check.php`)
Agar aap apne WordPress theme ke andar direct file upload karna chahte hain:
1. `wordpress-code/page-wellbeing-check.php` aur `wordpress-code/LifeITUp-Standalone-Code.html` dono ko apne active theme folder me daalein:
   `wp-content/themes/<your-theme>/`
2. WordPress Admin me **Pages &rarr; Add New** karein.
3. Right sidebar me **Template** dropdown se select karein: **"LifeITUp Wellbeing Assessment"**.
4. Publish kar dein!
