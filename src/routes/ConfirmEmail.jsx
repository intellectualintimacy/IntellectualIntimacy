// src/pages/ConfirmEmail.jsx
import { motion } from "framer-motion";
import { CheckCircle, Loader2, XCircle, Sparkles, ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";

export default function ConfirmEmail() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Check if email is already confirmed via hash params
    checkEmailConfirmation();
  }, []);

  async function checkEmailConfirmation() {
    try {
      // Supabase automatically handles the token from URL
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      if (session) {
        // Email confirmed successfully
        setConfirmed(true);
        setLoading(false);
        
        // Redirect to events page after 3 seconds
        setTimeout(() => {
          navigate("/events");
        }, 3000);
      } else {
        // Still waiting for confirmation or invalid link
        setError("Invalid or expired confirmation link");
        setLoading(false);
      }
    } catch (err) {
      setError("An error occurred during confirmation");
      setLoading(false);
    }
  }

  // Loading state
  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-stone-50 to-white dark:from-stone-950 dark:to-stone-900 px-6 py-12">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="w-20 h-20 mx-auto mb-8">
            <Loader2 className="w-20 h-20 text-amber-500 animate-spin" strokeWidth={1.5} />
          </div>
          <h2 className="text-2xl font-light text-stone-800 dark:text-stone-100 mb-4" style={{ fontFamily: 'Crimson Pro, serif' }}>
            Confirming Your <span className="elegant-text">Email</span>
          </h2>
          <p className="text-stone-600 dark:text-stone-400 font-light">
            Please wait while we verify your account...
          </p>
        </motion.div>
      </main>
    );
  }

  // Error state
  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-stone-50 to-white dark:from-stone-950 dark:to-stone-900 px-6 py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="feature-card p-10 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-6"
            >
              <XCircle className="w-10 h-10 text-red-600 dark:text-red-400" strokeWidth={1.5} />
            </motion.div>

            <div className="elegant-divider mb-6"></div>

            <h1 className="text-3xl font-light text-stone-900 dark:text-stone-50 mb-4" style={{ fontFamily: 'Crimson Pro, serif' }}>
              Confirmation <span className="elegant-text">Failed</span>
            </h1>

            <p className="text-stone-600 dark:text-stone-400 mb-8 leading-relaxed font-light">
              {error}
            </p>

            <div className="bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700 rounded-lg p-6 mb-8">
              <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed font-light">
                Your confirmation link may have expired or already been used. 
                Please try signing up again or contact support if the issue persists.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <Link
                to="/signup"
                className="w-full py-4 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 transition-colors duration-300 text-center font-light hover:bg-stone-800 dark:hover:bg-stone-200"
              >
                Try Signing Up Again
              </Link>
              <Link
                to="/login"
                className="w-full py-4 border border-stone-300 dark:border-stone-600 hover:border-stone-900 dark:hover:border-stone-300 transition-colors duration-300 text-center font-light text-stone-900 dark:text-stone-100"
              >
                Back to Sign In
              </Link>
            </div>
          </div>
        </motion.div>
      </main>
    );
  }

  // Success state
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-stone-50 to-white dark:from-stone-950 dark:to-stone-900 px-6 py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="feature-card p-10 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" strokeWidth={1.5} />
          </motion.div>

          <div className="elegant-divider mb-6"></div>

          <h1 className="text-3xl font-light text-stone-900 dark:text-stone-50 mb-4" style={{ fontFamily: 'Crimson Pro, serif' }}>
            Email <span className="elegant-text">Confirmed</span>!
          </h1>

          <p className="text-stone-600 dark:text-stone-400 mb-8 leading-relaxed font-light">
            Your account has been successfully verified. Welcome to Intellectual Intimacy!
          </p>

          <div className="bg-gradient-to-br from-amber-50 to-stone-50 dark:from-amber-950/20 dark:to-stone-900/50 border border-amber-200 dark:border-amber-800/30 rounded-lg p-6 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="w-6 h-6 text-amber-600 dark:text-amber-400" strokeWidth={1.5} />
              <h3 className="text-lg font-light text-stone-900 dark:text-stone-100" style={{ fontFamily: 'Crimson Pro, serif' }}>
                What's Next?
              </h3>
            </div>
            <div className="space-y-2 text-left">
              <div className="flex items-center gap-2 text-sm text-stone-700 dark:text-stone-300 font-light">
                <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" strokeWidth={1.5} />
                <span>Explore upcoming events and workshops</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-stone-700 dark:text-stone-300 font-light">
                <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" strokeWidth={1.5} />
                <span>Reserve your spot at meaningful gatherings</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-stone-700 dark:text-stone-300 font-light">
                <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" strokeWidth={1.5} />
                <span>Connect with like-minded individuals</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 text-sm text-stone-500 dark:text-stone-400 mb-6 font-light">
            <Loader2 className="w-4 h-4 animate-spin" strokeWidth={1.5} />
            Redirecting you to events...
          </div>

          <Link
            to="/events"
            className="inline-flex items-center gap-2 px-8 py-4 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 transition-colors duration-300 font-light hover:bg-stone-800 dark:hover:bg-stone-200"
          >
            <span>Browse Events Now</span>
            <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
          </Link>
        </div>
      </motion.div>
    </main>
  );
}