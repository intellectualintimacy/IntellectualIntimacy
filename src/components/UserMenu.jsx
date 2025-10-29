import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { User, LogOut, Heart, Ticket, ChevronDown } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export default function UserMenu({ mobile = false, onNavigate = () => {} }) {
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
    onNavigate();
    navigate('/');
  };

  const handleNavigation = (path) => {
    setShowMenu(false);
    onNavigate();
    navigate(path);
  };

  // Mobile version - expanded view
  if (mobile) {
    if (!user) {
      return (
        <div className="space-y-3">
          <Link 
            to="/login" 
            onClick={onNavigate}
            className="block w-full py-3 px-4 text-center rounded-lg text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 transition-all font-light border border-stone-200 dark:border-stone-700"
          >
            Sign In
          </Link>
          <Link 
            to="/signup" 
            onClick={onNavigate}
            className="block w-full py-3 px-4 text-center rounded-lg bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900 hover:bg-stone-800 dark:hover:bg-stone-200 transition-all duration-300 font-light"
          >
            Sign Up
          </Link>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {/* User Info */}
        <div className="flex items-center gap-3 p-3 bg-stone-50 dark:bg-stone-800 rounded-lg border border-stone-200 dark:border-stone-700">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white font-medium flex-shrink-0">
            {user.email?.[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-light text-stone-900 dark:text-stone-100 truncate">
              {user.user_metadata?.full_name || user.email?.split('@')[0]}
            </p>
            <p className="text-xs text-stone-500 dark:text-stone-400 truncate">
              {user.email}
            </p>
          </div>
        </div>

        {/* Menu Items */}
        <div className="space-y-1">
          <button
            onClick={() => handleNavigation('/my-tickets')}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors text-left"
          >
            <Ticket className="w-4 h-4 text-stone-600 dark:text-stone-400" strokeWidth={1.5} />
            <span className="text-sm font-light text-stone-700 dark:text-stone-300">My Tickets</span>
          </button>

          <button
            onClick={() => handleNavigation('/favorites')}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors text-left"
          >
            <Heart className="w-4 h-4 text-stone-600 dark:text-stone-400" strokeWidth={1.5} />
            <span className="text-sm font-light text-stone-700 dark:text-stone-300">Favorites</span>
          </button>

          <button
            onClick={() => handleNavigation('/profile')}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors text-left"
          >
            <User className="w-4 h-4 text-stone-600 dark:text-stone-400" strokeWidth={1.5} />
            <span className="text-sm font-light text-stone-700 dark:text-stone-300">Profile</span>
          </button>

          <div className="pt-2 mt-2 border-t border-stone-200 dark:border-stone-700">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left"
            >
              <LogOut className="w-4 h-4 text-red-600 dark:text-red-400" strokeWidth={1.5} />
              <span className="text-sm font-light text-red-600 dark:text-red-400">Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Desktop version - dropdown
  if (!user) {
    return (
      <div className="flex items-center gap-3">
        <Link 
          to="/login" 
          className="px-4 py-2 text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100 transition-colors font-light text-sm xl:text-base"
        >
          Sign In
        </Link>
        <Link 
          to="/signup" 
          className="px-6 py-2 rounded-full bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900 hover:bg-stone-800 dark:hover:bg-stone-200 transition-all duration-300 font-light text-sm xl:text-base"
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
        <ChevronDown className={`w-4 h-4 text-stone-500 transition-transform ${showMenu ? 'rotate-180' : ''}`} strokeWidth={1.5} />
      </button>

      <AnimatePresence>
        {showMenu && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-56 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-2xl shadow-xl overflow-hidden z-50"
          >
            <div className="p-4 border-b border-stone-200 dark:border-stone-800">
              <p className="text-sm font-light text-stone-900 dark:text-stone-100 truncate">
                {user.user_metadata?.full_name || 'User'}
              </p>
              <p className="text-xs text-stone-500 dark:text-stone-400 truncate">
                {user.email}
              </p>
            </div>

            <div className="p-2">
              <Link
                to="/my-tickets"
                onClick={() => setShowMenu(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              >
                <Ticket className="w-4 h-4 text-stone-600 dark:text-stone-400" strokeWidth={1.5} />
                <span className="text-sm font-light text-stone-700 dark:text-stone-300">My Tickets</span>
              </Link>

              <Link
                to="/favorites"
                onClick={() => setShowMenu(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              >
                <Heart className="w-4 h-4 text-stone-600 dark:text-stone-400" strokeWidth={1.5} />
                <span className="text-sm font-light text-stone-700 dark:text-stone-300">Favorites</span>
              </Link>

              <Link
                to="/profile"
                onClick={() => setShowMenu(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              >
                <User className="w-4 h-4 text-stone-600 dark:text-stone-400" strokeWidth={1.5} />
                <span className="text-sm font-light text-stone-700 dark:text-stone-300">Profile</span>
              </Link>
            </div>

            <div className="p-2 border-t border-stone-200 dark:border-stone-800">
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors w-full text-left"
              >
                <LogOut className="w-4 h-4 text-red-600 dark:text-red-400" strokeWidth={1.5} />
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