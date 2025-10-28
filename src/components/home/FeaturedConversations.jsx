import { motion } from 'framer-motion'
import { Youtube, Clock } from 'lucide-react'

export default function FeaturedConversations() {
  const videos = [
    { 
      title: 'Latest Conversation', 
      videoId: 'iT_SCuvOZm4',
      duration: '53:56',
      topic: 'Deep Dialogue'
    },
    { 
      title: 'Meaningful Exchange', 
      videoId: 'BchFCnqnc6U',
      duration: '45:17',
      topic: 'Personal Growth'
    },
    { 
      title: 'Thoughtful Discussion', 
      videoId: 'QJrG7bz-ODA',
      duration: '37:28',
      topic: 'Life & Wisdom'
    },
    { 
      title: 'Intimate Conversation', 
      videoId: '5ZpElzsuCGo',
      duration: '14:05',
      topic: 'Insight & Reflection'
    }
  ]

  return (
    <section id="media" className="py-32 lg:py-40 bg-white dark:bg-stone-900 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-8 lg:px-16">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <div className="elegant-divider mb-8"></div>
          <h2 className="text-5xl lg:text-6xl mb-8 font-light text-balance" style={{ fontFamily: 'Crimson Pro, serif' }}>
            Featured <span className="elegant-text">Conversations</span>
          </h2>
          <p className="text-xl text-stone-600 dark:text-stone-300 max-w-3xl mx-auto font-light mb-8">
            Dive into our most impactful dialogues exploring life, growth, and human connection
          </p>
          <a 
            href="https://www.youtube.com/@Intellectual-Intimacy" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100 transition-colors group"
          >
            <Youtube className="w-5 h-5 group-hover:scale-110 transition-transform" strokeWidth={1.5} />
            <span className="font-light">View all conversations on YouTube</span>
          </a>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {videos.map((video, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              className="video-card group"
            >
              {/* YouTube Embed */}
              <div className="aspect-video relative overflow-hidden mb-6 bg-stone-900 soft-shadow">
                <iframe
                  src={`https://www.youtube.com/embed/${video.videoId}?rel=0&modestbranding=1`}
                  title={video.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                  loading="lazy"
                  referrerPolicy="strict-origin-when-cross-origin"
                ></iframe>
                
                {/* Duration badge */}
                <div className="absolute top-4 right-4 px-3 py-1.5 bg-black/80 backdrop-blur-sm text-white text-xs font-light rounded-sm flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" strokeWidth={1.5} />
                  {video.duration}
                </div>
              </div>

              <div className="space-y-3 px-6 pb-6">
                <span className="inline-block px-3 py-1 bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 text-xs tracking-wider uppercase font-light rounded-sm">
                  {video.topic}
                </span>
                <h3 className="text-2xl font-light text-stone-800 dark:text-stone-100 group-hover:elegant-text transition-colors" style={{ fontFamily: 'Crimson Pro, serif' }}>
                  {video.title}
                </h3>
                <a 
                  href={`https://www.youtube.com/watch?v=${video.videoId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 text-sm font-light transition-colors group/link"
                >
                  <Youtube className="w-4 h-4 group-hover/link:scale-110 transition-transform" strokeWidth={1.5} />
                  Watch on YouTube
                </a>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Channel CTA */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <a
            href="https://www.youtube.com/@Intellectual-Intimacy?sub_confirmation=1"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-elegant inline-flex items-center justify-center group"
          >
            <Youtube className="mr-3 w-5 h-5 group-hover:scale-110 transition-transform" strokeWidth={1.5} />
            Subscribe to Our Channel
          </a>
        </motion.div>
      </div>
    </section>
  )
}