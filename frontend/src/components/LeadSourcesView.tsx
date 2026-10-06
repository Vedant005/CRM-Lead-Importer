"use client";

import React from "react";
import {
  UploadCloud,
  UserPlus,
  ArrowUpRight,
  Sparkles,
  Link2,
  FileSpreadsheet,
  CheckCircle2,
} from "lucide-react";

interface LeadSourcesViewProps {
  onOpenImportModal: () => void;
  importedCount: number;
  onNavigateToManageLeads: () => void;
}

export const LeadSourcesView: React.FC<LeadSourcesViewProps> = ({
  onOpenImportModal,
  importedCount,
  onNavigateToManageLeads,
}) => {
  return (
    <div className="space-y-5 sm:space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Lead Sources
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Connect, manage, and control all your lead channels from one dashboard.
        </p>
      </div>

      {/* Primary Action Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        {/* Card 1: Import Leads via CSV */}
        <div
          onClick={onOpenImportModal}
          className="p-4 sm:p-5 bg-white border border-slate-200/90 rounded-2xl shadow-xs hover:border-[#0f5c53] hover:shadow-md transition-all cursor-pointer group relative overflow-hidden"
        >
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-[#0f5c53] shrink-0 group-hover:bg-[#0f5c53] group-hover:text-white transition-colors">
              <UploadCloud className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-[#0f5c53] transition-colors">
                  Import Leads via CSV
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-[#f87146] border border-orange-200 shrink-0">
                  AI Powered
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Upload Facebook, Google, Real Estate, or messy Excel CSVs. AI maps and extracts fields automatically.
              </p>
            </div>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-teal-50 group-hover:text-[#0f5c53] transition-colors shrink-0 mt-0.5">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Card 2: Single Lead */}
        <div
          onClick={onNavigateToManageLeads}
          className="p-4 sm:p-5 bg-white border border-slate-200/90 rounded-2xl shadow-xs hover:border-slate-300 transition-all cursor-pointer group"
        >
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
              <UserPlus className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                Single Lead
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Add a new lead manually into the DataWeave CRM pipeline.
              </p>
            </div>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:text-slate-600 transition-colors shrink-0 mt-0.5">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Status Notice if leads already imported */}
      {importedCount > 0 && (
        <div className="p-3.5 sm:p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <div className="text-xs sm:text-sm font-bold text-emerald-900">
                {importedCount} Leads Extracted & Ready in CRM
              </div>
              <div className="text-[11px] text-emerald-700">
                Processed via Groq AI schema normalizer
              </div>
            </div>
          </div>
          <button
            onClick={onNavigateToManageLeads}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors self-start sm:self-auto"
          >
            View Leads Table
          </button>
        </div>
      )}

      {/* Active Lead Channels Section */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
          Active Lead Channels
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {/* Google Ads */}
          <div className="p-4 sm:p-5 bg-white border border-slate-200/80 rounded-2xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center font-bold text-blue-600 text-lg shrink-0">
                G
              </div>
              <div className="min-w-0">
                <div className="text-sm font-bold text-slate-900 truncate">Google Ads</div>
                <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5 truncate">
                  <span className="w-2 h-2 rounded-full bg-slate-300 shrink-0"></span>
                  Not Connected • Inactive
                </div>
              </div>
            </div>
            <button
              onClick={onOpenImportModal}
              className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 transition-colors shrink-0"
            >
              <Link2 className="w-3.5 h-3.5" /> Connect
            </button>
          </div>

          {/* Meta Ads */}
          <div className="p-4 sm:p-5 bg-white border border-slate-200/80 rounded-2xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center font-bold text-blue-600 text-lg shrink-0">
                M
              </div>
              <div className="min-w-0">
                <div className="text-sm font-bold text-slate-900 truncate">Meta Ads</div>
                <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5 truncate">
                  <span className="w-2 h-2 rounded-full bg-slate-300 shrink-0"></span>
                  Not Connected • Inactive
                </div>
              </div>
            </div>
            <button
              onClick={onOpenImportModal}
              className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 transition-colors shrink-0"
            >
              <Link2 className="w-3.5 h-3.5" /> Connect
            </button>
          </div>

          {/* WhatsApp */}
          <div className="p-4 sm:p-5 bg-white border border-slate-200/80 rounded-2xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center font-bold text-emerald-600 text-lg shrink-0">
                W
              </div>
              <div className="min-w-0">
                <div className="text-sm font-bold text-slate-900 truncate">WhatsApp Account</div>
                <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5 truncate">
                  <span className="w-2 h-2 rounded-full bg-slate-300 shrink-0"></span>
                  Not Connected • Inactive
                </div>
              </div>
            </div>
            <button
              onClick={onOpenImportModal}
              className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 transition-colors shrink-0"
            >
              <Link2 className="w-3.5 h-3.5" /> Connect
            </button>
          </div>

          {/* Telephony */}
          <div className="p-4 sm:p-5 bg-white border border-slate-200/80 rounded-2xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center font-bold text-purple-600 text-lg shrink-0">
                T
              </div>
              <div className="min-w-0">
                <div className="text-sm font-bold text-slate-900 truncate">Telephony</div>
                <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5 truncate">
                  <span className="w-2 h-2 rounded-full bg-slate-300 shrink-0"></span>
                  Not Connected • Inactive
                </div>
              </div>
            </div>
            <button
              onClick={onOpenImportModal}
              className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 transition-colors shrink-0"
            >
              <Link2 className="w-3.5 h-3.5" /> Connect
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
