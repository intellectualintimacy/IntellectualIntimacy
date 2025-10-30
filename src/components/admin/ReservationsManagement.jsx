// src/components/admin/ReservationsManagement.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Download, MoreVertical, Loader2, Phone, Mail } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

export default function ReservationsManagement() {
  const [loading, setLoading] = useState(true);
  const [reservations, setReservations] = useState([]);
  const [events, setEvents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const [reservationsRes, eventsRes] = await Promise.all([
        supabase.from('reservations').select('*').order('created_at', { ascending: false }),
        supabase.from('events').select('id, title')
      ]);

      if (reservationsRes.error) throw reservationsRes.error;
      if (eventsRes.error) throw eventsRes.error;

      setReservations(reservationsRes.data || []);
      setEvents(eventsRes.data || []);
    } catch (err) {
      console.error('Error loading reservations:', err);
    } finally {
      setLoading(false);
    }
  };

  const getEventTitle = (eventId) => {
    const event = events.find(e => e.id === eventId);
    return event?.title || 'Unknown Event';
  };

  const handleStatusUpdate = async (reservationId, newStatus) => {
    try {
      const { error } = await supabase
        .from('reservations')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', reservationId);

      if (error) throw error;

      setReservations(reservations.map(r => 
        r.id === reservationId ? { ...r, status: newStatus } : r
      ));
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update status');
    }
  };

  const handleExport = () => {
    const csv = [
      ['Ticket ID', 'Name', 'Email', 'Phone', 'Event', 'Status', 'Payment Status', 'Amount', 'Date'].join(','),
      ...filteredReservations.map(r => [
        r.ticket_id,
        r.user_name,
        r.user_email,
        r.user_phone || '',
        getEventTitle(r.event_id),
        r.status,
        r.payment_status,
        r.payment_amount || 0,
        new Date(r.created_at).toLocaleDateString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reservations-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const filteredReservations = useMemo(() => {
    return reservations.filter(r => {
      const matchesSearch = 
        r.user_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.user_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.ticket_id?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [reservations, searchQuery, statusFilter]);

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
          Reservations
        </h2>
        <p className="text-stone-600 dark:text-stone-400">Manage event reservations and tickets</p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
          <input
            type="text"
            placeholder="Search reservations..."
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
          <option value="confirmed">Confirmed</option>
          <option value="pending">Pending</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <button 
          onClick={handleExport}
          className="px-4 py-3 border border-stone-200 dark:border-stone-800 rounded-xl hover:bg-stone-50 dark:hover:bg-stone-800 inline-flex items-center gap-2"
        >
          <Download className="w-5 h-5" /> Export
        </button>
      </div>

      {/* Reservations Table */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 overflow-hidden">
        {filteredReservations.length === 0 ? (
          <div className="p-12 text-center text-stone-500">
            No reservations found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-stone-50 dark:bg-stone-950 border-b border-stone-200 dark:border-stone-800">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium">Ticket ID</th>
                  <th className="px-6 py-4 text-left text-sm font-medium">Customer</th>
                  <th className="px-6 py-4 text-left text-sm font-medium">Event</th>
                  <th className="px-6 py-4 text-left text-sm font-medium">Contact</th>
                  <th className="px-6 py-4 text-left text-sm font-medium">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-medium">Payment</th>
                  <th className="px-6 py-4 text-left text-sm font-medium">Amount</th>
                  <th className="px-6 py-4 text-left text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 dark:divide-stone-800">
                {filteredReservations.map(res => (
                  <tr key={res.id} className="hover:bg-stone-50 dark:hover:bg-stone-950">
                    <td className="px-6 py-4 text-sm font-mono text-stone-600 dark:text-stone-400">
                      {res.ticket_id || '—'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium">{res.user_name}</div>
                      <div className="text-sm text-stone-500">{res.user_email}</div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {getEventTitle(res.event_id)}
                    </td>
                    <td className="px-6 py-4">
                      {res.user_phone ? (
                        <div className="flex items-center gap-2 text-sm text-stone-600 dark:text-stone-400">
                          <Phone className="w-4 h-4" />
                          {res.user_phone}
                        </div>
                      ) : (
                        <span className="text-sm text-stone-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={res.status}
                        onChange={(e) => handleStatusUpdate(res.id, e.target.value)}
                        className={`px-3 py-1 rounded-full text-xs font-medium border-0 ${
                          res.status === 'confirmed' 
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' 
                            : res.status === 'pending' 
                            ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400' 
                            : 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                        }`}
                      >
                        <option value="confirmed">Confirmed</option>
                        <option value="pending">Pending</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        res.payment_status === 'completed' 
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' 
                          : res.payment_status === 'pending' 
                          ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400' 
                          : 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                      }`}>
                        {res.payment_status}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium">
                      R {res.payment_amount || 0}
                    </td>
                    <td className="px-6 py-4">
                      <button className="p-2 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg">
                        <MoreVertical className="w-4 h-4" />
                      </button>
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