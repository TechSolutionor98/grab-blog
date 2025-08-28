"use client"

import { useState, useEffect, useRef } from "react"
import { useSearchParams } from "react-router-dom"
import BlogCard from "../components/BlogCard"
import CategoryFilter from "../components/CategoryFilter"
import { ChevronLeft, ChevronRight } from "lucide-react"

const Home = () => {
  const [blogs, setBlogs] = useState([])
  const [featuredBlogs, setFeaturedBlogs] = useState([])
  const [trendingBlogs, setTrendingBlogs] = useState([])
  // Hero slider: show 3 cards, move by 1 card every 3s
  const ITEMS_PER_VIEW = 3
  const [currentIndex, setCurrentIndex] = useState(ITEMS_PER_VIEW)
  const [enableTransition, setEnableTransition] = useState(true)
  // Show gutters only while the slider is animating
  const [isAnimating, setIsAnimating] = useState(false)
  // Pause autoplay when hovering hero cards
  const [isPaused, setIsPaused] = useState(false)
  // Viewport width for precise pixel math (keeps card size constant)
  const viewportRef = useRef(null)
  const trackRef = useRef(null)
  const [viewportWidth, setViewportWidth] = useState(0)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState("")
  const [pagination, setPagination] = useState({})
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [searchParams, setSearchParams] = useSearchParams()
  // Latest (homepage) incremental state
  const [latestPage, setLatestPage] = useState(1)
  const [latestHasMore, setLatestHasMore] = useState(false)

  const currentPage = Number.parseInt(searchParams.get("page")) || 1
  const searchQuery = searchParams.get("search") || ""

  useEffect(() => {
    // Featured + Trending always refresh when deps change
    fetchFeaturedBlogs()
    fetchTrendingBlogs()

    if (searchQuery || selectedCategory) {
      // Use paginated search/category view
      fetchBlogs()
    } else {
      // Reset and load first page for homepage Latest section
      setBlogs([])
      setLatestPage(1)
      fetchLatestBlogs(1, true)
    }
  }, [currentPage, selectedCategory, searchQuery])

  // Observe viewport width to compute exact slide width and pixel-based movement
  useEffect(() => {
    const el = viewportRef.current
    if (!el) return
    const update = () => setViewportWidth(el.clientWidth || 0)
    update()
    let ro
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(update)
      ro.observe(el)
    } else {
      window.addEventListener("resize", update)
    }
    return () => {
      if (ro) ro.disconnect()
      else window.removeEventListener("resize", update)
    }
  }, [])

  const fetchBlogs = async () => {
    setLoading(true)
    setError("")

    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        // Show more results when searching
        limit: searchQuery ? "60" : "9",
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

  // Latest (homepage) loader with incremental append
  const fetchLatestBlogs = async (page = 1, replace = false) => {
    // page 1 uses main loading state; subsequent pages use loadingMore
    if (page === 1) setLoading(true)
    if (page > 1) setLoadingMore(true)
    setError("")

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "9",
        sort: "-publishedAt",
      })

      const response = await fetch(`/api/blogs?${params}`)
      const data = await response.json()

      if (response.ok) {
        setBlogs((prev) => (replace ? data.blogs : [...prev, ...data.blogs]))
        const pag = data.pagination || {}
        setLatestPage(pag.current || page)
        setLatestHasMore(!!pag.hasNext)
      } else {
        setError(data.message || "Failed to fetch blogs")
      }
    } catch (err) {
      console.error("Error fetching latest blogs:", err)
      setError("Failed to fetch blogs")
    } finally {
      if (page === 1) setLoading(false)
      if (page > 1) setLoadingMore(false)
    }
  }


  
  const fetchFeaturedBlogs = async () => {
    try {
      const response = await fetch("/api/blogs?limit=9&featured=true&sort=-publishedAt")
      const data = await response.json()
      if (response.ok) {
        setFeaturedBlogs(data.blogs)
        // Reset hero slider position when data changes
        setCurrentIndex(ITEMS_PER_VIEW)
        setEnableTransition(true)
      }
    } catch (error) {
      console.error("Error fetching featured blogs:", error)
    }
  }

  // Auto-advance hero every 3 seconds (slides by 1 card)
  const useLoop = featuredBlogs && featuredBlogs.length > ITEMS_PER_VIEW
  useEffect(() => {
    if (!useLoop) return
    if (isPaused) return
    const id = setInterval(() => {
      // Skip if we are already animating to avoid stacked transitions
      if (isAnimating) return
      setIsAnimating(true)
      // Defer the index change to the next frame to avoid layout jump
      requestAnimationFrame(() => setCurrentIndex((idx) => idx + 1))
    }, 2600)
    return () => clearInterval(id)
  }, [useLoop, isAnimating, isPaused])

  // Build slides with clones at both ends for seamless loop
  const slides = (() => {
    if (!featuredBlogs || featuredBlogs.length === 0) return []
    if (!useLoop) return featuredBlogs
    const startClones = featuredBlogs.slice(-ITEMS_PER_VIEW)
    const endClones = featuredBlogs.slice(0, ITEMS_PER_VIEW)
    return [...startClones, ...featuredBlogs, ...endClones]
  })()

  // Pixel math for smooth motion with dynamic gutters without shrinking cards
  const slideWidthPx = viewportWidth > 0 ? viewportWidth / ITEMS_PER_VIEW : 0
  // Larger, more noticeable gap while animating (responsive)
  const gapPx = isAnimating
    ? (viewportWidth >= 1024
        ? 32
        : viewportWidth >= 640
          ? 28
          : 20)
    : 0

  const fetchTrendingBlogs = async () => {
    try {
  // Fetch only blogs marked as Trending This Week
  // Prefer the dedicated endpoint; fallback kept simple if needed
  const response = await fetch("/api/blogs/trending?limit=4")
      const data = await response.json()
      if (response.ok) {
  const list = Array.isArray(data) ? data : data.blogs
  setTrendingBlogs(Array.isArray(list) ? list : [])
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
            {/* Sidebar (hidden on search results page) */}
            {!searchQuery && (
              <aside className="lg:w-64 flex-shrink-0">
                <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
                  <CategoryFilter selectedCategory={selectedCategory} onCategoryChange={handleCategoryChange} />
                </div>
              </aside>
            )}

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
  <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Hero Section - Featured Blogs (3 up, step-by-step slider) */}
  <section className="w-full">
        {featuredBlogs && featuredBlogs.length > 0 && (
          <div className="relative group">
      {/* Track container with clipping */}
      <div
        className="overflow-hidden"
        ref={viewportRef}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
              <div
        ref={trackRef}
        className={`flex`}
                style={{
                  width: "100%",
                  transform: useLoop
                    ? (slideWidthPx
                        ? `translate3d(-${currentIndex * slideWidthPx}px, 0, 0)`
                        : `translate3d(-${currentIndex * (100 / ITEMS_PER_VIEW)}%, 0, 0)`) // fallback before measure
                    : "translate3d(0, 0, 0)",
                  transition:
                    `${useLoop && enableTransition ? "transform 950ms cubic-bezier(0.2, 0.85, 0.2, 1)," : ""} margin 240ms ease-out`,
                  willChange: "transform",
                  marginLeft: isAnimating ? -gapPx / 2 : 0,
                  marginRight: isAnimating ? -gapPx / 2 : 0,
                }}
                onTransitionEnd={() => {
                  if (!useLoop) return
                  // When we hit the cloned end, jump back to real first slide without animation
                  if (currentIndex >= featuredBlogs.length + ITEMS_PER_VIEW) {
                    setEnableTransition(false)
                    setCurrentIndex(ITEMS_PER_VIEW)
                    // Re-enable transition on next frame
                    requestAnimationFrame(() => {
                      const el = trackRef.current
                      if (el) el.getBoundingClientRect() // force reflow
                      requestAnimationFrame(() => setEnableTransition(true))
                    })
                  }
                  // When we hit the cloned start, jump to last real slide without animation
                  if (currentIndex <= ITEMS_PER_VIEW - 1) {
                    setEnableTransition(false)
                    setCurrentIndex(featuredBlogs.length + ITEMS_PER_VIEW - 1)
                    requestAnimationFrame(() => {
                      const el = trackRef.current
                      if (el) el.getBoundingClientRect()
                      requestAnimationFrame(() => setEnableTransition(true))
                    })
                  }
                  // Animation completed; hide gutters again
                  setIsAnimating(false)
                }}
              >
              {slides.map((blog, i) => (
                <div
                  key={`${blog._id}-${i}`}
                  style={{
                    flex: "0 0 auto",
                    width: slideWidthPx ? `${slideWidthPx}px` : `${100 / ITEMS_PER_VIEW}%`,
                    marginLeft: isAnimating ? gapPx / 2 : 0,
                    marginRight: isAnimating ? gapPx / 2 : 0,
                    transition: "margin 240ms ease-out",
                  }}
                >
                  {/* Preserve original card layout */}
                  <div className="relative group cursor-pointer overflow-hidden mt-0.5">
                    <div className="aspect-[4/3] relative">
                      <img
                        src={blog.featuredImage?.url || "/placeholder.svg?height=300&width=400"}
                        alt={blog.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0  flex items-end justify-center p-6">
                        <div className="text-white text-center w-full">
                          {/* <div
                            className="inline-block px-3 py-1 rounded-full text-xs font-medium mb-3"
                            style={{ backgroundColor: blog.category?.color || "#2563eb" }}
                          >
                            {blog.category?.name}
                          </div> */}
                          <h3 className="text-xl font-bold mb-2 line-clamp-2">{blog.title}</h3>
                          {/* <p className="text-sm opacity-90 line-clamp-2">{blog.excerpt}</p> */}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {/* Placeholders to keep 3-up layout if fewer items and no loop */}
              {!useLoop && featuredBlogs.length > 0 && featuredBlogs.length < ITEMS_PER_VIEW &&
                Array.from({ length: ITEMS_PER_VIEW - featuredBlogs.length }).map((_, i) => (
                  <div
                    key={`ph-${i}`}
                    style={{
                      flex: "0 0 auto",
                      width: slideWidthPx ? `${slideWidthPx}px` : `${100 / ITEMS_PER_VIEW}%`,
                      marginLeft: isAnimating ? gapPx / 2 : 0,
                      marginRight: isAnimating ? gapPx / 2 : 0,
                    }}
                  >
                    <div className="relative">
                      <div className="aspect-[4/3] bg-gray-100" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Slider Arrows outside cards */}
            {useLoop && (
              <>
                <button
                  type="button"
                  aria-label="Previous"
                  onClick={() => {
                    if (isAnimating) return
                    setIsAnimating(true)
                    setCurrentIndex((idx) => idx - 1)
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-white/90 shadow hover:bg-white text-gray-700 hover:text-gray-900 transition-colors opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto focus:opacity-100 focus:pointer-events-auto transition-opacity"
                >
                  <ChevronLeft className="mx-auto" size={20} />
                </button>
                <button
                  type="button"
                  aria-label="Next"
                  onClick={() => {
                    if (isAnimating) return
                    setIsAnimating(true)
                    setCurrentIndex((idx) => idx + 1)
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-white/90 shadow hover:bg-white text-gray-700 hover:text-gray-900 transition-colors opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto focus:opacity-100 focus:pointer-events-auto transition-opacity"
                >
                  <ChevronRight className="mx-auto" size={20} />
                </button>
              </>
            )}
          </div>
        )}
      </section>

      {/* Trending Section */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">BLOGS TRENDING THIS WEEK</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {(Array.isArray(trendingBlogs) ? trendingBlogs : []).map((blog) => (
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

              {/* Load More */}
              {latestHasMore && (
                <div className="flex items-center justify-center">
                  <button
                    onClick={() => fetchLatestBlogs(latestPage + 1, false)}
                    disabled={loadingMore}
                    className="px-6 py-3 rounded-lg bg-lime-500 text-white hover:bg-lime-600 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                  >
                    {loadingMore ? "Loading..." : "Load More"}
                  </button>
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
