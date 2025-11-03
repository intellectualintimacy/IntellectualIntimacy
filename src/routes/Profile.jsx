// src/pages/Profile.jsx
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  User, Mail, MapPin, Globe, Camera, Save, X, 
  Loader2, CheckCircle, AlertCircle, Lock, Eye, EyeOff,
  Calendar, Heart, Ticket, Bell, Shield, Trash2, Download,
  Edit2, Phone, MessageSquare, Link as LinkIcon, ChevronRight
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useNavigate } from 'react-router-dom'

export default function Profile() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [activeTab, setActiveTab] = useState('profile')
  const [notifications, setNotifications] = useState([])
  const [upcomingEvents, setUpcomingEvents] = useState([])
  const [favorites, setFavorites] = useState([])
  
  // Form states
  const [profileForm, setProfileForm] = useState({
    full_name: '',
    bio: '',
    location: '',
    website: '',
    phone: ''
  })
  
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })
  
  const [errors, setErrors] = useState({})
  const [success, setSuccess] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState(false)

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    if (user) {
      loadProfile()
      loadUserData()
    }
  }, [user])

  const checkAuth = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) {
        navigate('/login')
        return
      }
      setUser(authUser)
    } catch (error) {
      console.error('Auth error:', error)
      navigate('/login')
    }
  }

  const loadProfile = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) throw error

      setProfile(data)
      setProfileForm({
        full_name: data.full_name || '',
        bio: data.bio || '',
        location: data.location || '',
        website: data.website || '',
        phone: ''
      })
    } catch (error) {
      console.error('Error loading profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadUserData = async () => {
    try {
      // Load upcoming reservations
      const { data: reservations } = await supabase
        .from('reservations')
        .select(`
          *,
          event:events(*)
        `)
        .eq('user_email', user.email)
        .eq('status', 'confirmed')
        .gte('event.date', new Date().toISOString().split('T')[0])
        .order('event.date', { ascending: true })

      setUpcomingEvents(reservations || [])

      // Load favorites
      const { data: favData } = await supabase
        .from('favorites')
        .select(`
          *,
          event:events(*)
        `)
        .eq('user_email', user.email)

      setFavorites(favData || [])
    } catch (error) {
      console.error('Error loading user data:', error)
    }
  }

  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    setSaving(true)
    setErrors({})
    setSuccess('')

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profileForm.full_name,
          bio: profileForm.bio,
          location: profileForm.location,
          website: profileForm.website,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (error) throw error

      setSuccess('Profile updated successfully!')
      loadProfile()
      
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

    // Validate passwords
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
      const { error } = await supabase.auth.updateUser({
        password: passwordForm.newPassword
      })

      if (error) throw error

      setSuccess('Password updated successfully!')
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
      
      setTimeout(() => setSuccess(''), 3000)
    } catch (error) {
      setErrors({ password: error.message })
    } finally {
      setSaving(false)
    }
  }

  const handleEmailUpdate = async (newEmail) => {
    setSaving(true)
    setErrors({})
    
    try {
      const { error } = await supabase.auth.updateUser({ email: newEmail })
      if (error) throw error
      
      setSuccess('Verification email sent to new address. Please check your inbox.')
      setTimeout(() => setSuccess(''), 5000)
    } catch (error) {
      setErrors({ email: error.message })
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!deleteConfirm) {
      setDeleteConfirm(true)
      return
    }

    try {
      setSaving(true)
      
      // Delete user data
      await supabase.from('favorites').delete().eq('user_email', user.email)
      await supabase.from('reservations').update({ status: 'cancelled' }).eq('user_email', user.email)
      await supabase.from('profiles').delete().eq('id', user.id)
      
      // Delete auth user
      const { error } = await supabase.auth.admin.deleteUser(user.id)
      if (error) throw error

      await supabase.auth.signOut()
      navigate('/')
    } catch (error) {
      setErrors({ delete: error.message })
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

  const removeFavorite = async (favoriteId) => {
    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('id', favoriteId)

      if (error) throw error

      setFavorites(favorites.filter(f => f.id !== favoriteId))
      setSuccess('Removed from favorites')
      setTimeout(() => setSuccess(''), 2000)
    } catch (error) {
      console.error('Error removing favorite:', error)
    }
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'events', label: 'My Events', icon: Ticket },
    { id: 'favorites', label: 'Favorites', icon: Heart },
    { id: 'settings', label: 'Settings', icon: Bell }
  ]

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-stone-50 to-white dark:from-stone-950 dark:to-stone-900 pt-32 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" strokeWidth={1.5} />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-stone-50 to-white dark:from-stone-950 dark:to-stone-900 pt-32 pb-20">
      <div className="max-w-6xl mx-auto px-8 lg:px-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="w-16 h-px bg-gradient-to-r from-transparent via-amber-500 to-transparent mx-auto mb-8"></div>
          <h1 className="text-5xl lg:text-6xl mb-4 font-light text-stone-900 dark:text-stone-100" style={{ fontFamily: 'Crimson Pro, serif' }}>
            My <span className="bg-gradient-to-r from-amber-500 to-yellow-500 bg-clip-text text-transparent">Profile</span>
          </h1>
          <p className="text-stone-600 dark:text-stone-400 font-light">
            Manage your account and preferences
          </p>
        </motion.div>

        {/* Success/Error Messages */}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl flex items-center gap-3"
          >
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" strokeWidth={1.5} />
            <p className="text-green-700 dark:text-green-300 text-sm font-light">{success}</p>
          </motion.div>
        )}

        {errors.submit && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" strokeWidth={1.5} />
            <p className="text-red-700 dark:text-red-300 text-sm font-light">{errors.submit}</p>
          </motion.div>
        )}

        {/* Profile Card & Navigation */}
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-6 sticky top-32">
              {/* Avatar */}
              <div className="text-center mb-6">
                <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white text-3xl font-light mb-4">
                  {profile?.full_name?.[0] || user?.email?.[0].toUpperCase()}
                </div>
                <h3 className="text-lg font-light text-stone-900 dark:text-stone-100 mb-1" style={{ fontFamily: 'Crimson Pro, serif' }}>
                  {profile?.full_name || 'User'}
                </h3>
                <p className="text-sm text-stone-500 dark:text-stone-400 font-light truncate">
                  {user?.email}
                </p>
                <span className="inline-block mt-3 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 text-xs font-light">
                  {profile?.role || 'Member'}
                </span>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-6 py-4 border-y border-stone-200 dark:border-stone-800">
                <div className="text-center">
                  <div className="text-2xl font-light text-stone-900 dark:text-stone-100" style={{ fontFamily: 'Crimson Pro, serif' }}>
                    {upcomingEvents.length}
                  </div>
                  <div className="text-xs text-stone-500 dark:text-stone-400 font-light">Events</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-light text-stone-900 dark:text-stone-100" style={{ fontFamily: 'Crimson Pro, serif' }}>
                    {favorites.length}
                  </div>
                  <div className="text-xs text-stone-500 dark:text-stone-400 font-light">Favorites</div>
                </div>
              </div>

              {/* Navigation */}
              <nav className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 text-left ${
                      activeTab === tab.id
                        ? 'bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900'
                        : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" strokeWidth={1.5} />
                    <span className="text-sm font-light">{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-8"
              >
                <h2 className="text-2xl font-light text-stone-900 dark:text-stone-100 mb-6" style={{ fontFamily: 'Crimson Pro, serif' }}>
                  Profile Information
                </h2>

                <form onSubmit={handleProfileUpdate} className="space-y-6">
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

                  <div className="pt-4">
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
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                {/* Change Password */}
                <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-8">
                  <h2 className="text-2xl font-light text-stone-900 dark:text-stone-100 mb-6" style={{ fontFamily: 'Crimson Pro, serif' }}>
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
                          onChange={(e) => setPasswordForm({ ...profileForm, confirmPassword: e.target.value })}
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
                      <p className="text-red-600 dark:text-red-400 text-sm font-light">{errors.password}</p>
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

                {/* Email */}
                <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-8">
                  <h2 className="text-2xl font-light text-stone-900 dark:text-stone-100 mb-6" style={{ fontFamily: 'Crimson Pro, serif' }}>
                    Email Address
                  </h2>
                  <div className="flex items-center justify-between p-4 bg-stone-50 dark:bg-stone-950 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-stone-400" strokeWidth={1.5} />
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
              </motion.div>
            )}

            {/* Events Tab */}
            {activeTab === 'events' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-8"
              >
                <h2 className="text-2xl font-light text-stone-900 dark:text-stone-100 mb-6" style={{ fontFamily: 'Crimson Pro, serif' }}>
                  My Upcoming Events
                </h2>

                {upcomingEvents.length === 0 ? (
                  <div className="text-center py-12">
                    <Ticket className="w-16 h-16 text-stone-300 dark:text-stone-700 mx-auto mb-4" strokeWidth={1} />
                    <p className="text-stone-500 dark:text-stone-400 font-light mb-4">No upcoming events</p>
                    <button
                      onClick={() => navigate('/events')}
                      className="px-6 py-3 rounded-full bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900 hover:bg-stone-800 dark:hover:bg-stone-200 transition-colors font-light inline-flex items-center gap-2"
                    >
                      Browse Events
                      <ChevronRight className="w-4 h-4" strokeWidth={1.5} />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {upcomingEvents.map((reservation) => (
                      <div
                        key={reservation.id}
                        className="flex flex-col md:flex-row gap-4 p-4 border border-stone-200 dark:border-stone-800 rounded-xl hover:border-amber-500 dark:hover:border-amber-500 transition-colors"
                      >
                        <div className="flex-1">
                          <h3 className="text-lg font-light text-stone-900 dark:text-stone-100 mb-2" style={{ fontFamily: 'Crimson Pro, serif' }}>
                            {reservation.event?.title}
                          </h3>
                          <div className="space-y-1 text-sm text-stone-600 dark:text-stone-400 font-light">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" strokeWidth={1.5} />
                              {new Date(reservation.event?.date).toLocaleDateString('en-US', { 
                                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
                              })}
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4" strokeWidth={1.5} />
                              {reservation.event?.location}
                            </div>
                            {reservation.ticket_id && (
                              <div className="flex items-center gap-2 font-mono text-xs">
                                <Ticket className="w-4 h-4" strokeWidth={1.5} />
                                {reservation.ticket_id}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => navigate('/my-tickets')}
                            className="px-4 py-2 rounded-lg border border-stone-300 dark:border-stone-700 hover:border-amber-500 dark:hover:border-amber-500 transition-colors text-sm font-light"
                          >
                            View Ticket
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Favorites Tab */}
            {activeTab === 'favorites' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-8"
              >
                <h2 className="text-2xl font-light text-stone-900 dark:text-stone-100 mb-6" style={{ fontFamily: 'Crimson Pro, serif' }}>
                  Favorite Events
                </h2>

                {favorites.length === 0 ? (
                  <div className="text-center py-12">
                    <Heart className="w-16 h-16 text-stone-300 dark:text-stone-700 mx-auto mb-4" strokeWidth={1} />
                    <p className="text-stone-500 dark:text-stone-400 font-light mb-4">No favorites yet</p>
                    <button
                      onClick={() => navigate('/events')}
                      className="px-6 py-3 rounded-full bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900 hover:bg-stone-800 dark:hover:bg-stone-200 transition-colors font-light inline-flex items-center gap-2"
                    >
                      Discover Events
                      <ChevronRight className="w-4 h-4" strokeWidth={1.5} />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {favorites.map((favorite) => (
                      <div
                        key={favorite.id}
                        className="flex flex-col md:flex-row gap-4 p-4 border border-stone-200 dark:border-stone-800 rounded-xl hover:border-amber-500 dark:hover:border-amber-500 transition-colors"
                      >
                        {favorite.event?.image_url && (
                          <img
                            src={favorite.event.image_url}
                            alt={favorite.event.title}
                            className="w-full md:w-32 h-32 object-cover rounded-lg"
                          />
                        )}
                        <div className="flex-1">
                          <h3 className="text-lg font-light text-stone-900 dark:text-stone-100 mb-2" style={{ fontFamily: 'Crimson Pro, serif' }}>
                            {favorite.event?.title}
                          </h3>
                          <div className="space-y-1 text-sm text-stone-600 dark:text-stone-400 font-light">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" strokeWidth={1.5} />
                              {new Date(favorite.event?.date).toLocaleDateString('en-US', { 
                                month: 'short', day: 'numeric', year: 'numeric' 
                              })}
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4" strokeWidth={1.5} />
                              {favorite.event?.location}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => navigate(`/events`)}
                            className="px-4 py-2 rounded-lg bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900 hover:bg-stone-800 dark:hover:bg-stone-200 transition-colors text-sm font-light"
                          >
                            View Details
                          </button>
                          <button
                            onClick={() => removeFavorite(favorite.id)}
                            className="p-2 rounded-lg border border-stone-300 dark:border-stone-700 hover:border-red-500 dark:hover:border-red-500 hover:text-red-500 transition-colors"
                          >
                            <X className="w-4 h-4" strokeWidth={1.5} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                {/* Data Export */}
                <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-8">
                  <h2 className="text-2xl font-light text-stone-900 dark:text-stone-100 mb-6" style={{ fontFamily: 'Crimson Pro, serif' }}>
                    Data & Privacy
                  </h2>

                  <div className="space-y-4">
                    <div className="flex items-start justify-between p-4 bg-stone-50 dark:bg-stone-950 rounded-xl">
                      <div className="flex-1">
                        <h3 className="text-lg font-light text-stone-900 dark:text-stone-100 mb-2">
                          Export Your Data
                        </h3>
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

                    <div className="flex items-start justify-between p-4 bg-stone-50 dark:bg-stone-950 rounded-xl">
                      <div className="flex-1">
                        <h3 className="text-lg font-light text-stone-900 dark:text-stone-100 mb-2">
                          Account Created
                        </h3>
                        <p className="text-sm text-stone-600 dark:text-stone-400 font-light">
                          {new Date(profile?.created_at).toLocaleDateString('en-US', { 
                            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start justify-between p-4 bg-stone-50 dark:bg-stone-950 rounded-xl">
                      <div className="flex-1">
                        <h3 className="text-lg font-light text-stone-900 dark:text-stone-100 mb-2">
                          Last Updated
                        </h3>
                        <p className="text-sm text-stone-600 dark:text-stone-400 font-light">
                          {new Date(profile?.updated_at).toLocaleDateString('en-US', { 
                            month: 'short', day: 'numeric', year: 'numeric' 
                          })} at {new Date(profile?.updated_at).toLocaleTimeString('en-US', { 
                            hour: '2-digit', minute: '2-digit' 
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Danger Zone */}
                <div className="bg-white dark:bg-stone-900 rounded-2xl border-2 border-red-200 dark:border-red-900/50 p-8">
                  <h2 className="text-2xl font-light text-red-600 dark:text-red-400 mb-6" style={{ fontFamily: 'Crimson Pro, serif' }}>
                    Danger Zone
                  </h2>

                  <div className="space-y-4">
                    <div className="flex items-start justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-xl">
                      <div className="flex-1">
                        <h3 className="text-lg font-light text-stone-900 dark:text-stone-100 mb-2">
                          Delete Account
                        </h3>
                        <p className="text-sm text-stone-600 dark:text-stone-400 font-light mb-4">
                          Permanently delete your account and all associated data. This action cannot be undone.
                        </p>
                        {deleteConfirm && (
                          <div className="bg-white dark:bg-stone-900 border border-red-300 dark:border-red-800 rounded-lg p-4 mb-4">
                            <p className="text-sm text-red-700 dark:text-red-300 font-light mb-3">
                              Are you absolutely sure? This will:
                            </p>
                            <ul className="text-sm text-red-600 dark:text-red-400 font-light space-y-1 mb-4 list-disc list-inside">
                              <li>Delete your profile permanently</li>
                              <li>Cancel all upcoming reservations</li>
                              <li>Remove all favorites</li>
                              <li>Erase all your data</li>
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
                            Delete Account
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={handleDeleteAccount}
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
                                  Confirm Delete
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
          </div>
        </div>
      </div>
    </main>
  )
}