import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, X, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function NewsletterUnsubscribe() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid unsubscribe link');
      return;
    }

    unsubscribe();
  }, [token]);

  const unsubscribe = async () => {
    try {
      const { data: subscriber, error: findError } = await supabase
        .from('newsletter_subscribers')
        .select('*')
        .eq('unsubscribe_token', token)
        .single();

      if (findError || !subscriber) {
        setStatus('error');
        setMessage('Invalid unsubscribe link');
        return;
      }

      if (subscriber.status === 'unsubscribed') {
        setStatus('success');
        setMessage('You are already unsubscribed');
        return;
      }

      const { error: updateError } = await supabase
        .from('newsletter_subscribers')
        .update({ status: 'unsubscribed' })
        .eq('id', subscriber.id);

      if (updateError) throw updateError;

      setStatus('success');
      setMessage('You have been successfully unsubscribed');

    } catch (error) {
      console.error('Unsubscribe error:', error);
      setStatus('error');
      setMessage('Something went wrong');
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
            <Loader2 className="w-16 h-16 mx-auto mb-6 text-stone-400 animate-spin" />
            <h1 className="text-2xl font-light text-stone-900 dark:text-stone-100 mb-2">
              Processing...
            </h1>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center">
              <Check className="w-10 h-10 text-stone-600 dark:text-stone-400" />
            </div>
            <h1 className="text-3xl font-light text-stone-900 dark:text-stone-100 mb-4" style={{ fontFamily: "'Crimson Pro', serif" }}>
              Unsubscribed
            </h1>
            <p className="text-lg text-stone-600 dark:text-stone-400 mb-4">
              {message}
            </p>
            <p className="text-sm text-stone-500 dark:text-stone-400 mb-8">
              We're sorry to see you go. You can resubscribe anytime.
            </p>
            <button
              onClick={() => navigate('/')}
              className="px-8 py-3 rounded-full bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900 hover:opacity-90 transition-all duration-300"
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
            <h1 className="text-3xl font-light text-stone-900 dark:text-stone-100 mb-4">
              Error
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