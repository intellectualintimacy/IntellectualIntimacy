import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Calendar, Clock, User, Tag, Eye, Search, Filter,
  ChevronRight, BookOpen, TrendingUp, Heart, Share2,
  X, ArrowLeft, Loader2, Mail, Send, Check, Sparkles, Copy,
  MessageCircle, Reply, AlertCircle
} from 'lucide-react'
import { marked } from 'marked'
import { supabase } from '../../lib/supabase'

const parseMarkdown = (markdown) => {
  if (!markdown) return ''
  return marked.parse(markdown)
}

// BlogComments Component
function BlogComments({ blogId }) {
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [replyingTo, setReplyingTo] = useState(null)
  const [newComment, setNewComment] = useState({
    name: '',
    email: '',
    text: ''
  })
  const [replyText, setReplyText] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    if (blogId) {
      loadComments()
    }
  }, [blogId])

  const loadComments = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('blog_comments')
        .select('*')
        .eq('blog_id', blogId)
        .eq('is_approved', true)
        .order('created_at', { ascending: false })

      if (error) throw error

      const commentMap = {}
      const rootComments = []

      data?.forEach(comment => {
        commentMap[comment.id] = { ...comment, replies: [] }
      })

      data?.forEach(comment => {
        if (comment.parent_comment_id && commentMap[comment.parent_comment_id]) {
          commentMap[comment.parent_comment_id].replies.push(commentMap[comment.id])
        } else {
          rootComments.push(commentMap[comment.id])
        }
      })

      setComments(rootComments)
    } catch (error) {
      console.error('Error loading comments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e, parentId = null) => {
    e.preventDefault()
    
    if (!parentId) {
      if (!newComment.name || !newComment.email || !newComment.text) {
        alert('Please fill in all fields')
        return
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(newComment.email)) {
        alert('Please enter a valid email address')
        return
      }
    } else {
      if (!newComment.name || !newComment.email) {
        alert('Please enter your name and email in the main comment form first')
        return
      }
      if (!replyText.trim()) {
        alert('Please write your reply')
        return
      }
    }

    try {
      setSubmitting(true)

      const { data, error } = await supabase
        .from('blog_comments')
        .insert([{
          blog_id: blogId,
          user_name: newComment.name,
          user_email: newComment.email,
          comment_text: parentId ? replyText : newComment.text,
          parent_comment_id: parentId,
          is_approved: false
        }])
        .select()

      if (error) throw error

      if (parentId) {
        setReplyText('')
        setReplyingTo(null)
      } else {
        setNewComment({ ...newComment, text: '' })
      }
      
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)
    } catch (error) {
      console.error('Error submitting comment:', error)
      alert('Failed to submit comment. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleLike = async (commentId) => {
    if (!newComment.email) {
      alert('Please enter your email to like comments')
      return
    }

    try {
      const { data: existingLike } = await supabase
        .from('comment_likes')
        .select('id')
        .eq('comment_id', commentId)
        .eq('user_email', newComment.email)
        .maybeSingle()

      if (existingLike) {
        await supabase
          .from('comment_likes')
          .delete()
          .eq('comment_id', commentId)
          .eq('user_email', newComment.email)
      } else {
        await supabase
          .from('comment_likes')
          .insert([{
            comment_id: commentId,
            user_email: newComment.email
          }])
      }

      loadComments()
    } catch (error) {
      console.error('Error toggling like:', error)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now - date) / 1000)

    if (diffInSeconds < 60) return 'Just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const CommentItem = ({ comment, isReply = false }) => (
    <div className={isReply ? 'mt-4' : 'mb-6'}>
      <div className={`flex gap-4 p-6 ${
        isReply 
          ? 'bg-stone-50 dark:bg-stone-950 border-l-4 border-l-stone-400 dark:border-l-stone-600' 
          : 'bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700'
      }`}>
        <div className="flex-shrink-0">
          {comment.user_avatar_url ? (
            <img
              src={comment.user_avatar_url}
              alt={comment.user_name}
              className="w-10 h-10"
            />
          ) : (
            <div className="w-10 h-10 bg-stone-200 dark:bg-stone-700 flex items-center justify-center">
              <User className="w-5 h-5 text-stone-500" strokeWidth={1.5} />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-medium text-stone-800 dark:text-stone-100">
              {comment.user_name}
            </span>
            <span className="text-sm text-stone-500 dark:text-stone-400 font-light">
              {formatDate(comment.created_at)}
            </span>
          </div>

          <p className="text-stone-700 dark:text-stone-300 leading-relaxed mb-3 font-light">
            {comment.comment_text}
          </p>

          <div className="flex items-center gap-4 text-sm">
            <button
              onClick={() => handleLike(comment.id)}
              className="flex items-center gap-1 text-stone-600 dark:text-stone-400 hover:text-red-500 transition-colors font-light"
            >
              <Heart className="w-4 h-4" strokeWidth={1.5} />
              <span>{comment.likes_count || 0}</span>
            </button>

            {!isReply && (
              <button
                onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                className="flex items-center gap-1 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors font-light"
              >
                <Reply className="w-4 h-4" strokeWidth={1.5} />
                {replyingTo === comment.id ? 'Cancel' : 'Reply'}
              </button>
            )}
          </div>

          {replyingTo === comment.id && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-4 pt-4 border-t border-stone-200 dark:border-stone-700"
            >
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write your reply..."
                rows={4}
                className="w-full px-4 py-3 border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-800 dark:text-stone-100 focus:outline-none focus:border-stone-400 dark:focus:border-stone-500 transition-colors font-light"
              />
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => setReplyingTo(null)}
                  className="px-6 py-2 border border-stone-300 dark:border-stone-600 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors font-light"
                >
                  Cancel
                </button>
                <button
                  onClick={(e) => handleSubmit(e, comment.id)}
                  disabled={submitting}
                  className="px-6 py-2 bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900 hover:bg-stone-800 dark:hover:bg-stone-200 transition-colors disabled:opacity-50 font-light"
                >
                  Post Reply
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {comment.replies && comment.replies.length > 0 && (
        <div className="ml-12 mt-4 space-y-4">
          {comment.replies.map(reply => (
            <CommentItem key={reply.id} comment={reply} isReply={true} />
          ))}
        </div>
      )}
    </div>
  )

  return (
    <div className="py-12">
      <div className="flex items-center gap-3 mb-8">
        <MessageCircle className="w-6 h-6 text-stone-600 dark:text-stone-400" strokeWidth={1.5} />
        <h2 className="text-3xl font-light text-stone-900 dark:text-stone-100" style={{ fontFamily: 'Crimson Pro, serif' }}>
          Comments <span className="text-stone-500">({comments.length})</span>
        </h2>
      </div>

      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 flex items-center gap-3"
          >
            <Check className="w-5 h-5 text-green-600 dark:text-green-400" strokeWidth={1.5} />
            <p className="text-green-800 dark:text-green-200 font-light">
              Comment submitted! It will appear after admin approval.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mb-12 p-6 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800">
        <h3 className="text-2xl font-light mb-6 text-stone-900 dark:text-stone-100" style={{ fontFamily: 'Crimson Pro, serif' }}>
          Leave a <span className="text-stone-600 dark:text-stone-400">Comment</span>
        </h3>
        
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-light text-stone-600 dark:text-stone-300 mb-2">
                Your Name
              </label>
              <input
                type="text"
                value={newComment.name}
                onChange={(e) => setNewComment({ ...newComment, name: e.target.value })}
                className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-100 focus:outline-none focus:border-stone-400 dark:focus:border-stone-500 transition-colors font-light"
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="block text-sm font-light text-stone-600 dark:text-stone-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={newComment.email}
                onChange={(e) => setNewComment({ ...newComment, email: e.target.value })}
                className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-100 focus:outline-none focus:border-stone-400 dark:focus:border-stone-500 transition-colors font-light"
                placeholder="your@email.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-light text-stone-600 dark:text-stone-300 mb-2">
              Comment
            </label>
            <textarea
              value={newComment.text}
              onChange={(e) => setNewComment({ ...newComment, text: e.target.value })}
              rows={6}
              className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-100 focus:outline-none focus:border-stone-400 dark:focus:border-stone-500 transition-colors resize-none font-light"
              placeholder="Share your thoughts..."
            />
          </div>

          <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" strokeWidth={1.5} />
            <p className="text-sm text-blue-800 dark:text-blue-200 font-light">
              All comments are moderated and will be reviewed before appearing on the site.
            </p>
          </div>

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="inline-flex items-center justify-center px-8 py-3 bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900 hover:bg-stone-800 dark:hover:bg-stone-200 transition-colors disabled:opacity-50 font-light"
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" strokeWidth={1.5} />
                Submitting...
              </>
            ) : (
              <>
                Post Comment
                <Send className="ml-3 w-4 h-4" strokeWidth={1.5} />
              </>
            )}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-stone-400" strokeWidth={1.5} />
          <p className="text-stone-600 dark:text-stone-400 font-light">Loading comments...</p>
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-12">
          <MessageCircle className="w-16 h-16 mx-auto mb-4 text-stone-300 dark:text-stone-700" strokeWidth={1} />
          <p className="text-stone-600 dark:text-stone-400 font-light">
            No comments yet. Be the first to share your thoughts.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {comments.map(comment => (
            <CommentItem key={comment.id} comment={comment} />
          ))}
        </div>
      )}
    </div>
  )
}

