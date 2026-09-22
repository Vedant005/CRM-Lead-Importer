"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "../src/components/Sidebar";
import { LeadSourcesView } from "../src/components/LeadSourcesView";
import { ManageLeadsView } from "../src/components/ManageLeadsView";
import { CSVImportModal } from "../src/components/CSVImportModal";
import { LeadDetailDrawer } from "../src/components/LeadDetailDrawer";
import { CRMLeadRecord, ImportResult } from "../src/types/crm";
import { CheckCircle2, Sparkles } from "lucide-react";

export default function Home() {
  const [activeTab, setActiveTab] = useState<string>("lead-sources");
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  const [importedLeads, setImportedLeads] = useState<CRMLeadRecord[]>([]);
  const [skippedLeads, setSkippedLeads] = useState<
    (CRMLeadRecord & { _skip_reason?: string })[]
  >([]);
  const [selectedLead, setSelectedLead] = useState<
    (CRMLeadRecord & { _skip_reason?: string }) | null
  >(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [lastImportedFile, setLastImportedFile] = useState<string>("");

  // Auto-hide toast after 4s
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const handleImportSuccess = (result: ImportResult, filename: string) => {
    setImportedLeads(result.imported || []);
    setSkippedLeads(result.skipped || []);
    setLastImportedFile(filename);
    setToastMessage(
      `Successfully processed ${result.totalProcessed} records (${result.importedCount} imported, ${result.skippedCount} skipped)`
    );
    // Automatically navigate to Manage Leads view
    setActiveTab("manage-leads");
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">

      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        leadsCount={importedLeads.length}
      />


      <main className="flex-1 min-w-0 flex flex-col h-screen overflow-y-auto">

        {toastMessage && (
          <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl border border-slate-700 flex items-center gap-3 animate-in slide-in-from-top-3 duration-300">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div className="text-xs font-medium pr-2">{toastMessage}</div>
          </div>
        )}

        <div className="p-6 md:p-8 flex-1">
          {activeTab === "lead-sources" && (
            <LeadSourcesView
              onOpenImportModal={() => setIsImportModalOpen(true)}
              importedCount={importedLeads.length}
              onNavigateToManageLeads={() => setActiveTab("manage-leads")}
            />
          )}

          {activeTab === "manage-leads" && (
            <ManageLeadsView
              importedLeads={importedLeads}
              skippedLeads={skippedLeads}
              onOpenImportModal={() => setIsImportModalOpen(true)}
              onSelectLead={setSelectedLead}
              importedFileName={lastImportedFile}
            />
          )}

          {activeTab !== "lead-sources" && activeTab !== "manage-leads" && (
            <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center max-w-xl mx-auto my-12">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 text-[#0f5c53] flex items-center justify-center mx-auto mb-3">
                <Sparkles className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-slate-900 capitalize">
                {activeTab.replace(/-/g, " ")}
              </h2>
              <p className="text-xs text-slate-500 mt-1 mb-5">
                Explore lead importation or switch to the Lead Sources dashboard.
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => setActiveTab("lead-sources")}
                  className="px-4 py-2 rounded-xl bg-[#0f5c53] text-white text-xs font-semibold hover:bg-[#0a443d] transition-colors"
                >
                  Go to Lead Sources
                </button>
                <button
                  onClick={() => setIsImportModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-orange-50 text-[#f87146] border border-orange-200 text-xs font-semibold hover:bg-orange-100 transition-colors"
                >
                  Import CSV
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      <CSVImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportSuccess={handleImportSuccess}
      />

      <LeadDetailDrawer
        lead={selectedLead}
        onClose={() => setSelectedLead(null)}
      />
    </div>
  );
}
