import { useState, useEffect } from 'react';
import type { AssessmentMeta, LeadFormData, ReportPayload } from './types';
import { IntroScreen } from './components/IntroScreen';
import { QuestionScreen } from './components/QuestionScreen';
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
  const [step, setStep] = useState<'intro' | 'quiz' | 'completed' | 'lead_capture' | 'report'>('intro');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [sessionId, setSessionId] = useState<string>('');
  
  const [questions, setQuestions] = useState(FALLBACK_QUESTIONS);
  const [options, setOptions] = useState(FALLBACK_OPTIONS);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submittedLead, setSubmittedLead] = useState<{ fullName: string; email: string } | null>(null);
  const [reportData, setReportData] = useState<ReportPayload | null>(null);
  const [socialUrls, setSocialUrls] = useState<{ instagram?: string; whatsapp?: string }>({});

  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);
  const [theme, setTheme] = useState<ThemeType>('soothing');

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
      try {
        const res = await fetch('/api/assessments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId, answers })
        });
        const data = await res.json();
        if (data.success) {
          // Transition to Completion screen
          setStep('completed');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          alert(data.error || 'Failed to submit assessment answers.');
        }
      } catch (err: any) {
        // Even if offline, proceed to completed screen
        setStep('completed');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } finally {
        setIsLoading(false);
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
    setStep('intro');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className={`relative min-h-screen text-stone-100 flex flex-col justify-between selection:bg-lime-400 selection:text-emerald-950 overflow-x-hidden ${
      theme === 'soothing' ? 'bg-[#05160f]' : theme === 'midnight' ? 'bg-[#041416]' : 'bg-[#071b13]'
    }`}>
      {/* 1. SOOTHING MINIMAL THEME (Default: Pure calm, velvety dark green, zero clutter/leaves) */}
      {theme === 'soothing' && (
        <>
          <div className="fixed inset-0 bg-soothing-minimal pointer-events-none z-0" />
          {/* Gentle, soft breathing ambient light from above */}
          <div className="fixed top-[-10%] left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-emerald-500/10 blur-[140px] rounded-full pointer-events-none z-0 animate-calm-pulse" />
          <div className="fixed bottom-0 right-1/4 w-[500px] h-[300px] bg-teal-500/5 blur-[130px] rounded-full pointer-events-none z-0" />
        </>
      )}

      {/* 2. MIDNIGHT GOLD THEME (Deep executive teal with warm morning light) */}
      {theme === 'midnight' && (
        <>
          <div 
            className="fixed inset-0 bg-cover bg-center bg-no-repeat pointer-events-none z-0"
            style={{ backgroundImage: `url('/eucalyptus-gold.jpg')` }}
          />
          <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,rgba(4,20,22,0.8)_0%,rgba(4,20,22,0.45)_65%,rgba(4,20,22,0.1)_100%)] pointer-events-none z-0" />
        </>
      )}

      {/* 3. BOTANICAL ZEN THEME (Natural foliage and zen stones) */}
      {theme === 'botanical' && (
        <>
          <div 
            className="fixed inset-0 bg-cover bg-center bg-no-repeat pointer-events-none z-0"
            style={{ backgroundImage: `url('/clean-bg.png')` }}
          />
          <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,rgba(7,27,19,0.72)_0%,rgba(7,27,19,0.35)_60%,rgba(7,27,19,0.05)_100%)] pointer-events-none z-0" />
        </>
      )}

      {/* Top Floating Theme Switcher */}
      <div className="fixed top-4 right-4 z-40">
        <ThemeSwitcher currentTheme={theme} onThemeChange={setTheme} />
      </div>

      {/* Main Content Router */}
      <div className="relative z-10 flex-1 flex flex-col justify-between pt-2">
        {step === 'intro' && (
          <IntroScreen onStart={handleStart} />
        )}

      {step === 'quiz' && (
        <QuestionScreen
          question={questions[currentQuestionIndex]}
          currentIndex={currentQuestionIndex}
          totalQuestions={questions.length}
          selectedAnswer={answers[questions[currentQuestionIndex].id]}
          options={options}
          onSelectAnswer={handleSelectAnswer}
          onNext={handleNext}
          onBack={handleBack}
        />
      )}

      {step === 'completed' && (
        <CompletionScreen onOpenLeadCapture={handleOpenLeadCapture} />
      )}

      {step === 'lead_capture' && (
        <LeadCaptureScreen
          onSubmit={handleLeadSubmit}
          isLoading={isLoading}
          errorMessage={errorMessage}
        />
      )}

      {step === 'report' && reportData && (
        <ReportScreen
          report={reportData}
          userName={submittedLead?.fullName || 'Valued Seeker'}
          socialUrls={socialUrls}
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
