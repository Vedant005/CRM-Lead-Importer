import fs from "fs";
import csv from "csv-parser";

/**
 * Parses a CSV file into structured headers and row objects.
 * Handles BOM characters, whitespace trimming, and optional cleanup.
 *
 * @param {string} filePath - Absolute path to the CSV file
 * @param {boolean} autoCleanup - If true, deletes the file from disk after reading
 * @returns {Promise<{headers: string[], preview: object[], totalRows: number, rows: object[]}>}
 */
export const parseCSV = (filePath, autoCleanup = false) => {
  return new Promise((resolve, reject) => {
    const rows = [];
    let headers = [];

    const stream = fs.createReadStream(filePath);

    stream
      .pipe(
        csv({
          mapHeaders: ({ header }) => header.replace(/^\uFEFF/, "").trim(),
          mapValues: ({ value }) => (typeof value === "string" ? value.trim() : value),
        })
      )
      .on("headers", (h) => {
        headers = h;
      })
      .on("data", (row) => {
        rows.push(row);
      })
      .on("end", () => {
        // If headers weren't captured by event, grab keys from first row
        if (!headers.length && rows.length > 0) {
          headers = Object.keys(rows[0]);
        }

        if (autoCleanup) {
          fs.unlink(filePath, (err) => {
            if (err) console.error("Failed to delete temp file:", filePath, err);
          });
        }

        resolve({
          headers,
          preview: rows.slice(0, 10),
          totalRows: rows.length,
          rows,
        });
      })
      .on("error", (error) => {
        if (autoCleanup) {
          fs.unlink(filePath, () => {});
        }
        reject(error);
      });
  });
};
