import { Router } from "express";
import upload from "../middleware/multer.js";
import {
  uploadCSV,
  confirmImport,
  getSampleDatasets,
  loadSampleByName,
} from "../controller/upload.js";

const router = Router();

router.post("/preview", upload.single("file"), uploadCSV);

router.post("/confirm", confirmImport);

router.get("/samples", getSampleDatasets);
router.get("/samples/:sampleName", loadSampleByName);

export default router;
