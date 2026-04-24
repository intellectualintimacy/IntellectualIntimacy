import { useState, useEffect, useRef } from 'react'
import { motion, useMotionValue, useAnimation } from 'framer-motion'
import { ArrowRight, ArrowLeft, Loader2 } from 'lucide-react'
import { supabase } from '../../../lib/supabase'

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState([])
  const [loading, setLoading] = useState(true)
  const [isPaused, setIsPaused] = useState(false)
  const carouselRef = useRef(null)
  const x = useMotionValue(0)
  const controls = useAnimation()

  const fallbackTestimonials = [
    { id: 1, testimonial: 'These conversations have fundamentally changed how I approach relationships and personal growth. The depth here is unlike anything I’ve experienced.', name: 'Sarah M.', role: 'MEMBER' },
    { id: 2, testimonial: 'A rare space where intellectual depth meets genuine human connection. Every event leaves me feeling inspired and more connected to others.', name: 'David K.', role: 'PARTICIPANT' },
    { id: 3, testimonial: 'I found my tribe here. People who think deeply, feel deeply, and grow together. This community has become an essential part of my life journey.', name: 'Lerato N.', role: 'ATTENDEE' }
  ]

  useEffect(() => {
    fetchTestimonials()
  }, [])

  const fetchTestimonials = async () => {
    try {
      setLoading(true)
      const { data } = await supabase.from('testimonials').select('*').eq('is_approved', true).limit(6)
      setTestimonials(data?.length > 0 ? data : fallbackTestimonials)
    } catch (err) {
      setTestimonials(fallbackTestimonials)
    } finally {
      setLoading(false)
    }
  }

  const displayTestimonials = [...testimonials, ...testimonials, ...testimonials]

  useEffect(() => {
    if (!isPaused && !loading) {
      const totalWidth = 450 * testimonials.length
      controls.start({
        x: [-totalWidth, 0],
        transition: { x: { repeat: Infinity, repeatType: "loop", duration: 40, ease: "linear" } }
      })
    } else {
      controls.stop()
    }
  }, [isPaused, controls, loading, testimonials.length])

  return (
    <section className="py-32 lg:py-56 bg-ivory text-ink relative overflow-hidden border-t border-stone-200/50">
      <div className="max-w-7xl mx-auto px-6 lg:px-16 relative z-10">
        
        {/* HEADER: Consistent with Logo/Philosophy */}
        <div className="flex flex-col items-center text-center mb-32">
          <span className="text-[10px] tracking-[0.6em] text-gold uppercase mb-8 font-medium">Reflections</span>
          <h2 className="text-4xl md:text-6xl font-sans font-light tracking-tight text-ink uppercase">
            Community <br /> <span className="font-medium text-gold">Voices.</span>
          </h2>
          <div className="w-12 h-[1px] bg-gold/30 mt-12"></div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-gold" size={24} strokeWidth={1} />
          </div>
        ) : (
          <div 
            className="relative"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {/* CAROUSEL TRACK */}
            <div className="overflow-hidden cursor-grab active:cursor-grabbing">
              <motion.div
                ref={carouselRef}
                className="flex gap-16"
                animate={controls}
                style={{ x }}
              >
                {displayTestimonials.map((item, index) => (
                  <div 
                    key={index} 
                    className="flex-shrink-0 w-[300px] md:w-[450px] py-10"
                  >
                    <div className="flex flex-col items-start">
                      {/* Architectural Line */}
                      <div className="w-8 h-[1px] bg-gold mb-8"></div>
                      
                      {/* Reflection Content */}
                      <p className="text-lg md:text-xl font-sans font-light leading-relaxed text-ink/80 tracking-wide mb-10 italic">
                        "{item.testimonial}"
                      </p>
                      
                      {/* Metadata: Logo Style */}
                      <div className="flex flex-col gap-1">
                        <span className="text-[11px] tracking-[0.3em] font-bold text-ink uppercase">
                          {item.name}
                        </span>
                        <span className="text-[9px] tracking-[0.4em] text-gold uppercase font-medium">
                          {item.role}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
            </div>
            
            {/* Subtle Gradient Fade for Light Backgrounds */}
            <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-ivory to-transparent z-10 pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-ivory to-transparent z-10 pointer-events-none" />
          </div>
        )}

        {/* BOTTOM MANIFESTO QUOTE */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-48 max-w-4xl mx-auto border-t border-stone-200/60 pt-24"
        >
          <div className="flex flex-col md:flex-row items-start gap-12">
            <span className="text-6xl font-sans font-bold text-gold/20 leading-none">“</span>
            <div className="flex flex-col">
              <p className="text-2xl md:text-4xl font-sans font-light text-ink leading-[1.4] tracking-tight mb-10 uppercase">
                True growth happens in the <span className="font-medium">space between minds</span>, where vulnerability meets curiosity.
              </p>
              <div className="flex items-center gap-6">
                <div className="w-12 h-[1px] bg-gold"></div>
                <span className="text-[10px] tracking-[0.5em] text-ink/40 uppercase font-medium">The Intellectual Intimacy Ethos</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* CTA */}
        <div className="mt-32 text-center">
          <a
            href="/share-testimonial"
            className="btn-elegant bg-ink text-ivory py-5 px-12 text-[10px] tracking-[0.5em] hover:bg-gold transition-all duration-500 uppercase font-medium inline-flex items-center gap-8"
          >
            Share Your Story
            <ArrowRight size={16} strokeWidth={1.5} />
          </a>
        </div>
      </div>
    </section>
  )
}