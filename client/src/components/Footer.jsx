import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const [editorsPick, setEditorsPick] = useState([]);
  const [randomPosts, setRandomPosts] = useState([]);
  const [popularCategories, setPopularCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFooterData = async () => {
      try {
        setLoading(true);
        
        // Fetch all data concurrently
        const [editorsResponse, randomResponse, categoriesResponse] = await Promise.all([
          fetch('/api/blogs/editors-pick'),
          fetch('/api/blogs/random'),
          fetch('/api/categories/popular')
        ]);

        const editorsData = await editorsResponse.json();
        const randomData = await randomResponse.json();
        const categoriesData = await categoriesResponse.json();

        setEditorsPick(editorsData.data || []);
        setRandomPosts(randomData.data || []);
        setPopularCategories(categoriesData.data || []);
      } catch (error) {
        console.error('Error fetching footer data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFooterData();
  }, []);

  if (loading) {
    return (
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-6 bg-gray-700 rounded w-1/3 mb-4"></div>
                <div className="space-y-4">
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="flex gap-4">
                      <div className="w-16 h-16 bg-gray-700 rounded"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Editor's Pick Section */}
          <div>
            <div className="mb-6">
              <h3 className="text-lg font-bold mb-2">EDITOR'S PICK</h3>
              <div className="w-12 h-1 bg-pink-500"></div>
            </div>
            <div className="space-y-4">
              {editorsPick.slice(0, 3).map((post) => (
                <Link 
                  key={post._id} 
                  to={`/blog/${post.slug}`}
                  className="flex gap-4 group hover:opacity-80 transition-opacity"
                >
                  <div className="w-16 h-16 flex-shrink-0">
                    <img 
                      src={post.featuredImage || '/api/placeholder/64/64'} 
                      alt={post.title}
                      className="w-full h-full object-cover rounded"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium leading-tight group-hover:text-pink-400 transition-colors line-clamp-2">
                      {post.title}
                    </h4>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Random Posts Section */}
          <div>
            <div className="mb-6">
              <h3 className="text-lg font-bold mb-2">RANDOM POSTS</h3>
              <div className="w-12 h-1 bg-pink-500"></div>
            </div>
            <div className="space-y-4">
              {randomPosts.slice(0, 3).map((post) => (
                <Link 
                  key={post._id} 
                  to={`/blog/${post.slug}`}
                  className="flex gap-4 group hover:opacity-80 transition-opacity"
                >
                  <div className="w-16 h-16 flex-shrink-0">
                    <img 
                      src={post.featuredImage || '/api/placeholder/64/64'} 
                      alt={post.title}
                      className="w-full h-full object-cover rounded"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium leading-tight group-hover:text-pink-400 transition-colors line-clamp-2">
                      {post.title}
                    </h4>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Popular Categories Section */}
          <div>
            <div className="mb-6">
              <h3 className="text-lg font-bold mb-2">POPULAR CATEGORIES</h3>
              <div className="w-12 h-1 bg-orange-500"></div>
            </div>
            <div className="space-y-3">
              {popularCategories.map((category) => (
                <Link 
                  key={category._id} 
                  to={`/category/${category.slug}`}
                  className="flex items-center justify-between group hover:bg-gray-800 p-2 rounded transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">▶</span>
                    <span className="text-sm group-hover:text-orange-400 transition-colors">
                      {category.name}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded">
                    ({category.postCount || 0})
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Copyright Section */}
        <div className="border-t border-gray-700 mt-12 pt-8 text-center">
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} Your Blog Name. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;