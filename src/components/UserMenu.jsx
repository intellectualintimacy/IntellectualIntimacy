import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { User, LogOut, Heart, Ticket, ChevronDown } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export default function UserMenu() {
  const [user, setUser] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    checkUser();
    
    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        setUser(session?.user);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setShowMenu(false);
    navigate('/');
  };

  if (!user) {
    return (
      <div className="flex items-center gap-3">
        <Link 
          to="/login" 
          className="px-4 py-2 text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100 transition-colors font-light"
        >
          Sign In
        </Link>
        <Link 
          to="/signup" 
          className="px-6 py-2 rounded-full bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900 hover:bg-stone-800 dark:hover:bg-stone-200 transition-all duration-300 font-light"
        >
          Sign Up
        </Link>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-2 px-4 py-2 rounded-full bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 hover:border-stone-400 dark:hover:border-stone-600 transition-all duration-300"
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white font-medium text-sm">
          {user.email?.[0].toUpperCase()}
        </div>
        <span className="text-sm font-light text-stone-700 dark:text-stone-300 hidden md:inline">
          {user.user_metadata?.full_name || user.email?.split('@')[0]}
        </span>
        <ChevronDown className={`w-4 h-4 text-stone-500 transition-transform ${showMenu ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {showMenu && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 mt-2 w-56 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-2xl shadow-xl overflow-hidden z-50"
          >
            <div className="p-4 border-b border-stone-200 dark:border-stone-800">
              <p className="text-sm font-light text-stone-900 dark:text-stone-100">
                {user.user_metadata?.full_name || 'User'}
              </p>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {user.email}
              </p>
            </div>

            <div className="p-2">
              <Link
                to="/my-tickets"
                onClick={() => setShowMenu(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              >
                <Ticket className="w-4 h-4 text-stone-600 dark:text-stone-400" />
                <span className="text-sm font-light text-stone-700 dark:text-stone-300">My Tickets</span>
              </Link>

              <Link
                to="/favorites"
                onClick={() => setShowMenu(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              >
                <Heart className="w-4 h-4 text-stone-600 dark:text-stone-400" />
                <span className="text-sm font-light text-stone-700 dark:text-stone-300">Favorites</span>
              </Link>

              <Link
                to="/profile"
                onClick={() => setShowMenu(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              >
                <User className="w-4 h-4 text-stone-600 dark:text-stone-400" />
                <span className="text-sm font-light text-stone-700 dark:text-stone-300">Profile</span>
              </Link>
            </div>

            <div className="p-2 border-t border-stone-200 dark:border-stone-800">
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors w-full text-left"
              >
                <LogOut className="w-4 h-4 text-red-600 dark:text-red-400" />
                <span className="text-sm font-light text-red-600 dark:text-red-400">Sign Out</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Click outside to close */}
      {showMenu && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowMenu(false)}
        />
      )}
    </div>
  );
}