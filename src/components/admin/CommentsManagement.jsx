import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  MessageCircle, User, Clock, Eye, Check, X, Trash2, Pin, Search,
  Loader2, AlertCircle, CheckCircle, Filter, Calendar
} from 'lucide-react'
import { supabase } from '../../../lib/supabase'

export default function CommentsManagement() {
  const [comments, setComments] = useState([])
  const [blogs, setBlogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('pending') // pending, approved, all
  const [selectedBlogId, setSelectedBlogId] = useState('all')
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    pending: 0
  })

  useEffect(() => {
    loadBlogs()
    loadComments()
  }, [])

  useEffect(() => {
    loadComments()
  }, [filterStatus, selectedBlogId])

  const loadBlogs = async () => {
    try {
      const { data, error } = await supabase
        .from('blogs')
        .select('id, title')
        .order('created_at', { ascending: false })

      if (error) throw error
      setBlogs(data || [])
    } catch (error) {
      console.error('Error loading blogs:', error)
    }
  }

  const loadComments = async () => {
    try {
      setLoading(true)
      let query = supabase
        .from('blog_comments')
        .select('*, blogs(title)')
        .order('created_at', { ascending: false })

      // Filter by approval status
      if (filterStatus === 'approved') {
        query = query.eq('is_approved', true)
      } else if (filterStatus === 'pending') {
        query = query.eq('is_approved', false)
      }

      // Filter by blog
      if (selectedBlogId !== 'all') {
        query = query.eq('blog_id', selectedBlogId)
      }

      const { data, error } = await query

      if (error) throw error

      // Organize into parent-child structure
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

      // Calculate stats
      const allCommentsFlat = data || []
      setStats({
        total: allCommentsFlat.length,
        approved: allCommentsFlat.filter(c => c.is_approved).length,
        pending: allCommentsFlat.filter(c => !c.is_approved).length
      })
    } catch (error) {
      console.error('Error loading comments:', error)
    } finally {
      setLoading(false)
    }
  }

  const approveComment = async (commentId) => {
    try {
      const { error } = await supabase
        .from('blog_comments')
        .update({ is_approved: true })
        .eq('id', commentId)

      if (error) throw error
      loadComments()
    } catch (error) {
      console.error('Error approving comment:', error)
      alert('Failed to approve comment')
    }
  }

  const rejectComment = async (commentId) => {
    if (!confirm('Are you sure you want to reject this comment?')) return

    try {
      const { error } = await supabase
        .from('blog_comments')
        .update({ is_approved: false })
        .eq('id', commentId)

      if (error) throw error
      loadComments()
    } catch (error) {
      console.error('Error rejecting comment:', error)
      alert('Failed to reject comment')
    }
  }

  const deleteComment = async (commentId) => {
    if (!confirm('Are you sure you want to permanently delete this comment? This action cannot be undone.')) return

    try {
      const { error } = await supabase
        .from('blog_comments')
        .delete()
        .eq('id', commentId)

      if (error) throw error
      loadComments()
    } catch (error) {
      console.error('Error deleting comment:', error)
      alert('Failed to delete comment')
    }
  }

  const togglePin = async (comment) => {
    try {
      const { error } = await supabase
        .from('blog_comments')
        .update({ is_pinned: !comment.is_pinned })
        .eq('id', comment.id)

      if (error) throw error
      loadComments()
    } catch (error) {
      console.error('Error toggling pin:', error)
      alert('Failed to toggle pin')
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const filteredComments = comments.filter(comment => {
    if (!searchTerm) return true
    const searchLower = searchTerm.toLowerCase()
    return (
      comment.user_name.toLowerCase().includes(searchLower) ||
      comment.user_email.toLowerCase().includes(searchLower) ||
      comment.comment_text.toLowerCase().includes(searchLower)
    )
  })

  const CommentItem = ({ comment, isReply = false }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${isReply ? 'ml-12 mt-2' : 'mb-4'}`}
    >
      <div className={`p-4 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 ${
        !comment.is_approved ? 'border-l-4 border-l-amber-500' : ''
      }`}>
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex items-start gap-3 flex-1">
            <div className="w-10 h-10 rounded-full bg-stone-200 dark:bg-stone-700 flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5 text-stone-500" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="font-medium text-stone-900 dark:text-stone-100">
                  {comment.user_name}
                </span>
                <span className="text-sm text-stone-500 dark:text-stone-400">
                  {comment.user_email}
                </span>
                {!comment.is_approved && (
                  <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs">
                    Pending
                  </span>
                )}
                {comment.is_pinned && (
                  <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs">
                    Pinned
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 text-xs text-stone-500 dark:text-stone-400 mb-2">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formatDate(comment.created_at)}
                </span>
                {comment.blogs?.title && (
                  <span className="flex items-center gap-1">
                    <MessageCircle className="w-3 h-3" />
                    {comment.blogs.title}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  {comment.likes_count || 0} likes
                </span>
              </div>
              <p className="text-stone-700 dark:text-stone-300 leading-relaxed">
                {comment.comment_text}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-1 flex-shrink-0">
            {!comment.is_approved ? (
              <button
                onClick={() => approveComment(comment.id)}
                className="p-2 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                title="Approve"
              >
                <Check className="w-4 h-4 text-green-600" />
              </button>
            ) : (
              <button
                onClick={() => rejectComment(comment.id)}
                className="p-2 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
                title="Unapprove"
              >
                <X className="w-4 h-4 text-amber-600" />
              </button>
            )}
            <button
              onClick={() => togglePin(comment)}
              className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
              title={comment.is_pinned ? 'Unpin' : 'Pin'}
            >
              <Pin className={`w-4 h-4 ${comment.is_pinned ? 'text-blue-600' : 'text-stone-400'}`} />
            </button>
            <button
              onClick={() => deleteComment(comment.id)}
              className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              title="Delete"
            >
              <Trash2 className="w-4 h-4 text-red-600" />
            </button>
          </div>
        </div>

        {/* Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-3 pt-3 border-t border-stone-200 dark:border-stone-800 space-y-2">
            {comment.replies.map(reply => (
              <CommentItem key={reply.id} comment={reply} isReply={true} />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-8"
    >
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-light mb-2" style={{ fontFamily: 'Crimson Pro, serif' }}>
          Comments Management
        </h2>
        <p className="text-stone-600 dark:text-stone-400">
          Moderate and manage blog comments
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-stone-900 p-6 border border-stone-200 dark:border-stone-800">
          <div className="flex items-center justify-between mb-2">
            <MessageCircle className="w-8 h-8 text-stone-400" />
            <span className="text-2xl font-light">{stats.total}</span>
          </div>
          <p className="text-sm text-stone-600 dark:text-stone-400">Total Comments</p>
        </div>

        <div className="bg-white dark:bg-stone-900 p-6 border border-stone-200 dark:border-stone-800">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-8 h-8 text-green-500" />
            <span className="text-2xl font-light">{stats.approved}</span>
          </div>
          <p className="text-sm text-stone-600 dark:text-stone-400">Approved</p>
        </div>

        <div className="bg-white dark:bg-stone-900 p-6 border border-stone-200 dark:border-stone-800">
          <div className="flex items-center justify-between mb-2">
            <AlertCircle className="w-8 h-8 text-amber-500" />
            <span className="text-2xl font-light">{stats.pending}</span>
          </div>
          <p className="text-sm text-stone-600 dark:text-stone-400">Pending Review</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-stone-900 p-6 border border-stone-200 dark:border-stone-800 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search comments..."
              className="w-full pl-12 pr-4 py-3 border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100 focus:outline-none focus:border-stone-400 dark:focus:border-stone-600 transition-colors"
            />
          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-3 border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100 focus:outline-none focus:border-stone-400 dark:focus:border-stone-600 transition-colors"
          >
            <option value="all">All Comments</option>
            <option value="pending">Pending Review</option>
            <option value="approved">Approved</option>
          </select>

          {/* Blog Filter */}
          <select
            value={selectedBlogId}
            onChange={(e) => setSelectedBlogId(e.target.value)}
            className="px-4 py-3 border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100 focus:outline-none focus:border-stone-400 dark:focus:border-stone-600 transition-colors"
          >
            <option value="all">All Blogs</option>
            {blogs.map(blog => (
              <option key={blog.id} value={blog.id}>
                {blog.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Comments List */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-6">
        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-stone-400" />
            <p className="text-stone-600 dark:text-stone-400">Loading comments...</p>
          </div>
        ) : filteredComments.length === 0 ? (
          <div className="text-center py-12">
            <MessageCircle className="w-16 h-16 mx-auto mb-4 text-stone-300 dark:text-stone-700" strokeWidth={1} />
            <p className="text-stone-600 dark:text-stone-400 mb-2">No comments found</p>
            <p className="text-sm text-stone-500 dark:text-stone-500">
              {filterStatus === 'pending' ? 'No comments pending review' : 'Try adjusting your filters'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredComments.map(comment => (
              <CommentItem key={comment.id} comment={comment} />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}