import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  User, Mail, MapPin, Globe, Camera, Save, X, 
  Loader2, CheckCircle, AlertCircle, Lock, Eye, EyeOff,
  Calendar, Heart, Ticket, Bell, Shield, Trash2, Download,
  Edit2, Phone, MessageSquare, Link as LinkIcon, ChevronRight,
  Award, TrendingUp, Activity, Clock, Star, Users, BarChart3,
  Sparkles, Zap, Target, Trophy, BookOpen, Filter, Search,
  FileText, Image as ImageIcon, Video, Music, Share2, Copy,
  ExternalLink, Instagram, Twitter, Linkedin, Facebook,
  Mail as MailIcon, QrCode, Printer, Gift, CreditCard,
  Settings, Palette, Moon, Sun, Volume2, VolumeX, Briefcase
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useNavigate } from 'react-router-dom'

export default function AdvancedProfile() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [activeSubTab, setActiveSubTab] = useState('all')
  const [upcomingEvents, setUpcomingEvents] = useState([])
  const [favorites, setFavorites] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('date')
  const [viewMode, setViewMode] = useState('grid')
  const [showQR, setShowQR] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [theme, setTheme] = useState('light')
  
  // Form states
  const [profileForm, setProfileForm] = useState({
    full_name: '',
    bio: '',
    location: '',
    website: '',
    phone: '',
    instagram: '',
    twitter: '',
    linkedin: ''
  })
  
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  
  const [preferencesForm, setPreferencesForm] = useState({
    emailNotifications: true,
    eventReminders: true,
    newsletter: true,
    marketingEmails: false,
    soundEffects: true,
    accessibility: false
  })
  
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })
  
  const [errors, setErrors] = useState({})
  const [success, setSuccess] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [sharePanel, setSharePanel] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      
      // Get authenticated user
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
      if (authError || !authUser) {
        navigate('/login')
        return
      }
      setUser(authUser)

      // Load profile from profiles table
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single()

      if (profileError) {
        console.error('Profile error:', profileError)
      } else {
        setProfile(profileData)
        setProfileForm({
          full_name: profileData.full_name || '',
          bio: profileData.bio || '',
          location: profileData.location || '',
          website: profileData.website || '',
          phone: '',
          instagram: '',
          twitter: '',
          linkedin: ''
        })
      }

      // Load all reservations (not just upcoming)
      const { data: reservations, error: reservationsError } = await supabase
        .from('reservations')
        .select(`
          *,
          event:events(*)
        `)
        .eq('user_email', authUser.email)
        .order('created_at', { ascending: false })

      if (reservationsError) {
        console.error('Reservations error:', reservationsError)
        setUpcomingEvents([])
      } else {
        // Set all reservations - we'll filter in the UI based on active tab
        setUpcomingEvents(reservations || [])
      }

      // Load favorites
      const { data: favData, error: favError } = await supabase
        .from('favorites')
        .select(`
          *,
          event:events(*)
        `)
        .eq('user_email', authUser.email)
        .order('created_at', { ascending: false })

      if (favError) {
        console.error('Favorites error:', favError)
      } else {
        setFavorites(favData || [])
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    setSaving(true)
    setErrors({})
    setSuccess('')

    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      setSuccess('Profile updated successfully!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (error) {
      setErrors({ submit: error.message })
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    setSaving(true)
    setErrors({})
    setSuccess('')

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setErrors({ password: 'Passwords do not match' })
      setSaving(false)
      return
    }

    if (passwordForm.newPassword.length < 8) {
      setErrors({ password: 'Password must be at least 8 characters' })
      setSaving(false)
      return
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      setSuccess('Password updated successfully!')
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setTimeout(() => setSuccess(''), 3000)
    } catch (error) {
      setErrors({ password: error.message })
    } finally {
      setSaving(false)
    }
  }

  const exportData = async () => {
    try {
      const data = {
        profile: profile,
        reservations: upcomingEvents,
        favorites: favorites,
        exportedAt: new Date().toISOString()
      }

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `intellectual-intimacy-data-${Date.now()}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      setSuccess('Data exported successfully!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (error) {
      setErrors({ export: 'Failed to export data' })
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    setSuccess('Copied to clipboard!')
    setTimeout(() => setSuccess(''), 2000)
  }

  // Calculate real points based on user activity
  const calculateUserPoints = () => {
    let points = 0
    
    upcomingEvents.forEach(reservation => {
      if (reservation.status === 'confirmed' && reservation.event) {
        const eventDate = new Date(reservation.event.date)
        const today = new Date()
        
        // Points for booking
        if (reservation.event.is_free) {
          points += 10 // Base points for free event booking
        } else {
          // Points based on ticket price (1 point per R10 spent, max 100 points per event)
          const pricePoints = Math.min(Math.floor(reservation.payment_amount / 10), 100)
          points += pricePoints
        }
        
        // Bonus points for attending (if event date has passed)
        if (eventDate < today) {
          if (reservation.event.is_free) {
            points += 20 // Attendance bonus for free events
          } else {
            points += 50 // Attendance bonus for paid events
          }
        }
      }
    })
    
    // Bonus points for favorites (engagement)
    points += favorites.length * 5
    
    // Bonus points for profile completion
    if (profile) {
      if (profile.full_name) points += 10
      if (profile.bio) points += 15
      if (profile.location) points += 10
      if (profile.website) points += 10
    }
    
    return points
  }

  const userPoints = calculateUserPoints()
  const userLevel = Math.floor(userPoints / 100) + 1
  const pointsToNextLevel = ((userLevel) * 100) - userPoints

  // Calculate rewards/benefits based on points
  const getUserTier = () => {
    if (userPoints < 100) return { name: 'Bronze', color: 'bg-orange-700', benefits: 'Access to free events' }
    if (userPoints < 300) return { name: 'Silver', color: 'bg-gray-400', benefits: '5% discount on events' }
    if (userPoints < 600) return { name: 'Gold', color: 'bg-yellow-500', benefits: '10% discount + early access' }
    if (userPoints < 1000) return { name: 'Platinum', color: 'bg-blue-400', benefits: '15% discount + VIP access' }
    return { name: 'Diamond', color: 'bg-purple-500', benefits: '20% discount + exclusive events' }
  }

  const userTier = getUserTier()

  const stats = [
    { label: 'Events Attended', value: upcomingEvents.length, icon: Ticket, color: 'amber' },
    { label: 'Favorites', value: favorites.length, icon: Heart, color: 'red' },
    { label: 'Member Since', value: profile ? new Date(profile.created_at).getFullYear() : new Date().getFullYear(), icon: Calendar, color: 'blue' },
    { label: 'Reward Points', value: userPoints, icon: Trophy, color: 'yellow' }
  ]

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'events', label: 'My Events', icon: Ticket },
    { id: 'favorites', label: 'Favorites', icon: Heart },
    { id: 'activity', label: 'Activity', icon: TrendingUp },
    { id: 'profile', label: 'Edit Profile', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'preferences', label: 'Preferences', icon: Settings }
  ]

  const filteredEvents = upcomingEvents.filter(e => {
    // First filter by search query
    const matchesSearch = e.event?.title?.toLowerCase().includes(searchQuery.toLowerCase())
    
    // Then filter by active sub-tab
    if (activeSubTab === 'upcoming') {
      return matchesSearch && e.event && new Date(e.event.date) >= new Date() && e.status === 'confirmed'
    } else if (activeSubTab === 'past') {
      return matchesSearch && e.event && new Date(e.event.date) < new Date()
    } else if (activeSubTab === 'cancelled') {
      return matchesSearch && e.status === 'cancelled'
    }
    
    // 'all' shows everything
    return matchesSearch
  })

  const filteredFavorites = favorites.filter(f => 
    f.event?.title?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-stone-50 to-white dark:from-stone-950 dark:to-stone-900 pt-32 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" strokeWidth={1.5} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-white dark:from-stone-950 dark:to-stone-900 pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-8 lg:px-16">
        {/* Header with Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative mb-12"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-orange-500/5 to-amber-500/5 rounded-3xl blur-3xl"></div>
          <div className="relative bg-white/50 dark:bg-stone-900/50 backdrop-blur-sm rounded-3xl border border-stone-200 dark:border-stone-800 p-8 lg:p-12">
            <div className="flex flex-col lg:flex-row items-center gap-8">
              {/* Avatar */}
              <div className="relative group">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-amber-500 via-orange-500 to-yellow-500 flex items-center justify-center text-white text-5xl font-light ring-4 ring-amber-500/20 group-hover:ring-amber-500/40 transition-all duration-300">
                  {profile?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                </div>
                <button className="absolute bottom-0 right-0 p-3 bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900 rounded-full hover:scale-110 transition-transform">
                  <Camera className="w-4 h-4" strokeWidth={1.5} />
                </button>
                <div className={`absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 ${userTier.color} text-white text-xs rounded-full font-light shadow-lg`}>
                  {userTier.name} • Level {userLevel}
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 text-center lg:text-left">
                <h1 className="text-4xl lg:text-5xl mb-2 font-light text-stone-900 dark:text-stone-100" style={{ fontFamily: 'Crimson Pro, serif' }}>
                  {profile?.full_name || 'User'}
                </h1>
                <p className="text-stone-600 dark:text-stone-400 font-light mb-4">
                  {user?.email}
                </p>
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mb-6">
                  <span className="px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-light flex items-center gap-2">
                    <Award className="w-4 h-4" strokeWidth={1.5} />
                    {profile?.role || 'Member'}
                  </span>
                  {profile?.location && (
                    <span className="px-4 py-1.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-sm font-light flex items-center gap-2">
                      <MapPin className="w-4 h-4" strokeWidth={1.5} />
                      {profile.location}
                    </span>
                  )}
                  {profile?.website && (
                    <a href={profile.website} target="_blank" rel="noopener noreferrer" className="px-4 py-1.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-sm font-light flex items-center gap-2 hover:bg-amber-100 dark:hover:bg-amber-900/20 transition-colors">
                      <Globe className="w-4 h-4" strokeWidth={1.5} />
                      Website
                    </a>
                  )}
                </div>
                {profile?.bio && (
                  <p className="text-stone-600 dark:text-stone-400 font-light max-w-2xl">
                    {profile.bio}
                  </p>
                )}
              </div>

              {/* Quick Actions */}
              <div className="flex lg:flex-col gap-2">
                <button
                  onClick={() => setSharePanel(true)}
                  className="px-6 py-3 rounded-full bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900 hover:scale-105 transition-transform font-light flex items-center gap-2"
                >
                  <Share2 className="w-4 h-4" strokeWidth={1.5} />
                  Share
                </button>
                <button
                  onClick={exportData}
                  className="px-6 py-3 rounded-full border border-stone-300 dark:border-stone-700 hover:border-amber-500 dark:hover:border-amber-500 transition-colors font-light flex items-center gap-2"
                >
                  <Download className="w-4 h-4" strokeWidth={1.5} />
                  Export
                </button>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8 pt-8 border-t border-stone-200 dark:border-stone-800">
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="text-center p-4 rounded-xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 hover:border-amber-500 dark:hover:border-amber-500 transition-all duration-300 group"
                >
                  <stat.icon className="w-6 h-6 mx-auto mb-2 text-amber-500 group-hover:scale-110 transition-transform" strokeWidth={1.5} />
                  <div className="text-2xl font-light text-stone-900 dark:text-stone-100 mb-1" style={{ fontFamily: 'Crimson Pro, serif' }}>
                    {stat.value}
                  </div>
                  <div className="text-xs text-stone-500 dark:text-stone-400 font-light">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Success/Error Messages */}
        <AnimatePresence>
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl flex items-center gap-3"
            >
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" strokeWidth={1.5} />
              <p className="text-green-700 dark:text-green-300 text-sm font-light">{success}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation Tabs */}
        <div className="mb-8 overflow-x-auto scrollbar-hide">
          <div className="flex gap-2 min-w-max pb-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 rounded-xl transition-all duration-300 flex items-center gap-2 font-light ${
                  activeTab === tab.id
                    ? 'bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900 shadow-lg'
                    : 'bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-stone-800 hover:border-amber-500 dark:hover:border-amber-500'
                }`}
              >
                <tab.icon className="w-4 h-4" strokeWidth={1.5} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="grid lg:grid-cols-3 gap-6"
            >
              {/* Recent Activity */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-6">
                  <h2 className="text-2xl font-light text-stone-900 dark:text-stone-100 mb-6 flex items-center gap-3" style={{ fontFamily: 'Crimson Pro, serif' }}>
                    <Activity className="w-6 h-6 text-amber-500" strokeWidth={1.5} />
                    Recent Activity
                  </h2>
                  <div className="space-y-4">
                    {[
                      { type: 'ticket', title: 'Booked Philosophy Under the Stars', date: '2 days ago', icon: Ticket, color: 'green' },
                      { type: 'favorite', title: 'Added The Art of Deep Listening to favorites', date: '5 days ago', icon: Heart, color: 'red' },
                      { type: 'profile', title: 'Updated profile information', date: '1 week ago', icon: User, color: 'blue' }
                    ].map((activity, i) => (
                      <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 hover:border-amber-500 dark:hover:border-amber-500 transition-colors">
                        <div className={`p-2 rounded-lg bg-${activity.color}-100 dark:bg-${activity.color}-900/20`}>
                          <activity.icon className={`w-5 h-5 text-${activity.color}-600 dark:text-${activity.color}-400`} strokeWidth={1.5} />
                        </div>
                        <div className="flex-1">
                          <p className="text-stone-900 dark:text-stone-100 font-light mb-1">{activity.title}</p>
                          <p className="text-sm text-stone-500 dark:text-stone-400 font-light flex items-center gap-2">
                            <Clock className="w-3 h-3" strokeWidth={1.5} />
                            {activity.date}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Upcoming Events Preview */}
                <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-light text-stone-900 dark:text-stone-100 flex items-center gap-3" style={{ fontFamily: 'Crimson Pro, serif' }}>
                      <Calendar className="w-6 h-6 text-amber-500" strokeWidth={1.5} />
                      Next Event
                    </h2>
                  </div>
                  {upcomingEvents[0] && (
                    <div className="relative group overflow-hidden rounded-xl">
                      <img
                        src={upcomingEvents[0].event?.image_url}
                        alt={upcomingEvents[0].event?.title}
                        className="w-full h-64 object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-6">
                        <h3 className="text-2xl font-light text-white mb-2" style={{ fontFamily: 'Crimson Pro, serif' }}>
                          {upcomingEvents[0].event?.title}
                        </h3>
                        <div className="flex items-center gap-4 text-white/80 text-sm font-light">
                          <span className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" strokeWidth={1.5} />
                            {new Date(upcomingEvents[0].event?.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                          <span className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" strokeWidth={1.5} />
                            {upcomingEvents[0].event?.location}
                          </span>
                        </div>
                        <button className="mt-4 px-6 py-2 rounded-full bg-white text-stone-900 hover:bg-amber-500 hover:text-white transition-colors font-light inline-flex items-center gap-2 w-fit">
                          View Ticket
                          <ChevronRight className="w-4 h-4" strokeWidth={1.5} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Sidebar Stats */}
              <div className="space-y-6">
                {/* Achievements */}
                <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-6">
                  <h3 className="text-xl font-light text-stone-900 dark:text-stone-100 mb-4 flex items-center gap-2" style={{ fontFamily: 'Crimson Pro, serif' }}>
                    <Trophy className="w-5 h-5 text-amber-500" strokeWidth={1.5} />
                    Your Tier
                  </h3>
                  <div className={`${userTier.color} text-white rounded-xl p-4 mb-4`}>
                    <div className="text-2xl font-light mb-2" style={{ fontFamily: 'Crimson Pro, serif' }}>
                      {userTier.name}
                    </div>
                    <p className="text-sm font-light opacity-90">
                      {userTier.benefits}
                    </p>
                  </div>
                  <div className="space-y-3">
                    {[
                      { title: 'Profile Complete', desc: 'Completed your profile', earned: !!(profile?.full_name && profile?.bio), icon: '✅', points: 35 },
                      { title: 'First Booking', desc: 'Booked your first event', earned: upcomingEvents.length > 0, icon: '🎫', points: 10 },
                      { title: 'Event Enthusiast', desc: '5+ events attended', earned: upcomingEvents.filter(e => e.event && new Date(e.event.date) < new Date()).length >= 5, icon: '🌟', points: 50 },
                      { title: 'Curator', desc: '10+ favorites saved', earned: favorites.length >= 10, icon: '❤️', points: 50 }
                    ].map((achievement, i) => (
                      <div key={i} className={`p-3 rounded-lg border transition-all ${
                        achievement.earned 
                          ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800/50' 
                          : 'bg-stone-50 dark:bg-stone-950 border-stone-200 dark:border-stone-800 opacity-50'
                      }`}>
                        <div className="flex items-center gap-3 mb-1">
                          <span className="text-2xl">{achievement.icon}</span>
                          <div className="flex-1">
                            <span className="font-light text-stone-900 dark:text-stone-100 text-sm">{achievement.title}</span>
                            {achievement.earned && (
                              <span className="ml-2 text-xs text-amber-600 dark:text-amber-400">+{achievement.points}pts</span>
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-stone-600 dark:text-stone-400 font-light ml-11">{achievement.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Progress */}
                <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-6">
                  <h3 className="text-xl font-light text-stone-900 dark:text-stone-100 mb-4 flex items-center gap-2" style={{ fontFamily: 'Crimson Pro, serif' }}>
                    <Target className="w-5 h-5 text-amber-500" strokeWidth={1.5} />
                    Your Progress
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-stone-600 dark:text-stone-400 font-light">Level {userLevel} → Level {userLevel + 1}</span>
                        <span className="text-stone-900 dark:text-stone-100 font-light">{userPoints} / {userLevel * 100}</span>
                      </div>
                      <div className="h-2 bg-stone-200 dark:bg-stone-800 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${(userPoints % 100)}%` }}
                          transition={{ duration: 1, delay: 0.5 }}
                          className="h-full bg-gradient-to-r from-amber-500 to-orange-500"
                        />
                      </div>
                    </div>
                    <div className="text-xs text-stone-500 dark:text-stone-400 font-light">
                      {pointsToNextLevel} points to level {userLevel + 1} 🏆
                    </div>
                    <div className="pt-3 border-t border-stone-200 dark:border-stone-800">
                      <p className="text-xs text-stone-600 dark:text-stone-400 font-light mb-2">How to earn points:</p>
                      <ul className="text-xs text-stone-500 dark:text-stone-400 font-light space-y-1">
                        <li>• Free event: 10pts booking + 20pts attendance</li>
                        <li>• Paid event: 1pt/R10 + 50pts attendance</li>
                        <li>• Add favorite: 5pts each</li>
                        <li>• Complete profile: 35pts</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Quick Links */}
                <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl p-6 text-white">
                  <Sparkles className="w-8 h-8 mb-3" strokeWidth={1.5} />
                  <h3 className="text-xl font-light mb-2" style={{ fontFamily: 'Crimson Pro, serif' }}>
                    Invite Friends
                  </h3>
                  <p className="text-sm font-light opacity-90 mb-4">
                    Share your unique referral code and earn rewards!
                  </p>
                  <button 
                    onClick={() => copyToClipboard('INTINT-' + user?.id?.slice(0, 8))}
                    className="w-full px-4 py-2 rounded-lg bg-white text-stone-900 hover:bg-stone-100 transition-colors font-light flex items-center justify-center gap-2"
                  >
                    <Copy className="w-4 h-4" strokeWidth={1.5} />
                    Copy Code
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Events Tab */}
          {activeTab === 'events' && (
            <motion.div
              key="events"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-8">
                {/* Search & Filter Bar */}
                <div className="flex flex-col md:flex-row gap-4 mb-8">
                  <div className="flex-1 relative">
                    <Search className="w-5 h-5 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" strokeWidth={1.5} />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search your events..."
                      className="w-full pl-12 pr-4 py-3 rounded-xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:border-amber-500 font-light"
                    />
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="px-4 py-3 rounded-xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:border-amber-500 font-light"
                    >
                      <option value="date">Sort by Date</option>
                      <option value="title">Sort by Title</option>
                      <option value="location">Sort by Location</option>
                    </select>
                    <button
                      onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                      className="px-4 py-3 rounded-xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 hover:border-amber-500 transition-colors"
                    >
                      {viewMode === 'grid' ? '☰' : '⊞'}
                    </button>
                  </div>
                </div>

                {/* Sub-tabs */}
                <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-hide">
                  {['all', 'upcoming', 'past', 'cancelled'].map((subTab) => (
                    <button
                      key={subTab}
                      onClick={() => setActiveSubTab(subTab)}
                      className={`px-4 py-2 rounded-lg font-light capitalize transition-colors ${
                        activeSubTab === subTab
                          ? 'bg-amber-500 text-white'
                          : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-amber-100 dark:hover:bg-amber-900/20'
                      }`}
                    >
                      {subTab}
                    </button>
                  ))}
                </div>

                {filteredEvents.length === 0 ? (
                  <div className="text-center py-12">
                    <Ticket className="w-16 h-16 text-stone-300 dark:text-stone-700 mx-auto mb-4" strokeWidth={1} />
                    <p className="text-stone-500 dark:text-stone-400 font-light mb-4">No events found</p>
                    <button className="px-6 py-3 rounded-full bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900 hover:bg-stone-800 dark:hover:bg-stone-200 transition-colors font-light inline-flex items-center gap-2">
                      Browse Events
                      <ChevronRight className="w-4 h-4" strokeWidth={1.5} />
                    </button>
                  </div>
                ) : (
                  <div className={viewMode === 'grid' ? 'grid md:grid-cols-2 gap-6' : 'space-y-4'}>
                    {filteredEvents.map((reservation) => (
                      <motion.div
                        key={reservation.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="group relative bg-stone-50 dark:bg-stone-950 rounded-xl border border-stone-200 dark:border-stone-800 overflow-hidden hover:border-amber-500 dark:hover:border-amber-500 transition-all duration-300 hover:shadow-lg"
                      >
                        {reservation.event?.image_url && (
                          <div className="relative h-48 overflow-hidden">
                            <img
                              src={reservation.event.image_url}
                              alt={reservation.event.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-green-500 text-white text-xs font-light flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" strokeWidth={1.5} />
                              Confirmed
                            </div>
                            <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-white/90 dark:bg-stone-900/90 backdrop-blur-sm text-stone-900 dark:text-stone-100 text-xs font-light">
                              {reservation.event.category}
                            </div>
                          </div>
                        )}
                        <div className="p-6">
                          <h3 className="text-xl font-light text-stone-900 dark:text-stone-100 mb-3 group-hover:text-amber-500 transition-colors" style={{ fontFamily: 'Crimson Pro, serif' }}>
                            {reservation.event?.title}
                          </h3>
                          <div className="space-y-2 text-sm text-stone-600 dark:text-stone-400 font-light mb-4">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" strokeWidth={1.5} />
                              {new Date(reservation.event?.date).toLocaleDateString('en-US', { 
                                weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
                              })}
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4" strokeWidth={1.5} />
                              {reservation.event?.start_time} - {reservation.event?.end_time}
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4" strokeWidth={1.5} />
                              {reservation.event?.location}
                            </div>
                            {reservation.ticket_id && (
                              <div className="flex items-center gap-2 font-mono text-xs bg-stone-100 dark:bg-stone-900 p-2 rounded">
                                <Ticket className="w-4 h-4" strokeWidth={1.5} />
                                {reservation.ticket_id}
                                <button
                                  onClick={() => copyToClipboard(reservation.ticket_id)}
                                  className="ml-auto hover:text-amber-500 transition-colors"
                                >
                                  <Copy className="w-3 h-3" strokeWidth={1.5} />
                                </button>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2 pt-4 border-t border-stone-200 dark:border-stone-800">
                            <button
                              onClick={() => setSelectedTicket(reservation)}
                              className="flex-1 px-4 py-2 rounded-lg bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900 hover:bg-stone-800 dark:hover:bg-stone-200 transition-colors text-sm font-light flex items-center justify-center gap-2"
                            >
                              <QrCode className="w-4 h-4" strokeWidth={1.5} />
                              View QR
                            </button>
                            <button className="px-4 py-2 rounded-lg border border-stone-300 dark:border-stone-700 hover:border-amber-500 dark:hover:border-amber-500 transition-colors text-sm font-light">
                              <Share2 className="w-4 h-4" strokeWidth={1.5} />
                            </button>
                            <button className="px-4 py-2 rounded-lg border border-stone-300 dark:border-stone-700 hover:border-amber-500 dark:hover:border-amber-500 transition-colors text-sm font-light">
                              <Printer className="w-4 h-4" strokeWidth={1.5} />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Favorites Tab */}
          {activeTab === 'favorites' && (
            <motion.div
              key="favorites"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-8">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-light text-stone-900 dark:text-stone-100 flex items-center gap-3" style={{ fontFamily: 'Crimson Pro, serif' }}>
                    <Heart className="w-6 h-6 text-red-500" strokeWidth={1.5} />
                    Favorite Events
                  </h2>
                  <div className="relative">
                    <Search className="w-5 h-5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" strokeWidth={1.5} />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search favorites..."
                      className="pl-10 pr-4 py-2 rounded-lg bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:border-amber-500 font-light"
                    />
                  </div>
                </div>

                {filteredFavorites.length === 0 ? (
                  <div className="text-center py-12">
                    <Heart className="w-16 h-16 text-stone-300 dark:text-stone-700 mx-auto mb-4" strokeWidth={1} />
                    <p className="text-stone-500 dark:text-stone-400 font-light mb-4">No favorites yet</p>
                    <button className="px-6 py-3 rounded-full bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900 hover:bg-stone-800 dark:hover:bg-stone-200 transition-colors font-light inline-flex items-center gap-2">
                      Discover Events
                      <ChevronRight className="w-4 h-4" strokeWidth={1.5} />
                    </button>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredFavorites.map((favorite) => (
                      <motion.div
                        key={favorite.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="group relative rounded-xl overflow-hidden border border-stone-200 dark:border-stone-800 hover:border-amber-500 dark:hover:border-amber-500 transition-all duration-300 hover:shadow-lg"
                      >
                        {favorite.event?.image_url && (
                          <div className="relative h-56 overflow-hidden">
                            <img
                              src={favorite.event.image_url}
                              alt={favorite.event.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <button className="absolute top-4 right-4 p-2 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors shadow-lg">
                              <Heart className="w-4 h-4 fill-current" strokeWidth={1.5} />
                            </button>
                          </div>
                        )}
                        <div className="p-4 bg-white dark:bg-stone-950">
                          <h3 className="text-lg font-light text-stone-900 dark:text-stone-100 mb-2 line-clamp-2 group-hover:text-amber-500 transition-colors" style={{ fontFamily: 'Crimson Pro, serif' }}>
                            {favorite.event?.title}
                          </h3>
                          <div className="space-y-1 text-sm text-stone-600 dark:text-stone-400 font-light mb-3">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-3 h-3" strokeWidth={1.5} />
                              {new Date(favorite.event?.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="w-3 h-3" strokeWidth={1.5} />
                              {favorite.event?.location}
                            </div>
                          </div>
                          <button className="w-full px-4 py-2 rounded-lg bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900 hover:bg-stone-800 dark:hover:bg-stone-200 transition-colors text-sm font-light flex items-center justify-center gap-2">
                            View Details
                            <ExternalLink className="w-3 h-3" strokeWidth={1.5} />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Activity Tab */}
          {activeTab === 'activity' && (
            <motion.div
              key="activity"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="grid lg:grid-cols-3 gap-6"
            >
              {/* Activity Timeline */}
              <div className="lg:col-span-2 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-8">
                <h2 className="text-2xl font-light text-stone-900 dark:text-stone-100 mb-8 flex items-center gap-3" style={{ fontFamily: 'Crimson Pro, serif' }}>
                  <Activity className="w-6 h-6 text-amber-500" strokeWidth={1.5} />
                  Activity Timeline
                </h2>
                <div className="space-y-6 relative before:absolute before:left-4 before:top-0 before:bottom-0 before:w-px before:bg-gradient-to-b before:from-amber-500 before:via-orange-500 before:to-amber-500">
                  {[
                    { type: 'ticket', title: 'Booked Philosophy Under the Stars', desc: 'Confirmed reservation for Nov 15, 2025', date: '2 days ago', icon: Ticket, color: 'green' },
                    { type: 'favorite', title: 'Added to favorites', desc: 'The Art of Deep Listening', date: '5 days ago', icon: Heart, color: 'red' },
                    { type: 'profile', title: 'Profile updated', desc: 'Updated bio and location', date: '1 week ago', icon: User, color: 'blue' },
                    { type: 'achievement', title: 'Achievement unlocked', desc: 'Social Butterfly - Attended 5+ events', date: '2 weeks ago', icon: Trophy, color: 'yellow' },
                    { type: 'share', title: 'Shared event', desc: 'Shared "Mindful Conversations" with friends', date: '3 weeks ago', icon: Share2, color: 'purple' }
                  ].map((activity, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex gap-4 relative"
                    >
                      <div className={`relative z-10 p-3 rounded-xl bg-${activity.color}-100 dark:bg-${activity.color}-900/20 border-2 border-white dark:border-stone-900`}>
                        <activity.icon className={`w-5 h-5 text-${activity.color}-600 dark:text-${activity.color}-400`} strokeWidth={1.5} />
                      </div>
                      <div className="flex-1 pb-8">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-lg font-light text-stone-900 dark:text-stone-100">{activity.title}</h3>
                          <span className="text-xs text-stone-500 dark:text-stone-400 font-light">{activity.date}</span>
                        </div>
                        <p className="text-sm text-stone-600 dark:text-stone-400 font-light">{activity.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

                              {/* Stats & Insights */}
              <div className="space-y-6">
                <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-6">
                  <h3 className="text-xl font-light text-stone-900 dark:text-stone-100 mb-6 flex items-center gap-2" style={{ fontFamily: 'Crimson Pro, serif' }}>
                    <BarChart3 className="w-5 h-5 text-amber-500" strokeWidth={1.5} />
                    Your Stats
                  </h3>
                  <div className="space-y-4">
                    {[
                      { label: 'Total Reservations', value: upcomingEvents.length, change: `+${upcomingEvents.filter(e => {
                        const bookingDate = new Date(e.created_at)
                        const monthAgo = new Date()
                        monthAgo.setMonth(monthAgo.getMonth() - 1)
                        return bookingDate > monthAgo
                      }).length}` },
                      { label: 'This Month', value: upcomingEvents.filter(e => {
                        const eventDate = new Date(e.event?.date)
                        const now = new Date()
                        return eventDate.getMonth() === now.getMonth() && eventDate.getFullYear() === now.getFullYear()
                      }).length, change: 'events' },
                      { label: 'Total Spent', value: `R${upcomingEvents.reduce((sum, e) => sum + (e.payment_amount || 0), 0).toFixed(0)}`, change: userTier.benefits.includes('%') ? userTier.benefits.split(' ')[0] + ' off' : '' }
                    ].map((stat, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-stone-50 dark:bg-stone-950">
                        <span className="text-sm text-stone-600 dark:text-stone-400 font-light">{stat.label}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-light text-stone-900 dark:text-stone-100" style={{ fontFamily: 'Crimson Pro, serif' }}>{stat.value}</span>
                          {stat.change && <span className="text-xs text-green-600 dark:text-green-400 font-light">{stat.change}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-6 text-white">
                  <Gift className="w-8 h-8 mb-3" strokeWidth={1.5} />
                  <h3 className="text-xl font-light mb-2" style={{ fontFamily: 'Crimson Pro, serif' }}>
                    {userTier.name} Benefits
                  </h3>
                  <p className="text-sm font-light opacity-90 mb-4">
                    {userTier.benefits}
                  </p>
                  <div className="bg-white/20 rounded-lg p-3 mb-4">
                    <p className="text-xs font-light mb-1">Your Points</p>
                    <p className="text-2xl font-light" style={{ fontFamily: 'Crimson Pro, serif' }}>{userPoints}</p>
                  </div>
                  <button 
                    onClick={() => setActiveTab('rewards')}
                    className="w-full px-4 py-2 rounded-lg bg-white text-purple-600 hover:bg-stone-100 transition-colors font-light flex items-center justify-center gap-2"
                  >
                    View All Benefits
                    <ChevronRight className="w-4 h-4" strokeWidth={1.5} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Edit Profile Tab */}
          {activeTab === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-8"
            >
              <h2 className="text-2xl font-light text-stone-900 dark:text-stone-100 mb-8" style={{ fontFamily: 'Crimson Pro, serif' }}>
                Edit Profile
              </h2>

              <form onSubmit={handleProfileUpdate} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-light text-stone-700 dark:text-stone-300 mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="w-5 h-5 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" strokeWidth={1.5} />
                      <input
                        type="text"
                        value={profileForm.full_name}
                        onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
                        className="w-full pl-12 pr-4 py-3 rounded-xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:border-amber-500 font-light"
                        placeholder="Your full name"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-light text-stone-700 dark:text-stone-300 mb-2">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="w-5 h-5 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" strokeWidth={1.5} />
                      <input
                        type="tel"
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                        className="w-full pl-12 pr-4 py-3 rounded-xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:border-amber-500 font-light"
                        placeholder="+27 123 456 7890"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-light text-stone-700 dark:text-stone-300 mb-2">
                    Bio
                  </label>
                  <div className="relative">
                    <MessageSquare className="w-5 h-5 text-stone-400 absolute left-4 top-4" strokeWidth={1.5} />
                    <textarea
                      value={profileForm.bio}
                      onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                      rows={4}
                      className="w-full pl-12 pr-4 py-3 rounded-xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:border-amber-500 font-light resize-none"
                      placeholder="Tell us about yourself..."
                    />
                  </div>
                  <p className="text-xs text-stone-500 dark:text-stone-400 font-light mt-2">
                    {profileForm.bio.length} / 500 characters
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-light text-stone-700 dark:text-stone-300 mb-2">
                      Location
                    </label>
                    <div className="relative">
                      <MapPin className="w-5 h-5 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" strokeWidth={1.5} />
                      <input
                        type="text"
                        value={profileForm.location}
                        onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}
                        className="w-full pl-12 pr-4 py-3 rounded-xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:border-amber-500 font-light"
                        placeholder="City, Country"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-light text-stone-700 dark:text-stone-300 mb-2">
                      Website
                    </label>
                    <div className="relative">
                      <Globe className="w-5 h-5 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" strokeWidth={1.5} />
                      <input
                        type="url"
                        value={profileForm.website}
                        onChange={(e) => setProfileForm({ ...profileForm, website: e.target.value })}
                        className="w-full pl-12 pr-4 py-3 rounded-xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:border-amber-500 font-light"
                        placeholder="https://yourwebsite.com"
                      />
                    </div>
                  </div>
                </div>

                {/* Social Links */}
                <div>
                  <label className="block text-sm font-light text-stone-700 dark:text-stone-300 mb-4">
                    Social Links
                  </label>
                  <div className="grid md:grid-cols-2 gap-4">
                    {[
                      { icon: Instagram, name: 'instagram', placeholder: '@username' },
                      { icon: Twitter, name: 'twitter', placeholder: '@username' },
                      { icon: Linkedin, name: 'linkedin', placeholder: 'linkedin.com/in/username' },
                      { icon: Facebook, name: 'facebook', placeholder: 'facebook.com/username' }
                    ].map((social) => (
                      <div key={social.name} className="relative">
                        <social.icon className="w-5 h-5 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" strokeWidth={1.5} />
                        <input
                          type="text"
                          value={profileForm[social.name]}
                          onChange={(e) => setProfileForm({ ...profileForm, [social.name]: e.target.value })}
                          className="w-full pl-12 pr-4 py-3 rounded-xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:border-amber-500 font-light"
                          placeholder={social.placeholder}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6 border-t border-stone-200 dark:border-stone-800">
                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full md:w-auto px-8 py-3 rounded-full bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900 hover:bg-stone-800 dark:hover:bg-stone-200 transition-colors font-light disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" strokeWidth={1.5} />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" strokeWidth={1.5} />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <motion.div
              key="security"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* Change Password */}
              <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-8">
                <h2 className="text-2xl font-light text-stone-900 dark:text-stone-100 mb-6 flex items-center gap-3" style={{ fontFamily: 'Crimson Pro, serif' }}>
                  <Lock className="w-6 h-6 text-amber-500" strokeWidth={1.5} />
                  Change Password
                </h2>

                <form onSubmit={handlePasswordChange} className="space-y-6">
                  <div>
                    <label className="block text-sm font-light text-stone-700 dark:text-stone-300 mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <Lock className="w-5 h-5 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" strokeWidth={1.5} />
                      <input
                        type={showPasswords.new ? 'text' : 'password'}
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                        className="w-full pl-12 pr-12 py-3 rounded-xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:border-amber-500 font-light"
                        placeholder="Enter new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                      >
                        {showPasswords.new ? <EyeOff className="w-5 h-5" strokeWidth={1.5} /> : <Eye className="w-5 h-5" strokeWidth={1.5} />}
                      </button>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1 h-1 bg-stone-200 dark:bg-stone-800 rounded-full overflow-hidden">
                        <div className={`h-full transition-all duration-300 ${
                          passwordForm.newPassword.length === 0 ? 'w-0' :
                          passwordForm.newPassword.length < 6 ? 'w-1/4 bg-red-500' :
                          passwordForm.newPassword.length < 8 ? 'w-1/2 bg-yellow-500' :
                          passwordForm.newPassword.length < 12 ? 'w-3/4 bg-blue-500' :
                          'w-full bg-green-500'
                        }`} />
                      </div>
                      <span className="text-xs text-stone-500 dark:text-stone-400 font-light">
                        {passwordForm.newPassword.length === 0 ? 'Weak' :
                         passwordForm.newPassword.length < 6 ? 'Weak' :
                         passwordForm.newPassword.length < 8 ? 'Fair' :
                         passwordForm.newPassword.length < 12 ? 'Good' : 'Strong'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-light text-stone-700 dark:text-stone-300 mb-2">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <Lock className="w-5 h-5 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" strokeWidth={1.5} />
                      <input
                        type={showPasswords.confirm ? 'text' : 'password'}
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                        className="w-full pl-12 pr-12 py-3 rounded-xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:border-amber-500 font-light"
                        placeholder="Confirm new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                      >
                        {showPasswords.confirm ? <EyeOff className="w-5 h-5" strokeWidth={1.5} /> : <Eye className="w-5 h-5" strokeWidth={1.5} />}
                      </button>
                    </div>
                  </div>

                  {errors.password && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                      <p className="text-red-600 dark:text-red-400 text-sm font-light">{errors.password}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full md:w-auto px-8 py-3 rounded-full bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900 hover:bg-stone-800 dark:hover:bg-stone-200 transition-colors font-light disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" strokeWidth={1.5} />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Shield className="w-4 h-4" strokeWidth={1.5} />
                        Update Password
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Email & Verification */}
              <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-8">
                <h2 className="text-2xl font-light text-stone-900 dark:text-stone-100 mb-6 flex items-center gap-3" style={{ fontFamily: 'Crimson Pro, serif' }}>
                  <Mail className="w-6 h-6 text-amber-500" strokeWidth={1.5} />
                  Email & Verification
                </h2>
                <div className="space-y-4">
                  <div className="p-4 bg-stone-50 dark:bg-stone-950 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <MailIcon className="w-5 h-5 text-stone-400" strokeWidth={1.5} />
                        <span className="text-stone-900 dark:text-stone-100 font-light">{user?.email}</span>
                        {user?.email_confirmed_at && (
                          <span className="px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-xs font-light flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" strokeWidth={1.5} />
                            Verified
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Two-Factor Authentication */}
                  <div className="p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/50 rounded-xl">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-light text-stone-900 dark:text-stone-100 mb-2 flex items-center gap-2">
                          <Shield className="w-5 h-5 text-amber-600 dark:text-amber-400" strokeWidth={1.5} />
                          Two-Factor Authentication
                        </h3>
                        <p className="text-sm text-stone-600 dark:text-stone-400 font-light mb-3">
                          Add an extra layer of security to your account
                        </p>
                      </div>
                      <button className="px-6 py-2 rounded-lg bg-amber-500 text-white hover:bg-amber-600 transition-colors font-light text-sm">
                        Enable 2FA
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Active Sessions */}
              <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-8">
                <h2 className="text-2xl font-light text-stone-900 dark:text-stone-100 mb-6 flex items-center gap-3" style={{ fontFamily: 'Crimson Pro, serif' }}>
                  <Activity className="w-6 h-6 text-amber-500" strokeWidth={1.5} />
                  Active Sessions
                </h2>
                <div className="space-y-3">
                  {[
                    { device: 'Chrome on macOS', location: 'Cape Town, South Africa', active: true, date: 'Active now' },
                    { device: 'Safari on iPhone', location: 'Cape Town, South Africa', active: false, date: '2 hours ago' }
                  ].map((session, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-stone-50 dark:bg-stone-950 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-stone-100 dark:bg-stone-900 rounded-lg">
                          <Briefcase className="w-5 h-5 text-stone-600 dark:text-stone-400" strokeWidth={1.5} />
                        </div>
                        <div>
                          <p className="text-sm font-light text-stone-900 dark:text-stone-100">{session.device}</p>
                          <p className="text-xs text-stone-500 dark:text-stone-400 font-light">{session.location} • {session.date}</p>
                        </div>
                      </div>
                      {session.active ? (
                        <span className="px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-xs font-light">
                          Active
                        </span>
                      ) : (
                        <button className="text-sm text-red-600 dark:text-red-400 hover:underline font-light">
                          Revoke
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Preferences Tab */}
          {activeTab === 'preferences' && (
            <motion.div
              key="preferences"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* Notifications */}
              <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-8">
                <h2 className="text-2xl font-light text-stone-900 dark:text-stone-100 mb-6 flex items-center gap-3" style={{ fontFamily: 'Crimson Pro, serif' }}>
                  <Bell className="w-6 h-6 text-amber-500" strokeWidth={1.5} />
                  Notification Preferences
                </h2>
                <div className="space-y-4">
                  {[
                    { id: 'emailNotifications', label: 'Email Notifications', desc: 'Receive email updates about your events' },
                    { id: 'eventReminders', label: 'Event Reminders', desc: 'Get reminders before your events start' },
                    { id: 'newsletter', label: 'Newsletter', desc: 'Receive our weekly newsletter' },
                    { id: 'marketingEmails', label: 'Marketing Emails', desc: 'Receive promotional offers and updates' }
                  ].map((pref) => (
                    <div key={pref.id} className="flex items-center justify-between p-4 bg-stone-50 dark:bg-stone-950 rounded-xl">
                      <div className="flex-1">
                        <p className="text-sm font-light text-stone-900 dark:text-stone-100 mb-1">{pref.label}</p>
                        <p className="text-xs text-stone-500 dark:text-stone-400 font-light">{pref.desc}</p>
                      </div>
                      <button
                        onClick={() => setPreferencesForm({ ...preferencesForm, [pref.id]: !preferencesForm[pref.id] })}
                        className={`relative w-12 h-6 rounded-full transition-colors ${
                          preferencesForm[pref.id] ? 'bg-amber-500' : 'bg-stone-300 dark:bg-stone-700'
                        }`}
                      >
                        <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                          preferencesForm[pref.id] ? 'translate-x-6' : 'translate-x-0'
                        }`} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Appearance */}
              <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-8">
                <h2 className="text-2xl font-light text-stone-900 dark:text-stone-100 mb-6 flex items-center gap-3" style={{ fontFamily: 'Crimson Pro, serif' }}>
                  <Palette className="w-6 h-6 text-amber-500" strokeWidth={1.5} />
                  Appearance
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-stone-50 dark:bg-stone-950 rounded-xl">
                    <div className="flex-1">
                      <p className="text-sm font-light text-stone-900 dark:text-stone-100 mb-1">Theme</p>
                      <p className="text-xs text-stone-500 dark:text-stone-400 font-light">Choose your preferred color theme</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setTheme('light')}
                        className={`p-2 rounded-lg border-2 transition-all ${
                          theme === 'light' 
                            ? 'border-amber-500 bg-amber-50' 
                            : 'border-stone-200 dark:border-stone-800'
                        }`}
                      >
                        <Sun className="w-5 h-5 text-amber-500" strokeWidth={1.5} />
                      </button>
                      <button
                        onClick={() => setTheme('dark')}
                        className={`p-2 rounded-lg border-2 transition-all ${
                          theme === 'dark' 
                            ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20' 
                            : 'border-stone-200 dark:border-stone-800'
                        }`}
                      >
                        <Moon className="w-5 h-5 text-stone-600 dark:text-stone-400" strokeWidth={1.5} />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-stone-50 dark:bg-stone-950 rounded-xl">
                    <div className="flex-1">
                      <p className="text-sm font-light text-stone-900 dark:text-stone-100 mb-1">Sound Effects</p>
                      <p className="text-xs text-stone-500 dark:text-stone-400 font-light">Enable interface sound effects</p>
                    </div>
                    <button
                      onClick={() => setPreferencesForm({ ...preferencesForm, soundEffects: !preferencesForm.soundEffects })}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        preferencesForm.soundEffects ? 'bg-amber-500' : 'bg-stone-300 dark:bg-stone-700'
                      }`}
                    >
                      <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                        preferencesForm.soundEffects ? 'translate-x-6' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-stone-50 dark:bg-stone-950 rounded-xl">
                    <div className="flex-1">
                      <p className="text-sm font-light text-stone-900 dark:text-stone-100 mb-1">Accessibility Mode</p>
                      <p className="text-xs text-stone-500 dark:text-stone-400 font-light">Enhanced contrast and larger text</p>
                    </div>
                    <button
                      onClick={() => setPreferencesForm({ ...preferencesForm, accessibility: !preferencesForm.accessibility })}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        preferencesForm.accessibility ? 'bg-amber-500' : 'bg-stone-300 dark:bg-stone-700'
                      }`}
                    >
                      <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                        preferencesForm.accessibility ? 'translate-x-6' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Data & Privacy */}
              <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-8">
                <h2 className="text-2xl font-light text-stone-900 dark:text-stone-100 mb-6 flex items-center gap-3" style={{ fontFamily: 'Crimson Pro, serif' }}>
                  <Download className="w-6 h-6 text-amber-500" strokeWidth={1.5} />
                  Data & Privacy
                </h2>
                <div className="space-y-4">
                  <div className="flex items-start justify-between p-4 bg-stone-50 dark:bg-stone-950 rounded-xl">
                    <div className="flex-1">
                      <h3 className="text-lg font-light text-stone-900 dark:text-stone-100 mb-2">Export Your Data</h3>
                      <p className="text-sm text-stone-600 dark:text-stone-400 font-light">
                        Download a copy of your profile, reservations, and favorites
                      </p>
                    </div>
                    <button
                      onClick={exportData}
                      className="px-6 py-3 rounded-full bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900 hover:bg-stone-800 dark:hover:bg-stone-200 transition-colors font-light flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" strokeWidth={1.5} />
                      Export
                    </button>
                  </div>

                  <div className="flex items-start justify-between p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                    <div className="flex-1">
                      <h3 className="text-lg font-light text-red-700 dark:text-red-400 mb-2 flex items-center gap-2">
                        <Trash2 className="w-5 h-5" strokeWidth={1.5} />
                        Delete Account
                      </h3>
                      <p className="text-sm text-stone-600 dark:text-stone-400 font-light mb-4">
                        Permanently delete your account and all associated data. This action cannot be undone.
                      </p>
                      {deleteConfirm && (
                        <div className="bg-white dark:bg-stone-900 border border-red-300 dark:border-red-800 rounded-lg p-4 mb-4">
                          <p className="text-sm text-red-700 dark:text-red-300 font-light mb-3">
                            Are you absolutely sure? This will permanently delete:
                          </p>
                          <ul className="text-sm text-red-600 dark:text-red-400 font-light space-y-1 list-disc list-inside">
                            <li>Your profile and personal information</li>
                            <li>All event reservations and tickets</li>
                            <li>Your favorites and preferences</li>
                            <li>Activity history and achievements</li>
                          </ul>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      {!deleteConfirm ? (
                        <button
                          onClick={() => setDeleteConfirm(true)}
                          className="px-6 py-3 rounded-full bg-red-600 text-white hover:bg-red-700 transition-colors font-light flex items-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                          Delete
                        </button>
                      ) : (
                        <>
                          <button
                            disabled={saving}
                            className="px-6 py-3 rounded-full bg-red-600 text-white hover:bg-red-700 transition-colors font-light flex items-center gap-2 disabled:opacity-50"
                          >
                            {saving ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" strokeWidth={1.5} />
                                Deleting...
                              </>
                            ) : (
                              <>
                                <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                                Confirm
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(false)}
                            className="px-6 py-3 rounded-full border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors font-light"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* QR Code Modal */}
        <AnimatePresence>
          {selectedTicket && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedTicket(null)}
              className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-stone-900 rounded-3xl p-8 max-w-md w-full border border-stone-200 dark:border-stone-800"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-light" style={{ fontFamily: 'Crimson Pro, serif' }}>
                    Your Ticket
                  </h3>
                  <button
                    onClick={() => setSelectedTicket(null)}
                    className="p-2 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" strokeWidth={1.5} />
                  </button>
                </div>

                <div className="text-center">
                  <div className="w-64 h-64 mx-auto bg-white rounded-2xl p-4 mb-6 border-2 border-stone-200">
                    <div className="w-full h-full bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl flex items-center justify-center">
                      <QrCode className="w-32 h-32 text-amber-500" strokeWidth={1} />
                    </div>
                  </div>

                  <div className="space-y-3 text-left bg-stone-50 dark:bg-stone-950 rounded-xl p-6 mb-6">
                    <div>
                      <p className="text-xs text-stone-500 dark:text-stone-400 font-light mb-1">Event</p>
                      <p className="text-sm font-light text-stone-900 dark:text-stone-100">{selectedTicket.event?.title}</p>
                    </div>
                    <div>
                      <p className="text-xs text-stone-500 dark:text-stone-400 font-light mb-1">Ticket ID</p>
                      <p className="text-sm font-mono font-light text-stone-900 dark:text-stone-100">{selectedTicket.ticket_id}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-stone-500 dark:text-stone-400 font-light mb-1">Date</p>
                        <p className="text-sm font-light text-stone-900 dark:text-stone-100">
                          {new Date(selectedTicket.event?.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-stone-500 dark:text-stone-400 font-light mb-1">Time</p>
                        <p className="text-sm font-light text-stone-900 dark:text-stone-100">{selectedTicket.event?.start_time}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button className="flex-1 px-4 py-3 rounded-full border border-stone-300 dark:border-stone-700 hover:border-amber-500 dark:hover:border-amber-500 transition-colors font-light flex items-center justify-center gap-2">
                      <Share2 className="w-4 h-4" strokeWidth={1.5} />
                      Share
                    </button>
                    <button className="flex-1 px-4 py-3 rounded-full bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900 hover:bg-stone-800 dark:hover:bg-stone-200 transition-colors font-light flex items-center justify-center gap-2">
                      <Printer className="w-4 h-4" strokeWidth={1.5} />
                      Print
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Share Panel */}
        <AnimatePresence>
          {sharePanel && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSharePanel(false)}
              className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-stone-900 rounded-3xl p-8 max-w-md w-full border border-stone-200 dark:border-stone-800"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-light" style={{ fontFamily: 'Crimson Pro, serif' }}>
                    Share Profile
                  </h3>
                  <button
                    onClick={() => setSharePanel(false)}
                    className="p-2 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" strokeWidth={1.5} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-stone-50 dark:bg-stone-950 rounded-xl">
                    <p className="text-xs text-stone-500 dark:text-stone-400 font-light mb-2">Profile Link</p>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={`intellectualintimacy.co.za/profile/${user?.id}`}
                        readOnly
                        className="flex-1 px-3 py-2 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg text-sm font-light text-stone-900 dark:text-stone-100"
                      />
                      <button
                        onClick={() => copyToClipboard(`intellectualintimacy.co.za/profile/${user?.id}`)}
                        className="p-2 hover:bg-stone-200 dark:hover:bg-stone-800 rounded-lg transition-colors"
                      >
                        <Copy className="w-4 h-4" strokeWidth={1.5} />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-3">
                    {[
                      { icon: Twitter, label: 'Twitter', color: 'bg-blue-500' },
                      { icon: Facebook, label: 'Facebook', color: 'bg-blue-600' },
                      { icon: Linkedin, label: 'LinkedIn', color: 'bg-blue-700' },
                      { icon: Instagram, label: 'Instagram', color: 'bg-pink-500' }
                    ].map((social) => (
                      <button
                        key={social.label}
                        className={`p-4 ${social.color} text-white rounded-xl hover:scale-105 transition-transform flex flex-col items-center gap-2`}
                      >
                        <social.icon className="w-6 h-6" strokeWidth={1.5} />
                        <span className="text-xs font-light">{social.label}</span>
                      </button>
                    ))}
                  </div>

                  <button className="w-full px-6 py-3 rounded-full bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900 hover:bg-stone-800 dark:hover:bg-stone-200 transition-colors font-light flex items-center justify-center gap-2">
                    <QrCode className="w-4 h-4" strokeWidth={1.5} />
                    Generate QR Code
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}