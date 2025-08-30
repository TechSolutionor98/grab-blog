"use client"

import { useEffect, useState } from "react"
import { useAuth } from "../../contexts/AuthContext"

export default function AdminComments() {
	const { token } = useAuth()
	const [comments, setComments] = useState([])
	const [loading, setLoading] = useState(true)
	const [filter, setFilter] = useState("all")
	const [error, setError] = useState("")

	const fetchComments = async () => {
		setLoading(true)
		try {
			const url = `/api/comments?status=${encodeURIComponent(filter)}`
			const res = await fetch(url, {
				headers: { Authorization: `Bearer ${token}` },
			})
			const data = await res.json()
			if (res.ok) setComments(data)
			else setError(data?.message || "Failed to load comments")
		} catch (e) {
			setError("Network error")
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		fetchComments()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [filter])

	const approve = async (id) => {
		const res = await fetch(`/api/comments/${id}/approve`, {
			method: "PATCH",
			headers: { Authorization: `Bearer ${token}` },
		})
		if (res.ok) fetchComments()
	}

	const remove = async (id) => {
		if (!window.confirm("Delete this comment?")) return
		const res = await fetch(`/api/comments/${id}`, {
			method: "DELETE",
			headers: { Authorization: `Bearer ${token}` },
		})
		if (res.ok) fetchComments()
	}

	return (
		<div className="p-6">
			<div className="flex items-center justify-between mb-4">
				<h1 className="text-2xl font-semibold">Comments</h1>
				<select value={filter} onChange={(e) => setFilter(e.target.value)} className="border rounded px-3 py-2">
					<option value="all">All</option>
					<option value="pending">Pending verification</option>
					<option value="verified">Verified (awaiting approval)</option>
					<option value="approved">Approved</option>
				</select>
			</div>
			{error && <div className="text-red-600 text-sm mb-3">{error}</div>}
			{loading ? (
				<div>Loading…</div>
			) : (
				<div className="overflow-x-auto">
					<table className="min-w-full border">
						<thead className="bg-gray-50">
							<tr>
								<th className="text-left px-3 py-2 border">Date</th>
								<th className="text-left px-3 py-2 border">Blog</th>
								<th className="text-left px-3 py-2 border">Name</th>
								<th className="text-left px-3 py-2 border">Email</th>
								<th className="text-left px-3 py-2 border">Status</th>
								<th className="text-left px-3 py-2 border">Comment</th>
								<th className="px-3 py-2 border">Actions</th>
							</tr>
						</thead>
						<tbody>
							{comments.map((c) => (
								<tr key={c._id} className="border-t">
									<td className="px-3 py-2">{new Date(c.createdAt).toLocaleString()}</td>
									<td className="px-3 py-2">{c.blog?.title}</td>
									<td className="px-3 py-2">{c.name}</td>
									<td className="px-3 py-2">{c.email}</td>
									<td className="px-3 py-2">
										{c.approved ? (
											<span className="text-green-700">Approved</span>
										) : c.verified ? (
											<span className="text-amber-700">Verified</span>
										) : (
											<span className="text-gray-600">Pending</span>
										)}
									</td>
									<td className="px-3 py-2 max-w-xl">{c.content}</td>
									<td className="px-3 py-2 whitespace-nowrap">
										{!c.approved && c.verified && (
											<button className="px-3 py-1 bg-lime-600 text-white rounded mr-2" onClick={() => approve(c._id)}>
												Approve
											</button>
										)}
										<button className="px-3 py-1 bg-red-600 text-white rounded" onClick={() => remove(c._id)}>
											Delete
										</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
		</div>
	)
}

