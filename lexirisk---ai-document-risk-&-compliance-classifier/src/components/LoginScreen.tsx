import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  User,
  Phone,
  Mail,
  Lock,
  ArrowRight,
  CheckCircle2,
  FileCheck,
  Scale,
  Sparkles,
  Zap,
  Building,
  AlertCircle,
  ArrowUpRight,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const LoginScreen: React.FC = () => {
  const { signInWithGoogle, loginWithDetails } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('Senior Legal & Compliance Counsel');
  const [department, setDepartment] = useState('Corporate Governance & Risk');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsSubmitting(true);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      setError(err.message || 'Google sign-in encountered an issue. You can sign in using your credentials below.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please provide a valid corporate email address.');
      return;
    }

    setError(null);
    setIsSubmitting(true);
    try {
      await loginWithDetails(name, email, phone, role, department);
    } catch (err: any) {
      setError(err.message || 'Authentication encountered an error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickDemo = async () => {
    setError(null);
    setIsSubmitting(true);
    try {
      await loginWithDetails(
        'Sarah Jenkins, Esq.',
        's.jenkins@enterprise-counsel.internal',
        '+1 (555) 349-8812',
        'Senior Legal & Compliance Counsel',
        'Corporate Governance & Risk'
      );
    } catch (err: any) {
      setError(err.message || 'Quick demo login failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080d08] text-slate-100 flex flex-col justify-between relative selection:bg-lime-400 selection:text-black overflow-hidden font-sans">
      
      {/* Ambient lime glow backdrop (Matches reference image) */}
      <div className="absolute top-0 left-1/3 w-[650px] h-[380px] bg-lime-500/[0.08] rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[550px] h-[350px] bg-emerald-500/[0.06] rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <header className="border-b border-lime-950/40 bg-[#080d08]/80 backdrop-blur-xl relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-lime-400 to-emerald-600 p-0.5 shadow-[0_0_15px_rgba(163,230,53,0.3)]">
              <div className="w-full h-full rounded-2xl bg-[#111711] flex items-center justify-center text-lime-400 font-bold">
                <ShieldAlert className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-white">LexiRisk</span>
                <span className="text-[10px] font-mono font-bold bg-[#a3e635] text-black px-2 py-0.2 rounded-full shadow-xs">
                  v2.4 Enterprise
                </span>
              </div>
              <div className="text-[11px] text-slate-400">
                AI Document Risk &amp; Compliance Classifier
              </div>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2.5">
            <span className="flex items-center gap-1.5 text-lime-400 bg-lime-950/60 px-3 py-1 rounded-full border border-lime-800/40 text-xs font-mono font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-lime-400 animate-pulse" />
              SOC-2 Type II Certified
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-xs text-slate-400 font-mono">Privileged &amp; Confidential</span>
          </div>
        </div>
      </header>

      {/* Main Split Hero & Login Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex items-center relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center w-full">
          
          {/* Left Column: Capability Showcase & Profile Spotlight (Matches Reference Image) */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Top Auditor Spotlight Card (Matches Right Screen Profile in Image) */}
            <div className="bg-[#121812] border border-[#232f23] rounded-3xl p-6 shadow-xl space-y-3 relative overflow-hidden">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-lime-400 to-emerald-600 p-0.5 shadow-[0_0_15px_rgba(163,230,53,0.3)] shrink-0">
                  <div className="w-full h-full rounded-full bg-[#111711] flex items-center justify-center text-lime-400 font-bold text-lg">
                    <UserCheck className="w-7 h-7" />
                  </div>
                </div>

                <div>
                  <div className="text-[11px] font-mono text-lime-400 font-semibold uppercase tracking-wider">
                    Senior Compliance Portal
                  </div>
                  <h2 className="text-lg font-bold text-white tracking-tight leading-tight">
                    Institutional Risk &amp; Compliance Gateway
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Pre-execution contract auditing &amp; autonomous liability redlining
                  </p>
                </div>
              </div>

              {/* Segmented Feature Chips (All in fluorescent neon color) */}
              <div className="flex items-center gap-2 overflow-x-auto pt-2 pb-1 scrollbar-none">
                <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-[#a3e635] text-black shadow-[0_0_12px_rgba(163,230,53,0.35)] whitespace-nowrap">
                  Multi-Label AI
                </span>
                <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-[#a3e635] text-black shadow-[0_0_12px_rgba(163,230,53,0.35)] whitespace-nowrap">
                  Clause Redlines
                </span>
                <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-[#a3e635] text-black shadow-[0_0_12px_rgba(163,230,53,0.35)] whitespace-nowrap">
                  TF-IDF Saliency
                </span>
                <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-[#a3e635] text-black shadow-[0_0_12px_rgba(163,230,53,0.35)] whitespace-nowrap">
                  Dual-Counsel Sign-Off
                </span>
              </div>
            </div>

            {/* Hero Feature Card (Matches Left Screen Hero Card in Image) */}
            <div className="bg-[#121812] border border-[#232f23] rounded-3xl p-6 sm:p-7 shadow-xl space-y-4 relative overflow-hidden group">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#a3e635] text-black shadow-sm">
                  ENTERPRISE AUDIT SUITE
                </span>
                <span className="text-xs font-mono text-slate-400">Zero Data Retention</span>
              </div>

              <div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight leading-snug">
                  Autonomous Contract Risk Governance &amp; Multi-Tier Classification
                </h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Evaluate contracts across 4 risk tiers (Critical, High, Medium, Low) and compliance domains including GDPR, Liability, FCPA, and AML covenants before document execution.
                </p>
              </div>

              {/* Auditor Avatars & Instant Demo CTA (Matches Member strip in image) */}
              <div className="pt-3 border-t border-[#232f23] flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    <div className="w-8 h-8 rounded-full bg-lime-400 text-black font-bold text-xs flex items-center justify-center border-2 border-[#121812]">
                      SJ
                    </div>
                    <div className="w-8 h-8 rounded-full bg-emerald-500 text-white font-bold text-xs flex items-center justify-center border-2 border-[#121812]">
                      AA
                    </div>
                    <div className="w-8 h-8 rounded-full bg-teal-600 text-white font-bold text-xs flex items-center justify-center border-2 border-[#121812]">
                      MK
                    </div>
                    <div className="w-8 h-8 rounded-full bg-[#1e2a1e] text-lime-400 font-mono font-bold text-[10px] flex items-center justify-center border-2 border-[#121812]">
                      50+
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Auditor Committee</div>
                    <div className="text-[10px] text-slate-400 font-mono">Senior Legal Counsel</div>
                  </div>
                </div>

                {/* Instant 1-Click Demo Access Button */}
                <button
                  type="button"
                  onClick={handleQuickDemo}
                  disabled={isSubmitting}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#1b261b] hover:bg-[#a3e635] text-lime-300 hover:text-black border border-lime-800/60 font-bold text-xs transition-all cursor-pointer shadow-sm group-hover:scale-102"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>1-Click Demo Login</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>

          {/* Right Column: Dedicated Login Card (Matches Reference Image Cards) */}
          <div className="lg:col-span-6 flex justify-center">
            <div className="bg-[#121812]/95 border border-[#232f23] rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl backdrop-blur-2xl relative space-y-4">
              
              <div className="text-center space-y-1">
                <div className="w-12 h-12 rounded-2xl bg-lime-950/80 border border-lime-700/50 text-lime-400 flex items-center justify-center mx-auto mb-2 shadow-[0_0_15px_rgba(163,230,53,0.25)]">
                  <Lock className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-bold text-white tracking-tight">Auditor Access Portal</h2>
                <p className="text-xs text-slate-400">
                  Authenticate to enter AI Classifier Workbench &amp; Governance Queue
                </p>
              </div>

              {/* Google Sign In */}
              <div>
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-white hover:bg-slate-100 text-slate-900 font-semibold rounded-2xl shadow-sm transition-all border border-slate-200 cursor-pointer disabled:opacity-60 text-xs"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </button>
              </div>

              <div className="flex items-center gap-3 my-3">
                <div className="h-px bg-[#232f23] flex-1" />
                <span className="text-[10px] uppercase font-mono text-slate-500 tracking-wider">
                  Or enter credentials
                </span>
                <div className="h-px bg-[#232f23] flex-1" />
              </div>

              {/* Auditor Form */}
              <form onSubmit={handleSubmit} className="space-y-3 text-xs">
                
                {/* Full Name */}
                <div>
                  <label htmlFor="login-screen-name" className="block font-semibold text-slate-300 mb-1">
                    Auditor Full Name <span className="text-lime-400">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 absolute left-3.5 top-2.5 text-slate-500" />
                    <input
                      id="login-screen-name"
                      type="text"
                      required
                      placeholder="e.g. Sarah Jenkins, Esq."
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 bg-[#0c120c] border border-[#222e22] focus:border-lime-500 rounded-2xl text-white text-xs focus:outline-none font-medium placeholder:text-slate-500"
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div>
                  <label htmlFor="login-screen-email" className="block font-semibold text-slate-300 mb-1">
                    Corporate Email Address <span className="text-lime-400">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 absolute left-3.5 top-2.5 text-slate-500" />
                    <input
                      id="login-screen-email"
                      type="email"
                      required
                      placeholder="e.g. s.jenkins@enterprise-counsel.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 bg-[#0c120c] border border-[#222e22] focus:border-lime-500 rounded-2xl text-white text-xs focus:outline-none font-medium placeholder:text-slate-500"
                    />
                  </div>
                </div>

                {/* Contact Phone Number */}
                <div>
                  <label htmlFor="login-screen-phone" className="block font-semibold text-slate-300 mb-1">
                    Contact Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 absolute left-3.5 top-2.5 text-slate-500" />
                    <input
                      id="login-screen-phone"
                      type="tel"
                      placeholder="e.g. +1 (555) 234-5678"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 bg-[#0c120c] border border-[#222e22] focus:border-lime-500 rounded-2xl text-white text-xs focus:outline-none font-medium font-mono placeholder:text-slate-500"
                    />
                  </div>
                </div>

                {/* Role & Department */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label htmlFor="login-screen-role" className="block font-semibold text-slate-300 mb-1">
                      Role
                    </label>
                    <select
                      id="login-screen-role"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full px-2.5 py-2 bg-[#0c120c] border border-[#222e22] focus:border-lime-500 rounded-2xl text-white text-xs focus:outline-none"
                    >
                      <option value="Senior Legal & Compliance Counsel">Senior Counsel</option>
                      <option value="Regulatory Compliance Officer">Compliance Officer</option>
                      <option value="Internal Risk Auditor">Risk Auditor</option>
                      <option value="Procurement Contract Signer">Contract Signer</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="login-screen-dept" className="block font-semibold text-slate-300 mb-1">
                      Department
                    </label>
                    <input
                      id="login-screen-dept"
                      type="text"
                      placeholder="e.g. Legal Affairs"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full px-3 py-2 bg-[#0c120c] border border-[#222e22] focus:border-lime-500 rounded-2xl text-white text-xs focus:outline-none"
                    />
                  </div>
                </div>

                {error && (
                  <div className="p-3 rounded-2xl bg-rose-950/40 border border-rose-800/40 text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Submit Button (Bright Neon Lime Pill matching reference image) */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 bg-[#a3e635] hover:bg-[#bef264] disabled:bg-slate-800 disabled:text-slate-500 text-black font-bold rounded-full shadow-[0_0_20px_rgba(163,230,53,0.35)] transition-all cursor-pointer text-xs"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Authenticating...' : 'Enter AI Classifier Workbench'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>

              <div className="pt-2 text-center">
                <span className="text-[10px] text-slate-500 font-mono">
                  Protected by Firebase Auth &amp; Enterprise Security Rules
                </span>
              </div>

            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-lime-950/40 bg-[#080d08]/90 py-4 text-center text-xs text-slate-500 font-mono relative z-10">
        <p>LexiRisk v2.4 Enterprise Legal Compliance Engine · Privileged &amp; Confidential</p>
      </footer>
    </div>
  );
};
