
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

// Get __filename and __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define the upload directory path (for temp storage before uploading to Cloudinary)
const uploadPath = path.join(__dirname, "../../public/temp");

// Ensure that the directory exists
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadPath),
  filename: (req, file, cb) => cb(null, `${Date.now()}_${file.originalname}`),
});

// File filter (optional but recommended for security)
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpg|png/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error("Only JPG, JPEG, PNG files are allowed."), false);
  }
};

// Multer instance
export const upload = multer({
  storage,
  fileFilter, // ✅ Enable file filtering
  limits: { fileSize: 2 * 1024 * 1024 }, // 5MB limit (change if needed)
});

// Optional: Error handler middleware
export const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ message: `Multer error: ${err.message}` });
  } else if (err) {
    return res.status(400).json({ message: `File upload error: ${err.message}` });
  }
  next();
};
