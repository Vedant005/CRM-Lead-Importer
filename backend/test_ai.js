import dotenv from "dotenv";
import path from "path";
import { parseCSV } from "./services/csv.js";
import { sanitizeRecord, processBatch } from "./services/aiImporter.js";
import { createBatches } from "./utils/batchProcessor.js";

dotenv.config();

async function runTests() {
  console.log("==================================================");
  console.log(" STARTING BACKEND & GROQ AI EXTRACTION TESTS");
  console.log("==================================================");

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  // TEST 1: CSV Parser Test
  console.log("\n[TEST 1] CSV Parser on sample_data/facebook_leads.csv");
  const samplePath = path.resolve("sample_data", "facebook_leads.csv");
  try {
    const csvResult = await parseCSV(samplePath);
    assert(Array.isArray(csvResult.headers) && csvResult.headers.length > 0, "Headers extracted");
    assert(csvResult.totalRows === 4, `Total rows parsed correctly (${csvResult.totalRows} === 4)`);
    assert(csvResult.preview.length === 4, "Preview generated");
  } catch (err) {
    assert(false, `CSV parser failed: ${err.message}`);
  }

  // TEST 2: Batch Creator Test
  console.log("\n[TEST 2] Batch Processor");
  const mockRows = Array.from({ length: 35 }, (_, i) => ({ id: i + 1 }));
  const batches = createBatches(mockRows, 10);
  assert(batches.length === 4, `Batch chunking created 4 batches (${batches.length} === 4)`);
  assert(batches[0].length === 10, "First batch has 10 items");
  assert(batches[3].length === 5, "Last batch has 5 items");

  // TEST 3: Schema Sanitizer & Skip Rules
  console.log("\n[TEST 3] Sanitizer & Edge Cases");

  // Valid row
  const validLead = sanitizeRecord({
    skip: false,
    record: {
      created_at: "2026-05-13 14:20:48",
      name: "John Doe",
      email: "john.doe@example.com",
      country_code: "91",
      mobile_without_country_code: "+91 98765-43210",
      crm_status: "Intereseted lead demo",
      data_source: "meridian-tower",
    },
  });
  assert(!validLead.skip, "Valid lead is not skipped");
  assert(validLead.record.country_code === "+91", "Country code prefixed with +");
  assert(validLead.record.mobile_without_country_code === "919876543210", "Phone digits stripped cleanly");
  assert(validLead.record.crm_status === "GOOD_LEAD_FOLLOW_UP", "Status inferred to GOOD_LEAD_FOLLOW_UP");
  assert(validLead.record.data_source === "meridian_tower", "Data source normalized to meridian_tower");
  assert(!isNaN(new Date(validLead.record.created_at).getTime()), "created_at is valid JS Date");

  // Invalid row: No email AND no mobile -> Must be skipped
  const invalidLead = sanitizeRecord({
    skip: false,
    record: {
      name: "Ghost Prospect",
      email: "",
      mobile_without_country_code: "",
      crm_status: "BAD_LEAD",
    },
  });
  assert(invalidLead.skip === true, "Lead without email and phone is marked skip: true");
  assert(invalidLead.skip_reason.includes("Missing both"), "Skip reason specifies missing contact info");

  // Invalid data_source -> Must be empty string
  const unmatchedSource = sanitizeRecord({
    skip: false,
    record: {
      email: "test@example.com",
      data_source: "billboard_ad",
    },
  });
  assert(unmatchedSource.record.data_source === "", "Unmatched data_source converted to empty string");

  // TEST 4: Live Groq API Test (if key provided)
  const apiKey = process.env.GROQ_API_KEY;
  if (apiKey && apiKey !== "your_groq_api_key_here") {
    console.log("\n[TEST 4] Live Groq AI Processing Test with messy_leads_unstructured.csv...");
    try {
      const messyPath = path.resolve("sample_data", "messy_leads_unstructured.csv");
      const messyData = await parseCSV(messyPath);
      console.log(`  Sending ${messyData.rows.length} rows to Groq model: ${process.env.GROQ_MODEL || "openai/gpt-oss-120b"}`);

      const aiResult = await processBatch(messyData.headers, messyData.rows);
      assert(Array.isArray(aiResult.records), "AI returned records array");
      assert(aiResult.records.length === messyData.rows.length, "Returned record count matches input rows");

      const skippedItems = aiResult.records.filter((r) => r.skip);
      const importedItems = aiResult.records.filter((r) => !r.skip);

      console.log(`  📊 Result: ${importedItems.length} Imported, ${skippedItems.length} Skipped`);
      assert(skippedItems.length >= 2, "Correctly identified and skipped records with no email/phone");

      importedItems.forEach((item, idx) => {
        assert(!isNaN(new Date(item.record.created_at).getTime()), `Imported lead #${idx + 1} has valid JS Date (${item.record.created_at})`);
        assert(
          ["GOOD_LEAD_FOLLOW_UP", "DID_NOT_CONNECT", "BAD_LEAD", "SALE_DONE"].includes(item.record.crm_status),
          `Imported lead #${idx + 1} has valid crm_status: ${item.record.crm_status}`
        );
      });
    } catch (err) {
      console.error(" Groq Live Test Error:", err.message);
      failed++;
    }
  } else {
    console.log("\n[TEST 4] Skipped Live Groq API Test (Set a valid GROQ_API_KEY in backend/.env to run live LLM test)");
  }

  console.log("\n==================================================");
  console.log(`TEST SUMMARY: ${passed} Passed, ${failed} Failed`);
  console.log("==================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
