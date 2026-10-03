import React, { useState } from 'react';
import { X, User, Phone, Mail, ShieldCheck, Briefcase, Building, LogIn, Check, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, userProfile, signInWithGoogle, loginWithDetails, logout } = useAuth();

  const [name, setName] = useState(userProfile?.name || '');
  const [email, setEmail] = useState(userProfile?.email || '');
  const [phone, setPhone] = useState(userProfile?.phoneNumber || '');
  const [role, setRole] = useState(userProfile?.role || 'Senior Legal & Compliance Counsel');
  const [department, setDepartment] = useState(userProfile?.department || 'Corporate Governance & Risk');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (userProfile) {
      setName(userProfile.name);
      setEmail(userProfile.email);
      setPhone(userProfile.phoneNumber);
      setRole(userProfile.role);
      setDepartment(userProfile.department);
    }
  }, [userProfile, isOpen]);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsSubmitting(true);
    try {
      await signInWithGoogle();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Google sign-in encountered an error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
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
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update auditor credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-[#121812] border border-[#232f23] rounded-3xl max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#232f23] bg-[#0d130d]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-lime-950/80 border border-lime-700/50 text-lime-400 flex items-center justify-center shadow-sm">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight">
                {currentUser ? 'Auditor Profile & Credentials' : 'Sign In to LexiRisk'}
              </h2>
              <p className="text-xs text-slate-400">
                {currentUser ? 'Manage compliance credentials and contact info' : 'Identify yourself to sign off on audit records'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs">
          
          {/* Google Sign-in Button */}
          <div>
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-white hover:bg-slate-100 text-slate-900 font-semibold rounded-2xl shadow-sm transition-all border border-slate-200 cursor-pointer disabled:opacity-60"
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

          <div className="flex items-center gap-3">
            <div className="h-px bg-[#232f23] flex-1" />
            <span className="text-[10px] uppercase font-mono text-slate-500 tracking-wider">
              Or sign in with details
            </span>
            <div className="h-px bg-[#232f23] flex-1" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmitForm} className="space-y-3.5">
            
            {/* Name */}
            <div>
              <label htmlFor="login-full-name" className="block font-semibold text-slate-300 mb-1">
                Full Name <span className="text-lime-400">*</span>
              </label>
              <div className="relative">
                <User className="w-3.5 h-3.5 absolute left-3.5 top-2.5 text-slate-500" />
                <input
                  id="login-full-name"
                  type="text"
                  required
                  placeholder="e.g. Sarah Jenkins, Esq."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 bg-[#0c120c] border border-[#222e22] focus:border-lime-500 rounded-2xl text-white text-xs focus:outline-none font-medium placeholder:text-slate-500"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="login-email-address" className="block font-semibold text-slate-300 mb-1">
                Corporate Email Address <span className="text-lime-400">*</span>
              </label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 absolute left-3.5 top-2.5 text-slate-500" />
                <input
                  id="login-email-address"
                  type="email"
                  required
                  placeholder="e.g. s.jenkins@enterprise-counsel.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 bg-[#0c120c] border border-[#222e22] focus:border-lime-500 rounded-2xl text-white text-xs focus:outline-none font-medium placeholder:text-slate-500"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="login-phone-number" className="block font-semibold text-slate-300 mb-1">
                Contact Phone Number
              </label>
              <div className="relative">
                <Phone className="w-3.5 h-3.5 absolute left-3.5 top-2.5 text-slate-500" />
                <input
                  id="login-phone-number"
                  type="tel"
                  placeholder="e.g. +1 (555) 234-5678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 bg-[#0c120c] border border-[#222e22] focus:border-lime-500 rounded-2xl text-white text-xs focus:outline-none font-medium font-mono placeholder:text-slate-500"
                />
              </div>
            </div>

            {/* Role & Department */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="login-compliance-role" className="block font-semibold text-slate-300 mb-1">
                  Compliance Role
                </label>
                <select
                  id="login-compliance-role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-2.5 py-2 bg-[#0c120c] border border-[#222e22] focus:border-lime-500 rounded-2xl text-white text-xs focus:outline-none"
                >
                  <option value="Senior Legal & Compliance Counsel">Senior Counsel</option>
                  <option value="Regulatory Compliance Officer">Compliance Officer</option>
                  <option value="Internal Risk Auditor">Risk Auditor</option>
                  <option value="Procurement Contract Signer">Procurement Signer</option>
                </select>
              </div>

              <div>
                <label htmlFor="login-org-department" className="block font-semibold text-slate-300 mb-1">
                  Department
                </label>
                <input
                  id="login-org-department"
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

            <div className="pt-2 flex items-center justify-between gap-3">
              {currentUser && (
                <button
                  type="button"
                  onClick={async () => {
                    await logout();
                    onClose();
                  }}
                  className="text-xs text-rose-400 hover:text-rose-300 font-medium transition-colors cursor-pointer"
                >
                  Sign Out
                </button>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="ml-auto flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-black bg-[#a3e635] hover:bg-[#bef264] disabled:bg-slate-800 disabled:text-slate-500 rounded-full shadow-[0_0_20px_rgba(163,230,53,0.35)] transition-all cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>{currentUser ? 'Save Auditor Profile' : 'Sign In & Save Profile'}</span>
              </button>
            </div>

          </form>

        </div>

      </div>
    </div>
  );
};
