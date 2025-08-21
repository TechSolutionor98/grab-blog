"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import TipTapEditor from "../../components/TipTapEditor"
import { Save, Eye, ArrowLeft, Upload, X } from "lucide-react"


const CreateBlog = () => {
  const navigate = useNavigate()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
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
  })
  const [formErrors, setFormErrors] = useState({})
  const [tagInput, setTagInput] = useState("")
  const [keywordInput, setKeywordInput] = useState("")
  const [uploadingImage, setUploadingImage] = useState(false)

  useEffect(() => {
    fetchCategories()
  }, [])

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
      setFormData((prev) => ({ ...prev, [name]: value }))
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
    if (e) e.preventDefault()
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
    if (e) e.preventDefault()
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

  const handleSubmit = async (e, status = "draft") => {
    e.preventDefault()

    if (!validateForm()) return

    setLoading(true)

    try {
      const token = localStorage.getItem("adminToken")
      const response = await fetch("/api/blogs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          status,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        navigate("/admin/blogs")
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
      console.error("Error creating blog:", error)
      setFormErrors({ general: "Failed to create blog" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => navigate("/admin/blogs")} 
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft size={20} />
              <span>Back to Blogs</span>
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Create New Blog</h1>
          </div>

          <div className="flex items-center space-x-3">
            <button 
              onClick={(e) => handleSubmit(e, "draft")} 
              disabled={loading} 
              className="flex items-center space-x-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              <Save size={20} />
              <span>Save Draft</span>
            </button>
            <button 
              onClick={(e) => handleSubmit(e, "published")} 
              disabled={loading} 
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <Eye size={20} />
              <span>Publish</span>
            </button>
          </div>
        </div>

        <form className="blog-form">
          {formErrors.general && <div className="error-message">{formErrors.general}</div>}

          <div className="form-layout">
            {/* Main Content */}
            <div className="main-content">
              <div className="form-group">
                <label htmlFor="title">Blog Title *</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className={`form-control ${formErrors.title ? "error" : ""}`}
                  placeholder="Enter your blog title..."
                />
                {formErrors.title && <span className="field-error">{formErrors.title}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="excerpt">Excerpt</label>
                <textarea
                  id="excerpt"
                  name="excerpt"
                  value={formData.excerpt}
                  onChange={handleInputChange}
                  className="form-control"
                  placeholder="Brief description of your blog..."
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label>Content *</label>
                <TipTapEditor
                  content={formData.content}
                  onChange={handleContentChange}
                  placeholder="Start writing your blog content..."
                />
                {formErrors.content && <span className="field-error">{formErrors.content}</span>}
              </div>
            </div>

            {/* Sidebar */}
            <div className="sidebar-content">
              {/* Featured Image */}
              <div className="form-section">
                <h3>Featured Image</h3>
                {formData.featuredImage ? (
                  <div className="featured-image-preview">
                    <img src={formData.featuredImage.url || "/placeholder.svg"} alt="Featured" />
                    <button type="button" onClick={handleRemoveImage} className="remove-image-button">
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="image-upload">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      id="featured-image"
                      className="file-input"
                    />
                    <label htmlFor="featured-image" className="upload-button">
                      {uploadingImage ? (
                        <div className="loading-spinner small"></div>
                      ) : (
                        <>
                          <Upload size={20} />
                          Upload Image
                        </>
                      )}
                    </label>
                  </div>
                )}
              </div>

              {/* Category */}
              <div className="form-section">
                <h3>Category *</h3>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className={`form-control ${formErrors.category ? "error" : ""}`}
                >
                  <option value="">Select Category</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {formErrors.category && <span className="field-error">{formErrors.category}</span>}
              </div>

              {/* Tags */}
              <div className="form-section">
                <h3>Tags</h3>
                <div className="tag-input-form">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="Add a tag..."
                    className="form-control"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleAddTag(e)
                      }
                    }}
                  />
                  <button type="button" onClick={handleAddTag} className="add-button">
                    Add
                  </button>
                </div>
                <div className="tags-list">
                  {formData.tags.map((tag, index) => (
                    <span key={index} className="tag">
                      {tag}
                      <button type="button" onClick={() => handleRemoveTag(tag)} className="remove-tag">
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* SEO Settings */}
              <div className="form-section">
                <h3>SEO Settings</h3>

                <div className="form-group">
                  <label htmlFor="metaTitle">Meta Title</label>
                  <input
                    type="text"
                    id="metaTitle"
                    name="seo.metaTitle"
                    value={formData.seo.metaTitle}
                    onChange={handleInputChange}
                    className="form-control"
                    placeholder="SEO title..."
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="metaDescription">Meta Description</label>
                  <textarea
                    id="metaDescription"
                    name="seo.metaDescription"
                    value={formData.seo.metaDescription}
                    onChange={handleInputChange}
                    className="form-control"
                    placeholder="SEO description..."
                    rows="3"
                  />
                </div>

                <div className="form-group">
                  <label>Keywords</label>
                  <div className="tag-input-form">
                    <input
                      type="text"
                      value={keywordInput}
                      onChange={(e) => setKeywordInput(e.target.value)}
                      placeholder="Add keyword..."
                      className="form-control"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleAddKeyword(e)
                        }
                      }}
                    />
                    <button type="button" onClick={handleAddKeyword} className="add-button">
                      Add
                    </button>
                  </div>
                  <div className="tags-list">
                    {formData.seo.keywords.map((keyword, index) => (
                      <span key={index} className="tag">
                        {keyword}
                        <button type="button" onClick={() => handleRemoveKeyword(keyword)} className="remove-tag">
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateBlog
