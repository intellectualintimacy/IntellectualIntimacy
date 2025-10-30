import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navigation from './components/layout/Navigation'
import Footer from './components/layout/Footer'
import Home from './routes/Home'
import About from './routes/About'
import Events from './routes/Events'
import Contact from './routes/Contact'
import Support from "./routes/Support"
import Privacy from './routes/Privacy'
import Login from './routes/Login'
import Signup from './routes/Signup'
import MyTickets from './routes/MyTickets'
import { supabase } from "../lib/supabase";
import NewsletterConfirm from './routes/NewsletterConfirm'
import NewsletterUnsubscribe from './routes/NewsletterUnsubscribe'
import ShareTestimonial from './routes/ShareTestimonial'
import './App.css'

function App() {
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  useEffect(() => {
  // Check for existing session on app load
  supabase.auth.getSession().then(({ data: { session } }) => {
    if (session?.user) {
      localStorage.setItem("userEmail", session.user.email);
    }
  });

  // Listen for auth changes
  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
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
      <div className="min-h-screen transition-colors duration-500">
        <Navigation darkMode={darkMode} setDarkMode={setDarkMode} />
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
          <Route path="/share-testimonial" element={<ShareTestimonial /> } />
        </Routes>
        <Footer />
      </div>
    </Router>
  )
}

export default App