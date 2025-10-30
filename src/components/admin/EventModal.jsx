// src/components/admin/EventModal.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Loader2, Upload } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

export default function EventModal({ event, onClose, onSave }) {
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState(event || {
    title: '',
    description: '',
    date: '',
    start_time: '',
    end_time: '',
    location: '',
    capacity: 50,
    price: 0,
    is_free: true,
    category: 'General',
    image_url: '',
    duration_minutes: 120,
    requirements: '',
    cancellation_policy: '7 days full refund',
    event_type: 'in-person'
  });

  const handleImageUpload = async (file) => {
    if (!file) return;

    try {
      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
      const filePath = `events/${fileName}`;

      const { data, error } = await supabase.storage
        .from('event-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('event-images')
        .getPublicUrl(filePath);

      setForm(prev => ({ ...prev, image_url: publicUrl }));
    } catch (err) {
      console.error('Upload error:', err);
      alert('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = {
        title: form.title,
        description: form.description,
        date: form.date || null,
        start_time: form.start_time || null,
        end_time: form.end_time || null,
        location: form.location || null,
        capacity: Number(form.capacity) || 50,
        available_spots: Number(form.capacity) || 50,
        image_url: form.image_url || null,
        price: form.is_free ? 0 : Number(form.price) || 0,
        is_free: Boolean(form.is_free),
        duration_minutes: Number(form.duration_minutes) || 120,
        requirements: form.requirements || null,
        cancellation_policy: form.cancellation_policy || '7 days full refund',
        event_type: form.event_type || 'in-person',
        category: form.category || 'General'
      };

      if (event?.id) {
        // Update existing event
        const { error } = await supabase
          .from('events')
          .update(payload)
          .eq('id', event.id);

        if (error) throw error;
      } else {
        // Create new event
        const { error } = await supabase
          .from('events')
          .insert([payload]);

        if (error) throw error;
      }

      onSave();
    } catch (err) {
      console.error('Save error:', err);
      alert(err.message || 'Failed to save event');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-stone-900 rounded-2xl w-full max-w-2xl p-8 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-light" style={{ fontFamily: 'Crimson Pro, serif' }}>
            {event ? 'Edit Event' : 'Create New Event'}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Title *</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-4 py-2 border border-stone-200 dark:border-stone-800 rounded-lg bg-white dark:bg-stone-950 focus:outline-none focus:ring-2 focus:ring-stone-400"
                placeholder="Event title"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-4 py-2 border border-stone-200 dark:border-stone-800 rounded-lg bg-white dark:bg-stone-950 focus:outline-none focus:ring-2 focus:ring-stone-400"
              >
                <option>General</option>
                <option>Conversations</option>
                <option>Workshops</option>
                <option>Retreats</option>
                <option>Gatherings</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 border border-stone-200 dark:border-stone-800 rounded-lg bg-white dark:bg-stone-950 focus:outline-none focus:ring-2 focus:ring-stone-400"
              placeholder="Event description"
            />
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Date *</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full px-4 py-2 border border-stone-200 dark:border-stone-800 rounded-lg bg-white dark:bg-stone-950 focus:outline-none focus:ring-2 focus:ring-stone-400"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Start Time</label>
              <input
                type="time"
                value={form.start_time}
                onChange={(e) => setForm({ ...form, start_time: e.target.value })}
                className="w-full px-4 py-2 border border-stone-200 dark:border-stone-800 rounded-lg bg-white dark:bg-stone-950 focus:outline-none focus:ring-2 focus:ring-stone-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">End Time</label>
              <input
                type="time"
                value={form.end_time}
                onChange={(e) => setForm({ ...form, end_time: e.target.value })}
                className="w-full px-4 py-2 border border-stone-200 dark:border-stone-800 rounded-lg bg-white dark:bg-stone-950 focus:outline-none focus:ring-2 focus:ring-stone-400"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Location</label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                className="w-full px-4 py-2 border border-stone-200 dark:border-stone-800 rounded-lg bg-white dark:bg-stone-950 focus:outline-none focus:ring-2 focus:ring-stone-400"
                placeholder="Event location"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Capacity</label>
              <input
                type="number"
                value={form.capacity}
                onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                min="1"
                className="w-full px-4 py-2 border border-stone-200 dark:border-stone-800 rounded-lg bg-white dark:bg-stone-950 focus:outline-none focus:ring-2 focus:ring-stone-400"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Price (ZAR)</label>
              <input
                type="number"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                min="0"
                disabled={form.is_free}
                className="w-full px-4 py-2 border border-stone-200 dark:border-stone-800 rounded-lg bg-white dark:bg-stone-950 focus:outline-none focus:ring-2 focus:ring-stone-400 disabled:opacity-50"
              />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_free}
                  onChange={(e) => setForm({ ...form, is_free: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium">Free Event</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Event Image</label>
            <div className="flex items-center gap-4">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e.target.files[0])}
                className="flex-1 text-sm"
                disabled={uploading}
              />
              {uploading && <Loader2 className="w-5 h-5 animate-spin" />}
            </div>
            {form.image_url && (
              <img 
                src={form.image_url} 
                alt="Preview" 
                className="mt-4 w-full h-48 object-cover rounded-lg"
              />
            )}
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-stone-200 dark:border-stone-800">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-stone-200 dark:border-stone-800 rounded-lg hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-stone-900 dark:bg-white text-white dark:text-stone-900 rounded-lg hover:scale-105 transition-transform disabled:opacity-50 inline-flex items-center gap-2"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {event ? 'Update Event' : 'Create Event'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}