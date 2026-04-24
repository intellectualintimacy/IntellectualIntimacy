import { motion } from 'framer-motion'

export default function Philosophy() {
  const features = [
    {
      title: 'DEEP DIALOGUE',
      description: 'Curated conversations designed to challenge existing perspectives and expand understanding through honest engagement.',
      id: '01'
    },
    {
      title: 'INTIMATE SPACES',
      description: 'Intentionally crafted environments, both digital and physical, where depth is valued over surface-level interaction.',
      id: '02'
    },
    {
      title: 'THOUGHTFUL GROWTH',
      description: 'A commitment to intellectual courage and emotional resonance, building a community of thinkers and contributors.',
      id: '03'
    }
  ]

  return (
    <section className="py-32 lg:py-56 bg-ivory text-ink relative">
      {/* Decorative vertical line (architectural element) */}
      <div className="absolute left-1/2 top-0 w-[1px] h-full bg-stone-200/40 hidden lg:block"></div>

      <div className="max-w-7xl mx-auto px-6 lg:px-16 relative z-10">
        
        {/* HEADER: Exactly consistent with the logo's sub-text */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex flex-col items-center text-center mb-40"
        >
          <span className="text-[10px] md:text-[11px] tracking-[0.6em] uppercase text-gold mb-6">
            OUR PHILOSOPHY
          </span>
          <div className="w-12 h-[1px] bg-gold/30 mb-12"></div>
          
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-sans font-light tracking-tight leading-[1.1] max-w-5xl">
            Meaningful human connection is <br />
            formed through honest, thoughtful <br />
            and intellectually engaged dialogue.
          </h2>
        </motion.div>

        {/* CONTENT GRID: Consistent sans-serif hierarchy */}
        <div className="grid lg:grid-cols-3 gap-16 lg:gap-24">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.8 }}
              className="flex flex-col group"
            >
              {/* ID & TITLE (All caps, wide tracking like the logo) */}
              <div className="flex items-center gap-4 mb-8">
                <span className="text-[11px] tracking-[0.4em] text-gold font-medium">
                  {feature.id}
                </span>
                <div className="h-[1px] flex-grow bg-stone-200 transition-all duration-700 group-hover:bg-gold/40"></div>
              </div>
              
              <h3 className="text-[13px] md:text-[14px] tracking-[0.4em] font-sans font-medium mb-6 transition-colors group-hover:text-gold">
                {feature.title}
              </h3>
              
              {/* DESCRIPTION (Clean, consistent sans) */}
              <p className="text-sm font-light leading-relaxed text-ink/60 tracking-wide">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* FOOTER: Subtle brand alignment */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-40 pt-16 border-t border-stone-200 flex flex-col md:flex-row justify-between items-center gap-6"
        >
          <span className="text-[9px] tracking-[0.5em] uppercase text-ink/30 font-sans">
            INTELLECTUAL INTIMACY — CAPE TOWN
          </span>
          <div className="h-[1px] w-12 bg-stone-200 hidden md:block"></div>
          <p className="text-[10px] tracking-[0.3em] uppercase text-gold font-sans">
            where ideas shape reality
          </p>
        </motion.div>
      </div>
    </section>
  )
}