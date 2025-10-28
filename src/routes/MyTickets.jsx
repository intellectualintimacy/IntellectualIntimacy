// src/pages/MyTickets.jsx
import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Ticket, Calendar, MapPin, Clock, Download, QrCode, Loader2, AlertCircle,
  X, Check, RefreshCw, DollarSign, User, Mail, Phone, FileText, XCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import QRCodeLib from 'qrcode';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function MyTickets() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [downloadingTicket, setDownloadingTicket] = useState(false);
  const ticketRef = useRef(null);
  
  // Tab state for filtering
  const [activeTab, setActiveTab] = useState('confirmed'); // 'confirmed', 'cancelled', 'all'
  
  // Cancellation states
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelSuccess, setCancelSuccess] = useState(false);
  
  // Refund states
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundReason, setRefundReason] = useState('');
  const [refundLoading, setRefundLoading] = useState(false);
  const [refundSuccess, setRefundSuccess] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    checkAuthAndFetchTickets();
  }, []);

  const checkAuthAndFetchTickets = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      navigate('/login');
      return;
    }

    setUser(user);
    fetchUserReservations(user.email);
  };

  const fetchUserReservations = async (email) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('reservations')
        .select(`
          *,
          events (
            id,
            title,
            description,
            date,
            start_time,
            end_time,
            location,
            image_url,
            category,
            price,
            is_free
          )
        `)
        .eq('user_email', email)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setReservations(data || []);
    } catch (error) {
      console.error('Error fetching reservations:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateQRCode = async (ticketInfo) => {
    const qrData = JSON.stringify({
      ticketId: ticketInfo.ticket_id,
      eventId: ticketInfo.event_id,
      eventTitle: ticketInfo.events?.title,
      userName: ticketInfo.user_name,
      userEmail: ticketInfo.user_email,
      date: ticketInfo.events?.date,
      location: ticketInfo.events?.location,
      status: ticketInfo.status,
      validatedAt: null
    });

    try {
      const url = await QRCodeLib.toDataURL(qrData, {
        width: 300,
        margin: 2,
        color: {
          dark: '#292524',
          light: '#FFFFFF'
        }
      });
      return url;
    } catch (error) {
      console.error('Error generating QR code:', error);
      return null;
    }
  };

  const handleViewTicket = async (reservation) => {
    setSelectedTicket(reservation);
    setShowTicketModal(true);
    
    // Generate QR code
    const qrUrl = await generateQRCode(reservation);
    setQrCodeUrl(qrUrl);
  };

  const downloadTicketPDF = async () => {
    if (!ticketRef.current || !selectedTicket) return;
    
    setDownloadingTicket(true);
    
    try {
      const canvas = await html2canvas(ticketRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 20, pdfWidth, pdfHeight);
      pdf.save(`ticket-${selectedTicket.ticket_id}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate ticket PDF. Please try again.');
    } finally {
      setDownloadingTicket(false);
    }
  };

  const handleCancelReservation = async () => {
    if (!cancelReason.trim()) {
      alert('Please provide a reason for cancellation');
      return;
    }

    setCancelLoading(true);

    try {
      const { error } = await supabase
        .from('reservations')
        .update({
          status: 'cancelled',
          notes: `${selectedTicket.notes || ''}\n\nCancellation Reason: ${cancelReason}`,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedTicket.id);

      if (error) throw error;

      setCancelSuccess(true);
      
      // Refresh reservations
      setTimeout(() => {
        fetchUserReservations(user.email);
        setShowCancelModal(false);
        setShowTicketModal(false);
        setCancelSuccess(false);
        setCancelReason('');
      }, 2000);

    } catch (error) {
      console.error('Cancellation error:', error);
      alert('Failed to cancel reservation. Please try again.');
    } finally {
      setCancelLoading(false);
    }
  };

  const handleRequestRefund = async () => {
    if (!refundReason.trim()) {
      alert('Please provide a reason for refund request');
      return;
    }

    setRefundLoading(true);

    try {
      // Update reservation status and add refund request
      const { error } = await supabase
        .from('reservations')
        .update({
          payment_status: 'refund_requested',
          notes: `${selectedTicket.notes || ''}\n\nRefund Request: ${refundReason}`,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedTicket.id);

      if (error) throw error;

      setRefundSuccess(true);
      
      // Refresh reservations
      setTimeout(() => {
        fetchUserReservations(user.email);
        setShowRefundModal(false);
        setShowTicketModal(false);
        setRefundSuccess(false);
        setRefundReason('');
      }, 2000);

    } catch (error) {
      console.error('Refund request error:', error);
      alert('Failed to submit refund request. Please try again.');
    } finally {
      setRefundLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-ZA', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'confirmed':
        return 'bg-green-500';
      case 'cancelled':
        return 'bg-red-500';
      case 'pending':
        return 'bg-amber-500';
      default:
        return 'bg-stone-500';
    }
  };

  const getPaymentStatusColor = (status) => {
    switch(status) {
      case 'completed':
        return 'text-green-600 dark:text-green-400';
      case 'pending':
        return 'text-amber-600 dark:text-amber-400';
      case 'refund_requested':
        return 'text-blue-600 dark:text-blue-400';
      case 'refunded':
        return 'text-purple-600 dark:text-purple-400';
      default:
        return 'text-stone-600 dark:text-stone-400';
    }
  };

  // Filter reservations based on active tab
  const filteredReservations = reservations.filter(reservation => {
    if (activeTab === 'all') return true;
    if (activeTab === 'confirmed') return reservation.status === 'confirmed';
    if (activeTab === 'cancelled') return reservation.status === 'cancelled';
    return true;
  });

  // Get counts for each tab
  const confirmedCount = reservations.filter(r => r.status === 'confirmed').length;
  const cancelledCount = reservations.filter(r => r.status === 'cancelled').length;

  const tabs = [
    { id: 'confirmed', label: 'Active', count: confirmedCount, icon: Check },
    { id: 'cancelled', label: 'Cancelled', count: cancelledCount, icon: XCircle },
    { id: 'all', label: 'All', count: reservations.length, icon: Ticket }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 dark:bg-stone-950 pt-32">
        <Loader2 className="w-12 h-12 animate-spin text-stone-400" />
      </div>
    );
  }

  return (
    <main className="pt-32 pb-20 bg-stone-50 dark:bg-stone-950 min-h-screen">
      <div className="max-w-6xl mx-auto px-8 lg:px-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-stone-200 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 mb-6">
            <Ticket className="w-4 h-4 text-stone-600 dark:text-stone-400" strokeWidth={1.5} />
            <span className="text-sm text-stone-600 dark:text-stone-400 font-light">Your Reservations</span>
          </div>

          <h1 className="text-5xl lg:text-6xl font-light mb-4 text-stone-900 dark:text-stone-100" style={{ fontFamily: "'Crimson Pro', serif" }}>
            My <span className="elegant-text">Tickets</span>
          </h1>
          <p className="text-stone-600 dark:text-stone-400 font-light">
            View and manage all your event reservations
          </p>
        </motion.div>

        {/* Advanced Tab Navigation */}
        {reservations.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-12"
          >
            <div className="relative">
              {/* Desktop Tabs */}
              <div className="hidden md:flex items-center justify-center gap-4 bg-white dark:bg-stone-900 rounded-2xl p-2 border border-stone-200 dark:border-stone-800 shadow-sm">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative flex-1 px-6 py-4 rounded-xl font-light transition-all duration-300 ${
                      activeTab === tab.id
                        ? 'bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900 shadow-lg'
                        : 'text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-3">
                      <tab.icon className="w-5 h-5" strokeWidth={1.5} />
                      <span className="text-base">{tab.label}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        activeTab === tab.id
                          ? 'bg-stone-100 dark:bg-stone-900 text-stone-900 dark:text-stone-100'
                          : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
                      }`}>
                        {tab.count}
                      </span>
                    </div>
                    
                    {activeTab === tab.id && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 rounded-xl bg-stone-900 dark:bg-stone-100 -z-10"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                  </button>
                ))}
              </div>

              {/* Mobile Tabs */}
              <div className="md:hidden bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm overflow-hidden">
                {tabs.map((tab, index) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center justify-between px-6 py-4 font-light transition-all duration-300 ${
                      activeTab === tab.id
                        ? 'bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900'
                        : 'text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800'
                    } ${index !== tabs.length - 1 ? 'border-b border-stone-200 dark:border-stone-800' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      <tab.icon className="w-5 h-5" strokeWidth={1.5} />
                      <span className="text-base">{tab.label}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      activeTab === tab.id
                        ? 'bg-stone-100 dark:bg-stone-900 text-stone-900 dark:text-stone-100'
                        : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
                    }`}>
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Stats Bar */}
            <div className="mt-6 flex items-center justify-center gap-8 text-sm">
              <div className="text-center">
                <p className="text-2xl font-light text-stone-900 dark:text-stone-100 mb-1" style={{ fontFamily: "'Crimson Pro', serif" }}>
                  {confirmedCount}
                </p>
                <p className="text-xs uppercase tracking-wider text-stone-500 dark:text-stone-400 font-light">Active Tickets</p>
              </div>
              <div className="h-12 w-px bg-stone-200 dark:bg-stone-800"></div>
              <div className="text-center">
                <p className="text-2xl font-light text-stone-900 dark:text-stone-100 mb-1" style={{ fontFamily: "'Crimson Pro', serif" }}>
                  {reservations.length}
                </p>
                <p className="text-xs uppercase tracking-wider text-stone-500 dark:text-stone-400 font-light">Total Bookings</p>
              </div>
              <div className="h-12 w-px bg-stone-200 dark:bg-stone-800"></div>
              <div className="text-center">
                <p className="text-2xl font-light text-stone-900 dark:text-stone-100 mb-1" style={{ fontFamily: "'Crimson Pro', serif" }}>
                  {cancelledCount}
                </p>
                <p className="text-xs uppercase tracking-wider text-stone-500 dark:text-stone-400 font-light">Cancelled</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Tickets Grid */}
        {reservations.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-stone-200 dark:bg-stone-800 flex items-center justify-center">
              <Ticket className="w-10 h-10 text-stone-400" strokeWidth={1.5} />
            </div>
            <h3 className="text-2xl font-light text-stone-700 dark:text-stone-300 mb-2" style={{ fontFamily: "'Crimson Pro', serif" }}>
              No tickets yet
            </h3>
            <p className="text-stone-500 dark:text-stone-400 font-light mb-6">
              Reserve your spot at upcoming events to see them here
            </p>
            <button
              onClick={() => navigate('/events')}
              className="px-6 py-3 rounded-full bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900 hover:bg-stone-800 dark:hover:bg-stone-200 transition-all duration-300 font-light"
            >
              Browse Events
            </button>
          </motion.div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            <AnimatePresence mode="wait">
              {filteredReservations.length === 0 ? (
                <motion.div
                  key="empty-state"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="col-span-2 text-center py-20"
                >
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-stone-200 dark:bg-stone-800 flex items-center justify-center">
                    {activeTab === 'confirmed' ? (
                      <Check className="w-10 h-10 text-stone-400" strokeWidth={1.5} />
                    ) : (
                      <XCircle className="w-10 h-10 text-stone-400" strokeWidth={1.5} />
                    )}
                  </div>
                  <h3 className="text-2xl font-light text-stone-700 dark:text-stone-300 mb-2" style={{ fontFamily: "'Crimson Pro', serif" }}>
                    No {activeTab} reservations
                  </h3>
                  <p className="text-stone-500 dark:text-stone-400 font-light">
                    {activeTab === 'confirmed' 
                      ? 'You don\'t have any active reservations at the moment'
                      : 'You haven\'t cancelled any reservations'}
                  </p>
                </motion.div>
              ) : (
              filteredReservations.map((reservation, index) => (
              <motion.div
                key={reservation.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
                className="feature-card overflow-hidden hover:shadow-xl transition-all duration-300"
              >
                {/* Event Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={reservation.events?.image_url || 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&q=80'}
                    alt={reservation.events?.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  
                  {/* Status Badge */}
                  <div className="absolute top-4 right-4 flex flex-col gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(reservation.status)}`}>
                      {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                    </span>
                    {reservation.payment_status === 'refund_requested' && (
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-500 text-white">
                        Refund Pending
                      </span>
                    )}
                  </div>
                </div>

                {/* Ticket Details */}
                <div className="p-6">
                  <h3 className="text-2xl font-light mb-4 text-stone-900 dark:text-stone-100" style={{ fontFamily: "'Crimson Pro', serif" }}>
                    {reservation.events?.title}
                  </h3>

                  <div className="space-y-2 mb-6">
                    <div className="flex items-center gap-2 text-sm text-stone-600 dark:text-stone-400 font-light">
                      <Calendar className="w-4 h-4" strokeWidth={1.5} />
                      <span>{formatDate(reservation.events?.date)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-stone-600 dark:text-stone-400 font-light">
                      <Clock className="w-4 h-4" strokeWidth={1.5} />
                      <span>{reservation.events?.start_time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-stone-600 dark:text-stone-400 font-light">
                      <MapPin className="w-4 h-4" strokeWidth={1.5} />
                      <span className="line-clamp-1">{reservation.events?.location}</span>
                    </div>
                  </div>

                  {/* Ticket ID */}
                  <div className="bg-stone-50 dark:bg-stone-800 rounded-lg p-3 mb-4">
                    <p className="text-xs text-stone-500 dark:text-stone-400 mb-1 font-light">Ticket ID</p>
                    <p className="text-sm font-mono text-stone-900 dark:text-stone-100">{reservation.ticket_id}</p>
                  </div>

                  {/* Action Buttons */}
                  <button
                    onClick={() => handleViewTicket(reservation)}
                    disabled={reservation.status === 'cancelled'}
                    className={`w-full py-3 rounded-full font-light transition-all duration-300 flex items-center justify-center gap-2 ${
                      reservation.status === 'cancelled'
                        ? 'bg-stone-200 dark:bg-stone-800 text-stone-400 cursor-not-allowed'
                        : 'bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900 hover:bg-stone-800 dark:hover:bg-stone-200'
                    }`}
                  >
                    <Ticket className="w-4 h-4" strokeWidth={1.5} />
                    <span>{reservation.status === 'cancelled' ? 'Reservation Cancelled' : 'View Full Ticket'}</span>
                  </button>

                  {/* Payment Warning */}
                  {reservation.payment_status === 'pending' && reservation.status !== 'cancelled' && (
                    <div className="mt-4 flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                      <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                      <p className="text-xs text-amber-800 dark:text-amber-200 font-light">
                        Complete payment to confirm your reservation
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            ))
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Full Ticket Modal */}
      <AnimatePresence>
        {showTicketModal && selectedTicket && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowTicketModal(false)}
          >
            <motion.div
              className="bg-white dark:bg-stone-900 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative border border-stone-200 dark:border-stone-800 shadow-2xl"
              initial={{ scale: 0.9, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 50 }}
              transition={{ duration: 0.3, type: "spring" }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="absolute top-6 right-6 z-10 p-2 rounded-full bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors duration-300"
                onClick={() => setShowTicketModal(false)}
              >
                <X size={24} strokeWidth={1.5} />
              </button>

              <div className="p-8 md:p-12">
                {/* Digital Ticket */}
                <div ref={ticketRef} className="bg-gradient-to-br from-stone-50 to-stone-100 dark:from-stone-800 dark:to-stone-900 rounded-2xl border-2 border-stone-200 dark:border-stone-700 overflow-hidden mb-6">
                  {/* Ticket Header */}
                  <div className="bg-gradient-to-r from-amber-500 to-amber-600 dark:from-amber-600 dark:to-amber-700 p-6 text-white">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <Ticket className="w-8 h-8" strokeWidth={1.5} />
                        <h3 className="text-2xl font-light" style={{ fontFamily: "'Crimson Pro', serif" }}>
                          Event Ticket
                        </h3>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedTicket.status)} text-white`}>
                        {selectedTicket.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-amber-100 text-sm font-light">Present this QR code at the event entrance</p>
                  </div>

                  {/* Ticket Body */}
                  <div className="p-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Event & User Details */}
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-2xl font-light text-stone-900 dark:text-stone-100 mb-2" style={{ fontFamily: "'Crimson Pro', serif" }}>
                            {selectedTicket.events?.title}
                          </h4>
                          <p className="text-sm text-stone-600 dark:text-stone-400 font-light">
                            {selectedTicket.events?.description?.substring(0, 100)}...
                          </p>
                          <div className="h-px bg-stone-300 dark:bg-stone-700 my-4"></div>
                        </div>

                        <div>
                          <p className="text-xs uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1 font-light">
                            Attendee Name
                          </p>
                          <p className="text-stone-900 dark:text-stone-100 font-light flex items-center gap-2">
                            <User className="w-4 h-4" strokeWidth={1.5} />
                            {selectedTicket.user_name}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1 font-light">
                            Email
                          </p>
                          <p className="text-stone-900 dark:text-stone-100 font-light flex items-center gap-2 text-sm">
                            <Mail className="w-4 h-4" strokeWidth={1.5} />
                            {selectedTicket.user_email}
                          </p>
                        </div>

                        {selectedTicket.user_phone && (
                          <div>
                            <p className="text-xs uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1 font-light">
                              Phone
                            </p>
                            <p className="text-stone-900 dark:text-stone-100 font-light flex items-center gap-2">
                              <Phone className="w-4 h-4" strokeWidth={1.5} />
                              {selectedTicket.user_phone}
                            </p>
                          </div>
                        )}

                        <div>
                          <p className="text-xs uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1 font-light">
                            Date & Time
                          </p>
                          <p className="text-stone-900 dark:text-stone-100 font-light">
                            {formatDate(selectedTicket.events?.date)}
                          </p>
                          <p className="text-sm text-stone-600 dark:text-stone-400 font-light">
                            {selectedTicket.events?.start_time} - {selectedTicket.events?.end_time}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1 font-light">
                            Location
                          </p>
                          <p className="text-stone-900 dark:text-stone-100 font-light">
                            {selectedTicket.events?.location}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1 font-light">
                            Ticket ID
                          </p>
                          <p className="text-sm font-mono text-stone-900 dark:text-stone-100">
                            {selectedTicket.ticket_id}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1 font-light">
                            Payment Status
                          </p>
                          <p className={`font-light ${getPaymentStatusColor(selectedTicket.payment_status)}`}>
                            {selectedTicket.payment_status.replace('_', ' ').toUpperCase()}
                          </p>
                          {!selectedTicket.events?.is_free && (
                            <p className="text-sm text-stone-600 dark:text-stone-400 font-light">
                              Amount: R{selectedTicket.payment_amount}
                            </p>
                          )}
                        </div>

                        <div>
                          <p className="text-xs uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1 font-light">
                            Booked On
                          </p>
                          <p className="text-sm text-stone-600 dark:text-stone-400 font-light">
                            {formatDateTime(selectedTicket.created_at)}
                          </p>
                        </div>
                      </div>

                      {/* QR Code */}
                      <div className="flex flex-col items-center justify-center">
                        <div className="bg-white p-4 rounded-2xl border-2 border-stone-300 dark:border-stone-600">
                          {qrCodeUrl ? (
                            <img 
                              src={qrCodeUrl} 
                              alt="Ticket QR Code" 
                              className="w-56 h-56"
                            />
                          ) : (
                            <div className="w-56 h-56 flex items-center justify-center">
                              <Loader2 className="w-8 h-8 animate-spin text-stone-400" />
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-center text-stone-500 dark:text-stone-400 mt-3 font-light">
                          Scan this code at check-in
                        </p>
                      </div>
                    </div>

                    {/* Special Notes */}
                    {selectedTicket.notes && (
                      <div className="mt-6 pt-6 border-t border-stone-300 dark:border-stone-700">
                        <p className="text-xs uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-2 font-light">
                          Special Notes
                        </p>
                        <div className="flex items-start gap-2">
                          <FileText className="w-4 h-4 text-stone-500 dark:text-stone-400 flex-shrink-0 mt-1" strokeWidth={1.5} />
                          <p className="text-sm text-stone-600 dark:text-stone-400 font-light">
                            {selectedTicket.notes}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Ticket Footer */}
                    <div className="mt-6 pt-6 border-t border-stone-300 dark:border-stone-700">
                      <div className="flex items-start gap-2 text-xs text-stone-500 dark:text-stone-400 font-light">
                        <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                        <p>
                          Please arrive 15 minutes before the event starts. This ticket is non-transferable and must be presented for entry.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                {selectedTicket.status !== 'cancelled' && (
                  <div className="space-y-3">
                    <button
                      onClick={downloadTicketPDF}
                      disabled={downloadingTicket}
                      className="w-full py-4 rounded-full bg-gradient-to-r from-amber-600 to-amber-500 text-white font-light hover:from-amber-500 hover:to-amber-400 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {downloadingTicket ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" strokeWidth={1.5} />
                          <span>Generating PDF...</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-5 h-5" strokeWidth={1.5} />
                          <span>Download Ticket PDF</span>
                        </>
                      )}
                    </button>

                    <div className="grid grid-cols-2 gap-3">
                      {selectedTicket.payment_status === 'completed' && !selectedTicket.events?.is_free && (
                        <button
                          onClick={() => {
                            setShowTicketModal(false);
                            setShowRefundModal(true);
                          }}
                          className="py-3 rounded-full border border-blue-500 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-300 flex items-center justify-center gap-2 font-light"
                        >
                          <DollarSign className="w-4 h-4" strokeWidth={1.5} />
                          <span>Request Refund</span>
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setShowTicketModal(false);
                          setShowCancelModal(true);
                        }}
                        className={`py-3 rounded-full border border-red-500 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-300 flex items-center justify-center gap-2 font-light ${
                          selectedTicket.payment_status === 'completed' && !selectedTicket.events?.is_free ? '' : 'col-span-2'
                        }`}
                      >
                        <XCircle className="w-4 h-4" strokeWidth={1.5} />
                        <span>Cancel Reservation</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cancel Reservation Modal */}
      <AnimatePresence>
        {showCancelModal && selectedTicket && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !cancelLoading && setShowCancelModal(false)}
          >
            <motion.div
              className="bg-white dark:bg-stone-900 rounded-3xl max-w-lg w-full p-8 border border-stone-200 dark:border-stone-800 shadow-2xl relative"
              initial={{ scale: 0.9, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 50 }}
              transition={{ duration: 0.3, type: "spring" }}
              onClick={(e) => e.stopPropagation()}
            >
              {!cancelSuccess ? (
                <>
                  <button
                    className="absolute top-6 right-6 p-2 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-stone-100 hover:bg-stone-200 dark:hover:bg-stone-700"
                    onClick={() => setShowCancelModal(false)}
                    disabled={cancelLoading}
                  >
                    <X size={20} strokeWidth={1.5} />
                  </button>

                  <div className="text-center mb-6">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                      <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" strokeWidth={1.5} />
                    </div>
                    <h2 className="text-3xl font-light text-stone-900 dark:text-stone-100 mb-2" style={{ fontFamily: "'Crimson Pro', serif" }}>
                      Cancel Reservation?
                    </h2>
                    <p className="text-stone-600 dark:text-stone-400 font-light">
                      This action cannot be undone
                    </p>
                  </div>

                  <div className="bg-stone-50 dark:bg-stone-800 rounded-xl p-4 mb-6">
                    <p className="text-sm text-stone-700 dark:text-stone-300 font-light mb-2">
                      <strong className="font-normal">Event:</strong> {selectedTicket.events?.title}
                    </p>
                    <p className="text-sm text-stone-700 dark:text-stone-300 font-light">
                      <strong className="font-normal">Date:</strong> {formatDate(selectedTicket.events?.date)}
                    </p>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-light text-stone-700 dark:text-stone-300 mb-2">
                      Reason for Cancellation *
                    </label>
                    <textarea
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:border-stone-400 dark:focus:border-stone-600 font-light resize-none"
                      placeholder="Please let us know why you're cancelling..."
                      disabled={cancelLoading}
                    />
                  </div>

                  <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 mb-6 border border-amber-200 dark:border-amber-800">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                      <div className="text-sm text-amber-800 dark:text-amber-200 font-light">
                        <p className="font-normal mb-1">Important Notice</p>
                        <p>Once cancelled, this reservation cannot be restored. {!selectedTicket.events?.is_free && 'If you paid for this event, please submit a refund request separately.'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowCancelModal(false)}
                      disabled={cancelLoading}
                      className="flex-1 py-3 rounded-full border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 transition-all duration-300 font-light"
                    >
                      Keep Reservation
                    </button>
                    <button
                      onClick={handleCancelReservation}
                      disabled={cancelLoading || !cancelReason.trim()}
                      className="flex-1 py-3 rounded-full bg-red-600 text-white hover:bg-red-700 transition-all duration-300 font-light disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {cancelLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" strokeWidth={1.5} />
                          <span>Cancelling...</span>
                        </>
                      ) : (
                        <span>Yes, Cancel</span>
                      )}
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-6">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <Check className="w-10 h-10 text-green-600 dark:text-green-400" strokeWidth={1.5} />
                  </div>
                  <h2 className="text-3xl font-light text-stone-900 dark:text-stone-100 mb-2" style={{ fontFamily: "'Crimson Pro', serif" }}>
                    Reservation Cancelled
                  </h2>
                  <p className="text-stone-600 dark:text-stone-400 font-light">
                    Your reservation has been successfully cancelled
                  </p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Refund Request Modal */}
      <AnimatePresence>
        {showRefundModal && selectedTicket && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !refundLoading && setShowRefundModal(false)}
          >
            <motion.div
              className="bg-white dark:bg-stone-900 rounded-3xl max-w-lg w-full p-8 border border-stone-200 dark:border-stone-800 shadow-2xl relative"
              initial={{ scale: 0.9, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 50 }}
              transition={{ duration: 0.3, type: "spring" }}
              onClick={(e) => e.stopPropagation()}
            >
              {!refundSuccess ? (
                <>
                  <button
                    className="absolute top-6 right-6 p-2 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-stone-100 hover:bg-stone-200 dark:hover:bg-stone-700"
                    onClick={() => setShowRefundModal(false)}
                    disabled={refundLoading}
                  >
                    <X size={20} strokeWidth={1.5} />
                  </button>

                  <div className="text-center mb-6">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <DollarSign className="w-8 h-8 text-blue-600 dark:text-blue-400" strokeWidth={1.5} />
                    </div>
                    <h2 className="text-3xl font-light text-stone-900 dark:text-stone-100 mb-2" style={{ fontFamily: "'Crimson Pro', serif" }}>
                      Request Refund
                    </h2>
                    <p className="text-stone-600 dark:text-stone-400 font-light">
                      Submit your refund request below
                    </p>
                  </div>

                  <div className="bg-stone-50 dark:bg-stone-800 rounded-xl p-4 mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-stone-700 dark:text-stone-300 font-light">Event:</span>
                      <span className="text-sm text-stone-900 dark:text-stone-100 font-normal">{selectedTicket.events?.title}</span>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-stone-700 dark:text-stone-300 font-light">Amount Paid:</span>
                      <span className="text-lg text-stone-900 dark:text-stone-100 font-normal">R{selectedTicket.payment_amount}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-stone-700 dark:text-stone-300 font-light">Refund Amount:</span>
                      <span className="text-lg text-green-600 dark:text-green-400 font-normal">R{selectedTicket.payment_amount}</span>
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-light text-stone-700 dark:text-stone-300 mb-2">
                      Reason for Refund Request *
                    </label>
                    <textarea
                      value={refundReason}
                      onChange={(e) => setRefundReason(e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:border-stone-400 dark:focus:border-stone-600 font-light resize-none"
                      placeholder="Please explain why you're requesting a refund..."
                      disabled={refundLoading}
                    />
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 mb-6 border border-blue-200 dark:border-blue-800">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                      <div className="text-sm text-blue-800 dark:text-blue-200 font-light">
                        <p className="font-normal mb-1">Refund Processing Time</p>
                        <p>Refunds are typically processed within 5-7 business days. You'll receive a confirmation email once approved.</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowRefundModal(false)}
                      disabled={refundLoading}
                      className="flex-1 py-3 rounded-full border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 transition-all duration-300 font-light"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleRequestRefund}
                      disabled={refundLoading || !refundReason.trim()}
                      className="flex-1 py-3 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-all duration-300 font-light disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {refundLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" strokeWidth={1.5} />
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <span>Submit Request</span>
                      )}
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-6">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <Check className="w-10 h-10 text-green-600 dark:text-green-400" strokeWidth={1.5} />
                  </div>
                  <h2 className="text-3xl font-light text-stone-900 dark:text-stone-100 mb-2" style={{ fontFamily: "'Crimson Pro', serif" }}>
                    Refund Request Submitted
                  </h2>
                  <p className="text-stone-600 dark:text-stone-400 font-light mb-4">
                    We've received your refund request for <strong className="font-normal">R{selectedTicket.payment_amount}</strong>
                  </p>
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
                    <p className="text-sm text-green-800 dark:text-green-200 font-light">
                      You'll receive an email confirmation shortly. Refunds are typically processed within 5-7 business days.
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}