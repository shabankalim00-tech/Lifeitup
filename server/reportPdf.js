const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

const PILLAR_CONFIG = [
  { id: 'soul', num: '01', name: 'SOUL — Purpose & Meaning', qIds: [1, 2] },
  { id: 'mind', num: '02', name: 'MIND — Emotional Balance & Clarity', qIds: [3, 4] },
  { id: 'body', num: '03', name: 'BODY — Energy & Physical Wellbeing', qIds: [5, 6] },
  { id: 'career', num: '04', name: 'CAREER — Growth & Performance', qIds: [7, 8] },
  { id: 'environment', num: '05', name: 'ENVIRONMENT — Surroundings & Relationships', qIds: [9, 10] },
  { id: 'contribution', num: '06', name: 'CONTRIBUTION — Impact & Service', qIds: [11, 12] }
];

const DETAILED_BAND_CONTENT = {
  low: {
    zone: 'LOW',
    title: 'A RESET MAY BE NEEDED',
    color: '#dc2626',
    bgColor: '#fef2f2',
    borderColor: '#fca5a5',
    headline: 'Your responses suggest that several areas of your life may currently be competing for your energy, attention and wellbeing.',
    reassurance: "This doesn't mean something is wrong with you. It may mean that your current demands are taking more from you than you are consistently able to restore. The goal is not to change everything at once. It is to understand where your wellbeing needs attention first.",
    firstMoveRule: "Don't try to change everything at once.",
    firstMoveAdvice: 'Identify your lowest-scoring pillar and choose one behaviour to improve consistently.',
    pathwaySteps: ['RESET', 'REBUILD', 'REPEAT'],
    pathwayDescription: 'Your full pathway identifies: your strongest pillar • your priority growth area • your first recommended actions.',
    evidenceNote: 'The World Health Organization describes mental wellbeing as involving the ability to cope with normal stresses, realise one\'s abilities, learn and work effectively, and contribute to the community.',
    pillars: {
      soul: {
        obs: 'You may benefit from reconnecting your daily actions with what genuinely matters to you.',
        wayForward: 'Ask yourself: "What truly matters to me right now? Does the way I spend my time reflect it?" Create space for meaningful goals.'
      },
      mind: {
        obs: 'Stress, emotional load or difficulty maintaining focus may be consuming more mental bandwidth than you\'d like.',
        wayForward: 'Build a simple reset routine: PAUSE -> BREATHE -> PRIORITISE -> ACT. Create regular recovery time and reduce digital clutter.'
      },
      body: {
        obs: 'Your daily recovery, movement, sleep and other health-supporting habits may need greater consistency.',
        wayForward: 'Return to the fundamentals: SLEEP -> MOVE -> NOURISH -> RECOVER. Choose one health-supporting behaviour and make it consistent.'
      },
      career: {
        obs: 'Your professional demands may not always be translating into clarity, confidence or sustainable performance.',
        wayForward: 'Identify one capability that could make your work and life better: LEARN -> PRACTISE -> APPLY -> REVIEW.'
      },
      environment: {
        obs: 'Your physical, digital and social environments can either restore your energy or continuously drain it.',
        wayForward: 'Review: SPACE -> SCREEN -> PEOPLE. Identify what supports you and where stronger boundaries may be needed.'
      },
      contribution: {
        obs: 'Meaningful contribution can strengthen connection, purpose and a sense of significance.',
        wayForward: 'Find one meaningful way to: HELP -> SUPPORT -> SERVE -> CREATE IMPACT.'
      }
    }
  },
  moderate: {
    zone: 'MODERATE',
    title: 'YOU HAVE A FOUNDATION. NOW FIND THE GAP.',
    color: '#d97706',
    bgColor: '#fffbeb',
    borderColor: '#fcd34d',
    headline: 'Your responses suggest that some areas of life are working reasonably well, while others may be quietly limiting your energy, wellbeing or performance.',
    reassurance: "This is often where small, consistent changes can create meaningful momentum. You don't need to improve everything. You need to identify where the next improvement matters most.",
    firstMoveRule: "Don't improve everything. Find the one pillar with the biggest gap.",
    firstMoveAdvice: 'Then ask: "What one behaviour, if improved consistently, would make the biggest difference?"',
    pathwaySteps: ['IDENTIFY', 'FOCUS', 'BUILD'],
    pathwayDescription: "WHO's health-promoting approach emphasises healthy behaviours, supportive environments and connection with others. Addressing both individual wellbeing and work environment creates sustainable progress.",
    evidenceNote: "Evidence note: WHO's health-promoting approach emphasises self-care, healthy habits, supportive environments and connection with others.",
    pillars: {
      soul: {
        obs: 'You may have a sense of purpose, but greater alignment between values and everyday actions could strengthen it.',
        wayForward: 'Ask: "What matters most to me—and am I making enough time for it?" Turn one important value into one everyday behaviour.'
      },
      mind: {
        obs: 'You may be functioning well while still carrying stress, distraction or emotional load that deserves attention.',
        wayForward: 'RECOGNISE -> REGULATE -> REFOCUS. Notice your stress patterns before they become overwhelming and anchor 5-minute pauses.'
      },
      body: {
        obs: 'Some healthy habits appear present, but consistency may be the opportunity.',
        wayForward: 'Choose your biggest opportunity: SLEEP • MOVEMENT • NUTRITION • RECOVERY. Then make that one change sustainable.'
      },
      career: {
        obs: 'You may be progressing, while clarity, confidence or meaningful growth could still be strengthened.',
        wayForward: 'Identify one capability that would improve your personal or professional life. Then: LEARN -> PRACTISE -> APPLY -> REVIEW.'
      },
      environment: {
        obs: 'Your surroundings and relationships may support you in some areas while draining attention or energy in others.',
        wayForward: 'Ask: "What should I do more of, less of or differently?" Strengthen supportive relationships and establish healthier boundaries.'
      },
      contribution: {
        obs: 'There may be opportunities to connect your work and everyday life with a stronger sense of positive impact.',
        wayForward: 'Ask: "Who benefits from what I do?" Then find one additional way to create value for others.'
      }
    }
  },
  stable: {
    zone: 'STABLE',
    title: "YOU'VE BUILT A FOUNDATION. WHAT'S HOLDING BACK YOUR NEXT LEVEL?",
    color: '#059669',
    bgColor: '#f0fdf4',
    borderColor: '#86efac',
    headline: 'Your responses suggest relatively positive alignment across several dimensions of life. You have built a foundation.',
    reassurance: "A good overall score can sometimes hide one neglected area. That may be where your next opportunity lies.",
    firstMoveRule: "Don't chase more. Identify what's missing.",
    firstMoveAdvice: 'Look for the one pillar significantly below your strongest pillar. That may be your: WELLBEING OPPORTUNITY GAP.',
    pathwaySteps: ['REFINE', 'STRENGTHEN', 'SUSTAIN'],
    pathwayDescription: "OECD capabilities framework: Focus on emotional regulation, task performance, and social connection. Strengthening key capabilities makes long-term success sustainable.",
    evidenceNote: "Evidence note: WHO describes mental wellbeing as supporting people's ability to realise their abilities, work effectively and contribute to community.",
    pillars: {
      soul: {
        obs: 'Your sense of meaning and values provides a solid foundation. The opportunity is deeper alignment in everyday choices.',
        wayForward: 'Move from: KNOWING YOUR VALUES -> LIVING YOUR VALUES. Ask: "Are my everyday choices aligned with what matters most to me?"'
      },
      mind: {
        obs: 'You appear to have reasonable emotional and mental resources, while protecting focus and managing pressure remains important.',
        wayForward: 'Build proactive recovery: FOCUS -> PAUSE -> RECOVER -> REFLECT. Don\'t wait for overload before recovering.'
      },
      body: {
        obs: 'Your physical wellbeing habits provide a foundation—consistency is what makes healthy behaviours sustainable.',
        wayForward: 'Protect sleep, movement, nutrition and recovery even when demands increase. Your body should support your ambitions.'
      },
      career: {
        obs: 'Your professional life is providing direction and progress. The next question is whether your success is also sustainable and meaningful.',
        wayForward: 'Identify your next capability, not merely your next target: LEARN -> PRACTISE -> APPLY -> REVIEW.'
      },
      environment: {
        obs: 'Your surroundings and relationships can either reinforce your progress or quietly undermine it.',
        wayForward: 'Protect the people, spaces and routines that restore you. Set boundaries around those that consistently drain you.'
      },
      contribution: {
        obs: 'Connecting achievement with meaningful contribution adds another vital dimension to wellbeing.',
        wayForward: 'Ask: "Who benefits from the work I do?" Then explore how you can create greater positive impact.'
      }
    }
  },
  balanced: {
    zone: 'BALANCED',
    title: 'YOUR FOUNDATION IS STRONG. NOW PROTECT IT.',
    color: '#0284c7',
    bgColor: '#f0f9ff',
    borderColor: '#7dd3fc',
    headline: 'Your responses suggest consistent positive alignment across the six areas assessed. You appear to have built a strong wellbeing foundation.',
    reassurance: "Being healthy is not a destination. The real challenge is maintaining it when work intensifies, circumstances change and life becomes demanding.",
    firstMoveRule: "Don't become complacent.",
    firstMoveAdvice: 'Ask: "What would make my life healthier, more meaningful and more sustainable—not simply more successful?"',
    pathwaySteps: ['SUSTAIN', 'DEEPEN', 'CONTRIBUTE'],
    pathwayDescription: "WHO whole-person wellbeing approach: Health is sustained through healthy behaviours, supportive relationships, positive environments, and community connection.",
    evidenceNote: "Evidence note: WHO whole-person framework recognizes that health is sustained through healthy habits, supportive relationships and positive environments.",
    pillars: {
      soul: {
        obs: 'Purpose and values appear to be relatively well integrated into your everyday life.',
        wayForward: 'Keep asking: "Is my definition of success still aligned with what truly matters to me?" Anchor everyday choices to long-term fulfillment.'
      },
      mind: {
        obs: 'Your responses suggest useful emotional balance and mental clarity. Protecting recovery and focus remains important.',
        wayForward: 'Build intentional rhythms: FOCUS -> RECOVER -> REFLECT -> RESET. Don\'t wait for burnout to remind you to slow down.'
      },
      body: {
        obs: 'You appear to have supportive physical wellbeing habits.',
        wayForward: 'Treat sleep, movement, nutrition and recovery as assets to protect, not things to sacrifice whenever demands increase.'
      },
      career: {
        obs: 'Your work appears to provide a positive foundation for growth and performance.',
        wayForward: 'Continue developing—ask: "Will my next achievement also make my life more meaningful and sustainable?"'
      },
      environment: {
        obs: 'Your surroundings and relationships appear broadly supportive of your wellbeing.',
        wayForward: 'Protect those relationships and environments and maintain healthy boundaries as responsibilities grow.'
      },
      contribution: {
        obs: 'You appear connected to meaningful impact beyond yourself—an important dimension of a holistic life.',
        wayForward: 'Move from: ACHIEVEMENT -> CONTRIBUTION -> LEGACY. Ask what you can leave better than you found it.'
      }
    }
  }
};

