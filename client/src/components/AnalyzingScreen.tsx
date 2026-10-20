import React, { useState, useEffect } from 'react';
import { Logo } from './Logo';
import { Sparkles, CheckCircle2 } from 'lucide-react';

interface AnalyzingScreenProps {
  onComplete: () => void;
  isRoyal?: boolean;
}

const ANALYSIS_STEPS = [
  'Aggregating 12 responses across 6 life dimensions...',
  'Evaluating Soul, Inner Calm, and Energy indicators...',
  'Calibrating Career, Environment, and Contribution scores...',
  'Formulating your WHO-aligned personalized pathway...'
];

export const AnalyzingScreen: React.FC<AnalyzingScreenProps> = ({ onComplete, isRoyal = true }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev < ANALYSIS_STEPS.length - 1) {
          return prev + 1;
        } else {
          clearInterval(interval);
          setTimeout(onComplete, 600);
          return prev;
        }
      });
    }, 550);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-4 py-8 max-w-lg mx-auto text-center">
      <header className="relative z-10 mb-6">
        <Logo size="md" showTagline={true} variant={isRoyal ? 'gold' : 'emerald'} />
      </header>

      <main className="relative z-10 w-full rounded-3xl p-6 sm:p-8 flex flex-col items-center royal-glass-card shadow-sm animate-fade-in">
        {/* Pulsing Concentric Radar Rings */}
        <div className="relative w-20 h-20 mb-6 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full animate-ping opacity-25 bg-emerald-400" />
          <div className="absolute inset-1 rounded-full border-2 border-dashed animate-spin border-emerald-500/50" style={{ animationDuration: '6s' }} />
          <div className="w-14 h-14 rounded-full flex items-center justify-center shadow-md bg-emerald-50 border border-emerald-300 text-[#047857]">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
        </div>

        <h2 className="text-xl sm:text-2xl font-display font-medium text-[#0c2a1c] mb-2">
          Synthesizing Your Assessment
        </h2>

        {/* Progress Step List */}
        <div className="w-full space-y-2.5 my-3 text-left">
          {ANALYSIS_STEPS.map((step, idx) => {
            const isDone = idx < currentStepIndex;
            const isCurrent = idx === currentStepIndex;

            return (
              <div
                key={step}
                className={`flex items-center gap-3 p-2.5 rounded-xl text-xs sm:text-[13px] transition-all duration-300 ${
                  isDone 
                    ? 'text-emerald-800 bg-emerald-50/70' 
                    : isCurrent 
                      ? 'text-[#064e3b] bg-emerald-100/60 border border-emerald-300/80 font-semibold' 
                      : 'text-slate-400 opacity-50'
                }`}
              >
                <div className="w-4 h-4 shrink-0 flex items-center justify-center">
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-[#059669]" />
                  ) : isCurrent ? (
                    <div className="w-2 h-2 rounded-full animate-ping bg-[#047857]" />
                  ) : (
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                  )}
                </div>
                <span>{step}</span>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};
