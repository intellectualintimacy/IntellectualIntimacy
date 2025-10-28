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

    // Store user info
    if (data.user) {
      localStorage.setItem("userEmail", data.user.email);
      
      // Redirect to events page
      navigate("/events");
    }
  } catch (err) {
    setError(err.message || "An error occurred");
    setLoading(false);
  }
}

  return (
    <section className="min-h-screen flex items-center justify-center bg-stone-900 text-white px-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-md bg-stone-800/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-stone-700"
      >
        <h1 className="text-3xl font-light mb-8 text-center">
          Welcome Back to <span className="text-amber-400">Intellectual Intimacy</span>
        </h1>

        <form onSubmit={handleLogin} className="space-y-6">
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

          {error && <p className="text-red-400 text-sm text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 transition-all duration-300 flex justify-center items-center"
          >
            {loading ? (
              <Loader2 className="animate-spin w-5 h-5" />
            ) : (
              "Sign In"
            )}
          </button>

          <p className="text-center text-sm mt-4 text-stone-400">
            Don’t have an account?{" "}
            <Link to="/signup" className="text-amber-400 hover:underline">
              Sign up
            </Link>
          </p>
        </form>
      </motion.div>
    </section>
  );
}
