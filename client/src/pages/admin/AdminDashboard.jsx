"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { FileText, TrendingUp, FolderOpen, Eye, Plus, Calendar, Tag, Building2 } from "lucide-react"

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalBlogs: 0,
    publishedBlogs: 0,
    draftBlogs: 0,
    totalCategories: 0,
    totalTopics: 0,
    totalBrands: 0,
    totalViews: 0,
  })
  const [recentBlogs, setRecentBlogs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("adminToken")
      const headers = {
        Authorization: `Bearer ${token}`,
      }

      const [blogsResponse, categoriesResponse, topicsResponse, brandsResponse] = await Promise.all([
        fetch("/api/blogs/admin?limit=5", { headers }),
        fetch("/api/categories/admin", { headers }),
        fetch("/api/topics/admin", { headers }),
        fetch("/api/brands/admin", { headers }),
      ])

      if (blogsResponse.ok && categoriesResponse.ok) {
        const blogsData = await blogsResponse.json()
        const categoriesData = await categoriesResponse.json()
        const topicsData = topicsResponse.ok ? await topicsResponse.json() : []
        const brandsData = brandsResponse.ok ? await brandsResponse.json() : []

        // Calculate stats
        const totalViews = blogsData.blogs.reduce((sum, blog) => sum + (blog.views || 0), 0)
        const publishedBlogs = blogsData.blogs.filter((blog) => blog.status === "published").length
        const draftBlogs = blogsData.blogs.filter((blog) => blog.status === "draft").length

        setStats({
          totalBlogs: blogsData.pagination?.total || blogsData.blogs.length,
          publishedBlogs,
          draftBlogs,
          totalCategories: categoriesData.length,
          totalTopics: topicsData.length,
          totalBrands: brandsData.length,
          totalViews,
        })

        setRecentBlogs(blogsData.blogs.slice(0, 5))
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "published":
        return "#10b981"
      case "draft":
        return "#f59e0b"
      case "archived":
        return "#6b7280"
      default:
        return "#6b7280"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back! Here's what's happening with your blog.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-500">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FileText size={24} className="text-blue-500" />
              </div>
              <div className="ml-4">
                <h3 className="text-2xl font-bold text-gray-900">{stats.totalBlogs}</h3>
                <p className="text-sm text-gray-600">Total Blogs</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-500">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp size={24} className="text-green-500" />
              </div>
              <div className="ml-4">
                <h3 className="text-2xl font-bold text-gray-900">{stats.publishedBlogs}</h3>
                <p className="text-sm text-gray-600">Published</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-yellow-500">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FileText size={24} className="text-yellow-500" />
              </div>
              <div className="ml-4">
                <h3 className="text-2xl font-bold text-gray-900">{stats.draftBlogs}</h3>
                <p className="text-sm text-gray-600">Drafts</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-purple-500">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FolderOpen size={24} className="text-purple-500" />
              </div>
              <div className="ml-4">
                <h3 className="text-2xl font-bold text-gray-900">{stats.totalCategories}</h3>
                <p className="text-sm text-gray-600">Categories</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-emerald-500">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Tag size={24} className="text-emerald-500" />
              </div>
              <div className="ml-4">
                <h3 className="text-2xl font-bold text-gray-900">{stats.totalTopics}</h3>
                <p className="text-sm text-gray-600">Topics</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-amber-500">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Building2 size={24} className="text-amber-500" />
              </div>
              <div className="ml-4">
                <h3 className="text-2xl font-bold text-gray-900">{stats.totalBrands}</h3>
                <p className="text-sm text-gray-600">Brands</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-indigo-500">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Eye size={24} className="text-indigo-500" />
              </div>
              <div className="ml-4">
                <h3 className="text-2xl font-bold text-gray-900">{stats.totalViews.toLocaleString()}</h3>
                <p className="text-sm text-gray-600">Total Views</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <Link
              to="/admin/create-blog"
              className="flex items-center p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200 hover:border-blue-300"
            >
              <Plus size={24} className="text-blue-500 mr-4" />
              <span className="font-medium text-gray-900">Create New Blog</span>
            </Link>
            <Link
              to="/admin/categories"
              className="flex items-center p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200 hover:border-purple-300"
            >
              <FolderOpen size={24} className="text-purple-500 mr-4" />
              <span className="font-medium text-gray-900">Manage Categories</span>
            </Link>
            <Link
              to="/admin/topics"
              className="flex items-center p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200 hover:border-emerald-300"
            >
              <Tag size={24} className="text-emerald-500 mr-4" />
              <span className="font-medium text-gray-900">Manage Topics</span>
            </Link>
            <Link
              to="/admin/brands"
              className="flex items-center p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200 hover:border-amber-300"
            >
              <Building2 size={24} className="text-amber-500 mr-4" />
              <span className="font-medium text-gray-900">Manage Brands</span>
            </Link>
            <Link
              to="/admin/blogs"
              className="flex items-center p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200 hover:border-green-300"
            >
              <FileText size={24} className="text-green-500 mr-4" />
              <span className="font-medium text-gray-900">View All Blogs</span>
            </Link>
          </div>
        </div>

        {/* Recent Blogs */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Recent Blogs</h2>
            <Link to="/admin/blogs" className="text-blue-600 hover:text-blue-800 font-medium text-sm">
              View All
            </Link>
          </div>

          <div className="overflow-x-auto">
            {recentBlogs.length > 0 ? (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Views
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentBlogs.map((blog) => (
                    <tr key={blog._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900 line-clamp-2">{blog.title}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white"
                          style={{ backgroundColor: blog.category?.color || "#6b7280" }}
                        >
                          {blog.category?.name || "Uncategorized"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white capitalize"
                          style={{ backgroundColor: getStatusColor(blog.status) }}
                        >
                          {blog.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{blog.views || 0}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar size={14} className="mr-2" />
                          {formatDate(blog.createdAt)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-12">
                <FileText size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No blogs yet</h3>
                <p className="text-gray-500 mb-6">Create your first blog to get started</p>
                <Link
                  to="/admin/create-blog"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Blog
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
