import React, { useEffect, useState, useRef } from "react";
import { supabase } from "../../lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Calendar, MapPin, Clock, ChevronRight, X, Search, 
  Filter, Users, Star, Sparkles, ArrowRight,
  CheckCircle2, Heart, Share2, BookmarkPlus, Grid, List, 
  MessageCircle, AlertCircle, Check, Loader2, Download, Ticket
} from "lucide-react";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import QRCode from 'qrcode';

const PAYSTACK_PUBLIC_KEY = "pk_test_3acf5a388d0fddb0abbeba40e811993c38580e65";

const Events = () => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sortBy, setSortBy] = useState("date");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [viewMode, setViewMode] = useState("grid");
  const [dateFilter, setDateFilter] = useState("all");
  const [priceFilter, setPriceFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [userEmail, setUserEmail] = useState("");
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentReference, setPaymentReference] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Reservation modal states
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [reservationLoading, setReservationLoading] = useState(false);
  const [showLoginCheckModal, setShowLoginCheckModal] = useState(false);
  const [proceedAsGuest, setProceedAsGuest] = useState(false);
  const [reservationSuccess, setReservationSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    notes: ""
  });

    // Ticket states
  const [ticketData, setTicketData] = useState(null);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [downloadingTicket, setDownloadingTicket] = useState(false);
  const ticketRef = useRef(null);

useEffect(() => {
  checkAuthStatus();
  fetchEvents();
  loadUserEmail();
}, []);

const loadUserEmail = async () => {
  try {
    // get authenticated user
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (!error && user) {
      // User is logged in
      setUserEmail(user.email);
      localStorage.setItem("userEmail", user.email);
      fetchFavorites(user.email);
    } else {
      // User is not logged in - try localStorage
      const email = localStorage.getItem("userEmail") || "";
      if (email) {
        setUserEmail(email);
        fetchFavorites(email);
      }
    }
  } catch (error) {
    console.error("Error loading user:", error);
    // Fallback to localStorage
    const email = localStorage.getItem("userEmail") || "";
    setUserEmail(email);
    if (email) {
      fetchFavorites(email);
    }
  }
  };
  
  const checkAuthStatus = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setCurrentUser(user);
      setIsAuthenticated(true);
      setUserEmail(user.email);
    }
  } catch (error) {
    console.error("Auth check error:", error);
  }
};

const fetchEvents = async () => {
  setLoading(true);
  try {
    // First, fetch all events
    const { data: eventsData, error: eventsError } = await supabase
      .from("events")
      .select("*")
      .order("date", { ascending: true });

    if (eventsError) {
      console.error("Error fetching events:", eventsError);
      setEvents([]);
      setFilteredEvents([]);
      return;
    }

    // Then, fetch reservation counts separately
    const { data: reservationCounts, error: countError } = await supabase
      .from("reservations")
      .select("event_id, status")
      .eq("status", "confirmed");

    if (countError) {
      console.error("Error fetching reservations:", countError);
      // Continue without reservation counts
    }

    // Calculate available spots for each event
    const eventsWithSpots = eventsData.map(event => {
      const reservationCount = reservationCounts
        ? reservationCounts.filter(r => r.event_id === event.id).length
        : 0;
      const capacity = event.capacity || 50;
      
      return {
        ...event,
        available_spots: Math.max(0, capacity - reservationCount)
      };
    });

    console.log("Events loaded:", eventsWithSpots.length);
    setEvents(eventsWithSpots);
    setFilteredEvents(eventsWithSpots);
  } catch (err) {
    console.error("Unexpected error:", err);
    setEvents([]);
    setFilteredEvents([]);
  } finally {
    setLoading(false);
  }
};

  const fetchFavorites = async (email) => {
    const { data, error } = await supabase
      .from("favorites")
      .select("event_id")
      .eq("user_email", email);

    if (!error && data) {
      setFavorites(data.map(f => f.event_id));
    }
  };

  const toggleFavorite = async (eventId) => {
    if (!userEmail) {
      const email = prompt("Please enter your email to save favorites:");
      if (!email) return;
      setUserEmail(email);
      localStorage.setItem("userEmail", email);
    }

    const isFavorited = favorites.includes(eventId);

    if (isFavorited) {
      const { error } = await supabase
        .from("favorites")
        .delete()
        .eq("event_id", eventId)
        .eq("user_email", userEmail);

      if (!error) {
        setFavorites(favorites.filter(id => id !== eventId));
      }
    } else {
      const { error } = await supabase
        .from("favorites")
        .insert([{ event_id: eventId, user_email: userEmail }]);

      if (!error) {
        setFavorites([...favorites, eventId]);
      }
    }
  };

