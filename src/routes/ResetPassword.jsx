// src/pages/ResetPassword.jsx
import { motion } from "framer-motion";
import { Loader2, Lock, CheckCircle, Eye, EyeOff, Sparkles, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);

  // Check if user has a valid session (came from email link)
  useEffect(() => {
    checkSession();
  }, []);

  async function checkSession() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setError("Invalid or expired reset link. Please request a new one.");
    }
  }

  // Password validation
  function validatePassword(pwd) {
    const errors = [];
    if (pwd.length < 8) errors.push("At least 8 characters");
    if (!/[A-Z]/.test(pwd)) errors.push("One uppercase letter");
    if (!/[a-z]/.test(pwd)) errors.push("One lowercase letter");
    if (!/[0-9]/.test(pwd)) errors.push("One number");
    return errors;
  }

  useEffect(() => {
    if (password) {
      setValidationErrors(validatePassword(password));
    }
  }, [password]);

  async function handlePasswordReset(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validate passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    // Validate password strength
    const errors = validatePassword(password);
    if (errors.length > 0) {
      setError("Password does not meet requirements");
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      setSuccess(true);
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate("/login");
      }, 3000);
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
              Password <span className="elegant-text">Updated</span>
            </h1>

            <p className="text-stone-600 dark:text-stone-400 mb-8 leading-relaxed font-light">
              Your password has been successfully reset. You'll be redirected to sign in shortly.
            </p>

            <div className="flex items-center justify-center gap-2 text-sm text-stone-500 dark:text-stone-400 font-light">
              <Loader2 className="w-4 h-4 animate-spin" strokeWidth={1.5} />
              Redirecting to sign in...
            </div>
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
              Create New <span className="elegant-text">Password</span>
            </h1>
            <p className="text-stone-600 dark:text-stone-400 text-sm font-light">
              Choose a strong password for your account
            </p>
          </div>

          <form onSubmit={handlePasswordReset} className="space-y-6">
            <div>
              <label className="block text-sm mb-3 text-stone-700 dark:text-stone-300 font-light">
                New Password
              </label>
              <div className="relative group">
                <Lock className="w-5 h-5 text-stone-400 dark:text-stone-500 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-amber-700 dark:group-focus-within:text-amber-500 transition-colors" strokeWidth={1.5} />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-none pl-12 pr-12 py-4 text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 outline-none focus:border-amber-700 dark:focus:border-amber-500 transition-colors font-light"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" strokeWidth={1.5} /> : <Eye className="w-5 h-5" strokeWidth={1.5} />}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {password && (
                <div className="mt-3 space-y-2">
                  <div className="flex gap-1">
                    {[0, 1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                          validationErrors.length === 0 
                            ? 'bg-green-500' 
                            : validationErrors.length <= i 
                            ? 'bg-amber-500' 
                            : 'bg-stone-200 dark:bg-stone-700'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="space-y-1">
                    {[
                      { label: "At least 8 characters", valid: password.length >= 8 },
                      { label: "One uppercase letter", valid: /[A-Z]/.test(password) },
                      { label: "One lowercase letter", valid: /[a-z]/.test(password) },
                      { label: "One number", valid: /[0-9]/.test(password) }
                    ].map((req, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs">
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                          req.valid ? 'bg-green-100 dark:bg-green-900/30' : 'bg-stone-100 dark:bg-stone-800'
                        }`}>
                          {req.valid && <CheckCircle className="w-3 h-3 text-green-600 dark:text-green-400" strokeWidth={2} />}
                        </div>
                        <span className={req.valid ? 'text-green-600 dark:text-green-400' : 'text-stone-500 dark:text-stone-400'}>
                          {req.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm mb-3 text-stone-700 dark:text-stone-300 font-light">
                Confirm Password
              </label>
              <div className="relative group">
                <Lock className="w-5 h-5 text-stone-400 dark:text-stone-500 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-amber-700 dark:group-focus-within:text-amber-500 transition-colors" strokeWidth={1.5} />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-none pl-12 pr-12 py-4 text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 outline-none focus:border-amber-700 dark:focus:border-amber-500 transition-colors font-light"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" strokeWidth={1.5} /> : <Eye className="w-5 h-5" strokeWidth={1.5} />}
                </button>
              </div>
              {confirmPassword && password !== confirmPassword && (
                <div className="mt-2 flex items-center gap-2 text-xs text-red-600 dark:text-red-400">
                  <AlertCircle className="w-3 h-3" strokeWidth={2} />
                  <span>Passwords do not match</span>
                </div>
              )}
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
              disabled={loading || validationErrors.length > 0 || password !== confirmPassword}
              className="w-full py-4 bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-stone-200 text-white dark:text-stone-900 transition-colors duration-300 flex justify-center items-center font-light disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="animate-spin w-5 h-5" strokeWidth={1.5} />
              ) : (
                "Reset Password"
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </main>
  );
}