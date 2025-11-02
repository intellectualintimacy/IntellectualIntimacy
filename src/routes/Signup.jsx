// src/pages/Signup.jsx - Updated with email confirmation
import { motion } from "framer-motion";
import { Loader2, Lock, Mail, User, Sparkles, BookOpen, MessageCircle, Users, Eye, EyeOff, CheckCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { supabase } from "../../lib/supabase";

export default function Signup() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);
  const [emailSent, setEmailSent] = useState(false);

  // Password validation
  function validatePassword(pwd) {
    const errors = [];
    if (pwd.length < 8) errors.push("At least 8 characters");
    if (!/[A-Z]/.test(pwd)) errors.push("One uppercase letter");
    if (!/[a-z]/.test(pwd)) errors.push("One lowercase letter");
    if (!/[0-9]/.test(pwd)) errors.push("One number");
    return errors;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (name === "password") {
      setValidationErrors(validatePassword(value));
    }
  };

  async function handleSignup(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    // Validate password strength
    const errors = validatePassword(formData.password);
    if (errors.length > 0) {
      setError("Password does not meet requirements");
      setLoading(false);
      return;
    }

    try {
      // Check if email already exists in profiles table
      const { data: existingProfile, error: profileError } = await supabase
        .from('profiles')
        .select('email')
        .eq('email', formData.email.toLowerCase())
        .maybeSingle();

      if (profileError && profileError.code !== 'PGRST116') {
        // PGRST116 is "no rows returned" which is what we want
        throw profileError;
      }

      if (existingProfile) {
        setError("An account with this email already exists. Please sign in instead.");
        setLoading(false);
        return;
      }

      // Attempt signup
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
          },
          emailRedirectTo: `${window.location.origin}/confirm-email`,
        }
      });

      if (error) {
        // Handle specific Supabase auth errors
        if (error.message.includes('already registered')) {
          setError("This email is already registered. Please sign in instead.");
        } else if (error.message.includes('Email rate limit exceeded')) {
          setError("Too many signup attempts. Please try again in a few minutes.");
        } else {
          setError(error.message);
        }
        setLoading(false);
        return;
      }

      // Check if user was actually created (Supabase might return success even if email exists)
      if (data.user && data.user.identities && data.user.identities.length === 0) {
        setError("This email is already registered. Please sign in instead.");
        setLoading(false);
        return;
      }

      // Show success message - user needs to confirm email
      setEmailSent(true);
      setLoading(false);
    } catch (err) {
      console.error('Signup error:', err);
      setError(err.message || "An error occurred during signup");
      setLoading(false);
    }
  }

  // Success state after signup
  if (emailSent) {
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
              className="w-20 h-20 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-6"
            >
              <Mail className="w-10 h-10 text-amber-600 dark:text-amber-400" strokeWidth={1.5} />
            </motion.div>

            <div className="elegant-divider mb-6"></div>

            <h1 className="text-3xl font-light text-stone-900 dark:text-stone-50 mb-4" style={{ fontFamily: 'Crimson Pro, serif' }}>
              Check Your <span className="elegant-text">Email</span>
            </h1>

            <p className="text-stone-600 dark:text-stone-400 mb-6 leading-relaxed font-light">
              We've sent a confirmation link to<br />
              <strong className="text-stone-900 dark:text-stone-100 font-normal">{formData.email}</strong>
            </p>

            <div className="bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700 rounded-lg p-6 mb-8 text-left">
              <h3 className="text-sm font-normal text-stone-900 dark:text-stone-100 mb-3">Next Steps:</h3>
              <div className="space-y-2">
                <div className="flex items-start gap-2 text-sm text-stone-600 dark:text-stone-400 font-light">
                  <CheckCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                  <span>Check your inbox for the confirmation email</span>
                </div>
                <div className="flex items-start gap-2 text-sm text-stone-600 dark:text-stone-400 font-light">
                  <CheckCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                  <span>Click the confirmation link to verify your account</span>
                </div>
                <div className="flex items-start gap-2 text-sm text-stone-600 dark:text-stone-400 font-light">
                  <CheckCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                  <span>You'll be redirected automatically after confirmation</span>
                </div>
              </div>
            </div>

            <p className="text-xs text-stone-500 dark:text-stone-400 mb-8 font-light">
              Didn't receive the email? Check your spam folder or{" "}
              <button
                onClick={() => setEmailSent(false)}
                className="elegant-text hover:opacity-70 transition-opacity"
              >
                try again
              </button>
            </p>

            <Link
              to="/login"
              className="text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors text-sm font-light"
            >
              Back to Sign In
            </Link>
          </div>
        </motion.div>
      </main>
    );
  }

  const features = [
    {
      icon: BookOpen,
      title: "Curated Conversations",
      description: "Thoughtfully designed dialogues that explore life's profound questions"
    },
    {
      icon: Users,
      title: "Intimate Gatherings",
      description: "Small, intentional spaces for authentic human connection"
    },
    {
      icon: MessageCircle,
      title: "Intellectual Depth",
      description: "Where curiosity meets vulnerability in transformative exchange"
    }
  ];

  return (
    <main className="min-h-screen flex bg-gradient-to-b from-stone-50 to-white dark:from-stone-950 dark:to-stone-900">
      {/* Left Brand Section */}
      <motion.div 
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden"
      >
        <div className="absolute inset-0 opacity-5 dark:opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, #a8a29e 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }} />
        </div>

        <div className="absolute inset-0 bg-gradient-to-br from-amber-50/30 via-transparent to-stone-100/30 dark:from-amber-950/10 dark:via-transparent dark:to-stone-900/30" />

        <div className="relative z-10 flex flex-col justify-center px-16 py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            <div className="flex items-center gap-3 mb-12">
              <div className="icon-elegant">
                <Sparkles className="w-6 h-6" strokeWidth={1.5} />
              </div>
              <span className="text-xl font-light text-stone-800 dark:text-stone-100" style={{ fontFamily: 'Crimson Pro, serif' }}>
                Intellectual Intimacy
              </span>
            </div>

            <h1 className="text-5xl lg:text-6xl font-light mb-6 leading-tight text-stone-900 dark:text-stone-50" style={{ fontFamily: 'Crimson Pro, serif' }}>
              Begin Your Journey of
              <span className="block elegant-text mt-2">
                Meaningful Discovery
              </span>
            </h1>

            <div className="elegant-divider my-8"></div>

            <p className="text-lg text-stone-600 dark:text-stone-300 mb-12 leading-relaxed font-light max-w-md">
              Join a community where depth meets discourse, and curiosity cultivates connection.
            </p>

            <div className="space-y-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.15, duration: 0.8 }}
                  className="flex items-start gap-4"
                >
                  <div className="icon-elegant mt-1">
                    <feature.icon className="w-5 h-5" strokeWidth={1.5} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-light mb-1 text-stone-800 dark:text-stone-100" style={{ fontFamily: 'Crimson Pro, serif' }}>
                      {feature.title}
                    </h3>
                    <p className="text-stone-600 dark:text-stone-400 text-sm leading-relaxed font-light">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Right Form Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden flex items-center gap-3 mb-10 justify-center">
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
                Create <span className="elegant-text">Account</span>
              </h1>
              <p className="text-stone-600 dark:text-stone-400 text-sm font-light">
                Begin your journey of intellectual discovery
              </p>
            </div>

            <form onSubmit={handleSignup} className="space-y-6">
              <div>
                <label className="block text-sm mb-3 text-stone-700 dark:text-stone-300 font-light">
                  Full Name
                </label>
                <div className="relative group">
                  <User className="w-5 h-5 text-stone-400 dark:text-stone-500 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-amber-700 dark:group-focus-within:text-amber-500 transition-colors" strokeWidth={1.5} />
                  <input
                    type="text"
                    name="fullName"
                    required
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-none pl-12 pr-4 py-4 text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 outline-none focus:border-amber-700 dark:focus:border-amber-500 transition-colors font-light"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm mb-3 text-stone-700 dark:text-stone-300 font-light">
                  Email Address
                </label>
                <div className="relative group">
                  <Mail className="w-5 h-5 text-stone-400 dark:text-stone-500 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-amber-700 dark:group-focus-within:text-amber-500 transition-colors" strokeWidth={1.5} />
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-none pl-12 pr-4 py-4 text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 outline-none focus:border-amber-700 dark:focus:border-amber-500 transition-colors font-light"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm mb-3 text-stone-700 dark:text-stone-300 font-light">
                  Password
                </label>
                <div className="relative group">
                  <Lock className="w-5 h-5 text-stone-400 dark:text-stone-500 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-amber-700 dark:group-focus-within:text-amber-500 transition-colors" strokeWidth={1.5} />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
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
                
                {formData.password && validationErrors.length > 0 && (
                  <div className="mt-3 space-y-1">
                    {[
                      { label: "At least 8 characters", valid: formData.password.length >= 8 },
                      { label: "One uppercase letter", valid: /[A-Z]/.test(formData.password) },
                      { label: "One lowercase letter", valid: /[a-z]/.test(formData.password) },
                      { label: "One number", valid: /[0-9]/.test(formData.password) }
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
                    name="confirmPassword"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
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
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 p-4"
                >
                  <p className="text-red-700 dark:text-red-400 text-sm text-center font-light">{error}</p>
                  {(error.includes('already registered') || error.includes('already exists')) && (
                    <Link
                      to="/login"
                      className="block text-center mt-3 text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 font-normal underline"
                    >
                      Go to Sign In →
                    </Link>
                  )}
                </motion.div>
              )}

              <button
                type="submit"
                disabled={loading || validationErrors.length > 0}
                className="w-full py-4 bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-stone-200 text-white dark:text-stone-900 transition-colors duration-300 flex justify-center items-center font-light disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="animate-spin w-5 h-5" strokeWidth={1.5} />
                ) : (
                  "Create Account"
                )}
              </button>

              <div className="relative my-10">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-stone-200 dark:border-stone-700"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-4 bg-white dark:bg-stone-800 text-stone-500 dark:text-stone-400 font-light uppercase tracking-wider">
                    Already a member
                  </span>
                </div>
              </div>

              <Link
                to="/login"
                className="block w-full py-4 border border-stone-300 dark:border-stone-600 hover:border-stone-900 dark:hover:border-stone-300 transition-colors duration-300 text-center font-light text-stone-900 dark:text-stone-100"
              >
                Sign In
              </Link>
            </form>
          </div>
        </motion.div>
      </div>
    </main>
  );
}