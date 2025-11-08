import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, Clock, MapPin, Users, DollarSign, TrendingUp, 
  Search, Filter, Download, Plus, Edit2, Trash2, Copy,
  CheckCircle, XCircle, AlertCircle, Eye, Send, Mail,
  BarChart3, PieChart, Activity, Target, Zap, Sparkles,
  Upload, Loader2, X, ChevronDown, ChevronUp, Star,
  MessageSquare, Heart, Share2, ExternalLink, FileText,
  Settings, MoreVertical, Repeat, UserPlus, QrCode,
  Tag, Bookmark, TrendingDown, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { supabase } from '../../../lib/supabase';

export default function EventManagement() {
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [selectedEvents, setSelectedEvents] = useState([]);
  const [expandedEvent, setExpandedEvent] = useState(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
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

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (err) {
      console.error('Error loading events:', err);
    } finally {
      setLoading(false);
    }
  };

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

      if (selectedEvent?.id) {
        const { error } = await supabase
          .from('events')
          .update(payload)
          .eq('id', selectedEvent.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('events')
          .insert([payload]);
        if (error) throw error;
      }

      setShowEventModal(false);
      setSelectedEvent(null);
      setForm({
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
      loadEvents();
    } catch (err) {
      console.error('Save error:', err);
      alert(err.message || 'Failed to save event');
    } finally {
      setSaving(false);
    }
  };

  const handleDuplicate = async (event) => {
    try {
      const { id, created_at, updated_at, ...eventData } = event;
      const newEvent = {
        ...eventData,
        title: `${event.title} (Copy)`,
        available_spots: event.capacity
      };
      
      const { error } = await supabase
        .from('events')
        .insert([newEvent]);

      if (error) throw error;
      loadEvents();
    } catch (err) {
      console.error('Error duplicating event:', err);
      alert('Failed to duplicate event');
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Delete ${selectedEvents.length} events?`)) return;
    
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .in('id', selectedEvents);

      if (error) throw error;
      setSelectedEvents([]);
      loadEvents();
    } catch (err) {
      console.error('Error deleting events:', err);
      alert('Failed to delete events');
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('Delete this event?')) return;

    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);

      if (error) throw error;
      loadEvents();
    } catch (err) {
      console.error('Error deleting event:', err);
      alert('Failed to delete event');
    }
  };

  const handleExport = () => {
    const filtered = filteredEvents;

    const csv = [
      ['Title', 'Date', 'Location', 'Capacity', 'Available', 'Price', 'Status'].join(','),
      ...filtered.map(e => [
        e.title,
        e.date || '',
        e.location || '',
        e.capacity || 0,
        e.available_spots || 0,
        e.price || 0,
        e.status || 'active'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `events-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Calculate analytics
  const totalCapacity = events.reduce((sum, e) => sum + (Number(e.capacity) || 0), 0);
  const totalBooked = events.reduce((sum, e) => sum + ((Number(e.capacity) || 0) - (Number(e.available_spots) || Number(e.capacity) || 0)), 0);
  const totalRevenue = events.reduce((sum, e) => {
    const registered = (Number(e.capacity) || 0) - (Number(e.available_spots) || Number(e.capacity) || 0);
    return sum + (registered * (Number(e.price) || 0));
  }, 0);
  const upcomingEvents = events.filter(e => {
    if (!e.date) return false;
    return new Date(e.date) >= new Date();
  }).length;
  const avgCapacityUsed = totalCapacity > 0 ? ((totalBooked / totalCapacity) * 100).toFixed(1) : 0;

  const filteredEvents = events.filter(e => {
    const matchesSearch = (e.title?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
                         (e.description?.toLowerCase() || '').includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || (e.date && new Date(e.date) >= new Date() ? 'upcoming' : 'past') === statusFilter;
    const matchesCategory = categoryFilter === 'all' || e.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const EventCard = ({ event }) => {
    const registered = (Number(event.capacity) || 0) - (Number(event.available_spots) || Number(event.capacity) || 0);
    const eventRevenue = registered * (Number(event.price) || 0);
    const capacityPercentage = event.capacity ? ((registered / event.capacity) * 100) : 0;
    const isPast = event.date ? new Date(event.date) < new Date() : false;

    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="feature-card overflow-hidden hover:shadow-lg transition-all group cursor-pointer"
        onClick={() => setExpandedEvent(expandedEvent === event.id ? null : event.id)}
      >
        {/* Image */}
        <div className="relative h-48 overflow-hidden">
          {event.image_url ? (
            <img 
              src={event.image_url} 
              alt={event.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-stone-200 to-stone-300 dark:from-stone-800 dark:to-stone-900 flex items-center justify-center">
              <Calendar className="w-12 h-12 text-stone-400 dark:text-stone-600" strokeWidth={1.5} />
            </div>
          )}
          <div className="absolute top-4 left-4 flex gap-2">
            <span className={`px-3 py-1 text-xs font-light ${
              isPast
                ? 'bg-stone-100 text-stone-700 dark:bg-stone-950/80 dark:text-stone-400'
                : 'bg-green-100 text-green-700 dark:bg-green-950/80 dark:text-green-400'
            }`}>
              {isPast ? 'Past' : 'Upcoming'}
            </span>
            {event.is_free && (
              <span className="px-3 py-1 text-xs font-light bg-blue-100 text-blue-700 dark:bg-blue-950/80 dark:text-blue-400">
                Free
              </span>
            )}
          </div>
          <div className="absolute top-4 right-4">
            <input
              type="checkbox"
              checked={selectedEvents.includes(event.id)}
              onChange={(e) => {
                e.stopPropagation();
                setSelectedEvents(prev => 
                  prev.includes(event.id)
                    ? prev.filter(id => id !== event.id)
                    : [...prev, event.id]
                );
              }}
              className="w-5 h-5"
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="text-xl font-light text-stone-900 dark:text-stone-50 mb-1" style={{ fontFamily: 'Crimson Pro, serif' }}>
                {event.title}
              </h3>
              <p className="text-sm text-stone-600 dark:text-stone-400 font-light line-clamp-2">
                {event.description || 'No description'}
              </p>
            </div>
          </div>

          {/* Category Badge */}
          {event.category && (
            <div className="mb-4">
              <span className="px-2 py-1 text-xs bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 font-light">
                {event.category}
              </span>
            </div>
          )}

          {/* Meta Info */}
          <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
            <div className="flex items-center gap-2 text-stone-600 dark:text-stone-400">
              <Calendar className="w-4 h-4" strokeWidth={1.5} />
              <span className="font-light">
                {event.date ? new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'No date'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-stone-600 dark:text-stone-400">
              <Clock className="w-4 h-4" strokeWidth={1.5} />
              <span className="font-light">{event.start_time || 'TBA'}</span>
            </div>
            <div className="flex items-center gap-2 text-stone-600 dark:text-stone-400">
              <MapPin className="w-4 h-4" strokeWidth={1.5} />
              <span className="font-light truncate">{event.location || 'TBA'}</span>
            </div>
            <div className="flex items-center gap-2 text-stone-600 dark:text-stone-400">
              <Users className="w-4 h-4" strokeWidth={1.5} />
              <span className="font-light">{registered}/{event.capacity || 0}</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-xs text-stone-600 dark:text-stone-400 mb-1 font-light">
              <span>Capacity</span>
              <span>{capacityPercentage.toFixed(0)}%</span>
            </div>
            <div className="h-2 bg-stone-200 dark:bg-stone-800 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-amber-600 to-amber-500 transition-all duration-500"
                style={{ width: `${Math.min(capacityPercentage, 100)}%` }}
              />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 py-3 border-y border-stone-200 dark:border-stone-700 mb-4">
            <div className="text-center">
              <div className="text-lg font-light text-stone-900 dark:text-stone-50" style={{ fontFamily: 'Crimson Pro, serif' }}>
                R{eventRevenue.toLocaleString()}
              </div>
              <div className="text-xs text-stone-600 dark:text-stone-400 font-light">Revenue</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-light text-stone-900 dark:text-stone-50" style={{ fontFamily: 'Crimson Pro, serif' }}>
                R{(event.price || 0).toLocaleString()}
              </div>
              <div className="text-xs text-stone-600 dark:text-stone-400 font-light">Per ticket</div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedEvent(event);
                setForm({
                  title: event.title || '',
                  description: event.description || '',
                  date: event.date || '',
                  start_time: event.start_time || '',
                  end_time: event.end_time || '',
                  location: event.location || '',
                  capacity: event.capacity || 50,
                  price: event.price || 0,
                  is_free: event.is_free || false,
                  category: event.category || 'General',
                  image_url: event.image_url || '',
                  duration_minutes: event.duration_minutes || 120,
                  requirements: event.requirements || '',
                  cancellation_policy: event.cancellation_policy || '7 days full refund',
                  event_type: event.event_type || 'in-person'
                });
                setShowEventModal(true);
              }}
              className="flex-1 px-4 py-2 border border-stone-300 dark:border-stone-600 hover:border-stone-900 dark:hover:border-stone-300 transition-colors font-light text-sm inline-flex items-center justify-center gap-2"
            >
              <Edit2 className="w-4 h-4" strokeWidth={1.5} />
              Edit
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDuplicate(event);
              }}
              className="flex-1 px-4 py-2 border border-stone-300 dark:border-stone-600 hover:border-stone-900 dark:hover:border-stone-300 transition-colors font-light text-sm inline-flex items-center justify-center gap-2"
            >
              <Copy className="w-4 h-4" strokeWidth={1.5} />
              Duplicate
            </button>
          </div>

          {/* Expanded Details */}
          <AnimatePresence>
            {expandedEvent === event.id && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-4 mt-4 border-t border-stone-200 dark:border-stone-700 space-y-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedEvent(event);
                      setShowEmailModal(true);
                    }}
                    className="w-full px-4 py-2 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 hover:bg-stone-800 dark:hover:bg-stone-200 transition-colors font-light text-sm inline-flex items-center justify-center gap-2"
                  >
                    <Mail className="w-4 h-4" strokeWidth={1.5} />
                    Email {registered} Attendees
                  </button>
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={(e) => e.stopPropagation()}
                      className="px-4 py-2 border border-stone-300 dark:border-stone-600 hover:border-stone-900 dark:hover:border-stone-300 transition-colors font-light text-sm inline-flex items-center justify-center gap-2"
                    >
                      <Share2 className="w-4 h-4" strokeWidth={1.5} />
                      Share
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteEvent(event.id);
                      }}
                      className="px-4 py-2 border border-red-300 dark:border-red-600 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors font-light text-sm inline-flex items-center justify-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                      Delete
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    );
  };

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
            Event <span className="elegant-text">Management</span>
          </h2>
          <p className="text-stone-600 dark:text-stone-400 font-light">
            Orchestrate meaningful gatherings with precision
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
            onClick={() => {
              setSelectedEvent(null);
              setForm({
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
              setShowEventModal(true);
            }}
            className="px-6 py-3 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 hover:bg-stone-800 dark:hover:bg-stone-200 transition-colors inline-flex items-center gap-2 font-light"
          >
            <Plus className="w-5 h-5" strokeWidth={1.5} /> 
            Create Event
          </button>
        </div>
      </div>

      {/* Analytics Dashboard */}
      <AnimatePresence>
        {showAnalytics && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-8"
          >
            <div className="grid md:grid-cols-5 gap-6 mb-6">
              <div className="feature-card p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="icon-elegant">
                    <TrendingUp className="w-6 h-6" strokeWidth={1.5} />
                  </div>
                  <div className="flex items-center gap-1 text-green-600 dark:text-green-400 text-sm font-light">
                    <ArrowUpRight className="w-4 h-4" strokeWidth={1.5} />
                  </div>
                </div>
                <div className="text-3xl font-light text-stone-900 dark:text-stone-50 mb-1" style={{ fontFamily: 'Crimson Pro, serif' }}>
                  R{totalRevenue.toLocaleString()}
                </div>
                <div className="text-sm text-stone-600 dark:text-stone-400 font-light">Total Revenue</div>
              </div>

              <div className="feature-card p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="icon-elegant bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400">
                    <Users className="w-6 h-6" strokeWidth={1.5} />
                  </div>
                </div>
                <div className="text-3xl font-light text-stone-900 dark:text-stone-50 mb-1" style={{ fontFamily: 'Crimson Pro, serif' }}>
                  {totalBooked}
                </div>
                <div className="text-sm text-stone-600 dark:text-stone-400 font-light">Total Bookings</div>
              </div>

              <div className="feature-card p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="icon-elegant bg-purple-100 dark:bg-purple-950/30 text-purple-700 dark:text-purple-400">
                    <Target className="w-6 h-6" strokeWidth={1.5} />
                  </div>
                </div>
                <div className="text-3xl font-light text-stone-900 dark:text-stone-50 mb-1" style={{ fontFamily: 'Crimson Pro, serif' }}>
                  {avgCapacityUsed}%
                </div>
                <div className="text-sm text-stone-600 dark:text-stone-400 font-light">Avg Capacity Used</div>
              </div>

              <div className="feature-card p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="icon-elegant bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-400">
                    <Calendar className="w-6 h-6" strokeWidth={1.5} />
                  </div>
                </div>
                <div className="text-3xl font-light text-stone-900 dark:text-stone-50 mb-1" style={{ fontFamily: 'Crimson Pro, serif' }}>
                  {upcomingEvents}
                </div>
                <div className="text-sm text-stone-600 dark:text-stone-400 font-light">Upcoming Events</div>
              </div>

              <div className="feature-card p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="icon-elegant bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400">
                    <Activity className="w-6 h-6" strokeWidth={1.5} />
                  </div>
                </div>
                <div className="text-3xl font-light text-stone-900 dark:text-stone-50 mb-1" style={{ fontFamily: 'Crimson Pro, serif' }}>
                  {events.length}
                </div>
                <div className="text-sm text-stone-600 dark:text-stone-400 font-light">Total Events</div>
              </div>
            </div>

            {/* Revenue Chart Placeholder */}
{/* Revenue Chart - Real Data */}
<div className="feature-card p-6">
  <div className="flex items-center justify-between mb-6">
    <h3 className="text-xl font-light text-stone-900 dark:text-stone-50" style={{ fontFamily: 'Crimson Pro, serif' }}>
      Revenue <span className="elegant-text">Overview</span>
    </h3>
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 bg-gradient-to-t from-amber-600 to-amber-500"></div>
        <span className="text-xs text-stone-600 dark:text-stone-400 font-light">Actual</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 bg-stone-200 dark:bg-stone-700"></div>
        <span className="text-xs text-stone-600 dark:text-stone-400 font-light">Potential</span>
      </div>
    </div>
  </div>
  
  {(() => {
    // Generate last 12 months
    const months = [];
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        year: date.getFullYear(),
        monthIndex: date.getMonth(),
        yearMonth: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      });
    }

    // Calculate revenue per month from real events
    const monthlyData = months.map(m => {
      const monthEvents = events.filter(e => {
        if (!e.date) return false;
        const eventDate = new Date(e.date);
        return eventDate.getFullYear() === m.year && 
               eventDate.getMonth() === m.monthIndex;
      });

      const actualRevenue = monthEvents.reduce((sum, e) => {
        const registered = (Number(e.capacity) || 0) - (Number(e.available_spots) || Number(e.capacity) || 0);
        return sum + (registered * (Number(e.price) || 0));
      }, 0);

      const potentialRevenue = monthEvents.reduce((sum, e) => {
        return sum + ((Number(e.capacity) || 0) * (Number(e.price) || 0));
      }, 0);
      
      return { ...m, actualRevenue, potentialRevenue, eventCount: monthEvents.length };
    });

    const maxRevenue = Math.max(...monthlyData.map(m => m.potentialRevenue), 1);
    const totalActual = monthlyData.reduce((sum, m) => sum + m.actualRevenue, 0);
    const totalPotential = monthlyData.reduce((sum, m) => sum + m.potentialRevenue, 0);

    return (
      <>
        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="text-center p-4 bg-stone-50 dark:bg-stone-950">
            <div className="text-2xl font-light text-stone-900 dark:text-stone-50 mb-1" style={{ fontFamily: 'Crimson Pro, serif' }}>
              R{totalActual.toLocaleString()}
            </div>
            <div className="text-xs text-stone-600 dark:text-stone-400 font-light">Total Earned</div>
          </div>
          <div className="text-center p-4 bg-stone-50 dark:bg-stone-950">
            <div className="text-2xl font-light text-stone-900 dark:text-stone-50 mb-1" style={{ fontFamily: 'Crimson Pro, serif' }}>
              R{totalPotential.toLocaleString()}
            </div>
            <div className="text-xs text-stone-600 dark:text-stone-400 font-light">Total Potential</div>
          </div>
          <div className="text-center p-4 bg-stone-50 dark:bg-stone-950">
            <div className="text-2xl font-light text-stone-900 dark:text-stone-50 mb-1" style={{ fontFamily: 'Crimson Pro, serif' }}>
              {totalPotential > 0 ? ((totalActual / totalPotential) * 100).toFixed(0) : 0}%
            </div>
            <div className="text-xs text-stone-600 dark:text-stone-400 font-light">Conversion Rate</div>
          </div>
          <div className="text-center p-4 bg-stone-50 dark:bg-stone-950">
            <div className="text-2xl font-light text-stone-900 dark:text-stone-50 mb-1" style={{ fontFamily: 'Crimson Pro, serif' }}>
              {events.length}
            </div>
            <div className="text-xs text-stone-600 dark:text-stone-400 font-light">Total Events</div>
          </div>
        </div>

        <div className="h-64 flex items-end justify-between gap-2 mb-4">
          {monthlyData.map((data, i) => {
            const potentialHeight = maxRevenue > 0 ? (data.potentialRevenue / maxRevenue) * 100 : 0;
            const actualHeight = maxRevenue > 0 ? (data.actualRevenue / maxRevenue) * 100 : 0;
            
            return (
              <div key={i} className="flex-1 group cursor-pointer relative flex flex-col justify-end h-full">
                {/* Potential Revenue (background) */}
                <div 
                  className="absolute bottom-0 left-0 right-0 bg-stone-200 dark:bg-stone-700 transition-all"
                  style={{ height: `${Math.max(potentialHeight, 2)}%` }}
                />
                
                {/* Actual Revenue (foreground) */}
                <div 
                  className="relative bg-gradient-to-t from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 transition-all"
                  style={{ height: `${Math.max(actualHeight, data.eventCount > 0 ? 2 : 0)}%` }}
                >
                  {/* Tooltip on hover */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                    <div className="bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 px-3 py-2 text-xs font-light whitespace-nowrap shadow-lg">
                      <div className="font-medium mb-1">{data.month} {data.year}</div>
                      <div className="space-y-0.5">
                        <div>Earned: R{data.actualRevenue.toLocaleString()}</div>
                        <div>Potential: R{data.potentialRevenue.toLocaleString()}</div>
                        <div className="text-stone-400 dark:text-stone-600">{data.eventCount} event{data.eventCount !== 1 ? 's' : ''}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Month labels */}
        <div className="flex items-center justify-between text-xs text-stone-600 dark:text-stone-400 font-light mb-6">
          {monthlyData.map((data, i) => (
            <div key={i} className="flex-1 text-center">
              {i % 2 === 0 ? data.month : ''}
            </div>
          ))}
        </div>

        {/* Monthly Breakdown */}
        <div className="grid grid-cols-3 gap-4 pt-6 border-t border-stone-200 dark:border-stone-700">
          <div>
            <div className="text-xs text-stone-600 dark:text-stone-400 font-light mb-1">Highest Month</div>
            <div className="text-lg font-light text-stone-900 dark:text-stone-50" style={{ fontFamily: 'Crimson Pro, serif' }}>
              R{Math.max(...monthlyData.map(m => m.potentialRevenue)).toLocaleString()}
            </div>
            <div className="text-xs text-stone-500 dark:text-stone-500 font-light">
              (R{Math.max(...monthlyData.map(m => m.actualRevenue)).toLocaleString()} earned)
            </div>
          </div>
          <div>
            <div className="text-xs text-stone-600 dark:text-stone-400 font-light mb-1">Monthly Average</div>
            <div className="text-lg font-light text-stone-900 dark:text-stone-50" style={{ fontFamily: 'Crimson Pro, serif' }}>
              R{(totalPotential / 12).toFixed(0).toLocaleString()}
            </div>
            <div className="text-xs text-stone-500 dark:text-stone-500 font-light">
              (R{(totalActual / 12).toFixed(0).toLocaleString()} earned)
            </div>
          </div>
          <div>
            <div className="text-xs text-stone-600 dark:text-stone-400 font-light mb-1">This Month</div>
            <div className="text-lg font-light text-stone-900 dark:text-stone-50" style={{ fontFamily: 'Crimson Pro, serif' }}>
              R{monthlyData[11].potentialRevenue.toLocaleString()}
            </div>
            <div className="text-xs text-stone-500 dark:text-stone-500 font-light">
              (R{monthlyData[11].actualRevenue.toLocaleString()} earned)
            </div>
          </div>
        </div>
      </>
    );
  })()}
</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bulk Actions Bar */}
      <AnimatePresence>
        {selectedEvents.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="feature-card p-4 mb-6 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" strokeWidth={1.5} />
              <span className="font-light text-stone-900 dark:text-stone-50">
                {selectedEvents.length} event{selectedEvents.length > 1 ? 's' : ''} selected
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowEmailModal(true);
                }}
                className="px-4 py-2 border border-stone-300 dark:border-stone-600 hover:border-stone-900 dark:hover:border-stone-300 transition-colors font-light text-sm inline-flex items-center gap-2"
              >
                <Mail className="w-4 h-4" strokeWidth={1.5} />
                Email All
              </button>
              <button
                onClick={handleBulkDelete}
                className="px-4 py-2 border border-red-300 dark:border-red-600 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors font-light text-sm inline-flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                Delete
              </button>
              <button
                onClick={() => setSelectedEvents([])}
                className="px-4 py-2 border border-stone-300 dark:border-stone-600 hover:border-stone-900 dark:hover:border-stone-300 transition-colors font-light text-sm"
              >
                Clear
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" strokeWidth={1.5} />
          <input
            type="text"
            placeholder="Search events by title or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-none focus:outline-none focus:border-amber-700 dark:focus:border-amber-500 transition-colors font-light"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-3 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-none focus:outline-none focus:border-amber-700 dark:focus:border-amber-500 transition-colors font-light"
        >
          <option value="all">All Status</option>
          <option value="upcoming">Upcoming</option>
          <option value="past">Past</option>
        </select>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-3 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-none focus:outline-none focus:border-amber-700 dark:focus:border-amber-500 transition-colors font-light"
        >
          <option value="all">All Categories</option>
          <option value="Conversations">Conversations</option>
          <option value="Workshops">Workshops</option>
          <option value="Retreats">Retreats</option>
          <option value="Gatherings">Gatherings</option>
          <option value="General">General</option>
        </select>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            className="px-4 py-3 border border-stone-300 dark:border-stone-600 hover:border-stone-900 dark:hover:border-stone-300 transition-colors font-light inline-flex items-center gap-2"
          >
            {viewMode === 'grid' ? <FileText className="w-5 h-5" strokeWidth={1.5} /> : <BarChart3 className="w-5 h-5" strokeWidth={1.5} />}
          </button>
          <button
            onClick={handleExport}
            className="px-4 py-3 border border-stone-300 dark:border-stone-600 hover:border-stone-900 dark:hover:border-stone-300 transition-colors font-light inline-flex items-center gap-2"
          >
            <Download className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* Events Grid */}
      {filteredEvents.length === 0 ? (
        <div className="feature-card p-12 text-center">
          <Calendar className="w-12 h-12 text-stone-300 dark:text-stone-600 mx-auto mb-4" strokeWidth={1.5} />
          <p className="text-stone-500 dark:text-stone-400 font-light">
            {searchQuery || statusFilter !== 'all' || categoryFilter !== 'all'
              ? 'No events match your filters'
              : 'No events yet. Create your first event to get started.'}
          </p>
        </div>
      ) : (
        <div className={viewMode === 'grid' ? 'grid md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
          {filteredEvents.map(event => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}

      {/* Event Modal */}
      <AnimatePresence>
        {showEventModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-stone-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowEventModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-stone-900 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-3xl font-light text-stone-900 dark:text-stone-50" style={{ fontFamily: 'Crimson Pro, serif' }}>
                    {selectedEvent ? 'Edit' : 'Create'} <span className="elegant-text">Event</span>
                  </h3>
                  <button
                    onClick={() => setShowEventModal(false)}
                    className="p-2 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                  >
                    <X className="w-5 h-5" strokeWidth={1.5} />
                  </button>
                </div>

                <div className="elegant-divider mb-8"></div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm mb-3 text-stone-700 dark:text-stone-300 font-light">
                        Event Title <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                        className="w-full px-4 py-3 bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-700 rounded-none focus:outline-none focus:border-amber-700 dark:focus:border-amber-500 transition-colors font-light"
                        placeholder="Philosophy Under the Stars"
                      />
                    </div>
                    <div>
                      <label className="block text-sm mb-3 text-stone-700 dark:text-stone-300 font-light">
                        Category <span className="text-red-500">*</span>
                      </label>
                      <select
                        required
                        value={form.category}
                        onChange={(e) => setForm({ ...form, category: e.target.value })}
                        className="w-full px-4 py-3 bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-700 rounded-none focus:outline-none focus:border-amber-700 dark:focus:border-amber-500 transition-colors font-light"
                      >
                        <option>Conversations</option>
                        <option>Workshops</option>
                        <option>Retreats</option>
                        <option>Gatherings</option>
                        <option>General</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm mb-3 text-stone-700 dark:text-stone-300 font-light">
                      Description
                    </label>
                    <textarea
                      rows={4}
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      className="w-full px-4 py-3 bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-700 rounded-none focus:outline-none focus:border-amber-700 dark:focus:border-amber-500 transition-colors font-light resize-none"
                      placeholder="An evening of deep conversation about consciousness and existence..."
                    />
                  </div>

                  <div className="grid md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm mb-3 text-stone-700 dark:text-stone-300 font-light">
                        Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        required
                        value={form.date}
                        onChange={(e) => setForm({ ...form, date: e.target.value })}
                        className="w-full px-4 py-3 bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-700 rounded-none focus:outline-none focus:border-amber-700 dark:focus:border-amber-500 transition-colors font-light"
                      />
                    </div>
                    <div>
                      <label className="block text-sm mb-3 text-stone-700 dark:text-stone-300 font-light">
                        Start Time <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="time"
                        required
                        value={form.start_time}
                        onChange={(e) => setForm({ ...form, start_time: e.target.value })}
                        className="w-full px-4 py-3 bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-700 rounded-none focus:outline-none focus:border-amber-700 dark:focus:border-amber-500 transition-colors font-light"
                      />
                    </div>
                    <div>
                      <label className="block text-sm mb-3 text-stone-700 dark:text-stone-300 font-light">
                        End Time
                      </label>
                      <input
                        type="time"
                        value={form.end_time}
                        onChange={(e) => setForm({ ...form, end_time: e.target.value })}
                        className="w-full px-4 py-3 bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-700 rounded-none focus:outline-none focus:border-amber-700 dark:focus:border-amber-500 transition-colors font-light"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm mb-3 text-stone-700 dark:text-stone-300 font-light">
                        Location <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={form.location}
                        onChange={(e) => setForm({ ...form, location: e.target.value })}
                        className="w-full px-4 py-3 bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-700 rounded-none focus:outline-none focus:border-amber-700 dark:focus:border-amber-500 transition-colors font-light"
                        placeholder="Kirstenbosch Gardens"
                      />
                    </div>
                    <div>
                      <label className="block text-sm mb-3 text-stone-700 dark:text-stone-300 font-light">
                        Capacity <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={form.capacity}
                        onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                        className="w-full px-4 py-3 bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-700 rounded-none focus:outline-none focus:border-amber-700 dark:focus:border-amber-500 transition-colors font-light"
                        placeholder="50"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm mb-3 text-stone-700 dark:text-stone-300 font-light">
                        Price (ZAR)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={form.price}
                        onChange={(e) => setForm({ ...form, price: e.target.value })}
                        disabled={form.is_free}
                        className="w-full px-4 py-3 bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-700 rounded-none focus:outline-none focus:border-amber-700 dark:focus:border-amber-500 transition-colors font-light disabled:opacity-50"
                        placeholder="250"
                      />
                    </div>
                    <div className="flex items-end">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="w-5 h-5"
                          checked={form.is_free}
                          onChange={(e) => setForm({ ...form, is_free: e.target.checked })}
                        />
                        <span className="text-sm font-light text-stone-700 dark:text-stone-300">Free Event</span>
                      </label>
                    </div>
                    <div>
                      <label className="block text-sm mb-3 text-stone-700 dark:text-stone-300 font-light">
                        Duration (minutes)
                      </label>
                      <input
                        type="number"
                        min="15"
                        value={form.duration_minutes}
                        onChange={(e) => setForm({ ...form, duration_minutes: e.target.value })}
                        className="w-full px-4 py-3 bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-700 rounded-none focus:outline-none focus:border-amber-700 dark:focus:border-amber-500 transition-colors font-light"
                        placeholder="120"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm mb-3 text-stone-700 dark:text-stone-300 font-light">
                      Event Image
                    </label>
                    <div className="flex items-center gap-4">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e.target.files[0])}
                        className="flex-1 text-sm"
                        disabled={uploading}
                      />
                      {uploading && <Loader2 className="w-5 h-5 animate-spin" strokeWidth={1.5} />}
                    </div>
                    {form.image_url && (
                      <img 
                        src={form.image_url} 
                        alt="Preview" 
                        className="mt-4 w-full h-48 object-cover"
                      />
                    )}
                  </div>

                  <div>
                    <label className="block text-sm mb-3 text-stone-700 dark:text-stone-300 font-light">
                      Event Type
                    </label>
                    <select
                      value={form.event_type}
                      onChange={(e) => setForm({ ...form, event_type: e.target.value })}
                      className="w-full px-4 py-3 bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-700 rounded-none focus:outline-none focus:border-amber-700 dark:focus:border-amber-500 transition-colors font-light"
                    >
                      <option value="in-person">In-Person</option>
                      <option value="online">Online</option>
                      <option value="hybrid">Hybrid</option>
                    </select>
                  </div>

                  <div className="flex justify-between items-center pt-6 border-t border-stone-200 dark:border-stone-700">
                    <button
                      type="button"
                      onClick={() => setShowEventModal(false)}
                      className="px-6 py-3 border border-stone-300 dark:border-stone-600 hover:border-stone-900 dark:hover:border-stone-300 transition-colors font-light"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-6 py-3 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 hover:bg-stone-800 dark:hover:bg-stone-200 transition-colors font-light inline-flex items-center gap-2 disabled:opacity-50"
                    >
                      {saving && <Loader2 className="w-4 h-4 animate-spin" strokeWidth={1.5} />}
                      {selectedEvent ? 'Update Event' : 'Create Event'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Email Modal */}
      <AnimatePresence>
        {showEmailModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-stone-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowEmailModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-stone-900 w-full max-w-3xl max-h-[90vh] overflow-y-auto"
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-3xl font-light text-stone-900 dark:text-stone-50 mb-2" style={{ fontFamily: 'Crimson Pro, serif' }}>
                      Email <span className="elegant-text">Attendees</span>
                    </h3>
                    <p className="text-sm text-stone-600 dark:text-stone-400 font-light">
                      {selectedEvent 
                        ? `Sending to attendees of "${selectedEvent.title}"`
                        : `Sending to attendees of ${selectedEvents.length} selected events`
                      }
                    </p>
                  </div>
                  <button
                    onClick={() => setShowEmailModal(false)}
                    className="p-2 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                  >
                    <X className="w-5 h-5" strokeWidth={1.5} />
                  </button>
                </div>

                <div className="elegant-divider mb-8"></div>

                <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); alert('Email functionality requires backend integration'); }}>
                  <div>
                    <label className="block text-sm mb-3 text-stone-700 dark:text-stone-300 font-light">
                      Email Type
                    </label>
                    <select
                      className="w-full px-4 py-3 bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-700 rounded-none focus:outline-none focus:border-amber-700 dark:focus:border-amber-500 transition-colors font-light"
                    >
                      <option>Event Reminder</option>
                      <option>Event Update</option>
                      <option>Event Cancellation</option>
                      <option>Thank You Message</option>
                      <option>Custom Message</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm mb-3 text-stone-700 dark:text-stone-300 font-light">
                      Subject Line <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-3 bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-700 rounded-none focus:outline-none focus:border-amber-700 dark:focus:border-amber-500 transition-colors font-light"
                      placeholder="Reminder: Philosophy Under the Stars - Tomorrow at 6pm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm mb-3 text-stone-700 dark:text-stone-300 font-light">
                      Message <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={10}
                      className="w-full px-4 py-3 bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-700 rounded-none focus:outline-none focus:border-amber-700 dark:focus:border-amber-500 transition-colors font-light resize-none"
                      placeholder="Dear attendees,&#10;&#10;We're excited to see you tomorrow evening...&#10;&#10;Event Details:&#10;• Date: November 15, 2025&#10;• Time: 6:00 PM&#10;• Location: Kirstenbosch Gardens"
                    />
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/50 p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                    <div className="text-sm text-blue-900 dark:text-blue-300 font-light">
                      <strong className="font-medium">Note:</strong> Email functionality requires backend integration with an email service provider (Resend, SendGrid, etc.).
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-6 border-t border-stone-200 dark:border-stone-700">
                    <button
                      type="button"
                      className="px-6 py-3 border border-stone-300 dark:border-stone-600 hover:border-stone-900 dark:hover:border-stone-300 transition-colors font-light inline-flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" strokeWidth={1.5} />
                      Preview
                    </button>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setShowEmailModal(false)}
                        className="px-6 py-3 border border-stone-300 dark:border-stone-600 hover:border-stone-900 dark:hover:border-stone-300 transition-colors font-light"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-3 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 hover:bg-stone-800 dark:hover:bg-stone-200 transition-colors font-light inline-flex items-center gap-2"
                      >
                        <Send className="w-4 h-4" strokeWidth={1.5} />
                        Send Email
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results Summary */}
      {filteredEvents.length > 0 && (
        <div className="mt-8 text-center">
          <p className="text-sm text-stone-600 dark:text-stone-400 font-light">
            Showing {filteredEvents.length} of {events.length} events
          </p>
        </div>
      )}
    </motion.div>
  );
}