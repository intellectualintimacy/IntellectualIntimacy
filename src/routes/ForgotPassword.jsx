// src/pages/ForgotPassword.jsx
import { motion } from "framer-motion";
import { Loader2, Mail, ArrowLeft, CheckCircle, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { supabase } from "../../lib/supabase";

export default function ForgotPassword() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleResetRequest(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      setSuccess(true);
      setLoading(false);
    } catch (err) {
      setError(err.message || "An error occurred");
      setLoading(false);
    }
  }

  if (success) {
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
              Check Your <span className="elegant-text">Email</span>
            </h1>

            <p className="text-stone-600 dark:text-stone-400 mb-8 leading-relaxed font-light">
              We've sent a password reset link to<br />
              <strong className="text-stone-900 dark:text-stone-100 font-normal">{email}</strong>
            </p>

            <div className="bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700 rounded-lg p-6 mb-8">
              <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed font-light">
                Click the link in the email to reset your password. If you don't see it, check your spam folder.
              </p>
            </div>

            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors font-light"
            >
              <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
              Back to Sign In
            </Link>
          </div>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-stone-50 to-white dark:from-stone-950 dark:to-stone-900 px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="flex items-center gap-3 mb-10 justify-center">
          <div className="icon-elegant">
            <Sparkles className="w-5 h-5" strokeWidth={1.5} />
          </div>
          <span className="text-lg font-light text-stone-800 dark:text-stone-100" style={{ fontFamily: 'Crimson Pro, serif' }}>
            Intellectual Intimacy
          </span>
        </div>

        <div className="feature-card p-10">
          <div className="text-center mb-10">
            <div className="elegant-divider mb-6"></div>
            <h1 className="text-4xl font-light text-stone-900 dark:text-stone-50 mb-3" style={{ fontFamily: 'Crimson Pro, serif' }}>
              Reset Your <span className="elegant-text">Password</span>
            </h1>
            <p className="text-stone-600 dark:text-stone-400 text-sm font-light">
              Enter your email address and we'll send you a link to reset your password
            </p>
          </div>

          <form onSubmit={handleResetRequest} className="space-y-6">
            <div>
              <label className="block text-sm mb-3 text-stone-700 dark:text-stone-300 font-light">
                Email Address
              </label>
              <div className="relative group">
                <Mail className="w-5 h-5 text-stone-400 dark:text-stone-500 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-amber-700 dark:group-focus-within:text-amber-500 transition-colors" strokeWidth={1.5} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-none pl-12 pr-4 py-4 text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 outline-none focus:border-amber-700 dark:focus:border-amber-500 transition-colors font-light"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 p-4"
              >
                <p className="text-red-700 dark:text-red-400 text-sm text-center font-light">{error}</p>
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-stone-200 text-white dark:text-stone-900 transition-colors duration-300 flex justify-center items-center font-light disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="animate-spin w-5 h-5" strokeWidth={1.5} />
              ) : (
                "Send Reset Link"
              )}
            </button>

            <div className="text-center pt-6">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors text-sm font-light"
              >
                <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
                Back to Sign In
              </Link>
            </div>
          </form>
        </div>
      </motion.div>
    </main>
  );
}