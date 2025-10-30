import { useState } from 'react'
import { motion } from 'framer-motion'
import { Heart, Star, Send, CheckCircle } from 'lucide-react'
import { supabase } from '../../lib/supabase'


export default function ShareTestimonial() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    testimonial: '',
    rating: 5
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleRatingClick = (rating) => {
    setFormData(prev => ({
      ...prev,
      rating
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const { error: submitError } = await supabase
        .from('testimonials')
        .insert([
          {
            name: formData.name,
            email: formData.email,
            role: formData.role || 'Community Member',
            testimonial: formData.testimonial,
            rating: formData.rating
          }
        ])

      if (submitError) throw submitError

      setIsSubmitted(true)
      setFormData({
        name: '',
        email: '',
        role: '',
        testimonial: '',
        rating: 5
      })
    } catch (err) {
      console.error('Error submitting testimonial:', err)
      setError('Failed to submit your testimonial. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-stone-50 to-white dark:from-stone-950 dark:to-stone-900 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-flex items-center justify-center w-20 h-20 mb-8"
          >
            <CheckCircle className="w-20 h-20 text-amber-500" strokeWidth={1} />
          </motion.div>

          <div className="w-16 h-px bg-gradient-to-r from-transparent via-amber-500 to-transparent mx-auto mb-8"></div>

          <h1 className="text-4xl lg:text-5xl mb-6 font-light text-stone-800 dark:text-stone-100" style={{ fontFamily: 'Crimson Pro, serif' }}>
            Thank You for <span className="bg-gradient-to-r from-amber-500 to-yellow-500 bg-clip-text text-transparent">Sharing</span>
          </h1>

          <p className="text-lg text-stone-600 dark:text-stone-300 leading-relaxed font-light mb-12 max-w-xl mx-auto">
            Your testimonial has been received and will be reviewed by our team. 
            We deeply appreciate you taking the time to share your experience.
          </p>

          <a
            href="/"
            className="inline-block px-8 py-4 bg-stone-800 dark:bg-stone-100 text-white dark:text-stone-900 text-sm uppercase tracking-wider font-light hover:bg-stone-700 dark:hover:bg-stone-200 transition-colors"
          >
            Return Home
          </a>
        </motion.div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-stone-50 to-white dark:from-stone-950 dark:to-stone-900 pt-32 pb-20">
      <div className="max-w-3xl mx-auto px-8 lg:px-16">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="w-16 h-px bg-gradient-to-r from-transparent via-amber-500 to-transparent mx-auto mb-8"></div>
          
          <h1 className="text-5xl lg:text-6xl mb-6 font-light text-stone-800 dark:text-stone-100" style={{ fontFamily: 'Crimson Pro, serif' }}>
            Share Your <span className="bg-gradient-to-r from-amber-500 to-yellow-500 bg-clip-text text-transparent">Experience</span>
          </h1>
          
          <p className="text-xl text-stone-600 dark:text-stone-300 leading-relaxed font-light max-w-2xl mx-auto">
            Your story matters. Help others discover the transformative power of meaningful dialogue 
            by sharing your experience with our community.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-8 lg:p-12"
        >
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Name Input */}
            <div>
              <label htmlFor="name" className="block text-sm uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-3 font-light">
                Your Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-stone-800 dark:text-stone-100 focus:outline-none focus:border-amber-500 dark:focus:border-amber-500 transition-colors font-light"
                placeholder="Sarah M."
              />
            </div>

            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-3 font-light">
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-stone-800 dark:text-stone-100 focus:outline-none focus:border-amber-500 dark:focus:border-amber-500 transition-colors font-light"
                placeholder="sarah@example.com"
              />
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-2 font-light">
                Your email will not be published
              </p>
            </div>

            {/* Role Input */}
            <div>
              <label htmlFor="role" className="block text-sm uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-3 font-light">
                Your Role (Optional)
              </label>
              <input
                type="text"
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-stone-800 dark:text-stone-100 focus:outline-none focus:border-amber-500 dark:focus:border-amber-500 transition-colors font-light"
                placeholder="e.g., Workshop Participant, Community Member"
              />
            </div>

            {/* Rating */}
            <div>
              <label className="block text-sm uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-3 font-light">
                Your Rating *
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => handleRatingClick(rating)}
                    className="focus:outline-none transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        rating <= formData.rating
                          ? 'text-amber-500 fill-amber-500'
                          : 'text-stone-300 dark:text-stone-600'
                      }`}
                      strokeWidth={1.5}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Testimonial Text */}
            <div>
              <label htmlFor="testimonial" className="block text-sm uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-3 font-light">
                Your Testimonial *
              </label>
              <textarea
                id="testimonial"
                name="testimonial"
                value={formData.testimonial}
                onChange={handleChange}
                required
                rows={6}
                className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-stone-800 dark:text-stone-100 focus:outline-none focus:border-amber-500 dark:focus:border-amber-500 transition-colors resize-none font-light"
                placeholder="Share your experience with our community. What impact has Intellectual Intimacy had on your journey?"
              />
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-2 font-light">
                Minimum 50 characters
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting || formData.testimonial.length < 50}
                className="w-full px-8 py-4 bg-stone-800 dark:bg-stone-100 text-white dark:text-stone-900 text-sm uppercase tracking-wider font-light hover:bg-stone-700 dark:hover:bg-stone-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white dark:border-stone-900 border-t-transparent rounded-full animate-spin"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" strokeWidth={1.5} />
                    Submit Testimonial
                  </>
                )}
              </button>
            </div>

            <p className="text-xs text-center text-stone-500 dark:text-stone-400 font-light">
              Your testimonial will be reviewed before being published on our website.
            </p>
          </form>
        </motion.div>

        {/* Info Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-16 text-center"
        >
          <Heart className="w-8 h-8 text-amber-500 mx-auto mb-4" strokeWidth={1.5} />
          <p className="text-stone-600 dark:text-stone-300 font-light italic" style={{ fontFamily: 'Crimson Pro, serif' }}>
            "True growth happens not in isolation, but in the space between minds"
          </p>
        </motion.div>
      </div>
    </main>
  )
}