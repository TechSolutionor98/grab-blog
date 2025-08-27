"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Search, Menu, X, ShoppingBag, ChevronDown } from "lucide-react"

const Header = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [categories, setCategories] = useState([])
  const [isMoreOpen, setIsMoreOpen] = useState(false)
  const moreRef = useRef(null)
  const navContainerRef = useRef(null)
  const hiddenMeasureRef = useRef(null)
  const moreMeasureRef = useRef(null)
  const itemMeasureRefs = useRef({})
  const [visibleCount, setVisibleCount] = useState(null) // how many links fit (including "All in one")
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

  // Close the "More" dropdown on outside click
  useEffect(() => {
    function onClickOutside(e) {
      if (moreRef.current && !moreRef.current.contains(e.target)) {
        setIsMoreOpen(false)
      }
    }
    document.addEventListener("mousedown", onClickOutside)
    return () => document.removeEventListener("mousedown", onClickOutside)
  }, [])

  // Measure available width and compute how many items fit; show More only if needed
  useEffect(() => {
    const handle = () => {
      if (!navContainerRef.current) return
      // Build the full list: All in one + categories
      const ids = ["all", ...categories.map((c) => c._id)]

      // Container available width
      const containerWidth = navContainerRef.current.clientWidth
      if (containerWidth === 0) return

      // Get gap between items from computed style
      const gapStr = getComputedStyle(navContainerRef.current).gap || "0px"
      const gap = Number.parseFloat(gapStr)

      // Measure More button width (for when overflow occurs)
      const moreWidth = moreMeasureRef.current ? moreMeasureRef.current.offsetWidth : 80

      // Sum widths of all items
      const widths = ids.map((id) => itemMeasureRefs.current[id]?.offsetWidth || 0)
      const totalGaps = gap * Math.max(ids.length - 1, 0)
      const totalWidth = widths.reduce((a, b) => a + b, 0) + totalGaps

      // If everything fits, show all and hide More
      if (totalWidth <= containerWidth) {
        setVisibleCount(ids.length)
        return
      }

      // Otherwise, reserve space for More (+ gap between More and first item if present)
      const reserved = moreWidth + (ids.length > 0 ? gap : 0)
      const maxWidth = containerWidth - reserved

      let running = 0
      let count = 0
      for (let i = 0; i < ids.length; i++) {
        const w = widths[i]
        // add gap except before first item
        const addGap = i === 0 ? 0 : gap
        if (running + addGap + w <= maxWidth) {
          running += addGap + w
          count += 1
        } else {
          break
        }
      }
      setVisibleCount(Math.max(1, count)) // ensure at least the first link remains
    }

    // measure after categories update and on resize
    const onResize = () => window.requestAnimationFrame(handle)
    handle()
    window.addEventListener("resize", onResize)
    return () => window.removeEventListener("resize", onResize)
  }, [categories])

  const baseItems = useMemo(() => [{ _id: "all", name: "All in one", isAll: true }, ...categories], [categories])
  const computedVisibleCount = visibleCount ?? baseItems.length
  const visibleItems = baseItems.slice(0, computedVisibleCount)
  const overflowItems = baseItems.slice(computedVisibleCount).filter((x) => !x.isAll)

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
          <form onSubmit={handleSearch} className="flex-1 max-w-3xl mx-8">
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
            <nav
              ref={navContainerRef}
              className="hidden md:flex items-center justify-center py-3 gap-6 relative"
            >
              {/* Conditionally visible More button (participates in centering) */}
              {overflowItems.length > 0 && (
                <div className="relative" ref={moreRef}>
                  <button
                    type="button"
                    onClick={() => setIsMoreOpen((p) => !p)}
                    className="flex items-center gap-1 text-white font-medium hover:text-lime-100"
                  >
                    More <ChevronDown size={16} />
                  </button>
                  {isMoreOpen && (
                    <div className="absolute left-0 mt-2 w-56 rounded-md bg-white shadow-lg ring-1 ring-black/5 z-20">
                      <div className="py-2">
                        {overflowItems.map((category) => (
                          <Link
                            key={category._id}
                            to={`/category/${category._id}`}
                            className="block px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-lime-600"
                            onClick={() => setIsMoreOpen(false)}
                          >
                            {category.name}
                          </Link>
                        ))}
                        {overflowItems.length === 0 && (
                          <span className="block px-4 py-2 text-sm text-gray-400">No more categories</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Visible items, centered */}
              <div className="flex items-center gap-6 overflow-hidden">
                {visibleItems.map((item) => (
                  <Link
                    key={item._id}
                    to={item.isAll ? "/" : `/category/${item._id}`}
                    className="text-white hover:text-lime-100 whitespace-nowrap font-medium"
                  >
                    {item.name}
                  </Link>
                ))}
              </div>

              {/* Hidden measuring container: lets us read widths without affecting layout */}
              <div className="absolute opacity-0 pointer-events-none -z-10 top-0 left-0" ref={hiddenMeasureRef}>
                <button ref={moreMeasureRef} className="flex items-center gap-1 text-white font-medium">
                  More <ChevronDown size={16} />
                </button>
                <div className="flex items-center gap-6">
                  {[{ _id: "all", name: "All in one", isAll: true }, ...categories].map((item) => (
                    <span
                      key={`measure-${item._id}`}
                      ref={(el) => (itemMeasureRefs.current[item._id] = el)}
                      className="text-white whitespace-nowrap font-medium px-1"
                    >
                      {item.name}
                    </span>
                  ))}
                </div>
              </div>
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
