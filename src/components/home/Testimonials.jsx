import { motion } from 'framer-motion'
import { Heart, Star, Quote } from 'lucide-react'

export default function Testimonials() {
  const testimonials = [
    { 
      quote: 'These conversations have fundamentally changed how I approach relationships and personal growth. The depth and authenticity here is unlike anything I\'ve experienced.', 
      author: 'Sarah M.', 
      role: 'Community Member',
      rating: 5
    },
    { 
      quote: 'A rare space where intellectual depth meets genuine human connection. Every event leaves me feeling inspired and more connected to myself and others.', 
      author: 'David K.', 
      role: 'Workshop Participant',
      rating: 5
    },
    { 
      quote: 'I found my tribe here. People who think deeply, feel deeply, and grow together. This community has become an essential part of my life journey.', 
      author: 'Lerato N.', 
      role: 'Regular Attendee',
      rating: 5
    }
  ]

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

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              className="testimonial-card group"
            >
              <div className="flex items-center justify-between mb-6">
                <Heart className="w-8 h-8 text-stone-300 dark:text-stone-600 group-hover:text-amber-500 group-hover:fill-amber-500 transition-all" strokeWidth={1.5} />
                <div className="flex gap-1">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-amber-500 fill-amber-500" strokeWidth={1.5} />
                  ))}
                </div>
              </div>
              
              <Quote className="w-10 h-10 text-stone-200 dark:text-stone-800 mb-4" strokeWidth={1.5} />
              
              <p className="text-lg text-stone-700 dark:text-stone-200 leading-relaxed mb-6 font-light italic">
                "{testimonial.quote}"
              </p>
              
              <div className="pt-4 border-t border-stone-200 dark:border-stone-700">
                <div className="font-medium text-stone-800 dark:text-stone-100">{testimonial.author}</div>
                <div className="text-sm text-stone-500 dark:text-stone-400">{testimonial.role}</div>
              </div>
            </motion.div>
          ))}
        </div>

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