import React from 'react';
import {
  ShieldAlert,
  FileText,
  Sliders,
  CheckSquare,
  BarChart3,
  Database,
  User,
  FileDown,
  LogOut,
  Bell,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { DocumentClassification, ThresholdSettings } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface HeaderProps {
  activeTab: 'classifier' | 'review_queue' | 'evaluation' | 'corpus';
  setActiveTab: (tab: 'classifier' | 'review_queue' | 'evaluation' | 'corpus') => void;
  pendingReviewCount: number;
  totalAnalyzedCount: number;
  thresholds: ThresholdSettings;
  onOpenSettings: () => void;
  onOpenLogin: () => void;
  currentDocument: DocumentClassification | null;
  onExportPdf?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  pendingReviewCount,
  totalAnalyzedCount,
  thresholds,
  onOpenSettings,
  onOpenLogin,
  currentDocument,
  onExportPdf
}) => {
  const { currentUser, userProfile, logout } = useAuth();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const displayName = userProfile?.name || 'Auditor';

  return (
    <header className="border-b border-lime-950/40 bg-[#080d08]/90 backdrop-blur-xl sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Bar: User Greeting + Quick Actions */}
        <div className="h-16 flex items-center justify-between gap-4">
          
          {/* User Profile & Greeting (Matches Left Screen in Image) */}
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenLogin}
              className="relative group cursor-pointer focus:outline-none"
              title="Edit Auditor Profile"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-lime-400 to-emerald-600 p-0.5 shadow-[0_0_12px_rgba(163,230,53,0.25)]">
                <div className="w-full h-full rounded-full bg-[#111711] flex items-center justify-center text-lime-400 font-bold text-sm">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-lime-400 border-2 border-[#080d08]" />
            </button>

            <div>
              <div className="text-[11px] text-lime-400/80 font-mono flex items-center gap-1.5 font-medium">
                <span>{getGreeting()}</span>
                <span className="text-slate-600">·</span>
                <span className="text-slate-400 hidden sm:inline">{userProfile?.role ? userProfile.role.split(' ')[0] : 'Compliance'}</span>
              </div>
              <h1 className="text-base sm:text-lg font-bold text-white tracking-tight leading-tight">
                Welcome Back, <span className="text-slate-200">{displayName.split(' ')[0]}</span>
              </h1>
            </div>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2">
            
            {/* Export PDF Button */}
            {currentDocument && onExportPdf && (
              <button
                onClick={onExportPdf}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-black bg-[#a3e635] hover:bg-[#bef264] rounded-full shadow-[0_0_15px_rgba(163,230,53,0.3)] transition-all cursor-pointer"
                title="Export Formatted PDF Audit Report"
              >
                <FileDown className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Export PDF</span>
              </button>
            )}

            {/* Threshold Settings */}
            <button
              onClick={onOpenSettings}
              className="p-2 text-slate-400 hover:text-white bg-[#141b14] hover:bg-[#1c261c] border border-lime-900/30 rounded-full transition-colors"
              title="Governance & Sensitivity Thresholds"
            >
              <Sliders className="w-4 h-4" />
            </button>

            {/* Notification / Flagged Count Bell */}
            <button
              onClick={() => setActiveTab('review_queue')}
              className="relative p-2 text-slate-400 hover:text-white bg-[#141b14] hover:bg-[#1c261c] border border-lime-900/30 rounded-full transition-colors"
              title="Manual Review Notifications"
            >
              <Bell className="w-4 h-4" />
              {pendingReviewCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[9px] font-mono font-bold flex items-center justify-center shadow-xs animate-pulse">
                  {pendingReviewCount}
                </span>
              )}
            </button>

            {/* Sign Out */}
            <button
              onClick={logout}
              className="p-2 text-slate-400 hover:text-rose-400 bg-[#141b14] hover:bg-[#261616] border border-lime-900/30 rounded-full transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* Organized Navigation Pills (Matches Bottom & Center Navigation from Image) */}
        <div className="py-2.5 flex items-center justify-between overflow-x-auto border-t border-lime-950/30 gap-2">
          <nav className="flex items-center gap-1.5 p-1 bg-[#101710] rounded-full border border-lime-950/50">
            
            <button
              onClick={() => setActiveTab('classifier')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'classifier'
                  ? 'bg-[#a3e635] text-black shadow-[0_0_14px_rgba(163,230,53,0.35)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Classifier Workbench</span>
            </button>

            <button
              onClick={() => setActiveTab('review_queue')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'review_queue'
                  ? 'bg-[#a3e635] text-black shadow-[0_0_14px_rgba(163,230,53,0.35)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>Review Queue</span>
              {pendingReviewCount > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                  activeTab === 'review_queue' ? 'bg-black text-[#a3e635]' : 'bg-rose-950 text-rose-300 border border-rose-800'
                }`}>
                  {pendingReviewCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('evaluation')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'evaluation'
                  ? 'bg-[#a3e635] text-black shadow-[0_0_14px_rgba(163,230,53,0.35)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Performance &amp; Trends</span>
            </button>

            <button
              onClick={() => setActiveTab('corpus')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'corpus'
                  ? 'bg-[#a3e635] text-black shadow-[0_0_14px_rgba(163,230,53,0.35)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>Corpus Library</span>
            </button>

          </nav>

          <div className="hidden lg:flex items-center gap-2 text-[11px] font-mono text-slate-500">
            <span className="flex items-center gap-1.5 text-lime-400">
              <span className="w-1.5 h-1.5 rounded-full bg-lime-400 animate-pulse" />
              LexiRisk Active
            </span>
            <span>·</span>
            <span>{totalAnalyzedCount} Contracts Audited</span>
          </div>

        </div>

      </div>
    </header>
  );
};
