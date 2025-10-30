// src/components/admin/TestimonialsManagement.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Star, Check, Clock, Trash2, Loader2, CheckCircle } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

export default function TestimonialsManagement() {
  const [loading, setLoading] = useState(true);
  const [testimonials, setTestimonials] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');

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
      setTestimonials(data || []);
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
    } catch (err) {
      console.error('Error approving testimonial:', err);
      alert('Failed to approve testimonial');
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
    } catch (err) {
      console.error('Error toggling featured:', err);
      alert('Failed to update featured status');
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete testimonial from ${name}? This cannot be undone.`)) return;

    try {
      const { error } = await supabase
        .from('testimonials')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setTestimonials(testimonials.filter(t => t.id !== id));
    } catch (err) {
      console.error('Error deleting testimonial:', err);
      alert('Failed to delete testimonial');
    }
  };

  const filteredTestimonials = useMemo(() => {
    if (filterStatus === 'all') return testimonials;
    if (filterStatus === 'approved') return testimonials.filter(t => t.is_approved);
    if (filterStatus === 'pending') return testimonials.filter(t => !t.is_approved);
    if (filterStatus === 'featured') return testimonials.filter(t => t.is_featured);
    return testimonials;
  }, [testimonials, filterStatus]);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-stone-400" />
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
      <div className="mb-8">
        <h2 className="text-3xl font-light mb-2" style={{ fontFamily: 'Crimson Pro, serif' }}>
          Testimonials
        </h2>
        <p className="text-stone-600 dark:text-stone-400">Review and manage community testimonials</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {['all', 'approved', 'pending', 'featured'].map(status => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              filterStatus === status
                ? 'bg-stone-900 dark:bg-white text-white dark:text-stone-900'
                : 'bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
            <span className="ml-2 text-xs opacity-70">
              ({status === 'all' ? testimonials.length :
                status === 'approved' ? testimonials.filter(t => t.is_approved).length :
                status === 'pending' ? testimonials.filter(t => !t.is_approved).length :
                testimonials.filter(t => t.is_featured).length})
            </span>
          </button>
        ))}
      </div>

      {/* Testimonials Grid */}
      {filteredTestimonials.length === 0 ? (
        <div className="text-center py-12 text-stone-500">
          No testimonials in this category
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {filteredTestimonials.map(testimonial => (
            <motion.div
              key={testimonial.id}
              layout
              className="bg-white dark:bg-stone-900 rounded-2xl p-6 border border-stone-200 dark:border-stone-800"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-rose-500 rounded-full flex items-center justify-center text-white font-medium text-sm flex-shrink-0">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-medium">{testimonial.name}</h3>
                    <p className="text-sm text-stone-600 dark:text-stone-400">{testimonial.role}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  {Array(testimonial.rating || 5).fill(0).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
              </div>

              <p className="text-stone-600 dark:text-stone-300 mb-4 leading-relaxed">
                "{testimonial.testimonial}"
              </p>

              <div className="flex items-center gap-2 mb-4">
                {testimonial.is_approved ? (
                  <span className="px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400 rounded-full text-xs font-medium inline-flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Approved
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400 rounded-full text-xs font-medium inline-flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Pending
                  </span>
                )}
                {testimonial.is_featured && (
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400 rounded-full text-xs font-medium inline-flex items-center gap-1">
                    <Star className="w-3 h-3" /> Featured
                  </span>
                )}
              </div>

              <div className="flex gap-2 pt-4 border-t border-stone-200 dark:border-stone-800">
                {!testimonial.is_approved && (
                  <button 
                    onClick={() => handleApprove(testimonial.id)}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors inline-flex items-center justify-center gap-2 text-sm font-medium"
                  >
                    <Check className="w-4 h-4" /> Approve
                  </button>
                )}
                <button 
                  onClick={() => handleToggleFeatured(testimonial.id, testimonial.is_featured)}
                  className="flex-1 px-4 py-2 border border-stone-200 dark:border-stone-800 rounded-lg hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors text-sm font-medium"
                >
                  {testimonial.is_featured ? 'Unfeature' : 'Feature'}
                </button>
                <button 
                  onClick={() => handleDelete(testimonial.id, testimonial.name)}
                  className="px-4 py-2 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-4 text-xs text-stone-500">
                Submitted {new Date(testimonial.created_at).toLocaleDateString()}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}