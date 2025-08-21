import { Link } from "react-router-dom"
import { Calendar, User, Eye } from "lucide-react"


const BlogCard = ({ blog }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const truncateText = (text, maxLength) => {
    if (text.length <= maxLength) return text
    return text.substr(0, maxLength) + "..."
  }

  return (
    <article className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
      <Link to={`/blog/${blog.slug}`} className="block">
        {/* Featured Image */}
        <div className="relative aspect-video overflow-hidden">
          {blog.featuredImage?.url ? (
            <img 
              src={blog.featuredImage.url || "/placeholder.svg"} 
              alt={blog.title} 
              loading="lazy" 
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-500 text-sm">No Image</span>
            </div>
          )}

          {/* Category Badge */}
          <div 
            className="absolute top-3 left-3 px-3 py-1 rounded-full text-white text-xs font-medium"
            style={{ backgroundColor: blog.category?.color || "#2563eb" }}
          >
            {blog.category?.name}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 hover:text-blue-600 transition-colors">
            {truncateText(blog.title, 80)}
          </h3>

          <p className="text-gray-600 text-sm mb-4 line-clamp-3">
            {blog.excerpt ? truncateText(blog.excerpt, 120) : "No excerpt available..."}
          </p>

          {/* Meta Information */}
          <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
            <div className="flex items-center gap-1">
              <Calendar size={14} />
              <span>{formatDate(blog.publishedAt || blog.createdAt)}</span>
            </div>

            <div className="flex items-center gap-1">
              <User size={14} />
              <span>{blog.author?.username || "Anonymous"}</span>
            </div>

            <div className="flex items-center gap-1">
              <Eye size={14} />
              <span>{blog.views || 0}</span>
            </div>
          </div>

          {/* Tags */}
          {blog.tags && blog.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {blog.tags.slice(0, 3).map((tag, index) => (
                <span 
                  key={index} 
                  className="bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-xs font-medium hover:bg-gray-200 transition-colors"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </Link>
    </article>
  )
}

export default BlogCard
