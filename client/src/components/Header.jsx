"use client"

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Search, Menu, X, ShoppingBag } from "lucide-react"

const Header = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [categories, setCategories] = useState([])
  const [visibleCount, setVisibleCount] = useState(null) // number of categories (excluding "All in one") visible in the centered row
  const [isMoreOpen, setIsMoreOpen] = useState(false)
  const [showLogo, setShowLogo] = useState(true)

  const navListRef = useRef(null)
  const allInOneRef = useRef(null)
  const moreBtnRef = useRef(null)
  const itemRefs = useRef([]) // per-category refs for measuring widths
  const navigate = useNavigate()

  useEffect(() => {
    fetchCategories()
  }, [])

  // Ensure refs array length matches categories
  useEffect(() => {
    itemRefs.current = categories.map((_, i) => itemRefs.current[i] || null)
  }, [categories])

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories")
      const data = await response.json()
      setCategories(data)
    } catch (error) {
      console.error("Error fetching categories:", error)
    }
  }

  // Calculate how many categories fit; show More only when needed
  const recalcLayout = () => {
    const container = navListRef.current
    const allInOne = allInOneRef.current
    const moreBtn = moreBtnRef.current
    if (!container || !allInOne) return

    const containerWidth = container.clientWidth
    if (containerWidth === 0) return

    const styles = getComputedStyle(container)
    // Tailwind gap-x-8 => 2rem (32px) on default; read actual just in case
    const gap = parseFloat(styles.columnGap || styles.gap || 0) || 0

    const allInOneWidth = allInOne.offsetWidth
    const catWidths = itemRefs.current.map((el) => (el ? el.offsetWidth : 0))

    // Reserve space for More button if needed; measure if present, else fallback
    const moreWidth = moreBtn ? moreBtn.offsetWidth : 56 // approx width fallback

    // First try to fit everything without More: All + (gap+eachCat)
    let total = allInOneWidth
    for (let i = 0; i < catWidths.length; i++) {
      total += gap + catWidths[i]
    }
    if (total <= containerWidth) {
      setVisibleCount(catWidths.length)
      return
    }

    // Need More button; place More on the left, then All in one, then categories
    let width = moreWidth + gap + allInOneWidth
    let count = 0
    for (let i = 0; i < catWidths.length; i++) {
      const nextWidth = width + gap + catWidths[i]
      if (nextWidth <= containerWidth) {
        width += gap + catWidths[i]
        count++
      } else {
        break
      }
    }
    setVisibleCount(count)
  }
  // Recalculate on load, resize, and when categories or query changes
  useLayoutEffect(() => {
    const observer = new ResizeObserver(() => {
      recalcLayout()
    })
    if (navListRef.current) observer.observe(navListRef.current)
    // Also listen to window resize for safety
    const onResize = () => recalcLayout()
    window.addEventListener("resize", onResize)
    // Initial calc after paint
    requestAnimationFrame(recalcLayout)
    return () => {
      observer.disconnect()
      window.removeEventListener("resize", onResize)
    }
  }, [categories])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery("")
    }
  }

  const overflowExists = useMemo(() => {
    if (visibleCount === null) return false
    return visibleCount < categories.length
  }, [visibleCount, categories.length])

  // Close More when clicking outside
  useEffect(() => {
    if (!isMoreOpen) return
    const onDocClick = (e) => {
      const btn = moreBtnRef.current
      const list = navListRef.current
      if (!btn || !list) return
      if (!btn.contains(e.target) && !list.contains(e.target)) {
        setIsMoreOpen(false)
      }
    }
    document.addEventListener("mousedown", onDocClick)
    return () => document.removeEventListener("mousedown", onDocClick)
  }, [isMoreOpen])

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 pt-3 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto ">
        <div className="flex items-center justify-between my-3">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
           
            {showLogo ? (
              <img
                src="/admin-logo.svg"
                alt="GrabaZz logo"
                className="h-14 w-auto object-contain"
                onError={() => setShowLogo(false)}
              />
            ) : (
              <h1 className="text-xl font-bold text-gray-900">GrabaZz</h1>
            )}
          </Link>

          {/* Search Bar - Center */}
          <form onSubmit={handleSearch} className="flex-1 max-w-lg mx-8">
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-12 px-4 border border-gray-300  focus:outline-none focus:ring-1 focus:ring-lime-500 focus:border-lime-500"
              />
              <button
                type="submit"
                aria-label="Search"
                className="h-12 w-14 bg-lime-500 text-white  flex items-center justify-center hover:bg-lime-600 transition-colors"
              >
                <Search size={16} />
              </button>
            </div>
          </form>

          {/* Shop Button */}
          <Link
            to="/shop"
            className="hidden md:flex items-center space-x-2 px-6 py-2 border-2 border-lime-300 text-black hover:bg-lime-500 hover:text-white transition-colors font-medium"
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

        <div className="bg-lime-500 py-2 -mx-4 sm:-mx-6 lg:-mx-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Desktop categories: centered; show More only when needed */}
            <nav className="hidden md:flex py-1">
              <ul
                ref={navListRef}
                className="flex w-full items-center justify-center gap-12 whitespace-nowrap overflow-visible relative"
              >
                {/* More dropdown (only render when overflow) - now on the left */}
                {overflowExists && (
                  <li className="relative">
                    <button
                      ref={moreBtnRef}
                      type="button"
                      onClick={() => setIsMoreOpen((v) => !v)}
                      className="inline-flex items-center font-medium text-white hover:text-lime-100 transition-colors px-0 py-0"
                      aria-haspopup="menu"
                      aria-expanded={isMoreOpen}
                    >
                      <span>More</span>
                    </button>
                    {isMoreOpen && (
                      <div className="absolute left-0 top-full mt-2 min-w-44 rounded-md bg-white py-2 shadow-lg ring-1 ring-black/10 z-20">
                        {categories.slice(visibleCount ?? 0).map((category) => (
                          <Link
                            key={category._id}
                            to={`/category/${category._id}`}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            onClick={() => setIsMoreOpen(false)}
                          >
                            {category.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </li>
                )}

                {/* All in one always visible */}
                <li ref={allInOneRef}>
                  <Link to="/" className="text-white hover:text-lime-100 font-medium">
                    All in one
                  </Link>
                </li>

                {/* Visible categories */}
                {categories.slice(0, visibleCount ?? categories.length).map((category, idx) => (
                  <li key={category._id} ref={(el) => (itemRefs.current[idx] = el)}>
                    <Link
                      to={`/category/${category._id}`}
                      className="text-white hover:text-lime-100 font-medium"
                    >
                      {category.name}
                    </Link>
                  </li>
                ))}

                {/* Offscreen measuring container: render all items for accurate widths */}
                <li className="absolute -left-[9999px] top-auto" aria-hidden="true">
                  {categories.map((category, idx) => (
                    <span
                      key={`measure-${category._id}`}
                      ref={(el) => (itemRefs.current[idx] = el)}
                      className="inline-block font-medium"
                    >
                      {category.name}
                    </span>
                  ))}
                </li>

                
              </ul>
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
