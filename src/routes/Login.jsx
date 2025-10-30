import { motion } from "framer-motion";
import { Loader2, Lock, Mail, Brain, Sparkles, Users, MessageCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { supabase } from "../../lib/supabase";

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

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
      icon: Brain,
      title: "Curated Conversations",
      description: "Engage in thought-provoking discussions with like-minded individuals"
    },
    {
      icon: Users,
      title: "Intimate Gatherings",
      description: "Small, focused events designed for meaningful connections"
    },
    {
      icon: MessageCircle,
      title: "Deep Dialogue",
      description: "Move beyond small talk into conversations that matter"
    }
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
              scale: [1, 1.2, 1],
              rotate: [0, 90, 0],
              opacity: [0.1, 0.2, 0.1]
            }}
            transition={{ duration: 20, repeat: Infinity }}
            className="absolute top-20 left-20 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1.2, 1, 1.2],
              rotate: [90, 0, 90],
              opacity: [0.1, 0.15, 0.1]
            }}
            transition={{ duration: 25, repeat: Infinity }}
            className="absolute bottom-20 right-20 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl"
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
              Welcome Back to
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600 font-normal">
                Meaningful Connections
              </span>
            </h1>

            <p className="text-xl text-stone-400 mb-12 leading-relaxed">
              Where depth meets dialogue, and curiosity finds community.
            </p>

            {/* Feature Cards */}
            <div className="space-y-6">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="flex items-start gap-4 group"
                >
                  <div className="w-12 h-12 bg-stone-800/50 backdrop-blur-sm rounded-xl flex items-center justify-center group-hover:bg-amber-500/20 transition-colors duration-300 border border-stone-700/50">
                    <feature.icon className="w-6 h-6 text-amber-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-medium mb-1">{feature.title}</h3>
                    <p className="text-stone-400 text-sm leading-relaxed">{feature.description}</p>
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
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-light text-white">Intellectual Intimacy</h2>
          </div>

          <div className="bg-stone-800/40 backdrop-blur-2xl rounded-3xl p-10 shadow-2xl border border-stone-700/50">
            <div className="mb-8">
              <h1 className="text-3xl font-light text-white mb-2">
                Sign In
              </h1>
              <p className="text-stone-400 text-sm">Enter your credentials to continue</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
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
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm text-stone-300 font-medium">Password</label>
                  <button type="button" className="text-xs text-amber-500 hover:text-amber-400 transition-colors">
                    Forgot?
                  </button>
                </div>
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
                  "Sign In"
                )}
              </button>

              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-stone-700/50"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-stone-800/40 text-stone-400">New to Intellectual Intimacy?</span>
                </div>
              </div>

              <Link
                to="/signup"
                className="block w-full py-4 rounded-xl bg-stone-700/30 hover:bg-stone-700/50 transition-all duration-300 text-center font-medium text-white border border-stone-600/50"
              >
                Create Account
              </Link>
            </form>
          </div>
        </motion.div>
      </div>
    </section>
  );
}