import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Moon, Sun } from 'lucide-react'
import UserMenu from '../UserMenu'
import useAdmin from '../../hooks/useAdmin'

export default function Navigation({ darkMode, setDarkMode }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()
  const { isAdmin } = useAdmin()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setIsMenuOpen(false)
  }, [location.pathname])

  const navItems = [
    { name: 'HOME', path: '/' },
    { name: 'ABOUT', path: '/about' },
    { name: 'EVENTS', path: '/events' },
    { name: 'SUPPORT', path: '/support' },
    { name: 'CONTACT', path: '/contact' }
  ]

  // Dynamic color classes based on scroll state
  const textColor = scrolled ? 'text-ink' : 'text-ivory'
  const logoBorder = scrolled ? 'border-ink/10' : 'border-ivory/20'
  const iconColor = scrolled ? 'text-ink/50' : 'text-ivory/60'

  return (
    <nav
      className={`fixed w-full top-0 z-50 transition-all duration-700 ${
        scrolled
          ? 'bg-ivory shadow-sm py-4'
          : 'bg-transparent py-8'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12 flex items-center justify-between">
        
        {/* Logo Section */}
        <Link
          to="/"
          className={`flex flex-col items-center group transition-colors duration-500 ${textColor}`}
        >
          <span className="font-serif text-2xl leading-none tracking-tighter">II</span>
          <span className={`text-[9px] md:text-[10px] tracking-[0.3em] font-sans mt-1 uppercase border-t pt-1 transition-colors duration-500 ${logoBorder}`}>
            Intellectual Intimacy
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-10">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`group relative text-[11px] tracking-[0.2em] font-sans transition-colors duration-500 ${
                location.pathname === item.path ? textColor : `${textColor}/70 hover:${textColor}`
              }`}
            >
              {item.name}
              {/* Animated underline */}
              <span
                className={`absolute -bottom-2 left-0 h-[1px] bg-gold transition-all duration-500 ${
                  location.pathname === item.path ? 'w-full' : 'w-0 group-hover:w-full'
                }`}
              />
            </Link>
          ))}

          {isAdmin && (
            <Link
              to="/admin/events"
              className="text-[10px] tracking-[0.2em] text-gold border border-gold/30 px-3 py-1 hover:bg-gold hover:text-white transition-all"
            >
              ADMIN
            </Link>
          )}

          {/* Controls */}
          <div className={`flex items-center gap-6 border-l ml-4 pl-10 transition-colors duration-500 ${logoBorder}`}>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`transition-colors duration-500 hover:text-gold ${iconColor}`}
            >
              {darkMode ? <Sun size={16} strokeWidth={1.5} /> : <Moon size={16} strokeWidth={1.5} />}
            </button>
            
            {/* We wrap UserMenu to ensure its trigger matches our dynamic theme if needed */}
            <div className={textColor}>
              <UserMenu />
            </div>
          </div>
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className={`lg:hidden p-2 transition-colors duration-500 ${textColor}`}
        >
          {isMenuOpen ? <X size={26} strokeWidth={1.2} /> : <Menu size={26} strokeWidth={1.2} />}
        </button>
      </div>

      {/* Mobile Menu Overly (Stays Ivory for readability) */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-ivory z-[100] flex flex-col p-8"
          >
            <div className="flex justify-between items-center">
               <div className="flex flex-col text-ink">
                  <span className="font-serif text-xl">II</span>
               </div>
               <button onClick={() => setIsMenuOpen(false)} className="p-2 text-ink">
                <X size={30} strokeWidth={1} />
              </button>
            </div>
            
            <div className="flex flex-col flex-grow justify-center space-y-8">
              {navItems.map((item, index) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    to={item.path}
                    className="text-5xl font-serif text-ink hover:text-gold transition-colors italic leading-none"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name.toLowerCase()}
                  </Link>
                </motion.div>
              ))}
            </div>

            <div className="border-t border-stone-200 pt-8 flex items-center justify-between text-ink">
              <UserMenu mobile onNavigate={() => setIsMenuOpen(false)} />
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="uppercase text-[10px] tracking-widest opacity-60"
              >
                {darkMode ? 'Light UI' : 'Dark UI'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}