const handleReserveSpot = async (event) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      // User is logged in - proceed directly to reservation
      setReservationSuccess(false);
      setTicketData(null);
      setQrCodeUrl('');
      setUserEmail(user.email);
      setFormData({
        name: user.user_metadata?.full_name || "",
        email: user.email,
        phone: "",
        notes: ""
      });
      setSelectedEvent(event);
      setShowReservationModal(true);
    } else {
      // User not logged in show login check modal
      setSelectedEvent(event);
      setShowLoginCheckModal(true);
    }
  } catch (error) {
    console.error("Error checking auth:", error);
    // If error show login modal
    setSelectedEvent(event);
    setShowLoginCheckModal(true);
  }
};

  const generateTicketId = () => {
    return `TKT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  };

    const generateQRCode = async (ticketInfo) => {
    const qrData = JSON.stringify({
      ticketId: ticketInfo.ticketId,
      eventId: ticketInfo.eventId,
      eventTitle: ticketInfo.eventTitle,
      userName: ticketInfo.userName,
      userEmail: ticketInfo.userEmail,
      date: ticketInfo.date,
      location: ticketInfo.location,
      validatedAt: null
    });
      
        try {
      const url = await QRCode.toDataURL(qrData, {
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

    const downloadTicketPDF = async () => {
    if (!ticketRef.current || !ticketData) return;
    
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
      pdf.save(`ticket-${ticketData.ticketId}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate ticket PDF. Please try again.');
    } finally {
      setDownloadingTicket(false);
    }
  };

  const processPaystackPayment = (amount, email, name) => {
  return new Promise((resolve, reject) => {
    if (!window.PaystackPop) {
      reject(new Error("Paystack script not loaded. Add https://js.paystack.co/v1/inline.js to index.html"));
      return;
    }

    const amountKobo = Math.round(Number(amount) * 100); // Convert to kobo/cents

    const handler = window.PaystackPop.setup({
      key: PAYSTACK_PUBLIC_KEY,
      email: email,
      amount: amountKobo,
      currency: "ZAR",
      metadata: {
        custom_fields: [
          {
            display_name: "Event",
            variable_name: "event_name",
            value: selectedEvent.title
          },
          {
            display_name: "Attendee Name",
            variable_name: "attendee_name",
            value: name
          },
          {
            display_name: "Event ID",
            variable_name: "event_id",
            value: selectedEvent.id
          }
        ]
      },
      onClose: function () {
        reject(new Error("Payment window closed"));
      },
      callback: function (response) {
        // Payment successful
        resolve(response.reference);
      },
    });

      handler.openIframe();
    });
  };

