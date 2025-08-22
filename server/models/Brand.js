const mongoose = require("mongoose")

const brandSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    color: {
      type: String,
      default: "#f59e0b",
    },
    website: {
      type: String,
      trim: true,
    },
    logo: {
      url: String,
      publicId: String,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
  },
  {
    timestamps: true,
  }
)

// Generate slug before saving
brandSchema.pre("save", function (next) {
  if (this.isModified("name")) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "")
  }
  next()
})

module.exports = mongoose.model("Brand", brandSchema)
