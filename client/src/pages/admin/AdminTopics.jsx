"use client"

import { useState, useEffect } from "react"
import { Plus, Edit, Trash2, Tag, X, Check } from "lucide-react"

const AdminTopics = () => {
  const [topics, setTopics] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingTopic, setEditingTopic] = useState(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    color: "#10b981",
  })
  const [formErrors, setFormErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchTopics()
  }, [])

  const fetchTopics = async () => {
    try {
      const token = localStorage.getItem("adminToken")
      const response = await fetch("/api/topics/admin", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setTopics(data)
      }
    } catch (error) {
      console.error("Error fetching topics:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = (topic = null) => {
    if (topic) {
      setEditingTopic(topic)
      setFormData({
        name: topic.name,
        description: topic.description || "",
        color: topic.color,
      })
    } else {
      setEditingTopic(null)
      setFormData({
        name: "",
        description: "",
        color: "#10b981",
      })
    }
    setFormErrors({})
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingTopic(null)
    setFormData({ name: "", description: "", color: "#10b981" })
    setFormErrors({})
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const validateForm = () => {
    const errors = {}

    if (!formData.name.trim()) {
      errors.name = "Topic name is required"
    }

    if (formData.description && formData.description.length > 200) {
      errors.description = "Description must be less than 200 characters"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    setSubmitting(true)

    try {
      const token = localStorage.getItem("adminToken")
      const url = editingTopic ? `/api/topics/${editingTopic._id}` : "/api/topics"
      const method = editingTopic ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        fetchTopics()
        handleCloseModal()
      } else {
        if (data.errors) {
          const errors = {}
          data.errors.forEach((error) => {
            errors[error.path] = error.msg
          })
          setFormErrors(errors)
        } else {
          setFormErrors({ general: data.message })
        }
      }
    } catch (error) {
      console.error("Error saving topic:", error)
      setFormErrors({ general: "Failed to save topic" })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (topicId) => {
    if (!window.confirm("Are you sure you want to delete this topic?")) {
      return
    }

    try {
      const token = localStorage.getItem("adminToken")
      const response = await fetch(`/api/topics/${topicId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (response.ok) {
        fetchTopics()
      } else {
        alert(data.message || "Failed to delete topic")
      }
    } catch (error) {
      console.error("Error deleting topic:", error)
      alert("Failed to delete topic")
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manage Topics</h1>
            <p className="text-gray-600 mt-2">Organize your blog posts by topics</p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors space-x-2"
          >
            <Plus size={20} />
            <span>Add Topic</span>
          </button>
        </div>

        {/* Topics Grid */}
        <div>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
              <p className="mt-4 text-gray-600">Loading topics...</p>
            </div>
          ) : topics.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {topics.map((topic) => (
                <div
                  key={topic._id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-4 h-4 rounded-full flex-shrink-0"
                        style={{ backgroundColor: topic.color }}
                      ></div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{topic.name}</h3>
                        <p className="text-sm text-gray-500">{topic.blogCount || 0} blogs</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleOpenModal(topic)}
                        className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        title="Edit Topic"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(topic._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Topic"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {topic.description && <p className="text-gray-600 text-sm mb-4 line-clamp-2">{topic.description}</p>}

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Created {formatDate(topic.createdAt)}</span>
                    <div
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        topic.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {topic.isActive ? "Active" : "Inactive"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Tag size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No topics yet</h3>
              <p className="text-gray-600 mb-8">Create your first topic to organize your blog posts</p>
              <button
                onClick={() => handleOpenModal()}
                className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors space-x-2"
              >
                <Plus size={20} />
                <span>Add Topic</span>
              </button>
            </div>
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <div
            className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4"
            onClick={handleCloseModal}
          >
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">{editingTopic ? "Edit Topic" : "Add New Topic"}</h2>
                <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600 transition-colors">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="px-6 py-4">
                {formErrors.general && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {formErrors.general}
                  </div>
                )}

                <div className="mb-4">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Topic Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                      formErrors.name ? "border-red-300" : "border-gray-300"
                    }`}
                    placeholder="Enter topic name"
                  />
                  {formErrors.name && <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>}
                </div>

                <div className="mb-4">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                      formErrors.description ? "border-red-300" : "border-gray-300"
                    }`}
                    placeholder="Enter topic description (optional)"
                    rows="3"
                  />
                  {formErrors.description && <p className="mt-1 text-sm text-red-600">{formErrors.description}</p>}
                </div>

                <div className="mb-6">
                  <label htmlFor="color" className="block text-sm font-medium text-gray-700 mb-2">
                    Topic Color
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      id="color"
                      name="color"
                      value={formData.color}
                      onChange={handleInputChange}
                      className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.color}
                      onChange={(e) => handleInputChange({ target: { name: "color", value: e.target.value } })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="#10b981"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors space-x-2"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <>
                        <Check size={16} />
                        <span>{editingTopic ? "Update" : "Create"}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminTopics
