import { useState, useEffect } from 'react';
import type { AssessmentMeta, LeadFormData, ReportPayload, ScoreBand } from './types';
import { IntroScreen } from './components/IntroScreen';
import { QuestionScreen } from './components/QuestionScreen';
import { AnalyzingScreen } from './components/AnalyzingScreen';
import { CompletionScreen } from './components/CompletionScreen';
import { LeadCaptureScreen } from './components/LeadCaptureScreen';
import { ReportScreen } from './components/ReportScreen';
import { AdminModal } from './components/AdminModal';
import { ThemeSwitcher, type ThemeType } from './components/ThemeSwitcher';
import { Shield } from 'lucide-react';

// Fallback questions directly from prompt in case offline / initial load
const FALLBACK_QUESTIONS = [
  { id: 1, pillarId: 'soul', pillarName: 'Pillar 1 — Soul / Purpose', text: 'My life feels connected to something meaningful beyond simply getting through the day.' },
  { id: 2, pillarId: 'soul', pillarName: 'Pillar 1 — Soul / Purpose', text: 'The way I spend my time reflects what truly matters to me.' },
  { id: 3, pillarId: 'mind', pillarName: 'Pillar 2 — Mind / Inner Calm', text: 'I can stay calm and think clearly when life becomes stressful.' },
  { id: 4, pillarId: 'mind', pillarName: 'Pillar 2 — Mind / Inner Calm', text: 'I can focus on what matters without feeling constantly mentally pulled in different directions.' },
  { id: 5, pillarId: 'body', pillarName: 'Pillar 3 — Body / Energy', text: 'I usually have enough physical energy to do the things that matter to me.' },
  { id: 6, pillarId: 'body', pillarName: 'Pillar 3 — Body / Energy', text: 'My everyday habits—sleep, movement, food and recovery—support my wellbeing.' },
  { id: 7, pillarId: 'career', pillarName: 'Pillar 4 — Career / Growth', text: 'I feel confident making important decisions about my work and life.' },
  { id: 8, pillarId: 'career', pillarName: 'Pillar 4 — Career / Growth', text: 'I feel that I am growing, learning or moving forward in an area that matters to me.' },
  { id: 9, pillarId: 'environment', pillarName: 'Pillar 5 — Environment / Connection', text: 'My physical and digital surroundings help me feel organised, calm and in control.' },
  { id: 10, pillarId: 'environment', pillarName: 'Pillar 5 — Environment / Connection', text: 'The people closest to me generally support my wellbeing, growth and sense of belonging.' },
  { id: 11, pillarId: 'contribution', pillarName: 'Pillar 6 — Contribution / Impact', text: 'I feel that what I do makes a positive difference to other people.' },
  { id: 12, pillarId: 'contribution', pillarName: 'Pillar 6 — Contribution / Impact', text: 'I regularly make time to help, support or uplift others.' }
];

const FALLBACK_OPTIONS = [
  { label: 'Never', value: 1 },
  { label: 'Sometimes', value: 2 },
  { label: 'Often', value: 3 },
  { label: 'Always', value: 4 }
];

