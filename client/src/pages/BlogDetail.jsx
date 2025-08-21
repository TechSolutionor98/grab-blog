"use client"

import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { Calendar, User, Eye, ArrowLeft, Tag } from "lucide-react"


const BlogDetail = () => {
  const { slug } = useParams()
  const [blog, setBlog] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchBlog()
  }, [slug])

  const fetchBlog = async () => {
    setLoading(true)
    setError("")

    try {
      const response = await fetch(`/api/blogs/${slug}`)
      const data = await response.json()

      if (response.ok) {
        setBlog(data)
      } else {
        setError(data.message || "Blog not found")
      }
    } catch (error) {
      console.error("Error fetching blog:", error)
      setError("Failed to fetch blog")
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading blog...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Blog Not Found</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            to="/"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors space-x-2"
          >
            <ArrowLeft size={20} />
            <span>Back to Home</span>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link
          to="/"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-8 space-x-2"
        >
          <ArrowLeft size={20} />
          <span>Back to Blogs</span>
        </Link>

        <article className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Header */}
          <header className="px-8 py-8 border-b border-gray-200">
            {/* Category Badge */}
            <div className="mb-4">
              <span
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-white"
                style={{ backgroundColor: blog.category?.color || "#2563eb" }}
              >
                {blog.category?.name}
              </span>
            </div>

            <h1 className="text-4xl font-bold text-gray-900 mb-6 leading-tight">{blog.title}</h1>

            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-6 text-gray-600 mb-6">
              <div className="flex items-center space-x-2">
                <Calendar size={18} />
                <span>{formatDate(blog.publishedAt || blog.createdAt)}</span>
              </div>

              <div className="flex items-center space-x-2">
                <User size={18} />
                <span>By {blog.author?.username || "Anonymous"}</span>
              </div>

              <div className="flex items-center space-x-2">
                <Eye size={18} />
                <span>{blog.views || 0} views</span>
              </div>
            </div>

            {/* Excerpt */}
            {blog.excerpt && <p className="text-xl text-gray-700 leading-relaxed">{blog.excerpt}</p>}
          </header>

          {/* Featured Image */}
          {blog.featuredImage?.url && (
            <div className="px-8 py-6">
              <img
                src={blog.featuredImage.url || "/placeholder.svg"}
                alt={blog.title}
                className="w-full h-96 object-cover rounded-lg"
              />
            </div>
          )}

          {/* Content */}
          <div className="px-8 py-6">
            <div
              className="prose prose-lg max-w-none text-gray-800 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: blog.content }}
            />
          </div>

          {/* Tags */}
          {blog.tags && blog.tags.length > 0 && (
            <div className="px-8 py-6 border-t border-gray-200">
              <div className="flex items-center mb-4">
                <Tag size={18} className="text-gray-500 mr-2" />
                <span className="text-gray-700 font-medium">Tags</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {blog.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Author Info */}
          <div className="px-8 py-6 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                {blog.author?.avatar ? (
                  <img
                    src={blog.author.avatar || "/placeholder.svg"}
                    alt={blog.author.username}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-xl">
                      {blog.author?.username?.charAt(0).toUpperCase() || "A"}
                    </span>
                  </div>
                )}
              </div>
              <div className="ml-4">
                <h4 className="text-lg font-semibold text-gray-900">
                  Written by {blog.author?.username || "Anonymous"}
                </h4>
                <p className="text-gray-600">
                  Published on {formatDate(blog.publishedAt || blog.createdAt)}
                </p>
              </div>
            </div>
          </div>
        </article>
      </div>
    </div>
  )
}

export default BlogDetail
