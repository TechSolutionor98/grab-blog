"use client"

import { useState, useEffect } from "react"
import { Plus, Edit, Trash2, Building2, X, Check } from "lucide-react"

const AdminBrands = () => {
  const [brands, setBrands] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingBrand, setEditingBrand] = useState(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    color: "#f59e0b",
    website: "",
    logo: null,
  })
  const [formErrors, setFormErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)

  useEffect(() => {
    fetchBrands()
  }, [])

  const fetchBrands = async () => {
    try {
      const token = localStorage.getItem("adminToken")
      const response = await fetch("/api/brands/admin", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setBrands(data)
      }
    } catch (error) {
      console.error("Error fetching brands:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = (brand = null) => {
    if (brand) {
      setEditingBrand(brand)
      setFormData({
        name: brand.name,
        description: brand.description || "",
        color: brand.color,
        website: brand.website || "",
        logo: brand.logo || null,
      })
    } else {
      setEditingBrand(null)
      setFormData({
        name: "",
        description: "",
        color: "#f59e0b",
        website: "",
        logo: null,
      })
    }
    setFormErrors({})
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingBrand(null)
    setFormData({ name: "", description: "", color: "#f59e0b", website: "", logo: null })
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

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setUploadingLogo(true)
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
          logo: {
            url: data.url,
            publicId: data.publicId,
          },
        }))
      } else {
        alert("Failed to upload logo")
      }
    } catch (error) {
      console.error("Error uploading logo:", error)
      alert("Failed to upload logo")
    } finally {
      setUploadingLogo(false)
    }
  }

  const handleRemoveLogo = () => {
    setFormData((prev) => ({ ...prev, logo: null }))
  }

  const validateForm = () => {
    const errors = {}

    if (!formData.name.trim()) {
      errors.name = "Brand name is required"
    }

    if (formData.description && formData.description.length > 200) {
      errors.description = "Description must be less than 200 characters"
    }

    if (formData.website && !formData.website.match(/^https?:\/\/.+/)) {
      errors.website = "Please enter a valid website URL (starting with http:// or https://)"
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
      const url = editingBrand ? `/api/brands/${editingBrand._id}` : "/api/brands"
      const method = editingBrand ? "PUT" : "POST"

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
        fetchBrands()
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
      console.error("Error saving brand:", error)
      setFormErrors({ general: "Failed to save brand" })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (brandId) => {
    if (!window.confirm("Are you sure you want to delete this brand?")) {
      return
    }

    try {
      const token = localStorage.getItem("adminToken")
      const response = await fetch(`/api/brands/${brandId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (response.ok) {
        fetchBrands()
      } else {
        alert(data.message || "Failed to delete brand")
      }
    } catch (error) {
      console.error("Error deleting brand:", error)
      alert("Failed to delete brand")
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
            <h1 className="text-3xl font-bold text-gray-900">Manage Brands</h1>
            <p className="text-gray-600 mt-2">Organize your blog posts by brands and companies</p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="inline-flex items-center px-4 py-2 bg-amber-600 text-white font-medium rounded-lg hover:bg-amber-700 transition-colors space-x-2"
          >
            <Plus size={20} />
            <span>Add Brand</span>
          </button>
        </div>

        {/* Brands Grid */}
        <div>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
              <p className="mt-4 text-gray-600">Loading brands...</p>
            </div>
          ) : brands.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {brands.map((brand) => (
                <div
                  key={brand._id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {brand.logo ? (
                        <img
                          src={brand.logo.url || "/placeholder.svg"}
                          alt={brand.name}
                          className="w-8 h-8 rounded object-cover flex-shrink-0"
                        />
                      ) : (
                        <div
                          className="w-8 h-8 rounded flex-shrink-0 flex items-center justify-center text-white text-xs font-bold"
                          style={{ backgroundColor: brand.color }}
                        >
                          {brand.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{brand.name}</h3>
                        <p className="text-sm text-gray-500">{brand.blogCount || 0} blogs</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleOpenModal(brand)}
                        className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                        title="Edit Brand"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(brand._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Brand"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {brand.description && <p className="text-gray-600 text-sm mb-4 line-clamp-2">{brand.description}</p>}

                  {brand.website && (
                    <a
                      href={brand.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-amber-600 hover:text-amber-700 text-sm font-medium mb-4 block truncate"
                    >
                      {brand.website}
                    </a>
                  )}

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Created {formatDate(brand.createdAt)}</span>
                    <div
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        brand.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {brand.isActive ? "Active" : "Inactive"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Building2 size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No brands yet</h3>
              <p className="text-gray-600 mb-8">Create your first brand to organize your blog posts</p>
              <button
                onClick={() => handleOpenModal()}
                className="inline-flex items-center px-4 py-2 bg-amber-600 text-white font-medium rounded-lg hover:bg-amber-700 transition-colors space-x-2"
              >
                <Plus size={20} />
                <span>Add Brand</span>
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
                <h2 className="text-xl font-semibold text-gray-900">{editingBrand ? "Edit Brand" : "Add New Brand"}</h2>
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
                    Brand Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                      formErrors.name ? "border-red-300" : "border-gray-300"
                    }`}
                    placeholder="Enter brand name"
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
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                      formErrors.description ? "border-red-300" : "border-gray-300"
                    }`}
                    placeholder="Enter brand description (optional)"
                    rows="3"
                  />
                  {formErrors.description && <p className="mt-1 text-sm text-red-600">{formErrors.description}</p>}
                </div>

                <div className="mb-4">
                  <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-2">
                    Website
                  </label>
                  <input
                    type="url"
                    id="website"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                      formErrors.website ? "border-red-300" : "border-gray-300"
                    }`}
                    placeholder="https://example.com"
                  />
                  {formErrors.website && <p className="mt-1 text-sm text-red-600">{formErrors.website}</p>}
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Brand Logo</label>
                  {formData.logo ? (
                    <div className="flex items-center space-x-3">
                      <img
                        src={formData.logo.url || "/placeholder.svg"}
                        alt="Brand logo"
                        className="w-12 h-12 rounded object-cover"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveLogo}
                        className="text-red-600 hover:text-red-700 text-sm"
                      >
                        Remove Logo
                      </button>
                    </div>
                  ) : (
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        id="brand-logo"
                        className="hidden"
                      />
                      <label
                        htmlFor="brand-logo"
                        className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
                      >
                        {uploadingLogo ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-amber-500 mr-2"></div>
                        ) : (
                          "Upload Logo"
                        )}
                      </label>
                    </div>
                  )}
                </div>

                <div className="mb-6">
                  <label htmlFor="color" className="block text-sm font-medium text-gray-700 mb-2">
                    Brand Color
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
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      placeholder="#f59e0b"
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
                    className="inline-flex items-center px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 transition-colors space-x-2"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <>
                        <Check size={16} />
                        <span>{editingBrand ? "Update" : "Create"}</span>
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

export default AdminBrands
