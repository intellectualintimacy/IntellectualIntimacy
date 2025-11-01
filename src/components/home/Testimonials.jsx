// src/components/home/Testimonials.jsx
import { useState, useEffect, useRef } from 'react'
import { motion, useMotionValue, useAnimation } from 'framer-motion'
import { Heart, Star, Quote, ChevronLeft, ChevronRight, RefreshCw, AlertCircle } from 'lucide-react'
import { supabase } from '../../../lib/supabase'

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isPaused, setIsPaused] = useState(false)
  
  const carouselRef = useRef(null)
  const x = useMotionValue(0)
  const controls = useAnimation()

  useEffect(() => {
    fetchTestimonials()
  }, [])

  const fetchTestimonials = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const { data, error: fetchError } = await supabase
        .from('testimonials')
        .select('*')
        .eq('is_approved', true)
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(6)

      if (fetchError) throw fetchError

      setTestimonials(data || [])
      setLoading(false)
    } catch (err) {
      console.error('Error fetching testimonials:', err)
      setError(err.message || 'Failed to load testimonials')
      setLoading(false)
      // Use fallback testimonials on error
      setTestimonials(fallbackTestimonials)
    }
  }

  // Fallback testimonials
  const fallbackTestimonials = [
    { 
      id: 1,
      testimonial: 'These conversations have fundamentally changed how I approach relationships and personal growth. The depth and authenticity here is unlike anything I\'ve experienced.', 
      name: 'Sarah M.', 
      role: 'Community Member',
      rating: 5
    },
    { 
      id: 2,
      testimonial: 'A rare space where intellectual depth meets genuine human connection. Every event leaves me feeling inspired and more connected to myself and others.', 
      name: 'David K.', 
      role: 'Workshop Participant',
      rating: 5
    },
    { 
      id: 3,
      testimonial: 'I found my tribe here. People who think deeply, feel deeply, and grow together. This community has become an essential part of my life journey.', 
      name: 'Lerato N.', 
      role: 'Regular Attendee',
      rating: 5
    },
    { 
      id: 4,
      testimonial: 'The workshops and conversations have opened my mind to new perspectives. I leave every session feeling enriched and inspired to grow.', 
      name: 'Michael T.', 
      role: 'Workshop Attendee',
      rating: 5
    },
    { 
      id: 5,
      testimonial: 'An incredible community of thoughtful individuals. The connections I\'ve made here are genuine and deeply meaningful.', 
      name: 'Amara J.', 
      role: 'Community Member',
      rating: 5
    },
    { 
      id: 6,
      testimonial: 'Every conversation challenges me to think deeper and connect more authentically. This is what community should feel like.', 
      name: 'James R.', 
      role: 'Regular Participant',
      rating: 5
    }
  ]

  const displayTestimonials = testimonials.length > 0 ? testimonials : fallbackTestimonials
  
  // Duplicate testimonials for infinite scroll effect
  const infiniteTestimonials = [...displayTestimonials, ...displayTestimonials, ...displayTestimonials]

  useEffect(() => {
    if (!isPaused && infiniteTestimonials.length > 0 && !loading) {
      const cardWidth = 400 // Approximate width of each card including gap
      const totalWidth = cardWidth * displayTestimonials.length
      
      controls.start({
        x: [-totalWidth, 0],
        transition: {
          x: {
            repeat: Infinity,
            repeatType: "loop",
            duration: 30,
            ease: "linear",
          },
        },
      })
    } else {
      controls.stop()
    }
  }, [isPaused, controls, infiniteTestimonials.length, displayTestimonials.length, loading])

  const handlePrevious = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -400, behavior: 'smooth' })
    }
  }

  const handleNext = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: 400, behavior: 'smooth' })
    }
  }

  return (
    <section id="community" className="py-32 lg:py-40 bg-stone-50 dark:bg-stone-950 relative overflow-hidden">
      <div className="texture-dots absolute inset-0 opacity-20 dark:opacity-5"></div>
      
      <div className="max-w-7xl mx-auto px-8 lg:px-16 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <div className="elegant-divider mb-8"></div>
          <h2 className="text-5xl lg:text-6xl mb-8 font-light text-balance" style={{ fontFamily: 'Crimson Pro, serif' }}>
            Community <span className="elegant-text">Voices</span>
          </h2>
          <p className="text-xl text-stone-600 dark:text-stone-300 max-w-3xl mx-auto font-light">
            Hear from members who have experienced the transformative power of meaningful dialogue
          </p>
        </motion.div>

        {loading ? (
          // Loading skeletons
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {[1, 2, 3].map((i) => (
              <div key={i} className="testimonial-card animate-pulse">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-8 h-8 bg-stone-200 dark:bg-stone-800 rounded"></div>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, j) => (
                      <div key={j} className="w-4 h-4 bg-stone-200 dark:bg-stone-800 rounded"></div>
                    ))}
                  </div>
                </div>
                <div className="w-10 h-10 bg-stone-200 dark:bg-stone-800 rounded mb-4"></div>
                <div className="space-y-3 mb-6">
                  <div className="h-4 bg-stone-200 dark:bg-stone-800 rounded w-full"></div>
                  <div className="h-4 bg-stone-200 dark:bg-stone-800 rounded w-5/6"></div>
                  <div className="h-4 bg-stone-200 dark:bg-stone-800 rounded w-4/6"></div>
                </div>
                <div className="pt-4 border-t border-stone-200 dark:border-stone-700">
                  <div className="h-4 bg-stone-200 dark:bg-stone-800 rounded w-32 mb-2"></div>
                  <div className="h-3 bg-stone-200 dark:bg-stone-800 rounded w-24"></div>
                </div>
              </div>
            ))}
          </div>
        ) : error && testimonials.length === 0 ? (
          // Error state (only if no fallback data)
          <div className="text-center py-20 mb-16">
            <div className="w-16 h-16 bg-orange-100 dark:bg-orange-950/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-8 h-8 text-orange-600 dark:text-orange-400" strokeWidth={1.5} />
            </div>
            <h3 className="text-2xl font-light text-stone-900 dark:text-stone-50 mb-3" style={{ fontFamily: 'Crimson Pro, serif' }}>
              Unable to Load Testimonials
            </h3>
            <p className="text-stone-600 dark:text-stone-400 font-light mb-6">
              {error}
            </p>
            <button
              onClick={fetchTestimonials}
              className="px-8 py-3 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 hover:bg-stone-800 dark:hover:bg-stone-200 transition-colors font-light inline-flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" strokeWidth={1.5} />
              Try Again
            </button>
          </div>
        ) : (
          <div className="relative mb-16">
            {/* Navigation Buttons */}
            <button
              onClick={handlePrevious}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 shadow-lg flex items-center justify-center hover:bg-stone-50 dark:hover:bg-stone-700 transition-all duration-300 -ml-6"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-6 h-6 text-stone-700 dark:text-stone-300" strokeWidth={1.5} />
            </button>

            <button
              onClick={handleNext}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 shadow-lg flex items-center justify-center hover:bg-stone-50 dark:hover:bg-stone-700 transition-all duration-300 -mr-6"
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-6 h-6 text-stone-700 dark:text-stone-300" strokeWidth={1.5} />
            </button>

            {/* Carousel Container */}
            <div 
              className="overflow-hidden"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              <motion.div
                ref={carouselRef}
                className="flex gap-8"
                animate={controls}
                style={{ x }}
              >
                {infiniteTestimonials.map((testimonial, index) => (
                  <motion.div
                    key={`${testimonial.id}-${index}`}
                    className="testimonial-card group flex-shrink-0 w-[350px] md:w-[400px]"
                    whileHover={{ y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex items-center justify-between mb-6">
                      <Heart className="w-8 h-8 text-stone-300 dark:text-stone-600 group-hover:text-amber-500 group-hover:fill-amber-500 transition-all" strokeWidth={1.5} />
                      <div className="flex gap-1">
                        {[...Array(testimonial.rating || 5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 text-amber-500 fill-amber-500" strokeWidth={1.5} />
                        ))}
                      </div>
                    </div>
                    
                    <Quote className="w-10 h-10 text-stone-200 dark:text-stone-800 mb-4" strokeWidth={1.5} />
                    
                    <p className="text-lg text-stone-700 dark:text-stone-200 leading-relaxed mb-6 font-light italic line-clamp-6">
                      "{testimonial.testimonial}"
                    </p>
                    
                    <div className="pt-4 border-t border-stone-200 dark:border-stone-700">
                      <div className="font-light text-stone-800 dark:text-stone-100">{testimonial.name}</div>
                      <div className="text-sm text-stone-500 dark:text-stone-400 font-light">{testimonial.role}</div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            {/* Gradient Overlays */}
            <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-stone-50 dark:from-stone-950 to-transparent pointer-events-none z-10"></div>
            <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-stone-50 dark:from-stone-950 to-transparent pointer-events-none z-10"></div>
          </div>
        )}

        {/* Pause Indicator */}
        {!loading && (
          <div className="text-center mb-8">
            <p className="text-xs text-stone-400 dark:text-stone-600 font-light uppercase tracking-wider">
              {isPaused ? '⏸ Paused' : '▶ Auto-scrolling'}  • Hover to pause
            </p>
            {error && testimonials.length > 0 && (
              <p className="text-xs text-orange-600 dark:text-orange-400 font-light mt-2">
                Showing cached testimonials
              </p>
            )}
          </div>
        )}

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <a
            href="/share-testimonial"
            className="inline-block px-8 py-4 bg-stone-800 dark:bg-stone-100 text-white dark:text-stone-900 text-sm uppercase tracking-wider font-light hover:bg-stone-700 dark:hover:bg-stone-200 transition-colors"
          >
            Share Your Story
          </a>
        </motion.div>

        {/* Quote Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="max-w-4xl mx-auto mt-20"
        >
          <div className="relative">
            <div className="absolute -top-8 -left-4 text-9xl text-stone-200 dark:text-stone-800 font-serif leading-none">"</div>
            <p className="text-3xl lg:text-4xl font-light text-stone-700 dark:text-stone-200 leading-relaxed mb-8 relative z-10 pl-12" style={{ fontFamily: 'Crimson Pro, serif' }}>
              True growth happens not in isolation, but in the space between minds — 
              where vulnerability meets curiosity, and conversation becomes transformation.
            </p>
            <div className="flex items-center gap-4 pl-12">
              <div className="w-16 h-px bg-stone-300 dark:bg-stone-600"></div>
              <p className="text-sm text-stone-500 dark:text-stone-400 tracking-widest uppercase font-light">Our Belief</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}