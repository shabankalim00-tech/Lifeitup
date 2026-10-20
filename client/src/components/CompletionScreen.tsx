import React from 'react';
import { Logo } from './Logo';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import type { ScoreBand } from '../types';

interface CompletionScreenProps {
  onOpenLeadCapture: () => void;
  isRoyal?: boolean;
  score?: number;
  scoreBand?: ScoreBand | null;
}

export const CompletionScreen: React.FC<CompletionScreenProps> = ({ 
  onOpenLeadCapture, 
  isRoyal = true,
  score = 36,
  scoreBand
}) => {
  const defaultBand: ScoreBand = {
    id: 'stable',
    min: 33,
    max: 40,
    zone: 'STABLE',
    emoji: '🟢',
    title: "YOU'VE BUILT A FOUNDATION. WHAT'S HOLDING BACK YOUR NEXT LEVEL?",
    badgeTheme: 'border-emerald-500 bg-emerald-50 text-emerald-800',
    headline: 'Your responses suggest relatively positive alignment across several dimensions of life.',
    reassurance: '',
    firstMoveTitle: 'YOUR FIRST MOVE',
    firstMoveRule: "Don't chase more. Identify what's missing.",
    firstMoveAdvice: 'Look for the one pillar significantly below your strongest pillar.',
    pathwayTitle: 'YOUR PERSONALISED PATHWAY',
    pathwaySteps: ['REFINE', 'STRENGTHEN', 'SUSTAIN'],
    pathwayDescription: 'Evidence-based refinement across your key dimensions.',
    evidenceNote: 'WHO multidimensional approach aligns personal, environmental, and social health.'
  };

  const activeBand = scoreBand || defaultBand;

  // Zone specific badge styling
  const getZoneBadgeClass = (zone: string) => {
    switch (zone) {
      case 'MODERATE':
        return 'bg-amber-50 text-amber-800 border-amber-300';
      case 'STABLE':
        return 'bg-emerald-50 text-emerald-800 border-emerald-300';
      case 'BALANCED':
        return 'bg-sky-50 text-sky-800 border-sky-300';
      case 'LOW':
      default:
        return 'bg-rose-50 text-rose-800 border-rose-300';
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-between items-center px-4 py-6 sm:py-10 max-w-xl mx-auto text-center">
      {/* Header */}
      <header className="relative z-10 w-full flex justify-center mb-4">
        <Logo size="md" showTagline={true} variant={isRoyal ? 'gold' : 'emerald'} />
      </header>

      {/* Main Card */}
      <main className="relative z-10 w-full rounded-3xl p-6 sm:p-8 flex flex-col items-center royal-glass-card shadow-sm animate-fade-in my-auto">
        {/* Visual Score Dial & Status Tier */}
        <div className="flex flex-col items-center mb-4">
          <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full flex flex-col items-center justify-center p-2 mb-3 bg-white border-3 border-[#047857] shadow-md">
            <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Your Score</span>
            <div className="flex items-baseline gap-1 my-0.5">
              <span className="text-3xl sm:text-4xl font-display font-bold text-[#0c2a1c]">{score}</span>
              <span className="text-xs text-slate-500 font-mono">/ 48</span>
            </div>
            <span className="text-[10px] text-[#059669] font-semibold">Holistic Scale</span>
          </div>

          {/* Status Badge */}
          <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold tracking-wider border ${getZoneBadgeClass(activeBand.zone)}`}>
            <span>{activeBand.emoji || '✨'}</span>
            <span>STATUS: {activeBand.zone}</span>
          </div>
        </div>

        {/* Workbook Title & Headline Insights */}
        <div className="text-center mb-4 max-w-md">
          <h1 className="text-base sm:text-lg font-display font-semibold text-[#0c2a1c] leading-snug mb-2">
            "{activeBand.title}"
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {activeBand.headline}
          </p>
        </div>

        {/* Research Credibility Lines (Item 14) */}
        <div className="w-full max-w-md mb-6 p-3.5 sm:p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
          <p className="text-xs sm:text-[13px] text-slate-700 leading-relaxed">
            This is basis research in <strong>wellbeing, workplace performance and holistic development</strong>.
          </p>
          <p className="text-[11px] sm:text-xs text-slate-500 font-medium mt-1.5">
            Framework based on the references from WHO • UNICEF • OECD • NEP 2020 • NCF-SE 2023
          </p>
        </div>

        {/* Primary CTA Button */}
        <button
          onClick={onOpenLeadCapture}
          className="group w-full max-w-md inline-flex items-center justify-center gap-3 px-8 py-3.5 sm:py-4 rounded-full font-bold text-base sm:text-lg cursor-pointer transition-all btn-royal-gold shadow-md"
        >
          <span>Get My Holistic Wellness Score & Report</span>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
        </button>

        <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-3">
          <ShieldCheck className="w-4 h-4 text-[#059669]" />
          <span>Includes personal score breakdown & evidence-based pathway</span>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full text-center text-xs text-slate-400 pt-4">
        <p>© LifeITUp. Empowering Your Holistic Success.</p>
      </footer>
    </div>
  );
};
