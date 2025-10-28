import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Send, Check, Loader2, Sparkles, ArrowRight, X } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState({
    events: true,
    conversations: true,
    workshops: true,
    philosophy: false
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setError('Please enter a valid email address');
        setLoading(false);
        return;
      }

      const { data: existing } = await supabase
        .from('newsletter_subscribers')
        .select('email')
        .eq('email', email.toLowerCase())
        .single();

      if (existing) {
        setError('This email is already subscribed!');
        setLoading(false);
        return;
      }

      const { error: insertError } = await supabase
        .from('newsletter_subscribers')
        .insert([
          {
            email: email.toLowerCase(),
            name: name || null,
            preferences,
            status: 'active',
            subscribed_at: new Date().toISOString()
          }
        ]);

      if (insertError) throw insertError;

      setSuccess(true);
      setEmail('');
      setName('');
      setPreferences({
        events: true,
        conversations: true,
        workshops: true,
        philosophy: false
      });

      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      console.error('Newsletter subscription error:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const togglePreference = (key) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <section className="py-20 lg:py-32 bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 dark:from-stone-950 dark:via-stone-900 dark:to-stone-950 relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-stone-700/20 rounded-full blur-3xl"></div>

      <div className="max-w-4xl mx-auto px-8 lg:px-16 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/20 border border-amber-500/30 mb-6">
            <Sparkles className="w-4 h-4 text-amber-400" strokeWidth={1.5} />
            <span className="text-sm text-amber-400 font-light">Stay Connected</span>
          </div>

          <h2 className="text-4xl lg:text-5xl font-light mb-6 text-white" style={{ fontFamily: "'Crimson Pro', serif" }}>
            Join Our <span className="text-amber-400">Newsletter</span>
          </h2>

          <p className="text-lg text-stone-300 leading-relaxed font-light max-w-2xl mx-auto">
            Receive thoughtfully curated insights, event updates, and philosophical reflections delivered directly to your inbox.
          </p>
        </motion.div>

        {/* FORM */}
        <AnimatePresence mode="wait">
          {!success ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white/5 backdrop-blur-lg rounded-3xl p-8 lg:p-12 border border-white/10 shadow-2xl"
            >
              <div className="space-y-6">
                {/* Name Input */}
                <div>
                  <label className="block text-sm text-stone-300 mb-2">Name (Optional)</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="w-full px-6 py-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-stone-400 focus:outline-none focus:border-amber-500/50 focus:bg-white/15 transition-all duration-300"
                  />
                </div>

                {/* Email Input */}
                <div>
                  <label className="block text-sm text-stone-300 mb-2">Email Address *</label>
                  <div className="relative">
                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your.email@example.com"
                      required
                      className="w-full pl-14 pr-6 py-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-stone-400 focus:outline-none focus:border-amber-500/50 focus:bg-white/15 transition-all duration-300"
                    />
                  </div>
                </div>

                {/* Preferences */}
                <div>
                  <button
                    type="button"
                    onClick={() => setShowPreferences(!showPreferences)}
                    className="flex items-center gap-2 text-amber-400 hover:text-amber-300 transition-colors duration-300 text-sm"
                  >
                    <span>Customize your interests</span>
                    <ArrowRight className={`w-4 h-4 transition-transform duration-300 ${showPreferences ? 'rotate-90' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {showPreferences && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden mt-4"
                      >
                        <div className="grid grid-cols-2 gap-3 p-4 bg-white/5 rounded-xl border border-white/10">
                          {[
                            { key: 'events', label: 'Events & Workshops' },
                            { key: 'conversations', label: 'Conversations' },
                            { key: 'workshops', label: 'Creative Workshops' },
                            { key: 'philosophy', label: 'Philosophy & Essays' }
                          ].map((pref) => (
                            <button
                              key={pref.key}
                              type="button"
                              onClick={() => togglePreference(pref.key)}
                              className={`px-4 py-3 rounded-lg border transition-all duration-300 text-sm ${
                                preferences[pref.key]
                                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                                  : 'bg-white/5 border-white/10 text-stone-300 hover:border-white/20'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${
                                  preferences[pref.key] ? 'bg-amber-500 border-amber-500' : 'border-stone-400'
                                }`}>
                                  {preferences[pref.key] && <Check className="w-3 h-3 text-white" />}
                                </div>
                                <span>{pref.label}</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Error Message */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-center gap-2 p-4 bg-red-500/20 border border-red-500/30 rounded-xl"
                    >
                      <X className="w-5 h-5 text-red-400" />
                      <p className="text-sm text-red-400">{error}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submit */}
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading || !email}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Subscribing...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <span>Subscribe to Newsletter</span>
                    </>
                  )}
                </button>

                <p className="text-xs text-stone-400 text-center">
                  We respect your privacy. Unsubscribe anytime.
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white/5 backdrop-blur-lg rounded-3xl p-12 border border-white/10 shadow-2xl text-center"
            >
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center">
                <Check className="w-10 h-10 text-green-400" />
              </div>
              <h3 className="text-3xl font-light text-white mb-4" style={{ fontFamily: "'Crimson Pro', serif" }}>
                Welcome Aboard!
              </h3>
              <p className="text-lg text-stone-300 mb-6">
                Thank you for subscribing. You’ll receive a confirmation email shortly.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Feature Highlights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="grid md:grid-cols-3 gap-6 mt-12"
        >
          {[
            { icon: Mail, title: 'Weekly Insights', description: 'Thoughtful reflections delivered weekly.' },
            { icon: Sparkles, title: 'Exclusive Content', description: 'Access to subscriber-only discussions.' },
            { icon: Check, title: 'Early Access', description: 'Be first to know about upcoming events.' },
          ].map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 + index * 0.1, duration: 0.8 }}
              className="bg-white/5 rounded-2xl border border-white/10 p-6 text-center"
            >
              <feature.icon className="w-8 h-8 mx-auto mb-4 text-amber-400" />
              <h4 className="text-white text-lg font-light mb-2">{feature.title}</h4>
              <p className="text-stone-400 text-sm">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
