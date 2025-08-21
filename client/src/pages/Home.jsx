"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "react-router-dom"
import BlogCard from "../components/BlogCard"
import CategoryFilter from "../components/CategoryFilter"
import { ChevronLeft, ChevronRight } from "lucide-react"


const Home = () => {
  const [blogs, setBlogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [pagination, setPagination] = useState({})
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [searchParams, setSearchParams] = useSearchParams()

  const currentPage = Number.parseInt(searchParams.get("page")) || 1
  const searchQuery = searchParams.get("search") || ""

  useEffect(() => {
    fetchBlogs()
  }, [currentPage, selectedCategory, searchQuery])

  const fetchBlogs = async () => {
    setLoading(true)
    setError("")

    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "9",
      })

      if (selectedCategory) {
        params.append("category", selectedCategory)
      }

      if (searchQuery) {
        params.append("search", searchQuery)
      }

      const response = await fetch(`/api/blogs?${params}`)
      const data = await response.json()

      if (response.ok) {
        setBlogs(data.blogs)
        setPagination(data.pagination)
      } else {
        setError(data.message || "Failed to fetch blogs")
      }
    } catch (error) {
      console.error("Error fetching blogs:", error)
      setError("Failed to fetch blogs")
    } finally {
      setLoading(false)
    }
  }

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId)
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev)
      newParams.delete("page") // Reset to first page
      if (searchQuery) {
        newParams.set("search", searchQuery)
      }
      return newParams
    })
  }

  const handlePageChange = (page) => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev)
      newParams.set("page", page.toString())
      if (searchQuery) {
        newParams.set("search", searchQuery)
      }
      return newParams
    })
  }

  const getPageTitle = () => {
    if (searchQuery) {
      return `Search results for "${searchQuery}"`
    }
    if (selectedCategory) {
      return "Category Blogs"
    }
    return "Latest Blogs"
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              <CategoryFilter selectedCategory={selectedCategory} onCategoryChange={handleCategoryChange} />
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Page Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{getPageTitle()}</h1>
              {pagination.total && (
                <p className="text-gray-600">
                  {pagination.total} blog{pagination.total !== 1 ? "s" : ""} found
                </p>
              )}
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lime-500"></div>
                <p className="mt-4 text-gray-600">Loading blogs...</p>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                <p className="text-red-600 mb-4">{error}</p>
                <button
                  onClick={fetchBlogs}
                  className="px-4 py-2 bg-lime-500 text-white rounded-lg hover:bg-lime-600 transition-colors"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* Blogs Grid */}
            {!loading && !error && (
              <>
                {blogs.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {blogs.map((blog) => (
                      <BlogCard key={blog._id} blog={blog} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No blogs found</h3>
                    <p className="text-gray-600">
                      {searchQuery
                        ? `No blogs match your search for "${searchQuery}"`
                        : "No blogs available in this category"}
                    </p>
                  </div>
                )}

                {/* Pagination */}
                {pagination.pages > 1 && (
                  <div className="flex items-center justify-between bg-white rounded-lg shadow-sm p-4">
                    <button
                      className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-lime-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={!pagination.hasPrev}
                    >
                      <ChevronLeft size={20} />
                      <span>Previous</span>
                    </button>

                    <div className="text-gray-600 font-medium">
                      Page {pagination.current} of {pagination.pages}
                    </div>

                    <button
                      className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-lime-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={!pagination.hasNext}
                    >
                      <span>Next</span>
                      <ChevronRight size={20} />
                    </button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}

export default Home
