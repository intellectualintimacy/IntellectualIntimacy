import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Moon, Sun } from 'lucide-react'
import UserMenu from '../UserMenu';

export default function Navigation({ darkMode, setDarkMode }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setIsMenuOpen(false)
  }, [location.pathname])

  // Lock body scroll when menu open
  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : 'unset'
    return () => (document.body.style.overflow = 'unset')
  }, [isMenuOpen])

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Events', path: '/events' },
    { name: 'Support', path: '/support' },
    { name: 'Contact', path: '/contact' }
  ]

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed w-full top-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'glass-light dark:glass-dark soft-shadow py-3 md:py-4'
          : 'bg-transparent py-4 md:py-6'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-16 relative flex items-center justify-between">
        {/* Logo */}
        <Link
          to="/"
          className="elegant-text block select-none"
          style={{
            fontFamily: 'Crimson Pro, serif',
            fontSize: 'clamp(1.25rem, 4vw, 1.75rem)'
          }}
        >
          Intellectual Intimacy
        </Link>

        {/* Desktop menu */}
        <div className="hidden lg:flex items-center space-x-6 xl:space-x-8">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`nav-elegant text-sm xl:text-base ${
                location.pathname === item.path
                  ? 'text-stone-900 dark:text-stone-100 font-medium'
                  : ''
              }`}
            >
              {item.name}
            </Link>
          ))}

          {/* Dark mode toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="relative z-10 ml-1 p-2 rounded-full hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
            aria-label="Toggle dark mode"
          >
            {darkMode ? (
              <Sun size={18} className="text-amber-400" />
            ) : (
              <Moon size={18} className="text-stone-600" />
            )}
          </button>

          {/* Contact Button */}
          <UserMenu />
        </div>

        {/* Mobile Controls */}
        <div className="flex items-center gap-3 lg:hidden z-[60]">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-full hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors relative z-[61]"
            aria-label="Toggle dark mode"
          >
            {darkMode ? (
              <Sun size={20} className="text-amber-400" />
            ) : (
              <Moon size={20} className="text-stone-600 dark:text-stone-400" />
            )}
          </button>

          <button
            className="p-2 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-lg transition-colors relative z-[61]"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm lg:hidden z-[50]"
              onClick={() => setIsMenuOpen(false)}
            />

            {/* Menu Drawer */}
            <motion.div
              initial={{ opacity: 0, x: '100%' }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-[280px] sm:w-[320px] bg-white dark:bg-stone-900 shadow-2xl lg:hidden z-[60] overflow-y-auto pt-[90px]"
            >
              <div className="px-6 pb-10 space-y-1">
                {navItems.map((item, index) => (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link
                      to={item.path}
                      className={`block py-3 px-4 rounded-lg text-base font-light transition-all ${
                        location.pathname === item.path
                          ? 'bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-medium'
                          : 'text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800'
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  </motion.div>
                ))}

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: navItems.length * 0.1 }}
                  className="pt-6"
                >
                  <Link
                    to="/contact"
                    className="btn-elegant w-full text-center block py-3"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Connect
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}
