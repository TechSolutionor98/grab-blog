const express = require("express")
const { body, validationResult } = require("express-validator")
const crypto = require("crypto")
// Make nodemailer optional so dev doesn't crash if not installed
let nodemailer = null
try {
	nodemailer = require("nodemailer")
} catch (_) {}
const Comment = require("../models/Comment")
const Blog = require("../models/Blog")
const { adminAuth } = require("../middleware/auth")

const router = express.Router()

// Simple mailer using SMTP creds from env; if missing, fall back to console.log
let transporter = null
try {
	if (
		nodemailer &&
		process.env.SMTP_HOST &&
		process.env.SMTP_USER &&
		process.env.SMTP_PASS
	) {
		transporter = nodemailer.createTransport({
			host: process.env.SMTP_HOST,
			port: Number(process.env.SMTP_PORT) || 587,
			secure: Boolean(process.env.SMTP_SECURE === "true"),
			auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
		})
	}
} catch (_) {}

async function sendCodeEmail(to, name, code, blogTitle) {
	const subject = `Your comment verification code`;
	const text = `Hi ${name || "there"},\n\nUse this 4-digit code to verify your comment for: ${blogTitle}.\n\nCode: ${code}\n\nThis code expires in 10 minutes.`
	const html = `<p>Hi ${name || "there"},</p><p>Use this 4-digit code to verify your comment for: <b>${blogTitle}</b>.</p><p style=\"font-size:18px\">Code: <b>${code}</b></p><p>This code expires in 10 minutes.</p>`
	if (transporter) {
		try {
			// Force FROM to match SMTP_USER (common provider requirement). Preserve display name if provided.
			const smtpUser = process.env.SMTP_USER
			const fromEnv = process.env.MAIL_FROM
			const display = fromEnv && fromEnv.includes("<") ? fromEnv.split("<")[0].trim() : undefined
			const from = display ? `${display.replace(/[\"<>]/g, "").trim()} <${smtpUser}>` : smtpUser

			await transporter.sendMail({ from, to, subject, text, html })
			return true
		} catch (err) {
			console.error("Email send failed, falling back to console:", err?.message)
		}
	}
	console.log(`[DEV] Verification code for ${to}: ${code}`)
	return true
}

// Helpers
const genCode = () => String(Math.floor(1000 + Math.random() * 9000))

// POST /api/comments
// Create a pending comment and email a verification code
router.post(
	"/",
	[
		body("blog").notEmpty().withMessage("Blog is required"),
		body("name").notEmpty().withMessage("Name is required"),
		body("email").isEmail().withMessage("Valid email is required"),
		body("content").trim().isLength({ min: 3 }).withMessage("Comment is too short"),
	],
	async (req, res) => {
		try {
			const errors = validationResult(req)
			if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })

			const { blog, name, email, website, content, clientRef } = req.body

			const blogDoc = await Blog.findById(blog)
			if (!blogDoc) return res.status(404).json({ message: "Blog not found" })

			const code = genCode()
			const expires = new Date(Date.now() + 10 * 60 * 1000)

			const comment = await Comment.create({
				blog,
				name,
				email: email.toLowerCase(),
				website,
				content,
				verificationCode: code,
				codeExpiresAt: expires,
				verified: false,
				approved: false,
				clientRef,
			})

			await sendCodeEmail(email, name, code, blogDoc.title)

			res.status(201).json({
				message: "Verification code sent to email",
				commentId: comment._id,
			})
		} catch (err) {
			console.error(err)
			res.status(500).json({ message: "Server error" })
		}
	},
)

// POST /api/comments/verify
// Verify a comment by code
router.post(
	"/verify",
	[
		body("commentId").notEmpty().withMessage("commentId is required"),
		body("code").notEmpty().withMessage("code is required"),
		body("email").isEmail().withMessage("Valid email is required"),
	],
	async (req, res) => {
		try {
			const errors = validationResult(req)
			if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })

			const { commentId, code, email } = req.body
			const comment = await Comment.findById(commentId)
			if (!comment) return res.status(404).json({ message: "Comment not found" })
			if (comment.email !== email.toLowerCase()) return res.status(400).json({ message: "Email mismatch" })
			if (!comment.verificationCode || !comment.codeExpiresAt) return res.status(400).json({ message: "No code to verify" })
			if (new Date(comment.codeExpiresAt).getTime() < Date.now()) return res.status(400).json({ message: "Code expired" })
			if (String(comment.verificationCode) !== String(code)) return res.status(400).json({ message: "Invalid code" })

			comment.verified = true
			comment.verificationCode = undefined
			comment.codeExpiresAt = undefined
			await comment.save()

			res.json({ message: "Comment verified. Awaiting admin approval.", comment })
		} catch (err) {
			console.error(err)
			res.status(500).json({ message: "Server error" })
		}
	},
)

// GET /api/comments/blog/:blogId
// Public comments for a blog; if email + clientRef provided, also include that user's unapproved comments
router.get("/blog/:blogId", async (req, res) => {
	try {
		const { blogId } = req.params
		const { email, clientRef } = req.query

		const base = { blog: blogId, approved: true }
		const or = [base]
		if (email && clientRef) {
			or.push({ blog: blogId, email: String(email).toLowerCase(), clientRef })
		}

		const comments = await Comment.find({ $or: or })
			.sort({ createdAt: -1 })

		res.json(comments)
	} catch (err) {
		console.error(err)
		res.status(500).json({ message: "Server error" })
	}
})

// ADMIN: GET /api/comments
router.get("/", adminAuth, async (req, res) => {
	try {
		const { status } = req.query // status: pending, verified, approved, all
		const filter = {}
		if (status === "pending") filter.verified = false
		else if (status === "verified") filter.verified = true, filter.approved = false
		else if (status === "approved") filter.approved = true

		const comments = await Comment.find(filter)
			.populate("blog", "title slug")
			.sort({ createdAt: -1 })

		res.json(comments)
	} catch (err) {
		console.error(err)
		res.status(500).json({ message: "Server error" })
	}
})

// ADMIN: PATCH /api/comments/:id/approve
router.patch("/:id/approve", adminAuth, async (req, res) => {
	try {
		const comment = await Comment.findById(req.params.id)
		if (!comment) return res.status(404).json({ message: "Comment not found" })
		if (!comment.verified) return res.status(400).json({ message: "Comment not verified yet" })
		comment.approved = true
		await comment.save()
		res.json({ message: "Comment approved", comment })
	} catch (err) {
		console.error(err)
		res.status(500).json({ message: "Server error" })
	}
})

// ADMIN: DELETE /api/comments/:id
router.delete("/:id", adminAuth, async (req, res) => {
	try {
		const deleted = await Comment.findByIdAndDelete(req.params.id)
		if (!deleted) return res.status(404).json({ message: "Comment not found" })
		res.json({ message: "Comment deleted" })
	} catch (err) {
		console.error(err)
		res.status(500).json({ message: "Server error" })
	}
})

module.exports = router

