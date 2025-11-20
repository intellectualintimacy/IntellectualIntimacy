import { useState, useEffect } from 'react'
import Hero from '../components/home/Hero'
import FeaturedConversations from '../components/home/FeaturedConversations'
import Philosophy from '../components/home/Philosophy'
import Values from '../components/home/Values'
import Testimonials from '../components/home/Testimonials'
import CTASection from '../components/home/CTASection'
import UpcomingEvents from '../components/home/UpcomingEvents'
import NewsletterForm from '../components/home/Newsletter'
import YouTubeModal from '../components/home/YouTubeModal'
import SEO from '../components/common/SEO'

export default function Home() {
  const [showModal, setShowModal] = useState(false)

  // Latest video details
  const latestVideo = {
    id: 'PWZ6tKz3bRg',
    url: 'https://youtu.be/PWZ6tKz3bRg',
    channelUrl: 'https://www.youtube.com/@Intellectual-Intimacy?sub_confirmation=1'
  }

  useEffect(() => {
    // Check if modal should be shown
    const checkModalStatus = () => {
      const watched = localStorage.getItem('youtube_modal_watched')
      const dismissed = localStorage.getItem('youtube_modal_dismissed')
      const lastShownDate = localStorage.getItem('youtube_modal_date')

      // If never shown before, show it after 3 seconds
      if (!watched && !dismissed) {
        setTimeout(() => setShowModal(true), 3000)
        return
      }

      // If dismissed or watched, check if 24 hours have passed
      if (lastShownDate) {
        const lastShown = new Date(lastShownDate)
        const now = new Date()
        const hoursSinceLastShown = (now - lastShown) / (1000 * 60 * 60)

        // Show again after 24 hours
        if (hoursSinceLastShown >= 24) {
          // Clear previous status
          localStorage.removeItem('youtube_modal_watched')
          localStorage.removeItem('youtube_modal_dismissed')
          localStorage.removeItem('youtube_modal_date')
          
          setTimeout(() => setShowModal(true), 3000)
        }
      }
    }

    checkModalStatus()
  }, [])

  const handleCloseModal = () => {
    setShowModal(false)
  }

  return (
    <main>
      <SEO 
        title="Intellectual Intimacy - Deep Conversations, Meaningful Connections"
        description="Join us for profound dialogues that foster genuine human connections through thoughtful conversation, philosophy, and shared inquiry. Build meaningful relationships through intellectual discourse."
        keywords="intellectual intimacy, deep conversations, meaningful connections, philosophy discussions, human connection, dialogue community, thoughtful discussions, salon conversations, intellectual community"
        url="https://intellectualintimacy.co.za"
        image="https://intellectualintimacy.co.za/images/home-og.jpg"
      />
      {/* YouTube Modal */}
      <YouTubeModal
        isOpen={showModal}
        onClose={handleCloseModal}
        videoId={latestVideo.id}
        videoUrl={latestVideo.url}
        channelUrl={latestVideo.channelUrl}
      />

      {/* Page Content */}
      <Hero />
      <FeaturedConversations />
      <UpcomingEvents />
      <Philosophy />
      <Values />
      <Testimonials />
      <NewsletterForm />
      <CTASection />
    </main>
  )
}