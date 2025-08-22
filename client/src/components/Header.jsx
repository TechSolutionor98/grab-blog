"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Search, Menu, X, ShoppingBag } from "lucide-react"

const Header = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [categories, setCategories] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories")
      const data = await response.json()
      setCategories(data)
    } catch (error) {
      console.error("Error fetching categories:", error)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery("")
    }
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-lime-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">G</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">GrabaZz</h1>
          </Link>

          {/* Search Bar - Center */}
          <form onSubmit={handleSearch} className="flex-1 max-w-lg mx-8">
            <div className="relative">
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 pl-4 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-transparent"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-lime-500 text-white p-2 rounded-md hover:bg-lime-600 transition-colors"
              >
                <Search size={16} />
              </button>
            </div>
          </form>

          {/* Shop Button */}
          <Link
            to="/shop"
            className="hidden md:flex items-center space-x-2 px-6 py-2 border-2 border-black text-black hover:bg-black hover:text-white transition-colors font-medium"
          >
            <ShoppingBag size={18} />
            <span>Shop Now</span>
          </Link>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 text-gray-600 hover:text-gray-900"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        <div className="bg-lime-500 -mx-4 sm:-mx-6 lg:-mx-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="hidden md:flex items-center space-x-8 py-3 overflow-x-auto">
              <Link to="/" className="text-white hover:text-lime-100 whitespace-nowrap font-medium">
                All in one
              </Link>
              {categories.map((category) => (
                <Link
                  key={category._id}
                  to={`/category/${category._id}`}
                  className="text-white hover:text-lime-100 whitespace-nowrap font-medium"
                >
                  {category.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden bg-white border-t border-gray-200 py-4">
            <div className="space-y-2">
              <Link
                to="/"
                className="block px-4 py-2 text-gray-700 hover:bg-gray-50"
                onClick={() => setIsMenuOpen(false)}
              >
                All in one
              </Link>
              <div className="px-4 py-2">
                <h3 className="font-medium text-gray-900 mb-2">Categories</h3>
                <div className="space-y-1 ml-4">
                  {categories.map((category) => (
                    <Link
                      key={category._id}
                      to={`/category/${category._id}`}
                      className="block py-1 text-gray-600 hover:text-lime-500"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>
              </div>
              <Link
                to="/shop"
                className="block mx-4 mt-4 px-4 py-2 bg-lime-500 text-white text-center rounded-lg hover:bg-lime-600"
                onClick={() => setIsMenuOpen(false)}
              >
                Shop Now
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}

export default Header
