export type CRMStatus =
  | "GOOD_LEAD_FOLLOW_UP"
  | "DID_NOT_CONNECT"
  | "BAD_LEAD"
  | "SALE_DONE";

export type DataSource =
  | "leads_on_demand"
  | "meridian_tower"
  | "eden_park"
  | "varah_swamy"
  | "sarjapur_plots"
  | string;

export interface CRMLeadRecord {
  created_at: string;
  name: string;
  email: string;
  country_code: string;
  mobile_without_country_code: string;
  company: string;
  city: string;
  state: string;
  country: string;
  lead_owner: string;
  crm_status: CRMStatus | string;
  crm_note: string;
  data_source: DataSource;
  possession_time: string;
  description: string;
  _original_index?: number;
  _skip_reason?: string;
}

export interface PreviewData {
  filename: string;
  fileSize?: number;
  headers: string[];
  preview: Record<string, string>[];
  totalRows: number;
  rows: Record<string, string>[];
}

export interface ImportResult {
  success: boolean;
  totalProcessed: number;
  importedCount: number;
  skippedCount: number;
  imported: CRMLeadRecord[];
  skipped: (CRMLeadRecord & { _skip_reason?: string })[];
  metadata?: {
    totalBatches: number;
    processedBatches: number;
    model: string;
  };
}

export interface SampleDataset {
  id: string;
  name: string;
  filename: string;
}
