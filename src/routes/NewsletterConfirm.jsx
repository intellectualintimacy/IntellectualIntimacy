import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, X, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function NewsletterConfirm() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [message, setMessage] = useState('');
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid confirmation link');
      return;
    }

    confirmSubscription();
  }, [token]);

  const confirmSubscription = async () => {
    try {
      // Find subscriber by confirmation token
      const { data: subscriber, error: findError } = await supabase
        .from('newsletter_subscribers')
        .select('*')
        .eq('confirmation_token', token)
        .single();

      if (findError || !subscriber) {
        setStatus('error');
        setMessage('Invalid or expired confirmation link');
        return;
      }

      // Check if already confirmed
      if (subscriber.status === 'active' && subscriber.confirmed_at) {
        setStatus('success');
        setMessage('Your subscription is already confirmed!');
        return;
      }

      // Update to active and set confirmed_at
      const { error: updateError } = await supabase
        .from('newsletter_subscribers')
        .update({
          status: 'active',
          confirmed_at: new Date().toISOString()
        })
        .eq('id', subscriber.id);

      if (updateError) throw updateError;

      setStatus('success');
      setMessage('Your subscription has been confirmed successfully!');

    } catch (error) {
      console.error('Confirmation error:', error);
      setStatus('error');
      setMessage('Something went wrong. Please try again.');
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-stone-50 to-stone-100 dark:from-stone-950 dark:to-stone-900 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white dark:bg-stone-900 rounded-3xl p-12 shadow-2xl text-center border border-stone-200 dark:border-stone-800"
      >
        {status === 'loading' && (
          <>
            <Loader2 className="w-16 h-16 mx-auto mb-6 text-amber-500 animate-spin" />
            <h1 className="text-2xl font-light text-stone-900 dark:text-stone-100 mb-2">
              Confirming...
            </h1>
            <p className="text-stone-600 dark:text-stone-400">
              Please wait while we confirm your subscription
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <Check className="w-10 h-10 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-3xl font-light text-stone-900 dark:text-stone-100 mb-4" style={{ fontFamily: "'Crimson Pro', serif" }}>
              Confirmed!
            </h1>
            <p className="text-lg text-stone-600 dark:text-stone-400 mb-8">
              {message}
            </p>
            <button
              onClick={() => navigate('/')}
              className="px-8 py-3 rounded-full bg-amber-500 hover:bg-amber-600 text-white transition-all duration-300"
            >
              Go to Homepage
            </button>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <X className="w-10 h-10 text-red-600 dark:text-red-400" />
            </div>
            <h1 className="text-3xl font-light text-stone-900 dark:text-stone-100 mb-4" style={{ fontFamily: "'Crimson Pro', serif" }}>
              Oops!
            </h1>
            <p className="text-lg text-stone-600 dark:text-stone-400 mb-8">
              {message}
            </p>
            <button
              onClick={() => navigate('/')}
              className="px-8 py-3 rounded-full bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900 hover:opacity-90 transition-all duration-300"
            >
              Go to Homepage
            </button>
          </>
        )}
      </motion.div>
    </main>
  );
}