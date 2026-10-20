import React, { useState } from 'react';
import { Logo } from './Logo';
import type { LeadFormData, ScoreBand } from '../types';
import { User, Mail, Phone, Lock, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';

interface LeadCaptureScreenProps {
  onSubmit: (formData: LeadFormData) => Promise<void>;
  isLoading: boolean;
  errorMessage: string | null;
  isRoyal?: boolean;
  score?: number;
  scoreBand?: ScoreBand | null;
}

export const LeadCaptureScreen: React.FC<LeadCaptureScreenProps> = ({
  onSubmit,
  isLoading,
  errorMessage,
  isRoyal = true,
  score,
  scoreBand
}) => {

  const [formData, setFormData] = useState<LeadFormData>({
    fullName: '',
    email: '',
    mobile: '',
    consent: true
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      errors.fullName = 'Full Name is required.';
    } else if (formData.fullName.trim().length < 2) {
      errors.fullName = 'Name must be at least 2 characters.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      errors.email = 'Email Address is required.';
    } else if (!emailRegex.test(formData.email.trim())) {
      errors.email = 'Please enter a valid email address.';
    }

    const phoneClean = formData.mobile.replace(/[^\d+]/g, '');
    if (!formData.mobile.trim()) {
      errors.mobile = 'Mobile Number is required.';
    } else if (phoneClean.length < 8) {
      errors.mobile = 'Please enter a valid mobile number (min 8 digits).';
    }

    if (!formData.consent) {
      errors.consent = 'Please agree to the privacy & communication consent.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || isLoading) return;
    await onSubmit(formData);
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-between items-center px-4 py-6 sm:py-10 max-w-xl mx-auto">
      {/* Header */}
      <header className="relative z-10 w-full flex justify-center mb-4">
        <Logo size="md" showTagline={true} variant={isRoyal ? 'gold' : 'emerald'} />
      </header>

      {/* Form Card */}
      <main className="relative z-10 w-full rounded-3xl p-6 sm:p-8 royal-glass-card shadow-sm animate-fade-in my-auto">
        {/* Unlocked Teaser Pill with Score Continuity */}
        <div className="flex justify-center mb-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 border border-emerald-200 text-emerald-800">
            <Lock className="w-3.5 h-3.5 text-amber-600" />
            <span>Status: <strong>{scoreBand?.zone || 'STABLE'}</strong> ({score || 36}/48)</span>
            <span className="opacity-40">|</span>
            <span>Report Ready</span>
          </div>
        </div>

        <div className="text-center mb-5">
          <h1 className="text-2xl sm:text-3xl font-display font-medium text-[#0c2a1c] mb-1.5">
            Unlock Your Full Report
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Your preliminary <strong>{scoreBand?.zone || 'Holistic'}</strong> score is ready. Enter your details below to receive your complete 6-pillar breakdown & 7-day action plan.
          </p>
        </div>

        {/* Global Error Banner */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-rose-700 text-xs sm:text-sm">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-3.5 sm:space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => {
                  setFormData({ ...formData, fullName: e.target.value });
                  if (fieldErrors.fullName) setFieldErrors({ ...fieldErrors, fullName: '' });
                }}
                placeholder="e.g. Sarah Jenkins"
                className={`w-full pl-10 pr-4 py-2.5 sm:py-3 rounded-xl bg-white border text-slate-900 placeholder-slate-400 text-sm focus:outline-none transition-all ${
                  fieldErrors.fullName 
                    ? 'border-rose-400 bg-rose-50/30' 
                    : 'border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20'
                }`}
              />
            </div>
            {fieldErrors.fullName && (
              <p className="text-rose-600 text-xs mt-1">{fieldErrors.fullName}</p>
            )}
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email Address <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value });
                  if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: '' });
                }}
                placeholder="you@example.com"
                className={`w-full pl-10 pr-4 py-2.5 sm:py-3 rounded-xl bg-white border text-slate-900 placeholder-slate-400 text-sm focus:outline-none transition-all ${
                  fieldErrors.email 
                    ? 'border-rose-400 bg-rose-50/30' 
                    : 'border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20'
                }`}
              />
            </div>
            {fieldErrors.email && (
              <p className="text-rose-600 text-xs mt-1">{fieldErrors.email}</p>
            )}
          </div>

          {/* Mobile Number */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Mobile Number <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Phone className="w-4 h-4" />
              </div>
              <input
                type="tel"
                value={formData.mobile}
                onChange={(e) => {
                  setFormData({ ...formData, mobile: e.target.value });
                  if (fieldErrors.mobile) setFieldErrors({ ...fieldErrors, mobile: '' });
                }}
                placeholder="+91 98765 43210"
                className={`w-full pl-10 pr-4 py-2.5 sm:py-3 rounded-xl bg-white border text-slate-900 placeholder-slate-400 text-sm focus:outline-none transition-all ${
                  fieldErrors.mobile 
                    ? 'border-rose-400 bg-rose-50/30' 
                    : 'border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20'
                }`}
              />
            </div>
            {fieldErrors.mobile && (
              <p className="text-rose-600 text-xs mt-1">{fieldErrors.mobile}</p>
            )}
          </div>

          {/* Consent Checkbox */}
          <div className="pt-1">
            <label className="flex items-start gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={formData.consent}
                onChange={(e) => {
                  setFormData({ ...formData, consent: e.target.checked });
                  if (fieldErrors.consent) setFieldErrors({ ...fieldErrors, consent: '' });
                }}
                className="w-4 h-4 mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer accent-[#047857]"
              />
              <span className="text-xs text-slate-600 leading-snug">
                I agree to receive my LifeITUp wellness assessment report and relevant communications regarding holistic health.
              </span>
            </label>
            {fieldErrors.consent && (
              <p className="text-rose-600 text-xs mt-1">{fieldErrors.consent}</p>
            )}
          </div>

          {/* Form Submission Button: Send Me */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full inline-flex items-center justify-center gap-2 px-8 py-3.5 sm:py-4 rounded-full font-bold text-base cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed mt-2 btn-royal-gold shadow-md"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Unlocking Your Report...</span>
              </>
            ) : (
              <>
                <span>Send Me</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 mt-4">
          <Lock className="w-3 h-3 text-[#059669]" />
          <span>We respect your privacy. 100% confidential.</span>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full text-center text-xs text-slate-400 pt-4">
        <p>© LifeITUp. Empowering Your Holistic Success.</p>
      </footer>
    </div>
  );
};
