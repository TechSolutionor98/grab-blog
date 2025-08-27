const mongoose = require("mongoose")

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      maxlength: 50,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      maxlength: 200,
    },
    color: {
      type: String,
      default: "#007bff",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
)

// Generate slug from name before validation so `slug` passes required validation
categorySchema.pre("validate", function (next) {
  if (this.isModified("name")) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
  }
  next()
})
// Also handle slug when using findOneAndUpdate style operations
categorySchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate() || {}
  if (update.name) {
    const newSlug = String(update.name)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
    this.setUpdate({ ...update, slug: newSlug })
  }
  next()
})

module.exports = mongoose.model("Category", categorySchema)
