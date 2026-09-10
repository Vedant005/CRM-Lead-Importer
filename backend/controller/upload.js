import { parseCSV } from "../services/csv.js";
import { processBatch } from "../services/aiImporter.js";
import { createBatches } from "../utils/batchProcessor.js";

export const uploadCSV = async (req, res) => {
  const result = await parseCSV(req.file.path);

  res.json({
    success: true,
    ...result,
  });
};

export const confirmImport = async (req, res) => {
  const { headers, rows } = req.body;

  const batches = createBatches(rows, 75);

  const imported = [];

  const skipped = [];

  for (const batch of batches) {
    const result = await processBatch(headers, batch);

    result.records.forEach((item) => {
      if (item.skip) skipped.push(item.record);
      else imported.push(item.record);
    });
  }

  res.json({
    success: true,

    importedCount: imported.length,

    skippedCount: skipped.length,

    imported,

    skipped,
  });
};
