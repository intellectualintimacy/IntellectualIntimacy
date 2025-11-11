import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Play, Youtube, Sparkles } from 'lucide-react'

export default function YouTubeModal({ isOpen, onClose, videoId, videoUrl, channelUrl }) {
  const [hasWatched, setHasWatched] = useState(false)

  const handleWatch = () => {
    setHasWatched(true)
    // Mark as watched in localStorage
    localStorage.setItem('youtube_modal_watched', 'true')
    localStorage.setItem('youtube_modal_date', new Date().toISOString())
  }

  const handleClose = () => {
    if (!hasWatched) {
      localStorage.setItem('youtube_modal_dismissed', 'true')
      localStorage.setItem('youtube_modal_date', new Date().toISOString())
    }
    onClose()
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
          />

          {/* Modal Container with proper spacing */}
          <div className="fixed inset-0 z-50 overflow-y-auto pointer-events-none">
            <div className="min-h-screen px-4 py-8 md:py-12 lg:py-4 flex items-center justify-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: "spring", duration: 0.5 }}
                className="relative w-full max-w-5xl pointer-events-auto my-8"
              >
                <div className="bg-gradient-to-b from-stone-50 to-white dark:from-stone-900 dark:to-stone-950 border-2 border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden">
                  {/* Close Button */}
                  <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/70 backdrop-blur-sm text-white transition-all duration-200 group"
                    aria-label="Close modal"
                  >
                    <X className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" strokeWidth={1.5} />
                  </button>

                  {/* Content */}
                  <div className="p-6 md:p-8 lg:p-12">
                    {/* Header */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="text-center mb-6 md:mb-8"
                    >
                      <motion.div
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 dark:border-amber-500/30 mb-4 md:mb-6"
                      >
                        <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" strokeWidth={1.5} />
                        <span className="text-sm text-amber-700 dark:text-amber-300 font-light tracking-wider uppercase">
                          New Video Available
                        </span>
                      </motion.div>

                      <div className="elegant-divider mb-4 md:mb-6 opacity-30"></div>

                      <h2 className="text-2xl md:text-3xl lg:text-4xl font-light text-stone-900 dark:text-stone-100 mb-3 md:mb-4 px-4" style={{ fontFamily: 'Crimson Pro, serif' }}>
                        Watch Our Latest <span className="text-stone-600 dark:text-stone-400">Conversation</span>
                      </h2>
                      <p className="text-base md:text-lg text-stone-600 dark:text-stone-400 font-light max-w-2xl mx-auto leading-relaxed px-4">
                        Join us in our newest dialogue exploring the impact of Artificial Intelligence on meaningful human connections, through intellectual discourse.
                      </p>
                    </motion.div>

                    {/* Video Embed */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="relative aspect-video bg-stone-300 mb-6 md:mb-8 shadow-xl border border-stone-300 dark:border-stone-800"
                    >
                      <iframe
                        src={`https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0&modestbranding=1`}
                        title="Latest Intellectual Intimacy Conversation"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        className="absolute inset-0 w-full h-full"
                        onPlay={handleWatch}
                      ></iframe>
                    </motion.div>

                    {/* Action Buttons */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                      className="flex flex-col sm:flex-row gap-3 md:gap-4 items-center justify-center"
                    >
                      <a
                        href={videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={handleWatch}
                        className="w-full sm:w-auto px-6 md:px-8 py-3 md:py-4 bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900 hover:bg-stone-800 dark:hover:bg-stone-200 transition-all duration-300 flex items-center justify-center gap-3 font-light group shadow-lg text-sm md:text-base"
                      >
                        <Play className="w-5 h-5 group-hover:scale-110 transition-transform" strokeWidth={1.5} />
                        Watch on YouTube
                      </a>

                      <a
                        href={channelUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full sm:w-auto px-6 md:px-8 py-3 md:py-4 border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-all duration-300 flex items-center justify-center gap-3 font-light group text-sm md:text-base"
                      >
                        <Youtube className="w-5 h-5 group-hover:scale-110 transition-transform" strokeWidth={1.5} />
                        Subscribe to Channel
                      </a>
                    </motion.div>

                    {/* Footer Note */}
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.8 }}
                      className="text-center text-xs md:text-sm text-stone-500 dark:text-stone-500 font-light mt-6 md:mt-8"
                    >
                      This modal appears once per day for new visitors
                    </motion.p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Elegant Divider Style */}
          <style jsx>{`
            .elegant-divider {
              width: 60px;
              height: 1px;
              background: linear-gradient(to right, transparent, currentColor, transparent);
              margin: 0 auto;
            }
          `}</style>
        </>
      )}
    </AnimatePresence>
  )
}