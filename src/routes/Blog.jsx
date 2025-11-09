import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import BlogComments from '../components/blog/BlogComments'
import { 
  Calendar, Clock, User, Tag, Eye, Search, Filter,
  ChevronRight, BookOpen, TrendingUp, Heart, Share2,
  X, ArrowLeft, Loader2
} from 'lucide-react'
import { marked } from 'marked';
import { supabase } from '../../lib/supabase'

export default function Blog() {
  const [loading, setLoading] = useState(true)
  const [blogs, setBlogs] = useState([])
  const [filteredBlogs, setFilteredBlogs] = useState([])
  const [selectedBlog, setSelectedBlog] = useState(null)
  const [categories, setCategories] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [showShareMenu, setShowShareMenu] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)

  useEffect(() => {
    loadBlogs()
  }, [])

  useEffect(() => {
    filterBlogs()
  }, [blogs, searchQuery, selectedCategory])

  const loadBlogs = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .eq('is_published', true)
        .order('published_at', { ascending: false })

      if (error) throw error

      setBlogs(data || [])
      
      // Extract unique categories
      const uniqueCategories = ['All', ...new Set(data?.map(blog => blog.category) || [])]
      setCategories(uniqueCategories)
    } catch (error) {
      console.error('Error loading blogs:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterBlogs = () => {
    let filtered = blogs

    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(blog => blog.category === selectedCategory)
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(blog =>
        blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        blog.excerpt?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        blog.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    setFilteredBlogs(filtered)
  }

  const openBlog = async (blog) => {
    setSelectedBlog(blog)
    
    // Increment views
    try {
      await supabase
        .from('blogs')
        .update({ views_count: (blog.views_count || 0) + 1 })
        .eq('id', blog.id)
    } catch (error) {
      console.error('Error incrementing views:', error)
    }
  }

  const closeBlog = () => {
    setSelectedBlog(null)
    setShowShareMenu(false)
    setLinkCopied(false)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const parseMarkdown = (markdown) => {
    if (!markdown) return ''
    return marked.parse(markdown)
  }

  const shareOnPlatform = (platform) => {
    const url = window.location.href
    const title = selectedBlog?.title || ''
    const text = selectedBlog?.excerpt || selectedBlog?.title || ''

    const shareUrls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(title + ' ' + url)}`,
      email: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(text + '\n\n' + url)}`
    }

    if (platform === 'copy') {
      navigator.clipboard.writeText(url).then(() => {
        setLinkCopied(true)
        setTimeout(() => setLinkCopied(false), 2000)
      }).catch(() => {
        alert('Failed to copy link')
      })
      return
    }

    if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400')
      setShowShareMenu(false)
    }
  }

  const toggleShareMenu = () => {
    if (navigator.share && selectedBlog) {
      navigator.share({
        title: selectedBlog.title,
        text: selectedBlog.excerpt || selectedBlog.title,
        url: window.location.href
      }).catch((err) => {
        if (err.name !== 'AbortError') {
          setShowShareMenu(!showShareMenu)
        }
      })
    } else {
      setShowShareMenu(!showShareMenu)
    }
  }

  const featuredBlogs = blogs.filter(blog => blog.is_featured).slice(0, 3)

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-stone-50 to-white dark:from-stone-950 dark:to-stone-900 pt-32 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-stone-600 dark:text-stone-400" strokeWidth={1.5} />
      </main>
    )
  }

  // Single Blog View
  if (selectedBlog) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-stone-50 to-white dark:from-stone-950 dark:to-stone-900 pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-8 lg:px-16">
          {/* Back Button */}
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={closeBlog}
            className="flex items-center gap-2 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 mb-8 font-light transition-colors"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
            Back to all posts
          </motion.button>

          {/* Featured Image */}
          {selectedBlog.featured_image_url && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 overflow-hidden"
            >
              <img
                src={selectedBlog.featured_image_url}
                alt={selectedBlog.title}
                className="w-full h-96 object-cover"
              />
            </motion.div>
          )}

          {/* Blog Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-12"
          >
            <div className="flex items-center gap-3 mb-6 flex-wrap">
              <span className="px-3 py-1 bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-sm font-light">
                {selectedBlog.category}
              </span>
              <span className="flex items-center gap-2 text-stone-500 dark:text-stone-400 text-sm font-light">
                <Calendar className="w-4 h-4" strokeWidth={1.5} />
                {formatDate(selectedBlog.published_at)}
              </span>
              <span className="flex items-center gap-2 text-stone-500 dark:text-stone-400 text-sm font-light">
                <Clock className="w-4 h-4" strokeWidth={1.5} />
                {selectedBlog.read_time_minutes} min read
              </span>
              <span className="flex items-center gap-2 text-stone-500 dark:text-stone-400 text-sm font-light">
                <Eye className="w-4 h-4" strokeWidth={1.5} />
                {selectedBlog.views_count + 1} views
              </span>
            </div>

            <h1 className="text-5xl lg:text-6xl mb-6 font-light text-stone-900 dark:text-stone-100" style={{ fontFamily: 'Crimson Pro, serif' }}>
              {selectedBlog.title}
            </h1>

            {selectedBlog.excerpt && (
              <p className="text-xl text-stone-600 dark:text-stone-400 font-light leading-relaxed mb-8">
                {selectedBlog.excerpt}
              </p>
            )}

            {/* Author */}
            <div className="flex items-center gap-4 pb-8 border-b border-stone-200 dark:border-stone-800">
              {selectedBlog.author_avatar_url ? (
                <img
                  src={selectedBlog.author_avatar_url}
                  alt={selectedBlog.author_name}
                  className="w-12 h-12"
                />
              ) : (
                <div className="w-12 h-12 bg-stone-200 dark:bg-stone-700 flex items-center justify-center text-stone-700 dark:text-stone-300 font-light">
                  {selectedBlog.author_name?.[0] || 'A'}
                </div>
              )}
              <div>
                <p className="font-light text-stone-900 dark:text-stone-100">
                  {selectedBlog.author_name || 'Anonymous'}
                </p>
                <p className="text-sm text-stone-500 dark:text-stone-400 font-light">
                  Author
                </p>
              </div>
            </div>
          </motion.div>

          {/* Blog Content */}
          {/* Blog Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-12"
          >
            <div 
              dangerouslySetInnerHTML={{ __html: parseMarkdown(selectedBlog.content) }}
              className="blog-content text-stone-700 dark:text-stone-300 leading-relaxed font-light 
                [&>h1]:text-4xl [&>h1]:font-light [&>h1]:mt-12 [&>h1]:mb-6 [&>h1]:text-stone-900 [&>h1]:dark:text-stone-100
                [&>h2]:text-3xl [&>h2]:font-light [&>h2]:mt-10 [&>h2]:mb-5 [&>h2]:text-stone-900 [&>h2]:dark:text-stone-100
                [&>h3]:text-2xl [&>h3]:font-light [&>h3]:mt-8 [&>h3]:mb-4 [&>h3]:text-stone-900 [&>h3]:dark:text-stone-100
                [&>h4]:text-xl [&>h4]:font-light [&>h4]:mt-6 [&>h4]:mb-3 [&>h4]:text-stone-900 [&>h4]:dark:text-stone-100
                [&>p]:mb-6 [&>p]:leading-relaxed [&>p]:text-base
                [&>ul]:my-6 [&>ul]:list-disc [&>ul]:ml-6 [&>ul]:space-y-2
                [&>ol]:my-6 [&>ol]:list-decimal [&>ol]:ml-6 [&>ol]:space-y-2
                [&>li]:leading-relaxed
                [&>blockquote]:border-l-4 [&>blockquote]:border-stone-400 [&>blockquote]:dark:border-stone-600 
                [&>blockquote]:pl-6 [&>blockquote]:py-2 [&>blockquote]:my-6 [&>blockquote]:italic [&>blockquote]:text-stone-600 [&>blockquote]:dark:text-stone-400
                [&>code]:bg-stone-100 [&>code]:dark:bg-stone-800 [&>code]:px-2 [&>code]:py-1 [&>code]:rounded [&>code]:text-sm [&>code]:font-mono [&>code]:text-stone-800 [&>code]:dark:text-stone-200
                [&>pre]:bg-stone-100 [&>pre]:dark:bg-stone-800 [&>pre]:p-4 [&>pre]:rounded [&>pre]:overflow-x-auto [&>pre]:my-6
                [&>pre>code]:bg-transparent [&>pre>code]:p-0 [&>pre>code]:text-sm
                [&_a]:text-stone-900 [&_a]:dark:text-stone-100 [&_a]:underline [&_a]:hover:text-stone-600 [&_a]:dark:hover:text-stone-400 [&_a]:transition-colors
                [&>img]:my-8 [&>img]:rounded [&>img]:w-full
                [&_strong]:font-semibold [&_strong]:text-stone-900 [&_strong]:dark:text-stone-100
                [&_em]:italic [&_em]:text-stone-700 [&_em]:dark:text-stone-300"
              style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
            />
          </motion.div>

          {/* Tags */}
          {selectedBlog.tags && selectedBlog.tags.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-2 flex-wrap mb-12 pb-12 border-b border-stone-200 dark:border-stone-800"
            >
              <Tag className="w-4 h-4 text-stone-400" strokeWidth={1.5} />
              {selectedBlog.tags.map((tag, i) => (
                <span
                  key={i}
                  className="px-3 py-1 bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 text-sm font-light"
                >
                  {tag}
                </span>
              ))}
            </motion.div>
          )}

          {/* Share Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="relative"
          >
            <div className="flex items-center justify-between p-6 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
              <p className="font-light text-stone-900 dark:text-stone-100">
                Share this article
              </p>
              <button 
                onClick={toggleShareMenu}
                className="px-6 py-2 bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900 hover:bg-stone-800 dark:hover:bg-stone-200 transition-colors font-light flex items-center gap-2"
              >
                <Share2 className="w-4 h-4" strokeWidth={1.5} />
                Share
              </button>
            </div>

            {/* Share Menu Dropdown */}
            <AnimatePresence>
              {showShareMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 mt-2 w-64 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-lg z-50"
                >
                  <div className="p-2">
                    <button
                      onClick={() => shareOnPlatform('copy')}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors text-left"
                    >
                      {linkCopied ? (
                        <Check className="w-5 h-5 text-green-500" strokeWidth={1.5} />
                      ) : (
                        <Copy className="w-5 h-5 text-stone-600 dark:text-stone-400" strokeWidth={1.5} />
                      )}
                      <span className="text-stone-900 dark:text-stone-100 font-light">
                        {linkCopied ? 'Link Copied!' : 'Copy Link'}
                      </span>
                    </button>

                    <button
                      onClick={() => shareOnPlatform('twitter')}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors text-left"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                      </svg>
                      <span className="text-stone-900 dark:text-stone-100 font-light">Share on Twitter</span>
                    </button>

                    <button
                      onClick={() => shareOnPlatform('facebook')}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors text-left"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                      <span className="text-stone-900 dark:text-stone-100 font-light">Share on Facebook</span>
                    </button>

                    <button
                      onClick={() => shareOnPlatform('linkedin')}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors text-left"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                      <span className="text-stone-900 dark:text-stone-100 font-light">Share on LinkedIn</span>
                    </button>

                    <button
                      onClick={() => shareOnPlatform('whatsapp')}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors text-left"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                      </svg>
                      <span className="text-stone-900 dark:text-stone-100 font-light">Share on WhatsApp</span>
                    </button>

                    <button
                      onClick={() => shareOnPlatform('email')}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors text-left"
                    >
                      <Mail className="w-5 h-5 text-stone-600 dark:text-stone-400" strokeWidth={1.5} />
                      <span className="text-stone-900 dark:text-stone-100 font-light">Share via Email</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
          <BlogComments blogId={selectedBlog.id} />
        </div>
      </main>
    )
  }

  // Blog List View
  return (
    <main className="pt-32">
      {/* Hero Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-b from-stone-50 to-white dark:from-stone-950 dark:to-stone-900">
        <div className="max-w-4xl mx-auto px-8 lg:px-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="elegant-divider mb-8"></div>
            <h1 className="text-6xl lg:text-7xl mb-8 font-light" style={{ fontFamily: 'Crimson Pro, serif' }}>
              Our <span className="elegant-text">Blog</span>
            </h1>
            <p className="text-xl text-stone-600 dark:text-stone-300 leading-relaxed font-light">
              Insights, reflections, and conversations on building deeper connections 
              through intellectual discourse.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Featured Blogs */}
      {featuredBlogs.length > 0 && (
        <section className="py-20 bg-white dark:bg-stone-900">
          <div className="max-w-7xl mx-auto px-8 lg:px-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-12"
            >
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-stone-600 dark:text-stone-400" strokeWidth={1.5} />
                <h2 className="text-3xl font-light text-stone-900 dark:text-stone-100" style={{ fontFamily: 'Crimson Pro, serif' }}>
                  Featured Posts
                </h2>
              </div>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredBlogs.map((blog, i) => (
                <motion.article
                  key={blog.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  onClick={() => openBlog(blog)}
                  className="group cursor-pointer bg-stone-50 dark:bg-stone-800 overflow-hidden border border-stone-200 dark:border-stone-700 hover:border-stone-400 dark:hover:border-stone-500 transition-all duration-300"
                >
                  {blog.featured_image_url && (
                    <div className="relative h-56 overflow-hidden">
                      <img
                        src={blog.featured_image_url}
                        alt={blog.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-4 left-4 px-3 py-1 bg-stone-800 dark:bg-stone-200 text-white dark:text-stone-900 text-xs font-light">
                        Featured
                      </div>
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-3 text-sm text-stone-500 dark:text-stone-400 font-light">
                      <span className="px-2 py-1 bg-stone-100 dark:bg-stone-900 text-xs">
                        {blog.category}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" strokeWidth={1.5} />
                        {blog.read_time_minutes} min
                      </span>
                    </div>
                    <h3 className="text-xl mb-3 font-light text-stone-800 dark:text-stone-100 group-hover:text-stone-600 dark:group-hover:text-stone-300 transition-colors line-clamp-2" style={{ fontFamily: 'Crimson Pro, serif' }}>
                      {blog.title}
                    </h3>
                    <p className="text-stone-600 dark:text-stone-400 font-light text-sm line-clamp-2 mb-4">
                      {blog.excerpt}
                    </p>
                    <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 font-light">
                      <span>{formatDate(blog.published_at)}</span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" strokeWidth={1.5} />
                        {blog.views_count}
                      </span>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Search & Filter */}
      <section className="py-12 bg-stone-50 dark:bg-stone-950">
        <div className="max-w-7xl mx-auto px-8 lg:px-16">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            {/* Search */}
            <div className="flex-1 relative w-full">
              <Search className="w-5 h-5 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" strokeWidth={1.5} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles..."
                className="w-full pl-12 pr-4 py-3 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-800 dark:text-stone-100 focus:outline-none focus:border-stone-400 dark:focus:border-stone-500 transition-colors font-light"
              />
            </div>

            {/* Category Filter */}
            <div className="flex gap-2 overflow-x-auto scrollbar-hide w-full md:w-auto">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 font-light whitespace-nowrap transition-all ${
                    selectedCategory === category
                      ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900'
                      : 'bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-stone-800 hover:border-stone-400 dark:hover:border-stone-500'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Results Count */}
          <p className="text-sm text-stone-500 dark:text-stone-400 font-light mt-4">
            {filteredBlogs.length} {filteredBlogs.length === 1 ? 'article' : 'articles'} found
          </p>
        </div>
      </section>

      {/* Blog Grid */}
      <section className="py-20 bg-white dark:bg-stone-900">
        <div className="max-w-7xl mx-auto px-8 lg:px-16">
          {filteredBlogs.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <BookOpen className="w-16 h-16 text-stone-300 dark:text-stone-700 mx-auto mb-4" strokeWidth={1} />
              <p className="text-stone-500 dark:text-stone-400 font-light">
                No articles found. Try adjusting your search or filters.
              </p>
            </motion.div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredBlogs.map((blog, i) => (
                <motion.article
                  key={blog.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  onClick={() => openBlog(blog)}
                  className="group cursor-pointer bg-stone-50 dark:bg-stone-800 overflow-hidden border border-stone-200 dark:border-stone-700 hover:border-stone-400 dark:hover:border-stone-500 transition-all duration-300 hover:shadow-lg"
                >
                  {blog.featured_image_url && (
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={blog.featured_image_url}
                        alt={blog.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-3 text-sm text-stone-500 dark:text-stone-400 font-light">
                      <span className="px-2 py-1 bg-stone-100 dark:bg-stone-900 text-xs">
                        {blog.category}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" strokeWidth={1.5} />
                        {blog.read_time_minutes} min
                      </span>
                    </div>
                    <h3 className="text-xl mb-3 font-light text-stone-800 dark:text-stone-100 group-hover:text-stone-600 dark:group-hover:text-stone-300 transition-colors line-clamp-2" style={{ fontFamily: 'Crimson Pro, serif' }}>
                      {blog.title}
                    </h3>
                    <p className="text-stone-600 dark:text-stone-400 font-light text-sm line-clamp-3 mb-4">
                      {blog.excerpt}
                    </p>
                    <div className="flex items-center justify-between pt-4 border-t border-stone-200 dark:border-stone-700">
                      <span className="text-xs text-stone-500 dark:text-stone-400 font-light">
                        {formatDate(blog.published_at)}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-stone-500 dark:text-stone-400 font-light">
                        <Eye className="w-3 h-3" strokeWidth={1.5} />
                        {blog.views_count}
                      </span>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-20 bg-stone-50 dark:bg-stone-950">
        <div className="max-w-4xl mx-auto px-8 lg:px-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="elegant-divider mb-8"></div>
            <h2 className="text-4xl lg:text-5xl mb-6 font-light" style={{ fontFamily: 'Crimson Pro, serif' }}>
              Never Miss a <span className="elegant-text">Post</span>
            </h2>
            <p className="text-xl text-stone-600 dark:text-stone-300 font-light mb-8">
              Subscribe to our newsletter and get the latest insights delivered to your inbox.
            </p>
            <button className="btn-elegant inline-flex items-center gap-2">
              Subscribe Now
              <ChevronRight className="w-4 h-4" strokeWidth={1.5} />
            </button>
          </motion.div>
        </div>
      </section>
    </main>
  )
}