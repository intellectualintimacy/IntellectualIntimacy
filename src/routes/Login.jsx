import { motion } from "framer-motion";
import { Loader2, Lock, Mail, Sparkles, BookOpen, MessageCircle, Users, Sun, Moon } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("theme") === "dark");

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);
  
  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      if (data.user) {
        navigate("/events");
      }
    } catch (err) {
      setError(err.message || "An error occurred");
      setLoading(false);
    }
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
    <main className="min-h-screen flex bg-gradient-to-b from-stone-50 to-white dark:from-stone-950 dark:to-stone-900 relative">
      
      <button
        onClick={() => setDarkMode(!darkMode)}
        className="absolute top-6 right-6 p-2 rounded-full border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 transition"
        aria-label="Toggle Dark Mode"
      >
        {darkMode ? <Sun className="w-5 h-5 text-stone-100" /> : <Moon className="w-5 h-5 text-stone-800" />}
      </button>
      
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
              Welcome Back to
              <span className="block elegant-text mt-2">
                Meaningful Dialogue
              </span>
            </h1>

            <div className="elegant-divider my-8"></div>

            <p className="text-lg text-stone-600 dark:text-stone-300 mb-12 leading-relaxed font-light max-w-md">
              Where depth meets discourse, and curiosity cultivates connection.
            </p>

            {/* Feature List */}
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
                Sign <span className="elegant-text">In</span>
              </h1>
              <p className="text-stone-600 dark:text-stone-400 text-sm font-light">
                Continue your journey of intellectual discovery
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
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
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm text-stone-700 dark:text-stone-300 font-light">
                    Password
                  </label>

                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm text-stone-700 dark:text-stone-300 font-light">
                      Password
                    </label>
                    <Link 
                      to="/forgot-password" 
                      className="text-xs elegant-text hover:opacity-70 transition-opacity"
                    >
                      Forgot password?
                    </Link>
                  </div>
                </div>
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
                  "Sign In"
                )}
              </button>

              <div className="relative my-10">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-stone-200 dark:border-stone-700"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-4 bg-white dark:bg-stone-800 text-stone-500 dark:text-stone-400 font-light uppercase tracking-wider">
                    New Member
                  </span>
                </div>
              </div>

              <Link
                to="/signup"
                className="block w-full py-4 border border-stone-300 dark:border-stone-600 hover:border-stone-900 dark:hover:border-stone-300 transition-colors duration-300 text-center font-light text-stone-900 dark:text-stone-100"
              >
                Create Account
              </Link>
            </form>
          </div>
        </motion.div>
      </div>
    </main>
  );
}