/**
 * Generate clean, modern, attractive, executive 2-Page Assessment Report PDF
 * Styled with LifeITUp Luxury Botanical Theme (#FAF6EE cream, #06281e emerald, #D4AF37 gold).
 * Features visible central watermark emblem through translucent glass cards, normal 9pt body text, and zero text-overlap.
 */
function generateReportPdf(leadData, scoreBand) {
  return new Promise((resolve, reject) => {
    try {
      // Ensure score is valid integer between 0 and 48
      let verifiedScore = Number(leadData.score);
      if (isNaN(verifiedScore) || verifiedScore > 48 || verifiedScore < 0) {
        if (leadData.answers_json) {
          try {
            const ansObj = typeof leadData.answers_json === 'string' ? JSON.parse(leadData.answers_json) : leadData.answers_json;
            verifiedScore = Object.values(ansObj).reduce((sum, v) => sum + (Number(v) || 0), 0);
          } catch (_) {
            verifiedScore = 24;
          }
        } else {
          verifiedScore = 24;
        }
      }

      const bandKey = (scoreBand && scoreBand.id) || (verifiedScore <= 20 ? 'low' : verifiedScore <= 32 ? 'moderate' : verifiedScore <= 40 ? 'stable' : 'balanced');
      const bandContent = DETAILED_BAND_CONTENT[bandKey] || DETAILED_BAND_CONTENT.moderate;

      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 20, bottom: 0, left: 36, right: 36 },
        autoFirstPage: true,
        bufferPages: true
      });

      const buffers = [];
      doc.on('data', chunk => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', err => reject(err));

      // Brand Palette matching LifeITUp website theme
      const bgCream = '#FAF6EE';
      const borderWarm = '#D8CEBD';
      const borderInner = '#E8E2D5';
      const royalGold = '#D4AF37';
      const primaryEmerald = '#06281e';
      const forestJade = '#1A2E24';
      const brandGreen = '#059669';
      const textMuted = '#4B5563';

      const pageWidth = 595.28;
      const pageHeight = 841.89;
      const contentWidth = pageWidth - 72; // 523.28 pt

      const logoPath = path.join(__dirname, 'logo-emblem.png');
      const hasLogo = fs.existsSync(logoPath);

      // Helper: Render full-page luxury frame & clearly visible central watermark
      function renderPageBackgroundAndWatermark() {
        // 1. Botanical Cream Background
        doc.rect(0, 0, pageWidth, pageHeight).fill(bgCream);

        // 2. Royal Gold & Warm Cream Double Perimeter Frame
        doc.rect(13, 13, pageWidth - 26, pageHeight - 26).lineWidth(0.8).strokeColor(royalGold).stroke();
        doc.rect(16, 16, pageWidth - 32, pageHeight - 32).lineWidth(0.4).strokeColor(borderInner).stroke();

        // Corner luxury decorative accents
        const cornerSize = 8;
        // Top-left
        doc.rect(13, 13, cornerSize, 1.2).fill(royalGold);
        doc.rect(13, 13, 1.2, cornerSize).fill(royalGold);
        // Top-right
        doc.rect(pageWidth - 13 - cornerSize, 13, cornerSize, 1.2).fill(royalGold);
        doc.rect(pageWidth - 14.2, 13, 1.2, cornerSize).fill(royalGold);
        // Bottom-left
        doc.rect(13, pageHeight - 14.2, cornerSize, 1.2).fill(royalGold);
        doc.rect(13, pageHeight - 13 - cornerSize, 1.2, cornerSize).fill(royalGold);
        // Bottom-right
        doc.rect(pageWidth - 13 - cornerSize, pageHeight - 14.2, cornerSize, 1.2).fill(royalGold);
        doc.rect(pageWidth - 14.2, pageHeight - 13 - cornerSize, 1.2, cornerSize).fill(royalGold);

        // 3. Central Brand Watermark Emblem (Distinct & Visible through translucent cards)
        if (hasLogo) {
          const wmSize = 340;
          const wmX = (pageWidth - wmSize) / 2;
          const wmY = (pageHeight - wmSize) / 2;
          doc.save();
          doc.opacity(0.13); // Clearly visible, elegant watermark
          doc.image(logoPath, wmX, wmY, { width: wmSize, height: wmSize });
          doc.restore();
        }
      }

      // ==========================================
      // PAGE 1: EXECUTIVE ASSESSMENT & PILLARS 1-3
      // ==========================================
      renderPageBackgroundAndWatermark();

      // 1. Header Bar (Executive Emerald with Gold Accent Line)
      doc.rect(36, 18, contentWidth, 48).fill(primaryEmerald);
      doc.rect(36, 64.5, contentWidth, 1.5).fill(royalGold);

      if (hasLogo) {
        doc.image(logoPath, 46, 22, { width: 40, height: 40 });
        doc.fillColor('#34d399').fontSize(14).font('Helvetica-Bold').text('LifeITup WorldWide', 94, 26, { characterSpacing: 1.2, lineBreak: false });
        doc.fillColor('#a7f3d0').fontSize(7.5).font('Helvetica').text('EMPOWERING YOUR HOLISTIC SUCCESS  •  HOLISTIC ASSESSMENT REPORT', 94, 45, { characterSpacing: 0.8, lineBreak: false });
      } else {
        doc.fillColor('#34d399').fontSize(15).font('Helvetica-Bold').text('LifeITup WorldWide', 50, 26, { characterSpacing: 1.2, lineBreak: false });
        doc.fillColor('#a7f3d0').fontSize(7.5).font('Helvetica').text('EMPOWERING YOUR HOLISTIC SUCCESS  •  HOLISTIC ASSESSMENT REPORT', 50, 45, { characterSpacing: 0.8, lineBreak: false });
      }

      // Right-aligned header metadata
      const todayStr = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
      doc.fillColor('#ffffff').fontSize(8.5).font('Helvetica-Bold').text(`Date: ${todayStr}`, 410, 28, { width: 135, align: 'right', lineBreak: false });
      doc.fillColor('#ffffff').fontSize(8.5).font('Helvetica-Bold').text(`Participant: ${leadData.full_name || 'Candidate'}`, 340, 44, { width: 205, align: 'right', lineBreak: false });

      // Subtitle line (WHO alignment banner)
      doc.save();
      doc.opacity(0.55);
      doc.roundedRect(36, 69, contentWidth, 16, 2).fill('#F5EFE6');
      doc.restore();
      doc.roundedRect(36, 69, contentWidth, 16, 2).lineWidth(0.5).strokeColor(borderWarm).stroke();
      doc.fillColor(textMuted).fontSize(7.5).font('Helvetica').text('Aligned with WHO Multidimensional Wellbeing Guidelines  •  Confidential Assessment & Pathway', 46, 73, { lineBreak: false });

      // 2. Score & Diagnostic Summary Hero Card (Translucent Glass - Zero Overlap)
      let currentY = 90;
      const heroHeight = 84;

      // Hero Container with 32% white glass tint so watermark is clearly visible
      doc.save();
      doc.opacity(0.32);
      doc.roundedRect(36, currentY, contentWidth, heroHeight, 5).fill('#FFFFFF');
      doc.restore();
      doc.roundedRect(36, currentY, contentWidth, heroHeight, 5).lineWidth(1.2).strokeColor(bandContent.borderColor).stroke();

      // Score dial block (Left) - Executive Deep Emerald with Gold Trims
      doc.roundedRect(48, currentY + 9, 96, 66, 4).fill(primaryEmerald);
      doc.rect(60, currentY + 10, 72, 1).fill(royalGold); // Top Gold Trim
      doc.rect(60, currentY + 73, 72, 1.2).fill(royalGold); // Bottom Gold Trim
      doc.fillColor('#a7f3d0').fontSize(7).font('Helvetica-Bold').text('OVERALL SCORE', 48, currentY + 16, { width: 96, align: 'center', lineBreak: false });
      doc.fillColor('#ffffff').fontSize(23).font('Helvetica-Bold').text(String(verifiedScore), 48, currentY + 26, { width: 96, align: 'center', lineBreak: false });
      doc.fillColor('#6ee7b7').fontSize(7.5).font('Helvetica').text('OUT OF 48', 48, currentY + 53, { width: 96, align: 'center', lineBreak: false });

      // Diagnosis text block (Right) - Zero Collision
      const diagX = 158;
      const textAvailableWidth = contentWidth - (diagX - 36) - 14; // ~387 pt

      // Status pill badge
      doc.roundedRect(diagX, currentY + 9, 110, 16, 3).fill(bandContent.color);
      doc.fillColor('#ffffff').fontSize(7.5).font('Helvetica-Bold').text(`STATUS: ${bandContent.zone}`, diagX + 8, currentY + 13, { lineBreak: false });

      // Band Title with dedicated vertical space
      const titleY = currentY + 29;
      doc.fillColor(forestJade).fontSize(9.5).font('Helvetica-Bold').text(bandContent.title, diagX, titleY, { width: textAvailableWidth, lineGap: 1.2 });
      const titleHeight = doc.heightOfString(bandContent.title, { width: textAvailableWidth, lineGap: 1.2 });

      // Band Headline dynamically placed strictly below title with clean 4pt gap
      const headlineY = titleY + titleHeight + 4;
      doc.fillColor(textMuted).fontSize(8.5).font('Helvetica').text(bandContent.headline, diagX, headlineY, { width: textAvailableWidth, lineGap: 1.2, height: 32 });

      // 3. Section Heading: YOUR 6-PILLAR WELLNESS SNAPSHOT
      currentY += heroHeight + 10;
      doc.fillColor(primaryEmerald).fontSize(10.5).font('Helvetica-Bold').text('YOUR 6-PILLAR WELLNESS SNAPSHOT', 36, currentY, { lineBreak: false });
      doc.fillColor(textMuted).fontSize(8).font('Helvetica').text('Comprehensive qualitative review across the core dimensions of holistic living:', 36, currentY + 13, { lineBreak: false });

      currentY += 26;

      // Render Pillars 1, 2, 3 on Page 1 (Using Normal 9pt Body Text & Glass Effect)
      const page1Pillars = PILLAR_CONFIG.slice(0, 3);
      page1Pillars.forEach((p) => {
        const pillarData = bandContent.pillars[p.id];
        const cardHeight = 152;

        // Card Base: 28% white glass tint so background watermark is clearly visible
        doc.save();
        doc.opacity(0.28);
        doc.roundedRect(36, currentY, contentWidth, cardHeight, 5).fill('#FFFFFF');
        doc.restore();
        doc.roundedRect(36, currentY, contentWidth, cardHeight, 5).lineWidth(0.8).strokeColor(borderWarm).stroke();

        // Pillar Header Banner (Executive Deep Emerald with Royal Gold Pinstripe)
        doc.rect(36, currentY, contentWidth, 21).fill(primaryEmerald);
        doc.rect(36, currentY + 20, contentWidth, 1).fill(royalGold);

        // Circular/Pill Number Badge
        doc.roundedRect(44, currentY + 3.5, 22, 14, 2).fill('#044633');
        doc.fillColor('#34d399').fontSize(7.5).font('Helvetica-Bold').text(p.num, 44, currentY + 6.5, { width: 22, align: 'center', lineBreak: false });

        // Pillar Name
        doc.fillColor('#ffffff').fontSize(9).font('Helvetica-Bold').text(p.name, 72, currentY + 6, { lineBreak: false });

        // Observation (Normal 9pt Clean Typography)
        doc.fillColor('#047857').fontSize(8).font('Helvetica-Bold').text('ASSESSMENT REVELATION:', 48, currentY + 28, { characterSpacing: 0.4, lineBreak: false });
        doc.fillColor(forestJade).fontSize(9).font('Helvetica').text(pillarData.obs, 48, currentY + 39, { width: contentWidth - 24, lineGap: 2.2, height: 32 });

        // Way forward block (Translucent Mint Glass + Emerald Accent Bar)
        const wayY = currentY + 76;
        const wayHeight = 66;

        doc.save();
        doc.opacity(0.38);
        doc.roundedRect(46, wayY, contentWidth - 20, wayHeight, 4).fill('#ECFDF5');
        doc.restore();
        doc.roundedRect(46, wayY, contentWidth - 20, wayHeight, 4).lineWidth(0.7).strokeColor('#A7F3D0').stroke();
        doc.rect(46, wayY, 3.5, wayHeight).fill(brandGreen); // Left Accent Bar

        doc.fillColor('#065f46').fontSize(7.5).font('Helvetica-Bold').text('WAY FORWARD • STRATEGIC ACTION:', 56, wayY + 7, { characterSpacing: 0.3, lineBreak: false });
        doc.fillColor(forestJade).fontSize(9).font('Helvetica').text(pillarData.wayForward, 56, wayY + 19, { width: contentWidth - 40, lineGap: 2.2, height: 42 });

        currentY += cardHeight + 8;
      });

      // Page 1 Footer with Gold Divider
      doc.rect(36, 815, contentWidth, 0.6).fill(royalGold);
      doc.fillColor(textMuted).fontSize(7.5).font('Helvetica').text('LifeITup WorldWide  •  Page 1 of 2  •  Confidential Holistic Assessment  •  www.lifeitupworldwide.com', 36, 822, { width: contentWidth, align: 'center', lineBreak: false });

      // ==========================================
      // PAGE 2: PILLARS 4-6 & ACTION PATHWAY
      // ==========================================
      doc.addPage();
      renderPageBackgroundAndWatermark();

      // Top Mini Header (Executive Emerald with Gold Accent Line)
      doc.rect(36, 18, contentWidth, 30).fill(primaryEmerald);
      doc.rect(36, 47, contentWidth, 1).fill(royalGold);

      if (hasLogo) {
        doc.image(logoPath, 46, 21, { width: 24, height: 24 });
        doc.fillColor('#34d399').fontSize(10.5).font('Helvetica-Bold').text('LifeITup Wellness Assessment', 76, 24, { lineBreak: false });
        doc.fillColor('#ffffff').fontSize(7.5).font('Helvetica').text('Section 2: Pillars 4–6, Strategy & Holistic Action Pathway', 76, 37, { lineBreak: false });
      } else {
        doc.fillColor('#34d399').fontSize(10.5).font('Helvetica-Bold').text('LifeITup Wellness Assessment', 48, 25, { lineBreak: false });
        doc.fillColor('#ffffff').fontSize(7.5).font('Helvetica').text('Section 2: Pillars 4–6, Strategy & Holistic Action Pathway', 48, 38, { lineBreak: false });
      }

      currentY = 56;

      // Render Pillars 4, 5, 6 on Page 2 (Normal 9pt Text & Visible Watermark)
      const page2Pillars = PILLAR_CONFIG.slice(3, 6);
      page2Pillars.forEach((p) => {
        const pillarData = bandContent.pillars[p.id];
        const cardHeight = 126;

        // Card Base: 28% white glass tint
        doc.save();
        doc.opacity(0.28);
        doc.roundedRect(36, currentY, contentWidth, cardHeight, 5).fill('#FFFFFF');
        doc.restore();
        doc.roundedRect(36, currentY, contentWidth, cardHeight, 5).lineWidth(0.8).strokeColor(borderWarm).stroke();

        // Pillar Header
        doc.rect(36, currentY, contentWidth, 20).fill(primaryEmerald);
        doc.rect(36, currentY + 19, contentWidth, 1).fill(royalGold);

        // Number Badge
        doc.roundedRect(44, currentY + 3, 22, 14, 2).fill('#044633');
        doc.fillColor('#34d399').fontSize(7.5).font('Helvetica-Bold').text(p.num, 44, currentY + 6, { width: 22, align: 'center', lineBreak: false });

        doc.fillColor('#ffffff').fontSize(8.5).font('Helvetica-Bold').text(p.name, 72, currentY + 5.5, { lineBreak: false });

        // Observation (Normal 9pt)
        doc.fillColor('#047857').fontSize(7.5).font('Helvetica-Bold').text('ASSESSMENT REVELATION:', 48, currentY + 25, { characterSpacing: 0.3, lineBreak: false });
        doc.fillColor(forestJade).fontSize(9).font('Helvetica').text(pillarData.obs, 48, currentY + 36, { width: contentWidth - 24, lineGap: 2, height: 26 });

        // Way forward block (Translucent Mint Glass)
        const wayY = currentY + 66;
        const wayHeight = 54;

        doc.save();
        doc.opacity(0.38);
        doc.roundedRect(46, wayY, contentWidth - 20, wayHeight, 4).fill('#ECFDF5');
        doc.restore();
        doc.roundedRect(46, wayY, contentWidth - 20, wayHeight, 4).lineWidth(0.7).strokeColor('#A7F3D0').stroke();
        doc.rect(46, wayY, 3.5, wayHeight).fill(brandGreen);

        doc.fillColor('#065f46').fontSize(7.5).font('Helvetica-Bold').text('WAY FORWARD • STRATEGIC ACTION:', 56, wayY + 6, { characterSpacing: 0.3, lineBreak: false });
        doc.fillColor(forestJade).fontSize(9).font('Helvetica').text(pillarData.wayForward, 56, wayY + 17, { width: contentWidth - 40, lineGap: 2, height: 32 });

        currentY += cardHeight + 7;
      });

      // 4. YOUR FIRST STRATEGIC MOVE BOX (Translucent Mint Glass + Emerald Accent)
      currentY += 2;
      const firstMoveHeight = 62;

      doc.save();
      doc.opacity(0.42);
      doc.roundedRect(36, currentY, contentWidth, firstMoveHeight, 4).fill('#ECFDF5');
      doc.restore();
      doc.roundedRect(36, currentY, contentWidth, firstMoveHeight, 4).lineWidth(1.2).strokeColor(brandGreen).stroke();
      doc.rect(36, currentY, 4, firstMoveHeight).fill(brandGreen);

      doc.fillColor('#065f46').fontSize(8.5).font('Helvetica-Bold').text('YOUR FIRST STRATEGIC MOVE', 48, currentY + 8, { lineBreak: false });
      doc.fillColor(forestJade).fontSize(10).font('Helvetica-Bold').text(bandContent.firstMoveRule, 48, currentY + 21, { lineBreak: false });
      doc.fillColor(forestJade).fontSize(9).font('Helvetica').text(bandContent.firstMoveAdvice, 48, currentY + 35, { width: contentWidth - 24, lineGap: 1.8, height: 24 });

      // 5. YOUR PERSONALISED PATHWAY (Translucent White Glass)
      currentY += firstMoveHeight + 7;
      const pathwayHeight = 74;

      doc.save();
      doc.opacity(0.32);
      doc.roundedRect(36, currentY, contentWidth, pathwayHeight, 4).fill('#FFFFFF');
      doc.restore();
      doc.roundedRect(36, currentY, contentWidth, pathwayHeight, 4).lineWidth(0.8).strokeColor(borderWarm).stroke();

      doc.fillColor(primaryEmerald).fontSize(9).font('Helvetica-Bold').text('YOUR PERSONALISED PATHWAY', 48, currentY + 8, { lineBreak: false });

      // Step badges with executive dark emerald and royal gold trim
      const stepWidth = 146;
      bandContent.pathwaySteps.forEach((step, sIdx) => {
        const stepX = 48 + (sIdx * (stepWidth + 14));
        doc.roundedRect(stepX, currentY + 22, stepWidth, 20, 3).lineWidth(0.8).strokeColor(royalGold).fillAndStroke(primaryEmerald, royalGold);
        doc.fillColor('#34d399').fontSize(8.5).font('Helvetica-Bold').text(`STEP ${sIdx + 1}: ${step}`, stepX, currentY + 27, { width: stepWidth, align: 'center', lineBreak: false });
      });

      doc.fillColor(textMuted).fontSize(8).font('Helvetica').text(bandContent.pathwayDescription, 48, currentY + 48, { width: contentWidth - 24, lineGap: 1.2, height: 22 });

      // 6. Evidence & Framework Alignment Box
      currentY += pathwayHeight + 7;
      const evidenceHeight = 36;

      doc.save();
      doc.opacity(0.45);
      doc.roundedRect(36, currentY, contentWidth, evidenceHeight, 3).fill('#F6F3EB');
      doc.restore();
      doc.roundedRect(36, currentY, contentWidth, evidenceHeight, 3).lineWidth(0.7).strokeColor(borderWarm).stroke();

      doc.fillColor(primaryEmerald).fontSize(7.5).font('Helvetica-Bold').text('EVIDENCE & FRAMEWORK ALIGNMENT (WHO • UNICEF • OECD • NEP 2020 • NCF-SE 2023)', 46, currentY + 5, { lineBreak: false });
      doc.fillColor(textMuted).fontSize(7).font('Helvetica').text(bandContent.evidenceNote, 46, currentY + 16, { width: contentWidth - 20, lineGap: 1, height: 16 });

      // 7. LifeITup Worldwide Signature Strip
      currentY += evidenceHeight + 7;
      const signatureHeight = 36;
      doc.roundedRect(36, currentY, contentWidth, signatureHeight, 3).fill(primaryEmerald);
      doc.rect(36, currentY, contentWidth, 1.2).fill(royalGold); // Top Gold Line

      // Left block: Motivational anchor
      doc.fillColor('#6ee7b7').fontSize(8.5).font('Helvetica-Bold').text('YOUR SCORE IS ONLY THE BEGINNING.', 48, currentY + 7, { lineBreak: false });
      doc.fillColor('#ffffff').fontSize(7.5).font('Helvetica').text('Real transformation begins with your next consistent step.', 48, currentY + 20, { width: 260, lineBreak: false });

      // Right block: Brand and contact info with dedicated bounding box
      doc.fillColor('#a7f3d0').fontSize(8).font('Helvetica-Bold').text('LifeITup WorldWide', 310, currentY + 7, { width: 235, align: 'right', lineBreak: false });
      doc.fillColor('#e2e8f0').fontSize(7.5).font('Helvetica').text('ho@lifeitupworldwide.com  •  www.lifeitupworldwide.com', 310, currentY + 20, { width: 235, align: 'right', lineBreak: false });

      // Page 2 Footer with Gold Divider
      doc.rect(36, 815, contentWidth, 0.6).fill(royalGold);
      doc.fillColor(textMuted).fontSize(7.5).font('Helvetica').text('LifeITup WorldWide  •  Page 2 of 2  •  Confidential Holistic Assessment  •  www.lifeitupworldwide.com', 36, 822, { width: contentWidth, align: 'center', lineBreak: false });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = {
  generateReportPdf,
  DETAILED_BAND_CONTENT
};
