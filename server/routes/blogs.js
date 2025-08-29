const express = require("express")
const mongoose = require("mongoose")
const { body, validationResult } = require("express-validator")
const Blog = require("../models/Blog")
const Category = require("../models/Category")
const Topic = require("../models/Topic")
const Brand = require("../models/Brand")
const { auth, adminAuth } = require("../middleware/auth")

const router = express.Router()

// utils
const clamp = (str, max) => {
  if (typeof str !== "string") return str
  return str.length > max ? str.slice(0, max) : str
}

// @route   GET /api/blogs
// @desc    Get all published blogs with pagination
// @access  Public
router.get("/", async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = Math.min(Number.parseInt(req.query.limit) || 10, 200) // cap to avoid extreme loads
    const category = req.query.category
    const search = req.query.search
  const sort = req.query.sort || "-publishedAt"
  const featuredParam = req.query.featured
  const trendingParam = req.query.trendingThisWeek

    // Build query
  const query = { status: "published" }

    if (category) {
      if (!mongoose.Types.ObjectId.isValid(category)) {
        return res.status(400).json({ message: "Invalid category" })
      }
      query.category = category
    }

    if (search) {
      // Normalize and tokenize search input; ignore very short tokens
      const normalized = String(search)
        .replace(/[^\p{L}\p{N}\s]+/gu, " ")
        .replace(/\s+/g, " ")
        .trim()

      const tokens = Array.from(
        new Set(
          normalized
            .split(" ")
            .map((t) => t.trim())
            .filter((t) => t.length >= 2),
        ),
      )

      if (tokens.length > 0) {
        const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
        const pattern = tokens.map(escapeRegExp).join("|")
        const regex = new RegExp(pattern, "i")

        // Find matching related entities by name
        const [matchedCategories, matchedTopics, matchedBrands] = await Promise.all([
          Category.find({ name: { $regex: regex } }, { _id: 1 }).lean(),
          Topic.find({ name: { $regex: regex } }, { _id: 1 }).lean(),
          Brand.find({ name: { $regex: regex } }, { _id: 1 }).lean(),
        ])

        const catIds = matchedCategories.map((c) => c._id)
        const topicIds = matchedTopics.map((t) => t._id)
        const brandIds = matchedBrands.map((b) => b._id)

        query.$or = [
          { title: { $regex: regex } },
          { excerpt: { $regex: regex } },
          { content: { $regex: regex } },
          { "seo.metaDescription": { $regex: regex } },
          { tags: { $regex: regex } }, // matches any tag containing token
        ]
        if (catIds.length) query.$or.push({ category: { $in: catIds } })
        if (topicIds.length) query.$or.push({ topic: { $in: topicIds } })
        if (brandIds.length) query.$or.push({ brand: { $in: brandIds } })
      }
    }

    if (typeof featuredParam !== "undefined") {
      // Accept 'true'/'false' or '1'/'0'
      const isFeatured = featuredParam === "true" || featuredParam === "1"
      query.featured = isFeatured
    }

    if (typeof trendingParam !== "undefined") {
      const isTrending = trendingParam === "true" || trendingParam === "1"
      query.trendingThisWeek = isTrending
    }

    const skip = (page - 1) * limit

  const blogs = await Blog.find(query)
      .populate("category", "name slug color")
      .populate("topic", "name slug color")
      .populate("brand", "name slug color")
      .populate("author", "username avatar")
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .select("-content") // Exclude full content for list view

    const total = await Blog.countDocuments(query)

    res.json({
      blogs,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

// @route   GET /api/blogs/admin
// @desc    Get all blogs for admin
// @access  Private (Admin)
router.get("/admin", adminAuth, async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10
    const status = req.query.status
    const category = req.query.category

    const query = {}

    if (status) {
      query.status = status
    }

    if (category) {
      query.category = category
    }

    const skip = (page - 1) * limit

    const blogs = await Blog.find(query)
      .populate("category", "name slug color")
      .populate("topic", "name slug color")
      .populate("brand", "name slug color")
      .populate("author", "username")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select("-content")

    const total = await Blog.countDocuments(query)

    res.json({
      blogs,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
      },
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

// @route   POST /api/blogs
// @desc    Create new blog
// @access  Private (Admin)
router.post(
  "/",
  [
    adminAuth,
    body("title").notEmpty().withMessage("Title is required"),
    body("content").notEmpty().withMessage("Content is required"),
    body("category").notEmpty().withMessage("Category is required"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

  const { title, slug, content, excerpt, category, topic, brand, tags, status, featuredImage, seo, featured, trendingThisWeek } = req.body

      // Ensure excerpt respects schema maxlength (300)
      const normalizedExcerpt = clamp(excerpt, 300)

      // Verify category exists
      if (!mongoose.Types.ObjectId.isValid(category)) {
        return res.status(400).json({ message: "Invalid category" })
      }
      const categoryExists = await Category.findById(category)
      if (!categoryExists) {
        return res.status(400).json({ message: "Invalid category" })
      }

      // Verify topic exists (if provided)
      if (topic) {
        if (!mongoose.Types.ObjectId.isValid(topic)) {
          return res.status(400).json({ message: "Invalid topic" })
        }
        const Topic = require("../models/Topic")
        const topicExists = await Topic.findById(topic)
        if (!topicExists) {
          return res.status(400).json({ message: "Invalid topic" })
        }
      }

      // Verify brand exists (if provided)
      if (brand) {
        if (!mongoose.Types.ObjectId.isValid(brand)) {
          return res.status(400).json({ message: "Invalid brand" })
        }
        const Brand = require("../models/Brand")
        const brandExists = await Brand.findById(brand)
        if (!brandExists) {
          return res.status(400).json({ message: "Invalid brand" })
        }
      }

      // Pre-check slug uniqueness when provided
      if (slug) {
        const exists = await Blog.exists({ slug })
        if (exists) {
          return res.status(400).json({ message: "Slug already exists" })
        }
      }

      const blog = new Blog({
        title,
        slug,
        content,
        excerpt: normalizedExcerpt,
        category,
        topic: topic || undefined,
        brand: brand || undefined,
        author: req.user._id,
        tags: tags || [],
        status: status || "draft",
        featuredImage,
        seo,
  featured: !!featured,
  trendingThisWeek: !!trendingThisWeek,
      })

      await blog.save()

      const populatedBlog = await Blog.findById(blog._id)
        .populate("category", "name slug color")
        .populate("topic", "name slug color")
        .populate("brand", "name slug color")
        .populate("author", "username")

      res.status(201).json(populatedBlog)
    } catch (error) {
      console.error(error)
      if (error && error.name === "ValidationError") {
        const errors = Object.keys(error.errors || {}).map((k) => ({
          msg: error.errors[k]?.message || "Invalid value",
          param: k,
        }))
        return res.status(400).json({ errors })
      }
      if (error && error.code === 11000 && error.keyPattern && error.keyPattern.slug) {
        return res.status(400).json({ message: "Slug already exists" })
      }
      res.status(500).json({ message: "Server error" })
    }
  },
)

// @route   PUT /api/blogs/:id
// @desc    Update blog
// @access  Private (Admin)
router.put(
  "/:id",
  [
    adminAuth,
    body("title").notEmpty().withMessage("Title is required"),
    body("content").notEmpty().withMessage("Content is required"),
    body("category").notEmpty().withMessage("Category is required"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const blog = await Blog.findById(req.params.id)
      if (!blog) {
        return res.status(404).json({ message: "Blog not found" })
      }

  const { title, slug, content, excerpt, category, topic, brand, tags, status, featuredImage, seo, featured, trendingThisWeek } = req.body

      // Ensure excerpt respects schema maxlength (300)
      const normalizedExcerpt = clamp(excerpt, 300)

      // Verify category exists
      if (!mongoose.Types.ObjectId.isValid(category)) {
        return res.status(400).json({ message: "Invalid category" })
      }
      const categoryExists = await Category.findById(category)
      if (!categoryExists) {
        return res.status(400).json({ message: "Invalid category" })
      }

      // Verify topic exists (if provided)
      if (topic) {
        if (!mongoose.Types.ObjectId.isValid(topic)) {
          return res.status(400).json({ message: "Invalid topic" })
        }
        const Topic = require("../models/Topic")
        const topicExists = await Topic.findById(topic)
        if (!topicExists) {
          return res.status(400).json({ message: "Invalid topic" })
        }
      }

      // Verify brand exists (if provided)
      if (brand) {
        if (!mongoose.Types.ObjectId.isValid(brand)) {
          return res.status(400).json({ message: "Invalid brand" })
        }
        const Brand = require("../models/Brand")
        const brandExists = await Brand.findById(brand)
        if (!brandExists) {
          return res.status(400).json({ message: "Invalid brand" })
        }
      }

      // If slug changing, pre-check uniqueness
      if (slug && slug !== blog.slug) {
        const exists = await Blog.exists({ slug, _id: { $ne: blog._id } })
        if (exists) {
          return res.status(400).json({ message: "Slug already exists" })
        }
      }

      // Update blog fields
      blog.title = title
      blog.slug = slug || blog.slug
      blog.content = content
  blog.excerpt = normalizedExcerpt
      blog.category = category
      blog.topic = topic || blog.topic
      blog.brand = brand || blog.brand
      blog.tags = tags || []
      blog.status = status || blog.status
      blog.featuredImage = featuredImage || blog.featuredImage
      blog.seo = seo || blog.seo
  blog.featured = typeof featured === "boolean" ? featured : blog.featured
  blog.trendingThisWeek = typeof trendingThisWeek === "boolean" ? trendingThisWeek : blog.trendingThisWeek

  await blog.save()

      const populatedBlog = await Blog.findById(blog._id)
        .populate("category", "name slug color")
        .populate("topic", "name slug color")
        .populate("brand", "name slug color")
        .populate("author", "username")

      res.json(populatedBlog)
    } catch (error) {
      console.error(error)
      if (error && error.name === "ValidationError") {
        const errors = Object.keys(error.errors || {}).map((k) => ({
          msg: error.errors[k]?.message || "Invalid value",
          param: k,
        }))
        return res.status(400).json({ errors })
      }
      if (error && error.code === 11000 && error.keyPattern && error.keyPattern.slug) {
        return res.status(400).json({ message: "Slug already exists" })
      }
      res.status(500).json({ message: "Server error" })
    }
  },
)

// @route   DELETE /api/blogs/:id
// @desc    Delete blog
// @access  Private (Admin)
router.delete("/:id", adminAuth, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id)
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" })
    }

    await Blog.findByIdAndDelete(req.params.id)
    res.json({ message: "Blog deleted successfully" })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

// @route   GET /api/blogs/:id/related
// @desc    Get related blogs based on category and tags
// @access  Public
router.get("/:id/related", async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).populate("category")
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" })
    }

    // Find related blogs by category and tags
    const relatedBlogs = await Blog.find({
      _id: { $ne: blog._id },
      status: "published",
      $or: [{ category: blog.category._id }, { tags: { $in: blog.tags } }],
    })
      .populate("category", "name slug color")
      .populate("author", "username avatar")
      .sort({ views: -1, publishedAt: -1 })
      .limit(4)
      .select("-content")

    res.json(relatedBlogs)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

// @route   GET /api/blogs/trending
// @desc    Get trending blogs based on views and recent activity
// @access  Public
router.get("/trending", async (req, res) => {
  try {
    const limit = Number.parseInt(req.query.limit) || 6

    const trendingBlogs = await Blog.find({ status: "published", trendingThisWeek: true })
      .populate("category", "name slug color")
      .populate("author", "username avatar")
      .sort({ publishedAt: -1, createdAt: -1 })
      .limit(limit)
      .select("-content")

    res.json(trendingBlogs)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

// @route   GET /api/blogs/editors-pick
// @desc    Get top blogs by views (default 3) as Editor's Pick
// @access  Public
router.get("/editors-pick", async (req, res) => {
  try {
    const limit = Math.min(Number.parseInt(req.query.limit) || 3, 10)

    const topByViews = await Blog.find({ status: "published" })
      .populate("category", "name slug color")
      .populate("author", "username avatar")
      .sort({ views: -1, publishedAt: -1 })
      .limit(limit)
      .select("-content")

    // Wrap in { data } to match client expectations
    res.json({ data: topByViews })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

// @route   GET /api/blogs/random
// @desc    Get random published blogs (default 3)
// @access  Public
router.get("/random", async (req, res) => {
  try {
    const limit = Math.min(Number.parseInt(req.query.limit) || 3, 20)

    // Sample random docs, then populate via a second query to keep code simple
    const sampled = await Blog.aggregate([
      { $match: { status: "published" } },
      { $sample: { size: limit } },
      { $project: { _id: 1 } },
    ])

    const ids = sampled.map((d) => d._id)
    let blogs = []
    if (ids.length) {
      blogs = await Blog.find({ _id: { $in: ids } })
        .populate("category", "name slug color")
        .populate("author", "username avatar")
        .select("-content")

      // Preserve sampled order
      const order = new Map(ids.map((id, idx) => [String(id), idx]))
      blogs.sort((a, b) => (order.get(String(a._id)) ?? 0) - (order.get(String(b._id)) ?? 0))
    }

    res.json({ data: blogs })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

// Keep slug route after specific routes like /trending to avoid conflicts
// @route   GET /api/blogs/:slug
// @desc    Get single blog by slug
// @access  Public
router.get("/:slug", async (req, res) => {
  try {
    const blog = await Blog.findOne({
      slug: req.params.slug,
      status: "published",
    })
      .populate("category", "name slug color")
      .populate("topic", "name slug color")
      .populate("brand", "name slug color")
      .populate("author", "username avatar")

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" })
    }

    // Increment views
    blog.views += 1
    await blog.save()

    res.json(blog)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router
