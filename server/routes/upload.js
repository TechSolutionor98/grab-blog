const express = require("express")
const multer = require("multer")
const cloudinary = require("../config/cloudinary")
const { adminAuth } = require("../middleware/auth")

const router = express.Router()

// Configure multer for memory storage
const storage = multer.memoryStorage()
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const upload = multer({
  storage,
  limits: {
  fileSize: MAX_FILE_SIZE,
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true)
    } else {
      cb(new Error("Only image files are allowed"), false)
    }
  },
})

// @route   POST /api/upload/image
// @desc    Upload image to Cloudinary
// @access  Private (Admin)
router.post(
  "/image",
  adminAuth,
  (req, res, next) => {
    // Wrap multer to catch errors
    upload.single("image")(req, res, (err) => {
      if (err) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(413).json({ message: `File too large. Max ${Math.floor(MAX_FILE_SIZE / (1024 * 1024))}MB` })
        }
        return res.status(400).json({ message: err.message || "Invalid file upload" })
      }
      next()
    })
  },
  async (req, res) => {
    try {
    if (!req.file) {
      return res.status(400).json({ message: "No image file provided" })
    }

    // Ensure Cloudinary is configured
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return res.status(500).json({ message: "Image service not configured. Missing Cloudinary credentials." })
    }

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            resource_type: "image",
            folder: "blog-images",
            transformation: [{ width: 1200, height: 800, crop: "limit" }, { quality: "auto" }, { format: "auto" }],
          },
          (error, result) => {
            if (error) reject(error)
            else resolve(result)
          },
        )
        .end(req.file.buffer)
    })

    res.json({
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
    })
  } catch (error) {
    console.error("Upload error:", error)
    // Pass through known Cloudinary error messages if available
    const message = (error && (error.message || error.error || error.name)) || "Image upload failed"
    res.status(500).json({ message })
  }
})

// @route   DELETE /api/upload/image/:publicId
// @desc    Delete image from Cloudinary
// @access  Private (Admin)
router.delete("/image/:publicId", adminAuth, async (req, res) => {
  try {
    const { publicId } = req.params

    // Delete from Cloudinary
    const result = await cloudinary.uploader.destroy(publicId)

    if (result.result === "ok") {
      res.json({ message: "Image deleted successfully" })
    } else {
      res.status(400).json({ message: "Failed to delete image" })
    }
  } catch (error) {
    console.error("Delete error:", error)
    res.status(500).json({ message: "Image deletion failed" })
  }
})

module.exports = router
