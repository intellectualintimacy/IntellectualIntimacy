import { motion } from "framer-motion";
import { Loader2, User, Mail, Lock, Sparkles, Heart, Lightbulb, Target } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { supabase } from "../../lib/supabase";

export default function Signup() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSignup(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });

    if (error) {
      setError(error.message);
    } else {
      navigate("/login");
    }

    setLoading(false);
  }

  const values = [
    {
      icon: Heart,
      title: "Depth Over Surface",
      description: "Conversations that explore complexity, nuance, and authentic human experience"
    },
    {
      icon: Lightbulb,
      title: "Curiosity & Growth",
      description: "A commitment to lifelong learning and intellectual-emotional development"
    },
    {
      icon: Target,
      title: "Intentional Community",
      description: "Carefully curated spaces for meaningful connection and mutual support"
    }
  ];

  const stats = [
    { value: "140+", label: "Thoughtful Members" },
    { value: "18+", label: "Transformative Events" },
    { value: "95%", label: "Member Satisfaction" }
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
        {/* Elegant Background Pattern */}
        <div className="absolute inset-0 opacity-5 dark:opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, #a8a29e 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }} />
        </div>

        {/* Subtle Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50/30 via-transparent to-stone-100/30 dark:from-amber-950/10 dark:via-transparent dark:to-stone-900/30" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-16 py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            {/* Logo */}
            <div className="flex items-center gap-3 mb-12">
              <div className="icon-elegant">
                <Sparkles className="w-6 h-6" strokeWidth={1.5} />
              </div>
              <span className="text-xl font-light text-stone-800 dark:text-stone-100" style={{ fontFamily: 'Crimson Pro, serif' }}>
                Intellectual Intimacy
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl lg:text-6xl font-light mb-6 leading-tight text-stone-900 dark:text-stone-50" style={{ fontFamily: 'Crimson Pro, serif' }}>
              Join a Community of
              <span className="block elegant-text mt-2">
                Curious Minds
              </span>
            </h1>

            <div className="elegant-divider my-8"></div>

            <p className="text-lg text-stone-600 dark:text-stone-300 mb-12 leading-relaxed font-light max-w-md">
              Step into a space where conversations transcend the ordinary and connections run deep.
            </p>

            {/* Values */}
            <div className="space-y-8 mb-12">
              {values.map((value, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.15, duration: 0.8 }}
                  className="flex items-start gap-4"
                >
                  <div className="icon-elegant mt-1">
                    <value.icon className="w-5 h-5" strokeWidth={1.5} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-light mb-1 text-stone-800 dark:text-stone-100" style={{ fontFamily: 'Crimson Pro, serif' }}>
                      {value.title}
                    </h3>
                    <p className="text-stone-600 dark:text-stone-400 text-sm leading-relaxed font-light">
                      {value.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.8 }}
              className="grid grid-cols-3 gap-8 pt-10 border-t border-stone-200 dark:border-stone-700"
            >
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl font-light elegant-text mb-2" style={{ fontFamily: 'Crimson Pro, serif' }}>
                    {stat.value}
                  </div>
                  <div className="text-xs text-stone-500 dark:text-stone-400 uppercase tracking-widest font-light">
                    {stat.label}
                  </div>
                </div>
              ))}
            </motion.div>
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
          {/* Mobile Logo */}
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
                Begin your journey toward meaningful connection
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
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-none pl-12 pr-4 py-4 text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 outline-none focus:border-amber-700 dark:focus:border-amber-500 transition-colors font-light"
                    placeholder="Your full name"
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
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-none pl-12 pr-4 py-4 text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 outline-none focus:border-amber-700 dark:focus:border-amber-500 transition-colors font-light"
                    placeholder="••••••••"
                  />
                </div>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-2 font-light">
                  Minimum 8 characters required
                </p>
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
                  "Create Account"
                )}
              </button>

              <p className="text-xs text-stone-500 dark:text-stone-400 text-center font-light leading-relaxed">
                By creating an account, you agree to our Terms of Service and Privacy Policy
              </p>

              <div className="relative my-10">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-stone-200 dark:border-stone-700"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-4 bg-white dark:bg-stone-800 text-stone-500 dark:text-stone-400 font-light uppercase tracking-wider">
                    Existing Member
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