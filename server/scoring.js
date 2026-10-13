// LifeITUp Wellbeing Assessment Engine
// Sourced strictly from the LifeITUp Assessment Workbook

const PILLARS = [
  {
    id: 'soul',
    name: 'Soul / Purpose',
    shortName: 'Soul',
    iconName: 'Lotus',
    description: 'Purpose & Meaning'
  },
  {
    id: 'mind',
    name: 'Mind / Inner Calm',
    shortName: 'Mind',
    iconName: 'Brain',
    description: 'Emotional Balance & Clarity'
  },
  {
    id: 'body',
    name: 'Body / Energy',
    shortName: 'Body',
    iconName: 'Activity',
    description: 'Energy & Physical Wellbeing'
  },
  {
    id: 'career',
    name: 'Career / Growth',
    shortName: 'Career',
    iconName: 'Briefcase',
    description: 'Growth & Performance'
  },
  {
    id: 'environment',
    name: 'Environment / Connection',
    shortName: 'Environment',
    iconName: 'Leaf',
    description: 'Surroundings & Relationships'
  },
  {
    id: 'contribution',
    name: 'Contribution / Impact',
    shortName: 'Contribution',
    iconName: 'Heart',
    description: 'Impact & Service'
  }
];

const QUESTIONS = [
  // Pillar 1 — Soul / Purpose
  {
    id: 1,
    pillarId: 'soul',
    pillarName: 'Pillar 1 — Soul / Purpose',
    text: 'My life feels connected to something meaningful beyond simply getting through the day.'
  },
  {
    id: 2,
    pillarId: 'soul',
    pillarName: 'Pillar 1 — Soul / Purpose',
    text: 'The way I spend my time reflects what truly matters to me.'
  },
  // Pillar 2 — Mind / Inner Calm
  {
    id: 3,
    pillarId: 'mind',
    pillarName: 'Pillar 2 — Mind / Inner Calm',
    text: 'I can stay calm and think clearly when life becomes stressful.'
  },
  {
    id: 4,
    pillarId: 'mind',
    pillarName: 'Pillar 2 — Mind / Inner Calm',
    text: 'I can focus on what matters without feeling constantly mentally pulled in different directions.'
  },
  // Pillar 3 — Body / Energy
  {
    id: 5,
    pillarId: 'body',
    pillarName: 'Pillar 3 — Body / Energy',
    text: 'I usually have enough physical energy to do the things that matter to me.'
  },
  {
    id: 6,
    pillarId: 'body',
    pillarName: 'Pillar 3 — Body / Energy',
    text: 'My everyday habits—sleep, movement, food and recovery—support my wellbeing.'
  },
  // Pillar 4 — Career / Growth
  {
    id: 7,
    pillarId: 'career',
    pillarName: 'Pillar 4 — Career / Growth',
    text: 'I feel confident making important decisions about my work and life.'
  },
  {
    id: 8,
    pillarId: 'career',
    pillarName: 'Pillar 4 — Career / Growth',
    text: 'I feel that I am growing, learning or moving forward in an area that matters to me.'
  },
  // Pillar 5 — Environment / Connection
  {
    id: 9,
    pillarId: 'environment',
    pillarName: 'Pillar 5 — Environment / Connection',
    text: 'My physical and digital surroundings help me feel organised, calm and in control.'
  },
  {
    id: 10,
    pillarId: 'environment',
    pillarName: 'Pillar 5 — Environment / Connection',
    text: 'The people closest to me generally support my wellbeing, growth and sense of belonging.'
  },
  // Pillar 6 — Contribution / Impact
  {
    id: 11,
    pillarId: 'contribution',
    pillarName: 'Pillar 6 — Contribution / Impact',
    text: 'I feel that what I do makes a positive difference to other people.'
  },
  {
    id: 12,
    pillarId: 'contribution',
    pillarName: 'Pillar 6 — Contribution / Impact',
    text: 'I regularly make time to help, support or uplift others.'
  }
];

const ANSWER_OPTIONS = [
  { label: 'Never', value: 1 },
  { label: 'Sometimes', value: 2 },
  { label: 'Often', value: 3 },
  { label: 'Always', value: 4 }
];

