import Hero from '../components/home/Hero'
import FeaturedConversations from '../components/home/FeaturedConversations'
import Philosophy from '../components/home/Philosophy'
import Values from '../components/home/Values'
import Testimonials from '../components/home/Testimonials'
import CTASection from '../components/home/CTASection'
import UpcomingEvents from '../components/home/UpcomingEvents'
import NewsletterForm from '../components/home/Newsletter'

export default function Home() {
  return (
    <main>
      <Hero />
      <FeaturedConversations />
      <UpcomingEvents />
      <Philosophy />
      <Values />
      <Testimonials />
      <CTASection />
      <NewsletterForm />
    </main>
  )
}