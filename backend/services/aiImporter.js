import groq from "../config/groq.config.js";

const ALLOWED_CRM_STATUS = [
  "GOOD_LEAD_FOLLOW_UP",
  "DID_NOT_CONNECT",
  "BAD_LEAD",
  "SALE_DONE",
];

const ALLOWED_DATA_SOURCES = [
  "leads_on_demand",
  "meridian_tower",
  "eden_park",
  "varah_swamy",
  "sarjapur_plots",
];

const SYSTEM_PROMPT = `
You are an expert AI CSV Lead Extractor & Schema Normalizer for GrowEasy CRM.

Your task is to analyze arbitrary CSV rows (from Facebook Ads, Google Ads, Real Estate CRMs, Excel, Sales reports, Marketing Agencies, or messy spreadsheets) and accurately extract and map each lead into GrowEasy CRM format.

### Target Schema Fields:
- created_at: Lead creation date/time (ISO 8601 string e.g. "2026-05-13T14:20:48Z" or "2026-05-13 14:20:48" that MUST be valid for JavaScript 'new Date(created_at)'). If missing, use current date/time.
- name: Full name of lead / prospect / customer.
- email: Primary email address (first valid email if multiple).
- country_code: Country phone prefix code with '+' (e.g. "+91", "+1", "+44"). If absent, infer from number format or default to "+91" if standard 10-digit Indian mobile.
- mobile_without_country_code: Mobile number digits ONLY without country prefix or spaces/hyphens (e.g. "9876543210").
- company: Company name / organization.
- city: City name.
- state: State name.
- country: Country name.
- lead_owner: Assigned sales rep, agent, or owner email/name.
- crm_status: STRICTLY one of:
  * "GOOD_LEAD_FOLLOW_UP" (interested, inquiry, demo scheduled, callback, in progress)
  * "DID_NOT_CONNECT" (ringing, busy, switched off, no response, left voicemail)
  * "BAD_LEAD" (not interested, invalid inquiry, wrong number, junk, spam)
  * "SALE_DONE" (closed won, deal signed, purchased, booked, payment received)
  (Infer from status, remarks, or notes. Default to "GOOD_LEAD_FOLLOW_UP" if unclear).
- crm_note: Consolidated notes including:
  * Original remarks and follow-up notes
  * Extra phone numbers (if row had multiple phones)
  * Extra email addresses (if row had multiple emails)
  * Any unmapped relevant information from the row
- data_source: STRICTLY one of:
  * "leads_on_demand"
  * "meridian_tower"
  * "eden_park"
  * "varah_swamy"
  * "sarjapur_plots"
  (Match case-insensitively with project/campaign/source names. If none match confidently, MUST be empty string "").
- possession_time: Property possession timeline (e.g., "Ready to Move", "Dec 2026", "Immediate", "Under Construction"). Leave empty if not applicable.
- description: Additional lead description, ad campaign details, or requirements.

### Critical Rules:
1. MULTIPLE CONTACTS:
   - Primary email in 'email', remaining emails appended to 'crm_note'.
   - Primary mobile in 'mobile_without_country_code', remaining numbers appended to 'crm_note'.
2. SKIP RULE:
   - If a record has NEITHER a valid email NOR a valid mobile number, set "skip": true with "skip_reason": "Missing both email and mobile number".
   - Otherwise, set "skip": false.
3. OUTPUT FORMAT:
   Return ONLY a valid JSON object matching this exact structure:
   {
     "records": [
       {
         "skip": false,
         "skip_reason": "",
         "record": {
           "created_at": "2026-05-13 14:20:48",
           "name": "John Doe",
           "email": "john.doe@example.com",
           "country_code": "+91",
           "mobile_without_country_code": "9876543210",
           "company": "GrowEasy",
           "city": "Mumbai",
           "state": "Maharashtra",
           "country": "India",
           "lead_owner": "test@gmail.com",
           "crm_status": "GOOD_LEAD_FOLLOW_UP",
           "crm_note": "Client is asking to reschedule demo",
           "data_source": "",
           "possession_time": "",
           "description": ""
         }
       }
     ]
   }
`;

