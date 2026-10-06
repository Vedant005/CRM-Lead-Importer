# DataWeave AI — Universal CSV to CRM Lead Importer

[![Next.js](https://img.shields.io/badge/Next.js-15.1.0-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4.0-38bdf8?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-green?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![Groq AI](https://img.shields.io/badge/Groq_AI-Llama_3.3_70B-orange?style=for-the-badge&logo=fastapi)](https://groq.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)

An enterprise-grade, **AI-powered lead ingestion & schema normalization system** built for **DataWeave CRM**. It seamlessly transforms messy, arbitrary CSV exports from Facebook Ads, Google Ads, Real Estate CRMs, Marketing Agencies, and unstructured spreadsheets into standardized, validated CRM leads with zero manual column mapping.

---

## System Architecture & Visual Design

```
Raw CSV Upload (Any Format / Headers)
   │
   ▼
[Step 1: Frontend Drag & Drop / File Picker / 1-Click Samples]
   │
   ▼
[Step 2: Instant Client/Server CSV Preview (No AI yet)]
   │
   ▼
[Step 3: User Confirmation Trigger]
   │
   ▼
[Backend: Batch Processor + Groq LLM (llama-3.3-70b-versatile)]
   │
   ├─► Intelligent Column Inference & Entity Extraction
   ├─► Contact Isolation (Primary vs. Note Consolidation)
   ├─► Status & Source Enum Normalization
   ├─► JavaScript ISO Date Standardization
   └─► Auto-Skip Rule Enforcement (Missing Phone + Email)
   │
   ▼
[Step 4: Interactive Leads Dashboard + KPI Metrics + CSV/JSON Export]
```

---

## Key Features

### 1. Intelligent AI Extraction & Field Inference
- **Zero Configuration**: Handles arbitrary column headers (e.g., `Customer Phone`, `Mob`, `Phone No`, `Primary Mail`, `Electronic Mail`, `Ad Campaign`).
- **Target GrowEasy CRM Schema**:
  | CRM Field | Description & Normalization Rule |
  | :--- | :--- |
  | `created_at` | ISO 8601 string compatible with `new Date(created_at)` |
  | `name` | Lead Full Name / Prospect Name |
  | `email` | Primary valid email address |
  | `country_code` | Dialing code with `+` prefix (e.g. `+91`, `+1`) |
  | `mobile_without_country_code` | Digits-only local mobile number |
  | `company` | Organization / Business name |
  | `city`, `state`, `country` | Normalized geographical location fields |
  | `lead_owner` | Assigned sales agent or representative email/name |
  | `crm_status` | Strictly normalized to: `GOOD_LEAD_FOLLOW_UP`, `DID_NOT_CONNECT`, `BAD_LEAD`, or `SALE_DONE` |
  | `data_source` | Strictly matched to: `leads_on_demand`, `meridian_tower`, `eden_park`, `varah_swamy`, `sarjapur_plots`, or `""` |
  | `possession_time` | Real estate possession timeline (e.g. "Ready to Move", "Dec 2026") |
  | `description` | Additional project details / ad requirements |
  | `crm_note` | Consolidated follow-up remarks, alternate emails, and alternate phone numbers |

### 2. Advanced Rule Enforcement & Sanitization
- **Multi-Contact Splitting**: Retains the first primary phone and email in their respective fields while seamlessly appending all alternate numbers and secondary emails into `crm_note`.
- **Automatic Invalidation (Skip Rule)**: Records lacking **both** an email address and a mobile number are automatically skipped and categorized with clear audit reasons.
- **Fail-Safe Post-Processor**: Strict schema validation ensures that any minor deviations in LLM output are sanitized into valid enums before rendering.

### 3. Modern, Responsive Frontend (Tailwind CSS v4)
- **4-Step Guided Ingestion Workflow**:
  - **Step 1**: Interactive Drag & Drop zone with file picker and template download.
  - **Step 2**: Instant raw CSV preview with sticky table headers and row counts (no AI latency).
  - **Step 3**: Interactive confirmation with real-time progress indicators during AI batching.
  - **Step 4**: Full results dashboard featuring KPI metric cards, status pill indicators, search filters, and single-click CSV/JSON export.
- **Lead Detail Drawer**: Slide-over drawer to inspect every CRM lead, full contact history, and copy raw JSON records.
- **Mobile & Tablet Responsive**: Responsive sidebar with slide-over drawer, sticky mobile navigation, and backdrop-click dismissibility on all modals.

---

##  Tech Stack

### Frontend
- **Framework**: [Next.js 15 (App Router)](https://nextjs.org/)
- **UI & Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Language**: TypeScript

### Backend
- **Runtime**: Node.js (ES Modules)
- **Server**: [Express 5](https://expressjs.com/)
- **File Uploads**: [Multer](https://github.com/expressjs/multer)
- **CSV Parser**: [csv-parser](https://github.com/mafintosh/csv-parser) (with stream support, BOM stripping, and automatic cleanup)
- **AI Engine**: [Groq Cloud SDK](https://console.groq.com/) using `llama-3.3-70b-versatile` (high throughput & ultra-low latency)

---

##  Repository Structure

```tree
csv_importor/
├── backend/
│   ├── config/
│   │   └── groq.config.js          # Groq SDK initialization & client configuration
│   ├── controller/
│   │   └── upload.js               # CSV upload preview & AI batch confirmation controllers
│   ├── middleware/
│   │   ├── error.js                # Centralized global error handling middleware
│   │   └── multer.js               # File upload middleware with CSV validation
│   ├── routes/
│   │   └── import.js               # Express API endpoints (/preview, /confirm, /samples)
│   ├── sample_data/                # Benchmark test datasets
│   │   ├── facebook_leads.csv
│   │   ├── google_ads_export.csv
│   │   ├── real_estate_crm.csv
│   │   └── messy_leads_unstructured.csv
│   ├── services/
│   │   ├── aiImporter.js           # Groq prompt engineering & schema sanitization
│   │   └── csv.js                  # Stream-based CSV parser with BOM handling
│   ├── utils/
│   │   └── batchProcessor.js       # Chunking utility & exponential backoff retry handler
│   ├── app.js                      # Express server entry point
│   ├── package.json
│   └── test_ai.js                  # Automated verification test suite
│
├── frontend/
│   ├── app/
│   │   ├── globals.css             # Tailwind v4 theme variables & custom scrollbar styles
│   │   ├── layout.tsx              # Root HTML structure and metadata
│   │   └── page.tsx                # Main single-page application & state coordinator
│   ├── src/
│   │   ├── components/
│   │   │   ├── CSVImportModal.tsx    # Drag-and-drop upload modal & raw preview table
│   │   │   ├── LeadDetailDrawer.tsx  # Slide-over record inspector & JSON exporter
│   │   │   ├── LeadSourcesView.tsx   # Lead channels dashboard & quick import triggers
│   │   │   ├── ManageLeadsView.tsx   # Leads table, search, KPI cards & export tools
│   │   │   └── Sidebar.tsx           # Desktop and mobile responsive navigation sidebar
│   │   ├── lib/
│   │   │   └── api.ts              # Fetch client for backend API communication
│   │   └── types/
│   │       └── crm.ts              # TypeScript interfaces for CRM entities
│   ├── package.json
│   ├── postcss.config.mjs
│   └── tsconfig.json
│
└── README.md
```

---

##  Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **pnpm**: v9.0.0 or higher (or `npm` / `yarn`)
- **Groq API Key**: Obtain a free API key from [Groq Console](https://console.groq.com/keys)

---

### 1. Backend Setup

1. Open a terminal and navigate to the `backend` folder:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Configure environment variables in `backend/.env`:
   ```env
   PORT=5000
   GROQ_API_KEY=gsk_your_groq_api_key_here
   GROQ_MODEL=llama-3.3-70b-versatile
   ```

4. Run the verification test suite:
   ```bash
   node test_ai.js
   ```

5. Start the backend development server:
   ```bash
   pnpm run dev
   ```
   *The backend will start on `http://localhost:5000`.*

---

### 2. Frontend Setup

1. Open a new terminal and navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Start the Next.js development server:
   ```bash
   pnpm run dev
   ```
   *The frontend web application will start on `http://localhost:3000`.*

---

## Testing with Sample Datasets

The application includes 4 pre-loaded benchmark datasets that can be tested directly from the UI with a single click:

1. **Facebook Leads (`facebook_leads.csv`)**:
   - Contains custom ad column names: `full_name`, `phone_number`, `ad_name`, `campaign_source`.
2. **Google Ads Export (`google_ads_export.csv`)**:
   - Headers: `Timestamp`, `Customer Name`, `Cellular Phone`, `Organization`, `Assigned Rep`.
3. **Real Estate CRM (`real_estate_crm.csv`)**:
   - Features `meridian_tower`, `possession_time` ("Ready to Move"), alternate emails, and agent notes.
4. **Messy Spreadsheets (`messy_leads_unstructured.csv`)**:
   - Contains rows with mixed date formats, multiple phone numbers (`9876... / 9876...`), and rows missing both email and phone (which test the automated skip logic).

---

## API Reference

### `POST /api/preview`
- **Description**: Uploads a CSV file and returns column headers and first 10 rows for client preview.
- **Body**: `multipart/form-data` with `file` field.

### `POST /api/confirm`
- **Description**: Sends raw CSV headers and rows to Groq AI in optimized batches for extraction and normalization.
- **Body**:
  ```json
  {
    "headers": ["Name", "Contact", "Email", "Status"],
    "rows": [{ "Name": "John Doe", "Contact": "9876543210", "Email": "john@test.com", "Status": "Interested" }],
    "batchSize": 15
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "totalProcessed": 1,
    "importedCount": 1,
    "skippedCount": 0,
    "imported": [
      {
        "created_at": "2026-05-13 14:20:48",
        "name": "John Doe",
        "email": "john@test.com",
        "country_code": "+91",
        "mobile_without_country_code": "9876543210",
        "crm_status": "GOOD_LEAD_FOLLOW_UP",
        "crm_note": "",
        "data_source": ""
      }
    ],
    "skipped": []
  }
  ```

### `GET /api/samples`
- **Description**: Lists all available preloaded sample datasets.

### `GET /api/samples/:sampleName`
- **Description**: Loads and parses a specific sample CSV file.

### `GET /api/health`
- **Description**: Health check endpoint returning backend status and active LLM configuration.

---

## Security & Best Practices
- **Streaming Uploads**: Temporary files uploaded via Multer are parsed and cleaned from the server disk immediately after processing.
- **Rate Limit Resilience**: Groq API calls are wrapped in an exponential backoff retry handler to gracefully handle high concurrency and temporary API rate limits (`HTTP 429`).
- **CORS & Payload Limits**: Explicit CORS origin policies and `50mb` payload parsing limits.

---

## License
This project is open-source and available under the [ISC License](LICENSE).
