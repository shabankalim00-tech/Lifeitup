const PDFDocument = require('pdfkit');

const PILLAR_CONFIG = [
  { id: 'soul', num: '1', name: 'SOUL — Purpose & Meaning', qIds: [1, 2] },
  { id: 'mind', num: '2', name: 'MIND — Emotional Balance & Clarity', qIds: [3, 4] },
  { id: 'body', num: '3', name: 'BODY — Energy & Physical Wellbeing', qIds: [5, 6] },
  { id: 'career', num: '4', name: 'CAREER — Growth & Performance', qIds: [7, 8] },
  { id: 'environment', num: '5', name: 'ENVIRONMENT — Surroundings & Relationships', qIds: [9, 10] },
  { id: 'contribution', num: '6', name: 'CONTRIBUTION — Impact & Service', qIds: [11, 12] }
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
    firstMoveAdvice: 'Identify your lowest-scoring pillar and choose one behaviour to improve for the next 7 days.',
    pathwaySteps: ['RESET', 'REBUILD', 'REPEAT'],
    pathwayDescription: 'Your full pathway identifies: your strongest pillar • your priority growth area • your first recommended actions.',
    evidenceNote: 'The World Health Organization describes mental wellbeing as involving the ability to cope with normal stresses, realise one\'s abilities, learn and work effectively, and contribute to the community. WHO also recognises that wellbeing is influenced by individual, social and environmental factors.',
    pillars: {
      soul: {
        obs: 'You may benefit from reconnecting your daily actions with what genuinely matters to you.',
        wayForward: 'Ask yourself: "What truly matters to me right now? Does the way I spend my time reflect it?" Create more space for meaningful goals, relationships, interests and experiences.'
      },
      mind: {
        obs: 'Stress, emotional load or difficulty maintaining focus may be consuming more mental bandwidth than you\'d like.',
        wayForward: 'Build a simple reset routine: PAUSE -> BREATHE -> PRIORITISE -> ACT. Create regular recovery time, reduce unnecessary mental and digital clutter, and seek appropriate support when pressure becomes difficult to manage.'
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
    pathwayDescription: "WHO's health-promoting approach emphasises healthy behaviours, supportive environments and connection with others. WHO's guidance on mental health at work also supports approaches that address both individual wellbeing and the wider work environment rather than placing the entire responsibility on the individual.",
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
        wayForward: 'Ask: "What should I do more of, less of or differently?" Strengthen supportive relationships and establish healthier boundaries where needed.'
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
    headline: 'Your responses suggest relatively positive alignment across several dimensions of life. You\'ve built a foundation.',
    reassurance: "A good overall score can sometimes hide one neglected area. That may be where your next opportunity lies.",
    firstMoveRule: "Don't chase more. Identify what's missing.",
    firstMoveAdvice: 'Look for the one pillar significantly below your strongest pillar. That may be your: WELLBEING OPPORTUNITY GAP.',
    pathwaySteps: ['REFINE', 'STRENGTHEN', 'SUSTAIN'],
    pathwayDescription: "The OECD's work on social and emotional skills identifies capabilities such as emotional regulation, task performance, open-mindedness and social connection as important for wellbeing. Once a foundation is established, the objective shifts to strengthening capabilities and making success sustainable.",
    evidenceNote: "Evidence note: WHO describes mental wellbeing as supporting people's ability to realise their abilities, work effectively and contribute to community.",
    pillars: {
      soul: {
        obs: 'Your sense of meaning and values may provide a useful foundation. The opportunity is deeper alignment in everyday choices.',
        wayForward: 'Move from: KNOWING YOUR VALUES -> LIVING YOUR VALUES. Ask: "Are my everyday choices aligned with what matters most to me?"'
      },
      mind: {
        obs: 'You appear to have reasonable emotional and mental resources, while protecting focus and managing pressure remains important.',
        wayForward: 'Build proactive recovery: FOCUS -> PAUSE -> RECOVER -> REFLECT. Don\'t wait for overload before recovering.'
      },
      body: {
        obs: 'Your physical wellbeing habits provide a foundation—but consistency is what makes healthy behaviours sustainable.',
        wayForward: 'Protect sleep, movement, nutrition and recovery even when demands increase. Your body should support your ambitions—not pay the price for them.'
      },
      career: {
        obs: 'Your professional life may be providing direction and progress. The next question is whether your success is also sustainable and meaningful.',
        wayForward: 'Identify your next capability, not merely your next target: LEARN -> PRACTISE -> APPLY -> REVIEW.'
      },
      environment: {
        obs: 'Your surroundings and relationships can either reinforce your progress or quietly undermine it.',
        wayForward: 'Protect the people, spaces and routines that restore you. Set boundaries around those that consistently drain you.'
      },
      contribution: {
        obs: 'Connecting achievement with meaningful contribution can add another dimension to wellbeing.',
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
    pathwayDescription: "WHO's whole-school/whole-person wellbeing approach recognises that health is supported through healthy behaviours, supportive relationships and environments, community connection and access to appropriate services.",
    evidenceNote: "Evidence note: WHO's whole-school/whole-person wellbeing approach recognises that health is supported through healthy behaviours, supportive relationships and environments, community connection and access to appropriate services.",
    pillars: {
      soul: {
        obs: 'Purpose and values appear to be relatively well integrated into your life.',
        wayForward: 'Keep asking: "Is my definition of success still aligned with what truly matters to me?" Anchor everyday choices to long-term fulfillment.'
      },
      mind: {
        obs: 'Your responses suggest useful emotional balance and mental clarity. Protecting recovery and focus remains important.',
        wayForward: 'Build intentional rhythms: FOCUS -> RECOVER -> REFLECT -> RESET. Don\'t wait for burnout to remind you to slow down.'
      },
      body: {
        obs: 'You appear to have relatively supportive physical wellbeing habits.',
        wayForward: 'Treat sleep, movement, nutrition and recovery as assets to protect, not things to sacrifice whenever demands increase.'
      },
      career: {
        obs: 'Your work appears to provide a relatively positive foundation for growth and performance.',
        wayForward: 'Continue developing—but ask: "Will my next achievement also make my life more meaningful and sustainable?"'
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
 * Generate clean, modern, executive 2-Page Assessment Report PDF
 * (NO progress bars, NO individual pillar points)
 */
function generateReportPdf(leadData, scoreBand) {
  return new Promise((resolve, reject) => {
    try {
      const bandKey = (scoreBand && scoreBand.id) || (leadData.score <= 20 ? 'low' : leadData.score <= 32 ? 'moderate' : leadData.score <= 40 ? 'stable' : 'balanced');
      const bandContent = DETAILED_BAND_CONTENT[bandKey] || DETAILED_BAND_CONTENT.moderate;

      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 25, bottom: 0, left: 40, right: 40 },
        autoFirstPage: true,
        bufferPages: true
      });

      const buffers = [];
      doc.on('data', chunk => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', err => reject(err));

      const primaryEmerald = '#06281e';
      const textDark = '#0f172a';
      const textMuted = '#475569';
      const brandGreen = '#059669';
      const pageWidth = 595.28;
      const pageHeight = 841.89;
      const contentWidth = pageWidth - 80; // 515.28

      // ==========================================
      // PAGE 1: EXECUTIVE ASSESSMENT & PILLARS 1-3
      // ==========================================

      // 1. Elegant Header Bar
      doc.rect(40, 25, contentWidth, 50).fill(primaryEmerald);
      doc.fillColor('#34d399').fontSize(16).font('Helvetica-Bold').text('LIFEITUP WORLDWIDE', 54, 33, { characterSpacing: 1.5, lineBreak: false });
      doc.fillColor('#94a3b8').fontSize(8).font('Helvetica').text('EMPOWERING YOUR HOLISTIC SUCCESS  •  HOLISTIC ASSESSMENT REPORT', 54, 52, { characterSpacing: 0.8, lineBreak: false });

      // Right-aligned header metadata
      const todayStr = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
      doc.fillColor('#ffffff').fontSize(8.5).font('Helvetica-Bold').text(`Date: ${todayStr}`, 410, 35, { width: 130, align: 'right', lineBreak: false });
      doc.fillColor('#a7f3d0').fontSize(8).font('Helvetica').text(`Participant: ${leadData.full_name || 'Candidate'}`, 370, 50, { width: 170, align: 'right', lineBreak: false });

      // Subtitle line
      doc.rect(40, 78, contentWidth, 18).fill('#f1f5f9');
      doc.fillColor(textMuted).fontSize(7.5).font('Helvetica').text('Aligned with WHO Multidimensional Wellbeing Guidelines  •  Confidential Assessment & Pathway', 50, 83, { lineBreak: false });

      // 2. Score & Diagnostic Summary Hero
      let currentY = 102;
      const heroHeight = 84;
      doc.roundedRect(40, currentY, contentWidth, heroHeight, 4).lineWidth(1.2).strokeColor(bandContent.borderColor).fillAndStroke(bandContent.bgColor, bandContent.borderColor);

      // Score dial block (Left)
      doc.roundedRect(52, currentY + 12, 100, 60, 4).fill(primaryEmerald);
      doc.fillColor('#a7f3d0').fontSize(7.5).font('Helvetica-Bold').text('OVERALL SCORE', 52, currentY + 19, { width: 100, align: 'center', lineBreak: false });
      doc.fillColor('#ffffff').fontSize(22).font('Helvetica-Bold').text(String(leadData.score || 0), 52, currentY + 30, { width: 100, align: 'center', lineBreak: false });
      doc.fillColor('#6ee7b7').fontSize(8.5).font('Helvetica').text('OUT OF 48', 52, currentY + 55, { width: 100, align: 'center', lineBreak: false });

      // Diagnosis text (Right)
      const diagX = 166;
      doc.roundedRect(diagX, currentY + 12, 110, 16, 3).fill(bandContent.color);
      doc.fillColor('#ffffff').fontSize(8).font('Helvetica-Bold').text(`STATUS: ${bandContent.zone}`, diagX + 8, currentY + 16, { lineBreak: false });

      doc.fillColor(textDark).fontSize(10.5).font('Helvetica-Bold').text(bandContent.title, diagX, currentY + 34, { width: 345, lineBreak: false });
      doc.fillColor(textMuted).fontSize(7.8).font('Helvetica').text(bandContent.headline, diagX, currentY + 49, { width: 345, lineGap: 1.5, height: 32 });

      // 3. Section Heading: YOUR 6-PILLAR SNAPSHOT
      currentY += heroHeight + 14;
      doc.fillColor(primaryEmerald).fontSize(11).font('Helvetica-Bold').text('YOUR 6-PILLAR WELLNESS SNAPSHOT', 40, currentY, { lineBreak: false });
      doc.fillColor(textMuted).fontSize(7.8).font('Helvetica').text('Comprehensive qualitative review across the core dimensions of holistic living:', 40, currentY + 13, { lineBreak: false });

      currentY += 28;

      // Render Pillars 1, 2, 3 on Page 1
      const page1Pillars = PILLAR_CONFIG.slice(0, 3);
      page1Pillars.forEach((p) => {
        const pillarData = bandContent.pillars[p.id];
        const cardHeight = 170;

        // Clean card border
        doc.roundedRect(40, currentY, contentWidth, cardHeight, 4).lineWidth(1).strokeColor('#e2e8f0').fillAndStroke('#ffffff', '#e2e8f0');

        // Header for pillar
        doc.rect(40, currentY, contentWidth, 24).fill('#f8fafc');
        doc.rect(40, currentY, 4, 24).fill(brandGreen);
        doc.fillColor(primaryEmerald).fontSize(9.5).font('Helvetica-Bold').text(p.name, 54, currentY + 7, { lineBreak: false });

        // Observation
        doc.fillColor(textDark).fontSize(8.2).font('Helvetica-Bold').text('What Your Assessment Revealed:', 54, currentY + 34, { lineBreak: false });
        doc.fillColor(textMuted).fontSize(8).font('Helvetica').text(pillarData.obs, 54, currentY + 48, { width: contentWidth - 28, lineGap: 1.5 });

        // Way forward block
        const wayY = currentY + 92;
        doc.roundedRect(52, wayY, contentWidth - 24, 66, 3).fill('#f0fdf4').stroke('#bbf7d0');
        doc.fillColor('#065f46').fontSize(8).font('Helvetica-Bold').text('WAY FORWARD:', 62, wayY + 9, { lineBreak: false });
        doc.fillColor(textDark).fontSize(8).font('Helvetica').text(pillarData.wayForward, 62, wayY + 22, { width: contentWidth - 44, lineGap: 1.5, height: 38 });

        currentY += cardHeight + 12;
      });

      // Page 1 Footer
      doc.fillColor(textMuted).fontSize(8).font('Helvetica').text('LifeITUp Worldwide  •  Page 1 of 2  •  Confidential Holistic Assessment', 40, pageHeight - 22, { width: contentWidth, align: 'center', lineBreak: false });

      // ==========================================
      // PAGE 2: PILLARS 4-6 & ACTION PATHWAY
      // ==========================================
      doc.addPage();

      // Top Mini Header
      doc.rect(40, 25, contentWidth, 34).fill(primaryEmerald);
      doc.fillColor('#34d399').fontSize(11).font('Helvetica-Bold').text('LIFEITUP WELLNESS ASSESSMENT', 54, 33, { lineBreak: false });
      doc.fillColor('#ffffff').fontSize(8).font('Helvetica').text('Section 2: Pillars 4–6, Your 7-Day Strategy & Action Pathway', 54, 46, { lineBreak: false });

      currentY = 66;

      // Render Pillars 4, 5, 6 on Page 2
      const page2Pillars = PILLAR_CONFIG.slice(3, 6);
      page2Pillars.forEach((p) => {
        const pillarData = bandContent.pillars[p.id];
        const cardHeight = 152;

        doc.roundedRect(40, currentY, contentWidth, cardHeight, 4).lineWidth(1).strokeColor('#e2e8f0').fillAndStroke('#ffffff', '#e2e8f0');

        // Header for pillar
        doc.rect(40, currentY, contentWidth, 24).fill('#f8fafc');
        doc.rect(40, currentY, 4, 24).fill(brandGreen);
        doc.fillColor(primaryEmerald).fontSize(9.5).font('Helvetica-Bold').text(p.name, 54, currentY + 7, { lineBreak: false });

        // Observation
        doc.fillColor(textDark).fontSize(8.2).font('Helvetica-Bold').text('What Your Assessment Revealed:', 54, currentY + 34, { lineBreak: false });
        doc.fillColor(textMuted).fontSize(8).font('Helvetica').text(pillarData.obs, 54, currentY + 48, { width: contentWidth - 28, lineGap: 1.5 });

        // Way forward block
        const wayY = currentY + 86;
        doc.roundedRect(52, wayY, contentWidth - 24, 54, 3).fill('#f0fdf4').stroke('#bbf7d0');
        doc.fillColor('#065f46').fontSize(8).font('Helvetica-Bold').text('WAY FORWARD:', 62, wayY + 8, { lineBreak: false });
        doc.fillColor(textDark).fontSize(8).font('Helvetica').text(pillarData.wayForward, 62, wayY + 20, { width: contentWidth - 44, lineGap: 1.5, height: 30 });

        currentY += cardHeight + 10;
      });

      // 4. YOUR FIRST MOVE BOX
      currentY += 2;
      doc.roundedRect(40, currentY, contentWidth, 76, 4).lineWidth(1.2).strokeColor('#10b981').fillAndStroke('#ecfdf5', '#10b981');
      doc.fillColor('#065f46').fontSize(9.5).font('Helvetica-Bold').text('YOUR FIRST MOVE (NEXT 7 DAYS)', 54, currentY + 10, { lineBreak: false });
      doc.fillColor(textDark).fontSize(10).font('Helvetica-Bold').text(bandContent.firstMoveRule, 54, currentY + 24, { lineBreak: false });
      doc.fillColor(textMuted).fontSize(8.2).font('Helvetica').text(bandContent.firstMoveAdvice, 54, currentY + 39, { width: contentWidth - 28, lineGap: 1.5, height: 32 });

      // 5. YOUR PERSONALISED PATHWAY
      currentY += 84;
      doc.roundedRect(40, currentY, contentWidth, 78, 4).lineWidth(1).strokeColor('#cbd5e1').fillAndStroke('#ffffff', '#e2e8f0');
      doc.fillColor(primaryEmerald).fontSize(9.5).font('Helvetica-Bold').text('YOUR PERSONALISED PATHWAY', 54, currentY + 9, { lineBreak: false });

      // Step badges
      const stepWidth = 142;
      bandContent.pathwaySteps.forEach((step, sIdx) => {
        const stepX = 54 + (sIdx * (stepWidth + 16));
        doc.roundedRect(stepX, currentY + 24, stepWidth, 22, 3).fill(primaryEmerald);
        doc.fillColor('#34d399').fontSize(8.5).font('Helvetica-Bold').text(`STEP ${sIdx + 1}: ${step}`, stepX, currentY + 30, { width: stepWidth, align: 'center', lineBreak: false });
      });

      doc.fillColor(textMuted).fontSize(7.5).font('Helvetica').text(bandContent.pathwayDescription, 54, currentY + 52, { width: contentWidth - 28, lineGap: 1.2, height: 22 });

      // 6. Evidence & WHO Framework Box
      currentY += 86;
      doc.roundedRect(40, currentY, contentWidth, 38, 3).lineWidth(1).strokeColor('#e2e8f0').fillAndStroke('#f8fafc', '#e2e8f0');
      doc.fillColor(primaryEmerald).fontSize(7.5).font('Helvetica-Bold').text('EVIDENCE & WHO FRAMEWORK ALIGNMENT', 52, currentY + 6, { lineBreak: false });
      doc.fillColor(textMuted).fontSize(6.8).font('Helvetica').text(bandContent.evidenceNote, 52, currentY + 18, { width: contentWidth - 24, lineGap: 1, height: 18 });

      // 7. LifeITUp Worldwide Signature Strip
      currentY += 44;
      doc.roundedRect(40, currentY, contentWidth, 38, 3).fill(primaryEmerald);
      doc.fillColor('#6ee7b7').fontSize(9).font('Helvetica-Bold').text('YOUR SCORE IS ONLY THE BEGINNING.', 54, currentY + 7, { lineBreak: false });
      doc.fillColor('#ffffff').fontSize(7.5).font('Helvetica').text('Your wellbeing doesn\'t change in one assessment—it changes through what you do next.', 54, currentY + 21, { lineBreak: false });
      doc.fillColor('#a7f3d0').fontSize(7.5).font('Helvetica-Bold').text('LifeITUp Worldwide  •  ho@lifeitupworldwide.com', 330, currentY + 21, { width: 175, align: 'right', lineBreak: false });

      // Page 2 Footer
      doc.fillColor(textMuted).fontSize(8).font('Helvetica').text('LifeITUp Worldwide  •  Page 2 of 2  •  Confidential Holistic Assessment', 40, pageHeight - 22, { width: contentWidth, align: 'center', lineBreak: false });

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
