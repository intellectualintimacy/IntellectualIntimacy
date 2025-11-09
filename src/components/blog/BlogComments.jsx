import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, Heart, Reply, Send, User, AlertCircle, Check, Loader2 } from 'lucide-react'
import { supabase } from '../../../lib/supabase'

export default function BlogComments({ blogId }) {
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [replyingTo, setReplyingTo] = useState(null)
  const [newComment, setNewComment] = useState({
    name: '',
    email: '',
    text: ''
  })
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

      // Organize comments into threads
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
    
    if (!newComment.name || !newComment.email || !newComment.text) {
      alert('Please fill in all fields')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(newComment.email)) {
      alert('Please enter a valid email address')
      return
    }

    try {
      setSubmitting(true)

      const { data, error } = await supabase
        .from('blog_comments')
        .insert([{
          blog_id: blogId,
          user_name: newComment.name,
          user_email: newComment.email,
          comment_text: newComment.text,
          parent_comment_id: parentId,
          is_approved: false
        }])
        .select()

      if (error) throw error

      setNewComment({ name: '', email: '', text: '' })
      setReplyingTo(null)
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
        .single()

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
      <div className={`flex gap-3 md:gap-4 p-4 md:p-6 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 ${
        isReply ? 'bg-stone-50 dark:bg-stone-950 border-l-4 border-l-stone-400 dark:border-l-stone-600' : ''
      }`}>
        <div className="flex-shrink-0">
          {comment.user_avatar_url ? (
            <img
              src={comment.user_avatar_url}
              alt={comment.user_name}
              className="w-8 h-8 md:w-10 md:h-10"
            />
          ) : (
            <div className="w-8 h-8 md:w-10 md:h-10 bg-stone-200 dark:bg-stone-700 flex items-center justify-center">
              <User className="w-4 h-4 md:w-5 md:h-5 text-stone-500" strokeWidth={1.5} />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="font-medium text-stone-900 dark:text-stone-100 text-sm md:text-base">
              {comment.user_name}
            </span>
            <span className="text-xs md:text-sm text-stone-500 dark:text-stone-400">
              {formatDate(comment.created_at)}
            </span>
            {comment.is_pinned && (
              <span className="text-xs px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
                Pinned
              </span>
            )}
            {isReply && (
              <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                Reply
              </span>
            )}
          </div>

          <p className="text-stone-700 dark:text-stone-300 leading-relaxed mb-3 text-sm md:text-base">
            {comment.comment_text}
          </p>

          <div className="flex items-center gap-3 md:gap-4 text-xs md:text-sm">
            <button
              onClick={() => handleLike(comment.id)}
              className="flex items-center gap-1 text-stone-600 dark:text-stone-400 hover:text-red-500 transition-colors"
            >
              <Heart className="w-3 h-3 md:w-4 md:h-4" strokeWidth={1.5} />
              <span>{comment.likes_count || 0}</span>
            </button>

            {!isReply && (
              <button
                onClick={() => setReplyingTo(comment.id === replyingTo ? null : comment.id)}
                className="flex items-center gap-1 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
              >
                <Reply className="w-3 h-3 md:w-4 md:h-4" strokeWidth={1.5} />
                Reply
              </button>
            )}
          </div>

          {replyingTo === comment.id && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-stone-200 dark:border-stone-800"
            >
              <div className="space-y-3">
                <textarea
                  value={newComment.text}
                  onChange={(e) => setNewComment({ ...newComment, text: e.target.value })}
                  placeholder="Write your reply..."
                  rows={4}
                  className="w-full px-4 py-3 md:py-3 text-base md:text-base border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100 focus:outline-none focus:border-stone-400 dark:focus:border-stone-600 transition-colors"
                  required
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setReplyingTo(null)}
                    className="px-4 py-2.5 md:py-2 text-sm md:text-base border border-stone-200 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleSubmit(e, comment.id)}
                    disabled={submitting}
                    className="px-4 py-2.5 md:py-2 text-sm md:text-base bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 hover:bg-stone-800 dark:hover:bg-stone-200 transition-colors disabled:opacity-50 inline-flex items-center gap-2"
                  >
                    {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    Post Reply
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Nested Replies Container */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="ml-4 md:ml-12 mt-4 pl-4 md:pl-6 border-l-2 border-stone-200 dark:border-stone-800">
          <div className="space-y-4">
            {comment.replies.map(reply => (
              <CommentItem key={reply.id} comment={reply} isReply={true} />
            ))}
          </div>
        </div>
      )}
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 lg:px-16 py-12">
      <div className="flex items-center gap-3 mb-8">
        <MessageCircle className="w-5 h-5 md:w-6 md:h-6 text-stone-600 dark:text-stone-400" strokeWidth={1.5} />
        <h2 className="text-2xl md:text-3xl font-light" style={{ fontFamily: 'Crimson Pro, serif' }}>
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
            <p className="text-sm md:text-base text-green-800 dark:text-green-200">
              Comment submitted! It will appear after admin approval.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Comment Form - Larger on Mobile */}
      <div className="mb-12 p-4 md:p-6 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800">
        <h3 className="text-xl md:text-2xl font-light mb-6" style={{ fontFamily: 'Crimson Pro, serif' }}>
          Leave a Comment
        </h3>
        
        <div className="space-y-4 md:space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm md:text-sm font-medium mb-2 text-stone-700 dark:text-stone-300">
                Name *
              </label>
              <input
                type="text"
                value={newComment.name}
                onChange={(e) => setNewComment({ ...newComment, name: e.target.value })}
                className="w-full px-4 py-3.5 md:py-3 text-base md:text-base border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:outline-none focus:border-stone-400 dark:focus:border-stone-600 transition-colors"
                placeholder="Your name"
                required
              />
            </div>
            <div>
              <label className="block text-sm md:text-sm font-medium mb-2 text-stone-700 dark:text-stone-300">
                Email *
              </label>
              <input
                type="email"
                value={newComment.email}
                onChange={(e) => setNewComment({ ...newComment, email: e.target.value })}
                className="w-full px-4 py-3.5 md:py-3 text-base md:text-base border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:outline-none focus:border-stone-400 dark:focus:border-stone-600 transition-colors"
                placeholder="your@email.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm md:text-sm font-medium mb-2 text-stone-700 dark:text-stone-300">
              Comment *
            </label>
            <textarea
              value={newComment.text}
              onChange={(e) => setNewComment({ ...newComment, text: e.target.value })}
              rows={6}
              className="w-full px-4 py-3.5 md:py-3 text-base md:text-base border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:outline-none focus:border-stone-400 dark:focus:border-stone-600 transition-colors leading-relaxed"
              placeholder="Share your thoughts..."
              required
            />
          </div>

          <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
            <p className="text-xs md:text-sm text-blue-800 dark:text-blue-200">
              All comments are moderated and will be reviewed before appearing on the site.
            </p>
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full md:w-auto px-6 py-3.5 md:py-3 text-base md:text-base bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 hover:bg-stone-800 dark:hover:bg-stone-200 transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" strokeWidth={1.5} />
                Submitting...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 md:w-5 md:h-5" strokeWidth={1.5} />
                Post Comment
              </>
            )}
          </button>
        </div>
      </div>

      {/* Comments List */}
      {loading ? (
        <div className="text-center py-12">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-stone-400" strokeWidth={1.5} />
          <p className="text-stone-600 dark:text-stone-400 text-sm md:text-base">Loading comments...</p>
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-12">
          <MessageCircle className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 text-stone-300 dark:text-stone-700" strokeWidth={1} />
          <p className="text-stone-600 dark:text-stone-400 text-sm md:text-base">
            No comments yet. Be the first to share your thoughts!
          </p>
        </div>
      ) : (
        <div>
          {comments.map(comment => (
            <CommentItem key={comment.id} comment={comment} />
          ))}
        </div>
      )}
    </div>
  )
}