import { motion } from "framer-motion";
import { Loader2, Lock, Mail } from "lucide-react";
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
        localStorage.setItem("userEmail", data.user.email);
        navigate("/events");
      }
    } catch (err) {
      setError(err.message || "An error occurred");
      setLoading(false);
    }
  }

  return (
    <section className="min-h-screen flex flex-col md:flex-row bg-stone-950 text-white overflow-hidden">
      {/* Left panel */}
      <motion.div
        initial={{ opacity: 0, x: -60 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1 }}
        className="hidden md:flex flex-col justify-center items-start w-1/2 bg-gradient-to-br from-stone-900 to-stone-800 p-16 relative"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,191,73,0.1),_transparent_70%)]" />
        <h1 className="text-5xl font-light mb-6 text-amber-400">
          Intellectual Intimacy
        </h1>
        <p className="text-lg max-w-md text-stone-300 leading-relaxed">
          A space where <span className="text-amber-400">depth meets curiosity</span> — 
          reconnect with what truly matters. Let your thoughts and emotions find meaning.
        </p>
      </motion.div>

      {/* Right panel */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9 }}
        className="flex flex-1 flex-col justify-center items-center px-8 py-16 md:w-1/2 bg-stone-900/60 backdrop-blur-xl"
      >
        <div className="w-full max-w-md bg-stone-800/80 rounded-3xl p-8 shadow-2xl border border-stone-700/60">
          <h2 className="text-3xl font-light mb-8 text-center">
            Welcome Back to{" "}
            <span className="text-amber-400">Intellectual Intimacy</span>
          </h2>

          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-sm mb-2">Email</label>
              <div className="flex items-center bg-stone-900 rounded-xl px-4 py-3">
                <Mail className="w-5 h-5 text-stone-400 mr-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-transparent flex-1 outline-none text-white placeholder-stone-500"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm mb-2">Password</label>
              <div className="flex items-center bg-stone-900 rounded-xl px-4 py-3">
                <Lock className="w-5 h-5 text-stone-400 mr-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-transparent flex-1 outline-none text-white placeholder-stone-500"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <p className="text-red-400 text-sm text-center">{error}</p>
            )}

            {/* Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 transition-all duration-300 flex justify-center items-center"
            >
              {loading ? <Loader2 className="animate-spin w-5 h-5" /> : "Sign In"}
            </button>

            <p className="text-center text-sm mt-4 text-stone-400">
              Don’t have an account?{" "}
              <Link to="/signup" className="text-amber-400 hover:underline">
                Sign up
              </Link>
            </p>
          </form>
        </div>
      </motion.div>
    </section>
  );
}
