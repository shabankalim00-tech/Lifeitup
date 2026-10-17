import React, { useEffect } from 'react';
import { Logo } from './Logo';
import type { ReportPayload } from '../types';
import confetti from 'canvas-confetti';
import { Sparkles, ArrowRight, ShieldCheck, Compass, Info, MessageCircle, Download } from 'lucide-react';

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
  leadId,
  userMobile,
  isRoyal = true,
  socialUrls,
  onRetake
}) => {
  const { score, maxScore, scoreBand } = report;

  // Trigger high-end subtle celebratory confetti burst on mount
  useEffect(() => {
    try {
      confetti({
        particleCount: 55,
        spread: 65,
        origin: { y: 0.6 },
        colors: isRoyal 
          ? ['#d4af37', '#f3e5ab', '#e6ca85', '#34d399', '#ffffff']
          : ['#86efac', '#a3e635', '#34d399', '#ffffff']
      });
    } catch {
      // Confetti optional
    }
  }, [isRoyal]);

  const hasInstagram = Boolean(socialUrls?.instagram && socialUrls.instagram.trim() !== '');
  const hasWhatsapp = Boolean(socialUrls?.whatsapp && socialUrls.whatsapp.trim() !== '');

  return (
    <div className="relative min-h-screen flex flex-col justify-between items-center px-4 py-8 sm:py-12 max-w-2xl mx-auto">
      {/* Ambient background glows */}
      <div className={`absolute top-1/6 left-1/2 -translate-x-1/2 w-[600px] h-[350px] blur-[150px] pointer-events-none rounded-full ${
        isRoyal ? 'bg-amber-500/12' : 'bg-emerald-600/15'
      }`} />

      {/* Header Branding */}
      <header className="relative z-10 w-full flex flex-col items-center mb-8">
        <Logo size="md" showTagline={true} variant={isRoyal ? 'gold' : 'emerald'} className="mb-4" />
        <div className="text-center">
          <span className={`text-xs uppercase tracking-widest font-semibold ${
            isRoyal ? 'text-[#e6ca85]' : 'text-lime-400'
          }`}>
            {report.heading}
          </span>
          <h1 className="text-lg sm:text-xl font-display text-emerald-100 font-medium mt-1">
            {report.subheading}
          </h1>
        </div>
      </header>

      {/* Main Report Container */}
      <main className="relative z-10 w-full space-y-6 animate-fade-in">
        {/* Email Dispatched Confirmation Banner */}
        <div className={`flex items-center gap-3 p-4 rounded-2xl border text-sm backdrop-blur-md ${
          isRoyal 
            ? 'bg-[#062419]/90 border-[#d4af37]/40 text-[#fde68a]' 
            : 'bg-emerald-950/90 border-emerald-500/40 text-emerald-200'
        }`}>
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center shrink-0">
            <span className="text-base">✉️</span>
          </div>
          <div className="text-left flex-1">
            <p className="font-semibold text-emerald-100">Report Dispatched to Your Email!</p>
            <p className={`text-xs ${isRoyal ? 'text-[#e6ca85]' : 'text-emerald-300/80'}`}>
              Your report and PDF have been dispatched from <strong>ho@lifeitupworldwide.com</strong>.
            </p>
          </div>
        </div>

        {/* Quick Action Buttons: Download PDF & WhatsApp */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {leadId && (
            <a
              href={`/api/leads/${leadId}/pdf`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 p-3.5 rounded-2xl font-semibold text-xs sm:text-sm bg-emerald-900/60 hover:bg-emerald-800/80 border border-emerald-500/40 text-emerald-100 transition-all shadow-md hover:scale-[1.01]"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Download Official PDF Report</span>
            </a>
          )}

          {(() => {
            const cleanPhone = (userMobile || '').replace(/[^\d]/g, '');
            const pdfUrl = typeof window !== 'undefined' && leadId ? `${window.location.origin}/api/leads/${leadId}/pdf` : '';
            const waText = encodeURIComponent(
              `🌿 *LifeITUp Wellbeing Assessment Report*\n\nHello *${userName}*,\n\nThank you for participating in the *LifeITUp 2-Minute Holistic Wellbeing Check*.\n\n📊 *Your Holistic Wellbeing Score:* *${score} / ${maxScore}*\n✨ *Status:* *${scoreBand.zone}* — *${scoreBand.title}*\n\n${scoreBand.headline}\n\n🎯 *YOUR FIRST MOVE (Next 7 Days):*\n*${scoreBand.firstMoveRule}*\n${scoreBand.firstMoveAdvice}\n\n📋 *YOUR PERSONALISED PATHWAY:*\n${(scoreBand.pathwaySteps || []).join(' → ')}\n\n${pdfUrl ? `📄 *Download Your Official 2-Page PDF Report:*\n${pdfUrl}\n\n` : ''}_Empowering Your Holistic Success — LifeITUp_`
            );
            const waTarget = cleanPhone 
              ? `https://api.whatsapp.com/send?phone=${cleanPhone.startsWith('91') ? cleanPhone : '91' + cleanPhone}&text=${waText}`
              : `https://api.whatsapp.com/send?text=${waText}`;

            return (
              <a
                href={waTarget}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 p-3.5 rounded-2xl font-semibold text-xs sm:text-sm bg-[#128c7e]/30 hover:bg-[#128c7e]/50 border border-[#25d366]/40 text-[#a7f3d0] transition-all shadow-md hover:scale-[1.01]"
              >
                <MessageCircle className="w-4 h-4 text-[#25d366]" />
                <span>Open / Send on WhatsApp</span>
              </a>
            );
          })()}
        </div>

        {/* Score Card */}
        <div className={`rounded-3xl p-6 sm:p-8 text-center ${
          isRoyal ? 'royal-glass-card border border-[#d4af37]/35' : 'luxury-glass-card border border-emerald-500/30'
        }`}>
          <div className={`inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-medium mb-4 ${
            isRoyal 
              ? 'bg-[#061e14]/85 border border-[#d4af37]/40 text-[#fde68a]' 
              : 'bg-emerald-950/80 border border-emerald-700/50 text-emerald-300'
          }`}>
            <Sparkles className={`w-3.5 h-3.5 ${isRoyal ? 'text-[#e6ca85]' : 'text-lime-400'}`} />
            <span>Assessed for {userName}</span>
          </div>

          <div className="flex flex-col items-center justify-center my-3">
            <span className={`text-xs sm:text-sm uppercase tracking-wider font-medium ${
              isRoyal ? 'text-[#dfc282]' : 'text-emerald-300/80'
            }`}>
              Your Holistic Wellbeing Score
            </span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className={`text-5xl sm:text-6xl md:text-7xl font-display font-bold tracking-tight ${
                isRoyal 
                  ? 'text-[#fbf6e2] drop-shadow-[0_0_35px_rgba(212,175,55,0.4)]' 
                  : 'text-white drop-shadow-[0_0_25px_rgba(163,230,53,0.3)]'
              }`}>
                {score}
              </span>
              <span className={`text-xl sm:text-2xl font-display ${
                isRoyal ? 'text-[#dfc282]/80' : 'text-emerald-400/70'
              }`}>
                / {maxScore}
              </span>
            </div>
          </div>

          {/* Score Zone Badge */}
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm sm:text-base font-semibold mt-4 shadow-sm backdrop-blur-md ${
            isRoyal 
              ? 'bg-[#061e14]/90 border-[#d4af37]/50 text-[#fde68a]' 
              : 'bg-emerald-950/90 border-emerald-500/40 text-emerald-200'
          }`}>
            <span className="text-base">{scoreBand.emoji}</span>
            <span className="tracking-wide uppercase">{scoreBand.zone}</span>
            <span className="opacity-50 font-light">•</span>
            <span className={`font-display font-medium ${isRoyal ? 'text-[#fbf6e2]' : 'text-lime-300'}`}>
              {scoreBand.title}
            </span>
          </div>
        </div>

        {/* Narrative & Reassurance Card */}
        <div className={`rounded-3xl p-6 sm:p-8 space-y-4 ${
          isRoyal ? 'royal-glass-card' : 'luxury-glass-card'
        }`}>
          <h2 className="text-base sm:text-lg font-display text-emerald-100 font-semibold leading-relaxed">
            {scoreBand.headline}
          </h2>
          <p className="text-sm sm:text-base text-emerald-200/90 leading-relaxed font-light">
            {scoreBand.reassurance}
          </p>
        </div>

        {/* YOUR FIRST MOVE Card */}
        <div className={`rounded-3xl p-6 sm:p-8 ${
          isRoyal 
            ? 'royal-glass-card border border-[#d4af37]/35 bg-gradient-to-br from-[#0c2a1c]/80 via-[#071f15]/70 to-[#03130d]/80' 
            : 'luxury-glass-card border border-lime-400/30 bg-gradient-to-br from-emerald-950/70 via-emerald-950/50 to-emerald-900/30'
        }`}>
          <div className={`flex items-center gap-2 text-xs sm:text-sm font-semibold uppercase tracking-wider mb-3 ${
            isRoyal ? 'text-[#f5de9c]' : 'text-lime-300'
          }`}>
            <Compass className="w-4 h-4" />
            <span>{scoreBand.firstMoveTitle}</span>
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-emerald-50 mb-2 font-display">
            “{scoreBand.firstMoveRule}”
          </h3>
          <p className="text-sm sm:text-base text-emerald-200/90 leading-relaxed">
            {scoreBand.firstMoveAdvice}
          </p>
        </div>

        {/* YOUR PERSONALISED PATHWAY Card */}
        <div className={`rounded-3xl p-6 sm:p-8 ${
          isRoyal ? 'royal-glass-card' : 'luxury-glass-card'
        }`}>
          <h3 className={`text-xs sm:text-sm uppercase tracking-wider font-semibold mb-4 ${
            isRoyal ? 'text-[#dfc282]' : 'text-emerald-300/80'
          }`}>
            {scoreBand.pathwayTitle}
          </h3>
          {/* Pathway Steps */}
          <div className="flex items-center justify-center gap-2 sm:gap-3 my-4 flex-wrap">
            {scoreBand.pathwaySteps.map((step, idx) => (
              <React.Fragment key={step}>
                <div className={`px-4 py-2 rounded-xl font-semibold text-sm sm:text-base tracking-wider shadow-sm ${
                  isRoyal 
                    ? 'bg-[#08281a] border border-[#d4af37]/40 text-[#f5de9c]' 
                    : 'bg-emerald-900/80 border border-emerald-500/40 text-lime-300'
                }`}>
                  {step}
                </div>
                {idx < scoreBand.pathwaySteps.length - 1 && (
                  <ArrowRight className={`w-4 h-4 shrink-0 ${isRoyal ? 'text-[#d4af37]/60' : 'text-emerald-400/60'}`} />
                )}
              </React.Fragment>
            ))}
          </div>
          <p className="text-xs sm:text-sm text-emerald-300/80 text-center mt-3 font-light">
            {scoreBand.pathwayDescription}
          </p>
        </div>

        {/* Evidence Note */}
        <div className="rounded-2xl p-4 bg-[#03120c]/60 border border-emerald-800/40 flex items-start gap-3 text-xs text-emerald-300/80 leading-relaxed">
          <Info className={`w-4 h-4 shrink-0 mt-0.5 ${isRoyal ? 'text-[#e6ca85]' : 'text-emerald-400'}`} />
          <span>{scoreBand.evidenceNote}</span>
        </div>

        {/* Official Social Media Links (if configured in settings) */}
        {(hasInstagram || hasWhatsapp) && (
          <div className="pt-4 flex items-center justify-center gap-4">
            {hasInstagram && (
              <a
                href={socialUrls?.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#03120c]/70 border border-[#d4af37]/30 text-[#f5de9c] text-xs hover:text-white hover:border-[#e6ca85] transition-all"
              >
                <svg className="w-3.5 h-3.5 text-pink-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#03120c]/70 border border-[#d4af37]/30 text-[#f5de9c] text-xs hover:text-white hover:border-[#e6ca85] transition-all"
              >
                <MessageCircle className="w-3.5 h-3.5 text-lime-400" />
                <span>Join WhatsApp Channel</span>
              </a>
            )}
          </div>
        )}

        {/* Retake Assessment option */}
        <div className="text-center pt-2">
          <button
            onClick={onRetake}
            className={`text-xs underline underline-offset-4 transition-colors cursor-pointer ${
              isRoyal ? 'text-[#dfc282]/70 hover:text-[#fde68a]' : 'text-emerald-400/60 hover:text-emerald-300'
            }`}
          >
            Retake Assessment
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full text-center text-xs text-emerald-500/60 pt-10">
        <div className="flex items-center justify-center gap-1.5 mb-1 text-[11px] text-emerald-400/70">
          <ShieldCheck className={`w-3.5 h-3.5 ${isRoyal ? 'text-[#e6ca85]' : 'text-lime-400'}`} />
          <span>Self-reflection & guidance report aligned with WHO wellbeing standards.</span>
        </div>
        <p>© LifeITUp. Empowering Your Holistic Success.</p>
      </footer>
    </div>
  );
};
