const mongoose = require("mongoose")

const commentSchema = new mongoose.Schema(
	{
		blog: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Blog",
			required: true,
			index: true,
		},
		name: { type: String, required: true, trim: true, maxlength: 80 },
		email: { type: String, required: true, trim: true, lowercase: true },
		website: { type: String, trim: true },
		content: { type: String, required: true, maxlength: 2000 },
		// Verification & moderation
		verificationCode: { type: String },
		codeExpiresAt: { type: Date },
		verified: { type: Boolean, default: false, index: true },
		approved: { type: Boolean, default: false, index: true },
		// Optional helper to let client persist their own unapproved, verified comments locally
		clientRef: { type: String }, // random id generated on client, not trusted
	},
	{ timestamps: true },
)

module.exports = mongoose.model("Comment", commentSchema)

