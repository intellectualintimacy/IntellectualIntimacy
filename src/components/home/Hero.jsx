import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowRight, Sparkles, Play } from 'lucide-react'
import { useRef, useState } from 'react'

export default function Hero() {
  const heroRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  })

  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%'])
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.1])
  const [videoLoaded, setVideoLoaded] = useState(false)

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden text-center"
    >
      {/* Background Video */}
      <motion.div style={{ y, scale }} className="absolute inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          onLoadedData={() => setVideoLoaded(true)}
          className="absolute inset-0 w-full h-full object-cover"
          poster="/video-poster.jpg"
        >
          <source src="../../../videos/hero.mp4" type="video/mp4" />
        </video>

        {/* Fallback gradient */}
        {!videoLoaded && (
          <div className="absolute inset-0 bg-gradient-to-br from-stone-900 via-stone-800 to-amber-900 dark:from-black dark:via-stone-950 dark:to-stone-900">
            <div className="absolute inset-0 opacity-30">
              <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl animate-float"></div>
              <div
                className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-float"
                style={{ animationDelay: '2s' }}
              ></div>
            </div>
          </div>
        )}

        {/* Overlays */}
        <div className="absolute inset-0 bg-black/70"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,black_100%)] opacity-40"></div>
      </motion.div>

      {/* Content */}
      <div className="relative z-10 w-full flex flex-col items-center justify-center px-6 lg:px-16 text-center">
        {/* Floating Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="inline-flex items-center gap-2 mb-6 px-5 py-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-sm shadow-2xl"
        >
          <Sparkles className="w-4 h-4 text-amber-400" strokeWidth={1.5} />
          <span className="text-sm font-light text-white tracking-widest uppercase">
            Where Thought Meets Feeling
          </span>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="text-5xl sm:text-6xl lg:text-5xl xl:text-8xl mb-6 leading-tight font-light text-white drop-shadow-2xl"
          style={{ fontFamily: 'Crimson Pro, serif' }}
        >
          Intellectual Intimacy
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.8 }}
          className="text-lg sm:text-xl lg:text-0.5xl text-stone-100 mb-10 leading-relaxed max-w-2xl font-light drop-shadow-lg"
        >
          A sanctuary for the curious mind nurturing depth, awareness and
          transformation through meaningful conversations and authentic human
          connection.
        </motion.p>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.8 }}
          className="flex flex-col sm:flex-row gap-5 justify-center"
        >
          <button className="group relative px-10 py-4 bg-gradient-to-r from-amber-600 to-amber-500 text-white font-medium overflow-hidden transition-all hover:shadow-2xl hover:shadow-amber-500/50 hover:scale-105">
            <span className="relative z-10 flex items-center justify-center">
              Begin Your Journey
              <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" strokeWidth={1.5} />
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
          </button>

          <a
            href="https://www.youtube.com/@Intellectual-Intimacy"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative px-10 py-4 border-2 border-white/40 text-white font-medium backdrop-blur-md hover:border-amber-400 transition-all hover:bg-white/10 hover:scale-105"
          >
            <span className="flex items-center justify-center">
              <Play className="mr-3 w-5 h-5 group-hover:scale-110 transition-transform" strokeWidth={1.5} />
              Watch Conversations
            </span>
          </a>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.8 }}
          className="flex items-center gap-12 mt-14"
        >
          <div className="text-center">
            <div
              className="text-4xl lg:text-5xl font-light text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-300 mb-2"
              style={{ fontFamily: 'Crimson Pro, serif' }}
            >
              9+
            </div>
            <div className="text-xs tracking-widest uppercase text-stone-200 font-light">
              Deep Dialogues
            </div>
          </div>
          <div className="w-px h-16 bg-gradient-to-b from-transparent via-white/30 to-transparent"></div>
          <div className="text-center">
            <div
              className="text-4xl lg:text-5xl font-light text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-300 mb-2"
              style={{ fontFamily: 'Crimson Pro, serif' }}
            >
              140+
            </div>
            <div className="text-xs tracking-widest uppercase text-stone-200 font-light">
              Community
            </div>
          </div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="flex flex-col items-center gap-2 text-white/70"
        >
          <span className="text-xs tracking-widest uppercase font-light">Scroll to Explore</span>
          <div className="w-6 h-10 border-2 border-white/40 rounded-full flex justify-center pt-2">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="w-1 h-2 bg-white/70 rounded-full"
            ></motion.div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  )
}
