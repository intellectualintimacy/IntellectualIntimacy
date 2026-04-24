import { motion } from 'framer-motion'
import { Youtube, ArrowUpRight } from 'lucide-react'

export default function FeaturedConversations() {
  const videos = [
    { 
      id: "01",
      title: 'WHAT IS IDENTITY?', 
      videoId: 'iT_SCuvOZm4',
      duration: '53 MIN',
      topic: 'CULTURAL IDENTITY'
    },
    { 
      id: "02",
      title: 'ARE HUMANS JUST EVIL?', 
      videoId: 'BchFCnqnc6U',
      duration: '45 MIN',
      topic: 'NATURE OF HUMANITY'
    },
    { 
      id: "03",
      title: 'WHAT IT MEANS TO BELIEVE IN GOD.', 
      videoId: 'QJrG7bz-ODA',
      duration: '37 MIN',
      topic: 'BELIEF & SPIRITUALITY'
    }
  ]

  return (
    <section id="media" className="py-32 lg:py-56 bg-ivory text-ink relative overflow-hidden">
      
      {/* 1. BACKGROUND ARCHITECTURE: Sans-Serif Watermark */}
      <div className="absolute top-0 right-0 p-10 opacity-[0.02] select-none pointer-events-none">
        <span className="text-[18vw] font-sans font-black tracking-tighter leading-none uppercase">
          Archive
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-16">
        
        {/* 2. SECTION HEADER: Logo Consistency */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-40 gap-10">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="max-w-xl"
          >
            <span className="text-[10px] tracking-[0.6em] text-gold uppercase mb-8 block font-medium">
              RECORDED DIALOGUES
            </span>
            <h2 className="text-5xl lg:text-7xl font-sans font-light tracking-tight leading-[1.1] uppercase">
              Conversations <br />
              <span className="font-medium text-gold">that matter.</span>
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex flex-col items-start md:items-end text-left md:text-right"
          >
            <p className="text-ink/50 font-sans font-light text-sm tracking-wide max-w-xs mb-8 leading-relaxed">
              a curated collection of shared thoughts, captured to bridge the gap between ideas and real-world connection.
            </p>
            <a 
              href="https://www.youtube.com/@Intellectual-Intimacy" 
              target="_blank" 
              className="text-[11px] tracking-[0.4em] text-ink hover:text-gold transition-colors flex items-center gap-4 group font-medium uppercase"
            >
              YOUTUBE PLATFORM <ArrowUpRight size={14} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </a>
          </motion.div>
        </div>

        {/* 3. ASYMMETRICAL ARCHIVE: Using Wide Tracking Hierarchy */}
        <div className="space-y-48">
          {videos.map((video, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1, ease: [0.19, 1, 0.22, 1] }}
              className={`flex flex-col ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-16 lg:gap-32`}
            >
              
              {/* Image/Video Side: Minimalist Frame */}
              <div className="w-full md:w-[55%] group">
                <div className="relative aspect-video bg-charcoal overflow-hidden shadow-soft transition-all duration-700 group-hover:shadow-2xl">
                  <iframe
                    src={`https://www.youtube.com/embed/${video.videoId}?rel=0&modestbranding=1`}
                    title={video.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full grayscale-[0.4] hover:grayscale-0 transition-all duration-1000 opacity-80 hover:opacity-100"
                    loading="lazy"
                  ></iframe>
                  {/* Subtle Gold Edge only on hover */}
                  <div className="absolute inset-0 border border-gold/0 group-hover:border-gold/20 pointer-events-none transition-colors duration-700" />
                </div>
              </div>

              {/* Text side: Bold Sans Hierarchy */}
              <div className="w-full md:w-[45%] flex flex-col justify-center">
                <div className="flex items-center gap-6 mb-8">
                  <span className="text-gold font-sans text-xl font-bold tracking-widest">{video.id}</span>
                  <div className="h-[1px] w-12 bg-gold/30"></div>
                  <span className="text-[10px] tracking-[0.5em] text-ink/40 uppercase font-medium">
                    {video.topic} — {video.duration}
                  </span>
                </div>

                <h3 className="text-3xl lg:text-4xl font-sans font-light tracking-tight text-ink mb-10 leading-tight uppercase group-hover:text-gold transition-colors duration-500">
                  {video.title}
                </h3>

                <a 
                  href={`https://youtube.com/watch?v=${video.videoId}`}
                  target="_blank"
                  className="flex items-center gap-6 group/btn"
                >
                  <div className="w-14 h-14 rounded-none border border-ink/10 flex items-center justify-center group-hover/btn:border-gold group-hover/btn:bg-gold transition-all duration-500">
                    <Youtube size={18} strokeWidth={1.5} className="text-ink group-hover/btn:text-ivory" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] tracking-[0.4em] text-ink font-medium uppercase">Play Dialogue</span>
                    <div className="h-[1px] w-0 bg-gold group-hover/btn:w-full transition-all duration-500 mt-1"></div>
                  </div>
                </a>
              </div>
            </motion.div>
          ))}
        </div>

        {/* 4. CLOSING CTA: Consistent Minimal Block */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-64 pt-24 border-t border-stone-200 flex flex-col items-center"
        >
          <span className="text-ink/30 text-[10px] tracking-[0.6em] uppercase mb-12 text-center">
            Expanding the dialogue
          </span>
          <a
            href="https://www.youtube.com/@Intellectual-Intimacy?sub_confirmation=1"
            target="_blank"
            className="btn-elegant bg-ink text-ivory hover:bg-gold transition-all duration-500 flex items-center gap-12 py-6 px-16"
          >
            <span className="text-[11px] tracking-[0.5em] font-medium uppercase">Subscribe</span>
            <Youtube size={20} strokeWidth={1} />
          </a>
        </motion.div>
      </div>
    </section>
  )
}