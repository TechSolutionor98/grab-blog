"use client"

import { useState, useEffect } from "react"
import { useLocation } from "react-router-dom"
import { ChevronDown, Filter } from "lucide-react"


const CategoryFilter = ({ selectedCategory, onCategoryChange }) => {
  const [categories, setCategories] = useState([])
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()

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

  const handleCategoryClick = (categoryId) => {
    onCategoryChange(categoryId)
    setIsOpen(false)
  }

  return (
    <div className="w-full">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block bg-white rounded-lg shadow-md p-6">
        <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4">
          <Filter size={18} />
          Categories
        </h3>

        <div className="space-y-2">
          <button
            className={`w-full flex items-center gap-3 px-4 py-2 rounded-md text-left transition-colors ${
              !selectedCategory 
                ? "bg-blue-50 text-blue-700 border-l-4 border-blue-500" 
                : "text-gray-700 hover:bg-gray-50"
            }`}
            onClick={() => onCategoryChange(null)}
          >
            <span className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"></span>
            All Categories
          </button>

          {categories.map((category) => (
            <button
              key={category._id}
              className={`w-full flex items-center gap-3 px-4 py-2 rounded-md text-left transition-colors ${
                selectedCategory === category._id
                  ? "bg-blue-50 text-blue-700 border-l-4 border-blue-500"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
              onClick={() => handleCategoryClick(category._id)}
            >
              <span 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: category.color }}
              ></span>
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile Dropdown */}
      <div className="lg:hidden relative">
        <button 
          className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-white rounded-lg shadow-md border text-left"
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-gray-500" />
            <span className="font-medium text-gray-900">
              {selectedCategory
                ? categories.find((c) => c._id === selectedCategory)?.name || "Category"
                : "All Categories"}
            </span>
          </div>
          <ChevronDown 
            size={18} 
            className={`text-gray-500 transition-transform ${isOpen ? "rotate-180" : ""}`} 
          />
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border z-10 max-h-64 overflow-y-auto">
            <button
              className={`w-full flex items-center gap-3 px-4 py-3 text-left border-b transition-colors ${
                !selectedCategory ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-50"
              }`}
              onClick={() => handleCategoryClick(null)}
            >
              All Categories
            </button>

            {categories.map((category) => (
              <button
                key={category._id}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left border-b last:border-b-0 transition-colors ${
                  selectedCategory === category._id
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
                onClick={() => handleCategoryClick(category._id)}
              >
                <span 
                  className="w-3 h-3 rounded-full flex-shrink-0" 
                  style={{ backgroundColor: category.color }}
                ></span>
                {category.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default CategoryFilter
