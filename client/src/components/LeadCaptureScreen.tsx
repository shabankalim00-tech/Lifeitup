import React, { useState } from 'react';
import { Logo } from './Logo';
import type { LeadFormData } from '../types';
import { User, Mail, Phone, Lock, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';

interface LeadCaptureScreenProps {
  onSubmit: (formData: LeadFormData) => Promise<void>;
  isLoading: boolean;
  errorMessage: string | null;
}

export const LeadCaptureScreen: React.FC<LeadCaptureScreenProps> = ({
  onSubmit,
  isLoading,
  errorMessage
}) => {
  const [formData, setFormData] = useState<LeadFormData>({
    fullName: '',
    email: '',
    mobile: '',
    consent: false
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
    <div className="relative min-h-screen flex flex-col justify-between items-center px-4 py-8 sm:py-12 max-w-xl mx-auto">
      {/* Ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-emerald-600/15 blur-[130px] pointer-events-none rounded-full" />

      {/* Header */}
      <header className="relative z-10 w-full flex justify-center mb-6">
        <Logo size="md" showTagline={true} />
      </header>

      {/* Form Card */}
      <main className="relative z-10 w-full luxury-glass-card rounded-3xl p-6 sm:p-9 animate-fade-in border border-emerald-600/30">
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-display font-medium text-emerald-50 mb-2">
            Unlock Your Personalised Report
          </h1>
          <p className="text-emerald-200/80 text-xs sm:text-sm">
            Enter your details below to instantly view your Holistic Wellness Score and tailored LifeITUp pathway.
          </p>
        </div>

        {/* Global Error Banner */}
        {errorMessage && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-950/80 border border-rose-500/50 flex items-start gap-2.5 text-rose-200 text-xs sm:text-sm">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-4 sm:space-y-5">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-medium text-emerald-200 mb-1.5">
              Full Name <span className="text-lime-400">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-emerald-400">
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
                className={`w-full pl-10 pr-4 py-3 rounded-xl bg-emerald-950/60 border text-emerald-50 placeholder-emerald-600 text-sm focus:outline-none focus:ring-2 focus:ring-lime-400/50 transition-all ${
                  fieldErrors.fullName ? 'border-rose-500 bg-rose-950/20' : 'border-emerald-700/60 focus:border-lime-400'
                }`}
              />
            </div>
            {fieldErrors.fullName && (
              <p className="text-rose-400 text-xs mt-1">{fieldErrors.fullName}</p>
            )}
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-xs font-medium text-emerald-200 mb-1.5">
              Email Address <span className="text-lime-400">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-emerald-400">
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
                className={`w-full pl-10 pr-4 py-3 rounded-xl bg-emerald-950/60 border text-emerald-50 placeholder-emerald-600 text-sm focus:outline-none focus:ring-2 focus:ring-lime-400/50 transition-all ${
                  fieldErrors.email ? 'border-rose-500 bg-rose-950/20' : 'border-emerald-700/60 focus:border-lime-400'
                }`}
              />
            </div>
            {fieldErrors.email && (
              <p className="text-rose-400 text-xs mt-1">{fieldErrors.email}</p>
            )}
          </div>

          {/* Mobile Number */}
          <div>
            <label className="block text-xs font-medium text-emerald-200 mb-1.5">
              Mobile Number <span className="text-lime-400">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-emerald-400">
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
                className={`w-full pl-10 pr-4 py-3 rounded-xl bg-emerald-950/60 border text-emerald-50 placeholder-emerald-600 text-sm focus:outline-none focus:ring-2 focus:ring-lime-400/50 transition-all ${
                  fieldErrors.mobile ? 'border-rose-500 bg-rose-950/20' : 'border-emerald-700/60 focus:border-lime-400'
                }`}
              />
            </div>
            {fieldErrors.mobile && (
              <p className="text-rose-400 text-xs mt-1">{fieldErrors.mobile}</p>
            )}
          </div>

          {/* Consent Checkbox (Strictly NOT preselected) */}
          <div className="pt-2">
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={formData.consent}
                onChange={(e) => {
                  setFormData({ ...formData, consent: e.target.checked });
                  if (fieldErrors.consent) setFieldErrors({ ...fieldErrors, consent: '' });
                }}
                className="w-4 h-4 mt-0.5 rounded border-emerald-600 bg-emerald-950 text-lime-400 focus:ring-lime-400 focus:ring-offset-emerald-950 cursor-pointer accent-lime-400"
              />
              <span className="text-xs text-emerald-300/80 leading-relaxed">
                I agree to receive my LifeITUp wellness assessment report and relevant communications regarding holistic health.
              </span>
            </label>
            {fieldErrors.consent && (
              <p className="text-rose-400 text-xs mt-1">{fieldErrors.consent}</p>
            )}
          </div>

          {/* Form Submission Button: Send Me */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-lime-300 via-lime-400 to-emerald-400 text-emerald-950 font-bold text-base shadow-[0_10px_25px_rgba(163,230,53,0.35)] hover:shadow-[0_12px_30px_rgba(163,230,53,0.5)] hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed mt-4"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Processing Report...</span>
              </>
            ) : (
              <>
                <span>Send Me</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="flex items-center justify-center gap-1.5 text-[11px] text-emerald-500/70 mt-5">
          <Lock className="w-3 h-3 text-emerald-400" />
          <span>We respect your privacy. No spam, ever.</span>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full text-center text-xs text-emerald-500/60 pt-6">
        <p>© LifeITUp. Empowering Your Holistic Success.</p>
      </footer>
    </div>
  );
};
