import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Star, Check, Clock, Trash2, Loader2, CheckCircle, 
  XCircle, Search, Filter, Download, Edit2, Eye,
  TrendingUp, Users, Award, MessageSquare, BarChart3,
  Calendar, ArrowUpRight, RefreshCw, Sparkles, Heart,
  Share2, Mail, Globe, Target, Activity, Crown, AlertCircle,
  X, Plus, Zap
} from 'lucide-react';
import { supabase } from '../../../lib/supabase';

export default function TestimonialsManagement() {
  const [loading, setLoading] = useState(true);
  const [testimonials, setTestimonials] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedTestimonials, setSelectedTestimonials] = useState([]);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [selectedTestimonial, setSelectedTestimonial] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    featured: 0,
    avgRating: 0
  });

  useEffect(() => {
    loadTestimonials();
  }, []);

  const loadTestimonials = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const testimonialsData = data || [];
      setTestimonials(testimonialsData);

      // Calculate stats
      const avgRating = testimonialsData.length > 0
        ? testimonialsData.reduce((sum, t) => sum + (Number(t.rating) || 5), 0) / testimonialsData.length
        : 0;

      setStats({
        total: testimonialsData.length,
        approved: testimonialsData.filter(t => t.is_approved).length,
        pending: testimonialsData.filter(t => !t.is_approved).length,
        featured: testimonialsData.filter(t => t.is_featured).length,
        avgRating
      });
    } catch (err) {
      console.error('Error loading testimonials:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      const { error } = await supabase
        .from('testimonials')
        .update({ is_approved: true, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;

      setTestimonials(testimonials.map(t => 
        t.id === id ? { ...t, is_approved: true } : t
      ));
      loadTestimonials();
    } catch (err) {
      console.error('Error approving testimonial:', err);
      alert('Failed to approve testimonial');
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm('Reject this testimonial? You can approve it later.')) return;

    try {
      const { error } = await supabase
        .from('testimonials')
        .update({ is_approved: false, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;

      setTestimonials(testimonials.map(t => 
        t.id === id ? { ...t, is_approved: false } : t
      ));
      loadTestimonials();
    } catch (err) {
      console.error('Error rejecting testimonial:', err);
      alert('Failed to reject testimonial');
    }
  };

  const handleToggleFeatured = async (id, currentStatus) => {
    try {
      const { error } = await supabase
        .from('testimonials')
        .update({ is_featured: !currentStatus, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;

      setTestimonials(testimonials.map(t => 
        t.id === id ? { ...t, is_featured: !currentStatus } : t
      ));
      loadTestimonials();
    } catch (err) {
      console.error('Error toggling featured:', err);
      alert('Failed to update featured status');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete testimonial from ${name}? This cannot be undone.`)) return;

    try {
      const { error } = await supabase
        .from('testimonials')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setTestimonials(testimonials.filter(t => t.id !== id));
      loadTestimonials();
    } catch (err) {
      console.error('Error deleting testimonial:', err);
      alert('Failed to delete testimonial');
    }
  };

  const handleBulkApprove = async () => {
    try {
      const { error } = await supabase
        .from('testimonials')
        .update({ is_approved: true, updated_at: new Date().toISOString() })
        .in('id', selectedTestimonials);

      if (error) throw error;

      setSelectedTestimonials([]);
      loadTestimonials();
    } catch (err) {
      console.error('Error bulk approving:', err);
      alert('Failed to approve testimonials');
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Delete ${selectedTestimonials.length} testimonials? This cannot be undone.`)) return;

    try {
      const { error } = await supabase
        .from('testimonials')
        .delete()
        .in('id', selectedTestimonials);

      if (error) throw error;

      setSelectedTestimonials([]);
      loadTestimonials();
    } catch (err) {
      console.error('Error bulk deleting:', err);
      alert('Failed to delete testimonials');
    }
  };

  const handleExport = () => {
    const csv = [
      ['Name', 'Role', 'Rating', 'Testimonial', 'Status', 'Featured', 'Date'].join(','),
      ...filteredTestimonials.map(t => [
        t.name || '',
        t.role || '',
        t.rating || 5,
        `"${(t.testimonial || '').replace(/"/g, '""')}"`,
        t.is_approved ? 'Approved' : 'Pending',
        t.is_featured ? 'Yes' : 'No',
        new Date(t.created_at).toLocaleDateString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `testimonials-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const filteredTestimonials = useMemo(() => {
    let filtered = testimonials;

    // Filter by status
    if (filterStatus === 'approved') filtered = filtered.filter(t => t.is_approved);
    else if (filterStatus === 'pending') filtered = filtered.filter(t => !t.is_approved);
    else if (filterStatus === 'featured') filtered = filtered.filter(t => t.is_featured);

    // Search
    if (searchQuery) {
      filtered = filtered.filter(t =>
        t.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.role?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.testimonial?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort
    switch(sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        break;
      case 'rating-high':
        filtered.sort((a, b) => (b.rating || 5) - (a.rating || 5));
        break;
      case 'rating-low':
        filtered.sort((a, b) => (a.rating || 5) - (b.rating || 5));
        break;
      case 'name':
        filtered.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        break;
    }

    return filtered;
  }, [testimonials, filterStatus, searchQuery, sortBy]);

  const TestimonialCard = ({ testimonial }) => (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="feature-card p-6 hover:shadow-lg transition-all"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-rose-500 rounded-full flex items-center justify-center text-white font-light text-lg flex-shrink-0">
            {testimonial.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-light text-lg text-stone-900 dark:text-stone-50 truncate" style={{ fontFamily: 'Crimson Pro, serif' }}>
              {testimonial.name}
            </h3>
            <p className="text-sm text-stone-600 dark:text-stone-400 truncate font-light">
              {testimonial.role || 'Community Member'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={selectedTestimonials.includes(testimonial.id)}
            onChange={(e) => {
              e.stopPropagation();
              setSelectedTestimonials(prev => 
                prev.includes(testimonial.id)
                  ? prev.filter(id => id !== testimonial.id)
                  : [...prev, testimonial.id]
              );
            }}
            className="w-4 h-4"
          />
        </div>
      </div>

      {/* Rating */}
      <div className="flex gap-1 mb-4">
        {Array(5).fill(0).map((_, i) => (
          <Star 
            key={i} 
            className={`w-5 h-5 ${
              i < (testimonial.rating || 5) 
                ? 'fill-amber-400 text-amber-400' 
                : 'text-stone-300 dark:text-stone-700'
            }`}
            strokeWidth={1.5}
          />
        ))}
        <span className="ml-2 text-sm text-stone-600 dark:text-stone-400 font-light">
          {testimonial.rating || 5}/5
        </span>
      </div>

      {/* Testimonial Text */}
      <p className="text-stone-600 dark:text-stone-300 mb-4 leading-relaxed font-light line-clamp-4">
        "{testimonial.testimonial}"
      </p>

      {/* Badges */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        {testimonial.is_approved ? (
          <span className="px-3 py-1 bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400 text-xs font-light inline-flex items-center gap-1">
            <CheckCircle className="w-3 h-3" strokeWidth={1.5} /> Approved
          </span>
        ) : (
          <span className="px-3 py-1 bg-yellow-100 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400 text-xs font-light inline-flex items-center gap-1">
            <Clock className="w-3 h-3" strokeWidth={1.5} /> Pending
          </span>
        )}
        {testimonial.is_featured && (
          <span className="px-3 py-1 bg-purple-100 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400 text-xs font-light inline-flex items-center gap-1">
            <Crown className="w-3 h-3" strokeWidth={1.5} /> Featured
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-4 border-t border-stone-200 dark:border-stone-700">
        {!testimonial.is_approved ? (
          <button 
            onClick={() => handleApprove(testimonial.id)}
            className="flex-1 px-4 py-2 bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-950/50 transition-colors inline-flex items-center justify-center gap-2 text-sm font-light"
          >
            <Check className="w-4 h-4" strokeWidth={1.5} /> Approve
          </button>
        ) : (
          <button 
            onClick={() => handleReject(testimonial.id)}
            className="flex-1 px-4 py-2 bg-yellow-100 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400 hover:bg-yellow-200 dark:hover:bg-yellow-950/50 transition-colors inline-flex items-center justify-center gap-2 text-sm font-light"
          >
            <XCircle className="w-4 h-4" strokeWidth={1.5} /> Unapprove
          </button>
        )}
        <button 
          onClick={() => handleToggleFeatured(testimonial.id, testimonial.is_featured)}
          className={`flex-1 px-4 py-2 transition-colors text-sm font-light inline-flex items-center justify-center gap-2 ${
            testimonial.is_featured
              ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400 hover:bg-purple-200 dark:hover:bg-purple-950/50'
              : 'border border-stone-300 dark:border-stone-600 hover:border-stone-900 dark:hover:border-stone-300'
          }`}
        >
          <Star className="w-4 h-4" strokeWidth={1.5} />
          {testimonial.is_featured ? 'Unfeature' : 'Feature'}
        </button>
        <button 
          onClick={() => {
            setSelectedTestimonial(testimonial);
            setShowDetailModal(true);
          }}
          className="px-4 py-2 border border-stone-300 dark:border-stone-600 hover:border-stone-900 dark:hover:border-stone-300 transition-colors"
        >
          <Eye className="w-4 h-4" strokeWidth={1.5} />
        </button>
        <button 
          onClick={() => handleDelete(testimonial.id, testimonial.name)}
          className="px-4 py-2 border border-red-300 dark:border-red-600 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
        >
          <Trash2 className="w-4 h-4" strokeWidth={1.5} />
        </button>
      </div>

      <div className="mt-4 text-xs text-stone-500 dark:text-stone-500 font-light">
        Submitted {new Date(testimonial.created_at).toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric', 
          year: 'numeric' 
        })}
      </div>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-stone-400" strokeWidth={1.5} />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="p-8"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-4xl font-light mb-2 text-stone-900 dark:text-stone-50" style={{ fontFamily: 'Crimson Pro, serif' }}>
            Testimonials <span className="elegant-text">Management</span>
          </h2>
          <p className="text-stone-600 dark:text-stone-400 font-light">
            Review and showcase community feedback
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowAnalytics(!showAnalytics)}
            className="px-6 py-3 border border-stone-300 dark:border-stone-600 hover:border-stone-900 dark:hover:border-stone-300 transition-colors inline-flex items-center gap-2 font-light"
          >
            <BarChart3 className="w-5 h-5" strokeWidth={1.5} />
            Analytics
          </button>
          <button
            onClick={loadTestimonials}
            className="px-6 py-3 border border-stone-300 dark:border-stone-600 hover:border-stone-900 dark:hover:border-stone-300 transition-colors inline-flex items-center gap-2 font-light"
          >
            <RefreshCw className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* Analytics */}
      <AnimatePresence>
        {showAnalytics && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-8"
          >
            <div className="grid md:grid-cols-5 gap-6">
              <div className="feature-card p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="icon-elegant bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400">
                    <MessageSquare className="w-6 h-6" strokeWidth={1.5} />
                  </div>
                </div>
                <div className="text-3xl font-light text-stone-900 dark:text-stone-50 mb-1" style={{ fontFamily: 'Crimson Pro, serif' }}>
                  {stats.total}
                </div>
                <div className="text-sm text-stone-600 dark:text-stone-400 font-light">Total Testimonials</div>
              </div>

              <div className="feature-card p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="icon-elegant bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-400">
                    <CheckCircle className="w-6 h-6" strokeWidth={1.5} />
                  </div>
                </div>
                <div className="text-3xl font-light text-stone-900 dark:text-stone-50 mb-1" style={{ fontFamily: 'Crimson Pro, serif' }}>
                  {stats.approved}
                </div>
                <div className="text-sm text-stone-600 dark:text-stone-400 font-light">Approved</div>
              </div>

              <div className="feature-card p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="icon-elegant bg-yellow-100 dark:bg-yellow-950/30 text-yellow-700 dark:text-yellow-400">
                    <Clock className="w-6 h-6" strokeWidth={1.5} />
                  </div>
                </div>
                <div className="text-3xl font-light text-stone-900 dark:text-stone-50 mb-1" style={{ fontFamily: 'Crimson Pro, serif' }}>
                  {stats.pending}
                </div>
                <div className="text-sm text-stone-600 dark:text-stone-400 font-light">Pending Review</div>
              </div>

              <div className="feature-card p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="icon-elegant bg-purple-100 dark:bg-purple-950/30 text-purple-700 dark:text-purple-400">
                    <Crown className="w-6 h-6" strokeWidth={1.5} />
                  </div>
                </div>
                <div className="text-3xl font-light text-stone-900 dark:text-stone-50 mb-1" style={{ fontFamily: 'Crimson Pro, serif' }}>
                  {stats.featured}
                </div>
                <div className="text-sm text-stone-600 dark:text-stone-400 font-light">Featured</div>
              </div>

              <div className="feature-card p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="icon-elegant bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400">
                    <Star className="w-6 h-6" strokeWidth={1.5} />
                  </div>
                </div>
                <div className="text-3xl font-light text-stone-900 dark:text-stone-50 mb-1" style={{ fontFamily: 'Crimson Pro, serif' }}>
                  {stats.avgRating.toFixed(1)}
                </div>
                <div className="text-sm text-stone-600 dark:text-stone-400 font-light">Avg Rating</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bulk Actions Bar */}
      <AnimatePresence>
        {selectedTestimonials.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="feature-card p-4 mb-6 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" strokeWidth={1.5} />
              <span className="font-light text-stone-900 dark:text-stone-50">
                {selectedTestimonials.length} testimonial{selectedTestimonials.length > 1 ? 's' : ''} selected
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleBulkApprove}
                className="px-4 py-2 bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-950/50 transition-colors font-light text-sm inline-flex items-center gap-2"
              >
                <Check className="w-4 h-4" strokeWidth={1.5} />
                Approve All
              </button>
              <button
                onClick={handleBulkDelete}
                className="px-4 py-2 border border-red-300 dark:border-red-600 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors font-light text-sm inline-flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                Delete
              </button>
              <button
                onClick={() => setSelectedTestimonials([])}
                className="px-4 py-2 border border-stone-300 dark:border-stone-600 hover:border-stone-900 dark:hover:border-stone-300 transition-colors font-light text-sm"
              >
                Clear
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {['all', 'approved', 'pending', 'featured'].map(status => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 font-light text-sm transition-colors ${
              filterStatus === status
                ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900'
                : 'border border-stone-300 dark:border-stone-600 hover:border-stone-900 dark:hover:border-stone-300'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
            <span className="ml-2 text-xs opacity-70">
              ({status === 'all' ? stats.total :
                status === 'approved' ? stats.approved :
                status === 'pending' ? stats.pending :
                stats.featured})
            </span>
          </button>
        ))}
      </div>

      {/* Search and Sort */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" strokeWidth={1.5} />
          <input
            type="text"
            placeholder="Search testimonials by name, role, or content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-none focus:outline-none focus:border-amber-700 dark:focus:border-amber-500 transition-colors font-light"
          />
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-3 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-none focus:outline-none focus:border-amber-700 dark:focus:border-amber-500 transition-colors font-light"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="rating-high">Highest Rating</option>
          <option value="rating-low">Lowest Rating</option>
          <option value="name">Name A-Z</option>
        </select>
        <button
          onClick={handleExport}
          className="px-4 py-3 border border-stone-300 dark:border-stone-600 hover:border-stone-900 dark:hover:border-stone-300 transition-colors font-light inline-flex items-center gap-2"
        >
          <Download className="w-5 h-5" strokeWidth={1.5} />
        </button>
      </div>

      {/* Testimonials Grid */}
      {filteredTestimonials.length === 0 ? (
        <div className="feature-card p-12 text-center">
          <MessageSquare className="w-12 h-12 text-stone-300 dark:text-stone-600 mx-auto mb-4" strokeWidth={1.5} />
          <p className="text-stone-500 dark:text-stone-400 font-light">
            {searchQuery || filterStatus !== 'all'
              ? 'No testimonials match your filters'
              : 'No testimonials yet'}
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {filteredTestimonials.map(testimonial => (
            <TestimonialCard key={testimonial.id} testimonial={testimonial} />
          ))}
        </div>
      )}

      {/* Results Summary */}
      {filteredTestimonials.length > 0 && (
        <div className="mt-8 text-center">
          <p className="text-sm text-stone-600 dark:text-stone-400 font-light">
            Showing {filteredTestimonials.length} of {testimonials.length} testimonials
          </p>
        </div>
      )}

      {/* Detail Modal */}
      <AnimatePresence>
        {showDetailModal && selectedTestimonial && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-stone-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowDetailModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-stone-900 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-3xl font-light text-stone-900 dark:text-stone-50" style={{ fontFamily: 'Crimson Pro, serif' }}>
                    Testimonial <span className="elegant-text">Details</span>
                  </h3>
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="p-2 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                  >
                    <X className="w-5 h-5" strokeWidth={1.5} />
                  </button>
                </div>

                <div className="elegant-divider mb-8"></div>

                <div className="flex items-start gap-6 mb-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-amber-500 to-rose-500 rounded-full flex items-center justify-center text-white font-light text-3xl flex-shrink-0">
                    {selectedTestimonial.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-2xl font-light text-stone-900 dark:text-stone-50 mb-2" style={{ fontFamily: 'Crimson Pro, serif' }}>
                      {selectedTestimonial.name}
                    </h4>
                    <p className="text-stone-600 dark:text-stone-400 font-light mb-3">
                      {selectedTestimonial.role || 'Community Member'}
                    </p>
                    <div className="flex gap-1 mb-3">
                      {Array(5).fill(0).map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-6 h-6 ${
                            i < (selectedTestimonial.rating || 5) 
                              ? 'fill-amber-400 text-amber-400' 
                              : 'text-stone-300 dark:text-stone-700'
                          }`}
                          strokeWidth={1.5}
                        />
                      ))}
                      <span className="ml-2 text-sm text-stone-600 dark:text-stone-400 font-light">
                        {selectedTestimonial.rating || 5} out of 5
                      </span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {selectedTestimonial.is_approved ? (
                        <span className="px-3 py-1 bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400 text-xs font-light inline-flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" strokeWidth={1.5} /> Approved
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400 text-xs font-light inline-flex items-center gap-1">
                          <Clock className="w-3 h-3" strokeWidth={1.5} /> Pending
                        </span>
                      )}
                      {selectedTestimonial.is_featured && (
                        <span className="px-3 py-1 bg-purple-100 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400 text-xs font-light inline-flex items-center gap-1">
                          <Crown className="w-3 h-3" strokeWidth={1.5} /> Featured
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-6 mb-8">
                  <div>
                    <h5 className="text-sm font-light text-stone-700 dark:text-stone-300 mb-3">Testimonial</h5>
                    <p className="text-stone-600 dark:text-stone-400 font-light leading-relaxed">
                      "{selectedTestimonial.testimonial}"
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h5 className="text-sm font-light text-stone-700 dark:text-stone-300 mb-2">Submitted</h5>
                      <div className="flex items-center gap-2 text-stone-600 dark:text-stone-400 font-light">
                        <Calendar className="w-4 h-4" strokeWidth={1.5} />
                        {new Date(selectedTestimonial.created_at).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </div>
                    </div>
                    {selectedTestimonial.updated_at && (
                      <div>
                        <h5 className="text-sm font-light text-stone-700 dark:text-stone-300 mb-2">Last Updated</h5>
                        <div className="flex items-center gap-2 text-stone-600 dark:text-stone-400 font-light">
                          <Clock className="w-4 h-4" strokeWidth={1.5} />
                          {new Date(selectedTestimonial.updated_at).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="elegant-divider mb-6"></div>

                <div className="flex gap-3">
                  {!selectedTestimonial.is_approved ? (
                    <button
                      onClick={() => {
                        handleApprove(selectedTestimonial.id);
                        setShowDetailModal(false);
                      }}
                      className="flex-1 px-6 py-3 bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-950/50 transition-colors font-light inline-flex items-center justify-center gap-2"
                    >
                      <Check className="w-4 h-4" strokeWidth={1.5} />
                      Approve
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        handleReject(selectedTestimonial.id);
                        setShowDetailModal(false);
                      }}
                      className="flex-1 px-6 py-3 bg-yellow-100 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400 hover:bg-yellow-200 dark:hover:bg-yellow-950/50 transition-colors font-light inline-flex items-center justify-center gap-2"
                    >
                      <XCircle className="w-4 h-4" strokeWidth={1.5} />
                      Unapprove
                    </button>
                  )}
                  <button
                    onClick={() => {
                      handleToggleFeatured(selectedTestimonial.id, selectedTestimonial.is_featured);
                      setShowDetailModal(false);
                    }}
                    className={`flex-1 px-6 py-3 transition-colors font-light inline-flex items-center justify-center gap-2 ${
                      selectedTestimonial.is_featured
                        ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400 hover:bg-purple-200 dark:hover:bg-purple-950/50'
                        : 'border border-stone-300 dark:border-stone-600 hover:border-stone-900 dark:hover:border-stone-300'
                    }`}
                  >
                    <Star className="w-4 h-4" strokeWidth={1.5} />
                    {selectedTestimonial.is_featured ? 'Unfeature' : 'Feature'}
                  </button>
                  <button
                    onClick={() => {
                      handleDelete(selectedTestimonial.id, selectedTestimonial.name);
                      setShowDetailModal(false);
                    }}
                    className="px-6 py-3 border border-red-300 dark:border-red-600 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors font-light inline-flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}