// src/components/admin/NewsletterManagement.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { UserCheck, Clock, UserX, Search, Download, Send, Loader2 } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

export default function NewsletterManagement() {
  const [loading, setLoading] = useState(true);
  const [subscribers, setSubscribers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showComposer, setShowComposer] = useState(false);

  useEffect(() => {
    loadSubscribers();
  }, []);

  const loadSubscribers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('newsletter_subscribers')
        .select('*')
        .order('subscribed_at', { ascending: false });

      if (error) throw error;
      setSubscribers(data || []);
    } catch (err) {
      console.error('Error loading subscribers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    const filtered = subscribers.filter(s => {
      const matchesSearch = s.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           s.name?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    const csv = [
      ['Email', 'Name', 'Status', 'Subscribed Date'].join(','),
      ...filtered.map(s => [
        s.email,
        s.name || '',
        s.status,
        new Date(s.subscribed_at).toLocaleDateString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `newsletter-subscribers-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const activeCount = subscribers.filter(s => s.status === 'active').length;
  const pendingCount = subscribers.filter(s => s.status === 'pending').length;
  const unsubscribedCount = subscribers.filter(s => s.status === 'unsubscribed').length;

  const filteredSubscribers = subscribers.filter(s => {
    const matchesSearch = s.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         s.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
            Newsletter
          </h2>
          <p className="text-stone-600 dark:text-stone-400">Manage subscribers and send campaigns</p>
        </div>
        <button
          onClick={() => setShowComposer(!showComposer)}
          className="px-6 py-3 bg-stone-900 dark:bg-white text-white dark:text-stone-900 rounded-xl hover:scale-105 transition-transform inline-flex items-center gap-2 font-light"
        >
          <Send className="w-5 h-5" /> Compose Campaign
        </button>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 border border-stone-200 dark:border-stone-800">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-xl">
              <UserCheck className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <div className="text-3xl font-light">{activeCount}</div>
              <div className="text-sm text-stone-600 dark:text-stone-400">Active Subscribers</div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 border border-stone-200 dark:border-stone-800">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-xl">
              <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <div className="text-3xl font-light">{pendingCount}</div>
              <div className="text-sm text-stone-600 dark:text-stone-400">Pending Confirmation</div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 border border-stone-200 dark:border-stone-800">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-xl">
              <UserX className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <div className="text-3xl font-light">{unsubscribedCount}</div>
              <div className="text-sm text-stone-600 dark:text-stone-400">Unsubscribed</div>
            </div>
          </div>
        </div>
      </div>

      {/* Campaign Composer */}
      {showComposer && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-white dark:bg-stone-900 rounded-2xl p-6 border border-stone-200 dark:border-stone-800 mb-6"
        >
          <h3 className="text-xl font-light mb-4" style={{ fontFamily: 'Crimson Pro, serif' }}>
            New Campaign
          </h3>
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Subject</label>
              <input
                type="text"
                placeholder="Newsletter subject line"
                className="w-full px-4 py-2 border border-stone-200 dark:border-stone-800 rounded-lg bg-white dark:bg-stone-950 focus:outline-none focus:ring-2 focus:ring-stone-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Message</label>
              <textarea
                rows={6}
                placeholder="Your newsletter content..."
                className="w-full px-4 py-2 border border-stone-200 dark:border-stone-800 rounded-lg bg-white dark:bg-stone-950 focus:outline-none focus:ring-2 focus:ring-stone-400"
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowComposer(false)}
                className="px-6 py-2 border border-stone-200 dark:border-stone-800 rounded-lg hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                className="px-6 py-2 bg-stone-900 dark:bg-white text-white dark:text-stone-900 rounded-lg hover:scale-105 transition-transform inline-flex items-center gap-2"
              >
                <Send className="w-4 h-4" /> Send to {activeCount} subscribers
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
          <input
            type="text"
            placeholder="Search subscribers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-400"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-3 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-400"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="unsubscribed">Unsubscribed</option>
        </select>
        <button
          onClick={handleExport}
          className="px-4 py-3 border border-stone-200 dark:border-stone-800 rounded-xl hover:bg-stone-50 dark:hover:bg-stone-800 inline-flex items-center gap-2"
        >
          <Download className="w-5 h-5" /> Export
        </button>
      </div>

      {/* Subscribers Table */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 overflow-hidden">
        {filteredSubscribers.length === 0 ? (
          <div className="p-12 text-center text-stone-500">
            No subscribers found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-stone-50 dark:bg-stone-950 border-b border-stone-200 dark:border-stone-800">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-medium">Name</th>
                  <th className="px-6 py-4 text-left text-sm font-medium">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-medium">Subscribed</th>
                  <th className="px-6 py-4 text-left text-sm font-medium">Confirmed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 dark:divide-stone-800">
                {filteredSubscribers.map(sub => (
                  <tr key={sub.id} className="hover:bg-stone-50 dark:hover:bg-stone-950">
                    <td className="px-6 py-4 font-medium">{sub.email}</td>
                    <td className="px-6 py-4 text-sm text-stone-600 dark:text-stone-400">
                      {sub.name || '—'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        sub.status === 'active'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                          : sub.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400'
                          : 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                      }`}>
                        {sub.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-stone-600 dark:text-stone-400">
                      {new Date(sub.subscribed_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-stone-600 dark:text-stone-400">
                      {sub.confirmed_at ? new Date(sub.confirmed_at).toLocaleDateString() : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </motion.div>
  );
}