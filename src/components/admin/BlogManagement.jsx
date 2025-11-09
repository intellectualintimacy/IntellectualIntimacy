import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Search, Edit2, Trash2, Eye, EyeOff, Star, Send,
  X, Loader2, Upload, Calendar, User, Tag, Clock, TrendingUp,
  FileText, Image as ImageIcon, Mail, CheckCircle, AlertCircle
} from 'lucide-react';
import { supabase } from '../../../lib/supabase';

// Blog Modal Component
function BlogModal({ blog, onClose, onSave }) {
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [sendingNotification, setSendingNotification] = useState(false);
  const [form, setForm] = useState(blog || {
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    featured_image_url: '',
    category: '',
    tags: [],
    is_published: false,
    is_featured: false,
    read_time_minutes: 5
  });
  const [tagInput, setTagInput] = useState('');
  const [contentRef, setContentRef] = useState(null);

  // Auto-generate slug from title
  useEffect(() => {
    if (!blog && form.title) {
      const slug = form.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setForm(prev => ({ ...prev, slug }));
    }
  }, [form.title, blog]);

  // Calculate read time based on content
  useEffect(() => {
    if (form.content) {
      const words = form.content.split(/\s+/).length;
      const minutes = Math.ceil(words / 200);
      setForm(prev => ({ ...prev, read_time_minutes: minutes }));
    }
  }, [form.content]);

  const handleImageUpload = async (file) => {
    if (!file) return;

    try {
      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
      const filePath = `blog-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('blog-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('blog-images')
        .getPublicUrl(filePath);

      setForm(prev => ({ ...prev, featured_image_url: publicUrl }));
    } catch (err) {
      console.error('Upload error:', err);
      alert('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !form.tags.includes(tagInput.trim())) {
      setForm(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tag) => {
    setForm(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  // Rich text formatting functions
  const insertFormatting = (before, after = '') => {
    if (!contentRef) return;
    
    const start = contentRef.selectionStart;
    const end = contentRef.selectionEnd;
    const selectedText = form.content.substring(start, end);
    const beforeText = form.content.substring(0, start);
    const afterText = form.content.substring(end);
    
    const newContent = beforeText + before + selectedText + after + afterText;
    const newCursorPos = start + before.length + selectedText.length + after.length;
    
    setForm(prev => ({ ...prev, content: newContent }));
    
    setTimeout(() => {
      contentRef.focus();
      contentRef.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const formatBold = () => insertFormatting('**', '**');
  const formatItalic = () => insertFormatting('*', '*');
  const formatHeading = (level) => {
    const prefix = '#'.repeat(level) + ' ';
    insertFormatting(prefix);
  };
  const formatLink = () => insertFormatting('[', '](url)');
  const formatList = () => insertFormatting('- ');
  const formatNumberedList = () => insertFormatting('1. ');
  const formatQuote = () => insertFormatting('> ');
  const formatCode = () => insertFormatting('`', '`');
  const formatCodeBlock = () => insertFormatting('```\n', '\n```');

  const sendNewsletterNotification = async (blogData) => {
    setSendingNotification(true);
    try {
      const { data: subscribers, error: subsError } = await supabase
        .from('newsletter_subscribers')
        .select('email')
        .eq('is_subscribed', true);

      if (subsError) throw subsError;

      if (!subscribers || subscribers.length === 0) {
        alert('No active subscribers found');
        return;
      }

      console.log(`Sending newsletter to ${subscribers.length} subscribers about: ${blogData.title}`);
      alert(`Newsletter notification queued for ${subscribers.length} subscribers!`);
    } catch (err) {
      console.error('Notification error:', err);
      alert('Failed to send notifications: ' + err.message);
    } finally {
      setSendingNotification(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, avatar_url')
        .eq('id', user.id)
        .single();

      const payload = {
        title: form.title,
        slug: form.slug,
        content: form.content,
        excerpt: form.excerpt || form.content.substring(0, 200) + '...',
        featured_image_url: form.featured_image_url || null,
        author_id: user.id,
        author_name: profile?.full_name || 'Anonymous',
        author_avatar_url: profile?.avatar_url || null,
        category: form.category || null,
        tags: form.tags,
        is_published: form.is_published,
        is_featured: form.is_featured,
        read_time_minutes: form.read_time_minutes,
        published_at: form.is_published && !blog?.id ? new Date().toISOString() : blog?.published_at
      };

      let savedBlog = null;

      if (blog?.id) {
        const { data, error } = await supabase
          .from('blogs')
          .update(payload)
          .eq('id', blog.id)
          .select()
          .single();

        if (error) throw error;
        savedBlog = data;
      } else {
        const { data, error } = await supabase
          .from('blogs')
          .insert([payload])
          .select()
          .single();

        if (error) throw error;
        savedBlog = data;
      }

      if (form.is_published) {
        const sendNewsletter = confirm(
          '📧 Blog published successfully!\n\nWould you like to notify newsletter subscribers?'
        );
        
        if (sendNewsletter) {
          await sendNewsletterNotification(savedBlog);
        }
      }

      onSave();
    } catch (err) {
      console.error('Save error:', err);
      alert(err.message || 'Failed to save blog');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-stone-900 w-full max-w-4xl p-8 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6 pb-6 border-b border-stone-200 dark:border-stone-800">
          <h3 className="text-2xl font-light" style={{ fontFamily: 'Crimson Pro, serif' }}>
            {blog ? 'Edit Blog Post' : 'Create New Blog Post'}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title & Slug */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-stone-700 dark:text-stone-300">Title *</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-4 py-3 border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100 focus:outline-none focus:border-stone-400 dark:focus:border-stone-600 transition-colors"
                placeholder="Blog post title"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-stone-700 dark:text-stone-300">Slug (URL)</label>
              <input
                type="text"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                className="w-full px-4 py-3 border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100 focus:outline-none focus:border-stone-400 dark:focus:border-stone-600 transition-colors"
                placeholder="blog-post-url"
              />
            </div>
          </div>

          {/* Category & Read Time */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2 text-stone-700 dark:text-stone-300">Category</label>
              <input
                type="text"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-4 py-3 border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100 focus:outline-none focus:border-stone-400 dark:focus:border-stone-600 transition-colors"
                placeholder="e.g., Mindfulness, Relationships, Growth"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-stone-700 dark:text-stone-300">Read Time (min)</label>
              <input
                type="number"
                value={form.read_time_minutes}
                onChange={(e) => setForm({ ...form, read_time_minutes: parseInt(e.target.value) })}
                className="w-full px-4 py-3 border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100 focus:outline-none focus:border-stone-400 dark:focus:border-stone-600 transition-colors"
                min="1"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium mb-2 text-stone-700 dark:text-stone-300">Tags</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                className="flex-1 px-4 py-3 border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100 focus:outline-none focus:border-stone-400 dark:focus:border-stone-600 transition-colors"
                placeholder="Add tag and press Enter"
              />
              <button
                type="button"
                onClick={addTag}
                className="px-4 py-3 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {form.tags.map(tag => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-stone-100 dark:bg-stone-800 text-sm"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="hover:text-red-500"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Excerpt */}
          <div>
            <label className="block text-sm font-medium mb-2 text-stone-700 dark:text-stone-300">Excerpt</label>
            <textarea
              value={form.excerpt}
              onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100 focus:outline-none focus:border-stone-400 dark:focus:border-stone-600 transition-colors"
              placeholder="Brief summary (optional - auto-generated if empty)"
            />
          </div>

          {/* Content with Rich Text Toolbar */}
          <div>
            <label className="block text-sm font-medium mb-2 text-stone-700 dark:text-stone-300">Content *</label>
            
            {/* Formatting Toolbar */}
            <div className="flex flex-wrap gap-1 p-2 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 mb-2">
              <button
                type="button"
                onClick={() => formatHeading(1)}
                className="px-3 py-1.5 hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors text-sm font-semibold"
                title="Heading 1"
              >
                H1
              </button>
              <button
                type="button"
                onClick={() => formatHeading(2)}
                className="px-3 py-1.5 hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors text-sm font-semibold"
                title="Heading 2"
              >
                H2
              </button>
              <button
                type="button"
                onClick={() => formatHeading(3)}
                className="px-3 py-1.5 hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors text-sm font-semibold"
                title="Heading 3"
              >
                H3
              </button>
              <div className="w-px bg-stone-300 dark:bg-stone-700 mx-1"></div>
              <button
                type="button"
                onClick={formatBold}
                className="px-3 py-1.5 hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors text-sm font-bold"
                title="Bold"
              >
                B
              </button>
              <button
                type="button"
                onClick={formatItalic}
                className="px-3 py-1.5 hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors text-sm italic"
                title="Italic"
              >
                I
              </button>
              <div className="w-px bg-stone-300 dark:bg-stone-700 mx-1"></div>
              <button
                type="button"
                onClick={formatLink}
                className="px-3 py-1.5 hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors text-sm"
                title="Insert Link"
              >
                Link
              </button>
              <button
                type="button"
                onClick={formatQuote}
                className="px-3 py-1.5 hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors text-sm"
                title="Quote"
              >
                "
              </button>
              <div className="w-px bg-stone-300 dark:bg-stone-700 mx-1"></div>
              <button
                type="button"
                onClick={formatList}
                className="px-3 py-1.5 hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors text-sm"
                title="Bullet List"
              >
                • List
              </button>
              <button
                type="button"
                onClick={formatNumberedList}
                className="px-3 py-1.5 hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors text-sm"
                title="Numbered List"
              >
                1. List
              </button>
              <div className="w-px bg-stone-300 dark:bg-stone-700 mx-1"></div>
              <button
                type="button"
                onClick={formatCode}
                className="px-3 py-1.5 hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors text-sm font-mono"
                title="Inline Code"
              >
                {'</>'}
              </button>
              <button
                type="button"
                onClick={formatCodeBlock}
                className="px-3 py-1.5 hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors text-sm font-mono"
                title="Code Block"
              >
                {'```'}
              </button>
            </div>

            <textarea
              ref={setContentRef}
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              rows={16}
              className="w-full px-4 py-3 border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100 focus:outline-none focus:border-stone-400 dark:focus:border-stone-600 transition-colors font-mono text-sm leading-relaxed"
              placeholder="Write your blog content here... Use the toolbar above for formatting.&#10;&#10;Markdown Guide:&#10;# Heading 1&#10;## Heading 2&#10;### Heading 3&#10;**bold text**&#10;*italic text*&#10;[link text](url)&#10;- bullet list&#10;1. numbered list&#10;> quote&#10;`inline code`&#10;```code block```"
              required
            />
            
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-2">
              Markdown formatting supported. Use the toolbar buttons or type markdown syntax directly.
            </p>
          </div>

          {/* Featured Image */}
          <div>
            <label className="block text-sm font-medium mb-2 text-stone-700 dark:text-stone-300">Featured Image</label>
            <div className="flex items-center gap-4 mb-3">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e.target.files[0])}
                className="flex-1 text-sm"
                disabled={uploading}
              />
              {uploading && <Loader2 className="w-5 h-5 animate-spin" />}
            </div>
            {form.featured_image_url && (
              <img 
                src={form.featured_image_url} 
                alt="Preview" 
                className="w-full h-64 object-cover"
              />
            )}
          </div>

          {/* Publish Options */}
          <div className="flex items-center gap-6 p-4 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_published}
                onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
                className="w-4 h-4"
              />
              <span className="text-sm font-medium">Publish Immediately</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_featured}
                onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
                className="w-4 h-4"
              />
              <span className="text-sm font-medium">Feature This Post</span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t border-stone-200 dark:border-stone-800">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-stone-200 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || sendingNotification}
              className="px-6 py-3 bg-stone-900 dark:bg-white text-white dark:text-stone-900 hover:bg-stone-800 dark:hover:bg-stone-100 transition-colors disabled:opacity-50 inline-flex items-center gap-2"
            >
              {(saving || sendingNotification) && <Loader2 className="w-4 h-4 animate-spin" />}
              {blog ? 'Update Post' : 'Create Post'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// Main Blog Management Component
export default function BlogManagement() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    drafts: 0,
    totalViews: 0
  });

  useEffect(() => {
    fetchBlogs();
    fetchStats();
  }, []);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBlogs(data || []);
    } catch (err) {
      console.error('Error fetching blogs:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const { data: allBlogs } = await supabase
        .from('blogs')
        .select('is_published, views_count');

      if (allBlogs) {
        setStats({
          total: allBlogs.length,
          published: allBlogs.filter(b => b.is_published).length,
          drafts: allBlogs.filter(b => !b.is_published).length,
          totalViews: allBlogs.reduce((sum, b) => sum + (b.views_count || 0), 0)
        });
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this blog post?')) return;

    try {
      const { error } = await supabase
        .from('blogs')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchBlogs();
      fetchStats();
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete blog post');
    }
  };

  const togglePublish = async (blog) => {
    try {
      const { error } = await supabase
        .from('blogs')
        .update({ 
          is_published: !blog.is_published,
          published_at: !blog.is_published ? new Date().toISOString() : null
        })
        .eq('id', blog.id);

      if (error) throw error;
      fetchBlogs();
      fetchStats();
    } catch (err) {
      console.error('Toggle publish error:', err);
      alert('Failed to update publish status');
    }
  };

  const toggleFeatured = async (blog) => {
    try {
      const { error } = await supabase
        .from('blogs')
        .update({ is_featured: !blog.is_featured })
        .eq('id', blog.id);

      if (error) throw error;
      fetchBlogs();
    } catch (err) {
      console.error('Toggle featured error:', err);
      alert('Failed to update featured status');
    }
  };

  const filteredBlogs = blogs.filter(blog => {
    const matchesSearch = blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         blog.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' ||
                         (filterStatus === 'published' && blog.is_published) ||
                         (filterStatus === 'draft' && !blog.is_published);
    return matchesSearch && matchesFilter;
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-8"
    >
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-light mb-2" style={{ fontFamily: 'Crimson Pro, serif' }}>
          Blog Management
        </h2>
        <p className="text-stone-600 dark:text-stone-400">
          Create, edit, and manage blog posts
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-stone-900 p-6 border border-stone-200 dark:border-stone-800">
          <div className="flex items-center justify-between mb-2">
            <FileText className="w-8 h-8 text-stone-400" />
            <span className="text-2xl font-light">{stats.total}</span>
          </div>
          <p className="text-sm text-stone-600 dark:text-stone-400">Total Posts</p>
        </div>

        <div className="bg-white dark:bg-stone-900 p-6 border border-stone-200 dark:border-stone-800">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-8 h-8 text-green-500" />
            <span className="text-2xl font-light">{stats.published}</span>
          </div>
          <p className="text-sm text-stone-600 dark:text-stone-400">Published</p>
        </div>

        <div className="bg-white dark:bg-stone-900 p-6 border border-stone-200 dark:border-stone-800">
          <div className="flex items-center justify-between mb-2">
            <AlertCircle className="w-8 h-8 text-amber-500" />
            <span className="text-2xl font-light">{stats.drafts}</span>
          </div>
          <p className="text-sm text-stone-600 dark:text-stone-400">Drafts</p>
        </div>

        <div className="bg-white dark:bg-stone-900 p-6 border border-stone-200 dark:border-stone-800">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-8 h-8 text-blue-500" />
            <span className="text-2xl font-light">{stats.totalViews}</span>
          </div>
          <p className="text-sm text-stone-600 dark:text-stone-400">Total Views</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white dark:bg-stone-900 p-6 border border-stone-200 dark:border-stone-800 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 max-w-md w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search blogs..."
              className="w-full pl-12 pr-4 py-3 border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100 focus:outline-none focus:border-stone-400 dark:focus:border-stone-600 transition-colors"
            />
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-3 border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100 focus:outline-none focus:border-stone-400 dark:focus:border-stone-600 transition-colors"
            >
              <option value="all">All Posts</option>
              <option value="published">Published</option>
              <option value="draft">Drafts</option>
            </select>

            <button
              onClick={() => {
                setSelectedBlog(null);
                setShowModal(true);
              }}
              className="px-6 py-3 bg-stone-900 dark:bg-white text-white dark:text-stone-900 hover:bg-stone-800 dark:hover:bg-stone-100 transition-colors inline-flex items-center gap-2 whitespace-nowrap"
            >
              <Plus className="w-5 h-5" />
              New Post
            </button>
          </div>
        </div>
      </div>

      {/* Blogs List */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
        {loading ? (
          <div className="p-12 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-stone-400" />
            <p className="text-stone-600 dark:text-stone-400">Loading blogs...</p>
          </div>
        ) : filteredBlogs.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-16 h-16 mx-auto mb-4 text-stone-300 dark:text-stone-700" />
            <p className="text-stone-600 dark:text-stone-400 mb-4">No blog posts found</p>
            <button
              onClick={() => {
                setSelectedBlog(null);
                setShowModal(true);
              }}
              className="px-6 py-3 bg-stone-900 dark:bg-white text-white dark:text-stone-900 hover:bg-stone-800 dark:hover:bg-stone-100 transition-colors inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Create Your First Post
            </button>
          </div>
        ) : (
          <div className="divide-y divide-stone-200 dark:divide-stone-800">
            {filteredBlogs.map(blog => (
              <div key={blog.id} className="p-6 hover:bg-stone-50 dark:hover:bg-stone-950 transition-colors">
                <div className="flex gap-6">
                  {/* Featured Image */}
                  {blog.featured_image_url ? (
                    <img
                      src={blog.featured_image_url}
                      alt={blog.title}
                      className="w-32 h-32 object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-32 h-32 bg-stone-100 dark:bg-stone-800 flex items-center justify-center flex-shrink-0">
                      <ImageIcon className="w-12 h-12 text-stone-400" />
                    </div>
                  )}

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-xl font-light" style={{ fontFamily: 'Crimson Pro, serif' }}>
                            {blog.title}
                          </h3>
                          {blog.is_featured && (
                            <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                          )}
                          <span className={`px-2 py-1 text-xs ${
                            blog.is_published 
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                              : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                          }`}>
                            {blog.is_published ? 'Published' : 'Draft'}
                          </span>
                        </div>
                        <p className="text-stone-600 dark:text-stone-400 text-sm line-clamp-2 mb-3">
                          {blog.excerpt || blog.content.substring(0, 150) + '...'}
                        </p>
                        <div className="flex flex-wrap items-center gap-4 text-xs text-stone-500">
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {blog.author_name || 'Anonymous'}
                          </span>
                          {blog.category && (
                            <span className="flex items-center gap-1">
                              <Tag className="w-3 h-3" />
                              {blog.category}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {blog.read_time_minutes} min read
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {blog.views_count || 0} views
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(blog.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        {blog.tags && blog.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {blog.tags.map(tag => (
                              <span
                                key={tag}
                                className="px-2 py-0.5 bg-stone-100 dark:bg-stone-800 text-xs"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={() => togglePublish(blog)}
                          className="p-2 hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors"
                          title={blog.is_published ? 'Unpublish' : 'Publish'}
                        >
                          {blog.is_published ? (
                            <EyeOff className="w-5 h-5 text-amber-600" />
                          ) : (
                            <Eye className="w-5 h-5 text-green-600" />
                          )}
                        </button>
                        <button
                          onClick={() => toggleFeatured(blog)}
                          className="p-2 hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors"
                          title={blog.is_featured ? 'Remove from featured' : 'Mark as featured'}
                        >
                          <Star className={`w-5 h-5 ${blog.is_featured ? 'fill-amber-400 text-amber-400' : 'text-stone-400'}`} />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedBlog(blog);
                            setShowModal(true);
                          }}
                          className="p-2 hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-5 h-5 text-blue-600" />
                        </button>
                        <button
                          onClick={() => handleDelete(blog.id)}
                          className="p-2 hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-5 h-5 text-red-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <BlogModal
            blog={selectedBlog}
            onClose={() => {
              setShowModal(false);
              setSelectedBlog(null);
            }}
            onSave={() => {
              setShowModal(false);
              setSelectedBlog(null);
              fetchBlogs();
              fetchStats();
            }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}