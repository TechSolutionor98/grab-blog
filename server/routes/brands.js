const express = require("express")
const router = express.Router()
const Brand = require("../models/Brand")
const { auth } = require("../middleware/auth")
const { body, validationResult } = require("express-validator")

// Get all brands (public)
router.get("/", async (req, res) => {
  try {
    const brands = await Brand.find().sort({ createdAt: -1 })
    res.json(brands)
  } catch (error) {
    console.error("Error fetching brands:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get brands for admin (with auth)
router.get("/admin", auth, async (req, res) => {
  try {
    const brands = await Brand.find().sort({ createdAt: -1 })
    res.json(brands)
  } catch (error) {
    console.error("Error fetching brands:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get brand by slug
router.get("/:slug", async (req, res) => {
  try {
    const brand = await Brand.findOne({ slug: req.params.slug })
    if (!brand) {
      return res.status(404).json({ message: "Brand not found" })
    }
    res.json(brand)
  } catch (error) {
    console.error("Error fetching brand:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Create brand (admin only)
router.post(
  "/",
  auth,
  [
    body("name").trim().notEmpty().withMessage("Brand name is required"),
    body("description").optional().trim(),
    body("color").optional().matches(/^#[0-9A-F]{6}$/i).withMessage("Invalid color format"),
    body("website").optional().isURL().withMessage("Invalid website URL"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const { name, description, color, website, logo } = req.body

      // Check if brand already exists
      const existingBrand = await Brand.findOne({ name: { $regex: new RegExp(`^${name}$`, "i") } })
      if (existingBrand) {
        return res.status(400).json({ message: "Brand already exists" })
      }

      const brand = new Brand({
        name,
        description,
        color: color || "#f59e0b",
        website,
        logo,
      })

      await brand.save()
      res.status(201).json(brand)
    } catch (error) {
      console.error("Error creating brand:", error)
      if (error.code === 11000) {
        return res.status(400).json({ message: "Brand already exists" })
      }
      res.status(500).json({ message: "Server error" })
    }
  }
)

// Update brand (admin only)
router.put(
  "/:id",
  auth,
  [
    body("name").trim().notEmpty().withMessage("Brand name is required"),
    body("description").optional().trim(),
    body("color").optional().matches(/^#[0-9A-F]{6}$/i).withMessage("Invalid color format"),
    body("website").optional().isURL().withMessage("Invalid website URL"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const { name, description, color, website, logo } = req.body

      // Check if brand exists
      const brand = await Brand.findById(req.params.id)
      if (!brand) {
        return res.status(404).json({ message: "Brand not found" })
      }

      // Check if name is taken by another brand
      const existingBrand = await Brand.findOne({
        name: { $regex: new RegExp(`^${name}$`, "i") },
        _id: { $ne: req.params.id },
      })
      if (existingBrand) {
        return res.status(400).json({ message: "Brand name already exists" })
      }

      brand.name = name
      brand.description = description
      brand.color = color || brand.color
      brand.website = website
      brand.logo = logo || brand.logo

      await brand.save()
      res.json(brand)
    } catch (error) {
      console.error("Error updating brand:", error)
      res.status(500).json({ message: "Server error" })
    }
  }
)

// Delete brand (admin only)
router.delete("/:id", auth, async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id)
    if (!brand) {
      return res.status(404).json({ message: "Brand not found" })
    }

    await Brand.findByIdAndDelete(req.params.id)
    res.json({ message: "Brand deleted successfully" })
  } catch (error) {
    console.error("Error deleting brand:", error)
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router
