import { motion } from 'framer-motion'
import { Calendar, MapPin, Users, Clock, ArrowRight, Sparkles } from 'lucide-react'
import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'
import { Link } from 'react-router-dom'

export default function UpcomingEvents() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchUpcomingEvents()
  }, [])

  async function fetchUpcomingEvents() {
    try {
      setLoading(true)

      const today = new Date().toISOString().split('T')[0] // ensures date comparison works
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .gte('date', today)
        .order('date', { ascending: true })
        .limit(3)

      if (error) throw error
      setEvents(data || [])
    } catch (error) {
      console.error('Error fetching events:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return {
      day: date.getDate(),
      month: date.toLocaleDateString('en-US', { month: 'short' }),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
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

  // --- LOADING STATE ---
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

  // --- ERROR STATE ---
  if (error) {
    return (
      <section className="py-32 lg:py-40 bg-white dark:bg-stone-900">
        <div className="max-w-7xl mx-auto px-8 lg:px-16 text-center">
          <p className="text-stone-600 dark:text-stone-300">Unable to load events. Please try again later.</p>
        </div>
      </section>
    )
  }

  // --- EMPTY STATE ---
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

  // --- EVENTS LIST ---
  return (
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
                    {event.is_featured && (
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs uppercase tracking-wider rounded-sm mb-3">
                        <Sparkles className="w-3 h-3" strokeWidth={1.5} />
                        Featured
                      </div>
                    )}

                    <h3 className="text-3xl font-light text-stone-800 dark:text-stone-100 mb-3 group-hover:elegant-text transition-all" style={{ fontFamily: 'Crimson Pro, serif' }}>
                      {event.title}
                    </h3>

                    {event.description && (
                      <p className="text-stone-600 dark:text-stone-300 font-light leading-relaxed mb-5">
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
                      {event.max_attendees && (
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" strokeWidth={1.5} />
                          <span>{event.max_attendees} seats</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="flex items-start lg:items-center">
                    <Link to={`/events/${event.id}`} className="btn-elegant text-sm whitespace-nowrap group/btn">
                      <span className="flex items-center">
                        Register
                        <ArrowRight className="ml-3 w-4 h-4 group-hover/btn:translate-x-1 transition-transform" strokeWidth={1.5} />
                      </span>
                    </Link>
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
  )
}
