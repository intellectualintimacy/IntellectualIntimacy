import { motion } from 'framer-motion'
import { ArrowRight, Youtube, Instagram, Linkedin, Mail } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function CTASection() {
  return (
    <>
      {/* 1. MAIN INVITATION: High Contrast Ivory Section */}
      <section className="py-32 lg:py-56 bg-ivory text-ink relative border-t-2 border-stone-100">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-xs md:text-sm tracking-[0.6em] text-gold uppercase font-black mb-10 block">
              THE INVITATION
            </span>
            
            <h2 className="text-4xl md:text-7xl font-sans font-bold tracking-tighter text-ink uppercase mb-10 leading-[1.1]">
              BEGIN YOUR <br /> <span className="text-gold">JOURNEY.</span>
            </h2>
            
            <p className="text-base md:text-xl text-ink font-medium mb-16 max-w-2xl mx-auto leading-relaxed uppercase tracking-wide">
              Join a community of thinkers committed to depth, 
              growth, and authentic human connection beyond the surface.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-20">
              <button className="bg-ink text-white px-14 py-6 text-xs font-black tracking-[0.4em] uppercase hover:bg-gold transition-all duration-500">
                SUBSCRIBE NOW
              </button>
              <Link to="/about" className="border-2 border-ink text-ink px-14 py-6 text-xs font-black tracking-[0.4em] uppercase hover:bg-ink hover:text-white transition-all duration-500 inline-flex items-center justify-center gap-4">
                LEARN MORE <ArrowRight size={16} />
              </Link>
            </div>
            
            {/* SOCIAL REGISTRY: High Visibility Links */}
            <div className="flex flex-wrap items-center justify-center gap-10 border-t border-stone-200 pt-12">
              {[
                { icon: <Youtube size={20} />, label: 'YOUTUBE' },
                { icon: <Instagram size={20} />, label: 'INSTAGRAM' },
                { icon: <Linkedin size={20} />, label: 'LINKEDIN' },
                { icon: <Mail size={20} />, label: 'CONTACT' }
              ].map((social) => (
                <a key={social.label} href="#" className="flex items-center gap-3 text-ink hover:text-gold transition-colors group">
                  <span className="group-hover:scale-110 transition-transform">{social.icon}</span>
                  <span className="text-xs font-black tracking-widest uppercase">{social.label}</span>
                </a>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. SUPPORT MISSION: High Contrast Charcoal Section */}
      <section className="py-32 lg:py-48 bg-ink text-ivory relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-24 items-center">
            
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              
              <h2 className="text-4xl md:text-6xl font-sans font-bold tracking-tighter text-ivory uppercase mb-8 leading-tight">
                SUPPORT OUR <br /> MISSION.
              </h2>
              
              <p className="text-base md:text-lg mb-12 font-medium text-ivory/80 leading-relaxed uppercase tracking-wide">
                Help us create permanent spaces for meaningful dialogue. 
                Your contribution makes depth and intellectual honesty accessible.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6">
                <Link 
                  to="/support" 
                  className="bg-gold text-ink px-10 py-5 text-xs font-black tracking-[0.4em] uppercase hover:bg-white transition-all text-center"
                >
                  DONATE NOW
                </Link>
                <Link 
                  to="/support" 
                  className="border-2 border-white/20 text-white px-10 py-5 text-xs font-black tracking-[0.4em] uppercase hover:border-gold hover:text-gold transition-all text-center"
                >
                  BECOME A SPONSOR
                </Link>
              </div>
            </motion.div>

            {/* STATS: Architectural Registry Style (Flyer Inspired) */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-1"
            >
              {[
                { value: '11K', label: 'LIVES IMPACTED' },
                { value: '03+', label: 'EVENTS HOSTED' },
                { value: '140+', label: 'MEMBERS' },
                { value: 'R500+', label: 'COMMUNITY INVEST' }
              ].map((stat) => (
                <div key={stat.label} className="border border-white/10 p-10 flex flex-col items-center text-center group hover:bg-white/5 transition-colors">
                  <div className="text-5xl font-sans font-light text-gold mb-4 tracking-tighter group-hover:scale-110 transition-transform duration-500">
                    {stat.value}
                  </div>
                  <div className="text-[10px] tracking-[0.5em] text-white/40 uppercase font-black group-hover:text-white transition-colors">
                    {stat.label}
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Closing Logo-Line (Bottom Detail) */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 opacity-10">
          <span className="text-[100px] font-sans font-black tracking-tighter leading-none uppercase select-none">
            INTIMACY
          </span>
        </div>
      </section>
    </>
  )
}