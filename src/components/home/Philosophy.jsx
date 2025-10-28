import { motion } from 'framer-motion'
import { MessageCircle, Calendar, Users } from 'lucide-react'

export default function Philosophy() {
  const features = [
    {
      icon: <MessageCircle className="w-7 h-7" strokeWidth={1.5} />,
      title: 'Deep Conversations',
      description: 'Curated dialogues that challenge perspectives and inspire genuine understanding across diverse viewpoints.',
      number: '01'
    },
    {
      icon: <Calendar className="w-7 h-7" strokeWidth={1.5} />,
      title: 'Intimate Workshops',
      description: 'Immersive experiences designed to elevate emotional intelligence and intellectual mastery.',
      number: '02'
    },
    {
      icon: <Users className="w-7 h-7" strokeWidth={1.5} />,
      title: 'Thoughtful Community',
      description: 'A carefully cultivated network of reflective minds committed to growth and authentic connection.',
      number: '03'
    }
  ]

  return (
    <section className="py-32 lg:py-40 bg-stone-50 dark:bg-stone-950 relative">
      <div className="texture-lines absolute inset-0 opacity-20 dark:opacity-5"></div>
      
      <div className="max-w-7xl mx-auto px-8 lg:px-16 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-4xl mx-auto mb-24"
        >
          <div className="elegant-divider mb-8"></div>
          <h2 className="text-5xl lg:text-6xl mb-8 font-light text-balance" style={{ fontFamily: 'Crimson Pro, serif' }}>
            Our <span className="elegant-text">Philosophy</span>
          </h2>
          <p className="text-xl text-stone-600 dark:text-stone-300 leading-relaxed font-light">
            We are redefining personal growth by blending intellect with emotion, 
            conversation with connection, and knowledge with purpose. Our gatherings 
            cultivate the art of living consciously and thinking expansively.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2, duration: 0.8 }}
              className="feature-card group"
            >
              <div className="relative mb-8">
                <span className="section-number absolute -top-4 -left-2">{feature.number}</span>
                <div className="icon-elegant">
                  {feature.icon}
                </div>
              </div>
              
              <h3 className="text-2xl mb-5 font-light text-stone-800 dark:text-stone-100" style={{ fontFamily: 'Crimson Pro, serif' }}>
                {feature.title}
              </h3>
              
              <p className="text-stone-600 dark:text-stone-300 leading-relaxed font-light">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}