import { motion } from 'framer-motion'

export default function Values() {
  const values = [
    { name: 'Depth', id: '01' },
    { name: 'Curiosity', id: '02' },
    { name: 'Authenticity', id: '03' },
    { name: 'Growth', id: '04' },
    { name: 'Connection', id: '05' },
    { name: 'Purpose', id: '06' }
  ]

  return (
    <section className="py-32 lg:py-56 bg-ivory text-ink relative overflow-hidden border-t border-stone-200/50">
      {/* Background architectural detail: A vertical line that anchors the layout */}
      <div className="absolute left-1/2 top-0 w-[1px] h-full bg-stone-200/30 hidden lg:block"></div>

      <div className="max-w-7xl mx-auto px-6 lg:px-16 relative z-10">
        
        {/* HEADER: Exactly consistent with your logo branding */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col items-center text-center mb-40"
        >
          <span className="text-[10px] md:text-[11px] tracking-[0.6em] text-gold uppercase mb-8 font-medium">
            CORE VALUES
          </span>
          <h2 className="text-4xl md:text-6xl font-sans font-light tracking-tight text-ink uppercase">
            What guides <br /> <span className="font-medium text-gold">our dialogue.</span>
          </h2>
          <div className="w-12 h-[1px] bg-gold/30 mt-12"></div>
        </motion.div>

        {/* VALUES GRID: Architectural Pillar Layout */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-y-24 gap-x-12 lg:gap-x-24">
          {values.map((value, index) => (
            <motion.div
              key={value.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.8 }}
              className="group flex flex-col items-center text-center"
            >
              {/* ID Marker */}
              <span className="text-[10px] tracking-[0.4em] text-gold font-bold mb-6">
                {value.id}
              </span>
              
              {/* The Value Name: Clean, Bold, High Contrast */}
              <h3 className="text-3xl md:text-4xl font-sans font-light tracking-tighter text-ink uppercase mb-6 group-hover:text-gold transition-colors duration-500">
                {value.name}
              </h3>

              {/* Decorative underline that expands on hover */}
              <div className="w-8 h-[1px] bg-stone-200 group-hover:w-20 group-hover:bg-gold transition-all duration-700"></div>
            </motion.div>
          ))}
        </div>

        {/* FOOTER: Minimalist closing element */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-48 text-center pt-20 border-t border-stone-200/40"
        >
          <p className="text-[11px] tracking-[0.5em] uppercase text-ink/30 font-sans">
            Aligned with depth and intellectual honesty
          </p>
        </motion.div>
      </div>
    </section>
  )
}