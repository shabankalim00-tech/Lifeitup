import React, { useEffect } from 'react';
import { Logo } from './Logo';
import type { ReportPayload } from '../types';
import confetti from 'canvas-confetti';
import { Sparkles, ArrowRight, ShieldCheck, Compass, Info, MessageCircle } from 'lucide-react';

interface ReportScreenProps {
  report: ReportPayload;
  userName: string;
  leadId?: number;
  userMobile?: string;
  isRoyal?: boolean;
  socialUrls?: {
    instagram?: string;
    whatsapp?: string;
  };
  onRetake: () => void;
}

export const ReportScreen: React.FC<ReportScreenProps> = ({
  report,
  userName,
  isRoyal = true,
  socialUrls,
  onRetake
}) => {
  const { score, maxScore, scoreBand } = report;

  useEffect(() => {
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#047857', '#10b981', '#d4af37', '#e6ca85', '#38bdf8']
      });
    } catch {
      // Confetti optional
    }
  }, [isRoyal]);

  const hasInstagram = Boolean(socialUrls?.instagram && socialUrls.instagram.trim() !== '');
  const hasWhatsapp = Boolean(socialUrls?.whatsapp && socialUrls.whatsapp.trim() !== '');

  return (
    <div className="relative min-h-screen flex flex-col justify-between items-center px-4 py-6 sm:py-10 max-w-2xl mx-auto">
      {/* Header Branding */}
      <header className="relative z-10 w-full flex flex-col items-center mb-6">
        <Logo size="md" showTagline={true} variant={isRoyal ? 'gold' : 'emerald'} className="mb-3" />
        <div className="text-center">
          <span className="text-xs uppercase tracking-widest font-bold text-[#047857]">
            {report.heading}
          </span>
          <h1 className="text-lg sm:text-xl font-display text-[#0c2a1c] font-medium mt-1">
            {report.subheading}
          </h1>
        </div>
      </header>

      {/* Main Report Container */}
      <main className="relative z-10 w-full space-y-5 animate-fade-in">
        {/* Email Dispatched Confirmation Banner */}
        <div className="flex items-center gap-3 p-4 rounded-2xl border border-emerald-200 bg-emerald-50/90 text-sm shadow-xs">
          <div className="w-8 h-8 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center shrink-0">
            <span className="text-base">✉️</span>
          </div>
          <div className="text-left flex-1">
            <p className="font-bold text-emerald-900">Report Dispatched to Your Email!</p>
            <p className="text-xs text-emerald-700">
              Your official personalised PDF report has been dispatched to your email address from <strong>ho@lifeitupworldwide.com</strong>.
            </p>
          </div>
        </div>

        {/* Score Card */}
        <div className="rounded-3xl p-6 sm:p-8 text-center royal-glass-card shadow-sm">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold mb-3 bg-emerald-50 border border-emerald-200 text-emerald-800">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Assessed for {userName}</span>
          </div>

          <div className="flex flex-col items-center justify-center my-2">
            <span className="text-xs sm:text-sm uppercase tracking-wider font-semibold text-slate-500">
              Your Holistic Wellbeing Score
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-5xl sm:text-6xl md:text-7xl font-display font-bold tracking-tight text-[#0c2a1c]">
                {score}
              </span>
              <span className="text-xl sm:text-2xl font-display text-slate-400">
                / {maxScore}
              </span>
            </div>
          </div>

          {/* Score Zone Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-800 text-sm sm:text-base font-bold mt-3 shadow-2xs">
            <span className="text-base">{scoreBand.emoji}</span>
            <span className="tracking-wide uppercase">{scoreBand.zone}</span>
            <span className="opacity-40 font-light">•</span>
            <span className="font-display font-medium text-[#0c2a1c]">
              {scoreBand.title}
            </span>
          </div>
        </div>

        {/* Narrative & Reassurance Card */}
        <div className="rounded-3xl p-5 sm:p-7 space-y-3 royal-glass-card shadow-sm">
          <h2 className="text-base sm:text-lg font-display text-[#0c2a1c] font-semibold leading-relaxed">
            {scoreBand.headline}
          </h2>
          {scoreBand.reassurance && (
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {scoreBand.reassurance}
            </p>
          )}
        </div>

        {/* YOUR FIRST MOVE Card */}
        <div className="rounded-3xl p-5 sm:p-7 royal-glass-card border border-emerald-200 bg-gradient-to-br from-emerald-50/50 to-white shadow-sm">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-bold uppercase tracking-wider mb-2 text-[#047857]">
            <Compass className="w-4 h-4" />
            <span>{scoreBand.firstMoveTitle}</span>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-[#0c2a1c] mb-1.5 font-display">
            “{scoreBand.firstMoveRule}”
          </h3>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
            {scoreBand.firstMoveAdvice}
          </p>
        </div>

        {/* YOUR PERSONALISED PATHWAY Card */}
        <div className="rounded-3xl p-5 sm:p-7 royal-glass-card shadow-sm">
          <h3 className="text-xs sm:text-sm uppercase tracking-wider font-bold text-[#047857] mb-3">
            {scoreBand.pathwayTitle}
          </h3>
          <div className="flex items-center justify-center gap-2 sm:gap-3 my-3 flex-wrap">
            {scoreBand.pathwaySteps.map((step, idx) => (
              <React.Fragment key={step}>
                <div className="px-4 py-2 rounded-xl font-bold text-xs sm:text-sm tracking-wider bg-emerald-50 border border-emerald-200 text-[#047857] shadow-2xs">
                  {step}
                </div>
                {idx < scoreBand.pathwaySteps.length - 1 && (
                  <ArrowRight className="w-4 h-4 shrink-0 text-slate-400" />
                )}
              </React.Fragment>
            ))}
          </div>
          <p className="text-xs text-slate-600 text-center mt-2">
            {scoreBand.pathwayDescription}
          </p>
        </div>

        {/* Evidence Note */}
        <div className="rounded-2xl p-4 bg-slate-50 border border-slate-200 flex items-start gap-3 text-xs text-slate-600 leading-relaxed">
          <Info className="w-4 h-4 shrink-0 mt-0.5 text-[#047857]" />
          <span>{scoreBand.evidenceNote}</span>
        </div>

        {/* Official Social Media Links */}
        {(hasInstagram || hasWhatsapp) && (
          <div className="pt-2 flex items-center justify-center gap-4">
            {hasInstagram && (
              <a
                href={socialUrls?.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 text-slate-700 text-xs hover:border-emerald-600 hover:text-emerald-700 transition-all shadow-xs"
              >
                <svg className="w-3.5 h-3.5 text-pink-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                </svg>
                <span>Follow on Instagram</span>
              </a>
            )}
            {hasWhatsapp && (
              <a
                href={socialUrls?.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 text-slate-700 text-xs hover:border-emerald-600 hover:text-emerald-700 transition-all shadow-xs"
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>Join WhatsApp Channel</span>
              </a>
            )}
          </div>
        )}

        {/* Retake Assessment option */}
        <div className="text-center pt-2">
          <button
            onClick={onRetake}
            className="text-xs text-slate-500 hover:text-emerald-700 underline underline-offset-4 transition-colors cursor-pointer"
          >
            Retake Assessment
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full text-center text-xs text-slate-400 pt-6">
        <div className="flex items-center justify-center gap-1.5 mb-1 text-[11px] text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-[#047857]" />
          <span>Self-reflection & guidance report aligned with WHO wellbeing standards.</span>
        </div>
        <p>© LifeITUp. Empowering Your Holistic Success.</p>
      </footer>
    </div>
  );
};
