// src/components/sections/UpcomingEvents.jsx
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, MapPin, Users, Clock, ArrowRight, Sparkles, X, Loader2, CheckCircle, AlertCircle, Mail, User as UserIcon, Phone, MessageSquare } from 'lucide-react'
import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'
import { Link } from 'react-router-dom'

export default function UpcomingEvents() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Modal states
  const [showModal, setShowModal] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [reservationLoading, setReservationLoading] = useState(false)
  const [reservationSuccess, setReservationSuccess] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  
  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    notes: ''
  })
  const [formErrors, setFormErrors] = useState({})

  useEffect(() => {
    fetchUpcomingEvents()
    checkAuthStatus()
  }, [])

  async function checkAuthStatus() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setCurrentUser(user)
        setFormData(prev => ({
          ...prev,
          name: user.user_metadata?.full_name || '',
          email: user.email || ''
        }))
      }
    } catch (error) {
      console.error('Auth check error:', error)
    }
  }

  async function fetchUpcomingEvents() {
    try {
      setLoading(true)
      const today = new Date().toISOString().split('T')[0]
      
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .gte('date', today)
        .order('date', { ascending: true })
        .limit(3)

      if (error) throw error
      
      // Calculate available spots for each event
      const eventsWithSpots = await Promise.all(
        (data || []).map(async (event) => {
          const { count } = await supabase
            .from('reservations')
            .select('*', { count: 'exact', head: true })
            .eq('event_id', event.id)
            .eq('status', 'confirmed')
          
          const reservedSpots = count || 0
          const capacity = event.capacity || 50
          
          return {
            ...event,
            available_spots: Math.max(0, capacity - reservedSpots),
            reserved_spots: reservedSpots
          }
        })
      )
      
      setEvents(eventsWithSpots)
    } catch (error) {
      console.error('Error fetching events:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleRegisterClick = (event) => {
    setSelectedEvent(event)
    setShowModal(true)
    setReservationSuccess(false)
    setFormErrors({})
  }

  const handleFormChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const errors = {}
    
    if (!formData.name.trim()) {
      errors.name = 'Name is required'
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Invalid email address'
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const generateTicketId = () => {
    return `TKT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
  }

  const handleSubmitReservation = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setReservationLoading(true)
    
    try {
      // Check if spots are still available
      const { count } = await supabase
        .from('reservations')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', selectedEvent.id)
        .eq('status', 'confirmed')
      
      const reservedSpots = count || 0
      const capacity = selectedEvent.capacity || 50
      
      if (reservedSpots >= capacity) {
        throw new Error('Sorry, this event is now fully booked.')
      }
      
      // Create reservation
      const ticketId = generateTicketId()
      
      const { data, error } = await supabase
        .from('reservations')
        .insert([{
          event_id: selectedEvent.id,
          user_email: formData.email,
          user_name: formData.name,
          user_phone: formData.phone || null,
          notes: formData.notes || null,
          status: 'confirmed',
          payment_status: selectedEvent.is_free ? 'completed' : 'pending',
          payment_amount: selectedEvent.is_free ? 0 : selectedEvent.price,
          ticket_id: ticketId
        }])
        .select()
      
      if (error) throw error
      
      // Refresh events to update available spots
      await fetchUpcomingEvents()
      
      setReservationSuccess(true)
      setReservationLoading(false)
      
      // Reset form
      if (!currentUser) {
        setFormData({
          name: '',
          email: '',
          phone: '',
          notes: ''
        })
      }
    } catch (error) {
      console.error('Reservation error:', error)
      setFormErrors({ submit: error.message })
      setReservationLoading(false)
    }
  }

  const closeModal = () => {
    setShowModal(false)
    setSelectedEvent(null)
    setReservationSuccess(false)
    setFormErrors({})
    if (!currentUser) {
      setFormData({
        name: '',
        email: '',
        phone: '',
        notes: ''
      })
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return {
      day: date.getDate(),
      month: date.toLocaleDateString('en-US', { month: 'short' }),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      fullDate: date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    }
  }

  const getEventTypeColor = (type) => {
    switch (type) {
      case 'virtual': return 'from-blue-500 to-cyan-500'
      case 'in-person': return 'from-amber-500 to-orange-500'
      case 'hybrid': return 'from-purple-500 to-pink-500'
      default: return 'from-stone-500 to-stone-600'
    }
  }

  // Loading state
  if (loading) {
    return (
      <section className="py-32 lg:py-40 bg-white dark:bg-stone-900">
        <div className="max-w-7xl mx-auto px-8 lg:px-16 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-amber-500 border-t-transparent"></div>
          <p className="mt-4 text-stone-600 dark:text-stone-300 font-light">Loading events...</p>
        </div>
      </section>
    )
  }

  // Error state
  if (error) {
    return (
      <section className="py-32 lg:py-40 bg-white dark:bg-stone-900">
        <div className="max-w-7xl mx-auto px-8 lg:px-16 text-center">
          <p className="text-stone-600 dark:text-stone-300">Unable to load events. Please try again later.</p>
        </div>
      </section>
    )
  }

  // Empty state
  if (events.length === 0) {
    return (
      <section className="py-32 lg:py-40 bg-white dark:bg-stone-900">
        <div className="max-w-7xl mx-auto px-8 lg:px-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="elegant-divider mb-8"></div>
            <h2 className="text-5xl lg:text-6xl mb-8 font-light" style={{ fontFamily: 'Crimson Pro, serif' }}>
              Upcoming <span className="elegant-text">Events</span>
            </h2>
            <p className="text-xl text-stone-600 dark:text-stone-300 mb-8 font-light">
              No upcoming events at the moment. Check back soon or subscribe for updates.
            </p>
            <Link to="/events" className="btn-elegant inline-flex items-center justify-center">
              View All Events
              <ArrowRight className="ml-3 w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>
    )
  }

  return (
    <>
      <section className="py-32 lg:py-40 bg-white dark:bg-stone-900 relative overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute top-20 right-0 w-96 h-96 bg-gradient-to-br from-amber-500/5 to-orange-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-0 w-96 h-96 bg-gradient-to-tr from-amber-500/5 to-orange-500/5 rounded-full blur-3xl"></div>

        <div className="max-w-7xl mx-auto px-8 lg:px-16 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <div className="elegant-divider mb-8"></div>
            <h2 className="text-5xl lg:text-6xl mb-8 font-light text-balance" style={{ fontFamily: 'Crimson Pro, serif' }}>
              Upcoming <span className="elegant-text">Events</span>
            </h2>
            <p className="text-xl text-stone-600 dark:text-stone-300 max-w-3xl mx-auto font-light">
              Join us for transformative conversations and meaningful connections.
            </p>
          </motion.div>

          {/* Event Cards */}
          <div className="space-y-10">
            {events.map((event, index) => {
              const { day, month, time } = formatDate(event.date)
              const isSoldOut = event.available_spots === 0
              const isLimitedSpots = event.available_spots <= 5 && event.available_spots > 0
              
              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.15 }}
                  className="group relative"
                >
                  <div className="feature-card overflow-hidden flex flex-col lg:flex-row gap-8">
                    {/* Date Badge */}
                    <div className="flex-shrink-0">
                      <div className="w-32 h-32 relative">
                        <div className={`absolute inset-0 bg-gradient-to-br ${getEventTypeColor(event.event_type)} opacity-10 rounded-sm`}></div>
                        <div className="relative flex flex-col items-center justify-center h-full border border-stone-200 dark:border-stone-700 rounded-sm">
                          <div className="text-5xl font-light elegant-text mb-1" style={{ fontFamily: 'Crimson Pro, serif' }}>
                            {day}
                          </div>
                          <div className="text-sm uppercase tracking-widest text-stone-500 dark:text-stone-400 font-light">
                            {month}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap gap-2 mb-3">
                        {event.is_featured && (
                          <div className="inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs uppercase tracking-wider rounded-sm">
                            <Sparkles className="w-3 h-3" strokeWidth={1.5} />
                            Featured
                          </div>
                        )}
                        {isSoldOut && (
                          <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-500 text-white text-xs uppercase tracking-wider rounded-sm">
                            Sold Out
                          </div>
                        )}
                        {isLimitedSpots && (
                          <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-500 text-white text-xs uppercase tracking-wider rounded-sm">
                            Only {event.available_spots} spots left
                          </div>
                        )}
                      </div>

                      <h3 className="text-3xl font-light text-stone-800 dark:text-stone-100 mb-3 group-hover:elegant-text transition-all" style={{ fontFamily: 'Crimson Pro, serif' }}>
                        {event.title}
                      </h3>

                      {event.description && (
                        <p className="text-stone-600 dark:text-stone-300 font-light leading-relaxed mb-5 line-clamp-2">
                          {event.description}
                        </p>
                      )}

                      {/* Meta Info */}
                      <div className="flex flex-wrap gap-5 text-sm text-stone-500 dark:text-stone-400">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" strokeWidth={1.5} />
                          <span>{time}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" strokeWidth={1.5} />
                          <span>{event.location || 'TBA'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 bg-gradient-to-r ${getEventTypeColor(event.event_type)} text-white text-xs uppercase tracking-wider rounded-sm`}>
                            {event.event_type || 'Event'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" strokeWidth={1.5} />
                          <span>{event.available_spots} of {event.capacity || 50} available</span>
                        </div>
                        {!event.is_free && (
                          <div className="flex items-center gap-2 font-medium text-amber-600 dark:text-amber-400">
                            R{event.price}
                          </div>
                        )}
                        {event.is_free && (
                          <div className="flex items-center gap-2 font-medium text-green-600 dark:text-green-400">
                            Free Event
                          </div>
                        )}
                      </div>
                    </div>

                    {/* CTA */}
                    <div className="flex items-start lg:items-center">
                      <button
                        onClick={() => handleRegisterClick(event)}
                        disabled={isSoldOut}
                        className={`btn-elegant text-sm whitespace-nowrap group/btn ${
                          isSoldOut ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        <span className="flex items-center">
                          {isSoldOut ? 'Sold Out' : 'Reserve Spot'}
                          {!isSoldOut && <ArrowRight className="ml-3 w-4 h-4 group-hover/btn:translate-x-1 transition-transform" strokeWidth={1.5} />}
                        </span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* View All Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 text-center"
          >
            <Link
              to="/events"
              className="inline-flex items-center gap-2 text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100 transition-colors group font-light"
            >
              <Calendar className="w-5 h-5 group-hover:scale-110 transition-transform" strokeWidth={1.5} />
              <span>View All Events</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" strokeWidth={1.5} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Reservation Modal */}
      <AnimatePresence>
        {showModal && selectedEvent && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
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
                    onClick={closeModal}
                    disabled={reservationLoading}
                  >
                    <X size={24} strokeWidth={1.5} />
                  </button>

                  <div className="p-8 md:p-12">
                    <div className="text-center mb-8">
                      <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-4">
                        <Calendar className="w-8 h-8 text-amber-600 dark:text-amber-400" strokeWidth={1.5} />
                      </div>
                      <h2 className="text-4xl font-light text-stone-900 dark:text-stone-100 mb-2" style={{ fontFamily: 'Crimson Pro, serif' }}>
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
                          <p className="text-stone-900 dark:text-stone-100 font-light">{formatDate(selectedEvent.date).fullDate}</p>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 text-sm text-stone-500 dark:text-stone-400 mb-1">
                            <Clock className="w-4 h-4" strokeWidth={1.5} />
                            <span className="font-light">Time</span>
                          </div>
                          <p className="text-stone-900 dark:text-stone-100 font-light">{formatDate(selectedEvent.date).time}</p>
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
                            <span className="font-light">Price</span>
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

                    <form onSubmit={handleSubmitReservation} className="space-y-6">
                      <div>
                        <label className="block text-sm font-light text-stone-700 dark:text-stone-300 mb-2">
                          Full Name *
                        </label>
                        <div className="relative">
                          <UserIcon className="w-5 h-5 text-stone-400 dark:text-stone-500 absolute left-4 top-1/2 -translate-y-1/2" strokeWidth={1.5} />
                          <input
                            type="text"
                            name="name"
                            required
                            value={formData.name}
                            onChange={handleFormChange}
                            className="w-full pl-12 pr-4 py-3 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:border-amber-500 dark:focus:border-amber-500 font-light"
                            placeholder="Enter your full name"
                          />
                        </div>
                        {formErrors.name && <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-light text-stone-700 dark:text-stone-300 mb-2">
                          Email Address *
                        </label>
                        <div className="relative">
                          <Mail className="w-5 h-5 text-stone-400 dark:text-stone-500 absolute left-4 top-1/2 -translate-y-1/2" strokeWidth={1.5} />
                          <input
                            type="email"
                            name="email"
                            required
                            value={formData.email}
                            onChange={handleFormChange}
                            className="w-full pl-12 pr-4 py-3 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:border-amber-500 dark:focus:border-amber-500 font-light"
                            placeholder="your.email@example.com"
                          />
                        </div>
                        {formErrors.email && <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-light text-stone-700 dark:text-stone-300 mb-2">
                          Phone Number (Optional)
                        </label>
                        <div className="relative">
                          <Phone className="w-5 h-5 text-stone-400 dark:text-stone-500 absolute left-4 top-1/2 -translate-y-1/2" strokeWidth={1.5} />
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleFormChange}
                            className="w-full pl-12 pr-4 py-3 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:border-amber-500 dark:focus:border-amber-500 font-light"
                            placeholder="+27 XX XXX XXXX"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-light text-stone-700 dark:text-stone-300 mb-2">
                          Special Requirements or Notes (Optional)
                        </label>
                        <div className="relative">
                          <MessageSquare className="w-5 h-5 text-stone-400 dark:text-stone-500 absolute left-4 top-4" strokeWidth={1.5} />
                          <textarea
                            name="notes"
                            value={formData.notes}
                            onChange={handleFormChange}
                            rows={3}
                            className="w-full pl-12 pr-4 py-3 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:border-amber-500 dark:focus:border-amber-500 font-light resize-none"
                            placeholder="Any dietary restrictions, accessibility needs, or questions..."
                          />
                        </div>
                      </div>

                      {formErrors.submit && (
                        <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 border border-red-200 dark:border-red-800">
                          <p className="text-red-700 dark:text-red-300 text-sm font-light">{formErrors.submit}</p>
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={reservationLoading}
                        className="w-full py-4 rounded-full bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900 font-light hover:bg-stone-800 dark:hover:bg-stone-200 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {reservationLoading ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" strokeWidth={1.5} />
                            <span>Processing...</span>
                          </>
                        ) : (
                          <>
                            <span>Confirm Reservation</span>
                            <ArrowRight className="w-5 h-5" strokeWidth={1.5} />
                          </>
                        )}
                      </button>
                    </form>
                  </div>
                </>
              ) : (
                <div className="p-8 md:p-12 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-6"
                  >
                    <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" strokeWidth={1.5} />
                  </motion.div>

                  <div className="elegant-divider mb-6"></div>

                  <h2 className="text-4xl font-light text-stone-900 dark:text-stone-100 mb-4" style={{ fontFamily: 'Crimson Pro, serif' }}>
                    Reservation <span className="elegant-text">Confirmed</span>!
                  </h2>

                  <p className="text-lg text-stone-600 dark:text-stone-400 mb-8 leading-relaxed font-light">
                    Your spot has been reserved for <strong className="font-normal">{selectedEvent.title}</strong>
                  </p>

                  <div className="bg-gradient-to-br from-amber-50 to-stone-50 dark:from-amber-950/20 dark:to-stone-900/50 border border-amber-200 dark:border-amber-800/30 rounded-lg p-6 mb-8">
                    <div className="flex items-center gap-3 mb-4">
                      <Sparkles className="w-6 h-6 text-amber-600 dark:text-amber-400" strokeWidth={1.5} />
                      <h3 className="text-lg font-light text-stone-900 dark:text-stone-100" style={{ fontFamily: 'Crimson Pro, serif' }}>
                        What's Next?
                      </h3>
                    </div>
                    <div className="space-y-2 text-left">
                      <div className="flex items-start gap-2 text-sm text-stone-700 dark:text-stone-300 font-light">
                        <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                        <span>A confirmation email has been sent to <strong className="font-normal">{formData.email}</strong></span>
                      </div>
                      <div className="flex items-start gap-2 text-sm text-stone-700 dark:text-stone-300 font-light">
                        <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                        <span>Add the event to your calendar to stay reminded</span>
                      </div>
                      <div className="flex items-start gap-2 text-sm text-stone-700 dark:text-stone-300 font-light">
                        <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                        <span>We'll send you a reminder 24 hours before the event</span>
                      </div>
                      {!selectedEvent.is_free && (
                        <div className="flex items-start gap-2 text-sm text-stone-700 dark:text-stone-300 font-light">
                          <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                          <span>Payment instructions have been sent to your email</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={closeModal}
                      className="flex-1 py-3 rounded-full bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900 font-light hover:bg-stone-800 dark:hover:bg-stone-200 transition-colors duration-300"
                    >
                      Browse More Events
                    </button>
                    <button
                      onClick={closeModal}
                      className="flex-1 py-3 rounded-full border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 font-light hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors duration-300"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}