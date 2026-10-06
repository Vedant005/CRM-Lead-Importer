import path from "path";
import fs from "fs";
import { parseCSV } from "../services/csv.js";
import { processBatch } from "../services/aiImporter.js";
import { createBatches, withRetry } from "../utils/batchProcessor.js";

/**
 * Handles CSV upload and generates instant preview.
 */
export const uploadCSV = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No CSV file was uploaded. Please attach a valid .csv file.",
      });
    }

    // Parse CSV and auto-cleanup temp file
    const result = await parseCSV(req.file.path, true);

    res.json({
      success: true,
      filename: req.file.originalname,
      fileSize: req.file.size,
      headers: result.headers,
      preview: result.preview,
      totalRows: result.totalRows,
      rows: result.rows,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Handles confirmation and AI extraction for the uploaded records in batches.
 */
export const confirmImport = async (req, res, next) => {
  try {
    const { headers, rows, batchSize = 15 } = req.body;

    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No rows provided for import confirmation.",
      });
    }

    const batches = createBatches(rows, Math.min(Number(batchSize) || 15, 30));
    const imported = [];
    const skipped = [];
    let processedBatches = 0;

    console.log(`Starting AI extraction: ${rows.length} rows across ${batches.length} batches...`);

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      console.log(`Processing batch ${i + 1}/${batches.length} (${batch.length} rows)...`);

      try {
        const result = await withRetry(() => processBatch(headers || Object.keys(rows[0] || {}), batch), 3, 1500);

        if (result && Array.isArray(result.records)) {
          result.records.forEach((item, idx) => {
            if (item.skip) {
              skipped.push({
                ...item.record,
                _skip_reason: item.skip_reason || "Validation criteria not met",
                _original_index: i * (Number(batchSize) || 15) + idx + 1,
              });
            } else {
              imported.push({
                ...item.record,
                _original_index: i * (Number(batchSize) || 15) + idx + 1,
              });
            }
          });
        }
        processedBatches++;
      } catch (batchErr) {
        console.error(`Batch ${i + 1} failed after retries:`, batchErr.message);
        // Fallback: mark batch as skipped with error reason rather than crashing entire import
        batch.forEach((row, idx) => {
          skipped.push({
            ...row,
            _skip_reason: `AI Batch Processing Error: ${batchErr.message}`,
            _original_index: i * (Number(batchSize) || 15) + idx + 1,
          });
        });
      }
    }

    res.json({
      success: true,
      totalProcessed: rows.length,
      importedCount: imported.length,
      skippedCount: skipped.length,
      imported,
      skipped,
      metadata: {
        totalBatches: batches.length,
        processedBatches,
        model: process.env.GROQ_MODEL || "openai/gpt-oss-120b",
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Serves preloaded sample CSV datasets.
 */
export const getSampleDatasets = async (req, res, next) => {
  try {
    const sampleDir = path.resolve("sample_data");
    if (!fs.existsSync(sampleDir)) {
      return res.json({ success: true, samples: [] });
    }

    const files = fs.readdirSync(sampleDir).filter((f) => f.endsWith(".csv"));
    res.json({
      success: true,
      samples: files.map((file) => ({
        id: file.replace(".csv", ""),
        filename: file,
        name: file
          .replace(".csv", "")
          .split("_")
          .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
          .join(" "),
      })),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Loads a specific sample CSV and returns its parsed preview and rows.
 */
export const loadSampleByName = async (req, res, next) => {
  try {
    const { sampleName } = req.params;
    const safeName = path.basename(sampleName).replace(/[^a-zA-Z0-9_-]/g, "");
    const filePath = path.resolve("sample_data", `${safeName}.csv`);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: `Sample dataset '${safeName}' not found.`,
      });
    }

    const result = await parseCSV(filePath, false);

    res.json({
      success: true,
      filename: `${safeName}.csv`,
      headers: result.headers,
      preview: result.preview,
      totalRows: result.totalRows,
      rows: result.rows,
    });
  } catch (error) {
    next(error);
  }
};
