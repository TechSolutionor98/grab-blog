"use client"

import { useState, useEffect } from "react"


const SearchBar = ({ onSearch, placeholder = "Search blogs..." }) => {
  const [searchTerm, setSearchTerm] = useState("")
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      onSearch(searchTerm)
    }, 300)

    return () => clearTimeout(delayedSearch)
  }, [searchTerm, onSearch])

  const handleSubmit = (e) => {
    e.preventDefault()
    onSearch(searchTerm)
  }

  return (
    <div className={`relative transition-all duration-300 ${isExpanded ? "scale-105 shadow-lg" : "shadow"}`}>
      <form onSubmit={handleSubmit} className="w-full">
        <div className="relative flex items-center bg-white border border-gray-200 rounded-full px-2 py-1 shadow-md focus-within:ring-2 focus-within:ring-blue-500">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setIsExpanded(true)}
            onBlur={() => setIsExpanded(false)}
            placeholder={placeholder}
            className="flex-1 bg-transparent outline-none px-4 py-2 text-gray-700 placeholder-gray-400 rounded-full"
          />
          <button 
            type="submit" 
            className="ml-2 px-4 py-2 rounded-full bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
          </button>
        </div>
      </form>
    </div>
  )
}

export default SearchBar
