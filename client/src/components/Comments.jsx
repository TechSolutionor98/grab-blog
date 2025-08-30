"use client"

import { useEffect, useMemo, useState } from "react"

// Small helper to keep a stable clientRef per email for this browser
function getClientRef() {
  const key = "commentClientRef"
  let id = localStorage.getItem(key)
  if (!id) {
    id = cryptoRandomId()
    localStorage.setItem(key, id)
  }
  return id
}

function cryptoRandomId() {
  try {
    const bytes = new Uint8Array(16)
    window.crypto.getRandomValues(bytes)
    return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("")
  } catch (_) {
    return Math.random().toString(36).slice(2)
  }
}

export default function Comments({ blogId, blogTitle }) {
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [error, setError] = useState("")

  const [form, setForm] = useState({ name: "", email: "", website: "", content: "" })
  const [remember, setRemember] = useState(true)

  const clientRef = useMemo(() => getClientRef(), [])

  const fetchComments = async () => {
    setLoading(true)
    try {
      const url = new URL(`/api/comments/blog/${blogId}`, window.location.origin)
      if (form.email) {
        url.searchParams.set("email", form.email)
        url.searchParams.set("clientRef", clientRef)
      }
      const res = await fetch(url.toString().replace(window.location.origin, ""))
      const data = await res.json()
      if (res.ok) setComments(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Prefill stored identity
    try {
      const saved = JSON.parse(localStorage.getItem("commentIdentity") || "null")
      if (saved && typeof saved === "object") {
        setForm((f) => ({ ...f, name: saved.name || "", email: saved.email || "", website: saved.website || "" }))
      }
    } catch (_) {}
    if (blogId) fetchComments()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blogId])

  const [pending, setPending] = useState({ commentId: null, email: "" })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSubmitting(true)
    try {
  const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, blog: blogId, clientRef }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data?.message || data?.errors?.[0]?.msg || "Failed to submit comment")
      } else {
        setPending({ commentId: data.commentId, email: form.email })
        if (remember) {
          localStorage.setItem(
            "commentIdentity",
            JSON.stringify({ name: form.name, email: form.email, website: form.website })
          )
        }
        setVerifying(true)
      }
    } catch (err) {
      setError("Network error")
    } finally {
      setSubmitting(false)
    }
  }

  const [code, setCode] = useState("")
  const [verifyError, setVerifyError] = useState("")
  const verify = async (e) => {
    e.preventDefault()
    setVerifyError("")
    try {
      const res = await fetch("/api/comments/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commentId: pending.commentId, code, email: pending.email }),
      })
      const data = await res.json()
      if (!res.ok) {
        setVerifyError(data?.message || data?.errors?.[0]?.msg || "Invalid code")
      } else {
        setVerifying(false)
        setCode("")
        await fetchComments()
      }
    } catch (err) {
      setVerifyError("Network error")
    }
  }

  return (
    <div className="max-w-3xl">
      <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">Leave a comment</h3>

      {/* List */}
      <div className="mb-8">
        {loading ? (
          <div className="text-gray-500 text-sm">Loading comments…</div>
        ) : comments.length === 0 ? (
          <div className="text-gray-500 text-sm">No comments yet. Be the first!</div>
        ) : (
          <ul className="space-y-5">
            {comments.map((c) => (
              <li key={c._id} className="border border-gray-200 rounded p-4 bg-white">
                <div className="text-sm text-gray-600">{new Date(c.createdAt).toLocaleString()}</div>
                <div className="mt-1 font-semibold text-gray-900">{c.name}</div>
                <div className="mt-2 text-gray-800">{c.content}</div>
                {!c.approved && (
                  <div className="mt-2 text-xs text-amber-600">Pending admin approval — only visible to you</div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-gray-700 mb-1">Your Comment</label>
          <textarea
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-lime-500"
            rows={6}
            required
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
          />
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Name*"
            className="border rounded px-3 py-2"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <input
            type="email"
            placeholder="Email*"
            className="border rounded px-3 py-2"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <input
            type="url"
            placeholder="Website"
            className="border rounded px-3 py-2"
            value={form.website}
            onChange={(e) => setForm({ ...form, website: e.target.value })}
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-600">
          <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
          <span>Save my name, email, and website in this browser for the next time I comment.</span>
        </label>
        {error && <div className="text-sm text-red-600">{error}</div>}
        <button
          disabled={submitting}
          className="px-5 py-2 bg-gray-900 text-white rounded hover:bg-black disabled:opacity-60"
        >
          {submitting ? "Submitting…" : "Submit"}
        </button>
      </form>

      {/* Verify section */}
      {verifying && (
        <div className="mt-6 border border-lime-300 bg-lime-50 rounded p-4">
          <div className="font-medium text-gray-900">Enter the 4-digit code we sent to {pending.email}</div>
          <form onSubmit={verify} className="mt-3 flex items-center gap-3">
            <input
              inputMode="numeric"
              maxLength={4}
              className="border rounded px-3 py-2 w-28 tracking-widest text-center"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, "").slice(0, 4))}
              placeholder="0000"
              required
            />
            <button className="px-4 py-2 bg-lime-600 text-white rounded hover:bg-lime-700">Verify</button>
          </form>
          {verifyError && <div className="mt-2 text-sm text-red-600">{verifyError}</div>}
          <div className="mt-2 text-xs text-gray-600">After verification, your comment awaits admin approval and will be visible only to you until approved.</div>
        </div>
      )}
    </div>
  )
}
