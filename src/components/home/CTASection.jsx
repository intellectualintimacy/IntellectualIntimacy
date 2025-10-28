import { motion } from 'framer-motion'
import { ArrowRight, Youtube, Instagram, Linkedin, Mail, Heart, Building2 } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function CTASection() {
  return (
    <>
      {/* Main CTA Section */}
      <section className="py-32 lg:py-40 bg-stone-50 dark:bg-stone-950">
        <div className="max-w-5xl mx-auto px-8 lg:px-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="elegant-divider mb-8"></div>
            <h2 className="text-5xl lg:text-6xl mb-8 font-light text-balance" style={{ fontFamily: 'Crimson Pro, serif' }}>
              Begin Your <span className="elegant-text">Journey</span>
            </h2>
            <p className="text-xl text-stone-600 dark:text-stone-300 mb-12 max-w-2xl mx-auto leading-relaxed font-light">
              Join a community of thinkers, seekers, and dreamers committed to depth, 
              growth, and authentic connection.
            </p>
            <div className="flex flex-col sm:flex-row gap-5 justify-center mb-12">
              <button className="btn-elegant">
                Subscribe Now
              </button>
              <Link to="/about" className="btn-outlined inline-flex items-center justify-center">
                Learn More
                <ArrowRight className="ml-3 w-4 h-4" />
              </Link>
            </div>
            
            <div className="flex items-center justify-center gap-6 pt-8">
              <a href="https://www.youtube.com/@Intellectual-Intimacy" target="_blank" rel="noopener noreferrer" className="social-icon">
                <Youtube className="w-5 h-5" />
              </a>
              <a href="#" className="social-icon">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="social-icon">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="social-icon">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Support CTA Section */}
      <section className="py-24 lg:py-32 bg-gradient-to-br from-amber-600 via-orange-600 to-red-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 texture-dots opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
        
        <div className="max-w-6xl mx-auto px-8 lg:px-16 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur px-4 py-2 rounded-full mb-6">
                <Heart className="w-4 h-4" fill="currentColor" />
                <span className="text-sm font-light">Make an Impact</span>
              </div>
              
              <h2 className="text-4xl lg:text-5xl mb-6 font-light" style={{ fontFamily: 'Crimson Pro, serif' }}>
                Support Our Mission
              </h2>
              <p className="text-lg mb-8 font-light opacity-90 leading-relaxed">
                Help us create spaces for meaningful dialogue and transformative growth. 
                Your contribution makes depth, authenticity, and connection accessible to all.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  to="/support" 
                  className="inline-flex items-center justify-center bg-white text-amber-600 px-8 py-4 font-medium hover:bg-stone-50 transition-all shadow-lg hover:shadow-xl group"
                >
                  <Heart className="mr-3 w-5 h-5 group-hover:scale-110 transition-transform" />
                  Donate Now
                </Link>
                <Link 
                  to="/support" 
                  className="inline-flex items-center justify-center border-2 border-white text-white px-8 py-4 font-medium hover:bg-white hover:text-amber-600 transition-all"
                >
                  <Building2 className="mr-3 w-5 h-5" />
                  Become a Sponsor
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="grid grid-cols-2 gap-6"
            >
              <div className="bg-white/10 backdrop-blur p-6 rounded-lg border border-white/20">
                <div className="text-4xl font-light mb-2" style={{ fontFamily: 'Crimson Pro, serif' }}>500+</div>
                <div className="text-sm opacity-90 font-light">Lives Impacted</div>
              </div>
              <div className="bg-white/10 backdrop-blur p-6 rounded-lg border border-white/20">
                <div className="text-4xl font-light mb-2" style={{ fontFamily: 'Crimson Pro, serif' }}>50+</div>
                <div className="text-sm opacity-90 font-light">Events Hosted</div>
              </div>
              <div className="bg-white/10 backdrop-blur p-6 rounded-lg border border-white/20">
                <div className="text-4xl font-light mb-2" style={{ fontFamily: 'Crimson Pro, serif' }}>2K+</div>
                <div className="text-sm opacity-90 font-light">Community Members</div>
              </div>
              <div className="bg-white/10 backdrop-blur p-6 rounded-lg border border-white/20">
                <div className="text-4xl font-light mb-2" style={{ fontFamily: 'Crimson Pro, serif' }}>R250K</div>
                <div className="text-sm opacity-90 font-light">Community Investment</div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  )
}