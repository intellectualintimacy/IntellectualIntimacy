import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef, useEffect } from 'react'
import { ArrowRight } from 'lucide-react'

export default function Hero() {
  const heroRef = useRef(null)
  const videoRef = useRef(null)
  
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  })

  // Smooth parallax and fade
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '30%'])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-charcoal"
    >
      {/* 1. THE BACKGROUND CANVAS (Video treated as tone/texture) */}
      <motion.div style={{ y }} className="absolute inset-0 z-0">
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-40 grayscale-[0.3]"
        >
          <source src="/videos/hero.mp4" type="video/mp4" />
        </video>
        
        {/* Scrims to ensure the typography "pops" */}
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal/40 via-transparent to-charcoal/80" />
        <div className="absolute inset-0 bg-black/20" />
      </motion.div>

      {/* 2. THE TYPOGRAPHIC ARCHITECTURE (All Sans-Serif) */}
      <motion.div 
        style={{ opacity }}
        className="relative z-10 w-full max-w-7xl px-6 flex flex-col items-center text-center"
      >
        {/* Small Label - Wide Tracking (Logo Style) */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.19, 1, 0.22, 1] }}
          className="flex flex-col items-center mb-10"
        >
          <span className="text-[10px] md:text-[11px] tracking-[0.6em] text-gold uppercase font-sans font-medium">
            A CULTURAL PLATFORM
          </span>
          <div className="w-12 h-[1px] bg-gold/40 mt-6" />
        </motion.div>

        {/* Main Hook - Bold Sans Hierarchy */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 1.2, ease: [0.19, 1, 0.22, 1] }}
          className="font-sans text-5xl md:text-7xl lg:text-[100px] text-ivory font-light leading-[1.05] tracking-tight mb-10 uppercase"
        >
          Where ideas <br />
          <span className="font-medium">shape reality.</span>
        </motion.h1>

        {/* Core Narrative - Wide Leading Sans */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="max-w-2xl text-ivory/70 text-base md:text-lg font-light leading-[1.8] mb-12 font-sans tracking-wide"
        >
          meaningful human connection is formed through honest, <br className="hidden md:block" /> 
          thoughtful, and intellectually engaged dialogue.
        </motion.p>

        {/* Action Block - Minimalist block button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 1 }}
        >
          <a
            href="/events" 
            className="btn-elegant group flex items-center gap-10 bg-ivory text-charcoal py-5 px-12 hover:bg-gold hover:text-white transition-all duration-500"
          >
            <span className="text-[11px] tracking-[0.4em] font-medium">JOIN THE DIALOGUE</span>
            <ArrowRight size={18} strokeWidth={1.5} className="group-hover:translate-x-2 transition-transform duration-500" />
          </a>
        </motion.div>
      </motion.div>

      {/* 3. PERIPHERAL DETAILS (Logo Consistency) */}
      
      {/* Side Label */}
      <div className="absolute hidden lg:block right-12 top-1/2 -translate-y-1/2 rotate-90 origin-right">
        <span className="text-[9px] tracking-[0.5em] text-white/20 uppercase font-sans font-light">
          EST. 2024 — INTELLECTUAL INTIMACY
        </span>
      </div>

      {/* Bottom Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4"
      >
        <span className="text-[9px] tracking-[0.4em] text-gold uppercase font-sans">Scroll</span>
        <div className="w-[1px] h-16 bg-gradient-to-b from-gold to-transparent opacity-50" />
      </motion.div>
    </section>
  )
}