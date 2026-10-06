"use client";

import React from "react";
import {
  X,
  User,
  Mail,
  Phone,
  Building,
  MapPin,
  Calendar,
  Sparkles,
  FileText,
  Clock,
  ShieldCheck,
  AlertCircle,
  Copy,
  Check,
} from "lucide-react";
import { CRMLeadRecord } from "../types/crm";

interface LeadDetailDrawerProps {
  lead: (CRMLeadRecord & { _skip_reason?: string }) | null;
  onClose: () => void;
}

export const LeadDetailDrawer: React.FC<LeadDetailDrawerProps> = ({
  lead,
  onClose,
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!lead) return null;

  const copyJSON = () => {
    navigator.clipboard.writeText(JSON.stringify(lead, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "SALE_DONE":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "GOOD_LEAD_FOLLOW_UP":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "DID_NOT_CONNECT":
        return "bg-slate-100 text-slate-700 border-slate-300";
      case "BAD_LEAD":
        return "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const isSkipped = Boolean(lead._skip_reason);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-sm flex justify-end animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto transform transition-transform"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900">
                  {lead.name || "Unnamed Lead"}
                </h3>
                {isSkipped ? (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> Skipped
                  </span>
                ) : (
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusBadge(
                      lead.crm_status
                    )}`}
                  >
                    {lead.crm_status.replace(/_/g, " ")}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Row #{lead._original_index || 1} • Extracted via Groq AI
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {isSkipped && (
            <div className="mx-6 mt-4 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">Reason for Skip:</span>{" "}
                {lead._skip_reason}
              </div>
            </div>
          )}

          <div className="p-6 space-y-5">
            <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-100 space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Primary Contact Information
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-3 text-sm text-slate-700">
                  <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="font-medium text-slate-900">
                    {lead.email || (
                      <span className="text-slate-400 italic">No email</span>
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-700">
                  <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="font-medium text-slate-900">
                    {lead.country_code ? `${lead.country_code} ` : ""}
                    {lead.mobile_without_country_code || (
                      <span className="text-slate-400 italic">No mobile</span>
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-700">
                  <Building className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>
                    {lead.company || (
                      <span className="text-slate-400 italic">No company</span>
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-700">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>
                    {[lead.city, lead.state, lead.country]
                      .filter(Boolean)
                      .join(", ") || (
                        <span className="text-slate-400 italic">
                          Location not specified
                        </span>
                      )}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                CRM Mapping Fields
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="text-slate-400 font-medium">Lead Owner</div>
                  <div className="text-slate-800 font-semibold mt-0.5 truncate">
                    {lead.lead_owner || "—"}
                  </div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="text-slate-400 font-medium">Data Source</div>
                  <div className="text-slate-800 font-semibold mt-0.5 truncate">
                    {lead.data_source || "—"}
                  </div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="text-slate-400 font-medium">Created At</div>
                  <div className="text-slate-800 font-semibold mt-0.5 truncate">
                    {lead.created_at || "—"}
                  </div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="text-slate-400 font-medium">Possession Time</div>
                  <div className="text-slate-800 font-semibold mt-0.5 truncate">
                    {lead.possession_time || "—"}
                  </div>
                </div>
              </div>
            </div>

            {lead.crm_note && (
              <div className="space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" />
                  CRM Note & Extra Contacts
                </div>
                <div className="p-3.5 bg-amber-50/60 border border-amber-200/70 rounded-xl text-xs text-slate-700 leading-relaxed whitespace-pre-wrap font-sans">
                  {lead.crm_note}
                </div>
              </div>
            )}

            {lead.description && (
              <div className="space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Description
                </div>
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs text-slate-700 leading-relaxed">
                  {lead.description}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <button
            onClick={copyJSON}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-2 rounded-lg bg-white border border-slate-200 shadow-sm transition-all"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" /> Copied JSON!
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" /> Copy JSON Record
              </>
            )}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-sm"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
