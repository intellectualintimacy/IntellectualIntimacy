import { motion } from 'framer-motion'
import { Mail, MessageCircle, Send, Youtube, Instagram, Linkedin } from 'lucide-react'
import { useState } from 'react'
import SEO from '../components/common/SEO'

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    // Handle form submission logic here
    console.log('Form submitted:', formData)
    alert('Thank you for reaching out! We\'ll get back to you soon.')
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <main className="pt-32">
      <SEO 
        title="Intellectual Intimacy - Deep Conversations, Meaningful Connections"
        description="Join us for profound dialogues that foster genuine human connections through thoughtful conversation, philosophy, and shared inquiry. Build meaningful relationships through intellectual discourse."
        keywords="intellectual intimacy, deep conversations, meaningful connections, philosophy discussions, human connection, dialogue community, thoughtful discussions, salon conversations, intellectual community"
        url="https://intellectualintimacy.co.za"
        image="https://intellectualintimacy.co.za/images/contact-og.jpg"
      />
      {/* Hero Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-b from-stone-50 to-white dark:from-stone-950 dark:to-stone-900">
        <div className="max-w-4xl mx-auto px-8 lg:px-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="elegant-divider mb-8"></div>
            <h1 className="text-6xl lg:text-7xl mb-8 font-light" style={{ fontFamily: 'Crimson Pro, serif' }}>
              Get in <span className="elegant-text">Touch</span>
            </h1>
            <p className="text-xl text-stone-600 dark:text-stone-300 leading-relaxed font-light">
              We'd love to hear from you. Whether you have questions, ideas, or just want 
              to connect, reach out and let's start a conversation.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-20 lg:py-32 bg-white dark:bg-stone-900">
        <div className="max-w-6xl mx-auto px-8 lg:px-16">
          <div className="grid lg:grid-cols-2 gap-16">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl mb-8 font-light" style={{ fontFamily: 'Crimson Pro, serif' }}>
                Send us a <span className="elegant-text">Message</span>
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-light text-stone-600 dark:text-stone-300 mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-100 focus:outline-none focus:border-stone-400 dark:focus:border-stone-500 transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-light text-stone-600 dark:text-stone-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-100 focus:outline-none focus:border-stone-400 dark:focus:border-stone-500 transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-light text-stone-600 dark:text-stone-300 mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-100 focus:outline-none focus:border-stone-400 dark:focus:border-stone-500 transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-light text-stone-600 dark:text-stone-300 mb-2">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows="6"
                    className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-100 focus:outline-none focus:border-stone-400 dark:focus:border-stone-500 transition-colors resize-none"
                  ></textarea>
                </div>

                <button type="submit" className="btn-elegant inline-flex items-center justify-center w-full">
                  Send Message
                  <Send className="ml-3 w-4 h-4" />
                </button>
              </form>
            </motion.div>

            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <div>
                <h2 className="text-3xl mb-8 font-light" style={{ fontFamily: 'Crimson Pro, serif' }}>
                  Other Ways to <span className="elegant-text">Connect</span>
                </h2>
                <p className="text-stone-600 dark:text-stone-300 font-light leading-relaxed mb-8">
                  Join our community across various platforms. We're committed to fostering 
                  meaningful connections and would love to hear from you.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-start gap-4 p-6 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
                  <Mail className="w-6 h-6 text-stone-600 dark:text-stone-300 flex-shrink-0 mt-1" strokeWidth={1.5} />
                  <div>
                    <h3 className="font-medium text-stone-800 dark:text-stone-100 mb-2">Email Us</h3>
                    <a href="mailto:hello@intellectualintimacy.com" className="text-stone-600 dark:text-stone-300 hover:text-stone-800 dark:hover:text-stone-100 font-light">
                      hello@intellectualintimacy.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-6 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
                  <MessageCircle className="w-6 h-6 text-stone-600 dark:text-stone-300 flex-shrink-0 mt-1" strokeWidth={1.5} />
                  <div>
                    <h3 className="font-medium text-stone-800 dark:text-stone-100 mb-2">Join the Conversation</h3>
                    <p className="text-stone-600 dark:text-stone-300 font-light">
                      Subscribe to our newsletter for updates on events, new content, and community news.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-6 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
                  <Youtube className="w-6 h-6 text-stone-600 dark:text-stone-300 flex-shrink-0 mt-1" strokeWidth={1.5} />
                  <div>
                    <h3 className="font-medium text-stone-800 dark:text-stone-100 mb-2">Watch Our Content</h3>
                    <a href="https://www.youtube.com/@Intellectual-Intimacy" target="_blank" rel="noopener noreferrer" className="text-stone-600 dark:text-stone-300 hover:text-stone-800 dark:hover:text-stone-100 font-light">
                      YouTube Channel
                    </a>
                  </div>
                </div>
              </div>

              <div className="pt-8">
                <h3 className="text-xl mb-6 font-light text-stone-800 dark:text-stone-100" style={{ fontFamily: 'Crimson Pro, serif' }}>
                  Follow Us
                </h3>
                <div className="flex gap-4">
                  <a href="https://www.youtube.com/@Intellectual-Intimacy" target="_blank" rel="noopener noreferrer" className="social-icon">
                    <Youtube className="w-5 h-5" />
                  </a>
                  <a href="#" className="social-icon">
                    <Instagram className="w-5 h-5" />
                  </a>
                  <a href="#" className="social-icon">
                    <Linkedin className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 lg:py-32 bg-stone-50 dark:bg-stone-950">
        <div className="max-w-4xl mx-auto px-8 lg:px-16">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="elegant-divider mb-8"></div>
            <h2 className="text-4xl lg:text-5xl mb-6 font-light" style={{ fontFamily: 'Crimson Pro, serif' }}>
              Frequently Asked <span className="elegant-text">Questions</span>
            </h2>
          </motion.div>

          <div className="space-y-6">
            {[
              {
                question: 'How can I join the community?',
                answer: 'Simply subscribe to our newsletter and register for our upcoming events. We welcome everyone who is curious and committed to meaningful dialogue.'
              },
              {
                question: 'Are events free or paid?',
                answer: 'We offer both free and paid events. Our monthly salon conversations are typically free, while specialized workshops may have a nominal fee to cover costs.'
              },
              {
                question: 'Can I host an event in my city?',
                answer: 'Absolutely! We encourage local chapter creation. Reach out to us to learn about our chapter program and how you can bring Intellectual Intimacy to your community.'
              },
              {
                question: 'How do I become a facilitator?',
                answer: 'We offer facilitator training programs for community members interested in leading conversations. Contact us to learn about upcoming training opportunities.'
              }
            ].map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="feature-card"
              >
                <h3 className="text-xl mb-3 font-light text-stone-800 dark:text-stone-100" style={{ fontFamily: 'Crimson Pro, serif' }}>
                  {faq.question}
                </h3>
                <p className="text-stone-600 dark:text-stone-300 font-light">
                  {faq.answer}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}