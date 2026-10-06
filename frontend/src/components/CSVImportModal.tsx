"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  X,
  UploadCloud,
  FileText,
  AlertCircle,
  CheckCircle2,
  Download,
  Sparkles,
  Loader2,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import { PreviewData, ImportResult } from "../types/crm";
import { uploadCSVFile, confirmCSVImport, loadSampleData } from "../lib/api";

interface CSVImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: (result: ImportResult, filename: string) => void;
}

export const CSVImportModal: React.FC<CSVImportModalProps> = ({
  isOpen,
  onClose,
  onImportSuccess,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [progressStatus, setProgressStatus] = useState<string>("");

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Reset state when modal is closed
  useEffect(() => {
    if (!isOpen) {
      setPreviewData(null);
      setSelectedFile(null);
      setErrorMessage(null);
      setIsProcessingAI(false);
      setIsLoadingPreview(false);
      setProgressStatus("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFileSelect = async (file: File) => {
    if (!file.name.toLowerCase().endsWith(".csv")) {
      setErrorMessage("Please select a valid CSV file (.csv format only).");
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      setErrorMessage("File size exceeds 25MB limit.");
      return;
    }

    setErrorMessage(null);
    setSelectedFile(file);
    setIsLoadingPreview(true);

    try {
      const data = await uploadCSVFile(file);
      setPreviewData(data);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to parse CSV preview");
      setSelectedFile(null);
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleSampleSelect = async (sampleName: string) => {
    setIsLoadingPreview(true);
    setErrorMessage(null);
    try {
      const data = await loadSampleData(sampleName);
      setPreviewData(data);
      // Create a dummy file object representation
      setSelectedFile(
        new File([new Blob()], data.filename, { type: "text/csv" })
      );
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to load sample dataset");
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const handleConfirmImport = async () => {
    if (!previewData) return;

    setIsProcessingAI(true);
    setErrorMessage(null);
    setProgressStatus("Connecting to Groq AI...");

    try {
      setProgressStatus("Analyzing columns and batching rows...");
      const result = await confirmCSVImport(
        previewData.headers,
        previewData.rows,
        15
      );

      setProgressStatus("Mapping complete! Rendering leads...");
      onImportSuccess(result, previewData.filename);
      onClose();
    } catch (err: any) {
      setErrorMessage(
        err.message || "An error occurred during AI lead extraction."
      );
    } finally {
      setIsProcessingAI(false);
    }
  };

  const downloadSampleTemplate = () => {
    const csvContent =
      "created_at,name,email,country_code,mobile_without_country_code,company,city,state,country,lead_owner,crm_status,crm_note,data_source,possession_time,description\n" +
      '2026-05-13 14:20:48,John Doe,john.doe@example.com,+91,9876543210,DataWeave,Mumbai,Maharashtra,India,test@gmail.com,GOOD_LEAD_FOLLOW_UP,Client is asking to reschedule demo,meridian_tower,Ready to Move,Interested in 3BHK\n' +
      '2026-05-13 14:25:30,Sarah Johnson,sarah.johnson@example.com,+91,9876543211,Tech Solutions,Bangalore,Karnataka,India,test@gmail.com,DID_NOT_CONNECT,"Person was busy, will try again next week",leads_on_demand,Dec 2026,Floor plans sent';

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "dataweave_sample_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >

        <div className="p-6 pb-4 border-b border-slate-100/80 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Import Leads via CSV
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Upload a CSV file to bulk import leads into your system.
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessingAI}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {errorMessage && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs font-medium text-rose-800 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1">{errorMessage}</div>
            </div>
          )}

          {!previewData && !isLoadingPreview && (
            <div className="space-y-4">

              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-3xl p-8 text-center transition-all cursor-pointer flex flex-col items-center justify-center ${isDragging
                  ? "border-[#f87146] bg-orange-50/50 scale-[0.99]"
                  : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      handleFileSelect(e.target.files[0]);
                    }
                  }}
                  accept=".csv"
                  className="hidden"
                />

                <div className="w-14 h-14 rounded-2xl border border-slate-200 flex items-center justify-center text-slate-500 mb-4 bg-slate-50/50 shadow-xs">
                  <UploadCloud className="w-7 h-7 text-[#0f5c53]" />
                </div>

                <h3 className="text-base font-bold text-slate-900 mb-1">
                  Drop your CSV file here
                </h3>
                <p className="text-xs text-slate-500 mb-4">
                  or click to browse files
                </p>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-[11px] font-semibold text-slate-600 mb-4">
                  <span className="text-slate-400">ⓘ</span> Supported file: .csv (max 25MB)
                </div>

                <p className="text-[11px] text-slate-400 max-w-lg leading-relaxed mb-5">
                  Universal AI Importer maps headers automatically (e.g., Facebook, Google Ads, Real Estate CRMs, Excel, messy formats) into DataWeave CRM fields.
                </p>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    downloadSampleTemplate();
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-50/80 hover:bg-teal-100/80 text-[#0f5c53] text-xs font-semibold border border-teal-200/60 transition-colors"
                >
                  <FileText className="w-3.5 h-3.5" />
                  Download Sample CSV Template
                </button>
              </div>

              <div className="pt-2">
                <div className="text-xs font-semibold text-slate-500 mb-2">
                  Or test immediately with pre-loaded datasets:
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: "facebook_leads", label: "Facebook Leads" },
                    { id: "google_ads_export", label: "Google Ads" },
                    { id: "real_estate_crm", label: "Real Estate CRM" },
                    { id: "messy_leads_unstructured", label: "Messy CSV" },
                  ].map((sample) => (
                    <button
                      key={sample.id}
                      type="button"
                      onClick={() => handleSampleSelect(sample.id)}
                      className="px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition-colors text-center truncate border border-slate-200/60"
                    >
                      {sample.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {isLoadingPreview && (
            <div className="py-16 text-center flex flex-col items-center justify-center space-y-3">
              <Loader2 className="w-8 h-8 text-[#0f5c53] animate-spin" />
              <p className="text-sm font-semibold text-slate-700">
                Parsing CSV structure...
              </p>
            </div>
          )}

          {previewData && !isLoadingPreview && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-100/70 border border-teal-200 text-[#0f5c53] flex items-center justify-center font-bold text-xs shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900 truncate max-w-sm sm:max-w-md">
                      {previewData.filename}
                    </div>
                    <div className="text-xs text-slate-500">
                      {previewData.totalRows} records found • {previewData.headers.length} columns detected
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setPreviewData(null);
                    setSelectedFile(null);
                  }}
                  disabled={isProcessingAI}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
                  title="Remove file"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {isProcessingAI && (
                <div className="p-4 bg-orange-50/80 border border-orange-200/80 rounded-2xl space-y-2.5 animate-pulse">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#f87146]">
                    <Sparkles className="w-4 h-4 animate-spin" />
                    <span>AI EXTRACTION IN PROGRESS</span>
                  </div>
                  <div className="text-xs text-slate-700 font-medium">
                    {progressStatus || "Normalizing schema with Groq LLM..."}
                  </div>
                  <div className="w-full bg-orange-100 rounded-full h-2 overflow-hidden">
                    <div className="bg-[#f87146] h-2 rounded-full w-3/4 animate-pulse"></div>
                  </div>
                </div>
              )}


              <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs">
                <div className="px-4 py-2.5 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between text-xs font-semibold text-slate-600">
                  <span>Raw CSV Preview (First {previewData.preview.length} Rows)</span>
                  <span className="text-[11px] text-slate-400">
                    No AI changes applied yet
                  </span>
                </div>

                <div className="max-h-64 overflow-auto scrollbar-thin">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="table-sticky-header-modal">
                      <tr className="border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-600 bg-white">
                        <th className="px-3 py-2.5 font-bold text-slate-400 w-10 text-center">
                          #
                        </th>
                        {previewData.headers.map((header) => (
                          <th
                            key={header}
                            className="px-3 py-2.5 font-bold text-slate-700 whitespace-nowrap bg-white border-b border-slate-200"
                          >
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {previewData.preview.map((row, idx) => (
                        <tr
                          key={idx}
                          className="hover:bg-slate-50/80 transition-colors"
                        >
                          <td className="px-3 py-2.5 text-center text-slate-400 font-mono text-[10px]">
                            {idx + 1}
                          </td>
                          {previewData.headers.map((header) => (
                            <td
                              key={header}
                              className="px-3 py-2.5 whitespace-nowrap max-w-xs truncate"
                            >
                              {row[header] || (
                                <span className="text-slate-300 italic">—</span>
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 sm:p-6 border-t border-slate-100 flex items-center justify-between bg-white">
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessingAI}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleConfirmImport}
            disabled={!previewData || isProcessingAI || isLoadingPreview}
            className={`px-8 py-2.5 rounded-xl text-sm font-semibold shadow-sm flex items-center gap-2 transition-all ${!previewData || isProcessingAI
              ? "bg-slate-200 text-slate-400 cursor-not-allowed"
              : "bg-[#f87146] hover:bg-[#e05b30] text-white active:scale-95"
              }`}
          >
            {isProcessingAI ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                Extracting with AI...
              </>
            ) : (
              <>
                Upload File
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
