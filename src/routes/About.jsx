import { motion } from 'framer-motion'
import { Target, Users, Lightbulb, Heart } from 'lucide-react'

export default function About() {
  return (
    <main className="pt-32">
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
              About <span className="elegant-text">Us</span>
            </h1>
            <p className="text-xl text-stone-600 dark:text-stone-300 leading-relaxed font-light">
              We are building a global movement dedicated to fostering meaningful dialogue, 
              emotional intelligence, and intellectual growth.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="py-20 lg:py-32 bg-white dark:bg-stone-900">
        <div className="max-w-6xl mx-auto px-8 lg:px-16">
          <div className="grid md:grid-cols-2 gap-16">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="feature-card"
            >
              <div className="icon-elegant mb-6">
                <Target className="w-7 h-7" strokeWidth={1.5} />
              </div>
              <h2 className="text-3xl mb-6 font-light" style={{ fontFamily: 'Crimson Pro, serif' }}>
                Our <span className="elegant-text">Vision</span>
              </h2>
              <p className="text-stone-600 dark:text-stone-300 leading-relaxed font-light">
                To become the world's most diverse community for deep conversation, 
                emotional-intellectual growth, and practical life mastery — connecting 
                people across cultures, generations, and sectors through the power of 
                authentic dialogue.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="feature-card"
            >
              <div className="icon-elegant mb-6">
                <Lightbulb className="w-7 h-7" strokeWidth={1.5} />
              </div>
              <h2 className="text-3xl mb-6 font-light" style={{ fontFamily: 'Crimson Pro, serif' }}>
                Our <span className="elegant-text">Mission</span>
              </h2>
              <p className="text-stone-600 dark:text-stone-300 leading-relaxed font-light">
                To democratize transformative conversation and lifelong emotional-intellectual 
                skill-building by creating accessible experiences, trusted curricula, and a 
                global network of practice.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 lg:py-32 bg-stone-50 dark:bg-stone-950">
        <div className="max-w-4xl mx-auto px-8 lg:px-16">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="elegant-divider mb-8"></div>
            <h2 className="text-4xl lg:text-5xl mb-8 font-light text-center" style={{ fontFamily: 'Crimson Pro, serif' }}>
              Our <span className="elegant-text">Story</span>
            </h2>
            <div className="space-y-6 text-stone-600 dark:text-stone-300 leading-relaxed font-light">
              <p>
                Intellectual Intimacy was born from a simple observation: in a world of constant 
                connectivity, genuine human connection has become increasingly rare. We noticed 
                that people were hungry for deeper conversations, for spaces where they could 
                explore ideas without judgment, and for communities that valued both intellectual 
                rigor and emotional authenticity.
              </p>
              <p>
                What started as informal gatherings among friends has evolved into a growing 
                movement. We've created a sanctuary where curious minds can explore life's 
                profound questions, challenge their assumptions, and grow alongside others who 
                share their commitment to depth and authenticity.
              </p>
              <p>
                Today, we're building something revolutionary: a global community that proves 
                intellectual discourse and emotional intimacy aren't opposites—they're 
                complementary forces that, together, create profound transformation.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 lg:py-32 bg-white dark:bg-stone-900">
        <div className="max-w-6xl mx-auto px-8 lg:px-16">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="elegant-divider mb-8"></div>
            <h2 className="text-4xl lg:text-5xl mb-6 font-light" style={{ fontFamily: 'Crimson Pro, serif' }}>
              Our Core <span className="elegant-text">Values</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: <Heart />, title: 'Depth', description: 'We go beneath the surface, embracing complexity and nuance.' },
              { icon: <Users />, title: 'Inclusivity', description: 'All perspectives are welcome in our conversations.' },
              { icon: <Lightbulb />, title: 'Curiosity', description: 'We approach every topic with openness and wonder.' },
              { icon: <Target />, title: 'Practicality', description: 'Ideas must lead to action and real-world impact.' },
              { icon: <Heart />, title: 'Care', description: 'We hold space for both intellect and emotion.' },
              { icon: <Users />, title: 'Community', description: 'Growth happens best in supportive, authentic relationships.' }
            ].map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center p-6"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 mb-4">
                  {value.icon}
                </div>
                <h3 className="text-xl mb-3 font-light text-stone-800 dark:text-stone-100" style={{ fontFamily: 'Crimson Pro, serif' }}>
                  {value.title}
                </h3>
                <p className="text-stone-600 dark:text-stone-300 font-light text-sm">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}