"use client"

import { useState, useEffect } from "react"
import { useParams, useSearchParams } from "react-router-dom"
import BlogCard from "../components/BlogCard"
import { ChevronLeft, ChevronRight } from "lucide-react"


const Category = () => {
  const { categoryId } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const [blogs, setBlogs] = useState([])
  const [category, setCategory] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [pagination, setPagination] = useState({})

  const currentPage = Number.parseInt(searchParams.get("page")) || 1

  useEffect(() => {
    fetchCategoryAndBlogs()
  }, [categoryId, currentPage])

  const fetchCategoryAndBlogs = async () => {
    setLoading(true)
    setError("")

    try {
      // Fetch category details and blogs in parallel
      const [categoryResponse, blogsResponse] = await Promise.all([
        fetch(`/api/categories`),
        fetch(`/api/blogs?category=${categoryId}&page=${currentPage}&limit=9`),
      ])

      const categoriesData = await categoryResponse.json()
      const blogsData = await blogsResponse.json()

      if (categoryResponse.ok && blogsResponse.ok) {
        // Find the specific category
        const foundCategory = categoriesData.find((cat) => cat._id === categoryId)
        setCategory(foundCategory)
        setBlogs(blogsData.blogs)
        setPagination(blogsData.pagination)
      } else {
        setError("Failed to fetch category or blogs")
      }
    } catch (error) {
      console.error("Error fetching data:", error)
      setError("Failed to fetch data")
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = (page) => {
    setSearchParams({ page: page.toString() })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading category...</p>
        </div>
      </div>
    )
  }

  if (error || !category) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Category Not Found</h2>
          <p className="text-gray-600">{error || "The requested category could not be found."}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Category Header */}
        <div className="text-center mb-12">
          <div className="mb-4">
            <span
              className="inline-flex items-center px-4 py-2 rounded-full text-lg font-medium text-white"
              style={{ backgroundColor: category.color }}
            >
              {category.name}
            </span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{category.name} Blogs</h1>
          {category.description && (
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-6">{category.description}</p>
          )}
          {pagination.total && (
            <p className="text-gray-500">
              {pagination.total} blog{pagination.total !== 1 ? "s" : ""} in this category
            </p>
          )}
        </div>

        {/* Blogs Grid */}
        {blogs.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {blogs.map((blog) => (
                <BlogCard key={blog._id} blog={blog} />
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-between bg-white rounded-lg shadow-sm p-6">
                <button
                  className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={!pagination.hasPrev}
                >
                  <ChevronLeft size={20} />
                  <span>Previous</span>
                </button>

                <div className="text-gray-700 font-medium">
                  Page {pagination.current} of {pagination.pages}
                </div>

                <button
                  className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!pagination.hasNext}
                >
                  <span>Next</span>
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">No blogs found</h3>
            <p className="text-gray-600 text-lg">
              There are no published blogs in the {category.name} category yet.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Category
