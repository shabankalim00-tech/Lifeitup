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
  isRoyal?: boolean;
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
  isRoyal = true,
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
    <div className="relative min-h-screen md:h-screen md:max-h-screen flex flex-col justify-between px-4 py-3 sm:py-4 max-w-xl mx-auto overflow-hidden">
      {/* Header section with branding & heading */}
      <header className="relative z-10 flex flex-col items-center pt-1">
        <Logo size="sm" showTagline={false} variant={isRoyal ? 'gold' : 'emerald'} className="mb-1.5" />
        
        <h2 className="text-[11px] sm:text-xs font-bold tracking-widest uppercase font-display text-[#065F46]">
          LIFEITUP WELLBEING CHECK
        </h2>

        {/* Bigger & Bolder Progress Container */}
        <div className="w-full mt-2.5">
          <div className="flex items-center justify-between mb-1.5">
            {/* Question Counter */}
            <span className="text-sm sm:text-base font-bold text-[#0A2618] tracking-tight">
              Question {currentStep} of {totalQuestions}
            </span>
            {/* % Complete */}
            <span className="font-mono text-xs sm:text-sm font-bold text-[#047857]">
              {progressPercent}% Complete
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 sm:h-2.5 bg-[#EBE5D8] rounded-full overflow-hidden border border-[#DDD5C5] p-[1px]">
            <div
              className="h-full rounded-full transition-all duration-300 ease-out bg-gradient-to-r from-emerald-500 to-[#047857]"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </header>

      {/* Main Single Question Container */}
      <main className="relative z-10 flex-1 flex flex-col justify-center my-2 sm:my-3 animate-fade-in">
        {/* Pillar indicator badge */}
        <div className="inline-flex items-center gap-1.5 self-start px-3 py-1 rounded-full text-xs font-bold mb-2 bg-[#EBF5EE] border border-[#C2E3CD] text-[#065F46] shadow-2xs">
          <PillarIcon pillarId={question.pillarId} className="w-3.5 h-3.5 text-[#047857]" />
          <span>{question.pillarName}</span>
        </div>

        {/* Question Text */}
        <h1 className="text-xl sm:text-2xl font-display font-bold text-[#0A2618] leading-snug mb-3.5 tracking-tight">
          {question.text}
        </h1>

        {/* Four Answer Options */}
        <div className="grid grid-cols-1 gap-2.5 sm:gap-3" role="radiogroup">
          {options.map((option) => {
            const isSelected = selectedAnswer === option.value;
            return (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => onSelectAnswer(option.value)}
                className={`w-full flex items-center justify-between p-3.5 sm:p-4 rounded-xl cursor-pointer text-left select-none transition-all royal-option-card ${
                  isSelected ? 'selected' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Selection Indicator */}
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors shrink-0 ${
                      isSelected
                        ? 'border-[#047857] bg-[#047857] text-white'
                        : 'border-[#DDD5C5] bg-[#FAF6EE] text-transparent'
                    }`}
                  >
                    <Check className={`w-3 h-3 stroke-[3] ${isSelected ? 'opacity-100' : 'opacity-0'}`} />
                  </div>
                  <span className={`text-sm sm:text-base transition-colors ${
                    isSelected ? 'text-[#064E3B] font-bold' : 'text-[#1A2E24] font-medium'
                  }`}>
                    {option.label}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </main>

      {/* Navigation Footer */}
      <footer className="relative z-10 pt-2.5 pb-2 flex items-center justify-between gap-4 border-t border-[#E5DFD3]">
        {/* Back Button */}
        {!isFirst ? (
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs sm:text-sm font-semibold bg-white border border-[#DDD5C5] text-[#2E4337] hover:bg-[#F3EFE6] hover:text-[#0A2618] transition-all cursor-pointer shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>
        ) : (
          <div />
        )}

        {/* Next / Complete Button */}
        <button
          type="button"
          disabled={!hasSelection}
          onClick={onNext}
          className={`inline-flex items-center gap-2 px-7 py-3 rounded-full font-bold text-sm sm:text-base transition-all cursor-pointer ${
            hasSelection
              ? 'btn-royal-gold'
              : 'bg-[#EBE5D8] border border-[#DDD5C5] text-[#9A8F7E] cursor-not-allowed opacity-60'
          }`}
        >
          <span>{isLast ? 'Complete Assessment' : 'Next'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </footer>
    </div>
  );
};
