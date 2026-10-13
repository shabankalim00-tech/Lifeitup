import React from 'react';
import { Logo } from './Logo';
import { PillarIcon } from './PillarIcon';
import type { Question, AnswerOption } from '../types';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';

interface QuestionScreenProps {
  question: Question;
  currentIndex: number;
  totalQuestions: number;
  selectedAnswer: number | undefined;
  options: AnswerOption[];
  onSelectAnswer: (value: number) => void;
  onNext: () => void;
  onBack: () => void;
}

export const QuestionScreen: React.FC<QuestionScreenProps> = ({
  question,
  currentIndex,
  totalQuestions,
  selectedAnswer,
  options,
  onSelectAnswer,
  onNext,
  onBack
}) => {
  const currentStep = currentIndex + 1;
  const progressPercent = Math.round((currentStep / totalQuestions) * 100);
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === totalQuestions - 1;
  const hasSelection = selectedAnswer !== undefined;

  return (
    <div className="relative min-h-screen flex flex-col justify-between px-4 py-6 sm:py-10 max-w-2xl mx-auto">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-emerald-600/10 blur-[140px] pointer-events-none rounded-full" />

      {/* Header section with branding & heading */}
      <header className="relative z-10 flex flex-col items-center mb-6">
        <Logo size="sm" showTagline={false} className="mb-3" />
        
        {/* Mandatory Heading */}
        <h2 className="text-sm sm:text-base font-semibold tracking-widest uppercase text-emerald-300/90 font-display">
          LIFEITUP WELLBEING CHECK
        </h2>

        {/* Progress Container */}
        <div className="w-full mt-4">
          <div className="flex items-center justify-between text-xs sm:text-sm text-emerald-300 font-medium mb-2">
            {/* Question Counter */}
            <span className="font-semibold text-lime-300">
              Question {currentStep} of {totalQuestions}
            </span>
            <span className="text-emerald-400/80 font-mono text-xs">
              {progressPercent}% Complete
            </span>
          </div>

          {/* Dynamic Progress Bar */}
          <div className="w-full h-2 sm:h-2.5 bg-emerald-950/80 rounded-full overflow-hidden border border-emerald-800/50 p-[1px]">
            <div
              className="h-full bg-gradient-to-r from-emerald-400 to-lime-300 rounded-full transition-all duration-300 ease-out shadow-[0_0_12px_rgba(163,230,53,0.5)]"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </header>

      {/* Main Single Question Container */}
      <main className="relative z-10 flex-1 flex flex-col justify-center my-4 sm:my-8 animate-fade-in">
        {/* Pillar indicator badge */}
        <div className="flex items-center gap-2 self-start px-3.5 py-1.5 rounded-full bg-emerald-900/60 border border-emerald-700/50 text-emerald-200 text-xs font-medium mb-4 shadow-sm">
          <PillarIcon pillarId={question.pillarId} className="w-4 h-4 text-lime-400" />
          <span>{question.pillarName}</span>
        </div>

        {/* Complete Question Text */}
        <h1 className="text-xl sm:text-2xl md:text-3xl font-display font-medium text-emerald-50 leading-snug sm:leading-relaxed mb-8">
          {question.text}
        </h1>

        {/* Four Answer Options */}
        <div className="grid grid-cols-1 gap-3.5 sm:gap-4" role="radiogroup">
          {options.map((option) => {
            const isSelected = selectedAnswer === option.value;
            return (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => onSelectAnswer(option.value)}
                className={`luxury-option-card w-full flex items-center justify-between p-4 sm:p-5 rounded-2xl cursor-pointer text-left select-none ${
                  isSelected ? 'selected' : ''
                }`}
              >
                <div className="flex items-center gap-3.5">
                  {/* Selection Indicator */}
                  <div
                    className={`w-6 h-6 rounded-full border flex items-center justify-center transition-colors ${
                      isSelected
                        ? 'border-lime-400 bg-lime-400 text-emerald-950'
                        : 'border-emerald-600/50 bg-emerald-950/40 text-transparent'
                    }`}
                  >
                    <Check className={`w-3.5 h-3.5 stroke-[3] ${isSelected ? 'opacity-100' : 'opacity-0'}`} />
                  </div>
                  <span className={`text-base sm:text-lg font-medium transition-colors ${
                    isSelected ? 'text-lime-200 font-semibold' : 'text-emerald-100'
                  }`}>
                    {option.label}
                  </span>
                </div>

                <span className="text-xs font-mono text-emerald-400/50">
                  {option.value} {option.value === 1 ? 'pt' : 'pts'}
                </span>
              </button>
            );
          })}
        </div>
      </main>

      {/* Navigation Footer */}
      <footer className="relative z-10 pt-6 pb-2 flex items-center justify-between gap-4 border-t border-emerald-900/60">
        {/* Back Button (Only after Q1) */}
        {!isFirst ? (
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-emerald-950/80 border border-emerald-700/60 text-emerald-200 text-sm font-medium hover:bg-emerald-900/80 hover:text-white transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
        ) : (
          <div></div> // Spacer when Back button is absent
        )}

        {/* Next / Complete Button */}
        <button
          type="button"
          disabled={!hasSelection}
          onClick={onNext}
          className={`inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-semibold text-sm sm:text-base transition-all cursor-pointer ${
            hasSelection
              ? 'bg-gradient-to-r from-lime-300 via-lime-400 to-emerald-400 text-emerald-950 shadow-[0_8px_20px_rgba(163,230,53,0.35)] hover:shadow-[0_10px_25px_rgba(163,230,53,0.45)] hover:scale-[1.02] active:scale-[0.98]'
              : 'bg-emerald-950/60 border border-emerald-800/40 text-emerald-600 cursor-not-allowed opacity-60'
          }`}
        >
          <span>{isLast ? 'Complete Assessment' : 'Next'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </footer>
    </div>
  );
};
