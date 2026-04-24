import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader2, Send } from 'lucide-react'
import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'
import { Link } from 'react-router-dom'

export default function UpcomingEvents() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState(null)

  useEffect(() => { fetchUpcomingEvents() }, [])

  async function fetchUpcomingEvents() {
    try {
      setLoading(true)
      const today = new Date().toISOString().split('T')[0]
      const { data } = await supabase.from('events').select('*').gte('date', today).order('date', { ascending: true }).limit(3)
      
      const eventsWithSpots = await Promise.all((data || []).map(async (event) => {
        const { count } = await supabase.from('reservations').select('*', { count: 'exact', head: true }).eq('event_id', event.id).eq('status', 'confirmed')
        return { ...event, available_spots: Math.max(0, (event.capacity || 50) - (count || 0)) }
      }))
      setEvents(eventsWithSpots)
    } catch (err) { console.error(err) } finally { setLoading(false) }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return {
      day: date.getDate().toString().padStart(2, '0'),
      month: date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).toUpperCase()
    }
  }

  if (loading) return (
    <div className="py-40 bg-ivory flex flex-col items-center justify-center">
      <Loader2 className="animate-spin text-gold mb-4" size={32} />
      <span className="text-xs tracking-[0.4em] text-ink font-bold uppercase">Synchronizing Registry</span>
    </div>
  )

  if (events.length === 0) return (
    <section className="py-40 bg-ivory text-center border-t-2 border-ink/5">
      <div className="max-w-7xl mx-auto px-6">
        <span className="text-xs tracking-[0.5em] text-gold uppercase mb-8 block font-black">SCHEDULE</span>
        <h2 className="text-4xl md:text-6xl font-sans font-bold tracking-tight text-ink mb-12 uppercase">
          STAY TUNED FOR <br /> <span className="text-gold">NEW EVENTS.</span>
        </h2>
        <Link to="/contact" className="text-sm tracking-[0.3em] text-ink font-bold uppercase border-b-2 border-gold pb-2 hover:text-gold transition-colors">
          Get Notified
        </Link>
      </div>
    </section>
  )

  return (
    <section className="py-32 lg:py-56 bg-ivory text-ink relative border-t-2 border-ink/5">
      <div className="max-w-7xl mx-auto px-6 lg:px-16">
        
        {/* HEADER: Bold Architectural Style */}
        <div className="flex flex-col items-center text-center mb-32">
          <span className="text-xs tracking-[0.6em] text-gold uppercase mb-8 font-black">REGISTRY</span>
          <h2 className="text-5xl md:text-8xl font-sans font-bold tracking-tighter text-ink uppercase leading-none">
            UPCOMING <br /> <span className="text-gold">DIALOGUES.</span>
          </h2>
        </div>

        {/* LEDGER: High Contrast Row System */}
        <div className="border-t-2 border-b-2 border-ink">
          {events.map((event, index) => {
            const { day, month, time } = formatDate(event.date)
            const isSoldOut = event.available_spots === 0

            return (
              <motion.div
                key={event.id}
                className="group py-16 flex flex-col md:flex-row items-start md:items-center justify-between gap-12 border-b border-stone-200 last:border-b-0 hover:bg-white transition-colors px-4"
              >
                {/* DATE BLOCK */}
                <div className="flex items-center gap-10 min-w-[200px]">
                  <div className="flex flex-col">
                    <span className="text-xs tracking-[0.3em] text-gold mb-2 font-black">{month}</span>
                    <span className="text-6xl font-sans font-bold leading-none tracking-tighter text-ink">{day}</span>
                  </div>
                  <div className="h-16 w-[2px] bg-ink hidden md:block"></div>
                  <span className="text-xs tracking-[0.2em] text-ink uppercase font-bold md:rotate-90">
                    {time}
                  </span>
                </div>

                {/* INFO BLOCK */}
                <div className="flex-grow max-w-2xl">
                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-[10px] tracking-[0.3em] bg-ink text-white px-3 py-1 font-black uppercase">
                      {event.event_type}
                    </span>
                    {isSoldOut && <span className="text-[10px] tracking-[0.3em] text-red-600 font-black uppercase">FULLY BOOKED</span>}
                  </div>
                  <h3 className="text-3xl md:text-4xl font-sans font-bold tracking-tight text-ink mb-6 uppercase group-hover:text-gold transition-colors duration-500">
                    {event.title}
                  </h3>
                  <div className="flex items-center gap-6">
                     <span className="text-xs tracking-[0.2em] text-ink font-bold uppercase">
                       {event.location || 'CAPE TOWN'}
                     </span>
                     <div className="w-2 h-2 bg-gold"></div>
                     <span className="text-xs tracking-[0.2em] text-gold font-black uppercase">
                       {event.is_free ? 'COMPLIMENTARY' : `ZAR ${event.price}`}
                     </span>
                  </div>
                </div>

                {/* ACTION */}
                <button
                  onClick={() => { setSelectedEvent(event); setShowModal(true); }}
                  disabled={isSoldOut}
                  className="w-full md:w-auto bg-ink text-white py-6 px-14 text-xs tracking-[0.4em] font-black uppercase hover:bg-gold transition-all duration-500 disabled:bg-stone-200 disabled:text-stone-400"
                >
                  {isSoldOut ? 'BOOKED' : 'RESERVE'}
                </button>
              </motion.div>
            )
          })}
        </div>

        {/* FOOTER ACTION */}
        <div className="mt-32 text-center">
          <Link to="/events" className="text-sm tracking-[0.4em] text-ink hover:text-gold transition-all font-black uppercase flex items-center justify-center gap-8 group">
            <div className="w-16 h-[2px] bg-ink group-hover:bg-gold transition-all"></div>
            VIEW FULL PROGRAM
            <div className="w-16 h-[2px] bg-ink group-hover:bg-gold transition-all"></div>
          </Link>
        </div>
      </div>

      {/* MODAL: High-Contrast Invitation Card */}
      <AnimatePresence>
        {showModal && selectedEvent && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-ink/98 z-[100] flex items-center justify-center p-6 backdrop-blur-md"
            onClick={() => setShowModal(false)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="bg-ivory text-ink w-full max-w-xl border-4 border-gold shadow-2xl relative"
              onClick={e => e.stopPropagation()}
            >
              <button onClick={() => setShowModal(false)} className="absolute top-8 right-8 text-ink hover:scale-110 transition-transform">
                <X size={32} strokeWidth={3} />
              </button>

              <div className="p-12 md:p-20 flex flex-col items-center">
                <span className="text-xs tracking-[0.5em] text-gold uppercase mb-10 font-black underline underline-offset-8">INVITATION</span>
                
                <h2 className="text-3xl md:text-5xl font-sans font-bold tracking-tighter text-center mb-8 uppercase leading-tight">
                  {selectedEvent.title}
                </h2>
                
                <p className="text-sm tracking-[0.3em] text-ink uppercase mb-16 text-center font-black bg-gold/10 px-4 py-2">
                  {formatDate(selectedEvent.date).month} {new Date(selectedEvent.date).getDate()} — {formatDate(selectedEvent.date).time}
                </p>

                <form className="w-full space-y-10">
                  <div className="flex flex-col">
                    <label className="text-[10px] tracking-widest font-black uppercase mb-2">Full Name</label>
                    <input className="bg-transparent border-b-2 border-ink py-4 px-0 placeholder:text-ink/20 focus:border-gold rounded-none font-sans text-sm font-bold tracking-widest uppercase" placeholder="REQUIRED" required />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-[10px] tracking-widest font-black uppercase mb-2">Email Address</label>
                    <input type="email" className="bg-transparent border-b-2 border-ink py-4 px-0 placeholder:text-ink/20 focus:border-gold rounded-none font-sans text-sm font-bold tracking-widest uppercase" placeholder="REQUIRED" required />
                  </div>
                  <button className="w-full bg-ink text-white py-8 tracking-[0.5em] hover:bg-gold transition-all uppercase font-black flex items-center justify-center gap-6">
                    CONFIRM ATTENDANCE <Send size={20} />
                  </button>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}