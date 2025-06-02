const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const axios = require("axios");
const sanitize = require("sanitize-filename");

const router = express.Router();
const API_URL = "http://localhost:5000/api";

// ===============================
// ✅ Create 'uploads' directory if it doesn't exist
// ===============================
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ===============================
// ✅ Configure multer for image uploads
// ===============================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // Save to "uploads" folder
  },
  filename: (req, file, cb) => {
    const sanitizedFilename = sanitize(`${Date.now()}-${file.originalname}`);
    cb(null, sanitizedFilename); // Save with sanitized filename
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png|gif/;
    const extName = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimeType = fileTypes.test(file.mimetype);
    if (extName && mimeType) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed (jpeg, jpg, png, gif)"));
    }
  },
});

// ===============================
// ✅ Upload endpoint
// ===============================
router.post("/", upload.single("image"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No image uploaded" });
  }

  const imageUrl = `/uploads/${req.file.filename}`; // Relative path to image

  try {
    // If the external API expects the file as a FormData:
    const formData = new FormData();
    formData.append("image", req.file);

    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    };

    // Send the image to external API (adjust as needed)
    const response = await axios.post(`${API_URL}/upload`, formData, config);

    res.json({
      message: "Image uploaded successfully",
      imageUrl,
      response: response.data,
    });
  } catch (error) {
    res.status(500).json({ error: error.message || "An error occurred during the upload" });
  }
});

// ===============================
// ✅ Error handling middleware
// ===============================
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: err.message });
  } else if (err) {
    return res.status(500).json({ error: err.message || "An error occurred during the upload" });
  }
  next();
});

module.exports = router;
