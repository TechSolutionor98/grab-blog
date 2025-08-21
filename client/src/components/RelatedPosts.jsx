"use client"

import { useState, useEffect } from "react"
import BlogCard from "./BlogCard"


const RelatedPosts = ({ blogId }) => {
  const [relatedPosts, setRelatedPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRelatedPosts = async () => {
      try {
        const response = await fetch(`/api/blogs/${blogId}/related`)
        if (response.ok) {
          const data = await response.json()
          setRelatedPosts(data)
        }
      } catch (error) {
        console.error("Error fetching related posts:", error)
      } finally {
        setLoading(false)
      }
    }

    if (blogId) {
      fetchRelatedPosts()
    }
  }, [blogId])

  if (loading) {
    return (
      <div className="mt-12">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Related Posts</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
              <div className="aspect-video bg-gray-200"></div>
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (relatedPosts.length === 0) {
    return null
  }

  return (
    <div className="mt-12">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">Related Posts</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {relatedPosts.map((post) => (
          <BlogCard key={post._id} blog={post} />
        ))}
      </div>
    </div>
  )
}

export default RelatedPosts
