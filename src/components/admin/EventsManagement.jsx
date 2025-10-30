// src/components/admin/EventsManagement.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Edit2, Trash2, Calendar, MapPin, Users, Loader2 } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import EventModal from './EventModal';

export default function EventsManagement() {
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

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

  const handleDelete = async (event) => {
    if (!confirm(`Delete event "${event.title}"? This cannot be undone.`)) return;

    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', event.id);

      if (error) throw error;
      
      setEvents(events.filter(e => e.id !== event.id));
      alert('Event deleted successfully');
    } catch (err) {
      console.error('Error deleting event:', err);
      alert('Failed to delete event');
    }
  };

  const filteredEvents = useMemo(() => {
    return events.filter(e => {
      const matchesSearch = 
        e.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.location?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = filterCategory === 'all' || e.category === filterCategory;
      return matchesSearch && matchesCategory;
    });
  }, [events, searchQuery, filterCategory]);

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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-light mb-2" style={{ fontFamily: 'Crimson Pro, serif' }}>
            Events Management
          </h2>
          <p className="text-stone-600 dark:text-stone-400">Create and manage your events</p>
        </div>
        <button
          onClick={() => { setEditingEvent(null); setModalOpen(true); }}
          className="px-6 py-3 bg-stone-900 dark:bg-white text-white dark:text-stone-900 rounded-xl hover:scale-105 transition-transform inline-flex items-center gap-2 font-light"
        >
          <Plus className="w-5 h-5" /> Create Event
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
          <input
            type="text"
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-400"
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-4 py-3 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-400"
        >
          <option value="all">All Categories</option>
          <option value="Conversations">Conversations</option>
          <option value="Workshops">Workshops</option>
          <option value="Retreats">Retreats</option>
          <option value="Gatherings">Gatherings</option>
        </select>
      </div>

      {/* Events Grid */}
      {filteredEvents.length === 0 ? (
        <div className="text-center py-12 text-stone-500">
          No events found. Create your first event to get started!
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map(event => (
            <motion.div
              key={event.id}
              layout
              className="bg-white dark:bg-stone-900 rounded-2xl overflow-hidden border border-stone-200 dark:border-stone-800 hover:shadow-xl transition-shadow"
            >
              <div className="h-48 bg-gradient-to-br from-amber-100 to-rose-100 dark:from-amber-900/20 dark:to-rose-900/20 flex items-center justify-center">
                {event.image_url ? (
                  <img src={event.image_url} alt={event.title} className="w-full h-full object-cover" />
                ) : (
                  <Calendar className="w-12 h-12 text-stone-400" />
                )}
              </div>
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-medium mb-1">{event.title}</h3>
                    <p className="text-sm text-stone-600 dark:text-stone-400 line-clamp-2">
                      {event.description}
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-stone-100 dark:bg-stone-800 rounded-full text-xs font-medium ml-2">
                    {event.category}
                  </span>
                </div>
                <div className="space-y-2 text-sm text-stone-600 dark:text-stone-400 mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {event.date ? new Date(event.date).toLocaleDateString() : 'No date'}
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {event.location || 'No location'}
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    {event.available_spots}/{event.capacity} spots
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => { setEditingEvent(event); setModalOpen(true); }}
                    className="flex-1 px-4 py-2 border border-stone-200 dark:border-stone-800 rounded-lg hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors inline-flex items-center justify-center gap-2"
                  >
                    <Edit2 className="w-4 h-4" /> Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(event)}
                    className="px-4 py-2 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Event Modal */}
      {modalOpen && (
        <EventModal
          event={editingEvent}
          onClose={() => setModalOpen(false)}
          onSave={() => {
            setModalOpen(false);
            loadEvents();
          }}
        />
      )}
    </motion.div>
  );
}