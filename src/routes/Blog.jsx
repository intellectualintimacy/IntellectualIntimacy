import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Calendar, Clock, User, Tag, Eye, Search, Filter,
  ChevronRight, BookOpen, TrendingUp, Heart, Share2,
  X, ArrowLeft, Loader2, Copy, Check, Mail, MessageCircle
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { marked } from 'marked'

export default function Blog() {
  const [loading, setLoading] = useState(true)
  const [blogs, setBlogs] = useState([])
  const [filteredBlogs, setFilteredBlogs] = useState([])
  const [selectedBlog, setSelectedBlog] = useState(null)
  const [categories, setCategories] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')

  // Configure marked options for better rendering
  useEffect(() => {
    marked.setOptions({
      breaks: true,
      gfm: true,
      headerIds: true,
      mangle: false,
    })
  }, [])

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
      
      const uniqueCategories = ['All', ...new Set(data?.map(blog => blog.category).filter(Boolean) || [])]
      setCategories(uniqueCategories)
    } catch (error) {
      console.error('Error loading blogs:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterBlogs = () => {
    let filtered = blogs

    if (selectedCategory !== 'All') {
      filtered = filtered.filter(blog => blog.category === selectedCategory)
    }

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

  const [showShareMenu, setShowShareMenu] = useState(false)

  const shareOnPlatform = (platform, blog) => {
    const url = window.location.href
    const title = blog.title
    const text = blog.excerpt || blog.title

    const shareUrls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(title + ' ' + url)}`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
      reddit: `https://reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`,
      email: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(text + '\n\n' + url)}`
    }

    if (platform === 'copy') {
      navigator.clipboard.writeText(url).then(() => {
        alert('Link copied to clipboard!')
      }).catch(() => {
        alert('Failed to copy link')
      })
      return
    }

    if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400')
    }
  }

  const nativeShare = async (blog) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: blog.title,
          text: blog.excerpt || blog.title,
          url: window.location.href
        })
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Share failed:', err)
        }
      }
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
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={closeBlog}
            className="flex items-center gap-2 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 mb-8 font-light transition-colors"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
            Back to all posts
          </motion.button>

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

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-12"
          >
            <div className="flex items-center gap-3 mb-6 flex-wrap">
              {selectedBlog.category && (
                <span className="px-3 py-1 bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-sm font-light">
                  {selectedBlog.category}
                </span>
              )}
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

            <div className="flex items-center gap-4 pb-8 border-b border-stone-200 dark:border-stone-800">
              {selectedBlog.author_avatar_url ? (
                <img
                  src={selectedBlog.author_avatar_url}
                  alt={selectedBlog.author_name}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-stone-200 dark:bg-stone-700 flex items-center justify-center text-stone-700 dark:text-stone-300 font-light text-xl">
                  {selectedBlog.author_name?.[0]?.toUpperCase() || 'A'}
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

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex items-center justify-between p-6 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800"
          >
            <p className="font-light text-stone-900 dark:text-stone-100">
              Share this article
            </p>
            <button className="px-6 py-2 bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900 hover:bg-stone-800 dark:hover:bg-stone-200 transition-colors font-light flex items-center gap-2">
              <Share2 className="w-4 h-4" strokeWidth={1.5} />
              Share
            </button>
          </motion.div>
        </div>
      </main>
    )
  }

  // Blog List View
  return (
    <main className="pt-32">
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

      <section className="py-12 bg-stone-50 dark:bg-stone-950">
        <div className="max-w-7xl mx-auto px-8 lg:px-16">
          <div className="flex flex-col md:flex-row gap-4 items-center">
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

          <p className="text-sm text-stone-500 dark:text-stone-400 font-light mt-4">
            {filteredBlogs.length} {filteredBlogs.length === 1 ? 'article' : 'articles'} found
          </p>
        </div>
      </section>

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