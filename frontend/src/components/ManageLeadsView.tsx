"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  RefreshCw,
  Download,
  UploadCloud,
  ChevronRight,
  Filter,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  FileSpreadsheet,
  Users,
  Eye,
  SlidersHorizontal,
} from "lucide-react";
import { CRMLeadRecord } from "../types/crm";

interface ManageLeadsViewProps {
  importedLeads: CRMLeadRecord[];
  skippedLeads: (CRMLeadRecord & { _skip_reason?: string })[];
  onOpenImportModal: () => void;
  onSelectLead: (lead: (CRMLeadRecord & { _skip_reason?: string }) | null) => void;
  importedFileName?: string;
}

export const ManageLeadsView: React.FC<ManageLeadsViewProps> = ({
  importedLeads,
  skippedLeads,
  onOpenImportModal,
  onSelectLead,
  importedFileName,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"imported" | "skipped">("imported");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [sourceFilter, setSourceFilter] = useState<string>("ALL");
  const [visibleCount, setVisibleCount] = useState(15);

  // Compute metrics
  const totalCount = importedLeads.length;
  const saleDoneCount = importedLeads.filter(
    (l) => l.crm_status === "SALE_DONE"
  ).length;
  const goodLeadCount = importedLeads.filter(
    (l) => l.crm_status === "GOOD_LEAD_FOLLOW_UP"
  ).length;
  const didNotConnectCount = importedLeads.filter(
    (l) => l.crm_status === "DID_NOT_CONNECT"
  ).length;
  const badLeadCount = importedLeads.filter(
    (l) => l.crm_status === "BAD_LEAD"
  ).length;
  const skippedCount = skippedLeads.length;

  const conversionRate =
    totalCount > 0 ? ((saleDoneCount / totalCount) * 100).toFixed(1) : "0.0";

  // Filtered dataset
  const currentList = activeTab === "imported" ? importedLeads : skippedLeads;

  const filteredLeads = useMemo(() => {
    return currentList.filter((lead) => {
      // Search filter
      const term = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !term ||
        (lead.name && lead.name.toLowerCase().includes(term)) ||
        (lead.email && lead.email.toLowerCase().includes(term)) ||
        (lead.mobile_without_country_code &&
          lead.mobile_without_country_code.includes(term)) ||
        (lead.company && lead.company.toLowerCase().includes(term)) ||
        (lead.city && lead.city.toLowerCase().includes(term));

      // Status filter
      const matchesStatus =
        statusFilter === "ALL" || lead.crm_status === statusFilter;

      // Source filter
      const matchesSource =
        sourceFilter === "ALL" ||
        (sourceFilter === "NONE"
          ? !lead.data_source
          : lead.data_source === sourceFilter);

      return matchesSearch && matchesStatus && matchesSource;
    });
  }, [currentList, searchTerm, statusFilter, sourceFilter]);

  const visibleLeads = filteredLeads.slice(0, visibleCount);

  // Export to DataWeave CSV
  const exportToCSV = () => {
    if (importedLeads.length === 0) return;

    const headers = [
      "created_at",
      "name",
      "email",
      "country_code",
      "mobile_without_country_code",
      "company",
      "city",
      "state",
      "country",
      "lead_owner",
      "crm_status",
      "crm_note",
      "data_source",
      "possession_time",
      "description",
    ];

    const csvRows = [headers.join(",")];

    importedLeads.forEach((lead) => {
      const row = headers.map((header) => {
        const val = (lead as any)[header] || "";
        // Escape quotes and wrap in quotes if contains comma, quote, or newline
        const escaped = String(val).replace(/"/g, '""');
        return `"${escaped}"`;
      });
      csvRows.push(row.join(","));
    });

    const blob = new Blob([csvRows.join("\n")], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `dataweave_crm_leads_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToJSON = () => {
    const blob = new Blob([JSON.stringify(importedLeads, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `dataweave_crm_leads_${new Date().toISOString().slice(0, 10)}.json`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const renderStatusPill = (status: string) => {
    switch (status) {
      case "SALE_DONE":
        return (
          <span className="px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-semibold bg-[#ebf3ff] text-[#2563eb] border border-[#bfdbfe] inline-flex items-center">
            Sale Done
          </span>
        );
      case "GOOD_LEAD_FOLLOW_UP":
        return (
          <span className="px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-semibold bg-[#e6f4f1] text-[#0f5c53] border border-[#a7f3d0] inline-flex items-center">
            Good Lead
          </span>
        );
      case "DID_NOT_CONNECT":
        return (
          <span className="px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-semibold bg-[#f1f5f9] text-[#475569] border border-[#cbd5e1] inline-flex items-center">
            Not Dialed
          </span>
        );
      case "BAD_LEAD":
        return (
          <span className="px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-semibold bg-[#fef2f2] text-[#dc2626] border border-[#fecaca] inline-flex items-center">
            Bad Lead
          </span>
        );
      default:
        return (
          <span className="px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
            {status || "Unknown"}
          </span>
        );
    }
  };

  return (
    <div className="space-y-5 sm:space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Manage Your Leads
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5 sm:mt-1">
            Monitor lead status, assign tasks, and close deals faster.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <button
            onClick={onOpenImportModal}
            className="px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-[#f87146] hover:bg-[#e05b30] text-white text-xs font-semibold shadow-xs flex items-center gap-2 transition-all active:scale-95"
          >
            <UploadCloud className="w-4 h-4" />
            <span className="whitespace-nowrap">Import CSV</span>
          </button>

          {importedLeads.length > 0 && (
            <>
              <button
                onClick={exportToCSV}
                className="px-3 py-2 sm:py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
                title="Download standard DataWeave CSV"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">Export</span> CSV
              </button>
              <button
                onClick={exportToJSON}
                className="px-3 py-2 sm:py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
                title="Download JSON"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-slate-500" />
                JSON
              </button>
            </>
          )}
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        <div className="p-3.5 sm:p-4 bg-white border border-slate-200/80 rounded-2xl shadow-xs">
          <div className="text-[11px] sm:text-xs font-semibold text-slate-500 truncate">Total Imported Leads</div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
            {totalCount}
          </div>
          <div className="text-[10px] sm:text-[11px] text-[#0f5c53] font-medium mt-1 truncate">
            {importedFileName ? `From ${importedFileName}` : "Active leads pipeline"}
          </div>
        </div>

        <div className="p-3.5 sm:p-4 bg-white border border-slate-200/80 rounded-2xl shadow-xs">
          <div className="text-[11px] sm:text-xs font-semibold text-slate-500 truncate">Good Leads & Deals</div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
            {goodLeadCount + saleDoneCount}
          </div>
          <div className="text-[10px] sm:text-[11px] text-emerald-600 font-medium mt-1 truncate">
            {saleDoneCount} closed ({conversionRate}%)
          </div>
        </div>

        <div className="p-3.5 sm:p-4 bg-white border border-slate-200/80 rounded-2xl shadow-xs">
          <div className="text-[11px] sm:text-xs font-semibold text-slate-500 truncate">Follow-up Needed</div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
            {didNotConnectCount}
          </div>
          <div className="text-[10px] sm:text-[11px] text-slate-400 font-medium mt-1 truncate">
            Pending telephone connect
          </div>
        </div>

        <div
          onClick={() => setActiveTab("skipped")}
          className="p-3.5 sm:p-4 bg-white border border-slate-200/80 rounded-2xl shadow-xs cursor-pointer hover:border-rose-300 transition-colors"
        >
          <div className="text-[11px] sm:text-xs font-semibold text-slate-500 flex items-center justify-between">
            <span className="truncate">Skipped Records</span>
            {skippedCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse shrink-0"></span>
            )}
          </div>
          <div className="text-xl sm:text-2xl font-bold text-rose-600 mt-1">
            {skippedCount}
          </div>
          <div className="text-[10px] sm:text-[11px] text-slate-400 font-medium mt-1 truncate">
            Missing phone & email
          </div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
        {/* Table Controls / Filter Bar */}
        <div className="p-3.5 sm:p-4 border-b border-slate-200/80 space-y-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Tab switch */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-full sm:w-fit overflow-x-auto">
              <button
                onClick={() => setActiveTab("imported")}
                className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap text-center ${activeTab === "imported"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                  }`}
              >
                Imported Leads ({importedLeads.length})
              </button>
              <button
                onClick={() => setActiveTab("skipped")}
                className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap text-center ${activeTab === "skipped"
                    ? "bg-white text-rose-700 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                  }`}
              >
                Skipped ({skippedLeads.length})
              </button>
            </div>

            {/* Search Input Bar */}
            <div className="flex items-center gap-2 w-full md:max-w-md">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Enter email or phone number..."
                  className="w-full pl-3.5 pr-9 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-[#0f5c53] bg-slate-50/50"
                />
                <button
                  type="button"
                  aria-label="Search"
                  className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-[#0f5c53]"
                >
                  <Search className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("ALL");
                  setSourceFilter("ALL");
                }}
                className="p-2 rounded-xl border border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors shrink-0"
                title="Reset filters"
                aria-label="Reset filters"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Filters (Horizontal scroll on mobile) */}
          <div className="flex items-center gap-2 pt-1 text-xs overflow-x-auto scrollbar-none pb-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
              Status:
            </span>
            {[
              { id: "ALL", label: "All" },
              { id: "GOOD_LEAD_FOLLOW_UP", label: "Good Lead" },
              { id: "SALE_DONE", label: "Sale Done" },
              { id: "DID_NOT_CONNECT", label: "Did Not Connect" },
              { id: "BAD_LEAD", label: "Bad Lead" },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setStatusFilter(st.id)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all whitespace-nowrap shrink-0 ${statusFilter === st.id
                    ? "bg-[#0f5c53] text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200/70"
                  }`}
              >
                {st.label}
              </button>
            ))}

            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider ml-2 mr-1 shrink-0">
              Source:
            </span>
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              aria-label="Filter by Data Source"
              className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-xs font-medium text-slate-700 focus:outline-hidden shrink-0"
            >
              <option value="ALL">All Sources</option>
              <option value="leads_on_demand">leads_on_demand</option>
              <option value="meridian_tower">meridian_tower</option>
              <option value="eden_park">eden_park</option>
              <option value="varah_swamy">varah_swamy</option>
              <option value="sarjapur_plots">sarjapur_plots</option>
              <option value="NONE">Unspecified ("")</option>
            </select>
          </div>
        </div>

        {/* Table Content */}
        {filteredLeads.length === 0 ? (
          <div className="py-12 sm:py-16 text-center px-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">
              No leads matching the criteria
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Try adjusting your search query, status filters, or import a new CSV file.
            </p>
            <button
              onClick={onOpenImportModal}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0f5c53] text-white text-xs font-semibold shadow-xs hover:bg-[#0a443d] transition-colors"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              Import CSV
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-left text-xs border-collapse min-w-[700px]">
              <thead className="table-sticky-header">
                <tr className="border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500 bg-slate-50/80">
                  <th className="px-3 sm:px-4 py-3 font-bold min-w-[140px]">LEAD NAME</th>
                  <th className="px-3 sm:px-4 py-3 font-bold min-w-[160px]">EMAIL</th>
                  <th className="px-3 sm:px-4 py-3 font-bold min-w-[130px]">CONTACT</th>
                  <th className="px-3 sm:px-4 py-3 font-bold min-w-[120px]">DATE CREATED</th>
                  <th className="px-3 sm:px-4 py-3 font-bold min-w-[120px]">COMPANY</th>
                  <th className="px-3 sm:px-4 py-3 font-bold min-w-[110px]">STATUS</th>
                  <th className="px-3 sm:px-4 py-3 font-bold min-w-[120px]">DATA SOURCE</th>
                  <th className="px-3 sm:px-4 py-3 font-bold min-w-[120px]">LEAD OWNER</th>
                  <th className="px-3 sm:px-4 py-3 font-bold text-right min-w-[80px]">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {visibleLeads.map((lead, idx) => (
                  <tr
                    key={idx}
                    className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                    onClick={() => onSelectLead(lead)}
                  >
                    {/* Lead Name */}
                    <td className="px-3 sm:px-4 py-3.5 font-semibold text-slate-900 truncate">
                      {lead.name || (
                        <span className="text-slate-400 italic">Unnamed</span>
                      )}
                    </td>

                    {/* Email */}
                    <td className="px-3 sm:px-4 py-3.5 font-mono text-[11px] text-slate-600 truncate">
                      {lead.email || <span className="text-slate-300">—</span>}
                    </td>

                    {/* Contact */}
                    <td className="px-3 sm:px-4 py-3.5 font-mono text-[11px] text-slate-700 whitespace-nowrap">
                      {lead.country_code ? `${lead.country_code} ` : ""}
                      {lead.mobile_without_country_code || (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>

                    {/* Date Created */}
                    <td className="px-3 sm:px-4 py-3.5 text-slate-500 whitespace-nowrap">
                      {formatDisplayDate(lead.created_at)}
                    </td>

                    {/* Company */}
                    <td className="px-3 sm:px-4 py-3.5 text-slate-600 truncate">
                      {lead.company || (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>

                    {/* Status Pill */}
                    <td className="px-3 sm:px-4 py-3.5 whitespace-nowrap">
                      {activeTab === "skipped" ? (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                          {lead._skip_reason || "Skipped"}
                        </span>
                      ) : (
                        renderStatusPill(lead.crm_status)
                      )}
                    </td>

                    {/* Data Source */}
                    <td className="px-3 sm:px-4 py-3.5 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                      {lead.data_source ? (
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono text-[10px]">
                          {lead.data_source}
                        </span>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>

                    {/* Lead Owner */}
                    <td className="px-3 sm:px-4 py-3.5 text-slate-600 truncate">
                      {lead.lead_owner || (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>

                    {/* Actions ("More >") */}
                    <td className="px-3 sm:px-4 py-3.5 text-right whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectLead(lead);
                        }}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-[#0f5c53] px-2.5 py-1 rounded-lg hover:bg-teal-50 transition-colors"
                      >
                        More <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {filteredLeads.length > visibleCount && (
          <div className="p-3.5 sm:p-4 border-t border-slate-100 text-center bg-slate-50/50">
            <button
              onClick={() => setVisibleCount((prev) => prev + 15)}
              className="px-6 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs transition-colors"
            >
              Load more ({filteredLeads.length - visibleCount} remaining)
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
