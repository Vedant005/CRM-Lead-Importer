import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = path.resolve("uploads");

// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadDir);
  },
  filename(req, file, cb) {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedMime = [
    "text/csv",
    "text/plain",
    "application/vnd.ms-excel",
    "application/csv",
    "text/x-csv",
    "application/octet-stream",
  ];

  if (ext === ".csv" || allowedMime.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only CSV files (.csv) are allowed."));
  }
};

export default multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB max file size
  },
});
