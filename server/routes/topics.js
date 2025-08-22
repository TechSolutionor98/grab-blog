const express = require("express")
const router = express.Router()
const Topic = require("../models/Topic")
const { auth } = require("../middleware/auth")
const { body, validationResult } = require("express-validator")

// Get all topics (public)
router.get("/", async (req, res) => {
  try {
    const topics = await Topic.find().sort({ createdAt: -1 })
    res.json(topics)
  } catch (error) {
    console.error("Error fetching topics:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get topics for admin (with auth)
router.get("/admin", auth, async (req, res) => {
  try {
    const topics = await Topic.find().sort({ createdAt: -1 })
    res.json(topics)
  } catch (error) {
    console.error("Error fetching topics:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get topic by slug
router.get("/:slug", async (req, res) => {
  try {
    const topic = await Topic.findOne({ slug: req.params.slug })
    if (!topic) {
      return res.status(404).json({ message: "Topic not found" })
    }
    res.json(topic)
  } catch (error) {
    console.error("Error fetching topic:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Create topic (admin only)
router.post(
  "/",
  auth,
  [
    body("name").trim().notEmpty().withMessage("Topic name is required"),
    body("description").optional().trim(),
    body("color").optional().matches(/^#[0-9A-F]{6}$/i).withMessage("Invalid color format"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const { name, description, color } = req.body

      // Check if topic already exists
      const existingTopic = await Topic.findOne({ name: { $regex: new RegExp(`^${name}$`, "i") } })
      if (existingTopic) {
        return res.status(400).json({ message: "Topic already exists" })
      }

      const topic = new Topic({
        name,
        description,
        color: color || "#10b981",
      })

      await topic.save()
      res.status(201).json(topic)
    } catch (error) {
      console.error("Error creating topic:", error)
      if (error.code === 11000) {
        return res.status(400).json({ message: "Topic already exists" })
      }
      res.status(500).json({ message: "Server error" })
    }
  }
)

// Update topic (admin only)
router.put(
  "/:id",
  auth,
  [
    body("name").trim().notEmpty().withMessage("Topic name is required"),
    body("description").optional().trim(),
    body("color").optional().matches(/^#[0-9A-F]{6}$/i).withMessage("Invalid color format"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const { name, description, color } = req.body

      // Check if topic exists
      const topic = await Topic.findById(req.params.id)
      if (!topic) {
        return res.status(404).json({ message: "Topic not found" })
      }

      // Check if name is taken by another topic
      const existingTopic = await Topic.findOne({
        name: { $regex: new RegExp(`^${name}$`, "i") },
        _id: { $ne: req.params.id },
      })
      if (existingTopic) {
        return res.status(400).json({ message: "Topic name already exists" })
      }

      topic.name = name
      topic.description = description
      topic.color = color || topic.color

      await topic.save()
      res.json(topic)
    } catch (error) {
      console.error("Error updating topic:", error)
      res.status(500).json({ message: "Server error" })
    }
  }
)

// Delete topic (admin only)
router.delete("/:id", auth, async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.id)
    if (!topic) {
      return res.status(404).json({ message: "Topic not found" })
    }

    await Topic.findByIdAndDelete(req.params.id)
    res.json({ message: "Topic deleted successfully" })
  } catch (error) {
    console.error("Error deleting topic:", error)
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router
