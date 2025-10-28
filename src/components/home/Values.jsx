import { motion } from 'framer-motion'

export default function Values() {
  const values = ['Depth', 'Curiosity', 'Authenticity', 'Growth', 'Connection', 'Purpose']

  return (
    <section className="py-32 lg:py-40 bg-gradient-to-b from-stone-50 to-white dark:from-stone-950 dark:to-stone-900">
      <div className="max-w-7xl mx-auto px-8 lg:px-16">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <div className="elegant-divider mb-8"></div>
          <h2 className="text-5xl lg:text-6xl font-light text-balance" style={{ fontFamily: 'Crimson Pro, serif' }}>
            What Guides <span className="elegant-text">Us</span>
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="flex flex-wrap justify-center gap-4"
        >
          {values.map((value, index) => (
            <motion.div
              key={value}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="value-tag">
                {value}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}