// Main Blog Component
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
  
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [newsletterLoading, setNewsletterLoading] = useState(false)
  const [newsletterSuccess, setNewsletterSuccess] = useState(false)
  const [newsletterError, setNewsletterError] = useState('')

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

    if (selectedCategory !== 'All') {
      filtered = filtered.filter(blog => blog.category === selectedCategory)
    }

    if (searchQuery) {
      filtered = filtered.filter(blog =>
        blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        blog.excerpt?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    setFilteredBlogs(filtered)
  }

  const openBlog = async (blog) => {
    setSelectedBlog(blog)
    window.scrollTo({ top: 0, behavior: 'smooth' })
    
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

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault()
    setNewsletterError('')
    setNewsletterLoading(true)

    try {
      // Validate email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        setNewsletterError('Please enter a valid email address')
        setNewsletterLoading(false)
        return
      }

      const trimmedEmail = email.toLowerCase().trim()

      // Check if email already exists
      const { data: existing, error: checkError } = await supabase
        .from('newsletter_subscribers')
        .select('email, status')
        .eq('email', trimmedEmail)
        .limit(1)

      if (checkError) {
        console.error('Check error:', checkError)
        throw new Error('Failed to check existing subscription')
      }

      if (existing && existing.length > 0) {
        const subscriber = existing[0]
        if (subscriber.status === 'active') {
          setNewsletterError('This email is already subscribed!')
        } else if (subscriber.status === 'unsubscribed') {
          setNewsletterError('This email was previously unsubscribed. Please contact support.')
        } else {
          setNewsletterError('This email is already in our system.')
        }
        setNewsletterLoading(false)
        return
      }

      // Generate tokens
      const generateToken = () => {
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
      }
      const confirmationToken = generateToken() + generateToken()
      const unsubscribeToken = generateToken() + generateToken()

      // Insert new subscriber
      const { data: insertData, error: insertError } = await supabase
        .from('newsletter_subscribers')
        .insert([
          {
            email: trimmedEmail,
            name: name.trim() || null,
            preferences: {
              events: true,
              conversations: true,
              workshops: true,
              philosophy: true
            },
            status: 'pending',
            subscribed_at: new Date().toISOString(),
            confirmation_token: confirmationToken,
            unsubscribe_token: unsubscribeToken,
            confirmed_at: null
          }
        ])
        .select()

      if (insertError) {
        console.error('Insert error:', insertError)
        if (insertError.code === '23505') {
          setNewsletterError('This email is already subscribed!')
        } else {
          throw new Error(insertError.message || 'Failed to create subscription.')
        }
        setNewsletterLoading(false)
        return
      }

      // Send confirmation email
      try {
        const { data: emailData, error: emailError } = await supabase.functions.invoke(
          'send_newsletter_confirmation',
          {
            body: { email: trimmedEmail }
          }
        )

        if (emailError) {
          console.error('Email send error:', emailError)
        }
      } catch (emailErr) {
        console.error('Email function invoke error:', emailErr)
      }

      setNewsletterSuccess(true)
      setEmail('')
      setName('')

      setTimeout(() => {
        setNewsletterSuccess(false)
      }, 10000)

    } catch (err) {
      console.error('Newsletter subscription error:', err)
      setNewsletterError(err.message || 'Something went wrong. Please try again later.')
    } finally {
      setNewsletterLoading(false)
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
            <div className="elegant-divider mb-8"></div>
            
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
                [&>p]:mb-6 [&>p]:leading-relaxed [&>p]:text-base
                [&>ul]:my-6 [&>ul]:list-disc [&>ul]:ml-6 [&>ul]:space-y-2
                [&>ol]:my-6 [&>ol]:list-decimal [&>ol]:ml-6 [&>ol]:space-y-2
                [&>blockquote]:border-l-4 [&>blockquote]:border-stone-400 [&>blockquote]:dark:border-stone-600 
                [&>blockquote]:pl-6 [&>blockquote]:py-2 [&>blockquote]:my-6 [&>blockquote]:italic [&>blockquote]:text-stone-600 [&>blockquote]:dark:text-stone-400
                [&>code]:bg-stone-100 [&>code]:dark:bg-stone-800 [&>code]:px-2 [&>code]:py-1 [&>code]:text-sm
                [&_a]:text-stone-900 [&_a]:dark:text-stone-100 [&_a]:underline [&_a]:hover:text-stone-600 [&_a]:transition-colors
                [&_strong]:font-semibold [&_strong]:text-stone-900 [&_strong]:dark:text-stone-100"
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
            className="relative mb-12"
          >
            <div className="flex items-center justify-between p-6 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
              <p className="font-light text-stone-900 dark:text-stone-100">
                Share this article
              </p>
              <button 
                onClick={() => setShowShareMenu(!showShareMenu)}
                className="inline-flex items-center justify-center px-6 py-2 bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900 hover:bg-stone-800 dark:hover:bg-stone-200 transition-colors font-light"
              >
                <Share2 className="w-4 h-4 mr-2" strokeWidth={1.5} />
                Share
              </button>
            </div>

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
                      <Share2 className="w-5 h-5 text-stone-600 dark:text-stone-400" strokeWidth={1.5} />
                      <span className="text-stone-900 dark:text-stone-100 font-light">Share on Twitter</span>
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

          {/* Blog Comments */}
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
            <h1 className="text-6xl lg:text-7xl mb-8 font-light text-stone-900 dark:text-stone-100" style={{ fontFamily: 'Crimson Pro, serif' }}>
              Our <span className="text-stone-600 dark:text-stone-400">Blog</span>
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
                      <div className="absolute top-4 left-4 px-3 py-1 bg-stone-900/80 text-white text-xs font-light">
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
                  transition={{ delay: i * 0.05 }}
                  onClick={() => openBlog(blog)}
                  className="group cursor-pointer bg-stone-50 dark:bg-stone-800 overflow-hidden border border-stone-200 dark:border-stone-700 hover:border-stone-400 dark:hover:border-stone-500 transition-all duration-300"
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
      <section className="py-20 lg:py-32 bg-stone-50 dark:bg-stone-950">
        <div className="max-w-4xl mx-auto px-8 lg:px-16">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="elegant-divider mb-8"></div>
            <h2 className="text-4xl lg:text-5xl mb-6 font-light text-stone-900 dark:text-stone-100" style={{ fontFamily: 'Crimson Pro, serif' }}>
              Never Miss a <span className="text-stone-600 dark:text-stone-400">Post</span>
            </h2>
            <p className="text-lg text-stone-600 dark:text-stone-300 leading-relaxed font-light">
              Subscribe to our newsletter and get the latest insights delivered directly to your inbox.
            </p>
          </motion.div>

          <AnimatePresence mode="wait">
            {!newsletterSuccess ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div>
                  <label className="block text-sm font-light text-stone-600 dark:text-stone-300 mb-2">
                    Name <span className="text-stone-500">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-100 focus:outline-none focus:border-stone-400 dark:focus:border-stone-500 transition-colors font-light"
                  />
                </div>

                <div>
                  <label className="block text-sm font-light text-stone-600 dark:text-stone-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@example.com"
                    required
                    className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-100 focus:outline-none focus:border-stone-400 dark:focus:border-stone-500 transition-colors font-light"
                  />
                </div>

                <AnimatePresence>
                  {newsletterError && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
                    >
                      <X className="w-5 h-5 text-red-600 dark:text-red-400" strokeWidth={1.5} />
                      <p className="text-sm text-red-800 dark:text-red-200 font-light">{newsletterError}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <button
                  onClick={handleNewsletterSubmit}
                  disabled={newsletterLoading || !email}
                  className="w-full inline-flex items-center justify-center px-8 py-3 bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900 hover:bg-stone-800 dark:hover:bg-stone-200 transition-colors disabled:opacity-50 font-light"
                >
                  {newsletterLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin mr-2" strokeWidth={1.5} />
                      Subscribing...
                    </>
                  ) : (
                    <>
                      Subscribe to Newsletter
                      <Send className="ml-3 w-4 h-4" strokeWidth={1.5} />
                    </>
                  )}
                </button>

                <p className="text-xs text-stone-600 dark:text-stone-400 text-center font-light">
                  We respect your privacy. Unsubscribe anytime. No spam, ever.
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="text-center p-12 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800"
              >
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="w-20 h-20 mx-auto mb-6 bg-green-100 dark:bg-green-900/20 flex items-center justify-center"
                >
                  <Check className="w-10 h-10 text-green-600 dark:text-green-400" strokeWidth={1.5} />
                </motion.div>
                
                <h3 className="text-3xl font-light text-stone-900 dark:text-stone-100 mb-4" style={{ fontFamily: 'Crimson Pro, serif' }}>
                  Welcome Aboard!
                </h3>
                
                <p className="text-lg text-stone-600 dark:text-stone-300 font-light mb-6">
                  Thank you for subscribing! Check your email to confirm your subscription.
                </p>

                <div className="bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 p-4">
                  <p className="text-sm text-stone-700 dark:text-stone-300 font-light">
                    📧 Please click the link in the confirmation email to activate your subscription.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </main>
  )
}

// Add elegant divider CSS
const style = document.createElement('style')
style.textContent = `
  .elegant-divider {
    width: 60px;
    height: 1px;
    background: linear-gradient(to right, transparent, currentColor, transparent);
    margin: 0 auto;
    opacity: 0.3;
  }
`
document.head.appendChild(style)