export function App() {
  const [step, setStep] = useState<'intro' | 'quiz' | 'analyzing' | 'completed' | 'lead_capture' | 'report'>('intro');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [sessionId, setSessionId] = useState<string>('');
  
  const [questions, setQuestions] = useState(FALLBACK_QUESTIONS);
  const [options, setOptions] = useState(FALLBACK_OPTIONS);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submittedLead, setSubmittedLead] = useState<{ id?: number; fullName: string; email: string; mobile?: string } | null>(null);
  const [reportData, setReportData] = useState<ReportPayload | null>(null);
  const [preliminaryScore, setPreliminaryScore] = useState<{ score: number; scoreBand: ScoreBand } | null>(null);
  const [socialUrls, setSocialUrls] = useState<{ instagram?: string; whatsapp?: string }>({});

  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);
  const [theme, setTheme] = useState<ThemeType>('botanical');


  // Initialize unique session ID
  useEffect(() => {
    let sid = sessionStorage.getItem('lifeitup_session_id');
    if (!sid) {
      sid = 'session_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now();
      sessionStorage.setItem('lifeitup_session_id', sid);
    }
    setSessionId(sid);

    // Fetch assessment metadata and settings from server
    fetch('/api/assessment-meta')
      .then(r => r.json())
      .then((data: AssessmentMeta) => {
        if (data.questions && data.questions.length === 12) {
          setQuestions(data.questions);
        }
        if (data.options && data.options.length === 4) {
          setOptions(data.options);
        }
      })
      .catch(err => console.log('Using built-in question definitions:', err));

    fetch('/api/settings')
      .then(r => r.json())
      .then(data => {
        if (data.social) {
          setSocialUrls(data.social);
        }
      })
      .catch(() => {});
  }, []);

  // Step 2: User clicks "I'M READY →"
  const handleStart = () => {
    setCurrentQuestionIndex(0);
    setStep('quiz');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Step 4: Answer selection for current question
  const handleSelectAnswer = (value: number) => {
    const qId = questions[currentQuestionIndex].id;
    setAnswers(prev => ({ ...prev, [qId]: value }));
  };

  // Local score calculator for instant preview and offline resiliency
  const calculateLocalScore = (ans: Record<number, number>): { score: number; scoreBand: ScoreBand } => {
    let score = 0;
    for (let i = 1; i <= 12; i++) {
      score += Number(ans[i] || 2);
    }
    let band: ScoreBand;
    if (score <= 20) {
      band = {
        id: 'low',
        min: 12,
        max: 20,
        zone: 'LOW',
        emoji: '🔴',
        title: 'A RESET MAY BE NEEDED',
        badgeTheme: 'border-rose-500/40 bg-rose-950/60 text-rose-300',
        headline: 'Your responses suggest that several areas of your life may currently be competing for your energy, attention and wellbeing.',
        reassurance: "This doesn't mean something is wrong with you. Small adjustments create lasting change.",
        firstMoveTitle: 'YOUR FIRST MOVE',
        firstMoveRule: "Don't try to change everything at once.",
        firstMoveAdvice: 'Identify your lowest-scoring pillar and choose one behaviour to improve for the next 7 days.',
        pathwayTitle: 'YOUR PERSONALISED PATHWAY',
        pathwaySteps: ['RESET', 'REBUILD', 'REPEAT'],
        pathwayDescription: 'Prioritize your primary growth pillar and first actionable steps.',
        evidenceNote: 'WHO framework emphasizes healthy habits and supportive environments.'
      };
    } else if (score <= 32) {
      band = {
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
        firstMoveAdvice: 'Ask: “What one behaviour, if improved consistently, would make the biggest difference?”',
        pathwayTitle: 'YOUR PERSONALISED PATHWAY',
        pathwaySteps: ['IDENTIFY', 'FOCUS', 'BUILD'],
        pathwayDescription: 'Your personalized report can reveal where your next improvement will have maximum value.',
        evidenceNote: 'WHO health-promoting approach emphasizes self-care and supportive habits.'
      };
    } else if (score <= 40) {
      band = {
        id: 'stable',
        min: 33,
        max: 40,
        zone: 'STABLE',
        emoji: '🟢',
        title: "YOU'VE BUILT A FOUNDATION. WHAT'S HOLDING BACK YOUR NEXT LEVEL?",
        badgeTheme: 'border-emerald-500/40 bg-emerald-950/60 text-emerald-300',
        headline: 'Your responses suggest relatively positive alignment across several dimensions of life.',
        reassurance: 'A good overall score can sometimes hide one neglected area. That is where your next breakthrough lies.',
        firstMoveTitle: 'YOUR FIRST MOVE',
        firstMoveRule: "Don't chase more. Identify what's missing.",
        firstMoveAdvice: 'Look for the one pillar significantly below your strongest pillar.',
        pathwayTitle: 'YOUR PERSONALISED PATHWAY',
        pathwaySteps: ['REFINE', 'STRENGTHEN', 'SUSTAIN'],
        pathwayDescription: 'Evidence-based refinement across your key dimensions.',
        evidenceNote: 'WHO multidimensional approach aligns personal, environmental, and social health.'
      };
    } else {
      band = {
        id: 'balanced',
        min: 41,
        max: 48,
        zone: 'BALANCED',
        emoji: '🔵',
        title: 'YOUR FOUNDATION IS STRONG. NOW PROTECT IT.',
        badgeTheme: 'border-sky-500/40 bg-sky-950/60 text-sky-300',
        headline: 'Your responses suggest consistent positive alignment across the six areas assessed.',
        reassurance: 'The real challenge is maintaining it when work intensifies and life becomes demanding.',
        firstMoveTitle: 'YOUR FIRST MOVE',
        firstMoveRule: "Don't become complacent.",
        firstMoveAdvice: 'Ask: “What would make my life healthier and more sustainable?”',
        pathwayTitle: 'YOUR PERSONALISED PATHWAY',
        pathwaySteps: ['SUSTAIN', 'DEEPEN', 'CONTRIBUTE'],
        pathwayDescription: 'Deepening resilience and long-term sustainable high performance.',
        evidenceNote: 'Whole-person wellbeing framework for sustainable high performance.'
      };
    }
    return { score, scoreBand: band };
  };

  // Step 4 navigation: Next
  const handleNext = async () => {
    const currentQId = questions[currentQuestionIndex].id;
    if (!answers[currentQId]) return;

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Step 5: Question 12 answered. Calculate score and prepare report
      setIsLoading(true);
      const localResult = calculateLocalScore(answers);
      setPreliminaryScore(localResult);

      try {
        const res = await fetch('/api/assessments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId, answers })
        });
        const data = await res.json();
        if (data.success && data.score && data.scoreBand) {
          setPreliminaryScore({
            score: data.score,
            scoreBand: data.scoreBand
          });
        }
      } catch (err: any) {
        // Fallback localResult already set
      } finally {
        setIsLoading(false);
        setStep('analyzing');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };


  // Step 4 navigation: Back (preserves previous answers)
  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Step 7: User clicks "Get My Holistic Wellness Score & Report"
  const handleOpenLeadCapture = () => {
    setStep('lead_capture');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Step 8: User completes lead form and clicks "Send Me"
  const handleLeadSubmit = async (formData: LeadFormData) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          fullName: formData.fullName,
          email: formData.email,
          mobile: formData.mobile,
          consent: formData.consent,
          answers
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Server error occurred while submitting lead details.');
      }

      setSubmittedLead(data.lead);
      setReportData(data.report);
      // Step 10: Display personalised report
      setStep('report');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setErrorMessage(err.message || 'Unable to submit assessment. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Reset / Retake Assessment
  const handleRetake = () => {
    const newSid = 'session_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now();
    sessionStorage.setItem('lifeitup_session_id', newSid);
    setSessionId(newSid);
    setAnswers({});
    setCurrentQuestionIndex(0);
    setSubmittedLead(null);
    setReportData(null);
    setPreliminaryScore(null);
    setStep('intro');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };


  const isRoyal = theme === 'royal' || theme === 'botanical';

  return (
    <div className={`relative min-h-screen flex flex-col justify-between selection:bg-emerald-600 selection:text-white overflow-x-hidden ${
      theme === 'royal' ? 'bg-[#03120c] text-stone-100' : theme === 'soothing' ? 'bg-[#05160f] text-stone-100' : 'bg-[#FAF6EE] text-[#1A2E24]'
    }`}>
      {/* 1. BOTANICAL ZEN THEME (DEFAULT & OFFICIAL: Warm Soothing Cream with Natural Botanical Foliage) */}
      {theme === 'botanical' && (
        <>
          {/* Desktop & Tablet Background */}
          <div 
            className="fixed inset-0 hidden md:block bg-cover bg-center bg-no-repeat pointer-events-none z-0"
            style={{ backgroundImage: `url('/botanical-cream-bg.jpg')` }}
          />
          {/* Mobile Portrait Background (Leaves framing top & bottom) */}
          <div 
            className="fixed inset-0 block md:hidden bg-cover bg-center bg-no-repeat pointer-events-none z-0"
            style={{ backgroundImage: `url('/botanical-cream-mobile.jpg')` }}
          />
        </>
      )}

      {/* 2. EUCALYPTUS & GOLD THEME (Executive Luxury with Dewy Leaves & Sunlight) */}
      {theme === 'royal' && (
        <>
          <div 
            className="fixed inset-0 hidden md:block bg-cover bg-center bg-no-repeat pointer-events-none z-0"
            style={{ backgroundImage: `url('/eucalyptus-gold.jpg')` }}
          />
          <div 
            className="fixed inset-0 block md:hidden bg-cover bg-center bg-no-repeat pointer-events-none z-0"
            style={{ backgroundImage: `url('/eucalyptus-gold-mobile.jpg')` }}
          />
          <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,rgba(3,18,12,0.62)_0%,rgba(3,18,12,0.22)_55%,rgba(3,18,12,0.02)_100%)] pointer-events-none z-0" />
          <div className="fixed top-[-5%] left-1/4 w-[600px] h-[350px] bg-amber-500/10 blur-[130px] rounded-full pointer-events-none z-0 animate-calm-pulse" />
        </>
      )}

      {/* 3. LOTUS SANCTUARY THEME (Serene Lotus Petals & Palm Fronds) */}
      {theme === 'soothing' && (
        <>
          <div 
            className="fixed inset-0 hidden md:block bg-cover bg-center bg-no-repeat pointer-events-none z-0"
            style={{ backgroundImage: `url('/sage-lotus.jpg')` }}
          />
          <div 
            className="fixed inset-0 block md:hidden bg-cover bg-center bg-no-repeat pointer-events-none z-0"
            style={{ backgroundImage: `url('/sage-lotus-mobile.jpg')` }}
          />
          <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,rgba(5,22,14,0.6)_0%,rgba(5,22,14,0.2)_55%,rgba(5,22,14,0.02)_100%)] pointer-events-none z-0" />
          <div className="fixed bottom-0 left-1/3 w-[500px] h-[300px] bg-emerald-500/10 blur-[130px] rounded-full pointer-events-none z-0" />
        </>
      )}

      {/* Top Floating Theme Switcher */}
      <div className="fixed top-4 right-4 z-40">
        <ThemeSwitcher currentTheme={theme} onThemeChange={setTheme} />
      </div>

      {/* Main Content Router */}
      <div className="relative z-10 flex-1 flex flex-col justify-between pt-2">
        {step === 'intro' && (
          <IntroScreen onStart={handleStart} isRoyal={isRoyal} />
        )}

      {step === 'quiz' && (
        <QuestionScreen
          question={questions[currentQuestionIndex]}
          currentIndex={currentQuestionIndex}
          totalQuestions={questions.length}
          selectedAnswer={answers[questions[currentQuestionIndex].id]}
          options={options}
          isRoyal={isRoyal}
          onSelectAnswer={handleSelectAnswer}
          onNext={handleNext}
          onBack={handleBack}
        />
      )}

      {step === 'analyzing' && (
        <AnalyzingScreen onComplete={() => setStep('completed')} isRoyal={isRoyal} />
      )}

      {step === 'completed' && (
        <CompletionScreen 
          onOpenLeadCapture={handleOpenLeadCapture} 
          isRoyal={isRoyal} 
          score={preliminaryScore?.score}
          scoreBand={preliminaryScore?.scoreBand}
        />
      )}

      {step === 'lead_capture' && (
        <LeadCaptureScreen
          onSubmit={handleLeadSubmit}
          isLoading={isLoading}
          errorMessage={errorMessage}
          isRoyal={isRoyal}
          score={preliminaryScore?.score}
          scoreBand={preliminaryScore?.scoreBand}
        />
      )}


      {step === 'report' && reportData && (
        <ReportScreen
          report={reportData}
          userName={submittedLead?.fullName || 'Valued Seeker'}
          leadId={submittedLead?.id}
          userMobile={submittedLead?.mobile}
          socialUrls={socialUrls}
          isRoyal={isRoyal}
          onRetake={handleRetake}
        />
      )}

      {/* Discrete Admin Link in Footer */}
      <div className="fixed bottom-3 right-3 z-40">
        <button
          onClick={() => setIsAdminOpen(true)}
          title="Admin & Automation Portal"
          className="p-2 rounded-full bg-emerald-950/70 border border-emerald-800/60 text-emerald-500 hover:text-lime-300 hover:border-lime-400/50 hover:bg-emerald-900/90 transition-all opacity-40 hover:opacity-100 backdrop-blur-sm cursor-pointer shadow-lg"
        >
          <Shield className="w-4 h-4" />
        </button>
      </div>
      {/* Close main content container */}
      </div>

      {/* Admin & Automation Hub Modal */}
      <AdminModal isOpen={isAdminOpen} onClose={() => setIsAdminOpen(false)} />
    </div>
  );
}

export default App;
