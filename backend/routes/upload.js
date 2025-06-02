const express = require("express");
const multer = require("multer");

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Ensure this folder exists
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

// File filter to allow all image types
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true); // Accept the file
  } else {
    cb(new Error("Only image files are allowed"), false); // Reject the file
  }
};

const upload = multer({ storage, fileFilter });

// Image upload endpoint
router.post("/", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded or invalid file type" });
  }

  const imageUrl = `/uploads/${req.file.filename}`;
  res.json({ imageUrl });
});

const handleImageUpload = async () => {
  if (!image) return null;

  try {
    const formData = new FormData();
    formData.append("image", image);

    const imageUrl = await uploadImage(formData);
    return imageUrl;
  } catch (error) {
    console.error("Image upload failed:", error);
    if (error.response?.data?.error) {
      alert(error.response.data.error); // Show backend error message
    } else {
      alert("Failed to upload image. Please try again.");
    }
    return null;
  }
};

module.exports = router;