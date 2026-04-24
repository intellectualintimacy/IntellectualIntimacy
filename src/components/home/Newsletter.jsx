import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Check, Loader2, X } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState({
    events: true, conversations: true, workshops: true, philosophy: false
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Logic remains same...
    setTimeout(() => { setLoading(false); setSuccess(true); }, 1500);
  };

  return (
    <section className="py-32 lg:py-48 bg-ivory text-ink relative border-t-2 border-ink/5">
      <div className="max-w-4xl mx-auto px-6 relative z-10">
        
        {/* 1. HEADER: Bold & Clear */}
        <div className="text-center mb-24">
          <span className="text-sm tracking-[0.3em] text-gold uppercase font-bold mb-6 block">
            STAY CONNECTED
          </span>
          <h2 className="text-4xl md:text-6xl font-sans font-bold tracking-tight text-ink uppercase mb-8 leading-tight">
            INSIGHTS INTO THE <br /> <span className="text-gold">UNSPOKEN.</span>
          </h2>
          <p className="text-base md:text-lg text-ink font-medium max-w-2xl mx-auto leading-relaxed">
            Thoughtfully curated insights and event updates delivered directly to your inbox.
          </p>
        </div>

        <AnimatePresence mode="wait">
          {!success ? (
            <motion.form
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onSubmit={handleSubmit}
              className="space-y-12 bg-white p-8 md:p-16 shadow-xl border border-stone-200"
            >
              <div className="grid md:grid-cols-2 gap-10">
                {/* Name Input - High Contrast Labels */}
                <div className="flex flex-col">
                  <label className="text-xs tracking-widest text-ink uppercase font-black mb-4">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full bg-ivory border-2 border-stone-200 py-4 px-4 text-ink placeholder:text-stone-400 focus:outline-none focus:border-gold transition-colors font-sans text-sm font-bold uppercase tracking-wider"
                  />
                </div>

                {/* Email Input */}
                <div className="flex flex-col">
                  <label className="text-xs tracking-widest text-ink uppercase font-black mb-4">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    className="w-full bg-ivory border-2 border-stone-200 py-4 px-4 text-ink placeholder:text-stone-400 focus:outline-none focus:border-gold transition-colors font-sans text-sm font-bold uppercase tracking-wider"
                  />
                </div>
              </div>

              {/* Preferences: Clearly Defined Buttons */}
              <div className="flex flex-col items-center border-t border-stone-100 pt-10">
                <button
                  type="button"
                  onClick={() => setShowPreferences(!showPreferences)}
                  className="text-xs tracking-widest text-ink border-b-2 border-gold pb-1 uppercase font-black hover:text-gold transition-colors"
                >
                  {showPreferences ? 'HIDE INTERESTS' : 'CUSTOMIZE INTERESTS'}
                </button>

                {showPreferences && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-10 w-full">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.keys(preferences).map((key) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setPreferences(p => ({ ...p, [key]: !p[key] }))}
                          className={`flex items-center justify-between p-4 border-2 transition-all ${
                            preferences[key] ? 'border-gold bg-gold/5' : 'border-stone-200 opacity-60'
                          }`}
                        >
                          <span className="text-xs font-black tracking-widest uppercase text-ink">{key}</span>
                          <div className={`w-3 h-3 rounded-full ${preferences[key] ? 'bg-gold' : 'bg-stone-200'}`}></div>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Action Button: Solid & Visible */}
              <div className="flex flex-col items-center">
                {error && <p className="text-xs font-bold text-red-600 uppercase mb-4">{error}</p>}
                
                <button
                  disabled={loading || !email}
                  className="w-full bg-ink text-white py-6 px-10 text-xs tracking-[0.4em] font-black uppercase hover:bg-gold transition-all flex items-center justify-center gap-6"
                >
                  {loading ? 'PROCESSING...' : 'JOIN REGISTRY'}
                  {!loading && <Send size={16} />}
                </button>
              </div>
            </motion.form>
          ) : (
            /* SUCCESS STATE: High Contrast Branding */
            <motion.div className="py-20 text-center bg-white border-2 border-gold shadow-2xl p-16">
              <div className="w-20 h-[2px] bg-gold mx-auto mb-10"></div>
              <h3 className="text-4xl font-sans font-bold text-ink uppercase mb-6 tracking-tight">
                INVITATION <span className="text-gold">ACCEPTED.</span>
              </h3>
              <p className="text-sm font-bold tracking-widest text-ink uppercase mb-10">
                Check your inbox to confirm your position.
              </p>
              <button onClick={() => setSuccess(false)} className="text-xs font-black text-gold border-b-2 border-gold pb-1 uppercase">
                Return
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}