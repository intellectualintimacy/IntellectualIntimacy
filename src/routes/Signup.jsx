import { motion } from "framer-motion";
import { Loader2, User, Mail, Lock, Sparkles, Lightbulb, Heart, Zap } from "lucide-react";
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

  const benefits = [
    {
      icon: Lightbulb,
      title: "Enlightening Discussions",
      description: "Participate in carefully curated conversations that challenge perspectives and spark growth"
    },
    {
      icon: Heart,
      title: "Authentic Community",
      description: "Connect with genuine individuals who value depth over superficiality"
    },
    {
      icon: Zap,
      title: "Transformative Experiences",
      description: "Leave each gathering enriched, inspired, and connected to what matters"
    }
  ];

  const stats = [
    { value: "500+", label: "Thoughtful Members" },
    { value: "50+", label: "Events Hosted" },
    { value: "95%", label: "Satisfaction Rate" }
  ];

  return (
    <section className="min-h-screen flex bg-gradient-to-br from-stone-950 via-stone-900 to-amber-950/20">
      {/* Left Brand Section */}
      <motion.div 
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden"
      >
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              rotate: [0, 180, 0],
              opacity: [0.08, 0.15, 0.08]
            }}
            transition={{ duration: 30, repeat: Infinity }}
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1.3, 1, 1.3],
              rotate: [180, 0, 180],
              opacity: [0.08, 0.12, 0.08]
            }}
            transition={{ duration: 35, repeat: Infinity }}
            className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl"
          />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-16 py-20 text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center">
                <Sparkles className="w-7 h-7" />
              </div>
              <h2 className="text-2xl font-light">Intellectual Intimacy</h2>
            </div>

            <h1 className="text-5xl font-light mb-6 leading-tight">
              Join a Community of
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600 font-normal">
                Curious Minds
              </span>
            </h1>

            <p className="text-xl text-stone-400 mb-12 leading-relaxed">
              Step into a space where conversations transcend the ordinary and connections run deep.
            </p>

            {/* Benefits */}
            <div className="space-y-6 mb-12">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="flex items-start gap-4 group"
                >
                  <div className="w-12 h-12 bg-stone-800/50 backdrop-blur-sm rounded-xl flex items-center justify-center group-hover:bg-amber-500/20 transition-colors duration-300 border border-stone-700/50">
                    <benefit.icon className="w-6 h-6 text-amber-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-medium mb-1">{benefit.title}</h3>
                    <p className="text-stone-400 text-sm leading-relaxed">{benefit.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="grid grid-cols-3 gap-6 pt-8 border-t border-stone-700/50"
            >
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl font-light text-amber-400 mb-1">{stat.value}</div>
                  <div className="text-xs text-stone-400 uppercase tracking-wider">{stat.label}</div>
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
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-light text-white">Intellectual Intimacy</h2>
          </div>

          <div className="bg-stone-800/40 backdrop-blur-2xl rounded-3xl p-10 shadow-2xl border border-stone-700/50">
            <div className="mb-8">
              <h1 className="text-3xl font-light text-white mb-2">
                Create Account
              </h1>
              <p className="text-stone-400 text-sm">Begin your journey toward meaningful connections</p>
            </div>

            <form onSubmit={handleSignup} className="space-y-5">
              <div>
                <label className="block text-sm mb-2 text-stone-300 font-medium">Full Name</label>
                <div className="relative group">
                  <User className="w-5 h-5 text-stone-500 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-amber-500 transition-colors" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-stone-900/50 border border-stone-700/50 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder-stone-500 outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 transition-all"
                    placeholder="Your full name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm mb-2 text-stone-300 font-medium">Email Address</label>
                <div className="relative group">
                  <Mail className="w-5 h-5 text-stone-500 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-amber-500 transition-colors" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-stone-900/50 border border-stone-700/50 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder-stone-500 outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 transition-all"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm mb-2 text-stone-300 font-medium">Password</label>
                <div className="relative group">
                  <Lock className="w-5 h-5 text-stone-500 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-amber-500 transition-colors" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-stone-900/50 border border-stone-700/50 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder-stone-500 outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 transition-all"
                    placeholder="••••••••"
                  />
                </div>
                <p className="text-xs text-stone-500 mt-2">Must be at least 8 characters</p>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-500/10 border border-red-500/30 rounded-xl p-3"
                >
                  <p className="text-red-400 text-sm text-center">{error}</p>
                </motion.div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 transition-all duration-300 flex justify-center items-center font-medium text-white shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="animate-spin w-5 h-5" />
                ) : (
                  "Create Account"
                )}
              </button>

              <p className="text-xs text-stone-400 text-center">
                By signing up, you agree to our Terms of Service and Privacy Policy
              </p>

              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-stone-700/50"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-stone-800/40 text-stone-400">Already have an account?</span>
                </div>
              </div>

              <Link
                to="/login"
                className="block w-full py-4 rounded-xl bg-stone-700/30 hover:bg-stone-700/50 transition-all duration-300 text-center font-medium text-white border border-stone-600/50"
              >
                Sign In
              </Link>
            </form>
          </div>
        </motion.div>
      </div>
    </section>
  );
}