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

  // Generate random tokens (backup - your DB trigger will handle this)
  const generateToken = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setError('Please enter a valid email address');
        setLoading(false);
        return;
      }

      const trimmedEmail = email.toLowerCase().trim();

      // Check if email already exists
      const { data: existing, error: checkError } = await supabase
        .from('newsletter_subscribers')
        .select('email, status')
        .eq('email', trimmedEmail)
        .limit(1);

      // Handle check error
      if (checkError) {
        console.error('Check error:', checkError);
        throw new Error('Failed to check existing subscription');
      }

      // If email exists
      if (existing && existing.length > 0) {
        const subscriber = existing[0];
        if (subscriber.status === 'active') {
          setError('This email is already subscribed! Check your inbox for our newsletters.');
        } else if (subscriber.status === 'unsubscribed') {
          setError('This email was previously unsubscribed. Please contact support@intellectualintimacy.com to reactivate.');
        } else {
          setError('This email is already in our system. Check your inbox for a confirmation email.');
        }
        setLoading(false);
        return;
      }

      // Generate tokens manually (since trigger might be failing)
      const confirmationToken = generateToken() + generateToken(); // Make it longer
      const unsubscribeToken = generateToken() + generateToken();

      // Insert new subscriber with all fields explicitly set
      const { data: insertData, error: insertError } = await supabase
        .from('newsletter_subscribers')
        .insert([
          {
            email: trimmedEmail,
            name: name.trim() || null,
            preferences: preferences,
            status: 'pending',
            subscribed_at: new Date().toISOString(),
            confirmation_token: confirmationToken,
            unsubscribe_token: unsubscribeToken,
            confirmed_at: null
          }
        ])
        .select();

      if (insertError) {
        console.error('Insert error:', insertError);
        console.error('Insert error details:', {
          code: insertError.code,
          message: insertError.message,
          details: insertError.details,
          hint: insertError.hint
        });
        
        // Check for specific errors
        if (insertError.code === '23505') {
          setError('This email is already subscribed!');
        } else if (insertError.code === '3F000') {
          setError('Database configuration error. Please contact support.');
        } else {
          throw new Error(insertError.message || 'Failed to create subscription. Please try again.');
        }
        setLoading(false);
        return;
      }

      console.log('Subscription successful:', insertData);

      // Call edge function to send confirmation email
      try {
        console.log('Calling edge function to send confirmation email...');
        
        const { data: emailData, error: emailError } = await supabase.functions.invoke(
          'send_newsletter_confirmation',
          {
            body: { email: trimmedEmail }
          }
        );

        console.log('Edge function response:', { emailData, emailError });

        if (emailError) {
          console.error('Email send error:', emailError);
          // Don't fail the whole process if email fails - show warning
          console.warn('Confirmation email may not have been sent, but subscription was created');
          // You could set a flag here to show user that email might be delayed
        } else {
          console.log('Confirmation email sent successfully:', emailData);
        }
      } catch (emailErr) {
        console.error('Email function invoke error:', emailErr);
        // Continue anyway - subscription was created
        console.warn('Failed to invoke email function, but subscription exists');
      }

      // Success!
      setSuccess(true);
      setEmail('');
      setName('');
      
      // Keep preferences for display but reset after delay
      setTimeout(() => {
        setPreferences({
          events: true,
          conversations: true,
          workshops: true,
          philosophy: false
        });
      }, 5000);

      // Reset success message after 10 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 10000);

    } catch (err) {
      console.error('Newsletter subscription error:', err);
      setError(err.message || 'Something went wrong. Please try again later.');
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
          <motion.div
            initial={{ scale: 0.9 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/20 border border-amber-500/30 mb-6"
          >
            <Sparkles className="w-4 h-4 text-amber-400" strokeWidth={1.5} />
            <span className="text-sm text-amber-400 font-light">Stay Connected</span>
          </motion.div>

          <h2 className="text-4xl lg:text-5xl font-light mb-6 text-white" style={{ fontFamily: "'Crimson Pro', serif" }}>
            Join Our <span className="text-amber-400">Newsletter</span>
          </h2>

          <p className="text-lg text-stone-300 leading-relaxed font-light max-w-2xl mx-auto">
            Receive thoughtfully curated insights, event updates, and philosophical reflections delivered directly to your inbox. No spam, just substance.
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
              transition={{ duration: 0.4 }}
              className="bg-white/5 backdrop-blur-lg rounded-3xl p-8 lg:p-12 border border-white/10 shadow-2xl"
            >
              <div className="space-y-6">
                {/* Name Input */}
                <div>
                  <label className="block text-sm font-light text-stone-300 mb-2">
                    Name <span className="text-stone-500">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="w-full px-6 py-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-stone-400 focus:outline-none focus:border-amber-500/50 focus:bg-white/15 transition-all duration-300 font-light"
                  />
                </div>

                {/* Email Input */}
                <div>
                  <label className="block text-sm font-light text-stone-300 mb-2">
                    Email Address <span className="text-amber-400">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" strokeWidth={1.5} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your.email@example.com"
                      required
                      className="w-full pl-14 pr-6 py-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-stone-400 focus:outline-none focus:border-amber-500/50 focus:bg-white/15 transition-all duration-300 font-light"
                    />
                  </div>
                </div>

                {/* Preferences */}
                <div>
                  <button
                    type="button"
                    onClick={() => setShowPreferences(!showPreferences)}
                    className="flex items-center gap-2 text-amber-400 hover:text-amber-300 transition-colors duration-300 font-light text-sm"
                  >
                    <span>Customize your interests</span>
                    <ArrowRight 
                      className={`w-4 h-4 transition-transform duration-300 ${showPreferences ? 'rotate-90' : ''}`} 
                      strokeWidth={1.5} 
                    />
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
                              className={`px-4 py-3 rounded-lg border transition-all duration-300 font-light text-sm text-left ${
                                preferences[pref.key]
                                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                                  : 'bg-white/5 border-white/10 text-stone-300 hover:border-white/20'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all duration-300 ${
                                  preferences[pref.key] ? 'bg-amber-500 border-amber-500' : 'border-stone-400'
                                }`}>
                                  {preferences[pref.key] && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
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
                      transition={{ duration: 0.3 }}
                      className="flex items-center gap-3 p-4 bg-red-500/20 border border-red-500/30 rounded-xl"
                    >
                      <X className="w-5 h-5 text-red-400 flex-shrink-0" strokeWidth={1.5} />
                      <p className="text-sm text-red-400 font-light">{error}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submit */}
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading || !email}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-light transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-amber-500/20"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" strokeWidth={1.5} />
                      <span>Subscribing...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" strokeWidth={1.5} />
                      <span>Subscribe to Newsletter</span>
                    </>
                  )}
                </button>

                <p className="text-xs text-stone-400 text-center font-light">
                  We respect your privacy. Unsubscribe anytime. 
                  <span className="text-amber-400"> No spam, ever.</span>
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.4 }}
              className="bg-white/5 backdrop-blur-lg rounded-3xl p-12 border border-white/10 shadow-2xl text-center"
            >
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center"
              >
                <Check className="w-10 h-10 text-green-400" strokeWidth={1.5} />
              </motion.div>
              
              <motion.h3 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-3xl font-light text-white mb-4" 
                style={{ fontFamily: "'Crimson Pro', serif" }}
              >
                Welcome Aboard!
              </motion.h3>
              
              <motion.p 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-lg text-stone-300 font-light mb-6"
              >
                Thank you for subscribing! Please check your email to confirm your subscription.
              </motion.p>

              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="bg-amber-500/20 border border-amber-500/30 rounded-xl p-4 mb-6"
              >
                <p className="text-sm text-amber-200 font-light">
                  📧 We've sent a confirmation email to <strong className="font-normal">{email || 'your inbox'}</strong>. 
                  Please click the link in the email to activate your subscription.
                </p>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="flex flex-wrap justify-center gap-2 text-sm font-light"
              >
                <span className="text-stone-400">Your interests:</span>
                {Object.entries(preferences)
                  .filter(([_, value]) => value)
                  .map(([key], index, arr) => (
                    <span key={key} className="text-amber-400">
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                      {index < arr.length - 1 ? ',' : ''}
                    </span>
                  ))}
              </motion.div>
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
            { 
              icon: Mail, 
              title: 'Weekly Insights', 
              description: 'Thoughtful reflections delivered every week' 
            },
            { 
              icon: Sparkles, 
              title: 'Exclusive Content', 
              description: 'Access to subscriber-only conversations' 
            },
            { 
              icon: Check, 
              title: 'Early Access', 
              description: 'First to know about upcoming events' 
            },
          ].map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 + index * 0.1, duration: 0.6 }}
              className="text-center p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:bg-white/10 hover:border-amber-500/30 transition-all duration-300 group"
            >
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-amber-500/20 flex items-center justify-center group-hover:bg-amber-500/30 transition-all duration-300">
                <feature.icon className="w-6 h-6 text-amber-400" strokeWidth={1.5} />
              </div>
              <h4 className="text-lg font-light text-white mb-2" style={{ fontFamily: "'Crimson Pro', serif" }}>
                {feature.title}
              </h4>
              <p className="text-sm text-stone-400 font-light">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}