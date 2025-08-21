const express = require("express")
const { body, validationResult } = require("express-validator")
const Category = require("../models/Category")
const Blog = require("../models/Blog")
const { adminAuth } = require("../middleware/auth")

const router = express.Router()

// @route   GET /api/categories
// @desc    Get all active categories
// @access  Public
router.get("/", async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ name: 1 })
    res.json(categories)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

// @route   GET /api/categories/admin
// @desc    Get all categories for admin
// @access  Private (Admin)
router.get("/admin", adminAuth, async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 })

    // Get blog count for each category
    const categoriesWithCount = await Promise.all(
      categories.map(async (category) => {
        const blogCount = await Blog.countDocuments({ category: category._id })
        return {
          ...category.toObject(),
          blogCount,
        }
      }),
    )

    res.json(categoriesWithCount)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

// @route   POST /api/categories
// @desc    Create new category
// @access  Private (Admin)
router.post(
  "/",
  [
    adminAuth,
    body("name").notEmpty().withMessage("Category name is required"),
    body("description").optional().isLength({ max: 200 }).withMessage("Description too long"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const { name, description, color } = req.body

      // Check if category already exists
      const existingCategory = await Category.findOne({ name: new RegExp(`^${name}$`, "i") })
      if (existingCategory) {
        return res.status(400).json({ message: "Category already exists" })
      }

      const category = new Category({
        name,
        description,
        color: color || "#007bff",
      })

      await category.save()
      res.status(201).json(category)
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: "Server error" })
    }
  },
)

// @route   PUT /api/categories/:id
// @desc    Update category
// @access  Private (Admin)
router.put(
  "/:id",
  [
    adminAuth,
    body("name").notEmpty().withMessage("Category name is required"),
    body("description").optional().isLength({ max: 200 }).withMessage("Description too long"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const { name, description, color, isActive } = req.body

      const category = await Category.findById(req.params.id)
      if (!category) {
        return res.status(404).json({ message: "Category not found" })
      }

      // Check if name already exists (excluding current category)
      const existingCategory = await Category.findOne({
        name: new RegExp(`^${name}$`, "i"),
        _id: { $ne: req.params.id },
      })
      if (existingCategory) {
        return res.status(400).json({ message: "Category name already exists" })
      }

      category.name = name
      category.description = description || ""
      category.color = color || category.color
      category.isActive = isActive !== undefined ? isActive : category.isActive

      await category.save()
      res.json(category)
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: "Server error" })
    }
  },
)

// @route   DELETE /api/categories/:id
// @desc    Delete category
// @access  Private (Admin)
router.delete("/:id", adminAuth, async (req, res) => {
  try {
    const category = await Category.findById(req.params.id)
    if (!category) {
      return res.status(404).json({ message: "Category not found" })
    }

    // Check if category has blogs
    const blogCount = await Blog.countDocuments({ category: req.params.id })
    if (blogCount > 0) {
      return res.status(400).json({
        message: `Cannot delete category. It has ${blogCount} blog(s) associated with it.`,
      })
    }

    await Category.findByIdAndDelete(req.params.id)
    res.json({ message: "Category deleted successfully" })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router
