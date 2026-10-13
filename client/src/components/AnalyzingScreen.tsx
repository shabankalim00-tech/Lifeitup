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
      {/* Ambient Radial Glow */}
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] blur-[150px] pointer-events-none rounded-full ${
        isRoyal ? 'bg-amber-500/15' : 'bg-emerald-600/20'
      }`} />

      <header className="relative z-10 mb-8">
        <Logo size="md" showTagline={true} variant={isRoyal ? 'gold' : 'emerald'} />
      </header>

      <main className={`relative z-10 w-full rounded-3xl p-8 sm:p-10 flex flex-col items-center animate-fade-in ${
        isRoyal ? 'royal-glass-card' : 'luxury-glass-card'
      }`}>
        {/* Pulsing Concentric Radar Rings */}
        <div className="relative w-24 h-24 mb-8 flex items-center justify-center">
          <div className={`absolute inset-0 rounded-full animate-ping opacity-25 ${
            isRoyal ? 'bg-amber-400' : 'bg-emerald-400'
          }`} />
          <div className={`absolute inset-2 rounded-full border-2 border-dashed animate-spin ${
            isRoyal ? 'border-[#e6ca85]/50' : 'border-lime-400/50'
          }`} style={{ animationDuration: '6s' }} />
          <div className={`w-16 h-16 rounded-full flex items-center justify-center shadow-xl ${
            isRoyal 
              ? 'bg-gradient-to-tr from-[#061e14] to-[#123826] border border-[#d4af37]/60 text-[#fde68a]' 
              : 'bg-emerald-900 border border-emerald-500 text-lime-300'
          }`}>
            <Sparkles className="w-7 h-7 animate-pulse" />
          </div>
        </div>

        <h2 className="text-xl sm:text-2xl font-display font-medium text-emerald-50 mb-3">
          Synthesizing Your Assessment
        </h2>

        {/* Progress Step List */}
        <div className="w-full space-y-3 my-4 text-left">
          {ANALYSIS_STEPS.map((step, idx) => {
            const isDone = idx < currentStepIndex;
            const isCurrent = idx === currentStepIndex;

            return (
              <div
                key={step}
                className={`flex items-center gap-3 p-2.5 rounded-xl text-xs sm:text-sm transition-all duration-300 ${
                  isDone 
                    ? 'text-emerald-300 bg-emerald-950/40 opacity-80' 
                    : isCurrent 
                      ? isRoyal 
                        ? 'text-[#fde68a] bg-[#0c2a1c] border border-[#d4af37]/35 font-medium' 
                        : 'text-lime-200 bg-emerald-900/60 border border-emerald-500/40 font-medium'
                      : 'text-emerald-500/40 opacity-40'
                }`}
              >
                <div className="w-4 h-4 shrink-0 flex items-center justify-center">
                  {isDone ? (
                    <CheckCircle2 className={`w-4 h-4 ${isRoyal ? 'text-[#e6ca85]' : 'text-lime-400'}`} />
                  ) : isCurrent ? (
                    <div className={`w-2 h-2 rounded-full animate-ping ${isRoyal ? 'bg-[#e6ca85]' : 'bg-lime-400'}`} />
                  ) : (
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-700/50" />
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