const submitReservation = async (e) => {
  e.preventDefault();
  setReservationLoading(true);

  try {
    // Generate unique ticket ID
    const ticketId = generateTicketId();

    // Save email for future use
    if (formData.email) {
      setUserEmail(formData.email);
      localStorage.setItem("userEmail", formData.email);
    }

    // If event is not free, process payment first
    if (!selectedEvent.is_free) {
      setPaymentProcessing(true);
      
      try {
        // Process Paystack payment
        const reference = await processPaystackPayment(
          selectedEvent.price,
          formData.email,
          formData.name
        );
        
        setPaymentReference(reference);
        setPaymentSuccess(true);
        setPaymentProcessing(false);

        // Now proceed with reservation with payment confirmed
        const { data, error } = await supabase
          .from("reservations")
          .insert([{
            event_id: selectedEvent.id,
            user_email: formData.email,
            user_name: formData.name,
            user_phone: formData.phone,
            notes: formData.notes,
            status: "confirmed",
            payment_status: "completed", // Payment completed
            payment_amount: selectedEvent.price,
            ticket_id: ticketId,
            payment_reference: reference // Store Paystack reference
          }])
          .select();

        if (error) throw error;

        // Generate QR code
        const ticketInfo = {
          ticketId,
          eventId: selectedEvent.id,
          eventTitle: selectedEvent.title,
          userName: formData.name,
          userEmail: formData.email,
          date: selectedEvent.date,
          location: selectedEvent.location
        };

        const qrUrl = await generateQRCode(ticketInfo);
        setQrCodeUrl(qrUrl);
        setTicketData({ ...ticketInfo, reservation: data[0] });

        setReservationSuccess(true);
        
        // Refresh events to update available spots
        setTimeout(() => {
          fetchEvents();
        }, 1500);

      } catch (paymentError) {
        setPaymentProcessing(false);
        setReservationLoading(false);
        console.error("Payment error:", paymentError);
        alert(paymentError.message || "Payment failed. Please try again.");
        return;
      }
    } else {
      // Free event - proceed without payment
      const { data, error } = await supabase
        .from("reservations")
        .insert([{
          event_id: selectedEvent.id,
          user_email: formData.email,
          user_name: formData.name,
          user_phone: formData.phone,
          notes: formData.notes,
          status: "confirmed",
          payment_status: "completed", // Free event
          payment_amount: 0,
          ticket_id: ticketId
        }])
        .select();

      if (error) throw error;

      // Generate QR code
      const ticketInfo = {
        ticketId,
        eventId: selectedEvent.id,
        eventTitle: selectedEvent.title,
        userName: formData.name,
        userEmail: formData.email,
        date: selectedEvent.date,
        location: selectedEvent.location
      };

      const qrUrl = await generateQRCode(ticketInfo);
      setQrCodeUrl(qrUrl);
      setTicketData({ ...ticketInfo, reservation: data[0] });

      setReservationSuccess(true);
      
      // Refresh events to update available spots
      setTimeout(() => {
        fetchEvents();
      }, 1500);
    }

  } catch (error) {
    console.error("Reservation error:", error);
    alert("Failed to reserve spot. Please try again.");
  } finally {
    setReservationLoading(false);
  }
};

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-ZA", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString("en-ZA", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  useEffect(() => {
    let filtered = [...events];

    if (category !== "All") {
      filtered = filtered.filter(
        (e) => e.category?.toLowerCase() === category.toLowerCase()
      );
    }

    if (search.trim() !== "") {
      filtered = filtered.filter(
        (e) =>
          e.title.toLowerCase().includes(search.toLowerCase()) ||
          e.location.toLowerCase().includes(search.toLowerCase()) ||
          e.description.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (dateFilter !== "all") {
      const now = new Date();
      filtered = filtered.filter((e) => {
        const eventDate = new Date(e.date);
        const diffDays = Math.ceil((eventDate - now) / (1000 * 60 * 60 * 24));
        
        if (dateFilter === "today") return diffDays === 0;
        if (dateFilter === "week") return diffDays <= 7;
        if (dateFilter === "month") return diffDays <= 30;
        return true;
      });
    }

    if (priceFilter !== "all") {
      if (priceFilter === "free") {
        filtered = filtered.filter(e => e.is_free);
      } else if (priceFilter === "paid") {
        filtered = filtered.filter(e => !e.is_free);
      }
    }

    if (sortBy === "date") {
      filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
    } else if (sortBy === "location") {
      filtered.sort((a, b) => a.location.localeCompare(b.location));
    } else if (sortBy === "popular") {
      filtered.sort((a, b) => (b.attendees || 0) - (a.attendees || 0));
    }

    setFilteredEvents(filtered);
  }, [category, search, sortBy, events, dateFilter, priceFilter]);

  const stats = [
    { label: "Total Events", value: events.length, icon: Calendar },
    { label: "Categories", value: "5+", icon: Grid },
    { label: "Attendees", value: "1.2k+", icon: Users },
    { label: "Satisfaction", value: "98%", icon: Star },
  ];

  const categories = [
    { name: "All", icon: Grid },
    { name: "Conversations", icon: MessageCircle },
    { name: "Workshops", icon: Sparkles },
    { name: "Retreats", icon: Heart },
    { name: "Gatherings", icon: Users },
  ];

  return (
    <main className="pt-32 bg-gradient-to-b from-stone-50 to-white dark:from-stone-950 dark:to-stone-900">
      {/* Hero Section */}
      <section className="py-20 lg:py-32">
        <div className="max-w-4xl mx-auto px-8 lg:px-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="elegant-divider mb-8"></div>
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-stone-200 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 mb-6"
            >
              <Sparkles className="w-4 h-4 text-stone-600 dark:text-stone-400" strokeWidth={1.5} />
              <span className="text-sm text-stone-600 dark:text-stone-400 font-light">Transformative Experiences Await</span>
            </motion.div>

            <h1 className="text-6xl lg:text-7xl mb-8 font-light" style={{ fontFamily: 'Crimson Pro, serif' }}>
              Upcoming <span className="elegant-text">Events</span>
            </h1>
            
            <p className="text-xl text-stone-600 dark:text-stone-300 leading-relaxed font-light max-w-3xl mx-auto">
              Explore transformative dialogues, intimate workshops, and soulful gatherings
              designed to elevate consciousness and foster genuine connection.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white dark:bg-stone-900">
        <div className="max-w-6xl mx-auto px-8 lg:px-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, idx) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * idx, duration: 0.6 }}
                className="text-center p-6 bg-stone-50 dark:bg-stone-800/50 rounded-2xl border border-stone-200 dark:border-stone-700 hover:border-stone-400 dark:hover:border-stone-600 transition-all duration-300"
              >
                <stat.icon className="w-8 h-8 text-stone-600 dark:text-stone-400 mx-auto mb-3" strokeWidth={1.5} />
                <div className="text-4xl font-extralight tracking-wider text-stone-900 dark:text-stone-100 mb-1" style={{ fontFamily: "'Crimson Pro', serif" }}>
                  {stat.value}
                </div>
                <div className="text-xs uppercase tracking-widest text-stone-500 dark:text-stone-400 font-light" style={{ letterSpacing: '0.15em' }}>
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Advanced Filter Section */}
      <section className="sticky top-0 z-40 bg-stone-50/95 dark:bg-stone-950/95 backdrop-blur-xl border-b border-stone-200 dark:border-stone-800 shadow-sm">
        <div className="max-w-6xl mx-auto px-8 lg:px-16 py-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between mb-6">
            <div className="relative flex-1 w-full lg:max-w-xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" strokeWidth={1.5} />
              <input
                type="text"
                placeholder="Search events, locations, topics..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-full pl-12 pr-4 py-3 text-base focus:outline-none focus:border-stone-400 dark:focus:border-stone-600 text-stone-900 dark:text-stone-100 placeholder-stone-400 transition-all duration-300 font-light"
              />
            </div>

            <div className="flex gap-3 items-center">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-5 py-3 rounded-full border transition-all duration-300 font-light ${
                  showFilters
                    ? "bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900 border-stone-900 dark:border-stone-100"
                    : "border-stone-300 dark:border-stone-700 hover:border-stone-400 dark:hover:border-stone-600 text-stone-700 dark:text-stone-300"
                }`}
              >
                <Filter className="w-4 h-4" strokeWidth={1.5} />
                <span className="hidden md:inline">Filters</span>
              </button>

              <div className="flex gap-2 bg-white dark:bg-stone-900 rounded-full p-1 border border-stone-200 dark:border-stone-800">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-full transition-all duration-300 ${
                    viewMode === "grid" ? "bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900" : "text-stone-400 hover:text-stone-700 dark:hover:text-stone-300"
                  }`}
                >
                  <Grid className="w-4 h-4" strokeWidth={1.5} />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-full transition-all duration-300 ${
                    viewMode === "list" ? "bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900" : "text-stone-400 hover:text-stone-700 dark:hover:text-stone-300"
                  }`}
                >
                  <List className="w-4 h-4" strokeWidth={1.5} />
                </button>
              </div>
            </div>
          </div>

          <div className="flex gap-3 flex-wrap justify-center lg:justify-start">
            {categories.map((cat) => (
              <button
                key={cat.name}
                onClick={() => setCategory(cat.name)}
                className={`group relative px-6 py-2.5 rounded-full border transition-all duration-300 font-light ${
                  category === cat.name
                    ? "bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900 border-stone-900 dark:border-stone-100"
                    : "border-stone-300 dark:border-stone-700 hover:border-stone-400 dark:hover:border-stone-600 text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100"
                }`}
              >
                <div className="flex items-center gap-2">
                  <cat.icon className="w-4 h-4" strokeWidth={1.5} />
                  <span>{cat.name}</span>
                </div>
              </button>
            ))}
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="grid md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-stone-200 dark:border-stone-800">
                  <div>
                    <label className="text-sm text-stone-500 dark:text-stone-400 mb-2 block font-light">Date Range</label>
                    <select
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                      className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl px-4 py-2.5 text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:border-stone-400 dark:focus:border-stone-600 font-light"
                    >
                      <option value="all">All Dates</option>
                      <option value="today">Today</option>
                      <option value="week">This Week</option>
                      <option value="month">This Month</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm text-stone-500 dark:text-stone-400 mb-2 block font-light">Sort By</label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl px-4 py-2.5 text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:border-stone-400 dark:focus:border-stone-600 font-light"
                    >
                      <option value="date">Date (Soonest)</option>
                      <option value="location">Location</option>
                      <option value="popular">Most Popular</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm text-stone-500 dark:text-stone-400 mb-2 block font-light">Price Range</label>
                    <select
                      value={priceFilter}
                      onChange={(e) => setPriceFilter(e.target.value)}
                      className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl px-4 py-2.5 text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:border-stone-400 dark:focus:border-stone-600 font-light"
                    >
                      <option value="all">All Prices</option>
                      <option value="free">Free</option>
                      <option value="paid">Paid</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Events Grid */}
      <section className="py-20 lg:py-32 bg-white dark:bg-stone-900">
        <div className="max-w-6xl mx-auto px-8 lg:px-16">
          {loading ? (
            <div className="flex flex-col justify-center items-center py-32">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-stone-900 dark:border-stone-100"></div>
              <p className="text-stone-500 dark:text-stone-400 mt-6 font-light">Loading extraordinary experiences...</p>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-32">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-stone-200 dark:bg-stone-800 flex items-center justify-center">
                <Search className="w-10 h-10 text-stone-400 dark:text-stone-600" strokeWidth={1.5} />
              </div>
              <h3 className="text-2xl font-light text-stone-700 dark:text-stone-300 mb-2" style={{ fontFamily: "'Crimson Pro', serif" }}>
                No events found
              </h3>
              <p className="text-stone-500 dark:text-stone-400 font-light">Try adjusting your filters or search terms</p>
            </div>
          ) : (
            <>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12 text-center">
                <h2 className="text-3xl font-light text-stone-900 dark:text-stone-100 mb-2" style={{ fontFamily: "'Crimson Pro', serif" }}>
                  {filteredEvents.length} {filteredEvents.length === 1 ? 'Event' : 'Events'} <span className="elegant-text">Found</span>
                </h2>
                <p className="text-stone-500 dark:text-stone-400 font-light">Curated experiences for conscious growth</p>
              </motion.div>

              <motion.div
                className={viewMode === "grid" ? "grid md:grid-cols-2 lg:grid-cols-3 gap-8" : "space-y-8"}
                initial="hidden"
                animate="visible"
                variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}
              >
                {filteredEvents.map((event) => (
                  <motion.div
                    key={event.id}
                    variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } }}
                    className="group"
                  >
                    <div className="feature-card cursor-pointer hover:shadow-xl transition-all duration-500 overflow-hidden">
                      <div className="relative overflow-hidden rounded-t-2xl">
                        <img src={event.image_url} alt={event.title} className="h-64 w-full object-cover group-hover:scale-105 transition-transform duration-700" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                        
                        <div className="absolute top-4 left-4 flex gap-2">
                          {event.category && (
                            <span className="px-3 py-1 rounded-full bg-stone-100 dark:bg-stone-900 backdrop-blur-sm text-xs font-light text-stone-900 dark:text-stone-100 border border-stone-200 dark:border-stone-800">
                              {event.category}
                            </span>
                          )}
                          {event.is_free ? (
                            <span className="px-3 py-1 rounded-full bg-green-500/90 backdrop-blur-sm text-xs font-light text-white border border-green-600">
                              Free
                            </span>
                          ) : (
                            <span className="px-3 py-1 rounded-full bg-amber-500/90 backdrop-blur-sm text-xs font-light text-white border border-amber-600">
                              R{event.price}
                            </span>
                          )}
                        </div>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(event.id);
                          }}
                          className="absolute top-4 right-4 p-2 rounded-full bg-white/90 dark:bg-stone-900/90 backdrop-blur-sm hover:bg-white dark:hover:bg-stone-800 transition-colors duration-300"
                        >
                          <Heart 
                            className={`w-4 h-4 ${favorites.includes(event.id) ? 'fill-red-500 text-red-500' : 'text-stone-700 dark:text-stone-300'}`} 
                            strokeWidth={1.5} 
                          />
                        </button>

                        {event.available_spots <= 5 && event.available_spots > 0 && (
                          <div className="absolute bottom-4 left-4">
                            <span className="px-3 py-1 rounded-full bg-red-500/90 backdrop-blur-sm text-xs font-light text-white border border-red-600">
                              Only {event.available_spots} spots left!
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="p-6">
                        <h3 className="text-2xl font-light mb-3 text-stone-900 dark:text-stone-100" style={{ fontFamily: "'Crimson Pro', serif" }}>
                          {event.title}
                        </h3>
                        <p className="text-stone-600 dark:text-stone-400 mb-5 line-clamp-2 text-sm leading-relaxed font-light">
                          {event.description}
                        </p>

                        <div className="space-y-2 mb-6">
                          <div className="flex items-center gap-2 text-sm text-stone-500 dark:text-stone-400 font-light">
                            <Calendar className="w-4 h-4" strokeWidth={1.5} />
                            <span>{formatDate(event.date)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-stone-500 dark:text-stone-400 font-light">
                            <Clock className="w-4 h-4" strokeWidth={1.5} />
                            <span>{event.start_time}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-stone-500 dark:text-stone-400 font-light">
                            <MapPin className="w-4 h-4" strokeWidth={1.5} />
                            <span className="line-clamp-1">{event.location}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-stone-500 dark:text-stone-400 font-light">
                            <Users className="w-4 h-4" strokeWidth={1.5} />
                            <span>
                              {event.available_spots > 0 
                                ? `${event.available_spots} of ${event.capacity || 50} spots available`
                                : 'Fully booked'}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleReserveSpot(event)}
                          disabled={event.available_spots === 0}
                          className={`w-full py-3 rounded-full border font-light transition-all duration-300 flex items-center justify-center gap-2 ${
                            event.available_spots === 0
                              ? 'border-stone-300 dark:border-stone-700 text-stone-400 dark:text-stone-600 cursor-not-allowed'
                              : 'border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 hover:bg-stone-900 hover:text-stone-100 dark:hover:bg-stone-100 dark:hover:text-stone-900'
                          }`}
                        >
                          <span>{event.available_spots === 0 ? 'Sold Out' : 'Reserve Your Spot'}</span>
                          {event.available_spots > 0 && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" strokeWidth={1.5} />}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </>
          )}
        </div>
      </section>

      {/* Login Check Modal */}
      <AnimatePresence>
        {showLoginCheckModal && selectedEvent && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowLoginCheckModal(false)}
          >
            <motion.div
              className="bg-white dark:bg-stone-900 rounded-3xl max-w-md w-full p-8 border border-stone-200 dark:border-stone-800 shadow-2xl relative"
              initial={{ scale: 0.9, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 50 }}
              transition={{ duration: 0.3, type: 'spring' }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowLoginCheckModal(false)}
                className="absolute top-6 right-6 p-2 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-stone-100 hover:bg-stone-200 dark:hover:bg-stone-700"
              >
                <X size={20} />
              </button>

              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-stone-600 dark:text-stone-300" strokeWidth={1.5} />
                </div>
                <h2 className="text-2xl font-light mb-2" style={{ fontFamily: "'Crimson Pro', serif" }}>
                  You're not logged in
                </h2>
                <p className="text-stone-500 dark:text-stone-400 mb-6 font-light">
                  Log in to manage your reservations and favorites — or continue as guest.
                </p>

                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => window.location.href = '/login'}
                    className="w-full py-3 rounded-full bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 hover:opacity-90 transition-all duration-300 font-light"
                  >
                    Log In / Sign Up
                  </button>
                  <button
                    onClick={() => {
                      setShowLoginCheckModal(false);
                      setShowReservationModal(true);
                    }}
                    className="w-full py-3 rounded-full border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 transition-all duration-300 font-light"
                  >
                    Continue as Guest
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    {/* Reservation Modal with Ticket Generation */}
      <AnimatePresence>
        {showReservationModal && selectedEvent && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !reservationLoading && !reservationSuccess && setShowReservationModal(false)}
          >
            <motion.div
              className="bg-white dark:bg-stone-900 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative border border-stone-200 dark:border-stone-800 shadow-2xl"
              initial={{ scale: 0.9, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 50 }}
              transition={{ duration: 0.3, type: "spring" }}
              onClick={(e) => e.stopPropagation()}
            >
              {!reservationSuccess ? (
                <>
                  <button
                    className="absolute top-6 right-6 z-10 p-2 rounded-full bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors duration-300"
                    onClick={() => setShowReservationModal(false)}
                    disabled={reservationLoading}
                  >
                    <X size={24} strokeWidth={1.5} />
                  </button>

                  <div className="p-8 md:p-12">
                    <div className="text-center mb-8">
                      <div className="w-16 h-16 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center mx-auto mb-4">
                        <Calendar className="w-8 h-8 text-stone-700 dark:text-stone-300" strokeWidth={1.5} />
                      </div>
                      <h2 className="text-4xl font-light text-stone-900 dark:text-stone-100 mb-2" style={{ fontFamily: "'Crimson Pro', serif" }}>
                        Reserve Your <span className="elegant-text">Spot</span>
                      </h2>
                      <p className="text-stone-600 dark:text-stone-400 font-light">{selectedEvent.title}</p>
                    </div>

                    <div className="bg-stone-50 dark:bg-stone-800/50 rounded-2xl p-6 mb-8 border border-stone-200 dark:border-stone-800">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="flex items-center gap-2 text-sm text-stone-500 dark:text-stone-400 mb-1">
                            <Calendar className="w-4 h-4" strokeWidth={1.5} />
                            <span className="font-light">Date</span>
                          </div>
                          <p className="text-stone-900 dark:text-stone-100 font-light">{formatDate(selectedEvent.date)}</p>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 text-sm text-stone-500 dark:text-stone-400 mb-1">
                            <Clock className="w-4 h-4" strokeWidth={1.5} />
                            <span className="font-light">Time</span>
                          </div>
                          <p className="text-stone-900 dark:text-stone-100 font-light">{formatTime(selectedEvent.date)}</p>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 text-sm text-stone-500 dark:text-stone-400 mb-1">
                            <MapPin className="w-4 h-4" strokeWidth={1.5} />
                            <span className="font-light">Location</span>
                          </div>
                          <p className="text-stone-900 dark:text-stone-100 font-light">{selectedEvent.location}</p>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 text-sm text-stone-500 dark:text-stone-400 mb-1">
                            <span className="font-light">Price (R)</span>
                          </div>
                          <p className="text-stone-900 dark:text-stone-100 font-light">
                            {selectedEvent.is_free ? 'Free' : `R${selectedEvent.price}`}
                          </p>
                        </div>
                      </div>

                      {selectedEvent.available_spots <= 10 && (
                        <div className="mt-4 pt-4 border-t border-stone-200 dark:border-stone-700">
                          <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400">
                            <AlertCircle className="w-4 h-4" strokeWidth={1.5} />
                            <span className="font-light">Only {selectedEvent.available_spots} spots remaining!</span>
                          </div>
                        </div>
                      )}
                    </div>

                    <form onSubmit={submitReservation} className="space-y-6">
                      <div>
                        <label className="block text-sm font-light text-stone-700 dark:text-stone-300 mb-2">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          className="w-full px-4 py-3 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:border-stone-400 dark:focus:border-stone-600 font-light"
                          placeholder="Enter your full name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-light text-stone-700 dark:text-stone-300 mb-2">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          className="w-full px-4 py-3 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:border-stone-400 dark:focus:border-stone-600 font-light"
                          placeholder="your.email@example.com"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-light text-stone-700 dark:text-stone-300 mb-2">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                          className="w-full px-4 py-3 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:border-stone-400 dark:focus:border-stone-600 font-light"
                          placeholder="+27 XX XXX XXXX"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-light text-stone-700 dark:text-stone-300 mb-2">
                          Special Requirements or Notes
                        </label>
                        <textarea
                          value={formData.notes}
                          onChange={(e) => setFormData({...formData, notes: e.target.value})}
                          rows={3}
                          className="w-full px-4 py-3 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:border-stone-400 dark:focus:border-stone-600 font-light resize-none"
                          placeholder="Any dietary restrictions, accessibility needs, or questions..."
                        />
                      </div>

                      {!selectedEvent.is_free && !paymentSuccess && (
                        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-2xl p-4 border border-amber-200 dark:border-amber-800 mb-6">
                          <div className="flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                            <div className="text-sm text-amber-800 dark:text-amber-200 font-light">
                              <p className="font-normal mb-1">Payment Required: R{selectedEvent.price}</p>
                              <p>You'll be redirected to complete payment securely via Paystack. Your reservation will be confirmed once payment is successful.</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {paymentProcessing && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-4 border border-blue-200 dark:border-blue-800 mb-6">
                          <div className="flex items-center gap-3">
                            <Loader2 className="w-5 h-5 text-blue-600 dark:text-blue-400 animate-spin" strokeWidth={1.5} />
                            <div className="text-sm text-blue-800 dark:text-blue-200 font-light">
                              Processing payment... Please complete the payment in the Paystack window.
                            </div>
                          </div>
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={reservationLoading || paymentProcessing}
                        className="w-full py-4 rounded-full bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900 font-light hover:bg-stone-800 dark:hover:bg-stone-200 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {reservationLoading || paymentProcessing ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" strokeWidth={1.5} />
                            <span>{paymentProcessing ? 'Processing Payment...' : 'Processing...'}</span>
                          </>
                        ) : (
                          <>
                            <span>{selectedEvent.is_free ? 'Confirm Reservation' : `Pay R${selectedEvent.price} & Reserve`}</span>
                            <ArrowRight className="w-5 h-5" strokeWidth={1.5} />
                          </>
                        )}
                      </button>
                    </form>
                  </div>
                </>
              ) : (
                <div className="p-8 md:p-12">
                  {/* Success Message */}
                  <div className="text-center mb-8">
                    <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-6">
                      <Check className="w-10 h-10 text-green-600 dark:text-green-400" strokeWidth={1.5} />
                    </div>
                    
                    <h2 className="text-4xl font-light text-stone-900 dark:text-stone-100 mb-4" style={{ fontFamily: "'Crimson Pro', serif" }}>
                      Reservation <span className="elegant-text">Confirmed</span>!
                    </h2>
                    
                    <p className="text-lg text-stone-600 dark:text-stone-400 mb-2 font-light">
                      Your ticket has been generated successfully
                    </p>
                    <p className="text-sm text-stone-500 dark:text-stone-400 font-light">
                      Ticket ID: <span className="font-mono">{ticketData?.ticketId}</span>
                    </p>
                    
                    {paymentReference && (
                    <div>
                      <p className="text-xs uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1 font-light">
                        Payment Reference
                      </p>
                      <p className="text-xs font-mono text-stone-900 dark:text-stone-100">
                        {paymentReference}
                      </p>
                    </div>
                  )}
                  </div>

                  {/* Digital Ticket */}
                  <div ref={ticketRef} className="bg-gradient-to-br from-stone-50 to-stone-100 dark:from-stone-800 dark:to-stone-900 rounded-2xl border-2 border-stone-200 dark:border-stone-700 overflow-hidden mb-6">
                    {/* Ticket Header */}
                    <div className="bg-gradient-to-r from-amber-500 to-amber-600 dark:from-amber-600 dark:to-amber-700 p-6 text-white">
                      <div className="flex items-center gap-3 mb-2">
                        <Ticket className="w-8 h-8" strokeWidth={1.5} />
                        <h3 className="text-2xl font-light" style={{ fontFamily: "'Crimson Pro', serif" }}>
                          Event Ticket
                        </h3>
                      </div>
                      <p className="text-amber-100 text-sm font-light">Present this QR code at the event entrance</p>
                    </div>

                    {/* Ticket Body */}
                    <div className="p-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        {/* Event Details */}
                        <div className="space-y-4">
                          <div>
                            <h4 className="text-2xl font-light text-stone-900 dark:text-stone-100 mb-2" style={{ fontFamily: "'Crimson Pro', serif" }}>
                              {selectedEvent.title}
                            </h4>
                            <div className="h-px bg-stone-300 dark:bg-stone-700 my-4"></div>
                          </div>

                          <div>
                            <p className="text-xs uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1 font-light">
                              Attendee
                            </p>
                            <p className="text-stone-900 dark:text-stone-100 font-light">
                              {ticketData?.userName}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1 font-light">
                              Date & Time
                            </p>
                            <p className="text-stone-900 dark:text-stone-100 font-light">
                              {formatDate(selectedEvent.date)}
                            </p>
                            <p className="text-sm text-stone-600 dark:text-stone-400 font-light">
                              {formatTime(selectedEvent.date)}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1 font-light">
                              Location
                            </p>
                            <p className="text-stone-900 dark:text-stone-100 font-light">
                              {selectedEvent.location}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1 font-light">
                              Ticket ID
                            </p>
                            <p className="text-sm font-mono text-stone-900 dark:text-stone-100">
                              {ticketData?.ticketId}
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
                                className="w-48 h-48"
                              />
                            ) : (
                              <div className="w-48 h-48 flex items-center justify-center">
                                <Loader2 className="w-8 h-8 animate-spin text-stone-400" />
                              </div>
                            )}
                          </div>
                          <p className="text-xs text-center text-stone-500 dark:text-stone-400 mt-3 font-light">
                            Scan this code at check-in
                          </p>
                        </div>
                      </div>

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
                      <button
                        onClick={() => {
                          setShowReservationModal(false);
                          setReservationSuccess(false);
                          setTicketData(null);
                          setQrCodeUrl('');
                        }}
                        className="py-3 rounded-full bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900 font-light hover:bg-stone-800 dark:hover:bg-stone-200 transition-all duration-300"
                      >
                        Browse More Events
                      </button>
                      <button
                        onClick={() => {
                          setShowReservationModal(false);
                          setReservationSuccess(false);
                          setTicketData(null);
                          setQrCodeUrl('');
                        }}
                        className="py-3 rounded-full border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 font-light hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors duration-300"
                      >
                        Close
                      </button>
                    </div>
                  </div>

                  {/* What's Next Section */}
                  <div className="mt-8 bg-stone-50 dark:bg-stone-800/50 rounded-2xl p-6 border border-stone-200 dark:border-stone-800">
                    <h3 className="text-lg font-light text-stone-900 dark:text-stone-100 mb-4" style={{ fontFamily: "'Crimson Pro', serif" }}>
                      What's Next?
                    </h3>
                    <div className="space-y-3 text-left">
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                        <p className="text-sm text-stone-600 dark:text-stone-400 font-light">
                          Your ticket and confirmation have been sent to <strong className="font-normal">{formData.email}</strong>
                        </p>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                        <p className="text-sm text-stone-600 dark:text-stone-400 font-light">
                          Save or print your ticket for easy access at the event
                        </p>
                      </div>
                      {!selectedEvent.is_free && (
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                          <p className="text-sm text-stone-600 dark:text-stone-400 font-light">
                            Complete payment within 24 hours to secure your spot
                          </p>
                        </div>
                      )}
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                        <p className="text-sm text-stone-600 dark:text-stone-400 font-light">
                          We'll send a reminder 24 hours before the event
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
};

export default Events;