"use client"

import { useState, useEffect, useMemo } from "react"
import { useParams, Link } from "react-router-dom"
import { Calendar, User, Eye, ArrowLeft, Tag, Share2, ChevronRight } from "lucide-react"
import RelatedPosts from "../components/RelatedPosts"
import Comments from "../components/Comments"


const BlogDetail = () => {
  const { slug } = useParams()
  const [blog, setBlog] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [progress, setProgress] = useState(0)
  const [recent, setRecent] = useState([])
  const [toc, setToc] = useState([])
  const [contentHtml, setContentHtml] = useState("")
  const readingMinutes = useMemo(() => {
    const html = blog?.content || ""
    const text = html.replace(/<[^>]+>/g, " ")
    const words = text.trim().split(/\s+/).filter(Boolean).length
    return Math.max(1, Math.ceil(words / 200))
  }, [blog])

  useEffect(() => {
    fetchBlog()
  }, [slug])

  // Once blog is fetched, prepare: recent posts and table of contents
  useEffect(() => {
    if (!blog) return
    // Recent posts (exclude current)
    ;(async () => {
      try {
        const res = await fetch(`/api/blogs?limit=5&sort=-publishedAt`)
        const data = await res.json()
        if (res.ok) {
          const items = (data.blogs || []).filter((b) => b.slug !== blog.slug)
          setRecent(items)
        }
      } catch (_) {}
    })()

    // Build TOC from blog.content (h2/h3) and inject ids
    try {
      const parser = new DOMParser()
      const doc = parser.parseFromString(blog.content || "", "text/html")
      const headings = Array.from(doc.querySelectorAll("h2, h3"))
      const makeId = (text) =>
        text
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, "")
          .trim()
          .replace(/\s+/g, "-")
      const tocItems = []
      headings.forEach((h) => {
        const text = h.textContent || ""
        const id = h.id || makeId(text)
        h.id = id
        tocItems.push({ id, text, level: h.tagName.toLowerCase() })
      })
      setToc(tocItems)
      setContentHtml(doc.body.innerHTML)
    } catch (_) {
      setContentHtml(blog.content || "")
    }
  }, [blog])

  // Reading progress (page scroll)
  useEffect(() => {
    const onScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = document.documentElement
      const total = scrollHeight - clientHeight
      const pct = total > 0 ? Math.min(100, Math.max(0, (scrollTop / total) * 100)) : 0
      setProgress(pct)
    }
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll)
    return () => {
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
    }
  }, [])

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
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lime-500 mx-auto"></div>
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
            className="inline-flex items-center px-4 py-2 bg-lime-500 text-white font-medium rounded-lg hover:bg-lime-600 transition-colors space-x-2"
          >
            <ArrowLeft size={20} />
            <span>Back to Home</span>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Reading progress bar */}
      <div
        className="fixed top-0 left-0 h-1 bg-lime-500 z-50"
        style={{ width: `${progress}%` }}
      />

  {/* no hero banner; we'll present media + ad slot inside the article header below */}

  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumbs */}
        <nav className="text-sm text-gray-600 mb-6">
          <ol className="flex items-center flex-wrap gap-2">
            <li>
              <Link to="/" className="hover:text-lime-600">Home</Link>
            </li>
            <li className="text-gray-400">»</li>
            {blog.category?.slug ? (
              <li>
                <Link to={`/category/${blog.category.slug}`} className="hover:text-lime-600">
                  {blog.category?.name || "Category"}
                </Link>
              </li>
            ) : (
              <li className="text-gray-700">{blog.category?.name || "Category"}</li>
            )}
          </ol>
        </nav>
        <div className="grid lg:grid-cols-[minmax(0,1fr)_340px] gap-8 bg-white">
          {/* Main */}
          <article className="bg-white rounded-lg  overflow-hidden">
            {/* Header */}
            <header className="sm:px-8 sm:py-8 px-2 py-2 border-b border-gray-200">
              {/* Main image first */}
              {blog.featuredImage?.url && (
                <div className="mb-6 rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={blog.featuredImage.url}
                    alt={blog.title}
                    className="w-full h-auto object-cover"
                  />
                </div>
              )}
              <div className="mb-4">
                <span
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-white"
                  style={{ backgroundColor: blog.category?.color || "#16a34a" }}
                >
                  {blog.category?.name}
                </span>
              </div>
              <h1 className="text-lg sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 leading-tight">{blog.title}</h1>
              {blog.excerpt && <p className="text-lg md:text-xl text-gray-700 leading-relaxed mb-4">{blog.excerpt}</p>}
              <div className="flex flex-wrap items-center gap-6 text-gray-600">
                <div className="flex items-center space-x-2">
                  <Calendar size={18} />
                  <span>{formatDate(blog.publishedAt || blog.createdAt)}</span>
                </div>
                <div className="flex items-center space-x-0">
                  <User size={18} />
                  <span>By {blog.author?.username || "Anonymous"}</span>
                </div>
                <div className="flex items-center space-x-2 sm:mb-0 mb-4">
                  <Eye size={18} />
                  <span>{blog.views || 0} views</span>
                </div>
                <div className="flex items-center space-x-2 sm:mb-0 mb-4">
                  <span className="inline-block w-2 h-2 rounded-full bg-lime-500" />
                  <span>{readingMinutes} minutes read</span>
                </div>
              </div>
            </header>

            {/* Share row */}
          

            {/* Content */}
            <div className="sm:px-8 sm:py-6 px-2 py-2">
              <div
                className="prose prose-lg max-w-none text-gray-800 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: contentHtml || blog.content }}
              />
            </div>

            {/* Optional: Related products block (up to 5) */}
            {Array.isArray(blog?.relatedProducts) && blog.relatedProducts.length > 0 && (
              <div className="px-8 pb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Related products</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  {blog.relatedProducts.slice(0,5).map((prod, idx) => (
                    <div key={idx} className="border rounded-lg overflow-hidden bg-white">
                      {prod.image && (
                        <div className="aspect-square bg-gray-50 overflow-hidden">
                          <img src={prod.image} alt={prod.name} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="p-3">
                        <div className="text-sm font-semibold text-gray-900 line-clamp-2">{prod.name}</div>
                        {prod.price && <div className="mt-1 text-sm text-lime-700 font-medium">{prod.price}</div>}
                        {prod.link && (
                          <a
                            href={prod.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-2 inline-block text-xs px-3 py-1 rounded bg-lime-500 text-white hover:bg-lime-600"
                          >
                            View
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {blog.tags && blog.tags.length > 0 && (
              <div className="px-8 py-6 border-t border-gray-200">
                <div className="flex items-center mb-4">
                  <Tag size={18} className="text-lime-600 mr-2" />
                  <span className="text-gray-700 font-medium">Tags</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {blog.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-lime-50 text-lime-800 border border-lime-200 hover:bg-lime-100 transition-colors"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}


            {/* Author Info */}
            <div className="sm:px-8  sm:py-6 px-2 pt-4 border-t border-gray-200 bg-white">
              <div className="flex items-center">
                <div className="flex-shrink-0">
               <div className="w-16 h-16 bg-lime-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-xl">
                        {blog.author?.username?.charAt(0).toUpperCase() || "A"}
                      </span>
                    </div>
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
                <div className="px-8 pt-6">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Share2 size={18} className="text-lime-600" />
                <span>Share:</span>
                <a className="hover:text-lime-600" href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(blog.title)}`} target="_blank" rel="noopener noreferrer">X</a>
                <span className="text-gray-300">|</span>
                <a className="hover:text-lime-600" href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`} target="_blank" rel="noopener noreferrer">Facebook</a>
                <span className="text-gray-300">|</span>
                <a className="hover:text-lime-600" href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(window.location.href)}&title=${encodeURIComponent(blog.title)}`} target="_blank" rel="noopener noreferrer">LinkedIn</a>
              </div>
            </div>
            </div>
            
          </article>

          {/* Sidebar */}
          <aside className="lg:sticky lg:top-24 h-max space-y-6">
            {/* Sidebar Ad at top */}
            <div className="bg-white rounded-lg">
              <div className="px-5 pt-4">
              
              </div>
              <div className="p-5">
                <div className="w-full h-40 md:h-56 rounded bg-white border border-dashed border-gray-300 flex items-center justify-center text-gray-500 text-sm">
                  Ad 300x250
                </div>
              </div>
            </div>
            {/* Table of Contents */}
            {toc.length > 0 && (
              <div className="bg-white rounded-lg p-5">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Table of contents</h3>
                <nav className="text-sm text-gray-700">
                  <ul className="space-y-2">
                    {toc.map((item) => (
                      <li key={item.id} className={item.level === "h3" ? "ml-4" : ""}>
                        <a
                          href={`#${item.id}`}
                          onClick={(e) => {
                            e.preventDefault()
                            const el = document.getElementById(item.id)
                            if (el) el.scrollIntoView({ behavior: "smooth", block: "start" })
                          }}
                          className="inline-flex items-start gap-2 hover:text-lime-600"
                        >
                          <ChevronRight size={16} className="mt-0.5 text-gray-400" />
                          <span>{item.text}</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>
            )}

            {/* Author card small */}
            <div className="bg-white rounded-lg sm:p-5">
              <div className="flex items-center gap-3">
                {blog.author?.avatar && !String(blog.author.avatar).includes("via.placeholder.com") ? (
                  <img src={blog.author.avatar} alt={blog.author?.username} className="w-12 h-12 rounded-full object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-lime-500 text-white flex items-center justify-center font-semibold">
                    {blog.author?.username?.charAt(0).toUpperCase() || "A"}
                  </div>
                )}
                <div>
                  <div className="font-semibold text-gray-900">{blog.author?.username || "Anonymous"}</div>
                  <div className="text-xs text-gray-500">{formatDate(blog.publishedAt || blog.createdAt)}</div>
                </div>
              </div>
            </div>

            {/* Recent posts */}
            {recent.length > 0 && (
              <div className="bg-white rounded-lg  sm:p-5">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Recent posts</h3>
                <ul className="space-y-3">
                  {recent.map((p) => (
                    <li key={p._id}>
                      <Link to={`/blog/${p.slug}`} className="flex gap-3 group">
                        <div className="w-16 h-12 rounded overflow-hidden bg-gray-100 flex-shrink-0">
                          {p.featuredImage?.url ? (
                            <img src={p.featuredImage.url} alt={p.title} className="w-full h-full object-cover" />
                          ) : null}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900 group-hover:text-lime-600 line-clamp-2">{p.title}</div>
                          <div className="text-xs text-gray-500">{formatDate(p.publishedAt || p.createdAt)}</div>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Ad/Promo placeholder */}
            <div className="rounded-lg bg-gray-100 text-gray-600 p-6 text-center">
              <div className="text-sm">Advertisement</div>
              <div className="mt-2 h-28 rounded bg-white border border-dashed border-gray-300" />
            </div>
          </aside>
        </div>


           {/* Comments Section */}
        <div className="mt-12 bg-white rounded-lg p-2 sm:p-8">
          <Comments blogId={blog._id} blogTitle={blog.title} />
        </div>

        {/* Related Posts */}
        <RelatedPosts blogId={blog._id} />

     
      </div>
    </div>
  )
}

export default BlogDetail