/**
 * Sanitizes and validates extracted CRM records against strict rules.
 */
export const sanitizeRecord = (item, originalRow = {}) => {
  if (!item || typeof item !== "object") {
    return {
      skip: true,
      skip_reason: "Invalid record format from AI",
      record: { ...originalRow },
    };
  }

  const rec = item.record || item;
  let skip = Boolean(item.skip);
  let skip_reason = item.skip_reason || "";

  // Normalize email
  let email = (rec.email || "").toString().trim();
  if (email.toLowerCase() === "n/a" || email.toLowerCase() === "null" || email.toLowerCase() === "undefined") {
    email = "";
  }

  // Normalize mobile
  let mobile = (rec.mobile_without_country_code || "").toString().replace(/[^0-9]/g, "");
  let countryCode = (rec.country_code || "").toString().trim();
  if (countryCode && !countryCode.startsWith("+") && countryCode.length <= 4) {
    countryCode = `+${countryCode}`;
  }

  // Skip rule verification: Must have at least email or mobile
  if (!email && !mobile) {
    skip = true;
    if (!skip_reason) skip_reason = "Missing both email and mobile number";
  }

  // Validate crm_status
  let crm_status = (rec.crm_status || "").trim();
  if (!ALLOWED_CRM_STATUS.includes(crm_status)) {
    // Map common keywords if AI returned a variant
    const upper = crm_status.toUpperCase();
    if (upper.includes("SALE") || upper.includes("WON") || upper.includes("CLOSED")) {
      crm_status = "SALE_DONE";
    } else if (upper.includes("BAD") || upper.includes("LOST") || upper.includes("JUNK") || upper.includes("NOT_INTERESTED")) {
      crm_status = "BAD_LEAD";
    } else if (upper.includes("CONNECT") || upper.includes("RING") || upper.includes("BUSY") || upper.includes("UNREACHABLE")) {
      crm_status = "DID_NOT_CONNECT";
    } else {
      crm_status = "GOOD_LEAD_FOLLOW_UP";
    }
  }

  // Validate data_source
  let data_source = (rec.data_source || "").toLowerCase().trim().replace(/[-\s]/g, "_");
  if (!ALLOWED_DATA_SOURCES.includes(data_source)) {
    data_source = "";
  }

  // Validate created_at
  let created_at = rec.created_at;
  if (!created_at || isNaN(new Date(created_at).getTime())) {
    created_at = new Date().toISOString().replace("T", " ").substring(0, 19);
  }

  return {
    skip,
    skip_reason,
    record: {
      created_at,
      name: (rec.name || "").trim(),
      email,
      country_code: countryCode,
      mobile_without_country_code: mobile,
      company: (rec.company || "").trim(),
      city: (rec.city || "").trim(),
      state: (rec.state || "").trim(),
      country: (rec.country || "").trim(),
      lead_owner: (rec.lead_owner || "").trim(),
      crm_status,
      crm_note: (rec.crm_note || "").trim(),
      data_source,
      possession_time: (rec.possession_time || "").trim(),
      description: (rec.description || "").trim(),
    },
  };
};

/**
 * Process a batch of rows through Groq LLM with fallback and retry resilience.
 */
export const processBatch = async (headers, rows) => {
  const model = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

  try {
    const completion = await groq.chat.completions.create({
      model,
      temperature: 0.1,
      response_format: {
        type: "json_object",
      },
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: JSON.stringify({
            headers,
            rows,
          }),
        },
      ],
    });

    const parsed = JSON.parse(completion.choices[0].message.content);
    const rawRecords = parsed.records || parsed.data || parsed.leads || [];

    // Ensure matching length and sanitize each record
    const sanitized = rows.map((originalRow, index) => {
      const aiItem = rawRecords[index];
      return sanitizeRecord(aiItem, originalRow);
    });

    return { records: sanitized };
  } catch (error) {
    console.error("Groq API error during batch processing:", error.message);
    throw error;
  }
};
