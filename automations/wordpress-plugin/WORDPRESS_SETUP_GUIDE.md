# WordPress Integration Guide — LifeITUp 2-Minute Wellbeing Assessment

Is guide me LifeITUp Assessment tool ko WordPress website par 100% live chalane ke 3 aasan tareeqe diye gaye hain. Teeno tareeqo me saari APIs (Mailchimp, Google Sheets, WhatsApp, Gmail SMTP) bina kisi rukawat ke chalengi.

---

## 🚀 Tareeqa 1: Official WordPress Plugin (Sabse Aasan & Recommended)

Humne aapke liye ek ready-to-use WordPress plugin bana kar `.zip` format me ready kar diya hai:
📁 **File:** `automations/wordpress-plugin/lifeitup-assessment.zip`

### Kaise Install Karein:
1. **WordPress Dashboard** (`wp-admin`) me login karein.
2. Left menu me **Plugins** &rarr; **Add New Plugin** par click karein.
3. Top par **Upload Plugin** button par click karein.
4. **`lifeitup-assessment.zip`** file select karke **Install Now** par click karein, aur phir **Activate Plugin** dabayein.
5. Ab **Pages** &rarr; **Add New Page** me jayein:
   - Page Title: `2-Minute Wellbeing Check` (URL banega: `yoursite.com/wellbeing-check`)
   - Page builder (Gutenberg / Elementor) me **Shortcode** block dalein aur likhein:
     ```
     [lifeitup_assessment]
     ```
6. **Publish** kar dein! Poora assessment aapke WordPress page ke andar natively display hone lagega.

---

## 🎨 Tareeqa 2: Elementor / Page Builder me Custom HTML (Bina Plugin ke)

Agar aap plugin install nahi karna chahte, to kisi bhi WordPress page par Elementor / WPBakery / Divi me **Custom HTML** block le kar ye code paste kar dein:

```html
<div style="width: 100%; max-width: 100%; margin: 0 auto; overflow: hidden; border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.25);">
  <iframe 
    id="lifeitup-assessment-frame"
    src="https://lifeitup.vercel.app" 
    width="100%" 
    height="950px" 
    style="border: none; width: 100%; min-height: 950px; display: block;" 
    allow="autoplay; clipboard-write; encrypted-media; fullscreen" 
    loading="lazy">
  </iframe>
</div>

<script>
  window.addEventListener('resize', function() {
    var frame = document.getElementById('lifeitup-assessment-frame');
    if (frame) {
      frame.style.minHeight = (window.innerWidth < 768) ? '1100px' : '950px';
    }
  });
</script>
```

---

## 🌐 Tareeqa 3: Subdomain Setup (SaaS Brand Experience)

Agar aap chahte hain ki assessment ek dedicated clean URL par khule, jaise:
👉 **`check.lifeitupworldwide.com`** ya **`assessment.lifeitupworldwide.com`**

### Kaise Karein:
1. Vercel dashboard me jayein &rarr; **Lifeitup** project open karein.
2. **Settings** &rarr; **Domains** par click karein.
3. Apna subdomain enter karein: `assessment.lifeitupworldwide.com`.
4. Apne domain DNS provider (GoDaddy / Cloudflare / Hostinger) me ek **CNAME record** add karein:
   - Name: `assessment`
   - Target: `cname.vercel-dns.com`
5. Phir aap WordPress ke main header menu me ek button/link add kar sakte hain: **"Take 2-Min Assessment"** &rarr; jo is link par redirect karega!
