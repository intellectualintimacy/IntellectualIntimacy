import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Download, MoreVertical, Loader2, Phone, Mail, 
  Calendar, MapPin, User, CreditCard, Check, X, Eye, 
  Send, Trash2, Edit, Clock, AlertCircle, Filter,
  DollarSign, Ticket, CheckCircle, XCircle
} from 'lucide-react';
import { supabase } from '../../../lib/supabase';

export default function ReservationsManagement() {
  const [loading, setLoading] = useState(true);
  const [reservations, setReservations] = useState([]);
  const [events, setEvents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [eventFilter, setEventFilter] = useState('all');
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const [reservationsRes, eventsRes] = await Promise.all([
        supabase
          .from('reservations')
          .select('*')
          .order('created_at', { ascending: false }),
        supabase
          .from('events')
          .select('id, title, date, location, event_type, price, is_free')
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

  const getEventDetails = (eventId) => {
    return events.find(e => e.id === eventId) || {};
  };

  const handleStatusUpdate = async (reservationId, newStatus) => {
    try {
      setActionLoading(true);
      const { error } = await supabase
        .from('reservations')
        .update({ 
          status: newStatus, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', reservationId);

      if (error) throw error;

      setReservations(reservations.map(r => 
        r.id === reservationId ? { ...r, status: newStatus, updated_at: new Date().toISOString() } : r
      ));

      // Optionally send confirmation email
      const reservation = reservations.find(r => r.id === reservationId);
      if (newStatus === 'confirmed' && reservation) {
        await sendConfirmationEmail(reservation);
      }
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update status');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePaymentStatusUpdate = async (reservationId, newPaymentStatus) => {
    try {
      setActionLoading(true);
      const { error } = await supabase
        .from('reservations')
        .update({ 
          payment_status: newPaymentStatus,
          updated_at: new Date().toISOString() 
        })
        .eq('id', reservationId);

      if (error) throw error;

      setReservations(reservations.map(r => 
        r.id === reservationId ? { ...r, payment_status: newPaymentStatus } : r
      ));
    } catch (err) {
      console.error('Error updating payment status:', err);
      alert('Failed to update payment status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteReservation = async () => {
    if (!selectedReservation) return;

    try {
      setActionLoading(true);
      
      // Get event details to update available spots
      const event = getEventDetails(selectedReservation.event_id);
      
      // Delete reservation
      const { error } = await supabase
        .from('reservations')
        .delete()
        .eq('id', selectedReservation.id);

      if (error) throw error;

      // Update available spots
      if (event.id) {
        await supabase
          .from('events')
          .update({ 
            available_spots: (event.available_spots || 0) + 1 
          })
          .eq('id', event.id);
      }

      setReservations(reservations.filter(r => r.id !== selectedReservation.id));
      setShowDeleteConfirm(false);
      setShowDetails(false);
      setSelectedReservation(null);
    } catch (err) {
      console.error('Error deleting reservation:', err);
      alert('Failed to delete reservation');
    } finally {
      setActionLoading(false);
    }
  };

  const sendConfirmationEmail = async (reservation) => {
    try {
      setSendingEmail(true);
      const event = getEventDetails(reservation.event_id);
      
      const { error } = await supabase.functions.invoke('send-reservation-confirmation', {
        body: {
          reservation: {
            ...reservation,
            event_title: event.title,
            event_date: event.date,
            event_location: event.location,
            event_type: event.event_type
          }
        }
      });

      if (error) throw error;
      alert('Confirmation email sent successfully!');
    } catch (err) {
      console.error('Error sending email:', err);
      alert('Failed to send confirmation email. Please check your edge function configuration.');
    } finally {
      setSendingEmail(false);
    }
  };

  const handleExport = () => {
    const csv = [
      ['Ticket ID', 'Name', 'Email', 'Phone', 'Event', 'Status', 'Payment Status', 'Amount', 'Date', 'Notes'].join(','),
      ...filteredReservations.map(r => {
        const event = getEventDetails(r.event_id);
        return [
          r.ticket_id || '',
          `"${r.user_name}"`,
          r.user_email,
          r.user_phone || '',
          `"${event.title || 'Unknown'}"`,
          r.status,
          r.payment_status,
          r.payment_amount || 0,
          new Date(r.created_at).toLocaleDateString(),
          `"${(r.notes || '').replace(/"/g, '""')}"`
        ].join(',');
      })
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reservations-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const filteredReservations = useMemo(() => {
    return reservations.filter(r => {
      const matchesSearch = 
        r.user_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.user_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.ticket_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.user_phone?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
      const matchesPayment = paymentFilter === 'all' || r.payment_status === paymentFilter;
      const matchesEvent = eventFilter === 'all' || r.event_id === eventFilter;
      return matchesSearch && matchesStatus && matchesPayment && matchesEvent;
    });
  }, [reservations, searchQuery, statusFilter, paymentFilter, eventFilter]);

  const stats = useMemo(() => ({
    total: reservations.length,
    confirmed: reservations.filter(r => r.status === 'confirmed').length,
    pending: reservations.filter(r => r.status === 'pending').length,
    cancelled: reservations.filter(r => r.status === 'cancelled').length,
    totalRevenue: reservations
      .filter(r => r.payment_status === 'completed')
      .reduce((sum, r) => sum + (parseFloat(r.payment_amount) || 0), 0),
    pendingPayments: reservations
      .filter(r => r.payment_status === 'pending')
      .reduce((sum, r) => sum + (parseFloat(r.payment_amount) || 0), 0)
  }), [reservations]);

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
      <div className="mb-8">
        <h2 className="text-4xl font-light mb-2 text-stone-900 dark:text-stone-50" style={{ fontFamily: 'Crimson Pro, serif' }}>
          Reservation <span className="elegant-text">Management</span>
        </h2>
        <p className="text-stone-600 dark:text-stone-400 font-light">
          Manage event reservations and ticket sales
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <div className="feature-card p-5">
          <div className="flex items-center justify-between mb-2">
            <Ticket className="w-5 h-5 text-stone-500 dark:text-stone-400" strokeWidth={1.5} />
            <span className="text-2xl font-light elegant-text" style={{ fontFamily: 'Crimson Pro, serif' }}>
              {stats.total}
            </span>
          </div>
          <div className="text-xs text-stone-600 dark:text-stone-400 font-light">Total</div>
        </div>

        <div className="feature-card p-5">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" strokeWidth={1.5} />
            <span className="text-2xl font-light text-green-700 dark:text-green-400" style={{ fontFamily: 'Crimson Pro, serif' }}>
              {stats.confirmed}
            </span>
          </div>
          <div className="text-xs text-stone-600 dark:text-stone-400 font-light">Confirmed</div>
        </div>

        <div className="feature-card p-5">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" strokeWidth={1.5} />
            <span className="text-2xl font-light text-yellow-700 dark:text-yellow-400" style={{ fontFamily: 'Crimson Pro, serif' }}>
              {stats.pending}
            </span>
          </div>
          <div className="text-xs text-stone-600 dark:text-stone-400 font-light">Pending</div>
        </div>

        <div className="feature-card p-5">
          <div className="flex items-center justify-between mb-2">
            <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" strokeWidth={1.5} />
            <span className="text-2xl font-light text-red-700 dark:text-red-400" style={{ fontFamily: 'Crimson Pro, serif' }}>
              {stats.cancelled}
            </span>
          </div>
          <div className="text-xs text-stone-600 dark:text-stone-400 font-light">Cancelled</div>
        </div>

        <div className="feature-card p-5">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" strokeWidth={1.5} />
            <span className="text-2xl font-light text-green-700 dark:text-green-400" style={{ fontFamily: 'Crimson Pro, serif' }}>
              R{stats.totalRevenue.toFixed(0)}
            </span>
          </div>
          <div className="text-xs text-stone-600 dark:text-stone-400 font-light">Revenue</div>
        </div>

        <div className="feature-card p-5">
          <div className="flex items-center justify-between mb-2">
            <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400" strokeWidth={1.5} />
            <span className="text-2xl font-light text-orange-700 dark:text-orange-400" style={{ fontFamily: 'Crimson Pro, serif' }}>
              R{stats.pendingPayments.toFixed(0)}
            </span>
          </div>
          <div className="text-xs text-stone-600 dark:text-stone-400 font-light">Pending</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" strokeWidth={1.5} />
          <input
            type="text"
            placeholder="Search by name, email, ticket ID, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-none focus:outline-none focus:border-amber-700 dark:focus:border-amber-500 transition-colors font-light"
          />
        </div>
        
        <select
          value={eventFilter}
          onChange={(e) => setEventFilter(e.target.value)}
          className="px-4 py-3 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-none focus:outline-none focus:border-amber-700 dark:focus:border-amber-500 transition-colors font-light"
        >
          <option value="all">All Events</option>
          {events.map(event => (
            <option key={event.id} value={event.id}>{event.title}</option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-3 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-none focus:outline-none focus:border-amber-700 dark:focus:border-amber-500 transition-colors font-light"
        >
          <option value="all">All Status</option>
          <option value="confirmed">Confirmed</option>
          <option value="pending">Pending</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <select
          value={paymentFilter}
          onChange={(e) => setPaymentFilter(e.target.value)}
          className="px-4 py-3 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-none focus:outline-none focus:border-amber-700 dark:focus:border-amber-500 transition-colors font-light"
        >
          <option value="all">All Payments</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
        </select>

        <button 
          onClick={handleExport}
          className="px-6 py-3 border border-stone-300 dark:border-stone-600 hover:border-stone-900 dark:hover:border-stone-300 transition-colors inline-flex items-center justify-center gap-2 font-light whitespace-nowrap"
        >
          <Download className="w-5 h-5" strokeWidth={1.5} /> Export CSV
        </button>
      </div>

      {/* Reservations Table */}
      <div className="feature-card overflow-hidden">
        {filteredReservations.length === 0 ? (
          <div className="p-12 text-center">
            <Ticket className="w-12 h-12 text-stone-300 dark:text-stone-600 mx-auto mb-4" strokeWidth={1.5} />
            <p className="text-stone-500 dark:text-stone-400 font-light">
              {searchQuery || statusFilter !== 'all' || paymentFilter !== 'all' || eventFilter !== 'all'
                ? 'No reservations match your filters' 
                : 'No reservations yet'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-stone-50 dark:bg-stone-950 border-b border-stone-200 dark:border-stone-700">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-light text-stone-700 dark:text-stone-300">Ticket</th>
                  <th className="px-6 py-4 text-left text-sm font-light text-stone-700 dark:text-stone-300">Customer</th>
                  <th className="px-6 py-4 text-left text-sm font-light text-stone-700 dark:text-stone-300">Event</th>
                  <th className="px-6 py-4 text-left text-sm font-light text-stone-700 dark:text-stone-300">Date</th>
                  <th className="px-6 py-4 text-left text-sm font-light text-stone-700 dark:text-stone-300">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-light text-stone-700 dark:text-stone-300">Payment</th>
                  <th className="px-6 py-4 text-left text-sm font-light text-stone-700 dark:text-stone-300">Amount</th>
                  <th className="px-6 py-4 text-right text-sm font-light text-stone-700 dark:text-stone-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 dark:divide-stone-700">
                {filteredReservations.map(res => {
                  const event = getEventDetails(res.event_id);
                  return (
                    <tr key={res.id} className="hover:bg-stone-50 dark:hover:bg-stone-950 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Ticket className="w-4 h-4 text-stone-400" strokeWidth={1.5} />
                          <span className="text-sm font-mono text-stone-600 dark:text-stone-400 font-light">
                            {res.ticket_id || '—'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-light text-stone-900 dark:text-stone-100">{res.user_name}</div>
                        <div className="text-sm text-stone-500 dark:text-stone-400 font-light">{res.user_email}</div>
                        {res.user_phone && (
                          <div className="text-xs text-stone-500 dark:text-stone-400 font-light mt-1">{res.user_phone}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 font-light text-stone-700 dark:text-stone-300">
                        {event.title || 'Unknown Event'}
                      </td>
                      <td className="px-6 py-4 text-sm text-stone-600 dark:text-stone-400 font-light">
                        {new Date(res.created_at).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={res.status}
                          onChange={(e) => handleStatusUpdate(res.id, e.target.value)}
                          disabled={actionLoading}
                          className={`px-3 py-1 text-xs font-light border-0 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all ${
                            res.status === 'confirmed' 
                              ? 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400' 
                              : res.status === 'pending' 
                              ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400' 
                              : 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400'
                          }`}
                        >
                          <option value="confirmed">Confirmed</option>
                          <option value="pending">Pending</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={res.payment_status}
                          onChange={(e) => handlePaymentStatusUpdate(res.id, e.target.value)}
                          disabled={actionLoading}
                          className={`px-3 py-1 text-xs font-light border-0 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all ${
                            res.payment_status === 'completed' 
                              ? 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400' 
                              : res.payment_status === 'pending' 
                              ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400' 
                              : 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400'
                          }`}
                        >
                          <option value="completed">Completed</option>
                          <option value="pending">Pending</option>
                          <option value="failed">Failed</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 font-light text-stone-900 dark:text-stone-100">
                        R {parseFloat(res.payment_amount || 0).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedReservation(res);
                            setShowDetails(true);
                          }}
                          className="p-2 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors inline-flex items-center justify-center"
                          title="View details"
                        >
                          <Eye className="w-4 h-4" strokeWidth={1.5} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Results Summary */}
      {filteredReservations.length > 0 && (
        <div className="mt-4 text-center">
          <p className="text-sm text-stone-600 dark:text-stone-400 font-light">
            Showing {filteredReservations.length} of {reservations.length} reservations
          </p>
        </div>
      )}

      {/* Details Modal */}
      <AnimatePresence>
        {showDetails && selectedReservation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-stone-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => !showDeleteConfirm && setShowDetails(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-stone-800 w-full max-w-2xl max-h-[90vh] overflow-y-auto relative"
            >
              {/* Header */}
              <div className="p-8 border-b border-stone-200 dark:border-stone-700">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-3xl font-light text-stone-900 dark:text-stone-50 mb-2" style={{ fontFamily: 'Crimson Pro, serif' }}>
                      Reservation <span className="elegant-text">Details</span>
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-stone-600 dark:text-stone-400 font-light">
                      <Ticket className="w-4 h-4" strokeWidth={1.5} />
                      {selectedReservation.ticket_id || 'No ticket ID'}
                    </div>
                  </div>
                  <button
                    onClick={() => setShowDetails(false)}
                    className="p-2 hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors"
                  >
                    <X className="w-5 h-5" strokeWidth={1.5} />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-8 space-y-6">
                {/* Customer Info */}
                <div>
                  <h4 className="text-lg font-light text-stone-900 dark:text-stone-50 mb-4" style={{ fontFamily: 'Crimson Pro, serif' }}>
                    Customer <span className="elegant-text">Information</span>
                  </h4>
                  <div className="bg-stone-50 dark:bg-stone-900 p-5 space-y-3">
                    <div className="flex items-start gap-3">
                      <User className="w-5 h-5 text-stone-500 dark:text-stone-400 mt-0.5" strokeWidth={1.5} />
                      <div className="flex-1">
                        <div className="text-sm text-stone-600 dark:text-stone-400 font-light">Name</div>
                        <div className="font-light text-stone-900 dark:text-stone-100">{selectedReservation.user_name}</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Mail className="w-5 h-5 text-stone-500 dark:text-stone-400 mt-0.5" strokeWidth={1.5} />
                      <div className="flex-1">
                        <div className="text-sm text-stone-600 dark:text-stone-400 font-light">Email</div>
                        <div className="font-light text-stone-900 dark:text-stone-100">{selectedReservation.user_email}</div>
                      </div>
                    </div>
                    {selectedReservation.user_phone && (
                      <div className="flex items-start gap-3">
                        <Phone className="w-5 h-5 text-stone-500 dark:text-stone-400 mt-0.5" strokeWidth={1.5} />
                        <div className="flex-1">
                          <div className="text-sm text-stone-600 dark:text-stone-400 font-light">Phone</div>
                          <div className="font-light text-stone-900 dark:text-stone-100">{selectedReservation.user_phone}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Event Info */}
                <div>
                  <h4 className="text-lg font-light text-stone-900 dark:text-stone-50 mb-4" style={{ fontFamily: 'Crimson Pro, serif' }}>
                    Event <span className="elegant-text">Details</span>
                  </h4>
                  <div className="bg-stone-50 dark:bg-stone-900 p-5 space-y-3">
                    {(() => {
                      const event = getEventDetails(selectedReservation.event_id);
                      return (
                        <>
                          <div className="flex items-start gap-3">
                            <Calendar className="w-5 h-5 text-stone-500 dark:text-stone-400 mt-0.5" strokeWidth={1.5} />
                            <div className="flex-1">
                              <div className="text-sm text-stone-600 dark:text-stone-400 font-light">Event</div>
                              <div className="font-light text-stone-900 dark:text-stone-100">{event.title || 'Unknown Event'}</div>
                            </div>
                          </div>
                          {event.date && (
                            <div className="flex items-start gap-3">
                              <Calendar className="w-5 h-5 text-stone-500 dark:text-stone-400 mt-0.5" strokeWidth={1.5} />
                              <div className="flex-1">
                                <div className="text-sm text-stone-600 dark:text-stone-400 font-light">Date</div>
                                <div className="font-light text-stone-900 dark:text-stone-100">
                                  {new Date(event.date).toLocaleDateString('en-US', { 
                                    weekday: 'long',
                                    year: 'numeric', 
                                    month: 'long', 
                                    day: 'numeric' 
                                  })}
                                </div>
                              </div>
                            </div>
                          )}
                          {event.location && (
                            <div className="flex items-start gap-3">
                              <MapPin className="w-5 h-5 text-stone-500 dark:text-stone-400 mt-0.5" strokeWidth={1.5} />
                              <div className="flex-1">
                                <div className="text-sm text-stone-600 dark:text-stone-400 font-light">Location</div>
                                <div className="font-light text-stone-900 dark:text-stone-100">{event.location}</div>
                              </div>
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </div>

                {/* Payment Info */}
                <div>
                  <h4 className="text-lg font-light text-stone-900 dark:text-stone-50 mb-4" style={{ fontFamily: 'Crimson Pro, serif' }}>
                    Payment <span className="elegant-text">Information</span>
                  </h4>
                  <div className="bg-stone-50 dark:bg-stone-900 p-5 space-y-3">
                    <div className="flex items-start gap-3">
                      <DollarSign className="w-5 h-5 text-stone-500 dark:text-stone-400 mt-0.5" strokeWidth={1.5} />
                      <div className="flex-1">
                        <div className="text-sm text-stone-600 dark:text-stone-400 font-light">Amount</div>
                        <div className="font-light text-stone-900 dark:text-stone-100">R {parseFloat(selectedReservation.payment_amount || 0).toFixed(2)}</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CreditCard className="w-5 h-5 text-stone-500 dark:text-stone-400 mt-0.5" strokeWidth={1.5} />
                      <div className="flex-1">
                        <div className="text-sm text-stone-600 dark:text-stone-400 font-light">Status</div>
                        <div>
                          <span className={`inline-block px-3 py-1 text-xs font-light ${
                            selectedReservation.payment_status === 'completed' 
                              ? 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400' 
                              : selectedReservation.payment_status === 'pending' 
                              ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400' 
                              : 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400'
                          }`}>
                            {selectedReservation.payment_status}
                          </span>
                        </div>
                      </div>
                    </div>
                    {selectedReservation.payment_reference && (
                      <div className="flex items-start gap-3">
                        <CreditCard className="w-5 h-5 text-stone-500 dark:text-stone-400 mt-0.5" strokeWidth={1.5} />
                        <div className="flex-1">
                          <div className="text-sm text-stone-600 dark:text-stone-400 font-light">Reference</div>
                          <div className="font-mono text-sm text-stone-900 dark:text-stone-100">{selectedReservation.payment_reference}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Notes */}
                {selectedReservation.notes && (
                  <div>
                    <h4 className="text-lg font-light text-stone-900 dark:text-stone-50 mb-4" style={{ fontFamily: 'Crimson Pro, serif' }}>
                      Special <span className="elegant-text">Notes</span>
                    </h4>
                    <div className="bg-stone-50 dark:bg-stone-900 p-5">
                      <p className="text-stone-700 dark:text-stone-300 font-light leading-relaxed">
                        {selectedReservation.notes}
                      </p>
                    </div>
                  </div>
                )}

                {/* Metadata */}
                <div>
                  <h4 className="text-lg font-light text-stone-900 dark:text-stone-50 mb-4" style={{ fontFamily: 'Crimson Pro, serif' }}>
                    Reservation <span className="elegant-text">Metadata</span>
                  </h4>
                  <div className="bg-stone-50 dark:bg-stone-900 p-5 space-y-3">
                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-stone-500 dark:text-stone-400 mt-0.5" strokeWidth={1.5} />
                      <div className="flex-1">
                        <div className="text-sm text-stone-600 dark:text-stone-400 font-light">Created</div>
                        <div className="font-light text-stone-900 dark:text-stone-100">
                          {new Date(selectedReservation.created_at).toLocaleString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-stone-500 dark:text-stone-400 mt-0.5" strokeWidth={1.5} />
                      <div className="flex-1">
                        <div className="text-sm text-stone-600 dark:text-stone-400 font-light">Last Updated</div>
                        <div className="font-light text-stone-900 dark:text-stone-100">
                          {new Date(selectedReservation.updated_at).toLocaleString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-stone-500 dark:text-stone-400 mt-0.5" strokeWidth={1.5} />
                      <div className="flex-1">
                        <div className="text-sm text-stone-600 dark:text-stone-400 font-light">Status</div>
                        <div>
                          <span className={`inline-block px-3 py-1 text-xs font-light ${
                            selectedReservation.status === 'confirmed' 
                              ? 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400' 
                              : selectedReservation.status === 'pending' 
                              ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400' 
                              : 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400'
                          }`}>
                            {selectedReservation.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="p-6 border-t border-stone-200 dark:border-stone-700 flex flex-wrap gap-3">
                {!showDeleteConfirm ? (
                  <>
                    <button
                      onClick={() => sendConfirmationEmail(selectedReservation)}
                      disabled={sendingEmail}
                      className="flex-1 py-3 px-4 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 hover:bg-stone-800 dark:hover:bg-stone-200 transition-colors font-light inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {sendingEmail ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" strokeWidth={1.5} />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" strokeWidth={1.5} />
                          Send Confirmation
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="py-3 px-4 border border-red-300 dark:border-red-600 text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors font-light inline-flex items-center justify-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                      Delete
                    </button>
                  </>
                ) : (
                  <>
                    <div className="w-full mb-2">
                      <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 p-4 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                        <div className="flex-1">
                          <p className="text-sm text-red-900 dark:text-red-300 font-light">
                            Are you sure you want to delete this reservation? This action cannot be undone and will free up one spot for the event.
                          </p>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="flex-1 py-3 px-4 border border-stone-300 dark:border-stone-600 hover:border-stone-900 dark:hover:border-stone-300 transition-colors font-light"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDeleteReservation}
                      disabled={actionLoading}
                      className="flex-1 py-3 px-4 bg-red-600 dark:bg-red-700 text-white hover:bg-red-700 dark:hover:bg-red-800 transition-colors font-light inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {actionLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" strokeWidth={1.5} />
                          Deleting...
                        </>
                      ) : (
                        <>
                          <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                          Confirm Delete
                        </>
                      )}
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}