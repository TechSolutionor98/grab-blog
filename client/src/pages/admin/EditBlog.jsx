"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useNavigate } from "react-router-dom"
import TipTapEditor from "../../components/TipTapEditor"
import { Save, Eye, ArrowLeft, Upload, X } from "lucide-react"


const EditBlog = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    excerpt: "",
    category: "",
    tags: [],
    status: "draft",
    featuredImage: null,
    seo: {
      metaTitle: "",
      metaDescription: "",
      keywords: [],
    },
  featured: false,
  })
  const [formErrors, setFormErrors] = useState({})
  const [tagInput, setTagInput] = useState("")
  const [keywordInput, setKeywordInput] = useState("")
  const [uploadingImage, setUploadingImage] = useState(false)

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem("adminToken")
      const response = await fetch("/api/categories/admin", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      }
    } catch (error) {
      console.error("Error fetching categories:", error)
    }
  }

  const fetchBlog = useCallback(async () => {
    try {
      const token = localStorage.getItem("adminToken")
      const response = await fetch(`/api/blogs/admin?limit=1000`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        const blog = data.blogs.find((b) => b._id === id)

        if (blog) {
          setFormData({
            title: blog.title || "",
            content: blog.content || "",
            excerpt: blog.excerpt || "",
            category: blog.category?._id || "",
            tags: blog.tags || [],
            status: blog.status || "draft",
            featuredImage: blog.featuredImage || null,
            featured: !!blog.featured,
            seo: {
              metaTitle: blog.seo?.metaTitle || "",
              metaDescription: blog.seo?.metaDescription || "",
              keywords: blog.seo?.keywords || [],
            },
          })
        } else {
          navigate("/admin/blogs")
        }
      }
    } catch (error) {
      console.error("Error fetching blog:", error)
      navigate("/admin/blogs")
    } finally {
      setInitialLoading(false)
    }
  }, [id, navigate])

  useEffect(() => {
    fetchCategories()
    fetchBlog()
  }, [fetchBlog])

  const handleInputChange = (e) => {
    const { name, value } = e.target

    if (name.startsWith("seo.")) {
      const seoField = name.split(".")[1]
      setFormData((prev) => ({
        ...prev,
        seo: {
          ...prev.seo,
          [seoField]: value,
        },
      }))
    } else {
  const val = name === "featured" ? e.target.checked : value
  setFormData((prev) => ({ ...prev, [name]: val }))
    }

    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const handleContentChange = (content) => {
    setFormData((prev) => ({ ...prev, content }))
    if (formErrors.content) {
      setFormErrors((prev) => ({ ...prev, content: "" }))
    }
  }

  const handleAddTag = (e) => {
    e.preventDefault()
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }))
      setTagInput("")
    }
  }

  const handleRemoveTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }))
  }

  const handleAddKeyword = (e) => {
    e.preventDefault()
    if (keywordInput.trim() && !formData.seo.keywords.includes(keywordInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        seo: {
          ...prev.seo,
          keywords: [...prev.seo.keywords, keywordInput.trim()],
        },
      }))
      setKeywordInput("")
    }
  }

  const handleRemoveKeyword = (keywordToRemove) => {
    setFormData((prev) => ({
      ...prev,
      seo: {
        ...prev.seo,
        keywords: prev.seo.keywords.filter((keyword) => keyword !== keywordToRemove),
      },
    }))
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setUploadingImage(true)
    try {
      const formDataUpload = new FormData()
      formDataUpload.append("image", file)

      const token = localStorage.getItem("adminToken")
      const response = await fetch("/api/upload/image", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataUpload,
      })

      if (response.ok) {
        const data = await response.json()
        setFormData((prev) => ({
          ...prev,
          featuredImage: {
            url: data.url,
            publicId: data.publicId,
          },
        }))
      } else {
        alert("Failed to upload image")
      }
    } catch (error) {
      console.error("Error uploading image:", error)
      alert("Failed to upload image")
    } finally {
      setUploadingImage(false)
    }
  }

  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, featuredImage: null }))
  }

  const validateForm = () => {
    const errors = {}

    if (!formData.title.trim()) {
      errors.title = "Title is required"
    }

    if (!formData.content.trim() || formData.content === "<p></p>") {
      errors.content = "Content is required"
    }

    if (!formData.category) {
      errors.category = "Category is required"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e, status = formData.status) => {
    e.preventDefault()

    if (!validateForm()) return

    setLoading(true)

    try {
      const token = localStorage.getItem("adminToken")
      const response = await fetch(`/api/blogs/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          status,
          featured: formData.featured,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        navigate("/admin/blogs")
      } else {
        if (data.message === "Slug already exists") {
          setFormErrors({ slug: data.message })
        } else if (data.errors) {
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
      console.error("Error updating blog:", error)
      setFormErrors({ general: "Failed to update blog" })
    } finally {
      setLoading(false)
    }
  }

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading blog...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate("/admin/blogs")} 
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft size={20} />
                Back to Blogs
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Edit Blog</h1>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={(e) => handleSubmit(e, "draft")} 
                disabled={loading} 
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save size={20} />
                Save Draft
              </button>
              <button 
                onClick={(e) => handleSubmit(e, "published")} 
                disabled={loading} 
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Eye size={20} />
                {formData.status === "published" ? "Update" : "Publish"}
              </button>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {formErrors.general && (
            <div className="mx-6 mt-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
              {formErrors.general}
            </div>
          )}

          <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              <div className="space-y-2">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Blog Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    formErrors.title ? "border-red-300 bg-red-50" : "border-gray-300"
                  }`}
                  placeholder="Enter your blog title..."
                />
                {formErrors.title && <span className="text-sm text-red-600">{formErrors.title}</span>}
              </div>

              <div className="space-y-2">
                <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700">
                  Excerpt
                </label>
                <textarea
                  id="excerpt"
                  name="excerpt"
                  value={formData.excerpt}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-vertical"
                  placeholder="Brief description of your blog..."
                  rows="3"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Content *
                </label>
                <div className={`border rounded-lg ${formErrors.content ? "border-red-300" : "border-gray-300"}`}>
                  <TipTapEditor
                    content={formData.content}
                    onChange={handleContentChange}
                    placeholder="Start writing your blog content..."
                  />
                </div>
                {formErrors.content && <span className="text-sm text-red-600">{formErrors.content}</span>}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Featured toggle */}
              <div className="bg-gray-50 rounded-lg p-4">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="featured"
                    checked={formData.featured}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">Mark as Featured</span>
                </label>
                <p className="text-xs text-gray-500 mt-2">Featured blogs appear in the homepage hero.</p>
              </div>
              {/* Featured Image */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Featured Image</h3>
                {formData.featuredImage ? (
                  <div className="relative group">
                    <img 
                      src={formData.featuredImage.url || "/placeholder.svg"} 
                      alt="Featured" 
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <button 
                      type="button" 
                      onClick={handleRemoveImage} 
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      id="featured-image"
                      className="hidden"
                    />
                    <label 
                      htmlFor="featured-image" 
                      className="cursor-pointer flex flex-col items-center gap-2"
                    >
                      {uploadingImage ? (
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      ) : (
                        <>
                          <Upload size={32} className="text-gray-400" />
                          <span className="text-sm font-medium text-gray-600">Upload Image</span>
                          <span className="text-xs text-gray-500">PNG, JPG up to 10MB</span>
                        </>
                      )}
                    </label>
                  </div>
                )}
              </div>

              {/* Category */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Category *</h3>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    formErrors.category ? "border-red-300 bg-red-50" : "border-gray-300"
                  }`}
                >
                  <option value="">Select Category</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {formErrors.category && <span className="text-sm text-red-600 mt-1 block">{formErrors.category}</span>}
              </div>

              {/* Tags */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags</h3>
                <div className="flex gap-2 mb-3" onClick={handleAddTag}>
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="Add a tag..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddTag(e)}
                  />
                  <button 
                    type="button"
                    onClick={handleAddTag}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <span key={index} className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      {tag}
                      <button 
                        type="button" 
                        onClick={() => handleRemoveTag(tag)} 
                        className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* SEO Settings */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">SEO Settings</h3>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="metaTitle" className="block text-sm font-medium text-gray-700">
                      Meta Title
                    </label>
                    <input
                      type="text"
                      id="metaTitle"
                      name="seo.metaTitle"
                      value={formData.seo.metaTitle}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      placeholder="SEO title..."
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="metaDescription" className="block text-sm font-medium text-gray-700">
                      Meta Description
                    </label>
                    <textarea
                      id="metaDescription"
                      name="seo.metaDescription"
                      value={formData.seo.metaDescription}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-vertical"
                      placeholder="SEO description..."
                      rows="3"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Keywords</label>
                    <div className="flex gap-2 mb-3" onClick={handleAddKeyword}>
                      <input
                        type="text"
                        value={keywordInput}
                        onChange={(e) => setKeywordInput(e.target.value)}
                        placeholder="Add keyword..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        onKeyPress={(e) => e.key === 'Enter' && handleAddKeyword(e)}
                      />
                      <button 
                        type="button"
                        onClick={handleAddKeyword}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.seo.keywords.map((keyword, index) => (
                        <span key={index} className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                          {keyword}
                          <button 
                            type="button" 
                            onClick={() => handleRemoveKeyword(keyword)} 
                            className="hover:bg-green-200 rounded-full p-0.5 transition-colors"
                          >
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EditBlog