const SCORE_BANDS = [
  {
    id: 'low',
    min: 12,
    max: 20,
    zone: 'LOW',
    emoji: '🔴',
    title: 'A RESET MAY BE NEEDED',
    badgeTheme: 'border-rose-500/40 bg-rose-950/60 text-rose-300',
    headline: 'Your responses suggest that several areas of your life may currently be competing for your energy, attention and wellbeing.',
    reassurance: "This doesn't mean something is “wrong” with you. It means there may be important signals worth paying attention to before they become bigger problems.",
    firstMoveTitle: 'YOUR FIRST MOVE',
    firstMoveRule: "Don't try to change everything at once.",
    firstMoveAdvice: 'Identify your lowest-scoring pillar and choose one behaviour to improve for the next 7 days.',
    pathwayTitle: 'YOUR PERSONALISED PATHWAY',
    pathwaySteps: ['RESET', 'REBUILD', 'REPEAT'],
    pathwayDescription: 'Your full pathway should identify: your strongest pillar • your priority growth area • your first recommended actions.',
    evidenceNote: 'Evidence note: WHO describes wellbeing as multidimensional and emphasises healthy behaviours, supportive environments, social connection and the ability to cope with normal stresses and contribute to community.'
  },
  {
    id: 'moderate',
    min: 21,
    max: 32,
    zone: 'MODERATE',
    emoji: '🟠',
    title: 'YOU HAVE A FOUNDATION. NOW FIND THE GAP.',
    badgeTheme: 'border-amber-500/40 bg-amber-950/60 text-amber-300',
    headline: 'Your responses suggest that some areas of life are working reasonably well, while others may be quietly limiting your energy, wellbeing or performance.',
    reassurance: 'This is often where small, consistent changes can create meaningful momentum.',
    firstMoveTitle: 'YOUR FIRST MOVE',
    firstMoveRule: "Don't improve everything. Find the one pillar with the biggest gap.",
    firstMoveAdvice: 'Then ask: “What one behaviour, if improved consistently, would make the biggest difference?”',
    pathwayTitle: 'YOUR PERSONALISED PATHWAY',
    pathwaySteps: ['IDENTIFY', 'FOCUS', 'BUILD'],
    pathwayDescription: 'Your personalised report can reveal the pillar where your next improvement may have the greatest value.',
    evidenceNote: "Evidence note: WHO's health-promoting approach emphasises self-care, healthy habits, supportive environments and connection with others."
  },
  {
    id: 'stable',
    min: 33,
    max: 40,
    zone: 'STABLE',
    emoji: '🟢',
    title: "YOU'VE BUILT A FOUNDATION. WHAT'S HOLDING BACK YOUR NEXT LEVEL?",
    badgeTheme: 'border-emerald-500/40 bg-emerald-950/60 text-emerald-300',
    headline: 'Your responses suggest relatively positive alignment across several dimensions of life.',
    reassurance: 'But a good overall score can sometimes hide one neglected area. That is where your next breakthrough may lie.',
    firstMoveTitle: 'YOUR FIRST MOVE',
    firstMoveRule: "Don't chase more. Identify what's missing.",
    firstMoveAdvice: 'Look for the one pillar significantly below your strongest pillar. That may be your Wellness Opportunity Gap.',
    pathwayTitle: 'YOUR PERSONALISED PATHWAY',
    pathwaySteps: ['REFINE', 'STRENGTHEN', 'SUSTAIN'],
    pathwayDescription: "WHO's whole-person approach recognises that wellbeing is shaped not only by individual behaviour but also by relationships, environments, services and community.",
    evidenceNote: "Evidence note: WHO's whole-person approach recognises that wellbeing is shaped not only by individual behaviour but also by relationships, environments, services and community."
  },
  {
    id: 'balanced',
    min: 41,
    max: 48,
    zone: 'BALANCED',
    emoji: '🔵',
    title: 'YOUR FOUNDATION IS STRONG. NOW PROTECT IT.',
    badgeTheme: 'border-sky-500/40 bg-sky-950/60 text-sky-300',
    headline: 'Your responses suggest consistent positive alignment across the six areas assessed.',
    reassurance: "But high wellbeing isn't a destination. The real challenge is maintaining it when work intensifies, circumstances change and life becomes demanding.",
    firstMoveTitle: 'YOUR FIRST MOVE',
    firstMoveRule: "Don't become complacent.",
    firstMoveAdvice: 'Ask: “What would make my life healthier, more meaningful and more sustainable—not simply more successful?”',
    pathwayTitle: 'YOUR PERSONALISED PATHWAY',
    pathwaySteps: ['SUSTAIN', 'DEEPEN', 'CONTRIBUTE'],
    pathwayDescription: "WHO's whole-school/whole-person wellbeing approach recognises that health is supported through healthy behaviours, supportive relationships and environments, community connection and access to appropriate services.",
    evidenceNote: "WHO's whole-school/whole-person wellbeing approach recognises that health is supported through healthy behaviours, supportive relationships and environments, community connection and access to appropriate services."
  }
];

function calculateAssessment(answers) {
  // Validate answers structure: must contain answers for all 12 questions
  let totalScore = 0;
  const normalizedAnswers = {};

  for (let i = 1; i <= 12; i++) {
    const val = Number(answers[i] || answers[String(i)]);
    if (!val || val < 1 || val > 4) {
      throw new Error(`Invalid or missing answer for Question ${i}. Value must be between 1 and 4.`);
    }
    normalizedAnswers[i] = val;
    totalScore += val;
  }

  // Find corresponding score band
  const band = SCORE_BANDS.find(b => totalScore >= b.min && totalScore <= b.max);
  if (!band) {
    throw new Error(`Calculated score ${totalScore} out of range (12-48).`);
  }

  return {
    score: totalScore,
    maxScore: 48,
    minScore: 12,
    scoreBand: band,
    answers: normalizedAnswers
  };
}

module.exports = {
  PILLARS,
  QUESTIONS,
  ANSWER_OPTIONS,
  SCORE_BANDS,
  calculateAssessment
};
