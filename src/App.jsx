import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Navigation from "./components/layout/Navigation";
import Footer from "./components/layout/Footer";
import Home from "./routes/Home";
import About from "./routes/About";
import Events from "./routes/Events";
import Contact from "./routes/Contact";
import Support from "./routes/Support";
import Privacy from "./routes/Privacy";
import Login from "./routes/Login";
import Signup from "./routes/Signup";
import MyTickets from "./routes/MyTickets";
import NewsletterConfirm from "./routes/NewsletterConfirm";
import NewsletterUnsubscribe from "./routes/NewsletterUnsubscribe";
import ShareTestimonial from "./routes/ShareTestimonial";
import AdminDashboard from "./routes/admin/AdminDashboard";
import ForgotPassword from './routes/ForgotPassword';
import ResetPassword from './routes/ResetPassword';
import ConfirmEmail from './routes/ConfirmEmail';
import ConnectionMonitor from './components/ConnectionMonitor';
// import Navigation from './components/layout/Navigation';
import Blog from './routes/Blog';
import Profile from './routes/Profile';
import { supabase } from "../lib/supabase";
import "./App.css";

// ✅ A wrapper component so we can use useLocation()
function AppContent({ darkMode, setDarkMode }) {
  const location = useLocation();

  // Hide header/footer on specific routes
  const hideLayoutRoutes = ["/login", "/signup", "/forgot-password", "/reset-password", "/admin/events"];
  const hideLayout = hideLayoutRoutes.includes(location.pathname);

  return (
    <div className="min-h-screen transition-colors duration-500 bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-white">
      {!hideLayout && <Navigation darkMode={darkMode} setDarkMode={setDarkMode} />}
      <ConnectionMonitor />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/events" element={<Events />} />
        <Route path="/support" element={<Support />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/my-tickets" element={<MyTickets />} />
        <Route path="/newsletter/confirm" element={<NewsletterConfirm />} />
        <Route path="/newsletter/unsubscribe" element={<NewsletterUnsubscribe />} />
        <Route path="/share-testimonial" element={<ShareTestimonial />} />
        <Route path="/admin/events" element={<AdminDashboard />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/confirm-email" element={<ConfirmEmail />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/blog" element={<Blog />} />

      </Routes>

      {!hideLayout && <Footer />}
    </div>
  );
}

export default function App() {
  const [darkMode, setDarkMode] = useState(false);

  // 🌙 Dark mode toggle
  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  // 🔐 Supabase auth session handling
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        localStorage.setItem("userEmail", session.user.email);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        localStorage.setItem("userEmail", session.user.email);
      } else {
        localStorage.removeItem("userEmail");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <Router>
      <AppContent darkMode={darkMode} setDarkMode={setDarkMode} />
    </Router>
  );
}
