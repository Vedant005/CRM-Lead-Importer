import { ImportResult, PreviewData, SampleDataset } from "../types/crm";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

/**
 * Upload CSV file for preview parsing
 */
export async function uploadCSVFile(file: File): Promise<PreviewData> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/preview`, {
    method: "POST",
    body: formData,
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || "Failed to parse CSV file");
  }

  return data;
}

/**
 * Confirm and trigger AI extraction on CSV records
 */
export async function confirmCSVImport(
  headers: string[],
  rows: Record<string, string>[],
  batchSize: number = 15
): Promise<ImportResult> {
  const response = await fetch(`${API_BASE_URL}/confirm`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      headers,
      rows,
      batchSize,
    }),
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || "AI Extraction failed");
  }

  return data;
}

/**
 * Fetch available preloaded sample datasets
 */
export async function fetchSampleDatasets(): Promise<SampleDataset[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/samples`);
    const data = await response.json();
    return data.samples || [];
  } catch (error) {
    console.error("Failed to load sample datasets:", error);
    return [];
  }
}

/**
 * Load a specific sample dataset by name
 */
export async function loadSampleData(sampleName: string): Promise<PreviewData> {
  const response = await fetch(`${API_BASE_URL}/samples/${sampleName}`);
  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || `Failed to load sample ${sampleName}`);
  }
  return data;
}
