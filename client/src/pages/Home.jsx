"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "react-router-dom"
import BlogCard from "../components/BlogCard"
import CategoryFilter from "../components/CategoryFilter"
import { ChevronLeft, ChevronRight } from "lucide-react"

const Home = () => {
  const [blogs, setBlogs] = useState([])
  const [featuredBlogs, setFeaturedBlogs] = useState([])
  const [trendingBlogs, setTrendingBlogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [pagination, setPagination] = useState({})
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [searchParams, setSearchParams] = useSearchParams()

  const currentPage = Number.parseInt(searchParams.get("page")) || 1
  const searchQuery = searchParams.get("search") || ""

  useEffect(() => {
    fetchBlogs()
    fetchFeaturedBlogs()
    fetchTrendingBlogs()
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

  const fetchFeaturedBlogs = async () => {
    try {
      const response = await fetch("/api/blogs?limit=3&sort=views")
      const data = await response.json()
      if (response.ok) {
        setFeaturedBlogs(data.blogs)
      }
    } catch (error) {
      console.error("Error fetching featured blogs:", error)
    }
  }

  const fetchTrendingBlogs = async () => {
    try {
      const response = await fetch("/api/blogs?limit=4&sort=createdAt")
      const data = await response.json()
      if (response.ok) {
        setTrendingBlogs(data.blogs)
      }
    } catch (error) {
      console.error("Error fetching trending blogs:", error)
    }
  }

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId)
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev)
      newParams.delete("page")
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

  if (searchQuery || selectedCategory) {
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

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Featured Blogs */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredBlogs.map((blog, index) => (
            <div key={blog._id} className="relative group cursor-pointer overflow-hidden rounded-lg">
              <div className="aspect-[4/3] relative">
                <img
                  src={blog.featuredImage?.url || "/placeholder.svg?height=300&width=400"}
                  alt={blog.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-end p-6">
                  <div className="text-white">
                    <div
                      className="inline-block px-3 py-1 rounded-full text-xs font-medium mb-3"
                      style={{ backgroundColor: blog.category?.color || "#2563eb" }}
                    >
                      {blog.category?.name}
                    </div>
                    <h3 className="text-xl font-bold mb-2 line-clamp-2">{blog.title}</h3>
                    <p className="text-sm opacity-90 line-clamp-2">{blog.excerpt}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Trending Section */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">BLOGS TRENDING THIS WEEK</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {trendingBlogs.map((blog) => (
              <div
                key={blog._id}
                className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="aspect-square relative">
                  <img
                    src={blog.featuredImage?.url || "/placeholder.svg?height=250&width=250"}
                    alt={blog.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <div
                    className="inline-block px-2 py-1 rounded text-xs font-medium text-white mb-2"
                    style={{ backgroundColor: blog.category?.color || "#2563eb" }}
                  >
                    {blog.category?.name}
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">{blog.title}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2">{blog.excerpt}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Category Filter Section */}
      {/* <section className="py-8 bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <CategoryFilter selectedCategory={selectedCategory} onCategoryChange={handleCategoryChange} />
        </div>
      </section> */}

      {/* Latest Posts Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">LATEST POSTS</h2>
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                  {blogs.map((blog) => (
                    <BlogCard key={blog._id} blog={blog} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No blogs found</h3>
                  <p className="text-gray-600">No blogs available at the moment</p>
                </div>
              )}

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex items-center justify-center">
                  <div className="flex items-center space-x-4 bg-white rounded-lg shadow-sm p-4">
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
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  )
}

export default Home
